const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los usuarios (Solo Admin y SuperAdmin)
router.get('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  userController.getAllUsers
);

// Obtener usuario por ID
router.get('/:id', userController.getUserById);

// Crear usuario (Solo Admin y SuperAdmin)
router.post('/', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  userController.createUser
);

// Actualizar usuario (Solo Admin y SuperAdmin)
router.put('/:id', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  userController.updateUser
);

// Eliminar usuario (Solo SuperAdmin)
router.delete('/:id', 
  authorizeRoles(ROLES.SUPER_ADMIN),
  userController.deleteUser
);

// Obtener residentes activos
router.get('/residents/active', 
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  userController.getActiveResidents
);

// Obtener administradores
router.get('/administrators/list', 
  authorizeRoles(ROLES.SUPER_ADMIN),
  userController.getAdministrators
);

module.exports = router;