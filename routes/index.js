import proyectoRoutes from './proyecto.routes.js';
import experienciaRoutes from './experiencia.routes.js';
import archivoRoutes from './archivo.routes.js';
import usuarioRoutes from './usuario.routes.js';

const applyRoutes = (app) => {
    app.use('/proyectos', proyectoRoutes);
    app.use('/experiencias', experienciaRoutes);
    app.use('/archivos', archivoRoutes);
    app.use('/usuarios', usuarioRoutes);
};

export default applyRoutes;