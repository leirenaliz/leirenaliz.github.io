'use strict';

const SVG_NS = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'birthMonthGarden/v1';

const MONTHS = [
  { name: 'January',   flower: 'carnation',     color: '#d96a7b' },
  { name: 'February',  flower: 'violet',        color: '#7b5ea7' },
  { name: 'March',     flower: 'daffodil',      color: '#e8b64c' },
  { name: 'April',     flower: 'daisy',         color: '#f4d8e1' },
  { name: 'May',       flower: 'lily',          color: '#e8a0c0' },
  { name: 'June',      flower: 'rose',          color: '#c73e4e' },
  { name: 'July',      flower: 'larkspur',      color: '#6d7fc2' },
  { name: 'August',    flower: 'gladiolus',     color: '#d98248' },
  { name: 'September', flower: 'aster',         color: '#b06cc2' },
  { name: 'October',   flower: 'marigold',      color: '#e8902c' },
  { name: 'November',  flower: 'chrysanthemum', color: '#c96a3a' },
  { name: 'December',  flower: 'poinsettia',    color: '#b0262e' },
];

const MONTH_BY_NAME = Object.fromEntries(MONTHS.map(m => [m.name, m]));

const DEFAULT_MEMBERS = [
  { name: 'Grandma', month: 'May',   color: MONTH_BY_NAME['May'].color },
  { name: 'Grandpa', month: 'March', color: MONTH_BY_NAME['March'].color },
  { name: 'Mom',     month: 'July',  color: MONTH_BY_NAME['July'].color },
];

let state = loadState() || {
  title: "Grammy's Garden",
  members: DEFAULT_MEMBERS.map(m => ({ ...m })),
};

// ---------- Color helpers ----------

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function shade(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex({
      r: r + (255 - r) * amount,
      g: g + (255 - g) * amount,
      b: b + (255 - b) * amount,
    });
  }
  const k = 1 + amount;
  return rgbToHex({ r: r * k, g: g * k, b: b * k });
}

// ---------- Flower renderers ----------
// Each returns SVG markup centered on (0, 0).

function petalPath(length, width) {
  const w = width / 2;
  return `M 0 0 C ${-w} ${-length * 0.35} ${-w} ${-length * 0.75} 0 ${-length} C ${w} ${-length * 0.75} ${w} ${-length * 0.35} 0 0 Z`;
}

function ring(count, rotate, cb) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360 + rotate;
    out += `<g transform="rotate(${angle})">${cb(i)}</g>`;
  }
  return out;
}

