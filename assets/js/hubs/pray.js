/* PRAY hub (SPEC §3.4) — THE PRAYER ROOM. Three doors per the HUB BREAKDOWN
   LAW: THE WALL · LEAVE A PRAYER · PRAYERS LIFTED, plus a session-only
   prayer journal and a scripture guided-prayer flow.

   VISUAL LAYER (2026-11-19 graft): ChatGPT's Prayer Room design package
   (design-sources/prayerroom-chatgpt-package — founder-supplied) supplies
   the look: "LEAVE IT ON THE WALL." hero with THE PRAYER ROOM cover art,
   tape eyebrow, brick-red + old-gold mixtape register, door cards, room
   sidebar, feed chips/search, wall cards, right-rail cards. The package's
   sample prayers/authors/counts are FICTION and never render here — every
   post, name and count below is real production data (see the record,
   fresh-build/records/PRAY-GRAFT-RECORD-2026-11-19.md). Adaptations forced
   by the real data model: production prayer posts carry no topic/title, so
   the package's Family/Healing/Work/Grief chips became filters over real
   signals (Answered · Urgent · Most Lifted) + text search; its pastor's-
   corner sample copy does NOT ship (no invented words in the pastor's
   mouth) — the rail carries real KJV scripture instead.

   Data routes (evidence in records/HUB-PRAY-RECORD.md + PRAY-GRAFT record):
   - Counters — ONE source for every surface in this hub: live
     GET /api/community/pulse (members / testimonies / prayerRequests /
     prayersLifted) with baked fallback assets/data/pray/counters.json
     (refreshed 2026-11-19 from two agreeing live reads: 84 · 21 · 126 · 50 —
     prayersLifted moved 19 → 21 since the 2026-11-18 census).
   - Wall — GET /api/community/posts?type=prayer&sort=new&limit=10
     &offset=<n>&rankedAt=<ts> → { posts, hasMore, nextOffset }. API-first;
     baked fallback = assets/data/pray/wall-snapshot.json, 8 REAL prayer
     posts extracted verbatim from 2026-10-21/22 production feed captures,
     provenance stated on the surface. Nothing fabricated, ever.
   - Posting — POST /api/community/posts { type:"prayer", body, visibility }
     (server CreateSchema, routes-community.ts: auth 401 first, rate limit,
     member-write gate, word filter, moderation; NO feature-flag gate in the
     handler — the 2026-10-10 flags gated UI states, API enforcement was
     deferred at creation). visibility "private" is enforced SERVER-side
     (schema: "owner prayer-room only, never on the public wall"; the wall
     query serves published+public only) — that is why the private option
     may ship. Sign-in-gated in the UI: the gate is stated BEFORE any click
     (#27) and the signed-out Request door presents the sign-in path AS the
     content (#28). Success renders only on a real 2xx; the authenticated
     leg stays UNGRADED until F-CLERK gives the shell a session.
   - Lift (pray-over) — POST /api/community/posts/<id>/pray →
     { prayed, prayerCount } (togglePostReaction; unique (post,user) server
     side). Same gating law as posting.
   - Encourage (comments) — GET /api/community/posts/<id>/comments is
     guest-readable and LIVE (real rows read 2026-11-19); POST same route
     { body } is auth-gated server-side (401 "Please sign in to comment.").
     Reads render for everyone; the form renders only signed-in.
   Auth signal: window.Clerk.user (the shell's F-CLERK leg loads the real
   Clerk instance, 2026-11-22); with no session the visitor is signed out.
   Member writes carry the Clerk session token via window.FaithAuth —
   see fetchJSON below. */

const API = 'https://faith-hub-api-railway-production.up.railway.app';
const DATA = 'assets/data/pray/';
const PAGE = 10; // production feed page size (bundle constant P0=10)

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fetchJSON(url, opts = {}, timeoutMs = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    /* F-CLERK (2026-11-22): member WRITES ride the shell's FaithAuth
       transport — the Clerk session token rides along, and the terms
       gate's 403 routes the member to the acceptance step and retries.
       Reads stay on the plain fetch (public content is guest-open). */
    const isWrite = !!opts.method && String(opts.method).toUpperCase() !== 'GET';
    const doFetch = isWrite && window.FaithAuth?.apiFetch ? window.FaithAuth.apiFetch : fetch;
    const r = await doFetch(url, { credentials: 'include', signal: ctl.signal, ...opts });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return await r.json();
  } finally { clearTimeout(t); }
}

const isSignedIn = () => { try { return !!(window.Clerk && window.Clerk.user); } catch { return false; } };
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const initials = (name) => String(name || '?').split(/\s+/).slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('');

/* ---------------- state (fresh per hub entry = clean slate) --------------- */
let S = null;
let journalText = ''; // session-only journal: in-memory, never sent, never stored
function freshState() {
  return {
    view: 'doors',
    counters: null, countersSource: '',
    wall: { posts: [], nextOffset: null, hasMore: false, source: '', rankedAt: Date.now(), loadedAll: false },
    filter: 'all', query: '',
    commentsOpen: new Set(), commentsCache: new Map(), commentsState: new Map(),
    guidedStep: 0,
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
    S.countersSource = `snapshot ${d.asOf} (production API unreachable from this network)`;
    return S.counters;
  }
}
function countersHTML() {
  const c = S.counters;
  if (!c) return '';
  return `<div class="pr-counters" data-testid="counters">
    <div class="pr-counter"><b data-count="requests">${c.requests}</b><span>Prayer requests</span></div>
    <div class="pr-counter"><b data-count="lifted">${c.lifted}</b><span>Prayers lifted</span></div>
    <div class="pr-counter"><b data-count="members">${c.members}</b><span>Members</span></div>
    <div class="pr-counter"><b data-count="testimonies">${c.testimonies}</b><span>Testimonies</span></div>
  </div>
  <p class="pr-note">Totals · one source: ${esc(S.countersSource)}</p>`;
}

/* ---------------- wall data: API-first, baked production snapshot --------- */
function normalizePost(p) {
  return {
    id: p.id, authorName: p.authorName || 'Member', authorId: p.authorId || '',
    authorVerified: !!p.authorVerified,
    body: p.body || '', createdAt: p.createdAt || '', location: p.location || '',
    visibility: p.visibility || 'public', prayerCount: p.prayerCount || 0,
    commentCount: Number.isFinite(p.commentCount) ? p.commentCount : null,
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
    view: S.view, filter: S.filter, query: S.query,
  };
}

