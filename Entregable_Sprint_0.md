# Prompts y Diseño del Sistema (Sprint 0)

Este documento contiene las 6 especificaciones (prompts) requeridas para el Sprint 0 del proyecto de Biometría. Cada sección es un prompt completo diseñado para ser copiado y pegado directamente en un asistente de IA (como Gemini, ChatGPT o Claude) para generar el código correspondiente a cada módulo de la arquitectura siguiendo todas las reglas de la asignatura.

> **Nota General sobre Notación:** En todos los esquemas ASCII presentados, los métodos que atraviesan físicamente la barrera vertical izquierda (`|`) forman parte de la interfaz **PÚBLICA**, mientras que todo lo que queda completamente dentro de la caja (variables, dependencias) pertenece al estado **PRIVADO**. Para evitar ambigüedades, se anexan anotaciones directas bajo cada cajetín.

---

## Prompt 1: Generación de la Base de Datos

**Rol:** Eres un experto arquitecto de bases de datos y desarrollador backend.
**Tarea:** Generar el código SQL y la clase adaptadora de base de datos para el sistema de Biometría.

**1. Diseño Gráfico / Arquitectónico**
El modelo se basa en una única entidad central para almacenar datos del sensor de Ozono.
Entidad: `Medicion = ( id: Z, valor: R, timestamp: N )`

**2. Aclaraciones sobre el diseño**
- Al tener un único sensor de Ozono en todo el proyecto, no se requiere un campo de `tipo`.
- `id` es un identificador autoincremental único.
- `valor` es de tipo Real para acomodar concentraciones de gas con decimales.
- `timestamp` es numérico (Natural), almacenando el tiempo en formato Unix Epoch.

**3. Directrices detalladas**
- Genera el script SQL de creación de la tabla en SQLite (por su ligereza para este sprint inicial).
- Implementa una clase adaptadora en TypeScript/NodeJS que permita interactuar con esta tabla (usando librerías estándar).

**4. Comentarios y Notación de Cabecera (Obligatorio)**
Utiliza exactamente esta notación para documentar la clase adaptadora antes de generar su implementación en código. Asegúrate de respetar los espacios para que los nombres de los métodos atraviesen la línea vertical (`|`):
```text
                              --------- BaseDeDatos ----------------
                              |
                              | conexion: Text
                              |
       valor: R, ts: N --> insertarMedicion() -->
                              |
                              |
               [Medicion] <-- recuperarMediciones() <--
                              |
                              --------------------------------------
> insertarMedicion() = Público
> recuperarMediciones() = Público
> conexion = Privado
```

**5. Tests automáticos**
Incluye un script de test unitario automatizado (ej. usando Jest) que:
1. Levante la base de datos en memoria o como archivo temporal.
2. Inserte una medición ficticia de ozono.
3. Recupere todas las mediciones y afirme (*assert*) que la medición recién insertada está en la lista resultante.

---

## Prompt 2: Código de la Lógica del Negocio (Backend)

**Rol:** Eres un ingeniero backend experto en Clean Architecture.
**Tarea:** Generar el código de la capa de "Lógica de Negocio", que es el verdadero núcleo de la aplicación, encargada de validar datos antes de guardarlos.

**1. Diseño Gráfico / Arquitectónico**
Actúa como capa intermedia y cerebro del sistema. Recibe las llamadas del exterior, aplica estrictas reglas de validación, y si todo es correcto, delega en la capa de Base de Datos que inyectaremos.

**2. Aclaraciones sobre el diseño**
- El objetivo aquí es separar por completo el protocolo de red (REST) de la lógica funcional.
- Debemos asegurar calidad de datos: la lectura del sensor de ozono no puede ser un valor negativo.

**3. Directrices detalladas**
- Implementar una clase `LogicaDeNegocio` en TypeScript/NodeJS.
- La clase debe recibir la instancia de la Base de Datos a través de su constructor (Inyección de Dependencias).
- Debe lanzar errores o lanzar Excepciones claras si las reglas de validación fallan para evitar introducir datos corruptos.

