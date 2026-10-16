-- Script de creación de la tabla de mediciones para SQLite
-- Sprint 0: Proyecto Biometría (Sensor de Ozono)

CREATE TABLE IF NOT EXISTS mediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valor REAL NOT NULL,
    timestamp INTEGER NOT NULL
);
