/* 16:3 FAITH RECORDS — the label hub (route #/records). FINAL UPGRADE.
   Founder orders 2026-11-27 12:29 + 12:30 MST; built to
   ai-artist-work/LABEL-PAGE-SPEC.md (route, sections, data sources,
   link placements) + LABEL.md (identity, catalog, credit lines) +
   ARTIST.md v2 (the duo, locked descriptors, approved bios verbatim).

   DESIGN MERGE (2026-11-27): this module is the house-standard upgrade
   of ChatGPT's "LOUD FAITH. NO BOXES." design package — the founder
   carried the package to Muse personally, so THE PACKAGE IS the
   ChatGPT consult artifact for this page (no other consult is claimed).
   Kept from Chat: the oversized editorial typography, the cinematic
   hero composition, the 16-card interactive genre wall with its
   detail panel and genre→submission prefill, the break band, the
   values grid, the submissions form design + mailto mechanism.
   Re-skinned to the house brand: gold #d4af37 on deep black #050505 —
   Chat's red / cream / purple palette does not ship. Re-sequenced to
   house layout law (results first): banner → featured release →
   roster → the sound → the story → submissions.
   DELETED from Chat's package, by house law (see UPGRADE-RECORD.md):
   the Sound Lab demo clips and their second player (one global player
   rule; 17-second synthetic demos are not label music), the concept-art
   "aspirational artist" portrait cards (no fake artist showcase), the
   prototype's own shell nav (the site shell provides navigation), and
   every stat or count that is not real.

   STRUCTURE (data / structure / presentation separation):
   - DATA LAYER: LABEL, ROSTER, RELEASES, STORY, VALUES, GENRES below.
     Every word of copy, every catalog fact, every art path lives here
     and ONLY here.
   - STRUCTURE: the section builders assemble sections from the data
     layer in house order — results first, the label story below.
   - PRESENTATION: the CSS block. It uses ONLY shell tokens (--gold,
     --gold-hi, --gold-dim, --bone, --mute, --line, --coal, --serif)
     plus the loud display stack; every class is rec- prefixed and
     scoped to this hub — nothing here reaches another hub.

   HONESTY LAW (binding, from ARTIST.md / LABEL-PAGE-SPEC.md):
   - The duo are AI artists and are labeled exactly that — the chip
     "AI artist created by 16:3 Faith" rides the roster card verbatim.
   - The single's play state is read from the duo's OWN landing data
     (assets/data/albums/malachi-amara.json + assets/data/playable/
     malachi-amara.json — the same files Listen reads; this page keeps
     no copy of track data). Until a real, founder-graded master is
     bound there, the release reads NOT YET PLAYABLE. Never a fake
     play button, never an invented count, never a second player:
     when the master lands, the play button queues through the shell
     player exactly as Listen queues it.
   - The label lockup is a TYPE treatment (inline SVG text, gold
     #d4af37 on black) — never AI-generated text art (LABEL.md rule).
   - The submissions form is an INTRODUCTION door: it opens the
     visitor's email app with a prepared message to
     hello@163faith.com. Nothing is uploaded, stored, or sent by this
     page, and the copy promises no A&R review, signing, or response.

   PLACEMENT: route #/records, registered in shell.js (navigate
   allow-list) + index.html (desktop top nav) by the patches in this
   packet. Like People, Records rides the desktop top nav only — the
   bottom phone bar keeps its seven hubs (people.js precedent). */

/* ================= DATA LAYER ================= */

const LABEL = {
  name: '16:3 Faith Records',
  imprint: '16:3 Faith Records presents…',
  lockup: '16:3 FAITH RECORDS',
  /* Spec §1: "the label in a sentence" — the meaning may not drift. */
  tagline: 'The record label of 16:3 Faith — the futuristic hip hop church sound, made in this house.',
  footerLine: '16:3 Faith Records · A 16:3 Faith label',
};

const ROSTER = [
  {
    slug: 'malachi-amara',
    billing: 'Malachi & Amara Grace',
    /* The honesty chip, verbatim (ARTIST.md HONESTY LAW — singular
       form on the act card per LABEL-PAGE-SPEC.md §2). */
    chip: 'AI artist created by 16:3 Faith',
    /* The act's approved one-line bio, verbatim from ARTIST.md. */
    actBio: 'Malachi & Amara Grace are AI artists created by 16:3 Faith — his verses, her voice, one anthem: the 16:3 sound, on 16:3 Faith Records.',
    artistHash: '#/listen/malachi-amara',
    members: [
      {
        name: 'Malachi',
        role: 'His verses',
        portrait: 'assets/img/label/malachi-portrait.webp',
        /* Approved one-line bio, verbatim from ARTIST.md. */
        bio: 'Malachi is an AI artist created by 16:3 Faith — a herald\u2019s voice built for the futuristic hip hop church, carrying the word in rap beside Amara Grace.',
      },
      {
        name: 'Amara Grace',
        role: 'Her voice',
        portrait: 'assets/img/label/amara-grace-portrait.webp',
        /* Approved one-line bio, verbatim from ARTIST.md. */
        bio: 'Amara Grace is an AI artist created by 16:3 Faith — a voice built for the futuristic hip hop church, carrying the 16:3 sound.',
      },
    ],
  },
];

const RELEASES = [
  {
    catalog: '163FR-001',
    title: '16:3 (God So Loved)',
    artistSlug: 'malachi-amara',
    artistName: 'Malachi & Amara Grace',
    kind: 'Single · 1 track',
    cover: 'assets/img/label/malachi-amara-duo-cover-163.webp',
    /* Credit lines per LABEL.md (year = release year; the landing
       seat updates the year at actual release). */
    credits: ['\u2117 2026 16:3 Faith Records', '\u00a9 2026 16:3 Faith Records'],
  },
];

/* The label story (spec §4 — below the results, per house layout
   law). Plain, unhidden honesty paragraph included by spec. */
const STORY = [
  {
    h: 'The house label',
    p: '16:3 Faith Records is 16:3 Faith\u2019s own imprint — the standing home for every Faith-owned recording. What this house makes, this label carries: the anthem first, and every release after it, filed in order under the 163FR catalog.',
  },
  {
    h: 'The sound',
    p: 'Futuristic hip hop church. Gospel truth carried by rap and sung worship — a herald\u2019s verses, a worship leader\u2019s voice, a choir behind them — gold on black, made for the block and the sanctuary at the same time.',
  },
  {
    h: 'Said plainly',
    p: 'The label\u2019s founding artists are AI artists created by 16:3 Faith, and they are labeled exactly that on every surface — this page, the artist page, the player, the films. No fabricated biographies, no invented life stories, no fake stats. Their story is this house\u2019s story: voices built here, to carry this house\u2019s song.',
  },
];

