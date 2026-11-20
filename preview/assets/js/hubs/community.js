/* COMMUNITY hub — FAITHBOOK (v3, design graft 2026-11-19).
   The founder's ruling: COMMUNITY = Faithbook — Facebook's blueprint in the
   16:3 feel. The VISUAL + INTERACTION layer is ChatGPT's Faithbook design
   package (design-sources/faithbook-chatgpt-package/ — 3-column rails,
   cassette hero, story cards, typed composer, Amen/Pray actions), grafted
   onto this hub's real-data wiring. NONE of the package's sample data ships:
   the feed is the family's real posts, the directory real members, the
   groups the real live list. Package fixtures (sample posts/people/groups,
   localStorage demo state, demo messaging, its own header/mobile nav) were
   rejected — the shell's nav and player govern.
   DATA: live-first from the community API (Railway home — the only API base
   whose CORS allowlist serves this origin; same production DB as Render),
   baked capture as the labeled fallback. Writes stay honestly gated until
   member sign-in (F-CLERK) joins the preview: the backend's member routes
   are live and answer "Please sign in" to guests (verified 2026-11-19). */

const API_BASE = 'https://faith-hub-api-railway-production.up.railway.app';
const DATA = 'assets/data/community/';
const PAGE = 10;
const HOUSE_ID = 'official_163faith';

const CSS = `
#hub-root:has(> .bk){max-width:1460px}
.bk{--gold:#f3c34b;--gold2:#b48a26;--cream:#f8f4e7;--mut:#a6a097;--dim:#8a8474;--red:#ec5042;--surf:#151514;--surf2:#1d1c19;--line:#37322a;color:var(--cream);font-size:15px}
.bk *{box-sizing:border-box}
.bk h1,.bk h2,.bk h3{margin:0}
.bk button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.bk .impact{font-family:Impact,"Arial Black",Arial,sans-serif;font-weight:900;letter-spacing:.4px}
.bk .serif{font-family:Georgia,serif}
.bk .eyebrow{font-size:10px;letter-spacing:2.1px;color:var(--gold);font-weight:900}
.bk .panel{background:var(--surf);border:1px solid #39342c;border-radius:12px}
.bk-shell{display:grid;grid-template-columns:228px minmax(0,1fr) 272px;gap:24px;align-items:start;justify-content:center}
.bk-main{min-width:0;max-width:730px;width:100%;margin:0 auto}
.bk-rail{position:sticky;top:14px;min-width:0}
.bk-side{position:sticky;top:14px;min-width:0}
/* ---------- left rail ---------- */
.bk-idcard{padding:16px}
.bk-idhead{display:flex;gap:10px;align-items:center}
.bk-idhead strong{display:block;font-size:14px;margin:3px 0 2px}
.bk-idhead small{display:block;font-size:10px;color:#948c7f;line-height:1.5}
.bk-countline{margin-top:13px;border-top:1px solid #302c25;padding-top:11px;font-size:10.5px;line-height:1.9;color:#cbbd97;letter-spacing:.4px}
.bk-countline b{color:var(--gold)}
.bk-railgroup{margin:26px 0 6px}
.bk-railt{font-size:10px;color:#8b8476;letter-spacing:2.2px;font-weight:900;margin:0 0 10px 11px}
.bk-rlink{display:flex;align-items:center;width:100%;gap:12px;padding:12px 11px;border-left:2px solid transparent;border-radius:5px;color:#bdb6aa;text-align:left;font-size:13px;font-weight:800}
.bk-rlink .g{font-size:19px;width:18px;display:inline-flex;justify-content:center;color:#bca875}
.bk-rlink:hover{background:#1c1914;color:#fff}
.bk-rlink.on{background:linear-gradient(90deg,#443112,#201b13 90%);border-left-color:var(--gold);color:var(--gold)}
.bk-rlink i{margin-left:auto;font-style:normal;font-size:9px;color:#d6aa4b}
.bk-rlink em{margin-left:auto;font-size:8px;font-style:normal;color:#9b8252;border:1px solid #53452d;padding:2px 4px;border-radius:3px;letter-spacing:.6px}
.bk-circle{display:flex;gap:10px;align-items:center;width:100%;padding:8px 7px;text-align:left;font-size:12px;color:#c9c3b8;font-weight:700;border-radius:6px}
.bk-circle:hover{color:var(--gold)}
.bk-gcover{width:29px;height:29px;border-radius:7px;display:grid;place-items:center;font-weight:900;color:#f6dda1;background:linear-gradient(135deg,#6b4c21,#2c1b13);font-family:Georgia,serif;flex:none}
.bk-quote{padding:16px 18px;border-top:1px solid #423b2c;border-bottom:1px solid #423b2c;margin-top:28px}
.bk-quote .sc{font-size:52px;color:#685124;line-height:.6;font-family:Georgia,serif}
.bk-quote p{font-size:13px;font-family:Georgia,serif;font-weight:bold;line-height:1.6;color:#eee1c4;margin:8px 0}
.bk-quote span{font-size:9px;letter-spacing:1.5px;color:var(--gold);font-weight:900}
.bk-railbot{padding:16px 10px;font-size:9px;line-height:1.8;color:#756f66;letter-spacing:1.2px;font-weight:800}
/* ---------- hero ---------- */
.bk-hero{min-height:250px;position:relative;overflow:hidden;background:linear-gradient(110deg,#25180b,#15100b 48%,#1c1914);border:1px solid #78602c;border-radius:12px;box-shadow:0 15px 45px rgba(0,0,0,.5)}
.bk-hero:before{content:"";position:absolute;left:-55px;bottom:-54px;width:280px;height:220px;border:1px solid #8b6027;border-radius:50%;transform:rotate(-25deg);opacity:.27}
.bk-hero:after{content:"";position:absolute;top:-60px;right:15%;width:210px;height:210px;background:radial-gradient(circle,rgba(217,160,48,.2),transparent 70%);pointer-events:none}
.bk-herographics{position:absolute;inset:0 0 0 34%;pointer-events:none}
.bk-herographics img{position:absolute;right:-12px;top:-14px;width:94%;height:108%;object-fit:contain;filter:drop-shadow(0 20px 25px rgba(0,0,0,.5))}
.bk-herogrid{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(171,123,29,.07) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(171,123,29,.07) 25px);transform:rotate(-12deg)}
.bk-herotape{position:absolute;top:20px;right:26px;font-size:9px;font-weight:900;letter-spacing:2px;color:#ddbe76;transform:rotate(8deg)}
.bk-heroc{position:relative;z-index:1;padding:28px 26px;max-width:440px}
.bk-heroeb{display:flex;gap:8px;align-items:center;letter-spacing:2px;font-size:10px;font-weight:900;color:#edc870}
.bk-heroeb b{color:#b6402d}.bk-sq{width:7px;height:7px;background:var(--gold);transform:rotate(45deg);flex:none}
.bk-heroc h1{font-family:Impact,"Arial Black",sans-serif;font-weight:900;font-size:clamp(42px,4.6vw,60px);line-height:.95;letter-spacing:-.5px;margin:18px 0 14px;text-shadow:2px 3px 0 rgba(0,0,0,.5);color:var(--cream)}
.bk-heroc h1 span{color:var(--gold)}
.bk-heroc p{line-height:1.5;font-size:13px;color:#e7d8b3;margin:0}
.bk-herobot{display:flex;align-items:center;gap:11px;margin-top:20px}
.bk button.bk-redbtn{border:0;border-radius:5px;background:#e74e3b;color:#fff;padding:12px 14px;font-size:11px;font-weight:900;letter-spacing:.5px;box-shadow:3px 3px 0 #772a20;cursor:pointer}
.bk button.bk-redbtn:hover{background:#ff5a47}
.bk-herobot>span{font-size:9px;max-width:130px;line-height:1.6;color:#bbab8c;font-weight:800;letter-spacing:.6px}
.bk-herostamp{position:absolute;right:16px;bottom:16px;border:1px solid #8f762c;border-radius:3px;padding:7px 9px;font-size:9px;color:#f6d16d;transform:rotate(-6deg);font-weight:900;letter-spacing:1px;z-index:1}
.bk-secline{display:flex;justify-content:space-between;margin:14px 2px 24px;font-size:9px;letter-spacing:2px;color:#8a826e;font-weight:900}
.bk-secline span:last-child{color:#ac8750}
`;

