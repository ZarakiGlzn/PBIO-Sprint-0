# Especificación de Diseño: Comunicación (`communication_design.md`)

## 1. Diseño del Componente

### Diseño Lógico de la Fachada REST (Notación Formal de la Asignatura)

```text
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
> postMedicion() = Público (Maneja HTTP POST /mediciones)
> getMediciones() = Público (Maneja HTTP GET /mediciones)
> logica = Privado (Instancia de LogicaDeNegocio inyectada)
> puerto = Privado (Puerto TCP de escucha HTTP, ej: 3000)
```

### Especificación de Puntos de Entrada HTTP (API REST)

| Método | Ruta | Payload Entrada | Código Éxito | Código Error | Descripción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/mediciones` | `{ "valor": R, "timestamp": N }` | `201 Created` | `400 Bad Request` | Registra una nueva medición emitida por el cliente móvil. |
| `GET` | `/mediciones` | Ninguno | `200 OK` | `500 Internal Error` | Retorna el array JSON de todas las mediciones almacenadas. |

---

## 2. Aclaraciones del Diseño

- **Rol de Fachada de Transporte:** El componente `ServidorREST` actúa exclusivamente como adaptador de transporte. No implementa reglas de validación de negocio; traduce las solicitudes HTTP entrantes en llamadas a métodos de `LogicaDeNegocio`.
- **CORS Habilitado:** Configura middleware de CORS (*Cross-Origin Resource Sharing*) para permitir que los clientes web que se ejecutan en navegadores locales puedan consumir la API sin bloqueos de seguridad.
- **Parsing JSON:** Incluye middleware para deserializar automáticamente cuerpos JSON entrantes.
- **Mapeo de Respuestas:**
  - Si `logica.procesarNuevaMedicion()` se ejecuta con éxito, responde `201 Created` con JSON `{ "mensaje": "Medición guardada correctamente" }`.
  - Si la lógica de negocio lanza una excepción de validación, responde `400 Bad Request` con el mensaje de error.
  - Al solicitar `GET /mediciones`, responde `200 OK` con el listado JSON devuelto por `logica.obtenerTodasMediciones()`.

---

## 3. Reglas Generales

- **Lenguaje de Programación:** TypeScript / Node.js con Express.
- **Encabezados de Funciones/Métodos:** El encabezado de cada método debe incluir su diseño lógico formal delimitado por líneas discontinuas (`--------------------`).
- **Legibilidad del Código:** Separación limpia de rutas y middlewares, código modular y tipado.
- **Pruebas Automatizadas:** Tests de integración con `supertest` y Jest que levantan el servidor y comprueban:
  1. `POST /mediciones` con datos válidos responde HTTP 201.
  2. `GET /mediciones` responde HTTP 200 conteniendo los datos guardados.
  3. `POST /mediciones` con valor negativo responde HTTP 400.
