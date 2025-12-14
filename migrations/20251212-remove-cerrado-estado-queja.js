'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal que pueda haber quedado de ejecuciones anteriores
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_complaints_estado_old" CASCADE;
    `);

    // Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_complaints_estado" RENAME TO "enum_complaints_estado_old";
    `);

    // Crear el nuevo tipo ENUM sin 'Cerrada'
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_complaints_estado" AS ENUM ('Nueva', 'En Revisión', 'En Proceso', 'Resuelta', 'Rechazada');
    `);

    // Actualizar la columna estado, convirtiendo 'Cerrada' a 'Resuelta'
    await queryInterface.sequelize.query(`
      ALTER TABLE complaints
      ALTER COLUMN estado TYPE "enum_complaints_estado"
      USING (
        CASE
          WHEN estado::text = 'Cerrada' THEN 'Resuelta'::text
          ELSE estado::text
        END
      )::"enum_complaints_estado";
    `);

    // Eliminar el tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_complaints_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_complaints_estado_new" CASCADE;
    `);

    // Revertir los cambios
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_complaints_estado" RENAME TO "enum_complaints_estado_new";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_complaints_estado" AS ENUM ('Nueva', 'En Revisión', 'En Proceso', 'Resuelta', 'Cerrada', 'Rechazada');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE complaints
      ALTER COLUMN estado TYPE "enum_complaints_estado"
      USING estado::text::"enum_complaints_estado";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_complaints_estado_new";
    `);
  }
};
