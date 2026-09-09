# Cédrisse Beauty — website

A five-page static marketing site for the makeup business. No build step, no
dependencies, no framework: plain HTML, one stylesheet and one script. Open
`index.html` in a browser and it works.

```
docs/
├── index.html          Home — hero, services, portfolio teaser, process, testimonials
├── services.html       All services, bridal packages, add-ons
├── portfolio.html      Filterable gallery with a lightbox
├── about.html          Artist story, values, credentials, kit
├── contact.html        Enquiry form + FAQ accordion
├── 404.html            Not-found page
├── css/style.css       The whole design system (colours, type, components)
├── js/main.js          Nav, scroll reveal, filters, lightbox, accordion, form
├── assets/img/*.svg    PLACEHOLDER imagery — replace with real photography
├── assets/favicon.svg
├── robots.txt, sitemap.xml, .nojekyll
└── README.md           This file
```

## Run it locally

```bash
cd docs
python3 -m http.server 8000
# then open http://localhost:8000
```

## Before you go live — the replace list

Everything below is placeholder content. Search-and-replace across `docs/`.

| What | Current placeholder | Where |
|---|---|---|
| Email | `hello@cedrissebeauty.com` | every page (footer, contact) |
| Phone | `+1 (555) 018-2470` / `+15550182470` | every page (footer, contact) |
| Domain | `https://cedrissebeauty.com` | `<link rel="canonical">`, `sitemap.xml`, `robots.txt` |
| Social links | `https://instagram.com/`, TikTok, Pinterest | footer of every page, contact page |
| Studio address, hours, service area | "By appointment only", "Tue – Sat, 9am – 6pm", "City & surrounds" | `contact.html` |
| Prices | `$350` / `$650` / `$1,200` and per-service rates | `services.html` |
| Stats | "120+ brides since 2019" | `index.html` hero badge, `about.html` |
| Credentials | certification list | `about.html` |
| Testimonials | quotes marked "Placeholder quote" | `index.html`, `about.html` |
| Photography | every `assets/img/*.svg` | `index.html`, `portfolio.html`, `about.html`, `services.html` |

**Testimonials and stats are fabricated placeholders.** Replace them with real,
permitted client quotes and real numbers before publishing — don't ship them as-is.

### Replacing the images

The SVG placeholders are sized to the aspect ratios the layout expects:

| File | Ratio | Used for |
|---|---|---|
| `hero.svg` | 4:5 portrait | home hero |
| `about.svg` | 4:5 portrait | home split, about page |
| `service-*.svg` | 4:3 landscape | home service cards |
| portfolio images | 4:5 portrait | portfolio grid |
| `og-cover.svg` | 1200×630 | social share preview |

Drop in JPG or WebP files at the same names (updating the `src` extension), keep
the `width`/`height` attributes roughly proportional so nothing jumps while
loading, and rewrite each `alt` to describe the actual photograph. For the social
preview, export `og-cover` as a **JPG or PNG** — most platforms won't render SVG,
and `og:image` should be an absolute URL once you have a domain.

To add or remove portfolio images, copy a `<figure class="gallery__item">` block
in `portfolio.html`. The `data-category` must match one of the filter buttons'
`data-filter` values (`bridal`, `editorial`, `evening`, `natural`); `data-caption`
is what shows in the lightbox.

## Connecting the contact form

The form currently runs in demo mode: it validates, shows a confirmation, and
sends nothing. To receive real enquiries, pick a form backend (Formspree, Basin,
Netlify Forms, Getform — all have free tiers) and in `contact.html`:

1. Set `action` to your endpoint, e.g.
   `action="https://formspree.io/f/YOUR_ID"`.
2. Delete `data-demo="true"` from the `<form>` tag.

Keep `method="post"` and leave the hidden `company` field in place — it's a
honeypot that silently discards bot submissions.

## Deploying

**GitHub Pages** (easiest): repository → Settings → Pages → Source: *Deploy from
a branch*, branch `main`, folder `/docs`. That's why the site lives in `docs/`.

**Netlify / Vercel / Cloudflare Pages**: connect the repo, set the publish
directory to `docs`, leave the build command empty.

Then point your domain at the host and update the canonical URLs and sitemap.

## Design notes

- **Palette** — warm ivory `#FBF8F5`, soft sand `#F3EBE4`, deep ink `#2E2823`,
  bronze accent `#A9814F`. All defined as custom properties at the top of
  `style.css`; change them there and the whole site follows.
- **Type** — Cormorant Garamond (display) + Jost (body), loaded from Google
  Fonts with system-serif and system-sans fallbacks.
- **Accessibility** — skip link, visible focus rings, labelled form fields with
  inline errors, `aria-current` on the active nav item, keyboard-operable
  gallery and lightbox, and full `prefers-reduced-motion` support.
- **Performance** — no framework, no bundler; below-the-fold images use
  `loading="lazy"`. The only external request is the font stylesheet.
