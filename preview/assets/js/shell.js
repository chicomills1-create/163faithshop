/* 16:3 Faith — fresh build shell.
   Structure per SPEC §1.2: homepage = hub selector; seven hubs lazy-loaded as
   separate ES modules (no catalog bundle, per-hub payloads); persistent nav;
   the music player is mounted once in index.html, OUTSIDE #hub-root, and is
   never re-created on a hub switch — playback survives navigation (§4 gate).
   Clean slate per hub: each hub render builds fresh local state (search /
   filters reset); global state (auth, playback) lives here and survives.

   PLAYER (PLAYER LAW, 2026-11-19): Kairo-style transport, YouTube source.
   Two engines behind one face: a hidden YouTube IFrame-API player (the music
   source — full songs only, no video surface ever shown) and the <audio>
   element (direct-file tracks, e.g. the scaffold demo tone). The face is the
   track's exact album cover + this shell's own transport: play/pause,
   prev/next, seek, queue. Queue + position survive hub switches because the
   player DOM and this state object are never rebuilt. */

const HUB_ORDER = ['watch', 'listen', 'read', 'pray', 'community', 'give', 'shop'];
const root = document.getElementById('hub-root');
const loaded = new Map(); // hub name -> { module, loadedAt }

const $ = (id) => document.getElementById(id);
const fmt = (s) => {
  if (!isFinite(s) || s == null || s < 0) return '0:00';
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
};

