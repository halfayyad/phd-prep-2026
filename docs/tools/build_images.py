#!/usr/bin/env python3
"""Generate placeholder product imagery.

These are stand-ins for real photography — soft tinted grounds with a simple
silhouette per product form. Replace the files in assets/img/products/ with
real shots at the same 4:5 ratio and the layout stays put.
"""
import html
import json, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "products"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1000, 1250
GROUNDS = [("#F4ECE4", "#E3D2C2"), ("#F2E8E6", "#DFC8C2"), ("#EFE9DF", "#D8C6AE"), ("#F3EDE8", "#DCCBBE")]
TINTS = ["#C7A78C", "#C09490", "#B9A183", "#BFA694"]


def silhouette(form, tint):
    """Return SVG for a product form, centred in a 1000x1250 canvas."""
    cx, cy = W / 2, H / 2
    d = tint
    if form == "lipstick":
        return f'''
      <rect x="{cx-70}" y="{cy-40}" width="140" height="300" rx="10" fill="{d}"/>
      <rect x="{cx-58}" y="{cy-250}" width="116" height="215" rx="8" fill="{d}" opacity=".72"/>
      <path d="M {cx-40} {cy-250} L {cx-40} {cy-350} Q {cx-40} {cy-370} {cx-10} {cy-374}
               L {cx+40} {cy-360} L {cx+40} {cy-250} Z" fill="{d}"/>'''
    if form == "wand":
        return f'''
      <rect x="{cx-52}" y="{cy-110}" width="104" height="330" rx="52" fill="{d}"/>
      <rect x="{cx-34}" y="{cy-330}" width="68" height="230" rx="18" fill="{d}" opacity=".72"/>
      <circle cx="{cx}" cy="{cy-350}" r="34" fill="{d}"/>'''
    if form == "pencil":
        return f'''
      <rect x="{cx-38}" y="{cy-300}" width="76" height="520" rx="38" fill="{d}"/>
      <path d="M {cx-38} {cy-300} L {cx} {cy-400} L {cx+38} {cy-300} Z" fill="{d}" opacity=".72"/>
      <rect x="{cx-38}" y="{cy+90}" width="76" height="20" fill="{d}" opacity=".55"/>'''
    if form == "palette":
        pans = ""
        for r in range(3):
            for c in range(3):
                pans += (f'<rect x="{cx-195+c*140}" y="{cy-165+r*120}" width="110" height="90" rx="6" '
                         f'fill="{d}" opacity="{0.42+0.08*((r+c)%3)}"/>')
        return f'''
      <rect x="{cx-260}" y="{cy-230}" width="520" height="440" rx="16" fill="{d}" opacity=".55"/>
      {pans}'''
    if form == "mascara":
        return f'''
      <rect x="{cx-58}" y="{cy-60}" width="116" height="300" rx="14" fill="{d}"/>
      <rect x="{cx-46}" y="{cy-300}" width="92" height="250" rx="12" fill="{d}" opacity=".72"/>
      <rect x="{cx-20}" y="{cy-390}" width="40" height="100" rx="10" fill="{d}"/>'''
    if form == "bottle":
        return f'''
      <rect x="{cx-115}" y="{cy-160}" width="230" height="390" rx="26" fill="{d}"/>
      <rect x="{cx-42}" y="{cy-270}" width="84" height="120" rx="10" fill="{d}" opacity=".72"/>
      <rect x="{cx-62}" y="{cy-330}" width="124" height="70" rx="14" fill="{d}"/>
      <rect x="{cx-80}" y="{cy-40}" width="160" height="150" rx="8" fill="#FFFFFF" opacity=".22"/>'''
    if form == "compact":
        return f'''
      <circle cx="{cx}" cy="{cy}" r="215" fill="{d}" opacity=".55"/>
      <circle cx="{cx}" cy="{cy}" r="155" fill="{d}"/>
      <circle cx="{cx}" cy="{cy}" r="155" fill="#FFFFFF" opacity=".12"/>'''
    # jar
    return f'''
      <rect x="{cx-165}" y="{cy-90}" width="330" height="250" rx="30" fill="{d}"/>
      <rect x="{cx-185}" y="{cy-160}" width="370" height="90" rx="22" fill="{d}" opacity=".72"/>
      <ellipse cx="{cx}" cy="{cy-160}" rx="185" ry="30" fill="{d}"/>'''


