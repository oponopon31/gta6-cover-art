// Vice Cover Studio — cover renderer, round 4.
// Draws a GTA-style cinema poster: sunset sky, glowing sun, skyline, palms, a
// multi-panel photo grid, a chrome gradient title, a tagline, a script subtitle,
// a 3-line billing block, a LEONIDA seal, callouts, grain and vignette.
// All geometry is relative to the canvas size, so any export aspect works.

export const GRADES = {
  sunset: {
    name: 'Sunset',
    sky: ['#2b1055', '#7b2d8b', '#e14e6d', '#ff7e3d', '#ffc46b'],
    sun: '#ffd76a', sunCore: '#fff3c4',
    title: ['#fffbe8', '#ffe9a3', '#ffb347', '#ff5e62', '#c2185b', '#7a1f3d'],
    tint: 'rgba(255, 110, 60, 0.18)', haze: 'rgba(255, 190, 120, 0.35)',
  },
  neon: {
    name: 'Neon',
    sky: ['#12082b', '#3d0f63', '#a4138f', '#ff2e88', '#ff7ad9'],
    sun: '#ff5ce1', sunCore: '#ffd6f5',
    title: ['#ffffff', '#ffd6f5', '#ff7ad9', '#ff2e88', '#8f1d7a', '#3d0f63'],
    tint: 'rgba(255, 46, 136, 0.16)', haze: 'rgba(255, 120, 220, 0.30)',
  },
  vice: {
    name: 'Vice',
    sky: ['#1b0f3b', '#5b1a6e', '#b0308f', '#ff6a5e', '#ffd23d'],
    sun: '#ffd23d', sunCore: '#fff8d6',
    title: ['#fffbe8', '#ffe98a', '#ffc93d', '#ff7a3d', '#b0308f', '#4a1040'],
    tint: 'rgba(255, 190, 60, 0.16)', haze: 'rgba(255, 210, 90, 0.32)',
  },
  ocean: {
    name: 'Ocean',
    sky: ['#062a4d', '#0b5a7a', '#1a9bb0', '#4fd1c5', '#a8e6cf'],
    sun: '#ffe9a3', sunCore: '#ffffff',
    title: ['#ffffff', '#d6f5ff', '#7ad9f5', '#1a9bb0', '#0b5a7a', '#062a4d'],
    tint: 'rgba(80, 200, 220, 0.16)', haze: 'rgba(170, 230, 255, 0.30)',
  },
  dusk: {
    name: 'Dusk',
    sky: ['#0d0b2a', '#2a1a5e', '#6b2a8f', '#e15a4e', '#ff9a3d'],
    sun: '#ff9a3d', sunCore: '#ffe9c4',
    title: ['#fffbe8', '#ffd6a3', '#ff9a3d', '#e15a4e', '#6b2a8f', '#241040'],
    tint: 'rgba(255, 120, 70, 0.18)', haze: 'rgba(255, 170, 110, 0.32)',
  },
};

// Per-photo crops, in photo-relative coords. cx/cy is the focal point, z the
// magnification over a plain cover-fit. Every layout crop key exists for both
// photos, so any layout works with either sample.
export const CROPS = {
  boulevard: {
    face: { cx: 0.58, cy: 0.18, z: 1.9 },
    detail: { cx: 0.16, cy: 0.80, z: 1.8 },
    sunset: { cx: 0.18, cy: 0.22, z: 1.3 },
    wide: { cx: 0.50, cy: 0.50, z: 1.0 },
    sky: { cx: 0.50, cy: 0.10, z: 1.5 },
    sea: { cx: 0.10, cy: 0.25, z: 1.5 },
    hero: { cx: 0.52, cy: 0.25, z: 1.15 },
  },
  pier: {
    face: { cx: 0.42, cy: 0.20, z: 1.9 },
    detail: { cx: 0.82, cy: 0.62, z: 1.8 },
    sunset: { cx: 0.80, cy: 0.45, z: 1.5 },
    wide: { cx: 0.50, cy: 0.50, z: 1.0 },
    sky: { cx: 0.50, cy: 0.10, z: 1.5 },
    sea: { cx: 0.80, cy: 0.60, z: 1.3 },
    hero: { cx: 0.45, cy: 0.28, z: 1.15 },
  },
};

