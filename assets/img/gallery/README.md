# Gallery photos ("Our Moment")

Drop your photos here (any filenames you like) and add each one as a line
in `config.js ▸ gallery.photos` — one flat, mixed list, no need to group by
shoot or separate portrait from landscape. The site checks each path when
the page loads and silently skips any that aren't uploaded yet, no
placeholder tile and no reserved empty slot, so the gallery just shows
exactly however many photos actually exist right now. That also means you
can list a photo before you've uploaded it — it'll simply start appearing
once the file exists.

To add a new photo: drop the file in this folder, add its path as a new
line in `config.js ▸ gallery.photos`. That's it — no concept/category to
pick, nothing else to touch.

Tips:
- Both portrait and landscape photos work fine — they're all cropped to the same tile shape, so mixing orientations in one list is expected and looks fine.
- Keep each file under ~400 KB (export at ~80% JPEG quality), or just run `python3 tools/optimize-images.py` after adding them and it'll do that for you.
