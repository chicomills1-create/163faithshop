/* READ hub — THE LIVING WORD rebuild (2026-11-24, founder-supplied
   package "163Faith_Living_Bible_Muse_Package", adopted by the founder
   2026-11-24 20:08 MST as the Read rebuild base; ChatGPT consult
   chatcmpl-EnxjHG8AfzwSPGO1FGLFrxfQjFvLr).
   The face is the package's cinematic reading room: "OPEN THE WORD."
   hero with the pure-CSS 3D leather Bible, the two-page parchment
   reading desk (page turn + touch swipe, focus mode, font size, paper
   tone), the 66-book library, and the Read atmosphere haze (the hub's
   own Bible-scene art, hero-read.webp, folded in from the atmosphere
   rollout crew's Read leg). The desk is wired to the house's verified
   KJV service — the SAME production API the previous hub and the
   People pages use:
     GET /api/bible/books?translation=KJV
     GET /api/bible/KJV/<nr>/<ch>          (full chapter, canonical
                                            verse numbers)
     GET /api/bible/search?q=…&translation=KJV  (server-side search
                                            over the verified corpus)
   API first; the baked production captures (assets/data/read/) are
   the labeled fallback — they cover the book list, the devotional
   archive, and exactly two chapters (Genesis 1, John 3). A chapter
   the service cannot produce is a truthful error, never substituted
   text. The package's 13 demo excerpt groups and its demo search are
   REMOVED — nothing in this module carries sample scripture.
   Carried live features, unchanged in data and behavior: THE BOOKS
   (God Over Everything, both volumes + the free 5-day sample),
   DEVOTIONALS (the daily archive), TODAY'S WORD, the FaithGuide AI
   shelf, and Continue Reading on the house position key
   (163_bible_reading_context). Reading plans (audit D-READ-2) are
   NOT in this build — named remainder in the build record.
   Highlights / margin notes / saved chapters are GUEST-LOCAL on this
   device (key 163faith-livingword-reader-v1) with the disclosure
   printed under the desk and on the notes card — never presented as
   account storage. Read Aloud is the visitor's own device voice
   (browser speech synthesis), user-triggered, labeled as such, and
   it stops on chapter change and on leaving the hub; it is not the
   standing Bible narration voice (separate item, founder hears a
   sample first). */

const API = 'https://faith-hub-api-railway-production.up.railway.app';
const DATA = 'assets/data/read/';
const LS_POS = '163_bible_reading_context';
const LS_DONE = '163-devotional-completions';
const LS_READER = '163faith-livingword-reader-v1';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fetchJSON(url, timeoutMs = 9000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

/* ---------------- module state (fresh per hub entry = clean slate) -------- */
let S = null;
function freshState() {
  return {
    view: 'face', // face | books | devotionals | devotional | word
    books: null, booksSource: '',
    chapterSource: '',
    dev: null, devPage: 0, devEntry: null,
    speechOn: false, utter: null,
    mountSeq: 0,
    desk: { book: 'Psalms', chapter: 23, filter: 'all', bookSearch: '', font: 15, warm: true, highlights: [], saved: [], notes: {}, verses: [], loadSeq: 0, focusVerse: null },
  };
}

/* Reader prefs: guest-local on this device, disclosed on the page. */
function loadReaderPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(LS_READER) || 'null');
    if (p && typeof p === 'object') {
      if (typeof p.font === 'number') S.desk.font = Math.min(23, Math.max(12, p.font));
      if (typeof p.warm === 'boolean') S.desk.warm = p.warm;
      if (Array.isArray(p.highlights)) S.desk.highlights = p.highlights;
      if (Array.isArray(p.saved)) S.desk.saved = p.saved;
      if (p.notes && typeof p.notes === 'object') S.desk.notes = p.notes;
    }
  } catch { /* storage off — session-only prefs */ }
  try {
    const pos = JSON.parse(localStorage.getItem(LS_POS) || 'null');
    if (pos && pos.bookName && pos.chapter) { S.desk.book = pos.bookName; S.desk.chapter = pos.chapter; }
  } catch { /* no saved position — the desk opens at Psalms 23 */ }
}
function storeReaderPrefs() {
  try {
    const d = S.desk;
    localStorage.setItem(LS_READER, JSON.stringify({ font: d.font, warm: d.warm, highlights: d.highlights, saved: d.saved, notes: d.notes }));
  } catch { /* storage off */ }
}
function savePosition(bookNr, bookName, chapter, verse) {
  try { localStorage.setItem(LS_POS, JSON.stringify({ bookNr, bookName, chapter, verse: verse || null })); } catch { /* storage off */ }
}

/* Read Aloud is the device voice; leaving the hub silences it. */
function stopSpeech() {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* noop */ }
  if (S) { S.speechOn = false; S.utter = null; }
}
if (!window.__frSpeechGuard) {
  window.__frSpeechGuard = true;
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/read')) stopSpeech(); });
}

/* ---------------- data loaders (the v1 hub's proven routes) --------------- */
async function loadBooks() {
  if (S.books) return S.books;
  try {
    const d = await fetchJSON(`${API}/api/bible/books?translation=KJV`);
    if (Array.isArray(d.books) && d.books.length === 66) { S.books = d.books; S.booksSource = 'live production API'; return S.books; }
    throw new Error('unexpected books payload');
  } catch {
    const d = await fetchJSON(DATA + 'books.json');
    S.books = d.books; S.booksSource = 'baked production capture (API unreachable from this network)';
    return S.books;
  }
}

const chapterCache = new Map();
async function loadChapter(bookNr, chapter) {
  const key = `KJV-${bookNr}-${chapter}`;
  if (chapterCache.has(key)) return chapterCache.get(key);
  let out = null;
  try {
    const d = await fetchJSON(`${API}/api/bible/KJV/${bookNr}/${chapter}`);
    if (Array.isArray(d.verses) && d.verses.length) out = { data: d, source: 'live production API' };
  } catch { /* fall through to baked capture */ }
  if (!out) {
    try {
      const d = await fetchJSON(`${DATA}chapters/kjv-${bookNr}-${chapter}.json`);
      if (Array.isArray(d.verses) && d.verses.length) out = { data: d, source: 'baked production capture (API unreachable from this network)' };
    } catch { /* no capture for this chapter */ }
  }
  if (!out) throw new Error(`Chapter unavailable: the production API did not answer and no baked capture exists for book ${bookNr} chapter ${chapter}.`);
  chapterCache.set(key, out);
  return out;
}

async function loadDevotionals() {
  if (S.dev) return S.dev;
  const d = await fetchJSON(DATA + 'devotionals.json');
  S.dev = d.entries;
  return S.dev;
}
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function publishedDev() { return (S.dev || []).filter((e) => e.date <= todayISO()).slice().sort((a, b) => (a.date < b.date ? 1 : -1)); }
function todaysEntry() { const p = publishedDev(); return p[0] || null; } // exact-date match else latest prior — production lookup logic

function parseReference(q, books) {
  // Reference search KEEPS SPACES: "John 3:16", "1 Samuel 2", "Psalms 37".
  const m = q.trim().match(/^(.+?)\s+(\d+)(?::(\d+)(?:-\d+)?)?/);
  if (!m) return null;
  const name = m[1].trim().toLowerCase();
  const hit = books.find((b) => b.name.toLowerCase() === name)
    || books.find((b) => b.name.toLowerCase().replace(/^psalms$/, 'psalm') === name)
    || books.filter((b) => b.name.toLowerCase().startsWith(name)).sort((a, b) => a.name.length - b.name.length)[0];
  if (!hit) return null;
  return { book: hit, chapter: parseInt(m[2], 10), verse: m[3] ? parseInt(m[3], 10) : null };
}

/* -------- the provider the Living Word desk reads through -----------------
   Bound before the desk initializes (the desk is initialized by this
   module's render, below). Book name -> nr rides the books metadata
   from the same verified service; phrase search rides the service's
   own server search. Missing chapter = a thrown, truthful error. */
window.FaithReadBibleProvider = {
  async getChapter({ book, chapter, translation }) {
    if (translation && translation !== 'KJV') throw new Error('Unsupported Bible translation');
    const books = await loadBooks();
    const meta = books.find((b) => b.name === book);
    if (!meta) throw new Error('Unknown book: ' + book);
    if (chapter < 1 || chapter > meta.chapters) throw new Error(`${book} has no chapter ${chapter}`);
    const { data, source } = await loadChapter(meta.nr, chapter);
    return { translation: 'KJV', attribution: 'King James Version', source, verses: data.verses.map((v) => ({ number: v.verse, text: v.text })) };
  },
  async search({ query, translation }) {
    if (translation && translation !== 'KJV') throw new Error('Unsupported Bible translation');
    const d = await fetchJSON(`${API}/api/bible/search?q=${encodeURIComponent(query)}&translation=KJV`);
    if (!Array.isArray(d.results)) throw new Error('unexpected search payload');
    return { results: d.results };
  },
};


