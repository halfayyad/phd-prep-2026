/* ==========================================================================
   CÉDRISSE BEAUTY — site behaviour
   Every module is optional: each one bails out if its markup isn't on the page.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // Reset when resizing back to desktop so the drawer can't stay latched open.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) setMenu(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = Number(el.dataset.delay || 0);
          window.setTimeout(function () { el.classList.add('is-visible'); }, delay);
          observer.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Accordion (FAQ) ---------- */
  document.querySelectorAll('.accordion').forEach(function (accordion) {
    accordion.querySelectorAll('.accordion__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.accordion__item');
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (accordion.dataset.single === 'true' && !open) {
          accordion.querySelectorAll('.accordion__btn[aria-expanded="true"]').forEach(function (other) {
            other.setAttribute('aria-expanded', 'false');
            other.closest('.accordion__item').classList.remove('is-open');
          });
        }
        btn.setAttribute('aria-expanded', String(!open));
        item.classList.toggle('is-open', !open);
      });
    });
  });

  /* ---------- Testimonial rotator ---------- */
  document.querySelectorAll('[data-quotes]').forEach(function (root) {
    var quotes = Array.prototype.slice.call(root.querySelectorAll('.quote'));
    var nav = root.querySelector('.quote-nav');
    if (quotes.length < 2 || !nav) return;

    var index = 0;
    var timer = null;

    quotes.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(i === 0));
      dot.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
      dot.addEventListener('click', function () { show(i); restart(); });
      nav.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(nav.children);

    function show(i) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, n) { q.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) { d.setAttribute('aria-selected', String(n === index)); });
    }
    function restart() {
      if (reduceMotion) return;
      window.clearInterval(timer);
      timer = window.setInterval(function () { show(index + 1); }, 7000);
    }
    show(0);
    restart();
    root.addEventListener('mouseenter', function () { window.clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', function () { window.clearInterval(timer); });
  });

  /* ---------- Portfolio filter ---------- */
  var gallery = document.querySelector('[data-gallery]');
  var filters = document.querySelectorAll('[data-filter]');
  if (gallery && filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.dataset.filter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        gallery.querySelectorAll('.gallery__item').forEach(function (item) {
          item.hidden = value !== 'all' && item.dataset.category !== value;
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox && gallery) {
    var lbImage = lightbox.querySelector('img');
    var lbCaption = lightbox.querySelector('.lightbox__caption');
    var lastFocused = null;
    var current = 0;

    function visibleItems() {
      return Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item')).filter(function (i) {
        return !i.hidden;
      });
    }
    function render(i) {
      var items = visibleItems();
      if (!items.length) return;
      current = (i + items.length) % items.length;
      var item = items[current];
      var img = item.querySelector('img');
      lbImage.src = img.getAttribute('src');
      lbImage.alt = img.getAttribute('alt') || '';
      lbCaption.textContent = (item.dataset.caption || '') +
        ' — ' + (current + 1) + ' / ' + items.length;
    }
    function open(i) {
      lastFocused = document.activeElement;
      render(i);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      lightbox.querySelector('.lightbox__close').focus();
    }
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (lastFocused) lastFocused.focus();
    }

    gallery.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery__item');
      if (!item || item.classList.contains('gallery__item--static')) return;
      open(visibleItems().indexOf(item));
    });
    gallery.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var item = e.target.closest('.gallery__item');
      if (!item || item.classList.contains('gallery__item--static')) return;
      e.preventDefault();
      open(visibleItems().indexOf(item));
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
      if (e.target.closest('.lightbox__close')) close();
      if (e.target.closest('.lightbox__btn--next')) render(current + 1);
      if (e.target.closest('.lightbox__btn--prev')) render(current - 1);
    });
    window.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') render(current + 1);
      if (e.key === 'ArrowLeft') render(current - 1);
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector('[data-form]');
  if (form) {
    var status = form.querySelector('.form-status');

    function fieldError(input, message) {
      var slot = input.closest('.field').querySelector('.error');
      if (slot) slot.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate(input) {
      var value = input.value.trim();
      if (input.required && !value) {
        fieldError(input, 'This field is required.');
        return false;
      }
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        fieldError(input, 'Please enter a valid email address.');
        return false;
      }
      fieldError(input, '');
      return true;
    }

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (input.classList.contains('hp')) return;
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      var honeypot = form.querySelector('input.hp');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }

      var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
        .filter(function (i) { return !i.classList.contains('hp'); });
      var valid = fields.map(validate).every(Boolean);

      if (!valid) {
        e.preventDefault();
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      // No form endpoint configured yet — show a friendly confirmation instead of
      // posting to the placeholder action. Remove this block once the real
      // endpoint is set in the form's `action` attribute (see docs/README.md).
      if (form.dataset.demo === 'true') {
        e.preventDefault();
        if (status) {
          status.hidden = false;
          status.textContent =
            'Thank you — your enquiry has been noted. (This demo form is not yet connected to an inbox; ' +
            'connect a form endpoint to start receiving messages.)';
          status.focus();
        }
        form.reset();
      }
    });
  }
})();
