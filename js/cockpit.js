/* Still Here — government view. Situation: needs-action queue · map · slide-over detail. Plus Resources, Fairness & law, World. */
(function (RC) {
  const M = RC.Model, MAP = RC.Map, CH = RC.Chart, GV = RC.gov, esc = MAP.esc, C = M.compact, P = M.pct, I = RC.icon;
  const KEY = "stillhere-gov-v1", $ = s => document.querySelector(s);
  const SEVL = { urgent: "Urgent", high: "High", watch: "Watch" }, SEVC = { urgent: "var(--apple-red)", high: "var(--apple-orange)", watch: "var(--apple-gray)" }, SEVR = { urgent: 0, high: 1, watch: 2 };
  const SEVS = { urgent: "red", high: "orange", watch: "", done: "green" }, sev = (q) => `<span class="st ${SEVS[q.done ? "done" : q.sev]}">${q.done ? "Handled" : SEVL[q.sev]}</span>`;
  const SMALL = new Set(["a", "an", "the", "to", "of", "in", "on", "for", "and", "or", "at", "by", "as", "with", "from"]);
  const tc = t => String(t).split(" ").map((w, i) => (i && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const done = t => `<span class="donetext">${I("check", 15)}${esc(t)}</span>`;
  const COSI = Math.cos(22.5 * Math.PI / 180), toLL = ([x, y]) => [x / (30 * COSI) + 68, 37.3 - y / 30];
  const ZONES = RC.avoid.map((z, i) => Object.assign({ id: "a" + i }, z)).concat([{ id: "tar", z: "Tarapur exclusion zone", why: "Reactor shutdown in progress with too few operators. Keep 5 km away.", lonlat: [72.66, 19.83], km: 5 }, { id: "mum", z: "Mumbai creeks", why: "Mangrove loss. Flood risk at high tide, 13:40.", lonlat: [72.86, 19.07], km: 3 }]);
  function def() { return { page: "situation", scope: "delhi", state: null, ti: 0, qtab: "problems", sel: null, done: {}, layers: { people: true, problems: true, help: true, hazards: true }, siteAsk: {}, asked: {}, mirror: true, wardTeam: {}, wsel: null }; }
  let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.page) return Object.assign(def(), s); } catch (e) {} return def(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const T = () => M.TIMES[S.ti], H = () => T().h, now = () => S.ti === 0;
  const scopeAgg = h => S.scope === "delhi" ? M.scopes.delhi(h) : S.state ? M.scopes.state(S.state, h) : M.scopes.india(h);
  const scopeName = () => S.scope === "delhi" ? "Delhi" : S.state || "India";
  const wardRank = h => M.byState.Delhi.map(u => ({ u, v: M.at(u, h) })).filter(x => !x.v.nodata).sort((a, b) => b.v.u5 - a.v.u5);
  const slowest = h => Object.keys(M.byState).map(n => ({ n, v: M.scopes.state(n, h) })).filter(x => x.v.A > 1e6).sort((a, b) => a.v.share - b.v.share)[0];
  const row = (l, v) => `<div class="row"><span>${l}</span><span>${v}</span></div>`;
  const projNote = () => now() ? "" : `<div class="src">Projection for ${esc(T().label)}</div>`;

  function items() {
    const h = H();
    return GV.queue.filter(q => S.scope === "india" || q.scope === "delhi").map(q => {
      const o = Object.assign({}, q);
      if (q.dyn === "children") { const v = M.scopes.delhi(h), top = wardRank(h).slice(0, 3); o.title = `${C(v.u5)} small children nobody is coming for`; o.what = `Under five, in Delhi, and nobody in their circle has answered for two hours. Worst wards: ${top.map(x => `${x.u.name} (${Math.round(x.v.u5)})`).join(", ")}.`; }
      if (q.dyn === "slowest") { const sl = slowest(h); o.title = `${sl.n} is being reached slowest`; o.what = `${P(sl.v.share)} of ${C(sl.v.A)} people alone there have been reached, the lowest of any large state.`; o.state = sl.n; o.where = sl.n; o.lonlat = toLL(RC.GEO.india.states[sl.n].c); }
      o.done = S.done[q.id] || null; return o;
    });
  }
  const sorted = () => items().sort((a, b) => (!!a.done - !!b.done) || SEVR[a.sev] - SEVR[b.sev]);

  /* ---------- header ---------- */
  function header() {
    $("#tabs").innerHTML = [["situation", "Situation"], ["resources", "Resources"], ["fair", "Fairness & law"], ["world", "World"]].map(([k, l]) => `<button class="${S.page === k ? "on" : ""}" data-page="${k}">${l}</button>`).join("");
    $("#who").textContent = `${GV.persona.org} · ${GV.persona.role}`;
    const r = $("#restricted"); if (r && !r.querySelector("svg")) r.insertAdjacentHTML("afterbegin", I("shield-alert", 13));
  }
  const timeSeg = () => `<span class="lab">Time</span><div class="seg">${M.TIMES.map((t, i) => `<button class="${S.ti === i ? "on" : ""}" data-ti="${i}">${t.short}</button>`).join("")}</div><span class="proj ${now() ? "now" : ""}" data-help="projection">${now() ? "Live, 07:10" : "Projection for " + esc(T().label)}</span>`;

  /* ---------- situation ---------- */
  function kpis() {
    const h = H(), v = scopeAgg(h), its = items(), open = its.filter(i => i.sev === "urgent" && !i.done).length, all = its.filter(i => !i.done).length;
    const tile = (help, l, val, d, st) => `<div class="kpi" data-help="${help}"><span class="info">${I("info", 15)}</span><div class="l">${l}</div><div class="v">${val}</div><div class="d">${st ? `<span class="st ${st}">${d}</span>` : d}</div></div>`;
    return tile("vanish", RC.TERMS.vanish, "0", "none since 14:32:07", "green")
      + tile("alone", RC.TERMS.alone, C(v.A), "in " + scopeName())
      + tile("reached", RC.TERMS.reached, C(v.reached), `${P(v.share)} · +${C(v.lastHour)} last hour`)
      + tile("nocircle", RC.TERMS.nocircle, C(v.u5), "under 5 · 2 h, no answer", "red")
      + tile("urgent", RC.TERMS.urgent, String(open), `${all} open in ${S.scope === "delhi" ? "Delhi" : "India"}`, open ? "red" : "green");
  }
  function queueHtml() {
    const its = sorted(), n = its.filter(i => !i.done).length;
    const head = `<div class="q-head"><b>Needs action</b><button class="btn btn-compact btn-plain" data-export="1" title="Save the queue and every action taken as a file">${I("file-down", 15)}Export</button><div class="seg"><button class="${S.qtab === "problems" ? "on" : ""}" data-qtab="problems">Problems ${n}</button><button class="${S.qtab === "updates" ? "on" : ""}" data-qtab="updates">Updates</button></div></div>`;
    let list = "";
    if (S.qtab === "updates") list = GV.updates.map(u => `<div class="upd"><div class="m">${u.t} · <b>${esc(u.from)}</b> · ${esc(u.what)}</div><div>${esc(u.text)}</div></div>`).join("");
    else list = its.map(q => { const sel = S.sel && S.sel.type === "q" && S.sel.id === q.id; const d = q.done ? (q[q.done] || q.act) : null;
      return `<div class="qi ${q.sev} ${q.done ? "done" : ""} ${sel ? "on" : ""}" data-q="${q.id}" tabindex="0">
        <div class="qi-top">${sev(q)}<span>${q.t} · ${esc(q.where)}</span></div>
        <div class="qi-title">${esc(q.title)}</div><div class="qi-why">${esc(q.why)}</div>
        <div class="qi-foot">${d ? done(d.done || "Opened") : `<button class="btn btn-compact" data-do="${q.id}" data-which="act">${esc(tc(q.act.label))}</button>`}</div></div>`; }).join("");
    return head + `<div class="q-list">${list}</div>`;
  }
  function crumb() {
    if (S.scope === "delhi") return `<b>Delhi</b> · 290 wards`;
    if (S.state) return `<button data-back="1">‹ India</button> › <b>${esc(S.state)}</b> · its districts`;
    return `<b>India</b> · click a state for its districts`;
  }
  function chips() { return [["people", "People", "var(--s3)"], ["problems", "Problems", "var(--red)"], ["help", "Supplies", "var(--blue)"], ["hazards", "Hazards", "var(--amber)"]].map(([k, l, c]) => `<button class="chip ${S.layers[k] ? "on" : ""}" data-layer="${k}"><i style="background:${c}"></i>${l}</button>`).join(""); }
  function situation() {
    return `<div class="filters"><span class="lab">Area</span><div class="seg"><button class="${S.scope === "delhi" ? "on" : ""}" data-scope="delhi">Delhi</button><button class="${S.scope === "india" ? "on" : ""}" data-scope="india">India</button></div>${timeSeg()}</div>
      <div class="kpis">${kpis()}</div>
      <div class="sit-body"><aside class="queue">${queueHtml()}</aside>
        <section class="mapzone ${S.sel ? "has-drawer" : ""}"><div class="map-tools"><span class="crumb">${crumb()}</span>${chips()}</div>
          <div class="stage"><div class="mapsvg" id="map"></div>
            <div class="overlay" style="left:12px;top:12px">${MAP.legend()}</div>
            <div class="overlay ov-trend"><div class="t">Is it getting better? <b id="trendname"></b></div><div id="trend"></div></div>
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
        <h3>What to do</h3>${d ? `<p>${done(d.done || "")}</p><button class="btn btn-compact btn-plain" data-undo="${q.id}">Undo</button>` : `<div style="display:flex;flex-direction:column;gap:8px"><button class="btn btn-prominent btn-block" data-do="${q.id}" data-which="act">${esc(tc(q.act.label))}</button>${q.alt && !q.alt.open ? `<button class="btn btn-block" data-do="${q.id}" data-which="alt">${esc(tc(q.alt.label))}</button>` : ""}</div>`}`;
      if (q.dyn === "children") body += `<h3>By ward, worst first</h3><table class="rank">${wardRank(H()).slice(0, 10).map(x => `<tr><td>${esc(x.u.name)}</td><td class="n">${Math.round(x.v.u5)}</td><td class="n">${S.wardTeam[x.u.key] ? done("Team sent") : `<button class="btn btn-compact" data-team="${x.u.key}">Send a Team</button>`}</td></tr>`).join("")}</table>`;
      body += `<div class="src">Source: ${esc(q.src)}</div>`;
    } else if (s.type === "region") {
      const v = regionAgg(s), name = regionName(s), kind = s.kind === "ward" ? "Ward · Delhi" : s.kind === "district" ? `District · ${esc((M.byKey[s.key] || {}).state || "")}` : "State";
      head = `<div><span class="who">${kind}</span><h2>${esc(name)}</h2></div>`;
      if (!v || v.nodata) body = `<p>No phone network here, so there is no data. Shown grey on the map, never red. A runner was sent at 06:50.</p>`;
      else body = `<div class="nums"><div class="num" data-help="alone"><div class="l">People alone</div><div class="v">${C(v.A)}</div></div><div class="num" data-help="reached"><div class="l">Reached and safe</div><div class="v">${P(v.share)}</div></div><div class="num" data-help="claimed"><div class="l">Someone on the way</div><div class="v">${C(v.claimed)}</div></div><div class="num" data-help="nocircle"><div class="l">Small children, nobody coming</div><div class="v">${C(v.u5)}</div></div></div>${CH.stack(v)}
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
    if (S.layers.people) o.fill = k => { const v = valOf(k); return v ? M.color(v) : null; };
    o.sel = S.sel && S.sel.type === "region" ? S.sel.key : null;
    if (view === "delhi") o.labels = wardRank(h).slice(0, 3).map(x => ({ k: x.u.key, t: x.u.name })).concat(o.sel && M.byKey[o.sel] ? [{ k: o.sel, t: M.byKey[o.sel].name, strong: true }] : []);
    else if (view === "india") o.labels = Object.entries(RC.GEO.india.states).filter(([n]) => (M.scopes.state(n, h).A > 3e5)).map(([n, st]) => ({ at: st.c, t: st.code }));
    else { const ds = (M.byState[S.state] || []).slice().sort((a, b) => b.A - a.A).slice(0, 6); o.labels = ds.map(u => ({ k: u.key, t: u.name })); }
    o.pins = [];
    if (S.layers.problems) {
      its.filter(q => view === "delhi" ? q.scope === "delhi" : q.scope === "india").forEach(q => o.pins.push({ id: q.id, lonlat: q.lonlat, color: q.done ? "var(--green)" : SEVC[q.sev], glyph: q.done ? "✓" : "!", pulse: q.sev === "urgent" && !q.done, sel: S.sel && S.sel.type === "q" && S.sel.id === q.id, r: 8 }));
      if (view !== "delhi") { const n = its.filter(q => q.scope === "delhi" && !q.done).length; if (n) o.pins.push({ id: "delhi-cluster", lonlat: [77.2, 28.6], color: "var(--red)", glyph: String(n), r: 9, label: "Delhi" }); }
    }
    if (S.layers.help) {
      const inD = ll => ll[0] > 76.83 && ll[0] < 77.35 && ll[1] > 28.4 && ll[1] < 28.89;
      o.arcs = GV.supplies.filter(f => view === "delhi" ? inD(f.fromLL) && inD(f.toLL) : !(inD(f.fromLL) && inD(f.toLL))).map(f => ({ from: f.fromLL, to: f.toLL, fromLabel: f.from, toLabel: view === "delhi" ? "" : f.to.split(" ")[0] }));
    }
    if (S.layers.hazards) o.zones = ZONES;
    o.hover = k => {
      if (k.indexOf("pin:") === 0) { const id = k.slice(4); if (id === "delhi-cluster") return `<b>Delhi</b><div>${its.filter(q => q.scope === "delhi" && !q.done).length} problems open.</div><div class="hintl">Click to switch to Delhi</div>`; const q = its.find(x => x.id === id); return q ? `<b>${esc(q.title)}</b><div>${esc(q.what)}</div><div class="hintl">Click for what to do</div>` : ""; }
      if (k.indexOf("zone:") === 0) { const z = ZONES.find(x => x.id === k.slice(5)); return z ? `<b>${esc(z.z)}</b><div>${esc(z.why)}</div>` : ""; }
      const v = valOf(k), name = view === "india" ? k : (M.byKey[k] || {}).name || k;
      if (!v) return `<b>${esc(name)}</b>`;
      if (v.nodata) return `<b>${esc(name)}</b><div>No phone network, so no data. Shown grey, never red.</div>`;
      return `<b>${esc(name)}</b>${row("People alone", C(v.A))}${row("Reached and safe", P(v.share))}${row("Someone on the way", C(v.claimed))}${row("Nobody yet", C(v.unclaimed))}${row("Small children, nobody coming", C(v.u5))}${projNote()}<div class="hintl">${view === "india" ? (k === "Delhi" ? "Click to open Delhi's wards" : "Click to see its districts") : "Click for detail"}</div>`;
    };
    o.click = k => { if (view === "india") { if (k === "Delhi") { S.scope = "delhi"; S.state = null; S.sel = null; } else { S.state = k; S.sel = { type: "region", kind: "state", key: k }; } } else S.sel = { type: "region", kind: view === "delhi" ? "ward" : "district", key: k }; render(); };
    o.clickPin = id => { if (id === "delhi-cluster") { S.scope = "delhi"; S.state = null; S.sel = null; } else S.sel = { type: "q", id }; render(); };
    o.clickEmpty = () => { if (S.sel) { S.sel = null; render(); } };
    return o;
  }
  function trend() {
    const el = $("#trend"); if (!el) return;
    const s = S.sel && S.sel.type === "region" ? S.sel : null, fn = s ? (h => regionAgg(Object.assign({}, s)) && (s.kind === "state" ? M.scopes.state(s.key, h) : M.scopes.unit(s.key, h))) : scopeAgg;
    $("#trendname").textContent = s ? regionName(s) : scopeName();
    drawTrend(el, fn, 120);
    const dc = $("#drchart"); if (dc && s) drawTrend(dc, h => s.kind === "state" ? M.scopes.state(s.key, h) : M.scopes.unit(s.key, h), 140);
  }
  function drawTrend(el, fn, height) {
    const pts = M.series(fn, 2);
    CH.line(el, { height, xmin: 0, xmax: 50, ymax: 1, yfmt: y => Math.round(y * 100) + "%", xlabel: h => M.hourLabel(h), marker: H(), markerLabel: T().short,
      xticks: [{ x: 0, l: "Day 1" }, { x: 26, l: "Day 2" }, { x: 50, l: "Day 3" }],
      series: [{ name: "Reached", color: "var(--s3)", pts: pts.map(p => ({ x: p.h, y: p.share })) }, { name: "Nobody yet", color: "var(--s0)", pts: pts.map(p => ({ x: p.h, y: p.unclaimedShare })) }] });
  }

  /* ---------- resources ---------- */
  function resources() {
    const sites = GV.sites.map((x, i) => Object.assign({ i }, x)).sort((a, b) => a.present / a.total - b.present / b.total);
    const meter = (p, t) => { const f = p / t, c = f < 0.3 ? "var(--apple-red)" : f < 0.6 ? "var(--apple-orange)" : "var(--apple-green)"; return `<div class="meter"><div class="bar"><i style="width:${Math.round(f * 100)}%;background:${c}"></i></div><span>${p.toLocaleString("en-IN")} of ${t.toLocaleString("en-IN")}</span></div>`; };
    return `<div class="page"><div class="page-in"><h1>Resources</h1><p class="lede">Who is at the places that keep people alive, who can be asked to come, and what is already on its way. The staff counts use the same phone signal as everything else: whose phone is at the site.</p>
      <div class="sec"><h2>Essential sites short of staff<span class="inl-info" data-help="short">${I("info", 15)}</span></h2><p class="sub">Worst first. Under 30% of usual staff is red, under 60% is orange.</p>
        <table class="t"><thead><tr><th>Site</th><th>What It Does</th><th>Staff on Site Now</th><th></th></tr></thead><tbody>${sites.map(x => `<tr><td><b>${esc(x.site)}</b></td><td>${esc(x.does)}</td><td>${meter(x.present, x.total)}</td><td class="n">${S.siteAsk[x.i] ? done(`Asked 07:2${x.i} · first arrivals 08:30`) : `<button class="btn btn-compact" data-siteask="${x.i}">Ask for Staff</button>`}</td></tr>`).join("")}</tbody></table>
        <div class="src">Source: employer rosters matched to phone location, 07:10</div></div>
      <div class="sec"><h2>People on professional registers<span class="inl-info" data-help="register">${I("info", 15)}</span></h2><p class="sub">Asked, not conscripted. Each ask is a message with the site, the shift and what it earns.</p>
        <table class="t"><thead><tr><th>Who</th><th>Register</th><th class="n">Still Here</th><th class="n">Asked</th><th class="n">Came</th><th></th></tr></thead><tbody>${GV.people.map((p, i) => `<tr><td><b>${esc(p.role)}</b></td><td>${esc(p.reg)}</td><td class="n">${p.alive.toLocaleString("en-IN")} of ${p.of.toLocaleString("en-IN")}</td><td class="n">${(p.asked + (S.asked[i] || 0)).toLocaleString("en-IN")}</td><td class="n">${p.came.toLocaleString("en-IN")}</td><td class="n"><button class="btn btn-compact" data-ask="${i}">Ask 50 More</button></td></tr>`).join("")}</tbody></table></div>
      <div class="sec restricted"><span class="tag">${I("shield-alert", 14)}Restricted</span><h2>Supplies on the way</h2><p class="sub">Routes and arrival times stay in this view. The public sees only that a supply has left, two hours after it left.</p>
        <table class="t"><thead><tr><th>What</th><th>How</th><th>From → To</th><th>Left</th><th>Arrives</th><th>Route</th></tr></thead><tbody>${GV.supplies.map(f => `<tr><td><b>${esc(f.what)}</b></td><td>${esc(f.how)}</td><td>${esc(f.from)} → ${esc(f.to)}</td><td>${f.dep}</td><td>${esc(f.eta)}</td><td>${esc(f.route)}</td></tr>`).join("")}</tbody></table></div>
    </div></div>`;
  }

  /* ---------- fairness & law ---------- */
  function fair() {
    const rows = GV.fair, W = 760, L = 170, R = 200, rh = 30, Ht = rows.length * rh + 34, max = 0.25, x = v => L + v / max * (W - L - R);
    let svg = `<svg class="dumb" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Share of people against share of supplies by district">`;
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach(g => svg += `<line x1="${x(g)}" x2="${x(g)}" y1="6" y2="${Ht - 24}" class="grid"/><text x="${x(g)}" y="${Ht - 8}" text-anchor="middle" class="axis">${Math.round(g * 100)}%</text>`);
    rows.forEach((r, i) => { const y = 18 + i * rh, over = r.alloc > r.pop * 1.3, under = r.alloc < r.pop * 0.7;
      svg += `<g data-help=""><text x="${L - 10}" y="${y + 4}" text-anchor="end" style="font-size:12.5px;fill:var(--label)">${esc(r.d)}</text><line x1="${x(r.pop)}" x2="${x(r.alloc)}" y1="${y}" y2="${y}" style="stroke:${over ? "var(--apple-red)" : under ? "var(--apple-orange)" : "var(--label3)"};stroke-width:3;stroke-linecap:round"/><circle cx="${x(r.pop)}" cy="${y}" r="6" style="fill:var(--label2)"/><circle cx="${x(r.alloc)}" cy="${y}" r="6" style="fill:var(--apple-blue)"/>${over || under ? `<text x="${Math.max(x(r.pop), x(r.alloc)) + 12}" y="${y + 4}" style="font-size:12.5px;font-weight:500;fill:var(--label2)">${over ? "gets more than its share" : "gets less than its share"}</text>` : ""}</g>`; });
    svg += `</svg>`;
    return `<div class="page"><div class="page-in"><h1>Fairness & law</h1><p class="lede">Is help going where the people are, what can be done with places nobody owns any more, and who is reached first when there are not enough teams.</p>
      <div class="sec"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><h2>Is help going where the people are?</h2><p class="sub" style="margin:0">Grey dot: the district's share of Delhi's surviving people. Blue dot: its share of the food, water and staff sent today.</p></div>
        <button class="toggle ${S.mirror ? "on" : ""}" data-mirror="1" data-help="mirror" aria-pressed="${S.mirror}"><span>Shown to the public</span><span class="sw"></span></button></div>
        <div style="margin-top:12px">${svg}</div>
        <p class="sub" style="margin-top:8px">${S.mirror ? "Anyone can see that New Delhi, the capital, is getting three times its share while North East Delhi gets half. This public view is the only check the product offers against a government that looks after the capital first. It is not enough on its own." : "<span class='st red'>Hidden. The public can no longer see this, and the fact that it was turned off is itself recorded and shown publicly.</span>"}</p></div>
      <div class="cols">
        <div class="sec"><h2>Places nobody owns any more<span class="inl-info" data-help="openzone">${I("info", 15)}</span></h2><p class="sub">Declared under Section 65 of the Disaster Management Act 2005.</p>
          ${GV.zones.map(z => `<div class="zrow"><div class="zt"><b>${esc(z.zone)}</b><span class="st ${z.status === "Open" ? "green" : z.status.indexOf("Taken") === 0 ? "orange" : ""}">${esc(z.status)}</span></div><div class="sub" style="margin:2px 0 0">${esc(z.what)}</div><div class="zr">${esc(z.rule)}</div></div>`).join("")}
          <p class="sub" style="margin-top:10px">A declared open zone is a declared target. Declare only what can't be held anyway.</p></div>
        <div class="sec restricted"><span class="tag">${I("shield-alert", 14)}Restricted · District Magistrate and Chief Medical Officer</span><h2>Who is reached first<span class="inl-info" data-help="triage">${I("info", 15)}</span></h2><p class="sub">When there are more cases than teams.</p>
          <table class="t"><thead><tr><th>Group</th><th class="n">Cases</th><th>Order</th></tr></thead><tbody>${GV.triage.map(t => `<tr><td>${esc(t.q)}</td><td class="n">${t.n.toLocaleString("en-IN")}</td><td>${t.order}</td></tr>`).join("")}</tbody></table>
          <h2 style="margin-top:16px">Health records</h2><p class="sub" style="margin:2px 0 0">Anyone verified as caring for a survivor can open that person's health record at a care point. India's ABHA system already holds 79.7 crore accounts and 65 crore linked records.</p></div>
      </div></div></div>`;
  }

  /* ---------- world ---------- */
  const wshare = (iso, h) => { const s0 = RC.world.reached[iso]; if (s0 == null) return null; const k = -Math.log(1 - s0) / M.NOW; return 1 - Math.exp(-k * h); };
  function world() {
    const h = H(), names = { SGP: "Singapore" }; RC.GEO.world.countries.forEach(c => names[c.id] = c.n);
    const ranked = Object.keys(RC.world.reached).map(iso => ({ iso, n: names[iso] || iso, s: wshare(iso, h) })).sort((a, b) => a.s - b.s);
    const sel = S.wsel ? ranked.find(r => r.iso === S.wsel) : null;
    const aidN = iso => GV.world.aid.filter(a => a.to === iso), aidF = iso => GV.world.aid.filter(a => a.from === iso);
    return `<div class="filters">${timeSeg()}</div><div class="world"><div class="wmap"><div class="mapsvg" id="wmap" style="position:absolute;inset:10px"></div><div class="overlay" style="left:12px;bottom:12px">${MAP.legend()}</div></div>
      <div class="wside">${sel ? `<div class="sec"><h2>${esc(sel.n)}</h2><div class="nums" style="margin-top:8px"><div class="num"><div class="l">Alone people reached</div><div class="v">${P(sel.s)}</div></div><div class="num"><div class="l">Aid arriving</div><div class="v">${aidN(sel.iso).length}</div></div></div>${aidN(sel.iso).map(a => `<p class="sub" style="margin:8px 0 0">From ${esc(names[a.from] || a.from)}: ${esc(a.what)}, left ${a.t}</p>`).join("")}${aidF(sel.iso).map(a => `<p class="sub" style="margin:8px 0 0">Sending to ${esc(names[a.to] || a.to)}: ${esc(a.what)}</p>`).join("")}<button class="btn btn-compact" style="margin-top:12px" data-wsel="">Close</button></div>` : ""}
        <div class="sec"><h2>Furthest behind</h2><p class="sub">Share of people alone who have been reached. Countries doing better send aid to these.</p>${ranked.slice(0, 8).map(r => `<div class="wrow" data-wsel="${r.iso}"><span class="wn">${esc(r.n)}</span><div class="meter" style="flex:1;min-width:0"><div class="bar"><i style="width:${Math.round(r.s * 100)}%;background:${M.color({ share: r.s })}"></i></div><span>${P(r.s)}</span></div></div>`).join("")}</div>
        <div class="sec"><h2>Aid on the way</h2>${GV.world.aid.map(a => `<div class="aid"><b>${esc(names[a.from] || a.from)} → ${esc(names[a.to] || a.to)}</b><span>${esc(a.what)}, left ${a.t}</span></div>`).join("")}</div>
        <div class="sec"><h2>Live world layer</h2><p class="sub">World Monitor, an open-source dashboard by koala73, already shows live news, flights, ships and outages for the whole world. In the real product it runs beside this view on the government network. Still Here adds the one layer it lacks: people.</p><a class="btn btn-prominent btn-block" href="${RC.WMON}" target="_blank" rel="noopener">Open World Monitor ${I("external-link", 15)}</a><p class="sub" style="margin:10px 0 0">Opens the public site, which shows today's real world, not the Snap.</p></div>
      </div></div>`;
  }
  function worldMap() {
    const el = $("#wmap"); if (!el) return; const h = H(), cents = {}; RC.GEO.world.countries.forEach(c => cents[c.id] = [c.c[0] / 3 - 180, 90 - c.c[1] / 3]);
    MAP.render(el, { view: "world", aria: "World map", sel: S.wsel, fill: iso => { const s = wshare(iso, h); return s == null ? null : M.color({ share: s }); },
      labels: ["IND", "CHN", "USA", "BRA", "RUS", "AUS", "NGA", "IDN", "DEU", "ZAF", "SAU", "CAN", "ARG", "EGY"].filter(i => cents[i]).map(i => ({ ll: cents[i], t: (RC.GEO.world.countries.find(c => c.id === i) || {}).n })),
      arcs: GV.world.aid.filter(a => cents[a.from] && cents[a.to]).map(a => ({ from: cents[a.from], to: cents[a.to] })),
      hover: iso => { const c = RC.GEO.world.countries.find(x => x.id === iso); const s = wshare(iso, h); return c ? `<b>${esc(c.n)}</b>${s == null ? "<div>No data yet</div>" : row("Alone people reached", P(s))}${projNote()}<div class="hintl">Click for detail</div>` : ""; },
      click: iso => { S.wsel = iso; render(); }, clickEmpty: () => { if (S.wsel) { S.wsel = null; render(); } } });
  }

  function exportLog() {
    const rows = sorted().map(q => ({ id: q.id, severity: q.sev, raised_at: q.t, where: q.where, title: q.title, what_happened: q.what, why_it_matters: q.why,
      status: q.done ? "handled" : "open", action_taken: q.done ? (q[q.done] || q.act).label : null, outcome: q.done ? (q[q.done] || q.act).done || null : null, source: q.src }));
    const out = { record_type: "incident_log", note: "Situation queue from the Still Here government view. Simulated data.", authority: GV.persona.org, scope: scopeName(), exported_at: "Day 1 07:10", items: rows,
      teams_sent_to_wards: Object.keys(S.wardTeam).map(k => (M.byKey[k] || {}).name || k) };
    const b = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "still-here-incident-log.json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- render ---------- */
  function render() {
    MAP.hide(); header();
    const pg = $("#page");
    pg.innerHTML = S.page === "situation" ? situation() : S.page === "resources" ? resources() : S.page === "fair" ? fair() : world();
    let ran = false; const draw = () => { if (ran) return; ran = true; if (S.page === "situation") { const el = $("#map"); if (el) MAP.render(el, mapOpts()); trend(); } if (S.page === "world") worldMap(); };
    requestAnimationFrame(draw); setTimeout(draw, 60);
    save();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-export],[data-page],[data-scope],[data-ti],[data-qtab],[data-layer],[data-do],[data-undo],[data-q],[data-close],[data-back],[data-team],[data-siteask],[data-ask],[data-mirror],[data-wsel]");
    if (!t) return; const d = t.dataset;
    if (d.export) { exportLog(); return; }
    if (d.page) { S.page = d.page; S.sel = null; }
    else if (d.scope) { S.scope = d.scope; S.state = null; S.sel = null; }
    else if (d.ti != null) S.ti = +d.ti;
    else if (d.qtab) S.qtab = d.qtab;
    else if (d.layer) S.layers[d.layer] = !S.layers[d.layer];
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
  document.addEventListener("keydown", e => { if (e.key === "Escape" && S.sel) { S.sel = null; render(); } if (e.key === "Enter" && e.target.dataset && e.target.dataset.q) e.target.click(); });
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(render, 150); });
  render();
})(window.RC);
