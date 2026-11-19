// Vice Cover Studio — the editor. Wires the page: photos from the machine (FileReader,
// never uploaded), per-panel crop and position, layout and colour-grade pickers, an
// editable caption, a live preview and one-click PNG export in three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, hitPanel, LAYOUTS, GRADES, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const thumbs = document.getElementById('thumbs');
const panelLabel = document.getElementById('panel-label');

/** The whole editor state: photos are loaded Images, panels are per-layout so
 *  switching layouts keeps each layout's arrangement. */
const state = {
  photos: [],
  photoNames: [],
  layout: 'hero-duo',
  grade: 'sunset',
  size: '1920x1080',
  title: 'Sunset Heist',
  subtitle: 'One last score',
  selectedPanel: 0,
  panelsByLayout: {},
};

function defaultPanels(layoutId) {
  const count = LAYOUTS[layoutId].panels.length;
  const panels = [];
  for (let i = 0; i < count; i++) {
    panels.push({ photo: i === 0 ? 0 : 1, zoom: 1, ox: 0, oy: 0 });
  }
  return panels;
}

/** The panels of the current layout, creating defaults on first use. */
export function currentPanels() {
  if (!state.panelsByLayout[state.layout]) {
    state.panelsByLayout[state.layout] = defaultPanels(state.layout);
  }
  return state.panelsByLayout[state.layout];
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Adds a loaded image as a photo, fixes panel indexes that pointed past it, and refreshes. */
export function addPhoto(img, name) {
  state.photos.push(img);
  state.photoNames.push(name);
  for (const panels of Object.values(state.panelsByLayout)) {
    for (const panel of panels) {
      if (panel.photo >= state.photos.length) panel.photo = state.photos.length - 1;
    }
  }
  renderThumbs();
  redraw();
}

async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  addPhoto(img, name);
}

function renderThumbs() {
  thumbs.innerHTML = '';
  state.photos.forEach((img, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(currentPanels()[state.selectedPanel]?.photo === i));
    button.title = state.photoNames[i] || `Photo ${i + 1}`;
    const thumb = document.createElement('img');
    thumb.src = img.src;
    thumb.alt = button.title;
    button.appendChild(thumb);
    button.addEventListener('click', () => {
      currentPanels()[state.selectedPanel].photo = i;
      renderThumbs();
      redraw();
    });
    thumbs.appendChild(button);
  });
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add';
  add.textContent = '+';
  add.title = 'Add more photos';
  add.addEventListener('click', () => document.getElementById('photo').click());
  thumbs.appendChild(add);
}

/** Sizes the preview canvas to the chosen export aspect and redraws the cover. */
export function redraw() {
  const size = SIZES[state.size];
  const maxSide = 960;
  const scale = Math.min(maxSide / size.w, maxSide / size.h, 1);
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  drawCover(canvas, {
    photos: state.photos,
    panels: currentPanels(),
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
  });
  syncPanelControls();
}

function buildPicker(container, entries, current, onPick) {
  container.innerHTML = '';
  for (const [id, entry] of Object.entries(entries)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = entry.name;
    button.setAttribute('aria-pressed', String(id === current));
    button.addEventListener('click', () => {
      onPick(id);
      buildPicker(container, entries, id, onPick);
      redraw();
    });
    container.appendChild(button);
  }
}

buildPicker(document.getElementById('layouts'), LAYOUTS, state.layout, (id) => {
  state.layout = id;
  state.selectedPanel = 0;
  renderThumbs();
});
buildPicker(document.getElementById('grades'), GRADES, state.grade, (id) => {
  state.grade = id;
});

/** Copies the selected panel's zoom and pan into the sliders and the panel label. */
export function syncPanelControls() {
  const panels = currentPanels();
  const panel = panels[state.selectedPanel] ?? panels[0];
  const count = panels.length;
  panelLabel.textContent = `Panel ${state.selectedPanel + 1} of ${count} — photo “${state.photoNames[panel.photo] ?? 'none'}”`;
  const zoom = document.getElementById('zoom');
  const panX = document.getElementById('pan-x');
  const panY = document.getElementById('pan-y');
  zoom.value = panel.zoom;
  panX.value = panel.ox;
  panY.value = panel.oy;
  document.getElementById('zoom-out').textContent = `${panel.zoom.toFixed(2)}×`;
  document.getElementById('pan-x-out').textContent = panel.ox.toFixed(2);
  document.getElementById('pan-y-out').textContent = panel.oy.toFixed(2);
}

function bindSlider(id, apply) {
  document.getElementById(id).addEventListener('input', (e) => {
    apply(Number(e.target.value));
    redraw();
  });
}
bindSlider('zoom', (v) => { currentPanels()[state.selectedPanel].zoom = v; });
bindSlider('pan-x', (v) => { currentPanels()[state.selectedPanel].ox = v; });
bindSlider('pan-y', (v) => { currentPanels()[state.selectedPanel].oy = v; });

