/**
 * The work slider.
 *
 * A card deck seen in perspective: the active project stands square to the
 * viewer, the rest fall away to the side, shrinking and turning as they go.
 * Each card is a mounted print — image, category, title, place and year.
 *
 * Position is a float, not an index, so the deck follows a drag continuously
 * and then settles on the nearest card rather than jumping between states.
 * The 3D is CSS perspective rather than WebGL on purpose: the captions rotate
 * with their cards, and real text stays sharp in a way a texture cannot.
 */

import { gsap } from 'gsap';
import { CATEGORIES, PROJECTS, projectPlate } from '../data/projects.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initWork() {
  const root = document.getElementById('workSlider');
  if (!root) return;

  const count = document.getElementById('workCount');
  if (count) count.textContent = String(PROJECTS.length);

  new WorkSlider(root);
}

class WorkSlider {
  constructor(root) {
    this.root = root;
    this.pos = 0; // fractional index — where the deck is now
    this.target = 0; // ...and where it is heading
    this.raf = null;
    this.items = PROJECTS.slice();
    this.category = 'all';
    this.opening = false;

    this.render();
    this.cacheEls();
    this.bind();
    this.measure();
    this.layout();
  }

  /* ------------------------------------------------------------ markup -- */

  render() {
    const chips = CATEGORIES.filter(
      (c) => c.id === 'all' || PROJECTS.some((p) => p.category === c.id)
    )
      .map(
        (c) => `<button type="button" class="chip" data-cat="${c.id}"
                  aria-pressed="${c.id === 'all'}">${c.label}</button>`
      )
      .join('');

    this.root.innerHTML = `
      <div class="slider__bar shell">
        <div class="chips" role="group" aria-label="Filter projects by category">${chips}</div>
        <p class="slider__hint micro">Drag, or use the arrows</p>
      </div>

      <div class="slider__stage" id="sliderStage" tabindex="0" role="group"
           aria-label="Selected work" aria-roledescription="carousel">
        <div class="slider__track" id="sliderTrack"></div>
      </div>

      <div class="slider__controls shell">
        <button type="button" class="slider__arrow" data-dir="-1" aria-label="Previous project">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.6"/>
          </svg>
        </button>
        <div class="slider__rail"><span id="sliderRail"></span></div>
        <button type="button" class="slider__arrow" data-dir="1" aria-label="Next project">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.6"/>
          </svg>
        </button>
        <p class="slider__count micro"><span id="sliderNow">01</span> / <span id="sliderAll">04</span></p>
      </div>`;

    this.paintCards();
  }

  paintCards() {
    const track = this.root.querySelector('#sliderTrack');
    track.innerHTML = this.items
      .map(
        (p, i) => `
      <a class="card" href="project.html?p=${p.slug}" data-i="${i}" data-slug="${p.slug}">
        <span class="card__mount">
          <img src="${projectPlate(p, p.images[0].file)}" alt="${p.images[0].alt}"
               loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false" />
        </span>
        <span class="card__cap">
          <span class="card__cat micro">${p.categoryLabel}</span>
          <span class="card__title">${p.shortTitle || p.title}</span>
          <span class="card__meta">${p.location} · ${p.year}</span>
        </span>
      </a>`
      )
      .join('');

    this.cards = [...track.querySelectorAll('.card')];
    const all = this.root.querySelector('#sliderAll');
    if (all) all.textContent = String(this.items.length).padStart(2, '0');
  }

  cacheEls() {
    this.stage = this.root.querySelector('#sliderStage');
    this.track = this.root.querySelector('#sliderTrack');
    this.rail = this.root.querySelector('#sliderRail');
    this.now = this.root.querySelector('#sliderNow');
  }

  /* ------------------------------------------------------- measurement -- */

  measure() {
    const w = this.stage.clientWidth || window.innerWidth;
    // The card is sized off the stage so the deck keeps its proportions from
    // a phone up to a wide desktop.
    this.cardW = Math.max(180, Math.min(330, w * 0.27));
    this.step = this.cardW * 1.05;
    this.depth = this.cardW * 1.38;

    this.root.style.setProperty('--card-w', `${this.cardW}px`);
    this.stage.style.perspective = `${this.cardW * 4.9}px`;
  }

  /* ----------------------------------------------------------- layout -- */

  layout() {
    if (!this.cards) return;

    this.cards.forEach((card, i) => {
      const d = i - this.pos;
      const ad = Math.abs(d);

      card.style.transform =
        `translate3d(calc(-50% + ${d * this.step}px), -50%, ${-ad * this.depth}px)` +
        ` rotateY(${d * -7}deg)`;
      card.style.opacity = String(Math.max(0.1, 1 - ad * 0.32));
      card.style.zIndex = String(100 - Math.round(ad * 10));
      // Only the card in front is reachable by keyboard or a stray click.
      card.classList.toggle('is-active', Math.round(this.pos) === i);
      card.setAttribute('aria-hidden', Math.round(this.pos) === i ? 'false' : 'true');
      card.tabIndex = Math.round(this.pos) === i ? 0 : -1;
    });

    const n = this.items.length;
    const active = Math.round(this.pos);
    if (this.rail) this.rail.style.transform = `scaleX(${n < 2 ? 1 : (active + 1) / n})`;
    if (this.now) this.now.textContent = String(active + 1).padStart(2, '0');
  }

  get max() {
    return Math.max(0, this.items.length - 1);
  }

  clamp(p) {
    return Math.max(0, Math.min(this.max, p));
  }

