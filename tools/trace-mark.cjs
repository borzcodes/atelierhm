/**
 * Vectorise the studio mark — public/assets/logo/hma-mark.png -> hma-mark.svg
 *
 *   node tools/trace-mark.cjs
 *
 * The mark is two very different kinds of artwork sharing one file, and tracing
 * them the same way ruins one or the other:
 *
 *   - The HM monogram is a solid, fully opaque shape. A plain two-tone trace
 *     reproduces it almost exactly — 1.0% of pixels differ at 4x magnification,
 *     all of them on the antialiased edge.
 *   - The HAYTHAM MRIBAH ARCHITECTS subline is a half-pixel hairline that the
 *     supplied artwork carries at partial alpha, and unevenly: some stems are
 *     solid, the T's is a quarter covered. Traced at the monogram's threshold
 *     it falls apart — the T loses its stem, every diagonal breaks into dashes.
 *
 * So the subline is traced at a threshold permissive enough to keep every
 * stroke whole, and then given the one opacity at which its ink matches the
 * original's exactly. That opacity is measured here rather than guessed: total
 * alpha over the band, divided by the number of pixels the trace will cover.
 * Uniform coverage across a 10px-tall line is a distinction no display resolves,
 * and it costs one path instead of five.
 *
 * (Posterising the subline into five alpha bands is the textbook answer and is
 * kept behind --subMode=posterize, but potrace fills the counters of A and R
 * at these stroke widths, and the result runs 11% heavy and four times larger.)
 *
 * The raster masters stay in the repo: this is a derived file, and the artwork
 * as supplied remains the reference.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { PNG } = require('pngjs');
const Jimp = require('jimp');
const potrace = require('potrace');

const SRC = 'public/assets/logo/hma-mark.png';

const flag = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? Number(hit.split('=')[1]) : dflt;
};
const strFlag = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : dflt;
};

const OUT = strFlag('out', 'public/assets/logo/hma-mark.svg');
/* The compact lockup for the header — see where it is written, below. */
const MONO_OUT = strFlag('monoOut', 'public/assets/logo/hma-monogram.svg');

/* Coordinate precision in source pixels. The mark is drawn at most 620px wide,
   so a tenth of a pixel is already finer than any display can show. */
const PREC = 1;

/* The monogram traces on a 2x grid: potrace fits contours to pixels, so an
   upscale buys smoother curves. Its threshold — a potrace cut on the inverted
   greyscale, so 115 means alpha above about 140 — was set by matching total ink
   against the raster, which puts the traced monogram at 1.004x its weight. */
const MONO = {
  scale: flag('monoScale', 2),
  threshold: flag('monoThreshold', 115),
  turdSize: flag('monoTurd', 3),
  alphaMax: 0.35,
  optTolerance: 0.08,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

/* 200 counts a pixel as ink from about a fifth alpha up. Stricter and the T's
   stem — a quarter covered in the artwork — starts dropping out; looser and the
   antialiasing haze thickens the strokes until the A's counter closes. At 200
   the traced subline carries 100.5% of the original's ink. */
const SUB = {
  mode: strFlag('subMode', 'trace'),
  scale: flag('subScale', 1),
  threshold: flag('subThreshold', 200),
  turdSize: flag('subTurd', 1),
  alphaMax: flag('subAlpha', 0.35),
  optTolerance: flag('subOpt', 0.2),
  steps: flag('bands', 5),
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

/* ---------------------------------------------------------------- masks --- */

/**
 * The blank rows between the monogram and the subline. Found rather than
 * hard-coded, so re-running this after an artwork change cannot silently cut
 * the mark in the wrong place.
 */
function findSplit(png) {
  const { width: W, height: H, data } = png;
  const rowInk = [];
  for (let y = 0; y < H; y++) {
    let s = 0;
    for (let x = 0; x < W; x++) s += data[(y * W + x) * 4 + 3];
    rowInk.push(s);
  }
  let y = H - 1;
  while (y > 0 && rowInk[y] === 0) y--; // below the subline
  while (y > 0 && rowInk[y] > 0) y--; // the subline itself
  const gapBottom = y;
  while (y > 0 && rowInk[y] === 0) y--; // the gap above it
  if (y <= 0) throw new Error('no gap between monogram and subline');
  return Math.round((y + gapBottom) / 2);
}

/** Inverted greyscale of one horizontal band, everything else left blank. */
async function maskFile(png, y0, y1, file, scale) {
  const { width: W, height: H } = png;
  const out = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const v = y >= y0 && y < y1 ? 255 - png.data[i + 3] : 255;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
      out.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(file, PNG.sync.write(out));
  if (scale !== 1) {
    const img = await Jimp.read(file);
    img.resize(W * scale, H * scale, Jimp.RESIZE_BICUBIC);
    await img.writeAsync(file);
  }
  return file;
}

/** Total ink in a band, in whole-pixel equivalents. */
function bandInk(png, y0, y1) {
  const { width: W } = png;
  let ink = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < W; x++) ink += png.data[(y * W + x) * 4 + 3] / 255;
  }
  return ink;
}
/**
 * Flatten a path's contours into polygons. Every command potrace emits is
 * absolute M, L or C, so this only has to walk those three.
 */
