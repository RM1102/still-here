/* Still Here — public app. Vanilla JS, hash routing, localStorage state. Design: DESIGN.md (Apple HIG web tokens). */
(function (RC) {
  const KEY = "stillhere-proto-v4";
  const M = RC.Map, fmt = M.fmt, MD = RC.Model, CH = RC.Chart, C = MD.compact, P = MD.pct, I = RC.icon;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = n => n.replace(/\(.*\)/, "").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  function defaultState() {
    return { entered: false, mode: "desktop", tab: "thread", mesh: false,
      cases: { meera: { state: "flagged", log: [] }, kamla: { state: "flagged", log: [] } },
      checkins: {}, radar: { id: false, live: false, taken: null }, mapLayer: "people", wardTab: "services",
      noticeVotes: {}, joined: {}, requestMode: "active", requested: false, stepsDone: [], reachedBoost: 0, thread: [], allFlows: false,
      mapArea: "delhi", mapState: null, mapSel: null, ti: 0, msgs: false };
  }
  let S = load();
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.cases) return Object.assign(defaultState(), s); } catch (e) {} return defaultState(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function markStep(n) { if (!S.stepsDone.includes(n)) S.stepsDone.push(n); }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  const WARD = MD.myWard;
  function myWard(h) { const v = MD.scopes.unit(WARD.key, h == null ? MD.NOW : h); return Object.assign({}, v, { reached: v.reached + S.reachedBoost }); }
  const TT = () => MD.TIMES[S.ti || 0], HH = () => TT().h, isNow = () => !S.ti;
  const row2 = (l, v) => `<div class="row"><span>${l}</span><span>${v}</span></div>`;

  /* ---------- primitives ---------- */
  const head = (title, lede, back) => `${back ? `<div style="margin-bottom:10px"><a href="${back[0]}" class="fn" style="color:var(--accent);font-size:15px">‹ ${esc(back[1])}</a></div>` : ""}<h1 class="title">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ""}`;
  const sect = (t, right) => `<div class="secthead"><h2 class="h2">${t}</h2>${right || ""}</div>`;
  const stat = (l, v, d, help) => `<div class="stat"${help ? ` data-help="${help}"` : ""}>${help ? `<span class="info">${I("info", 15)}</span>` : ""}<div class="l">${l}</div><div class="v">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
  const tile = (icon, color, lg) => `<span class="tile ${color}${lg ? " lg" : ""}">${I(icon, lg ? 22 : 16)}</span>`;
  const st = (cls, word, help) => `<span class="st ${cls}"${help ? ` data-help="${help}"` : ""}>${word}</span>`;
  const disc = (label, body) => `<details class="disc"><summary>${I("circle-help", 15)}${label}</summary><div class="body">${body}</div></details>`;
  const chev = () => `<span class="chev">${I("chevron-right", 16)}</span>`;
  const caseSt = c => ({ flagged: st("red", "Alone"), circle: st("red", "Alone"), notified: st("red", "Nobody going yet"), claimed: st("orange", "On the way"), reached: st("green", "Reached"), placed: st("green", "Safe"), cant: st("orange", "Re-routed") }[c.state] || "");
  function statusOf(p) {
    if (p.status === "stopped") return st("red", "Gone · 14:32", "stopped");
    if (p.status === "nodevice") return st("", "No phone", "nodevice");
    return st("green", "Here · " + esc(p.last), "active");
  }

  /* ---------- screens ---------- */
  const V = {};

  V["#alert"] = () => `
    ${head("Still Here", "Who's still here. Who's alone. Who's closest.")}
    <div class="group" style="margin-top:26px">
      <div class="alert-row">${tile("siren", "red", true)}<div class="tt"><b>Emergency alert · NDMA · 06:00</b><span style="font-size:15px;color:var(--label);margin-top:4px">At 14:32:07 yesterday, half of all living people vanished. Nobody has vanished since. Stay where you are unless someone needs you.</span></div></div>
      <div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>+91 98••• •4410</b><span>Rohini Sector 7, Delhi, where this phone sleeps at night</span></div>${st("green", "Carrier verified")}</div>
    </div>
    <p class="foot">Also on WhatsApp at 90131 51515, by SMS HERE to 1098, or a missed call to 1800-11-1098.</p>
    <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="enter">I'm Still Here</button></div>
    <p class="foot">This lets your carrier show you the status of the people you choose. Nothing about you is shown to anyone you haven't chosen.</p>`;

  V["#home"] = () => {
    const w = myWard(), ind = MD.scopes.india(MD.NOW);
    const gone = RC.people.filter(p => p.status === "stopped"), nophone = RC.people.filter(p => p.status === "nodevice"), here = RC.people.filter(p => p.status === "active");
    const person = (p, right) => `<div class="r">${`<span class="avatar">${initials(p.name)}</span>`}<div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.age} · ${esc(p.city)}</span></div>${right}</div>`;
    const need = id => { const c = RC.cases[id], s = S.cases[id];
      return `<a class="r" href="#case-${id}"><span class="avatar">${initials(c.name)}</span><div class="tt"><b>${c.name}, ${c.age}</b><span>${id === "meera" ? "Your granddaughter · Mumbai, 1,410 km · both parents gone" : "Your mother · 3.1 km · you're the nearest adult"}</span></div>${caseSt(s)}${chev()}</a>`; };
    return `
      ${head("Who's still here", "Day 1, 07:10 · Rohini Sector 7, Delhi")}
      <div class="group" style="margin-top:24px" data-help="vanish"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>No new vanishings since the Snap</b><span>Nobody's phone has gone silent since 14:32 yesterday.</span></div><span class="spark" id="flat2"></span></div></div>
      <div class="stats" style="margin-top:14px">
        ${stat("Reached and safe in the last hour, India", C(ind.lastHour), C(ind.reached) + " so far", "reached")}
        ${stat("Reached and safe in your ward", `${fmt(w.reached)} <small>of ${fmt(w.A)}</small>`, P(w.reached / w.A) + " · Rohini", "alone")}
        ${stat("Your people", `${here.length} <small>here</small> · ${gone.length} <small>gone</small>`, `${nophone.length} without a phone`, "stopped")}
      </div>
      ${sect("Needs you")}
      <div class="group">${need("meera")}${need("kamla")}</div>
      ${sect("Your people", `<a href="#cases">Who's counting on you</a>`)}
      <div class="h3" style="margin:0 4px 8px">Here</div>
      <div class="group">${here.map(p => person(p, p.checkedIn ? st("green", "Checked in") : S.checkins[p.id] ? st("", "Pinged") : `${statusOf(p)}<button class="btn btn-compact" data-action="checkin" data-id="${p.id}">Check In</button>`)).join("")}</div>
      <div class="h3" style="margin:22px 4px 8px">No phone of their own</div>
      <div class="group">${nophone.map(p => `<a class="r" href="#case-${p.id}"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.age} · ${esc(p.city)}</span></div>${statusOf(p)}${chev()}</a>`).join("")}</div>
      <div class="h3" style="margin:22px 4px 8px">Gone</div>
      <div class="group">${gone.map(p => person(p, statusOf(p))).join("")}</div>
      <div class="btn-row"><a class="btn btn-block" href="#request">Add Someone or Raise a Check</a></div>
      ${disc("How statuses are known", "A phone that stopped all activity at the instant of the Snap, while its network stayed up, belongs to someone who is gone. Carriers see signalling, platforms see presence, watches see heart rate. Nobody has to report anything.")}`;
  };

  V["#cases"] = () => `
    ${head("Cases", "Who's alone, and who's counting on you.")}
    <div class="h3" style="margin:26px 4px 8px">Alone, in your people</div>
    <div class="group"><a class="r" href="#case-meera"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3</b><span>Granddaughter · Mumbai, 1,410 km · both parents gone</span></div>${caseSt(S.cases.meera)}${chev()}</a></div>
    <div class="h3" style="margin:22px 4px 8px">You're the nearest adult for</div>
    <div class="group">
      <a class="r" href="#case-kamla"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78</b><span>Your mother · 3.1 km · the other adult is gone, no phone</span></div>${caseSt(S.cases.kamla)}${chev()}</a>
      <div class="r"><span class="avatar">M</span><div class="tt"><b>Meena's children, 7 and 10</b><span>Sector 8 · Meena is home and active</span></div>${st("green", "With Meena")}</div>
      <div class="r"><span class="avatar">AV</span><div class="tt"><b>Anita Verma's father, 81</b><span>Pitampura · Anita is closer; you're the backup</span></div>${st("orange", "Anita is going")}</div>
    </div>
    ${sect("Raise a check on anyone")}${requestCard()}`;
  function requestCard() {
    const mode = S.requestMode, a = mode === "active";
    const res = !S.requested ? "" : a
      ? `<div class="group" style="margin-top:14px"><div class="r t">${tile("check", "green")}<div class="tt"><b>Shalini Gupta is here</b><span>Her phone was used an hour ago in Jaipur. No visit needed. A check-in ping has been sent.</span></div></div></div>`
      : `<div class="group" style="margin-top:14px"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>Savitri Devi has no phone, and the other adult is gone</b><span>Sent to four people within 3 km in Jaipur who know her. Nobody has said they're going yet. If nobody does by 09:15, it goes to 112 Jaipur.</span></div>${st("red", "Alone")}</div></div>`;
    return `<div class="seg" style="margin:0 0 12px"><button class="${a ? "on" : ""}" data-action="reqmode" data-v="active">Someone With a Phone</button><button class="${!a ? "on" : ""}" data-action="reqmode" data-v="nodevice">Someone Without</button></div>
      <div class="group"><div class="r"><div class="tt"><span>Name</span><b>${a ? "Shalini Gupta" : "Savitri Devi"}</b></div></div><div class="r"><div class="tt"><span>Age and where</span><b>${a ? "45 · Malviya Nagar, Jaipur" : "82 · Malviya Nagar, Jaipur"}</b></div></div></div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="request">Raise a Check</button></div>
      <p class="foot">Often it's settled without a visit, because their phone is active.</p>${res}`;
  }
  V["#request"] = () => `${head("Raise a check", "Ask about anyone you're worried about.", ["#home", "Still Here"])}<div style="margin-top:22px">${requestCard()}</div>`;

  V["#case-meera"] = () => {
    const c = RC.cases.meera, s = S.cases.meera;
    let body = "";
    if (s.state === "flagged") body = `${sect("Can you be there within two hours?")}<p class="sub" style="padding:0 4px">If not, Still Here shows you who can: the people who already know her.</p>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="meera-yes">Yes, I Can</button><button class="btn btn-prominent" style="flex:1" data-action="meera-no">No, I Can't</button></div>`;
    else if (s.state === "circle") body = `${sect("Her circle, nearest first")}
      <div class="group">${c.circle.map(p => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b style="${p.stopped ? "color:var(--label2)" : ""}">${esc(p.name)}</b><span>${esc(p.rel)} · ${p.dist} km · ${esc(p.last)} · ${esc(p.via)}</span></div>${p.stopped ? st("red", "Gone") : st("green", "Reachable")}</div>`).join("")}</div>
      <p class="foot">One message, every door: WhatsApp, SMS, the building's group, and a missed-call line for the watchman.</p>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="meera-send">Send One Message to All Six</button></div>`;
    else if (s.state === "notified") body = `${sect("Waiting for someone to go")}
      <div class="group"><div class="r t">${tile("users", "orange")}<div class="tt"><b>Six people notified</b><span>Everyone in her circle can see that nobody has said they're going yet.</span></div>${st("red", "0 going")}</div>
      <div class="r t">${tile("siren", "gray")}<div class="tt"><b>Goes to 112 and CHILDLINE 1098 at 09:12</b><span>If nobody claims her in two hours, her address and age go to the police in Mumbai.</span></div></div></div>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">Open Messages to See Replies</button></div>`;
    else if (s.state === "claimed") body = `${sect("Someone is going")}
      <div class="group"><div class="r t">${tile("truck", "orange")}<div class="tt"><b>Lata Pawar is on her way</b><span>She replied GOING on WhatsApp at 07:40 and expects to arrive at 08:05. The other five can see this.</span></div>${st("orange", "On the way")}</div>
      <div class="r t">${tile("clock", "gray")}<div class="tt"><b>Reopens at 09:05</b><span>If she doesn't confirm she's with Meera, the case goes out to her circle again.</span></div></div></div>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">Open Messages</button></div>`;
    else if (s.state === "reached") body = `${sect("Lata has Meera")}
      <div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>Confirmed at 08:15</b><span>"She's fine, hungry. At the flat." Confirmed by Lata's reply and her phone at the address.</span></div>${st("green", "Reached")}</div></div>
      ${sect("Where should Meera stay until you can come?")}
      <div class="group tiles"><button class="r" data-action="meera-place" data-v="lata">${tile("house", "blue")}<div class="tt"><b>Stay with Lata at the flat</b><span>A known adult at a known address. The default.</span></div>${chev()}</button>
      <button class="r" data-action="meera-place" data-v="care">${tile("building-2", "indigo")}<div class="tt"><b>Govt Primary School, Marol</b><span>Care point 400 m away · police present · 9 places</span></div>${chev()}</button></div>`;
    else if (s.state === "placed") body = `${sect("Meera is safe")}
      <div class="group"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>${s.placed === "care" ? "At Govt Primary School, Marol" : "With Lata Pawar at the flat"}</b><span>${s.placed === "care" ? "A vetted adult is on duty." : "Lata is registered as her temporary custodian."} You collect her when trains run again, in week two.</span></div>${st("green", "Safe")}</div></div>
      <p class="foot">Half the population is legally missing for seven years. This record is what a court and a bank will have to accept, and what child protection takes over.</p>
      <div class="btn-row"><button class="btn btn-block" data-action="export" data-id="meera">${I("file-down", 17)}Export Case Record</button></div>`;
    const log = s.log.length ? `${sect("Case record")}<div class="group"><ul class="log">${s.log.map(l => `<li><time>${l.t}</time><span>${esc(l.text)}</span></li>`).join("")}</ul></div>` : "";
    return `${head("Meera", "Case SH-7731 · Flat 402, Sunrise Towers, Andheri East, Mumbai", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3</b><span>You're 1,410 km away</span></div>${caseSt(s)}</div></div>
      ${disc("How this case was found", esc(c.why) + " Her circle is the overlap of her parents' contacts within 5 km, nearest and most recently active first.")}${body}${log}`;
  };

  V["#case-kamla"] = () => {
    const c = RC.cases.kamla, s = S.cases.kamla;
    let body = "";
    if (s.state === "flagged") body = `${sect("You're the nearest adult")}<p class="sub" style="padding:0 4px">She's 3.1 km away. Nobody else who knows her is closer or active.</p>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="kamla-cant">I Can't</button><button class="btn btn-prominent" style="flex:1" data-action="kamla-going">I'm Going</button></div>`;
    else if (s.state === "claimed") body = `${sect("You're on your way")}<div class="group"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>Claimed at 07:20</b><span>Shalini and Anita can see it. It reopens at 09:20 if you don't confirm.</span></div>${st("orange", "On the way")}</div></div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="kamla-reached">I'm With Her</button></div>`;
    else if (s.state === "reached") body = `${sect("You're with her")}<div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>Confirmed at 07:55</b><span>By your tap and your phone at the address. Her health record (diabetes, blood pressure tablets) is open to you at any care point.</span></div>${st("green", "Reached")}</div></div>`;
    else if (s.state === "cant") body = `${sect("Sent to the next nearest")}<div class="group"><div class="r t">${tile("users", "orange")}<div class="tt"><b>Anita Verma and Shalini Gupta notified</b><span>Anita is 2.6 km away and active. Kiran, the ASHA worker 0.8 km away, is on standby.</span></div></div></div>
      <div class="btn-row"><button class="btn btn-block" data-action="kamla-going">Actually, I'm Going</button></div>`;
    const log = s.log.length ? `${sect("Record")}<div class="group"><ul class="log">${s.log.map(l => `<li><time>${l.t}</time><span>${esc(l.text)}</span></li>`).join("")}</ul></div>` : "";
    return `${head("Kamla Devi", "C-7/112, Rohini Sector 7, Delhi", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78</b><span>Your mother</span></div>${caseSt(s)}</div></div>
      ${disc("How this case was found", esc(c.why))}${body}${log}`;
  };

  /* map */
  function areaAgg(h) { return S.mapArea === "delhi" ? MD.scopes.delhi(h) : S.mapState ? MD.scopes.state(S.mapState, h) : MD.scopes.india(h); }
  function selAgg(h) { const s = S.mapSel; if (!s) return null; return s.kind === "state" ? MD.scopes.state(s.key, h) : MD.scopes.unit(s.key, h); }
  function selName() { const s = S.mapSel; if (!s) return ""; if (s.kind === "state") return s.key; const u = MD.byKey[s.key]; return u ? (u.mine ? u.name + ", your ward" : u.name) : s.key; }
  const SVC_ICON = { Power: "zap", Water: "droplets", Metro: "train-front", Fuel: "truck", "Mobile network": "radio-tower" };
  function servicesGroup() { return `<div class="group tiles">${RC.services.map(s => `<div class="r t">${tile(SVC_ICON[s.k] || "activity", s.ok ? "green" : "orange")}<div class="tt"><b>${s.k}</b><span>${esc(s.v)} · ${esc(s.src)}, ${s.t}</span></div>${s.ok ? st("green", "Up") : st("orange", "Partial")}</div>`).join("")}</div>`; }
  function noticesGroups() {
    return RC.notices.map((n, i) => { const v = S.noticeVotes[i] || { c: 0, d: 0 };
      return `<div class="group"><div class="r t">${tile("landmark", "gray")}<div class="tt"><b>${esc(n.from)}</b><span>${n.t}</span></div></div><div class="pad" style="font-size:15px">${esc(n.text)}</div>
        ${n.confirms == null ? "" : `<div class="pad"><div class="okline">${I("check", 16)}<span>${n.confirms + v.c} people at the spot confirmed it · ${n.denies + v.d} said it's wrong · last ${n.confirmedAt}</span></div><div class="btn-row" style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-compact" data-action="vote" data-i="${i}" data-v="c">I'm There, It's True</button><button class="btn btn-compact btn-plain" data-action="vote" data-i="${i}" data-v="d">Not True</button></div></div>`}</div>`; }).join("")
      + disc("How a notice gets verified", "An official declaration plus confirmations from phones physically at the spot. Every report carries a name. Facts fade after two hours without a new confirmation.");
  }
  V["#map"] = () => {
    const layer = S.mapLayer, h = HH();
    const layers = [["people", "People"], ["services", "Services"], ["notices", "Notices"], ["danger", "Avoid"]].map(([k, l]) => `<button class="${layer === k ? "on" : ""}" data-action="maplayer" data-v="${k}">${l}</button>`).join("");
    let body = "";
    if (layer === "services") body = servicesGroup();
    else if (layer === "notices") body = noticesGroups();
    else if (layer === "danger") body = `<div class="mapgroup"><div class="mapbox" id="avoidmap"></div></div><div class="group tiles" style="margin-top:14px">${RC.avoid.map(d => `<div class="r t">${tile("triangle-alert", "red")}<div class="tt"><b>${esc(d.z)}</b><span>${esc(d.why)}</span></div></div>`).join("")}</div>`;
    else {
      const v = areaAgg(h), name = S.mapArea === "delhi" ? "Delhi" : S.mapState || "India", sel = selAgg(h);
      body = `<div class="filters" style="margin-top:0"><div class="seg"><button class="${S.mapArea === "delhi" ? "on" : ""}" data-action="maparea" data-v="delhi">Delhi</button><button class="${S.mapArea === "india" ? "on" : ""}" data-action="maparea" data-v="india">India</button></div>
          <div class="seg">${MD.TIMES.map((t, i) => `<button class="${(S.ti || 0) === i ? "on" : ""}" data-action="time" data-v="${i}">${t.short}</button>`).join("")}</div><span class="proj ${isNow() ? "now" : ""}" data-help="projection">${isNow() ? "Now" : "Projection"}</span></div>
        ${S.mapArea === "india" && S.mapState ? `<div class="crumbs"><button class="link" data-action="mapback">‹ India</button><span>·</span><b style="color:var(--label)">${esc(S.mapState)}</b></div>` : ""}
        <div class="stats" style="margin-bottom:14px">${stat(RC.TERMS.alone, C(v.A), name, "alone")}${stat(RC.TERMS.reached, C(v.reached), P(v.share), "reached")}${stat(RC.TERMS.claimed, C(v.claimed), "", "claimed")}${stat(RC.TERMS.unclaimed, C(v.unclaimed), "", "unclaimed")}</div>
        <div class="mapgroup"><div class="mapbox" id="pubmap"></div>${M.legend()}</div>
        ${sel ? `${sect(esc(selName()), sel.nodata ? st("", "No data") : st(sel.share >= 0.5 ? "green" : sel.share >= 0.25 ? "orange" : "red", P(sel.share) + " reached"))}
          <div class="group pad">${sel.nodata ? `<p class="sub" style="margin:0">No phone network here, so there's no data. Shown grey, never red.</p>` : `${CH.stack(sel)}<p class="fn" style="margin:10px 0 0">${C(sel.A)} people alone · ${C(sel.u5)} small children nobody is coming for yet</p><div class="h3" style="margin:18px 0 6px">Over the next three days</div><div id="selchart"></div>${isNow() ? "" : `<p class="fn" style="margin:6px 0 0">Projection for ${esc(TT().label)}.</p>`}`}</div>` : ""}
        ${disc("Why green is hard to earn", "Green needs a reply from the person who went plus their phone at the address. Grey means no connectivity, never red. Nothing smaller than a ward is ever shown publicly.")}`;
    }
    return `${head(layer === "people" ? "Is my area being reached?" : layer === "services" ? "Services coming back" : layer === "notices" ? "Official notices" : "Places to avoid", layer === "people" ? `${esc(TT().label)} · hover or tap any area` : "Rohini Sector 7 and around, 07:10")}
      <div class="filters"><div class="seg">${layers}</div></div>${body}`;
  };
  function pubMapOpts() {
    const h = HH(), view = S.mapArea === "delhi" ? "delhi" : S.mapState ? "state" : "india", cache = {};
    const valOf = k => cache[k] || (cache[k] = view === "india" ? MD.scopes.state(k, h) : MD.scopes.unit(k, h));
    const nm = k => view === "india" ? k : (MD.byKey[k] || {}).name || k;
    const o = { view, state: S.mapState, aria: "Map", fill: k => { const v = valOf(k); return v ? MD.color(v) : null; } };
    o.sel = S.mapSel ? S.mapSel.key : null;
    if (view === "delhi") { o.mine = WARD.key; o.labels = [{ k: WARD.key, t: "You · Rohini", strong: true }].concat(o.sel && o.sel !== WARD.key && MD.byKey[o.sel] ? [{ k: o.sel, t: MD.byKey[o.sel].name, strong: true }] : []); }
    else if (view === "india") o.labels = Object.entries(RC.GEO.india.states).filter(([n]) => MD.scopes.state(n, h).A > 3e5).map(([n, s]) => ({ at: s.c, t: s.code }));
    else o.labels = (MD.byState[S.mapState] || []).slice().sort((a, b) => b.A - a.A).slice(0, 6).map(u => ({ k: u.key, t: u.name }));
    o.hover = k => { const v = valOf(k); if (!v) return `<b>${esc(nm(k))}</b>`; if (v.nodata) return `<b>${esc(nm(k))}</b><div>No phone network, so no data.</div>`;
      return `<b>${esc(nm(k))}${view === "delhi" && k === WARD.key ? ", your ward" : ""}</b>${row2("People alone", C(v.A))}${row2("Reached and safe", P(v.share))}${row2("Someone on the way", C(v.claimed))}${row2("Nobody yet", C(v.unclaimed))}${isNow() ? "" : `<div class="src">Projection for ${esc(TT().label)}</div>`}<div class="hintl">${view === "india" ? (k === "Delhi" ? "Click to open Delhi's wards" : "Click to see its districts") : "Click for detail"}</div>`; };
    o.click = k => { if (view === "india") { if (k === "Delhi") { S.mapArea = "delhi"; S.mapState = null; S.mapSel = { kind: "ward", key: WARD.key }; } else { S.mapState = k; S.mapSel = { kind: "state", key: k }; } } else S.mapSel = { kind: view === "delhi" ? "ward" : "district", key: k }; render(); };
    return o;
  }

  const FLOW_ICON = { rail: "train-front", road: "truck", air: "plane", sea: "ship" };
  V["#help"] = () => {
    const ind = MD.scopes.india(MD.NOW), shown = S.allFlows ? RC.flows : RC.flows.slice(0, 4);
    return `${head("Help is coming", "What's on its way, and what's open near you.")}
      <div class="stats" style="margin-top:24px">${stat("Reached and safe in the last hour, India", C(ind.lastHour), C(ind.reached) + " so far", "reached")}${stat(RC.TERMS.vanish, "0", "since 14:32 yesterday", "vanish")}</div>
      ${sect("On its way", RC.flows.length > 4 ? `<button class="link" data-action="allflows">${S.allFlows ? "Show Fewer" : "Show All " + RC.flows.length}</button>` : "")}
      <div class="group tiles">${shown.map(f => `<div class="r t">${tile(FLOW_ICON[f.kind] || "package", "blue")}<div class="tt"><b>${esc(f.what)}</b><span>${esc(f.from)} → ${esc(f.to)}</span></div><span class="val">Left ${f.dep}</span></div>`).join("")}</div>
      <p class="foot">Shown two hours late, with no route and no arrival time. You learn that help is coming; a raider learns nothing.</p>
      <div class="mapgroup" style="margin-top:14px"><div class="mapbox" id="flowmap" style="height:440px;min-height:0"></div></div>
      ${sect("Restoration in Delhi")}<div class="stats">${RC.restoration.map(r => stat(r.k, `${r.v} <small>${esc(r.unit)}</small>`)).join("")}</div>
      ${sect("Open near you")}
      <div class="group tiles">${RC.places.map(p => `<div class="r t">${tile(p.kind === "worship" ? "landmark" : "building-2", p.open ? "green" : "gray")}<div class="tt"><b>${esc(p.name)}</b><span>${esc(p.staff)} · ${esc(p.dist)}${p.hub ? ` · ${I("wifi", 13)} ${esc(p.hub)}` : ""}</span></div>${p.open ? st("green", "Open") : st("", "Unknown")}</div>`).join("")}</div>
      <p class="foot">Open means an adult on duty and a phone at the spot in the last hour. Places with an offline hub serve maps, medical pages and messages on their own Wi-Fi when towers are down.</p>
      ${sect("Communities taking people in")}
      <div class="group tiles">${RC.communities.filter(c => c.accepting).map((c, i) => `<div class="r t">${tile("users", "indigo")}<div class="tt"><b>${esc(c.name)}</b><span>${esc(c.note || c.members)}</span></div>${S.joined[i] ? st("green", "Asked") : `<button class="btn btn-compact" data-action="join" data-i="${i}">Ask to Join</button>`}</div>`).join("")}</div>`;
  };

  V["#ward"] = () => {
    const t = S.wardTab;
    const tabs = [["services", "Services"], ["notices", "Notices"], ["groups", "Groups"], ["authorities", "Authorities"], ["places", "Places"]].map(([k, l]) => `<button class="${t === k ? "on" : ""}" data-action="wardtab" data-v="${k}">${l}</button>`).join("");
    let body = "";
    if (t === "services") body = servicesGroup();
    else if (t === "notices") body = noticesGroups();
    else if (t === "groups") body = `<div class="group tiles">${RC.communities.map((g, i) => `<div class="r t">${tile("users", g.accepting ? "indigo" : "gray")}<div class="tt"><b>${esc(g.name)}</b><span>${esc(g.members)} · ${esc(g.organiser)}</span></div>${g.accepting ? (S.joined[i] ? st("green", "Asked") : `<button class="btn btn-compact" data-action="join" data-i="${i}">Ask to Join</button>`) : st("", "Members only")}</div>`).join("")}</div>`;
    else if (t === "authorities") body = `<div class="group tiles">${RC.authorities.map(a => `<div class="r t">${tile("shield", "blue")}<div class="tt"><b>${esc(a.name)}</b><span>${esc(a.staff)} · ${esc(a.dist)}</span></div><span class="val">${esc(a.phone)}</span></div>`).join("")}</div><p class="foot">Staff counts come from a roll call on each roster: the same phone signal as everything else.</p>`;
    else body = `<div class="group tiles">${RC.places.map(p => `<div class="r t">${tile(p.kind === "worship" ? "landmark" : "building-2", p.open ? "green" : "gray")}<div class="tt"><b>${esc(p.name)}</b><span>${esc(p.staff)} · ${esc(p.dist)}</span></div>${p.open ? st("green", "Open") : st("", "Unknown")}</div>`).join("")}</div>`;
    return `${head(RC.me.ward, "Your ward · you're a verified resident")}<div class="filters"><div class="seg">${tabs}</div></div>${body}${disc("Who sees what", "You see your own ward and the ones next to it in detail. Everywhere else you see counts only. A case opens access to one address, never to an area.")}`;
  };

  V["#radar"] = () => {
    const r = S.radar, ok = r.id && r.live, n = RC.radar.within1km;
    return `${head("Near you", "Help beyond your own circle. Optional.")}
      ${sect("Verify yourself first")}
      <div class="group tiles"><div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>Phone number</b><span>Checked by your carrier</span></div>${st("green", "Done")}</div>
      <div class="r t">${tile("user-round", "gray")}<div class="tt"><b>Government ID</b><span>Through DigiLocker</span></div>${r.id ? st("green", "Done") : `<button class="btn btn-compact" data-action="verify" data-v="id">Verify</button>`}</div>
      <div class="r t">${tile("activity", "gray")}<div class="tt"><b>Face check</b><span>Makes sure it's you holding the phone</span></div>${r.live ? st("green", "Done") : `<button class="btn btn-compact" data-action="verify" data-v="live">Start</button>`}</div></div>
      ${disc("Why it's fenced", "A list of children alone is a predator's list. So: identity before any address, two people for any handover, a care point by default and never your home, every handover recorded, and anyone collecting cases is flagged. Your own circle always comes first; this is the extra layer.")}
      ${ok ? `${sect("Alone within 1 km")}<div class="stats">${stat("Nobody coming yet", n.unclaimed)}${stat("Under five", n.under5)}${stat("Over 75", n.elderly)}</div>
        <div class="group tiles" style="margin-top:14px">${RC.radar.cases.map(c => `<div class="r t">${tile(c.ageBand === "under 5" ? "baby" : "user-round", "red")}<div class="tt"><b>${esc(c.ageBand)} · alone ${c.hoursSinceT} h</b><span>${esc(c.address)} · goes to ${esc(c.care)}</span></div>${r.taken === c.id ? st("orange", "You and Dr. Rao") : r.taken ? "" : `<button class="btn btn-compact" data-action="take" data-id="${c.id}">Take It</button>`}</div>`).join("")}</div>` : ""}`;
  };

  let deferredInstall = null, savedOffline = false;
  function checkSaved() { if (!window.caches) return; caches.keys().then(k => { const v = k.some(x => x.indexOf("stillhere-") === 0); if (v !== savedOffline) { savedOffline = v; if (location.hash === "#kit") render(); } }).catch(() => {}); }
  if (navigator.serviceWorker) navigator.serviceWorker.ready.then(() => setTimeout(checkSaved, 800));
  checkSaved();
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (location.hash === "#kit") render(); });
  function kitRow(k) {
    return `<details class="row"><summary class="r t">${tile(k.icon, k.tile)}<div class="tt"><b>${esc(k.name)}</b><span>${esc(k.what.split(". ")[0])}.</span></div><span class="val">${esc(k.size || "")}</span>${chev()}</summary>
      <dl class="more"><dt>What it is</dt><dd>${esc(k.what)}</dd><dt>Why now</dt><dd>${esc(k.why)}</dd><dt>How</dt><dd>${esc(k.how)}</dd><dt>Get it from the official source</dt><dd><span class="btn-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">${k.links.map(l => `<a class="btn btn-compact" href="${l.u}" target="_blank" rel="noopener">${esc(l.l)} ${I("external-link", 14)}</a>`).join("")}</span></dd></dl></details>`;
  }
  V["#kit"] = () => {
    const online = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const saved = savedOffline;
    const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    return `${head("Offline kit", "Save these while the towers are up. What you save today still works on day ten.")}
      ${sect("Still Here on this phone")}
      <div class="group tiles">
        <div class="r t">${tile("smartphone", "ink")}<div class="tt"><b>Install Still Here</b><span>${standalone ? "Installed. It opens like any app." : deferredInstall ? "Adds it to your home screen like an app. No app store, no account." : "On iPhone: Share, then Add to Home Screen. On Android: the browser menu, then Install app."}</span></div>${standalone ? st("green", "Installed") : deferredInstall ? `<button class="btn btn-compact" data-action="install">Install</button>` : ""}</div>
        <div class="r t">${tile("hard-drive", "blue")}<div class="tt"><b>Works without a connection</b><span>${!online ? "Open the online link once to save it on this phone." : saved ? "Saved. Every screen and map loads with no signal." : "Saving now. Reload once and it's ready offline."}</span></div>${saved ? st("green", "Saved") : st("", online ? "Saving" : "Online only")}</div>
        <a class="r t" href="lite.html">${tile("wifi-off", "gray")}<div class="tt"><b>Still Here Lite</b><span>One small page that loads on 2G and old phones, with what to do, what's open and first aid.</span></div><span class="val">about 8 KB</span>${chev()}</a>
      </div>
      ${sect("Apps that work without towers")}
      <div class="group tiles">${RC.kit.map(kitRow).join("")}</div>
      <p class="foot">Links go to each project's own store page or website. Copies from anywhere else can't be checked, so this page never hosts them.</p>
      ${sect("For care points")}
      <div class="group tiles">${RC.hubs.map(kitRow).join("")}</div>
      ${sect("Pinned for day one")}
      <div class="group tiles">${RC.kitPages.map(p => `<details class="row"><summary class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>${esc(p.t)}</b></div>${chev()}</summary><div class="more" style="line-height:1.5">${esc(p.s)}</div></details>`).join("")}</div>
      <p class="foot">From the Kiwix medical pack (Where There Is No Doctor, WHO basics), saved inside this app.</p>
      ${disc("Mesh mode", "Switch Messages to Towers down to see a block's conversation over Bluetooth: hops instead of ticks, no server, no number. That is what Bitchat does.")}`;
  };

  V["#about"] = () => `
    ${head("About this prototype", "Still Here, for the day after the Snap.")}
    <div class="stats" style="margin-top:24px">${stat("Children with no adult at home, the morning after", "~240 M")}${stat("Of them under five", "~80 M")}${stat("With someone alive in their circle, within reach", "94–98%")}</div>
    ${sect("The idea")}
    <div class="group"><div class="pad"><div class="h3">The one signal</div><p class="sub" style="margin:6px 0 0">The Snap leaves no bodies. Its only mark is that 3.8 billion phones went silent in the same second. Carriers and platforms already hold that. Still Here turns it into who's gone, who's alone, who's closest, who's going, and who has them.</p></div>
    <div class="pad"><div class="h3">The test every feature passed</div><p class="sub" style="margin:6px 0 0">Would a self-interested survivor want it that morning, with data and behaviour that exist that morning, that governments and existing apps won't provide in the first days, without anyone having to be kind?</p></div>
    <div class="pad"><div class="h3">What's real and what's simulated</div><p class="sub" style="margin:6px 0 0">Every person, address and count is made up, and one model drives every number so they add up. The maps are real: Natural Earth, india-maps-data, and Delhi's 290 ward boundaries from datameet. Nothing leaves this page.</p></div></div>
    ${sect("The government view")}
    <div class="group"><a class="r t" href="cockpit.html" target="_blank" rel="noopener">${tile("landmark", "ink")}<div class="tt"><b>Open the control room</b><span>A separate, restricted system in the real product. Linked here only for the demo.</span></div>${chev()}</a></div>
    ${sect("Glossary")}
    <div class="group">${Object.values(RC.HELP).map(H => `<div class="r"><div class="tt"><b>${esc(H.t)}</b><span>${esc(H.b)}</span></div></div>`).join("")}</div>
    <div class="btn-row"><button class="btn btn-block" data-action="reset">Reset the Demo</button></div>`;

  /* ---------- actions ---------- */
  function addLog(id, t, text) { S.cases[id].log.push({ t, text }); }
  function thread(from, text, t, kind) { S.thread.push({ from, text, t, kind }); }
  function toast(text) { let t = document.querySelector(".fb-toast"); if (!t) { t = document.createElement("div"); t.className = "fb-toast glass"; t.setAttribute("role", "status"); document.body.appendChild(t); } t.innerHTML = `<span class="fb-icon" data-kind="success" style="color:var(--apple-green)">${I("check", 18)}</span>${esc(text)}`; t.style.display = "flex"; clearTimeout(t._h); t._h = setTimeout(() => t.style.display = "none", 2600); }
  function download(name, obj) { const b = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function caseExport(id) {
    const c = RC.cases[id], s = S.cases[id];
    return { record_type: "child_protection_case", format_note: "Shaped like a Primero case (UNICEF) for handover. Simulated data from the Still Here prototype.", case_id: "SH-7731", status: s.state,
      child: { name: c.name, age: c.age, age_band: c.ageBand, last_known_address: c.address, ward: c.ward }, how_found: c.why,
      caregivers: [{ name: "Aman Sharma", relation: "father", status: "vanished 14:32:07" }, { name: "Priya Sharma", relation: "mother", status: "vanished 14:32:07" }],
      current_custodian: s.placed === "care" ? { type: "care_point", name: RC.cases.meera.carePoint.name } : { type: "known_adult", name: "Lata Pawar", relation: "nanny" },
      next_of_kin: { name: "Sunita Sharma", relation: "grandmother", city: "Delhi", plan: "collect in week two" }, custody_log: s.log, exported_at: "Day 1 08:20" };
  }
  const A = {
    enter() { S.entered = true; markStep(1); go("#home"); },
    checkin(d) { S.checkins[d.id] = true; markStep(2); toast("Check-in ping sent"); },
    "meera-yes"() { S.cases.meera.state = "circle"; addLog("meera", "07:11", "Sunita (grandmother, Delhi) can't reach within two hours: 1,410 km, no transport. Showing her circle."); markStep(3); },
    "meera-no"() { S.cases.meera.state = "circle"; addLog("meera", "07:11", "Sunita (grandmother, Delhi) can't be there within two hours. Showing her circle."); markStep(3); },
    "meera-send"() { const c = S.cases.meera; c.state = "notified";
      addLog("meera", "07:12", "One message sent to six people in Meera's circle: WhatsApp to three, SMS to one, the building's group, and a missed-call line. Goes to the police at 09:12 if nobody claims.");
      thread("Still Here", "ALONE: Meera, 3, Flat 402 Sunrise Towers, Andheri E. Both parents gone at 14:32. Her grandmother in Delhi can't reach. Who can? Reply GOING or CAN'T. Case SH-7731.", "07:12", "out");
      thread("sys", "Sent to Lata, Rakesh, Farah, Dr. Nair, the building's group and the society office · nobody going yet", "07:12", "sys"); markStep(4); S.msgs = true; },
    "reply-lata-going"() { const c = S.cases.meera; if (c.state !== "notified") return; c.state = "claimed";
      thread("Lata Pawar", "GOING. 25 min. I have the spare key.", "07:40", "in");
      thread("sys", "Lata Pawar is going · arriving 08:05 · the other five can see this · reopens 09:05 if not confirmed", "07:40", "sys");
      addLog("meera", "07:40", "Lata Pawar (nanny, 1.8 km) replied GOING on WhatsApp, arriving 08:05. The rest of the circle was told."); markStep(5); },
    "reply-rakesh-cant"() { if (["flagged", "circle"].includes(S.cases.meera.state)) return; thread("Rakesh Mehta", "CAN'T. Car wrecked, I'm walking to my mother. Sorry.", "07:18", "in"); },
    "reply-lata-have"() { const c = S.cases.meera; if (c.state !== "claimed") return; c.state = "reached";
      thread("Lata Pawar", "HAVE HER. She's fine, hungry. At the flat.", "08:15", "in");
      thread("sys", "Custody record opened: Lata Pawar has Meera since 08:15 · her phone is at the address", "08:15", "sys");
      addLog("meera", "08:15", "Reached. Lata Pawar has Meera, confirmed by her reply and her phone at the address. Custody record opened."); markStep(6); },
    "meera-place"(d) { const c = S.cases.meera; c.state = "placed"; c.placed = d.v; S.reachedBoost += 1;
      addLog("meera", "08:20", d.v === "care" ? "Moved to Govt Primary School, Marol (care point, police present). Adult on duty: R. Iyer." : "Temporary custodian: Lata Pawar, at Flat 402. Handover to Sunita Sharma planned for week two.");
      thread("Still Here", d.v === "care" ? "Thank you, Lata. Please take Meera to Govt Primary School, Marol (400 m). Code 4F2K. R. Iyer is on duty." : "Thank you, Lata. You're registered as Meera's temporary custodian. Her grandmother Sunita will message you here.", "08:20", "out"); },
    "kamla-going"() { S.cases.kamla.state = "claimed"; addLog("kamla", "07:20", "Sunita is going. Shalini and Anita were told. Reopens 09:20."); markStep(7); },
    "kamla-cant"() { S.cases.kamla.state = "cant"; addLog("kamla", "07:20", "Sunita can't go. Sent to Anita Verma (2.6 km) and Shalini Gupta; ASHA worker Kiran on standby."); },
    "kamla-reached"() { S.cases.kamla.state = "reached"; S.reachedBoost += 1; addLog("kamla", "07:55", "Sunita is with Kamla Devi, confirmed by her phone at the address. One more reached in Rohini."); markStep(7); },
    maparea(d) { S.mapArea = d.v; S.mapState = null; S.mapSel = d.v === "delhi" ? { kind: "ward", key: WARD.key } : null; markStep(8); }, maplayer(d) { S.mapLayer = d.v; }, time(d) { S.ti = +d.v; markStep(8); }, mapback() { S.mapState = null; S.mapSel = null; },
    msgs() { S.msgs = !S.msgs; }, wardtab(d) { S.wardTab = d.v; markStep(9); },
    vote(d) { const v = S.noticeVotes[d.i] || { c: 0, d: 0 }; v[d.v] += 1; S.noticeVotes[d.i] = v; toast(d.v === "c" ? "Thanks. Your confirmation counts once." : "Reported. It fades faster now."); },
    join(d) { S.joined[d.i] = true; markStep(10); toast("Request sent to the organiser"); }, allflows() { S.allFlows = !S.allFlows; },
    reqmode(d) { S.requestMode = d.v; S.requested = false; }, request() { S.requested = true; },
    verify(d) { S.radar[d.v] = true; markStep(11); }, take(d) { S.radar.taken = d.id; toast("Paired with Dr. Rao, 0.4 km away"); },
    install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; render(); }); } markStep(11); },
    export(d) { download("SH-7731-case-record.json", caseExport(d.id)); toast("Case record saved as a file"); },
    share() { const url = location.href.split("#")[0], data = { title: "Still Here", text: "Who's still here, who's alone, who's closest.", url };
      if (navigator.share) navigator.share(data).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link copied"), () => toast(url)); else toast(url); },
    reset() { S = defaultState(); save(); go("#alert"); },
    mode(d) { S.mode = d.mode; }, tab(d) { S.tab = d.tab; }, mesh() { S.mesh = !S.mesh; }
  };

  /* ---------- chrome ---------- */
  const NAV = [["sec", "Mine"], ["#home", "Still here", "house"], ["#cases", "Cases", "users"], ["sec", "Around me"], ["#map", "Map", "map-pinned"], ["#help", "Help is coming", "truck"], ["#ward", "Ward", "building-2"], ["sec", "Tools"], ["#radar", "Near you", "radar"], ["#kit", "Offline kit", "download"], ["sec", "Prototype"], ["#about", "About", "info"], ["cockpit.html", "Government view", "landmark"]];
  function chrome() {
    $("#nav").innerHTML = NAV.map(n => n[0] === "sec" ? `<div class="sec">${n[1]}</div>` : `<a href="${n[0]}"${n[0].indexOf("#") ? ` target="_blank" rel="noopener"` : ""}>${I(n[2], 17)}<span>${n[1]}</span></a>`).join("");
    const tabs = [["#home", "Here", "house"], ["#cases", "Cases", "users"], ["#map", "Map", "map-pinned"], ["#help", "Help", "truck"], ["#kit", "Kit", "download"]];
    $("#tabbar").innerHTML = tabs.map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#mobilenav").innerHTML = tabs.concat([["#about", "About", "info"]]).map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#topstatus").innerHTML = `${I("shield-check", 17)}<span>No new vanishings since 14:32</span><span class="long fn" style="font-weight:400">· checked with your carrier every minute</span>`;
    const sh = document.querySelector('[data-action="share"]'); if (sh) sh.innerHTML = I("share-2", 17);
  }
  const STEPS = ["Tap I'm Still Here on the alert", "See who's gone and check in on someone", "Cases, then Meera, then No, I Can't", "Send one message to her circle", "In Messages, reply as Lata: GOING", "Reply as Lata: HAVE HER, then choose where she stays", "Kamla: I'm Going, then I'm With Her", "Map: your ward, then India, then Day 2", "Ward: services, notices, groups, places", "Help is coming: departures and communities", "Near you and the offline kit", "About, then open the government view"];
  function renderThread() {
    const el = $("#thread"); if (!el) return;
    el.classList.toggle("mesh", S.mesh);
    $("#thread-title").textContent = S.mesh ? "Bitchat mesh · Sector 7" : "WhatsApp · Still Here";
    $("#thread-sub").textContent = S.mesh ? "Towers down. Bluetooth hops phone to phone, 30–100 m each. No server, no number, encrypted." : "The same case, seen from Lata's phone. Replies here update the app.";
    $("#meshtoggle").classList.toggle("on", S.mesh); $("#meshtoggle").setAttribute("aria-pressed", S.mesh ? "true" : "false");
    const s = S.cases.meera.state;
    const msgs = S.mesh ? [{ text: "Mesh · 14 phones in range · 3 hops to the school", kind: "sys" }].concat(RC.meshSample.map(m => ({ from: m.from, text: m.text, t: m.t, kind: "in" }))) : [{ text: "Still Here · official · carrier verified · 90131 51515", kind: "sys" }].concat(S.thread);
    const empty = !S.mesh && !S.thread.length;
    document.querySelectorAll(".msgbtn .badge").forEach(b => { const n = S.thread.filter(m => m.kind === "in").length; b.textContent = n || ""; b.style.display = n ? "" : "none"; });
    document.body.classList.toggle("msgs", !!S.msgs);
    el.innerHTML = empty ? `<div class="msg sys">${esc(msgs[0].text)}</div><div class="empty-thread">Messages for Meera's case appear here.<br><br>Open <a href="#case-meera">Meera's case</a>, say you can't be there, and send one message to her circle.</div>`
      : msgs.map(m => m.kind === "sys" ? `<div class="msg sys">${esc(m.text)}${m.t ? ` · ${m.t}` : ""}</div>` : `<div class="msg ${m.kind}"><span class="from">${esc(m.from)}</span>${esc(m.text)}<span class="time">${m.t || ""}${S.mesh ? " · hop" : ""}</span></div>`).join("");
    el.scrollTop = el.scrollHeight;
    let b = "";
    if (S.mesh) b = `<span class="fn">A preview. The case continues on WhatsApp when towers return.</span>`;
    else if (s === "notified") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-going">Reply as Lata: GOING</button><button class="btn btn-compact" data-action="reply-rakesh-cant">Reply as Rakesh: CAN'T</button>`;
    else if (s === "claimed") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-have">Reply as Lata: HAVE HER</button>`;
    else if (s === "flagged" || s === "circle") b = "";
    else b = `<span class="fn">Lata and Sunita can keep talking here.</span>`;
    $("#replies").innerHTML = b;
  }
  function renderDemo() {
    const el = $("#steps"); if (!el) return;
    const next = STEPS.findIndex((_, i) => !S.stepsDone.includes(i + 1));
    el.innerHTML = STEPS.map((s, i) => `<div class="step ${S.stepsDone.includes(i + 1) ? "done" : i === next ? "now" : ""}"><span class="n">${i + 1}</span><span>${s}</span></div>`).join("");
  }
  function renderMaps(root) {
    const f2 = $("#flat2", root); if (f2) CH.flatLine(f2, 150);
    const pm = $("#pubmap", root); if (pm) M.render(pm, pubMapOpts());
    const sc = $("#selchart", root); if (sc && S.mapSel) { const s = S.mapSel, fn = h => s.kind === "state" ? MD.scopes.state(s.key, h) : MD.scopes.unit(s.key, h), pts = MD.series(fn, 2);
      CH.line(sc, { height: 160, xmin: 0, xmax: 50, ymax: 1, yfmt: y => Math.round(y * 100) + "%", xlabel: h => MD.hourLabel(h), marker: HH(), markerLabel: TT().short, xticks: [{ x: 0, l: "Day 1" }, { x: 26, l: "Day 2" }, { x: 50, l: "Day 3" }],
        series: [{ name: "Reached", color: "var(--s3)", pts: pts.map(p => ({ x: p.h, y: p.share })) }, { name: "Nobody yet", color: "var(--s0)", pts: pts.map(p => ({ x: p.h, y: p.unclaimedShare })) }] }); }
    const am = $("#avoidmap", root); if (am) M.render(am, { view: "delhi", aria: "Places to avoid in Delhi", mine: WARD.key, labels: [{ k: WARD.key, t: "You", strong: true }].concat(RC.avoid.map(z => ({ ll: [z.lonlat[0], z.lonlat[1] + 0.012], t: z.z }))), zones: RC.avoid.map((z, i) => Object.assign({ id: "z" + i }, z)), hover: k => { if (k.indexOf("zone:") === 0) { const z = RC.avoid[+k.slice(6)]; return z ? `<b>${esc(z.z)}</b><div>${esc(z.why)}</div>` : ""; } const u = MD.byKey[k]; return u ? `<b>${esc(u.name)}</b>` : ""; } });
    const fm = $("#flowmap", root); if (fm) M.render(fm, { view: "india", aria: "Supplies on the way", arcs: RC.flows.filter(f => f.kind !== "road").map(f => ({ from: f.fromLL, to: f.toLL, fromLabel: f.from, toLabel: f.to })), pins: RC.communities.filter(c => c.accepting).map((c, i) => ({ id: "c" + i, lonlat: c.lonlat, color: "var(--apple-indigo)", r: 6, label: c.name.split(" (")[0].split(" hostel")[0] })), hover: k => { if (k.indexOf("pin:c") === 0) { const c = RC.communities.filter(x => x.accepting)[+k.slice(5)]; return c ? `<b>${esc(c.name)}</b><div>${esc(c.note || "")}</div>` : ""; } return `<b>${esc(k)}</b>`; } });
  }
  function render() {
    let route = location.hash || "#alert";
    if (!V[route]) route = "#alert";
    if (!S.entered && route !== "#alert") route = "#alert";
    if (route === "#map" && !S.mapSel && S.mapArea === "delhi") S.mapSel = { kind: "ward", key: WARD.key };
    const phone = S.mode === "phone" && window.innerWidth >= 760;
    document.body.classList.toggle("phone", phone);
    document.querySelectorAll("#modeseg button").forEach(b => b.classList.toggle("on", b.dataset.mode === S.mode));
    const target = phone ? $("#pview") : $("#view"), other = phone ? $("#view") : $("#pview");
    target.innerHTML = V[route](); other.innerHTML = "";
    $("#view").classList.toggle("wide", route === "#map" || route === "#help");
    if (phone) $("#pview").scrollTop = 0; else $(".main").scrollTop = 0;
    document.querySelectorAll(".nav a, .tabbar a, .mobilenav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === route || (route.startsWith("#case") && a.getAttribute("href") === "#cases") || (route === "#request" && a.getAttribute("href") === "#cases")));
    document.querySelectorAll(".inspector .tabs [data-tab]").forEach(b => b.classList.toggle("on", b.dataset.tab === S.tab));
    $("#pane-thread").style.display = S.tab === "thread" ? "" : "none"; $("#pane-demo").style.display = S.tab === "demo" ? "" : "none";
    M.hide(); let ran = false; const draw = () => { if (ran) return; ran = true; renderMaps(target); }; requestAnimationFrame(draw); setTimeout(draw, 60);
    if (route === "#home" && S.entered) markStep(2);
    if (route === "#help") markStep(10);
    if (route === "#about") markStep(12);
    renderThread(); renderDemo(); save();
  }
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-action],[data-mode],[data-tab],#meshtoggle"); if (!t) return;
    if (t.tagName === "A" && !t.dataset.action) return;
    if (t.dataset.action) { const fn = A[t.dataset.action]; if (!fn) return; e.preventDefault(); fn(t.dataset); }
    else if (t.dataset.mode) A.mode(t.dataset);
    else if (t.dataset.tab) A.tab(t.dataset);
    else if (t.id === "meshtoggle") A.mesh();
    render();
  });
  window.addEventListener("hashchange", render);
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 150); });
  chrome(); render();
})(window.RC);
