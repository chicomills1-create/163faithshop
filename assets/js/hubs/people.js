/* THE PEOPLE hub — the Hall of Faith (founder orders 2026-11-23 19:04–19:11 MST).

   Jeremy's spec: "have its own personal hub, and call it 'The People'… cards of
   every famous bible person… AI intense page, with a bomb looking AI Cards…
   click on each card, and it has a whole background on that person, a bomb 90
   to 120 sec video, and bible versus about that person." North star (19:06):
   the Tree of Life with the River of Life snaking beneath it — "something cool
   like that. We need to make this huge!" Spine ratified 🔥 (19:11): Hebrews 11
   roll call as the index layer · the Tree scene as the Cloud of Witnesses
   entrance · the Scarlet Thread as a travelable line · every person page opens
   IN THEIR OWN WORDS · premiere framing ("16:3 FAITH PRESENTS — <NAME>", the
   film is the feature, the verses are the closing credits) · FaithGuide answers
   on each page ONLY from that person's record, cited.

   DATA: assets/data/people.json — wave 1, 12 complete deep pages. Stories are
   told from Scripture, factual, no invented events or quotes. Verse text is
   quoted EXACTLY from the KJV source the Bible reader uses; anyone whose
   capture is still owed carries versesPending in the data and the gap is
   named in the build record — never quoted from memory, never faked.

   FILMS: each person's 90–120s film is produced in waves (Jesus first, the
   Tree of Life hub film alongside). Until a film exists its slot carries the
   honest IN PRODUCTION plate over the person's real art — never a fake
   player, never a borrowed video.

   ART: painterly photorealism, gold/amber on deep black, one family across
   portraits + defining-moment scenes + the tree key art (people-work/art +
   this build's batches). AI art is labeled where the house labels AI.

   PLACEMENT: route #/people + top-nav link (desktop; the top nav is hidden
   at phone widths by the shell) + first-class doors from Read (05 / THE HALL
   OF FAITH) and Home (tile 08). The bottom phone nav keeps its seven hubs —
   named decision, build record 2026-11-23. */

