// ============================================================================
// Fichero: ServidorREST.ts
// Descripción: Fachada de comunicación HTTP / API REST con Express
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Exposición de endpoints REST, habilitación de CORS y parsing JSON
// ============================================================================

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { LogicaDeNegocio } from '../business_logic/LogicaDeNegocio';

/*
                              --------- ServidorREST --------------
                              |
                              | logica: LogicaDeNegocio
                              | puerto: Z
                              |
        peticion: Text    --> postMedicion() --> respuesta: Text
                              |
                              |
        peticion: Text    --> getMediciones() <-- respuesta: Text
                              |
                              -------------------------------------
> postMedicion(), getMediciones() = Públicos
> logica, puerto = Privados
*/
export class ServidorREST {
    private logica: LogicaDeNegocio;
    private puerto: number;
    private app: Application;
    private servidorHttp: Server | null = null;

    constructor(logica: LogicaDeNegocio, puerto: number = 3000) {
        this.logica = logica;
        this.puerto = puerto;
        this.app = express();
        this.configurarMiddlewares();
        this.configurarRutas();
    }

    private configurarMiddlewares(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private configurarRutas(): void {
        this.app.post('/mediciones', (req: Request, res: Response) => {
            this.postMedicion(req, res);
        });

        this.app.get('/mediciones', (req: Request, res: Response) => {
            this.getMediciones(req, res);
        });

        this.app.delete('/mediciones', (req: Request, res: Response) => {
            this.deleteMediciones(req, res);
        });
    }

    // ------------------------------------------------------------------------
    // peticion: Text --> postMedicion() --> respuesta: Text
    // Procesa peticiones HTTP POST /mediciones extrayendo valor y timestamp.
    // Retorna HTTP 201 Created si es válido o HTTP 400 Bad Request si falla.
    // ------------------------------------------------------------------------
    public postMedicion(req: Request, res: Response): void {
        try {
            const { valor, timestamp, ts } = req.body ?? {};
            const tiempo = timestamp !== undefined ? timestamp : ts;

            this.logica.procesarNuevaMedicion(valor, tiempo);

            res.status(201).json({
                status: 'Created',
                mensaje: 'Medición guardada correctamente.',
                datos: { valor, timestamp: tiempo }
            });
        } catch (error: any) {
            res.status(400).json({
                status: 'Bad Request',
                error: error.message || 'Error de validación al procesar la medición.'
            });
        }
    }

    // ------------------------------------------------------------------------
    // peticion: Text --> getMediciones() <-- respuesta: Text
    // Procesa peticiones HTTP GET /mediciones recuperando el listado histórico.
    // Retorna HTTP 200 OK con el array JSON de mediciones.
    // ------------------------------------------------------------------------
    public getMediciones(req: Request, res: Response): void {
        try {
            const mediciones = this.logica.obtenerTodasMediciones();
            res.status(200).json(mediciones);
        } catch (error: any) {
            res.status(500).json({
                status: 'Internal Server Error',
                error: error.message || 'Error interno al recuperar las mediciones.'
            });
        }
    }

    // ------------------------------------------------------------------------
    // peticion: Text --> deleteMediciones() --> respuesta: Text
    // Procesa peticiones HTTP DELETE /mediciones vaciando el histórico.
    // ------------------------------------------------------------------------
    public deleteMediciones(req: Request, res: Response): void {
        try {
            this.logica.vaciarMediciones();
            res.status(200).json({
                status: 'OK',
                mensaje: 'Historial de mediciones vaciado con éxito.'
            });
        } catch (error: any) {
            res.status(500).json({
                status: 'Internal Server Error',
                error: error.message || 'Error al vaciar mediciones.'
            });
        }
    }

    public iniciar(): Promise<void> {
        return new Promise((resolve) => {
            this.servidorHttp = this.app.listen(this.puerto, () => {
                console.log(`Servidor REST de Biometría escuchando en http://localhost:${this.puerto}`);
                resolve();
            });
        });
    }

    public detener(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.servidorHttp) {
                this.servidorHttp.close((err) => {
                    if (err) return reject(err);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    public getApp(): Application {
        return this.app;
    }
}