/* What we stand on — the values grid from Chat's package, copy kept,
   re-skinned. Editorial copy only; no data claims. */
const VALUES = [
  { n: '01', h: 'Faith first.', p: 'We\u2019re rooted in Christ. The music can be fearless, fresh, tender, noisy, and full of life.' },
  { n: '02', h: 'The artist matters.', p: 'There\u2019s a person behind every song. Their story, originality, and creative voice matter.' },
  { n: '03', h: 'No genre gatekeeping.', p: 'Hip-hop belongs here. So does gospel, rock, neo-soul, Afrobeats, jazz, country, and whatever is next.' },
  { n: '04', h: 'Let the work speak.', p: 'We\u2019re inviting original music, real testimony, and artistic expression — not a copy of someone else\u2019s sound.' },
];

/* THE SOUND — the genre wall from Chat's package (names, one-liners
   and form values kept verbatim), reframed as the sounds this label
   is building toward. Accents re-skinned to the gold family — one
   hue system, varied by depth, so the wall reads gold-on-black. */
const GENRES = [
  { n: 'HIP-HOP / TRAP', mini: '808S / BARS', accent: '#d4af37', description: 'Raw honesty over hard drums. Your testimony does not need to whisper.', select: 'Hip-Hop / Rap / Trap' },
  { n: 'GOSPEL / CHOIR', mini: 'SOUL / POWER', accent: '#e8c36d', description: 'Voices together. A full-room kind of joy, built from the traditions that move generations.', select: 'Gospel / Choir' },
  { n: 'R&B / NEO-SOUL', mini: 'GROOVE / FEELING', accent: '#c9a227', description: 'Real love, real questions and real hope, carried by melody, warmth and the pocket.', select: 'R&B / Neo-Soul' },
  { n: 'WORSHIP', mini: 'HEART / PRAISE', accent: '#f3d27a', description: 'Space for the quiet prayer and the loud declaration — and everything in between.', select: 'Worship' },
  { n: 'AFROBEATS / AMAPIANO', mini: 'RHYTHM / ROOTS', accent: '#b8912f', description: 'Global rhythm with joy, bounce and soul. Bring the sound of where you come from.', select: 'Afrobeats / Amapiano' },
  { n: 'LATIN / REGGAETÓN', mini: 'FUEGO / FE', accent: '#d9b45b', description: 'Heart, heritage and movement. Spanish, English, both — or your own language.', select: 'Latin / Reggaetón' },
  { n: 'ROCK / ALTERNATIVE', mini: 'GUITARS / GRIT', accent: '#a8873a', description: 'Turn up the distortion. Tell the truth. Sing through the struggle.', select: 'Rock / Alternative' },
  { n: 'COUNTRY / FOLK', mini: 'STORY / STRINGS', accent: '#e3c878', description: 'Every road has a story. Acoustic honesty and big-hearted songwriting belong here.', select: 'Country / Folk' },
  { n: 'POP', mini: 'HOOKS / HEART', accent: '#caa93f', description: 'Huge melodies, bright energy, unashamed meaning. Make something the whole world can sing.', select: 'Pop' },
  { n: 'EDM / ELECTRONIC', mini: 'FREQUENCY / LIGHT', accent: '#9a7f2c', description: 'Electronic pulse. Festival-sized moments. Sound design without limits.', select: 'EDM / Electronic' },
  { n: 'JAZZ / BLUES', mini: 'BRASS / SOUL', accent: '#dfc06a', description: 'Improvisation, legacy, musicianship and feeling in every note.', select: 'Jazz / Blues' },
  { n: 'LO-FI / AMBIENT', mini: 'STILL / DEEP', accent: '#bfa04a', description: 'For late nights, quiet minds and the spaces between words.', select: 'Lo-Fi / Ambient' },
  { n: 'SPOKEN WORD', mini: 'VOICE / TRUTH', accent: '#eed289', description: 'Poetry, testimony and the power of a voice that refuses to be invisible.', select: 'Spoken Word' },
  { n: 'METAL / HARDCORE', mini: 'HEAVY / HOPE', accent: '#8f7124', description: 'Big sound, honest battles. Even the heaviest music can carry light.', select: 'Metal / Hardcore' },
  { n: 'INDIE / ACOUSTIC', mini: 'ORIGINAL / RAW', accent: '#d4af37', description: 'Unfiltered songcraft. Your voice and your instrument are enough.', select: 'Indie / Acoustic' },
  { n: 'GENRELESS', mini: 'NEXT / UNKNOWN', accent: '#cbb26a', description: 'Your sound does not need a category. Bring us something we have never heard before.', select: 'Other / Genre-blending' },
];

/* ================= PRESENTATION (CSS) =================
   House register: gold #d4af37 on #050505, shell tokens throughout.
   The LOUD layer (Chat's design language): an oversized condensed
   display stack for headlines, outline type, a gold ticker, a
   spinning record — all re-skinned to gold on black. Every class is
   rec- prefixed; nothing here reaches another hub. The standalone
   extract of this block ships beside the module as
   assets/css/records.css (byte-identical; the JS string is the
   source the site loads). */

