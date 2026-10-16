# Especificación de Diseño: Lógica de Negocio (`business_logic_design.md`)

## 1. Diseño del Componente

### Diseño Lógico de la Clase de Negocio (Notación Formal de la Asignatura)

```text
                              --------- LogicaDeNegocio -----------
                              |
                              | db: BaseDeDatos
                              |
       valor: R, ts: N    --> procesarNuevaMedicion() -->
                              |
                              |
               [Medicion] <-- obtenerTodasMediciones() <--
                              |
                              -------------------------------------
> procesarNuevaMedicion() = Público (Mutador: aplica reglas de validación y delega inserción)
> obtenerTodasMediciones() = Público (Inspector: recupera todas las mediciones de dominio)
> db = Privado (Instancia inyectada del adaptador de persistencia)
```

Donde:
- `valor: R` representa la concentración de ozono leída por el sensor.
- `ts: N` representa la marca temporal Unix Epoch de la medición.
- `[Medicion]` representa una lista/colección de agregaciones de tipo `Medicion = ( id: Z, valor: R, timestamp: N )`.

---

## 2. Aclaraciones del Diseño

- **100% Independiente de la Comunicación:** Esta capa no posee ningún conocimiento de protocolos de red, HTTP, códigos de estado, cabeceras, rutas ni frameworks web. Trabaja exclusivamente con tipos abstractos y de dominio (`R`, `N`, `Z`, `[Medicion]`).
- **Inyección de Dependencias:** La instancia de `BaseDeDatos` se inyecta obligatoriamente a través del constructor. Esto permite aislar por completo la lógica funcional durante los tests unitarios mediante dobles de prueba (*mocks*).
- **Regla de Validación de Dominio:** Se garantiza la integridad de los datos físicos: si `valor < 0`, el método `procesarNuevaMedicion` rechaza la operación inmediatamente lanzando un error descriptivo (`Error("El valor de ozono no puede ser negativo")`), impidiendo que valores corruptos alcancen la base de datos.
- **Alineación con Persistencia:** Si la validación es satisfactoria, delega en `db.insertarMedicion(valor, ts)`. La lectura delega en `db.recuperarMediciones()`.

---

## 3. Reglas Generales

- **Lenguaje de Programación:** TypeScript.
- **Encabezados de Funciones/Métodos:** El encabezado de cada método debe incluir su diseño lógico formal delimitado por líneas discontinuas (`--------------------`).
- **Legibilidad del Código:** Arquitectura limpia (Clean Architecture), código modular, declarativo y fuertemente tipado.
- **Pruebas Automatizadas:** Tests unitarios automatizados con Jest haciendo uso de un *mock* de `BaseDeDatos`. Se debe verificar:
  1. Lanzamiento de excepción al procesar mediciones con valores negativos.
  2. Invocación de `insertarMedicion` exactamente 1 vez ante valores válidos.
  3. Correcta delegación de `obtenerTodasMediciones`.
