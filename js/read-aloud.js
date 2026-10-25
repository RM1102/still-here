/* read-aloud.js (v2, 25 Oct 2026; written for Still Here from the read-aloud research, tested in macOS WebKit and Chrome): one "Read aloud" that makes sound on the first tap in Safari (macOS, iOS) and Chrome.
   Classic script, no dependencies, so it works under CSP script-src 'self'. Load it before app.js.
   Call ReadAloud.say(...) synchronously inside the click handler: no await, no promise before it.

   Usage:
     ReadAloud.preload(CLIPS);   // once at load: checks which clips exist, so a tap never waits on the network
     ReadAloud.say([{ text: T.en, lang: "en-IN" }, { text: T.hi, lang: "hi-IN" }], { clips: CLIPS, onProblem: toast });
   CLIPS (optional) maps an exact line of text to a same-origin clip, e.g. { "Who is holding...": "audio/who.en.mp3" }.
   If every line has a clip that is not known to be missing, the clips play (an <audio> element plays with the
   iPhone's silent switch on); otherwise the browser's own voices speak. A changed line has no clip, so it is spoken.

   Changes from v1: stops on hashchange (the app's screens are #hash routes, so pagehide never fires between them);
   preloads clips so a missing clip falls back to speech inside the tap (on iOS, speech started later from an audio
   "error" event is outside the tap and stays silent); filters Readium's very-low-quality voices (Fred, Kathy, ...);
   does not retry Chrome's "not-allowed". */
