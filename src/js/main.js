/**
 * Home page entry point.
 *
 * Boot order matters: chrome first (so the page is navigable even if the
 * imagery never arrives), then the loader decodes the opening plates, then the
 * hero sequence starts and the remaining sections are wired up.
 */

import '../css/base.css';
import '../css/home.css';

import { ALL_PLATES, HERO_SLIDES, PROJECTS, plate, projectPlate } from '../data/projects.js';
import {
  gsap,
  ScrollTrigger,
  REDUCED,
  initScroll,
  initMenu,
  initReveals,
  initProximity,
  initHeaderOverDark,
  initCookie,
  initYear,
  initAnchors,
  startScroll,
} from './chrome.js';
import { runLoader } from './loader.js';
import { HeroSequence, buildSlides } from './hero.js';
import { initWork } from './work.js';
import { initSignatures } from './signature.js';
import { mountCycler } from './media.js';
import { stageWordmark, revealWordmark, settleWordmark } from './wordmark.js';

/* Plates the loader shuffles through, capped: every one of these is fetched
   and decoded before the site is revealed. */
const SHUFFLE = [
  ...PROJECTS.map((p) => projectPlate(p, p.images[0].file)),
  ...ALL_PLATES.map((p) => plate(p.slug, p.file)),
]
  .filter((v, i, a) => a.indexOf(v) === i)
  .slice(0, 8);

const HERO_SRCS = HERO_SLIDES.map((s) => ({
  src: plate(s.slug, s.file, 'lg'),
  position: s.position,
  alt: s.alt,
}));

boot();

async function boot() {
  initScroll();
  initMenu();
  initCookie();
  initYear();
  initAnchors();
  initWork();
  initStats();
  initSignatures();
  initReveals();
  initProximity('.cap__row');
  initHeaderOverDark();

  buildSlides(document.getElementById('heroStage'), HERO_SRCS);

  // Staged up front so the wordmark is ready to come in the instant the
  // loader hands the screen over.
  const markHost = document.getElementById('heroMark');
  stageWordmark(markHost);

  try {
    await runLoader({ shuffle: SHUFFLE, heroSrc: HERO_SRCS[0].src });
  } catch (err) {
    console.error('[main] loader failed', err);
    degrade();
  }

  revealWordmark(markHost);
  startHero();
  mountCyclers();
  ScrollTrigger.refresh();
}

/* -------------------------------------------------------------- stats --- */

/**
 * The founder's figures. These are the studio's own business figures — set in
 * the markup, not derived from the demo grid below, since the practice's real
 * total runs well ahead of the handful of projects this site currently shows.
 * A `data-prefix` (e.g. "+") rides along through the count-up. Each number
 * counts up from nought as the strip scrolls into view — on a page where
 * everything arrives, a figure that was simply there would be the one still
 * thing.
 */
function initStats() {
  const strip = document.querySelector('.stats');
  if (!strip) return;

  const nums = [...strip.querySelectorAll('.stats__num')];
  if (REDUCED || !('IntersectionObserver' in window)) return;

  nums.forEach((el) => (el.textContent = (el.dataset.prefix || '') + '0'));
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      nums.forEach((el, i) => {
        const to = Number(el.dataset.count) || 0;
        const prefix = el.dataset.prefix || '';
        const o = { v: 0 };
        gsap.to(o, {
          v: to,
          duration: 1.4,
          delay: 0.15 + i * 0.12,
          ease: 'power2.out',
          onUpdate: () => (el.textContent = prefix + String(Math.round(o.v))),
        });
      });
    },
    { threshold: 0.35 }
  );
  io.observe(strip);
}

/* --------------------------------------------------------------- hero --- */

function startHero() {
  const stage = document.getElementById('heroStage');
  const hero = document.getElementById('hero');
  if (!stage) return;

  const sequence = new HeroSequence(stage);
  sequence.start();
  sequence.bindScroll(hero, ScrollTrigger);

  // The title drifts up faster than the plates behind it.
  if (!REDUCED) {
    gsap.to('#heroTitle', {
      yPercent: -34,
      opacity: 0.12,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}

/* ------------------------------------------------------------ cyclers --- */

function mountCyclers() {
  const pillSrcs = PROJECTS.map((p) => projectPlate(p, p.images[0].file));
  mountCycler(document.getElementById('heroPillMedia'), pillSrcs, {
    interval: 1400,
    alt: 'Travaux récents',
  });

  mountCycler(
    document.getElementById('seeWorkSlot'),
    ALL_PLATES.map((p) => plate(p.slug, p.file))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10),
    { interval: 680 }
  );
}

/* ------------------------------------------------------------ fallback --- */

/** The loader threw: drop the overlay and show the flat page. */
function degrade() {
  document.getElementById('loader')?.remove();
  gsap.set(['.header', '.hero__tagline', '.hero__scroll'], { opacity: 1 });
  settleWordmark(document.getElementById('heroMark'));
  document.querySelector('.hero__slide')?.classList.add('is-on');
  startScroll();
}
