import { Router } from 'express';

const router = Router();

// Rutas para la entidad Experiencia Laboral (Exp.Lbl)
router.get('/', (req, res) => {
    res.json({ message: "Esta es la ruta GET de mi entidad Experiencia Laboral (todos los elementos)" });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta GET de mi entidad Experiencia Laboral con el ID ${id}` });
});

router.post('/', (req, res) => {
    res.json({ message: "Esta es la ruta POST de mi entidad Experiencia Laboral (creación)" });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta PUT de mi entidad Experiencia Laboral con el ID ${id}` });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    res.json({ message: `Esta es la ruta DELETE de mi entidad Experiencia Laboral con el ID ${id}` });
});

export default router;