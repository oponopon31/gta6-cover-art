// Vice Cover Studio — the cover renderer. Draws a cinema-poster GTA-style cover:
// a sunset sky with sun glow, a skyline and palm silhouettes, a multi-panel photo
// grid (9 layouts), a huge gradient title with a halftone band, a film billing
// block, a circular LEONIDA seal, annotation callouts, grain and a vignette.
// All geometry is normalised (0..1) so one drawing works at any export size.

export const GRADES = {
  sunset: {
    name: 'Sunset', sky: ['#ff9a3c', '#ff5e62', '#7b2d8b'], sun: '#ffd166',
    title: ['#fff3b0', '#ff8c42'], tint: 'rgba(255,110,60,0.18)', accent: '#ffd166',
  },
  neon: {
    name: 'Neon', sky: ['#ff2e88', '#7b2ff7', '#0d1b4c'], sun: '#ff5ea8',
    title: ['#f8ff6b', '#ff2e88'], tint: 'rgba(255,46,136,0.16)', accent: '#39d5ff',
  },
  vice: {
    name: 'Vice', sky: ['#b537f2', '#6a1fb5', '#1c0b2e'], sun: '#ff9de2',
    title: ['#ffe259', '#ff7e5f'], tint: 'rgba(181,55,242,0.16)', accent: '#ff9de2',
  },
  golden: {
    name: 'Golden', sky: ['#ffc93c', '#ff8c42', '#8b3a2d'], sun: '#fff3b0',
    title: ['#fff8dc', '#ffb347'], tint: 'rgba(255,180,60,0.16)', accent: '#fff3b0',
  },
  dusk: {
    name: 'Dusk', sky: ['#3b2d8f', '#1b2a6b', '#0b1026'], sun: '#ff8c42',
    title: ['#ffd166', '#ff6b35'], tint: 'rgba(59,45,143,0.20)', accent: '#ff8c42',
  },
};

// Crop presets: zoom and pan offsets (ox/oy in -0.9..0.9) for a photo in a panel.
export const CROPS = {
  face: { photo: 'boulevard', zoom: 1.15, ox: 0, oy: 0.7 },
  detail: { photo: 'boulevard', zoom: 1.9, ox: -0.3, oy: 0.2 },
  wide: { photo: 'pier', zoom: 1.0, ox: 0, oy: 0 },
  pierdetail: { photo: 'pier', zoom: 1.6, ox: 0.4, oy: -0.3 },
  face2: { photo: 'pier', zoom: 1.3, ox: -0.2, oy: 0.5 },
  dock: { photo: 'pier', zoom: 1.8, ox: -0.4, oy: 0.4 },
  sky: { photo: 'boulevard', zoom: 1.4, ox: 0.4, oy: -0.6 },
};

