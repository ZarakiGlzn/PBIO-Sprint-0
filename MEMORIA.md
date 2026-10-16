# Memoria de Desarrollo - Proyecto Biometría (Sprint 0)

Este documento registra el progreso, las decisiones de diseño arquitectónico y el estado de implementación del proyecto para facilitar el contexto en futuras sesiones de trabajo.

---

## 1. Contexto y Objetivos del Sprint 0
El Sprint 0 tiene como objetivo comprender e implementar la arquitectura completa (end-to-end) del sistema de recolección de métricas de biometría para un sensor de **Ozono**:
1. **Placa (Arduino):** Lee sensores y emite tramas BLE (iBeacon).
2. **Teléfono (Android):** Recibe las tramas BLE y las reenvía vía HTTP REST (usando lógica *Fake* para pruebas locales sin backend).
3. **Servidor (Backend & BD):** Base de datos SQLite, capa de Lógica de Negocio y Servidor REST con Express.
4. **Web (Front-end):** Cliente HTTP con vista móvil-first y capa *Fake* de datos para maquetación reactiva.

---

## 2. Convenciones y Reglas del Proyecto
- **Notación de Diseño Lógico:** Especificada en `Logical_Design_RE_Rules_v3.md`.
  - Tipos abstractos: `Z` (Enteros), `N` (Naturales/Unix timestamp), `R` (Reales), `B` (Booleanos), `Text` (Strings).
  - Encapsulación: Cajas ASCII donde los métodos públicos atraviesan la pared vertical (`|`) y los miembros privados quedan dentro. Espaciado con 2 líneas verticales entre métodos.
  - Indicadores de estado en la derecha: `-->` mutación, `<--` lectura/constante, `--x` estático.
- **Clean Architecture:** Separación estricta entre capa de persistencia (Base de Datos), núcleo funcional (Lógica de Negocio) y adaptador de transporte (Servidor REST).
- **Inyección de Dependencias:** El núcleo no debe instanciar directamente la base de datos, sino recibirla en el constructor para permitir testing con dobles de prueba (mocks).

---

## 3. Estado de los Prompts

| Prompt | Descripción | Estado | Componente |
| :--- | :--- | :--- | :--- |
| **Prompt 1** | Generación de la Base de Datos (SQLite + Adapter TS) | **Completado** | `backend/src/BaseDeDatos.ts` |
| **Prompt 2** | Código de la Lógica del Negocio (Backend) | **Completado** | `backend/src/LogicaDeNegocio.ts` |
| **Prompt 3** | Servidor REST (Express + Supertest) | **Completado** | `backend/src/ServidorREST.ts` |
| **Prompt 4** | Lógica Fake en el Teléfono (Android) | **Completado** | `android/` (`PeticionarioRESTFake.java`) |
| **Prompt 5** | Lógica Fake en el Navegador (Web) | **Completado** | `web/LogicaFakeWeb.js` |
| **Prompt 6** | Interfaz Gráfica (UX) en el Navegador | **Completado** | `web/` (`index.html`, `style.css`, `app.js`) |

---

## 4. Detalle de Implementaciones

### Prompt 1: Generación de la Base de Datos
- **Ubicación:** Directorio `backend/`
- **Script SQL:** [`schema.sql`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/schema.sql)
  - Tabla: `mediciones (id INTEGER PRIMARY KEY AUTOINCREMENT, valor REAL NOT NULL, timestamp INTEGER NOT NULL)`
- **Tipos TypeScript:** [`types.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/types.ts)
  - Interfaz `Medicion { id: number; valor: number; timestamp: number; }`
- **Adaptador:** [`BaseDeDatos.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/BaseDeDatos.ts)
  - Implementación con la librería nativa de Node.js `node:sqlite` (`DatabaseSync`).
  - Cabecera en notación ASCII de la asignatura respetando los métodos que cruzan la barra vertical.
- **Tests (Jest):** [`BaseDeDatos.test.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/tests/BaseDeDatos.test.ts)
  - Test en memoria (`:memory:`). Verifica inserción de medición de ozono y recuperación.

### Prompt 2: Código de la Lógica del Negocio (Backend)
- **Ubicación:** [`LogicaDeNegocio.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/LogicaDeNegocio.ts)
  - Inyección de dependencia de `BaseDeDatos` a través del constructor.
  - Validación de regla de negocio: la lectura del sensor de ozono no puede ser negativa (`valor < 0` lanza excepción) y el timestamp debe ser un valor numérico natural válido.
  - Delegación limpia hacia el adaptador de persistencia: `procesarNuevaMedicion()` y `obtenerTodasMediciones()`.
  - Cabecera con diagrama formal de la asignatura respetando la interfaz pública que cruza la frontera vertical.
