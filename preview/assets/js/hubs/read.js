/* READ hub (SPEC §3.3) — four doors per the HUB BREAKDOWN LAW:
   BIBLE · BOOKS · DEVOTIONALS · TODAY'S WORD.
   Data routes (evidence in records/HUB-READ-RECORD.md):
   - Bible books/chapters/search: production API first
     (GET /api/bible/books?translation=KJV · /api/bible/KJV/<nr>/<ch> ·
      /api/bible/search?q=…&translation=KJV — shapes proven by the
      2026-10-22 bible census), baked production captures as fallback
     (assets/data/read/books.json + chapters/kjv-<nr>-<ch>.json).
     Chapters lazy-load one at a time — no whole-Bible bundle.
   - Devotionals: production serves them as a client-side data array;
     baked snapshot of that exact array lives at assets/data/read/devotionals.json
     (220 entries, 2026-04-20 → 2026-11-25) and lazy-loads on door entry.
   - Today's Word: the day's devotional (production homepage evidence:
     Thu 2026-11-19 = "CROWDED THOUGHTS", Psalm 94:19 = devotional dated
     2026-11-19). No dedicated daily-word API endpoint exists in the
     production route census — the word rides the devotional data.
   Defect guards: #26 whitespace is NEVER stripped from search (queries are
   trimmed at the ends only); #48 every view renders exactly once (single
   mount per navigation, guarded); #30 narration controls report true state;
   #31 Continue Reading tracks the reader's real position (production
   localStorage key 163_bible_reading_context); #52 /books → the one book. */

const API = 'https://faith-hub-api-railway-production.up.railway.app';
const DATA = 'assets/data/read/';
const LS_POS = '163_bible_reading_context';
const LS_DONE = '163-devotional-completions';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fetchJSON(url, timeoutMs = 6000) {
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
    view: 'doors', // doors | bible | chapter | search | books | devotionals | devotional | word
    books: null, booksSource: '',
    chapter: null, // {bookNr, chapter, data, source}
    search: null, // {q, results, source}
    dev: null, devPage: 0, devEntry: null,
    narr: { playing: false, paused: false, verseIdx: -1, timer: null, utter: null },
    mountSeq: 0,
  };
}

function stopNarration() {
  if (!S) return;
  if (S.narr.timer) { clearInterval(S.narr.timer); S.narr.timer = null; }
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* noop */ }
  S.narr.playing = false; S.narr.paused = false; S.narr.verseIdx = -1;
}

/* ---------------- data loaders ------------------------------------------- */
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

/* ---------------- search --------------------------------------------------- */
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

async function runSearch(q) {
  const books = await loadBooks();
  const ref = parseReference(q, books);
  if (ref) {
    const { data } = await loadChapter(ref.book.nr, ref.chapter);
    const verses = ref.verse ? data.verses.filter((v) => v.verse === ref.verse) : data.verses;
    return { source: 'reference', results: verses.map((v) => ({ book: ref.book.name, bookNr: ref.book.nr, chapter: ref.chapter, verse: v.verse, text: v.text })) };
  }
  // Phrase search — the query goes to the API with its spaces intact (#26).
  try {
    const d = await fetchJSON(`${API}/api/bible/search?q=${encodeURIComponent(q)}&translation=KJV`);
    if (Array.isArray(d.results)) return { source: 'live production API search', results: d.results };
    throw new Error('unexpected search payload');
  } catch {
    // Fallback: phrase search over the baked chapter captures (spaces intact).
    const needle = q.trim().toLowerCase();
    const results = [];
    for (const key of ['kjv-1-1', 'kjv-43-3']) {
      try {
        const d = await fetchJSON(`${DATA}chapters/${key}.json`);
        for (const v of d.verses) if (v.text.toLowerCase().includes(needle)) results.push({ book: d.book, bookNr: d.bookNr, chapter: d.chapter, verse: v.verse, text: v.text });
      } catch { /* capture missing */ }
    }
    return { source: 'baked-capture phrase search (API unreachable from this network)', results };
  }
}

