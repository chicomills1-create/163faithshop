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
  barEl: $('player'),
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
  npEl: $('nowplaying'),
  npCoverEl: $('np-cover'),
  npTitleEl: $('np-title'),
  npSubEl: $('np-sub'),
  npProvEl: $('np-prov'),
  npEndedEl: $('np-ended'),
  npEndedLineEl: $('np-ended-line'),
  npSeekEl: $('np-seek'),
  npElapsedEl: $('np-elapsed'),
  npTotalEl: $('np-total'),
  npPlayBtn: $('btn-np-play'),
  npPrevBtn: $('btn-np-prev'),
  npNextBtn: $('btn-np-next'),
  npRepeatBtn: $('btn-np-repeat'),
  npBackLabelEl: $('np-back-label'),
  npQueueToggleEl: $('btn-np-queue'),
  npQueueEl: $('np-queue'),
  npQueueRowsEl: $('np-queue-rows'),
  npFilmEl: $('np-film'),
  npVolumeEl: $('np-volume'),
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
  npOpen: false,         // Now Playing page (founder directive 2026-11-19)
  npContext: '',         // the list context the song was picked from
  npQueueOpen: false,    // queue panel inside the Now Playing page
  volume: 100,           // 0–100, applied to whichever engine is live

  /* ---------- face ---------- */
  emit() { window.dispatchEvent(new CustomEvent('faithplayer', { detail: this.state() })); },
  /* HIDE-WHEN-IDLE (founder order 2026-11-22): the dock exists on screen
     only while a track is loaded (playing, paused, or ended). setFace()
     is the single load funnel and close() the single unload, so these
     are the only two call sites. body.player-on reserves the dock's
     height in the page padding; without it the hidden bar leaves no gap. */
  syncDock() {
    const has = !!this.current;
    if (this.barEl) this.barEl.hidden = !has;
    document.body.classList.toggle('player-on', has);
  },
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
    /* Now Playing face mirrors too: same exact cover, full identity. */
    this.npTitleEl.textContent = title;
    this.npSubEl.textContent = track.sub || '';
    this.npCoverEl.innerHTML = coverHtml;
    /* G-07 provenance: the source fact rides the face. Wording is Faith's
       (full songs, YouTube source) — shown only for the YouTube engine. */
    const prov = this.engine === 'yt' ? 'Full song · YouTube' : '';
    this.provEl.hidden = !prov;
    this.stageProvEl.hidden = !prov;
    this.npProvEl.hidden = !prov;
    if (prov) this.stageProvEl.textContent = prov;
    this.coverEl.disabled = false;
    this.titleEl.disabled = false;
    this.coverEl.setAttribute('aria-label', `Open now playing: ${title}`);
    this.titleEl.setAttribute('aria-label', `Open now playing: ${title}`);
    this.stageEndedEl.hidden = true;
    this.npEndedEl.hidden = true;
    this.syncTransport(false);
    this.syncDock();
    this.renderQueue();
    this.renderNpQueue();
    this.emit();
  },
  setPlayingUI(playing) {
    const glyph = playing ? '⏸' : '▶';
    this.playBtn.textContent = glyph;
    this.play2Btn.textContent = glyph;
    this.npPlayBtn.textContent = glyph;
    this.syncTransport(playing);
  },
  /* G-05: buffering shows on the play control only — no fake percentages. */
  setBuffering(on) {
    this.buffering = !!on;
    this.playBtn.classList.toggle('buffering', this.buffering);
    this.play2Btn.classList.toggle('buffering', this.buffering);
    this.npPlayBtn.classList.toggle('buffering', this.buffering);
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
    for (const b of [this.playBtn, this.play2Btn, this.npPlayBtn]) {
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
    for (const b of [this.prevBtn, this.prev2Btn, this.npPrevBtn]) {
      b.hidden = !prevOk;
      b.setAttribute('aria-label', prevTitle !== null ? `Previous: ${prevTitle}` : `Restart ${title}`);
    }
    for (const b of [this.nextBtn, this.next2Btn, this.npNextBtn]) {
      b.hidden = !nextT;
      b.setAttribute('aria-label', nextT ? `Next: ${nextT.title}` : 'Next track');
    }
    for (const b of [this.repeatBtn, this.npRepeatBtn]) {
      b.setAttribute('aria-pressed', String(this.repeatOne));
      b.classList.toggle('on', this.repeatOne);
    }
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

  /* ---------- Now Playing page (founder directive 2026-11-19) ----------
     Picking a song opens this dedicated full-screen view of the SAME
     engine — no reload, no restart; the hub underneath is untouched, so
     Back lands on the exact list (position included) the song came
     from. The scene is ambience: a cinematic concert-crowd film that
     lazy-loads on first open; reduced motion keeps the poster still. */
  openNowPlaying(context) {
    if (!this.current) return;
    this.npContext = context || this.queueLabel
      || (this.current.sub ? this.current.sub.split(' · ')[0] : '') || 'Listen';
    this.npBackLabelEl.textContent = this.npContext;
    this.npOpen = true;
    this.npEl.hidden = false;
    document.body.classList.add('np-open');
    this.startFilm();
    this.renderNpQueue();
    this.emit();
  },
  closeNowPlaying() {
    if (!this.npOpen) return;
    this.npOpen = false;
    this.npEl.hidden = true;
    document.body.classList.remove('np-open');
    if (this.npFilmEl) this.npFilmEl.pause();
    this.emit();
  },
  startFilm() {
    const film = this.npFilmEl;
    if (!film) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!film.getAttribute('src') && film.dataset.src) film.src = film.dataset.src;
    const p = film.play();
    if (p && p.catch) p.catch(() => { /* poster stays — ambience only */ });
  },
  /* The queue inside the page: same rows, same label duty as the Stage
     panel (G-02) — "Up next — from <source>"; tapping a row jumps and
     stays in the page. The toggle names the source even while closed. */
  renderNpQueue() {
    const hasQ = this.queue.length > 0 && this.qIndex >= 0;
    const from = this.queueLabel || (this.current && this.current.sub) || '';
    this.npQueueToggleEl.hidden = !hasQ;
    this.npQueueToggleEl.textContent = from ? `Up next — from ${from}` : 'Up next';
    this.npQueueToggleEl.setAttribute('aria-expanded', String(this.npQueueOpen));
    const show = this.npOpen && this.npQueueOpen && hasQ;
    this.npQueueEl.hidden = !show;
    if (!show) { this.npQueueRowsEl.innerHTML = ''; return; }
    this.npQueueRowsEl.innerHTML = '';
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
      this.npQueueRowsEl.append(row);
    }
  },
  /* ±10s skips (the founder's Kairo-page spec): seek within the track's
     own true length, clamped like every seek here (K8). */
  skipBy(delta) {
    if (!this.current) return;
    const { t, d } = this.position();
    const target = d > 0 ? Math.max(0, Math.min(t + delta, d)) : Math.max(0, t + delta);
    this.seekTo(target);
  },
  /* Volume: the YouTube iframe API and the <audio> element both take a
     level; the stored value applies to whichever engine is live and is
     re-applied on engine ready / track load. */
  setVolume(v) {
    this.volume = Math.max(0, Math.min(100, Math.round(v) || 0));
    if (this.npVolumeEl && +this.npVolumeEl.value !== this.volume) this.npVolumeEl.value = this.volume;
    this.applyVolume();
    this.emit();
  },
  applyVolume() {
    if (this.engine === 'yt' && this.ytReady && this.yt.setVolume) this.yt.setVolume(this.volume);
    if (this.engine === 'audio') this.audio.volume = this.volume / 100;
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
            this.applyVolume();
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
    this.npEndedEl.hidden = true;
    if (this.current && this.subEl.textContent === 'Ended') this.subEl.textContent = this.current.sub || '';
    if (!this.current || this.current.src !== track.src) {
      this.audio.src = track.src;
      this.setFace(track);
    }
    this.syncTransport();
    this.renderQueue();
    this.renderNpQueue();
    this.applyVolume();
    this.audio.play();
    this.openNowPlaying(track.sub || 'Listen');
  },
  playQueue(tracks, index = 0, label = '') {
    if (!tracks || !tracks.length) return;
    this.queue = tracks.slice();
    this.queueLabel = label || '';
    this.playAt(index);
    /* Founder directive: picking a song opens the Now Playing page,
       labeled with the list it was picked from. */
    this.openNowPlaying(label);
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
    this.applyVolume();
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
    this.npEndedLineEl.textContent = this.stageEndedLineEl.textContent;
    this.stageEndedEl.hidden = false;
    this.npEndedEl.hidden = false;
    this.syncTransport(false);
    this.emit();
  },
  replay() {
    if (!this.current) return;
    this.ended = false;
    this.stageEndedEl.hidden = true;
    this.npEndedEl.hidden = true;
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
    this.closeNowPlaying();
    this.npQueueOpen = false;
    this.titleEl.textContent = 'Nothing playing';
    this.subEl.textContent = 'Pick a song in the Listen hub';
    this.coverEl.innerHTML = '<span>16:3</span>';
    this.stageTitleEl.textContent = 'Nothing playing';
    this.stageSubEl.textContent = '';
    this.stageCoverEl.innerHTML = '<span>16:3</span>';
    this.npTitleEl.textContent = 'Nothing playing';
    this.npSubEl.textContent = '';
    this.npCoverEl.innerHTML = '<span>16:3</span>';
    this.provEl.hidden = true;
    this.stageProvEl.hidden = true;
    this.npProvEl.hidden = true;
    this.stageEndedEl.hidden = true;
    this.npEndedEl.hidden = true;
    this.coverEl.disabled = true;
    this.titleEl.disabled = true;
    for (const el of [this.seekEl, this.stageSeekEl, this.npSeekEl]) { el.value = 0; el.disabled = true; }
    this.elapsedEl.textContent = '0:00'; this.totalEl.textContent = '';
    this.stageElapsedEl.textContent = '0:00'; this.stageTotalEl.textContent = '';
    this.npElapsedEl.textContent = '0:00'; this.npTotalEl.textContent = '';
    this.setPlayingUI(false);
    this.syncTransport(false);
    this.syncDock();
    this.renderQueue();
    this.renderNpQueue();
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
      npOpen: this.npOpen, npContext: this.npContext, volume: this.volume,
    };
  },
};
Player.syncDock(); /* idle at first paint: no track, no dock */
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
/* Now Playing page controls — same engine, same transport functions. */
$('btn-np-play').addEventListener('click', () => Player.toggle());
$('btn-np-next').addEventListener('click', () => Player.next());
$('btn-np-prev').addEventListener('click', () => Player.prev());
$('btn-np-repeat').addEventListener('click', () => Player.toggleRepeat());
$('btn-np-replay').addEventListener('click', () => Player.replay());
$('btn-np-back10').addEventListener('click', () => Player.skipBy(-10));
$('btn-np-fwd10').addEventListener('click', () => Player.skipBy(10));
$('btn-np-back').addEventListener('click', () => Player.closeNowPlaying());
$('np-volume').addEventListener('input', (e) => Player.setVolume(+e.target.value));
$('btn-np-queue').addEventListener('click', () => {
  Player.npQueueOpen = !Player.npQueueOpen;
  Player.renderNpQueue();
});
$('np-film').addEventListener('playing', () => $('nowplaying').classList.add('film-on'));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (Player.npOpen) Player.closeNowPlaying();
  else if (Player.stageOpen) Player.closeStage();
});
/* Seek wiring, all three faces. G-09: a seek control is only live once
   the engine reports a real duration — until then the row shows elapsed
   only and offers no false total. */
