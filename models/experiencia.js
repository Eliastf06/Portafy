// models/experiencia.js
import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Usuario from './usuario.js';

const Experiencia = sequelize.define('Exp_Lbl', {
    id_exp: {
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
    empresa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_salida: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    tableName: 'Exp_Lbls',
    timestamps: false
});

// Definir la relación (Un usuario puede tener muchas experiencias laborales)
Usuario.hasMany(Experiencia, { foreignKey: 'nom_usuario' });
Experiencia.belongsTo(Usuario, { foreignKey: 'nom_usuario' });

export default Experiencia;