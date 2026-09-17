'use strict';

const EVENT = {
  name: 'Médico Cirujano y Homeópata · Generación 2027',
  startDate: '20270522',
  endDate: '20270523',
  location: 'Jardín Volterra, Zona Esmeralda, Estado de México',
  description: 'Celebración de la Generación 2027 de Médico Cirujano y Homeópata, ENMH · IPN.',
};
// Midnight in Mexico City; the event's actual starting time is still unconfirmed.
const EVENT_START = Date.UTC(2027, 4, 22, 6, 0, 0);
const root = document.documentElement;
const $ = (selector) => document.querySelector(selector);
const opening = $('#opening');
const invitation = $('#invitacion');
const cover = $('#coverCard');
const coverSlot = $('#coverSlot');
const envelopeStage = $('#envelopeStage');
const seal = $('#openSeal');
const skipOpening = $('#skipOpening');
const audio = $('#eventAudio');
const musicPlayer = $('#musicPlayer');
const musicToggle = $('#musicToggle');
const musicPlaybackToggle = $('#musicPlaybackToggle');
const dressDialog = $('#dressDetailsDialog');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let openingRun = 0;
let openingFallback;
let coverGeometry;
let toastTimer;
let soundtrackRequested = false;
let soundtrackUnavailable = false;
let lineAnimator;
let timelineAnimator;
const openingAnimations = new Set();

function showToast(message) {
  window.clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('is-visible');
  toastTimer = window.setTimeout(() => $('#toast').classList.remove('is-visible'), 3000);
}

function syncMusicPlayer() {
  const unavailable = soundtrackUnavailable || Boolean(audio.error);
  const label = unavailable ? 'La canción no está disponible' : audio.paused ? 'Reproducir canción' : 'Pausar canción';
  musicPlayer.classList.toggle('is-paused', audio.paused);
  musicPlayer.classList.toggle('is-unavailable', unavailable);
  for (const control of [musicToggle, musicPlaybackToggle]) {
    control.setAttribute('aria-label', label);
    control.setAttribute('title', label);
    control.setAttribute('aria-pressed', String(!audio.paused));
  }
  musicPlaybackToggle.querySelector('use').setAttribute('href', audio.paused ? '#icon-play' : '#icon-pause');
}

function playSoundtrack() {
  if (!audio.getAttribute('src')) audio.src = audio.dataset.src;
  audio.volume = 0.6;
  soundtrackUnavailable = false;
  const playRequest = audio.play();
  if (playRequest) {
    playRequest.catch(() => {
      soundtrackUnavailable = Boolean(audio.error);
      syncMusicPlayer();
    });
  }
}

function requestSoundtrack() {
  if (soundtrackRequested) return;
  soundtrackRequested = true;
  playSoundtrack();
}

function toggleSoundtrack() {
  if (audio.paused) {
    soundtrackRequested = true;
    playSoundtrack();
  } else {
    audio.pause();
  }
}

function resetSoundtrack() {
  soundtrackRequested = false;
  soundtrackUnavailable = false;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  syncMusicPlayer();
}

function createLineAnimator() {
  let frameRequest = 0;
  const groups = Array.from(document.querySelectorAll('[data-line-scene]'), (element) => ({
    element,
    path: element.querySelector('[data-line-path]'),
    drawings: ENMH_ART.scenes[element.dataset.lineScene],
    elapsed: element.dataset.lineScene === 'cover' ? ENMH_ART.timing.draw : 0,
    previous: null,
    index: -1,
    visible: false,
  }));

  function paint(group, frame) {
    if (frame.index !== group.index) {
      group.path.setAttribute('d', ENMH_ART.drawings[group.drawings[frame.index]].path);
      group.index = frame.index;
    }
    group.path.style.strokeDasharray = '1 1';
    group.path.style.strokeDashoffset = String(frame.offset);
    // Avoid a round-cap dot at the point where the pen starts or leaves the paper.
    group.path.style.visibility = frame.progress > 0 ? 'visible' : 'hidden';
  }

  function canRun() {
    return opening.hidden && !document.hidden && !dressDialog.open && !reducedMotion.matches;
  }

  function tick(now) {
    frameRequest = 0;
    if (!canRun()) return;
    for (const group of groups) {
      if (!group.visible) continue;
      if (group.previous !== null) group.elapsed += now - group.previous;
      group.previous = now;
      paint(group, ENMH_ART.frameAt(group.elapsed, group.drawings.length));
    }
    if (groups.some((group) => group.visible)) frameRequest = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    for (const group of groups) {
      group.previous = null;
      if (reducedMotion.matches) paint(group, { index: 0, offset: 0, progress: 1 });
    }
    if (canRun() && groups.some((group) => group.visible)) frameRequest = requestAnimationFrame(tick);
  }

  function measureVisibility() {
    for (const group of groups) {
      const rect = group.element.getBoundingClientRect();
      group.visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    }
    sync();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const group = groups.find((item) => item.element === entry.target);
        group.visible = entry.isIntersecting;
      }
      sync();
    });
    groups.forEach((group) => observer.observe(group.element));
  } else {
    window.addEventListener('scroll', measureVisibility, { passive: true });
    window.addEventListener('resize', measureVisibility);
  }

  document.addEventListener('visibilitychange', sync);

  return {
    sync,
    measureVisibility,
    reset() {
      for (const group of groups) {
        group.elapsed = group.element.dataset.lineScene === 'cover' ? ENMH_ART.timing.draw : 0;
        paint(group, { index: 0, offset: 0, progress: 1 });
      }
      sync();
    },
  };
}

