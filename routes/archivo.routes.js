import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /archivos => Devuelve todos los archivos
router.get('/', async (req, res) => {
    try {
        const archivos = await prisma.archivo.findMany({
            include: { proyecto: true }
        });
        res.json(archivos);
    } catch (error) {
        console.error("Error al obtener archivos:", error);
        res.status(500).json({ message: "Error al obtener archivos", error: error.message });
    }
});

// GET /archivos/:id => Devuelve un solo archivo por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const archivo = await prisma.archivo.findUnique({
            where: { id_archivo: parseInt(id) },
            include: { proyecto: true }
        });
        if (archivo) {
            res.json(archivo);
        } else {
            res.status(404).json({ message: "Archivo no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener archivo por ID:", error);
        res.status(500).json({ message: "Error al obtener archivo", error: error.message });
    }
});

// POST /archivos => Crea un nuevo archivo
router.post('/', async (req, res) => {
    try {
        const { id_proyecto, tipo_archivo, url } = req.body;
        if (!id_proyecto || !tipo_archivo || !url) {
            return res.status(400).json({ message: "Los campos id_proyecto, tipo_archivo y url son requeridos." });
        }

        const proyectoExistente = await prisma.proyecto.findUnique({
            where: { id_proyecto: parseInt(id_proyecto) }
        });
        if (!proyectoExistente) {
            return res.status(404).json({ message: `Proyecto con ID '${id_proyecto}' no encontrado.` });
        }

        const nuevoArchivo = await prisma.archivo.create({
            data: {
                id_proyecto: parseInt(id_proyecto),
                tipo_archivo,
                url,
            },
        });
        res.status(201).json(nuevoArchivo);
    } catch (error) {
        console.error("Error al crear archivo:", error);
        res.status(500).json({ message: "Error al crear archivo", error: error.message });
    }
});

// PUT /archivos/:id => Modifica un archivo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_proyecto, tipo_archivo, url } = req.body;

        const archivoActualizado = await prisma.archivo.update({
            where: { id_archivo: parseInt(id) },
            data: {
                id_proyecto: id_proyecto ? parseInt(id_proyecto) : undefined,
                tipo_archivo,
                url,
            },
        });
        res.json(archivoActualizado);
    } catch (error) {
        console.error("Error al actualizar archivo:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Archivo no encontrado para actualizar" });
        } else {
            res.status(500).json({ message: "Error al actualizar archivo", error: error.message });
        }
    }
});

// DELETE /archivos/:id => Elimina un archivo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.archivo.delete({
            where: { id_archivo: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar archivo:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Archivo no encontrado para eliminar" });
        } else {
            res.status(500).json({ message: "Error al eliminar archivo", error: error.message });
        }
    }
});

export default router;