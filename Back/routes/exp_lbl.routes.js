import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const experiencias = await prisma.exp_Lbl.findMany();
        res.json(experiencias);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener experiencias' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const experiencia = await prisma.exp_Lbl.findUnique({
            where: { id_exp: parseInt(id) },
        });
        if (!experiencia) {
            return res.status(404).json({ message: 'Experiencia laboral no encontrada' });
        }
        res.json(experiencia);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener experiencia laboral' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newExperiencia = await prisma.exp_Lbl.create({
            data: req.body,
        });
        res.status(201).json(newExperiencia);
    } catch (e) {
        res.status(500).json({ message: 'Error al crear experiencia laboral' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExperiencia = await prisma.exp_Lbl.update({
            where: { id_exp: parseInt(id) },
            data: req.body,
        });
        res.json(updatedExperiencia);
    } catch (e) {
        res.status(500).json({ message: 'Error al actualizar experiencia laboral' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.exp_Lbl.delete({
            where: { id_exp: parseInt(id) },
        });
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: 'Error al eliminar experiencia laboral' });
    }
});

export default router;