// Layouts: panels in zone coords (0-1 of the panel zone). The zone is the full
// width minus a 0.03 margin, y 0.03-0.60 of the canvas. tilt rotates a panel
// around its centre; diag gives the hero a slanted right edge.
export const LAYOUTS = [
  { id: 'vice', name: 'Vice', panels: [
    { x: 0, y: 0, w: 0.62, h: 1, crop: 'hero' },
    { x: 0.65, y: 0, w: 0.35, h: 0.48, crop: 'face' },
    { x: 0.65, y: 0.52, w: 0.35, h: 0.48, crop: 'detail' },
  ] },
  { id: 'trio', name: 'Trio', panels: [
    { x: 0, y: 0, w: 0.32, h: 1, crop: 'face' },
    { x: 0.34, y: 0, w: 0.32, h: 1, crop: 'wide' },
    { x: 0.68, y: 0, w: 0.32, h: 1, crop: 'detail' },
  ] },
  { id: 'duo', name: 'Duo', panels: [
    { x: 0, y: 0, w: 0.49, h: 1, crop: 'wide' },
    { x: 0.51, y: 0, w: 0.49, h: 1, crop: 'face' },
  ] },
  { id: 'hero6', name: 'Hero 6', panels: [
    { x: 0, y: 0, w: 0.55, h: 1, crop: 'hero' },
    { x: 0.58, y: 0, w: 0.13, h: 0.48, crop: 'face' },
    { x: 0.72, y: 0, w: 0.13, h: 0.48, crop: 'detail' },
    { x: 0.86, y: 0, w: 0.14, h: 0.48, crop: 'sunset' },
    { x: 0.58, y: 0.52, w: 0.20, h: 0.48, crop: 'sky' },
    { x: 0.80, y: 0.52, w: 0.20, h: 0.48, crop: 'sea' },
  ] },
  { id: 'quad', name: 'Quad', panels: [
    { x: 0, y: 0, w: 0.49, h: 0.49, crop: 'face' },
    { x: 0.51, y: 0, w: 0.49, h: 0.49, crop: 'detail' },
    { x: 0, y: 0.51, w: 0.49, h: 0.49, crop: 'wide' },
    { x: 0.51, y: 0.51, w: 0.49, h: 0.49, crop: 'sky' },
  ] },
  { id: 'strip', name: 'Strip', panels: [
    { x: 0, y: 0, w: 0.235, h: 1, crop: 'sunset' },
    { x: 0.255, y: 0, w: 0.235, h: 1, crop: 'face' },
    { x: 0.51, y: 0, w: 0.235, h: 1, crop: 'wide' },
    { x: 0.765, y: 0, w: 0.235, h: 1, crop: 'detail' },
  ] },
  { id: 'cross', name: 'Cross', panels: [
    { x: 0.25, y: 0.15, w: 0.5, h: 0.7, crop: 'hero' },
    { x: 0, y: 0, w: 0.23, h: 0.4, crop: 'face' },
    { x: 0.77, y: 0, w: 0.23, h: 0.4, crop: 'detail' },
    { x: 0, y: 0.6, w: 0.23, h: 0.4, crop: 'sky' },
    { x: 0.77, y: 0.6, w: 0.23, h: 0.4, crop: 'sunset' },
  ] },
  { id: 'tilt', name: 'Tilt', panels: [
    { x: 0.02, y: 0.05, w: 0.30, h: 0.9, crop: 'face', tilt: -4 },
    { x: 0.35, y: 0.02, w: 0.30, h: 0.94, crop: 'wide', tilt: 3 },
    { x: 0.68, y: 0.05, w: 0.30, h: 0.9, crop: 'detail', tilt: -2 },
  ] },
  { id: 'grid9', name: 'Grid 9', panels: [
    { x: 0, y: 0, w: 0.32, h: 0.32, crop: 'face' },
    { x: 0.34, y: 0, w: 0.32, h: 0.32, crop: 'detail' },
    { x: 0.68, y: 0, w: 0.32, h: 0.32, crop: 'sunset' },
    { x: 0, y: 0.34, w: 0.32, h: 0.32, crop: 'wide' },
    { x: 0.34, y: 0.34, w: 0.32, h: 0.32, crop: 'sky' },
    { x: 0.68, y: 0.34, w: 0.32, h: 0.32, crop: 'sea' },
    { x: 0, y: 0.68, w: 0.32, h: 0.32, crop: 'detail' },
    { x: 0.34, y: 0.68, w: 0.32, h: 0.32, crop: 'face' },
    { x: 0.68, y: 0.68, w: 0.32, h: 0.32, crop: 'wide' },
  ] },
  { id: 'crown', name: 'Crown', panels: [
    { x: 0.30, y: 0, w: 0.40, h: 1, crop: 'hero' },
    { x: 0, y: 0, w: 0.28, h: 0.48, crop: 'face' },
    { x: 0, y: 0.52, w: 0.28, h: 0.48, crop: 'detail' },
    { x: 0.72, y: 0, w: 0.28, h: 0.48, crop: 'sky' },
    { x: 0.72, y: 0.52, w: 0.28, h: 0.48, crop: 'sunset' },
  ] },
  { id: 'marquee', name: 'Marquee', panels: [
    { x: 0, y: 0, w: 1, h: 0.55, crop: 'hero' },
    { x: 0, y: 0.58, w: 0.32, h: 0.42, crop: 'face' },
    { x: 0.34, y: 0.58, w: 0.32, h: 0.42, crop: 'detail' },
    { x: 0.68, y: 0.58, w: 0.32, h: 0.42, crop: 'sky' },
  ] },
  { id: 'split', name: 'Split', panels: [
    { x: 0, y: 0, w: 0.60, h: 1, crop: 'hero', diag: true },
    { x: 0.63, y: 0, w: 0.37, h: 0.48, crop: 'face' },
    { x: 0.63, y: 0.52, w: 0.37, h: 0.48, crop: 'detail' },
  ] },
];

