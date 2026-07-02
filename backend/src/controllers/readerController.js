const { Op } = require('sequelize');
const { Reader, Loan, Book } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPage } = require('../utils/pagination');
const { READER_STATUS } = require('../utils/constants');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { name, document, status, q } = req.query;

  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (document) where.document = { [Op.iLike]: `%${document}%` };
  if (status) where.status = status;
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { document: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { count, rows } = await Reader.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  res.json({ status: 'success', ...buildPage({ count, rows, page, limit }) });
});

exports.getById = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);
  res.json({ status: 'success', data: reader });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, document, email, phone, address, status, userId } = req.body;
  const reader = await Reader.create({
    name,
    document,
    email,
    phone,
    address,
    status: status || READER_STATUS.ACTIVE,
    user_id: userId || null,
  });
  res.status(201).json({ status: 'success', message: 'Leitor cadastrado com sucesso.', data: reader });
});

exports.update = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);

  ['name', 'document', 'email', 'phone', 'address', 'status'].forEach((f) => {
    if (req.body[f] !== undefined) reader[f] = req.body[f];
  });
  if (req.body.userId !== undefined) reader.user_id = req.body.userId;

  await reader.save();
  res.json({ status: 'success', message: 'Leitor atualizado com sucesso.', data: reader });
});

exports.inactivate = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);
  reader.status = READER_STATUS.INACTIVE;
  await reader.save();
  res.json({ status: 'success', message: 'Leitor inativado.', data: reader });
});

exports.activate = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);
  reader.status = READER_STATUS.ACTIVE;
  await reader.save();
  res.json({ status: 'success', message: 'Leitor ativado.', data: reader });
});

exports.remove = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);

  const openLoans = await Loan.count({
    where: { reader_id: reader.id, status: { [Op.ne]: 'returned' } },
  });
  if (openLoans > 0) {
    throw new AppError('Não é possível excluir um leitor com empréstimos em aberto.', 409);
  }

  await reader.destroy();
  res.json({ status: 'success', message: 'Leitor excluído com sucesso.' });
});

exports.loanHistory = asyncHandler(async (req, res) => {
  const reader = await Reader.findByPk(req.params.id);
  if (!reader) throw new AppError('Leitor não encontrado.', 404);

  const loans = await Loan.findAll({
    where: { reader_id: reader.id },
    include: [{ model: Book, as: 'books', through: { attributes: ['quantity'] } }],
    order: [['loanDate', 'DESC']],
  });

  res.json({ status: 'success', data: loans });
});
