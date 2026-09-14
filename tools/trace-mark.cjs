/**
 * Vectorise the studio mark — public/assets/logo/hma-original.jpg -> the SVGs
 *
 *   node tools/trace-mark.cjs
 *
 * The source is the signature lockup the studio supplied as its avatar: white
 * artwork on a flat #7c0028 disc, inside a white ring, 1080 square. Four
 * files come out of it:
 *
 *   hma-mark.png   the lockup keyed off the disc — transparent raster master,
 *                  and what the hero falls back to if the SVG never arrives
 *   hma-mark.svg   the lockup as vector: signature, name, rule, tagline
 *   hma-sign.svg   the signature alone, for the header
 *   favicon.svg    the avatar itself — disc, ring, signature at icon weight
 *
 * The lockup is traced in two passes because it is two kinds of drawing. The
 * signature is a 3-4px pen stroke, smooth curves, one continuous line; it
 * traces cleanly at 2x with a loose curve fit. The name and tagline are 1-2px
 * type at ~15px cap height — they need a 3x grid and a tighter fit or the
 * counters fill in. The rule between them is solid and goes with the type.
 * The two regions are separated by a rectangle, not a row band, because the
 * signature's descender runs down past the text on the left.
 *
 * The ring is not traced: it is a true circle, so it is drawn as one, at a
 * radius and thickness measured off the source.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { PNG } = require('pngjs');
const Jimp = require('jimp');
const potrace = require('potrace');

const SRC = 'public/assets/logo/hma-original.jpg';
const OUT = {
  master: 'public/assets/logo/hma-mark.png',
  mark: 'public/assets/logo/hma-mark.svg',
  sign: 'public/assets/logo/hma-sign.svg',
  icon: 'public/favicon.svg',
};

/* The brand colours, as they are in the artwork. Literals, because an SVG
   served as its own file cannot see the stylesheet. */
const BURGUNDY = '#7c0028';
const WHITE = '#ffffff';

/* Coordinate precision in source pixels. */
const PREC = 1;

/* Where the type sits, in source pixels — measured, and clear of the signature
   on every side (the signature's descender bottoms out at x≈330). */
const TEXT = { x0: 370, y0: 585, x1: 860, y1: 650 };

/* Anything this far from the centre is the ring, not the lockup. */
const RING_CUT = 465;

const SIG = {
  scale: 2,
  threshold: 128,
  turdSize: 4,
  alphaMax: 1.0,
  optTolerance: 0.2,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};
const TYPE = {
  scale: 3,
  threshold: 128,
  turdSize: 3,
  alphaMax: 0.6,
  optTolerance: 0.15,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
};

/* ----------------------------------------------------------------- key --- */

/**
 * White artwork on a flat dark plate keys by luminance. The plate tops out
 * around 45/255 and the ink sits at 240+, so a ramp between them takes the
 * antialiased edge with it and touches nothing else.
 */
function keyAlpha(img) {
  const { width: W, height: H, data } = img.bitmap;
  const alpha = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const k = i * 4;
    const lum = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
    alpha[i] = Math.max(0, Math.min(255, Math.round(((lum - 70) / 120) * 255)));
  }
  return { W, H, alpha };
}

/** The ring's centre-line radius and thickness, read off the centre row —
    only its outer stretch, since the signature's flourish crosses that row too. */
function measureRing({ W, alpha }, cy) {
  const hits = [];
  for (let x = 0; x < W / 2 - RING_CUT; x++) if (alpha[cy * W + x] > 128) hits.push(x);
  if (!hits.length) throw new Error('no ring found on the centre row');
  const outer = W / 2 - hits[0];
  const inner = W / 2 - hits[hits.length - 1];
  return { r: (outer + inner) / 2, w: outer - inner };
}

/* --------------------------------------------------------------- masks --- */