/* ---------------- visual system (package graft, pray-scoped) -------------- */
const STYLE = `<style>
.pr-wrap{--pr-gold:#eac35b;--pr-gold2:#dcac33;--pr-red:#df4435;--pr-red-dk:#b92b25;--pr-panel:#121311;--pr-panel2:#171611;--pr-line:#3a3529;--pr-ink:#f7f2e8}
.pr-impact{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;letter-spacing:.5px}
.pr-topline{background:var(--pr-red-dk);color:#fff0dd;font-size:10px;font-weight:900;letter-spacing:1.45px;padding:7px 12px;display:flex;justify-content:space-between;gap:12px;border-radius:4px}
.pr-topline b{color:#ffde68;padding:0 8px}
.pr-topline .pr-top-r{color:#fff9e5;font-weight:800;font-size:9px}
@media(max-width:740px){.pr-topline .pr-top-r{display:none}}
.pr-hero{margin-top:16px;display:grid;grid-template-columns:48% 52%;background:radial-gradient(ellipse at 42% 57%,#2d1c14 0,#15120e 45%,#090908 100%);border:1px solid #685027;border-radius:7px;overflow:hidden;position:relative;box-shadow:0 24px 55px #0007}
.pr-hero-copy{padding:38px 18px 32px 34px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2}
.pr-eyebrow{display:flex;align-items:center;gap:9px;color:#d7bd73;font-weight:950;letter-spacing:2px;font-size:10px;text-transform:uppercase}
.pr-eyebrow .slashes{color:#df4635}
.pr-eyebrow .tiny-red{font-size:20px;color:var(--pr-red)}
.pr-hero h1{margin:18px 0 10px;font-size:clamp(52px,6vw,84px);line-height:.86;text-transform:uppercase;text-shadow:4px 5px 0 #0007;color:var(--pr-ink)}
.pr-hero h1 .w{display:block;color:#fff6e5}
.pr-hero h1 em{font-style:normal;background:linear-gradient(155deg,#ffdf81,#dcac33 65%,#8b5b10);-webkit-background-clip:text;background-clip:text;color:transparent}
.pr-hero p{color:#d5cabe;line-height:1.6;font-size:14px;max-width:420px;margin:8px 0 20px}
.pr-hero-actions{display:flex;gap:18px;align-items:center;flex-wrap:wrap}
.pr-btn-red{background:var(--pr-red);border:1px solid #fa7c69;color:#fff;padding:14px 18px;font-size:11px;letter-spacing:1px;font-weight:950;box-shadow:5px 5px 0 #7c211f;border-radius:3px}
.pr-btn-red:hover{filter:brightness(1.12)}
.pr-text-link{font-size:11px;color:#ffe3a0;font-weight:900;letter-spacing:1.3px;border-bottom:1px solid #8b6a28;padding-bottom:5px;background:none;border-top:0;border-left:0;border-right:0}
.pr-hero-foot{display:flex;gap:9px;align-items:center;margin-top:24px;letter-spacing:1.6px;font-size:9px;color:#a38e69;font-weight:900}
.pr-hero-foot .small-line{height:1px;background:var(--pr-gold);width:26px}
.pr-hero-art{position:relative;min-height:300px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 48%,#543519a1,transparent 60%)}
.pr-hero-art:before{content:"";position:absolute;width:340px;height:340px;border:2px dashed #b78639;border-radius:50%;transform:translate(60px,16px);opacity:.2}
.pr-hero-cover{position:relative;width:94%;height:320px;object-fit:cover;border-radius:10px;filter:drop-shadow(0 12px 18px #0009);transform:rotate(-3deg)}
.pr-door-art{display:block;width:calc(100% + 44px);margin:-22px -22px 14px;height:84px;object-fit:cover;border-bottom:1px solid rgba(212,175,55,.35)}
.pr-sticker{position:absolute;top:14px;right:18px;transform:rotate(13deg);font-size:12px;line-height:1.1;font-weight:1000;letter-spacing:1.2px;background:#d43d2a;border:2px dashed #ffcba2;color:#fff1dd;border-radius:50%;height:78px;width:78px;display:grid;place-items:center;text-align:center}
.pr-art-vol{position:absolute;bottom:14px;right:18px;font-size:9px;color:#e2c98b;letter-spacing:2px;font-weight:850}
@media(max-width:740px){.pr-hero{grid-template-columns:1fr}.pr-hero-copy{padding:28px 20px 22px}.pr-hero h1{font-size:clamp(56px,15vw,80px)}.pr-hero-art{min-height:190px}.pr-hero-cover{width:88%;max-height:210px}.pr-sticker{height:58px;width:58px;font-size:9px;right:12px;top:8px}}
.pr-tape{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #392f1e;padding:16px 3px;color:#c5a552;font-size:10px;font-weight:950;letter-spacing:1.7px}
.pr-tape span:last-child{color:#a29888}
@media(max-width:740px){.pr-tape span:last-child{display:none}}
.pr-doors{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:20px 0 6px}
@media(max-width:740px){.pr-doors{grid-template-columns:1fr;gap:8px}}
.pr-door{position:relative;min-height:168px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:#131310;border:1px solid #403923;color:var(--pr-ink);padding:22px 22px;overflow:hidden;width:100%;border-radius:4px;transition:transform .2s,border-color .2s}
.pr-door:hover{transform:translateY(-3px);border-color:#c09a3e}
.pr-door:after{content:"";width:95px;height:95px;position:absolute;border:1px solid #f4b9391f;border-radius:50%;right:-25px;top:20px;box-shadow:0 0 0 17px #e5ac2d0c,0 0 0 34px #e5ac2d08;pointer-events:none}
.pr-door.hl{background:linear-gradient(135deg,#352512,#1c1710);border-color:#a5792f}
.pr-door-n{font-size:9px;letter-spacing:1.6px;color:#e4b753;font-weight:900}
.pr-door-sym{position:absolute;right:24px;top:14px;font-size:27px;color:#dbb956}
.pr-door strong{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:25px;margin:16px 0 7px;letter-spacing:.5px;line-height:1.05}
.pr-door strong span{color:#db4635}
.pr-door small{font-size:12px;line-height:1.45;color:#c1b5a3;max-width:250px}
.pr-door-arrow{margin-top:auto;padding-top:12px;font-size:10px;font-weight:900;color:#ecca6c;letter-spacing:1px}
.pr-chip{display:inline-block;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#1d1408;background:var(--pr-gold);border-radius:3px;padding:4px 8px;font-weight:900;margin-top:9px}
.pr-counters{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}
@media(max-width:740px){.pr-counters{grid-template-columns:repeat(2,1fr)}}
.pr-counter{border:1px solid var(--pr-line);background:var(--pr-panel);padding:13px 15px;border-radius:4px}
.pr-counter b{font-family:Georgia,serif;font-size:24px;color:var(--pr-gold);display:block;line-height:1}
.pr-counter span{font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:#a29888;font-weight:900;display:block;margin-top:6px}
.pr-note{font-size:12px;color:var(--mute);margin-top:10px;line-height:1.55}
.pr-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0 14px}
.pr-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:10px 18px;font-size:12.5px;letter-spacing:.08em}
.pr-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}
.pr-btn[disabled]{opacity:.45;cursor:not-allowed}
.pr-err{border:1px dashed #a33;border-radius:10px;padding:16px;color:#e8a0a0;margin-top:14px;line-height:1.55;font-size:14px}
</style>`;