const FLOWERS = {
  rose(color) {
    const dark = shade(color, -0.25);
    const mid = shade(color, -0.1);
    const light = shade(color, 0.15);
    let s = '';
    s += ring(8, 0, () =>
      `<path d="${petalPath(34, 28)}" transform="translate(0 -4)" fill="${light}"/>`);
    s += ring(6, 30, () =>
      `<path d="${petalPath(24, 22)}" transform="translate(0 -2)" fill="${color}"/>`);
    s += ring(5, 0, () =>
      `<path d="${petalPath(16, 16)}" fill="${mid}"/>`);
    s += `<circle r="5" fill="${dark}"/>`;
    s += `<path d="M -3 -4 Q 0 0 3 -4 Q 2 -1 0 1 Q -2 -1 -3 -4 Z" fill="${shade(color, -0.4)}"/>`;
    return s;
  },

  daisy(color) {
    const petal = color;
    const edge = shade(color, -0.1);
    let s = '';
    s += ring(12, 0, () =>
      `<ellipse cx="0" cy="-22" rx="7" ry="18" fill="${petal}" stroke="${edge}" stroke-width="0.5"/>`);
    s += `<circle r="8" fill="#f4c430"/>`;
    s += `<circle r="5" fill="#c98f1b"/>`;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      s += `<circle cx="${Math.cos(a) * 4}" cy="${Math.sin(a) * 4}" r="0.8" fill="#8a5a0a"/>`;
    }
    return s;
  },

  carnation(color) {
    const dark = shade(color, -0.2);
    const light = shade(color, 0.15);
    function ruffle(radius, dip, teeth) {
      let d = '';
      for (let i = 0; i <= teeth; i++) {
        const t = (i / teeth) * Math.PI * 2;
        const r = radius - (i % 2 === 0 ? 0 : dip);
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        d += (i === 0 ? 'M' : 'L') + ` ${x.toFixed(2)} ${y.toFixed(2)} `;
      }
      return d + 'Z';
    }
    let s = '';
    s += `<path d="${ruffle(30, 6, 40)}" fill="${light}"/>`;
    s += `<path d="${ruffle(22, 5, 32)}" fill="${color}"/>`;
    s += `<path d="${ruffle(14, 4, 24)}" fill="${dark}"/>`;
    s += `<circle r="3" fill="${shade(color, -0.4)}"/>`;
    return s;
  },

  violet(color) {
    const dark = shade(color, -0.25);
    let s = '';
    // two top petals
    s += `<ellipse cx="-10" cy="-14" rx="10" ry="13" fill="${color}" transform="rotate(-18 -10 -14)"/>`;
    s += `<ellipse cx="10" cy="-14" rx="10" ry="13" fill="${color}" transform="rotate(18 10 -14)"/>`;
    // two side petals
    s += `<ellipse cx="-16" cy="4" rx="12" ry="11" fill="${color}"/>`;
    s += `<ellipse cx="16" cy="4" rx="12" ry="11" fill="${color}"/>`;
    // bottom petal, larger
    s += `<ellipse cx="0" cy="16" rx="14" ry="12" fill="${dark}"/>`;
    // yellow heart
    s += `<circle r="4" fill="#ffd54a"/>`;
    s += `<path d="M -1 -1 L 0 -4 L 1 -1 Z" fill="${shade('#ffd54a', -0.3)}"/>`;
    return s;
  },

  daffodil(color) {
    const trumpet = shade(color, -0.15);
    const trumpetDark = shade(color, -0.35);
    let s = '';
    s += ring(6, 0, () =>
      `<path d="M 0 -8 L -11 -26 L 0 -40 L 11 -26 Z" fill="${color}"/>`);
    // trumpet rim
    s += `<ellipse cx="0" cy="-2" rx="12" ry="10" fill="${trumpet}"/>`;
    s += `<ellipse cx="0" cy="0" rx="9" ry="7" fill="${trumpetDark}"/>`;
    // center stamens
    s += `<circle cx="-2" cy="-1" r="1.2" fill="#8a5a0a"/>`;
    s += `<circle cx="2" cy="-1" r="1.2" fill="#8a5a0a"/>`;
    s += `<circle cx="0" cy="1" r="1.2" fill="#8a5a0a"/>`;
    return s;
  },

  lily(color) {
    const dark = shade(color, -0.2);
    const stamen = shade(color, -0.5);
    let s = '';
    s += ring(6, 0, () => `
      <path d="M 0 0 Q -10 -18 -2 -44 Q 0 -48 2 -44 Q 10 -18 0 0 Z" fill="${color}"/>
      <path d="M 0 -4 Q 0 -22 0 -40" stroke="${dark}" stroke-width="0.8" fill="none"/>
    `);
    // stamens
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * 10;
      const y = Math.sin(a) * 10;
      s += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${stamen}" stroke-width="0.8"/>`;
      s += `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.8" fill="#c87432" transform="rotate(${(i/6)*360} ${x} ${y})"/>`;
    }
    s += `<circle r="2.5" fill="${stamen}"/>`;
    return s;
  },

  larkspur(color) {
    const dark = shade(color, -0.25);
    const light = shade(color, 0.12);
    const positions = [
      { y: -48, s: 0.55 },
      { y: -26, s: 0.75 },
      { y:  -4, s: 0.95 },
      { y:  18, s: 0.80 },
    ];
    let s = '';
    // stem spine
    s += `<line x1="0" y1="-60" x2="0" y2="30" stroke="#3d6b4a" stroke-width="1.5"/>`;
    positions.forEach(p => {
      const r = 10 * p.s;
      const offset = 3 * p.s;
      // 5 petals splayed
      const angles = [-90, -35, 35, 125, 215];
      angles.forEach((a, i) => {
        const rad = a * Math.PI / 180;
        const cx = Math.cos(rad) * offset;
        const cy = p.y + Math.sin(rad) * offset;
        const c = i === 0 ? light : color;
        s += `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${(r*0.55).toFixed(2)}" ry="${(r*0.4).toFixed(2)}" fill="${c}" transform="rotate(${a + 90} ${cx.toFixed(2)} ${cy.toFixed(2)})"/>`;
      });
      s += `<circle cx="0" cy="${p.y}" r="${(r * 0.22).toFixed(2)}" fill="${dark}"/>`;
    });
    return s;
  },

  gladiolus(color) {
    const dark = shade(color, -0.2);
    const light = shade(color, 0.18);
    const blooms = [
      { y: -50, s: 0.55 },
      { y: -22, s: 0.80 },
      { y:  10, s: 1.00 },
      { y:  36, s: 0.75 },
    ];
    let s = '';
    s += `<line x1="0" y1="-62" x2="0" y2="50" stroke="#3d6b4a" stroke-width="1.4"/>`;
    blooms.forEach(b => {
      const r = 20 * b.s;
      // ruffled trumpet
      s += `<path d="
        M ${-r} ${b.y}
        C ${-r*0.9} ${b.y - r*0.9}, ${-r*0.3} ${b.y - r*1.1}, 0 ${b.y - r*0.7}
        C ${r*0.3} ${b.y - r*1.1}, ${r*0.9} ${b.y - r*0.9}, ${r} ${b.y}
        C ${r*0.7} ${b.y + r*0.5}, ${-r*0.7} ${b.y + r*0.5}, ${-r} ${b.y} Z
      " fill="${color}"/>`;
      s += `<path d="
        M ${-r*0.6} ${b.y + 1}
        Q 0 ${b.y - r*0.4} ${r*0.6} ${b.y + 1}
        Q 0 ${b.y + r*0.3} ${-r*0.6} ${b.y + 1} Z
      " fill="${light}"/>`;
      s += `<ellipse cx="0" cy="${b.y}" rx="${r*0.18}" ry="${r*0.32}" fill="${dark}"/>`;
    });
    return s;
  },

  aster(color) {
    const dark = shade(color, -0.18);
    let s = '';
    s += ring(24, 0, () =>
      `<ellipse cx="0" cy="-22" rx="2.6" ry="18" fill="${color}"/>`);
    s += ring(16, 11.25, () =>
      `<ellipse cx="0" cy="-14" rx="2.2" ry="12" fill="${dark}"/>`);
    s += `<circle r="6" fill="#f4c430"/>`;
    s += `<circle r="3.5" fill="#b4831a"/>`;
    return s;
  },

  marigold(color) {
    const dark = shade(color, -0.25);
    const deeper = shade(color, -0.4);
    let s = '';
    s += ring(14, 0, () =>
      `<ellipse cx="0" cy="-24" rx="6" ry="9" fill="${color}"/>`);
    s += ring(12, 15, () =>
      `<ellipse cx="0" cy="-17" rx="5" ry="8" fill="${dark}"/>`);
    s += ring(10, 0, () =>
      `<ellipse cx="0" cy="-10" rx="4.5" ry="7" fill="${deeper}"/>`);
    s += ring(8, 22, () =>
      `<ellipse cx="0" cy="-5" rx="3.5" ry="5" fill="${dark}"/>`);
    s += `<circle r="4" fill="${deeper}"/>`;
    return s;
  },

  chrysanthemum(color) {
    const dark = shade(color, -0.2);
    const light = shade(color, 0.18);
    function curledPetal(len) {
      const w = 3.2;
      return `M 0 0 C ${-w} ${-len*0.3} ${-w*0.6} ${-len*0.75} ${-1.5} ${-len} C 0 ${-len*0.95} ${w*0.6} ${-len*0.75} ${w} ${-len*0.3} C ${w*0.4} ${-len*0.1} ${-w*0.4} ${-len*0.1} 0 0 Z`;
    }
    let s = '';
    s += ring(18, 0, () => `<path d="${curledPetal(36)}" fill="${color}"/>`);
    s += ring(14, 12, () => `<path d="${curledPetal(26)}" fill="${light}"/>`);
    s += ring(10, 0, () => `<path d="${curledPetal(16)}" fill="${dark}"/>`);
    s += `<circle r="4" fill="${shade(color, -0.35)}"/>`;
    return s;
  },

  poinsettia(color) {
    const dark = shade(color, -0.25);
    let s = '';
    // outer bracts
    s += ring(5, 0, () =>
      `<path d="M 0 0 L -14 -18 L -4 -32 L 0 -44 L 4 -32 L 14 -18 Z" fill="${color}"/>`);
    // inner bracts, offset rotation
    s += ring(5, 36, () =>
      `<path d="M 0 0 L -8 -12 L -2 -20 L 0 -28 L 2 -20 L 8 -12 Z" fill="${dark}"/>`);
    // leaf veins on outer bracts
    s += ring(5, 0, () =>
      `<line x1="0" y1="-4" x2="0" y2="-40" stroke="${shade(color, -0.4)}" stroke-width="0.8"/>`);
    // yellow cyathia cluster
    const cluster = [[0,0],[4,-2],[-4,-2],[2,3],[-2,3],[0,-5]];
    cluster.forEach(([x, y]) =>
      s += `<circle cx="${x}" cy="${y}" r="2" fill="#f5c400"/>`);
    return s;
  },
};

