/* 1. CONFIGURACIÓN
____________________________ */

/* ---Dependencias---*/
import { nuevaBaraja } from "./api.js";



/* 2. REFERENCIAS AL HTML 
____________________________*/

const botonEmpezarJuego = document.getElementById("empezar-juego");
const estadoPartida = document.getElementById("estado-partida");



/* 3. DATOS JUGADOR
____________________________*/




/* 4. FUNCIONES 
____________________________*/




/* 5. EVENTOS 
____________________________*/
botonEmpezarJuego.addEventListener("click", async () => {
    estadoPartida.textContent = "Preparando la baraja..."

    const barajaAPI = await nuevaBaraja();
    if (barajaAPI.error) {
        console.error("No se ha podido obtener una baraja nueva.",
            barajaAPI.error
        );
        return;
    }

    const datosBaraja = barajaAPI.data;
    console.log(datosBaraja);
})



/* 6. INICIO 
____________________________*/