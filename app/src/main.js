// Vice Cover Studio — the editor. Wires the page: pick a layout and grade, crop and
// position each panel (click to select, drag to pan, sliders and Face/Detail/Wide
// presets), upload photos (FileReader, local, never uploaded), toggle the poster
// extras (seal, callouts, billing), undo/redo, and export the cover as a PNG in
// 1080 x 1080, 1080 x 1350 or 1920 x 1080. A `?shot=` query sets up a fixed scene
// for a screenshot instead (./shots.js).
import { drawCover, panelRects, LAYOUTS, GRADES, CROPS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const statusEl = document.getElementById('status');
const images = {};
let photoReady = null;

const state = {
  layout: 'vice',
  grade: 'sunset',
  caption: 'Sunset Heist',
  panels: [],
  selected: 0,
  editor: true,
  showSeal: true,
  showCallouts: true,
  showBilling: true,
};

const history = [];
let historyAt = -1;

function snapshot() {
  return JSON.parse(JSON.stringify({
    layout: state.layout, grade: state.grade, caption: state.caption,
    panels: state.panels, selected: state.selected,
    showSeal: state.showSeal, showCallouts: state.showCallouts, showBilling: state.showBilling,
  }));
}

function pushHistory() {
  history.length = historyAt + 1;
  history.push(snapshot());
  if (history.length > 40) history.shift();
  historyAt = history.length - 1;
  refreshUndoButtons();
}

function applySnapshot(s) {
  Object.assign(state, JSON.parse(JSON.stringify(s)));
  syncControls();
  redraw();
}

function undo() {
  if (historyAt <= 0) return;
  historyAt -= 1;
  applySnapshot(history[historyAt]);
  refreshUndoButtons();
}

function redo() {
  if (historyAt >= history.length - 1) return;
  historyAt += 1;
  applySnapshot(history[historyAt]);
  refreshUndoButtons();
}

function refreshUndoButtons() {
  const u = document.getElementById('undo');
  const r = document.getElementById('redo');
  if (u) u.disabled = historyAt <= 0;
  if (r) r.disabled = historyAt >= history.length - 1;
}

function defaultPanels(layoutKey) {
  const layout = LAYOUTS[layoutKey] ?? LAYOUTS.vice;
  return layout.panels.map((p) => ({ ...CROPS[p.crop] }));
}

function redraw() {
  drawCover(canvas, state, images);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSamples() {
  const [boulevard, pier] = await Promise.all([
    loadImage('samples/boulevard.jpg'),
    loadImage('samples/pier.jpg'),
  ]);
  images.boulevard = boulevard;
  images.pier = pier;
}

function selectedPanel() {
  return state.panels[state.selected] ?? state.panels[0];
}

function setPanel(updates, record = true) {
  const p = selectedPanel();
  if (!p) return;
  Object.assign(p, updates);
  if (record) pushHistory();
  syncControls();
  redraw();
}

function applyCropPreset(name) {
  const preset = CROPS[name];
  if (!preset) return;
  setPanel({ photo: preset.photo, zoom: preset.zoom, ox: preset.ox, oy: preset.oy });
  statusEl.textContent = `Crop preset ${name} applied to panel ${state.selected + 1}`;
}

// --- control sync -----------------------------------------------------------
function syncControls() {
  captionInput.value = state.caption;
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  document.querySelectorAll('[data-photo]').forEach((b) => {
    b.classList.toggle('active', b.dataset.photo === (selectedPanel()?.photo ?? ''));
  });
  const p = selectedPanel();
  if (p) {
    const z = document.getElementById('zoom');
    const px = document.getElementById('panx');
    const py = document.getElementById('pany');
    if (z) z.value = p.zoom;
    if (px) px.value = p.ox;
    if (py) py.value = p.oy;
    const zv = document.getElementById('zoomv');
    if (zv) zv.textContent = `${p.zoom.toFixed(2)}×`;
  }
  const seal = document.getElementById('toggle-seal');
  const calls = document.getElementById('toggle-callouts');
  const bill = document.getElementById('toggle-billing');
  if (seal) seal.checked = state.showSeal !== false;
  if (calls) calls.checked = state.showCallouts !== false;
  if (bill) bill.checked = state.showBilling !== false;
  const sel = document.getElementById('selpanel');
  if (sel) sel.textContent = `Panel ${state.selected + 1} of ${state.panels.length}`;
}

function buildLayoutButtons() {
  const wrap = document.getElementById('layouts');
  if (!wrap) return;
  Object.entries(LAYOUTS).forEach(([key, layout]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = key;
    b.textContent = layout.name;
    b.addEventListener('click', () => {
      state.layout = key;
      state.panels = defaultPanels(key);
      state.selected = 0;
      pushHistory();
      syncControls();
      redraw();
    });
    wrap.appendChild(b);
  });
}

function buildGradeButtons() {
  const wrap = document.getElementById('grades');
  if (!wrap) return;
  Object.entries(GRADES).forEach(([key, grade]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = key;
    b.textContent = grade.name;
    b.style.background = `linear-gradient(135deg, ${grade.sky[0]}, ${grade.sky[1]})`;
    b.addEventListener('click', () => {
      state.grade = key;
      pushHistory();
      syncControls();
      redraw();
    });
    wrap.appendChild(b);
  });
}

// --- canvas picking and dragging --------------------------------------------
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

function pickPanel(pt) {
  const rects = panelRects(state, canvas.width, canvas.height);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) return i;
  }
  return -1;
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const pt = canvasPoint(e);
  const i = pickPanel(pt);
  if (i >= 0 && i !== state.selected) {
    state.selected = i;
    syncControls();
    redraw();
  }
  if (i >= 0) {
    drag = { x: pt.x, y: pt.y, ox: selectedPanel().ox, oy: selectedPanel().oy };
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const pt = canvasPoint(e);
  const rects = panelRects(state, canvas.width, canvas.height);
  const r = rects[state.selected];
  if (!r) return;
  const dx = (pt.x - drag.x) / Math.max(1, r.w);
  const dy = (pt.y - drag.y) / Math.max(1, r.h);
  const p = selectedPanel();
  p.ox = Math.max(-0.9, Math.min(0.9, drag.ox + dx * 2));
  p.oy = Math.max(-0.9, Math.min(0.9, drag.oy + dy * 2));
  syncControls();
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (drag) { drag = null; pushHistory(); }
});