const CSS = `
.rec{--loud:Impact,Haettenschweiler,'Arial Narrow Bold','Franklin Gothic Condensed',sans-serif}
.rec ::selection{background:var(--gold);color:#0a0a0a}
.rec [id]{scroll-margin-top:84px}
/* ——— kicker + subnav ——— */
.rec-kicker{display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin:38px 0 0}
.rec-kicker .hair{flex:1;height:1px;background:var(--line)}
.rec-kicker .tag{color:var(--mute);letter-spacing:.18em}
.rec-subnav{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.rec-subnav button{background:none;border:1px solid var(--line);color:var(--bone);border-radius:999px;padding:8px 15px;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;cursor:pointer}
.rec-subnav button:hover{border-color:var(--gold);color:var(--gold-hi)}
.rec-subnav button:focus-visible,.rec-genre-card:focus-visible,.rec-genre-pitch:focus-visible,.rec-formwrap input:focus-visible,.rec-formwrap select:focus-visible,.rec-formwrap textarea:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
/* ——— BANNER / HERO (Chat's cinematic composition, house skin) ——— */
.rec-banner{position:relative;border:1px solid var(--gold-dim);border-radius:22px;overflow:hidden;margin-top:14px;background:linear-gradient(150deg,#171106,#070707 68%)}
.rec-banner-grid{display:grid;grid-template-columns:1fr;gap:0;position:relative;z-index:1}
@media(min-width:820px){.rec-banner-grid{grid-template-columns:1.05fr .95fr}}
.rec-banner-copy{padding:30px 22px 26px;display:flex;flex-direction:column;gap:14px;justify-content:center}
@media(min-width:820px){.rec-banner-copy{padding:40px 36px}}
.rec-imprint{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--gold-hi)}
.rec-lockup{width:min(440px,100%);height:auto;display:block}
.rec-loud{font-family:var(--loud);text-transform:uppercase;line-height:.8;letter-spacing:-.01em;margin-top:4px}
.rec-loud .l1{display:block;font-size:clamp(58px,14.5vw,104px);color:var(--bone)}
.rec-loud .l2{display:block;font-size:clamp(58px,14.5vw,104px);color:var(--gold)}
.rec-loud .l3{display:block;font-size:clamp(58px,14.5vw,104px);color:transparent;-webkit-text-stroke:2px var(--gold-hi)}
@supports not (-webkit-text-stroke:1px black){.rec-loud .l3{color:var(--gold-dim)}}
.rec-tagline{font-family:var(--serif);font-size:clamp(19px,3.4vw,25px);line-height:1.45;color:var(--bone);max-width:30ch}
.rec-hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:2px}
.rec-btn{display:inline-flex;align-items:center;gap:10px;border-radius:999px;padding:12px 20px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.rec-btn.gold{background:var(--gold);color:#0a0a0a;border:1px solid var(--gold)}
.rec-btn.gold:hover{background:var(--gold-hi)}
.rec-btn.ghost{background:none;color:var(--bone);border:1px solid var(--gold-dim)}
.rec-btn.ghost:hover{border-color:var(--gold);color:var(--gold-hi)}
.rec-hero-note{font-size:11.5px;color:var(--mute);letter-spacing:.04em}
.rec-hero-note b{color:var(--gold-hi);font-weight:700}
.rec-banner-art{position:relative;min-height:300px}
.rec-banner-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 30%;display:block}
.rec-banner-art .veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,5,.55) 0%,rgba(5,5,5,0) 34%),linear-gradient(0deg,rgba(5,5,5,.5) 0%,rgba(5,5,5,0) 40%)}
@media(max-width:819px){.rec-banner-art{min-height:340px;order:-1}.rec-banner-art .veil{background:linear-gradient(0deg,rgba(5,5,5,.72) 0%,rgba(5,5,5,0) 46%)}}
/* the spinning record — Chat's hero motif, gold on black; the label
   text is HTML type, never image text */
.rec-disc{position:absolute;right:-58px;bottom:-64px;width:212px;height:212px;border-radius:50%;background:repeating-radial-gradient(circle,#050505 0 2px,#111 3px,#0a0a0a 5px,#151515 6px);border:6px solid #171515;box-shadow:0 15px 50px rgba(0,0,0,.6),0 0 0 2px var(--gold-dim);animation:rec-spin 19s linear infinite;z-index:2;display:none}
@media(min-width:820px){.rec-disc{display:block}}
.rec-disc-in{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:76px;height:76px;border-radius:50%;background:var(--gold);color:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 0 0 2px #111,0 0 0 5px var(--gold-dim)}
.rec-disc-in b{font-family:var(--loud);font-size:26px;line-height:.85}
.rec-disc-in small{font-size:5.5px;font-weight:900;letter-spacing:.14em;line-height:1.25;margin-top:3px}
@keyframes rec-spin{to{transform:rotate(360deg)}}
/* ——— ticker (Chat's genre marquee, gold band) ——— */
.rec-ticker{margin-top:16px;background:var(--gold);color:#0a0a0a;border-radius:12px;overflow:hidden;display:flex;align-items:center;height:52px}
.rec-ticker-track{display:flex;white-space:nowrap;min-width:max-content;animation:rec-marquee 30s linear infinite}
.rec-ticker-track span{font-family:var(--loud);font-size:24px;letter-spacing:.06em;padding-right:22px;text-transform:uppercase}
@keyframes rec-marquee{to{transform:translateX(-50%)}}
/* ——— featured release strip (inside the banner) ——— */
.rec-feat{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-radius:16px;background:rgba(5,5,5,.55);padding:12px 14px}
.rec-feat img{width:64px;height:64px;border-radius:10px;object-fit:cover;border:1px solid rgba(212,175,55,.4);flex:none}
.rec-feat .t{font-family:var(--serif);font-size:19px;color:var(--bone);line-height:1.2}
.rec-feat .a{font-size:12.5px;color:var(--mute);margin-top:2px}
.rec-cat{display:inline-block;font-size:10px;letter-spacing:.22em;color:#0a0a0a;background:var(--gold);border-radius:999px;padding:3px 9px;font-weight:700;vertical-align:2px;margin-left:8px}
/* ——— play state (honest, both ways) ——— */
.rec-notplay{display:inline-flex;align-items:center;gap:9px;border:1px dashed var(--gold-dim);border-radius:999px;padding:8px 14px;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-hi)}
.rec-notplay .dot{width:8px;height:8px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px 2px rgba(212,175,55,.55)}
.rec-notplay-note{font-size:12.5px;color:var(--mute);line-height:1.55}
.rec-playbtn{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--gold);background:var(--gold);color:#0a0a0a;border-radius:999px;padding:11px 20px;font-size:13px;font-weight:700;letter-spacing:.06em;cursor:pointer}
.rec-playbtn:hover{background:var(--gold-hi)}
/* ——— section heads (loud) ——— */
.rec-sechead{margin:48px 0 6px}
.rec-sechead .no{font-size:10px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
.rec-sechead h2{font-family:var(--loud);text-transform:uppercase;font-size:clamp(44px,9vw,76px);line-height:.88;color:var(--bone);margin:10px 0 8px}
.rec-sechead h2 em{color:var(--gold);font-style:normal}
.rec-sechead h2 .outl{color:transparent;-webkit-text-stroke:1.6px var(--gold-hi)}
@supports not (-webkit-text-stroke:1px black){.rec-sechead h2 .outl{color:var(--gold-dim)}}
.rec-sechead p{color:var(--mute);font-size:14.5px;line-height:1.6;max-width:62ch}
/* ——— RELEASE card ——— */
.rec-rel{display:grid;grid-template-columns:104px 1fr;gap:16px;border:1px solid var(--line);border-radius:18px;background:var(--coal);padding:16px;margin-top:14px}
@media(min-width:760px){.rec-rel{grid-template-columns:150px 1fr;padding:20px}}
.rec-rel img{width:100%;aspect-ratio:1;border-radius:12px;object-fit:cover;border:1px solid rgba(212,175,55,.4)}
.rec-rel .t{font-family:var(--serif);font-size:clamp(21px,4.4vw,28px);color:var(--bone);line-height:1.15}
.rec-rel .a{color:var(--bone);opacity:.85;font-size:14.5px;margin-top:3px}
.rec-rel .k{color:var(--mute);font-size:12.5px;margin-top:2px}
.rec-rel .credits{color:var(--mute);font-size:12.5px;margin-top:10px;letter-spacing:.04em}
.rec-rel .state{margin-top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
/* ——— ROSTER ——— */
.rec-act{border:1px solid var(--gold-dim);border-radius:20px;background:linear-gradient(150deg,#141003,#070707 70%);padding:18px;margin-top:14px}
@media(min-width:760px){.rec-act{padding:24px}}
.rec-duo{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(min-width:760px){.rec-duo{gap:18px}}
.rec-voice{position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(212,175,55,.35);margin:0}
.rec-voice img{width:100%;height:100%;min-height:230px;object-fit:cover;object-position:50% 22%;display:block}
@media(min-width:760px){.rec-voice img{min-height:320px}}
.rec-voice .cap{position:absolute;left:0;right:0;bottom:0;padding:26px 12px 10px;background:linear-gradient(0deg,rgba(5,5,5,.88),rgba(5,5,5,0));display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.rec-voice .cap b{font-family:var(--serif);font-size:clamp(16px,3.4vw,21px);color:var(--bone)}
.rec-voice .cap span{font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-hi);white-space:nowrap}
.rec-act-main{margin-top:16px}
.rec-act-main h3{font-family:var(--serif);font-size:clamp(28px,5.6vw,40px);line-height:1;color:var(--bone);margin:0}
.rec-chip{display:inline-block;margin-top:10px;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold-hi);border:1px solid var(--gold-dim);border-radius:999px;padding:6px 12px;background:rgba(212,175,55,.07)}
.rec-actbio{margin-top:12px;color:var(--bone);opacity:.92;font-size:15px;line-height:1.65;max-width:68ch}
.rec-voicebios{display:grid;grid-template-columns:1fr;gap:10px;margin-top:14px}
@media(min-width:760px){.rec-voicebios{grid-template-columns:1fr 1fr}}
.rec-voicebio{border:1px solid var(--line);border-radius:14px;padding:13px 15px;background:rgba(255,255,255,.02)}
.rec-voicebio b{color:var(--gold-hi);font-family:var(--serif);font-size:15.5px}
.rec-voicebio p{color:var(--mute);font-size:13.5px;line-height:1.6;margin-top:4px}
.rec-actlinks{margin-top:16px;display:flex;gap:12px;flex-wrap:wrap}
.rec-goldbtn{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#0a0a0a;border-radius:999px;padding:11px 20px;font-size:13px;font-weight:700;letter-spacing:.05em}
.rec-goldbtn:hover{background:var(--gold-hi)}
/* ——— THE SOUND: genre wall (Chat's 16-card interactivity) ——— */
.rec-genre-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:16px}
@media(min-width:820px){.rec-genre-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}}
.rec-genre-card{min-height:148px;position:relative;text-align:left;padding:18px;border:1px solid var(--line);border-radius:14px;background:radial-gradient(ellipse at 110% -45%,var(--gacc,#d4af37) 0%,transparent 78%),#121212;background-color:#121212;color:var(--bone);overflow:hidden;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:14px;cursor:pointer;font:inherit;transition:transform .2s,border-color .2s}
.rec-genre-card:hover{transform:translateY(-4px);border-color:var(--gold-dim)}
.rec-genre-card[aria-pressed="true"]{border-color:var(--gold);box-shadow:inset 0 0 0 1px var(--gold)}
.rec-genre-num{font-size:9.5px;letter-spacing:.18em;font-weight:700;color:var(--mute)}
.rec-genre-big{font-family:var(--loud);text-transform:uppercase;line-height:.95;font-size:clamp(24px,5.6vw,34px);letter-spacing:.01em}
.rec-genre-foot{display:flex;width:100%;align-items:center;justify-content:space-between;font-size:8.5px;font-weight:700;letter-spacing:.16em;color:var(--mute)}
.rec-genre-foot .arr{color:var(--gold);font-size:16px}
.rec-genre-detail{margin-top:12px;border:1px solid var(--line);border-left:5px solid var(--gold);border-radius:14px;background:var(--coal);display:grid;grid-template-columns:1fr;gap:12px;padding:20px}
@media(min-width:820px){.rec-genre-detail{grid-template-columns:120px 1fr auto;align-items:center;gap:24px}}
.rec-genre-detail-index{color:var(--gold);font-size:10px;font-weight:700;letter-spacing:.2em}
.rec-genre-detail h4{font-family:var(--loud);text-transform:uppercase;font-size:clamp(28px,5.4vw,38px);line-height:1;color:var(--bone);margin:0}
.rec-genre-detail p{font-size:14px;color:var(--mute);line-height:1.6;margin-top:7px;max-width:56ch}
.rec-genre-pitch{background:none;border:1px solid var(--gold-dim);color:var(--bone);border-radius:999px;padding:13px 18px;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;cursor:pointer}
.rec-genre-pitch span{color:var(--gold)}
.rec-genre-pitch:hover{background:var(--gold);color:#0a0a0a}
.rec-genre-pitch:hover span{color:#0a0a0a}
/* ——— break band (Chat's, gold skin) ——— */
.rec-break{margin-top:52px;background:var(--gold);color:#0a0a0a;border-radius:20px;padding:34px 24px;position:relative;overflow:hidden}
@media(min-width:820px){.rec-break{padding:46px 40px}}
.rec-break .side{font-size:9.5px;font-weight:900;letter-spacing:.26em;text-transform:uppercase}
.rec-break p{font-family:var(--loud);text-transform:uppercase;font-size:clamp(42px,9.4vw,84px);line-height:.88;margin-top:14px}
.rec-break p i{font-style:normal;color:transparent;-webkit-text-stroke:2px #0a0a0a}
@supports not (-webkit-text-stroke:1px black){.rec-break p i{color:#0a0a0a;opacity:.55}}
.rec-break .stk{position:absolute;right:22px;bottom:20px;width:104px;height:104px;border:2px solid #0a0a0a;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;font-size:11.5px;line-height:1.2;transform:rotate(11deg)}
@media(max-width:640px){.rec-break .stk{display:none}}
/* ——— STORY: manifesto + cards + values ——— */
.rec-manifesto{margin-top:14px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(160deg,#141003,#070707 72%);padding:26px 22px}
@media(min-width:820px){.rec-manifesto{padding:36px}}
.rec-manifesto h3{font-family:var(--loud);text-transform:uppercase;font-size:clamp(36px,7.4vw,62px);line-height:.92;color:var(--bone);margin:0}
.rec-manifesto h3 em{font-style:normal;color:var(--gold)}
.rec-manifesto p{max-width:64ch;font-size:16px;line-height:1.65;color:var(--bone);opacity:.88;margin-top:18px}
.rec-manifesto .mbottom{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-top:24px;border-top:1px solid var(--line);padding-top:14px;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold)}
.rec-story{display:grid;grid-template-columns:1fr;gap:12px;margin-top:12px}
@media(min-width:820px){.rec-story{grid-template-columns:repeat(3,1fr)}}
.rec-story article{border:1px solid var(--line);border-radius:16px;background:var(--coal);padding:18px}
.rec-story h3{font-family:var(--serif);font-size:20px;color:var(--gold-hi);margin:0 0 8px}
.rec-story p{color:var(--bone);opacity:.88;font-size:14px;line-height:1.65;margin:0}
.rec-values{display:grid;grid-template-columns:1fr;gap:11px;margin-top:12px}
@media(min-width:640px){.rec-values{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1000px){.rec-values{grid-template-columns:repeat(4,1fr)}}
.rec-values article{border:1px solid var(--line);border-top:3px solid var(--gold);border-radius:14px;background:var(--coal);padding:19px}
.rec-values article>span{font-size:11px;color:var(--gold);font-weight:700;letter-spacing:.14em}
.rec-values h3{font-family:var(--loud);text-transform:uppercase;font-size:30px;line-height:.95;color:var(--bone);margin:16px 0 10px}
.rec-values p{font-size:13.5px;color:var(--mute);line-height:1.6;margin:0}
/* ——— SUBMISSIONS (Chat's form, house skin + honest door copy) ——— */
.rec-submit{display:grid;grid-template-columns:1fr;gap:26px;margin-top:14px}
@media(min-width:920px){.rec-submit{grid-template-columns:1fr .95fr;gap:40px;align-items:start}}
.rec-submit-copy h3{font-family:var(--loud);text-transform:uppercase;font-size:clamp(56px,12vw,104px);line-height:.8;color:var(--bone);margin:0}
.rec-submit-copy h3 span{color:var(--gold)}
.rec-submit-copy p{color:var(--mute);font-size:15.5px;line-height:1.7;margin-top:20px;max-width:44ch}
.rec-submit-copy .sideline{display:flex;align-items:center;gap:12px;margin-top:26px;font-size:10px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--gold)}
.rec-submit-copy .sideline b{font-size:26px}
.rec-formwrap{border:1px solid var(--gold-dim);border-radius:18px;background:#0d0b06;padding:24px 20px 26px}
@media(min-width:760px){.rec-formwrap{padding:28px 26px 30px}}
.rec-formhead{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:6px;color:var(--gold-hi);font-weight:700;font-size:10px;letter-spacing:.18em;text-transform:uppercase}
.rec-formhead span:last-child{color:var(--mute)}
.rec-formwrap form{display:flex;flex-direction:column}
.rec-formwrap label{font-weight:700;letter-spacing:.16em;font-size:10px;text-transform:uppercase;color:var(--bone);margin-top:16px}
.rec-formwrap label b{color:var(--gold)}
.rec-formwrap input:not([type=checkbox]),.rec-formwrap select,.rec-formwrap textarea{background:#171410;border:1px solid var(--line);border-radius:10px;color:var(--bone);width:100%;padding:13px 12px;min-height:48px;font-size:14px;font-family:inherit;margin-top:7px}
.rec-formwrap input::placeholder,.rec-formwrap textarea::placeholder{color:var(--mute)}
.rec-formwrap textarea{resize:vertical;min-height:96px}
.rec-formrow{display:grid;grid-template-columns:1fr;gap:0}
@media(min-width:640px){.rec-formrow{grid-template-columns:1fr 1fr;gap:12px}}
.rec-formrow>div{display:flex;flex-direction:column}
.rec-consent{display:flex;align-items:flex-start;gap:10px;font-size:12px;font-weight:400;letter-spacing:0;text-transform:none;line-height:1.55;color:var(--mute);cursor:pointer}
.rec-consent input{accent-color:var(--gold);width:16px;height:16px;flex:none;margin-top:2px}
.rec-submitbtn{margin-top:20px;border:1px solid var(--gold);background:var(--gold);color:#0a0a0a;border-radius:999px;padding:15px 20px;font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;font-family:inherit}
.rec-submitbtn:hover{background:var(--gold-hi)}
.rec-submitbtn span{font-size:19px}
.rec-formfine{font-size:11.5px;color:var(--mute);line-height:1.6;margin-top:12px}
.rec-formfine a{color:var(--gold-hi);text-decoration:underline}
.rec-formstatus{color:var(--gold-hi);font-size:12.5px;line-height:1.55;margin-top:10px;min-height:0}
.rec-copybtn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:11px 16px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;margin-top:10px;align-self:flex-start}
/* ——— closing chant + footer strip ——— */
.rec-chant{margin-top:52px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 0;overflow:hidden}
.rec-chant-track{white-space:nowrap;min-width:max-content;display:flex;animation:rec-marquee 24s linear infinite}
.rec-chant-track span{font-family:var(--loud);text-transform:uppercase;font-size:clamp(30px,6.4vw,46px);color:var(--bone);padding-right:20px}
.rec-chant-track i{color:var(--gold);font-style:normal}
.rec-foot{margin:26px 0 10px;display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:space-between;color:var(--mute);font-size:12.5px;letter-spacing:.06em}
.rec-foot .lab{color:var(--gold);letter-spacing:.18em;text-transform:uppercase;font-size:11px}
.rec-note{margin-top:30px;color:var(--mute);font-size:14.5px;line-height:1.6}
/* ——— reduced motion: the marquees, the record and the hovers rest ——— */
@media (prefers-reduced-motion:reduce){.rec-disc,.rec-ticker-track,.rec-chant-track{animation:none}.rec-genre-card,.rec-genre-card:hover{transition:none;transform:none}}
`;

