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
      fullName:  "M Zidane Zaffar",
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

  /* ---------- 2. DATE & TIME ----------
     Use ISO 8601 with the +07:00 (WIB) offset.
     The countdown targets `countdownTo`.                        */
  wedding: {
    dateISO:      "2026-10-24",
    dateLabel:    "24 Oktober 2026",
    dateLabelEn:  "24 October 2026",
    dayLabel:     "Sabtu",                   // Saturday
    countdownTo:  "2026-10-24T14:00:00+07:00"
  },

  /* ---------- 3. EVENTS ---------- */
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

  /* ---------- 4. VENUE ---------- */
  venue: {
    name:      "ARTOTEL Living World Kota Wisata",
    address:   "Jl. Boulevard Kota Wisata, Ciangsana, Kec. Gn. Putri, Kabupaten Bogor, Jawa Barat 16968",
    mapsUrl:   "https://maps.app.goo.gl/iWCCY8fCRgTXGmXu5",
    // Used for the embedded map preview (no API key required).
    mapsEmbedQuery: "ARTOTEL Living World Kota Wisata, Jl. Boulevard Kota Wisata, Ciangsana, Gunung Putri, Bogor, Jawa Barat 16968"
  },

  /* ---------- 5. GOOGLE CALENDAR ---------- */
  calendar: {
    title:       "Pernikahan Ayila & Zidane",
    // Calendar event spans from Akad start to Resepsi end.
    startISO:    "2026-10-24T14:00:00+07:00",
    endISO:      "2026-10-24T21:00:00+07:00",
    description: "Dengan penuh sukacita kami mengundang Anda ke pernikahan Ayila Adzkiya Sucahyo & M Zidane Zaffar.\\n\\nAkad Nikah : 14.00 - 16.00 WIB\\nResepsi : 19.00 - 21.00 WIB"
  },

  /* ---------- 6. GIFT ----------
     >>> REPLACE THE PLACEHOLDERS BELOW <<<                      */
  gift: {
    heading:  "Wanna give us some gifts?",
    intro:    "Doa restu Anda adalah hadiah terindah bagi kami. Namun apabila memberi adalah tanda kasih, kami menerimanya dengan senang hati.",
    accounts: [
      {
        bank:   "BCA",                  // e.g. "BCA"
        number: "8691854035",                 // e.g. "1234567890"
        holder: "M Zidane Zaffar",
        logo:   ""                            // optional: "assets/img/bca.png"
      }
      // Add a second account by copying the block above:
      // , { bank: "MANDIRI", number: "0000000000", holder: "Ayila Adzkiya Sucahyo", logo: "" }
    ],
    address: {
      label: "Kirim Hadiah",
      value: "Pesona Sanfrancisco Q2/21 Kota Wisata, Ciangsana, Kec. Gn. Putri, Kabupaten Bogor, Jawa Barat 16968",
      recipient: "M Zidane Zaffar",
      phone: ""                               // optional, e.g. "+62 812-0000-0000"
    }
  },

  /* ---------- 7. RSVP BACKEND ----------
     Paste your Apps Script Web App URL here after deploying.
     See README.md → "Google Sheets setup".                      */
  rsvp: {
    scriptUrl:     "https://script.google.com/macros/s/AKfycbxe7VWIGnN9XM82NEq5DodQ0XpuynFUNgbGj22Pi9gQu_f3oDRITJMOnsZSTDoVrVUimA/exec",   // e.g. "https://script.google.com/macros/s/AKfy.../exec"
    maxGuests:     5,
    wishesPerPage: 5,
    // How often (ms) the wishes feed refreshes while the page is open.
    pollInterval:  30000
  },

  /* ---------- 8. QUOTE & CLOSING ---------- */
  quote: {
    text: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa kasih dan sayang.",
    source: "QS. Ar-Rum : 21"
  },
  closing: {
    text: "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.",
    signOff: "Kami yang berbahagia,"
  },

  /* ---------- 9. MUSIC ----------
     Drop an .mp3 into assets/audio/ and put the path here.
     Leave "" to hide the floating music button entirely.        */
  music: {
    src:      "assets/audio/song.mp3",
    autoplay: true          // starts after the guest taps "Open Invitation"
  },

  /* ---------- 10. META / SHARING ---------- */
  meta: {
    siteTitle:   "Ayila & Zidane — Wedding Invitation",
    description: "24 Oktober 2026 · ARTOTEL Living World Kota Wisata",
    ogImage:     "assets/img/og-cover.jpg",
    favicon:     "💍",
    // Fallback greeting when no ?to= parameter is present in the URL.
    defaultGuest: "Bapak / Ibu / Saudara/i"
  }
};
