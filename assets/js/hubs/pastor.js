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
   book → doors → closing; chips over fabricated interaction).

   BOOK LANDING (2026-11-24): the founder supplied a full devotional
   landing package (mockup + coded build — "This should help"); its
   embed fragment replaces the old two-card From His Pen section below
   and its namespaced CSS is folded into the style above (.goe-page).
   Adaptations per the package README + consult
   chatcmpl-EnvYO8mmThpSewiu0qxjCbnXu5KFs: exact ASIN doors from BOOKS
   (never Amazon search links); his REAL photo in the author lockup
   (the package's JM monogram is forbidden — house law); ONE honest
   ratings line, "Rated 5.0 on Amazon" (his own listing screenshot —
   5.0 stars, 3 reviews per volume; no invented quotes or names);
   gold sheen drift on the hero art + mission-skyline parallax, both
   dead under prefers-reduced-motion; mission link home; free days
   into #/read. No fabricated testimonials — the package's coded page
   omits the mockup's illustrative quotes, and so does this page. */

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
/* ===== GOD OVER EVERYTHING landing (supplied package css/devotional.css,
   folded into pastor.js 2026-11-24; .goe-page namespaced. Dropped: the
   package's header/nav/footer/account rules — the shell owns the chrome.
   Paths rewritten to assets/img/books/. Ops additions: author PHOTO (the
   package's JM monogram is forbidden — house law), the gold sheen drift
   on the hero art, and the mission-skyline parallax var (both consult-
   approved, chatcmpl-EnvYO8mmThpSewiu0qxjCbnXu5KFs; both die under
   prefers-reduced-motion). ===== */
.goe-page{--goe-bg:#080808;--goe-cream:#f7f0e1;--goe-gold:#f0bf4a;--goe-gold-soft:#d0a74b;--goe-gold-dim:#8e682a;--goe-line:rgba(225,171,65,.27);--goe-muted:#c1b9aa;--goe-serif:Georgia,'Times New Roman',serif;--goe-sans:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;--goe-text:#f4eddf;background:#080808;color:var(--goe-text);font-family:var(--goe-sans);font-size:16px;line-height:1.55;isolation:isolate;overflow:hidden;border:1px solid rgba(212,175,55,.28);border-radius:18px}
.goe-page,.goe-page *,.goe-page *::before,.goe-page *::after{box-sizing:border-box}
.goe-page h1,.goe-page h2,.goe-page h3,.goe-page p{margin:0}
.goe-page a{color:inherit;text-decoration:none}
.goe-page button{font:inherit}
.goe-page img{max-width:100%;height:auto;display:block}
.goe-page svg{width:100%;height:100%}
.goe-page ::selection{background:#e3b547;color:#080808}
.goe-page :focus-visible{outline:2px solid #ffd46d;outline-offset:5px}
.goe-page a,.goe-page button{transition:color .2s ease,background-color .2s ease,border-color .2s ease,transform .2s ease,box-shadow .2s ease}
.goe-page a:hover{color:var(--goe-gold)}
.goe-main{position:relative}
.goe-hero{position:relative;overflow:hidden;min-height:635px;background:radial-gradient(ellipse 57% 74% at 85% 50%,rgba(116,69,22,.44),transparent 76%),radial-gradient(ellipse 40% 50% at 45% 90%,rgba(76,42,15,.28),transparent 81%),linear-gradient(118deg,#0b0a08 0%,#100d0a 53%,#16100b 100%)}
.goe-hero::before{content:'';position:absolute;inset:0;opacity:.2;background-image:repeating-linear-gradient(35deg,transparent 0 26px,rgba(232,163,52,.075) 27px,transparent 28px),repeating-linear-gradient(95deg,transparent 0 37px,rgba(255,255,255,.025) 38px,transparent 40px);pointer-events:none}
.goe-hero::after{content:'';position:absolute;inset:auto 0 0;height:150px;background:linear-gradient(transparent,rgba(0,0,0,.62));pointer-events:none}
.goe-hero-grid{position:absolute;right:-115px;top:-250px;width:670px;height:670px;border:1px solid rgba(239,186,69,.1);transform:rotate(24deg);border-radius:48%;box-shadow:0 0 0 140px rgba(226,167,65,.017),0 0 0 300px rgba(226,167,65,.012);pointer-events:none}
.goe-hero-inner{max-width:1390px;margin:0 auto;padding:72px clamp(24px,5vw,76px) 92px;display:grid;grid-template-columns:minmax(0,49%) minmax(0,51%);gap:0;align-items:center;position:relative;z-index:1}
.goe-hero-copy{max-width:600px;position:relative;z-index:3}
.goe-eyebrow{display:inline-flex;align-items:center;gap:11px;border:1px solid rgba(248,192,67,.72);border-radius:100px;padding:8px 16px;font-size:10px;letter-spacing:.29em;text-transform:uppercase;color:#f8d879;font-weight:850;line-height:1.1}
.goe-eyebrow-dot{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--goe-gold);box-shadow:0 0 0 4px rgba(236,177,55,.18)}
.goe-overline{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:750;color:#d6af62;margin-top:30px!important}
.goe-hero h1{font-family:var(--goe-serif);font-weight:700;font-size:clamp(55px,6.2vw,94px);letter-spacing:-.057em;line-height:.98;margin:13px 0 22px;text-wrap:balance;text-shadow:0 3px 28px #0009}
.goe-hero h1 em{font-style:normal;color:var(--goe-cream);white-space:nowrap}
.goe-hero-deck{font-family:var(--goe-serif);font-size:clamp(20px,2.1vw,29px);line-height:1.26;max-width:535px;color:var(--goe-cream)}
.goe-hero-deck span{font-style:italic;color:var(--goe-gold)}
.goe-hero-body{font-size:15.5px;line-height:1.7;color:#c3b9a6;margin-top:17px!important;max-width:440px}
.goe-hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
.goe-btn{display:inline-flex;align-items:center;justify-content:center;gap:15px;min-height:45px;padding:12px 21px;border-radius:100px;text-transform:none;font-size:13px;font-weight:800;letter-spacing:.015em;white-space:nowrap}
.goe-btn span{font-size:17px;font-weight:400;line-height:1}
.goe-btn-gold{background:linear-gradient(135deg,#f8d771 0%,#e4ae33 72%,#c58b22 100%);color:#1a1306!important;box-shadow:0 9px 28px rgba(198,140,25,.18)}
.goe-btn-gold:hover{background:linear-gradient(135deg,#ffe18b,#eec053);transform:translateY(-2px);box-shadow:0 12px 30px rgba(209,158,40,.33);color:#1a1306!important}
.goe-btn-outline{border:1px solid rgba(237,180,61,.67);color:#f5d48d!important;background:rgba(16,12,8,.55)}
.goe-btn-outline:hover{background:rgba(224,163,45,.14)}
.goe-author-lockup{display:flex;align-items:center;gap:15px;margin-top:43px;padding-top:22px;border-top:1px solid var(--goe-line);max-width:390px}
.goe-author-photo{width:55px;height:55px;border-radius:50%;object-fit:cover;object-position:center 22%;border:1px solid rgba(246,193,72,.63);flex:0 0 auto;box-shadow:0 0 25px rgba(209,151,39,.12)}
.goe-author-lockup div{display:flex;flex-direction:column;line-height:1.45}
.goe-author-lockup strong{text-transform:uppercase;font-size:14px;letter-spacing:.11em}
.goe-author-lockup div>span:last-child{color:var(--goe-muted);font-size:11px;margin-top:3px}
.goe-micro-label{font-weight:900;color:var(--goe-gold);font-size:10px!important;letter-spacing:.23em;text-transform:uppercase}
.goe-hero-art{height:500px;position:relative;display:flex;align-items:center;justify-content:center;min-width:0;transform:translate(13px,12px)}
.goe-hero-art img{position:relative;width:min(110%,680px);height:auto;max-width:none;filter:drop-shadow(0 30px 38px rgba(0,0,0,.5));border-radius:3px}
.goe-hero-art::after{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(115deg,transparent 32%,rgba(248,215,121,.13) 47%,rgba(248,215,121,.26) 50%,rgba(248,215,121,.13) 53%,transparent 68%);background-size:260% 100%;background-position:130% 0;mix-blend-mode:screen;animation:goeSheen 9s ease-in-out infinite}
@keyframes goeSheen{0%{background-position:130% 0}55%{background-position:-130% 0}100%{background-position:-130% 0}}
.goe-halo{position:absolute;width:70%;height:65%;background:radial-gradient(circle,rgba(242,182,49,.3),transparent 68%);filter:blur(35px)}
.goe-art-note{position:absolute;bottom:-14px;right:10%;z-index:3;font-family:var(--goe-serif);color:#d0a352;letter-spacing:.12em;font-style:italic;font-size:15px}
.goe-hero-bottomline{position:absolute;bottom:0;left:50%;z-index:2;transform:translateX(-50%);display:flex;justify-content:center;align-items:center;gap:22px;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#b3a080;padding:15px 30px;border-top:1px solid rgba(233,173,65,.22);white-space:nowrap}
.goe-hero-bottomline i{width:3px;height:3px;border-radius:50%;background:var(--goe-gold)}
.goe-section{padding-inline:clamp(24px,5vw,76px)}
.goe-kicker{display:block;text-transform:uppercase;letter-spacing:.31em;font-size:11px;line-height:1.6;color:#e7b744;font-weight:900}
.goe-section-heading h2{margin-top:12px;font-family:var(--goe-serif);font-weight:700;line-height:1.1;letter-spacing:-.036em;font-size:clamp(35px,4vw,58px);color:var(--goe-cream)}
.goe-section-heading h2 em{color:var(--goe-gold);font-style:italic}
.goe-section-heading p{font-size:15px;color:var(--goe-muted);max-width:650px;line-height:1.7;margin-top:14px}
.goe-volume-section{max-width:1440px;margin:0 auto;padding-top:88px;padding-bottom:70px}
.goe-volume-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:23px;margin-top:38px}
.goe-volume-card{border:1px solid rgba(207,161,70,.33);border-radius:18px;min-width:0;overflow:hidden;background:linear-gradient(145deg,#1c160f 0%,#100f0b 68%,#100d08 100%);box-shadow:inset 0 1px rgba(255,219,133,.08),0 20px 65px #0006;display:grid;grid-template-columns:39% 61%;min-height:346px;transition:border-color .2s ease,transform .2s ease}
.goe-volume-card:hover{transform:translateY(-3px);border-color:rgba(242,193,81,.64)}
.goe-volume-cover-bg{position:relative;display:flex;align-items:center;justify-content:center;padding:24px 8px 20px 19px;background:radial-gradient(ellipse at 50% 42%,rgba(176,117,37,.25),transparent 68%);min-width:0;overflow:hidden}
.goe-volume-cover-bg img{height:265px;width:auto;max-width:100%;object-fit:contain;mix-blend-mode:normal;filter:drop-shadow(0 17px 15px #000a)}
.goe-volume-number{position:absolute;bottom:15px;left:20px;color:#a58a55;font-size:10px;letter-spacing:.2em;font-weight:800}
.goe-volume-details{display:flex;flex-direction:column;justify-content:center;padding:32px 28px 30px 13px;min-width:0}
.goe-volume-details h3{font-family:var(--goe-serif);font-size:clamp(26px,2.5vw,39px);font-weight:700;line-height:1.07;letter-spacing:-.04em;margin-top:9px;color:var(--goe-cream)}
.goe-title-dash{color:var(--goe-gold)}
.goe-volume-details p{font-size:13px;color:var(--goe-muted);line-height:1.6;margin:13px 0 19px;max-width:310px}
.goe-book-specs{display:flex;gap:10px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid rgba(215,163,58,.25);font-size:11px;color:#bdad91}
.goe-book-specs span+span::before{content:'·';margin-right:10px;color:#b89d6b}
.goe-book-specs strong{color:#f2e3c0;font-weight:800}
.goe-purchase-row{display:flex;gap:15px;justify-content:space-between;align-items:end;margin-top:20px;flex-wrap:wrap}
.goe-price-label{display:block;font-size:11px;color:#a98e64}
.goe-price{display:block;font-family:var(--goe-serif);color:#fff2d6;font-size:30px;line-height:1.08}
.goe-purchase-button{font-size:12px;min-height:42px;padding:10px 18px}
.goe-rating{margin-top:18px;color:#e7b744;font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.goe-rating .goe-stars{color:var(--goe-gold);letter-spacing:.3em;margin-right:10px}
.goe-source-note{color:#9d927f;font-size:11px;margin-top:8px}
.goe-values-section{border-top:1px solid rgba(222,177,74,.15);border-bottom:1px solid rgba(222,177,74,.15);padding-top:78px;padding-bottom:88px;background:radial-gradient(ellipse 60% 90% at 50% 10%,rgba(70,52,22,.1),transparent 78%),#0b0b0a}
.goe-section-heading-centered{text-align:center;max-width:1050px;margin:0 auto}
.goe-value-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));max-width:1290px;margin:43px auto 0;gap:20px}
.goe-value-card{position:relative;min-height:200px;padding:33px 29px 33px;border:1px solid rgba(206,157,61,.34);border-radius:13px;background:linear-gradient(145deg,rgba(32,25,15,.85),rgba(13,12,9,.9));overflow:hidden}
.goe-value-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(241,186,66,.42),transparent)}
.goe-value-icon{display:inline-flex;width:40px;height:40px;color:var(--goe-gold)}
.goe-value-card h3{margin:18px 0 12px;font-family:var(--goe-serif);font-size:23px;line-height:1.16}
.goe-value-card p{font-size:13px;line-height:1.7;color:var(--goe-muted)}
.goe-free-preview{display:grid;grid-template-columns:200px 1fr auto;align-items:center;gap:27px;max-width:1290px;margin:90px auto;border:1px solid rgba(231,178,69,.58);border-radius:16px;min-height:198px;padding:20px 26px 20px 0;background:linear-gradient(110deg,rgba(52,39,23,.86),rgba(22,19,13,.96) 50%,rgba(42,31,17,.91));box-shadow:0 20px 45px rgba(0,0,0,.25);overflow:hidden}
.goe-preview-art{align-self:stretch;min-height:155px;background-image:linear-gradient(90deg,transparent,rgba(25,20,13,.02)),url('assets/img/books/open-bible.webp');background-position:center;background-size:cover;border-right:1px solid rgba(240,188,74,.48)}
.goe-preview-copy h2{font-family:var(--goe-serif);font-size:clamp(27px,3vw,43px);letter-spacing:-.045em;line-height:1.12;margin:7px 0 8px}
.goe-preview-copy p{max-width:490px;color:var(--goe-muted);font-size:14px;line-height:1.5}
.goe-letter{max-width:990px;margin:0 auto;padding-top:40px;padding-bottom:105px;text-align:center}
.goe-letter-rule{width:80px;height:1px;margin:0 auto 35px;background:linear-gradient(90deg,transparent,#d8ac53,transparent)}
.goe-letter-rule:last-child{margin:36px auto 0}
.goe-letter h2{font-family:var(--goe-serif);font-weight:700;font-size:clamp(33px,3.9vw,53px);letter-spacing:-.05em;line-height:1.15;margin:13px 0 20px}
.goe-letter p{font-family:var(--goe-serif);font-size:clamp(17px,1.8vw,22px);line-height:1.65;color:#cec3b2;font-style:italic;max-width:730px;margin:0 auto}
.goe-letter-signature{display:block;margin-top:24px;letter-spacing:.21em;text-transform:uppercase;color:var(--goe-gold);font-size:10px;font-weight:900}
.goe-mission{min-height:365px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 82% 110%,rgba(217,138,40,.35),transparent 55%),radial-gradient(ellipse at 14% 100%,rgba(176,106,32,.2),transparent 47%),linear-gradient(180deg,#10100e,#19120c)}
.goe-mission::after{content:'';position:absolute;inset:auto 0 -12px;height:190px;background-image:linear-gradient(180deg,#110d0900,#08080870),url('assets/img/books/city-base.webp');background-size:cover;background-repeat:no-repeat;background-position:bottom center;opacity:.8;transform:translateY(var(--goe-parallax,0px))}
.goe-mission-content{position:relative;z-index:2;max-width:750px;margin:0 auto;text-align:center;padding:70px 25px 120px}
.goe-mission h2{font-family:var(--goe-serif);font-size:clamp(36px,4vw,55px);line-height:1.12;letter-spacing:-.04em;margin:12px 0 18px}
.goe-mission h2 em{font-style:italic;color:#e6c16b}
.goe-mission p{max-width:550px;margin:0 auto;font-size:14px;color:#c9bead;line-height:1.7}
.goe-text-link{display:inline-flex;gap:10px;align-items:center;font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:var(--goe-gold)!important;margin-top:20px;border-bottom:1px solid rgba(227,174,66,.6);padding-bottom:5px}
.goe-mission-graffiti{font-family:var(--goe-serif);color:rgba(237,178,66,.18);font-size:clamp(110px,17vw,250px);font-weight:900;line-height:1;position:absolute;left:-24px;bottom:-20px;transform:rotate(-14deg);z-index:1;pointer-events:none}
@media(max-width:1200px){.goe-hero h1{font-size:clamp(54px,5.7vw,76px)}.goe-hero-art{height:450px}.goe-volume-card{grid-template-columns:35% 65%}.goe-volume-details{padding-right:15px}.goe-purchase-row{gap:8px}.goe-purchase-button{padding:10px 14px}}
@media(max-width:960px){.goe-hero-inner{grid-template-columns:51% 49%;padding-inline:24px}.goe-hero-art{transform:translate(8px,20px);height:405px}.goe-hero-art img{width:118%}.goe-hero h1{font-size:clamp(49px,6.4vw,71px)}.goe-volume-grid{grid-template-columns:1fr;max-width:790px;margin-inline:auto}.goe-volume-card{grid-template-columns:34% 66%;min-height:300px}.goe-volume-cover-bg img{height:245px}.goe-value-grid{gap:12px}.goe-value-card{padding:24px 20px}.goe-free-preview{grid-template-columns:150px 1fr;gap:20px;padding:0 25px 0 0}.goe-free-preview .goe-btn{grid-column:2;justify-self:start;margin-bottom:21px}.goe-preview-art{grid-row:1 / span 2;min-height:220px}.goe-preview-copy{padding-top:20px}}
@media(max-width:700px){.goe-hero{min-height:auto}.goe-hero-inner{display:flex;flex-direction:column;align-items:stretch;padding:44px 22px 86px}.goe-hero-copy{max-width:560px;margin:0 auto}.goe-overline{margin-top:23px!important}.goe-hero h1{font-size:clamp(55px,12vw,80px);margin:13px 0 18px}.goe-hero-deck{font-size:23px}.goe-hero-body{font-size:14px}.goe-hero-ctas{margin-top:23px}.goe-hero-art{height:auto;transform:none;max-width:570px;align-self:center;width:100%;margin-top:24px}.goe-hero-art img{max-width:100%;width:100%}.goe-art-note{bottom:1px;right:8px;font-size:12px}.goe-author-lockup{margin-top:25px}.goe-hero-bottomline{font-size:9px;gap:12px;padding:13px 15px}.goe-volume-section{padding-top:66px;padding-bottom:50px}.goe-section-heading h2{font-size:clamp(34px,8vw,47px)}.goe-volume-grid{gap:18px;margin-top:30px}.goe-volume-card{display:flex;flex-direction:column}.goe-volume-cover-bg{height:250px;padding:11px}.goe-volume-cover-bg img{height:230px}.goe-volume-details{padding:24px 25px 28px}.goe-volume-details h3{font-size:34px}.goe-volume-details p{margin:10px 0 14px}.goe-purchase-row{gap:15px}.goe-values-section{padding-top:64px;padding-bottom:65px}.goe-value-grid{grid-template-columns:1fr;max-width:540px;gap:14px}.goe-value-card{min-height:0;padding:24px}.goe-value-card h3{margin:10px 0}.goe-free-preview{grid-template-columns:1fr;gap:0;margin:60px 24px;padding:0 23px 24px;max-width:none}.goe-preview-art{height:175px;min-height:0;grid-row:auto;margin:0 -23px;border-right:0;border-bottom:1px solid rgba(236,183,72,.4)}.goe-preview-copy{padding-top:24px}.goe-free-preview .goe-btn{grid-column:auto;justify-self:start;margin:20px 0 0}.goe-letter{padding:28px 23px 66px}.goe-mission-content{padding:60px 23px 120px}}
@media(max-width:390px){.goe-hero h1{font-size:52px}.goe-btn{padding:11px 16px;font-size:12px}.goe-author-lockup strong{font-size:12px}.goe-hero-bottomline{font-size:8px;gap:10px}.goe-volume-details h3{font-size:30px}.goe-purchase-row{align-items:center}}
@media(prefers-reduced-motion:reduce){.goe-page a,.goe-page button,.goe-volume-card{transition:none!important}.goe-volume-card:hover,.goe-btn:hover{transform:none!important}.goe-hero-art::after{animation:none!important}}
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

        <section class="pst-sec reveal" id="pastor-book">
      <div class="goe-page goe-embedded">
      <div class="goe-main" id="goe-main">
      <section aria-labelledby="goe-title" class="goe-hero">
      <div class="goe-hero-grid"></div>
      <div class="goe-hero-inner">
      <div class="goe-hero-copy">
      <div class="goe-eyebrow"><span class="goe-eyebrow-dot"></span> 16:3 Faith devotional</div>
      <p class="goe-overline">From his pen. For your walk.</p>
      <h1 id="goe-title">God Over<br/><em>Everything.</em></h1>
      <p class="goe-hero-deck">A <span>365-day devotional</span> for real life, real questions, and a faith that keeps growing.</p>
      <p class="goe-hero-body">Walk with God day by day through Scripture, honest reflection, and encouragement that meets you wherever you are.</p>
      <div class="goe-hero-ctas">
      <a class="goe-btn goe-btn-gold" href="#goe-volumes" data-goe-scroll="goe-volumes">Explore the books <span aria-hidden="true">↗</span></a>
      <a class="goe-btn goe-btn-outline" href="#/read">Read days 1–5 free <span aria-hidden="true">→</span></a>
      </div>
      <div class="goe-author-lockup">
      <img class="goe-author-photo" src="assets/img/home/pastor.webp" alt="Pastor Jeremy “Chico” Mills" width="55" height="55"/>
      <div><span class="goe-micro-label">Written by</span><strong>Jeremy “Chico” Mills</strong><span>Pastor · Writer · Founder of 16:3 Faith</span></div>
      </div>
      </div>
      <div aria-label="God Over Everything Volume One and Volume Two paperbacks" class="goe-hero-art">
      <div aria-hidden="true" class="goe-halo"></div>
      <img alt="Two black-and-gold God Over Everything devotional books, Volume One and Volume Two" fetchpriority="high" height="437" src="assets/img/books/hero-books.webp" width="557"/>
      <span aria-hidden="true" class="goe-art-note">A year of putting God first.</span>
      </div>
      </div>
      <div aria-hidden="true" class="goe-hero-bottomline"><span>365 days</span><i></i><span>2 volumes</span><i></i><span>1 daily walk</span></div>
      </section>
      <section aria-labelledby="goe-volumes-title" class="goe-volume-section goe-section" id="goe-volumes">
      <div class="goe-section-heading">
      <span class="goe-kicker">The devotional collection</span>
      <h2 id="goe-volumes-title">Two volumes. <em>One commitment.</em></h2>
      <p>The entire year, thoughtfully divided into two paperback volumes. Begin in January or pick up where you are.</p>
      </div>
      <div class="goe-volume-grid">
      <article class="goe-volume-card">
      <div class="goe-volume-cover-bg"><img alt="God Over Everything, Volume One: January through June paperback cover" height="396" loading="lazy" src="assets/img/books/volume-one.webp" width="267"/><span class="goe-volume-number">01 / 02</span></div>
      <div class="goe-volume-details">
      <span class="goe-kicker">Volume one</span>
      <h3>January <span class="goe-title-dash">—</span> June</h3>
      <p>Start the year grounded in faith, one day at a time.</p>
      <div class="goe-book-specs"><span><strong>Days 1–181</strong> of 365</span><span><strong>559</strong> pages</span><span><strong>6 × 9</strong> paperback</span></div>
      <div class="goe-purchase-row"><div><span class="goe-price-label">Paperback</span><strong class="goe-price">$19.99</strong></div><a aria-label="Get God Over Everything Volume One by Jeremy Mills on Amazon" class="goe-btn goe-btn-gold goe-purchase-button" href="${BOOKS[0].url}" rel="noopener noreferrer" target="_blank">Get it on Amazon <span aria-hidden="true">↗</span></a></div>
      </div>
      </article>
      <article class="goe-volume-card">
      <div class="goe-volume-cover-bg"><img alt="God Over Everything, Volume Two: July through December paperback cover" height="367" loading="lazy" src="assets/img/books/volume-two.webp" width="260"/><span class="goe-volume-number">02 / 02</span></div>
      <div class="goe-volume-details">
      <span class="goe-kicker">Volume two</span>
      <h3>July <span class="goe-title-dash">—</span> December</h3>
      <p>Keep walking. Keep learning. Keep putting God over everything.</p>
      <div class="goe-book-specs"><span><strong>Days 182–365</strong></span><span><strong>568</strong> pages</span><span><strong>6 × 9</strong> paperback</span></div>
      <div class="goe-purchase-row"><div><span class="goe-price-label">Paperback</span><strong class="goe-price">$19.99</strong></div><a aria-label="Get God Over Everything Volume Two by Jeremy Mills on Amazon" class="goe-btn goe-btn-gold goe-purchase-button" href="${BOOKS[1].url}" rel="noopener noreferrer" target="_blank">Get it on Amazon <span aria-hidden="true">↗</span></a></div>
      </div>
      </article>
      </div>
      <p class="goe-rating"><span class="goe-stars" aria-hidden="true">★★★★★</span>Rated 5.0 on Amazon</p>
      <p class="goe-source-note">Books are sold on Amazon — each button above opens that volume's own Amazon page.</p>
      </section>
      <section aria-labelledby="goe-values-title" class="goe-values-section goe-section">
      <div class="goe-section-heading goe-section-heading-centered">
      <span class="goe-kicker">Why this devotional?</span>
      <h2 id="goe-values-title">More than a book. <em>A daily walk with God.</em></h2>
      </div>
      <div class="goe-value-grid">
      <article class="goe-value-card">
      <span aria-hidden="true" class="goe-value-icon"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 24 24"><path d="M12 7c-2-2-5-2.6-9-2v14c3.8-.6 7 .1 9 2 2-1.9 5.2-2.6 9-2V5c-4-.6-7 0-9 2Z"></path><path d="M12 7v14"></path></svg></span>
      <h3>Scripture at the center.</h3>
      <p>Thoughtful reflections that bring faith into the conversations and choices of everyday life.</p>
      </article>
      <article class="goe-value-card">
      <span aria-hidden="true" class="goe-value-icon"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 24 24"><path d="M2 12h4l3-7 5 14 3-7h5"></path></svg></span>
      <h3>Honest words for real life.</h3>
      <p>Room for hard days, hope, questions, healing, and the kind of growth that takes time.</p>
      </article>
      <article class="goe-value-card">
      <span aria-hidden="true" class="goe-value-icon"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewbox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="5"></rect><path d="M7 2v6M17 2v6M3 10h18"></path></svg></span>
      <h3>A full-year invitation.</h3>
      <p>365 days to return to what matters, take one more step, and keep your eyes on God.</p>
      </article>
      </div>
      </section>
      <section aria-labelledby="goe-free-title" class="goe-free-preview goe-section">
      <div aria-label="An open Bible illuminated by warm light" class="goe-preview-art" role="img"></div>
      <div class="goe-preview-copy"><span class="goe-kicker">Start here · no purchase needed</span><h2 id="goe-free-title">Read before you buy.</h2><p>New to the devotional? Start with the first five days, available free in the 16:3 Faith Read hub.</p></div>
      <a class="goe-btn goe-btn-gold" href="#/read">Read days 1–5 free <span aria-hidden="true">↗</span></a>
      </section>
      <section aria-labelledby="goe-letter-title" class="goe-letter goe-section">
      <div class="goe-letter-rule"></div>
      <span class="goe-kicker">A note from the pastor</span>
      <h2 id="goe-letter-title">Faith isn't just for the easy days.</h2>
      <p>You can open these pages in a season of joy or a season of questions. The invitation is the same: make space for God, bring your whole heart, and keep walking.</p>
      <span class="goe-letter-signature">— 16:3 Faith</span>
      <div class="goe-letter-rule"></div>
      </section>
      <section aria-labelledby="goe-mission-title" class="goe-mission">
      <div class="goe-mission-content"><span class="goe-kicker">The 16:3 Faith mission</span><h2 id="goe-mission-title">Commit the work.<br/><em>Let God establish it.</em></h2><p>This devotional is part of a larger mission to help people know God, grow in His Word, and walk it out in real life.</p><a class="goe-text-link" href="#/home">More about the ministry <span aria-hidden="true">↗</span></a></div>
      <span aria-hidden="true" class="goe-mission-graffiti">16:3</span>
      </section>
      </div>
      </div>
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
  view.querySelectorAll('[data-ask]').forEach((b) => b.addEventListener('click', () => {
    askPastor(b.dataset.ask);
    if (b.dataset.ask === 'devotional') { const t = document.getElementById('pastor-book'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));
  /* Book landing wiring: "Explore the books" scrolls in-page (a bare
     #goe-volumes href would be eaten by the hash router), and the
     mission skyline parallaxes through the --goe-parallax var —
     rAF-throttled, capture-phase so any scroller drives it,
     self-cleaning when the page unmounts, never installed under
     prefers-reduced-motion (the sheen dies in CSS the same way). */
  view.querySelectorAll('[data-goe-scroll]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); const t = document.getElementById(a.dataset.goeScroll); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const mission = view.querySelector('.goe-mission');
  if (mission && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (window.__pastorParallax) window.removeEventListener('scroll', window.__pastorParallax, true);
    let ticking = false;
    const onScroll = () => {
      if (!document.body.contains(mission)) { window.removeEventListener('scroll', onScroll, true); if (window.__pastorParallax === onScroll) window.__pastorParallax = null; return; }
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { ticking = false; const r = mission.getBoundingClientRect(); const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2))); mission.style.setProperty('--goe-parallax', (p * 14).toFixed(1) + 'px'); });
    };
    window.__pastorParallax = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();
  }
  window.__pastor = { ready: true };
  if (window.FaithMotion) window.FaithMotion.armReveals(root);
}
