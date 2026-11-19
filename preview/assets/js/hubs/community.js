/* COMMUNITY hub v1 (SPEC §3.5) — Feed / Testimonies / Members doors
   (HUB BREAKDOWN LAW), house author profile (D14), groups + messages in
   their honest states.

   DATA ROUTE — API-first, baked capture as fallback (house pattern):
   - Feed: GET {apiBase}/api/community/posts (paginated, nextOffset) —
     the exact guest route the production probe verified (2026-10-26).
   - Members: GET {apiBase}/api/community/members (defensive normalize).
   - Fallback: assets/data/community/{feed,members,meta}.json — verbatim
     production captures (guest feed pages, 2026-10-21/22). No fabricated
     posts, testimonies, members, groups, or conversations anywhere.

   F-COMMUNITY (SPEC §2.2): the five restoration flags (prayers · messages ·
   conversations · groups · prayer_chain_links) are UNPROVEN — disabled
   2026-10-10 ("Data restoration pending"), no later record reads them, and
   live reads were impossible from the build sandbox. Every flag-gated
   surface therefore renders its honest state, never a simulation.
   Authenticated legs (own profile, posting, inbox) are UNGRADED until a
   back-end session route exists; signed-out states are built, signed-in
   experiences are never faked. */

const API_BASE = 'https://faith-hub-api.onrender.com';
const DATA = 'assets/data/community/';
const PAGE = 10;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const KIND_LABEL = {
  verse_of_day: 'Verse of the Day', monday_prayer: 'Monday Prayer Kickoff',
  sunday_gathering: 'Sunday Gathering', friday_thread: 'Friday Thread',
  saturday_reflection: 'Saturday Reflection',
};
const TYPE_LABEL = { general: 'Post', testimony: 'Testimony', prayer: 'Prayer' };

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const st = document.createElement('style');
  st.textContent = `
  .cm-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:24px}
  .cm-door{position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--panel);min-height:138px;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;text-align:left;color:var(--bone);width:100%}
  .cm-door:hover{border-color:var(--gold-dim)}
  .cm-door .cm-art{position:absolute;inset:0;background:radial-gradient(120% 120% at 20% 0%,rgba(212,175,55,.26),rgba(5,5,5,0) 55%),linear-gradient(160deg,#171204,#0a0a0a 65%)}
  .cm-door .cm-ico{position:absolute;top:14px;left:16px;font-size:24px;color:var(--gold)}
  .cm-door h3{position:relative;font-family:var(--serif);font-size:20px}
  .cm-door p{position:relative;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.45}
  .cm-note{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:14px 16px;color:var(--mute);font-size:13.5px;line-height:1.55;margin-top:16px}
  .cm-note b{color:var(--gold-hi)}
  .cm-src{font-size:12px;color:var(--mute);letter-spacing:.06em;margin-top:10px}
  .cm-src b{color:var(--gold)}
  .cm-post{border:1px solid var(--line);border-radius:16px;background:var(--coal);padding:16px;margin-top:12px}
  .cm-phead{display:flex;gap:12px;align-items:center}
  .cm-ava{position:relative;width:44px;height:44px;flex:none;border-radius:50%;overflow:hidden;background:#000;border:1px solid var(--gold-dim);display:flex;align-items:center;justify-content:center;font-family:var(--serif);color:var(--gold);font-size:15px}
  .cm-ava img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .cm-ava.big{width:72px;height:72px;font-size:24px}
  .cm-aname{background:none;border:none;color:var(--bone);font-size:15px;font-weight:600;text-align:left;padding:0;cursor:pointer}
  .cm-aname:hover{color:var(--gold-hi)}
  .cm-ver{color:var(--gold);font-size:12px}
  .cm-meta{font-size:12px;color:var(--mute)}
  .cm-chip{display:inline-block;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);border:1px solid var(--gold-dim);border-radius:999px;padding:2px 9px;margin-left:8px;vertical-align:2px}
  .cm-body{margin-top:10px;font-size:14.5px;line-height:1.6;color:var(--bone);white-space:pre-wrap;word-break:break-word;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
  .cm-post.open .cm-body{display:block;-webkit-line-clamp:unset}
  .cm-pfoot{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:12.5px;color:var(--mute);align-items:center}
  .cm-more{background:none;border:none;color:var(--gold);font-size:13px;padding:0;cursor:pointer}
  .cm-more:hover{color:var(--gold-hi)}
  .cm-load{display:block;margin:20px auto 4px}
  .cm-mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:16px}
  .cm-mcard{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:14px;text-align:left;color:var(--bone);width:100%;display:flex;flex-direction:column;gap:5px;align-items:flex-start}
  .cm-mcard:hover{border-color:var(--gold-dim)}
  .cm-mcard b{font-size:14.5px;line-height:1.3}
  .cm-back{margin-top:14px}
  .cm-house{display:flex;gap:16px;align-items:center;border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:16px;margin-top:16px;width:100%;text-align:left;color:var(--bone)}
  .cm-house:hover{border-color:var(--gold)}
  .cm-profhead{display:flex;gap:18px;align-items:center;margin-top:18px;flex-wrap:wrap}
  `;
  document.head.appendChild(st);
}

