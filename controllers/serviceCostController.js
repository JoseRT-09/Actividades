const { ServiceCost, Residence, User } = require('../models');
const { ESTADOS_COSTO } = require('../config/constants');
const { Op } = require('sequelize');

// Obtener todos los costos de servicio
exports.getAllServiceCosts = async (req, res) => {
  try {
    const { estado, residencia_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado;
    if (residencia_id) where.residencia_id = residencia_id;

    const { count, rows } = await ServiceCost.findAndCountAll({
      where,
      include: [
        {
          model: Residence,
          as: 'residencia', // ✅ CORRECCIÓN EAGER LOADING
          attributes: ['id', 'numero_unidad', 'bloque'],
          include: [
            { model: User, as: 'residenteActual', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_vencimiento', 'ASC']]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      serviceCosts: rows
    });
  } catch (error) {
    console.error('Error al obtener costos:', error);
    res.status(500).json({ message: 'Error al obtener costos', error: error.message });
  }
};

// Obtener costo por ID
exports.getServiceCostById = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceCost = await ServiceCost.findByPk(id, {
      include: [
        {
          model: Residence,
          as: 'residencia', // ✅ CORRECCIÓN EAGER LOADING
          attributes: ['id', 'numero_unidad', 'bloque'],
          include: [
            { model: User, as: 'residenteActual', attributes: ['id', 'nombre', 'apellido', 'email'] }
          ]
        }
      ]
    });

    if (!serviceCost) {
      return res.status(404).json({ message: 'Costo de servicio no encontrado' });
    }

    res.json({ serviceCost });
  } catch (error) {
    console.error('Error al obtener costo:', error);
    res.status(500).json({ message: 'Error al obtener costo', error: error.message });
  }
};

// Crear costo de servicio
exports.createServiceCost = async (req, res) => {
  try {
    const {
      nombre_servicio,
      descripcion,
      monto,
      periodo,
      residencia_id,
      fecha_inicio,
      fecha_vencimiento
    } = req.body;

    const serviceCost = await ServiceCost.create({
      nombre_servicio,
      descripcion,
      monto,
      periodo,
      residencia_id,
      fecha_inicio,
      fecha_vencimiento,
      estado: ESTADOS_COSTO.PENDIENTE
    });

    const serviceCostWithDetails = await ServiceCost.findByPk(serviceCost.id, {
      include: [
        {
          model: Residence,
          as: 'residencia', // ✅ CORRECCIÓN EAGER LOADING
          attributes: ['id', 'numero_unidad', 'bloque'],
          include: [
            { model: User, as: 'residenteActual', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Costo de servicio creado exitosamente',
      serviceCost: serviceCostWithDetails
    });
  } catch (error) {
    console.error('Error al crear costo:', error);
    res.status(500).json({ message: 'Error al crear costo', error: error.message });
  }
};

// Actualizar costo de servicio
exports.updateServiceCost = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_servicio, descripcion, monto, periodo, fecha_vencimiento, estado } = req.body;

    const serviceCost = await ServiceCost.findByPk(id);
    if (!serviceCost) {
      return res.status(404).json({ message: 'Costo de servicio no encontrado' });
    }

    await serviceCost.update({
      nombre_servicio: nombre_servicio || serviceCost.nombre_servicio,
      descripcion: descripcion || serviceCost.descripcion,
      monto: monto || serviceCost.monto,
      periodo: periodo || serviceCost.periodo,
      fecha_vencimiento: fecha_vencimiento || serviceCost.fecha_vencimiento,
      estado: estado || serviceCost.estado
    });

    const updatedServiceCost = await ServiceCost.findByPk(id, {
      include: [
        {
          model: Residence,
          as: 'residencia', // ✅ CORRECCIÓN EAGER LOADING
          attributes: ['id', 'numero_unidad', 'bloque'],
          include: [
            { model: User, as: 'residenteActual', attributes: ['id', 'nombre', 'apellido'] }
          ]
        }
      ]
    });

    res.json({
      message: 'Costo de servicio actualizado exitosamente',
      serviceCost: updatedServiceCost
    });
  } catch (error) {
    console.error('Error al actualizar costo:', error);
    res.status(500).json({ message: 'Error al actualizar costo', error: error.message });
  }
};

// Marcar como vencidos los costos no pagados
exports.updateOverdueCosts = async (req, res) => {
  try {
    const today = new Date();
    
    const [updatedCount] = await ServiceCost.update(
      { estado: ESTADOS_COSTO.VENCIDO },
      {
        where: {
          estado: ESTADOS_COSTO.PENDIENTE,
          fecha_vencimiento: { [Op.lt]: today }
        }
      }
    );

    res.json({
      message: `${updatedCount} costos marcados como vencidos`,
      count: updatedCount
    });
  } catch (error) {
    console.error('Error al actualizar costos vencidos:', error);
    res.status(500).json({ message: 'Error al actualizar costos vencidos', error: error.message });
  }
};

// Obtener costos pendientes por residencia
exports.getPendingCostsByResidence = async (req, res) => {
  try {
    const { residencia_id } = req.params;

    const pendingCosts = await ServiceCost.findAll({
      where: {
        residencia_id,
        estado: [ESTADOS_COSTO.PENDIENTE, ESTADOS_COSTO.VENCIDO]
      },
      order: [['fecha_vencimiento', 'ASC']]
    });

    const totalPending = pendingCosts.reduce((sum, cost) => sum + parseFloat(cost.monto), 0);

    res.json({
      pendingCosts,
      totalPending,
      count: pendingCosts.length
    });
  } catch (error) {
    console.error('Error al obtener costos pendientes:', error);
    res.status(500).json({ message: 'Error al obtener costos pendientes', error: error.message });
  }
};

// Eliminar costo de servicio
exports.deleteServiceCost = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceCost = await ServiceCost.findByPk(id);
    if (!serviceCost) {
      return res.status(404).json({ message: 'Costo de servicio no encontrado' });
    }

    await serviceCost.destroy();
    res.json({ message: 'Costo de servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar costo:', error);
    res.status(500).json({ message: 'Error al eliminar costo', error: error.message });
  }
};