/* ================= STRUCTURE ================= */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const st = document.createElement('style');
  st.dataset.recordsCss = '1';
  st.textContent = CSS;
  document.head.appendChild(st);
}

/* The type lockup (LABEL.md: built in code/SVG, gold on black —
   never AI-generated text art). */
function lockupSvg() {
  return `<svg class="rec-lockup" viewBox="0 0 660 96" role="img" aria-label="${esc(LABEL.name)}">
    <text x="330" y="60" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="54" letter-spacing="7" fill="#d4af37">${esc(LABEL.lockup)}</text>
  </svg>`;
}

/* Play state for one release, read from the artist's OWN landing
   data — the same albums/playable files Listen reads (spec: the
   label page keeps no copy of track data). Fail-soft in both
   directions: missing files or an unbound group = NOT YET PLAYABLE;
   a bound group = the real queue, played through the shell player
   exactly as Listen queues it ({ youtubeId, title, sub, cover }). */
async function releasePlayState(rel) {
  try {
    const [ar, pr] = await Promise.all([
      fetch(`assets/data/albums/${rel.artistSlug}.json`),
      fetch(`assets/data/playable/${rel.artistSlug}.json`),
    ]);
    if (!ar.ok || !pr.ok) return { playable: false, queue: [] };
    const alb = await ar.json();
    const p = await pr.json();
    const tracks = Array.isArray(p.tracks) ? p.tracks : [];
    const groups = alb && Array.isArray(alb.albums) ? alb.albums : [];
    const g = groups.find((x) => x.title === rel.title) || groups[0] || null;
    if (!g || !Array.isArray(g.play) || !g.play.length) return { playable: false, queue: [] };
    const queue = g.play.map((ti) => tracks[ti]).filter((t) => t && t.y)
      .map((t) => ({ youtubeId: t.y, title: t.t, sub: rel.artistName, cover: rel.cover }));
    return queue.length ? { playable: true, queue } : { playable: false, queue: [] };
  } catch { return { playable: false, queue: [] }; }
}