const CSS2 = `
/* ---------- stories ---------- */
.bk-sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.bk-sechead h2{font-family:Georgia,serif;font-size:27px;letter-spacing:-.8px;margin:6px 0 16px}
.bk-sechead h2 em,.bk-feedhead h2 em{color:var(--gold);font-style:normal}
.bk-alltest{display:flex;align-items:center;gap:4px;font-size:10px;letter-spacing:1px;color:#c8b27b;font-weight:900;margin-bottom:16px;cursor:pointer}
.bk-stories{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.bk .bk-story{height:150px;min-width:0;padding:13px;border-radius:11px;border:1px solid #514530;overflow:hidden;position:relative;text-align:left;display:flex;flex-direction:column;background:#161512;cursor:pointer;transition:transform .15s ease,border-color .15s;width:100%}
.bk .bk-story:hover{transform:translateY(-3px);border-color:var(--gold)}
.bk-story:before{content:"";position:absolute;top:16px;right:-22px;width:88px;height:88px;border:1px solid rgba(225,194,117,.29);border-radius:50%;box-shadow:0 0 0 14px rgba(244,212,139,.07),0 0 0 28px rgba(255,220,141,.03);pointer-events:none}
.bk-story-start{background:linear-gradient(150deg,#242018,#131313)}
.bk-story-prayer{background:radial-gradient(circle at 85% 12%,#73521d 0,transparent 48%),linear-gradient(143deg,#3d2a17,#171412)}
.bk-story-test{background:radial-gradient(circle at 80% 12%,#6d2b21 0,transparent 48%),linear-gradient(143deg,#3c1e19,#1a1112)}
.bk-story-comm{background:radial-gradient(circle at 85% 12%,#4e6046 0,transparent 48%),linear-gradient(143deg,#273326,#131712)}
.bk-story-plus{display:grid;place-items:center;width:38px;height:38px;background:var(--gold);color:#251a0b;border-radius:50%;margin-bottom:auto;font-size:22px;font-weight:900;line-height:1}
.bk-story-mono{color:#ffd471;font-size:31px;margin-bottom:auto;line-height:1}
.bk-story-start strong{font-family:Impact,"Arial Black",sans-serif;font-size:22px;letter-spacing:.5px;color:var(--cream)}
.bk-story small{color:#c3a158;letter-spacing:1.6px;font-size:9px;margin-top:3px;font-weight:900}
.bk-story-label{font-family:Impact,"Arial Black",sans-serif;font-weight:900;font-size:20px;line-height:.95;color:#fff2ce;letter-spacing:.5px}
.bk-story-foot{font-size:8px;letter-spacing:1px;margin-top:10px;color:#f5d77f;font-weight:900;display:flex;justify-content:space-between}
/* ---------- composer ---------- */
.bk-composer{margin-top:20px;padding:16px 17px 10px}
.bk-comp-main{display:flex;align-items:center;gap:12px}
.bk-ava{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;flex:none;border:2px solid #292920;background:#343022;color:#ffe3a7;font-size:12px;font-weight:900;letter-spacing:-.5px;overflow:hidden;text-align:center}
.bk-ava img{width:100%;height:100%;object-fit:cover}
.bk-ava.you{background:linear-gradient(145deg,#4b3810,#1e1911);border-color:#9a762c;color:#ffdf86;font-size:10px}
.bk-ava.house{background:linear-gradient(145deg,#342300,#030303);color:var(--gold);font-family:Georgia,serif;font-size:15px}
.bk .bk-comp-pill{height:45px;flex:1;border:1px solid #454038;text-align:left;border-radius:25px;padding:0 20px;background:#211f1c;color:#b6b0a4;font-size:13px;cursor:pointer;min-width:0}
.bk .bk-comp-pill:hover{border-color:var(--gold)}
.bk-comp-tools{border-top:1px solid #302e28;margin-top:15px;padding-top:10px;display:flex;justify-content:space-between;align-items:center;gap:6px}
.bk-comp-tools>span{font-size:9px;font-weight:900;color:#787266;letter-spacing:1px}
.bk-comp-tools>div{display:flex;gap:4px}
.bk-comp-tools button{padding:6px 7px;color:#c3b99e;font-size:11px;font-weight:900;display:flex;align-items:center;gap:5px;border-radius:6px;cursor:pointer}
.bk-comp-tools button:hover{color:var(--gold)}
.bk-comp-tools button.sel{color:#ffd56d;background:#33270f;box-shadow:inset 0 0 0 1px #8a6a24}
.bk-gate{display:none;margin-top:12px;border:1px solid #55482b;border-radius:9px;padding:13px 15px;background:#1c1912;font-size:13px;line-height:1.6;color:#e7dcc0}
.bk-gate.open{display:block}
.bk-gate b{color:var(--gold)}
.bk-gate .row{display:flex;gap:9px;flex-wrap:wrap;margin-top:10px}
.bk-gbtn{border:1px solid #765921;background:transparent;border-radius:5px;padding:9px 13px;color:var(--gold);font-size:10px;font-weight:900;letter-spacing:.5px;cursor:pointer}
.bk-gbtn:hover{background:#312411}
/* ---------- feed ---------- */
.bk-feedsec{margin-top:28px}
.bk-feedhead{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}
.bk-feedhead h2{font-family:Georgia,serif;font-size:27px;letter-spacing:-.8px;margin:6px 0 0}
.bk-feedtruth{font-size:9px;letter-spacing:1.5px;color:#9b907a;padding-bottom:5px}
.bk-note{font-size:12px;color:var(--dim);line-height:1.6;margin:0 0 12px}
.bk-filters{display:flex;align-items:center;gap:5px;border-bottom:1px solid #3b3528;margin-bottom:18px;overflow-x:auto;white-space:nowrap}
.bk-filters button{background:transparent;border:0;border-bottom:3px solid transparent;color:#a89d8a;padding:13px 13px 10px;font-size:10px;font-weight:900;letter-spacing:1.1px;cursor:pointer}
.bk-filters button.on{color:var(--gold);border-bottom-color:var(--gold)}
.bk-card{background:#141414;border:1px solid #39352f;border-radius:12px;overflow:hidden;margin:0 0 15px;box-shadow:0 15px 30px rgba(0,0,0,.15)}
.bk-card.testimony{border-color:#6d551f;background:linear-gradient(180deg,#171410,#131109)}
.bk-postbody{padding:17px 19px 4px}
.bk-posthead{display:flex;gap:11px;align-items:center}
.bk-posthead .bk-ava{cursor:pointer}
.bk-pid{min-width:0;flex:1}
.bk-pid b{font-size:13.5px;display:block;color:var(--cream);cursor:pointer}
.bk-pid small{display:block;color:#958e81;font-size:10.5px;margin-top:4px}
.bk-ver{color:var(--gold);font-size:10px}
.bk-tag{border:1px solid #55482b;border-radius:30px;padding:5px 9px;color:#e5c274;font-size:9px;letter-spacing:.8px;font-weight:900;white-space:nowrap}
.bk-tag.test{color:#ffd76a;border-color:#8a6a24}
.bk-tag.pin{color:#f0a49c;border-color:#7c3a32}
.bk-posttext{font-size:14px;line-height:1.72;color:#e2dcd0;margin:15px 0 14px;white-space:pre-wrap;overflow-wrap:anywhere}
.bk-posttext a{color:var(--gold)}
.bk-seemore{color:var(--gold);font-size:12px;font-weight:900;cursor:pointer;padding:0}
.bk-postimg{display:block;width:100%;max-height:320px;object-fit:cover;border-block:1px solid #3b3429;background:#201a13}
.bk-postmeta{padding:11px 18px;color:#938b7e;display:flex;justify-content:space-between;align-items:center;font-size:11px;gap:10px;flex-wrap:wrap}
.bk-postmeta .amen{color:#d7b66d}
.bk-actions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));padding:5px 10px 9px;border-top:1px solid #302c26;gap:3px}
.bk-act{padding:10px 0;background:transparent;color:#b7b0a4;font-size:10.5px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:7px;cursor:pointer;letter-spacing:.4px}
.bk-act:hover{background:#221f18;color:#e8c675}
.bk-act .ic{font-size:15px;line-height:1}
.bk-comments{display:none;padding:10px 17px 15px;border-top:1px solid #2b2822}
.bk-comments.open{display:block}
.bk-cline{display:flex;gap:8px;margin:7px 0 10px}
.bk-cline .bk-ava{width:31px;height:31px;font-size:9px}
.bk-bubble{background:#23211c;border-radius:9px;padding:9px 11px;flex:1;min-width:0}
.bk-bubble b{font-size:11px;color:var(--cream)}
.bk-bubble span{font-size:10px;color:#8d8676;margin-left:7px}
.bk-bubble p{margin:5px 0 0;color:#e1d5c0;font-size:12.5px;line-height:1.55;overflow-wrap:anywhere;white-space:pre-wrap}
.bk-cnote{font-size:12px;color:#a99f88;line-height:1.6;border:1px dashed #4c4433;border-radius:8px;padding:10px 12px}
.bk-loadmore{display:block;margin:4px auto 0;border:1px solid #765921;background:transparent;border-radius:5px;padding:12px 22px;color:var(--gold);font-size:11px;font-weight:900;letter-spacing:.6px;cursor:pointer}
.bk-loadmore:hover{background:#312411}
.bk-endfeed{text-align:center;color:#d5b775;padding:22px 10px 8px}
.bk-endfeed span{font-size:23px;display:block}
.bk-endfeed strong{display:block;font-size:12px;letter-spacing:1px;margin-top:8px}
.bk-endfeed small{font-size:11px;color:#8b877e;display:block;margin-top:6px}
`;

