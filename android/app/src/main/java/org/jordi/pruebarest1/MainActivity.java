// ============================================================================
// Fichero: MainActivity.java
// Descripción: Actividad principal de la app Android receptora de tramas BLE
// Copyright: (c) 2026 Sergio García Camacho
// Fecha: 14/10/2026
// Autor: Sergio García Camacho
// Aportación: Escaneo de iBeacons GTI3A-2025, descodificación de ozono y reenvío REST
// ============================================================================

package org.jordi.pruebarest1;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

public class MainActivity extends AppCompatActivity {

    private static final String ETIQUETA_LOG = ">>>>";
    private static final int CODIGO_PETICION_PERMISOS = 11223344;

    private BluetoothLeScanner elEscanner;
    private ScanCallback callbackDelEscaneo = null;
    private PeticionarioRESTFake elPeticionarioFake = new PeticionarioRESTFake();
    private TextView textoEstado;
    private long ultimoTimestampEnvioMs = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        textoEstado = findViewById(R.id.textoEstado);

        inicializarBlueTooth();
    }

    // ------------------------------------------------------------------------
    // --> inicializarBlueTooth() -->
    // Obtiene el adaptador Bluetooth, el escáner BTLE y solicita permisos runtime.
    // ------------------------------------------------------------------------
    private void inicializarBlueTooth() {
        Log.d(ETIQUETA_LOG, "inicializarBlueTooth(): empieza");
        BluetoothAdapter bta = BluetoothAdapter.getDefaultAdapter();

        if (bta != null) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
                bta.enable();
            }
            this.elEscanner = bta.getBluetoothLeScanner();
        }

        // Petición de permisos modernos para Android 12+ y anteriores
        requestPermissions(new String[]{
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
        }, CODIGO_PETICION_PERMISOS);

        Log.d(ETIQUETA_LOG, "inicializarBlueTooth(): termina");
    }

    // ------------------------------------------------------------------------
    // dispositivo: Text --> buscarEsteDispositivoBTLE() -->
    // Inicia el escaneo BLE filtrando por el nombre de la placa emisora iBeacon.
    // ------------------------------------------------------------------------
    private void buscarEsteDispositivoBTLE(final String dispositivoBuscado) {
        Log.d(ETIQUETA_LOG, "buscarEsteDispositivoBTLE(): buscando " + dispositivoBuscado);
        if (this.elEscanner == null) {
            Log.e(ETIQUETA_LOG, "No hay escáner Bluetooth disponible.");
            return;
        }

        this.callbackDelEscaneo = new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult resultado) {
                super.onScanResult(callbackType, resultado);
                mostrarInformacionDispositivoBTLE(resultado);
            }

            @Override
            public void onScanFailed(int errorCode) {
                super.onScanFailed(errorCode);
                Log.e(ETIQUETA_LOG, "Scan fallido con código: " + errorCode);
            }
        };

        ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED) {
            this.elEscanner.startScan(null, settings, this.callbackDelEscaneo);
            actualizarEstado("Escaneando en busca de " + dispositivoBuscado + "...");
        }
    }

    // ------------------------------------------------------------------------
    // resultado: ScanResult --> mostrarInformacionDispositivoBTLE() -->
    // Procesa el iBeacon detectado, decodifica el valor en Minor y lo envía al Fake REST.
    // ------------------------------------------------------------------------
    private void mostrarInformacionDispositivoBTLE(ScanResult resultado) {
        byte[] bytes = resultado.getScanRecord() != null ? resultado.getScanRecord().getBytes() : null;
        if (bytes == null || bytes.length < 30) return;

        // Comprobar coincidencia por nombre (GTI3A) o por el UUID iBeacon (EPSG-GTI-PROY-3A)
        String nombre = null;
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED) {
            if (resultado.getDevice() != null) {
                nombre = resultado.getDevice().getName();
            }
        }
        if (nombre == null && resultado.getScanRecord() != null) {
            nombre = resultado.getScanRecord().getDeviceName();
        }

        TramaIBeacon tib = new TramaIBeacon(bytes);
        byte[] uuidBytes = tib.getUUID();
        String uuidStr = uuidBytes != null ? new String(uuidBytes, java.nio.charset.StandardCharsets.US_ASCII) : "";

        boolean coincideNombre = (nombre != null && (nombre.contains("GTI3A") || nombre.contains("Sergio")));
        boolean coincideUUID = uuidStr.contains("EPSG-GTI");

        if (!coincideNombre && !coincideUUID) {
            return; // No es nuestro dispositivo
        }

        long ahoraMs = System.currentTimeMillis();
        // Limitar el ritmo de envío: máximo 1 medición cada 4 segundos para evitar saturación
        if (ahoraMs - ultimoTimestampEnvioMs < 4000) {
            return;
        }
        ultimoTimestampEnvioMs = ahoraMs;

        int minorInt = Utilidades.bytesToInt(tib.getMinor());
        double valorOzono = (double) minorInt;
        long timestampActual = System.currentTimeMillis() / 1000L;

        Log.d(ETIQUETA_LOG, "****************************************************");
        Log.d(ETIQUETA_LOG, "Dispositivo detectado: " + (nombre != null ? nombre : "UUID EPSG-GTI"));
        Log.d(ETIQUETA_LOG, "Valor Ozono recibido (minor) = " + valorOzono + " ppm");
        Log.d(ETIQUETA_LOG, "Timestamp = " + timestampActual);
        Log.d(ETIQUETA_LOG, "****************************************************");

        // 1. Reenvío mediante la capa de Lógica Fake (Prompt 4)
        boolean exitoFake = this.elPeticionarioFake.hacerPeticionPOST(valorOzono, timestampActual);

        // 2. Envío concurrente al Servidor REST real para la demostración web en vivo
        enviarAlServidorRESTReal(valorOzono, timestampActual);

        actualizarEstado("Recibido de placa: " + valorOzono + " ppm (Enviado a Fake y Backend)");
    }

    // ------------------------------------------------------------------------
    // valor: R, ts: N --> enviarAlServidorRESTReal() -->
    // Envía la medición captada por BLE al servidor backend HTTP en localhost:3000
    // (a través del puerto invertido adb reverse por cable USB).
    // ------------------------------------------------------------------------
    private void enviarAlServidorRESTReal(double valor, long ts) {
        new Thread(() -> {
            try {
                java.net.URL url = new java.net.URL("http://127.0.0.1:3000/mediciones");
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; utf-8");
                conn.setDoOutput(true);
                conn.setConnectTimeout(2500);
                conn.setReadTimeout(2500);

                String json = String.format(java.util.Locale.US, "{\"valor\": %.2f, \"timestamp\": %d}", valor, ts);
                try (java.io.OutputStream os = conn.getOutputStream()) {
                    byte[] input = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                int code = conn.getResponseCode();
                Log.d(ETIQUETA_LOG, "Envío a Servidor REST real -> Código HTTP: " + code);
                conn.disconnect();
            } catch (Exception e) {
                Log.d(ETIQUETA_LOG, "Servidor REST local no disponible (modo offline): " + e.getMessage());
            }
        }).start();
    }

    // ------------------------------------------------------------------------
    // --> detenerBusquedaDispositivosBTLE() -->
    // Detiene el escaneo activo de dispositivos BLE.
    // ------------------------------------------------------------------------
    private void detenerBusquedaDispositivosBTLE() {
        if (this.elEscanner != null && this.callbackDelEscaneo != null) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED) {
                this.elEscanner.stopScan(this.callbackDelEscaneo);
            }
            this.callbackDelEscaneo = null;
            actualizarEstado("Búsqueda BTLE detenida.");
        }
    }

    public void botonBuscarNuestroDispositivoBTLEPulsado(View v) {
        buscarEsteDispositivoBTLE("GTI3A-2025");
    }

    public void botonDetenerBusquedaDispositivosBTLEPulsado(View v) {
        detenerBusquedaDispositivosBTLE();
    }

    // ------------------------------------------------------------------------
    // Sprint 0: Envío manual con la capa de Lógica Fake
    // ------------------------------------------------------------------------
    public void probarFakeREST_pulsado(View v) {
        double valorOzono = 35.5;
        long ts = System.currentTimeMillis() / 1000L;
        boolean exito = this.elPeticionarioFake.hacerPeticionPOST(valorOzono, ts);
        actualizarEstado("Envío Fake manual: " + valorOzono + " ppm (Éxito = " + exito + ")");
    }

    private void actualizarEstado(final String mensaje) {
        runOnUiThread(() -> {
            if (textoEstado != null) {
                textoEstado.setText("Estado: " + mensaje);
            }
        });
    }
}
