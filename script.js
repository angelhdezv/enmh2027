const EVENT = {
  name: 'Noche de Graduación · ENMH Generación 2027',
  start: '2027-11-27T20:00:00-06:00',
  end: '2027-11-28T04:00:00-06:00',
  location: 'Ciudad de México, México',
  description:
    'Celebración de la Generación 2027 de Médico Cirujano y Homeópata de la Escuela Nacional de Medicina y Homeopatía.',
};

const motionIsReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function openExperience() {
  const opening = document.querySelector('#opening');
  const seal = document.querySelector('#openInvite');
  const invitation = document.querySelector('#invitacion');

  if (!opening || opening.dataset.state === 'opening') return;

  opening.dataset.state = 'opening';
  seal.setAttribute('aria-expanded', 'true');
  opening.classList.add('is-opening');

  const leaveDelay = motionIsReduced.matches ? 80 : 1850;
  window.setTimeout(() => {
    opening.classList.add('is-leaving');
    document.body.classList.remove('intro-active');
    invitation.focus({ preventScroll: true });

    window.setTimeout(
      () => {
        opening.hidden = true;
      },
      motionIsReduced.matches ? 20 : 1050,
    );
  }, leaveDelay);
}

function skipExperience() {
  const opening = document.querySelector('#opening');
  const invitation = document.querySelector('#invitacion');

  if (!opening) return;
  opening.hidden = true;
  document.body.classList.remove('intro-active');
  invitation.focus({ preventScroll: true });
}

function initializeOpening() {
  const opening = document.querySelector('#opening');
  const seal = document.querySelector('#openInvite');
  const skip = document.querySelector('#skipOpening');
  const scene = document.querySelector('#envelopeScene');

  if (!opening || !seal || !skip || !scene) return;

  document.body.classList.add('intro-active');
  seal.addEventListener('click', openExperience);
  skip.addEventListener('click', skipExperience);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !opening.hidden) skipExperience();

    if (event.key === 'Tab' && !opening.hidden) {
      const movingBack = event.shiftKey;
      const atFirstControl = document.activeElement === skip;
      const atLastControl = document.activeElement === seal;

      if ((movingBack && atFirstControl) || (!movingBack && atLastControl)) {
        event.preventDefault();
        (movingBack ? seal : skip).focus();
      }
    }
  });

  if (!motionIsReduced.matches && window.matchMedia('(pointer: fine)').matches) {
    opening.addEventListener('pointermove', (event) => {
      if (opening.dataset.state === 'opening') return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      scene.style.transform = `translateY(3%) rotateX(${-y * 2.4}deg) rotateY(${x * 3.5}deg)`;
    });
    opening.addEventListener('pointerleave', () => {
      scene.style.transform = 'translateY(3%) rotateX(0) rotateY(0)';
    });
  }

  window.setTimeout(() => seal.focus({ preventScroll: true }), 250);
}

function initializeRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  if (motionIsReduced.matches || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  reveals.forEach((element) => observer.observe(element));
}

function pad(value, length = 2) {
  return String(Math.max(0, value)).padStart(length, '0');
}

function initializeCountdown() {
  const target = new Date(EVENT.start).getTime();
  const days = document.querySelector('[data-days]');
  const hours = document.querySelector('[data-hours]');
  const minutes = document.querySelector('[data-minutes]');
  const seconds = document.querySelector('[data-seconds]');
  const accessible = document.querySelector('#countdownAccessible');

  if (!days || !hours || !minutes || !seconds || !accessible) return;

  let lastAnnouncedMinute = null;

  const update = () => {
    const remaining = Math.max(0, target - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const dayValue = Math.floor(totalSeconds / 86400);
    const hourValue = Math.floor((totalSeconds % 86400) / 3600);
    const minuteValue = Math.floor((totalSeconds % 3600) / 60);
    const secondValue = totalSeconds % 60;

    days.textContent = pad(dayValue, 3);
    hours.textContent = pad(hourValue);
    minutes.textContent = pad(minuteValue);
    seconds.textContent = pad(secondValue);

    if (minuteValue !== lastAnnouncedMinute) {
      accessible.textContent = remaining
        ? `Faltan ${dayValue} días, ${hourValue} horas y ${minuteValue} minutos.`
        : 'La celebración ha comenzado.';
      lastAnnouncedMinute = minuteValue;
    }
  };

  update();
  window.setInterval(update, 1000);
}

function formatCalendarDate(dateString) {
  return new Date(dateString).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeCalendarText(text) {
  return text.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}

function downloadCalendarEvent() {
  const now = formatCalendarDate(new Date().toISOString());
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ENMH 2027//Invitacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:enmh-2027-${Date.now()}@caele.mx`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatCalendarDate(EVENT.start)}`,
    `DTEND:${formatCalendarDate(EVENT.end)}`,
    `SUMMARY:${escapeCalendarText(EVENT.name)}`,
    `DESCRIPTION:${escapeCalendarText(EVENT.description)}`,
    `LOCATION:${escapeCalendarText(EVENT.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const file = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graduacion-enmh-2027.ics';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('La fecha quedó lista para agregar a tu calendario.');
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

function initializeCalendar() {
  document.querySelectorAll('#addCalendar, [data-calendar]').forEach((button) => {
    button.addEventListener('click', downloadCalendarEvent);
  });
}

function initializeRsvpDialog() {
  const dialog = document.querySelector('#rsvpDialog');
  if (!dialog) return;

  const closeButtons = dialog.querySelectorAll('.rsvp-dialog__close, .rsvp-dialog__accept');

  const show = () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  const close = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  document.querySelectorAll('[data-open-rsvp]').forEach((button) => {
    button.addEventListener('click', show);
  });
  closeButtons.forEach((button) => button.addEventListener('click', close));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
}

function initializeHeroParallax() {
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero__art');

  if (!hero || !art || motionIsReduced.matches || !window.matchMedia('(pointer: fine)').matches) return;

  let frame;
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      art.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
    });
  });
}

initializeOpening();
initializeRevealAnimations();
initializeCountdown();
initializeCalendar();
initializeRsvpDialog();
initializeHeroParallax();
