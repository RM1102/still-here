/* Still Here — contributor portal. Verified places update what they have; the public app's Help page reads the same saved updates. */
(function (RC) {
  const KEY = "stillhere-contrib-v1", I = RC.icon, $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TIER = { 1: "Tier 1 · government facility or licensed outlet with a sales machine", 2: "Tier 2 · licensed business", 3: "Tier 3 · community place vouched for by the ward officer" };
  const Q = [["short", "Short (under 15 min)"], ["medium", "Medium (15 to 60 min)"], ["long", "Long (over an hour)"]], LV = ["Plenty", "Low", "Out"];
  let S = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })(); S.place = S.place || "clinic"; S.upd = S.upd || {}; S.draft = S.draft || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const place = () => RC.contributors.find(c => c.id === S.place);
  // The working copy: what was last published for this place, or its starting state
  function draft() { const c = place(), u = S.upd[c.id] || {}, d = S.draft[c.id]; if (d) return d;
    return (S.draft[c.id] = { open: u.open != null ? u.open : c.open, q: u.q || (c.queue < 15 ? "short" : c.queue <= 60 ? "medium" : "long"), stock: Object.assign(Object.fromEntries(c.stock), u.stock || {}), needs: u.needs || c.needs }); }
  const seg = (name, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button class="${cur === v ? "on" : ""}" data-set="${name}" data-v="${v}">${esc(l)}</button>`).join("")}</div>`;
  function render() {
    const c = place(), d = draft(), u = S.upd[c.id];
    $("#view").innerHTML = `<h1 class="title">For places and staff</h1><p class="lede">Verified clinics, pharmacies, ration shops and shelters tell the public what they have, so people go where help is and nobody crowds one place.</p>
      <div class="filters" style="margin-top:18px">${seg("place", RC.contributors.map(x => [x.id, x.name.split(",")[0]]), c.id)}</div>
      <div class="group"><div class="r t"><span class="tile green">${I("shield-check", 16)}</span><div class="tt"><b>${esc(c.name)}</b><span>${esc(c.how)}</span></div><span class="tier">Tier ${c.tier}</span></div>
        <div class="pad fn">${esc(TIER[c.tier])}. Each update is shown for 4 hours, then fades unless you renew it.</div></div>
      <div class="secthead"><h2 class="h2">Your update</h2></div>
      <div class="group form">
        <div class="r"><div class="tt"><b>Open now?</b></div>${seg("open", [["1", "Open"], ["0", "Closed"]], d.open ? "1" : "0")}</div>
        <div class="r"><div class="tt"><b>Queue</b><span>Also counted from the phones waiting here</span></div>${seg("q", Q, d.q)}</div>
        ${Object.keys(d.stock).map(k => `<div class="r"><div class="tt"><b>${esc(k)}</b></div>${seg("stock:" + k, LV.map(x => [x, x]), d.stock[k])}</div>`).join("")}
        <div class="r"><div class="tt"><b>What you need</b><span>Staff or supplies; the district sees this</span><textarea id="needs" aria-label="What you need">${esc(d.needs)}</textarea></div></div>
      </div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-publish="1">${u ? "Publish a New Update" : "Publish Update"}</button></div>
      ${u ? `<p class="foot">${I("check", 14)} Published at ${esc(u.t)}. Shown to the public until ${esc(u.until)}.</p>` : ""}
      <div class="secthead"><h2 class="h2">What the public sees</h2></div>
      <div class="group"><div class="r t"><span class="tile ${d.open ? "green" : "gray"}">${I(c.kind === "Ration shop" ? "package" : c.kind === "Shelter and kitchen" ? "users" : "heart-pulse", 16)}</span><div class="tt"><b>${esc(c.name)}</b><span>${d.open ? Q.find(x => x[0] === d.q)[1].split(" (")[0].toLowerCase() + " queue" : "closed now"} · ${Object.entries(d.stock).map(([k, v]) => `${esc(k)}: ${v.toLowerCase()}`).join(", ")} · tier ${c.tier}</span></div><span class="st ${d.open ? (d.q === "long" ? "orange" : "green") : ""}">${d.open ? (d.q === "long" ? "Busy" : "Open") : "Closed"}</span></div></div>
      <p class="foot">Stock shows as "in stock" only once a second source agrees: a sale on your machine, or a second report.</p>
      <details class="disc"><summary>${I("circle-help", 15)}Why we check every update</summary><div class="body">A false "open" could send three thousand people to a closed hospital. So an update counts only while a phone of yours is at the place, it fades unless renewed, stock needs a second source, and anyone posting for a place they don't run is caught by its registry or licence check. Your needs go to the district control room, which can send staff or supplies.</div></details>`;
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-set],[data-publish]"); if (!t) return; const c = place();
    if (t.dataset.set === "place") { S.place = t.dataset.v; }
    else if (t.dataset.set) { const d = draft(), k = t.dataset.set; if (k === "open") d.open = t.dataset.v === "1"; else if (k === "q") d.q = t.dataset.v; else if (k.indexOf("stock:") === 0) d.stock[k.slice(6)] = t.dataset.v; }
    else if (t.dataset.publish) { const d = draft(), n = $("#needs"); if (n) d.needs = n.value; const m = 10 + Object.keys(S.upd).length * 3;
      S.upd[c.id] = { open: d.open, q: d.q, stock: Object.assign({}, d.stock), needs: d.needs, t: `7:${m} am`, until: `11:${m} am` }; }
    save(); render();
  });
  render();
})(window.RC);
