import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para servir archivos estáticos (multimedia y uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Bienvenido a la API de Portafy" });
});

app.use(routes);

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(chalk.green(`Servidor escuchando en http://localhost:${PORT}`));
});