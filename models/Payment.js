// Backend/src/models/Payment.js (CORREGIDO)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  residente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  servicio_costo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'service_costs',
      key: 'id'
    }
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  metodo_pago: {
    type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Cheque')
  },
  referencia: {
    type: DataTypes.STRING(100)
  },
  comprobante_url: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Payment;