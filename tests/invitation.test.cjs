const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const root = resolve(__dirname, '..');
const read = (name) => readFileSync(resolve(root, name));
const art = vm.runInNewContext(`${read('assets/illustrations/continuous-lines.js')}\nENMH_ART;`);

test('each drawing takes exactly 2 s to draw, 1 s to hold and 2 s to erase', () => {
  for (const count of [1, 2, 4]) {
    const samples = [
      [0, 'draw', 0], [1000, 'draw', 0.5], [1999, 'draw', 0.9995],
      [2000, 'hold', 1], [2500, 'hold', 1], [2999, 'hold', 1],
      [3000, 'erase', 1], [4000, 'erase', 0.5], [4999, 'erase', 0.0005],
    ];
    for (const [time, phase, progress] of samples) {
      const frame = art.frameAt(time, count);
      assert.equal(frame.phase, phase);
      assert.ok(Math.abs(frame.progress - progress) < 1e-8);
      assert.ok(Math.abs(frame.offset - (1 - progress)) < 1e-8);
      assert.equal(frame.index, 0);
    }
  }
});

test('cover, gala and ticket change only after the previous drawing is erased', () => {
  for (const [scene, expectedCount] of [['cover', 4], ['gala', 2], ['ticket', 1]]) {
    const count = art.scenes[scene].length;
    assert.equal(count, expectedCount);
    for (let cycle = 0; cycle < count * 3; cycle++) {
      const start = art.frameAt(cycle * 5000, count);
      assert.equal(start.index, cycle % count);
      assert.equal(start.progress, 0);
      const end = art.frameAt(cycle * 5000 + 4999, count);
      assert.equal(end.index, cycle % count);
      assert.ok(end.progress < 0.001);
    }
  }
});

test('all seven illustrations are continuous strokes without pen lifts', () => {
  assert.equal(art.drawings.length, 7);
  for (const drawing of art.drawings) {
    assert.match(drawing.path, /^M/);
    assert.equal((drawing.path.match(/[Mm]/g) || []).length, 1, drawing.name);
    assert.doesNotMatch(drawing.path, /NaN|undefined/);
  }
});

test('the real cover fits the envelope with uniform scale at mobile and desktop sizes', () => {
  for (const [width, height, stageWidth, stageHeight] of [
    [276, 735, 280, 290], [328, 730, 350, 430], [388, 755, 400, 500],
    [710, 560, 768, 370], [1078, 560, 1200, 380], [1078, 560, 600, 180],
  ]) {
    const card = { width, height, left: 20, top: 78 };
    const stage = { width: stageWidth, height: stageHeight, left: 24, top: 220 };
    const layout = art.envelopeLayout(card, stage);
    assert.ok(layout.scale > 0 && layout.scale < 1);
    assert.ok(layout.width <= stageWidth && layout.height <= stageHeight);
    assert.equal(layout.flapHeight, layout.height / 2, 'The flap tip and seal stay centered');
    assert.ok(layout.cardX >= layout.left && layout.cardY >= layout.top);
    assert.ok(layout.cardX + width * layout.scale <= layout.left + layout.width);
    assert.ok(layout.cardY + height * layout.scale <= layout.top + layout.height);
    assert.equal((width * layout.scale) / (height * layout.scale), width / height);
  }
});

test('the itinerary line follows scroll down and erases on scroll up', () => {
  const geometry = { viewportHeight: 800, pageHeight: 2200, start: 1000, end: 1400 };
  for (const [scrollY, expected] of [[0, 0], [360, 0], [560, 0.5], [760, 1], [900, 1], [560, 0.5], [360, 0]]) {
    assert.equal(art.timelineProgress({ ...geometry, scrollY }), expected);
  }
});

test('the itinerary completes at the bottom without a last-frame jump', () => {
  const geometry = { viewportHeight: 900, pageHeight: 1500, start: 950, end: 1400 };
  assert.equal(art.timelineProgress({ ...geometry, scrollY: 600 }), 1);
  const nearEnd = art.timelineProgress({ ...geometry, scrollY: 599 });
  assert.ok(nearEnd > 0.99 && nearEnd < 1);
  assert.ok(art.timelineProgress({ ...geometry, scrollY: 300 }) < nearEnd);
  assert.equal(art.timelineProgress({ ...geometry, pageHeight: 800, scrollY: 0 }), 1);
});

test('the original song and footer SVG remain byte-for-byte unchanged', () => {
  const hash = (name) => createHash('sha256').update(read(name)).digest('hex');
  assert.equal(hash('assets/audio/cancion-evento.mp3'), 'e2115dfb64b5694fb4ec1f071a7156d767ad9c53346dc1cf54b2e0b667625d69');
  assert.equal(hash('assets/branding/caele-logo.svg'), 'bb2e186383edc0bbdb73b0630fe6aca877099f8583c38c475c8fb5357d973ad8');
});

test('one real cover, one school title, and all original event actions remain available', () => {
  const html = read('index.html').toString();
  assert.equal((html.match(/id="coverCard"/g) || []).length, 1);
  assert.equal((html.match(/id="degree-title"/g) || []).length, 1);
  assert.doesNotMatch(html, /letter-preview/);
  for (const id of ['addCalendar', 'shareInvitation', 'musicToggle', 'openDressDetails', 'dressDetailsDialog']) {
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.ok(html.includes('assets/branding/caele-logo.svg'));
  assert.ok(html.includes('data-src="assets/audio/cancion-evento.mp3"'));
  assert.ok(html.includes('Horario por confirmar'));
});
