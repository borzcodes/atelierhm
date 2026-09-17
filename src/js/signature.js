/**
 * The founder's signature, signing itself over and over.
 *
 * Two places carry it — small beside the founder's words, large as the contact
 * section's sign-off — and in both it is never still: the contour is drawn on
 * as one pen line, the fill floods through it, it holds, the ink lifts, and
 * the pen starts again. Each runs only while it is on screen.
 *
 * Every host starts with the artwork painted through a CSS mask (see .sign),
 * so the signature is on the page whatever happens to this script. When the
 * vector can be fetched — once, shared — it takes each box over and the mask
 * steps aside.
 */

import { gsap } from 'gsap';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SRC = 'assets/logo/hma-sign.svg';

/* One cycle of the signing, in seconds. */
const PEN = 2.2; // the contour drawn on
const FILL_AT = 1.7; // the fill starts flooding before the pen has finished
const HOLD_UNTIL = 4.2; // the finished signature stands until here
const LIFT = 0.7; // the ink fades so the pen can begin again
const REST = 0.5; // an empty beat between signings

export function initSignatures() {
  const hosts = [...document.querySelectorAll('[data-sign]')];
  // With motion off the masked artwork is the finished state already.
  if (!hosts.length || REDUCED || !('IntersectionObserver' in window)) return;
  hosts.forEach(mount);
}

async function mount(host) {
  const svg = await loadSign();
  const solid = svg?.querySelector('path');
  if (!solid) return; // the mask stands

  // Drawn white for the header it came from; here it takes each host's colour
  // through currentColor once the hard-coded one is lifted.
  svg.removeAttribute('color');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('sign__svg');

  // A second copy of the contour to stroke, so the fill can arrive under it.
  const draw = solid.cloneNode(false);
  draw.setAttribute('class', 'sign__draw');
  svg.appendChild(draw);

  host.appendChild(svg);
  host.classList.add('is-vector');

  // Measured only once it is in the document — there is no geometry before.
  const len = Math.ceil(draw.getTotalLength());

  const loop = gsap
    .timeline({ paused: true, repeat: -1, repeatDelay: REST })
    // The blank page, every time round.
    .set(solid, { opacity: 0 }, 0)
    .set(draw, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 }, 0)
    .to(draw, { opacity: 1, duration: 0.25, ease: 'none' }, 0)
    // 1. the pen: a steady hand, not an ease that rushes the middle
    .to(draw, { strokeDashoffset: 0, duration: PEN, ease: 'power1.inOut' }, 0)
    // 2. the fill floods through as the line completes
    .to(solid, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, FILL_AT)
    // 3. the contour has done its job once the stroke is solid
    .to(draw, { opacity: 0, duration: 0.5, ease: 'none' }, PEN)
    // 4. it stands, then the ink lifts
    .to(solid, { opacity: 0, duration: LIFT, ease: 'power2.inOut' }, HOLD_UNTIL);

  // Signs only while on screen; picks up where it left off on return.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? loop.play() : loop.pause()),
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );
  io.observe(host);
}

/* One fetch for however many hosts there are. */
let pending = null;
function loadSign() {
  pending ??= fetchSign();
  // Each host needs its own copy of the node.
  return pending.then((root) => (root ? document.importNode(root, true) : null));
}

/** Fetch the signature. Returns null if anything about it is not an SVG. */
async function fetchSign() {
  try {
    const res = await fetch(SRC);
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') return null;
    return root;
  } catch (e) {
    /* offline, blocked, or served as something else — the mask covers it */
    return null;
  }
}
