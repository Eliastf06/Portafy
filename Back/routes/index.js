import { Router } from 'express';
import usuarioRoutes from './usuario.routes.js';
import proyectoRoutes from './proyecto.routes.js';
import archivoRoutes from './archivo.routes.js';
import datosPerfilRoutes from './datosPerfil.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/proyectos', proyectoRoutes);
router.use('/archivos', archivoRoutes);
router.use('/datosPerfil', datosPerfilRoutes);
router.use('/upload', uploadRoutes);

export default router;