function flatten(d) {
  const STEPS = 8;
  const rings = [];
  for (const sub of d.split(/(?=M)/)) {
    if (!sub.trim()) continue;
    const pts = [];
    let cur = null;
    const tokens = sub.match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
    let cmd = '';
    let nums = [];
    const take = (k) => {
      const out = [];
      while (nums.length >= k * 2) out.push(nums.splice(0, k * 2));
      return out;
    };
    const run = () => {
      if (cmd === 'M' || cmd === 'L') {
        for (const [x, y] of take(1)) {
          cur = [x, y];
          pts.push(cur);
        }
      } else if (cmd === 'C') {
        for (const [x1, y1, x2, y2, x, y] of take(3)) {
          const [x0, y0] = cur;
          for (let i = 1; i <= STEPS; i++) {
            const t = i / STEPS;
            const u = 1 - t;
            pts.push([
              u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
              u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
            ]);
          }
          cur = [x, y];
        }
      }
      nums = [];
    };
    for (const tk of tokens) {
      if (/^[A-Za-z]$/.test(tk)) {
        run();
        cmd = tk;
      } else nums.push(Number(tk));
    }
    run();
    if (pts.length >= 3) rings.push(pts);
  }
  return rings;
}

const bounds = (pts) => ({
  x0: Math.min(...pts.map((p) => p[0])),
  x1: Math.max(...pts.map((p) => p[0])),
  y0: Math.min(...pts.map((p) => p[1])),
  y1: Math.max(...pts.map((p) => p[1])),
});

/**
 * Area a traced path actually covers: shoelace every contour, then subtract
 * the ones nested inside another. The nesting has to be worked out rather than
 * read off the winding, because potrace turns its counters the same way round
 * as their letters — which is exactly why it asks for evenodd.
 */
function pathArea(d, scale) {
  const rings = flatten(d).map((pts) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      a += x1 * y2 - x2 * y1;
    }
    return { area: Math.abs(a) / 2, ...bounds(pts) };
  });

  const inside = (a, b) => a !== b && a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1;
  let total = 0;
  for (const r of rings) {
    const depth = rings.filter((o) => inside(r, o)).length;
    total += depth % 2 ? -r.area : r.area;
  }
  return total / (scale * scale);
}

/** The tight box a path occupies, measured off the flattened curves. */
function pathBBox(d) {
  const all = flatten(d).flat();
  if (!all.length) throw new Error('empty path');
  return bounds(all);
}


/* ----------------------------------------------------------------- trim --- */

/** Rescale back to source pixels, round, and drop the separators potrace
    leaves behind. Worth about two thirds of the payload on its own. */
function tidy(d, scale) {
  const n = (v) => {
    let s = (v / scale).toFixed(PREC);
    s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  };
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
  let out = '';
  let cmd = '';
  let pair = [];
  let run = [];
  const flush = () => {
    if (run.length) out += cmd + run.join(' ');
    run = [];
  };
  for (const tk of tokens) {
    if (/^[A-Za-z]$/.test(tk)) {
      flush();
      cmd = tk;
      if (tk === 'Z' || tk === 'z') out += 'Z';
      continue;
    }
    pair.push(Number(tk));
    if (pair.length === 2) {
      run.push(n(pair[0]) + ' ' + n(pair[1]));
      pair = [];
    }
  }
  flush();
  return out;
}

const readPaths = (svg, scale) =>
  [...svg.matchAll(/<path([^>]*?)\sd="([^"]+)"/g)].map((m) => ({
    opacity: Number((m[1].match(/fill-opacity="([^"]+)"/) || [, 1])[1]),
    d: tidy(m[2], scale),
  }));

