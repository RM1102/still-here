/* Still Here — seed data. All people, addresses and counts are fictional except public statistics on the About screen.
   Nothing is fetched; the prototype runs from index.html with no network. */
window.RC = window.RC || {};
(function (RC) {
  RC.APP = { name: "Still Here", tagline: "Who's still here. Who's alone. Who's closest.", T: "14:32:07", DAY: "Day 1", NOW: "07:10", caseId: "SH-7731" };
  RC.WMON = "https://www.worldmonitor.app/";
  RC.T = RC.APP.T; RC.DAY = RC.APP.DAY; RC.NOW = RC.APP.NOW;

  RC.me = { name: "Sunita Sharma", age: 50, ward: "Rohini Sector 7", city: "Delhi", phone: "+91 98••• •4410", verifiedResidence: true };

  RC.people = [
    { id: "rajesh", name: "Rajesh Sharma", rel: "Husband", age: 54, city: "Delhi", status: "stopped", ev: "Was on a call at 2:32 pm. The other person heard nothing more, and his phone hasn't been touched since" },
    { id: "aman",   name: "Aman Sharma",   rel: "Son", age: 29, city: "Mumbai", status: "stopped", ev: "His watch was reading his pulse at 2:32 pm and stopped then" },
    { id: "priya",  name: "Priya Sharma",  rel: "Daughter-in-law", age: 28, city: "Mumbai", status: "stopped", ev: "Her phone was moving in a taxi at 2:32 pm. It hasn't moved since" },
    { id: "meera",  name: "Meera Sharma",  rel: "Granddaughter", age: 3, city: "Mumbai", status: "nodevice", alone: true },
    { id: "kamla",  name: "Kamla Devi",    rel: "Mother", age: 78, city: "Delhi", status: "nodevice", alone: true },
    { id: "vinod",  name: "Vinod Kumar",   rel: "Brother", age: 47, city: "Delhi", status: "stopped", ev: "Was typing a message at 2:32 pm. It was never sent" },
    { id: "ritu",   name: "Ritu Kapoor",   rel: "Daughter", age: 25, city: "Bengaluru", status: "active", last: "4 min ago", checkedIn: false },
    { id: "anita",  name: "Anita Verma",   rel: "Neighbour", age: 52, city: "Delhi", status: "active", last: "22 min ago", checkedIn: false },
    { id: "shalini",name: "Shalini Gupta", rel: "Sister", age: 45, city: "Jaipur", status: "active", last: "1 h ago", checkedIn: false },
    { id: "dr-rao", name: "Dr. Rao",       rel: "Family doctor", age: 61, city: "Delhi", status: "active", last: "15 min ago", checkedIn: true },
    { id: "pappu",  name: "Pappu (driver)",rel: "Driver", age: 38, city: "Delhi", status: "unconfirmed", ev: "His phone was lying idle at 2:32 pm, last used at 1:50 pm, so we can't tell" },
    { id: "anil",   name: "Anil Sharma",   rel: "Nephew, lives with you", age: 31, city: "Delhi", status: "quiet", place: "a hospital in South Delhi", since: "4:40 pm yesterday" },
    { id: "meena",  name: "Meena (help)",  rel: "Domestic help", age: 41, city: "Delhi", status: "active", last: "8 min ago", checkedIn: true }
  ];

  RC.cases = {
    meera: {
      id: "meera", name: "Meera Sharma", age: 3, ageBand: "under 5",
      address: "Flat 402, Sunrise Towers, Andheri East, Mumbai", ward: "K/East, Mumbai", lonlat: [72.87, 19.12],
      why: "Both her parents, Aman and Priya, vanished at 2:32 pm yesterday: their phones stopped in that second. Meera is registered at this flat on the family's ration card and at her daycare. No adult's phone has been used at the flat since.",
      distanceFromMe: "1,410 km",
      circle: [
        { id: "lata",   name: "Lata Pawar",  rel: "Her nanny, on weekdays", calls: 62, dist: 1.8, last: "2 min ago", via: "WhatsApp, in Marathi" },
        { id: "neha",   name: "Neha Desai",   rel: "Her aunt, Priya's sister", calls: 48, dist: 2.2, last: "vanished at 2:32 pm", via: "—", stopped: true },
        { id: "rakesh", name: "Rakesh Mehta", rel: "Uncle, Aman's cousin", calls: 31, dist: 4.1, last: "10 min ago", via: "WhatsApp" },
        { id: "farah",  name: "Farah Khan",   rel: "Her teacher at daycare", calls: 19, dist: 0.6, last: "31 min ago", via: "SMS, in Hindi" },
        { id: "nair",   name: "Dr. Nair",     rel: "Her doctor", calls: 6, dist: 3.0, last: "6 min ago", via: "SMS" }
      ],
      building: { name: "Sunrise Towers", asked: "The watchman (missed call) and the society group", q: "Is an adult with the child in Flat 402?", answers: "2 replied: no adult seen since yesterday" },
      carePoint: { name: "Govt Primary School, Marol", dist: "400 m", slots: 9, police: true }
    },
    kamla: {
      id: "kamla", name: "Kamla Devi", age: 78, ageBand: "over 75",
      address: "B-4/57, Rohini Sector 3, Delhi", ward: "Rohini Sector 3", lonlat: [77.13, 28.70],
      why: "Your brother Vinod, who lived with her, vanished at 2:32 pm yesterday. She has no phone. Her pension and health records give this address, so we know she's on her own there.",
      distanceFromMe: "3.1 km", youAreNearest: true
    }
  };

  // India by state: f = flagged alone (millions), r = share confirmed reached, c = share claimed-unconfirmed
  RC.country = {
    name: "India", flagged: 43100000, claimed: 4000000, reached: 2140000, lastHour: 41200, silencesSinceT: 0,
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
    { k: "Power", v: "Back in 71% of Rohini Sector 7", src: "BSES, the power company", t: "06:55", ok: true },
    { k: "Water", v: "Low pressure: the Haiderpur plant has 6 of its 11 operators", src: "Delhi Jal Board staff count", t: "06:40", ok: false },
    { k: "Metro", v: "Red Line running, a train every 20 minutes", src: "Delhi Metro", t: "06:30", ok: true },
    { k: "Fuel", v: "3 of the 7 petrol pumps in your ward have staff", src: "Indian Oil dealers", t: "06:20", ok: false },
    { k: "Mobile network", v: "Towers 61% busy, with diesel for 38 more hours", src: "Your mobile network", t: "07:00", ok: true }
  ];

  // Help is coming: departures only, two-hour lag, never a route or an arrival time
  RC.flows = [
    { what: "Supply train · 40 t grain and water", from: "Mumbai", fromLL: [72.82, 18.97], to: "Delhi", toLL: [77.22, 28.64], dep: "04:10", shownAt: "06:10", kind: "rail" },
    { what: "Medical team · 60 doctors, 4 t supplies", from: "Hyderabad", fromLL: [78.49, 17.39], to: "Patna", toLL: [85.14, 25.59], dep: "03:50", shownAt: "05:50", kind: "air" },
    { what: "Field hospital · 200 beds", from: "Pune", fromLL: [73.86, 18.52], to: "Mumbai", toLL: [72.88, 19.08], dep: "04:40", shownAt: "06:40", kind: "road" },
    { what: "Grid crews · 120 engineers", from: "Chennai", fromLL: [80.27, 13.08], to: "Bhubaneswar", toLL: [85.82, 20.30], dep: "04:30", shownAt: "06:30", kind: "rail" },
    { what: "Diesel for towers · 2,000 kL", from: "Kochi", fromLL: [76.27, 9.93], to: "Mangaluru", toLL: [74.86, 12.91], dep: "05:00", shownAt: "07:00", kind: "sea" }
  ];

  RC.restoration = [
    { k: "Power restored", v: 61, unit: "% of wards, Delhi" }, { k: "Water points open", v: 44, unit: "% of planned" },
    { k: "Ration shops open", v: 49, unit: "% (dealer is there)" }, { k: "Hospitals with an emergency ward open", v: 72, unit: "% in Delhi" },
    { k: "Metro lines running", v: 3, unit: "of 9" }, { k: "Phone towers on backup diesel", v: 27, unit: "%" }
  ];

  RC.communities = [
    { name: "Vapi industrial commune (Gujarat)", members: "340 members", organiser: "run by Vapi Industries Association (checked)", link: "App", accepting: true, note: "Restarting 3 pharma units. Food and lodging for electricians, fitters, nurses.", lonlat: [72.93, 20.37], need: "electricians, fitters, nurses" },
    { name: "IIT Delhi hostel block", members: "210 members", organiser: "run by the Dean of Students office (checked)", link: "App", accepting: true, note: "Mess running. Taking in families from Hauz Khas.", lonlat: [77.19, 28.55], need: "families, cooks" },
    { name: "Rohini Sec 7 volunteers", members: "12 volunteers", organiser: "run by Dr. Rao (checked)", link: "WhatsApp", accepting: true, note: "Need 2 people with a car for the water point from 8 am.", lonlat: [77.11, 28.71], need: "drivers" },
    { name: "C-7 block residents", members: "19 of 41 flats here", organiser: "run by Anita Verma (checked)", link: "WhatsApp", accepting: false, note: "", lonlat: [77.11, 28.72] },
    { name: "Tiruppur knitwear cluster", members: "1,100 members", organiser: "run by the Tiruppur Exporters' Association (checked)", link: "App", accepting: true, note: "Two mills running. Food for 400 more. Need power-loom hands.", lonlat: [77.34, 11.11], need: "mill hands" }
  ];
  RC.groups = RC.communities;

  // Open places: worship and public spaces that are open and have a verified adult on duty
  RC.places = [
    { name: "Gurudwara Sector 7", kind: "worship", open: true, staff: "free meals (langar) · 6 volunteers", dist: "0.9 km", lonlat: [77.115, 28.715], charge: "phone charging on a generator", hub: "offline hub" },
    { name: "Shiv Mandir, Sec 8", kind: "worship", open: true, staff: "2 people on duty", dist: "1.4 km", lonlat: [77.12, 28.70] },
    { name: "Jama Masjid, Rohini", kind: "worship", open: true, staff: "water · 4 people on duty", dist: "2.1 km", lonlat: [77.10, 28.73] },
    { name: "Govt Sr Sec School, Sec 7", kind: "public", open: true, staff: "police there · water point", dist: "0.7 km", lonlat: [77.11, 28.71], charge: "phone charging on solar power", hub: "offline hub" },
    { name: "Community hall, Sec 11", kind: "public", open: false, staff: "nobody seen there today", dist: "2.6 km", lonlat: [77.09, 28.72] },
    { name: "Japanese Park", kind: "public", open: true, staff: "open ground, away from buildings", dist: "1.8 km", lonlat: [77.10, 28.71] }
  ];

  // Open with a person on duty: shops and services where a staff phone is present now (audit section 6, #4 and #5)
  RC.onDuty = [
    { name: "Ration shop 112, Sec 7", what: "Dealer there since 7:02 am · giving out rations", queue: "about 140 waiting, usually 20", dist: "0.4 km", icon: "package", tile: "green" },
    { name: "Ration shop 118, Sec 8", what: "Dealer there since 6:55 am", queue: "about 30 waiting", dist: "0.6 km", icon: "package", tile: "green" },
    { name: "SBI ATM, Sec 7 market", what: "Cash loaded at 6:50 am · guard there", queue: "", dist: "0.9 km", icon: "landmark", tile: "blue" },
    { name: "Apollo Pharmacy, Sec 8", what: "Pharmacist there since 6:58 am · has insulin", queue: "", dist: "1.1 km", icon: "heart-pulse", tile: "red" },
    { name: "Indian Oil pump, Sec 11", what: "2 attendants · petrol and diesel", queue: "about 60 vehicles waiting", dist: "1.6 km", icon: "truck", tile: "orange" }
  ];
  // Doctors and nurses on duty (Rahul, 24 Oct evening): counted from staff phones at each place, like every other "on duty"
  // Plain warnings for the public, from IMD and satellite maps (STRATEGY §2)
  RC.warnings = [
    { icon: "sun", t: "Heat tomorrow: 41 °C", s: "Drink water often. Keep children and elders out of the afternoon sun. (IMD)" },
    { icon: "droplets", t: "Rain in the hills on Day 3", s: "With half the plants gone, bare slopes may slide. Avoid hill roads in Uttarakhand and Himachal." },
    { icon: "triangle-alert", t: "Dust on bare fields", s: "Half the grass vanished too, so wind lifts dust. Cover your nose and keep stored water covered." }
  ];
  RC.clinics = [
    { name: "Mohalla Clinic, Sector 7", dist: "0.6 km", doctors: 1, nurses: 2, since: "7:00 am", wait: "about 40 minutes", mins: 40, treats: "fever, wounds, repeat prescriptions" },
    { name: "First-aid point at the Sector 7 govt school", dist: "0.7 km", doctors: 1, nurses: 0, since: "6:30 am", wait: "under 10 minutes", mins: 8, firstaid: true, treats: "first aid and checking medicines; Dr. Rao, your family doctor, runs it" },
    { name: "Dr. BSA Hospital, emergency ward", dist: "2.4 km", doctors: 14, nurses: 31, since: "", wait: "about 2 hours", mins: 120, treats: "injuries, breathing trouble, childbirth; 38 doctors on a normal day" },
    { name: "Jaipur Golden Hospital, Sector 3", dist: "3.0 km", doctors: 6, nurses: 12, since: "", wait: "about 1 hour", mins: 60, treats: "dialysis and heart patients first" }
  ];
  // Who's with you (audit section 6, #1, #2 and #7): a child already with Sunita, from next door
  RC.withMeSuggest = { name: "Aarav Malhotra", age: 7, from: "C-7/110, next door", why: "Both his parents vanished at 2:32 pm yesterday. He came to your flat last night.", ration: "5 kg a month", code: "7K3Q" };

  // Is it true? A forwarded message checked against official notices and on-the-spot confirmations (audit section 6, #11)
  RC.rumour = { text: "URGENT: more people will vanish at 3 pm today. Stay indoors and don't open the door to anyone. Forward to 10 people.", verdict: "No official notice says this", why: "The government's last notice, at 6:00 am, says nobody has vanished since 2:32 pm yesterday, and no phone has gone silent since. Nobody anywhere has confirmed this message. Messages that ask you to forward them are how rumours spread." };
  // Kamla's medicines (audit section 6, #6): from her health record and pharmacy history
  RC.meds = [{ name: "Metformin 500 mg", for: "For diabetes", left: "about 9 days left", from: "bought 12 Oct" }, { name: "Amlodipine 5 mg", for: "For blood pressure", left: "about 4 days left", from: "bought 30 Sep" }];

  RC.notices = [
    { from: "National Disaster Management Authority (NDMA)", t: "06:00", text: "At 2:32 pm yesterday, half of all people vanished. Nobody has vanished since. Stay where you are unless someone needs you. Open Still Here to see who in your life is safe.", official: true, confirms: null },
    { from: "Delhi Disaster Management Authority", t: "06:45", text: "Drinking water at Govt Sr Sec School, Sector 7, where police are present. A 2,000-litre tanker arrives at 8:00 am.", official: true, confirms: 14, denies: 0, confirmedAt: "07:02" },
    { from: "Delhi Jal Board", t: "06:40", text: "Tap water in Rohini is safe to drink. Pressure will be low until Haiderpur is fully staffed.", official: true, confirms: 41, denies: 3, confirmedAt: "07:05" },
    { from: "BSES Rajdhani", t: "06:55", text: "Power is back in Rohini Sectors 7, 8 and 11. Sector 3 by 10:00 am.", official: true, confirms: 88, denies: 1, confirmedAt: "07:08" },
    { from: "Delhi Police", t: "06:10", text: "Rohini police station is open, with 14 of its 31 staff. In an emergency, call 112.", official: true, confirms: 9, denies: 0, confirmedAt: "06:50" }
  ];

  RC.avoid = [
    { z: "Bawana chemical area", why: "Nobody is working at a chlorine store here. Stay 1 km away.", lonlat: [77.03, 28.80], km: 1 },
    { z: "Yamuna east bank", why: "Many trees here vanished too, and the riverbank hasn't been checked since. Keep off it.", lonlat: [77.28, 28.60], km: 1.5 },
  ];

  RC.authorities = [
    { name: "Rohini Police Station", staff: "14 of 31 staff at work", dist: "1.2 km", status: "open", phone: "112" },
    { name: "Dr. BSA Hospital", staff: "46% of staff at work · emergency ward open", dist: "2.4 km", status: "open", phone: "102" },
    { name: "Fire Station, Rohini", staff: "9 of 22 staff at work", dist: "1.9 km", status: "open", phone: "101" },
    { name: "Child helpline (CHILDLINE)", staff: "working · also through 112", dist: "by phone", status: "open", phone: "1098" },
    { name: "Kiran, community health worker (ASHA), Sec 7", staff: "phone used 12 min ago", dist: "0.8 km", status: "open", phone: "Call in app" }
  ];

  RC.radar = {
    within1km: { under5: 3, child: 5, elderly: 7, claimed: 9, unclaimed: 6 },
    cases: [
      { id: "r1", ageBand: "under 5", hoursSinceT: 16.6, circleResponse: "none", address: "B-3/88, Sector 7", care: "the Sector 7 govt school (police there, 9 places left)" },
      { id: "r2", ageBand: "over 75", hoursSinceT: 16.6, circleResponse: "none", address: "C-9/14, Sector 7", care: "Dr. BSA Hospital, ward for the elderly" },
      { id: "r3", ageBand: "6–12", hoursSinceT: 16.6, circleResponse: "1 notified, 0 claimed", address: "C-2/61, Sector 7", care: "the Sector 7 govt school" }
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
    { t: "Insulin without a fridge", s: "Unopened insulin keeps for about four weeks below 25 °C. Keep it in a clay pot with water, or wrapped in a damp cloth in shade, and never freeze it. Don't stop or change your dose without advice. If you are running short, get to a chemist or care point today." },
    { t: "Making water safe", s: "If it is cloudy, let it settle and pour through a clean cloth. Boil for one minute at a rolling boil, or add household bleach (unscented, 5%): two drops per litre, wait 30 minutes. Store covered." },
    { t: "CPR, adult", s: "Check response, call 112, place the heel of your hand on the centre of the chest, push hard and fast 100–120 a minute, 5 cm deep, let the chest rise fully. Keep going until help arrives or the person breathes." },
    { t: "Moving a bedridden adult", s: "Do not move alone if you can avoid it. Log-roll onto a blanket, two people lift at the hips and shoulders, keep the head supported. Bring medicines, the ABHA number and any oxygen with the person." }
  ];

  RC.meshSample = [
    { from: "Anita (2 hops)", text: "Water tanker at the school now. Queue is short.", t: "08:02" },
    { from: "Kiran, health worker (1 hop)", text: "With Savitri ji at C-9/14. She's fine, needs her blood pressure tablets.", t: "08:11" },
    { from: "Dr. Rao (3 hops)", text: "Anyone with a car near Sec 7 gate? Two oxygen cylinders to move.", t: "08:15" }
  ];


  /* ---------- Vocabulary and help (audit B1–B14, D1) ---------- */
  RC.TERMS = {
    vanish: "New vanishings since 2:32 pm yesterday", alone: "Children left alone", reached: "Now safe with someone",
    claimed: "Someone on the way", unclaimed: "Nobody going yet", nocircle: "Small children nobody is coming for",
    urgent: "Urgent problems not yet handled", short: "Essential sites short of staff"
  };
  RC.HELP = {
    withme: { t: "Who's with you", b: "A child or elderly person now in your care. Adding them means nobody is sent to their empty home and their family is told where they are. Once someone who knows them confirms, their food ration and a guardian pass move to you.", s: "Ration cards work at any ration shop in India (One Nation One Ration Card)" },
    quiet: { t: "Here, not replying", b: "Their phone is being used, so they're here, but they haven't answered. We show only the kind of place their phone is at, such as a hospital, and only to the people they live with.", s: "Mobile network location, kind of place only" },
    unconfirmed: { t: "Not sure", b: "Their phone was lying idle at 2:32 pm yesterday, so the network can't tell whether they vanished. Try calling them. If they're here, one tap of I'm Here on any phone clears it.", s: "Mobile networks" },
    vanish: { t: "New vanishings since 2:32 pm yesterday", b: "At 2:32 pm yesterday, the phones of half of everyone went silent in the same second, while the networks kept working. We check every minute for any phone that goes silent the same way. None has, so it has happened only once.", s: "The mobile networks, checked every minute" },
    alone: { t: "Children left alone", b: "Children under 15 whose every adult at home vanished. We know who lives together from family phone plans, ration cards and where phones are at night. If a father vanished and the mother has no phone, we can't be sure, so the building is asked first. Elderly people who can't manage alone, like Kamla, get cases too.", s: "Mobile networks, ration cards and the anganwadi (government childcare) registers" },
    reached: { t: "Now safe with someone", b: "Someone who knows the child replied that the child is with them, and their phone is at the address. A tap alone never counts, so this number is hard to fake.", s: "Replies by WhatsApp, SMS, missed call or the app, plus where the phone is" },
    claimed: { t: "Someone on the way", b: "Someone who knows them has said they're going. If they haven't arrived an hour after the time they gave, we message the others again.", s: "Replies to the case message" },
    unclaimed: { t: "Nobody going yet", b: "Found alone and messaged, but nobody has said they're going. After two hours, the police and the child helpline get the address.", s: "Case records" },
    nocircle: { t: "Small children nobody is coming for", b: "Under five, and nobody who knows them is going: some have nobody left, and others' people haven't answered. If only half of the people alive who know a child go on Day 1, 18–32% of children left alone have nobody. They go first to the area's paid health or childcare worker (ASHA or anganwadi), then to the state.", s: "The case messages and the anganwadi register" },
    circle: { t: "People who know her", b: "The people a child's parents called most who live in the same city: relatives, the nanny, close neighbours. They're ranked by how often they were called and how near they are. If four of them are in the same city, there's only a 6% chance that all four vanished.", s: "Call records held by the mobile networks" },
    urgent: { t: "Urgent problems not yet handled", b: "Problems where lives are at risk within hours. Each has a suggested action. The count drops when someone acts on it.", s: "Staff roll calls, satellite passes, official reports" },
    short: { t: "Essential sites short of staff", b: "Hospitals, water plants, substations, police stations and prisons where the staff roll call shows less than half the usual staff. The roll call uses the same phone signal: whose phone is at the site.", s: "Employer rosters matched to device location" },
    stopped: { t: "Gone", b: "Their phone was being used or moving at 2:32 pm yesterday, fell still in that same second, and hasn't been moved, unlocked or used to call since, while the network around it kept working. If that's wrong, tap This Is Wrong, or they can tap I'm Here on any phone and it's corrected everywhere.", s: "Mobile networks (movement, calls, messages) and phone makers (unlocks)" },
    nodevice: { t: "No phone of their own", b: "They have no phone, so we check on them through the people they live with. If all of those phones went silent, they may be alone.", s: "Ration card, school, anganwadi and pension records" },
    active: { t: "Here", b: "Their phone has been used since 2:32 pm yesterday, so they're here.", s: "Mobile networks" },
    projection: { t: "Estimate", b: "Times after now are estimates, worked out from how fast children are being reached in each area right now. Every child left alone should be found by 10 am this morning. Once the people who know a child are messaged, about three in four children are with one of them within six hours. Only Now is real.", s: "The same model as every other number" },
    simulated: { t: "Made-up data", b: "Every person, address, number and count in this prototype is made up, and every number comes from one model so they add up. Phone numbers are fictional. The maps are real: Natural Earth, india-maps-data for 719 districts, and DataMeet's ward maps for seven cities.", s: "Prototype" },
    govview: { t: "Government view · restricted", b: "A separate system on a separate network with its own login. The public app never links to it. It holds addresses, routes and staff lists that would help a raider.", s: "Design rule" },
    scale: { t: "How to read the map", b: "Each area is coloured by the share of its children left alone who are now safe with someone: pale means few, deep green means most. The steps (4, 8, 15, 35 and 65%) are uneven so the map shows change in the first hours as well as on Day 2. Grey stripes mean no phone network there, so no numbers. Hover for numbers, click for detail, and use + and − to zoom.", s: "The model" },
    mirror: { t: "Public mirror", b: "When on, anyone can see how supplies are split against where people are. Switching it off is itself recorded and shown publicly.", s: "Allocation ledger" },
    openzone: { t: "Open zones", b: "Places where every occupant vanished and stock is ownerless. The district can declare them open for taking food and water under Section 65 of the Disaster Management Act 2005, with police at the gate. It gives the raiding instinct a legal target away from homes.", s: "DM Act 2005, s.65" },
    register: { t: "Asked, not conscripted", b: "Survivors on professional registers (doctors, nurses, plant operators) get a message with the site, the shift and what it earns. They choose.", s: "National Medical Commission and nursing registers, employer rosters" },
    triage: { t: "Triage order", b: "When there are more cases than teams, who is reached first. Set by the district magistrate and the chief medical officer only; every change is logged with their name.", s: "Restricted" }
  };

  /* ---------- Government view (audit C1–C3, C11) ---------- */
  // For each problem: a short map label, what it needs, what is free to solve it, and what is still short after each action (Rahul, 24 Oct evening:
  // "to look at what resources I have to solve it I have to go to another tab")
  RC.govPlan = {
    children: { short: "Small children, nobody going", need: "One police officer and one health or childcare worker for each of the five worst wards", pool: "teams", uses: 5,
      have: [{ what: "Paired child teams (police and a health or childcare worker)", n: "46 free in Delhi", eta: "30 to 60 min" }, { what: "Anganwadi workers on duty in those wards", n: "38", eta: "already in their ward" }],
      left: { act: "Five wards covered. 41 teams still free for the next ten wards." } },
    tihar: { short: "Tihar: 38% of guards", need: "Two armed police companies", pool: "police", uses: 2,
      have: [{ what: "Delhi Armed Police, 3rd Battalion", n: "2 companies free", eta: "40 min from Kingsway Camp" }, { what: "CRPF reserve", n: "1 company free", eta: "55 min from Jharoda Kalan" }],
      left: { act: "Nothing short once they arrive at 08:00.", alt: "Lockdown holds for about 12 hours; guards are still needed by tonight." } },
    armoury: { short: "Armoury unguarded", need: "One police team of six", pool: "station", uses: 1,
      have: [{ what: "Rohini police station, team 1", n: "6 officers free", eta: "22 min" }],
      left: { act: "Nothing short.", alt: "Armoury empty by 10:00; no guard needed after that." } },
    water: { short: "Water plant: 6 of 11 operators", need: "Five more operators", pool: null,
      have: [{ what: "Operators on the Delhi Jal Board register, still here", n: "61, of whom 9 live within 10 km", eta: "about 1 hour" }, { what: "Wazirabad plant", n: "2 operators can be spared", eta: "80 min" }],
      left: { act: "2 accepted, arriving 08:30. Still 3 short: ask Wazirabad too." } },
    bawana: { short: "Chlorine store unmanned", need: "One hazmat crew", pool: "hazmat", uses: 1,
      have: [{ what: "Rohini fire station hazmat crew", n: "1 crew of 5 free", eta: "34 min" }],
      left: { act: "Nothing short.", alt: "Residents warned; the store is still unmanned until a crew goes." } },
    power: { short: "Substation: 2 of 9 operators", need: "Three engineers", pool: null,
      have: [{ what: "Electrical engineers on power company rosters, still here", n: "290, of whom 14 live within 10 km", eta: "about 1 hour" }],
      left: { act: "Cuts approved; hospitals stay on. Engineers are still needed.", alt: "1 accepted. Still 2 short." } },
    yamuna: { short: "Embankment unchecked", need: "One engineer", pool: null,
      have: [{ what: "Irrigation department engineers", n: "3 free", eta: "by 10:00" }], left: { act: "Nothing short unless it rains." } },
    tarapur: { short: "Tarapur: 4 of 14 operators", need: "Six reactor operators", pool: null,
      have: [{ what: "Kudankulam plant operators", n: "6 can be spared", eta: "13:00 by Air Force flight" }], left: { act: "Nothing short once they land at 13:00." } },
    mumbai: { short: "Mumbai flood at 13:40", need: "A warning to six wards and boats on standby", pool: null,
      have: [{ what: "NDRF teams already in Mumbai", n: "4 teams with boats", eta: "in place by 12:00" }], left: { act: "Boats still to be moved to Kurla and Sion." } },
    bihar: { short: "Bihar slowest", need: "About 40 response teams", pool: null,
      have: [{ what: "Kerala response teams, ahead of pace", n: "40 spare", eta: "by air from 11:00" }], left: { act: "Nothing short once they land." } }
  };
  // Teams and vehicles that can be sent. Free = total − already busy − what the actions above take.
  RC.govPools = [
    { k: "teams", what: "Paired child teams", who: "One police officer and one health or childcare worker", total: 120, busy: 74, unit: "teams" },
    { k: "police", what: "Armed police companies", who: "Delhi Armed Police and the CRPF reserve", total: 14, busy: 11, unit: "companies" },
    { k: "station", what: "Police station teams", who: "Six officers each, at 41 stations", total: 96, busy: 61, unit: "teams" },
    { k: "hazmat", what: "Hazmat crews", who: "Delhi Fire Service, trained for chemical leaks", total: 3, busy: 2, unit: "crews" },
    { k: "tankers", what: "Water tankers", who: "Delhi Jal Board", total: 42, busy: 42, unit: "tankers", note: "All on routes until 10:00" },
    { k: "trucks", what: "Trucks for grain", who: "Food Corporation and hired", total: 38, busy: 0, unit: "trucks", note: "60 needed for the 1,200 t from Narela: 22 short" }
  ];
  // Homes, money and critical sites (Rahul, 24 Oct night): restricted, never on the public portal. Counts are simulated; names are real places.
  RC.govHomes = {
    total: 4600000, upscale: ["Vasant Vihar", "Vasantkunj", "Greater Kailash-I", "East Of Kailash", "Hauz Khas", "Malviya Nagar", "Punjabi Bagh", "Model Town", "Rajouri Garden", "Karol Bagh", "Pitampura South"],
    essentials: { status: "Not needed yet", why: "Food Corporation grain in Delhi lasts about 40 days, and markets reopen on Day 2. Opening homes now would set a precedent that raiders would copy.",
      rules: ["Only things that spoil or save a life: fresh food, medicines, baby formula, blankets. Never money, jewellery, papers or belongings.", "Only in a ward where ration shops have run out, and only on an order under the Disaster Management Act 2005, s.65.", "A team of two, one of them a police officer. Everything taken is photographed and listed.", "The door is sealed with a numbered seal and the family is told what was taken and where it went."] },
    money: [
      { what: "Bank accounts of people marked gone", rule: "Outgoing payments paused, except to a registered nominee", why: "Thieves use the phones of the vanished to empty their accounts. 2,340 attempts were blocked in Delhi since 06:00." },
      { what: "UPI and wallets on their numbers", rule: "Paused for 30 days", why: "The same fraud, by phone" },
      { what: "Lockers, homes and land", rule: "Sealed; titles unchanged", why: "Nothing changes hands until heirs claim" },
      { what: "Money nobody claims", rule: "Stays in the account. It cannot be shared out", why: "By law it moves to the RBI's Depositor Education and Awareness Fund only after ten years" },
      { what: "Declaring the vanished dead", rule: "Ordinance pending: a declaration after 90 days", why: "Otherwise families wait seven years (Bharatiya Sakshya Adhiniyam 2023, s.111) to inherit or claim insurance" }
    ],
    sites: [
      { kind: "Hospitals", n: 87, short: 21, worst: "Dr. BSA Hospital and LNJP at under half their doctors", sev: "orange" },
      { kind: "Newborn and intensive care units", n: 64, short: 9, worst: "9 units under half their nurses; babies on ventilators first", sev: "red" },
      { kind: "Childcare homes", n: 92, short: 11, worst: "11 homes under half their staff, with 640 children", sev: "red" },
      { kind: "Old-age homes", n: 54, short: 8, worst: "8 homes under half their staff", sev: "orange" },
      { kind: "Disease labs (biosafety level 3)", n: 6, short: 2, worst: "All sealed at 03:00; 2 have no staff on site, guards posted", sev: "orange" },
      { kind: "Chemical and hazardous units", n: 31, short: 3, worst: "3 Bawana units unmanned, one storing chlorine", sev: "red" },
      { kind: "Fuel depots and gas plants", n: 9, short: 1, worst: "Shakurbasti depot at 44% of staff", sev: "orange" },
      { kind: "Water treatment plants", n: 9, short: 2, worst: "Haiderpur: 6 of 11 operators", sev: "orange" },
      { kind: "Power substations (220 kV)", n: 46, short: 5, worst: "Badarpur: 2 of 9 operators", sev: "orange" },
      { kind: "Prisons", n: 3, short: 1, worst: "Tihar at 38% of guards", sev: "red" },
      { kind: "Airport and air traffic control", n: 1, short: 1, worst: "IGI air traffic control at 58%; relief flights only", sev: "orange" },
      { kind: "Zoo", n: 1, short: 1, worst: "National Zoological Park keepers at 40%; dangerous animals secured", sev: "" }
    ],
    india: [
      { kind: "Nuclear power plants", n: 7, worst: "Tarapur shutting down with 4 of 14 operators", sev: "red" },
      { kind: "Large dams and barrages", n: 32, worst: "Hathnikund barrage, which sends the Yamuna to Delhi, at 50% of operators", sev: "orange" }
    ],
    damage: [
      { what: "Flights in the air at 2:32 pm", n: "412 over India", then: "Where both pilots vanished, about one in four: 97 aircraft crashed or are missing. Survivors found at 31 sites." },
      { what: "Trains moving at 2:32 pm", n: "about 7,100", then: "All stopped within a minute: Indian locomotives brake on their own when the driver stops responding. 6 collisions where that failed." },
      { what: "Road crashes in the first minute", n: "about 6,800 in Delhi", then: "Most of the injured are in hospitals now; 1,900 wrecks still block roads." },
      { what: "Fires from stoves and machines left on", n: "1,140 calls in Delhi", then: "214 still burning, worst in the Okhla and Narela industrial areas." },
      { what: "People trapped in lifts", n: "3,900 rescued", then: "About 300 buildings still to check." }
    ]
  };
  // Critical sites in Delhi for the Situation map (real places, approximate positions; staff counts simulated)
  RC.govSitePins = [
    { n: "AIIMS", k: "H", ll: [77.210, 28.567], staff: "61% of staff", short: false }, { n: "Safdarjung Hospital", k: "H", ll: [77.206, 28.569], staff: "55% of staff", short: false },
    { n: "LNJP Hospital", k: "H", ll: [77.238, 28.639], staff: "44% of doctors", short: true }, { n: "GTB Hospital", k: "H", ll: [77.311, 28.686], staff: "52% of staff", short: false },
    { n: "Dr. BSA Hospital", k: "H", ll: [77.119, 28.716], staff: "46% of staff", short: true }, { n: "RML Hospital", k: "H", ll: [77.201, 28.626], staff: "58% of staff", short: false },
    { n: "Haiderpur water plant", k: "W", ll: [77.149, 28.718], staff: "6 of 11 operators", short: true }, { n: "Wazirabad water plant", k: "W", ll: [77.228, 28.712], staff: "9 of 14 operators", short: false },
    { n: "Chandrawal water plant", k: "W", ll: [77.227, 28.681], staff: "7 of 12 operators", short: false }, { n: "Sonia Vihar water plant", k: "W", ll: [77.253, 28.728], staff: "5 of 12 operators", short: true },
    { n: "Okhla water plant", k: "W", ll: [77.290, 28.560], staff: "4 of 7 operators", short: false }, { n: "Nangloi water plant", k: "W", ll: [77.070, 28.680], staff: "4 of 8 operators", short: false },
    { n: "Tihar Jail", k: "P", ll: [77.101, 28.628], staff: "118 of 310 guards", short: true }, { n: "Mandoli Jail", k: "P", ll: [77.309, 28.718], staff: "61 of 120 guards", short: false }, { n: "Rohini Jail", k: "P", ll: [77.094, 28.730], staff: "24 of 50 guards", short: true },
    { n: "NCDC disease lab", k: "L", ll: [77.224, 28.674], staff: "sealed; 3 of 9 staff", short: true },
    { n: "Shakurbasti fuel depot", k: "F", ll: [77.144, 28.683], staff: "44% of staff", short: true }, { n: "Bijwasan fuel terminal", k: "F", ll: [77.040, 28.530], staff: "57% of staff", short: false }, { n: "Tughlakabad LPG plant", k: "F", ll: [77.270, 28.500], staff: "50% of staff", short: false },
    { n: "IGI Airport air traffic control", k: "A", ll: [77.100, 28.556], staff: "58% of controllers", short: false },
    { n: "National Zoological Park", k: "Z", ll: [77.244, 28.603], staff: "keepers at 40%", short: true }
  ];
  /* ---------- 24 Oct night: the wider system (STRATEGY.md). All counts simulated; the named sources and places are real. ---------- */
  // Every feed the product joins, how fresh it is and how far it is trusted (STRATEGY §3)
  RC.sources = [
    { group: "Who vanished", name: "Mobile networks", feeds: "Phones that fell still at 2:32 pm and have not moved, called or messaged since", fresh: "1 min", trust: "High" },
    { group: "Who vanished", name: "Google and Apple", feeds: "Phones never unlocked again", fresh: "5 min", trust: "High" },
    { group: "Who vanished", name: "UPI and WhatsApp", feeds: "No payment or message since 2:32 pm", fresh: "5 min", trust: "Medium" },
    { group: "Who vanished", name: "Smart electricity meters", feeds: "A home's use fell to its fridge", fresh: "15 min", trust: "Medium" },
    { group: "Who lives where", name: "Ration cards (PDS) and Aadhaar addresses", feeds: "Households and who is in them", fresh: "Months", trust: "Medium" },
    { group: "Who lives where", name: "Child vaccination registry (U-WIN) and anganwadi app (Poshan Tracker)", feeds: "Every young child and a parent's number", fresh: "Weeks", trust: "High" },
    { group: "Who lives where", name: "School records (UDISE+)", feeds: "Children by school and home", fresh: "Months", trust: "Medium" },
    { group: "Damage", name: "Satellite fire detection (NASA FIRMS) and ISRO Bhuvan", feeds: "Fires, smoke, blocked roads, vegetation lost", fresh: "3 h", trust: "High" },
    { group: "Damage", name: "112 emergency calls", feeds: "Crashes, fires, trapped people", fresh: "1 min", trust: "Medium" },
    { group: "Damage", name: "Grid-India and water plant controls", feeds: "Power and water output, plants at risk", fresh: "1 min", trust: "High" },
    { group: "Weather and land", name: "IMD forecasts and radars; Central Water Commission river gauges", feeds: "Heat, rain, floods", fresh: "1 h", trust: "High" },
    { group: "Who can help", name: "Professional registers and licences", feeds: "Doctors, nurses, lawyers, drivers (Sarathi), pilots (DGCA)", fresh: "Years", trust: "High for profession, low for address" },
    { group: "Who can help", name: "Staff rosters (police, railways, health) matched to phones in use", feeds: "Who is at work, by district", fresh: "15 min", trust: "High" },
    { group: "What is open", name: "Verified contributors (hospitals, pharmacies, ration shops, shops)", feeds: "Open or closed, stock, queue, needs", fresh: "Each report fades in 4 h", trust: "Tiered" },
    { group: "What is open", name: "Ration shop sales machines (ePoS) and blood banks (e-RaktKosh)", feeds: "Which shops are selling; blood in stock", fresh: "Live", trust: "High" },
    { group: "What is in stock", name: "Food Corporation depots, vaccine cold chain (eVIN), e-commerce warehouses", feeds: "Grain, vaccines, packaged food and medicines near people", fresh: "1 h", trust: "High" },
    { group: "What is moving", name: "Train running data (NTES, FOIS), aircraft transponders, FASTag", feeds: "Trains, flights and trucks on the move", fresh: "1 min", trust: "High" },
    { group: "Rumours", name: "Platform trust teams, helplines, PIB Fact Check", feeds: "Messages spreading and their corrections", fresh: "10 min", trust: "Medium" }
  ];
  // Who is left, by city: the same rosters matched to phones in use (STRATEGY §3.2). Shares of usual strength.
  RC.cities = [
    { city: "Delhi", police: 0.70, doctors: 0.31, nurses: 0.46, drivers: 0.48 },
    { city: "Meerut", police: 0.38, doctors: 0.66, nurses: 0.58, drivers: 0.52 },
    { city: "Gurugram", police: 0.55, doctors: 0.49, nurses: 0.51, drivers: 0.40 },
    { city: "Noida", police: 0.52, doctors: 0.57, nurses: 0.49, drivers: 0.45 },
    { city: "Ghaziabad", police: 0.61, doctors: 0.44, nurses: 0.41, drivers: 0.55 },
    { city: "Faridabad", police: 0.47, doctors: 0.52, nurses: 0.62, drivers: 0.50 }
  ];
  RC.trades = [
    { id: "t1", give: "Delhi sends 6 police companies to Meerut", get: "Meerut sends 140 doctors to Delhi's emergency wards", why: "Delhi has 70% of its police but 31% of its doctors; Meerut is the other way round" },
    { id: "t2", give: "Faridabad sends 90 nurses to Ghaziabad", get: "Ghaziabad sends 20 tanker drivers to Faridabad", why: "Ghaziabad's nurses are at 41%; Faridabad's drivers are needed for water" }
  ];
  // What is moving (STRATEGY §3.2)
  RC.transport = [
    { mode: "Flights", staff: "Pilots at 52%, air traffic control at 58%", running: "Relief flights only, 38 today", sev: "orange" },
    { mode: "Trains", staff: "Loco pilots at 49%", running: "Passenger trains stopped; 60 freight trains with food and fuel", sev: "orange" },
    { mode: "Delhi Metro", staff: "Train operators at 55%", running: "Red Line every 20 min; other lines closed", sev: "orange" },
    { mode: "Buses", staff: "Drivers at 46%", running: "DTC: 1,100 of 3,800 buses, mostly to hospitals and water points", sev: "orange" },
    { mode: "Trucks", staff: "Commercial drivers at 48%", running: "Food and fuel convoys with police escort", sev: "orange" },
    { mode: "Highways", staff: "", running: "NH-44 open; NH-48 blocked near Manesar by wrecks; NH-9 open with one lane", sev: "red" }
  ];
  // What still produces with few people (STRATEGY §9)
  RC.production = [
    { what: "Panipat refinery", out: "64% of normal", note: "Enough diesel for towers and trucks for 3 weeks", sev: "green" },
    { what: "Mathura refinery", out: "38% of normal", note: "Short of operators: 11 asked from the register", sev: "orange" },
    { what: "Power plants serving Delhi", out: "71% of demand met", note: "Demand also fell by half", sev: "green" },
    { what: "Automated factories (medicines, packaged food, bottled water)", out: "22 of 41 running", note: "Insulin line at Baddi running on automation", sev: "orange" },
    { what: "Data centres in India", out: "All running", note: "Half the users gone, so spare capacity for alerts and AI", sev: "green" },
    { what: "E-commerce and quick-commerce warehouses, Delhi-NCR", out: "14 with stock", note: "Delivery riders at 41%; can deliver to people who can't travel", sev: "orange" },
    { what: "Food Corporation grain, Delhi", out: "About 40 days of stock", note: "Drivers and loaders are the limit, not grain", sev: "green" }
  ];
  // Weather and land after half of all plants vanished (STRATEGY §2). Effects beyond Day 3 are hypotheses.
  RC.environment = [
    { what: "Heat", now: "41 °C tomorrow in Delhi (IMD)", then: "Less shade and less moisture from plants may add a degree or two in cities: a hypothesis to watch", sev: "orange" },
    { what: "Rain", now: "Showers expected on Day 3 in the hills", then: "Bare slopes lose topsoil; landslide risk up in Uttarakhand and Himachal", sev: "red" },
    { what: "Green cover", now: "About half of all grass, crops and trees gone (satellite vegetation index)", then: "Dust storms on bare fields; the next harvest will be smaller", sev: "orange" },
    { what: "Rivers and coasts", now: "Mangroves halved along the Mithi river", then: "Mumbai floods at high tide; rivers carry more silt", sev: "red" },
    { what: "Pests", now: "Half of rats, locusts and their predators gone", then: "Fast breeders rebound first; watch grain stores within weeks", sev: "" }
  ];
  // Rumours spreading and their corrections, and how far each channel reaches (STRATEGY §5, §6)
  RC.rumours = [
    { text: "Kalpakkam nuclear plant has exploded", where: "Chennai and Mumbai", n: "41,000 forwards", fix: "Not true: the reactors shut down safely at 03:10; radiation monitors read normal", sent: false },
    { text: "Another vanishing at 3 pm today", where: "All India", n: "1.2 M forwards", fix: "Not true: no phone has fallen still since 2:32 pm yesterday", sent: true },
    { text: "Tap water in Delhi is poisoned", where: "North West Delhi", n: "18,000 forwards", fix: "Not true: Delhi Jal Board tested 40 points at 06:00; safe to drink", sent: false }
  ];
  RC.channels = [
    { name: "Emergency alert to every phone (cell broadcast)", reach: "91% of phones in Delhi" },
    { name: "SMS and the missed-call voice line", reach: "Basic phones: 6.2 M in Delhi" },
    { name: "WhatsApp bot", reach: "2.4 M people asked it something today" },
    { name: "All India Radio and FM", reach: "14 stations on air, bulletin every hour" },
    { name: "TV scrolls (Doordarshan and 22 private channels)", reach: "Where power is back" },
    { name: "Loudspeakers at police stations and places of worship", reach: "1,900 points in Delhi" }
  ];
  // "Is this true?": checked against official sources only. Anything else gets "not confirmed".
  RC.factcheck = [
    { keys: ["kalpakkam", "nuclear", "reactor", "radiation"], verdict: "Not true", text: "The Kalpakkam reactors shut down safely at 03:10. Radiation monitors around the plant read normal at 07:00.", src: "Nuclear Power Corporation and the Atomic Energy Regulatory Board, 07:00" },
    { keys: ["3 pm", "second", "again", "another vanish", "vanish again"], verdict: "Not true", text: "No phone anywhere has fallen still since 2:32 pm yesterday. Networks check every minute.", src: "National Disaster Management Authority, 06:00" },
    { keys: ["water", "poison", "tap"], verdict: "Not true", text: "Delhi Jal Board tested 40 points at 06:00. Tap water in Rohini is safe to drink; pressure is low.", src: "Delhi Jal Board, 06:40" },
    { keys: ["school", "sector 7", "water point", "tanker"], verdict: "Confirmed", text: "Drinking water at Govt Sr Sec School, Sector 7, with police present. A 2,000-litre tanker arrives at 8 am.", src: "Delhi Disaster Management Authority, 06:45; 14 people there confirm" },
    { keys: ["free food", "red fort", "distribution"], verdict: "Not confirmed", text: "No official source and nobody on the spot has said this. Don't travel on it: ration shops listed in Help is coming are open.", src: "No official notice found" }
  ];
  // Verified contributors: places that update their own status (STRATEGY §4). Tier 1 is strictest.
  RC.contributors = [
    { id: "clinic", name: "Mohalla Clinic, Sector 7", kind: "Clinic", tier: 1, how: "Matched to the health facility registry; 3 staff phones here now", open: true, queue: 40, stock: [["ORS", "Plenty"], ["Paracetamol", "Plenty"], ["Insulin", "Out"]], capacity: "1 doctor, 2 nurses", needs: "A second doctor; insulin" },
    { id: "pharmacy", name: "Apollo Pharmacy, Sector 8", kind: "Pharmacy", tier: 2, how: "Matched to its drug licence; the pharmacist's phone is here", open: true, queue: 15, stock: [["Insulin", "Low"], ["Metformin", "Plenty"], ["Amlodipine", "Plenty"]], capacity: "1 pharmacist", needs: "Cold-chain insulin delivery" },
    { id: "ration", name: "Ration shop 112, Sector 7", kind: "Ration shop", tier: 1, how: "Matched to its sales machine (ePoS); the dealer's phone is here", open: true, queue: 140, stock: [["Rice", "Plenty"], ["Wheat", "Plenty"], ["Sugar", "Low"]], capacity: "1 dealer", needs: "A helper to manage the queue" },
    { id: "gurudwara", name: "Gurudwara, Sector 7", kind: "Shelter and kitchen", tier: 3, how: "Vouched for by the ward officer; 6 volunteer phones here", open: true, queue: 10, stock: [["Meals", "Plenty"], ["Drinking water", "Plenty"], ["Blankets", "Low"]], capacity: "120 people tonight", needs: "Blankets; a doctor's visit" }
  ];
  // Emergency powers in use, in plain words
  // "How we're doing": the case-log figures the model does not produce (simulated). The two pages, section 7 and 8, set the goals.
  RC.govDoing = {
    // cant: of the cases with nobody going within 2 hours, the share where someone still replied "2: can't go" within 30 minutes
    cant: 0.3, found: 0.94,
    guard: [
      ["A child goes to the wrong person", "Wrong handovers, found by the Day 3 welfare call", "None so far", "None", "Pause handovers outside family in that ward", "green"],
      ["A living person is marked gone", "\u201cGone\u201d later corrected", "0.4%", "Under 1%", "Hold that network's cases for a check by a person", "green"],
      ["An adult was home all along", "False alarms (a wasted visit costs less than a missed child)", "12%", "Under 15%", "Ask the building first in that area", "green"],
      ["Nobody takes a case", "Cases nobody claimed in 2 hours that 112, 1098 or the anganwadi worker picked up within an hour", "91%", "At least 95%", "Send paid teams there", "orange"],
      ["The data is misused", "Lookups outside a case (there is no search for strangers)", "None", "None", "Daily audit of every access", "green"]]
  };
  RC.govPowers = [
    { what: "Mobile networks search their own records for people alone and send out only each case", law: "Telecommunications Act 2023, s.20: temporary possession of a network in a public emergency, including disaster management (it replaced s.5 of the Telegraph Act)", by: "Union Home Ministry order, 03:40", ends: "Lapses on Day 30 unless renewed" },
    { what: "Empty buildings, vehicles and ownerless stock are taken over", law: "Disaster Management Act 2005, s.65: requisition of resources, premises and vehicles", by: "Each District Magistrate", ends: "Returned, or paid for, when an owner or heir claims" },
    { what: "Anyone who takes in a child must report it within a day", law: "Juvenile Justice Act 2015, s.32", by: "Standing law", ends: "Still Here files the report for them" },
    { what: "A verified carer can see a dependant's medicines", law: "Disaster Management Act 2005, s.34: the district's emergency directions", by: "Delhi Disaster Management Authority order, 06:30", ends: "Ends with the emergency" },
    { what: "Doctors, nurses and operators are asked to work, not ordered", law: "No order: a policy choice", by: "Delhi Disaster Management Authority", ends: "Nobody is conscripted" }
  ];
  RC.gov = {
    persona: { org: "Delhi Disaster Management Authority", role: "Control room" },
    queue: [
      { id: "tihar", scope: "delhi", sev: "urgent", t: "06:12", title: "Tihar Jail is below safe guard strength", where: "Tihar, West Delhi", lonlat: [77.10, 28.63],
        what: "118 of 310 guards are at the jail (38%).", why: "Below half strength the perimeter can't be held. About 14,000 people are held there.",
        act: { label: "Send 2 armed police companies", done: "Requested 07:12. Delhi Armed Police 3rd Battalion confirmed 07:20, arriving 08:00." },
        alt: { label: "Order a lockdown", done: "Lockdown ordered 07:12. Cells sealed, yard closed." }, src: "Prison staff roll call, 05:30–07:10" },
      { id: "armoury", scope: "delhi", sev: "urgent", t: "05:50", title: "Rohini police armoury has nobody guarding it", where: "Sector 14, Rohini", lonlat: [77.09, 28.74],
        what: "No staff phone has been at the armoury since 2:32 pm yesterday.", why: "Weapons are stored on site. An unguarded armoury is the fastest way for raiders to arm.",
        act: { label: "Send a team to secure it", done: "Rohini police team 1 sent 07:13, arriving 07:35." },
        alt: { label: "Move the weapons out", done: "Transfer to Kingsway Camp approved, convoy 09:00." }, src: "Police staff roll call" },
      { id: "children", scope: "delhi", sev: "urgent", t: "07:10", dyn: "children", title: "Small children nobody is coming for", where: "Across Delhi, worst in the north-west", lonlat: [77.05, 28.70],
        what: "", why: "They are under five, and nobody who knows them is going: some have nobody left, and the others' people haven't answered. Their addresses are known. A toddler has two or three days without water.", keepOpen: true,
        act: { label: "Send paired teams to the five worst wards", done: "Police and ASHA pairs sent 07:14 to the five worst wards. Reports due by 09:00; the item stays open until they confirm children reached." },
        alt: { label: "See the list by ward", open: "wards" }, src: "Case messages and the anganwadi register" },
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
        what: "", why: "It has the second-largest number of children alone and the fewest responders per head.",
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
      { role: "Doctors", reg: "National Medical Commission register", alive: 11200, of: 22600, onduty: 6400, asked: 2600, came: 1180, need: "Dr. BSA Hospital and LNJP: emergency wards at under half their doctors" },
      { role: "Nurses", reg: "Delhi Nursing Council register", alive: 24100, of: 48300, onduty: 15200, asked: 4800, came: 2050, need: "Dialysis and newborn units in every district" },
      { role: "ASHA and anganwadi workers", reg: "Health and child development department lists", alive: 5450, of: 10900, onduty: 3120, asked: 1400, came: 980, need: "The wards with the most small children nobody is going for" },
      { role: "Pharmacists", reg: "Pharmacy Council register", alive: 8400, of: 16900, onduty: 4200, asked: 2000, came: 960, need: "Insulin and blood pressure tablets in North West Delhi" },
      { role: "Water plant operators", reg: "Delhi Jal Board roster", alive: 61, of: 122, onduty: 31, asked: 30, came: 12, need: "Haiderpur plant: 6 of 11" },
      { role: "Electrical engineers", reg: "Power company rosters", alive: 290, of: 580, onduty: 160, asked: 120, came: 77, need: "Badarpur substation: 2 of 9" },
      { role: "Truck and bus drivers", reg: "Commercial driving licences (Sarathi, transport department)", alive: 41000, of: 82000, onduty: 9800, asked: 6000, came: 2900, need: "Narela godown: 22 trucks short for 1,200 t of grain" },
      { role: "Electricians and linemen", reg: "Licensed wiremen and power company rosters", alive: 9600, of: 19200, onduty: 2700, asked: 1500, came: 640, need: "Substations and hospital generators" },
      { role: "Plumbers and pump operators", reg: "Delhi Jal Board contractors and ITI records", alive: 5200, of: 10400, onduty: 1100, asked: 600, came: 240, need: "Pumping stations running on diesel" },
      { role: "Teachers", reg: "School staff records (UDISE+)", alive: 52000, of: 104000, onduty: 3900, asked: 2000, came: 1450, need: "Care points in schools need two adults each" },
      { role: "Cooks and caterers", reg: "Food licences (FSSAI) and the hotels' association", alive: 26000, of: 52000, onduty: 3400, asked: 1800, came: 1200, need: "Langars and care-point kitchens" },
      { role: "Pilots and air traffic controllers", reg: "Licences issued by the DGCA", alive: 3100, of: 6200, onduty: 420, asked: 300, came: 210, need: "Relief flights from Hyderabad and Chennai" },
      { role: "Network and payment engineers", reg: "Employer records (EPFO)", alive: 18000, of: 36000, onduty: 6200, asked: 900, came: 610, need: "Mobile networks and UPI, now on automation" },
      { role: "Bank staff and chartered accountants", reg: "Bank rosters and the ICAI register", alive: 31000, of: 62000, onduty: 2100, asked: 0, came: 0, need: "Not today: branches reopen for cash on Day 2" },
      { role: "Lawyers", reg: "Bar Council of Delhi", alive: 54000, of: 108000, onduty: 0, asked: 0, came: 0, need: "Not today: guardianship and inheritance cases from week 2" }
    ],
    supplies: [
      { what: "Grain and water, 40 t", how: "Train", from: "Mumbai Central", to: "Delhi", dep: "04:10", eta: "Day 1 22:00", route: "Western Railway via Vadodara and Kota", fromLL: [72.82, 18.97], toLL: [77.22, 28.64] },
      { what: "Grain from Food Corporation stock, 1,200 t", how: "Trucks", from: "Narela godown", to: "North West Delhi ration shops", dep: "08:00", eta: "10:30", route: "NH-44, GT Karnal Road", fromLL: [77.09, 28.84], toLL: [77.12, 28.70] },
      { what: "Water tankers, 42", how: "Tankers", from: "Haiderpur plant", to: "Rohini and Mangolpuri water points", dep: "07:40", eta: "08:15", route: "Outer Ring Road", fromLL: [77.14, 28.72], toLL: [77.07, 28.69] },
      { what: "60 doctors and 4 t of medicine", how: "Air Force", from: "Hyderabad", to: "Patna", dep: "03:50", eta: "07:40", route: "C-17 flight", fromLL: [78.49, 17.39], toLL: [85.14, 25.59] },
      { what: "120 power engineers", how: "Train", from: "Chennai", to: "Bhubaneswar", dep: "04:30", eta: "Day 1 23:00", route: "Coromandel line", fromLL: [80.27, 13.08], toLL: [85.82, 20.30] }
    ],
    // Each district's share of Delhi's surviving people (pop) and of today's food, water and staff (alloc)
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
      { q: "Under five, nobody going, alone over 12 hours", n: 735, order: "First" },
      { q: "On a ventilator or dialysis, where the site is short of staff", n: 212, order: "First" },
      { q: "Over 75, nobody going", n: 1140, order: "Second" },
      { q: "Age 6 to 17, nobody going", n: 980, order: "Second" }
    ],
    world: {
      aid: [ { from: "SGP", to: "IDN", what: "Medical teams, 12 aircraft", t: "06:40" }, { from: "ARE", to: "IND", what: "Water units, 40 t", t: "06:55" }, { from: "KOR", to: "VNM", what: "Grid engineers, 60", t: "07:00" }, { from: "DEU", to: "UKR", what: "Fuel, 18 trucks", t: "07:05" } ]
    }
  };
})(window.RC);
