# ENMH 2027

Invitación digital para la Generación 2027 de **Médico Cirujano y Homeópata** de la Escuela Nacional de Medicina y Homeopatía del Instituto Politécnico Nacional.

## Concepto

La experiencia comienza con un sobre horizontal de cartulina guinda y un sello de lacre mate con el escudo blanco de la escuela. Su proporción de 1.6:1 se conserva en móvil, escritorio y orientación horizontal. El grano fino del papel, el borde de la pestaña y las sombras de contacto dan profundidad al sobre; la cara conserva una superficie continua y la pestaña cierra en su centro. La **misma portada del documento** sale del sobre y se coloca en su posición final: conserva contenido, tipografía y proporciones durante toda la apertura. Una portada vertical se guarda girada dentro del sobre y se endereza después de empezar a salir. No se intercambia por una miniatura ni por una imagen.

La versión `v0.1.0` usa una superficie marfil, tipografía editorial y dibujos de una sola línea. La portada ocupa todo el ancho; después aparecen la cuenta regresiva y dos columnas para itinerario, vestimenta y boleto. En móvil el contenido se organiza en una sola columna.

En pantallas de hasta 360 px, el encabezado prioriza el escudo y oculta las letras «ENMH · IPN». El enlace conserva su nombre accesible y los controles de música y compartir mantienen sus áreas táctiles.

Cada ilustración se dibuja durante **2 segundos**, permanece completa **1 segundo** y se desdibuja durante **2 segundos**, recorriendo el mismo trazo en sentido inverso. No se utilizan fundidos entre imágenes.

- Portada: birrete → símbolo médico → estetoscopio → cruz médica.
- Gala: vestido → traje.
- Boleto: el mismo dibujo en ciclos de cinco segundos.

La tarjeta lleva el primer dibujo completo durante la apertura; al llegar a su lugar, continúa desde la pausa visible de un segundo. Los siguientes ciclos recorren las tres fases completas. Las animaciones se pausan fuera de pantalla, al ocultar la pestaña o al abrir la guía de vestimenta. Con movimiento reducido, las ilustraciones permanecen estáticas y la apertura es inmediata.

Los trazos son SVG editables. El sobre utiliza una textura SVG ligera y estática de grano de papel. Se conservan los archivos de los escudos aportados al proyecto, incluida la versión blanca del sello, la canción y el SVG original del footer de Caele.mx.

## Ejecutar localmente

No requiere compilación ni dependencias.

```bash
python3 -m http.server 4173
```

Después abre `http://localhost:4173`.

## Itinerario al desplazarse

La línea del programa se dibuja al bajar por la página y retrocede al subir. El avance sigue la posición del scroll y llega al último punto al final de la página, incluso cuando queda poco recorrido en escritorio. Con movimiento reducido, al imprimir o sin JavaScript se muestra completa. Los horarios y textos permanecen siempre visibles.

## Datos del evento

Confirmados:

- Sábado 22 de mayo de 2027.
- Jardín Volterra, Zona Esmeralda.
- Duración total de nueve horas.
- Recepción, ceremonia de generación, cena en cuatro tiempos, brindis, barra libre, DJ, entretenimiento en vivo, tornafiesta y fotografía panorámica.
- Cada invitado debe llevar su boleto físico el día del evento.
- Código de vestimenta provisional: formal · etiqueta, con una guía desplegable inspirada temporalmente en el demo de La Salle.

Pendientes antes de publicar como versión final:

- Hora exacta y dirección completa.

El itinerario visible se tomó temporalmente del demo de La Salle para reservar el espacio de diseño y está marcado como preliminar. Debe sustituirse cuando el cliente confirme el programa real.

Esta invitación es genérica y no incluye RSVP ni formulario de confirmación.

El calendario se descarga como evento de día completo para no inventar un horario. Su configuración vive al inicio de `script.js`, en el objeto `EVENT`.

## Música

La canción comienza al tocar el sello y puede pausarse o reanudarse desde el control circular del encabezado. Tanto el disco como el botón explícito de play/pausa controlan el mismo audio y reflejan su estado. El disco gira únicamente mientras la canción se reproduce. Estos controles no pausan las ilustraciones. El archivo de audio no se ha modificado.

La pestaña y la salida de la carta se acompañan de un efecto de papel de 1.32 segundos. Se prepara al cargar y Web Audio se habilita al tocar el sello; su reproducción comienza junto con la animación. Saltar la introducción, cambiar de tamaño o esconder la pestaña cancela el efecto. No se reproduce en bucle ni al alternar la música. Si no puede cargarse o Web Audio no está disponible, la invitación continúa normalmente. Las fuentes del efecto están en `assets/audio/CREDITS.md`.

## Archivos

- `index.html`: estructura y contenido.
- `styles.css`: dirección de arte, animación y responsividad.
- `script.js`: apertura, restauración de estado, calendario, compartir, cuenta regresiva y música.
- `assets/illustrations/continuous-lines.js`: trazos, secuencias, tiempos y cálculo de proporciones del sobre.
- `assets/`: emblema ENMH, monograma, branding, ilustraciones y audio.
- `tests/invitation.test.cjs`: tiempos de animación, continuidad, proporciones, avance del itinerario e integridad de los medios originales.

## Accesibilidad

- Navegación por teclado y enlace para saltar la introducción.
- El sello es un botón real con etiqueta accesible.
- Respeta `prefers-reduced-motion`.
- El contenido permanece disponible si JavaScript está desactivado.
- El resto del documento queda fuera del orden de interacción mientras el sobre está activo.
- La introducción se reinicia al recargar o volver desde el historial y fuerza el desplazamiento al inicio.

## Comprobaciones

No se requieren paquetes de npm. Con Node.js instalado:

```bash
node --test tests/*.test.cjs
node --check script.js
```

Para la revisión visual, abrir la página en móvil y escritorio, tocar el sello, probar «Saltar intro» durante la apertura, alternar los dos controles de música, bajar/subir por el itinerario, abrir/cerrar la guía y revisar la preferencia de movimiento reducido. La animación de apertura usa Web Animations; si esta API no está disponible, muestra la invitación directamente.