const DATA = 'assets/data/people.json';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const st = document.createElement('style');
  st.dataset.peopleCss = '1';
  st.textContent = `
  .pp-kicker{display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin:38px 0 0}
  .pp-kicker .hair{flex:1;height:1px;background:var(--line)}
  .pp-kicker .tag{color:var(--mute);letter-spacing:.18em}
  /* ——— HERO: the Tree of Life / Cloud of Witnesses entrance ——— */
  .pp-hero{position:relative;border:1px solid var(--gold-dim);border-radius:22px;overflow:hidden;margin-top:14px;background:#000}
  .pp-hero img.tree{width:100%;height:min(72vh,560px);object-fit:cover;object-position:50% 42%;display:block}
  .pp-hero video.tree{width:100%;height:min(72vh,560px);object-fit:cover;object-position:50% 42%;display:block;background:#000}
  @media(max-width:700px){.pp-hero img.tree{height:64vh}.pp-hero video.tree{height:64vh}}
  .pp-hero .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.42) 0%,rgba(5,5,5,0) 30%,rgba(5,5,5,0) 55%,rgba(5,5,5,.88) 100%)}
  .pp-hero .top{position:absolute;top:18px;left:0;right:0;text-align:center;padding:0 16px}
  .pp-presents{font-size:10px;letter-spacing:.34em;color:var(--gold-hi);text-transform:uppercase}
  .pp-hero h1{font-family:var(--serif);font-size:clamp(52px,13vw,118px);line-height:.94;color:var(--bone);margin:10px 0 6px;text-shadow:0 4px 34px rgba(0,0,0,.75)}
  .pp-hero h1 .g{color:var(--gold)}
  .pp-hero .sub{max-width:620px;margin:0 auto;color:var(--bone);opacity:.92;font-size:15px;line-height:1.6;text-shadow:0 2px 14px rgba(0,0,0,.8)}
  .pp-fruit{position:absolute;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ffe9a8,var(--gold) 62%,rgba(212,175,55,.12) 100%);box-shadow:0 0 14px 4px rgba(212,175,55,.55);transform:translate(-50%,-50%)}
  .pp-fruit.pulse{animation:ppPulse 3.4s ease-in-out infinite}
  @keyframes ppPulse{0%,100%{box-shadow:0 0 10px 3px rgba(212,175,55,.45)}50%{box-shadow:0 0 20px 7px rgba(212,175,55,.75)}}
  .pp-hero .bot{position:absolute;left:0;right:0;bottom:0;padding:16px 18px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
  .pp-filmslot{display:inline-flex;align-items:center;gap:10px;border:1px solid var(--gold-dim);border-radius:999px;padding:9px 15px;background:rgba(5,5,5,.66);backdrop-filter:blur(3px);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-hi)}
  .pp-filmslot .dot{width:8px;height:8px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px 2px rgba(212,175,55,.6)}
  .pp-fruitcount{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--bone);background:rgba(5,5,5,.66);border:1px solid var(--line);border-radius:999px;padding:9px 15px;backdrop-filter:blur(3px)}
  /* ——— Person of the Week ——— */
  .pp-potw{display:grid;grid-template-columns:150px 1fr;gap:18px;border:1px solid var(--gold-dim);border-radius:20px;background:linear-gradient(150deg,#171106,#070707 65%);padding:18px;margin-top:16px;cursor:pointer;text-align:left;width:100%;color:var(--bone)}
  @media(min-width:760px){.pp-potw{grid-template-columns:210px 1fr;padding:22px}}
  .pp-potw img{width:100%;height:100%;min-height:190px;object-fit:cover;object-position:50% 22%;border-radius:14px;border:1px solid rgba(212,175,55,.4)}
  .pp-potw .lab{font-size:10px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
  .pp-potw h3{font-family:var(--serif);font-size:clamp(30px,6vw,44px);line-height:1;margin:8px 0 4px}
  .pp-potw .id{color:var(--gold-hi);font-family:var(--serif);font-style:italic;font-size:16px}
  .pp-potw blockquote{font-family:var(--serif);font-size:clamp(17px,2.6vw,21px);line-height:1.5;color:var(--bone);margin:12px 0 4px}
  .pp-potw .ref{font-size:10px;letter-spacing:.24em;color:var(--mute);text-transform:uppercase}
  .pp-potw .go{margin-top:14px;display:inline-block;background:var(--gold);color:#0a0803;font-weight:700;border-radius:999px;padding:11px 18px;font-size:13.5px}
  /* ——— Scarlet Thread ——— */
  .pp-thread{margin-top:16px;border:1px solid var(--line);border-radius:20px;background:var(--panel);padding:20px 18px;overflow-x:auto}
  .pp-thread .lab{font-size:10px;letter-spacing:.3em;color:#e0655a;text-transform:uppercase}
  .pp-thread p{color:var(--mute);font-size:13px;line-height:1.6;margin-top:8px;max-width:640px}
  .pp-line{display:flex;align-items:center;gap:0;margin-top:18px;min-width:560px}
  .pp-node{display:flex;flex-direction:column;align-items:center;gap:7px;background:none;border:none;cursor:pointer;padding:0 2px;color:var(--bone);flex:none}
  .pp-node .pt{width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:50% 20%;border:2px solid rgba(224,101,90,.65);display:block}
  .pp-node span{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--bone)}
  .pp-node.heart .pt{width:66px;height:66px;border-color:var(--gold);box-shadow:0 0 18px 3px rgba(212,175,55,.5)}
  .pp-node.heart span{color:var(--gold-hi)}
  .pp-link{flex:1;height:2px;background:linear-gradient(90deg,rgba(224,101,90,.25),rgba(224,101,90,.85),rgba(224,101,90,.25));position:relative;top:-11px;min-width:14px}
  .pp-origin{flex:none;font-size:10px;letter-spacing:.2em;color:var(--mute);text-transform:uppercase;position:relative;top:-11px;padding-right:8px}
  /* ——— Roll call ——— */
  .pp-roll{margin-top:16px}
  .pp-roll .intro{font-family:var(--serif);font-style:italic;font-size:clamp(18px,3vw,23px);line-height:1.55;color:var(--gold-hi);max-width:680px}
  .pp-door{display:flex;align-items:baseline;gap:14px;width:100%;text-align:left;background:linear-gradient(150deg,#141005,#0a0a0a 70%);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-top:10px;cursor:pointer;color:var(--bone)}
  .pp-door:hover{border-color:var(--gold)}
  .pp-door .bf{font-family:var(--serif);font-style:italic;color:var(--gold);white-space:nowrap;font-size:15px}
  .pp-door .tx{font-family:var(--serif);font-size:16.5px;line-height:1.5}
  .pp-door .arw{margin-left:auto;color:var(--gold);font-size:18px;flex:none}
  /* ——— River journey + poster cards ——— */
  .pp-era{display:flex;align-items:center;gap:14px;margin:40px 0 4px}
  .pp-era .plate{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:#0a0803;background:var(--gold);font-weight:700;border-radius:999px;padding:8px 16px}
  .pp-era .hair{flex:1;height:1px;background:var(--line)}
  .pp-era .ct{font-size:10.5px;letter-spacing:.2em;color:var(--mute);text-transform:uppercase}
  .pp-grid{display:grid;grid-template-columns:1fr;gap:20px;margin-top:18px;position:relative}
  @media(min-width:760px){.pp-grid{grid-template-columns:1fr 1fr}}
  .pp-card{position:relative;border:1px solid var(--gold-dim);border-radius:20px;overflow:hidden;background:#000;cursor:pointer;text-align:left;padding:0;color:var(--bone);width:100%}
  .pp-card img{width:100%;height:380px;object-fit:cover;object-position:50% 18%;display:block}
  @media(min-width:760px){.pp-card img{height:440px}}
  .pp-card .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.34) 0%,rgba(5,5,5,0) 34%,rgba(5,5,5,0) 52%,rgba(5,5,5,.93) 100%)}
  .pp-card .pres{position:absolute;top:14px;left:16px;font-size:9.5px;letter-spacing:.3em;color:var(--gold-hi);text-transform:uppercase;text-shadow:0 2px 10px rgba(0,0,0,.8)}
  .pp-card .film{position:absolute;top:12px;right:12px;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--bone);background:rgba(5,5,5,.7);border:1px solid var(--gold-dim);border-radius:999px;padding:6px 10px}
  .pp-card .body{position:absolute;left:0;right:0;bottom:0;padding:18px}
  .pp-card h3{font-family:var(--serif);font-size:clamp(32px,6vw,42px);line-height:1;text-shadow:0 3px 18px rgba(0,0,0,.8)}
  .pp-card .id{font-family:var(--serif);font-style:italic;color:var(--gold-hi);font-size:16.5px;margin-top:5px}
  .pp-card .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}
  .pp-card .chip{font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;border:1px solid var(--line);border-radius:999px;padding:6px 11px;color:var(--bone);background:rgba(5,5,5,.55)}
  .pp-card .chip.thread{border-color:rgba(224,101,90,.6);color:#f0a49c}
  .pp-card.heart{grid-column:1/-1;border:2px solid var(--gold);box-shadow:0 0 34px rgba(212,175,55,.22)}
  .pp-card.heart img{height:460px}
  @media(min-width:760px){.pp-card.heart img{height:540px}}
  /* ——— Church closing band ——— */
  .pp-church{position:relative;border:1px solid var(--gold-dim);border-radius:22px;overflow:hidden;margin-top:44px}
  .pp-church img{width:100%;height:340px;object-fit:cover;display:block}
  .pp-church .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.25),rgba(5,5,5,.88) 88%)}
  .pp-church .body{position:absolute;left:0;right:0;bottom:0;padding:22px}
  .pp-church h3{font-family:var(--serif);font-size:clamp(30px,6vw,46px);line-height:1}
  .pp-church p{color:var(--bone);opacity:.92;font-size:14.5px;line-height:1.65;max-width:600px;margin-top:8px}
  .pp-church a.go{display:inline-block;margin-top:14px;background:var(--gold);color:#0a0803;font-weight:700;border-radius:999px;padding:12px 20px;text-decoration:none;font-size:14px}
  .pp-note{font-size:12.5px;color:var(--mute);line-height:1.65;margin-top:22px}
  /* ——— Person page (premiere) ——— */
  .pp-back{display:inline-block;margin-top:16px;background:none;border:1px solid var(--line);color:var(--bone);border-radius:999px;padding:10px 16px;cursor:pointer;font-size:13px}
  .pp-preshead{text-align:center;margin-top:26px;padding:0 8px}
  .pp-preshead .pres{font-size:10.5px;letter-spacing:.36em;color:var(--gold);text-transform:uppercase}
  .pp-preshead h2{font-family:var(--serif);font-size:clamp(46px,11vw,92px);line-height:.96;margin:12px 0 6px;color:var(--bone)}
  .pp-preshead .id{font-family:var(--serif);font-style:italic;color:var(--gold-hi);font-size:clamp(17px,3vw,22px)}
  .pp-scene{position:relative;border:1px solid var(--gold-dim);border-radius:22px;overflow:hidden;margin-top:22px}
  .pp-scene img{width:100%;height:min(58vh,480px);object-fit:cover;display:block}
  .pp-scene .cap{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(180deg,rgba(5,5,5,0),rgba(5,5,5,.88));font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-hi)}
  .pp-words{margin-top:30px;text-align:center;padding:30px 18px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .pp-words .lab{font-size:10px;letter-spacing:.32em;color:var(--gold);text-transform:uppercase}
  .pp-words blockquote{font-family:var(--serif);font-size:clamp(24px,5.4vw,40px);line-height:1.3;color:var(--bone);max-width:820px;margin:16px auto 10px}
  .pp-words .ref{font-size:11px;letter-spacing:.26em;color:var(--mute);text-transform:uppercase}
  .pp-feature{margin-top:26px;border:1px solid var(--gold-dim);border-radius:22px;overflow:hidden;position:relative;background:#000}
  .pp-feature img{width:100%;object-fit:cover;display:block;opacity:.85}
  /* STILL-PORTRAIT FEATURE FRAME (2026-11-24 cure): the portraits are tall posters;
     the old 320px window at 50% 20% showed sky and hood, face cropped out.
     Taller window + per-person framePos (people.json) put the face forward. */
  .pp-feature img.pp-live{height:460px;object-position:50% 35%}
  @media(max-width:768px){.pp-feature img.pp-live{height:400px}}
  .pp-feature .plate{position:absolute;inset:auto 0 0 0;padding:18px;background:linear-gradient(180deg,rgba(5,5,5,0),rgba(5,5,5,.92) 45%);text-align:center}
  .pp-feature .t{font-size:10.5px;letter-spacing:.3em;color:var(--gold-hi);text-transform:uppercase}
  .pp-feature .s{color:var(--bone);opacity:.88;font-size:13.5px;line-height:1.6;margin-top:7px;max-width:560px;margin-left:auto;margin-right:auto}
  .pp-story{margin-top:30px;max-width:760px}
  .pp-story h3,.pp-credits h3{font-family:var(--serif);font-size:clamp(28px,5.6vw,40px);color:var(--bone);margin-bottom:14px}
  .pp-story p{color:var(--bone);opacity:.9;font-size:16px;line-height:1.75;margin-top:14px}
  .pp-story p:first-of-type{margin-top:0}
  .pp-scene2{margin-top:22px}
  .pp-ask{margin-top:28px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(150deg,#141005,#0a0a0a 70%);padding:20px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between}
  .pp-ask .t{font-family:var(--serif);font-size:20px;color:var(--bone)}
  .pp-ask .s{color:var(--mute);font-size:13px;line-height:1.6;margin-top:5px;max-width:520px}
  .pp-ask button{background:var(--gold);color:#0a0803;font-weight:700;border:none;border-radius:999px;padding:13px 20px;cursor:pointer;font-size:14px;flex:none}
  .pp-credits{margin-top:36px;text-align:center;border-top:1px solid var(--line);padding-top:28px}
  .pp-credits .lab{font-size:10px;letter-spacing:.32em;color:var(--gold);text-transform:uppercase}
  .pp-credit{max-width:700px;margin:24px auto 0}
  .pp-credit .tx{font-family:var(--serif);font-size:clamp(18px,3.4vw,23px);line-height:1.55;color:var(--bone)}
  .pp-credit .rf{font-size:10.5px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase;margin-top:8px}
  .pp-threadstrip{margin-top:30px;border:1px solid rgba(224,101,90,.35);border-radius:16px;padding:16px 18px;font-size:13.5px;line-height:2;color:var(--mute)}
  .pp-threadstrip b{color:#f0a49c;letter-spacing:.14em;font-size:10.5px;text-transform:uppercase;display:block;margin-bottom:4px}
  .pp-threadstrip a{color:var(--bone);text-decoration:none;border-bottom:1px solid rgba(224,101,90,.5)}
  /* ——— PROFILES ALIVE (2026-11-23) — the living motion layer.
     Founder: "I don't like the stale look" / "Bring it to life!" /
     COMPLETE MOVEMENT. Code-driven only: transform/opacity, slow
     alternate drifts, blend-screen light. Nothing here paints per
     frame; reduced motion stills every layer (media block below),
     and the living videos are IO-gated by armLiving() — they load
     and play only while on screen, never under reduced motion. */
  .pp-live{animation:ppDrift 36s ease-in-out infinite alternate;will-change:transform}
  .pp-live.slow{animation-duration:48s}
  @keyframes ppDrift{from{transform:scale(1.06) translate(0,0)}to{transform:scale(1.13) translate(-1.6%,1.4%)}}
  .pp-hero .rays{position:absolute;inset:-45% -20%;background:repeating-conic-gradient(from 0deg at 50% 0%,transparent 0deg,rgba(243,210,122,.07) 7deg,transparent 15deg,rgba(243,210,122,.05) 22deg,transparent 31deg);mix-blend-mode:screen;pointer-events:none;animation:ppRays 52s ease-in-out infinite alternate}
  @keyframes ppRays{from{transform:rotate(-3.5deg) scale(1.06)}to{transform:rotate(3.5deg) scale(1.06)}}
  .pp-hero .river{position:absolute;left:-18%;right:-18%;bottom:2%;height:38%;background:linear-gradient(100deg,transparent 26%,rgba(168,216,255,.13) 44%,rgba(243,210,122,.20) 50%,rgba(168,216,255,.13) 56%,transparent 74%);mix-blend-mode:screen;pointer-events:none;animation:ppRiver 12s ease-in-out infinite alternate}
  @keyframes ppRiver{from{transform:translateX(-9%)}to{transform:translateX(9%)}}
  .pp-potw{position:relative;overflow:hidden}
  .pp-potw::after{content:'';position:absolute;top:0;bottom:0;left:0;width:42%;background:linear-gradient(100deg,transparent,rgba(243,210,122,.14),transparent);transform:translateX(-280%) skewX(-14deg);animation:ppShimmer 8s ease-in-out infinite;pointer-events:none}
  @keyframes ppShimmer{0%,52%{transform:translateX(-280%) skewX(-14deg)}88%,100%{transform:translateX(380%) skewX(-14deg)}}
  /* ——— Person page hero: full-bleed premiere plate ——— */
  .pp-scene.hero{border:none;border-radius:24px;margin-top:18px;background:#000}
  .pp-scene.hero>img{height:min(76vh,640px)}
  @media(max-width:700px){.pp-scene.hero>img{height:68vh}}
  .pp-sceneshade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.38) 0%,rgba(5,5,5,0) 30%,rgba(5,5,5,0) 48%,rgba(5,5,5,.94) 100%);pointer-events:none}
  .pp-pagetitle{position:absolute;left:0;right:0;bottom:0;padding:20px 22px 26px;pointer-events:none}
  .pp-pagetitle .pres{font-size:10.5px;letter-spacing:.36em;color:var(--gold);text-transform:uppercase}
  .pp-pagetitle h2{font-family:var(--serif);font-size:clamp(54px,12.5vw,112px);line-height:.94;margin:10px 0 6px;color:var(--bone);text-shadow:0 4px 34px rgba(0,0,0,.8)}
  .pp-pagetitle .id{font-family:var(--serif);font-style:italic;color:var(--gold-hi);font-size:clamp(17px,3vw,22px);text-shadow:0 2px 12px rgba(0,0,0,.8)}
  .pp-scene .cap.chip{bottom:auto;top:14px;right:14px;left:auto;background:rgba(5,5,5,.58);border:1px solid rgba(212,175,55,.35);border-radius:999px;padding:7px 12px;backdrop-filter:blur(3px)}
  .pp-loopvid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.4s ease;pointer-events:none}
  .pp-loopvid.on{opacity:1}
  .pp-feature video{width:100%;height:320px;object-fit:cover;display:block;background:#000}
  /* ——— Own words: the gold-ruled pull-quote ——— */
  .pp-words{border-top:none;border-bottom:none;position:relative;padding:40px 18px}
  .pp-words::before,.pp-words::after{content:'';position:absolute;left:50%;transform:translateX(-50%);width:min(680px,86%);height:1px;background:linear-gradient(90deg,transparent,var(--gold) 30%,var(--gold) 70%,transparent)}
  .pp-words::before{top:0}
  .pp-words::after{bottom:0}
  .pp-words blockquote{font-size:clamp(27px,6vw,44px);line-height:1.28}
  /* ——— The River strip: where this witness stands ——— */
  .pp-river{margin-top:20px;border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:16px 16px 12px}
  .pp-river .lab{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:baseline;font-size:10px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase}
  .pp-river .lab .where{color:var(--bone)}
  .pp-river .lab .threadnote{color:#f0a49c}
  .pp-riverline{display:flex;align-items:flex-start;margin-top:14px;overflow-x:auto;padding:4px 2px 6px}
  .pp-rnode{display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:0 1px;color:var(--mute);flex:none;font-family:inherit}
  .pp-rnode img{width:38px;height:38px;border-radius:50%;object-fit:cover;object-position:50% 20%;border:2px solid rgba(212,175,55,.25);display:block;opacity:.72}
  .pp-rnode span{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;max-width:54px;text-align:center;line-height:1.3}
  .pp-rnode.now{color:var(--gold-hi)}
  .pp-rnode.now img{width:48px;height:48px;border-color:var(--gold);opacity:1;box-shadow:0 0 16px 3px rgba(212,175,55,.5)}
  .pp-rnode:hover img{border-color:var(--gold);opacity:1}
  .pp-rlink{flex:1;height:2px;background:linear-gradient(90deg,rgba(212,175,55,.14),rgba(212,175,55,.5),rgba(212,175,55,.14));position:relative;top:23px;min-width:8px}
  .pp-rlink.done{background:linear-gradient(90deg,rgba(212,175,55,.5),rgba(212,175,55,.95),rgba(212,175,55,.5))}
  /* ——— Prev / next witness doors: the river continues ——— */
  .pp-nav{display:grid;grid-template-columns:1fr;gap:12px;margin-top:30px}
  @media(min-width:640px){.pp-nav{grid-template-columns:1fr 1fr}}
  .pp-navdoor{display:block;text-align:left;background:linear-gradient(150deg,#141005,#0a0a0a 70%);border:1px solid var(--gold-dim);border-radius:16px;padding:18px;cursor:pointer;color:var(--bone);width:100%;font-family:inherit;text-decoration:none}
  .pp-navdoor:hover{border-color:var(--gold)}
  .pp-navdoor .lab{display:block;font-size:9.5px;letter-spacing:.28em;color:var(--gold);text-transform:uppercase}
  .pp-navdoor .nm{display:block;font-family:var(--serif);font-size:26px;line-height:1.1;margin-top:7px}
  .pp-navdoor .id{display:block;font-family:var(--serif);font-style:italic;color:var(--gold-hi);font-size:14.5px;margin-top:3px}
  .pp-navdoor.next{text-align:right}
  @media (prefers-reduced-motion: reduce){
    .pp-live,.pp-hero .rays,.pp-hero .river,.pp-potw::after,.pp-fruit.pulse{animation:none!important}
    .pp-loopvid{display:none}
  }
/* ---------- PEOPLE ATMOSPHERE (2026-11-24, founder order) ----------
   The People face sat on flat black — on a wide screen the flanks were
   dead space ("the dead space is just so blah"). A fixed haze of
   the hub's own Tree of Life — the great golden tree with
   a river of light at its roots (tree-of-life, the People
   hero's own art): its glow breathed out into the flanks of
   the index and of every witness page
   now breathes behind the People index + person pages (the hub's two face views): painted as the first node of the
   view, so it leaves with the view and never reaches the hub's other
   rooms. A haze you feel, not a picture you look at: heavy blur +
   darkness at low opacity, radial-masked to nothing across the center
   content column and at every edge. pointer-events none, aria-hidden
   in the markup, fixed + inset 0 inside an overflow-hidden shell, so
   it can never add a pixel of scroll. The drift is barely perceptible
   and dies under prefers-reduced-motion; phones get a fainter, still
   layer (their dead space is minimal). Same system as the Listen
   pilot (.lsn-atmo), geared to this hub's own art. */
.pp-atmo{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:#050505}
.pp-atmo::before{content:"";position:absolute;inset:-48px;background:url('assets/img/people/tree-of-life.webp') center 42%/cover no-repeat;opacity:.17;filter:blur(9px) brightness(.55) saturate(.85);-webkit-mask-image:radial-gradient(ellipse 56% 64% at 50% 42%,transparent 40%,rgba(0,0,0,.85) 62%,rgba(0,0,0,.45) 85%,transparent 99%);mask-image:radial-gradient(ellipse 56% 64% at 50% 42%,transparent 40%,rgba(0,0,0,.85) 62%,rgba(0,0,0,.45) 85%,transparent 99%);animation:ppAtmoDrift 90s ease-in-out infinite alternate}
@keyframes ppAtmoDrift{from{transform:scale(1.03) translate3d(0,0,0)}to{transform:scale(1.09) translate3d(-1.2%,1%,0)}}
@media(max-width:768px){.pp-atmo::before{opacity:.07;animation:none}}
@media(prefers-reduced-motion:reduce){.pp-atmo::before{animation:none}}
  `;
  document.head.appendChild(st);
}

