/* HOME — the visual hub selector (SPEC §3.0). A cinematic featured
   SLIDER ("THE MOVEMENT" — ChatGPT art direction, founder visual ruling
   2026-11-19; dynamic rotation added by AMP-UP Phase 2A, 2026-11-22,
   consult chatcmpl-EnBxxtenrx110NE7NnQxbVxRNfdpg), a cinematic SHOWCASE
   row under the hero (founder, 2026-11-22: "make each one of these cards
   cinematic cards… they are all moving?" — showcase row only; working
   cards stay still), seven full-bleed PHOTO tile doors, Today's Word,
   live counters (count-up under the motion system), and the Meet the
   Pastor piece at selector level (row MTP).
   The flat gold-gradient + glyph-icon tiles are DELETED by that ruling.
   Tile photography is AI-generated presentation imagery (founder: "clean
   pics, AI pics"), EXCEPT Shop, which carries the REAL Printful product
   photo — real product only, per the shop law.
   SLIDER + SHOWCASE data law: every slide/card is built from real
   carried data (devotionals.json, listen-index.json artist art,
   community feed.json testimonies, watch.json's own featured picks).
   A data leg that fails drops its slide/card — nothing is fabricated
   to fill the rotation. Slide 1 (the house hero) is painted statically
   so first paint never waits on data.
   MOTION law (consult ranking): crossfades > entrance reveals >
   count-up counters > Ken Burns (sparing). CSS transform/opacity only;
   prefers-reduced-motion kills autoplay, Ken Burns, reveals and
   count-up in both CSS and JS.
   Today's Word (ledger row HTW): the card below is fed by the SAME
   data file the READ hub uses — assets/data/read/devotionals.json — with
   READ's own selection (latest entry published as of today; no dedicated
   daily-word API exists, the word rides the devotional data). One data
   source, no second copy to drift. If the data cannot load, the section
   says so and points at the Read hub — nothing is fabricated. */
/* The Crowned Heavy Hoodie's real product photo, referenced exactly as the
   shop hub's own catalog data references it (assets/data/shop/products.json,
   product "crowned-heavy-hoodie" → "img"). No generated art on the Shop
   tile — the real 16:3 mark on the real garment is the point. */
const SHOP_TILE_IMG = 'https://files.cdn.printful.com/files/165/16596b1e990f2038c70450d8a836d73b_preview.png';
const TILES = [
  { hub: 'watch',     num: '01', name: 'WATCH',     blurb: 'Films, series & teachings',    img: 'assets/img/home/tile-watch.webp',     alt: 'A singer performing into a microphone under a golden spotlight' },
  { hub: 'listen',    num: '02', name: 'LISTEN',    blurb: 'The Sanctuary — full songs',   img: 'assets/img/home/tile-listen.webp',    alt: 'A woman in headphones at a studio mixing console, eyes closed, lost in the music' },
  { hub: 'read',      num: '03', name: 'READ',      blurb: 'Bible, devotionals & the book', img: 'assets/img/home/tile-read.webp',     alt: 'A young woman with long braids reading an open book in warm window light' },
  { hub: 'pray',      num: '04', name: 'PRAY',      blurb: 'The Prayer Room',              img: 'assets/img/home/tile-pray.webp',      alt: 'A young man in a black hoodie praying by a window, hands open in golden light' },
  { hub: 'community', num: '05', name: 'COMMUNITY', blurb: 'Feed, testimonies & members',  img: 'assets/img/home/tile-community.webp', alt: 'Friends laughing together around a shared table of food' },
  { hub: 'give',      num: '06', name: 'GIVE',      blurb: 'Offerings & partnership',      img: 'assets/img/home/tile-give.webp',     alt: 'A young man handing a bag of groceries to a young woman at a produce table' },
  { hub: 'people',    num: '08', name: 'THE PEOPLE', blurb: 'The Hall of Faith — their stories, words & films', img: 'assets/img/people/tree-of-life.webp', alt: 'The Tree of Life — a great golden tree with a river of light winding from its roots' },
  { hub: 'shop',      num: '07', name: 'SHOP',      blurb: 'Wear the work — gold on black', img: SHOP_TILE_IMG, wide: true,            alt: 'The Crowned Heavy Hoodie — a real 16:3 Faith product photo from the shop' },
];
/* Counters — ONE SOURCE for every surface in the house (SPEC §2 D4): the
   live pulse, GET /api/community/pulse on the production API (members /
   testimonies / prayerRequests / prayersLifted), with the baked fallback
   assets/data/pray/counters.json — the SAME fallback file the PRAY hub
   reads, refreshed 2026-11-19 from two agreeing live reads (126 · 50 ·
   84 · 21). This strip used to hardcode the 2026-11-18 census values;
   when the pulse moved (prayersLifted 19 → 21) the literal did not, and
   the home strip disagreed with the Prayer Room on the 2026-11-19
   preview walk. No counter literal lives in this file anymore: the
   strip paints a loading glyph and fills from the one source, the same
   lazy-fill discipline as Today's Word below. */
