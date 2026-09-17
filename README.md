# HM Architect — Tangier

A cinematic portfolio site for HM Architect, an architecture and interiors
studio working between Tangier, Tétouan and Brussels.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # -> dist/
npm run preview  # serve the build
```

---

## What is here

| Page | Route | Notes |
| --- | --- | --- |
| Home | `index.html` | Hero sequence, founder, work grid, capability, contact, footer |
| Project | `project.html?p=<slug>` | Lays itself out from the project's image list |

Six projects, all the studio's own, defined in `src/data/projects.js`:

| Slug | Project | Plates |
| --- | --- | --- |
| `hopital-tetouan` | Hôpital Provincial de Tétouan | 4 (incl. concept diagram and plan), design proposal |
| `tangier-sky-ring` | Tangier Sky Ring | 3, square format |
| `smile-lab-brussels` | Smile Lab Brussels | 6, design proposal |
| `appartement-f3-brussels` | Appartement F3 — Brussels | 3, design proposal |
| `regard-opticien` | Regard Opticien | 3, renders |
| `mediatheque-tetouan` | Médiathèque de Tétouan | 6 (incl. plan and section), design proposal |

Every entry is a design proposal or in design — none is presented as built.
The categories a project can carry are `CATEGORIES` in the same file; each
shows on its project's tile in the grid.

## Imagery

Source images were supplied as screenshots from the studio's Instagram; Regard
Opticien, the hospital, the apartment and Smile Lab were later re-sourced from the studio's own 1080px
posts, which need no inpainting. They were processed once, offline, into
`public/assets/img/<slug>/`:

- **Carousel chrome removed** (screenshots only). The prev/next arrows and the
  dot indicators were inpainted out with ffmpeg's `delogo` filter rather than cropped, so the full
  frame is kept — these are only ~850px wide and every pixel counts. The
  positions were measured per image, and each source was checked for which
  controls it actually carried, so nothing was smudged that did not need it.
- **Graded, never sharpened.** A light contrast/saturation lift only. Rows
  marked `line` in the `JOBS` table — the hospital's concept diagram, the
  médiathèque's plan — get a milder grade, since a contrast boost would clip
  line art on white. There is deliberately no unsharp pass: the sources are
  Instagram JPEGs, already soft and already compressed, and sharpening them
  turns their compression artefacts into halos and grit. An earlier version of
  the pipeline did this and its full-bleed plates came out measurably worse
  than the files they were made from.
- **Two sizes per plate.** `NN.webp` at native resolution (WebP q94) for
  cards, galleries and splits; `NN-lg.webp` at exactly 2x with lanczos (q92)
  for the places that go full-bleed. A 1080 source gains no detail from the
  upscale, but one clean integer resample beats the browser stretching it live,
  and 2160px covers a 1920 display at 1.25 DPR without a second resample.

The pipeline is checked in at `tools/process-images.sh`, and `npm install`
brings in the ffmpeg it needs (`ffmpeg-static`). To add a project, drop its
originals in a folder next to `Borj / Dentist / Hopital / "Living Room" /
Opticien`, add its rows to the `JOBS` table — `0|0|0` for anything supplied
clean, a trailing `line` for drawings on white — and run it for that project alone so the others are not re-encoded:

```bash
ONLY=regard-opticien bash tools/process-images.sh
```

**Higher-resolution originals remain the single biggest quality win available
to this site.** Every plate is a 1080px Instagram export, and the hero fills a
1920 display at 1.25 DPR — 2400 device pixels. The pipeline now does nothing to
make that worse, but nothing can make it better except the studio's own
full-resolution renders. Ask for them.

## How the motion works

- **Loader → hero.** A small plate shuffles through the portfolio as each
  image finishes decoding, a counter tracks real progress, and when the last
  one lands the plate flies out to full bleed while the headline wipes up word
  by word (`src/js/loader.js`).
- **Hero.** Five full-bleed plates cross-cut on a timer under a deep scrim,
  each drifting on a slow Ken Burns move; the move lives in CSS so the class
  toggle restarts it, and `src/js/hero.js` only decides when to cut. Over it
  sits the logotype, then the French tagline, then the scroll cue.
- **The mark** (`src/js/mark.js`). The studio's signature lockup, used exactly
  as supplied — never redrawn, only vectorised. `mark.js` fetches `hma-mark.svg`
  and inlines it, so the signature's own contour can be lifted back out through
  a `<use>` and stroked. The reveal draws that contour on with a dash offset —
  one pen line signing itself across the frame — then floods the fill through
  it, at which point the name and tagline arrive, and retires the contour. If
  the fetch never lands the raster in the markup stands in and simply fades up;
  reduced motion skips straight to the finished mark.
- **The work grid** (`src/js/work.js`). Every project as one tile, three across:
  the plate full-bleed with a dark foot, and on the foot the city, the title and
  the category, read top to bottom like the label on a print. The plates are the
  2x `-lg` files — a tile is ~600px wide on a 1920 display, 1200 device pixels
  at 1.25 DPR, so the 2160 plate is downscaled rather than stretched. Tiles
  wipe in one after another as the grid arrives (`[data-clip]` now takes the
  same `--stagger` as `[data-reveal]`).

  Clicking a tile does not simply navigate. Its image is cloned into a fixed
  flyer and driven out to fill the screen while the page fades under it, and
  only then does the location change — so the project page's hero appears to be
  the same picture, arrived at rather than loaded. Modifier-clicks are left to
  the browser; reduced motion goes straight to the page.

  There is no category filter: with six projects, two of the categories hold a
  single one, and a chip that reveals one card is an anticlimax. The category
  still reads on every tile.
- **The founder's figures.** Three numbers in a ruled strip under the founder
  columns — projects, countries, team. The project count is read from the index
  by `initStats()` in `main.js` so it cannot drift from the grid; the other two
  are `data-count` attributes in `index.html`. Each number counts up from nought
  as the strip scrolls into view.
- **Project page rhythm**, following the supplied reference: a contained
  gallery plate held to a little over half the measure with numbered pagination
  under it; then a full-bleed plate paired with a small margin note set against
  a large statement offset well in from it; then an edge-to-edge two-up split
  with unequal columns, whose plates drift at different rates so the pair shears
  slightly as it passes. The gallery advances on its own until you touch it,
  then stops for good. Frame ratios come from the project (`--plate-ratio`), so
  the square Sky Ring plates are not letterboxed next to the wide ones.
- **Capability** — a quiet, type-only register after the grid: mono
  sheet numbers on their own rail, capability titles, descriptions, and
  hairlines that draw themselves in left to right as each row arrives. Nothing
  in it is clickable, so the hover is a nudge rather than the wash the project
  tiles use. Content is the list in `index.html` under `#capability`.