let cache = null;
async function loadPeople() {
  if (cache) return cache;
  const r = await fetch(DATA);
  if (!r.ok) throw new Error('people data ' + r.status);
  cache = await r.json();
  return cache;
}

const FRUITS = [[17,30],[25,19],[32,37],[40,15],[47,29],[54,13],[59,33],[65,21],[71,37],[77,17],[83,29],[49,43]];
const ERA_ORDER = ['patriarchs', 'exodus', 'kingdom', 'exile', 'forerunner', 'witnesses', 'jesus', 'apostle'];

function potwSlug(doc) {
  const epoch = Date.UTC(2026, 10, 23); // Monday of launch week — rotation starts with Jesus
  const weeks = Math.floor((Date.now() - epoch) / 604800000);
  const rot = doc.potwRotation;
  return rot[((weeks % rot.length) + rot.length) % rot.length];
}

function filmPlate(label) {
  return `<span class="pp-filmslot"><span class="dot"></span>${esc(label)} · Film in production</span>`;
}

function indexHTML(doc) {
  const by = Object.fromEntries(doc.people.map((p) => [p.slug, p]));
  const potw = by[potwSlug(doc)];
  const potwLine = potw.ownWords || potw.hallLine;
  const roll = ['abraham', 'joseph', 'moses', 'daniel', 'david'].map((s) => by[s]).filter((p) => p && (p.hallLine || p.slug === 'david' || p.slug === 'daniel'));
  const rollLine = (p) => {
    if (p.slug === 'david') return { text: '…of David also, and Samuel, and of the prophets:', ref: 'Hebrews 11:32' };
    if (p.slug === 'daniel') return { text: 'Who through faith… stopped the mouths of lions,', ref: 'Hebrews 11:33' };
    return p.hallLine;
  };
  const eras = ERA_ORDER.map((e) => ({ era: e, people: doc.people.filter((p) => p.era === e) })).filter((g) => g.people.length);
  const threadNodes = doc.thread.map((s) => by[s]).filter(Boolean);
  return `
  <div class="pp-atmo" aria-hidden="true"></div>
  <section class="pp-hero reveal">
    <video class="tree pp-live" data-living src="assets/video/people/tree-film.mp4" poster="assets/img/people/tree-of-life.webp" muted loop playsinline preload="none" aria-label="The Tree of Life Film — from the dawn of Eden to the healing of the nations"></video>
    <div class="shade"></div>
    <div class="rays" aria-hidden="true"></div>
    <div class="river" aria-hidden="true"></div>
    ${FRUITS.slice(0, doc.people.length).map(([x, y], i) => `<span class="pp-fruit${window.FaithFilm && window.FaithFilm.reduced ? '' : ' pulse'}" style="left:${x}%;top:${y}%;animation-delay:${(i % 6) * 0.55}s" aria-hidden="true"></span>`).join('')}
    <div class="top">
      <p class="pp-presents">16:3 Faith Presents</p>
      <h1>THE <span class="g">PEOPLE</span></h1>
      <p class="sub">The Hall of Faith. Under the Tree of Life, beside the river that runs through the whole story, the witnesses stand gathered — every one of them with a story, their own words, and a film on the way.</p>
    </div>
    <div class="bot">
      <span class="pp-filmslot"><span class="dot"></span>The Tree of Life Film · Now Playing</span>
      <span class="pp-fruitcount">${doc.people.length} fruits lit · Wave ${doc.wave} — the tree grows as the hall grows</span>
    </div>
  </section>

  <div class="pp-kicker"><span>Person of the Week</span><span class="hair"></span><span class="tag">Rotates weekly through the hall</span></div>
  <button type="button" class="pp-potw reveal" data-person="${esc(potw.slug)}">
    <img class="pp-live" src="${esc(potw.portrait)}" alt="${esc(potw.name)} — portrait" loading="lazy">
    <span>
      <span class="lab">✦ Person of the Week</span>
      <h3>${esc(potw.name)}</h3>
      <span class="id">${esc(potw.identity)}</span>
      ${potwLine ? `<blockquote>“${esc(potwLine.text)}”</blockquote><span class="ref">${esc(potwLine.ref)} · KJV</span>` : ''}
      <span class="go">Enter their world →</span>
    </span>
  </button>

  <div class="pp-kicker"><span>The Scarlet Thread</span><span class="hair"></span><span class="tag">The bloodline of the promise</span></div>
  <section class="pp-thread reveal">
    <span class="lab">✦ The Scarlet Thread</span>
    <p>One line runs through the whole Bible — the promise carried from father to son, mother to child, all the way to Jesus. Tap anyone on the line to land on their page. The line grows as the hall grows.</p>
    <div class="pp-line">
      <span class="pp-origin">From Adam →</span>
      ${threadNodes.map((p, i) => `${i ? '<span class="pp-link"></span>' : ''}<button type="button" class="pp-node${p.heart ? ' heart' : ''}" data-person="${esc(p.slug)}"><img class="pt" src="${esc(p.portrait)}" alt="" loading="lazy"><span>${esc(p.name.split(' ')[0])}</span></button>`).join('')}
    </div>
  </section>

  <div class="pp-kicker"><span>The Roll Call</span><span class="hair"></span><span class="tag">Hebrews 11</span></div>
  <section class="pp-roll reveal">
    <p class="intro">“Now faith is the substance of things hoped for, the evidence of things not seen.” — Hebrews 11:1. The chapter reads the hall's names aloud. Each line is a door.</p>
    ${roll.map((p) => { const l = rollLine(p); return `<button type="button" class="pp-door" data-person="${esc(p.slug)}"><span class="bf">By faith…</span><span class="tx">“${esc(l.text)}” <span style="color:var(--mute);font-size:12px;letter-spacing:.18em"> ${esc(l.ref).toUpperCase()}</span></span><span class="arw">→</span></button>`; }).join('')}
  </section>

  <div class="pp-kicker"><span>Walk the River</span><span class="hair"></span><span class="tag">Wave ${doc.wave} · ${doc.people.length} of the hall</span></div>
  ${eras.map((g) => `
  <div class="pp-era"><span class="plate">${esc(g.people[0].eraLabel)}</span><span class="hair"></span><span class="ct">${g.people.length} ${g.people.length === 1 ? 'witness' : 'witnesses'}</span></div>
  <div class="pp-grid">
    ${g.people.map((p) => `
    <button type="button" class="pp-card${p.heart ? ' heart' : ''} reveal" data-person="${esc(p.slug)}">
      <img class="pp-live" src="${esc(p.portrait)}" alt="${esc(p.name)} — portrait" loading="lazy">
      <span class="shade"></span>
      <span class="pres">16:3 Faith Presents</span>
      <span class="film">${p.slug === 'jesus' || p.slug === 'moses' || p.slug === 'david' || p.slug === 'mary' ? 'The Film · Now Playing' : 'Film in production'}</span>
      <span class="body">
        <h3>${esc(p.name)}</h3>
        <span class="id">${esc(p.identity)}</span>
        <span class="meta"><span class="chip">${esc(p.eraLabel)}</span><span class="chip">${p.testament === 'OT' ? 'Old Testament' : 'New Testament'}</span>${p.thread ? '<span class="chip thread">✦ On the Scarlet Thread</span>' : ''}${p.heart ? '<span class="chip" style="border-color:var(--gold);color:var(--gold-hi)">The Centre</span>' : ''}</span>
      </span>
    </button>`).join('')}
  </div>`).join('')}

  <section class="pp-church reveal">
    <img class="pp-live" src="assets/img/people/scene-pentecost.webp" alt="Pentecost — the first believers gathered as tongues of fire descend" loading="lazy">
    <span class="shade"></span>
    <div class="body">
      <p class="pp-presents">And then — the Church</p>
      <h3>THE RIVER RUNS <span style="color:var(--gold)">ON.</span></h3>
      <p>The story does not end with the twelve. At Pentecost the witnesses became a community — and that community is still gathering. The hall's last door opens into the living one.</p>
      <a class="go" href="#/community">Meet the Community ↗</a>
    </div>
  </section>
  <p class="pp-note">Portraits and scenes are original AI artwork in one cinematic family — artwork, not photographs; the people of Scripture left no cameras. Verses are ${esc(doc.translation)}. Films of the hall premiere in waves — Jesus, Moses, David and Mary have premiered, and the Tree of Life film now plays over the hall itself; the remaining films are in production, and every film slot on this page says so honestly until its film lands.</p>`;
}

