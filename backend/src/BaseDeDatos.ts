// ============================================================================
// Fichero: BaseDeDatos.ts
// Descripción: Clase adaptadora para la gestión de persistencia con SQLite
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Adaptador nativo node:sqlite con sentencias preparadas y tipos abstractos
// ============================================================================

import { DatabaseSync } from 'node:sqlite';
import { Medicion } from './types';

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
export class BaseDeDatos {
    private conexion: string;
    private db: DatabaseSync;

    constructor(conexion: string = ':memory:') {
        this.conexion = conexion;
        this.db = new DatabaseSync(this.conexion);
        this.inicializar();
    }

    private inicializar(): void {
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
    public insertarMedicion(valor: number, ts: number): void {
        const stmt = this.db.prepare('INSERT INTO mediciones (valor, timestamp) VALUES (?, ?)');
        stmt.run(valor, ts);
    }

    // ------------------------------------------------------------------------
    // [Medicion] <-- recuperarMediciones() <--
    // Recupera todas las mediciones de ozono ordenadas por su identificador.
    // ------------------------------------------------------------------------
    public recuperarMediciones(): Medicion[] {
        const stmt = this.db.prepare('SELECT id, valor, timestamp FROM mediciones ORDER BY id ASC');
        return stmt.all() as unknown as Medicion[];
    }

    // ------------------------------------------------------------------------
    // --> vaciarMediciones() -->
    // Elimina todas las mediciones almacenadas para reiniciar el historial.
    // ------------------------------------------------------------------------
    public vaciarMediciones(): void {
        this.db.exec('DELETE FROM mediciones');
    }

    // ------------------------------------------------------------------------
    // --> cerrar() -->
    // Cierra la conexión activa con la base de datos.
    // ------------------------------------------------------------------------
    public cerrar(): void {
        this.db.close();
    }
}