function renderFlower(type, color, x, y, scale) {
  const body = (FLOWERS[type] || FLOWERS.daisy)(color);
  return `<g transform="translate(${x} ${y}) scale(${scale})">${body}</g>`;
}

// ---------- Bouquet composition ----------

const CANVAS_W = 800;
const CANVAS_H = 900;
const BASE_X = CANVAS_W / 2;
const BASE_Y = 820;

function layoutFan(count) {
  const maxSpread = 55; // degrees each side, keeps flowers within canvas
  const spread = Math.min(maxSpread, 16 + count * 6);
  const angles = [];
  if (count === 1) {
    angles.push(0);
  } else {
    for (let i = 0; i < count; i++) {
      angles.push(-spread + (i / (count - 1)) * spread * 2);
    }
  }
  const radius = 380;
  return angles.map(deg => {
    const rad = (deg - 90) * Math.PI / 180;
    return {
      deg,
      x: BASE_X + Math.cos(rad) * radius,
      y: BASE_Y + Math.sin(rad) * radius,
    };
  });
}

function stemPath(toX, toY) {
  const cx1 = BASE_X + (toX - BASE_X) * 0.25;
  const cy1 = BASE_Y - 80;
  const cx2 = BASE_X + (toX - BASE_X) * 0.75;
  const cy2 = (BASE_Y + toY) / 2;
  return `M ${BASE_X} ${BASE_Y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY + 20}`;
}

