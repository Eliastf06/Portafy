import proyectoRoutes from './proyecto.routes.js';
import experienciaRoutes from './experiencia.routes.js';
import archivoRoutes from './archivo.routes.js'; // Adelantamos la tercera entidad
import usuarioRoutes from './usuario.routes.js'; // Adelantamos la cuarta entidad

const applyRoutes = (app) => {
    app.use('/proyectos', proyectoRoutes);
    app.use('/experiencias', experienciaRoutes);
    app.use('/archivos', archivoRoutes);
    app.use('/usuarios', usuarioRoutes); // Asumiendo que también habrá una ruta para usuarios
};

export default applyRoutes;