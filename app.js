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
     --------------------------------------------------------- */
  $("#coverNames").innerHTML = namesHTML;
  $("#coverDate").textContent = C.wedding.dayLabel + ", " + C.wedding.dateLabel;

  // Personalised greeting:  index.html?to=Ade%20Fitriyani
  var params = new URLSearchParams(location.search);
  var guest = (params.get("to") || params.get("guest") || "").trim();
  $("#guestName").textContent = guest ? decodeURIComponent(guest) : C.meta.defaultGuest;

  /* ---------------------------------------------------------
     QUOTE / COUPLE / CLOSING
     --------------------------------------------------------- */
  $("#quoteText").textContent = C.quote.text;
  $("#quoteSrc").textContent  = C.quote.source;

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

  $("#venueName").textContent        = C.venue.name;
  $("#venueAddressText").textContent = C.venue.address;
  $("#venueAddress").href            = C.venue.mapsUrl;
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
  guestsInput.max = C.rsvp.maxGuests;

  $("#fMessage").addEventListener("input", function () {
    $("#charCount").textContent = this.value.length;
  });

  $$(".stepper__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = parseInt(guestsInput.value, 10) + parseInt(b.dataset.step, 10);
      guestsInput.value = Math.min(C.rsvp.maxGuests, Math.max(1, v));
    });
  });

  $$('input[name="attendance"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var going = r.value === "Hadir";
      guestsField.classList.toggle("is-hidden", !going);
      if (!going) guestsInput.value = 0; else if (+guestsInput.value < 1) guestsInput.value = 1;
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
    }).then(function (res) {
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
      statusEl.textContent = err.message === "TIMEOUT"
        ? "Koneksi lambat. Mohon coba lagi."
        : "Gagal mengirim. Periksa koneksi Anda lalu coba lagi.";
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
            v = Math.min(.55, v + .03); audio.volume = v;
            if (v >= .55) clearInterval(fade);
          }, 90);
        }).catch(function () { audio.volume = .55; });
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
