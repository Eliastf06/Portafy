import express from 'express';
import applyRoutes from './routes/index.js'; // Importa la función centralizadora

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Bienvenido a la API de Gestor de Portafolios WEB" });
});

// Aplica todas las rutas centralizadas
applyRoutes(app);

app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});