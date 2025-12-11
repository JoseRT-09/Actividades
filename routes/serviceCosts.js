const express = require('express');
const router = express.Router();
const serviceCostController = require('../controllers/serviceCostController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los costos de servicio
router.get('/', serviceCostController.getAllServiceCosts);

// Obtener costo por ID
router.get('/:id', serviceCostController.getServiceCostById);

// Crear costo de servicio (Solo Admin y SuperAdmin)
router.post('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  serviceCostController.createServiceCost
);

// Actualizar costo de servicio (Solo Admin y SuperAdmin)
router.put('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  serviceCostController.updateServiceCost
);

// Actualizar costos vencidos (Solo Admin y SuperAdmin)
router.post('/update-overdue', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  serviceCostController.updateOverdueCosts
);

// Obtener costos pendientes por residencia
router.get('/residence/:residencia_id/pending', 
  serviceCostController.getPendingCostsByResidence
);

// Eliminar costo de servicio (Solo SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.SUPER_ADMIN),
  serviceCostController.deleteServiceCost
);

module.exports = router;