# Still Here

**Who's still here. Who's alone. Who's closest.**

A prototype for the day after the Snap, built for the Flipkart APM 2029 case study by Rahul Masand, IIT Delhi.

Live: **https://rm1102.github.io/still-here/**

| Page | What it is |
|---|---|
| [Public app](https://rm1102.github.io/still-here/) | What a survivor sees: who in their circle is gone, who is alone, and the case flow that gets a child reached. |
| [Government view](https://rm1102.github.io/still-here/cockpit.html) | The restricted control room: what needs action, staff at essential sites, fairness of supply, the world. |
| [Lite page](https://rm1102.github.io/still-here/lite.html) | About 8 KB for 2G and old phones: what to do, what's open, first aid. |

Every person, address, number and count is simulated. The maps are real.

## Use it offline

Open the live link once. A service worker saves every file, so the app opens with no signal afterwards.
On Android, use the browser menu and pick Install app. On iPhone, tap Share, then Add to Home Screen.

## Run it locally

No build step. Open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8765
```

## How it is built

Plain HTML, CSS and JavaScript. The design follows Apple's Human Interface Guidelines through the web tokens in `css/apple/`.
One model in `js/model.js` drives every number on every screen, so the counts agree with each other.
Maps are inline SVG generated from open data: India's states and districts, and ward maps for Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad and Pune. Credits and licences are in [NOTICE.md](NOTICE.md).
