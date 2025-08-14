import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
    dest: path.join(__dirname, '../uploads')
});

router.post('/profile-photo', upload.single('profilePhoto'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ message: 'Archivo subido exitosamente', filePath });
});

export default router;