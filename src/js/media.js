/**
 * Small image cyclers — the shuffling stills that live inside the hero pill
 * and inside the giant SEE WORK line in the footer.
 */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fill `el` with stacked <img> elements and cross-cut between them.
 * Returns a stop() handle.
 *
 * @param {HTMLElement} el
 * @param {string[]} urls
 * @param {object} opts  { interval, hoverOnly, alt }
 */
export function mountCycler(el, urls, opts = {}) {
  const { interval = 900, hoverOnly = false, alt = '' } = opts;
  if (!el || !urls?.length) return { stop() {} };

  el.innerHTML = '';
  const imgs = urls.map((url, i) => {
    const img = new Image();
    img.src = url;
    img.alt = i === 0 ? alt : '';
    if (i > 0) img.setAttribute('aria-hidden', 'true');
    if (i === 0) img.classList.add('is-on');
    el.appendChild(img);
    return img;
  });

  let i = 0;
  let timer = null;

  const step = () => {
    imgs[i].classList.remove('is-on');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('is-on');
  };

  const start = () => {
    if (timer || REDUCED) return;
    timer = setInterval(step, interval);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  if (hoverOnly) {
    const host = el.closest('a') || el;
    host.addEventListener('pointerenter', start);
    host.addEventListener('pointerleave', stop);
    host.addEventListener('focusin', start);
    host.addEventListener('focusout', stop);
  } else {
    start();
    // Never burn frames on a cycler nobody is looking at.
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(el);
  }

  return { stop, start };
}