function playStateHtml(rel, st) {
  if (st.playable) {
    return `<button type="button" class="rec-playbtn" data-recplay="${esc(rel.catalog)}">▶ Play — ${esc(rel.title)}</button>`;
  }
  return `<span class="rec-notplay"><span class="dot"></span>Not yet playable</span>
    <p class="rec-notplay-note">The master is still being finished — the founder hears it first, then it plays here, through the house player. No fake play button, ever.</p>`;
}

function bannerHtml(feat, featState) {
  return `<section class="rec-banner reveal" aria-label="${esc(LABEL.name)}">
    <div class="rec-banner-grid">
      <div class="rec-banner-copy">
        <span class="rec-imprint">${esc(LABEL.imprint)}</span>
        ${lockupSvg()}
        <h1 class="rec-loud"><span class="l1">Loud</span><span class="l2">Faith.</span><span class="l3">No boxes.</span></h1>
        <p class="rec-tagline">${esc(LABEL.tagline)}</p>
        <div class="rec-hero-actions">
          <button type="button" class="rec-btn gold" data-scrollto="rec-sound">Explore the sound <span>↗</span></button>
          <button type="button" class="rec-btn ghost" data-scrollto="rec-roster">Meet the duo</button>
        </div>
        <div class="rec-feat">
          <img src="${esc(feat.cover)}" alt="" onerror="this.remove()">
          <div>
            <div class="t">${esc(feat.title)}<span class="rec-cat">${esc(feat.catalog)}</span></div>
            <div class="a">${esc(feat.artistName)} · ${esc(feat.kind)} · the first release</div>
          </div>
        </div>
        <div>${playStateHtml(feat, featState)}</div>
        <p class="rec-hero-note">The sound is real. The roster is being built. <b>✦</b> Proverbs 16:3</p>
      </div>
      <div class="rec-banner-art" aria-hidden="true">
        <img src="${esc(feat.cover)}" alt="" onerror="this.remove()">
        <span class="veil"></span>
      </div>
    </div>
    <div class="rec-disc" aria-hidden="true"><div class="rec-disc-in"><b>16:3</b><small>FAITH<br>RECORDS</small></div></div>
  </section>`;
}

