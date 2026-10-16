package org.jordi.clienterestandroid;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
public class MainActivity extends ActionBarActivity {

    private TextView elTexto;
    private Button elBotonEnviar;

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        this.elTexto = (TextView) findViewById(R.id.elTexto);
        this.elBotonEnviar = (Button) findViewById(R.id.botonEnviar);


        Log.d("clienterestandroid", "fin onCreate()");
    }


    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    public void boton_enviar_pulsado (View quien) {
        Log.d("clienterestandroid", "boton_enviar_pulsado");
        this.elTexto.setText("pulsado");

		// ojo: creo que hay que crear uno nuevo cada vez
        PeticionarioRest elPeticionario = new PeticionarioREST();

		/*

		   enviarPeticion( "hola", function (res) {
		   		res
		   })

        elPeticionario.hacerPeticionREST("GET",  "http://158.42.144.126:8080/prueba", null,
			(int codigo, String cuerpo) => { } );

		   */

        elPeticionario.hacerPeticionREST("GET",  "http://158.42.144.126:8080/prueba", null,
                new PeticionarioREST.RespuestaREST () {
                    @Override
                    public void callback(int codigo, String cuerpo) {
                        elTexto.setText ("codigo respuesta= " + codigo + " <-> \n" + cuerpo);
                    }
                }
        );

		// (int codigo, String cuerpo) -> { elTexto.setText ("lo que sea"=; }

		   String textoJSON = "{ 'dni': '" + elDni + "' }";

		   "{ 'dni': '2023423434' }";
		
        /*


		/* otro ejemplo:
		elPeticionario.hacerPeticionREST("POST", "http://192.168.1.113:8080/mensaje",
				"{\"dni\": \"A9182342W\", \"nombre\": \"Android\", \"apellidos\": \"De Los Palotes\"}",
				new PeticionarioREST.RespuestaREST () {
					@Override
					public void callback(int codigo, String cuerpo) {
						elTexto.setText ("cdigo respuesta: " + codigo + " <-> \n" + cuerpo);
					}
		});
		*/

		/*
        elPeticionario.hacerPeticionREST("GET",  "https://jsonplaceholder.typicode.com/posts/2", ... 

    } // pulsado ()

    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

} // class


