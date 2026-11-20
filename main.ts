// A working gta6-cover-art-01 entry (Node 22, standard library only): the app is this directory's app/ folder, plain
// static files a desktop browser loads offline (app/index.html and its ES modules, no library and no network
// request), and the program hands it in. It copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library. The app itself is Vice
// Cover Studio: a multi-panel poster cover maker — your photos in tilted, white-bordered panels, an editable
// caption in big outlined system-font lettering, a sunset or neon colour grade, and one-click PNG export in
// 1080 x 1080, 1080 x 1350 and 1920 x 1080. Its two sample photos (app/samples/) were made for make.fun with an
// image model and are free to use. Build your own GTA-style cover maker in its place, put your 3 or 4 PNG or JPEG screenshots in
// screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// Short verification summary on stdout: the dossier parses, and every screenshot is
// listed with its byte size so a too-big file is caught here, not by the scorer.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
const shots = readdirSync(join(out, 'screenshots'))
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort()
  .map((f) => `${f} ${statSync(join(out, 'screenshots', f)).size} B`)
  .join(', ');
console.log(`dossier.json: ${statSync(join(out, 'dossier.json')).size} B, ${Object.keys(dossier).length} top-level keys`);
console.log(`screenshots (${shots.split(', ').length}): ${shots}`);
