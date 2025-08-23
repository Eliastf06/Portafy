import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Función de saneamiento para prevenir XSS/Inyección
const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    // Escapa caracteres especiales HTML, etc.
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
};

// Ruta de registro
router.post('/register', async (req, res) => {
    const { nom_usuario, nombre, email, contrasena, tipo_usuario } = req.body;

    // Validación más rigurosa y saneamiento
    if (!nom_usuario || !nombre || !email || !contrasena || !tipo_usuario || 
        nom_usuario.trim() === '' || nombre.trim() === '' || email.trim() === '') {
        return res.status(400).json({ message: 'Faltan campos obligatorios o contienen solo espacios.' });
    }

    try {
        // Saneamiento de los datos de entrada
        const sanitized_nom_usuario = sanitizeInput(nom_usuario.trim());
        const sanitized_nombre = sanitizeInput(nombre.trim());
        const sanitized_email = sanitizeInput(email.trim());

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUser = await prisma.usuario.create({
            data: {
                nom_usuario: sanitized_nom_usuario,
                nombre: sanitized_nombre,
                email: sanitized_email,
                contrasena: hashedPassword,
                tipo_usuario,
            },
        });
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (e) {
        console.error(e);
        if (e.code === 'P2002') {
            res.status(409).json({ message: 'El nombre de usuario o email ya están en uso' });
        } else {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Eliminar la contraseña del objeto de usuario antes de enviarlo al cliente
        const { contrasena: _, ...userWithoutPassword } = usuario;

        res.status(200).json({ message: 'Inicio de sesión exitoso', user: userWithoutPassword });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Obtener un usuario por nom_usuario
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: { nom_usuario: id },
        });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        // Saneamiento de todos los campos que se envían para actualizar
        for (const key in data) {
            if (typeof data[key] === 'string') {
                data[key] = sanitizeInput(data[key]);
            }
        }
        
        const updatedUser = await prisma.usuario.update({
            where: { nom_usuario: id },
            data,
        });
        res.json({ message: 'Usuario actualizado', user: updatedUser });
    } catch (e) {
        console.error(e);
        if (e.code === 'P2025') {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            res.status(500).json({ message: 'Error al actualizar usuario' });
        }
    }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.usuario.delete({
            where: { nom_usuario: id },
        });
        res.json({ message: 'Usuario eliminado' });
    } catch (e) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

export default router;