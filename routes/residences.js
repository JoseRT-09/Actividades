const express = require('express');
const router = express.Router();
const residenceController = require('../controllers/residenceController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las residencias
router.get('/', residenceController.getAllResidences);

// Obtener residencia por ID
router.get('/:id', residenceController.getResidenceById);

// Crear residencia (Solo Admin y SuperAdmin)
router.post('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  residenceController.createResidence
);

// Actualizar residencia (Solo Admin y SuperAdmin)
router.put('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  residenceController.updateResidence
);

// Asignar/Reasignar residente (Solo Admin y SuperAdmin)
router.post('/:id/assign', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  residenceController.assignResident
);

// Obtener historial de reasignaciones
router.get('/:id/history', residenceController.getReassignmentHistory);

// Eliminar residencia (Solo SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.SUPER_ADMIN),
  residenceController.deleteResidence
);

module.exports = router;