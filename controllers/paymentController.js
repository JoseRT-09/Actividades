
// Backend/src/controllers/paymentController.js (CORREGIDO FINAL)
const { Payment, ServiceCost, User, Residence, sequelize } = require('../models'); // CORREGIDO: Se añade 'sequelize'
const { ESTADOS_COSTO } = require('../config/constants');
const { Op } = require('sequelize'); // Importar Op para consistencia

// Obtener todos los pagos
exports.getAllPayments = async (req, res) => {
  try {
    const { residente_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (residente_id) where.residente_id = residente_id;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'residente', attributes: ['id', 'nombre', 'apellido', 'email'] },
        {
          model: ServiceCost,
          as: 'servicioCosto',
          attributes: ['id', 'nombre_servicio', 'monto', 'periodo'],
          include: [
            {
              model: Residence,
              as: 'residencia',
              attributes: ['id', 'numero_unidad', 'bloque']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_pago', 'DESC']]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      payments: rows
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
  }
};

// Obtener pago por ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [
        { model: User, as: 'residente', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] },
        {
          model: ServiceCost,
          as: 'servicioCosto',
          attributes: ['id', 'nombre_servicio', 'descripcion', 'monto', 'periodo'],
          include: [
            {
              model: Residence,
              as: 'residencia',
              attributes: ['id', 'numero_unidad', 'bloque', 'piso']
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ message: 'Error al obtener pago', error: error.message });
  }
};

// Registrar pago
exports.createPayment = async (req, res) => {
  try {
    const {
      residente_id,
      servicio_costo_id,
      monto_pagado,
      metodo_pago,
      referencia,
      comprobante_url
    } = req.body;

    // Verificar que el costo de servicio existe
    const serviceCost = await ServiceCost.findByPk(servicio_costo_id);
    if (!serviceCost) {
      return res.status(404).json({ message: 'Costo de servicio no encontrado' });
    }

    // Crear el pago
    const payment = await Payment.create({
      residente_id,
      servicio_costo_id,
      monto_pagado,
      metodo_pago,
      referencia,
      comprobante_url
    });

    // Actualizar el estado del costo de servicio si el monto pagado es >= al monto del servicio
    if (parseFloat(monto_pagado) >= parseFloat(serviceCost.monto)) {
      await serviceCost.update({ estado: ESTADOS_COSTO.PAGADO });
    }

    const paymentWithDetails = await Payment.findByPk(payment.id, {
      include: [
        { model: User, as: 'residente', attributes: ['id', 'nombre', 'apellido'] },
        {
          model: ServiceCost,
          as: 'servicioCosto',
          attributes: ['id', 'nombre_servicio', 'monto'],
          include: [
            {
              model: Residence,
              as: 'residencia',
              attributes: ['id', 'numero_unidad']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      payment: paymentWithDetails
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  }
};

// Obtener pagos por residente
exports.getPaymentsByResident = async (req, res) => {
  try {
    const { residente_id } = req.params;

    const payments = await Payment.findAll({
      where: { residente_id },
      include: [
        {
          model: ServiceCost,
          as: 'servicioCosto',
          attributes: ['id', 'nombre_servicio', 'monto', 'periodo', 'fecha_vencimiento'],
          include: [
            {
              model: Residence,
              as: 'residencia',
              attributes: ['id', 'numero_unidad', 'bloque']
            }
          ]
        }
      ],
      order: [['fecha_pago', 'DESC']]
    });

    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.monto_pagado), 0);

    res.json({
      payments,
      totalPaid,
      count: payments.length
    });
  } catch (error) {
    console.error('Error al obtener pagos del residente:', error);
    res.status(500).json({ message: 'Error al obtener pagos del residente', error: error.message });
  }
};

// Obtener resumen de pagos por mes
exports.getPaymentsSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const payments = await Payment.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM \"fecha_pago\"")), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('monto_pagado')), 'total']
      ],
      where: sequelize.where(
        sequelize.fn('EXTRACT', sequelize.literal("YEAR FROM \"fecha_pago\"")),
        currentYear
      ),
      group: [sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM \"fecha_pago\""))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal("MONTH FROM \"fecha_pago\"")), 'ASC']],
      raw: true
    });

    res.json({
      year: currentYear,
      summary: payments
    });
  } catch (error) {
    console.error('Error al obtener resumen de pagos:', error);
    res.status(500).json({ message: 'Error al obtener resumen de pagos', error: error.message });
  }
};

// Eliminar pago
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Actualizar el estado del costo de servicio de vuelta a pendiente
    const serviceCost = await ServiceCost.findByPk(payment.servicio_costo_id);
    if (serviceCost && serviceCost.estado === ESTADOS_COSTO.PAGADO) {
      await serviceCost.update({ estado: ESTADOS_COSTO.PENDIENTE });
    }

    await payment.destroy();
    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ message: 'Error al eliminar pago', error: error.message });
  }
};
