/* ARKADY — Sztukateria Łódź: progressive enhancement layer.
   All content is fully usable without this script. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  /* Header state */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-nav') && navList.classList.contains('open')) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Scroll reveals + profile drawing */
  var revealables = document.querySelectorAll('.reveal, .profile-divider');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero video: desktop only, after full load, respecting user preferences.
     The poster <img> stays as the crawlable, instant LCP element. */
  var video = document.querySelector('.hero-video');
  if (video && !reduceMotion && !saveData && window.matchMedia('(min-width: 820px)').matches) {
    var startVideo = function () {
      video.preload = 'auto';
      video.load();
      video.addEventListener('canplaythrough', function onReady() {
        video.removeEventListener('canplaythrough', onReady);
        video.play().then(function () {
          video.classList.add('is-playing');
        }).catch(function () { /* autoplay refused — poster remains */ });
      });
      video.addEventListener('error', function () {
        video.classList.remove('is-playing');
      });
    };
    if (document.readyState === 'complete') {
      setTimeout(startVideo, 300);
    } else {
      window.addEventListener('load', function () { setTimeout(startVideo, 300); });
    }
  }
})();
