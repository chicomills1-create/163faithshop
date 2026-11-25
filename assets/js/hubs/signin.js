/* SIGN IN / JOIN — the dedicated account page (founder directive
   2026-11-24 17:48 MST, with his screenshot of Clerk's "Create your
   account" modal floating over the dimmed Community feed: "The sign
   in page, needs to be an independent sign in page.")

   Routes #/signin and #/join (the shell maps both to this module; the
   mode comes from the hash). The shell header stays; this page is a
   centered desk: eyebrow, headline, one line of subcopy, the Clerk
   component EMBEDDED in a gold-framed card (FaithAuth.mountIntoPage —
   never Clerk's modal, never the retired #auth-overlay), a switcher
   line that navigates to the other route, and the house verse at the
   foot. Restraint is the design (ChatGPT consult
   chatcmpl-EnvYsGqN5pBXTYsCN7jMraOLyauN9: two routes, return to the
   originating hub, headline + card + switcher + the Proverbs 16:3
   line, nothing else).

   Return flow: FaithAuth.openAuth stored the visitor's origin before
   navigating here; when Clerk reports a signed-in user while this
   page is current (the 'faithauth' event, or the shell's re-render of
   this page on the auth transition), the page sends the visitor back
   to that origin (default home) via FaithAuth.takeReturn. A member
   who lands here already signed in is sent back immediately. The
   post-join terms gate is untouched — it still fires from the shell
   on the join transition and on the apiFetch 403 exactly as before.

   ATMOSPHERE (founder directive 2026-11-24 19:40 MST: "It needs its
   own page, with an awesome background also."): the page had the
   page; what it sat on was flat black. This destination page carries
   a real scene, not the 10–16% flank haze rolling out to the hubs:
   the house's sanctuary crowd (assets/img/listen/sanctuary.webp —
   the black-and-gold congregation of the Listen hero and the Now
   Playing crowd stage) as a dimmed film backdrop at roughly half
   presence, under a deep radial well that keeps the text column —
   headline, card, switcher, verse — on the same near-black the page
   was graded on. The card floats over it with its gold frame. Still
   image; the drift is a barely-perceptible settle and dies under
   prefers-reduced-motion. JOIN warms the same scene a grade
   ("Welcome home." should feel warmer than "Welcome back." —
   ChatGPT consult chatcmpl-Enxd8rr5YH6A7UeGsb4OWJP36fRYy, which
   also ratified the ~half-presence line and the deep radial well).
   Shell untouched: the layer lives and dies
   inside this module's root. */

const CSS = `
.si-bg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#050505}
.si-bg img{width:100%;height:100%;object-fit:cover;object-position:50% 34%;opacity:.52;filter:brightness(.66) saturate(1.06);transform:scale(1.05);animation:siDrift 46s ease-in-out infinite alternate}
.si-bg.si-join img{filter:brightness(.69) saturate(1.14) sepia(.14)}
.si-bg .si-scrim{position:absolute;inset:0;background:radial-gradient(ellipse 62% 58% at 50% 40%,rgba(5,5,5,.88) 0%,rgba(5,5,5,.72) 46%,rgba(5,5,5,.38) 74%,rgba(5,5,5,.30) 100%),linear-gradient(180deg,rgba(5,5,5,.55) 0%,rgba(5,5,5,0) 22%,rgba(5,5,5,0) 62%,rgba(5,5,5,.78) 100%)}
@keyframes siDrift{from{transform:scale(1.05) translateY(0)}to{transform:scale(1.11) translateY(-1.4%)}}
@media (prefers-reduced-motion: reduce){.si-bg img{animation:none}}
.si-wrap{position:relative;z-index:1;max-width:460px;margin:0 auto;padding:52px 20px 30px;text-align:center}
.si-eyebrow{color:var(--gold);letter-spacing:.3em;font-size:11px;font-weight:700;text-transform:uppercase;margin:0}
.si-title{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:clamp(36px,8vw,48px);line-height:1.05;margin:14px 0 10px;color:#fff8ea}
.si-sub{color:var(--mute);font-size:15.5px;line-height:1.6;margin:0 auto;max-width:400px}
.si-card{margin-top:30px;border:1px solid rgba(212,175,55,.42);border-radius:16px;padding:28px 24px;background:linear-gradient(150deg,#141005,#0a0805 62%);box-shadow:0 22px 60px rgba(0,0,0,.55);text-align:left}
.si-mount{min-height:300px}
.si-wait{color:var(--mute);font-size:15px;line-height:1.6;text-align:center;margin:26px 0}
.si-note{color:#ddd3b8;font-size:15px;line-height:1.65;text-align:center;margin:18px 0}
.si-note b{color:#fff8ea}
.si-retry{display:block;margin:16px auto 4px;background:none;border:1px solid var(--gold-dim);color:var(--gold);border-radius:999px;padding:9px 20px;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.si-retry:hover{border-color:var(--gold);color:var(--gold-hi)}
.si-switch{margin-top:24px;color:var(--mute);font-size:14.5px}
.si-switch a{color:var(--gold);font-weight:700}
.si-switch a:hover{color:var(--gold-hi)}
.si-verse{margin:40px auto 6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16.5px;line-height:1.55;color:#f0e6cd;max-width:420px}
.si-verse b{display:block;margin-top:8px;font-style:normal;color:var(--gold);letter-spacing:.18em;font-size:12px;text-transform:uppercase}
@media(max-width:520px){.si-wrap{padding:38px 14px 22px}.si-card{padding:22px 16px}.si-mount{min-height:280px}}
`;

