// routes/proyecto.routes.js
import express from 'express';
const router = express.Router();
import Proyecto from '../models/proyecto.js';
import Usuario from '../models/usuario.js';
import Archivo from '../models/archivo.js';

// Obtener todos los proyectos
router.get('/', async (req, res) => {
    try {
        const proyectos = await Proyecto.findAll({
            include: [
                { model: Usuario, attributes: ['nom_usuario', 'nombre'] }
            ]
        });
        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyectos', error: error.message });
    }
});

// Obtener un proyecto por ID
router.get('/:id', async (req, res) => {
    try {
        const proyecto = await Proyecto.findByPk(req.params.id, {
            include: [
                { model: Usuario, attributes: ['nom_usuario', 'nombre'] },
                { model: Archivo }
            ]
        });
        if (proyecto) {
            res.status(200).json(proyecto);
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyecto', error: error.message });
    }
});

// Crear un nuevo proyecto
router.post('/', async (req, res) => {
    try {
        const nuevoProyecto = await Proyecto.create(req.body);
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear proyecto', error: error.message });
    }
});

// Actualizar un proyecto por ID
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Proyecto.update(req.body, {
            where: { id_proyecto: req.params.id }
        });
        if (updated) {
            const proyectoActualizado = await Proyecto.findByPk(req.params.id);
            res.status(200).json(proyectoActualizado);
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar proyecto', error: error.message });
    }
});

// Eliminar un proyecto por ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Proyecto.destroy({
            where: { id_proyecto: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Proyecto eliminado' });
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar proyecto', error: error.message });
    }
});

export default router;