/* ---------------- rendering ---------------------------------------------- */
const STYLE = `<style>
.rd-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:22px}
.rd-door{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:16px;min-height:118px;text-align:left;color:var(--bone);width:100%}
.rd-door:hover{border-color:var(--gold-dim)}
.rd-door .rd-art{height:46px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.25),rgba(212,175,55,.04));margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--gold)}
.rd-door b{font-size:15px;display:block}.rd-door span{font-size:12px;color:var(--mute)}
.rd-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0}
.rd-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:9px 16px;font-size:12.5px;letter-spacing:.08em}
.rd-btn[disabled]{opacity:.38;cursor:not-allowed}
.rd-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}
.rd-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:8px;margin-top:10px}
.rd-books button{background:var(--coal);border:1px solid var(--line);color:var(--bone);border-radius:10px;padding:10px;font-size:13.5px;text-align:left}
.rd-books button:hover{border-color:var(--gold-dim)}
.rd-chaps{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.rd-chaps button{width:44px;height:44px;border-radius:10px;background:var(--coal);border:1px solid var(--line);color:var(--bone);font-size:14px}
.rd-chaps button:hover{border-color:var(--gold)}
.rd-verse{padding:7px 10px;border-radius:8px;line-height:1.65;font-size:16.5px;color:var(--bone)}
.rd-verse .vn{color:var(--gold);font-size:11px;vertical-align:super;margin-right:5px}
.rd-verse.hl{background:rgba(212,175,55,.16);outline:1px solid var(--gold-dim)}
.rd-card{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:18px;margin-top:14px}
.rd-card h3{font-family:var(--serif);font-size:20px;margin-bottom:6px}
.rd-meta{font-size:12px;color:var(--mute);letter-spacing:.06em}
.rd-body p{line-height:1.7;color:var(--bone);margin-top:12px;font-size:15.5px}
.rd-quote{border-left:2px solid var(--gold);padding:6px 0 6px 16px;font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.6;margin-top:14px}
.rd-note{font-size:12.5px;color:var(--mute);margin-top:14px;line-height:1.55}
.rd-err{border:1px dashed #a33;border-radius:14px;padding:16px;color:#e8a0a0;margin-top:14px;line-height:1.55;font-size:14px}
.rd-list{display:flex;flex-direction:column;gap:10px;margin-top:14px}
.rd-item{border:1px solid var(--line);border-radius:12px;background:var(--coal);padding:14px 16px;text-align:left;color:var(--bone);width:100%}
.rd-item:hover{border-color:var(--gold-dim)} .rd-item b{font-family:var(--serif);font-size:16.5px;display:block}
.rd-status{font-size:12.5px;color:var(--gold-hi);letter-spacing:.05em;min-height:18px}
select.rd-sel{background:#000;color:var(--bone);border:1px solid var(--gold-dim);border-radius:999px;padding:10px 14px;font-size:14px}
</style>`;

function shellHTML(inner) { return STYLE + `<p class="kicker">Read</p>` + inner; }

function doorsHTML() {
  let cont = '';
  try {
    const pos = JSON.parse(localStorage.getItem(LS_POS) || 'null');
    if (pos && pos.bookName) cont = `<div class="rd-card" data-testid="continue-reading"><span class="rd-meta">CONTINUE READING</span><h3>${esc(pos.bookName)} ${pos.chapter}${pos.verse ? ':' + pos.verse : ''}</h3><p class="rd-note">Pick up right where you left off.</p><div class="rd-bar"><button class="rd-btn goldb" data-act="continue">Continue reading</button></div></div>`;
  } catch { /* no saved position */ }
  return shellHTML(`
    <h1>The Word, <span class="g">wide open.</span></h1>
    <p class="lede">Four doors: the full Bible with read-aloud narration, the one book, 209+ daily devotionals, and today's word.</p>
    <form class="hub-search" data-form="search"><input type="search" name="q" placeholder="Search the Bible — try “John 3:16”" aria-label="Search the Bible"><button class="rd-btn goldb" type="submit">Search</button></form>
    <p class="rd-status" data-role="status"></p>
    <div class="rd-doors">
      <button class="rd-door" data-door="bible"><div class="rd-art">✦</div><b>Bible</b><span>66 books · KJV · read-aloud</span></button>
      <button class="rd-door" data-door="books"><div class="rd-art">❧</div><b>Books</b><span>God Over Everything — the book & free sample</span></button>
      <button class="rd-door" data-door="devotionals"><div class="rd-art">☀</div><b>Devotionals</b><span>daily archive · reflection & prayer</span></button>
      <button class="rd-door" data-door="word"><div class="rd-art">✚</div><b>Today's Word</b><span>today's verse & word for the day</span></button>
    </div>${cont}`);
}

