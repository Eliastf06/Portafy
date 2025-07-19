import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: {
                proyectos: true,
                experiencias: true
            }
        });
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
    }
});

router.get('/:nom_usuario', async (req, res) => {
    try {
        const { nom_usuario } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: { nom_usuario: nom_usuario },
            include: {
                proyectos: true,
                experiencias: true
            }
        });
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener usuario por nom_usuario:", error);
        res.status(500).json({ message: "Error al obtener usuario", error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nom_usuario, nombre, email, contrasenia, tipo_usuario, foto_perfil, biografia, red_social } = req.body;
        if (!nom_usuario || !nombre || !email || !contrasenia || !tipo_usuario) {
            return res.status(400).json({ message: "Los campos nom_usuario, nombre, email, contrasenia y tipo_usuario son requeridos." });
        }
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nom_usuario,
                nombre,
                email,
                contrasenia,
                tipo_usuario,
                foto_perfil,
                biografia,
                red_social,
            },
        });
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: "El nom_usuario o email ya existen." });
        } else {
            res.status(500).json({ message: "Error al crear usuario", error: error.message });
        }
    }
});

router.put('/:nom_usuario', async (req, res) => {
    try {
        const { nom_usuario } = req.params;
        const { nombre, email, contrasenia, tipo_usuario, foto_perfil, biografia, red_social } = req.body;

        const usuarioActualizado = await prisma.usuario.update({
            where: { nom_usuario: nom_usuario },
            data: { nombre, email, contrasenia, tipo_usuario, foto_perfil, biografia, red_social },
        });
        res.json(usuarioActualizado);
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Usuario no encontrado para actualizar" });
        } else if (error.code === 'P2002') {
            res.status(409).json({ message: "El email ya está en uso por otro usuario." });
        } else {
            res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
        }
    }
});

router.delete('/:nom_usuario', async (req, res) => {
    try {
        const { nom_usuario } = req.params;
        await prisma.usuario.delete({
            where: { nom_usuario: nom_usuario },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: "Usuario no encontrado para eliminar" });
        } else if (error.code === 'P2003') {
            res.status(409).json({ message: "No se puede eliminar el usuario porque tiene proyectos o experiencias asociados. Elimina primero los elementos relacionados." });
        }
        else {
            res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
        }
    }
});

export default router;