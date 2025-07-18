import chalk from 'chalk';
import { format, isPast } from 'date-fns';

console.log("Somos Elias y compañia y este es el trabajo de Node.js para PDI (La mejor materia)");

const integrantes = [
    "Eliastf06 (Franco Elias)",
    "Ferreyra Valentin",
    "Matto Maximo",
    "Licera Julian"
];

integrantes.forEach(nombre => {
    console.log(chalk.green(`Hola, soy ${nombre}`));
});

// Mostrar fecha de hoy
const fechaHoy = new Date();
console.log(chalk.blue(`Fecha de hoy: ${format(fechaHoy, 'dd/MM/yyyy')}`));

// Fecha de entrega de la tarea (ejemplo: 20 de Julio de 2025)
// Ajusta esta fecha según la fecha real de entrega para probar el color
const fechaEntrega = new Date('2025-07-20T23:59:59'); // Año-Mes-Día (Mes es 0-indexado)

if (isPast(fechaEntrega)) {
    console.log(chalk.red(`Fecha de entrega: ${format(fechaEntrega, 'dd/MM/yyyy')} (¡Ya pasó!)`));
} else {
    console.log(chalk.yellow(`Fecha de entrega: ${format(fechaEntrega, 'dd/MM/yyyy')} (¡Todavía hay tiempo!)`));
}