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
   opens its own player directly; the poster is a real in-flow <img>. */

const DATA_URL = new URL('../../data/watch.json', import.meta.url).href;
const OVERRIDES = { '2_Augustine': 5980000, 'ten-commandments-1923': 8172000, '14_TPP': 400000 };
const ROW_DOOR = {
  'featured-feature-films': 'faith', 'featured': 'faith', 'shorts': 'faith', 'short': 'faith',
  'bible-stories-series': 'bible', 'bible': 'bible',
  'family': 'kids', 'documentaries': 'documentaries', 'documentary': 'documentaries',
  'classics-archival': 'classics', 'classic': 'classics', 'classic-cartoons': 'classics',
  'series': 'series',
};

let rootEl = null;
let snapshot = null;          // parsed watch.json
let catalog = [];             // merged titles (live wins over snapshot by id/title)
let doorsMeta = [];
let liveState = 'snapshot';   // 'snapshot' | 'live'
let view = { name: 'doors' }; // doors | shelf{door} | detail{id} | search{q}
let playerEl = null;
let pendingLiveRender = false;

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
const doorTitles = (slug) => catalog.filter((t) => t.door === slug);
const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const myList = () => new Set(lsGet('faith163.watch.mylist', []));
const continueList = () => lsGet('faith163.watch.continue', []);

/* ---------- styles (hub-owned; shell.css is the coordinator's) ---------- */
function ensureStyle() {
  if (document.getElementById('watch-style')) return;
  const st = document.createElement('style');
  st.id = 'watch-style';
  st.textContent = `
  .w-hero{position:relative;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:linear-gradient(160deg,#171204,#0a0a0a 65%);margin-top:18px}
  .w-hero img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
  .w-hero.w-hero-noposter img{display:none}
  .w-hero.w-hero-noposter .w-hero-shade{display:none}
  .w-hero.w-hero-noposter .w-hero-body{position:static}
  .w-hero .w-hero-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.05) 40%,rgba(0,0,0,.88))}
  .w-hero .w-hero-body{position:absolute;left:0;right:0;bottom:0;padding:20px 22px}
  .w-hero .w-hero-body .kicker{margin-bottom:6px}
  .w-hero h2{font-size:clamp(28px,6vw,44px)}
  .w-hero p{color:var(--bone);opacity:.85;font-size:14.5px;line-height:1.5;max-width:560px;margin:6px 0 14px}
  .w-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:14px}
  .w-door{border:1px solid var(--line);border-radius:16px;background:var(--coal);padding:18px 16px;text-align:left;color:var(--bone);transition:border-color .2s,transform .2s}
  .w-door:hover{border-color:var(--gold-dim);transform:translateY(-3px)}
  .w-door b{font-family:var(--serif);font-size:18px;display:block;color:var(--bone)}
  .w-door span{font-size:12.5px;color:var(--mute);display:block;margin-top:4px;line-height:1.45}
  .w-door em{font-style:normal;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);display:block;margin-top:10px}
  .w-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}
  @media(min-width:861px){.w-cards{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
  .wcard{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:0;overflow:hidden;text-align:left;color:var(--bone);transition:border-color .2s,transform .2s;width:100%}
  .wcard:hover{border-color:var(--gold-dim);transform:translateY(-3px)}
  .wcard .w-poster{aspect-ratio:2/3;background:linear-gradient(150deg,rgba(212,175,55,.25),rgba(212,175,55,.03) 60%),#0a0a0a;position:relative}
  .wcard .w-poster img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .wcard .w-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:34px;color:var(--gold-dim);padding:10px;text-align:center}
  .wcard .w-card-body{padding:10px 12px 12px}
  .wcard b{font-size:13.5px;display:block;line-height:1.35;color:var(--bone)}
  .wcard span{font-size:11.5px;color:var(--mute);display:block;margin-top:3px}
  .w-back{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:9px 18px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:18px}
  .w-detail{display:grid;grid-template-columns:1fr;gap:22px;margin-top:6px}
  @media(min-width:760px){.w-detail{grid-template-columns:280px 1fr}}
  .w-detail .w-poster{aspect-ratio:2/3;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:linear-gradient(150deg,rgba(212,175,55,.25),rgba(212,175,55,.03) 60%),#0a0a0a;position:relative}
  .w-detail .w-poster img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .w-detail .w-mono{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:44px;color:var(--gold-dim)}
  .w-meta{color:var(--mute);font-size:13.5px;letter-spacing:.06em;margin:10px 0}
  .w-meta b{color:var(--gold-hi);font-weight:600}
  .w-desc{color:var(--bone);opacity:.88;line-height:1.65;font-size:15.5px;max-width:620px}
  .w-credits{color:var(--mute);font-size:13.5px;line-height:1.6;margin-top:12px}
  .w-credits b{color:var(--bone)}
  .w-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .w-episodes{margin-top:24px}
  .w-ep{display:flex;gap:14px;align-items:center;width:100%;text-align:left;border:1px solid var(--line);background:var(--coal);border-radius:12px;padding:12px 14px;margin-top:10px;color:var(--bone)}
  .w-ep:hover{border-color:var(--gold-dim)}
  .w-ep .w-ep-play{color:var(--gold);font-size:18px;flex:none}
  .w-ep b{font-size:14px;display:block}
  .w-ep span{font-size:12px;color:var(--mute)}
  .w-empty{border:1px dashed var(--gold-dim);border-radius:14px;padding:22px;color:var(--mute);font-size:14.5px;line-height:1.6}
  .w-empty b{color:var(--gold-hi)}
  .w-status{margin-top:26px;font-size:12px;color:var(--mute);letter-spacing:.04em}
  .w-status b{color:var(--gold-dim)}
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
  @media(max-width:759px){.w-detail .w-poster{aspect-ratio:auto;height:300px}}
  .w-stage .w-stage-msg{position:absolute;inset:0;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:center;padding:24px;text-align:center;color:var(--mute);font-size:14.5px;line-height:1.6}
  .w-stage .w-stage-msg b{color:var(--gold-hi);font-family:var(--serif);font-size:18px}
  .w-player-foot{padding:13px 20px;font-size:12px;color:var(--mute);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}`;
  document.head.appendChild(st);
}

