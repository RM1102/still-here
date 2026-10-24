/* Still Here — public app. Vanilla JS, hash routing, localStorage state. Design: DESIGN.md (Apple HIG web tokens). */
(function (RC) {
  const KEY = "stillhere-proto-v6";
  const M = RC.Map, fmt = M.fmt, MD = RC.Model, CH = RC.Chart, C = MD.compact, P = MD.pct, I = RC.icon;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = n => n.replace(/\(.*\)/, "").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  // Meera's case goes out the moment she is found alone: nobody has to open the app first.
  const CASE_MSG = "Meera, 3, needs an adult she knows. Both her parents have vanished. Flat 402, Sunrise Towers, Andheri East. Can you get there within two hours? Reply 1 if you're going, 2 if you can't, 3 if she's already with an adult. Please don't forward this. Case SH-7731.";
  const CASE_MR = "मीरा (3) हिला ओळखीच्या मोठ्या व्यक्तीची गरज आहे. तिचे आई-वडील दोघेही नाहीसे झाले. फ्लॅट 402, सनराइज टॉवर्स, अंधेरी पूर्व. दोन तासांत पोहोचू शकाल का? उत्तर द्या: 1 = येत आहे · 2 = जमणार नाही · 3 = ती आधीच कोणाबरोबर आहे. हा मेसेज पुढे पाठवू नका. केस SH-7731.";
  const meeraStart = () => ({ state: "notified", log: [
    { t: "06:52", text: "We found Meera alone: both her parents' phones stopped at 2:32 pm yesterday, and she's registered at this flat." },
    { t: "06:52", text: "We messaged the four people her parents called most: Lata, Rakesh, Farah and Dr. Nair. We asked her building only whether an adult is with the child in flat 402. Two neighbours said no." }] });
  const threadStart = () => [{ from: "Still Here", text: CASE_MR, gloss: CASE_MSG, t: "06:52", kind: "out" },
    { text: "Also sent to Rakesh, Farah and Dr. Nair. Her building was asked only whether an adult is with the child in flat 402.", t: "06:52", kind: "sys" }];
  function defaultState() {
    return { entered: false, welcomed: false, told: false, mode: "desktop", tab: "thread", mesh: false,
      cases: { meera: meeraStart(), kamla: { state: "flagged", log: [] } },
      checkins: {}, radar: { id: false, live: false, taken: null }, mapLayer: "people", wardTab: "services",
      noticeVotes: {}, joined: {}, requestMode: "active", requested: false, reported: false, stepsDone: [], reachedBoost: 0, thread: threadStart(), allFlows: false,
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
  const clock = t => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };

  /* ---------- primitives ---------- */
  const head = (title, lede, back) => `${back ? `<div style="margin-bottom:10px"><a href="${back[0]}" class="fn" style="color:var(--accent);font-size:15px">‹ ${esc(back[1])}</a></div>` : ""}<h1 class="title">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ""}`;
  const sect = (t, right) => `<div class="secthead"><h2 class="h2">${t}</h2>${right || ""}</div>`;
  const stat = (l, v, d, help) => `<div class="stat"${help ? ` data-help="${help}"` : ""}>${help ? `<span class="info">${I("info", 15)}</span>` : ""}<div class="l">${l}</div><div class="v">${v}</div>${d ? `<div class="d">${d}</div>` : ""}</div>`;
  const tile = (icon, color, lg) => `<span class="tile ${color}${lg ? " lg" : ""}">${I(icon, lg ? 22 : 16)}</span>`;
  const st = (cls, word, help) => `<span class="st ${cls}"${help ? ` data-help="${help}"` : ""}>${word}</span>`;
  const disc = (label, body) => `<details class="disc"><summary>${I("circle-help", 15)}${label}</summary><div class="body">${body}</div></details>`;
  const chev = () => `<span class="chev">${I("chevron-right", 16)}</span>`;
  const intro = t => `<p class="sub" style="margin:8px 4px 10px">${t}</p>`;
  // Status words say the whole thing; the dot only repeats them: green = safe or here, orange = in progress or not sure, red = needs someone.
  const ST = {
    meera: { notified: ["red", "Nobody going yet"], claimed: ["orange", "Lata is on her way"], reached: ["orange", "With Lata, not confirmed"], concern: ["red", "Being checked"], confirmed: ["green", "Safe with Lata"], placed: ["green", "Safe with Lata"] },
    kamla: { flagged: ["red", "Needs someone"], claimed: ["orange", "You're on your way"], reached: ["green", "Safe with you"], cant: ["orange", "Asked Anita instead"] }
  };
  const caseSt = (id) => { const x = ST[id][S.cases[id].state]; if (id === "meera" && S.cases.meera.state === "placed" && S.cases.meera.placed === "care") return st("green", "Safe at a school nearby"); return x ? st(x[0], x[1]) : ""; };
  function statusOf(p) {
    if (p.status === "stopped") return st("red", "Gone", "stopped");
    if (p.status === "unconfirmed") return st("orange", "Not sure", "unconfirmed");
    if (p.status === "quiet") return st("orange", "Here, not replying", "quiet");
    if (p.status === "nodevice") return st("", "No phone", "nodevice");
    return st("green", "Here", "active");
  }
  const logHtml = (s, title) => s.log.length ? `${sect(title)}<div class="group"><ul class="log">${s.log.map(l => `<li><time>${clock(l.t)}</time><span>${esc(l.text)}</span></li>`).join("")}</ul></div>` : "";

  /* ---------- screens ---------- */
  const V = {};

  V["#alert"] = () => `
    ${head("Still Here", "Find out who in your life is safe, who is alone, and who can get to them.")}
    <div class="group" style="margin-top:26px">
      <div class="alert-row">${tile("siren", "red", true)}<div class="tt"><b>Emergency alert from the Government of India</b><span>National Disaster Management Authority (NDMA) · 6:00 am today</span><span style="font-size:15px;color:var(--label);margin-top:8px">At 2:32 pm yesterday, half of all people vanished in the same second, all over the world. Nobody has vanished since. If you are safe, stay where you are unless someone needs you. Open Still Here to see who in your life is safe.</span></div></div>
      <div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>You: Sunita Sharma, +91 98••• •4410</b><span>Your phone has been used since 2:32 pm, so you're shown as here.</span></div>${st("green", "Here")}</div>
    </div>
    <p class="foot">Still Here runs under an emergency order with India's mobile networks (Jio, Airtel, Vi and BSNL). They already know which phones went silent at 2:32 pm, and who calls whom. Still Here uses that only to find people who are alone and the people who know them.</p>
    <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="enter">I'm Safe. Show Me My People</button></div>
    <div class="btn-row" style="margin-top:8px"><a class="btn btn-block" href="#onmyown">I'm On My Own and Need Someone</a></div>
    <p class="foot">Tapping this tells your family you're safe. Only people who have your number and chose you can see you. Still Here never asks for money, an OTP, or for a message to be forwarded. In this prototype, every person, place and personal number is made up.</p>`;

  V["#welcome"] = () => `
    ${head("How Still Here works", "Three things, in this order.")}
    <div class="group tiles" style="margin-top:22px">
      <div class="r t">${tile("users", "blue")}<div class="tt"><b>1. It shows you your people</b><span>Everyone in your contacts and the numbers you call most. For each, it shows whether their phone is still being used. If it is, they're here.</span></div></div>
      <div class="r t">${tile("siren", "red")}<div class="tt"><b>2. It finds anyone left alone</b><span>A child or an elderly person whose every adult at home vanished. Their parents' phones show who knows them best.</span></div></div>
      <div class="r t">${tile("truck", "green")}<div class="tt"><b>3. It gets someone they know to them</b><span>It messages the people who know them, nearest and closest first, and keeps going until one of them says they're going and gets there.</span></div></div>
      <div class="r t">${tile("shield", "gray")}<div class="tt"><b>And it keeps everyone else out</b><span>Nobody can look up a stranger, or see where children on their own are. You see only your own people.</span></div></div>
    </div>
    ${sect("Let people know you're safe")}
    <div class="group"><div class="r t">${tile("message-circle", "green")}<div class="tt"><b>Tell everyone who has your number</b><span>214 people have called or messaged you this year. One tap tells them all that you're safe, so they stop worrying and nobody is sent to check on you.</span></div>${S.told ? st("green", "Told") : `<button class="btn btn-compact" data-action="tellall">Tell Them</button>`}</div></div>
    <p class="foot">People you've blocked are never told.</p>
    <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="welcomed">Show Me My People</button></div>`;

  /* On your own (24 Oct): a child, or an adult who can't manage alone, asks for someone they know. Same routing as Meera's case. */
  V["#onmyown"] = () => `${head("If you're on your own", "For a child, or anyone who can't manage alone, whose adults at home have vanished.", S.entered ? ["#more", "More"] : ["#alert", "Back"])}
    ${S.ownSent ? `<div class="group tiles" style="margin-top:22px">
        <div class="r t">${tile("users", "orange")}<div class="tt"><b>We're getting someone you know</b><span>We've messaged the four people your family calls most, and Kiran, the health worker for your area. This screen shows who is coming.</span></div>${st("orange", "Asking now")}</div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>Your code is 6H2P</b><span>Whoever comes will say this code. Don't open the door to anyone who can't, even someone you know a little.</span></div></div>
        <div class="r t">${tile("house", "gray")}<div class="tt"><b>Stay where you are</b><span>Keep the door locked, drink water, and keep this phone charged. If you're hurt or in danger, call 112.</span></div></div></div>
      <div class="btn-row"><a class="btn btn-block" href="${S.entered ? "#kit" : "#alert"}">${S.entered ? "First Aid and Offline Pages" : "Back to the Alert"}</a></div>`
    : `<div class="group tiles" style="margin-top:22px">
        <div class="r t">${tile("users", "blue")}<div class="tt"><b>We message people your family knows</b><span>The people your parents or carers called most. The first one who says they can come goes to you, and we send them your code.</span></div></div>
        <div class="r t">${tile("shield", "gray")}<div class="tt"><b>Only they get your address</b><span>Nobody else can see that you're alone, or where you are.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>If nobody can come within two hours</b><span>Kiran, the community health worker for your area, comes with a police officer.</span></div></div></div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="ownsend">Send for Someone I Know</button></div>
      <p class="foot">You don't need to type anything: we already know which phones in your home went silent at 2:32 pm yesterday. In this demo, this is what a child on their own would see. For a child too young to read, see <a href="#child">the child alert</a>.</p>`}`;

  /* Is this true? (24 Oct night): checked against official sources and people on the spot; never a guess (STRATEGY §6) */
  const CLAIMS = ["Kalpakkam nuclear plant has exploded", "Another vanishing at 3 pm today", "Tap water in Delhi is poisoned", "Free food at Red Fort at noon"];
  function factcheck(q) { const s = q.toLowerCase(); return RC.factcheck.find(f => f.keys.some(k => s.indexOf(k) >= 0)) || { verdict: "Not confirmed", text: "No official source and nobody on the spot has said this. Don't act on it, and please don't forward it.", src: "No official notice found" }; }
  const VERD = { "Not true": ["x-circle", "red"], "Confirmed": ["check", "green"], "Not confirmed": ["circle-help", "gray"] };
  V["#check"] = () => { const q = S.claim || "", r = q ? factcheck(q) : null;
    return `${head("Is this true?", "Type or paste a message you were sent. Still Here checks it against official sources and people on the spot.")}
      <div class="mapsearch" style="margin-top:22px"><label class="field">${I("search", 17)}<input id="claimq" type="search" autocomplete="off" placeholder="Type or paste a message" value="${esc(q)}" aria-label="Message to check"></label></div>
      <div class="chips">${CLAIMS.map(x => `<button class="btn btn-compact" data-action="claim" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="checkclaim">Check It</button></div>
      ${r ? `<div class="group" style="margin-top:14px"><div class="r t">${tile(VERD[r.verdict][0], VERD[r.verdict][1])}<div class="tt"><b>${esc(r.verdict)}</b><span>${esc(r.text)}</span></div>${st(VERD[r.verdict][1] === "gray" ? "" : VERD[r.verdict][1], r.verdict)}</div><div class="pad fn">Source: ${esc(r.src)}</div></div>` : ""}
      ${disc("How it decides", "It answers only from official notices, the people who run the place named, and confirmations from phones at that spot. If none of them has said it, the answer is Not confirmed, never a guess. The same check works in the WhatsApp bot.")}`; };

  /* The WhatsApp bot (24 Oct night): the same help as a chat, for people with WhatsApp but not this app (STRATEGY §5) */
  const BOTMENU = [["1", "1 Who's still here"], ["2", "2 Help near me"], ["3", "3 Health near me"], ["4", "4 Is this true?"], ["5", "5 Someone is alone"]];
  const botStart = () => [{ t: "Hi. I'm the Still Here bot, from the government's emergency service. I never ask for money, an OTP or a forward.\nReply with a number:\n1  Who's still here\n2  Help near me\n3  Health near me\n4  Is this true?\n5  Someone is alone" }];
  function botReply(k) {
    const m = S.cases.meera.state, meera = m === "notified" ? "Meera (3) is alone in Mumbai. We've messaged the people who know her; nobody is going yet." : m === "claimed" ? "Meera (3): Lata, her nanny, is on her way." : "Meera (3) is safe with Lata.";
    return { "1": "Your people: 6 here, 4 gone, 1 not sure, 2 without a phone.\n" + meera + "\nKamla (78) needs someone: you're the nearest person she knows.",
      "2": "Near Rohini Sector 7:\nWater: Govt school, Sector 7 (0.7 km), police there.\nRations: shop 112 has about 140 waiting; shop 118 (0.6 km) has 30.\nCharging: Gurudwara, Sector 7 (0.9 km).",
      "3": "Shortest wait first:\nMohalla Clinic, Sector 7 (0.6 km): about 40 min.\nJaipur Golden Hospital (3 km): about 1 h.\nDr. BSA emergency (2.4 km): about 2 h.\nInsulin: Apollo Pharmacy, Sector 8 (low stock).\nIf it's too much: Tele-MANAS 14416.",
      "4": "Forward me the message and I'll check it against official sources.\n\nYou forwarded: \"Kalpakkam nuclear plant has exploded\"\nNot true. The reactors shut down safely at 03:10 and radiation monitors read normal (Nuclear Power Corporation, 07:00).",
      "5": "Tell me where and what you saw. It goes only to the area's health worker, never to the public.\n\nYou wrote: \"Boy about 5, crying on the steps of C-7 block\"\nKiran, the health worker, is on her way with a constable." }[k]; }
  V["#bot"] = () => { const msgs = S.bot || botStart();
    return `${head("Still Here on WhatsApp", "The same help as a chat, for anyone who has WhatsApp but not this app. Tap a reply to try it.")}
      <div class="thread botthread" style="margin-top:18px">${msgs.map(m => `<div class="msg ${m.me ? "out" : "in"}">${m.me ? "" : `<span class="from">Still Here bot</span>`}<span class="botline">${esc(m.t)}</span></div>`).join("")}</div>
      <div class="reply-row">${BOTMENU.map(([k, l]) => `<button class="btn btn-compact" data-action="bot" data-v="${k}">${esc(l)}</button>`).join("")}</div>
      ${disc("Where its answers come from", "The same sources as the app: your people's status, places that update themselves, staff phones at hospitals and shops, and official notices. In the real product it runs on WhatsApp's business platform, and also by SMS for basic phones.")}`; };

  /* The child alert (24 Oct night): for a young child holding a parent's phone (STRATEGY §8) */
  const SAY = { en: "Are you okay? Is a grown-up with you? Press the green face if a grown-up is with you. Press the red face if you are alone.", hi: "क्या तुम ठीक हो? क्या कोई बड़ा तुम्हारे साथ है? अगर कोई बड़ा साथ है तो हरा चेहरा दबाओ। अगर तुम अकेले हो तो लाल चेहरा दबाओ।" };
  V["#child"] = () => { const a = S.childAns;
    return `${head("The child alert", "What a young child sees when they pick up the phone of a parent who vanished. The phone speaks, in the language it was set to.", ["#more", "More"])}
      <div class="kidalert">
        <div class="ka-top">${I("siren", 18)}<span>Emergency alert · Government of India</span></div>
        ${!a ? `<p class="ka-q">Are you okay?<br>Is a grown-up with you?</p><p class="ka-hi" lang="hi">क्या तुम ठीक हो? क्या कोई बड़ा तुम्हारे साथ है?</p>
          <div class="ka-btns"><button class="ka-b ok" data-action="kid" data-v="ok"><span>🙂</span>A grown-up is with me</button><button class="ka-b no" data-action="kid" data-v="alone"><span>😟</span>I'm alone</button></div>
          <button class="btn btn-compact" data-action="kidsay">${I("message-circle", 15)}Say It Again</button>`
        : a === "alone" ? `<p class="ka-q">Help is coming.</p><p class="ka-s">Stay inside and keep the door shut. A grown-up who knows you will come. They will say this word:</p><p class="ka-code">🥭 MANGO</p><p class="ka-s">Open the door only for the person who says it.</p>`
        : `<p class="ka-q">Good. 🙂</p><p class="ka-s">Ask the grown-up to tap I'm Safe on their own phone.</p>`}
      </div>
      ${a ? `<div class="btn-row"><button class="btn btn-block" data-action="kid" data-v="">Show the Alert Again</button></div>` : ""}
      ${disc("How it works", "It is sent only by the verified government sender, to a phone whose owner fell still at 2:32 pm and which someone has started using again: often a child. The phone reads it aloud. A red tap, or no tap within two minutes while no adult's phone is at home, starts a case for that child, sent to the people the parents called most. The person who goes is told the code word, so the child knows who to open the door for. No photo is taken.")}`; };

  V["#home"] = () => {
    const w = myWard(), ind = MD.scopes.india(MD.NOW);
    const gone = RC.people.filter(p => p.status === "stopped" || p.status === "unconfirmed"), nophone = RC.people.filter(p => p.status === "nodevice"), here = RC.people.filter(p => p.status === "active" || p.status === "quiet");
    const row = (p, sub, right) => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${sub}</span></div>${right}</div>`;
    const need = id => { const c = RC.cases[id];
      return `<a class="r" href="#case-${id}"><span class="avatar">${initials(c.name)}</span><div class="tt"><b>${id === "meera" ? "Meera, 3 · your granddaughter" : "Kamla Devi, 78 · your mother"}</b><span>${id === "meera" ? "Alone in Mumbai. Both her parents vanished. We've messaged the people who know her." : "Alone at home, 3.1 km away. You're the nearest person she knows."}</span></div>${caseSt(id)}${chev()}</a>`; };
    const hereRow = p => p.status === "quiet"
      ? row(p, `${esc(p.rel)} · here, but hasn't replied since ${esc(p.since)}. His phone is at ${esc(p.place)}.`, `${statusOf(p)}${S.called[p.id] ? st("", "Called") : `<button class="btn btn-compact" data-action="calldesk" data-id="${p.id}">Call the Hospital</button>`}`)
      : row(p, `${esc(p.rel)} · ${esc(p.city)} · used their phone ${esc(p.last)}`, p.checkedIn ? st("green", "Said they're safe") : S.checkins[p.id] ? st("", "Asked") : `${statusOf(p)}<button class="btn btn-compact" data-action="checkin" data-id="${p.id}">Ask If They're OK</button>`);
    const goneRow = p => row(p, `${esc(p.rel)} · ${esc(p.ev || "")}`, `${statusOf(p)}${S.notRight[p.id] ? st("", "We're checking") : `<button class="btn btn-compact btn-plain" data-action="notright" data-id="${p.id}">${p.status === "unconfirmed" ? "I've Heard From Them" : "This Is Wrong"}</button>`}`);
    return `
      ${head("Your people", "Day 1 · 7:10 am · Rohini Sector 7, Delhi")}
      ${intro("Everyone you call or message, and your family's phones. Green means their phone is still being used, so they're here.")}
      ${sect("Needs you now")}${intro("Both have no adult left with them. You see their cases because you're family.")}
      <div class="group">${need("meera")}${need("kamla")}</div>
      ${sect("Here")}
      <div class="group">${here.map(hereRow).join("")}</div>
      ${sect("No phone of their own")}${intro("We check on them through the people they live with.")}
      <div class="group">${nophone.map(p => `<a class="r" href="#case-${p.id}"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.age} · ${esc(p.city)}</span></div>${p.id === "meera" || p.id === "kamla" ? caseSt(p.id) : statusOf(p)}${chev()}</a>`).join("")}</div>
      ${sect("Gone")}${intro("Their phone was being used at 2:32 pm yesterday, fell still in that same second, and hasn't been touched since. If you think one of these is wrong, say so.")}
      <div class="group">${gone.map(goneRow).join("")}</div>
      ${disc("How Still Here knows who's gone", "At 2:32 pm yesterday, half of all phones that were in someone's hand, on a call, being typed on or moving in a car fell still in the same second, and none of them has been touched since. That is the only trace the vanishing left. Mobile networks see that a phone stopped moving and has made no call or message; Google and Apple see that it was never unlocked again. If a phone was lying idle at that moment, we can't be sure, so it says Not sure. Anyone wrongly shown as gone can tap I'm here on any phone, and it's corrected for everyone.")}
      <div class="btn-row btn-pair"><a class="btn" href="#find">${I("search", 16)}Find Someone</a><a class="btn" href="#report">${I("siren", 16)}Report Someone Alone</a></div>
      ${sect("Across India")}
      <div class="group" data-help="vanish"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>Nobody else has vanished since 2:32 pm yesterday</b><span>Every phone that was working this morning is still working. That's how we know it happened only once.</span></div><span class="spark" id="flat2"></span></div></div>
      <div class="stats" style="margin-top:14px">
        ${stat("Children found alone who are now safe, India", C(ind.reached), `${P(ind.share)} of about ${C(ind.A)} expected`, "reached")}
        ${stat("Safe so far in your ward, Rohini", `${fmt(w.reached)} <small>of ${fmt(w.A)}</small>`, P(w.reached / w.A) + " of children found alone here", "alone")}
        ${stat("Your people", `${here.length} <small>here</small> · ${gone.filter(p => p.status === "stopped").length} <small>gone</small>`, `${gone.filter(p => p.status === "unconfirmed").length} not sure · ${nophone.length} without a phone`, "stopped")}
      </div>`;
  };

  V["#cases"] = () => `
    ${head("Cases", "Everyone connected to you who is alone, and what is happening for each of them.")}
    ${sect("In your family")}
    <div class="group"><a class="r" href="#case-meera"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3 · your granddaughter</b><span>Alone in Mumbai, 1,410 km away. We've messaged the people who know her.</span></div>${caseSt("meera")}${chev()}</a></div>
    ${sect("People you're nearest to")}${intro("When you're the closest person someone knows, you're asked first.")}
    <div class="group">
      <a class="r" href="#case-kamla"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78 · your mother</b><span>Alone at home, 3.1 km away. She has no phone.</span></div>${caseSt("kamla")}${chev()}</a>
      <div class="r"><span class="avatar">M</span><div class="tt"><b>Meena's children, 7 and 10</b><span>Sector 8 · their mother Meena is at home with them</span></div>${st("green", "Safe with Meena")}</div>
      <div class="r"><span class="avatar">AV</span><div class="tt"><b>Anita Verma's father, 81</b><span>Pitampura · Anita lives closer and is going. You'd be asked only if she can't.</span></div>${st("orange", "Anita is going")}</div>
    </div>
    ${sect("Someone else")}
    <div class="group tiles">
      <a class="r t" href="#with">${tile("hand-helping", "orange")}<div class="tt"><b>A child or elder is already with me</b><span>So nobody is sent to an empty home, or takes them from you</span></div>${chev()}</a>
      <a class="r t" href="#report">${tile("siren", "red")}<div class="tt"><b>Report someone alone</b><span>A neighbour's child, or an old man downstairs, who isn't your family</span></div>${chev()}</a>
      <a class="r t" href="#find">${tile("search", "blue")}<div class="tt"><b>Find someone</b><span>See whether someone you know is safe</span></div>${chev()}</a>
    </div>`;

  /* Find someone (Rahul, 24 Oct): look anyone up, inside the rule that you only see people who know you back. */
  V["#find"] = () => {
    const a = S.requestMode === "active";
    const res = !S.requested ? "" : a
      ? `<div class="group" style="margin-top:14px"><div class="r t">${tile("check", "green")}<div class="tt"><b>Shalini Gupta is safe</b><span>She's your sister and has your number, so you can see her: she used her phone an hour ago, in Jaipur. We've asked her to message you.</span></div>${st("green", "Here")}</div></div>`
      : `<div class="group" style="margin-top:14px"><div class="r t">${tile("shield", "gray")}<div class="tt"><b>We can't tell you about Savitri Devi</b><span>She isn't in your contacts and hasn't chosen you, so her details stay private. We've passed on that you're looking for her, and asked the community health worker (ASHA) in her area to check on her. If she wants to, she'll reply to you.</span></div>${st("", "Message passed on")}</div></div>`;
    return `${head("Find someone", "See whether someone you know is safe.", ["#home", "Your people"])}
      <div class="mapsearch" style="margin-top:22px"><label class="field">${I("search", 17)}<input type="search" value="${a ? "Shalini Gupta" : "Savitri Devi, Malviya Nagar, Jaipur"}" aria-label="Name or phone number" readonly></label></div>
      <div class="seg" style="margin:0 0 12px"><button class="${a ? "on" : ""}" data-action="reqmode" data-v="active">Someone Who Has Your Number</button><button class="${!a ? "on" : ""}" data-action="reqmode" data-v="nodevice">Someone Who Doesn't</button></div>
      <p class="foot">Two examples are filled in: your sister Shalini, and Savitri Devi, an old friend of your mother's who doesn't have your number.</p>
      <div class="btn-row"><button class="btn btn-prominent btn-block" data-action="request">Find Them</button></div>${res}
      <p class="foot">Looking for a doctor rather than a person? <a href="#help">See doctors and nurses on duty near you</a>.</p>
      ${disc("Why you can't see everyone", "A list of who is alone, and where, would help thieves and people who prey on children. So you only ever see people who have your number too, or who chose you. Anyone else gets your message, and decides for themselves.")}`;
  };

  /* Report someone alone (Rahul, 24 Oct): a child or elder who isn't your family. It goes to people on duty, never to the public. */
  V["#report"] = () => `${head("Report someone alone", "A child, or an elderly person, you think has nobody with them.", ["#cases", "Cases"])}
    <div class="group" style="margin-top:22px">
      <div class="r"><div class="tt"><span>Who</span><b>A boy, about 5</b></div></div>
      <div class="r"><div class="tt"><span>Where</span><b>Steps of C-7 block, Rohini Sector 7</b></div></div>
      <div class="r"><div class="tt"><span>What you saw</span><b>Crying on the steps since early morning. No adult has come out.</b></div></div>
    </div>
    <p class="foot">The example is filled in for you. Your name and number go only to the health worker who visits.</p>
    ${S.reported ? `<div class="group" style="margin-top:14px"><div class="r t">${tile("truck", "orange")}<div class="tt"><b>Kiran is on her way</b><span>Kiran, the community health worker (ASHA) for this area, will be there in about 15 minutes with a police constable. We're also checking whose phones were registered at that block, so the boy's family can be found.</span></div>${st("orange", "Being checked")}</div></div>`
      : `<div class="btn-row"><button class="btn btn-prominent btn-block" data-action="report">Send to the Area's Health Worker</button></div>`}
    ${disc("Who sees your report", "Only people on duty: the area's health worker, and the police if she asks. It never goes to the public or to neighbours, and you aren't shown who lives there. That way a report can't be used to find children who are alone.")}`;

  V["#case-meera"] = () => {
    const c = RC.cases.meera, s = S.cases.meera, b = c.building;
    const named = c.circle.filter(p => !p.stopped), gone = c.circle.filter(p => p.stopped);
    const rstat = { lata: s.state === "notified" ? ["", "Read it"] : ["orange", "Going"], rakesh: S.rakeshCant ? ["", "Can't go"] : ["", "Read it"], farah: ["", "Delivered"], nair: ["", "Delivered"] };
    const circleGroup = `<div class="group">${named.map(p => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b>${esc(p.name)}</b><span>${esc(p.rel)} · ${p.dist} km away · her parents called ${p.calls} times last month</span></div>${st(rstat[p.id][0], rstat[p.id][1])}</div>`).join("")}
      ${gone.map(p => `<div class="r"><span class="avatar">${initials(p.name)}</span><div class="tt"><b style="color:var(--label2)">${esc(p.name)}</b><span>${esc(p.rel)} · also vanished at 2:32 pm</span></div>${st("red", "Gone")}</div>`).join("")}
      <div class="r t">${tile("building-2", "gray")}<div class="tt"><b>Her building, ${esc(b.name)}</b><span>We asked the watchman and the residents' group only: "${esc(b.q)}" Two said no. We didn't tell them her name, her age, or that she's alone.</span></div></div></div>`;
    let body = "";
    if (s.state === "notified") body = `${sect("We messaged the people who know her", `<span class="fn">at 6:52 am</span>`)}${intro("The four people her parents called most who live in Mumbai. Each got the message in their own language and can reply with one digit.")}${circleGroup}
      <div class="group" style="margin-top:14px"><div class="r t">${tile("siren", "gray")}<div class="tt"><b>If nobody is going by 8:52 am</b><span>The police and the child helpline (112 and 1098) get her address, and so does the area's government childcare worker (anganwadi).</span></div>${st("red", "Nobody going yet")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="addsomeone">Add Someone She Knows</button><button class="btn btn-prominent" style="flex:1" data-action="call-lata">${S.called.lata ? "Call Lata Again" : "Call Lata"}</button></div>
      <p class="foot">This went out automatically the moment we found she was alone, without waiting for you.</p>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">See Their Replies</button></div>`;
    else if (s.state === "claimed") body = `${sect("Lata is going to her")}
      <div class="group"><div class="r t">${tile("truck", "orange")}<div class="tt"><b>Lata Pawar, her nanny, is on her way</b><span>She replied at 7:14 am and expects to get there by 7:40. The others we messaged can see she's going, so nobody goes twice.</span></div>${st("orange", "On her way")}</div>
      <div class="r t">${tile("clock", "gray")}<div class="tt"><b>If she hasn't arrived by 8:40 am</b><span>We message the others again.</span></div></div></div>
      <div class="btn-row only-narrow"><button class="btn btn-block" data-action="msgs">See Their Replies</button></div>`;
    else if (s.state === "reached") body = `${sect("Lata says she has Meera")}
      <div class="group"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>Lata is at the flat with her</b><span>At 7:40 am she replied "Have her. She's fine, hungry." Her phone is at the flat too. Please see Meera yourself on a video call, so we know it's really her.</span></div>${st("orange", "Not confirmed")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="meera-wrong">Something's Wrong</button><button class="btn btn-prominent" style="flex:1" data-action="meera-video">Video Call Lata</button></div>
      <p class="foot">If anything feels wrong, tap Something's Wrong. Lata stays with Meera, and a police officer and the area's childcare worker go to the flat.</p>`;
    else if (s.state === "concern") body = `${sect("You said something's wrong")}
      <div class="group"><div class="r t">${tile("triangle-alert", "red")}<div class="tt"><b>Help is on its way to the flat</b><span>A police officer and the area's childcare worker are going there now. Lata has been asked to stay with Meera until they arrive. The child helpline (1098) has been told.</span></div>${st("red", "Being checked")}</div></div>
      <div class="btn-row"><button class="btn btn-block" data-action="meera-unwrong">It Was a Mistake</button></div>`;
    else if (s.state === "confirmed") body = `${sect("You saw Meera with Lata")}
      <div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>Seen on a video call at ${clock(s.videoT || "07:46")}</b><span>Meera was at the flat with Lata, fed and calm.</span></div>${st("green", "Safe with Lata")}</div></div>
      ${sect("Where should Meera stay until you can get to her?")}
      <div class="group tiles"><button class="r" data-action="meera-place" data-v="lata">${tile("house", "blue")}<div class="tt"><b>Stay with Lata, at home</b><span>Someone she knows, in her own home. Usually best.</span></div>${chev()}</button>
      <button class="r" data-action="meera-place" data-v="care">${tile("building-2", "indigo")}<div class="tt"><b>A safe place nearby: Govt Primary School, Marol</b><span>400 m away. A police officer and a checked volunteer are there.</span></div>${chev()}</button></div>`;
    else if (s.state === "placed") body = `${sect("Meera is safe")}
      <div class="group tiles"><div class="r t">${tile("shield-check", "green")}<div class="tt"><b>${s.placed === "care" ? "At Govt Primary School, Marol" : "With Lata, at home"}</b><span>${s.placed === "care" ? "A police officer and a checked volunteer are there. Lata stays with her until she's settled." : "Lata looks after her until you can come, in about a week when trains run, or until child protection officers take over."}</span></div>${caseSt("meera")}</div>
        ${s.placed === "care" ? `<div class="r t">${tile("package", "orange")}<div class="tt"><b>Meera's food ration goes to the school</b><span>The school's care point gets her 5 kg monthly ration from today.</span></div></div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>A collection code for you</b><span>Code 4F2K. The school hands Meera over only to someone who has this code, after a video call with you.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>Someone checks on Meera</b><span>The volunteer on duty sends you a voice note every evening, and a child welfare officer visits on Day 3.</span></div></div></div>`
        : `<div class="r t">${tile("package", "orange")}<div class="tt"><b>Meera's food ration goes to Lata</b><span>Lata can collect Meera's 5 kg monthly ration at any ration shop from today, so looking after her costs Lata nothing.</span></div></div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>A guardian pass for Lata</b><span>Code 4F2K, valid for two weeks. If police or a hospital ask, they can check it with the child helpline.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>Someone checks on Meera</b><span>Lata sends a voice note every evening, and the area's childcare worker visits on Day 3.</span></div></div></div>`}
      <p class="foot">Lata's reply went to the child helpline (CHILDLINE 1098) at 7:40 am, as the record that she took Meera in. Indian law asks anyone who takes in a child on their own to report it within a day, so this protects Lata too. Child protection officers check the record and decide whether anything more is needed.</p>
      <div class="btn-row"><button class="btn btn-block" data-action="export" data-id="meera">${I("file-down", 17)}Save a Copy Without Her Address</button></div>`;
    return `${head("Meera", "Your granddaughter, 3 · Flat 402, Sunrise Towers, Andheri East, Mumbai", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">MS</span><div class="tt"><b>Meera Sharma, 3</b><span>1,410 km from you · case number SH-7731</span></div>${caseSt("meera")}</div></div>
      ${disc("How we know she's alone", esc(c.why) + " The people who know her come from her parents' phones: the people they called most, who live in Mumbai.")}${body}${logHtml(s, "What has happened so far")}`;
  };

  V["#case-kamla"] = () => {
    const c = RC.cases.kamla, s = S.cases.kamla;
    let body = "";
    if (s.state === "flagged") body = `${sect("You're the nearest person she knows")}${intro("She's 3.1 km from you. Anita, her neighbour, is next nearest at 3.8 km. If you say you're going, we tell Anita and your sister Shalini, so nobody goes twice.")}
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="kamla-cant">I Can't</button><button class="btn btn-prominent" style="flex:1" data-action="kamla-going">I'm Going</button></div>`;
    else if (s.state === "claimed") body = `${sect("You're on your way")}<div class="group"><div class="r t">${tile("clock", "orange")}<div class="tt"><b>You said you're going, at ${clock(s.goingT || "07:20")}</b><span>We told Anita and Shalini. If you haven't got there by 8:45 am, we ask Anita.</span></div>${caseSt("kamla")}</div></div>
      <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="kamla-release">I Can't Make It</button><button class="btn btn-prominent" style="flex:1" data-action="kamla-reached">I'm With Her</button></div>
      <p class="foot">If something stops you on the way, tap I Can't Make It, and we ask Anita straight away.</p>`;
    else if (s.state === "reached") body = `${sect("You're with her")}<div class="group"><div class="r t">${tile("check", "green")}<div class="tt"><b>You got there at ${clock(s.withT || "07:55")}</b><span>You said so, and your phone is at her home. Her health records are now open to you at any clinic.</span></div>${caseSt("kamla")}</div></div>
      ${sect("Her medicines")}${intro("From her health records and pharmacy bills. Only the person looking after her sees this.")}
      <div class="group tiles">${RC.meds.map(m => `<div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>${esc(m.name)}</b><span>${esc(m.for)} · ${esc(m.left)}</span></div>${st(/4 days/.test(m.left) ? "orange" : "green", /4 days/.test(m.left) ? "Buy more soon" : "Enough for now")}</div>`).join("")}
        <div class="r t">${tile("map-pin", "blue")}<div class="tt"><b>Apollo Pharmacy, Sector 8 · 1.1 km</b><span>A pharmacist has been there since 6:58 am, and it has both in stock.</span></div></div></div>`;
    else if (s.state === "cant") body = `${sect("We've asked Anita and Shalini")}<div class="group"><div class="r t">${tile("users", "orange")}<div class="tt"><b>Anita Verma, her neighbour, has been asked</b><span>Anita is 3.8 km away. Your sister Shalini was told too. Kiran, the area's community health worker (ASHA), is ready if they can't.</span></div>${caseSt("kamla")}</div></div>
      <div class="btn-row"><button class="btn btn-block" data-action="kamla-going">Actually, I'm Going</button></div>`;
    return `${head("Kamla Devi", "Your mother, 78 · B-4/57, Rohini Sector 3, Delhi", ["#cases", "Cases"])}
      <div class="group" style="margin-top:22px"><div class="r"><span class="avatar">KD</span><div class="tt"><b>Kamla Devi, 78</b><span>3.1 km from you · she has no phone</span></div>${caseSt("kamla")}</div></div>
      ${disc("How we know she's alone", esc(c.why))}${body}${logHtml(s, "What has happened so far")}`;
  };

  /* Who's with you: a child already in your care stops being "alone", once their family confirms, and their ration follows them to you. */
  V["#with"] = () => {
    const g = RC.withMeSuggest, w = S.withMe[0], st0 = w ? w.status : null;
    let card;
    if (!w) card = `<div class="group"><div class="r"><div class="tt"><span>Name</span><b>${esc(g.name)}</b></div></div><div class="r"><div class="tt"><span>Age</span><b>${g.age}</b></div></div><div class="r"><div class="tt"><span>Where he lives</span><b>${esc(g.from)}</b></div></div></div>
        <p class="foot">The example is filled in for you: your neighbour's son, who came to your flat last night.</p>
        <div class="btn-row" style="display:flex;gap:10px"><button class="btn" data-action="addelder">Add an Elder Instead</button><button class="btn btn-prominent" style="flex:1" data-action="withme-add">Add Him</button></div>`;
    else if (st0 === "unconfirmed") card = `<div class="group tiles"><div class="r"><span class="avatar">AM</span><div class="tt"><b>${esc(g.name)}, ${g.age}</b><span>Your neighbour's son · added at 7:12 am</span></div>${st("orange", "Waiting for his family")}</div>
        <div class="r t">${tile("users", "orange")}<div class="tt"><b>We've asked his family to confirm</b><span>His aunt in Noida will see him with you on a video call. If she can't, Kiran, the area's community health worker (ASHA), will visit by 11 am.</span></div></div></div>
        <div class="btn-row"><button class="btn btn-block" data-action="withme-confirm">His Aunt Confirms on Video (demo)</button></div>
        <p class="foot">Until someone who knows him confirms, nothing changes for you.</p>`;
    else card = `<div class="group tiles"><div class="r"><span class="avatar">AM</span><div class="tt"><b>${esc(g.name)}, ${g.age}</b><span>Your neighbour's son · his aunt confirmed at 7:20 am</span></div>${st("green", "Safe with you")}</div>
        <div class="r t">${tile("check", "green")}<div class="tt"><b>His family knows he's with you</b><span>His aunt saw him on a video call and will come on Day 2.</span></div></div>
        <div class="r t">${tile("package", "orange")}<div class="tt"><b>His food ration comes to you</b><span>${esc(g.ration)}, on your ration card from today.</span></div></div>
        <div class="r t">${tile("shield", "blue")}<div class="tt"><b>A guardian pass</b><span>Code ${esc(g.code)}, valid for two weeks. Police, hospitals and schools can check it with the child helpline.</span></div></div>
        <div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>Someone checks on him</b><span>Kiran, the community health worker, visits on Day 3.</span></div></div></div>`;
    return `${head("Who's with you", "A child or an elderly person who is already in your care.")}
      ${intro("If someone else's child or parent is staying with you, add them here. Then nobody is sent to an empty flat, and nobody takes them from you by mistake.")}
      <div style="margin-top:14px">${card}</div>
      <p class="foot">If one phone number adds more than one child who isn't family, someone checks, to stop misuse.</p>
      ${disc("Why this costs you nothing", "Looking after someone shouldn't depend on kindness. Once their family or the health worker confirms, their food ration moves to your ration card, the guardian pass protects you at checkpoints and hospital desks, and there's a record of who has them.")}`;
  };

  V["#more"] = () => `${head("More", "Everything else in Still Here.")}
    <div class="group tiles" style="margin-top:22px">
      <a class="r t" href="#find">${tile("search", "blue")}<div class="tt"><b>Find someone</b><span>See whether someone you know is safe</span></div>${chev()}</a>
      <a class="r t" href="#report">${tile("siren", "red")}<div class="tt"><b>Report someone alone</b><span>A child or elder who isn't your family</span></div>${chev()}</a>
      <a class="r t" href="#with">${tile("hand-helping", "orange")}<div class="tt"><b>Who's with you</b><span>A child or elder already in your care</span></div>${chev()}</a>
      <a class="r t" href="#check">${tile("circle-help", "blue")}<div class="tt"><b>Is this true?</b><span>Check a message against official sources</span></div>${chev()}</a>
      <a class="r t" href="#bot">${tile("message-circle", "green")}<div class="tt"><b>Still Here on WhatsApp</b><span>The same help as a chat</span></div>${chev()}</a>
      <a class="r t" href="#child">${tile("baby", "orange")}<div class="tt"><b>The child alert</b><span>What a young child sees on a parent's phone</span></div>${chev()}</a>
      <a class="r t" href="contributor.html">${tile("building-2", "indigo")}<div class="tt"><b>For clinics, shops and shelters</b><span>Verified places update what they have</span></div>${chev()}</a>
      <a class="r t" href="#onmyown">${tile("life-buoy", "red")}<div class="tt"><b>If you're on your own</b><span>What a child or elder alone sees, and how they ask for help</span></div>${chev()}</a>
      <a class="r t" href="#ward">${tile("building-2", "blue")}<div class="tt"><b>Your ward</b><span>Water, power, official notices and local groups</span></div>${chev()}</a>
      <a class="r t" href="#radar">${tile("radar", "indigo")}<div class="tt"><b>On duty</b><span>Only for health workers, police and teachers</span></div>${chev()}</a>
      <a class="r t" href="#kit">${tile("download", "teal")}<div class="tt"><b>Offline kit</b><span>Apps and pages that work without a signal</span></div>${chev()}</a>
      <a class="r t" href="#about">${tile("info", "gray")}<div class="tt"><b>About this prototype</b><span>The idea, what's real, and the words used</span></div>${chev()}</a>
      <a class="r t" href="cockpit.html" target="_blank" rel="noopener">${tile("landmark", "ink")}<div class="tt"><b>Government view</b><span>The restricted control room, shown for the demo</span></div>${chev()}</a>
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
    // Old and local names people actually type (audit 2, N-28)
    [["Andheri", "Ward K/E, Mumbai · Meera's ward", { area: "city", city: "mumbai", sel: { kind: "ward", key: "MUM18" } }], ["Bombay", "Mumbai", { area: "city", city: "mumbai" }], ["Bangalore", "Bengaluru", { area: "city", city: "bengaluru" }],
     ["Calcutta", "Kolkata", { area: "city", city: "kolkata" }], ["Madras", "Chennai", { area: "city", city: "chennai" }], ["Gurgaon", "Gurugram district, Haryana", { area: "india", state: "Haryana", sel: { kind: "district", key: "HR-378" } }],
     ["Noida", "Gautam Buddha Nagar district, Uttar Pradesh", { area: "india", state: "Uttar Pradesh", sel: { kind: "district", key: "UP-375" } }]].forEach(([t, sub, go]) => out.push({ t, sub: "Also known as · " + sub, rank: 1, ic: "map-pin", go }));
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
  function paceSt(share, ind) { const r = ind ? share / ind : 1; return r >= 1 ? st("green", `${P(share)} safe · ahead of India`) : r >= 0.8 ? st("orange", `${P(share)} safe · level with India`) : st("red", `${P(share)} safe · behind India`); }
  function crumbs() {
    const c = cityOf(), city = c && MD.CITIES[c], st = city ? city.state : S.mapState;
    const parts = [`<button data-action="crumb" data-v="india">India</button>`];
    if (st && st !== "Delhi") parts.push(c ? `<button data-action="crumb" data-v="state" data-s="${esc(st)}">${esc(st)}</button>` : `<b>${esc(st)}</b>`);
    if (c) parts.push(`<b>${esc(city.name)}</b><span class="fn">· ${city.wards.length} wards</span>`);
    if (!c && !st) parts[0] = `<b>India</b><span class="fn">· tap a state, or search</span>`;
    return `<div class="crumbs">${parts.join(`<span>›</span>`)}</div>`;
  }
  const SVC_ICON = { Power: "zap", Water: "droplets", Metro: "train-front", Fuel: "truck", "Mobile network": "radio-tower" };
  function servicesGroup() { return `<div class="group tiles">${RC.services.map(s => `<div class="r t">${tile(SVC_ICON[s.k] || "activity", s.ok ? "green" : "orange")}<div class="tt"><b>${s.k}</b><span>${esc(s.v)} · ${esc(s.src)}, ${clock(s.t)}</span></div>${s.ok ? st("green", "Working") : st("orange", "Partly working")}</div>`).join("")}</div>`; }
  function noticesGroups() {
    return RC.notices.map((n, i) => { const v = S.noticeVotes[i] || { c: 0, d: 0 };
      return `<div class="group"><div class="r t">${tile("landmark", "gray")}<div class="tt"><b>${esc(n.from)}</b><span>${clock(n.t)}</span></div></div><div class="pad" style="font-size:15px">${esc(n.text)}</div>
        ${n.confirms == null ? "" : `<div class="pad"><div class="okline">${I("check", 16)}<span>${n.confirms + v.c} people there say it's true · ${n.denies + v.d} say it's wrong · last at ${clock(n.confirmedAt)}</span></div><div class="btn-row" style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-compact" data-action="vote" data-i="${i}" data-v="c">I'm There, It's True</button><button class="btn btn-compact btn-plain" data-action="vote" data-i="${i}" data-v="d">Not True</button></div></div>`}</div>`; }).join("")
      + `${sect("Is it true?")}<div class="group"><div class="pad"><div class="fn" style="margin-bottom:6px">A message someone forwarded to you</div><div style="font-size:15px;font-style:italic">"${esc(RC.rumour.text)}"</div></div>
        ${S.checkedRumour ? `<div class="r t">${tile("x-circle", "red")}<div class="tt"><b>${esc(RC.rumour.verdict)}</b><span>${esc(RC.rumour.why)}</span></div>${st("red", "Not confirmed")}</div>` : `<div class="pad"><button class="btn btn-compact" data-action="checkrumour">Check This Message</button></div>`}</div>`
      + disc("How we check a notice", "Every notice comes from a named government office. People whose phones are at that place can say it's true or wrong, once each. If nobody confirms it for two hours, it fades out.");
  }
  V["#map"] = () => {
    const layer = S.mapLayer, h = HH();
    const layers = [["people", "Children"], ["services", "Services"], ["notices", "Notices"], ["danger", "Avoid"]].map(([k, l]) => `<button class="${layer === k ? "on" : ""}" data-action="maplayer" data-v="${k}">${l}</button>`).join("");
    let body = "";
    if (layer === "services") body = servicesGroup();
    else if (layer === "notices") body = noticesGroups();
    else if (layer === "danger") body = `<div class="mapgroup"><div class="mapbox" id="avoidmap"></div></div><div class="group tiles" style="margin-top:14px">${RC.avoid.map(d => `<div class="r t">${tile("triangle-alert", "red")}<div class="tt"><b>${esc(d.z)}</b><span>${esc(d.why)}</span></div></div>`).join("")}</div>`;
    else {
      const v = areaAgg(h), name = areaName(), sel = selAgg(h);
      body = `<div class="mapsearch" id="mapsearch"><label class="field">${I("search", 17)}<input id="mapq" type="search" autocomplete="off" placeholder="Search a city, district or ward" aria-label="Search a place" aria-controls="mapres"><button type="button" class="clear" data-action="mapclear" aria-label="Clear" hidden>${I("x-circle", 17)}</button></label><div class="results" id="mapres" role="listbox"></div></div>
        ${crumbs()}
        <div class="filters" style="margin-top:0"><div class="seg">${MD.TIMES.map((t, i) => `<button class="${(S.ti || 0) === i ? "on" : ""}" data-action="time" data-v="${i}">${t.short}</button>`).join("")}</div><span class="proj ${isNow() ? "now" : ""}" data-help="projection">${isNow() ? "Now" : "Estimate"}</span></div>
        <div class="stats four" style="margin-bottom:14px">${stat(RC.TERMS.alone, C(v.A), `${name} · ${v.flagged >= v.A * 0.99 ? "all found" : C(v.flagged) + " found so far"}`, "alone")}${stat(RC.TERMS.reached, C(v.reached), P(v.share) + " of them", "reached")}${stat(RC.TERMS.claimed, C(v.claimed), "said they're going", "claimed")}${stat(RC.TERMS.unclaimed, C(v.unclaimed), "messaged, nobody going", "unclaimed")}</div>
        <div class="mapgroup"><div class="mapbox" id="pubmap"></div>${M.legend()}</div>
        ${sel ? `${sect(esc(selName()), sel.nodata ? st("", "No data") : paceSt(sel.share, MD.scopes.india(h).share))}
          <div class="group pad">${sel.nodata ? `<p class="sub" style="margin:0">There's no phone network here, so we have no numbers. Grey stripes mean only that, not that things are bad.</p>` : `${CH.stack(sel)}<p class="fn" style="margin:10px 0 0">${C(sel.A)} children left alone here</p>
            <div class="h3" style="margin:18px 0 4px">Is it getting better?</div><p class="trendline">${esc(CH.trendSentence(selFn(), MD.NOW, selName().replace(", your ward", "")))}</p><div id="selchart"></div>`}</div>` : `<p class="foot">Tap any area on the map for its numbers and whether it is getting better.</p>`}
        ${disc("What makes an area green", "A child counts as safe only when the person who went replies that the child is with them, and their phone is at the address. A tap alone doesn't count. Grey stripes mean no phone network, so no numbers. Nothing smaller than a ward is shown, so nobody can use this map to find a child.")}`;
    }
    return `${head(layer === "people" ? "Are children near me safe?" : layer === "services" ? "Water, power and transport" : layer === "notices" ? "Official notices" : "Places to avoid", layer === "people" ? `${esc(TT().label)} · of the children left alone in each area, how many are now safe with someone` : "Rohini Sector 7 and around · 7:10 am")}
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
      if (k === "pin:meera") return `<b>Meera, 3</b><div>Flat 402, Sunrise Towers, Andheri East. Ward K/E.</div><div class="src">Shown only to you and the people on her case</div><div class="hintl">Click to open her case</div>`;
      const v = valOf(k); if (!v) return `<b>${esc(nm(k))}</b>`; if (v.nodata) return `<b>${esc(nm(k))}</b><div>No phone network, so no data.</div>`;
      const hint = view === "india" ? (k === "Delhi" ? "Click to open Delhi's 290 wards" : "Click to see its districts") : view === "state" && cityDid[k] ? "Click to open its ward map" : "Click for detail";
      return `<b>${esc(nm(k))}${MD.byKey[k] && MD.byKey[k].mine ? ", your ward" : ""}</b>${row2(RC.TERMS.alone, C(v.A))}${row2(RC.TERMS.reached, P(v.share))}${row2(RC.TERMS.claimed, C(v.claimed))}${row2(RC.TERMS.unclaimed, C(v.unclaimed))}${isNow() ? "" : `<div class="src">Estimate for ${esc(TT().label)}</div>`}<div class="hintl">${hint}</div>`; };
    o.click = k => {
      if (view === "india") { if (k === "Delhi") mapGo({ area: "city", city: "delhi" }); else mapGo({ area: "india", state: k }); }
      else if (view === "state" && cityDid[k]) mapGo({ area: "city", city: cityDid[k] });
      else S.mapSel = { kind: view === "city" ? "ward" : "district", key: k };
      render(); };
    o.clickPin = id => { if (id === "meera") go("#case-meera"); };
    return o;
  }

  const FLOW_ICON = { rail: "train-front", road: "truck", air: "plane", sea: "ship" };
  // Updates that places post themselves in the contributor portal (contributor.html) are kept in this browser and shown here
  const contribUpd = () => { try { return (JSON.parse(localStorage.getItem("stillhere-contrib-v1")) || {}).upd || {}; } catch (e) { return {}; } };
  const QW = { short: "short queue", medium: "medium queue", long: "long queue" };
  V["#help"] = () => {
    const ind = MD.scopes.india(MD.NOW), up = contribUpd();
    const places = RC.contributors.map(c => { const u = up[c.id] || {}; return Object.assign({}, c, { open: u.open != null ? u.open : c.open, q: u.q || (c.queue < 15 ? "short" : c.queue <= 60 ? "medium" : "long"), stock: u.stock ? c.stock.map(([k, v]) => [k, u.stock[k] || v]) : c.stock, t: u.t || "6:58 am" }); });
    return `${head("Help is coming", "Supplies sent from other cities, and what's open near you now.")}
      ${sect("Warnings for today")}<div class="group tiles">${RC.warnings.map(w => `<div class="r t">${tile(w.icon, "orange")}<div class="tt"><b>${esc(w.t)}</b><span>${esc(w.s)}</span></div></div>`).join("")}</div>
      <div class="stats" style="margin-top:24px">${stat("Children found alone who are now safe, India", C(ind.reached), P(ind.share) + " of " + C(ind.A), "reached")}${stat(RC.TERMS.vanish, "0", "checked every minute", "vanish")}</div>
      ${sect("Sent from other cities")}
      <div class="group tiles flowlist">${RC.flows.map((f, i) => `<div class="r t"><span class="n">${i + 1}</span><div class="tt"><b>${esc(f.what)}</b><span>${I(FLOW_ICON[f.kind] || "package", 13)} ${esc(f.from)} to ${esc(f.to)}</span></div><span class="val">Left ${clock(f.dep)}</span></div>`).join("")}</div>
      <p class="foot">Each arrow runs from the city a supply left to the city it's going to, numbered as in the list. We show a supply only two hours after it leaves, and never its route or arrival time, so nobody can wait for it on the road. Nothing moving inside a city is shown.</p>
      <div class="mapgroup" style="margin-top:14px"><div class="mapbox" id="flowmap" style="height:460px;min-height:0"></div><div class="legend"><span><i style="background:var(--flow);border-radius:50%"></i>Supply on its way, numbered as in the list</span><span><i style="background:var(--apple-indigo);border-radius:50%"></i>Community taking people in</span></div></div>
      ${sect("Services back in Delhi")}${intro("Compared with a normal day.")}<div class="stats">${RC.restoration.map(r => stat(r.k, `${r.v} <small>${esc(r.unit)}</small>`)).join("")}</div>
      ${sect("Doctors and nurses on duty near you")}${intro("Counted from staff phones at each place, so you know who is there before you walk. The shortest wait is marked, so nobody crowds one place.")}
      <div class="group tiles">${RC.clinics.map(c => { const best = c.mins === Math.min(...RC.clinics.filter(x => !x.firstaid).map(x => x.mins)); return `<div class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>${esc(c.name)}</b><span>${c.doctors} doctor${c.doctors === 1 ? "" : "s"}${c.nurses ? ` and ${c.nurses} nurse${c.nurses === 1 ? "" : "s"}` : ""} there ${c.since ? `since ${esc(c.since)}` : "now"} · ${esc(c.treats)} · wait ${esc(c.wait)}</span></div>${best ? st("green", "Shortest wait") : c.mins >= 90 ? st("orange", "Long wait") : ""}<span class="val">${esc(c.dist)}</span></div>`; }).join("")}</div>
      <p class="foot">If someone can't breathe, is bleeding heavily or won't wake up, call 112. An ambulance comes if one is free; if not, the call goes to the nearest doctor on duty.</p>
      ${sect("Updated by the places themselves")}${intro("Verified places post what they have and how long the queue is. Each update fades after 4 hours unless they renew it.")}
      <div class="group tiles">${places.map(p => `<div class="r t">${tile(p.kind === "Pharmacy" ? "heart-pulse" : p.kind === "Ration shop" ? "package" : p.kind === "Clinic" ? "heart-pulse" : "users", p.open ? "green" : "gray")}<div class="tt"><b>${esc(p.name)}</b><span>${p.open ? QW[p.q] : "closed now"} · ${p.stock.map(([k, v]) => `${esc(k)}: ${esc(v.toLowerCase())}`).join(", ")} · updated ${esc(p.t)} · tier ${p.tier}</span></div>${p.open ? st(p.q === "long" ? "orange" : "green", p.q === "long" ? "Busy" : "Open") : st("", "Closed")}</div>`).join("")}</div>
      <p class="foot"><a href="contributor.html">Run a clinic, shop or shelter? Update it here.</a></p>
      ${sect("Open now, with staff there")}
      <div class="group tiles">${RC.onDuty.map(o => `<div class="r t">${tile(o.icon, o.tile)}<div class="tt"><b>${esc(o.name)}</b><span>${esc(o.what)}${o.queue ? ` · ${esc(o.queue)}` : ""}</span></div><span class="val">${esc(o.dist)}</span></div>`).join("")}</div>
      <p class="foot">We know someone is working because their work phone is at the counter now: the ration shop dealer, a pharmacist, an ATM guard. Queue sizes come from the number of phones waiting there.</p>
      ${sect("Safe places near you")}
      <div class="group tiles">${RC.places.map(p => `<div class="r t">${tile(p.kind === "worship" ? "landmark" : "building-2", p.open ? "green" : "gray")}<div class="tt"><b>${esc(p.name)}</b><span>${esc(p.staff)} · ${esc(p.dist)}${p.charge ? ` · ${I("zap", 13)} ${esc(p.charge)}` : ""}${p.hub ? ` · ${I("wifi", 13)} ${esc(p.hub)}` : ""}</span></div>${p.open ? st("green", "Open") : st("", "Unknown")}</div>`).join("")}</div>
      <p class="foot">Open means an adult is on duty there and a phone was there in the last hour. Some have power for charging phones. An offline hub is a computer with its own Wi-Fi that serves maps, medical pages and messages when phone towers are down.</p>
      ${sect("If it's too much")}<div class="group"><div class="r t">${tile("heart-pulse", "indigo")}<div class="tt"><b>Tele-MANAS: 14416</b><span>The government's free mental health line, 24 hours, in your language. Talking to someone helps.</span></div></div></div>
      ${sect("Communities taking people in")}${intro("Groups with food and a place to stay, for people who can do work they need. Asking sends your name and skills to the organiser, who decides and replies.")}
      <div class="group tiles">${RC.communities.filter(c => c.accepting).map((c, i) => `<div class="r t">${tile("users", "indigo")}<div class="tt"><b>${esc(c.name)}</b><span>${esc(c.note || c.members)}</span></div>${S.joined[i] ? st("green", "Asked") : `<button class="btn btn-compact" data-action="join" data-i="${i}">Ask to Join</button>`}</div>`).join("")}</div>`;
  };

  V["#ward"] = () => {
    const t = S.wardTab;
    const tabs = [["services", "Services"], ["notices", "Notices"], ["groups", "Groups"], ["authorities", "Emergency"], ["places", "Places"]].map(([k, l]) => `<button class="${t === k ? "on" : ""}" data-action="wardtab" data-v="${k}">${l}</button>`).join("");
    let body = "";
    if (t === "services") body = servicesGroup();
    else if (t === "notices") body = noticesGroups();
    else if (t === "groups") body = `<div class="group tiles">${RC.communities.map((g, i) => `<div class="r t">${tile("users", g.accepting ? "indigo" : "gray")}<div class="tt"><b>${esc(g.name)}</b><span>${esc(g.members)} · ${esc(g.organiser)}</span></div>${g.accepting ? (S.joined[i] ? st("green", "Asked") : `<button class="btn btn-compact" data-action="join" data-i="${i}">Ask to Join</button>`) : st("", "Not taking anyone new")}</div>`).join("")}</div>`;
    else if (t === "authorities") body = `<div class="group tiles">${RC.authorities.map(a => `<div class="r t">${tile("shield", "blue")}<div class="tt"><b>${esc(a.name)}</b><span>${esc(a.staff)} · ${esc(a.dist)}</span></div><span class="val">${esc(a.phone)}</span></div>`).join("")}</div><p class="foot">We count staff at work by whose work phones are there now.</p>`;
    else body = `<div class="group tiles">${RC.places.map(p => `<div class="r t">${tile(p.kind === "worship" ? "landmark" : "building-2", p.open ? "green" : "gray")}<div class="tt"><b>${esc(p.name)}</b><span>${esc(p.staff)} · ${esc(p.dist)}</span></div>${p.open ? st("green", "Open") : st("", "Unknown")}</div>`).join("")}</div>`;
    return `${head(RC.me.ward, "Your ward: the part of Delhi you live in. You see more detail here because your home is here.")}<div class="filters"><div class="seg">${tabs}</div></div>${body}${disc("Who sees what", "You see your own ward and the wards next to it in detail, and only totals everywhere else. Nobody sees the address of a child who is alone unless they're asked to go to her.")}`;
  };

  const AGE = { "under 5": "Child under 5", "6–12": "Child, 6 to 12", "over 75": "Elder over 75" };
  V["#radar"] = () => {
    const r = S.radar, ok = r.id && r.live, n = RC.radar.within1km;
    return `${head("On duty near you", r.id ? "Seen as Kiran, community health worker (ASHA), Rohini Sector 7 (demo)" : "Only for health workers, childcare workers, police and teachers on a government duty list. It shows children alone near them, so everyone else is kept out.")}
      ${sect("Check you're on a duty list")}
      <div class="group tiles"><div class="r t">${tile("smartphone", "gray")}<div class="tt"><b>Phone number</b><span>Checked by your mobile network</span></div>${st("green", "Done")}</div>
      <div class="r t">${tile("list-checks", "gray")}<div class="tt"><b>Duty list</b><span>The government's list of community health workers (ASHA), the police duty list, or a school's staff list</span></div>${r.id ? st("green", "Kiran · ASHA, Rohini Sector 7") : st("", "You're not on one")}</div>
      <div class="r t">${tile("activity", "gray")}<div class="tt"><b>Face check</b><span>Makes sure it's you holding the phone</span></div>${r.live ? st("green", "Done") : `<button class="btn btn-compact" data-action="verify" data-v="live">Start</button>`}</div></div>
      ${r.id ? "" : `<p class="foot">You're not on a duty list, so nothing here opens for you. You help through your own people: the cases Still Here sends you.</p><div class="btn-row"><button class="btn btn-block" data-action="askiran">See It as Kiran, a Health Worker (demo)</button></div>`}
      ${disc("Why it's only for people on duty", "A list of children alone would be a list for predators, and an ID card proves who someone is, not what they intend. So only paid, accountable workers see these cases. They must be on a duty list before they see any address. Two of them go to every child. Children go to a safe place like a school, never to a stranger's home. Every handover is recorded, and anyone who takes on several cases is checked.")}
      ${ok ? `${sect("Alone within 1 km of you")}<div class="stats">${stat("Nobody coming yet", n.unclaimed)}${stat("Under five", n.under5)}${stat("Over 75", n.elderly)}</div>
        <div class="group tiles" style="margin-top:14px">${RC.radar.cases.map(c => `<div class="r t">${tile(c.ageBand === "under 5" ? "baby" : "user-round", "red")}<div class="tt"><b>${esc(AGE[c.ageBand] || c.ageBand)} · alone about ${Math.round(c.hoursSinceT)} hours</b><span>${esc(c.address)} · take to ${esc(c.care)}</span></div>${r.taken === c.id ? st("orange", "Going with Dr. Rao") : r.taken ? "" : `<button class="btn btn-compact" data-action="take" data-id="${c.id}">I'll Go</button>`}</div>`).join("")}</div>` : ""}`;
  };

  let deferredInstall = null, savedOffline = false;
  function checkSaved() { if (!window.caches) return; caches.keys().then(k => { const v = k.some(x => x.indexOf("stillhere-") === 0); if (v !== savedOffline) { savedOffline = v; if (location.hash === "#kit") render(); } }).catch(() => {}); }
  if (navigator.serviceWorker) navigator.serviceWorker.ready.then(() => setTimeout(checkSaved, 800));
  checkSaved();
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; if (location.hash === "#kit") render(); });
  function kitRow(k) {
    return `<details class="row"><summary class="r t">${tile(k.icon, k.tile)}<div class="tt"><b>${esc(k.name)}</b><span>${esc(k.what.split(". ")[0].replace(/\.$/, ""))}.</span></div><span class="val sz">${esc(k.size || "")}</span>${chev()}</summary>
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
        <div class="r t">${tile("phone", "green")}<div class="tt"><b>On a basic phone</b><span>No smartphone? Cases come by SMS and you reply with one digit. A missed call to 1800 000 0000 (made up) reads out your people's status in Hindi or English.</span></div></div>
        <a class="r t" href="lite.html">${tile("wifi-off", "gray")}<div class="tt"><b>Still Here Lite</b><span>One small page that loads on 2G and old phones, with what to do, what's open and first aid.</span></div><span class="val sz">about 8 KB</span>${chev()}</a>
        <a class="r t" href="lite-hi.html" lang="hi">${tile("globe", "gray")}<div class="tt"><b>Still Here लाइट, हिन्दी में</b><span>वही छोटा पेज, हिन्दी में।</span></div><span class="val sz">about 14 KB</span>${chev()}</a>
      </div>
      ${sect("Apps that work without towers")}
      <div class="group tiles">${RC.kit.map(kitRow).join("")}</div>
      <p class="foot">Links go to each project's own store page or website. Copies from anywhere else can't be checked, so this page never hosts them.</p>
      ${sect("For schools, temples and gurudwaras that shelter people")}
      <div class="group tiles">${RC.hubs.map(kitRow).join("")}</div>
      ${sect("First aid, saved for day one")}
      <div class="group tiles">${RC.kitPages.map(p => `<details class="row"><summary class="r t">${tile("heart-pulse", "red")}<div class="tt"><b>${esc(p.t)}</b></div>${chev()}</summary><div class="more" style="line-height:1.5">${esc(p.s)}</div></details>`).join("")}</div>
      <p class="foot">Short pages from Where There Is No Doctor and the World Health Organization, saved inside this app.</p>
      ${disc("Messages when the towers are down", "Open Messages at the top and switch on Towers down. It shows how a block keeps talking with Bitchat: each message hops from phone to phone over Bluetooth, with no server and no phone number.")}`;
  };

  const GOV_ONLY = ["urgent", "short", "govview", "mirror", "openzone", "register", "triage"];
  V["#about"] = () => `
    ${head("About this prototype", "A made-up product for a made-up morning: the day after half of all people vanished.")}
    <div class="stats" style="margin-top:24px">${stat("Children with no adult at home, the morning after, worldwide", "~240 M")}${stat("Of them under five", "~80 M")}${stat("Have someone who knows them and goes on Day 1", "68–82%", "even if only half of the people alive who know them go; the rest go to a paid childcare worker (anganwadi)")}</div>
    ${sect("The idea")}
    <div class="group"><div class="pad"><div class="h3">The one trace</div><p class="sub" style="margin:6px 0 0">The vanishing left no bodies. Its only trace is that the phones of half of everyone stopped in the same second. The mobile networks already hold that record. Still Here turns it into five answers: who's gone, who's alone, who's closest, who's going, and who has them.</p></div>
    <div class="pad"><div class="h3">The test every feature passed</div><p class="sub" style="margin:6px 0 0">Would a self-interested survivor want it that morning, with data and behaviour that exist that morning, that governments and existing apps won't provide in the first days, without anyone having to be kind?</p></div>
    <div class="pad"><div class="h3">What's real and what's made up</div><p class="sub" style="margin:6px 0 0">Every person, address and count is made up, and one model drives every number so they add up. Phone numbers are fictional. The maps are real: Natural Earth, india-maps-data, and DataMeet's ward maps for seven cities. Nothing you do here leaves this page.</p></div>
    <div class="pad"><div class="h3">How to try it</div><p class="sub" style="margin:6px 0 0">Open Messages at the top, then Demo Path: twelve steps, about three minutes. Everything can also be clicked in any order.</p></div></div>
    ${sect("The government view")}
    <div class="group"><a class="r t" href="cockpit.html" target="_blank" rel="noopener">${tile("landmark", "ink")}<div class="tt"><b>Open the control room</b><span>A separate, restricted system in the real product. Linked here only for the demo.</span></div>${chev()}</a></div>
    ${sect("Words used in Still Here")}
    <div class="group">${Object.keys(RC.HELP).filter(k => !GOV_ONLY.includes(k)).map(k => RC.HELP[k]).map(H => `<div class="r"><div class="tt"><b>${esc(H.t)}</b><span>${esc(H.b)}</span></div></div>`).join("")}</div>
    <div class="btn-row"><button class="btn btn-block" data-action="reset">Reset the Demo</button></div>`;

  /* ---------- actions ---------- */
  function addLog(id, t, text) { S.cases[id].log.push({ t, text }); }
  function thread(from, text, t, kind, gloss) { S.thread.push({ from, text, t, kind, gloss }); }
  // Log times follow the order of events: never earlier than the last entry (audit 2, N-26)
  function nextT(id, base) { const e = S.cases[id].log.slice(-1)[0]; if (!e) return base; const last = e.t, toM = x => +x.slice(0, 2) * 60 + +x.slice(3), m = Math.max(toM(base), toM(last) + 2); return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); }
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
    enter() { S.entered = true; markStep(1); go(S.welcomed ? "#home" : "#welcome"); },
    welcomed() { S.welcomed = true; go("#home"); },
    tellall() { S.told = true; toast("We told 214 people you're safe"); },
    ownsend() { S.ownSent = true; },
    claim(d) { S.claim = d.v; markStep(10); },
    checkclaim() { const q = document.getElementById("claimq"); S.claim = q ? q.value : S.claim; markStep(10); },
    bot(d) { const m = S.bot || botStart(); m.push({ t: BOTMENU.find(x => x[0] === d.v)[1].slice(2), me: true }); m.push({ t: botReply(d.v) }); S.bot = m; markStep(10); },
    kid(d) { S.childAns = d.v || null; },
    kidsay() { try { const u = new SpeechSynthesisUtterance(SAY.en); u.lang = "en-IN"; speechSynthesis.cancel(); speechSynthesis.speak(u); const h = new SpeechSynthesisUtterance(SAY.hi); h.lang = "hi-IN"; speechSynthesis.speak(h); } catch (e) {} },
    report() { S.reported = true; markStep(9); },
    checkin(d) { S.checkins[d.id] = true; markStep(2); toast("Asked. They'll get a message: are you OK?"); },
    "call-lata"() { S.called.lata = true; addLog("meera", "07:11", "You called Lata for 2 minutes. She had read the message and was looking for her keys."); toast("Calling Lata Pawar…"); },
    addsomeone() { toast("Type a name and number. If her parents were in touch with that number, they get her case too."); },
    addelder() { toast("You'd add an elder the same way: name, age and where they live."); },
    "reply-lata-going"() { const c = S.cases.meera; if (c.state !== "notified") return; c.state = "claimed";
      thread("Lata Pawar", "1. 25 मिनिटांत येते. माझ्याकडे जास्तीची चावी आहे.", "07:14", "in", "1. Coming in 25 minutes. I have the spare key.");
      thread("Still Here", "धन्यवाद, लता. बाकीच्यांना कळवले आहे की तुम्ही जात आहात. मीरा तुमच्याबरोबर असेल तेव्हा HAVE HER लिहा.", "07:14", "out", "Thank you, Lata. We've told the others you're going. When Meera is with you, reply HAVE HER.");
      thread("sys", "Lata is going and expects to get there at 7:40 am. Rakesh, Farah and Dr. Nair were told, so nobody goes twice.", "07:14", "sys");
      addLog("meera", "07:14", "Lata Pawar, her nanny, 1.8 km away, replied that she's going and expects to get there at 7:40 am. We told the others, so nobody goes twice."); markStep(4); },
    "reply-rakesh-cant"() { if (S.cases.meera.state !== "notified" && S.cases.meera.state !== "claimed") return; if (S.rakeshCant) return; S.rakeshCant = true; thread("sys", "Rakesh can't go: his car is wrecked. Lata, Farah and Dr. Nair are still asked.", "07:12", "sys"); addLog("meera", "07:12", "Rakesh Mehta replied that he can't go: his car is wrecked and he's walking to his mother's. Lata, Farah and Dr. Nair are still asked."); },
    "reply-lata-have"() { const c = S.cases.meera; if (c.state !== "claimed") return; c.state = "reached";
      thread("Lata Pawar", "HAVE HER. ती ठीक आहे, तिला भूक लागली आहे. फ्लॅटवर आहोत.", "07:40", "in", "HAVE HER. She's fine, hungry. We're at the flat.");
      thread("sys", "Lata has Meera, and her phone is at the flat. The child helpline (CHILDLINE 1098) has been told, as the law asks. Waiting for Sunita to see Meera on a video call.", "07:40", "sys");
      c.sent = true;
      addLog("meera", "07:40", "Lata replied that Meera is with her, and her phone is at the flat. Lata looks after Meera for now. We told the child helpline (CHILDLINE 1098), as the law asks when someone takes in a child. Waiting for you to see Meera on a video call."); markStep(5); },
    "meera-video"() { const c = S.cases.meera; if (c.state !== "reached") return; c.state = "confirmed"; const t = nextT("meera", "07:46"); c.videoT = t;
      thread("sys", "Sunita saw Meera with Lata on a video call. Meera is safe with Lata.", t, "sys");
      addLog("meera", t, "You saw Meera at the flat with Lata on a video call. She's safe."); },
    "meera-wrong"() { const c = S.cases.meera; c.state = "concern"; const t = nextT("meera", "07:46");
      thread("Still Here", "लता, कृपया मीराबरोबर फ्लॅटवरच थांबा. एक पोलीस अधिकारी आणि अंगणवाडी सेविका तुमच्याकडे येत आहेत.", t, "out", "Lata, please stay at the flat with Meera. A police officer and the area's childcare worker are on their way to you.");
      addLog("meera", t, "You said something's wrong. We told the child helpline (1098) and sent a police officer and the area's childcare worker to the flat. Lata stays with Meera until they arrive."); },
    "meera-unwrong"() { const c = S.cases.meera; c.state = "reached"; const t = nextT("meera", "07:49"); thread("sys", "Sunita says it was a mistake. The police officer still visits the flat once.", t, "sys"); addLog("meera", t, "You said it was a mistake. The officer still visits once. Waiting for you to see Meera on a video call."); },
    "meera-place"(d) { const c = S.cases.meera; if (c.state !== "confirmed") return; c.state = "placed"; c.placed = d.v; S.reachedBoost += 1; const t = nextT("meera", "07:50");
      addLog("meera", t, d.v === "care" ? "Meera is moving to Govt Primary School, Marol, where a police officer is present and R. Iyer is on duty. Lata stays until she's settled." : "Meera stays with Lata at the flat until you can come for her. Her food ration now goes to Lata, and Lata has guardian pass 4F2K.");
      thread("Still Here", d.v === "care" ? "धन्यवाद, लता. कृपया मीराला सरकारी प्राथमिक शाळा, मरोळ (400 मी.) येथे घेऊन जा. तिथे आर. अय्यर ड्यूटीवर आहेत. त्यांना कोड 4F2K दाखवा." : "धन्यवाद, लता. सध्या तुम्ही मीराची काळजी घेत आहात. तिचे रेशन तुम्हाला मिळेल, आणि तुमचा पालक पास 4F2K आहे. सुनीता तुम्हाला इथे मेसेज करतील.", t, "out", d.v === "care" ? "Thank you, Lata. Please take Meera to Govt Primary School, Marol (400 m). R. Iyer is on duty there. Show them code 4F2K." : "Thank you, Lata. You're looking after Meera for now. You can collect her food ration, and your guardian pass is 4F2K. Sunita will message you here."); markStep(6); },
    sendcp() { if (S.cases.meera.sent) return; S.cases.meera.sent = true; addLog("meera", "07:52", "Her record went to the child helpline (CHILDLINE 1098) and Mumbai's child welfare committee."); toast("Sent to the child helpline and Mumbai's child welfare committee"); },
    checkrumour() { S.checkedRumour = true; },
    notright(d) { S.notRight[d.id] = true; toast("Thanks. We're checking with the mobile network. If they're here, they can tap I'm Here on any phone."); },
    calldesk(d) { S.called[d.id] = true; toast("Calling the help desk of the hospital where his phone is…"); },
    "withme-add"() { if (!S.withMe.length) S.withMe.push({ name: RC.withMeSuggest.name, t: "07:12", status: "unconfirmed" }); markStep(9); toast("We found his case and asked his aunt to confirm."); },
    "withme-confirm"() { if (S.withMe[0]) S.withMe[0].status = "confirmed"; toast("Confirmed. His ration and a guardian pass move to you."); },
    askiran() { S.radar.id = true; markStep(11); },
    "kamla-going"() { const k = S.cases.kamla; k.state = "claimed"; k.goingT = nextT("kamla", "07:20"); addLog("kamla", k.goingT, "You said you're going and expect to get there by 7:45 am. We told Shalini and Anita. If you haven't got there by 8:45 am, we ask Anita."); markStep(7); },
    "kamla-release"() { S.cases.kamla.state = "cant"; addLog("kamla", nextT("kamla", "07:35"), "You said you can't make it. We asked Anita Verma, 3.8 km away, and told Shalini. Kiran, the area's community health worker, is ready if they can't."); toast("We've asked Anita and told Shalini"); },
    "kamla-cant"() { S.cases.kamla.state = "cant"; addLog("kamla", nextT("kamla", "07:20"), "You said you can't go. We asked Anita Verma, 3.8 km away, and told Shalini. Kiran, the area's community health worker, is ready if they can't."); },
    "kamla-reached"() { const k = S.cases.kamla; k.state = "reached"; S.reachedBoost += 1; k.withT = nextT("kamla", "07:55"); addLog("kamla", k.withT, "You reached your mother, and your phone is at her home. She's safe with you."); markStep(7); },
    maparea(d) { mapGo(d.v === "delhi" ? { area: "city", city: "delhi" } : { area: "india" }); }, maplayer(d) { S.mapLayer = d.v; }, time(d) { S.ti = +d.v; markStep(8); }, mapback() { mapGo({ area: "india" }); },
    crumb(d) { mapGo(d.v === "state" ? { area: "india", state: d.s } : { area: "india" }); }, mapgo(d) { const r = lastResults[+d.i]; if (r) mapGo(r.go); }, mapclear() {},
    msgs() { S.msgs = !S.msgs; }, wardtab(d) { S.wardTab = d.v; markStep(11); },
    vote(d) { const v = S.noticeVotes[d.i] || { c: 0, d: 0 }; v[d.v] += 1; S.noticeVotes[d.i] = v; toast(d.v === "c" ? "Thanks. Your confirmation counts once." : "Reported. It fades faster now."); },
    join(d) { S.joined[d.i] = true; toast("Your name and skills went to the organiser"); }, allflows() { S.allFlows = !S.allFlows; },
    reqmode(d) { S.requestMode = d.v; S.requested = false; }, request() { S.requested = true; markStep(9); },
    verify(d) { S.radar[d.v] = true; markStep(11); }, take(d) { S.radar.taken = d.id; toast("Dr. Rao, 0.4 km away, goes with you: two people go to every child"); },
    install() { if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; render(); }); } markStep(11); },
    export(d) { download("SH-7731-case-record.json", caseExport(d.id)); toast("A copy without the address was saved"); },
    share() { const url = location.href.split("#")[0], data = { title: "Still Here", text: "Who's still here, who's alone, who's closest.", url };
      if (navigator.share) navigator.share(data).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link copied"), () => toast(url)); else toast(url); },
    reset() { S = defaultState(); save(); go("#alert"); },
    mode(d) { S.mode = d.mode; }, tab(d) { S.tab = d.tab; }, mesh() { S.mesh = !S.mesh; }
  };

  /* ---------- chrome ---------- */
  const NAV = [["sec", "Your people"], ["#home", "Who's here", "house"], ["#cases", "Cases", "users"], ["#find", "Find someone", "search"], ["#report", "Report someone alone", "siren"], ["#with", "Who's with you", "hand-helping"], ["sec", "Around you"], ["#map", "Map", "map-pinned"], ["#help", "Help is coming", "truck"], ["#ward", "Your ward", "building-2"], ["sec", "Tools"], ["#check", "Is this true?", "circle-help"], ["#bot", "WhatsApp bot", "message-circle"], ["#onmyown", "If you're on your own", "life-buoy"], ["#child", "Child alert", "baby"], ["#radar", "On duty", "radar"], ["#kit", "Offline kit", "download"], ["sec", "Prototype"], ["#about", "About", "info"], ["contributor.html", "Contributor portal", "building-2"], ["cockpit.html", "Government view", "landmark"]];
  function chrome() {
    $("#nav").innerHTML = NAV.map(n => n[0] === "sec" ? `<div class="sec">${n[1]}</div>` : `<a href="${n[0]}"${n[0].indexOf("#") ? ` target="_blank" rel="noopener"` : ""}>${I(n[2], 17)}<span>${n[1]}</span></a>`).join("");
    const tabs = [["#home", "People", "house"], ["#cases", "Cases", "users"], ["#map", "Map", "map-pinned"], ["#help", "Help", "truck"]];
    $("#tabbar").innerHTML = tabs.concat([["#more", "More", "layers"]]).map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#mobilenav").innerHTML = tabs.concat([["#kit", "Kit", "download"], ["#more", "More", "layers"]]).map(t => `<a href="${t[0]}">${I(t[2], 20)}${t[1]}</a>`).join("");
    $("#topstatus").innerHTML = `${I("shield-check", 17)}<span class="full">Nobody has vanished since 2:32 pm yesterday</span><span class="short">No new vanishings</span><span class="long fn" style="font-weight:400">· checked every minute</span>`;
    const sh = document.querySelector('[data-action="share"]'); if (sh) sh.innerHTML = I("share-2", 17);
  }
  const STEPS = ["Read the alert, then tap I'm Safe", "See your people: who's here, who's gone, and how it's known", "Open Meera: the people who know her were messaged at 6:52 am", "In Messages, answer as Lata: 1, I'm going", "Answer as Lata: HAVE HER, when she's with Meera", "Video-call Lata, then choose where Meera stays", "Your mother Kamla: I'm Going, then I'm With Her", "Map: search a city, then look at Day 2", "Find someone, report someone alone, or add Aarav to Who's with you", "Help is coming: supplies and what's open", "On duty, your ward and the offline kit", "About, then the government view"];
  function renderThread() {
    const el = $("#thread"); if (!el) return;
    el.classList.toggle("mesh", S.mesh);
    $("#thread-title").textContent = S.mesh ? "Bitchat · Sector 7, towers down" : "Lata's phone · WhatsApp";
    $("#thread-sub").textContent = S.mesh ? "When phone towers are down, messages hop from phone to phone over Bluetooth, 30–100 m each. No server, no phone number." : "What Lata, Meera's nanny, sees: Meera's case in Marathi, with English under each message. Tap a reply below to answer as her.";
    $("#meshtoggle").classList.toggle("on", S.mesh); $("#meshtoggle").setAttribute("aria-pressed", S.mesh ? "true" : "false");
    const s = S.cases.meera.state;
    const msgs = S.mesh ? [{ text: "Mesh · 14 phones in range · 3 hops to the school", kind: "sys" }].concat(RC.meshSample.map(m => ({ from: m.from, text: m.text, t: m.t, kind: "in" }))) : [{ text: "Still Here is a checked government sender. It never asks for money, an OTP or a forward.", kind: "sys" }].concat(S.thread);
    const empty = !S.mesh && !S.thread.length;
    document.querySelectorAll(".msgbtn .badge").forEach(b => { const n = S.thread.filter(m => m.kind === "in").length; b.textContent = n || ""; b.style.display = n ? "" : "none"; });
    document.body.classList.toggle("msgs", !!S.msgs);
    el.innerHTML = empty ? `<div class="msg sys">${esc(msgs[0].text)}</div><div class="empty-thread">Messages for Meera's case appear here.<br><br>Open <a href="#case-meera">Meera's case</a> to see who was messaged.</div>`
      : msgs.map(m => m.kind === "sys" ? `<div class="msg sys">${esc(m.text)}${m.t ? ` · ${clock(m.t)}` : ""}</div>` : `<div class="msg ${m.kind}"><span class="from">${esc(m.from)}</span>${esc(m.text)}${m.gloss ? `<span class="gloss">${esc(m.gloss)}</span>` : ""}<span class="time">${m.t ? clock(m.t) : ""}${S.mesh ? " · by Bluetooth" : ""}</span></div>`).join("");
    el.scrollTop = el.scrollHeight;
    let b = "";
    if (S.mesh) b = `<span class="fn">A preview. Meera's case carries on over WhatsApp when the towers are back.</span>`;
    else if (s === "notified") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-going">Answer as Lata: 1, I'm Going</button>${S.rakeshCant ? "" : `<button class="btn btn-compact" data-action="reply-rakesh-cant">Answer as Rakesh: 2, I Can't</button>`}`;
    else if (s === "claimed") b = `<button class="btn btn-compact btn-prominent" data-action="reply-lata-have">Answer as Lata: HAVE HER</button>`;
    else if (s === "reached") b = `<span class="fn">Waiting for Sunita to see Meera on a video call. Open Meera's case to do it.</span>`;
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
      CH.line(sc, { height: 180, xmin: 0, xmax: 50, ymax: 1, yfmt: y => Math.round(y * 100) + "%", ytitle: "Share of children left alone", xlabel: h => MD.hourLabel(h), marker: MD.NOW, markerLabel: "Now", split: MD.NOW,
        xticks: [{ x: 6, l: "Noon" }, { x: 14, l: "8 pm" }, { x: 26, l: "Day 2" }, { x: 50, l: "Day 3" }],
        series: [{ name: "Safe with someone", color: "var(--st-reached)", area: true, pts: pts.map(p => ({ x: p.h, y: p.share })) }, { name: "Nobody going yet", color: "var(--st-nobody)", pts: pts.map(p => ({ x: p.h, y: p.unclaimedShare })) }] }); }
    const am = $("#avoidmap", root); if (am) M.render(am, { view: "delhi", aria: "Places to avoid in Delhi", mine: WARD.key, labels: [{ k: WARD.key, t: "You", strong: true }].concat(RC.avoid.map(z => ({ ll: [z.lonlat[0], z.lonlat[1] + 0.012], t: z.z }))), zones: RC.avoid.map((z, i) => Object.assign({ id: "z" + i }, z)), hover: k => { if (k.indexOf("zone:") === 0) { const z = RC.avoid[+k.slice(6)]; return z ? `<b>${esc(z.z)}</b><div>${esc(z.why)}</div>` : ""; } const u = MD.byKey[k]; return u ? `<b>${esc(u.name)}</b>` : ""; } });
    const fm = $("#flowmap", root); if (fm) { const ac = RC.communities.filter(c => c.accepting), fl = RC.flows.map((f, i) => Object.assign({ n: i + 1 }, f));
      M.render(fm, { view: "india", edges: false, aria: "Supplies on the way", arcs: fl.map(f => ({ from: f.fromLL, to: f.toLL, n: f.n, toLabel: f.to })), pins: ac.map((c, i) => ({ id: "c" + i, lonlat: c.lonlat, color: "var(--apple-indigo)", r: 5 })),
        labels: [{ ll: [77.2, 28.62], t: "Delhi", strong: true }],
        hover: k => { if (k.indexOf("arc:") === 0) { const f = fl[+k.slice(4)]; return f ? `<b>${f.n}. ${esc(f.what)}</b><div>${esc(f.from)} to ${esc(f.to)}, left at ${clock(f.dep)}</div><div class="src">Shown two hours after it left, with no route or arrival time</div>` : ""; }
          if (k.indexOf("pin:c") === 0) { const c = ac[+k.slice(5)]; return c ? `<b>${esc(c.name)}</b><div>${esc(c.note || "")}</div>` : ""; } return `<b>${esc(k)}</b>`; } }); }
  }
  // Scale the phone frame down so the whole phone fits the window, keeping its proportions
  function fitDevice() {
    const d = document.querySelector(".device"); if (!d) return;
    if (!document.body.classList.contains("phone")) { d.style.transform = ""; d.style.marginBottom = ""; return; }
    const tb = $(".topbar"), avail = $(".main").clientHeight - (tb ? tb.offsetHeight : 0) - 38, h = d.offsetHeight, k = Math.max(0.55, Math.min(1, avail / h));
    d.style.transform = k < 1 ? `scale(${k.toFixed(3)})` : ""; d.style.marginBottom = k < 1 ? `${Math.round((k - 1) * h)}px` : "";
  }
  function render() {
    let route = location.hash || "#alert";
    if (route === "#request") route = "#find";
    if (!V[route]) route = "#alert";
    // Any link opens its screen, even before I'm Safe is tapped, so an evaluator can explore from anywhere
    if (!S.entered && route !== "#alert" && route !== "#onmyown" && route !== "#welcome") { S.entered = true; S.welcomed = true; }
    if (S.mapArea === "delhi") { S.mapArea = "city"; S.mapCity = "delhi"; }
    if (route === "#map" && !S.mapSel && cityOf() === "delhi") S.mapSel = { kind: "ward", key: WARD.key };
    const phone = S.mode === "phone" && window.innerWidth >= 760;
    document.body.classList.toggle("phone", phone);
    document.body.classList.toggle("pre", route === "#alert" || route === "#welcome" || (route === "#onmyown" && !S.entered));
    document.querySelectorAll("#modeseg button").forEach(b => b.classList.toggle("on", b.dataset.mode === S.mode));
    const target = phone ? $("#pview") : $("#view"), other = phone ? $("#view") : $("#pview");
    target.innerHTML = V[route](); other.innerHTML = "";
    $("#view").classList.toggle("wide", route === "#map" || route === "#help");
    if (phone) $("#pview").scrollTop = 0; else $(".main").scrollTop = 0;
    fitDevice();
    document.querySelectorAll(".nav a, .tabbar a, .mobilenav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === route || (route.startsWith("#case") && a.getAttribute("href") === "#cases") || ((route === "#find" || route === "#report") && a.getAttribute("href") === "#cases" && a.closest(".tabbar, .mobilenav"))));
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
