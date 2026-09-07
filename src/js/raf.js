/**
 * Frame scheduling that still makes progress in a background tab.
 *
 * Browsers stop firing `requestAnimationFrame` while a tab is hidden. Anything
 * purely rAF-driven therefore stalls — which for the loader means a visitor who
 * switches away mid-load comes back to a frozen splash. Racing rAF against a
 * timer keeps the work moving; when the tab is visible, rAF always wins and the
 * behaviour is unchanged.
 */

export function nextFrame(maxWait = 60) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, maxWait);
    requestAnimationFrame(finish);
  });
}

/** rAF that falls back to a timer, for loops that must not stall. */
export function scheduleFrame(fn, maxWait = 60) {
  let settled = false;
  const run = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    fn();
  };
  const timer = setTimeout(run, maxWait);
  requestAnimationFrame(run);
}
