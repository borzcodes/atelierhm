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
| Home | `index.html` | Hero sequence, founder, work slider, capability, contact, footer |
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
The categories a project can carry are `CATEGORIES` in the same file; the
work slider only shows a filter chip for categories that have a project in
them, so an empty one costs nothing.

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
- **The mark** (`src/js/mark.js`). The logotype is the studio's own artwork,
  used exactly as supplied — it is never redrawn, only vectorised. `mark.js`
  fetches `hma-mark.svg` and inlines it, so the monogram's own contour can be
  lifted back out through a `<use>` and stroked. The reveal draws that contour
  on with a dash offset, as though the letters were being set out on a drawing
  board, then floods the fill through it and retires the contour. The subline
  is a hairline already and arrives with the fill. If the fetch never lands the
  raster in the markup stands in and simply fades up; reduced motion skips
  straight to the filled mark.
- **The work slider** (`src/js/work.js`). A card deck seen in perspective:
  the active project stands square to the viewer while the rest fall away to
  the side, shrinking and turning as they go. Each card is a mounted print —
  image, category, title, place and year — and the category filter above it
  rebuilds the deck in place.

  Position is a float rather than an index, and a lerp loop eases it towards
  a target, so the deck follows a gesture continuously instead of tweening
  between fixed states.

  **Two fingers on a trackpad move it**, whichever way they travel — the
  dominant axis wins, so a horizontal swipe and a vertical one both work. The
  deck only takes the gesture while it still has somewhere to go: at either
  end the wheel event is left alone, so the page carries on scrolling and
  nobody gets stuck inside the carousel. Drag, the arrows and the keyboard
  work too; clicking a card off to the side brings it forward, and clicking
  the one in front flies it out to fill the screen before the page changes.

  The 3D is CSS perspective rather than WebGL, deliberately: the captions
  rotate with their cards, and real text stays sharp in a way a texture cannot.
  `layout()` owns every card's transform, opacity and z-index — nothing else
  should animate those three properties.
- **Project page rhythm**, following the supplied reference: a contained
  gallery plate held to a little over half the measure with numbered pagination
  under it; then a full-bleed plate paired with a small margin note set against
  a large statement offset well in from it; then an edge-to-edge two-up split
  with unequal columns, whose plates drift at different rates so the pair shears
  slightly as it passes. The gallery advances on its own until you touch it,
  then stops for good. Frame ratios come from the project (`--plate-ratio`), so
  the square Sky Ring plates are not letterboxed next to the wide ones.
- **Capability** — a quiet, type-only register after the dark deck: mono
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
and the ordered `images` list. Add an entry and it appears in the deck, the
footer cycler and its own detail page automatically. The detail page adapts to
the number of plates: the two-up split only appears when there are at least
five, so a three-plate project never repeats an image.

The deck's proportions come from `measure()` in `src/js/work.js`: card width
is a fraction of the stage, and the horizontal step, the depth between cards
and the perspective are all derived from it, so the arrangement holds from a
phone up to a wide desktop.

Mark an image `diagram: true` to keep it in the project gallery but out of the
small cycling slots, where line art reads as a blank card.

**Copy.** Project titles, locations and imagery are the studio's own. The
descriptive prose and the `facts` figures are placeholder editorial — replace
them before this goes live.

**The logo.** `public/assets/logo/` holds five files:

| File | What it is |
| --- | --- |
| `hma-original.jpg` | The supplied artwork, untouched, on its burgundy plate |
| `hma-mark.png` | The mark lifted off that plate — transparent, lossless master |
| `hma-mark.webp` | The same, 7 kB — the fallback if the SVG never arrives |
| `hma-mark.svg` | The traced mark, 24 kB, and what the hero actually draws |
| `hma-monogram.svg` | The monogram alone, cropped to its own bounds — the header logo |

