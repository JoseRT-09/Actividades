#!/usr/bin/env node

/**
 * Script para limpiar el caché de Sequelize y verificar la configuración
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Limpiando caché de Sequelize...\n');

// 1. Limpiar require cache
console.log('1️⃣  Limpiando caché de require...');
Object.keys(require.cache).forEach(key => {
  if (key.includes('/models/') || key.includes('\\models\\')) {
    delete require.cache[key];
    console.log('   - Eliminado:', path.basename(key));
  }
});
console.log('   ✅ Caché limpiado\n');

// 2. Verificar archivos de modelos
console.log('2️⃣  Verificando archivos de modelos...');
const modelsDir = path.join(__dirname, '../models');
const modelFiles = fs.readdirSync(modelsDir).filter(file =>
  file.endsWith('.js') && file !== 'index.js' && !file.startsWith('verify')
);

console.log('   Archivos encontrados:');
modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`   - ${file} (${stats.size} bytes)`);
});

// 3. Verificar contenido de Activity.js
console.log('\n3️⃣  Verificando Activity.js...');
const activityPath = path.join(modelsDir, 'Activity.js');
const activityContent = fs.readFileSync(activityPath, 'utf8');

// Buscar palabras clave que deberían estar presentes
const expectedKeywords = ['titulo', 'fecha_inicio', 'max_participantes', 'organizador_id'];
const foundKeywords = expectedKeywords.filter(keyword => activityContent.includes(keyword));

console.log('   Palabras clave esperadas:', expectedKeywords.join(', '));
console.log('   Palabras clave encontradas:', foundKeywords.join(', '));

if (foundKeywords.length === expectedKeywords.length) {
  console.log('   ✅ Activity.js parece correcto');
} else {
  console.log('   ⚠️  ADVERTENCIA: Faltan palabras clave en Activity.js');
  console.log('   Faltantes:', expectedKeywords.filter(k => !foundKeywords.includes(k)).join(', '));
}

// Buscar palabras que NO deberían estar (de Amenity)
const amenityKeywords = ['capacidad_maxima', 'horario_inicio', 'horario_fin', 'disponible_reserva'];
const foundAmenityKeywords = amenityKeywords.filter(keyword => activityContent.includes(keyword));

if (foundAmenityKeywords.length > 0) {
  console.log('   ⚠️  ADVERTENCIA: Se encontraron campos de Amenity en Activity.js');
  console.log('   Campos de Amenity encontrados:', foundAmenityKeywords.join(', '));
} else {
  console.log('   ✅ No se encontraron campos de Amenity en Activity.js');
}

// 4. Verificar Amenity.js también
console.log('\n4️⃣  Verificando Amenity.js...');
const amenityPath = path.join(modelsDir, 'Amenity.js');
const amenityContent = fs.readFileSync(amenityPath, 'utf8');

const amenityExpectedKeywords = ['nombre', 'capacidad', 'horario_disponible'];
const foundAmenityExpected = amenityExpectedKeywords.filter(keyword => amenityContent.includes(keyword));

console.log('   Palabras clave esperadas:', amenityExpectedKeywords.join(', '));
console.log('   Palabras clave encontradas:', foundAmenityExpected.join(', '));

if (foundAmenityExpected.length === amenityExpectedKeywords.length) {
  console.log('   ✅ Amenity.js parece correcto');
} else {
  console.log('   ⚠️  ADVERTENCIA: Faltan palabras clave en Amenity.js');
}

console.log('\n✅ Verificación completa');
console.log('\n💡 Recomendación:');
console.log('   Si ves advertencias arriba, verifica los archivos de modelos.');
console.log('   Luego reinicia el servidor con: npm run dev');
console.log('   Y ejecuta nuevamente: node src/scripts/verify-models.js\n');