import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Crear o actualizar datos de perfil
router.put('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const bodyData = req.body;
        
        // Creamos un objeto de datos de actualización solo con los campos que tienen un valor
        const dataToUpdate = {};
        for (const key in bodyData) {
            if (bodyData[key] !== null && bodyData[key] !== undefined) {
                dataToUpdate[key] = bodyData[key];
            }
        }

        // Si no hay datos para actualizar, no hacemos nada
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(200).json({ message: 'No hay datos para actualizar', datosPerfil: null });
        }

        const updatedDatosPerfil = await prisma.datosPerfil.upsert({
            where: { nom_usuario: username },
            update: dataToUpdate,
            create: { ...dataToUpdate, nom_usuario: username },
        });

        res.json({ message: 'Datos de perfil actualizados', datosPerfil: updatedDatosPerfil });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al actualizar los datos de perfil' });
    }
});

// Obtener datos de perfil por nombre de usuario
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const datosPerfil = await prisma.datosPerfil.findUnique({
            where: { nom_usuario: username },
        });
        if (!datosPerfil) {
            return res.status(404).json({ message: 'Datos de perfil no encontrados' });
        }
        res.json(datosPerfil);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error al obtener los datos de perfil' });
    }
});

export default router;