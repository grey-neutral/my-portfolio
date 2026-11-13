/* Navigation is native HTML. This small enhancement only tracks the current section. */
(() => {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const header = document.querySelector('.site-header');
  let scheduled = false;

  function updateCurrentSection() {
    const threshold = header.getBoundingClientRect().height + 48;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) current = section;
    }
    if (Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateCurrentSection);
  }
  window.addEventListener('scroll', scheduleUpdate, {passive: true});
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  updateCurrentSection();
})();
