# Prewedding gallery photos

Drop your prewedding photos here using these exact filenames. The website
reads the list from `config.js ▸ gallery.concepts[].photos` — any file that
isn't here yet just shows a "Segera Hadir" placeholder tile, so you can add
them whenever they're ready without touching any code.

```
tenis-1.jpg   tenis-2.jpg   tenis-3.jpg   tenis-4.jpg
taman-1.jpg   taman-2.jpg   taman-3.jpg   taman-4.jpg
museum-1.jpg  museum-2.jpg  museum-3.jpg  museum-4.jpg
```

Tips:
- Portrait or square photos (e.g. 1200×1500) work best with the grid.
- Keep each file under ~400 KB (export at ~80% JPEG quality) so the page stays fast.
- Want more or fewer than 4 photos per concept, or a 4th concept? Just add/remove
  entries in the matching `photos` array (or a whole new object in `concepts`)
  in `config.js` — the tabs and grid update automatically.