const STYLE = `<style>

:root{--fr-bg:#080808;--fr-coal:#11100e;--fr-gold:#edc65d;--fr-gold-pale:#ffdf91;--fr-gold-deep:#9d772b;--fr-red:#e33a32;--fr-cream:#f6f0df;--fr-muted:#b5ab99;--fr-paper:#f3e7cc;--fr-ink:#352819;--fr-line:rgba(231,188,87,.26);--fr-sans:Inter,Arial,Helvetica,sans-serif;--fr-display:Impact,'Arial Black','Liberation Sans Narrow',sans-serif;--fr-serif:Georgia,'Times New Roman',serif}#faith-read-app *,#faith-read-app *::before,#faith-read-app *::after,#faith-read-app *::before,#faith-read-app *::after{box-sizing:border-box}.fread-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.fread-container{width:min(1390px,calc(100% - 80px));margin:auto}#faith-read-app{background:#090909;color:var(--fr-cream);font-family:var(--fr-sans);isolation:isolate;overflow:clip}#faith-read-app button,#faith-read-app input,#faith-read-app select,#faith-read-app textarea{font:inherit}#faith-read-app button{cursor:pointer}#faith-read-app a{text-decoration:none;color:inherit}#faith-read-app :focus-visible{outline:2px solid var(--fr-gold);outline-offset:2px}.fread-hero{position:relative;background:#0e0c08;min-height:770px;overflow:hidden;isolation:isolate}.fread-hero::before{content:"";position:absolute;inset:0;background:url('assets/img/read/urban-wall.svg') repeat center / 760px 400px;opacity:.48;z-index:-3}.fread-hero::after{content:"";position:absolute;inset:-25% -10% 0;background:radial-gradient(ellipse at 71% 50%,rgba(192,114,22,.31),transparent 34%),linear-gradient(90deg,rgba(7,7,7,.28) 0%,rgba(6,6,6,.6) 48%,rgba(8,7,6,.15) 100%);z-index:-2}.fread-hero-grit{position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,5,5,.75),transparent 33%),url('assets/img/read/grain.svg') repeat;background-size:auto,260px 260px;opacity:.65;mix-blend-mode:screen;pointer-events:none;z-index:-1}.fread-hero-grid{min-height:710px;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:48px;padding-top:54px;padding-bottom:40px}.fread-hero-copy{position:relative;z-index:4}.fread-smalltag{color:var(--fr-gold);font-size:10px;font-weight:1000;letter-spacing:2.7px;display:flex;align-items:center;gap:12px}.fread-red-dot{width:7px;height:7px;border-radius:50%;background:var(--fr-red);box-shadow:0 0 12px var(--fr-red)}.fread-line{display:inline-block;width:50px;height:1px;background:#886a2f}.fread-hero-kicker{margin:38px 0 12px;font-weight:900;font-size:11px;letter-spacing:2.2px;color:#d7c8ae}.fread-hero-kicker em{font-style:normal;color:var(--fr-gold)}.fread-hero h1{margin:0;font:900 clamp(80px,9.5vw,165px)/.85 var(--fr-display);letter-spacing:-3px;transform:scaleX(.94);transform-origin:left center;text-transform:uppercase;color:#f5f0e6;text-shadow:0 14px 25px rgba(0,0,0,.5)}.fread-hero h1 span{display:inline-block;color:var(--fr-gold);background:linear-gradient(110deg,#fff0ae,#cc9e37,#ffe79e);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}.fread-hero-lead{max-width:515px;color:#c6bba9;font-size:17px;line-height:1.85;margin:28px 0 30px}.fread-hero-actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap}.fread-goldbtn{border:none;color:#171006!important;background:linear-gradient(115deg,#fce38a,#d7a93e);font-weight:1000;font-size:12px;letter-spacing:1.1px;border-radius:4px;padding:16px 22px;display:inline-flex;align-items:center;justify-content:space-between;gap:28px;box-shadow:0 12px 25px rgba(0,0,0,.28)}.fread-goldbtn:hover{background:#ffe7a3;transform:translateY(-1px)}.fread-textbtn{background:transparent;border:0;border-bottom:1px solid #766134;padding:10px 0;color:#f0dfb1;font-size:11px;font-weight:900;letter-spacing:1px}.fread-textbtn span{color:var(--fr-gold)}.fread-stats{display:flex;margin-top:58px;gap:34px}.fread-stats>div{border-left:2px solid #816733;padding-left:15px;display:flex;flex-direction:column;gap:3px}.fread-stats strong{font:900 32px/1 var(--fr-display);letter-spacing:1px}.fread-stats span{font-size:9px;color:var(--fr-gold);letter-spacing:1.3px;font-weight:900}.fread-hero-art{min-height:570px;position:relative;display:flex;justify-content:center;align-items:center;perspective:1200px}.fread-hero-art::before{content:"";position:absolute;left:0;right:0;bottom:55px;height:28%;background:linear-gradient(180deg,transparent,#191510 22%,#050505 80%);filter:drop-shadow(0 -8px 16px rgba(250,174,52,.1));transform:rotate(-4deg) skewX(-15deg);border-top:2px solid #5a3a1a}.fread-book-scene{position:relative;width:430px;height:530px;display:grid;place-items:center;transform:translateY(-20px)}.fread-book-glow{position:absolute;width:540px;height:540px;border-radius:50%;background:radial-gradient(circle,rgba(234,156,30,.3),rgba(106,57,8,.08) 48%,transparent 72%);filter:blur(35px)}.fread-book-shadow{position:absolute;bottom:38px;left:30px;width:395px;height:90px;background:rgba(0,0,0,.95);filter:blur(24px);transform:rotate(-10deg)}.fread-book-3d{position:relative;width:310px;height:440px;transform:rotate(-7deg) rotateY(-18deg) rotateX(2deg);transform-style:preserve-3d;filter:drop-shadow(18px 22px 20px #000);animation:fread-float 7s ease-in-out infinite alternate}.fread-book-cover{position:absolute;inset:0;background:radial-gradient(ellipse at 35% 25%,#2b261f,transparent 65%),repeating-linear-gradient(125deg,rgba(255,255,255,.02) 0,rgba(255,255,255,.02) 1px,transparent 2px,transparent 5px),linear-gradient(125deg,#211c16,#070809 30%,#15110d 65%,#070606);border:3px solid #6a4e20;border-radius:4px 8px 8px 3px;box-shadow:inset 0 0 32px #000,inset 7px 0 11px #000,inset -5px 0 16px #69521a;z-index:4;display:flex;padding:16px}.fread-book-cover::after{content:"";position:absolute;inset:5px;border:1px solid rgba(244,210,124,.28);pointer-events:none}.fread-gold-border{height:100%;width:100%;border:2px solid #dcb861;box-shadow:inset 0 0 18px rgba(219,170,66,.15),0 0 6px rgba(219,170,66,.2);display:flex;flex-direction:column;align-items:center;text-align:center;justify-content:space-between;padding:29px 11px;color:#e9c36b}.fread-cover-overline{font:800 11px var(--fr-serif);letter-spacing:3px}.fread-book-symbol{font-family:var(--fr-serif);font-size:115px;line-height:1;text-shadow:0 0 20px #b68c3970;color:#d3a942}.fread-book-title{font:900 40px/.92 var(--fr-serif);letter-spacing:-1px;color:#e9c46b;text-shadow:0 2px 1px #000}.fread-book-title span{font-size:51px}.fread-book-subtitle{font-size:11px;font-weight:900;letter-spacing:3px}.fread-cover-163{border-top:1px solid #7c642e;padding-top:16px;font-size:8px;letter-spacing:1.6px;font-weight:900}.fread-book-spine{position:absolute;left:-25px;top:2px;height:435px;width:30px;transform:rotateY(-72deg) translateZ(5px);background:linear-gradient(90deg,#040403,#382915,#15100b);border-left:2px solid #bb924c;border-right:2px solid #725221;writing-mode:vertical-rl;text-align:center;color:#e6c16c;font-family:var(--fr-serif);font-weight:900;font-size:17px;letter-spacing:3px;padding:40px 4px}.fread-book-spine b{font-size:25px}.fread-book-pageedge{position:absolute;right:-28px;top:9px;width:31px;height:426px;transform:rotateY(70deg);transform-origin:left center;background:repeating-linear-gradient(0deg,#f8e8b6 0,#f8e8b6 1px,#a68743 2px,#f7dfa1 3px);box-shadow:inset 8px 0 8px rgba(61,41,15,.4);border-right:2px solid #5e3d12}.fread-urban-tag{position:absolute;top:40px;right:0;font-size:80px;font-family:var(--fr-serif);line-height:1;color:#ca9b39;opacity:.45;transform:rotate(14deg);display:flex;gap:8px;align-items:center}.fread-urban-tag span{font-family:var(--fr-display);font-size:27px;line-height:1.05}.fread-art-callout{position:absolute;right:5px;bottom:20px;display:flex;gap:16px;align-items:flex-end;border-left:2px solid var(--fr-gold);padding-left:15px;line-height:1.2}.fread-art-callout span{font:900 11px var(--fr-sans);color:var(--fr-gold);letter-spacing:2px}.fread-art-callout b{font:900 13px/1.5 var(--fr-sans);letter-spacing:1px;color:#d3c3a8}.fread-hero-bottom{max-width:1390px;margin:0 auto;padding:10px 0 24px;display:flex;justify-content:space-between;font-size:9px;font-weight:900;letter-spacing:1.7px;color:#a9956d}.fread-hero-bottom a{color:var(--fr-gold)!important}@keyframes fread-float{from{transform:translateY(0) rotate(-7deg) rotateY(-18deg) rotateX(2deg)}to{transform:translateY(-12px) rotate(-5deg) rotateY(-12deg) rotateX(3deg)}}.fread-marquee{border-block:1px solid #8f6c2a;background:#d7aa41;color:#12100b;overflow:hidden;white-space:nowrap;height:43px;display:flex;align-items:center}.fread-marquee div{display:inline-block;min-width:100%;font:900 13px var(--fr-display);letter-spacing:2px;transform:scaleX(1.02);animation:fread-scroll 40s linear infinite}.fread-marquee span{color:#6c251b}@keyframes fread-scroll{from{transform:translateX(0)}to{transform:translateX(-28%)}}.fread-reading-section{background:radial-gradient(ellipse at 50% 12%,rgba(144,94,24,.12),transparent 58%),linear-gradient(180deg,#11100e,#090909 68%);padding:92px 0 110px;position:relative}.fread-reading-section::before{content:"";position:absolute;inset:0;background:url('assets/img/read/urban-wall.svg') repeat /760px 400px;opacity:.08;pointer-events:none}.fread-reading-section>.fread-container{position:relative}.fread-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:34px}.fread-eyebrow{color:var(--fr-gold);font:900 10px var(--fr-sans);letter-spacing:2.6px}.fread-section-head h2,.fread-closer h2{font:900 clamp(49px,6.3vw,95px)/.94 var(--fr-display);letter-spacing:-1px;margin:12px 0 15px;text-transform:uppercase}.fread-section-head h2 em{color:var(--fr-gold);font-style:normal}.fread-section-head p{font-size:14px;color:#aaa296;line-height:1.7;max-width:590px;margin:0}.fread-version{text-align:right;border:1px solid var(--fr-line);border-radius:6px;padding:13px 15px;display:grid;gap:7px;min-width:215px;background:#1a1610}.fread-version b{font:900 10px var(--fr-sans);letter-spacing:1.6px;color:var(--fr-gold)}.fread-version span{font-size:10px;color:#978c77}.fread-desk-toolbar{display:flex;align-items:center;gap:13px;margin-bottom:17px}.fread-desk-search{display:flex;align-items:center;flex:1;background:#15130e;border:1px solid #6c5229;border-radius:7px;min-height:54px;padding-left:16px}.fread-search-icon{font-size:30px;line-height:1;color:var(--fr-gold)}.fread-desk-search input{background:transparent;border:0;padding:12px;color:#f2e4c2;min-width:0;flex:1;outline:none;font-size:13px}.fread-desk-search input::placeholder{color:#98886e}.fread-desk-search button{align-self:stretch;border:none;border-left:1px solid #634f2e;border-radius:0 6px 6px 0;background:#edc35b;color:#17110b;padding:0 22px;font-size:11px;font-weight:950;letter-spacing:1px}.fread-rail-btn{border:1px solid #674e25;background:#1e190e;color:var(--fr-gold);padding:16px 18px;font-size:10px;font-weight:900;letter-spacing:1px;white-space:nowrap;display:none}.fread-search-results{border:1px solid #655026;background:#17140d;padding:15px 18px;border-radius:8px;margin-bottom:16px;max-height:290px;overflow:auto}.fread-search-results[hidden]{display:none}.fread-search-results .fread-result{width:100%;border:1px solid #4e3d24;background:#211b11;color:#e8d7b2;text-align:left;border-radius:6px;padding:10px 13px;margin:4px 0;display:block}.fread-result b{color:var(--fr-gold)}.fread-result span{display:block;margin-top:4px;color:#b8ac94;font-family:var(--fr-serif)}.fread-search-results p{color:#bcaf91;margin:5px 0;font-size:12px}.fread-reader-grid{display:grid;grid-template-columns:minmax(208px,225px) minmax(0,1fr) minmax(178px,198px);gap:19px;align-items:start}.fread-library{background:#171410;border:1px solid #4c3921;border-radius:9px;padding:16px 13px;min-width:0;min-height:648px;box-shadow:0 10px 40px #0005}.fread-library-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:15px}.fread-library-title span{font-size:11px;letter-spacing:2px;font-weight:1000}.fread-library-title b{font-size:9px;letter-spacing:1px;color:var(--fr-gold)}.fread-library>input{width:100%;background:#100e0b;border:1px solid #594329;color:#f4e8ce;padding:11px 12px;border-radius:5px;font-size:12px;outline-color:var(--fr-gold)}.fread-library-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:10px 0 13px}.fread-library-tabs button{background:#231b12;border:1px solid #44331f;border-radius:4px;padding:9px 2px;color:#a99c84;font-size:10px;font-weight:900;letter-spacing:1px}.fread-library-tabs button.is-active{background:#b88f3d;color:#1a140d;border-color:#eac065}.fread-book-list{max-height:485px;overflow:auto;scrollbar-color:#765a31 #171410;padding-right:3px}.fread-book-item{width:100%;border:0;border-bottom:1px solid #322719;background:transparent;color:#c6baab;text-align:left;padding:9px 9px;display:flex;justify-content:space-between;gap:7px;align-items:center;border-radius:4px;font-size:12px}.fread-book-item:hover{color:var(--fr-gold);background:#2b2217}.fread-book-item.is-active{color:#ffe39b;background:#44321a;border-left:3px solid var(--fr-gold)}.fread-book-item small{color:#877c6c;font-size:9px;white-space:nowrap}.fread-library-caption{border-top:1px solid #41331f;font-size:9px;color:#8d7752;margin-top:16px;padding-top:13px;line-height:1.6;font-weight:800;letter-spacing:.9px}.fread-bible-column{min-width:0}.fread-chapter-rail{border:1px solid #5d4420;background:#201a11;padding:14px 17px;border-radius:8px 8px 0 0;display:flex;gap:12px;align-items:center;justify-content:space-between}.fread-current-label{display:grid;gap:1px}.fread-current-label span{font-size:9px;color:#b6a171;letter-spacing:2px;font-weight:900}.fread-current-label strong{font:900 21px var(--fr-serif);color:#f7dfaa}.fread-chapter-controls{display:flex;gap:6px}.fread-chapter-controls button,.fread-chapter-controls select{border:1px solid #76603b;background:#14110e;color:#f4db9f;border-radius:4px;min-width:36px;height:37px;text-align:center;font-size:13px}.fread-chapter-controls select{padding:0 10px;max-width:116px}.fread-open-book{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:510px;background:#d6c19b;border:2px solid #7e6033;border-top:none;border-radius:0 0 6px 6px;box-shadow:0 8px 0 #806338,0 11px 0 #e2c88d,0 13px 0 #3c2b18,0 20px 0 #bda478,0 31px 40px #000b,0 0 65px rgba(169,111,27,.12);transform:perspective(1700px) rotateX(1.8deg);transform-origin:center top;--fread-text-size:15px;z-index:1}.fread-open-book::before{content:"";position:absolute;top:0;left:-6px;bottom:0;width:12px;background:linear-gradient(90deg,#7e5b2f,#d8bb81,#f5e2bf);border-radius:2px;pointer-events:none}.fread-open-book::after{content:"";position:absolute;top:0;right:-6px;bottom:0;width:12px;background:linear-gradient(90deg,#ead3a3,#8f6a35);border-radius:2px;pointer-events:none}.fread-book-gutter{position:absolute;left:calc(50% - 9px);width:18px;inset-block:0;background:linear-gradient(90deg,rgba(80,51,25,.35),rgba(99,69,26,.13) 38%,rgba(255,255,255,.38) 52%,rgba(81,58,35,.26));z-index:3;pointer-events:none}.fread-paper{position:relative;min-width:0;background:linear-gradient(120deg,rgba(255,255,255,.14),transparent 30%),repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(110,75,25,.01) 4px),radial-gradient(ellipse at 25% 30%,#ffefd0,#e8d5b3 100%);color:var(--fr-ink);padding:25px 24px 38px;min-height:500px;overflow:hidden}.fread-paper-left{border-radius:0 0 0 3px;box-shadow:inset 14px 0 28px rgba(99,63,32,.18),inset -15px 0 26px rgba(97,62,34,.17);padding-right:31px}.fread-paper-right{border-radius:0 0 3px 0;box-shadow:inset -16px 0 28px rgba(91,60,29,.16),inset 15px 0 26px rgba(87,55,23,.17);padding-left:33px}.fread-paper-top{display:flex;justify-content:space-between;gap:8px;padding-bottom:11px;border-bottom:1px solid #b8a17d;color:#90764f;font:700 9px var(--fr-serif);letter-spacing:1px}.fread-paper-inner{max-height:460px;overflow:auto;padding:15px 2px 2px;scrollbar-width:thin;scrollbar-color:#b4a07e transparent}.fread-chapter-ornament{text-align:center;color:#947342;font-size:20px;line-height:1}.fread-book-label{text-align:center!important;margin:9px 0 2px!important;font-size:8px!important;letter-spacing:2px;color:#977f58!important;font-family:var(--fr-sans)!important}.fread-paper h3{font:900 clamp(24px,2.2vw,34px)/1.1 var(--fr-serif);margin:2px 0 8px;text-align:center;letter-spacing:.1px}.fread-rule{display:flex;align-items:center;gap:8px;font-size:14px;color:#a18a62;margin:10px 0}.fread-rule::before,.fread-rule::after{content:"";height:1px;flex:1;background:#bba883}.fread-book-chapter{text-align:center;color:#876e45;font:700 10px var(--fr-serif);letter-spacing:2px;margin:0 0 13px}.fread-book-chapter span{font-size:12px}.fread-verses{font:var(--fread-text-size)/1.7 var(--fr-serif);text-align:left;hyphens:auto}.fread-verse{display:block;margin:0 0 11px;color:#31291c;overflow-wrap:break-word;cursor:pointer;border-radius:4px;padding:3px 2px}.fread-verse:hover{background:#d7be8d6b}.fread-verse.is-highlighted{background:linear-gradient(transparent 38%,#dab95b8a 38%,#dab95b8a 90%,transparent 90%)}.fread-verse-num{font:700 11px var(--fr-serif);color:#9d7637;margin-right:6px;vertical-align:top}.fread-page-num{position:absolute;bottom:12px;left:23px;right:23px;display:flex;justify-content:space-between;gap:6px;color:#a48a60;font:700 9px var(--fr-serif);letter-spacing:1px;border-top:1px solid #c1af92;padding-top:8px}.fread-flip-sheet{position:absolute;top:0;right:0;width:50%;height:100%;z-index:5;background:linear-gradient(90deg,#c5a873,#f2e4c4 22%,#ecd9b7 100%);transform-origin:left center;opacity:0;pointer-events:none;backface-visibility:hidden;box-shadow:inset 8px 0 30px #69441b42}.fread-open-book.is-flipping .fread-flip-sheet{opacity:1;animation:fread-turnpage .48s ease-in-out forwards}@keyframes fread-turnpage{0%{transform:rotateY(0)}30%{box-shadow:inset 18px 0 20px #6e502d66}95%{opacity:1}100%{transform:rotateY(-175deg);opacity:0}}.fread-page-empty{padding:18px 10px;text-align:center}.fread-page-empty .fread-empty-icon{font-size:35px;color:#917142}.fread-page-empty strong{display:block;font:900 18px var(--fr-serif);margin:9px 0}.fread-page-empty p{font:12px/1.6 var(--fr-sans);color:#7d694b}.fread-reader-alert{color:#b4a68f;min-height:24px;padding:25px 2px 5px;font-size:10px;line-height:1.6}.fread-reader-alert.is-warning{color:#e5b974}.fread-reader-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid #5b4326;padding-top:12px}.fread-reader-action-left,.fread-reader-action-right{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.fread-reader-actions button{border:1px solid #655029;background:#201a10;color:#e3c683;border-radius:4px;padding:10px 11px;font-size:9px;font-weight:900;letter-spacing:.8px}.fread-reader-actions button:hover{background:#392a17}.fread-mobile-hint{color:#88775c;font-size:9px;letter-spacing:.9px;font-weight:900;margin-top:12px}.fread-side-desk{min-width:0;display:grid;gap:15px}.fread-aside-card{border:1px solid #544024;border-radius:8px;padding:20px;background:linear-gradient(150deg,#251d10,#11100d 78%);position:relative;overflow:hidden}.fread-aside-eyebrow{color:var(--fr-gold);font-size:9px;letter-spacing:1.8px;font-weight:900}.fread-aside-card h3{font:900 31px/.95 var(--fr-display);margin:20px 0 12px}.fread-aside-card p{font-size:12px;line-height:1.75;color:#bcae92;margin:0}.fread-aside-cross{position:absolute;right:-10px;bottom:-34px;font:200px var(--fr-serif);color:rgba(191,142,58,.09);pointer-events:none}.fread-aside-note{background:#19140d}.fread-aside-note h3{font-size:25px}.fread-aside-note label{display:block;font-size:11px;color:#bda981;margin:15px 0 8px}.fread-aside-note textarea{display:block;width:100%;background:#090907;border:1px solid #584527;border-radius:5px;color:#f3e0b7;resize:vertical;padding:9px;font-size:12px;min-height:95px;outline-color:var(--fr-gold)}.fread-aside-note button{width:100%;border:1px solid #b58a33;background:#30240f;color:var(--fr-gold);font-size:10px;font-weight:900;letter-spacing:1px;padding:10px;margin:8px 0}.fread-aside-note p{font-size:9px;line-height:1.5;color:#84765f}.fread-featured-jump{border-top:1px solid #6b512f;padding:12px 3px;display:grid;gap:7px}.fread-featured-jump>span{font-size:9px;letter-spacing:2px;color:var(--fr-gold);font-weight:900}.fread-featured-jump button{border:0;border-bottom:1px solid #463720;background:none;text-align:left;color:#eee1c6;padding:9px 2px;font-size:10px;font-weight:900;letter-spacing:1px}.fread-closer{padding:105px 0;background:radial-gradient(ellipse at 70% 50%,#3c2915,#100e0b 65%),url('assets/img/read/urban-wall.svg') center/cover;border-top:1px solid #46331e}.fread-closer-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:60px;align-items:center}.fread-closer h2{font-size:clamp(60px,6.5vw,98px);line-height:.9}.fread-closer h2 span{color:var(--fr-gold)}.fread-closer p{font-size:15px;line-height:1.8;color:#bcaf99;max-width:470px}.fread-closer-actions{display:flex;align-items:center;gap:21px;margin-top:27px;flex-wrap:wrap}.fread-simple-link{border-bottom:1px solid var(--fr-gold);color:var(--fr-gold)!important;font-weight:850;font-size:11px;letter-spacing:1px;padding:8px}.fread-closer-cards{display:grid;gap:14px}.fread-closer-cards>div{background:#15120e;border:1px solid #584224;min-height:102px;padding:21px 25px;display:grid;grid-template-columns:44px 1fr;gap:0 12px}.fread-closer-cards span{font:900 30px var(--fr-display);color:var(--fr-gold);grid-row:span 2}.fread-closer-cards b{font-size:16px;letter-spacing:.5px}.fread-closer-cards p{font-size:12px;margin:2px 0 0}.fread-verse-banner{text-align:center;padding:80px 0 90px;background:linear-gradient(to top,#090909,#100d0b 52%,transparent),url('assets/img/read/city-night.webp') center 60% / cover;border-top:1px solid #977436}.fread-verse-banner span{font-size:10px;font-weight:900;color:var(--fr-gold);letter-spacing:2.4px}.fread-verse-banner blockquote{font:italic 36px/1.3 var(--fr-serif);max-width:850px;margin:28px auto;text-shadow:0 4px 18px #000}.fread-verse-banner p{color:#dfb45b;font-weight:800;letter-spacing:2px;font-size:10px}.fread-verse-banner b{color:var(--fr-red)}.fread-toast{position:fixed;z-index:200;bottom:30px;left:50%;transform:translateX(-50%);background:#271d10;border:1px solid var(--fr-gold);color:#f4d98c;border-radius:7px;max-width:min(520px,95vw);padding:12px 20px;font-size:12px;box-shadow:0 8px 24px #000c}.fread-toast[hidden]{display:none}@media(max-width:1230px){.fread-reader-grid{grid-template-columns:205px minmax(0,1fr)}.fread-side-desk{grid-column:1/-1;grid-template-columns:1fr 1.4fr 1fr}.fread-side-desk .fread-aside-card{min-height:225px}.fread-open-book{min-height:500px}.fread-paper{min-height:490px}.fread-hero h1{font-size:clamp(75px,9vw,122px)}}@media(max-width:970px){.fread-container{width:min(100% - 42px,880px)}.fread-hero-grid{gap:10px;min-height:660px}.fread-hero h1{font-size:clamp(70px,10vw,100px)}.fread-book-scene{transform:translateY(-15px) scale(.82)}.fread-art-callout{right:0;bottom:70px}.fread-reader-grid{grid-template-columns:205px minmax(0,1fr)}.fread-paper{padding:18px 15px 35px}.fread-paper-left{padding-right:22px}.fread-paper-right{padding-left:22px}.fread-paper h3{font-size:23px}.fread-side-desk{grid-template-columns:1fr 1fr}.fread-featured-jump{grid-column:1/-1;grid-template-columns:repeat(4,1fr);align-items:center}}@media(max-width:720px){.fread-hero{min-height:880px}.fread-hero-grid{display:flex;flex-direction:column;align-items:flex-start;min-height:0;padding-top:45px;gap:0}.fread-hero h1{font-size:clamp(78px,16vw,118px);line-height:.83}.fread-hero-kicker{margin-top:26px}.fread-hero-lead{font-size:14px;line-height:1.65}.fread-stats{margin-top:28px;gap:24px}.fread-stats strong{font-size:25px}.fread-hero-art{width:100%;min-height:330px;max-height:370px}.fread-book-scene{transform:translateY(-48px) scale(.65)}.fread-urban-tag{top:-11px;right:5px}.fread-art-callout{display:none}.fread-hero-bottom{padding:0 21px 18px;font-size:8px}.fread-hero-bottom span{max-width:240px}.fread-reading-section{padding:64px 0}.fread-section-head{align-items:flex-start;flex-direction:column;gap:16px}.fread-section-head h2{font-size:65px}.fread-version{text-align:left}.fread-desk-toolbar{flex-wrap:wrap}.fread-desk-search{min-width:100%;order:1}.fread-desk-search input{font-size:12px}.fread-desk-search button{padding:0 13px}.fread-rail-btn{display:block;order:2;width:100%}.fread-reader-grid{display:block;position:relative}.fread-library{display:none;min-height:0;margin-bottom:18px}.fread-library.is-visible{display:block}.fread-book-list{max-height:295px}.fread-chapter-rail{padding:10px}.fread-current-label strong{font-size:17px}.fread-chapter-controls select{min-width:85px}.fread-open-book{transform:none;min-height:0;grid-template-columns:1fr 1fr;box-shadow:0 6px 0 #967345,0 12px 16px #000b}.fread-paper{min-height:445px;padding:16px 12px 31px}.fread-paper-left{padding-right:17px}.fread-paper-right{padding-left:17px}.fread-paper-top{font-size:7px;letter-spacing:.3px}.fread-paper h3{font-size:20px}.fread-paper-inner{max-height:420px}.fread-verses{font-size:13px;line-height:1.7}.fread-book-label{font-size:7px!important}.fread-book-chapter{font-size:8px}.fread-page-num{font-size:7px;left:12px;right:12px}.fread-side-desk{grid-template-columns:1fr 1fr;margin-top:33px}.fread-featured-jump{display:none}.fread-closer{padding:72px 0}.fread-closer-grid{display:block}.fread-closer h2{font-size:73px}.fread-closer-cards{margin-top:35px}.fread-verse-banner blockquote{font-size:29px}}@media(max-width:460px){.fread-container{width:calc(100% - 28px)}.fread-hero{min-height:860px}.fread-hero h1{font-size:clamp(72px,18vw,93px)}.fread-smalltag{font-size:8px;letter-spacing:1.5px}.fread-hero-actions{gap:13px}.fread-hero .fread-goldbtn{padding:14px 13px;gap:12px;font-size:10px}.fread-textbtn{font-size:10px}.fread-hero-art{min-height:320px}.fread-stats{gap:14px}.fread-stats>div{padding-left:9px}.fread-stats strong{font-size:23px}.fread-stats span{font-size:8px}.fread-section-head h2{font-size:58px}.fread-desk-search input{width:20px}.fread-desk-search input::placeholder{font-size:10px}.fread-desk-search button{font-size:9px;padding:0 12px}.fread-paper{padding:13px 10px 30px;min-height:405px}.fread-paper-left{padding-right:15px}.fread-paper-right{padding-left:15px}.fread-book-gutter{left:calc(50% - 5px);width:10px}.fread-paper h3{font-size:17px}.fread-verses{font-size:12.5px;line-height:1.62}.fread-page-num{font-size:6px}.fread-side-desk{grid-template-columns:1fr}.fread-aside-card h3{font-size:27px}.fread-closer h2{font-size:63px}.fread-verse-banner{padding:60px 0}.fread-verse-banner blockquote{font-size:26px}}@media(prefers-reduced-motion:reduce){.fread-book-3d,.fread-marquee div{animation:none!important}.fread-open-book.is-flipping .fread-flip-sheet{animation:none;opacity:0}}.fread-open-book.is-cool .fread-paper{background:linear-gradient(120deg,rgba(255,255,255,.22),transparent 38%),#fcf5e7}.fread-open-book.is-expanded{display:block;min-height:0;transform:none;box-shadow:0 8px 0 #94754b,0 18px 30px #0009}.fread-open-book.is-expanded .fread-paper{min-height:0;padding:28px clamp(22px,4vw,64px) 55px;box-shadow:inset 0 0 30px rgba(95,65,26,.1)}.fread-open-book.is-expanded .fread-paper-right{border-top:1px solid #b8a17d}.fread-open-book.is-expanded .fread-book-gutter{display:none}.fread-open-book.is-expanded .fread-paper-inner{max-height:none;overflow:visible}.fread-open-book.is-expanded .fread-verses{font-size:max(19px,var(--fread-text-size));line-height:1.85;max-width:650px;margin:auto}.fread-open-book.is-expanded .fread-paper h3{font-size:34px}@media(max-width:460px){.fread-open-book.is-expanded .fread-paper{padding:26px 20px 48px}.fread-open-book.is-expanded .fread-verses{font-size:18px}}
/* ---------- READ ATMOSPHERE (2026-11-24, founder order; ported from the
   atmosphere rollout crew's Read leg into this rebuild) ----------
   The Read face sat on flat black — on a wide screen the flanks were
   dead space. A fixed haze of the hub's own Bible scene — hands turning
   the page of a great old Bible in golden sanctuary light (hero-read;
   the founder's 'light haze of a bible scene', in its right room) —
   breathes behind the Read face only: painted as the first node of the
   view, so it leaves with the view. A haze you feel, not a picture you
   look at: heavy blur + darkness at low opacity, radial-masked to
   nothing across the center content column and at every edge.
   pointer-events none, aria-hidden, fixed + inset 0, so it can never
   add a pixel of scroll. The drift is barely perceptible and dies
   under prefers-reduced-motion; phones get a fainter, still layer. */
.fr-atmo{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#050505}
.fr-atmo::before{content:"";position:absolute;inset:-48px;background:url('assets/img/read/hero-read.webp') center 42%/cover no-repeat;opacity:.15;filter:blur(9px) brightness(.5) saturate(.85);-webkit-mask-image:radial-gradient(ellipse 56% 64% at 50% 42%,transparent 40%,rgba(0,0,0,.85) 62%,rgba(0,0,0,.45) 85%,transparent 99%);mask-image:radial-gradient(ellipse 56% 64% at 50% 42%,transparent 40%,rgba(0,0,0,.85) 62%,rgba(0,0,0,.45) 85%,transparent 99%);animation:frAtmoDrift 90s ease-in-out infinite alternate}
@keyframes frAtmoDrift{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.09) translate3d(-1.2%,1%,0)}}
@media(max-width:768px){.fr-atmo::before{opacity:.07;animation:none}}
@media(prefers-reduced-motion:reduce){.fr-atmo::before{animation:none}}
/* ---------- doors strip: the carried features on the new face ---------- */
.fr-doors{padding:64px 0 8px;position:relative}
.fr-doors-h{font-family:var(--fr-display);font-size:clamp(38px,4.6vw,58px);line-height:.98;letter-spacing:-1px;text-transform:uppercase;color:var(--fr-cream);margin:12px 0 8px}
.fr-doors-h em{font-style:normal;color:var(--fr-gold)}
.fr-doorgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:13px;margin-top:22px}
.fr-door{position:relative;text-align:left;background:linear-gradient(148deg,#1d1709,#0d0b08 65%);border:1px solid var(--fr-line);border-radius:12px;color:var(--fr-cream);padding:18px 20px 20px;display:flex;flex-direction:column;gap:9px;cursor:pointer;width:100%;transition:transform .2s,border-color .2s;font:inherit}
.fr-door:hover{transform:translateY(-4px);border-color:var(--fr-gold)}
.fr-door span{font-size:9px;font-weight:850;letter-spacing:2px;color:#b4a17c}
.fr-door strong{font-family:var(--fr-display);font-size:21px;font-weight:1000;letter-spacing:-.5px;text-transform:uppercase}
.fr-door small{font-size:12px;line-height:1.5;color:#b9afa0}
.fr-door b{position:absolute;right:18px;bottom:14px;font-size:19px;color:var(--fr-gold)}
/* guest-local disclosure under the desk */
.fr-disclosure{margin:14px 2px 0;font-size:11.5px;line-height:1.55;color:#9c8b6a;letter-spacing:.02em}
.fr-disclosure b{color:#c9b586}
/* search focus flash (not a highlight — a landing marker that fades) */
.fread-verse.is-focus{outline:1px solid var(--fr-gold-deep);background:rgba(215,190,141,.24)}
/* hero-bottom scroll control (button dressed as the package's link) */
.fread-hero-bottom button{background:none;border:0;color:inherit;font:inherit;letter-spacing:inherit;cursor:pointer;padding:0}
.fread-hero-bottom button:hover{color:var(--fr-gold)}

/* ---------- READ GRAFT — ChatGPT Read package visual layer ----------
   Tokens mapped onto the shell's (--gold/--gold-hi/--gold-dim/--bone/
   --coal/--line/--mute/--serif); the package scarlet is #d03935.
   Every rule is .rd-* scoped inside this module — no shell.css change. */
.rd-pretag{font-size:11px;letter-spacing:2.8px;font-weight:900;color:var(--gold);text-transform:uppercase}.rd-pretag .rd-star,.rd-pretag .rd-red{color:#d03935}/* section heads */
.rd-sechead{display:flex;justify-content:space-between;align-items:flex-end;gap:26px;margin:6px 0 20px;flex-wrap:wrap}.rd-sech2{font-family:Impact,'Arial Narrow',var(--sans);font-size:clamp(36px,4.8vw,58px);line-height:.98;letter-spacing:-1.6px;font-weight:1000;text-transform:uppercase;margin:14px 0 10px;color:var(--bone)}.rd-sech2 em{color:var(--gold);font-style:normal}.rd-secsub{color:#b7b1a4;font-size:14px;line-height:1.65;max-width:560px}.rd-headart{font-size:10px;font-weight:900;letter-spacing:2px;color:#bdaa80;padding:11px 14px;border:1px solid #403621;border-radius:50px;white-space:nowrap}.rd-headart span{color:#d03935}package palette */
.rd-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0}.rd-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:9px 16px;font-size:12.5px;letter-spacing:.08em;cursor:pointer}.rd-btn[disabled]{opacity:.38;cursor:not-allowed}.rd-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}.rd-books button .rd-meta{flex:none}.rd-card{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:18px;margin-top:14px}.rd-card h3{font-family:var(--serif);font-size:20px;margin-bottom:6px}.rd-meta{font-size:12px;color:var(--mute);letter-spacing:.06em}.rd-body p{line-height:1.7;color:var(--bone);margin-top:12px;font-size:15.5px}.rd-quote{border-left:3px solid #d03935;padding:6px 0 6px 16px;font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.6;margin-top:14px;color:#f6d58c}.rd-note{font-size:12.5px;color:var(--mute);margin-top:14px;line-height:1.55}.rd-err{border:1px dashed #a33;border-radius:14px;padding:16px;color:#e8a0a0;margin-top:14px;line-height:1.55;font-size:14px}.rd-list{display:flex;flex-direction:column;gap:10px;margin-top:14px}.rd-item{border:1px solid #403320;border-radius:8px;background:#1a1711;padding:13px 15px;text-align:left;color:var(--bone);width:100%;cursor:pointer;display:flex;gap:13px;align-items:baseline}.rd-item:hover{border-color:#b18b36;background:#221c11}.rd-item .rd-itemnum{font-family:var(--serif);color:var(--gold);font-size:21px;min-width:34px;flex:none}.rd-item .rd-itemmain{flex:1;min-width:0}.rd-item b{font-family:var(--serif);font-size:16.5px;display:block}.rd-item span{font-size:12.5px;color:var(--mute)}.rd-status{font-size:12.5px;color:var(--gold-hi);letter-spacing:.05em;min-height:18px}/* books door */
.rd-bookcard{border:1px solid #393024;border-radius:12px;background:#0d0d0b;padding:20px;margin-top:14px}.rd-bookcard h3{font-family:var(--serif);font-size:21px;margin-bottom:6px}.rd-bookmeta{font-size:9.5px;color:var(--gold);letter-spacing:1.8px;font-weight:900;text-transform:uppercase}/* today's word */
.rd-today{display:grid;grid-template-columns:1.24fr .76fr;gap:48px;align-items:center;margin-top:8px}.rd-today-label{font-size:10px;color:#b49c6a;letter-spacing:2px;font-weight:900;margin:30px 0 12px}.rd-today h2{font-size:clamp(34px,5vw,54px);margin-top:6px}.rd-today-ref{color:var(--gold);font-weight:950;letter-spacing:2.2px;font-size:11.5px;margin-top:10px;text-transform:uppercase}.rd-today-art{position:relative;display:grid;place-items:center;min-height:300px}.rd-disc{width:300px;height:300px;border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,#24201a 0px,#090909 2px,#181715 4px,#080808 6px);box-shadow:0 30px 40px rgba(0,0,0,.38),0 0 0 1px #4b3d29;display:grid;place-items:center;transform:rotate(-15deg);animation:rd-spin 50s linear infinite}.rd-disc-center{width:132px;height:132px;border-radius:50%;background:radial-gradient(circle,#f8d36a,#8b611c);color:#171109;display:flex;flex-direction:column;align-items:center;justify-content:center;border:7px solid #111;text-align:center}.rd-disc-center span{font-family:var(--serif);font-weight:900;font-size:35px;letter-spacing:-2px;line-height:1}.rd-disc-center b{font-weight:950;font-size:11.5px;letter-spacing:2px;margin-top:3px}.rd-disc-center small{font-size:7.5px;letter-spacing:1px;margin-top:5px}.rd-sticker{position:absolute;right:2px;bottom:26px;transform:rotate(10deg);background:#d03935;color:#fff;padding:13px 14px;font-size:16px;font-weight:950;line-height:1.1;letter-spacing:1px}@keyframes rd-spin{to{transform:rotate(345deg)}}@media (prefers-reduced-motion:reduce){.rd-disc{animation:none}}@media (max-width:760px){.rd-today{grid-template-columns:1fr;gap:22px}.rd-disc{width:230px;height:230px}.rd-disc-center{width:104px;height:104px}.rd-disc-center span{font-size:28px}}
</style>`;


