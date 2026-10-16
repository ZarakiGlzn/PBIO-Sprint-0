-- ============================================================================
-- Fichero: schema.sql
-- Descripción: Script DDL de creación de la tabla relacional de mediciones
-- Copyright: (c) 2026 Sergio García Camacho
-- Fecha: 14/10/2026
-- Autor: Sergio García Camacho
-- Aportación: Esquema SQLite con restricción de concentración no negativa
-- ============================================================================

CREATE TABLE IF NOT EXISTS mediciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valor REAL NOT NULL CHECK(valor >= 0),
    timestamp INTEGER NOT NULL
);
