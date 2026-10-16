"use strict";
// ============================================================================
// Fichero: ServidorREST.ts
// Descripción: Fachada de comunicación HTTP / API REST con Express
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Exposición de endpoints REST, habilitación de CORS y parsing JSON
// ============================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServidorREST = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
class ServidorREST {
    logica;
    puerto;
    app;
    servidorHttp = null;
    constructor(logica, puerto = 3000) {
        this.logica = logica;
        this.puerto = puerto;
        this.app = (0, express_1.default)();
        this.configurarMiddlewares();
        this.configurarRutas();
    }
    configurarMiddlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    configurarRutas() {
        this.app.post('/mediciones', (req, res) => {
            this.postMedicion(req, res);
        });
        this.app.get('/mediciones', (req, res) => {
            this.getMediciones(req, res);
        });
        this.app.delete('/mediciones', (req, res) => {
            this.deleteMediciones(req, res);
        });
    }
    // ------------------------------------------------------------------------
    // peticion: Text --> postMedicion() --> respuesta: Text
    // Procesa peticiones HTTP POST /mediciones extrayendo valor y timestamp.
    // Retorna HTTP 201 Created si es válido o HTTP 400 Bad Request si falla.
    // ------------------------------------------------------------------------
    postMedicion(req, res) {
        try {
            const { valor, timestamp, ts } = req.body ?? {};
            const tiempo = timestamp !== undefined ? timestamp : ts;
            this.logica.procesarNuevaMedicion(valor, tiempo);
            res.status(201).json({
                status: 'Created',
                mensaje: 'Medición guardada correctamente.',
                datos: { valor, timestamp: tiempo }
            });
        }
        catch (error) {
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
    getMediciones(req, res) {
        try {
            const mediciones = this.logica.obtenerTodasMediciones();
            res.status(200).json(mediciones);
        }
        catch (error) {
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
    deleteMediciones(req, res) {
        try {
            this.logica.vaciarMediciones();
            res.status(200).json({
                status: 'OK',
                mensaje: 'Historial de mediciones vaciado con éxito.'
            });
        }
        catch (error) {
            res.status(500).json({
                status: 'Internal Server Error',
                error: error.message || 'Error al vaciar mediciones.'
            });
        }
    }
    iniciar() {
        return new Promise((resolve) => {
            this.servidorHttp = this.app.listen(this.puerto, () => {
                console.log(`Servidor REST de Biometría escuchando en http://localhost:${this.puerto}`);
                resolve();
            });
        });
    }
    detener() {
        return new Promise((resolve, reject) => {
            if (this.servidorHttp) {
                this.servidorHttp.close((err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    getApp() {
        return this.app;
    }
}
exports.ServidorREST = ServidorREST;
