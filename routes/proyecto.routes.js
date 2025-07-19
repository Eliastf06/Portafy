import { Router } from 'express';

const router = Router();

// Rutas para la entidad Proyecto
router.get('/', (req, res) => {
    res.json({ message: "Esta es la ruta GET de mi entidad Proyecto (todos los elementos)" });
});

router.post('/', (req, res) => {
    res.json({ message: "Esta es la ruta POST de mi entidad Proyecto (creación)" });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta PUT de mi entidad Proyecto con el ID ${id}` });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta DELETE de mi entidad Proyecto con el ID ${id}` });
});

// Nueva ruta GET dinámica
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta GET de mi entidad Proyecto con el ID ${id}` });
});


export default router;