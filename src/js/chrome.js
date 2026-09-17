/**
 * Site chrome shared by both pages: smooth scroll, menu,
 * scroll reveals and the cookie notice.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------ smooth scroll --- */

export let lenis = null;

export function initScroll() {
  /* Browsers restore the previous scroll offset on reload. On a page that
     opens with an intro sequence that would drop a returning visitor into the
     middle of the site and skip it entirely, so the top is claimed back. */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  if (REDUCED) return null;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { offset: -10, duration: 1.2, ...opts });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

export function stopScroll() {
  lenis?.stop();
  document.body.classList.add('is-locked');
}
export function startScroll() {
  lenis?.start();
  document.body.classList.remove('is-locked');
}

/* ---------------------------------------------------------------- menu --- */

export function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('menu');
  const label = document.getElementById('menuLabel');
  if (!toggle || !menu) return;

  const items = menu.querySelectorAll('.menu__item a');
  let open = false;

  const tl = gsap
    .timeline({ paused: true })
    .set(menu, { visibility: 'visible' })
    .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.72, ease: 'power4.inOut' })
    .to(items, { y: 0, duration: 0.72, stagger: 0.06, ease: 'power3.out' }, 0.16)
    .to('.menu__foot', { opacity: 1, duration: 0.5 }, 0.5);

  gsap.set('.menu__foot', { opacity: 0 });

  const setOpen = (next) => {
    open = next;
    menu.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('is-menu-open', open);
    if (label) label.textContent = open ? 'Fermer' : 'Menu';
    if (open) {
      stopScroll();
      tl.play();
    } else {
      tl.reverse().then(() => {
        if (!open) menu.style.visibility = 'hidden';
      });
      startScroll();
    }
  };

  toggle.addEventListener('click', () => setOpen(!open));

  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-nav]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      setOpen(false);
      setTimeout(() => scrollTo(href), 380);
    } else {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });
}


/* ------------------------------------------------------------- reveals --- */

/**
 * Adds `.is-in` once an element scrolls into view — the three reveal flavours
 * declared in base.css.
 *
 * Measured against the viewport rather than driven by IntersectionObserver.
 * These elements start at `opacity: 0`, so anything that stops the callback
 * arriving leaves the page permanently blank; a rect check on scroll always
 * runs, costs nothing at this element count, and cannot get stuck.
 */
export function initReveals(root = document) {
  // `data-stagger` marks a container whose own children should each come in,
  // one after another — so a list or a row of fields animates without every
  // item needing its own attribute.
  root.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (child.hasAttribute('data-reveal')) return;
      child.setAttribute('data-reveal', '');
      child.style.setProperty('--stagger', String(i));
    });
  });

  const targets = [...root.querySelectorAll('[data-reveal], [data-clip], [data-line]')];
  if (!targets.length) return;

  targets.forEach((el) => {
    if (el.hasAttribute('data-line')) el.classList.add('line-mask');
  });

  if (REDUCED) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  let pending = targets;

  const check = () => {
    if (!pending.length) return;
    const h = window.innerHeight;
    const still = [];

    pending.forEach((el) => {
      const r = el.getBoundingClientRect();
      // In view once its top has risen above 88% of the viewport height.
      if (r.top < h * 0.88 && r.bottom > 0) {
        // Lines that share a parent cascade rather than arriving together.
        const siblings = [...(el.parentElement?.children || [])].filter((n) =>
          n.hasAttribute('data-line')
        );
        const i = Math.max(0, siblings.indexOf(el));
        setTimeout(() => el.classList.add('is-in'), i * 90);
      } else {
        still.push(el);
      }
    });

    pending = still;
  };

  check();
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  lenis?.on('scroll', check);
  // Covers layout that settles after fonts and renders land.
  setTimeout(check, 400);
  setTimeout(check, 1600);
}

/**
 * Marks whichever element is nearest the middle of the viewport as `.is-near`.
 * The capability rows use it to light up as they pass, so the list reads as
 * something moving rather than a static table.
 */
export function initProximity(selector) {
  const els = [...document.querySelectorAll(selector)];
  if (!els.length || REDUCED) return;

  let current = null;
  const check = () => {
    const mid = window.innerHeight * 0.45;
    let best = null;
    let bestDist = Infinity;

    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = el;
      }
    });

    if (best === current) return;
    current?.classList.remove('is-near');
    best?.classList.add('is-near');
    current = best;
  };

  check();
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  lenis?.on('scroll', check);
}

/**
 * The header is drawn with `mix-blend-mode: difference`, which inverts it over
 * whatever it crosses — right for the hero and the white page, wrong over the
 * burgundy band the page closes on, where differencing white lands on a pale
 * cyan. So while any `data-dark` section sits under the header the document
 * carries `.is-over-dark`, and the header drops the blend for plain white —
 * the same rule the open menu uses.
 */
export function initHeaderOverDark() {
  const darks = [...document.querySelectorAll('[data-dark]')];
  const header = document.querySelector('.header');
  if (!darks.length || !header) return;

  const root = document.documentElement;
  const check = () => {
    // Measured at the header's own midline, so the switch lands as the type
    // crosses the edge rather than a beat before or after.
    const probe = header.offsetHeight / 2;
    const over = darks.some((el) => {
      const r = el.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    });
    root.classList.toggle('is-over-dark', over);
  };

  check();
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check, { passive: true });
  lenis?.on('scroll', check);
}

/* -------------------------------------------------------------- cookie --- */

const COOKIE_KEY = 'hm-cookie-choice';

export function initCookie() {
  const bar = document.getElementById('cookie');
  if (!bar) return;

  let stored = null;
  try {
    stored = localStorage.getItem(COOKIE_KEY);
  } catch (e) {
    /* private mode — just show it and don't persist */
  }
  if (stored) return;

  const show = () => {
    bar.hidden = false;
    bar.classList.add('is-out');
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.remove('is-out')));
  };
  setTimeout(show, 2600);

  const close = (choice) => {
    try {
      localStorage.setItem(COOKIE_KEY, choice);
    } catch (e) {
      /* ignore */
    }
    bar.classList.add('is-out');
    setTimeout(() => (bar.hidden = true), 650);
  };

  bar.querySelector('[data-accept]')?.addEventListener('click', () => close('accepted'));
  bar.querySelector('[data-deny]')?.addEventListener('click', () => close('denied'));
}

/* --------------------------------------------------------------- misc --- */

export function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/** In-page anchors go through Lenis so they inherit the site's easing. */
export function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-nav')) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    scrollTo(href);
  });
}

export { gsap, ScrollTrigger };
