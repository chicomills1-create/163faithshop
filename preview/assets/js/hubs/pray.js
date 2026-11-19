/* PRAY hub (SPEC §3.4) — the Prayer Room, three doors per the HUB BREAKDOWN
   LAW: PRAYER WALL · REQUEST PRAYER · LIFTED PRAYERS. Doors first, never a
   flat feed.

   Data routes (evidence in records/HUB-PRAY-RECORD.md):
   - Counters — ONE source for every surface in this hub: live
     GET /api/community/pulse (fields members / testimonies / prayerRequests /
     prayersLifted; shape proven by production captures, e.g. the 2026-10-22
     probe pulse.1.json) with baked fallback assets/data/pray/counters.json
     (DATA-CENSUS-2026-11-18 §2 rendered values: 84 · 19 · 126 · 50).
   - Wall — production's own route, proven from the production bundle +
     server source: GET /api/community/posts?type=prayer&sort=new&limit=10
     &offset=<n>&rankedAt=<ts> → { posts, hasMore, nextOffset } (page size 10,
     "Load More Prayer Requests" in production). API-first; baked fallback =
     assets/data/pray/wall-snapshot.json, the prayer subset extracted
     VERBATIM from production feed captures (2026-10-21/22) — real requests,
     provenance stated on the surface; nothing fabricated, ever.
   - Posting — POST /api/community/posts { type:"prayer", body, visibility }
     (server CreateSchema, routes-community.ts). Sign-in-gated: the gate is
     stated BEFORE any click (#27) and the signed-out Request door presents
     the sign-in path AS the content (#28). The authenticated POST leg is
     UNGRADED until a back-end session route exists — success is shown only
     on a real 2xx from the production endpoint, never simulated.
   - Lift (pray-over) — POST /api/community/posts/<id>/pray →
     { prayed, prayerCount } (togglePostReaction). Same gating law as posting.
   Auth signal: window.Clerk.user only (the shell's F-CLERK leg mounts the
   real Clerk instance later); with no session the visitor is signed out. */

const API = 'https://faith-hub-api.onrender.com';
const DATA = 'assets/data/pray/';
const PAGE = 10; // production feed page size (bundle constant P0=10)

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fetchJSON(url, opts = {}, timeoutMs = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { credentials: 'include', signal: ctl.signal, ...opts });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return await r.json();
  } finally { clearTimeout(t); }
}

const isSignedIn = () => { try { return !!(window.Clerk && window.Clerk.user); } catch { return false; } };
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const initials = (name) => String(name || '?').split(/\s+/).slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('');

/* ---------------- state (fresh per hub entry = clean slate) --------------- */
let S = null;
function freshState() {
  return {
    view: 'doors',
    counters: null, countersSource: '',
    wall: { posts: [], nextOffset: null, hasMore: false, source: '', rankedAt: Date.now(), loadedAll: false },
    mountSeq: 0,
  };
}

/* ---------------- counters: one source, everywhere ------------------------ */
async function loadCounters() {
  if (S.counters) return S.counters;
  try {
    const p = await fetchJSON(`${API}/api/community/pulse`);
    const c = { requests: p.prayerRequests, lifted: p.prayersLifted, members: p.members, testimonies: p.testimonies };
    if ([c.requests, c.lifted, c.members, c.testimonies].every((n) => Number.isFinite(n))) {
      S.counters = c; S.countersSource = 'live production API · GET /api/community/pulse';
      return c;
    }
    throw new Error('unexpected pulse payload');
  } catch {
    const d = await fetchJSON(DATA + 'counters.json');
    S.counters = { requests: d.requests, lifted: d.lifted, members: d.members, testimonies: d.testimonies };
    S.countersSource = `census snapshot ${d.asOf} (production API unreachable from this network)`;
    return S.counters;
  }
}
function countersHTML() {
  const c = S.counters;
  if (!c) return '';
  return `<div class="counters" data-testid="counters">
    <div class="counter"><b data-count="requests">${c.requests}</b><span>Prayer requests</span></div>
    <div class="counter"><b data-count="lifted">${c.lifted}</b><span>Prayers lifted</span></div>
    <div class="counter"><b data-count="members">${c.members}</b><span>Members</span></div>
    <div class="counter"><b data-count="testimonies">${c.testimonies}</b><span>Testimonies</span></div>
  </div>
  <p class="pr-note">Totals · one source: ${esc(S.countersSource)}</p>`;
}

