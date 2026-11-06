/* 1. CONFIGURACIÓN
____________________________ */

import { nuevaBaraja, robarCarta } from "./api.js";

const imagenReverso = "https://deckofcardsapi.com/static/img/back.png";


/* 2. REFERENCIAS AL HTML
____________________________ */

/* --- Inicio y saldo --- */
const nombreJugador = document.getElementById("nombre-jugador");
const saldoDinero = document.getElementById("saldo-dinero");
const botonJugar = document.getElementById("boton-jugar");

/* --- Mesa y baraja --- */
const pilaBaraja = document.getElementById("pila-baraja");

// Mano y puntos de la banca
const zonaCartasBanca = document.getElementById("cartas-banca");
const puntosBanca = document.getElementById("puntos-banca");

// Mano y puntos del jugador
const zonaCartasJugador = document.getElementById("cartas-jugador");
const puntosJugador = document.getElementById("puntos-jugador");

/* --- Acciones del jugador --- */
const botonPedir = document.getElementById("boton-pedir");
const botonPlantarse = document.getElementById("boton-plantarse");

/* --- Mensajes y resultado --- */
const mensajeJuego = document.getElementById("mensaje-juego");
const resultadoPartida = document.getElementById("resultado-partida");

/* --- Historial y búsqueda --- */
const filtroNombre = document.getElementById("filtro-nombre");
const tablaHistorialResultados = document.getElementById("historial-resultados");
const botonLimpiarHistorial = document.getElementById("limpiar-historial");

/* ---Ventana de resultado--- */
const ventanaResultado = document.getElementById("ventana-resultado");
const tituloResultado = document.getElementById("titulo-resultado");
const detalleResultado = document.getElementById("detalle-resultado");
const botonOtraMano = document.getElementById("boton-otra-mano");
const botonRetirarse = document.getElementById("boton-retirarse");


/* 3. CLASES
____________________________ */

/* Jugador y banca reciben cartas, calculan puntos y juegan con mano,
 por eos son misma clase*/

class Jugador {
    constructor(nombre) {
        this.nombre = nombre;
        this.saldo = 0;
        this.mano = [];
        this.puntos = 0;
    }

    recibirCarta(carta) {
        this.mano.push(carta);
        this.puntos = calcularPuntos(this.mano);
    }

    vaciarMano() {
        this.mano = [];
        this.puntos = calcularPuntos(this.mano);
    }
}

class Partida {
    constructor(jugador, banca) {
        this.jugador = jugador;
        this.banca = banca;
        this.participantes = [jugador, banca]; //El orden del array marca el orden del reparto. El jugador primero.

        this.baraja = null;
        this.activa = false;
        this.resultado = null;
    }

    reiniciarManos() {
        for (const jugador of this.participantes) {
            jugador.vaciarMano();
        }
    }

    iniciar(nombreJugador) {

        this.reiniciarManos();

        const nombre = nombreJugador.trim();

        if (nombre === "") {
            this.jugador.nombre = "Jugador";
        } else {
            this.jugador.nombre = nombre;
        }

        this.activa = false;
        this.resultado = null;
    }

    async prepararBaraja() {
        /* Se guarda la baraja en this.baraja para usar su deck_id en los robos. 
            Se devuelve la respuesta de la API para que quien llame a la función,
            pueda comprobar si hubo un error. */

        const barajaAPI = await nuevaBaraja();

        if (barajaAPI.error) {
            return barajaAPI;
        }

        this.baraja = barajaAPI.data;
        return barajaAPI;
    }

    async repartoInicial() {
        const repartoInicial = 2; //por jugador
        const totalRoboInicial = this.participantes.length * repartoInicial;

        const roboAPI = await robarCarta(this.baraja.deck_id, totalRoboInicial);

        if (roboAPI.error) {
            return roboAPI;
        }

        const roboCartasInicial = roboAPI.data.cards;

        for (let i = 0; i < totalRoboInicial; i++) {

            /* El resto de la división (%) hace que el índice de los participantes vaya 0, 1, 0, 1. 
            Así las cartas se reparten por turnos. */

            const jugadorRecibe = this.participantes[i % this.participantes.length];
            jugadorRecibe.recibirCarta(roboCartasInicial[i]);
        }
        return roboAPI;
    }
}


/* 4. ESTABLECER JUGADORES
____________________________ */

const jugador = new Jugador("Jugador");
const banca = new Jugador("Banca");

const partida = new Partida(jugador, banca);
let cargando = false;


/* Al abrir la página, recuperamos las partidas guardadas en un array para poder mostrarlas y añadir nuevas. 
Si aún no hay historial, empezamos con el array vacío. */

const historialGuardado = localStorage.getItem("blackjack-historial");
let historialPartidas = [];

if (historialGuardado !== null) {
    historialPartidas = JSON.parse(historialGuardado);
}

/* 5. FUNCIONES
____________________________ */

//---Puntuación---

