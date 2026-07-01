const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Executa um conjunto de validações do express-validator e agrega os erros
function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));

    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return next(new AppError('Dados de entrada inválidos.', 422, details));
  };
}

module.exports = validate;
