// shots.js — fixed scenes for screenshots, driven by the ?shot= query.
// The editor reads the same params on load, so a screenshot URL always
// reproduces the exact scene: which photo, which caption, which grade,
// which layout. Nothing here touches the network.
//
//   ?shot=cover&photo=pier&caption=SUNSET%20HEIST&grade=sunset&layout=vice
//   ?shot=editor&photo=boulevard&caption=BOULEVARD%20QUEEN&grade=neon&layout=vice
//
// cover mode hides the editor chrome (body gets .shot-cover) and sizes the
// canvas to the viewport, so the shot is the exported cover itself.
// editor mode keeps the full editor and scrolls the export card into view.

export const SAMPLE_SRC = {
  pier: 'samples/pier.jpg',
  boulevard: 'samples/boulevard.jpg',
};

export function readShotParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    mode: q.get('shot') || '',
    photo: q.get('photo') || 'pier',
    caption: q.get('caption') || '',
    grade: q.get('grade') || '',
    layout: q.get('layout') || '',
  };
}

// Apply a shot's params to a fresh default state. The `photo` param names
// the hero photo; the second panel gets the other sample with the Face
// crop. The third panel always uses the boulevard photo with the Detail
// crop — that preset is tuned for the red car door, mirror and hand, and
// it turns any other photo into a meaningless close-up.
export function applyShotParams(state, params) {
  const hero = params.photo === 'boulevard' ? 'boulevard' : 'pier';
  const other = hero === 'pier' ? 'boulevard' : 'pier';
  if (params.caption) state.title = params.caption.toUpperCase();
  if (params.grade) state.grade = params.grade;
  if (params.layout) state.layout = params.layout;
  state.panels = [
    { src: hero, zoom: 1.15, ox: 0, oy: 0.5 },
    { src: other, zoom: 1.15, ox: 0, oy: 0.7 },
    { src: 'boulevard', zoom: 1.9, ox: 0.55, oy: -0.45 },
  ];
  return state;
}

// Default state for a normal (non-shot) visit: the Vice layout, Sunset
// grade, pier hero on the left, boulevard face top-right, boulevard car
// door detail bottom-right.
export function defaultState() {
  return {
    title: 'SUNSET HEIST',
    layout: 'vice',
    grade: 'sunset',
    panels: [
      { src: 'pier', zoom: 1.15, ox: 0, oy: 0.5 },
      { src: 'boulevard', zoom: 1.15, ox: 0, oy: 0.7 },
      { src: 'boulevard', zoom: 1.9, ox: 0.55, oy: -0.45 },
    ],
  };
}

// After the scene is rendered, position the page for the shot. Cover mode
// needs no scroll; editor mode scrolls so the whole export card is in view.
export function positionForShot(mode) {
  if (mode === 'editor') {
    window.scrollTo(0, 460);
  }
}