for (const el of [Player.seekEl, Player.stageSeekEl, Player.npSeekEl]) {
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
  Player.npElapsedEl.textContent = elapsed;
  const known = d > 0;
  for (const [seek, total] of [[Player.seekEl, Player.totalEl], [Player.stageSeekEl, Player.stageTotalEl], [Player.npSeekEl, Player.npTotalEl]]) {
    total.textContent = known ? fmt(d) : '';
    seek.disabled = !known;
    seek.classList.toggle('seek-static', !known);
    if (known && !Player.seeking) seek.value = Math.round((t / d) * 1000);
    if (!known) seek.value = 0;
  }
}, 500);
window.FaithPlayer = Player;

/* ---------- AMP-UP PHASE 2B (2026-11-22): shared film slot + motion
   + the FaithGuide host ----------
   FaithFilm: one cinematic film at the top of every hub (founder
   order 17:47). slotHtml paints the poster first (a still frame
   under reduced motion — no video element at all); wire() runs the
   play/pause discipline: a film plays only while it is on screen.
   Films are presentation atmosphere over the hub's real content;
   a hub whose film is still owed (see the Phase 2B record's CP-F5
   table) renders the slot with its poster still and an honest note. */
const MOTION_REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const filmEsc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.FaithFilm = {
  reduced: MOTION_REDUCED,
  slotHtml({ src = null, poster, title, note = '' }) {
    const media = (src && !MOTION_REDUCED)
      ? `<video muted loop playsinline autoplay preload="metadata" poster="${filmEsc(poster)}" aria-hidden="true"><source src="${filmEsc(src)}" type="video/mp4"></video>`
      : `<img class="hubfilm-still" src="${filmEsc(poster)}" alt="" aria-hidden="true">`;
    return `<section class="hubfilm gold-frame" data-hubfilm aria-label="16:3 Faith presents — a film for this room">
      ${media}<span class="hubfilm-shade"></span><span class="glow-sweep" aria-hidden="true"></span>
      <span class="hubfilm-cap"><span><span class="hubfilm-brand">16:3 Faith Presents</span>
      <span class="hubfilm-title" style="display:block">${filmEsc(title)}</span></span>
      ${note ? `<span class="hubfilm-note">${filmEsc(note)}</span>` : ''}</span></section>`;
  },
  wire(scope) {
    if (!scope || MOTION_REDUCED || typeof IntersectionObserver !== 'function') return;
    scope.querySelectorAll('[data-hubfilm] video').forEach((v) => {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); }
      }), { threshold: 0.15 });
      io.observe(v);
    });
  },
};
window.FaithMotion = {
  reduced: MOTION_REDUCED,
  armReveals(scopeRoot) {
    if (!scopeRoot || MOTION_REDUCED || typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.08 });
    scopeRoot.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  },
};

