const AppError = require('../utils/AppError');

function notFound(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  const payload = {
    status: 'error',
    message: statusCode === 500 ? 'Erro interno do servidor.' : err.message,
  };

  if (err.details) payload.details = err.details;

  if (statusCode === 500) {
    console.error('[erro]', err);
  }

  return res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
