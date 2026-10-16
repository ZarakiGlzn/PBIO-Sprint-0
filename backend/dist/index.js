"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseDeDatos = exports.logica = exports.servidor = void 0;
const path_1 = __importDefault(require("path"));
const BaseDeDatos_1 = require("./BaseDeDatos");
const LogicaDeNegocio_1 = require("./LogicaDeNegocio");
const ServidorREST_1 = require("./ServidorREST");
const PUERTO = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.DB_PATH || path_1.default.join(__dirname, '../mediciones.db');
// Ensamblado del sistema siguiendo Clean Architecture e Inyección de Dependencias
const baseDeDatos = new BaseDeDatos_1.BaseDeDatos(DB_PATH);
exports.baseDeDatos = baseDeDatos;
const logica = new LogicaDeNegocio_1.LogicaDeNegocio(baseDeDatos);
exports.logica = logica;
const servidor = new ServidorREST_1.ServidorREST(logica, PUERTO);
exports.servidor = servidor;
servidor.iniciar().catch((err) => {
    console.error('Error al iniciar el servidor REST:', err);
});
