/* SHOP hub v2 — SHOP RESTORE (2026-11-23, founder order 09:45–09:48 MST:
   "The first 163 faith shop design needs to be here. 163faithshop.com
   design" + "Just add the 90 to 120 on top").

   The page is rebuilt in the design language of the FIRST 163faithshop.com
   storefront (shop-build/design/163faith-store/ — Nov 14–15 prototype):
   announce strip, giant stacked editorial headline, conviction ticker,
   numbered section kickers, filterbar + grid, campaign band, category
   tiles, manifesto with the Proverbs 16:3 verse, full-bleed band,
   community editorial, FAQ accordion. Fresh code only — the design is the
   template; no prototype code, concept products, or concept prices cross.
   Consult: chatcmpl-EnRYO8oE1gmMg8zjueAzvPWtSqJXL (film = hero on top,
   marquee under it, Shop AI below the filter row, quick-view as a product
   dialog, FAQ at the bottom, newsletter dropped).

   THE FILM ON TOP: the 106.87s shop film (film-shop.mp4 — people wearing
   real 16:3 FAITH gear) is the FIRST element of the hub, mounted once
   through the shell's FaithFilm slot. Blink laws hold: the film element
   is never recreated; catalog data paints into slots below it.

   DATA: assets/data/shop/products.json — the REAL catalog (13 products,
   real Printful mockup imagery, real prices), extracted verbatim from the
   shop page's own PRODUCTS / CATOF / AUDOF / QUICK_STORE_BASE. Nothing
   hardcoded here, nothing invented.

   BUY PATH (standing, binding): every BUY links to the Quick Store ROOT
   (https://163faith.printful.me) — never per-product links, NO in-hub
   checkout, NO cart.

   AUDIENCE TRUTH: every current piece is tagged "unisex" — Mens and
   Womens browse both show the full unisex line, stated honestly on the
   surface, never re-tagged.

   AI SEARCH + AI ASSISTANT: client-side, rule-based answers over the real
   catalog (matchProducts / answerFor / the assistant), carried from v1
   function-for-function. Labeled wherever it speaks. No backend faked. */

const DATA = 'assets/data/shop/products.json';
const QUICK_STORE = 'https://163faith.printful.me';
const CONTACT = 'shop@163faithshop.com';

/* GOD OVER EVERYTHING — THE PASTOR'S BOOK (founder order 2026-11-23 19:04
   MST: "put this in the shop section, under God over everything"). The
   Read hub's one real book joins Shop as a featured placement. Facts and
   Amazon targets copied EXACTLY from the Read hub's book shelf (read.js
   showBooks) — nothing invented. The book is NOT Printful merch: it never
   enters S.products, the filterbar counts, or the grid; it carries its
   own section, its own heading, and its own honest label. */