The mark was cropped to its own bounds and keyed off the background by
luminance: the burgundy tops out at 80/255 while the mark is pure white, so a
threshold at 88 removes the plate without touching a single hairline, and RGB
is forced to white so no burgundy fringes the antialiased edges. The
letterforms themselves are untouched.

`npm run trace:mark` regenerates the SVG from the PNG. It traces the mark in
two passes, because the file holds two very different kinds of artwork: the
monogram is solid and traces two-tone almost exactly, while the
HAYTHAM MRIBAH ARCHITECTS subline is a half-pixel hairline carried at partial
alpha, which at the monogram's threshold loses the T's stem outright and breaks
every diagonal into dashes. So the subline is traced at a threshold loose
enough to keep each stroke whole and then given the one opacity at which its
ink matches the original — measured, not guessed, from the band's total alpha
over the area the trace covers. Against the raster the result carries 99.4% of
the monogram's ink and 100.5% of the subline's, with 1.2% of pixels differing
at 4x magnification, all of them on antialiased edges. The raster masters stay
in the repo: the SVG is derived, and the artwork as supplied is the reference.

How large it sits in the frame is one value: `--mark-w` on `.hero__mark` in
`src/css/home.css`.

**The subline is hinted, and has to be.** `HAYTHAM MRIBAH ARCHITECTS` is drawn
one source pixel wide, and the hero renders the mark at roughly two thirds size
— which puts those strokes at 0.84 of a device pixel. Under a pixel the browser
antialiases them to grey and any stroke straddling a pixel boundary all but
vanishes, so the line reads faded and gap-toothed with the T stems missing.
This is not a defect of the trace: rendered at the same size, the supplied
raster breaks in exactly the same places. The artwork itself is sub-pixel here.

`.mark__sub` in `src/css/home.css` answers it the way a typeface hints a stem
that falls below a pixel — 0.7px of `vector-effect: non-scaling-stroke`, which
does not shrink with the artwork, so it holds every stroke at a full pixel
however small the mark is drawn and stays a rounding error against the
monogram's much heavier letterforms. Coverage rides on the path's own
`opacity` (not `fill-opacity`) so fill and stroke composite as one and no rim
forms where they meet. The monogram needs none of this — its stems are heavy
enough to survive even at header size.

**The favicon** (`public/favicon.svg`, also written by `npm run trace:mark`) is
the same monogram on a burgundy disc. It needs two things the logotype does
not. A ground, because a favicon slot is 16px of whatever the browser puts
behind it, and a disc reads as a deliberate object at that size where a bare
wordmark reads as debris. And weight: reduced honestly to 16px the hairlines
land at about a fifth of a pixel and disappear — side by side, the plain
reduction is illegible at every size a tab actually uses. So the icon carries
`ICON_STROKE` of extra weight in the mark's own units, which is the optical
sizing a type designer does for small text; the shape, the swash and the
counters all survive, they simply carry more ink. It applies to the icon alone
— the logotype is never redrawn.

There is no PNG fallback. Every current browser renders SVG favicons; add
`apple-touch-icon` PNGs if iOS home-screen icons ever matter.

The header runs the monogram rather than the full lockup: under about 120px the
subline stops being words and becomes a grey smear, and the full artwork carries
a fifth of its height as empty space beneath it, which would leave the header
logo floating. So `hma-monogram.svg` is the same traced path cropped to its own
bounds — nothing redrawn. It is white artwork, which is what the header's
`difference` blend wants (it inverts to dark over the white page on its own) and
what the burgundy menu wants when that blend is switched off. Its size is
`.header__logo img` in `src/css/base.css`.

**The founder portrait.** `public/assets/founder/haytham-mribah.jpg` is the
photograph supplied for Haytham Mribah, wired to `#founderPortrait` in
`index.html`. The frame is a fixed 4:5 box with `object-fit: cover`, so a
differently-shaped replacement needs no manual crop — just swap the `src`.
The drawn signature above it is a placeholder mark, not a real one.

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
