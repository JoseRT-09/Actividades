'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal que pueda haber quedado de ejecuciones anteriores
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_reports_estado_old" CASCADE;
    `);

    // Renombrar el tipo actual a temporal
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_reports_estado" RENAME TO "enum_reports_estado_old";
    `);

    // Crear el nuevo tipo ENUM sin 'Cerrado'
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_reports_estado" AS ENUM ('Abierto', 'En Progreso', 'Resuelto');
    `);

    // Actualizar la columna estado, convirtiendo 'Cerrado' a 'Resuelto'
    await queryInterface.sequelize.query(`
      ALTER TABLE reports
      ALTER COLUMN estado TYPE "enum_reports_estado"
      USING (
        CASE
          WHEN estado::text = 'Cerrado' THEN 'Resuelto'::text
          ELSE estado::text
        END
      )::"enum_reports_estado";
    `);

    // Eliminar el tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_reports_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Limpiar cualquier tipo temporal
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_reports_estado_new" CASCADE;
    `);

    // Revertir los cambios
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_reports_estado" RENAME TO "enum_reports_estado_new";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_reports_estado" AS ENUM ('Abierto', 'En Progreso', 'Resuelto', 'Cerrado');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE reports
      ALTER COLUMN estado TYPE "enum_reports_estado"
      USING estado::text::"enum_reports_estado";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_reports_estado_new";
    `);
  }
};
