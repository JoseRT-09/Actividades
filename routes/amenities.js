const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenityController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ===== AMENIDADES =====

// Obtener todas las amenidades
router.get('/', amenityController.getAllAmenities);

// Obtener amenidad por ID
router.get('/:id', amenityController.getAmenityById);

// Crear amenidad (Solo Admin y SuperAdmin)
router.post('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  amenityController.createAmenity
);

// Actualizar amenidad (Solo Admin y SuperAdmin)
router.put('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  amenityController.updateAmenity
);

// Actualizar disponibilidad/estado de amenidad (Solo Admin y SuperAdmin)
router.post('/:id/availability', // AGREGADA
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  amenityController.updateAmenityAvailability
);

// Eliminar amenidad (Solo SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.SUPER_ADMIN),
  amenityController.deleteAmenity
);

// ===== RESERVAS DE AMENIDADES =====

// Obtener todas las reservas
router.get('/reservations/all', amenityController.getAllReservations);

// Crear reserva
router.post('/reservations', amenityController.createReservation);

// Actualizar estado de reserva (Solo Admin y SuperAdmin)
router.put('/reservations/:id/status', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  amenityController.updateReservationStatus
);

// Cancelar reserva
router.post('/reservations/:id/cancel', amenityController.cancelReservation);

// Obtener horarios disponibles
router.get('/reservations/available-slots', amenityController.getAvailableSlots);

module.exports = router;