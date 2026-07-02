const { Router } = require('express');
const { body, param } = require('express-validator');
const bookController = require('../controllers/bookController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = Router();

router.use(authenticate);

router.get('/', bookController.list);
router.get('/categories', bookController.categories);
router.get(
  '/:id',
  validate([param('id').isInt().withMessage('id inválido')]),
  bookController.getById
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([
    body('title').trim().notEmpty().withMessage('O título é obrigatório'),
    body('author').trim().notEmpty().withMessage('O autor é obrigatório'),
    body('isbn').trim().notEmpty().withMessage('O ISBN é obrigatório'),
    body('totalQuantity').optional().isInt({ min: 0 }).withMessage('Quantidade total inválida'),
    body('availableQuantity').optional().isInt({ min: 0 }).withMessage('Quantidade disponível inválida'),
    body('publicationYear').optional().isInt().withMessage('Ano de publicação inválido'),
  ]),
  bookController.create
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.LIBRARIAN),
  validate([
    param('id').isInt().withMessage('id inválido'),
    body('totalQuantity').optional().isInt({ min: 0 }).withMessage('Quantidade total inválida'),
    body('availableQuantity').optional().isInt({ min: 0 }).withMessage('Quantidade disponível inválida'),
    body('publicationYear').optional().isInt().withMessage('Ano de publicação inválido'),
  ]),
  bookController.update
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate([param('id').isInt().withMessage('id inválido')]),
  bookController.remove
);

module.exports = router;
