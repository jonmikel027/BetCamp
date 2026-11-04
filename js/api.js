/* ---URLs API--- */
const urlBase = "https://deckofcardsapi.com/api/deck";

const urlsAPI = {
    // Crear barajas
    nuevaBarajaBarajada: `${urlBase}/new/shuffle/?deck_count=1`,
    nuevaBarajaOrdenada: `${urlBase}/new/`,
    nuevaBarajaConComodines: `${urlBase}/new/?jokers_enabled=true`,
    nuevaBarajaParcial: (cartas) =>
        `${urlBase}/new/shuffle/?cards=${cartas.join(",")}`,

    // Usar una baraja existente
    robarCartas: (deckId, cantidad) =>
        `${urlBase}/${deckId}/draw/?count=${cantidad}`,

    volverABarajar: (deckId) =>
        `${urlBase}/${deckId}/shuffle/`,

    barajarCartasRestantes: (deckId) =>
        `${urlBase}/${deckId}/shuffle/?remaining=true`,

    devolverCartas: (deckId) =>
        `${urlBase}/${deckId}/return/`,

    devolverCartasConcretas: (deckId, cartas) =>
        `${urlBase}/${deckId}/return/?cards=${cartas.join(",")}`,

    // Pilas de cartas, como una pila de descartes
    añadirCartasAPila: (deckId, pila, cartas) =>
        `${urlBase}/${deckId}/pile/${pila}/add/?cards=${cartas.join(",")}`,

    listarPila: (deckId, pila) =>
        `${urlBase}/${deckId}/pile/${pila}/list/`,

    barajarPila: (deckId, pila) =>
        `${urlBase}/${deckId}/pile/${pila}/shuffle/`,

    robarDePila: (deckId, pila, cantidad = 1) =>
        `${urlBase}/${deckId}/pile/${pila}/draw/?count=${cantidad}`,

    robarCartasConcretasDePila: (deckId, pila, cartas) =>
        `${urlBase}/${deckId}/pile/${pila}/draw/?cards=${cartas.join(",")}`,

    robarDelFondoDePila: (deckId, pila, cantidad = 1) =>
        `${urlBase}/${deckId}/pile/${pila}/draw/bottom/?count=${cantidad}`,

    robarAlAzarDePila: (deckId, pila, cantidad = 1) =>
        `${urlBase}/${deckId}/pile/${pila}/draw/random/?count=${cantidad}`,

    devolverPila: (deckId, pila) =>
        `${urlBase}/${deckId}/pile/${pila}/return/`,

    devolverCartasDePila: (deckId, pila, cartas) =>
        `${urlBase}/${deckId}/pile/${pila}/return/?cards=${cartas.join(",")}`,

    // Imagen del reverso de una carta
    reversoCarta: "https://deckofcardsapi.com/static/img/back.png"
};



export async function nuevaBaraja() {
    try {
        const respuestaAPI = await fetch(urlsAPI.nuevaBarajaBarajada);

        if (respuestaAPI.ok !== true) {
            const mensajeError = "Error HTTP: " + respuestaAPI.status;
            const error = new Error(mensajeError);
            throw error;
        }

        const datosAPI = await respuestaAPI.json();
        return {
            error: null,
            data: datosAPI
        }
    }
    catch (error) {
        return {
            error: error,
            data: null
        }
    }
}

export async function robarCarta(deckID, cantidad) {
    try {
        const respuestaAPI = await fetch(urlsAPI.robarCartas(deckID, cantidad));

        //comprobación con respuesta del servidor
        if (respuestaAPI.ok !== true) {
            const mensajeError = "Error HTTP: " + respuestaAPI.status;
            const error = new Error(mensajeError);
            throw error;
        }

        const datosAPI = await respuestaAPI.json();

        //comprobación datos de JSON
        if ((datosAPI.success !== true) ||
            (!Array.isArray(datosAPI.cards)) ||
            (datosAPI.cards.length !== cantidad)) {

            throw new Error("No se han podido obtener las cartas solicitadas.");
        }

        return {
            error: null,
            data: datosAPI
        }
    }
    catch (error) {
        return {
            error: error,
            data: null
        }
    }
}