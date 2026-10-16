package org.jordi.pruebarest1;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
public class MainActivity extends AppCompatActivity {

    // ---------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    } // ()

    // ---------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    public void prueba1_pulsado(View v) {
        Log.d( "pruebasPeticionario", "prueba1_pulsado() empieza");

        probarEnviarPOST();

        Log.d( "pruebasPeticionario", "prueba1_pulsado() termina");
    } // ()

    // ---------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    private void probarEnviarPOST() {
        PeticionarioREST elPeticionario = new PeticionarioREST();

        elPeticionario.hacerPeticionREST("POST",  "https://httpbin.org/post",

                "{ 'title': 'El Conde de Montecristo', 'body': 'Puros Habanos', 'userId': 1234}",
                new PeticionarioREST.RespuestaREST () {
                    @Override
                    public void callback(int codigo, String cuerpo) {
                        Log.d( "pruebasPeticionario", "TENGO RESPUESTA:\ncodigo = " + codigo + "\ncuerpo: \n" + cuerpo);

                    }
                }
        );

        //elPeticionario.hacerPeticionREST("POST",  "https://jsonplaceholder.typicode.com/posts",
        //elPeticionario.hacerPeticionREST("POST",  "https://reqbin.com/echo/post/json",

    } // ()

    // ---------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    private void probarEnviarGET() {
        PeticionarioREST elPeticionario = new PeticionarioREST();

        //elPeticionario.hacerPeticionREST("GET",  "https://jsonplaceholder.typicode.com/posts/101",
        elPeticionario.hacerPeticionREST("GET",  "https://jsonplaceholder.typicode.com/users/1234/posts",
                null,
                new PeticionarioREST.RespuestaREST () {
                    @Override
                    public void callback(int codigo, String cuerpo) {
                        Log.d( "pruebasPeticionario", "codigo = " + codigo + "\n" + cuerpo);
                    }
                }
        );

    } // ()

    // ---------------------------------------------------------------------------------------------
    // ---------------------------------------------------------------------------------------------
    private void probarEnviarGET_Otra() {
        PeticionarioREST elPeticionario = new PeticionarioREST();

        elPeticionario.hacerPeticionREST("GET",  "https://reqbin.com/echo", null,
                new PeticionarioREST.RespuestaREST () {
                    @Override
                    public void callback(int codigo, String cuerpo) {
                        Log.d( "pruebasPeticionario", "codigo = " + codigo + "\n" + cuerpo);
                    }
                }
        );

    } // ()

} // class
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------
