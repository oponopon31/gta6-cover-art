// Fixed scenes for screenshots: ?shot=cover shows the cover alone at the
// window size; ?shot=editor shows the editor with a sample photo loaded.
// Query params: photo (boulevard|pier), caption, tagline, layout, grade, size.
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'boulevard';
  const opts = {
    caption: query.get('caption') ?? 'Sunset Heist',
    tagline: query.get('tagline') ?? 'EVERY LEGEND HAS A PRICE',
    layout: query.get('layout') ?? 'hero6',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? 'square',
  };
  await load(`samples/${photo}.jpg`, opts);
  // Let the cover paint at the window size before the screenshot is taken.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    requestAnimationFrame(() => { window.__shotReady = true; });
  }));
}
