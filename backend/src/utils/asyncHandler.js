// Envolve handlers async e encaminha erros ao middleware central (evita try/catch repetido)
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
