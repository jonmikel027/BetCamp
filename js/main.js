/* 1. CONFIGURACIÓN
____________________________ */

import { nuevaBaraja, robarCarta } from "./api.js";

const imagenReverso = "https://deckofcardsapi.com/static/img/back.png";


/* 2. REFERENCIAS AL HTML
____________________________ */

const nombreJugador = document.getElementById("nombre-jugador");
const saldoDinero = document.getElementById("saldo-dinero");
const botonJugar = document.getElementById("boton-jugar");

const pilaBaraja = document.getElementById("pila-baraja");

const zonaCartasBanca = document.getElementById("cartas-banca");
const puntosBanca = document.getElementById("puntos-banca");

const zonaCartasJugador = document.getElementById("cartas-jugador");
const puntosJugador = document.getElementById("puntos-jugador");

const botonPedir = document.getElementById("boton-pedir");
const botonPlantarse = document.getElementById("boton-plantarse");

const mensajeJuego = document.getElementById("mensaje-juego");
const resultadoPartida = document.getElementById("resultado-partida");
const tablaHistorialResultados = document.getElementById("historial-resultados");

/* 3. CLASES
____________________________ */

class Jugador {
    constructor(nombre) {
        this.nombre = nombre;
        this.mano = [];
        this.puntos = 0;
    }
}

/* 3. DATOS DEL JUEGO
____________________________ */

const jugadores = [
    new Jugador("jugador"),
    new Jugador("banca")
];

const jugador = jugadores[0];
const banca = jugadores[1];

let barajaJuego = null;

let partidaActiva = false;
let cargando = false;

const historialPartidas = [];

let resultadoFinal = null;


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

function mostrarBanca() {   //es para el turno 1

    zonaCartasBanca.replaceChildren();

    mostrarCarta(banca.mano[0], zonaCartasBanca);

    const cartaOculta = document.createElement("img");
    cartaOculta.src = imagenReverso;
    cartaOculta.alt = "Carta oculta de la banca";

    zonaCartasBanca.append(cartaOculta);
    puntosBanca.textContent = "?";
}

function mostrarHistorial() {
    tablaHistorialResultados.replaceChildren();

    for (const partida of historialPartidas) {
        const fila = document.createElement("tr");

        const datos = [
            partida.nombre,
            partida.puntosJugador,
            partida.puntosBanca,
            partida.resultado
        ];

        for (const dato of datos) {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.append(celda);
        }

        tablaHistorialResultados.append(fila);
    }
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

function blackjack() {
    jugador.puntos = calcularPuntos(jugador.mano);
    banca.puntos = calcularPuntos(banca.mano);

    return jugador.puntos === 21 || banca.puntos === 21;
}

async function turnoBanca() {
    while (banca.puntos < 17) {
        await esperar(1000);

        const roboAPI = await robarCarta(barajaJuego.deck_id, 1);
        if (comprobarError(roboAPI)) {
            botonPlantarse.disabled = false;
            return false;
        }

        const cartaRobada = roboAPI.data.cards[0];

        banca.mano.push(cartaRobada);
        mostrarMano(banca.mano, zonaCartasBanca)
        actualizarPuntos(banca, puntosBanca);


    }
    return true;
}

function esperar(milisegundos) {
    return new Promise((resolve) => {
        setTimeout(resolve, milisegundos);
    });
}

function resolverPartida() {
    if (banca.puntos > 21 || jugador.puntos > banca.puntos) {
        resultadoFinal = "WIN";
        resultadoPartida.textContent = "HAS GANADO";
    } else if (jugador.puntos === banca.puntos) {
        resultadoFinal = "DRAW";
        resultadoPartida.textContent = "HAY EMPATE";
    } else {
        resultadoFinal = "LOSE";
        resultadoPartida.textContent = "HAS PERDIDO";
    }

    partidaActiva = false;
    botonPedir.disabled = true;
    botonPlantarse.disabled = true;
    botonJugar.disabled = false;

    registrarPartida()

    mensajeJuego.textContent = "Partida terminada. Puedes volver a jugar.";
}

async function plantarse() {

    //definir disponibilidad de la decisión
    if ((partidaActiva === false) || (cargando === true)) {
        return;
    }

    //Hemos decidido plantarnos
    botonPedir.disabled = true;
    botonPlantarse.disabled = true;

    mostrarMano(banca.mano, zonaCartasBanca);
    actualizarPuntos(banca, puntosBanca);

    //jugamos el tunro de la banca
    mensajeJuego.textContent = "Turno de la banca.";

    cargando = true;

    const turnoCompletado = await turnoBanca();
    if (turnoCompletado) {
        resolverPartida();
    }

    cargando = false;
}

function registrarPartida() {
    const resultado = {
        nombre: jugador.nombre,
        puntosJugador: jugador.puntos,
        puntosBanca: banca.puntos,
        resultado: resultadoFinal
    };

    historialPartidas.push(resultado);
    mostrarHistorial();

    console.log(historialPartidas);
}

/* 5. EVENTOS DEL JUEGO 
____________________________*/

//5.1 NUEVA PARTIDA
botonJugar.addEventListener("click", async () => {
    jugador.nombre = nombreJugador.value.trim();

    if (jugador.nombre === "") {
        mensajeJuego.textContent = "Escribe tu nombre para empezar.";
        nombreJugador.focus();
        return;
    }

    botonJugar.disabled = true;
    resultadoPartida.textContent = "";
    resultadoFinal = null;

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
    botonPlantarse.disabled = false;

    mostrarPila();
    mostrarMano(jugador.mano, zonaCartasJugador);
    actualizarPuntos(jugador, puntosJugador);
    mostrarBanca();

    mensajeJuego.textContent = "Puedes pedir una carta o plantarte.";

    if (blackjack()) {
        mostrarMano(banca.mano, zonaCartasBanca);
        actualizarPuntos(banca, puntosBanca);
        resolverPartida();
    }


})

//5.2 PEDIR CARTA

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

    //comprobamos que no nos hemos pasado de 21
    if (jugador.puntos > 21) {
        partidaActiva = false;
        resultadoFinal = "LOSE"

        botonPedir.disabled = true;
        botonPlantarse.disabled = true;

        mostrarMano(banca.mano, zonaCartasBanca);
        actualizarPuntos(banca, puntosBanca);
        registrarPartida();


        resultadoPartida.textContent = "Te has pasado de 21. Has perdido.";
        mensajeJuego.textContent = "Partida terminada. Puedes volver a jugar.";
        botonJugar.disabled = false;
    }

    cargando = false;

    //comprobamos si hemos hecho 21 y nos plantamos automaticamente
    if (jugador.puntos === 21) {
        await plantarse();
    }
})

//5.3 PLANTARSE

botonPlantarse.addEventListener("click", plantarse);