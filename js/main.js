/* 1. CONFIGURACIÓN
____________________________ */

/* ---Dependencias---*/
import { nuevaBaraja, robarCarta } from "./api.js";

const imagenReverso = "https://deckofcardsapi.com/static/img/back.png";

const rondas = [
    {
        titulo: "Par o impar",
        descripcion: "Adivina si la carta será par o impar. El as vale 1, la jota 11, la reina 12 y el rey 13.",
        opciones: ["Par", "Impar"],
        instrucciones: "Elige una opción.",
    },
    {
        titulo: "Mayor o menor",
        descripcion: "Adivina si la siguiente carta será mayor o menor que la anterior.",
        opciones: ["Mayor", "Menor"],
        instrucciones: "Elige una opción.",
    }
];


/* 2. REFERENCIAS AL HTML 
____________________________*/

const botonJugar = document.getElementById("boton-jugar");
const tituloJuego = document.getElementById("titulo-juego");
const saldoDinero = document.getElementById("saldo-dinero");

const numeroRondas = document.getElementById("numero-rondas");
const nombreRonda = document.getElementById("nombre-ronda");
const descripcionRonda = document.getElementById("descripcion-ronda");

const pilaBaraja = document.getElementById("pila-baraja");
const cartaMesa = document.getElementById("carta-mesa");
const cartaMano = document.getElementById("carta-mano");

const botonOpcion1 = document.getElementById("boton-opcion1");
const botonOpcion2 = document.getElementById("boton-opcion2");
const resultadoRonda = document.getElementById("resultado-ronda");


/* 3. DATOS JUEGO
____________________________*/

let barajaJuego = null;
let cartaActual = null;
let cantidadRondas = rondas.length;
let rondaActual = 0;
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

    zona.replaceChildren(imagenCarta);
}

function mostrarRonda() {
    const datosRonda = rondas[rondaActual - 1];

    numeroRondas.textContent = "Ronda: " + rondaActual + "/" + cantidadRondas;
    nombreRonda.textContent = datosRonda.titulo;
    descripcionRonda.textContent = datosRonda.descripcion;

    botonOpcion1.textContent = datosRonda.opciones[0];
    botonOpcion2.textContent = datosRonda.opciones[1];

    resultadoRonda.textContent = datosRonda.instrucciones;

}

/* 4.2 Comprobaciones de rondas
---------------*/

async function resolverRonda(prediccion) {
    //robar carta desde API y comprobar resultado valido
    const cartaRobadaAPI = await robarCarta(barajaJuego.deck_id, 1);
    if (comprobarError(cartaRobadaAPI)) { return; };

    //asignar datos de cartas
    const cartaAnterior = cartaActual;
    cartaActual = cartaRobadaAPI.data.cards[0];

    mostrarCarta(cartaActual, cartaMesa);

    //traducir datos de cartas a numeros
    const valorCartaActual = valorCarta(cartaActual);
    let resultado;

    //elegir tipo de comprobación segun la ronda que sea
    if (rondaActual === 1) {
        resultado = comprobarParidad(valorCartaActual);
    }
    if (rondaActual === 2) {
        const valorCartaAnterior = valorCarta(cartaAnterior);
        resultado = comprobarMayorMenor(valorCartaAnterior, valorCartaActual);
    }

    //comprobar resultado con predicción para saber si se ha acertado
    if (resultado === "igual") {
        resultadoRonda.textContent = "Empate";
    } else if (resultado === prediccion) {
        resultadoRonda.textContent = "Genial!";
    } else {
        resultadoRonda.textContent = "Has fallado esta ronda";
    }

}

function comprobarParidad(valorCarta) {
    let cartaActualParidad = null;

    if (valorCarta % 2 === 0) {
        cartaActualParidad = "par";
    } else {
        cartaActualParidad = "impar";
    }

    return cartaActualParidad;
}

function comprobarError(valor) {
    if (valor.error) {
        console.error("No se ha podido preparar la baraja",
            valor.error
        );
        return true;
    }
}

function comprobarMayorMenor(valorActual, valorNuevo) {
    if (valorNuevo === valorActual) { return "igual"; }
    if (valorNuevo > valorActual) { return "mayor"; }
    if (valorNuevo < valorActual) { return "menor"; }
}

/* 4.3 Otros
---------------*/

function valorCarta(carta) {
    if (carta.value === "JACK") return 11;
    if (carta.value === "QUEEN") return 12;
    if (carta.value === "KING") return 13;
    if (carta.value === "ACE") return 1;

    return Number(carta.value);
}

/* 5. JUEGO 
____________________________*/

botonJugar.addEventListener("click", async () => {

    const barajaAPI = await nuevaBaraja();
    if (comprobarError(barajaAPI)) { return; };

    barajaJuego = barajaAPI.data;
    mostrarPila();

    rondaActual = 1;
    mostrarRonda();

    botonOpcion1.disabled = false;
    botonOpcion2.disabled = false;
    botonJugar.disabled = true;
})

botonOpcion1.addEventListener("click", () => {
    const datosRonda = rondas[rondaActual - 1];
    const prediccion = datosRonda.opciones[0].toLowerCase()

    resolverRonda(prediccion);
})

botonOpcion2.addEventListener("click", () => {
    const datosRonda = rondas[rondaActual - 1];
    const prediccion = datosRonda.opciones[1].toLowerCase()

    resolverRonda(prediccion);
})
