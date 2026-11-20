// main.js — the Vice Cover Studio editor.
// Wires the canvas renderer (cover.js) to the controls in index.html:
// pick a panel, give it a photo (sample or your own upload), crop it with
// presets or by dragging, choose a layout and a grade, type a caption,
// export a PNG in one click. Everything runs locally — photos are read
// with FileReader and never leave the browser.

import { drawCover, GRADES, LAYOUTS, PRESETS, layoutRects } from './cover.js';
import { SAMPLE_SRC, applyShotParams, defaultState, positionForShot, readShotParams } from './shots.js';

const PREVIEW_W = 960;
const PREVIEW_H = 540;

const EXPORT_SIZES = [
  { label: '1080 × 1080', w: 1080, h: 1080 },
  { label: '1080 × 1350', w: 1080, h: 1350 },
  { label: '1920 × 1080', w: 1920, h: 1080 },
];

const params = readShotParams();
const shotMode = params.mode === 'cover' ? 'cover' : params.mode === 'editor' ? 'editor' : '';
const state = defaultState();
if (shotMode) applyShotParams(state, params);

const images = new Map(); // src key -> loaded HTMLImageElement
let selected = 0;
let dragging = null;

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

function loadPhoto(src) {
  if (images.has(src)) return Promise.resolve(images.get(src));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      images.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = SAMPLE_SRC[src] || src;
  });
}

function stateImages() {
  const out = {};
  for (const [key, img] of images) out[key] = img;
  return out;
}

function visiblePanels() {
  return layoutRects(state.layout, PREVIEW_W, PREVIEW_H).length;
}

function render() {
  if (shotMode === 'cover') {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCover(ctx, canvas.width, canvas.height, state, stateImages(), {});
  } else {
    canvas.width = PREVIEW_W;
    canvas.height = PREVIEW_H;
    drawCover(ctx, PREVIEW_W, PREVIEW_H, state, stateImages(), { editor: true, selected });
  }
}

async function renderWhenReady() {
  const needed = new Set(state.panels.map((p) => p.src));
  await Promise.all([...needed].map((s) => loadPhoto(s).catch(() => null)));
  render();
}

// ---- controls -------------------------------------------------------------

function buildButtons(el, items, current, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (item.id === current ? ' active' : '');
    b.textContent = item.name;
    b.addEventListener('click', () => {
      onPick(item.id);
      buildButtons(el, items, item.id, onPick);
      render();
    });
    el.appendChild(b);
  }
}

function syncCropControls() {
  const panel = state.panels[selected];
  if (!panel) return;
  document.getElementById('zoom').value = panel.zoom;
  document.getElementById('panx').value = panel.ox;
  document.getElementById('pany').value = panel.oy;
  document.getElementById('zoomVal').textContent = `${panel.zoom.toFixed(2)}×`;
  document.getElementById('panxVal').textContent = panel.ox.toFixed(2);
  document.getElementById('panyVal').textContent = panel.oy.toFixed(2);
}

function selectPanel(i) {
  selected = Math.max(0, Math.min(i, visiblePanels() - 1));
  document.querySelectorAll('#panelTabs .chip').forEach((b, j) => {
    b.classList.toggle('active', j === selected);
  });
  syncCropControls();
  render();
}

