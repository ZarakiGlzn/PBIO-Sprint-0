package org.jordi.prueba2025;

import android.util.Log;
import java.util.ArrayList;
import java.util.List;

/*
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
*/
public class PeticionarioRESTFake {
    private String urlDestino;
    private List<Medicion> dbLocal;

    public PeticionarioRESTFake(String urlDestino) {
        this.urlDestino = urlDestino;
        this.dbLocal = new ArrayList<>();
    }

    public PeticionarioRESTFake() {
        this("http://localhost:3000/mediciones");
    }

    public boolean hacerPeticionPOST(double valor, long ts) {
        // Simular latencia de red de 500ms
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Construir e imprimir el payload simulado en Logcat
        String payload = String.format(java.util.Locale.US, "{\"valor\": %.2f, \"timestamp\": %d}", valor, ts);
        try {
            Log.d("FakeREST", "Payload simulado enviado a " + this.urlDestino + " -> " + payload);
        } catch (RuntimeException ignored) {
            System.out.println("[FakeREST] Payload simulado enviado a " + this.urlDestino + " -> " + payload);
        }

        // Guardar cada envío falsificado en la lista interna en memoria
        int nuevoId = this.dbLocal.size() + 1;
        Medicion medicion = new Medicion(nuevoId, valor, ts);
        this.dbLocal.add(medicion);

        // Retorna booleano True simulando HTTP 201 Created
        return true;
    }

    public List<Medicion> getDbLocal() {
        return this.dbLocal;
    }

    public String getUrlDestino() {
        return this.urlDestino;
    }
}
