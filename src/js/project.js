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
  initHeaderOverDark,
  initYear,
} from './chrome.js';
import { mountCycler } from './media.js';

const params = new URLSearchParams(location.search);
const project = bySlug(params.get('p'));

function boot() {
  initScroll();
  initMenu();
  initYear();
  initHeaderOverDark();

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

  splitWords();
  initReveals();
  initGallery();
  cinematics();
  mountFooter();
  ScrollTrigger.refresh();
  arrive();
}

/**
 * Where the browser carried the picture across from the work grid, the page
 * is already arriving and needs nothing. Elsewhere the load is a hard cut, so
 * the page fades up instead of snapping on.
 */
function arrive() {
  if (REDUCED || 'PageRevealEvent' in window) return;
  gsap.fromTo('#pjMain', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
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
  <!-- How far down the page the reader is, as a hairline along the top. -->
  <div class="pj-progress" aria-hidden="true"><span id="pjProgress"></span></div>

  <!-- The opening: the picture filling the screen, dimmed to a backdrop, and
       over it on the right everything there is to know about the project,
       arriving line by line. The picture is the element a view transition
       carries in from the work grid, so it starts on the page whole — no
       reveal of its own — then drifts. The project's number stands behind
       the column as a watermark. -->
  <section class="pj-open" id="pjOpen">
    <div class="pj-open__plate" id="pjPlate">
      <img id="pjHero" src="${projectPlate(p, imgs[0].file, 'lg')}" alt="${imgs[0].alt}"
           fetchpriority="high" decoding="async" />
    </div>
    <span class="pj-open__index" id="pjIndex" aria-hidden="true">${p.index}</span>

    <div class="pj-open__text" id="pjText" data-stagger>
      <a class="pj-back micro" href="index.html#work">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 12H5M11 6l-6 6 6 6" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Tous les projets
      </a>
      <p class="pj-open__eyebrow micro">${p.index} — ${p.categoryLabel}</p>
      <h1 class="pj-open__title">${p.title}</h1>
      <p class="pj-open__sub sub">${p.location} · ${p.year} · ${p.status}</p>
      <p class="pj-open__lede">${p.lede}</p>
      <dl class="pj-facts">
        ${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      </dl>
    </div>
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

  <figure class="pj-note__plate" data-clip data-drift>
    <img src="${projectPlate(p, notePlate.file, 'lg')}" alt="${notePlate.alt}"
         loading="lazy" decoding="async" />
  </figure>

  <section class="pj-note">
    <aside class="pj-note__aside" data-reveal>${p.caption}</aside>
    <p class="statement" data-words>${p.statement}</p>
  </section>
  ${splitBlock}

  <section class="pj-body">
    <p class="pj-body__label micro" data-reveal>En détail</p>
    <div class="prose" data-stagger>
      ${p.body.map((t) => `<p>${t}</p>`).join('')}
    </div>
  </section>

  <section class="pj-plate pj-plate--wide">
    <figure data-clip>
      <span class="pj-plate__mount" data-drift>
        <img src="${projectPlate(p, closer.file, 'lg')}" alt="${closer.alt}" loading="lazy" decoding="async" />
      </span>
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
        <p class="micro" style="margin-bottom:.7rem">Projet suivant — ${next.index}</p>
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
    <h1 class="pj-open__title">Projet introuvable</h1>
    <p><a class="micro" href="index.html#work" style="text-decoration:underline">Retour à tous les projets</a></p>
  </section>`;
}

/* -------------------------------------------------------------- words --- */

/**
 * Wraps each word of a `[data-words]` block in its own masked span, so the
 * statement can rise one word at a time rather than fade in as a slab.
 */
function splitWords() {
  document.querySelectorAll('[data-words]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'word';
      const inner = document.createElement('span');
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
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

/* --------------------------------------------------------- cinematics --- */

/**
 * Everything that moves with the scroll.
 *
 * The opening comes apart as it leaves — plate, words and the watermark
 * numeral each at their own rate. The full-bleed plates settle from a slight
 * enlargement as they pass and drift against the scroll. The two split plates
 * travel at different rates, so the pair shears very slightly — the step
 * between them reads as deliberate. The statement rises a word at a time.
 * The next project's picture surfaces as the page ends. And the hairline
 * along the top tracks how far down the reader is.
 */
function cinematics() {
  if (REDUCED) return;

  // The opening, as it scrolls away: the backdrop lags the page (it is set
  // oversize, so the lag never shows an edge), the words go ahead of it, the
  // numeral fastest of all.
  const open = document.getElementById('pjOpen');
  if (open) {
    const scrub = { trigger: open, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to('#pjPlate', { yPercent: 10, ease: 'none', scrollTrigger: scrub });
    gsap.to('#pjText', { yPercent: -12, opacity: 0.2, ease: 'none', scrollTrigger: scrub });
    gsap.to('#pjIndex', { yPercent: -45, ease: 'none', scrollTrigger: scrub });
  }

  // Full-bleed plates: enlarged on arrival, settling as they pass, and
  // travelling slightly slower than the page.
  document.querySelectorAll('[data-drift]').forEach((fig) => {
    const img = fig.querySelector('img');
    gsap.fromTo(
      img,
      { scale: 1.14, yPercent: -5 },
      {
        scale: 1,
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  // The split pair.
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

  // The statement, a word at a time. The words start below their masks in
  // CSS (translateY(110%)), which GSAP reads as a pixel offset — so it is `y`
  // that is brought home here, not yPercent.
  document.querySelectorAll('[data-words]').forEach((el) => {
    gsap.to(el.querySelectorAll('.word > span'), {
      y: 0,
      duration: 1,
      stagger: 0.028,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  // The next project, surfacing as the page ends.
  const next = document.querySelector('.pj-next');
  if (next) {
    gsap.fromTo(
      '.pj-next__bg',
      { yPercent: 18, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
      }
    );
  }

  // How far down the page.
  const progress = document.getElementById('pjProgress');
  if (progress) {
    gsap.to(progress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }
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

// Runs last, so everything above is declared.
boot();