// --- export -----------------------------------------------------------------
function exportCover(w, h, name) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const shot = { ...state, editor: false };
  drawCover(off, shot, images);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    statusEl.textContent = `Saved ${name}`;
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

// --- wire the controls ------------------------------------------------------
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value;
  redraw();
});
captionInput.addEventListener('change', () => pushHistory());

document.querySelectorAll('[data-photo]').forEach((b) => {
  b.addEventListener('click', () => setPanel({ photo: b.dataset.photo }));
});
document.getElementById('upload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
  const img = await loadImage(dataUrl);
  images[`upload-${state.selected}`] = img;
  setPanel({ photo: `upload-${state.selected}` });
  statusEl.textContent = `Photo loaded into panel ${state.selected + 1} (kept on this machine)`;
});

const zoomEl = document.getElementById('zoom');
if (zoomEl) zoomEl.addEventListener('input', () => setPanel({ zoom: Number(zoomEl.value) }, false));
if (zoomEl) zoomEl.addEventListener('change', () => pushHistory());
const panxEl = document.getElementById('panx');
if (panxEl) panxEl.addEventListener('input', () => setPanel({ ox: Number(panxEl.value) }, false));
if (panxEl) panxEl.addEventListener('change', () => pushHistory());
const panyEl = document.getElementById('pany');
if (panyEl) panyEl.addEventListener('input', () => setPanel({ oy: Number(panyEl.value) }, false));
if (panyEl) panyEl.addEventListener('change', () => pushHistory());

document.querySelectorAll('[data-crop]').forEach((b) => {
  b.addEventListener('click', () => applyCropPreset(b.dataset.crop));
});

const sealEl = document.getElementById('toggle-seal');
if (sealEl) sealEl.addEventListener('change', () => { state.showSeal = sealEl.checked; pushHistory(); redraw(); });
const callsEl = document.getElementById('toggle-callouts');
if (callsEl) callsEl.addEventListener('change', () => { state.showCallouts = callsEl.checked; pushHistory(); redraw(); });
const billEl = document.getElementById('toggle-billing');
if (billEl) billEl.addEventListener('change', () => { state.showBilling = billEl.checked; pushHistory(); redraw(); });

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
    e.preventDefault(); redo();
  }
});

document.querySelectorAll('[data-export]').forEach((b) => {
  b.addEventListener('click', () => {
    const [w, h] = b.dataset.export.split('x').map(Number);
    exportCover(w, h, `cover-${w}x${h}.png`);
  });
});

// --- boot -------------------------------------------------------------------
state.panels = defaultPanels(state.layout);
buildLayoutButtons();
buildGradeButtons();
syncControls();
photoReady = loadSamples().then(() => {
  redraw();
  pushHistory();
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (sample, text, layout, grade) => {
    await photoReady;
    if (layout && LAYOUTS[layout]) {
      state.layout = layout;
      state.panels = defaultPanels(layout);
      state.selected = 0;
    }
    if (grade && GRADES[grade]) state.grade = grade;
    // The shot's photo only names the sample set; each panel keeps its own
    // layout-default crop, so no two panels show the same photo the same way.
    state.caption = text;
    if (shot === 'cover') {
      state.editor = false;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    syncControls();
    redraw();
  });
} else {
  redraw();
}
