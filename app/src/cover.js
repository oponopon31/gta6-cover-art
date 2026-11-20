// cover.js — pure canvas renderer for Vice Cover Studio.
// No DOM in this file: given a 2d context, a size and a state object it
// paints one GTA-style multi-panel cover. The editor (main.js) and the
// one-click PNG export both call drawCover; the only difference is the
// `editor` flag, which adds a dashed selection frame around the active
// panel. Exports never carry that frame.
//
// A state looks like:
//   {
//     title: 'SUNSET HEIST',
//     layout: 'vice',            // 'vice' | 'trio' | 'duo'
//     grade: 'sunset',           // 'sunset' | 'neon' | 'palm' | 'vice' | 'dusk'
//     panels: [
//       { src: 'pier', zoom: 1.15, ox: 0, oy: 0.5 },
//       { src: 'boulevard', zoom: 1.15, ox: 0, oy: 0.7 },
//       { src: 'boulevard', zoom: 1.9, ox: 0.55, oy: -0.45 },
//     ],
//   }
// ox / oy are pan offsets in [-0.9, 0.9]: 0 centres the photo, +oy shows
// the top of the photo, -oy the bottom, +ox the left side, -ox the right.

export const GRADES = [
  { id: 'sunset', name: 'Sunset', sky: ['#2b1055', '#ff7e5f', '#feb47b'], sun: '#ffd76a', tint: '#ff7e5f' },
  { id: 'neon', name: 'Neon', sky: ['#12082b', '#ff2e88', '#ff9a3d'], sun: '#ff5db1', tint: '#ff2e88' },
  { id: 'palm', name: 'Palm', sky: ['#062b2b', '#0f766e', '#fbbf24'], sun: '#fde68a', tint: '#14b8a6' },
  { id: 'vice', name: 'Vice', sky: ['#1e0a3c', '#a21caf', '#fb7185'], sun: '#f0abfc', tint: '#d946ef' },
  { id: 'dusk', name: 'Dusk', sky: ['#141238', '#3b2d8f', '#ff8c42'], sun: '#ffb347', tint: '#6366f1' },
];

export const LAYOUTS = [
  { id: 'vice', name: 'Vice' },
  { id: 'trio', name: 'Trio' },
  { id: 'duo', name: 'Duo' },
];

// Crop presets for the selected panel. Face points at the face in a
// portrait photo (zoom in a little, pan up to the top of the frame).
// Detail zooms into a small area — the red car door, mirror and hand.
// Wide resets to the whole photo.
export const PRESETS = {
  face: { name: 'Face', zoom: 1.15, ox: 0, oy: 0.7 },
  detail: { name: 'Detail', zoom: 1.9, ox: 0.55, oy: -0.45 },
  wide: { name: 'Wide', zoom: 1, ox: 0, oy: 0 },
};

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Panel rectangles, in fractions of the cover size. The panel area runs
// from 4% to 80% of the height; the title band owns the bottom fifth.
export function layoutRects(layout, W, H) {
  const top = 0.04 * H;
  const height = 0.76 * H;
  if (layout === 'trio') {
    const w = 0.30 * W;
    return [
      { x: 0.03 * W, y: top, w, h: height },
      { x: 0.35 * W, y: top, w, h: height },
      { x: 0.67 * W, y: top, w, h: height },
    ];
  }
  if (layout === 'duo') {
    return [
      { x: 0.03 * W, y: top, w: 0.47 * W, h: height },
      { x: 0.52 * W, y: top, w: 0.45 * W, h: height },
    ];
  }
  // 'vice' — the default: one tall panel left, two stacked panels right.
  return [
    { x: 0.03 * W, y: top, w: 0.44 * W, h: height },
    { x: 0.50 * W, y: top, w: 0.47 * W, h: 0.365 * H },
    { x: 0.50 * W, y: 0.425 * H, w: 0.47 * W, h: 0.375 * H },
  ];
}

// Deterministic pseudo-random numbers so the skyline is identical on
// every render of the same cover size.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawSky(ctx, W, H, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.45, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun glow, centred high so it spills through the gutters between panels.
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.55);
  glow.addColorStop(0, grade.sun);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Sun disc.
  ctx.fillStyle = grade.sun;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.32, H * 0.085, 0, Math.PI * 2);
  ctx.fill();
}

function drawSkyline(ctx, W, H) {
  const rnd = mulberry32(20261119);
  const base = 0.99 * H;
  ctx.fillStyle = '#160a2e';
  let x = 0;
  while (x < W) {
    const bw = W * (0.035 + rnd() * 0.04);
    const bh = H * (0.09 + rnd() * 0.09);
    ctx.fillRect(x, base - bh, bw, bh);
    x += bw + W * 0.004;
  }
  // Lit windows, a few per building.
  const rnd2 = mulberry32(77);
  ctx.fillStyle = '#ffd166';
  let bx = 0;
  while (bx < W) {
    const bw = W * (0.035 + rnd2() * 0.04);
    const bh = H * (0.09 + rnd2() * 0.09);
    const cols = Math.max(1, Math.floor(bw / (W * 0.014)));
    const rows = Math.max(1, Math.floor(bh / (H * 0.03)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rnd2() < 0.45) {
          ctx.globalAlpha = 0.55 + rnd2() * 0.45;
          ctx.fillRect(
            bx + W * 0.006 + c * W * 0.014,
            base - bh + H * 0.012 + r * H * 0.03,
            Math.max(2, W * 0.005),
            Math.max(2, H * 0.012),
          );
        }
      }
    }
    ctx.globalAlpha = 1;
    bx += bw + W * 0.004;
  }
}