(function () {
  "use strict";
  var ss = window.speechSynthesis, U = window.SpeechSynthesisUtterance;
  var HAS_TTS = !!(ss && U);
  var SETTLE_MS = 250;  // Safari: speak() straight after cancel() can end unspoken (seen on macOS 27.0.1 WebKit); 160-250 ms fixed it in tests
  var START_MS = 2500;  // no "start" event by then: tell the person, because iOS drops a blocked speak() without any event
  // Apple novelty, Eloquence and old low-quality voices share en-US with real voices (readium/speech json/filters).
  var NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Princess|Superstar|Trinoids|Whisper|Wobble|Zarvox|Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Fred|Junior|Kathy|Ralph|Jacques|eSpeak)\b/;
  var PREFER = { "en-IN": ["Rishi", "Veena", "Isha", "Sangeeta"], "hi-IN": ["Lekha", "Kiyara", "Neel"] };
  var NAMES = { en: "English", hi: "Hindi" };
  var voices = [], live = [], gen = 0, lastCancel = -1e9, audio = null, clipState = {};

  function load() { try { voices = ss.getVoices() || []; } catch (e) { voices = []; } }
  // Chrome and current Safari (WebKit 26.3+ OS) both fill the list later and fire voiceschanged. Load early.
  if (HAS_TTS) { load(); if (ss.addEventListener) ss.addEventListener("voiceschanged", load); else ss.onvoiceschanged = load; }

  function norm(l) { return String(l || "").replace(/_/g, "-").toLowerCase(); }

  // Best voice for a language: local voices first (Google network voices fail offline and can stall in Chrome).
  // Safari marks every voice local and default, so those flags only help in Chrome.
  function pick(lang) {
    if (!voices.length) load();
    var want = norm(lang), base = want.split("-")[0], names = PREFER[lang] || [];
    var real = voices.filter(function (v) { return !NOVELTY.test(v.name) && !/eloquence/i.test(v.voiceURI || ""); });
    var pools = [real.filter(function (v) { return v.localService !== false; }), real];
    for (var p = 0; p < pools.length; p++) {
      var exact = pools[p].filter(function (v) { return norm(v.lang) === want; });
      for (var i = 0; i < names.length; i++) for (var j = 0; j < exact.length; j++) if (exact[j].name.indexOf(names[i]) === 0) return exact[j];
      if (exact.length) return exact[0];
      var same = pools[p].filter(function (v) { return norm(v.lang).split("-")[0] === base; });
      if (same.length) return same[0];
    }
    return null;
  }

  // Check each clip once, at load, so say() can choose clip or speech synchronously inside the tap.
  function preload(map) {
    Object.keys(map || {}).forEach(function (t) {
      var url = map[t];
      if (!url || clipState[url]) return;
      clipState[url] = "checking";
      try { fetch(url, { credentials: "same-origin" }).then(function (r) { clipState[url] = r.ok ? "ok" : "bad"; }, function () { clipState[url] = "bad"; }); }
      catch (e) { clipState[url] = "bad"; }
    });
  }

  function stop() {
    gen++;  // every callback from an older request compares against this and gives up
    if (audio) { try { audio.pause(); } catch (e) {} }
    if (HAS_TTS && (ss.speaking || ss.pending)) { lastCancel = Date.now(); ss.cancel(); }
    live = [];
  }

  function say(parts, opts) {
    opts = opts || {};
    var problem = typeof opts.onProblem === "function" ? opts.onProblem : function () {};
    stop();
    var my = gen, clips = opts.clips || {};
    var urls = parts.map(function (p) { return clips[p.text]; });
    if (parts.length && urls.every(function (u) { return u && clipState[u] !== "bad"; })) {
      // No silent "unlock" utterance here: on iOS speech ducks other audio for about a second, which would dip the clip.
      playClips(urls, my, function (i) { speakFrom(parts, i, my, problem, "That recording didn't load. Tap Read aloud again."); });
      return;
    }
    // iOS 16.4+: ask for the media ("playback") session. Safari speaks from its own app process, so this may not reach speech.
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    speakFrom(parts, 0, my, problem);
  }

  function speakFrom(parts, from, my, problem, silentMsg) {
    if (my !== gen) return;
    if (!HAS_TTS) { problem("This browser can't read aloud."); return; }
    var list = [], missing = [];
    for (var k = from; k < parts.length; k++) {
      var p = parts[k], v = pick(p.lang);
      // No voice for this language (only knowable once voices have loaded): skip it, because the default voice
      // reading Devanagari makes a short wrong sound instead of the sentence.
      if (!v && voices.length && norm(p.lang).indexOf("en") !== 0) { missing.push(NAMES[norm(p.lang).split("-")[0]] || p.lang); continue; }
      list.push({ text: p.text, lang: p.lang, voice: v });
    }
    if (missing.length) problem("This device has no " + missing.join(" or ") + " voice, so that part is not read.");
    var msg = silentMsg || "No sound? Check the volume and that the phone isn't on silent, then tap Read aloud again.";
    var wait = lastCancel + SETTLE_MS - Date.now();
    // WebKit forwards the tap to a timer's first run if it fires within 1 s of the tap, so 250 ms still counts on iOS.
    if (wait > 0) setTimeout(function () { speakAt(list, 0, my, 1, problem, msg); }, wait);
    else speakAt(list, 0, my, 1, problem, msg);  // nothing was speaking: speak now, inside the tap
  }

  function speakAt(list, i, my, retries, problem, msg) {
    if (my !== gen) return;
    if (i >= list.length) { live = []; return; }
    var p = list[i], u = new U(p.text), started = false;
    u.lang = p.lang;
    if (p.voice) u.voice = p.voice;
    u.rate = 0.95;
    live.push(u);  // keep a reference: an unreferenced utterance can be garbage-collected and never fire end
    var dog = setTimeout(function () { if (my === gen && !started) problem(msg); }, START_MS);
    function next(err) {
      clearTimeout(dog);
      if (my !== gen) return;
      if (err === "not-allowed") { problem("Tap Read aloud to hear it."); return; }  // Chrome: no user activation yet
      // Safari can end an utterance without ever starting it right after cancel(): wait and speak it once more.
      if (!started && retries > 0) { setTimeout(function () { speakAt(list, i, my, retries - 1, problem, msg); }, SETTLE_MS); return; }
      speakAt(list, i + 1, my, 1, problem, msg);  // one line at a time, so each line keeps its own voice and retry
    }
    u.onstart = function () { started = true; clearTimeout(dog); };
    u.onend = function () { next(); };
    u.onerror = function (e) { next(e && e.error); };  // our own cancel() bumps gen first, so its "canceled"/"interrupted" stop in next()
    if (ss.paused) ss.resume();  // Chrome can be left paused (for example after the tab was in the background)
    ss.speak(u);
  }

  function playClips(urls, my, onFail) {
    if (!audio) { audio = new Audio(); audio.preload = "auto"; }  // one element: once played from a tap it stays allowed
    var i = 0, failed = false;
    // "error" and a rejected play() can both arrive for one failure: mark the clip bad and fall back only once.
    function fail() { if (my === gen && !failed) { failed = true; clipState[urls[i]] = "bad"; onFail(i); } }
    function start() {
      audio.src = urls[i];
      var pr = audio.play();  // called inside the tap for the first clip
      if (pr && pr.catch) pr.catch(function (e) { if (!e || e.name !== "AbortError") fail(); });
    }
    audio.onended = function () { if (my !== gen) return; i++; if (i < urls.length) start(); };
    audio.onerror = fail;
    start();
  }

  // Stop when the person changes screen (hash routes), leaves the page, or hides the tab.
  window.addEventListener("hashchange", stop);
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });

  window.ReadAloud = { say: say, stop: stop, pick: pick, preload: preload };
})();