const API = 'https://faith-hub-api-railway-production.up.railway.app';
const COUNTER_LABELS = [
  ['members', 'Members'],
  ['testimonies', 'Testimonies'],
  ['requests', 'Prayer requests'],
  ['lifted', 'Prayers lifted'],
];

const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

async function fetchJSON(url, timeoutMs = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const excerpt = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };

/* Count-up (motion system): display-only — the value painted is always
   the source value; the animation just walks the digits to it. Reduced
   motion (or a non-number) paints instantly. */
function countUp(el, to) {
  if (!el) return;
  if (REDUCED || !Number.isFinite(to)) { el.textContent = String(to); return; }
  const t0 = performance.now(), dur = 900;
  const step = (t) => {
    if (!el.isConnected) return;
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(to * e));
    if (p < 1) requestAnimationFrame(step); else el.textContent = String(to);
  };
  requestAnimationFrame(step);
}

/* Fill the counters strip from the one source: live pulse first, the
   shared baked counters file second (its values carry their own
   provenance in the file). If neither answers, the strip keeps its
   loading glyphs and the note points at the hubs that carry the
   totals — an unloaded counter never renders as a number it does
   not know, and never as 0. */
async function fillCounters(box, note) {
  const paint = (c, source) => {
    if (!box.isConnected) return;
    /* BLINK CURE (2026-11-22): the strip's structure is already on
       the page from first paint — update the value nodes in place
       (count-up included) instead of rebuilding the box when the
       totals land. The rebuild remains only as the fallback if the
       painted structure is ever not the expected one. */
    const bs = box.querySelectorAll('.counter b');
    if (bs.length === COUNTER_LABELS.length) {
      COUNTER_LABELS.forEach(([k], i) => { bs[i].dataset.count = c[k]; countUp(bs[i], Number(c[k])); });
    } else {
      box.innerHTML = COUNTER_LABELS.map(([k, label]) => `<div class="counter"><b data-count="${c[k]}">0</b><span>${label}</span></div>`).join('');
      box.querySelectorAll('[data-count]').forEach((el) => countUp(el, Number(el.dataset.count)));
    }
    if (note) note.textContent = `Totals · one source: ${source}`;
  };
  try {
    const p = await fetchJSON(`${API}/api/community/pulse`);
    const c = { members: p.members, testimonies: p.testimonies, requests: p.prayerRequests, lifted: p.prayersLifted };
    if (!Object.values(c).every((n) => Number.isFinite(n))) throw new Error('unexpected pulse payload');
    paint(c, 'live production API · GET /api/community/pulse');
  } catch {
    try {
      const d = await fetchJSON('assets/data/pray/counters.json');
      const c = { members: d.members, testimonies: d.testimonies, requests: d.requests, lifted: d.lifted };
      if (!Object.values(c).every((n) => Number.isFinite(n))) throw new Error('unexpected counters payload');
      paint(c, `snapshot ${d.asOf} (production API unreachable from this network)`);
    } catch {
      if (note && note.isConnected) note.textContent = 'The house totals live in the Prayer Room and The Sanctuary — one tap away.';
    }
  }
}

