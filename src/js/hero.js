/**
 * The hero sequence.
 *
 * A stack of full-bleed plates that cross-cut on a timer, each one drifting
 * slowly under a Ken Burns move while it is on screen. The move itself lives
 * in CSS (`.hero__slide.is-on img`), restarted by the class toggle, so this
 * module only decides *when* to cut.
 */

import { gsap } from 'gsap';
import { REDUCED } from './chrome.js';

const HOLD = 5600; // ms each plate stays up

export class HeroSequence {
  /**
   * @param {HTMLElement} stage  container that already holds the .hero__slide markup
   */
  constructor(stage) {
    this.stage = stage;
    this.slides = [...stage.querySelectorAll('.hero__slide')];
    this.index = 0;
    this.timer = null;
    this.paused = false;

    if (!this.slides.length) return;
    this.slides[0].classList.add('is-on');
  }

  start() {
    if (!this.slides.length || this.slides.length < 2 || REDUCED) return;
    this.stop();
    this.timer = setInterval(() => {
      // A background tab shouldn't burn through the sequence unseen.
      if (document.hidden || this.paused) return;
      this.advance();
    }, HOLD);
  }

  advance() {
    const prev = this.slides[this.index];
    this.index = (this.index + 1) % this.slides.length;
    const next = this.slides[this.index];

    next.classList.add('is-on');
    // Hold the outgoing plate until the incoming one has fully arrived, so the
    // cut is a dissolve rather than a flash of the page beneath.
    setTimeout(() => {
      if (this.slides[this.index] !== prev) prev.classList.remove('is-on');
    }, 1500);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  /** Externally driven scroll progress through the hero, 0 → 1. */
  bindScroll(trigger, ScrollTrigger) {
    if (REDUCED) return;

    // The plates sink a little slower than the page, the title a little faster.
    gsap.to(this.stage, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: true },
    });

    ScrollTrigger.create({
      trigger,
      start: 'bottom top',
      onEnter: () => {
        this.paused = true;
      },
      onLeaveBack: () => {
        this.paused = false;
      },
    });
  }

  destroy() {
    this.stop();
  }
}

/** Build the slide markup from a list of { src, position, alt }. */
export function buildSlides(stage, slides) {
  if (!stage) return;
  stage.innerHTML = slides
    .map(
      (s, i) => `
      <div class="hero__slide"${i === 0 ? '' : ' aria-hidden="true"'}>
        <img src="${s.src}" alt="${i === 0 ? s.alt : ''}" style="object-position:${s.position}"
             ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
      </div>`
    )
    .join('');
}
