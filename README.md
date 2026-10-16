# Proyecto Biometría - Sprint 0 (Arquitectura End-to-End)

Este repositorio contiene la implementación completa y el diseño formal del **Sprint 0** de la asignatura **Proyectos de Biometría (PBIO)** del Grado en Tecnologías Interactivas (GTI) en la Escuela Politécnica Superior de Gandia (EPSG - UPV).

---

## 1. Descripción del Proyecto

El objetivo del Sprint 0 es implementar y validar la arquitectura completa de recolección de métricas desde un sensor físico de gas ozono ($O_3$) hasta una interfaz de visualización web:

1. **Placa (Arduino C++):** Emite tramas Bluetooth Low Energy (BLE) bajo el estándar iBeacon con el nombre `"GTI3A-2025"`. El valor del sensor de ozono se codifica en el campo `Minor`.
2. **Teléfono (Android Java):** Escucha las tramas BLE emitidas por la placa, decodifica el `Minor` y reenvía los datos al servidor mediante peticiones HTTP REST. Incorpora una capa de **Lógica Fake** para pruebas locales sin requerir el backend encendido.
3. **Servidor (Backend Node.js / TypeScript):**
   - **Base de Datos:** SQLite nativo (`node:sqlite`) con la entidad `Medicion = ( id: Z, valor: R, timestamp: N )`.
   - **Lógica de Negocio:** Validación de dominio (ozono no negativo, timestamps válidos) e inyección de dependencias (Clean Architecture).
   - **Servidor REST:** API HTTP con Express (`POST /mediciones`, `GET /mediciones`) y CORS habilitado.
4. **Web (Front-end HTML / CSS / Vanilla JS):**
   - Interfaz gráfica responsiva *Mobile-First*.
   - Proxy de Lógica de Negocio del Cliente (`LogicaCliente` / `LogicaFakeWeb`) desacoplado de la GUI, permitiendo alternar entre datos simulados en memoria y conexión al servidor REST real.

---

## 2. Estructura del Repositorio

El proyecto sigue estrictamente las directrices del **Agente Revisor de Sprints** y la rúbrica oficial de la asignatura:

```text
├── author.md                   # Identificación del autor
├── README.md                   # Descripción, despliegue y testing
├── MEMORIA.md                  # Memoria técnica detallada
├── doc/                        # Diseños formales según la notación de la asignatura
│   ├── database_design.md      # Especificación de BD relacional y adaptador
│   ├── business_logic_design.md# Lógica de negocio (100% independiente de red)
│   ├── communication_design.md # Endpoints de la API REST
│   └── frontend_business_logic_design.md # Proxy de cliente con paridad de interfaz
├── src/                        # Código fuente modular organizado por componentes
│   ├── database/               # Adaptador SQLite y tipos
│   ├── business_logic/         # Lógica de dominio y validaciones
│   ├── communication/          # Servidor Express y routing
│   ├── frontend_business_logic/# Proxy de cliente
│   └── gui/                    # Interfaz web (HTML, CSS, JS)
├── android/                    # Proyecto Android Studio (Gradle 8.9 / Java 17-21)
├── arduino/                    # Sketch y librerías C++ para la placa física
├── backend/                    # Proyecto npm del backend
└── web/                        # Cliente web listo para ejecución local
```

---

## 3. Guía de Despliegue y Ejecución

### 3.1 Backend (Servidor REST y Base de Datos)

Requisitos: Node.js v22+

```powershell
# Acceder a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor REST (escucha en http://localhost:3000)
npm start
```

### 3.2 Cliente Web

1. Navegar a la carpeta `web/` o `src/gui/`.
2. Abrir el archivo `index.html` con cualquier navegador (doble clic o mediante Chrome/Edge/Firefox).
3. Permite alternar mediante el selector superior entre:
   - **Modo Fake:** Carga datos simulados tras 1000ms.
   - **Servidor REST Real:** Conecta en vivo con `http://localhost:3000/mediciones`.

### 3.3 Aplicación Android

Requisitos: Android Studio (Ladybug / Meerkat / Rabbit) con JDK 17 o 21.

1. Abrir la carpeta `android/` en Android Studio.
2. Compilar y desplegar en el dispositivo móvil (o emulador con soporte Bluetooth).
3. Botones disponibles:
   - **🔍 Buscar Nuestro Dispositivo (GTI3A-2025):** Inicia el escaneo BLE continuo buscando la placa.
   - **⏹ Detener Búsqueda BTLE:** Detiene el receptor BLE.
   - **🧪 Probar Envío Fake REST:** Realiza un envío simulado manual con registro en Logcat.

### 3.4 Placa Arduino

1. Abrir el archivo `arduino/HolaMundoIBeacon.ino` con el Arduino IDE.
2. Seleccionar la placa correspondiente (ej: nRF52840 / SparkFun / Arduino Nano BLE).
3. Para la demostración presencial, editar el valor de prueba en `arduino/Medidor.h`:
   ```cpp
   int medirCO2() {
       return 1234; // Modificar por el número solicitado por el profesor
   }
   ```
4. Subir el código a la placa mediante el cable USB.

---

## 4. Ejecución de Tests Automatizados

Todos los componentes disponen de tests automatizados unitarios y de integración:

### Tests del Backend (Jest + Supertest)
```powershell
cd backend
npm test
```
Verifica la inserción/recuperación en SQLite en memoria, validación de ozono no negativo y respuestas HTTP 201, 200 y 400.

### Tests del Frontend (Jest + JSDOM)
```powershell
cd web
npm test
```
Verifica la resolución asíncrona de la lógica cliente fake y la construcción reactiva de filas `<tr>` en el `<tbody>`.

### Tests de Android (JUnit)
```powershell
cd android
.\gradlew.bat test
```
Verifica la simulación de red con 500ms de latencia, inserción en memoria y respuesta exitosa `true`.

---

## 5. Demostración del Flujo End-to-End

```text
[ Placa Arduino ] --(BLE: GTI3A-2025)--> [ Móvil Android ] --(HTTP POST)--> [ Servidor REST + BD ] <--(HTTP GET)-- [ Web Browser ]
```

1. Encender el backend con `npm start`.
2. Conectar la placa Arduino emitiendo la medida ficticia requerida (ej. `1234`).
3. En la app Android, pulsar "Buscar Nuestro Dispositivo (GTI3A-2025)".
4. Abrir la página web (`web/index.html`), seleccionar "Servidor REST Real" y pulsar "Recargar Mediciones".
5. El valor emitido por la placa aparecerá inmediatamente en la tabla web.
