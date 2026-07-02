const { User } = require('../models');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES, ROLE_VALUES } = require('../utils/constants');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const finalRole = ROLE_VALUES.includes(role) ? role : ROLES.READER;

  const user = await User.create({ name, email, password, role: finalRole });

  res.status(201).json({
    status: 'success',
    message: 'Usuário criado com sucesso.',
    data: user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.checkPassword(password))) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }
  if (!user.active) {
    throw new AppError('Usuário inativo. Contate o administrador.', 403);
  }

  const token = signToken({ id: user.id, role: user.role });

  res.json({
    status: 'success',
    message: 'Login realizado com sucesso.',
    data: {
      token,
      user,
    },
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: req.user });
});
