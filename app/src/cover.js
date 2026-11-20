// Vice Cover Studio — the cover renderer. Draws a multi-panel poster-style cover onto
// any canvas: the user's photos in tilted, white-bordered panels, a sunset or neon colour
// grade, a palm-and-skyline silhouette band and big outlined caption lettering with a
// hard offset shadow. Everything is drawn with the canvas 2D API and system fonts; no
// image, font or file is fetched.

export const FONT_FAMILY = '"Arial Black", "Helvetica Neue", Helvetica, Arial, Impact, sans-serif';
export const BODY_FONT = 'system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif';

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Wide 1920 x 1080' },
};

// Panel rects are fractions of the canvas; the title band lives below y = 0.775.
export const LAYOUTS = {
  'hero-duo': {
    name: 'Hero + Duo',
    panels: [
      { x: 0.02, y: 0.03, w: 0.56, h: 0.72, rot: -1.2 },
      { x: 0.60, y: 0.03, w: 0.38, h: 0.345, rot: 1.0 },
      { x: 0.60, y: 0.395, w: 0.38, h: 0.345, rot: -0.8 },
    ],
  },
  triptych: {
    name: 'Triptych',
    panels: [
      { x: 0.02, y: 0.03, w: 0.306, h: 0.72, rot: -1.0 },
      { x: 0.347, y: 0.03, w: 0.306, h: 0.72, rot: 0.5 },
      { x: 0.674, y: 0.03, w: 0.306, h: 0.72, rot: 1.0 },
    ],
  },
  quad: {
    name: 'Four Frames',
    panels: [
      { x: 0.02, y: 0.03, w: 0.47, h: 0.345, rot: -0.8 },
      { x: 0.51, y: 0.03, w: 0.47, h: 0.345, rot: 0.8 },
      { x: 0.02, y: 0.395, w: 0.47, h: 0.345, rot: 0.8 },
      { x: 0.51, y: 0.395, w: 0.47, h: 0.345, rot: -0.8 },
    ],
  },
  single: {
    name: 'One Shot',
    panels: [{ x: 0.02, y: 0.03, w: 0.96, h: 0.72, rot: 0 }],
  },
};

export const GRADES = {
  sunset: {
    name: 'Sunset',
    filter: 'saturate(1.45) contrast(1.08) brightness(1.02)',
    top: 'rgba(255, 140, 40, 0.16)',
    bottom: 'rgba(255, 45, 120, 0.50)',
    accent: '#ff7a1a',
    fillTo: '#ffd9a0',
    glow: 'rgba(255, 122, 26, 0.35)',
  },
  neon: {
    name: 'Neon',
    filter: 'saturate(1.7) contrast(1.12) hue-rotate(-10deg)',
    top: 'rgba(255, 47, 179, 0.32)',
    bottom: 'rgba(10, 255, 239, 0.34)',
    accent: '#0affef',
    fillTo: '#bff3ff',
    glow: 'rgba(255, 47, 179, 0.30)',
  },
  gold: {
    name: 'Gold Hour',
    filter: 'saturate(1.25) contrast(1.06) sepia(0.18)',
    top: 'rgba(255, 215, 106, 0.18)',
    bottom: 'rgba(255, 122, 26, 0.42)',
    accent: '#ffd76a',
    fillTo: '#ffe9b0',
    glow: 'rgba(255, 180, 60, 0.30)',
  },
  dusk: {
    name: 'Dusk',
    filter: 'saturate(1.4) contrast(1.08) hue-rotate(8deg)',
    top: 'rgba(90, 40, 160, 0.30)',
    bottom: 'rgba(255, 110, 30, 0.45)',
    accent: '#ff9a3d',
    fillTo: '#ffd9a0',
    glow: 'rgba(120, 60, 200, 0.30)',
  },
  noir: {
    name: 'Noir',
    filter: 'grayscale(1) contrast(1.18) brightness(0.98)',
    top: 'rgba(255, 255, 255, 0.06)',
    bottom: 'rgba(0, 0, 0, 0.45)',
    accent: '#e8e8e8',
    fillTo: '#cfcfcf',
    glow: 'rgba(255, 255, 255, 0.10)',
  },
};