/* ---------- cards / shelves ---------- */
function posterHtml(t, cls) {
  if (t.poster) return `<div class="${cls}"><span class="w-mono" aria-hidden="true">${esc(initials(t.title))}</span><img src="${esc(t.poster)}" alt="${esc(t.title)} poster" loading="eager" onerror="this.remove()"></div>`;
  return `<div class="${cls}"><span class="w-mono" aria-hidden="true">${esc(initials(t.title))}</span></div>`;
}
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
function cardHtml(t) {
  return `<button type="button" class="wcard" data-title-id="${esc(t.id)}">
    ${posterHtml(t, 'w-poster')}
    <span class="w-card-body"><b>${esc(t.title)}</b><span>${esc(metaLine(t))}</span></span>
  </button>`;
}
function shelfHtml(slug, name, titles, heading = true) {
  return `<div class="shelf" data-shelf="${esc(slug)}">${heading ? `<h3>${esc(name)}</h3>` : ''}
    ${titles.length ? `<div class="w-cards">${titles.map(cardHtml).join('')}</div>`
      : `<div class="w-empty"><b>${esc(name)} is on its way.</b><br>These titles live in the live Faith catalog and appear here the moment the library connects. Nothing has been invented to fill the shelf.</div>`}
  </div>`;
}
function bindCards(scope) {
  scope.querySelectorAll('[data-title-id]').forEach((el) => {
    el.addEventListener('click', () => { view = { name: 'detail', id: el.dataset.titleId }; renderView(); });
  });
}

