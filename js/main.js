/* 1. CONFIGURACIÓN
____________________________ */

/* ---Dependencias---*/
import { nuevaBaraja, robarCarta } from "./api.js";



/* 2. REFERENCIAS AL HTML 
____________________________*/

const botonEmpezarJuego = document.getElementById("empezar-juego");
const estadoPartida = document.getElementById("estado-partida");
const zonaCarta = document.getElementById("carta-actual");
const botonMayor = document.getElementById("predecir-mayor");
const botonMenor = document.getElementById("predecir-menor");
const racha = document.getElementById("racha-actual");



/* 3. DATOS JUEGO
____________________________*/

let barajaJuego = null;
let rondasPartida = 0;
let cartaActual = null;
let rachaPuntos = 0;


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

function mostrarCarta(carta) {
    const imagenCarta = document.createElement("img");
    imagenCarta.src = carta.image;
    imagenCarta.alt = carta.value + " - " + carta.suit;

    zonaCarta.replaceChildren(imagenCarta);
}

function valorCarta(carta) {
    if (carta.value === "JACK") return 11;
    if (carta.value === "QUEEN") return 12;
    if (carta.value === "KING") return 13;
    if (carta.value === "ACE") return 1;

    return Number(carta.value);
}

/* 5. JUEGO 
____________________________*/

botonEmpezarJuego.addEventListener("click", async () => {

    if (rondasPartida === 0) {
        const barajaAPI = await nuevaBaraja();
        if (comprobarError(barajaAPI)) { return; }

        barajaJuego = barajaAPI.data;

        const roboCarta = await robarCarta(barajaJuego.deck_id, 1);
        if (comprobarError(roboCarta)) { return; }

        const cartaRobada = roboCarta.data.cards[0];
        mostrarCarta(cartaRobada);
        console.log(cartaRobada);

        cartaActual = cartaRobada;

        botonMayor.disabled = false;
        botonMenor.disabled = false;

        rondasPartida++;
    }
})

botonMayor.addEventListener("click", async () => {
    const roboCarta = await robarCarta(barajaJuego.deck_id, 1);
    if (comprobarError(roboCarta)) { return; }

    const cartaRobada = roboCarta.data.cards[0];
    mostrarCarta(cartaRobada);

    const valorActual = valorCarta(cartaRobada);
    const valorAnterior = valorCarta(cartaActual);

    if (valorActual > valorAnterior) {
        estadoPartida.textContent = "¡Correcto!";
        rachaPuntos++;
    } else if (valorActual < valorAnterior) {
        estadoPartida.textContent = "Ooooh...";
        rachaPuntos = 0;
    } else {
        estadoPartida.textContent = "Empate. Mantienes la racha.";
    }

    racha.textContent = rachaPuntos;
    cartaActual = cartaRobada;
    rondasPartida++;
})

botonMenor.addEventListener("click", async () => {
    const roboCarta = await robarCarta(barajaJuego.deck_id, 1);
    if (comprobarError(roboCarta)) { return; }

    const cartaRobada = roboCarta.data.cards[0];
    mostrarCarta(cartaRobada);

    const valorActual = valorCarta(cartaRobada);
    const valorAnterior = valorCarta(cartaActual);

    if (valorActual < valorAnterior) {
        estadoPartida.textContent = "¡Correcto!";
        rachaPuntos++;
    } else if (valorActual > valorAnterior) {
        estadoPartida.textContent = "Ooooh..."
        rachaPuntos = 0;
    } else {
        estadoPartida.textContent = "Empate. Mantienes la racha.";
    }
    racha.textContent = rachaPuntos;
    cartaActual = cartaRobada
    rondasPartida++;
})


