
// Backend/src/controllers/paymentController.js (CORREGIDO FINAL)
const { Payment, ServiceCost, User, Residence, sequelize } = require('../models'); // CORREGIDO: Se añade 'sequelize'
const { ESTADOS_COSTO } = require('../config/constants');
const { Op } = require('sequelize'); // Importar Op para consistencia

// Obtener todos los pagos
exports.getAllPayments = async (req, res) => {
  try {
    console.log('[PAYMENTS] getAllPayments - Query params:', req.query);
    const { residente_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (residente_id) where.residente_id = residente_id;
    console.log('[PAYMENTS] getAllPayments - Where clause:', where);

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

    console.log('[PAYMENTS] getAllPayments - Found:', count, 'payments');
    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      payments: rows
    });
  } catch (error) {
    console.error('[PAYMENTS] getAllPayments - Error:', error);
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
    console.log('[PAYMENTS] createPayment - Request body:', req.body);
    const {
      residente_id,
      servicio_costo_id,
      monto_pagado,
      metodo_pago,
      fecha_pago,
      referencia,
      comprobante_url,
      notas
    } = req.body;

    let serviceCost = null;

    // Verificar que el costo de servicio existe (solo si se proporciona)
    if (servicio_costo_id) {
      console.log('[PAYMENTS] createPayment - Buscando servicio costo ID:', servicio_costo_id);
      serviceCost = await ServiceCost.findByPk(servicio_costo_id);
      if (!serviceCost) {
        console.log('[PAYMENTS] createPayment - Servicio costo no encontrado');
        return res.status(404).json({ message: 'Costo de servicio no encontrado' });
      }
      console.log('[PAYMENTS] createPayment - Servicio costo encontrado:', serviceCost.nombre_servicio);
    } else {
      console.log('[PAYMENTS] createPayment - No se proporcionó servicio_costo_id, creando pago directo de renta');
    }

    // Crear el pago
    const payment = await Payment.create({
      residente_id,
      servicio_costo_id: servicio_costo_id || null,
      monto_pagado,
      metodo_pago,
      fecha_pago: fecha_pago || new Date(),
      referencia,
      comprobante_url,
      notas
    });
    console.log('[PAYMENTS] createPayment - Pago creado con ID:', payment.id);

    // Actualizar el estado del costo de servicio si existe y el monto pagado es >= al monto del servicio
    if (serviceCost && parseFloat(monto_pagado) >= parseFloat(serviceCost.monto)) {
      await serviceCost.update({ estado: ESTADOS_COSTO.PAGADO });
      console.log('[PAYMENTS] createPayment - Estado del servicio actualizado a PAGADO');
    }

    const paymentWithDetails = await Payment.findByPk(payment.id, {
      include: [
        { model: User, as: 'residente', attributes: ['id', 'nombre', 'apellido'] },
        {
          model: ServiceCost,
          as: 'servicioCosto',
          attributes: ['id', 'nombre_servicio', 'monto'],
          required: false, // LEFT JOIN para que funcione sin servicio costo
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

    console.log('[PAYMENTS] createPayment - Pago registrado exitosamente');
    res.status(201).json({
      message: 'Pago registrado exitosamente',
      payment: paymentWithDetails
    });
  } catch (error) {
    console.error('[PAYMENTS] createPayment - Error:', error);
    res.status(500).json({ message: 'Error al registrar pago', error: error.message });
  }
};

// Obtener pagos por residente
exports.getPaymentsByResident = async (req, res) => {
  try {
    const { residente_id } = req.params;
    console.log('[PAYMENTS] getPaymentsByResident - Residente ID:', residente_id);

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

    console.log('[PAYMENTS] getPaymentsByResident - Pagos encontrados:', payments.length);
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.monto_pagado), 0);
    console.log('[PAYMENTS] getPaymentsByResident - Total pagado:', totalPaid);

    res.json({
      payments,
      totalPaid,
      count: payments.length
    });
  } catch (error) {
    console.error('[PAYMENTS] getPaymentsByResident - Error:', error);
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
