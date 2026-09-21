# Gallery photos ("Our Moments")

Just drop your photos in this folder — any filename, no naming convention,
nothing to edit anywhere. On the next deploy, `tools/generate-gallery-manifest.py`
lists whatever's actually in this folder and the site reads that list, so a
new upload shows up in the "Our Moments" gallery automatically.

Portrait and landscape photos can be mixed freely — the site reads each
photo's real dimensions and gives landscape shots a wider tile
automatically, no need to say which is which.

Removing a photo works the same way — delete the file, and it disappears
from the gallery on the next deploy.

Tips:
- Keep each file under ~400 KB (export at ~80% JPEG quality), or just run `python3 tools/optimize-images.py` after adding them and it'll do that for you.
- Testing locally? Run `python3 tools/generate-gallery-manifest.py` after adding/removing files so your local preview matches what a deploy would produce.
