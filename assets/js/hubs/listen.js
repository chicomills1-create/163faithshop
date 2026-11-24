/* LISTEN — the Sanctuary (SPEC §3.2). Data layer: album-breakdown build
   (2026-11-19) — baked snapshot in assets/data/ from the D1 cache twin +
   genre-reference audit + the production YouTube songs pool + the
   album-map sidecar (data-build/build_listen_data.py). Artist pages break
   songs down BY ALBUM with exact official covers (founder directive
   2026-11-19 16:21 MST); unmatched tracks ride the honest "More songs"
   group. Player: the shell's persistent Kairo-style player (YouTube
   source, cover face, own transport) — behavior-frozen by the parity +
   Now Playing builds; this hub only queues into it.
   Founder music law: full songs only — the snapshot build excludes talk /
   podcast-pattern tracks by title pattern; rows show a duration only
   when a real one exists in the data (#58: real or absent, never "?").

   DESIGN GRAFT (2026-11-19, founder-supplied ChatGPT Listen package,
   design-sources/listen-chatgpt-package/): the package's visual layer —
   "FAITH HAS A SOUND." cassette hero, section rhythm (01 FIRST LISTEN
   feature + rotation · 02 PICK A LANE crates · 03 DIG INTO THE SOUND
   tabs · 04 MEET THE VOICES · 05 rotations), scarlet/gold/cream tokens —
   grafted over the SAME data layer and the SAME frozen behaviors. Every
   artist, track, cover and count below comes from listen-index.json /
   albums/<slug>.json / playable/<slug>.json. The package's sample
   artists, tracks and demo MP3s never ship. Record:
   fresh-build/records/LISTEN-GRAFT-RECORD-2026-11-19.md.

   LISTEN AMP (2026-11-23, founder directive with Kairo side-by-side):
   the PICK A LANE crates became full cinematic AI-art cards (church
   register, gold-on-black; art is world-building decoration, never an
   artist portrait or cover) and every lane opens a room. Lane
   membership: the index door field (genre audit) primary +
   catalog-derived cross-listings in assets/data/listen-lanes.json.
   ChatGPT consult chatcmpl-EnXX5kYBM9tc7wYCgP2nzw0KkUFAd. Record:
   fresh-build/records/LISTEN-AMP-BUILD-RECORD-2026-11-23.md.

   LISTEN GENRE DECLUTTER + LANE HERO FILMS (2026-11-23, founder
   directives 17:15 + 17:18 MST): genre pages show ARTISTS ONLY —
   the lane room is its own big hero (the lane's 90–120s film when
   the lanes data carries one, else its cinematic art at the same
   hero size), the lane's true counts, and its artist card grid;
   the room's Play All and "Playable now" loose-track shelf are
   REMOVED entire, and the generic house film slot no longer rides
   inside lanes (it paints on the top-level Listen view only).
   The flow is genre → artists → click an artist → their music.
   Record: fresh-build/records/LISTEN-GENRE-DECLUTTER-2026-11-23.md. */

const state = { index: null, lanes: null, playable: new Map(), albums: new Map(), feature: null, scan: null };
window.__listen = { index: null, ready: false, lastArtist: null };