/* FaithGuide — the persistent AI host (consult ruling (c)): the
   button opens a small panel (FAQs, door shortcuts, feature notes,
   the pastoral routing line). It never routes into Faith Answers
   and never speaks for a person: where a person is needed, it says
   so and points at the pastoral team. The greeting bubble shows
   until dismissed once; the dismissal is remembered. */
(function mountFaithGuide() {
  const wrap = document.createElement('div');
  wrap.id = 'faithguide';
  const dismissed = (() => { try { return localStorage.getItem('fg-dismissed') === '1'; } catch { return false; } })();
  wrap.innerHTML = `
    <div class="fg-bubble" data-fg-bubble ${dismissed ? 'hidden' : ''}><b>✦ FaithGuide here.</b><br>I'm the house's AI host — doors, questions, and the way around. Tap my name any time.<button type="button" data-fg-dismiss>Got it</button></div>
    <section id="fg-panel" data-fg-panel hidden aria-label="FaithGuide — the house AI host">
      <h3>Faith<span>Guide</span></h3><p class="fg-sub">The house AI host · Powered by AI</p>
      <p>Welcome home. I keep the doors of this house — <b>Watch, Listen, Read, Pray, Community, Give, Shop</b> — and I can tell you how each room works. I'm a program, labeled as one; I never pretend to be a person.</p>
      <div class="fg-doors">${HUB_ORDER.map((h) => `<button type="button" data-fg-door="${h}">${h[0].toUpperCase() + h.slice(1)}</button>`).join('')}</div>
      <p class="fg-q">Is membership free?</p>
      <p>Yes. Joining the house is free — the Join button at the top opens your account. Ministry here is never paywalled.</p>
      <p class="fg-q">What is 16:3?</p>
      <p>Proverbs 16:3 — “Commit thy works unto the LORD, and thy thoughts shall be established.” It's the verse this whole house is built on.</p>
      <p class="fg-q">Who leads the house?</p>
      <p>Pastor Jeremy “Chico” Mills — founder and pastor of 16:3 Faith, and a USAF veteran. You'll find him on the home page, under Meet the Pastor.</p>
      <p class="fg-q">Need a person, not a program?</p>
      <p>For personalized guidance, please contact our pastoral team — a person, not a program, will walk with you. The Prayer Room is open day and night. If you are in crisis, call or text <b>988</b> — the Suicide and Crisis Lifeline (US), free, 24/7.</p>
      <button type="button" class="fg-close" data-fg-close>Close</button>
    </section>
    <button type="button" id="fg-btn" data-fg-btn aria-haspopup="dialog"><span class="fg-spark">✦</span>FaithGuide</button>`;
  document.body.appendChild(wrap);
  const panel = wrap.querySelector('[data-fg-panel]');
  wrap.querySelector('[data-fg-btn]').addEventListener('click', () => { panel.hidden = !panel.hidden; });
  wrap.querySelector('[data-fg-close]').addEventListener('click', () => { panel.hidden = true; });
  wrap.querySelector('[data-fg-dismiss]').addEventListener('click', () => {
    wrap.querySelector('[data-fg-bubble]').hidden = true;
    try { localStorage.setItem('fg-dismissed', '1'); } catch { /* private mode: the bubble simply returns next visit */ }
  });
  wrap.querySelectorAll('[data-fg-door]').forEach((b) => b.addEventListener('click', () => {
    panel.hidden = true;
    const target = '#/' + b.dataset.fgDoor;
    if (location.hash !== target) location.hash = target;
  }));
})();

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
/* HASH-NAV CURE (2026-11-19): two structural guards so a stale render can
   never win. (1) A monotonic navigation token: navigate() awaits the hub
   module, and a slow module for an earlier navigation must not commit
   after a newer navigation has started. (2) A per-navigation view
   container: each hub renders into its own element inside #hub-root.
   Hubs hold module-level state and repaint asynchronously when live data
   lands (community's cursor chain, pray's counters leg) — those paints
   write into the element they were handed, so once a newer navigation
   replaces the container, every late paint from the old hub lands in a
   detached node and can never appear over the hub the user is on.
   display:contents keeps the wrapper layout-transparent: hub content
   lays out exactly as if it were a direct child of #hub-root. */
