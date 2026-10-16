import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { LogicaDeNegocio } from '../src/LogicaDeNegocio';
import { BaseDeDatos } from '../src/BaseDeDatos';
import { Medicion } from '../src/types';

// Mock de la clase BaseDeDatos para aislar completamente la lógica de negocio
jest.mock('../src/BaseDeDatos');

describe('LogicaDeNegocio (Backend Domain Logic)', () => {
    let mockDb: jest.Mocked<BaseDeDatos>;
    let logica: LogicaDeNegocio;

    beforeEach(() => {
        jest.clearAllMocks();
        // Instanciamos el mock tipado de BaseDeDatos
        mockDb = new BaseDeDatos() as jest.Mocked<BaseDeDatos>;
        // Inyectamos la dependencia en LogicaDeNegocio
        logica = new LogicaDeNegocio(mockDb);
    });

    test('debe lanzar una excepción inmediatamente si el valor de ozono es negativo (ej: -10)', () => {
        const valorInvalido = -10;
        const timestamp = 1712850000;

        expect(() => {
            logica.procesarNuevaMedicion(valorInvalido, timestamp);
        }).toThrow('El valor de ozono no puede ser negativo.');

        // Aseguramos que la BD nunca fue llamada al fallar la validación
        expect(mockDb.insertarMedicion).not.toHaveBeenCalled();
    });

    test('debe llamar al mock de insertarMedicion() exactamente 1 vez al procesar un valor normal (ej: 25.5)', () => {
        const valorNormal = 25.5;
        const timestamp = 1712850000;

        logica.procesarNuevaMedicion(valorNormal, timestamp);

        expect(mockDb.insertarMedicion).toHaveBeenCalledTimes(1);
        expect(mockDb.insertarMedicion).toHaveBeenCalledWith(valorNormal, timestamp);
    });

    test('debe delegar en recuperarMediciones() de la BD al llamar a obtenerTodasMediciones()', () => {
        const medicionesEsperadas: Medicion[] = [
            { id: 1, valor: 15.3, timestamp: 1712850001 },
            { id: 2, valor: 28.7, timestamp: 1712850002 },
        ];

        mockDb.recuperarMediciones.mockReturnValue(medicionesEsperadas);

        const resultado = logica.obtenerTodasMediciones();

        expect(mockDb.recuperarMediciones).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(medicionesEsperadas);
    });
});