const BOOKS = [
  { vol: 'Volume One', band: 'VOLUME ONE · JANUARY – JUNE', facts: 'Days 1–181 · Paperback · 6×9 · 559 pages', price: 19.99,
    blurb: 'The first half of the year. From the cold start of January to the long light of June — a daily return to putting God first, one verse at a time.',
    url: 'https://www.amazon.com/dp/B0H41J8C8G?tag=kairobot143-20' },
  { vol: 'Volume Two', band: 'VOLUME TWO · JULY – DECEMBER', facts: 'Days 182–365 · Paperback · 6×9 · 568 pages', price: 19.99,
    blurb: 'The back half of the year, all the way to the last day. The same honest rhythm — verse, reflection, prayer, and one line to carry with you.',
    url: 'https://www.amazon.com/dp/B0H3NV2JLH?tag=kairobot143-20' },
];
function bookCardHTML(b) {
  return `
  <article class="sr-book" data-book="${esc(b.vol)}">
    <div class="sr-bookcover"><span class="pre">16:3 Faith Presents</span><h4>God Over <span class="g">Everything</span></h4><div class="rule"></div><span class="sub">A 365-Day Devotional</span><br><span class="band">${esc(b.band)}</span></div>
    <p class="sr-bookmeta">The Pastor's Book · Sold on Amazon</p>
    <h3>${esc(b.vol)}</h3>
    <p class="sr-bookfacts">${esc(b.facts)} · $${b.price.toFixed(2)}</p>
    <p class="sr-bookblurb">${esc(b.blurb)}</p>
    <div class="sr-bookrow"><span class="sr-bookprice">${money(b.price)}</span><a class="sr-bookbuy" data-bookbuy href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">Buy ${esc(b.vol)} — ${money(b.price)} on Amazon ↗</a></div>
  </article>`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toFixed(2).replace(/\.00$/, '');

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const st = document.createElement('style');
  st.textContent = `
  /* ---- carried v1 surfaces (grid, cards, dialog, assistant) ---- */
  .sh-sec{font-family:var(--serif);font-size:20px;color:var(--bone);margin-top:26px}
  .sh-note{font-size:12.5px;color:var(--mute);margin-top:10px;line-height:1.55}
  .sh-note b{color:var(--gold-hi)}
  .sh-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .sh-chip{border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:12px;letter-spacing:.18em;color:var(--gold-hi);text-transform:uppercase;background:rgba(0,0,0,.3);cursor:pointer}
  .sh-chip:hover{border-color:var(--gold)}
  .sh-chip.on{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border-color:transparent}
  .sh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;margin-top:18px}
  @media(max-width:580px){.sh-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}}
  .sh-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden;text-align:left;padding:0;color:var(--bone);width:100%;cursor:pointer}
  .sh-card:hover{border-color:var(--gold-dim)}
  .sh-card .sh-imgwrap{position:relative;background:#1a1a1a;aspect-ratio:1;overflow:hidden}
  .sh-card img{width:100%;height:100%;object-fit:cover}
  .sh-card .sh-body{padding:16px 18px 18px}
  .sh-card .sh-tag{font-size:11px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
  .sh-card h3{font-family:var(--serif);font-size:21px;margin:6px 0 4px;line-height:1.2}
  .sh-card .sh-blurb{color:var(--mute);font-size:13.5px;line-height:1.5;min-height:40px}
  @media(max-width:580px){.sh-card .sh-blurb{display:none}.sh-card h3{font-size:16px}.sh-card .sh-body{padding:11px 12px 13px}}
  .sh-card .sh-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:10px}
  .sh-price{font-size:19px;color:var(--gold-hi);font-weight:700}
  .sh-sizes{font-size:12px;color:var(--mute);letter-spacing:.06em}
  .sh-buy{display:inline-block;text-align:center;background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;border:none;border-radius:999px;padding:11px 20px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-decoration:none}
  .sh-buy:hover{filter:brightness(1.1)}
  .sh-answer{margin-top:16px;font-size:15.5px;line-height:1.6;color:var(--bone);border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:16px 18px}
  .sh-answer b{color:var(--gold-hi)}
  .sh-mini{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:14px}
  .sh-minicard{background:#000;border:1px solid var(--line);border-radius:14px;overflow:hidden;text-align:left;padding:0;color:var(--bone);cursor:pointer;width:100%}
  .sh-minicard img{aspect-ratio:1;object-fit:cover;width:100%}
  .sh-minicard .mc{padding:10px 12px}.sh-minicard .mc b{font-size:13px;display:block}.sh-minicard .mc span{color:var(--gold);font-size:13px}
  dialog.sh-dlg{background:var(--coal);color:var(--bone);border:1px solid var(--gold-dim);border-radius:20px;max-width:880px;width:calc(100% - 28px);padding:0}
  dialog.sh-dlg::backdrop{background:rgba(0,0,0,.82)}
  .sh-pd{display:grid;grid-template-columns:1fr 1fr;position:relative}
  @media(max-width:700px){.sh-pd{grid-template-columns:1fr}}
  .sh-pd .gal{background:#161616}.sh-pd .gal img.main{width:100%;aspect-ratio:1;object-fit:cover}
  .sh-pd .thumbs{display:flex;gap:8px;padding:10px;overflow-x:auto}
  .sh-pd .thumbs img{width:62px;height:62px;object-fit:cover;border-radius:9px;border:2px solid transparent;cursor:pointer;background:#222}
  .sh-pd .thumbs img.sel{border-color:var(--gold)}
  .sh-pd .info{padding:26px 26px 30px}
  .sh-pd h3{font-family:var(--serif);font-size:28px;margin:6px 0 4px;line-height:1.15}
  .sh-pd .garment{color:var(--mute);font-size:13.5px;letter-spacing:.05em}
  .sh-pd .desc{color:var(--bone);opacity:.85;line-height:1.6;margin:14px 0;font-size:15px}
  .sh-sizepick{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 20px}
  .sh-sizepick button{background:#000;color:var(--bone);border:1px solid var(--line);border-radius:10px;padding:9px 13px;font-size:14px;min-width:46px;cursor:pointer}
  .sh-sizepick button.sel{border-color:var(--gold);color:var(--gold-hi);background:#1a1503}
  .sh-pd .x{position:absolute;top:12px;right:14px;background:rgba(0,0,0,.6);border:1px solid var(--line);color:var(--bone);width:40px;height:40px;border-radius:50%;font-size:17px;z-index:2;cursor:pointer}
  .sh-pd .buybtn{width:100%}
  .sh-pd .note{margin-top:12px;font-size:12.5px;color:var(--mute);line-height:1.5}
  .sh-fab{position:fixed;right:18px;bottom:calc(var(--bottombar-h,0px) + var(--player-h,96px) + 26px);z-index:55;background:linear-gradient(120deg,var(--gold-dim),var(--gold) 50%,var(--gold-hi));color:#141005;border:none;border-radius:999px;padding:13px 20px;font-weight:700;font-size:13.5px;letter-spacing:.08em;box-shadow:0 10px 34px rgba(212,175,55,.35);cursor:pointer}
  @media(min-width:861px){.sh-fab{bottom:calc(var(--player-h,96px) + 30px)}}
  .sh-chat{position:fixed;right:18px;bottom:calc(var(--bottombar-h,0px) + var(--player-h,96px) + 84px);z-index:56;width:min(380px,calc(100vw - 30px));background:var(--coal);border:1px solid var(--gold-dim);border-radius:18px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.7)}
  @media(min-width:861px){.sh-chat{bottom:calc(var(--player-h,96px) + 88px)}}
  .sh-chat.open{display:flex}
  .sh-chat header{padding:15px 18px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}
  .sh-chat header b{font-family:var(--serif);color:var(--gold-hi);font-size:17px}
  .sh-chat header button{background:none;border:none;color:var(--mute);font-size:18px;cursor:pointer}
  .sh-chat .log{padding:16px;overflow-y:auto;max-height:42vh;display:flex;flex-direction:column;gap:10px}
  .sh-msg{padding:11px 14px;border-radius:14px;font-size:14.5px;line-height:1.55;max-width:88%}
  .sh-msg.bot{background:#1a1708;border:1px solid var(--line);align-self:flex-start}
  .sh-msg.me{background:#222;color:var(--bone);align-self:flex-end}
  .sh-msg b{color:var(--gold-hi)}
  .sh-chat form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
  .sh-chat input{flex:1;background:#000;border:1px solid var(--line);border-radius:999px;color:var(--bone);padding:11px 16px;font-size:14.5px;outline:none;min-width:0}
  .sh-chat input:focus{border-color:var(--gold)}
  .sh-chat form button{background:var(--gold);border:none;color:#141005;border-radius:999px;padding:0 18px;font-weight:700;cursor:pointer}
  /* ---- SHOP RESTORE: the first 163faithshop.com design language ---- */
  .sr-announce{display:flex;justify-content:space-between;gap:14px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px 2px;margin-top:2px;font-size:10px;letter-spacing:.24em;color:var(--mute);text-transform:uppercase}
  .sr-announce .c{color:var(--gold-hi)}
  @media(max-width:700px){.sr-announce{justify-content:center}.sr-announce .l,.sr-announce .r{display:none}}
  .sr-ticker{overflow:hidden;border-bottom:1px solid var(--line);padding:13px 0;margin-top:0}
  .sr-ticker-track{display:flex;width:max-content;gap:34px;animation:sr-marquee 30s linear infinite}
  .sr-ticker-track span{font-family:var(--serif);font-size:24px;color:var(--gold);white-space:nowrap}
  .sr-ticker-track i{color:var(--gold-hi);font-style:normal;font-size:17px;align-self:center}
  @keyframes sr-marquee{to{transform:translateX(-50%)}}
  @media(prefers-reduced-motion:reduce){.sr-ticker-track{animation:none}}
  .sr-hero{padding:34px 0 6px}
  .sr-eyebrow{display:flex;align-items:center;gap:10px;font-size:10.5px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
  .sr-eyebrow::before{content:"";width:26px;height:2px;background:var(--gold)}
  .sr-title{font-family:var(--serif);font-size:clamp(54px,14.5vw,118px);line-height:.96;letter-spacing:-.01em;color:var(--bone);margin:16px 0 14px}
  .sr-title span{display:block}
  .sr-title .g{color:var(--gold)}
  .sr-desc{font-size:15px;line-height:1.6;color:var(--bone);opacity:.88;max-width:520px}
  .sr-desc strong{color:var(--gold-hi)}
  .sr-buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .sr-edition{display:flex;align-items:center;gap:12px;margin-top:22px;font-size:9.5px;letter-spacing:.26em;color:var(--mute);text-transform:uppercase}
  .sr-edition::before{content:"";width:22px;height:1px;background:var(--gold-dim)}
  .sr-kicker{display:flex;align-items:center;gap:12px;font-size:10px;letter-spacing:.26em;color:var(--mute);text-transform:uppercase;margin-top:44px}
  .sr-kicker .no{color:var(--gold);font-weight:700}
  .sr-kicker .hair{flex:1;height:1px;background:var(--line)}
  @media(max-width:580px){.sr-kicker .hair{display:none}.sr-kicker .tag{margin-left:auto;text-align:right}}
  .sr-sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:14px 0 6px}
  .sr-sechead h2{font-family:var(--serif);font-size:clamp(44px,10vw,84px);line-height:.95;color:var(--bone)}
  .sr-sechead h2 .g{color:var(--gold)}
  .sr-sechead p{color:var(--mute);font-size:13.5px;line-height:1.55;max-width:300px}
  @media(max-width:580px){.sr-sechead{display:block}.sr-sechead p{margin-top:10px;max-width:100%}}
  .sr-micro{display:flex;align-items:center;gap:8px;font-size:10.5px;letter-spacing:.24em;color:var(--gold-hi);text-transform:uppercase}
  .sr-micro::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--gold)}
  .sr-filterbar{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:6px;margin-top:16px}
  .sr-tabs{display:flex;gap:20px;flex-wrap:wrap}
  .sr-tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--mute);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;padding:10px 0 8px;cursor:pointer}
  .sr-tab sup{color:var(--gold);font-size:9px;margin-left:3px}
  .sr-tab:hover{color:var(--bone)}
  .sr-tab.on{color:var(--gold-hi);border-bottom-color:var(--gold)}
  .sr-sort{display:flex;align-items:center;gap:10px;font-size:10.5px;letter-spacing:.2em;color:var(--mute);text-transform:uppercase}
  .sr-sort select{background:#000;color:var(--bone);border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-size:13px;letter-spacing:0;text-transform:none}
  .sr-count{font-size:10.5px;letter-spacing:.2em;color:var(--gold-hi);text-transform:uppercase}
  .sr-badge{position:absolute;top:10px;left:10px;z-index:2;background:rgba(5,5,5,.82);border:1px solid var(--gold-dim);color:var(--gold-hi);font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;padding:6px 9px;border-radius:7px}
  .sr-quick{position:absolute;left:0;right:0;bottom:0;z-index:2;background:linear-gradient(0deg,rgba(5,5,5,.88),rgba(5,5,5,0));color:var(--gold-hi);font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;padding:20px 12px 9px;display:flex;justify-content:space-between}
  .sr-foot{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:20px;font-size:10px;letter-spacing:.22em;color:var(--mute);text-transform:uppercase}
  .sr-foot button{background:none;border:none;color:var(--gold-hi);font-size:10px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;padding:0}
  .sr-campaign{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:20px;background:radial-gradient(120% 130% at 85% 0%,rgba(212,175,55,.22),rgba(5,5,5,0) 55%),linear-gradient(150deg,#171204,#070707 70%);margin-top:46px;padding:30px 24px}
  .sr-campaign .ghost{position:absolute;right:-14px;top:-30px;font-family:var(--serif);font-size:190px;color:rgba(212,175,55,.09);line-height:1;pointer-events:none}
  .sr-campaign h2{position:relative;font-family:var(--serif);font-size:clamp(46px,11vw,92px);line-height:.95;color:var(--bone);margin:12px 0}
  .sr-campaign h2 em{color:var(--gold);font-style:normal}
  .sr-campaign p{position:relative;color:var(--bone);opacity:.85;font-size:14.5px;line-height:1.6;max-width:420px}
  .sr-campaign img{position:relative;display:block;width:min(300px,72%);aspect-ratio:1;object-fit:cover;border-radius:16px;border:1px solid var(--gold-dim);margin-top:20px}
  .sr-campaign .sr-buttons{position:relative}
  .sr-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:18px}
  @media(max-width:580px){.sr-tiles{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}}
  .sr-tile{position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--panel);padding:0;text-align:left;color:var(--bone);cursor:pointer;width:100%}
  .sr-tile:hover{border-color:var(--gold-dim)}
  .sr-tile img{width:100%;aspect-ratio:1.15;object-fit:cover;display:block}
  .sr-tile .no{position:absolute;top:10px;left:12px;font-size:9.5px;letter-spacing:.22em;color:var(--gold-hi);background:rgba(5,5,5,.75);padding:5px 8px;border-radius:6px;text-transform:uppercase}
  .sr-tile .meta{padding:12px 14px 14px}
  .sr-tile .meta span{display:block;font-size:10px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase}
  .sr-tile .meta strong{display:block;font-family:var(--serif);font-size:16.5px;margin-top:4px;line-height:1.25}
  .sr-tile .meta small{display:block;color:var(--mute);font-size:12px;margin-top:3px}
  .sr-manifesto{margin-top:46px;border-top:1px solid var(--line);padding-top:30px}
  /* SITE-WIDE AI INTENSITY (2026-11-23, consult chatcmpl-EnXUONbVHMo4IMZGg0P2PVyM96dHg):
     atmosphere art behind the EDITORIAL type only — a dawn street, "worn in
     the world". Never product imagery (products stay real Printful renders),
     never behind prices or buy controls. */
  .sr-manifesto-art{width:100%;height:210px;object-fit:cover;border-radius:16px;border:1px solid rgba(212,175,55,.3);display:block;margin-bottom:26px}
  @media(min-width:861px){.sr-manifesto-art{height:280px}}
  .sr-manifesto h2{font-family:var(--serif);font-size:clamp(46px,11.5vw,96px);line-height:.95;color:var(--bone);margin:12px 0 16px}
  .sr-manifesto h2 .g{color:var(--gold)}
  .sr-verse{font-family:var(--serif);font-style:italic;font-size:19px;line-height:1.55;color:var(--gold-hi);max-width:560px}
  .sr-ref{font-size:10px;letter-spacing:.26em;color:var(--mute);text-transform:uppercase;margin-top:10px}
  .sr-manifesto .body{color:var(--bone);opacity:.87;font-size:14.5px;line-height:1.65;max-width:600px;margin-top:18px}
  .sr-manifesto .body p+p{margin-top:12px}
  .sr-signoff{font-family:var(--serif);font-size:21px;line-height:1.35;margin-top:18px;color:var(--bone)}
  .sr-signoff strong{color:var(--gold-hi)}
  .sr-founder{display:inline-block;margin-top:16px;font-size:10px;letter-spacing:.24em;color:var(--gold);text-transform:uppercase;border:1px solid var(--gold-dim);border-radius:999px;padding:8px 14px}
  .sr-bleed{margin-top:46px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:22px 0 16px;text-align:center;overflow:hidden}
  .sr-bleed .word{font-family:var(--serif);font-size:clamp(52px,14vw,150px);line-height:1;color:var(--bone);white-space:nowrap}
  .sr-bleed .word .g{color:var(--gold)}
  .sr-bleed .strip{display:flex;justify-content:space-between;gap:12px;font-size:9.5px;letter-spacing:.24em;color:var(--mute);text-transform:uppercase;margin-top:12px}
  .sr-editorial{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:20px}
  @media(max-width:700px){.sr-editorial{grid-template-columns:1fr}}
  .sr-editorial h2{font-family:var(--serif);font-size:clamp(40px,9vw,72px);line-height:.98;color:var(--bone);margin:12px 0}
  .sr-editorial h2 em{color:var(--gold);font-style:normal}
  .sr-editorial p{color:var(--bone);opacity:.85;font-size:14.5px;line-height:1.65}
  .sr-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  .sr-art{position:relative;border:1px solid var(--gold-dim);border-radius:20px;background:radial-gradient(110% 110% at 50% 0%,rgba(212,175,55,.2),rgba(5,5,5,0) 60%),#0a0803;min-height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;text-align:center}
  .sr-art .cross{color:var(--gold);font-size:22px}
  .sr-art .top,.sr-art .bot{font-size:9.5px;letter-spacing:.28em;color:var(--mute);text-transform:uppercase}
  .sr-art strong{font-family:var(--serif);font-size:120px;line-height:1;color:var(--gold)}
  .sr-art strong span{color:var(--bone)}
  .sr-faq{border:1px solid var(--line);border-radius:14px;background:var(--panel);margin-top:12px}
  .sr-faq summary{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px;cursor:pointer;font-family:var(--serif);font-size:17.5px;color:var(--bone);list-style:none}
  .sr-faq summary::-webkit-details-marker{display:none}
  .sr-faq summary span{color:var(--gold);font-size:20px}
  .sr-faq p{padding:0 18px 17px;color:var(--mute);font-size:14px;line-height:1.6}
  .sr-faq p b{color:var(--gold-hi)}
  /* GOD OVER EVERYTHING book placement — typographic cover treatment (the
     book has no product photo; the cover is set in the house serif, the
     way the Read shelf presents it). Distinct from merch cards: deep
     panel, double gold rule, THE PASTOR'S BOOK tag, Amazon buy path. */
  .sr-bookgrid{display:grid;grid-template-columns:1fr;gap:18px;margin-top:20px}
  @media(min-width:760px){.sr-bookgrid{grid-template-columns:1fr 1fr}}
  .sr-book{border:1px solid var(--gold-dim);border-radius:20px;background:linear-gradient(165deg,#171106,#070707 62%);padding:22px;display:flex;flex-direction:column;gap:12px}
  .sr-bookcover{border:1px solid rgba(212,175,55,.45);border-radius:12px;background:radial-gradient(120% 120% at 50% 0%,rgba(212,175,55,.16),rgba(5,5,5,0) 62%),#0a0803;padding:26px 20px 22px;text-align:center}
  .sr-bookcover .pre{font-size:9.5px;letter-spacing:.3em;color:var(--mute);text-transform:uppercase}
  .sr-bookcover h4{font-family:var(--serif);font-size:clamp(30px,6vw,40px);line-height:1.02;color:var(--bone);margin:10px 0 4px}
  .sr-bookcover h4 .g{color:var(--gold)}
  .sr-bookcover .rule{width:64px;height:2px;background:var(--gold);margin:12px auto}
  .sr-bookcover .sub{font-size:10px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase}
  .sr-bookcover .band{display:inline-block;margin-top:14px;font-size:9.5px;letter-spacing:.22em;color:var(--bone);border:1px solid var(--gold-dim);border-radius:999px;padding:6px 12px;text-transform:uppercase}
  .sr-bookmeta{font-size:10px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase}
  .sr-book h3{font-family:var(--serif);font-size:26px;color:var(--bone)}
  .sr-bookfacts{font-size:12.5px;color:var(--mute);letter-spacing:.04em}
  .sr-bookblurb{color:var(--bone);opacity:.87;font-size:14.5px;line-height:1.65}
  .sr-bookrow{display:flex;align-items:center;gap:14px;margin-top:auto;flex-wrap:wrap}
  .sr-bookprice{font-family:var(--serif);font-size:24px;color:var(--gold-hi)}
  .sr-bookbuy{display:inline-block;background:var(--gold);color:#0a0803;font-weight:700;border-radius:999px;padding:12px 20px;text-decoration:none;font-size:14px}
  .sr-booknote{font-size:12.5px;color:var(--mute);line-height:1.6;margin-top:14px}
  .sr-booknote a{color:var(--gold-hi)}
  `;
  document.head.appendChild(st);
}

