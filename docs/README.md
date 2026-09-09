# Cédrisse — cedrisse.com

The storefront for Cédrisse cosmetics. Plain HTML, CSS and JavaScript with a
small Python generator — no framework, no npm, no build server. Open
`index.html` in a browser and it works.

```
docs/
├── index.html            Home — hero, categories, bestsellers, shade range, reviews, newsletter
├── shop.html             All products, filterable by category
├── shop/*.html           One page per product  ← generated, don't hand-edit
├── about.html            Brand story and standards
├── contact.html          Contact form + shipping/returns FAQ
├── 404.html
├── data/products.json    THE CATALOGUE — this is the file you edit
├── tools/
│   ├── build_site.py     Regenerates product pages, grids and sitemap
│   ├── build_images.py   Regenerates the placeholder imagery
│   └── product.template.html   Layout for a product page
├── css/style.css         Whole design system (colours, type, components)
├── js/main.js            Nav, filters, shade picker, quantity, accordions, forms
├── js/shopify.js         Buy buttons + cart
├── js/shopify-config.js  ← put your Shopify keys here
├── assets/img/products/  PLACEHOLDER product images
├── CNAME                 www.cedrisse.com
└── robots.txt, sitemap.xml, .nojekyll
```

## Run it locally

```bash
cd docs
python3 -m http.server 8000
# open http://localhost:8000
```

## Editing the catalogue

`data/products.json` is the single source of truth. Every product page, the shop
grid, the bestsellers on the home page and the sitemap are built from it.

After **any** change to that file:

```bash
cd docs
python3 tools/build_site.py
```

That rewrites `shop/*.html` and the grids inside `index.html` and `shop.html`
(only the part between the `<!-- PRODUCTS:START -->` / `<!-- PRODUCTS:END -->`
markers — everything else on those pages is yours to edit by hand).

Each product takes these fields:

| Field | Notes |
|---|---|
| `slug` | URL and image filename. Lowercase, hyphens, no spaces. |
| `name`, `tagline`, `price` | Shown on the card and product page. |
| `category` | One of `lips`, `eyes`, `face`, `skin`. |
| `form` | Shape used for the placeholder image: `lipstick`, `wand`, `pencil`, `palette`, `mascara`, `bottle`, `compact`, `jar`. |
| `badge` | Optional ribbon, e.g. `Bestseller`, `New`. Empty string for none. |
| `featured` | `true` puts it in the home-page bestsellers. |
| `description` | Array of paragraphs. |
| `details` | Array of bullet points (size, finish, key ingredients). |
| `shades` | Array of `{ name, hex }`. Empty array hides the shade picker. |
| `shopifyProductId` | See below. |

## Connecting Shopify

The buy buttons work in two modes. Out of the box — with no Shopify keys — every
"Add to bag" becomes an **Email to order** link that opens a pre-filled message
including the shade the customer picked. That means you can launch before the
store is wired up.

To switch on real checkout:

1. In Shopify: **Settings → Apps and sales channels → Develop apps → Create an
   app → Storefront API**. Tick `unauthenticated_read_product_listings` and
   `unauthenticated_write_checkouts`, then install the app and copy the
   Storefront access token.
2. Put your `*.myshopify.com` domain and that token into
   `js/shopify-config.js`.
3. For each product, copy its Shopify **product ID** (the long number at the end
   of the admin URL) into `shopifyProductId` in `data/products.json`.
4. Re-run `python3 tools/build_site.py`.

The Storefront access token is designed to be public and readable in the
browser. **Never** put an Admin API token in this file.

Shopify's Buy Button supplies its own variant dropdown, cart and checkout. The
shade swatches on the product page are a visual preview — the dropdown inside
the buy button is what actually selects the variant.

## Before you go live — the replace list

| What | Current placeholder | Where |
|---|---|---|
| **Customer reviews** | three quotes marked "Placeholder" | `index.html` |
| Product photography | every `assets/img/products/*.svg` | generated placeholders |
| Hero and about imagery | `assets/img/hero.svg`, `about.svg`, `og-cover.svg` | |
| Product names, copy, prices | all twelve entries | `data/products.json` |
| Brand story | "We started with the products we kept running out of" | `about.html` |
| Shipping rates and policy | $6 standard, $14 express, free over $60, 30-day returns | `contact.html`, product template, announcement bar |
| Instagram / TikTok links | `https://instagram.com/` | footer of every page |
| Email | `hello@cedrisse.com` | throughout |

**The reviews are fabricated placeholders.** Replace them with real, permitted
customer quotes before launch — don't ship them as they are. The same goes for
any claim you can't stand behind: "cruelty-free", "dermatologist tested" and
"20 shades" are written into the home page and must be true of your actual
products or removed.

### Replacing the images

Product images are 4:5 portraits (1000×1250). Drop real photos into
`assets/img/products/` named `<slug>.jpg`, then update the `src` extension in
`tools/product.template.html` and in the `card()` function of
`tools/build_site.py`, and re-run the generator.

For the social preview, export `og-cover` as **JPG or PNG** — most platforms
won't render SVG.

## Connecting the forms

The contact form and newsletter both run in demo mode: they validate, confirm,
and send nothing. To receive real messages, pick a form backend (Formspree,
Basin, Netlify Forms) and for each form:

1. Set `action` to your endpoint.
2. Delete the `data-demo="true"` attribute.

Leave the hidden `company` field in place — it's a spam honeypot.

## Deploying

**GitHub Pages:** repo → Settings → Pages → Source *Deploy from a branch* →
branch `main`, folder `/docs`. The `CNAME` file already points at
`www.cedrisse.com`; at your registrar add a `CNAME` DNS record for `www`
pointing to `<username>.github.io`, then tick **Enforce HTTPS**.

**Netlify / Vercel / Cloudflare Pages:** connect the repo, publish directory
`docs`, empty build command.

## Design notes

- **Palette** — ivory `#FBF8F5`, sand `#F3EBE4`, ink `#2E2823`, bronze
  `#A9814F`. All CSS custom properties at the top of `style.css`.
- **Type** — Cormorant Garamond (display) + Jost (body) from Google Fonts, with
  system fallbacks so nothing breaks if the request fails.
- **Accessibility** — skip link, visible focus rings, `aria-current` nav,
  labelled fields with inline errors, keyboard-operable shade and quantity
  controls, and full `prefers-reduced-motion` support.
- **Structured data** — every product page carries schema.org `Product` JSON-LD
  with price and availability, so listings can show rich results.
