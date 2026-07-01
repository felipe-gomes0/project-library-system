const { Router } = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../utils/constants');

const router = Router();

// Relatórios: admin e bibliotecário
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN));

router.get('/summary', reportController.summary);
router.get('/popular-books', reportController.popularBooks);

module.exports = router;
