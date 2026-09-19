/* =============================================================
   AYILA & ZIDANE — application logic
   Reads everything from window.WEDDING_CONFIG (config.js)
   ============================================================= */
(function () {
  "use strict";

  var C = window.WEDDING_CONFIG;
  if (!C) { console.error("config.js not loaded"); return; }

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* ---------------------------------------------------------
     META / TITLE / FAVICON
     --------------------------------------------------------- */
  var setMeta = function (sel, value) { var m = $(sel); if (m) m.content = value; };
  document.title = C.meta.siteTitle;
  setMeta("#ogTitle", C.meta.siteTitle);
  setMeta("#ogDesc", C.meta.description);
  setMeta('meta[name="description"]', C.meta.description);
  if (C.meta.ogImage) setMeta("#ogImage", new URL(C.meta.ogImage, location.href).href);
  (function favicon() {
    var e = C.meta.favicon || "💍";
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="50" font-size="52">' + e + "</text></svg>";
    var l = document.createElement("link");
    l.rel = "icon"; l.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(l);
  })();

  var namesHTML = C.couple.displayTitle.replace(/\s*&amp;\s*|\s*&\s*/, '<span class="amp">&</span>');

  /* ---------------------------------------------------------
     COVER
     The cover photo itself already carries the eyebrow/names/date/
     honorific as part of its design — only a personalised guest name
     (from ?to=) is rendered on top, and only when one is given.
     --------------------------------------------------------- */
  if (C.cover && C.cover.photo) {
    var coverImg = $("#coverPhoto");
    coverImg.onload  = function () { coverImg.classList.add("is-ready"); };
    coverImg.onerror = function () { coverImg.remove(); };
    coverImg.alt = C.couple.displayTitle.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
    coverImg.decoding = "async";
    coverImg.fetchPriority = "high"; // it's the LCP element, so skip the browser's default lazy heuristics
    coverImg.src = C.cover.photo;
  }

  // Personalised greeting:  index.html?to=Ade%20Fitriyani
  var params = new URLSearchParams(location.search);
  var guest = (params.get("to") || params.get("guest") || "").trim();
  if (guest) {
    $("#guestName").textContent = decodeURIComponent(guest);
    $("#coverGuestBlock").hidden = false;
  }

  /* ---------------------------------------------------------
     COUPLE / CLOSING
     --------------------------------------------------------- */
  function fillPerson(rootSel, p) {
    var root = $(rootSel);
    $("[data-name]", root).textContent   = p.fullName;
    $("[data-order]", root).textContent  = p.order;
    $("[data-father]", root).textContent = p.father;
    $("[data-mother]", root).textContent = p.mother;
    $("[data-mono]", root).textContent   = (p.shortName || p.fullName).trim().charAt(0).toUpperCase();
    if (p.photo) {
      var img = $("[data-photo]", root);
      img.onload  = function () { img.hidden = false; $("[data-mono]", root).style.display = "none"; };
      img.onerror = function () { img.remove(); };
      // No loading="lazy" here: the element starts `hidden` (display:none)
      // until it loads, and a display:none element never gets close enough
      // to the viewport for the browser's lazy-load heuristic to fire --
      // the fetch simply never starts and the monogram fallback sticks forever.
      img.decoding = "async";
      img.src = p.photo;
      img.alt = p.fullName;
    } else {
      $("[data-photo]", root).remove();
    }
    if (p.instagram) {
      var ig = $("[data-ig]", root);
      ig.href = p.instagram; ig.hidden = false;
      ig.setAttribute("aria-label", "Instagram " + p.fullName);
    }
  }
  fillPerson("#personBride", C.couple.bride);
  fillPerson("#personGroom", C.couple.groom);

  /* ---------------------------------------------------------
     GALLERY + LIGHTBOX
     All photos from every shoot are flattened into two rows that
     auto-scroll horizontally in opposite directions (no tabs, no
     manual paging) — each row's track is duplicated once so the
     CSS animation loops seamlessly.
     --------------------------------------------------------- */
  (function gallery() {
    var G = C.gallery;
    if (!G || !Array.isArray(G.concepts) || !G.concepts.length) {
      var sec = $("#sec-gallery"); if (sec) sec.remove();
      var secLS0 = $("#sec-gallery-ls"); if (secLS0) secLS0.remove();
      return;
    }

    var galleryGrid = $("#galleryGrid"), galleryGridLS = $("#galleryGridLS");
    var row1 = $("#galleryRow1"), row2 = $("#galleryRow2"), rowLS = $("#galleryRowLS");

    // The photo count is dynamic, not a fixed layout of slots: a path
    // listed in config.js that hasn't been uploaded yet is dropped
    // entirely rather than reserved as an empty/placeholder tile, so
    // every concept can grow or shrink independently with no gaps.
    // That means we can't build the rows straight from config -- we
    // have to probe each URL first and keep only the ones that load.
    var allEntries = [];
    G.concepts.forEach(function (c) {
      (c.photos || []).forEach(function (src, i) {
        allEntries.push({ src: src, label: c.label, n: i + 1, ls: false });
      });
    });
    G.concepts.forEach(function (c) {
      (c.landscape || []).forEach(function (src, i) {
        allEntries.push({ src: src, label: c.label, n: i + 1, ls: true });
      });
    });

    function probe(entry) {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(entry); };
        img.onerror = function () { resolve(null); };
        img.src = entry.src;
      });
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all(allEntries.map(probe)).then(function (results) {
      // Portrait and landscape photos are flattened into ONE array
      // (shared by the lightbox, so prev/next crosses both rows) but
      // tracked into separate row index-lists, since landscape tiles
      // use a different aspect ratio and can't share a row with
      // portrait ones.
      var photos = [];
      var idxA = [], idxB = [], idxLS = [];
      results.forEach(function (p) {
        if (!p) return; // failed to load -- skip, no placeholder
        var gi = photos.length;
        photos.push(p);
        if (p.ls) idxLS.push(gi);
        else (idxA.length <= idxB.length ? idxA : idxB).push(gi);
      });

      if (!idxA.length && !idxB.length) { var sec1 = $("#sec-gallery"); if (sec1) sec1.remove(); galleryGrid = null; }
      if (!idxLS.length) { var secLS = $("#sec-gallery-ls"); if (secLS) secLS.remove(); galleryGridLS = null; }
      if (!photos.length) return;

      function tileHTML(p, i) {
        return '' +
        '<button type="button" class="gtile' + (p.ls ? " gtile--ls" : "") + '" data-idx="' + i + '" aria-label="Lihat foto ' + (i + 1) + ' — ' + esc(p.label) + '">' +
          '<img src="' + esc(p.src) + '" alt="' + esc(p.label) + ' ' + p.n + '">' +
        '</button>';
      }

      function fillRow(trackEl, idxList) {
        var html = idxList.map(function (i) { return tileHTML(photos[i], i); }).join("");
        trackEl.innerHTML = reduceMotion ? html : html + html; // duplicate for seamless loop
      }

      if (galleryGrid) { fillRow(row1, idxA); fillRow(row2, idxB); }
      if (galleryGridLS) fillRow(rowLS, idxLS);

      [galleryGrid, galleryGridLS].forEach(function (marqueeEl) {
        if (!marqueeEl) return;
        $$(".gtile img", marqueeEl).forEach(function (img) {
          img.decoding = "async";
          img.onload = function () { img.closest(".gtile").classList.add("is-ready"); };
          if (img.complete) img.closest(".gtile").classList.add("is-ready"); // already cached from the probe
        });
        marqueeEl.addEventListener("click", function (e) {
          var t = e.target.closest(".gtile");
          if (!t) return;
          openLightbox(parseInt(t.dataset.idx, 10));
        });
      });

      // Auto-scroll is driven from JS (not a CSS animation) so the row
      // stays a genuine native-scroll container the guest can grab and
      // drag/swipe at any time — dragging just pauses the auto-advance
      // for a moment rather than fighting it. Speed is tracked in
      // px/second and stepped by the real frame delta (not a fixed
      // per-frame amount) so it moves at the same visual speed on a
      // 60Hz and a 120Hz screen alike, instead of the 120Hz one looking
      // twice as fast/jittery.
      if (!reduceMotion) {
        var rows = [];
        if (galleryGrid) { rows.push({ track: row1, dir: 1 }, { track: row2, dir: -1 }); }
        if (galleryGridLS) rows.push({ track: rowLS, dir: 1 });
        rows.forEach(function (row) {
          var el = row.track.parentElement; // the scrollable .gallery-row
          var half = row.track.scrollWidth / 2;
          if (!half) return;
          var PX_PER_SEC = 27; // slow and "halus"
          // Position is tracked as our own float, not read back from
          // el.scrollLeft (which the browser stores as an integer) —
          // otherwise a sub-1px increment never accumulates, since each
          // frame re-adds a fraction to a value that keeps truncating
          // back down to the same whole pixel.
          var pos = el.scrollLeft;
          var paused = false, resumeTimer, lastT = null;
          function pauseNow() { paused = true; clearTimeout(resumeTimer); }
          function scheduleResume() {
            clearTimeout(resumeTimer);
            resumeTimer = setTimeout(function () {
              pos = el.scrollLeft; // pick up from wherever the guest dragged it
              paused = false;
            }, 700);
          }
          el.addEventListener("pointerdown", pauseNow);
          el.addEventListener("pointerup", scheduleResume);
          el.addEventListener("pointercancel", scheduleResume);
          el.addEventListener("mouseenter", pauseNow);
          el.addEventListener("mouseleave", scheduleResume);
          function tick(t) {
            if (lastT != null && !paused) {
              var dt = Math.min(t - lastT, 100); // clamp so a tab switch can't jump the scroll
              pos += row.dir * PX_PER_SEC * (dt / 1000);
              if (pos >= half) pos -= half;
              else if (pos <= 0) pos += half;
              el.scrollLeft = pos;
            }
            lastT = t;
            requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      }

      // ---- Lightbox ----
      var lb = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCaption");
      var lbIdx = 0;

      function updateLightbox() {
        var p = photos[lbIdx];
        lbImg.src = p.src;
        lbImg.alt = p.label + " " + p.n;
        lbCap.textContent = p.label + " · " + (lbIdx + 1) + " / " + photos.length;
      }
      function openLightbox(i) {
        lbIdx = i;
        updateLightbox();
        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-locked");
      }
      function closeLightbox() {
        lb.classList.remove("is-open");
        lb.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-locked");
      }
      function step(dir) {
        lbIdx = (lbIdx + dir + photos.length) % photos.length;
        updateLightbox();
      }

      $("#lightboxClose").addEventListener("click", closeLightbox);
      $("#lightboxPrev").addEventListener("click", function () { step(-1); });
      $("#lightboxNext").addEventListener("click", function () { step(1); });
      lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
      document.addEventListener("keydown", function (e) {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
      });
    });
  })();

  /* ---------------------------------------------------------
     PARALLAX BACKGROUND
     The soft venue photo behind the couple/events sections drifts a
     little slower than the page scroll, via a CSS custom property
     the pseudo-element's transform reads -- cheap (one style write
     per rAF-throttled scroll tick) and works on mobile Safari, unlike
     background-attachment:fixed which mobile browsers largely ignore.
     --------------------------------------------------------- */
  (function parallax() {
    var els = $$(".sec--couple, .sec--events");
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var shift = (center - vh / 2) * 0.08; // 8% of the section's distance from screen-center
        el.style.setProperty("--bg-shift", shift.toFixed(1) + "px");
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  $("#closingText").textContent    = C.closing.text;
  $("#closingSignoff").textContent = C.closing.signOff;
  $("#closingNames").innerHTML     = namesHTML;
  $("#footNames").innerHTML        = namesHTML.replace(/<[^>]+>/g, " ").trim();
  $("#closingFamilies").innerHTML  =
    "Keluarga Besar " + esc(C.couple.bride.father) + " &amp; " + esc(C.couple.bride.mother.split("&")[0].trim()) +
    "<br>Keluarga Besar " + esc(C.couple.groom.father) + " &amp; " + esc(C.couple.groom.mother.split("&")[0].trim());

  /* ---------------------------------------------------------
     GOOGLE CALENDAR + MAPS LINKS
     --------------------------------------------------------- */
  function gcalStamp(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  function calendarUrl(opts) {
    var q = new URLSearchParams({
      action: "TEMPLATE",
      text: opts.title,
      dates: gcalStamp(opts.startISO) + "/" + gcalStamp(opts.endISO),
      details: (opts.description || "").replace(/\\n/g, "\n") + "\n\n" + location.href,
      location: C.venue.name + ", " + C.venue.address,
      ctz: "Asia/Jakarta"
    });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }
  $("#calBtn").href = calendarUrl(C.calendar);

  var mapFrame = $("#mapFrame");
  if (mapFrame) mapFrame.src = "https://www.google.com/maps?q=" + encodeURIComponent(C.venue.mapsEmbedQuery) + "&output=embed";

  /* ---------------------------------------------------------
     EVENTS
     --------------------------------------------------------- */
  $("#eventsList").innerHTML = C.events.map(function (ev) {
    var cal = calendarUrl({
      title: ev.name + " — " + C.calendar.title,
      startISO: ev.startISO, endISO: ev.endISO,
      description: C.calendar.description
    });
    return '' +
    '<article class="event reveal">' +
      '<svg class="event__ico" aria-hidden="true"><use href="#i-' + esc(ev.icon) + '"/></svg>' +
      '<h3 class="event__name">' + esc(ev.name) + '</h3>' +
      '<p class="event__sub">' + esc(ev.subtitle) + '</p>' +
      '<p class="event__time">' + esc(ev.timeLabel) + '</p>' +
      '<p class="event__note">' + esc(C.wedding.dayLabel) + ', ' + esc(C.wedding.dateLabel) + ' · ' + esc(ev.timeNote) + '</p>' +
      '<div class="event__rule"></div>' +
      '<p class="event__place">' + esc(C.venue.name) + '</p>' +
      '<p class="event__addr">' + esc(C.venue.address) + '</p>' +
      '<div class="event__links">' +
        '<a class="chip" href="' + esc(C.venue.mapsUrl) + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-pin"/></svg>Lihat Peta</a>' +
        '<a class="chip" href="' + esc(cal) + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-cal"/></svg>Save the Date</a>' +
      '</div>' +
    '</article>';
  }).join("");

  /* ---------------------------------------------------------
     COUNTDOWN
     --------------------------------------------------------- */
  $("#countDate").textContent = C.wedding.dayLabel + ", " + C.wedding.dateLabel;
  var target = new Date(C.wedding.countdownTo).getTime();
  var cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  var pad = function (n) { return String(n).padStart(2, "0"); };

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = "00";
      $("#countDone").hidden = false;
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400));
    cd.h.textContent = pad(Math.floor(s % 86400 / 3600));
    cd.m.textContent = pad(Math.floor(s % 3600 / 60));
    cd.s.textContent = pad(s % 60);
  }
  var timer = setInterval(tick, 1000); tick();

  /* ---------------------------------------------------------
     GIFT
     --------------------------------------------------------- */
  $("#giftHeading").textContent = C.gift.heading;
  $("#giftIntro").textContent   = C.gift.intro;

  $("#giftAccounts").innerHTML = C.gift.accounts.map(function (a, i) {
    return '' +
    '<div class="gift-card reveal">' +
      (a.logo ? '<img src="' + esc(a.logo) + '" alt="" style="height:26px;margin:0 auto 10px">' : '') +
      '<p class="gift-card__bank">' + esc(a.bank) + '</p>' +
      '<p class="gift-card__num" id="acct' + i + '">' + esc(a.number) + '</p>' +
      '<p class="gift-card__holder">a.n. ' + esc(a.holder) + '</p>' +
      '<button type="button" class="copy" data-copy="' + esc(a.number) + '">' +
        '<svg aria-hidden="true"><use href="#i-copy"/></svg><span>Salin Nomor</span>' +
      '</button>' +
    '</div>';
  }).join("");

  if (C.gift.qris && C.gift.qris.image) {
    $("#giftQris").innerHTML = '' +
      '<img class="gift-qris__img" src="' + esc(C.gift.qris.image) + '" alt="Kode QRIS">' +
      '<p class="gift-qris__label">Scan untuk bayar dengan QRIS</p>';
    $("#giftQris").hidden = false;
  }

  if (C.gift.registry && C.gift.registry.url) {
    var reg = C.gift.registry;
    $("#giftRegistry").innerHTML = '' +
      '<p class="gift-card__bank">Gift Registry</p>' +
      (reg.text ? '<p class="gift-registry__text">' + esc(reg.text) + '</p>' : '') +
      '<a class="btn btn--solid" href="' + esc(reg.url) + '" target="_blank" rel="noopener">' +
        '<svg class="btn__ico" aria-hidden="true"><use href="#i-gift"/></svg>' +
        '<span>Buka Gift Registry</span>' +
      '</a>';
    $("#giftRegistry").hidden = false;
  }

  var ga = C.gift.address;
  $("#giftAddress").innerHTML = '' +
    '<p class="gift-addr__label">' + esc(ga.label) + '</p>' +
    (ga.recipient ? '<p class="gift-addr__to">' + esc(ga.recipient) + '</p>' : '') +
    '<p class="gift-addr__val">' + esc(ga.value) + '</p>' +
    (ga.phone ? '<p class="gift-addr__phone">' + esc(ga.phone) + '</p>' : '') +
    '<button type="button" class="copy" data-copy="' + esc(ga.value) + '">' +
      '<svg aria-hidden="true"><use href="#i-copy"/></svg><span>Salin Alamat</span>' +
    '</button>';

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    var done = function () {
      btn.classList.add("done");
      $("span", btn).textContent = "Tersalin ✓";
      toast("Berhasil disalin");
      setTimeout(function () { btn.classList.remove("done"); $("span", btn).textContent = text.length > 24 ? "Salin Alamat" : "Salin Nomor"; }, 2200);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else { fallbackCopy(); }
    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (_) { toast("Gagal menyalin"); }
      ta.remove();
    }
  });

  /* ---------------------------------------------------------
     TOAST
     --------------------------------------------------------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------------------------------------------------------
     JSONP TRANSPORT  (no CORS configuration required)
     --------------------------------------------------------- */
  var jsonpId = 0;
  function jsonp(payload, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var url = C.rsvp.scriptUrl;

      // Demo mode: with no scriptUrl but a rsvp.demoWishes array in config.js,
      // the wishes wall runs on sample data so you can preview the design.
      if (!url && Array.isArray(C.rsvp.demoWishes)) {
        setTimeout(function () {
          if (payload.action === "wishes") { resolve({ ok: true, data: C.rsvp.demoWishes }); }
          else {
            C.rsvp.demoWishes.unshift({
              name: payload.name, attendance: payload.attendance,
              guests: payload.guests, message: payload.message,
              timestamp: new Date().toISOString()
            });
            resolve({ ok: true, demo: true });
          }
        }, 350);
        return;
      }

      if (!url) { reject(new Error("NO_SCRIPT_URL")); return; }
      var cb = "__wcb" + (++jsonpId) + "_" + Date.now();
      var q  = new URLSearchParams(payload);
      q.set("callback", cb);
      var s = document.createElement("script");
      var to = setTimeout(function () { cleanup(); reject(new Error("TIMEOUT")); }, timeoutMs || 15000);
      function cleanup() { clearTimeout(to); delete window[cb]; s.remove(); }
      window[cb] = function (data) { cleanup(); resolve(data); };
      s.onerror = function () { cleanup(); reject(new Error("NETWORK")); };
      s.src = url + (url.indexOf("?") > -1 ? "&" : "?") + q.toString();
      document.body.appendChild(s);
    });
  }

  /* ---------------------------------------------------------
     RSVP FORM
     --------------------------------------------------------- */
  var form = $("#rsvpForm"), submitBtn = $("#submitBtn"), statusEl = $("#formStatus");
  var guestsField = $("#guestsField"), guestsInput = $("#fGuests");

  // A personalised link can cap the guest count below the site-wide
  // max — e.g. ?to=Budi%20Santoso&pax=2 lets that guest pick 1 or 2,
  // while a guest invited with pax=1 can only ever pick 1.
  var invitedPax = parseInt(params.get("pax"), 10);
  var guestsMax = (invitedPax >= 1) ? Math.min(invitedPax, C.rsvp.maxGuests) : C.rsvp.maxGuests;
  guestsInput.max = guestsMax;
  if (invitedPax >= 1) {
    $("#guestsHint").textContent = guestsMax === 1
      ? "Undangan ini untuk 1 orang."
      : "Undangan ini untuk maksimal " + guestsMax + " orang (termasuk Anda sendiri).";
  }

  $("#fMessage").addEventListener("input", function () {
    $("#charCount").textContent = this.value.length;
  });

  var stepperBtns = $$(".stepper__btn");
  function syncStepperBtns() {
    var v = parseInt(guestsInput.value, 10);
    stepperBtns.forEach(function (b) {
      var step = parseInt(b.dataset.step, 10);
      b.disabled = (step < 0 && v <= 1) || (step > 0 && v >= guestsMax);
    });
  }

  stepperBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var v = parseInt(guestsInput.value, 10) + parseInt(b.dataset.step, 10);
      guestsInput.value = Math.min(guestsMax, Math.max(1, v));
      syncStepperBtns();
    });
  });
  syncStepperBtns();

  $$('input[name="attendance"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var going = r.value === "Hadir";
      guestsField.classList.toggle("is-hidden", !going);
      if (!going) guestsInput.value = 0; else if (+guestsInput.value < 1) guestsInput.value = 1;
      syncStepperBtns();
    });
  });

  // Prefill from the ?to= parameter or a previous submission on this device.
  try {
    var saved = localStorage.getItem("wedding_guest_name");
    $("#fName").value = guest || saved || "";
  } catch (_) { $("#fName").value = guest || ""; }

  function setError(name, msg) {
    var el = document.querySelector('[data-err="' + name + '"]');
    if (el) { el.textContent = msg || ""; el.closest(".field").classList.toggle("is-error", !!msg); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = ""; statusEl.className = "form__status";
    ["name", "attendance", "message"].forEach(function (n) { setError(n, ""); });

    var name = $("#fName").value.trim();
    var att  = (form.querySelector('input[name="attendance"]:checked') || {}).value;
    var msg  = $("#fMessage").value.trim();
    var ok = true;

    if (name.length < 2) { setError("name", "Mohon isi nama lengkap Anda."); ok = false; }
    if (!att)            { setError("attendance", "Mohon pilih konfirmasi kehadiran."); ok = false; }
    if (msg.length < 3)  { setError("message", "Mohon tulis ucapan Anda."); ok = false; }
    if (!ok) { (form.querySelector(".is-error input, .is-error textarea") || {}).focus?.(); return; }

    if (!C.rsvp.scriptUrl && !Array.isArray(C.rsvp.demoWishes)) {
      statusEl.className = "form__status bad";
      statusEl.textContent = "RSVP belum aktif — script URL belum diisi di config.js.";
      return;
    }

    submitBtn.classList.add("is-loading"); submitBtn.disabled = true;

    jsonp({
      action: "submit",
      name: name,
      attendance: att,
      guests: att === "Hadir" ? guestsInput.value : 0,
      message: msg
    }, 30000).then(function (res) {
      if (!res || res.ok !== true) throw new Error(res && res.error || "FAILED");
      try { localStorage.setItem("wedding_guest_name", name); } catch (_) {}
      statusEl.className = "form__status ok";
      statusEl.textContent = res.demo
        ? "Mode pratinjau — ucapan tampil di bawah, tetapi belum tersimpan ke Google Sheets."
        : "Terima kasih! Ucapan Anda telah terkirim. 🤍";
      $("#fMessage").value = ""; $("#charCount").textContent = "0";
      toast("Ucapan terkirim");
      prependWish({ name: name, attendance: att, message: msg, timestamp: new Date().toISOString() });
      setTimeout(loadWishes, 1200);
    }).catch(function (err) {
      statusEl.className = "form__status bad";
      if (err.message === "TIMEOUT") {
        // The server can still be processing (e.g. queued behind another submission)
        // after our client-side wait gives up — refresh the feed rather than
        // telling the guest it failed when it may well have gone through.
        statusEl.textContent = "Respon server lama. Memeriksa apakah ucapan Anda sudah tersimpan…";
        setTimeout(loadWishes, 2000);
      } else {
        statusEl.textContent = "Gagal mengirim. Periksa koneksi Anda lalu coba lagi.";
      }
    }).finally(function () {
      submitBtn.classList.remove("is-loading"); submitBtn.disabled = false;
    });
  });

  /* ---------------------------------------------------------
     WISHES FEED
     --------------------------------------------------------- */
  var wishesList = $("#wishesList"), wishesEmpty = $("#wishesEmpty");
  var moreBtn = $("#moreWishes"), countEl = $("#wishCount");
  var allWishes = [], shown = 0;
  var PAGE = C.rsvp.wishesPerPage || 5;

  function timeAgo(iso) {
    var t = new Date(iso).getTime();
    if (isNaN(t)) return "";
    var s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 60)    return "baru saja";
    if (s < 3600)  return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 2592000) return Math.floor(s / 86400) + " hari lalu";
    return new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function wishHTML(w) {
    var going = String(w.attendance || "").toLowerCase().indexOf("tidak") === -1;
    return '' +
    '<article class="wish">' +
      '<div class="wish__top">' +
        '<div class="wish__av" aria-hidden="true">' + esc((w.name || "?").trim().charAt(0).toUpperCase()) + '</div>' +
        '<div class="wish__meta">' +
          '<h3 class="wish__name">' + esc(w.name) + '</h3>' +
          '<p class="wish__when">' + esc(timeAgo(w.timestamp)) + '</p>' +
        '</div>' +
        '<span class="wish__badge' + (going ? '' : ' no') + '">' + esc(w.attendance || '') + '</span>' +
      '</div>' +
      '<p class="wish__msg">"' + esc(w.message) + '"</p>' +
    '</article>';
  }

  function renderWishes(reset, size) {
    if (reset) { wishesList.innerHTML = ""; wishesList.appendChild(wishesEmpty); shown = 0; }
    if (!allWishes.length) { wishesEmpty.hidden = false; moreBtn.hidden = true; countEl.textContent = "0"; return; }
    wishesEmpty.hidden = true;
    var next = allWishes.slice(shown, shown + (size || PAGE));
    next.forEach(function (w, i) {
      var d = document.createElement("div");
      d.innerHTML = wishHTML(w);
      var node = d.firstElementChild;
      node.style.animationDelay = (i * 60) + "ms";
      wishesList.appendChild(node);
    });
    shown += next.length;
    moreBtn.hidden = shown >= allWishes.length;
    countEl.textContent = allWishes.length;
  }

  function prependWish(w) {
    allWishes.unshift(w);
    wishesEmpty.hidden = true;
    var d = document.createElement("div");
    d.innerHTML = wishHTML(w);
    wishesList.prepend(d.firstElementChild);
    shown++;
    countEl.textContent = allWishes.length;
  }

  function loadWishes() {
    if (!C.rsvp.scriptUrl && !Array.isArray(C.rsvp.demoWishes)) return;
    jsonp({ action: "wishes" }, 12000).then(function (res) {
      if (!res || !Array.isArray(res.data)) return;
      var keep = Math.max(PAGE, shown);   // keep however much the guest had expanded
      allWishes = res.data;
      renderWishes(true, keep);
    }).catch(function () { /* silent — feed simply stays as-is */ });
  }

  moreBtn.addEventListener("click", function () { renderWishes(false); });

  /* ---------------------------------------------------------
     SCROLL REVEAL
     --------------------------------------------------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  function observeAll() { $$(".reveal:not(.in)").forEach(function (el) { io.observe(el); }); }

  /* ---------------------------------------------------------
     MUSIC
     --------------------------------------------------------- */
  var audio = $("#audio"), musicBtn = $("#musicBtn"), musicReady = false;
  if (C.music && C.music.src) {
    audio.src = C.music.src;
    audio.volume = .5; // capped so it never starts jarringly loud, even on manual play
    audio.addEventListener("canplay", function () { musicReady = true; });
    audio.addEventListener("error", function () { musicBtn.hidden = true; });
    musicBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () { musicBtn.classList.add("is-playing"); musicBtn.setAttribute("aria-label", "Jeda musik"); })
                    .catch(function () { toast("Musik tidak dapat diputar"); });
      } else {
        audio.pause(); musicBtn.classList.remove("is-playing"); musicBtn.setAttribute("aria-label", "Putar musik");
      }
    });
  }

  /* ---------------------------------------------------------
     OPEN INVITATION
     --------------------------------------------------------- */
  var cover = $("#cover"), invitation = $("#invitation");
  $("#openBtn").addEventListener("click", function () {
    cover.classList.add("is-open");
    document.body.classList.remove("is-locked");
    invitation.setAttribute("aria-hidden", "false");
    invitation.classList.add("is-shown");
    window.scrollTo(0, 0);
    observeAll();
    setTimeout(function () { cover.style.display = "none"; }, 1100);

    if (C.music && C.music.src) {
      musicBtn.hidden = false;
      if (C.music.autoplay) {
        audio.volume = 0;
        audio.play().then(function () {
          musicBtn.classList.add("is-playing");
          var v = 0, fade = setInterval(function () {          // gentle fade-in
            v = Math.min(.5, v + .03); audio.volume = v;
            if (v >= .5) clearInterval(fade);
          }, 90);
        }).catch(function () { audio.volume = .5; });
      }
    }
    loadWishes();
    if (C.rsvp.pollInterval > 0) setInterval(loadWishes, C.rsvp.pollInterval);
  }, { once: true });

  // If the guest lands with #hash (shared deep link) skip the cover.
  if (location.hash && location.hash.length > 1) {
    setTimeout(function () { $("#openBtn").click(); }, 60);
  }

  observeAll();
})();
