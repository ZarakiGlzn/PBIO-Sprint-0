const { LogicaFakeWeb } = require('../LogicaFakeWeb');

describe('LogicaFakeWeb (Mock Data Layer - Prompt 5)', () => {
    let fakeLogic;

    beforeEach(() => {
        fakeLogic = new LogicaFakeWeb();
    });

    test('recuperarMediciones() debe resolver tras 1000ms y devolver un array con id, valor y timestamp', async () => {
        const inicio = Date.now();
        const mediciones = await fakeLogic.recuperarMediciones();
        const duracion = Date.now() - inicio;

        // Verifica que la promesa tardó ~1000ms en resolver
        expect(duracion).toBeGreaterThanOrEqual(950);

        // Afirma que el resultado es un array de al menos 4 registros
        expect(Array.isArray(mediciones)).toBe(true);
        expect(mediciones.length).toBeGreaterThanOrEqual(4);

        // Afirma que cada objeto contiene las claves requeridas (id, valor, timestamp)
        mediciones.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('valor');
            expect(item).toHaveProperty('timestamp');
            expect(typeof item.id).toBe('number');
            expect(typeof item.valor).toBe('number');
            expect(typeof item.timestamp).toBe('number');
            expect(item.valor).toBeGreaterThanOrEqual(0);
        });
    }, 5000);
});
