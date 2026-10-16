# Especificación de Diseño: Base de Datos (`database_design.md`)

## 1. Diseño del Componente

### Especificación de Tablas Relacionales

- **TABLE:** `mediciones`
- **DESCRIPTION:** Almacena el histórico de mediciones de concentración de ozono captadas por el sensor y transmitidas a través de la arquitectura del sistema.
- **COLUMNS:**
  - `id`: `Z` (INTEGER), PRIMARY KEY, AUTOINCREMENT, NOT NULL. Identificador secuencial único de la medición.
  - `valor`: `R` (REAL), NOT NULL. Valor numérico decimal que representa la concentración de ozono en partes por millón (ppm).
  - `timestamp`: `N` (INTEGER), NOT NULL. Marca temporal en formato Unix Epoch (segundos transcurridos desde 1970-01-01 UTC).
- **PRIMARY KEY:** `id`
- **FOREIGN KEYS:** Ninguna.
- **CONSTRAINTS:** `valor >= 0` (La concentración de ozono no puede ser negativa).

### Diseño Lógico de la Clase Adaptadora (Notación Formal de la Asignatura)

```text
                              --------- BaseDeDatos ----------------
                              |
                              | conexion: Text
                              |
       valor: R, ts: N    --> insertarMedicion() -->
                              |
                              |
               [Medicion] <-- recuperarMediciones() <--
                              |
                              --------------------------------------
> insertarMedicion() = Público (Mutador: inserta registro en la tabla mediciones)
> recuperarMediciones() = Público (Inspector: recupera colección [Medicion])
> conexion = Privado (Cadena de conexión o descriptor a la base de datos SQLite)
```

Donde el tipo abstracto de dominio es:
`Medicion = ( id: Z, valor: R, timestamp: N )`

---

## 2. Aclaraciones del Diseño

- Se utiliza **SQLite** mediante la librería nativa de Node.js (`node:sqlite` / `DatabaseSync`) para máxima ligereza y portabilidad en el Sprint 0.
- El adaptador encapsula completamente las sentencias SQL preparadas (`prepared statements`), protegiendo el sistema contra inyecciones SQL y desacoplando el motor SQL del resto del software.
- La función `insertarMedicion` ejecuta `INSERT INTO mediciones (valor, timestamp) VALUES (?, ?)`.
- La función `recuperarMediciones` ejecuta `SELECT id, valor, timestamp FROM mediciones ORDER BY id ASC`.

---

## 3. Reglas Generales

- **Lenguaje de Programación:** TypeScript (Node.js v22+ con soporte SQLite nativo).
- **Encabezados de Funciones/Métodos:** El encabezado de cada método debe incluir su diseño lógico formal delimitado por líneas discontinuas (`--------------------`).
- **Legibilidad del Código:** Código limpio, autoexplicativo, con tipado estático estricto y sin comentarios superfluos.
- **Pruebas Automatizadas:** Cobertura de pruebas unitarias automatizadas con Jest, empleando base de datos en memoria (`:memory:`) para validar inserción y lectura sin efectos colaterales persistentes.