function createTimelineAnimator() {
  const timeline = $('#itineraryTimeline');
  const items = timeline.querySelectorAll('li');
  let frameRequest = 0;

  function measure() {
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    if (!opening.hidden || document.hidden || items.length < 2) return;
    const bounds = timeline.getBoundingClientRect();
    const dotCenter = parseFloat(getComputedStyle(timeline).getPropertyValue('--timeline-dot-center')) || 10.5;
    const first = items[0].getBoundingClientRect().top + dotCenter;
    const last = items[items.length - 1].getBoundingClientRect().top + dotCenter;
    const scrollY = window.scrollY;
    const progress = reducedMotion.matches ? 1 : ENMH_ART.timelineProgress({
      scrollY,
      viewportHeight: window.innerHeight,
      pageHeight: root.scrollHeight,
      start: first + scrollY,
      end: last + scrollY,
    });
    timeline.style.setProperty('--timeline-start', `${first - bounds.top}px`);
    timeline.style.setProperty('--timeline-length', `${Math.max(0, last - first)}px`);
    timeline.style.setProperty('--timeline-progress', String(progress));
    timeline.classList.add('is-scroll-linked');
  }

  function schedule() {
    if (!opening.hidden || document.hidden) {
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      return;
    }
    if (!frameRequest) frameRequest = requestAnimationFrame(measure);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(timeline);
  if (document.fonts) document.fonts.ready.then(schedule);
  return { measure };
}

function restoreCover() {
  // Moving, never cloning, keeps one heading, one set of actions and identical type layout.
  coverSlot.append(cover);
  cover.classList.remove('is-travelling');
  cover.removeAttribute('style');
  cover.removeAttribute('aria-hidden');
  cover.inert = false;
  coverSlot.style.height = '';
}

function placeCoverInEnvelope() {
  restoreCover();
  const cardRect = cover.getBoundingClientRect();
  const stageRect = envelopeStage.getBoundingClientRect();
  if (!cardRect.width || !cardRect.height || !stageRect.height) return false;
  const layout = ENMH_ART.envelopeLayout(cardRect, stageRect);
  coverGeometry = { cardRect, ...layout };
  const properties = {
    '--envelope-left': layout.left,
    '--envelope-top': layout.top,
    '--envelope-width': layout.width,
    '--envelope-height': layout.height,
    '--flap-height': layout.flapHeight,
  };
  for (const [name, value] of Object.entries(properties)) opening.style.setProperty(name, `${value}px`);
  coverSlot.style.height = `${cardRect.height}px`;
  cover.classList.add('is-travelling');
  Object.assign(cover.style, {
    left: `${cardRect.left}px`, top: `${cardRect.top}px`,
    width: `${cardRect.width}px`, height: `${cardRect.height}px`,
    visibility: 'hidden',
    transform: coverTransform(layout.cardX, layout.cardY),
  });
  cover.setAttribute('aria-hidden', 'true');
  cover.inert = true;
  opening.append(cover);
  return true;
}

function coverTransform(x, y) {
  const { cardRect, scale } = coverGeometry;
  return `translate(${x - cardRect.left}px, ${y - cardRect.top}px) scale(${scale})`;
}

function animateOpening(element, keyframes, options) {
  const animation = element.animate(keyframes, { fill: 'forwards', ...options });
  openingAnimations.add(animation);
  // Cancellation by skip, resize or bfcache is a normal exit, not an unhandled rejection.
  return animation.finished.catch(() => {});
}

function cancelOpeningAnimations() {
  window.clearTimeout(openingFallback);
  openingAnimations.forEach((animation) => animation.cancel());
  openingAnimations.clear();
}

function finishOpening() {
  if (opening.hidden) return;
  openingRun += 1;
  opening.hidden = true;
  cancelOpeningAnimations();
  restoreCover();
  opening.dataset.state = 'complete';
  opening.classList.remove('is-settling');
  root.classList.remove('intro-active', 'intro-revealing');
  invitation.inert = false;
  invitation.focus({ preventScroll: true });
  lineAnimator?.measureVisibility();
  timelineAnimator?.measure();
}

async function openExperience() {
  if (opening.dataset.state !== 'idle') return;
  const run = ++openingRun;
  opening.dataset.state = 'opening';
  seal.setAttribute('aria-expanded', 'true');
  seal.blur();
  // Called synchronously in the user's gesture so browser audio policies are respected.
  requestSoundtrack();
  if (reducedMotion.matches || typeof cover.animate !== 'function') {
    finishOpening();
    return;
  }
  openingFallback = window.setTimeout(finishOpening, 4500);
  try {
    if (document.fonts && document.fonts.status !== 'loaded') {
      await document.fonts.ready;
    }
    if (run !== openingRun) return;
    if (!placeCoverInEnvelope()) return finishOpening();
    const flap = $('.envelope__flap');
    const ease = 'cubic-bezier(0.22, 0.68, 0.2, 1)';
    animateOpening(seal, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 });
    animateOpening($('.opening__copy'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    animateOpening($('.opening__hint'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    // The closed flap and pocket conceal the paper; opening the flap uncovers it naturally.
    cover.style.visibility = 'visible';
    await animateOpening(flap, [
      { transform: 'perspective(1000px) rotateX(0deg)' },
      { transform: 'perspective(1000px) rotateX(-180deg)' },
    ], { duration: 500, easing: 'ease-in-out' });
    if (run !== openingRun) return;
    flap.style.zIndex = '2';
    const { cardX, cardY, top } = coverGeometry;
    const emerged = coverTransform(cardX, cardY - Math.min(90, coverGeometry.height * 0.2));
    const drop = window.innerHeight - top + 120;
    for (const layer of document.querySelectorAll('.envelope-layer')) {
      const rotation = layer === flap ? ' perspective(1000px) rotateX(-180deg)' : '';
      animateOpening(layer, [
        { transform: `translateY(0px)${rotation}` },
        { transform: `translateY(${drop}px)${rotation}` },
      ], { duration: 780, easing: ease });
    }
    await animateOpening(cover, [
      { transform: coverTransform(cardX, cardY) },
      { transform: emerged },
    ], { duration: 780, easing: ease });
    if (run !== openingRun) return;
    root.classList.add('intro-revealing');
    opening.classList.add('is-settling');
    animateOpening($('.opening__top'), [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });
    await animateOpening(cover, [
      { transform: emerged },
      { transform: 'translate(0px, 0px) scale(1)' },
    ], { duration: 650, easing: ease });
    if (run === openingRun) finishOpening();
  } catch {
    if (run === openingRun) finishOpening();
  }
}

function skipExperience() {
  if (opening.hidden) return;
  requestSoundtrack();
  finishOpening();
}

function resetOpening() {
  openingRun += 1;
  cancelOpeningAnimations();
  restoreCover();
  opening.hidden = false;
  opening.dataset.state = 'idle';
  opening.classList.remove('is-settling');
  $('.envelope__flap').style.zIndex = '';
  seal.setAttribute('aria-expanded', 'false');
  if (dressDialog.open) dressDialog.close();
  root.classList.remove('intro-revealing', 'dialog-active');
  root.classList.add('intro-active');
  invitation.inert = true;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  resetSoundtrack();
  lineAnimator?.reset();
  if (!placeCoverInEnvelope()) finishOpening();
}

function trapOpeningFocus(event) {
  if (opening.hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    skipExperience();
  }
  if (event.key !== 'Tab') return;
  const items = opening.dataset.state === 'idle' ? [skipOpening, seal] : [skipOpening];
  const index = items.indexOf(document.activeElement);
  if (event.shiftKey && index <= 0) {
    event.preventDefault();
    items.at(-1).focus();
  } else if (!event.shiftKey && (index === -1 || index === items.length - 1)) {
    event.preventDefault();
    items[0].focus();
  }
}

function escapeIcsText(value) {
  return value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function downloadCalendarEvent() {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Caele//ENMH 2027//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:enmh-2027-${EVENT.startDate}@caele.mx`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART;VALUE=DATE:${EVENT.startDate}`, `DTEND;VALUE=DATE:${EVENT.endDate}`,
    `SUMMARY:${escapeIcsText(EVENT.name)}`, `LOCATION:${escapeIcsText(EVENT.location)}`,
    `DESCRIPTION:${escapeIcsText(EVENT.description)}`, 'END:VEVENT', 'END:VCALENDAR', '',
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graduacion-enmh-2027.ics';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Fecha guardada: 22 de mayo de 2027.');
}

async function share() {
  const data = {
    title: EVENT.name,
    text: 'Sábado 22 de mayo de 2027 · Jardín Volterra, Zona Esmeralda.',
    url: window.location.href.split('#')[0],
  };
  if (navigator.share) {
    try { await navigator.share(data); return; }
    catch (error) { if (error.name === 'AbortError') return; }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    showToast('Enlace copiado.');
  } catch {
    showToast('Copia la dirección de esta página para compartirla.');
  }
}

function updateCountdown() {
  const remaining = Math.max(0, EVENT_START - Date.now());
  const minutes = Math.floor(remaining / 60000);
  $('[data-countdown-days]').textContent = String(Math.floor(minutes / 1440)).padStart(3, '0');
  $('[data-countdown-hours]').textContent = String(Math.floor(minutes % 1440 / 60)).padStart(2, '0');
  $('[data-countdown-minutes]').textContent = String(minutes % 60).padStart(2, '0');
  if (!remaining && !$('#countdown').classList.contains('is-complete')) {
    $('#countdown').classList.add('is-complete');
    $('#countdownStatus').textContent = 'Llegó el día. Hoy celebramos.';
  }
}

seal.addEventListener('click', openExperience);
skipOpening.addEventListener('click', skipExperience);
$('#skipToInvitation').addEventListener('click', (event) => {
  if (!opening.hidden) { event.preventDefault(); skipExperience(); }
});
document.addEventListener('keydown', trapOpeningFocus);
$('#addCalendar').addEventListener('click', downloadCalendarEvent);
$('#shareInvitation').addEventListener('click', share);
musicToggle.addEventListener('click', toggleSoundtrack);
musicPlaybackToggle.addEventListener('click', toggleSoundtrack);
for (const name of ['play', 'pause', 'ended']) audio.addEventListener(name, syncMusicPlayer);
audio.addEventListener('error', () => { soundtrackUnavailable = true; syncMusicPlayer(); });
$('#openDressDetails').addEventListener('click', () => {
  dressDialog.showModal();
  root.classList.add('dialog-active');
  lineAnimator.sync();
});
dressDialog.addEventListener('close', () => {
  root.classList.remove('dialog-active');
  lineAnimator.sync();
});
dressDialog.addEventListener('click', (event) => {
  if (event.target !== dressDialog) return;
  const rect = dressDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dressDialog.close();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && opening.dataset.state === 'opening') finishOpening();
  lineAnimator.sync();
  timelineAnimator.measure();
});
let resizeFrame;
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (opening.dataset.state === 'opening') finishOpening();
    else if (!opening.hidden) placeCoverInEnvelope();
    lineAnimator.measureVisibility();
  });
});
window.addEventListener('pageshow', (event) => {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  if (event.persisted) resetOpening();
});
window.addEventListener('beforeprint', finishOpening);

lineAnimator = createLineAnimator();
timelineAnimator = createTimelineAnimator();
updateCountdown();
window.setInterval(updateCountdown, 1000);
resetOpening();
if (document.fonts) {
  document.fonts.ready.then(() => {
    if (opening.dataset.state === 'idle') placeCoverInEnvelope();
  });
}
window.clearTimeout(window.enmhBootGuard);
