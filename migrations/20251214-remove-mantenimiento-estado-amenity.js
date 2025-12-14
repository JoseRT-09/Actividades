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

    // PASO 1: Eliminar el valor por defecto
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // PASO 2: Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_amenities_estado" RENAME TO "enum_amenities_estado_old";
    `);

    // PASO 3: Crear el nuevo tipo con solo los estados válidos
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_amenities_estado" AS ENUM ('Disponible', 'Ocupada', 'Fuera de Servicio');
    `);

    // PASO 4: Actualizar la columna para usar el nuevo tipo
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado TYPE "enum_amenities_estado"
      USING estado::text::"enum_amenities_estado";
    `);

    // PASO 5: Restaurar el valor por defecto
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado SET DEFAULT 'Disponible'::"enum_amenities_estado";
    `);

    // PASO 6: Eliminar el tipo antiguo
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_amenities_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_amenities_estado_old" CASCADE;
    `);

    // PASO 1: Eliminar el valor por defecto
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado DROP DEFAULT;
    `);

    // PASO 2: Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_amenities_estado" RENAME TO "enum_amenities_estado_old";
    `);

    // PASO 3: Crear el tipo anterior con "Mantenimiento"
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_amenities_estado" AS ENUM ('Disponible', 'Ocupada', 'Mantenimiento', 'Fuera de Servicio');
    `);

    // PASO 4: Actualizar la columna para usar el nuevo tipo
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado TYPE "enum_amenities_estado"
      USING estado::text::"enum_amenities_estado";
    `);

    // PASO 5: Restaurar el valor por defecto
    await queryInterface.sequelize.query(`
      ALTER TABLE amenities
      ALTER COLUMN estado SET DEFAULT 'Disponible'::"enum_amenities_estado";
    `);

    // PASO 6: Eliminar el tipo antiguo
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_amenities_estado_old";
    `);
  }
};
