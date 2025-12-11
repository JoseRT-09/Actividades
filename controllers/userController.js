const { User } = require('../models');
const { ROLES, ESTADOS_USUARIO } = require('../config/constants');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const { rol, estado, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (rol) where.rol = rol;
    if (estado) where.estado = estado;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_registro', 'DESC']],
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      users: rows
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

// Crear usuario
exports.createUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol: rol || ROLES.RESIDENTE
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        estado: user.estado
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, rol, estado } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({
      nombre: nombre || user.nombre,
      apellido: apellido || user.apellido,
      telefono: telefono || user.telefono,
      rol: rol || user.rol,
      estado: estado || user.estado
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        estado: user.estado
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// Eliminar usuario (soft delete cambiando estado)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ estado: ESTADOS_USUARIO.INACTIVO });

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

// Obtener residentes activos
exports.getActiveResidents = async (req, res) => {
  try {
    const residents = await User.findAll({
      where: {
        rol: ROLES.RESIDENTE,
        estado: ESTADOS_USUARIO.ACTIVO
      },
      attributes: { exclude: ['password'] },
      order: [['nombre', 'ASC']]
    });

    res.json({ residents });
  } catch (error) {
    console.error('Error al obtener residentes:', error);
    res.status(500).json({ message: 'Error al obtener residentes', error: error.message });
  }
};

// Obtener administradores
exports.getAdministrators = async (req, res) => {
  try {
    const administrators = await User.findAll({
      where: {
        rol: [ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN],
        estado: ESTADOS_USUARIO.ACTIVO
      },
      attributes: { exclude: ['password'] },
      order: [['nombre', 'ASC']]
    });

    res.json({ administrators });
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ message: 'Error al obtener administradores', error: error.message });
  }
};