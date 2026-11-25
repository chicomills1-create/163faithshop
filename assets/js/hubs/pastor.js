/* THE PASTOR — Pastor Jeremy "Chico" Mills' own page (founder directive
   2026-11-24 16:05 MST: "give the pastor, myself, a separate page along
   with meet the pastor. The old site was perfect!"). Route #/pastor on
   the People pattern (route + top-nav link + this module); Meet the
   Pastor stays on Home and doors here.

   FACT DISCIPLINE: only established house facts are stated — Founder &
   Pastor of 16:3 Faith, USAF veteran, author of the 365-day devotional
   God Over Everything (two volumes, real Amazon doors carried from the
   Shop build verbatim). His conviction line and the "future and family"
   copy are the live Meet the Pastor house copy, carried word-for-word.
   Proverbs 16:3 is quoted from the KJV, the house translation. photo is REAL only (the preaching shot, hero, used once —
   the repo's pastor-original.webp is a byte-duplicate of it, so the story
   column carries the Proverbs 16:3 verse panel instead of a repeat)
   — never an AI likeness, never a monogram in his place. FaithGuide
   chips answer from THIS PAGE's own content only, labeled AI (ChatGPT
   consult chatcmpl-Enttt6xAekgyaZGJW1AH9t1kB8Gam: order hero → story →
   book → doors → closing; chips over fabricated interaction). */

const CSS = `
.pst-hero{position:relative;margin:8px 0 0;width:calc(100vw - var(--sbw,0px));margin-left:calc(50% - 50vw + var(--sbw,0px)/2);min-height:430px;display:flex;align-items:flex-end;overflow:hidden;background:#0a0906;isolation:isolate}
.pst-hero img.pst-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 18%;filter:saturate(1.06) sepia(.14) contrast(1.03);animation:pstDrift 26s ease-in-out infinite alternate;z-index:1}
@keyframes pstDrift{from{transform:scale(1.03)}to{transform:scale(1.12) translateY(-1.6%)}}
.pst-hero .pst-tint{position:absolute;inset:0;background:radial-gradient(115% 85% at 50% 0%,rgba(212,175,55,.22),rgba(212,175,55,0) 56%);mix-blend-mode:overlay;z-index:2;pointer-events:none}
.pst-hero .pst-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.44) 0%,rgba(5,5,5,0) 30%,rgba(5,5,5,0) 42%,rgba(5,5,5,.9) 80%,#050505 100%);z-index:3;pointer-events:none}
.pst-hero .pst-eyebrow{position:absolute;top:16px;left:20px;z-index:4;font-size:11px;font-weight:700;letter-spacing:.34em;color:var(--gold);text-shadow:0 1px 10px rgba(0,0,0,.8)}
.pst-hero .pst-body{position:relative;z-index:4;padding:20px;width:100%}
.pst-hero .pst-name{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(38px,10.5vw,64px);line-height:.99;margin:0;color:#fff8ea;text-shadow:0 3px 28px rgba(0,0,0,.7)}
.pst-hero .pst-name .g{color:var(--gold)}
.pst-hero .pst-role{margin-top:8px;font-size:15px;letter-spacing:.14em;color:#e9dfc8;text-transform:uppercase}
.pst-hero .pst-verse{margin-top:12px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:clamp(16px,4.4vw,20px);line-height:1.5;color:#f0e6cd;max-width:620px}
.pst-hero .pst-verse b{color:var(--gold);font-style:normal}@media(min-width:900px){.pst-hero{min-height:640px;align-items:center}.pst-hero img.pst-art{left:auto;right:0;width:54%;object-position:center 26%;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 16%);mask-image:linear-gradient(90deg,transparent 0,#000 16%)}.pst-hero .pst-shade{background:linear-gradient(90deg,rgba(5,5,5,.88) 0%,rgba(5,5,5,.55) 34%,rgba(5,5,5,0) 62%),linear-gradient(180deg,rgba(5,5,5,.35) 0%,rgba(5,5,5,0) 26%,rgba(5,5,5,0) 55%,rgba(5,5,5,.85) 88%,#050505 100%)}.pst-hero .pst-body{max-width:600px;padding:40px 20px 40px max(24px,4vw)}.pst-hero .pst-eyebrow{left:max(24px,4vw)}}
.pst-sec{margin-top:44px}
.pst-sec .kicker{color:var(--gold);letter-spacing:.3em;font-size:11px;font-weight:700;text-transform:uppercase}
.pst-sec h3{font-family:Georgia,'Times New Roman',serif;font-size:clamp(26px,6vw,36px);margin:8px 0 12px;color:#fff8ea}
.pst-sec p{line-height:1.65;color:#ddd3b8;max-width:680px}
.pst-story{display:grid;gap:20px}
@media(min-width:820px){.pst-story{grid-template-columns:380px 1fr;align-items:start}}
.pst-versepanel{border:1px solid rgba(212,175,55,.4);border-radius:14px;padding:24px 22px;background:linear-gradient(150deg,#141005,#0a0805 60%);box-shadow:0 18px 50px rgba(0,0,0,.55)}
.pst-versepanel .vp-k{color:var(--gold);letter-spacing:.26em;font-size:11px;font-weight:700;text-transform:uppercase;margin:0 0 14px}
.pst-versepanel .vp-t{font-family:Georgia,'Times New Roman',serif;font-size:clamp(21px,5vw,26px);line-height:1.45;color:#fff8ea;margin:0}
.pst-versepanel .vp-r{color:var(--gold);letter-spacing:.18em;font-size:12.5px;margin:12px 0 0;text-transform:uppercase}
.pst-versepanel .vp-n{color:#cfc39f;font-size:14.5px;line-height:1.6;margin:14px 0 0}
.pst-chips{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.pst-chip{border:1px solid rgba(212,175,55,.5);background:rgba(212,175,55,.07);color:#f0e6cd;border-radius:999px;padding:10px 16px;font-size:14px;cursor:pointer}
.pst-chip:hover{background:rgba(212,175,55,.16)}
.pst-book{display:grid;gap:18px;border:1px solid rgba(212,175,55,.35);border-radius:16px;padding:22px;background:linear-gradient(120deg,#0d0a05,#171106 55%,#0d0a05)}
@media(min-width:820px){.pst-book{grid-template-columns:1fr 1fr}}
.pst-vol h4{font-family:Georgia,'Times New Roman',serif;font-size:21px;margin:0 0 6px;color:#fff8ea}
.pst-vol p{margin:0 0 12px}
.pst-buy{display:inline-block;background:var(--gold);color:#141005;font-weight:700;border-radius:999px;padding:12px 22px;text-decoration:none}
.pst-doors{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(min-width:820px){.pst-doors{grid-template-columns:repeat(5,1fr)}}
.pst-door{display:block;border:1px solid rgba(212,175,55,.3);border-radius:14px;padding:16px 14px;text-decoration:none;background:rgba(212,175,55,.04)}
.pst-door b{display:block;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#fff8ea;margin-bottom:4px}
.pst-door span{font-size:13px;color:#cdb872;line-height:1.45;display:block}
.pst-close{margin:52px 0 8px;text-align:center}
.pst-close .rule{width:120px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:0 auto 20px}
.pst-close p{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:clamp(18px,4.6vw,23px);line-height:1.55;color:#f0e6cd;max-width:640px;margin:0 auto}
.pst-close .sig{margin-top:14px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:var(--gold)}
@media (prefers-reduced-motion: reduce){.pst-hero img.pst-art{animation:none}}
`;

