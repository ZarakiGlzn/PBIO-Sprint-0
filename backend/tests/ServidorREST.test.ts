import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { BaseDeDatos } from '../src/BaseDeDatos';
import { LogicaDeNegocio } from '../src/LogicaDeNegocio';
import { ServidorREST } from '../src/ServidorREST';

describe('ServidorREST (Integration Tests with Supertest)', () => {
    let bd: BaseDeDatos;
    let logica: LogicaDeNegocio;
    let servidor: ServidorREST;

    beforeEach(() => {
        // Usamos una base de datos SQLite en memoria para aislar la prueba de integración
        bd = new BaseDeDatos(':memory:');
        logica = new LogicaDeNegocio(bd);
        servidor = new ServidorREST(logica, 0);
    });

    afterEach(() => {
        bd.cerrar();
    });

    test('POST /mediciones debe registrar una medición válida y retornar HTTP 201 Created', async () => {
        const payload = {
            valor: 42.8,
            timestamp: 1712851000,
        };

        const respuestaPost = await request(servidor.getApp())
            .post('/mediciones')
            .send(payload)
            .set('Accept', 'application/json');

        expect(respuestaPost.status).toBe(201);
        expect(respuestaPost.body.status).toBe('Created');
        expect(respuestaPost.body.datos).toMatchObject(payload);
    });

    test('GET /mediciones debe retornar HTTP 200 con la medición previamente insertada', async () => {
        const payload = {
            valor: 31.4,
            timestamp: 1712852000,
        };

        // 1. Insertamos mediante POST
        await request(servidor.getApp())
            .post('/mediciones')
            .send(payload);

        // 2. Comprobamos con GET
        const respuestaGet = await request(servidor.getApp())
            .get('/mediciones')
            .set('Accept', 'application/json');

        expect(respuestaGet.status).toBe(200);
        expect(Array.isArray(respuestaGet.body)).toBe(true);
        expect(respuestaGet.body.length).toBe(1);
        expect(respuestaGet.body[0]).toMatchObject({
            id: 1,
            valor: 31.4,
            timestamp: 1712852000,
        });
    });

    test('POST /mediciones debe retornar HTTP 400 Bad Request si el valor es negativo', async () => {
        const payloadInvalido = {
            valor: -15.0,
            timestamp: 1712853000,
        };

        const respuestaPost = await request(servidor.getApp())
            .post('/mediciones')
            .send(payloadInvalido);

        expect(respuestaPost.status).toBe(400);
        expect(respuestaPost.body.status).toBe('Bad Request');
        expect(respuestaPost.body.error).toContain('negativo');
    });
});
