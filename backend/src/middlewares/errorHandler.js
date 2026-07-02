const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const AppError = require('../utils/AppError');
const env = require('../config/env');

// Rota não encontrada
function notFound(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Tratamento central de erros
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    const details = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({
      status: 'error',
      message: 'Dados de entrada inválidos.',
      details,
    });
  }

  if (err instanceof DatabaseError && !(err instanceof AppError)) {
    return res.status(400).json({
      status: 'error',
      message: 'Erro ao processar a requisição no banco de dados.',
    });
  }

  const statusCode = err.statusCode || 500;
  const payload = {
    status: 'error',
    message: statusCode === 500 ? 'Erro interno do servidor.' : err.message,
  };

  if (err.details) payload.details = err.details;
  if (env.nodeEnv === 'development' && statusCode === 500) {
    payload.stack = err.stack;
  }

  if (statusCode === 500) {
    console.error('[erro]', err);
  }

  return res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
