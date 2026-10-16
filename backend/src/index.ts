import path from 'path';
import { BaseDeDatos } from './BaseDeDatos';
import { LogicaDeNegocio } from './LogicaDeNegocio';
import { ServidorREST } from './ServidorREST';

const PUERTO = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../mediciones.db');

// Ensamblado del sistema siguiendo Clean Architecture e Inyección de Dependencias
const baseDeDatos = new BaseDeDatos(DB_PATH);
const logica = new LogicaDeNegocio(baseDeDatos);
const servidor = new ServidorREST(logica, PUERTO);

servidor.iniciar().catch((err) => {
    console.error('Error al iniciar el servidor REST:', err);
});

export { servidor, logica, baseDeDatos };
