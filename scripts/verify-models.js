#!/usr/bin/env node

/**
 * Script de verificación de modelos
 * Este script verifica que todos los modelos de Sequelize estén correctamente configurados
 */

const { sequelize, User, Residence, Activity, Amenity, Complaint, Report, Payment, ServiceCost } = require('../models');

async function verifyModels() {
  console.log('🔍 Iniciando verificación de modelos...\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣  Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa\n');

    // 2. Verificar modelos registrados
    console.log('2️⃣  Verificando modelos registrados en Sequelize:');
    const registeredModels = Object.keys(sequelize.models);
    console.log('   Modelos encontrados:', registeredModels.join(', '));

    const expectedModels = ['User', 'Residence', 'Activity', 'Amenity', 'Complaint', 'Report', 'Payment', 'ServiceCost', 'ReassignmentHistory', 'AmenityReservation'];
    const missingModels = expectedModels.filter(model => !registeredModels.includes(model));

    if (missingModels.length > 0) {
      console.log('   ⚠️  ADVERTENCIA: Modelos faltantes:', missingModels.join(', '));
    } else {
      console.log('   ✅ Todos los modelos esperados están registrados\n');
    }

    // 3. Verificar tablas en la base de datos
    console.log('3️⃣  Verificando tablas en la base de datos:');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log('   Tablas encontradas:', tables.map(t => t.table_name).join(', '));
    console.log('   ✅ Verificación de tablas completa\n');

    // 4. Verificar campos críticos de cada modelo
    console.log('4️⃣  Verificando estructura de modelos:');

    // Activity
    console.log('   📋 Activity:');
    console.log('      - Campos:', Object.keys(Activity.rawAttributes).join(', '));
    console.log('      - Tabla:', Activity.tableName);
    if (Activity.rawAttributes.titulo && Activity.rawAttributes.organizador_id) {
      console.log('      ✅ Campos críticos presentes');
    } else {
      console.log('      ⚠️  ADVERTENCIA: Campos críticos faltantes');
    }

    // Amenity
    console.log('   📋 Amenity:');
    console.log('      - Campos:', Object.keys(Amenity.rawAttributes).join(', '));
    console.log('      - Tabla:', Amenity.tableName);
    if (Amenity.rawAttributes.nombre) {
      console.log('      ✅ Campos críticos presentes');
    } else {
      console.log('      ⚠️  ADVERTENCIA: Campos críticos faltantes');
    }

    // Complaint
    console.log('   📋 Complaint:');
    console.log('      - Campos:', Object.keys(Complaint.rawAttributes).join(', '));
    console.log('      - Tabla:', Complaint.tableName);
    if (Complaint.rawAttributes.asunto && Complaint.rawAttributes.usuario_id) {
      console.log('      ✅ Campos críticos presentes');
    } else {
      console.log('      ⚠️  ADVERTENCIA: Campos críticos faltantes');
    }

    // 5. Verificar asociaciones
    console.log('\n5️⃣  Verificando asociaciones:');
    console.log('   📋 Activity asociaciones:', Object.keys(Activity.associations).join(', '));
    console.log('   📋 Amenity asociaciones:', Object.keys(Amenity.associations).join(', '));
    console.log('   📋 Complaint asociaciones:', Object.keys(Complaint.associations).join(', '));

    if (Activity.associations.organizador) {
      console.log('   ✅ Activity tiene asociación con organizador (User)');
    } else {
      console.log('   ⚠️  ADVERTENCIA: Activity no tiene asociación con organizador');
    }

    // 6. Intentar consultar cada tabla
    console.log('\n6️⃣  Verificando acceso a tablas:');

    try {
      await Activity.count();
      console.log('   ✅ Activity: Acceso correcto');
    } catch (error) {
      console.log('   ❌ Activity: Error -', error.message);
    }

    try {
      await Amenity.count();
      console.log('   ✅ Amenity: Acceso correcto');
    } catch (error) {
      console.log('   ❌ Amenity: Error -', error.message);
    }

    try {
      await Complaint.count();
      console.log('   ✅ Complaint: Acceso correcto');
    } catch (error) {
      console.log('   ❌ Complaint: Error -', error.message);
    }

    try {
      await User.count();
      console.log('   ✅ User: Acceso correcto');
    } catch (error) {
      console.log('   ❌ User: Error -', error.message);
    }

    console.log('\n✅ Verificación completa\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar verificación
verifyModels();