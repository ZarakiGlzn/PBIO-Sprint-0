"use strict";
// ============================================================================
// Fichero: BaseDeDatos.ts
// Descripción: Clase adaptadora para la gestión de persistencia con SQLite
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Adaptador nativo node:sqlite con sentencias preparadas y tipos abstractos
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDeDatos = void 0;
const node_sqlite_1 = require("node:sqlite");
/*
                              --------- BaseDeDatos ----------------
                              |
                              | conexion: Text
                              |
       valor: R, ts: N    --> insertarMedicion() -->
                              |
                              |
               [Medicion] <-- recuperarMediciones() <--
                              |
                              --------------------------------------
> insertarMedicion() = Público
> recuperarMediciones() = Público
> conexion = Privado
*/
class BaseDeDatos {
    conexion;
    db;
    constructor(conexion = ':memory:') {
        this.conexion = conexion;
        this.db = new node_sqlite_1.DatabaseSync(this.conexion);
        this.inicializar();
    }
    inicializar() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS mediciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                valor REAL NOT NULL,
                timestamp INTEGER NOT NULL
            );
        `);
    }
    // ------------------------------------------------------------------------
    // valor: R, ts: N --> insertarMedicion() -->
    // Inserta una nueva medición de ozono en la base de datos relacional SQLite.
    // ------------------------------------------------------------------------
    insertarMedicion(valor, ts) {
        const stmt = this.db.prepare('INSERT INTO mediciones (valor, timestamp) VALUES (?, ?)');
        stmt.run(valor, ts);
    }
    // ------------------------------------------------------------------------
    // [Medicion] <-- recuperarMediciones() <--
    // Recupera todas las mediciones de ozono ordenadas por su identificador.
    // ------------------------------------------------------------------------
    recuperarMediciones() {
        const stmt = this.db.prepare('SELECT id, valor, timestamp FROM mediciones ORDER BY id ASC');
        return stmt.all();
    }
    // ------------------------------------------------------------------------
    // --> vaciarMediciones() -->
    // Elimina todas las mediciones almacenadas para reiniciar el historial.
    // ------------------------------------------------------------------------
    vaciarMediciones() {
        this.db.exec('DELETE FROM mediciones');
    }
    // ------------------------------------------------------------------------
    // --> cerrar() -->
    // Cierra la conexión activa con la base de datos.
    // ------------------------------------------------------------------------
    cerrar() {
        this.db.close();
    }
}
exports.BaseDeDatos = BaseDeDatos;
