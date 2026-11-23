/* WATCH (SPEC §3.1) — the cinema library, fresh build.
   Doors first (HUB BREAKDOWN LAW): doors → shelf → title detail → player.
   Data: runtime fetch of the production cinema hub FIRST
   (GET {apiBase}/api/sanctuary/cinema-hub?lang=en); the baked snapshot in
   assets/data/watch.json renders immediately and stands in whenever the live
   catalog cannot answer — no loading overlay for locally available content.
   Dedupe law (#49): by stable content ID and by normalized title across
   sources; a door view shows exactly that door's shelf. Runtime law (#25):
   listed runtime = measured play time; stream-truth overrides are data.
   Hero law (#1/#54): THE CHOSEN is a real library entry; its WATCH action
   opens its own player directly; the poster is a real in-flow <img>.
   DESIGN GRAFT (2026-11-19, founder's ChatGPT Watch package): the package's
   cinematic hero / channel chips / poster rails / movement panel language
   over THIS hub's real catalog only — no package concept titles, posters,
   or demo media anywhere. See records/WATCH-GRAFT-RECORD-2026-11-19.md.
   My List + Continue Watching are device-local shelves (labeled as such):
   the list is the visitor's own toggles; progress is recorded only where
   this device's <video> element can really measure it (never for YouTube
   iframe plays, never invented). */

const DATA_URL = new URL('../../data/watch.json', import.meta.url).href;
const OVERRIDES = { '2_Augustine': 5980000, 'ten-commandments-1923': 8172000, '14_TPP': 400000 };
const ROW_DOOR = {
  'featured-feature-films': 'faith', 'featured': 'faith', 'shorts': 'faith', 'short': 'faith',
  'bible-stories-series': 'bible', 'bible': 'bible',
  'family': 'kids', 'documentaries': 'documentaries', 'documentary': 'documentaries',
  'classics-archival': 'classics', 'classic': 'classics', 'classic-cartoons': 'classics',
  'series': 'series',
};
const SCARLET = '#ec5042'; /* house scarlet — same token as the Sanctuary graft */

let rootEl = null;
let snapshot = null;          // parsed watch.json
let catalog = [];             // merged titles (live wins over snapshot by id/title)
let doorsMeta = [];
let liveState = 'snapshot';   // 'snapshot' | 'live'
let view = { name: 'doors' }; // doors | shelf{door} | detail{id} | search{q}
let playerEl = null;
let pendingLiveRender = false;
let currentPlay = null;       // { id, video } for real progress capture

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normTitle = (t) => String(t || '').toLowerCase().replace(/[-–—]/g, ' ')
  .replace(/\(.*?\)/g, '').replace(/director['']?s cut/gi, '').replace(/\b(the|a|an)\b/g, '')
  .replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const fmtMs = (ms) => {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) return null;
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60); const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};
const runtimeOf = (t) => fmtMs(t.durationMs) || t.durationLabel || null;
const byId = (id) => catalog.find((t) => t.id === id);
const doorTitles = (slug) => catalog.filter((t) => (t.doors || [t.door]).includes(slug));
const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const myList = () => new Set(lsGet('faith163.watch.mylist', []));
const continueEntries = () => lsGet('faith163.watch.continue', []);
const continueList = () => continueEntries();
const progressOf = (id) => {
  const e = continueEntries().find((c) => c.id === id);
  return (e && typeof e.progress === 'number' && e.progress > 0.02 && e.progress < 0.98) ? e.progress : null;
};
function initials(title) {
  const w = String(title || '').replace(/^(The)\s+/i, '').split(/\s+/).filter(Boolean);
  return (w.slice(0, 2).map((x) => x[0]).join('') || '16').toUpperCase();
}
function metaLine(t) {
  const parts = [];
  if (t.year) parts.push(String(t.year));
  const rt = runtimeOf(t); if (rt) parts.push(rt);
  if (t.kind === 'series' && t.episodes) parts.push(`${t.episodes.length} episode${t.episodes.length === 1 ? '' : 's'}`);
  if (t.badge) parts.push(t.badge);
  return parts.join(' · ');
}

