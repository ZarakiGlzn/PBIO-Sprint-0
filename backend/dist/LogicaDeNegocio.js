"use strict";
// ============================================================================
// Fichero: LogicaDeNegocio.ts
// Descripción: Capa de Lógica de Negocio y reglas de dominio del sistema
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Validación estricta de ozono no negativo y desacoplamiento de red
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicaDeNegocio = void 0;
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
class LogicaDeNegocio {
    db;
    constructor(db) {
        this.db = db;
    }
    // ------------------------------------------------------------------------
    // valor: R, ts: N --> procesarNuevaMedicion() -->
    // Valida que la medición no sea negativa y delega su almacenamiento en la BD.
    // ------------------------------------------------------------------------
    procesarNuevaMedicion(valor, ts) {
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
    obtenerTodasMediciones() {
        return this.db.recuperarMediciones();
    }
    // ------------------------------------------------------------------------
    // --> vaciarMediciones() -->
    // Limpia todo el historial de mediciones delegando en la base de datos.
    // ------------------------------------------------------------------------
    vaciarMediciones() {
        this.db.vaciarMediciones();
    }
}
exports.LogicaDeNegocio = LogicaDeNegocio;