- **Reveals.** Everything arrives on scroll rather than being there already:
  `data-reveal` fades and lifts, `data-clip` wipes, `data-line` masks a line
  of type upward, and `data-stagger` on a container gives each of its own
  children a reveal with an increasing delay — so a fact table or a row of
  form fields comes in one item at a time without needing an attribute each.
  All of it is measured against the viewport on scroll.
- **Proximity.** `initProximity()` marks whichever element is nearest the
  middle of the screen with `.is-near`. The capability rows use it to light
  up as they pass — burgundy wash, title stepping right — so the register
  reads as something moving rather than a static table.

## Customising

**Projects.** Everything is in `src/data/projects.js` — copy, facts, category,
and the ordered `images` list. Add an entry and it appears in the grid, the
footer cycler, the founder's project count and its own detail page
automatically. The detail page adapts to
the number of plates: the two-up split only appears when there are at least
five, so a three-plate project never repeats an image.

The grid is three tiles across, two below 1024px and one below 760px — `.grid`
in `src/css/home.css`. Tiles are 5:4 (4:3 on a phone) with the plate
`object-fit: cover`, so a wide render and the square Sky Ring plate sit in the
same frame. The tile's first line is the city alone, split off the project's
`location` at the comma.

Mark an image `diagram: true` to keep it in the project gallery but out of the
small cycling slots, where line art reads as a blank card.

**Copy.** Project titles, locations and imagery are the studio's own. The
descriptive prose and the `facts` figures are placeholder editorial — replace
them before this goes live.

**The logo.** `public/assets/logo/` holds four files, plus the favicon at the
site root:

| File | What it is |
| --- | --- |
| `hma-original.jpg` | The artwork as the studio supplied it — its avatar: white signature lockup on a `#7c0028` disc, inside a white ring, 1080 square |
| `hma-mark.png` | The lockup keyed off the disc — transparent master, and the hero's fallback if the SVG never arrives |
| `hma-mark.svg` | The lockup as vector — signature, name, rule, tagline — and what the hero draws |
| `hma-sign.svg` | The signature alone, for the header |
| `/favicon.svg` | The avatar itself: disc, ring, signature at icon weight |

