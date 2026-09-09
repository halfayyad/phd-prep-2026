/* ==========================================================================
   Shopify connection — fill these two values in to turn the site into a
   working shop. Both come from your Shopify admin:

     domain                → Settings → Domains, the *.myshopify.com one
     storefrontAccessToken → Settings → Apps and sales channels →
                             Develop apps → create an app → Storefront API,
                             tick "unauthenticated_read_product_listings"
                             and "unauthenticated_write_checkouts"

   Then put each product's Shopify product ID into data/products.json
   (the "shopifyProductId" field) and re-run tools/build_site.py.

   The Storefront access token is a PUBLIC token — it is designed to be
   readable in the browser. Never put an Admin API token here.

   Until this is filled in, every buy button falls back to an email order
   link, so the site still works.
   ========================================================================== */
window.CEDRISSE_SHOPIFY = {
  domain: "",
  storefrontAccessToken: "",
  orderEmail: "hello@cedrisse.com"
};
