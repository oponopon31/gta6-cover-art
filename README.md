[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Cover Studio — GTA 6-style cover art maker

Turn your own photos into a GTA 6-style cinema poster: a multi-panel key-art
grid over a sunset sky, a huge chrome title, a movie tagline, a script
subtitle, a 3-line billing block, a LEONIDA seal, callouts, and a SPECIAL
EDITION ribbon. Free, in the browser, 100% offline — your photos never leave
your device.

## What it does

- **12 layouts** — Vice, Trio, Duo, Hero 6, Quad, Strip, Cross, Tilt, Grid 9,
  Crown, Marquee, Split (diagonal hero). Click a panel to select it.
- **5 colour grades** — Sunset, Neon, Vice, Ocean, Dusk. Each grade re-tints
  the sky, the sun, the title chrome, and the photo tint.
- **Per-panel crops** — Face / Detail / Wide / Sky presets, plus pan (±0.9)
  and zoom (1–2.4×) sliders. Every panel has its own explicit crop, so no
  two panels show the same photo the same way.
- **Poster dressing** — tagline under the panels ("EVERY LEGEND HAS A
  PRICE"), neon script subtitle ("A LEONIDA STORY"), 3-line billing block
  (studio, cast, crew, rating), circular LEONIDA seal, 3 callouts with
  leader lines, SPECIAL EDITION ribbon, grain and vignette.
- **One-click PNG export** — Square 1080×1080, Portrait 1080×1350,
  Wide 1920×1080. The selection frame never appears in the export.
- **Undo / redo** — buttons and Ctrl+Z / Ctrl+Y.
- **2 sample photos** — boulevard (sunset, red convertible) and pier
  (fisherman, turquoise sea), free to use, in `app/samples/`.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Pick a photo, type a title and tagline, choose a layout and a grade, crop
the panels, and export. Three steps to a PNG.

## Build

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/ holds app/, screenshots/, and dossier.json
```

## Screenshots

1. Hero 6 + Sunset cover, "SUNSET HEIST" (landscape)
2. Editor with a photo loaded (Vice + Neon)
3. Crown + Dusk cover, "NEON NIGHTS" (portrait)
4. Marquee + Vice cover, "VICE CITY" (square)

## Notes

- No Rockstar logos, wordmarks, artwork, or fonts. Titles use the system
  font stack (Arial Black / Impact) with an outline, hard shadow, and rim.
- No network requests: the app is plain static files and runs fully offline.
