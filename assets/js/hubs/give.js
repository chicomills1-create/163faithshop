/* GIVE hub (SPEC §3.6) — two doors per the HUB BREAKDOWN LAW:
   GIVE ONCE · MONTHLY PARTNER. Doors first, never a flat page.

   VISUAL LAYER (2026-11-19 graft): ChatGPT's Give design package
   (design-sources/give-chatgpt-package — founder-supplied) supplies the
   look: "FAITH IN MOTION." hero with the package's giving-cover art,
   tape break, "MAKE ROOM FOR MORE." builder (mode tabs + amount grid),
   1 John 3:18 KJV card, "WHAT WE WON'T DO" honesty card, three mission
   cards framed as VISION, the $16.30 partner section ("KEEP THE RECORD
   SPINNING."), FAQ accordion, "OPEN BOOKS. OPEN HANDS." promise card.
   The graft is presentation only — the contract layer below is the v1
   hub's, byte-for-byte in behavior. Package elements that do NOT ship
   (record: fresh-build/records/GIVE-GRAFT-RECORD-2026-11-19.md):
   the fund picker + dedication input (no contract field exists — a
   designation that submits nowhere is a fake promise), the review
   modal / copy / save-intention demo machinery (the real flow leaves
   for the Stripe-hosted checkout the API returns), the package's own
   header/footer/player stub (the shell owns chrome), and the "A WORD
   FROM THE PASTOR" draft panel (unreviewed words are never put in the
   pastor's mouth — the shape ships unattributed nowhere; it is dropped).

   ENDPOINT CONTRACT — every field evidenced, nothing guessed (full citations
   in records/HUB-GIVE-RECORD.md; census-2026-11-15 ledger item #47):

   - GIVE ONCE — POST {API}/api/community/offering/checkout, open to everyone
     (signed-in or guest). Body is EXACTLY { amountCents } — the server schema
     is z.object({ amountCents: int, min 100, max 100000 }) ($1–$1,000) and
     the production client (useStartOffering) sends that one field and no
     other. No name/email/note/fund/dedication field exists in the contract,
     so none is sent and none is collected on this hub.
     Success → 200 { url } → the browser goes to that Stripe Checkout URL.
     Failures → 400 (amount out of range) · 403 (suspended account) · 429
     (rate limit) · 502 (no session URL) · 503 { configured:false } (no key)
     · 500 { error: "Couldn't start the giving process right now." } — the
     500 text is verbatim the #47 census banner: the request passed
     validation and Stripe rejected session creation.
   - MONTHLY PARTNER — POST {API}/api/community/membership/checkout,
     sign-in REQUIRED (401 { error: "Please sign in." } signed-out). The
     production client (useStartMembership) sends NO body at all: mode and
     price are the server's — mode "subscription", price found-or-created by
     lookup_key "partner_monthly_1630" (unit_amount 1630 = $16.30/month,
     product "16:3 Partner"). Success → 200 { url } → same redirect.
     Failures → 401 · 404 (no profile) · 409 (already a Partner) · 429 ·
     502 · 503 { configured:false } (billing not ready) · 500.
   - Webhook (server-side, named for the record): POST /community/stripe/
     webhook — checkout.session.completed delivered 200 in the test proof.

   PIPELINE STATE (SPEC §3.6, proven — not assumed): test-mode proof PASSED
   end-to-end 2026-11-15 (Give $5 → sandbox checkout → test payment
   pi_3UcIeJIfr8SfWCOD2yM0Te1z succeeded → webhook 200,
   evt_1UcIeKIfr8SfWCODAJs4p8dJ → env restored). The code path is whole.
   The ONLY broken production link is the live key: the key in the legacy
   env is invalid (sk_live_…fT02, Stripe 401 at session creation), and its
   replacement is founder-gated (Stripe authenticator code). HONESTY LAW
   for this hub: live giving does NOT work today and nothing here claims
   or implies it does — the live state lives in ONE predicate
   (checkoutLive(), rendered by statusLineHTML as the package's
   "CHECKOUT IS NOT LIVE YET" strip, and read by every state-dependent
   line on the surface) so the day the key lands, that one value flips
   and the same build goes live with no design change; checkout
   failures land on a composed honest message (never the old face's bare
   red banner, never a fake success), and success is claimed only by the
   browser actually leaving for the checkout URL the API returned.
   Giving and Partner membership revive with the same key (they share one
   Stripe client), so the one status line covers both doors.

   Auth signal: window.Clerk.user (the shell's F-CLERK leg loads the real
   Clerk instance, 2026-11-22) — the same signal PRAY uses. Checkout
   carries the session token via window.FaithAuth (see postCheckout). */

const API = 'https://faith-hub-api-railway-production.up.railway.app';
const PARTNER_MONTHLY = '$16.30';
/* The package's amount grid (founder-adopted): $16.30 / $25 / $50 / $100 /
   $250 / Other — every value inside the evidenced $1–$1,000 schema range.
   Values are the data-amt strings; the payload is always integer cents. */
const PRESETS = ['16.30', '25', '50', '100', '250'];
const presetLabel = (v) => (v === '16.30' ? '$16.30' : '$' + v);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isSignedIn = () => { try { return !!(window.Clerk && window.Clerk.user); } catch { return false; } };
const fmtUSD = (cents) => '$' + (cents / 100).toFixed(2);

/* ---------------- state (fresh per hub entry = clean slate) --------------- */
let S = null;
function freshState() {
  return {
    view: 'doors',
    preset: 25,            // dollars; default selection so the payload is real on open
    custom: '',            // dollars string; non-empty overrides the preset
    customActive: false,   // the package grid's OTHER cell is chosen
    busy: false,
    error: null,           // { door, status, serverError } — composed message renders from this
    mountSeq: 0,
    requests: [],          // proof/debug: every checkout attempt, as sent + as answered
  };
}
function amountCents() {
  if (S.custom.trim() !== '') {
    const v = Number(S.custom);
    if (!Number.isFinite(v)) return null;
    return Math.round(v * 100);
  }
  return S.preset != null ? Math.round(S.preset * 100) : null;
}
function amountValid(cents) { return cents != null && Number.isInteger(cents) && cents >= 100 && cents <= 100_000; }
function offeringPayload() { const c = amountCents(); return c == null ? null : { amountCents: c }; }

function publishDebug() {
  window.__give = {
    ready: true,
    view: S.view,
    signedIn: isSignedIn(),
    amountCents: amountCents(),
    payload: offeringPayload(),
    requests: S.requests,
    error: S.error,
  };
}

/* ---------------- checkout transport ---------------------------------------
   One helper for both doors: records the exact request, reads the JSON body
   on BOTH outcomes (the failure shapes carry the honest detail), and returns
   { ok, status, json } — it never throws a success into existence. */
