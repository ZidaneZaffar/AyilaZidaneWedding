/* =============================================================
   WEDDING INVITATION — MASTER CONFIG
   -------------------------------------------------------------
   This is the ONLY file you need to edit for content changes.
   Everything on the site reads from here.
   ============================================================= */

window.WEDDING_CONFIG = {

  /* ---------- 1. COUPLE ---------- */
  couple: {
    groom: {
      fullName:  "Muhammad Zidane Zaffar",
      shortName: "Zidane",
      order:     "Putra dari",              // "Son of"
      father:    "Sabar Sundarelawan",
      mother:    "Alm. Susie Santika & Wafa Rahayu Fauziah",
      photo:     "assets/img/groom.jpg",     // optional — leave "" to show monogram
      instagram: ""                          // e.g. "https://instagram.com/username"
    },
    bride: {
      fullName:  "Ayila Adzkiya Sucahyo",
      shortName: "Ayila",
      order:     "Putri dari",               // "Daughter of"
      father:    "Agung Sucahyo",
      mother:    "Lina B. Tusianti",
      photo:     "assets/img/bride.jpg",
      instagram: ""
    },
    // Shown on the cover + browser tab. Bride first or groom first — your call.
    displayTitle: "Ayila &amp; Zidane"
  },

  /* ---------- 2. COVER PHOTO ----------
     The full-bleed photo behind the cover screen (before "Buka
     Undangan" is tapped). Drop your photo into assets/img/ and put
     its path below — leave "" to fall back to a plain gradient.    */
  cover: {
    photo: "assets/img/cover.jpg"
  },

  /* ---------- 3. GALLERY ----------
     Fully hands-off: drop any photo (any filename, no naming
     convention) into assets/img/gallery/ and it just appears in the
     "Our Moments" gallery after the next deploy -- nothing to edit
     here. The list is auto-generated at deploy time by
     tools/generate-gallery-manifest.py from whatever's actually in
     that folder (see .github/workflows/deploy.yml); it also reads
     each photo's real dimensions to size portrait vs. landscape
     tiles automatically.

     `photos` below is only a fallback, used if that generated
     manifest can't be fetched for some reason -- you don't need to
     touch it for normal use.                                     */
  gallery: {
    heading: "Our Moments",
    photos: [
      "assets/img/gallery/tenis-1.jpg",
      "assets/img/gallery/tenis-2.jpg",
      "assets/img/gallery/tenis-3.jpg",
      "assets/img/gallery/tenis-4.jpg",
      "assets/img/gallery/tenis-1-ls.jpg",
      "assets/img/gallery/tenis-2-ls.jpg",
      "assets/img/gallery/tenis-3-ls.jpg",
      "assets/img/gallery/taman-1.jpg",
      "assets/img/gallery/taman-2.jpg",
      "assets/img/gallery/taman-3.jpg",
      "assets/img/gallery/taman-4.jpg",
      "assets/img/gallery/taman-1-ls.jpg",
      "assets/img/gallery/taman-2-ls.jpg",
      "assets/img/gallery/taman-3-ls.jpg",
      "assets/img/gallery/taman-4-ls.jpg",
      "assets/img/gallery/museum-1.jpg",
      "assets/img/gallery/museum-2.jpg",
      "assets/img/gallery/museum-3.jpg",
      "assets/img/gallery/museum-4.jpg",
      "assets/img/gallery/museum-1-ls.jpg",
      "assets/img/gallery/museum-2-ls.jpg",
      "assets/img/gallery/museum-3-ls.jpg",
      "assets/img/gallery/museum-4-ls.jpg"
    ]
  },

  /* ---------- 4. DATE & TIME ----------
     Use ISO 8601 with the +07:00 (WIB) offset.
     The countdown targets `countdownTo`.                        */
  wedding: {
    dateISO:      "2026-10-24",
    dateLabel:    "24 Oktober 2026",
    dateLabelEn:  "24 October 2026",
    dayLabel:     "Sabtu",                   // Saturday
    countdownTo:  "2026-10-24T14:00:00+07:00"
  },

  /* ---------- 5. EVENTS ---------- */
  events: [
    {
      key:      "akad",
      name:     "Akad Nikah",
      subtitle: "The Wedding Ceremony",
      startISO: "2026-10-24T14:00:00+07:00",
      endISO:   "2026-10-24T16:00:00+07:00",
      timeLabel:"14.00 — 16.00 WIB",
      timeNote: "Sore",                       // Afternoon
      icon:     "rings"
    },
    {
      key:      "resepsi",
      name:     "Resepsi",
      subtitle: "The Wedding Reception",
      startISO: "2026-10-24T19:00:00+07:00",
      endISO:   "2026-10-24T21:00:00+07:00",
      timeLabel:"19.00 — 21.00 WIB",
      timeNote: "Malam",                      // Evening
      icon:     "glasses"
    }
  ],

  /* ---------- 6. VENUE ---------- */
  venue: {
    name:      "ARTOTEL Living World Kota Wisata",
    address:   "Jl. Boulevard Kota Wisata, Ciangsana, Kec. Gn. Putri, Kabupaten Bogor, Jawa Barat 16968",
    mapsUrl:   "https://maps.app.goo.gl/iWCCY8fCRgTXGmXu5",
    // Used for the embedded map preview (no API key required).
    mapsEmbedQuery: "ARTOTEL Living World Kota Wisata, Jl. Boulevard Kota Wisata, Ciangsana, Gunung Putri, Bogor, Jawa Barat 16968"
  },

  /* ---------- 7. GOOGLE CALENDAR ---------- */
  calendar: {
    title:       "Pernikahan Ayila & Zidane",
    // Calendar event spans from Akad start to Resepsi end.
    startISO:    "2026-10-24T14:00:00+07:00",
    endISO:      "2026-10-24T21:00:00+07:00",
    description: "Dengan penuh sukacita kami mengundang Anda ke pernikahan Ayila Adzkiya Sucahyo & Muhammad Zidane Zaffar.\\n\\nAkad Nikah : 14.00 - 16.00 WIB\\nResepsi : 19.00 - 21.00 WIB"
  },

  /* ---------- 8. GIFT ----------
     >>> REPLACE THE PLACEHOLDERS BELOW <<<                      */
  gift: {
    heading:  "Wanna give us some gifts?",
    intro:    "Doa restu Anda adalah hadiah terindah bagi kami. Namun apabila memberi adalah tanda kasih, kami menerimanya dengan senang hati.",
    accounts: [
      {
        bank:   "BCA",                  // e.g. "BCA"
        number: "0710142394",                 // e.g. "1234567890"
        holder: "Ayila Adzkiya Sucahyo",
        logo:   ""                            // optional: "assets/img/bca.png"
      }
      // Add a second account by copying the block above:
      // , { bank: "MANDIRI", number: "0000000000", holder: "Ayila Adzkiya Sucahyo", logo: "" }
    ],
    // Optional — leave image: "" to hide this card entirely.
    qris: {
      image: "assets/img/qris.jpg",
      holder: "Zaffar Studio"
    },
    // Optional — leave url: "" to hide this card entirely.
    registry: {
      text: "Atau pilih hadiah dari wishlist kami",
      url:  "https://www.myregistry.com/giftlist/ayila-zidane"
    },
    address: {
      label: "Kirim Hadiah",
      value: "Pesona Sanfrancisco Q2/21 Kota Wisata, Ciangsana, Kec. Gn. Putri, Kabupaten Bogor, Jawa Barat 16968",
      recipient: "Muhammad Zidane Zaffar",
      phone: ""                               // optional, e.g. "+62 812-0000-0000"
    }
  },

  /* ---------- 9. RSVP BACKEND ----------
     Paste your Apps Script Web App URL here after deploying.
     See README.md → "Google Sheets setup".                      */
  rsvp: {
    scriptUrl:     "https://script.google.com/macros/s/AKfycbznTGnO7AH79mLb_93zhTmAQOJnDauc05QSdnzcM-VT3gardrIwtWmRh6uLZTzax1GDow/exec",   // e.g. "https://script.google.com/macros/s/AKfy.../exec"
    maxGuests:     5,
    wishesPerPage: 5,
    // How often (ms) the wishes feed refreshes while the page is open.
    pollInterval:  30000
  },

  /* ---------- 10. CLOSING ---------- */
  closing: {
    text: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.",
    signOff: "Kami yang berbahagia,"
  },

  /* ---------- 11. MUSIC ----------
     Drop an .mp3 into assets/audio/ and put the path here.
     Leave "" to hide the floating music button entirely.        */
  music: {
    src:      "assets/audio/song.mp3",
    autoplay: true          // starts after the guest taps "Open Invitation"
  },

  /* ---------- 12. HIDDEN SECRETS (easter eggs, optional) ----------
     A little hidden game for guests: find all of the secrets below,
     each tied to a real fact about you two, by doing the matching
     interaction somewhere on the site. A bell button (top-right)
     lets guests see their progress and hints, and re-read anything
     they've already found. Once every secret is found, `finalText`
     is revealed instead -- e.g. a keyword for a Kahoot quiz at the
     reception.

     `trigger` picks which interaction unlocks that item -- the
     interaction itself is fixed in app.js, only which fact goes with
     which trigger is up to you here. One item per trigger:
       coupleTap     tap either mempelai's name (in the couple
                     section) 5 times in a row
       portraitHold  press and hold a mempelai's photo for ~1.2s
       countdownTap  tap a countdown number 3 times in a row
       galleryPhotos open 5 different photos in the gallery lightbox
       keyword       type a secret word anywhere on the page
                     (needs `keyword` set below, case-insensitive)
       closingTap    tap the names at the very bottom of the page
                     5 times in a row
     `image` is optional -- leave "" to show text only.
     Leave `enabled: false` to turn the whole feature off.        */
  eggs: {
    enabled: true,
    intro: "Ada beberapa rahasia kecil tersembunyi di undangan ini. Temukan semuanya sebelum hari H!",
    finalTitle: "Kamu menemukan semua rahasia!",
    finalText: "Simpan baik-baik semua fakta tadi — bakal muncul lagi di sesi Kahoot waktu resepsi!",
    items: [
      {
        trigger: "portraitHold",
        title: "Cincin Pertama",
        hint: "Tekan dan tahan salah satu foto mempelai selama 1-2 detik.",
        text: "Ayila dikasih cincin pertama kali di Museum Nasional.",
        image: ""
      },
      {
        trigger: "coupleTap",
        title: "Almamater",
        hint: "Ketuk nama salah satu mempelai 5 kali berturut-turut.",
        text: "Ayila & Zidane sama-sama lulus dari Fakultas Ilmu Komputer UI — angkatan Ayila adalah Quanta, angkatan Zidane adalah Omega.",
        image: ""
      },
      {
        trigger: "countdownTap",
        title: "Olahraga Pertama",
        hint: "Ketuk salah satu angka hitung mundur 3 kali.",
        text: "Olahraga pertama yang kita lakukan bersama adalah bouldering / panjat tebing.",
        image: ""
      },
      {
        trigger: "galleryPhotos",
        title: "Jarak Rumah",
        hint: "Buka 5 foto berbeda di galeri \"Our Moments\".",
        text: "Jarak rumah Zidane di Kota Wisata dan rumah Ayila di Cilandak adalah 35.7 km.",
        image: ""
      },
      {
        trigger: "keyword",
        keyword: "lantern",
        title: "Series Favorit",
        hint: "Ketik judul series yang lagi kita tonton bareng saat ini, di mana saja di halaman ini.",
        text: "Series yang lagi kita tonton bareng saat ini adalah Lantern.",
        image: ""
      }
    ]
  },

  /* ---------- 13. META / SHARING ---------- */
  meta: {
    siteTitle:   "Ayila & Zidane — Wedding Invitation",
    description: "24 Oktober 2026 · ARTOTEL Living World Kota Wisata",
    ogImage:     "assets/img/og-cover.jpg",
    favicon:     "💍",
    // Fallback greeting when no ?to= parameter is present in the URL.
    defaultGuest: "Bapak / Ibu / Saudara/i"
  }
};
