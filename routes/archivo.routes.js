// routes/archivo.routes.js
import express from 'express';
const router = express.Router();
import Archivo from '../models/archivo.js';
import Proyecto from '../models/proyecto.js';

// Obtener todos los archivos
router.get('/', async (req, res) => {
    try {
        const archivos = await Archivo.findAll({
            include: [
                { model: Proyecto, attributes: ['id_proyecto', 'titulo'] }
            ]
        });
        res.status(200).json(archivos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener archivos', error: error.message });
    }
});

// Obtener un archivo por ID
router.get('/:id', async (req, res) => {
    try {
        const archivo = await Archivo.findByPk(req.params.id, {
            include: [
                { model: Proyecto, attributes: ['id_proyecto', 'titulo'] }
            ]
        });
        if (archivo) {
            res.status(200).json(archivo);
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener archivo', error: error.message });
    }
});

// Crear un nuevo archivo
router.post('/', async (req, res) => {
    try {
        const nuevoArchivo = await Archivo.create(req.body);
        res.status(201).json(nuevoArchivo);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear archivo', error: error.message });
    }
});

// Actualizar un archivo por ID
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Archivo.update(req.body, {
            where: { id_archivo: req.params.id }
        });
        if (updated) {
            const archivoActualizado = await Archivo.findByPk(req.params.id);
            res.status(200).json(archivoActualizado);
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar archivo', error: error.message });
    }
});

// Eliminar un archivo por ID
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Archivo.destroy({
            where: { id_archivo: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Archivo eliminado' });
        } else {
            res.status(404).json({ message: 'Archivo no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar archivo', error: error.message });
    }
});

export default router;