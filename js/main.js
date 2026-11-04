/* 1. CONFIGURACIÓN
____________________________ */

import { nuevaBaraja, robarCarta } from "./api.js";

const imagenReverso = "https://deckofcardsapi.com/static/img/back.png";


/* 2. REFERENCIAS AL HTML
____________________________ */

const botonJugar = document.getElementById("boton-jugar");
const saldoDinero = document.getElementById("saldo-dinero");

const pilaBaraja = document.getElementById("pila-baraja");

const zonaCartasBanca = document.getElementById("cartas-banca");
const puntosBanca = document.getElementById("puntos-banca");

const zonaCartasJugador = document.getElementById("cartas-jugador");
const puntosJugador = document.getElementById("puntos-jugador");

const botonPedir = document.getElementById("boton-pedir");
const botonPlantarse = document.getElementById("boton-plantarse");

const mensajeJuego = document.getElementById("mensaje-juego");
const resultadoPartida = document.getElementById("resultado-partida");


/* 3. DATOS DEL JUEGO
____________________________ */

const jugadores = [
    {
        nombre: "jugador",
        mano: [],
        puntos: 0
    },
    {
        nombre: "banca",
        mano: [],
        puntos: 0
    }
];

const jugador = jugadores[0];
const banca = jugadores[1];

let barajaJuego = null;

let partidaActiva = false;
let cargando = false;


/* 4. FUNCIONES 
____________________________*/

/* 4.1 Mostrar
--------------- */

function mostrarPila() {
    const reversoCarta = document.createElement("img");
    reversoCarta.src = imagenReverso;
    reversoCarta.alt = "Baraja boca abajo";

    pilaBaraja.replaceChildren(reversoCarta);
}

function mostrarCarta(carta, zona) {
    const imagenCarta = document.createElement("img");
    imagenCarta.src = carta.image;
    imagenCarta.alt = carta.value + " - " + carta.suit;

    zona.append(imagenCarta);
}

function mostrarMano(mano, zona) {
    //vaciamos la zona primero
    zona.replaceChildren();

    for (const carta of mano) {
        mostrarCarta(carta, zona);
    }
}

function mostrarBanca() {
    zonaCartasBanca.replaceChildren();

    mostrarCarta(banca.mano[0], zonaCartasBanca);

    const cartaOculta = document.createElement("img");
    cartaOculta.src = imagenReverso;
    cartaOculta.alt = "Carta oculta de la banca";

    zonaCartasBanca.append(cartaOculta);
    puntosBanca.textContent = "?";
}

/* 4.2 Otros
---------------*/

function valorCarta(carta) {
    if (carta.value === "JACK") return 10;
    if (carta.value === "QUEEN") return 10;
    if (carta.value === "KING") return 10;
    if (carta.value === "ACE") return 11;

    return Number(carta.value);
}

function comprobarError(valor) {
    if (valor.error) {
        console.error("No se ha podido preparar la baraja",
            valor.error
        );
        return true;
    }
}

function calcularPuntos(mano) {
    let total = 0;
    let ases = 0;

    for (const carta of mano) {
        if (carta.value === "ACE") {
            ases++;
        }
        total = total + valorCarta(carta);
    }
    while ((total > 21) && (ases > 0)) {
        total = total - 10;
        ases--;
    }
    return total;
}

function actualizarPuntos(participante, marcadorHTML) {
    participante.puntos = calcularPuntos(participante.mano);
    marcadorHTML.textContent = participante.puntos;
}

function pasarse21() {
    partidaActiva = false;

    botonPedir.disabled = true;
    botonPlantarse.disabled = true;

    mostrarMano(banca.mano, zonaCartasBanca);
    actualizarPuntos(banca, puntosBanca);

    resultadoPartida.textContent = "Te has pasado de 21. Has perdido.";
    botonJugar.disabled = false;
}

/* 5. EVENTOS DEL JUEGO 
____________________________*/

botonJugar.addEventListener("click", async () => {

    botonJugar.disabled = true;
    resultadoPartida.textContent = "";

    //conseguimos y comprobamos baraja nueva para jugar
    const barajaAPI = await nuevaBaraja();
    if (comprobarError(barajaAPI)) {
        botonJugar.disabled = false;
        return;
    }

    barajaJuego = barajaAPI.data;

    //hacemos el robo y reparto inicial de cartas
    const roboAPI = await robarCarta(barajaJuego.deck_id, 4);
    if (comprobarError(roboAPI)) {
        botonJugar.disabled = false;
        return;
    }

    const cartasRobadas = roboAPI.data.cards;

    //limpiamos las manos de turnos anteriores
    for (const jugador of jugadores) {
        jugador.mano = [];
    }

    /* Bucle de reparto incial. 
     El total de cartas las repartimos entre el total de jugadores en orden */
    for (let i = 0; i < cartasRobadas.length; i++) {
        const jugador = jugadores[i % jugadores.length];
        jugador.mano.push(cartasRobadas[i]);
    }

    partidaActiva = true;
    botonPedir.disabled = false;
    botonPlantarse.disable = false;

    mostrarPila();
    mostrarMano(jugador.mano, zonaCartasJugador);
    actualizarPuntos(jugador, puntosJugador);
    mostrarBanca();

})

botonPedir.addEventListener("click", async () => {

    //evitamos poder pulsar el botón varias veces o cuando no toca
    if ((partidaActiva === false) || (cargando === true)) {
        return;
    }
    //la petición está cargando
    cargando = true;

    //robamos la carta, comprobamos error de API y la guardamos en nuestra mano
    const roboAPI = await robarCarta(barajaJuego.deck_id, 1);
    if (comprobarError(roboAPI)) {
        cargando = false;
        return;
    }

    const cartaRobada = roboAPI.data.cards[0];

    jugador.mano.push(cartaRobada);

    mostrarMano(jugador.mano, zonaCartasJugador);
    actualizarPuntos(jugador, puntosJugador);

    if (jugador.puntos > 21) {
        pasarse21();
    }

    cargando = false;
})

botonPedir.addEventListener("click", async () => {

})