def make(slug, name, form, index):
    esc_name = html.escape(name, quote=True)
    top, bottom = GROUNDS[index % len(GROUNDS)]
    tint = TINTS[index % len(TINTS)]
    uid = f"p{index}"
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{esc_name}">
  <defs>
    <linearGradient id="{uid}g" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/>
    </linearGradient>
    <radialGradient id="{uid}l" cx="0.5" cy="0.38" r="0.55">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="{uid}s" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#{uid}g)"/>
  <ellipse cx="{W/2}" cy="{H*0.42}" rx="{W*0.46}" ry="{H*0.4}" fill="url(#{uid}l)"/>
  <ellipse cx="{W/2}" cy="{H*0.78}" rx="230" ry="42" fill="#8B6F55" opacity=".18" filter="url(#{uid}s)"/>
  <g>{silhouette(form, tint)}</g>
  <text x="{W/2}" y="{H-70}" text-anchor="middle" font-family="Jost, Helvetica, Arial, sans-serif"
        font-size="26" letter-spacing="7" fill="#2E2823" fill-opacity="0.34">CÉDRISSE</text>
</svg>'''
    (OUT / f"{slug}.svg").write_text(svg)


data = json.loads((ROOT / "data" / "products.json").read_text())
for i, p in enumerate(data["products"]):
    make(p["slug"], p["name"], p["form"], i)
print(f"wrote {len(data['products'])} product images to {OUT}")


# --- Editorial placeholders (hero, about, social card) -----------------------

def scene(path, w, h, forms, label):
    """A grouped 'flatlay' of product silhouettes on a soft ground."""
    global W, H
    prev_w, prev_h = W, H
    W, H = w, h
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
        f'role="img" aria-label="{html.escape(label, quote=True)}">',
        '<defs>',
        '<linearGradient id="sg" x1="0" y1="0" x2="0.3" y2="1">'
        '<stop offset="0" stop-color="#F4ECE4"/><stop offset="1" stop-color="#DFCCBA"/></linearGradient>',
        '<radialGradient id="sl" cx="0.5" cy="0.36" r="0.55">'
        '<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.6"/>'
        '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>',
        '<filter id="ss" x="-40%" y="-40%" width="180%" height="180%">'
        '<feGaussianBlur stdDeviation="24"/></filter>',
        '</defs>',
        f'<rect width="{w}" height="{h}" fill="url(#sg)"/>',
        f'<ellipse cx="{w/2}" cy="{h*0.4}" rx="{w*0.48}" ry="{h*0.42}" fill="url(#sl)"/>',
    ]
    step = w / (len(forms) + 1)
    for i, form in enumerate(forms):
        x = step * (i + 1)
        scale = 0.52 + 0.06 * (i % 3)
        parts.append(
            f'<ellipse cx="{x:.0f}" cy="{h*0.74:.0f}" rx="{110*scale:.0f}" ry="26" '
            f'fill="#8B6F55" opacity=".18" filter="url(#ss)"/>'
        )
        parts.append(
            f'<g transform="translate({x - W/2:.0f}, {h*0.06:.0f}) scale({scale:.2f}) '
            f'translate({W/2*(1/scale - 1):.0f}, {H/2*(1/scale - 1):.0f})">'
            f'{silhouette(form, TINTS[i % len(TINTS)])}</g>'
        )
    parts.append(
        f'<text x="{w/2}" y="{h-52}" text-anchor="middle" font-family="Jost, Helvetica, Arial, sans-serif" '
        f'font-size="24" letter-spacing="8" fill="#2E2823" fill-opacity="0.34">CÉDRISSE</text>'
    )
    parts.append('</svg>')
    (ROOT / "assets" / "img" / path).write_text("\n".join(parts))
    W, H = prev_w, prev_h


scene("hero.svg", 1000, 1250, ["lipstick", "bottle", "compact"], "Cédrisse cosmetics")
scene("about.svg", 900, 1100, ["jar", "wand", "pencil"], "Cédrisse formulas")
scene("og-cover.svg", 1200, 630, ["lipstick", "palette", "bottle", "mascara"], "Cédrisse")
print("wrote hero.svg, about.svg, og-cover.svg")
