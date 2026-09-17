/**
 * The work grid.
 *
 * Every project as one tile: the plate full-bleed, a dark foot, and under it
 * the city, the title and the category — read top to bottom the way a caption
 * on a print is read. Three across on a desktop, two on a tablet, one on a
 * phone. Tiles wipe in one after another as the grid scrolls into view.
 *
 * Clicking a tile does not just navigate. Where the browser can carry an
 * element across a page load (cross-document view transitions — see the
 * `plate` rules in base.css) the pressed tile's picture is named and the
 * browser slides it into place as the project page's opening picture. Where
 * it cannot, the picture is cloned into a fixed flyer and driven out to fill
 * the screen while the page fades, and only then does the location change.
 * Either way the project is arrived at rather than loaded.
 */

import { gsap } from 'gsap';
import { PROJECTS, projectPlate } from '../data/projects.js';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// The page-reveal event only exists where navigations can be transitioned.
const CARRIES = 'PageRevealEvent' in window && CSS.supports('view-transition-name: plate');

export function initWork() {
  const grid = document.getElementById('workGrid');
  if (!grid) return;

  const count = document.getElementById('workCount');
  if (count) count.textContent = String(PROJECTS.length);

  grid.innerHTML = PROJECTS.map(tile).join('');
  bindOpen(grid);
}

/* -------------------------------------------------------------- markup --- */

/** The city alone — the caption wants a place name, not a postal line. */
const city = (location) => location.split(',')[0].trim();

function tile(p, i) {
  const im = p.images[0];
  // The first row is above the fold on most screens; the rest can wait.
  const eager = i < 3;
  return `
    <a class="tile" href="project.html?p=${p.slug}" data-slug="${p.slug}"
       data-clip style="--stagger:${i % 3}">
      <span class="tile__mount">
        <img src="${projectPlate(p, im.file, 'lg')}" alt="${im.alt}"
             loading="${eager ? 'eager' : 'lazy'}" decoding="async" draggable="false" />
      </span>
      <span class="tile__cap">
        <span class="tile__place micro">${city(p.location)}</span>
        <span class="tile__title">${p.shortTitle || p.title}</span>
        <span class="tile__cat micro">${p.categoryLabel}</span>
      </span>
    </a>`;
}

/* ------------------------------------------------------------- opening --- */

let opening = false;

function bindOpen(grid) {
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.tile');
    if (!card) return;
    // Modifier clicks and middle clicks mean "new tab" — leave them to the browser.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (REDUCED) return;
    if (CARRIES) {
      // Only one element may carry the name; this tile's picture takes it for
      // the navigation the browser is about to make.
      card.querySelector('.tile__mount').style.viewTransitionName = 'plate';
      return;
    }
    e.preventDefault();
    open(card);
  });
}

/**
 * Fly the tile's image out to full bleed, fade the page under it, then go.
 * The flyer is a clone pinned to the viewport, so the grid itself never moves.
 */
function open(card) {
  if (opening) return;
  opening = true;

  const href = card.getAttribute('href');
  const mount = card.querySelector('.tile__mount');
  const from = mount.getBoundingClientRect();
  const scale = Math.max(window.innerWidth / from.width, window.innerHeight / from.height);

  const flyer = mount.cloneNode(true);
  flyer.className = 'tile__flyer';
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
    .to('main', { opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
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
