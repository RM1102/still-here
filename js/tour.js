/* Still Here: the guided tour (25 Oct evening; plan in TOUR-PLAN.md).
   A small card beside one lit-up control, the rest of the page dimmed a little. Short (3 to 5 cards), skippable at every
   step (Skip, Esc), and remembered in this browser only ("stillhere-tour-v1" in localStorage; nothing is sent anywhere).
   The first time someone arrives they see one card: where they are, Desktop / Phone, and Reset. Then they choose: a short
   tour of this screen (or of the whole app) or Skip. Later visits get at most a small chip, or a "welcome back" card.
   Built here rather than with a library: the permissive one (driver.js, MIT) has no phone sheet and misses scrolling inside
   the phone frame; Intro.js and Shepherd are AGPL. Research notes: TOUR-PLAN.md. */
(function (RC) {
  const KEY = "stillhere-tour-v1", AWAY = 30 * 60 * 1000;
  const PAGE = RC.app ? "app" : RC.govUI ? "gov" : RC.contrib ? "contrib" : null;
  if (!PAGE) return;
  let mem = { intro: {}, done: {}, visits: 0 };
  try { mem = Object.assign(mem, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const narrow = () => window.innerWidth < 760 || (matchMedia("(pointer: coarse)").matches && window.innerHeight < 500);
  const I = (n, s) => RC.icon ? RC.icon(n, s || 16) : "";

  /* ---------- finding what to light up ---------- */
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  const pick = sel => [...document.querySelectorAll(sel)].find(visible) || null;
  const closest = (sel, up) => () => { const e = pick(sel); return e ? e.closest(up) || e : null; };
  // A target is a selector, a function returning an element, or a list of selectors (lit up together)
  function resolve(t) {
    if (!t) return null;
    if (typeof t === "function") return t();
    if (Array.isArray(t)) { const els = t.map(pick).filter(Boolean); return els.length ? els : null; }
    return pick(t);
  }
  function clipBox(e) {
    let r = e.getBoundingClientRect(), l = r.left, t = r.top, R = r.right, B = r.bottom;
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowY; if (o !== "auto" && o !== "scroll" && o !== "hidden") continue;
      const q = p.getBoundingClientRect(); l = Math.max(l, q.left); t = Math.max(t, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); }
    return { left: l, top: t, right: Math.max(l, R), bottom: Math.max(t, B) };
  }
  function rectOf(target) {
    const rs = (Array.isArray(target) ? target : [target]).map(clipBox);
    const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom));
    return { left: l, top: t, width: r - l, height: b - t, right: r, bottom: b };
  }

  /* ---------- the first card: where you are, Desktop / Phone, Reset ---------- */
  const WHERE = {
    "#alert": ["You're on the morning alert", "The government's 6 am alert. You are Sunita, 50, in Delhi. Her granddaughter Meera, 3, is alone in Mumbai."],
    "#child": ["You're on the child alert", "The 6 am government alert first asks who is holding the phone. If it's a child, they get a simpler screen, read aloud."],
    "#home": ["You're on Your people", "Sunita's family: who is safe, who is missing, and the two who need someone now."],
    "#welcome": ["You're on How Still Here works", "What Still Here does, in three steps, before Sunita sees her people."],
    "#map": ["You're on the map", "Each ward of Delhi, coloured by how many children left alone now have someone."],
    "#cases": ["You're on Cases", "Every child or elder Sunita is linked to who has nobody with them."],
    "#case-meera": ["You're on Meera's case", "Who was messaged about Meera, when, and who is going."],
    "#help": ["You're on Help is coming", "Supplies on the way, and what is open near Sunita."],
    gov: ["You're in the control room", "The government's view, as a district officer like Arvind Rao would use it. Restricted in real life; everything here is simulated."],
    contrib: ["You're in the contributor portal", "For clinics, kitchens, ration shops and shelters. A verified place says what it has, so people go where help is."]
  };
  const keyFor = () => PAGE === "app" ? RC.app.route() : PAGE;
  function introStep() {
    const k = keyFor(), w = WHERE[k] || ["You're in Still Here", "A prototype for the morning after half of everyone vanished. You are Sunita, 50, in Delhi."];
    const keys = PAGE === "app"
      ? (narrow() ? `<li><b>${I("rotate-ccw", 14)} Reset</b> starts the story again from the 6 am alert and clears what you did.</li>`
        : `<li><b>Desktop · Phone</b> shows the same app as on a laptop, or inside a phone.</li><li><b>Reset</b> starts the story again from the 6 am alert and clears what you did.</li>`)
      : PAGE === "gov" ? `<li><b>The tabs</b> along the top are its eight views.</li><li><b>Reset</b> puts every view back as it was at 7:10 am.</li>`
      : `<li><b>Reset</b> clears your updates and puts every place back as it was.</li>`;
    const target = PAGE === "app" ? ".topbar .tools" : PAGE === "gov" ? ".hdr-r" : ".ctour";
    return { intro: true, target, title: w[0], html: `<p>${esc(w[1])}</p><ul class="tour-keys">${keys}</ul>` };
  }

  /* ---------- the tours: 3 to 5 cards each, counting the first card ---------- */
  const A = (name, d) => () => RC.app.act(name, d);
  let selfNav = false;
  const go = h => () => { if (location.hash !== h) { selfNav = true; RC.app.go(h); } };
  const msgs = () => pick(".inspector #pane-thread") || pick(".msgbtn");
  // Lata's phone: answerable when the Messages panel is on screen; otherwise answer after the tour
  const lataText = () => pick(".inspector #pane-thread") ? "Lata, Meera's nanny, got Meera's case on WhatsApp, in Marathi. Answer as Lata to see what happens. Demo Path, at the top, lists 12 steps to try."
    : "Lata, Meera's nanny, got Meera's case on WhatsApp. After the tour, tap Messages and answer as Lata.";
  const SAFE = "One tap tells Sunita's family she is safe. A short page then explains how Still Here works.";
  const NEED = "Meera, 3, and Kamla, 78, are alone. Meera's people have been messaged. Sunita lives nearest Kamla, so she's asked first.";
  const mapSearch = () => { const m = pick("#mapsearch"), r = m && m.querySelector(".results"); return m && m.classList.contains("open") && r && r.offsetHeight ? [m, r] : m; };
  const TOURS = {
    "#child": [
      { before: A("kidwho", { v: "" }), target: ".galert", title: "Who is holding this phone?", text: "The alert asks first, because a child may have picked up a parent's phone. Read aloud says it in English and in Hindi; turn your sound on and try it.", play: ["Read Aloud", A("kidsay")] },
      { before: A("kidwho", { v: "" }), target: ".ga-btns", title: "A grown-up or a child", text: "A grown-up goes on to Still Here and taps I'm Safe. A child gets a simpler screen. Next, the tour taps “I'm a child” for you." },
      { before: A("kidwho", { v: "child" }), target: ".ga-btns", title: "Are you okay?", text: "Two big buttons, no reading needed: a grown-up is with me, or I'm alone." },
      { before: A("kid", { v: "alone" }), target: ".ga-code", title: "Help is coming", text: "Stay inside. The grown-up who comes will say this word, so the child knows whom to open the door for. “Show the Alert Again” starts over.", last: true }],
    "#alert": [
      { target: ".alert-row", title: "The 6 am alert", text: "From the government's verified sender, so it reaches every phone, even a basic one by SMS." },
      { target: '[data-action="enter"]', title: "I'm Safe", text: SAFE },
      { target: 'a.btn[href="#onmyown"]', title: "If you're on your own", text: "For a child, or anyone who can't manage alone: what to do and who is coming.", last: true }],
    "#welcome": [
      { target: ".group.tiles", title: "Three things, in order", text: "Your people, anyone left alone, and someone they know going to them." },
      { target: '[data-action="welcomed"]', title: "Show me my people", text: "This opens Sunita's family.", last: true }],
    "#home": [
      { target: closest('a[href="#case-meera"]', ".group"), title: "Needs you now", text: NEED },
      { target: closest('[data-action="checkin"]', ".r"), title: "Who's here", text: "A green dot means their phone is in use, so they are here. “Ask If They're OK” sends them a message." },
      { target: msgs, title: "Lata's phone", text: lataText, last: true }],
    "#map": [
      { target: "#pubmap", title: "Are children near me safe?", text: "Each ward of Delhi, coloured by how many children left alone now have someone. Hover or tap a ward." },
      { target: closest('[data-action="time"]', ".seg"), title: "Pick a time", text: "Tap 8 pm, Day 2 or Day 3 to see more children reached." },
      { target: mapSearch, title: "Search", text: "Type a city or a ward anywhere in India.", last: true }]
  };
  // The whole app in four cards (after the first one)
  const FULL_DESKTOP = [
    { before: go("#alert"), target: '[data-action="enter"]', title: "Start here: I'm Safe", text: SAFE },
    { before: go("#home"), target: closest('a[href="#case-meera"]', ".group"), title: "Needs you now", text: NEED },
    { target: msgs, title: "Lata's phone", text: lataText },
    { target: ".sidebar .nav", title: "Everything else", text: "The map is under Around you. Tools has Is this true?, the chat bot and the offline kit. Other portals has the Government view and the contributor portal. This tour is under Help.", last: true }];
  const FULL_PHONE = [
    { before: go("#alert"), target: '[data-action="enter"]', title: "Start here: I'm Safe", text: SAFE },
    { before: go("#home"), target: closest('a[href="#case-meera"]', ".group"), title: "Needs you now", text: NEED },
    { target: msgs, title: "Lata's phone", text: lataText },
    { target: () => pick("#mobilenav") || pick("#tabbar"), title: "The tab bar", text: "People, Cases, the map and Help. More has the tools, the child alert, the other portals and this tour.", last: true }];
  const GOV = [
    { before: () => RC.govUI.page("situation"), target: "#tabs", title: "Eight views", text: "The situation now, how we're doing, resources, the network, homes and sites, information, fairness and the law, and the world." },
    { target: () => narrow() ? pick(".filters") : [pick(".filters"), pick(".kpis")].filter(Boolean), title: "Time and the numbers that matter", text: "Pick a time, up to Day 3, to spot gaps before they open. In red: small children nobody is coming for." },
    { target: ".queue", title: "Needs action", text: "Problems ranked by urgency, each with a plan and the teams free now. One tap sends a team." },
    { target: ".mapzone .stage", title: "The red map", text: "Red wards have children nobody is coming for yet. Tap or click a ward, or a problem, to see it.", last: true }];
  const CONTRIB = [
    { target: ".clist", title: "Your places", text: "Pick a place to update it, or add a new one. New places are checked before the public sees them." },
    { target: () => { const r = [...document.querySelectorAll(".form .r")].filter(visible).slice(0, 2); return r.length ? r : null; }, title: "Your update", text: "Open or closed, the queue, what you have and what you need. Publish Update shows it for 4 hours." },
    { target: () => { const h = [...document.querySelectorAll(".secthead h2")].find(x => /public sees/i.test(x.textContent)); return h ? h.closest(".secthead").nextElementSibling : null; }, title: "What the public sees", text: "Stock shows only after a second source agrees.", last: true }];
  const screenTour = () => PAGE === "gov" ? GOV : PAGE === "contrib" ? CONTRIB : TOURS[RC.app.route()] || null;
  const fullTour = () => PAGE === "gov" ? GOV : PAGE === "contrib" ? CONTRIB : (narrow() ? FULL_PHONE : FULL_DESKTOP);
  const tourId = steps => PAGE + ":" + (steps === FULL_DESKTOP || steps === FULL_PHONE ? "full" : PAGE === "app" ? RC.app.route() : "page");

  /* ---------- the card ---------- */
  let cur = null;   // { steps, i, id }
  let dim, ring, card, status, chip, tick, watch, retry = 0, back = null;
  function build() {
    if (card) return;
    dim = document.createElement("div"); dim.className = "tour-dim";
    dim.innerHTML = `<svg width="100%" height="100%" aria-hidden="true"><path fill-rule="evenodd"/></svg>`;
    ring = document.createElement("div"); ring.className = "tour-ring";
    card = document.createElement("div"); card.className = "tour-card";
    card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true"); card.setAttribute("aria-labelledby", "tour-h"); card.setAttribute("aria-describedby", "tour-b");
    status = document.createElement("div"); status.className = "tour-sr"; status.setAttribute("aria-live", "polite");
    document.body.append(dim, ring, card, status);
    // A click on the dimmed page doesn't end the tour; the card gives a small nudge and takes focus back
    dim.addEventListener("click", () => { card.classList.add("nudge"); setTimeout(() => card.classList.remove("nudge"), 400); focusCard(); });
    card.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (!b) return; e.preventDefault(); e.stopPropagation(); ACT[b.dataset.t] && ACT[b.dataset.t](); });
  }
  const focusCard = () => { const f = card && (card.querySelector(".btn-prominent") || card.querySelector(".btn")); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} };
  function hide() {
    if (!card) return; [dim, ring, card].forEach(x => x.classList.remove("on")); document.body.classList.remove("touring");
    clearInterval(tick); if (watch) watch.disconnect();
    if (back && back !== document.body && document.contains(back)) try { back.focus({ preventScroll: true }); } catch (e) {}
  }
  function finish(how) {
    if (cur) { mem.done[cur.id] = how || "done"; mem.intro[PAGE] = true; save(); }
    if (window.ReadAloud) try { ReadAloud.stop(); } catch (e) {}
    if (cur && cur.scrolls) cur.scrolls.forEach(([el, y]) => { if (document.contains(el)) el.scrollTop = y; });
    if (window.scrollX) window.scrollTo(0, window.scrollY);
    cur = null; hide();
  }
  const ACT = {
    next() { if (!cur || Date.now() - (cur.at || 0) < 350) return; if (cur.i >= cur.steps.length - 1) return finish("done"); cur.i++; show(); },
    back() { if (!cur || cur.i === 0 || cur.steps[cur.i - 1].intro || Date.now() - (cur.at || 0) < 350) return; cur.i--; show(); },
    skip() { finish("skipped"); },
    play() { const s = cur && cur.steps[cur.i]; if (s && s.play) s.play[1](); },
    full() { start(fullTour(), { intro: false }); },
    this() { const t = screenTour(); if (t) start(t, { intro: false }); else finish("done"); },
    close() { const c = document.querySelector(".tour-wb"); if (c) c.remove(); }
  };
  function start(steps, o) {
    build(); hideChip(); ACT.close();
    const list = (o && o.intro ? [introStep()] : []).concat(steps || []);
    if (!list.length) return;
    if (!cur) back = document.activeElement;
    cur = { steps: list, i: 0, id: tourId(steps || []), scrolls: [".sidebar", ".main", ".cside", ".clist", "#pview"].map(q => document.querySelector(q)).filter(Boolean).map(el => [el, el.scrollTop]) };
    if (o && o.intro) { mem.intro[PAGE] = true; save(); }
    // Keep the ring on its control while the app redraws, scrolls or resizes (only while a tour is open)
    clearInterval(tick); tick = setInterval(reflow, 500);
    if (window.MutationObserver) { if (watch) watch.disconnect(); watch = new MutationObserver(reflow); watch.observe(document.body, { childList: true, subtree: true }); }
    show();
  }
  function show() {
    const s = cur.steps[cur.i]; retry = 0; cur.at = Date.now();
    if (s.before && window.ReadAloud) try { ReadAloud.stop(); } catch (e) {}
    try { if (s.before) { if (s.before.length === 0) selfNav = true; s.before(); } } catch (e) {}
    setTimeout(() => { selfNav = false; }, 300);
    setTimeout(() => place(true), s.before ? 220 : 30);
  }
  function buttons(s) {
    const n = cur.steps.length, last = cur.i === n - 1;
    if (s.intro) {
      const rest = cur.steps.length > 1;
      const more = PAGE === "app" && !rest && screenTour() ? `<button class="btn btn-compact btn-prominent" data-t="this">Show Me This Screen</button>` : "";
      const full = PAGE === "app" && !rest ? `<button class="btn btn-compact${more ? "" : " btn-prominent"}" data-t="full">Take the Tour</button>` : "";
      return rest ? `<button class="btn btn-compact btn-prominent" data-t="next">Show Me Around</button><button class="btn btn-compact btn-plain" data-t="skip">Skip</button>`
        : `${more}${full}<button class="btn btn-compact btn-plain" data-t="skip">${more || full ? "Skip" : "Got It"}</button>`;
    }
    return `${cur.i > 0 && !cur.steps[cur.i - 1].intro ? `<button class="btn btn-compact btn-plain" data-t="back">Back</button>` : ""}${s.play ? `<button class="btn btn-compact" data-t="play">${I("volume-2", 15)}${esc(s.play[0])}</button>` : ""}<span class="tour-sp"></span><button class="btn btn-compact btn-prominent" data-t="next">${last ? "Done" : "Next"}</button>`;
  }
  function place(scroll) {
    if (!cur) return;
    const s = cur.steps[cur.i], target = resolve(s.target), n = cur.steps.filter(x => !x.intro).length, k = cur.steps.slice(0, cur.i + 1).filter(x => !x.intro).length;
    // A control that the app is still drawing: look again for up to 1.5 s before showing the card on its own
    if (!target && s.target && retry < 6) { retry++; setTimeout(() => place(scroll), 250); return; }
    card.innerHTML = `<button class="tour-x" data-t="skip" aria-label="Skip the tour">${I("x", 16)}</button>
      <div class="tour-meta">${s.intro ? "Welcome" : `${k} of ${n}`}${s.intro ? "" : `<button class="tour-skip" data-t="skip">Skip tour</button>`}</div>
      <h3 id="tour-h">${esc(s.title)}</h3><div id="tour-b">${s.html || `<p>${esc(typeof s.text === "function" ? s.text() : s.text)}</p>`}</div><div class="tour-btns">${buttons(s)}</div>`;
    status.textContent = s.intro ? s.title : `Step ${k} of ${n}: ${s.title}`;
    [dim, ring, card].forEach(x => x.classList.add("on")); document.body.classList.add("touring");
    if (target && scroll) { const el = Array.isArray(target) ? target[0] : target, r = rectOf(target), H = window.innerHeight;
      const tb = document.querySelector(".topbar, .hdr"), nav = pick("#mobilenav"), topLim = (tb ? tb.getBoundingClientRect().bottom : 0) + 8, botLim = (nav ? nav.getBoundingClientRect().top : H) - 8;
      if (!el.closest(".topbar, .hdr, .sidebar") && (r.top < topLim || r.bottom > botLim)) try { el.scrollIntoView({ block: r.height > H * 0.6 ? "start" : "center", behavior: "auto" }); } catch (e) {} }
    position(target); focusCard();
  }
  // The dimmed page with a rounded hole over the control, drawn as one path so clicks on the dim are caught and clicks in the hole go through
  const holePath = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  function position(target) {
    const W = window.innerWidth, H = window.innerHeight, pad = 6, path = dim.querySelector("path");
    let r = target ? rectOf(target) : null;
    if (r && (r.bottom < 0 || r.top > H || r.width === 0)) r = null;
    let hole = null;
    if (r) { const x = Math.max(2, r.left - pad), y = Math.max(2, r.top - pad); hole = { x, y, w: Math.min(W - 2, r.right + pad) - x, h: Math.min(H - 2, r.bottom + pad) - y }; }
    path.setAttribute("d", `M0 0H${W}V${H}H0Z` + (hole ? " " + holePath(hole.x, hole.y, hole.w, hole.h, Math.min(12, hole.h / 2, hole.w / 2)) : ""));
    ring.style.display = hole ? "" : "none";
    if (hole) { ring.style.left = hole.x + "px"; ring.style.top = hole.y + "px"; ring.style.width = hole.w + "px"; ring.style.height = hole.h + "px"; }
    card.classList.toggle("sheet", narrow());
    const m = 12;
    if (narrow()) {   // a sheet at the bottom, or at the top when the lit-up control is low on the screen
      const top = document.querySelector(".topbar, .hdr"), tb = top ? top.getBoundingClientRect().bottom : 0, nav = pick("#mobilenav");
      const low = hole && hole.y > H - (hole.y + hole.h);   // more room above the control than below it
      card.style.left = m + "px"; card.style.right = m + "px"; card.style.width = "auto";
      card.style.top = low ? Math.max(m, Math.min(tb + 10, hole.y - card.offsetHeight - m)) + "px" : ""; card.style.bottom = low ? "" : `calc(${m + (nav ? 76 : 0)}px + env(safe-area-inset-bottom))`;
      return;
    }
    card.style.right = ""; card.style.bottom = ""; card.style.width = "";
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let x, y;
    if (!hole) { x = (W - cw) / 2; y = (H - ch) / 2; }
    else {
      const below = H - (hole.y + hole.h), above = hole.y, right = W - (hole.x + hole.w), left = hole.x;
      if (below >= ch + m * 2) { y = hole.y + hole.h + m; x = hole.x + hole.w / 2 - cw / 2; }
      else if (above >= ch + m * 2) { y = hole.y - ch - m; x = hole.x + hole.w / 2 - cw / 2; }
      else if (right >= cw + m * 2) { x = hole.x + hole.w + m; y = hole.y + hole.h / 2 - ch / 2; }
      else if (left >= cw + m * 2) { x = hole.x - cw - m; y = hole.y + hole.h / 2 - ch / 2; }
      else { x = hole.x + hole.w - cw - m; y = hole.y + hole.h - ch - m; }   // a very large control (the map): inside its corner
    }
    card.style.left = Math.round(Math.max(m, Math.min(W - cw - m, x))) + "px";
    card.style.top = Math.round(Math.max(m, Math.min(H - ch - m, y))) + "px";
  }
  let queued = false;
  const reflow = () => { if (!cur || queued) return; queued = true; requestAnimationFrame(() => { queued = false; if (cur) position(resolve(cur.steps[cur.i].target)); }); };
  window.addEventListener("resize", reflow); window.addEventListener("scroll", reflow, true);
  if (window.visualViewport) { visualViewport.addEventListener("resize", reflow); visualViewport.addEventListener("scroll", reflow); }
  window.addEventListener("hashchange", () => { hideChip(); if (cur && !selfNav) finish("left"); selfNav = false; setTimeout(reflow, 80); });
  // Keys: Esc skips, arrows move, Tab stays inside the card. Never while someone is typing in a field.
  document.addEventListener("keydown", e => {
    if (!cur) return;
    const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) && !card.contains(t)) return;
    let done = true;
    if (e.key === "Escape") ACT.skip(); else if (e.key === "ArrowRight") ACT.next(); else if (e.key === "ArrowLeft") ACT.back();
    else if (e.key === "Tab") { const f = [...card.querySelectorAll("button")]; if (!f.length) return; const i = f.indexOf(document.activeElement), n = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length; f[n].focus(); }
    else done = false;
    if (done) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* ---------- the small chip, and the welcome-back card ---------- */
  function hideChip() { if (chip) { chip.remove(); chip = null; } }
  function showChip() {
    const w = WHERE[keyFor()]; if (!w) return;
    chip = document.createElement("div"); chip.className = "tour-chip"; chip.setAttribute("role", "status");
    mem.offered = mem.offered || {}; mem.offered[tourId(screenTour())] = 1; save();
    chip.innerHTML = `<span>${esc(w[0])}.</span><button class="btn btn-compact btn-plain" data-c="go">Tour This Screen</button><button class="tour-x" data-c="x" aria-label="Close">${I("x", 14)}</button>`;
    document.body.appendChild(chip);
    chip.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; if (b.dataset.c === "go") { const t = screenTour(); if (t) start(t, { intro: false }); } hideChip(); });
    setTimeout(hideChip, 8000);
  }
  function welcomeBack() {
    const c = document.createElement("div"); c.className = "tour-wb"; c.setAttribute("role", "dialog"); c.setAttribute("aria-label", "Welcome back");
    c.innerHTML = `<button class="tour-x" data-w="x" aria-label="Close">${I("x", 14)}</button><h3>Welcome back</h3><p>What you did last time is kept. Carry on, take the one-minute tour, or start the story again from the 6 am alert.</p>
      <div class="tour-btns"><button class="btn btn-compact btn-prominent" data-w="x">Carry On</button><button class="btn btn-compact" data-w="tour">Take the Tour</button><button class="btn btn-compact btn-plain" data-w="reset">Start Again</button></div>`;
    document.body.appendChild(c);
    if (pick(".inspector") && window.innerWidth >= 1280) c.classList.add("left");
    c.addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (!b) return; c.remove();
      if (b.dataset.w === "x" && mem.route && mem.route !== RC.app.route() && b.classList.contains("btn")) RC.app.go(mem.route);
      if (b.dataset.w === "tour") start(fullTour(), { intro: false });
      if (b.dataset.w === "reset") { const r = document.querySelector('[data-action="reset"]'); if (r) r.click(); } });
  }

  /* ---------- who sees what ---------- */
  RC.tour = { start: () => start(fullTour(), { intro: !mem.intro[PAGE] }), screen: () => { const t = screenTour(); if (t) start(t, { intro: false }); }, stop: () => { if (cur) finish("left"); }, mem: () => mem };
  if (PAGE === "app") window.addEventListener("hashchange", () => { mem.route = RC.app.route(); save(); });
  document.addEventListener("click", e => { const a = e.target.closest('a[href="#tour"], [data-tour-start]'); if (!a) return; e.preventDefault(); start(fullTour(), { intro: false }); });
  function begin() {
    const arrival = PAGE === "app" ? RC.app.arrival : (() => { try { const f = new URLSearchParams(location.search).get("from"); if (f) history.replaceState(null, "", location.pathname + location.hash); return f; } catch (e) { return null; } })();
    // A PDF link opens a new tab each time, so "away" is measured in time since the last visit, not in tabs
    const first = !mem.intro[PAGE], away = Date.now() - (mem.last || 0) > AWAY;
    mem.visits = (mem.visits || 0) + 1; mem.last = Date.now(); save();
    if (first) {
      // From a picture: the first card, then that screen's own tour. At the front door: the first card, then the whole tour.
      // Anywhere else: the first card alone, which offers this screen's tour or the whole one.
      const steps = PAGE !== "app" ? fullTour() : arrival ? screenTour() : RC.app.route() === "#alert" && (!location.hash || location.hash === "#alert") ? fullTour() : null;
      start(steps, { intro: true });
      return;
    }
    if (arrival) { const t = screenTour(); if (t && !mem.done[tourId(t)] && !(mem.offered || {})[tourId(t)]) showChip(); return; }
    if (PAGE === "app" && away) welcomeBack();
  }
  if (document.readyState === "complete") setTimeout(begin, 500); else window.addEventListener("load", () => setTimeout(begin, 500));
})(window.RC);
