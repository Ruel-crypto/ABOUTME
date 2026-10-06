/*
 * effects.js — GIF reactions for the About Me quiz.
 *
 * Usage on any page:   showReaction(isCorrect, onDone)
 *   - correct: funny GIF + confetti
 *   - wrong:   angry GIF + screen shake
 *
 * To change the GIFs, edit the two lists below. Each entry can be a web link
 * (Giphy / Tenor) or a file in your repo, e.g. "gifs/happy1.gif".
 * One is picked at random each time. If a GIF fails to load, a big emoji is
 * shown instead so the reaction never looks broken.
 */
(function () {
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
    correct: ["Correct! 🎉", "Yesss! 🙌", "You know me! 😎"],
    wrong: ["WRONG! 😠", "Nope! 💢", "Seriously?! 😤"]
  };

  var SHOW_MS = 2600;

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var style = document.createElement("style");
  style.textContent =
    ".rx-backdrop{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.6);animation:rx-fade .2s ease-out}" +
    ".rx-card{background:#fff;border-radius:20px;padding:20px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.4);animation:rx-pop .3s cubic-bezier(.2,1.4,.4,1)}" +
    ".rx-card.rx-correct{border:5px solid #2bb673}" +
    ".rx-card.rx-wrong{border:5px solid #db3b3b}" +
    ".rx-title{font-size:1.6em;font-weight:800;margin:0 0 12px}" +
    ".rx-correct .rx-title{color:#2bb673}" +
    ".rx-wrong .rx-title{color:#db3b3b}" +
    ".rx-gif{display:block;width:100%;max-height:300px;object-fit:contain;border-radius:12px}" +
    ".rx-emoji{font-size:6em;line-height:1.2}" +
    ".rx-hint{margin:12px 0 0;font-size:.8em;color:#888}" +
    ".rx-confetti{position:fixed;top:-12px;width:10px;height:14px;z-index:10000;pointer-events:none;animation:rx-fall 2.4s linear forwards}" +
    ".rx-shake{animation:rx-shake .5s}" +
    "@keyframes rx-fade{from{opacity:0}to{opacity:1}}" +
    "@keyframes rx-pop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}" +
    "@keyframes rx-fall{to{transform:translateY(110vh) rotate(720deg)}}" +
    "@keyframes rx-shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-14px)}30%{transform:translateX(12px)}45%{transform:translateX(-10px)}60%{transform:translateX(8px)}75%{transform:translateX(-4px)}}" +
    "@media (prefers-reduced-motion: reduce){.rx-card,.rx-backdrop{animation:none}.rx-confetti{display:none}.rx-shake{animation:none}}";
  document.head.appendChild(style);

  function confetti() {
    if (reduceMotion) return;
    var colors = ["#ffd700", "#ff69b4", "#00bfff", "#32cd32", "#ff8c00", "#a855f7"];
    var pieces = [];
    for (var i = 0; i < 70; i++) {
      var p = document.createElement("div");
      p.className = "rx-confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      document.body.appendChild(p);
      pieces.push(p);
    }
    setTimeout(function () {
      pieces.forEach(function (p) { p.remove(); });
    }, 3200);
  }

  function shake() {
    if (reduceMotion) return;
    var target = document.querySelector(".card") || document.body;
    target.classList.remove("rx-shake");
    void target.offsetWidth; // restart animation
    target.classList.add("rx-shake");
    setTimeout(function () { target.classList.remove("rx-shake"); }, 600);
  }

  window.showReaction = function (isCorrect, onDone) {
    var kind = isCorrect ? "correct" : "wrong";
    var finished = false;

    var backdrop = document.createElement("div");
    backdrop.className = "rx-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-live", "assertive");

    var card = document.createElement("div");
    card.className = "rx-card rx-" + kind;

    var title = document.createElement("p");
    title.className = "rx-title";
    title.textContent = pick(TITLES[kind]);
    card.appendChild(title);

    function showEmoji() {
      var big = document.createElement("div");
      big.className = "rx-emoji";
      big.textContent = pick(FALLBACK[kind]);
      var old = card.querySelector(".rx-gif");
      if (old) old.remove();
      card.insertBefore(big, hint);
    }

    var hint = document.createElement("p");
    hint.className = "rx-hint";
    hint.textContent = "tap to continue";

    var url = pick(GIFS[kind]);
    card.appendChild(hint);
    if (url) {
      var img = document.createElement("img");
      img.className = "rx-gif";
      img.alt = isCorrect ? "Funny reaction" : "Angry reaction";
      img.onerror = showEmoji;
      img.src = url;
      card.insertBefore(img, hint);
    } else {
      showEmoji();
    }

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    if (isCorrect) confetti();
    else shake();

    function close() {
      if (finished) return;
      finished = true;
      backdrop.remove();
      if (typeof onDone === "function") onDone();
    }

    backdrop.addEventListener("click", close);
    setTimeout(close, SHOW_MS);
  };
})();
