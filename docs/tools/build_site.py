#!/usr/bin/env python3
"""Build the shop from data/products.json.

Run this after editing the catalogue:

    python3 tools/build_site.py

It writes one page per product into shop/, refreshes the product grids on
index.html and shop.html (between the PRODUCTS markers), and regenerates
sitemap.xml. Everything outside the markers is yours to edit freely.
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "products.json").read_text())
TEMPLATE = (ROOT / "tools" / "product.template.html").read_text()
SITE = "https://www.cedrisse.com"

PRODUCTS = DATA["products"]
CATEGORIES = {c["slug"]: c for c in DATA["categories"]}


def esc(text):
    return html.escape(str(text), quote=True)


def money(value):
    return f"{value:,.2f}".rstrip("0").rstrip(".") if value % 1 else f"{value:,.0f}"


def card(p, base=""):
    """One product card, used on the home page, the shop and related rails."""
    cat = CATEGORIES[p["category"]]
    badge = (f'\n        <span class="product-card__badge">{esc(p["badge"])}</span>'
             if p.get("badge") else "")

    shades = p.get("shades") or []
    if shades:
        dots = "".join(
            f'<span class="swatch" style="background:{esc(s["hex"])}"></span>'
            for s in shades[:5]
        )
        extra = f'<span class="product-card__more">+{len(shades) - 5}</span>' if len(shades) > 5 else ""
        shade_html = f'\n          <span class="product-card__shades">{dots}{extra}</span>'
    else:
        shade_html = ""

    return f'''<a class="product-card reveal" href="{base}shop/{p["slug"]}.html" data-category="{esc(p["category"])}">
      <span class="product-card__media">{badge}
        <img src="{base}assets/img/products/{p["slug"]}.svg" alt="{esc(p["name"])}" width="1000" height="1250" loading="lazy">
      </span>
      <span class="product-card__body">
        <span class="product-card__name">{esc(p["name"])}</span>
        <span class="product-card__tagline">{esc(cat["name"])} · {esc(p["tagline"])}</span>
        <span class="product-card__foot">
          <span class="product-card__price">${money(p["price"])}</span>{shade_html}
        </span>
      </span>
    </a>'''


def shades_block(p):
    shades = p.get("shades") or []
    if not shades:
        return ""
    buttons = "\n".join(
        f'''            <li><button class="shade-btn" type="button" data-shade="{esc(s["name"])}"
                aria-pressed="{"true" if i == 0 else "false"}"
                style="background:{esc(s["hex"])}"><span class="visually-hidden">{esc(s["name"])}</span></button></li>'''
        for i, s in enumerate(shades)
    )
    noun = "shade" if len(shades) == 1 else "shades"
    return f'''<div class="shades">
          <p class="shades__label">{len(shades)} {noun} — <strong data-shade-name>{esc(shades[0]["name"])}</strong></p>
          <ul class="shades__list" data-shades>
{buttons}
          </ul>
        </div>
'''


def build_product(p):
    cat = CATEGORIES[p["category"]]
    related = [o for o in PRODUCTS if o["category"] == p["category"] and o["slug"] != p["slug"]]
    if len(related) < 4:
        related += [o for o in PRODUCTS
                    if o["slug"] != p["slug"] and o not in related]
    related_html = "\n      ".join(card(o, base="../") for o in related[:4])

    description = "\n              ".join(f"<p>{esc(par)}</p>" for par in p["description"])
    details = ("<ul>\n                "
               + "\n                ".join(f"<li>{esc(d)}</li>" for d in p["details"])
               + "\n              </ul>")

    json_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p["name"],
        "description": p["description"][0],
        "image": f"{SITE}/assets/img/products/{p['slug']}.svg",
        "brand": {"@type": "Brand", "name": "Cédrisse"},
        "category": cat["name"],
        "offers": {
            "@type": "Offer",
            "price": p["price"],
            "priceCurrency": DATA["currency"],
            "availability": "https://schema.org/InStock",
            "url": f"{SITE}/shop/{p['slug']}.html",
        },
    }, ensure_ascii=False)

    page = TEMPLATE
    for key, value in {
        "base": "../",
        "slug": p["slug"],
        "name": esc(p["name"]),
        "tagline": esc(p["tagline"]),
        "price": money(p["price"]),
        "category_slug": esc(p["category"]),
        "category_name": esc(cat["name"]),
        "meta_description": esc(f'{p["name"]} — {p["tagline"]} {p["description"][0][:110]}'),
        "shades_block": shades_block(p),
        "description_block": description,
        "details_block": details,
        "related_block": related_html,
        "shopify_product_id": esc(p.get("shopifyProductId", "")),
        "json_ld": json_ld,
    }.items():
        page = page.replace("{{" + key + "}}", value)

    (ROOT / "shop" / f'{p["slug"]}.html').write_text(page)


def replace_marker(path, name, content):
    """Swap whatever sits between <!-- name:START --> and <!-- name:END -->."""
    text = path.read_text()
    start, end = f"<!-- {name}:START -->", f"<!-- {name}:END -->"
    i, j = text.find(start), text.find(end)
    if i == -1 or j == -1:
        raise SystemExit(f"{path.name}: missing {name} markers")
    path.write_text(text[: i + len(start)] + "\n      " + content + "\n      " + text[j:])


def build_sitemap():
    urls = [f"{SITE}/", f"{SITE}/shop.html", f"{SITE}/about.html", f"{SITE}/contact.html"]
    urls += [f'{SITE}/shop/{p["slug"]}.html' for p in PRODUCTS]
    body = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n</urlset>\n"
    )


(ROOT / "shop").mkdir(exist_ok=True)
for product in PRODUCTS:
    build_product(product)

replace_marker(ROOT / "shop.html", "PRODUCTS",
               "\n      ".join(card(p) for p in PRODUCTS))
replace_marker(ROOT / "index.html", "PRODUCTS",
               "\n      ".join(card(p) for p in PRODUCTS if p.get("featured")))
build_sitemap()

print(f"built {len(PRODUCTS)} product pages, refreshed shop.html + index.html, wrote sitemap.xml")