/* ---------------- face: THE LIVING WORD (package markup, adapted) -------- */
function shellHTML(inner) { return STYLE + `<p class="kicker">Read</p>` + inner; }

function mount(root, html) {
  // #48 guard: exactly one mount per navigation — replace, never append.
  S.mountSeq += 1;
  root.innerHTML = html;
  return S.mountSeq;
}

function faceHTML() {
  return `
  <div class="fr-atmo" aria-hidden="true"></div>
  ${window.FaithFilm ? window.FaithFilm.slotHtml({ src: 'assets/video/read-loop.mp4', poster: 'assets/img/home/word-slide.webp', title: 'The Word, alive.', note: 'Read · a living loop' }) : ''}
  <div id="faith-read-app">
  <section class="fread-hero" aria-labelledby="fread-hero-title"><div class="fread-hero-grit" aria-hidden="true"></div><div class="fread-container fread-hero-grid">
  <div class="fread-hero-copy"><div class="fread-smalltag"><span class="fread-red-dot"></span> THE 16:3 FAITH READING ROOM <span class="fread-line"></span> VOL. 001</div>
  <p class="fread-hero-kicker">THE STREETS ARE LOUD. <em>THE WORD IS LOUDER.</em></p>
  <h1 id="fread-hero-title">OPEN<br>THE <span>WORD.</span></h1>
  <p class="fread-hero-lead">Not a list of links. Not just a verse on a screen. Open the pages, find your place, and spend some real time with God.</p>
  <div class="fread-hero-actions"><button class="fread-goldbtn" type="button" id="fread-open-hero">OPEN THE BIBLE <span>↗</span></button><button class="fread-textbtn" type="button" id="fread-quick-john">START WITH JOHN 3 <span>↗</span></button></div>
  <div class="fread-stats"><div><strong>66</strong><span>BOOKS</span></div><div><strong>1,189</strong><span>CHAPTERS</span></div><div><strong>KJV</strong><span>TRANSLATION</span></div></div>
  </div>
  <div class="fread-hero-art" aria-label="Three-dimensional black leather Holy Bible with gold-edged pages"><div class="fread-urban-tag" aria-hidden="true">✝ <span>THE WORD<br>STILL SPEAKS</span></div>
  <div class="fread-book-scene"><div class="fread-book-glow"></div><div class="fread-book-shadow"></div><div class="fread-book-3d"><div class="fread-book-cover"><div class="fread-gold-border"><div class="fread-cover-overline">THE HOLY SCRIPTURES</div><div class="fread-book-symbol">✝</div><div class="fread-book-title">HOLY<br><span>BIBLE</span></div><div class="fread-book-subtitle">KING JAMES VERSION</div><div class="fread-cover-163">16:3 FAITH / THE READING ROOM</div></div></div><div class="fread-book-spine">HOLY BIBLE <b>✝</b> KJV</div><div class="fread-book-pageedge"></div></div></div>
  <div class="fread-art-callout"><span>01 / 66</span><b>AN ANCIENT WORD.<br>A NEW KIND OF READING.</b></div></div></div>
  <div class="fread-hero-bottom"><span>✦ BUILT FOR THE SEEKER, THE TIRED, AND THE STILL BELIEVING.</span><button type="button" id="fread-scroll-read">SCROLL TO READ ↓</button></div></section>
  <section class="fread-marquee" aria-label="Faith message"><div>GENESIS ✦ PSALMS ✦ PROVERBS ✦ MATTHEW ✦ MARK ✦ LUKE ✦ JOHN ✦ REVELATION ✦ <span>THE WORD STILL SPEAKS</span> ✦</div></section>
  <section class="fread-reading-section" id="fread-reader" aria-label="Interactive Bible reading desk">
  <div class="fread-container">
  <div class="fread-section-head"><div><div class="fread-eyebrow">01 / THE READING DESK</div><h2>TURN THE <em>PAGE.</em></h2><p>Every book. Every chapter. A reading experience that feels like opening something sacred.</p></div><div class="fread-version" title="Translation supplied by the verified 16:3 Faith Bible service"><b>✦ KING JAMES VERSION</b><span id="fread-data-state">KJV · CONNECTING…</span></div></div>
  <div class="fread-desk-toolbar"><div class="fread-desk-search"><label for="fread-search" class="fread-sr">Search Bible book, passage, or phrase</label><span class="fread-search-icon">⌕</span><input id="fread-search" autocomplete="off" placeholder="Find a verse, chapter, or word…  e.g. John 3:16"><button type="button" id="fread-search-btn">SEARCH ↗</button></div><button type="button" class="fread-rail-btn" id="fread-toggle-books" aria-controls="fread-library" aria-expanded="false">☷ &nbsp; BROWSE 66 BOOKS</button></div>
  <div class="fread-search-results" id="fread-search-results" hidden role="status" aria-live="polite"></div>
  <div class="fread-reader-grid">
  <aside class="fread-library" id="fread-library" aria-label="Bible book browser"><div class="fread-library-title"><span>THE LIBRARY</span><b>66 BOOKS</b></div><input id="fread-book-filter" placeholder="Find a book…" aria-label="Find a Bible book" type="search"><div class="fread-library-tabs" role="group" aria-label="Testament filter"><button type="button" class="is-active" data-testament="all">ALL</button><button type="button" data-testament="old">OLD</button><button type="button" data-testament="new">NEW</button></div><div id="fread-book-list" class="fread-book-list" role="list"></div><div class="fread-library-caption">PICK A BOOK → SELECT A CHAPTER → TURN THE PAGE</div></aside>
  <div class="fread-bible-column"><div class="fread-chapter-rail"><div class="fread-current-label"><span>NOW READING</span><strong id="fread-current-ref">PSALMS 23</strong></div><div class="fread-chapter-controls"><button type="button" id="fread-prev" aria-label="Previous chapter">←</button><label for="fread-chapter-select" class="fread-sr">Chapter</label><select id="fread-chapter-select" aria-label="Select chapter"></select><button type="button" id="fread-next" aria-label="Next chapter">→</button></div></div>
  <div class="fread-open-book" id="fread-open-book" aria-label="Open Bible pages"><div class="fread-book-gutter" aria-hidden="true"></div><article class="fread-paper fread-paper-left"><div class="fread-paper-top"><span id="fread-left-testament">OLD TESTAMENT</span><span>16:3 FAITH</span></div><div class="fread-paper-inner"><div class="fread-chapter-ornament">✦</div><p class="fread-book-label">THE BOOK OF</p><h3 id="fread-book-name">PSALMS</h3><div class="fread-rule">✝</div><p class="fread-book-chapter">CHAPTER <span id="fread-chapter-roman">XXIII</span></p><div id="fread-left-verses" class="fread-verses" aria-label="First Bible page"></div></div><div class="fread-page-num"><span>KING JAMES VERSION</span><span id="fread-left-number">001</span></div></article><article class="fread-paper fread-paper-right"><div class="fread-paper-top"><span id="fread-right-title">PSALMS · 23</span><span>THE LIVING WORD</span></div><div class="fread-paper-inner fread-paper-right-inner"><div id="fread-right-verses" class="fread-verses" aria-label="Second Bible page"></div></div><div class="fread-page-num"><span id="fread-right-number">002</span><span>16:3 FAITH / READ</span></div></article><div class="fread-flip-sheet" aria-hidden="true"></div></div>
  <div id="fread-reader-alert" class="fread-reader-alert" role="status" aria-live="polite"></div>
  <div class="fread-reader-actions"><div class="fread-reader-action-left"><button id="fread-speech" type="button">◉ &nbsp; READ ALOUD — DEVICE VOICE</button><button id="fread-save-chapter" type="button">☆ &nbsp; SAVE THIS CHAPTER</button></div><div class="fread-reader-action-right"><button id="fread-font-down" type="button" aria-label="Decrease text size">A−</button><button id="fread-font-up" type="button" aria-label="Increase text size">A+</button><button id="fread-paper-mode" type="button" aria-label="Toggle warm paper mode">◐</button><button id="fread-focus" type="button" aria-pressed="false">⛶ FOCUS</button><button id="fread-copy" type="button">COPY ↗</button></div></div>
  <p class="fr-disclosure"><b>On this device:</b> your highlights, margin notes and saved chapters live in this browser only — they are not stored in an account. Your reading place is kept the same way.</p>
  <div class="fread-mobile-hint">TAP A VERSE TO HIGHLIGHT IT. YOUR PLACE SAVES ON THIS DEVICE.</div>
  </div>
  <aside class="fread-side-desk" aria-label="Reading tools"><div class="fread-aside-card"><div class="fread-aside-eyebrow">✦ STAY GROUNDED</div><h3>ONE PAGE<br>AT A TIME.</h3><p>We don't need to race through the Word. Let it meet you right where you are.</p><div class="fread-aside-cross">†</div></div>
  <div class="fread-aside-card fread-aside-note"><div class="fread-aside-eyebrow">YOUR NOTES</div><h3>IN THE<br>MARGINS.</h3><label for="fread-notes">What stood out to you?</label><textarea id="fread-notes" rows="5" placeholder="Write what's on your heart…"></textarea><button id="fread-save-note" type="button">SAVE NOTE →</button><p>Private on this device — notes live in this browser only, not in an account.</p></div><div class="fread-featured-jump"><span>GO DEEPER</span><button type="button" data-jump="Psalms|23">PSALM 23 ↗</button><button type="button" data-jump="John|3">JOHN 3 ↗</button><button type="button" data-jump="Proverbs|3">PROVERBS 3 ↗</button></div></aside>
  </div>
  </div></section>
  <section class="fr-doors" aria-label="More from the reading desk"><div class="fread-container">
  <div class="fread-eyebrow">02 / KEEP READING</div><h2 class="fr-doors-h">MORE FROM <em>THE DESK.</em></h2>
  <div class="fr-doorgrid">
  <button type="button" class="fr-door" data-door="books"><span>02 / THE LIBRARY</span><strong>THE BOOKS.</strong><small>God Over Everything — the one book, both volumes, and a free 5-day sample</small><b>↗</b></button>
  <button type="button" class="fr-door" data-door="devotionals"><span>03 / DAILY FUEL</span><strong>DEVOTIONALS.</strong><small>The daily archive — every entry with reflection &amp; prayer</small><b>↗</b></button>
  <button type="button" class="fr-door" data-door="word"><span>04 / RIGHT NOW</span><strong>TODAY'S WORD.</strong><small>One verse, one thought, one way to carry it forward</small><b>↗</b></button>
  <button type="button" class="fr-door" data-door="people"><span>05 / THE HALL OF FAITH</span><strong>THE PEOPLE.</strong><small>Every famous Bible person — their story, their own words, their verses, their film. Under the Tree of Life</small><b>↗</b></button>
  </div>
  <div data-rd-ai></div><div data-role="continue-slot"></div>
  </div></section>
  <section class="fread-closer"><div class="fread-container fread-closer-grid"><div><div class="fread-eyebrow">03 / TAKE IT WITH YOU</div><h2>YOUR FAITH.<br><span>YOUR PACE.</span></h2><p>Read one verse on a hard day. Stay for a whole chapter on a good one. The invitation is the same.</p><div class="fread-closer-actions"><button id="fread-continue" type="button" class="fread-goldbtn">CONTINUE READING ↗</button><a href="#/pastor" class="fread-simple-link">FROM THE PASTOR ↗</a></div></div><div class="fread-closer-cards"><div><span>01</span><b>FIND THE BOOK.</b><p>All 66 books at your fingertips. No scrolling through endless tiny tiles.</p></div><div><span>02</span><b>TURN THE PAGE.</b><p>Read chapter to chapter in a real-book inspired, comfortable reading space.</p></div><div><span>03</span><b>KEEP YOUR PLACE.</b><p>Save chapters and highlights — they keep on this device, right where you left them.</p></div></div></div></section>
  <section class="fread-verse-banner"><div class="fread-container"><span>THE WORD FOR EVERY SEASON</span><blockquote>“The Lord is my shepherd; I shall not want.”</blockquote><p>PSALM 23:1 <b>✦</b> KING JAMES VERSION</p></div></section>
  <div class="fread-toast" id="fread-toast" hidden role="status" aria-live="polite"></div>
  </div>`;
}


