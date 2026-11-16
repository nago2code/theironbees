const stickyNav = document.getElementById('sticky-nav');
const scrollButton = document.getElementById('section-scroll');
const hero = document.getElementById('hero');
const heroBackground = hero.querySelector('[data-hero-background]');
const heroContent = hero.querySelector('[data-hero-content]');
const sections = ['afisha', 'platform', 'contacts'].map((id) =>
  document.getElementById(id)
);
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollFrame = 0;

function applyTheme() {
  document.documentElement.classList.toggle('dark', systemTheme.matches);
}

function hasReachedBottom() {
  return (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 100
  );
}

function updateScrollControls() {
  scrollFrame = 0;
  const scrollY = window.scrollY;
  const atBottom = hasReachedBottom();
  stickyNav.toggleAttribute('data-visible', scrollY > window.innerHeight * 0.6);
  scrollButton.dataset.direction = atBottom ? 'up' : 'down';
  scrollButton.setAttribute(
    'aria-label',
    atBottom ? 'Наверх' : 'К следующему разделу'
  );

  if (!motionPreference.matches) {
    const progress = Math.max(0, Math.min(scrollY / hero.offsetHeight, 1));
    heroBackground.style.setProperty('--hero-offset', `${progress * 30}%`);
    heroContent.style.setProperty(
      '--hero-opacity',
      Math.max(1 - progress / 0.8, 0)
    );
  }
}

function scheduleScrollUpdate() {
  if (!scrollFrame)
    scrollFrame = window.requestAnimationFrame(updateScrollControls);
}

function observeSectionEntrances() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!motionPreference.matches)
          entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -40px' }
  );

  document
    .querySelectorAll('[data-reveal]')
    .forEach((element) => observer.observe(element));
}

function markFinishedConcerts() {
  const now = Date.now();

  for (const link of document.querySelectorAll('[data-concert-start]')) {
    if (Date.parse(link.dataset.concertStart) > now) continue;

    const status = document.createElement('span');
    status.className = 'concert-finished';
    status.textContent = 'ЗАВЕРШЕНО';
    link.parentElement.classList.add('opacity-50', 'grayscale');
    link.replaceWith(status);
  }
}

scrollButton.addEventListener('click', () => {
  const behavior = motionPreference.matches ? 'instant' : 'smooth';

  if (hasReachedBottom()) {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const nextSection = sections.find(
    (section) => section.getBoundingClientRect().top > 80
  );

  if (nextSection) {
    nextSection.scrollIntoView({ behavior });
  } else {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  }
});

applyTheme();
systemTheme.addEventListener('change', applyTheme);
markFinishedConcerts();
stickyNav.hidden = false;
scrollButton.hidden = false;
updateScrollControls();
observeSectionEntrances();
motionPreference.addEventListener('change', scheduleScrollUpdate);
window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('pageshow', scheduleScrollUpdate);
