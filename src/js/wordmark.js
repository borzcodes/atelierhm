/**
 * The hero wordmark's entrance.
 *
 * The lockup is plain markup (see .wordmark in base.css) — nothing to fetch,
 * nothing that can fail to arrive. What this adds is the order its parts come
 * in: the three letters rise through the baseline one after another, the
 * tagline settles in beside them, and the star turns into place last — the
 * mark assembling itself as the loader hands the screen over, then easing
 * back a touch as it lands, the way the reference does.
 */

import { gsap } from 'gsap';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const parts = (host) => ({
  letters: host.querySelectorAll('.wordmark__l'),
  tag: host.querySelector('.wordmark__tag'),
  star: host.querySelector('.wordmark__star'),
});

/** Put every part at its pre-entrance position, then let the host show. */
export function stageWordmark(host) {
  if (!host) return;
  if (!REDUCED) {
    const { letters, tag, star } = parts(host);
    gsap.set(letters, { yPercent: 108 });
    gsap.set(tag, { opacity: 0, y: '0.4em' });
    gsap.set(star, { opacity: 0, scale: 0.2, rotate: -120 });
  }
  host.classList.add('is-ready');
}

/** Play the entrance. Resolves the timeline so the caller can sequence on it. */
export async function revealWordmark(host) {
  if (!host) return gsap.timeline();
  if (REDUCED) {
    host.classList.add('is-in');
    return gsap.timeline();
  }

  // A swap to the real face mid-entrance would reflow the letters; wait for
  // it where it is still loading, but never for long.
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 900))]);

  const { letters, tag, star } = parts(host);
  return gsap
    .timeline({ onComplete: () => host.classList.add('is-in') })
    .fromTo(host, { scale: 1.06 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
    .to(letters, { yPercent: 0, duration: 1.15, stagger: 0.09, ease: 'power4.out' }, 0)
    .to(tag, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.55)
    .to(star, { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.75);
}

/** Force the finished state — used when the intro sequence fails. */
export function settleWordmark(host) {
  if (!host) return;
  const { letters, tag, star } = parts(host);
  gsap.set(letters, { yPercent: 0 });
  gsap.set(tag, { opacity: 1, y: 0 });
  gsap.set(star, { opacity: 1, scale: 1, rotate: 0 });
  host.classList.add('is-ready', 'is-in');
}