function calcularValorCarta(carta) {
    if (carta.value === "JACK") return 10;
    if (carta.value === "QUEEN") return 10;
    if (carta.value === "KING") return 10;
    if (carta.value === "ACE") return 11;

    return Number(carta.value);
}

function calcularPuntos(mano) {
    let total = 0;
    let ases = 0;

    for (const carta of mano) {
        if (carta.value === "ACE") {
            ases++;
        }
        total = total + calcularValorCarta(carta);
    }

    /* si te has pasado de 21 pero tienes ases, el As pasa a valer 1 */
    while ((total > 21) && (ases > 0)) {
        total = total - 10;
        ases--;
    }
    return total;
}

function blackjack() {
    if (jugador.puntos === 21 || banca.puntos === 21) {
        return true;
    }

    return false;
}


//---Vista de la mesa y aviso---

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

function actualizarVistaMano(participante, zonaCartas, marcadorHTML) {
    mostrarMano(participante.mano, zonaCartas);
    marcadorHTML.textContent = participante.puntos;
}

function mostrarBanca() {   //es para el turno 1

    zonaCartasBanca.replaceChildren();

    mostrarCarta(banca.mano[0], zonaCartasBanca);

    const cartaOculta = document.createElement("img");
    cartaOculta.src = imagenReverso;
    cartaOculta.alt = "Carta oculta de la banca";

    zonaCartasBanca.append(cartaOculta);
    puntosBanca.textContent = "¿?";
}

function mostrarVentanaResultado(titulo, detalle) {
    mensajeJuego.textContent = "La mesa está abierta. ¿Jugamos?";
    tituloResultado.textContent = titulo;
    detalleResultado.textContent = detalle;

    //abre una ventana modal. (Muestra por encima y bloquea resto de la página)
    ventanaResultado.showModal();
}


//---Turnos y cierre de la mano---

async function plantarse() {

    //definir disponibilidad de la decisión
    if ((!partida.activa) || (cargando)) {
        return;
    }

    //Ya no se puede de elegir ninguna opción
    botonPedir.disabled = true;
    botonPlantarse.disabled = true;

    actualizarVistaMano(banca, zonaCartasBanca, puntosBanca);

    //jugamos el turno de la banca
    mensajeJuego.textContent = "La banca descubre su juego.";

    cargando = true;

    const turnoCompletado = await turnoBanca();
    if (turnoCompletado) {
        resolverPartida();
    }

    cargando = false;
}

async function turnoBanca() {
    while (banca.puntos < 17) {

        /* Mientras tenga 17 o menos roba obligatoriamente.
        Comprobamos que el robo no ha dado error.
        Metemos la carta robada y recalculamos los puntos. */

        mensajeJuego.textContent = "La banca pide carta.";
        await esperar(1000);

        const roboAPI = await robarCarta(partida.baraja.deck_id, 1);
        if (comprobarErrorAPI(roboAPI)) {
            botonPlantarse.disabled = false;
            return false;
        }

        const cartaRobada = roboAPI.data.cards[0];

        banca.recibirCarta(cartaRobada);

        actualizarVistaMano(banca, zonaCartasBanca, puntosBanca);
    }
    return true;
}

function resolverPartida() {
    let titulo;
    let detalle;

    if (jugador.mano.length === 2 && jugador.puntos === 21 && banca.puntos !== 21) {
        partida.resultado = "BLACKJACK";
        titulo = "¡Blackjack!";
        detalle = "21 de salida. Te llevas la mano.";

    } else if (banca.puntos > 21 || jugador.puntos > banca.puntos) {
        partida.resultado = "WIN";
        titulo = "¡Tú ganas!";
        detalle = "La mano es tuya, vences a la banca";

    } else if (jugador.puntos === banca.puntos) {
        partida.resultado = "DRAW";
        titulo = "Tablas en la mesa";
        detalle = "Misma puntuación. La mano queda en tablas.";

    } else {
        partida.resultado = "LOSE";
        titulo = "Gana la banca";
        detalle = "Esta mano se la lleva la casa.";
    }

    partida.activa = false;
    botonPedir.disabled = true;
    botonPlantarse.disabled = true;
    botonJugar.disabled = false;

    registrarPartida();
    mostrarVentanaResultado(titulo, detalle);
}


//---Historial---

function registrarPartida() {
    const resultado = {
        nombre: jugador.nombre,
        puntosJugador: jugador.puntos,
        puntosBanca: banca.puntos,
        resultado: partida.resultado
    };

    historialPartidas.push(resultado);

    /* Convertimos el historial a texto para guardarlo y recuperarlo al recargar la página. */
    localStorage.setItem(
        "blackjack-historial",
        JSON.stringify(historialPartidas)
    );

    mostrarHistorial();
}

