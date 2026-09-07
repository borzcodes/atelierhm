/**
 * Project detail page.
 *
 * Reads ?p=<slug> and lays itself out from that project's image list, so a
 * three-plate project and a six-plate project both read properly: the gallery
 * always carries every image, and the split only appears when there are enough
 * plates to fill it without repeating one.
 */

import '../css/base.css';
import '../css/project.css';

import { ALL_PLATES, bySlug, nextOf, plate, projectPlate } from '../data/projects.js';
import {
  gsap,
  ScrollTrigger,
  REDUCED,
  initScroll,
  initMenu,
  initReveals,
  initYear,
} from './chrome.js';
import { mountCycler } from './media.js';

const params = new URLSearchParams(location.search);
const project = bySlug(params.get('p'));

function boot() {
  initScroll();
  initMenu();
  initYear();

  const main = document.getElementById('pjMain');

  if (!project) {
    main.innerHTML = notFound();
    initReveals();
    mountFooter();
    return;
  }

  document.title = `${project.title} — HM Architect`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', project.lede);
  // Drives the gallery frame, so a square project is not cropped to a letterbox.
  document.documentElement.style.setProperty(
    '--plate-ratio',
    project.aspect === 'square' ? '1 / 1' : '16 / 9'
  );

  main.innerHTML = template(project);

  initReveals();
  initGallery();
  parallax();
  mountFooter();
  ScrollTrigger.refresh();
}

/* ------------------------------------------------------------ template --- */

function template(p) {
  const next = nextOf(p.slug);
  const imgs = p.images;
  // The two-up split only runs when it can be filled without repeating a plate
  // the note or the closer is already using.
  const hasSplit = imgs.length >= 5;
  const notePlate = imgs[1] || imgs[0];
  const closer = imgs[imgs.length - 1];

  const splitBlock = hasSplit
    ? `
  <section class="pj-split">
    <figure data-clip>
      <img data-split="0" src="${projectPlate(p, imgs[2].file, 'lg')}" alt="${imgs[2].alt}"
           loading="lazy" decoding="async" />
    </figure>
    <figure data-clip>
      <img data-split="1" src="${projectPlate(p, imgs[3].file, 'lg')}" alt="${imgs[3].alt}"
           loading="lazy" decoding="async" />
    </figure>
  </section>`
    : '';

  return `
  <a class="pj-back micro" href="index.html#work">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="1.8"/>
    </svg>
    All work
  </a>

  <section class="pj-hero">
    <img id="pjHero" src="${projectPlate(p, imgs[0].file, 'lg')}" alt="${imgs[0].alt}"
         fetchpriority="high" decoding="async" />
    <div class="pj-hero__grad"></div>
    <div class="pj-hero__inner">
      <p class="micro" style="margin-bottom:.6rem">${p.index} — ${p.categoryLabel}</p>
      <h1 class="pj-hero__title">${p.title}</h1>
      <div class="pj-hero__sub micro" data-reveal>
        <span>${p.location}</span><span>${p.year}</span><span>${p.status}</span>
      </div>
    </div>
  </section>

  <dl class="pj-facts micro" data-stagger>
    ${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
  </dl>

  <section class="pj-lede">
    <p data-reveal>${p.lede}</p>
  </section>

  <section class="pj-carousel" id="pjCarousel">
    <div class="pj-carousel__stage" id="pjStage">
      ${imgs
        .map(
          (im, i) => `
        <img src="${projectPlate(p, im.file, i === 0 ? 'lg' : undefined)}" alt="${i === 0 ? im.alt : ''}"
             class="${i === 0 ? 'is-on' : ''}" ${i === 0 ? '' : 'aria-hidden="true" loading="lazy"'}
             decoding="async" />`
        )
        .join('')}
    </div>
  </section>

  <figure class="pj-note__plate" data-clip>
    <img src="${projectPlate(p, notePlate.file, 'lg')}" alt="${notePlate.alt}"
         loading="lazy" decoding="async" />
  </figure>

  <section class="pj-note">
    <aside class="pj-note__aside" data-reveal>${p.caption}</aside>
    <p class="statement" data-reveal>${p.statement}</p>
  </section>
  ${splitBlock}

  <section class="pj-body">
    <p class="pj-body__label micro" data-reveal>In detail</p>
    <div class="prose" data-reveal>
      ${p.body.map((t) => `<p>${t}</p>`).join('')}
    </div>
  </section>

  <section class="pj-plate pj-plate--wide">
    <figure data-clip>
      <img src="${projectPlate(p, closer.file, 'lg')}" alt="${closer.alt}" loading="lazy" decoding="async" />
      <figcaption class="micro">
        <span>${p.title} — ${p.location}</span><span>${p.year}</span>
      </figcaption>
    </figure>
  </section>

  <a class="pj-next" href="project.html?p=${next.slug}">
    <div class="pj-next__bg">
      <img src="${projectPlate(next, next.images[0].file, 'lg')}" alt="" loading="lazy" decoding="async" />
    </div>
    <div class="pj-next__inner">
      <div>
        <p class="micro" style="margin-bottom:.7rem">Next project — ${next.index}</p>
        <h2>${next.shortTitle || next.title}</h2>
      </div>
      <svg class="pj-next__arrow" viewBox="0 0 100 40" fill="none" aria-hidden="true">
        <path d="M0 20h92M74 4l18 16-18 16" stroke="currentColor" stroke-width="5"/>
      </svg>
    </div>
  </a>`;
}