export function render(root) {
  injectCss();
  const S = {
    products: [], categories: [], quickStore: QUICK_STORE,
    cat: 'all', aud: 'all', sort: 'featured', query: '',
    dialogSlug: null, dialogSize: null, greeted: false,
  };
  window.__shop = { state: S, ready: false, products: [], books: BOOKS };

  const tickerSet = ['FAITH OVER FEAR', 'GOD OVER EVERYTHING', 'NO MORE HIDING', 'LIVE WHAT YOU BELIEVE']
    .map((t) => `<span>${t}</span><i aria-hidden="true">✦</i>`).join('');
  root.innerHTML = `
    ${window.FaithFilm ? window.FaithFilm.slotHtml({ src: 'assets/video/film-shop.mp4', poster: 'assets/video/film-shop-poster.webp', title: 'The line, in motion.', note: 'Shop film · the full 107 seconds' }) : ''}
    <div class="sr-announce"><span class="l">Proverbs 16:3 — Commit the Work.</span><span class="c">Not just a brand. A way to walk.</span><span class="r">Est. in Faith ✦</span></div>
    <div class="sr-ticker" aria-label="Brand phrases"><div class="sr-ticker-track" aria-hidden="true">${tickerSet}${tickerSet}</div></div>
    <section class="sr-hero">
      <div class="sr-eyebrow">The 16:3 Collection</div>
      <h1 class="sr-title"><span>FAITH</span><span>IS NOT</span><span>A TREND<span class="g">.</span></span></h1>
      <p class="sr-desc">Not for the sidelines. Not for Sunday only.<br><strong>Built on the Word. Worn in the world.</strong> Real Printful pieces — every front carries the full 16:3 FAITH mark, printed when you order.</p>
      <div class="sr-buttons">
        <button type="button" class="btn-gold" data-scroll="collection" style="padding:13px 22px">Shop the Collection ↗</button>
        <button type="button" class="btn-ghost" data-scroll="story" style="padding:13px 22px">Why 16:3 →</button>
      </div>
      <div class="sr-edition"><span>Conviction in every thread</span><span>Proverbs 16:3</span></div>
    </section>
    <section data-sr="collection">
      <div class="sr-kicker"><span class="no">[ 01 ]</span><span>The Collection</span><span class="hair"></span><span class="tag">Designed to make a statement</span></div>
      <div class="sr-sechead"><div><div class="sr-micro">Wear your conviction</div><h2>THE GEAR<span class="g">.</span></h2></div><p>No quiet graphics. No empty slogans.<br>Statement pieces rooted in something real.</p></div>
      <div data-sh="filterbar"><p class="sh-note">Loading the line…</p></div>
      <div data-sh="aislot"></div>
      <div data-sh="gridslot"><p class="sh-note">Loading the line…</p></div>
      <div class="sr-foot"><span>More than an outfit. It’s the walk.</span><button type="button" data-scroll="story">See the statement ↗</button></div>
    </section>
    <div data-sh="campaign"></div>
    <section data-sr="book">
      <div class="sr-kicker"><span class="no">[ 02 ]</span><span>God Over Everything</span><span class="hair"></span><span class="tag">The Pastor's Book</span></div>
      <div class="sr-sechead"><div><div class="sr-micro">16:3 Faith Presents · The One Book</div><h2>GOD OVER<br><span class="g">EVERYTHING.</span></h2></div><p>A 365-Day Devotional by Pastor Jeremy “Chico” Mills — one verse, one honest reflection, one prayer, every day for a year. Both paperback volumes, on Amazon.</p></div>
      <div class="sr-bookgrid">${BOOKS.map(bookCardHTML).join('')}</div>
      <p class="sr-booknote">The book is sold on <b>Amazon</b> — it is not Printful merch and is not counted in the collection above. <b>Read the first 5 days free</b> — the sample lives on the book shelf in the <a href="#/read">Read hub</a>.</p>
    </section>
    <section>
      <div class="sr-kicker"><span class="no">[ 03 ]</span><span>Choose Your Armor</span><span class="hair"></span><span class="tag">No compromise</span></div>
      <div data-sh="tiles"><p class="sh-note">Loading the line…</p></div>
    </section>
    <section class="sr-manifesto" data-sr="story">
      <img class="sr-manifesto-art" src="assets/img/shop/manifesto.webp" alt="" aria-hidden="true" loading="lazy">
      <div class="sr-kicker" style="margin-top:0"><span class="no">[ 04 ]</span><span>The Reason</span><span class="hair"></span></div>
      <p class="sh-note" style="letter-spacing:.24em;text-transform:uppercase">The verse that started it all</p>
      <h2>COMMIT<br>THE WORK<span class="g">.</span></h2>
      <p class="sr-verse">“Commit thy works unto the LORD, and thy thoughts shall be established.”</p>
      <p class="sr-ref">Proverbs 16:3 / KJV</p>
      <div class="body">
        <p>This is for the people who have been through it. The ones still standing. The ones learning to trust God when nothing makes sense.</p>
        <p>We don’t put scripture on fabric to follow a trend. We wear the reminder of who we belong to.</p>
      </div>
      <p class="sr-signoff">FAITH IS THE FOUNDATION.<br><strong>THE GEAR IS THE EXPRESSION.</strong></p>
      <span class="sr-founder">Founded by Pastor Jeremy “Chico” Mills</span>
    </section>
    <section class="sr-bleed"><div class="word">WALK IN <span class="g">FAITH.</span></div><div class="strip"><span>No performance. Just purpose.</span><span>Proverbs 16:3</span></div></section>
    <section>
      <div class="sr-kicker"><span class="no">[ 05 ]</span><span>More Than Merch</span><span class="hair"></span><span class="tag">The community is the culture</span></div>
      <div class="sr-editorial">
        <div>
          <div class="sr-eyebrow">Believe bigger. Walk together.</div>
          <h2>THE WORD<br>GOES <em>WITH</em><br>YOU.</h2>
          <p>The gear is one part of 16:3 Faith. The heart of it is a real community — prayer, Scripture, music, and finding God in everyday life.</p>
          <div class="sr-links">
            <a class="btn-ghost" href="#/watch" style="padding:11px 18px;text-decoration:none">Watch ↗</a>
            <a class="btn-ghost" href="#/listen" style="padding:11px 18px;text-decoration:none">Listen ↗</a>
            <a class="btn-ghost" href="#/community" style="padding:11px 18px;text-decoration:none">The Community ↗</a>
          </div>
        </div>
        <div class="sr-art" aria-label="Graphic inspired by Proverbs 16:3"><span class="cross">✝</span><span class="top">Not for Sunday only.</span><strong>16<span>:</span>3</strong><span class="bot">Commit the work // Trust the Lord</span></div>
      </div>
    </section>
    <section>
      <div class="sr-kicker"><span class="no">[ 06 ]</span><span>Good to Know</span><span class="hair"></span></div>
      <div class="sr-sechead"><h2 style="font-size:clamp(38px,8.5vw,64px)">NO GUESSWORK<span class="g">.</span></h2><p>How the line works — the same answers the shop assistant gives, in the open.</p></div>
      <details class="sr-faq"><summary>How is the gear made?<span>+</span></summary><p>Every piece is <b>made to order</b> — printed when you order it and fulfilled by Printful. Nothing sits in a warehouse; your piece is made for you.</p></details>
      <details class="sr-faq"><summary>What is the production and delivery timeline?<span>+</span></summary><p>Allow <b>a few days for printing</b>, then standard delivery to US addresses. Because each piece is printed on order, it takes a little longer than off-the-shelf — order a few days ahead of the day you need it.</p></details>
      <details class="sr-faq"><summary>How do I choose the right size?<span>+</span></summary><p>Tees run <b>S–4XL</b> in a relaxed garment-dyed fit — your normal size is the right call. The hoodie and crewneck run <b>S–5XL</b>; size up if you like a relaxed fit. Joggers run S–2XL and the snapback is one size. Tap any piece to see its exact size run.</p></details>
      <details class="sr-faq"><summary>Can I return or exchange?<span>+</span></summary><p>Wrong size? Email <b>${CONTACT}</b> and we’ll make it right — exchanges for size are handled personally.</p></details>
    </section>
    <p class="sh-note" style="margin-top:30px">Buy path: every piece checks out on the Printful Quick Store — <b>${esc(QUICK_STORE)}</b>. No in-hub checkout. Questions: <a href="mailto:${CONTACT}">${CONTACT}</a></p>
    <button type="button" class="sh-fab" data-sh="fab">✦ Shop Assistant</button>
    <div class="sh-chat" data-sh="chat">
      <header><b>✦ 163 Assistant <span class="ai-tag">AI · Powered by AI</span></b><button type="button" data-sh="chatclose" aria-label="Close assistant">✕</button></header>
      <div class="log" data-sh="log"></div>
      <form data-sh="chatform"><input data-sh="chatin" placeholder="Sizing, gifts, prices…" autocomplete="off" aria-label="Ask the shop assistant"><button type="submit">Ask</button></form>
    </div>`;
  if (window.FaithFilm) window.FaithFilm.wire(root);
  const bySlug = (s) => S.products.find((p) => p.slug === s);
  const catLabel = (c) => (S.categories.find(([k]) => k === c) || [, c])[1];
  const audVisible = (p, aud) => aud === 'all' || p.audience === aud || p.audience === 'unisex'; // the shop page's own setAud rule
  const filtered = () => {
    const list = S.products.filter((p) => (S.cat === 'all' || p.category === S.cat) && audVisible(p, S.aud));
    if (S.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (S.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (S.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  };
  const scrollTo = (key) => {
    const el = root.querySelector(`[data-sr="${key}"]`);
    if (el) el.scrollIntoView({ behavior: window.FaithFilm && window.FaithFilm.reduced ? 'auto' : 'smooth', block: 'start' });
  };
  root.querySelectorAll('[data-scroll]').forEach((b) => b.addEventListener('click', () => scrollTo(b.dataset.scroll)));

  /* ---------- AI search — ported from the shop page (client-side) ---------- */
  function matchProducts(q) {
    q = q.toLowerCase(); const hits = new Set();
    const add = (fn) => S.products.forEach((p) => { if (fn(p)) hits.add(p); });
    const num = (q.match(/\$?\s?(\d{2,3})/) || [])[1];
    if (/under|below|less than|cheap/.test(q) && num) add((p) => p.price <= +num);
    if (/hoodie|warm|winter|cold/.test(q)) add((p) => /hoodie/i.test(p.name));
    if (/warmest/.test(q)) add((p) => p.slug === 'narrow-is-the-way-hoodie');
    if (/crew|sweatshirt/.test(q)) add((p) => /crewneck/i.test(p.name));
    if (/tee|t-shirt|shirt/.test(q)) add((p) => /tee/i.test(p.name));
    if (/jogger|pants|legs/.test(q)) add((p) => /joggers/i.test(p.name));
    if (/hat|cap|snapback/.test(q)) add((p) => /snapback/i.test(p.name));
    if (/crown/.test(q)) add((p) => /crowned/i.test(p.name));
    if (/fear/.test(q)) add((p) => /fear/i.test(p.name));
    if (/narrow/.test(q)) add((p) => /narrow/i.test(p.name));
    if (/legacy|16:3|163/.test(q)) add((p) => /legacy/i.test(p.name));
    if (/after the 1|sheep/.test(q)) add((p) => /after/i.test(p.name));
    const sz = (q.toUpperCase().match(/\b(2XL|3XL|4XL|5XL|XL|S|M|L)\b/) || [])[1];
    if (sz && /size|come|fit|in /.test(q)) add((p) => p.sizes.includes(sz));
    if (/gift|dad|father|him|husband|brother/.test(q)) add((p) => ['narrow-is-the-way-hoodie', 'faith-over-fear-crewneck', 'crowned-snapback'].includes(p.slug));
    if (/gift|mom|mother|her|wife|sister/.test(q)) add((p) => ['faith-over-fear-crewneck', 'crowned-tee', 'narrow-is-the-way-hoodie'].includes(p.slug));
    return [...hits];
  }
  function answerFor(q) {
    const ql0 = q.toLowerCase();
    if (/book|devotional|god over everything|volume|pastor.*wrote|reading/.test(ql0)) {
      return { html: `The Pastor's book is <b>God Over Everything</b> — a 365-day devotional by Pastor Jeremy “Chico” Mills. <b>Volume One</b> (Days 1–181, 559 pages) and <b>Volume Two</b> (Days 182–365, 568 pages) are paperbacks at <b>$19.99</b> each, sold on <b>Amazon</b> — see the God Over Everything section on this page. The first 5 days are free to read in the Read hub. It is not Printful merch, so it is not in the piece counts.`, hits: [] };
    }
    const hits = matchProducts(q); const ql = q.toLowerCase();
    if (/warmest|warm for winter/.test(ql)) {
      const h = bySlug('narrow-is-the-way-hoodie');
      return { html: `The warmest piece in the line is the <b>${esc(h.name)}</b> — heavy blend fleece at <b>${money(h.price)}</b>, sizes ${h.sizes[0]}–${h.sizes[h.sizes.length - 1]}. The <b>FAITH OVER FEAR Crewneck</b> at ${money(58)} is the layer under it.`, hits: [h, bySlug('faith-over-fear-crewneck')] };
    }
    if (/ship|deliver|arrive/.test(ql)) return { html: `Every piece is <b>printed when you order</b> and fulfilled by Printful, shipping to US addresses. Allow a few days for printing, then standard delivery.`, hits: [] };
    if (/return|exchange|wrong size/.test(ql)) return { html: `Wrong size? Email <b>${CONTACT}</b> and we’ll make it right — exchanges for size are handled personally.`, hits: [] };
    if (/price|cost|how much/.test(ql) && !hits.length) return { html: `The launch six run <b>$34 to $68</b>: snapback $34, both tees $40, joggers $56, crewneck $58, hoodie $68. The full line runs $34 to $92.`, hits: S.products };
    if (hits.length) {
      const names = hits.map((p) => `<b>${esc(p.name)}</b> (${money(p.price)})`).join(', ');
      return { html: `Here’s what fits: ${names}. Tap any piece to see sizes and artwork.`, hits };
    }
    return { html: `I can answer about the line — sizing, gifts, prices, warmth. Try “a gift under $50” or “what comes in 5XL?” — or tap a piece below to see it up close.`, hits: S.products };
  }

  /* ---------- cards / grid ---------- */
  function sizeRange(p) { return p.sizes.length > 1 ? `${p.sizes[0]} – ${p.sizes[p.sizes.length - 1]}` : p.sizes[0]; }
  function cardHTML(p) {
    return `
    <article class="sh-card gold-frame" data-product="${esc(p.slug)}" data-cat="${esc(p.category)}" data-aud="${esc(p.audience)}" tabindex="0" role="button" aria-label="${esc(p.name)} — view product">
      <div class="sh-imgwrap"><span class="sr-badge">${esc(p.tag)}</span><img loading="lazy" data-front src="${esc(p.img)}" alt="${esc(p.name)} — front"><span class="sr-quick"><span>Quick view</span><span>+</span></span></div>
      <div class="sh-body">
        <div class="sh-tag">${esc(p.tag)}</div>
        <h3>${esc(p.name)}</h3>
        <p class="sh-blurb">${esc(p.blurb)}</p>
        <div class="sh-row"><span class="sh-price" data-price="${p.price}">${money(p.price)}</span><span class="sh-sizes">${esc(sizeRange(p))}</span></div>
        <div class="sh-row"><a class="sh-buy" data-buy href="${esc(S.quickStore)}" target="_blank" rel="noopener">Buy — ${money(p.price)}</a><span class="sh-sizes">Tap card for sizes</span></div>
      </div>
    </article>`;
  }

  function searchBlockHTML() {
    return `
    <div class="aisearch reveal" style="background:linear-gradient(160deg,#141105,#0a0a0a 55%);border:1px solid var(--line);border-radius:20px;padding:22px;margin-top:22px">
      <h3 style="font-family:var(--serif);font-size:22px;color:var(--gold-hi)">✦ Ask the Shop <span class="ai-tag">Powered by AI</span></h3>
      <p class="sh-note" style="margin-top:4px">AI search that answers — sizing, gifts, prices, and the right piece for the moment. It answers from the real catalog, right here in the hub. <b>FaithGuide · Shop AI Recommendations</b> — the same assistant, labeled wherever it speaks.</p>
      <form class="hub-search" data-sh="searchform" style="margin:14px 0 0">
        <input type="search" data-sh="q" style="min-width:0" placeholder="What’s warm for winter? A gift under $50? Something in 3XL?" aria-label="Ask the shop">
        <button class="btn-gold" type="submit" style="flex:none;padding:13px 18px">Answer</button>
      </form>
      <div class="sh-chips" style="margin-top:12px">
        ${['A gift under $50', 'What’s warmest?', 'What comes in 5XL?', 'Show me the hoodies', 'A gift for my dad', 'The Pastor’s book'].map((c) => `<button type="button" class="sh-chip" data-sh="chip" style="letter-spacing:.04em;text-transform:none">${esc(c)}</button>`).join('')}
      </div>
      <div data-sh="answer"></div>
    </div>`;
  }

  /* ---------- catalog-driven paints (slots below the film; the film
     element is outside every slot and is never repainted) ---------- */
  const filterSlot = root.querySelector('[data-sh="filterbar"]');
  const aiSlot = root.querySelector('[data-sh="aislot"]');
  const gridSlot = root.querySelector('[data-sh="gridslot"]');
  const campaignSlot = root.querySelector('[data-sh="campaign"]');
  const tilesSlot = root.querySelector('[data-sh="tiles"]');

  function paintFilterbar() {
    const tabs = [['all', 'All Pieces']].concat(S.categories);
    filterSlot.innerHTML = `
      <div class="sr-filterbar">
        <div class="sr-tabs" role="group" aria-label="Filter collection">
          ${tabs.map(([c, l]) => `<button type="button" class="sr-tab ${S.cat === c ? 'on' : ''}" data-door-type="${c}">${esc(l)}<sup>${c === 'all' ? S.products.length : S.products.filter((p) => p.category === c).length}</sup></button>`).join('')}
        </div>
        <label class="sr-sort">Sort <select data-sh="sort" aria-label="Sort products">
          ${[['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name: A–Z']].map(([v, l]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select></label>
      </div>
      <div class="sh-chips" role="group" aria-label="Browse by audience">${[['all', 'All'], ['mens', 'Mens'], ['womens', 'Womens']].map(([f, l]) => `<button type="button" class="sh-chip ${S.aud === f ? 'on' : ''}" data-door-aud="${f}">${l}</button>`).join('')}
      <span class="sr-count" data-sh="count" style="margin-left:auto"></span></div>
      <p class="sh-note">Every current piece is a <b>unisex</b> cut, tagged exactly as the shop page tags it — so Mens and Womens browse both show the full unisex line. Nothing is re-tagged.</p>`;
    filterSlot.querySelectorAll('[data-door-type]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.doorType; paintFilterbar(); paintGrid(); }));
    filterSlot.querySelectorAll('[data-door-aud]').forEach((b) => b.addEventListener('click', () => { S.aud = b.dataset.doorAud; paintFilterbar(); paintGrid(); }));
    filterSlot.querySelector('[data-sh="sort"]').addEventListener('change', (e) => { S.sort = e.target.value; paintGrid(); });
    paintCount();
  }
  function paintCount() {
    const el = filterSlot.querySelector('[data-sh="count"]');
    if (!el) return;
    const n = filtered().length;
    const title = S.cat === 'all' ? 'All Pieces' : catLabel(S.cat);
    el.textContent = `${title} · ${n} ${n === 1 ? 'piece' : 'pieces'}${S.aud !== 'all' ? ` · ${S.aud === 'mens' ? 'Mens' : 'Womens'} browse` : ''}`;
  }
  function paintAi() {
    aiSlot.innerHTML = searchBlockHTML();
    const form = aiSlot.querySelector('[data-sh="searchform"]');
    form.addEventListener('submit', (e) => { e.preventDefault(); const q = form.querySelector('[data-sh="q"]').value.trim(); if (q) { S.query = q; renderAnswer(q); } });
    aiSlot.querySelectorAll('[data-sh="chip"]').forEach((c) => c.addEventListener('click', () => {
      const inp = aiSlot.querySelector('[data-sh="q"]'); if (inp) inp.value = c.textContent.trim();
      S.query = c.textContent.trim(); renderAnswer(S.query);
    }));
  }
  function paintGrid() {
    const list = filtered();
    gridSlot.innerHTML = `<div class="sh-grid" data-sh="grid">${list.length ? list.map(cardHTML).join('') : '<p class="sh-note">No pieces in this browse.</p>'}</div>
      <p class="sh-note">Every front carries the full 16:3 FAITH mark. Checkout runs on Printful’s secure store. Questions: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`;
    gridSlot.querySelectorAll('[data-product]').forEach((card) => {
      card.addEventListener('click', (e) => { if (e.target.closest('[data-buy]')) return; openProduct(card.dataset.product); });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(card.dataset.product); } });
    });
    paintCount();
  }
  function paintCampaign() {
    const p = bySlug('crowned-heavy-hoodie') || S.products[0];
    if (!p) return;
    campaignSlot.innerHTML = `
    <section class="sr-campaign reveal">
      <span class="ghost" aria-hidden="true">16:3</span>
      <div class="sr-eyebrow">Built for life outside the church walls</div>
      <h2>LOUD<br>WITHOUT<br><em>APOLOGY.</em></h2>
      <p>Your faith doesn’t clock out when the service ends. Neither should your gear.</p>
      <img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)} — front">
      <div class="sr-buttons"><button type="button" class="btn-gold" data-campaign-all style="padding:13px 22px">Find your piece ↗</button></div>
    </section>`;
    campaignSlot.querySelector('[data-campaign-all]').addEventListener('click', () => { S.cat = 'all'; S.aud = 'all'; paintFilterbar(); paintGrid(); scrollTo('collection'); });
  }
  function paintTiles() {
    const tileFor = (c, l, i) => {
      const p = c === 'all' ? bySlug('crowned-tee') : S.products.find((x) => x.category === c);
      const n = c === 'all' ? S.products.length : S.products.filter((x) => x.category === c).length;
      return `<button type="button" class="sr-tile" data-cat-tile="${c}"><span class="no">0${i + 1} / ${c === 'all' ? 'The Whole Line' : esc(catLabel(c))}</span>${p ? `<img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)} — front">` : ''}<span class="meta"><span>${esc(l)}</span><strong>${c === 'all' ? 'Every piece, one wall' : esc(l) + ' — wear it loud'} ↗</strong><small>${n} ${n === 1 ? 'piece' : 'pieces'}</small></span></button>`;
    };
    tilesSlot.innerHTML = `<div class="sr-tiles">${[['all', 'All Pieces']].concat(S.categories).map(([c, l], i) => tileFor(c, l, i)).join('')}</div>`;
    tilesSlot.querySelectorAll('[data-cat-tile]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.catTile; paintFilterbar(); paintGrid(); scrollTo('collection'); }));
  }
  function paintCatalog() {
    paintFilterbar(); paintAi(); paintGrid(); paintCampaign(); paintTiles();
    window.__shop.ready = true;
    window.__shop.products = S.products;
    if (window.FaithMotion) window.FaithMotion.armReveals(root);
  }

  /* ---------- product dialog (the shop page's own dialog pattern) ---------- */
  function openProduct(slug) {
    const p = bySlug(slug); if (!p) return;
    S.dialogSlug = slug;
    S.dialogSize = p.sizes[Math.min(1, p.sizes.length - 1)];
    let dlg = root.querySelector('dialog.sh-dlg');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.className = 'sh-dlg'; root.appendChild(dlg); }
    dlg.innerHTML = `
    <div class="sh-pd" data-dialog="${esc(p.slug)}">
      <button type="button" class="x" data-sh="dlgclose" aria-label="Close">✕</button>
      <div class="gal">
        <img class="main" data-sh="pdmain" src="${esc(p.views[0])}" alt="${esc(p.name)} — front">
        <div class="thumbs">${p.views.map((v, i) => `<img src="${esc(v)}" data-view="${i}" class="${i === 0 ? 'sel' : ''}" alt="View ${i + 1} of ${esc(p.name)}">`).join('')}</div>
      </div>
      <div class="info">
        <div class="sh-tag" style="font-size:11px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase">${esc(p.tag)}</div>
        <h3>${esc(p.name)}</h3>
        <div class="garment">${esc(p.garment)}</div>
        <p class="desc">${esc(p.blurb)}</p>
        <div class="sh-price" data-price="${p.price}" style="font-size:26px">${money(p.price)}</div>
        <div style="margin-top:14px;font-size:12px;letter-spacing:.22em;color:var(--mute)">SIZE</div>
        <div class="sh-sizepick">${p.sizes.map((s) => `<button type="button" data-size="${esc(s)}" class="${s === S.dialogSize ? 'sel' : ''}">${esc(s)}</button>`).join('')}</div>
        <a class="sh-buy buybtn" data-buy href="${esc(S.quickStore)}" target="_blank" rel="noopener">Buy on Printful — ${money(p.price)}</a>
        <p class="note">Printed when you order and fulfilled by Printful. Checkout runs on Printful’s secure store; US shipping, prices in USD. Questions: ${CONTACT}</p>
      </div>
    </div>`;
    dlg.querySelector('[data-sh="dlgclose"]').addEventListener('click', () => dlg.close());
    dlg.querySelectorAll('[data-view]').forEach((t) => t.addEventListener('click', () => {
      dlg.querySelector('[data-sh="pdmain"]').src = p.views[Number(t.dataset.view)];
      dlg.querySelectorAll('[data-view]').forEach((i) => i.classList.remove('sel')); t.classList.add('sel');
    }));
    dlg.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => {
      S.dialogSize = b.dataset.size;
      dlg.querySelectorAll('[data-size]').forEach((x) => x.classList.remove('sel')); b.classList.add('sel');
    }));
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
    if (!dlg.open) dlg.showModal();
    window.__shop.dialog = { slug, sizes: p.sizes.slice() };
  }
  window.__shop.openProduct = openProduct;

  /* ---------- AI answer rendering ---------- */
  function renderAnswer(q) {
    const slot = aiSlot.querySelector('[data-sh="answer"]'); if (!slot) return;
    const a = answerFor(q);
    slot.innerHTML = `<div class="sh-answer" data-sh="answertext">${a.html}</div>
      <div class="sh-mini">${a.hits.map((p) => `<button type="button" class="sh-minicard" data-mini="${esc(p.slug)}"><img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)}"><div class="mc"><b>${esc(p.name)}</b><span>${money(p.price)}</span></div></button>`).join('')}</div>`;
    slot.querySelectorAll('[data-mini]').forEach((b) => b.addEventListener('click', () => openProduct(b.dataset.mini)));
  }

  /* ---------- AI assistant — ported from the shop page (client-side) ---------- */
  const chat = root.querySelector('[data-sh="chat"]');
  const log = root.querySelector('[data-sh="log"]');
  const botSay = (html) => { const d = document.createElement('div'); d.className = 'sh-msg bot'; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  const meSay = (t) => { const d = document.createElement('div'); d.className = 'sh-msg me'; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  function toggleChat(force) {
    const open = force !== undefined ? force : !chat.classList.contains('open');
    chat.classList.toggle('open', open);
    if (open && !S.greeted) {
      S.greeted = true;
      botSay(`Welcome to the <b>163 Faith Shop</b>. I’m the shop assistant — I can help with <b>sizing</b>, <b>gift picks</b>, and the story behind each piece. What are you looking for?`);
    }
    if (open) root.querySelector('[data-sh="chatin"]').focus();
  }
  root.querySelector('[data-sh="fab"]').addEventListener('click', () => toggleChat());
  root.querySelector('[data-sh="chatclose"]').addEventListener('click', () => toggleChat(false));
  root.querySelector('[data-sh="chatform"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = root.querySelector('[data-sh="chatin"]');
    const t = inp.value.trim(); if (!t) return;
    meSay(t); inp.value = '';
    const q = t.toLowerCase();
    setTimeout(() => {
      if (/size|fit|tall|big|xl/.test(q)) {
        const sz = (t.toUpperCase().match(/\b(2XL|3XL|4XL|5XL|XL)\b/) || [])[1];
        if (sz === '5XL') botSay(`Only two pieces run to <b>5XL</b>: the <b>NARROW IS THE WAY Hoodie</b> (${money(68)}) and the <b>FAITH OVER FEAR Crewneck</b> (${money(58)}). Both are heavy blend — size up if you like a relaxed fit.`);
        else if (sz) botSay(`In <b>${sz}</b>: both tees run to 4XL, the hoodie and crewneck to 5XL. The tees are a relaxed garment-dyed fit — your normal size is the right call.`);
        else botSay(`Quick sizing map: tees <b>S–4XL</b> (relaxed fit), hoodie and crewneck <b>S–5XL</b>, joggers <b>S–2XL</b>, snapback is one size. Tell me your size and I’ll point you at the exact pieces.`);
      } else if (/gift|dad|father|mom|mother|wife|husband|friend/.test(q)) {
        botSay(answerFor(t).html + ` Every piece is printed when you order, so order a few days ahead of the day you need it.`);
      } else if (/verse|163|16:3|meaning|why/.test(q)) {
        botSay(`<b>16:3</b> is Proverbs 16:3 — <i>“Commit thy works unto the LORD, and thy thoughts shall be established.”</i> It’s the foundation of 163 Faith and the reason every piece carries the crown: the work is His first.`);
      } else if (/ship|deliver|long/.test(q)) botSay(`Printed when you order, fulfilled by <b>Printful</b>, US shipping. Printing takes a few days, then it’s on a truck to you.`);
      else if (/contact|email|human|help/.test(q)) botSay(`You can reach a human any time at <b>${CONTACT}</b> — that inbox is watched daily.`);
      else botSay(answerFor(t).html);
    }, 350);
  });

  /* ---------- boot: catalog is data, lazy-fetched on hub entry ---------- */
  (async () => {
    try {
      const r = await fetch(new URL(DATA, document.baseURI));
      if (!r.ok) throw new Error('catalog HTTP ' + r.status);
      const d = await r.json();
      S.products = d.products; S.categories = d.categories;
      if (d.source && d.source.quickStore) S.quickStore = d.source.quickStore;
      window.__shop.products = S.products;
      paintCatalog();
    } catch (e) {
      gridSlot.innerHTML = `<div class="placeholder-note"><b>The shop could not be loaded.</b> The catalog data did not answer (${esc(e.message)}). Nothing is simulated in its place — the line keeps selling at 163faithshop.com. Questions: ${CONTACT}</div>`;
    }
  })();
}
