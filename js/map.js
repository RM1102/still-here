/* Still Here — maps, hover cards and charts. Inline SVG, no tiles, no network.
   Every stroke, font and radius is multiplied by the map's units-per-pixel, so labels look the same at any zoom (audit A4, A9).
   Colour: one green scale for "share reached" (light to dark in light mode, dark to bright in dark mode); no data is hatched grey. */
window.RC = window.RC || {};
(function (RC) {
  const G = () => RC.GEO;
  const COSI = Math.cos(22.5 * Math.PI / 180), COSD = Math.cos(28.6 * Math.PI / 180);
  const pi = (lon, lat) => [(lon - 68.0) * 30 * COSI, (37.3 - lat) * 30];
  const pd = (lon, lat) => [(lon - 76.83) * 1800 * COSD, (28.89 - lat) * 1800];
  const pw = (lon, lat) => [(lon + 180) * 3, (90 - lat) * 3];
  const pc = c => (lon, lat) => [(lon - c.proj[0]) * c.proj[2] * c.proj[3], (c.proj[1] - lat) * c.proj[2]];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => Math.round(n).toLocaleString("en-IN");
  let uid = 0;

  /* ---------- Hover card (one for the page) ---------- */
  let tip, tipKey = null;
  function tipEl() { if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); } return tip; }
  function place(x, y) { const t = tipEl(), r = t.getBoundingClientRect(); let l = x + 16, tp = y + 16; if (l + r.width > innerWidth - 8) l = x - r.width - 16; if (tp + r.height > innerHeight - 8) tp = y - r.height - 12; t.style.left = Math.max(8, l) + "px"; t.style.top = Math.max(8, tp) + "px"; }
  function show(key, html, x, y) { const t = tipEl(); if (tipKey !== key) { t.innerHTML = html; tipKey = key; } t.style.display = "block"; place(x, y); }
  function hide() { if (tip) tip.style.display = "none"; tipKey = null; }
  const helpHtml = H => `<b>${esc(H.t)}</b><div>${esc(H.b)}</div>${H.s ? `<div class="src">Source: ${esc(H.s)}</div>` : ""}`;
  function hoverAt(target, x, y) {
    if (dragging) return;
    const h = target.closest && target.closest("[data-help],[data-hk]");
    if (!h) return hide();
    if (h.dataset.help) { const H = RC.HELP && RC.HELP[h.dataset.help]; return H ? show("help:" + h.dataset.help, helpHtml(H), x, y) : hide(); }
    const owner = h.closest("[data-map]"); const html = owner && owner._hover ? owner._hover(h.dataset.hk) : "";
    return html ? show("map:" + h.dataset.hk + ":" + (owner._ver || 0), html, x, y) : hide();
  }
  document.addEventListener("mousemove", e => hoverAt(e.target, e.clientX, e.clientY), { passive: true });
  document.addEventListener("mouseleave", hide);
  document.addEventListener("scroll", hide, true);
  // Touch and keyboard: tap or focus an info target to show its card
  document.addEventListener("click", e => { const h = e.target.closest("[data-help]"); if (h && (e.pointerType === "touch" || document.body.classList.contains("phone"))) { const r = h.getBoundingClientRect(); hoverAt(h, r.left, r.bottom); } }, true);
  document.addEventListener("focusin", e => { const h = e.target.closest && e.target.closest("[data-help]"); if (h) { const r = h.getBoundingClientRect(); hoverAt(h, r.left, r.bottom); } });
  document.addEventListener("focusout", hide);

  /* ---------- Map ---------- */
  function views(o) {
    const g = G();
    if (o.view === "state" && o.state === "Delhi") o = Object.assign({}, o, { view: "delhi" });
    if (o.view === "city" && o.city === "delhi") o = Object.assign({}, o, { view: "delhi" });
    if (o.view === "india") return { o, proj: pi, vb: [0, 0, g.india.w, g.india.h], kmU: 30 / 111, outline: g.india.outline, shapes: g.india.districts.map(d => ({ k: d.s, d: d.d })), sig: "india" };
    if (o.view === "state") {
      const st = g.india.states[o.state], b = st.b, p = Math.max(b[2] - b[0], b[3] - b[1]) * 0.06;
      return { o, proj: pi, vb: [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p], kmU: 30 / 111, outline: "", shapes: g.india.districts.filter(d => d.s === o.state).map(d => ({ k: d.id, d: d.d, n: d.n, c: d.c })), sig: "state:" + o.state };
    }
    if (o.view === "delhi") { const b = g.delhi.box, p = 20; return { o, proj: pd, vb: [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p], kmU: 1800 / 111, outline: g.delhi.outline, shapes: g.delhi.wards.map(w => ({ k: "W" + w.id, d: w.d, n: w.n, c: w.c })), sig: "delhi" }; }
    if (o.view === "city") { const c = g.cities[o.city], b = c.box, p = 24; return { o, proj: pc(c), vb: [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p], kmU: c.proj[2] / 111, outline: "", shapes: c.wards.map(w => ({ k: w.id, d: w.d, n: w.n, c: w.c })), sig: "city:" + o.city }; }
    return { o, proj: pw, vb: [0, 24, 1080, 460], kmU: 3 / 111, outline: "", shapes: g.world.countries.map(c => ({ k: c.id, d: c.d, n: c.n, c: c.c })), sig: "world" };
  }
  // Zoom state lives on the element and resets when the view changes.
  function zoomedBox(el, V) {
    const [x0, y0, W, H] = V.vb;
    if (!el._z || el._z.sig !== V.sig) el._z = { sig: V.sig, k: 1, cx: x0 + W / 2, cy: y0 + H / 2 };
    const z = el._z, w = W / z.k, h = H / z.k;
    z.cx = Math.min(x0 + W - w / 2, Math.max(x0 + w / 2, z.cx)); z.cy = Math.min(y0 + H - h / 2, Math.max(y0 + h / 2, z.cy));
    return [z.cx - w / 2, z.cy - h / 2, w, h];
  }
  let dragging = false;
  function render(el, opts) {
    const V = views(opts), o = V.o, vb = zoomedBox(el, V), [x0, y0, W, H] = vb;
    const cw = el.clientWidth || 700, ch = el.clientHeight || Math.round(cw * 0.8);
    const s = Math.max(W / cw, H / Math.max(ch, 120));            // map units per screen pixel
    const inside = ([x, y]) => x >= x0 && x <= x0 + W && y >= y0 && y <= y0 + H;
    const id = "m" + (++uid);
    let svg = `<svg viewBox="${x0} ${y0} ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opts.aria || "Map")}">`;
    svg += `<defs><pattern id="${id}-nd" width="${6 * s}" height="${6 * s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${6 * s}" height="${6 * s}" style="fill:var(--nodata)"/><line x1="0" y1="0" x2="0" y2="${6 * s}" style="stroke:var(--nodata-line);stroke-width:${2 * s}"/></pattern>
      <marker id="${id}-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" style="fill:var(--flow)"/></marker></defs>`;
    const fillOf = k => { const f = o.fill && o.fill(k); return !f ? "var(--land)" : f === "var(--nodata)" ? `url(#${id}-nd)` : f; };
    svg += `<g>` + V.shapes.map(sh => `<path d="${sh.d}" data-hk="${esc(sh.k)}" class="shape" fill-rule="evenodd" style="fill:${fillOf(sh.k)};stroke:${o.edges === false ? "var(--land)" : "var(--edge)"};stroke-width:${0.8 * s}"/>`).join("") + `</g>`;
    const ring = (k, col, w, dash) => V.shapes.filter(sh => sh.k === k).map(sh => `<path d="${sh.d}" fill-rule="evenodd" style="fill:none;stroke:${col};stroke-width:${w * s};${dash ? `stroke-dasharray:${4 * s} ${3 * s};` : ""}pointer-events:none"/>`).join("");
    if (o.mine) svg += ring(o.mine, "var(--label)", 2, true);
    if (o.sel) svg += ring(o.sel, "var(--sel)", 2.4);
    if (V.outline) svg += `<path d="${V.outline}" fill-rule="evenodd" style="fill:none;stroke:var(--outline);stroke-width:${1 * s};pointer-events:none"/>`;
    // hazard zones
    (o.zones || []).forEach(z => { const p = V.proj(z.lonlat[0], z.lonlat[1]); if (!inside(p)) return; const r = Math.max(12 * s, z.km * V.kmU);
      svg += `<g data-hk="zone:${esc(z.id)}"><circle cx="${p[0]}" cy="${p[1]}" r="${r}" style="fill:var(--red);fill-opacity:.14;stroke:var(--red);stroke-width:${1.2 * s};stroke-dasharray:${4 * s} ${3 * s}"/></g>`; });
    // arcs: origin to destination, never the route. Arrowhead at the destination; numbered badge matches the list beside the map.
    const placed = [];
    (o.arcs || []).forEach((a, i) => { const p1 = V.proj(a.from[0], a.from[1]), p2 = V.proj(a.to[0], a.to[1]); const dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy) || 1;
      const mx = (p1[0] + p2[0]) / 2 - dy / L * L * 0.18, my = (p1[1] + p2[1]) / 2 + dx / L * L * 0.18 * -1;
      const back = Math.min(L * 0.12, 10 * s), ex = p2[0] - dx / L * back, ey = p2[1] - dy / L * back;
      svg += `<g data-hk="arc:${i}"><path d="M${p1[0]} ${p1[1]} Q${mx} ${my} ${ex} ${ey}" style="fill:none;stroke:transparent;stroke-width:${14 * s}"/><path d="M${p1[0]} ${p1[1]} Q${mx} ${my} ${ex} ${ey}" marker-end="url(#${id}-ah)" style="fill:none;stroke:var(--flow);stroke-width:${2 * s};stroke-linecap:round;opacity:.95"/>
        <circle cx="${p1[0]}" cy="${p1[1]}" r="${3.5 * s}" style="fill:var(--flow);stroke:var(--bg-map);stroke-width:${1.5 * s}"/>`;
      if (a.n != null) { const bx = 0.25 * p1[0] + 0.5 * mx + 0.25 * ex, by = 0.25 * p1[1] + 0.5 * my + 0.25 * ey;
        svg += `<circle cx="${bx}" cy="${by}" r="${8 * s}" style="fill:var(--flow);stroke:var(--bg-map);stroke-width:${1.5 * s}"/><text x="${bx}" y="${by + 3.6 * s}" text-anchor="middle" style="font-size:${10 * s}px;font-weight:700;fill:#fff;pointer-events:none">${a.n}</text>`; }
      svg += `</g>`;
      if (a.fromLabel) placed.push({ x: p1[0], y: p1[1] + 15 * s, t: a.fromLabel, strong: false });
      if (a.toLabel) placed.push({ x: p2[0], y: p2[1] - 10 * s, t: a.toLabel, strong: true }); });
    // labels: strong ones first; any label that would overlap one already placed is dropped
    (o.labels || []).forEach(Lb => { let x, y; if (Lb.k) { const sh = V.shapes.find(q => q.k === Lb.k); if (!sh || !sh.c) return; [x, y] = sh.c; } else if (Lb.at) [x, y] = Lb.at; else if (Lb.ll) [x, y] = V.proj(Lb.ll[0], Lb.ll[1]); else return; placed.push({ x, y, t: Lb.t, strong: !!Lb.strong }); });
    const boxes = []; let lsvg = "";
    // pins label to their right and win over area labels
    (o.pins || []).forEach(p => { if (!p.label) return; const q = V.proj(p.lonlat[0], p.lonlat[1]); placed.push({ x: q[0] + 12 * s, y: q[1] + 4 * s, t: p.label, strong: true, anchor: "start", pri: 2 }); });
    placed.sort((a, b) => ((b.pri || 0) - (a.pri || 0)) || (b.strong - a.strong)).forEach(Lb => { if (!inside([Lb.x, Lb.y])) return; const fs = (Lb.strong ? 12 : 11) * s, w = Lb.t.length * fs * 0.56, h = fs * 1.2, st = Lb.anchor === "start";
      const bx = st ? [Lb.x - 2 * s, Lb.y - h, Lb.x + w + 2 * s, Lb.y + 3 * s] : [Lb.x - w / 2 - 2 * s, Lb.y - h, Lb.x + w / 2 + 2 * s, Lb.y + 3 * s];
      if (boxes.some(b => !(bx[2] < b[0] || bx[0] > b[2] || bx[3] < b[1] || bx[1] > b[3]))) return;
      boxes.push(bx); lsvg += lbl(Lb.x, Lb.y, Lb.t, s, st ? "start" : "middle", Lb.strong); });
    // pins, with a 16px invisible hit area
    (o.pins || []).forEach(p => { const q = V.proj(p.lonlat[0], p.lonlat[1]); if (!inside(q)) return;
      svg += `<g class="pin" data-pin="${esc(p.id)}" data-hk="pin:${esc(p.id)}" style="cursor:pointer"><circle cx="${q[0]}" cy="${q[1]}" r="${16 * s}" style="fill:transparent"/>`
        + (p.pulse ? `<circle cx="${q[0]}" cy="${q[1]}" r="${7 * s}" style="fill:none;stroke:${p.color};stroke-width:${2 * s}"><animate attributeName="r" from="${7 * s}" to="${18 * s}" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" from=".9" to="0" dur="1.8s" repeatCount="indefinite"/></circle>` : "")
        + (p.sel ? `<circle cx="${q[0]}" cy="${q[1]}" r="${12 * s}" style="fill:none;stroke:var(--sel);stroke-width:${2.5 * s}"/>` : "")
        + `<circle cx="${q[0]}" cy="${q[1]}" r="${(p.r || 7) * s}" style="fill:${p.color};stroke:var(--bg-map);stroke-width:${2 * s}"/>`
        + (p.glyph ? `<text x="${q[0]}" y="${q[1] + 3.6 * s}" text-anchor="middle" style="font-size:${10 * s}px;font-weight:800;fill:#fff;pointer-events:none">${p.glyph}</text>` : "")
        + `</g>`; });
    svg += lsvg + `</svg>`;
    const zoomUI = opts.zoom === false ? "" : `<div class="mapzoom" aria-label="Zoom"><button type="button" data-z="in" aria-label="Zoom in">${RC.icon ? RC.icon("plus", 16) : "+"}</button><button type="button" data-z="out" aria-label="Zoom out"${el._z.k <= 1 ? " disabled" : ""}>${RC.icon ? RC.icon("minus", 16) : "−"}</button>${el._z.k > 1 ? `<button type="button" data-z="reset" aria-label="Show all">${RC.icon ? RC.icon("maximize", 15) : "⤢"}</button>` : ""}</div>`;
    el.innerHTML = svg + zoomUI; el.dataset.map = "1"; el._hover = opts.hover; el._ver = (el._ver || 0) + 1; el._opts = opts;
    el.classList.toggle("zoomed", el._z.k > 1);
    wire(el);
  }
  function wire(el) {
    if (el._wired) return; el._wired = true;
    let down = null, moved = false;
    el.addEventListener("click", e => {
      const zb = e.target.closest("[data-z]"); const opts = el._opts;
      if (zb) { e.stopPropagation(); const z = el._z; z.k = zb.dataset.z === "in" ? Math.min(8, z.k * 1.6) : zb.dataset.z === "out" ? Math.max(1, z.k / 1.6) : 1; hide(); render(el, opts); return; }
      if (moved) { moved = false; return; }
      const pin = e.target.closest("[data-pin]"); if (pin && opts.clickPin) return opts.clickPin(pin.dataset.pin);
      const sh = e.target.closest("path[data-hk]"); if (sh && opts.click) return opts.click(sh.dataset.hk);
      if (opts.clickEmpty) opts.clickEmpty();
    });
    el.addEventListener("dblclick", e => { if (e.target.closest("[data-z]")) return; const svg = el.querySelector("svg"); if (!svg) return; const pt = toMap(svg, e.clientX, e.clientY); const z = el._z; z.k = Math.min(8, z.k * 1.6); z.cx = pt[0]; z.cy = pt[1]; e.preventDefault(); render(el, el._opts); });
    el.addEventListener("wheel", e => { if (!e.ctrlKey) return; e.preventDefault(); const svg = el.querySelector("svg"); const pt = toMap(svg, e.clientX, e.clientY); const z = el._z, k0 = z.k; z.k = Math.min(8, Math.max(1, z.k * Math.exp(-e.deltaY * 0.01))); if (z.k === k0) return; z.cx = pt[0] + (z.cx - pt[0]) * k0 / z.k; z.cy = pt[1] + (z.cy - pt[1]) * k0 / z.k; clearTimeout(el._wt); el._wt = setTimeout(() => render(el, el._opts), 40); }, { passive: false });
    el.addEventListener("pointerdown", e => { if (el._z.k <= 1 || e.target.closest("[data-z]") || e.button !== 0) return; down = { x: e.clientX, y: e.clientY, cx: el._z.cx, cy: el._z.cy }; moved = false; });
    window.addEventListener("pointermove", e => { if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; if (!moved && Math.hypot(dx, dy) < 4) return; moved = true; dragging = true; hide();
      const svg = el.querySelector("svg"), vb = svg.viewBox.baseVal, sc = Math.max(vb.width / el.clientWidth, vb.height / el.clientHeight);
      el._z.cx = down.cx - dx * sc; el._z.cy = down.cy - dy * sc; svg.setAttribute("viewBox", `${el._z.cx - vb.width / 2} ${el._z.cy - vb.height / 2} ${vb.width} ${vb.height}`); });
    window.addEventListener("pointerup", () => { if (!down) return; down = null; dragging = false; if (moved) render(el, el._opts); setTimeout(() => moved = false, 0); });
  }
  function toMap(svg, x, y) { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sc = Math.max(vb.width / r.width, vb.height / r.height), ox = (r.width - vb.width / sc) / 2, oy = (r.height - vb.height / sc) / 2; return [vb.x + (x - r.left - ox) * sc, vb.y + (y - r.top - oy) * sc]; }
  function lbl(x, y, t, s, anchor, strong) { return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="mlabel${strong ? " strong" : ""}" style="font-size:${(strong ? 12 : 11) * s}px;stroke-width:${3 * s}px">${esc(t)}</text>`; }

  function legend() {
    const B = RC.Model.BINS;
    return `<div class="legend" data-help="scale"><span class="lt">Reached and safe</span>${B.map(b => `<span><i style="background:${b.c}"></i>${b.l}</span>`).join("")}<span class="nd"><i></i>No network</span><span class="info" style="display:inline-flex">${RC.icon("info", 15)}</span></div>`;
  }

  /* ---------- Line chart: solid until now, dashed after (projection); direct labels with values ---------- */
  function line(el, o) {
    const W = Math.max(240, el.clientWidth || 300), H = o.height || 170, L = 36, R = o.right || 104, T = 18, B = 24;
    const xs = x => L + (x - o.xmin) / (o.xmax - o.xmin) * (W - L - R), ys = y => T + (1 - y / (o.ymax || 1)) * (H - T - B);
    const split = o.split != null ? o.split : o.marker;
    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || "chart")}">`;
    if (o.ytitle) svg += `<text x="${L - 30}" y="10" class="axis">${esc(o.ytitle)}</text>`;
    [0, 0.25, 0.5, 0.75, 1].forEach(g => { const y = ys(g * (o.ymax || 1)); svg += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end" class="axis">${o.yfmt ? o.yfmt(g * (o.ymax || 1)) : g}</text>`; });
    (o.xticks || []).forEach(t => svg += `<text x="${xs(t.x)}" y="${H - 7}" text-anchor="middle" class="axis">${esc(t.l)}</text>`);
    if (split != null && split < o.xmax) svg += `<rect x="${xs(split)}" y="${T}" width="${W - R - xs(split)}" height="${H - T - B}" class="projband"/><text x="${W - R - 6}" y="${T + 12}" text-anchor="end" class="axis">${W - R - xs(split) > 230 ? "Projection if today's pace holds" : "Projection"}</text>`;
    o.series.forEach((se, si) => {
      const pts = se.pts, past = pts.filter(p => split == null || p.x <= split + 1e-9), fut = split == null ? [] : pts.filter(p => p.x >= split - 1e-9);
      const pathOf = arr => arr.map((p, i) => `${i ? "L" : "M"}${xs(p.x).toFixed(1)} ${ys(p.y).toFixed(1)}`).join(" ");
      if (se.area && pts.length) svg += `<path d="${pathOf(pts)} L${xs(pts[pts.length - 1].x)} ${ys(0)} L${xs(pts[0].x)} ${ys(0)} Z" style="fill:${se.color};opacity:.12"/>`;
      if (past.length > 1) svg += `<path d="${pathOf(past)}" style="fill:none;stroke:${se.color};stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/>`;
      if (fut.length > 1) svg += `<path d="${pathOf(fut)}" style="fill:none;stroke:${se.color};stroke-width:2;stroke-dasharray:5 4;stroke-linejoin:round;stroke-linecap:round"/>`;
      const last = pts[pts.length - 1]; svg += `<text x="${xs(last.x) + 6}" y="${ys(last.y) + 4 + (si && Math.abs(ys(last.y) - ys(o.series[0].pts[o.series[0].pts.length - 1].y)) < 12 ? 12 : 0)}" class="axis strong" style="fill:var(--label)">${esc(se.name)} ${o.yfmt ? o.yfmt(last.y) : ""}</text>`;
    });
    if (o.marker != null) { const mx = xs(o.marker); svg += `<line x1="${mx}" x2="${mx}" y1="${T}" y2="${H - B}" class="marker"/>`;
      o.series.forEach(se => { const p = se.pts.reduce((b, q) => Math.abs(q.x - o.marker) < Math.abs(b.x - o.marker) ? q : b, se.pts[0]); svg += `<circle cx="${mx}" cy="${ys(p.y)}" r="4" style="fill:${se.color};stroke:var(--group-solid);stroke-width:2"/>`; });
      svg += `<text x="${mx}" y="${H - B + 14}" text-anchor="middle" class="axis strong" style="fill:var(--label)">${esc(o.markerLabel || "")}</text>`; }
    svg += `<line class="xhair" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/>` + o.series.map((se, i) => `<circle class="xdot" data-i="${i}" r="4" style="fill:${se.color};display:none;stroke:var(--group-solid);stroke-width:2"/>`).join("");
    svg += `<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" style="fill:transparent" class="hit"/></svg>`;
    el.innerHTML = svg;
    const sv = el.querySelector("svg"), hair = sv.querySelector(".xhair"), dots = sv.querySelectorAll(".xdot");
    sv.querySelector(".hit").addEventListener("mousemove", e => {
      const r = sv.getBoundingClientRect(), px = e.clientX - r.left, x = o.xmin + (px - L) / (W - L - R) * (o.xmax - o.xmin);
      const idx = o.series[0].pts.reduce((b, p, i, a) => Math.abs(p.x - x) < Math.abs(a[b].x - x) ? i : b, 0);
      const X = xs(o.series[0].pts[idx].x); hair.setAttribute("x1", X); hair.setAttribute("x2", X); hair.style.display = "";
      dots.forEach((d, i) => { const p = o.series[i].pts[idx]; d.setAttribute("cx", X); d.setAttribute("cy", ys(p.y)); d.style.display = ""; });
      const px0 = o.series[0].pts[idx].x;
      show("chart:" + idx, `<b>${esc(o.xlabel ? o.xlabel(px0) : px0)}${split != null && px0 > split ? " · projection" : ""}</b>` + o.series.map(se => `<div><i class="sw" style="background:${se.color}"></i>${esc(se.name)}: <b class="inl">${o.yfmt ? o.yfmt(se.pts[idx].y) : se.pts[idx].y}</b></div>`).join(""), e.clientX, e.clientY);
    });
    sv.querySelector(".hit").addEventListener("mouseleave", () => { hair.style.display = "none"; dots.forEach(d => d.style.display = "none"); hide(); });
  }

  function flatLine(el, w) {
    const W = w || 120, H = 22; let d = `M 2 ${H - 4}`;
    for (let x = 4; x <= W - 2; x += 4) d += ` L ${x} ${x === 12 ? 3 : H - 4}`;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--green)" stroke-width="2"/></svg>`;
  }
  // stacked bar: reached / on the way / nobody yet (status colours, each with its word)
  function stack(v) {
    const t = v.known || 1, r = v.reached / t * 100, c = v.claimed / t * 100, u = Math.max(0, 100 - r - c);
    return `<div class="stack" role="img" aria-label="${Math.round(r)}% reached, ${Math.round(c)}% on the way, ${Math.round(u)}% nobody yet"><i style="width:${r}%;background:var(--st-reached)"></i><i style="width:${c}%;background:var(--st-going)"></i><i style="width:${u}%;background:var(--st-nobody)"></i></div>
      <div class="stack-l"><span><i style="background:var(--st-reached)"></i>Reached ${Math.round(r)}%</span><span><i style="background:var(--st-going)"></i>On the way ${Math.round(c)}%</span><span><i style="background:var(--st-nobody)"></i>Nobody yet ${Math.round(u)}%</span></div>`;
  }
  // One sentence that answers "is it getting better?" for a scope function
  function trendSentence(fn, h, name) {
    const now = fn(h), d2 = fn(26), d3 = fn(50), P = x => Math.round(x * 100) + "%";
    if (now.nodata) return `No phone network in ${name}, so there is nothing to measure yet.`;
    const lastHour = now.lastHour, word = lastHour > 0 ? "Getting better." : "Not moving.";
    return `${word} ${P(now.share)} of people with no adult left in ${name} have been reached. At this pace: ${P(d2.share)} by Day 2 morning, ${P(d3.share)} by Day 3.`;
  }

  RC.Map = { pi, pd, pw, render, legend, fmt, esc, hide, statusColor: null };
  RC.Chart = { line, flatLine, stack, trendSentence };
})(window.RC);