function notFound() {
  return `
  <section class="pj-404">
    <p class="micro">404</p>
    <h1 class="pj-hero__title" style="color:var(--ink)">No such project</h1>
    <p><a class="micro" href="index.html#work" style="text-decoration:underline">Back to all work</a></p>
  </section>`;
}

/* ------------------------------------------------------------ parallax --- */

function parallax() {
  if (REDUCED) return;
  const heroImg = document.getElementById('pjHero');
  if (!heroImg) return;

  gsap.fromTo(
    heroImg,
    { yPercent: -4 },
    {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.pj-hero', start: 'top top', end: 'bottom top', scrub: true },
    }
  );

  // The two split plates travel at different rates, so the pair shears very
  // slightly as it passes — the step between them reads as deliberate.
  const split = document.querySelector('.pj-split');
  if (split) {
    const drift = { 0: -3.5, 1: 4.5 };
    split.querySelectorAll('[data-split]').forEach((img) => {
      const d = drift[img.dataset.split] ?? 0;
      gsap.fromTo(
        img,
        { yPercent: -d },
        {
          yPercent: d,
          ease: 'none',
          scrollTrigger: { trigger: split, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });
  }
}

/* ----------------------------------------------------------- gallery --- */

const gallery = { index: 0, imgs: [], timer: null, io: null };
const AUTO_MS = 4600;

/** Cross-fades through a project's plates on its own — no manual controls. */
function initGallery() {
  const stage = document.getElementById('pjStage');
  if (!stage) return;

  gallery.imgs = [...stage.querySelectorAll('img')];
  if (gallery.imgs.length < 2) return;

  startAuto();
}

function show(i) {
  const { imgs } = gallery;
  if (!imgs.length) return;
  imgs[gallery.index]?.classList.remove('is-on');
  gallery.index = (i + imgs.length) % imgs.length;
  imgs[gallery.index].classList.add('is-on');
}

function startAuto() {
  if (REDUCED) return;
  resumeAuto();

  // Only advance while the carousel is actually on screen.
  const el = document.getElementById('pjCarousel');
  if (el && !gallery.io) {
    gallery.io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? resumeAuto() : pauseAuto()),
      { threshold: 0.2 }
    );
    gallery.io.observe(el);
  }
}

function resumeAuto() {
  if (gallery.timer || REDUCED) return;
  gallery.timer = setInterval(() => show(gallery.index + 1), AUTO_MS);
}

function pauseAuto() {
  clearInterval(gallery.timer);
  gallery.timer = null;
}

/* -------------------------------------------------------------- footer --- */

function mountFooter() {
  mountCycler(
    document.getElementById('seeWorkSlot'),
    // ALL_PLATES entries already carry a resolved folder, so plate() is right
    // here — projectPlate() is for whole projects.
    ALL_PLATES.map((im) => plate(im.slug, im.file))
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10),
    { interval: 680 }
  );
}

// Runs last: boot() reaches the gallery state declared above.
boot();
