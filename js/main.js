(function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var parallaxImgs = document.querySelectorAll('[data-parallax]');
  if (parallaxImgs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var parallaxTicking = false;
    var updateParallax = function () {
      parallaxImgs.forEach(function (parallaxImg) {
        var rect = parallaxImg.parentElement.getBoundingClientRect();
        var maxTravel = rect.height * 0.18;
        var travel = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.1;
        travel = Math.max(-maxTravel, Math.min(maxTravel, travel));
        parallaxImg.style.transform = 'translate3d(0,' + travel.toFixed(1) + 'px,0)';
      });
      parallaxTicking = false;
    };
    var onParallaxScroll = function () {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    };
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    window.addEventListener('resize', onParallaxScroll);
    updateParallax();
  }

  var heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    var slides = heroSlider.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-slider-dots .dot');
    var prevBtn = document.querySelector('.hero-nav-btn.prev');
    var nextBtn = document.querySelector('.hero-nav-btn.next');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var autoplayId = null;

    var goToSlide = function (index, autoplaying) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
        var fill = dot.querySelector('.dot-fill');
        if (!fill) return;
        fill.classList.remove('is-filling');
        void fill.offsetWidth;
        if (i === index && autoplaying && !reduceMotion) fill.classList.add('is-filling');
      });
    };

    var restartAutoplay = function () {
      if (autoplayId) window.clearInterval(autoplayId);
      if (slides.length > 1 && !reduceMotion) {
        goToSlide(current, true);
        autoplayId = window.setInterval(function () {
          goToSlide((current + 1) % slides.length, true);
        }, 7000);
      }
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i, false);
        restartAutoplay();
      });
    });
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide((current - 1 + slides.length) % slides.length, false);
        restartAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide((current + 1) % slides.length, false);
        restartAutoplay();
      });
    }

    restartAutoplay();
  }

  var accItems = document.querySelectorAll('.area-acc-item');
  if (accItems.length) {
    accItems.forEach(function (item) {
      var accBtn = item.querySelector('.area-acc-header');
      accBtn.addEventListener('click', function () {
        var wasOpen = item.classList.contains('is-open');
        accItems.forEach(function (i) {
          i.classList.remove('is-open');
          i.querySelector('.area-acc-header').setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          item.classList.add('is-open');
          accBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  var teamTrack = document.getElementById('teamTrack');
  var teamPrev = document.querySelector('.team-nav.prev');
  var teamNext = document.querySelector('.team-nav.next');
  if (teamTrack && teamPrev && teamNext) {
    var scrollTeam = function (dir) {
      var card = teamTrack.querySelector('.team-card');
      if (!card) return;
      var gap = parseFloat(window.getComputedStyle(teamTrack).columnGap) || 0;
      teamTrack.scrollBy({ left: (card.getBoundingClientRect().width + gap) * dir, behavior: 'smooth' });
    };
    teamPrev.addEventListener('click', function () { scrollTeam(-1); });
    teamNext.addEventListener('click', function () { scrollTeam(1); });
    var updateTeamNav = function () {
      var max = teamTrack.scrollWidth - teamTrack.clientWidth - 1;
      teamPrev.disabled = teamTrack.scrollLeft <= 0;
      teamNext.disabled = teamTrack.scrollLeft >= max;
    };
    teamTrack.addEventListener('scroll', updateTeamNav, { passive: true });
    window.addEventListener('resize', updateTeamNav);
    updateTeamNav();
  }

  var header = document.querySelector('header');
  if (header) {
    var onHeaderScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
    // Safety net: if anything is still hidden after load (e.g. above-fold
    // on first paint or an observer edge case), reveal it so content is
    // never permanently invisible.
    window.setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  }
})();
