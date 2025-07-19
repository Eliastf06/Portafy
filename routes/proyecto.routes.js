import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const { nom_usuario } = req.query;
        let proyectos;
        if (nom_usuario) {
            proyectos = await prisma.proyecto.findMany({
                where: { nom_usuario: nom_usuario },
                include: { usuario: true, archivos: true }
            });
        } else {
            proyectos = await prisma.proyecto.findMany({
                include: { usuario: true, archivos: true }
            });
        }
        res.json(proyectos);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ message: "Error al obtener proyectos", error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await prisma.proyecto.findUnique({
            where: { id_proyecto: parseInt(id) },
            include: { usuario: true, archivos: true }
        });
        if (proyecto) {
            res.json(proyecto);
        } else {
            res.status(404).json({ message: "Proyecto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener proyecto por ID:", error);
        res.status(500).json({ message: "Error al obtener proyecto", error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nom_usuario, titulo, descripcion, categoria } = req.body;
        if (!nom_usuario || !titulo) {
            return res.status(400).json({ message: "El nom_usuario y el titulo son requeridos." });
        }

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { nom_usuario: nom_usuario }
        });

        if (!usuarioExistente) {
            return res.status(404).json({ message: `Usuario con nom_usuario '${nom_usuario}' no encontrado. No se puede crear el proyecto.` });
        }

        const nuevoProyecto = await prisma.proyecto.create({
            data: {
                nom_usuario,
                titulo,
                descripcion,
                categoria,
            },
        });
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        console.error("Error al crear proyecto:", error);
        res.status(500).json({ message: "Error al crear proyecto", error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_usuario, titulo, descripcion, categoria } = req.body;

        const proyectoActualizado = await prisma.proyecto.update({
            where: { id_proyecto: parseInt(id) },
            data: { nom_usuario, titulo, descripcion, categoria },
        });
        res.json(proyectoActualizado);
    } catch (error) {
        console.error("Error al actualizar proyecto:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Proyecto no encontrado para actualizar" });
        } else {
            res.status(500).json({ message: "Error al actualizar proyecto", error: error.message });
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proyecto.delete({
            where: { id_proyecto: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Proyecto no encontrado para eliminar" });
        } else {
            res.status(500).json({ message: "Error al eliminar proyecto", error: error.message });
        }
    }
});

export default router;