const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.ENUM('Reunión', 'Evento', 'Mantenimiento', 'Asamblea', 'Celebración', 'Otro'),
    allowNull: false,
    defaultValue: 'Evento'
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  ubicacion: {
    type: DataTypes.STRING(100)
  },
  organizador_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  max_participantes: {
    type: DataTypes.INTEGER
  },
  inscritos_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('Programada', 'En Curso', 'Completada', 'Cancelada'),
    defaultValue: 'Programada'
  }
}, {
  tableName: 'activities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Activity;