// Panel band: x 0.03..0.97, y 0.16..0.86 of the canvas. Each layout lists panels as
// [x, y, w, h] in band-local coords plus a default crop and an optional tilt (deg).
export const LAYOUTS = {
  vice: {
    name: 'Vice',
    panels: [
      { r: [0, 0, 0.62, 1], crop: 'face' },
      { r: [0.632, 0, 0.368, 0.492], crop: 'pierdetail' },
      { r: [0.632, 0.508, 0.368, 0.492], crop: 'detail' },
    ],
  },
  trio: {
    name: 'Trio',
    panels: [
      { r: [0, 0, 0.325, 1], crop: 'face' },
      { r: [0.3375, 0, 0.325, 1], crop: 'wide' },
      { r: [0.675, 0, 0.325, 1], crop: 'detail' },
    ],
  },
  duo: {
    name: 'Duo',
    panels: [
      { r: [0, 0, 0.494, 1], crop: 'face' },
      { r: [0.506, 0, 0.494, 1], crop: 'wide' },
    ],
  },
  hero6: {
    name: 'Hero 6',
    panels: [
      { r: [0, 0, 0.55, 0.66], crop: 'face' },
      { r: [0.562, 0, 0.438, 0.32], crop: 'pierdetail' },
      { r: [0.562, 0.34, 0.214, 0.32], crop: 'detail' },
      { r: [0.786, 0.34, 0.214, 0.32], crop: 'wide' },
      { r: [0, 0.68, 0.494, 0.32], crop: 'face2' },
      { r: [0.506, 0.68, 0.494, 0.32], crop: 'sky' },
    ],
  },
  quad: {
    name: 'Quad',
    panels: [
      { r: [0, 0, 0.494, 0.494], crop: 'face' },
      { r: [0.506, 0, 0.494, 0.494], crop: 'wide' },
      { r: [0, 0.506, 0.494, 0.494], crop: 'detail' },
      { r: [0.506, 0.506, 0.494, 0.494], crop: 'sky' },
    ],
  },
  strip: {
    name: 'Strip',
    panels: [
      { r: [0, 0, 1, 0.2425], crop: 'wide' },
      { r: [0, 0.2525, 1, 0.2425], crop: 'face' },
      { r: [0, 0.505, 1, 0.2425], crop: 'detail' },
      { r: [0, 0.7575, 1, 0.2425], crop: 'face2' },
    ],
  },
  cross: {
    name: 'Cross',
    panels: [
      { r: [0, 0, 1, 0.24], crop: 'wide' },
      { r: [0, 0.255, 0.24, 0.49], crop: 'face2' },
      { r: [0.255, 0.255, 0.49, 0.49], crop: 'face' },
      { r: [0.76, 0.255, 0.24, 0.49], crop: 'detail' },
      { r: [0, 0.76, 1, 0.24], crop: 'pierdetail' },
    ],
  },
  tilt: {
    name: 'Tilt',
    panels: [
      { r: [0.04, 0.05, 0.42, 0.62], crop: 'face', rot: -4 },
      { r: [0.52, 0.02, 0.44, 0.58], crop: 'wide', rot: 3 },
      { r: [0.28, 0.44, 0.48, 0.5], crop: 'detail', rot: -2 },
    ],
  },
  grid9: {
    name: 'Grid 9',
    panels: [
      { r: [0, 0, 0.325, 0.325], crop: 'face' },
      { r: [0.3375, 0, 0.325, 0.325], crop: 'wide' },
      { r: [0.675, 0, 0.325, 0.325], crop: 'face2' },
      { r: [0, 0.3375, 0.325, 0.325], crop: 'detail' },
      { r: [0.3375, 0.3375, 0.325, 0.325], crop: 'face' },
      { r: [0.675, 0.3375, 0.325, 0.325], crop: 'pierdetail' },
      { r: [0, 0.675, 0.325, 0.325], crop: 'wide' },
      { r: [0.3375, 0.675, 0.325, 0.325], crop: 'face2' },
      { r: [0.675, 0.675, 0.325, 0.325], crop: 'detail' },
    ],
  },
};

// Deterministic pseudo-random (mulberry32) so the skyline, palms and grain are
// identical on every run and every export size.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAND = { x: 0.03, y: 0.16, w: 0.94, h: 0.70 };
const GAP = 0.012;

function bandRect(panel, W, H) {
  const [x, y, w, h] = panel.r;
  return {
    x: (BAND.x + x * BAND.w) * W,
    y: (BAND.y + y * BAND.h) * H,
    w: w * BAND.w * W,
    h: h * BAND.h * H,
  };
}

// Cover-fit a photo into a rect with zoom and pan (ox/oy in -0.9..0.9).
function photoDrawRect(img, rect, zoom, ox, oy) {
  const s = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const slackX = Math.max(0, (dw - rect.w) / 2);
  const slackY = Math.max(0, (dh - rect.h) / 2);
  return {
    dx: rect.x + (rect.w - dw) / 2 + ox * slackX,
    dy: rect.y + (rect.h - dh) / 2 + oy * slackY,
    dw, dh,
  };
}

