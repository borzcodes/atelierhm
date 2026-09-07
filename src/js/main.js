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
  initCookie,
  initYear,
  initAnchors,
  startScroll,
} from './chrome.js';
import { runLoader } from './loader.js';
import { HeroSequence, buildSlides } from './hero.js';
import { initWork } from './work.js';
import { initContact } from './contact.js';
import { mountCycler } from './media.js';
import { mountMark, revealMark, settleMark } from './mark.js';

/* Plates the loader shuffles through. Kept to the real projects and capped:
   every one of these is fetched and decoded before the site is revealed, so
   the list must not grow with the placeholder entries. */
const SHUFFLE = [
  ...PROJECTS.filter((p) => !p.placeholder).map((p) => projectPlate(p, p.images[0].file)),
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
  initContact();
  initReveals();
  initProximity('.cap__row');

  buildSlides(document.getElementById('heroStage'), HERO_SRCS);

  // Inlined up front so the logo is staged and ready to draw the instant the
  // loader hands the screen over.
  const markHost = document.getElementById('heroMark');
  const markPromise = mountMark(markHost);

  try {
    await runLoader({ shuffle: SHUFFLE, heroSrc: HERO_SRCS[0].src });
  } catch (err) {
    console.error('[main] loader failed', err);
    degrade();
  }

  revealMark(markHost, await markPromise);
  startHero();
  mountCyclers();
  ScrollTrigger.refresh();
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
  const pillSrcs = PROJECTS.filter((p) => !p.placeholder).map((p) =>
    projectPlate(p, p.images[0].file)
  );
  mountCycler(document.getElementById('heroPillMedia'), pillSrcs, {
    interval: 1400,
    alt: 'Recent work',
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
  settleMark(document.getElementById('heroMark'));
  document.querySelector('.hero__slide')?.classList.add('is-on');
  startScroll();
}
