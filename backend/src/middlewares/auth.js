const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { User } = require('../models');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('Token não fornecido. Faça login para acessar.', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw new AppError('Token inválido ou expirado.', 401);
    }

    const user = await User.findByPk(payload.id);
    if (!user || !user.active) {
      throw new AppError('Usuário não encontrado ou inativo.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Não autenticado.', 401));
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para executar esta ação.', 403)
      );
    }
    next();
  };
}

module.exports = { authenticate, authorize };
