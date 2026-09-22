/* Kamal Teja Reddy: portfolio site behaviour.
   Everything here is progressive enhancement: the raw HTML already shows
   complete, correct English content with a fully expanded experience list,
   so a failure anywhere in this file degrades to that, never to a blank
   or broken page. Each feature is wrapped so one failure cannot take down
   the rest. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cssVar = function (name, fallback) {
    try {
      var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
      return isNaN(v) ? fallback : v;
    } catch (e) { return fallback; }
  };

  /* ------------------------------------------------------------------ */
  /* Language switching                                                  */
  /* ------------------------------------------------------------------ */
  var TITLES = {
    en: "Kamal Teja Reddy | Accountant, Record-to-Report and General Ledger",
    de: "Kamal Teja Reddy | Accountant, Hauptbuchhaltung und Record-to-Report"
  };
  var DESCRIPTIONS = {
    en: "Portfolio of Kamal Teja Reddy, accountant with more than six years in finance and accounting, the last two and a half in Record-to-Report for Telstra at IBM and Infosys. Currently completing an MBA in Berlin.",
    de: "Portfolio von Kamal Teja Reddy, Finanzbuchhalter mit mehr als sechs Jahren Erfahrung im Finanz- und Rechnungswesen, davon zweieinhalb Jahre im Record-to-Report für Telstra bei IBM und Infosys. Derzeit MBA-Studium in Berlin."
  };

  function currentLang() {
    return root.getAttribute("data-lang-active") === "de" ? "de" : "en";
  }

  function updateCvLinks(lang) {
    var links = document.querySelectorAll(".js-cv-link");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute(lang === "de" ? "data-cv-de" : "data-cv-en");
      var name = a.getAttribute(lang === "de" ? "data-cv-de-name" : "data-cv-en-name");
      if (href) { a.setAttribute("href", href); }
      if (name) { a.setAttribute("download", name); }
    }
  }

  function setLangPill(animate) {
    var switches = document.querySelectorAll(".lang-switch");
    var lang = currentLang();
    for (var i = 0; i < switches.length; i++) {
      var group = switches[i];
      var pill = group.querySelector(".lang-pill");
      var buttons = group.querySelectorAll(".lang-option");
      var target = null;
      for (var j = 0; j < buttons.length; j++) {
        var btn = buttons[j];
        var isActive = btn.getAttribute("data-set-lang") === lang;
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (isActive) { target = btn; }
      }
      if (!pill || !target) { continue; }
      if (!animate) {
        var prevT = pill.style.transition;
        pill.style.transition = "none";
        pill.style.transform = "translateX(" + target.offsetLeft + "px)";
        pill.style.width = target.offsetWidth + "px";
        void pill.offsetWidth;
        pill.style.transition = prevT;
      } else {
        pill.style.transform = "translateX(" + target.offsetLeft + "px)";
        pill.style.width = target.offsetWidth + "px";
      }
    }
  }

  var i18nEls = null;
  function getI18nEls() {
    if (!i18nEls) { i18nEls = document.querySelectorAll(".i18n"); }
    return i18nEls;
  }
  var swapBlocks = null;
  function getSwapBlocks() {
    if (!swapBlocks) { swapBlocks = document.querySelectorAll(".t-text-swap"); }
    return swapBlocks;
  }

  function applyLangAttributes(lang) {
    root.setAttribute("lang", lang);
    if (lang === "de") { root.setAttribute("data-lang-active", "de"); }
    else { root.removeAttribute("data-lang-active"); }
    document.title = TITLES[lang];
    var meta = document.querySelector('meta[name="description"]');
    if (meta) { meta.setAttribute("content", DESCRIPTIONS[lang]); }
    updateCvLinks(lang);
  }

  function setLanguage(lang, animate) {
    if (lang !== "en" && lang !== "de") { return; }
    if (lang === currentLang()) { return; }
    try { localStorage.setItem("teja-lang", lang); } catch (e) {}

    if (!animate || reduceMotion) {
      applyLangAttributes(lang);
      setLangPill(false);
      requestAnimationFrame(repositionNavIndicator);
      return;
    }

    var exitDur = cssVar("--text-swap-dur", 120);
    var enterDur = cssVar("--text-swap-enter-dur", 240);
    var blocks = getSwapBlocks();
    // Hero first, then everything else in document order: the hero copy
    // is the most prominent thing on screen, so it should be the first
    // to resolve in the re-typeset ripple rather than whatever happens
    // to sit earliest in the markup (the header nav).
    var ordered = [].slice.call(blocks).sort(function (a, b) {
      var aHero = a.closest(".hero") ? 0 : 1;
      var bHero = b.closest(".hero") ? 0 : 1;
      return aHero - bHero;
    });

    // Exit is synchronised, not staggered: everything fades out together
    // over exitDur so the content swap below has one clean, fast, fixed
    // point to land on, instead of waiting on a long tail of staggered
    // exits (that is what made the previous version feel laggy).
    for (var i = 0; i < blocks.length; i++) { blocks[i].classList.add("is-exit"); }

    window.setTimeout(function () {
      applyLangAttributes(lang);
      setLangPill(true);
      repositionNavIndicator();
      // The re-typeset ripple lives entirely in the enter phase: capped
      // at 6 steps of 20ms (120ms max tail) so it reads as one soft
      // resettle, not a slow crawl down the page.
      var STEP = 20;
      var MAX_STEPS = 6;
      for (var j = 0; j < ordered.length; j++) {
        ordered[j].style.transitionDelay = (Math.min(j, MAX_STEPS) * STEP) + "ms";
        ordered[j].classList.remove("is-exit");
        ordered[j].classList.add("is-enter-start");
      }
      void document.body.offsetHeight; // force reflow so the enter state transitions
      for (var k = 0; k < ordered.length; k++) { ordered[k].classList.remove("is-enter-start"); }
      window.setTimeout(function () {
        for (var m = 0; m < ordered.length; m++) { ordered[m].style.transitionDelay = ""; }
      }, enterDur + (MAX_STEPS * STEP) + 40);
    }, exitDur);
  }

  function initLanguage() {
    applyLangAttributes(currentLang());
    setLangPill(false);
    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setLanguage(this.getAttribute("data-set-lang"), true);
      });
    }
    window.addEventListener("resize", function () { setLangPill(false); });
  }

  /* ------------------------------------------------------------------ */
  /* Mobile nav toggle                                                    */
  /* ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.getElementById("site-nav-mobile");
    if (!toggle || !mobileNav) { return; }
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    var links = mobileNav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Sticky nav: sliding active-section indicator                        */
  /* ------------------------------------------------------------------ */
  var navLinkMap = null;
  function repositionNavIndicator() {
    try {
      var nav = document.querySelector(".site-nav");
      var indicator = nav && nav.querySelector(".nav-indicator");
      if (!nav || !indicator) { return; }
      var current = nav.querySelector('a[aria-current="true"]');
      if (!current) { indicator.classList.remove("is-visible"); return; }
      indicator.style.transform = "translateX(" + current.offsetLeft + "px)";
      indicator.style.width = current.offsetWidth + "px";
      indicator.classList.add("is-visible");
    } catch (e) {}
  }

  function initSectionNav() {
    var sections = document.querySelectorAll("main section[id]");
    var deskLinks = document.querySelectorAll(".site-nav a[href^='#']");
    var mobLinks = document.querySelectorAll(".site-nav-mobile a[href^='#']");

    function setActive(id) {
      var all = [].slice.call(deskLinks).concat([].slice.call(mobLinks));
      for (var i = 0; i < all.length; i++) {
        var isCurrent = all[i].getAttribute("href") === "#" + id;
        if (isCurrent) { all[i].setAttribute("aria-current", "true"); }
        else { all[i].removeAttribute("aria-current"); }
      }
      repositionNavIndicator();
    }

    // The indicator should jump to the clicked link immediately rather
    // than waiting for the smooth scroll to settle and the intersection
    // observer below to catch up.
    var allLinks = [].slice.call(deskLinks).concat([].slice.call(mobLinks));
    for (var li = 0; li < allLinks.length; li++) {
      allLinks[li].addEventListener("click", function () {
        var id = this.getAttribute("href").slice(1);
        if (id) { setActive(id); }
      });
    }

    if (!("IntersectionObserver" in window) || sections.length === 0) { return; }
    try {
      var headerH = document.querySelector(".site-header");
      var offset = headerH ? headerH.offsetHeight : 76;
      var obs = new IntersectionObserver(function (entries) {
        var best = null;
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            // Prefer the section whose top is closest to (but still within)
            // the detection band, i.e. the largest top among candidates:
            // sections are stacked with no gaps, so when two overlap the
            // band (one ending, one starting) the one that just started is
            // the section actually in view, not the one mostly scrolled past.
            if (!best || entry.boundingClientRect.top > best.boundingClientRect.top) { best = entry; }
          }
        }
        if (best) { setActive(best.target.id); }
      }, { rootMargin: "-" + (offset + 4) + "px 0px -70% 0px", threshold: 0 });
      for (var i = 0; i < sections.length; i++) { obs.observe(sections[i]); }
      window.addEventListener("resize", repositionNavIndicator);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /* Accordion (experience rows)                                          */
  /* ------------------------------------------------------------------ */
  function initAccordions() {
    var items = document.querySelectorAll(".t-acc");
    for (var i = 0; i < items.length; i++) {
      (function (acc) {
        acc.setAttribute("data-open", "false");
        var head = acc.querySelector(".t-acc-head");
        if (!head) { return; }
        head.addEventListener("click", function () {
          var open = acc.getAttribute("data-open") === "true";
          acc.setAttribute("data-open", String(!open));
          head.setAttribute("aria-expanded", String(!open));
        });
      })(items[i]);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Hero text reveal on load (texts-reveal pattern)                     */
  /* ------------------------------------------------------------------ */
  function initHeroReveal() {
    var hero = document.querySelector(".hero");
    var block = document.querySelector(".hero-copy.t-stagger");
    if (!hero || !block) { return; }
    if (reduceMotion) { return; }
    hero.classList.add("is-armed");
    block.classList.add("is-armed");
    // Force a synchronous style/layout flush so the browser commits the
    // armed (hidden) styles as the current computed state before anything
    // else runs. Without this, a double rAF is not reliable everywhere
    // (some engines can fire both callbacks within the same tick, before
    // the armed state is ever used as a transition start point), which
    // makes the whole entrance skip straight to the shown state.
    void hero.offsetHeight;
    var shown = false;
    var show = function () {
      if (shown) { return; }
      shown = true;
      hero.classList.remove("is-armed");
      hero.classList.add("is-shown");
      block.classList.remove("is-armed");
      block.classList.add("is-shown");
    };
    requestAnimationFrame(function () { requestAnimationFrame(show); });
    window.setTimeout(show, 1800); // safety net: never keep the hero hidden
  }

  /* ------------------------------------------------------------------ */
  /* Section reveal on scroll                                             */
  /* ------------------------------------------------------------------ */
  function initSectionReveal() {
    var sections = document.querySelectorAll(".section");
    if (sections.length === 0) { return; }
    if (reduceMotion) { return; }

    function forceRevealAll() {
      for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("is-armed");
        sections[i].classList.add("is-shown");
      }
    }

    if (!("IntersectionObserver" in window)) { return; } // default CSS state is already visible

    try {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var toObserve = [];
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        // A section already substantially in view on load (threshold 0.18
        // from the bottom, mirrored here) plays no entrance at all: only
        // the hero sequence animates on load, per the motion spec.
        if (rect.top < vh * 0.82 && rect.bottom > 0) {
          sections[i].classList.add("is-shown");
        } else {
          sections[i].classList.add("is-armed");
          toObserve.push(sections[i]);
        }
      }
      // Force a style flush so the armed state is committed before the
      // observer can flip anything to shown (see initHeroReveal for why).
      if (toObserve.length) { void toObserve[0].offsetHeight; }
      var obs = new IntersectionObserver(function (entries, observer) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) {
            entries[j].target.classList.remove("is-armed");
            entries[j].target.classList.add("is-shown");
            observer.unobserve(entries[j].target);
          }
        }
      }, { threshold: 0.18 });
      for (var k = 0; k < toObserve.length; k++) { obs.observe(toObserve[k]); }
      // Safety net: an observer bug or a section that never intersects
      // must not leave content invisible.
      window.setTimeout(forceRevealAll, 1800);
    } catch (e) {
      forceRevealAll();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Numbers: pop-in once visible                                        */
  /* ------------------------------------------------------------------ */
  function initNumberPopIn() {
    var grid = document.querySelector(".numbers-grid");
    if (!grid) { return; }
    var groups = grid.querySelectorAll(".t-digit-group");
    function animate() {
      grid.classList.remove("is-armed");
      grid.classList.add("is-animating");
      for (var i = 0; i < groups.length; i++) { groups[i].classList.add("is-animating"); }
    }
    if (reduceMotion || !("IntersectionObserver" in window)) { animate(); return; }
    try {
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var rect = grid.getBoundingClientRect();
      // Already in view on load: show the final numbers immediately,
      // no pop-in, no prefix/caption fade (only the hero plays on load).
      if (rect.top < vh * 0.7 && rect.bottom > 0) {
        for (var g = 0; g < groups.length; g++) { groups[g].classList.add("is-animating"); }
        return;
      }
      grid.classList.add("is-armed");
      void grid.offsetHeight; // force-commit the armed state, see initHeroReveal
      var obs = new IntersectionObserver(function (entries, observer) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) { animate(); observer.disconnect(); break; }
        }
      }, { threshold: 0.3 });
      obs.observe(grid);
      window.setTimeout(animate, 1800); // safety net
    } catch (e) {
      animate();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Header: soft shadow and denser background past 24px of scroll        */
  /* ------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) { return; }
    var ticking = false;
    function update() {
      ticking = false;
      if (window.scrollY > 24) { header.classList.add("is-scrolled"); }
      else { header.classList.remove("is-scrolled"); }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Reading progress rule                                                */
  /* ------------------------------------------------------------------ */
  function initProgressRule() {
    var rule = document.querySelector(".progress-rule");
    if (!rule) { return; }
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      rule.style.setProperty("--progress", pct + "%");
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                                 */
  /* ------------------------------------------------------------------ */
  function boot() {
    try { initLanguage(); } catch (e) {}
    try { initMobileNav(); } catch (e) {}
    try { initSectionNav(); } catch (e) {}
    try { initAccordions(); } catch (e) {}
    try { initHeroReveal(); } catch (e) {}
    try { initSectionReveal(); } catch (e) {}
    try { initNumberPopIn(); } catch (e) {}
    try { initProgressRule(); } catch (e) {}
    try { initHeaderScroll(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