const STYLE2 = `<style>
.pr-shell{display:grid;grid-template-columns:205px minmax(0,1fr);gap:18px;align-items:start;margin-top:6px}
.pr-side{position:sticky;top:calc(var(--topbar-h) + 12px)}
.pr-side-intro{border-top:4px solid var(--pr-red);padding:18px 16px 20px;background:#151511}
.pr-side-label{font-size:9px;color:#caa749;font-weight:950;letter-spacing:2px}
.pr-side-intro h2{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:40px;line-height:.94;letter-spacing:1px;margin:16px 0 10px;color:var(--pr-ink)}
.pr-side-intro h2 em{color:var(--pr-gold);font-style:normal}
.pr-side-intro p{font-size:12px;line-height:1.6;color:#b8ad9b}
.pr-roomnav{margin-top:12px;border:1px solid #363227;background:#0f100e;padding:5px;display:flex;flex-direction:column}
.pr-roomnav button{display:flex;align-items:center;gap:10px;border:0;text-align:left;background:transparent;color:#c2b9a8;padding:14px 10px;font-size:10px;font-weight:950;letter-spacing:.6px;border-bottom:1px solid #302c25;width:100%}
.pr-roomnav button:last-child{border:0}
.pr-roomnav button .ic{font-size:16px;color:#bd9d52;width:19px;text-align:center}
.pr-roomnav button.active{background:#342612;color:#f7d775}
.pr-roomnav button .arr{margin-left:auto;font-size:12px}
.pr-side-verse{margin-top:12px;padding:18px 15px;background:#1a1510;border:1px solid #5a3e22}
.pr-side-verse>span{font-size:9px;color:#dfba61;letter-spacing:1px;font-weight:900}
.pr-side-verse p{font:italic 16.5px/1.4 Georgia,serif;color:#f5dfb7;margin:11px 0 8px}
.pr-side-verse small{color:#968674;font-size:9px;letter-spacing:.6px}
.pr-side-compose{width:100%;border:1px solid #e0bc62;background:#deb855;color:#1e170a;padding:15px 10px;font-size:11px;font-weight:950;letter-spacing:1px;margin-top:12px;border-radius:3px}
@media(max-width:740px){.pr-shell{display:block}.pr-side{position:static}.pr-side-intro,.pr-side-verse,.pr-side-compose{display:none}.pr-roomnav{flex-direction:row;overflow-x:auto;gap:5px;background:transparent;border:0;padding:0;margin:0 0 16px}.pr-roomnav button{white-space:nowrap;width:auto;flex:0 0 auto;border:1px solid #4d3f2b;padding:11px 12px;background:#15130e}.pr-roomnav button .arr{display:none}}
.pr-feed-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.pr-feed-head h2{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:clamp(32px,3.4vw,46px);line-height:1;letter-spacing:.5px;margin:8px 0 5px;color:var(--pr-ink)}
.pr-feed-head h2 em{font-style:normal;color:var(--pr-gold)}
.pr-feed-head p{color:#ad9e8d;font-size:12.5px;line-height:1.55;max-width:520px}
.pr-outline-gold{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid #ae873b;color:#e2c06b;font-size:10px;font-weight:950;letter-spacing:1px;padding:12px;white-space:nowrap;border-radius:3px}
.pr-status{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#1c1d18;border:1px solid #373829;color:#a9aa9a;padding:12px 14px;font-size:9px;letter-spacing:1.15px;font-weight:800;border-radius:3px}
.pr-status b{color:#f5ebca}
.pr-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#d8c26a;box-shadow:0 0 12px #b58e31;margin-right:8px}
.pr-status .src{text-align:right;letter-spacing:.4px;font-weight:700}
.pr-controls{display:flex;align-items:center;flex-wrap:wrap;gap:12px;justify-content:space-between;margin:15px 0 4px}
.pr-chips{display:flex;flex-wrap:wrap;gap:5px}
.pr-chips button{background:#131412;color:#9f998d;border:1px solid #373427;border-radius:3px;font-size:9px;letter-spacing:.65px;font-weight:900;padding:10px 11px}
.pr-chips button.selected,.pr-chips button:hover{color:#1d1408;background:var(--pr-gold);border-color:var(--pr-gold)}
.pr-search{display:flex;align-items:center;gap:7px;border:1px solid #4d422a;background:#151511;padding:0 11px;min-width:170px;border-radius:3px}
.pr-search span{color:#a78c4c;font-size:14px}
.pr-search input{background:none;border:0;outline:none;width:100%;padding:10px 0;color:#fff2db;font-size:12px;font-family:var(--sans)}
.pr-search input::placeholder{color:#8e8677}
@media(max-width:740px){.pr-search{width:100%}}
.pr-card{border:1px solid #3a342a;background:linear-gradient(135deg,#191915,#121310 48%,#15130e);border-radius:4px;overflow:hidden;margin-top:13px}
.pr-card-top{display:flex;justify-content:space-between;align-items:center;gap:9px;border-bottom:1px solid #332c23;padding:11px 17px;font-size:9px;font-weight:900;letter-spacing:1.5px;color:#c9ab64}
.pr-card-top b{font-weight:900;color:#908879}
.pr-card-top .ans{color:#9fd48f}
.pr-card-top .urg{color:#ff9a8a}
.pr-card-body{padding:17px 19px 13px}
.pr-author{display:flex;gap:11px;align-items:center}
.pr-ava{flex:0 0 auto;border-radius:50%;height:42px;width:42px;display:grid;place-items:center;border:1px solid #80662c;background:linear-gradient(140deg,#826221,#251b12);color:#f7d77c;font-weight:1000;letter-spacing:-.5px;font-size:14px;font-family:Georgia,serif}
.pr-author b{font-size:13.5px;color:var(--pr-ink);display:block}
.pr-author small{font-size:10px;color:#9b9387;display:block;margin-top:2px}
.pr-pill{margin-left:auto;color:#f1d087;border:1px solid #745d33;border-radius:999px;padding:6px 9px;font-size:9px;font-weight:900;letter-spacing:.35px;background:#3e321c5c;white-space:nowrap}
.pr-pill.ans{color:#9fd48f;border-color:#3f5a35;background:#22301c5c}
.pr-pill.urg{color:#ff9a8a;border-color:#6e352c;background:#3a1d185c}
.pr-body{font-size:14.5px;line-height:1.7;color:#ddd5c6;white-space:pre-wrap;overflow-wrap:break-word;margin:15px 0 4px}
.pr-stats{display:flex;gap:14px;color:#a79a84;font-size:10px;font-weight:700;padding:9px 0 2px}
.pr-stats strong{color:#e2c06a}
.pr-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid #332c23;padding:4px 8px}
.pr-actions button{display:flex;align-items:center;justify-content:center;gap:7px;background:none;border:0;color:#aaa08d;font-size:10px;font-weight:850;padding:12px 5px;letter-spacing:.4px}
.pr-actions button:hover,.pr-actions button.on{color:#f8ca66;background:#292318}
.pr-lift-note{font-size:12px;color:var(--gold-hi);padding:2px 19px 12px;line-height:1.5}
.pr-comments{border-top:1px solid #373127;background:#10110f;padding:15px 18px}
.pr-comment{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
.pr-comment .pr-ava{height:30px;width:30px;font-size:10px}
.pr-bubble{background:#252219;border:1px solid #3b3428;border-radius:3px;padding:9px 11px;flex:1}
.pr-bubble strong{font-size:11px;color:#ebce87}
.pr-bubble small{font-size:9.5px;color:#9b9387;margin-left:7px}
.pr-bubble p{color:#c9c0b1;font-size:12px;line-height:1.55;margin:4px 0 0;white-space:pre-wrap;overflow-wrap:break-word}
.pr-cnote{font-size:12px;color:#bcb29d;line-height:1.6}
.pr-cform{display:flex;gap:8px;margin-top:6px}
.pr-cform textarea{flex:1;min-width:0;border:1px solid #58472c;background:#1e1c18;color:var(--pr-ink);border-radius:3px;padding:11px;font-size:13px;font-family:var(--sans);resize:vertical;min-height:42px}
.pr-cform button{border:0;background:var(--pr-gold);color:#1f1606;font-size:10px;font-weight:900;padding:0 14px;border-radius:3px}
.pr-cgate{font-size:12px;color:#bcb29d;line-height:1.6}
.pr-cgate button{color:#efcc72;border:0;background:none;text-decoration:underline;font-size:12px;padding:0}
.pr-more-wrap{text-align:center;margin-top:18px}
.pr-below{border-top:1px solid #5b431f;text-align:center;padding:24px 15px;margin-top:24px;background:#15110c;border-radius:4px}
.pr-below span{display:block;color:#b08d4c;font-size:9px;font-weight:950;letter-spacing:2px}
.pr-below strong{display:block;font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:23px;margin:11px 0;color:#f8dfa5}
.pr-below button{border:1px solid var(--pr-gold);color:var(--pr-gold);background:none;padding:10px 15px;font-size:10px;font-weight:950;border-radius:3px}
.pr-gate{border:1px solid var(--gold-dim);border-radius:8px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:28px 24px;margin-top:18px;text-align:center}
.pr-gate h2{font-family:Georgia,serif;font-size:26px;margin:12px 0 8px;color:var(--pr-ink)}
.pr-gate h2 .g{color:var(--pr-gold)}
.pr-gate p{color:var(--mute);line-height:1.6;font-size:14.5px;max-width:540px;margin:8px auto}
.pr-form{margin-top:18px}
.pr-form label.fl{display:block;margin:0 0 8px;font-size:10px;letter-spacing:1px;font-weight:950;color:#e8cf97}
.pr-form textarea{width:100%;background:#0f110f;border:1px solid #6b5732;border-radius:3px;color:#fff2da;padding:13px 15px;font-size:14.5px;line-height:1.55;resize:vertical;min-height:130px;font-family:var(--sans)}
.pr-form textarea:focus{border-color:var(--pr-gold);outline:none}
.pr-count{text-align:right;font-size:11.5px;color:var(--mute);margin-top:5px}
.pr-priv{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 6px}
@media(max-width:740px){.pr-priv{grid-template-columns:1fr}}
.pr-priv label{display:flex;align-items:flex-start;gap:10px;padding:14px 12px;border:1px solid #51452d;background:#222018;cursor:pointer;border-radius:3px}
.pr-priv label:has(input:checked){border-color:#dabb67;background:#352b18}
.pr-priv input{accent-color:#d6ad4d;margin-top:3px}
.pr-priv b{font-size:12px;color:#f3d58d;display:block}
.pr-priv small{display:block;font-size:10.5px;color:#aea28d;line-height:1.5;margin-top:5px}
.pr-warn{background:#342312;border-left:3px solid #dfac4d;color:#d2c4ad;padding:13px;font-size:11.5px;line-height:1.65;margin:14px 0}
.pr-extras{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:22px}
@media(max-width:740px){.pr-extras{grid-template-columns:1fr}}
.pr-xcard{padding:20px 18px;border:1px solid #3d372d;background:#151512;border-radius:4px}
.pr-xcard .top{display:flex;justify-content:space-between;gap:8px;color:#d8b966;font-size:9px;font-weight:950;letter-spacing:1.1px}
.pr-xcard .top span{color:#968253;font-size:8px}
.pr-xcard blockquote{font:italic 19px/1.4 Georgia,serif;color:#f6e6bb;margin:14px 0 12px}
.pr-xcard .ref{border-top:1px solid #4e432c;padding-top:11px;font-size:10px;letter-spacing:1.2px;color:#d7b461;font-weight:900}
.pr-xcard h3{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:24px;margin:12px 0 7px;color:var(--pr-ink)}
.pr-xcard p{font-size:12.5px;line-height:1.6;color:#bcb2a4}
.pr-xcard ul{list-style:none;margin:12px 0;padding:0}
.pr-xcard li{font-size:11.5px;line-height:1.55;color:#bcb2a4;padding:8px 0 8px 17px;position:relative;border-bottom:1px solid #2d2923}
.pr-xcard li:before{content:"✳";position:absolute;left:0;color:#e1b657}
.pr-xcard button{margin-top:14px;width:100%;border:1px solid #be9343;color:#f4cf7a;background:transparent;padding:12px;font-size:10px;font-weight:900;letter-spacing:.6px;border-radius:3px;text-align:center}
.pr-journal-door{margin-top:13px;width:100%;text-align:left;border:1px dashed #57452b;background:#171511;padding:18px 20px;border-radius:4px;color:var(--pr-ink)}
.pr-journal-door b{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:19px;letter-spacing:.5px}
.pr-journal-door p{font-size:12px;color:#baa994;line-height:1.6;margin-top:5px}
.pr-journal textarea{width:100%;background:#1c1b15;border:1px solid #846b39;border-radius:3px;padding:15px;min-height:230px;resize:vertical;color:#fff1d5;line-height:1.7;font-size:14.5px;font-family:Georgia,serif}
.pr-journal textarea:focus{border-color:var(--pr-gold);outline:none}
.pr-bottomtape{margin:34px 0 6px;padding:14px 16px;display:flex;gap:12px;justify-content:space-between;background:#d0a645;color:#141009;font-size:10px;font-weight:1000;letter-spacing:1.3px;border-radius:3px}
.pr-bottomtape span:nth-child(2){color:#4a3108}
@media(max-width:740px){.pr-bottomtape{flex-direction:column;text-align:center;gap:6px}}
.pr-overlay{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
.pr-overlay .bk{position:absolute;inset:0;background:#020202cd}
.pr-modal{position:relative;background:#161611;border:1px solid #a17b34;width:min(600px,100%);max-height:88vh;overflow:auto;box-shadow:0 30px 100px #000d;border-radius:4px}
.pr-modal>header{padding:18px 22px;border-bottom:1px solid #4c3e25;display:flex;justify-content:space-between;gap:10px;background:#20190e}
.pr-modal>header h2{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:30px;margin:6px 0 0;color:#f9eaca}
.pr-modal-x{border:1px solid #69502d;background:#15130e;color:#edcf85;width:34px;height:34px;font-size:15px;border-radius:3px;flex:none}
.pr-modal-body{padding:22px}
.pr-modal-body p{color:#b9a997;line-height:1.65;font-size:13.5px}
.pr-guided{text-align:center}
.pr-guided .num{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:54px;color:#d5af53;line-height:1}
.pr-guided h3{font:900 27px Georgia,serif;color:#f5e3b8;margin:10px 0 4px}
.pr-guided blockquote{font:italic 17.5px/1.6 Georgia,serif;color:#f6e6bb;margin:16px auto 6px;max-width:460px}
.pr-guided .ref{font-size:10px;letter-spacing:1.4px;color:#d7b461;font-weight:900}
.pr-guided .prompt{font:15px/1.65 Georgia,serif;color:#d2c4b1;max-width:460px;margin:14px auto 0}
.pr-modal-actions{display:flex;gap:10px;align-items:center;justify-content:center;margin-top:22px;flex-wrap:wrap}
.pr-modal-actions button{padding:13px 17px;background:var(--pr-gold);border:0;color:#181208;font-size:11px;font-weight:1000;letter-spacing:.6px;border-radius:3px}
.pr-modal-actions button.secondary{border:1px solid #68532b;background:transparent;color:#deb85e}
.pr-modal-actions button[disabled]{opacity:.45}
.pr-promise{list-style:none;padding:0;margin:6px 0 0}
.pr-promise li{padding:12px;border-bottom:1px solid #443727;color:#d4c6af;font-size:13.5px;line-height:1.55}
.pr-promise li:before{content:"✛";color:#dfbd63;margin-right:11px}
.pr-toast{position:fixed;top:calc(var(--topbar-h) + 12px);right:16px;z-index:210;max-width:min(390px,calc(100vw - 32px));background:#292214;color:#ffe4a5;border:1px solid #bc9341;padding:13px 18px;font-size:12.5px;line-height:1.55;box-shadow:0 18px 50px #0008;border-radius:4px}
.pr-page-head h1{font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:clamp(34px,4vw,50px);line-height:1;margin:8px 0 6px;color:var(--pr-ink)}
.pr-page-head h1 em{font-style:normal;color:var(--pr-gold)}
.pr-page-head p{color:#ad9e8d;font-size:13px;line-height:1.6;max-width:560px}
</style>`;