- **Tests (Jest):** [`LogicaDeNegocio.test.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/tests/LogicaDeNegocio.test.ts)
  - Mock de `BaseDeDatos` con `jest.mock('../src/BaseDeDatos')`.
  - Aserción de excepción inmediata cuando se introduce un valor imposible (ej: `-10`), verificando que la BD nunca es llamada.
  - Aserción de que para un valor válido (ej: `25.5`), `insertarMedicion()` se invoca exactamente 1 vez con los argumentos esperados.
  - Aserción de recuperación de mediciones delegando al método correspondiente.

### Prompt 3: Servidor REST (Backend)
- **Ubicación:** [`ServidorREST.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/ServidorREST.ts) y [`index.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/src/index.ts)
  - Servidor Express.js configurado con CORS habilitado (permite peticiones desde orígenes cruzados en navegadores locales) y middleware para parsing JSON.
  - Actúa estrictamente como fachada de transporte: no valida reglas de dominio internamente, sino que delega en `LogicaDeNegocio`.
  - Endpoints implementados:
    - `POST /mediciones`: Registra una nueva medición. Si la lógica es correcta responde con HTTP `201 Created`. Si la lógica lanza excepción responde con HTTP `400 Bad Request`.
    - `GET /mediciones`: Recupera el listado de mediciones de la base de datos con HTTP `200 OK`.
  - Cabecera con diagrama formal ASCII donde `postMedicion()` y `getMediciones()` cruzan la pared vertical `|`.
- **Tests (Supertest + Jest):** [`ServidorREST.test.ts`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/backend/tests/ServidorREST.test.ts)
  - Prueba de integración end-to-end (Servidor REST + Lógica de Negocio + SQLite en memoria).
  - Aserción de HTTP 201 en `POST /mediciones` con payload JSON.
  - Aserción de HTTP 200 en `GET /mediciones` comprobando que el array devuelto contiene la entidad recién insertada.
  - Aserción de HTTP 400 Bad Request cuando el payload contiene valores no válidos (ej: valor negativo).

### Prompt 4: Lógica Fake en el Teléfono (Android)
- **Ubicación:** Directorio [`android/`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android)
  - Proyecto modernizado con **Gradle 8.9**, Android Gradle Plugin **8.5.2**, Java **17** y **compileSdk 34** (totalmente compatible con Android Studio 2024/2025).
  - Clase principal: [`PeticionarioRESTFake.java`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android/app/src/main/java/org/jordi/pruebarest1/PeticionarioRESTFake.java)
  - Entidad: [`Medicion.java`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android/app/src/main/java/org/jordi/pruebarest1/Medicion.java)
  - Descodificadores Bluetooth integrados: [`TramaIBeacon.java`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android/app/src/main/java/org/jordi/pruebarest1/TramaIBeacon.java) y [`Utilidades.java`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android/app/src/main/java/org/jordi/pruebarest1/Utilidades.java)
- **Comportamiento:**
  - Simula latencia de red mediante `Thread.sleep(500)`.
  - Imprime el payload simulado en el Logcat mediante `Log.d("FakeREST", ...)`.
  - Almacena internamente cada envío falsificado en una lista en memoria `dbLocal`.
  - Devuelve booleano `true` simulando una respuesta HTTP 201 Created.
  - Cabecera con la notación formal exigida en la asignatura.
- **Tests (JUnit):** [`PeticionarioRESTFakeTest.java`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/android/app/src/test/java/org/jordi/pruebarest1/PeticionarioRESTFakeTest.java)
  - Instancia la clase, invoca `hacerPeticionPOST()` simulando el escaneo de un iBeacon.
  - Afirma que la respuesta retorne `true`.
  - Verifica que la lista interna incrementa su tamaño y contiene el valor simulado.

### Prompt 5: Lógica Fake en el Navegador (Web)
- **Ubicación:** [`LogicaFakeWeb.js`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/LogicaFakeWeb.js)
  - Servicio Vanilla JavaScript (ES6+).
  - Inyecta un array `dbLocalFake` con 4 registros de datos válidos de ozono con timestamps secuenciales.
  - Método asíncrono `recuperarMediciones()` que devuelve una Promesa con 1000ms de retardo simulado (`setTimeout`), emulando la latencia del backend real.
  - Cabecera con diagrama formal ASCII donde `recuperarMediciones()` atraviesa la línea vertical `|`.
- **Tests (Jest):** [`LogicaFakeWeb.test.js`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/tests/LogicaFakeWeb.test.js)
  - Invoca `recuperarMediciones()`, espera la resolución y afirma que retorna un array de al menos 4 objetos con las claves requeridas (`id`, `valor`, `timestamp`), comprobando también el retardo temporal.

### Prompt 6: Interfaz Gráfica (UX) en el Navegador
- **Ubicación:** Directorio [`web/`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web)
  - [`index.html`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/index.html): Maquetación responsiva "Mobile-First", encabezado limpio con insignia de Sprint 0, panel de estado y tabla semántica con `<thead>` y `<tbody>`.
  - [`style.css`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/style.css): Paleta de alto contraste, tarjeta estilizada, scroll horizontal adaptativo en pantallas móviles estrechas y media queries para escritorio.
  - [`app.js`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/app.js): Clase `InterfazGraficaWeb` que instancia `LogicaFakeWeb`, invoca `recuperarMediciones()` asíncronamente y construye dinámicamente las filas `<tr>` y celdas `<td>` en el `<tbody>`. Incluye botón para recarga manual.
  - Cabecera con diagrama formal ASCII donde `actualizarTablaDOM()` atraviesa la pared vertical `|`.
- **Tests (Jest + JSDOM):** [`InterfazGraficaWeb.test.js`](file:///c:/Users/Sergio/Desktop/Stuff/Biometría/Sprint%200/web/tests/InterfazGraficaWeb.test.js)
  - Inyecta un DOM virtual con `<table><tbody></tbody></table>`.
  - Mockea `fakeLogic.recuperarMediciones()` devolviendo exactamente 2 mediciones simuladas.
  - Invoca `actualizarTablaDOM()`.
  - Aserción: Comprueba que `document.querySelectorAll("tbody tr")` devuelve exactamente una longitud igual a 2 con los contenidos formateados.
