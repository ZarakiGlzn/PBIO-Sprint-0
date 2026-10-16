import { BaseDeDatos } from './BaseDeDatos';
import { Medicion } from './types';
export declare class LogicaDeNegocio {
    private db;
    constructor(db: BaseDeDatos);
    procesarNuevaMedicion(valor: number, ts: number): void;
    obtenerTodasMediciones(): Medicion[];
    vaciarMediciones(): void;
}