async function postCheckout(door, path, body) {
  const url = `${API}${path}`;
  const rec = { door, method: 'POST', url, body: body ?? null, status: null, response: null };
  S.requests.push(rec);
  publishDebug();
  const opts = { method: 'POST', credentials: 'include' };
  if (body != null) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    /* F-CLERK (2026-11-22): checkout rides the shell's FaithAuth
       transport — a signed-in member's session token verifies
       server-side (the 401 "session didn't verify" leg below is now
       reachable only on a genuinely dead session), and the terms
       gate's 403 routes the member to the acceptance step + retry. */
    const doFetch = window.FaithAuth?.apiFetch ? window.FaithAuth.apiFetch.bind(window.FaithAuth) : fetch; /* DEFECT 4b cure (2026-11-22): bind — apiFetch reads `this`; unbound extraction threw before any request (see community.js postJson) */
    res = await doFetch(url, opts);
  } catch (e) {
    rec.status = 0; rec.response = { networkError: String(e && e.message || e) };
    publishDebug();
    return { ok: false, status: 0, json: null, network: true };
  }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body — treated as no detail */ }
  rec.status = res.status; rec.response = json;
  publishDebug();
  return { ok: res.ok, status: res.status, json };
}

/* ---------------- rendering ------------------------------------------------ */
const STYLE = `<style>
/* ---------- GIVE GRAFT — ChatGPT Give package visual layer ----------
   Tokens mapped onto the shell's (--gold/--gold-hi/--gold-dim/--bone/
   --mute/--coal/--line) plus the package's scarlet accent. All rules are
   .gv-* scoped inside this module — no shell.css change. */
.gv-topline{display:flex;justify-content:space-between;gap:14px;font-size:9.5px;letter-spacing:1.7px;font-weight:800;color:#b4a07b;text-transform:uppercase;padding:2px 0 12px}
.gv-topline b{color:var(--gold)}
.gv-topline i{color:#e3472e;font-style:normal;margin:0 6px}
@media(max-width:640px){.gv-topline span:last-child{display:none}}
.gv-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;padding:26px 0 40px}
.gv-eyebrow{font-size:11px;letter-spacing:2.8px;font-weight:850;color:var(--gold);text-transform:uppercase}
.gv-eyebrow .gv-star{color:#e3472e;font-size:17px;margin-right:6px;vertical-align:-2px}
.gv-eyebrow .gv-faint{color:#8a7a58}
.gv-h1{font-family:Impact,'Arial Black',var(--sans);font-size:clamp(58px,7.6vw,104px);line-height:.9;letter-spacing:-2px;margin:20px 0 18px;color:var(--bone);text-transform:uppercase;font-weight:900}
.gv-h1 span{color:var(--gold)}
.gv-lede{font-size:16.5px;line-height:1.65;color:#ddd0b4;max-width:480px}
.gv-herobtns{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-top:26px}
.gv-goldbtn{border:0;background:var(--gold);color:#171006;padding:16px 20px;border-radius:7px;display:inline-flex;gap:26px;align-items:center;font-weight:900;font-size:12px;letter-spacing:1.1px;box-shadow:6px 6px 0 #5a3d14;text-transform:uppercase;cursor:pointer}
.gv-goldbtn:hover{background:var(--gold-hi)}
.gv-goldbtn span{font-size:19px}
.gv-underlink{background:none;border:none;border-bottom:1px solid var(--gold);color:var(--bone);font-size:11px;letter-spacing:1.2px;font-weight:850;padding:7px 0;text-transform:uppercase;cursor:pointer}
.gv-underlink span{color:var(--gold)}
.gv-herfoot{display:flex;align-items:center;gap:13px;margin-top:40px;color:#a99a79;font-size:10px;letter-spacing:1.4px;font-weight:800}
.gv-herfoot i{display:inline-block;width:30px;height:4px;background:#e3472e;flex:none}
.gv-artwrap{position:relative;max-width:440px;width:100%;margin-left:auto;transform:rotate(2deg)}
.gv-artwrap:before{content:"";position:absolute;inset:-16px 14px 14px -14px;border:1px solid #7e571d;transform:rotate(-4deg)}
.gv-artwrap:after{content:"";position:absolute;inset:-9px 9px 10px -7px;border:1px solid rgba(209,166,80,.4);transform:rotate(-1deg)}
.gv-artwrap img{position:relative;width:100%;height:auto;border:1px solid #8b5a1c;box-shadow:22px 22px 44px rgba(0,0,0,.55);background:#0a0a09}
.gv-stamp{position:absolute;right:-10px;top:16px;background:#bb2f20;color:#fff2de;transform:rotate(11deg);font-size:9px;font-weight:900;letter-spacing:1.3px;line-height:1.6;padding:11px 13px;text-align:center;box-shadow:5px 8px 15px rgba(0,0,0,.5);z-index:2}
.gv-scratch{position:absolute;left:12px;bottom:10px;font-size:8px;letter-spacing:2px;color:#b4a074;font-weight:800;z-index:2}
@media(max-width:820px){.gv-hero{grid-template-columns:1fr;gap:34px;padding-top:14px}.gv-artwrap{margin:0 auto}}
.gv-tape{display:flex;align-items:center;justify-content:space-between;gap:10px;border-top:1px solid #785a27;border-bottom:1px solid #785a27;background:#241b10;padding:13px 16px;font-size:10.5px;font-weight:900;letter-spacing:1.7px;color:#d5b862;text-transform:uppercase}
.gv-tape strong{color:#e3472e;font-size:19px}
@media(max-width:640px){.gv-tape span:last-child,.gv-tape strong:last-of-type{display:none}}
/* The not-live strip — statusLineHTML() is the hub's ONE state source;
   this is the package's "CHECKOUT IS NOT LIVE YET" strip as its skin. */
.gv-status{border:1px solid #64501b;border-radius:10px;background:#1b180f;padding:13px 16px;margin-top:22px;font-size:13.5px;line-height:1.6;color:#d4be87}
.gv-honesty{margin-top:14px;font-size:12.5px;line-height:1.6;color:#b9ad97}
.gv-card .gv-honesty{margin-top:10px}
.gv-status b{color:#f8d879;letter-spacing:.4px}
.gv-status .gv-dot{color:#e3472e;margin-right:6px}
.gv-sec{margin-top:64px}
.gv-sechead{display:flex;justify-content:space-between;align-items:flex-end;gap:26px;margin-bottom:26px}
.gv-sechead h2{font-family:Impact,'Arial Black',var(--sans);font-size:clamp(40px,5vw,64px);line-height:.96;letter-spacing:-.5px;margin:10px 0 10px;color:var(--bone);text-transform:uppercase}
.gv-sechead h2 em{font-style:normal;color:var(--gold)}
.gv-sechead p{color:var(--mute);font-size:14px;line-height:1.6;max-width:600px}
.gv-stamp2{font-size:10px;letter-spacing:2px;font-weight:900;color:#aa8b4c;border-top:2px solid var(--gold);border-bottom:2px solid var(--gold);padding:11px;text-align:right;transform:rotate(-2deg);line-height:1.6;white-space:nowrap}
.gv-stamp2 b{color:var(--bone)}
@media(max-width:640px){.gv-stamp2{display:none}}
.gv-doors{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:700px){.gv-doors{grid-template-columns:1fr}}
.gv-door{border:1px solid #836622;border-radius:15px;background:linear-gradient(145deg,#1c170d,#0d0d0a 55%);padding:24px;text-align:left;color:var(--bone);width:100%;box-shadow:0 18px 40px rgba(0,0,0,.4)}
.gv-door:hover{border-color:var(--gold);transform:translateY(-2px)}
.gv-door .gv-art{height:52px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.25),rgba(212,175,55,.04));margin-bottom:14px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--gold)}
.gv-door b{font-size:19px;display:block;font-family:var(--serif)}
.gv-door span{font-size:13px;color:var(--mute);line-height:1.55;display:block;margin-top:5px}
.gv-chip{display:inline-block;font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#141005;background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));border-radius:999px;padding:3px 9px;font-weight:700;margin-top:12px}
.gv-chip.ghost{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi)}
.gv-note{font-size:12.5px;color:var(--mute);margin-top:14px;line-height:1.55}
.gv-side3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}
@media(max-width:820px){.gv-side3{grid-template-columns:1fr}}
.gv-sidecard{background:#14120f;border:1px solid var(--line);border-radius:12px;padding:24px}
.gv-sidecard.dark{background:linear-gradient(125deg,#20170d,#10100d)}
.gv-sideline{display:block;font-size:10px;letter-spacing:1.7px;color:#c6a85e;font-weight:900;text-transform:uppercase}
.gv-sidequote{font-family:Impact,'Arial Black',var(--sans);font-size:31px;line-height:1.05;margin:20px 0 12px;color:var(--bone);text-transform:uppercase}
.gv-sidequote em{color:var(--gold);font-style:normal}
.gv-sidecard p{color:#b4a58b;font-size:12.5px;line-height:1.7}
.gv-cardend{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:16px;margin-top:14px;color:var(--gold);font-weight:900;font-size:10px;letter-spacing:1px}
.gv-cardend span{font-size:21px}
.gv-sidecard.scripture{border-color:#79622a;background:#201c11}
.gv-sidecard.scripture blockquote{font-family:var(--serif);font-size:20.5px;line-height:1.46;color:#fff3d9;margin:18px 0 12px}
.gv-sidecard.scripture strong{font-size:11px;letter-spacing:1.6px;color:var(--gold)}
.gv-sidecard.scripture strong b{color:#a99a79;font-weight:normal}
.gv-sidecard.trust ul{padding-left:19px;color:#b8ad93;font-size:12.5px;line-height:1.75;margin-top:14px}
.gv-sidecard.trust li+li{margin-top:8px}
</style>`;