/* ---------------- the reading desk ---------------------------------------- */
let toastTimer = null;
function toast(root, msg) {
  const el = root.querySelector('#fread-toast');
  if (!el) return;
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}
function setDeskStatus(root, msg, warn = false) {
  const el = root.querySelector('#fread-reader-alert');
  if (!el) return;
  el.textContent = msg; el.classList.toggle('is-warning', warn);
}
function deskBooks() { return (S.books || []).map((b) => ({ name: b.name, nr: b.nr, chapters: b.chapters, testament: b.testament === 'OT' ? 'old' : 'new' })); }
function deskBook() { const bs = deskBooks(); return bs.find((b) => b.name === S.desk.book) || bs[18] || null; }
function deskKey() { return S.desk.book + '|' + S.desk.chapter; }
function roman(n) { const parts = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, c] of parts) { while (n >= v) { s += c; n -= v; } } return s; }

function renderBookList(root) {
  const list = root.querySelector('#fread-book-list');
  if (!list) return;
  list.innerHTML = '';
  const bs = deskBooks();
  if (!bs.length) { const p = document.createElement('p'); p.style.color = '#b3a48a'; p.textContent = 'The book list could not be loaded.'; list.append(p); return; }
  const q = S.desk.bookSearch.trim().toLowerCase();
  const filtered = bs.filter((b) => (S.desk.filter === 'all' || S.desk.filter === b.testament) && b.name.toLowerCase().includes(q));
  if (!filtered.length) { const p = document.createElement('p'); p.style.color = '#b3a48a'; p.textContent = 'No books match this search.'; list.append(p); return; }
  filtered.forEach((b) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fread-book-item' + (b.name === S.desk.book ? ' is-active' : '');
    btn.setAttribute('role', 'listitem');
    const name = document.createElement('span'); name.textContent = b.name;
    const count = document.createElement('small'); count.textContent = b.chapters + ' ch';
    btn.append(name, count);
    btn.addEventListener('click', () => selectDeskChapter(root, b.name, 1, { scroll: true }));
    list.append(btn);
  });
}
function renderChapterSelect(root) {
  const sel = root.querySelector('#fread-chapter-select');
  const meta = deskBook();
  if (!sel || !meta) return;
  sel.innerHTML = '';
  for (let i = 1; i <= meta.chapters; i++) { const opt = document.createElement('option'); opt.value = String(i); opt.textContent = 'CH. ' + i; sel.append(opt); }
  sel.value = String(S.desk.chapter);
}
function addVerses(root, target, arr) {
  target.innerHTML = '';
  arr.forEach(([num, text]) => {
    const el = document.createElement('p');
    el.className = 'fread-verse';
    el.dataset.num = String(num);
    const id = deskKey() + ':' + num;
    if (S.desk.highlights.includes(id)) el.classList.add('is-highlighted');
    el.tabIndex = 0; el.setAttribute('role', 'button');
    el.setAttribute('aria-pressed', String(S.desk.highlights.includes(id)));
    el.setAttribute('aria-label', `${S.desk.book} chapter ${S.desk.chapter}, verse ${num}. Tap to highlight.`);
    const sup = document.createElement('sup'); sup.className = 'fread-verse-num'; sup.textContent = String(num);
    const content = document.createElement('span'); content.textContent = text;
    el.append(sup, content);
    el.addEventListener('click', () => toggleHighlight(root, num));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleHighlight(root, num); } });
    target.append(el);
  });
}
function fillerPage(target, icon, head, body) {
  target.innerHTML = '';
  const box = document.createElement('div'); box.className = 'fread-page-empty';
  const logo = document.createElement('div'); logo.className = 'fread-empty-icon'; logo.textContent = icon;
  const h = document.createElement('strong'); h.textContent = head;
  const p = document.createElement('p'); p.textContent = body;
  box.append(logo, h, p); target.append(box);
}
function renderSpread(root) {
  const d = S.desk;
  const L = root.querySelector('#fread-left-verses'), R = root.querySelector('#fread-right-verses');
  if (!L || !R) return;
  const verses = d.verses;
  if (verses.length) {
    const half = Math.ceil(verses.length / 2);
    addVerses(root, L, verses.slice(0, half));
    if (verses.length > 1) addVerses(root, R, verses.slice(half));
    else fillerPage(R, '✦', 'LET IT SINK IN.', 'One verse can stay with you all day. Use the next arrow to keep moving through the Word.');
  } else if (d.loadError) {
    fillerPage(L, '✝', 'Bible service unavailable', 'The live chapter could not be loaded. Please try again.');
    fillerPage(R, '✝', 'Nothing was substituted.', 'This reader only ever shows the verified King James text — never a fill-in, never another translation standing in its place.');
  } else {
    fillerPage(L, '✦', 'Opening the book…', 'Loading the chapter from the Bible service.');
    R.innerHTML = '';
  }
  const meta = deskBook();
  root.querySelector('#fread-book-name').textContent = d.book.toUpperCase();
  root.querySelector('#fread-chapter-roman').textContent = roman(d.chapter);
  root.querySelector('#fread-current-ref').textContent = d.book.toUpperCase() + ' ' + d.chapter;
  root.querySelector('#fread-left-testament').textContent = meta && meta.testament === 'new' ? 'NEW TESTAMENT' : 'OLD TESTAMENT';
  root.querySelector('#fread-right-title').textContent = d.book.toUpperCase() + ' · ' + d.chapter;
  const ordinal = meta ? meta.nr : 0;
  root.querySelector('#fread-left-number').textContent = String(ordinal).padStart(2, '0') + ' · ' + String(d.chapter).padStart(2, '0');
  root.querySelector('#fread-right-number').textContent = String(ordinal).padStart(2, '0') + ' · ' + String(d.chapter).padStart(2, '0');
  root.querySelector('#fread-save-chapter').innerHTML = S.desk.saved.includes(deskKey()) ? '★ &nbsp; SAVED CHAPTER' : '☆ &nbsp; SAVE THIS CHAPTER';
  const notes = root.querySelector('#fread-notes');
  if (notes && document.activeElement !== notes) notes.value = d.notes[deskKey()] || '';
  const book = root.querySelector('#fread-open-book');
  if (book) { book.style.setProperty('--fread-text-size', d.font + 'px'); book.classList.toggle('is-cool', !d.warm); }
  renderBookList(root); renderChapterSelect(root);
}
function applyFocusVerse(root) {
  const d = S.desk;
  if (!d.focusVerse) return;
  const n = d.focusVerse; d.focusVerse = null;
  const el = [...root.querySelectorAll('.fread-verse')].find((v) => v.dataset.num === String(n));
  if (el) {
    el.classList.add('is-focus');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => el.classList.remove('is-focus'), 2600);
  } else toast(root, `Verse ${n} isn't in ${d.book} ${d.chapter}.`);
}
async function loadDesk(root) {
  const d = S.desk;
  const seq = ++d.loadSeq;
  const book = d.book, chapter = d.chapter;
  setDeskStatus(root, `Loading ${book} ${chapter}…`);
  try {
    const res = await window.FaithReadBibleProvider.getChapter({ book, chapter, translation: 'KJV' });
    if (seq !== d.loadSeq || !root.querySelector('#fread-open-book')) return;
    const verses = (Array.isArray(res.verses) ? res.verses : []).map((v) => [v.number, String(v.text || '')]).filter(([n, t]) => Number.isInteger(n) && n > 0 && t.trim()).sort((a, b) => a[0] - b[0]);
    if (!verses.length) throw new Error('The chapter is unavailable');
    d.verses = verses; d.loadError = false;
    const meta = deskBook();
    if (meta) savePosition(meta.nr, book, chapter, null);
    renderSpread(root);
    setDeskStatus(root, `King James Version · ${book} ${chapter} · ${res.source === 'live production API' ? 'live from the 16:3 Faith Bible service' : 'offline capture — the live service did not answer'}.`);
    applyFocusVerse(root);
  } catch (e) {
    if (seq !== d.loadSeq || !root.querySelector('#fread-open-book')) return;
    d.verses = []; d.loadError = true;
    renderSpread(root);
    setDeskStatus(root, `Could not load ${book} ${chapter} from the live Bible service. ${e.message || 'Try again later.'}`, true);
  }
}
function flipBook(root) {
  const el = root.querySelector('#fread-open-book');
  if (!el) return;
  el.classList.remove('is-flipping'); void el.offsetWidth; el.classList.add('is-flipping');
  setTimeout(() => el.classList.remove('is-flipping'), 520);
}
function selectDeskChapter(root, book, chapter, options = {}) {
  const meta = deskBooks().find((b) => b.name === book);
  if (!meta || chapter < 1 || chapter > meta.chapters) return;
  stopSpeech(); syncSpeechBtn(root);
  S.desk.book = book; S.desk.chapter = chapter; S.desk.loadError = false;
  if (options.animate !== false) flipBook(root);
  loadDesk(root);
  if (options.scroll) { const r = root.querySelector('#fread-reader'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function moveDeskChapter(root, step) {
  if (!root.querySelector('#fread-open-book')) return;
  const bs = deskBooks();
  const idx = bs.findIndex((b) => b.name === S.desk.book);
  if (idx < 0) return;
  const meta = bs[idx];
  let ch = S.desk.chapter + step;
  if (ch > meta.chapters) { if (idx + 1 >= bs.length) return toast(root, 'You have reached Revelation 22.'); return selectDeskChapter(root, bs[idx + 1].name, 1); }
  if (ch < 1) { if (idx - 1 < 0) return toast(root, 'You are at Genesis 1.'); return selectDeskChapter(root, bs[idx - 1].name, bs[idx - 1].chapters); }
  return selectDeskChapter(root, meta.name, ch);
}
function toggleHighlight(root, n) {
  const id = deskKey() + ':' + n;
  const on = !S.desk.highlights.includes(id);
  S.desk.highlights = on ? [...S.desk.highlights, id] : S.desk.highlights.filter((x) => x !== id);
  storeReaderPrefs();
  renderSpread(root);
  toast(root, on ? 'Verse highlighted on this device.' : 'Highlight removed.');
}
async function deskSearch(root) {
  const input = root.querySelector('#fread-search');
  const panel = root.querySelector('#fread-search-results');
  const q = input.value.trim();
  panel.innerHTML = '';
  if (!q) { panel.hidden = true; return; }
  await loadBooks();
  const ref = parseReference(q, S.books || []);
  if (ref && ref.chapter >= 1 && ref.chapter <= ref.book.chapters) {
    panel.hidden = true;
    S.desk.focusVerse = ref.verse;
    selectDeskChapter(root, ref.book.name, ref.chapter, { scroll: true });
    return;
  }
  const nameHit = deskBooks().find((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  if (nameHit && q.length >= 3) { panel.hidden = true; selectDeskChapter(root, nameHit.name, 1, { scroll: true }); return; }
  panel.hidden = false;
  const searching = document.createElement('p'); searching.textContent = 'Searching the King James text…'; panel.append(searching);
  try {
    const res = await window.FaithReadBibleProvider.search({ query: q, translation: 'KJV' });
    const results = Array.isArray(res.results) ? res.results : [];
    panel.innerHTML = '';
    if (!results.length) { const p = document.createElement('p'); p.textContent = 'No verified results for this search. Try a reference like “John 3:16” or a shorter phrase.'; panel.append(p); return; }
    for (const f of results.slice(0, 18)) {
      const btn = document.createElement('button');
      btn.className = 'fread-result'; btn.type = 'button';
      const title = document.createElement('b'); title.textContent = `${f.book} ${f.chapter}:${f.verse}`;
      const snippet = document.createElement('span'); snippet.textContent = f.text;
      btn.append(title, snippet);
      btn.addEventListener('click', () => { panel.hidden = true; S.desk.focusVerse = f.verse; selectDeskChapter(root, f.book, f.chapter, { scroll: true }); });
      panel.append(btn);
    }
    if (results.length > 18) { const p = document.createElement('p'); p.textContent = 'Showing first 18 results.'; panel.append(p); }
  } catch (e) {
    panel.innerHTML = '';
    const p = document.createElement('p'); p.textContent = 'Bible search is temporarily unavailable: ' + (e.message || 'please retry.');
    panel.append(p);
  }
}
function syncSpeechBtn(root) {
  const b = root.querySelector('#fread-speech');
  if (b) b.innerHTML = S.speechOn ? '■ &nbsp; STOP AUDIO' : '◉ &nbsp; READ ALOUD — DEVICE VOICE';
}
function toggleSpeech(root) {
  const d = S.desk;
  if (!d.verses.length) { toast(root, 'Load a passage before using Read Aloud.'); return; }
  if (!('speechSynthesis' in window)) { toast(root, 'Read Aloud is not supported in this browser.'); return; }
  if (S.speechOn) { stopSpeech(); syncSpeechBtn(root); return; }
  const u = new SpeechSynthesisUtterance(`${d.book} chapter ${d.chapter}. ` + d.verses.map(([n, t]) => `Verse ${n}. ${t}`).join(' '));
  u.rate = 0.86; u.pitch = 0.95;
  u.onend = u.onerror = () => { S.speechOn = false; S.utter = null; syncSpeechBtn(root); };
  S.utter = u; S.speechOn = true;
  window.speechSynthesis.speak(u);
  syncSpeechBtn(root);
}
function chapterText() { const d = S.desk; return `King James Version | ${d.book} ${d.chapter}\n` + d.verses.map(([n, t]) => `${n}. ${t}`).join('\n'); }
async function copyChapter(root) {
  if (!S.desk.verses.length) { toast(root, 'No text loaded to copy.'); return; }
  let done = false;
  try { await navigator.clipboard.writeText(chapterText()); done = true; } catch { /* fall through */ }
  if (!done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = chapterText(); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(ta); ta.select();
      done = !!document.execCommand('copy');
      ta.remove();
    } catch { /* copy unavailable */ }
  }
  toast(root, done ? 'Verses copied.' : 'Copy unavailable in this browser.');
}
function wireDesk(root) {
  const $ = (s) => root.querySelector(s);
  root.querySelectorAll('[data-testament]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.testament === S.desk.filter);
    btn.addEventListener('click', () => { S.desk.filter = btn.dataset.testament; root.querySelectorAll('[data-testament]').forEach((b) => b.classList.toggle('is-active', b === btn)); renderBookList(root); });
  });
  const filter = $('#fread-book-filter');
  if (filter) { filter.value = S.desk.bookSearch; filter.addEventListener('input', (e) => { S.desk.bookSearch = e.target.value; renderBookList(root); }); }
  const sel = $('#fread-chapter-select');
  if (sel) sel.addEventListener('change', (e) => selectDeskChapter(root, S.desk.book, +e.target.value, { scroll: false }));
  const prev = $('#fread-prev'), next = $('#fread-next');
  if (prev) prev.addEventListener('click', () => moveDeskChapter(root, -1));
  if (next) next.addEventListener('click', () => moveDeskChapter(root, 1));
  const sb = $('#fread-search-btn'), si = $('#fread-search');
  if (sb) sb.addEventListener('click', () => deskSearch(root));
  if (si) si.addEventListener('keydown', (e) => { if (e.key === 'Enter') deskSearch(root); });
  const tb = $('#fread-toggle-books');
  if (tb) tb.addEventListener('click', () => { const panel = $('#fread-library'); const open = panel.classList.toggle('is-visible'); tb.setAttribute('aria-expanded', String(open)); tb.innerHTML = open ? '✕ &nbsp; CLOSE LIBRARY' : '☷ &nbsp; BROWSE 66 BOOKS'; });
  const fd = $('#fread-font-down'), fu = $('#fread-font-up');
  if (fd) fd.addEventListener('click', () => { S.desk.font = Math.max(12, S.desk.font - 1); storeReaderPrefs(); renderSpread(root); toast(root, 'Smaller text.'); });
  if (fu) fu.addEventListener('click', () => { S.desk.font = Math.min(23, S.desk.font + 1); storeReaderPrefs(); renderSpread(root); toast(root, 'Larger text.'); });
  const pm = $('#fread-paper-mode');
  if (pm) pm.addEventListener('click', () => { S.desk.warm = !S.desk.warm; storeReaderPrefs(); renderSpread(root); toast(root, S.desk.warm ? 'Warm paper mode.' : 'Cool paper mode.'); });
  const fc = $('#fread-focus');
  if (fc) fc.addEventListener('click', () => { const book = $('#fread-open-book'); const on = book.classList.toggle('is-expanded'); fc.setAttribute('aria-pressed', String(on)); fc.innerHTML = on ? '◫ BOOK VIEW' : '⛶ FOCUS'; toast(root, on ? 'Focus mode: larger reading pages.' : 'Two-page Bible view.'); });
  const sp = $('#fread-speech');
  if (sp) sp.addEventListener('click', () => toggleSpeech(root));
  const sv = $('#fread-save-chapter');
  if (sv) sv.addEventListener('click', () => {
    const k = deskKey();
    const on = !S.desk.saved.includes(k);
    S.desk.saved = on ? [...S.desk.saved, k] : S.desk.saved.filter((x) => x !== k);
    storeReaderPrefs(); renderSpread(root);
    toast(root, on ? 'Chapter saved on this device.' : 'Chapter removed from saved list.');
  });
  const cp = $('#fread-copy');
  if (cp) cp.addEventListener('click', () => copyChapter(root));
  const sn = $('#fread-save-note');
  if (sn) sn.addEventListener('click', () => { S.desk.notes[deskKey()] = $('#fread-notes').value.slice(0, 5000); storeReaderPrefs(); toast(root, 'Your note is saved on this device.'); });
  root.querySelectorAll('[data-jump]').forEach((el) => el.addEventListener('click', () => { const [b, ch] = el.dataset.jump.split('|'); selectDeskChapter(root, b, +ch, { scroll: true }); }));
  const qj = $('#fread-quick-john');
  if (qj) qj.addEventListener('click', () => selectDeskChapter(root, 'John', 3, { scroll: true }));
  const bookEl = $('#fread-open-book');
  if (bookEl) {
    let swipeStart = null;
    bookEl.addEventListener('touchstart', (e) => { if (e.touches.length === 1) swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
    bookEl.addEventListener('touchend', (e) => {
      if (!swipeStart || !e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x, dy = e.changedTouches[0].clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(dx) > 95 && Math.abs(dx) > Math.abs(dy) * 1.5) moveDeskChapter(root, dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  if (!root.__frKeyWired) {
    root.__frKeyWired = true;
    root.addEventListener('keydown', (e) => {
      if (S && S.view === 'face' && e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); moveDeskChapter(root, e.key === 'ArrowRight' ? 1 : -1); }
    });
  }
}
async function initDesk(root) {
  wireDesk(root);
  try { await loadBooks(); } catch { /* both routes down — loadDesk surfaces the truthful error */ }
  const label = root.querySelector('#fread-data-state');
  if (label) label.textContent = S.booksSource === 'live production API' ? 'KJV · LIVE BIBLE SERVICE' : 'KJV · OFFLINE CAPTURE';
  renderBookList(root); renderChapterSelect(root);
  loadDesk(root);
}

/* ---------------- face wiring ---------------------------------------------- */
function showFace(root, jump) {
  stopSpeech();
  S.view = 'face';
  mount(root, shellHTML(faceHTML()));
  const scrollToDesk = () => { const r = root.querySelector('#fread-reader'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const oh = root.querySelector('#fread-open-hero');
  if (oh) oh.addEventListener('click', scrollToDesk);
  const sr = root.querySelector('#fread-scroll-read');
  if (sr) sr.addEventListener('click', scrollToDesk);
  const cont = root.querySelector('#fread-continue');
  if (cont) cont.addEventListener('click', () => selectDeskChapter(root, S.desk.book, S.desk.chapter, { animate: false, scroll: true }));
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.door;
    if (d === 'books') showBooks(root);
    else if (d === 'devotionals') showDevotionals(root);
    else if (d === 'word') showWord(root);
    else if (d === 'people') location.hash = '#/people';
  }));
  const slot = root.querySelector('[data-role="continue-slot"]');
  if (slot) {
    try {
      const pos = JSON.parse(localStorage.getItem(LS_POS) || 'null');
      if (pos && pos.bookName) {
        slot.innerHTML = `<div class="rd-card" data-testid="continue-reading"><span class="rd-meta">CONTINUE READING</span><h3>${esc(pos.bookName)} ${pos.chapter}${pos.verse ? ':' + pos.verse : ''}</h3><p class="rd-note">Pick up right where you left off.</p><div class="rd-bar"><button class="rd-btn goldb" data-act="continue">Continue reading</button></div></div>`;
        slot.querySelector('[data-act="continue"]').addEventListener('click', () => { S.desk.focusVerse = pos.verse || null; selectDeskChapter(root, pos.bookName, pos.chapter, { scroll: true }); });
      }
    } catch { /* no saved position */ }
  }
  initDesk(root);
  if (window.FaithFilm) window.FaithFilm.wire(root);
  fillRdAi(root);
  if (jump && jump.book) { S.desk.focusVerse = jump.verse || null; selectDeskChapter(root, jump.book, jump.chapter, { scroll: true }); }
}


/* ---- Books door (#52: exactly one book — a title page, not a catalog).
   Ported unchanged in data and behavior from the v1 hub; only the back
   button's target changed (the doors face is now the Living Word face). */
async function showBooks(root) {
  stopSpeech();
  S.view = 'books';
  mount(root, shellHTML(`<p class="rd-note">Loading the book…</p>`));
  const dev = await loadDevotionals();
  const days = [
    { day: 1, slug: 'god-over-everything', title: 'God Over Everything', reference: 'Proverbs 16:3' },
    { day: 2, slug: null, title: 'The Quiet Work', reference: 'Matthew 6:6' },
    { day: 3, slug: null, title: 'Heavy Armor', reference: 'Ephesians 6:11' },
    { day: 4, slug: null, title: 'Rebuilding the Foundation', reference: 'Luke 7:48' },
    { day: 5, slug: null, title: 'Silence the Noise', reference: 'Psalm 46:10' },
  ];
  const day1 = dev.find((e) => e.id === 'god-over-everything');
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← Back to the desk</button></div>
    <div class="rd-sechead"><div><p class="rd-pretag">02 / OFF THE SHELF</p><h2 class="rd-sech2">BOOKS WITH<br><em>SCARS &amp; SOUL.</em></h2><p class="rd-secsub">Not everybody finds God in a perfect paragraph. Sometimes the crumpled pages have the realest stories.</p></div><div class="rd-headart">THE SHELF <span>✦</span> ONE REAL BOOK</div></div>
    <p class="rd-meta">16:3 FAITH PRESENTS · THE ONE BOOK</p>
    <h2 style="margin-top:8px">God Over <span class="g">Everything</span></h2>
    <p class="lede">A 365-Day Devotional by Pastor Jeremy “Chico” Mills — one verse, one honest reflection, one prayer, every day for a year. Both paperback volumes now on Amazon. Read the first 5 days free.</p>
    <div class="rd-bookcard"><p class="rd-bookmeta">VOLUME ONE · JANUARY – JUNE</p><h3>Volume One</h3><p class="rd-meta">Days 1–181 · Paperback · 6×9 · 559 pages · $19.99</p>
      <div class="rd-body"><p>The first half of the year. From the cold start of January to the long light of June — a daily return to putting God first, one verse at a time.</p></div>
      <div class="rd-bar"><a class="rd-btn goldb" href="https://www.amazon.com/dp/B0H41J8C8G?tag=kairobot143-20" target="_blank" rel="noopener noreferrer">Buy Volume One — $19.99</a></div></div>
    <div class="rd-bookcard"><p class="rd-bookmeta">VOLUME TWO · JULY – DECEMBER</p><h3>Volume Two</h3><p class="rd-meta">Days 182–365 · Paperback · 6×9 · 568 pages · $19.99</p>
      <div class="rd-body"><p>The back half of the year, all the way to the last day. The same honest rhythm — verse, reflection, prayer, and one line to carry with you.</p></div>
      <div class="rd-bar"><a class="rd-btn goldb" href="https://www.amazon.com/dp/B0H3NV2JLH?tag=kairobot143-20" target="_blank" rel="noopener noreferrer">Buy Volume Two — $19.99</a></div></div>
    <div class="rd-card"><span class="rd-meta">EVERY DAY HOLDS</span>
      <div class="rd-body"><p><b>The Verse</b> — one verse of Scripture to anchor the day.</p><p><b>The Reflection</b> — an honest reflection from the rebuild. No fluff, no performance.</p><p><b>The Prayer</b> — a prayer to pray out loud.</p><p><b>The Line to Carry</b> — one line to take with you into the day.</p></div></div>
    <div class="rd-card" data-testid="book-sample"><span class="rd-meta">FREE 5-DAY SAMPLE</span><h3>Read the first five days free</h3>
      <div class="rd-list">${days.map((d) => `<button class="rd-item" data-day="${d.day}"><span class="rd-itemmain"><b>Day ${d.day} · ${esc(d.reference)}</b><span>${esc(d.title)}</span></span></button>`).join('')}</div>
      <div data-role="sample-body">${day1 ? sampleHTML(day1, 1) : '<p class="rd-note">Day 1 sample unavailable in the baked data.</p>'}</div></div>
    <p class="rd-note">“God over everything is not a slogan you print on a shirt. It's a posture you take before your feet hit the floor.” — Pastor Jeremy “Chico” Mills</p>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showFace(root));
  root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', async () => {
    const entry = dev.filter((e) => e.date >= '2026-04-20').sort((a, z) => (a.date < z.date ? -1 : 1))[parseInt(b.dataset.day, 10) - 1];
    const slot = root.querySelector('[data-role="sample-body"]');
    if (entry && slot) slot.innerHTML = sampleHTML(entry, parseInt(b.dataset.day, 10));
  }));
}
function sampleHTML(entry, day) {
  return `<div style="margin-top:16px"><span class="rd-meta">DAY ${day} · ${esc(entry.reference)}</span><h3>${esc(entry.title)}</h3>
    <div class="rd-quote">“${esc(entry.verse)}”</div>
    <div class="rd-body">${entry.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div>`;
}

/* ---- Devotionals door (ported; back target = the Living Word face) ------ */
async function showDevotionals(root, page = 0) {
  stopSpeech();
  S.view = 'devotionals'; S.devPage = page;
  mount(root, shellHTML(`<p class="rd-note">Loading the archive…</p>`));
  await loadDevotionals();
  const list = publishedDev();
  const per = 10, pages = Math.ceil(list.length / per);
  const slice = list.slice(page * per, page * per + per);
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← Back to the desk</button></div>
    <div class="rd-sechead"><div><p class="rd-pretag">03 / DAILY FUEL</p><h2 class="rd-sech2">FOR THE DAYS<br><em>YOU FEEL EVERYTHING.</em></h2><p class="rd-secsub">Some days you need a sermon. Other days you need three sentences and somebody to understand.</p></div><div class="rd-headart">THE DAILY TAPES <span>✦</span> SERIES 001</div></div>
    <p class="rd-note" data-testid="dev-count">${list.length} published entries · daily from April 20, 2026 · newest first · page ${page + 1} of ${pages}</p>
    <div class="rd-list">${slice.map((e, i) => `<button class="rd-item" data-entry="${esc(e.id)}"><span class="rd-itemnum">${String(page * per + i + 1).padStart(2, '0')}</span><span class="rd-itemmain"><b>${esc(e.title)}</b><span>${esc(e.date)} · ${esc(e.reference)} · ${esc(e.readTime || '2 min read')}</span></span></button>`).join('')}</div>
    <div class="rd-bar">
      <button class="rd-btn" data-pg="-1" ${page === 0 ? 'disabled' : ''}>← Newer</button>
      <button class="rd-btn" data-pg="1" ${page >= pages - 1 ? 'disabled' : ''}>Older →</button>
    </div>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showFace(root));
  root.querySelectorAll('[data-entry]').forEach((b) => b.addEventListener('click', () => showDevotional(root, b.dataset.entry)));
  root.querySelectorAll('[data-pg]').forEach((b) => { if (!b.disabled) b.addEventListener('click', () => showDevotionals(root, page + parseInt(b.dataset.pg, 10))); });
}

async function showDevotional(root, id) {
  stopSpeech();
  S.view = 'devotional';
  await loadDevotionals();
  const list = publishedDev();
  const idx = list.findIndex((e) => e.id === id);
  const e = list[idx];
  if (!e) { showDevotionals(root); return; }
  S.devEntry = e;
  let done = false;
  try { done = !!JSON.parse(localStorage.getItem(LS_DONE) || '{}')[e.id]; } catch { /* noop */ }
  const newer = list[idx - 1], older = list[idx + 1];
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="archive">← Archive</button><button class="rd-btn" data-act="doors">Back to the desk</button></div>
    <p class="rd-pretag">DAILY FUEL / ${esc(e.date)} · ${esc(e.readTime || '2 min read')}</p>
    <h2 data-testid="dev-title" style="margin-top:10px">${esc(e.title)}</h2>
    <p class="rd-meta" style="margin-top:6px">SCRIPTURE · ${esc(e.reference)}</p>
    <div class="rd-quote">“${esc(e.verse)}”</div>
    <div class="rd-body" data-testid="dev-body">${e.body.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <p class="rd-note">— Written by Pastor Jeremy “Chico” Mills, founder of 16:3 Faith</p>
    <div class="rd-card" data-testid="dev-reflection"><h3>Reflection</h3><div class="rd-body">
      <p>01 · What does ${esc(e.reference)} say to the specific situation you're in right now?</p>
      <p>02 · Where in your life are you carrying something that belongs in God's hands?</p>
      <p>03 · What's one concrete thing you can do today that lines up with the truth in this devotional?</p></div></div>
    <div class="rd-card" data-testid="dev-prayer"><h3>Prayer</h3>
      <div class="rd-body"><p><i>Lord, I come to You with what this devotional surfaced in me. The words of ${esc(e.title)} are true, and I need them to be true in my life today. Anchor me in ${esc(e.reference)}. I don't have this figured out — but I trust the One who does. Amen.</i></p></div></div>
    <div class="rd-bar">
      <button class="rd-btn" data-nav-entry="${newer ? esc(newer.id) : ''}" ${newer ? '' : 'disabled'}>← Newer</button>
      <button class="rd-btn goldb" data-act="complete" ${done ? 'disabled' : ''}>${done ? 'Completed ✓' : 'Mark as complete'}</button>
      <button class="rd-btn" data-nav-entry="${older ? esc(older.id) : ''}" ${older ? '' : 'disabled'}>Older →</button>
    </div>
    <p class="rd-note">Saved on this device. No streaks, timers, or pressure.</p>`));
  root.querySelector('[data-act="archive"]').addEventListener('click', () => showDevotionals(root, S.devPage));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showFace(root));
  root.querySelectorAll('[data-nav-entry]').forEach((b) => { if (b.dataset.navEntry) b.addEventListener('click', () => showDevotional(root, b.dataset.navEntry)); });
  const cbtn = root.querySelector('[data-act="complete"]');
  if (cbtn && !done) cbtn.addEventListener('click', () => {
    try { const all = JSON.parse(localStorage.getItem(LS_DONE) || '{}'); all[e.id] = new Date().toISOString(); localStorage.setItem(LS_DONE, JSON.stringify(all)); } catch { /* noop */ }
    cbtn.disabled = true; cbtn.textContent = 'Completed ✓';
  });
}

/* ---- Today's Word door (ported; its Bible door now opens the desk) ------ */
async function showWord(root) {
  stopSpeech();
  S.view = 'word';
  mount(root, shellHTML(`<p class="rd-note">Loading today's word…</p>`));
  await loadDevotionals();
  const e = todaysEntry();
  if (!e) {
    mount(root, shellHTML(`<div class="rd-bar"><button class="rd-btn" data-act="doors">← Back to the desk</button></div><div class="rd-err">No daily word is available in the baked devotional data for today (${todayISO()}). Nothing is fabricated in its place.</div>`));
    root.querySelector('[data-act="doors"]').addEventListener('click', () => showFace(root));
    return;
  }
  const dstr = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← Back to the desk</button></div>
    <div class="rd-today">
      <div>
        <p class="rd-pretag">04 / TODAY'S WORD <span class="rd-red">/ SIDE B</span></p>
        <p class="rd-today-label">A VERSE FOR THE RIGHT NOW · ${esc(dstr.toUpperCase())}</p>
        <h2 data-testid="word-title">${esc(e.title.toUpperCase())}</h2>
        <p class="rd-today-ref">${esc(e.reference)} / KJV</p>
        <div class="rd-quote" data-testid="word-verse">“${esc(e.verse)}”</div>
        <div class="rd-body"><p>${esc(e.body[0])}</p></div>
        <div class="rd-bar"><button class="rd-btn goldb" data-act="full">Read the full devotional</button><button class="rd-btn" data-act="open-ref">Open ${esc(e.reference)} in the Bible</button></div>
        <p class="rd-note">Source: the day's devotional — the same word the production homepage carries (verified Thu Nov 19, 2026: “CROWDED THOUGHTS”, Psalm 94:19). The production API exposes no dedicated daily-word endpoint; its Bible verse-of-day route is a separate surface.</p>
      </div>
      <div class="rd-today-art"><div class="rd-disc"><div class="rd-disc-center"><span>16:3</span><b>THE WORD</b><small>RIGHT NOW / SIDE B</small></div></div><div class="rd-sticker">FAITH<br>ON REPEAT.</div></div>
    </div>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showFace(root));
  root.querySelector('[data-act="full"]').addEventListener('click', () => showDevotional(root, e.id));
  root.querySelector('[data-act="open-ref"]').addEventListener('click', async () => {
    const books = await loadBooks();
    const ref = parseReference(e.reference, books);
    if (ref) showFace(root, { book: ref.book.name, chapter: ref.chapter, verse: ref.verse });
  });
}

/* CP4 — Read AI Insights (ported): an explainer keyed to the DAY'S
   VERSE — the same devotional entry Today's Word carries, from the
   same data file. Factual and supportive only: the entry's own title,
   reference and verse text (carried KJV), the archive's real size.
   No interpretation is generated, no scripture invented. */
async function fillRdAi(root) {
  const box = root.querySelector('[data-rd-ai]');
  if (!box) return;
  try {
    const r = await fetch('assets/data/read/devotionals.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const entries = Array.isArray(d.entries) ? d.entries : [];
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const e = entries.filter((x) => x.date <= iso).sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    if (!e || !box.isConnected) return;
    box.innerHTML = `<section class="ai-shelf" aria-label="Read AI Insights">
      <div class="ai-shelf-head"><span class="ai-shelf-title">✦ FaithGuide · Read AI Insights</span><span class="ai-tag">Powered by AI</span></div>
      <p>Today's word is <b>${esc(e.title)}</b> — <b>${esc(e.reference)} (KJV)</b>: “${esc(e.verse)}” It stands in a daily archive of <b>${entries.length} entries</b>, published day by day since April 20, 2026 — one verse, one thought, one way to carry it forward.</p>
      <div class="ai-doors"><button type="button" data-rdgo="word">Read today's word ↗</button><button type="button" data-rdgo="devotionals">The devotional archive ↗</button></div>
    </section>`;
    box.querySelectorAll('[data-rdgo]').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.rdgo === 'word') showWord(root); else showDevotionals(root);
    }));
  } catch { /* the shelf simply stays empty — the doors above carry the hub */ }
}

export function render(root) {
  S = freshState();
  loadReaderPrefs();
  showFace(root);
}
