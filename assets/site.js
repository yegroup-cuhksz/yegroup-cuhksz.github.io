/* Progressive enhancement: every page and link works without JavaScript. */
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      menuButton.focus();
    }
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }
  });
}

const searchInput = document.querySelector('#publication-search');
const yearSelect = document.querySelector('#publication-year');
if (searchInput && yearSelect) {
  document.querySelector('.publication-controls').hidden = false;
  const publications = [...document.querySelectorAll('[data-publication]')];
  const update = () => {
    const terms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of publications) {
      const match = (!yearSelect.value || row.dataset.year === yearSelect.value)
        && terms.every(term => row.dataset.search.includes(term));
      row.hidden = !match;
      if (match) count++;
    }
    document.querySelector('#publication-count').textContent = `${count} publication${count === 1 ? '' : 's'}`;
    document.querySelector('#no-results').hidden = count !== 0;
  };
  searchInput.addEventListener('input', update);
  yearSelect.addEventListener('change', update);
  document.querySelector('#clear-filters').addEventListener('click', () => {
    searchInput.value = '';
    yearSelect.value = '';
    update();
    searchInput.focus();
  });
}

const heroCarousel = document.querySelector('[data-hero-carousel]');
if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll('[data-hero-slide]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let activeIndex = 0;

  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  const show = (nextIndex) => {
    slides[activeIndex].classList.remove('is-active');
    slides[activeIndex].setAttribute('aria-hidden', 'true');
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides[activeIndex].classList.add('is-active');
    slides[activeIndex].setAttribute('aria-hidden', 'false');
  };

  const start = () => {
    stop();
    if (slides.length < 2 || reduceMotion.matches || document.hidden) return;
    timer = setInterval(() => show(activeIndex + 1), 5000);
  };

  if (slides.length > 1) {
    heroCarousel.addEventListener('mouseenter', stop);
    heroCarousel.addEventListener('mouseleave', start);
    heroCarousel.addEventListener('focusin', stop);
    heroCarousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', start);
    reduceMotion.addEventListener('change', start);
    start();
  }
}
