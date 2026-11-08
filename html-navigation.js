/* Highlight the visible section without changing document content. */
(() => {
  function initializeNavigation() {
    const toc = document.querySelector('#TOC');
    if (!toc) return;
    const entries = Array.from(toc.querySelectorAll('a[href^="#"]'))
      .map(link => {
        let id;
        try { id = decodeURIComponent(link.hash.slice(1)); }
        catch { return null; }
        const heading = document.getElementById(id);
        return heading ? { link, heading } : null;
      }).filter(Boolean);
    if (!entries.length) return;
    let activeLink = null;
    let scheduled = false;
    function update() {
      scheduled = false;
      let active = null;
      for (const entry of entries) {
        if (entry.heading.getBoundingClientRect().top <= 140) active = entry;
      }
      if (activeLink === active?.link) return;
      if (activeLink) {
        activeLink.classList.remove('is-current-section');
        activeLink.removeAttribute('aria-current');
      }
      activeLink = active?.link || null;
      if (activeLink) {
        activeLink.classList.add('is-current-section');
        activeLink.setAttribute('aria-current', 'location');
      }
    }
    function scheduleUpdate() {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
  } else initializeNavigation();
})();

/* A decorative progress indicator; no study content is modified. */
(() => {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let scheduled = false;
  function update() {
    scheduled = false;
    const root = document.documentElement;
    const distance = root.scrollHeight - root.clientHeight;
    const fraction = distance > 0 ? window.scrollY / distance : 0;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  document.addEventListener('toggle', schedule, true);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(schedule).observe(document.body);
  }
  update();
})();