const trace = (src, opts) =>
  new Promise((res, rej) =>
    potrace.trace(src, { ...opts, color: '#000' }, (e, s) => (e ? rej(e) : res(s)))
  );

const posterize = (src, opts) =>
  new Promise((res, rej) =>
    potrace.posterize(
      src,
      {
        ...opts,
        color: '#000',
        background: 'transparent',
        fillStrategy: potrace.Posterizer.FILL_DOMINANT,
        rangeDistribution: potrace.Posterizer.RANGES_AUTO,
      },
      (e, s) => (e ? rej(e) : res(s))
    )
  );

/* ------------------------------------------------------------------ run --- */

(async () => {
  const png = PNG.sync.read(fs.readFileSync(SRC));
  const { width: W, height: H } = png;
  const split = findSplit(png);

  const tmp = (name) => path.join(os.tmpdir(), 'hma-' + name + '.png');
  const monoSrc = await maskFile(png, 0, split, tmp('mono'), MONO.scale);
  const subSrc = await maskFile(png, split, H, tmp('sub'), SUB.scale);

  const mono = readPaths(await trace(monoSrc, MONO), MONO.scale);

  let sub;
  if (SUB.mode === 'posterize') {
    sub = readPaths(await posterize(subSrc, SUB), SUB.scale);
  } else {
    sub = readPaths(await trace(subSrc, SUB), SUB.scale);
    const ink = bandInk(png, split, H);
    const area = sub.reduce((a, p) => a + pathArea(p.d, 1), 0);
    const opacity = Math.min(1, Math.round((ink / area) * 1000) / 1000);
    sub = sub.map((p) => ({ ...p, opacity }));
    console.log(
      'subline: ' + ink.toFixed(0) + ' ink px over ' + area.toFixed(0) +
        ' traced px -> fill-opacity ' + opacity
    );
  }

  /* Both regions are labelled, for different reasons. The monogram carries an
     id because the hero references it through <use> to draw the mark in. The
     subline carries a class because the page has to reach it with CSS and give
     it a hinting stroke — see .mark__sub in home.css.

     Its coverage goes on as `opacity` rather than `fill-opacity` so that the
     stroke inherits it too, and so that fill and stroke composite before being
     faded: with separate opacities the two would double-darken where they
     overlap, and the letterforms would gain a rim. */
  const body = [
    ...sub.map(
      (p) =>
        '<path class="mark__sub"' +
        (p.opacity < 1 ? ' opacity="' + p.opacity + '"' : '') +
        ' d="' + p.d + '"/>'
    ),
    ...mono.map((p) => '<path d="' + p.d + '" id="markSolid"/>'),
  ].join('\n');

  /* evenodd is not decoration: potrace winds a counter the same way round as
     the letter that holds it, so under the default nonzero rule every A, R and
     B fills solid. */
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H +
    '" fill="currentColor" fill-rule="evenodd">\n' + body + '\n</svg>\n';

  fs.writeFileSync(OUT, svg);

  /* The small lockup. Below about 120px the subline is a grey smear rather
     than words, so the compact mark is the monogram on its own, cropped to
     its own bounds — the full artwork carries 20% empty height under it,
     which would leave the header logo floating. Same path, no redraw.

     currentColor with a white default: as an <img> it paints white, which is
     what the header wants under its difference blend, and inlined anywhere
     else a CSS color property still overrides it. */
  const b = pathBBox(mono[0].d);
  const r = (v) => Math.round(v * 10) / 10;
  const monoSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    [r(b.x0), r(b.y0), r(b.x1 - b.x0), r(b.y1 - b.y0)].join(' ') +
    '" fill="currentColor" color="#fff" fill-rule="evenodd">\n' +
    '<path d="' + mono[0].d + '"/>\n</svg>\n';
  fs.writeFileSync(MONO_OUT, monoSvg);

  [monoSrc, subSrc].forEach((f) => fs.unlinkSync(f));

  const kb = (s) => (s.length / 1024).toFixed(1);
  console.log('source ' + W + 'x' + H + ', split at y=' + split);
  console.log(
    OUT + ' — ' + kb(svg) + ' kB: monogram ' + kb(mono[0].d) + ' kB, subline ' +
      kb(sub.map((p) => p.d).join('')) + ' kB in ' + sub.length +
      (sub.length === 1 ? ' path' : ' paths')
  );
  console.log(
    MONO_OUT + ' — ' + kb(monoSvg) + ' kB: monogram only, cropped to ' +
      r(b.x1 - b.x0) + 'x' + r(b.y1 - b.y0)
  );
})();
