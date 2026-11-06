# BBK BetCamp · Blackjack

BBK BetCamp es un juego de blackjack para navegador en el que juegas contra la banca. El objetivo es acercarte a 21 sin pasarte y superar su puntuación. El resultado de cada mano se guarda en un historial que puedes consultar y filtrar por nombre.

## Instalación y ejecución local

Necesitas Git, Visual Studio Code con la extensión **Live Server**, un navegador y conexión a Internet para cargar las cartas.

1. Clona el repositorio y entra en la carpeta del proyecto.

   ```bash
   git clone https://github.com/jonmikel027/BetCamp.git
   cd BetCamp
   ```

2. Abre la carpeta `BetCamp` en Visual Studio Code.
3. Haz clic derecho sobre `index.html` y selecciona **Open with Live Server**. El juego se abrirá en el navegador.

## Tecnologías y API

- **HTML5 y CSS3** para la estructura de la página, el diseño de la mesa y su adaptación a distintos tamaños de pantalla.
- **JavaScript** con módulos, clases y manipulación del DOM para gestionar el reparto, los turnos y la puntuación.
- **Deck of Cards API** para preparar la baraja, robar cartas y obtener sus imágenes.
- **`localStorage`** para conservar el historial en el navegador al recargar la página.

## Guía rápida

1. Escribe tu nombre y pulsa **Repartir**. Recibirás dos cartas y verás una de las cartas de la banca.
2. Pulsa **Pedir carta** para recibir otra carta o **Me planto** para ceder el turno a la banca. Si te pasas de 21, pierdes la mano.
3. En su turno, la banca revela su carta oculta y pide cartas mientras tenga menos de 17 puntos.
4. El aviso final muestra el resultado. Si ganas con 21 en tus dos cartas iniciales, la mano se registra como **BLACKJACK**.
5. Elige **Otra mano** para volver a jugar o **Dejar la mesa** para cerrar el aviso. En el historial puedes filtrar las manos por nombre o borrar los resultados guardados.