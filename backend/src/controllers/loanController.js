const { Op } = require('sequelize');
const { sequelize, Loan, Book, Reader, LoanItem } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPage } = require('../utils/pagination');
const { LOAN_STATUS, READER_STATUS, ROLES } = require('../utils/constants');

const DEFAULT_LOAN_DAYS = 14;

// Inclui leitor e livros na resposta
const loanInclude = [
  { model: Reader, as: 'reader' },
  { model: Book, as: 'books', through: { attributes: ['quantity'] } },
];

// Atualiza para "late" os empréstimos em aberto cuja data prevista já passou
async function refreshOverdueLoans() {
  const today = new Date().toISOString().slice(0, 10);
  await Loan.update(
    { status: LOAN_STATUS.LATE },
    {
      where: {
        status: LOAN_STATUS.OPEN,
        dueDate: { [Op.lt]: today },
      },
    }
  );
}

// Localiza o perfil de leitor vinculado ao usuário logado (role=reader)
async function getOwnReaderId(user) {
  const reader = await Reader.findOne({ where: { user_id: user.id } });
  return reader ? reader.id : null;
}

// GET /api/loans
// Filtros: status, readerId, from, to (intervalo sobre loanDate)
exports.list = asyncHandler(async (req, res) => {
  await refreshOverdueLoans();

  const { page, limit, offset } = getPagination(req.query);
  const { status, readerId, from, to } = req.query;

  const where = {};
  if (status) where.status = status;
  if (readerId) where.reader_id = readerId;
  if (from || to) {
    where.loanDate = {};
    if (from) where.loanDate[Op.gte] = from;
    if (to) where.loanDate[Op.lte] = to;
  }

  // Leitor só enxerga os próprios empréstimos
  if (req.user.role === ROLES.READER) {
    const ownReaderId = await getOwnReaderId(req.user);
    if (!ownReaderId) {
      return res.json({ status: 'success', ...buildPage({ count: 0, rows: [], page, limit }) });
    }
    where.reader_id = ownReaderId;
  }

  const { count, rows } = await Loan.findAndCountAll({
    where,
    include: loanInclude,
    limit,
    offset,
    order: [['loanDate', 'DESC']],
    distinct: true,
  });

  res.json({ status: 'success', ...buildPage({ count, rows, page, limit }) });
});

// GET /api/loans/:id
exports.getById = asyncHandler(async (req, res) => {
  await refreshOverdueLoans();

  const loan = await Loan.findByPk(req.params.id, { include: loanInclude });
  if (!loan) throw new AppError('Empréstimo não encontrado.', 404);

  if (req.user.role === ROLES.READER) {
    const ownReaderId = await getOwnReaderId(req.user);
    if (loan.reader_id !== ownReaderId) {
      throw new AppError('Você só pode visualizar seus próprios empréstimos.', 403);
    }
  }

  res.json({ status: 'success', data: loan });
});

// POST /api/loans
// body: { readerId, items: [{ bookId, quantity }] }  ou  { readerId, bookIds: [..] }
exports.create = asyncHandler(async (req, res) => {
  const { readerId, loanDate, dueDate } = req.body;

  // Normaliza os itens (aceita bookIds simples ou items com quantidade)
  let items = [];
  if (Array.isArray(req.body.items) && req.body.items.length) {
    items = req.body.items.map((i) => ({ bookId: i.bookId, quantity: Number(i.quantity) || 1 }));
  } else if (Array.isArray(req.body.bookIds) && req.body.bookIds.length) {
    items = req.body.bookIds.map((id) => ({ bookId: id, quantity: 1 }));
  }

  if (!items.length) {
    throw new AppError('Informe ao menos um livro para o empréstimo.', 422);
  }

  // Regra: leitor precisa existir e estar ativo
  const reader = await Reader.findByPk(readerId);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);
  if (reader.status !== READER_STATUS.ACTIVE) {
    throw new AppError('Leitor inativo não pode realizar empréstimos.', 409);
  }

  const start = loanDate || new Date().toISOString().slice(0, 10);
  let due = dueDate;
  if (!due) {
    const d = new Date(start);
    d.setDate(d.getDate() + DEFAULT_LOAN_DAYS);
    due = d.toISOString().slice(0, 10);
  }
  if (new Date(due) < new Date(start)) {
    throw new AppError('A data prevista de devolução deve ser posterior à data do empréstimo.', 422);
  }

  // Tudo dentro de uma transação para garantir consistência do estoque
  const loan = await sequelize.transaction(async (t) => {
    const created = await Loan.create(
      { reader_id: reader.id, loanDate: start, dueDate: due, status: LOAN_STATUS.OPEN },
      { transaction: t }
    );

    for (const item of items) {
      const book = await Book.findByPk(item.bookId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!book) throw new AppError(`Livro id=${item.bookId} não encontrado.`, 404);
      if (book.availableQuantity < item.quantity) {
        throw new AppError(
          `Livro "${book.title}" sem quantidade disponível suficiente (disponível: ${book.availableQuantity}).`,
          409
        );
      }

      await LoanItem.create(
        { loan_id: created.id, book_id: book.id, quantity: item.quantity },
        { transaction: t }
      );

      // Regra: ao emprestar, a quantidade disponível diminui
      book.availableQuantity -= item.quantity;
      book.refreshStatus();
      await book.save({ transaction: t });
    }

    return created;
  });

  const full = await Loan.findByPk(loan.id, { include: loanInclude });
  res.status(201).json({ status: 'success', message: 'Empréstimo registrado com sucesso.', data: full });
});

// PATCH /api/loans/:id/return  (registrar devolução)
exports.returnLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findByPk(req.params.id, {
    include: [{ model: LoanItem, as: 'items' }],
  });
  if (!loan) throw new AppError('Empréstimo não encontrado.', 404);
  if (loan.status === LOAN_STATUS.RETURNED) {
    throw new AppError('Este empréstimo já foi devolvido.', 409);
  }

  await sequelize.transaction(async (t) => {
    for (const item of loan.items) {
      const book = await Book.findByPk(item.book_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (book) {
        // Regra: ao devolver, a quantidade disponível aumenta
        book.availableQuantity = Math.min(book.totalQuantity, book.availableQuantity + item.quantity);
        book.refreshStatus();
        await book.save({ transaction: t });
      }
    }

    loan.returnDate = new Date().toISOString().slice(0, 10);
    loan.status = LOAN_STATUS.RETURNED;
    await loan.save({ transaction: t });
  });

  const full = await Loan.findByPk(loan.id, { include: loanInclude });
  res.json({ status: 'success', message: 'Devolução registrada com sucesso.', data: full });
});

// GET /api/loans/overdue  (empréstimos atrasados)
exports.overdue = asyncHandler(async (req, res) => {
  await refreshOverdueLoans();
  const loans = await Loan.findAll({
    where: { status: LOAN_STATUS.LATE },
    include: loanInclude,
    order: [['dueDate', 'ASC']],
  });
  res.json({ status: 'success', data: loans });
});

// DELETE /api/loans/:id  (somente admin; apenas empréstimos já devolvidos)
exports.remove = asyncHandler(async (req, res) => {
  const loan = await Loan.findByPk(req.params.id);
  if (!loan) throw new AppError('Empréstimo não encontrado.', 404);
  if (loan.status !== LOAN_STATUS.RETURNED) {
    throw new AppError('Só é possível excluir empréstimos já devolvidos.', 409);
  }
  await loan.destroy();
  res.json({ status: 'success', message: 'Empréstimo excluído com sucesso.' });
});