function buildPanelTabs() {
  const tabs = document.getElementById('panelTabs');
  tabs.innerHTML = '';
  for (let i = 0; i < visiblePanels(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (i === selected ? ' active' : '');
    b.textContent = `Panel ${i + 1}`;
    b.addEventListener('click', () => selectPanel(i));
    tabs.appendChild(b);
  }
}

// Layout + grade pickers.
buildButtons(document.getElementById('layoutBtns'), LAYOUTS, state.layout, (id) => {
  state.layout = id;
  if (selected >= visiblePanels()) selected = 0;
  buildPanelTabs();
  selectPanel(selected);
});
buildButtons(document.getElementById('gradeBtns'), GRADES, state.grade, (id) => {
  state.grade = id;
});

// Crop presets for the selected panel.
buildButtons(
  document.getElementById('presetBtns'),
  Object.entries(PRESETS).map(([id, p]) => ({ id, name: p.name })),
  '',
  (id) => {
    const panel = state.panels[selected];
    if (!panel) return;
    Object.assign(panel, PRESETS[id]);
    syncCropControls();
    render();
  },
);

// Sliders: zoom 1–2.2, pan ±0.9 — wide enough to pull a face into a 2:1 panel.
document.getElementById('zoom').addEventListener('input', (e) => {
  state.panels[selected].zoom = parseFloat(e.target.value);
  syncCropControls();
  render();
});
document.getElementById('panx').addEventListener('input', (e) => {
  state.panels[selected].ox = parseFloat(e.target.value);
  syncCropControls();
  render();
});
document.getElementById('pany').addEventListener('input', (e) => {
  state.panels[selected].oy = parseFloat(e.target.value);
  syncCropControls();
  render();
});

// Caption.
const captionInput = document.getElementById('caption');
captionInput.value = state.title;
captionInput.addEventListener('input', () => {
  state.title = captionInput.value.toUpperCase() || 'SUNSET HEIST';
  render();
});

// Photo sources for the selected panel.
document.getElementById('usePier').addEventListener('click', async () => {
  state.panels[selected].src = 'pier';
  await renderWhenReady();
});
document.getElementById('useBoulevard').addEventListener('click', async () => {
  state.panels[selected].src = 'boulevard';
  await renderWhenReady();
});
const fileInput = document.getElementById('upload');
document.getElementById('uploadBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const key = String(reader.result);
    state.panels[selected].src = key;
    await loadPhoto(key).catch(() => null);
    render();
  };
  reader.readAsDataURL(file);
});

// Click a panel to select it; drag it to pan the photo inside the frame.
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  if (shotMode === 'cover') return;
  const p = canvasPoint(e);
  const rects = layoutRects(state.layout, canvas.width, canvas.height);
  const hit = rects.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
  if (hit >= 0) {
    selectPanel(hit);
    dragging = { x: p.x, y: p.y, ox: state.panels[hit].ox, oy: state.panels[hit].oy };
    canvas.setPointerCapture(e.pointerId);
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const panel = state.panels[selected];
  const rect = layoutRects(state.layout, canvas.width, canvas.height)[selected];
  const img = images.get(panel.src);
  if (!img || !rect) return;
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * panel.zoom;
  const slackX = Math.max(0, (img.naturalWidth * scale - rect.w) / 2);
  const slackY = Math.max(0, (img.naturalHeight * scale - rect.h) / 2);
  if (slackX > 0) panel.ox = Math.max(-0.9, Math.min(0.9, dragging.ox + (p.x - dragging.x) / slackX));
  if (slackY > 0) panel.oy = Math.max(-0.9, Math.min(0.9, dragging.oy + (p.y - dragging.y) / slackY));
  syncCropControls();
  render();
});
canvas.addEventListener('pointerup', () => {
  dragging = null;
});

// Export: one click renders the cover at full size (no editor frame) and
// downloads the PNG straight away.
function exportPng(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off.getContext('2d'), size.w, size.h, state, stateImages(), {});
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

const exportRow = document.getElementById('exportBtns');
for (const size of EXPORT_SIZES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip export-btn';
  b.textContent = size.label;
  b.addEventListener('click', () => exportPng(size));
  exportRow.appendChild(b);
}

// ---- boot -----------------------------------------------------------------

buildPanelTabs();
selectPanel(0);
if (shotMode === 'cover') {
  document.body.classList.add('shot-cover');
  window.addEventListener('resize', render);
}
renderWhenReady().then(() => {
  if (shotMode) positionForShot(shotMode);
});
