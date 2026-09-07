/**
 * Fit a single line of type to the width of its container.
 *
 * The reference hero is one headline stretched edge to edge, which no static
 * `clamp()` can guarantee across every viewport and every string length. This
 * measures the line at a known size and scales from there.
 */

export function fitLine(el, opts = {}) {
  if (!el) return () => {};
  const { min = 22, max = 460, trim = 0.995 } = opts;
  const parent = opts.container || el.parentElement;
  if (!parent) return () => {};

  const fit = () => {
    const avail = parent.clientWidth - horizontalPadding(parent);
    if (avail <= 0) return;

    /* Measure at `max-content`, not `scrollWidth`: a block-level heading is
       already as wide as its container, so scrollWidth would just hand back
       the container width and the line would never grow. */
    const prevWidth = el.style.width;
    el.style.fontSize = '100px';
    el.style.width = 'max-content';
    const natural = el.offsetWidth;
    el.style.width = prevWidth;
    if (!natural) return;

    el.style.fontSize = `${clamp((100 * avail * trim) / natural, min, max)}px`;
  };

  fit();

  // Webfonts land after first paint and change the metrics, so measure again.
  if (document.fonts?.ready) document.fonts.ready.then(fit);

  if (typeof ResizeObserver !== 'undefined') {
    // Observing the container (never the element) keeps this out of a loop.
    new ResizeObserver(fit).observe(parent);
  } else {
    window.addEventListener('resize', fit);
  }

  return fit;
}

function horizontalPadding(el) {
  const s = getComputedStyle(el);
  return parseFloat(s.paddingLeft || 0) + parseFloat(s.paddingRight || 0);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
