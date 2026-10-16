// ============================================================================
// Fichero: LogicaCliente.js
// Descripción: Proxy y Lógica de Negocio del Cliente (Frontend Business Logic)
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Encapsulación de transporte y memoria Fake con paridad de interfaz
// ============================================================================

/*
                              --------- LogicaCliente -------------
                              |
                              | urlApi: Text
                              | dbLocalFake: [Medicion]
                              | modo: Text
                              |
               [Medicion] <-- obtenerTodasMediciones() <--
                              |
                              -------------------------------------
> obtenerTodasMediciones() = Público
> urlApi, dbLocalFake, modo = Privados
*/

class LogicaCliente {
    constructor(urlApi = 'http://localhost:3000/mediciones') {
        this.urlApi = urlApi;
        this.modo = 'fake'; // 'fake' o 'real'

        // Array en memoria con registros iniciales de ozono para el modo Fake
        this.dbLocalFake = [
            { id: 1, valor: 24.5, timestamp: 1712850000 },
            { id: 2, valor: 31.2, timestamp: 1712850060 },
            { id: 3, valor: 45.8, timestamp: 1712850120 },
            { id: 4, valor: 28.0, timestamp: 1712850180 }
        ];
    }

    publicarModo(nuevoModo) {
        this.modo = nuevoModo;
    }

    obtenerModo() {
        return this.modo;
    }

    // ------------------------------------------------------------------------
    // [Medicion] <-- obtenerTodasMediciones() <--
    // Recupera la colección de mediciones de dominio.
    // Encapsula la llamada fetch HTTP al backend o la resolución desde memoria fake.
    // ------------------------------------------------------------------------
    async obtenerTodasMediciones() {
        if (this.modo === 'real') {
            const respuesta = await fetch(this.urlApi);
            if (!respuesta.ok) {
                throw new Error(`Error en el servidor: HTTP ${respuesta.status}`);
            }
            return await respuesta.json();
        }

        // Modo Fake: simula latencia de red de 1000ms antes de resolver
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.dbLocalFake]);
            }, 1000);
        });
    }

    // Alias compatible con el requerimiento inicial del Prompt 5
    async recuperarMediciones() {
        return this.obtenerTodasMediciones();
    }

    // ------------------------------------------------------------------------
    // --> limpiarMediciones() -->
    // Vacia el historial de mediciones en memoria fake o mediante DELETE en servidor real.
    // ------------------------------------------------------------------------
    async limpiarMediciones() {
        if (this.modo === 'real') {
            const respuesta = await fetch(this.urlApi, { method: 'DELETE' });
            if (!respuesta.ok) {
                throw new Error(`El servidor respondió con HTTP ${respuesta.status}. ¿Reiniciaste el backend con 'node dist/index.js'?`);
            }
        } else {
            this.dbLocalFake = [];
        }
        return [];
    }
}

// Soporte para entornos Node.js / Jest y navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogicaCliente, LogicaFakeWeb: LogicaCliente };
}
