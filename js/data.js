/* Still Here — seed data. All people, addresses and counts are fictional except public statistics on the About screen.
   Nothing is fetched; the prototype runs from index.html with no network. */
window.RC = window.RC || {};
(function (RC) {
  RC.APP = { name: "Still Here", tagline: "Who's still here. Who's alone. Who's closest.", T: "14:32:07", DAY: "Day 1", NOW: "07:10", caseId: "SH-7731" };
  RC.WMON = "https://www.worldmonitor.app/";
  RC.T = RC.APP.T; RC.DAY = RC.APP.DAY; RC.NOW = RC.APP.NOW;

  RC.me = { name: "Sunita Sharma", age: 50, ward: "Rohini Sector 7", city: "Delhi", phone: "+91 98••• •4410", verifiedResidence: true };

  RC.people = [
    { id: "rajesh", name: "Rajesh Sharma", rel: "Husband", age: 54, city: "Delhi", status: "stopped" },
    { id: "aman",   name: "Aman Sharma",   rel: "Son", age: 29, city: "Mumbai", status: "stopped" },
    { id: "priya",  name: "Priya Sharma",  rel: "Daughter-in-law", age: 28, city: "Mumbai", status: "stopped" },
    { id: "meera",  name: "Meera Sharma",  rel: "Granddaughter", age: 3, city: "Mumbai", status: "nodevice", alone: true },
    { id: "kamla",  name: "Kamla Devi",    rel: "Mother", age: 78, city: "Delhi", status: "nodevice", alone: true },
    { id: "vinod",  name: "Vinod Kumar",   rel: "Brother", age: 47, city: "Delhi", status: "stopped" },
    { id: "ritu",   name: "Ritu Kapoor",   rel: "Daughter", age: 25, city: "Bengaluru", status: "active", last: "4 min ago", checkedIn: false },
    { id: "anita",  name: "Anita Verma",   rel: "Neighbour", age: 52, city: "Delhi", status: "active", last: "22 min ago", checkedIn: false },
    { id: "shalini",name: "Shalini Gupta", rel: "Sister", age: 45, city: "Jaipur", status: "active", last: "1 h ago", checkedIn: false },
    { id: "dr-rao", name: "Dr. Rao",       rel: "Family doctor", age: 61, city: "Delhi", status: "active", last: "15 min ago", checkedIn: true },
    { id: "pappu",  name: "Pappu (driver)",rel: "Driver", age: 38, city: "Delhi", status: "stopped" },
    { id: "meena",  name: "Meena (help)",  rel: "Domestic help", age: 41, city: "Delhi", status: "active", last: "8 min ago", checkedIn: true }
  ];

  RC.cases = {
    meera: {
      id: "meera", name: "Meera Sharma", age: 3, ageBand: "under 5",
      address: "Flat 402, Sunrise Towers, Andheri East, Mumbai", ward: "K/East, Mumbai", lonlat: [72.87, 19.12],
      why: "Both resident adults (Aman, Priya) stopped at 14:32:07. Child registered at this address (ration card, Little Steps daycare). No adult phone has been active at the address since 14:32.",
      distanceFromMe: "1,410 km",
      circle: [
        { id: "lata",   name: "Lata Pawar",  rel: "Nanny (weekday)", dist: 1.8, last: "2 min ago", via: "WhatsApp" },
        { id: "rakesh", name: "Rakesh Mehta", rel: "Uncle (Aman's cousin)", dist: 4.1, last: "10 min ago", via: "WhatsApp" },
        { id: "farah",  name: "Farah Khan",   rel: "Parent, Little Steps daycare", dist: 0.6, last: "31 min ago", via: "SMS" },
        { id: "nair",   name: "Dr. Nair",     rel: "Paediatrician", dist: 3.0, last: "6 min ago", via: "App" },
        { id: "suresh", name: "Suresh (watchman)", rel: "Sunrise Towers security", dist: 0.0, last: "no device", via: "Missed call (society office)" },
        { id: "society",name: "Sunrise Towers residents", rel: "Society group · 31 of 58 active", dist: 0.0, last: "live", via: "WhatsApp group" },
        { id: "neha",   name: "Neha Desai",   rel: "Priya's sister", dist: 2.2, last: "stopped at 14:32", via: "—", stopped: true }
      ],
      carePoint: { name: "Govt Primary School, Marol", dist: "400 m", slots: 9, police: true }
    },
    kamla: {
      id: "kamla", name: "Kamla Devi", age: 78, ageBand: "over 75",
      address: "C-7/112, Rohini Sector 7, Delhi", ward: "Rohini Sector 7", lonlat: [77.11, 28.72],
      why: "The other adult at the address (Vinod) stopped at 14:32:07. Kamla has no device. Pension and ABHA records place her here.",
      distanceFromMe: "3.1 km", youAreNearest: true
    }
  };

  // India by state: f = flagged alone (millions), r = share confirmed reached, c = share claimed-unconfirmed
  RC.country = {
    name: "India", flagged: 43100000, claimed: 6800000, reached: 2140000, lastHour: 41200, silencesSinceT: 0,
    states: [
      { n: "UP", f: 7.9, r: 0.31, c: 0.12 }, { n: "BR", f: 4.6, r: 0.09, c: 0.08 }, { n: "MH", f: 3.6, r: 0.42, c: 0.15 },
      { n: "WB", f: 3.0, r: 0.21, c: 0.10 }, { n: "MP", f: 2.9, r: 0.17, c: 0.09 }, { n: "RJ", f: 2.7, r: 0.22, c: 0.12 },
      { n: "TN", f: 2.1, r: 0.46, c: 0.14 }, { n: "KA", f: 1.9, r: 0.40, c: 0.16 }, { n: "GJ", f: 1.9, r: 0.38, c: 0.13 },
      { n: "AP", f: 1.5, r: 0.33, c: 0.12 }, { n: "OD", f: 1.4, r: 0.14, c: 0.07 }, { n: "TS", f: 1.1, r: 0.37, c: 0.15 },
      { n: "KL", f: 0.9, r: 0.58, c: 0.12 }, { n: "JH", f: 1.3, r: 0.08, c: 0.06 }, { n: "AS", f: 1.2, r: 0.12, c: 0.05 },
      { n: "PB", f: 0.8, r: 0.35, c: 0.14 }, { n: "CG", f: 0.9, r: 0.11, c: 0.07 }, { n: "HR", f: 0.8, r: 0.36, c: 0.15 },
      { n: "DL", f: 0.5, r: 0.44, c: 0.16 }, { n: "JK", f: 0.4, r: 0.19, c: 0.09 }, { n: "LA", f: 0.01, r: 0.10, c: 0.05 },
      { n: "UK", f: 0.3, r: 0.29, c: 0.11 }, { n: "HP", f: 0.2, r: 0.41, c: 0.14 }, { n: "GA", f: 0.04, r: 0.61, c: 0.10 },
      { n: "AR", f: 0.05, r: 0.06, c: 0.04 }, { n: "MN", f: 0.09, r: 0.12, c: 0.06 }, { n: "ML", f: 0.11, r: 0.10, c: 0.05 },
      { n: "MZ", f: 0.03, r: 0.22, c: 0.08 }, { n: "NL", f: 0.06, r: 0.09, c: 0.05 }, { n: "SK", f: 0.02, r: 0.30, c: 0.10 },
      { n: "TR", f: 0.12, r: 0.15, c: 0.07 }, { n: "CH", f: 0.03, r: 0.47, c: 0.12 }, { n: "PY", f: 0.03, r: 0.44, c: 0.12 },
      { n: "AN", f: 0.01, r: 0.00, c: 0.00, nodata: true }, { n: "LD", f: 0.002, r: 0.00, c: 0.00, nodata: true }, { n: "DN", f: 0.03, r: 0.28, c: 0.10 }
    ]
  };

  // World: share confirmed reached per country (simulated); countries not listed have no data yet
  RC.world = {
    reached: { IND: 0.05, CHN: 0.06, USA: 0.11, GBR: 0.14, DEU: 0.12, FRA: 0.10, JPN: 0.16, KOR: 0.18, BRA: 0.04, NGA: 0.01, PAK: 0.02, BGD: 0.03, IDN: 0.03, RUS: 0.05, MEX: 0.04, ZAF: 0.03, EGY: 0.02, TUR: 0.06, IRN: 0.02, AUS: 0.15, CAN: 0.12, SAU: 0.07, ARE: 0.19, ITA: 0.09, ESP: 0.10, POL: 0.08, UKR: 0.03, ETH: 0.01, KEN: 0.02, ARG: 0.05, SGP: 0.22, NZL: 0.17, SWE: 0.15, NOR: 0.16, FIN: 0.15, DNK: 0.15, NLD: 0.14, CHE: 0.15, ISR: 0.13, VNM: 0.04, THA: 0.06, PHL: 0.03, MYS: 0.08, LKA: 0.04, NPL: 0.02 },
    aid: [ { from: "SGP", to: "IDN", what: "Medical teams · 12 aircraft", t: "06:40" }, { from: "ARE", to: "IND", what: "Water units · 40 t", t: "06:55" }, { from: "KOR", to: "VNM", what: "Grid engineers · 60", t: "07:00" }, { from: "DEU", to: "UKR", what: "Fuel · 18 trucks", t: "07:05" } ],
    labels: ["IND", "CHN", "USA", "BRA", "RUS", "AUS", "NGA", "IDN", "DEU", "JPN", "SAU", "ARG", "CAN", "ZAF", "EGY"]
  };

  RC.services = [
    { k: "Power", v: "71% of Rohini Sec 7 restored", src: "BSES grid telemetry", t: "06:55", ok: true },
    { k: "Water", v: "Low pressure. Haiderpur plant staffed 6 of 11 operators", src: "Delhi Jal Board roster roll call", t: "06:40", ok: false },
    { k: "Metro", v: "Red Line running, 20-min headway", src: "DMRC", t: "06:30", ok: true },
    { k: "Fuel", v: "3 of 7 pumps in ward staffed", src: "IOCL dealer roll call", t: "06:20", ok: false },
    { k: "Mobile network", v: "Tower load 61% · diesel reserve 38 h", src: "Carrier NOC", t: "07:00", ok: true }
  ];

  // Help is coming: departures only, two-hour lag, never a route or an arrival time
  RC.flows = [
    { ic: "🚆", what: "Supply train · 40 t grain and water", from: "Mumbai Central", fromLL: [72.82, 18.97], to: "Delhi", toLL: [77.22, 28.64], dep: "06:10", shownAt: "08:10", kind: "rail" },
    { ic: "🚚", what: "FCI stock release · 1,200 t", from: "Narela godown", fromLL: [77.09, 28.84], to: "NW Delhi fair price shops", toLL: [77.12, 28.70], dep: "07:00", shownAt: "09:00", kind: "road" },
    { ic: "🚛", what: "Tanker fleet · 42 units", from: "Haiderpur plant", fromLL: [77.14, 28.72], to: "Rohini, Mangolpuri water points", toLL: [77.07, 28.69], dep: "07:30", shownAt: "09:30", kind: "road" },
    { ic: "✈️", what: "Medical team · 60 doctors, 4 t supplies", from: "Hyderabad", fromLL: [78.49, 17.39], to: "Patna", toLL: [85.14, 25.59], dep: "05:50", shownAt: "07:50", kind: "air" },
    { ic: "🚆", what: "Grid crews · 120 engineers", from: "Chennai", fromLL: [80.27, 13.08], to: "Bhubaneswar", toLL: [85.82, 20.30], dep: "06:30", shownAt: "08:30", kind: "rail" },
    { ic: "🚢", what: "Diesel for towers · 2,000 kL", from: "Kochi", fromLL: [76.27, 9.93], to: "Mangaluru", toLL: [74.86, 12.91], dep: "05:00", shownAt: "07:00", kind: "sea" }
  ];

  RC.restoration = [
    { k: "Power restored", v: 61, unit: "% of wards, Delhi" }, { k: "Water points open", v: 44, unit: "% of planned" },
    { k: "Fair price shops open", v: 49, unit: "% (dealer present)" }, { k: "Hospitals with ER open", v: 72, unit: "% in Delhi" },
    { k: "Metro lines running", v: 3, unit: "of 9" }, { k: "Towers on diesel", v: 27, unit: "% of sites" }
  ];

  RC.communities = [
    { name: "Vapi industrial commune (Gujarat)", members: "340 · accepting", organiser: "Vapi Industries Assoc. (verified)", link: "App", accepting: true, note: "Restarting 3 pharma units. Food and lodging for electricians, fitters, nurses.", lonlat: [72.93, 20.37], need: "electricians, fitters, nurses" },
    { name: "IIT Delhi hostel block", members: "210 · accepting", organiser: "Dean of Students office (verified)", link: "App", accepting: true, note: "Mess running. Taking in families from Hauz Khas.", lonlat: [77.19, 28.55], need: "families, cooks" },
    { name: "Rohini Sec 7 volunteers", members: "12 active", organiser: "Dr. Rao (verified)", link: "WhatsApp", accepting: true, note: "Need 2 people with a car for the water point from 08:00.", lonlat: [77.11, 28.71], need: "drivers" },
    { name: "C-7 block residents", members: "19 of 41 active", organiser: "Anita Verma (verified)", link: "WhatsApp", accepting: false, note: "", lonlat: [77.11, 28.72] },
    { name: "Tiruppur knitwear cluster", members: "1,100 · accepting", organiser: "TEA (verified)", link: "App", accepting: true, note: "Two mills running. Food for 400 more. Need power-loom hands.", lonlat: [77.34, 11.11], need: "mill hands" }
  ];
  RC.groups = RC.communities;

  // Open places: worship and public spaces that are open and have a verified adult on duty
  RC.places = [
    { name: "Gurudwara Sector 7", kind: "worship", open: true, staff: "langar running · 6 sewadars", dist: "0.9 km", lonlat: [77.115, 28.715], hub: "Project NOMAD on local Wi-Fi" },
    { name: "Shiv Mandir, Sec 8", kind: "worship", open: true, staff: "open · 2 on duty", dist: "1.4 km", lonlat: [77.12, 28.70] },
    { name: "Jama Masjid, Rohini", kind: "worship", open: true, staff: "open · water · 4 on duty", dist: "2.1 km", lonlat: [77.10, 28.73] },
    { name: "Govt Sr Sec School, Sec 7", kind: "public", open: true, staff: "care point · police present · 9 places", dist: "0.7 km", lonlat: [77.11, 28.71], hub: "Internet-in-a-Box on local Wi-Fi" },
    { name: "Community hall, Sec 11", kind: "public", open: false, staff: "no staff signal", dist: "2.6 km", lonlat: [77.09, 28.72] },
    { name: "Japanese Park", kind: "public", open: true, staff: "open space · tanker 08:00", dist: "1.8 km", lonlat: [77.10, 28.71] }
  ];

  RC.notices = [
    { from: "NDMA · Government of India", t: "06:00", text: "At 14:32:07 yesterday, half of all living people vanished. No further vanishings have been recorded since. Stay where you are unless someone needs you. Open Still Here.", official: true, confirms: null },
    { from: "Delhi Disaster Management Authority", t: "06:45", text: "Water point: Govt Sr Sec School, Sector 7 (police present). 2,000 L tanker from 08:00.", official: true, confirms: 14, denies: 0, confirmedAt: "07:02" },
    { from: "Delhi Jal Board", t: "06:40", text: "Tap water in Rohini is safe to drink. Pressure will be low until Haiderpur is fully staffed.", official: true, confirms: 41, denies: 3, confirmedAt: "07:05" },
    { from: "BSES Rajdhani", t: "06:55", text: "Rohini Sec 7, 8, 11: supply restored. Sec 3: by 10:00.", official: true, confirms: 88, denies: 1, confirmedAt: "07:08" },
    { from: "Delhi Police", t: "06:10", text: "Rohini police station is open. 14 of 31 staff present. Emergency: 112.", official: true, confirms: 9, denies: 0, confirmedAt: "06:50" }
  ];

  RC.avoid = [
    { z: "Bawana chemical area", why: "No operators at a chlorine store. Stay 1 km away.", lonlat: [77.03, 28.80], km: 1 },
    { z: "Yamuna east bank", why: "Embankment not yet inspected after tree loss. Keep off it.", lonlat: [77.28, 28.60], km: 1.5 },
    { z: "Rithala", why: "No phone network. Information here may be out of date.", lonlat: [77.10, 28.72], km: 1 }
  ];

  RC.authorities = [
    { name: "Rohini Police Station", staff: "14 / 31 present", dist: "1.2 km", status: "open", phone: "112" },
    { name: "Dr. BSA Hospital", staff: "46% staff present · ER open", dist: "2.4 km", status: "open", phone: "102" },
    { name: "Fire Station, Rohini", staff: "9 / 22 present", dist: "1.9 km", status: "open", phone: "101" },
    { name: "Child Helpline", staff: "merged with 112 · 1098 live", dist: "—", status: "open", phone: "1098" },
    { name: "ASHA worker, Sec 7 (Kiran)", staff: "active 12 min ago", dist: "0.8 km", status: "open", phone: "call via app" }
  ];

  RC.radar = {
    within1km: { under5: 3, child: 5, elderly: 7, claimed: 9, unclaimed: 6 },
    cases: [
      { id: "r1", ageBand: "under 5", hoursSinceT: 16.6, circleResponse: "none", address: "B-3/88, Sec 7 (shown after verification)", care: "Govt Sr Sec School Sec 7 (police present) · 9 slots" },
      { id: "r2", ageBand: "over 75", hoursSinceT: 16.6, circleResponse: "none", address: "C-9/14, Sec 7", care: "Dr. BSA Hospital · geriatric ward" },
      { id: "r3", ageBand: "6–12", hoursSinceT: 16.6, circleResponse: "1 notified, 0 claimed", address: "C-2/61, Sec 7", care: "Govt Sr Sec School Sec 7" }
    ]
  };

  // Offline kit: real tools with their official sources (FEATURES.md). Nothing is mirrored here.
  RC.kit = [
    { id: "bitchat", name: "Bitchat", icon: "bluetooth", tile: "blue", size: "about 12 MB",
      what: "Messages hop from phone to phone over Bluetooth, up to seven hops, with no towers, servers, accounts or phone numbers. Private messages are encrypted.",
      why: "If the towers go, this is how a block keeps talking. It only works if enough phones nearby have it, so install it today.",
      how: "Install it from the App Store or Google Play and open it. You're on the mesh.",
      links: [{ l: "App Store", u: "https://apps.apple.com/us/app/bitchat-mesh/id6748219622" }, { l: "Google Play", u: "https://play.google.com/store/apps/details?id=com.bitchat.droid" }], src: "permissionlesstech/bitchat, public domain" },
    { id: "briar", name: "Briar", icon: "message-circle", tile: "green", size: "about 25 MB",
      what: "A messenger that syncs directly between phones over Bluetooth or Wi-Fi when the internet is down, and over Tor when it's up.",
      why: "It runs on Android phones without an app store: the APK comes straight from the Briar project.",
      how: "Get it from Google Play, F-Droid, or the APK on the Briar website.",
      links: [{ l: "Download APK", u: "https://briarproject.org/apk" }, { l: "briarproject.org", u: "https://briarproject.org/" }], src: "Briar project" },
    { id: "maps", name: "Organic Maps", icon: "map-pin", tile: "teal", size: "about 120 MB for Delhi",
      what: "Offline street maps and turn-by-turn routes built on OpenStreetMap.",
      why: "Our maps show who has been reached. This one gets you to the care point when there's no signal.",
      how: "Install it, download the Delhi region, search a place, then tap Route.",
      links: [{ l: "organicmaps.app", u: "https://organicmaps.app/" }], src: "organicmaps/organicmaps" },
    { id: "kiwix", name: "Kiwix", icon: "book-open", tile: "orange", size: "from 50 MB",
      what: "Offline Wikipedia and medical references, in your browser or as an app.",
      why: "Half the doctors are gone. Whoever is holding a dehydrated toddler needs the page now, not a search.",
      how: "Open the Kiwix web app, download the medicine pack once, and it works offline.",
      links: [{ l: "Kiwix web app", u: "https://pwa.kiwix.org/" }, { l: "Library", u: "https://library.kiwix.org/" }], src: "kiwix/kiwix-js" },
    { id: "lora", name: "Meshtastic", icon: "radio-tower", tile: "indigo", size: "needs a radio",
      what: "Low-cost LoRa radios that send text for kilometres without any phone network.",
      why: "For care points and control rooms that must stay in touch even if every phone fails.",
      how: "Pair a Meshtastic radio with a phone, or with a laptop through the web client.",
      links: [{ l: "Web client", u: "https://client.meshtastic.org/" }, { l: "meshtastic.org", u: "https://meshtastic.org/" }], src: "meshtastic/firmware" }
  ];
  RC.hubs = [
    { id: "nomad", name: "Project NOMAD", icon: "hard-drive", tile: "ink",
      what: "A laptop or mini-PC that serves offline Wikipedia, medical books, Khan Academy courses and maps over its own Wi-Fi.",
      why: "One box at a school or gurudwara serves a whole ward when the towers are down.",
      how: "Install it on any Debian-based computer. People join its Wi-Fi and open a browser.",
      links: [{ l: "Project NOMAD on GitHub", u: "https://github.com/Crosstalk-Solutions/project-nomad" }], src: "Crosstalk-Solutions/project-nomad, Apache-2.0" },
    { id: "iiab", name: "Internet-in-a-Box", icon: "wifi", tile: "teal",
      what: "The same idea on a Raspberry Pi: a learning hotspot with Wikipedia, Khan Academy videos and OpenStreetMap.",
      why: "Smaller and cheaper, for a single care point.",
      how: "Flash the ready-made image onto a microSD card.",
      links: [{ l: "internet-in-a-box.org", u: "https://internet-in-a-box.org/" }], src: "iiab/iiab, GPL-2.0" }
  ];
  RC.kitPages = [
    { t: "Dehydration in a child under five", s: "Signs: no tears, dry mouth, sunken eyes, fewer than three wet nappies a day, drowsy. Give oral rehydration solution: one litre of safe water, six level teaspoons of sugar, half a level teaspoon of salt. Small sips every few minutes. If the child cannot drink or is limp, go to the nearest care point now." },
    { t: "Insulin without a fridge", s: "Unopened insulin keeps for about four weeks at room temperature below 25 °C. Keep it in a clay pot with water, or wrapped in a damp cloth in shade. Never freeze it. Do not stop insulin; ration food instead of the dose if supply is short, and get to a care point." },
    { t: "Making water safe", s: "If it is cloudy, let it settle and pour through a clean cloth. Boil for one minute at a rolling boil, or add household bleach (unscented, 5%): two drops per litre, wait 30 minutes. Store covered." },
    { t: "CPR, adult", s: "Check response, call 112, place the heel of your hand on the centre of the chest, push hard and fast 100–120 a minute, 5 cm deep, let the chest rise fully. Keep going until help arrives or the person breathes." },
    { t: "Moving a bedridden adult", s: "Do not move alone if you can avoid it. Log-roll onto a blanket, two people lift at the hips and shoulders, keep the head supported. Bring medicines, the ABHA number and any oxygen with the person." }
  ];

  RC.meshSample = [
    { from: "Anita (2 hops)", text: "Water tanker at the school now. Queue is short.", t: "08:02" },
    { from: "Kiran ASHA (1 hop)", text: "C-9/14 reached. Savitri ji is fine, needs BP meds.", t: "08:11" },
    { from: "Dr. Rao (3 hops)", text: "Anyone with a car near Sec 7 gate? Two oxygen cylinders to move.", t: "08:15" }
  ];


  /* ---------- Vocabulary and help (audit B1–B14, D1) ---------- */
  RC.TERMS = {
    vanish: "New vanishings since the Snap", alone: "People with no adult left", reached: "Reached and safe",
    claimed: "Someone on the way", unclaimed: "Nobody yet", nocircle: "Small children nobody is coming for",
    urgent: "Urgent problems not yet handled", short: "Essential sites short of staff"
  };
  RC.HELP = {
    vanish: { t: "New vanishings since the Snap", b: "Phones, watches and accounts that went silent after 14:32:07 yesterday while their network stayed up. At the Snap itself 3.8 billion went silent in the same second. Zero since then means it has not happened again. This is the only evidence anyone has that it was a one-time event.", s: "Carrier signalling and platform presence, checked every minute" },
    alone: { t: "People with no adult left", b: "Children and care-dependent adults whose every resident adult's phone stopped at 14:32:07. The household comes from family mobile plans, where phones sleep at night, and ration cards.", s: "Carriers and the ration card database (PDS)" },
    reached: { t: "Reached and safe", b: "Someone replied \"have her\" or \"I'm with him\", and their phone is physically at the address. A tap alone never counts, so this number is hard to inflate.", s: "Replies by WhatsApp, SMS, missed call or app, plus device location" },
    claimed: { t: "Someone on the way", b: "A person from their circle has said they are going. If they don't confirm by their own arrival time plus an hour, the case reopens and goes out again.", s: "Replies to the case message" },
    unclaimed: { t: "Nobody yet", b: "Flagged as alone, but nobody has said they're going. After two hours the case goes to the police and child helpline with the address.", s: "Case records" },
    nocircle: { t: "Small children nobody is coming for", b: "Under five, and nobody in their circle has answered within two hours. About 4% of alone people have no relative, neighbour or carer left who can reach them; these addresses go straight to the government list. A third of them are under five.", s: "Circle routing and the two-hour escalation" },
    circle: { t: "Circle", b: "The people who already know someone: family, neighbours, the nanny, the daycare, the doctor. Found in the contacts of the parents' phones, within 5 km. With four of them alive in the same city, the chance all are gone is 6%.", s: "Contacts on the vanished phones" },
    urgent: { t: "Urgent problems not yet handled", b: "Problems where lives are at risk within hours. Each has a suggested action. The count drops when someone acts on it.", s: "Staff roll calls, satellite passes, official reports" },
    short: { t: "Essential sites short of staff", b: "Hospitals, water plants, substations, police stations and prisons where the staff roll call shows less than half the usual staff. The roll call uses the same phone signal: whose phone is at the site.", s: "Employer rosters matched to device location" },
    stopped: { t: "Stopped at 14:32:07", b: "This person's phone went silent at the instant of the Snap while the network stayed up. That is how we know they are gone, not just not answering.", s: "Carrier signalling" },
    nodevice: { t: "No device", b: "This person has no phone of their own, so their status comes from the household: who else lives there and whether those phones are active.", s: "Ration card, school and pension records" },
    active: { t: "Active", b: "Their phone has been used recently. They are here.", s: "Carrier and platform presence" },
    projection: { t: "Projection", b: "Times after now are projected from the rate at which people are being reached in each area right now. They show where this is heading if nothing changes. Only \"Now\" is current.", s: "The same model as every other number" },
    simulated: { t: "Simulated data", b: "Every person, address and count in this prototype is made up, and every number comes from one model so they add up. The maps are real: Natural Earth for the world and India's outline, india-maps-data for districts, and Delhi's 290 ward boundaries from datameet.", s: "Prototype" },
    govview: { t: "Government view · restricted", b: "A separate system on a separate network with its own login. The public app never links to it. It holds addresses, routes and staff lists that would help a raider.", s: "Design rule" },
    scale: { t: "How to read the map", b: "Each area is coloured by the share of its alone people who have been reached and confirmed safe. Grey means no connectivity, never \"bad\". Hover for numbers, click for detail.", s: "The model" },
    mirror: { t: "Public mirror", b: "When on, anyone can see how supplies are split against where people are. Switching it off is itself recorded and shown publicly.", s: "Allocation ledger" },
    openzone: { t: "Open zones", b: "Places where every occupant vanished and stock is ownerless. The district can declare them open for taking food and water under Section 65 of the Disaster Management Act 2005, with police at the gate. It gives the raiding instinct a legal target away from homes.", s: "DM Act 2005, s.65" },
    register: { t: "Asked, not conscripted", b: "Survivors on professional registers (doctors, nurses, plant operators) get a message with the site, the shift and what it earns. They choose.", s: "National Medical Commission and nursing registers, employer rosters" },
    triage: { t: "Triage order", b: "When there are more cases than teams, who is reached first. Set by the district magistrate and the chief medical officer only; every change is logged with their name.", s: "Restricted" }
  };

  /* ---------- Government view (audit C1–C3, C11) ---------- */
  RC.gov = {
    persona: { org: "Delhi Disaster Management Authority", role: "Control room" },
    queue: [
      { id: "tihar", scope: "delhi", sev: "urgent", t: "06:12", title: "Tihar Jail is below safe guard strength", where: "Tihar, West Delhi", lonlat: [77.10, 28.63],
        what: "118 of 310 guards are at the jail (38%).", why: "Below half strength the perimeter can't be held. About 14,000 people are held there.",
        act: { label: "Send 2 armed police companies", done: "Requested 07:12. Delhi Armed Police 3rd Battalion confirmed 07:20, arriving 08:00." },
        alt: { label: "Order a lockdown", done: "Lockdown ordered 07:12. Cells sealed, yard closed." }, src: "Prison staff roll call, 05:30–07:10" },
      { id: "armoury", scope: "delhi", sev: "urgent", t: "05:50", title: "Rohini police armoury has nobody guarding it", where: "Sector 14, Rohini", lonlat: [77.09, 28.74],
        what: "No staff phone has been at the armoury since 14:32 yesterday.", why: "Weapons are stored on site. An unguarded armoury is the fastest way for raiders to arm.",
        act: { label: "Send a team to secure it", done: "Rohini police team 1 sent 07:13, arriving 07:35." },
        alt: { label: "Move the weapons out", done: "Transfer to Kingsway Camp approved, convoy 09:00." }, src: "Police staff roll call" },
      { id: "children", scope: "delhi", sev: "urgent", t: "07:10", dyn: "children", title: "Small children nobody is coming for", where: "Across Delhi, worst in the north-west", lonlat: [77.05, 28.70],
        what: "", why: "They are under five and nobody in their circle has answered in two hours. Their addresses are known. A toddler has two or three days without water.",
        act: { label: "Send paired teams to the five worst wards", done: "Police and ASHA pairs sent 07:14 to the five worst wards." },
        alt: { label: "See the list by ward", open: "wards" }, src: "Two-hour escalation from circle routing" },
      { id: "water", scope: "delhi", sev: "high", t: "06:40", title: "Haiderpur water plant is short of operators", where: "Haiderpur, North West Delhi", lonlat: [77.14, 28.72],
        what: "6 of 11 operators are on site.", why: "Below 5, output drops and about 1.2 million people in north and west Delhi lose water pressure.",
        act: { label: "Ask 4 operators from the register", done: "4 operators asked 07:15. 2 accepted, arriving 08:30." }, src: "Delhi Jal Board roster roll call" },
      { id: "bawana", scope: "delhi", sev: "high", t: "06:30", title: "Bawana chemical units have nobody on site", where: "Bawana industrial area", lonlat: [77.03, 28.80],
        what: "3 units show no operator phone. Unit 7 stores chlorine.", why: "A chlorine leak would reach homes within 1 km, about 40,000 people.",
        act: { label: "Send the fire service hazmat team", done: "Hazmat team from Rohini fire station sent 07:16, arriving 07:50." },
        alt: { label: "Warn residents within 1 km", done: "Public warning sent to 3 wards at 07:16: stay indoors, windows shut." }, src: "Factory staff roll call" },
      { id: "power", scope: "delhi", sev: "high", t: "06:40", title: "Badarpur substation has 2 of 9 operators", where: "Badarpur, South East Delhi", lonlat: [77.30, 28.50],
        what: "The grid operator advises planned power cuts in South Delhi, 08:00–12:00.", why: "Planned cuts now prevent an uncontrolled failure later that would take hospitals off the grid.",
        act: { label: "Approve the planned cuts", done: "Cuts approved 07:17. Public notice sent to 14 wards. Hospitals excluded." },
        alt: { label: "Ask 3 engineers from the register", done: "3 engineers asked 07:17. 1 accepted." }, src: "Grid operator (DISCOM) staff roll call" },
      { id: "yamuna", scope: "delhi", sev: "watch", t: "06:45", title: "Yamuna embankment unchecked after tree loss", where: "Yamuna east bank", lonlat: [77.28, 28.60],
        what: "A satellite pass at 06:45 shows 40% of trees gone along the east bank.", why: "Tree roots held the embankment. Not urgent unless it rains, but nobody has inspected it.",
        act: { label: "Send an engineer to inspect", done: "Irrigation department engineer assigned, inspection 10:00." }, src: "Satellite pass 06:45" },
      { id: "tarapur", scope: "india", sev: "urgent", t: "04:30", title: "Tarapur nuclear plant is shutting down with 4 of 14 operators", where: "Tarapur, Maharashtra", lonlat: [72.66, 19.83], state: "Maharashtra",
        what: "A safe shutdown started 04:10 and is on track. A satellite pass at 05:30 shows the heat falling.", why: "If staff drop further the shutdown can't be completed safely.",
        act: { label: "Fly in 6 operators from Kudankulam", done: "Air Force flight approved 07:18, operators arriving 13:00." }, src: "Plant staff roll call, satellite thermal pass" },
      { id: "mumbai", scope: "india", sev: "high", t: "06:20", title: "Mumbai may flood at high tide, 13:40", where: "Mithi river, Mumbai", lonlat: [72.86, 19.07], state: "Maharashtra",
        what: "A satellite pass at 06:20 shows 48% of the mangroves gone along the Mithi river.", why: "The mangroves soaked up the tide. Kurla, Sion and BKC lie below the high-tide line.",
        act: { label: "Warn the 6 low-lying wards now", done: "Flood warning sent 07:19 to 6 Mumbai wards: move to upper floors before 13:00." }, src: "Satellite pass 06:20, tide tables" },
      { id: "bihar", scope: "india", sev: "high", t: "07:00", dyn: "slowest", title: "Bihar is being reached slowest", where: "Bihar", lonlat: [85.3, 25.6], state: "Bihar",
        what: "", why: "It has the second-largest number of people alone and the fewest responders per head.",
        act: { label: "Move 40 response teams from Kerala", done: "40 teams reassigned 07:20, arriving by air from 11:00." }, src: "The model" }
    ],
    updates: [
      { t: "07:08", from: "BSES Rajdhani", what: "Electricity", text: "Power is back in Rohini Sectors 7, 8 and 11." },
      { t: "07:05", from: "Delhi Jal Board", what: "Water", text: "Haiderpur plant at 55% output. Two operators coming from Wazirabad." },
      { t: "07:02", from: "Delhi Disaster Management Authority", what: "Relief", text: "Water point at the Sector 7 school confirmed by 14 people on site." },
      { t: "06:55", from: "National Disaster Management Authority", what: "Alerts", text: "Emergency alert #3 reached 71% of phones in North West Delhi." },
      { t: "06:50", from: "Delhi Police", what: "Police", text: "Rohini police station has 14 of 31 staff. Team sent to the armoury." },
      { t: "06:45", from: "Satellite pass", what: "Environment", text: "Night lights in North West Delhi at 61% of normal: power is coming back unevenly." }
    ],
    sites: [
      { site: "Haiderpur water plant", does: "Water for north and west Delhi", present: 6, total: 11, lonlat: [77.14, 28.72] },
      { site: "Badarpur substation", does: "Power for South Delhi", present: 2, total: 9, lonlat: [77.30, 28.50] },
      { site: "Tihar Jail", does: "Prison, ~14,000 held", present: 118, total: 310, lonlat: [77.10, 28.63] },
      { site: "Bawana chemical units", does: "Chlorine storage", present: 38, total: 410, lonlat: [77.03, 28.80] },
      { site: "Dr. BSA Hospital", does: "Emergency and ICU, Rohini", present: 412, total: 896, lonlat: [77.12, 28.70] },
      { site: "Rohini police station", does: "Police, north-west", present: 14, total: 31, lonlat: [77.11, 28.71] },
      { site: "Fair price shops, North West", does: "Rations", present: 2214, total: 4480, lonlat: [77.10, 28.70] }
    ],
    people: [
      { role: "Doctors", reg: "National Medical Commission register", alive: 1120, of: 2260, asked: 540, came: 211 },
      { role: "Nurses", reg: "Delhi Nursing Council register", alive: 2410, of: 4830, asked: 900, came: 388 },
      { role: "Water plant operators", reg: "Delhi Jal Board roster", alive: 61, of: 122, asked: 30, came: 12 },
      { role: "Electrical engineers", reg: "Power company rosters", alive: 290, of: 580, asked: 120, came: 77 },
      { role: "Pharmacists", reg: "Pharmacy Council register", alive: 840, of: 1690, asked: 200, came: 96 }
    ],
    supplies: [
      { what: "Grain and water, 40 t", how: "Train", from: "Mumbai Central", to: "Delhi", dep: "06:10", eta: "Day 2 02:00", route: "Western Railway via Vadodara and Kota", fromLL: [72.82, 18.97], toLL: [77.22, 28.64] },
      { what: "Grain from Food Corporation stock, 1,200 t", how: "Trucks", from: "Narela godown", to: "North West Delhi ration shops", dep: "07:00", eta: "10:30", route: "NH-44, GT Karnal Road", fromLL: [77.09, 28.84], toLL: [77.12, 28.70] },
      { what: "Water tankers, 42", how: "Tankers", from: "Haiderpur plant", to: "Rohini and Mangolpuri water points", dep: "07:30", eta: "08:15", route: "Outer Ring Road", fromLL: [77.14, 28.72], toLL: [77.07, 28.69] },
      { what: "60 doctors and 4 t of medicine", how: "Air Force", from: "Hyderabad", to: "Patna", dep: "05:50", eta: "09:40", route: "C-17 flight", fromLL: [78.49, 17.39], toLL: [85.14, 25.59] },
      { what: "120 power engineers", how: "Train", from: "Chennai", to: "Bhubaneswar", dep: "06:30", eta: "Day 2 01:00", route: "Coromandel line", fromLL: [80.27, 13.08], toLL: [85.82, 20.30] }
    ],
    fair: [
      { d: "New Delhi (capital)", pop: 0.04, alloc: 0.12 }, { d: "Central", pop: 0.04, alloc: 0.06 }, { d: "North West", pop: 0.22, alloc: 0.15 },
      { d: "North East", pop: 0.13, alloc: 0.07 }, { d: "North", pop: 0.05, alloc: 0.05 }, { d: "South", pop: 0.16, alloc: 0.17 },
      { d: "West", pop: 0.15, alloc: 0.14 }, { d: "East", pop: 0.10, alloc: 0.11 }, { d: "South West", pop: 0.11, alloc: 0.13 }
    ],
    zones: [
      { zone: "Narela warehouse row", what: "6 warehouses, every occupant gone, ownerless food stock", status: "Open", rule: "Food and water only, 09:00–17:00, police at the gate", lonlat: [77.09, 28.85] },
      { zone: "Rohini Sector 3 flats", what: "112 flats where everyone vanished", status: "Taken for emergency housing", rule: "Allotted through care points, not open", lonlat: [77.10, 28.71] },
      { zone: "Okhla industrial estate", what: "Ownerless stock", status: "Being assessed", rule: "Not open", lonlat: [77.27, 28.53] }
    ],
    triage: [
      { q: "Under five, no circle, alone over 12 hours", n: 735, order: "First" },
      { q: "On a ventilator or dialysis, site short of staff", n: 212, order: "First" },
      { q: "Over 75, no circle", n: 1140, order: "Second" },
      { q: "Age 6–17, no circle", n: 980, order: "Second" }
    ],
    world: {
      aid: [ { from: "SGP", to: "IDN", what: "Medical teams, 12 aircraft", t: "06:40" }, { from: "ARE", to: "IND", what: "Water units, 40 t", t: "06:55" }, { from: "KOR", to: "VNM", what: "Grid engineers, 60", t: "07:00" }, { from: "DEU", to: "UKR", what: "Fuel, 18 trucks", t: "07:05" } ]
    }
  };
})(window.RC);
