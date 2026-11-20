[![Make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Cover Studio — GTA 6 Cover Art Maker

Make a GTA-style multi-panel cover in about a minute, entirely in your
browser. Pick a layout, give each panel a photo, crop it with a preset or
by dragging, choose a colour grade, type a caption, and export a PNG.
Your photos never leave the page — there is no server and no upload.

[Enter the bounty on make.fun](https://make.fun/bounty/gta6-cover-art-01)

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` straight from the folder — it is plain static
files (ES modules, no libraries, no network requests).

## What it does

- **Multi-panel covers** — three layouts (Vice, Trio, Duo). Every panel
  has its own explicit crop, so no two panels show the same framing.
- **Crop and position** — presets Face / Detail / Wide, zoom and pan
  sliders (±0.9, wide enough to pull a face into a 2:1 panel), or drag
  the photo inside the frame. Click a panel to select it.
- **Five colour grades** — Sunset, Neon, Palm, Vice, and the new Dusk
  (indigo sky melting into orange), each with its own sky, sun glow and
  photo tint.
- **Bold lettering that never clips** — the title size is bounded by the
  band's width *and* height, with a hard shadow and a thick outline, on
  a baseline at 0.945 of the cover height. The studio credit sits below
  it, clear of every frame.
- **Sunset world around the panels** — glowing sun, a skyline with lit
  windows, and palm silhouettes framing the cover.
- **One-click PNG export** — 1080×1080, 1080×1350, or 1920×1080. One
  click — the PNG downloads at once.
- **100% offline · no upload** — photos are read with FileReader and
  stay in the browser. Two sample photos ship in `app/samples/`.

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes
`out/dossier.json`, the summary the judge reads.

## Screenshots

| File | Scene |
| --- | --- |
| `screenshots/1-cover.jpg` | Best exported cover, landscape (Sunset, Vice layout) |
| `screenshots/2-editor.jpg` | The editor with a photo loaded, export card visible |
| `screenshots/3-cover-portrait.jpg` | Portrait cover, neon Trio layout |
| `screenshots/4-cover-square.jpg` | Square cover, Dusk grade, Duo layout |

## Files

- `app/index.html` — editor page
- `app/style.css` — sunset / neon theme
- `app/src/cover.js` — pure canvas renderer (sky, panels, title)
- `app/src/main.js` — editor wiring (controls, drag, export)
- `app/src/shots.js` — fixed screenshot scenes from `?shot=`
- `shots.json` — the four screenshot scenes and sizes
- `main.ts` — builds `dossier.json` for the grader

No Rockstar logos, wordmarks, artwork or fonts are used anywhere —
the lettering is a system font stack with outline and shadow.
