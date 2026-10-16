import { Request, Response, Application } from 'express';
import { LogicaDeNegocio } from './LogicaDeNegocio';
export declare class ServidorREST {
    private logica;
    private puerto;
    private app;
    private servidorHttp;
    constructor(logica: LogicaDeNegocio, puerto?: number);
    private configurarMiddlewares;
    private configurarRutas;
    postMedicion(req: Request, res: Response): void;
    getMediciones(req: Request, res: Response): void;
    deleteMediciones(req: Request, res: Response): void;
    iniciar(): Promise<void>;
    detener(): Promise<void>;
    getApp(): Application;
}
