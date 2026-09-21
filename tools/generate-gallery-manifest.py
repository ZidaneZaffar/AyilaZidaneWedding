#!/usr/bin/env python3
"""List every photo in assets/img/gallery/ into a manifest so new
uploads show up in the "Our Moments" gallery automatically -- no
filename convention and no config.js edit needed.

Run manually after adding photos locally:

    python3 tools/generate-gallery-manifest.py

The GitHub Pages deploy workflow also runs this on every push, so a
photo dropped straight into assets/img/gallery/ via GitHub's web
upload appears on the live site after that deploy finishes, with
zero other changes.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY_DIR = os.path.join(ROOT, "assets", "img", "gallery")
MANIFEST_PATH = os.path.join(GALLERY_DIR, "manifest.json")
EXTS = (".jpg", ".jpeg", ".png", ".webp")


def main():
    if not os.path.isdir(GALLERY_DIR):
        print("No assets/img/gallery/ directory found -- nothing to do.")
        return

    files = sorted(
        f for f in os.listdir(GALLERY_DIR)
        if f.lower().endswith(EXTS)
    )
    photos = ["assets/img/gallery/" + f for f in files]

    with open(MANIFEST_PATH, "w") as fh:
        json.dump(photos, fh, indent=2)
        fh.write("\n")

    print("Wrote manifest.json with {} photo(s):".format(len(photos)))
    for p in photos:
        print("  " + p)


if __name__ == "__main__":
    main()
