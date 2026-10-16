import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BaseDeDatos } from '../src/BaseDeDatos';

describe('BaseDeDatos (SQLite Adapter)', () => {
    let bd: BaseDeDatos;

    beforeEach(() => {
        // 1. Levantar la base de datos en memoria para aislar cada prueba
        bd = new BaseDeDatos(':memory:');
    });

    afterEach(() => {
        bd.cerrar();
    });

    test('debe insertar una medición ficticia de ozono y recuperarla en la lista', () => {
        // 2. Insertar una medición ficticia de ozono
        const valorOzono = 45.75;
        const timestamp = 1712850000;

        bd.insertarMedicion(valorOzono, timestamp);

        // 3. Recuperar todas las mediciones y afirmar que la recién insertada está en la lista
        const mediciones = bd.recuperarMediciones();

        expect(mediciones).toBeDefined();
        expect(mediciones.length).toBe(1);
        expect(mediciones[0]).toMatchObject({
            id: 1,
            valor: valorOzono,
            timestamp: timestamp,
        });
    });

    test('debe recuperar múltiples mediciones en orden de inserción', () => {
        bd.insertarMedicion(20.5, 1712850001);
        bd.insertarMedicion(35.2, 1712850002);

        const mediciones = bd.recuperarMediciones();

        expect(mediciones.length).toBe(2);
        expect(mediciones[0].valor).toBe(20.5);
        expect(mediciones[1].valor).toBe(35.2);
    });
});
