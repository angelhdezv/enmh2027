/* Original continuous-line artwork: each illustration is one uninterrupted path.
 * The normalized dash follows that path in both directions; it never crossfades.
 */
const ENMH_ART = (() => {
  const drawings = [
  {
    "name": "Birrete",
    "path": "M62 189 C89 208 120 178 151 182 C169 184 181 200 193 179 C201 164 186 162 190 178 L185 201 Q192 205 200 202 L194 181 L197 145 L148 129 Q145 127 148 126 L250 88 Q255 86 260 88 L371 124 Q375 125 371 127 L268 162 Q262 164 256 162 L211 146 Q205 144 205 153 L205 184 Q252 207 308 185 L308 158 Q308 147 313 145 Q316 144 315 154 L314 171 C313 191 333 184 344 178 C361 165 374 182 389 191 C407 204 418 202 435 194"
  },
  {
    "name": "Símbolo médico",
    "path": "M249 247 L249 62 C239 56 243 42 253 42 C264 42 268 56 258 62 L258 238 C238 230 224 226 231 215 C242 202 286 215 289 197 C293 180 225 185 221 169 C216 153 287 160 291 142 C296 123 223 132 220 114 C217 101 233 90 250 92 C260 93 267 99 264 103 C260 108 246 106 242 101 C234 99 228 102 229 108 C231 114 241 114 245 111"
  },
  {
    "name": "Estetoscopio",
    "path": "M211 56 C202 45 203 68 211 59 C216 51 208 46 205 51 C192 82 207 129 237 137 C270 146 299 93 286 54 C284 45 278 46 279 55 C280 67 290 60 286 54 C299 93 270 146 237 137 C228 169 234 207 263 222 C288 236 316 224 317 203 C319 180 282 170 271 148 C258 122 269 106 283 113 C294 118 294 135 292 143 C302 125 322 119 328 135 C339 160 308 182 282 185 C255 188 228 176 217 194 C202 218 224 242 242 229 C259 217 243 196 228 204 C215 211 224 230 237 221"
  },
  {
    "name": "Cruz médica",
    "path": "M250 236 L250 214 L220 214 L220 176 L182 176 L182 128 L220 128 L220 88 L276 88 L276 128 L314 128 L314 176 L276 176 L276 214 L250 214 C228 206 230 194 251 191 C280 187 280 173 251 168 C220 163 222 146 247 139 C276 131 276 116 256 111 C245 108 240 116 248 120 C257 126 267 120 263 115"
  },
  {
    "name": "Vestido",
    "path": "M218 55 L222 83 C232 76 237 79 250 86 C263 73 273 76 277 84 L282 55 L277 84 C271 102 260 116 258 133 C257 159 284 213 310 245 Q244 268 177 245 C200 204 225 160 228 133 C226 116 215 98 222 83 C229 101 240 114 244 136 C241 167 242 211 244 259"
  },
  {
    "name": "Traje",
    "path": "M231 40 L215 53 L188 62 L176 140 L194 143 L205 95 L205 149 L214 153 L212 263 L239 263 L251 179 L263 263 L290 263 L288 153 L299 149 L299 95 L310 143 L328 140 L316 62 L287 53 L272 40 L259 60 L251 104 L231 40 L231 75 L242 79 L230 111 L214 153 L248 153 L248 123 C243 123 243 129 248 129 C253 129 253 123 248 123 L251 104 L272 40 L272 75 L260 79 L273 111 L288 153"
  },
  {
    "name": "Boleto",
    "path": "M338 91 L372 91 Q379 91 379 98 L379 120 C354 120 354 158 379 158 L379 182 Q379 190 372 190 L128 190 Q120 190 120 182 L120 158 C145 158 145 120 120 120 L120 98 Q120 91 128 91 L338 91 L338 190"
  }
];
  const timing = Object.freeze({ draw: 2000, hold: 1000, erase: 2000 });
  const duration = timing.draw + timing.hold + timing.erase;
  const scenes = Object.freeze({ cover: [0, 1, 2, 3], gala: [4, 5], ticket: [6] });

  function frameAt(elapsed, count) {
    const time = Math.max(0, elapsed);
    const local = time % duration;
    const index = Math.floor(time / duration) % count;
    let progress;
    let phase;
    if (local < timing.draw) {
      progress = local / timing.draw;
      phase = 'draw';
    } else if (local < timing.draw + timing.hold) {
      progress = 1;
      phase = 'hold';
    } else {
      progress = 1 - (local - timing.draw - timing.hold) / timing.erase;
      phase = 'erase';
    }
    return { index, progress, offset: 1 - progress, phase };
  }

  // Uniform scale preserves the cover's wrapping and proportions inside the envelope.
  function envelopeLayout(card, stage) {
    const width = Math.min(520, stage.width * 0.9, stage.height * card.width / card.height);
    const scale = width * 0.94 / card.width;
    const height = card.height * scale / 0.95;
    const left = stage.left + (stage.width - width) / 2;
    const top = stage.top + (stage.height - height) / 2;
    return { width, height, left, top, scale, flapHeight: height * 0.5, cardX: left + width * 0.03, cardY: top + height * 0.025 };
  }

  // Map the document's scroll position to the line, in both directions.
  // Cap the end at the page's maximum scroll so the last segment can always finish.
  function timelineProgress({ scrollY, viewportHeight, pageHeight, start, end }) {
    const maxScroll = Math.max(0, pageHeight - viewportHeight);
    if (maxScroll === 0 || end <= start) return 1;
    const guide = viewportHeight * 0.8;
    const from = Math.min(start - guide, maxScroll);
    const to = Math.min(end - guide, maxScroll);
    if (to <= from) return scrollY >= to ? 1 : 0;
    return Math.max(0, Math.min(1, (scrollY - from) / (to - from)));
  }

  return Object.freeze({ drawings, timing, duration, scenes, frameAt, envelopeLayout, timelineProgress });
})();