const STYLE2 = `<style>
/* ---------- builder (Give Once / Monthly Partner views) ---------- */
.gv-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0}
.gv-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:10px 18px;font-size:12.5px;letter-spacing:.08em;cursor:pointer}
.gv-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}
.gv-btn[disabled]{opacity:.45;cursor:not-allowed}
.gv-build{display:grid;grid-template-columns:minmax(0,1.78fr) minmax(270px,.8fr);gap:20px;align-items:start;margin-top:22px}
@media(max-width:900px){.gv-build{grid-template-columns:1fr}}
.gv-card{border:1px solid #836622;background:linear-gradient(145deg,#1c170d,#0d0d0a 50%,#10100d);border-radius:16px;padding:32px;box-shadow:0 30px 70px rgba(0,0,0,.45)}
@media(max-width:640px){.gv-card{padding:19px}}
.gv-cardtop{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:24px}
.gv-tiny{color:#c7ab6b;font-size:11px;letter-spacing:2px;font-weight:900;text-transform:uppercase}
.gv-cardtop h3{font-family:Impact,'Arial Black',var(--sans);font-size:clamp(32px,3.4vw,48px);font-weight:850;line-height:.97;margin:10px 0 0;color:var(--bone);text-transform:uppercase}
.gv-cardtop h3 em{color:var(--gold);font-style:normal}
.gv-circle{border-radius:50%;height:60px;width:60px;flex:0 0 60px;border:1px solid #836622;display:grid;place-items:center;color:var(--gold);font-size:32px;background:#362912}
@media(max-width:640px){.gv-circle{height:44px;width:44px;flex-basis:44px;font-size:24px}}
.gv-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:1px solid #4f3b1e;background:#0e0e0c;border-radius:9px;padding:6px;margin-bottom:30px}
.gv-tabs button{padding:14px 6px;border:0;border-radius:6px;background:transparent;color:#a99975;font-size:11.5px;letter-spacing:1px;font-weight:900;white-space:nowrap;cursor:pointer;text-transform:uppercase}
.gv-tabs button span{margin-right:8px;font-size:10px;color:#8b7343}
.gv-tabs button.active{background:var(--gold);color:#211804}
.gv-tabs button.active span{color:#634b1d}
.gv-fieldhead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;font-size:10px;letter-spacing:1.5px;font-weight:900;color:#ebddbb;text-transform:uppercase}
.gv-fieldhead span:last-child{font-weight:650;color:#98845f;font-size:9px}
.gv-amts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.gv-amt{background:#100f0c;border:1px solid #4c3c23;border-radius:8px;padding:19px 6px;color:#f0e0bf;font-weight:900;font-size:22px;cursor:pointer;transition:border-color .2s,transform .2s}
.gv-amt:hover{border-color:var(--gold);transform:translateY(-2px)}
.gv-amt.on{border-color:var(--gold);background:#393018;color:var(--gold-hi);box-shadow:inset 0 0 0 1px #9b751f}
.gv-amt.other{font-size:12.5px;letter-spacing:1.2px}
@media(max-width:640px){.gv-amt{font-size:19px;padding:15px 4px}}
.gv-customrow{margin-top:16px}
.gv-customrow label{font-size:10px;font-weight:850;letter-spacing:1.4px;color:#b6a17c;text-transform:uppercase}
.gv-custom{display:flex;align-items:center;gap:9px;margin-top:8px;background:#0d0d0c;border:1px solid var(--gold-dim);border-radius:8px;padding:0 16px;max-width:420px}
.gv-custom span{color:var(--gold);font-size:21px}
.gv-custom input{flex:1;background:none;border:none;color:var(--bone);font-size:19px;padding:12px 0;outline:none;min-width:0}
.gv-summary{margin-top:20px;font-size:15.5px;color:var(--bone);border-top:1px solid var(--line);padding-top:20px}
.gv-summary b{color:var(--gold);font-family:Impact,'Arial Black',var(--sans);font-size:27px;letter-spacing:.4px;margin:0 4px}
.gv-submitrow{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:18px}
.gv-review{border:0;color:#211804;background:var(--gold);border-radius:7px;font-weight:950;font-size:12px;padding:17px 22px;letter-spacing:1px;display:inline-flex;gap:24px;align-items:center;cursor:pointer;text-transform:uppercase}
.gv-review:hover{background:var(--gold-hi)}
.gv-review span{font-size:20px}
.gv-review[disabled]{opacity:.45;cursor:not-allowed}
.gv-buildside{display:grid;gap:14px}
/* ---------- partner section / view ---------- */
.gv-partner{display:grid;grid-template-columns:.95fr 1.05fr;gap:56px;align-items:center}
@media(max-width:820px){.gv-partner{grid-template-columns:1fr;gap:30px}}
.gv-partart{position:relative;background:radial-gradient(circle at 43% 52%,#46351a,#16130f 55%,#100e0b);border:1px solid #755523;border-radius:14px;min-height:400px;display:grid;place-items:center;overflow:hidden}
.gv-partart:before{content:"";position:absolute;inset:13px;border:1px solid rgba(90,59,32,.45)}
.gv-record{height:320px;width:320px;max-width:78vw;aspect-ratio:1;border-radius:50%;border:9px solid #050505;background:repeating-radial-gradient(circle,#080808 0 6px,#24211b 7px 8px,#090909 9px 12px);display:grid;place-items:center;box-shadow:20px 22px 40px rgba(0,0,0,.75);transform:rotate(-13deg);position:relative}
.gv-record:before{content:"";position:absolute;inset:26px;border:1px solid #453a27;border-radius:50%}
.gv-record:after{content:"";position:absolute;inset:72px;border:3px solid #6d571a;border-radius:50%}
.gv-reclabel{border-radius:50%;background:#d5aa43;color:#231706;width:136px;height:136px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:8px solid #7c5b20;box-shadow:inset 0 0 0 5px #eec46d;position:relative;z-index:1}
.gv-reclabel span{font-family:Impact,'Arial Black',sans-serif;font-size:50px;line-height:1}
.gv-reclabel small{font-size:8.5px;letter-spacing:1.8px;text-align:center;line-height:1.5;font-weight:850}
.gv-sticker{background:#ba3221;border:2px dashed #efb69a;color:#fff2de;font-family:Impact,'Arial Black',sans-serif;font-size:24px;line-height:.98;padding:14px 17px;position:absolute;top:26px;right:12px;transform:rotate(13deg);box-shadow:6px 8px 15px rgba(0,0,0,.55);z-index:2}
.gv-lowerart{position:absolute;bottom:16px;left:20px;color:#d3ba73;font-size:9px;letter-spacing:2px;font-weight:900}
.gv-partcopy p{color:#c5b79b;font-size:14.5px;line-height:1.72;max-width:520px}
.gv-offer{padding:20px 22px;margin:20px 0;border-left:4px solid var(--gold);background:#211a10;max-width:450px}
.gv-offer>span{font-size:10px;letter-spacing:1.6px;color:var(--gold);font-weight:900}
.gv-offer>div{display:flex;align-items:baseline;gap:14px;margin:8px 0}
.gv-price{font-family:Impact,'Arial Black',var(--sans);font-size:56px;color:var(--bone);line-height:1}
.gv-price span{font-size:15px;color:var(--mute);font-family:var(--sans)}
.gv-offer p{margin:0;color:#b4a285;font-size:12px}
.gv-fine{font-size:11px;color:#9a8f7e;margin-top:18px;line-height:1.6}
/* ---------- mission ---------- */
.gv-mission{background:#100e0b;border-top:1px solid #2b2419;border-bottom:1px solid #36291b;border-radius:16px;padding:34px 26px 28px;margin-top:64px}
@media(max-width:640px){.gv-mission{padding:26px 16px 20px}}
.gv-mgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
@media(max-width:820px){.gv-mgrid{grid-template-columns:1fr}}
.gv-mcard{background:#14120f;border:1px solid #413322;border-radius:13px;overflow:hidden}
.gv-mimg{height:170px;position:relative;overflow:hidden;background:linear-gradient(135deg,#604017,#1f1a13 50%,#251f11)}
.gv-mimg.outreach{background:linear-gradient(135deg,#501b13,#26130e 55%,#100f0e)}
.gv-mimg.community{background:linear-gradient(135deg,#39341b,#19190e 50%,#35351b)}
.gv-mimg:before{content:"";position:absolute;inset:0;opacity:.42;background:linear-gradient(135deg,transparent 35%,#cc8837 35% 36%,transparent 36% 65%,#cc8837 65% 66%,transparent 66%),repeating-linear-gradient(90deg,#0000 0 24px,rgba(245,206,125,.06) 25px 27px),radial-gradient(circle at 73% 60%,#f9df8e,transparent 45%)}
.gv-mcount{font-size:9px;letter-spacing:2px;font-weight:900;color:#f7e6bc;position:absolute;top:16px;left:16px;z-index:1}
.gv-mill{position:absolute;bottom:18px;left:18px;display:flex;align-items:flex-end;gap:13px;z-index:1}
.gv-mill span{font-size:82px;color:rgba(237,195,94,.74);line-height:.8;text-shadow:0 0 34px rgba(255,204,106,.27)}
.gv-mill b{font-family:Impact,'Arial Black',sans-serif;font-size:26px;color:#fff0d4;line-height:.98;text-transform:uppercase}
.gv-mbody{padding:22px}
.gv-mbody>span{font-size:10px;letter-spacing:1.4px;color:var(--gold);font-weight:900;text-transform:uppercase}
.gv-mbody h3{font-family:Impact,'Arial Black',sans-serif;font-size:31px;line-height:1.04;margin:12px 0 10px;color:var(--bone);text-transform:uppercase}
.gv-mbody p{font-size:13px;color:#bcaf91;line-height:1.68}
.gv-mlearn{border:0;border-top:1px solid var(--line);width:100%;background:transparent;text-align:left;color:var(--gold);padding:13px 0 0;margin-top:14px;letter-spacing:1px;font-weight:900;font-size:10px;cursor:pointer;text-transform:uppercase}
.gv-mlearn:hover{text-decoration:underline}
.gv-mnote{border-top:1px dashed #5d4a1f;margin-top:14px;padding-top:12px;font-size:12.5px;color:#cbbd9d;line-height:1.65}
.gv-transp{display:flex;gap:16px;align-items:flex-start;background:#1c190f;border:1px solid #5d4a1f;border-radius:10px;margin-top:22px;padding:17px 20px}
.gv-transp .gv-tico{font-size:32px;color:var(--gold);flex:0 0 36px;line-height:1}
.gv-transp b{font-size:10px;letter-spacing:1.4px;color:#f5d47b}
.gv-transp p{margin:5px 0 0;font-size:12px;line-height:1.65;color:#bdb094}
/* ---------- FAQ + promise ---------- */
.gv-faqgrid{display:grid;grid-template-columns:1.4fr .7fr;gap:26px;align-items:start}
@media(max-width:820px){.gv-faqgrid{grid-template-columns:1fr}}
.gv-faqlist{border-top:1px solid #624b25}
.gv-faqlist details{border-bottom:1px solid #49391f;padding:0 6px}
.gv-faqlist summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 4px;font-size:15.5px;font-weight:850;cursor:pointer;color:var(--bone)}
.gv-faqlist summary::-webkit-details-marker{display:none}
.gv-faqlist summary span{border:1px solid #584322;border-radius:50%;color:var(--gold);width:26px;height:26px;display:grid;place-items:center;flex:none;font-size:15px}
.gv-faqlist details[open ] summary span{transform:rotate(45deg)}
.gv-faqlist details p{color:#b9ad97;line-height:1.72;font-size:13px;margin:0 40px 20px 4px}
.gv-promise{background:#201b11;border:1px solid #715a2b;padding:26px}
.gv-promise>span{font-size:10px;letter-spacing:2px;font-weight:900;color:var(--gold)}
.gv-promise h3{font-family:Impact,'Arial Black',sans-serif;font-size:44px;line-height:1;margin:20px 0 12px;color:var(--bone);text-transform:uppercase}
.gv-promise h3 em{font-style:normal;color:var(--gold)}
.gv-promise p{font-size:13px;line-height:1.72;color:#c1b295}
.gv-promise button{background:none;border:none;font-size:10px;color:var(--gold);letter-spacing:1px;font-weight:900;margin-top:12px;padding:0;cursor:pointer;text-transform:uppercase}
/* ---------- error + gate (v1 honesty surfaces, package-skinned) ---------- */
.gv-err{border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:22px 24px;margin-top:20px}
.gv-err h2{font-size:22px;margin-bottom:8px}
.gv-err p{color:var(--mute);line-height:1.6;font-size:14.5px;margin-top:6px}
.gv-err p b{color:var(--bone)}
.gv-detail{font-size:12px;color:var(--mute);margin-top:10px}
.gv-gate{border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:26px 24px;margin-top:18px;text-align:center}
.gv-gate h2{margin-bottom:8px}
.gv-gate p{color:var(--mute);line-height:1.6;font-size:14.5px;max-width:520px;margin:8px auto}
</style>`;