/* ---------- views ---------- */
function renderDoors() {
  const hero = byId(snapshot.heroId) || catalog[0];
  const featured = (snapshot.featuredIds || []).map(byId).filter(Boolean);
  const cont = continueList().map((c) => byId(c.id)).filter(Boolean);
  const mine = [...myList()].map(byId).filter(Boolean);
  const doors = doorsMeta.filter((d) => d.slug === 'documentaries' || d.slug === 'faith' || d.slug === 'bible'
    || d.slug === 'classics' || d.slug === 'series' || doorTitles(d.slug).length > 0);
  rootEl.innerHTML = `
  <section data-view="doors">
    <p class="kicker">Watch</p>
    <h1>Stories that <span class="g">carry the faith.</span></h1>
    <p class="lede">Pick a door. Every title opens its own player — never a bare hub link.</p>
    <div class="hub-search"><input type="search" data-watch-search placeholder="Search films & series" aria-label="Search Watch"></div>
    ${hero ? `<div class="w-hero" data-hero>
      <img data-hero-poster src="${esc(hero.poster || '')}" alt="${esc(hero.title)}" onerror="this.closest('[data-hero]').classList.add('w-hero-noposter')">
      <div class="w-hero-shade"></div>
      <div class="w-hero-body">
        <p class="kicker">Featured · ${esc(hero.badge || 'Series')}</p>
        <h2>${esc(hero.title)}</h2>
        <p>${esc(hero.description || '')}</p>
        <button type="button" class="btn-gold" data-watch-hero data-title-id-hero="${esc(hero.id)}">▶ Watch now</button>
      </div>
    </div>` : ''}
    <div class="shelf"><h3>Doors</h3><div class="w-doors">
      ${doors.map((d) => `<button type="button" class="w-door" data-door="${esc(d.slug)}">
        <b>${esc(d.name)}</b><span>${esc(d.blurb)}</span>
        <em data-door-count>${doorTitles(d.slug).length} title${doorTitles(d.slug).length === 1 ? '' : 's'}</em>
      </button>`).join('')}
    </div></div>
    ${cont.length ? shelfHtml('continue', 'Continue Watching — on this device', cont) : ''}
    ${mine.length ? shelfHtml('mylist', 'My List — on this device', mine) : ''}
    ${featured.length ? shelfHtml('featured', 'Featured', featured) : ''}
    <p class="w-status" data-watch-status>${liveState === 'live'
      ? '<b>Live library connected.</b> Shelves are served by the Faith cinema catalog.'
      : '<b>Library snapshot.</b> Showing the verified catalog snapshot; the live Faith catalog connects automatically when reachable.'}</p>
  </section>`;
  rootEl.querySelectorAll('[data-door]').forEach((el) => {
    el.addEventListener('click', () => { view = { name: 'shelf', door: el.dataset.door }; renderView(); });
  });
  const heroBtn = rootEl.querySelector('[data-watch-hero]');
  if (heroBtn && hero) heroBtn.addEventListener('click', () => openPlayer(hero, hero.episodes?.[0] || null));
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
    ${shelfHtml(doorSlug, meta.name, titles, false)}
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
    ${shelfHtml('search', `${hits.length} title${hits.length === 1 ? '' : 's'}`, hits)}
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
    <div class="w-detail">
      ${posterHtml(t, 'w-poster')}
      <div>
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
          <button type="button" class="btn-ghost" data-mylist="${esc(t.id)}">${inList ? '✓ In My List' : '+ My List'}</button>
        </div>
        ${t.note ? `<p class="w-status">${esc(t.note)}</p>` : ''}
        ${t.kind === 'series' && t.episodes ? `<div class="w-episodes"><h3 style="font-family:var(--serif);font-size:20px">Episodes</h3>
          ${t.episodes.map((ep, i) => `<button type="button" class="w-ep" data-episode="${i}">
            <span class="w-ep-play">▶</span><span><b>${esc(ep.title)}</b><span>${esc(runtimeOf(ep) || ep.durationLabel || '')}</span></span>
          </button>`).join('')}</div>` : ''}
      </div>
    </div>
  </section>`;
  rootEl.querySelector('[data-back]').addEventListener('click', () => {
    view = t.door ? { name: 'shelf', door: t.door } : { name: 'doors' }; renderView();
  });
  rootEl.querySelector('[data-watch-title]').addEventListener('click', () => {
    openPlayer(t, t.kind === 'series' ? (t.episodes?.[0] || null) : null);
  });
  rootEl.querySelector('[data-mylist]').addEventListener('click', (ev) => {
    const set = myList();
    if (set.has(t.id)) set.delete(t.id); else set.add(t.id);
    lsSet('faith163.watch.mylist', [...set]);
    ev.currentTarget.textContent = set.has(t.id) ? '✓ In My List' : '+ My List';
  });
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
function rememberContinue(t) {
  const list = continueList().filter((c) => c.id !== t.id);
  list.unshift({ id: t.id, at: Date.now() });
  lsSet('faith163.watch.continue', list.slice(0, 12));
}
function closePlayer() {
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
    } catch {
      if (status) status.textContent = 'This film streams from the Faith library, which is not reachable right now. The title is in the catalog — try again when the library connects.';
    }
  }
}

/* ---------- live catalog ---------- */
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
    const seenIds = new Set(); const seenTitles = new Set(); const live = [];
    for (const row of Array.isArray(j.rows) ? j.rows : []) {
      const door = ROW_DOOR[row.slug] || 'faith';
      for (const rawFilm of Array.isArray(row.films) ? row.films : []) {
        const f = normalizeLiveFilm(rawFilm);
        if (!f) continue;
        const nt = `${normTitle(f.title)}|${f.year ?? ''}`;
        if (seenIds.has(f.id) || seenTitles.has(nt)) continue;
        seenIds.add(f.id); seenTitles.add(nt);
        f.door = door; f.kind = 'film';
        live.push(f);
      }
    }
    if (!live.length) return;
    /* Dedupe key = stable ID, then normalized title + year: the same work
       arriving from two sources collapses, while distinct works that share
       a title (The King of Kings 1927 vs King of Kings 1961) both survive. */
    const keyOf = (t) => `${normTitle(t.title)}|${t.year ?? ''}`;
    const liveIds = new Set(live.map((t) => t.id));
    const liveTitles = new Set(live.map(keyOf));
    const kept = catalog.filter((t) => !liveIds.has(t.id) && !liveTitles.has(keyOf(t)));
    catalog = [...live, ...kept];
    liveState = 'live';
    if (playerEl) pendingLiveRender = true; else renderView();
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
    catalog = (snapshot.titles || []).map((t) => ({ ...t, durationMs: OVERRIDES[t.id] ?? t.durationMs }));
  }
  renderView();
  void tryLive();
}