const Player = {
  audio: $('player-audio'),
  titleEl: $('player-title'),
  subEl: $('player-sub'),
  coverEl: $('player-cover'),
  provEl: $('player-prov'),
  playBtn: $('btn-play'),
  prevBtn: $('btn-prev'),
  nextBtn: $('btn-next'),
  closeBtn: $('btn-close'),
  seekEl: $('player-seek'),
  elapsedEl: $('player-elapsed'),
  totalEl: $('player-total'),
  stageEl: $('stage'),
  stageCoverEl: $('stage-cover'),
  stageTitleEl: $('stage-title'),
  stageSubEl: $('stage-sub'),
  stageProvEl: $('stage-prov'),
  stageEndedEl: $('stage-ended'),
  stageEndedLineEl: $('stage-ended-line'),
  stageSeekEl: $('stage-seek'),
  stageElapsedEl: $('stage-elapsed'),
  stageTotalEl: $('stage-total'),
  play2Btn: $('btn-play2'),
  prev2Btn: $('btn-prev2'),
  next2Btn: $('btn-next2'),
  repeatBtn: $('btn-repeat'),
  stageQueueEl: $('stage-queue'),
  stageQueueLabelEl: $('stage-queue-label'),
  stageQueueRowsEl: $('stage-queue-rows'),
  engine: null,          // 'yt' | 'audio' | null
  current: null,         // { title, sub, cover, youtubeId? , src? }
  queue: [],             // [{ youtubeId, title, sub, cover }]
  qIndex: -1,
  queueLabel: '',
  yt: null,              // YT.Player instance
  ytReady: false,
  ytPending: null,       // videoId requested before the API was ready
  seeking: false,
  repeatOne: false,      // G-03: repeat-one toggle (Kairo K9)
  ended: false,          // G-06: the ended state is a designed place
  buffering: false,      // G-05: loading shows on the play control only
  stageOpen: false,      // G-01: Stage (expanded now-playing) mode

  /* ---------- face ---------- */
  emit() { window.dispatchEvent(new CustomEvent('faithplayer', { detail: this.state() })); },
  setFace(track) {
    this.current = track;
    this.ended = false;
    const title = track.title || 'Untitled';
    this.titleEl.textContent = title;
    this.subEl.textContent = track.sub || '';
    const coverHtml = (track.cover ? `<img src="${track.cover}" alt="" onerror="this.remove()">` : '') + '<span>16:3</span>';
    this.coverEl.innerHTML = coverHtml;
    /* Stage face mirrors the bar: same exact cover, full identity (G-01). */
    this.stageTitleEl.textContent = title;
    this.stageSubEl.textContent = track.sub || '';
    this.stageCoverEl.innerHTML = coverHtml;
    /* G-07 provenance: the source fact rides the face. Wording is Faith's
       (full songs, YouTube source) — shown only for the YouTube engine. */
    const prov = this.engine === 'yt' ? 'Full song · YouTube' : '';
    this.provEl.hidden = !prov;
    this.stageProvEl.hidden = !prov;
    if (prov) this.stageProvEl.textContent = prov;
    this.coverEl.disabled = false;
    this.titleEl.disabled = false;
    this.coverEl.setAttribute('aria-label', `Open now playing: ${title}`);
    this.titleEl.setAttribute('aria-label', `Open now playing: ${title}`);
    this.stageEndedEl.hidden = true;
    this.syncTransport(false);
    this.renderQueue();
    this.emit();
  },
  setPlayingUI(playing) {
    const glyph = playing ? '⏸' : '▶';
    this.playBtn.textContent = glyph;
    this.play2Btn.textContent = glyph;
    this.syncTransport(playing);
  },
  /* G-05: buffering shows on the play control only — no fake percentages. */
  setBuffering(on) {
    this.buffering = !!on;
    this.playBtn.classList.toggle('buffering', this.buffering);
    this.play2Btn.classList.toggle('buffering', this.buffering);
  },
  /* G-04 (no dead controls) + G-08 (accessible names carry the claim):
     prev/next/play/close render only when they can act, and their names
     name the track they act on. */
  syncTransport(playing) {
    const has = !!this.current;
    const title = has ? (this.current.title || 'Untitled') : '';
    const isPlaying = typeof playing === 'boolean' ? playing
      : (this.engine === 'yt' && this.ytReady ? this.yt.getPlayerState() === 1
        : this.engine === 'audio' ? !this.audio.paused : false);
    for (const b of [this.playBtn, this.play2Btn]) {
      b.hidden = !has;
      b.setAttribute('aria-label', !has ? 'Play'
        : this.ended ? `Replay ${title}`
        : isPlaying ? `Pause ${title}` : `Play ${title}`);
    }
    this.closeBtn.hidden = !has;
    const prevTitle = this.qIndex > 0 ? this.queue[this.qIndex - 1].title : null;
    const nextT = this.qIndex + 1 < this.queue.length ? this.queue[this.qIndex + 1] : null;
    /* Prev is a real control when a previous track exists, or — on the
       YouTube engine — as restart-current (X-2, Spotify parity). */
    const prevOk = has && (prevTitle !== null || this.engine === 'yt');
    for (const b of [this.prevBtn, this.prev2Btn]) {
      b.hidden = !prevOk;
      b.setAttribute('aria-label', prevTitle !== null ? `Previous: ${prevTitle}` : `Restart ${title}`);
    }
    for (const b of [this.nextBtn, this.next2Btn]) {
      b.hidden = !nextT;
      b.setAttribute('aria-label', nextT ? `Next: ${nextT.title}` : 'Next track');
    }
    this.repeatBtn.setAttribute('aria-pressed', String(this.repeatOne));
    this.repeatBtn.classList.toggle('on', this.repeatOne);
  },
  /* G-02: the visible queue — current track first, then up next, labeled
     from the queue's own source (queueLabel: artist or door today, album
     when the album view lands). Rows are playable tracks only — the queue
     holds nothing else by construction — and tapping a row jumps. */
  renderQueue() {
    const show = this.stageOpen && this.queue.length > 0 && this.qIndex >= 0;
    this.stageQueueEl.hidden = !show;
    if (!show) { this.stageQueueRowsEl.innerHTML = ''; return; }
    const from = this.queueLabel || (this.current && this.current.sub) || '';
    this.stageQueueLabelEl.textContent = from ? `Up next — from ${from}` : 'Up next';
    this.stageQueueRowsEl.innerHTML = '';
    for (let i = this.qIndex; i < this.queue.length; i++) {
      const t = this.queue[i];
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'trow' + (i === this.qIndex ? ' playing' : '');
      row.dataset.qindex = String(i);
      const num = document.createElement('span');
      num.className = 'tnum'; num.textContent = String(i + 1);
      const tt = document.createElement('span');
      tt.className = 'ttitle'; tt.textContent = t.title || 'Untitled';
      row.append(num, tt);
      if (t.sub && t.sub !== from) {
        const sb = document.createElement('span');
        sb.className = 'tsub'; sb.textContent = t.sub;
        row.append(sb);
      }
      if (i === this.qIndex) {
        const now = document.createElement('span');
        now.className = 'tnow'; now.textContent = 'Now playing';
        row.append(now);
      }
      row.addEventListener('click', () => this.playAt(i));
      this.stageQueueRowsEl.append(row);
    }
  },
  /* ---------- Stage (G-01) ---------- */
  openStage() {
    if (!this.current) return;
    this.stageOpen = true;
    this.stageEl.hidden = false;
    document.body.classList.add('stage-open');
    this.renderQueue();
    this.emit();
  },
  closeStage() {
    this.stageOpen = false;
    this.stageEl.hidden = true;
    document.body.classList.remove('stage-open');
    this.emit();
  },

  /* ---------- YouTube engine ---------- */
  ensureYT() {
    if (this.yt || this._ytLoading) return;
    this._ytLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      this.yt = new window.YT.Player('yt-player', {
        width: '1', height: '1',
        playerVars: { playsinline: 1, controls: 0, disablekb: 1, rel: 0 },
        events: {
          onReady: () => {
            this.ytReady = true;
            if (this.ytPending) { const id = this.ytPending; this.ytPending = null; this._ytLoad(id); }
          },
          onStateChange: (e) => {
            const S = window.YT.PlayerState;
            if (e.data === S.ENDED) this.onEnded();
            if (e.data === S.PLAYING) { this.setBuffering(false); this.setPlayingUI(true); }
            if (e.data === S.PAUSED) { this.setBuffering(false); this.setPlayingUI(false); }
            if (e.data === S.BUFFERING) this.setBuffering(true);
            if (e.data === S.CUED) this.setBuffering(false);
          },
        },
      });
    };
  },
  _ytLoad(videoId) {
    if (!this.ytReady) { this.ytPending = videoId; this.ensureYT(); return; }
    this.yt.loadVideoById(videoId);
  },

  /* ---------- transport ---------- */
  play(track) {  // direct-file track (audio engine)
    if (!track || !track.src) return;
    if (this.yt && this.ytReady) this.yt.stopVideo();
    this.engine = 'audio';
    this.queue = []; this.qIndex = -1;
    this.ended = false;
    this.stageEndedEl.hidden = true;
    if (this.current && this.subEl.textContent === 'Ended') this.subEl.textContent = this.current.sub || '';
    if (!this.current || this.current.src !== track.src) {
      this.audio.src = track.src;
      this.setFace(track);
    }
    this.syncTransport();
    this.renderQueue();
    this.audio.play();
  },
  playQueue(tracks, index = 0, label = '') {
    if (!tracks || !tracks.length) return;
    this.queue = tracks.slice();
    this.queueLabel = label || '';
    this.playAt(index);
  },
  playAt(i) {
    if (i < 0 || i >= this.queue.length) return;
    this.qIndex = i;
    const t = this.queue[i];
    this.engine = 'yt';
    this.audio.pause();
    this.setFace({
      title: t.title, youtubeId: t.youtubeId,
      sub: [t.sub, this.queueLabel].filter(Boolean).join(' · '),
      cover: t.cover || null,
    });
    this._ytLoad(t.youtubeId);
    this.emit();
  },
  toggle() {
    if (!this.current) return;
    if (this.ended) { this.replay(); return; }
    if (this.engine === 'yt') {
      if (!this.ytReady) return;
      const st = this.yt.getPlayerState();
      if (st === window.YT.PlayerState.PLAYING) this.yt.pauseVideo(); else this.yt.playVideo();
    } else if (this.engine === 'audio') {
      if (this.audio.paused) this.audio.play(); else this.audio.pause();
    }
  },
  next() { if (this.qIndex + 1 < this.queue.length) this.playAt(this.qIndex + 1); },
  prev() {
    if (this.engine === 'yt' && this.ytReady && this.yt.getCurrentTime() > 3) { this.yt.seekTo(0, true); return; }
    if (this.qIndex > 0) this.playAt(this.qIndex - 1);
  },
  seekTo(sec) {
    if (this.engine === 'yt' && this.ytReady) this.yt.seekTo(sec, true);
    else if (this.engine === 'audio') this.audio.currentTime = sec;
  },
  /* G-03: repeat-one — on track end the same track restarts. */
  toggleRepeat() {
    this.repeatOne = !this.repeatOne;
    this.syncTransport();
    this.emit();
  },
  /* Track-end routing, both engines: repeat-one restarts the same track;
     a next track auto-advances (F8); otherwise the ended state (G-06). */
  onEnded() {
    this.setBuffering(false);
    if (this.repeatOne && this.current) { this.replay(); return; }
    if (this.qIndex + 1 < this.queue.length) { this.playAt(this.qIndex + 1); return; }
    this.enterEnded();
  },
  /* G-06: the ended state is a place — cover held, replay offered, and
     the next title named whenever one exists. Never a cold stop. */
  enterEnded() {
    this.ended = true;
    this.setPlayingUI(false);
    const nextT = this.qIndex + 1 < this.queue.length ? this.queue[this.qIndex + 1] : null;
    const title = this.current ? (this.current.title || 'Untitled') : '';
    this.subEl.textContent = nextT ? `Ended — next: ${nextT.title}` : 'Ended';
    this.stageEndedLineEl.textContent = nextT
      ? `“${title}” ended — next: ${nextT.title}` : `“${title}” ended`;
    this.stageEndedEl.hidden = false;
    this.syncTransport(false);
    this.emit();
  },
  replay() {
    if (!this.current) return;
    this.ended = false;
    this.stageEndedEl.hidden = true;
    this.subEl.textContent = this.current.sub || '';
    if (this.engine === 'yt' && this.qIndex >= 0) { this.playAt(this.qIndex); return; }
    if (this.engine === 'yt' && this.current.youtubeId) {
      this.setFace(this.current);
      this._ytLoad(this.current.youtubeId);
      return;
    }
    if (this.engine === 'audio') { this.audio.currentTime = 0; this.audio.play(); }
  },
  close() {
    if (this.yt && this.ytReady) this.yt.stopVideo();
    this.audio.pause(); this.audio.removeAttribute('src'); this.audio.load();
    this.engine = null; this.queue = []; this.qIndex = -1; this.queueLabel = '';
    this.current = null;
    this.repeatOne = false; this.ended = false;
    this.setBuffering(false);
    this.closeStage();
    this.titleEl.textContent = 'Nothing playing';
    this.subEl.textContent = 'Pick a song in the Listen hub';
    this.coverEl.innerHTML = '<span>16:3</span>';
    this.stageTitleEl.textContent = 'Nothing playing';
    this.stageSubEl.textContent = '';
    this.stageCoverEl.innerHTML = '<span>16:3</span>';
    this.provEl.hidden = true;
    this.stageProvEl.hidden = true;
    this.stageEndedEl.hidden = true;
    this.coverEl.disabled = true;
    this.titleEl.disabled = true;
    for (const el of [this.seekEl, this.stageSeekEl]) { el.value = 0; el.disabled = true; }
    this.elapsedEl.textContent = '0:00'; this.totalEl.textContent = '';
    this.stageElapsedEl.textContent = '0:00'; this.stageTotalEl.textContent = '';
    this.setPlayingUI(false);
    this.syncTransport(false);
    this.renderQueue();
    this.emit();
  },
  position() {
    if (this.engine === 'yt' && this.ytReady) {
      return { t: this.yt.getCurrentTime() || 0, d: this.yt.getDuration() || 0 };
    }
    if (this.engine === 'audio') return { t: this.audio.currentTime || 0, d: this.audio.duration || 0 };
    return { t: 0, d: 0 };
  },
  state() {
    const p = this.position();
    return {
      engine: this.engine,
      youtubeId: this.current ? (this.current.youtubeId || null) : null,
      title: this.current ? this.current.title : null,
      queueLength: this.queue.length, qIndex: this.qIndex, queueLabel: this.queueLabel,
      currentTime: p.t, duration: p.d,
      paused: this.engine === 'yt' ? (this.ytReady ? this.yt.getPlayerState() !== 1 : null)
        : this.engine === 'audio' ? this.audio.paused : null,
      ytState: this.engine === 'yt' && this.ytReady ? this.yt.getPlayerState() : null,
      repeatOne: this.repeatOne, ended: this.ended,
      buffering: this.buffering, stageOpen: this.stageOpen,
    };
  },
};
Player.audio.addEventListener('play', () => Player.setPlayingUI(true));
Player.audio.addEventListener('pause', () => Player.setPlayingUI(false));
Player.audio.addEventListener('ended', () => Player.onEnded());
Player.audio.addEventListener('waiting', () => Player.setBuffering(true));
Player.audio.addEventListener('playing', () => Player.setBuffering(false));
Player.audio.addEventListener('canplay', () => Player.setBuffering(false));
$('btn-play').addEventListener('click', () => Player.toggle());
$('btn-next').addEventListener('click', () => Player.next());
$('btn-prev').addEventListener('click', () => Player.prev());
$('btn-close').addEventListener('click', () => Player.close());
$('btn-play2').addEventListener('click', () => Player.toggle());
$('btn-next2').addEventListener('click', () => Player.next());
$('btn-prev2').addEventListener('click', () => Player.prev());
$('btn-repeat').addEventListener('click', () => Player.toggleRepeat());
$('btn-replay').addEventListener('click', () => Player.replay());
$('player-cover').addEventListener('click', () => Player.openStage());
$('player-title').addEventListener('click', () => Player.openStage());
$('btn-stage-collapse').addEventListener('click', () => Player.closeStage());
$('stage-backdrop').addEventListener('click', () => Player.closeStage());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && Player.stageOpen) Player.closeStage(); });
/* Seek wiring, both faces. G-09: a seek control is only live once the
   engine reports a real duration — until then the row shows elapsed
   only and offers no false total. */
