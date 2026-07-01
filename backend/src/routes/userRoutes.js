const { Router } = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES, ROLE_VALUES } = require('../utils/constants');

const router = Router();

// Gerenciamento de usuários do sistema é exclusivo do administrador
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.list);

router.get(
  '/:id',
  validate([param('id').isInt().withMessage('id inválido')]),
  userController.getById
);

router.post(
  '/',
  validate([
    body('name').trim().notEmpty().withMessage('O nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter ao menos 6 caracteres'),
    body('role').optional().isIn(ROLE_VALUES).withMessage('Perfil inválido'),
  ]),
  userController.create
);

router.put(
  '/:id',
  validate([
    param('id').isInt().withMessage('id inválido'),
    body('email').optional().isEmail().withMessage('E-mail inválido'),
    body('password').optional().isLength({ min: 6 }).withMessage('A senha deve ter ao menos 6 caracteres'),
    body('role').optional().isIn(ROLE_VALUES).withMessage('Perfil inválido'),
    body('active').optional().isBoolean().withMessage('active deve ser booleano'),
  ]),
  userController.update
);

router.delete(
  '/:id',
  validate([param('id').isInt().withMessage('id inválido')]),
  userController.remove
);

module.exports = router;
