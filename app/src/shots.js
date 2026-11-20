// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo and
// the Export card in view; ?shot=cover shows the cover alone, full frame.
// `photo` picks the sample for the hero panel, `caption` the words, `layout` and
// `grade` the look, `scroll` the page offset for the editor shot.
// window.__shotReady is set once painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const layout = query.get('layout') ?? 'vice';
  const grade = query.get('grade') ?? 'sunset';
  await load(`samples/${photo}.jpg`, caption, layout, grade);
  const scroll = Number(query.get('scroll') ?? '0');
  if (scroll) window.scrollTo(0, scroll);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
