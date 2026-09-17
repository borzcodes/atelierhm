/**
 * The opening sequence.
 *
 * A burgundy field, and on it the founder's signature signing itself on out of
 * nothing — one pen line, then the fill, then the name and the line beneath it
 * (mark.js). Behind that the hero's plates decode, a thin bar and a counter
 * tracking real progress along the bottom. Once the signature has finished and
 * the plates are in, the field lifts like a curtain and hands over to the hero,
 * whose wordmark rises as it goes.
 */

import { gsap } from 'gsap';
import { REDUCED, startScroll, stopScroll } from './chrome.js';
import { nextFrame, scheduleFrame } from './raf.js';
import { mountMark, revealMark, settleMark } from './mark.js';

const MIN_DURATION = 2200; // ms — the signing at its quicker pace, plus a beat to read it
const HOLD_AFTER = 250; // ms the finished lockup is held before the field lifts
const SIGNING_PACE = 1.35; // the pen moves this much faster here than at its own pace

/** Decode an image off the main thread; resolves either way. */
function preload(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().then(() => resolve(img), () => resolve(img)) : resolve(img));
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * @param {object} opts
 * @param {string[]} opts.shuffle  the plates to have decoded before the reveal
 * @param {string}   opts.heroSrc  the hero's first plate — fetched last
 */
export async function runLoader({ shuffle, heroSrc }) {
  const root = document.getElementById('loader');
  const markHost = document.getElementById('loaderMark');
  const bar = document.getElementById('loaderBar');
  const count = document.getElementById('loaderCount');
  const hero = document.getElementById('hero');

  if (!root || !markHost) return { loaded: [] };

  stopScroll();
  const startedAt = performance.now();

  /* --- 1. the signature, at once — the loading happens under it ---------- */

  const mark = await mountMark(markHost);
  const signing = revealMark(markHost, mark).timeScale(SIGNING_PACE);

  /* --- 2. progress, eased so the number never stutters ------------------ */

  let real = 0;
  let shown = 0;
  const step = () => {
    shown += (real - shown) * 0.14;
    if (count) count.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (bar) bar.style.width = `${shown * 100}%`;
    if (shown < 0.999) scheduleFrame(step);
  };
  scheduleFrame(step);

  /* --- 3. decode, one per frame so the page stays responsive ------------ */

  // Held until the hand-over so the decoded bitmaps stay warm for the hero.
  const keep = [];
  const loaded = [];
  const total = shuffle.length + 1;

  for (let i = 0; i < shuffle.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await nextFrame();
    // eslint-disable-next-line no-await-in-loop
    const img = await preload(shuffle[i]);
    if (img) {
      keep.push(img);
      loaded.push(shuffle[i]);
    }
    real = (i + 1) / total;
  }

  await nextFrame();
  const heroImg = await preload(heroSrc);
  if (heroImg) keep.push(heroImg);
  real = 1;

  /* --- 4. let the signature finish, hold, then hand over ---------------- */

  // The timeline's own promise; capped, since an empty one (motion off, or no
  // vector to draw) has no end to reach.
  await Promise.race([signing.then(), new Promise((r) => setTimeout(r, 4000))]);
  const elapsed = performance.now() - startedAt;
  if (elapsed < MIN_DURATION) await new Promise((r) => setTimeout(r, MIN_DURATION - elapsed));
  if (!REDUCED) await new Promise((r) => setTimeout(r, HOLD_AFTER));

  await revealHero({ root, markHost, hero });
  startScroll();
  keep.length = 0;

  return { loaded };
}

/**
 * The hand-over: the lockup goes, the field lifts off the top of the screen
 * like a curtain, and the hero — first plate, chrome — is there beneath it.
 * Resolves as the curtain is rising rather than once it has gone, so the
 * wordmark's entrance can begin under it.
 */
function revealHero({ root, markHost, hero }) {
  const chrome = ['.header', '.hero__tagline', '.hero__scroll'];
  const firstSlide = document.querySelector('.hero__slide');

  gsap.set(chrome, { opacity: 0 });

  if (REDUCED) {
    settleMark(markHost);
    root.remove();
    gsap.set(chrome, { opacity: 1 });
    if (firstSlide) firstSlide.classList.add('is-on');
    return Promise.resolve();
  }

  gsap.set(root, { clipPath: 'inset(0 0 0% 0)' });

  return new Promise((resolve) => {
    let finished = false;
    const finish = (tl) => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      tl?.progress(1);
      root.remove();
      resolve();
    };

    /* GSAP is rAF-driven, so a tab hidden mid-reveal would never reach
       onComplete and the page would stay scroll-locked. Snap to the end
       state if the timeline has not landed in time. */
    const guard = setTimeout(() => finish(timeline), 6000);

    const timeline = gsap
      .timeline({ defaults: { ease: 'expo.inOut' }, onComplete: () => finish() })
      .to('.loader__meta, .loader__bar', { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0)
      .to(markHost, { opacity: 0, y: -24, duration: 0.4, ease: 'power2.in' }, 0)
      // The real hero slide comes on beneath before the curtain moves.
      .add(() => firstSlide?.classList.add('is-on'), 0.15)
      .to(root, { clipPath: 'inset(0 0 100% 0)', duration: 0.85 }, 0.25)
      .add(() => resolve(), 0.5)
      .to(chrome, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.6);
  });
}