/** Small deterministic hash of a string, used to seed the skyline so a caption always draws the same city. */
export function hashSeed(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A tiny seeded pseudo-random generator (mulberry32) so the skyline is stable per caption. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws one panel: white border with a soft shadow, the photo cover-fit with the
 *  panel's zoom and pan, or a painted sunset sky when the panel has no photo yet. */
export function drawPanel(ctx, rect, photo, panel, grade, W, H) {
  const pw = rect.w * W;
  const ph = rect.h * H;
  const cx = (rect.x + rect.w / 2) * W;
  const cy = (rect.y + rect.h / 2) * H;
  const border = Math.max(3, W * 0.004);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rect.rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = W * 0.012;
  ctx.shadowOffsetY = W * 0.004;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-pw / 2 - border, -ph / 2 - border, pw + border * 2, ph + border * 2);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.beginPath();
  ctx.rect(-pw / 2, -ph / 2, pw, ph);
  ctx.clip();
  if (photo) {
    ctx.filter = grade.filter;
    const zoom = panel.zoom || 1;
    const scale = Math.max(pw / photo.naturalWidth, ph / photo.naturalHeight) * zoom;
    const dw = photo.naturalWidth * scale;
    const dh = photo.naturalHeight * scale;
    const ox = (panel.ox || 0) * pw;
    const oy = (panel.oy || 0) * ph;
    // The panel is drawn in its own centred frame (translate to its centre, then
    // rotate), so the photo is centred on (0, 0) here, not on (pw / 2, ph / 2).
    ctx.drawImage(photo, -dw / 2 + ox, -dh / 2 + oy, dw, dh);
    ctx.filter = 'none';
  } else {
    drawSkyFallback(ctx, pw, ph, grade);
  }
  const wash = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  ctx.restore();
}

/** Painted sky for an empty panel: gradient sky, a low sun and a dark skyline. */
export function drawSkyFallback(ctx, pw, ph, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, ph);
  if (grade === GRADES.neon) {
    sky.addColorStop(0, '#160b3d');
    sky.addColorStop(0.55, '#a3137f');
    sky.addColorStop(1, '#0affef');
  } else if (grade === GRADES.noir) {
    sky.addColorStop(0, '#e8e8e8');
    sky.addColorStop(0.6, '#8a8a8a');
    sky.addColorStop(1, '#222222');
  } else if (grade === GRADES.gold) {
    sky.addColorStop(0, '#ffe9b0');
    sky.addColorStop(0.55, '#ff9a3d');
    sky.addColorStop(1, '#7a2d12');
  } else if (grade === GRADES.dusk) {
    sky.addColorStop(0, '#1c0f45');
    sky.addColorStop(0.55, '#7a2d8f');
    sky.addColorStop(1, '#ff7a1a');
  } else {
    sky.addColorStop(0, '#ffd76a');
    sky.addColorStop(0.5, '#ff7a1a');
    sky.addColorStop(1, '#5b2a86');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  const sunR = Math.min(pw, ph) * 0.17;
  const sun = ctx.createRadialGradient(0, -ph * 0.12, sunR * 0.1, 0, -ph * 0.12, sunR);
  sun.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  sun.addColorStop(0.5, grade.accent);
  sun.addColorStop(1, 'rgba(255, 122, 26, 0)');
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(0, -ph * 0.12, sunR, 0, Math.PI * 2);
  ctx.fill();
  drawSkyline(ctx, -pw / 2, ph * 0.22, pw, ph * 0.28, 7, 'rgba(26, 8, 40, 0.85)');
}

/** A dark building skyline across (x, y, w, h): a far, lighter row behind a near row
 *  with varied heights, a few antenna spires and lit windows. Deterministic per seed. */
export function drawSkyline(ctx, x, y, w, h, seed, color) {
  const rand = seededRandom(seed);
  // Far row: shorter, lighter, sets the depth.
  ctx.fillStyle = 'rgba(38, 16, 58, 0.55)';
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.06 + rand() * 0.07);
    const bh = h * (0.25 + rand() * 0.35);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    bx += bw + w * 0.01;
  }
  // Near row: taller, with spires and windows.
  ctx.fillStyle = color;
  bx = x;
  while (bx < x + w) {
    const bw = w * (0.045 + rand() * 0.055);
    const bh = h * (0.35 + rand() * 0.65);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    if (rand() > 0.62) {
      // Antenna spire on the roof.
      const sx = bx + bw * 0.5;
      ctx.fillRect(sx - Math.max(1, w * 0.0015), y + h - bh - h * 0.22, Math.max(2, w * 0.003), h * 0.22);
      ctx.beginPath();
      ctx.arc(sx, y + h - bh - h * 0.22, Math.max(1.5, w * 0.002), 0, Math.PI * 2);
      ctx.fill();
    } else if (rand() > 0.5) {
      // Rooftop block.
      ctx.fillRect(bx + bw * 0.3, y + h - bh - h * 0.1, bw * 0.4, h * 0.1);
    }
    bx += bw + w * 0.008;
  }
  // Lit windows: a sparse deterministic scatter over the near row.
  ctx.fillStyle = 'rgba(255, 214, 106, 0.8)';
  const rand2 = seededRandom(seed + 101);
  const winW = Math.max(2, w * 0.005);
  const winH = Math.max(2, h * 0.055);
  for (let i = 0; i < Math.floor(w / 14); i++) {
    const wx = x + rand2() * w;
    const wy = y + h * 0.3 + rand2() * h * 0.6;
    ctx.fillRect(wx, wy, winW, winH);
  }
}

