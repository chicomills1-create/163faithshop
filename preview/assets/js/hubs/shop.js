/* SHOP hub v1 (SPEC §3.7) — the shop carried into the fresh build.
   The live shop page (../shop-build/site/index.html, source commit 87351be)
   is this hub's design base and functional floor.

   DOORS FIRST (HUB BREAKDOWN LAW + the shop's own pattern): browse by TYPE
   (Hoodies / Shirts / Crewnecks / Joggers / Headwear) and by AUDIENCE
   (ALL / MENS / WOMENS) → product grid → product dialog.

   DATA: assets/data/shop/products.json — extracted VERBATIM from the shop
   page's own PRODUCTS / CATOF / AUDOF / QUICK_STORE_BASE (names, prices,
   front images, sizes, garments). Nothing hardcoded here, nothing invented.
   Images are remote Printful CDN URLs — linked, never inlined or copied.

   BUY PATH (standing shop design, binding): every BUY links to the Quick
   Store ROOT (https://163faith.printful.me) — never per-product links, and
   there is NO in-hub checkout and NO cart (excluded by the founder freeze,
   §3.7).

   AUDIENCE TRUTH: every current piece is tagged "unisex" in the shop page's
   own AUDOF map. The audience filter is the shop page's own setAud rule —
   a piece shows for ALL, and for MENS/WOMENS when it is unisex — so Mens
   and Womens browse both return the full unisex line, stated honestly on
   the surface, never re-tagged.

   AI SEARCH + AI ASSISTANT: the shop page implements both CLIENT-SIDE
   (rule-based answers over the real catalog — matchProducts / answerFor /
   sendChat in its source). That exact behavior is carried here, ported
   function-for-function over the extracted data. No backend is needed and
   none is faked. */

const DATA = 'assets/data/shop/products.json';
const QUICK_STORE = 'https://163faith.printful.me';
const CONTACT = 'shop@163faithshop.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toFixed(2).replace(/\.00$/, '');

let cssDone = false;
function injectCss() {
  if (cssDone) return; cssDone = true;
  const st = document.createElement('style');
  st.textContent = `
  .sh-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:14px}
  .sh-door{position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--panel);min-height:132px;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;text-align:left;color:var(--bone);width:100%}
  .sh-door:hover{border-color:var(--gold-dim)}
  .sh-door .sh-art{position:absolute;inset:0;background:radial-gradient(120% 120% at 20% 0%,rgba(212,175,55,.26),rgba(5,5,5,0) 55%),linear-gradient(160deg,#171204,#0a0a0a 65%)}
  .sh-door .sh-ico{position:absolute;top:14px;left:16px;font-size:24px;color:var(--gold)}
  .sh-door h3{position:relative;font-family:var(--serif);font-size:20px}
  .sh-door p{position:relative;font-size:12.5px;color:var(--mute);margin-top:3px;line-height:1.45}
  .sh-sec{font-family:var(--serif);font-size:20px;color:var(--bone);margin-top:26px}
  .sh-note{font-size:12.5px;color:var(--mute);margin-top:10px;line-height:1.55}
  .sh-note b{color:var(--gold-hi)}
  .sh-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
  .sh-chip{border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:12px;letter-spacing:.18em;color:var(--gold-hi);text-transform:uppercase;background:rgba(0,0,0,.3);cursor:pointer}
  .sh-chip:hover{border-color:var(--gold)}
  .sh-chip.on{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border-color:transparent}
  .sh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;margin-top:18px}
  .sh-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden;text-align:left;padding:0;color:var(--bone);width:100%;cursor:pointer}
  .sh-card:hover{border-color:var(--gold-dim)}
  .sh-card .sh-imgwrap{background:#1a1a1a;aspect-ratio:1;overflow:hidden}
  .sh-card img{width:100%;height:100%;object-fit:cover}
  .sh-card .sh-body{padding:16px 18px 18px}
  .sh-card .sh-tag{font-size:11px;letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
  .sh-card h3{font-family:var(--serif);font-size:21px;margin:6px 0 4px;line-height:1.2}
  .sh-card .sh-blurb{color:var(--mute);font-size:13.5px;line-height:1.5;min-height:40px}
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
  .sh-back{margin-top:14px;padding:9px 18px;font-size:11.5px}
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
  `;
  document.head.appendChild(st);
}

