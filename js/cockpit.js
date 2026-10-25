/* Still Here — government view. Situation: needs-action queue · map · slide-over detail. Plus Resources, Fairness & law, World. */
(function (RC) {
  const M = RC.Model, MAP = RC.Map, CH = RC.Chart, GV = RC.gov, esc = MAP.esc, C = M.compact, P = M.pct, I = RC.icon;
  const KEY = "stillhere-gov-v1", $ = s => document.querySelector(s);
  const SEVL = { urgent: "Urgent", high: "High", watch: "Watch" }, SEVC = { urgent: "var(--apple-red)", high: "var(--apple-orange)", watch: "var(--apple-gray)" }, SEVR = { urgent: 0, high: 1, watch: 2 };
  const SEVS = { urgent: "red", high: "orange", watch: "", done: "green" }, sev = (q) => q.inprog ? `<span class="st orange">In progress</span>` : `<span class="st ${SEVS[q.done ? "done" : q.sev]}">${q.done ? "Handled" : SEVL[q.sev]}</span>`;
  const SMALL = new Set(["a", "an", "the", "to", "of", "in", "on", "for", "and", "or", "at", "by", "as", "with", "from"]);
  const tc = t => String(t).split(" ").map((w, i) => (i && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const done = t => `<span class="donetext">${I("check", 15)}${esc(t)}</span>`;
  const COSI = Math.cos(22.5 * Math.PI / 180), toLL = ([x, y]) => [x / (30 * COSI) + 68, 37.3 - y / 30];
  const ZONES = RC.avoid.map((z, i) => Object.assign({ id: "a" + i }, z)).concat([{ id: "tar", z: "Tarapur exclusion zone", why: "Reactor shutdown in progress with too few operators. Keep 5 km away.", lonlat: [72.66, 19.83], km: 5 }, { id: "mum", z: "Mumbai creeks", why: "Mangrove loss. Flood risk at high tide, 13:40.", lonlat: [72.86, 19.07], km: 3 }]);
  const PL = q => RC.govPlan[q.dyn === "children" ? "children" : q.dyn === "slowest" ? "bihar" : q.id] || {};
  // Map colour for need: the share of an area's children left alone who have nobody going yet, counting those not yet found
  const NEED = [{ max: 0.05, c: "var(--r0)", l: "Under 5%" }, { max: 0.1, c: "var(--r1)", l: "5–10%" }, { max: 0.2, c: "var(--r2)", l: "10–20%" }, { max: 0.4, c: "var(--r3)", l: "20–40%" }, { max: 0.7, c: "var(--r4)", l: "40–70%" }, { max: 1.01, c: "var(--r5)", l: "Over 70%" }];
  const needShare = v => v && v.A ? Math.max(0, v.A - v.reached - v.claimed) / v.A : 0;
  const needColor = v => { if (!v || v.nodata) return "var(--nodata)"; const f = needShare(v); return (NEED.find(b => f < b.max) || NEED[NEED.length - 1]).c; };
  const needLegend = () => `<div class="legend compact"><span class="lt">Nobody going yet</span><span>${NEED[0].l}</span><span class="ramp">${NEED.map(b => `<i style="background:${b.c}"></i>`).join("")}</span><span>${NEED[NEED.length - 1].l}</span><span class="nd"><i></i>No network</span></div>`;
  const marksLegend = () => `<div class="legend compact marks">${S.layers.problems ? `<span><i class="pin-k" style="background:var(--apple-red)">!</i>Problem, open</span><span><i class="pin-k" style="background:var(--green)">✓</i>Handled</span>` : ""}${S.layers.sites && S.scope === "delhi" ? `<span><i class="pin-k" style="background:#6E6E73">H</i>Critical site (H hospital, W water, P prison, L lab, F fuel)</span>` : ""}${S.layers.help ? `<span><i class="arr-k"></i>Supply moving (route shown here only)</span>` : ""}${S.layers.hazards ? `<span><i class="ring-k"></i>Keep away</span>` : ""}</div>`;
  const SITEK = { H: "Hospital", W: "Water plant", P: "Prison", L: "Disease lab", F: "Fuel site", A: "Air traffic control", Z: "Zoo" };
  function def() { return { page: "situation", colour: "need", rebalanced: false, trades: {}, fixSent: {}, scope: "delhi", state: null, ti: 0, qtab: "problems", sel: null, done: {}, layers: { people: true, problems: true, sites: true, help: true, hazards: true }, siteAsk: {}, asked: {}, mirror: true, wardTeam: {}, wsel: null }; }
  let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.page) { const o = Object.assign(def(), s); if (o.layers.sites == null) o.layers.sites = true; o.trades = o.trades || {}; o.fixSent = o.fixSent || {}; return o; } } catch (e) {} return def(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const T = () => M.TIMES[S.ti], H = () => T().h, now = () => S.ti === 0;
  const scopeAgg = h => S.scope === "delhi" ? M.scopes.delhi(h) : S.state ? M.scopes.state(S.state, h) : M.scopes.india(h);
  const scopeName = () => S.scope === "delhi" ? "Delhi" : S.state || "India";
  // Wards ranked by the share of their alone children who are under five with nobody going, not the raw count (audit 2, N-14)
  const wardRank = h => M.byState.Delhi.map(u => ({ u, v: M.at(u, h) })).filter(x => !x.v.nodata && x.v.A > 0).sort((a, b) => b.v.u5 / b.v.A - a.v.u5 / a.v.A);
  const slowest = h => Object.keys(M.byState).map(n => ({ n, v: M.scopes.state(n, h) })).filter(x => x.v.A > 1e6).sort((a, b) => a.v.share - b.v.share)[0];
  const row = (l, v) => `<div class="row"><span>${l}</span><span>${v}</span></div>`;
  const projNote = () => now() ? "" : `<div class="src">Estimate for ${esc(T().label)}</div>`;

  function items() {
    const h = H();
    return GV.queue.filter(q => S.scope === "india" || q.scope === "delhi").map(q => {
      const o = Object.assign({}, q);
      if (q.dyn === "children") { const v = M.scopes.delhi(h), top = wardRank(h).slice(0, 3), none = v.u5 * 0.16; o.title = `${C(v.u5)} small children nobody is coming for`; o.where = `Across Delhi, worst in ${top[0].u.name} and ${top[1].u.name}`; o.what = `Under five, in Delhi. About ${C(none)} have nobody left alive who knows them, known the moment they were found; ${C(v.u5 - none)} have people who haven't said they're going. Worst wards: ${top.map(x => `${x.u.name} (${Math.round(x.v.u5)})`).join(", ")}.`; }
      if (q.dyn === "slowest") { const sl = slowest(h); o.title = `${sl.n} is being reached slowest`; o.what = `${P(sl.v.share)} of ${C(sl.v.A)} children alone there are now safe with someone, the lowest of any large state.`; o.state = sl.n; o.where = sl.n; o.lonlat = toLL(RC.GEO.india.states[sl.n].c); }
      o.done = S.done[q.id] || null; o.inprog = !!(q.keepOpen && o.done); return o;
    });
  }
  // The alone-children item is the product's job, so it always comes first, and it stays open until teams report children reached.
  const sorted = () => items().sort((a, b) => ((b.dyn === "children") - (a.dyn === "children")) || ((!!a.done && !a.inprog) - (!!b.done && !b.inprog)) || SEVR[a.sev] - SEVR[b.sev]);

  /* ---------- header ---------- */
  function header() {
    $("#tabs").innerHTML = [["situation", "Situation"], ["doing", "How we're doing"], ["resources", "Resources"], ["network", "Network"], ["sites", "Homes & sites"], ["info", "Information"], ["fair", "Fairness & law"], ["world", "World"]].map(([k, l]) => `<button class="${S.page === k ? "on" : ""}" data-page="${k}">${l}</button>`).join("");
    $("#who").textContent = `${GV.persona.org} · ${GV.persona.role}`;
    const r = $("#restricted"); if (r && !r.querySelector("svg")) r.insertAdjacentHTML("afterbegin", I("shield-alert", 13));
  }
  const timeSeg = () => `<span class="lab">Time</span><div class="seg">${M.TIMES.map((t, i) => `<button class="${S.ti === i ? "on" : ""}" data-ti="${i}">${t.short}</button>`).join("")}</div><span class="proj ${now() ? "now" : ""}" data-help="projection">${now() ? "Live, 07:10" : "Estimate for " + esc(T().label)}</span>`;

  /* ---------- situation ---------- */
  function kpis() {
    const h = H(), v = scopeAgg(h), its = items(), open = its.filter(i => i.sev === "urgent" && (!i.done || i.inprog)).length, all = its.filter(i => !i.done || i.inprog).length;
    const tile = (help, l, val, d, st) => `<div class="kpi" data-help="${help}"><span class="info">${I("info", 15)}</span><div class="l">${l}</div><div class="v">${val}</div><div class="d">${st ? `<span class="st ${st}">${d}</span>` : d}</div></div>`;
    return tile("vanish", RC.TERMS.vanish, "0", "checked every minute", "green")
      + tile("alone", RC.TERMS.alone, C(v.A), "in " + scopeName())
      + tile("reached", RC.TERMS.reached, C(v.reached), `${P(v.share)} of them · ${P(needShare(v))} have nobody going`)
      + tile("nocircle", RC.TERMS.nocircle, C(v.u5), "under 5 · nobody going yet", "red")
      + tile("urgent", RC.TERMS.urgent, String(open), `${all} open in ${S.scope === "delhi" ? "Delhi" : "India"}`, open ? "red" : "green");
  }
  function queueHtml() {
    const its = sorted(), n = its.filter(i => !i.done || i.inprog).length;
    const head = `<div class="q-head"><b>Needs action</b><button class="btn btn-compact btn-plain" data-export="1" title="Save the queue and every action taken as a file">${I("file-down", 15)}Export</button><div class="seg"><button class="${S.qtab === "problems" ? "on" : ""}" data-qtab="problems">Problems ${n}</button><button class="${S.qtab === "updates" ? "on" : ""}" data-qtab="updates">Updates</button></div></div>`;
    let list = "";
    if (S.qtab === "updates") list = GV.updates.map(u => `<div class="upd"><div class="m">${u.t} · <b>${esc(u.from)}</b> · ${esc(u.what)}</div><div>${esc(u.text)}</div></div>`).join("");
    else list = its.map(q => { const sel = S.sel && S.sel.type === "q" && S.sel.id === q.id; const d = q.done ? (q[q.done] || q.act) : null;
      return `<div class="qi ${q.sev} ${q.done ? "done" : ""} ${sel ? "on" : ""}" data-q="${q.id}" tabindex="0">
        <div class="qi-top">${sev(q)}<span>${q.t} · ${esc(q.where)}</span></div>
        <div class="qi-title">${esc(q.title)}</div><div class="qi-why">${esc(q.why)}</div>
        ${!d && PL(q).have ? `<div class="qi-have">${I("users", 13)}<span><b>Free now:</b> ${esc(PL(q).have[0].n)} · ${esc(PL(q).have[0].eta)}</span></div>` : ""}
        <div class="qi-foot">${d ? `${done(d.done || "Opened")}${PL(q).left && PL(q).left[q.done] ? `<div class="qi-left">${esc(PL(q).left[q.done])}</div>` : ""}` : `<button class="btn btn-compact" data-do="${q.id}" data-which="act">${esc(tc(q.act.label))}</button>`}</div></div>`; }).join("");
    return head + `<div class="q-list">${list}</div>`;
  }
  function crumb() {
    if (S.scope === "delhi") return `<b>Delhi</b> · 290 wards`;
    if (S.state) return `<button data-back="1">‹ India</button> › <b>${esc(S.state)}</b> · its districts`;
    return `<b>India</b> · click a state for its districts`;
  }
  function chips() { return `<span class="lab">Colour areas by</span><div class="seg"><button class="${S.colour === "need" ? "on" : ""}" data-colour="need">Nobody going yet</button><button class="${S.colour === "safe" ? "on" : ""}" data-colour="safe">Now safe</button></div><span class="lab" style="margin-left:6px">Show</span>` + [["problems", "Problems", "var(--red)"], ["sites", "Critical sites", "var(--apple-gray)"], ["help", "Supplies", "var(--blue)"], ["hazards", "Hazards", "var(--amber)"]].map(([k, l, c]) => `<button class="chip ${S.layers[k] ? "on" : ""}" data-layer="${k}"><i style="background:${c}"></i>${l}</button>`).join(""); }
  function situation() {
    return `<div class="filters"><span class="lab">Area</span><div class="seg"><button class="${S.scope === "delhi" ? "on" : ""}" data-scope="delhi">Delhi</button><button class="${S.scope === "india" ? "on" : ""}" data-scope="india">India</button></div>${timeSeg()}</div>
      <div class="kpis">${kpis()}</div>
      <div class="sit-body"><aside class="queue">${queueHtml()}</aside>
        <section class="mapzone ${S.sel ? "has-drawer" : ""}"><div class="map-tools"><span class="crumb">${crumb()}</span>${chips()}</div>
          <div class="stage"><div class="mapsvg" id="map"></div>
            <div class="overlay ov-legend">${S.colour === "need" ? needLegend() : MAP.legend({ compact: true })}${marksLegend()}</div>
            <div class="overlay ov-trend"><div class="t"><b>Is it getting better?</b> <span id="trendname"></span></div><p class="trendline" id="trendtxt"></p><div id="trend"></div></div>
          </div>${drawer()}</section></div>`;
  }
  function regionAgg(sel) { if (!sel) return null; if (sel.kind === "state") return M.scopes.state(sel.key, H()); return M.scopes.unit(sel.key, H()); }
  function regionName(sel) { if (sel.kind === "state") return sel.key; const u = M.byKey[sel.key]; return u ? u.name : sel.key; }
  function drawer() {
    const s = S.sel; if (!s) return "";
    let head = "", body = "";
    if (s.type === "q") {
      const q = items().find(x => x.id === s.id); if (!q) return "";
      const d = q.done ? (q[q.done] || q.act) : null;
      head = `<div>${sev(q)}<h2>${esc(q.title)}</h2><div class="who">${q.t} · ${esc(q.where)}</div></div>`;
      body = `<h3>What happened</h3><p>${esc(q.what)}</p><h3>Why it matters</h3><p>${esc(q.why)}</p>
        ${PL(q).need ? `<h3>What it needs</h3><p>${esc(PL(q).need)}</p>` : ""}
        ${PL(q).have ? `<h3>What you have</h3>${PL(q).have.map(x => `<div class="have"><b>${esc(x.n)}</b><span>${esc(x.what)} · ${esc(x.eta)}</span></div>`).join("")}` : ""}
        <h3>What to do</h3>${d ? `<p>${done(d.done || "")}</p>${PL(q).left && PL(q).left[q.done] ? `<p><b style="color:var(--label)">What's left:</b> ${esc(PL(q).left[q.done])}</p>` : ""}<button class="btn btn-compact btn-plain" data-undo="${q.id}">Undo</button>` : `<div style="display:flex;flex-direction:column;gap:8px"><button class="btn btn-prominent btn-block" data-do="${q.id}" data-which="act">${esc(tc(q.act.label))}</button>${q.alt && !q.alt.open ? `<button class="btn btn-block" data-do="${q.id}" data-which="alt">${esc(tc(q.alt.label))}</button>` : ""}</div>`}`;
      if (q.dyn === "children") body += `<h3>By ward, worst first</h3><table class="rank">${wardRank(H()).slice(0, 10).map(x => `<tr><td>${esc(x.u.name)}</td><td class="n">${Math.round(x.v.u5)}</td><td class="n">${S.wardTeam[x.u.key] ? done("Team sent") : `<button class="btn btn-compact" data-team="${x.u.key}">Send a Team</button>`}</td></tr>`).join("")}</table>`;
      body += `<div class="src">Source: ${esc(q.src)}</div>`;
    } else if (s.type === "region") {
      const v = regionAgg(s), name = regionName(s), kind = s.kind === "ward" ? "Ward · Delhi" : s.kind === "district" ? `District · ${esc((M.byKey[s.key] || {}).state || "")}` : "State";
      head = `<div><span class="who">${kind}</span><h2>${esc(name)}</h2></div>`;
      if (!v || v.nodata) body = `<p>No phone network here, so there is no data. Shown grey on the map, never red. A runner was sent at 06:50.</p>`;
      else body = `<div class="nums"><div class="num" data-help="alone"><div class="l">${RC.TERMS.alone}</div><div class="v">${C(v.A)}</div></div><div class="num" data-help="unclaimed"><div class="l">Nobody going yet</div><div class="v">${P(needShare(v))}</div></div><div class="num" data-help="reached"><div class="l">${RC.TERMS.reached}</div><div class="v">${P(v.share)}</div></div><div class="num" data-help="nocircle"><div class="l">Small children, nobody coming</div><div class="v">${C(v.u5)}</div></div></div>${CH.stack(v)}
        <h3>Over the next three days</h3><div id="drchart"></div>${projNote()}`;
      const here = items().filter(q => (s.kind === "state" && q.state === name));
      if (here.length) body += `<h3>Problems here</h3>` + here.map(q => `<div class="qi" data-q="${q.id}"><div class="qi-top">${sev(q)}</div><div class="qi-title">${esc(q.title)}</div></div>`).join("");
    } else return "";
    return `<aside class="drawer"><div class="dr-head">${head}<button class="x" data-close="1" aria-label="Close">${I("x", 16)}</button></div><div class="dr-body">${body}</div></aside>`;
  }
  function mapOpts() {
    const h = H(), view = S.scope === "delhi" ? "delhi" : S.state ? "state" : "india", cache = {};
    const valOf = k => cache[k] || (cache[k] = view === "india" ? M.scopes.state(k, h) : M.scopes.unit(k, h));
    const its = items(), o = { view, state: S.state, aria: scopeName() + " map" };
    o.fill = k => { const v = valOf(k); return v ? (S.colour === "need" ? needColor(v) : M.color(v)) : null; };
    o.sel = S.sel && S.sel.type === "region" ? S.sel.key : null;
    if (view === "delhi") o.labels = wardRank(h).slice(0, 3).map(x => ({ k: x.u.key, t: x.u.name })).concat(o.sel && M.byKey[o.sel] ? [{ k: o.sel, t: M.byKey[o.sel].name, strong: true }] : []);
    else if (view === "india") o.labels = Object.entries(RC.GEO.india.states).filter(([n]) => (M.scopes.state(n, h).A > 3e5)).map(([n, st]) => ({ at: st.c, t: st.code }));
    else { const ds = (M.byState[S.state] || []).slice().sort((a, b) => b.A - a.A).slice(0, 6); o.labels = ds.map(u => ({ k: u.key, t: u.name })); }
    o.pins = [];
    if (S.layers.problems) {
      // Open problems are big, labelled and (if urgent) pulsing, so they read before the colours do
      its.filter(q => view === "delhi" ? q.scope === "delhi" : q.scope === "india").forEach(q => { const open = !q.done || q.inprog; o.pins.push({ id: q.id, lonlat: q.lonlat, color: open ? SEVC[q.sev] : "var(--green)", glyph: open ? "!" : "✓", pulse: q.sev === "urgent" && open, sel: S.sel && S.sel.type === "q" && S.sel.id === q.id, r: open ? (q.sev === "urgent" ? 12 : q.sev === "high" ? 10 : 8) : 7, label: open && q.sev !== "watch" ? PL(q).short : "" }); });
      if (view !== "delhi") { const n = its.filter(q => q.scope === "delhi" && !q.done).length; if (n) o.pins.push({ id: "delhi-cluster", lonlat: [77.2, 28.6], color: "var(--red)", glyph: String(n), r: 9, label: "Delhi" }); }
    }
    // Critical sites: a letter for each kind, orange when under half their staff (Rahul: "the map looks premature, not exhaustive")
    if (S.layers.sites && view === "delhi") RC.govSitePins.forEach((x, i) => o.pins.unshift({ id: "site" + i, lonlat: x.ll, color: x.short ? "var(--apple-orange)" : "#6E6E73", glyph: x.k, r: 7 }));
    if (S.layers.help) {
      const inD = ll => ll[0] > 76.83 && ll[0] < 77.35 && ll[1] > 28.4 && ll[1] < 28.89;
      o.arcs = GV.supplies.filter(f => view === "delhi" ? inD(f.fromLL) && inD(f.toLL) : !(inD(f.fromLL) && inD(f.toLL))).map(f => ({ from: f.fromLL, to: f.toLL, fromLabel: f.from, toLabel: view === "delhi" ? "" : f.to.split(" ")[0] }));
    }
    if (S.layers.hazards) { o.zones = ZONES; o.zoneColor = "var(--apple-orange)"; }
    o.hover = k => {
      if (k.indexOf("pin:site") === 0) { const x = RC.govSitePins[+k.slice(8)]; return x ? `<b>${esc(x.n)}</b><div>${SITEK[x.k]} · ${esc(x.staff)}</div><div class="src">${x.short ? "Under half its usual staff" : "Enough staff for now"}</div>` : ""; }
      if (k.indexOf("pin:") === 0) { const id = k.slice(4); if (id === "delhi-cluster") return `<b>Delhi</b><div>${its.filter(q => q.scope === "delhi" && !q.done).length} problems open.</div><div class="hintl">Click to switch to Delhi</div>`; const q = its.find(x => x.id === id); return q ? `<b>${esc(q.title)}</b><div>${esc(q.what)}</div>${PL(q).have ? `<div class="src">Free now: ${esc(PL(q).have[0].n)} · ${esc(PL(q).have[0].eta)}</div>` : ""}<div class="hintl">Click for the plan</div>` : ""; }
      if (k.indexOf("zone:") === 0) { const z = ZONES.find(x => x.id === k.slice(5)); return z ? `<b>${esc(z.z)}</b><div>${esc(z.why)}</div>` : ""; }
      const v = valOf(k), name = view === "india" ? k : (M.byKey[k] || {}).name || k;
      if (!v) return `<b>${esc(name)}</b>`;
      if (v.nodata) return `<b>${esc(name)}</b><div>No phone network, so no data. Shown grey, never red.</div>`;
      return `<b>${esc(name)}</b>${row(RC.TERMS.alone, C(v.A))}${row("Nobody going yet", P(needShare(v)))}${row(RC.TERMS.reached, P(v.share))}${row(RC.TERMS.claimed, C(v.claimed))}${row("Small children, nobody coming", C(v.u5))}${projNote()}<div class="hintl">${view === "india" ? (k === "Delhi" ? "Click to open Delhi's wards" : "Click to see its districts") : "Click for detail"}</div>`;
    };
    o.click = k => { if (view === "india") { if (k === "Delhi") { S.scope = "delhi"; S.state = null; S.sel = null; } else { S.state = k; S.sel = { type: "region", kind: "state", key: k }; } } else S.sel = { type: "region", kind: view === "delhi" ? "ward" : "district", key: k }; render(); };
    o.clickPin = id => { if (String(id).indexOf("site") === 0) { S.page = "sites"; S.sel = null; render(); return; } if (id === "delhi-cluster") { S.scope = "delhi"; S.state = null; S.sel = null; } else S.sel = { type: "q", id }; render(); };
    o.clickEmpty = () => { if (S.sel) { S.sel = null; render(); } };
    return o;
  }
  function trend() {
    const el = $("#trend"); if (!el) return;
    const s = S.sel && S.sel.type === "region" ? S.sel : null, fn = s ? (h => regionAgg(Object.assign({}, s)) && (s.kind === "state" ? M.scopes.state(s.key, h) : M.scopes.unit(s.key, h))) : scopeAgg;
    $("#trendname").textContent = s ? regionName(s) : scopeName();
    $("#trendtxt").textContent = CH.trendSentence(fn, M.NOW, s ? regionName(s) : scopeName());
    drawTrend(el, fn, 130);
    const dc = $("#drchart"); if (dc && s) drawTrend(dc, h => s.kind === "state" ? M.scopes.state(s.key, h) : M.scopes.unit(s.key, h), 140);
  }
  function drawTrend(el, fn, height) {
    const pts = M.series(fn, 2);
    CH.line(el, { height, xmin: 0, xmax: 50, ymax: 1, yfmt: y => Math.round(y * 100) + "%", ytitle: "Share of children left alone", xlabel: h => M.hourLabel(h), marker: M.NOW, markerLabel: "Now", split: M.NOW, right: 112,
      xticks: [{ x: 14, l: "8 pm" }, { x: 26, l: "Day 2" }, { x: 50, l: "Day 3" }],
      series: [{ name: "Now safe", color: "var(--st-reached)", area: true, pts: pts.map(p => ({ x: p.h, y: p.share })) }, { name: "Nobody going", color: "var(--st-nobody)", pts: pts.map(p => ({ x: p.h, y: needShare(p) })) }] });
  }

  /* ---------- resources: the plan ---------- */
  // Free in a pool = total − already busy − what the actions taken so far use (an action on either page is the same action)
  function poolUse(k) { return items().filter(q => q.done && PL(q).pool === k && q.done === "act").reduce((n, q) => n + (PL(q).uses || 0), 0); }
  function resources() {
    const its = sorted();
    const meter = (p, t, inv) => { const f = t ? p / t : 0, c = (inv ? 1 - f : f) < 0.3 ? "var(--apple-red)" : (inv ? 1 - f : f) < 0.6 ? "var(--apple-orange)" : "var(--apple-green)"; return `<div class="meter"><div class="bar"><i style="width:${Math.round(f * 100)}%;background:${c}"></i></div><span>${p.toLocaleString("en-IN")} of ${t.toLocaleString("en-IN")}</span></div>`; };
    const sites = GV.sites.map((x, i) => Object.assign({ i }, x)).sort((a, b) => a.present / a.total - b.present / b.total);
    const planRows = its.map(q => { const pl = PL(q), d = q.done ? (q[q.done] || q.act) : null, h = pl.have || [];
      return `<tr><td>${sev(q)}<div style="margin-top:4px"><b>${esc(q.title)}</b></div><div class="sub" style="margin:2px 0 0">${esc(q.where)}</div></td><td>${esc(pl.need || "")}</td>
        <td>${h.map((x, k) => `<div${k ? ' class="sub" style="margin:6px 0 0"' : ""}><b>${esc(x.n)}</b> · ${esc(x.what)}<br><span class="sub">${esc(x.eta)}</span></div>`).join("")}</td>
        <td>${d ? `${done(d.done || "Opened")}${pl.left && pl.left[q.done] ? `<div class="sub" style="margin:6px 0 0">${esc(pl.left[q.done])}</div>` : ""}` : `<span class="sub">Not planned yet</span>`}</td>
        <td class="n">${d ? `<button class="btn btn-compact btn-plain" data-undo="${q.id}">Undo</button>` : `<button class="btn btn-compact" data-do="${q.id}" data-which="act">${esc(tc(q.act.label))}</button>`}</td></tr>`; }).join("");
    const pools = RC.govPools.map(pl => { const used = poolUse(pl.k), free = Math.max(0, pl.total - pl.busy - used), users = items().filter(q => q.done === "act" && PL(q).pool === pl.k);
      return `<tr><td><b>${esc(pl.what)}</b><div class="sub" style="margin:2px 0 0">${esc(pl.who)}</div></td><td>${meter(free, pl.total)}<div class="sub" style="margin:4px 0 0">free now</div></td>
        <td>${pl.busy ? `${pl.busy} already busy` : "None busy"}${users.map(q => `<div>${done(`${PL(q).uses} → ${PL(q).short}`)}</div>`).join("")}${pl.note ? `<div class="sub" style="margin:4px 0 0">${esc(pl.note)}</div>` : ""}</td></tr>`; }).join("");
    return `<div class="page"><div class="page-in"><h1>Resources and plan</h1><p class="lede">What each open problem needs, what you have free to send, and where everything already is. Pressing an action here or on the Situation page is the same action, and every count below follows it.</p>
      <div class="sec"><h2>Plan for open problems</h2><p class="sub">Worst first. "Free now" is what could reach the problem soonest.</p>
        <table class="t plan"><thead><tr><th>Problem</th><th>Needs</th><th>Free now</th><th>Plan</th><th></th></tr></thead><tbody>${planRows}</tbody></table></div>
      <div class="sec"><h2>People by city</h2><p class="sub">The share of each city's usual police, doctors, nurses and drivers whose phones are still in use. Cities short of one kind and rich in another can trade.</p>
        <table class="t"><thead><tr><th>City</th><th>Police</th><th>Doctors</th><th>Nurses</th><th>Drivers</th></tr></thead><tbody>${RC.cities.map(c => `<tr><td><b>${esc(c.city)}</b></td>${["police", "doctors", "nurses", "drivers"].map(k => `<td>${share(c[k])}</td>`).join("")}</tr>`).join("")}</tbody></table>
        <h3 class="mini">Suggested trades</h3>${RC.trades.map(t => `<div class="zrow"><div class="zt"><b>${esc(t.give)}; ${esc(t.get).charAt(0).toLowerCase() + esc(t.get).slice(1)}</b></div><div class="zr">${esc(t.why)}</div><div style="margin-top:6px">${S.trades[t.id] ? `${done("Approved at 07:3" + (t.id === "t1" ? "2" : "4") + "; first arrivals by 11:00")} <button class="btn btn-compact btn-plain" data-trade="${t.id}">Undo</button>` : `<button class="btn btn-compact" data-trade="${t.id}">Approve the Trade</button>`}</div></div>`).join("")}</div>
      <div class="sec"><h2>Teams and vehicles you can send</h2><p class="sub">Counted from each team's phones and each vehicle's tracker at 07:10.</p>
        <table class="t"><thead><tr><th>What</th><th>Free now</th><th>Busy with</th></tr></thead><tbody>${pools}</tbody></table></div>
      <div class="sec"><h2>People by profession<span class="inl-info" data-help="register">${I("info", 15)}</span></h2><p class="sub">Every profession that matters in the first days, from the register each one comes from. A SIM's registration holds only a name, an address and an Aadhaar number, never a profession, so these come from the professional councils, licences and employer records, matched to phones still in use. Who is still here, who is already at work, and who could still be asked (not at work and not waiting on an answer). Each ask is a message with the place, the shift and what it pays; nobody is ordered.</p>
        <table class="t"><thead><tr><th>Who</th><th class="n">Still here</th><th class="n">At work now</th><th class="n">Free to ask</th><th class="n">Asked</th><th class="n">Said yes</th><th>Most needed at</th><th></th></tr></thead><tbody>${GV.people.map((x, i) => `<tr><td><b>${esc(x.role)}</b><div class="sub" style="margin:2px 0 0">${esc(x.reg)}</div></td><td class="n">${x.alive.toLocaleString("en-IN")}<div class="sub" style="margin:0">of ${x.of.toLocaleString("en-IN")}</div></td><td class="n">${x.onduty.toLocaleString("en-IN")}</td><td class="n">${Math.max(0, x.alive - x.onduty - (x.asked - x.came) - (S.asked[i] || 0)).toLocaleString("en-IN")}</td><td class="n">${(x.asked + (S.asked[i] || 0)).toLocaleString("en-IN")}</td><td class="n">${x.came.toLocaleString("en-IN")}</td><td>${esc(x.need)}</td><td class="n"><button class="btn btn-compact" data-ask="${i}" style="white-space:nowrap">Ask 50 More</button></td></tr>`).join("")}</tbody></table>
        <div class="src">Source: registers matched to phones that are still in use; "at work" means the phone is at a hospital, plant or care point now</div></div>
      <div class="sec"><h2>Essential sites short of staff<span class="inl-info" data-help="short">${I("info", 15)}</span></h2><p class="sub">Worst first. Under 30% of usual staff is red, under 60% is orange.</p>
        <table class="t"><thead><tr><th>Site</th><th>What It Does</th><th>Staff There Now</th><th></th></tr></thead><tbody>${sites.map(x => `<tr><td><b>${esc(x.site)}</b></td><td>${esc(x.does)}</td><td>${meter(x.present, x.total)}</td><td class="n">${S.siteAsk[x.i] ? done(`Asked 07:2${x.i} · first arrivals 08:30`) : `<button class="btn btn-compact" data-siteask="${x.i}">Ask for Staff</button>`}</td></tr>`).join("")}</tbody></table>
        <div class="src">Source: employer rosters matched to phone location, 07:10</div></div>
      <div class="sec restricted"><span class="tag">${I("shield-alert", 14)}Restricted</span><h2>Supplies on the way</h2><p class="sub">Routes and arrival times stay in this view. The public sees only that a supply has left, two hours after it left.</p>
        <table class="t"><thead><tr><th>What</th><th>How</th><th>From → To</th><th>Left</th><th>Arrives</th><th>Route</th></tr></thead><tbody>${GV.supplies.map(f => `<tr><td><b>${esc(f.what)}</b></td><td>${esc(f.how)}</td><td>${esc(f.from)} → ${esc(f.to)}</td><td>${f.dep}</td><td>${esc(f.eta)}</td><td>${esc(f.route)}</td></tr>`).join("")}</tbody></table></div>
    </div></div>`;
  }

  // A share of usual strength as a small coloured bar: red under 40%, orange under 60%, green above
  const share = f => `<div class="meter" style="min-width:110px"><div class="bar"><i style="width:${Math.round(f * 100)}%;background:${f < 0.4 ? "var(--apple-red)" : f < 0.6 ? "var(--apple-orange)" : "var(--apple-green)"}"></i></div><span>${Math.round(f * 100)}%</span></div>`;
  const sevW = s => s === "red" ? `<span class="st red">Urgent</span>` : s === "orange" ? `<span class="st orange">Short</span>` : s === "green" ? `<span class="st green">Running</span>` : `<span class="st">Watch</span>`;

  /* ---------- network: what still moves and produces, and the weather and land ---------- */
  function network() {
    return `<div class="page"><div class="page-in"><h1>Network</h1><p class="lede">What still moves, what still produces, and what the weather and the land are about to do. Half of all drivers, pilots and operators vanished, and so did half of all plants.</p>
      <div class="sec"><h2>Transport</h2><p class="sub">Crews counted from rosters matched to phones in use; routes from train running data, aircraft transponders, toll reads and satellite views.</p>
        <table class="t"><thead><tr><th>Mode</th><th>Crews</th><th>What is running</th><th></th></tr></thead><tbody>${RC.transport.map(x => `<tr><td><b>${esc(x.mode)}</b></td><td>${esc(x.staff || "—")}</td><td>${esc(x.running)}</td><td>${sevW(x.sev)}</td></tr>`).join("")}</tbody></table></div>
      <div class="sec"><h2>What still produces</h2><p class="sub">Much of the modern world needs few hands. Counting it lets supply be matched to need for the first weeks, before markets take over again.</p>
        <table class="t"><thead><tr><th>What</th><th>Output</th><th>Note</th><th></th></tr></thead><tbody>${RC.production.map(x => `<tr><td><b>${esc(x.what)}</b></td><td>${esc(x.out)}</td><td>${esc(x.note)}</td><td>${sevW(x.sev)}</td></tr>`).join("")}</tbody></table></div>
      <div class="sec"><h2>Weather and land</h2><p class="sub">Forecasts from IMD and river gauges; green cover from satellite vegetation maps. What happens after Day 3 is a hypothesis to watch, not a forecast.</p>
        <table class="t"><thead><tr><th>What</th><th>Now</th><th>What it may lead to</th><th></th></tr></thead><tbody>${RC.environment.map(x => `<tr><td><b>${esc(x.what)}</b></td><td>${esc(x.now)}</td><td>${esc(x.then)}</td><td>${sevW(x.sev)}</td></tr>`).join("")}</tbody></table>
        <div class="src">Counts on this page are simulated for the prototype; the sources named are real.</div></div>
    </div></div>`;
  }

  /* ---------- information: rumours, corrections, channels, and every data source ---------- */
  function info() {
    const groups = [...new Set(RC.sources.map(s => s.group))];
    return `<div class="page"><div class="page-in"><h1>Information</h1><p class="lede">What people are being told, what is true, and how to reach everyone. Then every feed this view is built from, how fresh it is, and how far it is trusted.</p>
      <div class="sec"><h2>Rumours spreading</h2><p class="sub">Messages forwarded most in the last hour, from platform trust teams and helpline calls, with the official correction.</p>
        ${RC.rumours.map((r, i) => `<div class="zrow"><div class="zt"><b>"${esc(r.text)}"</b><span class="st ${r.sent || S.fixSent[i] ? "green" : "red"}">${r.sent || S.fixSent[i] ? "Correction sent" : "Spreading"}</span></div><div class="sub" style="margin:2px 0 0">${esc(r.where)} · ${esc(r.n)}</div><div class="zr">${esc(r.fix)}</div>
          ${r.sent || S.fixSent[i] ? "" : `<div style="margin-top:6px"><button class="btn btn-compact" data-fix="${i}">Send the Correction on Every Channel</button></div>`}</div>`).join("")}</div>
      <div class="sec"><h2>How far each channel reaches</h2><p class="sub">The same core message goes on all of them, so the poorest phone and the person with no phone hear what the best phone sees.</p>
        <table class="t"><thead><tr><th>Channel</th><th>Reach now</th></tr></thead><tbody>${RC.channels.map(c => `<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.reach)}</td></tr>`).join("")}</tbody></table></div>
      <div class="sec"><h2>Where every number comes from</h2><p class="sub">Each feed with how old its data is and how far it is trusted. Old registers are fine for a profession or a birth, not for an address, so live signals such as a phone at the site confirm them.</p>
        <table class="t"><thead><tr><th>Source</th><th>What it feeds</th><th>How fresh</th><th>Trust</th></tr></thead><tbody>${groups.map(g => `<tr><td colspan="4" class="grp">${esc(g)}</td></tr>` + RC.sources.filter(s => s.group === g).map(s => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.feeds)}</td><td>${esc(s.fresh)}</td><td>${esc(s.trust)}</td></tr>`).join("")).join("")}</tbody></table>
        <div class="src">The named sources are real systems; in the real product each would be joined under the emergency order, with only the result leaving its owner.</div></div>
    </div></div>`;
  }

  /* ---------- homes & sites (restricted): empty homes, essentials, money of the vanished, critical sites, damage ---------- */
  const HM = RC.govHomes, VB = [{ max: 0.07, c: "var(--v0)", l: "Under 7%" }, { max: 0.09, c: "var(--v1)", l: "7–9%" }, { max: 0.11, c: "var(--v2)", l: "9–11%" }, { max: 0.13, c: "var(--v3)", l: "11–13%" }, { max: 0.15, c: "var(--v4)", l: "13–15%" }, { max: 1, c: "var(--v5)", l: "Over 15%" }];
  // Share of a ward's homes where every resident vanished: about 0.5^(household size), so wards with smaller households have more (simulated per ward)
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };
  const vacant = u => 0.062 + 0.062 * hash(u.key) + (HM.upscale.includes(u.name) ? 0.05 : 0);
  const vColor = f => (VB.find(b => f < b.max) || VB[VB.length - 1]).c;
  function sites() {
    const wards = M.byState.Delhi, per = HM.total / wards.length, emp = wards.reduce((n, u) => n + vacant(u) * per, 0), top = wards.slice().sort((a, b) => vacant(b) - vacant(a));
    const sevSt = s => s === "red" ? `<span class="st red">Urgent</span>` : s === "orange" ? `<span class="st orange">Short</span>` : `<span class="st">Watch</span>`;
    return `<div class="page"><div class="page-in"><h1>Homes and sites</h1><p class="lede">Which homes are now empty, what may and may not be taken from them, what happens to the money of the vanished, and every kind of site that can hurt people if it is left without staff. None of this is ever shown on the public app.</p>
      <div class="sec restricted"><span class="tag">${I("shield-alert", 14)}Restricted · District Magistrates and Delhi Police</span><h2>Homes where everyone vanished</h2>
        <p class="sub">A home counts as empty when every phone that slept there fell still at 2:32 pm and nobody has come home since. Shown by ward only. Street addresses go to a patrol team and nowhere else, and every look at this map is logged.</p>
        <div class="vstats"><div><span>Homes in Delhi</span><b>${C(HM.total)}</b></div><div><span>Empty now</span><b>about ${C(emp)}</b><em>${P(emp / HM.total)} of homes</em></div><div><span>Most empty</span><b class="sm">${top.slice(0, 3).map(u => esc(u.name)).join(", ")}</b><em>wards with smaller households</em></div></div>
        <div class="vmapwrap"><div class="mapsvg" id="vmap" style="position:absolute;inset:8px"></div><div class="overlay" style="left:12px;bottom:12px"><div class="legend compact"><span class="lt">Homes empty</span><span>${VB[0].l}</span><span class="ramp">${VB.map(b => `<i style="background:${b.c}"></i>`).join("")}</span><span>${VB[VB.length - 1].l}</span></div></div></div>
        <div class="btn-row" style="margin-top:12px">${S.patrols ? `${done("Night patrols sent at 07:25 to the 10 wards with the most empty homes")} <button class="btn btn-compact btn-plain" data-patrol="1">Undo</button>` : `<button class="btn btn-compact" data-patrol="1">Send Patrols to the 10 Wards with Most Empty Homes</button>`}</div>
        <p class="sub" style="margin-top:8px">Empty homes are where raiding starts. Guarding them, not opening them, is the first use of this map.</p></div>
      <div class="cols">
        <div class="sec"><h2>Essentials from empty homes</h2><p style="margin:6px 0 8px"><span class="st orange">${esc(HM.essentials.status)}</span></p><p class="sub">${esc(HM.essentials.why)}</p>
          <h3 class="mini">If it is ever needed</h3><ul class="rules">${HM.essentials.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
          <div class="btn-row" style="margin-top:10px">${S.essPlan ? done("Plan ready for Day 5: 12 two-person teams per district, used only in wards where ration shops run out") : `<button class="btn btn-compact" data-essplan="1">Prepare a Plan for Day 5</button>`}</div></div>
        <div class="sec"><h2>Money and property of the vanished</h2><p class="sub">Nothing is shared out. The first job is to stop theft.</p>
          ${HM.money.map(m => `<div class="zrow"><div class="zt"><b>${esc(m.what)}</b></div><div style="margin:2px 0 0">${esc(m.rule)}</div><div class="zr">${esc(m.why)}</div></div>`).join("")}</div>
      </div>
      <div class="sec"><h2>Critical sites in Delhi</h2><p class="sub">Every kind of place that can hurt people if it is left without staff, counted from staff phones at each site. "Short" means under half the usual staff.</p>
        <table class="t"><thead><tr><th>Kind of site</th><th class="n">Sites</th><th class="n">Short of staff</th><th>Worst now</th><th></th></tr></thead><tbody>${HM.sites.map(x => `<tr><td><b>${esc(x.kind)}</b></td><td class="n">${x.n}</td><td class="n">${x.short}</td><td>${esc(x.worst)}</td><td>${sevSt(x.sev)}</td></tr>`).join("")}
          ${HM.india.map(x => `<tr><td><b>${esc(x.kind)}</b><div class="sub" style="margin:0">India</div></td><td class="n">${x.n}</td><td class="n">—</td><td>${esc(x.worst)}</td><td>${sevSt(x.sev)}</td></tr>`).join("")}</tbody></table></div>
      <div class="sec"><h2>Damage from 2:32 pm</h2><p class="sub">Half of all drivers, pilots and machine operators vanished in the middle of what they were doing. This is what broke in the first minute.</p>
        <table class="t"><thead><tr><th>What</th><th>How many</th><th>Where it stands</th></tr></thead><tbody>${HM.damage.map(x => `<tr><td><b>${esc(x.what)}</b></td><td>${esc(x.n)}</td><td>${esc(x.then)}</td></tr>`).join("")}</tbody></table>
        <div class="src">Counts on this page are simulated for the prototype; the places named are real.</div></div>
    </div></div>`;
  }
  function vacantMap() {
    const el = $("#vmap"); if (!el) return; const wards = M.byState.Delhi, per = HM.total / wards.length, top = wards.slice().sort((a, b) => vacant(b) - vacant(a)).slice(0, 10).map(u => u.key);
    MAP.render(el, { view: "delhi", aria: "Share of homes empty, by ward", fill: k => { const u = M.byKey[k]; return u ? vColor(vacant(u)) : null; },
      labels: wards.filter(u => top.slice(0, 5).includes(u.key)).map(u => ({ k: u.key, t: u.name, strong: true })),
      hover: k => { const u = M.byKey[k]; return u ? `<b>${esc(u.name)}</b>${row("Homes empty", P(vacant(u)))}${row("About", C(vacant(u) * per) + " homes")}${top.includes(k) ? `<div class="hintl">${S.patrols ? "Patrol sent" : "Among the 10 with most empty homes"}</div>` : ""}` : ""; } });
  }

  /* ---------- fairness & law ---------- */
  function fair() {
    const rows = GV.fair.map(r => Object.assign({}, r, { now: r.alloc, alloc: S.rebalanced ? r.pop : r.alloc })), W = 760, L = 170, R = 210, rh = 30, Ht = rows.length * rh + 34, max = 0.25, x = v => L + v / max * (W - L - R);
    let svg = `<svg class="dumb" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Each district's share of people against its share of supplies">`;
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach(g => svg += `<line x1="${x(g)}" x2="${x(g)}" y1="6" y2="${Ht - 24}" class="grid"/><text x="${x(g)}" y="${Ht - 8}" text-anchor="middle" class="axis">${Math.round(g * 100)}%</text>`);
    rows.forEach((r, i) => { const y = 18 + i * rh, over = r.alloc > r.pop * 1.3, under = r.alloc < r.pop * 0.7;
      svg += `<g><text x="${L - 10}" y="${y + 4}" text-anchor="end" style="font-size:12.5px;fill:var(--label)">${esc(r.d)}</text><line x1="${x(r.pop)}" x2="${x(r.alloc)}" y1="${y}" y2="${y}" style="stroke:${over ? "var(--apple-red)" : under ? "var(--apple-orange)" : "var(--label3)"};stroke-width:3;stroke-linecap:round"/><circle cx="${x(r.pop)}" cy="${y}" r="6" style="fill:var(--label2)"/>${S.rebalanced && Math.abs(r.now - r.alloc) > 0.004 ? `<line x1="${x(r.now)}" x2="${x(r.alloc)}" y1="${y}" y2="${y}" style="stroke:var(--apple-blue);stroke-opacity:.35;stroke-width:2;stroke-dasharray:3 3"/><circle cx="${x(r.now)}" cy="${y}" r="5" style="fill:none;stroke:var(--apple-blue);stroke-opacity:.55;stroke-width:1.5"/>` : ""}<circle cx="${x(r.alloc)}" cy="${y}" r="6" style="fill:var(--apple-blue)"/><text x="${Math.max(x(r.pop), x(r.alloc), S.rebalanced ? x(r.now) : 0) + 12}" y="${y + 4}" style="font-size:12.5px;font-weight:500;fill:var(--label2)">${over ? `gets ${(r.alloc / r.pop).toFixed(1)}× its share` : under ? `gets ${Math.round(r.alloc / r.pop * 100)}% of its share` : S.rebalanced && Math.abs(r.now - r.alloc) > 0.004 ? `about right (was ${r.now > r.pop ? (r.now / r.pop).toFixed(1) + "× its share" : Math.round(r.now / r.pop * 100) + "% of its share"})` : "about right"}</text></g>`; });
    svg += `</svg>`;
    return `<div class="page"><div class="page-in"><h1>Fairness & law</h1><p class="lede">Three checks on the people running the response: is help going where the people are, which emergency powers are in use and when they end, and who is reached first when there are not enough teams.</p>
      <div class="sec"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><h2>Is help going where the people are?</h2><p class="sub" style="margin:0;max-width:44em">Each row is a district of Delhi. The grey dot is its share of Delhi's surviving people; the blue dot is its share of the food, water and staff sent ${S.rebalanced ? "tomorrow, after rebalancing" : "today"}. A red line means far more than its share, orange far less.</p></div>
        <button class="toggle ${S.mirror ? "on" : ""}" data-mirror="1" data-help="mirror" aria-pressed="${S.mirror}"><span>Shown to the public</span><span class="sw"></span></button></div>
        <div style="margin-top:12px">${svg}</div>
        <p class="sub" style="margin-top:8px">${S.rebalanced ? "Tomorrow's trucks follow where people are: North East Delhi goes from 7% to 13% of supplies, and New Delhi from 12% to 4%." : "Today New Delhi, the capital, gets three times its share while North East Delhi gets about half."} ${S.mirror ? "Anyone can see this chart. Making it public is the only check the product offers against a government that looks after the capital first, and it is not enough on its own." : "<span class='st red'>Hidden from the public. Turning it off is itself recorded and shown publicly.</span>"}</p>
        <div class="btn-row" style="margin-top:10px">${S.rebalanced ? `${done("Tomorrow's plan follows where people are")} <button class="btn btn-compact btn-plain" data-rebalance="1">Undo</button>` : `<button class="btn btn-compact" data-rebalance="1">Rebalance Tomorrow's Trucks</button>`}</div></div>
      <div class="sec"><h2>Emergency powers in use</h2><p class="sub">Every power the response relies on, the law it comes from, who used it, and when it ends.</p>
        <table class="t"><thead><tr><th>What it allows</th><th>Law</th><th>Used by</th><th>Ends</th></tr></thead><tbody>${RC.govPowers.map(w => `<tr><td><b>${esc(w.what)}</b></td><td>${esc(w.law)}</td><td>${esc(w.by)}</td><td>${esc(w.ends)}</td></tr>`).join("")}</tbody></table></div>
      <div class="cols">
        <div class="sec"><h2>Places nobody owns any more<span class="inl-info" data-help="openzone">${I("info", 15)}</span></h2><p class="sub">Where everyone vanished, the district can take over the building and its stock for the response (Disaster Management Act 2005, s.65).</p>
          ${GV.zones.map(z => `<div class="zrow"><div class="zt"><b>${esc(z.zone)}</b><span class="st ${z.status === "Open" ? "green" : z.status.indexOf("Taken") === 0 ? "orange" : ""}">${esc(z.status)}</span></div><div class="sub" style="margin:2px 0 0">${esc(z.what)}</div><div class="zr">${esc(z.rule)}</div></div>`).join("")}
          <p class="sub" style="margin-top:10px">An open zone draws people looking for food away from homes, but it is also a target. Declare only what can't be guarded anyway.</p></div>
        <div class="sec restricted"><span class="tag">${I("shield-alert", 14)}Restricted · District Magistrate and Chief Medical Officer</span><h2>Who is reached first<span class="inl-info" data-help="triage">${I("info", 15)}</span></h2><p class="sub">When there are more children and elders alone than teams, this order decides who the next free team goes to. Only these two officers can change it, and each change is recorded with their name.</p>
          <table class="t"><thead><tr><th>Group</th><th class="n">Cases</th><th>Order</th></tr></thead><tbody>${GV.triage.map(t => `<tr><td>${esc(t.q)}</td><td class="n">${t.n.toLocaleString("en-IN")}</td><td>${t.order}</td></tr>`).join("")}</tbody></table>
          <div class="src">Last changed 05:40 by the District Magistrate, North West: under-fives moved ahead of over-75s</div></div>
      </div></div></div>`;
  }

  /* ---------- world ---------- */
  const wshare = (iso, h) => { const s0 = RC.world.reached[iso]; if (s0 == null) return null; const k = -Math.log(1 - s0) / M.NOW; return 1 - Math.exp(-k * h); };
  const wnames = () => { const names = { SGP: "Singapore" }; RC.GEO.world.countries.forEach(c => names[c.id] = c.n); return names; };
  function world() {
    const h = H(), names = wnames();
    const ranked = Object.keys(RC.world.reached).map(iso => ({ iso, n: names[iso] || iso, s: wshare(iso, h) })).sort((a, b) => a.s - b.s);
    const sel = S.wsel ? ranked.find(r => r.iso === S.wsel) : null;
    const aidN = iso => GV.world.aid.filter(a => a.to === iso), aidF = iso => GV.world.aid.filter(a => a.from === iso);
    return `<div class="filters">${timeSeg()}</div><div class="world"><div class="wmap"><div class="mapsvg" id="wmap" style="position:absolute;inset:10px"></div>
        <div class="overlay" style="left:12px;bottom:12px">${MAP.legend({ compact: true })}<div class="legend compact" style="margin-top:6px"><span class="lt">Blue arrows</span><span>aid on its way, from the country sending it, numbered as in the list</span></div></div></div>
      <div class="wside">${sel ? `<div class="sec"><h2>${esc(sel.n)}</h2><div class="nums" style="margin-top:8px"><div class="num"><div class="l">Children alone, now safe</div><div class="v">${P(sel.s)}</div></div><div class="num"><div class="l">Aid arriving</div><div class="v">${aidN(sel.iso).length}</div></div></div>${aidN(sel.iso).map(a => `<p class="sub" style="margin:8px 0 0">From ${esc(names[a.from] || a.from)}: ${esc(a.what)}, left ${a.t}</p>`).join("")}${aidF(sel.iso).map(a => `<p class="sub" style="margin:8px 0 0">Sending to ${esc(names[a.to] || a.to)}: ${esc(a.what)}</p>`).join("")}<button class="btn btn-compact" style="margin-top:12px" data-wsel="">Close</button></div>` : ""}
        <div class="sec"><h2>Furthest behind</h2><p class="sub">The share of children left alone who are now safe with someone, lowest first. Countries further ahead send aid to these.</p>${ranked.slice(0, 8).map(r => `<div class="wrow" data-wsel="${r.iso}"><span class="wn">${esc(r.n)}</span><div class="meter" style="flex:1;min-width:0"><div class="bar"><i style="width:${Math.max(2, Math.round(r.s * 100))}%;background:${M.color({ share: r.s })}"></i></div><span>${P(r.s)}</span></div></div>`).join("")}</div>
        <div class="sec"><h2>Aid on the way</h2><p class="sub">The blue arrows on the map.</p>${GV.world.aid.map((a, i) => `<div class="aid"><b><span class="anum">${i + 1}</span>${esc(names[a.from] || a.from)} → ${esc(names[a.to] || a.to)}</b><span>${esc(a.what)}, left ${a.t}</span></div>`).join("")}</div>
        <div class="sec"><h2>Live world layer</h2><p class="sub">World Monitor, an open-source dashboard by koala73, already shows live news, flights, ships and outages for the whole world. In the real product it runs beside this view on the government network. Still Here adds the one layer it lacks: people.</p><a class="btn btn-prominent btn-block" href="${RC.WMON}" target="_blank" rel="noopener">Open World Monitor ${I("external-link", 15)}</a><p class="sub" style="margin:10px 0 0">Opens the public site, which shows today's real world, not this scenario.</p></div>
      </div></div>`;
  }
  function worldMap() {
    const el = $("#wmap"); if (!el) return; const h = H(), cents = { SGP: [103.8, 1.35] }; RC.GEO.world.countries.forEach(c => cents[c.id] = [c.c[0] / 3 - 180, 90 - c.c[1] / 3]);
    const AR = GV.world.aid.map((a, i) => ({ a, n: i + 1 })).filter(x => cents[x.a.from] && cents[x.a.to]);
    MAP.render(el, { view: "world", aria: "World map", sel: S.wsel, fill: iso => { const s = wshare(iso, h); return s == null ? null : M.color({ share: s }); },
      labels: ["IND", "CHN", "USA", "BRA", "RUS", "AUS", "NGA", "IDN", "DEU", "ZAF", "SAU", "CAN", "ARG", "EGY"].filter(i => cents[i]).map(i => ({ ll: cents[i], t: (RC.GEO.world.countries.find(c => c.id === i) || {}).n })),
      arcs: AR.map(x => ({ from: cents[x.a.from], to: cents[x.a.to], n: x.n })),
      hover: iso => { if (String(iso).indexOf("arc:") === 0) { const x = AR[+String(iso).slice(4)], nm = wnames(); return x ? `<b>${x.n}. ${esc(nm[x.a.from] || x.a.from)} → ${esc(nm[x.a.to] || x.a.to)}</b><div>${esc(x.a.what)}, left ${x.a.t}</div>` : ""; } const c = RC.GEO.world.countries.find(x => x.id === iso); const s = wshare(iso, h); return c ? `<b>${esc(c.n)}</b>${s == null ? "<div>No data yet</div>" : row("Children alone, now safe", P(s))}${projNote()}<div class="hintl">Click for detail</div>` : ""; },
      click: iso => { S.wsel = iso; render(); }, clickEmpty: () => { if (S.wsel) { S.wsel = null; render(); } } });
  }

  function exportLog() {
    const rows = sorted().map(q => ({ id: q.id, severity: q.sev, raised_at: q.t, where: q.where, title: q.title, what_happened: q.what, why_it_matters: q.why,
      status: q.inprog ? "in progress" : q.done ? "handled" : "open", action_taken: q.done ? (q[q.done] || q.act).label : null, outcome: q.done ? (q[q.done] || q.act).done || null : null, source: q.src }));
    const out = { record_type: "incident_log", note: "Situation queue from the Still Here government view. Simulated data.", authority: GV.persona.org, scope: scopeName(), exported_at: "Day 1 07:10", items: rows,
      teams_sent_to_wards: Object.keys(S.wardTeam).map(k => (M.byKey[k] || {}).name || k) };
    const b = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "still-here-incident-log.json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- render ---------- */
  /* ---------- how we're doing: the two pages' metrics, in plain words ---------- */
  // Per case, from the model: safe within 6 hours (the main goal) and someone going or already there within 2 and 3 hours.
  // Replies within 30 minutes are everyone who goes plus some who answer "can't go" (RC.govDoing.cant); the guardrails are simulated case-log figures.
  function doing() {
    const D = RC.govDoing, list = (S.scope === "delhi" ? M.byState.Delhi : M.units).filter(u => !u.nodata), by = {};
    let A = 0, s6 = 0, q2 = 0, q3 = 0;
    list.forEach(u => { const x = M.perCase(u.m, 6); A += u.A; s6 += u.A * x; q2 += u.A * M.perCaseQ(u.m, 2); q3 += u.A * M.perCaseQ(u.m, 3);
      const k = S.scope === "delhi" ? u.name : u.state, b = by[k] = by[k] || { A: 0, s: 0 }; b.A += u.A; b.s += u.A * x; });
    const ns = s6 / A, rep = q2 / A + D.cant * (1 - q2 / A), cl = q2 / A / rep, ar = ns / (q2 / A), g3 = q3 / A, where = S.scope === "delhi" ? "Delhi" : "India";
    const slow = Object.entries(by).filter(([, b]) => b.A > (S.scope === "delhi" ? 800 : 1e6)).sort((a, b) => a[1].s / a[1].A - b[1].s / b[1].A).slice(0, 2).map(([n]) => n);
    // Green: at or above the goal. Orange: within 3 points of it. Red: further behind.
    const st = (v, g) => v >= g ? ["green", "On track"] : v >= g - 0.03 ? ["orange", "Close to goal"] : ["red", "Needs help"];
    const bar = (v, g, c) => `<div class="ib"><i class="${c}" style="width:${Math.min(100, v * 100).toFixed(1)}%"></i><b style="left:${g * 100}%"></b></div>`;
    const f2 = x => x.toFixed(2);
    const step = (n, h, w, v, g, tip) => { const [c, l] = st(v, g); return `<div class="is"><div class="is-top"><span class="n">${n}</span><span class="st ${c}">${l}</span></div><h3>${esc(h)}</h3><div class="w">${esc(w)}</div><div class="v">${P(v)}</div>${bar(v, g, c)}<div class="g">Goal ${P(g)}</div><div class="h">${esc(tip)}</div></div>`; };
    // One north star for children and dependent elders (the two pages, section 5). Elders' circles are smaller, so their share runs a little lower (simulated).
    const EL = S.scope === "delhi" ? 0.047 : 0.093, ELF = 0.94, nsE = ns * ELF, Ae = A * EL, nsAll = (ns * A + nsE * Ae) / (A + Ae);
    const [hc, hl] = st(nsAll, 0.7);
    const l2 = rows => `<div class="l2s">${rows.map(([n, v, ok]) => `<div><span>${esc(n)}</span><b class="${ok ? "" : "warn"}">${esc(v)}</b></div>`).join("")}</div>`;
    // India at a glance: the essentials, by state (simulated, stable per state)
    const hsh = t => { let x = 7; for (let i = 0; i < t.length; i++) x = (x * 31 + t.charCodeAt(i)) % 9973; return x / 9973; };
    const states = Object.keys(M.byState).map(n => { const v = M.scopes.state(n, H()), b = by[n] || { A: 0, s: 0 }, r = hsh(n);
      return { n, A: v.A * (1 + EL), safe6: b.A ? b.s / b.A : 0, nobody: v.A ? Math.max(0, v.A - v.reached - v.claimed) / v.A : 0, food: Math.round(14 + 26 * r), water: Math.round(34 + 46 * hsh(n + "w")), power: Math.round(38 + 50 * hsh(n + "p")), hosp: Math.round(40 + 45 * hsh(n + "h")) }; })
      .filter(x => x.A > 2e5);
    const nat = k => Math.round(states.reduce((a, x) => a + x[k] * x.A, 0) / states.reduce((a, x) => a + x.A, 0));
    const worst = states.slice().sort((a, b) => a.safe6 - b.safe6).slice(0, 6), best = states.slice().sort((a, b) => b.safe6 - a.safe6).slice(0, 3);
    const tone = (v, lo, hi) => v < lo ? "red" : v < hi ? "orange" : "green";
    const essentials = [["package", "Food in stock", `${nat("food")} days`, "of grain at ration shops and depots, at today's pace", tone(nat("food"), 14, 21)], ["droplets", "Water points open", `${nat("water")}%`, "of the points planned for today", tone(nat("water"), 40, 70)], ["zap", "Power restored", `${nat("power")}%`, "of homes, by feeder", tone(nat("power"), 40, 70)], ["heart-pulse", "Hospitals with an emergency team", `${nat("hosp")}%`, "counted from staff phones at each hospital", tone(nat("hosp"), 50, 75)]];
    return `<div class="page"><div class="page-in"><h1>How we're doing</h1><p class="lede">Are children and elders who were left alone getting to someone they know, quickly and safely? Each number is timed from their first message, across ${where}. Green is on track, orange is close, red needs help.</p>
      <div class="sec ind-hero"><div><div class="ih-k">Our main goal · dependents safe in time</div><div class="ih-v">${P(nsAll)}</div><div class="ih-t">of children and dependent elders found alone are safe with someone they know within 6 hours</div>
        <div class="ib big"><i class="${hc}" style="width:${(nsAll * 100).toFixed(1)}%"></i><b style="left:70%"><span>Goal 70%</span></b></div>
        <div class="ih-n"><span class="st ${hc}">${hl}</span><span>Children ${P(ns)} of ${C(A)}</span><span>Elders ${P(nsE)} of ${C(Ae)}</span></div></div>
        <div class="ih-r"><b>Why this number?</b> It counts lives kept safe, not messages sent. Six hours, because for a small child or an elder without medicine, hours decide. Someone they know, because a stranger is the main risk. And only at the address: a promise to go is not a rescue.</div></div>
      <div class="sec"><h2>How they get there</h2><p class="sub">Four steps. When the main goal slips, the step in orange or red is where to help, and the lines under it say why.</p>
        <div class="ind-steps">${step(1, "Found", "With a case by 10 am, of those the registers lead us to expect", D.found, 0.9, "The gap is homes on no register.")}
        ${step(2, "Someone who knows them answered", "Within 30 minutes of the first message", rep, 0.85, "If it drops: SMS, then a voice call, in the family's language.")}
        ${step(3, "Someone said they're going", "Within 2 hours, once someone answered", cl, 0.85, "One person is named, and all of them see “nobody going yet”.")}
        ${step(4, "They arrived, and it's confirmed", "Within 6 hours, of those going", ar, 0.97, `Slowest: ${slow.join(" and ")}. Send route notes and transport there.`)}</div>
        <div class="ind-steps l2row">${l2(D.l2[0])}${l2(D.l2[1])}${l2(D.l2[2])}${l2(D.l2[3])}</div>
        <div class="src">Steps 2 to 4 multiply to the children's share: ${f2(rep)} × ${f2(cl)} × ${f2(ar)} ≈ ${f2(ns)}.</div></div>
      <div class="sec"><h2>Mistakes we watch for</h2><p class="sub">Getting faster must never mean getting careless. Each check has a limit, and a step we take the moment it's crossed.</p>
        <table class="t ind-g"><thead><tr><th>What could go wrong</th><th>How we check</th><th>Today</th><th>Limit</th><th>If it's crossed</th></tr></thead><tbody>${D.guard.map(([w, how, v, lim, act, c]) => `<tr><td><b>${esc(w)}</b></td><td>${esc(how)}</td><td><span class="st ${c}">${esc(v)}</span></td><td>${esc(lim)}</td><td>${c === "green" ? esc(act) : `${esc(act)} <button class="btn btn-compact" data-page="situation">See where</button>`}</td></tr>`).join("")}</tbody></table></div>
      <div class="sec"><h2>India at a glance</h2><p class="sub">The essentials everyone else depends on, and the states that need help first. Ranked by the main goal.</p>
        <div class="ess">${essentials.map(([ic, h, v, d, c]) => `<div><span class="st ${c}">${esc(h)}</span><b>${v}</b><span class="d">${esc(d)}</span></div>`).join("")}</div>
        <table class="t ind-g st-tab"><thead><tr><th>State</th><th class="n">Alone</th><th class="n">Safe in 6 h</th><th class="n">Nobody going yet</th><th class="n">Food</th><th class="n">Water</th><th class="n">Power</th><th class="n">Hospitals</th></tr></thead>
          <tbody>${worst.map(x => `<tr><td><b>${esc(x.n)}</b></td><td class="n">${C(x.A)}</td><td class="n"><span class="st ${tone(x.safe6 * 100, 60, 70)}">${P(x.safe6)}</span></td><td class="n">${P(x.nobody)}</td><td class="n">${x.food} days</td><td class="n">${x.water}%</td><td class="n">${x.power}%</td><td class="n">${x.hosp}%</td></tr>`).join("")}</tbody></table>
        <div class="src">Furthest ahead: ${best.map(x => `${esc(x.n)} ${P(x.safe6)}`).join(" · ")}. Food, water, power and hospital figures are simulated.</div></div>
      <div class="cols"><div class="sec"><h2>Do we need to change course?</h2><p class="sub">Our rule: if fewer than half of cases have someone going within 3 hours, we send the first message to the area's anganwadi worker instead.</p>
          <div class="ind-big"><b>${P(g3)}</b>have someone going within 3 hours</div><span class="st green">No change needed</span></div>
        <div class="sec"><h2>Still safe a week later?</h2><p class="sub">Welfare calls on Days 3 and 7 check that everyone is still with the adult who came. Limit: under 2% separated again.</p>
          <div class="ind-big"><b>Day 3</b>first calls</div><span class="st">Not measured yet</span></div></div>
      <div class="src">Simulated numbers from the prototype's model. In use, every number comes from the case log, which timestamps each step, so nothing new is collected about anyone.</div></div></div>`;
  }

  function render() {
    MAP.hide(); header();
    const pg = $("#page");
    pg.innerHTML = S.page === "situation" ? situation() : S.page === "doing" ? doing() : S.page === "resources" ? resources() : S.page === "network" ? network() : S.page === "info" ? info() : S.page === "sites" ? sites() : S.page === "fair" ? fair() : world();
    let ran = false; const draw = () => { if (ran) return; ran = true; if (S.page === "situation") { const el = $("#map"); if (el) MAP.render(el, mapOpts()); trend(); } if (S.page === "world") worldMap(); if (S.page === "sites") vacantMap(); };
    requestAnimationFrame(draw); setTimeout(draw, 60);
    save();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-trade],[data-fix],[data-patrol],[data-essplan],[data-export],[data-page],[data-scope],[data-ti],[data-qtab],[data-layer],[data-colour],[data-rebalance],[data-do],[data-undo],[data-q],[data-close],[data-back],[data-team],[data-siteask],[data-ask],[data-mirror],[data-wsel]");
    if (!t) return; const d = t.dataset;
    if (d.export) { exportLog(); return; }
    if (d.patrol) { S.patrols = !S.patrols; render(); return; }
    if (d.trade) { S.trades = S.trades || {}; S.trades[d.trade] = !S.trades[d.trade]; render(); return; }
    if (d.fix != null) { S.fixSent = S.fixSent || {}; S.fixSent[d.fix] = true; render(); return; }
    if (d.essplan) { S.essPlan = true; render(); return; }
    if (d.page) { S.page = d.page; S.sel = null; }
    else if (d.scope) { S.scope = d.scope; S.state = null; S.sel = null; }
    else if (d.ti != null) S.ti = +d.ti;
    else if (d.qtab) S.qtab = d.qtab;
    else if (d.layer) S.layers[d.layer] = !S.layers[d.layer];
    else if (d.colour) S.colour = d.colour;
    else if (d.rebalance) S.rebalanced = !S.rebalanced;
    else if (d.do) { const q = GV.queue.find(x => x.id === d.do); if (d.which === "alt" && q.alt && q.alt.open) { S.sel = { type: "q", id: q.id }; } else { S.done[d.do] = d.which; S.sel = { type: "q", id: d.do }; } e.stopPropagation(); }
    else if (d.undo) delete S.done[d.undo];
    else if (d.close) S.sel = null;
    else if (d.back) { S.state = null; S.sel = null; }
    else if (d.team) S.wardTeam[d.team] = true;
    else if (d.siteask != null) S.siteAsk[d.siteask] = true;
    else if (d.ask != null) S.asked[d.ask] = (S.asked[d.ask] || 0) + 50;
    else if (d.mirror) S.mirror = !S.mirror;
    else if (d.wsel != null) S.wsel = d.wsel || null;
    else if (d.q) { S.sel = { type: "q", id: d.q }; const q = GV.queue.find(x => x.id === d.q); if (q && q.scope === "india" && S.scope === "delhi") S.scope = "india"; }
    render();
  });
  // For the guided tour and the Reset button: open a page, or put everything back as it was at 7:10 am
  RC.govUI = { page: p => { if (S.page !== p) { S.page = p; S.sel = null; render(); } }, reset: () => { S = def(); save(); render(); } };
  document.addEventListener("click", e => { if (e.target.closest("[data-greset]")) RC.govUI.reset(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && S.sel) { S.sel = null; render(); } if (e.key === "Enter" && e.target.dataset && e.target.dataset.q) e.target.click(); });
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(render, 150); });
  render();
})(window.RC);
