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
        instrucciones: "Elige una opción."
    },
    {
        titulo: "Mayor o menor",
        descripcion: "Adivina si la siguiente carta será mayor o menor que la anterior.",
        opciones: ["Mayor", "Menor"],
        instrucciones: "Elige una opción."
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

function mostrarPila() {
    const reversoCarta = document.createElement("img");
    reversoCarta.src = imagenReverso;
    reversoCarta.alt = "Baraja boca abajo";

    pilaBaraja.replaceChildren(reversoCarta);
}

function comprobarError(valor) {
    if (valor.error) {
        console.error("No se ha podido preparar la baraja",
            valor.error
        );
        return true;
    }
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

async function resolverRonda(prediccion) {
    const cartaRobadaAPI = await robarCarta(barajaJuego.deck_id, 1);
    if (comprobarError(cartaRobadaAPI)) { return; };

    cartaActual = cartaRobadaAPI.data.cards[0];
    console.log(prediccion, cartaActual);
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
    resolverRonda("par");
})

botonOpcion2.addEventListener("click", () => {
    resolverRonda("impar");

})
