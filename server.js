// server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import sequelize from './db.js';

// Importar modelos
import Usuario from './models/usuario.js';
import Proyecto from './models/proyecto.js';
import Archivo from './models/archivo.js';
import Experiencia from './models/experiencia.js';

// Importar rutas de la API
import usuarioRoutes from './routes/usuario.routes.js';
import proyectoRoutes from './routes/proyecto.routes.js';
import archivoRoutes from './routes/archivo.routes.js';
import experienciaRoutes from './routes/experiencia.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos del frontend desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Montar las rutas de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/archivos', archivoRoutes);
app.use('/api/experiencias', experienciaRoutes);

// Ruta para la página principal (frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).send('Lo siento, la ruta especificada no existe.');
});

// Sincronizar modelos con la base de datos y luego iniciar el servidor
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Base de datos sincronizada.');
        app.listen(PORT, () => {
            console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al sincronizar la base de datos:', err);
    });