for (const el of [Player.seekEl, Player.stageSeekEl]) {
  el.addEventListener('input', () => {
    const { d } = Player.position();
    if (d > 0) Player.seekTo((el.value / 1000) * d);
  });
  el.addEventListener('pointerdown', () => { Player.seeking = true; });
  el.addEventListener('keydown', () => { Player.seeking = true; });
  el.addEventListener('change', () => { Player.seeking = false; });
}
setInterval(() => {
  if (!Player.current) return;
  const { t, d } = Player.position();
  const elapsed = fmt(t);
  Player.elapsedEl.textContent = elapsed;
  Player.stageElapsedEl.textContent = elapsed;
  const known = d > 0;
  for (const [seek, total] of [[Player.seekEl, Player.totalEl], [Player.stageSeekEl, Player.stageTotalEl]]) {
    total.textContent = known ? fmt(d) : '';
    seek.disabled = !known;
    seek.classList.toggle('seek-static', !known);
    if (known && !Player.seeking) seek.value = Math.round((t / d) * 1000);
    if (!known) seek.value = 0;
  }
}, 500);
window.FaithPlayer = Player;

function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('on', a.dataset.nav === name);
  });
}

async function loadHub(name) {
  if (!loaded.has(name)) {
    const t0 = performance.now();
    const module = await import(`./hubs/${name}.js`);
    loaded.set(name, { module, loadedAt: performance.now(), loadMs: performance.now() - t0 });
  }
  return loaded.get(name).module;
}

