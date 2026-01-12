'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Make servicio_costo_id nullable to allow direct rent payments
      await queryInterface.changeColumn('payments', 'servicio_costo_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'service_costs',
          key: 'id'
        }
      }, { transaction });

      // 2. Add notas column for payment notes
      await queryInterface.addColumn('payments', 'notas', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Remove notas column
      await queryInterface.removeColumn('payments', 'notas', { transaction });

      // 2. Make servicio_costo_id non-nullable again
      await queryInterface.changeColumn('payments', 'servicio_costo_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'service_costs',
          key: 'id'
        }
      }, { transaction });
    });
  }
};
