const { Op } = require('sequelize');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPage } = require('../utils/pagination');
const { ROLES, ROLE_VALUES } = require('../utils/constants');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { role, q } = req.query;

  const where = {};
  if (role) where.role = role;
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  res.json({ status: 'success', ...buildPage({ count, rows, page, limit }) });
});

exports.getById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('Usuário não encontrado.', 404);
  res.json({ status: 'success', data: user });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const finalRole = ROLE_VALUES.includes(role) ? role : ROLES.READER;
  const user = await User.create({ name, email, password, role: finalRole });
  res.status(201).json({ status: 'success', message: 'Usuário criado com sucesso.', data: user });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  const { name, email, password, role, active } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password) user.password = password;
  if (role !== undefined && ROLE_VALUES.includes(role)) user.role = role;
  if (active !== undefined) user.active = active;

  await user.save();
  res.json({ status: 'success', message: 'Usuário atualizado com sucesso.', data: user });
});

exports.remove = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new AppError('Usuário não encontrado.', 404);

  if (user.id === req.user.id) {
    throw new AppError('Você não pode excluir o próprio usuário.', 409);
  }

  if (user.role === ROLES.ADMIN) {
    const admins = await User.count({ where: { role: ROLES.ADMIN } });
    if (admins <= 1) {
      throw new AppError('Não é possível excluir o único administrador do sistema.', 409);
    }
  }

  await user.destroy();
  res.json({ status: 'success', message: 'Usuário excluído com sucesso.' });
});