const VERSE = 'Commit thy works unto the LORD, and thy thoughts shall be established.';
const COPY = {
  signin: {
    title: 'Welcome back.',
    sub: 'Sign in and pick up right where you left off — the wall, your prayers, your people.',
    switchLine: 'New here? <a href="#/join">Join free</a>',
  },
  join: {
    title: 'Welcome home.',
    sub: 'One free account opens the whole house — post on the wall, pray with the family, save what speaks to you.',
    switchLine: 'Already a member? <a href="#/signin">Sign in</a>',
  },
};

/* One live 'faithauth' listener at a time: each render replaces the
   previous one, so revisits never stack stale handlers. */
let authListener = null;

function goReturn() {
  const A = window.FaithAuth;
  const dest = A && typeof A.takeReturn === 'function' ? A.takeReturn() : '#/home';
  if (location.hash !== dest) location.hash = dest;
}

export function render(root, ctx) {
  const isCurrent = ctx && typeof ctx.isCurrent === 'function' ? ctx.isCurrent : () => true;
  const mode = /^#\/join/.test(location.hash) ? 'join' : 'signin';
  const A = window.FaithAuth;

  if (authListener) { window.removeEventListener('faithauth', authListener); authListener = null; }
  authListener = () => { if (isCurrent() && A && A.signedIn()) goReturn(); };
  window.addEventListener('faithauth', authListener);

  /* A member who lands here already signed in never sees the form. */
  if (A && A.signedIn()) { goReturn(); return; }

  const st = document.createElement('style');
  st.textContent = CSS;
  root.appendChild(st);
  const bg = document.createElement('div');
  bg.className = mode === 'join' ? 'si-bg si-join' : 'si-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<img src="assets/img/listen/sanctuary.webp" alt="" fetchpriority="low"><div class="si-scrim"></div>';
  root.appendChild(bg);
  const view = document.createElement('div');
  view.className = 'si-wrap';
  const c = COPY[mode];
  view.innerHTML = `
    <p class="si-eyebrow">✦ 16:3 Faith — Members</p>
    <h2 class="si-title">${c.title}</h2>
    <p class="si-sub">${c.sub}</p>
    <div class="si-card"><div class="si-mount"></div></div>
    <p class="si-switch">${c.switchLine}</p>
    <p class="si-verse">“${VERSE}” <b>— Proverbs 16:3 · KJV</b></p>`;
  root.appendChild(view);

  const node = view.querySelector('.si-mount');
  if (A && typeof A.mountIntoPage === 'function') A.mountIntoPage(node, mode);
  else node.innerHTML = '<p class="si-note"><b>Sign-in couldn\'t load just now.</b><br>The whole house stays open to read — nothing here is locked.</p>';

  window.__signin = { ready: true, mode };
  if (window.FaithMotion) window.FaithMotion.armReveals(root);
}
