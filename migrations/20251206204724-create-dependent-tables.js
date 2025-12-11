'use strict';

// Lista de ENUMs utilizados en las tablas dependientes
const ENUMS_DEPENDIENTES = [
  // Complaint (Quejas)
  { name: 'enum_complaints_categoria', values: ['Ruido', 'Convivencia', 'Mascotas', 'Estacionamiento', 'Áreas Comunes', 'Limpieza', 'Seguridad', 'Mantenimiento', 'Administración', 'Otro'] }, //
  { name: 'enum_complaints_prioridad', values: ['Baja', 'Media', 'Alta', 'Urgente'] }, //
  { name: 'enum_complaints_estado', values: ['Nueva', 'En Revisión', 'En Proceso', 'Resuelta', 'Cerrada', 'Rechazada'] }, //
  
  // Report (Reportes)
  { name: 'enum_reports_tipo', values: ['Mantenimiento', 'Limpieza', 'Seguridad', 'Instalaciones', 'Otro'] }, //
  { name: 'enum_reports_prioridad', values: ['Baja', 'Media', 'Alta', 'Crítica'] }, //
  { name: 'enum_reports_estado', values: ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'] }, //
  
  // ServiceCost (Costos de Servicio)
  { name: 'enum_service_costs_periodo', values: ['Mensual', 'Trimestral', 'Anual'] }, //
  { name: 'enum_service_costs_estado', values: ['Pendiente', 'Pagado', 'Vencido'] }, //
  
  // Payment (Pagos)
  { name: 'enum_payments_metodo_pago', values: ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'] }, //
  
  // ReassignmentHistory (Historial de Reasignación)
  { name: 'enum_reassignment_history_tipo_cambio', values: ['Venta', 'Renta', 'Cambio Responsable', 'Herencia'] }, //

  // AmenityReservation (Reserva de Amenidad)
  { name: 'enum_amenity_reservations_estado', values: ['Pendiente', 'Confirmada', 'Cancelada', 'Completada'] } //
];


module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. CREAR TODOS LOS TIPOS ENUM NECESARIOS PARA ESTE NIVEL
    for (const enumDef of ENUMS_DEPENDIENTES) {
      await queryInterface.sequelize.query(`
        CREATE TYPE "${enumDef.name}" AS ENUM('${enumDef.values.join("', '")}')
      `);
    }

    // 2. CREAR TABLA SERVICE_COSTS (Depende de Residences)
    await queryInterface.createTable('service_costs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_servicio: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      periodo: {
        type: '"enum_service_costs_periodo"',
        defaultValue: 'Mensual'
      },
      residencia_id: {
        type: Sequelize.INTEGER,
        references: { model: 'residences', key: 'id' }, // FK a Residences (creada en la migración anterior)
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      estado: {
        type: '"enum_service_costs_estado"',
        defaultValue: 'Pendiente'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
      // No tiene updatedAt
    }); //

    // 3. CREAR TABLA COMPLAINTS (Depende de Users y Residences - la tabla que fallaba)
    await queryInterface.createTable('complaints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      asunto: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      categoria: {
        type: '"enum_complaints_categoria"',
        allowNull: false,
        defaultValue: 'Otro'
      },
      prioridad: {
        type: '"enum_complaints_prioridad"',
        allowNull: false,
        defaultValue: 'Media'
      },
      estado: {
        type: '"enum_complaints_estado"',
        allowNull: false,
        defaultValue: 'Nueva'
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }, // FK a Users
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      residencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'residences', key: 'id' }, // FK a Residences
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_queja: {
        type: Sequelize.DATE,
        allowNull: false
      },
      es_anonima: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    }); //

    // 4. CREAR TABLA REPORTS (Depende de Users y Residences)
    await queryInterface.createTable('reports', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      titulo: { type: Sequelize.STRING(150), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: false },
      tipo: { type: '"enum_reports_tipo"', allowNull: false, defaultValue: 'Mantenimiento' },
      prioridad: { type: '"enum_reports_prioridad"', allowNull: false, defaultValue: 'Media' },
      estado: { type: '"enum_reports_estado"', allowNull: false, defaultValue: 'Abierto' },
      
      // Claves Foráneas
      reportado_por_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      asignado_a: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      residencia_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'residences', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      fecha_reporte: { type: Sequelize.DATE, allowNull: false },
      fecha_resolucion: { type: Sequelize.DATE },
      notas_adicionales: { type: Sequelize.TEXT },

      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    }); //

    // 5. CREAR TABLA PAYMENTS (Depende de Users y ServiceCosts)
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      residente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      servicio_costo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'service_costs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monto_pagado: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      fecha_pago: { type: Sequelize.DATE },
      metodo_pago: { type: '"enum_payments_metodo_pago"' },
      referencia: { type: Sequelize.STRING(100) },
      comprobante_url: { type: Sequelize.STRING(255) },

      created_at: { allowNull: false, type: Sequelize.DATE } // No tiene updatedAt
    }); //

    // 6. CREAR TABLA REASSIGNMENT_HISTORY (Depende de Users y Residences)
    await queryInterface.createTable('reassignment_history', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      residencia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'residences', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      residente_anterior_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      residente_nuevo_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tipo_cambio: { type: '"enum_reassignment_history_tipo_cambio"' },
      motivo: { type: Sequelize.TEXT },
      fecha_cambio: { type: Sequelize.DATE },
      autorizado_por: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
      // No tiene timestamps
    }); //

    // 7. CREAR TABLA AMENITY_RESERVATIONS (Depende de Users y Amenities)
    await queryInterface.createTable('amenity_reservations', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      amenidad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'amenities', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      residente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_reserva: { type: Sequelize.DATEONLY, allowNull: false },
      hora_inicio: { type: Sequelize.TIME, allowNull: false },
      hora_fin: { type: Sequelize.TIME, allowNull: false },
      estado: { type: '"enum_amenity_reservations_estado"', defaultValue: 'Pendiente' },
      motivo: { type: Sequelize.TEXT },

      created_at: { allowNull: false, type: Sequelize.DATE } // No tiene updatedAt
    }); //

  },

  down: async (queryInterface, Sequelize) => {
    // ⚠️ Deshacer la migración en orden inverso (tablas hija primero)
    await queryInterface.dropTable('amenity_reservations');
    await queryInterface.dropTable('reassignment_history');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('complaints');
    await queryInterface.dropTable('service_costs');
    
    // Eliminar los tipos ENUM
    for (const enumDef of ENUMS_DEPENDIENTES) {
      await queryInterface.sequelize.query(`
        DROP TYPE "${enumDef.name}"
      `);
    }
  }
};