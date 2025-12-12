const { ReportComment, Report, User } = require('../models');

// Obtener comentarios de un reporte
exports.getCommentsByReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Verificar que el reporte existe
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Verificar permisos: admin/superadmin o creador del reporte
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';
    const isOwner = report.reportado_por_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para ver estos comentarios' });
    }

    const comments = await ReportComment.findAll({
      where: { report_id: reportId },
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
    const { reportId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'El comentario no puede estar vacío' });
    }

    // Verificar que el reporte exists
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    // Verificar permisos: admin/superadmin o creador del reporte
    const isAdmin = req.user.rol === 'Administrador' || req.user.rol === 'SuperAdmin';
    const isOwner = report.reportado_por_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para comentar en este reporte' });
    }

    const newComment = await ReportComment.create({
      report_id: reportId,
      user_id: req.user.id,
      comment: comment.trim()
    });

    // Obtener el comentario con los datos del usuario
    const commentWithUser = await ReportComment.findByPk(newComment.id, {
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

    const comment = await ReportComment.findByPk(commentId);
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
