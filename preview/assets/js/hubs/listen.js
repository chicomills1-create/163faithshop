/* LISTEN — the Sanctuary (SPEC §3.2), v1 wiring (2026-11-19).
   Data routes (production sources only, no embedded catalog bundle):
   - Artist index + playable songs: baked snapshot in assets/data/ built from
     the D1 cache twin + genre-reference audit + the production YouTube songs
     pool (data-build/build_listen_data.py). Index fetched on hub entry;
     per-artist playable files load on demand. Entry stays ≤ 1 MB (§4).
   - ALBUM BREAKDOWN (founder directive 2026-11-19 16:21 MST): the artist
     page breaks songs down BY ALBUM, each album with its exact official
     cover — baked per artist in assets/data/albums/<slug>.json from the
     merged discography (cache twin ∪ album-map sidecar, sidecar wins
     per-release; the album-map measurement's own matcher assigns each
     pool track to exactly one album; unmatched tracks ride the honest
     "More songs" group). This baked breakdown SUPERSEDES the v1 live
     fd-fetch "Albums & Projects" section: same twin data plus the
     sidecar the API doesn't carry, and it works on every origin (the
     fd section sat in CORS fallback on the shop preview). The standing
     per-batch snapshot re-pin keeps it fresh.
   Player: the shell's persistent Kairo-style player (YouTube source, cover
   face, own transport). Tapping a track queues the artist's playable songs.
   Founder music law: full songs only — the snapshot build excludes talk /
   podcast-pattern tracks by title pattern; rows show a duration only when a
   real one exists in the data (#58: real or absent, never "?"). */

const state = { index: null, playable: new Map(), albums: new Map() };
window.__listen = { index: null, ready: false, lastArtist: null };

