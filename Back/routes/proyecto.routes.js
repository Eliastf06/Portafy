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

// Creamos el directorio de uploads si no existe
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
    const { titulo, descripcion, categoria, nom_usuario, fecha_inicio, fecha_finalizacion, para_quien_se_hizo, enlaces_referencia, privacidad } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Se requiere al menos un archivo.' });
    }

    try {
        const newProyecto = await prisma.proyecto.create({
            data: {
                titulo,
                descripcion,
                categoria,
                fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
                fecha_finalizacion: fecha_finalizacion ? new Date(fecha_finalizacion) : null,
                para_quien_se_hizo: para_quien_se_hizo || null,
                enlaces_referencia: enlaces_referencia || null,
                privacidad: privacidad === 'true',
                nom_usuario,
                archivos: {
                    create: files.map(file => ({
                        tipo_archivo: file.mimetype,
                        url: `/uploads/${file.filename}`,
                        nombre: file.originalname, // Se guarda el nombre original
                    })),
                },
            },
            include: {
                archivos: true,
            },
        });
        res.status(201).json(newProyecto);
    } catch (e) {
        console.error('Error al subir proyecto:', e);
        res.status(500).json({ message: 'Error al subir proyecto' });
    }
});

// Obtener todos los proyectos o filtrar por usuario (Tu ruta original)
router.get('/', async (req, res) => {
    const { nom_usuario } = req.query;
    try {
        const proyectos = await prisma.proyecto.findMany({
            where: nom_usuario ? { nom_usuario } : {},
            include: {
                usuario: {
                    select: {
                        nom_usuario: true,
                        nombre: true,
                    },
                },
                archivos: true,
            },
            orderBy: {
                fecha_publi: 'desc',
            },
        });
        res.json(proyectos);
    } catch (e) {
        console.error('Error al obtener proyectos:', e);
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
});

// Obtener proyectos de un usuario por su nombre de usuario (La ruta que soluciona el error 404)
router.get('/usuario/:nom_usuario', async (req, res) => {
    try {
        const { nom_usuario } = req.params;
        const proyectos = await prisma.proyecto.findMany({
            where: {
                nom_usuario: nom_usuario
            },
            include: {
                archivos: true,
            },
        });
        if (proyectos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron proyectos para este usuario' });
        }
        res.json(proyectos);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al obtener los proyectos del usuario', error: e.message });
    }
});

// Ruta para obtener un proyecto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await prisma.proyecto.findUnique({
            where: { id_proyecto: parseInt(id) },
            include: {
                archivos: true,
                usuario: {
                    select: {
                        nom_usuario: true,
                    },
                },
            },
        });
        if (!proyecto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(proyecto);
    } catch (e) {
        console.error('Error al obtener proyecto:', e);
        res.status(500).json({ message: 'Error al obtener proyecto' });
    }
});

// Ruta para actualizar un proyecto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            titulo,
            descripcion,
            categoria,
            fecha_inicio,
            fecha_finalizacion,
            para_quien_se_hizo,
            enlaces_referencia,
            privacidad,
        } = req.body;

        const updatedProyecto = await prisma.proyecto.update({
            where: { id_proyecto: parseInt(id) },
            data: {
                titulo,
                descripcion,
                categoria,
                fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
                fecha_finalizacion: fecha_finalizacion ? new Date(fecha_finalizacion) : null,
                para_quien_se_hizo: para_quien_se_hizo || null,
                enlaces_referencia: enlaces_referencia || null,
                privacidad: privacidad,
            },
        });
        res.json(updatedProyecto);
    } catch (e) {
        console.error('Error al actualizar proyecto:', e);
        res.status(500).json({ message: 'Error al actualizar proyecto' });
    }
});

// Ruta para eliminar un proyecto y sus archivos asociados
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el proyecto y sus archivos
        const proyectoConArchivos = await prisma.proyecto.findUnique({
            where: { id_proyecto: parseInt(id) },
            include: { archivos: true }
        });

        if (!proyectoConArchivos) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Eliminar archivos físicos
        proyectoConArchivos.archivos.forEach(archivo => {
            const filePath = path.join(uploadDir, path.basename(archivo.url));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Eliminar los archivos de la base de datos
        await prisma.archivo.deleteMany({
            where: { id_proyecto: parseInt(id) }
        });

        // Eliminar el proyecto de la base de datos
        await prisma.proyecto.delete({
            where: { id_proyecto: parseInt(id) }
        });

        res.json({ message: 'Proyecto y archivos asociados eliminados' });
    } catch (e) {
        console.error('Error al eliminar proyecto:', e);
        res.status(500).json({ message: 'Error al eliminar proyecto' });
    }
});

export default router;