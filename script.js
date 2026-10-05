// Quiz data
const quizData = [
  {
    type: "name",
    question: "What's your name?",
    correctAnswers: ["jamaica"],
    errorMessage: "Wrong name, try again! 👀",
    funFact: "You're Jamaica! Welcome to the quiz! 🎉"
  },
  {
    type: "question",
    question: "Who are you to the handsome man?",
    answers: [
      "Co-worker",
      "Friend",
      "Stranger",
      "Boss"
    ],
    correctAnswers: ["co-worker", "coworker", "workmates", "officemates"],
    funFact: "That's right! You work together! 💼"
  },
  {
    type: "question",
    question: "What's my favorite programming language?",
    answers: ["Python", "JavaScript", "Go", "Rust"],
    correctIndex: 1,
    funFact: "I love JavaScript for its flexibility! 🚀"
  },
  {
    type: "question",
    question: "What's my go-to drink?",
    answers: ["Coffee", "Tea", "Energy Drink", "Water"],
    correctIndex: 0,
    funFact: "Coffee keeps me coding through those long sessions! ☕"
  },
  {
    type: "question",
    question: "What do I enjoy doing outside of work?",
    answers: ["Gaming", "Photography", "Traveling", "All of the above"],
    correctIndex: 3,
    funFact: "I love all of these! They inspire my creativity! 🎨"
  },
  {
    type: "question",
    question: "How many years have I been coding?",
    answers: ["1 year", "3 years", "5 years", "10+ years"],
    correctIndex: 2,
    funFact: "I've been on this coding journey for 5 years! 🔥"
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

// DOM Elements
const nameInput = document.getElementById("nameInput");
const submitNameButton = document.getElementById("submitNameButton");
const nameError = document.getElementById("nameError");
const nameScreen = document.getElementById("nameScreen");
const questionScreen = document.getElementById("questionScreen");
const resultScreen = document.getElementById("resultScreen");
const finalScreen = document.getElementById("finalScreen");
const questionText = document.getElementById("questionText");
const answers = document.getElementById("answers");
const continueButton = document.getElementById("continueButton");
const restartButton = document.getElementById("restartButton");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const confettiContainer = document.getElementById("confettiContainer");

// Initialize
function init() {
  currentQuestion = 0;
  score = 0;
  answered = false;
  showNameScreen();
}

// Show Name Screen
function showNameScreen() {
  nameScreen.classList.remove("hidden");
  questionScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
  nameError.classList.add("hidden");
  nameInput.value = "";
  nameInput.focus();
  updateProgress();
}

// Submit Name
submitNameButton.addEventListener("click", () => {
  const userInput = nameInput.value.trim().toLowerCase();
  const currentData = quizData[0];
  
  if (currentData.correctAnswers.includes(userInput)) {
    nameError.classList.add("hidden");
    createConfetti();
    setTimeout(() => {
      currentQuestion = 1;
      score = 1;
      showQuestion();
    }, 1500);
  } else {
    nameError.classList.remove("hidden");
    nameInput.value = "";
    nameInput.focus();
  }
});

// Allow Enter key on name input
nameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    submitNameButton.click();
  }
});

// Show Question
function showQuestion() {
  nameScreen.classList.add("hidden");
  questionScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
  answered = false;
  
  const data = quizData[currentQuestion];
  questionText.textContent = data.question;
  answers.innerHTML = "";
  
  data.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = answer;
    btn.addEventListener("click", () => selectAnswer(index, data));
    answers.appendChild(btn);
  });
  
  updateProgress();
}

// Select Answer
function selectAnswer(index, data) {
  if (answered) return;
  answered = true;
  
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(btn => btn.classList.add("disabled"));
  
  let isCorrect = false;
  
  if (data.type === "question") {
    isCorrect = index === data.correctIndex;
  }
  
  if (isCorrect) {
    buttons[index].classList.add("correct");
    score++;
  } else {
    buttons[index].classList.add("incorrect");
    buttons[data.correctIndex].classList.add("correct");
  }
  
  setTimeout(() => {
    showResult(isCorrect, data.funFact);
  }, 600);
}

// Show Result
function showResult(isCorrect, funFact) {
  questionScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  
  const resultBox = document.getElementById("resultBox");
  resultBox.innerHTML = `
    <div class="result-message ${isCorrect ? "correct" : "incorrect"}">
      ${isCorrect ? "✓ Correct!" : "✗ Incorrect"}
    </div>
    <div class="result-text">
      ${funFact}
    </div>
  `;
}

// Continue to Next
continueButton.addEventListener("click", () => {
  currentQuestion++;
  
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    showFinalScore();
  }
});

// Show Final Score
function showFinalScore() {
  questionScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.remove("hidden");
  
  const percentage = Math.round((score / quizData.length) * 100);
  let message = "";
  let emoji = "";
  
  if (percentage === 100) {
    message = "Perfect! You know everything! 🌟";
    emoji = "🏆";
  } else if (percentage >= 80) {
    message = "Awesome! You know me so well! 🎉";
    emoji = "⭐";
  } else if (percentage >= 60) {
    message = "Good job! You know quite a bit! 😊";
    emoji = "👍";
  } else if (percentage >= 40) {
    message = "Not bad! Let's hang out more! 😄";
    emoji = "🤔";
  } else {
    message = "Let's get to know each other better! 😜";
    emoji = "🎯";
  }
  
  const scoreBox = document.getElementById("scoreBox");
  scoreBox.innerHTML = `
    <div>${emoji}</div>
    <div class="score-number">${score}/${quizData.length}</div>
    <div>${percentage}%</div>
    <div class="score-message">${message}</div>
  `;
  
  updateProgress();
}

// Update Progress Bar
function updateProgress() {
  const progress = ((currentQuestion + 1) / quizData.length) * 100;
  progressBar.style.width = progress + "%";
  progressText.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
}

// Create Confetti
function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.delay = Math.random() * 0.5 + "s";
    confetti.style.backgroundColor = [
      "#ffd700",
      "#ff69b4",
      "#00bfff",
      "#32cd32",
      "#ff6347"
    ][Math.floor(Math.random() * 5)];
    confettiContainer.appendChild(confetti);
  }
  
  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3500);
}

// Restart Quiz
restartButton.addEventListener("click", () => {
  init();
});

// Start the quiz
init();
