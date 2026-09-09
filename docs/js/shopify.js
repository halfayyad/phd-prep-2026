/* ==========================================================================
   Buy buttons.

   With Shopify configured (js/shopify-config.js) this mounts a real
   Shopify Buy Button into every [data-buy] container and wires the header
   cart button to the Shopify cart.

   Without it, each buy button becomes a pre-filled email order link so the
   site is still usable on launch day.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.CEDRISSE_SHOPIFY || {};
  var slots = document.querySelectorAll('[data-buy]');
  if (!slots.length) return;

  var configured = Boolean(cfg.domain && cfg.storefrontAccessToken);

  if (!configured) {
    slots.forEach(fallback);
    return;
  }

  loadSdk(function (ok) {
    if (!ok) { slots.forEach(fallback); return; }
    var client = window.ShopifyBuy.buildClient({
      domain: cfg.domain,
      storefrontAccessToken: cfg.storefrontAccessToken
    });
    var ui = window.ShopifyBuy.UI.init(client);

    slots.forEach(function (slot) {
      var id = slot.dataset.productId;
      if (!id) { fallback(slot); return; }
      slot.innerHTML = '';
      ui.createComponent('product', {
        id: id,
        node: slot,
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
          product: {
            iframe: false,
            contents: { img: false, title: false, price: false },
            text: { button: 'Add to bag' }
          },
          cart: { text: { total: 'Subtotal', button: 'Checkout' } }
        }
      });
    });

    // Header cart button opens the Shopify cart drawer.
    var cartBtn = document.querySelector('[data-cart-toggle]');
    if (cartBtn) {
      cartBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var cart = ui.components.cart && ui.components.cart[0];
        if (cart) cart.open();
      });
    }
  });

  function loadSdk(done) {
    if (window.ShopifyBuy && window.ShopifyBuy.UI) return done(true);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    s.onload = function () { done(Boolean(window.ShopifyBuy && window.ShopifyBuy.UI)); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  function fallback(slot) {
    var name = slot.dataset.productName || 'a Cédrisse product';
    var email = cfg.orderEmail || 'hello@cedrisse.com';

    var link = document.createElement('a');
    link.className = 'btn btn--block';
    link.textContent = 'Email to order';
    link.href = mailto(email, name, '');
    slot.innerHTML = '';
    slot.appendChild(link);

    var note = document.createElement('p');
    note.className = 'buy-note';
    note.textContent = 'Online checkout is opening soon — send an email and we will take the order by reply.';
    slot.appendChild(note);

    // Keep the mail link in step with the shade the visitor picked.
    document.addEventListener('cedrisse:shade', function (e) {
      link.href = mailto(email, name, e.detail && e.detail.shade);
    });
  }

  function mailto(email, name, shade) {
    var subject = 'Order enquiry — ' + name;
    var body = 'Hello,\n\nI would like to order:\n\n  ' + name +
      (shade ? '\n  Shade: ' + shade : '') +
      '\n  Quantity: 1\n\nThank you,\n';
    return 'mailto:' + email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }
})();
