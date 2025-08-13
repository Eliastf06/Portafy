import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();
const prisma = new PrismaClient();

// Configuración de multer para el almacenamiento de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crea el directorio de uploads si no existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: storage });

// Ruta para subir proyectos con archivos
router.post('/', upload.array('archivos'), async (req, res) => {
    const { titulo, descripcion, categoria, nom_usuario } = req.body;
    const files = req.files;

    if (!titulo || !descripcion || !categoria || !nom_usuario || !files || files.length === 0) {
        return res.status(400).json({ message: 'Faltan campos obligatorios o archivos' });
    }

    try {
        const userExists = await prisma.usuario.findUnique({
            where: { nom_usuario: nom_usuario }
        });

        if (!userExists) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        const newProject = await prisma.proyecto.create({
            data: {
                titulo,
                descripcion,
                categoria,
                nom_usuario,
                archivos: {
                    create: files.map(file => ({
                        tipo_archivo: file.mimetype,
                        url: `/uploads/${file.filename}`,
                    }))
                }
            },
            include: {
                archivos: true,
            }
        });
        res.status(201).json({ message: 'Proyecto subido exitosamente', proyecto: newProject });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor al subir el proyecto' });
    }
});

// Rutas para obtener, actualizar y eliminar proyectos
router.get('/', async (req, res) => {
    const { nom_usuario } = req.query;
    try {
        if (nom_usuario) {
            const proyectos = await prisma.proyecto.findMany({
                where: { nom_usuario },
                include: { archivos: true }
            });
            return res.json(proyectos);
        }
        const proyectos = await prisma.proyecto.findMany({
            include: { archivos: true }
        });
        res.json(proyectos);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await prisma.proyecto.findUnique({
            where: { id_proyecto: parseInt(id) },
            include: { archivos: true }
        });
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener proyecto' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProyecto = await prisma.proyecto.update({
            where: { id_proyecto: parseInt(id) },
            data: req.body,
        });
        res.json(updatedProyecto);
    } catch (e) {
        res.status(500).json({ message: 'Error al actualizar proyecto' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.proyecto.delete({
            where: { id_proyecto: parseInt(id) },
        });
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: 'Error al eliminar proyecto' });
    }
});

export default router;
