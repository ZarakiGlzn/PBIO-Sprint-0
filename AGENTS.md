# Contexto del Proyecto: Biometría - Sprint 0

Este archivo proporciona el contexto completo del proyecto de la asignatura de Biometría, específicamente para el "Sprint 0". Este sprint es un trabajo individual diseñado para asegurar que se comprende la arquitectura completa (end-to-end) del sistema de recolección de métricas.

## 1. Arquitectura del Sistema
El sistema completo consta de 4 partes principales interconectadas:

1. **Placa (Arduino):** 
   - Se encarga de leer los valores de los sensores (ej. niveles de CO2 y Temperatura).
   - Emite estos datos mediante tramas de Bluetooth Low Energy (BLE) utilizando el estándar iBeacon.
2. **Teléfono (App Receptora Android):**
   - Escucha las tramas BLE (iBeacons) emitidas por la placa.
   - Envía los datos recogidos al servidor (backend) a través de un cliente REST.
   - En este sprint 0, la app no requiere interfaz gráfica de usuario para el usuario final; las salidas y depuración se comprueban a través de la consola/logcat.
3. **Servidor (Backend & Base de Datos):**
   - Expone un Servidor API REST.
   - Contiene la Lógica de Negocio real que gestiona la validación y el almacenamiento.
   - Base de Datos: Almacena las mediciones recibidas. Entidad central: **Medición** (con atributos para el valor medido, qué tipo de medición es y el timestamp).
4. **Web (Navegador / Front-end):**
   - Actúa como cliente REST para obtener las mediciones almacenadas en el backend.
   - Interfaz Gráfica (UX): Es una vista muy sencilla y *responsive* (mobile-first), pensada para mostrar las mediciones almacenadas en forma de tabla.

## 2. El Concepto de "Lógica Fake"
A lo largo de los distintos clientes (Teléfono y Web) se requiere implementar capas de **Lógica Fake**:
- **Propósito:** Permitir probar la funcionalidad local del componente (flujos de UI, procesos lógicos internos) sin necesidad de tener el resto del sistema (backend real, base de datos o placa de hardware) funcionando de verdad.
- **Implementación:** Se basa en simular el envío/recepción (interceptar peticiones de red o base de datos) empleando colecciones y memoria local. Por ejemplo, en la web devolver una lista simulada de mediciones, o en el teléfono guardar localmente los "POSTs" simulados.

## 3. Notación de Diseño Lógico (Reglas de la Asignatura)
Para diseñar y comentar los componentes, es mandatorio utilizar la notación descrita en `Logical_Design_RE_Rules_v3.md`:
- **Tipos Base Abstractos:** `N` (Naturales), `Z` (Enteros), `R` (Reales), `B` (Booleanos), `Text` (Strings).
- **Firmas Matemáticas:** Omiten especificidades del lenguaje (como punteros). Formato: `entradas --> nombre_funcion() --> salidas`.
- **Clases e Interfaces:** Se representan usando cajas ASCII donde los miembros públicos atraviesan el límite de la caja (`|`).
- **Control de Estado:** El lado derecho de las clases indica los modificadores (`-->` altera estado, `<--` lectura, `--x` estático).

## 4. Modelo de Datos y API REST
El sistema se apoya en un modelo muy estandarizado:
- **Base de Datos:** Entidad `Medicion = ( id: Z, valor: R, timestamp: N )` (solo sensor de ozono).
- **Rutas REST:** 
  - `POST /mediciones`: Consume el teléfono para subir una nueva medición.
  - `GET /mediciones`: Consume la web para listar las mediciones almacenadas.

## 5. Estructura de las Especificaciones (Prompts)
Siempre que se deba generar un requerimiento técnico o prompt para una IA de este proyecto, este deberá incluir de forma estricta:
- Diseño gráfico (o arquitectónico).
- Aclaraciones en texto sobre las decisiones de diseño.
- Directrices concretas que detallen el qué y el cómo.
- Comentarios de cabecera de las funciones en la **notación estricta de la asignatura**.
- Tests automáticos.
