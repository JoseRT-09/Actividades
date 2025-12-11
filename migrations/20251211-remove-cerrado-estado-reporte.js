'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para PostgreSQL, necesitamos alterar el tipo ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_reports_estado" RENAME TO "enum_reports_estado_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_reports_estado" AS ENUM ('Abierto', 'En Progreso', 'Resuelto');
    `);

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

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_reports_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir los cambios si es necesario
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
