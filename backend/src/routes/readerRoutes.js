const { Router } = require('express');
const { body, param } = require('express-validator');
const readerController = require('../controllers/readerController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES, READER_STATUS } = require('../utils/constants');

const router = Router();

router.use(authenticate);

// Consulta de leitores: admin e bibliotecário
router.get('/', authorize(ROLES.ADMIN, ROLES.LIBRARIAN), readerController.list);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([param('id').isInt().withMessage('id inválido')]),
  readerController.getById
);

router.get(
  '/:id/loans',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([param('id').isInt().withMessage('id inválido')]),
  readerController.loanHistory
);

// Cadastro/edição: admin e bibliotecário
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([
    body('name').trim().notEmpty().withMessage('O nome é obrigatório'),
    body('document').trim().notEmpty().withMessage('O CPF/RA é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('status').optional().isIn(Object.values(READER_STATUS)).withMessage('Status inválido'),
  ]),
  readerController.create
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([
    param('id').isInt().withMessage('id inválido'),
    body('email').optional().isEmail().withMessage('E-mail inválido'),
    body('status').optional().isIn(Object.values(READER_STATUS)).withMessage('Status inválido'),
  ]),
  readerController.update
);

router.patch(
  '/:id/inactivate',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  readerController.inactivate
);

router.patch(
  '/:id/activate',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  readerController.activate
);

// Exclusão definitiva: somente admin
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate([param('id').isInt().withMessage('id inválido')]),
  readerController.remove
);

module.exports = router;
