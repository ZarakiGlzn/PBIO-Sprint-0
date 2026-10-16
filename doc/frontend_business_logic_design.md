# Especificación de Diseño: Lógica de Negocio del Cliente (`frontend_business_logic_design.md`)

## 1. Diseño del Componente

### Diseño Lógico del Proxy de Lógica del Cliente (Notación Formal de la Asignatura)

```text
                              --------- LogicaCliente -------------
                              |
                              | urlApi: Text
                              | dbLocalFake: [Medicion]
                              | modo: Text
                              |
               [Medicion] <-- obtenerTodasMediciones() <--
                              |
                              -------------------------------------
> obtenerTodasMediciones() = Público (Inspector asíncrono: retorna colección [Medicion])
> urlApi = Privado (URL base del backend REST)
> dbLocalFake = Privado (Almacén de mediciones simuladas para pruebas aisladas)
> modo = Privado (Indicador de modo activo: 'fake' o 'real')
```

Donde:
- `[Medicion]` es la colección de entidades de dominio `Medicion = ( id: Z, valor: R, timestamp: N )`.

---

## 2. Aclaraciones del Diseño

- **Paridad de Interfaz con el Backend:** El método `obtenerTodasMediciones()` tiene el nombre, parámetros y tipos de retorno idénticos a su contraparte en `business_logic_design.md`, cumpliendo el principio de paridad de firmas y la regla del subconjunto.
- **Desacoplamiento Estricto de la GUI:** La interfaz gráfica (GUI) no conoce ni ejecuta mecanismos de transporte (`fetch`, `XMLHttpRequest`, `WebSocket`). La GUI interactúa exclusivamente con `LogicaCliente`.
- **Comunicación Encapsulada (Proxy / Fake):**
  - **Modo Fake (evaluación y desarrollo local):** Devuelve una lista en memoria con 4 registros representativos tras un retardo simulado de 1000ms (`setTimeout`), permitiendo probar y maquetar la UI sin requerir el backend encendido.
  - **Modo Real (demostración en vivo):** Encapsula la llamada de red (`fetch(urlApi)`) al servidor REST (`GET /mediciones`) y deserializa el JSON de mediciones reales recibidas.
- **Transición Transparente:** La GUI invoca `obtenerTodasMediciones()` sin importar si por debajo se resuelve mediante memoria local o mediante petición HTTP a la red.

---

## 3. Reglas Generales

- **Lenguaje de Programación:** JavaScript (ES6+ Vanilla).
- **Encabezados de Funciones/Métodos:** El encabezado de cada método debe incluir su diseño lógico formal delimitado por líneas discontinuas (`--------------------`).
- **Legibilidad del Código:** Patrón Proxy/Adapter limpio, modular, sin dependencias externas pesadas.
- **Pruebas Automatizadas:** Pruebas unitarias automatizadas con Jest validando que `obtenerTodasMediciones()` resuelve correctamente una colección de objetos con los atributos `id`, `valor` y `timestamp`.
