const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplaintComment = sequelize.define('ComplaintComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  complaint_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'complaints',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 5000]
    }
  }
}, {
  tableName: 'complaint_comments',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ComplaintComment;
