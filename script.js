let players = {
  player1: { name: "", score: 0 },
  player2: { name: "", score: 0 },
};
let currentPlayer = "player1";
let questions = [];
let categories = [];
let selectedCategory;
let questionIndex = 0;
const difficultyPoints = { easy: 10, medium: 15, hard: 20 };
const apiUrl = "https://opentdb.com/api.php";
let timer; // Variable to hold the countdown timer
let timeLimit = 15; // Time limit in seconds for each question

// Function to start the game by setting up players and fetching categories
async function startGame() {
  players.player1.name = document.getElementById("player1-name").value;
  players.player2.name = document.getElementById("player2-name").value;

  if (!players.player1.name || !players.player2.name) {
    alert("Please enter names for both players.");
    return;
  }

  await fetchCategories();

  document.getElementById("player-setup").style.display = "none";
  document.getElementById("category-selection").style.display = "block";
}

// Function to fetch categories from the API
async function fetchCategories() {
  try {
    const response = await fetch("https://opentdb.com/api_category.php");
    if (!response.ok) throw new Error("Failed to fetch categories");

    const data = await response.json();
    console.log(data);
    categories = data.trivia_categories;
    populateCategoryDropdown();
  } catch (error) {
    console.error("Error fetching categories:", error);
    alert("Failed to load categories. Please check your internet connection.");
  }
}

// Populate category dropdown
/*function populateCategoryDropdown() {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = ""; // Clear previous entries

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoryList.appendChild(option);
  });
}*/
// Populate category dropdown and disable previously selected categories
function populateCategoryDropdown() {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = ""; // Clear previous entries

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    option.disabled = category.name === selectedCategory; // Disable if already selected
    categoryList.appendChild(option);
  });
}


// Function to fetch questions for the selected category
async function fetchQuestions(categoryId) {
  questions = [];
  const difficulties = ["easy", "medium", "hard"];
  const loadingMessage = document.getElementById("loading-message");
  document.getElementById("category-selection").style.display = "none";
  loadingMessage.style.display = "block";
  for (const difficulty of difficulties) {
    console.log(difficulty);
    try {
      const response = await fetch(
        `${apiUrl}?amount=2&category=${categoryId}&difficulty=${difficulty}&type=multiple`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch ${difficulty} questions`);

      const data = await response.json();
      console.log(data);

      if (data.results.length === 0) {
        console.warn(`No ${difficulty} questions available for this category`);
      }

      questions.push(...data.results);
      if (difficulty!=="hard") // Add fetched questions to the main array
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error fetching ${difficulty} questions:`, error);
      alert(`Failed to fetch questions for ${difficulty}.`);
      return;
    }
  }
  loadingMessage.style.display = "none";
  console.log(questions);

  questionIndex = 0;
}

// Function to handle category selection and fetch questions
async function selectCategory() {
  const categoryId = document.getElementById("category-list").value;
  selectedCategory = categories.find(
    (cat) => cat.id === parseInt(categoryId)
  ).name;

  await fetchQuestions(categoryId);

  document.getElementById("category-selection").style.display = "none";
  document.getElementById("question-display").style.display = "block";

  displayQuestion();
}

// Function to start the countdown timer
function startTimer() {
  let timeLeft = timeLimit;
  document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      console.log(`${players[currentPlayer].name} ran out of time.`);
      currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
      questionIndex++;
      displayQuestion();
    }
  }, 1000);
}

// Function to display the current question and options
function displayQuestion() {
  if (questionIndex >= 6) {
     endRound();
    //declareWinner();
    return;
  }

  const question = questions[questionIndex];
  const options = [...question.incorrect_answers, question.correct_answer].sort(
    () => Math.random() - 0.5
  );

  document.getElementById("question-text").textContent = question.question;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.onclick = () => checkAnswer(option);
    optionsContainer.appendChild(button);
  });

  startTimer(); // Start the timer when the question is displayed
}

// Function to check the answer and update scores
function checkAnswer(selectedAnswer) {
  clearInterval(timer); // Stop the timer when an answer is selected

  const question = questions[questionIndex];
  const difficulty = question.difficulty;

  if (selectedAnswer === question.correct_answer) {
    players[currentPlayer].score += difficultyPoints[difficulty];
    console.log(
      `${players[currentPlayer].name} got it right! +${difficultyPoints[difficulty]} points`
    );
  } else {
    console.log(`${players[currentPlayer].name} got it wrong.`);
  }

  updateScoreboard(); // Update the displayed scores after each round

  currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
  questionIndex++;

  displayQuestion();
}

// Function to update the displayed scoreboard
function updateScoreboard() {
  document.getElementById(
    "player1-score"
  ).textContent = `${players.player1.name}: ${players.player1.score} points`;
  document.getElementById(
    "player2-score"
  ).textContent = `${players.player2.name}: ${players.player2.score} points`;
}

// Function to handle round end and display scores
/*function endRound() {
  document.getElementById("question-display").style.display = "none";

  if (categories.length > 1) {
    categories = categories.filter((cat) => cat.name !== selectedCategory);
    document.getElementById("category-selection").style.display = "block";
  } else {
    declareWinner();
  }
}*/
// Function to handle round end and display scores
function endRound() {
  document.getElementById("question-display").style.display = "none";

  // Display the round-end menu with the choice to select a new category or end the game
  document.getElementById("round-end-menu").style.display = "block";
}

// Function to handle selecting another category
function selectAnotherCategory() {
  document.getElementById("round-end-menu").style.display = "none";

  // Disable previously selected categories
  categories = categories.filter((cat) => cat.name !== selectedCategory);
  populateCategoryDropdown();

  if (categories.length > 0) {
    document.getElementById("category-selection").style.display = "block";
  } else {
    alert("No more categories available.");
    declareWinner();
  }
}

// Function to end the game early
function endGame() {
  document.getElementById("round-end-menu").style.display = "none";
  declareWinner();
}


// Function to declare the winner
function declareWinner() {
  document.getElementById("category-selection").style.display = "none";
  document.getElementById("game-end").style.display = "block";

  const winnerText = document.getElementById("winner-text");
  if (players.player1.score > players.player2.score) {
    winnerText.textContent = `${players.player1.name} wins with ${players.player1.score} points!`;
  } else if (players.player2.score > players.player1.score) {
    winnerText.textContent = `${players.player2.name} wins with ${players.player2.score} points!`;
  } else {
    winnerText.textContent = "It's a tie!";
  }
}
