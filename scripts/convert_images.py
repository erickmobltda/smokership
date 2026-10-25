"""Convert the catalog's band photos from the 2021 bucket backup to WebP.

Only the images the catalog uses (data/images.txt) are converted. Run it on
the machine that holds the backup, then upload the output folder:

  python3 -m venv /tmp/smk && /tmp/smk/bin/pip install pillow
  /tmp/smk/bin/python scripts/convert_images.py ~/bkp_bukets_tmp/bucket-20210415-1709 /tmp/smokership-webp
  oci os object bulk-upload -ns grswk1qire9q -bn erickmob-files --src-dir /tmp/smokership-webp \
      --object-prefix smokership/catalog/ --content-type image/webp --overwrite
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MAX_WIDTH = 800  # originals are 990x200; cards show them at most ~450 px wide


def main(src: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    ids = (ROOT / "data/images.txt").read_text().split()
    before = after = missing = 0
    for i in ids:
        original = src / f"{i}.png"
        if not original.exists():
            missing += 1
            print(f"missing {original.name}")
            continue
        with Image.open(original) as im:
            im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
            if im.width > MAX_WIDTH:
                im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
            out = dest / f"{i}.webp"
            im.save(out, "WEBP", quality=80, method=6)
        before += original.stat().st_size
        after += out.stat().st_size
    print(f"{len(ids) - missing} converted, {missing} missing: {before / 1e6:.0f} MB -> {after / 1e6:.0f} MB")


if __name__ == "__main__":
    main(Path(sys.argv[1]).expanduser(), Path(sys.argv[2]).expanduser())