function mount(root, html) { S.mountSeq += 1; root.innerHTML = `<div class="pr-wrap">${STYLE}${STYLE2}${html}</div>`; if (window.FaithFilm) window.FaithFilm.wire(root); return S.mountSeq; }

let toastTimer = null;
function toast(root, msg) {
  root.querySelector('.pr-toast')?.remove();
  const t = document.createElement('div');
  t.className = 'pr-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  root.querySelector('.pr-wrap')?.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 4600);
}

/* ---------------- wall cards + lift + encourage --------------------------- */
function visiblePosts() {
  let arr = S.wall.posts.slice();
  if (S.filter === 'answered') arr = arr.filter((p) => p.answeredAt);
  else if (S.filter === 'urgent') arr = arr.filter((p) => p.isUrgent);
  else if (S.filter === 'lifted') arr = arr.slice().sort((a, b) => b.prayerCount - a.prayerCount);
  const q = S.query.trim().toLowerCase();
  if (q) arr = arr.filter((p) => (p.body + ' ' + p.authorName).toLowerCase().includes(q));
  return arr;
}

function postCard(p) {
  const signed = isSignedIn();
  const badge = p.answeredAt ? '<span class="ans">PRAYER ANSWERED</span>' : p.isUrgent ? '<span class="urg">URGENT REQUEST</span>' : 'PUBLIC PRAYER';
  const pill = p.answeredAt ? '<span class="pr-pill ans">Answered</span>' : p.isUrgent ? '<span class="pr-pill urg">Urgent</span>' : '<span class="pr-pill">Prayer request</span>';
  const liftLabel = `${p.prayed ? '✓ Prayed' : '✚ Pray over this'}${p.prayerCount ? ` · ${p.prayerCount} lifted` : ''}${signed ? '' : ' · members — sign in to pray'}`;
  return `<article class="pr-card" data-post="${esc(p.id)}">
    <div class="pr-card-top"><span>${badge}</span><b>${esc(fmtDate(p.createdAt).toUpperCase())}</b></div>
    <div class="pr-card-body">
      <div class="pr-author">
        <span class="pr-ava" aria-hidden="true">${esc(initials(p.authorName))}</span>
        <span><b>${esc(p.authorName)}${p.authorVerified ? ' ✓' : ''}</b><small>${esc(fmtDate(p.createdAt))}${p.location ? ' · ' + esc(p.location) : ''}</small></span>
        ${pill}
      </div>
      <p class="pr-body">${esc(p.body)}</p>
      <div class="pr-stats">
        <span>${p.prayerCount ? `<strong>${p.prayerCount}</strong> LIFTED` : 'BE THE FIRST TO LIFT THIS ONE'}</span>
        ${p.commentCount != null ? `<span><strong>${p.commentCount}</strong> ENCOURAGEMENT${p.commentCount === 1 ? '' : 'S'}</span>` : ''}
      </div>
    </div>
    <div class="pr-actions">
      <button type="button" data-lift="${esc(p.id)}" class="${p.prayed ? 'on' : ''}" aria-label="Pray over this request${signed ? '' : ' — members only, sign-in required'}">${liftLabel}</button>
      <button type="button" data-comments="${esc(p.id)}" aria-expanded="${S.commentsOpen.has(p.id)}">❝ Encourage${p.commentCount ? ` · ${p.commentCount}` : ''}</button>
      <button type="button" data-share="${esc(p.id)}">↗ Share</button>
    </div>
    <div class="pr-lift-note" data-lift-note="${esc(p.id)}" hidden></div>
    <div class="pr-comments" data-commentsbox="${esc(p.id)}" ${S.commentsOpen.has(p.id) ? '' : 'hidden'}></div>
  </article>`;
}

