// db.js
import { Sequelize } from 'sequelize';

// Configura tu conexión a la base de datos
const sequelize = new Sequelize('portafy_db', 'root', 'noviembre2116', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

export default sequelize;