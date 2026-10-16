# Logical Design Reverse Engineering

Based on the provided codebase, here is the structural logical design extracted following the rules in `Logical_Design_RE_Rules_v3.md`:

## Placa (Arduino)

### Medidor
```text
                 --------- Medidor ------------------
                 |
                 |
                 |
             iniciarMedidor() -->              // Inicializa el hardware del sensor
                 |
                 |
            Z <-- medirCO2() <--                       // Obtiene la lectura del nivel de CO2
                 |
                 |
            Z <-- medirTemperatura() <--               // Obtiene la lectura de la temperatura
                 |
                 ------------------------------------
```

### LED
```text
                 --------- LED ----------------------
                 |
                 | numeroLED: Z
                 | encendido: B
                 |
                 |
     numero: Z   --> LED() -->                         // Crea el objeto y asigna el pin
                 |
                 |
                 --> encender() -->                    // Enciende la luz del LED
                 |
                 |
                 --> apagar() -->                      // Apaga la luz del LED
                 |
                 |
                 --> alternar() -->                    // Cambia el estado (de apagado a encendido y viceversa)
                 |
                 |
     tiempo: Z   --> brillar() -->                     // Enciende el LED por un tiempo y lo apaga
                 |
                 ------------------------------------
```

### EmisoraBLE
```text
                 --------- EmisoraBLE ---------------
                 |
                 | nombreEmisora: Text
                 | fabricanteID: N
                 | txPower: Z
                 |
                 |
nombreEmisora: Text, fabricanteID: N, txPower: Z --> EmisoraBLE() -->              // Configura nombre, ID y potencia
                 |
                 |
             encenderEmisora() -->             // Inicializa el módulo Bluetooth
                 |
                 |
              detenerAnuncio() -->              // Para la emisión de la señal BLE
                 |
                 |
            B <-- estaAnunciando() <--                 // Comprueba si está emitiendo actualmente
                 |
                 |
beaconUUID: [N]_16, major: Z, minor: Z, rssi: N --> emitirAnuncioIBeacon() -->    // Emite el estándar iBeacon con datos
                 |
                 |
carga: Text, tamanyoCarga: N --> emitirAnuncioIBeaconLibre() -->       // Emite iBeacon insertando carga de bytes libre
                 |
                 |
servicio: ServicioEnEmisora --> anyadirServicio() -->                 // Añade servicios BLE adicionales a la emisora
                 |
                 ------------------------------------
```

### Publicador
```text
                 --------- Publicador ---------------
                 |
                 | beaconUUID: [N]_16
                 | laEmisora: EmisoraBLE
                 | RSSI: Z
                 |
                 |
                  Publicador() -->                  // Instancia la clase Publicador
                 |
                 |
             encenderEmisora() -->             // Pone en marcha la emisora BLE interna
                 |
                 |
valorCO2: Z, contador: N, tiempoEspera: Z --> publicarCO2() -->                 // Prepara anuncio de CO2 y lo emite por un tiempo
                 |
                 |
valorTemperatura: Z, contador: N, tiempoEspera: Z --> publicarTemperatura() -->         // Prepara anuncio de Temperatura y lo emite
                 |
                 ------------------------------------
```

### PuertoSerie
```text
                 --------- PuertoSerie --------------
                 |
                 |
                 |
    baudios: Z   --> PuertoSerie() -->                 // Inicia la comunicación serial a los baudios definidos
                 |
                 |
           esperarDisponible() <--           // Bloquea hasta que el puerto esté conectado
                 |
                 |
 mensaje: Text   --> escribir() <--                    // Imprime un texto por la consola/monitor
                 |
                 ------------------------------------
```

## Teléfono (App Receptora)

### PeticionarioREST
```text
                 --------- PeticionarioREST ---------
                 |
                 | elMetodo: Text
                 | urlDestino: Text
                 | elCuerpo: Text
                 | codigoRespuesta: Z
                 | cuerpoRespuesta: Text
                 |
                 |
            PeticionarioREST() -->            // Inicializa la tarea asíncrona de conexión
                 |
                 |
metodo: Text, urlDestino: Text, cuerpo: Text --> hacerPeticionREST() -->           // Prepara y lanza la petición HTTP al servidor
                 |
                 |
            B <-- doInBackground() -->                 // Ejecuta la petición en segundo plano (red)
                 |
                 ------------------------------------
```

## Servidor (Back-end)
*Based on the reference image provided (`Dibujo_Diseño_Proyecto_Jordi.jpeg`), the back-end code is not present in the repository, but the logical design is inferred as follows:*

### LogicaDeNegocio
```text
                 --------- LogicaDeNegocio ----------
                 |
                 |
                 |
 id: Z, codigo: Z, timestamp: Z --> guardarMedicion() -->                 // Guarda una nueva medición en la Base de Datos
                 |
                 |
      id: Z      --> recuperarMedicion() <--           // Devuelve los datos de una medición almacenada
   datos: Text   <--
                 |
                 ------------------------------------
```
