/* 1. CONFIGURACIÓN
____________________________ */

/* ---Dependencias---*/
import { nuevaBaraja, robarCarta } from "./api.js";



/* 2. REFERENCIAS AL HTML 
____________________________*/

const botonEmpezarJuego = document.getElementById("empezar-juego");
const estadoPartida = document.getElementById("estado-partida");



/* 3. DATOS JUGADOR
____________________________*/




/* 4. FUNCIONES 
____________________________*/
function comprobarError(valor) {
    if (valor.error) {
        console.error("No se ha podido preparar la baraja",
            valor.error
        );
        return true;
    }
}



/* 5. EVENTOS 
____________________________*/
botonEmpezarJuego.addEventListener("click", async () => {
    estadoPartida.textContent = "Preparando la baraja..."

    const barajaAPI = await nuevaBaraja();
    if (comprobarError(barajaAPI)) { return; }

    const datosBaraja = barajaAPI.data;
    console.log(datosBaraja);

    const roboCarta = await robarCarta(datosBaraja.deck_id, 1);
    if (comprobarError(roboCarta)) { return; }

    const cartaRobada = roboCarta.data.cards[0];
    console.log(cartaRobada);
})



/* 6. INICIO 
____________________________*/