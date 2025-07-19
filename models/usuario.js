// models/usuario.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Usuario = sequelize.define('Usuario', {
    nom_usuario: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contrasenia: { // En una app real, esto debería estar hasheado
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo_usuario: {
        type: DataTypes.ENUM('programador', 'visual'),
        allowNull: false
    },
    foto_perfil: {
        type: DataTypes.STRING, // URL a la imagen
        allowNull: true
    },
    biografia: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    red_social: {
        type: DataTypes.STRING, // URL a la red social
        allowNull: true
    }
}, {
    tableName: 'Usuarios',
    timestamps: false
});

export default Usuario;