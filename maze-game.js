const mazeEl = document.getElementById("maze");
const goodEl = document.getElementById("goodCount");
const badEl = document.getElementById("badCount");
const scoreEl = document.getElementById("mazeScore");
const messageEl = document.getElementById("message");

const SIZE = 15;

// 1 = wall, 0 = walkable. Start is (1,1), finish is (13,13).
const map = [
"111111111111111",
"100000100000001",
"101110101111101",
"101000101000101",
"101011101010101",
"100010001010001",
"111010111011101",
"100010100010001",
"101110101110101",
"100000101000001",
"101111101011101",
"101000001010001",
"101011111010101",
"100000000000001",
"111111111111111"
];

const foods = [
  {r:1,c:3, emoji:"☕", name:"Coffee", good:true},
  {r:3,c:3, emoji:"🍞", name:"Bread", good:true},
  {r:5,c:5, emoji:"🧀", name:"Cheese Bread", good:true},
  {r:9,c:5, emoji:"🍔", name:"Burger", good:true},
  {r:13,c:11, emoji:"🍗", name:"Fried Chicken", good:true},

  {r:1,c:11, emoji:"🍜", name:"Ramen", good:false},
  {r:3,c:9, emoji:"🦀", name:"Crab Food", good:false},
  {r:7,c:11, emoji:"🥤", name:"Soda", good:false},
  {r:9,c:9, emoji:"🍰", name:"Cake", good:false},
  {r:11,c:5, emoji:"🍬", name:"Candy", good:false}
];

let player, collectedGood, collectedBad, finished;

function resetGame() {
  player = {r:1,c:1};
  collectedGood = new Set();
  collectedBad = new Set();
  finished = false;
  render();
  messageEl.textContent = "Reach 🏁 after collecting the foods!";
}

function render() {
  mazeEl.innerHTML = "";
  for (let r=0; r<SIZE; r++) {
    for (let c=0; c<SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell " + (map[r][c] === "1" ? "wall" : "path");
      if (r === 13 && c === 13) {
        cell.classList.add("finish");
        cell.textContent = "🏁";
      }
      const foodIndex = foods.findIndex(f => f.r === r && f.c === c &&
        !collectedGood.has(f.name) && !collectedBad.has(f.name));
      if (foodIndex >= 0) {
        cell.classList.add("food");
        cell.textContent = foods[foodIndex].emoji;
      }
      if (player.r === r && player.c === c) {
        cell.textContent = "👩";
        cell.classList.add("player");
      }
      mazeEl.appendChild(cell);
    }
  }
  goodEl.textContent = collectedGood.size;
  badEl.textContent = collectedBad.size;
  scoreEl.textContent = calculateScore();
}

function calculateScore() {
  const good = collectedGood.size;
  const bad = collectedBad.size;
  // 5 good foods = +5 bonus; exactly 3 = +1; otherwise each good food = +1.
  const base = good === 5 ? 5 : good === 3 ? 1 : good;
  return base - bad;
}

function move(key) {
  if (finished) return;
  let dr=0, dc=0;
  if (key === "ArrowUp") dr=-1;
  if (key === "ArrowDown") dr=1;
  if (key === "ArrowLeft") dc=-1;
  if (key === "ArrowRight") dc=1;

  const nr = player.r + dr, nc = player.c + dc;
  if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || map[nr][nc] === "1") return;

  player = {r:nr,c:nc};

  const food = foods.find(f => f.r === nr && f.c === nc &&
    !collectedGood.has(f.name) && !collectedBad.has(f.name));
  if (food) {
    if (food.good) {
      collectedGood.add(food.name);
      messageEl.textContent = `❤️ You got ${food.name}!`;
    } else {
      collectedBad.add(food.name);
      messageEl.textContent = `❌ Oh no! ${food.name} is a bad food! -1`;
    }
  }

  if (nr === 13 && nc === 13) finishGame();
  render();
}

function finishGame() {
  finished = true;
  const good = collectedGood.size;
  const bad = collectedBad.size;
  const final = calculateScore();

  if (good === 5) {
    messageEl.textContent = `🎉 PERFECT! All 5 foods collected! +5 bonus. Bad foods: ${bad}. Maze score: ${final}`;
  } else {
    messageEl.textContent = `🏁 Finished! ${good}/5 good foods, ${bad} bad foods. Maze score: ${final}`;
  }

  // This is intentionally stored separately so the existing quiz can add it
  // to its accumulated score without changing its original scoring logic.
  localStorage.setItem("mazeBonus", String(final));
  localStorage.setItem("mazeGoodFoods", String(good));
  localStorage.setItem("mazeBadFoods", String(bad));
}

document.addEventListener("keydown", e => {
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    e.preventDefault();
    move(e.key);
  }
});

document.querySelectorAll("[data-key]").forEach(btn =>
  btn.addEventListener("click", () => move(btn.dataset.key))
);
document.getElementById("restart").addEventListener("click", resetGame);

resetGame();