// Deterministic pseudo-random, so the same grade always draws the same skyline.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawSky(ctx, w, h, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  const stops = grade.sky;
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawSun(ctx, w, h, grade) {
  const cx = w * 0.5, cy = h * 0.80, r = h * 0.13;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4.2);
  glow.addColorStop(0, grade.sun + 'cc');
  glow.addColorStop(0.35, grade.sun + '55');
  glow.addColorStop(1, grade.sun + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 4.2, cy - r * 4.2, r * 8.4, r * 8.4);
  const core = ctx.createRadialGradient(cx, cy - r * 0.1, 0, cx, cy, r);
  core.addColorStop(0, grade.sunCore);
  core.addColorStop(0.7, grade.sun);
  core.addColorStop(1, grade.sun + '00');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawHaze(ctx, w, h, grade) {
  // Two thin atmospheric bands: one at the horizon, one higher up.
  const band = (y, half, alpha) => {
    const g = ctx.createLinearGradient(0, y - half, 0, y + half);
    g.addColorStop(0, grade.haze.replace(/[\d.]+\)$/, '0)'));
    g.addColorStop(0.5, grade.haze);
    g.addColorStop(1, grade.haze.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(0, y - half, w, half * 2);
  };
  band(h * 0.62, h * 0.045, 1);
  band(h * 0.30, h * 0.03, 0.7);
}

function drawSkyline(ctx, w, h, grade, seed) {
  const rnd = mulberry32(seed);
  const base = h * 0.645, top = h * 0.585;
  ctx.fillStyle = 'rgba(16, 8, 28, 0.85)';
  let x = 0;
  while (x < w) {
    const bw = w * (0.03 + rnd() * 0.05);
    const bh = top + rnd() * (base - top) * 0.9;
    ctx.fillRect(x, bh, bw, base - bh);
    if (rnd() > 0.6) ctx.fillRect(x + bw * 0.35, bh - h * 0.012, bw * 0.3, h * 0.012);
    x += bw + w * 0.004;
  }
  // Lit windows, warm and seeded.
  ctx.fillStyle = 'rgba(255, 205, 110, 0.9)';
  const rnd2 = mulberry32(seed + 7);
  for (let i = 0; i < 90; i++) {
    const wx = rnd2() * w, wy = h * 0.59 + rnd2() * h * 0.05;
    if (rnd2() > 0.45) ctx.fillRect(wx, wy, Math.max(2, w * 0.003), Math.max(2, h * 0.004));
  }
  // Water shimmer under the skyline strip.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
  for (let i = 0; i < 14; i++) {
    const sy = h * 0.652 + i * h * 0.0022;
    ctx.fillRect(w * (0.08 + ((i * 37) % 80) / 100), sy, w * (0.04 + ((i * 53) % 10) / 100), Math.max(1, h * 0.0012));
  }
}