/* ---------- My List + Continue Watching (device-local, honestly labeled) ---------- */
let toastTimer = null;
function toast(msg) {
  let el = document.querySelector('.w-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'w-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function syncSaveButtons() {
  if (!rootEl) return;
  const set = myList();
  rootEl.querySelectorAll('[data-mylist-toggle]').forEach((b) => {
    const id = b.dataset.mylistToggle;
    const on = set.has(id);
    const t = byId(id);
    b.classList.toggle('saved', on);
    if (b.classList.contains('w-save') || b.classList.contains('w-hero-save')) b.textContent = on ? '✓' : '+';
    if (b.classList.contains('w-detail-save')) b.textContent = on ? '✓ In My List' : '+ My List';
    b.setAttribute('aria-label', `${on ? 'Remove' : 'Add'} ${t ? t.title : id} ${on ? 'from' : 'to'} My List`);
  });
}
function toggleMyList(id) {
  const set = myList();
  const adding = !set.has(id);
  if (adding) set.add(id); else set.delete(id);
  lsSet('faith163.watch.mylist', [...set]);
  toast(adding ? 'Added to My List — saved on this device' : 'Removed from My List');
  if (view.name === 'doors') renderView(true);
  else syncSaveButtons();
}
function rememberContinue(t) {
  const prev = continueEntries().find((c) => c.id === t.id);
  const list = continueEntries().filter((c) => c.id !== t.id);
  list.unshift({ id: t.id, at: Date.now(), ...(prev && typeof prev.progress === 'number' ? { progress: prev.progress } : {}) });
  lsSet('faith163.watch.continue', list.slice(0, 12));
}
let progMark = { id: null, val: -1 };
function recordProgress(id, frac) {
  if (!id || !Number.isFinite(frac)) return;
  if (frac < 0.98 && progMark.id === id && Math.abs(frac - progMark.val) < 0.02) return;
  progMark = { id, val: frac };
  let list = continueEntries();
  if (frac >= 0.98) list = list.filter((c) => c.id !== id);
  else { const e = list.find((c) => c.id === id); if (e) e.progress = frac; }
  lsSet('faith163.watch.continue', list);
}
/* Real progress only: wired to <video> plays (archive mp4 + resolved JFP
   streams). YouTube iframe plays expose no position to us — those titles
   join Continue Watching with no bar and no resume, never a fake number.
   Episode plays join the shelf at title level but carry no single-position
   progress (a series has no one honest position). */
function trackVideo(video, t, episode) {
  if (!video || !t || episode) return;
  currentPlay = { id: t.id, video };
  const saved = progressOf(t.id);
  if (saved != null) {
    video.addEventListener('loadedmetadata', () => {
      try { if (video.duration && Number.isFinite(video.duration)) video.currentTime = saved * video.duration; } catch { /* stream refused the seek */ }
    }, { once: true });
  }
  video.addEventListener('timeupdate', () => {
    if (video.duration && Number.isFinite(video.duration) && video.duration > 0) {
      recordProgress(t.id, video.currentTime / video.duration);
    }
  });
  video.addEventListener('ended', () => recordProgress(t.id, 1));
}

/* ---------- styles (hub-owned; shell.css is the coordinator's) ---------- */
function ensureStyle() {
  if (document.getElementById('watch-style')) return;
  const st = document.createElement('style');
  st.id = 'watch-style';
  st.textContent = `
  /* hero — the package's cinematic feature treatment over the real poster */
  .w-hero{position:relative;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#171204,#0a0a0a 65%);margin-top:18px;min-height:470px;display:flex}
  .w-hero img[data-hero-poster]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 22%;display:block}
  .w-hero .w-hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,5,.97) 0%,rgba(5,5,5,.93) 34%,rgba(5,5,5,.45) 68%,rgba(5,5,5,.18) 100%),linear-gradient(0deg,rgba(5,5,5,.96) 0%,transparent 34%,rgba(5,5,5,.10) 80%)}
  .w-hero .w-hero-grain{position:absolute;inset:0;pointer-events:none;opacity:.16;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.77' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.11'/%3E%3C/svg%3E")}
  .w-hero .w-hero-body{position:relative;z-index:2;align-self:flex-end;padding:30px 34px 58px;max-width:640px;width:100%}
  .w-hero.w-hero-noposter img[data-hero-poster]{display:none}
  .w-hero.w-hero-noposter .w-hero-shade{display:none}
  .w-hero.w-hero-noposter{display:block;min-height:0}
  .w-hero.w-hero-noposter .w-hero-body{padding-bottom:30px}
  .w-kicker-row{display:flex;align-items:center;gap:10px;font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:#d7c191;font-weight:700;margin-bottom:20px}
  .w-kicker-row .w-mini-line{height:2px;width:24px;background:${SCARLET};flex:none}
  .w-kicker-row .w-kicker-dot{color:${SCARLET};font-size:8px}
  .w-hero-eyebrow{font-size:11px;letter-spacing:.3em;font-weight:800;color:#ddd3b7;text-transform:uppercase;margin-bottom:8px}
  .w-hero-eyebrow .g{color:var(--gold)}
  .w-hero h2{font-family:var(--sans);font-weight:900;font-size:clamp(46px,7.5vw,84px);line-height:.92;letter-spacing:-.02em;text-transform:uppercase;color:#f9f8f1;margin:0}
  .w-hero h2 .g{color:var(--gold)}
  .w-hero-facts{display:flex;align-items:center;gap:11px;flex-wrap:wrap;font-size:12.5px;color:#d2cfc6;font-weight:600;margin-top:18px}
  .w-fact-chip{background:${SCARLET};color:#fff;padding:5px 8px;font-size:9.5px;letter-spacing:.14em;font-weight:800;text-transform:uppercase;border-radius:2px}
  .w-hero p.w-hero-desc{color:#d8d5cc;font-size:15.5px;line-height:1.65;max-width:520px;margin:16px 0 0}
  .w-hero-actions{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-top:24px}
  .w-btn-frost{background:rgba(242,240,229,.12);color:#f9f6ee;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:13px 26px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;backdrop-filter:blur(4px)}
  .w-btn-frost:hover{border-color:var(--gold)}
  .w-hero-save{width:48px;height:48px;padding:0;border-radius:50%;background:rgba(11,11,11,.78);border:1px solid rgba(170,164,156,.55);color:#fff;font-size:26px;font-weight:300;line-height:1;flex:none}
  .w-hero-save.saved{background:var(--gold);color:#17110b;border-color:var(--gold)}
  .w-hero-note{margin-top:16px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#b4a794}
  .w-hero-bottom{position:absolute;left:34px;right:34px;bottom:18px;z-index:2;display:flex;align-items:center;justify-content:space-between;font-size:10px;letter-spacing:.2em;color:#d9ba74;font-weight:800;text-transform:uppercase}
  .w-hero.w-hero-noposter .w-hero-bottom{display:none}
  /* browse heading + door chips */
  .w-browse-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:30px}
  .w-browse-head .w-invite{font-size:12.5px;color:var(--mute);max-width:290px;text-align:right;padding-bottom:6px;line-height:1.55}
  .w-chips-label{font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);font-weight:700;margin:20px 0 10px}
  .w-chips{display:flex;gap:9px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px}
  .w-chips::-webkit-scrollbar{display:none}
  .w-chip{flex:none;background:#131313;border:1px solid #393630;padding:11px 16px;color:#c4c1b9;font-weight:700;white-space:nowrap;border-radius:6px;font-size:12.5px;transition:border-color .2s,background .2s,color .2s}
  .w-chip:hover{background:#322717;color:var(--gold-hi);border-color:var(--gold-dim)}
  .w-chip .w-chip-n{font-size:10px;background:#302714;padding:2px 7px;border-radius:20px;color:var(--gold);margin-left:8px;font-weight:800}
  /* poster rails */
  .w-rail{margin-top:30px}
  .w-rail-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:14px}
  .w-rail-head .w-rail-group{display:flex;align-items:baseline;gap:12px;min-width:0}
  .w-rail-head h3{font-family:var(--sans);font-size:21px;font-weight:900;letter-spacing:-.01em;margin:0;color:var(--bone);display:flex;align-items:center}
  .w-bar{width:3px;height:19px;display:inline-block;background:${SCARLET};margin-right:11px;flex:none;align-self:center}
  .w-rail-title-btn{background:none;border:none;padding:0;color:inherit;font:inherit;cursor:pointer;text-align:left}
  .w-rail-title-btn:hover{color:var(--gold-hi)}
  .w-rail-note{font-size:11.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .w-arrows{display:flex;gap:7px;flex:none}
  .w-rail-arrow{border:1px solid #40392b;background:#161514;border-radius:50%;color:var(--gold);width:32px;height:32px;font-size:18px;line-height:1}
  .w-rail-arrow:hover{border-color:var(--gold);background:#2a2315}
  .w-rail-track{display:flex;gap:13px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px 3px 8px}
  .w-rail-track::-webkit-scrollbar{display:none}
  .w-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:16px 13px}
  @media(min-width:861px){.w-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}}
  /* landscape poster cards */
  .wcard2{position:relative;scroll-snap-align:start;min-width:0}
  .w-rail-track .wcard2{flex:0 0 clamp(228px,23vw,308px)}
  .wcard2-hit{display:block;width:100%;background:none;border:none;padding:0;text-align:left;color:var(--bone);cursor:pointer}
  .w-poster2{display:block;aspect-ratio:16/9;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:linear-gradient(150deg,rgba(212,175,55,.22),rgba(212,175,55,.03) 60%),#101010;box-shadow:0 10px 25px rgba(0,0,0,.25)}
  .w-poster2 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .32s ease}
  /* wide title graphics (JFP cinematic art runs ~2.13:1, text edge to edge):
     cover would crop the title's edges off in the 16/9 slot — those letterbox
     whole instead; standard posters keep cover, nothing is ever distorted */
  .w-poster2 img.w-fit-contain{object-fit:contain;background:#060606}
  .w-poster2.w-has-contain{background:#060606}
  .w-poster2.w-has-contain .w-mono{display:none}
  .w-poster2.w-has-contain::after{display:none}
  .wcard2:hover .w-poster2 img,.wcard2:focus-within .w-poster2 img{transform:scale(1.05)}
  .w-poster2::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,5,5,.55) 0%,transparent 55%);pointer-events:none}
  .w-poster2 .w-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:32px;color:var(--gold-dim);padding:10px;text-align:center}
  .w-flag{position:absolute;top:10px;left:10px;z-index:3;background:${SCARLET};color:#fff;font-size:9px;font-weight:800;padding:5px 8px;letter-spacing:.12em;text-transform:uppercase;border-radius:2px;max-width:85%}
  .w-flag-gold{background:#c99b29;color:#171007}
  .w-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-38%);width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:rgba(233,187,72,.92);color:#0c0c0c;font-size:14px;font-weight:900;z-index:3;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none}
  .wcard2:hover .w-play,.wcard2:focus-within .w-play{opacity:1;transform:translate(-50%,-50%)}
  .w-prog{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(70,66,58,.85);z-index:3}
  .w-prog i{display:block;height:100%;background:${SCARLET}}
  .w-meta2{display:block;padding:10px 34px 0 2px}
  .w-meta2 b{font-size:13.5px;display:block;line-height:1.35;color:var(--bone)}
  .w-meta2 span{font-size:11px;color:var(--mute);display:block;margin-top:3px;letter-spacing:.04em}
  .w-save{position:absolute;right:0;bottom:2px;background:none;border:1px solid #5b543e;color:#d9cfa9;border-radius:50%;height:27px;width:27px;font-size:19px;line-height:1;padding:0;z-index:4}
  .w-save.saved{background:var(--gold);color:#17110b;border-color:var(--gold)}
  /* movement closing panel — typographic art side (no package concept art) */
  .w-move{display:grid;grid-template-columns:.9fr 1.1fr;margin:52px 0 8px;border:1px solid #363025;border-radius:14px;overflow:hidden;background:#14120e}
  .w-artbanner{width:100%;height:190px;object-fit:cover;border-radius:14px;margin:34px 0 0;display:block}
  .w-move-art{position:relative;min-height:300px;background:radial-gradient(120% 130% at 18% 0%,#2a2110 0%,#14120e 55%);display:flex;align-items:center;justify-content:center;overflow:hidden}
  .w-move-art .w-move-big{font-family:var(--sans);font-weight:900;font-size:clamp(90px,14vw,170px);letter-spacing:-.04em;color:rgba(212,175,55,.13);line-height:1}
  .w-stamp{position:absolute;top:24px;left:26px;border:2px solid var(--gold);font-size:12px;font-weight:900;color:var(--gold);transform:rotate(-9deg);padding:7px 12px;letter-spacing:.18em;text-align:center;line-height:1.5;background:rgba(5,5,5,.35)}
  .w-move-art .w-move-side{position:absolute;bottom:20px;left:26px;font-size:10px;letter-spacing:.24em;color:#d9ba74;font-weight:800}
  .w-move-copy{padding:46px 44px 40px 34px;display:flex;flex-direction:column;justify-content:center}
  .w-move-copy h2{font-family:var(--serif);font-size:clamp(32px,3.4vw,50px);line-height:1.06;letter-spacing:-.01em;margin:12px 0 0;color:var(--bone)}
  .w-move-copy h2 em{color:var(--gold);font-style:normal}
  .w-move-copy p{font-size:14.5px;line-height:1.7;color:#bcb5a6;max-width:490px;margin:16px 0 0}
  .w-move-links{display:flex;flex-wrap:wrap;gap:24px;margin-top:22px}
  .w-move-links a{color:#f3c967;border-bottom:1px solid #9e7e38;font-size:12.5px;font-weight:800;padding-bottom:7px;text-decoration:none;letter-spacing:.06em}
  .w-move-links a:hover{color:var(--gold-hi)}
  /* detail */
  .w-back{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:9px 18px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px}
  .w-banner{aspect-ratio:16/9;border-radius:16px;overflow:hidden;border:1px solid var(--line);position:relative;background:linear-gradient(150deg,rgba(212,175,55,.25),rgba(212,175,55,.03) 60%),#0a0a0a)}
  .w-banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .w-banner .w-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:52px;color:var(--gold-dim)}
  .w-banner::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(5,5,5,.45),transparent 55%);pointer-events:none}
  .w-detail-body{margin-top:24px;max-width:760px}
  .w-meta{color:var(--mute);font-size:13.5px;letter-spacing:.06em;margin:10px 0}
  .w-meta b{color:var(--gold-hi);font-weight:600}
  .w-desc{color:var(--bone);opacity:.88;line-height:1.65;font-size:15.5px;max-width:620px}
  .w-credits{color:var(--mute);font-size:13.5px;line-height:1.6;margin-top:12px}
  .w-credits b{color:var(--bone)}
  .w-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;align-items:center}
  .w-episodes{margin-top:28px}
  .w-ep{display:flex;gap:14px;align-items:center;width:100%;text-align:left;border:1px solid var(--line);background:var(--coal);border-radius:12px;padding:12px 14px;margin-top:10px;color:var(--bone)}
  .w-ep:hover{border-color:var(--gold-dim)}
  .w-ep .w-ep-thumb{width:132px;aspect-ratio:16/9;flex:none;border-radius:6px;overflow:hidden;position:relative;background:linear-gradient(150deg,rgba(212,175,55,.22),rgba(212,175,55,.03) 60%),#101010)}
  .w-ep .w-ep-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .w-ep .w-ep-thumb .w-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:20px;color:var(--gold-dim)}
  .w-ep .w-ep-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:rgba(233,187,72,.92);color:#0c0c0c;font-size:11px;z-index:2}
  .w-ep b{font-size:14px;display:block;line-height:1.4}
  .w-ep span{font-size:12px;color:var(--mute)}
  .w-empty{border:1px dashed var(--gold-dim);border-radius:14px;padding:22px;color:var(--mute);font-size:14.5px;line-height:1.6}
  .w-empty b{color:var(--gold-hi)}
  .w-status{margin-top:26px;font-size:12px;color:var(--mute);letter-spacing:.04em}
  .w-status b{color:var(--gold-dim)}
  .w-count{color:var(--mute);font-size:13px;margin-top:4px}
  .w-toast{position:fixed;bottom:110px;left:50%;transform:translate(-50%,16px);z-index:220;background:#19150e;color:#f6e8c0;border:1px solid #947435;border-radius:8px;padding:13px 22px;box-shadow:0 14px 35px rgba(0,0,0,.75);font-size:12.5px;font-weight:700;max-width:90%;text-align:center;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}
  .w-toast.show{opacity:1;transform:translate(-50%,0)}
  /* player (unchanged mechanics — v1 surface) */
  .w-player{position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:16px}
  .w-player-box{width:min(920px,100%);background:#0a0906;border:1px solid var(--gold-dim);border-radius:16px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.7)}
  .w-player-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:16px 20px}
  .w-player-head h3{font-family:var(--serif);font-size:20px;color:var(--bone)}
  .w-player-head p{font-size:12.5px;color:var(--mute);margin-top:3px}
  .w-player-close{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);width:38px;height:38px;border-radius:50%;font-size:16px;flex:none}
  .w-stage{position:relative;aspect-ratio:16/9;background:#000}
  .w-stage img.w-stage-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .w-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}
  .w-stage video{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
  .w-stage .w-stage-msg{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;padding:24px;text-align:center;color:var(--mute);font-size:14.5px;line-height:1.6}
  .w-stage .w-stage-msg b{color:var(--gold-hi);font-family:var(--serif);font-size:18px}
  .w-player-foot{padding:13px 20px;font-size:12px;color:var(--mute);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .w-chip:focus-visible,.w-save:focus-visible,.w-hero-save:focus-visible,.wcard2-hit:focus-visible,.w-rail-arrow:focus-visible{outline:2px solid var(--gold-hi);outline-offset:3px}
  @media(max-width:760px){
    .w-hero{min-height:0;display:block}
    .w-hero img[data-hero-poster]{position:relative;height:230px}
    .w-hero .w-hero-body{padding:22px 20px 26px}
    .w-hero h2{font-size:clamp(40px,13vw,58px)}
    .w-hero-bottom{display:none}
    .w-browse-head{display:block}
    .w-browse-head .w-invite{display:none}
    .w-rail-note{display:none}
    .w-rail-track .wcard2{flex-basis:224px}
    .w-move{grid-template-columns:1fr}
    .w-move-art{min-height:170px}
    .w-move-copy{padding:26px 22px 30px}
    .w-ep .w-ep-thumb{width:96px}
    .w-toast{bottom:96px}
  }
  @media(prefers-reduced-motion:reduce){.w-poster2 img,.w-play,.w-toast{transition:none!important}}`;
  document.head.appendChild(st);
}

/* ---------- cards / rails ---------- */
function posterArt(t, prog) {
  return `<span class="w-poster2">
    <span class="w-mono" aria-hidden="true">${esc(initials(t.title))}</span>
    ${t.poster ? `<img src="${esc(t.poster)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
    ${t.badge ? `<span class="w-flag${t.kind === 'series' ? ' w-flag-gold' : ''}">${esc(t.badge)}</span>` : ''}
    <span class="w-play" aria-hidden="true">▶</span>
    ${prog != null ? `<span class="w-prog" aria-hidden="true"><i style="width:${Math.round(prog * 100)}%"></i></span>` : ''}
  </span>`;
}
function cardHtml(t, opts = {}) {
  const saved = myList().has(t.id);
  const prog = opts.progress != null ? opts.progress : null;
  return `<div class="wcard2">
    <button type="button" class="wcard2-hit" data-title-id="${esc(t.id)}" aria-label="${esc(t.title)}">
      ${posterArt(t, prog)}
      <span class="w-meta2"><b>${esc(t.title)}</b><span>${esc(metaLine(t))}</span></span>
    </button>
    <button type="button" class="w-save${saved ? ' saved' : ''}" data-mylist-toggle="${esc(t.id)}" aria-label="${saved ? 'Remove' : 'Add'} ${esc(t.title)} ${saved ? 'from' : 'to'} My List" title="My List">${saved ? '✓' : '+'}</button>
  </div>`;
}
function railHtml(key, name, note, titles, opts = {}) {
  if (!titles.length) return '';
  const trackId = `wrail-${key}`;
  return `<section class="w-rail" data-shelf="${esc(key)}">
    <div class="w-rail-head">
      <div class="w-rail-group"><h3><span class="w-bar" aria-hidden="true"></span>${opts.door
        ? `<button type="button" class="w-rail-title-btn" data-door="${esc(opts.door)}">${esc(name)}</button>`
        : esc(name)}</h3>${note ? `<span class="w-rail-note">${esc(note)}</span>` : ''}</div>
      <div class="w-arrows">
        <button type="button" class="w-rail-arrow" data-rail-arrow="${trackId}" data-way="-1" aria-label="Scroll ${esc(name)} left">‹</button>
        <button type="button" class="w-rail-arrow" data-rail-arrow="${trackId}" data-way="1" aria-label="Scroll ${esc(name)} right">›</button>
      </div>
    </div>
    <div class="w-rail-track" id="${trackId}">${titles.map((t) => cardHtml(t, opts.progress ? { progress: progressOf(t.id) } : {})).join('')}</div>
  </section>`;
}
function gridShelfHtml(key, titles, emptyName) {
  return `<div class="shelf" data-shelf="${esc(key)}">
    ${titles.length ? `<div class="w-grid">${titles.map((t) => cardHtml(t)).join('')}</div>`
      : `<div class="w-empty"><b>${esc(emptyName)} is on its way.</b><br>These titles live in the live Faith catalog and appear here the moment the library connects. Nothing has been invented to fill the shelf.</div>`}
  </div>`;
}
/* Art-fit rule: an image clearly wider than the 16/9 card slot (>= 2:1 —
   the JFP cinematic title graphics) letterboxes whole via contain, so a
   title is never cropped illegible; everything else keeps cover. */
function bindArtFit(scope) {
  scope.querySelectorAll('.w-poster2 img').forEach((img) => {
    const apply = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0 && img.naturalWidth / img.naturalHeight >= 2) {
        img.classList.add('w-fit-contain');
        img.closest('.w-poster2')?.classList.add('w-has-contain');
      }
    };
    if (img.complete && img.naturalWidth > 0) apply();
    else img.addEventListener('load', apply, { once: true });
  });
}
function bindCards(scope) {
  bindArtFit(scope);
  scope.querySelectorAll('[data-title-id]').forEach((el) => {
    el.addEventListener('click', () => { view = { name: 'detail', id: el.dataset.titleId }; renderView(); });
  });
  scope.querySelectorAll('[data-mylist-toggle]').forEach((el) => {
    el.addEventListener('click', () => toggleMyList(el.dataset.mylistToggle));
  });
  scope.querySelectorAll('[data-rail-arrow]').forEach((el) => {
    el.addEventListener('click', () => {
      const track = document.getElementById(el.dataset.railArrow);
      if (track) track.scrollBy({ left: Number(el.dataset.way) * track.clientWidth * 0.8, behavior: 'smooth' });
    });
  });
  scope.querySelectorAll('[data-door]').forEach((el) => {
    el.addEventListener('click', () => { view = { name: 'shelf', door: el.dataset.door }; renderView(); });
  });
}

/* ---------- views ---------- */
function heroTitleHtml(title) {
  const words = String(title || '').split(/\s+/).filter(Boolean);
  if (words.length < 2) return esc(title);
  const last = words.pop();
  return `${esc(words.join(' '))} <span class="g">${esc(last)}</span>`;
}
function renderDoors() {
  /* The hero is the snapshot's CURATED feature entry, resolved from the
     snapshot itself — never from the merged catalog. A live entry that
     collides with the hero's id/title would otherwise silently replace
     it with a normalized film (no episodes, no note, kind 'film') and the
     graft's eyebrow/facts would fall with it; the curated entry stands in
     both modes. */
  const heroRaw = (snapshot.titles || []).find((t) => t.id === snapshot.heroId);
  const hero = heroRaw ? { ...heroRaw, durationMs: OVERRIDES[heroRaw.id] ?? heroRaw.durationMs }
    : (byId(snapshot.heroId) || catalog[0]);
  const featured = (snapshot.featuredIds || []).map(byId).filter(Boolean);
  const cont = continueEntries().map((c) => byId(c.id)).filter(Boolean);
  const mine = [...myList()].map(byId).filter(Boolean);
  const doors = doorsMeta.filter((d) => d.slug === 'documentaries' || d.slug === 'faith' || d.slug === 'bible'
    || d.slug === 'classics' || d.slug === 'series' || doorTitles(d.slug).length > 0);
  const heroSaved = hero ? myList().has(hero.id) : false;
  const heroDoor = hero ? (doorsMeta.find((d) => d.slug === hero.door) || {}) : {};
  rootEl.innerHTML = `
  <section data-view="doors">
    ${window.FaithFilm ? window.FaithFilm.slotHtml({ poster: 'assets/img/watch/watch-header.webp', title: 'Stories that stay with you.', note: 'Watch film · in production' }) : ''}
    ${hero ? `<div class="w-hero" data-hero>
      <img data-hero-poster src="${esc(hero.poster || '')}" alt="${esc(hero.title)}" onerror="this.closest('[data-hero]').classList.add('w-hero-noposter')">
      <div class="w-hero-shade"></div>
      <div class="w-hero-grain" aria-hidden="true"></div>
      <div class="w-hero-body">
        <div class="w-kicker-row"><span class="w-mini-line" aria-hidden="true"></span>THE FEATURED SCREENING <span class="w-kicker-dot" aria-hidden="true">◆</span> STORIES THAT STAY WITH YOU</div>
        <div class="w-hero-eyebrow">16:3 FAITH PRESENTS <span class="g">/</span> FEATURED ${hero.kind === 'series' ? 'SERIES' : 'FILM'}</div>
        <h2>${heroTitleHtml(hero.title)}</h2>
        <div class="w-hero-facts">
          ${hero.badge ? `<span class="w-fact-chip">${esc(hero.badge)}</span>` : ''}
          ${!hero.badge || hero.badge.toLowerCase() !== (hero.kind === 'series' ? 'series' : 'film') ? `<span>${hero.kind === 'series' ? 'Series' : 'Film'}</span>` : ''}
          ${runtimeOf(hero) ? `<span>•</span><span>${esc(runtimeOf(hero))}</span>` : ''}
          ${heroDoor.name && heroDoor.name.toLowerCase() !== hero.kind ? `<span>•</span><span>${esc(heroDoor.name)}</span>` : ''}
        </div>
        ${hero.description ? `<p class="w-hero-desc">${esc(hero.description)}</p>` : ''}
        <div class="w-hero-actions">
          <button type="button" class="btn-gold" data-watch-hero data-title-id-hero="${esc(hero.id)}">▶ Watch now</button>
          <button type="button" class="w-btn-frost" data-hero-info="${esc(hero.id)}">ⓘ More Info</button>
          <button type="button" class="w-hero-save${heroSaved ? ' saved' : ''}" data-mylist-toggle="${esc(hero.id)}" aria-label="${heroSaved ? 'Remove' : 'Add'} ${esc(hero.title)} ${heroSaved ? 'from' : 'to'} My List" title="My List">${heroSaved ? '✓' : '+'}</button>
        </div>
        ${hero.note ? `<p class="w-hero-note">${esc(hero.note)}</p>` : ''}
      </div>
      <div class="w-hero-bottom"><span>16:3 / THE WATCH ROOM</span><span>THE FEATURED SCREENING</span></div>
    </div>` : ''}
    <div class="w-browse-head reveal">
      <div>
        <p class="kicker">The Channel / 16:3 Watch</p>
        <h1>Stories that <span class="g">carry the faith.</span></h1>
      </div>
      <p class="w-invite">Faith in every frame. Culture in every conversation.</p>
    </div>
    <div class="hub-search"><input type="search" data-watch-search placeholder="Search films & series" aria-label="Search Watch"></div>
    <p class="w-chips-label">Pick a door</p>
    <div class="w-chips" role="group" aria-label="Watch doors">
      ${doors.map((d) => `<button type="button" class="w-chip" data-door="${esc(d.slug)}">${esc(d.name)}<span class="w-chip-n">${doorTitles(d.slug).length}</span></button>`).join('')}
    </div>
    ${railHtml('continue', 'Continue Watching', 'On this device — your own viewing, stored only here', cont, { progress: true })}
    ${railHtml('mylist', 'My List', 'On this device — saved by you, stored only here', mine)}
    ${railHtml('featured', 'Featured', 'From the 16:3 Faith Watch library', featured)}
    ${doors.filter((d) => doorTitles(d.slug).length > 0).map((d) => railHtml(d.slug, d.name, d.blurb, doorTitles(d.slug), { door: d.slug })).join('')}
    <img class="w-artbanner gold-frame" src="assets/img/watch/watch-header.webp" alt="The congregation watching a great light in the dark — a faith film night" loading="lazy">
    ${(() => {
      /* CP4 — Watch AI Suggestions (labeled AI presence): computed
         from the library's own shelves — the featured screening, the
         deepest door, and the featured shelf. Nothing is rated or
         ranked that the catalog itself does not carry. */
      const deep = doors.map((d) => ({ d, n: doorTitles(d.slug).length })).sort((a, b) => b.n - a.n)[0];
      return `<section class="ai-shelf" aria-label="Watch AI Suggestions">
        <div class="ai-shelf-head"><span class="ai-shelf-title">✦ FaithGuide · Watch AI Suggestions</span><span class="ai-tag">Powered by AI</span></div>
        <p>From the library's own shelves${hero ? `: tonight's featured screening is <b>${esc(hero.title)}</b>` : ''}${deep && deep.n ? `; the deepest door is <b>${esc(deep.d.name)}</b> with <b>${deep.n} title${deep.n === 1 ? '' : 's'}</b>` : ''}${featured.length ? `; the Featured shelf carries <b>${featured.length}</b> hand-picked ${featured.length === 1 ? 'title' : 'titles'}` : ''}. Pick a door above and settle in.</p>
      </section>`;
    })()}
    <section class="w-move reveal">
      <div class="w-move-art" aria-hidden="true">
        <span class="w-stamp">SIDE B<br>03:16</span>
        <span class="w-move-big">16:3</span>
        <span class="w-move-side">16:3 / THE WATCH ROOM</span>
      </div>
      <div class="w-move-copy">
        <p class="kicker">This ain't just TV</p>
        <h2>More than a stream. <em>A movement.</em></h2>
        <p>Films that open conversations. Messages that meet you where you are. Stories with a heartbeat, from the sanctuary to the street.</p>
        <div class="w-move-links">
          <a href="#/pray">Enter the prayer room ↗</a>
          <a href="#/community">Meet the family ↗</a>
        </div>
      </div>
    </section>
    <p class="w-status" data-watch-status>${liveState === 'live'
      ? '<b>Live library connected.</b> Shelves are served by the Faith cinema catalog.'
      : '<b>Library snapshot.</b> Showing the verified catalog snapshot; the live Faith catalog connects automatically when reachable.'}</p>
  </section>`;
  if (window.FaithFilm) window.FaithFilm.wire(rootEl);
  const heroBtn = rootEl.querySelector('[data-watch-hero]');
  if (heroBtn && hero) heroBtn.addEventListener('click', () => openPlayer(hero, hero.episodes?.[0] || null));
  const infoBtn = rootEl.querySelector('[data-hero-info]');
  if (infoBtn && hero) infoBtn.addEventListener('click', () => { view = { name: 'detail', id: hero.id }; renderView(); });
  const heroImg = rootEl.querySelector('img[data-hero-poster]');
  if (heroImg) {
    const collapse = () => { if (heroImg.isConnected && (!heroImg.complete || heroImg.naturalWidth === 0)) heroImg.closest('[data-hero]')?.classList.add('w-hero-noposter'); };
    if (heroImg.complete && heroImg.naturalWidth === 0) collapse();
    else setTimeout(collapse, 1200);
  }
  const search = rootEl.querySelector('[data-watch-search]');
  if (search) search.addEventListener('input', () => {
    const q = search.value.trim();
    if (q.length >= 2) { view = { name: 'search', q }; renderView(true); }
  });
  bindCards(rootEl);
}

function renderShelf(doorSlug) {
  const meta = doorsMeta.find((d) => d.slug === doorSlug) || { name: doorSlug, slug: doorSlug };
  const titles = doorTitles(doorSlug);
  rootEl.innerHTML = `
  <section data-view="shelf" data-shelf-door="${esc(doorSlug)}">
    <button type="button" class="w-back" data-back>← All doors</button>
    <p class="kicker">Watch · ${esc(meta.name)}</p>
    <h1>${esc(meta.name)}</h1>
    ${meta.blurb ? `<p class="lede">${esc(meta.blurb)}</p>` : ''}
    ${gridShelfHtml(doorSlug, titles, meta.name)}
  </section>`;
  rootEl.querySelector('[data-back]').addEventListener('click', () => { view = { name: 'doors' }; renderView(); });
  bindCards(rootEl);
}

function renderSearch(q) {
  const needle = q.toLowerCase();
  const hits = catalog.filter((t) => `${t.title} ${t.description || ''}`.toLowerCase().includes(needle));
  rootEl.innerHTML = `
  <section data-view="search">
    <button type="button" class="w-back" data-back>← All doors</button>
    <p class="kicker">Watch · Search</p>
    <h1>Results for “${esc(q)}”</h1>
    <div class="hub-search"><input type="search" data-watch-search value="${esc(q)}" aria-label="Search Watch"></div>
    <p class="w-count">${hits.length} title${hits.length === 1 ? '' : 's'}</p>
    ${gridShelfHtml('search', hits, 'Search')}
  </section>`;
  rootEl.querySelector('[data-back]').addEventListener('click', () => { view = { name: 'doors' }; renderView(); });
  const search = rootEl.querySelector('[data-watch-search]');
  search.focus();
  search.addEventListener('input', () => {
    const nq = search.value.trim();
    if (nq.length >= 2) { view = { name: 'search', q: nq }; renderView(true); }
    else if (nq.length === 0) { view = { name: 'doors' }; renderView(); }
  });
  bindCards(rootEl);
}

function renderDetail(id) {
  const t = byId(id);
  if (!t) { view = { name: 'doors' }; renderView(); return; }
  const inList = myList().has(t.id);
  const rt = runtimeOf(t);
  rootEl.innerHTML = `
  <section data-view="detail" data-detail-id="${esc(t.id)}">
    <button type="button" class="w-back" data-back>← Back</button>
    <div class="w-banner">
      <span class="w-mono" aria-hidden="true">${esc(initials(t.title))}</span>
      ${t.poster ? `<img src="${esc(t.poster)}" alt="${esc(t.title)} poster" onerror="this.remove()">` : ''}
    </div>
    <div class="w-detail-body">
      <p class="kicker">${esc((doorsMeta.find((d) => d.slug === t.door) || {}).name || 'Watch')}</p>
      <h1>${esc(t.title)}</h1>
      <p class="w-meta">${[t.year, rt ? `<b>${esc(rt)}</b>` : '', t.badge, t.rights].filter(Boolean).join(' · ')}</p>
      ${t.description ? `<p class="w-desc">${esc(t.description)}</p>` : ''}
      ${(t.cast || t.creator || t.scriptureReferences) ? `<p class="w-credits">
        ${t.creator ? `Directed by <b>${esc(t.creator)}</b><br>` : ''}
        ${t.cast ? `With <b>${esc(t.cast.join(', '))}</b><br>` : ''}
        ${t.scriptureReferences ? `Scripture: <b>${esc(t.scriptureReferences.join(' · '))}</b>` : ''}</p>` : ''}
      <div class="w-actions">
        <button type="button" class="btn-gold" data-watch-title="${esc(t.id)}">▶ Watch now</button>
        <button type="button" class="w-btn-frost w-detail-save${inList ? ' saved' : ''}" data-mylist="${esc(t.id)}" data-mylist-toggle="${esc(t.id)}">${inList ? '✓ In My List' : '+ My List'}</button>
      </div>
      ${t.note ? `<p class="w-status">${esc(t.note)}</p>` : ''}
      ${t.kind === 'series' && t.episodes ? `<div class="w-episodes"><h3 style="font-family:var(--serif);font-size:20px">Episodes</h3>
        ${t.episodes.map((ep, i) => `<button type="button" class="w-ep" data-episode="${i}">
          <span class="w-ep-thumb"><span class="w-mono" aria-hidden="true">${esc(initials(t.title))}</span>${(ep.poster || t.poster) ? `<img src="${esc(ep.poster || t.poster)}" alt="" loading="lazy" onerror="this.remove()">` : ''}<span class="w-ep-play" aria-hidden="true">▶</span></span>
          <span><b>${esc(ep.title)}</b><span>${esc(runtimeOf(ep) || ep.durationLabel || '')}</span></span>
        </button>`).join('')}</div>` : ''}
    </div>
  </section>`;
  rootEl.querySelector('[data-back]').addEventListener('click', () => {
    view = t.door ? { name: 'shelf', door: t.door } : { name: 'doors' }; renderView();
  });
  rootEl.querySelector('[data-watch-title]').addEventListener('click', () => {
    openPlayer(t, t.kind === 'series' ? (t.episodes?.[0] || null) : null);
  });
  rootEl.querySelector('[data-mylist]').addEventListener('click', () => toggleMyList(t.id));
  rootEl.querySelectorAll('[data-episode]').forEach((el) => {
    el.addEventListener('click', () => openPlayer(t, t.episodes[+el.dataset.episode]));
  });
}

function renderView(keepScroll) {
  if (!rootEl || !snapshot) return;
  if (view.name === 'shelf') renderShelf(view.door);
  else if (view.name === 'detail') renderDetail(view.id);
  else if (view.name === 'search') renderSearch(view.q);
  else renderDoors();
  if (!keepScroll) window.scrollTo(0, 0);
}

/* ---------- player (this hub's own video surface) ---------- */
function closePlayer() {
  if (currentPlay?.video) {
    const v = currentPlay.video;
    if (v.duration && Number.isFinite(v.duration) && v.duration > 0 && v.currentTime > 0) {
      recordProgress(currentPlay.id, v.currentTime / v.duration);
    }
  }
  currentPlay = null;
  if (playerEl) { playerEl.remove(); playerEl = null; }
  document.removeEventListener('keydown', onPlayerKey);
  if (pendingLiveRender) { pendingLiveRender = false; renderView(); }
}
function onPlayerKey(e) { if (e.key === 'Escape') closePlayer(); }

async function openPlayer(t, episode) {
  if (!t) return;
  try { window.FaithPlayer?.audio?.pause(); } catch { /* shell player is independent */ }
  rememberContinue(t);
  const play = (episode && episode.play) || t.play || {};
  const titleLine = t.title;
  const subLine = episode ? episode.title : (metaLine(t) || '');
  const poster = (episode && episode.poster) || t.poster || '';
  closePlayer();
  playerEl = document.createElement('div');
  playerEl.className = 'w-player';
  playerEl.setAttribute('data-player', '');
  playerEl.setAttribute('role', 'dialog');
  playerEl.setAttribute('aria-modal', 'true');
  playerEl.setAttribute('aria-label', `Player — ${t.title}`);
  let stage = '';
  let foot = esc(t.rights ? `${t.source || ''} · ${t.rights}` : (t.note || ''));
  if (play.type === 'youtube') {
    stage = `${poster ? `<img class="w-stage-poster" src="${esc(poster)}" alt="">` : ''}
      <iframe data-player-media="youtube" data-youtube-id="${esc(play.youtubeId)}" title="${esc(t.title)}"
        src="https://www.youtube.com/embed/${esc(play.youtubeId)}?autoplay=1&rel=0"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  } else if (play.type === 'mp4') {
    stage = `<video data-player-media="mp4" data-src="${esc(play.src)}" ${play.apiStreamPath ? `data-api-stream="${esc(play.apiStreamPath)}"` : ''}
        src="${esc(play.src)}" ${poster ? `poster="${esc(poster)}"` : ''} controls autoplay playsinline></video>`;
  } else if (play.type === 'jfp') {
    stage = `<div class="w-stage-msg" data-player-media="jfp" data-jfp-id="${esc(play.jfpId)}">
        <b>${esc(t.title)}</b><span data-jfp-status>Connecting to the Faith library to start this film…</span></div>`;
  } else {
    stage = `<div class="w-stage-msg"><b>${esc(t.title)}</b><span>This title has no playable stream in the catalog.</span></div>`;
  }
  playerEl.innerHTML = `
    <div class="w-player-box">
      <div class="w-player-head"><div>
        <h3 data-player-title>${esc(titleLine)}</h3>
        ${subLine ? `<p data-player-sub>${esc(subLine)}</p>` : ''}
      </div><button type="button" class="w-player-close" data-player-close aria-label="Close player">✕</button></div>
      <div class="w-stage">${stage}</div>
      <div class="w-player-foot"><span>${foot}</span><span>${esc(runtimeOf(episode || t) || '')}</span></div>
    </div>`;
  document.body.appendChild(playerEl);
  playerEl.addEventListener('click', (e) => { if (e.target === playerEl) closePlayer(); });
  playerEl.querySelector('[data-player-close]').addEventListener('click', closePlayer);
  playerEl.querySelector('[data-player-close]').focus();
  document.addEventListener('keydown', onPlayerKey);

  const video = playerEl.querySelector('video[data-player-media="mp4"]');
  if (video && play.apiStreamPath) {
    video.addEventListener('error', () => {
      if (!video.dataset.fbk) { video.dataset.fbk = '1'; video.src = `${snapshot.apiBase}${play.apiStreamPath}`; }
    }, true);
  }
  if (video) trackVideo(video, t, episode);
  if (play.type === 'jfp') {
    const status = playerEl.querySelector('[data-jfp-status]');
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(`${snapshot.apiBase}/api/sanctuary/jfp-stream/${encodeURIComponent(play.jfpId)}?lang=en`, { signal: ctrl.signal });
      clearTimeout(to);
      if (!r.ok) throw new Error(`stream ${r.status}`);
      const j = await r.json();
      if (!j.streamUrl) throw new Error('no stream');
      if (!playerEl) return; // closed while resolving
      const stageEl = playerEl.querySelector('.w-stage');
      stageEl.innerHTML = `<video data-player-media="jfp" data-jfp-id="${esc(play.jfpId)}" data-stream-src="${esc(j.streamUrl)}"
          src="${esc(j.streamUrl)}" ${poster ? `poster="${esc(poster)}"` : ''} controls autoplay playsinline></video>`;
      trackVideo(stageEl.querySelector('video'), t, episode);
    } catch {
      if (status) status.textContent = 'This film streams from the Faith library, which is not reachable right now. The title is in the catalog — try again when the library connects.';
    }
  }
}

/* ---------- live catalog ---------- */
/* Door membership is a SET, never a single assignment (live-path cure,
   2026-11-19): the live catalog cross-lists works across rows (Book of
   Acts rides both Featured and Bible Stories) and files works the
   snapshot curates under one door inside another door's row (the archive
   Bible epics ride Classics & Archival). A title therefore carries EVERY
   door that lists it — a live connect can add doors to a title, never
   take one away, and door counts equal shelf contents by construction. */
function normalizeLiveFilm(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = String(raw.title || '').trim();
  const id = String(raw.id || raw.jfpId || '').trim();
  if (!title || !id) return null;
  const play = raw.streamUrl
    ? { type: 'mp4', src: raw.streamUrl.startsWith('http') ? raw.streamUrl : `${snapshot.apiBase}${raw.streamUrl}` }
    : { type: 'jfp', jfpId: String(raw.jfpId || id) };
  return {
    id, title, description: String(raw.description || ''), poster: raw.thumbnail || null,
    year: typeof raw.year === 'number' ? raw.year : null, badge: raw.badge || 'Gospel Film',
    durationMs: OVERRIDES[id] ?? (typeof raw.durationMs === 'number' ? raw.durationMs : null),
    durationLabel: null, source: raw.source || 'Faith Catalog', rights: raw.rights || '',
    cast: raw.cast, creator: raw.creator, scriptureReferences: raw.scriptureReferences,
    play,
  };
}
async function tryLive() {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(`${snapshot.apiBase}${snapshot.cinemaHubPath}`, { signal: ctrl.signal });
    clearTimeout(to);
    if (!r.ok) return;
    const j = await r.json();
    /* Accumulate live entries across ALL rows first: one entry per work
       (dedupe law: stable ID, then normalized title + year), gathering
       every door whose row lists it. The first row seen sets the entry's
       primary door (detail back-nav), the rest join its membership. */
    const keyOf = (t) => `${normTitle(t.title)}|${t.year ?? ''}`;
    const liveById = new Map(); const liveByKey = new Map();
    for (const row of Array.isArray(j.rows) ? j.rows : []) {
      const door = ROW_DOOR[row.slug] || 'faith';
      for (const rawFilm of Array.isArray(row.films) ? row.films : []) {
        const f = normalizeLiveFilm(rawFilm);
        if (!f) continue;
        const existing = liveById.get(f.id) || liveByKey.get(keyOf(f));
        if (existing) {
          if (!existing.doors.includes(door)) existing.doors.push(door);
          continue;
        }
        f.door = door; f.kind = 'film'; f.doors = [door];
        liveById.set(f.id, f); liveByKey.set(keyOf(f), f);
      }
    }
    const live = [...liveById.values()];
    if (!live.length) return;
    /* Merge over the snapshot with UNION door semantics: live content wins
       for a colliding work (poster, play, facts), but the snapshot's door
       membership is never lost — the work keeps every door it had. */
    for (const t of catalog) {
      const hit = liveById.get(t.id) || liveByKey.get(keyOf(t));
      if (hit) for (const d of t.doors || [t.door]) if (!hit.doors.includes(d)) hit.doors.push(d);
    }
    catalog = [...live, ...catalog.filter((t) => !(liveById.get(t.id) || liveByKey.get(keyOf(t))))];
    liveState = 'live';
    /* BLINK CURE (2026-11-22): the live merge re-renders with scroll
       KEPT — renderView() defaulted to scrollTo(0,0), so the catalog
       landing seconds after entry yanked a browsing reader back to
       the top (the "resetting" the founder reported). */
    if (playerEl) pendingLiveRender = true; else renderView(true);
  } catch { /* snapshot stands — honest state already rendered */ }
}

/* ---------- entry ---------- */
export async function render(root) {
  ensureStyle();
  rootEl = root;
  view = { name: 'doors' };
  if (!snapshot) {
    try { snapshot = await (await fetch(DATA_URL)).json(); }
    catch { snapshot = { heroId: null, featuredIds: [], doors: [], titles: [], apiBase: '', cinemaHubPath: '' }; }
    doorsMeta = snapshot.doors || [];
    catalog = (snapshot.titles || []).map((t) => ({ ...t, durationMs: OVERRIDES[t.id] ?? t.durationMs, doors: [t.door] }));
  }
  renderView();
  void tryLive();
}