const HW_STYLE = `<style>
/* SITE-WIDE AI INTENSITY (2026-11-23, consult chatcmpl-EnXUONbVHMo4IMZGg0P2PVyM96dHg):
   Today's Word opens as a pictured world — dedicated dawn-Bible art as the
   card's side (NEW art; word-slide.webp already rides the slider + Read's
   film poster, and the no-repeat law bars a third use). The pastor card's
   TEXT side carries a faint cinematic crowd backdrop under a heavy dark
   wash — atmosphere around the REAL photo, never over it. */
.hw-card{margin-top:38px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(160deg,#141105,#0a0a0a 55%);padding:0;overflow:hidden;display:grid;grid-template-columns:1fr}
.hw-art{width:100%;height:190px;object-fit:cover;display:block}
.hw-main{padding:24px 28px 26px}
@media(min-width:861px){.hw-card{grid-template-columns:38% 1fr}.hw-art{height:100%;min-height:280px}}
section.pastor{box-shadow:0 0 0 1px rgba(212,175,55,.12),0 18px 50px rgba(0,0,0,.55)}
.pastor .pastor-body{background:linear-gradient(100deg,rgba(10,9,5,.93),rgba(10,9,5,.86) 60%,rgba(10,9,5,.78)),url('assets/video/concert-crowd-poster.webp') center 30%/cover no-repeat}
.hw-meta{font-size:12px;color:var(--mute);letter-spacing:.06em}
.hw-title{margin-top:8px}
.hw-quote{border-left:2px solid var(--gold);padding:6px 0 6px 16px;font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.6;margin-top:14px}
.hw-note{color:var(--mute);line-height:1.6;font-size:15px}
.hw-btn{margin-top:18px;background:transparent;border:1px solid var(--gold);color:var(--gold-hi);border-radius:999px;padding:9px 18px;font-size:13.5px;cursor:pointer}
.hw-btn:hover{background:rgba(212,175,55,.08)}
.counters-note{color:var(--mute);font-size:12.5px;line-height:1.5;margin-top:10px}
/* ---------- PHASE 2A: SLIDER + SHOWCASE + MOTION SYSTEM (home scope) ----
   Transform/opacity only. The slider reuses the .hero frame dimensions;
   slides crossfade (consult rank #1), active-slide type slides in,
   showcase art drifts with a slow Ken Burns (rank #4, sparing, slower
   than the slider per consult (c)). Reduced motion: everything static. */
.hslider{position:relative;border:1px solid rgba(212,175,55,.35);border-radius:20px;overflow:hidden;background:#000;height:min(44vh,440px);min-height:300px}
@media(min-width:861px){.hslider{height:min(54vh,520px)}}
.hslide{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;background:#000;color:var(--bone);text-align:left;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .9s ease}
.hslide.on{opacity:1;pointer-events:auto}
.hslide-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hslide.on .hslide-img{animation:hkenburns 16s ease-in-out infinite alternate}
/* PHASE 2B (CP-E2): the hero loop — a real cinematic video layer over
   the still photo (the photo is first paint + the reduced-motion
   face). The video fades in when it can play; only the active
   slide's video runs (startSlider drives play/pause). */
.hslide-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .9s ease;pointer-events:none}
.hslide-vid.on{opacity:1}
.hslide.on .hslide-vid{animation:hkenburns 16s ease-in-out infinite alternate}
.showcard-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:hkenburns 22s ease-in-out infinite alternate}
@keyframes hkenburns{from{transform:scale(1)}to{transform:scale(1.07)}}
.hslide-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.42),rgba(5,5,5,0) 32%,rgba(5,5,5,0) 42%,rgba(5,5,5,.9))}
.hslide-type{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;padding:20px 22px 60px}
@media(min-width:861px){.hslide-type{padding:26px 30px 60px}}
.hslide.on .hslide-in{animation:hslidein .8s ease both}
@keyframes hslidein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.hslide-kicker{font-size:11px;letter-spacing:.3em;color:var(--gold-hi);text-transform:uppercase}
.hslide-head{font-family:var(--serif);font-size:clamp(26px,6.4vw,44px);line-height:1.12;text-shadow:0 2px 24px rgba(0,0,0,.65);margin-top:8px}
.hslide-head .gold{color:var(--gold)}
.hslide-line{margin-top:8px;font-size:15px;color:var(--bone);line-height:1.5;max-width:34em}
.hslide-cta{margin-top:12px;display:inline-block;font-size:12px;letter-spacing:.22em;color:var(--gold-hi);text-transform:uppercase}
.hslider-ui{position:absolute;right:16px;bottom:14px;display:flex;align-items:center;gap:10px;z-index:3}
.hdots{display:flex;gap:7px}
.hdot{width:8px;height:8px;border-radius:99px;border:1px solid rgba(212,175,55,.7);background:transparent;padding:0;cursor:pointer;transition:all .3s ease}
.hdot.on{width:22px;background:var(--gold)}
.hpause{background:rgba(5,5,5,.55);border:1px solid rgba(212,175,55,.5);color:var(--gold-hi);border-radius:999px;font-size:10.5px;letter-spacing:.18em;padding:6px 11px;cursor:pointer;text-transform:uppercase}
.showcase{margin-top:26px}
.showcase-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.showcase-row{display:flex;gap:12px;overflow-x:auto;padding:14px 2px 8px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
@media(min-width:861px){.showcase-row{display:grid;grid-template-columns:repeat(4,1fr);overflow:visible}}
.showcard{position:relative;flex:0 0 72%;scroll-snap-align:start;height:300px;border:1px solid rgba(212,175,55,.35);border-radius:18px;overflow:hidden;background:#000;color:var(--bone);text-align:left;padding:0;cursor:pointer}
@media(min-width:861px){.showcard{flex:none;height:340px}}
.showcard-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:hkenburns 22s ease-in-out infinite alternate}
.showcard-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.18),rgba(5,5,5,0) 40%,rgba(5,5,5,.92))}
.showcard-type{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:16px}
.showcard-chip{align-self:flex-start;font-size:10px;letter-spacing:.26em;color:#050505;background:var(--gold);border-radius:999px;padding:4px 9px;text-transform:uppercase;font-weight:700}
.showcard-title{font-family:var(--serif);font-size:21px;line-height:1.2;margin-top:10px;text-shadow:0 2px 14px rgba(0,0,0,.7)}
.showcard-sub{font-size:13px;color:var(--bone);line-height:1.45;margin-top:5px;opacity:.92}
.motion .reveal{opacity:0;transform:translateY(14px);transition:opacity .7s ease,transform .7s ease}
.motion .reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion: reduce){
  .hslide{transition:none}
  .hslide.on .hslide-img,.showcard-img,.showcard-vid,.hslide.on .hslide-vid{animation:none}
  .hslide.on .hslide-in{animation:none}
  .motion .reveal{opacity:1;transform:none;transition:none}
}
</style>`;

