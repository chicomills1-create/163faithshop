/* HOME — the visual hub selector (SPEC §3.0). Not a scrolling homepage:
   a cinematic hero ("THE MOVEMENT" — ChatGPT art direction, founder visual
   ruling 2026-11-19), seven full-bleed PHOTO tile doors, Today's Word,
   live counters, and the Meet the Pastor piece at selector level (row MTP).
   The flat gold-gradient + glyph-icon tiles are DELETED by that ruling.
   Tile photography is AI-generated presentation imagery (founder: "clean
   pics, AI pics"), EXCEPT Shop, which carries the REAL Printful product
   photo — real product only, per the shop law.
   Today's Word (ledger row HTW): the section below is fed by the SAME
   data file the READ hub uses — assets/data/read/devotionals.json — with
   READ's own selection (latest entry published as of today; no dedicated
   daily-word API exists, the word rides the devotional data). One data
   source, no second copy to drift. If the data cannot load, the section
   says so and points at the Read hub — nothing is fabricated. */
/* The Crowned Heavy Hoodie's real product photo, referenced exactly as the
   shop hub's own catalog data references it (assets/data/shop/products.json,
   product "crowned-heavy-hoodie" → "img"). No generated art on the Shop
   tile — the real 16:3 mark on the real garment is the point. */
const SHOP_TILE_IMG = 'https://files.cdn.printful.com/files/165/16596b1e990f2038c70450d8a836d73b_preview.png';
const TILES = [
  { hub: 'watch',     num: '01', name: 'WATCH',     blurb: 'Films, series & teachings',    img: 'assets/img/home/tile-watch.webp',     alt: 'A singer performing into a microphone under a golden spotlight' },
  { hub: 'listen',    num: '02', name: 'LISTEN',    blurb: 'The Sanctuary — full songs',   img: 'assets/img/home/tile-listen.webp',    alt: 'A woman in headphones at a studio mixing console, eyes closed, lost in the music' },
  { hub: 'read',      num: '03', name: 'READ',      blurb: 'Bible, devotionals & the book', img: 'assets/img/home/tile-read.webp',     alt: 'A young woman with long braids reading an open book in warm window light' },
  { hub: 'pray',      num: '04', name: 'PRAY',      blurb: 'The Prayer Room',              img: 'assets/img/home/tile-pray.webp',      alt: 'A young man in a black hoodie praying by a window, hands open in golden light' },
  { hub: 'community', num: '05', name: 'COMMUNITY', blurb: 'Feed, testimonies & members',  img: 'assets/img/home/tile-community.webp', alt: 'Friends laughing together around a shared table of food' },
  { hub: 'give',      num: '06', name: 'GIVE',      blurb: 'Offerings & partnership',      img: 'assets/img/home/tile-give.webp',      alt: 'A young man handing a bag of groceries to a young woman at a produce table' },
  { hub: 'shop',      num: '07', name: 'SHOP',      blurb: 'Wear the work — gold on black', img: SHOP_TILE_IMG, wide: true,            alt: 'The Crowned Heavy Hoodie — a real 16:3 Faith product photo from the shop' },
];
/* Counter values carried from the data census (2026-11-18 rendered reads);
   at M2 these bind to the counters API (one source, SPEC §2 D4). */
