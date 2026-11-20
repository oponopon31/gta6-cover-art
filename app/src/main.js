// Vice Cover Studio — page wiring, round 4.
// State, controls, undo/redo, export in 3 sizes, and the ?shot= fixed scenes.
import { drawCover, GRADES, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const taglineInput = document.getElementById('tagline');
const status = document.getElementById('status');
const photoInput = document.getElementById('photo');
const layoutRow = document.getElementById('layouts');
const gradeRow = document.getElementById('grades');
const presetRow = document.getElementById('presets');
const panX = document.getElementById('panx');
const panY = document.getElementById('pany');
const zoom = document.getElementById('zoom');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');

const SIZES = [
  { id: 'square', label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 × 1080', w: 1920, h: 1080 },
];

let photo = null;
let photoName = 'boulevard';
let state = freshState();
let history = [];
let future = [];

function freshState() {
  return {
    caption: 'Sunset Heist',
    tagline: 'EVERY LEGEND HAS A PRICE',
    layout: 'hero6',
    grade: 'sunset',
    size: 'square',
    selected: 0,
    crops: {},
  };
}

function snapshot() {
  return JSON.parse(JSON.stringify(state));
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
  refreshUndo();
}

function refreshUndo() {
  undoBtn.disabled = history.length === 0;
  redoBtn.disabled = future.length === 0;
}

function applyState(next) {
  state = next;
  syncControls();
  redraw();
}

function redraw() {
  drawCover(canvas, photo, {
    caption: state.caption,
    tagline: state.tagline,
    layout: state.layout,
    grade: state.grade,
    photoName,
    crops: state.crops,
    mode: 'editor',
    selected: state.selected,
  });
}

function syncControls() {
  captionInput.value = state.caption;
  taglineInput.value = state.tagline;
  layoutRow.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
    b.setAttribute('aria-pressed', b.dataset.layout === state.layout ? 'true' : 'false');
  });
  gradeRow.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
    b.setAttribute('aria-pressed', b.dataset.grade === state.grade ? 'true' : 'false');
  });
  document.querySelectorAll('#sizes button').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
  const sel = state.crops[state.selected] || {};
  panX.value = sel.panX ?? 0;
  panY.value = sel.panY ?? 0;
  zoom.value = sel.zoom ?? 1;
}

function setCrop(partial) {
  const i = state.selected;
  state.crops[i] = { ...(state.crops[i] || {}), ...partial };
}

function setSize(id) {
  const s = SIZES.find((x) => x.id === id) || SIZES[0];
  state.size = s.id;
  canvas.width = s.w;
  canvas.height = s.h;
  redraw();
}

function buildButtons() {
  LAYOUTS.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = l.id;
    b.textContent = l.name;
    b.addEventListener('click', () => {
      if (state.layout === l.id) return;
      pushHistory();
      state.layout = l.id;
      state.selected = 0;
      state.crops = {};
      syncControls();
      redraw();
    });
    layoutRow.appendChild(b);
  });
  Object.entries(GRADES).forEach(([id, g]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = id;
    b.textContent = g.name;
    b.addEventListener('click', () => {
      if (state.grade === id) return;
      pushHistory();
      state.grade = id;
      syncControls();
      redraw();
    });
    gradeRow.appendChild(b);
  });
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.size = s.id;
    b.textContent = s.label;
    b.addEventListener('click', () => {
      if (state.size === s.id) return;
      pushHistory();
      setSize(s.id);
      syncControls();
    });
    document.getElementById('sizes').appendChild(b);
  });
  [['Face', 'face'], ['Detail', 'detail'], ['Wide', 'wide'], ['Sky', 'sky']].forEach(([label, key]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', () => {
      pushHistory();
      setCrop({ crop: key, panX: 0, panY: 0, zoom: 1 });
      redraw();
    });
    presetRow.appendChild(b);
  });
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function exportPng(sizeId) {
  const s = SIZES.find((x) => x.id === sizeId) || SIZES[0];
  const off = document.createElement('canvas');
  off.width = s.w;
  off.height = s.h;
  drawCover(off, photo, {
    caption: state.caption,
    tagline: state.tagline,
    layout: state.layout,
    grade: state.grade,
    photoName,
    crops: state.crops,
    mode: 'cover',
    selected: -1,
  });
  off.toBlob((blob) => {
    if (!blob) { status.textContent = 'Export failed — try again.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${s.w}x${s.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved cover-${s.w}x${s.h}.png`;
  }, 'image/png');
}

photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  photo = await loadImage(URL.createObjectURL(file));
  photoName = file.name.includes('pier') ? 'pier' : 'boulevard';
  pushHistory();
  state.crops = {};
  state.selected = 0;
  syncControls();
  redraw();
});
captionInput.addEventListener('input', () => { state.caption = captionInput.value; redraw(); });
captionInput.addEventListener('change', () => { pushHistory(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
taglineInput.addEventListener('change', () => { pushHistory(); });
panX.addEventListener('input', () => { setCrop({ panX: Number(panX.value) }); redraw(); });
panY.addEventListener('input', () => { setCrop({ panY: Number(panY.value) }); redraw(); });
zoom.addEventListener('input', () => { setCrop({ zoom: Number(zoom.value) }); redraw(); });
[panX, panY, zoom].forEach((el) => el.addEventListener('change', () => pushHistory()));
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const mx = ((e.clientX - r.left) / r.width) * canvas.width;
  const my = ((e.clientY - r.top) / r.height) * canvas.height;
  const zone = { x: canvas.width * 0.03, y: canvas.height * 0.03, w: canvas.width * 0.94, h: canvas.height * 0.57 };
  const layout = LAYOUTS.find((l) => l.id === state.layout) || LAYOUTS[0];
  const hit = layout.panels.findIndex((p) => {
    const px = zone.x + p.x * zone.w, py = zone.y + p.y * zone.h;
    return mx >= px && mx <= px + p.w * zone.w && my >= py && my <= py + p.h * zone.h;
  });
  if (hit >= 0 && hit !== state.selected) {
    state.selected = hit;
    syncControls();
    redraw();
  }
});
undoBtn.addEventListener('click', () => {
  if (!history.length) return;
  future.push(snapshot());
  applyState(history.pop());
  refreshUndo();
});
redoBtn.addEventListener('click', () => {
  if (!future.length) return;
  history.push(snapshot());
  applyState(future.pop());
  refreshUndo();
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    e.preventDefault();
    undoBtn.click();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
    e.preventDefault();
    redoBtn.click();
  }
});
document.getElementById('export-square').addEventListener('click', () => exportPng('square'));
document.getElementById('export-portrait').addEventListener('click', () => exportPng('portrait'));
document.getElementById('export-wide').addEventListener('click', () => exportPng('wide'));

buildButtons();
setSize('square');
syncControls();
refreshUndo();

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, async (sample, opts) => {
    photoName = sample.includes('pier') ? 'pier' : 'boulevard';
    photo = await loadImage(sample);
    state = { ...freshState(), ...opts };
    setSize(state.size || 'square');
    syncControls();
    redraw();
  });
} else {
  loadImage('samples/boulevard.jpg').then((img) => { photo = img; redraw(); }).catch(() => redraw());
  redraw();
}