function hwFallback(body) {
  body.innerHTML = `
    <p class="hw-note">Today's word lives in the Read hub — one tap away.</p>
    <button class="hw-btn" type="button" data-hw-open>Open the Read hub →</button>`;
  body.querySelector('[data-hw-open]').addEventListener('click', () => { location.hash = '#/read'; });
}

/* Fill the Today's Word section from the shared devotional data (the same
   file + selection READ's Today's Word door uses). Runs after the face is
   painted so the selector never waits on data (§4 no-lag). */
async function fillTodaysWord(body) {
  try {
    const r = await fetch('assets/data/read/devotionals.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const entries = Array.isArray(d.entries) ? d.entries : [];
    const e = entries.filter((x) => x.date <= todayISO()).sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;
    if (!body.isConnected) return; // visitor already moved on — nothing to fill
    if (!e) { hwFallback(body); return; }
    const dstr = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    body.innerHTML = `
      <p class="hw-meta">${esc(dstr.toUpperCase())}</p>
      <h2 class="hw-title" data-testid="home-word-title">${esc(e.title.toUpperCase())}</h2>
      <p class="hw-meta" style="margin-top:6px">${esc(e.reference)}</p>
      <div class="hw-quote" data-testid="home-word-verse">“${esc(e.verse)}”</div>
      <button class="hw-btn" type="button" data-hw-open>Read today's word in the Read hub →</button>`;
    body.querySelector('[data-hw-open]').addEventListener('click', () => { location.hash = '#/read'; });
  } catch {
    if (body.isConnected) hwFallback(body);
  }
}

/* ---------- PHASE 2A: slider + showcase data legs ----------
   Each leg is independent: it returns a built element or null, and a
   null simply never enters the rotation/row. Selections are
   deterministic (daily rotation) so every visitor sees the same
   featured house on a given day. */
const dayIndex = () => Math.floor(Date.now() / 86400000);

function pickWord(devo) {
  const entries = Array.isArray(devo?.entries) ? devo.entries : [];
  return entries.filter((x) => x.date <= todayISO()).sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;
}
/* ONE-RULER CURE (2026-11-23, PLAYABLE-COUNT-ADJUDICATION): the one
   visitor ruler is ROWS THAT PLAY — playableRows + morePlayable.
   The pool field a.playable (unique recordings) renders nowhere as
   a playable count. Same helper as hubs/listen.js. */
const rowsPlayable = (a) => (a.playableRows || 0) + (a.morePlayable || 0);
function pickArtists(listen) {
  const eligible = (listen?.artists || []).filter((a) => a.art && rowsPlayable(a) > 0);
  if (!eligible.length) return [null, null];
  const i = dayIndex() % eligible.length;
  return [eligible[i], eligible[(i + 1) % eligible.length]];
}
function pickTestimonies(feed) {
  const ts = (feed?.posts || []).filter((p) => p.type === 'testimony')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const member = ts.filter((p) => !/^(official_|system_)/.test(p.authorId || ''));
  return [member[0] || ts[0] || null, member[1] || null];
}
function pickFilms(watch) {
  const titles = watch?.titles || [];
  const hero = titles.find((t) => t.id === watch?.heroId && t.poster) || null;
  const ids = Array.isArray(watch?.featuredIds) ? watch.featuredIds : [];
  const second = ids.map((id) => titles.find((t) => t.id === id)).find((t) => t && t.poster && t.id !== watch?.heroId) || null;
  return [hero, second];
}

function slideEl({ img, alt, kicker, head, line, cta, hub }) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'hslide';
  b.dataset.hub = hub;
  b.setAttribute('aria-label', `${kicker}: ${excerpt(head.replace(/<[^>]+>/g, ''), 60)}`);
  b.innerHTML = `
    <img class="hslide-img" src="${esc(img)}" alt="${esc(alt)}" loading="lazy">
    <span class="hslide-shade"></span>
    <span class="hslide-type">
      <span class="hero-mark">16:3 <b>FAITH</b></span>
      <span class="hslide-in">
        <span class="hslide-kicker">${esc(kicker)}</span>
        <span class="hslide-head" style="display:block">${head}</span>
        ${line ? `<span class="hslide-line" style="display:block">${esc(line)}</span>` : ''}
        <span class="hslide-cta">${esc(cta)} →</span>
      </span>
    </span>`;
  b.addEventListener('click', () => { location.hash = `#/${hub}`; });
  return b;
}

