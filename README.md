[![Make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Cover Studio — GTA 6 Cover Art Maker

A photo and a caption, made into a cinema-poster GTA 6 cover — entirely in your
browser, 100% offline, no upload. Pick a layout, crop each panel, choose a grade,
and export a PNG in 1080 × 1080, 1080 × 1350 or 1920 × 1080 with one click.

## What it does

- **9 layouts** — Vice (hero + 2 stacked), Trio, Duo, Hero 6 (big hero + 5 small),
  Quad, Strip, Cross, Tilt (scattered snapshots) and Grid 9. Every panel has its
  own explicit crop, so no two panels show the same photo the same way.
- **Cinema-poster finish** — a huge gradient title (never cut off, hard shadow +
  thick outline), a halftone band behind it, a film billing block, a circular
  LEONIDA seal, annotation callouts with leader lines, a sunset sky with sun glow,
  a skyline with lit windows, palm silhouettes, grain and a vignette.
- **5 grades** — Sunset, Neon, Vice, Golden and Dusk (indigo → orange).
- **Any photo** — two sample photos built in, or upload your own (FileReader, kept
  on your machine). Per-panel crop: zoom 1–2.2, pan ±0.9, Face / Detail / Wide
  presets. Click a panel to select it, drag it to pan.
- **Fast** — undo/redo, live preview, one-click PNG export in all three post sizes.

## Run it

```sh
node serve.ts        # app/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`).

## Screenshots

1. `1-cover.jpg` — the best exported cover (landscape, Hero 6, Sunset).
2. `2-editor.jpg` — the editor with a photo loaded, panels and controls.
3. `3-cover-portrait.jpg` — a portrait cover (Trio, Neon).
4. `4-cover-square.jpg` — a square cover (Quad, Dusk).

## Honesty

All art, lettering and photos are our own or free to use (the two sample photos
were made for make.fun). No Rockstar Games logo, artwork or font anywhere.