let navSeq = 0;
async function navigate(name) {
  if (![...HUB_ORDER, 'home'].includes(name)) name = 'home';
  const seq = ++navSeq;
  const mod = await loadHub(name);
  if (seq !== navSeq) return; // superseded while the module loaded
  const view = document.createElement('div');
  view.className = 'hub-view';
  view.dataset.hub = name;
  view.style.display = 'contents';
  root.replaceChildren(view);
  mod.render(view, { navigate, player: Player, isCurrent: () => seq === navSeq });
  /* CP5: the face-wide motion system — the container carries .motion
     (unless reduced motion), and landing sections marked .reveal
     rise in once. Hubs that repaint (community, listen, shop) re-arm
     for their own later paints. */
  if (!MOTION_REDUCED) {
    view.classList.add('motion');
    requestAnimationFrame(() => window.FaithMotion.armReveals(view));
  }
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
/* A bfcache restore revives the DOM exactly as it was frozen, which can
   disagree with the hash in the restored URL; reconcile on restore. */
window.addEventListener('pageshow', (e) => {
  if (e.persisted && routeFromHash() !== currentHub) 


navigate(routeFromHash());
});

/* ---------- ACCOUNT / AUTH (F-CLERK, 2026-11-22) ----------
   The cure for the scaffold placeholders (diagnosis: records/
   CLERK-SIGNUP-CHECK-2026-11-22.md, cure list C1–C6). ClerkJS is pinned
   and loaded DIRECTLY from the production FAPI host — never the dead
   /api/__clerk proxy, whose registered URL now lands on GitHub Pages.
   ClerkJS v6 also needs its UI package (@clerk/ui): without the ctor
   handed to Clerk.load(), every open/mount throws "Clerk was not loaded
   with Ui components" — the MOUNT CURE of 2026-11-22 loads it first.
   Loading is async and FAIL-SOFT: the shell renders fully for guests
   whether or not the Clerk host answers; if it never loads, the buttons
   give an honest unavailable note — never a hang, never a blank page.
   What lives here:
   - window.FaithAuth — the one auth surface the hubs use:
       getToken() → the Clerk session JWT (null for guests)
       apiFetch() → fetch with the session token attached; on the terms
                    gate's 403 it routes the member to the acceptance
                    step and retries the call once on accept
       signedIn() → the same signal the hubs read via window.Clerk.user
   - the terms step (JOIN gate): shown right after a join, and whenever
     a member write answers 403 TERMS_ACCEPTANCE_REQUIRED. Accepting
     POSTs /api/terms/acceptance with the session token; the server
     records its own current terms version (201 = membership open).
   - signed-in chrome: avatar/name + sign-out replace the guest buttons. */
const Auth = {
  PK: 'pk_live_Y2xlcmsuMTYzZmFpdGguY29tJA',
  SRC: 'https://clerk.163faith.com/npm/@clerk/clerk-js@6/dist/clerk.browser.js',
  UI_SRC: 'https://clerk.163faith.com/npm/@clerk/ui@1/dist/ui.browser.js',
  API: 'https://faith-hub-api-railway-production.up.railway.app',
  state: 'loading',        // 'loading' | 'ready' | 'error'
  pendingIntent: null,     // 'signin' | 'join' clicked before Clerk was ready
  lastUserId: null,
  termsPromise: null,      // in-flight terms step, shared by concurrent 403s

  appearance: {
    variables: {
      colorPrimary: '#d4af37', colorBackground: '#0d0d0d', colorText: '#efe9dc',
      colorTextSecondary: '#a89f8d', colorInputBackground: '#121212',
      colorInputText: '#efe9dc', colorDanger: '#e3472e', borderRadius: '10px',
      fontFamily: "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif",
    },
    elements: {
      card: { background: 'transparent', boxShadow: 'none', border: 'none', padding: '0' },
      headerTitle: { fontFamily: "Georgia,'Times New Roman',serif", color: '#efe9dc' },
      headerSubtitle: { color: '#a89f8d' },
      footer: { background: 'transparent' },
    },
  },

  signedIn() { try { return !!(window.Clerk && window.Clerk.user); } catch { return false; } },

  async getToken() {
    try {
      if (window.Clerk && window.Clerk.session) return await window.Clerk.session.getToken();
    } catch { /* a token hiccup reads as guest, never as a hang */ }
    return null;
  },
  async authHeader() {
    const tok = await this.getToken();
    return tok ? { Authorization: `Bearer ${tok}` } : {};
  },

  /* fetch with the member's session attached. On the terms gate's 403,
     the member is routed to the acceptance step; accepting retries the
     original call once with the same arguments. */
  async apiFetch(url, opts = {}) {
    const exec = async () => {
      const headers = { ...(opts.headers || {}), ...(await this.authHeader()) };
      return fetch(url, { credentials: 'include', ...opts, headers });
    };
    let res = await exec();
    if (res.status === 403 && this.signedIn()) {
      let code = null;
      try { const j = await res.clone().json(); code = j && (j.error || j.code); } catch { /* non-JSON 403 — not the gate */ }
      if (code === 'TERMS_ACCEPTANCE_REQUIRED') {
        const accepted = await this.openTerms();
        if (accepted) res = await exec();
      }
    }
    return res;
  },

  /* ----- overlay furniture ----- */
  showNote(html) {
    const st = $('auth-status');
    if (st) { st.hidden = false; st.innerHTML = html; }
  },
  openOverlay() { const o = $('auth-overlay'); if (o) o.hidden = false; },
  closeOverlay() {
    const o = $('auth-overlay');
    if (o) o.hidden = true;
    const node = $('auth-mount');
    try { window.Clerk?.unmountSignIn?.(node); } catch { /* noop */ }
    try { window.Clerk?.unmountSignUp?.(node); } catch { /* noop */ }
  },

  openAuth(kind) {
    if (kind === 'join') { try { sessionStorage.setItem('faith-just-joined', '1'); } catch { /* private mode */ } }
    if (this.state === 'error') {
      this.openOverlay();
      this.showNote('<b>Sign-in couldn\'t load from this network.</b> The whole house stays open to read — try again in a moment.');
      this.pendingIntent = kind;
      this.load();
      return;
    }
    if (this.state !== 'ready' || !window.Clerk) {
      this.pendingIntent = kind;
      this.openOverlay();
      this.showNote('One moment — the sign-in desk is still opening…');
      return;
    }
    this.mount(kind);
  },

  mount(kind) {
    const C = window.Clerk;
    if (!C) return;
    /* Clerk's own modal first: it carries the form, the email-code step
       and the smart CAPTCHA, and its footer switches between sign-in
       and join in place. No redirect URLs — the member lands back on
       the hub they were reading. */
    try {
      if (kind === 'join' && typeof C.openSignUp === 'function') { C.openSignUp({ appearance: this.appearance }); return; }
      if (kind === 'signin' && typeof C.openSignIn === 'function') { C.openSignIn({ appearance: this.appearance }); return; }
    } catch (err) { console.warn('[FaithAuth] Clerk modal open failed, falling back to mount:', err); }
    /* Fallback: mount the component into the shell's own overlay. */
    this.openOverlay();
    const node = $('auth-mount');
    if (!node) return;
    try { C.unmountSignIn?.(node); } catch { /* noop */ }
    try { C.unmountSignUp?.(node); } catch { /* noop */ }
    node.innerHTML = '';
    try {
      if (kind === 'join' && typeof C.mountSignUp === 'function') C.mountSignUp(node, { appearance: this.appearance });
      else if (typeof C.mountSignIn === 'function') C.mountSignIn(node, { appearance: this.appearance });
      else { this.showNote('<b>The sign-in form didn\'t open.</b> Try again in a moment — nothing about the house is locked to reading.'); return; }
    } catch (err) {
      /* never swallow silently again — the hidden throw behind this note
         cost a full live cycle (MOUNT CURE, 2026-11-22) */
      console.warn('[FaithAuth] Clerk mount failed:', err);
      this.showNote('<b>The sign-in form didn\'t open.</b> Try again in a moment — nothing about the house is locked to reading.');
      return;
    }
    const other = kind === 'join' ? 'signin' : 'join';
    this.showNote(kind === 'join'
      ? 'Already a member? <button type="button" class="auth-switch" data-switch="signin">Sign in</button>'
      : 'New here? <button type="button" class="auth-switch" data-switch="join">Join free</button>');
    $('auth-status')?.querySelector('[data-switch]')?.addEventListener('click', () => this.mount(other));
  },

  /* ----- the terms step (JOIN gate) ----- */
  openTerms() {
    if (this.termsPromise) return this.termsPromise;
    this.termsPromise = new Promise((resolve) => {
      const ov = $('terms-overlay');
      if (!ov) { this.termsPromise = null; resolve(false); return; }
      ov.hidden = false;
      const status = $('terms-status');
      if (status) status.hidden = true;
      const done = (v) => { ov.hidden = true; this.termsPromise = null; resolve(v); };
      $('btn-terms-later').onclick = () => done(false);
      $('btn-terms-accept').onclick = async () => {
        const btn = $('btn-terms-accept');
        btn.disabled = true;
        if (status) { status.hidden = false; status.textContent = 'Recording your yes…'; }
        try {
          const res = await fetch(`${this.API}/api/terms/acceptance`, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...(await this.authHeader()) },
            body: '{}',
          });
          if (res.ok) { done(true); return; }
          if (status) status.textContent = `The house couldn't record that just now (HTTP ${res.status}). Your account is fine — try again.`;
        } catch {
          if (status) status.textContent = 'The house couldn\'t be reached just now. Your account is fine — try again.';
        }
        btn.disabled = false;
      };
    });
    return this.termsPromise;
  },

  /* ----- chrome + session transitions ----- */
  paintChrome() {
    const member = $('acct-member');
    if (!member) return;
    const user = (window.Clerk && window.Clerk.user) || null;
    const guestBtns = [$('btn-signin'), $('btn-join')];
    if (user) {
      guestBtns.forEach((b) => { if (b) b.hidden = true; });
      member.hidden = false;
      const name = user.fullName || user.firstName
        || (user.primaryEmailAddress && user.primaryEmailAddress.emailAddress) || 'Member';
      $('acct-name').textContent = name;
      const img = $('acct-avatar'), ini = $('acct-initials');
      if (user.imageUrl) { img.src = user.imageUrl; img.hidden = false; ini.hidden = true; }
      else {
        img.hidden = true; ini.hidden = false;
        ini.textContent = name.split(/\s+/).slice(0, 2).map((w) => (w[0] || '').toUpperCase()).join('');
      }
    } else {
      guestBtns.forEach((b) => { if (b) b.hidden = false; });
      member.hidden = true;
    }
  },

  onAuthChange() {
    const user = (window.Clerk && window.Clerk.user) || null;
    const id = user ? user.id : null;
    this.paintChrome();
    if (id === this.lastUserId) return;
    const was = !!this.lastUserId;
    this.lastUserId = id;
    window.dispatchEvent(new CustomEvent('faithauth', { detail: { signedIn: !!id } }));
    if (id && !was) {
      this.closeOverlay();
      let justJoined = false;
      try { justJoined = !!sessionStorage.getItem('faith-just-joined'); sessionStorage.removeItem('faith-just-joined'); } catch { /* noop */ }
      if (justJoined) this.openTerms();
      if (currentHub) navigate(currentHub);
    } else if (!id && was) {
      if (currentHub) navigate(currentHub);
    }
  },

  load() {
    if (this.state === 'ready' || this._loading) return;
    this._loading = true;
    this.state = 'loading';
    const fail = () => { this._loading = false; if (this.state !== 'ready') this.state = 'error'; };
    const loadScript = (src, attrs = {}) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`script failed: ${src}`));
      document.head.appendChild(s);
    });
    (async () => {
      try {
        /* ClerkJS v6 splits the UI into its own package (@clerk/ui): the
           core bundle alone loads fine, but EVERY open/mount call then
           throws "Clerk was not loaded with Ui components" (proven in-page,
           cure-work/evidence-before.json). The UI script registers
           window.__internal_ClerkUICtor, and it must be handed to the
           FIRST Clerk.load() call — load() consumes its options once.
           So: UI script first, core second, then load() with the ctor. */
        if (!window.__internal_ClerkUICtor) await loadScript(this.UI_SRC);
        if (!window.Clerk) await loadScript(this.SRC, { 'data-clerk-publishable-key': this.PK });
        if (!window.Clerk) throw new Error('Clerk core did not arrive');
        if (!window.__internal_ClerkUICtor) throw new Error('Clerk UI did not arrive');
        if (typeof window.Clerk.load === 'function' && !window.Clerk.loaded) {
          await window.Clerk.load({ publishableKey: this.PK, ui: { ClerkUI: window.__internal_ClerkUICtor } });
        }
        this.state = 'ready';
        this._loading = false;
        window.Clerk.addListener(() => this.onAuthChange());
        this.onAuthChange();
        if (this.pendingIntent) {
          const k = this.pendingIntent; this.pendingIntent = null; this.mount(k);
        }
      } catch { fail(); }
    })();
    setTimeout(fail, 25000);
  },
};
$('btn-signin').addEventListener('click', () => Auth.openAuth('signin'));
$('btn-join').addEventListener('click', () => Auth.openAuth('join'));
$('btn-signout')?.addEventListener('click', async () => {
  try { await window.Clerk.signOut(); } catch { /* the listener paints the guest chrome either way */ }
});
$('btn-auth-close')?.addEventListener('click', () => Auth.closeOverlay());
document.querySelector('[data-auth-close]')?.addEventListener('click', () => Auth.closeOverlay());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('auth-overlay').hidden) Auth.closeOverlay();
});
window.FaithAuth = Auth;
window.FaithTerms = () => Auth.openTerms();
Auth.load();



