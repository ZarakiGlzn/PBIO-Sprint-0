// ============================================================================
// Fichero: app.js
// Descripción: Controlador de la Interfaz Gráfica de Usuario (GUI)
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Desacoplamiento total de transporte, cero fetch en GUI
// ============================================================================

/*
                              --------- InterfazGraficaWeb --------
                              |
                              | fakeLogic: LogicaFakeWeb
                              |
                           --> actualizarTablaDOM() -->
                              |
                              -------------------------------------
> actualizarTablaDOM() = Público
> fakeLogic = Privado
*/

let LogicaFakeWebClass;
if (typeof require !== 'undefined') {
    try {
        LogicaFakeWebClass = require('./LogicaFakeWeb').LogicaFakeWeb;
    } catch (e) {
        // Ignorar si se ejecuta en navegador
    }
}
if (!LogicaFakeWebClass && typeof LogicaFakeWeb !== 'undefined') {
    LogicaFakeWebClass = LogicaFakeWeb;
}

class InterfazGraficaWeb {
    constructor(fakeLogic, ordenDescendente = false) {
        this.fakeLogic = fakeLogic || new LogicaFakeWebClass();
        this.ordenDescendente = ordenDescendente;
    }

    // ------------------------------------------------------------------------
    // --> actualizarTablaDOM() -->
    // Recupera mediciones mediante el proxy de lógica de negocio y actualiza el DOM.
    // La GUI no ejecuta ninguna llamada de red directa.
    // ------------------------------------------------------------------------
    async actualizarTablaDOM() {
        const estadoCarga = document.getElementById('estado-carga');
        const modoActual = this.fakeLogic.obtenerModo ? this.fakeLogic.obtenerModo() : 'fake';

        if (estadoCarga) {
            estadoCarga.textContent = modoActual === 'real'
                ? 'Conectando con el Servidor REST real (http://localhost:3000/mediciones)...'
                : 'Cargando mediciones desde la capa Fake (1000ms)...';
            estadoCarga.className = 'cargando';
        }

        try {
            const mediciones = typeof this.fakeLogic.obtenerTodasMediciones === 'function'
                ? await this.fakeLogic.obtenerTodasMediciones()
                : await this.fakeLogic.recuperarMediciones();

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

// Inicialización automática en navegador cuando cargue el DOM
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const app = new InterfazGraficaWeb(null, true);
        app.actualizarTablaDOM();

        // Selector de modo (Fake / Real)
        const selectModo = document.getElementById('select-modo');
        if (selectModo) {
            selectModo.addEventListener('change', (e) => {
                if (app.fakeLogic && typeof app.fakeLogic.publicarModo === 'function') {
                    app.fakeLogic.publicarModo(e.target.value);
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
                        if (app.fakeLogic && typeof app.fakeLogic.limpiarMediciones === 'function') {
                            await app.fakeLogic.limpiarMediciones();
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

// Exportación para entornos de prueba Node.js / Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InterfazGraficaWeb };
}
