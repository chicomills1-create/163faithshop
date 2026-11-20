/* GIVE hub (SPEC §3.6) — two doors per the HUB BREAKDOWN LAW:
   GIVE ONCE · MONTHLY PARTNER. Doors first, never a flat page.

   ENDPOINT CONTRACT — every field evidenced, nothing guessed (full citations
   in records/HUB-GIVE-RECORD.md; census-2026-11-15 ledger item #47):

   - GIVE ONCE — POST {API}/api/community/offering/checkout, open to everyone
     (signed-in or guest). Body is EXACTLY { amountCents } — the server schema
     is z.object({ amountCents: int, min 100, max 100000 }) ($1–$1,000) and
     the production client (useStartOffering) sends that one field and no
     other. No name/email/note field exists in the contract, so none is sent.
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
   or implies it does — one visitor-worded status line says so, checkout
   failures land on a composed honest message (never the old face's bare
   red banner, never a fake success), and success is claimed only by the
   browser actually leaving for the checkout URL the API returned.
   Giving and Partner membership revive with the same key (they share one
   Stripe client), so the one status line covers both doors.

   Auth signal: window.Clerk.user only (the shell's F-CLERK leg mounts the
   real Clerk instance later) — the same signal PRAY uses. */

const API = 'https://faith-hub-api-railway-production.up.railway.app';
const PARTNER_MONTHLY = '$16.30';
const PRESETS = [5, 10, 25, 50, 100]; // dollars — all inside the evidenced $1–$1,000 schema range

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
  return S.preset != null ? S.preset * 100 : null;
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
    res = await fetch(url, opts);
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
.gv-status{border:1px solid var(--gold-dim);border-radius:14px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:14px 18px;margin-top:20px;font-size:14px;line-height:1.6;color:var(--mute)}
.gv-status b{color:var(--gold-hi)}
.gv-doors{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:22px}
.gv-door{border:1px solid var(--line);border-radius:14px;background:var(--coal);padding:18px;min-height:150px;text-align:left;color:var(--bone);width:100%}
.gv-door:hover{border-color:var(--gold-dim)}
.gv-door .gv-art{height:52px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.25),rgba(212,175,55,.04));margin-bottom:12px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--gold)}
.gv-door b{font-size:17px;display:block;font-family:var(--serif)}
.gv-door span{font-size:12.5px;color:var(--mute);line-height:1.5;display:block;margin-top:4px}
.gv-chip{display:inline-block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#141005;background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));border-radius:999px;padding:3px 9px;font-weight:700;margin-top:10px}
.gv-chip.ghost{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi)}
.gv-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:16px 0}
.gv-btn{background:none;border:1px solid var(--gold-dim);color:var(--gold-hi);border-radius:999px;padding:10px 18px;font-size:12.5px;letter-spacing:.08em}
.gv-btn.goldb{background:linear-gradient(120deg,var(--gold-dim),var(--gold) 45%,var(--gold-hi));color:#141005;font-weight:700;border:none}
.gv-btn[disabled]{opacity:.45;cursor:not-allowed}
.gv-note{font-size:12.5px;color:var(--mute);margin-top:12px;line-height:1.55}
.gv-amts{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.gv-amt{border:1px solid var(--line);border-radius:14px;background:var(--coal);color:var(--bone);padding:16px 20px;font-size:17px;font-family:var(--serif);min-width:92px}
.gv-amt:hover{border-color:var(--gold-dim)}
.gv-amt.on{border-color:var(--gold);background:#1d1807;color:var(--gold-hi)}
.gv-custom{display:flex;align-items:center;gap:8px;margin-top:14px;max-width:340px;background:#000;border:1px solid var(--gold-dim);border-radius:999px;padding:4px 8px 4px 18px}
.gv-custom span{color:var(--gold);font-size:16px}
.gv-custom input{flex:1;background:none;border:none;color:var(--bone);font-size:16px;padding:10px 4px;outline:none;min-width:0}
.gv-summary{margin-top:18px;font-size:16px;color:var(--bone)}
.gv-summary b{color:var(--gold-hi);font-family:var(--serif);font-size:20px}
.gv-err{border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:22px 24px;margin-top:20px}
.gv-err h2{font-size:22px;margin-bottom:8px}
.gv-err p{color:var(--mute);line-height:1.6;font-size:14.5px;margin-top:6px}
.gv-err p b{color:var(--bone)}
.gv-detail{font-size:12px;color:var(--mute);margin-top:10px}
.gv-gate{border:1px solid var(--gold-dim);border-radius:16px;background:linear-gradient(160deg,#171204,#0a0a0a 65%);padding:26px 24px;margin-top:18px;text-align:center}
.gv-gate h2{margin-bottom:8px}
.gv-gate p{color:var(--mute);line-height:1.6;font-size:14.5px;max-width:520px;margin:8px auto}
.gv-price{font-family:var(--serif);font-size:44px;color:var(--gold-hi);margin-top:14px}
.gv-price span{font-size:16px;color:var(--mute)}
</style>`;

function mount(root, html) { S.mountSeq += 1; root.innerHTML = STYLE + html; return S.mountSeq; }
function header(kicker, title, lede) {
  return `<p class="kicker">${kicker}</p><h1>${title}</h1><p class="lede">${lede}</p>`;
}
/* §3.6's frontend-visible truth, one line, visitor words only: giving and
   Partner membership revive with the same key, so one status covers both. */
function statusLineHTML() {
  return `<div class="gv-status" data-testid="give-status"><b>Where online giving stands:</b> giving and monthly partnership open together, and we're completing the final step to switch online checkout on — so gifts can't be completed online just yet. Thank you for your heart for this mission, and please check back soon.</div>`;
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

/* ---------------- Doors ----------------------------------------------------- */
function showDoors(root) {
  S.view = 'doors'; S.error = null;
  mount(root, `
    ${header('Give', 'Sow it <span class="g">forward.</span>', 'Two doors: a one-time offering, or a monthly partnership that keeps this house standing. Every gift supports the 16:3 Faith mission — women\'s shelters, homeless outreach, and keeping this community free.')}
    ${statusLineHTML()}
    <div class="gv-doors">
      <button class="gv-door" data-door="once" type="button"><div class="gv-art">♥</div><b>Give Once</b><span>A one-time offering — you choose the amount, from $1 to $1,000.</span><span class="gv-chip ghost">Open to everyone — no account needed</span></button>
      <button class="gv-door" data-door="partner" type="button"><div class="gv-art">✚</div><b>Monthly Partner</b><span>${PARTNER_MONTHLY} a month, every month — steady partnership in the mission.</span><span class="gv-chip">Members — sign-in required</span></button>
    </div>
    <p class="gv-note">Both doors run on the same secure checkout, and both open together — the standing note above is the honest state of both until checkout is switched on.</p>`);
  root.querySelectorAll('[data-door]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.door === 'once') showOnce(root); else showPartner(root);
  }));
  publishDebug();
}

/* ---------------- Give Once ------------------------------------------------- */
function showOnce(root) {
  S.view = 'once';
  const cents = amountCents();
  const valid = amountValid(cents);
  mount(root, `
    <div class="gv-bar"><button class="gv-btn" data-act="doors" type="button">← All doors</button></div>
    ${header('Give · Give Once', 'Give <span class="g">once.</span>', 'Choose an amount, or write your own. One-time gift — no account needed, no subscription.')}
    ${statusLineHTML()}
    <div class="gv-amts" role="group" aria-label="Choose an amount">
      ${PRESETS.map((d) => `<button type="button" class="gv-amt${S.custom.trim() === '' && S.preset === d ? ' on' : ''}" data-amt="${d}" aria-pressed="${S.custom.trim() === '' && S.preset === d}">$${d}</button>`).join('')}
    </div>
    <div class="gv-custom"><span>$</span><input type="text" inputmode="decimal" autocomplete="off" placeholder="Your amount" aria-label="Custom amount in dollars" data-role="custom" value="${esc(S.custom)}"></div>
    <p class="gv-summary" data-testid="give-summary">${valid
      ? `Your gift: <b>${fmtUSD(cents)}</b> — one time.`
      : cents == null && S.custom.trim() !== ''
        ? 'That amount doesn\'t read as a number — gifts run from $1 to $1,000.'
        : 'Gifts run from $1 to $1,000 — choose or write an amount in that range.'}</p>
    <div class="gv-bar"><button class="gv-btn goldb" type="button" data-testid="give-submit" data-act="give" ${valid && !S.busy ? '' : 'disabled'}>${S.busy ? 'Opening checkout…' : valid ? `Give ${fmtUSD(cents)}` : 'Give'}</button></div>
    <p class="gv-note" data-role="give-note">${S.busy ? 'Opening the secure checkout…' : 'You\'ll finish on the secure checkout page — your card details never touch this site.'}</p>
    ${errorHTML('once')}`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
  root.querySelectorAll('[data-amt]').forEach((b) => b.addEventListener('click', () => {
    S.preset = Number(b.dataset.amt); S.custom = ''; S.error = null;
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
    btn.textContent = v ? `Give ${fmtUSD(c)}` : 'Give';
    root.querySelectorAll('[data-amt]').forEach((b) => {
      const on = S.custom.trim() === '' && S.preset === Number(b.dataset.amt);
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
    <div class="gv-price" data-testid="partner-price">${PARTNER_MONTHLY}<span> / month</span></div>
    ${signed ? `
      <p class="gv-note">One checkout, then ${PARTNER_MONTHLY} a month — you can manage or cancel it any time from your billing page. The amount and the monthly plan are set by the checkout itself; nothing is charged until you complete it there.</p>
      <div class="gv-bar"><button class="gv-btn goldb" type="button" data-testid="partner-submit" data-act="partner" ${S.busy ? 'disabled' : ''}>${S.busy ? 'Opening checkout…' : `Become a Partner — ${PARTNER_MONTHLY}/month`}</button></div>
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
      </div>`}`);
  root.querySelector('[data-act="doors"]').addEventListener('click', () => showDoors(root));
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
