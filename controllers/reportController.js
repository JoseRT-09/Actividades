const { Report, Residence, User } = require('../models');
const { ESTADOS_REPORTE, PRIORIDADES_REPORTE } = require('../config/constants');
const { Op, fn, col } = require('sequelize'); // Importar fn y col de Sequelize

// Obtener todos los reportes
exports.getAllReports = async (req, res) => {
  try {
    const { tipo, estado, prioridad, residencia_id, page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (tipo) where.tipo = tipo;

    // Manejar múltiples estados con IN
    if (estado) {
      const estados = estado.split(',').map(e => e.trim());
      where.estado = { [Op.in]: estados };
    }

    if (prioridad) where.prioridad = prioridad;
    if (residencia_id) where.residencia_id = residencia_id;

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Si es residente, solo puede ver sus propios reportes
    if (req.user.rol === 'Residente') {
      where.reportado_por_id = req.user.id;
    }
    
    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: Residence, as: 'residencia', attributes: ['id', 'numero_unidad', 'bloque', 'tipo_propiedad'] }, // ✅ CORRECCIÓN DE COLUMNA
        { model: User, as: 'reportadoPor', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: User, as: 'asignadoA', attributes: ['id', 'nombre', 'apellido', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
  }
};

// Obtener reporte por ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [
        { 
          model: Residence, 
          as: 'residencia', 
          // ✅ CORRECCIÓN DE COLUMNA: Usar tipo_propiedad
          attributes: ['id', 'numero_unidad', 'bloque', 'piso', 'tipo_propiedad'], 
          include: [
            { model: User, as: 'residenteActual', attributes: ['id', 'nombre', 'apellido', 'telefono'] }
          ]
        },
        { model: User, as: 'reportadoPor', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] },
        { model: User, as: 'asignadoA', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ message: 'Error al obtener reporte', error: error.message });
  }
};

// Crear reporte
exports.createReport = async (req, res) => {
  try {
    const { titulo, descripcion, tipo, prioridad, residencia_id } = req.body;

    const report = await Report.create({
      titulo,
      descripcion,
      tipo,
      prioridad,
      residencia_id,
      reportado_por_id: req.user.id,
      estado: ESTADOS_REPORTE.ABIERTO
    });

    const reportWithDetails = await Report.findByPk(report.id, {
      include: [
        { model: Residence, as: 'residencia', attributes: ['id', 'numero_unidad', 'bloque'] },
        { model: User, as: 'reportadoPor', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    res.status(201).json({
      message: 'Reporte registrado exitosamente',
      report: reportWithDetails
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ message: 'Error al crear reporte', error: error.message });
  }
};

// Actualizar reporte
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Lógica de permisos (solo el creador o un admin puede editar)
    const isOwner = report.reportado_por_id === req.user.id;
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para editar este reporte' });
    }

    await report.update(updateData);

    const updatedReport = await Report.findByPk(id, {
      include: [
        { model: Residence, as: 'residencia', attributes: ['id', 'numero_unidad', 'bloque'] },
        { model: User, as: 'reportadoPor', attributes: ['id', 'nombre', 'apellido'] },
        { model: User, as: 'asignadoA', attributes: ['id', 'nombre', 'apellido'] }
      ]
    });

    res.json({
      message: 'Reporte actualizado exitosamente',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ message: 'Error al actualizar reporte', error: error.message });
  }
};

// Asignar reporte a administrador
exports.assignReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { asignado_a } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    await report.update({
      asignado_a,
      estado: ESTADOS_REPORTE.EN_PROGRESO // Cambiar estado al asignar
    });

    const updatedReport = await Report.findByPk(id, {
      include: [
        { model: Residence, as: 'residencia', attributes: ['id', 'numero_unidad', 'bloque'] },
        { model: User, as: 'asignadoA', attributes: ['id', 'nombre', 'apellido', 'email'] }
      ]
    });

    res.json({
      message: 'Reporte asignado exitosamente',
      report: updatedReport
    });
  } catch (error) {
    console.error('Error al asignar reporte:', error);
    res.status(500).json({ message: 'Error al asignar reporte', error: error.message });
  }
};

// Obtener reportes por usuario
exports.getReportsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const reports = await Report.findAll({
      where: { reportado_por_id: user_id },
      include: [
        { model: Residence, as: 'residencia', attributes: ['id', 'numero_unidad', 'bloque'] },
        { model: User, as: 'asignadoA', attributes: ['id', 'nombre', 'apellido'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ reports, count: reports.length });
  } catch (error) {
    console.error('Error al obtener reportes del usuario:', error);
    res.status(500).json({ message: 'Error al obtener reportes del usuario', error: error.message });
  }
};

// Obtener estadísticas de reportes
exports.getReportsStatistics = async (req, res) => {
  try {
    const totalReports = await Report.count();
    const openReports = await Report.count({ where: { estado: ESTADOS_REPORTE.ABIERTO } });
    const inProgressReports = await Report.count({ where: { estado: ESTADOS_REPORTE.EN_PROGRESO } });
    const resolvedReports = await Report.count({ where: { estado: ESTADOS_REPORTE.RESUELTO } });

    const criticalReports = await Report.count({ where: { prioridad: PRIORIDADES_REPORTE.CRITICA } });
    const highPriorityReports = await Report.count({ where: { prioridad: PRIORIDADES_REPORTE.ALTA } });

    const reportsByType = await Report.findAll({
      attributes: [
        'tipo',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['tipo'],
      raw: true
    });

    res.json({
      total: totalReports,
      byStatus: {
        abierto: openReports,
        enProgreso: inProgressReports,
        resuelto: resolvedReports
      },
      byPriority: {
        critica: criticalReports,
        alta: highPriorityReports
      },
      byType: reportsByType
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de reportes:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de reportes', error: error.message });
  }
};

// Eliminar reporte
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    await report.destroy();
    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ message: 'Error al eliminar reporte', error: error.message });
  }
};