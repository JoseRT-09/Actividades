'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero necesitamos eliminar el enum existente y recrearlo con todos los valores
    // PostgreSQL no permite agregar valores a un enum si ya está en uso

    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Crear un nuevo tipo temporal con todos los valores
      await queryInterface.sequelize.query(`
        CREATE TYPE enum_reassignment_history_tipo_cambio_new AS ENUM (
          'Asignacion',
          'Cambio',
          'Liberacion',
          'Venta',
          'Renta',
          'Cambio Responsable',
          'Herencia'
        );
      `, { transaction });

      // 2. Cambiar la columna al nuevo tipo usando CAST
      await queryInterface.sequelize.query(`
        ALTER TABLE reassignment_history
        ALTER COLUMN tipo_cambio TYPE enum_reassignment_history_tipo_cambio_new
        USING tipo_cambio::text::enum_reassignment_history_tipo_cambio_new;
      `, { transaction });

      // 3. Eliminar el tipo viejo
      await queryInterface.sequelize.query(`
        DROP TYPE enum_reassignment_history_tipo_cambio;
      `, { transaction });

      // 4. Renombrar el nuevo tipo al nombre original
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_reassignment_history_tipo_cambio_new
        RENAME TO enum_reassignment_history_tipo_cambio;
      `, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Revertir al enum original
      await queryInterface.sequelize.query(`
        CREATE TYPE enum_reassignment_history_tipo_cambio_old AS ENUM (
          'Venta',
          'Renta',
          'Cambio Responsable',
          'Herencia'
        );
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE reassignment_history
        ALTER COLUMN tipo_cambio TYPE enum_reassignment_history_tipo_cambio_old
        USING tipo_cambio::text::enum_reassignment_history_tipo_cambio_old;
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP TYPE enum_reassignment_history_tipo_cambio;
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE enum_reassignment_history_tipo_cambio_old
        RENAME TO enum_reassignment_history_tipo_cambio;
      `, { transaction });
    });
  }
};
