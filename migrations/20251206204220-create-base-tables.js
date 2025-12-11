'use strict';

// La lista de ENUMs que necesitamos crear en PostgreSQL
const ENUMS = [
  // User
  { name: 'enum_users_rol', values: ['Residente', 'Administrador', 'SuperAdmin'] }, //
  { name: 'enum_users_estado', values: ['Activo', 'Inactivo'] }, //
  // Residence
  { name: 'enum_residences_tipo_propiedad', values: ['Renta', 'Compra'] }, //
  { name: 'enum_residences_estado', values: ['Disponible', 'Ocupada', 'Mantenimiento'] }, //
  // Activity
  { name: 'enum_activities_tipo', values: ['Reunión', 'Evento', 'Mantenimiento', 'Asamblea', 'Celebración', 'Otro'] }, //
  { name: 'enum_activities_estado', values: ['Programada', 'En Curso', 'Completada', 'Cancelada'] }, //
  // Amenity
  { name: 'enum_amenities_tipo', values: ['Salón de Eventos', 'Gimnasio', 'Piscina', 'Cancha Deportiva', 'Área BBQ', 'Salón de Juegos', 'Área Infantil', 'Otro'] }, //
  { name: 'enum_amenities_estado', values: ['Disponible', 'Ocupada', 'Mantenimiento', 'Fuera de Servicio'] } //
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. CREAR TODOS LOS TIPOS ENUM NECESARIOS (POSTGRESQL REQUIERE ESTO PRIMERO)
    for (const enumDef of ENUMS) {
      await queryInterface.sequelize.query(`
        CREATE TYPE "${enumDef.name}" AS ENUM('${enumDef.values.join("', '")}')
      `);
    }

    // 2. CREAR TABLA USERS (Tabla Padre principal)
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20)
      },
      rol: {
        type: '"enum_users_rol"', // Usar el tipo ENUM creado
        defaultValue: 'Residente'
      },
      estado: {
        type: '"enum_users_estado"', // Usar el tipo ENUM creado
        defaultValue: 'Activo'
      },
      fecha_registro: { // Mapeo de createdAt
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: { // Mapeo de updatedAt
        allowNull: false,
        type: Sequelize.DATE
      }
    }); //

    // 3. CREAR TABLA RESIDENCES (Depende de users)
    await queryInterface.createTable('residences', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      numero_unidad: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      bloque: { type: Sequelize.STRING(10) },
      piso: { type: Sequelize.INTEGER },
      area_m2: { type: Sequelize.DECIMAL(10, 2) },
      habitaciones: { type: Sequelize.INTEGER },
      banos: { type: Sequelize.DECIMAL(3, 1) },
      estacionamientos: { type: Sequelize.INTEGER, defaultValue: 0 },
      tipo_propiedad: { type: '"enum_residences_tipo_propiedad"' },
      precio: { type: Sequelize.DECIMAL(12, 2), comment: 'Precio de renta mensual o precio de compra' },
      
      // Claves Foráneas
      dueno_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      residente_actual_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      administrador_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      
      fecha_asignacion: { type: Sequelize.DATE },
      estado: { type: '"enum_residences_estado"', defaultValue: 'Disponible' },
      descripcion: { type: Sequelize.TEXT },
      notas_adicionales: { type: Sequelize.TEXT },

      created_at: { allowNull: false, type: Sequelize.DATE }, // Mapeo de createdAt
      updated_at: { allowNull: false, type: Sequelize.DATE } // Mapeo de updatedAt
    }); //

    // 4. CREAR TABLA ACTIVITIES (Depende de users)
    await queryInterface.createTable('activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      titulo: { type: Sequelize.STRING(150), allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      tipo: { type: '"enum_activities_tipo"', allowNull: false, defaultValue: 'Evento' },
      fecha_inicio: { type: Sequelize.DATE, allowNull: false },
      fecha_fin: { type: Sequelize.DATE },
      ubicacion: { type: Sequelize.STRING(100) },
      
      // Clave Foránea
      organizador_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      
      max_participantes: { type: Sequelize.INTEGER },
      inscritos_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      estado: { type: '"enum_activities_estado"', defaultValue: 'Programada' },

      created_at: { allowNull: false, type: Sequelize.DATE }, // Mapeo de createdAt
      updated_at: { allowNull: false, type: Sequelize.DATE } // Mapeo de updatedAt
    }); //

    // 5. CREAR TABLA AMENITIES (Depende de users - implícito por reservas posteriores)
    await queryInterface.createTable('amenities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(100), allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      tipo: { type: '"enum_amenities_tipo"', allowNull: false },
      ubicacion: { type: Sequelize.STRING(100) },
      capacidad_maxima: { type: Sequelize.INTEGER },
      estado: { type: '"enum_amenities_estado"', defaultValue: 'Disponible' },
      horario_inicio: { type: Sequelize.TIME },
      horario_fin: { type: Sequelize.TIME },
      disponible_reserva: { type: Sequelize.BOOLEAN, defaultValue: true },
      requiere_aprobacion: { type: Sequelize.BOOLEAN, defaultValue: false },
      costo_reserva: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
      reglas: { type: Sequelize.TEXT },
      imagen_url: { type: Sequelize.STRING(255) },

      created_at: { allowNull: false, type: Sequelize.DATE }, 
      updated_at: { allowNull: false, type: Sequelize.DATE } 
    }); //
  },

  down: async (queryInterface, Sequelize) => {
    // ⚠️ Deshacer la migración en orden inverso
    await queryInterface.dropTable('amenities');
    await queryInterface.dropTable('activities');
    await queryInterface.dropTable('residences');
    await queryInterface.dropTable('users');
    
    // Eliminar los tipos ENUM
    for (const enumDef of ENUMS) {
      await queryInterface.sequelize.query(`
        DROP TYPE "${enumDef.name}"
      `);
    }
  }
};