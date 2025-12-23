// Script para ejecutar la migración del enum tipo_cambio
// Ejecutar con: node run-enum-migration.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log
});

(async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Ejecutando migración...');
    const migration = require('./migrations/20251223-update-reassignment-type-enum.js');
    await migration.up(sequelize.getQueryInterface(), Sequelize);

    console.log('✅ Migración completada exitosamente!');
    console.log('📝 El enum tipo_cambio ahora incluye: Asignacion, Cambio, Liberacion');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    process.exit(1);
  }
})();
