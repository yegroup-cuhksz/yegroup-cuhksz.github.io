const menuToggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const siteNav = document.querySelector<HTMLElement>('[data-site-nav]');

if (menuToggle && siteNav) {
  siteNav.dataset.open = 'false';

  const setMenu = (open: boolean) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    siteNav.dataset.open = String(open);
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setMenu(false);
    }
  });

  const mobileQuery = window.matchMedia('(max-width: 820px)');
  if (!mobileQuery.matches) setMenu(false);
  mobileQuery.addEventListener('change', (event) => {
    if (!event.matches) setMenu(false);
  });
}

const heroCarousel = document.querySelector<HTMLElement>('[data-hero-carousel]');

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll<HTMLElement>('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-hero-dot]'));
  const prevButton = document.querySelector<HTMLButtonElement>('[data-hero-prev]');
  const nextButton = document.querySelector<HTMLButtonElement>('[data-hero-next]');
  const pauseButton = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
  const position = document.querySelector<HTMLElement>('[data-hero-position]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: number | undefined;
  let activeIndex = 0;
  let userPaused = false;
  let interactionPaused = false;
  let completedCycle = false;

  const stop = () => {
    if (timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };

  const updateControls = () => {
    dots.forEach((dot, index) => {
      if (index === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (position) position.textContent = `${activeIndex + 1} / ${slides.length}`;
    if (pauseButton) {
      const paused = userPaused || completedCycle || reduceMotion.matches;
      pauseButton.textContent = reduceMotion.matches ? 'Autoplay off' : paused ? 'Play' : 'Pause';
      pauseButton.disabled = reduceMotion.matches;
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.setAttribute(
        'aria-label',
        reduceMotion.matches
          ? 'Autoplay off because reduced motion is requested'
          : paused
            ? 'Play slideshow'
            : 'Pause slideshow',
      );
    }
  };

  const show = (nextIndex: number) => {
    slides[activeIndex]?.classList.remove('is-active');
    slides[activeIndex]?.setAttribute('aria-hidden', 'true');
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides[activeIndex]?.classList.add('is-active');
    slides[activeIndex]?.setAttribute('aria-hidden', 'false');
    updateControls();
  };

  const canAutoplay = () =>
    slides.length > 1 &&
    !userPaused &&
    !interactionPaused &&
    !completedCycle &&
    !reduceMotion.matches &&
    !document.hidden;

  const syncTimer = () => {
    stop();
    if (canAutoplay()) {
      timer = window.setInterval(() => {
        const nextIndex = activeIndex + 1;
        if (nextIndex >= slides.length) {
          show(0);
          completedCycle = true;
          syncTimer();
          return;
        }
        show(nextIndex);
      }, 5000);
    }
    updateControls();
  };

  const goTo = (nextIndex: number) => {
    completedCycle = false;
    show(nextIndex);
    syncTimer();
  };

  prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));
  pauseButton?.addEventListener('click', () => {
    if (userPaused || completedCycle) {
      userPaused = false;
      completedCycle = false;
    } else {
      userPaused = true;
    }
    syncTimer();
  });

  if (slides.length > 1) {
    heroCarousel.addEventListener('mouseenter', () => {
      interactionPaused = true;
      syncTimer();
    });
    heroCarousel.addEventListener('mouseleave', () => {
      interactionPaused = false;
      syncTimer();
    });
    document.addEventListener('visibilitychange', syncTimer);
    reduceMotion.addEventListener('change', syncTimer);
    syncTimer();
  }
}

const publicationControls = document.querySelector<HTMLElement>('[data-publication-controls]');
const searchInput = document.querySelector<HTMLInputElement>('[data-publication-search]');
const yearSelect = document.querySelector<HTMLSelectElement>('[data-publication-year]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-publication-reset]');
const resultCount = document.querySelector<HTMLElement>('#publication-count');
const noResults = document.querySelector<HTMLElement>('#no-results');

if (publicationControls && searchInput && yearSelect && resetButton && resultCount) {
  publicationControls.hidden = false;
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-publication]'));

  const applyFilters = () => {
    const terms = searchInput.value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const selectedYear = yearSelect.value;
    let visibleCount = 0;

    for (const row of rows) {
      const searchText = row.dataset.search ?? '';
      const matchesYear = !selectedYear || row.dataset.year === selectedYear;
      const matchesTerms = terms.every((term) => searchText.includes(term));
      const visible = matchesYear && matchesTerms;
      row.hidden = !visible;
      if (visible) visibleCount += 1;
    }

    resultCount.textContent = `${visibleCount} publication${visibleCount === 1 ? '' : 's'}`;
    if (noResults) noResults.hidden = visibleCount !== 0;
  };

  searchInput.addEventListener('input', applyFilters);
  yearSelect.addEventListener('change', applyFilters);
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    yearSelect.value = '';
    applyFilters();
    searchInput.focus();
  });
}