function mount(root, html) { S.mountSeq += 1; root.innerHTML = STYLE + STYLE2 + html; if (window.FaithFilm) window.FaithFilm.wire(root); return S.mountSeq; }
function header(kicker, title, lede) {
  return `<p class="kicker">${kicker}</p><h1>${title}</h1><p class="lede">${lede}</p>`;
}
/* §3.6's frontend-visible truth. checkoutLive() is the hub's ONE
   live-state source: giving and Partner membership revive with the
   same key, so one state covers both doors. statusLineHTML() renders
   the state as the package's "CHECKOUT NOT LIVE YET" strip, and every
   state-dependent line on the surface (the Give Once under-button
   note, the Partner note) reads the same predicate — so the day the
   live key lands and checkout is verified live, flipping this one
   value flips the strip and the notes together, and the original
   live-state lines become true and stand. Visitor words only. */
function checkoutLive() { return false; }
function statusLineHTML() {
  if (checkoutLive()) return '';
  return `<div class="gv-status" data-testid="give-status"><span class="gv-dot">●</span><b>CHECKOUT NOT LIVE YET.</b> Giving and monthly partnership open together, and we're completing the final step to switch online checkout on — so gifts can't be completed online just yet. Thank you for your heart for this mission, and please check back soon.</div>`;
}
/* The house honesty line (M4 cure, 2026-11-20): the LLC / not-a-501(c)(3)
   fact used to sit only inside the collapsed FAQ below and the home
   footer. It now stands visible on the hub's main views — the landing,
   Give Once and Monthly Partner — in the home footer's own words. */