function commentsHTML(post) {
  const st = S.commentsState.get(post.id) || 'idle';
  const rows = S.commentsCache.get(post.id);
  let inner = '';
  if (st === 'loading') inner = '<p class="pr-cnote">Loading encouragements from the live community API…</p>';
  else if (st === 'error') inner = `<p class="pr-cnote">Encouragements for this request load from the live community API, which didn't answer from this network just now — nothing is shown in their place.${post.commentCount != null ? ` The card's count (${post.commentCount}) is the post's real recorded count.` : ''}</p>`;
  else if (rows) {
    inner = rows.length
      ? rows.map((c) => `<div class="pr-comment"><span class="pr-ava" aria-hidden="true">${esc(initials(c.authorName))}</span><div class="pr-bubble"><strong>${esc(c.authorName || 'Member')}</strong><small>${esc(fmtDate(c.createdAt))}</small><p>${esc(c.body || '')}</p></div></div>`).join('')
      : '<p class="pr-cnote">No encouragements yet — be the first voice of faith on this one.</p>';
  }
  const form = isSignedIn()
    ? `<form class="pr-cform" data-cform="${esc(post.id)}"><textarea name="body" maxlength="2000" rows="2" placeholder="Write a word of encouragement…" aria-label="Write a word of encouragement"></textarea><button type="submit">POST</button></form><p class="pr-cnote" data-cstatus="${esc(post.id)}" role="status"></p>`
    : `<p class="pr-cgate">Members encourage out loud. <button type="button" data-act="signin">Sign in</button> to add your voice — reading is open to everyone.</p>`;
  return inner + form;
}

async function loadComments(root, post, force = false) {
  if (!force && S.commentsCache.has(post.id)) { paintComments(root, post); return; }
  S.commentsState.set(post.id, 'loading'); paintComments(root, post);
  try {
    const d = await fetchJSON(`${API}/api/community/posts/${encodeURIComponent(post.id)}/comments`);
    if (!Array.isArray(d.comments)) throw new Error('unexpected comments payload');
    S.commentsCache.set(post.id, d.comments);
    if (d.nextCursor == null && Number.isFinite(post.commentCount)) post.commentCount = d.comments.length;
    S.commentsState.set(post.id, 'ready');
  } catch { S.commentsState.set(post.id, 'error'); }
  paintComments(root, post);
}

function paintComments(root, post) {
  const box = root.querySelector(`[data-commentsbox="${CSS.escape(post.id)}"]`);
  if (!box) return;
  box.innerHTML = commentsHTML(post);
  const form = box.querySelector('[data-cform]');
  if (form) form.addEventListener('submit', (e) => submitComment(root, post, form, e));
  const si = box.querySelector('[data-act="signin"]');
  if (si) si.addEventListener('click', () => document.getElementById('btn-signin')?.click());
}

async function submitComment(root, post, form, e) {
  e.preventDefault();
  const ta = form.querySelector('textarea');
  const status = root.querySelector(`[data-cstatus="${CSS.escape(post.id)}"]`);
  const body = ta.value.trim();
  if (!body) { if (status) status.textContent = 'Write a few words first — an empty encouragement is never posted.'; return; }
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    await fetchJSON(`${API}/api/community/posts/${encodeURIComponent(post.id)}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
    });
    /* Success is claimed only after a real 2xx; re-read the thread so the
       rendered rows are the server's own. */
    S.commentsCache.delete(post.id);
    await loadComments(root, post, true);
    toast(root, 'Your encouragement was posted.');
  } catch (err) {
    if (status) status.textContent = err.status === 401 || err.status === 403
      ? 'The server says this session cannot comment (sign-in or terms gate). Nothing was posted.'
      : `Couldn't post that just now (${err.message}). Nothing was posted — your words are still in the box.`;
    btn.disabled = false;
  }
}

function wireCards(root) {
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
      if (post) {
        post.prayed = !!r.prayed; post.prayerCount = r.prayerCount ?? post.prayerCount;
        btn.classList.toggle('on', post.prayed);
        btn.innerHTML = `${post.prayed ? '✓ Prayed' : '✚ Pray over this'}${post.prayerCount ? ` · ${post.prayerCount} lifted` : ''}`;
      }
      if (note) { note.hidden = true; }
    } catch (err) {
      if (note) { note.hidden = false; note.textContent = `Couldn't record that just now (${err.message}). Nothing was counted.`; }
      btn.disabled = false;
    }
  }));
  root.querySelectorAll('[data-comments]').forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.comments;
    const post = S.wall.posts.find((p) => p.id === id);
    if (!post) return;
    const box = root.querySelector(`[data-commentsbox="${CSS.escape(id)}"]`);
    if (S.commentsOpen.has(id)) { S.commentsOpen.delete(id); if (box) box.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    else { S.commentsOpen.add(id); if (box) box.hidden = false; btn.setAttribute('aria-expanded', 'true'); loadComments(root, post); }
  }));
  root.querySelectorAll('[data-share]').forEach((btn) => btn.addEventListener('click', async () => {
    const post = S.wall.posts.find((p) => p.id === btn.dataset.share);
    if (!post) return;
    const text = `A prayer to hold — ${post.authorName} at 16:3 Faith:\n\n${post.body}`;
    try {
      await navigator.clipboard.writeText(text);
      toast(root, 'Copied. Share it with care — this is somebody\u2019s real prayer.');
    } catch {
      toast(root, 'Copy is not available in this browser — the request above is public on the wall for anyone to read.');
    }
  }));
}

/* ---------------- shared pieces ------------------------------------------- */
function backBar() { return `<div class="pr-bar"><button class="pr-btn" data-act="doors" type="button">← All doors</button></div>`; }
function wireBack(root) { root.querySelector('[data-act="doors"]')?.addEventListener('click', () => showDoors(root)); }

function extrasHTML() {
  return `<div class="pr-extras">
    <section class="pr-xcard">
      <div class="top">SCRIPTURE FOR THE JOURNEY <span>01 / THE WORD</span></div>
      <blockquote>&ldquo;Casting all your care upon him; for he careth for you.&rdquo;</blockquote>
      <div class="ref">1 PETER 5:7 · KJV</div>
    </section>
    <section class="pr-xcard">
      <div class="top">A QUIET MINUTE <span>02 / GUIDED PRAYER</span></div>
      <h3>ONE QUIET MINUTE.</h3>
      <p>Three short steps, each one anchored in the Word — be still, say it plain, then show up for somebody else.</p>
      <button type="button" data-act="guided">TAKE A MOMENT TO PRAY ↗</button>
    </section>
    <section class="pr-xcard">
      <div class="top">HOUSE RULES <span>03 / PRAYER ROOM</span></div>
      <ul>
        <li>Pray with people, not at them.</li>
        <li>No judgment, hate or public shaming.</li>
        <li>Honor privacy. Don&rsquo;t repost someone&rsquo;s pain.</li>
        <li>Don&rsquo;t mistake prayer for emergency help.</li>
      </ul>
      <button type="button" data-act="promise">READ OUR COMMUNITY PROMISE →</button>
    </section>
  </div>`;
}
function wireExtras(root) {
  root.querySelector('[data-act="guided"]')?.addEventListener('click', () => { S.guidedStep = 0; showGuided(root); });
  root.querySelector('[data-act="promise"]')?.addEventListener('click', () => showPromise(root));
}

function sideNav(active) {
  const item = (view, ic, label) => `<button type="button" data-nav="${view}" class="${active === view ? 'active' : ''}"><span class="ic">${ic}</span> ${label} <span class="arr">→</span></button>`;
  return `<aside class="pr-side">
    <section class="pr-side-intro"><span class="pr-side-label">THE ROOM / MENU</span><h2>YOU<br>BELONG<br><em>HERE.</em></h2><p>Not a performance. Not a perfect story. Just a room full of people willing to show up.</p></section>
    <nav class="pr-roomnav" aria-label="Prayer Room pages">
      ${item('wall', '✛', 'THE PRAYER WALL')}
      ${item('lifted', '♥', 'PRAYERS LIFTED')}
      ${item('journal', '✎', 'PRAYER JOURNAL')}
    </nav>
    <div class="pr-side-verse"><span>THE WORD / FOR THE WALL</span><p>&ldquo;Bear ye one another&rsquo;s burdens, and so fulfil the law of Christ.&rdquo;</p><small>GALATIANS 6:2 · KING JAMES BIBLE</small></div>
    <button type="button" class="pr-side-compose" data-nav="request">+ LEAVE A REQUEST</button>
  </aside>`;
}
function wireNav(root) {
  root.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.nav;
    if (v === 'wall') showWall(root);
    else if (v === 'lifted') showLifted(root);
    else if (v === 'journal') showJournal(root);
    else if (v === 'request') showRequest(root);
  }));
}

