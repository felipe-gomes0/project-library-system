const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES, ROLE_VALUES } = require('../utils/constants');

const router = Router();

router.post(
  '/register',
  authenticate,
  authorize(ROLES.ADMIN),
  validate([
    body('name').trim().notEmpty().withMessage('O nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('A senha deve ter ao menos 6 caracteres'),
    body('role').optional().isIn(ROLE_VALUES).withMessage('Perfil inválido'),
  ]),
  authController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('A senha é obrigatória'),
  ]),
  authController.login
);

router.get('/me', authenticate, authController.me);

module.exports = router;
