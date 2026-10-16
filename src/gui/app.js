// ============================================================================
// Fichero: app.js
// Descripción: Controlador de la Interfaz Gráfica de Usuario (GUI)
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Desacoplamiento total de transporte, renderizado reactivo del DOM
// ============================================================================

/*
                              --------- InterfazGraficaWeb --------
                              |
                              | clienteLogica: LogicaCliente
                              |
                           --> actualizarTablaDOM() -->
                              |
                              -------------------------------------
> actualizarTablaDOM() = Público
> clienteLogica = Privado
*/

let LogicaClienteClass;
if (typeof require !== 'undefined') {
    try {
        LogicaClienteClass = require('../frontend_business_logic/LogicaCliente').LogicaCliente;
    } catch (e) {
        // Ignorar si se ejecuta en navegador
    }
}
if (!LogicaClienteClass && typeof LogicaCliente !== 'undefined') {
    LogicaClienteClass = LogicaCliente;
}
if (!LogicaClienteClass && typeof LogicaFakeWeb !== 'undefined') {
    LogicaClienteClass = LogicaFakeWeb;
}

class InterfazGraficaWeb {
    constructor(clienteLogica, ordenDescendente = false) {
        this.clienteLogica = clienteLogica || new LogicaClienteClass();
        this.ordenDescendente = ordenDescendente;
    }

    // ------------------------------------------------------------------------
    // --> actualizarTablaDOM() -->
    // Recupera las mediciones exclusivamente a través del proxy de lógica de negocio
    // del cliente e inyecta las filas dinámicas en el elemento <tbody> del DOM.
    // La GUI no realiza ninguna llamada de comunicación de red directa.
    // ------------------------------------------------------------------------
    async actualizarTablaDOM() {
        const estadoCarga = document.getElementById('estado-carga');
        const modoActual = this.clienteLogica.obtenerModo ? this.clienteLogica.obtenerModo() : 'fake';

        if (estadoCarga) {
            estadoCarga.textContent = modoActual === 'real'
                ? 'Conectando con el Servidor REST real (http://localhost:3000/mediciones)...'
                : 'Cargando mediciones desde la capa Fake (1000ms)...';
            estadoCarga.className = 'cargando';
        }

        try {
            // Invocación a través de la interfaz de dominio (cero fetch en GUI)
            const mediciones = typeof this.clienteLogica.obtenerTodasMediciones === 'function'
                ? await this.clienteLogica.obtenerTodasMediciones()
                : await this.clienteLogica.recuperarMediciones();

            const tbody = document.querySelector('tbody');
            if (!tbody) {
                console.error('No se encontró el elemento <tbody> en el documento.');
                return;
            }

            tbody.innerHTML = '';

            if (mediciones.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.style.textAlign = 'center';
                td.style.color = '#94a3b8';
                td.textContent = 'No hay mediciones registradas todavía.';
                tr.appendChild(td);
                tbody.appendChild(tr);
            } else {
                // Si ordenDescendente está activo, mostrar más recientes primero
                const medicionesOrdenadas = this.ordenDescendente ? [...mediciones].reverse() : mediciones;
                medicionesOrdenadas.forEach((medicion) => {
                    const tr = document.createElement('tr');

                    // Celda ID
                    const tdId = document.createElement('td');
                    tdId.textContent = `#${medicion.id}`;
                    tr.appendChild(tdId);

                    // Celda Valor
                    const tdValor = document.createElement('td');
                    tdValor.className = 'col-valor';
                    tdValor.textContent = `${Number(medicion.valor).toFixed(1)} ppm`;
                    tr.appendChild(tdValor);

                    // Celda Timestamp (formateada y cruda)
                    const tdFecha = document.createElement('td');
                    const fecha = new Date(medicion.timestamp * 1000);
                    tdFecha.textContent = !isNaN(fecha.getTime()) ? fecha.toLocaleTimeString() : `${medicion.timestamp}`;
                    tr.appendChild(tdFecha);

                    const tdEpoch = document.createElement('td');
                    tdEpoch.className = 'col-epoch';
                    tdEpoch.textContent = medicion.timestamp;
                    tr.appendChild(tdEpoch);

                    tbody.appendChild(tr);
                });
            }

            if (estadoCarga) {
                estadoCarga.textContent = `Mostrando ${mediciones.length} mediciones (${modoActual.toUpperCase()}).`;
                estadoCarga.className = 'exito';
            }
        } catch (error) {
            console.error('Error al actualizar la tabla:', error);
            if (estadoCarga) {
                estadoCarga.textContent = `Error al recuperar las mediciones: ${error.message}`;
                estadoCarga.className = 'error';
            }
        }
    }
}

// Inicialización automática en el navegador cuando cargue el DOM
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const app = new InterfazGraficaWeb(null, true);
        app.actualizarTablaDOM();

        // Selector de modo (Fake / Real)
        const selectModo = document.getElementById('select-modo');
        if (selectModo) {
            selectModo.addEventListener('change', (e) => {
                if (app.clienteLogica && typeof app.clienteLogica.publicarModo === 'function') {
                    app.clienteLogica.publicarModo(e.target.value);
                }
                app.actualizarTablaDOM();
            });
        }

        // Botón de refresco manual
        const btnRefrescar = document.getElementById('btn-refrescar');
        if (btnRefrescar) {
            btnRefrescar.addEventListener('click', () => {
                app.actualizarTablaDOM();
            });
        }

        // Botón de vaciar historial
        const btnLimpiar = document.getElementById('btn-limpiar');
        if (btnLimpiar) {
            btnLimpiar.addEventListener('click', async () => {
                if (confirm('¿Vaciar todo el historial de mediciones de la base de datos?')) {
                    try {
                        if (app.clienteLogica && typeof app.clienteLogica.limpiarMediciones === 'function') {
                            await app.clienteLogica.limpiarMediciones();
                        }
                        await app.actualizarTablaDOM();
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        }

        // Auto-recarga periódica cada 2 segundos
        const checkAuto = document.getElementById('check-auto');
        let temporizadorAuto = null;

        function configurarAutoRecarga() {
            if (temporizadorAuto) {
                clearInterval(temporizadorAuto);
                temporizadorAuto = null;
            }
            if (checkAuto && checkAuto.checked) {
                temporizadorAuto = setInterval(() => {
                    app.actualizarTablaDOM();
                }, 2000);
            }
        }

        if (checkAuto) {
            checkAuto.addEventListener('change', configurarAutoRecarga);
            configurarAutoRecarga();
        }
    });
}

// Exportación para entornos Node.js / Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InterfazGraficaWeb };
}