/* ---------------- overlays: guided prayer + community promise ------------- */
const GUIDED = [
  { title: 'BE STILL.', verse: '&ldquo;Be still, and know that I am God.&rdquo;', ref: 'PSALM 46:10 · KJV', prompt: 'Take one slow breath. You do not have to carry everything at the same time.' },
  { title: 'SAY IT PLAIN.', verse: '&ldquo;Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.&rdquo;', ref: 'PHILIPPIANS 4:6 · KJV', prompt: 'Tell Him plainly what is on your heart — out loud, or in the quiet. He already knows; He still loves to hear your voice.' },
  { title: 'SHOW UP FOR SOMEONE.', verse: '&ldquo;Bear ye one another&rsquo;s burdens, and so fulfil the law of Christ.&rdquo;', ref: 'GALATIANS 6:2 · KJV', prompt: 'Think of one person carrying something heavy tonight, and hold them before God. When you are ready, the wall is full of names who need exactly that.' },
];
function overlayHTML(eyebrow, title, body) {
  return `<div class="pr-overlay" data-overlay><div class="bk" data-close-overlay></div>
    <section class="pr-modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header><div><span class="pr-eyebrow">${eyebrow}</span><h2>${title}</h2></div><button type="button" class="pr-modal-x" data-close-overlay aria-label="Close dialog">✕</button></header>
      <div class="pr-modal-body">${body}</div>
    </section></div>`;
}
function closeOverlay(root) { root.querySelector('[data-overlay]')?.remove(); }
function wireOverlay(root) { root.querySelectorAll('[data-close-overlay]').forEach((el) => el.addEventListener('click', () => closeOverlay(root))); }

function showGuided(root) {
  closeOverlay(root);
  const i = S.guidedStep;
  const g = GUIDED[i];
  const wrap = document.createElement('div');
  wrap.innerHTML = overlayHTML('GUIDED PRAYER / THE PRAYER ROOM', 'ONE QUIET MINUTE.', `
    <div class="pr-guided" data-testid="guided">
      <div class="num">0${i + 1} <span style="font-size:22px;color:#968253">/ 03</span></div>
      <h3>${g.title}</h3>
      <blockquote>${g.verse}</blockquote>
      <div class="ref">${g.ref}</div>
      <p class="prompt">${g.prompt}</p>
      <div class="pr-modal-actions">
        <button type="button" class="secondary" data-gprev ${i === 0 ? 'disabled' : ''}>← BACK</button>
        <button type="button" data-gnext>${i === GUIDED.length - 1 ? 'AMEN. FINISH ✓' : 'NEXT →'}</button>
      </div>
    </div>`);
  root.querySelector('.pr-wrap').appendChild(wrap.firstElementChild);
  wireOverlay(root);
  root.querySelector('[data-gprev]')?.addEventListener('click', () => { S.guidedStep = Math.max(0, S.guidedStep - 1); showGuided(root); });
  root.querySelector('[data-gnext]')?.addEventListener('click', () => {
    if (S.guidedStep >= GUIDED.length - 1) { closeOverlay(root); toast(root, 'Amen. Take that quiet moment with you.'); }
    else { S.guidedStep += 1; showGuided(root); }
  });
}

function showPromise(root) {
  closeOverlay(root);
  const wrap = document.createElement('div');
  wrap.innerHTML = overlayHTML('THE HOUSE RULES / PRAYER ROOM', 'THE COMMUNITY PROMISE.', `
    <p>This is a faith-centered community built around dignity. Faith does not give permission to shame, exploit, harass, or make assumptions about someone&rsquo;s life.</p>
    <ul class="pr-promise">
      <li>Show compassion without pressure. Don&rsquo;t turn anyone&rsquo;s vulnerability into a debate.</li>
      <li>Don&rsquo;t share identifying details about someone else&rsquo;s health, family or situation without consent.</li>
      <li>Let people choose public or genuinely private prayer. Private requests never appear on the wall.</li>
      <li>No spam, solicitation, harassment, threats, or predatory messages.</li>
      <li>Don&rsquo;t promise healing or outcomes. Encourage appropriate professional care when needed.</li>
      <li>Urgent danger or crisis needs qualified immediate support, not a social post — if you are in immediate danger, call your local emergency number first.</li>
    </ul>
    <div class="pr-modal-actions"><button type="button" data-close-overlay>UNDERSTOOD ✓</button></div>`);
  root.querySelector('.pr-wrap').appendChild(wrap.firstElementChild);
  wireOverlay(root);
}

/* ---------------- Doors ----------------------------------------------------- */
function showDoors(root) {
  S.view = 'doors';
  const c = S.counters;
  mount(root, `
    ${window.FaithFilm ? window.FaithFilm.slotHtml({ poster: 'assets/img/pray/pray-dawn.webp', title: 'Leave it on the wall.', note: 'Pray film · in production' }) : ''}
    <div class="pr-topline"><span>16:3 FAITH <b>///</b> THE PRAYER ROOM</span><span class="pr-top-r">EVERYBODY&rsquo;S CARRYING SOMETHING. NOBODY HAS TO CARRY IT ALONE.</span></div>
    <section class="pr-hero reveal">
      <div class="pr-hero-copy">
        <div class="pr-eyebrow"><span class="tiny-red">✳</span> 16:3 FAITH PRESENTS <span class="slashes">///</span> THE PRAYER ROOM</div>
        <h1><span class="w">LEAVE IT</span><span class="w">ON THE</span><em>WALL.</em></h1>
        <p>Some nights you don&rsquo;t have the words. That&rsquo;s alright. Leave your prayer here. Somebody in the family will stand with you.</p>
        <div class="pr-hero-actions">
          <button type="button" class="pr-btn-red" data-goto="request">REQUEST PRAYER <span>↗</span></button>
          <button type="button" class="pr-text-link" data-goto="wall">READ THE WALL <span>→</span></button>
        </div>
        <div class="pr-hero-foot"><span class="small-line"></span> COME AS YOU ARE. NO PERFECT PEOPLE REQUIRED.</div>
      </div>
      <div class="pr-hero-art">
        <img class="pr-hero-cover" src="assets/img/pray/pray-hands.webp" alt="Folded hands in prayer resting on an open Bible in golden window light">
        <span class="pr-sticker">PRAY<br>LOUD.</span>
        <span class="pr-art-vol">THE AFTER-HOURS SESSION / 001</span>
      </div>
    </section>
    <div class="pr-tape"><span>✝ &nbsp; THIS IS WHAT FAMILY LOOKS LIKE</span><span>SPEAK REAL. SHOW LOVE. PRAY OFTEN.</span></div>
    <div class="pr-doors reveal">
      <button class="pr-door" data-door="wall" type="button"><img class="pr-door-art" src="assets/img/pray/pray-candle.webp" alt="" aria-hidden="true" loading="lazy"><span class="pr-door-n">01 / COME IN</span><span class="pr-door-sym">✛</span><strong>THE WALL<span>.</span></strong><small>Read what the family&rsquo;s carrying — ${c ? c.requests : '…'} requests open now, newest first. Stand with someone today.</small><span class="pr-door-arrow">EXPLORE THE WALL ↗</span></button>
      <button class="pr-door hl" data-door="request" type="button"><img class="pr-door-art" src="assets/img/pray/pray-hands.webp" alt="" aria-hidden="true" loading="lazy"><span class="pr-door-n">02 / LET IT OUT</span><span class="pr-door-sym">✎</span><strong>LEAVE A PRAYER<span>.</span></strong><small>Public wall or private to the team. You decide where it goes.</small><span class="pr-chip">Members only — sign-in required</span><span class="pr-door-arrow">WRITE YOUR REQUEST ↗</span></button>
      <button class="pr-door" data-door="lifted" type="button"><img class="pr-door-art" src="assets/img/pray/pray-dawn.webp" alt="" aria-hidden="true" loading="lazy"><span class="pr-door-n">03 / GIVE THANKS</span><span class="pr-door-sym">♥</span><strong>PRAYERS LIFTED<span>.</span></strong><small>${c ? c.lifted : '…'} prayers lifted — the requests the family has lifted, and the ones marked answered.</small><span class="pr-door-arrow">SEE WHAT&rsquo;S BEEN LIFTED ↗</span></button>
    </div>
    ${countersHTML()}
    <section class="ai-shelf" aria-label="Pray AI Prayer Guide">
      <div class="ai-shelf-head"><span class="ai-shelf-title">✦ FaithGuide · AI Prayer Guide</span><span class="ai-tag">Powered by AI</span></div>
      <p>The room is carrying <b>${c ? c.requests : '…'} prayer requests</b>, and the family has lifted <b>${c ? c.lifted : '…'}</b> of them. New here? Start with <b>one quiet minute</b> — the guided prayer walks three short steps (${GUIDED.map((g) => esc(g.title)).join(' · ')}), each with its verse. Or open the Wall and stand with one person by name. No perfect words required.</p>
    </section>
    ${extrasHTML()}
    <button type="button" class="pr-journal-door" data-goto="journal"><b>PRAYER JOURNAL</b><p>Words between you and God alone. The journal lives only on this page, only while you&rsquo;re here — nothing is sent anywhere, nothing is saved when you leave.</p></button>
    <div class="pr-bottomtape"><span>16:3 FAITH / THE PRAYER ROOM</span><span>CHURCH ISN&rsquo;T JUST WHERE YOU GO. IT&rsquo;S WHO SHOWS UP.</span><span>THE FAMILY IS HERE. ♥</span></div>`);
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.door;
    if (d === 'wall') showWall(root);
    else if (d === 'request') showRequest(root);
    else if (d === 'lifted') showLifted(root);
  }));
  root.querySelectorAll('[data-goto]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.goto;
    if (d === 'wall') showWall(root);
    else if (d === 'request') showRequest(root);
    else if (d === 'journal') showJournal(root);
  }));
  wireExtras(root);
  publishDebug();
}

