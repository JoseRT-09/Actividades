'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal que pueda haber quedado de ejecuciones anteriores
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_amenities_estado_old" CASCADE;
    `);

    // Primero, actualizar todos los registros con "Mantenimiento" a "Fuera de Servicio"
    await queryInterface.sequelize.query(`
      UPDATE amenities
      SET estado = 'Fuera de Servicio'
      WHERE estado = 'Mantenimiento';
    `);

    // Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_amenities_estado" RENAME TO "enum_amenities_estado_old";
    `);

    // Crear el nuevo tipo con solo los estados válidos
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_amenities_estado" AS ENUM ('Disponible', 'Ocupada', 'Fuera de Servicio');
    `);

    // Actualizar la columna para usar el nuevo tipo
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado TYPE "enum_amenities_estado"
      USING estado::text::"enum_amenities_estado";
    `);

    // Eliminar el tipo antiguo
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_amenities_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_amenities_estado_old" CASCADE;
    `);

    // Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_amenities_estado" RENAME TO "enum_amenities_estado_old";
    `);

    // Crear el tipo anterior con "Mantenimiento"
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_amenities_estado" AS ENUM ('Disponible', 'Ocupada', 'Mantenimiento', 'Fuera de Servicio');
    `);

    // Actualizar la columna para usar el nuevo tipo
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado TYPE "enum_amenities_estado"
      USING estado::text::"enum_amenities_estado";
    `);

    // Eliminar el tipo antiguo
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_amenities_estado_old";
    `);
  }
};
