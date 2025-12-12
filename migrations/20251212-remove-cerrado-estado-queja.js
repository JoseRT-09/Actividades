'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Para PostgreSQL, necesitamos alterar el tipo ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_complaints_estado" RENAME TO "enum_complaints_estado_old";
    `);

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_complaints_estado" AS ENUM ('Nueva', 'En Revisión', 'En Proceso', 'Resuelta', 'Rechazada');
    `);

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

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_complaints_estado_old";
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir los cambios si es necesario
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
