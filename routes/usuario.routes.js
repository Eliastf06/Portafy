// routes/usuario.routes.js
import express from 'express';
const router = express.Router();
import Usuario from '../models/usuario.js';
import Proyecto from '../models/proyecto.js';
import Experiencia from '../models/experiencia.js';

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
    }
});

// Obtener un usuario por nom_usuario
router.get('/:nom_usuario', async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.nom_usuario, {
            include: [
                { model: Proyecto },
                { model: Experiencia }
            ]
        });
        if (usuario) {
            res.status(200).json(usuario);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
    }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    try {
        const nuevoUsuario = await Usuario.create(req.body);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear usuario', error: error.message });
    }
});

// Actualizar un usuario por nom_usuario
router.put('/:nom_usuario', async (req, res) => {
    try {
        const [updated] = await Usuario.update(req.body, {
            where: { nom_usuario: req.params.nom_usuario }
        });
        if (updated) {
            const usuarioActualizado = await Usuario.findByPk(req.params.nom_usuario);
            res.status(200).json(usuarioActualizado);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
    }
});

// Eliminar un usuario por nom_usuario
router.delete('/:nom_usuario', async (req, res) => {
    try {
        const deleted = await Usuario.destroy({
            where: { nom_usuario: req.params.nom_usuario }
        });
        if (deleted) {
            res.status(204).json({ message: 'Usuario eliminado' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
    }
});

export default router;