#!/usr/bin/env python3
"""Record each catalog image's background colour in data/image_backgrounds.json.

The colour is the most common one on the image's edge. Images with a transparent
edge, or with no colour covering at least half of it, get null. Needs Pillow.
Run it when images change, then scripts/build_catalog.py. The site can't do this
in the browser: the image server doesn't allow reading pixels from the live site.

    python3 scripts/niche/image_backgrounds.py
"""
import io
import json
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
NICHE = json.loads((ROOT / "src/niche/niche.json").read_text(encoding="utf8"))
CATALOG = json.loads((ROOT / "public/catalog.json").read_text(encoding="utf8"))
OUT = ROOT / "data/image_backgrounds.json"


def bucket(p):
    return (p[0] // 16, p[1] // 16, p[2] // 16)


def background(data):
    img = Image.open(io.BytesIO(data)).convert("RGBA")
    w, h = img.size
    px = img.load()
    edge = [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)] + [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)]
    if any(p[3] < 250 for p in edge):
        return None
    top, n = Counter(bucket(p) for p in edge).most_common(1)[0]
    if n / len(edge) < 0.5:
        return None
    r, g, b, _ = Counter(p for p in edge if bucket(p) == top).most_common(1)[0][0]
    return f"#{r:02x}{g:02x}{b:02x}"


def fetch(image):
    url = f"{NICHE['image']['base']}/{image}.webp"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(3):
        try:
            return image, background(urllib.request.urlopen(req, timeout=30).read()), None
        except Exception as e:
            error = str(e)
    return image, None, error


def main():
    col = CATALOG["keys"].index("image")
    images = sorted({r[col] for r in CATALOG["rows"] if r[col] is not None})
    with ThreadPoolExecutor(8) as pool:
        results = list(pool.map(fetch, images))
    OUT.write_text(json.dumps({str(i): c for i, c, e in results if not e}, indent=0, sort_keys=True) + "\n", encoding="utf8")
    errors = [(i, e) for i, _, e in results if e]
    colours = Counter(c for _, c, e in results if not e)
    print(f"images {len(images)} · failed {len(errors)} · no colour {colours[None]} · top {colours.most_common(5)}")
    for image, error in errors:
        print(f"failed {image}: {error}")


if __name__ == "__main__":
    main()
