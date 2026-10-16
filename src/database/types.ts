// ============================================================================
// Fichero: types.ts
// Descripción: Definición de tipos y entidades de dominio del sistema
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Entidad Medicion con id, valor y timestamp
// ============================================================================

export interface Medicion {
    id: number;
    valor: number;
    timestamp: number;
}
