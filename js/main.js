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
    var current = 0;
    var autoplayId = null;

    var goToSlide = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    };

    var restartAutoplay = function () {
      if (autoplayId) window.clearInterval(autoplayId);
      if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        autoplayId = window.setInterval(function () {
          goToSlide((current + 1) % slides.length);
        }, 7000);
      }
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
        restartAutoplay();
      });
    });

    restartAutoplay();
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
