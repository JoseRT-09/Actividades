const { Amenity, AmenityReservation, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las amenidades
exports.getAllAmenities = async (req, res) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (estado) where.estado = estado; // Usando 'estado' como en el modelo

    const { count, rows } = await Amenity.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      amenities: rows
    });
  } catch (error) {
    console.error('Error al obtener amenidades:', error);
    res.status(500).json({ message: 'Error al obtener amenidades', error: error.message });
  }
};

// Obtener amenidad por ID
exports.getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await Amenity.findByPk(id);

    if (!amenity) {
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }

    res.json({ amenity });
  } catch (error) {
    console.error('Error al obtener amenidad:', error);
    res.status(500).json({ message: 'Error al obtener amenidad', error: error.message });
  }
};

// Crear amenidad
exports.createAmenity = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      tipo,
      ubicacion,
      capacidad_maxima, // Campo corregido
      horario_inicio, // Campo corregido
      horario_fin, // Campo corregido
      disponible_reserva, // Campo correcto
      requiere_aprobacion, // Campo correcto
      costo_reserva, // Campo corregido
      reglas,
      imagen_url
    } = req.body;

    const amenity = await Amenity.create({
      nombre,
      descripcion,
      tipo,
      ubicacion,
      capacidad_maxima,
      estado: 'Disponible',
      horario_inicio,
      horario_fin,
      disponible_reserva: disponible_reserva !== undefined ? disponible_reserva : true,
      requiere_aprobacion: requiere_aprobacion || false,
      costo_reserva: costo_reserva || 0.00,
      reglas,
      imagen_url
    });

    res.status(201).json({
      message: 'Amenidad creada exitosamente',
      amenity
    });
  } catch (error) {
    console.error('Error al crear amenidad:', error);
    res.status(500).json({ message: 'Error al crear amenidad', error: error.message });
  }
};

// Actualizar amenidad
exports.updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      tipo,
      ubicacion,
      capacidad_maxima, // Campo corregido
      estado,
      horario_inicio, // Campo corregido
      horario_fin, // Campo corregido
      disponible_reserva, // Campo correcto
      requiere_aprobacion, // Campo correcto
      costo_reserva, // Campo corregido
      reglas,
      imagen_url
    } = req.body;

    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }

    await amenity.update({
      nombre: nombre || amenity.nombre,
      descripcion: descripcion || amenity.descripcion,
      tipo: tipo || amenity.tipo,
      ubicacion: ubicacion || amenity.ubicacion,
      capacidad_maxima: capacidad_maxima !== undefined ? capacidad_maxima : amenity.capacidad_maxima,
      estado: estado || amenity.estado,
      horario_inicio: horario_inicio || amenity.horario_inicio,
      horario_fin: horario_fin || amenity.horario_fin,
      disponible_reserva: disponible_reserva !== undefined ? disponible_reserva : amenity.disponible_reserva,
      requiere_aprobacion: requiere_aprobacion !== undefined ? requiere_aprobacion : amenity.requiere_aprobacion,
      costo_reserva: costo_reserva !== undefined ? costo_reserva : amenity.costo_reserva,
      reglas: reglas || amenity.reglas,
      imagen_url: imagen_url || amenity.imagen_url
    });

    res.json({
      message: 'Amenidad actualizada exitosamente',
      amenity
    });
  } catch (error) {
    console.error('Error al actualizar amenidad:', error);
    res.status(500).json({ message: 'Error al actualizar amenidad', error: error.message });
  }
};

// Implementación del método faltante en rutas
exports.updateAmenityAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['Disponible', 'Ocupada', 'Fuera de Servicio'].includes(estado)) {
      return res.status(400).json({ message: 'Estado de amenidad inválido' });
    }
    
    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }

    await amenity.update({ estado });

    res.json({
      message: 'Estado de amenidad actualizado exitosamente',
      amenity
    });
  } catch (error) {
    console.error('Error al actualizar estado de amenidad:', error);
    res.status(500).json({ message: 'Error al actualizar estado de amenidad', error: error.message });
  }
};

// Eliminar amenidad
exports.deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    const amenity = await Amenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }

    await amenity.destroy();
    res.json({ message: 'Amenidad eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar amenidad:', error);
    res.status(500).json({ message: 'Error al eliminar amenidad', error: error.message });
  }
};

// ===== RESERVAS DE AMENIDADES (Lógica de Reserva Corregida) =====