const STYLE = `<style>
.alb-list{margin-top:16px}
.alb-cover{position:relative;width:64px;height:64px;border-radius:9px;background:linear-gradient(140deg,rgba(212,175,55,.22),rgba(212,175,55,.04));overflow:hidden;flex:none;display:block}
.alb-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.alb-cover .acard-mono{font-size:20px}
.alb-meta{flex:1;min-width:0}
.alb-play{flex:none;padding:8px 13px}
.alb-toggle{flex:none;white-space:nowrap}
.alb-body{margin-top:6px}
.alb-note{margin-top:10px;font-size:13px}

/* ---------- LISTEN GRAFT — ChatGPT Listen package visual layer ---------- */
.lsn-top{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;flex-wrap:wrap}
.lsn-top .kicker{margin-bottom:0}
.lsn-top .hub-search{margin:0;flex:1;min-width:min(300px,100%);max-width:430px}
.lsn-sec{margin-top:64px}
.lsn-sechead{display:flex;align-items:flex-end;justify-content:space-between;gap:22px;margin-bottom:24px}
.lsn-eyebrow{font-size:11px;letter-spacing:2.6px;font-weight:800;color:var(--gold);text-transform:uppercase}
.lsn-sechead h2{font-family:Impact,'Arial Black',var(--serif);font-size:clamp(34px,4.4vw,54px);letter-spacing:-.5px;line-height:1.05;margin:9px 0 5px;color:var(--bone);text-transform:uppercase}
.lsn-sechead h2 em{color:var(--gold);font-style:italic}
.lsn-sechead p{font-size:14px;color:var(--mute);line-height:1.55}
.lsn-side{font-size:10px;letter-spacing:1.5px;color:#aa9572;font-weight:800;white-space:nowrap;text-transform:uppercase}
.lsn-textact{background:none;border:none;border-bottom:1px solid var(--gold);color:var(--gold-hi);font-size:11px;letter-spacing:1px;font-weight:800;padding:8px 0;white-space:nowrap;text-transform:uppercase}
/* hero */
.lsn-hero{display:grid;grid-template-columns:1fr 1.01fr;align-items:center;gap:34px;padding:30px 0 8px}
.lsn-pretag{font-size:11px;letter-spacing:2.6px;font-weight:800;color:var(--gold);text-transform:uppercase}
.lsn-pretag .ast{color:#e93d38;font-size:19px;margin-right:5px;vertical-align:-2px}
.lsn-pretag .slash{color:#9d4e32;margin:0 9px}
.lsn-h1{font-family:Impact,'Arial Black',var(--serif);font-size:clamp(62px,7.4vw,108px);letter-spacing:-2.5px;line-height:.92;margin:22px 0 20px;font-weight:900;text-transform:uppercase;color:var(--bone)}
.lsn-h1 span{color:var(--gold);font-style:italic;text-shadow:3px 3px 0 #53351c}
.lsn-lede{font-size:16px;line-height:1.65;color:#cfc4b5;max-width:465px}
.lsn-herobtns{display:flex;align-items:center;gap:24px;margin-top:28px;flex-wrap:wrap}
.lsn-redbtn{border:0;background:#e93d38;color:#fff;font-size:12px;letter-spacing:1.2px;font-weight:900;padding:16px 21px;display:inline-flex;gap:11px;align-items:center;justify-content:center;border-radius:5px;box-shadow:4px 4px 0 #80231f;transition:transform .2s;text-transform:uppercase;cursor:pointer}
.lsn-redbtn:hover{transform:translate(-2px,-2px)}
.lsn-goldbtn{border:0;background:var(--gold);color:#1a1209;font-size:11px;letter-spacing:1.1px;font-weight:900;padding:14px 17px;display:inline-flex;gap:10px;align-items:center;border-radius:5px;box-shadow:4px 4px 0 #705322;transition:transform .2s;text-transform:uppercase;cursor:pointer}
.lsn-goldbtn:hover{transform:translate(-2px,-2px)}
.lsn-underlink{background:none;border:none;font-size:11px;font-weight:900;color:var(--gold-hi);letter-spacing:1px;padding:11px 0;border-bottom:1px solid var(--gold);text-transform:uppercase;cursor:pointer}
.lsn-underlink span{color:#e93d38}
.lsn-herfoot{display:flex;align-items:center;gap:11px;margin-top:42px;color:#a79b87;font-size:10px;letter-spacing:1.5px;font-weight:800}
.lsn-herfoot i{display:inline-block;height:1px;width:29px;background:#e93d38}
.lsn-visual{height:460px;position:relative;display:flex;align-items:center;justify-content:center}
.lsn-ring{position:absolute;border:1px solid #745b31;border-radius:50%;width:330px;height:330px;right:-8px;top:34px;opacity:.5}
.lsn-frame{height:415px;width:100%;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;background:radial-gradient(circle at 55% 40%,#48361d 0,#201910 38%,#0c0b08 75%);border:1px solid #6b4c28;clip-path:polygon(2% 4%,98% 0,100% 95%,3% 100%,0 88%);box-shadow:0 20px 70px #000}
.lsn-frame:before{content:'';position:absolute;inset:18px;border:1px solid rgba(136,100,44,.4);transform:rotate(-2deg)}
.lsn-tape{width:97%;max-height:100%;position:relative;z-index:1;filter:drop-shadow(0 24px 16px rgba(0,0,0,.6));transform:scale(1.13)}
.lsn-ribbon{position:absolute;bottom:24px;left:21px;background:#d9ae4d;color:#130e0a;padding:9px 14px;font-weight:900;font-size:10px;letter-spacing:1.8px;transform:rotate(-3deg);z-index:2}
.lsn-stamp{position:absolute;right:14px;top:22px;width:90px;height:90px;display:flex;align-items:center;justify-content:center;border:3px dashed #fff2bf;background:#e93d38;color:#fff;border-radius:50%;transform:rotate(13deg);font-family:Impact,'Arial Black',sans-serif;font-size:23px;line-height:.88;text-align:center;z-index:3}
.lsn-corner{position:absolute;right:0;bottom:2px;color:#947d5a;font-size:9px;letter-spacing:1.5px;font-weight:900}
/* marquee */
.lsn-marquee{display:flex;align-items:center;justify-content:space-between;gap:14px;border-top:1px solid #493522;border-bottom:1px solid #493522;padding:15px 0;margin-top:26px;color:#d4ba79;font-size:10px;letter-spacing:1.6px;font-weight:900}
.lsn-marquee .sep{color:#e93d38}
/* feature */
.lsn-feature{display:grid;grid-template-columns:1.12fr .88fr;gap:15px}
.lsn-show{border:1px solid #694b25;background:linear-gradient(125deg,#272017,#110f0c);min-height:320px;padding:20px;display:grid;grid-template-columns:.95fr 1fr;gap:20px;overflow:hidden}
.lsn-showart{position:relative;align-self:stretch;min-height:270px;overflow:hidden;transform:rotate(-2deg);box-shadow:10px 15px 30px rgba(0,0,0,.6);background:linear-gradient(140deg,rgba(212,175,55,.22),rgba(212,175,55,.04))}
.lsn-showart img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.lsn-showart .acard-mono{font-size:44px}
.lsn-badge{position:absolute;left:10px;bottom:11px;background:rgba(13,11,9,.87);color:#ffdd98;border:1px solid #ad8133;padding:8px 9px;font-size:9px;letter-spacing:1px;font-weight:800;z-index:2}
.lsn-badge i{display:inline-block;width:6px;height:6px;background:#e93d38;border-radius:50%;box-shadow:0 0 12px #e93d38;margin-right:6px}
.lsn-showtext{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0}
.lsn-showtext>span{color:var(--gold);font-size:10px;letter-spacing:1.7px;font-weight:900;text-transform:uppercase}
.lsn-showtext h3{font-size:clamp(30px,3.4vw,50px);font-family:Impact,'Arial Black',var(--serif);line-height:.98;letter-spacing:-.5px;margin:13px 0 4px;color:var(--bone);text-transform:uppercase}
.lsn-showtext h3 i{font-style:italic;color:var(--gold)}
.lsn-showtext .who{font-size:14.5px;color:var(--bone);font-weight:700}
.lsn-showtext p{line-height:1.55;color:#c0b3a2;font-size:13px;margin:8px 0 20px}
.lsn-showtext .openlink{margin-top:12px}
.lsn-rotation{background:#0f0e0c;border:1px solid var(--line);min-height:320px;display:flex;flex-direction:column}
.lsn-rothead{background:#1b1712;border-bottom:1px solid var(--line);color:var(--gold);padding:16px 18px;font-size:10px;font-weight:900;letter-spacing:1.9px;display:flex;justify-content:space-between;gap:10px}
.lsn-rothead span:last-child{color:#aa9572;text-align:right}
.lsn-ftrow{display:flex;align-items:center;gap:12px;width:100%;padding:11px 16px;background:transparent;border:none;border-bottom:1px solid #2b2722;color:var(--bone);text-align:left;min-height:62px;cursor:pointer}
.lsn-ftrow:last-child{border-bottom:0}
.lsn-ftrow:hover,.lsn-ftrow.playing{background:#251b12}
.lsn-ftnum{font-family:var(--serif);color:#7e705d;font-size:15px;width:21px;flex:none}
.lsn-ftcover{height:45px;width:45px;object-fit:cover;flex:none;background:#282018}
.lsn-ftname{flex:1;min-width:0}
.lsn-ftname strong{font-size:12.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lsn-ftname small{font-size:11px;color:var(--mute)}
.lsn-ftdur{font-size:11px;color:#9b8e79;font-weight:700;flex:none}
.lsn-ftact{width:30px;height:30px;border:1px solid #66512e;border-radius:50%;color:var(--gold);display:grid;place-items:center;font-size:11px;flex:none}
.lsn-wait{padding:22px 18px;color:var(--mute);font-size:13.5px;line-height:1.6}
/* lanes — LISTEN AMP (2026-11-23): full cinematic AI-art cards, Kairo's
   shape in the church register. Lane art is world-building decoration;
   it never stands in for a real artist portrait or album cover. */
.lsn-crates{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.lsn-lane{position:relative;border:1px solid #3d3325;border-radius:10px;overflow:hidden;padding:0;aspect-ratio:4/3;background:#141109;cursor:pointer;text-align:left;width:100%;font-family:var(--sans);transition:transform .2s,border-color .2s;display:block;color:var(--bone)}
.lsn-lane:hover{transform:translateY(-3px);border-color:var(--gold)}
.lsn-lane img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.lsn-laneveil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,0) 42%,rgba(5,5,5,.88) 100%)}
.lsn-lanemeta{position:absolute;left:13px;right:13px;bottom:11px;display:block}
.lsn-lanemeta strong{display:block;color:var(--bone);font-size:17px;font-weight:800;letter-spacing:.2px;text-shadow:0 2px 10px rgba(0,0,0,.8);line-height:1.2}
.lsn-lanemeta small{display:block;color:#e8cf8f;font-size:10.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-top:3px}
.lsn-lanemeta small.gathering{color:#b7a888}
/* lane room (LISTEN AMP) */
.lsn-roomhero{position:relative;border-radius:14px;overflow:hidden;border:1px solid #4a3a20;min-height:340px;display:flex;align-items:flex-end;margin-top:14px;background:#141109}
.lsn-roomhero>img,.lsn-roomhero>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.lsn-roomveil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,5,.05) 30%,rgba(5,5,5,.92) 100%)}
.lsn-roomtitle{position:relative;padding:22px}
.lsn-roomtitle h3{font-family:Impact,'Arial Black',var(--serif);font-size:clamp(34px,5vw,54px);text-transform:uppercase;letter-spacing:-.5px;line-height:1;color:var(--bone);margin:6px 0}
.lsn-roomtitle p{color:#d8c9a8;font-size:13.5px}
.lsn-roomsec{margin-top:30px}
.lsn-roomsec>h4{font-family:var(--serif);font-size:21px;color:var(--bone);margin:0 0 12px}
/* dig */
.lsn-toolbar{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid var(--line);padding-bottom:14px;flex-wrap:wrap}
.lsn-tabs{display:flex;gap:4px;flex-wrap:wrap}
.lsn-tabs button{border:1px solid transparent;background:transparent;color:#b0a493;letter-spacing:1px;font-size:11px;font-weight:900;padding:11px 14px;border-radius:3px;cursor:pointer;text-transform:uppercase}
.lsn-tabs button[aria-selected="true"]{color:#12100b;background:var(--gold)}
.lsn-dignote{font-size:10px;letter-spacing:1.5px;color:#aa9572;font-weight:800;text-transform:uppercase}
.lsn-digbody{padding-top:21px}
.lsn-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
.lsn-grid .acard{border-radius:6px;background:#11100e;border-color:#352f29}
.lsn-grid .acard:hover{transform:translateY(-3px);border-color:#94753c}
.lsn-relcard{background:#11100e;border:1px solid #352f29;padding:12px;position:relative;min-width:0;text-align:left;color:var(--bone);cursor:pointer;width:100%;font-family:var(--sans)}
.lsn-relcard:hover{transform:translateY(-3px);border-color:#94753c}
.lsn-relart{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:linear-gradient(140deg,rgba(212,175,55,.22),rgba(212,175,55,.04));display:block}
.lsn-relart img{width:100%;height:100%;object-fit:cover;display:block}
.lsn-relart .acard-mono{font-size:34px}
.lsn-onplay{position:absolute;right:11px;bottom:10px;width:45px;height:45px;border-radius:50%;background:#e93d38;border:0;color:#fff;display:grid;place-items:center;box-shadow:0 5px 18px rgba(0,0,0,.6);font-size:15px;cursor:pointer;z-index:2}
.lsn-onplay:hover{transform:scale(1.1)}
.lsn-relcard h3{font-size:15px;margin:13px 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--sans)}
.lsn-relcard .sec2{color:#ab9a86;font-size:11px;min-height:19px}
.lsn-relcard .foot{margin-top:12px;padding-top:10px;border-top:1px solid #2b261f;font-size:9px;color:#d1b06d;letter-spacing:.6px;font-weight:800;text-transform:uppercase}
.lsn-tcover{width:40px;height:40px;border-radius:7px;object-fit:cover;flex:none;background:#282018}
.lsn-tsub{color:var(--mute);font-size:12px;white-space:nowrap}
.lsn-progress{font-size:12.5px;color:var(--mute);margin-bottom:12px;letter-spacing:.04em}
.lsn-empty{padding:56px 18px;border:1px dashed #7e693b;text-align:center;color:#dfc391;margin-top:6px}
.lsn-empty strong{font-family:Impact,'Arial Black',var(--serif);font-size:28px;letter-spacing:.5px;display:block}
.lsn-empty p{font-size:13px;color:#9b8b78;margin:8px 0 16px}
.lsn-empty button{border:1px solid var(--gold);background:transparent;color:var(--gold);padding:12px 17px;font-weight:900;font-size:11px;letter-spacing:1px;cursor:pointer}
/* voices */
.lsn-voices{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}
.lsn-voice{background:#11100f;border:1px solid #3e352b;padding:10px;color:var(--bone);text-align:left;cursor:pointer;font-family:var(--sans);width:100%}
.lsn-voice:hover{border-color:var(--gold)}
.lsn-voiceart{position:relative;aspect-ratio:1/1;overflow:hidden;background:radial-gradient(circle at 40% 25%,#9c8045,#2b2115 57%,#0c0b0a);display:block}
.lsn-voiceart img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.lsn-voiceart .acard-mono{font-size:30px}
.lsn-voice b{display:block;margin-top:10px;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lsn-voice small{font-size:10px;color:#aa9d87}
/* rotations */
.lsn-mixes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}
.lsn-mix{display:flex;flex-direction:column;min-height:262px;padding:22px;position:relative;background:#1d1411;border:1px solid #5a4033;overflow:hidden;color:#fff;text-align:left}
.lsn-mix:nth-child(2){background:#211f13;border-color:#65502f}
.lsn-mix:nth-child(3){background:#121c20;border-color:#37515f}
.lsn-mix:nth-child(4){background:#17131f;border-color:#463a5f}
.lsn-mix:nth-child(5){background:#0f1a14;border-color:#2f5540}
.lsn-mix:before{content:'';position:absolute;width:220px;height:220px;border-radius:50%;border:27px solid rgba(255,241,214,.06);top:-80px;right:-40px}
.lsn-mix .lp-no{color:#e9bd6e;font-size:11px;letter-spacing:2px;font-weight:900}
.lsn-mix h3{margin:auto 0 12px;font-family:Impact,'Arial Black',var(--serif);font-size:clamp(27px,2.8vw,40px);line-height:1;position:relative;text-transform:uppercase}
.lsn-mix h3 em{color:var(--gold);font-style:italic}
.lsn-mix p{position:relative;color:#d7bda1;font-size:12px;line-height:1.5;max-width:270px}
.lsn-mix .lp-foot{margin-top:16px;font-size:10px;color:#f1dbaf;font-weight:900;letter-spacing:1px}
.lsn-mixbtns{display:flex;gap:10px;margin-top:16px;position:relative;flex-wrap:wrap}
.lsn-mixopen{background:none;border:1px solid #8a6d3f;color:#f1dbaf;font-size:10px;letter-spacing:1px;font-weight:900;padding:11px 14px;cursor:pointer;text-transform:uppercase}
.lsn-mixplay{background:#e93d38;border:0;color:#fff;font-size:10px;letter-spacing:1px;font-weight:900;padding:11px 14px;cursor:pointer;text-transform:uppercase;box-shadow:3px 3px 0 #80231f}
/* cta */
.lsn-cta{min-height:280px;margin-top:80px;padding:42px 46px;background:linear-gradient(115deg,#201913 0,#10100e 65%);border-top:2px solid var(--gold);border-bottom:2px solid #3b251c;display:flex;justify-content:space-between;align-items:center;gap:30px}
.lsn-cta h2{font-size:clamp(38px,4.8vw,64px);line-height:.98;font-family:Impact,'Arial Black',var(--serif);margin:14px 0;letter-spacing:-.5px;color:var(--bone);text-transform:uppercase}
.lsn-cta h2 em{color:var(--gold);font-style:italic}
.lsn-cta p{color:#aea18f;max-width:540px;line-height:1.55;font-size:13.5px}
.lsn-ctabtns{display:flex;flex-direction:column;gap:14px;align-items:stretch;flex:none}
@media(max-width:1020px){.lsn-crates{grid-template-columns:repeat(3,minmax(0,1fr))}.lsn-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lsn-voices{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:920px){.lsn-hero{grid-template-columns:1fr;min-height:0;padding-top:36px}.lsn-visual{height:400px;max-width:640px;width:100%;margin:auto}.lsn-frame{height:370px}.lsn-feature{grid-template-columns:1fr}.lsn-mixes{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){
 .lsn-h1{font-size:clamp(54px,14.5vw,80px);letter-spacing:-2px}
 .lsn-visual{height:282px}.lsn-frame{height:276px}.lsn-stamp{width:64px;height:64px;font-size:16px;top:11px;right:8px;border-width:2px}
 .lsn-ribbon{font-size:7px;bottom:14px;left:10px;padding:7px 10px}.lsn-corner{font-size:7px}
 .lsn-marquee{justify-content:center;overflow:hidden}.lsn-marquee span:nth-child(n+4){display:none}
 .lsn-marquee span{white-space:nowrap;font-size:8.5px}
 .lsn-sec{margin-top:54px}.lsn-sechead{display:block}.lsn-side{display:block;margin-top:12px;white-space:normal}
 .lsn-show{grid-template-columns:1fr 1fr;min-height:230px;padding:12px;gap:12px}.lsn-showart{min-height:200px}
 .lsn-showtext h3{font-size:29px;margin:8px 0 3px}.lsn-showtext>span{font-size:7.5px}.lsn-showtext p{font-size:10.5px;line-height:1.4;margin:5px 0 11px}
 .lsn-showtext .who{font-size:12px}.lsn-goldbtn{font-size:9px;padding:11px 10px}
 .lsn-crates{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.lsn-lanemeta strong{font-size:14.5px}.lsn-lanemeta small{font-size:9px}.lsn-lanemeta{left:10px;right:10px;bottom:9px}
 .lsn-roomhero{min-height:250px}.lsn-roomtitle{padding:16px}.lsn-roomsec{margin-top:24px}
 .lsn-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .lsn-mixes{grid-template-columns:1fr;gap:12px}.lsn-mix{min-height:225px}
 .lsn-cta{margin-top:60px;padding:28px 20px;display:block}.lsn-ctabtns{margin-top:18px}
 .lsn-ftrow{padding:10px 12px}.lsn-rothead{padding:13px 14px}
}
@media(prefers-reduced-motion:reduce){.lsn-lane,.lsn-grid .acard,.lsn-relcard,.lsn-redbtn,.lsn-goldbtn{transition:none}}
/* ---------- ARTIST PAGE v2 — clean card + releases by kind (2026-11-22) ---------- */
.artist-card{display:flex;gap:18px;align-items:center;margin-top:18px;border:1px solid var(--line);border-radius:16px;background:var(--coal);padding:18px}
.artist-card .acard-art.big{width:110px;height:110px;flex:none;margin:0}
.artist-card-main{flex:1;min-width:0}
.artist-card-main h2{margin:0 0 6px}
.artist-counts{font-size:15px;color:var(--bone);margin:0}
.artist-counts b{color:var(--gold-hi);font-family:var(--serif);font-size:17px}
.artist-sub{font-size:12.5px;color:var(--mute);margin:5px 0 0}
.artist-card-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:13px}
.rel-filter{display:block;flex:1 1 200px;min-width:0}
.rel-filter input{background:#0d0c0a;border:1px solid var(--line);border-radius:999px;color:var(--bone);padding:9px 14px;font-size:13px;width:100%;box-sizing:border-box;font-family:var(--sans)}
.rel-filter input:focus{outline:none;border-color:var(--gold)}
.rel-sec{margin-top:36px}
.rel-sec-head{display:flex;align-items:baseline;justify-content:space-between;gap:14px}
.rel-sec-head h3{margin:0}
.rel-sec-note{font-size:11px;letter-spacing:1.2px;color:#aa9572;font-weight:800;text-transform:uppercase;white-space:nowrap}
.rel-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:14px}
.rgc{background:#11100e;border:1px solid #352f29;border-radius:10px;padding:10px;text-align:left;color:var(--bone);cursor:pointer;font-family:var(--sans);min-width:0;width:100%;transition:transform .2s,border-color .2s}
.rgc:hover{transform:translateY(-3px);border-color:#94753c}
.rgc[aria-expanded="true"]{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)}
.rgc-art{position:relative;display:block;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:6px;background:linear-gradient(140deg,rgba(212,175,55,.22),rgba(212,175,55,.04))}
.rgc-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.rgc-art .acard-mono{font-size:30px}
.rgc-title{display:block;margin-top:9px;font-size:13.5px;font-weight:700;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rgc-meta{display:block;margin-top:3px;font-size:11px;color:#ab9a86}
.rel-detail{margin-top:14px}
.rel-more-row{display:flex;align-items:center;gap:14px;margin-top:14px}
.rel-more-note{font-size:12px;color:var(--mute)}
.rel-nomatch{margin-top:26px}
@media(max-width:1020px){.rel-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:640px){.rel-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.artist-card{padding:14px;gap:13px}.artist-card .acard-art.big{width:84px;height:84px}.artist-counts{font-size:14px}}
@media(prefers-reduced-motion:reduce){.rgc{transition:none}}
/* ---------- LISTEN HONESTY CURE (2026-11-23) ----------
   Unbound (not-yet-playable) rows say so: dimmed title + a small
   right-side marker. The row stays a non-button — no fake affordance. */
.trow.static .ttitle{color:#8d8172}
.trow .tnotplay{color:#9a8a68;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap}
</style>`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const fmtDur = (sec) => {
  if (!sec && sec !== 0) return '';
  const m = Math.floor(sec / 60), s = sec % 60, h = Math.floor(m / 60);
  return h > 0 ? `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};
const monogram = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '16';

/* CACHE DISCIPLINE (2026-11-23, adjudication Q4): the index fetch
   carries a build stamp so a stale cached bundle can never pair this
   code with a stale index (or the reverse). Bump the stamp whenever
   the index schema or the count semantics change. Name:
   LISTEN_INDEX_STAMP. */
const LISTEN_INDEX_STAMP = '20261123-oneruler';
async function loadIndex() {
  if (!state.index) {
    const r = await fetch(`assets/data/listen-index.json?v=${LISTEN_INDEX_STAMP}`);
    state.index = await r.json();
    window.__listen.index = state.index;
  }
  return state.index;
}
async function loadLanes() {
  if (!state.lanes) {
    try {
      const r = await fetch('assets/data/listen-lanes.json');
      state.lanes = r.ok ? await r.json() : { derived: {} };
    } catch { state.lanes = { derived: {} }; }
  }
  return state.lanes;
}
async function loadPlayable(slug) {
  if (!state.playable.has(slug)) {
    try {
      const r = await fetch(`assets/data/playable/${slug}.json`);
      state.playable.set(slug, r.ok ? await r.json() : { name: '', tracks: [] });
    } catch { state.playable.set(slug, { name: '', tracks: [] }); }
  }
  return state.playable.get(slug);
}
async function loadAlbums(slug) {
  if (!state.albums.has(slug)) {
    try {
      const r = await fetch(`assets/data/albums/${slug}.json`);
      state.albums.set(slug, r.ok ? await r.json() : null);
    } catch { state.albums.set(slug, null); }
  }
  return state.albums.get(slug);
}
const artistBySlug = (slug) => state.index.artists.find((a) => a.slug === slug);
const doorLabel = (id) => (state.index.doors.find((d) => d.id === id) || {}).label || id;
/* Populated doors in index order, each with its headline artist (most
   playable songs; first in index order wins ties) — the deterministic,
   data-derived picks the graft's feature / voices / rotations ride on. */
function doorHeadlines() {
  const out = [];
  for (const d of state.index.doors) {
    if (!d.artists) continue;
    let best = null;
    for (const a of state.index.artists) {
      if (a.door === d.id && (!best || rowsPlayable(a) > rowsPlayable(best))) best = a;
    }
    if (best) out.push({ door: d, artist: best });
  }
  return out;
}
/* Lane membership (LISTEN AMP 2026-11-23): the index `door` field —
   the genre-reference audit — is PRIMARY. listen-lanes.json adds
   catalog-derived cross-listings for the scaffold lanes that have no
   genre source (Christmas / Live / Choir / Choirs & Groups / Hymns /
   Prayer), derived from the catalog's own release titles, track
   titles, isLive flags and roster names; the rules are stated in that
   file and in listen-amp-work/derive_lanes.py. Lanes with no honest
   signal carry no derived members and stay honestly empty. */
function laneArtists(doorId) {
  const out = [];
  const seen = new Set();
  for (const a of state.index.artists) {
    if (a.door === doorId) { out.push(a); seen.add(a.slug); }
  }
  const der = (state.lanes && state.lanes.derived && state.lanes.derived[doorId]) || [];
  for (const slug of der) {
    if (seen.has(slug)) continue;
    const a = artistBySlug(slug);
    if (a) { out.push(a); seen.add(slug); }
  }
  return out;
}
/* ONE-RULER CURE (2026-11-23, PLAYABLE-COUNT-ADJUDICATION): the one
   visitor ruler is ROWS THAT PLAY — playableRows (playable rows across
   the artist's album groups) + morePlayable (the More-songs rows,
   which all play). Every rendered or ranked "playable" count in this
   hub reads rowsPlayable(a). The pool field a.playable (unique
   recordings) stays in the data for pool claims and renders nowhere
   as a playable count. */
const rowsPlayable = (a) => (a.playableRows || 0) + (a.morePlayable || 0);
const doorPlayableSum = (doorId) => laneArtists(doorId).reduce((s, a) => s + rowsPlayable(a), 0);

/* Lane films (LANE HERO FILMS 2026-11-23): wired by DATA, not code.
   listen-lanes.json may carry a per-lane film path — films.<doorId>,
   or a `film` field on a per-lane object at doors.<doorId> — e.g.
   assets/video/lanes/lane-hiphop.mp4. Absent or misshapen = null =
   the lane's cinematic art hero carries the room at the same size.
   Films drop in lane by lane as data+asset pushes; this file never
   needs an edit for one to land. Fail-soft by construction. */
function laneFilm(doorId) {
  const L = state.lanes;
  if (!L) return null;
  const f = (L.films && L.films[doorId]) || (L.doors && L.doors[doorId] && L.doors[doorId].film) || null;
  return typeof f === 'string' && f.trim() ? f : null;
}

function artistCard(a) {
  const art = a.art
    ? `<img loading="lazy" src="${esc(a.art)}" alt="" onerror="this.parentNode.classList.add('noart');this.remove()">`
    : '';
  return `<button type="button" class="acard" data-artist="${esc(a.slug)}">
    <span class="acard-art">${art}${a.art ? '' : `<span class="acard-mono">${esc(monogram(a.name))}</span>`}</span>
    <b>${esc(a.name)}</b>
    <span class="acard-meta">${a.releases} releases · ${a.songs} songs${rowsPlayable(a) ? ` · ${rowsPlayable(a)} playable` : ''}</span>
  </button>`;
}

/* Package crate decoration (Listen package app.js): glyph + accent per
   crate position — decoration only; labels and counts are the real doors. */
const CRATE_GLYPHS = ['✝', '♫', '✦', '///', '♡', '✳', '✧', '+', '◉', '✶', '❝', '♥', '⚡', '☾', '★', '☼', '◈'];
const CRATE_COLORS = ['#e8be54', '#d5a476', '#efc78d', '#e7524c', '#c58be5', '#c9dacf', '#ead3a3', '#bda5e4', '#dd9d64', '#f1d59b', '#b8a88d', '#d38185', '#df8653', '#87aeb7', '#e4ce75', '#c9b6a0', '#eea454'];
/* House lines for the rotation cards — editorial copy, no data claims;
   every number on the card is computed from the real index. */
const MIX_SUBS = {
  gospel: 'The sound that raised us — choir, quartet and Sunday morning.',
  worship: 'Hands up, hearts open. The sound of the whole room together.',
  'hip-hop': 'Faith in the city. Bars with a foundation.',
  'sleep-soaking': 'For the still hours — press play and rest.',
  kids: 'Little voices, big praise.',
};

export function render(root, { player }) {
  window.__listen.ready = false;
  let view = { kind: 'doors' };
  let query = '';
  let digTab = 'artists';
  let artistUi = {};

  root.innerHTML = `
    ${STYLE}
    <div class="lsn-top">
      <p class="kicker">Listen · The Sanctuary</p>
      <div class="hub-search"><input type="search" id="listen-search" placeholder="Search artists, albums & songs" aria-label="Search the Sanctuary"></div>
    </div>
    <div id="listen-view"><p class="lede">Opening the Sanctuary…</p></div>`;
  /* LANE HERO FILMS (2026-11-23): the house film slot is NOT painted
     here anymore. It used to sit in this chrome as a sibling of
     #listen-view, so it rode on top of EVERY sub-view — lane rooms
     and artist pages included (the founder's Hip-Hop screenshot).
     It now paints inside doorsView only — the top-level Listen view
     is its one home. Lane rooms carry their OWN hero (see doorView). */

  const viewEl = root.querySelector('#listen-view');
  const searchEl = root.querySelector('#listen-search');

  function markPlaying() {
    const st = player.state();
    viewEl.querySelectorAll('[data-track]').forEach((row) => {
      row.classList.toggle('playing', !!st.youtubeId && row.dataset.track === st.youtubeId);
    });
  }
  const onPlayerEvent = () => {
    if (!viewEl.isConnected) { window.removeEventListener('faithplayer', onPlayerEvent); return; }
    markPlaying();
  };
  window.addEventListener('faithplayer', onPlayerEvent);

  function queueFromTracks(tracks, artistName, cover) {
    return tracks.map((t) => ({ youtubeId: t.y, title: t.t, sub: artistName, cover: cover || null }));
  }

  async function playArtistFrom(slug, startIdx) {
    const a = artistBySlug(slug);
    const p = await loadPlayable(slug);
    if (!p.tracks.length) return;
    player.playQueue(queueFromTracks(p.tracks, a.name, a.art), startIdx, a.name);
  }

  /* Queue one album group of one artist — the exact mechanic the artist
     page's album Play uses (album title as the queue label, the album's
     exact cover on every queued track). LISTEN DATA CURE: NO artist-art
     fallback — a song in an album queue wears that album's cover, or
     its honest monogram (cover null) when the album has none; another
     release's art on the player face is a convicted defect (Anomaly
     plays showed the "Live & Let Live" single art). */
  async function playAlbumFor(slug, group, pos = 0) {
    const a = artistBySlug(slug);
    const p = await loadPlayable(slug);
    if (!p.tracks.length || !group.play.length) return;
    const q = queueFromTracks(group.play.map((ti) => p.tracks[ti]), a.name, group.cover);
    player.playQueue(q, pos, group.title);
  }

  /* A door's queue — the v1 mechanic: the door's artists' playable
     songs in index order, capped at 300, queued under the door's name.
     GENRE DECLUTTER (2026-11-23): the lane ROOM no longer calls this
     (no Play All on a genre page); the home "Made for the moment" mix
     cards still do — they render no track rows, only the queue action. */
  async function playDoorQueue(doorId, btn) {
    const artists = laneArtists(doorId);
    if (btn) btn.textContent = 'Queueing…';
    const queue = [];
    for (const a of artists) {
      if (queue.length >= 300) break;
      const p = await loadPlayable(a.slug);
      queue.push(...queueFromTracks(p.tracks.slice(0, 300 - queue.length), a.name, a.art));
    }
    if (queue.length) player.playQueue(queue, 0, doorLabel(doorId));
    if (btn) btn.textContent = queue.length ? `▶ Playing — ${queue.length} songs` : '▶ Play all';
  }

  function wireArtistCards(scope) {
    scope.querySelectorAll('[data-artist]').forEach((el) =>
      el.addEventListener('click', () => artistView(el.dataset.artist)));
  }
  const scrollToId = (id) => {
    const el = viewEl.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ---------- 01 / FIRST LISTEN — the featured album (real data) ------
     Candidates: the headline artist of every populated door. The feature
     is the covered album group with the most playable songs among them
     (ties → door order). Fallback, if no candidate carries a covered
     playable group: the headline artist with the most playable songs,
     featured with their own art and playable shelf. */
  async function pickFeature() {
    if (state.feature) return state.feature;
    const heads = doorHeadlines();
    const albumSets = await Promise.all(heads.map((h) => loadAlbums(h.artist.slug)));
    let best = null;
    heads.forEach((h, i) => {
      const alb = albumSets[i];
      if (!alb || !Array.isArray(alb.albums)) return;
      for (const g of alb.albums) {
        if (g.cover && g.play.length && (!best || g.play.length > best.group.play.length)) {
          best = { slug: h.artist.slug, artist: h.artist, door: h.door, group: g };
        }
      }
    });
    if (!best) {
      const top = heads.slice().sort((x, y) => rowsPlayable(y.artist) - rowsPlayable(x.artist))[0];
      if (top) best = { slug: top.artist.slug, artist: top.artist, door: top.door, group: null };
    }
    if (best) {
      const p = await loadPlayable(best.slug);
      best.tracks = p.tracks;
    }
    state.feature = best;
    return best;
  }

  async function fillFeature() {
    const feat = await pickFeature();
    const host = viewEl.querySelector('#lsn-feature');
    if (!host || !viewEl.isConnected || view.kind !== 'doors') return;
    if (!feat) {
      host.innerHTML = `<p class="lsn-wait">The first record is still being pulled off the shelf — the crates below are open.</p>`;
      return;
    }
    const a = feat.artist;
    const g = feat.group;
    const rot = g ? g.play.slice(0, 8) : [];
    const showArt = g ? g.cover : a.art;
    const meta = g
      ? [g.year || '', g.kind === 'ep' ? 'EP' : g.kind === 'single' ? 'Single' : 'Album', `${g.n} tracks`, `${g.pr} playable`].filter(Boolean).join(' · ')
      : `${a.releases} releases · ${a.songs} songs · ${rowsPlayable(a)} playable`;
    host.innerHTML = `
      <div class="lsn-show">
        <div class="lsn-showart">${showArt ? `<img src="${esc(showArt)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(g ? g.title : a.name))}</span>`}<span class="lsn-badge"><i></i>THE HOUSE PICK</span></div>
        <div class="lsn-showtext">
          <span>Featured ${g ? 'album' : 'artist'} / ${esc(feat.door.label)}</span>
          <h3>${esc(g ? g.title : a.name)}</h3>
          ${g ? `<span class="who">${esc(a.name)}</span>` : ''}
          <p>${esc(meta)}. Press play — the whole ${g ? 'album' : 'shelf'} queues up, full songs only.</p>
          <button type="button" class="lsn-goldbtn" data-featplay>Play the feature <span>▶</span></button>
          <button type="button" class="lsn-underlink openlink" data-featopen>Open ${esc(a.name)} <span>↗</span></button>
        </div>
      </div>
      <div class="lsn-rotation">
        <div class="lsn-rothead"><span>THE SIDE A ROTATION</span><span>${g ? `${esc(g.title)} / ${g.pr} PLAYABLE` : `${esc(a.name)} / ${rowsPlayable(a)} PLAYABLE`}</span></div>
        ${rot.length ? rot.map((ti, k) => `
        <button type="button" class="lsn-ftrow" data-track="${esc(feat.tracks[ti].y)}" data-featrow="${k}">
          <span class="lsn-ftnum">${String(k + 1).padStart(2, '0')}</span>
          ${showArt ? `<img class="lsn-ftcover" src="${esc(showArt)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
          <span class="lsn-ftname"><strong>${esc(feat.tracks[ti].t)}</strong><small>${esc(a.name)}</small></span>
          ${feat.tracks[ti].d ? `<span class="lsn-ftdur">${fmtDur(feat.tracks[ti].d)}</span>` : ''}
          <span class="lsn-ftact">▶</span>
        </button>`).join('') : `<p class="lsn-wait">This feature's songs ride its artist page — tap OPEN to hear them.</p>`}
      </div>`;
    const playBtn = host.querySelector('[data-featplay]');
    playBtn.addEventListener('click', () => (g ? playAlbumFor(feat.slug, g, 0) : playArtistFrom(feat.slug, 0)));
    host.querySelector('[data-featopen]').addEventListener('click', () => artistView(feat.slug));
    host.querySelectorAll('[data-featrow]').forEach((el) =>
      el.addEventListener('click', () => playAlbumFor(feat.slug, g, +el.dataset.featrow)));
    markPlaying();
  }

  /* ---------- 03 / DIG INTO THE SOUND — tabs over the real index ------ */
  function startTrackScan() {
    if (state.scan) return state.scan;
    const slugs = state.index.artists.filter((a) => rowsPlayable(a) > 0).map((a) => a.slug);
    const scan = { total: slugs.length, done: 0, finished: false };
    state.scan = scan;
    let cursor = 0;
    const worker = async () => {
      while (cursor < slugs.length) {
        const slug = slugs[cursor++];
        await loadPlayable(slug);
        scan.done++;
        if (scan.done % 20 === 0 || scan.done === scan.total) {
          const prog = viewEl.querySelector('#lsn-scanprog');
          if (prog && view.kind === 'doors' && digTab === 'tracks') renderTracks();
        }
      }
      scan.finished = true;
      if (view.kind === 'doors' && digTab === 'tracks') renderTracks();
    };
    for (let i = 0; i < 6; i++) worker();
    return scan;
  }

  function trackMatches() {
    const q = norm(query);
    const out = [];
    for (const a of state.index.artists) {
      const p = state.playable.get(a.slug);
      if (!p || !p.tracks) continue;
      p.tracks.forEach((t, i) => {
        if (!q || norm(t.t).includes(q) || norm(a.name).includes(q)) out.push({ slug: a.slug, artist: a, i, t });
      });
    }
    return out;
  }

  function renderTracks() {
    const body = viewEl.querySelector('#lsn-digbody');
    if (!body) return;
    const scan = startTrackScan();
    const matches = trackMatches();
    /* ONE-RULER CURE: the shelf total is the rows ruler over the whole
       index (rows that play, More songs included) — never the pool
       size the scan happens to have loaded. */
    const totalTracks = state.index.artists.reduce((s, a) => s + rowsPlayable(a), 0);
    const shown = matches.slice(0, 200);
    body.innerHTML = `
      <p class="lsn-progress" id="lsn-scanprog">${scan.finished
        ? `${scan.total} artists · ${totalTracks} playable songs on the shelf — every one plays full.`
        : `Digging the crates — ${scan.done} of ${scan.total} artists on the shelf so far…`}</p>
      ${shown.length ? `<div class="trows">${shown.map((m) => `
        <button type="button" class="trow" data-track="${esc(m.t.y)}" data-lsntrack="${esc(m.slug)}:${m.i}">
          ${m.artist.art ? `<img class="lsn-tcover" loading="lazy" src="${esc(m.artist.art)}" alt="" onerror="this.remove()">` : ''}
          <span class="ttitle">${esc(m.t.t)}</span><span class="lsn-tsub">${esc(m.artist.name)}</span>
          ${m.t.d ? `<span class="tdur">${fmtDur(m.t.d)}</span>` : ''}
          <span class="tplay">▶</span>
        </button>`).join('')}</div>
        ${matches.length > shown.length ? `<p class="lsn-progress" style="margin-top:12px">Showing the first ${shown.length} of ${matches.length} — keep typing to narrow it down.</p>` : ''}`
      : `<div class="lsn-empty"><strong>NOTHING IN THIS CRATE.</strong><p>${scan.finished ? 'Try a different artist, title or genre.' : 'The shelf is still loading — songs land here as the crates open.'}</p></div>`}`;
    body.querySelectorAll('[data-lsntrack]').forEach((el) =>
      el.addEventListener('click', () => {
        const [slug, i] = el.dataset.lsntrack.split(':');
        playArtistFrom(slug, +i);
      }));
    markPlaying();
  }

  async function renderReleases() {
    const body = viewEl.querySelector('#lsn-digbody');
    if (!body) return;
    const q = norm(query);
    let artists;
    if (q) {
      artists = state.index.artists.filter((a) => norm(a.name).includes(q)).slice(0, 8);
    } else {
      artists = doorHeadlines().map((h) => h.artist);
    }
    const sets = await Promise.all(artists.map((a) => loadAlbums(a.slug)));
    if (!viewEl.isConnected || view.kind !== 'doors' || digTab !== 'releases') return;
    const cards = [];
    artists.forEach((a, i) => {
      if (cards.length >= 60) return;
      const alb = sets[i];
      if (!alb || !Array.isArray(alb.albums)) return;
      const groups = alb.albums.slice().sort((x, y) => ((y.year || 0) - (x.year || 0)) || 0);
      for (const g of groups) {
        if (q && !norm(g.title).includes(q) && !norm(a.name).includes(q)) continue;
        cards.push({ a, g });
        if (cards.length >= 60) break;
      }
    });
    body.innerHTML = cards.length ? `
      <p class="lsn-progress">${q ? `Releases matching “${esc(query)}”` : 'Fresh off the headline shelves — the full breakdown lives on each artist’s page.'} · ${cards.length} shown</p>
      <div class="lsn-grid">${cards.map(({ a, g }, ci) => `
        <div class="lsn-relcard" data-relopen="${esc(a.slug)}" role="button" tabindex="0" aria-label="Open ${esc(a.name)} — ${esc(g.title)}">
          <span class="lsn-relart">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(g.title))}</span>`}</span>
          ${g.play.length ? `<button type="button" class="lsn-onplay" data-relplay="${ci}" aria-label="Play ${esc(g.title)}">▶</button>` : ''}
          <h3>${esc(g.title)}</h3>
          <div class="sec2">${esc(a.name)}</div>
          <div class="foot">${[g.year || '', g.kind === 'ep' ? 'EP' : g.kind === 'single' ? 'Single' : 'Album', `${g.n} tracks`, g.pr ? `${g.pr} playable` : ''].filter(Boolean).join(' · ')}</div>
        </div>`).join('')}</div>`
    : `<div class="lsn-empty"><strong>NOTHING IN THIS CRATE.</strong><p>No releases match that search yet — try an artist's name.</p></div>`;
    body.querySelectorAll('[data-relopen]').forEach((el) =>
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-relplay]')) return;
        artistView(el.dataset.relopen);
      }));
    body.querySelectorAll('[data-relplay]').forEach((el) =>
      el.addEventListener('click', () => {
        const c = cards[+el.dataset.relplay];
        playAlbumFor(c.a.slug, c.g, 0);
      }));
    markPlaying();
  }

  function renderDig() {
    const body = viewEl.querySelector('#lsn-digbody');
    if (!body) return;
    viewEl.querySelectorAll('[data-digtab]').forEach((b) =>
      b.setAttribute('aria-selected', String(b.dataset.digtab === digTab)));
    if (digTab === 'tracks') { renderTracks(); return; }
    if (digTab === 'releases') { renderReleases(); return; }
    const idx = state.index;
    const shown = query
      ? idx.artists.filter((a) => norm(a.name).includes(norm(query)))
      : idx.artists;
    body.innerHTML = shown.length
      ? `<div class="lsn-grid">${shown.map(artistCard).join('')}</div>`
      : `<div class="lsn-empty"><strong>NOTHING IN THIS CRATE.</strong><p>No artist matches that search yet — try a name like “CeCe Winans”.</p><button type="button" data-digreset>SHOW ALL ARTISTS</button></div>`;
    wireArtistCards(body);
    const reset = body.querySelector('[data-digreset]');
    if (reset) reset.addEventListener('click', () => {
      query = ''; searchEl.value = ''; renderDig();
    });
    markPlaying();
  }

  /* ---------- the hub home (doors view) ---------- */
  function doorsView() {
    view = { kind: 'doors' };
    const idx = state.index;
    const heads = doorHeadlines();
    const voices = heads.map((h) => h.artist);
    const extra = idx.artists.filter((a) => rowsPlayable(a) > 0 && !voices.includes(a))
      .sort((x, y) => rowsPlayable(y) - rowsPlayable(x))[0];
    if (extra) voices.push(extra);
    viewEl.innerHTML = `
      ${window.FaithFilm ? window.FaithFilm.slotHtml({ poster: 'assets/img/listen/sanctuary.webp', title: 'The sound, alive.', note: 'Listen film · in production' }) : ''}
      <section class="lsn-hero reveal">
        <div>
          <div class="lsn-pretag"><span class="ast">✳</span>16:3 Faith Radio <span class="slash">///</span> The Sanctuary / One House</div>
          <h1 class="lsn-h1">Faith<br>has a <span>sound.</span></h1>
          <p class="lsn-lede">From the block to the church doors. Gospel, worship, hip-hop and songs for the nights when you need something real.</p>
          <div class="lsn-herobtns">
            <button type="button" class="lsn-redbtn" data-heroplay>▶ Press play</button>
            <button type="button" class="lsn-underlink" data-gocrates>Dig through the crates <span>↗</span></button>
          </div>
          <div class="lsn-herfoot"><i></i> THIS IS MORE THAN A PLAYLIST. IT'S A PLACE TO BELONG.</div>
        </div>
        <div class="lsn-visual" aria-hidden="true">
          <div class="lsn-ring"></div>
          <div class="lsn-frame"><img class="lsn-tape" src="assets/img/listen/sanctuary.webp" alt=""><div class="lsn-ribbon">THE SOUNDTRACK TO THE WALK</div><div class="lsn-stamp">ALL<br>PRAISE.</div></div>
          <div class="lsn-corner">✦ SELECTED BY THE HOUSE / 16:3</div>
        </div>
      </section>
      <div class="lsn-marquee" aria-hidden="true"><span>✦ &nbsp; GOSPEL IN THE SPEAKERS</span><span class="sep">///</span><span>CHURCH IN THE STREETS</span><span class="sep">///</span><span>NO PERFECT PEOPLE REQUIRED</span><span>✦</span></div>

      <section class="lsn-sec" aria-labelledby="lsn-first-head">
        <div class="lsn-sechead"><div><span class="lsn-eyebrow">01 / Now Spinning</span><h2 id="lsn-first-head">The first <em>listen.</em></h2><p>Put something on while you find your way around.</p></div><span class="lsn-side">Real albums · real covers · full songs</span></div>
        <div class="lsn-feature" id="lsn-feature"><p class="lsn-wait">Pulling the first record off the shelf…</p></div>
      </section>

      <section class="lsn-sec" id="lsn-crates" aria-labelledby="lsn-lane-head">
        <div class="lsn-sechead"><div><span class="lsn-eyebrow">02 / Find Your Frequency</span><h2 id="lsn-lane-head">Pick a <em>lane.</em></h2><p>Different sounds. Same foundation.</p></div><span class="lsn-side">${idx.artists.length} artists on the roster</span></div>
        <div class="lsn-crates">${idx.doors.map((d) => { const n = laneArtists(d.id).length; return `
          <button type="button" class="lsn-lane" data-door="${esc(d.id)}">
            <img loading="lazy" src="assets/img/lanes/lane-${esc(d.id)}.webp" alt="" onerror="this.remove()">
            <span class="lsn-laneveil"></span>
            <span class="lsn-lanemeta"><strong>${esc(d.label)}</strong><small${n ? '' : ' class="gathering"'}>${n ? `${n} artist${n === 1 ? '' : 's'}` : 'Shelf gathering'}</small></span>
          </button>`; }).join('')}</div>
      </section>

      <section class="lsn-sec" id="lsn-dig" aria-labelledby="lsn-dig-head">
        <div class="lsn-sechead"><div><span class="lsn-eyebrow">03 / The Listening Crate</span><h2 id="lsn-dig-head">Dig into <em>the sound.</em></h2><p>Explore tracks, artists and releases. Build your own rotation.</p></div><span class="lsn-side">Search lives at the top of the hub</span></div>
        <div class="lsn-toolbar">
          <div class="lsn-tabs" role="tablist" aria-label="Browse the catalog">
            <button type="button" role="tab" data-digtab="tracks" aria-selected="false">Tracks</button>
            <button type="button" role="tab" data-digtab="artists" aria-selected="true">Artists</button>
            <button type="button" role="tab" data-digtab="releases" aria-selected="false">Releases</button>
          </div>
          <span class="lsn-dignote" id="lsn-dignote">${idx.artists.length} artists · every song plays full</span>
        </div>
        <div class="lsn-digbody" id="lsn-digbody"></div>
      </section>

      <section class="lsn-sec" aria-labelledby="lsn-voices-head">
        <div class="lsn-sechead"><div><span class="lsn-eyebrow">04 / Faces Behind The Sound</span><h2 id="lsn-voices-head">Meet the <em>voices.</em></h2><p>The headline voice behind every open lane — and the deepest shelf on the roster.</p></div><button type="button" class="lsn-textact" data-opendir>Open artist directory ↗</button></div>
        <div class="lsn-voices">${voices.map((a) => `
          <button type="button" class="lsn-voice" data-artist="${esc(a.slug)}">
            <span class="lsn-voiceart">${a.art ? `<img loading="lazy" src="${esc(a.art)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(a.name))}</span>`}</span>
            <b>${esc(a.name)}</b><small>${a.door ? esc(doorLabel(a.door)) : 'The Sanctuary'} · ${rowsPlayable(a)} playable</small>
          </button>`).join('')}</div>
      </section>

      <section class="lsn-sec" aria-labelledby="lsn-mix-head">
        <div class="lsn-sechead"><div><span class="lsn-eyebrow">05 / Hand-Picked Rotations</span><h2 id="lsn-mix-head">Made for <em>the moment.</em></h2><p>Late-night prayers. The morning commute. A little victory music.</p></div></div>
        <div class="lsn-mixes">${heads.map((h, i) => `
          <div class="lsn-mix">
            <span class="lp-no">16:3 MIXTAPE / 00${i + 1}</span>
            <h3>The ${esc(h.door.label)} <em>rotation.</em></h3>
            <p>${esc(MIX_SUBS[h.door.id] || 'Hand-picked from the shelf — press play and let it ride.')}</p>
            <span class="lp-foot">${h.door.artists} ARTISTS / ${doorPlayableSum(h.door.id)} PLAYABLE SONGS</span>
            <div class="lsn-mixbtns">
              <button type="button" class="lsn-mixplay" data-mixplay="${esc(h.door.id)}">Play the mix ▶</button>
              <button type="button" class="lsn-mixopen" data-mixopen="${esc(h.door.id)}">Open the lane ↗</button>
            </div>
          </div>`).join('')}</div>
      </section>

      ${(() => {
        /* CP4 — Listen AI Picks (labeled AI presence): computed from
           the roster's own numbers only — the deepest playable shelves
           and the deepest lane. No taste is invented; the counts are
           the catalog's. */
        const top = [...idx.artists].filter((a) => rowsPlayable(a) > 0)
          .sort((x, y) => rowsPlayable(y) - rowsPlayable(x)).slice(0, 3);
        const deepDoor = idx.doors.map((d) => ({ d, n: doorPlayableSum(d.id) }))
          .sort((x, y) => y.n - x.n)[0];
        if (!top.length) return '';
        return `<section class="ai-shelf" aria-label="Listen AI Picks">
          <div class="ai-shelf-head"><span class="ai-shelf-title">✦ FaithGuide · Listen AI Picks</span><span class="ai-tag">Powered by AI</span></div>
          <p>From the roster's own shelves: <b>${top.map((a) => `${esc(a.name)} (${rowsPlayable(a)} playable)`).join(' · ')}</b>${deepDoor && deepDoor.n ? ` — and the deepest lane in the house is <b>${esc(deepDoor.d.label)}</b>, carrying <b>${deepDoor.n} playable songs</b>` : ''}. Start with the deepest shelf; every song plays full.</p>
          <div class="ai-doors">${top.map((a) => `<button type="button" data-artist="${esc(a.slug)}">${esc(a.name)} ↗</button>`).join('')}</div>
        </section>`;
      })()}

      <section class="lsn-cta">
        <div><span class="lsn-eyebrow">This is your place, too.</span><h2>Got a song in<br><em>your spirit?</em></h2><p>We're building a space for faith-rooted voices and listeners. No algorithms telling you what you should believe. Just music and community.</p></div>
        <div class="lsn-ctabtns">
          <a class="lsn-redbtn" href="#/community">Connect with the house <span>↗</span></a>
          <a class="lsn-goldbtn" href="#/pray">Take it to the prayer wall <span>↗</span></a>
        </div>
      </section>
      <p class="placeholder-note"><b>Data:</b> the roster, albums, covers and playable songs ride the production catalog (${idx.artists.length} artists served). Every artist's page breaks their songs down by album, each with its official cover; songs that live outside the albums ride “More songs” — nothing is dropped, nothing is fake-assigned.</p>`;
    viewEl.querySelectorAll('[data-door]').forEach((el) => el.addEventListener('click', () => doorView(el.dataset.door)));
    wireArtistCards(viewEl);
    viewEl.querySelector('[data-gocrates]').addEventListener('click', () => scrollToId('#lsn-crates'));
    viewEl.querySelector('[data-heroplay]').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.textContent = 'Pulling the record…';
      const feat = await pickFeature();
      if (feat) {
        if (feat.group) playAlbumFor(feat.slug, feat.group, 0);
        else playArtistFrom(feat.slug, 0);
      }
      btn.textContent = '▶ Press play';
    });
    viewEl.querySelectorAll('[data-digtab]').forEach((b) =>
      b.addEventListener('click', () => { digTab = b.dataset.digtab; renderDig(); }));
    viewEl.querySelector('[data-opendir]').addEventListener('click', () => {
      digTab = 'artists'; renderDig(); scrollToId('#lsn-dig');
    });
    viewEl.querySelectorAll('[data-mixplay]').forEach((el) =>
      el.addEventListener('click', () => playDoorQueue(el.dataset.mixplay, el)));
    viewEl.querySelectorAll('[data-mixopen]').forEach((el) =>
      el.addEventListener('click', () => doorView(el.dataset.mixopen)));
    renderDig();
    fillFeature();
    if (window.FaithFilm) window.FaithFilm.wire(viewEl);
    if (window.FaithMotion) window.FaithMotion.armReveals(viewEl);
    window.__listen.ready = true;
  }

  /* Lane room (LISTEN GENRE DECLUTTER 2026-11-23): ARTISTS ONLY —
     the lane's own big hero, the lane's true counts, and the lane's
     artist card grid. No Play All, no track shelf, no song rows on
     a genre page; the music lives one tap deeper, on the artist's
     own page. (The room's former "Playable now" shelf filler was
     removed entire — no loose tracks under a genre, ever.) */
  function doorView(doorId) {
    view = { kind: 'door', id: doorId };
    const artists = laneArtists(doorId);
    const playableN = doorPlayableSum(doorId);
    /* LANE HERO FILMS (2026-11-23): the room's hero is the page's
       hero, at full hero size. When the lanes data carries a film
       for this lane it plays in the hero (FaithFilm discipline via
       data-hubfilm + wire — muted loop, plays in place, never
       recreated on repaints); until then the lane's cinematic art
       renders at the same size and carries it — no apology text.
       Under reduced motion the art stands, exactly as FaithFilm's
       own slots fall back to their still. */
    const filmPath = laneFilm(doorId);
    const film = filmPath && !(window.FaithFilm && window.FaithFilm.reduced) ? filmPath : null;
    viewEl.innerHTML = `
      <button type="button" class="btn-ghost back-btn" data-back>← All lanes</button>
      <div class="lsn-roomhero"${film ? ' data-hubfilm' : ''}>
        ${film ? `<video muted loop playsinline autoplay preload="metadata" poster="assets/img/lanes/lane-${esc(doorId)}.webp" aria-hidden="true"><source src="${esc(film)}" type="video/mp4"></video>`
          : `<img src="assets/img/lanes/lane-${esc(doorId)}.webp" alt="" onerror="this.remove()">`}
        <span class="lsn-roomveil"></span>
        <div class="lsn-roomtitle">
          <span class="lsn-eyebrow">The Lane / 16:3 Faith Presents</span>
          <h3>${esc(doorLabel(doorId))}</h3>
          <p>${artists.length ? `${artists.length} artist${artists.length === 1 ? '' : 's'} in this lane${playableN ? ` · ${playableN} playable songs` : ''}. Every song plays full.` : 'This lane is on the roster — its shelf is still gathering.'}</p>
        </div>
      </div>
      ${artists.length ? `
        <section class="lsn-roomsec"><h4>The voices in this lane</h4><div class="cards artist-grid">${artists.map(artistCard).join('')}</div></section>`
      : `<p class="lede" style="margin-top:18px">This door's shelf is still being built — its artists are on the roster and appear under All artists as their shelves are assigned. No dead end: the door says so.</p>`}`;
    viewEl.querySelector('[data-back]').addEventListener('click', doorsView);
    viewEl.querySelectorAll('[data-artist]').forEach((el) => el.addEventListener('click', () => artistView(el.dataset.artist)));
    if (film && window.FaithFilm) window.FaithFilm.wire(viewEl);
    markPlaying();
  }

  /* ---------- artist view: the ALBUM BREAKDOWN (founder law) ----------
     Songs stay grouped BY ALBUM with exact official covers; the v2
     layout (2026-11-22, founder order) presents the groups as cover
     cards sectioned by kind under one clean artist card — see the
     ARTIST PAGE v2 note inside. Queues, rows and covers are the same
     carried behavior; only the presentation layer changed. */
  async function artistView(slug) {
    view = { kind: 'artist', slug };
    const a = artistBySlug(slug);
    if (!a) { doorsView(); return; }
    const p = await loadPlayable(slug);
    const alb = await loadAlbums(slug);
    const tracks = p.tracks;
    const groups = alb && Array.isArray(alb.albums) ? alb.albums : null;
    const more = alb && Array.isArray(alb.more) ? alb.more : tracks.map((_, i) => i);
    window.__listen.lastArtist = {
      slug, groups: groups ? groups.length : 0,
      matched: tracks.length - more.length, more: more.length, playable: tracks.length,
    };
    /* LISTEN DATA CURE: the header's playable count, paired with the
       catalog song count, is playable ROWS across the album groups
       (never the pool size — Cross Worship read "3 songs · 50
       playable" when none of his 3 catalog songs had a row binding).
       ONE-RULER CURE (2026-11-23): the More-songs rows ride the same
       count — every More track plays, so the header is Σ group pr +
       More rows, exactly the card's playableRows + morePlayable.
       The flat fallback has no groups; its shelf IS the pool. */
    const headerPlayable = groups ? groups.reduce((s, g) => s + (g.pr || 0), 0) + more.length : tracks.length;

    const kindLabel = (k) => (k === 'ep' ? 'EP' : k === 'single' ? 'Single' : 'Album');
    /* Display order (ChatGPT consult chatcmpl-Em8JK5jpNTSdU3crG2gbxSwMNGTjF):
       discography order, oldest first, singles/EPs interleaved by year;
       unknown years ride the tail in source order. */
    const ordered = groups
      ? groups.map((g, i) => ({ g, i })).sort((x, y) =>
          ((x.g.year == null) - (y.g.year == null)) || ((x.g.year || 0) - (y.g.year || 0)) || (x.i - y.i))
      : [];
    ordered.forEach((it, pos) => { it.pos = pos; });

    /* ---------- ARTIST PAGE v2 — clean card + releases by kind ----------
       Founder order 2026-11-22 15:54 MST: "artists need a much cleaner
       artist card. Also, you should make this in cards by singles,
       albums, misc... because the playlist is too long." Design ruled
       with ChatGPT consult chatcmpl-EnBOpDDeNVN3udvKd3yD5eawXQTH4:
       FIXED section order Albums → Singles → Misc; cover-card grids;
       "Show more" in place (6 phone / 12 desktop per step); a per-artist
       filter as the findability guard. Sections classify by TRACK COUNT
       at render (Albums 7+ · Singles 1–2 · Misc = EPs 3–6 and any other
       kind). A card tap opens that release's album-group track view in
       place (the same playable rows, queues and covers as the retired
       row list — ALBUM BREAKDOWN LAW behavior unchanged); Back returns
       to the same section and scroll position. Unmatched tracks keep
       the honest "More songs" group after the sections. */
    const sectionOf = (g) => (g.n >= 7 ? 'albums' : g.n <= 2 ? 'singles' : 'misc');
    const SECTIONS = [
      { id: 'albums', label: 'Albums' },
      { id: 'singles', label: 'Singles' },
      { id: 'misc', label: 'Misc' },
    ];
    const totalTracks = groups ? groups.reduce((s, g) => s + g.n, 0) : a.songs;
    const kindCounts = { albums: 0, singles: 0, misc: 0 };
    if (groups) ordered.forEach(({ g }) => { kindCounts[sectionOf(g)] += 1; });

    /* Per-artist UI state — survives repaints inside this hub mount:
       Show-more depth per section, the open release, the filter text. */
    const ui = artistUi[slug] || (artistUi[slug] = { shown: {}, openOi: -2, filter: '', moreOpen: false });
    const stepFor = () => (window.innerWidth <= 700 ? 6 : 12);
    if (ui.openOi === -2) {
      /* Default expansion: the first album with playable songs. */
      let d = ordered.findIndex(({ g }) => g.kind === 'album' && g.play.length);
      if (d < 0) d = ordered.findIndex(({ g }) => g.play.length);
      ui.openOi = d; /* -1 = nothing open */
      if (d >= 0) {
        const secId = sectionOf(ordered[d].g);
        const posInSec = ordered.filter(({ g }) => sectionOf(g) === secId).findIndex((it) => it.pos === d);
        ui.shown[secId] = Math.max(stepFor(), posInSec + 1);
      }
    }

    function trackRows(g, oi) {
      /* LISTEN DATA CURE: playable ROWS (row.p bindings + row.x pool
         rows) render as playable buttons; unbound rows render static —
         carried behavior-identical from the retired row list.
         LISTEN HONESTY CURE (2026-11-23): static rows now SAY so —
         dimmed title + a "Not yet playable" marker, so no tap ever
         dies silently again. */
      const posInPlay = new Map(g.play.map((ti, pi) => [ti, pi]));
      return g.rows.map((row, li) => {
        if (row.p && row.p.length) {
          return row.p.map((ti, k) => `
          <button type="button" class="trow" data-track="${esc(tracks[ti].y)}" data-albrow="${oi}" data-pos="${posInPlay.get(ti)}">
            <span class="tnum">${li + 1}</span><span class="ttitle">${esc(k === 0 ? row.t : tracks[ti].t)}</span>
            ${tracks[ti].d ? `<span class="tdur">${fmtDur(tracks[ti].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('');
        }
        if (row.x != null && tracks[row.x]) {
          return `<button type="button" class="trow" data-track="${esc(tracks[row.x].y)}" data-xrow="${row.x}">
            <span class="tnum">${li + 1}</span><span class="ttitle">${esc(row.t)}</span>
            ${tracks[row.x].d ? `<span class="tdur">${fmtDur(tracks[row.x].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`;
        }
        return `<div class="trow static"><span class="tnum">${li + 1}</span><span class="ttitle">${esc(row.t)}</span><span class="tnotplay">Not yet playable</span></div>`;
      }).join('');
    }

    function albumDetail(it) {
      const { g } = it, oi = it.pos;
      /* LISTEN DATA CURE: the playable count is playable ROWS (g.pr,
         baked) — never bound recordings (g.play.length). */
      const playableN = g.pr;
      const meta = [g.year || '', kindLabel(g.kind), `${g.n} track${g.n === 1 ? '' : 's'}`,
        playableN === 0 ? 'none playable yet'
        : playableN !== g.n ? `${playableN} of ${g.n} playable` : ''].filter(Boolean).join(' · ');
      return `<div class="rel-card alb-card" data-albcard="${oi}">
        <div class="rel-head">
          <span class="alb-cover">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(g.title))}</span>`}</span>
          <div class="alb-meta"><b>${esc(g.title)}</b><span>${esc(meta)}</span></div>
          ${g.play.length ? `<button type="button" class="btn-gold alb-play" data-albplay="${oi}" aria-label="Play ${esc(g.title)}">▶</button>` : ''}
          <button type="button" class="btn-ghost alb-toggle" data-detailback>← Releases</button>
        </div>
        <div class="alb-body" data-albbody="${oi}">
          ${g.rows.length ? `<div class="trows mini">${trackRows(g, oi)}</div>`
            : `<p class="lede alb-note">${g.n} tracks in the catalog — this tracklist rides the next catalog pass; the artist's playable songs live in the other groups and in More songs.</p>`}
        </div>
      </div>`;
    }

    function gridCard(it) {
      const { g } = it, oi = it.pos;
      const open = ui.openOi === oi;
      return `<button type="button" class="rgc" data-relcard="${oi}" aria-expanded="${open}">
        <span class="rgc-art">${g.cover ? `<img loading="lazy" src="${esc(g.cover)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(g.title))}</span>`}</span>
        <span class="rgc-title">${esc(g.title)}</span>
        <span class="rgc-meta">${[g.year || '', `${g.n} track${g.n === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</span>
      </button>`;
    }

    function moreCardHtml() {
      if (!more.length) return '';
      return `<div class="rel-card alb-card" data-morecard>
        <div class="rel-head">
          <div class="alb-meta"><b>More songs</b><span>${more.length} song${more.length === 1 ? '' : 's'}</span></div>
          <button type="button" class="btn-gold alb-play" data-moreplay aria-label="Play more songs">▶</button>
          <button type="button" class="btn-ghost alb-toggle" data-moretoggle aria-expanded="${ui.moreOpen}">${ui.moreOpen ? 'Hide tracks' : 'Tracks'}</button>
        </div>
        <p class="lede alb-note">Live recordings, features and one-offs that live outside the albums — every one plays full.</p>
        <div class="alb-body" data-morebody ${ui.moreOpen ? '' : 'hidden'}><div class="trows mini">${more.map((ti, k) => `
          <button type="button" class="trow" data-track="${esc(tracks[ti].y)}" data-morerow="${k}">
            <span class="tnum">${k + 1}</span><span class="ttitle">${esc(tracks[ti].t)}</span>
            ${tracks[ti].d ? `<span class="tdur">${fmtDur(tracks[ti].d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('')}</div></div>
      </div>`;
    }

    const dataNote = `<p class="placeholder-note"><b>Data:</b> albums, covers and tracklists ride the production catalog plus the album-map harvest. Every playable song plays full from YouTube; songs that live outside the albums ride “More songs” — nothing is dropped, nothing is fake-assigned.</p>`;

    const flatShelf = `
      <div class="shelf"><h3>Songs — playable now <span class="shelf-count">${tracks.length}</span></h3>
      ${tracks.length ? `
        <button type="button" class="btn-gold" data-playall>▶ Play all</button>
        <div class="trows">${tracks.map((t, i) => `
          <button type="button" class="trow" data-track="${esc(t.y)}" data-flatrow="${i}">
            <span class="tnum">${i + 1}</span><span class="ttitle">${esc(t.t)}</span>
            ${t.d ? `<span class="tdur">${fmtDur(t.d)}</span>` : ''}
            <span class="tplay">▶</span>
          </button>`).join('')}</div>`
      : `<p class="lede">This artist's playable songs are still being bound to the catalog.</p>`}
      </div>`;

    function playAlbum(oi, pos) {
      const { g } = ordered[oi];
      /* LISTEN DATA CURE: album cover only — no artist-art fallback
         (see playAlbumFor). Null cover = the album's honest monogram. */
      const q = queueFromTracks(g.play.map((ti) => tracks[ti]), a.name, g.cover);
      if (q.length) player.playQueue(q, pos, g.title);
    }
    function playMore(pos) {
      const q = queueFromTracks(more.map((ti) => tracks[ti]), a.name, a.art);
      if (q.length) player.playQueue(q, pos, 'More songs');
    }

    function paintSections() {
      const host = viewEl.querySelector('#artist-sections');
      if (!host) return;
      const f = norm(ui.filter);
      const filtering = f.length > 0;
      let matchTotal = 0;
      const secsHtml = SECTIONS.map((sec) => {
        let items = ordered.filter(({ g }) => sectionOf(g) === sec.id);
        if (!items.length) return '';
        if (filtering) {
          items = items.filter(({ g }) => norm(g.title).includes(f));
          matchTotal += items.length;
          if (!items.length) return '';
          return `<section class="rel-sec" data-section="${sec.id}">
            <div class="rel-sec-head"><h3>${sec.label} <span class="shelf-count">${kindCounts[sec.id]}</span></h3>
            <span class="rel-sec-note">${items.length} match${items.length === 1 ? '' : 'es'}</span></div>
            <div class="rel-grid">${items.map(gridCard).join('')}</div>
          </section>`;
        }
        const shownN = Math.min(ui.shown[sec.id] || stepFor(), items.length);
        const openItem = items.find((it) => it.pos === ui.openOi);
        return `<section class="rel-sec" data-section="${sec.id}">
          <div class="rel-sec-head"><h3>${sec.label} <span class="shelf-count">${items.length}</span></h3>
          <span class="rel-sec-note">Showing ${shownN} of ${items.length}</span></div>
          <div class="rel-grid">${items.slice(0, shownN).map(gridCard).join('')}</div>
          ${openItem ? `<div class="rel-detail">${albumDetail(openItem)}</div>` : ''}
          ${shownN < items.length ? `<div class="rel-more-row"><button type="button" class="btn-ghost" data-showmore="${sec.id}">Show more</button><span class="rel-more-note">${items.length - shownN} more in ${sec.label}</span></div>` : ''}
        </section>`;
      }).join('');
      host.innerHTML = (filtering && !matchTotal)
        ? `<p class="lede rel-nomatch">No releases match “${esc(ui.filter)}” — clear the filter to see the full shelf.</p>`
        : secsHtml + moreCardHtml() + dataNote;
      wireSections();
    }

    function wireSections() {
      viewEl.querySelectorAll('[data-relcard]').forEach((el) =>
        el.addEventListener('click', () => {
          const oi = +el.dataset.relcard;
          const wasOpen = ui.openOi === oi;
          ui.openOi = wasOpen ? -1 : oi;
          paintSections();
          const target = wasOpen
            ? viewEl.querySelector(`[data-relcard="${oi}"]`)
            : viewEl.querySelector('.rel-detail');
          if (target) target.scrollIntoView({ block: 'nearest' });
        }));
      viewEl.querySelectorAll('[data-showmore]').forEach((el) =>
        el.addEventListener('click', () => {
          const sec = el.dataset.showmore;
          ui.shown[sec] = (ui.shown[sec] || stepFor()) + stepFor();
          paintSections();
        }));
      viewEl.querySelectorAll('[data-albplay]').forEach((el) =>
        el.addEventListener('click', () => playAlbum(+el.dataset.albplay, 0)));
      viewEl.querySelectorAll('[data-albrow]').forEach((el) =>
        el.addEventListener('click', () => playAlbum(+el.dataset.albrow, +el.dataset.pos)));
      viewEl.querySelectorAll('[data-xrow]').forEach((el) =>
        el.addEventListener('click', () => playArtistFrom(slug, +el.dataset.xrow)));
      viewEl.querySelectorAll('[data-morerow]').forEach((el) =>
        el.addEventListener('click', () => playMore(+el.dataset.morerow)));
      const morePlayBtn = viewEl.querySelector('[data-moreplay]');
      if (morePlayBtn) morePlayBtn.addEventListener('click', () => playMore(0));
      const moreToggle = viewEl.querySelector('[data-moretoggle]');
      if (moreToggle) moreToggle.addEventListener('click', () => { ui.moreOpen = !ui.moreOpen; paintSections(); });
      viewEl.querySelectorAll('[data-detailback]').forEach((el) =>
        el.addEventListener('click', () => {
          const oi = ui.openOi;
          ui.openOi = -1;
          paintSections();
          const card = viewEl.querySelector(`[data-relcard="${oi}"]`);
          if (card) card.scrollIntoView({ block: 'nearest' });
        }));
      markPlaying();
    }

    const countsLine = groups
      ? `<b>${kindCounts.albums}</b> Albums · <b>${kindCounts.singles}</b> Singles · <b>${totalTracks}</b> Tracks`
      : `${a.songs} songs in the catalog`;
    viewEl.innerHTML = `
      <button type="button" class="btn-ghost back-btn" data-back>← Back</button>
      <div class="artist-card">
        <span class="acard-art big">${a.art ? `<img src="${esc(a.art)}" alt="" onerror="this.remove()">` : `<span class="acard-mono">${esc(monogram(a.name))}</span>`}</span>
        <div class="artist-card-main">
          <h2>${esc(a.name)}</h2>
          <p class="artist-counts">${countsLine}</p>
          <p class="artist-sub">${headerPlayable ? `${headerPlayable} playable` : 'songs listed · playable songs coming'}${a.door ? ` · ${esc(doorLabel(a.door))}` : ''}</p>
          <div class="artist-card-actions">
            ${groups && tracks.length ? `<button type="button" class="btn-gold" data-playall>▶ Play all — ${esc(a.name)}</button>` : ''}
            ${groups && groups.length > 8 ? `<label class="rel-filter"><input type="search" data-relfilter placeholder="Find a release…" aria-label="Find a release" value="${esc(ui.filter)}"></label>` : ''}
          </div>
        </div>
      </div>
      ${groups ? `<div id="artist-sections"></div>` : flatShelf}`;
    viewEl.querySelector('[data-back]').addEventListener('click', () => (a.door ? doorView(a.door) : doorsView()));
    const playAllBtn = viewEl.querySelector('[data-playall]');
    if (playAllBtn) playAllBtn.addEventListener('click', () => playArtistFrom(slug, 0));
    const filterEl = viewEl.querySelector('[data-relfilter]');
    if (filterEl) filterEl.addEventListener('input', () => { ui.filter = filterEl.value; paintSections(); });
    if (groups) {
      paintSections();
    } else {
      viewEl.querySelectorAll('[data-flatrow]').forEach((el) =>
        el.addEventListener('click', () => playArtistFrom(slug, +el.dataset.flatrow)));
      markPlaying();
    }
  }

  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim();
    if (view.kind !== 'doors') { doorsView(); }
    else renderDig();
  });

  Promise.all([loadIndex(), loadLanes()]).then(doorsView).catch((e) => {
    viewEl.innerHTML = `<p class="lede">The Sanctuary index didn't load (${esc(String(e).slice(0, 80))}). The doors will open on a fresh visit once it does.</p>`;
  });
}
