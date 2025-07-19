import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const experiencias = await prisma.expLbl.findMany({
            include: { usuario: true }
        });
        res.json(experiencias);
    } catch (error) {
        console.error("Error al obtener experiencias laborales:", error);
        res.status(500).json({ message: "Error al obtener experiencias laborales", error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const experiencia = await prisma.expLbl.findUnique({
            where: { id_exp: parseInt(id) },
            include: { usuario: true }
        });
        if (experiencia) {
            res.json(experiencia);
        } else {
            res.status(404).json({ message: "Experiencia Laboral no encontrada" });
        }
    } catch (error) {
        console.error("Error al obtener experiencia laboral por ID:", error);
        res.status(500).json({ message: "Error al obtener experiencia laboral", error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nom_usuario, empresa, cargo, fecha_inicio, fecha_salida } = req.body;
        if (!nom_usuario || !empresa || !cargo || !fecha_inicio || !fecha_salida) {
            return res.status(400).json({ message: "Todos los campos son requeridos para la experiencia laboral." });
        }

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { nom_usuario: nom_usuario }
        });
        if (!usuarioExistente) {
            return res.status(404).json({ message: `Usuario con nom_usuario '${nom_usuario}' no encontrado.` });
        }

        const nuevaExperiencia = await prisma.expLbl.create({
            data: {
                nom_usuario,
                empresa,
                cargo,
                fecha_inicio: new Date(fecha_inicio),
                fecha_salida: new Date(fecha_salida),
            },
        });
        res.status(201).json(nuevaExperiencia);
    } catch (error) {
        console.error("Error al crear experiencia laboral:", error);
        res.status(500).json({ message: "Error al crear experiencia laboral", error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom_usuario, empresa, cargo, fecha_inicio, fecha_salida } = req.body;

        const experienciaActualizada = await prisma.expLbl.update({
            where: { id_exp: parseInt(id) },
            data: {
                nom_usuario,
                empresa,
                cargo,
                fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : undefined,
                fecha_salida: fecha_salida ? new Date(fecha_salida) : undefined,
            },
        });
        res.json(experienciaActualizada);
    } catch (error) {
        console.error("Error al actualizar experiencia laboral:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Experiencia Laboral no encontrada para actualizar" });
        } else {
            res.status(500).json({ message: "Error al actualizar experiencia laboral", error: error.message });
        }
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expLbl.delete({
            where: { id_exp: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar experiencia laboral:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Experiencia Laboral no encontrada para eliminar" });
        } else {
            res.status(500).json({ message: "Error al eliminar experiencia laboral", error: error.message });
        }
    }
});

export default router;