const COUNTERS = [
  { n: '126', label: 'Members' },
  { n: '50',  label: 'Testimonies' },
  { n: '84',  label: 'Prayer requests' },
  { n: '19',  label: 'Prayers lifted' },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

const HW_STYLE = `<style>
.hw-card{margin-top:38px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(160deg,#141105,#0a0a0a 55%);padding:26px 28px}
.hw-meta{font-size:12px;color:var(--mute);letter-spacing:.06em}
.hw-title{margin-top:8px}
.hw-quote{border-left:2px solid var(--gold);padding:6px 0 6px 16px;font-family:var(--serif);font-style:italic;font-size:18px;line-height:1.6;margin-top:14px}
.hw-note{color:var(--mute);line-height:1.6;font-size:15px}
.hw-btn{margin-top:18px;background:transparent;border:1px solid var(--gold);color:var(--gold-hi);border-radius:999px;padding:9px 18px;font-size:13.5px;cursor:pointer}
.hw-btn:hover{background:rgba(212,175,55,.08)}
</style>`;

function hwFallback(body) {
  body.innerHTML = `
    <p class="hw-note">Today's word lives in the Read hub — one tap away.</p>
    <button class="hw-btn" type="button" data-hw-open>Open the Read hub →</button>`;
  body.querySelector('[data-hw-open]').addEventListener('click', () => { location.hash = '#/read'; });
}

/* Fill the Today's Word section from the shared devotional data (the same
   file + selection READ's Today's Word door uses). Runs after the face is
   painted so the selector never waits on data (§4 no-lag). */
async function fillTodaysWord(body) {
  try {
    const r = await fetch('assets/data/read/devotionals.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    const entries = Array.isArray(d.entries) ? d.entries : [];
    const e = entries.filter((x) => x.date <= todayISO()).sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;
    if (!body.isConnected) return; // visitor already moved on — nothing to fill
    if (!e) { hwFallback(body); return; }
    const dstr = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    body.innerHTML = `
      <p class="hw-meta">${esc(dstr.toUpperCase())}</p>
      <h2 class="hw-title" data-testid="home-word-title">${esc(e.title.toUpperCase())}</h2>
      <p class="hw-meta" style="margin-top:6px">${esc(e.reference)}</p>
      <div class="hw-quote" data-testid="home-word-verse">“${esc(e.verse)}”</div>
      <button class="hw-btn" type="button" data-hw-open>Read today's word in the Read hub →</button>`;
    body.querySelector('[data-hw-open]').addEventListener('click', () => { location.hash = '#/read'; });
  } catch {
    if (body.isConnected) hwFallback(body);
  }
}

export function render(root, { navigate }) {
  root.innerHTML = `
    ${HW_STYLE}
    <section class="hero">
      <img class="hero-img" src="assets/img/home/hero-movement.webp" alt="Five friends laughing together on a city street at night, in black streetwear with gold trim" fetchpriority="high">
      <div class="hero-shade"></div>
      <div class="hero-type">
        <p class="hero-mark">16:3 <b>FAITH</b></p>
        <div>
          <h1 class="hero-head">FAITH HAS A <span class="gold">NEW SOUND.</span></h1>
          <p class="hero-line">One faith. Many voices. A place to belong.</p>
        </div>
      </div>
    </section>
    <div class="hubgrid">
      ${TILES.map((t) => `
        <button class="tile${t.wide ? ' wide' : ''}" type="button" data-hub="${t.hub}">
          <img class="tile-img" src="${t.img}" alt="${esc(t.alt)}" loading="lazy">
          <span class="tile-shade"></span>
          <span class="tile-num">${t.num}</span>
          <span class="tile-name"><h3>${t.name}</h3><p>${t.blurb}</p></span>
        </button>`).join('')}
    </div>

    <section class="hw-card" id="todays-word" data-testid="home-todays-word">
      <p class="kicker">Today's Word</p>
      <div data-hw-body><p class="hw-note">Loading today's word…</p></div>
    </section>

    <div class="counters">${COUNTERS.map((c) => `<div class="counter"><b>${c.n}</b><span>${c.label}</span></div>`).join('')}</div>

    <section class="pastor" id="meet-the-pastor">
      <div class="pastor-photo">
        <span class="mono">JM</span>
        <img src="assets/img/home/pastor.webp" alt="Pastor Jeremy Mills preaching — microphone in hand, arm raised, wearing a black “It Is FINISHED” 16:3 Faith shirt" loading="lazy" onerror="this.remove()">
      </div>
      <div class="pastor-body">
        <p class="kicker">Meet the Pastor</p>
        <h2>Pastor Jeremy <span class="g">“Chico” Mills</span></h2>
        <p><b>Founder &amp; Pastor of 16:3 Faith</b> — and a USAF veteran who believes the church should sound like the future and feel like family. No suit, no tie, no distance: just the Word, the music, and a house where everybody can walk in as they are.</p>
        <p>Every hub in this house carries his conviction from Proverbs 16:3 — commit the work, and let God establish it.</p>
        <p class="pastor-sign">— Pastor Jeremy</p>
      </div>
    </section>`;
  root.querySelectorAll('[data-hub]').forEach((el) => {
    el.addEventListener('click', () => { location.hash = `#/${el.dataset.hub}`; });
  });
  fillTodaysWord(root.querySelector('[data-hw-body]'));
}
