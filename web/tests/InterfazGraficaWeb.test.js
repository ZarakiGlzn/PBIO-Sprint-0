/**
 * @jest-environment jsdom
 */
const { InterfazGraficaWeb } = require('../app');

describe('InterfazGraficaWeb (DOM Rendering Integration Test - Prompt 6)', () => {
    let mockFakeLogic;
    let ui;

    beforeEach(() => {
        // Estructura DOM requerida para la tabla
        document.body.innerHTML = `
            <span id="estado-carga"></span>
            <table>
                <tbody></tbody>
            </table>
        `;

        // 1. Instancia y mockea la promesa de la Lógica Fake devolviendo exactamente 2 ítems ficticios
        mockFakeLogic = {
            recuperarMediciones: jest.fn().mockResolvedValue([
                { id: 101, valor: 35.5, timestamp: 1712850000 },
                { id: 102, valor: 42.1, timestamp: 1712850060 }
            ])
        };

        ui = new InterfazGraficaWeb(mockFakeLogic);
    });

    test('actualizarTablaDOM() debe renderizar exactamente 2 filas <tr> en el <tbody>', async () => {
        // 2. Fuerza el renderizado invocando a actualizarTablaDOM()
        await ui.actualizarTablaDOM();

        // 3. Aserción: Comprueba que document.querySelectorAll("tbody tr") devuelve exactamente 2
        const filas = document.querySelectorAll('tbody tr');
        expect(filas.length).toBe(2);

        // Aserciones de validación de contenido en celdas
        expect(filas[0].textContent).toContain('#101');
        expect(filas[0].textContent).toContain('35.5 ppm');
        expect(filas[1].textContent).toContain('#102');
        expect(filas[1].textContent).toContain('42.1 ppm');
    });
});