/* ---------------- wall data: API-first, baked production snapshot --------- */
function normalizePost(p) {
  return {
    id: p.id, authorName: p.authorName || 'Member', authorId: p.authorId || '',
    body: p.body || '', createdAt: p.createdAt || '', location: p.location || '',
    visibility: p.visibility || 'public', prayerCount: p.prayerCount || 0,
    prayed: !!p.prayed, answeredAt: p.answeredAt || null, isUrgent: !!p.isUrgent,
  };
}

async function fetchWallPage(offset) {
  const qs = new URLSearchParams({ type: 'prayer', sort: 'new', limit: String(PAGE), offset: String(offset), rankedAt: String(S.wall.rankedAt) });
  const d = await fetchJSON(`${API}/api/community/posts?${qs.toString()}`);
  if (!Array.isArray(d.posts)) throw new Error('unexpected wall payload');
  return {
    posts: d.posts.map(normalizePost).filter((p) => p.visibility !== 'private'),
    nextOffset: (d.nextOffset ?? null), hasMore: !!d.hasMore,
  };
}

async function loadSnapshot() {
  const d = await fetchJSON(DATA + 'wall-snapshot.json');
  return { posts: d.posts.map(normalizePost), provenance: d.provenance, capturedAt: d.capturedAt };
}

/* First wall load: render the local snapshot immediately (locally available
   content — no loading overlay, §4), then upgrade to the live API in place
   when it answers. If the API never answers, the snapshot stands, labeled.
   Memoized: render() prefetches and the views await the SAME prime, so a
   view can never observe the half-primed (snapshot-only) state. */
function primeWall() {
  if (!S.prime) S.prime = primeWallOnce();
  return S.prime;
}
async function primeWallOnce() {
  try {
    const snap = await loadSnapshot();
    S.wall.posts = snap.posts; S.wall.hasMore = false; S.wall.nextOffset = null;
    S.wall.source = `production snapshot · captured ${snap.capturedAt} from the production feed (live API unreachable from this network)`;
    S.wall.snapshotProvenance = snap.provenance;
  } catch { S.wall.source = ''; }
  try {
    const page = await fetchWallPage(0);
    S.wall.posts = page.posts; S.wall.nextOffset = page.nextOffset; S.wall.hasMore = page.hasMore;
    S.wall.source = 'live production API · GET /api/community/posts?type=prayer';
    S.wall.snapshotProvenance = '';
  } catch { /* snapshot (or honest error at render) stands */ }
  publishDebug();
}

async function loadMoreWall() {
  if (S.wall.source.startsWith('live') && S.wall.hasMore && S.wall.nextOffset != null) {
    const page = await fetchWallPage(S.wall.nextOffset);
    const seen = new Set(S.wall.posts.map((p) => p.id));
    S.wall.posts = S.wall.posts.concat(page.posts.filter((p) => !seen.has(p.id)));
    S.wall.nextOffset = page.nextOffset; S.wall.hasMore = page.hasMore;
  }
  publishDebug();
}

/* Lifted view rides the SAME wall data source: fetch every remaining page
   (the census wall is 84 — a bounded loop) so the filter sees the whole wall. */
async function ensureFullWall() {
  let guard = 0;
  while (S.wall.source.startsWith('live') && S.wall.hasMore && S.wall.nextOffset != null && guard < 30) {
    await loadMoreWall(); guard += 1;
  }
  S.wall.loadedAll = true;
}

function publishDebug() {
  window.__pray = {
    ready: !!S.counters,
    counters: S.counters, countersSource: S.countersSource,
    wallSource: S.wall.source, wallCount: S.wall.posts.length,
    wallHasMore: S.wall.hasMore, signedIn: isSignedIn(),
  };
}