  /** Move immediately — used while a finger is down. */
  setPos(p) {
    this.pos = this.target = this.clamp(p);
    this.layout();
  }

  /** Ease towards a target; the loop runs only while there is distance left. */
  glideTo(p) {
    this.target = this.clamp(p);
    if (REDUCED) {
      this.pos = this.target;
      this.layout();
      return;
    }
    this.startLoop();
  }

  startLoop() {
    if (this.raf) return;
    const tick = () => {
      const d = this.target - this.pos;
      if (Math.abs(d) < 0.0004) {
        this.pos = this.target;
        this.layout();
        this.raf = null;
        return;
      }
      this.pos += d * 0.16;
      this.layout();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  go(delta) {
    this.glideTo(Math.round(this.target) + delta);
  }

  /* ---------------------------------------------------------- bindings -- */

  bind() {
    window.addEventListener('resize', () => {
      this.measure();
      this.layout();
    });

    // --- category chips ---
    this.root.querySelector('.chips').addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn || btn.dataset.cat === this.category) return;
      this.category = btn.dataset.cat;
      this.root
        .querySelectorAll('.chip')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      this.filter();
    });

    // --- arrows ---
    this.root.querySelectorAll('.slider__arrow').forEach((btn) =>
      btn.addEventListener('click', () => this.go(Number(btn.dataset.dir)))
    );

    // --- keyboard ---
    this.stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.go(-1); }
    });

    this.stage.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    this.bindDrag();
    this.bindOpen();
  }

  /**
   * Two fingers on the trackpad move the deck, whichever way they travel —
   * the dominant axis wins. The deck only takes the gesture while it still
   * has somewhere to go: at either end the event is left alone so the page
   * carries on scrolling and nobody gets stuck inside the carousel.
   */
  onWheel(e) {
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
    const dx = e.deltaX * unit;
    const dy = e.deltaY * unit;
    const raw = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(raw) < 0.5 || this.max === 0) return;

    const atStart = this.target <= 0.002 && raw < 0;
    const atEnd = this.target >= this.max - 0.002 && raw > 0;
    if (atStart || atEnd) return; // hand it back to the page

    e.preventDefault();
    this.glideTo(this.target + raw / 140);

    // Settle on the nearest card once the gesture stops arriving.
    clearTimeout(this.idle);
    this.idle = setTimeout(() => this.glideTo(Math.round(this.target)), 170);
  }

  /**
   * Deliberately does NOT use setPointerCapture. Capturing the pointer on
   * .stage retargets the resulting click event to .stage itself — since
   * .track/.card are descendants of .stage, not ancestors, a bubbling click
   * listener on .track then never sees it, and every card silently stops
   * opening. Tracking the drag with plain window listeners gets the same
   * behaviour without that side effect.
   */
  bindDrag() {
    let startX = 0;
    let startPos = 0;
    let dragging = false;
    let moved = 0;

    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      this.setPos(startPos - dx / this.step);
    };

    const up = () => {
      if (!dragging) return;
      dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      this.stage.classList.remove('is-dragging');
      this.glideTo(Math.round(this.pos));
      // Distinguish a drag from a click on the card underneath.
      this.justDragged = moved > 6;
      setTimeout(() => (this.justDragged = false), 0);
    };

    this.stage.addEventListener('pointerdown', (e) => {
      if (e.button != null && e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = e.clientX;
      startPos = this.pos;
      clearTimeout(this.idle);
      this.stage.classList.add('is-dragging');
      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }

  bindOpen() {
    this.track.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      // A drag that ended on a card is not a click on it.
      if (this.justDragged) { e.preventDefault(); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      const i = Number(card.dataset.i);
      // A card off to the side is asking to be brought forward, not opened.
      if (i !== Math.round(this.pos)) {
        e.preventDefault();
        this.glideTo(i);
        return;
      }

      if (REDUCED) return;
      e.preventDefault();
      this.open(card);
    });
  }

  /** The active card lifts out of the deck and fills the frame, then leaves. */
  open(card) {
    if (this.opening) return;
    this.opening = true;

    const href = card.getAttribute('href');
    const mount = card.querySelector('.card__mount');
    const from = mount.getBoundingClientRect();
    const scale = Math.max(window.innerWidth / from.width, window.innerHeight / from.height);

    const flyer = mount.cloneNode(true);
    flyer.className = 'card__flyer';
    Object.assign(flyer.style, {
      top: `${from.top}px`,
      left: `${from.left}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
    });
    document.body.appendChild(flyer);

    document.documentElement.classList.add('is-leaving');

    gsap
      .timeline({ onComplete: () => (window.location.href = href) })
      .to(this.root, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(
        flyer,
        {
          top: window.innerHeight / 2 - from.height / 2,
          left: window.innerWidth / 2 - from.width / 2,
          scale,
          duration: 0.9,
          ease: 'expo.inOut',
        },
        0
      );
  }

  /* ---------------------------------------------------------- filtering -- */

  filter() {
    this.items =
      this.category === 'all'
        ? PROJECTS.slice()
        : PROJECTS.filter((p) => p.category === this.category);

    this.paintCards();
    this.pos = this.target = 0;
    this.measure();
    this.layout();

    if (REDUCED) return;
    /* layout() owns every card's transform and opacity, so the entrance is
       played on the track — animating the cards directly would fight it. */
    gsap.fromTo(
      this.track,
      { opacity: 0 },
      { opacity: 1, duration: 0.55, ease: 'power2.out' }
    );
  }
}
