/**
 * The opening sequence.
 *
 * A small plate shuffles through the portfolio as each image finishes
 * decoding, a counter tracks real progress, and when the last one lands the
 * plate flies out to full bleed and hands over to the hero sequence.
 */

import { gsap } from 'gsap';
import { REDUCED, startScroll, stopScroll } from './chrome.js';
import { nextFrame, scheduleFrame } from './raf.js';

const MIN_DURATION = 1600; // ms — long enough to read as deliberate
const FRAME_HOLD = 115; // ms per shuffled frame

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
 * @param {string[]} opts.shuffle  small plates cycled while loading
 * @param {string}   opts.heroSrc  the full-bleed plate the loader flies into
 */
export async function runLoader({ shuffle, heroSrc }) {
  const root = document.getElementById('loader');
  const plate = document.getElementById('loaderPlate');
  const bar = document.getElementById('loaderBar');
  const count = document.getElementById('loaderCount');
  const hero = document.getElementById('hero');

  if (!root || !plate) return { loaded: [] };

  stopScroll();
  const startedAt = performance.now();

  /* --- 1. shuffle whatever has arrived ---------------------------------- */

  const imgs = [];
  let visible = -1;
  const tick = setInterval(() => {
    if (!imgs.length) return;
    imgs[visible]?.classList.remove('is-on');
    visible = (visible + 1) % imgs.length;
    imgs[visible].classList.add('is-on');
  }, FRAME_HOLD);

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

  const loaded = [];
  const total = shuffle.length + 1;

  for (let i = 0; i < shuffle.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await nextFrame();
    // eslint-disable-next-line no-await-in-loop
    const img = await preload(shuffle[i]);
    if (img) {
      img.alt = '';
      plate.appendChild(img);
      imgs.push(img);
      loaded.push(shuffle[i]);
    }
    real = (i + 1) / total;
  }

  // The hero plate is the last thing fetched — and the image we fly out with.
  await nextFrame();
  const heroImg = await preload(heroSrc);
  if (heroImg) {
    heroImg.alt = '';
    plate.appendChild(heroImg);
    imgs.push(heroImg);
  }
  real = 1;

  /* --- 4. hold, then hand over ------------------------------------------ */

  const elapsed = performance.now() - startedAt;
  if (elapsed < MIN_DURATION) await new Promise((r) => setTimeout(r, MIN_DURATION - elapsed));

  clearInterval(tick);

  // Settle on the hero frame before the flight, so nothing changes mid-air.
  imgs.forEach((im) => im.classList.remove('is-on'));
  imgs[imgs.length - 1]?.classList.add('is-on');

  await revealHero({ root, plate, hero });
  startScroll();

  return { loaded };
}

/**
 * The flight: the plate leaves the centre of a white screen and becomes the
 * hero, while the chrome fades in behind it.
 */
function revealHero({ root, plate, hero }) {
  const chrome = ['.header', '.hero__tagline', '.hero__scroll'];
  const firstSlide = document.querySelector('.hero__slide');

  gsap.set(chrome, { opacity: 0 });

  if (REDUCED) {
    root.remove();
    gsap.set(chrome, { opacity: 1 });
    if (firstSlide) firstSlide.classList.add('is-on');
    return Promise.resolve();
  }

  const from = plate.getBoundingClientRect();
  const to = hero.getBoundingClientRect();

  // Pin the plate to its own rect first, so the tween to the hero rect is a
  // pure geometric move rather than a layout change.
  gsap.set(plate, {
    position: 'fixed',
    top: from.top,
    left: from.left,
    width: from.width,
    height: from.height,
    margin: 0,
    zIndex: 2,
  });

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
      .to('.loader__meta, .loader__bar', { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to(plate, { top: to.top, left: to.left, width: to.width, height: to.height, duration: 1.1 }, 0.12)
      .to(root, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.6 }, 0.5)
      .to(chrome, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.78)
      // Bring up the real hero slide underneath, then drop the plate.
      .add(() => firstSlide?.classList.add('is-on'), 1.05)
      .to(plate, { opacity: 0, duration: 0.45, ease: 'none' }, 1.2);
  });
}