function leafAlongStem(toX, toY, t, side) {
  // sample a point along the stem's approximate path
  const cx1 = BASE_X + (toX - BASE_X) * 0.25;
  const cy1 = BASE_Y - 80;
  const cx2 = BASE_X + (toX - BASE_X) * 0.75;
  const cy2 = (BASE_Y + toY) / 2;
  const u = 1 - t;
  const x = u*u*u*BASE_X + 3*u*u*t*cx1 + 3*u*t*t*cx2 + t*t*t*toX;
  const y = u*u*u*BASE_Y + 3*u*u*t*cy1 + 3*u*t*t*cy2 + t*t*t*(toY + 20);
  // tangent
  const tx = 3*u*u*(cx1-BASE_X) + 6*u*t*(cx2-cx1) + 3*t*t*(toX-cx2);
  const ty = 3*u*u*(cy1-BASE_Y) + 6*u*t*(cy2-cy1) + 3*t*t*((toY+20)-cy2);
  const angle = Math.atan2(ty, tx) * 180 / Math.PI + (side > 0 ? -45 : 45);
  return { x, y, angle };
}

function buildSvg() {
  const members = state.members;
  const positions = layoutFan(members.length);

  let content = '';

  // Stems
  members.forEach((_, i) => {
    const { x, y } = positions[i];
    content += `<path d="${stemPath(x, y)}" stroke="#3d6b4a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  });

  // Leaves
  members.forEach((_, i) => {
    const { x, y } = positions[i];
    const side = i % 2 === 0 ? 1 : -1;
    [0.35, 0.65].forEach((t, k) => {
      const leaf = leafAlongStem(x, y, t, side * (k % 2 === 0 ? 1 : -1));
      const size = k === 0 ? 22 : 16;
      content += `
        <g transform="translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})">
          <path d="M 0 0 Q ${size*0.6} ${-size*0.5} ${size*1.3} 0 Q ${size*0.6} ${size*0.5} 0 0 Z" fill="#6ea668"/>
          <path d="M 0 0 Q ${size*0.65} 0 ${size*1.3} 0" stroke="#3d6b4a" stroke-width="0.8" fill="none"/>
        </g>
      `;
    });
  });

  // Tie / ribbon at the base
  content += `
    <g transform="translate(${BASE_X} ${BASE_Y + 10})">
      <rect x="-36" y="-6" width="72" height="26" rx="4" fill="#c99c6e"/>
      <path d="M -36 -6 L 36 -6 L 34 20 L -34 20 Z" fill="none" stroke="${shade('#c99c6e', -0.2)}" stroke-width="1"/>
      <path d="M -36 6 Q -58 0 -60 -10 Q -44 -4 -36 2 Z" fill="#b1855a"/>
      <path d="M 36 6 Q 58 0 60 -10 Q 44 -4 36 2 Z" fill="#b1855a"/>
      <line x1="-36" y1="2" x2="36" y2="2" stroke="${shade('#c99c6e', -0.25)}" stroke-width="1"/>
    </g>
  `;

  // Flowers and name labels (flowers drawn last so they sit above stems)
  members.forEach((m, i) => {
    const { x, y } = positions[i];
    const def = MONTH_BY_NAME[m.month] || MONTHS[0];
    content += renderFlower(def.flower, m.color, x, y, 1.15);
  });

  members.forEach((m, i) => {
    const { x, y } = positions[i];
    content += `
      <text x="${x}" y="${y + 68}" text-anchor="middle"
            font-family="Georgia, serif" font-style="italic" font-size="20"
            fill="#3a3a3a">${escapeXml(m.name)}</text>
    `;
  });

  // Title
  content += `
    <text x="${BASE_X}" y="${BASE_Y + 70}" text-anchor="middle"
          font-family="Georgia, serif" font-size="34" font-weight="bold"
          fill="#2d5a47">${escapeXml(state.title || '')}</text>
  `;

  return `<svg xmlns="${SVG_NS}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" preserveAspectRatio="xMidYMid meet">${content}</svg>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---------- UI wiring ----------

const stage = document.getElementById('stage');
const membersEl = document.getElementById('members');
const memberTpl = document.getElementById('memberTemplate');
const titleInput = document.getElementById('gardenTitle');

function renderMembers() {
  membersEl.innerHTML = '';
  state.members.forEach((member, index) => {
    const node = memberTpl.content.firstElementChild.cloneNode(true);

    const nameInput = node.querySelector('.m-name');
    nameInput.value = member.name;
    nameInput.addEventListener('input', () => {
      state.members[index].name = nameInput.value;
      saveState();
      renderStage();
    });

    const monthSelect = node.querySelector('.m-month');
    MONTHS.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.name} — ${capitalize(m.flower)}`;
      monthSelect.appendChild(opt);
    });
    monthSelect.value = member.month;
    monthSelect.addEventListener('change', () => {
      state.members[index].month = monthSelect.value;
      state.members[index].color = MONTH_BY_NAME[monthSelect.value].color;
      saveState();
      renderMembers();
      renderStage();
    });

    const colorInput = node.querySelector('.m-color');
    colorInput.value = member.color;
    colorInput.addEventListener('input', () => {
      state.members[index].color = colorInput.value;
      saveState();
      renderStage();
    });

    const removeBtn = node.querySelector('.btn-remove');
    if (state.members.length <= 1) {
      removeBtn.disabled = true;
      removeBtn.style.opacity = '0.3';
      removeBtn.style.cursor = 'not-allowed';
    } else {
      removeBtn.addEventListener('click', () => {
        state.members.splice(index, 1);
        saveState();
        renderMembers();
        renderStage();
      });
    }

    membersEl.appendChild(node);
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderStage() {
  stage.innerHTML = buildSvg();
}

function addMember() {
  const month = MONTHS[Math.floor(Math.random() * MONTHS.length)];
  state.members.push({
    name: `Family Member ${state.members.length + 1}`,
    month: month.name,
    color: month.color,
  });
  saveState();
  renderMembers();
  renderStage();
}

function downloadSvg() {
  const svg = buildSvg();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), fileName('svg'));
}

function downloadPng() {
  const svg = buildSvg();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W * scale;
    canvas.height = CANVAS_H * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob(b => {
      triggerDownload(URL.createObjectURL(b), fileName('png'));
    }, 'image/png');
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert('Could not render PNG. Try downloading as SVG instead.');
  };
  img.src = url;
}

function fileName(ext) {
  const base = (state.title || 'garden').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  return `${base || 'garden'}.${ext}`;
}

function triggerDownload(href, name) {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---------- Persistence ----------

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.members) || parsed.members.length === 0) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

// ---------- Init ----------

if (new URLSearchParams(location.search).has('embed')) {
  document.body.classList.add('embed');
}

titleInput.value = state.title;
titleInput.addEventListener('input', () => {
  state.title = titleInput.value;
  saveState();
  renderStage();
});

document.getElementById('addMember').addEventListener('click', addMember);
document.getElementById('downloadPng').addEventListener('click', downloadPng);
document.getElementById('downloadSvg').addEventListener('click', downloadSvg);

renderMembers();
renderStage();