async function fetchJson(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
const baked = (name) => fetch(new URL(DATA + name, document.baseURI)).then((r) => { if (!r.ok) throw new Error(name); return r.json(); });

function normPost(p) {
  return {
    id: p.id, type: p.type || 'general',
    authorId: p.authorId, authorName: p.authorName || 'Member',
    authorAvatar: p.authorAvatar || null, authorVerified: !!p.authorVerified,
    authorBadges: p.authorBadges || [], body: p.body || '',
    createdAt: p.createdAt || p.created_at || null, location: p.location || null,
    prayerCount: p.prayerCount ?? null, commentCount: p.commentCount ?? null,
    reactionCounts: p.reactionCounts || {}, shareCount: p.shareCount || 0,
    systemKind: p.systemKind || null, isSystemPost: !!p.isSystemPost,
    isPinned: !!p.isPinned, groupId: p.groupId || null, answeredAt: p.answeredAt || null,
  };
}

export function render(root) {
  injectCss();
  const S = {
    view: 'doors', mode: null, // 'live' | 'snapshot'
    posts: [], members: [], meta: null, feedShown: PAGE, testShown: PAGE,
    profileId: null, query: '',
  };
  window.__community = { state: S, ready: false };

  root.innerHTML = `
    <p class="kicker">Community</p>
    <h1>The family <span class="g">talks here.</span></h1>
    <p class="lede">The feed, the testimonies, and each other — real posts and real people from the 16:3 Faith community.</p>
    <div data-cm="main"><p class="cm-src">Loading the community…</p></div>`;
  const main = root.querySelector('[data-cm="main"]');

  /* ---------- data loading: live API first, baked capture fallback ---------- */
  async function loadFeed() {
    try {
      const seen = new Set(); const out = [];
      let url = `${API_BASE}/api/community/posts?limit=25`;
      for (let page = 0; page < 3 && url; page++) {
        const j = await fetchJson(url);
        const rows = Array.isArray(j) ? j : (j.posts || []);
        for (const p of rows) { if (!seen.has(p.id)) { seen.add(p.id); out.push(normPost(p)); } }
        url = (j && j.hasMore && j.nextOffset != null) ? `${API_BASE}/api/community/posts?limit=25&offset=${j.nextOffset}` : null;
      }
      if (!out.length) throw new Error('empty feed');
      return { posts: out, mode: 'live' };
    } catch {
      const b = await baked('feed.json');
      return { posts: b.posts.map(normPost), mode: 'snapshot' };
    }
  }
  async function loadMembers(feedPosts) {
    try {
      const j = await fetchJson(`${API_BASE}/api/community/members?limit=100`);
      const rows = Array.isArray(j) ? j : (j.members || j.profiles || []);
      const ms = rows.map((m) => ({
        id: m.userId || m.id || m.clerkId || null, name: m.name || m.displayName || m.username || 'Member',
        avatar: m.avatar || m.avatarUrl || null, verified: !!m.verified, badges: m.badges || [],
        location: m.location || null, posts: m.postCount ?? null, latestAt: m.createdAt || null, types: {},
      })).filter((m) => m.name);
      if (ms.length) return { members: ms, mode: 'live' };
      throw new Error('empty members');
    } catch {
      const b = await baked('members.json');
      return { members: b.members, mode: 'snapshot' };
    }
  }

  /* ---------- shared bits ---------- */
  const avatarHtml = (name, avatar, big) => `
    <span class="cm-ava${big ? ' big' : ''}">${avatar ? `<img src="${esc(avatar)}" alt="" onerror="this.remove()">` : ''}<span>${esc(initials(name))}</span></span>`;
  const reactionTotal = (p) => Object.values(p.reactionCounts || {}).reduce((a, b) => a + (b || 0), 0);

  function postCard(p) {
    const kind = p.systemKind ? KIND_LABEL[p.systemKind] : null;
    const title = kind || (p.type === 'testimony' ? 'Testimony' : null);
    return `
    <article class="cm-post" data-post="${esc(p.id)}">
      <div class="cm-phead">
        ${avatarHtml(p.authorName, p.authorAvatar, false)}
        <div>
          <button type="button" class="cm-aname" data-profile="${esc(p.authorId)}">${esc(p.authorName)}${p.authorVerified ? ' <span class="cm-ver" title="Verified">✦</span>' : ''}</button>
          <div class="cm-meta">${esc(fmtDate(p.createdAt))}${p.location ? ' · ' + esc(p.location) : ''}<span class="cm-chip">${esc(TYPE_LABEL[p.type] || 'Post')}</span></div>
        </div>
      </div>
      ${title ? `<p style="margin-top:10px;font-family:var(--serif);font-size:16.5px;color:var(--gold-hi)">${esc(title)}</p>` : ''}
      <p class="cm-body">${esc(p.body)}</p>
      <div class="cm-pfoot">
        ${p.prayerCount ? `<span>🙏 ${p.prayerCount} praying</span>` : ''}
        ${p.commentCount ? `<span>💬 ${p.commentCount}</span>` : ''}
        ${reactionTotal(p) ? `<span>♥ ${reactionTotal(p)}</span>` : ''}
        ${p.answeredAt ? `<span style="color:var(--gold)">Prayer answered</span>` : ''}
        <button type="button" class="cm-more" data-expand="${esc(p.id)}">See more</button>
      </div>
    </article>`;
  }

  function countersHtml() {
    const c = S.meta?.counters || { members: 126, testimoniesCounter: 50, prayerRequests: 84, prayersLifted: 19 };
    return `<div class="counters">
      <div class="counter"><b>${c.members}</b><span>Members</span></div>
      <div class="counter"><b>${c.testimoniesCounter}</b><span>Testimonies</span></div>
      <div class="counter"><b>${c.prayerRequests}</b><span>Prayer requests</span></div>
      <div class="counter"><b>${c.prayersLifted}</b><span>Prayers lifted</span></div>
    </div>
    <p class="cm-src">Counters: production totals rendered 2026-11-17/18 (census §2)${S.mode === 'live' ? ' · feed below is <b>live</b> from the community API' : ' · showing the captured production feed — the live API did not answer from this network'}.</p>`;
  }

  function honestStatesHtml() {
    return `
    <div class="cm-note" data-honest="messages"><b>Messages are being restored.</b> Direct messages were paused during the 2026-10-10 data restoration, and their current state has not been verified — so there is no inbox here yet, and nothing is simulated. Signed-out, the old face's message gate behaved correctly (census Leg-5); the inbox itself is graded when a back-end session route exists.</div>
    <div class="cm-note" data-honest="groups"><b>Groups are being restored.</b> Rendered walks counted <b>7 starter groups</b> on the old face (2026-11-15/17), but the groups flag state is unverified and the guest API returns no groups to signed-out visitors — so no group names or counts are listed here rather than invented. Groups return with verified data.</div>
    <div class="cm-note" data-honest="composer"><b>Join to post.</b> Posting, commenting, and reacting are member actions behind sign-in (shell account controls). Signed-out, this hub is read-only — by design, exactly as the old face gates it.</div>`;
  }

  /* ---------- views ---------- */
  function viewDoors() {
    S.view = 'doors';
    const house = (S.meta?.house || []).find((h) => h.id === 'system_163faith');
    main.innerHTML = `
      ${countersHtml()}
      <div class="hub-search"><input type="search" data-cm="q" placeholder="Find people & posts" aria-label="Search Community" value="${esc(S.query)}"></div>
      <div class="cm-doors">
        <button type="button" class="cm-door" data-door="feed"><span class="cm-art"></span><span class="cm-ico">●</span><h3>Feed</h3><p>${S.posts.length} posts ${S.mode === 'live' ? 'live' : 'in the captured pages'} — the family's wall</p></button>
        <button type="button" class="cm-door" data-door="testimonies"><span class="cm-art"></span><span class="cm-ico">✦</span><h3>Testimonies</h3><p>What God has done — told by the people it happened to</p></button>
        <button type="button" class="cm-door" data-door="members"><span class="cm-art"></span><span class="cm-ico">♥</span><h3>Members</h3><p>The directory — ${(S.meta?.counters?.members) || 126} members strong</p></button>
      </div>
      ${house ? `<button type="button" class="cm-house" data-profile="system_163faith">${avatarHtml(house.name, null, true)}<span><b style="font-size:16.5px">${esc(house.name)}</b> <span class="cm-chip">House</span><br><span class="cm-meta">The house author of the feed — profile renders fully here (the old face's dead profile, census #29, does not recur).</span></span></button>` : ''}
      ${honestStatesHtml()}`;
    wireCommon();
  }

  function postListHtml(list, shown) {
    return list.slice(0, shown).map(postCard).join('') +
      (list.length > shown ? `<button type="button" class="btn-gold cm-load" data-act="more">Load more (${list.length - shown} more)</button>` : '');
  }

  function viewFeed() {
    S.view = 'feed';
    let list = S.posts;
    if (S.query) {
      const q = S.query.toLowerCase();
      list = list.filter((p) => (p.body + ' ' + p.authorName).toLowerCase().includes(q));
    }
    main.innerHTML = `
      <button type="button" class="btn-ghost back-btn cm-back" data-act="doors">← All Community doors</button>
      <div class="shelf"><h3>Feed <span class="shelf-count">· ${list.length} posts${S.query ? ` for “${esc(S.query)}”` : ''}</span></h3>
      <p class="cm-src">${S.mode === 'live' ? 'Live from the production community API.' : 'Captured production feed (2026-10-21/22 guest pages) — real posts, served in the API\'s own order. Post text loads live wherever the API answers.'} Tap a name for the member's profile; “See more” opens the full post.</p>
      <div data-list>${postListHtml(list, S.feedShown)}</div></div>`;
    wireCommon();
  }

  function viewTestimonies() {
    S.view = 'testimonies';
    const list = S.posts.filter((p) => p.type === 'testimony');
    const db = S.meta?.counters?.dbProbe20261026;
    main.innerHTML = `
      <button type="button" class="btn-ghost back-btn cm-back" data-act="doors">← All Community doors</button>
      <div class="shelf"><h3>Testimonies <span class="shelf-count">· ${list.length} in this ${S.mode === 'live' ? 'live pull' : 'capture'}</span></h3>
      <p class="cm-src">Testimonies are posts of type “testimony” in the same community table that feeds the counters — the filter the old face proves (census Leg-4). Production totals on record: <b>${db ? db.testimonyPostsPublished : 182} published testimony posts</b> (DB read 2026-10-26); the homepage counter surface reads <b>${S.meta?.counters?.testimoniesCounter || 50}</b> — the two surfaces count differently and both numbers are carried here as recorded, not smoothed over.</p>
      <div data-list>${list.length ? postListHtml(list, S.testShown) : '<div class="cm-note">No testimonies in this capture.</div>'}</div></div>`;
    wireCommon();
  }

  function viewMembers() {
    S.view = 'members';
    let list = S.members;
    if (S.query) {
      const q = S.query.toLowerCase();
      list = list.filter((m) => (m.name + ' ' + (m.location || '')).toLowerCase().includes(q));
    }
    main.innerHTML = `
      <button type="button" class="btn-ghost back-btn cm-back" data-act="doors">← All Community doors</button>
      <div class="shelf"><h3>Members <span class="shelf-count">· ${(S.meta?.counters?.members) || 126} on the production counter</span></h3>
      <p class="cm-src">${S.mode === 'live' ? 'Live directory from the community API.' : `This directory shows the ${S.members.length} members evidenced in the captured production data (authors of served posts, plus census-proven profiles). The full directory rides the live API; nobody here is invented, and profiles render regardless of Clerk mapping state (SPEC §2.1).`}</p>
      <div class="cm-mgrid">${list.map((m) => `
        <button type="button" class="cm-mcard" data-profile="${esc(m.id || '')}" ${m.id ? '' : 'data-noprofile="1"'}>
          ${avatarHtml(m.name, m.avatar, false)}
          <b>${esc(m.name)}${m.verified ? ' <span class="cm-ver">✦</span>' : ''}</b>
          <span class="cm-meta">${m.location ? esc(m.location) + ' · ' : ''}${m.posts != null ? m.posts + (m.posts === 1 ? ' post' : ' posts') + ' in capture' : ''}</span>
        </button>`).join('')}</div></div>`;
    wireCommon();
  }

  function viewProfile(id) {
    S.view = 'profile'; S.profileId = id;
    const house = (S.meta?.house || []).find((h) => h.id === id);
    const member = S.members.find((m) => m.id === id);
    const posts = S.posts.filter((p) => p.authorId === id);
    const name = house?.name || member?.name || posts[0]?.authorName || 'Member';
    const avatar = house?.avatar || member?.avatar || posts[0]?.authorAvatar || null;
    main.innerHTML = `
      <button type="button" class="btn-ghost back-btn cm-back" data-act="doors">← All Community doors</button>
      <div class="cm-profhead" data-profile-head="${esc(id)}">
        ${avatarHtml(name, avatar, true)}
        <div>
          <h2>${esc(name)}${(house || member?.verified || posts[0]?.authorVerified) ? ' <span class="cm-ver">✦</span>' : ''}${house ? '<span class="cm-chip">House</span>' : ''}</h2>
          <p class="cm-meta">${house ? esc(house.headline || house.kind || '') : (member?.location ? esc(member.location) + ' · ' : '') + 'Member of 16:3 Faith'}</p>
          ${house?.bio ? `<p class="lede" style="margin-top:6px">${esc(house.bio)}</p>` : ''}
          ${house?.note ? `<p class="cm-src">${esc(house.note)}</p>` : ''}
          <p class="cm-meta" style="margin-top:6px">${house?.followerCount != null ? house.followerCount + ' followers · ' : ''}${posts.length} posts in this ${S.mode === 'live' ? 'live pull' : 'capture'}${house?.postCount != null ? ` · ${house.postCount} posts on record (2026-10-21)` : ''}</p>
        </div>
      </div>
      <div data-list>${posts.length ? posts.map(postCard).join('') : '<div class="cm-note">No posts by this member in the captured pages.</div>'}</div>`;
    wireCommon();
  }

  /* ---------- wiring ---------- */
  function wireCommon() {
    main.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
      const d = b.dataset.door;
      if (d === 'feed') viewFeed(); else if (d === 'testimonies') viewTestimonies(); else viewMembers();
    }));
    const back = main.querySelector('[data-act="doors"]');
    if (back) back.addEventListener('click', viewDoors);
    const more = main.querySelector('[data-act="more"]');
    if (more) more.addEventListener('click', () => {
      if (S.view === 'feed') { S.feedShown += PAGE; viewFeed(); }
      else if (S.view === 'testimonies') { S.testShown += PAGE; viewTestimonies(); }
    });
    main.querySelectorAll('[data-expand]').forEach((b) => b.addEventListener('click', () => {
      const card = b.closest('.cm-post');
      const open = card.classList.toggle('open');
      card.dataset.expanded = open ? '1' : '';
      b.textContent = open ? 'See less' : 'See more';
    }));
    main.querySelectorAll('[data-profile]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.profile;
      if (id) viewProfile(id);
    }));
    const q = main.querySelector('[data-cm="q"]');
    if (q) q.addEventListener('input', () => {
      S.query = q.value.trim();
      if (S.query) viewFeed();
    });
    window.__community.ready = true;
    window.__community.openProfile = viewProfile;
  }

  /* ---------- boot ---------- */
  (async () => {
    try { S.meta = await baked('meta.json'); } catch { S.meta = null; }
    const feed = await loadFeed();
    S.posts = feed.posts; S.mode = feed.mode;
    const mem = await loadMembers(S.posts);
    S.members = mem.members;
    if (mem.mode === 'live') S.mode = 'live';
    viewDoors();
  })().catch((e) => {
    main.innerHTML = `<div class="cm-note"><b>The community could not be loaded.</b> Neither the live API nor the captured data answered (${esc(e.message)}). Nothing is simulated in its place.</div>`;
  });
}