document.getElementById('center-photo').addEventListener('click', () => {
  const panel = currentPanels()[state.selectedPanel];
  panel.zoom = 1;
  panel.ox = 0;
  panel.oy = 0;
  redraw();
});
document.getElementById('cycle-photo').addEventListener('click', () => {
  const panel = currentPanels()[state.selectedPanel];
  if (state.photos.length > 1) {
    panel.photo = (panel.photo + 1) % state.photos.length;
    renderThumbs();
    redraw();
  }
});
document.getElementById('use-everywhere').addEventListener('click', () => {
  const photo = currentPanels()[state.selectedPanel].photo;
  for (const panel of currentPanels()) panel.photo = photo;
  renderThumbs();
  redraw();
});
document.getElementById('try-samples').addEventListener('click', async () => {
  await loadSample('pier');
  await loadSample('boulevard');
  status.textContent = 'Samples loaded — replace them with your own photos any time.';
});

document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      addPhoto(await loadImage(url), file.name);
    } catch {
      status.textContent = `Could not read ${file.name}.`;
    }
  }
  if (files.length) status.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} loaded — kept on this machine.`;
  e.target.value = '';
});
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

/** Renders the cover at full export size and returns its PNG as a data URL. */
export async function exportPng(sizeId) {
  const size = SIZES[sizeId];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, {
    photos: state.photos,
    panels: currentPanels(),
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
  });
  const blob = await new Promise((resolve) => off.toBlob(resolve, 'image/png'));
  return { blob, name: `vice-cover-${size.w}x${size.h}.png` };
}

function wireExport(buttonId, sizeId) {
  document.getElementById(buttonId).addEventListener('click', async () => {
    state.size = sizeId;
    redraw();
    const { blob, name } = await exportPng(sizeId);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
    status.textContent = `Saved ${name} (${(blob.size / 1024).toFixed(0)} KiB).`;
  });
}
wireExport('export-square', '1080x1080');
wireExport('export-portrait', '1080x1350');
wireExport('export-wide', '1920x1080');

// Drag to pan the selected panel's photo, scroll to zoom it, click to select a panel.
let dragging = null;
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  };
}
canvas.addEventListener('pointerdown', (e) => {
  const { x, y } = canvasPoint(e);
  const hit = hitPanel(state.layout, x, y, canvas.width, canvas.height);
  if (hit >= 0) {
    state.selectedPanel = hit;
    renderThumbs();
    const panel = currentPanels()[hit];
    dragging = { x, y, ox: panel.ox, oy: panel.oy };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const { x, y } = canvasPoint(e);
  const rect = LAYOUTS[state.layout].panels[state.selectedPanel];
  const panel = currentPanels()[state.selectedPanel];
  panel.ox = Math.max(-0.5, Math.min(0.5, dragging.ox + (x - dragging.x) / (rect.w * canvas.width)));
  panel.oy = Math.max(-0.5, Math.min(0.5, dragging.oy + (y - dragging.y) / (rect.h * canvas.height)));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const panel = currentPanels()[state.selectedPanel];
  panel.zoom = Math.max(1, Math.min(3.5, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });

// Small handle the screenshot scenes and the verification pass use: apply a whole
// scene at once and export the cover as a data URL without a download.
window.__viceCover = {
  state,
  async applyScene(scene) {
    if (scene.title !== undefined) { state.title = scene.title; titleInput.value = scene.title; }
    if (scene.subtitle !== undefined) { state.subtitle = scene.subtitle; subtitleInput.value = scene.subtitle; }
    if (scene.layout) state.layout = scene.layout;
    if (scene.grade) state.grade = scene.grade;
    if (scene.size) state.size = scene.size;
    if (scene.selectedPanel !== undefined) state.selectedPanel = scene.selectedPanel;
    if (scene.photos) {
      for (const name of scene.photos) {
        if (!state.photoNames.includes(name)) await loadSample(name);
      }
      if (scene.photoMap) {
        const panels = currentPanels();
        scene.photoMap.forEach((photoName, i) => {
          const idx = state.photoNames.indexOf(photoName);
          if (idx >= 0 && panels[i]) panels[i].photo = idx;
        });
      }
    }
    buildPicker(document.getElementById('layouts'), LAYOUTS, state.layout, (id) => {
      state.layout = id;
      state.selectedPanel = 0;
      renderThumbs();
    });
    buildPicker(document.getElementById('grades'), GRADES, state.grade, (id) => { state.grade = id; });
    renderThumbs();
    redraw();
  },
  async exportDataURL(sizeId) {
    const { blob } = await exportPng(sizeId);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  },
};

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, window.__viceCover);
} else {
  loadSample('pier')
    .then(() => loadSample('boulevard'))
    .catch(() => {})
    .finally(() => redraw());
  redraw();
}
