// ============================================================================
// Fichero: index.ts
// Descripción: Punto de entrada principal para arrancar el backend de Biometría
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Composición e inyección de dependencias (BD -> Lógica -> REST)
// ============================================================================

import { BaseDeDatos } from '../database/BaseDeDatos';
import { LogicaDeNegocio } from '../business_logic/LogicaDeNegocio';
import { ServidorREST } from './ServidorREST';

const PUERTO = Number(process.env.PORT) || 3000;
const ARCHIVO_BD = process.env.DB_FILE || 'biometria_sprint0.db';

// Inyección de dependencias
const baseDeDatos = new BaseDeDatos(ARCHIVO_BD);
const logica = new LogicaDeNegocio(baseDeDatos);
const servidor = new ServidorREST(logica, PUERTO);

servidor.iniciar().catch((error) => {
    console.error('Error al inicializar el servidor:', error);
});