/** A palm silhouette: a leaning trunk with six drooping fronds, drawn in one colour.
 *  (x, yBase) is the trunk foot, h the palm height, lean the top offset in pixels. */
export function drawPalm(ctx, x, yBase, h, lean, color) {
  const topX = x + lean;
  const topY = yBase - h;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  // Trunk: a gentle curve from the foot to the crown.
  ctx.lineWidth = Math.max(2, h * 0.035);
  ctx.beginPath();
  ctx.moveTo(x, yBase);
  ctx.quadraticCurveTo(x + lean * 0.3, yBase - h * 0.55, topX, topY);
  ctx.stroke();
  // Fronds: six arcs fanning from the crown, drooping at the tips.
  ctx.lineWidth = Math.max(1.5, h * 0.022);
  for (let i = 0; i < 6; i++) {
    const a = (-Math.PI * 0.08) - (i * Math.PI) / 7.2;
    const len = h * (0.34 + (i % 2) * 0.06);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.55 + len * 0.28;
    const cx = topX + Math.cos(a) * len * 0.55;
    const cy = topY + Math.sin(a) * len * 0.2 - len * 0.12;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  // A couple of coconuts under the crown.
  ctx.beginPath();
  ctx.arc(topX - h * 0.02, topY + h * 0.03, Math.max(1.5, h * 0.018), 0, Math.PI * 2);
  ctx.arc(topX + h * 0.025, topY + h * 0.035, Math.max(1.5, h * 0.018), 0, Math.PI * 2);
  ctx.fill();
}

/** Shrinks a bold font until `text` fits `maxWidth`; returns the size that fits. */
export function fitTitleSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px ${FONT_FAMILY}`;
  while (size > 10 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `900 ${size}px ${FONT_FAMILY}`;
  }
  return size;
}

/** The caption block: a dark poster band with a palm-and-skyline silhouette, a
 *  letterspaced subtitle over a huge outlined title with a hard offset shadow.
 *  The title size is capped by the band height as well as the width, so its
 *  lettering can never run off the bottom of the cover. */
export function drawTitleBlock(ctx, title, subtitle, grade, W, H) {
  const text = (title || '').trim().toUpperCase();
  const sub = (subtitle || '').trim().toUpperCase();
  // The band: a dark gradient the lettering sits on, so the title reads on any photo.
  const band = ctx.createLinearGradient(0, H * 0.775, 0, H);
  band.addColorStop(0, 'rgba(8, 2, 18, 0.30)');
  band.addColorStop(0.35, 'rgba(8, 2, 18, 0.72)');
  band.addColorStop(1, 'rgba(8, 2, 18, 0.90)');
  ctx.fillStyle = band;
  ctx.fillRect(0, H * 0.775, W, H * 0.225);
  // Silhouette row along the top of the band: skyline with a palm at each end.
  const seed = hashSeed(text || 'vice');
  const palmH = H * 0.14;
  const silColor = 'rgba(12, 4, 24, 0.92)';
  drawSkyline(ctx, 0, H * 0.795, W, H * 0.10, seed, silColor);
  drawPalm(ctx, W * 0.07, H * 0.885, palmH, W * 0.018, silColor);
  drawPalm(ctx, W * 0.93, H * 0.885, palmH * 0.92, -W * 0.016, silColor);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  if (sub) {
    const subSize = Math.max(14, H * 0.030);
    ctx.font = `700 ${subSize}px ${BODY_FONT}`;
    try {
      ctx.letterSpacing = `${Math.max(3, H * 0.006)}px`;
    } catch {
      // letterSpacing is Chrome-only; without it the subtitle still draws.
    }
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = subSize * 0.3;
    ctx.fillText(sub, W / 2, H * 0.845);
    ctx.shadowBlur = 0;
    try {
      ctx.letterSpacing = '0px';
    } catch {
      // reset for the title below
    }
    const rule = ctx.createLinearGradient(W * 0.42, 0, W * 0.58, 0);
    rule.addColorStop(0, 'rgba(255, 255, 255, 0)');
    rule.addColorStop(0.5, grade.accent);
    rule.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rule;
    ctx.fillRect(W * 0.42, H * 0.858, W * 0.16, Math.max(2, H * 0.004));
  }
  if (!text) return;
  // Cap the title by the band: baseline 0.945H, caps ~0.72em tall, so the size
  // must stay under ~0.098H or the letters would touch the band's top edge.
  const byWidth = fitTitleSize(ctx, text, W * 0.92, H * 0.115);
  const titleSize = Math.min(byWidth, H * 0.098);
  const grad = ctx.createLinearGradient(0, H * 0.87, 0, H * 0.95);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, grade.fillTo);
  ctx.font = `900 ${titleSize}px ${FONT_FAMILY}`;
  ctx.lineJoin = 'round';
  // Hard offset shadow first (the poster "sticker" punch), then the outlined fill.
  ctx.fillStyle = '#160826';
  ctx.fillText(text, W / 2 + titleSize * 0.022, H * 0.945 + titleSize * 0.028);
  ctx.strokeStyle = '#160826';
  ctx.lineWidth = Math.max(4, titleSize * 0.10);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = titleSize * 0.10;
  ctx.shadowOffsetY = titleSize * 0.02;
  ctx.strokeText(text, W / 2, H * 0.945);
  ctx.fillStyle = grad;
  ctx.fillText(text, W / 2, H * 0.945);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/** Draws the whole cover for `state` onto the canvas at its own size.
 *  state: { photos, panels, layout, grade, title, subtitle } where panels[i] is
 *  { photo, zoom, ox, oy } aligned with LAYOUTS[layout].panels. When
 *  state.highlight is set, the selected panel gets a dashed accent outline (the
 *  editor preview only — exports never set it). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS['hero-duo'];
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#241031');
  bg.addColorStop(1, '#12081f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // A low sun glow behind the panels, in the grade's colour.
  const glow = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, Math.max(W, H) * 0.55);
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(255, 122, 26, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach((rect, i) => {
    const panel = state.panels[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const photo = state.photos[panel.photo] ?? null;
    drawPanel(ctx, rect, photo, panel, grade, W, H);
  });
  // The editor's selected panel gets a dashed accent frame so the choice is visible.
  if (state.highlight && state.selectedPanel !== undefined && layout.panels[state.selectedPanel]) {
    const rect = layout.panels[state.selectedPanel];
    const pw = rect.w * W;
    const ph = rect.h * H;
    const cx = (rect.x + rect.w / 2) * W;
    const cy = (rect.y + rect.h / 2) * H;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rect.rot * Math.PI) / 180);
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(3, W * 0.005);
    ctx.setLineDash([W * 0.014, W * 0.009]);
    ctx.strokeRect(-pw / 2 - W * 0.008, -ph / 2 - W * 0.008, pw + W * 0.016, ph + W * 0.016);
    ctx.restore();
  }
  const warm = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.775);
  warm.addColorStop(0, 'rgba(255, 122, 26, 0)');
  warm.addColorStop(1, grade.bottom);
  ctx.fillStyle = warm;
  ctx.fillRect(0, H * 0.55, W, H * 0.225);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.75);
  vignette.addColorStop(0, 'rgba(10, 2, 20, 0)');
  vignette.addColorStop(1, 'rgba(10, 2, 20, 0.32)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  drawTitleBlock(ctx, state.title, state.subtitle, grade, W, H);
  ctx.font = `600 ${Math.max(11, H * 0.014)}px ${BODY_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText('VICE COVER STUDIO', W * 0.022, H * 0.028);
}

/** Hit test for the editor: which panel (index) holds point (x, y) in canvas pixels, or -1.
 *  Rotation is undone around each panel's centre, so a click on a tilted panel still lands. */
export function hitPanel(layoutId, x, y, W, H) {
  const layout = LAYOUTS[layoutId] ?? LAYOUTS['hero-duo'];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const rect = layout.panels[i];
    const pw = rect.w * W;
    const ph = rect.h * H;
    const cx = (rect.x + rect.w / 2) * W;
    const cy = (rect.y + rect.h / 2) * H;
    const a = (-rect.rot * Math.PI) / 180;
    const dx = x - cx;
    const dy = y - cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(lx) <= pw / 2 && Math.abs(ly) <= ph / 2) return i;
  }
  return -1;
}
