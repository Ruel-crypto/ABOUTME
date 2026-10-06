/*
 * effects.js — shared engine for the About Me quiz.
 *
 * 6 QUESTIONS TOTAL
 *
 * Q1-Q5 = normal questions
 * Q6    = maze game
 *
 * The maze can use:
 *
 *   Quiz.finishMaze(true);
 *   Quiz.finishMaze(false);
 *
 * A TRUE result gives Question 6 +1 point.
 * A FALSE result gives Question 6 +0 points.
 */
(function () {
  "use strict";

  /* =========================================================
     REACTION GIFS
     ========================================================= */

  var GIFS = {
    correct: [
      "https://media.tenor.com/UTrLSr85tYEAAAAC/happy-cat-cat.gif"
    ],

    wrong: [
      "https://media.gifdb.com/a-brown-and-white-cat-is-looking-at-the-camera-with-an-angry-look-on-its-face-mqvxzmixo7xggljh.gif"
    ]
  };


  /* =========================================================
     FALLBACK EMOJIS
     ========================================================= */

  var FALLBACK = {
    correct: ["🎉", "🥳", "🙌", "😹"],
    wrong: ["😡", "🤬", "💢", "😤"]
  };


  /* =========================================================
     REACTION TITLES
     ========================================================= */

  var TITLES = {
    correct: [
      "Correct! 🎉",
      "Yesss! 🙌",
      "You know me! 😎",
      "Nailed it! 💥"
    ],

    wrong: [
      "WRONG! 😠",
      "Nope! 💢",
      "Seriously?! 😤",
      "Bruh. 😒"
    ]
  };


  /* =========================================================
     QUIZ SETTINGS
     ========================================================= */

  var KEY = "aboutme-quiz-v1";

  // IMPORTANT:
  // There are now 6 questions.
  var TOTAL = 6;

  var SHOW_MS = 2800;

  var COLORS = [
    "#ffd23f",
    "#ff5c8a",
    "#19c7a0",
    "#3ba4ff",
    "#ff8a3d",
    "#6a4cff",
    "#ffffff"
  ];


  var reduceMotion = !!(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );


  /* =========================================================
     BASIC HELPERS
     ========================================================= */

  function pick(list) {
    if (!list || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }


  function rand(a, b) {
    return a + Math.random() * (b - a);
  }


  function byId(id) {
    return document.getElementById(id);
  }


  function currentStep() {
    return (
      parseInt(
        document.body.getAttribute("data-step"),
        10
      ) || 0
    );
  }


  /* =========================================================
     SCORE STORAGE
     ========================================================= */

  function emptyState() {
    var a = [];
    var i;

    for (i = 0; i < TOTAL; i++) {
      a.push(null);
    }

    return {
      answers: a
    };
  }


  function load() {
    try {
      var s = JSON.parse(
        sessionStorage.getItem(KEY)
      );

      if (
        s &&
        Array.isArray(s.answers) &&
        s.answers.length === TOTAL
      ) {
        return s;
      }

    } catch (e) {
      // Storage unavailable.
    }

    return emptyState();
  }


  function save(s) {
    try {
      sessionStorage.setItem(
        KEY,
        JSON.stringify(s)
      );
    } catch (e) {
      // Ignore storage errors.
    }
  }


  function reset() {
    save(emptyState());
  }


  function score(s) {
    return s.answers.filter(function (a) {
      return a === true;
    }).length;
  }


  function answeredCount(s) {
    return s.answers.filter(function (a) {
      return a !== null;
    }).length;
  }


  function currentStreak(s) {
    var last = -1;
    var i;
    var n = 0;

    for (i = 0; i < TOTAL; i++) {
      if (s.answers[i] !== null) {
        last = i;
      }
    }

    for (i = last; i >= 0; i--) {
      if (s.answers[i] === true) {
        n++;
      } else {
        break;
      }
    }

    return n;
  }


  /*
   * Records an answer.
   *
   * IMPORTANT:
   * Only the FIRST attempt counts.
   *
   * Example:
   *
   * Question 6:
   * first result = false
   * later result = true
   *
   * Question 6 remains FALSE.
   */
  function record(step, ok) {

    var s = load();

    if (
      step >= 1 &&
      step <= TOTAL &&
      s.answers[step - 1] === null
    ) {
      s.answers[step - 1] = !!ok;
      save(s);
    }

    return s;
  }


  /* =========================================================
     PROGRESS HUD
     ========================================================= */

  function buildHud(step, popIndex) {

    var hud = byId("hud");

    if (!hud) {
      return;
    }

    var s = load();
    var i;
    var items = "";

    for (i = 0; i < TOTAL; i++) {

      var a = s.answers[i];

      var cls =
        a === true
          ? "good"
          : a === false
          ? "bad"
          : (i + 1 === step ? "now" : "");

      if (i === popIndex) {
        cls += " pop";
      }

      var mark =
        a === true
          ? "✓"
          : a === false
          ? "✗"
          : String(i + 1);

      var label =
        "Question " +
        (i + 1) +
        ": " +
        (
          a === true
            ? "right"
            : a === false
            ? "wrong"
            : (
                i + 1 === step
                  ? "current"
                  : "not answered yet"
              )
        );

      items +=
        '<li class="' +
        cls +
        '" aria-label="' +
        label +
        '">' +
        mark +
        "</li>";
    }

    var streak = currentStreak(s);

    hud.innerHTML =
      '<ol class="dots" aria-label="Progress">' +
      items +
      "</ol>" +

      '<div class="tally">' +

      (
        streak >= 2
          ? '<span class="pill streak" aria-label="' +
            streak +
            ' in a row">🔥 ' +
            streak +
            "</span>"
          : ""
      ) +

      '<span class="pill">' +
      score(s) +
      " / " +
      TOTAL +
      " right</span>" +

      "</div>";
  }


  /* =========================================================
     SCREEN FLASH
     ========================================================= */

  function flash(ok) {

    var f = document.createElement("div");

    f.className =
      "flash " +
      (ok ? "good" : "bad");

    document.body.appendChild(f);

    setTimeout(function () {
      f.remove();
    }, 800);
  }


  /* =========================================================
     SCREEN SHAKE
     ========================================================= */

  function shake() {

    if (reduceMotion) {
      return;
    }

    var t =
      document.querySelector(".stage") ||
      document.body;

    t.classList.remove("shake");

    void t.offsetWidth;

    t.classList.add("shake");

    setTimeout(function () {
      t.classList.remove("shake");
    }, 600);
  }


  /* =========================================================
     CONFETTI
     ========================================================= */

  function confetti() {

    if (reduceMotion) {
      return;
    }

    var cv =
      document.createElement("canvas");

    cv.className = "confetti";

    cv.width = window.innerWidth;
    cv.height = window.innerHeight;

    document.body.appendChild(cv);

    var ctx =
      cv.getContext &&
      cv.getContext("2d");

    if (!ctx) {
      cv.remove();
      return;
    }

    var parts = [];
    var i;

    for (i = 0; i < 130; i++) {

      parts.push({
        x:
          cv.width / 2 +
          rand(-60, 60),

        y:
          cv.height * 0.6,

        vx:
          rand(-8, 8),

        vy:
          rand(-18, -6),

        w:
          rand(7, 12),

        h:
          rand(9, 16),

        r:
          rand(0, 6.28),

        vr:
          rand(-0.3, 0.3),

        c:
          pick(COLORS)
      });
    }

    var start = null;

    function frame(t) {

      if (start === null) {
        start = t;
      }

      var age =
        t - start;

      ctx.clearRect(
        0,
        0,
        cv.width,
        cv.height
      );

      parts.forEach(function (p) {

        p.vy += 0.4;
        p.vx *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        p.r += p.vr;

        ctx.save();

        ctx.translate(
          p.x,
          p.y
        );

        ctx.rotate(p.r);

        ctx.fillStyle = p.c;

        ctx.fillRect(
          -p.w / 2,
          -p.h / 2,
          p.w,
          p.h
        );

        ctx.restore();
      });

      if (age < 2800) {
        requestAnimationFrame(frame);
      } else {
        cv.remove();
      }
    }

    requestAnimationFrame(frame);
  }


  /* =========================================================
     REACTION POPUP
     ========================================================= */

  function showReaction(ok, onDone) {

    var kind =
      ok ? "correct" : "wrong";

    var closed = false;

    var born = Date.now();

    var title =
      pick(TITLES[kind]);

    if (ok) {

      var streak =
        currentStreak(load());

      if (streak >= 3) {
        title =
          "🔥 " +
          streak +
          " in a row!";
      }
    }


    var overlay =
      document.createElement("div");

    overlay.className = "rx";

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.setAttribute(
      "aria-label",
      ok
        ? "Correct answer"
        : "Wrong answer"
    );


    var card =
      document.createElement("div");

    card.className =
      "rx-card " +
      (ok
        ? "is-good"
        : "is-bad");

    card.tabIndex = -1;


    var h =
      document.createElement("p");

    h.className =
      "rx-title";

    h.textContent =
      title;

    card.appendChild(h);


    var hint =
      document.createElement("p");

    hint.className =
      "rx-hint";

    hint.textContent =
      "Tap anywhere to keep going";


    function showEmoji() {

      var old =
        card.querySelector(
          ".rx-gif"
        );

      if (old) {
        old.remove();
      }

      if (
        card.querySelector(
          ".rx-emoji"
        )
      ) {
        return;
      }

      var big =
        document.createElement("div");

      big.className =
        "rx-emoji";

      big.textContent =
        pick(FALLBACK[kind]);

      card.insertBefore(
        big,
        hint
      );
    }


    card.appendChild(hint);


    var url =
      pick(
        GIFS[kind] || []
      );


    if (url) {

      var img =
        document.createElement("img");

      img.className =
        "rx-gif";

      img.alt =
        ok
          ? "Funny reaction"
          : "Angry reaction";

      img.onerror =
        showEmoji;

      img.src = url;

      card.insertBefore(
        img,
        hint
      );

    } else {

      showEmoji();
    }


    overlay.appendChild(card);

    document.body.appendChild(
      overlay
    );


    flash(ok);

    if (ok) {
      confetti();
    } else {
      shake();
    }


    card.focus();


    var timer =
      setTimeout(
        close,
        SHOW_MS
      );


    function onKey(e) {

      if (
        Date.now() - born <
        350
      ) {
        return;
      }

      if (
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === " "
      ) {

        e.preventDefault();

        close();
      }
    }


    function close() {

      if (closed) {
        return;
      }

      closed = true;

      clearTimeout(timer);

      document.removeEventListener(
        "keydown",
        onKey
      );

      overlay.remove();

      if (
        typeof onDone ===
        "function"
      ) {
        onDone();
      }
    }


    overlay.addEventListener(
      "click",
      close
    );

    document.addEventListener(
      "keydown",
      onKey
    );
  }


  /* =========================================================
     NORMAL QUESTION ANSWER
     ========================================================= */

  function answer(
    ok,
    rightText,
    wrongText,
    onClosed
  ) {

    var step =
      currentStep();

    record(
      step,
      ok
    );

    buildHud(
      step,
      step - 1
    );


    var fb =
      byId("feedback");


    if (fb) {

      fb.className =
        "feedback show " +
        (ok
          ? "good"
          : "bad");

      fb.textContent =
        (ok ? "✓ " : "✗ ") +
        (
          ok
            ? rightText
            : wrongText
        );
    }


    var next =
      byId("next");


    if (next) {
      next.hidden = false;
    }


    showReaction(
      ok,
      function () {

        if (
          typeof onClosed ===
          "function"
        ) {

          onClosed();

        } else if (next) {

          next.focus();
        }
      }
    );
  }


  /* =========================================================
     MULTIPLE CHOICE
     ========================================================= */

  function multipleChoice(opts) {

    var tiles =
      [].slice.call(
        document.querySelectorAll(
          ".tile"
        )
      );

    var locked = false;


    if (!tiles.length) {
      return;
    }


    function choose(i) {

      if (locked) {
        return;
      }

      if (!tiles[i]) {
        return;
      }

      locked = true;


      var ok =
        tiles[i].getAttribute(
          "data-correct"
        ) === "true";


      tiles.forEach(
        function (t) {
          t.disabled = true;
        }
      );


      tiles.forEach(
        function (t, n) {

          if (
            t.getAttribute(
              "data-correct"
            ) === "true"
          ) {

            t.classList.add(
              "is-correct"
            );

          } else if (
            n === i
          ) {

            t.classList.add(
              "is-wrong"
            );

          } else {

            t.classList.add(
              "is-faded"
            );
          }
        }
      );


      answer(
        ok,
        opts.right ||
          "Correct!",
        opts.wrong ||
          "Wrong!"
      );
    }


    tiles.forEach(
      function (t, i) {

        t.addEventListener(
          "click",
          function () {
            choose(i);
          }
        );
      }
    );


    document.addEventListener(
      "keydown",
      function (e) {

        if (
          locked ||
          document.querySelector(
            ".rx"
          )
        ) {
          return;
        }


        var n =
          parseInt(
            e.key,
            10
          );


        if (
          n >= 1 &&
          n <= tiles.length
        ) {

          choose(
            n - 1
          );
        }
      }
    );
  }


  /* =========================================================
     TYPED ANSWER
     ========================================================= */

  function textGate(opts) {

    var form =
      byId("gate");

    var input =
      byId("answer");

    var fb =
      byId("feedback");

    var busy = false;


    /*
     * Safety check.
     *
     * If this page does not have the
     * typed-answer form, simply do nothing.
     */
    if (
      !form ||
      !input
    ) {
      return;
    }


    form.addEventListener(
      "submit",
      function (e) {

        e.preventDefault();


        if (busy) {
          return;
        }


        var v =
          input.value
            .trim()
            .toLowerCase();


        if (!v) {

          input.focus();

          return;
        }


        var answers =
          opts.answers || [];


        var ok =
          answers.indexOf(v) !== -1;


        var step =
          currentStep();


        record(
          step,
          ok
        );


        buildHud(
          step,
          step - 1
        );


        if (ok) {

          busy = true;


          if (fb) {

            fb.className =
              "feedback show good";

            fb.textContent =
              "✓ " +
              (
                opts.right ||
                "Correct!"
              );
          }


          showReaction(
            true,
            function () {

              if (opts.next) {
                window.location.href =
                  opts.next;
              }
            }
          );


        } else {

          if (fb) {

            fb.className =
              "feedback show bad";

            fb.textContent =
              "✗ " +
              (
                opts.wrong ||
                "Wrong!"
              );
          }


          input.value = "";


          showReaction(
            false,
            function () {
              input.focus();
            }
          );
        }
      }
    );
  }


  /* =========================================================
     QUESTION 6 — MAZE SUPPORT
     =========================================================
     
     Use this from question6.html:

         Quiz.finishMaze(true);

     when the player:
       - collected at least 3 foods he likes
       - reached the man at the finish

     Or:

         Quiz.finishMaze(false);

     if the player did not collect enough.
     ========================================================= */

  function finishMaze(ok) {

    var step = 6;

    /*
     * Make absolutely sure the maze
     * always records itself as Question 6.
     */
    record(
      step,
      !!ok
    );

    buildHud(
      step,
      step - 1
    );


    var fb =
      byId("feedback");


    if (fb) {

      fb.className =
        "feedback show " +
        (
          ok
            ? "good"
            : "bad"
        );


      if (ok) {

        fb.textContent =
          "✓ You collected enough food he likes! He can eat now! 🍽️❤️";

      } else {

        fb.textContent =
          "✗ You didn't collect enough food he likes! You need at least 3! 🍽️";
      }
    }


    /*
     * If there is a normal Next button,
     * reveal it.
     */
    var next =
      byId("next");


    if (next) {
      next.hidden = false;
    }


    /*
     * Show the same reaction used
     * by the other questions.
     */
    showReaction(
      !!ok,
      function () {

        /*
         * If the maze page has its own
         * finish button, let that button
         * handle navigation.
         *
         * Otherwise go directly to results.
         */
        var finishButton =
          byId("mazeFinish");


        if (
          !finishButton &&
          !next
        ) {

          window.location.href =
            "results.html";
        }
      }
    );


    return {
      correct: !!ok,
      score: score(load()),
      total: TOTAL
    };
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  window.showReaction =
    showReaction;


  window.Quiz = {

    /* Quiz information */
    total: TOTAL,


    /* Normal answer system */
    answer: answer,


    /* Multiple choice */
    multipleChoice:
      multipleChoice,


    /* Typed answers */
    textGate:
      textGate,


    /* Maze Question 6 */
    finishMaze:
      finishMaze,


    /* Effects */
    confetti:
      confetti,


    /* Reset quiz */
    reset:
      reset,


    /* Get reaction GIF */
    gif: function (ok) {

      return pick(
        GIFS[
          ok
            ? "correct"
            : "wrong"
        ] || []
      );
    },


    /* Record an answer manually */
    record: function (
      step,
      ok
    ) {

      var s =
        record(
          step,
          !!ok
        );

      buildHud(
        currentStep()
      );

      return {
        answers:
          s.answers,

        score:
          score(s),

        answered:
          answeredCount(s)
      };
    },


    /* Get current quiz state */
    state: function () {

      var s =
        load();


      return {

        answers:
          s.answers,

        score:
          score(s),

        answered:
          answeredCount(s),

        total:
          TOTAL
      };
    }
  };


  /* =========================================================
     INITIALIZE
     ========================================================= */

  function init() {

    buildHud(
      currentStep()
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
