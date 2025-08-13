import { Router } from 'express';
import usuarioRoutes from './usuario.routes.js';
import proyectoRoutes from './proyecto.routes.js';
import expLblRoutes from './exp_lbl.routes.js';
import archivoRoutes from './archivo.routes.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/proyectos', proyectoRoutes);
router.use('/experiencias', expLblRoutes);
router.use('/archivos', archivoRoutes);

export default router;