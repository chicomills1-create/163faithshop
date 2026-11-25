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
   baked capture as the labeled fallback. Member sign-in is LIVE on this
   face (F-CLERK, 2026-11-22): the shell loads the real Clerk instance,
   so window.Clerk.user is a true signal and member writes are real —
   the composer POSTs to the community API, Amen/Pray post reactions,
   replies post comments, all through postJson() below (session token
   via window.FaithAuth; the terms gate's 403 routes to the acceptance
   step and retries). Guests keep the honest gates. */

const API_BASE = 'https://faith-hub-api-railway-production.up.railway.app';
const DATA = 'assets/data/community/';
const PAGE = 10;
const HOUSE_ID = 'official_163faith';

const CSS = `
#hub-root:has(.bk){max-width:1460px}
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
/* F-CLERK member composer + comment form (2026-11-22) */
.bk-comp-form{flex:1;min-width:0}
.bk-comp-input{width:100%;border:1px solid #454038;border-radius:16px;padding:12px 16px;background:#211f1c;color:var(--cream);font:inherit;font-size:13.5px;line-height:1.5;resize:vertical}
.bk-comp-input:focus{outline:none;border-color:var(--gold)}
.bk-comp-status{font-size:12.5px;color:#e7dcc0;margin-top:10px;line-height:1.55}
.bk-comp-status b{color:var(--gold)}
.bk-comp-sendrow{display:flex;justify-content:flex-end}
.bk-goldbtn.bk-compsend{width:auto;padding:10px 18px}
.bk-goldbtn.bk-compsend:disabled{opacity:.55}
.bk-cform{display:flex;gap:8px;margin-top:10px}
.bk-cinput{flex:1;min-width:0;background:#211f1c;border:1px solid #454038;border-radius:20px;padding:8px 14px;color:var(--cream);font:inherit;font-size:13px}
.bk-cinput:focus{outline:none;border-color:var(--gold)}
.bk-csend{border:1px solid #765921;background:transparent;border-radius:20px;padding:8px 14px;color:var(--gold);font-size:10px;font-weight:900;letter-spacing:.5px;cursor:pointer;flex:none}
.bk-csend:hover{background:#312411}
.bk-csend:disabled{opacity:.55}
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


const CSS4 = `
/* ---------- amp-up phase 1 (2026-11-22) ---------- */
.bk-stories.member{display:flex;overflow-x:auto;padding-bottom:6px}
.bk-stories.member .bk-story{flex:0 0 128px;height:162px}
.bk-stories.member .bk-ava{margin-bottom:10px;width:40px;height:40px}
.bk-story-kind{font-size:8px;letter-spacing:1.4px;color:#f5d77f;font-weight:900}
.bk-story-name{font-family:Impact,"Arial Black",sans-serif;font-weight:900;font-size:15px;line-height:1.08;color:#fff2ce;letter-spacing:.4px;margin-top:5px}
.bk-story-ex{font-size:10px;color:#d8c491;line-height:1.45;margin-top:5px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bk-rxchips{display:inline-flex;gap:9px;flex-wrap:wrap}
.bk-rxchips .k{color:#d7b66d;font-weight:900}
.bk-shortstrip{display:none}
.bk-feedbelow{display:none}
@media(max-width:1240px){.bk-feedbelow{display:block;margin-top:26px}}
@media(max-width:880px){
 .bk-shortstrip{display:flex;gap:7px;overflow-x:auto;padding:12px 2px 2px;white-space:nowrap}
 .bk-stripchip{border:1px solid #584c30;border-radius:999px;padding:8px 13px;font-size:11px;font-weight:900;color:#e8dcbc;background:#1a1813;cursor:pointer;flex:none}
 .bk-stripchip.on{border-color:var(--gold);color:var(--gold);background:#2a2110}
 .bk-stripchip.grp{color:#bdb096;font-weight:700}
}
.bk-aicard{padding:16px 17px;border:1px solid #6c5021;border-radius:12px;background:linear-gradient(160deg,#221c10,#141310 60%);margin-bottom:14px}
.bk-ailabel{font-size:9px;letter-spacing:2px;color:var(--gold);font-weight:900;display:flex;align-items:center;gap:7px}
.bk-aicard p{font-size:12.5px;line-height:1.65;color:#e6dcc0;margin:10px 0 0}
.bk-aicard p b{color:var(--gold)}
.bk-ainote{display:block;margin-top:10px;font-size:9px;letter-spacing:1.2px;color:#9b907a;font-weight:900}
.bk-about{background:#191814;border:1px solid #4a3d24;border-radius:10px;padding:14px 18px;margin:0 0 6px}
.bk-about div{display:flex;gap:10px;font-size:12.5px;padding:5px 0;color:#d9cfb4;line-height:1.55}
.bk-about div b{color:var(--gold);min-width:96px;font-size:10px;letter-spacing:1.4px;padding-top:2px;flex:none}
.bk-profcover{position:relative;height:132px}
.bk-profcovnote{position:absolute;right:10px;bottom:8px;font-size:8.5px;letter-spacing:1.4px;color:#e8d9ac;font-weight:900;background:rgba(10,8,4,.6);padding:4px 8px;border-radius:4px}
.bk-mini .bk-ava{width:36px;height:36px;font-size:10px}
/* ---------- amp-up phase 2B (2026-11-22) ---------- */
/* GOLD FRAME on the wall's post cards (founder law 17:57): every post
   pops in a gold frame — border, warm glow, deeper shadow. */
.bk-card{border:1px solid rgba(212,175,55,.55);box-shadow:0 0 0 1px rgba(0,0,0,.5),0 0 20px rgba(212,175,55,.13),0 15px 30px rgba(0,0,0,.35)}
.bk-card.testimony{border-color:rgba(212,175,55,.8);box-shadow:0 0 0 1px rgba(0,0,0,.5),0 0 26px rgba(212,175,55,.2),0 15px 30px rgba(0,0,0,.35)}
.bk-gcoverimg{width:calc(100% + 32px);margin:-16px -16px 12px;height:110px;object-fit:cover;display:block;border-bottom:1px solid rgba(212,175,55,.4)}
.bk-artbanner{width:100%;height:170px;object-fit:cover;border-radius:12px;margin:0 0 16px;display:block}
.bk-ctx .bk-artbanner{height:150px;margin-top:4px}
.bk-doorhero img,.bk-herographics img{border-radius:8px}
`;

const CSS5 = `
/* ---------- amp-up phase 2C-1 — THE LOOK (2026-11-22) ---------- */
/* §1 INDEPENDENT RAILS (desktop): the hub grid gets a definite height
   inside its own grid area — viewport minus the shell topbar (58px),
   the hub-root top padding (26px) and breathing room — never 100vh,
   so no region scrolls under the fixed shell header or the player.
   Each column is then a true scroll region at height:100% of its
   grid cell: native overflow only (NO wheel handler, per ops ruling),
   overscroll contained so a rail hitting its end never chains into
   the wall. Phone (≤880px) reverts to plain document flow: the rails
   leave the columns and re-slot (strip + in-thread cards, below). */
@media(min-width:881px){
 .bk-shell{height:calc(100dvh - 100px);align-items:stretch}
 .bk-rail,.bk-side{position:static;height:100%;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(212,175,55,.45) transparent;padding-right:6px}
 .bk-main{height:100%;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(212,175,55,.45) transparent;padding-right:2px}
 .bk-rail::-webkit-scrollbar,.bk-side::-webkit-scrollbar,.bk-main::-webkit-scrollbar{width:6px}
 .bk-rail::-webkit-scrollbar-thumb,.bk-side::-webkit-scrollbar-thumb,.bk-main::-webkit-scrollbar-thumb{background:rgba(212,175,55,.35);border-radius:3px}
 .bk-rail::-webkit-scrollbar-track,.bk-side::-webkit-scrollbar-track,.bk-main::-webkit-scrollbar-track{background:transparent}
}
/* §4.1 GOLD FRAME — exact spec shadow on every post card; video cards
   (2C-2's .bk-video) step up to a 2px frame + stronger glow. */
.bk-card{position:relative;border:1px solid rgba(212,175,55,.55);box-shadow:0 0 0 1px rgba(212,175,55,.25),0 6px 24px rgba(0,0,0,.55)}
.bk-card.testimony{border-color:rgba(212,175,55,.8);box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 26px rgba(212,175,55,.18),0 6px 24px rgba(0,0,0,.55)}
.bk-card.bk-video{border:2px solid rgba(212,175,55,.75);box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 34px rgba(212,175,55,.22),0 6px 24px rgba(0,0,0,.55)}
/* §4.2 SHINE PASS — one diagonal sweep on entrance; desktop hover
   re-runs it under a second animation name (a name change restarts
   it). Transform/opacity only, 600ms, never loops. */
.bk-card::after{content:"";position:absolute;top:-25%;bottom:-25%;left:0;width:42%;z-index:3;pointer-events:none;opacity:0;transform:translateX(-140%) skewX(-14deg);background:linear-gradient(100deg,transparent,rgba(255,232,160,.13) 50%,transparent);animation:bk-shine .6s ease-out .1s}
.bk-card:hover::after{animation:bk-shine-hover .6s ease-out}
@keyframes bk-shine{0%{transform:translateX(-140%) skewX(-14deg);opacity:0}22%{opacity:1}100%{transform:translateX(260%) skewX(-14deg);opacity:0}}
@keyframes bk-shine-hover{0%{transform:translateX(-140%) skewX(-14deg);opacity:0}22%{opacity:1}100%{transform:translateX(260%) skewX(-14deg);opacity:0}}
/* §4.3 STORY RINGS — unviewed: animated conic gold ring (the angle
   custom property rotates the gradient itself); viewed: dim gold,
   still. Viewed state is written only by a real story open (§4.3
   ruling) and kept per session. */
@property --bka{syntax:"<angle>";initial-value:0deg;inherits:false}
.bk-ring{position:relative;display:inline-grid;place-items:center;border-radius:50%;padding:3px;flex:none;background:conic-gradient(from var(--bka),#d4af37,#ffe9a8,#8a6a24,#f3c34b,#d4af37);animation:bk-ringspin 7s linear infinite}
.bk-ring.viewed{background:rgba(212,175,55,.28);animation:none}
.bk-ring .bk-ava{margin-bottom:0}
@keyframes bk-ringspin{to{--bka:360deg}}
/* §4.4 REACTION CHIPS — five kinds, saturated, each its own color;
   the member's own reacted kind glows. Counts are the server's true
   values (LEG R merge) — this layer only dresses them. */
.bk-rx{display:inline-flex;align-items:center;gap:2px;border:1px solid #3a352b;border-radius:999px;padding:2px 8px;margin:1px 2px 1px 0}
.bk-rx .k{font-weight:900}
.bk-rx-amen{--rxc:#f3c34b}.bk-rx-pray{--rxc:#7cc4ff}.bk-rx-love{--rxc:#ff7d9c}.bk-rx-fire{--rxc:#ff9a3d}.bk-rx-blessing{--rxc:#c39bff}
.bk-rx .k{color:var(--rxc)}
.bk-rx-amen.mine{border-color:#f3c34b;box-shadow:0 0 12px rgba(243,195,75,.45)}
.bk-rx-pray.mine{border-color:#7cc4ff;box-shadow:0 0 12px rgba(124,196,255,.45)}
.bk-rx-love.mine{border-color:#ff7d9c;box-shadow:0 0 12px rgba(255,125,156,.45)}
.bk-rx-fire.mine{border-color:#ff9a3d;box-shadow:0 0 12px rgba(255,154,61,.45)}
.bk-rx-blessing.mine{border-color:#c39bff;box-shadow:0 0 12px rgba(195,155,255,.45)}
.bk-act.mine-amen{color:#f3c34b;background:#2c2210;box-shadow:inset 0 0 0 1px rgba(243,195,75,.55),0 0 10px rgba(243,195,75,.25)}
.bk-act.mine-pray{color:#7cc4ff;background:#12202e;box-shadow:inset 0 0 0 1px rgba(124,196,255,.55),0 0 10px rgba(124,196,255,.25)}
/* §4.5 BADGES — saturated red/gold, soft pulse on opacity only. */
.bk-tag.pin{background:#a02c1e;border-color:#ff7a5c;color:#ffe9e2;animation:bk-badgepulse 2.4s ease-in-out infinite alternate}
.bk-badge{display:inline-flex;align-items:center;border-radius:30px;padding:5px 9px;font-size:9px;letter-spacing:.8px;font-weight:900;white-space:nowrap;animation:bk-badgepulse 2.4s ease-in-out infinite alternate}
.bk-badge-live{background:#a02c1e;border:1px solid #ff7a5c;color:#ffe9e2}
.bk-badge-new{background:#6d551f;border:1px solid #ffd76a;color:#ffe9a8}
.bk-badge-presents{background:#3a2c07;border:1px solid #d4af37;color:#f3c34b}
.bk-reddot{animation:bk-badgepulse 2.4s ease-in-out infinite alternate}
@keyframes bk-badgepulse{from{opacity:.72}to{opacity:1}}
/* §1 390px RE-SLOT — right-rail cards ride IN the thread on phone
   (after the 3rd + 8th member post, inserted at paint/settle only);
   the below-feed stack yields so nothing renders twice. */
.bk-inthread{display:none}
@media(max-width:880px){
 .bk-inthread{display:block}
 .bk-feedbelow{display:none}
 .bk-ring .bk-ava{width:40px;height:40px}
}
@media(prefers-reduced-motion:reduce){
 .bk-card::after{animation:none}
 .bk-card:hover::after{animation:none}
 .bk-ring{animation:none}
 .bk-tag.pin,.bk-badge,.bk-reddot{animation:none}
}
`;

const CSS6 = `
/* ---------- amp-up phase 2C-2 — VIDEO IN THE WALL (2026-11-22) ---------- */
/* §3 PRESENTS CARD: our poster first under the gold 2px frame (.bk-video,
   defined in CSS5), the PRESENTS band on top, media in a 16/9 stage. The
   poster fades on OPACITY ONLY once playback starts; the engaged frame,
   the end card and the failure door all live inside our frame — YouTube
   chrome never gets a first (or last) impression. */
.bk-pv-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 16px 0}
.bk-pv-cat{font-size:9px;letter-spacing:1.6px;font-weight:900;color:#cbbd97}
.bk-pv-title{font-family:Georgia,serif;font-size:19px;line-height:1.25;color:var(--cream);padding:8px 16px 2px}
.bk-pv-sub{font-size:11px;color:#a6a097;padding:0 16px 12px}
.bk-pv-stage{position:relative;aspect-ratio:16/9;background:#0a0906;overflow:hidden;margin-top:10px}
.bk-pv-poster{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .45s ease}
.bk-pv-mono{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 38%,#3a2c07,#141310 72%);color:var(--gold);font-family:Georgia,serif;font-size:44px;letter-spacing:2px}
.bk-pv-media{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.bk-pv-card.playing .bk-pv-poster,.bk-pv-card.playing .bk-pv-mono{opacity:0;pointer-events:none}
.bk-pv-tap{position:absolute;inset:0;display:grid;place-items:center;background:transparent;border:0;cursor:pointer;z-index:2}
.bk-pv-glyph{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:rgba(10,8,4,.72);border:2px solid rgba(212,175,55,.85);color:#f3c34b;font-size:24px;padding-left:4px;box-shadow:0 0 26px rgba(212,175,55,.3)}
.bk-pv-card.playing .bk-pv-glyph{opacity:0}
.bk-pv-card.engaged .bk-pv-tap{display:none}
.bk-pv-end,.bk-pv-fail{position:absolute;inset:0;z-index:3;display:none;place-items:center;text-align:center;background:linear-gradient(160deg,rgba(24,19,8,.96),rgba(10,9,6,.97));padding:18px}
.bk-pv-card.ended .bk-pv-end{display:grid}
.bk-pv-card.failed .bk-pv-fail{display:grid}
.bk-pv-end h4,.bk-pv-fail h4{font-family:Georgia,serif;font-size:20px;color:var(--cream);margin:8px 0 4px}
.bk-pv-end p,.bk-pv-fail p{font-size:12px;color:#cbbd97;margin:0 0 14px;line-height:1.55}
.bk-pv-doors{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.bk-pv-door{border:1px solid rgba(212,175,55,.7);color:#f3c34b;background:#241b08;border-radius:8px;padding:10px 16px;font-size:11px;font-weight:900;letter-spacing:1px;cursor:pointer}
.bk-pv-door:hover{background:#33270f}
.bk-pv-note{font-size:9px;letter-spacing:1.4px;color:#8a8474;font-weight:900}
.bk-pv-card.ended .bk-pv-media{opacity:0}
@media(max-width:480px){.bk-pv-end,.bk-pv-fail{padding:10px}.bk-pv-end h4,.bk-pv-fail h4{font-size:16px;margin:5px 0 2px}.bk-pv-end p,.bk-pv-fail p{font-size:11px;margin:0 0 9px}.bk-pv-doors{flex-wrap:nowrap;gap:8px}.bk-pv-door{padding:8px 10px;font-size:10px;white-space:nowrap}}
@media(prefers-reduced-motion:reduce){.bk-pv-poster{transition:none}}
`;

const S = {
  view: 'doors', root: null, navigate: null,
  mode: 'snapshot',            // 'live' once the API answers from this browser
  posts: [], testimonies: [], groups: [], members: [], bakedMembers: [], wallPosts: [],
  counters: null, loaded: false, feedNextOffset: null, feedHasMore: false, feedTotal: null, feedBusy: false, feedGrowing: false, freshGlow: null, beatGone: false, chainSettled: false,
  feedFilter: 'all', feedShown: PAGE, feedSort: 'new',
  composeType: 'post', gateOpen: false,
  /* R-5: composer FAB + slide-up sheet state (elements themselves
     live in module vars below — persistent nodes, never painted). */
  sheetOpen: false, compFocused: false,
  profileId: null, profileCache: new Map(),
  commentsOpen: new Set(), commentsCache: new Map(),
  peopleQuery: '', peopleResults: null, loadedLive: false,
  /* R-6: right-rail Member Search state — the query + the last
     answer ({source:'live'|'directory', rows} or {busy:true}); the
     rail re-renders results from this on every paint, and the
     submit handler patches them in place between paints. */
  railSearchQ: '', railSearch: null,
  presents: [], presentsLoaded: false,
  /* 2C-4: reaction session truth (fold-in 2), new-posts pill state,
     stories viewer state. rxTruth persists in sessionStorage so a
     reload inside the API's read-lag window still holds the truth. */
  rxTruth: null, pendingNew: [], newTimer: null, storyViewer: null,
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
/* Baked reads ride the same aborting fetch as the live leg: a plain
   fetch that hangs (a network that accepts and never answers) would
   strand loadLive forever and freeze the doors on their first paint. */
async function fetchBaked(name) { return fetchJson(DATA + name); }

/* F-CLERK (2026-11-22): the member signal + write transport. The shell
   owns the session (window.FaithAuth): its apiFetch attaches the Clerk
   session token and routes the terms gate's 403 to the acceptance step,
   retrying once on accept. postJson throws an Error carrying the
   server's own message (+ .status) — a member write is only ever
   reported done when the server said so. */
const isSignedIn = () => { try { return !!(window.Clerk && window.Clerk.user); } catch { return false; } };
async function postJson(url, body) {
  /* DEFECT 4b cure (2026-11-22, found proving D4): apiFetch is a
     method on the FaithAuth object and reads `this` (authHeader /
     signedIn / openTerms). Extracting it unbound and calling it bare
     threw "Cannot read properties of undefined (reading
     'authHeader')" before any request — EVERY member write through
     here (post create, comments, reactions) died instantly with
     "The house could not be reached". Bind at extraction. The same
     cure is applied at the pray.js and give.js extraction sites. */
  const doFetch = window.FaithAuth?.apiFetch ? window.FaithAuth.apiFetch.bind(window.FaithAuth) : fetch;
  let r;
  try {
    r = await doFetch(url, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    const e = new Error('The house could not be reached just now — try again.');
    e.status = 0; throw e;
  }
  let j = null;
  try { j = await r.json(); } catch { /* non-JSON error body */ }
  if (!r.ok) {
    const e = new Error((j && (j.error || j.message)) || `That didn't go through (HTTP ${r.status}).`);
    e.status = r.status; throw e;
  }
  return j || {};
}

/* 2C-4 fold-in (1): the DELETE transport — same bound FaithAuth
   apiFetch discipline as postJson (the blink record proved
   DELETE /api/community/posts/:id → 200 {ok:true}). */
async function deleteJson(url) {
  const doFetch = window.FaithAuth?.apiFetch ? window.FaithAuth.apiFetch.bind(window.FaithAuth) : fetch;
  let r;
  try { r = await doFetch(url, { method: 'DELETE', credentials: 'include' }); }
  catch { const e = new Error('The house could not be reached just now — try again.'); e.status = 0; throw e; }
  let j = null;
  try { j = await r.json(); } catch { /* non-JSON error body */ }
  if (!r.ok) { const e = new Error((j && (j.error || j.message)) || `That didn't go through (HTTP ${r.status}).`); e.status = r.status; throw e; }
  return j || {};
}
const myId = () => { try { return window.Clerk?.user?.id || null; } catch { return null; } };
const isOwnPost = (p) => { const me = myId(); return !!me && !!p?.authorId && (p.authorId === me || personIds(me).has(p.authorId)); };

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
    /* R-3 (2026-11-23): the house series rides in the carried data —
       isSystemPost + systemKind were dropped here, so the original's
       system-kind badges could never render. Carried through now;
       postCard's badge gate reads them (see sysBadge). */
    isSystemPost: !!p.isSystemPost, systemKind: p.systemKind || null,
  };
}
const rxTotal = (p) => Object.values(p.reactionCounts || {}).reduce((a, b) => a + (b || 0), 0);

/* Cure helpers (2026-11-19 live-walk cures):
   uniqPosts — the posts API paginates by a server cursor (offset =
   nextOffset, hasMore), NOT by the page param the loader used to send
   (page=2 returned slice 1 byte-identical, proven on the live API
   2026-11-19). The cursor windows shift between requests as the wall
   moves, so slices can overlap (0–10 ids per slice in the live walk of
   the chain); every ingestion point dedupes by post id (first
   occurrence wins) and merges guard against already-held ids.
   normName — canonical person key: the same member can stand in the data
   under more than one account id (split accounts across the capture's
   sources); directory + profile matching merge on the normalized name.
   normalizeProfile — the profile payload is Facebook-shaped: the profile
   object carries avatar/cover, while postCount/followerCount/friendCount
   and the posts array are TOP-LEVEL siblings of it. Reading them off the
   profile object rendered literal "undefined" counts and hid the posts. */
const uniqPosts = (arr) => { const seen = new Set(); return arr.filter((p) => { if (!p || p.id == null) return true; if (seen.has(p.id)) return false; seen.add(p.id); return true; }); };
/* M4 cure (2026-11-20): posts excluded at ingestion. The one entry is a
   founder-era test artifact — body "test test test" (2026-08-16), empty
   authorName, authored on the founder's own account — that lives in the
   PRODUCTION database and so arrives on live slices and in the profile
   payload. It is filtered out of every build surface at ingestion
   (baked leg, live slices, profile payloads), so it never renders and
   never counts here. The production row itself is an API-side delete,
   flagged as a named step in the M4 cure record — not silently skipped. */
const EXCLUDED_POST_IDS = new Set(['822bb256-418d-48c9-8d9f-c95daeb9f8b0']);
const ingestPosts = (arr) => uniqPosts((arr || []).map(normalizePost)).filter((p) => !EXCLUDED_POST_IDS.has(p.id)).map(applyRxTruth);
/* ---------- amp-up phase 2C-4 fold-in (2) — REACTION SESSION TRUTH ----------
   The feed-list read path lags reaction writes by >80s (blink record
   LEG R): a reload inside the window renders stale counts even though
   the react RESPONSE was immediate DB truth. Cure, face-side only:
   every react response's {reactionCounts, myReactionType, prayerCount}
   is held per post id (sessionStorage 'bk-rx-truth', so the truth
   survives the reload that would otherwise show the stale list), and
   every list ingestion merges list-first, session-truth-over-it. The
   API is untouched; the 'amen' type fix is untouched. */
function rxTruthMap() {
  if (!S.rxTruth) {
    S.rxTruth = new Map();
    try { const j = JSON.parse(sessionStorage.getItem('bk-rx-truth') || '{}'); for (const [k, v] of Object.entries(j || {})) S.rxTruth.set(k, v); } catch { /* in-memory only */ }
  }
  return S.rxTruth;
}
function holdRxTruth(post) {
  if (!post?.id) return;
  rxTruthMap().set(post.id, { reactionCounts: { ...(post.reactionCounts || {}) }, myReactionType: post.myReactionType ?? null, prayerCount: post.prayerCount ?? null });
  try { sessionStorage.setItem('bk-rx-truth', JSON.stringify(Object.fromEntries(rxTruthMap()))); } catch { /* in-memory stands */ }
}
function applyRxTruth(p) {
  const t = rxTruthMap().get(p.id);
  if (!t) return p;
  p.reactionCounts = { ...t.reactionCounts };
  p.myReactionType = t.myReactionType;
  if (typeof t.prayerCount === 'number') p.prayerCount = t.prayerCount;
  return p;
}
/* Counts settle when the held wall is the complete set for the current
   mode: the snapshot after its baked load, the live wall when the
   offset chain exits (exhausted or stalled). Until then count surfaces
   read the loading glyph — never a partial that visibly climbs. */
const countsSettled = () => S.loaded && (S.mode !== 'live' || S.chainSettled);
const normName = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
const numOrNull = (v) => { const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; return typeof n === 'number' && isFinite(n) ? n : null; };
const absMedia = (u) => (u && u.startsWith('/') ? API_BASE + u : (u ?? null));
function normalizeProfile(j) {
  const p = j?.profile || null;
  if (!p) return null;
  return {
    ...p,
    avatarUrl: absMedia(p.avatarUrl ?? p.avatar ?? null),
    coverUrl: absMedia(p.coverUrl ?? p.cover ?? null),
    postCount: numOrNull(j.postCount), followerCount: numOrNull(j.followerCount), friendCount: numOrNull(j.friendCount),
    posts: Array.isArray(j.posts) ? j.posts : null,
  };
}
/* Every account id that belongs to the same person as `id` (split-account
   merge): ids sharing the member's normalized display name across the
   baked directory and the carried posts' authors. */
function personIds(id) {
  const ids = new Set([id]);
  /* Every name this account itself carries — its baked directory name
     plus the author name on its own carried posts — then every account
     id standing under any of those names (split accounts). Matching on
     the full name set keeps profile and directory aggregation over the
     exact same id set (M4 cure, 2026-11-20). */
  const names = new Set();
  const self = (S.bakedMembers || []).find((m) => m.id === id);
  if (self?.name) names.add(normName(self.name));
  for (const p of [...S.posts, ...S.testimonies]) if (p.authorId === id && p.authorName) names.add(normName(p.authorName));
  if (!names.size) return ids;
  for (const m of S.bakedMembers || []) if (m.id && names.has(normName(m.name))) ids.add(m.id);
  for (const p of [...S.posts, ...S.testimonies]) if (p.authorId && names.has(normName(p.authorName))) ids.add(p.authorId);
  return ids;
}
/* Profile counts: a count renders only when the payload actually carries
   it as a number — absent renders as absent, never "undefined", never
   invented. Falls back to the carried-pages line when no counts exist. */
const profCountsHtml = (prof, fallbackHtml) => {
  const cells = [['POSTS', prof?.postCount], ['FOLLOWERS', prof?.followerCount], ['FRIENDS', prof?.friendCount]]
    .filter(([, v]) => Number.isFinite(v))
    .map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
  return cells ? `<div class="bk-profcounts">${cells}</div>` : (fallbackHtml || '');
};

/* Merge one live posts slice into the held wall: normalize, dedupe
   within the slice, drop ids already held (cursor windows shift and
   overlap), append in API order. Returns the number of new posts. */
function mergeLiveSlice(j) {
  const seenIds = new Set([...S.posts, ...S.testimonies].map((p) => p.id));
  const fresh = ingestPosts(j.posts).filter((p) => !seenIds.has(p.id));
  if (fresh.length) {
    S.posts.push(...fresh.filter((p) => p.type !== 'testimony'));
    S.testimonies.push(...fresh.filter((p) => p.type === 'testimony'));
  }
  S.feedTotal = S.posts.length;
  return fresh.length;
}
function repaintHub() { if (S.root && S.view !== 'profile') paint(true); }

/* BLINK CURE (2026-11-22): the chain-settle moment as a PATCH, not a
   repaint. When the offset chain settles, nothing in the feed window
   can change — the chain appends OLDER posts beyond the first page,
   the stories row (newest-first) was already final at slice 1, and
   the film/scroll/composer must never be disturbed (a repaint here
   also destroyed a member's half-typed composer draft). Exactly
   three surfaces carry settle-sensitive numbers, and they patch in
   place: the rail count line (testimonies '…' → its settled count),
   the FaithGuide AI cards ('reading the wall…' → the real summary),
   and the feed sentinel (the carried remainder grew). Any shape
   mismatch (button should appear/vanish, another view is showing)
   falls back to the preserved repaint. */
function settlePatch() {
  if (!S.root || S.view !== 'feed') { repaintHub(); return; }
  const cl = S.root.querySelector('.bk-countline');
  if (cl) cl.innerHTML = countersLine();
  /* R-6: the rail profile card's stat trio settles with the counts —
     patch its cells in place the same way ('…' → the real numbers). */
  const trio = S.root.querySelector('[data-trio]');
  if (trio) trio.innerHTML = trioCellsHtml();
  /* R-1 (2026-11-23): the lobby PULSE card carries settle-sensitive
     numbers too — patch its cells in place the same way (finals,
     in-flight count-up cancelled). Text-node writes only. */
  patchPulse();
  S.root.querySelectorAll('.bk-aicard').forEach((n) => { n.outerHTML = aiHighlightsHtml(); });
  /* 2C-4: PYMK depends on the settled directory — patch it in place
     the same way (insert/remove/replace the card node, never a
     repaint). A shape mismatch (card should appear where none was
     painted inside the rail) falls back to the preserved repaint. */
  const pymkNow = pymkHtml();
  const pymkNodes = S.root.querySelectorAll('[data-pymk]');
  if (pymkNodes.length) pymkNodes.forEach((n) => { if (pymkNow) n.outerHTML = pymkNow; else n.remove(); });
  else if (pymkNow) { repaintHub(); return; }
  /* R-6 FOLD B: the button-label leg is now a sentinel nudge — the
     chain settling under a reader parked at the wall's end keeps
     feeding append-only, or lands the end state (sentinel swapped
     for YOU'RE ALL CAUGHT UP + the close) when the wall exhausts.
     A shape the append path cannot reconcile falls back to the
     preserved repaint, as before. */
  if (S.root.querySelector('[data-sentinel]')) feedMore();
  else if (S.feedFilter !== 'watch' && feedList().length && !S.root.querySelector('.bk-endfeed') && !feedExhausted()) repaintHub();
}

/* Live-first load: guest feed pages + testimonies + prayers + groups +
   member search index, all from the community API. Any failure keeps the
   baked capture (labeled as such in the UI). */
async function loadLive() {
  if (S.loadedLive) return;
  S.loadedLive = true;
  try {
    const [bakedFeed, bakedMembers, bakedMeta, bakedGroups, bakedWall, presentsShelf] = await Promise.all([
      fetchBaked('feed.json'), fetchBaked('members.json'), fetchBaked('meta.json'), fetchBaked('groups.json').catch(() => null),
      fetchBaked('../pray/wall-snapshot.json').catch(() => null),
      fetchJson('assets/data/presents-shelf.json').catch(() => null),
    ]);
    if (bakedWall?.posts?.length) S.wallPosts = ingestPosts(bakedWall.posts);
    /* 2C-2: the Presents shelf loads DATA-ONLY here — no repaint. The
       first paint that can mix is the slice-1 preserved paint below
       (or the snapshot-mode closer); chain merges never repaint, so
       no video card can be inserted mid-read (blink laws). */
    if (Array.isArray(presentsShelf?.entries) && presentsShelf.entries.length) { S.presents = presentsShelf.entries; S.presentsLoaded = true; }
    const b = ingestPosts(bakedFeed.posts);
    S.bakedPosts = b; /* Phase 2B live-walk cure (2026-11-22): the baked
      snapshot's author set is the directory's stable evidence floor —
      see buildDirectory. The wall's backing set gets REPLACED by the
      live leg below; the directory's membership must never shrink
      because of that swap. */
    S.posts = b.filter((p) => p.type !== 'testimony');
    S.testimonies = b.filter((p) => p.type === 'testimony');
    S.bakedMembers = bakedMembers.members || [];
    S.groups = bakedGroups?.groups || [];
    S.counters = bakedMeta.counters?.livePulse20261119 || bakedMeta.counters;
    S.members = buildDirectory();
    S.loaded = true; // real data backs the door counts from here on
    S.chainSettled = true; // the snapshot is a settled set: its counts are its own tape's counts
  } catch { /* baked data unavailable: live leg below still runs */ }
  try {
    const first = await fetchJson(`${API_BASE}/api/community/posts?limit=25`);
    const live = ingestPosts(first.posts);
    if (live.length) {
      S.posts = live.filter((p) => p.type !== 'testimony');
      const liveTest = live.filter((p) => p.type === 'testimony');
      if (liveTest.length) S.testimonies = liveTest;
      S.feedNextOffset = first.nextOffset ?? null;
      S.feedHasMore = !!first.hasMore && S.feedNextOffset != null;
      S.feedTotal = S.posts.length;
      S.chainSettled = false; // the live chain is running: counts settle when it exits
      S.mode = 'live';
      S.loaded = true;
      repaintHub();
    }
    const [pulse, groups] = await Promise.all([
      fetchJson(`${API_BASE}/api/community/pulse`).catch(() => null),
      fetchJson(`${API_BASE}/api/community/groups`).catch(() => null),
    ]);
    if (pulse) S.counters = { members: pulse.members, testimonies: pulse.testimonies, prayerRequests: pulse.prayerRequests, prayersLifted: pulse.prayersLifted };
    if (groups?.groups?.length) { S.groups = groups.groups; S.loaded = true; }
    S.members = buildDirectory();
    /* Offset chain (2026-11-19 feed-count cure): the first slice is only
       the head of the wall — the API serves the rest through the
       nextOffset cursor (chain walked live 2026-11-19: 10 slices, 184+
       unique posts, hasMore still true). Follow it to hasMore=false so
       the wall carries the full live set and the Feed door's POSTS
       CARRIED equals what the wall holds and can render at every
       settled paint. A failed slice stops the chain with the cursor
       standing — the scroll sentinel resumes from it (loadMoreLive). The old
       loader's three ?page= fetches were dead weight: the API ignores
       the page param (page=2 returned slice 1 byte-identical) and its
       response carries no total field, which had feedTotal pinned at
       null and the sentinel permanently guarded off — the wall capped at
       slice 1 (25 carried on the door, 19 renderable on the timeline,
       the split being the slice's 6 testimonies) while claiming
       "YOU'RE ALL CAUGHT UP." */
    let chainGuard = 0;
    while (S.mode === 'live' && S.feedHasMore && S.feedNextOffset != null && chainGuard++ < 40) {
      const cursor = S.feedNextOffset;
      let j;
      try { j = await fetchJson(`${API_BASE}/api/community/posts?limit=25&offset=${cursor}`, 15000); }
      catch { break; }
      mergeLiveSlice(j);
      S.feedNextOffset = j.nextOffset ?? null;
      S.feedHasMore = !!j.hasMore && S.feedNextOffset != null && S.feedNextOffset !== cursor;
      S.members = buildDirectory();
      /* BLINK CURE (2026-11-22): NO repaint per slice. The old loop
         rebuilt the entire hub (film included) after every offset
         slice — on the slow production API that is a full-page blink
         every few seconds for minutes, restarting the film from 0
         each time (founder's phone report: "the pages keep blinking
         and resetting"). Merges are data-only while the chain walks;
         settlePatch() after the loop settles the counters/labels
         in place. Nothing visible is lost: the feed window shows
         the first PAGE posts (already painted from slice 1) and
         chain posts append beyond it — only counters/labels
         change, and they settle once, per the M4 rule. */
    }
    /* The chain has exited — exhausted, or stalled on a failed slice
       with the cursor standing (the sentinel resumes it). Either way the
       held wall is now the settled set the count surfaces read: the
       Feed door shows the feed's own total, the Testimonies door and
       the rail show the testimonies actually carried and listed —
       one stable number each, no climbing partials (M4 cure). */
    S.chainSettled = true;
    settlePatch(); /* BLINK CURE: settle lands as a patch, never a repaint. */
    S.settlePainted = true; /* render()'s closer must not repaint over it */
  } catch { /* snapshot mode stands, labeled in the UI */ }
}

function buildDirectory() {
  const byId = new Map();
  (S.bakedMembers || []).forEach((m, i) => byId.set(m.id || `evidenced-${i}`, { ...m, id: m.id || null, key: m.id || `evidenced-${i}` }));
  /* Phase 2B live-walk cure (2026-11-22): author evidence is read from
     the UNION of the live-held posts and the baked snapshot, deduped by
     post id — never from the live set alone. The live leg replaces
     S.posts with its first slice (25 posts) and rebuilds this directory
     immediately; an author whose posts sit deeper in the offset chain
     (the founder's "Chico M." user_3ES0… posts, 8 in the baked feed)
     vanished from the directory until — unless — the chain walked far
     enough to re-deliver them, and the chain breaks on any failed
     slice. Live walk counted 112 twice for exactly this reason; the
     baked-mode render is 113. The union makes 113 the floor in every
     mode, from first paint, with post counts over the same union. */
  const evidence = uniqPosts([...S.posts, ...S.testimonies, ...(S.bakedPosts || [])]);
  const counts = new Map();
  for (const p of evidence) if (p.authorId) counts.set(p.authorId, (counts.get(p.authorId) || 0) + 1);
  for (const p of evidence) {
    if (!p.authorId || p.authorId === HOUSE_ID) continue;
    const cur = byId.get(p.authorId) || { id: p.authorId, key: p.authorId, name: p.authorName, avatar: null, verified: false, location: null };
    cur.name = p.authorName || cur.name; cur.avatar = cur.avatar || p.authorAvatar; cur.verified = cur.verified || p.authorVerified;
    cur.location = cur.location || p.authorLocation; cur.postsInPull = counts.get(p.authorId) || 0;
    byId.set(p.authorId, cur);
  }
  /* Directory keying (AMP-UP Phase 2B CP6, 2026-11-22 — supersedes the
     2026-11-19 name-merge for THIS surface): the directory lists one
     card per member ID — every profile the carried directory holds
     (112) renders its own card. The old merge keyed on normalized
     display name, which collapsed two DIFFERENT members who share a
     name (Julie P. ×2, Andrialynn0525 ×2 — separate accounts, separate
     profiles in members.json) into a single card: 110 cards for 112
     profiles. Split-account aggregation still lives where it belongs
     — in personIds(), which merges a person's ids when their PROFILE
     is opened — not in the directory listing. Post counts stay per-id
     (counts map above), matching the card's own profile. */
  const people = [...byId.values()];
  return people.sort((a, b2) => (b2.postsInPull || b2.posts || 0) - (a.postsInPull || a.posts || 0) || String(a.name).localeCompare(String(b2.name)));
}

/* ---------------- frame: rails ---------------- */
function countersLine() {
  const c = S.counters; if (!c) return '';
  /* M4 cure (2026-11-20): the testimonies cell counts the testimonies
     this build carries and lists — the guest wall's served set — once
     the pull settles. The pulse total counts testimonies the guest
     wall never serves (50 over a served 47 on the 2026-11-20 chain
     walk), which is what put 50 over the tape. The pulse definition
     itself is an API-side fix, flagged as a named step in the cure
     record. Members and prayer cells stay pulse: no served-set
     equivalent exists for them. */
  const t = countsSettled() ? S.testimonies.length : '…';
  return `<b>${c.members}</b> members · <b>${t}</b> testimonies<br><b>${c.prayerRequests}</b> prayer requests · <b>${c.prayersLifted}</b> prayers lifted`;
}
/* ---------- RESTORE R-6 — the profile card's stat trio ----------
   The original's signed-in rail card carried a stat trio (study
   §2.3); §4 maps it to the numbers this build truly has — POSTS ·
   TESTIMONIES · PRAYERS LIFTED — computed with the profile page's
   own math over the member's carried record (their carried posts;
   Σ prayerCount over their prayer posts, the prayer-room wall
   included). Zero when the record carries none; never padded.
   Until the counts settle the cells read '…' (never a partial
   that visibly climbs) and settlePatch patches them in place. */
function myTrioCounts() {
  const me = myId(); if (!me) return null;
  const ids = personIds(me);
  const mine = uniqPosts([...S.posts, ...S.testimonies].filter((p) => p.authorId && ids.has(p.authorId)));
  const prayers = uniqPosts([...mine.filter((p) => p.type === 'prayer'), ...S.wallPosts.filter((p) => ids.has(p.authorId))]);
  return {
    posts: mine.length,
    testimonies: mine.filter((p) => p.type === 'testimony').length,
    lifted: prayers.reduce((a, p) => a + (p.prayerCount || 0), 0),
  };
}
function trioCellsHtml() {
  const t = countsSettled() ? myTrioCounts() : null;
  const cell = (key, label) => `<div><b>${t ? t[key] : '…'}</b><span>${label}</span></div>`;
  return `${cell('posts', 'POSTS')}${cell('testimonies', 'TESTIMONIES')}${cell('lifted', 'PRAYERS LIFTED')}`;
}
/* COMMUNITY PASS 2026-11-24 (Part B): the guest card is factored
   out of railHtml so the phone feed can carry the SAME card above
   the timeline (guests only) — one source, two slots. */
function guestCardHtml() {
  return `<div class="panel bk-idcard"><div class="bk-idhead"><span class="bk-ava house">16:3</span><div><span class="eyebrow">JOIN THE FAMILY</span><strong>Welcome home.</strong><small>The family's own wall — read it all as a guest. Posting opens with member sign-in.</small></div></div>
    <div class="bk-countline">${countersLine()}</div>
    <button type="button" class="bk-goldbtn" data-lobbyjoin>SIGN IN</button></div>`;
}
function railHtml() {
  const v = S.view;
  const me = myId();
  const link = (view, glyph, label, extra = '') => `<button type="button" class="bk-rlink ${v === view ? 'on' : ''}" data-view="${view}"><span class="g">${glyph}</span><span>${label}</span>${extra}</button>`;
  const hub = (h, glyph, label) => `<button type="button" class="bk-rlink" data-hubgo="${h}"><span class="g">${glyph}</span><span>${label}</span></button>`;
  const signin = me ? '' : '<em>SIGN-IN</em>';
  let card;
  if (me) {
    const dir = (S.members || []).find((m) => m.id === me) || (S.bakedMembers || []).find((m) => m.id === me);
    const name = dir?.name || 'Family member';
    card = `<div class="panel bk-idcard"><button type="button" class="bk-idme" data-profile="${esc(me)}">${avatarHtml(name, dir?.avatar || null, false)}<span class="bk-idmet"><span class="eyebrow">YOUR CORNER</span><strong>${esc(name)}</strong>${dir?.location ? `<small>${esc(dir.location)}</small>` : ''}</span></button>
    <div class="bk-trio" data-trio>${trioCellsHtml()}</div>
    <div class="bk-countline">${countersLine()}</div></div>`;
  } else {
    card = guestCardHtml();
  }
  return `<aside class="bk-rail">
    ${card}
    <nav class="bk-flatlist" aria-label="Community shortcuts">
      ${link('feed', '⌂', 'Feed')}
      ${hub('pray', '✛', 'Prayer Wall')}
      ${link('testimonies', '✦', 'Testimonies')}
      ${link('groups', '◉', 'Groups &amp; Circles')}
      ${link('members', '◎', 'Find Your People')}
      ${link('messages', '✉', 'Messages', signin)}
      ${link('saved', '⚑', 'Saved Posts', signin)}
      ${hub('give', '✚', 'Give')}
      ${hub('watch', '▶', 'Watch')}
      ${hub('listen', '♪', 'Listen')}
      ${hub('read', '✞', 'Read')}
      ${S.groups.slice(0, 3).map((g) => `<button type="button" class="bk-rlink" data-view="groups"><span class="bk-gcover">${esc(initials(g.name))}</span><span>${esc(g.name)}</span></button>`).join('')}
    </nav>
    <div class="bk-quote"><div class="sc">“</div><p>Church is not just a building. It's who shows up for you when life gets loud.</p><span>THE 16:3 WAY.</span></div>
    <div class="bk-railbot">A PLACE TO BE REAL.<br>A PEOPLE TO BELONG TO.</div>
  </aside>`;
}
/* ---------- amp-up phase 2C-4 — PEOPLE YOU MAY KNOW (§5 ADOPT) ----------
   Ranked from the real member directory (S.members) by REAL signals
   against the SIGNED-IN viewer only: (1) a shared circle — the
   candidate's carried posts carry a groupId the viewer's carried
   posts also carry ("Shares <circle>"); (2) the same location in
   carried data — the candidate's directory/post location matches the
   viewer's ("In <place>"); (3) recently joined — ONLY when a member
   record actually carries createdAt/joinedAt within the last 14 days
   ("New to the family"); the baked directory carries no join date, so
   that signal simply never fires from it (latestAt is post activity
   and is never dressed as a join date). Never an invented mutual
   count. A guest has no viewer record → no signals → no card. Zero
   qualifying candidates → the card does not render. */
const cityOf = (loc) => String(loc || '').split(',')[0].trim().toLowerCase();
function pymkList() {
  const me = myId();
  if (!me) return [];
  const myPosts = [...S.posts, ...S.testimonies].filter((p) => p.authorId && personIds(me).has(p.authorId));
  const myGroups = new Set(myPosts.map((p) => p.groupId).filter(Boolean));
  const myDir = (S.members || []).find((m) => m.id === me);
  const myLoc = myDir?.location || myPosts.find((p) => p.authorLocation)?.authorLocation || '';
  const myCity = cityOf(myLoc);
  const byAuthor = new Map();
  for (const p of [...S.posts, ...S.testimonies]) if (p.authorId && p.groupId && !byAuthor.has(p.authorId)) byAuthor.set(p.authorId, p);
  const out = [];
  for (const m of S.members || []) {
    if (!m.id || m.id === HOUSE_ID || m.id === me || personIds(me).has(m.id)) continue;
    let score = 0, basis = '';
    const candPost = byAuthor.get(m.id);
    if (candPost && myGroups.has(candPost.groupId)) {
      const g = S.groups.find((x) => x.id === candPost.groupId);
      score = 3; basis = `Shares ${g?.name || 'a shared circle'}`;
    } else if (myCity && m.location && cityOf(m.location) === myCity) {
      score = 2; basis = `In ${m.location}`;
    } else {
      const joined = m.createdAt || m.joinedAt || null;
      const jt = joined ? new Date(joined).getTime() : NaN;
      if (isFinite(jt) && Date.now() - jt >= 0 && Date.now() - jt <= 14 * 864e5) { score = 1; basis = 'New to the family'; }
    }
    if (score) out.push({ id: m.id, name: m.name, avatar: m.avatar, basis, score });
  }
  return out.sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name))).slice(0, 3);
}
function pymkHtml() {
  const list = pymkList();
  if (!list.length) return '';
  return `<section class="panel bk-sidecard bk-pymk" data-pymk><div class="phead"><span class="eyebrow">PEOPLE YOU MAY KNOW</span><span style="color:#8d7a4d;font-size:10px;font-weight:900">◎</span></div>
  ${list.map((c) => `<button type="button" class="bk-pymkrow" data-profile="${esc(c.id)}">${avatarHtml(c.name, c.avatar, false)}<span><strong>${esc(c.name)}</strong><small>${esc(c.basis)}</small></span></button>`).join('')}
  <p class="bk-note" style="margin:8px 0 0">Suggested from the family's real directory — the reason is on every card.</p></section>`;
}
/* ---------- RESTORE R-6 — MEMBER SEARCH (right rail, on top) ----------
   The original's right rail carried a Member Search (study §2.6);
   §3 row 11 rules it ORIGINAL-ONLY because the directory search
   already exists — this wires it into the rail. It runs the SAME
   live member search the lobby pill and the members view ride
   (GET /api/community/members/search), shows up to five faces, and
   a live failure falls back to the baked directory filter, labeled
   — the members view's own honesty pattern. The answer patches the
   results box in place (no repaint, no scroll loss — blink law);
   the state rides S.railSearch so any later paint re-renders it. */
function railSearchResultsHtml() {
  const r = S.railSearch;
  if (!r) return '';
  if (r.busy) return '<p class="bk-note" style="margin:10px 0 0">Searching the family…</p>';
  const lab = r.source === 'live' ? 'LIVE FROM THE MEMBER SEARCH' : 'FROM THE DIRECTORY — THE LIVE SEARCH DIDN\'T ANSWER';
  const rows = r.rows.length
    ? r.rows.map((x) => `<button type="button" class="bk-msrow" data-profile="${esc(x.userId)}">${avatarHtml(x.name, x.avatar, x.userId === HOUSE_ID)}<span><strong>${esc(x.name)}</strong>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</span></button>`).join('')
    : '<p class="bk-note" style="margin:0">No member matches that name.</p>';
  return `<div class="bk-mslab">${lab}</div>${rows}<button type="button" class="bk-msdir" data-view="members">OPEN THE FULL DIRECTORY →</button>`;
}
function memberSearchHtml() {
  return `<section class="panel bk-sidecard bk-msearch"><div class="phead"><span class="eyebrow">MEMBER SEARCH</span><span style="color:#8d7a4d;font-size:13px;font-weight:900">⌕</span></div>
  <form class="bk-msform" data-railsearch role="search"><input type="search" placeholder="Search the family by name…" value="${esc(S.railSearchQ)}" aria-label="Search members by name" autocomplete="off"><button type="submit">SEARCH</button></form>
  <div data-railsearchbox>${railSearchResultsHtml()}</div></section>`;
}
/* The in-place landing for a rail-search answer: swap only the
   results box, then wire its rows (paint wires the painted copies;
   a patched copy wires its own, the standing one-liner pattern). */
function patchRailSearch() {
  if (!S.root) return;
  /* COMMUNITY PASS 2026-11-24 (Part B): the phone feed carries a
     second Member Search card — every results box patches in step,
     so the visible copy always answers (desktop still has one). */
  S.root.querySelectorAll('[data-railsearchbox]').forEach((box) => {
    box.innerHTML = railSearchResultsHtml();
    box.querySelectorAll('[data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
    box.querySelectorAll('[data-view]').forEach((n) => n.addEventListener('click', () => { S.view = n.dataset.view; S.gateOpen = false; paint(); window.scrollTo(0, 0); }));
  });
}
/* COMMUNITY PASS 2026-11-24 (Part B): factored out of sideHtml — the phone feed closes with this same Weekly Rotation. */
function rotationHtml() {
  return `<div class="bk-sidelabel"><span class="bk-reddot"></span> ON THE BLOCK</div>
    <section class="panel bk-tape"><div class="small">THE WEEKLY ROTATION <span>VOL. 01</span></div><h3>FAITH HAS<br><em>A SOUND.</em></h3>
      <div class="bk-disc"><div class="bk-dring">16:3</div></div>
      <button type="button" class="bk-track" data-hubgo="pray"><span class="no">01</span><span class="tt"><strong>THE PRAYER ROOM</strong><small>Bring what you carry.</small></span><span class="wv">▂▅▃▇▅▂</span></button>
      <button type="button" class="bk-track" data-view="testimonies"><span class="no">02</span><span class="tt"><strong>STILL STANDING</strong><small>Stories from the family.</small></span><span class="wv">▇▂▄▅▃▆</span></button>
      <button type="button" class="bk-goldbtn" data-hubgo="listen">EXPLORE THE LISTEN HUB ↗</button></section>`;
}
/* COMMUNITY PASS 2026-11-24 (Part B): factored out of sideHtml for the phone feed interleave. */
function prayPanelHtml() {
  return `<section class="panel bk-sidecard bk-praypanel"><div class="phead"><span class="eyebrow">YOUR PEOPLE NEED YOU</span><span class="x">✛</span></div><h3>PRAY WITH<br>SOMEBODY.</h3><p>You don't need the right words. Just show up with an open heart.</p><button type="button" class="bk-goldbtn" data-hubgo="pray">OPEN THE PRAYER WALL ↗</button></section>`;
}
/* COMMUNITY PASS 2026-11-24 (Part B): factored out of sideHtml for the phone feed interleave. */
function familyCodeHtml() {
  return `<section class="panel bk-sidecard bk-code"><div class="phead"><span class="eyebrow">THE FAMILY CODE</span><span style="color:#8d7a4d;font-size:10px;font-weight:900">0163</span></div>
      <p><b>COME AS YOU ARE.</b><br>Protect each other's stories. Pray, don't shame. Listen before you judge. Love people out loud.</p></section>`;
}
function sideHtml() {
  return `<aside class="bk-side">
    ${memberSearchHtml()}
    ${aiHighlightsHtml()}
    ${sceneCardHtml()}
    ${pymkHtml()}
    ${rotationHtml()}
    ${prayPanelHtml()}
    ${latestTestCardHtml()}
    ${suggestedGroupsCardHtml()}
    ${familyCodeHtml()}
    <div class="bk-sidefoot">16:3 FAITH © 2026<br>A DIFFERENT KIND OF SUNDAY. EVERY DAY.</div>
  </aside>`;
}
const CSS7 = `
/* ---------- amp-up phase 2C-3 — PROFILES PARITY (§2 + §8d, 2026-11-22) ---------- */
/* §8d HEADER GRID as ruled: wide cover (200px phone → 320px desktop),
   avatar overlapping it — CENTERED at phone width, LEFT-ALIGNED on
   desktop, both from this one grid. The avatar carries the §4 gold
   ring treatment (static conic gold ring + glow; the animated variant
   stays the stories tray's heartbeat, per §4.3). Below the header the
   page splits Facebook's way on desktop: a details column (About /
   Connections / Photos / Circles) beside the member's own sections
   (About-them / Testimonies / Prayers / Posts). Phone stacks in the
   same order. No animation is introduced here; reduced-motion needs
   nothing extra. */
.bk-profcover{height:200px}
.bk-profbody{padding:0 20px 20px;margin-top:-52px;text-align:center}
.bk-profava{display:inline-grid;place-items:center;border-radius:50%;padding:3px;background:conic-gradient(from 210deg,#d4af37,#ffe9a8,#8a6a24,#f3c34b,#d4af37);box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 22px rgba(212,175,55,.28),0 8px 20px rgba(0,0,0,.5);line-height:0}
.bk-profbody .bk-ava{width:104px;height:104px;font-size:26px;border:3px solid #101010}
.bk-profbody h2{font-size:28px;margin:13px 0 4px}
.bk-profcountsline{margin-top:11px;font-size:13px;color:#cbbd97;letter-spacing:.3px}
.bk-profcountsline b{color:var(--gold);font-size:15px}
.bk-profgrid{display:grid;grid-template-columns:minmax(0,1fr);gap:0 20px;align-items:start}
.bk-friends{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 6px}
.bk .bk-friend{border:1px solid #4b4333;border-radius:10px;padding:12px 8px;background:#181715;text-align:center;cursor:pointer;color:var(--cream);width:100%}
.bk .bk-friend:hover{border-color:var(--gold)}
.bk-friend .bk-ava{width:52px;height:52px;font-size:15px;margin:0 auto 8px}
.bk-friend strong{display:block;font-size:11.5px;line-height:1.35}
.bk-friend small{display:block;color:#a69a84;font-size:9.5px;margin-top:3px;line-height:1.4}
.bk-photos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:0 0 6px}
.bk-photos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;border:1px solid rgba(212,175,55,.35);display:block;background:#201a13}
@media(min-width:881px){
 .bk-profcover{height:320px}
 .bk-profbody{margin-top:-64px;text-align:left;padding:0 26px 22px}
 .bk-profbody .bk-ava{width:128px;height:128px;font-size:32px}
 .bk-profbody h2{font-size:32px}
 .bk-profgrid{grid-template-columns:300px minmax(0,1fr)}
}
`;

const CSS8 = `
/* ---------- amp-up phase 2C-4 — STICKINESS + TUNING (2026-11-22) ---------- */
/* STORIES VIEWER (§8c OPS SPEC): fixed full-screen stage over the wall.
   Motion is opacity/transform only; the progress fill is a transform
   scaleX (never a width animation). Reduced motion: no auto-advance
   (tap-only, enforced in JS) and no transitions. */
.bk-viewer{position:fixed;inset:0;z-index:90;background:rgba(5,4,2,.94);display:flex;flex-direction:column;color:var(--cream)}
.bk-vsegs{display:flex;gap:5px;padding:14px 14px 0}
.bk-vseg{flex:1;height:3px;border-radius:2px;background:rgba(212,175,55,.28);overflow:hidden}
.bk-vseg i{display:block;height:100%;background:#f3c34b;transform:scaleX(0);transform-origin:left}
.bk-vseg.done i{transform:scaleX(1)}
.bk-vhead{display:flex;align-items:center;gap:10px;padding:12px 14px}
.bk-vhead .bk-ava{width:38px;height:38px}
.bk-vhead b{font-size:14px}
.bk-vhead small{display:block;color:#a69a84;font-size:10.5px}
.bk-vclose{margin-left:auto;background:none;border:1px solid rgba(212,175,55,.5);color:var(--gold);border-radius:50%;width:34px;height:34px;font-size:15px;cursor:pointer;flex:none}
.bk-vstage{flex:1;position:relative;display:flex;flex-direction:column;justify-content:center;padding:10px 26px;max-width:640px;width:100%;margin:0 auto;box-sizing:border-box}
.bk-vkind{font-size:10px;letter-spacing:1.6px;color:var(--gold);font-weight:900;margin-bottom:12px}
.bk-vbody{font-size:19px;line-height:1.55;font-family:Georgia,serif}
.bk-vstage img.bk-postimg{margin-top:16px}
.bk-vzone{position:absolute;top:0;bottom:0;width:32%;background:none;border:0;cursor:pointer;padding:0}
.bk-vzone.prev{left:0}.bk-vzone.next{right:0;width:68%}
.bk-vfoot{padding:14px;display:flex;justify-content:center}
.bk-vprof{border:1px solid rgba(212,175,55,.6);background:#241b08;color:var(--gold);border-radius:30px;padding:10px 18px;font-weight:900;letter-spacing:.8px;font-size:11px;cursor:pointer}
/* NEW-POSTS PILL (§5 ADAPT): gold, sticky under the feed head; it
   exists in the DOM only as a hidden slot until a real re-read lands
   newer posts — it never renders on a timer or a guess. */
.bk-newpill{position:sticky;top:8px;z-index:6;display:flex;justify-content:center;pointer-events:none;margin:0 0 4px}
.bk-newpill[hidden]{display:none}
.bk-newpill button{pointer-events:auto;border:1px solid #ffd76a;background:linear-gradient(180deg,#8a6a24,#6d551f);color:#ffe9a8;border-radius:30px;padding:9px 18px;font-weight:900;letter-spacing:.8px;font-size:11.5px;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.55)}
/* PYMK (§5 ADOPT): right-rail card + phone in-thread/below-feed rides. */
.bk-pymk .bk-pymkrow{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid #2c2820;padding:10px 0;cursor:pointer;color:var(--cream)}
.bk-pymk .bk-pymkrow:last-child{border-bottom:0}
.bk-pymkrow .bk-ava{width:42px;height:42px;flex:none}
.bk-pymkrow strong{display:block;font-size:12.5px}
.bk-pymkrow small{display:block;color:var(--gold);font-size:10.5px;margin-top:2px}
/* DELETE-OWN-POST (fold-in 1): quiet gold text button on own cards. */
.bk-delpost{margin-left:auto;background:none;border:1px solid #4b4333;border-radius:20px;color:#cbbd97;font-size:9px;font-weight:900;letter-spacing:.8px;padding:5px 9px;cursor:pointer;flex:none}
.bk-delpost:hover{border-color:#ff7a5c;color:#ff9a86}
.bk-delconfirm{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bk-delconfirm button{border-radius:20px;padding:7px 13px;font-size:10px;font-weight:900;letter-spacing:.6px;cursor:pointer}
.bk-del-yes{background:#a02c1e;border:1px solid #ff7a5c;color:#ffe9e2}
.bk-del-no{background:none;border:1px solid #4b4333;color:#cbbd97}
@media(prefers-reduced-motion:reduce){.bk-viewer{transition:none}}
`;

const CSS9 = `
/* ---------- COMMUNITY RESTORE R-1 + R-2 (2026-11-23) — THE LOBBY TOP,
   THE PULSE CARD, THE PILLS + SORT. Fresh code in the ORIGINAL site's
   shapes (study ORIGINAL-COMMUNITY-STUDY-2026-11-23 §1/§4): the
   Community opens as one continuous lobby again — film moment, gold
   JOIN treatment, the search pill with the tagline inside it, and the
   bordered Cinzel COMMUNITY PULSE card as the wall's first card —
   then the in-wall filter pills + NEW/TOP sort over the real wall. */
/* LOBBY: the film slot is the hero now. The action row overlaps the
   film's lower edge exactly as the original's JOIN overlay did; the
   film element itself is never touched (blink law). */
.bk-lobby{position:relative}
.bk-lobby-actions{display:flex;gap:10px;align-items:stretch;margin:-27px 14px 0;position:relative;z-index:3}
.bk button.bk-joinbtn{flex:1;background:linear-gradient(180deg,#ffe083,#f5b52c 55%,#d79219);color:#241a05;border:0;border-radius:10px;padding:15px 18px;font-weight:900;letter-spacing:1.6px;font-size:14px;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;gap:9px}
.bk button.bk-joinbtn:hover{filter:brightness(1.06)}
.bk button.bk-lobbyprof{width:50px;height:50px;border-radius:50%;border:2px solid rgba(243,195,75,.85);background:#141310;color:var(--gold);display:grid;place-items:center;cursor:pointer;flex:none;overflow:hidden;padding:0;font-size:17px;box-shadow:0 10px 24px rgba(0,0,0,.5)}
.bk button.bk-lobbyprof .bk-ava{width:100%;height:100%;border:0;border-radius:50%}
.bk button.bk-lobbyghost{margin:10px 14px 0;width:calc(100% - 28px);background:rgba(10,9,7,.78);border:1px solid rgba(243,195,75,.55);color:var(--cream);border-radius:10px;padding:13px 18px;font-weight:900;letter-spacing:1.6px;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}
.bk button.bk-lobbyghost:hover{border-color:var(--gold);color:var(--gold)}
/* SEARCH PILL: one object — search + the tagline inside it, as the
   original carried it. Submit routes to the directory search; the
   ASK chip focuses the shell's Faith Answers bar. */
.bk-searchpill{display:flex;align-items:center;gap:11px;margin:16px 0 0;border:1px solid rgba(243,195,75,.65);border-radius:12px;padding:11px 14px;background:rgba(16,14,10,.88)}
.bk-sp-ic{color:var(--gold);font-size:16px;flex:none}
.bk-searchpill input{flex:1;min-width:0;background:none;border:0;color:var(--cream);font:inherit;font-size:12.5px;letter-spacing:1.4px;outline:none}
.bk-searchpill input::placeholder{color:#a89d8a}
.bk-sp-tag{font-family:Georgia,serif;font-size:12.5px;color:#e9d9ae;text-align:right;line-height:1.35;flex:none;max-width:46%}
.bk button.bk-sp-ask{flex:none;border:1px solid rgba(243,195,75,.6);background:#241b08;color:var(--gold);border-radius:20px;padding:6px 11px;font-size:9.5px;font-weight:900;letter-spacing:1px;cursor:pointer}
.bk button.bk-sp-ask:hover{background:#33270f}
@media(max-width:560px){.bk-sp-tag{font-size:11px}.bk-searchpill{gap:8px;padding:10px 11px}}
/* PULSE CARD: bordered, Cinzel label, gold dot, four real counters,
   the original's footer line. The rail countline stays as it was. */
.bk-pulse{margin:16px 0 0;border:1px solid rgba(201,169,97,.55);border-radius:14px;background:linear-gradient(180deg,#12100c,#0c0b09);padding:16px 18px 13px;box-shadow:0 6px 32px rgba(201,169,97,.10)}
.bk-pulse-head{display:flex;align-items:center;gap:9px}
.bk-pulse-head h3{font-family:Cinzel,Georgia,serif;font-size:12px;letter-spacing:2.6px;color:#f3dfb2;font-weight:700;margin:0}
.bk-pulse-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);flex:none;animation:bk-pulsebeat 2.2s ease-in-out infinite}
@keyframes bk-pulsebeat{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(243,195,75,.45)}50%{opacity:.65;box-shadow:0 0 0 6px rgba(243,195,75,0)}}
.bk-pulse-nums{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px;text-align:center}
.bk-pulse-cell b{display:block;font-size:21px;color:var(--cream);font-family:Georgia,serif;font-weight:700}
.bk-pulse-cell span{display:block;font-size:8.5px;letter-spacing:1.5px;color:#b3a37e;font-weight:900;margin-top:3px}
.bk-pulse-foot{text-align:center;font-size:9.5px;letter-spacing:2.2px;color:#9a8a63;margin:14px 0 0;font-weight:900}
@media(max-width:560px){.bk-pulse-cell b{font-size:17px}.bk-pulse-cell span{font-size:7.5px;letter-spacing:1px}}
/* PILLS + SORT (R-2): round gold pills in the original's row shape;
   the active pill is gold-filled; NEW/TOP rides as a segmented
   control at the row's end. */
.bk-pills{display:flex;align-items:center;gap:7px;overflow-x:auto;white-space:nowrap;padding:2px 0 12px;border-bottom:1px solid #3b3528;margin-bottom:18px;scrollbar-width:none}
.bk-pills::-webkit-scrollbar{display:none}
.bk .bk-pills>button{border:1px solid #4a4231;background:#171510;color:#c9bfa9;border-radius:30px;padding:8px 14px;font-size:10px;font-weight:900;letter-spacing:1.2px;cursor:pointer;flex:none}
.bk .bk-pills>button:hover{border-color:var(--gold);color:var(--gold)}
.bk .bk-pills>button.on{background:linear-gradient(180deg,#ffe083,#e9b83c);color:#241a05;border-color:#ffe083}
.bk-sortseg{margin-left:auto;display:flex;border:1px solid #4a4231;border-radius:30px;overflow:hidden;flex:none}
.bk .bk-sortseg button{background:#12100d;color:#a89d8a;border:0;padding:8px 13px;font-size:10px;font-weight:900;letter-spacing:1.2px;cursor:pointer}
.bk .bk-sortseg button.on{background:#33270f;color:var(--gold)}
@media(prefers-reduced-motion:reduce){.bk-pulse-dot{animation:none}}
`;
const CSS10 = `
/* ---------- COMMUNITY RESTORE R-3 (2026-11-23) — CARD DRESSING.
   Wall cards take the ORIGINAL's rendered spec (study §1.8 + §3
   row 9): gold border at 35%, a gold-tinted shadow, type-coded
   left borders (prayer purple / testimony amber), the system-kind
   badge row for house posts, and the prayer-count strip on prayer
   posts. Layered last so it dresses the card without touching the
   2C mechanics underneath; Presents cards keep their stronger 2px
   gold frame (their CSS5 rules sit at higher specificity). */
.bk-card{border:1px solid rgba(212,175,55,.35);box-shadow:0 6px 32px rgba(212,175,55,.14),0 15px 30px rgba(0,0,0,.35)}
.bk-card.prayer{border-left:4px solid #7a5fd0}
.bk-card.testimony{border-left:4px solid #d79219}
/* System-kind badge row: the house series, read off the post's own
   carried systemKind (sysBadge in postCard). */
.bk-sysrow{display:flex;margin:0 0 12px}
.bk-sysbadge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(212,175,55,.5);background:rgba(212,175,55,.09);color:#ecd28a;border-radius:20px;padding:4px 11px;font-size:9px;font-weight:900;letter-spacing:1.8px}
/* Prayer-count strip: the original's strip on prayer posts — the
   post's real prayerCount, and the tap IS the card's Amen (same
   data-act wiring, same server truth). Styled as .bk button.<class>
   per the R-1+R-2 specificity lesson (.bk button reset). */
.bk button.bk-praystrip{display:flex;width:100%;align-items:center;justify-content:center;gap:8px;margin:14px 0 0;border:0;border-top:1px solid rgba(122,95,208,.35);border-bottom:1px solid rgba(122,95,208,.35);background:linear-gradient(180deg,rgba(122,95,208,.13),rgba(122,95,208,.06));color:#cdbcf5;padding:10px 14px;font-size:11.5px;font-weight:700;letter-spacing:.4px;cursor:pointer;text-align:center}
.bk button.bk-praystrip:hover{background:linear-gradient(180deg,rgba(122,95,208,.2),rgba(122,95,208,.1));color:#e2d7fb}
.bk button.bk-praystrip.mine{color:#f3c34b;box-shadow:inset 0 0 0 1px rgba(243,195,75,.4)}
`;
const CSS11 = `
/* ---------- COMMUNITY RESTORE R-4 (2026-11-23) — PRESENTS CLOSE.
   The wall's end takes the ORIGINAL's page close (study §1.9 + §3
   row 14 + §4 R-4): the PRESENTS manifesto in large caps, the house
   link column, and Proverbs 16:3 in italic serif — above the shell
   footer. Static paint-string HTML (closeHtml, appended in viewFeed
   after belowFeedHtml): chain merges and settlePatch never touch
   it, so the close can neither blink nor duplicate. The fresh build
   loads no condensed webfont, so the manifesto rides Georgia in the
   R-1 fallback pattern. */
.bk-close{margin:34px 0 6px;border-top:1px solid rgba(212,175,55,.35);padding:30px 18px 10px;text-align:center}
.bk-close .bk-closeeb{font-size:10px;font-weight:900;letter-spacing:3.4px;color:var(--gold)}
.bk-closemani{font-family:Georgia,serif;font-size:clamp(19px,5.4vw,27px);line-height:1.38;letter-spacing:1.2px;color:var(--cream);margin:14px auto 0;max-width:560px;text-transform:uppercase}
.bk-closecol{margin:26px auto 0;max-width:520px}
.bk-closecol .bk-closehead{font-size:9px;font-weight:900;letter-spacing:3px;color:#9a8a63;margin-bottom:12px}
.bk-closelinks{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;text-align:left}
.bk button.bk-closelink{background:none;border:0;border-bottom:1px solid rgba(212,175,55,.14);color:#d8cdb2;font:inherit;font-size:12.5px;letter-spacing:.6px;padding:9px 2px;cursor:pointer;text-align:left}
.bk button.bk-closelink:hover{color:var(--gold);border-bottom-color:rgba(212,175,55,.5)}
.bk-closeverse{font-family:Georgia,serif;font-style:italic;font-size:14.5px;line-height:1.6;color:#e9d9ae;margin:28px auto 0;max-width:480px}
.bk-closeverse .bk-closeattr{display:block;font-style:normal;font-size:9px;font-weight:900;letter-spacing:2.6px;color:#9a8a63;margin-top:8px}
.bk-closelegal{font-size:9px;letter-spacing:1.6px;color:#716b62;margin-top:22px}
`;
const CSS12 = `
/* ---------- COMMUNITY RESTORE R-5 (2026-11-23) — COMPOSER FAB.
   The original's floating gold composer FAB (study §2.4 item 4 +
   §3 row 6 + §4 R-5): 56px, spring-in, opens the EXISTING composer
   in a slide-up sheet (members) or JOIN (guests). Placement is the
   wall's lower-LEFT corner — a named deviation from the study's
   bottom-right: the shell's FaithGuide host permanently owns
   bottom-right on every hub (shell.css #faithguide, z-65; its
   bubble + panel expand upward from that corner), so a FAB there
   would collide with the button, the bubble, or the open panel.
   Bottom offsets mirror FaithGuide's own formula exactly, so the
   FAB and the sheet clear the phone bottom bar and rise above the
   player dock whenever body.player-on reserves it. The FAB and
   scrim are persistent elements (mounted once, carried over paints
   by reference — the blink cure's film pattern); only classes move.
   The sheet is a class on the existing #bk-composer: the node, its
   type map, its send wiring and the guest gate are untouched. */
.bk-fab{position:fixed;left:16px;bottom:calc(var(--bottombar-h) + 16px);z-index:64;width:56px;height:56px;border-radius:50%;border:1px solid #ffe083;background:linear-gradient(145deg,#ffe083,#f5b52c 55%,#d79219);color:#241a05;font-size:24px;line-height:1;display:grid;place-items:center;cursor:pointer;box-shadow:0 12px 30px rgba(0,0,0,.65),0 0 18px rgba(212,175,55,.35);animation:bk-fab-in .45s cubic-bezier(.34,1.56,.64,1) both;transition:opacity .18s ease,transform .18s ease}
.bk-fab:hover{box-shadow:0 12px 30px rgba(0,0,0,.65),0 0 28px rgba(212,175,55,.55)}
.bk-fab.off{opacity:0;pointer-events:none;transform:scale(.55)}
body.player-on .bk-fab{bottom:calc(var(--bottombar-h) + var(--player-h) + 20px)}
@media(min-width:861px){.bk-fab{left:24px;bottom:24px}body.player-on .bk-fab{bottom:calc(var(--player-h) + 28px)}}
@keyframes bk-fab-in{from{opacity:0;transform:scale(.35)}to{opacity:1;transform:scale(1)}}
.bk-scrim{position:fixed;inset:0;z-index:79;background:rgba(3,2,1,.68);opacity:1;transition:opacity .2s ease}
.bk-scrim.off{opacity:0;pointer-events:none}
.bk .bk-composer.bk-sheet{position:fixed;left:10px;right:10px;bottom:calc(var(--bottombar-h) + 10px);z-index:80;margin:0;max-height:min(74vh,580px);overflow-y:auto;box-shadow:0 30px 80px rgba(0,0,0,.8),0 0 0 1px rgba(212,175,55,.35);animation:bk-sheet-up .3s cubic-bezier(.2,.9,.25,1) both}
body.player-on .bk .bk-composer.bk-sheet{bottom:calc(var(--bottombar-h) + var(--player-h) + 12px)}
@media(min-width:861px){.bk .bk-composer.bk-sheet{left:50%;right:auto;width:min(620px,calc(100vw - 40px));transform:translateX(-50%);bottom:24px}body.player-on .bk .bk-composer.bk-sheet{bottom:calc(var(--player-h) + 26px)}}
@keyframes bk-sheet-up{from{transform:translateY(26px);opacity:.4}to{transform:translateY(0);opacity:1}}
@media(min-width:861px){@keyframes bk-sheet-up{from{transform:translateX(-50%) translateY(26px);opacity:.4}to{transform:translateX(-50%) translateY(0);opacity:1}}}
.bk-sheetx{position:absolute;top:8px;right:10px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(212,175,55,.5);background:rgba(10,9,6,.85);color:var(--gold);font-size:14px;line-height:1;display:grid;place-items:center;cursor:pointer;z-index:2}
.bk-sheetx:hover{border-color:var(--gold);color:#ffe083}
@media(prefers-reduced-motion:reduce){.bk-fab{animation:none;transition:none}.bk-scrim{transition:none}.bk .bk-composer.bk-sheet{animation:none}}
`;
const CSS13 = `
/* ---------- COMMUNITY RESTORE R-6 (2026-11-23) — RAILS TO FULL.
   Left rail (study §2.3 + §4 R-6): the shortcut list goes FLAT
   Facebook-style — 36px round icon chips, 14px labels, NO section
   headers — and the profile card carries the stat trio under a
   36px gold-ring avatar. Right rail (§2.6 + §4): the Member Search
   card on top, its results patched in place. No new animation;
   the rails' independent scroll is CSS5's standing rule. */
.bk-flatlist{margin-top:20px;display:flex;flex-direction:column;gap:2px}
.bk-rail .bk-rlink{font-size:14px;font-weight:700;padding:8px 10px;border-radius:8px;gap:11px}
.bk-rail .bk-rlink .g{width:36px;height:36px;border-radius:50%;background:rgba(212,175,55,.10);border:1px solid rgba(212,175,55,.38);display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:#d8ba72;flex:none}
.bk-rail .bk-rlink.on .g{background:rgba(212,175,55,.22);border-color:var(--gold);color:var(--gold)}
.bk-rail .bk-rlink .bk-gcover{width:36px;height:36px;border-radius:9px;font-size:12px;flex:none}
.bk-idcard .bk-ava{width:36px;height:36px;font-size:11px;border:2px solid rgba(212,175,55,.65);box-shadow:0 0 10px rgba(212,175,55,.25)}
.bk-idme{display:flex;gap:10px;align-items:center;width:100%;text-align:left;padding:0}
.bk-idmet{display:block;min-width:0}
.bk-idmet strong{display:block;font-size:14px;margin:3px 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bk-idmet small{display:block;font-size:10px;color:#948c7f;line-height:1.5}
.bk-trio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:13px;border-top:1px solid #302c25;padding-top:11px;text-align:center}
.bk-trio b{display:block;color:var(--gold);font-size:15px}
.bk-trio span{display:block;font-size:8px;letter-spacing:.5px;line-height:1.55;color:#8b8476;font-weight:900}
.bk-msearch{margin-top:0}
.bk-msform{display:flex;gap:7px;margin-top:11px}
.bk-msform input{flex:1;min-width:0;background:#201e1b;border:1px solid #5b4a28;border-radius:20px;padding:9px 13px;color:var(--cream);font-size:12.5px;outline:none}
.bk-msform input:focus{border-color:var(--gold)}
.bk-msform button{flex:none;border:1px solid #765921;border-radius:20px;padding:9px 13px;color:var(--gold);font-size:9.5px;font-weight:900;letter-spacing:.6px;cursor:pointer;background:transparent}
.bk-msform button:hover{background:#312411}
.bk-mslab{font-size:8.5px;letter-spacing:1.6px;color:#8d7a4d;font-weight:900;margin:11px 0 3px}
.bk-msrow{display:flex;gap:9px;align-items:center;width:100%;padding:7px 6px;text-align:left;border-radius:8px;color:var(--cream)}
.bk-msrow:hover{background:#1c1914}
.bk-msrow .bk-ava{width:32px;height:32px;font-size:10px}
.bk-msrow strong{display:block;font-size:12.5px;line-height:1.3}
.bk-msrow small{display:block;color:#a69a84;font-size:10px;line-height:1.4}
.bk-msdir{margin-top:9px;font-size:9.5px;font-weight:900;letter-spacing:1px;color:var(--gold);padding:4px 6px}
`;
const CSS14 = `
/* ---------- R-6 FOUNDER FOLDS (2026-11-23 18:43 + 18:47 MST).
   Avatar cure: the profile banner (.bk-profcover) is positioned
   (position:relative in the dressing layer) while .bk-profbody —
   pulled up over the banner by its negative margin — was static,
   so the banner painted OVER the avatar's top arc and the circle
   read as clipped by the banner's lower edge. The body is now
   positioned with z-index, so the avatar renders as a COMPLETE
   circle on top of the banner, gold ring intact (profile only —
   these classes exist nowhere else). Endless scroll: the sentinel
   is a hairline marker, no furniture — the LOAD MORE block is
   retired, and with it the mid-wall clutter the founder named. */
.bk-profbody{position:relative;z-index:2}
.bk-sentinel{height:2px}
`;
const CSS15 = `
/* ---------- R-6 FOUNDER FOLDS D/E/F (2026-11-23 19:09 MST).
   D — POSTS GLOW: every post card rests on a warm candle edge
   (a static gold outer glow — no perpetual animation, no paint
   cost); a FRESH post (the member's own, just landed) carries
   .bk-fresh: one 6s settle from a strong warm glow down to the
   resting edge, in its type's color — gold for a post, amber
   for a testimony, soft white-gold for a prayer request. */
.bk-card{box-shadow:0 0 0 1px rgba(212,175,55,.25),0 0 18px rgba(212,175,55,.10),0 6px 24px rgba(0,0,0,.55)}
.bk-card.testimony{box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 20px rgba(215,146,25,.13),0 6px 24px rgba(0,0,0,.55)}
.bk-card.prayer{box-shadow:0 0 0 1px rgba(212,175,55,.25),0 0 18px rgba(240,228,190,.10),0 6px 24px rgba(0,0,0,.55)}
@keyframes bk-glowsettle{0%{box-shadow:0 0 0 2px rgba(212,175,55,.85),0 0 55px rgba(212,175,55,.55),0 0 120px rgba(212,175,55,.30),0 6px 24px rgba(0,0,0,.55)}100%{box-shadow:0 0 0 1px rgba(212,175,55,.25),0 0 18px rgba(212,175,55,.10),0 6px 24px rgba(0,0,0,.55)}}
@keyframes bk-glowsettle-test{0%{box-shadow:0 0 0 2px rgba(215,146,25,.9),0 0 55px rgba(215,146,25,.55),0 0 120px rgba(215,146,25,.30),0 6px 24px rgba(0,0,0,.55)}100%{box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 20px rgba(215,146,25,.13),0 6px 24px rgba(0,0,0,.55)}}
@keyframes bk-glowsettle-pray{0%{box-shadow:0 0 0 2px rgba(240,228,190,.9),0 0 55px rgba(240,228,190,.5),0 0 120px rgba(240,228,190,.28),0 6px 24px rgba(0,0,0,.55)}100%{box-shadow:0 0 0 1px rgba(212,175,55,.25),0 0 18px rgba(240,228,190,.10),0 6px 24px rgba(0,0,0,.55)}}
.bk-card.bk-fresh{animation:bk-glowsettle 6s ease-out 1 both}
.bk-card.testimony.bk-fresh{animation-name:bk-glowsettle-test}
.bk-card.prayer.bk-fresh{animation-name:bk-glowsettle-pray}
/* E — BIBLE SCENE ART: the wall's section break (filter-keyed)
   and the right rail's Pentecost identity card. Art dresses the
   hub's breaks only — it never enters the feed list. */
.bk-scenebreak{margin:0 0 16px;border:1px solid rgba(212,175,55,.55);border-radius:12px;overflow:hidden;position:relative;background:#0a0805}
.bk-scenebreak img{width:100%;height:150px;object-fit:cover;display:block}
.bk-scenebreak figcaption{position:absolute;left:10px;bottom:8px;font-size:8.5px;letter-spacing:1.6px;color:#e8d9ac;font-weight:900;background:rgba(10,8,4,.62);padding:4px 8px;border-radius:4px}
.bk-scenecard{overflow:hidden}
.bk-scenecard img{width:100%;height:118px;object-fit:cover;display:block}
.bk-scenecard .bk-scenebody{padding:12px 14px 14px}
.bk-scenecard p{margin:6px 0 0;color:#a69a84;font-size:11.5px;line-height:1.55}
/* F — THE BEAT: the cross scene holds the film frame on entry.
   One opacity fade dismisses it (tap · scroll · 3.4s) — the film
   element is never touched, and state keeps it gone all visit. */
.bk-herowrap{position:relative}
.bk-beat{position:absolute;inset:0;z-index:6;overflow:hidden;opacity:1;transition:opacity .7s ease;cursor:pointer}
.bk-beat.gone{opacity:0;visibility:hidden;pointer-events:none}
.bk-beat img{width:100%;height:100%;object-fit:cover;display:block}
.bk-beat .bk-beatcap{position:absolute;left:12px;bottom:10px;font-size:9px;letter-spacing:1.8px;color:#e8d9ac;font-weight:900;background:rgba(10,8,4,.62);padding:5px 9px;border-radius:4px}
.bk-beat .bk-beathint{position:absolute;right:12px;bottom:10px;font-size:9px;letter-spacing:1.8px;color:#0a0805;font-weight:900;background:rgba(212,175,55,.92);padding:5px 9px;border-radius:4px}
@media(prefers-reduced-motion:reduce){.bk-card.bk-fresh{animation:none}.bk-beat{transition:none}}
`;
const CSS16 = `
/* ---------- R-7 — PHONE TAB BAR + STORY RINGS (2026-11-23).
   TAB BAR: the original's phone chrome, inside Community only.
   The bar takes the shell bottom bar's own band while this hub
   is mounted: exactly var(--bottombar-h) tall at bottom:0,
   z-index 63 — above the shell bar (60), below the composer
   FAB (64) and FaithGuide (65). Every standing phone offset
   already clears that band by its own margin (the FAB's and
   FaithGuide's bottom edges sit at bottombar + 16, the
   player's at bottombar + 8), so nothing moves and no shell
   file is touched. Shown at phone width only (≤768px); the
   node is mount-once, re-appended per paint (the FAB pattern),
   and leaves with the root on hub switch. */
.bk-tabbar{display:none}
@media(max-width:768px){
 .bk-tabbar{display:flex;position:fixed;left:0;right:0;bottom:0;height:var(--bottombar-h);z-index:63;background:rgba(5,5,5,.96);border-top:1px solid rgba(212,175,55,.45);backdrop-filter:blur(8px)}
 .bk-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:none;border:0;cursor:pointer;color:#8a8474;font-size:10px;letter-spacing:.08em;text-transform:uppercase;padding:4px 0 0;font-family:inherit}
 .bk-tab .bk-tab-ico{font-size:17px;line-height:1;color:#a4832f}
 .bk-tab.on{color:#ffe9a8}
 .bk-tab.on .bk-tab-ico{color:var(--gold)}
}
/* STORY RINGS — the tray face goes round (study §3 row 5):
   the member tray trades its rectangular cards for the
   original's columns — a 56px round avatar in the standing
   .bk-ring (its conic gold gradient is the ring; .viewed is
   the muted ring), the name at 11px under it, the kind as a
   gold micro-line. The viewer and the viewed machinery are
   untouched; only storiesHtml's member face + this layer
   change. Guest door cards are doors, not stories — their
   grid face stands. */
.bk-stories.member .bk-story{flex:0 0 72px;width:72px;height:auto;min-width:0;padding:2px 0 0;background:none;border:0;border-radius:0;overflow:visible;flex-direction:column;align-items:center;text-align:center}
.bk-stories.member .bk-story:before{display:none}
.bk-stories.member .bk-story:hover{transform:none}
.bk-stories.member .bk-ring{padding:2px}
.bk-stories.member .bk-ring .bk-ava{width:56px;height:56px;font-size:17px}
.bk-storycol-name{display:block;margin-top:6px;font-size:11px;font-weight:700;color:var(--cream);line-height:1.15;max-width:72px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bk-storycol-kind{display:block;margin-top:2px;font-size:7.5px;letter-spacing:1.2px;color:#c3a158;font-weight:900;white-space:nowrap}
.bk-yoursdisc{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:#161512;color:var(--gold);font-size:24px;font-weight:900;line-height:1}
`;
const CSS17 = `
/* ---------- PROFILES ALIVE (2026-11-23) — member profile pass.
   Founder: "Make the personal profiles awesome!" / "I don't like
   the stale look." The cover banner comes alive: the cover art
   rides an inner layer (.bk-profcovimg, overscanned so its edges
   never show) on a slow transform drift, a deep gradient settles
   it into the page, and a gold glow breathes over the top —
   transform/opacity only. The avatar's complete gold-ring circle
   (CSS14 cure + .bk-profava) is NOT touched. Below the header,
   the member's own content rides three honest tabs — POSTS ·
   TESTIMONIES · PRAYERS — each rendering only what the carried
   record holds for that member, with real counts on the tabs. */
.bk-profcover{overflow:hidden}
.bk-profcovimg{position:absolute;inset:-30px;background-size:cover;background-position:center;animation:bk-covdrift 38s ease-in-out infinite alternate;will-change:transform}
@keyframes bk-covdrift{from{transform:scale(1.05) translate(0,0)}to{transform:scale(1.13) translate(-1.8%,1.6%)}}
.bk-profgrad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.10) 0%,rgba(5,5,5,0) 42%,rgba(16,16,16,.38) 100%);pointer-events:none}
.bk-profglow{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,rgba(212,175,55,.22),transparent 55%);opacity:.4;animation:bk-covbreathe 9s ease-in-out infinite alternate;pointer-events:none}
@keyframes bk-covbreathe{from{opacity:.28}to{opacity:.58}}
.bk-profcovnote{z-index:2}
.bk-proftabs{margin-top:2px}
.bk-tabrow{display:flex;gap:4px;border-bottom:1px solid #353027;margin-bottom:14px;overflow-x:auto}
.bk-ptab{flex:1;background:none;border:0;border-bottom:2px solid transparent;color:#a69a84;font:inherit;font-size:11px;font-weight:900;letter-spacing:1.2px;padding:11px 6px 9px;cursor:pointer;white-space:nowrap;text-transform:uppercase;margin-bottom:-1px}
.bk-ptab b{color:var(--gold);font-size:12.5px}
.bk-ptab:hover{color:var(--cream)}
.bk-ptab.on{color:var(--cream);border-bottom-color:var(--gold)}
.bk-ppanel[hidden]{display:none}
@media(prefers-reduced-motion:reduce){.bk-profcovimg,.bk-profglow{animation:none}}
`;
const CSS18 = `
/* ---------- COMMUNITY PASS 2026-11-24 — PRESENTS SOUND SWITCH +
   PHONE REFLOW (founder 17:57 + 18:01 MST) ----------
   Part A: the gold feed-sound button rides every Presents stage —
   42px, above the tap layer (z 4); the end/fail overlays sit at
   z 3, so the ended/failed card states hide it explicitly. Part B:
   phone (≤768px) REFLOWS, never compresses — the new in-thread
   rail slots (.bk-phone) wake only there, the guest join card and
   the Weekly Rotation take their feed positions, the column gains
   real side padding, and the shortcut strip's chips become
   full-size targets with readable type. Above 768px every wrapper
   here is display:none and the desktop grid never sees these
   rules. */
.bk .bk-pv-snd{position:absolute;right:10px;bottom:10px;z-index:4;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(10,8,4,.78);border:2px solid rgba(212,175,55,.85);color:#f3c34b;cursor:pointer;box-shadow:0 0 18px rgba(212,175,55,.25);padding:0}
.bk .bk-pv-snd svg{width:21px;height:21px;display:block}
.bk .bk-pv-snd .ic-on{display:none}
.bk .bk-pv-snd.on .ic-on{display:block}
.bk .bk-pv-snd.on .ic-off{display:none}
.bk .bk-pv-snd:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.bk-pv-card.ended .bk-pv-snd,.bk-pv-card.failed .bk-pv-snd{display:none}
.bk-inthread.bk-phone{display:none}
.bk-phonejoin,.bk-phonerot{display:none}
@media(max-width:768px){
 .bk-inthread.bk-phone{display:block}
 .bk-phonejoin{display:block;margin:2px 0 16px}
 .bk-phonerot{display:block;margin-top:18px}
 .bk-main{padding-inline:14px}
 .bk-stripchip{min-height:40px;padding:10px 14px;font-size:12px;display:inline-flex;align-items:center}
}
`;
function frame(mainHtml) {
  return `<style>${CSS}${CSS2}${CSS3}${CSS4}${CSS5}${CSS6}${CSS7}${CSS8}${CSS9}${CSS10}${CSS11}${CSS12}${CSS13}${CSS14}${CSS15}${CSS16}${CSS17}${CSS18}</style><div class="bk"><div class="bk-shell">${railHtml()}<div class="bk-main">${mainHtml}</div>${sideHtml()}</div></div>`;
}


/* ---------------- amp-up phase 1 (2026-11-22) ---------------- */
/* P1-8: AI cover dressing — generated gold-on-black art bands for
   profiles with no real cover. Abstract light / dove / olive / glass /
   hands / dawn art only: never a person, never a stand-in for a real
   photo, cover, or product shot. Assigned deterministically per member. */
const AI_COVERS = [
  'assets/img/community/covers/cover-rivers.webp',
  'assets/img/community/covers/cover-dove.webp',
  'assets/img/community/covers/cover-olive.webp',
  'assets/img/community/covers/cover-glass.webp',
  'assets/img/community/covers/cover-hands.webp',
  'assets/img/community/covers/cover-dawn.webp',
];
const aiCoverFor = (key) => { let h = 0; for (const c of String(key || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AI_COVERS[h % AI_COVERS.length]; };

/* G-3 (amp-up phase 2B): generated cover art for the 7 real groups —
   one shared gold-on-black church system, a distinct motif per group
   (consult ruling (b)), keyed by the group's real name. A group with
   no mapped art keeps its monogram — art never invents a group. */
const GROUP_ART = {
  'Women of Faith': 'assets/img/community/groups/group-women.webp',
  'Men of Faith': 'assets/img/community/groups/group-men.webp',
  'Testimonies & Encouragement': 'assets/img/community/groups/group-testimonies.webp',
  'New to the Faith': 'assets/img/community/groups/group-new.webp',
  'Worship & New Music': 'assets/img/community/groups/group-worship.webp',
  'Bible Study & Discussion': 'assets/img/community/groups/group-bible.webp',
  'Prayer Warriors': 'assets/img/community/groups/group-prayer.webp',
};

/* P1-AI-1 themes: the most repeated content words (4+ letters, function
   words removed) across the wall's own real post bodies. A word rises
   only when the family actually wrote it at least twice. */
const THEME_STOP = new Set('the,and,for,with,that,this,have,from,will,your,yours,they,them,then,than,when,what,were,been,over,under,more,most,also,just,like,into,about,after,before,there,their,its,our,ours,who,which,while,where,being,has,had,not,but,all,any,can,could,would,should,now,out,one,two,get,got,her,him,his,she,was,are,you,me,my,we,he,it,in,on,at,to,of,an,is,am,be,do,does,did,so,if,or,as,by,up,down,off,too,very,really,going,come,came,see,saw,know,make,made,take,took,way,even,still,back,much,many,well,first,day,days,week,year,time,times,life,live,lives,lived,living,im,ive,dont,cant,thats,whats,been,being,there,here,were,werent,isnt,arent,didnt,doesnt,wont,hes,shes,youre,theyre,lets,lets,gets,keep,keeps,went,gone,said,says,thing,things,people,person,man,woman,men,women,good,great,big,small,long,high,low,old,young,right,left,last,next,every,other,another,same,own,off,per,via,unto,thee,thou,thy,yea,ye'.split(','));
function wallThemes(n = 3) {
  const counts = new Map();
  for (const p of [...S.testimonies, ...S.posts]) {
    for (const w of String(p.body || '').toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/)) {
      const word = w.replace(/^'+|'+$/g, '');
      if (word.length < 4 || THEME_STOP.has(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

/* P1-AI-1: FaithGuide "AI Highlights" — a labeled AI welcome card that
   summarizes ONLY the real carried wall (counts, newest voice, the
   words the family itself repeats). No invented posts, people, or
   counts; while the wall is still loading it says exactly that. */
function aiHighlightsHtml() {
  const head = `<span class="bk-ailabel">✦ FAITHGUIDE · AI HIGHLIGHTS</span>`;
  const note = `<span class="bk-ainote">POWERED BY AI · SUMMARIZES THE REAL WALL ONLY — NOTHING INVENTED</span>`;
  if (!countsSettled()) return `<section class="bk-aicard">${head}<p>FaithGuide is reading the wall…</p>${note}</section>`;
  const all = uniqPosts([...S.posts, ...S.testimonies]).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const latest = all[0];
  const prayers = S.posts.filter((p) => p.type === 'prayer').length;
  const themes = wallThemes(3);
  return `<section class="bk-aicard">${head}
    <p>Welcome home. The wall is carrying <b>${S.posts.length + S.testimonies.length} posts</b> — <b>${S.testimonies.length} testimonies</b> and <b>${prayers} prayer requests</b> among them.${themes.length ? ` Words rising in the family's own posts: <b>${themes.map(esc).join(', ')}</b>.` : ''}${latest ? ` Newest voice: <b>${esc(latest.authorName)}</b>, ${relTime(latest.createdAt)}.` : ''}</p>${note}</section>`;
}

/* P1-10: latest testimonies — the real newest testimony posts. */
function latestTestCardHtml() {
  const list = uniqPosts(S.testimonies).slice(0, 3);
  return `<section class="panel bk-sidecard"><div class="phead"><span class="eyebrow">LATEST TESTIMONIES</span><span class="x">✦</span></div>
    ${list.length ? list.map((p) => `<button type="button" class="bk-mini" data-view="testimonies">${avatarHtml(p.authorName, p.authorAvatar, p.authorId === HOUSE_ID)}<span class="mi"><strong>${esc(p.authorName)}</strong><small>${esc(p.body.slice(0, 90))}${p.body.length > 90 ? '…' : ''} · ${relTime(p.createdAt)}</small></span></button>`).join('') : '<p class="bk-note" style="margin:8px 0 0">The testimony tape is still loading — an unloaded tape never reads as an empty one.</p>'}
    <button type="button" class="bk-textlink" data-view="testimonies">READ THE TESTIMONY TAPE ↗</button></section>`;
}
/* P1-10: suggested groups — the real 7, with their real member counts. */
function suggestedGroupsCardHtml() {
  return `<section class="panel bk-sidecard"><div class="phead"><span class="eyebrow">FIND YOUR CIRCLE</span><span class="x">✦</span></div>
      ${S.groups.slice(0, 4).map((g) => `<button type="button" class="bk-mini" data-view="groups"><span class="bk-gcover">${esc(initials(g.name))}</span><span class="mi"><strong>${esc(g.name)}</strong><small>${g.memberCount} member${g.memberCount === 1 ? '' : 's'} · ${g.isPublic === false ? 'Private' : 'Public'} group</small></span><span class="plus">+</span></button>`).join('')}
      <button type="button" class="bk-textlink" data-view="groups">EXPLORE ALL GROUPS ↗</button></section>`;
}
/* P1-9: phone shortcut strip — the hub's doors as a horizontal strip
   above the feed where the rails collapse away (the 7 real groups ride
   as chips). Desktop keeps the full rails; CSS shows this ≤880px. */
function stripHtml() {
  const chip = (view, label) => `<button type="button" class="bk-stripchip ${S.view === view ? 'on' : ''}" data-view="${view}">${label}</button>`;
  /* 2C-1 §1 (390px re-slot): the left rail's essence as a shortcut
     strip — Sanctuary · Directory · Circles · Pray, doors to the same
     destinations the rail links open (Pray rides the shell hub route,
     exactly like the rail's Prayer Wall link). The rail's Testimonies
     door and the real group chips ride after, as in Phase 1. */
  return `<nav class="bk-shortstrip" aria-label="Community shortcuts">
    ${chip('feed', '⌂ Sanctuary')}${chip('members', '◎ Directory')}${chip('groups', '◉ Circles')}<button type="button" class="bk-stripchip" data-hubgo="pray">✛ Pray</button>${chip('testimonies', '✦ Testimonies')}
    ${S.groups.map((g) => `<button type="button" class="bk-stripchip grp" data-view="groups">${esc(g.name)}</button>`).join('')}
  </nav>`;
}
/* COMMUNITY PASS 2026-11-24 (Part B): phone-only feed furniture,
   standing OUTSIDE the append-only card list so endless growth can
   never duplicate or strand them — the guest Welcome-home card
   above the timeline (guests only; a member's corner rides the
   rail) and the Weekly Rotation closing the feed at the bottom.
   Both wrappers are display:none above 768px, where the rails
   carry the same cards. */
function phoneJoinHtml() {
  return myId() ? '' : `<div class="bk-phonejoin">${guestCardHtml()}</div>`;
}
function phoneRotationHtml() {
  return `<div class="bk-phonerot">${rotationHtml()}</div>`;
}
/* P1-9: on phone/narrow widths the right rail's content stacks BELOW
   the feed instead of disappearing. CSS shows this ≤1240px, where the
   rail itself is display:none. */
function belowFeedHtml() {
  return `<div class="bk-feedbelow">${aiHighlightsHtml()}${pymkHtml()}${latestTestCardHtml()}${suggestedGroupsCardHtml()}</div>`;
}

/* ---------------- doors ---------------- */
function viewDoors() {
  const c = S.counters || {};
  /* Door counts (2026-11-19 cure): the doors paint before loadLive
     settles, and the count lines used to be computed straight off the
     empty state — "0 POSTS CARRIED · 0 TESTIMONIES · 0 GROUPS LIVE"
     rendered as if they were real totals until the repaint landed
     (and forever, if a baked fetch hung). A count now renders only
     when real data backs it: the pulse/counters object, or the loaded
     carried lists. Unloaded renders the loading glyph — never a
     false 0. */
  /* M4 cure (2026-11-20): the Feed door carries the FEED's own total —
     the posts the feed holds and scrolls down through endlessly.
     Testimonies carry their own door and their own count (the
     testimonies actually listed on the tape), so the doors no longer
     disagree with the views behind them (388 door vs 344 feed; 50
     header vs 44 listed). Both render only once the pull settles:
     while the live chain runs they read the loading glyph, never a
     climbing partial. */
  const postsCnt = countsSettled() ? `${S.posts.length} POSTS CARRIED` : '… POSTS CARRIED';
  const testCnt = countsSettled() ? `${S.testimonies.length} TESTIMONIES` : '… TESTIMONIES';
  const membCnt = c.members != null ? `${c.members} MEMBERS` : '… MEMBERS';
  const grpCnt = S.loaded ? `${S.groups.length} GROUPS LIVE` : '… GROUPS LIVE';
  const door = (view, art, no, title, text, cnt) => `
    <button type="button" class="bk-door" data-view="${view}" data-t0>
      <img class="art" src="assets/img/community/${art}" alt="" aria-hidden="true"><span class="shade"></span>
      <span class="in"><span class="no">${no}</span><h3>${title}</h3><p>${text}</p><span class="cnt">${cnt}</span></span>
    </button>`;
  return `<div class="bk-doorhero"><img src="assets/img/community/doors-hero.webp" alt="The doors of the house opening into golden light as a family walks in">
      <div><span class="eyebrow">COMMUNITY · THE SANCTUARY</span><h1>The family <em>talks here.</em></h1>
      <p>The Sanctuary — the 16:3 Faith wall. Real posts, real people, real testimonies: read everything, get to know the family, and when member sign-in joins this house, post like home.</p></div></div>
    <div class="bk-doors">
      ${door('feed', 'poster-community.svg', 'DOOR 01', 'The Feed', 'The family wall — every post in the order it was shared.', postsCnt)}
      ${door('testimonies', 'poster-testimony.svg', 'DOOR 02', 'Testimonies', 'What God has done, in the family\'s own words — its own tape.', testCnt)}
      ${door('members', 'poster-community.svg', 'DOOR 03', 'Find Your People', 'The family directory — real members, real profiles.', membCnt)}
      ${door('groups', 'poster-prayer.svg', 'DOOR 04', 'Groups & Circles', 'The small circles of the house — the real, live group list.', grpCnt)}
      <button type="button" class="bk-door gated" data-view="messages"><span class="shade"></span><span class="in"><span class="no">DOOR 05</span><h3>Messages</h3><p>Member to member. The message routes are live on the API and gated to accounts — honestly closed to guests, never simulated.</p><span class="cnt">SIGN-IN OPENS THIS DOOR</span></span></button>
      <button type="button" class="bk-door gated" data-view="saved"><span class="shade"></span><span class="in"><span class="no">DOOR 06</span><h3>Saved Posts</h3><p>Your bookmarks live in your member account — nothing is saved on this device or faked here.</p><span class="cnt">SIGN-IN OPENS THIS DOOR</span></span></button>
    </div>`;
}

/* ---------------- feed pieces ---------------- */
function heroHtml() {
  return `<section class="bk-hero reveal"><div class="bk-herographics"><span class="bk-herogrid"></span><span class="bk-herotape">THE BLOCK · THE FAMILY WALL</span><img src="assets/img/community/feed-header.webp" alt="The family around a shared table outside the church in golden evening light"></div>
    <div class="bk-heroc"><div class="bk-heroeb"><span class="bk-sq"></span>16:3 PRESENTS <b>///</b> THE SANCTUARY</div>
    <h1>FAITH GOT<br><span>A FEED.</span></h1><p>More than followers. More like family.<br>Real stories, real prayer, real people.</p>
    <div class="bk-herobot"><button type="button" class="bk-redbtn" data-composefocus>PULL UP &amp; POST <span>↗</span></button><span>THIS IS YOUR CORNER OF THE INTERNET.</span></div></div>
    <span class="bk-herostamp">COME AS YOU ARE ✳</span></section>
  <div class="bk-secline"><span>THE COMMUNITY / 001</span><span>REAL PEOPLE. NO PERFECT STORIES.</span></div>`;
}

/* ---------------- COMMUNITY RESTORE R-1 + R-2 (2026-11-23) ----------------
   The lobby top, in the original's shapes (study §1/§4), fresh code:
   the hub film IS the hero moment now — the cassette hero above
   (heroHtml) no longer opens the feed view. Guests get the gold
   JOIN THE FAMILY treatment (the shell's real join route — never a
   fake CTA); members get SHARE YOUR HEART into the composer they
   already own. Under the film: ENTER THE LOBBY, then the gold
   search pill with the tagline inside it, then the COMMUNITY PULSE
   card as the wall's first card. Nothing here needs data the API
   doesn't carry; the film mute toggle the original wore is NOT
   restored — the hub film is shell-ambient and muted by design, and
   a toggle that cannot unmute would lie. */
/* FOLD F (2026-11-23, founder): the cross scene is the lobby
   hero's face (the film's poster) and, on each fresh hub entry,
   its BEAT — the full-bleed scene holding the film frame until
   the reader taps, scrolls, or 3.4 seconds pass. Reduced-motion
   entries skip the beat; the poster still gives them the scene. */
function beatReduced() {
  return (window.FaithFilm && window.FaithFilm.reduced) || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
}
function beatHtml() {
  if (S.beatGone || beatReduced()) return '';
  return `<div class="bk-beat" data-beat role="img" aria-label="Jesus carrying the cross"><img src="assets/img/community/scene-jesus-cross.webp" alt=""><span class="bk-beatcap">JESUS, CARRYING THE CROSS</span><span class="bk-beathint">TAP OR SCROLL TO ENTER</span></div>`;
}
let beatTimer = null;
function dismissBeat() {
  if (S.beatGone) return;
  S.beatGone = true;
  if (beatTimer) { clearTimeout(beatTimer); beatTimer = null; }
  const b = S.root?.querySelector('[data-beat]');
  if (b) b.classList.add('gone');
}
function armBeat() {
  const b = S.root?.querySelector('[data-beat]');
  if (!b || S.beatGone) return;
  b.addEventListener('click', dismissBeat);
  window.addEventListener('scroll', dismissBeat, { once: true, passive: true });
  const main = S.root.querySelector('.bk-main');
  if (main) main.addEventListener('scroll', dismissBeat, { once: true, passive: true });
  if (beatTimer) clearTimeout(beatTimer);
  beatTimer = setTimeout(dismissBeat, 3400);
}
function lobbyHtml() {
  const film = window.FaithFilm ? window.FaithFilm.slotHtml({ src: 'assets/video/film-community.mp4', poster: 'assets/img/community/scene-jesus-cross.webp', title: 'The family, moving.', note: 'Community film · first movement' }) : '';
  const member = isSignedIn();
  let cu = null; try { cu = window.Clerk?.user || null; } catch { /* guest chrome */ }
  const prof = member
    ? `<button type="button" class="bk-lobbyprof" data-lobbyprofile aria-label="Your profile">${avatarHtml(cu?.fullName || cu?.firstName || 'You', cu?.imageUrl || null, false)}</button>`
    : `<button type="button" class="bk-lobbyprof" data-lobbyjoin aria-label="Join the family">✚</button>`;
  return `<div class="bk-lobby"><div class="bk-herowrap">${film}${beatHtml()}</div>
    <div class="bk-lobby-actions">
      ${member
        ? '<button type="button" class="bk-joinbtn" data-composefocus>♡ SHARE YOUR HEART <span aria-hidden="true">→</span></button>'
        : '<button type="button" class="bk-joinbtn" data-lobbyjoin>♡ JOIN THE FAMILY <span aria-hidden="true">→</span></button>'}
      ${prof}
    </div>
    <button type="button" class="bk-lobbyghost" data-lobbyenter>ENTER THE LOBBY <span aria-hidden="true">→</span></button>
  </div>
  ${searchPillHtml()}
  ${pulseCardHtml()}`;
}
/* The search pill: search and slogan are ONE object, as the original
   carried them. Submitting runs the directory's own live member
   search (the members view's flow, same endpoint, same results);
   the ASK chip routes to Faith Answers, which stays shell-wide. */
function searchPillHtml() {
  return `<form class="bk-searchpill" data-lobbysearch role="search">
    <span class="bk-sp-ic" aria-hidden="true">⌕</span>
    <input type="search" placeholder="SEARCH" aria-label="Search the family by name" autocomplete="off">
    <span class="bk-sp-tag">More than a platform — a family.</span>
    <button type="button" class="bk-sp-ask" data-askfaith>✦ ASK</button>
  </form>`;
}
/* The PULSE card's numbers, from the same sources the rail countline
   reads — pulse counters for members/requests/lifted, and the
   testimonies cell under the standing M4 honesty rule (the served
   set's count once the pull settles; null → the '…' glyph before).
   Nothing is invented to fill the card. */
function pulseVals() {
  const c = S.counters; if (!c) return null;
  return {
    members: typeof c.members === 'number' ? c.members : null,
    lifted: typeof c.prayersLifted === 'number' ? c.prayersLifted : null,
    stories: countsSettled() ? S.testimonies.length : null,
    requests: typeof c.prayerRequests === 'number' ? c.prayerRequests : null,
  };
}
function pulseCardHtml() {
  const v = pulseVals();
  const cell = (key, label) => `<div class="bk-pulse-cell"><b data-pulse="${key}">${v && v[key] != null ? v[key] : '…'}</b><span>${label}</span></div>`;
  return `<section class="bk-pulse" aria-label="Community pulse">
    <div class="bk-pulse-head"><span class="bk-pulse-dot" aria-hidden="true"></span><h3>COMMUNITY PULSE</h3></div>
    <div class="bk-pulse-nums">${cell('members', 'MEMBERS')}${cell('lifted', 'PRAYERS LIFTED')}${cell('stories', 'TESTIMONIES')}${cell('requests', 'PRAYER REQUESTS')}</div>
    <p class="bk-pulse-foot">— REAL PEOPLE | REAL PRAYER | REAL CHANGE —</p>
  </section>`;
}
/* Count-up (the original animated its counters): an ease-out rAF
   over the number CELLS' text only — no repaint, no layout — run
   once per hub visit, on the first paint whose counters are real.
   Reduced motion (or any later paint) renders the finals standing
   in the HTML already. settlePatch lands the finals in place via
   patchPulse and cancels any in-flight count-up by token. */
let pulseCounted = false, pulseAnim = 0;
function wirePulseCountUp() {
  if (!S.root) return;
  const els = S.root.querySelectorAll('[data-pulse]');
  if (!els.length) return;
  const v = pulseVals(); if (!v) return;
  const reduced = (window.FaithFilm && window.FaithFilm.reduced) || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) { pulseCounted = true; return; }
  if (pulseCounted) return;
  const targets = [...els].filter((el) => typeof v[el.dataset.pulse] === 'number');
  if (!targets.length) return;
  const token = ++pulseAnim, t0 = performance.now(), dur = 900;
  const step = (t) => {
    if (token !== pulseAnim) return;
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    for (const el of targets) { if (el.isConnected) el.textContent = String(Math.round(v[el.dataset.pulse] * e)); }
    if (k < 1) requestAnimationFrame(step); else pulseCounted = true;
  };
  requestAnimationFrame(step);
}
function patchPulse() {
  if (!S.root) return;
  const v = pulseVals(); if (!v) return;
  pulseAnim++; pulseCounted = true;
  S.root.querySelectorAll('[data-pulse]').forEach((el) => {
    const val = v[el.dataset.pulse];
    el.textContent = val == null ? '…' : String(val);
  });
}
/* R-2: the in-wall pills + NEW/TOP sort, in the original's row
   shape, over the wall's real kinds only. Excluded by data (named
   in the build record, never faked): Prayer Chains, Urgent, and
   the member scope tabs — the community API carries no chains,
   urgency, or scope. SAVED rides for members only, onto the real
   saved view; a guest's saved posts don't exist to filter. */
function pillsHtml() {
  const f = S.feedFilter, s = S.feedSort;
  const pill = (val, label) => `<button type="button" data-feedfilter="${val}" class="${f === val ? 'on' : ''}" aria-pressed="${f === val}">${label}</button>`;
  return `<div class="bk-pills" role="group" aria-label="Filter the wall">
      ${pill('all', 'ALL')}${pill('watch', 'WATCH')}${pill('general', 'GENERAL')}${pill('testimony', 'TESTIMONIES')}${pill('prayer', 'PRAYERS')}${isSignedIn() ? '<button type="button" data-view="saved">SAVED</button>' : ''}
      <span class="bk-sortseg" role="group" aria-label="Sort the wall"><button type="button" data-feedsort="new" class="${s === 'new' ? 'on' : ''}" aria-pressed="${s === 'new'}">NEW</button><button type="button" data-feedsort="top" class="${s === 'top' ? 'on' : ''}" aria-pressed="${s === 'top'}">TOP</button></span>
    </div>`;
}
/* 2C-1 §4.3: story viewed state — client-side, per session, written
   ONLY by a real story open (the tap that opens the member's profile
   from their story card). Nothing is pre-marked, nothing is inferred
   from the data: a member nobody opened keeps the animated ring. */
function viewedStories() {
  if (!S._viewedStories) {
    S._viewedStories = new Set();
    try { (JSON.parse(sessionStorage.getItem('bk-viewed-stories') || '[]') || []).forEach((id) => S._viewedStories.add(id)); } catch { /* private mode: in-memory only */ }
  }
  return S._viewedStories;
}
function markStoryViewed(id) {
  if (!id) return;
  const set = viewedStories(); set.add(id);
  try { sessionStorage.setItem('bk-viewed-stories', JSON.stringify([...set])); } catch { /* in-memory stands */ }
}
/* 2C-4 §8c: the story set — the tray's own data, one story per member,
   their latest real post, newest first, capped at the tray's 7. The
   viewer opens THIS set; no story exists without a real post behind it. */
function storySet() {
  const seen = new Map();
  const all = uniqPosts([...S.testimonies, ...S.posts])
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  for (const p of all) {
    if (!p.authorId || seen.has(p.authorId)) continue;
    seen.set(p.authorId, p);
    if (seen.size >= 7) break;
  }
  return [...seen.values()];
}
function storiesHtml() {
  /* P1-2 (amp-up 2026-11-22): the stories row carries MEMBERS now — the
     family's most recent voices, newest first, one card per person,
     built from their real latest post/testimony. A slot exists only
     where a real member's content backs it; nothing is filled with a
     fake person. "Your Story" stays first as the composer shortcut.
     Before the wall loads (or if it ever carried nobody), the original
     house cards stand — labeled house doors, not people. */
  const seen = new Map(storySet().map((p) => [p.authorId, p]));
  const yours = `<button type="button" class="bk-story bk-story-start" data-story="yours"><span class="bk-story-plus">+</span><strong>YOUR STORY</strong><small>LET IT OUT</small></button>`;
  /* R-7 (study §3 row 5): in the member tray the face goes ROUND —
     the original's columns: a 56px avatar in the standing gold
     ring, the name at 11px under it, the kind as a micro-line
     (PRAYER REQUEST shortens to PRAYER at this scale; the viewer
     carries the full label). The excerpt leaves the tray face —
     the full text lives in the viewer, which is untouched, as
     are data-storyopen / data-profile / data-ring, so every
     existing wire (viewer open, in-place viewed flip) stands. */
  const yoursCol = `<button type="button" class="bk-story bk-storycol" data-story="yours"><span class="bk-ring"><span class="bk-yoursdisc">+</span></span><span class="bk-storycol-name">Your story</span><span class="bk-storycol-kind">LET IT OUT</span></button>`;
  const memberCards = [...seen.values()].map((p) => `
    <button type="button" class="bk-story bk-storycol" data-profile="${esc(p.authorId)}" data-storyopen="${esc(p.authorId)}"><span class="bk-ring ${viewedStories().has(p.authorId) ? 'viewed' : ''}" data-ring="${esc(p.authorId)}">${avatarHtml(p.authorName, p.authorAvatar, p.authorId === HOUSE_ID)}</span><span class="bk-storycol-name">${esc(p.authorName)}</span><span class="bk-storycol-kind">${p.type === 'testimony' ? '✦ TESTIMONY' : p.type === 'prayer' ? '✛ PRAYER' : '✎ POST'}</span></button>`).join('');
  const houseCards = `
    <button type="button" class="bk-story bk-story-prayer" data-hubgo="pray"><span class="bk-story-mono">✛</span><span class="bk-story-label">THE PRAYER<br>ROOM</span><span class="bk-story-foot">LEAVE IT HERE <b>↗</b></span></button>
    <button type="button" class="bk-story bk-story-test" data-view="testimonies"><span class="bk-story-mono">✦</span><span class="bk-story-label">GRACE HAS<br>A STORY</span><span class="bk-story-foot">TESTIMONIES <b>↗</b></span></button>
    <button type="button" class="bk-story bk-story-comm" data-view="members"><span class="bk-story-mono">♡</span><span class="bk-story-label">YOU<br>BELONG.</span><span class="bk-story-foot">FIND YOUR PEOPLE <b>↗</b></span></button>`;
  return `<div class="bk-sechead"><div><span class="eyebrow">VOICES FROM THE BLOCK</span><h2>The stories <em>keep going.</em></h2></div><button type="button" class="bk-alltest" data-view="testimonies">ALL TESTIMONIES ›</button></div>
  <div class="bk-stories${memberCards ? ' member' : ''}">${memberCards ? yoursCol + memberCards : yours + houseCards}</div>`;
}
const COMPOSE_TYPES = {
  post: { icon: '✎', label: 'POST', pill: "What's on your heart today?", gate: '<b>Posting opens with your 16:3 Faith account.</b> Join free or sign in (top right) and this box becomes yours — the wall stays open to read either way. Nothing about browsing is locked.' },
  testimony: { icon: '✦', label: 'TESTIMONY', pill: 'Share what God has done…', gate: '<b>Testimonies are shared from member accounts.</b> Join free or sign in (top right) and your testimony posts straight to the Testimony Tape. Until then, read the family\'s testimonies — every one is real and carried word for word.' },
  prayer: { icon: '✛', label: 'PRAYER REQUEST', pill: 'What should the family pray over?', gate: '<b>Prayer requests are posted from member accounts.</b> Join free or sign in (top right) and your request lands on the wall with its own praying count. The Prayer Wall in the Pray hub is open to read right now.', prayBtn: true },
};
/* DEFECT 4 cure (2026-11-22, found by the F-CLERK backend proof with
   live evidence): the composer's UI type "post" is NOT in the
   production API's create schema — POST /api/community/posts accepts
   only testimony / prayer / general, and a live {type:"post"} create
   returned HTTP 400 while {type:"general"} with the same body
   returned 201. The UI keeps its own labels; the WIRE type is mapped
   here, at the one place the composer submits. (Pray hub's create
   already sends "prayer"; comments send no type; reactions are a
   different field and unaffected.) */
const COMPOSE_API_TYPE = { post: 'general', testimony: 'testimony', prayer: 'prayer' };
function composerHtml() {
  const t = COMPOSE_TYPES[S.composeType];
  const tools = `<div class="bk-comp-tools"><span>DROP SOMETHING REAL.</span><div>${Object.entries(COMPOSE_TYPES).map(([k, v]) => `<button type="button" data-composetype="${k}" class="${S.composeType === k ? 'sel' : ''}">${v.icon} <span>${v.label}</span></button>`).join('')}</div></div>`;
  /* F-CLERK: a signed-in member gets the real composer — a textarea and
     a share button wired in paint() to POST /api/community/posts. The
     guest pill + gate panel below stay exactly as they were. */
  if (isSignedIn()) {
    return `<section class="panel bk-composer" id="bk-composer"><div class="bk-comp-main"><span class="bk-ava you">YOU</span><form class="bk-comp-form" data-composer><textarea class="bk-comp-input" data-composer-input rows="2" maxlength="20000" placeholder="${esc(t.pill)}" aria-label="Write your post"></textarea></form></div>
    ${tools}
    <p class="bk-comp-status" data-composer-status${S.composerFlash ? '' : ' hidden'}>${S.composerFlash || ''}</p>
    <div class="bk-comp-sendrow"><button type="button" class="bk-goldbtn bk-compsend" data-composersend>SHARE IT WITH THE FAMILY</button></div></section>`;
  }
  return `<section class="panel bk-composer" id="bk-composer"><div class="bk-comp-main"><span class="bk-ava you">YOU</span><button type="button" class="bk-comp-pill" data-gate>${esc(t.pill)}</button></div>
    ${tools}
    <div class="bk-gate ${S.gateOpen ? 'open' : ''}" data-gatepanel>${t.gate}${t.prayBtn ? '<div class="row"><button type="button" class="bk-gbtn" data-hubgo="pray">OPEN THE PRAYER WALL ↗</button></div>' : ''}</div></section>`;
}
function feedList() {
  /* R-2 (2026-11-23): the pill set rides the wall's REAL kinds —
     'general' is every carried post that is neither prayer nor
     testimony (the API's own general type + any legacy 'post');
     'watch' is not a post list at all (viewFeed renders the Presents
     shelf alone for it), so it reads empty here and the load-more
     logic stays out of it. TOP sorts a COPY by the family's real
     response — reaction total + prayers + comments — newest first
     on ties; NEW is the wall's own order, untouched. */
  let list;
  if (S.feedFilter === 'prayer') list = S.posts.filter((p) => p.type === 'prayer');
  else if (S.feedFilter === 'testimony') list = S.testimonies;
  else if (S.feedFilter === 'general') list = S.posts.filter((p) => p.type !== 'prayer');
  else if (S.feedFilter === 'watch') list = [];
  else list = S.posts;
  if (S.feedSort === 'top' && list.length > 1) {
    const eng = (p) => rxTotal(p) + (p.prayerCount || 0) + (p.commentCount || 0);
    list = [...list].sort((a, b) => eng(b) - eng(a) || String(b.createdAt).localeCompare(String(a.createdAt)));
  }
  return list;
}
/* ---------- COMMUNITY RESTORE R-3 (2026-11-23) — system-kind badges.
   The original dressed house posts with a kind badge row (study
   §2.5: 📖 Verse of the Day · 🙌 Testimony Tuesday · 🔥 What God Did
   This Week). The kind is REAL carried data (systemKind on the post;
   census in the R-3 record) — the badge renders only for a system
   post or a house author carrying a kind, and an unmapped kind
   humanizes from its own string. Nothing is inferred from body text. */
const SYS_KINDS = {
  verse_of_day: ['📖', 'VERSE OF THE DAY'],
  testimony_tuesday: ['🙌', 'TESTIMONY TUESDAY'],
  what_god_did_this_week: ['🔥', 'WHAT GOD DID THIS WEEK'],
  what_god_did: ['🔥', 'WHAT GOD DID THIS WEEK'],
  monday_prayer_kickoff: ['✛', 'MONDAY PRAYER KICKOFF'],
  sunday_gathering: ['✦', 'SUNDAY GATHERING'],
};
const HOUSE_IDS = new Set([HOUSE_ID, 'system_163faith']);
function sysBadge(p) {
  if (!p.systemKind) return '';
  if (!p.isSystemPost && !HOUSE_IDS.has(p.authorId)) return '';
  const hit = SYS_KINDS[p.systemKind];
  const g = hit ? hit[0] : '✦';
  const l = hit ? hit[1] : String(p.systemKind).replace(/_/g, ' ').toUpperCase();
  return `<div class="bk-sysrow"><span class="bk-sysbadge">${g} ${l}</span></div>`;
}
function postCard(p, inProfile = false) {
  const rx = p.reactionCounts || {};
  const total = rxTotal(p);
  const praying = p.type === 'prayer' ? (p.prayerCount || 0) : (rx.pray || 0);
  /* P1-3 (amp-up 2026-11-22): the five real reaction kinds render as
     their own chips with their real counts — the family's response
     reads as life on the card, not a summary statistic. */
  const RX_KINDS = [['amen', '♥', 'Amen'], ['love', '❤', 'Love'], ['pray', '✛', 'Pray'], ['fire', '🔥', 'Fire'], ['blessing', '✦', 'Blessing']];
  /* 2C-1 §4.4: each kind renders in its own saturated color (.bk-rx-*);
     the member's own reacted kind (.mine, from the react response's
     myReactionType — the LEG R truth source) glows. Counts unchanged. */
  const rxChips = RX_KINDS.filter(([k]) => rx[k]).map(([k, g, l]) => `<span class="bk-rx bk-rx-${k}${p.myReactionType === k ? ' mine' : ''}"><span class="k">${g} ${l}</span> ${rx[k]}</span>`).join('');
  const metaBits = [];
  if (praying && p.type === 'prayer') metaBits.push(`✛ ${praying} praying`);
  const tag = p.type === 'testimony' ? '<span class="bk-tag test">✦ TESTIMONY</span>'
    : p.type === 'prayer' ? `<span class="bk-tag">✛ PRAYER REQUEST${p.isAnswered ? ' · ANSWERED ✓' : ''}</span>`
    : p.isPinned ? '<span class="bk-tag pin">PINNED</span>' : '';
  const long = p.body.length > 420;
  const body = long && !inProfile ? esc(p.body.slice(0, 420)).trimEnd() + '…' : linkify(p.body);
  const media = (p.media || []).map((m) => m?.url ? `<img class="bk-postimg" src="${esc(m.url)}" alt="" loading="lazy">` : '').join('');
  /* R-3: the prayer-count strip (study §4) — the post's own real
     prayerCount, and the tap is the card's Amen itself (data-act=
     "amen": wirePosts runs the same memberReact / guest gate as the
     AMEN button; repaintCard re-renders the count from the server's
     merged response — never counted client-side). */
  const prayStrip = p.type === 'prayer' ? `<button type="button" class="bk-praystrip${p.myReactionType === 'amen' ? ' mine' : ''}" data-act="amen"><span>✛ ${praying ? `${praying} prayed for this` : 'Be the first to pray for this'} — tap Amen to agree</span></button>` : '';
  return `<article class="bk-card ${p.type === 'testimony' ? 'testimony' : ''}${p.type === 'prayer' ? ' prayer' : ''}${S.freshGlow && S.freshGlow.id === p.id && Date.now() - S.freshGlow.at < 9000 ? ' bk-fresh' : ''}" data-post="${esc(p.id)}">
    <div class="bk-postbody">${sysBadge(p)}<div class="bk-posthead">
      <span data-profile="${esc(p.authorId || '')}" style="cursor:pointer">${avatarHtml(p.authorName, p.authorAvatar, p.authorId === HOUSE_ID)}</span>
      <div class="bk-pid"><b data-profile="${esc(p.authorId || '')}">${esc(p.authorName)}${p.authorVerified ? ' <span class="bk-ver">✦</span>' : ''}</b>
      <small>${relTime(p.createdAt)}${p.authorLocation ? ' · ' + esc(p.authorLocation) : ''}</small></div>${tag}${isOwnPost(p) ? '<button type="button" class="bk-delpost" data-delpost aria-label="Delete your post">DELETE</button>' : ''}</div>
      <p class="bk-posttext">${body}</p>${long && !inProfile ? '<button type="button" class="bk-seemore" data-seemore>See more</button>' : ''}
    </div>${media}${prayStrip}
    <div class="bk-postmeta"><span class="amen">${total ? `<span class="bk-rxchips">${rxChips}</span>${metaBits.length ? ' · ' + metaBits.join(' · ') : ''}` : (metaBits.length ? metaBits.join(' · ') : (isSignedIn() ? 'Be the first to say Amen' : 'Be the first to say Amen — reactions open with sign-in'))}</span><span>${p.commentCount} comment${p.commentCount === 1 ? '' : 's'} · ${p.shareCount} share${p.shareCount === 1 ? '' : 's'}</span></div>
    <div class="bk-actions">
      <button type="button" class="bk-act${p.myReactionType === 'amen' ? ' mine-amen' : ''}" data-act="amen"><span class="ic">♥</span>AMEN${rx.amen ? ` · ${rx.amen}` : ''}</button>
      <button type="button" class="bk-act" data-comments><span class="ic">❝</span>COMMENT${p.commentCount ? ` · ${p.commentCount}` : ''}</button>
      <button type="button" class="bk-act${p.myReactionType === 'pray' ? ' mine-pray' : ''}" data-act="pray"><span class="ic">✛</span>PRAY${praying ? ` · ${praying}` : ''}</button>
      <button type="button" class="bk-act" data-act="share"><span class="ic">↗</span>SHARE${p.shareCount ? ` · ${p.shareCount}` : ''}</button>
      <button type="button" class="bk-act" data-act="save"><span class="ic">⚑</span>SAVE</button>
    </div>
    <div class="bk-gate" data-actgate></div>
    <div class="bk-comments" data-commentsbox></div>
  </article>`;
}
/* 2C-1 §1 (390px re-slot): the right rail's cards ride INTO the
   thread on phone — FaithGuide AI Highlights after the 3rd member
   post, Latest Testimonies + Find Your Circle after the 8th. The
   inserts are part of the paint string (initial paint / settle patch
   only — chain merges never repaint, so nothing can insert mid-read,
   per the blink laws). The wrappers are display:none above 880px,
   where the rail itself carries the same cards; if the visible
   window is shorter than a slot, the slot lands after the last card
   so nothing the rail carries disappears on phone. */

/* ---------- amp-up phase 2C-2 — 16:3 FAITH PRESENTS (§3 + §6) ----------
   The shelf is ops-curated data (assets/data/presents-shelf.json): real
   titles, real playable references, real presenters. R-6 FOLD C
   (2026-11-23, founder — "open it up"): the kind set is FILM /
   MUSIC VIDEO / SERMON / TEACHING, carried in each entry's category
   and rendered on its card (chip + sub-line). The 2026-11-23 pass
   normalized the mislabeled kinds (biblical epics wore "Teaching",
   music videos wore "Worship") and interleaved the shelf so kinds
   alternate in the wall. SERMON and TEACHING ship ZERO entries —
   a named gap, never padded: no verifiable sermon/teaching video
   id exists in the house's Watch/Listen catalogs (Watch is films
   and series only; the only "sermon" strings in Listen data are
   song titles). The pipeline is kind-agnostic — the first verified
   entries drop into the same file and render with no code change.
   FEED MIX (§6 law): curated Presents cards interleave at PAINT time
   only (initial paint / preserved repaint / settle fallback) — chain
   merges stay data-only and settlePatch never touches these cards, so
   a playing video element is never recreated by a merge or a settle
   (blink laws). Ceiling: ≤1 curated per 3 member posts in any rolling
   window; the first curated card never lands before the 3rd member
   post; member posts always win position. Scarcity floor: a rendered
   window holding <6 member posts may fill member, member, video,
   member, video… — labeling + first-screen law intact either way.
   PLAYBACK (§3, mirroring watch.js openPlayer's source handling, kept
   inside this hub): mp4 direct + API-stream fallback · jfp stream
   fetch · YouTube embed — INLINE in the wall, two modes. Ambient:
   muted autoplay in view (native <video muted playsinline>; YouTube
   iframe lazy-mounted on approach with controls=0&autoplay=1&mute=1).
   Engaged (tap): sound + controls (YouTube reloads with controls=1).
   End card: our overlay covers the embed with doors to Watch/Listen.
   Embed drift: any failure degrades to the gold-framed poster + a
   door — never a raw error box. No outbound YouTube link, no
   subscribe CTA, no channel promotion anywhere. FULL-SONGS LAW: a
   music video plays the whole song's video; nothing truncates.
   PERFORMANCE (§3 budget, law): max 3 live video elements (mounts),
   preload="none" + poster until in view, ONE shared
   IntersectionObserver (preload ≥0.25 · play ≥0.5 · pause <0.25);
   a 4th mount evicts the earliest playing one back to its poster.
   Reduced motion: no ambient autoplay — poster + tap-to-play only. */
const PV_REDUCED = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } })();
const PV_MAX_LIVE = 3;
const pvLive = []; /* mounted cards, in mount order — the budget ledger */
let pvObserver = null;
/* ---------- COMMUNITY PASS 2026-11-24 — PART A: FACEBOOK-STYLE
   AUTOPLAY + THE FEED-SOUND SWITCH (founder 17:57 MST: "more like
   facebook, like the auto start on videos when you scroll to it,
   with a mute and un mute option"; ChatGPT consult
   chatcmpl-EnvclMMolUxGUIOezY3MnKS3xOpBl + the pass brief).
   What the 2C-2 system already did: muted ambient mounts in view,
   tap-to-engage with sound. What it could NOT do: a YouTube card
   carried no API handle (enablejsapi was never set), so it could
   not be paused or muted in place — it was unmounted off-screen —
   there was no mute control anywhere, and every in-view native
   video played at once. This pass adds: (1) enablejsapi=1 + a
   YT.Player wrap per YouTube card, so pause / mute / ended sit
   under house control; (2) pvArbitrate() — ONE card plays at a
   time, the most visible (an engaged card the member tapped holds
   the slot while it stays ≥25% visible); play starts at ≥50%
   visible, pause lands under 25%, and an incumbent between the
   two holds its slot until another card reaches 50%; (3) the gold
   sound button on every Presents card driving ONE global
   feed-sound state, remembered per session (sessionStorage) —
   default muted; an unmute tap is the user gesture that lets
   later winners start with sound, and any browser refusal
   degrades that one play to muted, never an error; (4) Save-Data
   joins reduced-motion in the no-ambient gate. Member posts and
   member-shared media are NEVER touched: autoplay belongs to the
   house's Presents cards only. */
const PV_SAVEDATA = (() => { try { return !!(navigator.connection && navigator.connection.saveData); } catch { return false; } })();
const PV_AMBIENT_OK = !PV_REDUCED && !PV_SAVEDATA;
const PV_SOUND_KEY = 'bk-pv-sound';
let pvSoundOn = false;
try { pvSoundOn = sessionStorage.getItem(PV_SOUND_KEY) === '1'; } catch { /* private mode: in-memory only */ }
let pvNow = null; /* the card arbitration last handed the playing slot to */
let pvYtApiP = null;
function pvLoadYtApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (pvYtApiP) return pvYtApiP;
  pvYtApiP = new Promise((resolve) => {
    let done = false;
    const fin = () => { if (!done) { done = true; resolve(window.YT && window.YT.Player ? window.YT : null); } };
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { try { if (typeof prev === 'function') prev(); } catch { /* a co-tenant callback never blocks ours */ } fin(); };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
      document.head.appendChild(s);
    }
    setTimeout(fin, 9000); /* API unreachable: the plain embed still autoplays muted; its pause falls back to unmount */
  });
  return pvYtApiP;
}
function pvYtWrap(card, f) {
  pvLoadYtApi().then((YT) => {
    if (!YT || f._pvPlayer || !card.isConnected || !pvLive.includes(card)) return;
    try {
      f._pvPlayer = new YT.Player(f, {
        events: {
          onReady: () => { if (pvNow === card) pvPlayCard(card); else pvPauseCard(card); },
          onStateChange: (ev) => {
            if (ev.data === YT.PlayerState.ENDED) { card.classList.remove('playing'); card.classList.add('ended'); delete card.dataset.engaged; card.classList.remove('engaged'); if (pvNow === card) pvNow = null; }
          },
        },
      });
    } catch { /* the embed plays on without API control — never an error surface */ }
  });
}
function pvSetSound(on) {
  pvSoundOn = !!on;
  try { sessionStorage.setItem(PV_SOUND_KEY, pvSoundOn ? '1' : '0'); } catch { /* private mode */ }
  if (S.root) S.root.querySelectorAll('[data-pvsnd]').forEach((b) => {
    b.classList.toggle('on', pvSoundOn);
    b.setAttribute('aria-pressed', pvSoundOn ? 'true' : 'false');
    b.setAttribute('aria-label', pvSoundOn ? 'Sound on — tap to mute the feed' : 'Sound off — tap to unmute the feed');
  });
  for (const card of [...pvLive]) {
    const m = card.querySelector('[data-pvmedia]'); if (!m) continue;
    if (m.tagName === 'VIDEO') m.muted = !pvSoundOn;
    else if (m.tagName === 'IFRAME' && m._pvPlayer) { try { if (pvSoundOn) m._pvPlayer.unMute(); else m._pvPlayer.mute(); } catch { /* no-op */ } }
  }
}
function pvPlayCard(card) {
  const m = card.querySelector('[data-pvmedia]'); if (!m) return;
  if (m.tagName === 'VIDEO') {
    const wantSound = !!card.dataset.engaged || pvSoundOn;
    m.muted = !wantSound;
    const pr = m.play();
    if (pr && pr.catch) pr.catch(() => {
      /* A browser that refuses audible autoplay gets the muted play
         instead — the card degrades, it never fails or errors. */
      if (wantSound && !m.muted) { m.muted = true; const p2 = m.play(); if (p2 && p2.catch) p2.catch(() => {}); }
    });
    return;
  }
  if (m.tagName === 'IFRAME' && m._pvPlayer && typeof m._pvPlayer.playVideo === 'function') {
    try { if (pvSoundOn || card.dataset.engaged) m._pvPlayer.unMute(); else m._pvPlayer.mute(); } catch { /* no-op */ }
    try { m._pvPlayer.playVideo(); } catch { /* no-op */ }
  }
  /* A YouTube iframe with no API handle yet plays by its own
     autoplay=1&mute=1 src — muted, as the ambient law requires. */
}
function pvPauseCard(card) {
  const m = card.querySelector('[data-pvmedia]'); if (!m) return;
  if (m.tagName === 'VIDEO') { try { m.pause(); } catch { /* already gone */ } return; }
  if (m.tagName === 'IFRAME') {
    if (m._pvPlayer && typeof m._pvPlayer.pauseVideo === 'function') { try { m._pvPlayer.pauseVideo(); } catch { /* no-op */ } }
    else pvUnmount(card); /* no API handle: the standing off-screen behavior */
  }
}
function pvArbitrate() {
  let eng = null, best = null, bestR = 0;
  for (const card of pvLive) {
    if (!card.isConnected || card.classList.contains('ended') || card.classList.contains('failed')) continue;
    const r = card._pvRatio || 0;
    if (card.dataset.engaged && r >= 0.25) { eng = card; break; }
    if (r > bestR) { bestR = r; best = card; }
  }
  let winner = eng || (best && bestR >= 0.5 ? best : null);
  if (!winner && pvNow && pvLive.includes(pvNow) && pvNow.isConnected
    && !pvNow.classList.contains('ended') && !pvNow.classList.contains('failed')
    && (pvNow._pvRatio || 0) >= 0.25) winner = pvNow; /* incumbent holds between 0.25 and 0.5 */
  if (winner && !winner.dataset.engaged && !PV_AMBIENT_OK) winner = null;
  for (const card of [...pvLive]) if (card !== winner) pvPauseCard(card);
  pvNow = winner;
  if (winner) pvPlayCard(winner);
}
const pvEntry = (id) => (S.presents || []).find((e) => e.id === id) || null;
function presentsCardHtml(e) {
  const poster = e.poster
    ? `<img class="bk-pv-poster" src="${esc(e.poster)}" alt="" loading="lazy" onerror="this.remove()">`
    : `<span class="bk-pv-mono" aria-hidden="true">16:3</span>`;
  return `<article class="bk-card bk-video bk-pv-card" data-presents="${esc(e.id)}">
    <div class="bk-pv-head"><span class="bk-badge bk-badge-presents">16:3 FAITH PRESENTS · ${esc(String(e.presenter).toUpperCase())}</span><span class="bk-pv-cat">${esc(String(e.category).toUpperCase())}</span></div>
    <h3 class="bk-pv-title">${esc(e.title)}</h3>
    <p class="bk-pv-sub">Presented by ${esc(e.presenter)} · ${esc(e.category)} · plays here in the wall</p>
    <div class="bk-pv-stage" data-pvstage>${poster}
      <button type="button" class="bk-pv-tap" data-pvtap aria-label="Play ${esc(e.title)} with sound"><span class="bk-pv-glyph">▶</span></button>
      <button type="button" class="bk-pv-snd${pvSoundOn ? ' on' : ''}" data-pvsnd aria-pressed="${pvSoundOn ? 'true' : 'false'}" aria-label="${pvSoundOn ? 'Sound on — tap to mute the feed' : 'Sound off — tap to unmute the feed'}" title="Feed sound"><svg class="ic-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><svg class="ic-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.7a4.6 4.6 0 010 6.6M19 6.2a8.2 8.2 0 010 11.6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>
      <div class="bk-pv-end"><div><span class="bk-badge bk-badge-presents">16:3 FAITH PRESENTS</span><h4>Keep watching the house</h4><p>That presentation has ended. The house has more — films and features in Watch, the full songbook in Listen.</p><div class="bk-pv-doors"><button type="button" class="bk-pv-door" data-hubgo="watch">OPEN WATCH ↗</button><button type="button" class="bk-pv-door" data-hubgo="listen">OPEN LISTEN ↗</button></div></div></div>
      <div class="bk-pv-fail"><div><span class="bk-badge bk-badge-presents">16:3 FAITH PRESENTS</span><h4>This one won't play here just now</h4><p>The stream didn't answer inside the wall. It lives in the house libraries — open one and keep going.</p><div class="bk-pv-doors"><button type="button" class="bk-pv-door" data-hubgo="watch">OPEN WATCH ↗</button><button type="button" class="bk-pv-door" data-hubgo="listen">OPEN LISTEN ↗</button></div></div></div>
    </div>
  </article>`;
}
/* The §6 mix, computed at render from the real window: returns the
   member-post cards with Presents cards woven in. `memberCount` is the
   size of the rendered window (the posts actually shown). */
function mixPresents(memberCards, memberCount) {
  const shelf = S.presents || [];
  if (!shelf.length || !memberCards.length) return memberCards;
  const scarce = memberCount < 6;
  const out = [];
  let placed = 0, sinceVideo = 99, shelfIdx = 0;
  const place = () => {
    if (shelfIdx >= shelf.length) return false;
    out.push(presentsCardHtml(shelf[shelfIdx++])); placed++; sinceVideo = 0; return true;
  };
  memberCards.forEach((card, i) => {
    out.push(card);
    const seen = i + 1;
    if (scarce) {
      /* floor pattern: member, member, video, member, video… */
      if (seen >= 3 && (seen - 3) % 2 === 0) place();
    } else if (seen >= 3 && sinceVideo >= 3) {
      /* ceiling: at most 1 curated per 3 member posts, rolling */
      place();
    }
    sinceVideo++;
  });
  return out;
}
function pvFail(card) {
  if (!card || card.classList.contains('ended')) return;
  pvUnmount(card);
  delete card.dataset.engaged; card.classList.remove('engaged');
  card.classList.add('failed');
}
function pvMount(card, engaged) {
  const e = pvEntry(card.dataset.presents); if (!e) return;
  const stage = card.querySelector('[data-pvstage]'); if (!stage) return;
  if (stage.querySelector('[data-pvmedia]')) { if (engaged) pvEngage(card); return; }
  /* Budget: a 4th live element evicts the earliest playing mount. */
  while (pvLive.length >= PV_MAX_LIVE) { const old = pvLive.find((c) => c !== card) || pvLive[0]; if (!old || old === card) break; pvUnmount(old); }
  card.classList.remove('failed', 'ended');
  if (e.source === 'watch-mp4') {
    const v = document.createElement('video');
    v.className = 'bk-pv-media'; v.setAttribute('data-pvmedia', 'mp4');
    v.muted = !engaged; v.playsInline = true; v.loop = false; v.preload = 'auto';
    if (engaged) v.controls = true;
    if (e.poster) v.poster = e.poster;
    v.src = e.ref;
    v.addEventListener('playing', () => card.classList.add('playing'));
    v.addEventListener('ended', () => { card.classList.remove('playing'); card.classList.add('ended'); delete card.dataset.engaged; card.classList.remove('engaged'); });
    v.addEventListener('error', () => {
      if (e.fallback && !v.dataset.fbk) { v.dataset.fbk = '1'; v.src = API_BASE + e.fallback; return; }
      pvFail(card);
    }, true);
    stage.insertBefore(v, stage.querySelector('.bk-pv-tap'));
    pvLive.push(card);
    pvArbitrate();
  } else if (e.source === 'watch-jfp') {
    pvLive.push(card);
    (async () => {
      try {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000);
        const r = await fetch(`${API_BASE}/api/sanctuary/jfp-stream/${encodeURIComponent(e.ref)}?lang=en`, { signal: ctl.signal });
        clearTimeout(to);
        if (!r.ok) throw new Error('stream ' + r.status);
        const j = await r.json();
        if (!j.streamUrl) throw new Error('no stream');
        if (!card.isConnected || !pvLive.includes(card)) return; /* unmounted while resolving */
        const v = document.createElement('video');
        v.className = 'bk-pv-media'; v.setAttribute('data-pvmedia', 'jfp');
        v.muted = !engaged; v.playsInline = true; v.preload = 'auto';
        if (engaged) v.controls = true;
        v.src = j.streamUrl;
        v.addEventListener('playing', () => card.classList.add('playing'));
        v.addEventListener('ended', () => { card.classList.remove('playing'); card.classList.add('ended'); delete card.dataset.engaged; card.classList.remove('engaged'); });
        v.addEventListener('error', () => pvFail(card), true);
        stage.insertBefore(v, stage.querySelector('.bk-pv-tap'));
        pvArbitrate();
      } catch { pvFail(card); }
    })();
  } else { /* watch-youtube / listen-youtube */
    const f = document.createElement('iframe');
    f.className = 'bk-pv-media'; f.setAttribute('data-pvmedia', 'youtube');
    f.title = e.title;
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
    f.src = `https://www.youtube.com/embed/${encodeURIComponent(e.ref)}?controls=${engaged ? 1 : 0}&autoplay=1&mute=${engaged ? 0 : 1}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    let settled = false;
    f.addEventListener('load', () => { settled = true; card.classList.add('playing'); pvYtWrap(card, f); });
    setTimeout(() => { if (!settled && card.isConnected && pvLive.includes(card)) pvFail(card); }, 9000);
    stage.insertBefore(f, stage.querySelector('.bk-pv-tap'));
    pvLive.push(card);
    pvArbitrate();
  }
}
function pvUnmount(card) {
  const i = pvLive.indexOf(card); if (i >= 0) pvLive.splice(i, 1);
  if (pvNow === card) pvNow = null;
  const stage = card.querySelector('[data-pvstage]'); if (!stage) return;
  stage.querySelectorAll('[data-pvmedia]').forEach((m) => { try { if (m.tagName === 'VIDEO') { m.pause(); m.removeAttribute('src'); m.load(); } } catch { /* already gone */ } m.remove(); });
  card.classList.remove('playing');
}
function pvEngage(card) {
  const e = pvEntry(card.dataset.presents); if (!e) return;
  if (card.dataset.engaged) return;
  card.dataset.engaged = '1';
  card.classList.add('engaged');
  card.classList.remove('ended', 'failed');
  /* COMMUNITY PASS 2026-11-24 (Part A): the tap means "play WITH
     sound" — the global feed-sound switch follows the tap, and
     arbitration hands this card the wall's one playing slot. */
  pvSetSound(true);
  const media = card.querySelector('[data-pvmedia]');
  if (!media) { pvMount(card, true); return; }
  if (media.tagName === 'VIDEO') {
    media.muted = false; media.controls = true;
    const pr = media.play(); if (pr && pr.catch) pr.catch(() => {});
    pvArbitrate();
  } else if (media.tagName === 'IFRAME') {
    /* Engaged YouTube = reload the embed with controls + sound (§3),
       API-enabled so the wall keeps pause/mute authority over it;
       the mount-time load listener re-wraps the fresh document. */
    media._pvPlayer = null;
    media.src = `https://www.youtube.com/embed/${encodeURIComponent(e.ref)}?controls=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    pvArbitrate();
  }
}
function pvObserve(root) {
  /* A repaint retires the old cards: prune dead mounts from the
     budget ledger so detached elements never hold a live slot. */
  for (let i = pvLive.length - 1; i >= 0; i--) if (!pvLive[i].isConnected) pvLive.splice(i, 1);
  if (!('IntersectionObserver' in window)) return;
  if (!pvObserver) {
    /* COMMUNITY PASS 2026-11-24 (Part A): the observer now only
       RECORDS each card's visibility and lazy-mounts on approach
       (≥0.25); the play/pause decision itself lives in
       pvArbitrate() — one card at a time, the most visible,
       Facebook-style (play ≥0.5, pause <0.25, incumbent holds
       between). Reduced-motion and Save-Data visitors get no
       ambient mounts at all: poster + tap-to-play only. */
    pvObserver = new IntersectionObserver((entries) => {
      let dirty = false;
      for (const en of entries) {
        const card = en.target;
        if (!card.isConnected) { pvObserver.unobserve(card); continue; }
        card._pvRatio = en.intersectionRatio;
        const media = card.querySelector('[data-pvmedia]');
        if (en.intersectionRatio >= 0.25 && !media && PV_AMBIENT_OK) pvMount(card, false);
        dirty = true;
      }
      if (dirty) pvArbitrate();
    }, { threshold: [0, 0.25, 0.5, 0.75] });
  }
  root.querySelectorAll('[data-presents]').forEach((card) => {
    card.querySelector('[data-pvtap]')?.addEventListener('click', () => pvEngage(card));
    card.querySelector('[data-pvsnd]')?.addEventListener('click', (ev) => { ev.stopPropagation(); pvSetSound(!pvSoundOn); });
    pvObserver.observe(card);
  });
}

function feedCardsHtml(shown) {
  const aiSlot = `<div class="bk-inthread" data-inthread="ai">${aiHighlightsHtml()}</div>`;
  const railSlot = `<div class="bk-inthread" data-inthread="rail">${latestTestCardHtml()}${suggestedGroupsCardHtml()}</div>`;
  /* COMMUNITY PASS 2026-11-24 (Part B): the rest of the right rail
     rides into the phone feed too (≤768px only — the .bk-phone
     wrappers stay display:none above it, where the rail itself
     carries these cards): Member Search after the 5th member post,
     the First Community scene after the 11th, Pray With Somebody
     after the 16th, the Family Code after the 21st — the standing
     slot pattern (fire in-loop at the count; end-append in slot
     order when the window is shorter, so nothing the rail carries
     disappears on phone). The Weekly Rotation is NOT a slot: it
     closes the feed from viewFeed, outside the append-only list,
     and the guest join card stands above the feed the same way. */
  const searchSlot = `<div class="bk-inthread bk-phone" data-inthread="search">${memberSearchHtml()}</div>`;
  const sceneSlot = `<div class="bk-inthread bk-phone" data-inthread="scene">${sceneCardHtml()}</div>`;
  const praySlot = `<div class="bk-inthread bk-phone" data-inthread="pray">${prayPanelHtml()}</div>`;
  const codeSlot = `<div class="bk-inthread bk-phone" data-inthread="code">${familyCodeHtml()}</div>`;
  /* 2C-1 slots ride at member positions (AI after the 3rd member post,
     rail cards after the 8th; end-appended when the window is shorter).
     2C-2 §6: mixPresents weaves the Presents cards through the member
     cards under the ceiling / scarcity floor; the in-thread slots are
     then re-inserted at their member positions in the mixed sequence
     (they are house cards, never counted as member posts). */
  const mixed = mixPresents(shown.map((p) => postCard(p)), shown.length);
  const out = [];
  let m = 0, aiDone = false, railDone = false, searchDone = false, sceneDone = false, prayDone = false, codeDone = false;
  for (const c of mixed) {
    out.push(c);
    if (!c.includes('data-presents')) {
      m++;
      if (m === 3) { out.push(aiSlot); aiDone = true; }
      if (m === 5) { out.push(searchSlot); searchDone = true; }
      if (m === 8) { out.push(railSlot); railDone = true; }
      if (m === 11) { out.push(sceneSlot); sceneDone = true; }
      if (m === 16) { out.push(praySlot); prayDone = true; }
      if (m === 21) { out.push(codeSlot); codeDone = true; }
    }
  }
  if (!aiDone) out.push(aiSlot);
  if (!railDone) out.push(railSlot);
  if (!searchDone) out.push(searchSlot);
  if (!sceneDone) out.push(sceneSlot);
  if (!prayDone) out.push(praySlot);
  if (!codeDone) out.push(codeSlot);
  /* 2C-4 PYMK phone placement: its own in-thread wrapper AFTER the
     last member card — a later in-thread position that displaces
     neither ruled slot (AI after 3rd, rail after 8th). Desktop and
     the 881–1240 band carry PYMK in the rail / below-feed stack. */
  const pymk = pymkHtml();
  if (pymk) out.push(`<div class="bk-inthread" data-inthread="pymk">${pymk}</div>`);
  return out.join('');
}
/* ---------- COMMUNITY RESTORE R-4 (2026-11-23) — PRESENTS CLOSE.
   The original closed the Community page with a PRESENTS manifesto
   footer (study §1.9): the manifesto line, a link column, a legal
   line, Proverbs 16:3 in italic serif. This is that close in fresh
   code, at the wall's end (viewFeed, after belowFeedHtml, above the
   shell footer). Every link lands on a destination the fresh build
   truly has, riding the existing paint wiring (data-hubgo →
   goHub, data-view → view switch) — the original's links to
   surfaces this build does not carry (About, Press & Media, FAQ,
   Contact, Feedback & Ideas, Privacy) are excluded by name in the
   R-4 record, never faked; the column is headed 16:3 FAITH, the
   house's own name for its link column (§4). Static HTML: no state,
   no counters, nothing for a merge or settle to move. */
function closeHtml() {
  const hub = (h, label) => `<button type="button" class="bk-closelink" data-hubgo="${h}">${label}</button>`;
  const view = (v, label) => `<button type="button" class="bk-closelink" data-view="${v}">${label}</button>`;
  return `<footer class="bk-close">
    <div class="bk-closeeb">16:3 FAITH PRESENTS</div>
    <p class="bk-closemani">Faith, Music, Stories, Scripture, Film, and Community — Gathered With Purpose.</p>
    <div class="bk-closecol"><div class="bk-closehead">16:3 FAITH</div>
      <div class="bk-closelinks">${hub('home', 'Home')}${hub('home', 'Pastor Jeremy Mills')}${hub('read', 'Devotionals')}${hub('read', 'Bible')}${hub('watch', 'Movies')}${hub('listen', 'Sanctuary')}${hub('community', 'Community')}${view('groups', 'Groups')}${view('messages', 'Messages')}${hub('give', 'Give')}</div>
    </div>
    <p class="bk-closeverse">“Commit thy works unto the LORD, and thy thoughts shall be established.”<span class="bk-closeattr">PROVERBS 16:3</span></p>
    <div class="bk-closelegal">16:3 FAITH © 2026</div>
  </footer>`;
}
function viewFeed() {
  const list = feedList();
  const shown = list.slice(0, S.feedShown);
  /* R-2 WATCH: the wall becomes the Presents shelf alone — the real
     shelf cards, observed by the same pvObserve wiring in paint().
     No member mix, no in-thread slots, no load-more: the shelf is
     the shelf, labeled as itself. */
  const isWatch = S.feedFilter === 'watch';
  const srcNote = isWatch
    ? `16:3 Faith Presents — the house's films and features, playing right here in the wall. The family's posts are one tap back, under ALL.`
    : S.mode === 'live'
      ? `Live from the community API as you read — the family's wall, in the API's own order. Tap a name for the member's profile; comments open right on the card.`
      : `Captured production feed (2026-10-21/22 guest pages) — real posts, in the API's own order. The wall loads live wherever the API answers. Tap a name for the member's profile; comments open right on the card.`;
  const feedBody = isWatch
    ? (S.presentsLoaded
      ? (S.presents.length
        ? S.presents.map(presentsCardHtml).join('')
        : '<div class="bk-ctx"><h3>The shelf is empty.</h3><p>No presentations are on the house shelf right now — the family wall under ALL is full.</p></div>')
      : '<div class="bk-ctx"><h3>Loading the shelf…</h3><p>The house presentations are on their way — an unloaded shelf never reads as an empty one.</p></div>')
    : null;
  return `${lobbyHtml()}${stripHtml()}${storiesHtml()}${composerHtml()}
  ${sceneBreakHtml()}
  ${phoneJoinHtml()}
  <section class="bk-feedsec"><div class="bk-feedhead"><div><span class="eyebrow">THE TIMELINE</span><h2>The <em>family feed.</em></h2></div><span class="bk-feedtruth">SHOW UP AS YOU ARE. ♡</span></div>
    <p class="bk-note">${srcNote}</p>
    ${pillsHtml()}
    <div class="bk-newpill" data-newpill hidden><button type="button" data-newpillbtn>✦ NEW POSTS</button></div>
    <div data-feedlist>${isWatch ? feedBody : (shown.length ? feedCardsHtml(shown) : (S.loaded
      ? '<div class="bk-ctx"><h3>Quiet in here.</h3><p>No posts of this kind are in the carried wall. The other doors hold the rest of the family.</p></div>'
      : '<div class="bk-ctx"><h3>Loading the wall…</h3><p>The family\'s posts are on their way — an unloaded wall never reads as an empty one.</p></div>'))}</div>
    ${isWatch ? '' : (list.length > S.feedShown || (S.mode === 'live' && S.feedHasMore)
      ? `<div class="bk-sentinel" data-sentinel aria-hidden="true"></div>`
      : (list.length ? endFeedHtml() : ''))}
  </section>${phoneRotationHtml()}${belowFeedHtml()}${isWatch || !(list.length > S.feedShown || (S.mode === 'live' && S.feedHasMore)) ? closeHtml() : ''}`;
}
/* FOLD E (2026-11-23, founder): Bible scene art dresses the wall's
   section break — the break between the composer and the feed
   head, keyed by the feed's own filter so each room of the wall
   carries its scene. Pentecost is the family's identity art: the
   first community. Art never enters the feed list itself. */
const SCENES = {
  all: ['scene-pentecost', 'PENTECOST — THE FIRST COMMUNITY'],
  general: ['scene-david-goliath', 'DAVID & GOLIATH — FAITH IN THE FIGHT'],
  prayer: ['scene-red-sea', 'THE RED SEA — DELIVERANCE'],
  testimony: ['scene-resurrection', 'THE RESURRECTION — HE IS RISEN'],
  watch: ['scene-tree-of-life', 'THE TREE OF LIFE'],
};
function sceneBreakHtml() {
  const [img, cap] = SCENES[S.feedFilter] || SCENES.all;
  return `<figure class="bk-scenebreak"><img src="assets/img/community/${img}.webp" alt="" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
}
/* The right rail's Pentecost identity card. */
function sceneCardHtml() {
  return `<section class="panel bk-sidecard bk-scenecard" data-scenecard><img src="assets/img/community/scene-pentecost.webp" alt="" loading="lazy"><div class="bk-scenebody"><span class="eyebrow">THE FIRST COMMUNITY</span><p>Pentecost — where the family began. <b style="color:#cbb26a">Acts 2.</b></p></div></section>`;
}
/* R-6 FOLD B (2026-11-23, founder): the wall's end state — rendered
   only when the wall is truly exhausted, at the true end. */
function endFeedHtml() {
  return `<div class="bk-endfeed"><span>✛</span><strong>YOU'RE ALL CAUGHT UP.</strong><small>Good news travels. Keep showing up.</small></div>`;
}

function viewTestimonies() {
  const list = uniqPosts(S.testimonies);
  return `<button type="button" class="bk-back" data-view="feed">← BACK TO THE FEED</button>
  <div class="bk-feedhead"><div><span class="eyebrow">STORIES OF GRACE</span><h2>The <em>testimony tape.</em></h2></div></div>
  <img class="bk-artbanner gold-frame" src="assets/img/community/testimony-art.webp" alt="A lit candle and an open journal in a quiet church corner" loading="lazy">
  <p class="bk-note">${S.mode === 'live' ? 'Live from the community API.' : 'The carried capture.'} Every testimony below is a real post from the family wall, typed as a testimony by its author — word for word, nothing rewritten.${S.mode === 'live' && S.feedHasMore ? ' The wall is still arriving — as you scroll, the tape pulls the next pages in on its own.' : ''}</p>
  ${list.map((p) => postCard(p)).join('') || (S.loaded
    ? '<div class="bk-ctx"><h3>No testimonies in this pull.</h3><p>The counter at the top of the hub counts the testimonies this build carries — none are in the carried pages yet.</p></div>'
    : '<div class="bk-ctx"><h3>Loading the testimony tape…</h3><p>The stories are on their way — an unloaded tape never reads as an empty one.</p></div>')}
  ${S.mode === 'live' && S.feedHasMore ? `<div class="bk-sentinel" data-sentinel-test aria-hidden="true"></div>` : ''}`;
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
  /* AUDIT CURE D-3 (2026-11-24): the directory grid now answers the
     search. Before this cure the submit handler set S.peopleQuery and
     repainted, but this view rendered S.members unfiltered — only the
     strip above the grid ever narrowed, so the grid stood at its full
     count for every query (the audit's "Ministry" search left all 113
     cards standing). The grid narrows by the house predicate (name +
     location — the same one the strip's directory mode and the rail
     search fallback use), unioned with the live search's own hits
     when it answered. The note above keeps the TRUE directory total;
     a results line under the form states the narrowed count, and an
     empty result says so honestly. */
  const q = (S.peopleQuery || '').trim().toLowerCase();
  const liveIds = q && S.peopleResults != null ? new Set(S.peopleResults.map((r) => r.userId)) : null;
  const shown = q
    ? list.filter((m) => (m.name + ' ' + (m.location || '')).toLowerCase().includes(q) || (liveIds && m.id && liveIds.has(m.id)))
    : list;
  return `<button type="button" class="bk-back" data-view="feed">← BACK TO THE FEED</button>
  <div class="bk-feedhead"><div><span class="eyebrow">THE FAMILY DIRECTORY</span><h2>Every face <em>matters.</em></h2></div></div>
  <p class="bk-note">${S.counters ? `<b style="color:var(--gold)">${S.counters.members} members</b> in the family (the community pulse total) · ` : ''}<b style="color:var(--gold)">${list.length} profiles listed</b> in the directory below — the members evidenced in the wall's own pages${S.mode === 'live' ? ' and this live pull' : ' of the capture'}. Two different counts, labeled: the pulse counts every registered member; this directory lists the profiles the wall's pages evidence — real people only; nobody is invented to fill a grid. Search runs against the live member index.</p>
  <form class="bk-search" data-peoplesearch><input type="search" placeholder="Search the family by name…" value="${esc(S.peopleQuery)}" aria-label="Search members by name"><button type="submit">SEARCH</button></form>
  ${peopleStripHtml()}
  ${q ? `<p class="bk-note" data-dirfilter>Showing <b style="color:var(--gold)">${shown.length}</b> of ${list.length} profiles for &ldquo;${esc(S.peopleQuery.trim())}&rdquo;.</p>` : ''}
  ${q && !shown.length ? `<div class="bk-ctx"><h3>No member in the directory matches that search.</h3><p>The directory lists the profiles the wall's pages evidence — try a name or a place.${S.peopleResults != null && S.peopleResults.length ? ' The live search did find matches — they stand in the strip above.' : ''}</p></div>` : `<div class="bk-mgrid" data-dirtotal="${list.length}">${shown.map((m) => m.id ? `
    <button type="button" class="bk-mcard" data-profile="${esc(m.id)}">${avatarHtml(m.name, m.avatar, false)}
      <strong>${esc(m.name)}${m.verified ? ' <span class="bk-ver">✦</span>' : ''}</strong>
      <small>${m.location ? esc(m.location) + ' · ' : ''}${(m.postsInPull ?? m.posts) != null ? (m.postsInPull ?? m.posts) + (((m.postsInPull ?? m.posts) === 1) ? ' post' : ' posts') + (S.mode === 'live' ? ' in this pull' : ' in capture') : ''}</small>
    </button>` : `
    <div class="bk-mcard static" data-noprofile="1">${avatarHtml(m.name, m.avatar, false)}
      <strong>${esc(m.name)}${m.verified ? ' <span class="bk-ver">✦</span>' : ''}</strong>
      <small>${m.location ? esc(m.location) + ' · ' : ''}profile proven on the old face (census Leg-4)</small>
    </div>`).join('')}</div>`}
  <p class="bk-note" data-dirnone hidden>No member in the directory matches that search.</p>`;
}
function viewGroups() {
  return `<button type="button" class="bk-back" data-view="feed">← BACK TO THE FEED</button>
  <div class="bk-feedhead"><div><span class="eyebrow">THE SMALL CIRCLES</span><h2>Find your <em>people.</em></h2></div></div>
  <p class="bk-note">${S.mode === 'live' ? 'The live group list from the community API, read as you opened this door.' : 'The verified group list, captured live from the community API on 2026-11-19 (the live API did not answer from this network).'} ${isSignedIn() ? 'You are signed in — group joining wires to your account with the member build; the circles themselves are the live list below.' : 'Joining a group is a member action — join free or sign in (top right) and the circles open to your account.'}</p>
  <div class="bk-mgrid">${S.groups.map((g) => `
    <div class="bk-gcard">${GROUP_ART[g.name] ? `<img class="bk-gcoverimg" src="${GROUP_ART[g.name]}" alt="" aria-hidden="true" loading="lazy">` : ''}<span class="bk-gcover">${esc(initials(g.name))}</span>
      <h3>${esc(g.name)}</h3><div class="meta">${g.memberCount} member${g.memberCount === 1 ? '' : 's'} · ${g.isPublic === false ? 'Private' : 'Public'} group · led by the 16:3 Faith house</div>
      <p>${esc(g.description || '')}</p>
      <button type="button" class="bk-goldbtn" style="width:auto;padding:9px 16px;margin-top:4px" data-joingate>JOIN GROUP</button>
      <div class="bk-gate" data-joingatepanel>${isSignedIn() ? '<b>You are signed in.</b> Group joining wires to your account with the member build — the circle will be here, and it will be real.' : '<b>Joining opens with member sign-in.</b> Groups are live on the community API today — membership itself is an account action. Join free or sign in (top right). The circle will be here.'}</div>
    </div>`).join('')}</div>`;
}
function viewMessages() {
  const member = isSignedIn();
  return `<button type="button" class="bk-back" data-view="feed">← BACK TO THE FEED</button>
  <div class="bk-ctx"><img class="bk-artbanner gold-frame" src="assets/img/community/empty-state.webp" alt="One empty church pew in warm golden light — a seat saved for you" loading="lazy"><span class="eyebrow">INBOX</span><h3 style="margin-top:8px">Stay <em style="color:var(--gold)">connected.</em></h3>
  ${member
    ? `<p><b>You're signed in — and the honest word is the inbox is the next member build.</b> The message routes are live on the community API, but this wall does not fake threads: no sample conversations stand in for yours. When the inbox lands, it opens on this account.</p>`
    : `<p><b>Messages are member-to-member.</b> The message routes are live on the community API and answer “Please sign in” to guests (verified 2026-11-19) — so there is no inbox to show a guest, and this house does not fake one: no sample conversations, no demo threads.</p>
  <p>Join free or sign in (top right) and your real conversations will open here as the member build lands.</p>`}</div>`;
}
function viewSaved() {
  const member = isSignedIn();
  return `<button type="button" class="bk-back" data-view="feed">← BACK TO THE FEED</button>
  <div class="bk-ctx"><img class="bk-artbanner gold-frame" src="assets/img/community/empty-state.webp" alt="One empty church pew in warm golden light — a seat saved for you" loading="lazy"><span class="eyebrow">YOUR BOOKMARKS</span><h3 style="margin-top:8px">Keep it <em style="color:var(--gold)">close.</em></h3>
  ${member
    ? `<p><b>You're signed in — your saved shelf is account state, and it is not wired on this wall yet.</b> Nothing is quietly stored on this device to pretend otherwise; when the shelf lands, the posts you save collect here under this account.</p>`
    : `<p><b>Saved posts live in your member account.</b> Bookmarks are personal account state on the community API — a guest has none, and nothing is quietly stored on this device to pretend otherwise.</p>
  <p>Join free or sign in (top right), and the posts you save from the wall will collect here.</p>`}</div>`;
}
/* ---------- amp-up phase 2C-3 helpers (§2) ---------- */
/* Connections: the ONLY connection evidence the carried data holds is
   shared circles — another member whose own carried posts carry a
   groupId this member also posted into. Nothing else is dressed as a
   connection: no directory members, no payload friendCount, no
   invented mutuals. Returns directory-backed people (real name +
   avatar/monogram) with the shared circle's real name. */
function profileConnections(ids, theirPosts) {
  const gids = new Set(theirPosts.map((p) => p.groupId).filter(Boolean));
  if (!gids.size) return [];
  const byAuthor = new Map();
  for (const p of [...S.posts, ...S.testimonies, ...(S.wallPosts || [])]) {
    if (!p.groupId || !gids.has(p.groupId) || !p.authorId || ids.has(p.authorId) || byAuthor.has(p.authorId)) continue;
    const g = S.groups.find((x) => x.id === p.groupId);
    byAuthor.set(p.authorId, { id: p.authorId, name: p.authorName, avatar: p.authorAvatar, circle: g?.name || 'a shared circle' });
  }
  return [...byAuthor.values()].map((c) => {
    const dir = (S.members || []).find((m) => m.id === c.id) || (S.bakedMembers || []).find((m) => m.id === c.id);
    return { ...c, name: dir?.name || c.name, avatar: dir?.avatar || c.avatar };
  }).slice(0, 9);
}
/* Photos: media carried on the member's OWN posts/testimonies only —
   the same post set the profile renders. No media → empty array →
   the caller omits the section entirely (honest absence). */
function profilePhotos(posts) {
  const urls = [];
  for (const p of posts) for (const m of p.media || []) if (m?.url && !urls.includes(m.url)) urls.push(m.url);
  return urls.slice(0, 9);
}
/* Member-scoped themes: wallThemes' discipline (4+ letters, function
   words removed, a word rises only when the member actually wrote it
   at least twice) over ONE member's own post bodies. */
function memberThemes(posts, n = 3) {
  const counts = new Map();
  for (const p of posts) {
    for (const w of String(p.body || '').toLowerCase().replace(/[^a-z\s']/g, ' ').split(/\s+/)) {
      const word = w.replace(/^'+|'+$/g, '');
      if (word.length < 4 || THEME_STOP.has(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}
/* FaithGuide "ABOUT THEM" (§2): a labeled-AI card computed ONLY from
   the member's own public posts/testimonies in the carried set —
   their counts by kind, the words that literally repeat in their own
   post text, their newest post's age. No biography, no facts from
   anywhere else. A member with no carried posts gets NO card. */
function aboutThemHtml(name, posts) {
  if (!posts.length) return '';
  const first = name.split(' ')[0];
  const test = posts.filter((p) => p.type === 'testimony').length;
  const prayers = posts.filter((p) => p.type === 'prayer').length;
  const themes = memberThemes(posts, 3);
  const newest = [...posts].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  const kinds = [`<b>${posts.length} post${posts.length === 1 ? '' : 's'}</b> in the carried wall`];
  if (test) kinds.push(`<b>${test} testimon${test === 1 ? 'y' : 'ies'}</b>`);
  if (prayers) kinds.push(`<b>${prayers} prayer request${prayers === 1 ? '' : 's'}</b>`);
  return `<section class="bk-aicard"><span class="bk-ailabel">✦ FAITHGUIDE · ABOUT THEM</span>
    <p>${esc(first)} has shared ${kinds.join(' — ')}.${themes.length ? ` Words that keep rising in ${esc(first)}'s own posts: <b>${themes.map(esc).join(', ')}</b>.` : ''}${newest ? ` Newest voice here: ${relTime(newest.createdAt)}.` : ''}</p><span class="bk-ainote">POWERED BY AI · SUMMARIZES THIS MEMBER'S OWN PUBLIC POSTS ONLY — NOTHING INVENTED</span></section>`;
}

/* PROFILES ALIVE (2026-11-23): the member's own content as three
   honest tabs — POSTS · TESTIMONIES · PRAYERS. Every panel renders
   ONLY what the carried record holds for this member; the tab
   counts are those same real sets; an empty kind carries one
   honest line. The default tab is the first kind that exists
   (posts, then testimonies, then prayers). Switching is a pure
   class/hidden toggle inside the profile — no repaint, no fetch. */
function profTabsHtml(name, posts, test, prayers, prayingTotal, profTestimony) {
  const first = name.split(' ')[0];
  const def = posts.length ? 'posts' : (test.length || profTestimony) ? 'testimonies' : prayers.length ? 'prayers' : 'posts';
  const tab = (key, label, n) => `<button type="button" class="bk-ptab${def === key ? ' on' : ''}" data-ptab="${key}" role="tab" aria-selected="${def === key ? 'true' : 'false'}">${label} · <b>${n}</b></button>`;
  const panel = (key, inner) => `<div class="bk-ppanel" data-ppanel="${key}" role="tabpanel"${def === key ? '' : ' hidden'}>${inner}</div>`;
  const postsInner = posts.length ? posts.map((p) => postCard(p, true)).join('') : '<div class="bk-ctx"><p>No posts yet.</p></div>';
  const testInner = (profTestimony ? `<div class="bk-proftest">“${esc(profTestimony)}”</div>` : '')
    + (test.length ? test.map((p) => postCard(p, true)).join('') : (profTestimony ? '' : '<div class="bk-ctx"><p>No testimonies yet.</p></div>'));
  const prayInner = prayers.length
    ? `<div class="bk-ctx"><p><b>${prayers.length} prayer request${prayers.length === 1 ? '' : 's'}</b> from ${esc(first)} on the wall, with <b>${prayingTotal} prayers lifted</b> over them by the family.</p></div>` + prayers.map((p) => postCard(p, true)).join('')
    : '<div class="bk-ctx"><p>No prayer requests yet.</p></div>';
  return `<div class="bk-proftabs"><div class="bk-tabrow" role="tablist">${tab('posts', 'Posts', posts.length)}${tab('testimonies', 'Testimonies', test.length)}${tab('prayers', 'Prayers', prayers.length)}</div>${panel('posts', postsInner)}${panel('testimonies', testInner)}${panel('prayers', prayInner)}</div>`;
}
function wireProfTabs(el) {
  el.querySelectorAll('[data-ptab]').forEach((b) => b.addEventListener('click', () => {
    const wrap = b.closest('.bk-proftabs'); if (!wrap) return;
    wrap.querySelectorAll('[data-ptab]').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
    wrap.querySelectorAll('[data-ppanel]').forEach((pn) => { pn.hidden = pn.dataset.ppanel !== b.dataset.ptab; });
  }));
}

async function viewProfile(id) {
  const ids = personIds(id);
  const carried = [...S.posts, ...S.testimonies].filter((p) => ids.has(p.authorId));
  const first = carried[0];
  const baked = (S.bakedMembers || []).find((m) => m.id === id);
  const name0 = first?.authorName || baked?.name || 'Member';
  S.root.querySelector('.bk-main').innerHTML = `<button type="button" class="bk-back" data-profback>← THE SANCTUARY</button>
    <div data-prof><div class="bk-ctx"><h3>${esc(name0)}</h3><p>Loading the full profile…</p></div></div>`;
  S.root.querySelector('[data-profback]')?.addEventListener('click', () => { location.hash = '#/community'; });
  let prof = S.profileCache.get(id) || null;
  if (!prof) {
    try { const j = await fetchJson(`${API_BASE}/api/community/members/${encodeURIComponent(id)}/profile`); prof = normalizeProfile(j); if (prof) S.profileCache.set(id, prof); } catch { /* carried fallback below */ }
  }
  if (S.view !== 'profile' || S.profileId !== id) return;
  /* M4 cure (2026-11-20): ONE post-count definition for directory and
     profile — the posts this build carries on the wall for this person,
     over every account id the split-account merge ties to them. In live
     mode the carried set wins over the profile payload's own totals:
     the payload counts every post the account ever made (154 against
     the directory's 42 for the same person), which is what made the
     surfaces disagree. The payload still backs the profile when the
     wall isn't live or carries none of the member's posts. */
  const posts = (S.mode === 'live' && carried.length) ? carried : (prof?.posts?.length ? ingestPosts(prof.posts) : carried);
  const carriedMeta = `<div class="meta" style="margin-top:10px">${posts.length} post${posts.length === 1 ? '' : 's'} in this ${S.mode === 'live' ? 'pull' : 'capture'}</div>`;
  const countsHtml = (S.mode === 'live' && carried.length && prof)
    ? profCountsHtml({ ...prof, postCount: carried.length }, carriedMeta)
    : (prof ? profCountsHtml(prof, carriedMeta) : carriedMeta);
  const name = prof?.displayName || name0;
  const el = S.root.querySelector('[data-prof]'); if (!el) return;
  /* ---------- amp-up phase 2C-3 — PROFILES PARITY (§2) ----------
     The header grid (§8d as ruled) is ONE builder for every profile:
     wide cover (the member's real cover, else the Phase 1 AI cover
     art — atmosphere only, labeled, never a fabricated photo of the
     person), the avatar overlapping it inside the §4 gold ring (real
     avatar or honest monogram), the name, and the counts line —
     posts · testimonies · prayers lifted, every number computed from
     the member's carried record (the chosen post set above), zero
     when the record carries none, never padded, never the payload's
     follower/friend totals dressed as this line. */
  const theirTestAll = posts.filter((p) => p.type === 'testimony');
  const theirPrayersAll = uniqPosts([...posts.filter((p) => p.type === 'prayer'), ...S.wallPosts.filter((p) => ids.has(p.authorId))]);
  const prayingTotalAll = theirPrayersAll.reduce((a, p) => a + (p.prayerCount || 0), 0);
  const countsLine = `<div class="bk-profcountsline"><b>${posts.length}</b> post${posts.length === 1 ? '' : 's'} · <b>${theirTestAll.length}</b> testimon${theirTestAll.length === 1 ? 'y' : 'ies'} · <b>${prayingTotalAll}</b> prayers lifted</div>`;
  const headerHtml = (coverUrl, avatarUrl, verified, metaLine) => {
    const cov = coverUrl || aiCoverFor(id);
    return `<div class="bk-profhero"><div class="bk-profcover"><span class="bk-profcovimg" style="background-image:url('${esc(cov)}')"></span><span class="bk-profgrad"></span><span class="bk-profglow"></span>${coverUrl ? '' : '<span class="bk-profcovnote">AI COVER ART · 16:3 FAITH</span>'}</div><div class="bk-profbody">
    <span class="bk-profava">${avatarHtml(name, avatarUrl, id === HOUSE_ID)}</span>
    <h2>${esc(name)}${verified ? ' <span class="bk-ver">✦</span>' : ''}</h2>
    ${metaLine ? `<div class="meta">${metaLine}</div>` : ''}
    ${countsLine}
  </div></div>`;
  };
  if (id === HOUSE_ID && prof) {
    const hTest = posts.filter((p) => p.type === 'testimony');
    const hPray = posts.filter((p) => p.type === 'prayer');
    const hPosts = posts.filter((p) => p.type !== 'testimony' && p.type !== 'prayer');
    const hPrayingTotal = hPray.reduce((a, p) => a + (p.prayerCount || 0), 0);
    el.innerHTML = `${headerHtml(prof.coverUrl, prof.avatarUrl, true, `${esc(prof.headline || '')}${prof.location ? ' · ' + esc(prof.location) : ''}`)}
    ${prof.bio ? `<p style="font-size:13.5px;line-height:1.65;color:#e2d9c2;margin:0 0 14px">${linkify(prof.bio)}</p>` : ''}
    ${aboutThemHtml(name, posts)}
    ${profTabsHtml(name, hPosts, hTest, hPray, hPrayingTotal, null)}`;
    wirePosts(el); wireProfTabs(el); return;
  }
  /* P1-7 + P1-8 (amp-up 2026-11-22) + 2C-3 (§2): the profile is a full
     page in two columns on desktop — DETAILS (only carried facts; a
     field with no data does not render) · CONNECTIONS (real shared
     circles only) · PHOTOS (the member's own post media only; the
     section does not render at all when there is none) · CIRCLES —
     beside the member's own voice: the FaithGuide ABOUT THEM card,
     TESTIMONIES and PRAYERS LIFTED (first-class since Phase 1), and
     their POSTS. Every number comes from the carried wall or the
     profile payload; a section with no data says so plainly instead
     of inventing content. */
  const theirTest = theirTestAll;
  const theirPosts = posts.filter((p) => p.type !== 'testimony' && p.type !== 'prayer');
  const theirPrayers = theirPrayersAll;
  const prayingTotal = prayingTotalAll;
  const groupIds = [...new Set(posts.map((p) => p.groupId).filter(Boolean))];
  const theirGroups = S.groups.filter((g) => groupIds.includes(g.id));
  const connections = profileConnections(ids, posts);
  const photos = profilePhotos(posts);
  const loc = prof?.location || first?.authorLocation || baked?.location || '';
  const aboutRows = [
    prof?.headline ? `<div><b>HEADLINE</b><span>${esc(prof.headline)}</span></div>` : '',
    loc ? `<div><b>LOCATION</b><span>${esc(loc)}</span></div>` : '',
    prof?.createdAt ? `<div><b>MEMBER SINCE</b><span>${fmtDate(prof.createdAt)}</span></div>` : '',
    theirGroups.length ? `<div><b>CIRCLES</b><span>${theirGroups.map((g) => esc(g.name)).join(' · ')}</span></div>` : '',
    prof?.bio ? `<div><b>ABOUT</b><span>${linkify(prof.bio)}</span></div>` : '',
  ].join('');
  const signedInSelf = !!(window.Clerk?.user?.id && window.Clerk.user.id === id);
  const metaLine = [loc, prof?.createdAt ? 'Member since ' + fmtDate(prof.createdAt) : ''].filter(Boolean).map(esc).join(' · ');
  el.innerHTML = `${headerHtml(prof?.coverUrl, prof?.avatarUrl || first?.authorAvatar || baked?.avatar, !!(prof?.isVerified || first?.authorVerified || baked?.verified), metaLine)}
  ${signedInSelf ? '<p class="bk-note" style="margin:0 0 14px">This is your profile, and you are signed in — this page is your public family face. Profile editing is the next member build; nothing here is simulated.</p>' : ''}
  <div class="bk-profgrid"><div class="bk-profcol">
  ${aboutRows ? `<h3 class="bk-secttl">About <em>${esc(name.split(' ')[0])}</em></h3><div class="bk-about">${aboutRows}</div>` : ''}
  <h3 class="bk-secttl">Their <em>connections</em></h3>
  ${connections.length
    ? `<div class="bk-friends">${connections.map((c) => `<button type="button" class="bk-friend" data-profile="${esc(c.id)}">${avatarHtml(c.name, c.avatar, c.id === HOUSE_ID)}<strong>${esc(c.name)}</strong><small>Shares ${esc(c.circle)}</small></button>`).join('')}</div>`
    : '<div class="bk-ctx"><p>No connections yet — the family is still finding them.</p></div>'}
  ${photos.length ? `<h3 class="bk-secttl">Their <em>photos</em></h3><div class="bk-photos">${photos.map((u) => `<img src="${esc(u)}" alt="Photo from this member's own post" loading="lazy">`).join('')}</div>` : ''}
  <h3 class="bk-secttl">Their <em>circles</em></h3>
  ${theirGroups.length
    ? theirGroups.map((g) => `<button type="button" class="bk-mini" data-view="groups" style="border:1px solid #353027;border-radius:10px;padding:10px 12px;margin-bottom:8px;width:100%"><span class="bk-gcover">${esc(initials(g.name))}</span><span class="mi"><strong>${esc(g.name)}</strong><small>${g.memberCount} member${g.memberCount === 1 ? '' : 's'} · posting here from this member's wall</small></span></button>`).join('')
    : '<div class="bk-ctx"><p>Group membership is member-account data — it opens with sign-in. The circles themselves are all on the Groups door.</p></div>'}
  </div><div class="bk-profcol">
  ${aboutThemHtml(name, posts)}
  ${profTabsHtml(name, theirPosts, theirTest, theirPrayers, prayingTotal, prof?.testimony)}
  </div></div>`;
  wirePosts(el); wireProfTabs(el);
  el.querySelectorAll('[data-view]').forEach((n) => n.addEventListener('click', () => { S.view = n.dataset.view; S.gateOpen = false; paint(); window.scrollTo(0, 0); }));
}

/* ---------- amp-up phase 2C-4 — STORIES VIEWER (§8c OPS SPEC) ----------
   Tapping a story ring opens the member's actual post full-screen:
   segmented progress (one segment per story in the tray set), 5s
   auto-advance (never under reduced motion — tap-only there), paused
   on press-and-hold, left/right tap zones, swipe-down or ✕ to close,
   Esc/arrows on desktop. Every story SHOWN is written back through
   2C-1's markStoryViewed, and its ring dims in place — no repaint. */
const STORY_MS = 5000;
function storyProgress(v) {
  const seg = v.el?.querySelectorAll('.bk-vseg i')[v.idx];
  if (seg) seg.style.transform = `scaleX(${Math.min(1, v.elapsed / STORY_MS)})`;
}
function renderStory(v) {
  const p = v.set[v.idx]; if (!p) { closeStoryViewer(); return; }
  markStoryViewed(p.authorId);
  [...(S.root?.querySelectorAll('.bk-ring') || [])].find((r) => r.dataset.ring === p.authorId)?.classList.add('viewed');
  v.elapsed = 0;
  const kind = p.type === 'testimony' ? '✦ TESTIMONY' : p.type === 'prayer' ? '✛ PRAYER REQUEST' : '✎ POST';
  const media = (p.media || []).map((m) => m?.url ? `<img class="bk-postimg" src="${esc(m.url)}" alt="" loading="lazy">` : '').join('');
  v.el.innerHTML = `
    <div class="bk-vsegs">${v.set.map((_, i) => `<span class="bk-vseg${i < v.idx ? ' done' : ''}"><i></i></span>`).join('')}</div>
    <div class="bk-vhead">${avatarHtml(p.authorName, p.authorAvatar, p.authorId === HOUSE_ID)}<span><b>${esc(p.authorName)}</b><small>${relTime(p.createdAt)}${p.authorLocation ? ' · ' + esc(p.authorLocation) : ''}</small></span>
      <button type="button" class="bk-vclose" data-vclose aria-label="Close stories">✕</button></div>
    <div class="bk-vstage" data-vstage>
      <div class="bk-vkind">${kind}</div>
      <p class="bk-vbody">${linkify(p.body)}</p>${media}
      <button type="button" class="bk-vzone prev" data-vprev aria-label="Previous story"></button>
      <button type="button" class="bk-vzone next" data-vnext aria-label="Next story"></button>
    </div>
    <div class="bk-vfoot"><button type="button" class="bk-vprof" data-vprof>VIEW ${esc(p.authorName.split(' ')[0].toUpperCase())}'S PROFILE ›</button></div>`;
  v.el.querySelector('[data-vclose]')?.addEventListener('click', () => closeStoryViewer());
  v.el.querySelector('[data-vprev]')?.addEventListener('click', () => storyGo(v, -1));
  v.el.querySelector('[data-vnext]')?.addEventListener('click', () => storyGo(v, 1));
  v.el.querySelector('[data-vprof]')?.addEventListener('click', () => { const id = p.authorId; closeStoryViewer(); openProfile(id); });
  const stage = v.el.querySelector('[data-vstage]');
  stage?.addEventListener('pointerdown', () => { v.paused = true; });
  stage?.addEventListener('pointerup', () => { v.paused = false; });
  stage?.addEventListener('pointerleave', () => { v.paused = false; });
  let ty = null;
  v.el.addEventListener('touchstart', (e) => { ty = e.touches[0]?.clientY ?? null; }, { passive: true });
  v.el.addEventListener('touchend', (e) => { if (ty != null && (e.changedTouches[0]?.clientY ?? ty) - ty > 70) closeStoryViewer(); ty = null; }, { passive: true });
}
function storyGo(v, d) {
  const n = v.idx + d;
  if (n < 0) return;
  if (n >= v.set.length) { closeStoryViewer(); return; }
  v.idx = n; renderStory(v);
}
function openStoryViewer(authorId) {
  const set = storySet();
  if (!set.length || !S.root) return;
  let idx = set.findIndex((p) => p.authorId === authorId);
  if (idx < 0) idx = 0;
  closeStoryViewer();
  const el = document.createElement('div');
  el.className = 'bk-viewer'; el.setAttribute('data-viewer', '');
  const v = { set, idx, elapsed: 0, paused: false, el, timer: null, key: null };
  S.storyViewer = v;
  S.root.appendChild(el);
  renderStory(v);
  v.key = (e) => {
    if (e.key === 'Escape') closeStoryViewer();
    else if (e.key === 'ArrowRight') storyGo(v, 1);
    else if (e.key === 'ArrowLeft') storyGo(v, -1);
  };
  document.addEventListener('keydown', v.key);
  v.timer = setInterval(() => {
    if (!el.isConnected) { closeStoryViewer(); return; }
    if (v.paused || PV_REDUCED) return;
    v.elapsed += 50; storyProgress(v);
    if (v.elapsed >= STORY_MS) storyGo(v, 1);
  }, 50);
}
function closeStoryViewer() {
  const v = S.storyViewer; if (!v) return;
  if (v.timer) clearInterval(v.timer);
  if (v.key) document.removeEventListener('keydown', v.key);
  v.el?.remove();
  S.storyViewer = null;
}

/* ---------- amp-up phase 2C-4 — NEW-POSTS PILL (§5 ADAPT) ----------
   The lightest honest signal: a periodic re-read of the live head
   slice (45s, live mode + feed view only). The pill appears ONLY
   when that re-read carries posts the wall does not hold and they
   are at least as new as the rendered head — never on a timer
   alone, never in snapshot mode. Tapping it merges the held posts
   at the head and lands them via the preserved paint (blink law:
   film + chrome survive; scroll goes to the new head on purpose —
   that IS the tap's request). */
async function checkNewPosts() {
  if (S.mode !== 'live' || S.view !== 'feed' || document.hidden) return;
  try {
    const j = await fetchJson(`${API_BASE}/api/community/posts?limit=25`);
    const live = ingestPosts(j.posts);
    const held = new Set([...S.posts, ...S.testimonies].map((p) => p.id));
    const head = [...S.posts, ...S.testimonies].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
    const fresh = live.filter((p) => !held.has(p.id) && (!head || String(p.createdAt) >= String(head.createdAt)));
    if (!fresh.length) return;
    S.pendingNew = fresh;
    const wrap = S.root?.querySelector('[data-newpill]');
    if (wrap) {
      wrap.querySelector('[data-newpillbtn]').textContent = `✦ ${fresh.length} NEW POST${fresh.length === 1 ? '' : 'S'} — TAP TO SEE`;
      wrap.hidden = false;
    }
  } catch { /* a failed re-read shows nothing — no simulated liveness */ }
}
function applyPendingNew() {
  if (!S.pendingNew.length) return;
  const fresh = [...S.pendingNew].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  S.pendingNew = [];
  for (const p of fresh) {
    const list = p.type === 'testimony' ? S.testimonies : S.posts;
    if (!list.some((x) => x.id === p.id)) list.unshift(p);
  }
  S.feedShown = Math.max(S.feedShown, PAGE);
  paint(true);
  window.scrollTo(0, 0);
  const nm = S.root?.querySelector('.bk-main'); if (nm) nm.scrollTop = 0;
}

/* ---------- amp-up phase 2C-4 fold-in (1) — DELETE OWN POST ----------
   Own posts only (signed-in identity vs post author, split-account
   aware via personIds). A confirm step gates the DELETE call; on
   200 the post leaves every held list and its card is removed IN
   PLACE — no repaint (blink law). On failure the card stays and the
   member reads the server's own words. */
async function memberDeletePost(card, gate, post, yesBtn) {
  yesBtn.disabled = true;
  try {
    await deleteJson(`${API_BASE}/api/community/posts/${encodeURIComponent(post.id)}`);
    for (const k of ['posts', 'testimonies', 'wallPosts']) S[k] = (S[k] || []).filter((p) => p.id !== post.id);
    card.remove();
  } catch (err) {
    gate.innerHTML = `<b>That delete didn't go through.</b> ${esc(err.message)} Your post is still on the wall.`;
    gate.classList.add('open');
  }
}

/* ---------------- comments ---------------- */
async function fillComments(box, post) {
  box.innerHTML = '<p class="bk-cnote">Loading comments from the live community API…</p>';
  let rows = S.commentsCache.get(post.id);
  if (!rows) {
    try { const j = await fetchJson(`${API_BASE}/api/community/posts/${encodeURIComponent(post.id)}/comments`); rows = j.comments || []; S.commentsCache.set(post.id, rows); }
    catch { box.innerHTML = `<p class="bk-cnote">Comments for this post load from the live community API, which did not answer from this network. The count on the card is the post's real recorded count (${post.commentCount}).</p>`; box.dataset.loaded = 'err'; return; }
  }
  box.dataset.loaded = '1';
  /* F-CLERK: a signed-in member gets the reply form (POST below);
     guests keep the honest gate note. Reading is open to everyone. */
  const tail = isSignedIn()
    ? `<form class="bk-cform" data-cform><input class="bk-cinput" data-cinput type="text" maxlength="2000" placeholder="Add your voice…" aria-label="Write a comment"><button class="bk-csend" type="submit">REPLY</button></form><p class="bk-cnote" data-cstatus style="margin-top:6px"></p>`
    : `<p class="bk-cnote" style="margin-top:8px">Commenting opens with member sign-in — join free or sign in (top right) to add your voice. Reading is open to everyone.</p>`;
  box.innerHTML = (rows.length ? rows.map((cm) => `
    <div class="bk-cline">${avatarHtml(cm.authorName, cm.authorAvatar, cm.authorId === HOUSE_ID)}
      <div class="bk-bubble"><b data-profile="${esc(cm.authorId || '')}" style="cursor:pointer">${esc(cm.authorName)}</b><span>${relTime(cm.createdAt)}</span><p>${linkify(cm.body || '')}</p></div></div>`).join('')
    : '<p class="bk-cnote">No comments yet on this post.</p>')
    + tail;
  box.querySelectorAll('[data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
  const form = box.querySelector('[data-cform]');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('[data-cinput]');
    const status = box.querySelector('[data-cstatus]');
    const btn = form.querySelector('.bk-csend');
    const body = (input?.value || '').trim();
    if (!body) return;
    if (btn) btn.disabled = true;
    try {
      await postJson(`${API_BASE}/api/community/posts/${encodeURIComponent(post.id)}/comments`, { body });
      S.commentsCache.delete(post.id);
      post.commentCount = (post.commentCount || 0) + 1;
      await fillComments(box, post);
    } catch (err) { if (status) status.textContent = err.message; }
    if (btn) btn.disabled = false;
  });
}
async function toggleComments(card, post) {
  const box = card.querySelector('[data-commentsbox]');
  const open = box.classList.toggle('open');
  S.commentsOpen[open ? 'add' : 'delete'](post.id);
  if (!open || box.dataset.loaded) return;
  await fillComments(box, post);
}

/* ---------------- events ---------------- */
const ACT_GATES = {
  amen: '<b>Amen is a member tap.</b> Reactions save to your 16:3 Faith account — the counts on every card are the family\'s real totals, and your Amen joins them the moment you join free or sign in (top right).',
  pray: '<b>Praying is a member tap.</b> The praying counts on the wall are real, kept by the community API. Join free or sign in (top right) and your tap adds yours — and the family sees someone stood with them.',
  share: '<b>Sharing is a member action.</b> The share counts on the cards are the real recorded totals. Sharing opens with your account — join free or sign in (top right).',
  save: '<b>Saved posts live in your account.</b> Bookmarks are personal account state — nothing is stored on this device. Your saves collect on the Saved Posts door once you join free or sign in.',
};
/* ---------------- member acts (F-CLERK) ----------------
   AMEN and PRAY post to the SAME server handler (/react) with the
   member's reaction type, under the DEPLOYED API's own names —
   proven live 2026-11-22 (LEG R): the deployed react route accepts
   'amen' as a first-class type and answers with the full keyspace
   {love, pray, fire, amen, blessing} + prayerCount + myReactionType.
   The server toggles (same type off, different type switches — one
   reaction row per member per post) and its response is the truth:
   the counts are merged VERBATIM from it and the card repaints from
   the merged post — never counted client-side.
   HISTORY: AMEN used to ride as 'praise', which the server buckets
   into pray — so the AMEN count (reactionCounts.amen) never moved
   and every AMEN/PRAY tap after the first was a same-bucket switch:
   the founder's live report "reactions don't land on other members'
   posts" (2026-11-22 re-walk). 'praise' remains a valid server type
   (it feeds the pray bucket) but it is not AMEN's name.
   Authors can't react to their own posts (403) and the terms gate
   can 403 too; either way the server's own words are what the
   member reads. SHARE/SAVE have no client-facing server contract
   on this wall, so members get the honest word — never a fake
   count. */
const MEMBER_ACT_NOTES = {
  share: '<b>Sharing rides your own channels today.</b> The share counts on the cards are the family\'s recorded totals; an in-house share button is on the build list — not faked here. Copy the wall link from your browser and drop it where your people are.',
  save: '<b>Your saved shelf is account state.</b> It opens on the Saved Posts door with the full member build — the save tap is not wired on this wall yet, and nothing is quietly stored on this device to pretend otherwise.',
};
function repaintCard(card, post) {
  const tmp = document.createElement('div');
  tmp.innerHTML = postCard(post, !!card.closest('[data-prof]'));
  const fresh = tmp.firstElementChild;
  if (!fresh) return;
  card.replaceWith(fresh);
  wirePosts(fresh);
}
async function memberReact(card, gate, act, post, btn) {
  const type = act === 'amen' ? 'amen' : 'pray';
  btn.disabled = true;
  try {
    const r = await postJson(`${API_BASE}/api/community/posts/${encodeURIComponent(post.id)}/react`, { type });
    if (r.reactionCounts) {
      /* LEG R cure: merge the server's keyspace verbatim — the old
         merge read ghost keys (rc.praise / rc.blessed) the response
         never carries and pinned amen/blessing at their old values. */
      const rc = r.reactionCounts, cur = post.reactionCounts || {};
      post.reactionCounts = {
        love: rc.love ?? cur.love ?? 0,
        pray: rc.pray ?? cur.pray ?? 0,
        fire: rc.fire ?? cur.fire ?? 0,
        amen: rc.amen ?? cur.amen ?? 0,
        blessing: rc.blessing ?? cur.blessing ?? 0,
      };
    }
    if (typeof r.prayerCount === 'number') post.prayerCount = r.prayerCount;
    if ('myReactionType' in r) post.myReactionType = r.myReactionType;
    holdRxTruth(post); /* 2C-4 fold-in (2): the response is session truth from here on */
    repaintCard(card, post);
  } catch (err) {
    gate.innerHTML = `<b>That tap didn't land.</b> ${esc(err.message)}`;
    gate.dataset.kind = act; gate.classList.add('open');
  }
  btn.disabled = false;
}

function findPost(id) { return [...S.posts, ...S.testimonies, ...(S.wallPosts || [])].find((p) => p.id === id); }
function wirePosts(scope) {
  scope.querySelectorAll('[data-profile]').forEach((n) => { if (n.closest('[data-storyopen]')) return; n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }); });
  /* 2C-4 fold-in (1): delete-own-post — the confirm step renders in
     the card's own gate strip and gates the DELETE call. */
  scope.querySelectorAll('[data-delpost]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const post = findPost(card?.dataset.post);
    const gate = card?.querySelector('[data-actgate]');
    if (!post || !gate || !isOwnPost(post)) return;
    gate.innerHTML = `<span class="bk-delconfirm"><b>Delete this post?</b><span>It leaves the wall for good.</span><button type="button" class="bk-del-yes" data-delyes>DELETE IT</button><button type="button" class="bk-del-no" data-delno>KEEP IT</button></span>`;
    gate.dataset.kind = 'delete'; gate.classList.add('open');
    gate.querySelector('[data-delno]')?.addEventListener('click', () => { gate.classList.remove('open'); gate.innerHTML = ''; });
    gate.querySelector('[data-delyes]')?.addEventListener('click', (e) => memberDeletePost(card, gate, post, e.currentTarget));
  }));
  scope.querySelectorAll('[data-comments]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const post = findPost(card?.dataset.post); if (post) toggleComments(card, post);
  }));
  scope.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const gate = card?.querySelector('[data-actgate]'); if (!gate) return;
    const act = btn.dataset.act;
    if (isSignedIn()) {
      if (act === 'amen' || act === 'pray') {
        const post = findPost(card.dataset.post);
        if (post) { memberReact(card, gate, act, post, btn); return; }
      }
      const wasM = gate.classList.contains('open') && gate.dataset.kind === act;
      gate.innerHTML = MEMBER_ACT_NOTES[act] || ''; gate.dataset.kind = act;
      gate.classList.toggle('open', !wasM);
      return;
    }
    const was = gate.classList.contains('open') && gate.dataset.kind === act;
    gate.innerHTML = ACT_GATES[act] || ''; gate.dataset.kind = act;
    gate.classList.toggle('open', !was);
  }));
  scope.querySelectorAll('[data-seemore]').forEach((btn) => btn.addEventListener('click', () => {
    const card = btn.closest('[data-post]'); const post = findPost(card?.dataset.post); if (!post) return;
    card.querySelector('.bk-posttext').innerHTML = linkify(post.body); btn.remove();
  }));
}
function goHub(hub) { if (location.hash !== '#/' + hub) location.hash = '#/' + hub; else if (S.navigate) S.navigate(hub); }
function openProfile(id) {
  if (!id) return;
  /* P1-6: a profile is a page — navigate by its hash route so the URL
     is shareable and the back button is sane. The shell re-renders
     this hub on the hash change and render() parses the route; only
     when the hash already names this profile do we paint directly. */
  const target = '#/community/profile/' + encodeURIComponent(id);
  if (location.hash !== target) { location.hash = target; return; }
  S.view = 'profile'; S.profileId = id; paint(); viewProfile(id);
}
/* ---------- COMMUNITY RESTORE R-5 (2026-11-23) — COMPOSER FAB.
   The original's floating gold composer FAB + slide-up drawer
   (study §2.4 item 4, §3 row 6, §4 R-5), rebuilt fresh. The FAB and
   its scrim are PERSISTENT elements: created once with one listener
   each, held in module vars, and re-appended to S.root at the end
   of every paint() — paint replaces root.innerHTML wholesale, and
   re-appending the same node is the blink cure's film carry-over
   pattern, so the button's identity (and its spring-in, which runs
   once on creation) survives every repaint and settle untouched.
   Visibility is class-only. The sheet never moves or clones the
   composer: it adds .bk-sheet to the existing #bk-composer, so the
   node, the type map, the send wiring and the guest gate are the
   composer's own, unchanged. Guests never see a sheet — their tap
   rides the shell's #btn-join, exactly like the lobby's JOIN. */
let fabNode = null, scrimNode = null, sheetXNode = null;
function fabEl() {
  if (fabNode) return fabNode;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'bk-fab off'; b.dataset.fab = '1';
  b.setAttribute('aria-label', 'Share your heart — write a post');
  b.textContent = '✎';
  b.addEventListener('click', onFabTap);
  fabNode = b; return b;
}
function scrimEl() {
  if (scrimNode) return scrimNode;
  const d = document.createElement('div');
  d.className = 'bk-scrim off'; d.dataset.scrim = '1'; d.setAttribute('aria-hidden', 'true');
  d.addEventListener('click', () => closeSheet());
  scrimNode = d; return d;
}
function sheetXEl() {
  if (sheetXNode) return sheetXNode;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'bk-sheetx'; b.dataset.sheetx = '1';
  b.setAttribute('aria-label', 'Close the composer');
  b.textContent = '✕';
  b.addEventListener('click', () => closeSheet());
  sheetXNode = b; return b;
}
function onFabTap() {
  if (S.view !== 'feed' && S.view !== 'doors') return;
  if (isSignedIn()) { openSheet(); return; }
  /* Guests: JOIN — the shell's own button (the R-1 lobbyjoin route).
     Fallback, if that button is ever absent: the composer's own
     in-wall gate, opened and scrolled to. */
  const join = document.getElementById('btn-join');
  if (join) { join.click(); return; }
  S.gateOpen = true; paint();
  S.root?.querySelector('#bk-composer')?.scrollIntoView({ block: 'center' });
}
function openSheet() {
  S.sheetOpen = true; S._flashAtOpen = S.composerFlash;
  syncFab();
  /* Let the slide-up start, then put the member's cursor in the
     existing textarea — the sheet is that composer, presented. */
  setTimeout(() => { if (S.sheetOpen) S.root?.querySelector('[data-composer-input]')?.focus({ preventScroll: true }); }, 60);
}
function closeSheet() {
  if (!S.sheetOpen) return;
  S.sheetOpen = false; S._flashAtOpen = null;
  syncFab();
}
function syncSheet() {
  const comp = S.root?.querySelector('#bk-composer');
  const scrim = scrimEl();
  if (S.sheetOpen && comp) {
    comp.classList.add('bk-sheet');
    if (!comp.contains(sheetXEl())) comp.appendChild(sheetXEl());
    scrim.classList.remove('off');
  } else {
    if (comp) comp.classList.remove('bk-sheet');
    sheetXEl().remove();
    scrim.classList.add('off');
  }
}
function syncFab() {
  if (!S.root) return;
  /* A share that lands while the sheet is open closes the sheet in
     the same paint: the member returns to the wall their post now
     leads (the flash rides the composer back in-wall). A flash that
     merely pre-dates this opening (equal to _flashAtOpen) is not a
     new share and never closes anything. */
  if (S.sheetOpen && S.composerFlash && S.composerFlash !== S._flashAtOpen) closeSheetSilent();
  const fab = fabEl();
  if (fab.parentNode !== S.root) S.root.appendChild(fab);
  const scrim = scrimEl();
  if (scrim.parentNode !== S.root) S.root.appendChild(scrim);
  syncSheet();
  const show = (S.view === 'feed' || S.view === 'doors') && !S.sheetOpen && !S.compFocused;
  fab.classList.toggle('off', !show);
}
function closeSheetSilent() { S.sheetOpen = false; S._flashAtOpen = null; }
function mountFab() { syncFab(); }
/* Focus + Esc tracking, wired once per hub root: the FAB hides
   while the member is typing in the in-wall composer (it must never
   sit over the keyboard end of the box), and Esc closes the sheet. */
function wireFabRoot(root) {
  if (!root || root.__fabWired) return;
  root.__fabWired = true;
  root.addEventListener('focusin', (e) => {
    if (e.target?.matches?.('[data-composer-input]')) { S.compFocused = true; syncFab(); }
  });
  root.addEventListener('focusout', (e) => {
    if (e.target?.matches?.('[data-composer-input]')) { S.compFocused = false; syncFab(); }
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && S.sheetOpen) closeSheet();
  });
}

/* ---------- R-7 — PHONE TAB BAR (study §4 R-7) ----------
   The original's phone chrome, inside Community only: a
   mount-once fixed bar (the FAB pattern — one node, one
   delegated listener, re-appended at every paint tail) that
   takes the shell bottom bar's band while this hub is mounted
   and leaves with the root on hub switch (the shell replaces
   the hub container per navigation). CSS16 owns visibility:
   phone width only (≤768px), z-63 — above the shell bar (60),
   below the FAB (64) and FaithGuide (65), whose standing
   offsets clear the band by 16px untouched. Tabs map to real
   destinations only (study §3 row 13): COMMUNITY is the hub's
   home, SANCTUARY the Listen hub, BIBLE + DEVOTIONAL the Read
   hub (the original's own mapping), ASK FAITH the shell's
   Faith Answers bar via the lobby ASK chip's exact call.
   COMMUNITY carries the active gold: the member is here. No
   tab carries a count or a badge — none exists honestly. */
let tabBarNode = null;
function tabBarEl() {
  if (tabBarNode) return tabBarNode;
  const d = document.createElement('nav');
  d.className = 'bk-tabbar'; d.dataset.tabbar = '1';
  d.setAttribute('aria-label', 'Community phone tabs');
  const tab = (id, ico, label, on) => `<button type="button" class="bk-tab${on ? ' on' : ''}" data-tab="${id}"${on ? ' aria-current="page"' : ''}><span class="bk-tab-ico">${ico}</span>${label}</button>`;
  d.innerHTML = tab('community', '⌂', 'Community', true) + tab('listen', '♪', 'Sanctuary') + tab('bible', '✞', 'Bible') + tab('devotional', '✧', 'Devotional') + tab('ask', '✦', 'Ask Faith');
  d.addEventListener('click', (e) => {
    const b = e.target?.closest?.('[data-tab]'); if (!b) return;
    onTabTap(b.dataset.tab);
  });
  tabBarNode = d; return d;
}
function onTabTap(id) {
  if (id === 'listen') { goHub('listen'); return; }
  if (id === 'bible' || id === 'devotional') { goHub('read'); return; }
  if (id === 'ask') {
    const fa = document.getElementById('fa-input');
    if (fa) { fa.scrollIntoView({ block: 'center' }); fa.focus(); }
    return;
  }
  /* community — home: a profile sub-route exits by the hash (the
     profile back button's own route); inside the hub it is the
     feed view and the top of the wall. */
  if (location.hash !== '#/community') { location.hash = '#/community'; return; }
  if (S.view !== 'feed') { S.view = 'feed'; paint(); }
  window.scrollTo({ top: 0, behavior: window.FaithFilm?.reduced ? 'auto' : 'smooth' });
}
function mountTabBar() {
  if (!S.root) return;
  const bar = tabBarEl();
  if (bar.parentNode !== S.root) S.root.appendChild(bar);
}

function paint(keepScroll = false) {
  /* P1-1: the doors grid is retired as a landing — the hub opens IN
     the feed (template: community.tsx). viewDoors stays defined for
     the record; every 'doors' state resolves to the feed. */
  /* BLINK CURE (2026-11-22): a DATA repaint (keepScroll — the live
     upgrade + the chain's settle paint) preserves two things the old
     full rebuild destroyed: (1) the film ELEMENT — when the new frame
     carries the same film, the playing element itself is carried
     over, so playback never restarts and its FaithFilm wiring (now
     idempotent in shell.js) survives untouched; (2) the reader's
     scroll position — restored synchronously before the browser can
     paint the collapsed intermediate. Navigation paints (tab taps)
     keep the old behavior. */
  const y = keepScroll ? window.scrollY : 0;
  /* 2C-1: on desktop the wall is its own scroll region (.bk-main) —
     a preserved repaint restores its scrollTop exactly as it does
     the window's on phone. */
  const mainY = keepScroll ? (S.root.querySelector('.bk-main')?.scrollTop || 0) : 0;
  const oldFilm = keepScroll ? S.root.querySelector('[data-hubfilm]') : null;
  const oldFilmSrc = oldFilm?.querySelector('video source')?.getAttribute('src') || null;
  const mains = { doors: viewFeed, feed: viewFeed, testimonies: viewTestimonies, members: viewMembers, groups: viewGroups, messages: viewMessages, saved: viewSaved };
  S.root.innerHTML = frame(S.view === 'profile' ? '<div data-prof><div class="bk-ctx"><h3>Profile</h3><p>Loading…</p></div></div>' : (mains[S.view] || viewDoors)());
  if (oldFilm && oldFilmSrc) {
    const newFilm = S.root.querySelector('[data-hubfilm]');
    if (newFilm && newFilm.querySelector('video source')?.getAttribute('src') === oldFilmSrc) newFilm.replaceWith(oldFilm);
  }
  if (y) window.scrollTo(0, y);
  if (mainY) { const nm = S.root.querySelector('.bk-main'); if (nm) nm.scrollTop = mainY; }
  if (window.FaithFilm) window.FaithFilm.wire(S.root);
  if (window.FaithMotion) window.FaithMotion.armReveals(S.root);
  const main = S.root.querySelector('.bk-main');
  S.root.querySelectorAll('[data-view]').forEach((n) => n.addEventListener('click', () => {
    const t0 = n.dataset.t0 != null ? performance.now() : null;
    S.view = n.dataset.view; S.gateOpen = false;
    paint();
    if (t0 != null) { const ms = String(Math.round((performance.now() - t0) * 10) / 10); S.root.dataset.doorMs = ms; const hr = S.root.closest('#hub-root'); if (hr && hr !== S.root) hr.dataset.doorMs = ms; }
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
  /* F-CLERK: the member composer's share button — POSTs the post, then
     lands it at the head of the wall from the server's own returned row
     (a head-slice refetch covers any other response shape). The 60s
     double-submit guard and the sentence rule are the server's; its
     message is what the member reads. */
  const sendBtn = main.querySelector('[data-composersend]');
  if (sendBtn) sendBtn.addEventListener('click', async () => {
    const input = main.querySelector('[data-composer-input]');
    const status = main.querySelector('[data-composer-status]');
    const say = (html) => { if (status) { status.hidden = false; status.innerHTML = html; } };
    const body = (input?.value || '').trim();
    if (!body) { say('Write a line or two first — a sentence is plenty.'); return; }
    sendBtn.disabled = true; say('Sharing…');
    try {
      const j = await postJson(`${API_BASE}/api/community/posts`, { type: COMPOSE_API_TYPE[S.composeType] || 'general', body });
      if (input) input.value = '';
      S.composerFlash = '<b>Shared.</b> Your post is on the wall — it leads the feed below.';
      const mine = j?.post?.id ? ingestPosts([j.post]) : [];
      if (mine.length) {
        const p = mine[0];
        /* FOLD D: the member's own fresh post lands glowing. */
        S.freshGlow = { id: p.id, at: Date.now() };
        const list = p.type === 'testimony' ? S.testimonies : S.posts;
        if (!list.some((x) => x.id === p.id)) list.unshift(p);
        S.feedFilter = 'all'; S.feedShown = PAGE;
        paint();
      } else {
        try {
          const first = await fetchJson(`${API_BASE}/api/community/posts?limit=25`);
          const live = ingestPosts(first.posts);
          if (live.length) {
            S.posts = live.filter((p) => p.type !== 'testimony');
            const lt = live.filter((p) => p.type === 'testimony');
            if (lt.length) S.testimonies = lt;
            S.mode = 'live'; S.loaded = true;
            /* FOLD D: the refetched head is the member's fresh post. */
            const head = (S.composeType === 'testimony' ? lt[0] : S.posts[0]);
            if (head) S.freshGlow = { id: head.id, at: Date.now() };
          }
        } catch { /* the wall catches up on its next load */ }
        paint();
      }
    } catch (err) { say(esc(err.message)); }
    sendBtn.disabled = false;
  });
  main.querySelectorAll('[data-feedfilter]').forEach((n) => n.addEventListener('click', () => { S.feedFilter = n.dataset.feedfilter; S.feedShown = PAGE; paint(); }));
  /* RESTORE R-1 + R-2 wiring (2026-11-23): sort segment, the lobby
     actions, the search pill, the Faith Answers chip, and the pulse
     count-up. JOIN rides the shell's own #btn-join (the real Clerk
     route the header button uses); ENTER scrolls to the wall; the
     profile circle opens the member's own profile. */
  main.querySelectorAll('[data-feedsort]').forEach((n) => n.addEventListener('click', () => { S.feedSort = n.dataset.feedsort; S.feedShown = PAGE; paint(); }));
  S.root.querySelectorAll('[data-lobbyjoin]').forEach((n) => n.addEventListener('click', () => {
    const b = document.getElementById('btn-join');
    if (b) b.click(); else window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
  main.querySelectorAll('[data-lobbyenter]').forEach((n) => n.addEventListener('click', () => {
    S.root.querySelector('.bk-feedsec')?.scrollIntoView({ behavior: window.FaithFilm?.reduced ? 'auto' : 'smooth', block: 'start' });
  }));
  main.querySelectorAll('[data-lobbyprofile]').forEach((n) => n.addEventListener('click', () => { const id = myId(); if (id) openProfile(id); }));
  S.root.querySelectorAll('[data-askfaith]').forEach((n) => n.addEventListener('click', () => {
    const fa = document.getElementById('fa-input');
    if (fa) { fa.scrollIntoView({ block: 'center' }); fa.focus(); }
  }));
  const lobbySearch = main.querySelector('[data-lobbysearch]');
  if (lobbySearch) lobbySearch.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = lobbySearch.querySelector('input').value.trim();
    S.peopleQuery = q; S.peopleResults = null; S.view = 'members'; paint();
    if (!q) return;
    try { const j = await fetchJson(`${API_BASE}/api/community/members/search?q=${encodeURIComponent(q)}`); S.peopleResults = j.results || []; }
    catch { S.peopleResults = null; }
    if (S.view === 'members') paint();
  });
  wirePulseCountUp();
  /* R-6 FOLD B: the LOAD MORE buttons are retired — the scroll
     sentinels (feed + testimonies tape) arm here, once per paint. */
  armSentinels();
  /* FOLD F: arm the lobby scene beat (dismisses itself). */
  armBeat();
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
  /* AUDIT CURE D-3 (2026-11-24): typing in the directory search
     narrows the rendered grid IN PLACE — no repaint, so the reader
     keeps focus and scroll (the consult's ruling for this cure).
     Submit above stays the authoritative path (live search + repaint
     with the filtered grid). Clearing the box restores the full
     directory through the same repaint the submit path uses. */
  if (form) {
    const dirInput = form.querySelector('input');
    dirInput.addEventListener('input', () => {
      const value = dirInput.value;
      const query = value.trim().toLowerCase();
      if (!query) {
        if (S.peopleQuery) { S.peopleQuery = ''; S.peopleResults = null; paint(); }
        return;
      }
      S.peopleQuery = value;
      const grid = main.querySelector('.bk-mgrid');
      if (!grid) return;
      let visible = 0;
      grid.querySelectorAll('.bk-mcard').forEach((card) => {
        const hit = card.textContent.toLowerCase().includes(query);
        card.style.display = hit ? '' : 'none';
        if (hit) visible += 1;
      });
      let line = main.querySelector('[data-dirfilter]');
      if (!line) {
        line = document.createElement('p');
        line.className = 'bk-note'; line.setAttribute('data-dirfilter', '');
        grid.parentNode.insertBefore(line, grid);
      }
      line.innerHTML = `Showing <b style="color:var(--gold)">${visible}</b> of ${grid.dataset.dirtotal || grid.querySelectorAll('.bk-mcard').length} profiles for &ldquo;${esc(value.trim())}&rdquo;.`;
      const none = main.querySelector('[data-dirnone]');
      if (none) none.hidden = visible !== 0;
    });
  }
  /* R-6: the right rail's Member Search — the same live directory
     search, answered into the rail's results box in place (no
     repaint: the reader never loses the wall or their scroll). */
  S.root.querySelectorAll('[data-railsearch]').forEach((railForm) => railForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = railForm.querySelector('input').value.trim();
    S.railSearchQ = q;
    if (!q) { S.railSearch = null; patchRailSearch(); return; }
    S.railSearch = { busy: true, source: 'live', rows: [] };
    patchRailSearch();
    try {
      const j = await fetchJson(`${API_BASE}/api/community/members/search?q=${encodeURIComponent(q)}`);
      S.railSearch = { source: 'live', rows: (j.results || []).slice(0, 5).map((r) => ({ userId: r.userId, name: r.displayName, avatar: r.avatarUrl, sub: [r.location, r.headline].filter(Boolean).join(' · ') })) };
    } catch {
      S.railSearch = { source: 'directory', rows: (S.members || []).filter((m) => m.id && (m.name + ' ' + (m.location || '')).toLowerCase().includes(q.toLowerCase())).slice(0, 5).map((m) => ({ userId: m.id, name: m.name, avatar: m.avatar, sub: m.location || '' })) };
    }
    patchRailSearch();
  }));
  wirePosts(main);
  pvObserve(main);
  /* 2C-1 §4.3 + 2C-4 §8c: a story tap opens the full-screen viewer
     (wirePosts skips these buttons' profile binding). Opening the
     viewer is the real story open that writes the viewed state; the
     viewer marks each story it shows and dims its ring in place. */
  main.querySelectorAll('button.bk-story[data-storyopen]').forEach((n) => n.addEventListener('click', () => {
    openStoryViewer(n.getAttribute('data-storyopen'));
  }));
  /* 2C-4: PYMK rows in the desktop right rail ride openProfile too
     (wirePosts covers the main column's copies). */
  S.root.querySelectorAll('.bk-side [data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
  /* R-6: the left rail's member profile card rides openProfile too. */
  S.root.querySelectorAll('.bk-rail [data-profile]').forEach((n) => n.addEventListener('click', () => { const pid = n.getAttribute('data-profile'); if (pid) openProfile(pid); }));
  /* 2C-4: the new-posts pill tap lands the held posts at the head. */
  main.querySelectorAll('[data-newpillbtn]').forEach((n) => n.addEventListener('click', () => applyPendingNew()));
  /* R-5: the composer FAB + scrim are persistent nodes — re-append
     the SAME elements this paint's innerHTML swap detached, then
     sync their visibility/sheet state. Identity never changes. */
  mountFab();
  /* R-7: the phone tab bar rides the same mount-once pattern. */
  mountTabBar();
}
/* The chain's live leg (2026-11-19 feed-count cure; R-6 fold B):
   fetch the next slice at the standing cursor. This is the resume
   path for a chain that stalled on a failed slice during loadLive —
   the cursor and feedHasMore survive the stall, so the scroll
   sentinel picks the wall up exactly where it stopped. One slice
   per call; the merge dedupes against everything already held.
   R-6: rendering belongs to the caller now (the retired button
   handlers were this function's only paint consumers) — the feed
   sentinel appends, the testimonies sentinel repaints its tape. */
async function loadMoreLive() {
  if (S.feedBusy || S.mode !== 'live' || !S.feedHasMore || S.feedNextOffset == null) return;
  S.feedBusy = true;
  const cursor = S.feedNextOffset;
  try {
    const j = await fetchJson(`${API_BASE}/api/community/posts?limit=25&offset=${cursor}`, 15000);
    mergeLiveSlice(j);
    S.feedNextOffset = j.nextOffset ?? null;
    S.feedHasMore = !!j.hasMore && S.feedNextOffset != null && S.feedNextOffset !== cursor;
    S.members = buildDirectory();
  } catch { /* the wall keeps what it has; the cursor stands for the next approach */ }
  S.feedBusy = false;
}

/* ---------- R-6 FOLD B (2026-11-23, founder) — ENDLESS SCROLL.
   The LOAD MORE button is retired. A hairline sentinel sits where
   the button stood; an IntersectionObserver (700px prefetch margin)
   fires feedMore() as the reader approaches the wall's end.
   Growth is APPEND-ONLY: the new window's cards are computed whole
   (the mix + in-thread slots are sequential and prefix-stable, so
   the held prefix never changes), only the delta nodes are built,
   wired (wirePosts + pvObserve scoped to the fresh batch) and
   appended — the film element, the composer, every held card and
   the reader's scroll position survive untouched (blink laws).
   The live leg reuses loadMoreLive() as the chain-resume. When the
   wall is truly exhausted the sentinel is swapped for the end
   state and the R-4 Presents close is inserted at the true end —
   exactly once. The testimonies tape rides the same pattern: its
   sentinel resumes the chain and repaints the tape (its standing
   render is a full-list render; no video element lives there). */
let feedObserver = null;
function feedExhausted() {
  return feedList().length <= S.feedShown && !(S.mode === 'live' && S.feedHasMore);
}
function appendFeedCards() {
  const listEl = S.root?.querySelector('[data-feedlist]');
  if (!listEl) return false;
  const list = feedList();
  const target = Math.min(list.length, S.feedShown + PAGE);
  if (target <= S.feedShown) return false;
  const tmp = document.createElement('div');
  tmp.innerHTML = feedCardsHtml(list.slice(0, target));
  /* COMMUNITY PASS 2026-11-24 (Part B): growth used to slice the
     recomputed window by CHILD COUNT — but trailing slots (PYMK,
     and any slot end-appended in a short window then fired in-loop
     in a longer one) shift position between computations, so the
     count-slice could skip a post and duplicate a slot. Growth is
     keyed now: every feed child carries a stable key (data-post /
     data-presents / data-inthread) and only children whose key the
     wall does not already hold are appended. A slot whose position
     moved keeps its held place instead of duplicating; every post
     lands exactly once. */
  const keyOf = (el) => el.dataset?.post ? `p:${el.dataset.post}` : el.dataset?.presents ? `v:${el.dataset.presents}` : el.dataset?.inthread ? `s:${el.dataset.inthread}` : null;
  const held = new Set([...listEl.children].map(keyOf).filter(Boolean));
  const fresh = [...tmp.children].filter((n) => { const k = keyOf(n); return !k || !held.has(k); });
  if (!fresh.length) return false;
  const hold = document.createElement('div');
  fresh.forEach((n) => hold.appendChild(n));
  wirePosts(hold);
  pvObserve(hold);
  [...hold.children].forEach((n) => listEl.appendChild(n));
  S.feedShown = target;
  return true;
}
function wireClose(closeEl) {
  /* The dynamically landed close carries the same doors as the
     painted one — wire its view/hub links exactly as paint does. */
  closeEl.querySelectorAll('[data-view]').forEach((n) => n.addEventListener('click', () => { S.view = n.dataset.view; S.gateOpen = false; paint(); }));
  closeEl.querySelectorAll('[data-hubgo]').forEach((n) => n.addEventListener('click', () => goHub(n.dataset.hubgo)));
}
function finishFeedEnd() {
  const sentinel = S.root?.querySelector('[data-sentinel]');
  if (sentinel) { const t = document.createElement('div'); t.innerHTML = endFeedHtml(); sentinel.replaceWith(t.firstElementChild); }
  if (S.root && !S.root.querySelector('.bk-close')) {
    const below = S.root.querySelector('.bk-feedbelow');
    if (below) { below.insertAdjacentHTML('afterend', closeHtml()); const c = S.root.querySelector('.bk-close'); if (c) wireClose(c); }
  }
}
function sentinelNear() {
  const s = S.root?.querySelector('[data-sentinel]');
  if (!s) return false;
  const r = s.getBoundingClientRect();
  return r.top < window.innerHeight + 700 && r.bottom > -700;
}
async function feedMore() {
  if (S.feedGrowing || !S.root || S.view !== 'feed' || S.feedFilter === 'watch') return;
  if (!S.root.querySelector('[data-sentinel]')) return;
  S.feedGrowing = true;
  try {
    let guard = 0;
    while (guard++ < 80) {
      let progressed = false;
      if (feedList().length > S.feedShown) progressed = appendFeedCards();
      else if (S.mode === 'live' && S.feedHasMore && !S.feedBusy) {
        await loadMoreLive();
        if (feedList().length > S.feedShown) progressed = appendFeedCards();
      }
      if (feedExhausted()) { finishFeedEnd(); break; }
      if (!progressed || !sentinelNear()) break;
    }
  } finally { S.feedGrowing = false; }
}
async function testMore() {
  if (S.feedBusy || S.view !== 'testimonies') return;
  await loadMoreLive();
  if (S.view === 'testimonies' && S.root) paint();
}
function armSentinels() {
  if (feedObserver) { feedObserver.disconnect(); feedObserver = null; }
  if (!S.root || typeof IntersectionObserver !== 'function') return;
  const feed = S.root.querySelector('[data-sentinel]');
  const test = S.root.querySelector('[data-sentinel-test]');
  if (!feed && !test) return;
  feedObserver = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      if (en.target.hasAttribute('data-sentinel-test')) testMore(); else feedMore();
    }
  }, { rootMargin: '700px 0px' });
  if (feed) feedObserver.observe(feed);
  if (test) feedObserver.observe(test);
}

export function render(root, ctx) {
  S.root = root; S.navigate = ctx?.navigate || null;
  /* P1-1 + P1-6 (amp-up 2026-11-22): the hub opens IN the feed, and a
     profile hash (#/community/profile/<id>) opens that member's page.
     The shell routes on the first hash segment only; this hub parses
     the rest of its own route. */
  const pm = location.hash.match(/^#\/community\/profile\/([^/?#]+)/);
  S.view = pm ? 'profile' : 'feed';
  S.profileId = pm ? decodeURIComponent(pm[1]) : null;
  S.feedFilter = 'all'; S.feedShown = PAGE; S.feedSort = 'new'; S.gateOpen = false; S.composeType = 'post'; S.composerFlash = null; S.beatGone = false;
  S.sheetOpen = false; S.compFocused = false; S._flashAtOpen = null; wireFabRoot(root);
  pulseCounted = false; pulseAnim++; /* R-1: a fresh hub entry earns one count-up */
  S.commentsOpen = new Set(); S.peopleQuery = ''; S.peopleResults = null;
  paint();
  if (S.view === 'profile') viewProfile(S.profileId);
  S.settlePainted = false;
  loadLive().then(() => {
    if (!S.root) return;
    if (S.view === 'profile') { viewProfile(S.profileId); return; }
    /* BLINK CURE (2026-11-22, diag-proven): this closer used to fire a
       final UNGUARDED paint() the moment loadLive resolved — a second
       full rebuild ~50ms after the chain's settle paint, recreating
       the film element (playback restarted from 0) and resetting the
       reader's scroll, minutes into the visit on the slow production
       API. That is the founder's "pages keep blinking and resetting"
       at its sharpest. loadLive's own settle paint is the final word
       in live mode; the closer remains ONLY as the snapshot-mode
       safety net (the live leg threw before ever painting) — and
       even then it paints preserved (film + scroll), never raw. */
    if (!S.settlePainted) paint(true);
  });
  /* 2C-4: the new-posts pill's honest signal — a 45s live head
     re-read, feed view only (checkNewPosts self-guards). */
  if (S.newTimer) clearInterval(S.newTimer);
  S.pendingNew = [];
  S.newTimer = setInterval(() => { checkNewPosts(); }, 45000);
  window.__community = {
    version: 'faithbook-graft', mode: () => S.mode, state: () => S,
    checkNewPosts: () => checkNewPosts(), openStoryViewer: (id) => openStoryViewer(id),
    openFeed: () => { S.view = 'feed'; paint(); }, openTestimonies: () => { S.view = 'testimonies'; paint(); },
    openMembers: () => { S.view = 'members'; paint(); }, openGroups: () => { S.view = 'groups'; paint(); },
    openProfile: (id) => openProfile(id), openDoors: () => { S.view = 'feed'; paint(); },
  };
}