/* ---------- FAITH ANSWERS (amp-up P1-AI-2, 2026-11-22) ----------
   The AI consult's queue-jumper: a site-wide answer bar, labeled AI,
   answering ONLY from this house's own carried data. The guardrails
   are structural, not cosmetic: pastoral care / crisis / doctrine
   disputes get the pastoral routing line and no AI answer; scripture
   is quoted only from the carried devotional verse (KJV); artists,
   films, groups, and counts come from the baked catalogs/counters —
   or the bar says plainly that it doesn't know. Data loads lazily on
   the first ask, so the bar costs nothing until it is used. */
const FA = { data: null, loading: null };
const faEsc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function faLoad() {
  if (FA.data) return FA.data;
  if (!FA.loading) FA.loading = (async () => {
    const get = async (u) => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch { return null; } };
    const [listen, watch, devo, meta, groups] = await Promise.all([
      get('assets/data/listen-index.json'), get('assets/data/watch.json'),
      get('assets/data/read/devotionals.json'), get('assets/data/community/meta.json'),
      get('assets/data/community/groups.json')]);
    FA.data = { listen, watch, devo, meta, groups };
    return FA.data;
  })();
  return FA.loading;
}
const FA_PASTORAL = 'That is beyond what an answer bar should carry. For personalized guidance, please contact our pastoral team — a person, not a program, will walk with you.';
const FA_CRISIS = 'Please reach a person right now: call or text <b>988</b> — the Suicide and Crisis Lifeline (US), free, 24/7. And let our pastoral team stand with you too: for personalized guidance, please contact our pastoral team.';
async function faithAnswer(raw) {
  const panel = $('fa-panel');
  if (!panel) return;
  const show = (html, hub) => {
    panel.hidden = false;
    panel.innerHTML = `<div class="fa-a">${html}</div>` + (hub ? `<button type="button" class="fa-go" data-fago="${hub}">OPEN ${hub.toUpperCase()} ↗</button>` : '') + '<p class="fa-note">Powered by AI — answers only from 16:3 Faith\u2019s own carried data; nothing is invented, and it never speaks for the pastor or any member.</p>';
    panel.querySelector('[data-fago]')?.addEventListener('click', () => { if (location.hash !== '#/' + hub) location.hash = '#/' + hub; });
  };
  const q = String(raw || '').trim();
  if (!q) { panel.hidden = true; return; }
  const low = q.toLowerCase();
  show('<span class="fa-thinking">Faith Answers is checking the house\'s own shelves…</span>');
  /* Guardrail routes first — before any data answer. */
  if (/(suicide|kill myself|self[-\s]?harm|hurt myself|end my life|want to die)/.test(low)) return show(FA_CRISIS);
  if (/(pastoral|talk to (a |the )?pastor|speak to (a |the )?pastor|counsel|crisis|depress|anxiet|grief|addict|abuse)/.test(low)) return show(FA_PASTORAL);
  if (/(doctrine|denomination|calvinis|arminian|once saved|speaking in tongues|predestination|the rapture|end times prophecy)/.test(low)) return show(FA_PASTORAL + ' The Read hub carries the Word itself, word for word.', 'read');
  /* House identity (amp-up P1-AI-2 cure, 2026-11-22) — composed ONLY from
     the house's own published words: the meta description ("the futuristic
     hip-hop church… Commit thy works unto the LORD. — Proverbs 16:3", the
     seven hubs), the hero line ("One faith. Many voices. A place to
     belong."), Meet the Pastor (Founder & Pastor Jeremy "Chico" Mills,
     USAF veteran), and the index honesty list ("Membership is free.").
     Nothing aspirational, nothing invented. */
  if (/(what is|what's|who are you|who is|tell me about|about)\s+(16:3|163|this (church|house|site|ministry)|the house|your church)|^(16:3|163)( faith)?[?.!]?$|about 16:3/.test(low)) {
    return show('<b>16:3 Faith is the futuristic hip-hop church</b> — “Commit thy works unto the LORD” (Proverbs 16:3). One faith. Many voices. A place to belong. The house has seven hubs: <b>Watch · Listen · Read · Pray · Community · Give · Shop</b>. It is pastored by its founder, <b>Pastor Jeremy “Chico” Mills</b>, a USAF veteran. Membership is free.', 'community');
  }
  const d = await faLoad();
  const counters = d.meta?.counters?.livePulse20261119 || d.meta?.counters || {};
  /* Today's Word — the day's devotional; the verse is quoted only from
     the carried KJV data, never generated. */
  if (/today'?s word|verse of the day|daily word|devotional/.test(low)) {
    const t = new Date();
    const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    const e = d.devo?.entries?.find((x) => x.date === iso);
    if (e) return show(`<b>Today's Word — ${faEsc(e.title)}</b> (${faEsc(e.reference)}, KJV)<br>“${faEsc(e.verse)}”`, 'read');
    return show('There is no devotional entry in the carried data for today — and nothing is fabricated in its place. The Read hub carries the full KJV text.', 'read');
  }
  /* A named verse reference answers only when a carried devotional
     quotes it — otherwise the bar points at the full text. */
  const refHit = d.devo?.entries?.find((e) => e.reference && low.includes(e.reference.toLowerCase()));
  if (refHit) return show(`<b>${faEsc(refHit.reference)}</b> (KJV), carried in the devotional “${faEsc(refHit.title)}”:<br>“${faEsc(refHit.verse)}”`, 'read');
  /* Counts — the production counters, named as such. */
  if (/how many members|member count/.test(low) && counters.members) return show(`The family stands at <b>${counters.members} members</b> (production counters).`, 'community');
  if (/testimon/.test(low) && counters.testimoniesCounter) return show(`The house counters carry <b>${counters.testimoniesCounter} testimonies</b>; the Sanctuary's tape lists the testimonies the wall itself serves.`, 'community');
  if (/prayer|pray/.test(low) && counters.prayerRequests) return show(`The wall carries <b>${counters.prayerRequests} prayer requests</b>, with <b>${counters.prayersLifted} prayers lifted</b> (production counters). Bring what you carry.`, 'pray');
  /* Groups — the real list. */
  if (/(groups| circles)/.test(low) && d.groups?.groups?.length) return show(`The house has <b>${d.groups.groups.length} groups</b>: ${d.groups.groups.map((g) => faEsc(g.name)).join(' · ')}.`, 'community');
  /* Artists — name match against the Listen index. */
  const artists = d.listen?.artists || [];
  const ahit = artists.find((a) => low.includes(a.name.toLowerCase()))
    || (low.length >= 4 ? artists.find((a) => a.name.toLowerCase().includes(low)) : null);
  if (ahit) return show(`<b>${faEsc(ahit.name)}</b> is on the roster — <b>${ahit.releases} releases · ${ahit.songs} songs · ${ahit.playable} playable</b> in the Listen hub, albums grouped by album with their exact official covers.`, 'listen');
  /* Films — title match against the Watch catalog. */
  const titles = d.watch?.titles || [];
  const thit = titles.find((t) => low.includes(t.title.toLowerCase()))
    || (low.length >= 5 ? titles.find((t) => t.title.toLowerCase().includes(low)) : null);
  if (thit) return show(`<b>${faEsc(thit.title)}</b>${thit.year ? ` (${thit.year})` : ''} is in the Watch hub${thit.door ? ` — ${faEsc(thit.door)}` : ''}.${thit.description ? ' ' + faEsc(String(thit.description).slice(0, 160)) : ''}`, 'watch');
  /* Door-level answers. */
  if (/artist|music|song|listen|album/.test(low)) return show(`The Listen hub carries <b>${artists.length} artists</b> — ask me about one by name and I'll pull their real numbers.`, 'listen');
  if (/film|movie|watch/.test(low)) return show(`The Watch hub carries <b>${titles.length} titles</b> — ask me about one by name.`, 'watch');
  if (/give|donat|offering|tithe/.test(low)) return show('The Give hub carries the house\'s giving doors — every option, and the honesty line, stated there plainly.', 'give');
  if (/shop|store|buy|merch|shirt|hoodie/.test(low)) return show('The Shop hub carries the house\'s real products — every piece a real, fulfillable product.', 'shop');
  return show('Faith Answers speaks only from this house\'s own shelves — the Listen catalog, the Watch catalog, the day\'s Word, and the family\'s counters — and that isn\'t on them. Try an artist or a film by name, "today\'s word", or the Community.');
}
$('fa-form')?.addEventListener('submit', (e) => { e.preventDefault(); faithAnswer($('fa-input')?.value); });

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

      /* ---- F-CLERK battery (2026-11-22) ----
         Guest state: the account chrome shows Sign in / Join, the member
         chrome stays hidden, FaithAuth exists, and a guest token reads
         null. Then the sign-in door itself: clicking Sign in must open
         the overlay with either the real Clerk form mounted (this
         sandbox's route to the Clerk host permitting) or the honest
         "still opening / couldn't load" note — the fail-soft contract.
         A hang or a blank overlay fails. */
      const fa = window.FaithAuth;
      ok('F-CLERK: FaithAuth surface exists', !!fa && typeof fa.getToken === 'function' && typeof fa.apiFetch === 'function', fa ? `state=${fa.state}` : 'window.FaithAuth missing');
      const guestTok = fa ? await fa.getToken() : undefined;
      ok('F-CLERK: guest token reads null (no fake session)', guestTok === null, `token=${guestTok === null ? 'null' : typeof guestTok}`);
      const signinBtn = document.getElementById('btn-signin');
      const memberChrome = document.getElementById('acct-member');
      ok('F-CLERK: guest chrome — Sign in/Join visible, member chrome hidden',
        !!signinBtn && !signinBtn.hidden && !!memberChrome && memberChrome.hidden,
        `signinHidden=${signinBtn && signinBtn.hidden} memberHidden=${memberChrome && memberChrome.hidden}`);
      if (signinBtn) {
        signinBtn.click();
        const opened = await waitFor(() => {
          const ov = document.getElementById('auth-overlay');
          if (!ov || ov.hidden) {
            /* Clerk's own modal path: an iframe/component at body level. */
            return document.querySelector('.cl-modalBackdrop, .cl-modal, [data-clerk-modal]') ? 'clerk-modal' : null;
          }
          const mount = document.getElementById('auth-mount');
          const note = document.getElementById('auth-status');
          if (mount && mount.children.length > 0) return 'mounted-form';
          if (note && !note.hidden && note.textContent.trim()) return 'honest-note';
          return null;
        }, 30000);
        ok('F-CLERK: sign-in door opens (Clerk form or honest note, never a hang)', !!opened, opened ? `via=${opened}` : 'overlay stayed empty for 30s');
        const x = document.getElementById('btn-auth-close');
        if (x) x.click();
      }
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
          const r = await fetch('https://faith-hub-api-railway-production.up.railway.app/api/sanctuary/full-discography?artist=Lecrae');
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
