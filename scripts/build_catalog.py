"""Build public/catalog.json from the legacy SQL loads.

Sources (copied from the old cigarsDbBackEnd Flyway migrations):
  data/legacy/cigar_aficionado.sql  20,933 Cigar Aficionado review rows (V1_1_1)
  data/legacy/br_cigars.sql         Brazilian cigars added by hand (V1_1_3)

The Cigar Aficionado file has one row per review, so a cigar reviewed in
several years appears several times with different scores. Rows are merged
by name: the cigar keeps every score, and each spec takes its most common
non-empty value. Rows without a gauge are dropped, as the old V1_1_2 did.

Usage: python3 scripts/build_catalog.py
"""

import csv
import io
import json
import re
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ROW = re.compile(r"^\s*\((.*)\)[,;]?\s*$", re.M)
IMAGE = re.compile(r"/o/(\d+)\.png$")
STRENGTHS = ["Mild", "Mild-Medium", "Medium", "Medium-Full", "Full"]
KEEP_UPPER = re.compile(r"^(?:[IVXL]+|[A-Z]\.(?:[A-Z]\.)+|[A-Z]{1,3}\d*|\d+\w*)$")
SMALL = {"de", "del", "y", "da", "do", "di", "the", "of", "and", "con", "sin"}


def sql_rows(path: Path) -> list[list[str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    return [
        next(csv.reader(io.StringIO(r), quotechar="'", escapechar="\\", skipinitialspace=True))
        for r in ROW.findall(text)
    ]


def clean(value: str) -> str:
    value = re.sub(r"\s+", " ", (value or "").strip())
    return "" if value == "NULL" else value


def title(name: str) -> str:
    """Cigar Aficionado names are all caps; make them readable."""
    words = []
    for i, word in enumerate(name.split(" ")):
        if KEEP_UPPER.match(word) and not word.isalpha() or re.fullmatch(r"[IVX]+", word):
            words.append(word)
        elif word.upper() == "NO.":
            words.append("No.")
        elif i > 0 and word.lower() in SMALL:
            words.append(word.lower())
        else:
            words.append("-".join(p[:1].upper() + p[1:].lower() for p in word.split("-")))
    return " ".join(words)


def strength(value: str) -> str:
    return value if value in STRENGTHS else ""


def most_common(values: list[str]) -> str:
    values = [v for v in values if v]
    return Counter(values).most_common(1)[0][0] if values else ""


def image_id(url: str) -> int | None:
    m = IMAGE.search(url or "")
    return int(m.group(1)) if m else None


def aficionado() -> list[dict]:
    groups: "OrderedDict[str, list[tuple[int, list[str]]]]" = OrderedDict()
    for n, r in enumerate(sql_rows(ROOT / "data/legacy/cigar_aficionado.sql"), start=1):
        # brand,name,score,length,gauge,strength,size,filler,binder,wrapper,country,img_url
        r = [clean(v) for v in r]
        if not r[1] or not r[4]:
            continue
        groups.setdefault(r[1].upper(), []).append((n, r))

    cigars = []
    for rows in groups.values():
        first = rows[0][0]
        col = lambda i: [r[i] for _, r in rows]  # noqa: E731
        scores = [int(s) for s in col(2) if s.isdigit()]
        images = [image_id(u) for u in col(11)]
        cigars.append({
            "id": f"ca{first}",
            "name": title(rows[0][1][1]),
            "brand": "",
            "length": most_common(col(3)),
            "gauge": most_common(col(4)),
            "strength": most_common([strength(s) for s in col(5)]),
            "size": most_common(col(6)),
            "filler": most_common(col(7)),
            "binder": most_common(col(8)),
            "wrapper": most_common(col(9)),
            "country": most_common(col(10)),
            "scores": scores,
            "image": next((i for i in images if i), None),
        })
    return cigars


def brazilian() -> list[dict]:
    cigars = []
    for n, r in enumerate(sql_rows(ROOT / "data/legacy/br_cigars.sql"), start=1):
        # created_by,created_date,last_modified_by,last_modified_date,binder,brand,country,
        # filler,gauge,img_url,length,name,score,size,strength,wrapper
        r = [clean(v) for v in r]
        cigars.append({
            "id": f"br{n}",
            "name": r[11],
            "brand": r[5],
            "length": r[10],
            "gauge": r[8],
            "strength": strength(r[14]),
            "size": r[13],
            "filler": r[7],
            "binder": r[4],
            "wrapper": r[15],
            "country": r[6],
            "scores": [],
            "image": image_id(r[9]),
        })
    return cigars


def main() -> None:
    cigars = brazilian() + aficionado()
    ids = [c["id"] for c in cigars]
    assert len(ids) == len(set(ids)), "duplicate ids"
    # Short keys keep the file small; src/lib/catalog.ts expands them.
    keys = ["id", "name", "brand", "length", "gauge", "strength", "size",
            "filler", "binder", "wrapper", "country", "scores", "image"]
    out = {"keys": keys, "rows": [[c[k] for k in keys] for c in cigars]}
    dest = ROOT / "public/catalog.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with_image = sum(1 for c in cigars if c["image"])
    print(f"{len(cigars)} cigars ({with_image} with image) -> {dest.relative_to(ROOT)} "
          f"({dest.stat().st_size / 1024:.0f} KB)")
    images = sorted({c["image"] for c in cigars if c["image"]})
    (ROOT / "data/images.txt").write_text("".join(f"{i}\n" for i in images))


if __name__ == "__main__":
    main()
