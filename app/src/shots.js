// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor shows
// the full editor with a sample loaded. Query knobs: photo, photo2, title (or caption),
// subtitle, layout, grade, size, panel (selected panel index) and map (comma list of
// sample names, one per panel). window.__shotReady is set once the scene has painted.
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
  await api.applyScene(scene);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