const CSS3 = `
/* ---------- right rail ---------- */
.bk-sidelabel{font-size:9px;letter-spacing:2px;font-weight:900;color:#c7b388;display:flex;align-items:center;gap:8px;margin:4px 0 12px}
.bk-reddot{width:8px;height:8px;background:#ef5748;border-radius:50%;box-shadow:0 0 0 4px #3c1e18}
.bk-tape{padding:17px;position:relative;overflow:hidden;background:linear-gradient(157deg,#222018,#131313 54%,#241b11)}
.bk-tape .small{display:flex;justify-content:space-between;font-size:9px;color:#b1a17d;font-weight:900;letter-spacing:1.1px}
.bk-tape .small span{color:var(--gold)}
.bk-tape h3{font-family:Impact,"Arial Black",sans-serif;font-weight:900;font-size:34px;line-height:.98;letter-spacing:.5px;margin:18px 0 0;color:var(--cream)}
.bk-tape h3 em{color:var(--gold);font-style:normal}
.bk-disc{height:158px;display:flex;align-items:center;justify-content:center;position:relative;margin:2px 0 -2px}
.bk-disc:before{content:"";height:156px;width:156px;border-radius:50%;background:repeating-radial-gradient(circle,#111 0,#111 3px,#333 4px,#0b0b0b 6px);position:absolute;box-shadow:0 12px 20px rgba(0,0,0,.6)}
.bk-dring{height:82px;width:82px;border-radius:50%;background:#e5b940;display:grid;place-items:center;position:relative;z-index:1;border:7px solid #d1a637;box-shadow:inset 0 0 0 5px #32291d;font-family:Georgia,serif;font-weight:900;font-size:25px;color:#20160b}
.bk-track{display:flex;gap:9px;align-items:center;padding:10px 0;border-bottom:1px solid #3b3426;width:100%;text-align:left;cursor:pointer;background:none;border-top:0;border-left:0;border-right:0;color:var(--cream)}
.bk-track:hover strong{color:var(--gold)}
.bk-track .no{font-size:12px;font-family:Georgia,serif;color:var(--gold)}
.bk-track .tt{flex:1;min-width:0}
.bk-track strong{display:block;font-size:10.5px;letter-spacing:.4px}
.bk-track small{display:block;font-size:10px;color:#948a75;margin-top:3px}
.bk-track .wv{font-size:11px;color:var(--gold)}
.bk-goldbtn{border:1px solid #765921;background:transparent;border-radius:5px;width:100%;padding:11px;margin-top:14px;color:var(--gold);font-size:10px;font-weight:900;letter-spacing:.5px;cursor:pointer}
.bk-goldbtn:hover{background:#312411}
.bk-sidecard{margin-top:14px;padding:17px}
.bk-sidecard .phead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bk-sidecard .phead .x{color:var(--gold);font-size:21px}
.bk-praypanel{background:radial-gradient(ellipse at 95% 5%,#48321a,#161515 55%)}
.bk-praypanel h3{font-family:Impact,"Arial Black",sans-serif;font-weight:900;font-size:29px;line-height:.99;letter-spacing:.3px;margin:15px 0 8px;color:var(--cream)}
.bk-praypanel p{color:#bdb3a3;line-height:1.6;font-size:12px;margin:0}
.bk-mini{display:flex;align-items:center;gap:9px;padding:10px 0;border-bottom:1px solid #353027;width:100%;text-align:left;cursor:pointer;background:none;border-top:0;border-left:0;border-right:0;color:var(--cream)}
.bk-mini .bk-gcover{width:36px;height:36px}
.bk-mini .mi{flex:1;min-width:0}
.bk-mini strong{display:block;font-size:11.5px}
.bk-mini small{display:block;font-size:10px;color:#8f8575;margin-top:4px}
.bk-mini .plus{border:1px solid #584c30;border-radius:50%;height:25px;width:25px;display:grid;place-items:center;font-size:16px;color:var(--gold);flex:none}
.bk-textlink{font-size:10px;color:#e6be66;font-weight:900;padding:15px 0 2px;letter-spacing:.5px;cursor:pointer}
.bk-code{border-color:#544222}
.bk-code p{font-size:12px;line-height:1.7;color:#d0c4ac;margin:10px 0 0}
.bk-code p b{color:var(--gold)}
.bk-sidefoot{padding:16px 9px;line-height:1.8;color:#716b62;font-size:9px;letter-spacing:.5px}
/* ---------- doors ---------- */
.bk-doorhero{display:flex;gap:16px;align-items:center;background:linear-gradient(110deg,#25180b,#141414 60%);border:1px solid #78602c;border-radius:12px;padding:20px 22px;position:relative;overflow:hidden}
.bk-doorhero img{width:118px;height:auto;flex:none;filter:drop-shadow(0 10px 14px rgba(0,0,0,.5))}
.bk-doorhero h1{font-family:Georgia,serif;font-size:30px;line-height:1.12;color:var(--cream)}
.bk-doorhero h1 em{color:var(--gold);font-style:normal}
.bk-doorhero p{color:#cbbfa4;font-size:13px;line-height:1.6;margin:8px 0 0;max-width:520px}
.bk-doors{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.bk .bk-door{position:relative;border:1px solid #514530;border-radius:12px;overflow:hidden;min-height:158px;text-align:left;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;background:#161512;width:100%}
.bk .bk-door:hover{border-color:var(--gold)}
.bk-door .art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.34}
.bk-door .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,9,6,.15),rgba(10,9,6,.88) 78%)}
.bk-door .in{position:relative;z-index:1}
.bk-door .no{font-size:10px;letter-spacing:2px;color:var(--gold);font-weight:900}
.bk-door h3{font-family:Georgia,serif;font-size:22px;margin:6px 0 5px;color:var(--cream)}
.bk-door p{font-size:12px;color:#cfc4a8;line-height:1.55;margin:0}
.bk-door .cnt{margin-top:9px;font-size:10px;letter-spacing:1.2px;color:#f5d77f;font-weight:900}
.bk-door.gated{cursor:pointer}
/* ---------- context panels / members / groups / profile ---------- */
.bk-ctx{background:#191814;border:1px solid #4a3d24;border-radius:10px;padding:20px;margin:0 0 18px}
.bk-ctx h3{font-family:Georgia,serif;font-size:22px;margin:0 0 9px;color:#f7e7c5}
.bk-ctx p{color:#bcb19b;font-size:13px;line-height:1.65;margin:0 0 8px}
.bk-ctx p b{color:var(--gold)}
.bk-back{color:#e4bc64;font-size:12px;font-weight:900;padding:0 0 14px;cursor:pointer;display:inline-block}
.bk-mgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.bk .bk-mcard{border:1px solid #4b4333;border-radius:10px;padding:16px;background:#181715;text-align:left;width:100%;cursor:pointer;color:var(--cream)}
.bk .bk-mcard:hover{border-color:var(--gold)}
.bk-mcard .bk-ava{margin-bottom:11px}
.bk-mcard strong{display:block;font-size:14px}
.bk-mcard small{display:block;color:#a69a84;margin:7px 0 2px;font-size:11px;line-height:1.55}
.bk .bk-mcard.static{cursor:default}
.bk .bk-mcard.static:hover{border-color:#4b4333}
.bk-gcard{border:1px solid #4b4333;border-radius:10px;padding:16px;background:#181715}
.bk-gcard .bk-gcover{width:46px;height:46px;font-size:17px;margin-bottom:13px}
.bk-gcard h3{font-family:Georgia,serif;font-size:18px;margin:0 0 7px;color:var(--cream)}
.bk-gcard .meta{font-size:10.5px;color:#a69a84;letter-spacing:.4px}
.bk-gcard p{font-size:12px;color:#aaa094;line-height:1.6;min-height:38px}
.bk-search{display:flex;gap:9px;margin:0 0 16px}
.bk-search input{flex:1;min-width:0;background:#201e1b;border:1px solid #5b4a28;border-radius:24px;padding:12px 16px;color:var(--cream);font-size:13.5px;outline:none}
.bk-search input:focus{border-color:var(--gold)}
.bk-search button{border:0;background:var(--gold);color:#13110e;border-radius:24px;padding:0 19px;font-weight:900;font-size:11px;letter-spacing:.5px;cursor:pointer}
.bk-pers{border:1px solid #4b4333;border-radius:10px;background:#181715;padding:12px 14px;margin:0 0 16px}
.bk-pers .lab{font-size:9px;letter-spacing:2px;color:var(--gold);font-weight:900;margin-bottom:8px}
.bk-persrow{display:flex;gap:9px;flex-wrap:wrap}
.bk-perchip{display:flex;align-items:center;gap:8px;border:1px solid #584c30;border-radius:999px;padding:5px 13px 5px 6px;cursor:pointer;color:var(--cream);font-size:12px;font-weight:800}
.bk-perchip:hover{border-color:var(--gold)}
.bk-perchip .bk-ava{width:27px;height:27px;font-size:9px}
.bk-profhero{border:1px solid #6c5021;border-radius:12px;overflow:hidden;margin-bottom:16px;background:#101010}
.bk-profcover{height:110px;background-size:cover;background-position:center;background-color:#241a0d}
.bk-profbody{padding:0 20px 18px;margin-top:-30px}
.bk-profbody .bk-ava{width:66px;height:66px;font-size:19px;border-width:3px}
.bk-profbody h2{font-family:Georgia,serif;font-size:25px;margin:11px 0 4px;color:var(--cream)}
.bk-profbody .meta{color:#b5a17b;font-size:12px;line-height:1.6}
.bk-profcounts{display:flex;gap:20px;margin-top:13px;flex-wrap:wrap}
.bk-profcounts div b{display:block;font-size:16px;color:var(--gold)}
.bk-profcounts div span{font-size:9px;letter-spacing:1.4px;color:#9b907a;font-weight:900}
.bk-proftest{margin-top:14px;border-left:3px solid var(--gold);padding:4px 0 4px 13px;font-size:13.5px;line-height:1.65;color:#eadfc2;font-style:italic}
.bk-secttl{font-family:Georgia,serif;font-size:21px;margin:20px 0 12px;color:var(--cream)}
.bk-secttl em{color:var(--gold);font-style:normal}
@media(max-width:1240px){.bk-shell{grid-template-columns:220px minmax(0,1fr)}.bk-side{display:none}}
@media(max-width:880px){.bk-shell{grid-template-columns:minmax(0,1fr)}.bk-rail{display:none}.bk-main{max-width:none}}
@media(max-width:730px){
 .bk-heroc{padding:24px 18px;max-width:330px}.bk-heroc h1{font-size:47px}.bk-herographics{left:29%;opacity:.75}
 .bk-herobot>span{display:none}.bk-herostamp{display:none}.bk-herotape{display:none}.bk-secline span:last-child{display:none}
 .bk-stories{gap:7px}.bk .bk-story{height:138px;padding:10px}.bk-story-label{font-size:16px}.bk-story-start strong{font-size:18px}
 .bk-story-plus{width:33px;height:33px;font-size:19px}.bk-story-mono{font-size:25px}.bk-story-foot{font-size:7px}
 .bk-comp-tools>span{display:none}.bk-comp-tools>div{justify-content:space-between;width:100%}
 .bk-feedtruth{display:none}.bk-actions{padding:5px 5px 8px}.bk-act{font-size:9px;gap:4px}
 .bk-doors{grid-template-columns:1fr}.bk-doorhero{flex-direction:column;align-items:flex-start}
 .bk-mgrid{grid-template-columns:1fr}
}
@media(max-width:425px){.bk .bk-story{height:126px}.bk-story-label{font-size:14px}.bk-heroc h1{font-size:44px}.bk-heroc p{max-width:240px}}
@media(prefers-reduced-motion:reduce){.bk .bk-story{transition:none}}
`;