function setStatus(root, msg) { const el = root.querySelector('[data-role="status"]'); if (el) el.textContent = msg || ''; }

function mount(root, html) {
  // #48 guard: exactly one mount per navigation — replace, never append.
  S.mountSeq += 1;
  root.innerHTML = html;
  return S.mountSeq;
}

/* ---- Bible door ---- */
async function showBible(root, bookNr = null, chapter = null) {
  stopNarration();
  S.view = 'bible';
  mount(root, shellHTML(`<h2>Choose a <span class="g">book</span></h2><p class="rd-note">Loading the 66 books…</p>`));
  const books = await loadBooks();
  const ot = books.filter((b) => b.testament === 'OT'), nt = books.filter((b) => b.testament === 'NT');
  const grid = (arr) => `<div class="rd-books">${arr.map((b) => `<button data-book="${b.nr}">${esc(b.name)} <span class="rd-meta">${b.chapters} ch</span></button>`).join('')}</div>`;
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div>
    <h2>The Bible — <span class="g">King James Version</span></h2>
    <p class="rd-note">66 books · book list source: ${esc(S.booksSource)}</p>
    <form class="hub-search" data-form="search"><input type="search" name="q" placeholder="Reference or phrase — spaces welcome, e.g. John 3:16" aria-label="Search the Bible"><button class="rd-btn goldb" type="submit">Search</button></form>
    <h3 style="margin-top:18px;font-family:var(--serif)">Old Testament</h3>${grid(ot)}
    <h3 style="margin-top:22px;font-family:var(--serif)">New Testament</h3>${grid(nt)}`));
  root.querySelectorAll('[data-book]').forEach((btn) => btn.addEventListener('click', () => showChapters(root, parseInt(btn.dataset.book, 10))));
  wireSearch(root);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  if (bookNr) showChapters(root, bookNr, chapter);
}

async function showChapters(root, bookNr, chapter = null) {
  const books = await loadBooks();
  const book = books.find((b) => b.nr === bookNr);
  if (!book) return;
  S.view = 'bible';
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="books">← All books</button><button class="rd-btn" data-act="doors">All doors</button></div>
    <h2>${esc(book.name)}</h2><p class="rd-note">${book.chapters} chapters · KJV</p>
    <div class="rd-chaps">${Array.from({ length: book.chapters }, (_, i) => `<button data-ch="${i + 1}">${i + 1}</button>`).join('')}</div>`));
  root.querySelectorAll('[data-ch]').forEach((btn) => btn.addEventListener('click', () => showChapter(root, bookNr, parseInt(btn.dataset.ch, 10))));
  root.querySelector('[data-act="books"]').addEventListener('click', () => showBible(root));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  if (chapter) showChapter(root, bookNr, chapter);
}

function savePosition(bookNr, bookName, chapter, verse) {
  try { localStorage.setItem(LS_POS, JSON.stringify({ bookNr, bookName, chapter, verse: verse || null })); } catch { /* storage off */ }
}

