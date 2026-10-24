/* Light or dark, chosen by the viewer and remembered in this browser; until they choose, it follows the system. */
(function () {
  var K = "stillhere-theme", root = document.documentElement, t = null;
  try { t = localStorage.getItem(K); } catch (e) {}
  if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
  var now = function () { return root.getAttribute("data-theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); };
  var ICON = { light: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    dark: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' };
  // The button shows what a tap switches to: a moon in light mode, a sun in dark mode
  var paint = function () { var m = now(); document.querySelectorAll("[data-theme-toggle]").forEach(function (b) { b.innerHTML = ICON[m]; b.setAttribute("aria-label", m === "dark" ? "Switch to light" : "Switch to dark"); b.title = b.getAttribute("aria-label"); }); };
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-theme-toggle]"); if (!b) return;
    var n = now() === "dark" ? "light" : "dark"; root.setAttribute("data-theme", n); try { localStorage.setItem(K, n); } catch (er) {} paint(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint); else paint();
})();