const VERSE = 'Commit thy works unto the LORD, and thy thoughts shall be established.';
const BOOKS = [
  { vol: 'Volume One', days: 'Days 1–181', pages: '559 pages', url: 'https://www.amazon.com/dp/B0H41J8C8G?tag=kairobot143-20' },
  { vol: 'Volume Two', days: 'Days 182–365', pages: '568 pages', url: 'https://www.amazon.com/dp/B0H3NV2JLH?tag=kairobot143-20' },
];
const DOORS = [
  ['Listen', '#/listen', 'Hear the sound of the house — the full Sanctuary roster.'],
  ['Read', '#/read', 'The Word, and his devotional, day by day.'],
  ['Pray', '#/pray', 'Bring your request. The house prays with you.'],
  ['Community', '#/community', 'Walk in as you are. This is family.'],
  ['Watch', '#/watch', 'Films and messages for the whole house.'],
];

function askPastor(topic) {
  const btn = document.querySelector('[data-fg-btn]');
  const panel = document.querySelector('[data-fg-panel]');
  if (!btn || !panel) return;
  let sec = panel.querySelector('[data-fg-person]');
  if (!sec) { sec = document.createElement('div'); sec.dataset.fgPerson = '1'; panel.insertBefore(sec, panel.children[2] || null); }
  const bodies = {
    devotional: `<p class="fg-q">You asked about Pastor Jeremy's devotional</p><p><b>God Over Everything</b> is his 365-day devotional, in two volumes — Volume One covers Days 1–181 (559 pages), Volume Two Days 182–365 (568 pages), $19.99 each on Amazon. Both volumes are featured on his page and in the Shop, and the Read hub carries the first 5 days free. I answer from the page's own facts — for the words themselves, the book is the source.</p>`,
    verse: `<p class="fg-q">You asked about Proverbs 16:3</p><p>“${VERSE}” — Proverbs 16:3 (KJV). It is the verse this house is named for and the Pastor's conviction: commit the work, and let God establish it. The Read hub carries the full chapter in the house Bible.</p>`,
    pastor: `<p class="fg-q">You asked about the Pastor</p><p>Pastor Jeremy “Chico” Mills — Founder &amp; Pastor of 16:3 Faith and a USAF veteran. His line for this house: the church should sound like the future and feel like family — no suit, no tie, no distance. His full page is behind me; Meet the Pastor lives on the Home page.</p>`,
  };
  sec.innerHTML = (bodies[topic] || bodies.pastor) + `<p style="color:var(--mute);font-size:12.5px">FaithGuide — the house AI host, answering from this page only.</p>`;
  if (panel.hidden) btn.click();
  panel.scrollTop = 0;
}

