(function () {
  // Header: transparente no topo, vidro escuro a partir de 10px de scroll.
  // Burger abre/fecha o drawer interno (menu mobile).
  var header = document.getElementById('siteHeader');
  var burger = document.getElementById('burger');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 10);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();

    if (burger) {
      burger.addEventListener('click', function () {
        var open = header.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      });
      document.querySelectorAll('.drawer a').forEach(function (a) {
        a.addEventListener('click', function () {
          header.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          burger.setAttribute('aria-label', 'Abrir menu');
        });
      });
    }
  }

  // Entrada dos banners de vidro: espera a foto do herói estar decodificada e
  // só então libera a animação, para o movimento não disputar a thread com o
  // decode e engasgar. Cada herói lê a própria --hero-img inline.
  var heroes = Array.prototype.slice.call(document.querySelectorAll('.js-hero'));
  if (heroes.length) {
    var makeReady = function (hero) {
      return new Promise(function (resolve) {
        var done = false;
        var finish = function () { if (!done) { done = true; resolve(); } };
        window.setTimeout(finish, 1800); // rede lenta não segura a peça
        var raw = getComputedStyle(hero).getPropertyValue('--hero-img');
        var m = raw && raw.match(/url\(["']?([^"')]+)["']?\)/);
        if (!m) { finish(); return; }
        var img = new Image();
        img.src = m[1];
        var after = function () {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(finish);
          });
        };
        if (img.decode) { img.decode().then(after, after); }
        else { img.onload = after; img.onerror = after; }
      });
    };

    var enter = function (hero) {
      makeReady(hero).then(function () { hero.classList.add('is-in'); });
    };

    if (!('IntersectionObserver' in window)) {
      heroes.forEach(enter);
    } else {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            enter(entry.target);
            heroObserver.unobserve(entry.target);
            window.setTimeout(function () {
              entry.target
                .querySelectorAll('.rv,.rv-rule,.rv-mask > span,.hero__blur')
                .forEach(function (el) { el.style.willChange = 'auto'; });
            }, 4200);
          }
        });
      }, { threshold: 0.15 });
      heroes.forEach(function (h) { heroObserver.observe(h); });
    }
  }

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax do herói de vidro — só no scroll. Nada se move durante a entrada,
  // para o vidro não precisar reamostrar o fundo enquanto faz o fade. O zoom é
  // lido por herói (--hero-zoom inline).
  if (heroes.length && !prefersReduced) {
    var heroTicking = false;
    var updateHeroParallax = function () {
      heroes.forEach(function (h) {
        var r = h.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var zoom = parseFloat(getComputedStyle(h).getPropertyValue('--hero-zoom')) || 1.12;
        var max = h.offsetHeight * 0.05;
        var off = Math.max(-max, Math.min(max, r.top * -0.12));
        var t = 'translate3d(0,' + off.toFixed(1) + 'px,0) scale(' + zoom + ')';
        h.querySelectorAll('.js-media').forEach(function (m) { m.style.transform = t; });
      });
      heroTicking = false;
    };
    var onHeroScroll = function () {
      if (!heroTicking) { window.requestAnimationFrame(updateHeroParallax); heroTicking = true; }
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    window.addEventListener('resize', onHeroScroll);
  }

  // Parallax das faixas internas (cta-bg / feature-bg).
  var parallaxImgs = document.querySelectorAll('[data-parallax]');
  if (parallaxImgs.length && !prefersReduced) {
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

  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.getElementById('contactFormSuccess');
      contactForm.style.display = 'none';
      if (success) success.style.display = 'block';
    });
  }

  // Cards de Áreas de Atuação: deep-link via hash rola até o card
  // correspondente e o destaca brevemente (usado pelos highlights da home e
  // pelos links do rodapé).
  var areaCards = document.querySelectorAll('.area-card');
  if (areaCards.length) {
    var highlightCard = function (card) {
      areaCards.forEach(function (c) { c.classList.remove('is-target'); });
      card.classList.add('is-target');
      card.classList.add('in'); // garante que o reveal não o mantenha oculto
      window.setTimeout(function () {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      window.setTimeout(function () { card.classList.remove('is-target'); }, 2600);
    };
    var cardFromHash = function () {
      if (!window.location.hash) return;
      var target = document.getElementById(window.location.hash.slice(1));
      if (target && target.classList.contains('area-card')) highlightCard(target);
    };
    cardFromHash();
    window.addEventListener('hashchange', cardFromHash);
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
    // Safety net: if anything is still hidden shortly after load (e.g. a
    // screenshot/preview tool that never scrolls, or an observer edge
    // case), reveal it so content is never left invisible.
    window.setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }, 900);
  }
})();