function drawPalm(ctx, x, y, s, lean, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.03);
  ctx.lineCap = 'round';
  // Curved trunk.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.06, -s * 0.5, s * 0.16, -s * 0.92);
  ctx.stroke();
  const tx = s * 0.16, ty = -s * 0.92;
  // Fronds: arcs fanning from the crown.
  ctx.lineWidth = Math.max(1.5, s * 0.018);
  for (let i = -3; i <= 3; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 7;
    const len = s * (0.42 - Math.abs(i) * 0.04);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.45 - s * 0.08,
      tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.75 + s * 0.10,
    );
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(tx - s * 0.02, ty + s * 0.03, s * 0.035, 0, Math.PI * 2);
  ctx.arc(tx + s * 0.04, ty + s * 0.04, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPanelPhoto(ctx, photo, rect, crop, panX, panY, zoom) {
  const { x, y, w, h } = rect;
  if (!photo) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#3a2a55');
    g.addColorStop(1, '#1c1030');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `600 ${Math.max(12, h * 0.07)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2);
    return;
  }
  const iw = photo.naturalWidth, ih = photo.naturalHeight;
  const base = Math.max(w / iw, h / ih);
  const s = base * (crop ? crop.z : 1) * (zoom || 1);
  const dw = iw * s, dh = ih * s;
  const cx = crop ? crop.cx : 0.5, cy = crop ? crop.cy : 0.5;
  const dx = x + w / 2 - cx * dw + (panX || 0) * w;
  const dy = y + h / 2 - cy * dh + (panY || 0) * h;
  ctx.drawImage(photo, dx, dy, dw, dh);
}

function panelRect(zone, p, w, h) {
  return {
    x: zone.x + p.x * zone.w,
    y: zone.y + p.y * zone.h,
    w: p.w * zone.w,
    h: p.h * zone.h,
  };
}

function drawPanels(ctx, photo, opts, w, h, grade) {
  const layout = LAYOUTS.find((l) => l.id === opts.layout) || LAYOUTS[0];
  const zone = { x: w * 0.03, y: h * 0.03, w: w * 0.94, h: h * 0.57 };
  const crops = CROPS[opts.photoName] || CROPS.boulevard;
  layout.panels.forEach((p, i) => {
    const r = panelRect(zone, p, w, h);
    const over = (opts.crops && opts.crops[i]) || {};
    const crop = crops[over.crop || p.crop] || crops.wide;
    ctx.save();
    // Soft drop shadow.
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = h * 0.012;
    ctx.shadowOffsetY = h * 0.004;
    ctx.fillStyle = '#fff';
    if (p.diag) {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + r.w, r.y);
      ctx.lineTo(r.x + r.w - r.w * 0.10, r.y + r.h);
      ctx.lineTo(r.x, r.y + r.h);
      ctx.closePath();
      ctx.fill();
    } else if (p.tilt) {
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.restore();
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.translate(-r.w / 2, -r.h / 2);
      ctx.beginPath();
      ctx.rect(0, 0, r.w, r.h);
      ctx.clip();
      drawPanelPhoto(ctx, photo, { x: 0, y: 0, w: r.w, h: r.h }, crop, over.panX, over.panY, over.zoom);
      ctx.restore();
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(2, h * 0.006);
      ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.restore();
      if (opts.mode === 'editor' && opts.selected === i) {
        ctx.save();
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        ctx.rotate((p.tilt * Math.PI) / 180);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = Math.max(2, h * 0.008);
        ctx.setLineDash([h * 0.012, h * 0.008]);
        ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
        ctx.restore();
      }
      return;
    } else {
      ctx.fillRect(r.x, r.y, r.w, r.h);
    }
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.save();
    if (p.diag) {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + r.w, r.y);
      ctx.lineTo(r.x + r.w - r.w * 0.10, r.y + r.h);
      ctx.lineTo(r.x, r.y + r.h);
      ctx.closePath();
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(r.x, r.y, r.w, r.h);
      ctx.clip();
    }
    drawPanelPhoto(ctx, photo, r, crop, over.panX, over.panY, over.zoom);
    // Grade tint over the photo.
    ctx.fillStyle = grade.tint;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.restore();
    // White frame.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, h * 0.006);
    if (p.diag) {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + r.w, r.y);
      ctx.lineTo(r.x + r.w - r.w * 0.10, r.y + r.h);
      ctx.lineTo(r.x, r.y + r.h);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    // Selection frame, editor only.
    if (opts.mode === 'editor' && opts.selected === i) {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = Math.max(2, h * 0.008);
      ctx.setLineDash([h * 0.012, h * 0.008]);
      ctx.strokeRect(r.x - h * 0.004, r.y - h * 0.004, r.w + h * 0.008, r.h + h * 0.008);
      ctx.setLineDash([]);
    }
    ctx.restore();
  });
}

function drawTitle(ctx, w, h, text, grade) {
  const clean = (text || 'SUNSET HEIST').trim().toUpperCase();
  if (!clean) return;
  const baseline = h * 0.895;
  const cap = h * 0.115;
  let size = cap / 0.72;
  ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
  while (ctx.measureText(clean).width > w * 0.92 && size > 10) {
    size -= 2;
    ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
  }
  // Keep the title inside its band: if it is still too tall, shrink again.
  while (size * 0.72 > h * 0.125 && size > 10) {
    size -= 2;
    ctx.font = `900 ${size}px "Arial Black", Impact, sans-serif`;
  }
  const g = ctx.createLinearGradient(0, baseline - size * 0.72, 0, baseline + size * 0.18);
  const stops = grade.title;
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // Hard shadow, then thick outline, then chrome fill, then a bright rim.
  ctx.shadowColor = 'rgba(10, 2, 12, 0.85)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = h * 0.006;
  ctx.shadowOffsetY = h * 0.009;
  ctx.fillStyle = '#1a0a12';
  ctx.fillText(clean, w / 2, baseline);
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = Math.max(3, h * 0.012);
  ctx.strokeStyle = '#160812';
  ctx.lineJoin = 'round';
  ctx.strokeText(clean, w / 2, baseline);
  ctx.fillStyle = g;
  ctx.fillText(clean, w / 2, baseline);
  ctx.lineWidth = Math.max(1.5, h * 0.0035);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.strokeText(clean, w / 2, baseline);
  // Top-light: the same words, lighter, nudged up a hair.
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillText(clean, w / 2, baseline - h * 0.004);
}

function drawTagline(ctx, w, h, tagline) {
  const t = (tagline || 'EVERY LEGEND HAS A PRICE').trim().toUpperCase();
  if (!t) return;
  ctx.font = `700 ${Math.max(11, h * 0.022)}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(3, h * 0.006)}px`; } catch { /* older canvas */ }
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 244, 214, 0.95)';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = h * 0.004;
  ctx.shadowOffsetY = h * 0.002;
  ctx.fillText(t, w / 2, h * 0.672);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
}

function drawScript(ctx, w, h) {
  ctx.font = `italic 600 ${Math.max(13, h * 0.030)}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9a3';
  ctx.shadowColor = 'rgba(255, 120, 200, 0.9)';
  ctx.shadowBlur = h * 0.010;
  ctx.fillText('A LEONIDA STORY', w / 2, h * 0.735);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function drawBilling(ctx, w, h) {
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 250, 235, 0.92)';
  ctx.font = `700 ${Math.max(9, h * 0.015)}px system-ui, sans-serif`;
  try { ctx.letterSpacing = `${Math.max(2, h * 0.003)}px`; } catch { /* older canvas */ }
  ctx.fillText('VICE COVER STUDIO  •  A LEONIDA PICTURES PRODUCTION', w / 2, h * 0.935);
  ctx.font = `600 ${Math.max(8, h * 0.013)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 250, 235, 0.75)';
  ctx.fillText('STARRING LUCIA & JASON  •  MUSIC BY NEON COAST  •  OCEAN DRIVE UNIT', w / 2, h * 0.956);
  ctx.font = `500 ${Math.max(7, h * 0.011)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 250, 235, 0.55)';
  ctx.fillText('DIRECTED BY VICE COVER STUDIO  •  RATED M FOR MATURE  •  © 2026 LEONIDA PICTURES', w / 2, h * 0.975);
  try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
}