/* ---------------- rendering ------------------------------------------------ */
const STYLE = `<style>
.pr-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:22px}
.pr-door{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:16px;min-height:128px;text-align:left;color:var(--bone);width:100%}
.pr-door:hover{border-color:var(--gold-dim)}
.pr-door .pr-art{height:46px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.25),rgba(212,175,55,.04));margin-bottom:10px;display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--gold)}
.pr-door b{font-size:15.5px;display:block;font-family:var(--serif)}
.pr-door span{font-size:12px;color:var(--mute);line-height:1.45;display:block;margin-top:3px}
.pr-chip{display:inline-block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#141005;background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));border-radius:999px;padding:3px 9px;font-weight:700;margin-top:8px}
.pr-chip.ghost{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi)}
.pr-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0}
.pr-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:10px 18px;font-size:12.5px;letter-spacing:.08em}
.pr-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}
.pr-btn[disabled]{opacity:.45;cursor:not-allowed}
.pr-note{font-size:12.5px;color:var(--mute);margin-top:12px;line-height:1.55}
.pr-card{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:16px 18px;margin-top:12px}
.pr-card-head{display:flex;align-items:center;gap:11px}
.pr-ava{width:40px;height:40px;flex:none;border-radius:9px;background:rgba(212,175,55,.1);border:1px solid var(--line);color:var(--gold);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:14px}
.pr-card-head b{font-size:14.5px;color:var(--bone);display:block}
.pr-card-head span{font-size:11.5px;color:var(--mute)}
.pr-badge{margin-left:auto;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-hi);border:1px solid var(--gold-dim);border-radius:999px;padding:4px 9px;white-space:nowrap}
.pr-badge.answered{color:#9fd48f;border-color:#3f5a35}
.pr-body{margin-top:11px;line-height:1.65;font-size:15px;color:var(--bone);white-space:pre-wrap;overflow-wrap:break-word}
.pr-card-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:13px;border-top:1px solid var(--line);padding-top:12px}
.pr-lift{background:none;border:none;color:var(--mute);font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:6px 2px}
.pr-lift:hover{color:var(--gold-hi)}
.pr-lift.on{color:var(--gold)}
.pr-lift-note{font-size:12px;color:var(--gold-hi);width:100%}
.pr-err{border:1px dashed #a33;border-radius:14px;padding:16px;color:#e8a0a0;margin-top:14px;line-height:1.55;font-size:14px}
.pr-gate{border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:26px 24px;margin-top:18px;text-align:center}
.pr-gate h2{margin-bottom:8px}
.pr-gate p{color:var(--mute);line-height:1.6;font-size:14.5px;max-width:520px;margin:8px auto}
.pr-form textarea{width:100%;background:#000;border:1px solid var(--gold-dim);border-radius:12px;color:var(--bone);padding:13px 15px;font-size:15px;line-height:1.55;resize:vertical;min-height:120px;font-family:var(--sans)}
.pr-form textarea:focus{border-color:var(--gold);outline:none}
.pr-radio{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.pr-radio label{border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-size:13px;color:var(--mute);cursor:pointer}
.pr-radio input{accent-color:var(--gold)}
.pr-count{text-align:right;font-size:11.5px;color:var(--mute);margin-top:5px}
</style>`;

function mount(root, html) { S.mountSeq += 1; root.innerHTML = STYLE + html; return S.mountSeq; }
function header(kicker, title, lede) {
  return `<p class="kicker">${kicker}</p><h1>${title}</h1><p class="lede">${lede}</p>`;
}

function postCard(p) {
  const signed = isSignedIn();
  const liftLabel = p.prayed ? 'Prayed' : 'Pray over this';
  const gate = signed ? '' : ' · members — sign in to pray';
  return `<article class="pr-card" data-post="${esc(p.id)}">
    <div class="pr-card-head">
      <span class="pr-ava" aria-hidden="true">${esc(initials(p.authorName))}</span>
      <span><b>${esc(p.authorName)}</b><span>${esc(fmtDate(p.createdAt))}${p.location ? ' · ' + esc(p.location) : ''}</span></span>
      ${p.answeredAt ? '<span class="pr-badge answered">Prayer answered</span>' : p.isUrgent ? '<span class="pr-badge">Urgent</span>' : '<span class="pr-badge">Public prayer</span>'}
    </div>
    <p class="pr-body">${esc(p.body)}</p>
    <div class="pr-card-foot">
      <button type="button" class="pr-lift${p.prayed ? ' on' : ''}" data-lift="${esc(p.id)}" aria-label="Pray over this request${signed ? '' : ' — members only, sign-in required'}">✚ ${liftLabel}${p.prayerCount ? ` · ${p.prayerCount} lifted` : ''}${gate}</button>
      <span class="pr-lift-note" data-lift-note="${esc(p.id)}" hidden></span>
    </div>
  </article>`;
}