function honestyLineHTML() {
  return `<p class="gv-honesty" data-testid="give-honesty">16:3 Faith — a for-profit LLC, not a 501(c)(3) nonprofit. Giving is voluntary and is not tax-deductible.</p>`;
}
/* The Give Once under-button note, state-aware through checkoutLive()
   (copy-alignment cure, 2026-11-19): while checkout is not live the
   note must not imply a finishable checkout exists — the gift
   completes on the secure checkout page ONCE ONLINE GIVING OPENS.
   The busy line renders only during a genuine in-flight attempt. */
function giveNoteText() {
  if (S.busy) return 'Opening the secure checkout…';
  return checkoutLive()
    ? 'You\'ll finish on the secure checkout page — your card details never touch this site.'
    : 'Your gift completes on the secure checkout page once online giving opens — your card details never touch this site.';
}
/* The signed-in Partner note, same single source: the closing clause
   ("nothing is charged until you complete it there") is a true
   conditional and stands verbatim in both states; only the lead is
   framed by the state — while not live it reads as what happens ONCE
   PARTNER CHECKOUT OPENS (the FAQ's own construction), never as a
   flow that exists today. */
function partnerNoteText() {
  const tail = 'The amount and the monthly plan are set by the checkout itself; nothing is charged until you complete it there.';
  return checkoutLive()
    ? `One checkout, then ${PARTNER_MONTHLY} a month — you can manage or cancel it any time from your billing page. ${tail}`
    : `Once Partner checkout opens, it&rsquo;s one checkout, then ${PARTNER_MONTHLY} a month — you can manage or cancel it any time from your billing page. ${tail}`;
}
function errorHTML(door) {
  const e = S.error;
  if (!e || e.door !== door) return '';
  const what = door === 'partner' ? 'Partner sign-up' : 'checkout';
  const why = e.status === 401
    ? 'Partner checkout needs a verified sign-in, and this session didn\'t verify — sign in again, then come back to this door.'
    : 'Online giving is still being switched on (see the note at the top of this hub), so please try again soon.';
  return `<div class="gv-err" data-testid="give-error" role="alert">
    <h2>That didn't go <span class="g">through.</span></h2>
    <p>We tried to open ${what} and it didn't complete — <b>nothing was charged</b>, and no ${door === 'partner' ? 'membership was started' : 'gift was taken'}. ${why}</p>
    ${e.serverError ? `<p class="gv-detail">The giving service said: &ldquo;${esc(e.serverError)}&rdquo;</p>` : e.status === 0 ? `<p class="gv-detail">The giving service couldn't be reached from this connection.</p>` : ''}
  </div>`;
}
function scrollToEl(el) { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

/* ---------------- package side cards (real content only) ------------------ */
function heartCardHTML() {
  return `<div class="gv-sidecard dark"><span class="gv-sideline">The Heart / 16:3</span><p class="gv-sidequote">&ldquo;Faith doesn&rsquo;t stop at <em>Amen.</em>&rdquo;</p><p>We believe a church can meet people in the street, at the dinner table, and on the hardest night of their lives.</p><div class="gv-cardend">ONE FAMILY. OPEN HANDS. <span>&nearr;</span></div></div>`;
}
function scriptureCardHTML() {
  return `<div class="gv-sidecard scripture"><span class="gv-sideline">In the Word / 001</span><blockquote>&ldquo;My little children, let us not love in word, neither in tongue; but in deed and in truth.&rdquo;</blockquote><strong>1 JOHN 3:18 <b>KJV</b></strong></div>`;
}
function trustCardHTML() {
  return `<div class="gv-sidecard trust"><span class="gv-sideline">What We Won&rsquo;t Do</span><ul><li>Pressure you into giving.</li><li>Claim impact numbers we can&rsquo;t prove.</li><li>Suggest a payment has gone through when it hasn&rsquo;t.</li><li>Promise tax benefits without verified status.</li></ul></div>`;
}

/* ---------------- mission (VISION framing — goals, not funded claims) ----- */
const MISSIONS = [
  { key: 'shelter', cls: '', glyph: '⌂', count: '01 / Safe Spaces', tag: 'Shelter &amp; Support', title: 'A Place<br>To Land.', body: 'We want to help create safer spaces and practical support for people navigating difficult chapters.', note: 'Shelter and safe spaces are an intended area of the 16:3 Faith mission. Actual programs, partners, and budgets must be verified before the site claims operating results.' },
  { key: 'outreach', cls: ' outreach', glyph: '♥', count: '02 / Street Love', tag: 'Neighborhood Outreach', title: 'Meet People<br>Where They Are.', body: 'Meals, encouragement, dignity and human connection: faith that goes beyond a building.', note: 'Street outreach is about human dignity and practical care. This page describes the mission direction; it does not claim a number of meals served or people housed.' },
  { key: 'house', cls: ' community', glyph: '✝', count: '03 / Open Doors', tag: 'The Community', title: 'Keep The<br>Doors Open.', body: 'Make room for prayer, music, stories, fellowship and people who need a community without a price tag.', note: 'The community is built around worship, prayer, music, fellowship and belonging. People can participate without making a donation.' },
];
function missionHTML() {
  return `<section class="gv-mission" id="gv-mission">
    <p class="gv-eyebrow">02 / The Reason</p>
    <div class="gv-sechead"><div><h2>We&rsquo;re Building<br><em>Beyond Sunday.</em></h2><p>Three commitments. One heartbeat. These are the areas we&rsquo;re working to support as the mission grows.</p></div></div>
    <div class="gv-mgrid">
      ${MISSIONS.map((m) => `<article class="gv-mcard"><div class="gv-mimg${m.cls}"><span class="gv-mcount">${m.count}</span><div class="gv-mill"><span>${m.glyph}</span><b>${m.title.replace(/<br>/g, ' ')}</b></div></div><div class="gv-mbody"><span>${m.tag}</span><h3>${m.title}</h3><p>${m.body}</p><button type="button" class="gv-mlearn" data-mission="${m.key}" aria-expanded="false">Learn the Vision &nearr;</button><p class="gv-mnote" data-mnote="${m.key}" hidden>${m.note}</p></div></article>`).join('')}
    </div>
    <div class="gv-transp"><span class="gv-tico">✳</span><div><b>THE REAL-WORLD STANDARD</b><p>These are mission goals, not claims that shelters or specific programs are already funded. Before live giving launches, 16:3 Faith should publish the legal recipient, donation terms, tax status, program updates and meaningful financial reporting.</p></div></div>
  </section>`;
}

/* ---------------- FAQ (the CURRENT hub's honest answers) ------------------- */
function faqHTML() {
  return `<section class="gv-sec" id="gv-faq">
    <p class="gv-eyebrow">04 / Before You Give</p>
    <div class="gv-sechead"><div><h2>The Questions<br><em>Matter, Too.</em></h2><p>No fine-print games. Here&rsquo;s what this page can — and cannot — promise.</p></div></div>
    <div class="gv-faqgrid"><div class="gv-faqlist">
      <details><summary>Can I give now? <span>+</span></summary><p>Not yet. Online checkout is still being switched on, so gifts can&rsquo;t be completed online just yet — no donation or recurring charge is created when you use this page. The note at the top of this hub is the standing state of both doors.</p></details>
      <details><summary>Do I have to give to join 16:3 Faith? <span>+</span></summary><p>No. Prayer, fellowship, community participation, and belonging are not conditional on contributing financially. Joining is free, and giving is always a choice, never a price of family.</p></details>
      <details><summary>Is my contribution tax-deductible? <span>+</span></summary><p>No — 16:3 Faith is an LLC, not a 501(c)(3) nonprofit, so gifts here are not tax-deductible charitable contributions. Please don&rsquo;t give expecting a deduction; if deductibility matters for your giving, talk with your own tax advisor.</p></details>
      <details><summary>Can I change or stop a monthly gift? <span>+</span></summary><p>Once Partner checkout opens, yes — you can manage or cancel it any time from your billing page. The amount and the monthly plan are set by the checkout itself, and nothing is charged until you complete it there.</p></details>
      <details><summary>How will gifts be used and reported? <span>+</span></summary><p>Every gift supports the 16:3 Faith mission — keeping this community free, and building toward the shelter and outreach work described above. Those areas are the vision, stated as goals; we don&rsquo;t publish impact numbers we can&rsquo;t prove.</p></details>
    </div>
    <aside class="gv-promise"><span>THE HOUSE PROMISE</span><h3>Open<br>Books.<br><em>Open Hands.</em></h3><p>Generosity deserves accountability. The mission doesn&rsquo;t need hype; it needs honesty, steady hands and people willing to care.</p><button type="button" data-act="to-offering">Back to the Offering &nearr;</button></aside></div>
  </section>`;
}

/* ---------------- Doors (hub landing) --------------------------------------- */
function showDoors(root) {
  S.view = 'doors'; S.error = null;
  mount(root, `
    ${window.FaithFilm ? window.FaithFilm.slotHtml({ poster: 'assets/img/give/give-header.webp', title: 'Open hands. Open doors.', note: 'Give film · in production' }) : ''}
    <div class="gv-topline"><span><b>16:3</b> Faith / The Giving Sessions <i>///</i> Vol. 0163</span><span>Church is what we build together <i>✦</i> Sow it forward</span></div>
    <section class="gv-hero reveal">
      <div>
        <p class="gv-eyebrow"><span class="gv-star">✦</span>The Giving Sessions <span class="gv-faint">/ Side A</span></p>
        <h2 class="gv-h1">Faith<br>In <span>Motion.</span></h2>
        <p class="gv-lede">We don&rsquo;t just talk about love. We put it to work. Help us build the kind of church that shows up for people — even when nobody&rsquo;s watching.</p>
        <div class="gv-herobtns"><button type="button" class="gv-goldbtn" data-act="to-offering">Sow Into the Mission <span>&nearr;</span></button><button type="button" class="gv-underlink" data-act="to-mission">See the Mission <span>&rarr;</span></button></div>
        <p class="gv-herfoot"><i></i>REAL PEOPLE. REAL NEEDS. A HOUSE WITH OPEN DOORS.</p>
      </div>
      <div class="gv-artwrap"><img src="assets/img/give/give-header.webp" alt="Open hands giving and receiving in warm golden light over a harvest table"><div class="gv-stamp">16:3 / VOL. 001<br>LOVE IN ACTION</div><div class="gv-scratch">GIVE / LIVE THE WORD</div></div>
    </section>
    <div class="gv-tape"><span>Give With Purpose</span><strong>✦</strong><span>Love Is the Whole Point</span><strong>✦</strong><span>No One Left at the Door</span></div>
    ${statusLineHTML()}
    ${honestyLineHTML()}
    <section class="gv-sec reveal" id="gv-offering">
      <p class="gv-eyebrow">01 / The Offering</p>
      <div class="gv-sechead"><div><h2>Make Room<br><em>For More.</em></h2><p>Every gift is a decision to show up. Choose what makes sense for you. Nobody has to give to belong here.</p></div><span class="gv-stamp2">THE GIVING<br>SESSION <b>01/03</b></span></div>
      <div class="gv-doors">
        <button class="gv-door" data-door="once" type="button"><div class="gv-art">♥</div><b>Give Once</b><span>A one-time offering — you choose the amount, from $1 to $1,000.</span><span class="gv-chip ghost">Open to everyone — no account needed</span></button>
        <button class="gv-door" data-door="partner" type="button"><div class="gv-art">✚</div><b>Monthly Partner</b><span>${PARTNER_MONTHLY} a month, every month — steady partnership in the mission.</span><span class="gv-chip">Members — sign-in required</span></button>
      </div>
      <p class="gv-note">Both doors run on the same secure checkout, and both open together — the standing note above is the honest state of both until checkout is switched on.</p>
      <div class="gv-side3">${heartCardHTML()}${scriptureCardHTML()}${trustCardHTML()}</div>
    </section>
    <section class="ai-shelf" aria-label="Give AI Recommendations">
      <div class="ai-shelf-head"><span class="ai-shelf-title">✦ FaithGuide · Give AI Recommendations</span><span class="ai-tag">Powered by AI</span></div>
      <p>Two doors, honestly stated: a <b>one-time gift of $1 to $1,000</b> — open to everyone, no account needed — or <b>partnership at ${PARTNER_MONTHLY} a month</b> for members. New here? A one-time gift is the simple first step. This house is home? Partnership is the steady one. Online checkout opens soon (the note at the top is the true state), and nobody has to give to belong here.</p>
    </section>
    ${missionHTML()}
    <section class="gv-sec" id="gv-partner-sec">
      <div class="gv-partner">
        <div class="gv-partart"><div class="gv-record"><div class="gv-reclabel"><span>16:3</span><small>THE FAMILY FUND<br>VOL 0163</small></div></div><div class="gv-sticker">A LITTLE<br>LOVE,<br>ON REPEAT.</div><span class="gv-lowerart">THE MONTHLY PARTNERSHIP / SIDE B</span></div>
        <div class="gv-partcopy">
          <p class="gv-eyebrow">03 / The Monthly Partners</p>
          <div class="gv-sechead"><div><h2>Keep The<br><em>Record Spinning.</em></h2></div></div>
          <p>It doesn&rsquo;t take a massive gift to be part of something meaningful. Our $16.30 monthly partner idea is about consistency, community, and caring for people.</p>
          <div class="gv-offer"><span>THE 16:3 PARTNERSHIP</span><div><strong class="gv-price" style="font-size:44px">${PARTNER_MONTHLY}</strong><small style="color:#c0a975;font-size:10px;letter-spacing:2px;font-weight:800">PER MONTH</small></div><p>Optional giving. No special access to love, prayer, or belonging.</p></div>
          <button type="button" class="gv-goldbtn" data-goto="partner">Choose Monthly Partner <span>&nearr;</span></button>
          <p class="gv-fine">Membership and worship are not contingent on donations. Recurring billing opens with online checkout — the standing note at the top of this hub is its current state.</p>
        </div>
      </div>
    </section>
    ${faqHTML()}`);
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.door === 'once') showOnce(root); else showPartner(root);
  }));
  root.querySelector('[data-goto="partner"]').addEventListener('click', () => showPartner(root));
  root.querySelectorAll('[data-act="to-offering"]').forEach((b) => b.addEventListener('click', () => scrollToEl(root.querySelector('#gv-offering'))));
  root.querySelector('[data-act="to-mission"]').addEventListener('click', () => scrollToEl(root.querySelector('#gv-mission')));
  root.querySelectorAll('[data-mission]').forEach((b) => b.addEventListener('click', () => {
    const note = root.querySelector(`[data-mnote="${b.dataset.mission}"]`);
    if (!note) return;
    note.hidden = !note.hidden;
    b.setAttribute('aria-expanded', String(!note.hidden));
  }));
  publishDebug();
}

/* ---------------- builder tabs (the package's mode toggle) ----------------- */
function tabsHTML(active) {
  return `<div class="gv-tabs" role="group" aria-label="Gift frequency">
    <button type="button" data-mode="once" class="${active === 'once' ? 'active' : ''}" aria-pressed="${active === 'once'}"><span>01</span> Give Once</button>
    <button type="button" data-mode="partner" class="${active === 'partner' ? 'active' : ''}" aria-pressed="${active === 'partner'}"><span>02</span> Monthly Partner</button>
  </div>`;
}
function wireTabs(root) {
  root.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.mode === 'once' && S.view !== 'once') showOnce(root);
    if (b.dataset.mode === 'partner' && S.view !== 'partner') showPartner(root);
  }));
}

/* ---------------- Give Once (the package builder, real contract) ----------- */
function showOnce(root) {
  S.view = 'once';
  const cents = amountCents();
  const valid = amountValid(cents);
  mount(root, `
    <div class="gv-bar"><button class="gv-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Give · Give Once', 'Give <span class="g">once.</span>', 'Choose an amount, or write your own. One-time gift — no account needed, no subscription.')}
    ${statusLineHTML()}
    <div class="gv-build">
      <div class="gv-card">
        <div class="gv-cardtop"><div><span class="gv-tiny">Your Gift / Your Choice</span><h3>Let&rsquo;s Build<br><em>Something Real.</em></h3></div><div class="gv-circle">✦</div></div>
        ${tabsHTML('once')}
        <div class="gv-fieldhead"><span>Choose an Amount</span><span>USD · $1 to $1,000</span></div>
        <div class="gv-amts" role="group" aria-label="Choose an amount">
          ${PRESETS.map((v) => `<button type="button" class="gv-amt${S.custom.trim() === '' && S.preset === Number(v) ? ' on' : ''}" data-amt="${v}" aria-pressed="${S.custom.trim() === '' && S.preset === Number(v)}">${presetLabel(v)}</button>`).join('')}
          <button type="button" class="gv-amt other${S.custom.trim() !== '' || S.customActive ? ' on' : ''}" data-amt="custom" aria-pressed="${S.custom.trim() !== '' || S.customActive}">OTHER</button>
        </div>
        <div class="gv-customrow" data-role="custom-wrap" ${S.custom.trim() !== '' || S.customActive ? '' : 'hidden'}>
          <label for="gv-custom-input">Enter your amount (USD)</label>
          <div class="gv-custom"><span>$</span><input id="gv-custom-input" type="text" inputmode="decimal" autocomplete="off" placeholder="Enter amount" aria-label="Custom amount in dollars" data-role="custom" value="${esc(S.custom)}"></div>
        </div>
        <p class="gv-summary" data-testid="give-summary">${valid
          ? `Your gift: <b>${fmtUSD(cents)}</b> — one time.`
          : cents == null && S.custom.trim() !== ''
            ? 'That amount doesn\'t read as a number — gifts run from $1 to $1,000.'
            : 'Gifts run from $1 to $1,000 — choose or write an amount in that range.'}</p>
        <div class="gv-submitrow"><button class="gv-review" type="button" data-testid="give-submit" data-act="give" ${valid && !S.busy ? '' : 'disabled'}>${S.busy ? 'Opening checkout…' : valid ? `Give ${fmtUSD(cents)}` : 'Give'} <span>&nearr;</span></button></div>
        <p class="gv-note" data-role="give-note">${giveNoteText()}</p>
        ${honestyLineHTML()}
        ${errorHTML('once')}
      </div>
      <div class="gv-buildside">${scriptureCardHTML()}${trustCardHTML()}</div>
    </div>`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  wireTabs(root);
  root.querySelectorAll('[data-amt]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.amt === 'custom') {
      S.customActive = true;
      const wrap = root.querySelector('[data-role="custom-wrap"]');
      if (wrap) wrap.hidden = false;
      root.querySelectorAll('[data-amt]').forEach((x) => {
        const on = x.dataset.amt === 'custom';
        x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on));
      });
      const inp = root.querySelector('[data-role="custom"]');
      if (inp) inp.focus();
      publishDebug();
      return;
    }
    S.preset = Number(b.dataset.amt); S.custom = ''; S.customActive = false; S.error = null;
    showOnce(root);
  }));
  const input = root.querySelector('[data-role="custom"]');
  input.addEventListener('input', () => {
    S.custom = input.value.replace(/[^0-9.]/g, '');
    if (input.value !== S.custom) input.value = S.custom;
    S.error = null;
    /* Refresh only the summary + button (no full re-mount: the visitor is
       typing in this input). The payload moves with every keystroke. */
    const c = amountCents(); const v = amountValid(c);
    const sum = root.querySelector('[data-testid="give-summary"]');
    sum.innerHTML = v ? `Your gift: <b>${fmtUSD(c)}</b> — one time.`
      : S.custom.trim() !== '' && c == null ? 'That amount doesn\'t read as a number — gifts run from $1 to $1,000.'
      : 'Gifts run from $1 to $1,000 — choose or write an amount in that range.';
    const btn = root.querySelector('[data-testid="give-submit"]');
    btn.disabled = !v || S.busy;
    btn.innerHTML = v ? `Give ${fmtUSD(c)} <span>&nearr;</span>` : 'Give';
    root.querySelectorAll('[data-amt]').forEach((b) => {
      const on = b.dataset.amt === 'custom'
        ? S.custom.trim() !== '' || S.customActive
        : S.custom.trim() === '' && S.preset === Number(b.dataset.amt);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    });
    publishDebug();
  });
  const btn = root.querySelector('[data-act="give"]');
  if (btn) btn.addEventListener('click', async () => {
    const payload = offeringPayload();
    if (!amountValid(payload && payload.amountCents)) return;
    S.busy = true; S.error = null;
    showOnce(root); // re-render in the busy state (genuine network wait)
    const r = await postCheckout('once', '/api/community/offering/checkout', payload);
    S.busy = false;
    if (r.ok && r.json && r.json.url) {
      /* The ONLY success path: the API returned a checkout URL and the
         browser leaves for it. Nothing is claimed before this line. */
      window.location.assign(r.json.url);
      return;
    }
    S.error = { door: 'once', status: r.status, serverError: (r.json && r.json.error) || '' };
    if (S.view === 'once') showOnce(root);
    publishDebug();
  });
  publishDebug();
}

/* ---------------- Monthly Partner ------------------------------------------- */
function showPartner(root) {
  S.view = 'partner';
  const signed = isSignedIn();
  mount(root, `
    <div class="gv-bar"><button class="gv-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Give · Monthly Partner', 'Partner <span class="g">monthly.</span>', 'Steady, monthly partnership in the 16:3 Faith mission — it keeps the community ad-free and algorithm-free, with a percentage going to feed the homeless.')}
    ${statusLineHTML()}
    <div class="gv-build">
      <div class="gv-card">
        <div class="gv-cardtop"><div><span class="gv-tiny">The Monthly Partnership / Side B</span><h3>Keep The<br><em>Record Spinning.</em></h3></div><div class="gv-circle">✦</div></div>
        ${tabsHTML('partner')}
        <div class="gv-offer" style="margin-top:0"><span>THE 16:3 PARTNERSHIP</span><div><strong class="gv-price" data-testid="partner-price">${PARTNER_MONTHLY}<span> / month</span></strong></div><p>Optional giving. No special access to love, prayer, or belonging.</p></div>
        ${honestyLineHTML()}
        ${signed ? `
          <p class="gv-note">${partnerNoteText()}</p>
          <div class="gv-submitrow"><button class="gv-review" type="button" data-testid="partner-submit" data-act="partner" ${S.busy ? 'disabled' : ''}>${S.busy ? 'Opening checkout…' : `Become a Partner — ${PARTNER_MONTHLY}/month`} <span>&nearr;</span></button></div>
          ${errorHTML('partner')}`
        : `
          <div class="gv-gate" data-testid="partner-gate">
            <span class="gv-chip">Members only</span>
            <h2 style="margin-top:14px">Partnership is tied to <span class="g">your account</span></h2>
            <p>A monthly partnership belongs to a member — so <b style="color:var(--bone)">sign-in comes first</b>, before any checkout opens. That's stated here, up front, not after a click that goes nowhere.</p>
            <p>Sign in if you're already a member. New here? Join free — it takes a minute — then come back to this door.</p>
            <div class="gv-bar" style="justify-content:center">
              <button class="gv-btn goldb" data-act="signin" type="button">Sign in to partner</button>
              <button class="gv-btn" data-act="join" type="button">Join free</button>
              <button class="gv-btn" data-act="once" type="button">Give once instead</button>
            </div>
            <p class="gv-note">Nothing is recorded and nothing is charged until you complete checkout as a signed-in member.</p>
          </div>`}
      </div>
      <div class="gv-buildside">${heartCardHTML()}${trustCardHTML()}</div>
    </div>`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  wireTabs(root);
  if (!signed) {
    root.querySelector('[data-act="signin"]').addEventListener('click', () => document.getElementById('btn-signin')?.click());
    root.querySelector('[data-act="join"]').addEventListener('click', () => document.getElementById('btn-join')?.click());
    root.querySelector('[data-act="once"]').addEventListener('click', () => showOnce(root));
  } else {
    root.querySelector('[data-act="partner"]').addEventListener('click', async () => {
      S.busy = true; S.error = null;
      showPartner(root);
      /* NO body — the evidenced client contract; mode + price are the
         server's (subscription, partner_monthly_1630 = $16.30/mo). */
      const r = await postCheckout('partner', '/api/community/membership/checkout', null);
      S.busy = false;
      if (r.ok && r.json && r.json.url) {
        window.location.assign(r.json.url);
        return;
      }
      if (r.status === 401) {
        /* Session didn't verify server-side (the Clerk signal and the API
           disagree): the error panel states the sign-in reason — nothing
           was started, nothing simulated. */
        S.error = { door: 'partner', status: 401, serverError: (r.json && r.json.error) || 'Please sign in.' };
        if (S.view === 'partner') showPartner(root);
        publishDebug();
        return;
      }
      S.error = { door: 'partner', status: r.status, serverError: (r.json && r.json.error) || '' };
      if (S.view === 'partner') showPartner(root);
      publishDebug();
    });
  }
  publishDebug();
}

export function render(root) {
  S = freshState();
  showDoors(root);
}
