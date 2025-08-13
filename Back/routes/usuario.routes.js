import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Ruta de registro
router.post('/register', async (req, res) => {
    const { nom_usuario, nombre, email, contrasena, tipo_usuario, foto_perfil, biografia, red_social } = req.body;

    if (!nom_usuario || !nombre || !email || !contrasena || !tipo_usuario) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const newUser = await prisma.usuario.create({
            data: {
                nom_usuario,
                nombre,
                email,
                contrasena: hashedPassword,
                tipo_usuario,
                foto_perfil,
                biografia,
                red_social,
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

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { email, contrasena } = req.body;
    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        res.status(200).json({ message: 'Inicio de sesión exitoso', user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Rutas restantes para la entidad Usuario
router.get('/', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

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

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedUser = await prisma.usuario.update({
            where: { nom_usuario: id },
            data,
        });
        res.json({ message: 'Usuario actualizado', user: updatedUser });
    } catch (e) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

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