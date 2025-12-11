const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

/* ============================================================
   🛰️ MIDDLEWARE GLOBAL PARA LOGS DE CADA PETICIÓN DEL ROUTER
   ============================================================ */
router.use((req, res, next) => {
  console.log("\n──────────────────────────────────────────");
  console.log(`📌 NUEVA PETICIÓN A /activities`);
  console.log(`➡ Método: ${req.method}`);
  console.log(`➡ Ruta completa: ${req.originalUrl}`);
  console.log(`➡ Path interpretado por este router: ${req.path}`);
  console.log(`➡ Query params:`, req.query);
  console.log(`➡ Params:`, req.params);
  console.log("──────────────────────────────────────────");
  next();
});

// Todas requieren autenticación
router.use(authenticateToken);

/* ============================================================
   🔵 RUTAS ESPECÍFICAS (SE EVALUAN PRIMERO)
   ============================================================ */

// Obtener actividades próximas
router.get('/upcoming/list', (req, res, next) => {
  console.log("✔ Ruta coincidió:  GET /upcoming/list");
  next();
}, activityController.getUpcomingActivities);

// Registrar asistencia
router.post('/:id/register', (req, res, next) => {
  console.log("✔ Ruta coincidió:  POST /:id/register");
  next();
}, activityController.registerAttendance);

// Obtener actividad por ID
router.get('/:id', (req, res, next) => {
  console.log("✔ Ruta coincidió:  GET /:id");
  next();
}, activityController.getActivityById);

/* ============================================================
   🟢 RUTAS GENERALES (SE EVALUAN DESPUÉS)
   ============================================================ */

// Obtener todas las actividades (con filtros)
router.get('/', (req, res, next) => {
  console.log("✔ Ruta coincidió:  GET /  (listado general con filtros)");
  console.log("📥 Query recibido:", req.query);
  next();
}, activityController.getAllActivities);

// Crear actividad
router.post('/',
  (req, res, next) => {
    console.log("✔ Ruta coincidió:  POST /");
    next();
  },
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  activityController.createActivity
);

// Actualizar actividad
router.put('/:id',
  (req, res, next) => {
    console.log("✔ Ruta coincidió:  PUT /:id");
    next();
  },
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  activityController.updateActivity
);

// Cancelar actividad
router.post('/:id/cancel',
  (req, res, next) => {
    console.log("✔ Ruta coincidió:  POST /:id/cancel");
    next();
  },
  authorizeRoles(ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN),
  activityController.cancelActivity
);

// Eliminar actividad
router.delete('/:id',
  (req, res, next) => {
    console.log("✔ Ruta coincidió:  DELETE /:id");
    next();
  },
  authorizeRoles(ROLES.SUPER_ADMIN),
  activityController.deleteActivity
);

module.exports = router;