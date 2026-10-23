/* Still Here — public app. Vanilla JS, hash routing, localStorage state. Design: DESIGN.md (Apple HIG web tokens). */
(function (RC) {
  const KEY = "stillhere-proto-v5";
  const M = RC.Map, fmt = M.fmt, MD = RC.Model, CH = RC.Chart, C = MD.compact, P = MD.pct, I = RC.icon;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = n => n.replace(/\(.*\)/, "").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  // Meera's case is sent the moment she is flagged (audit A-04): nobody has to open the app first.
  const CASE_MSG = "Meera, 3, needs an adult she knows. Both her parents are gone. Flat 402, Sunrise Towers, Andheri E. Can you be there within two hours? Reply 1 GOING · 2 CAN'T · 3 if she is already with an adult. Please don't forward this. Case SH-7731.";
  const meeraStart = () => ({ state: "notified", log: [
    { t: "06:52", text: "Flagged: both adults' phones stopped at 14:32:07, and Meera is registered at Flat 402 (ration card, Little Steps daycare)." },
    { t: "06:52", text: "Sent at once to her four closest (Lata, Rakesh, Farah, Dr. Nair) by WhatsApp or SMS, each in their phone's language. The building was asked only: is an adult with the child in Flat 402? Two replied: no adult seen." }] });
  const threadStart = () => [{ from: "Still Here", text: CASE_MSG, t: "06:52", kind: "out" },
    { text: "Sent to Lata, Rakesh, Farah and Dr. Nair · the building was asked only \"Is an adult with the child in Flat 402?\" · nobody going yet", t: "06:52", kind: "sys" }];
  function defaultState() {
    return { entered: false, mode: "desktop", tab: "thread", mesh: false,
      cases: { meera: meeraStart(), kamla: { state: "flagged", log: [] } },
      checkins: {}, radar: { id: false, live: false, taken: null }, mapLayer: "people", wardTab: "services",
      noticeVotes: {}, joined: {}, requestMode: "active", requested: false, stepsDone: [], reachedBoost: 0, thread: threadStart(), allFlows: false,
      mapArea: "city", mapCity: "delhi", mapState: null, mapSel: null, ti: 0, msgs: false, withMe: [], notRight: {}, called: {} };
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
  const ST = {
    meera: { notified: ["red", "Nobody going yet"], claimed: ["orange", "On the way"], reached: ["orange", "With Lata, unconfirmed"], concern: ["red", "Concern raised"], confirmed: ["green", "With a known adult"], placed: ["green", "With a known adult"] },
    kamla: { flagged: ["red", "Alone"], claimed: ["orange", "You're on the way"], reached: ["green", "With you"], cant: ["orange", "Re-routed"] }
  };
  const caseSt = (id) => { const x = ST[id][S.cases[id].state]; return x ? st(x[0], x[1]) : ""; };
  function statusOf(p) {
    if (p.status === "stopped") return st("red", "Gone", "stopped");
    if (p.status === "unconfirmed") return st("orange", "Unconfirmed", "unconfirmed");
    if (p.status === "quiet") return st("orange", "Not answering", "quiet");
    if (p.status === "nodevice") return st("", "No phone", "nodevice");
    return st("green", "Here · " + esc(p.last), "active");
  }
  const logHtml = (s, title) => s.log.length ? `${sect(title)}<div class="group"><ul class="log">${s.log.map(l => `<li><time>${l.t}</time><span>${esc(l.text)}</span></li>`).join("")}</ul></div>` : "";

  /* ---------- screens ---------- */
  const V = {};

  V["#alert"] = () => `
    ${head("Still Here", "Who's still here. Who's alone. Who's closest.")}
    <div class="group" style="margin-top:26px">
      <div class="alert-row">${tile("siren", "red", true)}<div class="tt"><b>Emergency alert · NDMA · 06:00</b><span style="font-size:15px;color:var(--label);margin-top:4px">At 14:32:07 yesterday, half of all living people vanished. Nobody has vanished since. Stay where you are unless someone needs you.</span></div></div>
      <div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>+91 98••• •4410</b><span>Rohini Sector 7, Delhi, where this phone sleeps at night</span></div>${st("green", "Carrier verified")}</div>
    </div>
    <p class="foot">Also on WhatsApp, by SMS and by missed call, from one verified sender. Every number in this prototype is fictional.</p>
    <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="enter">I'm Still Here</button></div>
    <p class="foot">This lets your carrier show you the people you choose, and shows you only to people who have your number and chose you. Still Here never asks for money, an OTP, an install or a forward. You can check any case with CHILDLINE using its case number.</p>`;

  V["#home"] = () => {
    const w = myWard(), ind = MD.scopes.india(MD.NOW);
    const gone = RC.people.filter(p => p.status === "stopped" || p.status === "unconfirmed"), nophone = RC.people.filter(p => p.status === "nodevice"), here = RC.people.filter(p => p.status === "active" || p.status === "quiet");
    const row = (p, sub, right) => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${sub}</span></div>${right}</div>`;
    const need = id => { const c = RC.cases[id];
      return `<a class="r" href="#case-${id}"><span class="avatar">${initials(c.name)}</span><div class="tt"><b>${c.name}, ${c.age}</b><span>${id === "meera" ? "Your granddaughter · Mumbai, 1,410 km · her circle was messaged at 06:52" : "Your mother · 3.1 km · you're the nearest adult"}</span></div>${caseSt(id)}${chev()}</a>`; };
    const hereRow = p => p.status === "quiet"
      ? row(p, `${esc(p.rel)} · here, but no reply since ${esc(p.since)} · phone at ${esc(p.place)}`, `${statusOf(p)}${S.called[p.id] ? st("", "Called") : `<button class="btn btn-compact" data-action="calldesk" data-id="${p.id}">Call the Desk</button>`}`)
      : row(p, `${esc(p.rel)} · ${p.age} · ${esc(p.city)}`, p.checkedIn ? st("green", "Checked in") : S.checkins[p.id] ? st("", "Pinged") : `${statusOf(p)}<button class="btn btn-compact" data-action="checkin" data-id="${p.id}">Check In</button>`);
    const goneRow = p => row(p, `${esc(p.rel)} · ${esc(p.ev || "")}`, `${statusOf(p)}${S.notRight[p.id] ? st("", "Checking") : `<button class="btn btn-compact btn-plain" data-action="notright" data-id="${p.id}">Not Right?</button>`}`);
    return `
      ${head("Who's still here", "Day 1, 07:10 · Rohini Sector 7, Delhi")}
      ${sect("Needs you")}
      <div class="group">${need("meera")}${need("kamla")}</div>
      ${sect("Your people", `<a href="#cases">Who's counting on you</a>`)}
      <div class="h3" style="margin:0 4px 8px">Here</div>
      <div class="group">${here.map(hereRow).join("")}</div>
      <div class="h3" style="margin:22px 4px 8px">No phone of their own</div>
      <div class="group">${nophone.map(p => `<a class="r" href="#case-${p.id}"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.age} · ${esc(p.city)}</span></div>${statusOf(p)}${chev()}</a>`).join("")}</div>
      <div class="h3" style="margin:22px 4px 8px">Gone, and how it's known</div>
      <div class="group">${gone.map(goneRow).join("")}</div>
      <div class="btn-row"><a class="btn btn-block" href="#request">Ask About Someone</a></div>
      ${disc("How statuses are known", "Gone means a phone was in use or moving at 14:32:07 and never moved again, while its network stayed up: a call, a message being typed, a watch's heart rate, a phone in a moving taxi. A phone that was idle at that second shows unconfirmed. Nobody has to report anything, and anyone wrongly marked clears it with one tap of I'm here on any phone.")}
      ${sect("Across the country")}
      <div class="group" data-help="vanish"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>No new vanishings since the Snap</b><span>Nobody's phone has gone silent since 14:32 yesterday.</span></div><span class="spark" id="flat2"></span></div></div>
      <div class="stats" style="margin-top:14px">
        ${stat("Children reached and safe since the 06:00 alert, India", C(ind.reached), P(ind.share) + " of " + C(ind.A), "reached")}
        ${stat("Reached and safe in your ward", `${fmt(w.reached)} <small>of ${fmt(w.A)}</small>`, P(w.reached / w.A) + " · Rohini", "alone")}
        ${stat("Your people", `${here.length} <small>here</small> · ${gone.length} <small>gone</small>`, `${nophone.length} without a phone`, "stopped")}
      </div>`;
  };

  V["#cases"] = () => `
    ${head("Cases", "Who's alone, and who's counting on you.")}
    <div class="h3" style="margin:26px 4px 8px">Alone, in your people</div>
    <div class="group"><a class="r" href="#case-meera"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3</b><span>Granddaughter · Mumbai, 1,410 km · her circle was messaged at 06:52</span></div>${caseSt("meera")}${chev()}</a></div>
    <div class="h3" style="margin:22px 4px 8px">You're the nearest adult for</div>
    <div class="group">
      <a class="r" href="#case-kamla"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78</b><span>Your mother · 3.1 km · the other adult is gone, no phone</span></div>${caseSt("kamla")}${chev()}</a>
      <div class="r"><span class="avatar">M</span><div class="tt"><b>Meena's children, 7 and 10</b><span>Sector 8 · Meena is home and active</span></div>${st("green", "With Meena")}</div>
      <div class="r"><span class="avatar">AV</span><div class="tt"><b>Anita Verma's father, 81</b><span>Pitampura · Anita is closer; you're the backup</span></div>${st("orange", "Anita is going")}</div>
    </div>
    <div class="btn-row"><a class="btn btn-block" href="#with">Someone Is Already With Me</a></div>
    ${sect("Ask about anyone")}${requestCard()}`;
  function requestCard() {
    const a = S.requestMode === "active";
    const res = !S.requested ? "" : a
      ? `<div class="group" style="margin-top:14px"><div class="r t">${tile("check", "green")}<div class="tt"><b>Shalini Gupta is here</b><span>You have each other's numbers, so you can see her: she used her phone an hour ago. A check-in ping has been sent.</span></div></div></div>`
      : `<div class="group" style="margin-top:14px"><div class="r t">${tile("shield", "gray")}<div class="tt"><b>We can't share Savitri Devi's status with you</b><span>You aren't on her household's records and she hasn't chosen you. We've asked the people who are, and her ward's ASHA worker, to check on her. If they agree, you'll hear back.</span></div></div></div>`;
    return `<div class="seg" style="margin:0 0 12px"><button class="${a ? "on" : ""}" data-action="reqmode" data-v="active">Someone in Your Contacts</button><button class="${!a ? "on" : ""}" data-action="reqmode" data-v="nodevice">Someone Else</button></div>
      <div class="group"><div class="r"><div class="tt"><span>Name</span><b>${a ? "Shalini Gupta" : "Savitri Devi"}</b></div></div><div class="r"><div class="tt"><span>${a ? "Your sister" : "Age and where"}</span><b>${a ? "45 · Jaipur" : "82 · Malviya Nagar, Jaipur"}</b></div></div></div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="request">Ask Still Here</button></div>
      <p class="foot">You see someone's status only if you both have each other's number, or they chose you. Nobody learns that a person is alone, or where they are, unless they're on that person's household records. Every check is logged.</p>${res}`;
  }
  V["#request"] = () => `${head("Ask about someone", "Anyone you're worried about.", ["#home", "Still Here"])}<div style="margin-top:22px">${requestCard()}</div>`;

  V["#case-meera"] = () => {
    const c = RC.cases.meera, s = S.cases.meera, b = c.building;
    const named = c.circle.filter(p => !p.stopped), gone = c.circle.filter(p => p.stopped);
    const rstat = { lata: s.state === "notified" ? "Read 06:55" : "Going", rakesh: S.thread.some(m => m.from === "Rakesh Mehta") ? "Can't" : "Read 07:02", farah: "Delivered", nair: "Delivered" };
    const circleGroup = `<div class="group">${named.map(p => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.calls} calls last month · ${p.dist} km · ${esc(p.via)}</span></div>${st(p.id === "lata" && s.state !== "notified" ? "orange" : rstat[p.id] === "Can't" ? "" : "", rstat[p.id])}</div>`).join("")}
      ${gone.map(p => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b style="color:var(--label2)">${esc(p.name)}</b><span>${esc(p.rel)} · ${p.calls} calls last month · gone at 14:32</span></div>${st("red", "Gone")}</div>`).join("")}
      <div class="r t">${tile("building-2", "gray")}<div class="tt"><b>${esc(b.name)}: one question only</b><span>${esc(b.asked)} were asked "${esc(b.q)}" No name, age or address beyond the flat · ${esc(b.answers)}</span></div></div></div>`;
    let body = "";
    if (s.state === "notified") body = `${sect("Sent to her circle at 06:52", `<span class="fn">closest ties first</span>`)}${circleGroup}
      <div class="group" style="margin-top:14px"><div class="r t">${tile("siren", "gray")}<div class="tt"><b>Goes to 112 and CHILDLINE 1098 at 08:52</b><span>If nobody is going two hours after the message was delivered, her address and age go to the police in Mumbai and the ward's anganwadi worker.</span></div>${st("red", "0 going")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="addsomeone">Add Someone She Knows</button><button class="btn btn-prominent" style="flex:1" data-action="call-lata">${S.called.lata ? "Call Lata Again" : "Call Lata"}</button></div>
      <p class="foot">Sent automatically when Meera was flagged, without waiting for anyone to open the app. Each person got it in their phone's language and can reply with a digit.</p>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">Open Messages to See Replies</button></div>`;
    else if (s.state === "claimed") body = `${sect("Someone is going")}
      <div class="group"><div class="r t">${tile("truck", "orange")}<div class="tt"><b>Lata Pawar is on her way</b><span>She replied 1 GOING at 07:14 and expects to arrive at 07:40. Rakesh, Farah and Dr. Nair can see this.</span></div>${st("orange", "On the way")}</div>
      <div class="r t">${tile("clock", "gray")}<div class="tt"><b>Reopens at 08:40</b><span>An hour after her own arrival time, if she hasn't confirmed, the case goes out to her circle again.</span></div></div></div>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">Open Messages</button></div>`;
    else if (s.state === "reached") body = `${sect("Lata says she has Meera")}
      <div class="group"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>Not confirmed yet</b><span>"HAVE HER. She's fine, hungry." at 07:40, and Lata's phone is at the flat. It becomes custody when you see Meera with her.</span></div>${st("orange", "Unconfirmed")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="meera-wrong">Something's Wrong</button><button class="btn btn-prominent" style="flex:1" data-action="meera-video">Video Call Lata</button></div>
      <p class="foot">Anyone in her circle can raise a concern. It reopens the case and alerts CHILDLINE.</p>`;
    else if (s.state === "concern") body = `${sect("You raised a concern")}
      <div class="group"><div class="r t">${tile("triangle-alert", "red")}<div class="tt"><b>Sent to CHILDLINE 1098 and her circle at 07:46</b><span>Lata has been asked to take Meera to Govt Primary School, Marol, 400 m away, where a police officer and a vetted adult are on duty, and to wait there with her.</span></div>${st("red", "Under review")}</div></div>
      <div class="btn-row"><button class="btn btn-block" data-action="meera-unwrong">It Was a Mistake</button></div>`;
    else if (s.state === "confirmed") body = `${sect("You saw Meera with Lata")}
      <div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>Confirmed on a video call at 07:46</b><span>Meera was at the flat with Lata, fed and calm. Lata is now her temporary custodian.</span></div>${st("green", "With a known adult")}</div></div>
      ${sect("Where should Meera stay until you can come?")}
      <div class="group tiles"><button class="r" data-action="meera-place" data-v="lata">${tile("house", "blue")}<div class="tt"><b>Stay with Lata at the flat</b><span>A known adult at a known address. The default.</span></div>${chev()}</button>
      <button class="r" data-action="meera-place" data-v="care">${tile("building-2", "indigo")}<div class="tt"><b>Govt Primary School, Marol</b><span>400 m away · a police officer and a vetted adult on duty</span></div>${chev()}</button></div>`;
    else if (s.state === "placed") body = `${sect("Meera is with a known adult")}
      <div class="group tiles"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>${s.placed === "care" ? "At Govt Primary School, Marol" : "With Lata Pawar at the flat"}</b><span>${s.placed === "care" ? "A police officer and a vetted adult are on duty; Lata stays until the handover." : "Lata is her temporary custodian until you collect her in week two, or child protection takes over."}</span></div>${st("green", "With a known adult")}</div>
        <div class="r t">${tile("package", "orange")}<div class="tt"><b>Meera's ration goes with her</b><span>5 kg a month, collectable by Lata at any ration shop from today. Looking after her doesn't cost Lata.</span></div></div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>Guardian pass for Lata</b><span>Code 4F2K, valid to Day 14. Police, hospitals and schools can check it with CHILDLINE.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>Welfare checks</b><span>Lata sends a voice note each evening; the ward's anganwadi worker visits on Day 3.</span></div></div></div>
      <p class="foot">This is the first written record of who has her. Lata's GOING and HAVE HER count as the report the Juvenile Justice Act asks for within 24 hours (s.32). Child protection verifies it and takes over, in UNICEF Primero's format.</p>
      <div class="btn-row btn-pair"><button class="btn" data-action="export" data-id="meera">${I("file-down", 17)}Save a Copy Without the Address</button><button class="btn btn-prominent" data-action="sendcp"${S.cases.meera.sent ? " disabled" : ""}>${S.cases.meera.sent ? "Sent to Child Protection" : "Send to Child Protection"}</button></div>`;
    return `${head("Meera", "Case SH-7731 · Flat 402, Sunrise Towers, Andheri East, Mumbai", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3</b><span>You're 1,410 km away</span></div>${caseSt("meera")}</div></div>
      ${disc("How this case was found", esc(c.why) + " Her circle is the people her parents called most who live in Mumbai, ranked by how often they were called and how near they are.")}${body}${logHtml(s, "Case record")}`;
  };

  V["#case-kamla"] = () => {
    const c = RC.cases.kamla, s = S.cases.kamla;
    let body = "";
    if (s.state === "flagged") body = `${sect("You're the nearest adult")}<p class="sub" style="padding:0 4px">She's 3.1 km away. Nobody else who knows her is closer or active.</p>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="kamla-cant">I Can't</button><button class="btn btn-prominent" style="flex:1" data-action="kamla-going">I'm Going</button></div>`;
    else if (s.state === "claimed") body = `${sect("You're on your way")}<div class="group"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>Claimed at 07:20 · there by 07:45</b><span>Shalini and Anita can see it. It reopens at 08:45, an hour after your arrival time, if you don't confirm.</span></div>${st("orange", "On the way")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="kamla-release">I Can't Make It</button><button class="btn btn-prominent" style="flex:1" data-action="kamla-reached">I'm With Her</button></div>
      <p class="foot">If something stops you on the way, say so here. The case goes back to Anita and Shalini at once instead of waiting until 08:45.</p>`;
    else if (s.state === "reached") body = `${sect("You're with her")}<div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>Confirmed at 07:55</b><span>By your tap and your phone at the address. Her health record (diabetes, blood pressure tablets) is open to you at any care point.</span></div>${st("green", "With you")}</div></div>`;
    else if (s.state === "cant") body = `${sect("Sent to the next nearest")}<div class="group"><div class="r t">${tile("users", "orange")}<div class="tt"><b>Anita Verma and Shalini Gupta notified</b><span>Anita is 2.6 km away and active. Kiran, the ward's ASHA worker 0.8 km away, is on standby.</span></div></div></div>
      <div class="btn-row"><button class="btn btn-block" data-action="kamla-going">Actually, I'm Going</button></div>`;
    return `${head("Kamla Devi", "C-7/112, Rohini Sector 7, Delhi", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78</b><span>Your mother</span></div>${caseSt("kamla")}</div></div>
      ${disc("How this case was found", esc(c.why))}${body}${logHtml(s, "Record")}`;
  };

  /* Who's with you (audit section 6: #1, #2, #7). A child already in your care stops being "alone", and their ration follows them to you. */
  V["#with"] = () => {
    const g = RC.withMeSuggest, have = S.withMe.length > 0;
    const card = have ? `<div class="group tiles"><div class="r"><span class="avatar">AM</span><div class="tt"><b>${esc(g.name)}, ${g.age}</b><span>From ${esc(g.from)} · added 07:12</span></div>${st("green", "With you")}</div>
        <div class="r t">${tile("check", "green")}<div class="tt"><b>His alone flag is closed</b><span>His circle was told he's with you. His aunt in Noida replied that she'll come on Day 2.</span></div></div>
        <div class="r t">${tile("package", "orange")}<div class="tt"><b>His ration follows him</b><span>${esc(g.ration)}, now on your ration card from today.</span></div></div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>Guardian pass</b><span>Code ${esc(g.code)}, valid to Day 14. Police, hospitals and schools can check it with CHILDLINE.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>Welfare check</b><span>Kiran, the ward's ASHA worker, visits on Day 3.</span></div></div></div>`
      : `<div class="group"><div class="r t">${tile("baby", "orange")}<div class="tt"><b>Is ${esc(g.name.split(" ")[0])} with you?</b><span>${esc(g.name)}, ${g.age}, from ${esc(g.from)}. ${esc(g.why)}</span></div>${st("red", "Flagged alone")}</div></div>
        <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="addsomeone">Add Someone Else</button><button class="btn btn-prominent" style="flex:1" data-action="withme-add">Yes, He's With Me</button></div>`;
    return `${head("Who's with you", "Children or elders now in your care.")}
      <div style="margin-top:22px">${card}</div>
      <p class="foot">Adding someone stops them being flagged alone, so nobody walks to an empty flat or takes a child from an adult who is already caring for them.</p>
      ${disc("Why this costs you nothing", "Looking after a child shouldn't depend on kindness. Their ration moves to your card (One Nation One Ration Card), the guardian pass protects you at checkpoints and hospital desks, and the case record shows who has them.")}`;
  };

  V["#more"] = () => `${head("More", "Everything else in Still Here.")}
    <div class="group tiles" style="margin-top:22px">
      <a class="r t" href="#with">${tile("hand-helping", "orange")}<div class="tt"><b>Who's with you</b><span>Children or elders now in your care</span></div>${chev()}</a>
      <a class="r t" href="#ward">${tile("building-2", "blue")}<div class="tt"><b>Your ward</b><span>Services, notices, groups and places</span></div>${chev()}</a>
      <a class="r t" href="#radar">${tile("radar", "indigo")}<div class="tt"><b>On duty near you</b><span>For ASHA and anganwadi workers, police and teachers</span></div>${chev()}</a>
      <a class="r t" href="#kit">${tile("download", "teal")}<div class="tt"><b>Offline kit</b><span>Install Still Here and the apps that work without towers</span></div>${chev()}</a>
      <a class="r t" href="#about">${tile("info", "gray")}<div class="tt"><b>About this prototype</b><span>The idea, what's real, the glossary</span></div>${chev()}</a>
      <a class="r t" href="cockpit.html" target="_blank" rel="noopener">${tile("landmark", "ink")}<div class="tt"><b>Government view</b><span>The restricted control room, for the demo</span></div>${chev()}</a>
    </div>`;

  /* map: India → state → city wards, with search */
  const MEERA_LL = [72.8697, 19.1136];
  const cityOf = () => S.mapArea === "city" ? (S.mapCity || "delhi") : null;
  function areaAgg(h) { const c = cityOf(); return c ? MD.scopes.city(c, h) : S.mapState ? MD.scopes.state(S.mapState, h) : MD.scopes.india(h); }
  function areaName() { const c = cityOf(); return c ? MD.CITIES[c].name : S.mapState || "India"; }
  function areaFn() { const c = cityOf(), st = S.mapState; return c ? (h => MD.scopes.city(c, h)) : st ? (h => MD.scopes.state(st, h)) : (h => MD.scopes.india(h)); }
  function selFn() { const s = S.mapSel; if (!s) return null; return s.kind === "state" ? (h => MD.scopes.state(s.key, h)) : (h => MD.scopes.unit(s.key, h)); }
  function selAgg(h) { const f = selFn(); return f ? f(h) : null; }
  function selName() { const s = S.mapSel; if (!s) return ""; if (s.kind === "state") return s.key; const u = MD.byKey[s.key]; return u ? (u.mine ? u.name + ", your ward" : u.name) : s.key; }
  let SEARCH = null, lastResults = [];
  function searchIndex() {
    if (SEARCH) return SEARCH;
    const out = [], cityByDid = {};
    Object.values(MD.CITIES).forEach(c => { if (c.did) cityByDid[c.did] = c.key; out.push({ t: c.name, sub: `City · ${c.wards.length} wards on the map`, rank: 0, ic: "building-2", go: { area: "city", city: c.key } }); });
    Object.keys(RC.GEO.india.states).forEach(n => { if (n !== "Delhi") out.push({ t: n, sub: "State · its districts", rank: 1, ic: "map-pinned", go: { area: "india", state: n } }); });
    RC.GEO.india.districts.forEach(d => { if (d.s === "Delhi") return; const ck = cityByDid[d.id]; out.push({ t: d.n, sub: `District · ${d.s}${ck ? " · ward map" : ""}`, rank: 2, ic: "map-pin", go: ck ? { area: "city", city: ck } : { area: "india", state: d.s, sel: { kind: "district", key: d.id } } }); });
    Object.values(MD.CITIES).forEach(c => c.wards.forEach(u => out.push({ t: u.name, sub: `Ward · ${c.name}${u.mine ? " · your ward" : ""}`, rank: 3, ic: "map-pin", go: { area: "city", city: c.key, sel: { kind: "ward", key: u.key } } })));
    const named = out.filter(x => x.t && x.t !== "null"); named.forEach(x => x.low = String(x.t).toLowerCase());
    return (SEARCH = named);
  }
  function searchFor(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    const re = new RegExp("(^|[\\s(,/-])" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return searchIndex().map(x => ({ x, m: x.low.startsWith(q) ? 0 : re.test(x.low) ? 1 : x.low.includes(q) ? 2 : 9 })).filter(r => r.m < 9)
      .sort((a, b) => a.m - b.m || a.x.rank - b.x.rank || a.x.t.length - b.x.t.length).slice(0, 8).map(r => r.x);
  }
  function resultsHtml(list, q) {
    if (!q) { list = Object.values(MD.CITIES).map(c => searchIndex().find(x => x.rank === 0 && x.go.city === c.key)); }
    lastResults = list;
    if (!list.length) return `<div class="hd">No place called “${esc(q)}”. Try a city, district or ward.</div>`;
    return (q ? "" : `<div class="hd">Cities with ward maps</div>`) + `<div class="group tiles" style="box-shadow:none;background:transparent">${list.map((x, i) => `<div class="r t" data-action="mapgo" data-i="${i}" role="option">${tile(x.ic, x.rank === 0 ? "blue" : "gray")}<div class="tt"><b>${esc(x.t)}</b><span>${esc(x.sub)}</span></div></div>`).join("")}</div>`;
  }
  function mapGo(g) {
    if (g.area === "city") { S.mapArea = "city"; S.mapCity = g.city; S.mapState = null; S.mapSel = g.sel || (g.city === "delhi" ? { kind: "ward", key: WARD.key } : null); }
    else { S.mapArea = "india"; S.mapCity = null; S.mapState = g.state || null; S.mapSel = g.sel || (g.state ? { kind: "state", key: g.state } : null); }
    S.mapLayer = "people"; markStep(8);
  }
  // Compare an area with India at the same hour: that, not an absolute bar, tells you whether it is behind.
  function paceSt(share, ind) { const r = ind ? share / ind : 1; return r >= 1 ? st("green", `${P(share)} reached · ahead of India`) : r >= 0.8 ? st("orange", `${P(share)} reached · about level with India`) : st("red", `${P(share)} reached · behind India`); }
  function crumbs() {
    const c = cityOf(), city = c && MD.CITIES[c], st = city ? city.state : S.mapState;
    const parts = [`<button data-action="crumb" data-v="india">India</button>`];
    if (st && st !== "Delhi") parts.push(c ? `<button data-action="crumb" data-v="state" data-s="${esc(st)}">${esc(st)}</button>` : `<b>${esc(st)}</b>`);
    if (c) parts.push(`<b>${esc(city.name)}</b><span class="fn">· ${city.wards.length} wards</span>`);
    if (!c && !st) parts[0] = `<b>India</b><span class="fn">· tap a state, or search</span>`;
    return `<div class="crumbs">${parts.join(`<span>›</span>`)}</div>`;
  }
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
      const v = areaAgg(h), name = areaName(), sel = selAgg(h);
      body = `<div class="mapsearch" id="mapsearch"><label class="field">${I("search", 17)}<input id="mapq" type="search" autocomplete="off" placeholder="Search a city, district or ward" aria-label="Search a place" aria-controls="mapres"><button type="button" class="clear" data-action="mapclear" aria-label="Clear" hidden>${I("x-circle", 17)}</button></label><div class="results" id="mapres" role="listbox"></div></div>
        ${crumbs()}
        <div class="filters" style="margin-top:0"><div class="seg">${MD.TIMES.map((t, i) => `<button class="${(S.ti || 0) === i ? "on" : ""}" data-action="time" data-v="${i}">${t.short}</button>`).join("")}</div><span class="proj ${isNow() ? "now" : ""}" data-help="projection">${isNow() ? "Now" : "Projection"}</span></div>
        <div class="stats four" style="margin-bottom:14px">${stat(RC.TERMS.alone, C(v.A), name, "alone")}${stat(RC.TERMS.reached, C(v.reached), P(v.share), "reached")}${stat(RC.TERMS.claimed, C(v.claimed), "", "claimed")}${stat(RC.TERMS.unclaimed, C(v.unclaimed), "", "unclaimed")}</div>
        <div class="mapgroup"><div class="mapbox" id="pubmap"></div>${M.legend()}</div>
        ${sel ? `${sect(esc(selName()), sel.nodata ? st("", "No data") : paceSt(sel.share, MD.scopes.india(h).share))}
          <div class="group pad">${sel.nodata ? `<p class="sub" style="margin:0">No phone network here, so there's no data. Shown hatched grey, never as bad news.</p>` : `${CH.stack(sel)}<p class="fn" style="margin:10px 0 0">${C(sel.A)} children with no adult left</p>
            <div class="h3" style="margin:18px 0 4px">Is it getting better?</div><p class="trendline">${esc(CH.trendSentence(selFn(), MD.NOW, selName().replace(", your ward", "")))}</p><div id="selchart"></div>`}</div>` : `<p class="foot">Tap any area on the map for its numbers and whether it is getting better.</p>`}
        ${disc("Why green is hard to earn", "Green needs a reply from the person who went plus their phone at the address. Grey means no connectivity, never red. Nothing smaller than a ward is ever shown publicly.")}`;
    }
    return `${head(layer === "people" ? "Is my area being reached?" : layer === "services" ? "Services coming back" : layer === "notices" ? "Official notices" : "Places to avoid", layer === "people" ? `${esc(TT().label)} · green means children with no adult left have been reached` : "Rohini Sector 7 and around, 07:10")}
      <div class="filters"><div class="seg">${layers}</div></div>${body}`;
  };
  function pubMapOpts() {
    const h = HH(), c = cityOf(), view = c ? "city" : S.mapState ? "state" : "india", cache = {};
    const valOf = k => cache[k] || (cache[k] = view === "india" ? MD.scopes.state(k, h) : MD.scopes.unit(k, h));
    const nm = k => view === "india" ? k : (MD.byKey[k] || {}).name || k;
    const cityDid = {}; Object.values(MD.CITIES).forEach(x => { if (x.did) cityDid[x.did] = x.key; });
    const o = { view, state: S.mapState, city: c, aria: `Map of ${areaName()}`, fill: k => { const v = valOf(k); return v ? MD.color(v) : null; } };
    o.sel = S.mapSel && S.mapSel.kind !== "state" ? S.mapSel.key : null;
    if (view === "city") {
      o.labels = o.sel && MD.byKey[o.sel] ? [{ k: o.sel, t: MD.byKey[o.sel].name, strong: true }] : [];
      if (c === "delhi") { o.mine = WARD.key; o.labels.unshift({ k: WARD.key, t: "You · Rohini", strong: true }); }
      if (c === "mumbai") o.pins = [{ id: "meera", lonlat: MEERA_LL, color: "var(--apple-red)", r: 6, label: "Meera" }];
      const big = MD.CITIES[c].wards.slice().sort((a, b) => b.A - a.A).slice(0, 8); o.labels = o.labels.concat(big.map(u => ({ k: u.key, t: u.name.replace(/^Ward /, "") })));
    } else if (view === "india") o.labels = Object.entries(RC.GEO.india.states).map(([n, st]) => ({ at: st.c, t: st.code, strong: S.mapSel && S.mapSel.key === n }));
    else { const ds = RC.GEO.india.districts.filter(d => d.s === S.mapState); o.labels = ds.filter(d => cityDid[d.id]).map(d => ({ k: d.id, t: d.n, strong: true })).concat(ds.map(d => ({ d, v: valOf(d.id) })).sort((a, b) => (b.v ? b.v.A : 0) - (a.v ? a.v.A : 0)).slice(0, 10).map(x => ({ k: x.d.id, t: x.d.n }))); }
    o.hover = k => {
      if (k === "pin:meera") return `<b>Meera, 3</b><div>Flat 402, Sunrise Towers, Andheri East. Ward K/E.</div><div class="hintl">Your case: open Cases</div>`;
      const v = valOf(k); if (!v) return `<b>${esc(nm(k))}</b>`; if (v.nodata) return `<b>${esc(nm(k))}</b><div>No phone network, so no data.</div>`;
      const hint = view === "india" ? (k === "Delhi" ? "Click to open Delhi's 290 wards" : "Click to see its districts") : view === "state" && cityDid[k] ? "Click to open its ward map" : "Click for detail";
      return `<b>${esc(nm(k))}${MD.byKey[k] && MD.byKey[k].mine ? ", your ward" : ""}</b>${row2("Children with no adult left", C(v.A))}${row2("Reached and safe", P(v.share))}${row2("Someone on the way", C(v.claimed))}${row2("Nobody yet", C(v.unclaimed))}${isNow() ? "" : `<div class="src">Projection for ${esc(TT().label)}</div>`}<div class="hintl">${hint}</div>`; };
    o.click = k => {
      if (view === "india") { if (k === "Delhi") mapGo({ area: "city", city: "delhi" }); else mapGo({ area: "india", state: k }); }
      else if (view === "state" && cityDid[k]) mapGo({ area: "city", city: cityDid[k] });
      else S.mapSel = { kind: view === "city" ? "ward" : "district", key: k };
      render(); };
    o.clickPin = id => { if (id === "meera") go("#case-meera"); };
    return o;
  }

  const FLOW_ICON = { rail: "train-front", road: "truck", air: "plane", sea: "ship" };
  V["#help"] = () => {
    const ind = MD.scopes.india(MD.NOW);
    return `${head("Help is coming", "What's on its way, and what's open near you.")}
      <div class="stats" style="margin-top:24px">${stat("Children reached and safe since the 06:00 alert, India", C(ind.reached), P(ind.share) + " of " + C(ind.A), "reached")}${stat(RC.TERMS.vanish, "0", "since 14:32 yesterday", "vanish")}</div>
      ${sect("On its way")}
      <div class="group tiles flowlist">${RC.flows.map((f, i) => `<div class="r t"><span class="n">${i + 1}</span><div class="tt"><b>${esc(f.what)}</b><span>${I(FLOW_ICON[f.kind] || "package", 13)} ${esc(f.from)} to ${esc(f.to)}</span></div><span class="val">Left ${f.dep}</span></div>`).join("")}</div>
      <p class="foot">Each arrow runs from the city a supply left to the city it is going to, numbered as in the list. A departure appears two hours after it left, with no route and no arrival time, and nothing moving inside a city is shown at all.</p>
      <div class="mapgroup" style="margin-top:14px"><div class="mapbox" id="flowmap" style="height:460px;min-height:0"></div><div class="legend"><span><i style="background:var(--flow);border-radius:50%"></i>Supply on its way, numbered as in the list</span><span><i style="background:var(--apple-indigo);border-radius:50%"></i>Community taking people in</span></div></div>
      ${sect("Restoration in Delhi")}<div class="stats">${RC.restoration.map(r => stat(r.k, `${r.v} <small>${esc(r.unit)}</small>`)).join("")}</div>
      ${sect("Open with someone on duty")}
      <div class="group tiles">${RC.onDuty.map(o => `<div class="r t">${tile(o.icon, o.tile)}<div class="tt"><b>${esc(o.name)}</b><span>${esc(o.what)}${o.queue ? ` · ${esc(o.queue)}` : ""}</span></div><span class="val">${esc(o.dist)}</span></div>`).join("")}</div>
      <p class="foot">On duty means a staff phone is at the counter now: the dealer at a ration shop, a pharmacist at a chemist, a guard at an ATM. Queue sizes come from the phones waiting there.</p>
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
    return `${head("On duty near you", "For ASHA and anganwadi workers, police and teachers on a duty roster.")}
      ${sect("Check you're on a roster")}
      <div class="group tiles"><div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>Phone number</b><span>Checked by your carrier</span></div>${st("green", "Done")}</div>
      <div class="r t">${tile("list-checks", "gray")}<div class="tt"><b>Duty roster</b><span>Matched against the National Health Mission's ASHA list, the police roster or a school's staff list</span></div>${r.id ? st("green", "ASHA · Rohini Sec 7") : `<button class="btn btn-compact" data-action="verify" data-v="id">Check</button>`}</div>
      <div class="r t">${tile("activity", "gray")}<div class="tt"><b>Face check</b><span>Makes sure it's you holding the phone</span></div>${r.live ? st("green", "Done") : `<button class="btn btn-compact" data-action="verify" data-v="live">Start</button>`}</div></div>
      ${disc("Why it's only for people on duty", "A list of children alone is a predator's list, and an ID proves who someone is, not what they intend. So this is only for people who are paid and accountable: the roster before any address, two people for any handover, a care point by default and never a home, every handover recorded, and anyone collecting cases is flagged. Everyone else helps through their own circle.")}
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
        <a class="r t" href="lite-hi.html" lang="hi">${tile("globe", "gray")}<div class="tt"><b>Still Here लाइट, हिन्दी में</b><span>वही छोटा पेज, हिन्दी में।</span></div><span class="val">about 14 KB</span>${chev()}</a>
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
    <div class="stats" style="margin-top:24px">${stat("Children with no adult at home, the morning after", "~240 M")}${stat("Of them under five", "~80 M")}${stat("With someone in their circle who goes on Day 1", "68–98%", "68% if only half of those alive go")}</div>
    ${sect("The idea")}
    <div class="group"><div class="pad"><div class="h3">The one signal</div><p class="sub" style="margin:6px 0 0">The Snap leaves no bodies. Its only mark is that the phones of half of everyone went silent in the same second. Carriers and platforms already hold that. Still Here turns it into who's gone, who's alone, who's closest, who's going, and who has them.</p></div>
    <div class="pad"><div class="h3">The test every feature passed</div><p class="sub" style="margin:6px 0 0">Would a self-interested survivor want it that morning, with data and behaviour that exist that morning, that governments and existing apps won't provide in the first days, without anyone having to be kind?</p></div>
    <div class="pad"><div class="h3">What's real and what's simulated</div><p class="sub" style="margin:6px 0 0">Every person, address and count is made up, and one model drives every number so they add up. Phone numbers are fictional. The maps are real: Natural Earth, india-maps-data, and DataMeet's ward maps for seven cities. Nothing leaves this page.</p></div></div>
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
      child: { name: c.name, age: c.age, age_band: c.ageBand, address: "withheld in this copy; child protection holds it", ward: c.ward }, how_found: c.why,
      caregivers: [{ name: "Aman Sharma", relation: "father", status: "vanished 14:32:07" }, { name: "Priya Sharma", relation: "mother", status: "vanished 14:32:07" }],
      current_custodian: s.placed === "care" ? { type: "care_point", name: RC.cases.meera.carePoint.name } : { type: "known_adult", name: "Lata Pawar", relation: "nanny" },
      next_of_kin: { name: "Sunita Sharma", relation: "grandmother", city: "Delhi", plan: "collect in week two" }, custody_log: s.log, exported_at: "Day 1 08:20" };
  }
  const A = {
    enter() { S.entered = true; markStep(1); go("#home"); },
    checkin(d) { S.checkins[d.id] = true; markStep(2); toast("Check-in ping sent"); },
    "call-lata"() { S.called.lata = true; addLog("meera", "07:11", "Sunita called Lata Pawar (2 min). Lata had read the message and was finding her keys."); toast("Calling Lata Pawar…"); },
    addsomeone() { toast("Add a name and number. They get the case too, if the parents' phones knew them."); },
    "reply-lata-going"() { const c = S.cases.meera; if (c.state !== "notified") return; c.state = "claimed";
      thread("Lata Pawar", "1 GOING. 25 min. I have the spare key.", "07:14", "in");
      thread("sys", "Lata Pawar is going · arriving 07:40 · Rakesh, Farah and Dr. Nair can see this · reopens 08:40 if not confirmed", "07:14", "sys");
      addLog("meera", "07:14", "Lata Pawar (nanny, 1.8 km) replied 1 GOING on WhatsApp, arriving 07:40. The rest of the circle was told."); markStep(4); },
    "reply-rakesh-cant"() { if (S.cases.meera.state !== "notified" && S.cases.meera.state !== "claimed") return; if (S.thread.some(m => m.from === "Rakesh Mehta")) return; thread("Rakesh Mehta", "2 CAN'T. Car wrecked, I'm walking to my mother. Sorry.", "07:12", "in"); },
    "reply-lata-have"() { const c = S.cases.meera; if (c.state !== "claimed") return; c.state = "reached";
      thread("Lata Pawar", "HAVE HER. She's fine, hungry. At the flat.", "07:40", "in");
      thread("sys", "Temporary record: Lata Pawar has Meera since 07:40 · her phone is at the address · waiting for family to confirm", "07:40", "sys");
      addLog("meera", "07:40", "Lata Pawar replied HAVE HER, and her phone is at the address. Temporary record opened; waiting for family to confirm."); markStep(5); },
    "meera-video"() { const c = S.cases.meera; if (c.state !== "reached") return; c.state = "confirmed";
      thread("sys", "Sunita saw Meera with Lata on a video call · temporary custody confirmed", "07:46", "sys");
      addLog("meera", "07:46", "Sunita saw Meera at the flat with Lata on a video call. Lata Pawar is her temporary custodian."); },
    "meera-wrong"() { const c = S.cases.meera; c.state = "concern";
      thread("Still Here", "Lata, please take Meera to Govt Primary School, Marol (400 m) and wait with her there. A police officer and a vetted adult are on duty.", "07:46", "out");
      addLog("meera", "07:46", "Sunita raised a concern about the handover. Sent to CHILDLINE 1098 and the circle; Lata asked to take Meera to the care point."); },
    "meera-unwrong"() { const c = S.cases.meera; c.state = "reached"; thread("sys", "Concern withdrawn by Sunita · Meera can stay at the flat with Lata", "07:49", "sys"); addLog("meera", "07:49", "Sunita withdrew the concern. Waiting for her to confirm on a video call."); },
    "meera-place"(d) { const c = S.cases.meera; if (c.state !== "confirmed") return; c.state = "placed"; c.placed = d.v; S.reachedBoost += 1;
      addLog("meera", "07:50", d.v === "care" ? "Moved to Govt Primary School, Marol (police present). Adult on duty: R. Iyer. Lata stays until the handover." : "Stays with Lata Pawar at Flat 402. Handover to Sunita Sharma planned for week two. Ration moved to Lata; guardian pass 4F2K.");
      thread("Still Here", d.v === "care" ? "Thank you, Lata. Please take Meera to Govt Primary School, Marol (400 m). R. Iyer is on duty. Your guardian pass is 4F2K." : "Thank you, Lata. You're Meera's temporary custodian. Her ration is now collectable by you, and your guardian pass is 4F2K. Sunita will message you here.", "07:50", "out"); markStep(6); },
    sendcp() { if (S.cases.meera.sent) return; S.cases.meera.sent = true; addLog("meera", "07:52", "Record sent to CHILDLINE 1098 and the Mumbai Child Welfare Committee, in Primero's format."); toast("Sent to CHILDLINE and the Mumbai Child Welfare Committee"); },
    notright(d) { S.notRight[d.id] = true; toast("Thanks. The carrier rechecks, and if they're here, one tap of I'm here clears it."); },
    calldesk(d) { S.called[d.id] = true; toast("Calling Safdarjung Hospital's help desk…"); },
    "withme-add"() { if (!S.withMe.length) S.withMe.push({ name: RC.withMeSuggest.name, t: "07:12" }); markStep(9); toast("Aarav's alone flag is closed. His circle was told."); },
    "kamla-going"() { S.cases.kamla.state = "claimed"; addLog("kamla", "07:20", "Sunita is going, there by 07:45. Shalini and Anita were told. Reopens 08:45 if not confirmed."); markStep(7); },
    "kamla-release"() { S.cases.kamla.state = "cant"; addLog("kamla", "07:35", "Sunita released her claim on the way. Sent at once to Anita Verma (2.6 km) and Shalini Gupta; ASHA worker Kiran on standby."); toast("Released. Anita and Shalini were told."); },
    "kamla-cant"() { S.cases.kamla.state = "cant"; addLog("kamla", "07:20", "Sunita can't go. Sent to Anita Verma (2.6 km) and Shalini Gupta; ASHA worker Kiran on standby."); },
    "kamla-reached"() { S.cases.kamla.state = "reached"; S.reachedBoost += 1; addLog("kamla", "07:55", "Sunita is with Kamla Devi, confirmed by her phone at the address. One more reached in Rohini."); markStep(7); },
    maparea(d) { mapGo(d.v === "delhi" ? { area: "city", city: "delhi" } : { area: "india" }); }, maplayer(d) { S.mapLayer = d.v; }, time(d) { S.ti = +d.v; markStep(8); }, mapback() { mapGo({ area: "india" }); },
    crumb(d) { mapGo(d.v === "state" ? { area: "india", state: d.s } : { area: "india" }); }, mapgo(d) { const r = lastResults[+d.i]; if (r) mapGo(r.go); }, mapclear() {},
    msgs() { S.msgs = !S.msgs; }, wardtab(d) { S.wardTab = d.v; markStep(11); },
    vote(d) { const v = S.noticeVotes[d.i] || { c: 0, d: 0 }; v[d.v] += 1; S.noticeVotes[d.i] = v; toast(d.v === "c" ? "Thanks. Your confirmation counts once." : "Reported. It fades faster now."); },
    join(d) { S.joined[d.i] = true; toast("Request sent to the organiser"); }, allflows() { S.allFlows = !S.allFlows; },
    reqmode(d) { S.requestMode = d.v; S.requested = false; }, request() { S.requested = true; },
    verify(d) { S.radar[d.v] = true; markStep(11); }, take(d) { S.radar.taken = d.id; toast("Paired with Dr. Rao, 0.4 km away"); },
    install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; render(); }); } markStep(11); },
    export(d) { download("SH-7731-case-record.json", caseExport(d.id)); toast("A copy without the address was saved"); },
    share() { const url = location.href.split("#")[0], data = { title: "Still Here", text: "Who's still here, who's alone, who's closest.", url };
      if (navigator.share) navigator.share(data).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link copied"), () => toast(url)); else toast(url); },
    reset() { S = defaultState(); save(); go("#alert"); },
    mode(d) { S.mode = d.mode; }, tab(d) { S.tab = d.tab; }, mesh() { S.mesh = !S.mesh; }
  };

  /* ---------- chrome ---------- */
  const NAV = [["sec", "Mine"], ["#home", "Still here", "house"], ["#cases", "Cases", "users"], ["#with", "Who's with you", "hand-helping"], ["sec", "Around me"], ["#map", "Map", "map-pinned"], ["#help", "Help is coming", "truck"], ["#ward", "Ward", "building-2"], ["sec", "Tools"], ["#radar", "On duty", "radar"], ["#kit", "Offline kit", "download"], ["sec", "Prototype"], ["#about", "About", "info"], ["cockpit.html", "Government view", "landmark"]];
  function chrome() {
    $("#nav").innerHTML = NAV.map(n => n[0] === "sec" ? `<div class="sec">${n[1]}</div>` : `<a href="${n[0]}"${n[0].indexOf("#") ? ` target="_blank" rel="noopener"` : ""}>${I(n[2], 17)}<span>${n[1]}</span></a>`).join("");
    const tabs = [["#home", "Here", "house"], ["#cases", "Cases", "users"], ["#map", "Map", "map-pinned"], ["#help", "Help", "truck"]];
    $("#tabbar").innerHTML = tabs.concat([["#more", "More", "layers"]]).map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#mobilenav").innerHTML = tabs.concat([["#kit", "Kit", "download"], ["#more", "More", "layers"]]).map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#topstatus").innerHTML = `${I("shield-check", 17)}<span class="full">No new vanishings since 14:32</span><span class="short">No new vanishings</span><span class="long fn" style="font-weight:400">· checked with your carrier every minute</span>`;
    const sh = document.querySelector('[data-action="share"]'); if (sh) sh.innerHTML = I("share-2", 17);
  }
  const STEPS = ["Tap I'm Still Here on the alert", "See who's gone, and how it's known", "Open Meera's case: her circle was messaged at 06:52", "In Messages, reply as Lata: 1 GOING", "Reply as Lata: HAVE HER", "Video-call Lata, then choose where Meera stays", "Kamla: I'm Going, then I'm With Her", "Map: search a city, then Day 2", "Who's with you: Aarav is with you", "Help is coming: departures and who's on duty", "On duty, Ward and the offline kit", "About, then the government view"];
  function renderThread() {
    const el = $("#thread"); if (!el) return;
    el.classList.toggle("mesh", S.mesh);
    $("#thread-title").textContent = S.mesh ? "Bitchat mesh · Sector 7" : "WhatsApp · Still Here";
    $("#thread-sub").textContent = S.mesh ? "Towers down. Bluetooth hops phone to phone, 30–100 m each. No server, no number, encrypted." : "The same case, seen from Lata's phone. Replies here update the app.";
    $("#meshtoggle").classList.toggle("on", S.mesh); $("#meshtoggle").setAttribute("aria-pressed", S.mesh ? "true" : "false");
    const s = S.cases.meera.state;
    const msgs = S.mesh ? [{ text: "Mesh · 14 phones in range · 3 hops to the school", kind: "sys" }].concat(RC.meshSample.map(m => ({ from: m.from, text: m.text, t: m.t, kind: "in" }))) : [{ text: "Still Here · verified sender · never asks for money, an OTP or a forward", kind: "sys" }].concat(S.thread);
    const empty = !S.mesh && !S.thread.length;
    document.querySelectorAll(".msgbtn .badge").forEach(b => { const n = S.thread.filter(m => m.kind === "in").length; b.textContent = n || ""; b.style.display = n ? "" : "none"; });
    document.body.classList.toggle("msgs", !!S.msgs);
    el.innerHTML = empty ? `<div class="msg sys">${esc(msgs[0].text)}</div><div class="empty-thread">Messages for Meera's case appear here.<br><br>Open <a href="#case-meera">Meera's case</a> to see who was messaged.</div>`
      : msgs.map(m => m.kind === "sys" ? `<div class="msg sys">${esc(m.text)}${m.t ? ` · ${m.t}` : ""}</div>` : `<div class="msg ${m.kind}"><span class="from">${esc(m.from)}</span>${esc(m.text)}<span class="time">${m.t || ""}${S.mesh ? " · hop" : ""}</span></div>`).join("");
    el.scrollTop = el.scrollHeight;
    let b = "";
    if (S.mesh) b = `<span class="fn">A preview. The case continues on WhatsApp when towers return.</span>`;
    else if (s === "notified") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-going">Reply as Lata: 1 GOING</button>${S.thread.some(m => m.from === "Rakesh Mehta") ? "" : `<button class="btn btn-compact" data-action="reply-rakesh-cant">Reply as Rakesh: 2 CAN'T</button>`}`;
    else if (s === "claimed") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-have">Reply as Lata: HAVE HER</button>`;
    else if (s === "reached") b = `<span class="fn">Waiting for Sunita to see Meera on a video call. Open Meera's case.</span>`;
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
    const sc = $("#selchart", root); if (sc && S.mapSel) { const fn = selFn(), pts = MD.series(fn, 2);
      CH.line(sc, { height: 180, xmin: 0, xmax: 50, ymax: 1, yfmt: y => Math.round(y * 100) + "%", ytitle: "Share of children with no adult left", xlabel: h => MD.hourLabel(h), marker: MD.NOW, markerLabel: "Now", split: MD.NOW,
        xticks: [{ x: 6, l: "12:00" }, { x: 14, l: "20:00" }, { x: 26, l: "Day 2" }, { x: 50, l: "Day 3" }],
        series: [{ name: "Reached", color: "var(--st-reached)", area: true, pts: pts.map(p => ({ x: p.h, y: p.share })) }, { name: "Nobody yet", color: "var(--st-nobody)", pts: pts.map(p => ({ x: p.h, y: p.unclaimedShare })) }] }); }
    const am = $("#avoidmap", root); if (am) M.render(am, { view: "delhi", aria: "Places to avoid in Delhi", mine: WARD.key, labels: [{ k: WARD.key, t: "You", strong: true }].concat(RC.avoid.map(z => ({ ll: [z.lonlat[0], z.lonlat[1] + 0.012], t: z.z }))), zones: RC.avoid.map((z, i) => Object.assign({ id: "z" + i }, z)), hover: k => { if (k.indexOf("zone:") === 0) { const z = RC.avoid[+k.slice(6)]; return z ? `<b>${esc(z.z)}</b><div>${esc(z.why)}</div>` : ""; } const u = MD.byKey[k]; return u ? `<b>${esc(u.name)}</b>` : ""; } });
    const fm = $("#flowmap", root); if (fm) { const ac = RC.communities.filter(c => c.accepting), fl = RC.flows.map((f, i) => Object.assign({ n: i + 1 }, f));
      M.render(fm, { view: "india", edges: false, aria: "Supplies on the way", arcs: fl.map(f => ({ from: f.fromLL, to: f.toLL, n: f.n, toLabel: f.to })), pins: ac.map((c, i) => ({ id: "c" + i, lonlat: c.lonlat, color: "var(--apple-indigo)", r: 5 })),
        labels: [{ ll: [77.2, 28.62], t: "Delhi", strong: true }],
        hover: k => { if (k.indexOf("arc:") === 0) { const f = fl[+k.slice(4)]; return f ? `<b>${f.n}. ${esc(f.what)}</b><div>${esc(f.from)} to ${esc(f.to)}, left ${f.dep}</div><div class="src">Shown two hours late. No route, no arrival time.</div>` : ""; }
          if (k.indexOf("pin:c") === 0) { const c = ac[+k.slice(5)]; return c ? `<b>${esc(c.name)}</b><div>${esc(c.note || "")}</div>` : ""; } return `<b>${esc(k)}</b>`; } }); }
  }
  function render() {
    let route = location.hash || "#alert";
    if (!V[route]) route = "#alert";
    if (!S.entered && route !== "#alert") route = "#alert";
    if (S.mapArea === "delhi") { S.mapArea = "city"; S.mapCity = "delhi"; }
    if (route === "#map" && !S.mapSel && cityOf() === "delhi") S.mapSel = { kind: "ward", key: WARD.key };
    const phone = S.mode === "phone" && window.innerWidth >= 760;
    document.body.classList.toggle("phone", phone);
    document.body.classList.toggle("pre", route === "#alert");
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
    if (route === "#case-meera" && S.entered) markStep(3);
    if (route === "#about") markStep(12);
    if (route === "#kit" || route === "#ward" || route === "#radar") markStep(11);
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
  // map search: results update while typing without re-rendering the screen
  let hiIdx = -1;
  function openSearch(q) { const box = $("#mapsearch"); if (!box) return; $("#mapres").innerHTML = resultsHtml(q ? searchFor(q) : [], q.trim()); box.classList.add("open"); box.querySelector(".clear").hidden = !q; hiIdx = -1; }
  function closeSearch() { const b = $("#mapsearch"); if (b) b.classList.remove("open"); }
  document.addEventListener("input", e => { if (e.target.id === "mapq") openSearch(e.target.value); });
  document.addEventListener("focusin", e => { if (e.target.id === "mapq") openSearch(e.target.value); });
  document.addEventListener("keydown", e => {
    if (e.target.id !== "mapq") return; const rows = [...document.querySelectorAll("#mapres [data-action=mapgo]")];
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && rows.length) { e.preventDefault(); hiIdx = (hiIdx + (e.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length; rows.forEach((r, i) => r.classList.toggle("on", i === hiIdx)); rows[hiIdx].scrollIntoView({ block: "nearest" }); }
    else if (e.key === "Enter") { e.preventDefault(); const r = rows[hiIdx >= 0 ? hiIdx : 0]; if (r) r.click(); }
    else if (e.key === "Escape") { closeSearch(); e.target.blur(); } });
  document.addEventListener("pointerdown", e => { if (!e.target.closest("#mapsearch")) closeSearch(); });
  window.addEventListener("hashchange", render);
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(render, 150); });
  chrome(); render();
})(window.RC);
