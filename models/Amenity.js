const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Amenity = sequelize.define('Amenity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
  tipo: { 
    type: DataTypes.ENUM('Salón de Eventos', 'Gimnasio', 'Piscina', 'Cancha Deportiva', 
                         'Área BBQ', 'Salón de Juegos', 'Área Infantil', 'Otro'),
    allowNull: false 
  },
  ubicacion: { type: DataTypes.STRING(100) },
  capacidad_maxima: { type: DataTypes.INTEGER },
  estado: { 
    type: DataTypes.ENUM('Disponible', 'Ocupada', 'Mantenimiento', 'Fuera de Servicio'),
    defaultValue: 'Disponible' 
  },
  horario_inicio: { type: DataTypes.TIME },
  horario_fin: { type: DataTypes.TIME },
  disponible_reserva: { type: DataTypes.BOOLEAN, defaultValue: true },
  requiere_aprobacion: { type: DataTypes.BOOLEAN, defaultValue: false },
  costo_reserva: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  reglas: { type: DataTypes.TEXT },
  imagen_url: { type: DataTypes.STRING(255) }
}, {
  tableName: 'amenities',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Amenity;