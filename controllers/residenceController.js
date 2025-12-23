// Backend/src/controllers/residenceController.js (CORREGIDO COMPLETO)
const { Residence, User, ReassignmentHistory } = require('../models');
const { ESTADOS_RESIDENCIA } = require('../config/constants');
const { Op } = require('sequelize');

// Obtener todas las residencias
exports.getAllResidences = async (req, res) => {
  try {
    const { estado, bloque, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado;
    if (bloque) where.bloque = bloque;
    
    // Búsqueda por texto
    if (search) {
      where[Op.or] = [
        { numero_unidad: { [Op.iLike]: `%${search}%` } },
        { bloque: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Residence.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: 'dueno', 
          attributes: ['id', 'nombre', 'apellido', 'email'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteActual', 
          attributes: ['id', 'nombre', 'apellido', 'email'],
          required: false
        },
        { 
          model: User, 
          as: 'administrador', 
          attributes: ['id', 'nombre', 'apellido', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['numero_unidad', 'ASC']],
      distinct: true
    });

    res.json({
      residences: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error al obtener residencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener residencias', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener residencia por ID
exports.getResidenceById = async (req, res) => {
  try {
    const { id } = req.params;
    const residence = await Residence.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'dueno', 
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteActual', 
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'],
          required: false
        },
        { 
          model: User, 
          as: 'administrador', 
          attributes: ['id', 'nombre', 'apellido', 'email'],
          required: false
        }
      ]
    });

    if (!residence) {
      return res.status(404).json({ message: 'Residencia no encontrada' });
    }

    res.json({ residence });
  } catch (error) {
    console.error('Error al obtener residencia:', error);
    res.status(500).json({ 
      message: 'Error al obtener residencia', 
      error: error.message 
    });
  }
};

// Crear residencia
exports.createResidence = async (req, res) => {
  try {
    const {
      numero_unidad,
      bloque,
      piso,
      area_m2,
      habitaciones,
      banos,
      estacionamientos,
      tipo_propiedad,
      precio,
      dueno_id,
      residente_actual_id,
      administrador_id,
      estado,
      descripcion,
      notas_adicionales
    } = req.body;

    // Verificar si ya existe la unidad
    const existingResidence = await Residence.findOne({ 
      where: { numero_unidad } 
    });
    
    if (existingResidence) {
      return res.status(400).json({ 
        message: 'El número de unidad ya existe' 
      });
    }

    // Determinar estado automáticamente si no se proporciona
    let finalEstado = estado || ESTADOS_RESIDENCIA.DISPONIBLE;
    if (residente_actual_id && !estado) {
      finalEstado = ESTADOS_RESIDENCIA.OCUPADA;
    }

    const residence = await Residence.create({
      numero_unidad,
      bloque,
      piso,
      area_m2,
      habitaciones,
      banos,
      estacionamientos,
      tipo_propiedad,
      precio,
      dueno_id,
      residente_actual_id,
      administrador_id,
      fecha_asignacion: residente_actual_id ? new Date() : null,
      estado: finalEstado,
      descripcion,
      notas_adicionales
    });

    const residenceWithDetails = await Residence.findByPk(residence.id, {
      include: [
        { 
          model: User, 
          as: 'dueno', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteActual', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'administrador', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Residencia creada exitosamente',
      residence: residenceWithDetails
    });
  } catch (error) {
    console.error('Error al crear residencia:', error);
    res.status(500).json({ 
      message: 'Error al crear residencia', 
      error: error.message 
    });
  }
};

// Actualizar residencia
exports.updateResidence = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const residence = await Residence.findByPk(id);
    if (!residence) {
      return res.status(404).json({ message: 'Residencia no encontrada' });
    }

    // Actualizar solo los campos proporcionados
    await residence.update(updateData);

    const updatedResidence = await Residence.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'dueno', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteActual', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'administrador', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Residencia actualizada exitosamente',
      residence: updatedResidence
    });
  } catch (error) {
    console.error('Error al actualizar residencia:', error);
    res.status(500).json({ 
      message: 'Error al actualizar residencia', 
      error: error.message 
    });
  }
};

// Asignar/Reasignar residente
exports.assignResident = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      residente_id,           // Para compatibilidad
      residente_nuevo_id,     // Para el nuevo sistema
      tipo_cambio, 
      motivo,
      notas
    } = req.body;

    const residence = await Residence.findByPk(id);
    if (!residence) {
      return res.status(404).json({ message: 'Residencia no encontrada' });
    }

    // Usar residente_nuevo_id si está disponible, sino residente_id
    const nuevoResidenteId = residente_nuevo_id || residente_id;

    // Guardar en historial
    await ReassignmentHistory.create({
      residencia_id: id,
      residente_anterior_id: residence.residente_actual_id,
      residente_nuevo_id: nuevoResidenteId,
      tipo_cambio: tipo_cambio || 'Asignacion',
      motivo: motivo || 'Asignación de residente',
      autorizado_por: req.user.id,
      notas
    });

    // Actualizar residencia
    await residence.update({
      residente_actual_id: nuevoResidenteId,
      fecha_asignacion: nuevoResidenteId ? new Date() : null,
      estado: nuevoResidenteId ? ESTADOS_RESIDENCIA.OCUPADA : ESTADOS_RESIDENCIA.DISPONIBLE
    });

    const updatedResidence = await Residence.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'dueno', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteActual', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'administrador', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Residente asignado exitosamente',
      residence: updatedResidence
    });
  } catch (error) {
    console.error('Error al asignar residente:', error);
    res.status(500).json({ 
      message: 'Error al asignar residente', 
      error: error.message 
    });
  }
};

// Obtener historial de reasignaciones
exports.getReassignmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await ReassignmentHistory.findAll({
      where: { residencia_id: id },
      include: [
        { 
          model: User, 
          as: 'residenteAnterior', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'residenteNuevo', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        },
        { 
          model: User, 
          as: 'autorizadoPor', 
          attributes: ['id', 'nombre', 'apellido'],
          required: false
        }
      ],
      order: [['fecha_cambio', 'DESC']]
    });

    res.json({ history });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      message: 'Error al obtener historial', 
      error: error.message 
    });
  }
};

// Eliminar residencia
exports.deleteResidence = async (req, res) => {
  try {
    const { id } = req.params;

    const residence = await Residence.findByPk(id);
    if (!residence) {
      return res.status(404).json({ message: 'Residencia no encontrada' });
    }

    await residence.destroy();
    res.json({ message: 'Residencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar residencia:', error);
    res.status(500).json({ 
      message: 'Error al eliminar residencia', 
      error: error.message 
    });
  }
};