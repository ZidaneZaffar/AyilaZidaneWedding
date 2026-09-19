# Prewedding gallery photos

Drop your prewedding photos here using these filenames. The website reads
the lists from `config.js ▸ gallery.concepts[].photos` (portrait, the top
two auto-scrolling rows) and `config.js ▸ gallery.concepts[].landscape`
(a separate section further down, after the gift section) — the site
checks each path when the page loads and silently skips any that aren't
uploaded yet, no placeholder tile and no reserved empty slot, so the row
just shows exactly however many photos actually exist right now.

```
Portrait (top two rows):
  tenis-1.jpg    tenis-2.jpg    tenis-3.jpg    tenis-4.jpg
  taman-1.jpg    taman-2.jpg    taman-3.jpg    taman-4.jpg
  museum-1.jpg   museum-2.jpg   museum-3.jpg   museum-4.jpg

Landscape (bottom row):
  tenis-1-ls.jpg    tenis-2-ls.jpg    tenis-3-ls.jpg
  taman-1-ls.jpg    taman-2-ls.jpg    taman-3-ls.jpg    taman-4-ls.jpg
  museum-1-ls.jpg   museum-2-ls.jpg   museum-3-ls.jpg   museum-4-ls.jpg
```

Neither list is a fixed count — tenis can have 3 landscape shots while
museum has 5, and they don't need to match their own portrait count either.
Just add/remove entries in the matching `photos`/`landscape` array (or a
whole new object in `concepts` for another shoot) in `config.js`; the rows
update automatically, nothing else to touch.

Tips:
- Portrait shots: portrait or square photos (e.g. 1200×1500) work best.
- Landscape shots: wide photos (e.g. 1500×1000) work best — they render in a noticeably wider tile.
- Keep each file under ~400 KB (export at ~80% JPEG quality), or just run `python3 tools/optimize-images.py` after adding them and it'll do that for you.
