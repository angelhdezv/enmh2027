# ENMH 2027

Invitación digital para la Generación 2027 de **Médico Cirujano y Homeópata** de la Escuela Nacional de Medicina y Homeopatía del Instituto Politécnico Nacional.

## Concepto

La experiencia comienza con un sobre guinda y un sello negro. Al romper el sello, la tarjeta emerge y da paso a una sola superficie editorial. La carrera es la protagonista de la portada; la generación, fecha y lugar quedan como datos secundarios. Una composición ilustrada acompaña la portada y las tarjetas informativas sólo aparecen cuando el invitado solicita ver los detalles.

El bastón de Asclepio de una sola serpiente se usa como motivo médico. El emblema institucional se conserva como imagen, sin redibujarlo ni alterarlo.

## Ejecutar localmente

No requiere compilación ni dependencias.

```bash
python3 -m http.server 4173
```

Después abre `http://localhost:4173`.

## Datos del evento

Confirmados:

- Sábado 22 de mayo de 2027.
- Jardín Volterra, Zona Esmeralda.
- Duración total de nueve horas.
- Recepción, ceremonia de generación, cena en cuatro tiempos, brindis, barra libre, DJ, entretenimiento en vivo, tornafiesta y fotografía panorámica.
- Cada invitado debe llevar su boleto físico el día del evento.

Pendientes antes de publicar como versión final:

- Hora exacta y dirección completa.
- Código de vestimenta.

La invitación es genérica y no incluye RSVP, formulario de confirmación ni datos personalizados de acceso.

El calendario se descarga como evento de día completo para no inventar un horario. Su configuración vive al inicio de `script.js`, en el objeto `EVENT`.

## Música

El reproductor comienza al tocar el sello y se reinicia junto con la invitación al recargar. Coloca el archivo autorizado en:

`assets/audio/cancion-evento.mp3`

Mientras el archivo no exista, el reproductor permanece visible como parte del diseño y avisa que la canción todavía no está disponible, sin bloquear la experiencia.

## Archivos

- `index.html`: estructura y contenido.
- `styles.css`: dirección de arte, animación y responsividad.
- `script.js`: apertura, restauración de estado, calendario, compartir, detalles y música.
- `assets/`: emblema ENMH, monograma, ilustraciones SVG, branding y audio.

## Accesibilidad

- Navegación por teclado y enlace para saltar la introducción.
- El sello es un botón real con etiqueta accesible.
- Respeta `prefers-reduced-motion`.
- El contenido permanece disponible si JavaScript está desactivado.
- El resto del documento queda fuera del orden de interacción mientras el sobre está activo.
- La introducción se reinicia al recargar o volver desde el historial y fuerza el desplazamiento al inicio.
