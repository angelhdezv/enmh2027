# ENMH 2027

Invitación digital para la Generación 2027 de **Médico Cirujano y Homeópata** de la Escuela Nacional de Medicina y Homeopatía del Instituto Politécnico Nacional.

## Concepto

La experiencia comienza con un sobre guinda y un sello negro. Al romper el sello, la tarjeta emerge y da paso a una sola superficie editorial: portada, programa y datos esenciales forman parte de la misma invitación, sin convertirse en una landing page convencional. La dirección visual usa la paleta institucional del IPN, Noto Sans para el sistema tipográfico y Cormorant Garamond como tipografía de ocasión.

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

Pendientes antes de publicar como versión final:

- Hora exacta y dirección completa.
- Código de vestimenta.
- Número de pases y fecha límite de confirmación.
- Formulario, teléfono o WhatsApp de confirmación.

El calendario se descarga como evento de día completo para no inventar un horario. Su configuración vive al inicio de `script.js`, en el objeto `EVENT`.

## Archivos

- `index.html`: estructura y contenido.
- `styles.css`: dirección de arte, animación y responsividad.
- `script.js`: apertura, restauración de estado, calendario, compartir y modal informativo.
- `assets/`: emblema ENMH y monograma del sitio.

## Accesibilidad

- Navegación por teclado y enlace para saltar la introducción.
- El sello es un botón real con etiqueta accesible.
- Respeta `prefers-reduced-motion`.
- El contenido permanece disponible si JavaScript está desactivado.
- El resto del documento queda fuera del orden de interacción mientras el sobre está activo.
- La introducción se reinicia al recargar o volver desde el historial y fuerza el desplazamiento al inicio.