const STYLE = `<style>
.alb-list{margin-top:16px}
.alb-cover{position:relative;width:64px;height:64px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.22),rgba(212,175,55,.04));overflow:hidden;flex:none;display:block}
.alb-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.alb-cover .acard-mono{font-size:20px}
.alb-meta{flex:1;min-width:0}
.alb-play{flex:none;padding:8px 13px}
.alb-toggle{flex:none;white-space:nowrap}
.alb-body{margin-top:6px}
.alb-note{margin-top:10px;font-size:13px}
</style>`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const fmtDur = (sec) => {
  if (!sec && sec !== 0) return '';
  const m = Math.floor(sec / 60), s = sec % 60, h = Math.floor(m / 60);
  return h > 0 ? `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};
const monogram = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '16';

async function loadIndex() {
  if (!state.index) {
    const r = await fetch('assets/data/listen-index.json');
    state.index = await r.json();
    window.__listen.index = state.index;
  }
  return state.index;
}
async function loadPlayable(slug) {
  if (!state.playable.has(slug)) {
    try {
      const r = await fetch(`assets/data/playable/${slug}.json`);
      state.playable.set(slug, r.ok ? await r.json() : { name: '', tracks: [] });
    } catch { state.playable.set(slug, { name: '', tracks: [] }); }
  }
  return state.playable.get(slug);
}
async function loadAlbums(slug) {
  if (!state.albums.has(slug)) {
    try {
      const r = await fetch(`assets/data/albums/${slug}.json`);
      state.albums.set(slug, r.ok ? await r.json() : null);
    } catch { state.albums.set(slug, null); }
  }
  return state.albums.get(slug);
}
const artistBySlug = (slug) => state.index.artists.find((a) => a.slug === slug);
const doorLabel = (id) => (state.index.doors.find((d) => d.id === id) || {}).label || id;

function artistCard(a) {
  const art = a.art
    ? `<img loading="lazy" src="${esc(a.art)}" alt="" onerror="this.parentNode.classList.add('noart');this.remove()">`
    : '';
  return `<button type="button" class="acard" data-artist="${esc(a.slug)}">
    <span class="acard-art">${art}<span class="acard-mono">${esc(monogram(a.name))}</span></span>
    <b>${esc(a.name)}</b>
    <span class="acard-meta">${a.releases} releases · ${a.songs} songs${a.playable ? ` · ${a.playable} playable` : ''}</span>
  </button>`;
}

export function render(root, { player }) {
  window.__listen.ready = false;
  let view = { kind: 'doors' };
  let query = '';

  root.innerHTML = `
    ${STYLE}
    <p class="kicker">Listen · The Sanctuary</p>
    <h1>Full songs. <span class="g">No shortcuts.</span></h1>
    <p class="lede">Every song plays full, with its exact official cover — the founder music law. Search lives here, inside the hub.</p>
    <div class="hub-search"><input type="search" id="listen-search" placeholder="Search artists & songs — try “CeCe Winans”" aria-label="Search the Sanctuary"></div>
    <div id="listen-view"><p class="lede">Opening the Sanctuary…</p></div>`;

  const viewEl = root.querySelector('#listen-view');
  const searchEl = root.querySelector('#listen-search');

  function markPlaying() {
    const st = player.state();
    viewEl.querySelectorAll('[data-track]').forEach((row) => {
      row.classList.toggle('playing', !!st.youtubeId && row.dataset.track === st.youtubeId);
    });
  }
  const onPlayerEvent = () => {
    if (!viewEl.isConnected) { window.removeEventListener('faithplayer', onPlayerEvent); return; }
    markPlaying();
  };
  window.addEventListener('faithplayer', onPlayerEvent);

  function queueFromTracks(tracks, artistName, cover) {
    return tracks.map((t) => ({ youtubeId: t.y, title: t.t, sub: artistName, cover: cover || null }));
  }

  async function playArtistFrom(slug, startIdx) {
    const a = artistBySlug(slug);
    const p = await loadPlayable(slug);
    if (!p.tracks.length) return;
    player.playQueue(queueFromTracks(p.tracks, a.name, a.art), startIdx, a.name);
  }

  /* ---------- views ---------- */
  function doorsView() {
    view = { kind: 'doors' };
    const idx = state.index;
    const shown = query
      ? idx.artists.filter((a) => norm(a.name).includes(norm(query)))
      : idx.artists;
    viewEl.innerHTML = `
      <div class="shelf"><h3>Genre doors</h3>
        <div class="cards">${idx.doors.map((d) => `
          <button type="button" class="skel door-card" data-door="${esc(d.id)}">
            <div class="skel-art"></div><b>${esc(d.label)}</b>
            <span>${d.artists ? `${d.artists} artists` : 'shelf building'}</span>
          </button>`).join('')}</div>
      </div>
      <div class="shelf"><h3>${query ? `Artists matching “${esc(query)}”` : 'All artists'} <span class="shelf-count">${shown.length} of ${idx.artists.length}</span></h3>
        ${shown.length ? `<div class="cards artist-grid">${shown.map(artistCard).join('')}</div>`
          : `<p class="lede">No artist matches that search yet — try a name like “CeCe Winans”.</p>`}
      </div>
      <p class="placeholder-note"><b>Data:</b> the roster and playable songs ride the production catalog (${idx.artists.length} artists served). Every artist's page breaks their songs down by album, each with its official cover.</p>`;
    viewEl.querySelectorAll('[data-door]').forEach((el) => el.addEventListener('click', () => doorView(el.dataset.door)));
    viewEl.querySelectorAll('[data-artist]').forEach((el) => el.addEventListener('click', () => artistView(el.dataset.artist)));
    window.__listen.ready = true;
  }

  async function doorView(doorId) {
    view = { kind: 'door', id: doorId };
    const idx = state.index;
    const artists = idx.artists.filter((a) => a.door === doorId);
    viewEl.innerHTML = `
      <button type="button" class="btn-ghost back-btn" data-back>← All doors</button>
      <div class="shelf"><h3>${esc(doorLabel(doorId))}</h3>
      ${artists.length ? `
        <p class="lede">${artists.length} artists behind this door.</p>
        <button type="button" class="btn-gold" data-playall>▶ Play all — ${esc(doorLabel(doorId))}</button>
        <div class="cards artist-grid" style="margin-top:16px">${artists.map(artistCard).join('')}</div>`
      : `<p class="lede">This door's shelf is still being built — its artists are on the roster and appear under All artists as their shelves are assigned. No dead end: the door says so.</p>`}
      </div>`;
    viewEl.querySelector('[data-back]').addEventListener('click', doorsView);
    viewEl.querySelectorAll('[data-artist]').forEach((el) => el.addEventListener('click', () => artistView(el.dataset.artist)));
    const playAllBtn = viewEl.querySelector('[data-playall]');
    if (playAllBtn) playAllBtn.addEventListener('click', async () => {
      playAllBtn.textContent = 'Queueing…';
      const queue = [];
      for (const a of artists) {
        if (queue.length >= 300) break;
        const p = await loadPlayable(a.slug);
        queue.push(...queueFromTracks(p.tracks.slice(0, 300 - queue.length), a.name, a.art));
      }
      if (queue.length) player.playQueue(queue, 0, doorLabel(doorId));
      playAllBtn.textContent = `▶ Playing — ${queue.length} songs`;
    });
    markPlaying();
  }

  /* ---------- artist view: the ALBUM BREAKDOWN (founder law) ---------- */
  async function artistView(slug) {
    view = { kind: 'artist', slug };
    const a = artistBySlug(slug);
    if (!a) { doorsView(); return; }
    const p = await loadPlayable(slug);
    const alb = await loadAlbums(slug);
    const tracks = p.tracks;
    const groups = alb && Array.isArray(alb.albums) ? alb.albums : null;
    const more = alb && Array.isArray(alb.more) ? alb.more : tracks.map((_, i) => i);
    window.__listen.lastArtist = {
      slug, groups: groups ? groups.length : 0,
      matched: tracks.length - more.length, more: more.length, playable: tracks.length,
    };

    const kindLabel = (k) => (k === 'ep' ? 'EP' : k === 'single' ? 'Single' : 'Album');
    /* Display order (ChatGPT consult chatcmpl-Em8JK5jpNTSdU3crG2gbxSwMNGTjF):
       discography order, oldest first, singles/EPs interleaved by year;
       unknown years ride the tail in source order. */
    const ordered = groups
      ? groups.map((g, i) => ({ g, i })).sort((x, y) =>
          ((x.g.year == null) - (y.g.year == null)) || ((x.g.year || 0) - (y.g.year || 0)) || (x.i - y.i))
      : [];
    /* Default expansion: the first album with playable songs. */
    let openIdx = ordered.findIndex(({ g }) => g.kind === 'album' && g.play.length);
    if (openIdx < 0) openIdx = ordered.findIndex(({ g }) => g.play.length);
    if (openIdx < 0) openIdx = ordered.length ? 0 : -1;

    function albumCard({ g }, oi) {
      const playableN = g.play.length;
      const meta = [g.year || '', kindLabel(g.kind), `${g.n} track${g.n === 1 ? '' : 's'}`,
        playableN && playableN !== g.n ? `${playableN} playable` : ''].filter(Boolean).join(' · ');
      const posInPlay = new Map(g.play.map((ti, pi) => [ti, pi]));
      const rows = g.rows.map((row, li) => {
        if (row.p && row.p.length) {
          return row.p.map((ti, k) => `
          <button type="button" class="trow" data-track="${esc(tracks[ti].y)}" data-albrow="${oi}" data-pos="${posInPlay.get(ti)}">
            <span class="tnum">${li + 1}</span><span class="ttitle">${esc(k === 0 ? row.t : tracks[ti].t)}</span>
            ${tracks[ti].d ? `<span class="tdur">${fmtDur(tracks[ti].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('');
        }
        if (row.x != null && tracks[row.x]) {
          return `<button type="button" class="trow" data-track="${esc(tracks[row.x].y)}" data-xrow="${row.x}">
            <span class="tnum">${li + 1}</span><span class="ttitle">${esc(row.t)}</span>
            ${tracks[row.x].d ? `<span class="tdur">${fmtDur(tracks[row.x].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`;
        }
        return `<div class="trow static"><span class="tnum">${li + 1}</span><span class="ttitle">${esc(row.t)}</span></div>`;
      }).join('');
      return `<div class="rel-card alb-card" data-albcard="${oi}">
        <div class="rel-head">
          <span class="alb-cover">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="" onerror="this.remove()">` : ''}<span class="acard-mono">${esc(monogram(g.title))}</span></span>
          <div class="alb-meta"><b>${esc(g.title)}</b><span>${esc(meta)}</span></div>
          ${playableN ? `<button type="button" class="btn-gold alb-play" data-albplay="${oi}" aria-label="Play ${esc(g.title)}">▶</button>` : ''}
          <button type="button" class="btn-ghost alb-toggle" data-albtoggle="${oi}" aria-expanded="${oi === openIdx}">${oi === openIdx ? 'Hide tracks' : 'Tracks'}</button>
        </div>
        <div class="alb-body" data-albbody="${oi}" ${oi === openIdx ? '' : 'hidden'}>
          ${g.rows.length ? `<div class="trows mini">${rows}</div>`
            : `<p class="lede alb-note">${g.n} tracks in the catalog — this tracklist rides the next catalog pass; the artist's playable songs live in the other groups and in More songs.</p>`}
        </div>
      </div>`;
    }

    const moreCard = more.length ? `<div class="rel-card alb-card" data-morecard>
        <div class="rel-head">
          <div class="alb-meta"><b>More songs</b><span>${more.length} song${more.length === 1 ? '' : 's'}</span></div>
          <button type="button" class="btn-gold alb-play" data-moreplay aria-label="Play more songs">▶</button>
          <button type="button" class="btn-ghost alb-toggle" data-moretoggle aria-expanded="false">Tracks</button>
        </div>
        <p class="lede alb-note">Live recordings, features and one-offs that live outside the albums — every one plays full.</p>
        <div class="alb-body" data-morebody hidden><div class="trows mini">${more.map((ti, k) => `
          <button type="button" class="trow" data-track="${esc(tracks[ti].y)}" data-morerow="${k}">
            <span class="tnum">${k + 1}</span><span class="ttitle">${esc(tracks[ti].t)}</span>
            ${tracks[ti].d ? `<span class="tdur">${fmtDur(tracks[ti].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('')}</div></div>
      </div>` : '';

    const flatShelf = `
      <div class="shelf"><h3>Songs — playable now <span class="shelf-count">${tracks.length}</span></h3>
      ${tracks.length ? `
        <button type="button" class="btn-gold" data-playall>▶ Play all</button>
        <div class="trows">${tracks.map((t, i) => `
          <button type="button" class="trow" data-track="${esc(t.y)}" data-flatrow="${i}">
            <span class="tnum">${i + 1}</span><span class="ttitle">${esc(t.t)}</span>
            ${t.d ? `<span class="tdur">${fmtDur(t.d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('')}</div>`
      : `<p class="lede">This artist's playable songs are still being bound to the catalog.</p>`}
      </div>`;

    viewEl.innerHTML = `
      <button type="button" class="btn-ghost back-btn" data-back>← Back</button>
      <div class="artist-head">
        <span class="acard-art big">${a.art ? `<img src="${esc(a.art)}" alt="" onerror="this.remove()">` : ''}<span class="acard-mono">${esc(monogram(a.name))}</span></span>
        <div><h2>${esc(a.name)}</h2>
        <p class="lede">${a.releases} releases · ${a.songs} songs in the catalog${tracks.length ? ` · ${tracks.length} playable` : ''}${a.door ? ` · ${esc(doorLabel(a.door))}` : ''}</p></div>
      </div>
      ${groups ? `
      <div class="shelf"><h3>Albums <span class="shelf-count">${groups.length}</span></h3>
        ${tracks.length ? `<button type="button" class="btn-gold" data-playall>▶ Play all — ${esc(a.name)}</button>` : ''}
        <div class="rel-list alb-list">${ordered.map(albumCard).join('')}${moreCard}</div>
        <p class="placeholder-note"><b>Data:</b> albums, covers and tracklists ride the production catalog plus the album-map harvest. Every playable song plays full from YouTube; songs that live outside the albums ride “More songs” — nothing is dropped, nothing is fake-assigned.</p>
      </div>` : flatShelf}`;
    viewEl.querySelector('[data-back]').addEventListener('click', () => (a.door ? doorView(a.door) : doorsView()));
    const playAllBtn = viewEl.querySelector('[data-playall]');
    if (playAllBtn) playAllBtn.addEventListener('click', () => playArtistFrom(slug, 0));

    function playAlbum(oi, pos) {
      const { g } = ordered[oi];
      const q = queueFromTracks(g.play.map((ti) => tracks[ti]), a.name, g.cover || a.art);
      if (q.length) player.playQueue(q, pos, g.title);
    }
    function playMore(pos) {
      const q = queueFromTracks(more.map((ti) => tracks[ti]), a.name, a.art);
      if (q.length) player.playQueue(q, pos, 'More songs');
    }
    viewEl.querySelectorAll('[data-albplay]').forEach((el) =>
      el.addEventListener('click', () => playAlbum(+el.dataset.albplay, 0)));
    viewEl.querySelectorAll('[data-albrow]').forEach((el) =>
      el.addEventListener('click', () => playAlbum(+el.dataset.albrow, +el.dataset.pos)));
    viewEl.querySelectorAll('[data-xrow]').forEach((el) =>
      el.addEventListener('click', () => playArtistFrom(slug, +el.dataset.xrow)));
    viewEl.querySelectorAll('[data-morerow]').forEach((el) =>
      el.addEventListener('click', () => playMore(+el.dataset.morerow)));
    const morePlayBtn = viewEl.querySelector('[data-moreplay]');
    if (morePlayBtn) morePlayBtn.addEventListener('click', () => playMore(0));
    viewEl.querySelectorAll('[data-flatrow]').forEach((el) =>
      el.addEventListener('click', () => playArtistFrom(slug, +el.dataset.flatrow)));
    function wireToggle(btnSel, bodySel) {
      const btn = viewEl.querySelector(btnSel);
      const body = viewEl.querySelector(bodySel);
      if (!btn || !body) return;
      btn.addEventListener('click', () => {
        const open = body.hidden;
        body.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Hide tracks' : 'Tracks';
      });
    }
    ordered.forEach((_, oi) => wireToggle(`[data-albtoggle="${oi}"]`, `[data-albbody="${oi}"]`));
    wireToggle('[data-moretoggle]', '[data-morebody]');
    markPlaying();
  }

  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim();
    if (view.kind !== 'doors') { doorsView(); }
    else doorsView();
  });

  loadIndex().then(doorsView).catch((e) => {
    viewEl.innerHTML = `<p class="lede">The Sanctuary index didn't load (${esc(String(e).slice(0, 80))}). The doors will open on a fresh visit once it does.</p>`;
  });
}
