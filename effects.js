/*
 * effects.js — shared engine for the About Me quiz.
 *
 * It does four things for every page:
 *   1. Keeps score (remembered between pages, so the results page is real).
 *   2. Draws the progress dots at the top.
 *   3. Runs the answer flow for multiple choice and typed answers.
 *   4. Shows the reaction: funny GIF + confetti when right, angry GIF + shake when wrong.
 *
 * TO CHANGE THE GIFS: edit the two lists below. Each entry can be a web link
 * (Giphy / Tenor) or a file in your repo like "gifs/happy2.gif".
 * One is picked at random each time. If a GIF can't load, a big emoji shows instead.
 */
(function () {
  "use strict";

  var GIFS = {
    correct: [
      "https://media.tenor.com/UTrLSr85tYEAAAAC/happy-cat-cat.gif"
      // , "gifs/happy2.gif"
    ],
    wrong: [
      "https://media.gifdb.com/a-brown-and-white-cat-is-looking-at-the-camera-with-an-angry-look-on-its-face-mqvxzmixo7xggljh.gif"
      // , "gifs/angry2.gif"
    ]
  };

  var FALLBACK = {
    correct: ["🎉", "🥳", "🙌", "😹"],
    wrong: ["😡", "🤬", "💢", "😤"]
  };

  var TITLES = {
    correct: ["Correct! 🎉", "Yesss! 🙌", "You know me! 😎", "Nailed it! 💥"],
    wrong: ["WRONG! 😠", "Nope! 💢", "Seriously?! 😤", "Bruh. 😒"]
  };

  var KEY = "aboutme-quiz-v1";
  var TOTAL = 5;
  var SHOW_MS = 2800;
  var COLORS = ["#ffd23f", "#ff5c8a", "#19c7a0", "#3ba4ff", "#ff8a3d", "#6a4cff", "#ffffff"];

  var reduceMotion = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function byId(id) { return document.getElementById(id); }
  function currentStep() { return parseInt(document.body.getAttribute("data-step"), 10) || 0; }

  /* ---------- Score (kept in sessionStorage between pages) ---------- */

  function emptyState() {
    var a = [], i;
    for (i = 0; i < TOTAL; i++) a.push(null);
    return { answers: a };
  }

  function load() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY));
      if (s && Array.isArray(s.answers) && s.answers.length === TOTAL) return s;
    } catch (e) { /* storage blocked: start fresh */ }
    return emptyState();
  }

  function save(s) {
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  function reset() { save(emptyState()); }

  function score(s) {
    return s.answers.filter(function (a) { return a === true; }).length;
  }

  function answeredCount(s) {
    return s.answers.filter(function (a) { return a !== null; }).length;
  }

  function currentStreak(s) {
    var last = -1, i, n = 0;
    for (i = 0; i < TOTAL; i++) if (s.answers[i] !== null) last = i;
    for (i = last; i >= 0; i--) {
      if (s.answers[i] === true) n++; else break;
    }
    return n;
  }

  // Only the first attempt on a question counts.
  function record(step, ok) {
    var s = load();
    if (step >= 1 && step <= TOTAL && s.answers[step - 1] === null) {
      s.answers[step - 1] = ok;
      save(s);
    }
    return s;
  }

  /* ---------- Progress dots at the top ---------- */

  function buildHud(step, popIndex) {
    var hud = byId("hud");
    if (!hud) return;
    var s = load(), i, items = "";
    for (i = 0; i < TOTAL; i++) {
      var a = s.answers[i];
      var cls = a === true ? "good" : a === false ? "bad" : (i + 1 === step ? "now" : "");
      if (i === popIndex) cls += " pop";
      var mark = a === true ? "✓" : a === false ? "✗" : String(i + 1);
      var label = "Question " + (i + 1) + ": " +
        (a === true ? "right" : a === false ? "wrong" : (i + 1 === step ? "current" : "not answered yet"));
      items += '<li class="' + cls + '" aria-label="' + label + '">' + mark + "</li>";
    }
    var streak = currentStreak(s);
    hud.innerHTML =
      '<ol class="dots" aria-label="Progress">' + items + "</ol>" +
      '<div class="tally">' +
      (streak >= 2 ? '<span class="pill streak" aria-label="' + streak + ' in a row">🔥 ' + streak + "</span>" : "") +
      '<span class="pill">' + score(s) + " right</span></div>";
  }

  /* ---------- Effects ---------- */

  function flash(ok) {
    var f = document.createElement("div");
    f.className = "flash " + (ok ? "good" : "bad");
    document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 800);
  }

  function shake() {
    if (reduceMotion) return;
    var t = document.querySelector(".stage") || document.body;
    t.classList.remove("shake");
    void t.offsetWidth; // restart the animation
    t.classList.add("shake");
    setTimeout(function () { t.classList.remove("shake"); }, 600);
  }

  function confetti() {
    if (reduceMotion) return;
    var cv = document.createElement("canvas");
    cv.className = "confetti";
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    document.body.appendChild(cv);
    var ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) { cv.remove(); return; }

    var parts = [], i;
    for (i = 0; i < 130; i++) {
      parts.push({
        x: cv.width / 2 + rand(-60, 60),
        y: cv.height * 0.6,
        vx: rand(-8, 8),
        vy: rand(-18, -6),
        w: rand(7, 12),
        h: rand(9, 16),
        r: rand(0, 6.28),
        vr: rand(-0.3, 0.3),
        c: pick(COLORS)
      });
    }

    var start = null;
    function frame(t) {
      if (start === null) start = t;
      var age = t - start;
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(function (p) {
        p.vy += 0.4;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (age < 2800) requestAnimationFrame(frame); else cv.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- The reaction popup ---------- */

  function showReaction(ok, onDone) {
    var kind = ok ? "correct" : "wrong";
    var closed = false;
    var born = Date.now();

    var title = pick(TITLES[kind]);
    if (ok) {
      var streak = currentStreak(load());
      if (streak >= 3) title = "🔥 " + streak + " in a row!";
    }

    var overlay = document.createElement("div");
    overlay.className = "rx";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", ok ? "Correct answer" : "Wrong answer");

    var card = document.createElement("div");
    card.className = "rx-card " + (ok ? "is-good" : "is-bad");
    card.tabIndex = -1;

    var h = document.createElement("p");
    h.className = "rx-title";
    h.textContent = title;
    card.appendChild(h);

    var hint = document.createElement("p");
    hint.className = "rx-hint";
    hint.textContent = "Tap anywhere to keep going";

    function showEmoji() {
      var old = card.querySelector(".rx-gif");
      if (old) old.remove();
      if (card.querySelector(".rx-emoji")) return;
      var big = document.createElement("div");
      big.className = "rx-emoji";
      big.textContent = pick(FALLBACK[kind]);
      card.insertBefore(big, hint);
    }

    card.appendChild(hint);
    var url = pick(GIFS[kind] || []);
    if (url) {
      var img = document.createElement("img");
      img.className = "rx-gif";
      img.alt = ok ? "Funny reaction" : "Angry reaction";
      img.onerror = showEmoji;
      img.src = url;
      card.insertBefore(img, hint);
    } else {
      showEmoji();
    }

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    flash(ok);
    if (ok) confetti(); else shake();
    card.focus();

    var timer = setTimeout(close, SHOW_MS);

    function onKey(e) {
      if (Date.now() - born < 350) return; // ignore the key press that opened this
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        close();
      }
    }

    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      overlay.remove();
      if (typeof onDone === "function") onDone();
    }

    overlay.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
  }

  /* ---------- Answer flows used by the question pages ---------- */

  // Records the answer, updates the dots, shows feedback + reaction, reveals "Next".
  function answer(ok, rightText, wrongText, onClosed) {
    var step = currentStep();
    record(step, ok);
    buildHud(step, step - 1);

    var fb = byId("feedback");
    if (fb) {
      fb.className = "feedback show " + (ok ? "good" : "bad");
      fb.textContent = (ok ? "✓ " : "✗ ") + (ok ? rightText : wrongText);
    }

    var next = byId("next");
    if (next) next.hidden = false;

    showReaction(ok, function () {
      if (typeof onClosed === "function") onClosed();
      else if (next) next.focus();
    });
  }

  // Tiles: <button class="tile" data-correct="true|false">. Press 1-4 to answer too.
  function multipleChoice(opts) {
    var tiles = [].slice.call(document.querySelectorAll(".tile"));
    var locked = false;

    function choose(i) {
      if (locked) return;
      locked = true;
      var ok = tiles[i].getAttribute("data-correct") === "true";
      tiles.forEach(function (t) { t.disabled = true; });
      tiles.forEach(function (t, n) {
        if (t.getAttribute("data-correct") === "true") t.classList.add("is-correct");
        else if (n === i) t.classList.add("is-wrong");
        else t.classList.add("is-faded");
      });
      answer(ok, opts.right, opts.wrong);
    }

    tiles.forEach(function (t, i) {
      t.addEventListener("click", function () { choose(i); });
    });

    document.addEventListener("keydown", function (e) {
      if (locked || document.querySelector(".rx")) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= tiles.length) choose(n - 1);
    });
  }

  // Typed answer: moves on to opts.next when right, lets them retry when wrong.
  function textGate(opts) {
    var form = byId("gate"), input = byId("answer"), fb = byId("feedback");
    var busy = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      var v = input.value.trim().toLowerCase();
      if (!v) { input.focus(); return; }

      var ok = opts.answers.indexOf(v) !== -1;
      var step = currentStep();
      record(step, ok); // only the first try counts
      buildHud(step, step - 1);

      if (ok) {
        busy = true;
        fb.className = "feedback show good";
        fb.textContent = "✓ " + opts.right;
        showReaction(true, function () { window.location.href = opts.next; });
      } else {
        fb.className = "feedback show bad";
        fb.textContent = "✗ " + opts.wrong;
        input.value = "";
        showReaction(false, function () { input.focus(); });
      }
    });
  }

  /* ---------- Public API ---------- */

  window.showReaction = showReaction;
  window.Quiz = {
    total: TOTAL,
    answer: answer,
    multipleChoice: multipleChoice,
    textGate: textGate,
    confetti: confetti,
    reset: reset,
    gif: function (ok) { return pick(GIFS[ok ? "correct" : "wrong"] || []); },
    state: function () {
      var s = load();
      return { answers: s.answers, score: score(s), answered: answeredCount(s) };
    }
  };

  function init() { buildHud(currentStep()); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