let currentHub = null;
async function navigate(name) {
  if (![...HUB_ORDER, 'home'].includes(name)) name = 'home';
  const mod = await loadHub(name);
  root.innerHTML = '';
  mod.render(root, { navigate, player: Player });
  currentHub = name;
  setActiveNav(name);
  root.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function routeFromHash() {
  const m = window.location.hash.match(/^#\/([a-z]+)/);
  return m ? m[1] : 'home';
}
window.addEventListener('hashchange', () => navigate(routeFromHash()));

/* Account controls (§3.8) — shell-level placeholders at scaffold stage. */
document.getElementById('btn-signin').addEventListener('click', () => {
  window.alert('Sign-in mounts here at the F-CLERK leg: same Clerk production instance, loaded directly from the Clerk FAPI host — no /api/__clerk proxy.');
});
document.getElementById('btn-join').addEventListener('click', () => {
  window.alert('Join mounts here at the F-CLERK leg: form visible from first paint, terms gate server-side (JOIN cure carries).');
});

navigate(routeFromHash());

/* ---------- Self-test (proof harness; runs only with ?selftest=1) ----------
   Drives the real shell: starts playback, walks every hub, and verifies the
   player node + audio position survive, every hub module loaded lazily, and
   each hub rendered content. Then the LISTEN battery: doors → genre shelf →
   artist view → track tap → YouTube player state, then hub switches mid-play.
   Results land in <pre id="selftest-report">. */
if (new URLSearchParams(location.search).has('selftest')) {
  (async () => {
    const report = { startedAt: new Date().toISOString(), checks: [] };
    const ok = (name, pass, detail) => report.checks.push({ name, pass: !!pass, detail });
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const waitFor = async (fn, timeout = 12000, step = 250) => {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) { const v = fn(); if (v) return v; await sleep(step); }
      return null;
    };
    try {
      await sleep(600);
      const audioNode = Player.audio;
      Player.play({ title: 'Self-test tone', sub: 'scaffold proof track', src: 'assets/audio/demo-tone.wav' });
      await sleep(1400);
      for (const hub of HUB_ORDER) {
        location.hash = `#/${hub}`;
        await sleep(450);
        ok(`hub ${hub} rendered`, root.children.length > 0 && currentHub === hub, `children=${root.children.length}`);
        ok(`hub ${hub} module lazy-loaded once`, loaded.has(hub), `loadMs=${loaded.get(hub) ? loaded.get(hub).loadMs.toFixed(1) : 'n/a'}`);
      }
      location.hash = '#/home';
      await sleep(450);
      ok('player node identity survives all hub switches', Player.audio === audioNode, 'same <audio> element reference');
      const playedThrough = audioNode.ended && audioNode.currentTime >= audioNode.duration - 0.25;
      ok('playback uninterrupted across all switches', (!audioNode.paused && audioNode.currentTime > 0.1) || playedThrough, `t=${audioNode.currentTime.toFixed(2)}s duration=${audioNode.duration.toFixed(2)}s paused=${audioNode.paused} ended=${audioNode.ended}`);
      const resources = performance.getEntriesByType('resource')
        .filter((e) => /\.(js|css)(\?|$)/.test(e.name) || /listen-index\.json/.test(e.name))
        .map((e) => ({ file: e.name.split('/').slice(-2).join('/'), bytes: e.transferSize || e.encodedBodySize || 0 }));
      report.resources = resources;
      report.listenEntryBytes = resources
        .filter((r) => !/hubs\/(watch|read|pray|community|give|shop)\.js/.test(r.file))
        .reduce((s, r) => s + r.bytes, 0);
      ok('LISTEN entry payload <= 1 MB (SPEC §4)', report.listenEntryBytes <= 1_000_000, `${report.listenEntryBytes} bytes (shell+css+listen module+artist index)`);

      /* ---- LISTEN battery (v1 wiring) ---- */
      location.hash = '#/listen';
      const L = await waitFor(() => window.__listen && window.__listen.ready ? window.__listen : null, 20000);
      ok('LISTEN data index loaded', !!L, L ? `${L.index.artists.length} artists · ${L.index.doors.length} doors` : 'window.__listen never became ready');
      if (L) {
        const doorCards = await waitFor(() => root.querySelectorAll('[data-door]').length === 17 && root.querySelectorAll('[data-door]'), 10000);
        ok('LISTEN genre doors render (17)', !!doorCards, `${root.querySelectorAll('[data-door]').length} door cards`);
        ok('LISTEN roster shelf renders artist cards', root.querySelectorAll('[data-artist]').length > 0, `${root.querySelectorAll('[data-artist]').length} cards on doors view`);
        /* CORS probe — evidence for the runtime-fd route from this origin. */
        try {
          const r = await fetch('https://faith-hub-api.onrender.com/api/sanctuary/full-discography?artist=Lecrae');
          const j = await r.json();
          report.corsFd = { ok: true, status: r.status, releases: (j.releases || []).length };
        } catch (e) { report.corsFd = { ok: false, error: String(e) }; }
        /* genre door → shelf */
        const doorCard = root.querySelector('[data-door="hip-hop"]');
        doorCard.click();
        const shelfCards = await waitFor(() => root.querySelectorAll('[data-artist]').length > 0 && root.querySelectorAll('[data-artist]'), 8000);
        ok('genre door → artist shelf renders', !!shelfCards, shelfCards ? `${shelfCards.length} artist cards in Hip-Hop` : 'no cards');
        const lecraeCard = root.querySelector('[data-artist="lecrae"]');
        ok('shelf contains Lecrae (named sample)', !!lecraeCard, lecraeCard ? 'card present' : 'absent');
        if (lecraeCard) {
          lecraeCard.click();
          const rows = await waitFor(() => root.querySelectorAll('[data-track]').length > 0 && root.querySelectorAll('[data-track]'), 15000);
          ok('artist view → playable track rows render', !!rows, rows ? `${rows.length} playable rows` : 'none');
          const relState = await waitFor(() => { const el = root.querySelector('[data-releases]'); return el && el.dataset.releases !== 'loading' ? el : null; }, 30000);
          ok('artist view → Albums & Projects resolves (API or honest fallback)', !!relState, relState ? relState.dataset.releases : 'section never resolved');
          if (rows) {
            const first = rows[0];
            const wantId = first.dataset.track;
            const ytIframeBefore = document.querySelector('#yt-holder iframe');
            first.click();
            const srcSet = await waitFor(() => {
              const st = Player.state();
              return st.youtubeId === wantId ? st : null;
            }, 10000);
            ok('track tap → player source set (YouTube id)', !!srcSet, srcSet ? `id=${srcSet.youtubeId} engine=${srcSet.engine} queue=${srcSet.queueLength}` : `player=${JSON.stringify(Player.state())}`);
            ok('player face shows the tapped track + cover', Player.titleEl.textContent === first.dataset.title && !!(Player.current && Player.current.cover), `title="${Player.titleEl.textContent}" coverUrl=${Player.current ? Player.current.cover : null} (img element rides transport; state carries the exact cover)`);
            const playing = await waitFor(() => { const s = Player.state(); return (s.ytState === 1 || s.ytState === 3) ? s : null; }, 9000);
            ok('YouTube playback starts (PLAYING/BUFFERING)', !!playing, playing ? `ytState=${playing.ytState}` : `ytState=${Player.state().ytState} (headless may refuse; founder-device proof is the audible standard)`);
            /* hub switch mid-play */
            const ytIframe = document.querySelector('#yt-holder iframe');
            const qBefore = Player.state();
            location.hash = '#/watch'; await sleep(700);
            location.hash = '#/home'; await sleep(700);
            const qAfter = Player.state();
            ok('YT iframe node identity survives hub switches', !!ytIframe && document.querySelector('#yt-holder iframe') === ytIframe, ytIframeBefore ? 'iframe existed pre-tap' : 'iframe created by tap, same node after switches');
            ok('queue + position survive hub switches', qAfter.queueLength === qBefore.queueLength && qAfter.qIndex === qBefore.qIndex && qAfter.youtubeId === qBefore.youtubeId, `q=${qAfter.queueLength} idx=${qAfter.qIndex} id=${qAfter.youtubeId}`);
          }
        }
      }
      report.pass = report.checks.every((c) => c.pass);
    } catch (err) {
      report.pass = false;
      report.error = String(err && err.stack || err);
    }
    const pre = document.createElement('pre');
    pre.id = 'selftest-report';
    pre.textContent = JSON.stringify(report, null, 2);
    document.body.appendChild(pre);
    document.title = report.pass ? 'SELFTEST PASS' : 'SELFTEST FAIL';
  })();
}
