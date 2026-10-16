// ============================================================================
// Fichero: LogicaDeNegocio.ts
// Descripción: Capa de Lógica de Negocio y reglas de dominio del sistema
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Validación estricta de ozono no negativo y desacoplamiento de red
// ============================================================================

import { BaseDeDatos } from '../database/BaseDeDatos';
import { Medicion } from '../database/types';

/*
                              --------- LogicaDeNegocio -----------
                              |
                              | db: BaseDeDatos
                              |
       valor: R, ts: N    --> procesarNuevaMedicion() -->
                              |
                              |
               [Medicion] <-- obtenerTodasMediciones() <--
                              |
                              -------------------------------------
> procesarNuevaMedicion() = Público
> obtenerTodasMediciones() = Público
> db = Privado
*/
export class LogicaDeNegocio {
    private db: BaseDeDatos;

    constructor(db: BaseDeDatos) {
        this.db = db;
    }

    // ------------------------------------------------------------------------
    // valor: R, ts: N --> procesarNuevaMedicion() -->
    // Valida que la medición no sea negativa y delega su almacenamiento en la BD.
    // ------------------------------------------------------------------------
    public procesarNuevaMedicion(valor: number, ts: number): void {
        if (typeof valor !== 'number' || Number.isNaN(valor)) {
            throw new Error('El valor de medición debe ser un número válido.');
        }

        if (valor < 0) {
            throw new Error('El valor de ozono no puede ser negativo.');
        }

        if (typeof ts !== 'number' || Number.isNaN(ts) || ts < 0) {
            throw new Error('El timestamp debe ser un número natural positivo (Unix epoch).');
        }

        this.db.insertarMedicion(valor, ts);
    }

    // ------------------------------------------------------------------------
    // [Medicion] <-- obtenerTodasMediciones() <--
    // Recupera la lista completa de mediciones almacenadas en el sistema.
    // ------------------------------------------------------------------------
    public obtenerTodasMediciones(): Medicion[] {
        return this.db.recuperarMediciones();
    }

    // ------------------------------------------------------------------------
    // --> vaciarMediciones() -->
    // Limpia todo el historial de mediciones delegando en la base de datos.
    // ------------------------------------------------------------------------
    public vaciarMediciones(): void {
        this.db.vaciarMediciones();
    }
}