function startSlider(box) {
  const slides = [...box.querySelectorAll('.hslide')];
  const dotsBox = box.querySelector('[data-hdots]');
  const pauseBtn = box.querySelector('[data-hpause]');
  if (!slides.length) return;
  dotsBox.innerHTML = slides.map((s, i) => `<button type="button" class="hdot${i === 0 ? ' on' : ''}" data-hdot="${i}" aria-label="Show slide ${i + 1}"></button>`).join('');
  let cur = 0, timer = null, paused = false;
  const go = (i) => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('on', j === cur));
    /* CP-E2: only the active slide's loop runs. */
    slides.forEach((s, j) => {
      const v = s.querySelector('video.hslide-vid');
      if (!v) return;
      if (j === cur && !document.hidden) v.play().catch(() => {}); else v.pause();
    });
    dotsBox.querySelectorAll('.hdot').forEach((d, j) => d.classList.toggle('on', j === cur));
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  let resumeTimer = null;
  const play = () => {
    if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    stop();
    if (REDUCED || paused || slides.length < 2) return;
    timer = setInterval(() => {
      if (!box.isConnected || document.hidden) { if (!box.isConnected) stop(); return; }
      go(cur + 1);
    }, 5000);
  };
  /* Phase 2B live-walk cure (2026-11-22): a pointerdown used to stop
     the rotation with pointerleave as the ONLY way back — a pointer
     (or touch) that comes down on the slider and never leaves it
     parked the rotation dead for the whole visit (the live walk sat
     ~5 minutes without an advance on exactly this). Interaction now
     pauses briefly and the rotation resumes on its own after an idle
     beat; play() still honors the explicit Pause button via `paused`. */
  const idleResume = () => {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { resumeTimer = null; play(); }, 10000);
  };
  dotsBox.querySelectorAll('[data-hdot]').forEach((d) => d.addEventListener('click', (e) => {
    e.stopPropagation(); go(Number(d.dataset.hdot)); play();
  }));
  if (slides.length < 2) { pauseBtn.hidden = true; return; }
  pauseBtn.hidden = false;
  pauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    paused = !paused;
    pauseBtn.textContent = paused ? 'Play' : 'Pause';
    if (paused) stop(); else play();
  });
  box.addEventListener('pointerdown', () => { stop(); idleResume(); });
  box.addEventListener('pointerleave', () => play());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stop(); box.querySelectorAll('video.hslide-vid').forEach((v) => v.pause()); }
    else { play(); go(cur); }
  });
  play();
}