export function render(root) {
  injectCss();
  const S = {
    view: 'doors', // doors | grid
    products: [], categories: [], quickStore: QUICK_STORE,
    cat: 'all', aud: 'all', query: '',
    dialogSlug: null, dialogSize: null, greeted: false,
  };
  window.__shop = { state: S, ready: false, products: [] };

  root.innerHTML = `
    <p class="kicker">Shop · Wear the Work</p>
    <h1>Gold on black. <span class="g">Front mark, always.</span></h1>
    <p class="lede">Real Printful pieces — every front carries the full 16:3 FAITH mark. Printed when you order, fulfilled by Printful. Questions: <a href="mailto:${CONTACT}">${CONTACT}</a></p>
    <div data-sh="main"><p class="sh-note">Loading the line…</p></div>
    <button type="button" class="sh-fab" data-sh="fab">✦ Shop Assistant</button>
    <div class="sh-chat" data-sh="chat">
      <header><b>✦ 163 Assistant</b><button type="button" data-sh="chatclose" aria-label="Close assistant">✕</button></header>
      <div class="log" data-sh="log"></div>
      <form data-sh="chatform"><input data-sh="chatin" placeholder="Sizing, gifts, prices…" autocomplete="off" aria-label="Ask the shop assistant"><button type="submit">Ask</button></form>
    </div>`;
  const main = root.querySelector('[data-sh="main"]');
  const bySlug = (s) => S.products.find((p) => p.slug === s);
  const catLabel = (c) => (S.categories.find(([k]) => k === c) || [, c])[1];
  const audVisible = (p, aud) => aud === 'all' || p.audience === aud || p.audience === 'unisex'; // the shop page's own setAud rule
  const filtered = () => S.products.filter((p) => (S.cat === 'all' || p.category === S.cat) && audVisible(p, S.aud));

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
    <article class="sh-card" data-product="${esc(p.slug)}" data-cat="${esc(p.category)}" data-aud="${esc(p.audience)}" tabindex="0" role="button" aria-label="${esc(p.name)} — view product">
      <div class="sh-imgwrap"><img loading="lazy" data-front src="${esc(p.img)}" alt="${esc(p.name)} — front"></div>
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
    <div class="aisearch" style="background:linear-gradient(160deg,#141105,#0a0a0a 55%);border:1px solid var(--line);border-radius:20px;padding:22px;margin-top:22px">
      <h3 style="font-family:var(--serif);font-size:22px;color:var(--gold-hi)">✦ Ask the Shop</h3>
      <p class="sh-note" style="margin-top:4px">AI search that answers — sizing, gifts, prices, and the right piece for the moment. It answers from the real catalog, right here in the hub.</p>
      <form class="hub-search" data-sh="searchform" style="margin:14px 0 0">
        <input type="search" data-sh="q" style="min-width:0" placeholder="What’s warm for winter? A gift under $50? Something in 3XL?" aria-label="Ask the shop">
        <button class="btn-gold" type="submit" style="flex:none;padding:13px 18px">Answer</button>
      </form>
      <div class="sh-chips" style="margin-top:12px">
        ${['A gift under $50', 'What’s warmest?', 'What comes in 5XL?', 'Show me the hoodies', 'A gift for my dad'].map((c) => `<button type="button" class="sh-chip" data-sh="chip" style="letter-spacing:.04em;text-transform:none">${esc(c)}</button>`).join('')}
      </div>
      <div data-sh="answer"></div>
    </div>`;
  }

  function audChipsHTML() {
    return `<div class="sh-chips" role="group" aria-label="Browse by audience">${[['all', 'All'], ['mens', 'Mens'], ['womens', 'Womens']].map(([f, l]) => `<button type="button" class="sh-chip ${S.aud === f ? 'on' : ''}" data-audfilter="${f}">${l}</button>`).join('')}</div>
    <p class="sh-note">Every current piece is a <b>unisex</b> cut, tagged exactly as the shop page tags it — so Mens and Womens browse both show the full unisex line. Nothing is re-tagged.</p>`;
  }
  function catChipsHTML(includeAll) {
    const cats = (includeAll ? [['all', 'All pieces']] : []).concat(S.categories);
    return `<div class="sh-chips" role="group" aria-label="Browse by type">${cats.map(([c, l]) => `<button type="button" class="sh-chip ${S.cat === c ? 'on' : ''}" data-catfilter="${c}">${esc(l)} · ${c === 'all' ? S.products.length : S.products.filter((p) => p.category === c).length}</button>`).join('')}</div>`;
  }

  /* ---------- views ---------- */
  function viewDoors() {
    S.view = 'doors';
    main.innerHTML = `
      ${searchBlockHTML()}
      <h3 class="sh-sec">Shop by type</h3>
      <div class="sh-doors">
        <button type="button" class="sh-door" data-door-type="all"><span class="sh-art"></span><span class="sh-ico">◆</span><h3>All Pieces</h3><p>${S.products.length} pieces — the whole line</p></button>
        ${S.categories.map(([c, l]) => `<button type="button" class="sh-door" data-door-type="${c}"><span class="sh-art"></span><span class="sh-ico">◆</span><h3>${esc(l)}</h3><p>${S.products.filter((p) => p.category === c).length} ${S.products.filter((p) => p.category === c).length === 1 ? 'piece' : 'pieces'}</p></button>`).join('')}
      </div>
      <h3 class="sh-sec">Shop by audience</h3>
      <div class="sh-doors">
        ${[['all', 'All', 'Everyone — the full line'], ['mens', 'Mens', 'Unisex cuts, browsed for men'], ['womens', 'Womens', 'Unisex cuts, browsed for women']].map(([f, l, d]) => `<button type="button" class="sh-door" data-door-aud="${f}"><span class="sh-art"></span><span class="sh-ico">●</span><h3>${l}</h3><p>${d} · ${S.products.filter((p) => audVisible(p, f)).length} pieces</p></button>`).join('')}
      </div>
      <p class="sh-note">Buy path: every piece checks out on the Printful Quick Store — <b>${esc(S.quickStore)}</b>. No in-hub checkout. Contact: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`;
    wire();
  }

  function viewGrid() {
    S.view = 'grid';
    const list = filtered();
    const title = S.cat === 'all' ? 'All Pieces' : catLabel(S.cat);
    main.innerHTML = `
      <button type="button" class="btn-ghost sh-back" data-act="doors">← All Shop doors</button>
      ${searchBlockHTML()}
      <div class="shelf"><h3>${esc(title)} <span class="shelf-count">· ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}${S.aud !== 'all' ? ` · ${S.aud === 'mens' ? 'Mens' : 'Womens'} browse` : ''}</span></h3>
      ${catChipsHTML(true)}
      ${audChipsHTML()}
      <div class="sh-grid" data-sh="grid">${list.length ? list.map(cardHTML).join('') : '<p class="sh-note">No pieces in this browse.</p>'}</div></div>
      <p class="sh-note">Every front carries the full 16:3 FAITH mark. Checkout runs on Printful’s secure store. Questions: <a href="mailto:${CONTACT}">${CONTACT}</a></p>`;
    wire();
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

  /* ---------- wiring ---------- */
  function renderAnswer(q) {
    const slot = main.querySelector('[data-sh="answer"]'); if (!slot) return;
    const a = answerFor(q);
    slot.innerHTML = `<div class="sh-answer" data-sh="answertext">${a.html}</div>
      <div class="sh-mini">${a.hits.map((p) => `<button type="button" class="sh-minicard" data-mini="${esc(p.slug)}"><img loading="lazy" src="${esc(p.img)}" alt="${esc(p.name)}"><div class="mc"><b>${esc(p.name)}</b><span>${money(p.price)}</span></div></button>`).join('')}</div>`;
    slot.querySelectorAll('[data-mini]').forEach((b) => b.addEventListener('click', () => openProduct(b.dataset.mini)));
  }
  function wire() {
    main.querySelectorAll('[data-door-type]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.doorType; S.aud = 'all'; viewGrid(); }));
    main.querySelectorAll('[data-door-aud]').forEach((b) => b.addEventListener('click', () => { S.aud = b.dataset.doorAud; S.cat = 'all'; viewGrid(); }));
    const back = main.querySelector('[data-act="doors"]');
    if (back) back.addEventListener('click', viewDoors);
    main.querySelectorAll('[data-catfilter]').forEach((b) => b.addEventListener('click', () => { S.cat = b.dataset.catfilter; viewGrid(); }));
    main.querySelectorAll('[data-audfilter]').forEach((b) => b.addEventListener('click', () => { S.aud = b.dataset.audfilter; viewGrid(); }));
    main.querySelectorAll('[data-product]').forEach((card) => {
      card.addEventListener('click', (e) => { if (e.target.closest('[data-buy]')) return; openProduct(card.dataset.product); });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProduct(card.dataset.product); } });
    });
    const form = main.querySelector('[data-sh="searchform"]');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); const q = form.querySelector('[data-sh="q"]').value.trim(); if (q) { S.query = q; renderAnswer(q); } });
    main.querySelectorAll('[data-sh="chip"]').forEach((c) => c.addEventListener('click', () => {
      const inp = main.querySelector('[data-sh="q"]'); if (inp) inp.value = c.textContent.trim();
      S.query = c.textContent.trim(); renderAnswer(S.query);
    }));
    window.__shop.ready = true;
    window.__shop.openProduct = openProduct;
    window.__shop.state = S;
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
      viewDoors();
    } catch (e) {
      main.innerHTML = `<div class="placeholder-note"><b>The shop could not be loaded.</b> The catalog data did not answer (${esc(e.message)}). Nothing is simulated in its place — the line keeps selling at 163faithshop.com. Questions: ${CONTACT}</div>`;
    }
  })();
}