function drawSeal(ctx, w, h) {
  const cx = w * 0.92, cy = h * 0.105, r = h * 0.062;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.strokeStyle = '#ffd76a';
  ctx.fillStyle = 'rgba(20, 8, 20, 0.55)';
  ctx.lineWidth = Math.max(1.5, h * 0.003);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  // Circular text: LEONIDA ★ EST. 2026 around the ring.
  const label = 'LEONIDA ★ EST. 2026';
  ctx.fillStyle = '#ffd76a';
  ctx.font = `700 ${Math.max(7, r * 0.20)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < label.length; i++) {
    const a = -Math.PI / 2 + (i / label.length) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.91);
    ctx.fillText(label[i], 0, 0);
    ctx.restore();
  }
  // Centre star.
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r * 0.34 : r * 0.15;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBadge(ctx, w, h) {
  const cx = w * 0.10, cy = h * 0.055, bw = w * 0.15, bh = h * 0.038;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = '#ffd76a';
  ctx.strokeStyle = '#7a4a00';
  ctx.lineWidth = Math.max(1, h * 0.0015);
  ctx.beginPath();
  ctx.moveTo(-bw / 2, -bh / 2);
  ctx.lineTo(bw / 2, -bh / 2);
  ctx.lineTo(bw / 2 + bw * 0.06, 0);
  ctx.lineTo(bw / 2, bh / 2);
  ctx.lineTo(-bw / 2, bh / 2);
  ctx.lineTo(-bw / 2 - bw * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a2400';
  ctx.font = `800 ${Math.max(8, w * 0.015)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPECIAL EDITION', 0, 0);
  ctx.restore();
}

function drawCallouts(ctx, w, h) {
  const items = [
    { label: 'VICE CITY', px: 0.10, py: 0.10, dx: 0.22, dy: 0.20 },
    { label: 'GOLDEN HOUR', px: 0.76, py: 0.10, dx: 0.66, dy: 0.20 },
    { label: 'OCEAN DRIVE', px: 0.12, py: 0.52, dx: 0.24, dy: 0.46 },
  ];
  ctx.font = `700 ${Math.max(9, h * 0.016)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  items.forEach((it) => {
    const lx = it.px * w, ly = it.py * h;
    const tx = it.dx * w, ty = it.dy * h;
    const tw = ctx.measureText(it.label).width + w * 0.03;
    const th = h * 0.032;
    // Leader line + dot.
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(1.5, h * 0.002);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(tx, ty, Math.max(2.5, h * 0.004), 0, Math.PI * 2);
    ctx.fill();
    // Pill.
    ctx.fillStyle = 'rgba(12, 6, 18, 0.78)';
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = Math.max(1, h * 0.0015);
    ctx.beginPath();
    ctx.roundRect(lx - tw / 2, ly - th / 2, tw, th, th / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText(it.label, lx, ly + h * 0.001);
  });
}

function drawGrain(ctx, w, h, seed) {
  const rnd = mulberry32(seed + 99);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, Math.max(1, w * 0.0012), Math.max(1, h * 0.0012));
  }
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 500; i++) {
    ctx.fillRect(rnd() * w, rnd() * h, Math.max(1, w * 0.0012), Math.max(1, h * 0.0012));
  }
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(8,2,12,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Draws the whole cover onto the canvas. opts: caption, tagline, layout,
 *  grade, photoName, crops (per-panel overrides), mode ('cover'|'editor'),
 *  selected (panel index, editor only). */
export function drawCover(canvas, photo, opts) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = GRADES[opts.grade] || GRADES.sunset;
  const seed = 11 + Object.keys(GRADES).indexOf(opts.grade || 'sunset') * 13;
  drawSky(ctx, w, h, grade);
  drawSun(ctx, w, h, grade);
  drawHaze(ctx, w, h, grade);
  drawPanels(ctx, photo, opts, w, h, grade);
  drawSkyline(ctx, w, h, grade, seed);
  // Palms framing the title band.
  drawPalm(ctx, w * 0.02, h * 1.0, h * 0.22, 0.10, 'rgba(14, 6, 20, 0.92)');
  drawPalm(ctx, w * 0.98, h * 1.0, h * 0.20, -0.12, 'rgba(14, 6, 20, 0.92)');
  drawTagline(ctx, w, h, opts.tagline);
  drawScript(ctx, w, h);
  drawTitle(ctx, w, h, opts.caption, grade);
  drawBilling(ctx, w, h);
  drawSeal(ctx, w, h);
  drawBadge(ctx, w, h);
  drawCallouts(ctx, w, h);
  drawGrain(ctx, w, h, seed);
  drawVignette(ctx, w, h);
}