function tickerHtml() {
  const line = 'Hip-Hop ✦ Gospel ✦ R&B ✦ Afrobeats ✦ Rock ✦ Latin ✦ Pop ✦ Country ✦ Worship ✦ Electronic ✦ Jazz ✦ Spoken Word ✦ All genres. One faith. ✦ ';
  return `<div class="rec-ticker" aria-hidden="true"><div class="rec-ticker-track"><span>${esc(line)}</span><span>${esc(line)}</span></div></div>`;
}

function releasesHtml(states) {
  return RELEASES.map((rel, i) => `
  <article class="rec-rel reveal">
    <img loading="lazy" src="${esc(rel.cover)}" alt="" onerror="this.remove()">
    <div>
      <div class="t">${esc(rel.title)}<span class="rec-cat">${esc(rel.catalog)}</span></div>
      <div class="a">${esc(rel.artistName)}</div>
      <div class="k">${esc(rel.kind)} · ${esc(LABEL.name)}</div>
      <p class="credits">${rel.credits.map(esc).join(' · ')}</p>
      <div class="state">${playStateHtml(rel, states[i])}</div>
    </div>
  </article>`).join('');
}

function rosterHtml() {
  return ROSTER.map((act) => `
  <article class="rec-act reveal">
    <div class="rec-duo">
      ${act.members.map((m) => `
      <figure class="rec-voice">
        <img loading="lazy" src="${esc(m.portrait)}" alt="" onerror="this.remove()">
        <figcaption class="cap"><b>${esc(m.name)}</b><span>${esc(m.role)}</span></figcaption>
      </figure>`).join('')}
    </div>
    <div class="rec-act-main">
      <h3>${esc(act.billing)}</h3>
      <span class="rec-chip">${esc(act.chip)}</span>
      <p class="rec-actbio">${esc(act.actBio)}</p>
      <div class="rec-voicebios">
        ${act.members.map((m) => `<div class="rec-voicebio"><b>${esc(m.name)}</b><p>${esc(m.bio)}</p></div>`).join('')}
      </div>
      <div class="rec-actlinks">
        <a class="rec-goldbtn" href="${esc(act.artistHash)}">Hear the duo in Listen <span>↗</span></a>
      </div>
    </div>
  </article>`).join('');
}