function drawPalm(ctx, W, H, baseX, lean) {
  // One stylised palm silhouette, 0.14H tall, trunk leaning `lean` inward.
  const baseY = 0.99 * H;
  const topX = baseX + lean * W * 0.02;
  const topY = baseY - 0.14 * H;
  ctx.strokeStyle = '#160a2e';
  ctx.fillStyle = '#160a2e';
  ctx.lineCap = 'round';
  // Trunk.
  ctx.lineWidth = Math.max(2, W * 0.008);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + lean * W * 0.01, baseY - 0.07 * H, topX, topY);
  ctx.stroke();
  // Fronds: five drooping arcs fanning out from the crown.
  ctx.lineWidth = Math.max(1.5, W * 0.004);
  for (let i = -2; i <= 2; i++) {
    const spread = i * W * 0.035;
    const drop = Math.abs(i) * H * 0.012 + H * 0.018;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + spread * 0.7, topY - H * 0.02, topX + spread, topY + drop);
    ctx.stroke();
  }
}

// Draw one photo into a panel rect with cover-fit, zoom and pan.
// ox/oy in [-0.9, 0.9]; +oy shows the top of the photo, +ox the left side.
function drawPanelPhoto(ctx, img, rect, panel) {
  const { x, y, w, h } = rect;
  const zoom = panel.zoom || 1;
  const ox = panel.ox || 0;
  const oy = panel.oy || 0;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const slackX = Math.max(0, (dw - w) / 2);
  const slackY = Math.max(0, (dh - h) / 2);
  const dx = x + (w - dw) / 2 + ox * slackX;
  const dy = y + (h - dh) / 2 + oy * slackY;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawTitle(ctx, W, H, title) {
  const text = (title || 'SUNSET HEIST').toUpperCase();
  const bandW = W * 0.94;
  const bandH = H * 0.17;
  // The size is bounded by the band's width AND its height, so a long
  // title can never run off the bottom edge.
  const size = Math.min(bandW / (text.length * 0.72), bandH * 0.92);
  const baseline = 0.945 * H;
  ctx.save();
  ctx.font = `900 ${size}px "Arial Black", Impact, "Franklin Gothic Medium", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.letterSpacing = `${Math.max(1, size * 0.015)}px`;
  } catch (_) {
    // Older canvas implementations ignore letterSpacing; harmless.
  }
  const cx = W / 2;
  // Hard offset shadow, then a thick dark outline, then the bright fill.
  ctx.fillStyle = '#1a0b2e';
  ctx.fillText(text, cx + size * 0.045, baseline + size * 0.045);
  ctx.lineWidth = Math.max(2, size * 0.1);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a0b2e';
  ctx.strokeText(text, cx, baseline);
  const fill = ctx.createLinearGradient(0, baseline - size, 0, baseline);
  fill.addColorStop(0, '#ffffff');
  fill.addColorStop(1, '#ffe9c9');
  ctx.fillStyle = fill;
  ctx.fillText(text, cx, baseline);
  ctx.restore();

  // Studio credit, small, centred below the title — clear of every frame.
  const creditSize = Math.max(9, H * 0.018);
  ctx.save();
  ctx.font = `700 ${creditSize}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  try {
    ctx.letterSpacing = `${creditSize * 0.35}px`;
  } catch (_) {}
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('VICE COVER STUDIO', cx, 0.985 * H);
  ctx.restore();
}

// images: { pier: HTMLImageElement, boulevard: HTMLImageElement, ... }
//   (uploaded photos arrive keyed by a data: URL instead of a sample name)
// opts: { editor: boolean, selected: number }
export function drawCover(ctx, W, H, state, images, opts = {}) {
  const grade = gradeById(state.grade);
  const rects = layoutRects(state.layout, W, H);
  const panels = state.panels || [];

  drawSky(ctx, W, H, grade);

  // Panels, each with its own explicit crop — no two panels share a look.
  rects.forEach((rect, i) => {
    const panel = panels[i];
    if (!panel) return;
    const img = images[panel.src];
    if (img && img.naturalWidth > 0) {
      drawPanelPhoto(ctx, img, rect, panel);
      // A whisper of the grade over the photo ties the panels together.
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = grade.tint;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#241536';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    // Thin white frame + soft drop shadow so panels read as a collage.
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  });

  // Warm glow washed over the whole cover, low alpha, to unify it.
  const wash = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.6);
  wash.addColorStop(0, 'rgba(255,255,255,0.10)');
  wash.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);

  drawSkyline(ctx, W, H);
  drawPalm(ctx, W, H, W * 0.045, 1);
  drawPalm(ctx, W, H, W * 0.955, -1);
  drawTitle(ctx, W, H, state.title);

  // Selection frame: editor only, around the active panel — never exported.
  if (opts.editor && typeof opts.selected === 'number' && rects[opts.selected]) {
    const r = rects[opts.selected];
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.setLineDash([Math.max(6, W * 0.012), Math.max(4, W * 0.008)]);
    ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    ctx.restore();
  }
}
