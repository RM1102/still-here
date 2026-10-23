/* Still Here — one model behind every number on both endpoints (audit D2, D3).
   Units: every Indian district, except Delhi, which is split into its 290 real wards.
   Reached share R(h) = 1 − e^(−kR·m·h) and reached-or-claimed Q(h) = 1 − e^(−kQ·m·h), h = hours since the 06:00 broadcast.
   kR and kQ are solved so that India at 07:10 shows 2.14 M reached and 6.8 M claimed of 43.1 M alone.
   A quarter of alone children have nobody in their circle who goes on Day 1 (2-pager appendix A1: 2–32%); they are reached more slowly.
   All numbers are simulated. Only the boundaries are real. */
window.RC = window.RC || {};
(function (RC) {
  const TIMES = [
    { id: "now", label: "Now · 07:10", short: "Now", h: 7 / 6 },
    { id: "noon", label: "12:00", short: "12:00", h: 6 },
    { id: "eve", label: "20:00", short: "20:00", h: 14 },
    { id: "d2", label: "Day 2 · 08:00", short: "Day 2", h: 26 },
    { id: "d3", label: "Day 3 · 08:00", short: "Day 3", h: 50 }
  ];
  // Two groups (Appendix A1, step 4): 1 − F have someone in their circle who goes on Day 1; F have nobody who goes
  // and are reached by the ward's paid anganwadi or ASHA worker, SLOW times more slowly. A third of alone children are under five.
  // Flagging ramp: the carriers' join finishes between 06:00 and 10:00 (RAMP hours), and each case's clock starts when it is flagged.
  // The population curve is the per-case curve averaged over flag times, in closed form.
  const NOW = TIMES[0].h, F = 0.25, SLOW = 20, U5 = 1 / 3, RAMP = 4;
  const perCase = (k, m, x) => (1 - F) * (1 - Math.exp(-k * m * x)) + F * (1 - Math.exp(-k * m * x / SLOW));
  const I1 = (b, h, u) => u - (Math.exp(-b * (h - u)) - Math.exp(-b * h)) / b;   // integral of 1 − e^(−b(h − t)) for t in [0, u]
  const flaggedAt = h => Math.min(Math.max(h, 0), RAMP) / RAMP;
  const two = (k, m, h) => { if (h <= 0) return 0; const u = Math.min(h, RAMP), a = k * m; return ((1 - F) * I1(a, h, u) + F * I1(a / SLOW, h, u)) / RAMP; };
  const u5Left = (k, m, h) => { if (h <= 0) return 0; const u = Math.min(h, RAMP), b = k * m / SLOW; return F * U5 * (Math.exp(-b * (h - u)) - Math.exp(-b * h)) / (b * RAMP); };
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return ((x >>> 0) % 100000) / 100000; }

  const G = RC.GEO, codeToState = {};
  Object.entries(G.india.states).forEach(([n, s]) => codeToState[s.code] = n);
  const base = {}; RC.country.states.forEach(s => base[codeToState[s.n] || s.n] = s);
  const wsum = RC.country.states.reduce((a, s) => a + s.f, 0), wr = RC.country.states.reduce((a, s) => a + s.f * s.r, 0) / wsum;
  const TOTAL = RC.country.flagged;

  const units = [], byKey = {}, byState = {};
  const POP = { "Maharashtra|Mumbai": 0.111, "Maharashtra|Pune": 0.084, "Karnataka|Bengaluru Urban": 0.157, "Tamil Nadu|Chennai": 0.064, "West Bengal|Kolkata": 0.049, "Telangana|Hyderabad": 0.113 };
  // districts
  const dByState = {}; G.india.districts.forEach(d => (dByState[d.s] = dByState[d.s] || []).push(d));
  Object.entries(dByState).forEach(([st, ds]) => {
    const b = base[st]; if (!b) return;
    const A = b.f / wsum * TOTAL, mS = b.r / wr;
    if (st === "Delhi") return; // Delhi is modelled by ward below
    // Big-city districts take their census share of the state (2011); the rest share what is left by a stable pseudo-random weight.
    const fixed = ds.map(d => POP[st + "|" + d.n] || 0), left = 1 - fixed.reduce((a, x) => a + x, 0);
    const ws = ds.map((d, i) => fixed[i] ? 0 : 0.45 + hash(d.n + st)); const tw = ws.reduce((a, x) => a + x, 0) || 1;
    ds.forEach((d, i) => { const u = { key: d.id, kind: "district", state: st, name: d.n, A: A * (fixed[i] || left * ws[i] / tw), m: mS * (0.65 + 0.7 * hash(d.n + "m")), nodata: !!b.nodata }; units.push(u); byKey[u.key] = u; (byState[st] = byState[st] || []).push(u); });
  });
  // Delhi wards
  const dl = base["Delhi"], DLA = dl.f / wsum * TOTAL, DLm = dl.r / wr;
  const OVR = [["Rohini", 2.4], ["Pitampura", 1.7], ["Pitampur", 1.7], ["Shalimar", 1.5], ["Mangol", 0.45], ["Sultanpur", 0.4], ["Bawana", 0.35], ["Budh Vihar", 0.5], ["Kirari", 0.4], ["Narela", 0.55], ["Alipur", 0.6]];
  const wardsG = G.delhi.wards, ww = wardsG.map(w => 0.6 + 0.8 * hash(w.n)), tww = ww.reduce((a, x) => a + x, 0);
  const MYWARD = wardsG.find(w => w.n === "Rohini") || wardsG[0];
  wardsG.forEach((w, i) => {
    const o = OVR.find(([k]) => w.n.indexOf(k) === 0);
    const u = { key: "W" + w.id, kind: "ward", state: "Delhi", name: w.n, A: w === MYWARD ? 1240 : (DLA - 1240) * ww[i] / (tww - ww[wardsG.indexOf(MYWARD)]), m: DLm * (o ? o[1] : 0.6 + 0.8 * hash(w.n + "m")), nodata: w.n.indexOf("Rithala") === 0, mine: w === MYWARD, wid: w.id };
    units.push(u); byKey[u.key] = u; (byState.Delhi = byState.Delhi || []).push(u);
  });

  // City wards: each city's wards replace its district, so state and India totals stay exact. Pune's wards cover a third of its district; the rest stays as one hidden unit.
  const CITIES = {};
  Object.entries(G.cities || {}).forEach(([ck, c]) => {
    const d = byKey[c.did]; if (!d) return;
    units.splice(units.indexOf(d), 1); byState[c.state].splice(byState[c.state].indexOf(d), 1);
    const wts = c.wards.map(w => 0.6 + 0.8 * hash(w.n + ck)), tw = wts.reduce((a, x) => a + x, 0);
    const kids = c.wards.map((w, i) => { const u = { key: w.id, kind: "ward", state: c.state, city: ck, name: w.n, A: d.A * c.share * wts[i] / tw, m: d.m * (0.7 + 0.6 * hash(w.n + "m" + ck)), nodata: d.nodata }; units.push(u); byKey[u.key] = u; byState[c.state].push(u); return u; });
    if (c.share < 1) { const rest = { key: d.key + "-rest", kind: "district", state: c.state, name: d.name + " outside the city", A: d.A * (1 - c.share), m: d.m, nodata: d.nodata, hidden: true }; units.push(rest); byKey[rest.key] = rest; byState[c.state].push(rest); kids.push(rest); }
    byKey[d.key] = { key: d.key, kind: "district", state: c.state, name: d.name, virtual: true, children: kids, city: ck };
    CITIES[ck] = { key: ck, name: c.name, state: c.state, did: d.key, wards: kids.filter(k => k.kind === "ward") };
  });
  CITIES.delhi = { key: "delhi", name: "Delhi", state: "Delhi", did: null, wards: byState.Delhi };

  function solve(target, f) { let lo = 0.0001, hi = 5; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(mid) < target) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  const sumAt = k => units.reduce((a, u) => a + (u.nodata ? 0 : u.A * two(k, u.m, NOW)), 0);
  const kR = solve(RC.country.reached, sumAt), kQ = solve(RC.country.reached + RC.country.claimed, sumAt);

  function at(u, h) {
    if (u.nodata) return { A: u.A, reached: 0, claimed: 0, unclaimed: 0, u5: 0, flagged: 0, nodata: true };
    const R = two(kR, u.m, h), Q = two(kQ, u.m, h), Fl = flaggedAt(h);
    return { A: u.A, flagged: u.A * Fl, reached: u.A * R, claimed: u.A * (Q - R), unclaimed: u.A * Math.max(0, Fl - Q), u5: u.A * u5Left(kQ, u.m, h) };
  }
  function agg(list, h) {
    const o = { A: 0, reached: 0, claimed: 0, unclaimed: 0, u5: 0, known: 0, flagged: 0 };
    list.forEach(u => { const v = at(u, h); o.A += v.A; if (!v.nodata) { o.known += v.A; o.reached += v.reached; o.claimed += v.claimed; o.unclaimed += v.unclaimed; o.u5 += v.u5; o.flagged += v.flagged; } });
    o.share = o.known ? o.reached / o.known : 0; o.claimedShare = o.known ? o.claimed / o.known : 0; o.unclaimedShare = o.known ? o.unclaimed / o.known : 0;
    o.nodata = o.known === 0;
    const prev = h > 1 ? list.reduce((a, u) => a + (u.nodata ? 0 : at(u, h - 1).reached), 0) : 0;
    o.lastHour = o.reached - prev;
    return o;
  }
  const scopes = {
    india: h => agg(units, h),
    delhi: h => agg(byState.Delhi, h),
    state: (st, h) => agg(byState[st] || [], h),
    unit: (key, h) => { const u = byKey[key]; if (!u) return null; return Object.assign(agg(u.virtual ? u.children : [u], h), { unit: u }); },
    city: (ck, h) => CITIES[ck] ? agg(CITIES[ck].wards, h) : null
  };
  function series(fn, step) { const out = []; for (let h = 0; h <= 50; h += step || 1) out.push(Object.assign({ h }, fn(h))); return out; }
  // Uneven steps so the map reads at 07:10 (most areas 3–15%) and on Day 2 (most over 50%).
  const BINS = [{ max: 0.04, c: "var(--q0)", l: "Under 4%" }, { max: 0.08, c: "var(--q1)", l: "4–8%" }, { max: 0.15, c: "var(--q2)", l: "8–15%" }, { max: 0.35, c: "var(--q3)", l: "15–35%" }, { max: 0.65, c: "var(--q4)", l: "35–65%" }, { max: 1.01, c: "var(--q5)", l: "Over 65%" }];
  function color(v) { if (!v || v.nodata) return "var(--nodata)"; return BINS.find(b => v.share < b.max).c; }
  function hourLabel(h) { if (h < 18) { const t = 6 + h; const hh = Math.floor(t), mm = Math.round((t - hh) * 60); return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; } const d = 1 + Math.floor((h + 6) / 24), t = (h + 6) % 24; return `Day ${d} ${String(Math.floor(t)).padStart(2, "0")}:00`; }
  function compact(n) { n = Math.round(n); if (Math.abs(n) >= 1e7) return (n / 1e6).toFixed(1) + " M"; if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + " M"; if (Math.abs(n) >= 1e5) return Math.round(n / 1e3) + " K"; return n.toLocaleString("en-IN"); }
  const pct = x => Math.round(x * 100) + "%";

  RC.Model = { TIMES, NOW, F, RAMP, flaggedAt, perCase: (m, x) => perCase(kR, m, x), units, byKey, byState, CITIES, at, agg, scopes, series, BINS, color, hourLabel, compact, pct, myWard: byKey["W" + MYWARD.id], kR, kQ };
})(window.RC);
