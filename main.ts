// Vice Cover Studio — the entrypoint the grader runs (Node 22, stdlib only).
// It assembles /output from the files beside this one: the offline app in
// app/, the four screenshots in screenshots/, and dossier.json, the summary
// the judge reads, built with the vendored make.fun helper.
//
// Local run (MAKEFUN_OUTPUT_DIR stands in for /output outside the grader):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyDir(name) {
  const from = join(ROOT, name);
  const to = join(OUT, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(OUT, { recursive: true });
copyDir('app');
copyDir('screenshots');

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the rest refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB
// of app files in all; or any app/ path over 1000 bytes.
writeFileSync(
  join(OUT, 'dossier.json'),
  buildDossier(OUT, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
