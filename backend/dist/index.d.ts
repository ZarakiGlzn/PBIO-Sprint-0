import { BaseDeDatos } from './BaseDeDatos';
import { LogicaDeNegocio } from './LogicaDeNegocio';
import { ServidorREST } from './ServidorREST';
declare const baseDeDatos: BaseDeDatos;
declare const logica: LogicaDeNegocio;
declare const servidor: ServidorREST;
export { servidor, logica, baseDeDatos };