const inRect = (x, y, r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

/**
 * Inverted greyscale (potrace reads dark as ink) of the pixels `keep` admits,
 * everything else blank, resampled to `scale`.
 */
async function maskFile({ W, H, alpha }, keep, file, scale) {
  const out = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const v = keep(x, y) ? 255 - alpha[i] : 255;
      out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = v;
      out.data[i * 4 + 3] = 255;
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

/* ------------------------------------------------------------ geometry --- */

/** Flatten a path's contours into polygons; potrace only emits M, L, C. */
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

/** The tight box a path occupies, measured off the flattened curves. */
function pathBBox(d) {
  const all = flatten(d).flat();
  if (!all.length) throw new Error('empty path');
  return bounds(all);
}

/* ---------------------------------------------------------------- trim --- */

/** Rescale to source pixels, round, and drop the separators potrace leaves. */
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

const trace = (src, opts) =>
  new Promise((res, rej) =>
    potrace.trace(src, { ...opts, color: '#000' }, (e, s) => (e ? rej(e) : res(s)))
  );

const pathOf = (svg, scale) => tidy(svg.match(/\sd="([^"]+)"/)[1], scale);

const r1 = (v) => Math.round(v * 10) / 10;
const vb = (b, pad = 1) =>
  [r1(b.x0 - pad), r1(b.y0 - pad), r1(b.x1 - b.x0 + 2 * pad), r1(b.y1 - b.y0 + 2 * pad)].join(' ');

/* ------------------------------------------------------------------ run --- */

(async () => {
  const img = await Jimp.read(SRC);
  const key = keyAlpha(img);
  const { W, H, alpha } = key;
  const cx = W / 2;
  const cy = H / 2;

  const ring = measureRing(key, Math.round(cy));
  const inDisc = (x, y) => Math.hypot(x - cx, y - cy) < RING_CUT;

  /* The lockup's own bounds, for the master crop and the SVG viewBox. */
  let lb = { x0: W, y0: H, x1: 0, y1: 0 };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alpha[y * W + x] > 8 && inDisc(x, y)) {
        lb.x0 = Math.min(lb.x0, x);
        lb.x1 = Math.max(lb.x1, x);
        lb.y0 = Math.min(lb.y0, y);
        lb.y1 = Math.max(lb.y1, y);
      }
    }
  }

  /* 1. the raster master: the lockup, white on transparent, cropped */
  const mw = lb.x1 - lb.x0 + 1;
  const mh = lb.y1 - lb.y0 + 1;
  const master = new PNG({ width: mw, height: mh });
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const sx = lb.x0 + x;
      const sy = lb.y0 + y;
      const o = (y * mw + x) * 4;
      master.data[o] = master.data[o + 1] = master.data[o + 2] = 255;
      master.data[o + 3] = inDisc(sx, sy) ? alpha[sy * W + sx] : 0;
    }
  }
  fs.writeFileSync(OUT.master, PNG.sync.write(master));

  /* 2. the two traces */
  const tmp = (n) => path.join(os.tmpdir(), 'hma-' + n + '.png');
  const sigSrc = await maskFile(key, (x, y) => inDisc(x, y) && !inRect(x, y, TEXT), tmp('sig'), SIG.scale);
  const typeSrc = await maskFile(key, (x, y) => inRect(x, y, TEXT), tmp('type'), TYPE.scale);

  const sig = pathOf(await trace(sigSrc, SIG), SIG.scale);
  const type = pathOf(await trace(typeSrc, TYPE), TYPE.scale);
  [sigSrc, typeSrc].forEach((f) => fs.unlinkSync(f));

  const sb = pathBBox(sig);
  const tb = pathBBox(type);
  const all = {
    x0: Math.min(sb.x0, tb.x0), y0: Math.min(sb.y0, tb.y0),
    x1: Math.max(sb.x1, tb.x1), y1: Math.max(sb.y1, tb.y1),
  };

  /* 3. the lockup. The signature is named: the hero strokes that one path to
        draw the mark in — a signature signing itself — before the fill floods
        through it and the type arrives. */
  const markSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb(all) +
    '" fill="currentColor" fill-rule="evenodd">\n' +
    '<path d="' + type + '" id="markType"/>\n' +
    '<path d="' + sig + '" id="markSolid"/>\n' +
    '</svg>\n';
  fs.writeFileSync(OUT.mark, markSvg);

  /* 4. the signature alone, for the header. currentColor with a white default,
        so it paints white as an <img> and still takes a CSS colour inline. */
  const signSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb(sb) +
    '" fill="currentColor" color="#fff" fill-rule="evenodd">\n' +
    '<path d="' + sig + '"/>\n</svg>\n';
  fs.writeFileSync(OUT.sign, signSvg);

  /* 5. the avatar as the app icon: disc, ring, signature.

        Two things a favicon slot forces. The ring is 13px in 1080 — a fifth of
        a pixel at 16 — so it is drawn heavier than measured, or it is not
        there. And the signature is a 3px pen line; reduced honestly to 16px it
        is nothing. ICON_STROKE thickens it in its own units, the optical
        sizing a typeface does for small sizes: the gesture survives, it just
        carries more ink. Neither applies anywhere but this icon. */
  const ICON = 64;
  const ICON_FILL = 0.78;
  const ICON_STROKE = 22;
  const RING_W = 2.2;
  const ringR = (ring.r / W) * ICON - (RING_W - (ring.w / W) * ICON) / 2;
  const sw = sb.x1 - sb.x0;
  const sh = sb.y1 - sb.y0;
  const k = (ICON * ICON_FILL) / sw;
  const place =
    'translate(' + r1((ICON - sw * k) / 2) + ' ' + r1((ICON - sh * k) / 2) + ') ' +
    'scale(' + Math.round(k * 1e5) / 1e5 + ') ' +
    'translate(' + r1(-sb.x0) + ' ' + r1(-sb.y0) + ')';
  const iconSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + ICON + ' ' + ICON + '">\n' +
    '<circle cx="32" cy="32" r="32" fill="' + BURGUNDY + '"/>\n' +
    '<circle cx="32" cy="32" r="' + r1(ringR) + '" fill="none" stroke="' + WHITE +
    '" stroke-width="' + RING_W + '"/>\n' +
    '<g fill="' + WHITE + '" stroke="' + WHITE + '" stroke-width="' + ICON_STROKE +
    '" stroke-linejoin="round" stroke-linecap="round" transform="' + place + '">\n' +
    '<path d="' + sig + '"/>\n</g>\n</svg>\n';
  fs.writeFileSync(OUT.icon, iconSvg);

  const kb = (s) => (s.length / 1024).toFixed(1);
  console.log('source ' + W + 'x' + H + ', plate ' + BURGUNDY + ', ring r=' + r1(ring.r) + ' w=' + ring.w);
  console.log('lockup ' + mw + 'x' + mh + ' at ' + lb.x0 + ',' + lb.y0 + ' -> ' + OUT.master);
  console.log(OUT.mark + ' — ' + kb(markSvg) + ' kB (signature ' + kb(sig) + ', type ' + kb(type) + ')');
  console.log(OUT.sign + ' — ' + kb(signSvg) + ' kB, ' + r1(sw) + 'x' + r1(sh));
  console.log(OUT.icon + ' — ' + kb(iconSvg) + ' kB');
})();