export async function render(root) {
  /* Full-bleed compensation: 100vw includes a classic scrollbar's width
     while the centered column does not — the shell column shift is half
     the scrollbar. Measured live, never guessed (0 on phones/overlay). */
  const sbwProbe = document.createElement('div');
  sbwProbe.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:100px;height:100px;overflow:scroll;';
  document.body.appendChild(sbwProbe);
  const sbw = sbwProbe.offsetWidth - sbwProbe.clientWidth;
  sbwProbe.remove();
  document.documentElement.style.setProperty('--sbw', Math.max(0, sbw) + 'px');
  const st = document.createElement('style');
  st.textContent = CSS;
  root.appendChild(st);
  const view = document.createElement('div');
  view.innerHTML = `
    <section class="pst-hero reveal">
      <img class="pst-art" src="assets/img/home/pastor.webp" alt="Pastor Jeremy Mills preaching — microphone in hand, arm raised, wearing a black “It Is FINISHED” 16:3 Faith shirt" onerror="this.remove()">
      <span class="pst-tint"></span><span class="pst-shade"></span>
      <span class="pst-eyebrow">✦ THE PASTOR</span>
      <div class="pst-body">
        <h2 class="pst-name">Pastor Jeremy <span class="g">“Chico” Mills</span></h2>
        <p class="pst-role">Founder &amp; Pastor · 16:3 Faith · U.S. Air Force Veteran</p>
        <p class="pst-verse">“${VERSE}” <b>— Proverbs 16:3</b></p>
      </div>
    </section>

    <section class="pst-sec reveal">
      <p class="kicker">His Story</p>
      <h3>The future, and family.</h3>
      <div class="pst-story">
        <div class="pst-versepanel">
          <p class="vp-k">The verse this house stands on</p>
          <p class="vp-t">“Commit thy works unto the LORD, and thy thoughts shall be established.”</p>
          <p class="vp-r">Proverbs 16:3 · KJV</p>
          <p class="vp-n">16:3 is not a slogan here. It is the Pastor's conviction over every song, every film, every prayer on these walls — commit the work, and let God establish it.</p>
        </div>
        <div>
          <p><b>Founder &amp; Pastor of 16:3 Faith</b> — and a USAF veteran who believes the church should sound like the future and feel like family. No suit, no tie, no distance: just the Word, the music, and a house where everybody can walk in as they are.</p>
          <p>Every hub in this house carries his conviction from Proverbs 16:3 — commit the work, and let God establish it. The music, the films, the Word, the prayer wall, the family in the Sanctuary: all of it is built on that one verse, and all of it is open to you.</p>
          <p>Ask FaithGuide about the Pastor, his devotional, or the verse this house stands on:</p>
          <div class="pst-chips">
            <button type="button" class="pst-chip" data-ask="pastor">✦ About the Pastor</button>
            <button type="button" class="pst-chip" data-ask="devotional">✦ His devotional</button>
            <button type="button" class="pst-chip" data-ask="verse">✦ Proverbs 16:3</button>
          </div>
        </div>
      </div>
    </section>

    <section class="pst-sec reveal">
      <p class="kicker">From His Pen</p>
      <h3>God Over Everything — a 365-day devotional.</h3>
      <div class="pst-book">
        ${BOOKS.map((b) => `<div class="pst-vol"><h4>${b.vol}</h4><p>${b.days} · ${b.pages} · Paperback 6×9 · $19.99</p><a class="pst-buy" href="${b.url}" target="_blank" rel="noopener">Get ${b.vol} on Amazon →</a></div>`).join('')}
      </div>
      <p style="margin-top:14px">New to the devotional? The Read hub carries the first 5 days free — start there, then take the year with him.</p>
    </section>

    <section class="pst-sec reveal">
      <p class="kicker">Walk With Us</p>
      <h3>The house is open.</h3>
      <div class="pst-doors">
        ${DOORS.map(([t, h, s]) => `<a class="pst-door" href="${h}"><b>${t}</b><span>${s}</span></a>`).join('')}
      </div>
    </section>

    <section class="pst-close reveal">
      <div class="rule"></div>
      <p>“Commit the work, and let God establish it. That's the whole blueprint — for this house, and for your life too. Welcome home.”</p>
      <p class="sig">— Pastor Jeremy</p>
    </section>`;
  root.appendChild(view);
  view.querySelectorAll('[data-ask]').forEach((b) => b.addEventListener('click', () => askPastor(b.dataset.ask)));
  window.__pastor = { ready: true };
  if (window.FaithMotion) window.FaithMotion.armReveals(root);
}