/* ---------------- Wall ------------------------------------------------------ */
function wallListHTML() {
  if (!S.wall.posts.length) {
    return S.wall.source
      ? `<div class="pr-card" data-testid="wall-empty"><div class="pr-card-body"><b>No public prayer requests right now.</b><p class="pr-note">When someone shares a prayer request on the community wall, it shows up here for you to pray over.</p></div></div>`
      : `<div class="pr-err" data-testid="wall-error">The prayer wall could not be loaded: the production API did not answer from this network, and the local production snapshot could not be read either. Nothing is shown in its place — no request is ever invented here.<div class="pr-bar"><button class="pr-btn" data-act="retry-wall" type="button">Try again</button></div></div>`;
  }
  const vis = visiblePosts();
  const filtering = S.filter !== 'all' || S.query.trim();
  if (!vis.length) {
    return `<div class="pr-card" data-testid="wall-nomatch"><div class="pr-card-body"><b>Nothing on this side of the wall.</b><p class="pr-note">${filtering ? 'No loaded request matches that filter or search. ' : ''}Try another filter, clear your search${S.wall.hasMore ? ', or load more of the wall' : ''}.</p></div></div>
    ${S.wall.hasMore ? `<div class="pr-more-wrap"><button class="pr-btn goldb" data-act="more" type="button">Load more prayer requests</button></div>` : ''}`;
  }
  return `<div data-testid="wall-list">${vis.map(postCard).join('')}</div>
    ${filtering ? `<p class="pr-note">Filtering the ${S.wall.posts.length} loaded requests${S.wall.hasMore ? ' — load more to widen the search' : ''} · ${vis.length} match${vis.length === 1 ? '' : 'es'}.</p>` : ''}
    ${S.wall.hasMore ? `<div class="pr-more-wrap"><button class="pr-btn goldb" data-act="more" type="button">Load more prayer requests</button></div>
    <p class="pr-note" style="text-align:center">Showing ${S.wall.posts.length} of ${S.counters ? S.counters.requests : '…'} requests — the list extends, it never silently caps.</p>`
    : `<p class="pr-note" data-testid="wall-end">End of the wall as loaded · ${S.wall.posts.length} request${S.wall.posts.length === 1 ? '' : 's'} shown · source: ${esc(S.wall.source)}</p>`}
    ${S.wall.snapshotProvenance ? `<p class="pr-note">${esc(S.wall.snapshotProvenance)}</p>` : ''}`;
}

function paintWallList(root) {
  const slot = root.querySelector('[data-listslot]');
  if (!slot) return;
  slot.innerHTML = wallListHTML();
  const more = slot.querySelector('[data-act="more"]');
  if (more) more.addEventListener('click', async () => { more.disabled = true; more.textContent = 'Loading…'; await loadMoreWall(); paintWallList(root); });
  const retry = slot.querySelector('[data-act="retry-wall"]');
  if (retry) retry.addEventListener('click', async () => { S.wall.source = ''; S.prime = null; await primeWall(); paintWallList(root); });
  wireCards(root);
  /* restore any open comment drawers from cache/state */
  S.commentsOpen.forEach((id) => { const p = S.wall.posts.find((x) => x.id === id); if (p) loadComments(root, p); });
  publishDebug();
}

function wallView(root, { liftedMode = false } = {}) {
  const title = liftedMode ? 'PRAYERS <em>LIFTED.</em>' : 'THE PRAYER <em>WALL.</em>';
  const desc = liftedMode
    ? 'Requests the family has lifted — every one read and prayed over by real people.'
    : 'Real burdens. Real encouragement. You&rsquo;re not praying alone.';
  mount(root, `
    ${backBar()}
    <div class="pr-shell">
      ${sideNav(liftedMode ? 'lifted' : 'wall')}
      <section>
        <div class="pr-feed-head">
          <div><span class="pr-eyebrow">THE HEART OF THIS PLACE</span><h2>${title}</h2><p>${desc}</p></div>
          <button type="button" class="pr-outline-gold" data-nav="request">+ REQUEST PRAYER</button>
        </div>
        <div class="pr-status"><span><span class="pr-dot"></span><b>${liftedMode ? 'HOPE IS STILL HERE' : 'THE WALL IS OPEN'}</b></span><span class="src">${esc(S.wall.source || 'gathering…')}</span></div>
        ${countersHTML()}
        ${liftedMode ? '<div data-listslot></div>' : `
        <div class="pr-controls">
          <div class="pr-chips" role="group" aria-label="Filter requests">
            <button type="button" data-filter="all" class="${S.filter === 'all' ? 'selected' : ''}">ALL REQUESTS</button>
            <button type="button" data-filter="answered" class="${S.filter === 'answered' ? 'selected' : ''}">ANSWERED</button>
            <button type="button" data-filter="urgent" class="${S.filter === 'urgent' ? 'selected' : ''}">URGENT</button>
            <button type="button" data-filter="lifted" class="${S.filter === 'lifted' ? 'selected' : ''}">MOST LIFTED</button>
          </div>
          <label class="pr-search"><span>⌕</span><input type="search" data-search placeholder="Find prayers" aria-label="Search prayer wall" value="${esc(S.query)}"></label>
        </div>
        <div data-listslot></div>
        <div class="pr-below"><span>YOU MADE IT THIS FAR.</span><strong>SOMEBODY NEEDED YOUR PRAYER TODAY.</strong><button type="button" data-nav="request">LEAVE YOUR OWN ↗</button></div>`}
      </section>
    </div>
    ${extrasHTML()}`);
  wireBack(root);
  wireNav(root);
  wireExtras(root);
  if (!liftedMode) {
    root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      S.filter = b.dataset.filter;
      root.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('selected', x === b));
      paintWallList(root);
    }));
    const search = root.querySelector('[data-search]');
    if (search) search.addEventListener('input', () => { S.query = search.value; paintWallList(root); });
  }
}

async function showWall(root) {
  S.view = 'wall';
  wallView(root);
  root.querySelector('[data-listslot]').innerHTML = '<p class="pr-note">Gathering the wall…</p>';
  await primeWall();
  if (S.view === 'wall') { wallView(root); paintWallList(root); }
}

/* ---------------- Lifted door: same data source as the wall --------------- */
async function showLifted(root) {
  S.view = 'lifted';
  wallView(root, { liftedMode: true });
  root.querySelector('[data-listslot]').innerHTML = '<p class="pr-note">Gathering the lifted prayers…</p>';
  await primeWall();
  await ensureFullWall();
  if (S.view !== 'lifted') return;
  wallView(root, { liftedMode: true });
  const lifted = S.wall.posts.filter((p) => p.prayerCount > 0).slice().sort((a, b) => b.prayerCount - a.prayerCount);
  const totalLiftedActions = S.wall.posts.reduce((s, p) => s + (p.prayerCount || 0), 0);
  const slot = root.querySelector('[data-listslot]');
  slot.innerHTML = `
    <p class="pr-note" data-testid="lifted-summary" style="margin-top:14px">${S.counters ? S.counters.lifted : '…'} prayers lifted across the room (counters source above). From the wall data itself: ${lifted.length} lifted request${lifted.length === 1 ? '' : 's'} · ${totalLiftedActions} lifts recorded on them · same data source as the wall: ${esc(S.wall.source)}${S.wall.loadedAll || !S.wall.hasMore ? '' : ' (first pages)'}.</p>
    ${lifted.length ? `<div data-testid="lifted-list">${lifted.map(postCard).join('')}</div>` : `<div class="pr-card"><div class="pr-card-body"><b>No lifted requests in the loaded wall data.</b><p class="pr-note">When a member lifts a request on the wall, it appears here.</p></div></div>`}
    ${S.wall.snapshotProvenance ? `<p class="pr-note">${esc(S.wall.snapshotProvenance)}</p>` : ''}`;
  wireCards(root);
  publishDebug();
}

