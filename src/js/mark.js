/**
 * The hero mark.
 *
 * The logotype is the studio's own artwork, used exactly as supplied — it is
 * never redrawn. What changed is the format: the raster master is traced to
 * vector by tools/trace-mark.cjs, which lets the mark stay crisp at any size
 * and, more to the point, lets it draw itself.
 *
 * The reveal is the reference's two-part entrance. The monogram's own outline
 * is stroked as a hairline and drawn on with a dash offset, as though it were
 * being set out on a drawing board; then the fill floods through it and the
 * contour retires. The subline is a hairline already, so it arrives with the
 * fill rather than drawing.
 *
 * If the SVG cannot be fetched the raster in the markup stands in and simply
 * fades up — the mark is never missing.
 */

import { gsap } from 'gsap';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SRC = 'assets/logo/hma-mark.svg';

/**
 * Fetch and inline the vector mark, then stage it at its pre-reveal state.
 * Resolves to the pieces the reveal animates, or to a raster-only stand-in.
 */
export async function mountMark(host) {
  if (!host) return null;

  const fallback = host.querySelector('.mark__fallback');
  const svg = await loadMark();

  if (!svg) {
    if (fallback) gsap.set(fallback, { opacity: REDUCED ? 1 : 0 });
    host.classList.add('is-ready');
    return { ink: fallback, draw: null };
  }

  svg.classList.add('mark__svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  // Everything the trace produced becomes the fill; the monogram's contour is
  // lifted back out through <use> so it can be stroked without a second copy.
  const ink = document.createElementNS(svg.namespaceURI, 'g');
  ink.setAttribute('class', 'mark__ink');
  while (svg.firstChild) ink.appendChild(svg.firstChild);
  svg.appendChild(ink);

  const solid = ink.querySelector('#markSolid');
  let draw = null;
  if (solid && !REDUCED) {
    draw = document.createElementNS(svg.namespaceURI, 'use');
    draw.setAttribute('href', '#markSolid');
    draw.setAttribute('class', 'mark__draw');
    svg.appendChild(draw);
  }

  fallback?.remove();
  host.appendChild(svg);

  if (REDUCED) {
    gsap.set(ink, { opacity: 1 });
  } else {
    gsap.set(ink, { opacity: 0 });
    if (draw) {
      // Laid out only once the node is in the document, or the geometry the
      // dash is measured against does not exist yet.
      const len = Math.ceil(solid.getTotalLength());
      gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      draw.dataset.len = String(len);
    }
  }

  host.classList.add('is-ready');
  return { ink, draw };
}

/** Fetch the traced mark. Returns null if anything about it is not an SVG. */
async function loadMark() {
  try {
    // Cached indefinitely: the file never changes without a filename change.
    const res = await fetch(SRC, { cache: 'force-cache' });
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') return null;
    return document.importNode(root, true);
  } catch (e) {
    /* offline, blocked, or served as something else — the raster covers it */
    return null;
  }
}

/** Play the entrance: the outline draws, then the fill floods through it. */
export function revealMark(host, mark) {
  if (!host || !mark) return gsap.timeline();

  const { ink, draw } = mark;

  if (REDUCED) {
    gsap.set(ink, { opacity: 1 });
    return gsap.timeline();
  }

  const tl = gsap
    .timeline()
    // Settles back a touch as it lands, the way the reference does.
    .fromTo(host, { scale: 1.06 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0);

  if (draw) {
    const len = Number(draw.dataset.len) || 0;
    tl.to(draw, { opacity: 1, duration: 0.25, ease: 'none' }, 0)
      .fromTo(
        draw,
        { strokeDashoffset: len },
        { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut' },
        0
      )
      // 2. the fill floods through the finished outline
      .to(ink, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, 1.35)
      // 3. the contour has done its job once the letter is solid
      .to(draw, { opacity: 0, duration: 0.5, ease: 'none' }, 1.75);
  } else {
    tl.to(ink, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0.2);
  }

  return tl;
}

/** Force the finished state — used when the intro sequence fails. */
export function settleMark(host) {
  if (!host) return;
  host.classList.add('is-ready', 'is-in');
  gsap.set(host.querySelectorAll('.mark__ink, .mark__fallback'), { opacity: 1 });
  gsap.set(host.querySelectorAll('.mark__draw'), { opacity: 0 });
}
