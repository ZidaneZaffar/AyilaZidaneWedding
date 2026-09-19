#!/usr/bin/env python3
"""Shrink oversized photos before they ship to guests on mobile data.

Run manually after dropping a new full-size photo into assets/img/:

    pip install pillow
    python3 tools/optimize-images.py

The GitHub Pages deploy workflow also runs this automatically on every
push to main, so an unoptimized upload never blocks a fast build itself
-- but running it locally first keeps the committed file small too.
"""
import os
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (folder, max long-edge px, jpeg quality) -- gallery photos are viewed
# small (marquee tiles) or in a ~560px lightbox, so they can be capped
# much harder than the full-bleed cover/portrait photos.
TARGETS = [
    (os.path.join(ROOT, "assets", "img"), 2000, 82),
    (os.path.join(ROOT, "assets", "img", "gallery"), 1600, 78),
]
EXTS = (".jpg", ".jpeg", ".png")


def optimize(path, max_dim, quality):
    original_size = os.path.getsize(path)
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)  # bake in rotation, drop the EXIF orientation tag
    changed_size = im.width > max_dim or im.height > max_dim
    if changed_size:
        im.thumbnail((max_dim, max_dim), Image.LANCZOS)

    ext = os.path.splitext(path)[1].lower()
    if ext == ".png":
        im.save(path, "PNG", optimize=True)
    else:
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB")
        im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)

    new_size = os.path.getsize(path)
    if new_size < original_size:
        print("  {:<40} {:>7.1f}KB -> {:>7.1f}KB".format(
            os.path.relpath(path, ROOT), original_size / 1024, new_size / 1024))
    return original_size, new_size


def main():
    total_before = total_after = 0
    for folder, max_dim, quality in TARGETS:
        if not os.path.isdir(folder):
            continue
        for name in sorted(os.listdir(folder)):
            path = os.path.join(folder, name)
            if not os.path.isfile(path) or not name.lower().endswith(EXTS):
                continue
            before, after = optimize(path, max_dim, quality)
            total_before += before
            total_after += after

    if total_before:
        print("Total: {:.1f}MB -> {:.1f}MB".format(
            total_before / 1024 / 1024, total_after / 1024 / 1024))
    else:
        print("No images found to optimize.")


if __name__ == "__main__":
    sys.exit(main())
