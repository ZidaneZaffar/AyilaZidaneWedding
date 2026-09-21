# Gallery photos ("Our Moments")

Drop your photos here (any filenames you like) and add each one as a line
in `config.js ▸ gallery.photos` — one flat, mixed list, no need to group by
shoot. The site checks each path when the page loads and silently skips any
that aren't uploaded yet, no placeholder tile and no reserved empty slot,
so the gallery just shows exactly however many photos actually exist right
now. That also means you can list a photo before you've uploaded it — it'll
simply start appearing once the file exists.

Portrait and landscape photos can be mixed in the list freely — you don't
need to say which is which. The site reads each photo's real dimensions
and gives landscape shots a wider tile automatically.

To add a new photo: drop the file in this folder, add its path as a new
line in `config.js ▸ gallery.photos`. That's it — no concept/category or
orientation to pick, nothing else to touch.

Tips:
- Keep each file under ~400 KB (export at ~80% JPEG quality), or just run `python3 tools/optimize-images.py` after adding them and it'll do that for you.
