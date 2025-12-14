'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('amenity_reservations');

    if (!tableDescription.num_personas) {
      await queryInterface.addColumn('amenity_reservations', 'num_personas', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Número de personas para la reserva'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('amenity_reservations', 'num_personas');
  }
};
