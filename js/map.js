/* Still Here — maps, hover cards and charts. Inline SVG, no tiles, no network.
   Every stroke, font and radius is multiplied by the map's units-per-pixel, so labels look the same at any zoom (audit A4, A9). */
window.RC = window.RC || {};
(function (RC) {
  const G = () => RC.GEO;
  const COSI = Math.cos(22.5 * Math.PI / 180), COSD = Math.cos(28.6 * Math.PI / 180);
  const pi = (lon, lat) => [(lon - 68.0) * 30 * COSI, (37.3 - lat) * 30];
  const pd = (lon, lat) => [(lon - 76.83) * 1800 * COSD, (28.89 - lat) * 1800];
  const pw = (lon, lat) => [(lon + 180) * 3, (90 - lat) * 3];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = n => Math.round(n).toLocaleString("en-IN");

  /* ---------- Hover card (one for the page) ---------- */
  let tip, tipKey = null;
  function tipEl() { if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); } return tip; }
  function place(x, y) { const t = tipEl(), r = t.getBoundingClientRect(); let l = x + 16, tp = y + 16; if (l + r.width > innerWidth - 8) l = x - r.width - 16; if (tp + r.height > innerHeight - 8) tp = y - r.height - 12; t.style.left = Math.max(8, l) + "px"; t.style.top = Math.max(8, tp) + "px"; }
  function show(key, html, x, y) { const t = tipEl(); if (tipKey !== key) { t.innerHTML = html; tipKey = key; } t.style.display = "block"; place(x, y); }
  function hide() { if (tip) tip.style.display = "none"; tipKey = null; }
  const helpHtml = H => `<b>${esc(H.t)}</b><div>${esc(H.b)}</div>${H.s ? `<div class="src">Source: ${esc(H.s)}</div>` : ""}`;
  function hoverAt(target, x, y) {
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
    if (o.view === "india") return { o, proj: pi, vb: [0, 0, g.india.w, g.india.h], kmU: 30 / 111, outline: g.india.outline, shapes: g.india.districts.map(d => ({ k: d.s, d: d.d })) };
    if (o.view === "state") {
      const st = g.india.states[o.state], b = st.b, p = Math.max(b[2] - b[0], b[3] - b[1]) * 0.06;
      return { o, proj: pi, vb: [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p], kmU: 30 / 111, outline: "", shapes: g.india.districts.filter(d => d.s === o.state).map(d => ({ k: d.id, d: d.d, n: d.n, c: d.c })) };
    }
    if (o.view === "delhi") { const b = g.delhi.box, p = 20; return { o, proj: pd, vb: [b[0] - p, b[1] - p, b[2] - b[0] + 2 * p, b[3] - b[1] + 2 * p], kmU: 1800 / 111, outline: g.delhi.outline, shapes: g.delhi.wards.map(w => ({ k: "W" + w.id, d: w.d, n: w.n, c: w.c })) }; }
    return { o, proj: pw, vb: [0, 24, 1080, 460], kmU: 3 / 111, outline: "", shapes: g.world.countries.map(c => ({ k: c.id, d: c.d, n: c.n, c: c.c })) };
  }
  function render(el, opts) {
    const V = views(opts), o = V.o, [x0, y0, W, H] = V.vb;
    const cw = el.clientWidth || 700, ch = el.clientHeight || Math.round(cw * 0.8);
    const s = Math.max(W / cw, H / Math.max(ch, 120));            // map units per screen pixel
    const inside = ([x, y]) => x >= x0 && x <= x0 + W && y >= y0 && y <= y0 + H;
    let svg = `<svg viewBox="${x0} ${y0} ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(opts.aria || "Map")}">`;
    svg += `<g>` + V.shapes.map(sh => `<path d="${sh.d}" data-hk="${esc(sh.k)}" class="shape" fill-rule="evenodd" style="fill:${(o.fill && o.fill(sh.k)) || "var(--land)"};stroke:var(--edge);stroke-width:${0.5 * s}"/>`).join("") + `</g>`;
    const ring = (k, col, w, dash) => V.shapes.filter(sh => sh.k === k).map(sh => `<path d="${sh.d}" fill-rule="evenodd" style="fill:none;stroke:${col};stroke-width:${w * s};${dash ? `stroke-dasharray:${4 * s} ${3 * s};` : ""}pointer-events:none"/>`).join("");
    if (o.mine) svg += ring(o.mine, "var(--label)", 2.2, true);
    if (o.sel) svg += ring(o.sel, "var(--sel)", 2.6);
    if (V.outline) svg += `<path d="${V.outline}" fill-rule="evenodd" style="fill:none;stroke:var(--outline);stroke-width:${1.2 * s};pointer-events:none"/>`;
    // hazard zones
    (o.zones || []).forEach(z => { const p = V.proj(z.lonlat[0], z.lonlat[1]); if (!inside(p)) return; const r = Math.max(12 * s, z.km * V.kmU);
      svg += `<g data-hk="zone:${esc(z.id)}"><circle cx="${p[0]}" cy="${p[1]}" r="${r}" style="fill:var(--red);fill-opacity:.16;stroke:var(--red);stroke-width:${1.2 * s};stroke-dasharray:${4 * s} ${3 * s}"/></g>`; });
    // arcs: origin to destination, never the route
    (o.arcs || []).forEach(a => { const p1 = V.proj(a.from[0], a.from[1]), p2 = V.proj(a.to[0], a.to[1]); const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2 - Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 0.22;
      svg += `<path d="M${p1[0]} ${p1[1]} Q${mx} ${my} ${p2[0]} ${p2[1]}" style="fill:none;stroke:var(--blue);stroke-width:${2 * s};stroke-dasharray:${6 * s} ${5 * s};opacity:.9;pointer-events:none"><animate attributeName="stroke-dashoffset" from="${66 * s}" to="0" dur="2.4s" repeatCount="indefinite"/></path>
        <circle cx="${p1[0]}" cy="${p1[1]}" r="${4 * s}" style="fill:var(--blue)"/><circle cx="${p2[0]}" cy="${p2[1]}" r="${4 * s}" style="fill:var(--bg-map);stroke:var(--blue);stroke-width:${2 * s}"/>`;
      if (a.fromLabel) svg += lbl(p1[0], p1[1] + 15 * s, a.fromLabel, s, "middle"); if (a.toLabel) svg += lbl(p2[0], p2[1] - 9 * s, a.toLabel, s, "middle"); });
    // labels
    (o.labels || []).forEach(L => { if (L.k) { const sh = V.shapes.find(x => x.k === L.k); if (sh && sh.c) svg += lbl(sh.c[0], sh.c[1], L.t, s, "middle", L.strong); } else if (L.at) svg += lbl(L.at[0], L.at[1], L.t, s, "middle", L.strong); else if (L.ll) { const p = V.proj(L.ll[0], L.ll[1]); if (inside(p)) svg += lbl(p[0], p[1], L.t, s, "middle", L.strong); } });
    // pins, with a 16px invisible hit area
    (o.pins || []).forEach(p => { const q = V.proj(p.lonlat[0], p.lonlat[1]); if (!inside(q)) return;
      svg += `<g class="pin" data-pin="${esc(p.id)}" data-hk="pin:${esc(p.id)}" style="cursor:pointer"><circle cx="${q[0]}" cy="${q[1]}" r="${16 * s}" style="fill:transparent"/>`
        + (p.pulse ? `<circle cx="${q[0]}" cy="${q[1]}" r="${7 * s}" style="fill:none;stroke:${p.color};stroke-width:${2 * s}"><animate attributeName="r" from="${7 * s}" to="${18 * s}" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" from=".9" to="0" dur="1.8s" repeatCount="indefinite"/></circle>` : "")
        + (p.sel ? `<circle cx="${q[0]}" cy="${q[1]}" r="${12 * s}" style="fill:none;stroke:var(--sel);stroke-width:${2.5 * s}"/>` : "")
        + `<circle cx="${q[0]}" cy="${q[1]}" r="${(p.r || 7) * s}" style="fill:${p.color};stroke:var(--bg-map);stroke-width:${2 * s}"/>`
        + (p.glyph ? `<text x="${q[0]}" y="${q[1] + 3.6 * s}" text-anchor="middle" style="font-size:${10 * s}px;font-weight:800;fill:#fff;pointer-events:none">${p.glyph}</text>` : "")
        + `</g>`;
      if (p.label) svg += lbl(q[0] + 12 * s, q[1] + 4 * s, p.label, s, "start", true); });
    svg += `</svg>`;
    el.innerHTML = svg; el.dataset.map = "1"; el._hover = opts.hover; el._ver = (el._ver || 0) + 1;
    el.onclick = e => { const pin = e.target.closest("[data-pin]"); if (pin && opts.clickPin) return opts.clickPin(pin.dataset.pin); const sh = e.target.closest("path[data-hk]"); if (sh && opts.click) return opts.click(sh.dataset.hk); if (opts.clickEmpty) opts.clickEmpty(); };
  }
  function lbl(x, y, t, s, anchor, strong) { return `<text x="${x}" y="${y}" text-anchor="${anchor}" class="mlabel${strong ? " strong" : ""}" style="font-size:${(strong ? 12 : 11) * s}px;stroke-width:${3 * s}px">${esc(t)}</text>`; }

  function legend() { return `<div class="legend" data-help="scale">${RC.Model.BINS.map(b => `<span><i style="background:${b.c}"></i>${b.l}</span>`).join("")}<span><i style="background:var(--nodata)"></i>No data</span><span class="info" style="display:inline-flex">${RC.icon("info", 15)}</span></div>`; }

  /* ---------- Line chart with hover crosshair ---------- */
  function line(el, o) {
    const W = Math.max(220, el.clientWidth || 300), H = o.height || 150, L = 34, R = o.right || 76, T = 12, B = 22;
    const xs = x => L + (x - o.xmin) / (o.xmax - o.xmin) * (W - L - R), ys = y => T + (1 - y / (o.ymax || 1)) * (H - T - B);
    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || "chart")}">`;
    [0, 0.25, 0.5, 0.75, 1].forEach(g => { const y = ys(g * (o.ymax || 1)); svg += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="grid"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end" class="axis">${o.yfmt ? o.yfmt(g * (o.ymax || 1)) : g}</text>`; });
    (o.xticks || []).forEach(t => svg += `<text x="${xs(t.x)}" y="${H - 6}" text-anchor="middle" class="axis">${esc(t.l)}</text>`);
    if (o.marker != null) svg += `<line x1="${xs(o.marker)}" x2="${xs(o.marker)}" y1="${T}" y2="${H - B}" class="marker"/><text x="${xs(o.marker) + 4}" y="${T + 9}" class="axis strong">${esc(o.markerLabel || "")}</text>`;
    o.series.forEach(se => { const d = se.pts.map((p, i) => `${i ? "L" : "M"}${xs(p.x).toFixed(1)} ${ys(p.y).toFixed(1)}`).join(" ");
      svg += `<path d="${d}" style="fill:none;stroke:${se.color};stroke-width:2;stroke-linejoin:round;stroke-linecap:round${se.dash ? ";stroke-dasharray:4 3" : ""}"/>`;
      const last = se.pts[se.pts.length - 1]; svg += `<text x="${xs(last.x) + 6}" y="${ys(last.y) + 4}" class="axis strong" style="fill:var(--label)">${esc(se.name)}</text>`; });
    svg += `<line class="xhair" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/>` + o.series.map((se, i) => `<circle class="xdot" data-i="${i}" r="4" style="fill:${se.color};display:none;stroke:var(--card);stroke-width:2"/>`).join("");
    svg += `<rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" style="fill:transparent" class="hit"/></svg>`;
    el.innerHTML = svg;
    const sv = el.querySelector("svg"), hair = sv.querySelector(".xhair"), dots = sv.querySelectorAll(".xdot");
    sv.querySelector(".hit").addEventListener("mousemove", e => {
      const r = sv.getBoundingClientRect(), px = e.clientX - r.left, x = o.xmin + (px - L) / (W - L - R) * (o.xmax - o.xmin);
      const idx = o.series[0].pts.reduce((b, p, i, a) => Math.abs(p.x - x) < Math.abs(a[b].x - x) ? i : b, 0);
      const X = xs(o.series[0].pts[idx].x); hair.setAttribute("x1", X); hair.setAttribute("x2", X); hair.style.display = "";
      dots.forEach((d, i) => { const p = o.series[i].pts[idx]; d.setAttribute("cx", X); d.setAttribute("cy", ys(p.y)); d.style.display = ""; });
      show("chart:" + idx, `<b>${esc(o.xlabel ? o.xlabel(o.series[0].pts[idx].x) : o.series[0].pts[idx].x)}</b>` + o.series.map(se => `<div><i class="sw" style="background:${se.color}"></i>${esc(se.name)}: <b class="inl">${o.yfmt ? o.yfmt(se.pts[idx].y) : se.pts[idx].y}</b></div>`).join(""), e.clientX, e.clientY);
    });
    sv.querySelector(".hit").addEventListener("mouseleave", () => { hair.style.display = "none"; dots.forEach(d => d.style.display = "none"); hide(); });
  }

  function flatLine(el, w) {
    const W = w || 120, H = 22; let d = `M 2 ${H - 4}`;
    for (let x = 4; x <= W - 2; x += 4) d += ` L ${x} ${x === 12 ? 3 : H - 4}`;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--green)" stroke-width="2"/></svg>`;
  }
  // stacked bar: reached / on the way / nobody yet
  function stack(v) {
    const t = v.known || 1, r = v.reached / t * 100, c = v.claimed / t * 100, u = Math.max(0, 100 - r - c);
    return `<div class="stack" role="img" aria-label="${Math.round(r)}% reached, ${Math.round(c)}% on the way, ${Math.round(u)}% nobody yet"><i style="width:${r}%;background:var(--s3)"></i><i style="width:${c}%;background:var(--s1)"></i><i style="width:${u}%;background:var(--s0)"></i></div>
      <div class="stack-l"><span><i style="background:var(--s3)"></i>Reached ${Math.round(r)}%</span><span><i style="background:var(--s1)"></i>On the way ${Math.round(c)}%</span><span><i style="background:var(--s0)"></i>Nobody yet ${Math.round(u)}%</span></div>`;
  }

  RC.Map = { pi, pd, pw, render, legend, fmt, esc, hide, statusColor: null };
  RC.Chart = { line, flatLine, stack };
})(window.RC);
