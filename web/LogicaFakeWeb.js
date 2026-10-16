// ============================================================================
// Fichero: LogicaFakeWeb.js
// Descripción: Proxy y Lógica de Negocio del Cliente (Frontend Business Logic)
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Encapsulación de transporte y memoria Fake con paridad de interfaz
// ============================================================================

/*
                              --------- LogicaFakeWeb -------------
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

class LogicaFakeWeb {
    constructor(urlApi = 'http://localhost:3000/mediciones') {
        this.urlApi = urlApi;
        this.modo = 'fake';

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
    // Recupera mediciones encapsulando fetch o memoria fake.
    // ------------------------------------------------------------------------
    async obtenerTodasMediciones() {
        if (this.modo === 'real') {
            const respuesta = await fetch(this.urlApi);
            if (!respuesta.ok) {
                throw new Error(`Error en el servidor: HTTP ${respuesta.status}`);
            }
            return await respuesta.json();
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.dbLocalFake]);
            }, 1000);
        });
    }

    // ------------------------------------------------------------------------
    // [Medicion] <-- recuperarMediciones() <--
    // Método original del Prompt 5.
    // ------------------------------------------------------------------------
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LogicaFakeWeb, LogicaCliente: LogicaFakeWeb };
}
