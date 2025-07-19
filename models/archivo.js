// models/archivo.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Proyecto from './proyecto.js';

const Archivo = sequelize.define('Archivo', {
    id_archivo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_proyecto: { // Clave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Proyecto,
            key: 'id_proyecto'
        }
    },
    tipo_archivo: {
        type: DataTypes.STRING, // ej. 'imagen', 'video', 'documento'
        allowNull: false
    },
    url: {
        type: DataTypes.STRING, // URL del archivo
        allowNull: false,
        validate: {
            isUrl: true
        }
    }
}, {
    tableName: 'Archivos',
    timestamps: false
});

// Definir la relación (Un proyecto puede tener muchos archivos)
Proyecto.hasMany(Archivo, { foreignKey: 'id_proyecto' });
Archivo.belongsTo(Proyecto, { foreignKey: 'id_proyecto' });

export default Archivo;