**4. Comentarios y Notación de Cabecera (Obligatorio)**
Utiliza exactamente esta notación de la asignatura:
```text
                              --------- LogicaDeNegocio -----------
                              |
                              | db: BaseDeDatos
                              |
       valor: R, ts: N --> procesarNuevaMedicion() -->
                              |
                              |
               [Medicion] <-- obtenerTodasMediciones() <--
                              |
                              -------------------------------------
> procesarNuevaMedicion() = Público
> obtenerTodasMediciones() = Público
> db = Privado
```

**5. Tests automáticos**
Crea tests unitarios aislados usando Jest donde:
- Se "mockee" la clase `BaseDeDatos` para no tocar persistencia real.
- Se compruebe que al pasar un valor de ozono imposible (ej: -10), `procesarNuevaMedicion()` lance inmediatamente una excepción.
- Se compruebe que al pasar un valor normal (ej: 25.5), el mock de `insertarMedicion()` de la BD se llame exactamente 1 vez.

---

## Prompt 3: Servidor REST (Backend)

**Rol:** Eres un especialista en desarrollo de APIs HTTP.
**Tarea:** Crear el código del servidor que exponga los puntos de entrada (endpoints) para que la app y la web se comuniquen.

**1. Diseño Gráfico / Arquitectónico**
El servidor REST no tiene lógica interna de validación; solo actúa de fachada (traduce HTTP a funciones internas).
Expone dos endpoints principales: `POST /mediciones` (recibe datos) y `GET /mediciones` (envía datos).

**2. Aclaraciones sobre el diseño**
- `POST /mediciones` será llamado por el teléfono Android en campo para registrar mediciones de ozono.
- `GET /mediciones` será llamado desde un explorador de escritorio o móvil para consultar.

**3. Directrices detalladas**
- Usa Express.js (u otro framework minimalista actual en Node).
- Es obligatorio habilitar y configurar CORS para que el frontal web local pueda hacer consultas.
- Llama a los métodos de la clase `LogicaDeNegocio`. En caso de éxito del POST devuelve status `201 Created`, si la lógica lanza error devuelve status `400 Bad Request`.

**4. Comentarios y Notación de Cabecera (Obligatorio)**
Añade este diseño de cajetín a modo de comentario superior del módulo del servidor:
```text
                              --------- ServidorREST --------------
                              |
                              | logica: LogicaDeNegocio
                              | puerto: Z
                              |
        peticion: Text --> postMedicion() --> respuesta: Text
                              |
                              |
        peticion: Text --> getMediciones() <-- respuesta: Text
                              |
                              -------------------------------------
> postMedicion(), getMediciones() = Públicos
> logica, puerto = Privados
```

**5. Tests automáticos**
Incluye un test de integración usando librerías como `supertest`:
- Haz una llamada HTTP POST con un payload de prueba en JSON al servidor levantado, asegurando que devuelve HTTP 201.
- Haz otra llamada GET y comprueba que la respuesta es un 200 con formato JSON que incluya el elemento que has insertado.

---

## Prompt 4: Lógica Fake en el Teléfono (Android)

**Rol:** Eres un desarrollador avanzado de Android.
**Tarea:** Implementar una capa de cliente HTTP y lógica simulada (*Fake Logic*) para testear localmente el dispositivo Android.

**1. Diseño Gráfico / Arquitectónico**
El módulo `PeticionarioRESTFake` se encarga de interceptar los datos de ozono generados por la recepción BLE del teléfono y "enviarlos" a un vacío.

**2. Aclaraciones sobre el diseño**
- El sprint no incluye interfaz gráfica para el teléfono (UI invisible al usuario final). Todo el output se hace en consola.
- El servidor backend no va a estar desplegado en todo momento durante el desarrollo de la App.

**3. Directrices detalladas**
- Escribe el código de la clase en Java o Kotlin.
- La clase simula la latencia de una petición POST con un pequeño retardo de red simulado (500ms usando corrutinas o threads).
- Imprime siempre el payload simulado en el Logcat del sistema mediante comandos como `Log.d("FakeREST", "Payload...")`.
- Guarda cada envío falsificado en una simple lista en memoria interna de la clase.

**4. Comentarios y Notación de Cabecera (Obligatorio)**
Inserta este esquema lógico en los comentarios del código:
```text
                              --------- PeticionarioRESTFake ------
                              |
                              | urlDestino: Text
                              | dbLocal: [Medicion]
                              |
       valor: R, ts: N --> hacerPeticionPOST() --> exito: B
                              |
                              -------------------------------------
> hacerPeticionPOST() = Público
> urlDestino, dbLocal = Privados
```

