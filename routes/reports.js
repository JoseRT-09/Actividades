const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los reportes
router.get('/', reportController.getAllReports);

// Obtener reporte por ID
router.get('/:id', reportController.getReportById);

// Crear reporte
router.post('/', reportController.createReport);

// Actualizar reporte (Solo Admin y SuperAdmin)
router.put('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  reportController.updateReport
);

// Asignar reporte a administrador (Solo Admin y SuperAdmin)
router.post('/:id/assign', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  reportController.assignReport
);

// Obtener reportes por usuario
router.get('/user/:user_id', reportController.getReportsByUser);

// Obtener estadísticas de reportes (Solo Admin y SuperAdmin)
router.get('/statistics/summary', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  reportController.getReportsStatistics
);

// Eliminar reporte (Solo Admin y SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  reportController.deleteReport
);

module.exports = router;