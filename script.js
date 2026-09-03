const EVENT = {
  name: 'Médico Cirujano y Homeópata · Generación 2027',
  startDate: '20270522',
  endDate: '20270523',
  location: 'Jardín Volterra, Zona Esmeralda, Estado de México',
  description: 'Celebración de la Generación 2027 de Médico Cirujano y Homeópata, ENMH · IPN.',
};

const opening = document.querySelector('#opening');
const invitation = document.querySelector('#invitacion');
const skipToInvitation = document.querySelector('#skipToInvitation');
const openSeal = document.querySelector('#openSeal');
const skipOpening = document.querySelector('#skipOpening');
const envelopeScene = document.querySelector('#envelopeScene');
const letterPreview = document.querySelector('.letter-preview');
const addCalendar = document.querySelector('#addCalendar');
const shareInvitation = document.querySelector('#shareInvitation');
const toggleDetails = document.querySelector('#toggleDetails');
const eventDetails = document.querySelector('#eventDetails');
const infoCards = [...document.querySelectorAll('.info-card')];
const musicPlayer = document.querySelector('#musicPlayer');
const musicToggle = document.querySelector('#musicToggle');
const musicStatus = document.querySelector('#musicStatus');
const eventAudio = document.querySelector('#eventAudio');
const toast = document.querySelector('#toast');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let openingFallback;
let leavingTimer;
let toastTimer;
let soundtrackRequested = false;
let soundtrackUnavailable = false;

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

function syncMusicPlayer() {
  const isPaused = eventAudio.paused;
  const isUnavailable = soundtrackUnavailable || Boolean(eventAudio.error);
  musicPlayer.classList.toggle('is-paused', isPaused);
  musicPlayer.classList.toggle('is-unavailable', isUnavailable);
  musicStatus.textContent = isUnavailable ? 'Próximamente' : 'Música';
  musicToggle.setAttribute(
    'aria-label',
    isUnavailable ? 'La canción estará disponible próximamente' : isPaused ? 'Reproducir música' : 'Pausar música',
  );
}

function loadSoundtrack() {
  if (eventAudio.getAttribute('src')) return;

  const source = eventAudio.dataset.src;
  if (!source) {
    soundtrackUnavailable = true;
    return;
  }

  eventAudio.src = source;
}

function requestSoundtrack() {
  if (soundtrackRequested) return;

  soundtrackRequested = true;
  soundtrackUnavailable = false;
  eventAudio.volume = 0.6;
  loadSoundtrack();

  if (soundtrackUnavailable) return;

  const playRequest = eventAudio.play();
  if (playRequest) {
    playRequest.catch(() => {
      if (eventAudio.error) {
        soundtrackUnavailable = true;
        syncMusicPlayer();
        return;
      }

      syncMusicPlayer();
    });
  }
}

function resetSoundtrack() {
  soundtrackRequested = false;
  soundtrackUnavailable = false;
  eventAudio.pause();
  eventAudio.removeAttribute('src');
  eventAudio.load();
  syncMusicPlayer();
}

function setDetailsVisible(visible, { scroll = false } = {}) {
  eventDetails.hidden = !visible;
  toggleDetails.setAttribute('aria-expanded', String(visible));
  toggleDetails.textContent = visible ? 'Ocultar detalles' : 'Ver detalles del evento';

  if (visible && scroll) {
    requestAnimationFrame(() => {
      eventDetails.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }
}

function resetOpening() {
  window.clearTimeout(openingFallback);
  window.clearTimeout(leavingTimer);
  opening.hidden = false;
  opening.classList.remove('is-opening', 'is-opened', 'is-leaving');
  opening.dataset.state = 'idle';
  openSeal.setAttribute('aria-expanded', 'false');
  envelopeScene.style.transform = '';
  infoCards.forEach((card) => card.removeAttribute('open'));
  setDetailsVisible(false);
  resetSoundtrack();
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

    syncMusicPlayer();

    leavingTimer = window.setTimeout(() => {
      opening.hidden = true;
      forceScrollTop();
    }, immediate ? 0 : 520);
  };

  if (immediate || reducedMotion.matches) {
    leave();
  } else {
    leavingTimer = window.setTimeout(leave, 180);
  }
}

function openExperience() {
  if (opening.dataset.state !== 'idle') return;

  opening.dataset.state = 'opening';
  openSeal.setAttribute('aria-expanded', 'true');
  openSeal.blur();
  envelopeScene.style.transform = '';
  requestSoundtrack();

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
  openingFallback = window.setTimeout(finishLetter, 1450);
  requestAnimationFrame(() => opening.classList.add('is-opening'));
}

function skipExperience() {
  if (opening.dataset.state === 'complete') return;

  requestSoundtrack();
  opening.classList.add('is-opening');
  revealInvitation({ immediate: true });
}

function handleSkipLink(event) {
  if (opening.hidden) return;

  event.preventDefault();
  skipExperience();
}

function trapOpeningFocus(event) {
  if (event.key !== 'Tab' || opening.hidden || opening.dataset.state !== 'idle') return;

  const focusable = [skipToInvitation, skipOpening, openSeal];
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

function toggleSoundtrack() {
  if (soundtrackUnavailable || eventAudio.error) {
    showToast('La canción todavía no está disponible.');
    return;
  }

  if (eventAudio.paused) {
    loadSoundtrack();
    soundtrackRequested = true;
    const playRequest = eventAudio.play();
    if (playRequest) {
      playRequest.catch(() => showToast('La canción todavía no está disponible.'));
    }
    return;
  }

  eventAudio.pause();
}

function handleCardToggle(event) {
  const activeCard = event.currentTarget;
  const actionLabel = activeCard.querySelector('.info-card__more > span:first-child');
  if (actionLabel) {
    actionLabel.textContent = activeCard.open ? 'Cerrar detalles' : 'Ver detalles';
  }

  if (!activeCard.open) return;

  infoCards.forEach((card) => {
    if (card !== activeCard) card.removeAttribute('open');
  });
}

function handleDetailsToggle() {
  const shouldShow = eventDetails.hidden;
  setDetailsVisible(shouldShow, { scroll: shouldShow });
}

openSeal.addEventListener('click', openExperience);
skipOpening.addEventListener('click', skipExperience);
skipToInvitation.addEventListener('click', handleSkipLink);
opening.addEventListener('keydown', trapOpeningFocus);
opening.addEventListener('pointermove', moveEnvelope);
opening.addEventListener('pointerleave', resetEnvelopePosition);
addCalendar.addEventListener('click', downloadCalendarEvent);
shareInvitation.addEventListener('click', share);
toggleDetails.addEventListener('click', handleDetailsToggle);
musicToggle.addEventListener('click', toggleSoundtrack);
eventAudio.addEventListener('play', syncMusicPlayer);
eventAudio.addEventListener('pause', syncMusicPlayer);
eventAudio.addEventListener('error', () => {
  soundtrackUnavailable = true;
  syncMusicPlayer();
});
infoCards.forEach((card) => card.addEventListener('toggle', handleCardToggle));

window.addEventListener('pageshow', (event) => {
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  if (event.persisted) {
    resetOpening();
  } else {
    forceScrollTop();
  }
});

resetOpening();
