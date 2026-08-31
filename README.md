# ENMH 2027

Invitación digital para la Generación 2027 de **Médico Cirujano y Homeópata** de la Escuela Nacional de Medicina y Homeopatía del Instituto Politécnico Nacional.

## Concepto

La experiencia comienza con un sobre guinda y un sello negro. Al romper el sello, la tarjeta emerge y da paso a una invitación editorial de una sola página. La dirección visual usa la paleta institucional del IPN, Noto Sans para el sistema tipográfico y Cormorant Garamond como tipografía de ocasión.

El bastón de Asclepio de una sola serpiente se usa como motivo médico. El emblema institucional se conserva como imagen, sin redibujarlo ni alterarlo.

## Ejecutar localmente

No requiere compilación ni dependencias.

```bash
python3 -m http.server 4173
```

Después abre `http://localhost:4173`.

## Datos por confirmar

La fecha, horario, sede y flujo de confirmación son contenido de demostración. Antes de publicar hay que sustituirlos por los datos finales del evento.

- La configuración del calendario y la cuenta regresiva vive al inicio de `script.js`, en el objeto `EVENT`.
- Los textos visibles de fecha y sede están en `index.html`.
- Los botones de confirmación muestran un modal temporal hasta conectar el formulario o WhatsApp definitivos.

## Archivos

- `index.html`: estructura y contenido.
- `styles.css`: dirección de arte, animación y responsividad.
- `script.js`: apertura, cuenta regresiva, calendario, modal y animaciones de entrada.
- `assets/`: emblema ENMH y monograma del sitio.

## Accesibilidad

- Navegación por teclado y enlace para saltar la introducción.
- El sello es un botón real con etiqueta accesible.
- Respeta `prefers-reduced-motion`.
- El contenido permanece disponible si JavaScript está desactivado.
- La cuenta regresiva evita anunciar cambios cada segundo a lectores de pantalla.