/* Build slides 2–5 (consult order: word → artist → testimony → film)
   and the showcase row from the carried data. Runs after first paint;
   the hero slide is already on screen. */
async function fillShowcase(sliderBox, showBox) {
  const [devo, listen, feed, watch] = await Promise.all([
    fetchJSON('assets/data/read/devotionals.json').catch(() => null),
    fetchJSON('assets/data/listen-index.json').catch(() => null),
    fetchJSON('assets/data/community/feed.json').catch(() => null),
    fetchJSON('assets/data/watch.json').catch(() => null),
  ]);
  if (!sliderBox.isConnected) return;
  const word = pickWord(devo);
  const [artist, artist2] = pickArtists(listen);
  const [testimony, testimony2] = pickTestimonies(feed);
  const [film, film2] = pickFilms(watch);

  const slides = [];
  if (word) slides.push(slideEl({
    img: 'assets/img/home/word-slide.webp', alt: 'An open Bible on a wooden table in golden sanctuary light',
    kicker: "Today's Word — Read", head: esc(word.title), line: `“${excerpt(word.verse, 150)}” — ${word.reference} (KJV)`,
    cta: 'Read the Word', hub: 'read',
  }));
  if (artist) slides.push(slideEl({
    img: artist.art, alt: `${artist.name} — official album artwork`,
    kicker: 'Featured Artist — Listen', head: esc(artist.name),
    line: `${artist.releases} releases · ${artist.songs} songs · ${rowsPlayable(artist)} playable — full songs, grouped by album.`,
    cta: 'Open Listen', hub: 'listen',
  }));
  if (testimony) slides.push(slideEl({
    img: testimony.authorAvatar || 'assets/img/home/testimony-slide.webp', alt: 'The congregation in worship — raised hands in golden sanctuary light',
    kicker: 'Newest Testimony — The Wall', head: esc(testimony.authorName || 'A member of the house'),
    line: excerpt(testimony.body, 180), cta: 'Visit the Community', hub: 'community',
  }));
  if (film) slides.push(slideEl({
    img: film.poster, alt: `${film.title} — poster`,
    kicker: 'Featured Film — Watch', head: esc(film.title),
    line: excerpt(film.description, 150), cta: 'Open Watch', hub: 'watch',
  }));
  slides.forEach((s) => sliderBox.insertBefore(s, sliderBox.querySelector('.hslider-ui')));
  startSlider(sliderBox);

  /* Showcase row — cinematic cards, slower Ken Burns than the slider,
     picks offset from the slider's so the row never repeats it. */
  const cards = [];
  /* CP-E2 cure: the showcase face is the hub's cinematic LOOP
     (atmosphere) — the chip/title/sub still name the real pick, and
     the pick's own posters/covers live untouched inside its hub.
     The loop's poster is the still face (and the reduced-motion
     face); no image repeats anywhere on the home face anymore. */
  const card = ({ chip, title, sub, hub }) => `
    <button class="showcard gold-frame" type="button" data-showhub="${hub}" aria-label="${esc(chip)}: ${esc(title)}">
      <img class="showcard-img" src="assets/video/loop-${hub}-poster.webp" alt="" aria-hidden="true" loading="lazy">
      ${REDUCED ? '' : `<video class="showcard-vid" muted loop playsinline autoplay preload="metadata" poster="assets/video/loop-${hub}-poster.webp" aria-hidden="true"><source src="assets/video/loop-${hub}.mp4" type="video/mp4"></video>`}
      <span class="glow-sweep" aria-hidden="true"></span>
      <span class="showcard-shade"></span>
      <span class="showcard-type">
        <span class="showcard-chip">${esc(chip)}</span>
        <span class="showcard-title">${esc(title)}</span>
        ${sub ? `<span class="showcard-sub">${esc(sub)}</span>` : ''}
      </span>
    </button>`;
  if (film2) cards.push(card({ img: film2.poster, alt: `${film2.title} — poster`, chip: 'Watch', title: film2.title, sub: excerpt(film2.description, 90), hub: 'watch' }));
  if (artist2) cards.push(card({ img: artist2.art, alt: `${artist2.name} — official album artwork`, chip: 'Listen', title: artist2.name, sub: `${artist2.releases} releases · ${rowsPlayable(artist2)} playable`, hub: 'listen' }));
  if (testimony2) cards.push(card({ img: 'assets/img/home/tile-community.webp', alt: 'Friends laughing together around a shared table of food', chip: 'Community', title: testimony2.authorName || 'From the wall', sub: excerpt(testimony2.body, 90), hub: 'community' }));
  if (word) cards.push(card({ img: 'assets/img/home/tile-read.webp', alt: 'A young woman with long braids reading an open book in warm window light', chip: 'Read', title: word.title, sub: `${word.reference} (KJV)`, hub: 'read' }));
  if (cards.length >= 2 && showBox.isConnected) {
    showBox.innerHTML = `
      <div class="showcase-head"><p class="kicker">Showcase</p><p class="hw-meta">Living cards — every one a door</p></div>
      <div class="showcase-row">${cards.join('')}</div>`;
    showBox.hidden = false;
    showBox.querySelectorAll('[data-showhub]').forEach((el) => el.addEventListener('click', () => { location.hash = `#/${el.dataset.showhub}`; }));
    /* CP-E2: showcase loops play only while their card is on screen. */
    if (!REDUCED && typeof IntersectionObserver === 'function') {
      const vio = new IntersectionObserver((es) => es.forEach((e) => {
        const v = e.target.querySelector('video.showcard-vid'); if (!v) return;
        if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
      }), { threshold: 0.2 });
      showBox.querySelectorAll('.showcard').forEach((c) => vio.observe(c));
    }
  }
}