/* ---------------- Request door (#27/#28) ---------------------------------- */
function showRequest(root) {
  S.view = 'request';
  if (!isSignedIn()) {
    /* #28 cured: the sign-in path IS the content — not a heading over a void.
       #27 cured: members-only is stated here, before any click, in words. */
    mount(root, `
      ${backBar()}
      <div class="pr-page-head"><span class="pr-eyebrow">PRAY · REQUEST PRAYER</span><h1>SHARE YOUR <em>PRAYER.</em></h1><p>Bring your request before the Lord and let the 16:3 family stand with you.</p></div>
      ${countersHTML()}
      <div class="pr-gate" data-testid="request-gate">
        <span class="pr-chip">Members only</span>
        <h2>Posting a prayer is for <span class="g">members</span></h2>
        <p>Anyone can read the wall and pray along. <b style="color:var(--bone)">Posting</b> a request — public, for the whole family to lift, or private, seen only by you and the 16:3 team — takes a free membership, so every request on the wall comes from a real member of the family.</p>
        <p>Sign in if you&rsquo;re already a member. New here? Join free — it takes a minute, and your request can go up right after.</p>
        <div class="pr-bar" style="justify-content:center">
          <button class="pr-btn goldb" data-act="signin" type="button">Sign in to post</button>
          <button class="pr-btn" data-act="join" type="button">Join free</button>
          <button class="pr-btn" data-act="wall" type="button">Read the wall instead</button>
        </div>
        <p class="pr-note">No form is hidden behind this panel: signing in returns you here with the posting form open. Nothing is recorded until you post.</p>
      </div>`);
    wireBack(root);
    root.querySelector('[data-act="signin"]').addEventListener('click', () => document.getElementById('btn-signin')?.click());
    root.querySelector('[data-act="join"]').addEventListener('click', () => document.getElementById('btn-join')?.click());
    root.querySelector('[data-act="wall"]').addEventListener('click', () => showWall(root));
    return;
  }
  /* Signed-in: the full posting form (production shape). */
  mount(root, `
    ${backBar()}
    <div class="pr-page-head"><span class="pr-eyebrow">PRAY · REQUEST PRAYER</span><h1>SHARE YOUR <em>PRAYER.</em></h1><p>Write what&rsquo;s on your heart. Public requests go on the community wall; private ones go directly to the 16:3 team.</p></div>
    ${countersHTML()}
    <form class="pr-form" data-form="post">
      <label class="fl" for="pr-body">WHAT&rsquo;S ON YOUR HEART?</label>
      <textarea id="pr-body" name="body" maxlength="2000" rows="5" placeholder="Lord, I&rsquo;m asking for…"></textarea>
      <p class="pr-count"><span data-role="chars">0</span>/2000</p>
      <span class="fl" style="margin-top:16px">WHO SHOULD SEE THIS REQUEST?</span>
      <div class="pr-priv" role="radiogroup" aria-label="Who can see this">
        <label><input type="radio" name="visibility" value="public" checked><span><b>✛ PUBLIC WALL</b><small>Appears on the prayer wall for every visitor to read and lift.</small></span></label>
        <label><input type="radio" name="visibility" value="private"><span><b>▣ PRIVATE TO THE TEAM</b><small>Never published on the wall — it goes to the 16:3 team&rsquo;s own prayer room, and only they can see it.</small></span></label>
      </div>
      <p class="pr-note" data-role="vis-note">Public requests appear on the wall for every visitor to read and lift.</p>
      <div class="pr-warn"><strong>PRIVACY FIRST.</strong> Share only what you&rsquo;re comfortable with, and never somebody else&rsquo;s private details. If you are in immediate danger, call your local emergency number first — this wall is a family, not an emergency service.</div>
      <div class="pr-bar"><button class="pr-btn-red" type="submit" data-role="submit" style="border-radius:3px">LEAVE THE REQUEST ↗</button></div>
      <p class="pr-note" data-role="form-status" role="status"></p>
    </form>`);
  wireBack(root);
  const form = root.querySelector('[data-form="post"]');
  const ta = form.querySelector('textarea');
  ta.addEventListener('input', () => { form.querySelector('[data-role="chars"]').textContent = String(ta.value.length); });
  form.querySelectorAll('input[name="visibility"]').forEach((r) => r.addEventListener('change', () => {
    form.querySelector('[data-role="vis-note"]').textContent = r.value === 'private' && r.checked
      ? 'This will be sent directly to the 16:3 team. Only they can see it — it won\u2019t appear on the community wall.'
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
        ${backBar()}
        <div class="pr-gate" data-testid="post-success"><h2>Your prayer was <span class="g">posted.</span></h2>
        <p>${visibility === 'private' ? 'Your private prayer was sent to the team.' : 'Your prayer request was posted to the community wall.'}</p>
        <div class="pr-bar" style="justify-content:center"><button class="pr-btn goldb" data-act="wall" type="button">See the wall</button></div></div>`);
      wireBack(root);
      root.querySelector('[data-act="wall"]').addEventListener('click', () => { S.wall.source = ''; S.wall.posts = []; S.prime = null; showWall(root); });
    } catch (err) {
      status.textContent = err.status === 401 || err.status === 403
        ? 'The server says this session cannot post (sign-in or terms gate). Nothing was posted — sign in again and accept the terms, then retry.'
        : `Couldn't submit right now (${err.message}). Nothing was posted — your words are still in the form above.`;
      btn.disabled = false;
    }
  });
}

/* ---------------- Journal (session-only, honestly labeled) ---------------- */
function showJournal(root) {
  S.view = 'journal';
  mount(root, `
    ${backBar()}
    <div class="pr-shell">
      ${sideNav('journal')}
      <section class="pr-journal">
        <span class="pr-eyebrow">YOUR PRIVATE ROOM / THIS PAGE ONLY</span>
        <div class="pr-feed-head"><div><h2 style="font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:1000;font-size:clamp(30px,3.2vw,42px);color:var(--pr-ink);margin:8px 0 5px">MY PRAYER <em style="font-style:normal;color:var(--pr-gold)">JOURNAL.</em></h2>
        <p style="color:#ad9e8d;font-size:12.5px;line-height:1.55">Sometimes your words are meant for you and God alone.</p></div></div>
        <p class="pr-cnote" style="margin-bottom:12px">This journal lives only in this page, on this device, for this visit. Nothing is sent to 16:3 Faith or anyone else, nothing is saved when you leave the Prayer Room, and nobody can read it here. It is <b>not</b> a prayer request — to ask the family to pray, use <b>Leave a Prayer</b>.</p>
        <label class="fl" for="pr-journal" style="display:block;margin:0 0 8px;font-size:10px;letter-spacing:1px;font-weight:950;color:#e8cf97">WHAT&rsquo;S ON YOUR HEART?</label>
        <textarea id="pr-journal" data-journal maxlength="5000" placeholder="Dear God, today I&rsquo;m carrying…">${esc(journalText)}</textarea>
        <div class="pr-bar" style="margin-top:12px">
          <button class="pr-btn goldb" data-act="journal-wall" type="button">Back to the wall</button>
          <button class="pr-btn" data-act="journal-clear" type="button">Clear this page</button>
          <span class="pr-note" data-journal-note style="margin-top:0">${journalText ? 'Held on this page only — it disappears when you leave the Prayer Room.' : ''}</span>
        </div>
      </section>
    </div>`);
  wireBack(root);
  wireNav(root);
  const ta = root.querySelector('[data-journal]');
  ta.addEventListener('input', () => {
    journalText = ta.value;
    const n = root.querySelector('[data-journal-note]');
    if (n) n.textContent = journalText ? 'Held on this page only — it disappears when you leave the Prayer Room.' : '';
  });
  root.querySelector('[data-act="journal-wall"]').addEventListener('click', () => showWall(root));
  root.querySelector('[data-act="journal-clear"]').addEventListener('click', () => { journalText = ''; ta.value = ''; ta.dispatchEvent(new Event('input')); });
}

/* ---------------- render ---------------------------------------------------- */
export async function render(root) {
  S = freshState();
  journalText = ''; // leaving the hub ends the journal session — as labeled
  /* Counters + doors are local-first: the doors render immediately with the
     baked counters if the pulse read is slow; the strip re-renders in place
     when the one source resolves. No loading overlay (§4). */
  showDoors(root);
  const seq = S.mountSeq;
  loadCounters().then(() => { publishDebug(); if (S.view === 'doors' && S.mountSeq === seq) showDoors(root); }).catch(() => {});
  primeWall().catch(() => {});
}
