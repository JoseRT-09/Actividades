const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Residence = sequelize.define('Residence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_unidad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  bloque: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  piso: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  area_m2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  habitaciones: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  banos: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true
  },
  estacionamientos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  tipo_propiedad: {
    type: DataTypes.ENUM('Renta', 'Compra'),
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Precio de renta mensual o precio de compra'
  },

  // Referencias a usuarios
  dueno_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  residente_actual_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  administrador_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  estado: {
    type: DataTypes.ENUM('Disponible', 'Ocupada', 'Mantenimiento'),
    defaultValue: 'Disponible'
  },
  
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  notas_adicionales: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'residences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Residence;