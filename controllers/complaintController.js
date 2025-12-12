const { Complaint, User, Residence } = require('../models');
const { ESTADOS_QUEJA, PRIORIDADES_QUEJA, CATEGORIAS_QUEJA } = require('../config/constants');
const { Op } = require('sequelize');

// Obtener todas las quejas
exports.getAllComplaints = async (req, res) => {
  try {
    const { 
      estado, 
      categoria, 
      prioridad, 
      search,
      fecha_inicio,
      fecha_fin,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado;
    if (categoria) where.categoria = categoria;
    if (prioridad) where.prioridad = prioridad;
    
    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { asunto: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filtro por rango de fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha_queja = {};
      if (fecha_inicio) where.fecha_queja[Op.gte] = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_queja[Op.lte] = new Date(fecha_fin);
    }

    // Si es residente, solo puede ver sus propias quejas
    if (req.user.rol === 'Residente') {
      where.usuario_id = req.user.id;
    }

    const { count, rows } = await Complaint.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Residence,
          as: 'residencia',
          // ✅ CORRECCIÓN DE COLUMNA: Usar tipo_propiedad
          attributes: ['id', 'numero_unidad', 'bloque', 'tipo_propiedad']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_queja', 'DESC']]
    });

    // Ocultar información del usuario si es anónimo
    const complaintsFormatted = rows.map(complaint => {
      const complaintObj = complaint.toJSON();
      const userRole = req.user ? req.user.rol : null;
      if (complaintObj.es_anonima && userRole === 'Residente') {
        complaintObj.usuario = { id: null, nombre: 'Anónimo', apellido: null, email: null, telefono: null };
      }
      return complaintObj;
    });

    res.json({
      data: complaintsFormatted,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener quejas:', error);
    res.status(500).json({ message: 'Error al obtener quejas', error: error.message });
  }
};

// Obtener queja por ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Residence,
          as: 'residencia',
          // ✅ CORRECCIÓN DE COLUMNA: Usar tipo_propiedad
          attributes: ['id', 'numero_unidad', 'bloque', 'piso', 'tipo_propiedad']
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }

    const complaintObj = complaint.toJSON();
    
    const userRole = req.user ? req.user.rol : null;
    if (complaintObj.es_anonima && 
        userRole !== 'SuperAdmin' && 
        userRole !== 'Administrador') {
      complaintObj.usuario = { id: null, nombre: 'Anónimo', apellido: null, email: null, telefono: null };
    }

    res.json({ complaint: complaintObj });
  } catch (error) {
    console.error('Error al obtener queja:', error);
    res.status(500).json({ message: 'Error al obtener queja', error: error.message });
  }
};

// Crear queja
exports.createComplaint = async (req, res) => {
  try {
    const {
      asunto,
      descripcion,
      categoria,
      prioridad,
      residencia_id,
      fecha_queja,
      es_anonima
    } = req.body;

    const complaint = await Complaint.create({
      usuario_id: req.user.id,
      asunto,
      descripcion,
      categoria: categoria || CATEGORIAS_QUEJA.OTRO,
      prioridad: prioridad || PRIORIDADES_QUEJA.MEDIA,
      estado: ESTADOS_QUEJA.NUEVA,
      residencia_id,
      fecha_queja: fecha_queja || new Date(),
      es_anonima: es_anonima || false
    });

    const complaintWithDetails = await Complaint.findByPk(complaint.id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Residence,
          as: 'residencia',
          attributes: ['id', 'numero_unidad']
        }
      ]
    });

    const complaintObj = complaintWithDetails.toJSON();
    if (complaintObj.es_anonima) {
      complaintObj.usuario = { id: null, nombre: 'Anónimo', apellido: null };
    }

    res.status(201).json({
      message: 'Queja registrada exitosamente',
      complaint: complaintObj
    });
  } catch (error) {
    console.error('Error al crear queja:', error);
    res.status(500).json({ message: 'Error al crear queja', error: error.message });
  }
};

// Actualizar queja
exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      asunto,
      descripcion,
      categoria,
      prioridad,
      estado,
      residencia_id
    } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }

    // Verificar permisos
    const isOwner = complaint.usuario_id === req.user.id;
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta queja' });
    }

    // Solo el administrador puede cambiar el estado
    if (!isAdmin && estado && estado !== complaint.estado) {
        return res.status(403).json({ message: 'Solo la administración puede cambiar el estado de la queja' });
    }

    await complaint.update({
      asunto: asunto || complaint.asunto,
      descripcion: descripcion || complaint.descripcion,
      categoria: categoria || complaint.categoria,
      prioridad: prioridad || complaint.prioridad,
      estado: estado || complaint.estado,
      residencia_id: residencia_id !== undefined ? residencia_id : complaint.residencia_id
    });

    const updatedComplaint = await Complaint.findByPk(id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: Residence,
          as: 'residencia',
          attributes: ['id', 'numero_unidad']
        }
      ]
    });

    res.json({
      message: 'Queja actualizada exitosamente',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Error al actualizar queja:', error);
    res.status(500).json({ message: 'Error al actualizar queja', error: error.message });
  }
};

// FUNCIÓN REQUERIDA por la ruta PATCH /:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; 

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }
    
    if (!estado) {
        return res.status(400).json({ message: 'El campo estado es requerido para actualizar el estado.' });
    }

    await complaint.update({
        estado: estado,
    });

    const updatedComplaint = await Complaint.findByPk(id);

    res.json({
      message: 'Estado de la queja actualizado exitosamente.',
      complaint: updatedComplaint
    });

  } catch (error) {
    console.error('Error al actualizar estado de la queja:', error);
    res.status(500).json({ message: 'Error al actualizar estado de la queja', error: error.message });
  }
};

// FUNCIÓN REQUERIDA por la ruta GET /statistics/summary
exports.getComplaintsStatistics = async (req, res) => {
  try {
    const total = await Complaint.count();
    
    const statusSummary = await Complaint.findAll({
      attributes: [
        'estado',
        [Complaint.sequelize.fn('COUNT', Complaint.sequelize.col('estado')), 'count']
      ],
      group: ['estado'],
      raw: true
    });

    const prioritySummary = await Complaint.findAll({
      attributes: [
        'prioridad',
        [Complaint.sequelize.fn('COUNT', Complaint.sequelize.col('prioridad')), 'count']
      ],
      group: ['prioridad'],
      raw: true
    });

    res.json({
      totalComplaints: total,
      statusSummary,
      prioritySummary,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de quejas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de quejas', error: error.message });
  }
};


// Obtener quejas por usuario
exports.getComplaintsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const complaints = await Complaint.findAll({
      where: { usuario_id: user_id },
      include: [
        {
          model: Residence,
          as: 'residencia',
          attributes: ['id', 'numero_unidad']
        }
      ],
      order: [['fecha_queja', 'DESC']]
    });

    res.json({ 
      complaints, 
      count: complaints.length 
    });
  } catch (error) {
    console.error('Error al obtener quejas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener quejas del usuario', error: error.message });
  }
};

// Eliminar queja
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }

    await complaint.destroy();
    res.json({ message: 'Queja eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar queja:', error);
    res.status(500).json({ message: 'Error al eliminar queja', error: error.message });
  }
};