`npm run trace:mark` rebuilds all of them from the JPG. The artwork keys by
luminance — a flat plate at ~45/255 against ink at 240+, so a ramp between the
two takes the antialiased edge and nothing else — and the ring is dropped by
radius rather than traced, since it is a true circle and is drawn as one.

The lockup is traced in two passes because it is two kinds of drawing. The
signature is a 3–4px pen stroke in smooth curves, one continuous line; it
traces cleanly on a 2x grid with a loose curve fit. The name and tagline are
1–2px type at about 15px cap height; they want a 3x grid and a tighter fit or
the counters fill in. The two are separated by a rectangle, not a row band,
because the signature's descender runs down past the text on the left. The
traces are indistinguishable from the raster at hero size.

How large the mark sits in the hero is one value: `--mark-w` on `.hero__mark`
in `src/css/home.css`. The header size is `.header__logo img` in
`src/css/base.css` — it runs wider than a monogram would, because a signature
three times wider than it is tall needs the width to read at all.

**The favicon** is the avatar, which is what a tab icon is for. Two things a
16px slot forces. The ring is 13px in 1080 — a fifth of a pixel at 16 — so it
is drawn heavier than measured or it is not there. And the signature is a 3px
pen line; reduced honestly to 16px it is nothing, so `ICON_STROKE` thickens it
in its own units — the optical sizing a typeface does for small sizes. At 32px
the signature reads; at 16px it is the avatar, a white stroke in a white ring
on a burgundy disc, which is exactly what the studio's own Instagram icon is at
that size. Neither adjustment touches anything but the icon.

The mark is fetched with ordinary HTTP caching, deliberately not `force-cache`:
it is served under a fixed name, and a revised mark has to be able to reach a
browser that already holds the old one — as it did when the studio rebranded.

**The founder portrait.** `public/assets/founder/haytham-mribah.jpg` is the
photograph supplied for Haytham Mribah, wired to `#founderPortrait` in
`index.html`. The frame is a fixed 4:5 box with `object-fit: cover`, so a
differently-shaped replacement needs no manual crop — just swap the `src`.
The signature beneath the quote is the studio's own — `hma-sign.svg` painted
through a CSS mask so it takes the page's ink colour.

The hero's `<h1>` is the mark itself, with the studio name inside it as
`.sr-only` text so the page keeps a readable level-one heading.

**Contact form.** Validation is real; submission is not. Replace the body of
`send()` in `src/js/contact.js` with a POST to your endpoint, and delete the
note under the form.

**Contact details.** Address, email and phone appear in `index.html`,
`project.html` and the menu. The phone number is a placeholder.

**Colour and type.** Tokens are at the top of `src/css/base.css`. The scheme is
white with burgundy accenting it — roughly nine parts to one. White is the
ground everywhere; burgundy is reserved for the numbered section labels, the
badges, the giant `SEE WORK` line, hover and focus states, and the two
surfaces that take over the screen (the menu overlay and the cookie notice).
The contact section sits on `--paper-2`, a barely-there tint, so it reads as
its own band without going dark.

Even the ink and the hairlines carry a burgundy cast (`--ink` is a warm
near-black, `--line` is burgundy at low alpha), which is what makes the tint
read across the whole page while never occupying much of it. To reshade the
site, `--burgundy` and `--burgundy-deep` are the two values to change.

The display face is Archivo (variable width and weight) from Google Fonts.

## Behaviour worth knowing about

- **`prefers-reduced-motion`** is honoured throughout: the loader hands over
  instantly, reveals are skipped, the hero holds on one plate with no Ken Burns,
  and the gallery stops advancing on its own.
- **No JavaScript** — a `<noscript>` block neutralises the reveal states so
  nothing is stuck at `opacity: 0`.
- **Background tabs.** Browsers suspend `requestAnimationFrame` in a hidden tab.
  Anything purely rAF-driven would stall there, so the loader races rAF against
  a timer (`src/js/raf.js`), the reveal system measures rects on scroll rather
  than relying on `IntersectionObserver` callbacks, and the hero reveal has a
  timeout that snaps to the end state. A visitor who switches away mid-load
  comes back to a finished page.

## Stack

Vite · GSAP (with ScrollTrigger) · Lenis. No framework, no CSS library, and
about 62 kB of JavaScript gzipped.