**5. Tests automáticos**
Genera una prueba en JUnit 4 o 5:
- Instancia la clase, y llama a `hacerPeticionPOST()` simulando el escaneo de un iBeacon.
- Afirma que la respuesta retorne booleano `True` (simulando HTTP 201).
- Verifica que el array interno ha incrementado su tamaño y contiene el valor de prueba.

---

## Prompt 5: Lógica Fake en el Navegador (Web)

**Rol:** Eres un ingeniero Front-end de alto nivel.
**Tarea:** Crear la capa de acceso a datos simulada (Mock) para el cliente web del proyecto.

**1. Diseño Gráfico / Arquitectónico**
El servicio JavaScript `LogicaFakeWeb` actúa como un conector ciego para la interfaz gráfica. Reemplaza al verdadero API de recuperación de red.

**2. Aclaraciones sobre el diseño**
- Inyectaremos un array JSON hardcodeado de mediciones de ozono para diseñar la tabla web.

**3. Directrices detalladas**
- Código nativo Vanilla JavaScript (ES6+).
- Crea una función asíncrona que envuelva la devolución de datos en una promesa que tarda 1000 milisegundos en resolver (`setTimeout`), emulando la lentitud del backend.
- Provee un array base con al menos 4 registros con datos válidos de ozono con timestamps secuenciales recientes.

**4. Comentarios y Notación de Cabecera (Obligatorio)**
Notación estricta de la asignatura a incluir en la cabecera del fichero:
```text
                              --------- LogicaFakeWeb -------------
                              |
                              | dbLocalFake: [Medicion]
                              |
               [Medicion] <-- recuperarMediciones() <--
                              |
                              -------------------------------------
> recuperarMediciones() = Público
> dbLocalFake = Privado
```

**5. Tests automáticos**
Proporciona un micro-test automático (puede ser compatible con Jest o simplemente un bloque JS):
- Ejecuta `recuperarMediciones()`.
- Espera la resolución de la Promesa.
- Afirma que el resultado es un array de objetos con las claves requeridas (`id`, `valor`, `timestamp`).

---

## Prompt 6: Interfaz Gráfica (UX) en el Navegador

**Rol:** Eres un maquetador web experto en UX/UI responsiva.
**Tarea:** Diseñar y construir una página web muy sencilla y adaptativa que consuma la lógica de datos fake.

**1. Diseño Gráfico / Arquitectónico**
El layout es de una sola vista, estilo "Mobile-First". Un encabezado limpio con el título del proyecto y el panel central ocupado totalmente por una tabla simple horizontal en la que se muestran filas sucesivas.

**2. Aclaraciones sobre el diseño**
- Solo HTML, CSS y Vanilla JS.
- La tabla debe tener buen contraste de colores y reajustar los anchos en pantallas móviles pequeñas.

**3. Directrices detalladas**
- Genera el código para 3 archivos en la misma carpeta: `index.html`, `style.css` y `app.js`.
- El archivo CSS usará estilos sencillos y flexbox/grids para la adaptación.
- El archivo `app.js` importará/instanciará la capa de datos (`LogicaFakeWeb`), llamará a la función asíncrona y, usando el API de DOM estándar, iterará el array dibujando los tags `<tr>` y `<td>` incrustándolos en el cuerpo `<tbody>`.

**4. Comentarios y Notación de Cabecera (Obligatorio)**
```text
                              --------- InterfazGraficaWeb --------
                              |
                              | fakeLogic: LogicaFakeWeb
                              |
                           --> actualizarTablaDOM() -->
                              |
                              -------------------------------------
> actualizarTablaDOM() = Público
> fakeLogic = Privado
```

**5. Tests automáticos**
Crea un test de integración de renderizado DOM (ejemplo: empleando Jest + JSDOM):
- Instancia y mockea la promesa de la Lógica Fake devolviendo exactamente 2 ítems ficticios.
- Fuerza el renderizado invocando a `actualizarTablaDOM()`.
- Aserción: Comprueba que al interrogar el documento en `document.querySelectorAll("tbody tr")` devuelve exactamente un número igual a 2.