function soundHtml() {
  const g0 = GENRES[0];
  return `
  <div class="rec-genre-grid" id="rec-genre-grid" role="group" aria-label="Choose a music genre">
    ${GENRES.map((g, i) => `
    <button type="button" class="rec-genre-card" style="--gacc:${esc(g.accent)}" data-genre="${i}" aria-pressed="${i === 0}" aria-label="Explore ${esc(g.n)}">
      <span class="rec-genre-num">SOUND ${String(i + 1).padStart(2, '0')}</span>
      <strong class="rec-genre-big">${esc(g.n)}</strong>
      <span class="rec-genre-foot"><span>${esc(g.mini)}</span><span class="arr">↗</span></span>
    </button>`).join('')}
  </div>
  <div class="rec-genre-detail" id="rec-genre-detail" aria-live="polite">
    <div class="rec-genre-detail-index" id="rec-genre-detail-index">SOUND 01 / ${GENRES.length}</div>
    <div><h4 id="rec-genre-detail-title">${esc(g0.n)}</h4><p id="rec-genre-detail-copy">${esc(g0.description)}</p></div>
    <button type="button" class="rec-genre-pitch" id="rec-genre-pitch">Bring us this sound <span>↗</span></button>
  </div>`;
}

function breakHtml() {
  return `<section class="rec-break reveal" aria-label="16:3 Faith Records mission statement">
    <span class="side">No perfect people needed</span>
    <p>Faith isn&rsquo;t<br><i>quiet.</i><br>Neither are we.</p>
    <span class="stk">A movement<br>not a mold ✦</span>
  </section>`;
}

function storyHtml() {
  return `
  <div class="rec-manifesto reveal">
    <h3>This isn&rsquo;t about<br>making <em>church music.</em><br>It&rsquo;s about making<br><em>honest music.</em></h3>
    <p>Not a checklist. Not a formula. Not a demand that you sound like somebody else. We believe the gifts you&rsquo;ve been given deserve to be heard, and the person behind the music deserves to be seen.</p>
    <div class="mbottom"><span>All genres. One foundation.</span><span>16:3 Faith Records</span></div>
  </div>
  <div class="rec-story">
    ${STORY.map((s) => `<article class="reveal"><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p></article>`).join('')}
  </div>
  <div class="rec-values">
    ${VALUES.map((v) => `<article class="reveal"><span>${esc(v.n)} /</span><h3>${esc(v.h)}</h3><p>${esc(v.p)}</p></article>`).join('')}
  </div>`;
}

function submitHtml() {
  return `
  <div class="rec-submit">
    <div class="rec-submit-copy">
      <h3>Got a<br><span>voice?</span><br>Let&rsquo;s hear<br>it.</h3>
      <p>Rappers. Singers. Producers. Bands. Songwriters. DJs. Choirs. All backgrounds. All genres. If your music is genuine and your heart is in it, introduce yourself.</p>
      <p>This door is an introduction, nothing more — it makes no promises. No A&amp;R review, signing, or reply is guaranteed; what&rsquo;s guaranteed is that a real introduction lands in the house inbox.</p>
      <div class="sideline"><b>✦</b> Your name could go here.</div>
    </div>
    <div class="rec-formwrap">
      <div class="rec-formhead"><span>Artist introduction / 001</span><span>✦ First contact</span></div>
      <form id="rec-submit-form" novalidate>
        <label for="recf-name">Artist / group name <b>*</b></label>
        <input id="recf-name" name="artist" autocomplete="name" required maxlength="90" placeholder="What do we call you?">
        <div class="rec-formrow">
          <div><label for="recf-email">Email address <b>*</b></label><input type="email" id="recf-email" name="email" autocomplete="email" required placeholder="you@example.com"></div>
          <div><label for="recf-genre">Your sound <b>*</b></label><select id="recf-genre" name="genre" required>
            <option value="">Choose your lane</option>
            ${GENRES.map((g) => `<option>${esc(g.select)}</option>`).join('')}
          </select></div>
        </div>
        <label for="recf-link">A link to your music <b>*</b></label>
        <input id="recf-link" name="music" type="url" required placeholder="https://soundcloud.com/... or other listening link">
        <label for="recf-story">Tell us your story</label>
        <textarea id="recf-story" name="story" rows="4" maxlength="1600" placeholder="What moves you to make music? What&rsquo;s your sound? (Optional)"></textarea>
        <label class="rec-consent"><input id="recf-confirm" type="checkbox" required><span>I own or have permission to share the music in my submission. <b>*</b></span></label>
        <button class="rec-submitbtn" type="submit">Prepare my email introduction <span>↗</span></button>
        <p class="rec-formfine">This form opens your email app with a prepared message to <a href="mailto:hello@163faith.com">hello@163faith.com</a>. Nothing is uploaded, stored, or sent by this page — you press Send in your own email app. Introducing yourself does not promise a response, representation, or recording agreement.</p>
        <p class="rec-formstatus" id="rec-form-status" aria-live="polite"></p>
        <button class="rec-copybtn" type="button" id="rec-copy-submission" hidden>Copy introduction details instead ↗</button>
      </form>
    </div>
  </div>`;
}

/* ================= RENDER + WIRING ================= */

