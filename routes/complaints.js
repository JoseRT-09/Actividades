const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const complaintCommentController = require('../controllers/complaintCommentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las quejas
router.get('/', complaintController.getAllComplaints);

// Obtener queja por ID
router.get('/:id', complaintController.getComplaintById);

// Crear queja
router.post('/', complaintController.createComplaint);

// Actualizar queja (Solo Admin y SuperAdmin)
router.put('/:id',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  complaintController.updateComplaint
);

// Cambiar estado de queja (Solo Admin y SuperAdmin)
router.patch('/:id/status',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  complaintController.updateComplaintStatus
);

// Obtener quejas por usuario
router.get('/user/:user_id', complaintController.getComplaintsByUser);

// Obtener estadísticas de quejas (Solo Admin y SuperAdmin)
router.get('/statistics/summary',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  complaintController.getComplaintsStatistics
);

// Eliminar queja (Solo Admin y SuperAdmin)
router.delete('/:id',
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  complaintController.deleteComplaint
);

// ===== RUTAS DE COMENTARIOS =====

// Obtener comentarios de una queja
router.get('/:complaintId/comments', complaintCommentController.getCommentsByComplaint);

// Crear comentario en una queja
router.post('/:complaintId/comments', complaintCommentController.createComment);

// Eliminar comentario
router.delete('/comments/:commentId', complaintCommentController.deleteComment);

module.exports = router;