const S = {
  view: 'doors', root: null, navigate: null,
  mode: 'snapshot',            // 'live' once the API answers from this browser
  posts: [], testimonies: [], groups: [], members: [], bakedMembers: [],
  counters: null, feedPage: 1, feedTotal: null, feedBusy: false,
  feedFilter: 'all', feedShown: PAGE,
  composeType: 'post', gateOpen: false,
  profileId: null, profileCache: new Map(),
  commentsOpen: new Set(), commentsCache: new Map(),
  peopleQuery: '', peopleResults: null, loadedLive: false,
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
const initials = (name) => {
  const w = String(name || '?').replace(/[^A-Za-z0-9: ]/g, '').split(/\s+/).filter(Boolean);
  if (/16:3/.test(name || '')) return '16:3';
  return ((w[0]?.[0] || '?') + (w[1]?.[0] || '')).toUpperCase();
};
const AVA_TONES = [
  'linear-gradient(145deg,#76553b,#212f2a)', 'linear-gradient(145deg,#435363,#17171a)',
  'linear-gradient(145deg,#64352d,#231716)', 'linear-gradient(145deg,#575147,#222222)',
  'linear-gradient(145deg,#4b3810,#1e1911)', 'linear-gradient(145deg,#3c4a2d,#141a10)',
  'linear-gradient(145deg,#5d4426,#241a10)', 'linear-gradient(145deg,#51304a,#1d1019)',
];
const avaTone = (name) => { let h = 0; for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AVA_TONES[h % AVA_TONES.length]; };
const avatarHtml = (name, url, house) => house
  ? `<span class="bk-ava house">16:3</span>`
  : url
    ? `<span class="bk-ava"><img src="${esc(url)}" alt="" loading="lazy" onerror="this.parentNode.textContent='${esc(initials(name))}'"></span>`
    : `<span class="bk-ava" style="background:${avaTone(name)}">${esc(initials(name))}</span>`;
const relTime = (iso) => {
  const t = new Date(iso).getTime(); if (!isFinite(t)) return '';
  const d = Date.now() - t, m = Math.floor(d / 60000), h = Math.floor(m / 60), dd = Math.floor(h / 24);
  if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`;
  if (dd < 7) return `${dd}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtDate = (iso) => { const t = new Date(iso); return isFinite(t) ? t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''; };

async function fetchJson(url, ms = 9000) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
  finally { clearTimeout(to); }
}
async function fetchBaked(name) { const r = await fetch(DATA + name); if (!r.ok) throw new Error(name); return r.json(); }

function normalizePost(p) {
  return {
    id: p.id, type: p.type || 'post',
    authorId: p.authorId ?? p.userId ?? null, authorName: p.authorName || 'Member',
    authorAvatar: p.authorAvatar ?? null, authorVerified: !!p.authorVerified,
    authorLocation: p.authorLocation ?? null,
    body: p.body || '', media: Array.isArray(p.media) ? p.media : [],
    gradient: p.gradient || null, createdAt: p.createdAt,
    reactionCounts: p.reactionCounts || {}, commentCount: p.commentCount || 0,
    prayerCount: p.prayerCount || 0, shareCount: p.shareCount || 0,
    isPinned: !!p.isPinned, groupId: p.groupId ?? null,
    isAnswered: !!(p.isAnswered ?? p.answered),
  };
}
const rxTotal = (p) => Object.values(p.reactionCounts || {}).reduce((a, b) => a + (b || 0), 0);

/* Live-first load: guest feed pages + testimonies + prayers + groups +
   member search index, all from the community API. Any failure keeps the
   baked capture (labeled as such in the UI). */
async function loadLive() {
  if (S.loadedLive) return;
  S.loadedLive = true;
  try {
    const [bakedFeed, bakedMembers, bakedMeta, bakedGroups] = await Promise.all([
      fetchBaked('feed.json'), fetchBaked('members.json'), fetchBaked('meta.json'), fetchBaked('groups.json').catch(() => null),
    ]);
    const b = bakedFeed.posts.map(normalizePost);
    S.posts = b.filter((p) => p.type !== 'testimony');
    S.testimonies = b.filter((p) => p.type === 'testimony');
    S.bakedMembers = bakedMembers.members || [];
    S.groups = bakedGroups?.groups || [];
    S.counters = bakedMeta.counters?.livePulse20261119 || bakedMeta.counters;
    S.members = buildDirectory();
  } catch { /* baked data unavailable: live leg below still runs */ }
  try {
    const pages = await Promise.all([1, 2, 3].map((n) => fetchJson(`${API_BASE}/api/community/posts?page=${n}&limit=25`)));
    const live = pages.flatMap((j) => (j.posts || []).map(normalizePost));
    if (live.length) {
      S.posts = live.filter((p) => p.type !== 'testimony');
      const liveTest = live.filter((p) => p.type === 'testimony');
      if (liveTest.length) S.testimonies = liveTest;
      S.feedTotal = pages[0].total ?? null; S.mode = 'live';
    }
    const [pulse, groups] = await Promise.all([
      fetchJson(`${API_BASE}/api/community/pulse`).catch(() => null),
      fetchJson(`${API_BASE}/api/community/groups`).catch(() => null),
    ]);
    if (pulse) S.counters = { members: pulse.members, testimonies: pulse.testimonies, prayerRequests: pulse.prayerRequests, prayersLifted: pulse.prayersLifted };
    if (groups?.groups?.length) S.groups = groups.groups;
    S.members = buildDirectory();
  } catch { /* snapshot mode stands, labeled in the UI */ }
}

function buildDirectory() {
  const byId = new Map();
  (S.bakedMembers || []).forEach((m, i) => byId.set(m.id || `evidenced-${i}`, { ...m, id: m.id || null, key: m.id || `evidenced-${i}` }));
  const counts = new Map();
  for (const p of [...S.posts, ...S.testimonies]) if (p.authorId) counts.set(p.authorId, (counts.get(p.authorId) || 0) + 1);
  for (const p of [...S.posts, ...S.testimonies]) {
    if (!p.authorId || p.authorId === HOUSE_ID) continue;
    const cur = byId.get(p.authorId) || { id: p.authorId, key: p.authorId, name: p.authorName, avatar: null, verified: false, location: null };
    cur.name = p.authorName || cur.name; cur.avatar = cur.avatar || p.authorAvatar; cur.verified = cur.verified || p.authorVerified;
    cur.location = cur.location || p.authorLocation; cur.postsInPull = counts.get(p.authorId) || 0;
    byId.set(p.authorId, cur);
  }
  return [...byId.values()].sort((a, b2) => (b2.postsInPull || b2.posts || 0) - (a.postsInPull || a.posts || 0) || String(a.name).localeCompare(String(b2.name)));
}

/* ---------------- frame: rails ---------------- */
function countersLine() {
  const c = S.counters; if (!c) return '';
  return `<b>${c.members}</b> members · <b>${c.testimonies}</b> testimonies<br><b>${c.prayerRequests}</b> prayer requests · <b>${c.prayersLifted}</b> prayers lifted`;
}
function railHtml() {
  const v = S.view;
  const link = (view, glyph, label, extra = '') => `<button type="button" class="bk-rlink ${v === view ? 'on' : ''}" data-view="${view}"><span class="g">${glyph}</span><span>${label}</span>${extra}</button>`;
  return `<aside class="bk-rail">
    <div class="panel bk-idcard"><div class="bk-idhead"><span class="bk-ava house">16:3</span><div><span class="eyebrow">YOUR CORNER</span><strong>Welcome home.</strong><small>The family's own wall — read it all as a guest. Posting opens with member sign-in.</small></div></div>
    <div class="bk-countline">${countersLine()}</div></div>
    <div class="bk-railgroup"><div class="bk-railt">THE COMMUNITY</div>
      ${link('feed', '⌂', 'The Feed', '<i>01</i>')}
      <button type="button" class="bk-rlink" data-hubgo="pray"><span class="g">✛</span><span>Prayer Wall</span></button>
      ${link('testimonies', '✦', 'Testimonies')}
      ${link('groups', '◉', 'Groups &amp; Circles')}
      ${link('members', '◎', 'Find Your People')}
      ${link('messages', '✉', 'Messages', '<em>SIGN-IN</em>')}
      ${link('saved', '⚑', 'Saved Posts', '<em>SIGN-IN</em>')}
    </div>
    <div class="bk-railgroup"><div class="bk-railt">YOUR CIRCLES</div>
      ${S.groups.slice(0, 3).map((g) => `<button type="button" class="bk-circle" data-view="groups"><span class="bk-gcover">${esc(initials(g.name))}</span><span>${esc(g.name)}</span></button>`).join('')}
    </div>
    <div class="bk-quote"><div class="sc">“</div><p>Church is not just a building. It's who shows up for you when life gets loud.</p><span>THE 16:3 WAY.</span></div>
    <div class="bk-railbot">A PLACE TO BE REAL.<br>A PEOPLE TO BELONG TO.</div>
  </aside>`;
}
function sideHtml() {
  return `<aside class="bk-side">
    <div class="bk-sidelabel"><span class="bk-reddot"></span> ON THE BLOCK</div>
    <section class="panel bk-tape"><div class="small">THE WEEKLY ROTATION <span>VOL. 01</span></div><h3>FAITH HAS<br><em>A SOUND.</em></h3>
      <div class="bk-disc"><div class="bk-dring">16:3</div></div>
      <button type="button" class="bk-track" data-hubgo="pray"><span class="no">01</span><span class="tt"><strong>THE PRAYER ROOM</strong><small>Bring what you carry.</small></span><span class="wv">▂▅▃▇▅▂</span></button>
      <button type="button" class="bk-track" data-view="testimonies"><span class="no">02</span><span class="tt"><strong>STILL STANDING</strong><small>Stories from the family.</small></span><span class="wv">▇▂▄▅▃▆</span></button>
      <button type="button" class="bk-goldbtn" data-hubgo="listen">EXPLORE THE LISTEN HUB ↗</button></section>
    <section class="panel bk-sidecard bk-praypanel"><div class="phead"><span class="eyebrow">YOUR PEOPLE NEED YOU</span><span class="x">✛</span></div><h3>PRAY WITH<br>SOMEBODY.</h3><p>You don't need the right words. Just show up with an open heart.</p><button type="button" class="bk-goldbtn" data-hubgo="pray">OPEN THE PRAYER WALL ↗</button></section>
    <section class="panel bk-sidecard"><div class="phead"><span class="eyebrow">FIND YOUR CIRCLE</span><span class="x">✦</span></div>
      ${S.groups.slice(0, 4).map((g) => `<button type="button" class="bk-mini" data-view="groups"><span class="bk-gcover">${esc(initials(g.name))}</span><span class="mi"><strong>${esc(g.name)}</strong><small>${g.memberCount} member${g.memberCount === 1 ? '' : 's'} · ${g.isPublic === false ? 'Private' : 'Public'} group</small></span><span class="plus">+</span></button>`).join('')}
      <button type="button" class="bk-textlink" data-view="groups">EXPLORE ALL GROUPS ↗</button></section>
    <section class="panel bk-sidecard bk-code"><div class="phead"><span class="eyebrow">THE FAMILY CODE</span><span style="color:#8d7a4d;font-size:10px;font-weight:900">0163</span></div>
      <p><b>COME AS YOU ARE.</b><br>Protect each other's stories. Pray, don't shame. Listen before you judge. Love people out loud.</p></section>
    <div class="bk-sidefoot">16:3 FAITH © 2026<br>A DIFFERENT KIND OF SUNDAY. EVERY DAY.</div>
  </aside>`;
}
function frame(mainHtml) {
  return `<style>${CSS}${CSS2}${CSS3}</style><div class="bk"><div class="bk-shell">${railHtml()}<div class="bk-main">${mainHtml}</div>${sideHtml()}</div></div>`;
}

/* ---------------- doors ---------------- */
function viewDoors() {
  const c = S.counters || {};
  const door = (view, art, no, title, text, cnt) => `
    <button type="button" class="bk-door" data-view="${view}" data-t0>
      <img class="art" src="assets/img/community/${art}" alt="" aria-hidden="true"><span class="shade"></span>
      <span class="in"><span class="no">${no}</span><h3>${title}</h3><p>${text}</p><span class="cnt">${cnt}</span></span>
    </button>`;
  return `<div class="bk-doorhero"><img src="assets/img/community/mixtape.svg" alt="16:3 Faith — The Block mixtape artwork">
      <div><span class="eyebrow">COMMUNITY · FAITHBOOK</span><h1>The family <em>talks here.</em></h1>
      <p>Faithbook — the 16:3 Faith wall. Real posts, real people, real testimonies: read everything, get to know the family, and when member sign-in joins this house, post like home.</p></div></div>
    <div class="bk-doors">
      ${door('feed', 'poster-community.svg', 'DOOR 01', 'The Feed', 'The family wall — every post in the order it was shared.', `${S.posts.length + S.testimonies.length} POSTS CARRIED`)}
      ${door('testimonies', 'poster-testimony.svg', 'DOOR 02', 'Testimonies', 'What God has done, in the family\'s own words — its own tape.', `${c.testimonies ?? S.testimonies.length} TESTIMONIES`)}
      ${door('members', 'poster-community.svg', 'DOOR 03', 'Find Your People', 'The family directory — real members, real profiles.', `${c.members ?? ''} MEMBERS`)}
      ${door('groups', 'poster-prayer.svg', 'DOOR 04', 'Groups & Circles', 'The small circles of the house — the real, live group list.', `${S.groups.length} GROUPS LIVE`)}
      <button type="button" class="bk-door gated" data-view="messages"><span class="shade"></span><span class="in"><span class="no">DOOR 05</span><h3>Messages</h3><p>Member to member. The message routes are live on the API and gated to accounts — honestly closed to guests, never simulated.</p><span class="cnt">SIGN-IN OPENS THIS DOOR</span></span></button>
      <button type="button" class="bk-door gated" data-view="saved"><span class="shade"></span><span class="in"><span class="no">DOOR 06</span><h3>Saved Posts</h3><p>Your bookmarks live in your member account — nothing is saved on this device or faked here.</p><span class="cnt">SIGN-IN OPENS THIS DOOR</span></span></button>
    </div>`;
}

/* ---------------- feed pieces ---------------- */
function heroHtml() {
  return `<section class="bk-hero"><div class="bk-herographics"><span class="bk-herogrid"></span><span class="bk-herotape">THE BLOCK · VOL. 01</span><img src="assets/img/community/mixtape.svg" alt="16:3 Faith The Block mixtape artwork"></div>
    <div class="bk-heroc"><div class="bk-heroeb"><span class="bk-sq"></span>16:3 PRESENTS <b>///</b> FAITHBOOK</div>
    <h1>FAITH GOT<br><span>A FEED.</span></h1><p>More than followers. More like family.<br>Real stories, real prayer, real people.</p>
    <div class="bk-herobot"><button type="button" class="bk-redbtn" data-composefocus>PULL UP &amp; POST <span>↗</span></button><span>THIS IS YOUR CORNER OF THE INTERNET.</span></div></div>
    <span class="bk-herostamp">COME AS YOU ARE ✳</span></section>
  <div class="bk-secline"><span>THE COMMUNITY / 001</span><span>REAL PEOPLE. NO PERFECT STORIES.</span></div>`;
}
function storiesHtml() {
  return `<div class="bk-sechead"><div><span class="eyebrow">VOICES FROM THE BLOCK</span><h2>The stories <em>keep going.</em></h2></div><button type="button" class="bk-alltest" data-view="testimonies">ALL TESTIMONIES ›</button></div>
  <div class="bk-stories">
    <button type="button" class="bk-story bk-story-start" data-story="yours"><span class="bk-story-plus">+</span><strong>YOUR STORY</strong><small>LET IT OUT</small></button>
    <button type="button" class="bk-story bk-story-prayer" data-hubgo="pray"><span class="bk-story-mono">✛</span><span class="bk-story-label">THE PRAYER<br>ROOM</span><span class="bk-story-foot">LEAVE IT HERE <b>↗</b></span></button>
    <button type="button" class="bk-story bk-story-test" data-view="testimonies"><span class="bk-story-mono">✦</span><span class="bk-story-label">GRACE HAS<br>A STORY</span><span class="bk-story-foot">TESTIMONIES <b>↗</b></span></button>
    <button type="button" class="bk-story bk-story-comm" data-view="members"><span class="bk-story-mono">♡</span><span class="bk-story-label">YOU<br>BELONG.</span><span class="bk-story-foot">FIND YOUR PEOPLE <b>↗</b></span></button>
  </div>`;
}
const COMPOSE_TYPES = {
  post: { icon: '✎', label: 'POST', pill: "What's on your heart today?", gate: '<b>Posting opens with your 16:3 Faith account.</b> Member accounts connect to this preview at the sign-in leg — until then the wall is open to read, exactly as the family left it. Nothing about browsing is locked.' },
  testimony: { icon: '✦', label: 'TESTIMONY', pill: 'Share what God has done…', gate: '<b>Testimonies are shared from member accounts.</b> When sign-in joins this preview, your testimony posts straight to the Testimony Tape. Until then, read the family\'s testimonies — every one is real and carried word for word.' },
  prayer: { icon: '✛', label: 'PRAYER REQUEST', pill: 'What should the family pray over?', gate: '<b>Prayer requests are posted from member accounts.</b> When sign-in joins this preview, your request lands on the wall with its own praying count. The Prayer Wall in the Pray hub is open to read right now.', prayBtn: true },
};
function composerHtml() {
  const t = COMPOSE_TYPES[S.composeType];
  return `<section class="panel bk-composer" id="bk-composer"><div class="bk-comp-main"><span class="bk-ava you">YOU</span><button type="button" class="bk-comp-pill" data-gate>${esc(t.pill)}</button></div>
    <div class="bk-comp-tools"><span>DROP SOMETHING REAL.</span><div>${Object.entries(COMPOSE_TYPES).map(([k, v]) => `<button type="button" data-composetype="${k}" class="${S.composeType === k ? 'sel' : ''}">${v.icon} <span>${v.label}</span></button>`).join('')}</div></div>
    <div class="bk-gate ${S.gateOpen ? 'open' : ''}" data-gatepanel>${t.gate}${t.prayBtn ? '<div class="row"><button type="button" class="bk-gbtn" data-hubgo="pray">OPEN THE PRAYER WALL ↗</button></div>' : ''}</div></section>`;
}
function feedList() {
  if (S.feedFilter === 'prayer') return S.posts.filter((p) => p.type === 'prayer');
  if (S.feedFilter === 'testimony') return S.testimonies;
  return S.posts;
}
function postCard(p, inProfile = false) {
  const rx = p.reactionCounts || {};
  const total = rxTotal(p);
  const praying = p.type === 'prayer' ? (p.prayerCount || 0) : (rx.pray || 0);
  const metaBits = [];
  if (total) metaBits.push(`♥ ${total} reaction${total === 1 ? '' : 's'}`);
  if (praying) metaBits.push(`✛ ${praying} praying`);
  const tag = p.type === 'testimony' ? '<span class="bk-tag test">✦ TESTIMONY</span>'
    : p.type === 'prayer' ? `<span class="bk-tag">✛ PRAYER REQUEST${p.isAnswered ? ' · ANSWERED ✓' : ''}</span>`
    : p.isPinned ? '<span class="bk-tag pin">PINNED</span>' : '';
  const long = p.body.length > 420;
  const body = long && !inProfile ? esc(p.body.slice(0, 420)).trimEnd() + '…' : linkify(p.body);
  const media = (p.media || []).map((m) => m?.url ? `<img class="bk-postimg" src="${esc(m.url)}" alt="" loading="lazy">` : '').join('');
  return `<article class="bk-card ${p.type === 'testimony' ? 'testimony' : ''}" data-post="${esc(p.id)}">
    <div class="bk-postbody"><div class="bk-posthead">
      <span data-profile="${esc(p.authorId || '')}" style="cursor:pointer">${avatarHtml(p.authorName, p.authorAvatar, p.authorId === HOUSE_ID)}</span>
      <div class="bk-pid"><b data-profile="${esc(p.authorId || '')}">${esc(p.authorName)}${p.authorVerified ? ' <span class="bk-ver">✦</span>' : ''}</b>
      <small>${relTime(p.createdAt)}${p.authorLocation ? ' · ' + esc(p.authorLocation) : ''}</small></div>${tag}</div>
      <p class="bk-posttext">${body}</p>${long && !inProfile ? '<button type="button" class="bk-seemore" data-seemore>See more</button>' : ''}
    </div>${media}
    <div class="bk-postmeta"><span class="amen">${metaBits.length ? metaBits.join(' · ') : 'Be the first to say Amen — reactions open with sign-in'}</span><span>${p.commentCount} comment${p.commentCount === 1 ? '' : 's'} · ${p.shareCount} share${p.shareCount === 1 ? '' : 's'}</span></div>
    <div class="bk-actions">
      <button type="button" class="bk-act" data-act="amen"><span class="ic">♥</span>AMEN${rx.amen ? ` · ${rx.amen}` : ''}</button>
      <button type="button" class="bk-act" data-comments><span class="ic">❝</span>COMMENT${p.commentCount ? ` · ${p.commentCount}` : ''}</button>
      <button type="button" class="bk-act" data-act="pray"><span class="ic">✛</span>PRAY${praying ? ` · ${praying}` : ''}</button>
      <button type="button" class="bk-act" data-act="share"><span class="ic">↗</span>SHARE${p.shareCount ? ` · ${p.shareCount}` : ''}</button>
      <button type="button" class="bk-act" data-act="save"><span class="ic">⚑</span>SAVE</button>
    </div>
    <div class="bk-gate" data-actgate></div>
    <div class="bk-comments" data-commentsbox></div>
  </article>`;
}
function viewFeed() {
  const list = feedList();
  const shown = list.slice(0, S.feedShown);
  const srcNote = S.mode === 'live'
    ? `Live from the community API as you read — the family's wall, in the API's own order. Tap a name for the member's profile; comments open right on the card.`
    : `Captured production feed (2026-10-21/22 guest pages) — real posts, in the API's own order. The wall loads live wherever the API answers. Tap a name for the member's profile; comments open right on the card.`;
  return `${heroHtml()}${storiesHtml()}${composerHtml()}
  <section class="bk-feedsec"><div class="bk-feedhead"><div><span class="eyebrow">THE TIMELINE</span><h2>The <em>family feed.</em></h2></div><span class="bk-feedtruth">SHOW UP AS YOU ARE. ♡</span></div>
    <p class="bk-note">${srcNote}</p>
    <div class="bk-filters" role="group" aria-label="Filter posts">
      <button type="button" data-feedfilter="all" class="${S.feedFilter === 'all' ? 'on' : ''}">FOR YOU</button>
      <button type="button" data-feedfilter="prayer" class="${S.feedFilter === 'prayer' ? 'on' : ''}">PRAYER WALL</button>
      <button type="button" data-feedfilter="testimony" class="${S.feedFilter === 'testimony' ? 'on' : ''}">TESTIMONIES</button>
    </div>
    <div data-feedlist>${shown.map((p) => postCard(p)).join('') || '<div class="bk-ctx"><h3>Quiet in here.</h3><p>No posts of this kind are in the carried wall. The other doors hold the rest of the family.</p></div>'}</div>
    ${list.length > S.feedShown
      ? `<button type="button" class="bk-loadmore" data-loadmore>LOAD MORE · ${list.length - S.feedShown} MORE</button>`
      : (list.length ? `<div class="bk-endfeed"><span>✛</span><strong>YOU'RE ALL CAUGHT UP.</strong><small>Good news travels. Keep showing up.</small></div>` : '')}
  </section>`;
}

function viewTestimonies() {
  return `<button type="button" class="bk-back" data-view="doors">← ALL COMMUNITY DOORS</button>
  <div class="bk-feedhead"><div><span class="eyebrow">STORIES OF GRACE</span><h2>The <em>testimony tape.</em></h2></div></div>
  <p class="bk-note">${S.mode === 'live' ? 'Live from the community API.' : 'The carried capture.'} Every testimony below is a real post from the family wall, typed as a testimony by its author — word for word, nothing rewritten.</p>
  ${S.testimonies.map((p) => postCard(p)).join('') || '<div class="bk-ctx"><h3>No testimonies in this pull.</h3><p>The counter at the top of the hub counts every testimony on the wall; this view lists the ones in the carried pages.</p></div>'}`;
}
function peopleStripHtml() {
  const rows = S.peopleResults != null
    ? S.peopleResults.map((r) => ({ userId: r.userId, name: r.displayName, avatar: r.avatarUrl, sub: [r.location, r.headline].filter(Boolean).join(' · ') }))
    : S.members.filter((m) => m.id && (m.name + ' ' + (m.location || '')).toLowerCase().includes(S.peopleQuery.toLowerCase())).slice(0, 6)
        .map((m) => ({ userId: m.id, name: m.name, avatar: m.avatar, sub: m.location || '' }));
  if (!S.peopleQuery && S.peopleResults == null) return '';
  return `<div class="bk-pers"><div class="lab">${S.peopleResults != null ? 'LIVE FROM THE MEMBER SEARCH' : 'FROM THE DIRECTORY'}</div>
    ${rows.length ? `<div class="bk-persrow">${rows.map((r) => `<button type="button" class="bk-perchip" data-profile="${esc(r.userId)}">${avatarHtml(r.name, r.avatar, r.userId === HOUSE_ID)}<span>${esc(r.name)}${r.sub ? ` · ${esc(r.sub)}` : ''}</span></button>`).join('')}</div>`
      : '<p class="bk-note" style="margin:0">No member matches that name in the live search.</p>'}</div>`;
}
function viewMembers() {
  const list = S.members;
  return `<button type="button" class="bk-back" data-view="doors">← ALL COMMUNITY DOORS</button>
  <div class="bk-feedhead"><div><span class="eyebrow">THE FAMILY DIRECTORY</span><h2>Every face <em>matters.</em></h2></div></div>
  <p class="bk-note">${S.counters ? `<b style="color:var(--gold)">${S.counters.members} members</b> strong — ` : ''}the directory below lists the members evidenced in the wall's own pages${S.mode === 'live' ? ' and this live pull' : ' of the capture'} — real people only; nobody is invented to fill a grid. Search runs against the live member index.</p>
  <form class="bk-search" data-peoplesearch><input type="search" placeholder="Search the family by name…" value="${esc(S.peopleQuery)}" aria-label="Search members by name"><button type="submit">SEARCH</button></form>
  ${peopleStripHtml()}
  <div class="bk-mgrid">${list.map((m) => m.id ? `
    <button type="button" class="bk-mcard" data-profile="${esc(m.id)}">${avatarHtml(m.name, m.avatar, false)}
      <strong>${esc(m.name)}${m.verified ? ' <span class="bk-ver">✦</span>' : ''}</strong>
      <small>${m.location ? esc(m.location) + ' · ' : ''}${(m.postsInPull ?? m.posts) != null ? (m.postsInPull ?? m.posts) + (((m.postsInPull ?? m.posts) === 1) ? ' post' : ' posts') + (S.mode === 'live' ? ' in this pull' : ' in capture') : ''}</small>
    </button>` : `
    <div class="bk-mcard static" data-noprofile="1">${avatarHtml(m.name, m.avatar, false)}
      <strong>${esc(m.name)}${m.verified ? ' <span class="bk-ver">✦</span>' : ''}</strong>
      <small>${m.location ? esc(m.location) + ' · ' : ''}profile proven on the old face (census Leg-4)</small>
    </div>`).join('')}</div>`;
}
function viewGroups() {
  return `<button type="button" class="bk-back" data-view="doors">← ALL COMMUNITY DOORS</button>
  <div class="bk-feedhead"><div><span class="eyebrow">THE SMALL CIRCLES</span><h2>Find your <em>people.</em></h2></div></div>
  <p class="bk-note">${S.mode === 'live' ? 'The live group list from the community API, read as you opened this door.' : 'The verified group list, captured live from the community API on 2026-11-19 (the live API did not answer from this network).'} Joining a group is a member action — it opens with your account when sign-in joins this preview.</p>
  <div class="bk-mgrid">${S.groups.map((g) => `
    <div class="bk-gcard"><span class="bk-gcover">${esc(initials(g.name))}</span>
      <h3>${esc(g.name)}</h3><div class="meta">${g.memberCount} member${g.memberCount === 1 ? '' : 's'} · ${g.isPublic === false ? 'Private' : 'Public'} group · led by the 16:3 Faith house</div>
      <p>${esc(g.description || '')}</p>
      <button type="button" class="bk-goldbtn" style="width:auto;padding:9px 16px;margin-top:4px" data-joingate>JOIN GROUP</button>
      <div class="bk-gate" data-joingatepanel><b>Joining opens with member sign-in.</b> Groups are live on the community API today — membership itself is an account action, and accounts join this preview at the sign-in leg. The circle will be here.</div>
    </div>`).join('')}</div>`;
}
function viewMessages() {
  return `<button type="button" class="bk-back" data-view="doors">← ALL COMMUNITY DOORS</button>
  <div class="bk-ctx"><span class="eyebrow">INBOX</span><h3 style="margin-top:8px">Stay <em style="color:var(--gold)">connected.</em></h3>
  <p><b>Messages are member-to-member.</b> The message routes are live on the community API and answer “Please sign in” to guests (verified 2026-11-19) — so there is no inbox to show a guest, and this house does not fake one: no sample conversations, no demo threads.</p>
  <p>When member sign-in joins this preview, your real conversations open here.</p></div>`;
}
function viewSaved() {
  return `<button type="button" class="bk-back" data-view="doors">← ALL COMMUNITY DOORS</button>
  <div class="bk-ctx"><span class="eyebrow">YOUR BOOKMARKS</span><h3 style="margin-top:8px">Keep it <em style="color:var(--gold)">close.</em></h3>
  <p><b>Saved posts live in your member account.</b> Bookmarks are personal account state on the community API — a guest has none, and nothing is quietly stored on this device to pretend otherwise.</p>
  <p>When member sign-in joins this preview, the posts you save from the wall collect here.</p></div>`;
}
async function viewProfile(id) {
  const carried = [...S.posts, ...S.testimonies].filter((p) => p.authorId === id);
  const first = carried[0];
  const baked = (S.bakedMembers || []).find((m) => m.id === id);
  const name0 = first?.authorName || baked?.name || 'Member';
  S.root.querySelector('.bk-main').innerHTML = `<button type="button" class="bk-back" data-view="members">← FIND YOUR PEOPLE</button>
    <div data-prof><div class="bk-ctx"><h3>${esc(name0)}</h3><p>Loading the full profile…</p></div></div>`;
  let prof = S.profileCache.get(id) || null;
  if (!prof) {
    try { const j = await fetchJson(`${API_BASE}/api/community/members/${encodeURIComponent(id)}/profile`); prof = j.profile || null; if (prof) S.profileCache.set(id, prof); } catch { /* carried fallback below */ }
  }
  if (S.view !== 'profile' || S.profileId !== id) return;
  const posts = prof?.posts?.length ? prof.posts.map(normalizePost) : carried;
  const name = prof?.displayName || name0;
  const el = S.root.querySelector('[data-prof]'); if (!el) return;
  if (id === HOUSE_ID && prof) {
    el.innerHTML = `<div class="bk-profhero"><div class="bk-profcover" style="background-image:url('${esc(prof.coverUrl || '')}')"></div><div class="bk-profbody">
      <span data-profile="${HOUSE_ID}" style="cursor:pointer">${avatarHtml(name, prof.avatarUrl, true)}</span>
      <h2>${esc(name)} <span class="bk-ver">✦</span></h2><div class="meta">${esc(prof.headline || '')}${prof.location ? ' · ' + esc(prof.location) : ''}</div>
      <div class="bk-profcounts"><div><b>${prof.postCount}</b><span>POSTS</span></div><div><b>${prof.followerCount}</b><span>FOLLOWERS</span></div><div><b>${prof.friendCount}</b><span>FRIENDS</span></div></div>
      ${prof.bio ? `<p style="font-size:13.5px;line-height:1.65;color:#e2d9c2;margin:14px 0 0">${linkify(prof.bio)}</p>` : ''}
    </div></div>
    <h3 class="bk-secttl">From the <em>house</em></h3>${posts.map((p) => postCard(p, true)).join('')}`;
    wirePosts(el); return;
  }
  el.innerHTML = `<div class="bk-profhero"><div class="bk-profcover" style="background-image:url('${esc(prof?.coverUrl || '')}')"></div><div class="bk-profbody">
    ${avatarHtml(name, prof?.avatarUrl || first?.authorAvatar || baked?.avatar, false)}
    <h2>${esc(name)}${(prof?.isVerified || first?.authorVerified || baked?.verified) ? ' <span class="bk-ver">✦</span>' : ''}</h2>
    <div class="meta">${esc(prof?.location || first?.authorLocation || baked?.location || '')}${prof?.createdAt ? ' · Member since ' + fmtDate(prof.createdAt) : ''}</div>
    ${prof ? `<div class="bk-profcounts"><div><b>${prof.postCount}</b><span>POSTS</span></div><div><b>${prof.followerCount}</b><span>FOLLOWERS</span></div><div><b>${prof.friendCount}</b><span>FRIENDS</span></div></div>` : `<div class="meta" style="margin-top:10px">${posts.length} post${posts.length === 1 ? '' : 's'} in this ${S.mode === 'live' ? 'pull' : 'capture'}</div>`}
    ${prof?.bio ? `<p style="font-size:13.5px;line-height:1.65;color:#e2d9c2;margin:14px 0 0">${linkify(prof.bio)}</p>` : ''}
    ${prof?.testimony ? `<div class="bk-proftest">“${esc(prof.testimony)}”</div>` : ''}
  </div></div>
  <h3 class="bk-secttl">Posts by <em>${esc(name.split(' ')[0])}</em></h3>
  ${posts.length ? posts.map((p) => postCard(p, true)).join('') : '<div class="bk-ctx"><p>No posts by this member are in the carried pages.</p></div>'}`;
  wirePosts(el);
}

/* ---------------- comments ---------------- */
async function toggleComments(card, post) {
  const box = card.querySelector('[data-commentsbox]');
  const open = box.classList.toggle('open');
  S.commentsOpen[open ? 'add' : 'delete'](post.id);
  if (!open || box.dataset.loaded) return;
  box.innerHTML = '<p class="bk-cnote">Loading comments from the live community API…</p>';
  let rows = S.commentsCache.get(post.id);
  if (!rows) {
    try { const j = await fetchJson(`${API_BASE}/api/community/posts/${encodeURIComponent(post.id)}/comments`); rows = j.comments || []; S.commentsCache.set(post.id, rows); }
    catch { box.innerHTML = `<p class="bk-cnote">Comments for this post load from the live community API, which did not answer from this network. The count on the card is the post's real recorded count (${post.commentCount}).</p>`; box.dataset.loaded = 'err'; return; }
  }
  box.dataset.loaded = '1';
  box.innerHTML = (rows.length ? rows.map((cm) => `
    <div class="bk-cline">${avatarHtml(cm.authorName, cm.authorAvatar, cm.authorId === HOUSE_ID)}
      <div class="bk-bubble"><b data-profile="${esc(cm.authorId || '')}" style="cursor:pointer">${esc(cm.authorName)}</b><span>${relTime(cm.createdAt)}</span><p>${linkify(cm.body || '')}</p></div></div>`).join('')
    : '<p class="bk-cnote">No comments yet on this post.</p>')
    + `<p class="bk-cnote" style="margin-top:8px">Commenting opens with member sign-in — accounts join this preview at the sign-in leg. Reading is open to everyone.</p>`;
  box.querySelectorAll('[data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
}

/* ---------------- events ---------------- */
const ACT_GATES = {
  amen: '<b>Amen is a member tap.</b> Reactions save to your 16:3 Faith account — the counts on every card are the family\'s real totals, and your Amen joins them when sign-in joins this preview.',
  pray: '<b>Praying is a member tap.</b> The praying counts on the wall are real, kept by the community API. When sign-in joins this preview, your tap adds yours — and the family sees someone stood with them.',
  share: '<b>Sharing is a member action.</b> The share counts on the cards are the real recorded totals. Sharing opens with your account when sign-in joins this preview.',
  save: '<b>Saved posts live in your account.</b> Bookmarks are personal account state — nothing is stored on this device. Your saves collect on the Saved Posts door when sign-in joins this preview.',
};
function findPost(id) { return [...S.posts, ...S.testimonies].find((p) => p.id === id); }
function wirePosts(scope) {
  scope.querySelectorAll('[data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
  scope.querySelectorAll('[data-comments]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const post = findPost(card?.dataset.post); if (post) toggleComments(card, post);
  }));
  scope.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const gate = card?.querySelector('[data-actgate]'); if (!gate) return;
    const was = gate.classList.contains('open') && gate.dataset.kind === btn.dataset.act;
    gate.innerHTML = ACT_GATES[btn.dataset.act] || ''; gate.dataset.kind = btn.dataset.act;
    gate.classList.toggle('open', !was);
  }));
  scope.querySelectorAll('[data-seemore]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const post = findPost(card?.dataset.post); if (!post) return;
    card.querySelector('.bk-posttext').innerHTML = linkify(post.body); btn.remove();
  }));
}
function goHub(hub) { if (location.hash !== '#/' + hub) location.hash = '#/' + hub; else if (S.navigate) S.navigate(hub); }
function openProfile(id) { S.view = 'profile'; S.profileId = id; paint(); viewProfile(id); }
function paint() {
  const mains = { doors: viewDoors, feed: viewFeed, testimonies: viewTestimonies, members: viewMembers, groups: viewGroups, messages: viewMessages, saved: viewSaved };
  S.root.innerHTML = frame(S.view === 'profile' ? '<div data-prof><div class="bk-ctx"><h3>Profile</h3><p>Loading…</p></div></div>' : (mains[S.view] || viewDoors)());
  const main = S.root.querySelector('.bk-main');
  S.root.querySelectorAll('[data-view]').forEach((n) => n.addEventListener('click', () => {
    const t0 = n.dataset.t0 != null ? performance.now() : null;
    S.view = n.dataset.view; S.gateOpen = false;
    paint();
    if (t0 != null) S.root.dataset.doorMs = String(Math.round((performance.now() - t0) * 10) / 10);
  }));
  S.root.querySelectorAll('[data-hubgo]').forEach((n) => n.addEventListener('click', () => goHub(n.dataset.hubgo)));
  main.querySelectorAll('[data-story="yours"]').forEach((n) => n.addEventListener('click', () => {
    S.composeType = 'testimony'; S.gateOpen = true; paint();
    S.root.querySelector('#bk-composer')?.scrollIntoView({ block: 'center' });
  }));
  main.querySelectorAll('[data-composefocus]').forEach((n) => n.addEventListener('click', () => {
    S.gateOpen = true; paint(); S.root.querySelector('#bk-composer')?.scrollIntoView({ block: 'center' });
  }));
  main.querySelectorAll('[data-gate]').forEach((n) => n.addEventListener('click', () => { S.gateOpen = !S.gateOpen; paint(); }));
  main.querySelectorAll('[data-composetype]').forEach((n) => n.addEventListener('click', () => { S.composeType = n.dataset.composetype; paint(); }));
  main.querySelectorAll('[data-feedfilter]').forEach((n) => n.addEventListener('click', () => { S.feedFilter = n.dataset.feedfilter; S.feedShown = PAGE; paint(); }));
  main.querySelectorAll('[data-loadmore]').forEach((n) => n.addEventListener('click', () => {
    S.feedShown += PAGE; paint();
    if (S.feedFilter === 'all' && S.mode === 'live') loadMoreLive();
  }));
  main.querySelectorAll('[data-joingate]').forEach((n) => n.addEventListener('click', () => {
    const panel = n.parentElement.querySelector('[data-joingatepanel]'); if (panel) panel.classList.toggle('open');
  }));
  const form = main.querySelector('[data-peoplesearch]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = form.querySelector('input').value.trim(); S.peopleQuery = q;
    if (!q) { S.peopleResults = null; paint(); return; }
    try { const j = await fetchJson(`${API_BASE}/api/community/members/search?q=${encodeURIComponent(q)}`); S.peopleResults = j.results || []; }
    catch { S.peopleResults = null; }
    if (S.view === 'members') paint();
  });
  wirePosts(main);
}
async function loadMoreLive() {
  if (S.feedBusy || S.feedTotal == null || S.posts.length + S.testimonies.length >= S.feedTotal) return;
  S.feedBusy = true;
  try {
    const next = Math.floor((S.posts.length + S.testimonies.length) / 25) + 1;
    const j = await fetchJson(`${API_BASE}/api/community/posts?page=${next}&limit=25`);
    const fresh = (j.posts || []).map(normalizePost).filter((p) => !findPost(p.id));
    if (fresh.length) {
      S.posts.push(...fresh.filter((p) => p.type !== 'testimony'));
      S.testimonies.push(...fresh.filter((p) => p.type === 'testimony'));
      S.members = buildDirectory();
      if (S.view === 'feed') paint();
    }
  } catch { /* the wall keeps what it has */ }
  S.feedBusy = false;
}

export function render(root, ctx) {
  S.root = root; S.navigate = ctx?.navigate || null;
  S.view = 'doors'; S.feedFilter = 'all'; S.feedShown = PAGE; S.gateOpen = false; S.composeType = 'post';
  S.commentsOpen = new Set(); S.peopleQuery = ''; S.peopleResults = null;
  paint();
  loadLive().then(() => { if (S.root && S.view !== 'profile') paint(); });
  window.__community = {
    version: 'faithbook-graft', mode: () => S.mode, state: () => S,
    openFeed: () => { S.view = 'feed'; paint(); }, openTestimonies: () => { S.view = 'testimonies'; paint(); },
    openMembers: () => { S.view = 'members'; paint(); }, openGroups: () => { S.view = 'groups'; paint(); },
    openProfile: (id) => openProfile(id), openDoors: () => { S.view = 'doors'; paint(); },
  };
}
