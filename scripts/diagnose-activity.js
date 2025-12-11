#!/usr/bin/env node

/**
 * Script de diagnóstico específico para el modelo Activity
 */

console.log('🔍 Diagnóstico del modelo Activity\n');

// Paso 1: Verificar el archivo Activity.js directamente
console.log('1️⃣  Verificando archivo Activity.js directamente...');
const fs = require('fs');
const path = require('path');
const activityPath = path.join(__dirname, '../models/Activity.js');
console.log('   Ruta:', activityPath);
console.log('   Existe:', fs.existsSync(activityPath));
const activityContent = fs.readFileSync(activityPath, 'utf8');
console.log('   Tamaño:', activityContent.length, 'bytes');
console.log('   Primeras líneas:');
console.log('   ' + activityContent.split('\n').slice(0, 10).join('\n   '));

// Paso 2: Importar Activity directamente
console.log('\n2️⃣  Importando Activity directamente...');
try {
  delete require.cache[require.resolve('../models/Activity')];
  const ActivityDirect = require('../models/Activity');
  console.log('   ✅ Importación exitosa');
  console.log('   Tipo:', typeof ActivityDirect);
  console.log('   Nombre del modelo:', ActivityDirect.name);
  console.log('   Tabla:', ActivityDirect.tableName);
  console.log('   Campos:', Object.keys(ActivityDirect.rawAttributes || {}).slice(0, 10).join(', '));
} catch (error) {
  console.log('   ❌ Error:', error.message);
}

// Paso 3: Importar desde index.js
console.log('\n3️⃣  Importando Activity desde models/index.js...');
try {
  // Limpiar caché
  Object.keys(require.cache).forEach(key => {
    if (key.includes('/models/')) {
      delete require.cache[key];
    }
  });

  const models = require('../models');
  console.log('   Modelos exportados:', Object.keys(models).filter(k => k !== 'sequelize' && k !== 'Sequelize'));

  if (models.Activity) {
    console.log('   ✅ Activity está en exports');
    console.log('   Tipo:', typeof models.Activity);
    console.log('   Nombre del modelo:', models.Activity.name);
    console.log('   Tabla:', models.Activity.tableName);
    console.log('   Campos:', Object.keys(models.Activity.rawAttributes || {}).slice(0, 10).join(', '));
  } else {
    console.log('   ❌ Activity NO está en exports');
  }

  if (models.Amenity) {
    console.log('\n   Comparación con Amenity:');
    console.log('   Amenity nombre:', models.Amenity.name);
    console.log('   Amenity tabla:', models.Amenity.tableName);
    console.log('   Amenity campos:', Object.keys(models.Amenity.rawAttributes || {}).slice(0, 10).join(', '));
  }

  // Verificar si Activity === Amenity
  if (models.Activity && models.Amenity) {
    console.log('\n   Activity === Amenity:', models.Activity === models.Amenity);
    console.log('   Activity.tableName === Amenity.tableName:', models.Activity.tableName === models.Amenity.tableName);
  }

  // Paso 4: Verificar modelos registrados en Sequelize
  console.log('\n4️⃣  Verificando modelos en sequelize.models...');
  const registeredModels = Object.keys(models.sequelize.models);
  console.log('   Modelos registrados:', registeredModels.join(', '));
  console.log('   Activity en sequelize.models:', registeredModels.includes('Activity'));
  console.log('   Amenity en sequelize.models:', registeredModels.includes('Amenity'));

  if (models.sequelize.models.Activity) {
    console.log('\n   sequelize.models.Activity:');
    console.log('   - Tabla:', models.sequelize.models.Activity.tableName);
    console.log('   - Campos:', Object.keys(models.sequelize.models.Activity.rawAttributes).slice(0, 10).join(', '));
  }

  if (models.sequelize.models.Amenity) {
    console.log('\n   sequelize.models.Amenity:');
    console.log('   - Tabla:', models.sequelize.models.Amenity.tableName);
    console.log('   - Campos:', Object.keys(models.sequelize.models.Amenity.rawAttributes).slice(0, 10).join(', '));
  }

} catch (error) {
  console.log('   ❌ Error:', error.message);
  console.log(error.stack);
}

console.log('\n✅ Diagnóstico completo\n');