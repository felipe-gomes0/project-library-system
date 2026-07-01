const { Op } = require('sequelize');
const { Book } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPage } = require('../utils/pagination');
const { BOOK_STATUS, ROLES } = require('../utils/constants');

// GET /api/books
// Filtros: title, author, category, isbn, available, q (busca geral), status
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { title, author, category, isbn, available, status, q } = req.query;

  const where = {};

  if (title) where.title = { [Op.iLike]: `%${title}%` };
  if (author) where.author = { [Op.iLike]: `%${author}%` };
  if (category) where.category = { [Op.iLike]: `%${category}%` };
  if (isbn) where.isbn = { [Op.iLike]: `%${isbn}%` };
  if (status) where.status = status;

  // Disponibilidade: ?available=true filtra livros com quantidade > 0
  if (available === 'true') where.availableQuantity = { [Op.gt]: 0 };
  if (available === 'false') where.availableQuantity = { [Op.lte]: 0 };

  // Busca geral por título OU autor OU categoria
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { author: { [Op.iLike]: `%${q}%` } },
      { category: { [Op.iLike]: `%${q}%` } },
      { isbn: { [Op.iLike]: `%${q}%` } },
    ];
  }

  // Leitor visualiza apenas livros disponíveis
  if (req.user && req.user.role === ROLES.READER) {
    where.availableQuantity = { [Op.gt]: 0 };
  }

  const { count, rows } = await Book.findAndCountAll({
    where,
    limit,
    offset,
    order: [['title', 'ASC']],
  });

  res.json({ status: 'success', ...buildPage({ count, rows, page, limit }) });
});

// GET /api/books/:id
exports.getById = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw new AppError('Livro não encontrado.', 404);
  res.json({ status: 'success', data: book });
});

// POST /api/books
exports.create = asyncHandler(async (req, res) => {
  const {
    title, author, publisher, publicationYear, category, isbn,
    totalQuantity, availableQuantity, coverUrl,
  } = req.body;

  const total = totalQuantity != null ? Number(totalQuantity) : 1;
  const available = availableQuantity != null ? Number(availableQuantity) : total;

  if (available > total) {
    throw new AppError('A quantidade disponível não pode ser maior que a total.', 422);
  }

  const book = await Book.create({
    title,
    author,
    publisher,
    publicationYear,
    category,
    isbn,
    totalQuantity: total,
    availableQuantity: available,
    status: available > 0 ? BOOK_STATUS.AVAILABLE : BOOK_STATUS.UNAVAILABLE,
    coverUrl,
  });

  res.status(201).json({ status: 'success', message: 'Livro cadastrado com sucesso.', data: book });
});

// PUT /api/books/:id
exports.update = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw new AppError('Livro não encontrado.', 404);

  const fields = [
    'title', 'author', 'publisher', 'publicationYear',
    'category', 'isbn', 'totalQuantity', 'availableQuantity', 'coverUrl',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) book[f] = req.body[f];
  });

  if (book.availableQuantity > book.totalQuantity) {
    throw new AppError('A quantidade disponível não pode ser maior que a total.', 422);
  }

  book.refreshStatus();
  await book.save();

  res.json({ status: 'success', message: 'Livro atualizado com sucesso.', data: book });
});

// DELETE /api/books/:id
exports.remove = asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) throw new AppError('Livro não encontrado.', 404);

  // Impede exclusão se houver exemplares emprestados
  if (book.availableQuantity < book.totalQuantity) {
    throw new AppError(
      'Não é possível excluir um livro com exemplares emprestados.',
      409
    );
  }

  await book.destroy();
  res.json({ status: 'success', message: 'Livro excluído com sucesso.' });
});

// GET /api/books/categories  (lista de categorias distintas - útil para filtros)
exports.categories = asyncHandler(async (req, res) => {
  const rows = await Book.findAll({
    attributes: [[Book.sequelize.fn('DISTINCT', Book.sequelize.col('category')), 'category']],
    where: { category: { [Op.ne]: null } },
    order: [['category', 'ASC']],
    raw: true,
  });
  res.json({ status: 'success', data: rows.map((r) => r.category).filter(Boolean) });
});