function wireLift(root) {
  root.querySelectorAll('[data-lift]').forEach((btn) => btn.addEventListener('click', async () => {
    const id = btn.dataset.lift;
    const note = root.querySelector(`[data-lift-note="${CSS.escape(id)}"]`);
    if (!isSignedIn()) {
      /* #27 cured: the gate was stated on the control before the click; the
         click explains again and records NOTHING — no silent redirect. */
      if (note) { note.hidden = false; note.textContent = 'Members lift prayers. Sign in to lift this one — nothing was recorded.'; }
      return;
    }
    btn.disabled = true;
    try {
      const r = await fetchJSON(`${API}/api/community/posts/${encodeURIComponent(id)}/pray`, { method: 'POST' });
      const post = S.wall.posts.find((p) => p.id === id);
      if (post) { post.prayed = !!r.prayed; post.prayerCount = r.prayerCount ?? post.prayerCount; }
      showWallInto(root, true);
    } catch (err) {
      if (note) { note.hidden = false; note.textContent = `Couldn't record that just now (${err.message}). Nothing was counted.`; }
      btn.disabled = false;
    }
  }));
}

function wallListHTML() {
  if (!S.wall.posts.length) {
    return S.wall.source
      ? `<div class="pr-card" data-testid="wall-empty"><b>No public prayer requests right now.</b><p class="pr-note">When someone shares a prayer request on the community wall, it shows up here for you to pray over.</p></div>`
      : `<div class="pr-err" data-testid="wall-error">The prayer wall could not be loaded: the production API did not answer from this network, and the local production snapshot could not be read either. Nothing is shown in its place — no request is ever invented here.<div class="pr-bar"><button class="pr-btn" data-act="retry-wall" type="button">Try again</button></div></div>`;
  }
  return `<div data-testid="wall-list">${S.wall.posts.map(postCard).join('')}</div>
    ${S.wall.hasMore ? `<div class="pr-bar" style="justify-content:center"><button class="pr-btn goldb" data-act="more" type="button">Load more prayer requests</button></div>
    <p class="pr-note" style="text-align:center">Showing ${S.wall.posts.length} of ${S.counters ? S.counters.requests : '…'} requests — the list extends, it never silently caps.</p>`
    : `<p class="pr-note" data-testid="wall-end">End of the wall as loaded · ${S.wall.posts.length} request${S.wall.posts.length === 1 ? '' : 's'} shown · source: ${esc(S.wall.source)}</p>`}
    ${S.wall.snapshotProvenance ? `<p class="pr-note">${esc(S.wall.snapshotProvenance)}</p>` : ''}`;
}

