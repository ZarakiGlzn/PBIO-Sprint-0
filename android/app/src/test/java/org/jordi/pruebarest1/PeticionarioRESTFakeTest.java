package org.jordi.pruebarest1;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class PeticionarioRESTFakeTest {
    private PeticionarioRESTFake peticionario;

    @Before
    public void setUp() {
        peticionario = new PeticionarioRESTFake("http://localhost:3000/mediciones");
    }

    @Test
    public void testHacerPeticionPOST_SimulandoEscaneoIBeacon() {
        // Simulación de valores recibidos tras escanear un iBeacon de Ozono
        double valorOzonoSimulado = 37.8;
        long timestampSimulado = 1712854000L;

        // 1. Invocar a hacerPeticionPOST()
        boolean resultado = peticionario.hacerPeticionPOST(valorOzonoSimulado, timestampSimulado);

        // 2. Afirmar que retorna True simulando respuesta HTTP 201 Created
        assertTrue("La respuesta debe ser True simulando HTTP 201 Created", resultado);

        // 3. Verificar que la lista interna incrementa su tamaño y contiene los datos simulados
        assertEquals("El array interno debe contener 1 elemento", 1, peticionario.getDbLocal().size());

        Medicion medicion = peticionario.getDbLocal().get(0);
        assertEquals("El ID debe ser autoincremental asignado (1)", 1, medicion.getId());
        assertEquals("El valor debe coincidir con la lectura simulada", valorOzonoSimulado, medicion.getValor(), 0.001);
        assertEquals("El timestamp debe coincidir", timestampSimulado, medicion.getTimestamp());
    }

    @Test
    public void testHacerMultiplesPeticionesPOST() {
        peticionario.hacerPeticionPOST(15.2, 1712854001L);
        peticionario.hacerPeticionPOST(22.9, 1712854002L);

        assertEquals(2, peticionario.getDbLocal().size());
        assertEquals(15.2, peticionario.getDbLocal().get(0).getValor(), 0.001);
        assertEquals(22.9, peticionario.getDbLocal().get(1).getValor(), 0.001);
    }
}