function personHTML(doc, p) {
  const by = Object.fromEntries(doc.people.map((x) => [x.slug, x]));
  const words = p.ownWords
    ? { lab: 'In their own words', text: p.ownWords.text, ref: p.ownWords.ref }
    : (p.hallLine ? { lab: 'The hall speaks of them · Hebrews 11', text: p.hallLine.text, ref: p.hallLine.ref } : null);
  /* PROFILES ALIVE: the river order is the data's own order — the
     strip shows where this witness stands, the foot doors chain the
     pages like chapters. Moses' scene carries the banked Red Sea
     living loop over its poster; Jesus' feature frame plays his
     completed feature film (JESUS FILM STITCH 2026-11-24), and
     Moses' feature frame plays his (MOSES FILM STITCH 2026-11-24),
     as does David's (DAVID FILM STITCH 2026-11-24),
     and Mary's (MARY FILM STITCH 2026-11-24),
     and Abraham's (ABRAHAM FILM STITCH 2026-11-25),
     and Peter's (PETER FILM STITCH 2026-11-25). */
  const idx = doc.people.findIndex((x) => x.slug === p.slug);
  const prev = idx > 0 ? doc.people[idx - 1] : null;
  const next = idx >= 0 && idx < doc.people.length - 1 ? doc.people[idx + 1] : null;
  const isMoses = p.slug === 'moses';
  const isJesus = p.slug === 'jesus';
  const isDavid = p.slug === 'david';
  const isMary = p.slug === 'mary';
  const isAbraham = p.slug === 'abraham';
  const isPeter = p.slug === 'peter';
  return `
  <div class="pp-atmo" aria-hidden="true"></div>
  <button type="button" class="pp-back" data-back>← Back to the Hall</button>
  <section class="pp-scene hero reveal">
    <img class="pp-live slow" src="${esc(p.scene)}" alt="${esc(p.name)} — the defining moment: ${esc(p.sceneCaption)}">
    ${isMoses ? `<video class="pp-loopvid" data-living src="assets/video/people/red-sea-loop.mp4" poster="${esc(p.scene)}" muted loop playsinline preload="none" aria-hidden="true"></video>` : ''}
    <div class="pp-sceneshade"></div>
    <span class="cap chip">${esc(p.sceneCaption)}</span>
    <div class="pp-pagetitle">
      <p class="pres">16:3 Faith Presents</p>
      <h2>${esc(p.name.toUpperCase())}</h2>
      <p class="id">${esc(p.identity)} · ${esc(p.eraLabel)}</p>
    </div>
  </section>
  <section class="pp-river reveal">
    <div class="lab"><span>✦ On the River</span><span class="where">Witness ${idx + 1} of ${doc.people.length} · ${esc(p.eraLabel)}</span>${p.thread ? '<span class="threadnote">✦ On the Scarlet Thread</span>' : ''}</div>
    <div class="pp-riverline">
      ${doc.people.map((x, i) => `${i ? `<span class="pp-rlink${i <= idx ? ' done' : ''}"></span>` : ''}<button type="button" class="pp-rnode${x.slug === p.slug ? ' now' : ''}" data-person="${esc(x.slug)}" aria-label="${esc(x.name)}"><img src="${esc(x.portrait)}" alt="" loading="lazy"><span>${esc(x.name.split(' ')[0])}</span></button>`).join('')}
    </div>
  </section>
  ${words ? `<section class="pp-words reveal"><span class="lab">${esc(words.lab)}</span><blockquote>“${esc(words.text)}”</blockquote><span class="ref">${esc(words.ref)} · KJV</span></section>` : ''}
  <section class="pp-feature reveal">
    ${isJesus ? `<video data-living src="assets/video/people/jesus-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="Jesus: The Film — the full feature, from the baptism to the ascension"></video>` : isMoses ? `<video data-living src="assets/video/people/moses-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="Moses: The Film — the full feature, from the burning bush to the blessing of Joshua"></video>` : isDavid ? `<video data-living src="assets/video/people/david-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="David: The Film — the full feature, from the shepherd's lyre to the blessing of Solomon"></video>` : isMary ? `<video data-living src="assets/video/people/mary-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="Mary: The Film — the full feature, from the annunciation to the assumption"></video>` : isAbraham ? `<video data-living src="assets/video/people/abraham-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="Abraham: The Film — the full feature, from the call out of Ur to the promise kept"></video>` : isPeter ? `<video data-living src="assets/video/people/peter-film.mp4" poster="${esc(p.portrait)}" muted loop playsinline preload="none" aria-label="Peter: The Film — the full feature, from the nets of Galilee to the rooftop at Joppa"></video>` : `<img class="pp-live" style="object-position:${esc(p.framePos || '50% 35%')}" src="${esc(p.portrait)}" alt="${esc(p.name)} — portrait" loading="lazy">`}
    <div class="plate">
      ${isJesus
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · Jesus: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the baptism in the Jordan, the sermon on the hillside, the feeding of the multitude, the walk on the water, the healings, the entry into Jerusalem, the Last Supper, the road of the cross, the empty tomb at dawn, and the ascension. 105 seconds, his whole road.</p>`
        : isMoses
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · Moses: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the burning bush, the parting of the sea, the crossing under the pillar of fire, the tablets on Sinai, manna at dawn, water from the rock, the battle held with raised hands, the bronze serpent lifted up, the glory on the tabernacle, the promised land seen from Nebo, and the blessing of Joshua. 105 seconds, his whole road.</p>`
        : isDavid
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · David: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the shepherd's lyre in the fields, the anointing by Samuel, the harp before Saul, the run at Goliath, the covenant with Jonathan, mercy in the cave, the dance before the Ark, repentance before Nathan, grief for Absalom, a psalm written by lamplight, and the blessing of Solomon. 105 seconds, his whole road.</p>`
        : isMary
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · Mary: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the annunciation in a blaze of light at the well, the visitation, the journey to Bethlehem, the nativity under the star, the presentation in the temple, the flight to Egypt, the finding of Jesus in the temple, the wedding at Cana, standing at the foot of the cross, the fire of Pentecost, and the assumption into glory. 105 seconds, her whole road.</p>`
        : isAbraham
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · Abraham: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the call out of Ur at dawn, the journey with the flocks, the promise under the stars, the altar on the mountain, the oaks of Mamre, the three visitors, Sarah's laughter, the road to Moriah, the ram in the thicket, the covenant hand raised to heaven, and the promise kept under the oak. 105 seconds, his whole road.</p>`
        : isPeter
        ? `<p class="t">✦ The Feature — 16:3 Faith Presents · Peter: The Film</p>
           <p class="s">The feature has premiered — the whole story in one film, playing in this frame: the call from the nets at dawn, the confession on the hillside, walking on the water, the glory on the mountain, the fire in the courtyard, tears at first light, the run to the empty tomb, breakfast on the shore, "feed my sheep," the fire of Pentecost, and the rooftop at Joppa. 105 seconds, his whole road.</p>`
        : `<p class="t">✦ The Feature — ${esc(p.name)}: The Film · 90–120 seconds · In Production</p>
           <p class="s">The films of the hall are being produced in waves — Jesus first. Until ${esc(p.name.split(' ')[0])}'s film lands, this frame holds their portrait. No borrowed footage, no fake player — when the film arrives, it premieres here.</p>`}
    </div>
  </section>
  <section class="pp-story reveal">
    <h3>THE STORY.</h3>
    ${p.story.map((t) => `<p>${esc(t)}</p>`).join('')}
  </section>
  ${p.scene2 ? `<section class="pp-scene pp-scene2 reveal"><img class="pp-live" src="${esc(p.scene2)}" alt="${esc(p.name)} — ${esc(p.scene2Caption)}" loading="lazy"><span class="cap">${esc(p.scene2Caption)}</span></section>` : ''}
  <section class="pp-ask reveal">
    <div><p class="t">✦ Ask about ${esc(p.name.split(' ')[0])}</p><p class="s">FaithGuide answers from ${esc(p.name.split(' ')[0])}'s record on this page only — their own words and the verses below, cited. Labeled AI, as everywhere in this house.</p></div>
    <button type="button" data-ask="${esc(p.slug)}">Ask FaithGuide →</button>
  </section>
  <section class="pp-credits reveal">
    <span class="lab">Closing Credits — The Word</span>
    <h3 style="margin-top:10px">THE VERSES.</h3>
    ${p.verses.length ? p.verses.map((v) => `<div class="pp-credit reveal"><p class="tx">“${esc(v.text)}”</p><p class="rf">${esc(v.ref)} · KJV</p></div>`).join('') : `<p class="pp-note" style="text-align:center">The verses for this page are being set in type from the KJV — quoted exactly, or not at all. They land with the next sourcing pass; the story above is complete.</p>`}
  </section>
  ${p.thread ? `<div class="pp-threadstrip reveal"><b>✦ On the Scarlet Thread</b>${doc.thread.map((s) => by[s]).filter(Boolean).map((x) => x.slug === p.slug ? `<span style="color:var(--gold-hi)">${esc(x.name)}</span>` : `<a href="#/people/${esc(x.slug)}">${esc(x.name)}</a>`).join(' → ')}</div>` : ''}
  <nav class="pp-nav">
    ${prev ? `<button type="button" class="pp-navdoor prev" data-person="${esc(prev.slug)}"><span class="lab">← Previous witness</span><span class="nm">${esc(prev.name)}</span><span class="id">${esc(prev.identity)}</span></button>` : `<button type="button" class="pp-navdoor prev" data-back><span class="lab">← The river begins</span><span class="nm">Back to the Hall</span><span class="id">The Tree of Life entrance</span></button>`}
    ${next ? `<button type="button" class="pp-navdoor next" data-person="${esc(next.slug)}"><span class="lab">The river continues →</span><span class="nm">${esc(next.name)}</span><span class="id">${esc(next.identity)}</span></button>` : `<a class="pp-navdoor next" href="#/community"><span class="lab">The river runs on →</span><span class="nm">Meet the Community</span><span class="id">The witnesses became a family</span></a>`}
  </nav>
  <button type="button" class="pp-back" data-back>← Back to the Hall</button>`;
}

/* Living videos (PROFILES ALIVE + audit cure 2026-11-24): a
   [data-living] video carries its real src with preload="none" — no
   bytes move until the observer plays it on screen; it fades in
   over its poster and pauses off screen. It used to carry NO src
   until intersection (a data-src hand-off), and in that window the
   browser's accessibility tree named the sourceless element
   "Unable to play media" — the flicker two live walks caught. The
   poster always covered the frame visually; now the element is
   never sourceless, so the false label never exists. Under reduced
   motion nothing plays and the poster stands. */
function armLiving(scope) {
  const vids = scope.querySelectorAll('video[data-living]');
  if (!vids.length) return;
  const reduced = window.FaithFilm ? window.FaithFilm.reduced
    : (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (!v.isConnected) { io.unobserve(v); return; }
    if (e.isIntersecting) {
      const pr = v.play();
      if (pr && pr.then) pr.then(() => v.classList.add('on')).catch(() => {});
      else v.classList.add('on');
    } else { v.pause(); v.classList.remove('on'); }
  }), { threshold: 0.2 });
  vids.forEach((v) => io.observe(v));
}

/* Ask-from-the-record: FaithGuide's panel is the house machinery; the hub
   adds ONE grounded block to it — the person's own sourced record, cited —
   and opens it. Nothing is generated; the answer IS the record. */
function askAbout(p) {
  const btn = document.querySelector('[data-fg-btn]');
  const panel = document.querySelector('[data-fg-panel]');
  if (!btn || !panel) return;
  let sec = panel.querySelector('[data-fg-person]');
  if (!sec) { sec = document.createElement('div'); sec.dataset.fgPerson = '1'; panel.insertBefore(sec, panel.children[2] || null); }
  const lines = [];
  if (p.ownWords) lines.push(`<p class="fg-q">${esc(p.name.split(' ')[0])}, in their own words</p><p>“${esc(p.ownWords.text)}” — ${esc(p.ownWords.ref)} (KJV)</p>`);
  if (p.hallLine) lines.push(`<p class="fg-q">The Hall of Faith on ${esc(p.name.split(' ')[0])}</p><p>“${esc(p.hallLine.text)}” — ${esc(p.hallLine.ref)} (KJV)</p>`);
  p.verses.slice(0, 2).forEach((v) => lines.push(`<p class="fg-q">${esc(v.ref)}</p><p>“${esc(v.text)}”</p>`));
  if (!lines.length) lines.push(`<p>${esc(p.name.split(' ')[0])}'s verses are being set in type from the KJV — I won't quote what hasn't been verified. Their story is on the page behind me, told from Scripture.</p>`);
  sec.innerHTML = `<p class="fg-q">You asked about ${esc(p.name)}</p><p>From ${esc(p.name.split(' ')[0])}'s record — Scripture only, cited:</p>${lines.join('')}`;
  if (panel.hidden) btn.click();
  panel.scrollTop = 0;
}

