// routes/experiencia.routes.js
import express from 'express';
const router = express.Router();
import Experiencia from '../models/experiencia.js';
import Usuario from '../models/usuario.js';

// Obtener todas las experiencias laborales
router.get('/', async (req, res) => {
    try {
        const experiencias = await Experiencia.findAll({
            include: [
                { model: Usuario, attributes: ['nom_usuario', 'nombre'] }
            ]
        });
        res.status(200).json(experiencias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener experiencias', error: error.message });
    }
});

// Obtener una experiencia laboral por ID
router.get('/:id', async (req, res) => {
    try {
        const experiencia = await Experiencia.findByPk(req.params.id, {
            include: [
                { model: Usuario, attributes: ['nom_usuario', 'nombre'] }
            ]
        });
        if (experiencia) {
            res.status(200).json(experiencia);
        } else {
            res.status(404).json({ message: 'Experiencia no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener experiencia', error: error.message });
    }
});

// Crear una nueva experiencia laboral
router.post('/', async (req, res) => {
    try {
        const nuevaExperiencia = await Experiencia.create(req.body);
        res.status(201).json(nuevaExperiencia);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear experiencia', error: error.message });
    }
});

// Actualizar una experiencia laboral por ID
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Experiencia.update(req.body, {
            where: { id_exp: req.params.id }
        });
        if (updated) {
            const experienciaActualizada = await Experiencia.findByPk(req.params.id);
            res.status(200).json(experienciaActualizada);
        } else {
            res.status(404).json({ message: 'Experiencia no encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar experiencia', error: error.message });
    }
});

// Eliminar una experiencia laboral por ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Experiencia.destroy({
            where: { id_exp: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Experiencia eliminada' });
        } else {
            res.status(404).json({ message: 'Experiencia no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar experiencia', error: error.message });
    }
});

export default router;