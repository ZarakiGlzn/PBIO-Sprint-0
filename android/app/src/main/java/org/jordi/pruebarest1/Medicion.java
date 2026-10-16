// ============================================================================
// Fichero: Medicion.java
// Descripción: Entidad de dominio Medicion (id, valor, timestamp)
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Representación canónica de mediciones para el cliente móvil
// ============================================================================

package org.jordi.pruebarest1;

/**
 * Entidad central del sistema de biometría.
 * Notación lógica: Medicion = ( id: Z, valor: R, timestamp: N )
 */
public class Medicion {
    private int id;
    private double valor;
    private long timestamp;

    public Medicion(int id, double valor, long timestamp) {
        this.id = id;
        this.valor = valor;
        this.timestamp = timestamp;
    }

    public int getId() {
        return id;
    }

    public double getValor() {
        return valor;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "Medicion{" +
                "id=" + id +
                ", valor=" + valor +
                ", timestamp=" + timestamp +
                '}';
    }
}
