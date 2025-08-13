import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const archivos = await prisma.archivo.findMany();
        res.json(archivos);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener archivos' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const archivo = await prisma.archivo.findUnique({
            where: { id_archivo: parseInt(id) },
        });
        if (!archivo) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        res.json(archivo);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener archivo' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newArchivo = await prisma.archivo.create({
            data: req.body,
        });
        res.status(201).json(newArchivo);
    } catch (e) {
        res.status(500).json({ message: 'Error al crear archivo' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedArchivo = await prisma.archivo.update({
            where: { id_archivo: parseInt(id) },
            data: req.body,
        });
        res.json(updatedArchivo);
    } catch (e) {
        res.status(500).json({ message: 'Error al actualizar archivo' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.archivo.delete({
            where: { id_archivo: parseInt(id) },
        });
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: 'Error al eliminar archivo' });
    }
});

export default router;