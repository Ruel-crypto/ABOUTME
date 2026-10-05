const questions = [
  {
    question: "Who are you to the handsome man?",
    type: "input",
    acceptedAnswers: ["co-worker", "coworker", "workmates", "officemates"],
    success: "Correct! You are definitely part of the team. 💼",
    fail: "Not quite. Try again!"
  },
  {
    question: "What is my favorite programming language?",
    type: "multiple",
    answers: ["Python", "JavaScript", "Go", "Rust"],
    correctIndex: 1,
    success: "Nice! JavaScript is my favorite. 🚀",
    fail: "Close, but not quite. I love JavaScript."
  },
  {
    question: "What is my go-to drink?",
    type: "multiple",
    answers: ["Coffee", "Tea", "Energy drink", "Water"],
    correctIndex: 0,
    success: "Yep! Coffee keeps me going. ☕",
    fail: "Not this one. I’m definitely a coffee person."
  },
  {
    question: "What do I enjoy outside of work?",
    type: "multiple",
    answers: ["Only sleeping", "Gaming", "Watching TV", "Running"],
    correctIndex: 1,
    success: "Exactly! I enjoy gaming and fun activities. 🎮",
    fail: "Not quite. I’m more into gaming."
  },
  {
    question: "How many years have I been coding?",
    type: "multiple",
    answers: ["1 year", "3 years", "5 years", "10+ years"],
    correctIndex: 2,
    success: "Right! I’ve been coding for 5 years. 🔥",
    fail: "Not this time. I’ve been at it for 5 years."
  }
];

const nameScreen = document.getElementById("nameScreen");
const questionScreen = document.getElementById("questionScreen");
const resultScreen = document.getElementById("resultScreen");
const finalScreen = document.getElementById("finalScreen");
const questionText = document.getElementById("questionText");
const answerArea = document.getElementById("answerArea");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");
const resultBox = document.getElementById("resultBox");
const scoreBox = document.getElementById("scoreBox");
const confettiContainer = document.getElementById("confettiContainer");

let currentQuestionIndex = 0;
let score = 0;
let answered = false;
let currentQuestion = null;

function updateProgress() {
  const totalQuestions = questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
}

function showNameScreen() {
  nameScreen.classList.remove("hidden");
  questionScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");
  nameError.classList.add("hidden");
  nameInput.value = "";
  nameInput.focus();
}

function createConfetti() {
  const colors = ["#ffd700", "#ff69b4", "#00bfff", "#32cd32", "#ff8c00", "#ffffff"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 3000);
}

document.getElementById("submitNameButton").addEventListener("click", () => {
  const value = nameInput.value.trim().toLowerCase();

  if (value === "jamaica") {
    nameError.classList.add("hidden");
    createConfetti();
    setTimeout(() => {
      currentQuestionIndex = 0;
      score = 0;
      showQuestion();
    }, 900);
    return;
  }

  nameError.classList.remove("hidden");
  nameInput.value = "";
  nameInput.focus();
});

function showQuestion() {
  const question = questions[currentQuestionIndex];
  currentQuestion = question;
  answered = false;

  nameScreen.classList.add("hidden");
  questionScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
  finalScreen.classList.add("hidden");

  questionText.textContent = question.question;
  answerArea.innerHTML = "";

  if (question.type === "input") {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "answer-input";
    input.placeholder = "Type your answer...";

    const button = document.createElement("button");
    button.className = "submit-btn";
    button.textContent = "Submit";

    button.addEventListener("click", () => {
      if (answered) return;
      const value = input.value.trim().toLowerCase();
      const isCorrect = question.acceptedAnswers.includes(value);
      answered = true;
      handleAnswer(isCorrect, question.success, question.fail);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        button.click();
      }
    });

    answerArea.appendChild(input);
    answerArea.appendChild(button);
    input.focus();
    return;
  }

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = answer;
    button.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const isCorrect = index === question.correctIndex;
      handleAnswer(isCorrect, question.success, question.fail);
    });
    answerArea.appendChild(button);
  });

  updateProgress();
}

function handleAnswer(isCorrect, successText, failText) {
  const buttons = document.querySelectorAll(".answer-btn");
  const inputs = document.querySelectorAll(".answer-input");

  buttons.forEach((button) => button.classList.add("disabled"));
  inputs.forEach((input) => {
    input.disabled = true;
  });

  if (isCorrect) {
    score += 1;
    if (buttons.length) {
      buttons[currentQuestion.correctIndex].classList.add("correct");
    }
  } else {
    if (buttons.length) {
      buttons[currentQuestion.correctIndex].classList.add("correct");
      const clicked = document.querySelectorAll(".answer-btn");
      clicked.forEach((button, i) => {
        if (i !== currentQuestion.correctIndex && button.classList.contains("disabled") === false) {
          button.classList.add("incorrect");
        }
      });
    }
  }

  resultScreen.classList.remove("hidden");
  questionScreen.classList.add("hidden");

  resultBox.innerHTML = `
    <div class="result-message ${isCorrect ? "correct" : "incorrect"}">${isCorrect ? "✓ Correct!" : "✗ Incorrect"}</div>
    <div class="result-text">${isCorrect ? successText : failText}</div>
  `;

  if (question.type === "input") {
    const answerInput = answerArea.querySelector(".answer-input");
    if (answerInput) {
      answerInput.disabled = true;
    }
    const submitBtn = answerArea.querySelector(".submit-btn");
    if (submitBtn) submitBtn.disabled = true;
  }

  updateProgress();
}

document.getElementById("continueButton").addEventListener("click", () => {
  currentQuestionIndex += 1;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showFinalScreen();
  }
});

function showFinalScreen() {
  const percentage = Math.round((score / questions.length) * 100);

  let message = "";
  if (percentage === 100) message = "Perfect! You know me so well! 🌟";
  else if (percentage >= 80) message = "Awesome! You really know me! 🎉";
  else if (percentage >= 60) message = "Good job! You know me pretty well. 😊";
  else if (percentage >= 40) message = "Not bad at all! We should hang out more. 😄";
  else message = "We need to get to know each other better! 😜";

  finalScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");

  scoreBox.innerHTML = `
    <div>🏆</div>
    <div class="score-number">${score}/${questions.length}</div>
    <div class="score-message">${percentage}%<br>${message}</div>
  `;
}

document.getElementById("restartButton").addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  showNameScreen();
});

showNameScreen();
