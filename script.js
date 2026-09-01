const EVENT = {
  name: 'Graduación ENMH · Generación 2027',
  startDate: '20270522',
  endDate: '20270523',
  location: 'Jardín Volterra, Zona Esmeralda, Estado de México',
  description:
    'Celebración de la Generación 2027 de Médico Cirujano y Homeópata, ENMH · IPN. Horario exacto por confirmar.',
};

const opening = document.querySelector('#opening');
const invitation = document.querySelector('#invitacion');
const openSeal = document.querySelector('#openSeal');
const skipOpening = document.querySelector('#skipOpening');
const envelopeScene = document.querySelector('#envelopeScene');
const letterPreview = document.querySelector('.letter-preview');
const addCalendar = document.querySelector('#addCalendar');
const dialogCalendar = document.querySelector('#dialogCalendar');
const shareInvitation = document.querySelector('#shareInvitation');
const rsvpDialog = document.querySelector('#rsvpDialog');
const closeRsvp = document.querySelector('#closeRsvp');
const toast = document.querySelector('#toast');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let openingFallback;
let leavingTimer;
let toastTimer;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function forceScrollTop() {
  const previousBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = previousBehavior;
  });
}

function setIntroActive(active) {
  document.documentElement.classList.toggle('intro-active', active);
  invitation.inert = active;
}

function resetOpening() {
  window.clearTimeout(openingFallback);
  window.clearTimeout(leavingTimer);
  opening.hidden = false;
  opening.classList.remove('is-opening', 'is-opened', 'is-leaving');
  opening.dataset.state = 'idle';
  openSeal.setAttribute('aria-expanded', 'false');
  envelopeScene.style.transform = '';
  setIntroActive(true);
  forceScrollTop();
}

function revealInvitation({ immediate = false } = {}) {
  if (opening.dataset.state === 'complete') return;

  opening.dataset.state = 'complete';
  opening.classList.add('is-opened');
  forceScrollTop();

  const leave = () => {
    opening.classList.add('is-leaving');
    setIntroActive(false);
    forceScrollTop();
    invitation.focus({ preventScroll: true });

    leavingTimer = window.setTimeout(() => {
      opening.hidden = true;
      forceScrollTop();
    }, immediate ? 0 : 760);
  };

  if (immediate || reducedMotion.matches) {
    leave();
  } else {
    leavingTimer = window.setTimeout(leave, 560);
  }
}

function openExperience() {
  if (opening.dataset.state !== 'idle') return;

  opening.dataset.state = 'opening';
  openSeal.setAttribute('aria-expanded', 'true');
  openSeal.blur();
  envelopeScene.style.transform = '';

  if (reducedMotion.matches) {
    opening.classList.add('is-opening');
    revealInvitation({ immediate: true });
    return;
  }

  let letterFinished = false;
  const finishLetter = () => {
    if (letterFinished) return;
    letterFinished = true;
    window.clearTimeout(openingFallback);
    letterPreview.removeEventListener('transitionend', onLetterTransitionEnd);
    revealInvitation();
  };

  const onLetterTransitionEnd = (event) => {
    if (event.target === letterPreview && event.propertyName === 'transform') {
      finishLetter();
    }
  };

  letterPreview.addEventListener('transitionend', onLetterTransitionEnd);
  openingFallback = window.setTimeout(finishLetter, 1900);
  requestAnimationFrame(() => opening.classList.add('is-opening'));
}

function skipExperience() {
  if (opening.dataset.state === 'complete') return;
  opening.classList.add('is-opening');
  revealInvitation({ immediate: true });
}

function trapOpeningFocus(event) {
  if (event.key !== 'Tab' || opening.hidden || opening.dataset.state !== 'idle') return;

  const focusable = [skipOpening, openSeal];
  const currentIndex = focusable.indexOf(document.activeElement);

  if (event.shiftKey && currentIndex <= 0) {
    event.preventDefault();
    focusable.at(-1).focus();
  } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
    event.preventDefault();
    focusable[0].focus();
  }
}

function moveEnvelope(event) {
  if (reducedMotion.matches || opening.dataset.state !== 'idle' || event.pointerType === 'touch') return;

  const x = (event.clientX / window.innerWidth - 0.5) * 8;
  const y = (event.clientY / window.innerHeight - 0.5) * 5;
  envelopeScene.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function resetEnvelopePosition() {
  if (opening.dataset.state === 'idle') envelopeScene.style.transform = '';
}

function escapeIcsText(value) {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function downloadCalendarEvent() {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Caele//ENMH 2027//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:enmh-2027-${EVENT.startDate}@caele.mx`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${EVENT.startDate}`,
    `DTEND;VALUE=DATE:${EVENT.endDate}`,
    `SUMMARY:${escapeIcsText(EVENT.name)}`,
    `LOCATION:${escapeIcsText(EVENT.location)}`,
    `DESCRIPTION:${escapeIcsText(EVENT.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graduacion-enmh-2027.ics';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('Fecha guardada: 22 de mayo de 2027.');
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

async function share() {
  const shareData = {
    title: EVENT.name,
    text: 'Sábado 22 de mayo de 2027 · Jardín Volterra, Zona Esmeralda.',
    url: window.location.href.split('#')[0],
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast('Enlace copiado.');
  } catch {
    showToast('Copia la dirección de esta página para compartirla.');
  }
}

function openRsvpDialog() {
  if (typeof rsvpDialog.showModal === 'function') {
    rsvpDialog.showModal();
  } else {
    rsvpDialog.setAttribute('open', '');
  }
}

function closeRsvpDialog() {
  rsvpDialog.close();
}

openSeal.addEventListener('click', openExperience);
skipOpening.addEventListener('click', skipExperience);
opening.addEventListener('keydown', trapOpeningFocus);
opening.addEventListener('pointermove', moveEnvelope);
opening.addEventListener('pointerleave', resetEnvelopePosition);
addCalendar.addEventListener('click', downloadCalendarEvent);
dialogCalendar.addEventListener('click', downloadCalendarEvent);
shareInvitation.addEventListener('click', share);
closeRsvp.addEventListener('click', closeRsvpDialog);
document.querySelectorAll('[data-open-rsvp]').forEach((button) => {
  button.addEventListener('click', openRsvpDialog);
});

rsvpDialog.addEventListener('click', (event) => {
  if (event.target === rsvpDialog) closeRsvpDialog();
});

window.addEventListener('pageshow', () => {
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  resetOpening();
});

resetOpening();