function mostrarHistorial() {

    //Limpiamos la tabla. La vamos a rellenar otra vez.
    tablaHistorialResultados.replaceChildren();
    const busquedaFiltrada = filtroNombre.value.trim().toLowerCase();

    for (const partida of historialPartidas.reverse()) {

        //Filtrar por nombre
        if (partida.nombre.toLowerCase().includes(busquedaFiltrada)) {
            const filaTablaRegistro = document.createElement("tr");

            const datos = [
                partida.nombre,
                partida.puntosJugador,
                partida.puntosBanca,
                partida.resultado
            ];

            for (const dato of datos) {
                const celda = document.createElement("td");
                celda.textContent = dato;
                filaTablaRegistro.append(celda);
            }

            tablaHistorialResultados.append(filaTablaRegistro);
        }
    }
}

//---Otros---

function comprobarErrorAPI(valor) {
    if (valor.error) {
        console.error("No se ha podido preparar la baraja",
            valor.error
        );
        return true;
    }
}

function esperar(milisegundos) {
    return new Promise((resolve) => {
        setTimeout(resolve, milisegundos);
    });
}


/* 6. EVENTOS
____________________________ */

/* --- INICIAR JUEGO --- */
botonJugar.addEventListener("click", async () => {

    botonJugar.disabled = true;

    partida.iniciar(nombreJugador.value);

    mensajeJuego.textContent = "Señoras y señores, se reparten las cartas.";

    const barajaAPI = await partida.prepararBaraja();
    if (comprobarErrorAPI(barajaAPI)) {
        botonJugar.disabled = false;
        return;
    }

    const reparto = await partida.repartoInicial();

    if (comprobarErrorAPI(reparto)) {
        botonJugar.disabled = false;
        return;
    }

    partida.activa = true;

    mostrarPila();
    actualizarVistaMano(jugador, zonaCartasJugador, puntosJugador);

    if (blackjack()) {
        actualizarVistaMano(banca, zonaCartasBanca, puntosBanca);
        resolverPartida();
        return;
    }

    mensajeJuego.textContent = "La mesa es tuya. ¿Carta o te plantas?";

    mostrarBanca();

    botonPedir.disabled = false;
    botonPlantarse.disabled = false;

    resultadoPartida.textContent = "";
})

/* --- PEDIR CARTA   --- */
botonPedir.addEventListener("click", async () => {

    //evitamos poder pulsar el botón varias veces o cuando no toca
    if (!partida.activa || cargando) {
        return;
    }

    //la petición está cargando
    cargando = true;

    //comentarios crupier
    mensajeJuego.textContent = "Una carta más para ti.";
    esperar(2000);
    mensajeJuego.textContent = "La mesa es tuya. ¿Carta o te plantas?";

    //robamos la carta, comprobamos error de API y la guardamos en nuestra mano
    const roboAPI = await robarCarta(partida.baraja.deck_id, 1);
    if (comprobarErrorAPI(roboAPI)) {
        cargando = false;
        return;
    }

    const cartaRobada = roboAPI.data.cards[0];
    jugador.recibirCarta(cartaRobada);

    actualizarVistaMano(jugador, zonaCartasJugador, puntosJugador);

    //comprobamos que no nos hemos pasado de 21
    if (jugador.puntos > 21) {
        partida.activa = false;
        partida.resultado = "LOSE"

        botonPedir.disabled = true;
        botonPlantarse.disabled = true;

        actualizarVistaMano(banca, zonaCartasBanca, puntosBanca);

        registrarPartida();

        mostrarVentanaResultado(
            "¡Te has pasado!",
            "La última carta te lleva por encima de 21. La mano es de la casa."
        );
        botonJugar.disabled = false;
    }

    cargando = false;

    //comprobamos si hemos hecho 21 y nos plantamos automaticamente
    if (jugador.puntos === 21) {
        await plantarse();
    }
})

/* --- PLANTARSE   --- */
botonPlantarse.addEventListener("click", plantarse);

/* --- FILTRAR   --- */
filtroNombre.addEventListener("input", mostrarHistorial);
mostrarHistorial();

/* --- LIMPIAR HISTORIAL   --- */

botonLimpiarHistorial.addEventListener("click", () => {

    const confirmado = confirm("¿Seguro que quieres borrar todo el historial?");

    if (!confirmado) {
        return;
    }

    historialPartidas.length = 0;
    localStorage.removeItem("blackjack-historial");
    filtroNombre.value = "";
    mostrarHistorial();
});

/* --- VENTANA FINAL DE JUEGO   --- */

botonOtraMano.addEventListener("click", () => {
    ventanaResultado.close();
    botonJugar.click();
});

botonRetirarse.addEventListener("click", () => {
    ventanaResultado.close();
    botonJugar.focus();
});

/* --- PONER MÚSICA   --- */

const avisoMusica = document.querySelector("#aviso-musica");
const musicaCasino = document.querySelector("#musica-casino");

document.querySelector("#aceptar-musica").addEventListener("click", () => {
    musicaCasino.volume = 0.3;
    musicaCasino.play().catch((error) => {
        console.warn("No se pudo reproducir la música:", error);
    });
    avisoMusica.close();
});

document.querySelector("#rechazar-musica").addEventListener("click", () => {
    avisoMusica.close();
});

avisoMusica.showModal();

console.log(new URL("assets/images/favicon.svg", location.href).href);