// Built-in characters (SVG) and synthesized sounds, shared by the overlay and the settings preview.
(function () {
  const OUTLINE = '#2b2b2b';
  let uid = 0;

  // One eye with an eyelid that slides down (class "lid") when the SVG gets the "blinking" class.
  function eye({ cx, cy, rx, ry, iris, irisR, lid, pupil = 'round', look = [4, 4], sclera = '#fff' }) {
    const id = 'eyeclip' + uid++;
    const ix = cx + look[0], iy = cy + look[1];
    const lidH = 2 * ry + 6;
    const pupilEl = pupil === 'slit'
      ? `<ellipse cx="${ix}" cy="${iy}" rx="${irisR * 0.22}" ry="${irisR * 0.85}" fill="#111"/>`
      : `<circle cx="${ix}" cy="${iy}" r="${irisR * 0.5}" fill="#111"/>`;
    return `
      <clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>
      <g clip-path="url(#${id})">
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${sclera}"/>
        <circle cx="${ix}" cy="${iy}" r="${irisR}" fill="${iris}"/>
        ${pupilEl}
        <circle cx="${ix + irisR * 0.35}" cy="${iy - irisR * 0.4}" r="${irisR * 0.25}" fill="#fff"/>
        <g class="lid" style="--d:${lidH}px">
          <rect x="${cx - rx - 2}" y="${cy - ry - lidH}" width="${2 * rx + 4}" height="${lidH}" fill="${lid}"/>
          <rect x="${cx - rx - 2}" y="${cy - ry - 4}" width="${2 * rx + 4}" height="4" fill="${OUTLINE}"/>
        </g>
      </g>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${OUTLINE}" stroke-width="4"/>`;
  }

  const svg = (viewBox, body) =>
    `<svg class="character" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  const CHARACTERS = {
    eyes: () => svg('0 0 200 150', `
      <path d="M28 22 Q62 6 94 22" stroke="${OUTLINE}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M106 22 Q138 6 172 22" stroke="${OUTLINE}" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${eye({ cx: 62, cy: 82, rx: 34, ry: 46, iris: '#7a4a2a', irisR: 18, lid: '#f4c7a1' })}
      ${eye({ cx: 138, cy: 82, rx: 34, ry: 46, iris: '#7a4a2a', irisR: 18, lid: '#f4c7a1' })}`),

    cat: () => svg('0 0 200 185', `
      <polygon points="26,78 40,8 92,48" fill="#f2a54a" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="174,78 160,8 108,48" fill="#f2a54a" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="40,62 46,26 72,48" fill="#f7b8c0"/>
      <polygon points="160,62 154,26 128,48" fill="#f7b8c0"/>
      <ellipse cx="100" cy="112" rx="86" ry="68" fill="#f2a54a" stroke="${OUTLINE}" stroke-width="4"/>
      <path d="M88 50 l4 16 M100 46 v18 M112 50 l-4 16" stroke="#c9782a" stroke-width="5" stroke-linecap="round"/>
      ${eye({ cx: 64, cy: 102, rx: 23, ry: 27, iris: '#7cc46a', irisR: 17, lid: '#e89535', pupil: 'slit', look: [2, 2] })}
      ${eye({ cx: 136, cy: 102, rx: 23, ry: 27, iris: '#7cc46a', irisR: 17, lid: '#e89535', pupil: 'slit', look: [2, 2] })}
      <polygon points="92,132 108,132 100,142" fill="#f28b9b" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M100 142 q-8 11 -18 4 M100 142 q8 11 18 4" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M40 132 h-32 M42 142 l-30 8 M160 132 h32 M158 142 l30 8" stroke="${OUTLINE}" stroke-width="2.5" stroke-linecap="round"/>`),

    owl: () => svg('0 0 200 195', `
      <polygon points="36,48 30,6 72,34" fill="#7a4f30" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="164,48 170,6 128,34" fill="#7a4f30" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="100" cy="112" rx="82" ry="78" fill="#8b5e3c" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="100" cy="152" rx="46" ry="34" fill="#d9b48f"/>
      <path d="M82 146 l6 6 l6 -6 M106 146 l6 6 l6 -6 M94 162 l6 6 l6 -6" stroke="#8b5e3c" stroke-width="3" fill="none"/>
      <circle cx="66" cy="86" r="38" fill="#d9b48f"/>
      <circle cx="134" cy="86" r="38" fill="#d9b48f"/>
      ${eye({ cx: 66, cy: 86, rx: 27, ry: 27, iris: '#f5b700', irisR: 18, lid: '#8b5e3c', look: [2, 2] })}
      ${eye({ cx: 134, cy: 86, rx: 27, ry: 27, iris: '#f5b700', irisR: 18, lid: '#8b5e3c', look: [2, 2] })}
      <polygon points="90,112 110,112 100,132" fill="#f0a030" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`),

    frog: () => svg('0 0 200 175', `
      <circle cx="58" cy="60" r="38" fill="#6cc36a" stroke="${OUTLINE}" stroke-width="4"/>
      <circle cx="142" cy="60" r="38" fill="#6cc36a" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="100" cy="118" rx="90" ry="54" fill="#6cc36a" stroke="${OUTLINE}" stroke-width="4"/>
      <rect x="30" y="70" width="140" height="30" fill="#6cc36a"/>
      ${eye({ cx: 58, cy: 58, rx: 26, ry: 26, iris: '#3a2a14', irisR: 13, lid: '#58ad57', look: [3, 3] })}
      ${eye({ cx: 142, cy: 58, rx: 26, ry: 26, iris: '#3a2a14', irisR: 13, lid: '#58ad57', look: [3, 3] })}
      <circle cx="92" cy="104" r="3" fill="${OUTLINE}"/><circle cx="108" cy="104" r="3" fill="${OUTLINE}"/>
      <path d="M46 124 Q100 168 154 124" stroke="${OUTLINE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="120" r="11" fill="#f5a3b0" opacity=".7"/>
      <circle cx="162" cy="120" r="11" fill="#f5a3b0" opacity=".7"/>`),

    panda: () => svg('0 0 200 185', `
      <circle cx="40" cy="42" r="26" fill="#2b2b2b"/>
      <circle cx="160" cy="42" r="26" fill="#2b2b2b"/>
      <ellipse cx="100" cy="104" rx="86" ry="72" fill="#fff" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="66" cy="94" rx="25" ry="32" fill="#333" transform="rotate(-28 66 94)"/>
      <ellipse cx="134" cy="94" rx="25" ry="32" fill="#333" transform="rotate(28 134 94)"/>
      ${eye({ cx: 69, cy: 92, rx: 13, ry: 14, iris: '#3a2a1a', irisR: 9, lid: '#444', look: [1, 2] })}
      ${eye({ cx: 131, cy: 92, rx: 13, ry: 14, iris: '#3a2a1a', irisR: 9, lid: '#444', look: [1, 2] })}
      <ellipse cx="100" cy="126" rx="13" ry="9" fill="#2b2b2b"/>
      <path d="M100 134 v7 M100 141 q-10 9 -19 2 M100 141 q10 9 19 2" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="132" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>
      <ellipse cx="156" cy="132" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>`),

    dog: () => svg('0 0 210 190', `
      <ellipse cx="105" cy="100" rx="72" ry="72" fill="#d9a066" stroke="${OUTLINE}" stroke-width="4"/>
      <path d="M105 34 Q90 78 95 112 L115 112 Q120 78 105 34 Z" fill="#fff7ea"/>
      <ellipse cx="105" cy="140" rx="42" ry="30" fill="#fff7ea"/>
      <path d="M48 44 Q8 54 14 128 Q24 152 50 132 Q58 92 66 58 Z" fill="#7a4a26" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M162 44 Q202 54 196 128 Q186 152 160 132 Q152 92 144 58 Z" fill="#7a4a26" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      ${eye({ cx: 76, cy: 98, rx: 13, ry: 15, iris: '#4a2c14', irisR: 10, lid: '#c98d52', look: [1, 2] })}
      ${eye({ cx: 134, cy: 98, rx: 13, ry: 15, iris: '#4a2c14', irisR: 10, lid: '#c98d52', look: [1, 2] })}
      <ellipse cx="105" cy="128" rx="15" ry="10" fill="#2b2b2b"/>
      <ellipse cx="100" cy="124" rx="5" ry="3" fill="#777"/>
      <path d="M98 150 q7 20 14 0 Z" fill="#f27a8a" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M105 138 v8 M105 146 q-12 10 -22 2 M105 146 q12 10 22 2" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>`),

    bunny: () => svg('0 0 200 210', `
      <ellipse cx="68" cy="52" rx="20" ry="48" fill="#f3eee8" stroke="${OUTLINE}" stroke-width="4" transform="rotate(-10 68 52)"/>
      <ellipse cx="132" cy="52" rx="20" ry="48" fill="#f3eee8" stroke="${OUTLINE}" stroke-width="4" transform="rotate(10 132 52)"/>
      <ellipse cx="68" cy="56" rx="9" ry="34" fill="#f7b8c0" transform="rotate(-10 68 56)"/>
      <ellipse cx="132" cy="56" rx="9" ry="34" fill="#f7b8c0" transform="rotate(10 132 56)"/>
      <ellipse cx="100" cy="142" rx="80" ry="62" fill="#f3eee8" stroke="${OUTLINE}" stroke-width="4"/>
      ${eye({ cx: 70, cy: 134, rx: 14, ry: 16, iris: '#5a3b2a', irisR: 11, lid: '#e2d8cc', look: [1, 2] })}
      ${eye({ cx: 130, cy: 134, rx: 14, ry: 16, iris: '#5a3b2a', irisR: 11, lid: '#e2d8cc', look: [1, 2] })}
      <polygon points="93,156 107,156 100,164" fill="#f28b9b" stroke="${OUTLINE}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="95" y="171" width="10" height="10" rx="2" fill="#fff" stroke="${OUTLINE}" stroke-width="2"/>
      <path d="M100 171 v10" stroke="${OUTLINE}" stroke-width="1.5"/>
      <path d="M100 164 v6 M100 170 q-8 7 -16 1 M100 170 q8 7 16 1" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="46" cy="160" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>
      <ellipse cx="154" cy="160" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>`),

    fox: () => svg('0 0 210 200', `
      <polygon points="28,84 42,6 98,52" fill="#f07a2a" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="182,84 168,6 112,52" fill="#f07a2a" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="44,66 48,24 80,50" fill="#fff3e3"/>
      <polygon points="166,66 162,24 130,50" fill="#fff3e3"/>
      <path d="M18 80 Q28 40 105 42 Q182 40 192 80 Q188 124 105 188 Q22 124 18 80 Z" fill="#f07a2a" stroke="${OUTLINE}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M26 100 Q70 104 105 128 Q140 104 184 100 Q160 146 105 186 Q50 146 26 100 Z" fill="#fff7ec"/>
      ${eye({ cx: 70, cy: 90, rx: 14, ry: 15, iris: '#c9801a', irisR: 10, lid: '#e06a1f', look: [2, 2] })}
      ${eye({ cx: 140, cy: 90, rx: 14, ry: 15, iris: '#c9801a', irisR: 10, lid: '#e06a1f', look: [2, 2] })}
      <ellipse cx="105" cy="170" rx="11" ry="8" fill="#2b2b2b"/>
      <ellipse cx="101" cy="167" rx="4" ry="2.5" fill="#777"/>`),

    koala: () => svg('0 0 220 190', `
      <circle cx="42" cy="64" r="36" fill="#9aa0a8" stroke="${OUTLINE}" stroke-width="4"/>
      <circle cx="178" cy="64" r="36" fill="#9aa0a8" stroke="${OUTLINE}" stroke-width="4"/>
      <circle cx="44" cy="66" r="22" fill="#f2eee9"/>
      <circle cx="176" cy="66" r="22" fill="#f2eee9"/>
      <ellipse cx="110" cy="112" rx="78" ry="70" fill="#a7adb5" stroke="${OUTLINE}" stroke-width="4"/>
      ${eye({ cx: 78, cy: 98, rx: 12, ry: 13, iris: '#2a2a2a', irisR: 9, lid: '#8f959d', look: [1, 2] })}
      ${eye({ cx: 142, cy: 98, rx: 12, ry: 13, iris: '#2a2a2a', irisR: 9, lid: '#8f959d', look: [1, 2] })}
      <ellipse cx="110" cy="124" rx="18" ry="25" fill="#3a3a3e"/>
      <ellipse cx="104" cy="112" rx="5" ry="7" fill="#6a6a70"/>
      <path d="M99 158 q11 8 22 0" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="138" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>
      <ellipse cx="160" cy="138" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>`),

    penguin: () => svg('0 0 200 190', `
      <ellipse cx="100" cy="102" rx="80" ry="78" fill="#2d3440" stroke="${OUTLINE}" stroke-width="4"/>
      <path d="M94 26 q4 -16 14 -6" stroke="#2d3440" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M100 64 Q80 38 52 52 Q26 72 34 114 Q48 170 100 174 Q152 170 166 114 Q174 72 148 52 Q120 38 100 64 Z" fill="#fff"/>
      ${eye({ cx: 72, cy: 98, rx: 13, ry: 15, iris: '#1e1e24', irisR: 10, lid: '#dfe3e8', look: [1, 2] })}
      ${eye({ cx: 128, cy: 98, rx: 13, ry: 15, iris: '#1e1e24', irisR: 10, lid: '#dfe3e8', look: [1, 2] })}
      <path d="M84 120 Q100 110 116 120 Q100 144 84 120 Z" fill="#f5a623" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="54" cy="130" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>
      <ellipse cx="146" cy="130" rx="12" ry="8" fill="#f5a3b0" opacity=".6"/>`),

    capybara: () => svg('0 0 220 185', `
      <ellipse cx="58" cy="46" rx="16" ry="13" fill="#8a5a33" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="162" cy="46" rx="16" ry="13" fill="#8a5a33" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="58" cy="48" rx="7" ry="6" fill="#5e3b1f"/>
      <ellipse cx="162" cy="48" rx="7" ry="6" fill="#5e3b1f"/>
      <rect x="26" y="44" width="168" height="134" rx="58" fill="#b07a4a" stroke="${OUTLINE}" stroke-width="4"/>
      <ellipse cx="110" cy="140" rx="66" ry="34" fill="#c4915f"/>
      <circle cx="110" cy="30" r="19" fill="#ff9a1f" stroke="${OUTLINE}" stroke-width="4"/>
      <path d="M110 12 q10 -12 22 -6 q-8 10 -22 6" fill="#5dbb4b" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="103" cy="24" r="4" fill="#ffc46b"/>
      ${eye({ cx: 70, cy: 90, rx: 13, ry: 14, iris: '#2a1a0e', irisR: 10, lid: '#a06c3e', look: [1, 2] })}
      ${eye({ cx: 150, cy: 90, rx: 13, ry: 14, iris: '#2a1a0e', irisR: 10, lid: '#a06c3e', look: [1, 2] })}
      <ellipse cx="110" cy="126" rx="30" ry="15" fill="#5a3a22"/>
      <ellipse cx="97" cy="125" rx="6" ry="4.5" fill="#24160b"/>
      <ellipse cx="123" cy="125" rx="6" ry="4.5" fill="#24160b"/>
      <path d="M110 141 v8 M110 149 q-12 9 -22 2 M110 149 q12 9 22 2" stroke="${OUTLINE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="46" cy="126" rx="12" ry="8" fill="#f29b8f" opacity=".55"/>
      <ellipse cx="174" cy="126" rx="12" ry="8" fill="#f29b8f" opacity=".55"/>`),
  };

  // Time (ms) of one open→closed→open cycle; the SVG blinks twice.
  const BLINK_MS = 420;

  let audioCtx = null;
  function playBuiltinSound(id, volume) {
    audioCtx = audioCtx || new AudioContext();
    const ctx = audioCtx;
    const out = ctx.createGain();
    out.gain.value = volume;
    out.connect(ctx.destination);
    const t = ctx.currentTime + 0.02;
    const tone = (type, f0, f1, start, dur, peak = 1) => {
      const o = ctx.createOscillator();
      const env = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t + start);
      o.frequency.exponentialRampToValueAtTime(f1, t + start + dur);
      env.gain.setValueAtTime(0.0001, t + start);
      env.gain.exponentialRampToValueAtTime(peak, t + start + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      o.connect(env).connect(out);
      o.start(t + start);
      o.stop(t + start + dur + 0.05);
      return o;
    };
    if (id === 'pop') {
      tone('sine', 900, 160, 0, 0.13);
    } else if (id === 'chime') {
      tone('sine', 1046, 1046, 0, 1.0, 0.55);
      tone('sine', 1568, 1568, 0.12, 1.1, 0.35);
    } else if (id === 'boing') {
      const o = tone('triangle', 140, 480, 0, 0.45, 0.9);
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 18;
      depth.gain.value = 40;
      lfo.connect(depth).connect(o.frequency);
      lfo.start(t);
      lfo.stop(t + 0.5);
    }
  }

  function playSound(sound, volume) {
    if (!sound) return;
    if (sound.type === 'builtin') return playBuiltinSound(sound.id, volume);
    const a = new Audio(sound.url);
    a.volume = volume;
    a.play().catch(() => {});
  }

  window.Blink = { CHARACTERS, BLINK_MS, playSound };
})();
