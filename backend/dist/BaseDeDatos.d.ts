import { Medicion } from './types';
export declare class BaseDeDatos {
    private conexion;
    private db;
    constructor(conexion?: string);
    private inicializar;
    insertarMedicion(valor: number, ts: number): void;
    recuperarMediciones(): Medicion[];
    vaciarMediciones(): void;
    cerrar(): void;
}