export async function render(root) {
  injectCss();
  window.__people = { ready: false };
  root.innerHTML = '<p class="pp-note" style="margin-top:30px">Entering the hall…</p>';
  let doc;
  try { doc = await loadPeople(); } catch { root.innerHTML = '<p class="pp-note" style="margin-top:30px">The hall could not be loaded just now. The witnesses are patient — try again in a moment.</p>'; return; }
  const m = location.hash.match(/^#\/people(?:\/([a-z-]+))?/);
  const slug = m && m[1];
  const person = slug ? doc.people.find((p) => p.slug === slug) : null;
  root.innerHTML = person ? personHTML(doc, person) : indexHTML(doc);
  root.querySelectorAll('[data-person]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/people/' + b.dataset.person; }));
  root.querySelectorAll('[data-back]').forEach((b) => b.addEventListener('click', () => { location.hash = '#/people'; }));
  root.querySelectorAll('[data-ask]').forEach((b) => b.addEventListener('click', () => { const p = doc.people.find((x) => x.slug === b.dataset.ask); if (p) askAbout(p); }));
  window.__people = { ready: true, count: doc.people.length, view: person ? person.slug : 'index', potw: potwSlug(doc) };
  if (window.FaithMotion) window.FaithMotion.armReveals(root);
  armLiving(root);
}