async function showChapter(root, bookNr, chapter, focusVerse = null) {
  stopNarration();
  S.view = 'chapter';
  mount(root, shellHTML(`<p class="rd-note">Loading chapter…</p>`));
  const seq = S.mountSeq; // any later mount invalidates this in-flight render (#48)
  let loaded;
  try { loaded = await loadChapter(bookNr, chapter); }
  catch (err) {
    if (seq !== S.mountSeq) return;
    mount(root, shellHTML(`<div class="rd-bar"><button class="rd-btn" data-act="books">← All books</button></div><div class="rd-err" data-testid="chapter-error">${esc(err.message)}<br><span class="rd-note">The reader's live route is the production API (GET /api/bible/KJV/${bookNr}/${chapter}); it answers from any network that can reach faith-hub-api-railway-production.up.railway.app.</span></div>`));
    root.querySelector('[data-act="books"]').addEventListener('click', () => showBible(root));
    return;
  }
  if (seq !== S.mountSeq) return; // a newer navigation already mounted — never double-render
  const d = loaded.data;
  const books = await loadBooks();
  const book = books.find((b) => b.nr === bookNr);
  savePosition(bookNr, d.book, chapter, focusVerse);
  const prev = chapter > 1 ? { nr: bookNr, ch: chapter - 1 } : (book && bookNr > 1 ? { nr: bookNr - 1, ch: (books.find((b) => b.nr === bookNr - 1) || {}).chapters } : null);
  const next = chapter < d.chapterCount ? { nr: bookNr, ch: chapter + 1 } : (bookNr < 66 ? { nr: bookNr + 1, ch: 1 } : null);
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="chapters">← Chapters</button><button class="rd-btn" data-act="doors">All doors</button></div>
    <h2 data-testid="chapter-title">${esc(d.book)} ${chapter}</h2>
    <p class="rd-note">KJV · ${d.verses.length} verses · text source: ${esc(loaded.source)}</p>
    <div class="rd-card" data-testid="narrator">
      <span class="rd-meta">READ ALOUD</span>
      <div class="rd-bar">
        <button class="rd-btn goldb" data-narr="play">▶ Listen</button>
        <button class="rd-btn" data-narr="pause" disabled>⏸ Pause</button>
        <button class="rd-btn" data-narr="stop" disabled>■ Stop</button>
        <span class="rd-status" data-role="narr-status">Not started</span>
      </div>
    </div>
    <div data-testid="verses">${d.verses.map((v) => `<p class="rd-verse" data-verse="${v.verse}" id="v${v.verse}"><span class="vn">${v.verse}</span>${esc(v.text)}</p>`).join('')}</div>
    <div class="rd-bar">
      <button class="rd-btn" data-nav-ch="${prev ? prev.nr + ':' + prev.ch : ''}" ${prev ? '' : 'disabled'}>← Previous chapter</button>
      <button class="rd-btn" data-nav-ch="${next ? next.nr + ':' + next.ch : ''}" ${next ? '' : 'disabled'}>Next chapter →</button>
    </div>`));
  root.querySelector('[data-act="chapters"]').addEventListener('click', () => showChapters(root, bookNr));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  root.querySelectorAll('[data-nav-ch]').forEach((btn) => { if (btn.dataset.navCh) btn.addEventListener('click', () => { const [n, c] = btn.dataset.navCh.split(':').map(Number); showChapter(root, n, c); }); });
  wireNarration(root, d);
  if (focusVerse) { const el = root.querySelector(`[data-verse="${focusVerse}"]`); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center' }); } }
}

/* ---- Narration (#30 true-state controls, verse highlighting) ---- */
function wireNarration(root, chapterData) {
  const playBtn = root.querySelector('[data-narr="play"]');
  const pauseBtn = root.querySelector('[data-narr="pause"]');
  const stopBtn = root.querySelector('[data-narr="stop"]');
  const status = root.querySelector('[data-role="narr-status"]');
  const verseEls = [...root.querySelectorAll('[data-verse]')];
  const sync = () => {
    // Truth table: while playing, Pause is ENABLED and Listen reads Resume/Pause state honestly.
    pauseBtn.disabled = !S.narr.playing;
    stopBtn.disabled = !S.narr.playing && S.narr.verseIdx < 0;
    playBtn.textContent = S.narr.playing && !S.narr.paused ? '🔊 Reading…' : (S.narr.paused ? '▶ Resume' : '▶ Listen');
    pauseBtn.textContent = S.narr.paused ? '⏸ Paused' : '⏸ Pause';
    status.textContent = S.narr.playing
      ? (S.narr.paused ? `Paused at verse ${chapterData.verses[S.narr.verseIdx]?.verse ?? ''}` : `Reading verse ${chapterData.verses[S.narr.verseIdx]?.verse ?? ''} of ${chapterData.verses.length}`)
      : (S.narr.verseIdx >= 0 ? 'Stopped' : 'Not started');
    status.dataset.state = S.narr.playing ? (S.narr.paused ? 'paused' : 'playing') : 'idle';
  };
  const highlight = (idx) => {
    verseEls.forEach((el) => el.classList.remove('hl'));
    const v = chapterData.verses[idx];
    if (v) {
      const el = root.querySelector(`[data-verse="${v.verse}"]`);
      if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      savePosition(chapterData.bookNr, chapterData.book, chapterData.chapter, v.verse);
    }
  };
  const speakFrom = (idx) => {
    S.narr.verseIdx = idx;
    highlight(idx);
    const v = chapterData.verses[idx];
    if (!v) { stopNarration(); sync(); return; }
    const synth = window.speechSynthesis;
    if (synth && synth.getVoices().length) {
      const u = new SpeechSynthesisUtterance(`${chapterData.book} ${chapterData.chapter}. Verse ${v.verse}. ${v.text}`);
      u.rate = 0.98;
      u.onend = () => { if (S.narr.playing && !S.narr.paused) speakFrom(idx + 1); };
      u.onerror = () => { if (S.narr.playing && !S.narr.paused) speakFrom(idx + 1); };
      S.narr.utter = u;
      synth.speak(u);
    } else {
      // No speech voice on this device (headless/kiosk): timed narration —
      // the highlight still advances verse by verse at reading pace.
      const words = v.text.split(/\s+/).length;
      const ms = Math.max(1400, Math.min(9000, (words / 2.4) * 1000));
      S.narr.timer = setTimeout(() => { if (S.narr.playing && !S.narr.paused) speakFrom(idx + 1); }, ms);
    }
    sync();
  };
  playBtn.addEventListener('click', () => {
    if (S.narr.playing && !S.narr.paused) return;
    if (S.narr.paused) { // resume
      S.narr.paused = false;
      try { window.speechSynthesis && window.speechSynthesis.resume(); } catch { /* noop */ }
      if (!window.speechSynthesis || !window.speechSynthesis.getVoices().length) speakFrom(S.narr.verseIdx);
      sync(); return;
    }
    S.narr.playing = true; S.narr.paused = false;
    speakFrom(S.narr.verseIdx >= 0 ? S.narr.verseIdx : 0);
  });
  pauseBtn.addEventListener('click', () => {
    if (!S.narr.playing) return; // pause can never fire (or be marked) while idle
    S.narr.paused = true;
    if (S.narr.timer) { clearTimeout(S.narr.timer); S.narr.timer = null; }
    try { window.speechSynthesis && window.speechSynthesis.pause(); } catch { /* noop */ }
    sync();
  });
  stopBtn.addEventListener('click', () => { stopNarration(); verseEls.forEach((el) => el.classList.remove('hl')); sync(); });
  sync();
}

/* ---- Search view ---- */
function wireSearch(root) {
  const form = root.querySelector('[data-form="search"]');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = form.querySelector('input[name="q"]').value; // as typed — spaces kept (#26)
    if (!q.trim()) return;
    S.view = 'search';
    mount(root, shellHTML(`<div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div><h2>Searching…</h2><p class="rd-note">Query, exactly as typed: “${esc(q)}”</p>`));
    root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
    try {
      const { source, results } = await runSearch(q);
      S.search = { q, results, source };
      mount(root, shellHTML(`
        <div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button><button class="rd-btn" data-act="bible">Bible</button></div>
        <h2>Results for <span class="g">“${esc(q)}”</span></h2>
        <p class="rd-note">${results.length} result${results.length === 1 ? '' : 's'} · route: ${esc(source)} · whitespace preserved</p>
        <div class="rd-list" data-testid="search-results">${results.slice(0, 50).map((r) => `<button class="rd-item" data-open="${r.bookNr}:${r.chapter}:${r.verse}"><b>${esc(r.book)} ${r.chapter}:${r.verse}</b><span>${esc(r.text)}</span></button>`).join('') || '<p class="rd-note">No matches in the text searched. Try a reference like “John 3:16” or a shorter phrase.</p>'}</div>`));
      root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
      root.querySelector('[data-act="bible"]').addEventListener('click', () => showBible(root));
      root.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { const [n, c, v] = b.dataset.open.split(':').map(Number); showChapter(root, n, c, v); }));
    } catch (err) {
      mount(root, shellHTML(`<div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div><div class="rd-err">${esc(err.message)}</div>`));
      root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
    }
  });
}

/* ---- Books door (#52: exactly one book — a title page, not a catalog) ---- */
async function showBooks(root) {
  stopNarration();
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
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div>
    <p class="rd-meta">16:3 FAITH PRESENTS · THE ONE BOOK</p>
    <h2 style="margin-top:8px">God Over <span class="g">Everything</span></h2>
    <p class="lede">A 365-Day Devotional by Pastor Jeremy “Chico” Mills — one verse, one honest reflection, one prayer, every day for a year. Both paperback volumes now on Amazon. Read the first 5 days free.</p>
    <div class="rd-card"><h3>Volume One · January – June</h3><p class="rd-meta">Days 1–181 · Paperback · 6×9 · 559 pages · $19.99</p>
      <div class="rd-body"><p>The first half of the year. From the cold start of January to the long light of June — a daily return to putting God first, one verse at a time.</p></div>
      <div class="rd-bar"><a class="rd-btn goldb" href="https://www.amazon.com/dp/B0H41J8C8G?tag=kairobot143-20" target="_blank" rel="noopener noreferrer">Buy Volume One — $19.99</a></div></div>
    <div class="rd-card"><h3>Volume Two · July – December</h3><p class="rd-meta">Days 182–365 · Paperback · 6×9 · 568 pages · $19.99</p>
      <div class="rd-body"><p>The back half of the year, all the way to the last day. The same honest rhythm — verse, reflection, prayer, and one line to carry with you.</p></div>
      <div class="rd-bar"><a class="rd-btn goldb" href="https://www.amazon.com/dp/B0H3NV2JLH?tag=kairobot143-20" target="_blank" rel="noopener noreferrer">Buy Volume Two — $19.99</a></div></div>
    <div class="rd-card"><span class="rd-meta">EVERY DAY HOLDS</span>
      <div class="rd-body"><p><b>The Verse</b> — one verse of Scripture to anchor the day.</p><p><b>The Reflection</b> — an honest reflection from the rebuild. No fluff, no performance.</p><p><b>The Prayer</b> — a prayer to pray out loud.</p><p><b>The Line to Carry</b> — one line to take with you into the day.</p></div></div>
    <div class="rd-card" data-testid="book-sample"><span class="rd-meta">FREE 5-DAY SAMPLE</span><h3>Read the first five days free</h3>
      <div class="rd-list">${days.map((d) => `<button class="rd-item" data-day="${d.day}"><b>Day ${d.day} · ${esc(d.reference)}</b><span>${esc(d.title)}</span></button>`).join('')}</div>
      <div data-role="sample-body">${day1 ? sampleHTML(day1, 1) : '<p class="rd-note">Day 1 sample unavailable in the baked data.</p>'}</div></div>
    <p class="rd-note">“God over everything is not a slogan you print on a shirt. It's a posture you take before your feet hit the floor.” — Pastor Jeremy “Chico” Mills</p>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
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

/* ---- Devotionals door ---- */
async function showDevotionals(root, page = 0) {
  stopNarration();
  S.view = 'devotionals'; S.devPage = page;
  mount(root, shellHTML(`<p class="rd-note">Loading the archive…</p>`));
  await loadDevotionals();
  const list = publishedDev();
  const per = 10, pages = Math.ceil(list.length / per);
  const slice = list.slice(page * per, page * per + per);
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div>
    <h2>Devotionals</h2>
    <p class="rd-note" data-testid="dev-count">${list.length} published entries · daily from April 20, 2026 · newest first · page ${page + 1} of ${pages}</p>
    <div class="rd-list">${slice.map((e) => `<button class="rd-item" data-entry="${esc(e.id)}"><b>${esc(e.title)}</b><span>${esc(e.date)} · ${esc(e.reference)} · ${esc(e.readTime || '2 min read')}</span></button>`).join('')}</div>
    <div class="rd-bar">
      <button class="rd-btn" data-pg="-1" ${page === 0 ? 'disabled' : ''}>← Newer</button>
      <button class="rd-btn" data-pg="1" ${page >= pages - 1 ? 'disabled' : ''}>Older →</button>
    </div>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  root.querySelectorAll('[data-entry]').forEach((b) => b.addEventListener('click', () => showDevotional(root, b.dataset.entry)));
  root.querySelectorAll('[data-pg]').forEach((b) => { if (!b.disabled) b.addEventListener('click', () => showDevotionals(root, page + parseInt(b.dataset.pg, 10))); });
}

async function showDevotional(root, id) {
  stopNarration();
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
    <div class="rd-bar"><button class="rd-btn" data-act="archive">← Archive</button><button class="rd-btn" data-act="doors">All doors</button></div>
    <p class="rd-meta">${esc(e.date)} · ${esc(e.readTime || '2 min read')}</p>
    <h2 data-testid="dev-title">${esc(e.title)}</h2>
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
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  root.querySelectorAll('[data-nav-entry]').forEach((b) => { if (b.dataset.navEntry) b.addEventListener('click', () => showDevotional(root, b.dataset.navEntry)); });
  const cbtn = root.querySelector('[data-act="complete"]');
  if (cbtn && !done) cbtn.addEventListener('click', () => {
    try { const all = JSON.parse(localStorage.getItem(LS_DONE) || '{}'); all[e.id] = new Date().toISOString(); localStorage.setItem(LS_DONE, JSON.stringify(all)); } catch { /* noop */ }
    cbtn.disabled = true; cbtn.textContent = 'Completed ✓';
  });
}

/* ---- Today's Word door ---- */
async function showWord(root) {
  stopNarration();
  S.view = 'word';
  mount(root, shellHTML(`<p class="rd-note">Loading today's word…</p>`));
  await loadDevotionals();
  const e = todaysEntry();
  if (!e) {
    mount(root, shellHTML(`<div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div><div class="rd-err">No daily word is available in the baked devotional data for today (${todayISO()}). Nothing is fabricated in its place.</div>`));
    root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
    return;
  }
  const dstr = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  mount(root, shellHTML(`
    <div class="rd-bar"><button class="rd-btn" data-act="doors">← All doors</button></div>
    <p class="rd-meta">TODAY'S WORD · ${esc(dstr.toUpperCase())}</p>
    <h2 data-testid="word-title" style="margin-top:8px">${esc(e.title.toUpperCase())}</h2>
    <p class="rd-meta" style="margin-top:6px">${esc(e.reference)}</p>
    <div class="rd-quote" data-testid="word-verse">“${esc(e.verse)}”</div>
    <div class="rd-body"><p>${esc(e.body[0])}</p></div>
    <div class="rd-bar"><button class="rd-btn goldb" data-act="full">Read the full devotional</button><button class="rd-btn" data-act="open-ref">Open ${esc(e.reference)} in the Bible</button></div>
    <p class="rd-note">Source: the day's devotional — the same word the production homepage carries (verified Thu Nov 19, 2026: “CROWDED THOUGHTS”, Psalm 94:19). The production API exposes no dedicated daily-word endpoint; its Bible verse-of-day route is a separate surface.</p>`));
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  root.querySelector('[data-act="full"]').addEventListener('click', () => showDevotional(root, e.id));
  root.querySelector('[data-act="open-ref"]').addEventListener('click', async () => {
    const books = await loadBooks();
    const ref = parseReference(e.reference, books);
    if (ref) showChapter(root, ref.book.nr, ref.chapter, ref.verse);
  });
}

/* ---- Doors ---- */
function showDoors(root) {
  stopNarration();
  S.view = 'doors';
  mount(root, doorsHTML());
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.door;
    if (d === 'bible') showBible(root);
    else if (d === 'books') showBooks(root);
    else if (d === 'devotionals') showDevotionals(root);
    else if (d === 'word') showWord(root);
  }));
  const cont = root.querySelector('[data-act="continue"]');
  if (cont) cont.addEventListener('click', () => {
    try { const pos = JSON.parse(localStorage.getItem(LS_POS) || 'null'); if (pos) showChapter(root, pos.bookNr, pos.chapter, pos.verse); } catch { /* noop */ }
  });
  wireSearch(root);
}

export function render(root) {
  S = freshState();
  showDoors(root);
}