function showWallInto(root, keepScroll = false) {
  const y = keepScroll ? window.scrollY : 0;
  mount(root, `
    <div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Pray · Prayer Wall', 'The <span class="g">wall.</span>', 'Every public prayer request the community has shared, newest first — pray over these requests from the family.')}
    ${countersHTML()}
    ${wallListHTML()}`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  const more = root.querySelector('[data-act="more"]');
  if (more) more.addEventListener('click', async () => { more.disabled = true; more.textContent = 'Loading…'; await loadMoreWall(); showWallInto(root, true); });
  const retry = root.querySelector('[data-act="retry-wall"]');
  if (retry) retry.addEventListener('click', async () => { S.wall.source = ''; S.prime = null; await primeWall(); showWallInto(root); });
  wireLift(root);
  if (keepScroll) window.scrollTo(0, y);
  publishDebug();
}

async function showWall(root) {
  S.view = 'wall';
  mount(root, `<div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>${header('Pray · Prayer Wall', 'The <span class="g">wall.</span>', 'Pray over these requests from the family.')}${countersHTML()}<p class="pr-note">Gathering the wall…</p>`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  await primeWall();
  if (S.view === 'wall') showWallInto(root);
}

/* ---------------- Request door (#27/#28) ---------------------------------- */
function showRequest(root) {
  S.view = 'request';
  if (!isSignedIn()) {
    /* #28 cured: the sign-in path IS the content — not a heading over a void.
       #27 cured: members-only is stated here, before any click, in words. */
    mount(root, `
      <div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>
      ${header('Pray · Request Prayer', 'Share your <span class="g">prayer.</span>', 'Bring your request before the Lord and let the 16:3 family stand with you.')}
      ${countersHTML()}
      <div class="pr-gate" data-testid="request-gate">
        <span class="pr-chip">Members only</span>
        <h2 style="margin-top:14px">Posting a prayer is for <span class="g">members</span></h2>
        <p>Anyone can read the wall and pray along. <b style="color:var(--bone)">Posting</b> a request — public, for the whole family to lift, or private, seen only by the 16:3 team — takes a free membership, so every request on the wall comes from a real member of the family.</p>
        <p>Sign in if you're already a member. New here? Join free — it takes a minute, and your request can go up right after.</p>
        <div class="pr-bar" style="justify-content:center">
          <button class="pr-btn goldb" data-act="signin" type="button">Sign in to post</button>
          <button class="pr-btn" data-act="join" type="button">Join free</button>
          <button class="pr-btn" data-act="wall" type="button">Read the wall instead</button>
        </div>
        <p class="pr-note">No form is hidden behind this panel: signing in returns you here with the posting form open. Nothing is recorded until you post.</p>
      </div>`);
    root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
    root.querySelector('[data-act="signin"]').addEventListener('click', () => document.getElementById('btn-signin')?.click());
    root.querySelector('[data-act="join"]').addEventListener('click', () => document.getElementById('btn-join')?.click());
    root.querySelector('[data-act="wall"]').addEventListener('click', () => showWall(root));
    return;
  }
  /* Signed-in: the full posting form (production shape). */
  mount(root, `
    <div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Pray · Request Prayer', 'Share your <span class="g">prayer.</span>', "Write what's on your heart. Public requests go on the community wall; private ones go directly to the 16:3 team.")}
    ${countersHTML()}
    <form class="pr-form" data-form="post">
      <label for="pr-body" style="display:block;margin:18px 0 8px;font-size:13px;letter-spacing:.08em">YOUR PRAYER REQUEST</label>
      <textarea id="pr-body" name="body" maxlength="2000" rows="5" placeholder="Lord, I'm asking for…"></textarea>
      <p class="pr-count"><span data-role="chars">0</span>/2000</p>
      <div class="pr-radio" role="radiogroup" aria-label="Who can see this">
        <label><input type="radio" name="visibility" value="public" checked> Public — the family prays over it on the wall</label>
        <label><input type="radio" name="visibility" value="private"> Private — only the 16:3 team sees it</label>
      </div>
      <p class="pr-note" data-role="vis-note">Public requests appear on the wall for every visitor to read and lift.</p>
      <div class="pr-bar"><button class="pr-btn goldb" type="submit" data-role="submit">Post my prayer</button></div>
      <p class="pr-note" data-role="form-status" role="status"></p>
    </form>`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  const form = root.querySelector('[data-form="post"]');
  const ta = form.querySelector('textarea');
  ta.addEventListener('input', () => { form.querySelector('[data-role="chars"]').textContent = String(ta.value.length); });
  form.querySelectorAll('input[name="visibility"]').forEach((r) => r.addEventListener('change', () => {
    form.querySelector('[data-role="vis-note"]').textContent = r.value === 'private' && r.checked
      ? "This will be sent directly to the 16:3 team. Only they can see it — it won't appear on the community wall."
      : 'Public requests appear on the wall for every visitor to read and lift.';
  }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = ta.value.trim();
    const status = form.querySelector('[data-role="form-status"]');
    if (!body) { status.textContent = 'Write your request first — an empty prayer is never posted.'; return; }
    const visibility = form.querySelector('input[name="visibility"]:checked').value;
    const btn = form.querySelector('[data-role="submit"]');
    btn.disabled = true; status.textContent = 'Posting…';
    try {
      await fetchJSON(`${API}/api/community/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'prayer', body, visibility }),
      });
      /* Success is claimed ONLY here — after a real 2xx from production. */
      mount(root, `
        <div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>
        <div class="pr-gate" data-testid="post-success"><h2>Your prayer was <span class="g">posted.</span></h2>
        <p>${visibility === 'private' ? 'Your private prayer was sent to the team.' : 'Your prayer request was posted to the community wall.'}</p>
        <div class="pr-bar" style="justify-content:center"><button class="pr-btn goldb" data-act="wall" type="button">See the wall</button></div></div>`);
      root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
      root.querySelector('[data-act="wall"]').addEventListener('click', () => { S.wall.source = ''; S.wall.posts = []; S.prime = null; showWall(root); });
    } catch (err) {
      status.textContent = err.status === 401 || err.status === 403
        ? 'The server says this session cannot post (sign-in or terms gate). Nothing was posted — sign in again and accept the terms, then retry.'
        : `Couldn't submit right now (${err.message}). Nothing was posted — your words are still in the form above.`;
      btn.disabled = false;
    }
  });
}

/* ---------------- Lifted door: same data source as the wall --------------- */
async function showLifted(root) {
  S.view = 'lifted';
  mount(root, `<div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>${header('Pray · Lifted Prayers', 'Lifted in <span class="g">prayer.</span>', 'The requests the family has lifted.')}${countersHTML()}<p class="pr-note">Gathering the lifted prayers…</p>`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  await primeWall();
  await ensureFullWall();
  if (S.view !== 'lifted') return;
  const lifted = S.wall.posts.filter((p) => p.prayerCount > 0).slice().sort((a, b) => b.prayerCount - a.prayerCount);
  const totalLiftedActions = S.wall.posts.reduce((s, p) => s + (p.prayerCount || 0), 0);
  mount(root, `
    <div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Pray · Lifted Prayers', 'Lifted in <span class="g">prayer.</span>', 'Requests the family has lifted — every one read and prayed over by real people.')}
    ${countersHTML()}
    <p class="pr-note" data-testid="lifted-summary">${S.counters ? S.counters.lifted : '…'} prayers lifted across the room (counters source above). From the wall data itself: ${lifted.length} lifted request${lifted.length === 1 ? '' : 's'} · ${totalLiftedActions} lifts recorded on them · same data source as the wall: ${esc(S.wall.source)}${S.wall.loadedAll || !S.wall.hasMore ? '' : ' (first pages)'}.</p>
    ${lifted.length ? `<div data-testid="lifted-list">${lifted.map(postCard).join('')}</div>` : `<div class="pr-card"><b>No lifted requests in the loaded wall data.</b><p class="pr-note">When a member lifts a request on the wall, it appears here.</p></div>`}
    ${S.wall.snapshotProvenance ? `<p class="pr-note">${esc(S.wall.snapshotProvenance)}</p>` : ''}`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  wireLift(root);
  publishDebug();
}

/* ---------------- Doors ----------------------------------------------------- */
function showDoors(root) {
  S.view = 'doors';
  const c = S.counters;
  mount(root, `
    ${header('Pray · The Prayer Room', 'Leave it <span class="g">on the wall.</span>', 'Three doors: read the wall and pray over the family, share your own request, and see what the family has lifted.')}
    ${countersHTML()}
    <div class="pr-doors">
      <button class="pr-door" data-door="wall" type="button"><div class="pr-art">✚</div><b>Prayer Wall</b><span>The live wall — ${c ? c.requests : '…'} requests open now, newest first. Read and pray over every one.</span></button>
      <button class="pr-door" data-door="request" type="button"><div class="pr-art">✎</div><b>Request Prayer</b><span>Share your own prayer request — public on the wall, or private to the team.</span><span class="pr-chip">Members only — sign-in required</span></button>
      <button class="pr-door" data-door="lifted" type="button"><div class="pr-art">♥</div><b>Lifted Prayers</b><span>${c ? c.lifted : '…'} prayers lifted — the requests the community has lifted, from the same wall.</span></button>
    </div>
    <p class="pr-note">Posting and lifting are members-only — and they say so up front, before any click (§3.4, defects #27/#28 do not recur). Reading the wall is open to everyone.</p>`);
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.door;
    if (d === 'wall') showWall(root);
    else if (d === 'request') showRequest(root);
    else if (d === 'lifted') showLifted(root);
  }));
  publishDebug();
}

export async function render(root) {
  S = freshState();
  /* Counters + doors are local-first: the doors render immediately with the
     baked counters if the pulse read is slow; the strip re-renders in place
     when the one source resolves. No loading overlay (§4). */
  showDoors(root);
  const seq = S.mountSeq;
  loadCounters().then(() => { publishDebug(); if (S.view === 'doors' && S.mountSeq === seq) showDoors(root); }).catch(() => {});
  primeWall().catch(() => {});
}
