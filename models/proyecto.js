// models/proyecto.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Usuario from './usuario.js';

const Proyecto = sequelize.define('Proyecto', {
    id_proyecto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom_usuario: { // Clave foránea
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'nom_usuario'
        }
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_publi: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Proyectos',
    timestamps: false
});

// Definir la relación (Un usuario puede tener muchos proyectos)
Usuario.hasMany(Proyecto, { foreignKey: 'nom_usuario' });
Proyecto.belongsTo(Usuario, { foreignKey: 'nom_usuario' });

export default Proyecto;