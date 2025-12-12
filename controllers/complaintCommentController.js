const { ComplaintComment, Complaint, User } = require('../models');

// Obtener comentarios de una queja
exports.getCommentsByComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Verificar que la queja existe
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }

    // Verificar permisos: admin/superadmin o creador de la queja
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';
    const isOwner = complaint.usuario_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para ver estos comentarios' });
    }

    const comments = await ComplaintComment.findAll({
      where: { complaint_id: complaintId },
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ comments });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
  }
};

// Crear un comentario
exports.createComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    // Verificar que la queja existe
    const complaint = await Complaint.findByPk(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Queja no encontrada' });
    }

    // Verificar permisos: admin/superadmin o creador de la queja
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';
    const isOwner = complaint.usuario_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para comentar en esta queja' });
    }

    const newComment = await ComplaintComment.create({
      complaint_id: complaintId,
      user_id: req.user.id,
      comment: comment.trim()
    });

    // Obtener el comentario con los datos del usuario
    const commentWithUser = await ComplaintComment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
        }
      ]
    });

    res.status(201).json({
      message: 'Comentario agregado exitosamente',
      comment: commentWithUser
    });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ message: 'Error al crear comentario', error: error.message });
  }
};

// Eliminar un comentario (solo el autor o admin)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await ComplaintComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }

    // Solo el autor del comentario o un admin puede eliminarlo
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';
    const isAuthor = comment.user_id === req.user.id;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
    }

    await comment.destroy();
    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
  }
};