function drawSky(ctx, grade, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, grade.sky[0]);
  g.addColorStop(0.45, grade.sky[1]);
  g.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawSun(ctx, grade, W, H) {
  const cx = 0.78 * W, cy = 0.09 * H, r = 0.20 * H;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(0.35, grade.sun + 'aa');
  glow.addColorStop(1, grade.sun + '00');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(cx, cy, 0.045 * H, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkyline(ctx, W, H) {
  const rnd = mulberry32(20261119);
  const base = 0.16 * H;
  ctx.fillStyle = '#160a26';
  let x = 0;
  while (x < W) {
    const bw = (0.02 + rnd() * 0.045) * W;
    const bh = (0.03 + rnd() * 0.05) * H;
    ctx.fillRect(x, base - bh, bw, bh);
    // A few lit windows.
    ctx.fillStyle = 'rgba(255, 210, 110, 0.85)';
    const wins = 1 + Math.floor(rnd() * 4);
    for (let i = 0; i < wins; i++) {
      const wx = x + 0.15 * bw + rnd() * 0.7 * bw;
      const wy = base - bh + 0.15 * bh + rnd() * 0.6 * bh;
      ctx.fillRect(wx, wy, Math.max(1.5, 0.004 * W), Math.max(1.5, 0.006 * H));
    }
    ctx.fillStyle = '#160a26';
    x += bw + 0.004 * W;
  }
}

function drawPalm(ctx, x, baseY, h, lean, W) {
  const topX = x + lean * h;
  const topY = baseY - h;
  ctx.strokeStyle = '#12081f';
  ctx.lineCap = 'round';
  // Trunk, slightly curved.
  ctx.lineWidth = Math.max(2, 0.008 * h);
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.quadraticCurveTo(x + lean * h * 0.4, baseY - h * 0.55, topX, topY);
  ctx.stroke();
  // Fronds drooping from the crown.
  ctx.lineWidth = Math.max(1.5, 0.006 * h);
  const fronds = 6;
  for (let i = 0; i < fronds; i++) {
    const a = (-0.15 - i * 0.22) * Math.PI + (lean > 0 ? 0.1 : -0.1);
    const len = h * (0.42 + (i % 3) * 0.06);
    const cx = topX + Math.cos(a) * len * 0.55;
    const cy = topY + Math.sin(a) * len * 0.35 - h * 0.06;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + h * 0.22;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  // Coconuts.
  ctx.fillStyle = '#12081f';
  ctx.beginPath(); ctx.arc(topX - 2, topY + 3, Math.max(2, 0.008 * h), 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(topX + 3, topY + 4, Math.max(2, 0.007 * h), 0, Math.PI * 2); ctx.fill();
}

function drawPanels(ctx, state, W, H, images) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.vice;
  layout.panels.forEach((panel, i) => {
    const rect = bandRect(panel, W, H);
    const spec = state.panels[i] ?? CROPS[panel.crop];
    const img = images[spec.photo];
    ctx.save();
    if (panel.rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((panel.rot * Math.PI) / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      ctx.beginPath();
      ctx.rect(0, 0, rect.w, rect.h);
      ctx.clip();
      if (img) {
        const d = photoDrawRect(img, { x: 0, y: 0, w: rect.w, h: rect.h }, spec.zoom, spec.ox, spec.oy);
        ctx.drawImage(img, d.dx, d.dy, d.dw, d.dh);
      } else {
        ctx.fillStyle = '#3a2a4a';
        ctx.fillRect(0, 0, rect.w, rect.h);
      }
      ctx.restore();
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((panel.rot * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = Math.max(2, 0.004 * H);
      ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();
      if (img) {
        const d = photoDrawRect(img, rect, spec.zoom, spec.ox, spec.oy);
        ctx.drawImage(img, d.dx, d.dy, d.dw, d.dh);
      } else {
        ctx.fillStyle = '#3a2a4a';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }
      // Grade tint wash.
      ctx.fillStyle = (GRADES[state.grade] ?? GRADES.sunset).tint;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
      // Crisp white frame + inner shade.
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = Math.max(2, 0.004 * H);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = Math.max(1, 0.002 * H);
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
    }
    // Selection frame, editor only — never on the exported cover.
    if (state.editor && state.selected === i) {
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = Math.max(2, 0.005 * H);
      ctx.setLineDash([10, 6]);
      ctx.strokeRect(rect.x - 4, rect.y - 4, rect.w + 8, rect.h + 8);
      ctx.restore();
    }
  });
}

function drawScrim(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0.70 * H, 0, 0.96 * H);
  g.addColorStop(0, 'rgba(10,4,20,0)');
  g.addColorStop(0.55, 'rgba(10,4,20,0.45)');
  g.addColorStop(1, 'rgba(10,4,20,0.78)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0.70 * H, W, 0.26 * H);
}

function drawHalftone(ctx, grade, W, H) {
  const rnd = mulberry32(77);
  const top = 0.78 * H, bottom = 0.935 * H;
  const step = Math.max(10, 0.018 * H);
  ctx.fillStyle = grade.accent;
  for (let y = top; y < bottom; y += step) {
    for (let x = 0; x < W; x += step) {
      const wave = 0.5 + 0.5 * Math.sin((x / W) * Math.PI * 2 + (y / H) * 6);
      const r = Math.max(0.6, step * 0.16 * wave);
      ctx.globalAlpha = 0.10 + 0.08 * rnd();
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, grade, text, W, H) {
  const clean = (text || '').trim().toUpperCase();
  if (!clean) return;
  const maxW = 0.94 * W;
  const maxCap = 0.115 * H;
  let size = maxCap / 0.72;
  const setFont = () => { ctx.font = `900 ${size}px "Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`; };
  setFont();
  while ((ctx.measureText(clean).width > maxW || size * 0.72 > maxCap) && size > 12) {
    size -= 2;
    setFont();
  }
  const baseline = 0.905 * H;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  // Hard offset shadow.
  ctx.fillStyle = 'rgba(8,2,16,0.9)';
  ctx.fillText(clean, W / 2 + size * 0.035, baseline + size * 0.04);
  // Gradient fill.
  const g = ctx.createLinearGradient(0, baseline - size * 0.72, 0, baseline);
  g.addColorStop(0, grade.title[0]);
  g.addColorStop(1, grade.title[1]);
  ctx.fillStyle = g;
  ctx.fillText(clean, W / 2, baseline);
  // Thick dark outline on top.
  ctx.strokeStyle = 'rgba(12,4,24,0.95)';
  ctx.lineWidth = Math.max(2, size * 0.055);
  ctx.strokeText(clean, W / 2, baseline);
  // Thin bright rim.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.strokeText(clean, W / 2, baseline);
  // Neon script subtitle just under the title.
  ctx.font = `italic bold ${Math.max(11, 0.024 * H)}px Georgia, serif`;
  ctx.fillStyle = grade.accent;
  ctx.fillText('A  LEONIDA  STORY', W / 2, baseline + 0.030 * H);
}

function drawBilling(ctx, W, H) {
  const size = Math.max(9, 0.0115 * H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = '1px'; } catch { /* older canvas: ignore */ }
  ctx.font = `bold ${size}px "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText('VICE COVER STUDIO  •  A LEONIDA PICTURES PRODUCTION', W / 2, 0.958 * H);
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `${size}px "Arial Narrow", Arial, sans-serif`;
  ctx.fillText(
    'STARRING THE BOULEVARD  •  THE PIER  •  GOLDEN HOUR     MUSIC BY NEON COAST     DIRECTED BY VICE CITY',
    W / 2, 0.975 * H,
  );
  try { ctx.letterSpacing = '0px'; } catch { /* ignore */ }
}

function arcText(ctx, text, cx, cy, r, a0, a1) {
  const chars = [...text];
  const span = a1 - a0;
  chars.forEach((ch, i) => {
    const a = a0 + (span * (i + 0.5)) / chars.length;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

function drawSeal(ctx, W, H) {
  const cx = 0.885 * W, cy = 0.11 * H, r = 0.062 * H;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  ctx.strokeStyle = 'rgba(245, 215, 110, 0.95)';
  ctx.fillStyle = 'rgba(245, 215, 110, 0.95)';
  ctx.lineWidth = Math.max(2, 0.006 * H);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1, 0.003 * H);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.max(9, 0.016 * H)}px "Arial Narrow", Arial, sans-serif`;
  arcText(ctx, 'LEONIDA', cx, cy, r * 0.91, -Math.PI * 0.78, -Math.PI * 0.22);
  arcText(ctx, 'EST. 2026', cx, cy, r * 0.91, Math.PI * 0.24, Math.PI * 0.76);
  ctx.font = `${Math.max(14, 0.028 * H)}px sans-serif`;
  ctx.fillText('★', cx, cy);
  ctx.restore();
}

function drawCallout(ctx, W, H, label, lx, ly, px, py, alignRight) {
  ctx.save();
  const fs = Math.max(10, 0.016 * H);
  ctx.font = `bold ${fs}px "Arial Narrow", Arial, sans-serif`;
  const tw = ctx.measureText(label).width;
  const pad = 0.008 * W;
  const bw = tw + pad * 2, bh = fs * 1.9;
  const bx = alignRight ? lx - bw : lx;
  const by = ly - bh / 2;
  // Leader line + dot.
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1, 0.0015 * H);
  ctx.beginPath();
  ctx.moveTo(alignRight ? bx : bx + bw, ly);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(px, py, Math.max(2, 0.004 * H), 0, Math.PI * 2); ctx.fill();
  // Label pill.
  ctx.fillStyle = 'rgba(10,4,20,0.72)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bh / 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + bw / 2, by + bh / 2 + 1);
  ctx.restore();
}

function drawCallouts(ctx, W, H) {
  drawCallout(ctx, W, H, 'VICE CITY', 0.05 * W, 0.20 * H, 0.20 * W, 0.30 * H, false);
  drawCallout(ctx, W, H, 'GOLDEN HOUR', 0.95 * W, 0.34 * H, 0.80 * W, 0.20 * H, true);
}

function drawGrain(ctx, W, H) {
  const rnd = mulberry32(4242);
  const n = Math.floor((W * H) / 900);
  for (let i = 0; i < n; i++) {
    const v = rnd();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(rnd() * W, rnd() * H, 1.4, 1.4);
  }
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(8,2,16,0.38)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Panels visible on the canvas, in pixels — for click hit-testing in the editor.
export function panelRects(state, W, H) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.vice;
  return layout.panels.map((panel) => bandRect(panel, W, H));
}

// Draws the whole cover onto `canvas` (any size). `state` carries layout, grade,
// caption, panels (per-panel {photo, zoom, ox, oy}), selected, editor and the
// three poster toggles. `images` maps photo names to loaded Image elements.
export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  drawSky(ctx, grade, W, H);
  drawSun(ctx, grade, W, H);
  drawSkyline(ctx, W, H);
  drawPanels(ctx, state, W, H, images);
  drawPalm(ctx, 0.055 * W, 0.99 * H, 0.14 * H, 0.25, W);
  drawPalm(ctx, 0.945 * W, 0.99 * H, 0.14 * H, -0.25, W);
  drawScrim(ctx, W, H);
  drawHalftone(ctx, grade, W, H);
  drawTitle(ctx, grade, state.caption, W, H);
  if (state.showBilling !== false) drawBilling(ctx, W, H);
  if (state.showSeal !== false) drawSeal(ctx, W, H);
  if (state.showCallouts !== false) drawCallouts(ctx, W, H);
  drawGrain(ctx, W, H);
  drawVignette(ctx, W, H);
}