export async function render(root, { player } = {}) {
  injectCss();
  document.title = '16:3 Faith Records — 163 Faith';
  window.__records = { ready: false };
  root.classList.add('rec');
  root.innerHTML = '<p class="rec-note">Opening the label\u2019s door\u2026</p>';

  const feat = RELEASES[0];
  const states = await Promise.all(RELEASES.map(releasePlayState));
  const featState = states[RELEASES.indexOf(feat)];
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.innerHTML = `
    <p class="rec-kicker"><span>The Label</span><span class="hair"></span><span class="tag">163FR Catalog</span></p>
    <nav class="rec-subnav" aria-label="On this page">
      <button type="button" data-scrollto="rec-release">The Release</button>
      <button type="button" data-scrollto="rec-roster">The Roster</button>
      <button type="button" data-scrollto="rec-sound">The Sound</button>
      <button type="button" data-scrollto="rec-story">The Story</button>
      <button type="button" data-scrollto="rec-submit">Introduce Yourself</button>
    </nav>
    ${bannerHtml(feat, featState)}
    ${tickerHtml()}
    <div class="rec-sechead reveal" id="rec-release"><span class="no">01 / The Release</span><h2>The first <em>record.</em></h2><p>The anthem this house was named for — the label&rsquo;s first release, filed first in the catalog.</p></div>
    <div id="rec-releases">${releasesHtml(states)}</div>
    <div class="rec-sechead reveal" id="rec-roster"><span class="no">02 / The Roster</span><h2>Signed to <em>the house.</em></h2><p>The founding act first — every future signing appends here, in signing order.</p></div>
    ${rosterHtml()}
    <div class="rec-sechead reveal" id="rec-sound"><span class="no">03 / The Sound</span><h2>We don&rsquo;t do <em>one</em> <span class="outl">sound.</span></h2><p>God never made everybody sound the same. Why should a label? These are the sounds this label is building toward — tap one to explore it, and if it&rsquo;s yours, the door below opens with your lane already chosen.</p></div>
    ${soundHtml()}
    ${breakHtml()}
    <div class="rec-sechead reveal" id="rec-story"><span class="no">04 / The Story</span><h2>Why a <em>label?</em></h2></div>
    ${storyHtml()}
    <div class="rec-sechead reveal" id="rec-submit"><span class="no">05 / The Open Call</span><h2>The <em>open call.</em></h2></div>
    ${submitHtml()}
    <div class="rec-chant" aria-hidden="true"><div class="rec-chant-track"><span>Don&rsquo;t shrink your sound <i>✦</i> </span><span>Don&rsquo;t shrink your sound <i>✦</i> </span><span>Don&rsquo;t shrink your sound <i>✦</i> </span></div></div>
    <footer class="rec-foot"><span class="lab">${esc(LABEL.footerLine)}</span><span>${feat.credits.map(esc).join(' · ')} — ${esc(feat.title)} (${esc(feat.catalog)})</span></footer>`;

  /* Play buttons — the house player only, never a second player. */
  root.querySelectorAll('[data-recplay]').forEach((btn) => btn.addEventListener('click', () => {
    const i = RELEASES.findIndex((r) => r.catalog === btn.dataset.recplay);
    if (i < 0 || !states[i].playable || !player) return;
    player.playQueue(states[i].queue, 0, RELEASES[i].title);
  }));

  /* In-page navigation — buttons + scrollIntoView (never hash links:
     the hash belongs to the router). */
  root.querySelectorAll('[data-scrollto]').forEach((btn) => btn.addEventListener('click', () => {
    const el = root.querySelector('#' + btn.dataset.scrollto);
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));

  /* The genre wall — Chat's interactivity: select a sound, read its
     vision, pitch it straight into the introduction form. */
  let selectedGenre = 0;
  const grid = root.querySelector('#rec-genre-grid');
  const detail = root.querySelector('#rec-genre-detail');
  const dTitle = root.querySelector('#rec-genre-detail-title');
  const dCopy = root.querySelector('#rec-genre-detail-copy');
  const dIndex = root.querySelector('#rec-genre-detail-index');
  function selectGenre(i) {
    selectedGenre = i;
    const g = GENRES[i];
    if (grid) grid.querySelectorAll('.rec-genre-card').forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    if (dTitle) dTitle.textContent = g.n;
    if (dCopy) dCopy.textContent = g.description;
    if (dIndex) dIndex.textContent = 'SOUND ' + String(i + 1).padStart(2, '0') + ' / ' + GENRES.length;
    if (detail) detail.style.borderLeftColor = g.accent;
  }
  if (grid) grid.querySelectorAll('.rec-genre-card').forEach((b) =>
    b.addEventListener('click', () => selectGenre(+b.dataset.genre)));
  const genreSel = root.querySelector('#recf-genre');
  const pitch = root.querySelector('#rec-genre-pitch');
  if (pitch) pitch.addEventListener('click', () => {
    if (genreSel) genreSel.value = GENRES[selectedGenre].select;
    const target = root.querySelector('#rec-submit');
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    const status = root.querySelector('#rec-form-status');
    if (status) status.textContent = 'Your sound is set to ' + GENRES[selectedGenre].select + ' — now tell us who you are.';
  });

  /* Submissions — Chat's mechanism, honestly labeled: the form
     prepares a mailto to hello@163faith.com in the visitor's own
     email app. Nothing is transmitted, stored, or promised here. */
  const form = root.querySelector('#rec-submit-form');
  const status = root.querySelector('#rec-form-status');
  const copyBtn = root.querySelector('#rec-copy-submission');
  let submissionCopy = '';
  function makeSubmission() {
    const data = new FormData(form);
    const name = String(data.get('artist') || '').trim();
    const email = String(data.get('email') || '').trim();
    const genre = String(data.get('genre') || '').trim();
    const music = String(data.get('music') || '').trim();
    const story = String(data.get('story') || '').trim();
    return {
      name,
      text: '16:3 FAITH RECORDS — ARTIST INTRODUCTION\n\nArtist / Group: ' + name + '\nEmail: ' + email + '\nGenre: ' + genre + '\nMusic Link: ' + music + '\n\nStory:\n' + (story || '(No additional note)') + '\n\nI confirm I own or have permission to share the music in my submission.',
    };
  }
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) {
      if (status) status.textContent = 'Please complete the required fields, including a valid music link and the permission confirmation.';
      return;
    }
    const sub = makeSubmission();
    submissionCopy = sub.text;
    const url = 'mailto:hello@163faith.com?subject=' + encodeURIComponent('16:3 Records artist introduction — ' + sub.name) + '&body=' + encodeURIComponent(sub.text);
    if (status) status.textContent = 'Your email app will open with your introduction ready. Please press Send there to complete it — nothing has been sent by this page.';
    if (copyBtn) copyBtn.hidden = false;
    window.location.href = url;
  });
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    if (!submissionCopy) return;
    try {
      await navigator.clipboard.writeText(submissionCopy);
      if (status) status.textContent = 'Introduction details copied. Email them to hello@163faith.com.';
    } catch {
      const ta = document.createElement('textarea');
      ta.value = submissionCopy;
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      root.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      if (status) status.textContent = ok ? 'Introduction copied. Email it to hello@163faith.com.' : 'Please copy your form details manually and send them to hello@163faith.com.';
    }
  });

  if (window.FaithMotion) window.FaithMotion.armReveals(root);
  window.__records = {
    ready: true,
    releases: RELEASES.length,
    playable: states.map((s) => s.playable),
    genres: GENRES.length,
    roster: ROSTER.length,
  };
}
