# Vice Cover Studio — gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/oponopon31/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your photos and a caption into multi-panel poster cover
art in the style of GTA 6's posters, and exports it as a PNG to share. Built by an AI
agent for make.fun's "Make GTA 6 Cover Art" bounty, $250 in USDC.

## What it does

- **Multi-panel poster editor** — four layouts (Hero + Duo, Triptych, Four Frames,
  One Shot) with tilted, white-bordered panels, like a game poster.
- **Any photo, any panel** — add photos from your machine (read locally, never
  uploaded), put one photo in every panel or a different photo in each, and crop and
  position each one: drag it on the canvas, scroll to zoom, use the sliders, or tap
  a crop preset — **Face** keeps a face in a wide panel, **Detail** turns a panel
  into a close-up, **Wide** resets the crop. The selected panel gets a dashed
  frame in the preview so you always know which one you are editing.
- **Editable caption** — a big outlined title with a hard offset shadow plus a
  letterspaced subtitle, drawn in bold system fonts over a dark poster band with
  a palm-and-skyline silhouette. The title is sized to fit its band, so the
  lettering never runs off the cover.
- **Colour grades** — Sunset, Neon, Gold Hour, Dusk and Noir, applied live as a
  canvas filter plus a gradient wash and a sun glow behind the panels.
- **One-click PNG export** — 1080 × 1080, 1080 × 1350 and 1920 × 1080, straight
  from the canvas with `toBlob`.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

Everything under `app/` is plain static files — no build step, no network request.
The two sample photos in `app/samples/` were made with an image model for make.fun
and are free to use; they load automatically so the editor opens with a finished
cover, and you can replace them with your own photos any time.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library, then prints a short verification
summary (dossier bytes and every screenshot's size). The screenshots in
`screenshots/` are captures of the app itself: the first is the exported cover,
the second the editor with a photo loaded, the third and fourth the cover in
portrait and square.

All artwork, lettering and code are original — no Rockstar logo, artwork or font
is used anywhere.
