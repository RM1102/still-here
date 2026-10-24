/* Still Here — contributor portal. Verified places update what they have; the public app's Help page reads the same saved updates.
   Rebuilt 24 Oct night (Rahul's review): the public app's design, many places, search, and "add my place". */
(function (RC) {
  const KEY = "stillhere-contrib-v1", I = RC.icon, $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TIER = { 1: "Tier 1 · a government facility, or a licensed outlet with a sales machine", 2: "Tier 2 · a licensed business", 3: "Tier 3 · a community place vouched for by the ward officer", 0: "Being checked · not shown to the public yet" };
  const Q = [["short", "Short", "under 15 min"], ["medium", "Medium", "15 to 60 min"], ["long", "Long", "over an hour"]], LV = ["Plenty", "Low", "Out"];
  // Kinds of place, grouped for the filter chips
  const KINDS = [["all", "All"], ["health", "Health", ["Hospital", "Clinic", "Pharmacy"]], ["food", "Food", ["Ration shop", "Food shop", "Childcare"]], ["shelter", "Shelter", ["Shelter and kitchen"]], ["water", "Water and fuel", ["Water point", "Fuel"]]];
  const ICON = { Hospital: "hospital", Clinic: "heart-pulse", Pharmacy: "heart-pulse", "Ration shop": "package", "Food shop": "package", Childcare: "baby", "Shelter and kitchen": "users", "Water point": "droplets", Fuel: "zap" };
  const COLOR = { Hospital: "red", Clinic: "red", Pharmacy: "purple", "Ration shop": "orange", "Food shop": "orange", Childcare: "indigo", "Shelter and kitchen": "green", "Water point": "blue", Fuel: "gray" };
  let S = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  S.place = S.place || "clinic"; S.upd = S.upd || {}; S.draft = S.draft || {}; S.added = S.added || []; S.kind = S.kind || "all"; S.q = "";
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const all = () => RC.contributors.concat(S.added);
  const place = () => all().find(c => c.id === S.place) || RC.contributors[0];
  // The working copy: what was last published for this place, or its starting state
  function draft() { const c = place(), u = S.upd[c.id] || {}, d = S.draft[c.id]; if (d) return d;
    return (S.draft[c.id] = { open: u.open != null ? u.open : c.open, q: u.q || (c.queue < 15 ? "short" : c.queue <= 60 ? "medium" : "long"), stock: Object.assign(Object.fromEntries(c.stock), u.stock || {}), needs: u.needs || c.needs }); }
  const statusOf = c => { const u = S.upd[c.id], open = u && u.open != null ? u.open : c.open; return c.tier === 0 ? ["var(--apple-orange)", "Being checked"] : open ? ["var(--apple-green)", "Open"] : ["var(--label3)", "Closed"]; };
  const seg = (name, opts, cur) => `<div class="seg">${opts.map(([v, l]) => `<button class="${cur === v ? "on" : ""}" data-set="${name}" data-v="${v}">${esc(l)}</button>`).join("")}</div>`;
  const tile = (ic, c) => `<span class="tile ${c}">${I(ic, 16)}</span>`;

  function side() {
    $("#sicon").innerHTML = I("search", 16);
    $("#ckinds").innerHTML = KINDS.map(([k, l]) => `<button class="${S.kind === k ? "on" : ""}" data-kind="${k}">${l}</button>`).join("");
    const kk = KINDS.find(k => k[0] === S.kind), q = S.q.toLowerCase();
    const list = all().filter(c => (S.kind === "all" || (kk[2] || []).includes(c.kind)) && (!q || (c.name + " " + c.kind + " " + c.stock.map(s => s[0]).join(" ")).toLowerCase().includes(q)));
    $("#clist").innerHTML = list.length ? list.map(c => { const [col, l] = statusOf(c);
      return `<button class="${!S.adding && c.id === S.place ? "on" : ""}" data-pick="${esc(c.id)}">${tile(ICON[c.kind] || "building-2", COLOR[c.kind] || "gray")}<div class="tt"><b>${esc(c.name)}</b><span>${esc(c.kind)} · ${c.tier ? "tier " + c.tier : "being checked"}</span></div><span class="dot" style="background:${col}" title="${l}"></span></button>`; }).join("")
      : `<p class="foot" style="padding:6px 8px">No place matches. Add yours below.</p>`;
    $("#addbtn").innerHTML = `${I("house-plus", 16)}Add My Place`;
  }

  function addForm() {
    const a = S.addDraft || (S.addDraft = { name: "", kind: "Shelter and kitchen", where: "Rohini Sector 7", proof: "" });
    return `<h1 class="title">Add your place</h1><p class="lede">A clinic, shop, kitchen, shelter or water point that wants to tell people what it has. It's checked before the public sees it.</p>
      <div class="group form" style="margin-top:18px">
        <div class="r"><div class="tt"><b>Name of the place</b><input type="text" id="aname" value="${esc(a.name)}" placeholder="For example: Sai Medical Store, Sector 8"></div></div>
        <div class="r"><div class="tt"><b>What kind of place</b></div>${seg("akind", Object.keys(ICON).map(k => [k, k]), a.kind)}</div>
        <div class="r"><div class="tt"><b>Where</b><input type="text" id="awhere" value="${esc(a.where)}"></div></div>
        <div class="r"><div class="tt"><b>A registration number, if you have one</b><span>Drug licence, FSSAI food licence, GST number, or the facility's registry number. Without one, the ward officer visits.</span><input type="text" id="aproof" value="${esc(a.proof)}" placeholder="Optional"></div></div>
      </div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-cancel="1">Cancel</button><button class="btn btn-prominent" style="flex:1" data-addsave="1">Check and Add</button></div>
      <details class="disc"><summary>${I("circle-help", 15)}How a new place is checked</summary><div class="body">We match the registration number against its registry: the drug licence, food licence, GST or health facility registry. Your phone must be at the place when you add it. Places without a number are visited by the ward officer, and are shown as tier 3 once vouched for. Until then, nothing you post is shown to the public.</div></details>`;
  }

  function render() {
    side(); if (S.adding) { $("#view").innerHTML = addForm(); return; }
    const c = place(), d = draft(), u = S.upd[c.id], pending = c.tier === 0;
    $("#view").innerHTML = `<h1 class="title">${esc(c.name)}</h1><p class="lede">Tell people what you have, so they go where help is and nobody crowds one place.</p>
      <div class="group" style="margin-top:18px"><div class="r t">${tile(pending ? "clock" : "shield-check", pending ? "orange" : "green")}<div class="tt"><b>${pending ? "Being checked" : "Verified"}</b><span>${esc(c.how)}</span></div><span class="tier">${c.tier ? "Tier " + c.tier : "Pending"}</span></div>
        <div class="pad fn">${esc(TIER[c.tier])}. Each update is shown for 4 hours, then fades unless you renew it.</div></div>
      ${!pending ? `<div class="secthead"><h2 class="h2">Your update</h2></div>
      <div class="group form">
        <div class="r"><div class="tt"><b>Open now?</b></div>${seg("open", [["1", "Open"], ["0", "Closed"]], d.open ? "1" : "0")}</div>
        <div class="r"><div class="tt"><b>Queue</b><span>Also counted from the phones waiting here</span></div>${seg("q", Q.map(([v, l, m]) => [v, `${l} · ${m}`]), d.q)}</div>
        ${Object.keys(d.stock).map(k => `<div class="r"><div class="tt"><b>${esc(k)}</b></div>${seg("stock:" + k, LV.map(x => [x, x]), d.stock[k])}</div>`).join("")}
        <div class="r"><div class="tt"><b>What you need</b><span>Staff or supplies; the district control room sees this</span><textarea id="needs" aria-label="What you need">${esc(d.needs)}</textarea></div></div>
      </div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-publish="1">${u ? "Publish a New Update" : "Publish Update"}</button></div>
      ${u ? `<p class="foot">${I("check", 14)} Published at ${esc(u.t)}. Shown to the public until ${esc(u.until)}.</p>` : ""}
      <div class="secthead"><h2 class="h2">What the public sees</h2></div>
      <div class="group"><div class="r t">${tile(ICON[c.kind] || "building-2", d.open ? "green" : "gray")}<div class="tt"><b>${esc(c.name)}</b><span>${d.open ? Q.find(x => x[0] === d.q)[1].toLowerCase() + " queue" : "closed now"} · ${Object.entries(d.stock).map(([k, v]) => `${esc(k)}: ${v.toLowerCase()}`).join(", ")}</span></div><span class="st ${d.open ? (d.q === "long" ? "orange" : "green") : ""}">${d.open ? (d.q === "long" ? "Busy" : "Open") : "Closed"}</span></div></div>
      <p class="foot">Stock shows as "in stock" only once a second source agrees: a sale on your machine, or a second report.</p>`
      : `<p class="foot" style="margin-top:14px">The check usually takes about 10 minutes. You'll get an SMS when your place is live, and then you can post what you have.</p>`}
      <details class="disc"><summary>${I("circle-help", 15)}Why we check every update</summary><div class="body">A false "open" could send three thousand people to a closed hospital. So an update counts only while a phone of yours is at the place, it fades unless renewed, stock needs a second source, and anyone posting for a place they don't run is caught by its registry or licence check. Your needs go to the district control room, which can send staff or supplies.</div></details>`;
  }

  document.addEventListener("input", e => { if (e.target.id === "csearch") { S.q = e.target.value; side(); } });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-set],[data-publish],[data-pick],[data-kind],[data-add],[data-cancel],[data-addsave]"); if (!t) return;
    const keepAdd = () => { const a = S.addDraft; if (!a) return; ["name", "where", "proof"].forEach(k => { const el = $("#a" + k); if (el) a[k] = el.value; }); };
    if (t.dataset.pick) { S.place = t.dataset.pick; S.adding = false; }
    else if (t.dataset.kind) S.kind = t.dataset.kind;
    else if (t.dataset.add) S.adding = true;
    else if (t.dataset.cancel) S.adding = false;
    else if (t.dataset.addsave) { keepAdd(); const a = S.addDraft, name = (a.name || "").trim() || "My place, Rohini Sector 7", id = "added" + (S.added.length + 1);
      S.added.push({ id, name: name + (a.where && name.indexOf(",") < 0 ? ", " + a.where : ""), kind: a.kind, tier: 0, how: a.proof ? `Matching ${a.proof} against its registry; your phone is here` : "Waiting for the ward officer's visit", open: true, queue: 10, stock: [["Meals", "Plenty"], ["Drinking water", "Plenty"]], capacity: "", needs: "" });
      S.place = id; S.adding = false; S.addDraft = null; }
    else if (t.dataset.set === "akind") { keepAdd(); S.addDraft.kind = t.dataset.v; }
    else if (t.dataset.set) { const d = draft(), k = t.dataset.set; if (k === "open") d.open = t.dataset.v === "1"; else if (k === "q") d.q = t.dataset.v; else if (k.indexOf("stock:") === 0) d.stock[k.slice(6)] = t.dataset.v; }
    else if (t.dataset.publish) { const c = place(), d = draft(), n = $("#needs"); if (n) d.needs = n.value; const m = 10 + Object.keys(S.upd).length * 3;
      S.upd[c.id] = { open: d.open, q: d.q, stock: Object.assign({}, d.stock), needs: d.needs, t: `7:${m} am`, until: `11:${m} am` }; }
    save(); render();
  });
  render();
})(window.RC);
