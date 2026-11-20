// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor shows
// the full editor with a sample loaded. Query knobs: photo, photo2, title (or caption),
// subtitle, layout, grade, size, panel (selected panel index), map (comma list of
// sample names, one per panel), zooms (comma list, one zoom per panel) and pans
// (comma list of x:y pairs, one pan per panel — pan up to keep a face in a wide
// panel, zoom in for a detail crop so two panels never read as the same photo).
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, api) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const title = query.get('title') ?? query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'One last score';
  const photos = [query.get('photo') ?? 'pier', query.get('photo2') ?? 'boulevard'];
  const scene = {
    title,
    subtitle,
    layout: query.get('layout') ?? 'hero-duo',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1920x1080',
    photos,
    selectedPanel: Number(query.get('panel') ?? (shot === 'editor' ? 1 : 0)),
  };
  const map = query.get('map');
  if (map) scene.photoMap = map.split(',');
  const zooms = query.get('zooms');
  if (zooms) scene.zooms = zooms.split(',').map((v) => Number(v));
  const pans = query.get('pans');
  if (pans) {
    scene.pans = pans.split(',').map((pair) => {
      const [x, y] = pair.split(':').map((v) => Number(v));
      return { ox: x || 0, oy: y || 0 };
    });
  }
  await api.applyScene(scene);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