/* Entrance reveals (motion system): sections rise in once, as they
   enter the viewport. Under reduced motion the CSS keeps everything
   visible and this observer is never armed. */
function armReveals(root) {
  if (REDUCED || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 });
  root.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

export function render(root, { navigate }) {
  root.innerHTML = `
    ${HW_STYLE}
    <div class="${REDUCED ? '' : 'motion'}">
    <section class="hslider gold-frame" data-hslider aria-roledescription="carousel" aria-label="Featured in the house">
      <button type="button" class="hslide on" data-hub="home" aria-label="16:3 Faith — the house">
        <img class="hslide-img" src="assets/img/home/hero-movement.webp" alt="Five friends laughing together on a city street at night, in black streetwear with gold trim" fetchpriority="high">
        ${REDUCED ? '' : `<video class="hslide-vid" muted loop playsinline autoplay preload="metadata" poster="assets/video/loop-hero-poster.webp" aria-hidden="true" oncanplay="this.classList.add('on')"><source src="assets/video/loop-hero.mp4" type="video/mp4"></video>`}
        <span class="glow-sweep" aria-hidden="true"></span>
        <span class="hslide-shade"></span>
        <span class="hslide-type">
          <span class="hero-mark">16:3 <b>FAITH</b></span>
          <span class="hslide-in">
            <span class="hslide-head" style="display:block">FAITH HAS A <span class="gold">NEW SOUND.</span></span>
            <span class="hslide-line" style="display:block">One faith. Many voices. A place to belong.</span>
          </span>
        </span>
      </button>
      <div class="hslider-ui">
        <div class="hdots" data-hdots></div>
        <button type="button" class="hpause" data-hpause hidden>Pause</button>
      </div>
    </section>

    <section class="showcase reveal" data-showcase hidden></section>

    <div class="hubgrid reveal">
      ${TILES.map((t) => `
        <button class="tile${t.wide ? ' wide' : ''}" type="button" data-hub="${t.hub}">
          <img class="tile-img" src="${t.img}" alt="${esc(t.alt)}" loading="lazy">
          <span class="glow-sweep" aria-hidden="true"></span>
          <span class="tile-shade"></span>
          <span class="tile-num">${t.num}</span>
          <span class="tile-name"><h3>${t.name}</h3><p>${t.blurb}</p></span>
        </button>`).join('')}
    </div>

    <section class="hw-card reveal" id="todays-word" data-testid="home-todays-word">
      <img class="hw-art" src="assets/img/home/word-card.webp" alt="" aria-hidden="true" loading="lazy">
      <div class="hw-main">
      <p class="kicker">Today's Word</p>
      <div data-hw-body><p class="hw-note">Loading today's word…</p></div>
      </div>
    </section>

    <div class="counters reveal" data-counters>${COUNTER_LABELS.map(([, label]) => `<div class="counter"><b>…</b><span>${label}</span></div>`).join('')}</div>
    <p class="counters-note" data-counters-note>Loading the house totals…</p>

    <section class="pastor reveal" id="meet-the-pastor">
      <div class="pastor-photo">
        <span class="mono">JM</span>
        <img src="assets/img/home/pastor.webp" alt="Pastor Jeremy Mills preaching — microphone in hand, arm raised, wearing a black “It Is FINISHED” 16:3 Faith shirt" loading="lazy" onerror="this.remove()">
      </div>
      <div class="pastor-body">
        <p class="kicker">Meet the Pastor</p>
        <h2>Pastor Jeremy <span class="g">“Chico” Mills</span></h2>
        <p><b>Founder &amp; Pastor of 16:3 Faith</b> — and a USAF veteran who believes the church should sound like the future and feel like family. No suit, no tie, no distance: just the Word, the music, and a house where everybody can walk in as they are.</p>
        <p>Every hub in this house carries his conviction from Proverbs 16:3 — commit the work, and let God establish it.</p>
        <p class="pastor-sign">— Pastor Jeremy</p>
        <p style="margin-top:16px"><a class="btn-gold" href="#/pastor" style="display:inline-block;text-decoration:none">Discover more about Pastor Jeremy →</a></p>
      </div>
    </section>
    </div>`;
  root.querySelectorAll('[data-hub]').forEach((el) => {
    el.addEventListener('click', () => { location.hash = `#/${el.dataset.hub}`; });
  });
  /* The hero slide carries data-hub="home" — clicking it must not
     "navigate" anywhere (it IS the house door, already home); the
     generic handler above sets the same hash, which is a no-op. */
  fillTodaysWord(root.querySelector('[data-hw-body]'));
  fillCounters(root.querySelector('[data-counters]'), root.querySelector('[data-counters-note]'));
  fillShowcase(root.querySelector('[data-hslider]'), root.querySelector('[data-showcase]'));
  armReveals(root);
}
