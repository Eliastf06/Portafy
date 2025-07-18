import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ message: "Bienvenido a la API de Gestor de Portafolios WEB" });
});

// Rutas para la entidad Proyecto (ejemplo inicial, luego se modularizará)
app.get('/proyectos', (req, res) => {
    res.json({ message: "Esta es la ruta GET de mi entidad Proyecto (todos los elementos)" });
});

app.post('/proyectos', (req, res) => {
    res.json({ message: "Esta es la ruta POST de mi entidad Proyecto (creación)" });
});

app.put('/proyectos', (req, res) => {
    res.json({ message: "Esta es la ruta PUT de mi entidad Proyecto (modificación)" });
});

app.delete('/proyectos', (req, res) => {
    res.json({ message: "Esta es la ruta DELETE de mi entidad Proyecto (eliminación)" });
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});