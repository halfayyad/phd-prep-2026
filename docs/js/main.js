/* ==========================================================================
   CÉDRISSE — site behaviour
   Each module bails out if its markup isn't on the page.
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
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
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
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
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
          window.setTimeout(function () { el.classList.add('is-visible'); }, Number(el.dataset.delay || 0));
          observer.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Accordions ---------- */
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

  /* ---------- Review rotator ---------- */
  document.querySelectorAll('[data-quotes]').forEach(function (root) {
    var quotes = Array.prototype.slice.call(root.querySelectorAll('.quote'));
    var nav = root.querySelector('.quote-nav');
    if (quotes.length < 2 || !nav) return;

    var index = 0, timer = null;
    quotes.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', String(i === 0));
      dot.setAttribute('aria-label', 'Show review ' + (i + 1));
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
    show(0); restart();
    root.addEventListener('mouseenter', function () { window.clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', function () { window.clearInterval(timer); });
  });

  /* ---------- Shop category filter ---------- */
  var grid = document.querySelector('[data-products]');
  var filters = document.querySelectorAll('[data-filter]');
  if (grid && filters.length) {
    var count = document.querySelector('[data-result-count]');

    var apply = function (value, push) {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === value)); });
      var shown = 0;
      grid.querySelectorAll('.product-card').forEach(function (card) {
        var match = value === 'all' || card.dataset.category === value;
        card.hidden = !match;
        if (match) shown++;
      });
      if (count) {
        count.textContent = shown + (shown === 1 ? ' product' : ' products');
      }
      if (push) {
        var url = value === 'all' ? location.pathname : location.pathname + '?c=' + value;
        history.replaceState(null, '', url);
      }
    };

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () { apply(btn.dataset.filter, true); });
    });

    // Deep links from the home page category tiles: shop.html?c=lips
    var initial = new URLSearchParams(location.search).get('c');
    var known = Array.prototype.some.call(filters, function (b) { return b.dataset.filter === initial; });
    apply(known ? initial : 'all', false);
  }

  /* ---------- Product page: shade picker ---------- */
  var shadeList = document.querySelector('[data-shades]');
  if (shadeList) {
    var label = document.querySelector('[data-shade-name]');
    shadeList.addEventListener('click', function (e) {
      var btn = e.target.closest('.shade-btn');
      if (!btn) return;
      shadeList.querySelectorAll('.shade-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var name = btn.dataset.shade;
      if (label) label.textContent = name;
      // The buy button listens for this so an email order carries the shade.
      document.dispatchEvent(new CustomEvent('cedrisse:shade', { detail: { shade: name } }));
    });
  }

  /* ---------- Product page: quantity ---------- */
  document.querySelectorAll('[data-qty]').forEach(function (root) {
    var input = root.querySelector('input');
    root.addEventListener('click', function (e) {
      var step = e.target.closest('[data-step]');
      if (!step || !input) return;
      var next = Number(input.value || 1) + Number(step.dataset.step);
      input.value = Math.min(Math.max(next, Number(input.min || 1)), Number(input.max || 99));
    });
  });

  /* ---------- Forms (contact + newsletter) ---------- */
  document.querySelectorAll('[data-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');

    function fieldError(input, message) {
      var slot = input.closest('.field') && input.closest('.field').querySelector('.error');
      if (slot) slot.textContent = message || '';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate(input) {
      var value = input.value.trim();
      if (input.required && !value) { fieldError(input, 'This field is required.'); return false; }
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        fieldError(input, 'Please enter a valid email address.');
        return false;
      }
      fieldError(input, '');
      return true;
    }

    var fields = function () {
      return Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
        .filter(function (i) { return !i.classList.contains('hp'); });
    };

    fields().forEach(function (input) {
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      var honeypot = form.querySelector('input.hp');
      if (honeypot && honeypot.value) { e.preventDefault(); return; }

      if (!fields().map(validate).every(Boolean)) {
        e.preventDefault();
        var firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }

      // No endpoint wired up yet — confirm locally instead of posting to the
      // placeholder action. Remove data-demo once `action` is a real endpoint.
      if (form.dataset.demo === 'true') {
        e.preventDefault();
        if (status) {
          status.hidden = false;
          status.textContent = form.dataset.demoMessage ||
            'Thank you — this form is not connected to an inbox yet.';
          status.focus();
        }
        form.reset();
      }
    });
  });
})();