// Obtener todas las reservas
exports.getAllReservations = async (req, res) => {
  try {
    const { amenidad_id, estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (amenidad_id) where.amenidad_id = amenidad_id;
    if (estado) where.estado = estado;

    // Si es residente, solo puede ver sus propias reservas
    if (req.user.rol === 'Residente') {
      where.residente_id = req.user.id;
    }

    const { count, rows } = await AmenityReservation.findAndCountAll({
      where,
      include: [
        {
          model: Amenity,
          as: 'amenidad',
          attributes: ['id', 'nombre', 'ubicacion', 'tipo', 'capacidad_maxima']
        },
        {
          model: User,
          as: 'residente',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_reserva', 'DESC'], ['hora_inicio', 'DESC']]
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      reservations: rows
    });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
};

// Crear reserva
exports.createReservation = async (req, res) => {
  try {
    console.log('📝 Datos recibidos para crear reserva:', req.body);

    const {
      amenidad_id,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      motivo,
      num_personas
    } = req.body;

    // Verificar que la amenidad existe
    const amenity = await Amenity.findByPk(amenidad_id);
    if (!amenity) {
      console.log('❌ Amenidad no encontrada:', amenidad_id);
      return res.status(404).json({ message: 'Amenidad no encontrada' });
    }

    console.log('✅ Amenidad encontrada:', amenity.nombre);

    // VALIDACIÓN: No se puede reservar si está fuera de servicio
    if (amenity.estado === 'Fuera de Servicio') {
      console.log('❌ Amenidad fuera de servicio');
      return res.status(400).json({ message: 'Esta amenidad está fuera de servicio y no puede ser reservada' });
    }

    // Verificar si requiere reserva
    if (!amenity.disponible_reserva) {
      console.log('❌ Amenidad no disponible para reserva');
      return res.status(400).json({ message: 'Esta amenidad no está disponible para reserva' });
    }

    // VALIDACIÓN: Validar capacidad máxima
    if (num_personas && (amenity.capacidad_maxima || amenity.capacidad)) {
      const maxCapacity = amenity.capacidad_maxima || amenity.capacidad;
      if (num_personas > maxCapacity) {
        console.log(`❌ Capacidad excedida: ${num_personas} > ${maxCapacity}`);
        return res.status(400).json({
          message: `La capacidad máxima de esta amenidad es de ${maxCapacity} personas`
        });
      }
    }

    // VALIDACIÓN: Validar horarios de operación
    if (amenity.horario_inicio && amenity.horario_fin) {
      console.log(`🕒 Validando horarios: ${hora_inicio} - ${hora_fin} vs ${amenity.horario_inicio} - ${amenity.horario_fin}`);
      if (hora_inicio < amenity.horario_inicio || hora_fin > amenity.horario_fin) {
        console.log('❌ Horario fuera del rango permitido');
        return res.status(400).json({
          message: `El horario de reserva debe estar dentro del horario de operación (${amenity.horario_inicio} - ${amenity.horario_fin})`
        });
      }
    }

    // VALIDACIÓN: No se puede reservar en fecha/hora pasada
    const fechaHoraReserva = new Date(`${fecha_reserva}T${hora_inicio}`);
    const ahora = new Date();

    console.log(`📅 Validando fecha/hora: ${fechaHoraReserva} vs ${ahora}`);

    if (fechaHoraReserva < ahora) {
      console.log('❌ Fecha/hora en el pasado');
      return res.status(400).json({
        message: 'No se puede reservar en una fecha u hora pasada'
      });
    }

    // Verificar disponibilidad (no debe haber otra reserva en el mismo horario)
    console.log(`🔍 Buscando conflictos para: amenidad_id=${amenidad_id}, fecha=${fecha_reserva}, horario=${hora_inicio}-${hora_fin}`);

    const conflictingReservation = await AmenityReservation.findOne({
      where: {
        amenidad_id,
        fecha_reserva,
        estado: ['Pendiente', 'Confirmada'],
        [Op.or]: [
          {
            // La nueva reserva empieza durante una reserva existente
            hora_inicio: { [Op.between]: [hora_inicio, hora_fin] }
          },
          {
            // La nueva reserva termina durante una reserva existente
            hora_fin: { [Op.between]: [hora_inicio, hora_fin] }
          },
          {
            // La nueva reserva envuelve completamente una reserva existente
            [Op.and]: [
              { hora_inicio: { [Op.lte]: hora_inicio } },
              { hora_fin: { [Op.gte]: hora_fin } }
            ]
          },
          {
            // Una reserva existente está dentro del rango de la nueva
            [Op.and]: [
              { hora_inicio: { [Op.gte]: hora_inicio } },
              { hora_fin: { [Op.lte]: hora_fin } }
            ]
          }
        ]
      }
    });

    if (conflictingReservation) {
      console.log('❌ Conflicto de horario encontrado con reserva:', {
        id: conflictingReservation.id,
        fecha_reserva: conflictingReservation.fecha_reserva,
        hora_inicio: conflictingReservation.hora_inicio,
        hora_fin: conflictingReservation.hora_fin,
        estado: conflictingReservation.estado,
        residente_id: conflictingReservation.residente_id
      });
      return res.status(400).json({
        message: 'Ya existe una reserva en este horario. Por favor selecciona otro horario.',
        conflictingReservation: {
          hora_inicio: conflictingReservation.hora_inicio,
          hora_fin: conflictingReservation.hora_fin
        }
      });
    }

    console.log('✅ No se encontraron conflictos de horario');

    console.log('✅ Todas las validaciones pasadas. Creando reserva...');

    // Todas las reservas requieren aprobación del administrador
    const reservation = await AmenityReservation.create({
      amenidad_id,
      residente_id: req.user.id,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      motivo,
      num_personas: num_personas || null,
      estado: 'Pendiente' // Siempre comienza como Pendiente
    });

    console.log('✅ Reserva creada con ID:', reservation.id);

    // Recargar la reserva con las relaciones
    await reservation.reload({
      include: [
        {
          model: Amenity,
          as: 'amenidad',
          attributes: ['id', 'nombre', 'ubicacion', 'tipo']
        },
        {
          model: User,
          as: 'residente',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    console.log('✅ Reserva con detalles cargada correctamente');

    res.status(201).json({
      message: 'Solicitud de reserva creada exitosamente. Pendiente de aprobación del administrador.',
      reservation: reservation
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear reserva', error: error.message });
  }
};

// Aprobar o rechazar reserva (Solo admin)
exports.approveOrRejectReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, motivo_rechazo } = req.body; // accion: 'aprobar' o 'rechazar'

    // Verificar que es admin
    if (req.user.rol !== 'Administrador' && req.user.rol !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Solo los administradores pueden aprobar/rechazar reservas' });
    }

    const reservation = await AmenityReservation.findByPk(id, {
      include: [
        {
          model: Amenity,
          as: 'amenidad',
          attributes: ['id', 'nombre']
        },
        {
          model: User,
          as: 'residente',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reservation.estado !== 'Pendiente') {
      return res.status(400).json({ message: 'Solo se pueden aprobar/rechazar reservas pendientes' });
    }

    let nuevoEstado;
    let mensaje;

    if (accion === 'aprobar') {
      nuevoEstado = 'Confirmada';
      mensaje = 'Reserva aprobada exitosamente';
    } else if (accion === 'rechazar') {
      nuevoEstado = 'Cancelada';
      mensaje = 'Reserva rechazada';

      if (motivo_rechazo) {
        await reservation.update({
          estado: nuevoEstado,
          motivo: motivo_rechazo
        });
      } else {
        await reservation.update({ estado: nuevoEstado });
      }
    } else {
      return res.status(400).json({ message: 'Acción inválida. Use "aprobar" o "rechazar"' });
    }

    if (accion === 'aprobar') {
      await reservation.update({ estado: nuevoEstado });
    }

    const updatedReservation = await AmenityReservation.findByPk(id, {
      include: [
        {
          model: Amenity,
          as: 'amenidad',
          attributes: ['id', 'nombre', 'ubicacion', 'tipo']
        },
        {
          model: User,
          as: 'residente',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    res.json({
      message: mensaje,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error al aprobar/rechazar reserva:', error);
    res.status(500).json({ message: 'Error al procesar reserva', error: error.message });
  }
};

// Actualizar estado de reserva
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const reservation = await AmenityReservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    await reservation.update({ estado });

    const updatedReservation = await AmenityReservation.findByPk(id, {
      include: [
        {
          model: Amenity,
          as: 'amenidad',
          attributes: ['id', 'nombre', 'ubicacion']
        },
        {
          model: User,
          as: 'residente',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    res.json({
      message: 'Estado de reserva actualizado exitosamente',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error al actualizar reserva', error: error.message });
  }
};

// Cancelar reserva
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await AmenityReservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Verificar que el usuario sea el dueño de la reserva o un administrador
    if (reservation.residente_id !== req.user.id && 
        req.user.rol !== 'Administrador' && 
        req.user.rol !== 'SuperAdmin') {
      return res.status(403).json({ message: 'No tienes permiso para cancelar esta reserva' });
    }

    await reservation.update({ estado: 'Cancelada' });

    res.json({
      message: 'Reserva cancelada exitosamente',
      reservation
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ message: 'Error al cancelar reserva', error: error.message });
  }
};

// Obtener reservas disponibles para una fecha
exports.getAvailableSlots = async (req, res) => {
  try {
    const { amenidad_id, fecha_reserva } = req.query;

    if (!amenidad_id || !fecha_reserva) {
      return res.status(400).json({ message: 'amenidad_id y fecha_reserva son requeridos' });
    }

    const reservations = await AmenityReservation.findAll({
      where: {
        amenidad_id,
        fecha_reserva,
        estado: ['Pendiente', 'Confirmada']
      },
      order: [['hora_inicio', 'ASC']]
    });

    res.json({
      amenidad_id,
      fecha_reserva,
      reservedSlots: reservations,
      count: reservations.length
    });
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ message: 'Error al obtener horarios disponibles', error: error.message });
  }
};