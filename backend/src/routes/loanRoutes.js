const { Router } = require('express');
const { body, param } = require('express-validator');
const loanController = require('../controllers/loanController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(authenticate);

// Listagem: todos os perfis (leitor vê apenas os próprios)
router.get('/', loanController.list);

// Atrasados: admin e bibliotecário
router.get('/overdue', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), loanController.overdue);

router.get(
  '/:id',
  validate([param('id').isInt().withMessage('id inválido')]),
  loanController.getById
);

// Registrar empréstimo: admin e bibliotecário
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([
    body('readerId').isInt().withMessage('readerId é obrigatório'),
    body().custom((value) => {
      const hasItems = Array.isArray(value.items) && value.items.length > 0;
      const hasBookIds = Array.isArray(value.bookIds) && value.bookIds.length > 0;
      if (!hasItems && !hasBookIds) {
        throw new Error('Informe items[] ou bookIds[] com ao menos um livro');
      }
      return true;
    }),
    body('dueDate').optional().isISO8601().withMessage('dueDate deve ser uma data válida (YYYY-MM-DD)'),
    body('loanDate').optional().isISO8601().withMessage('loanDate deve ser uma data válida (YYYY-MM-DD)'),
  ]),
  loanController.create
);

// Registrar devolução: admin e bibliotecário
router.patch(
  '/:id/return',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([param('id').isInt().withMessage('id inválido')]),
  loanController.returnLoan
);

// Excluir empréstimo devolvido: somente admin
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate([param('id').isInt().withMessage('id inválido')]),
  loanController.remove
);

module.exports = router;
