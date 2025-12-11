const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los pagos (Solo Admin y SuperAdmin)
router.get('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  paymentController.getAllPayments
);

// Obtener pago por ID
router.get('/:id', paymentController.getPaymentById);

// Registrar pago
router.post('/', paymentController.createPayment);

// Obtener pagos por residente
router.get('/resident/:residente_id', paymentController.getPaymentsByResident);

// Obtener resumen de pagos (Solo Admin y SuperAdmin)
router.get('/summary/monthly', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  paymentController.getPaymentsSummary
);

// Eliminar pago (Solo Admin y SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  paymentController.deletePayment
);

module.exports = router;