const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const mobileButtons = document.querySelectorAll(".control-btn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let food;
let dx;
let dy;
let score;
let bestScore = Number(localStorage.getItem("snake_best_score") || 0);
let gameLoop = null;
let started = false;
let gameOver = false;

bestEl.textContent = bestScore;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  food = randomFoodPosition();
  dx = 1;
  dy = 0;
  score = 0;
  started = false;
  gameOver = false;
  scoreEl.textContent = score;
  draw();
  drawOverlay("Нажми Старт");
}

function randomFoodPosition() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake && snake.some(segment => segment.x === position.x && segment.y === position.y));

  return position;
}

function startGame() {
  if (gameLoop) clearInterval(gameLoop);
  started = true;
  gameOver = false;
  gameLoop = setInterval(update, 120);
}

function restartGame() {
  if (gameLoop) clearInterval(gameLoop);
  initGame();
}

function update() {
  if (gameOver) return;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  const hitWall =
    head.x < 0 ||
    head.y < 0 ||
    head.x >= tileCount ||
    head.y >= tileCount;

  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;

    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("snake_best_score", String(bestScore));
      bestEl.textContent = bestScore;
    }

    food = randomFoodPosition();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const isHead = index === 0;

    ctx.fillStyle = isHead ? "#22c55e" : "#60a5fa";
    roundRect(
      ctx,
      segment.x * gridSize + 2,
      segment.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4,
      6,
      true
    );
  });
}

function drawFood() {
  ctx.fillStyle = "#ef4444";
  roundRect(
    ctx,
    food.x * gridSize + 3,
    food.y * gridSize + 3,
    gridSize - 6,
    gridSize - 6,
    8,
    true
  );
}

function drawOverlay(text) {
  ctx.fillStyle = "rgba(15, 23, 42, 0.58)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#eef2ff";
  ctx.font = "bold 28px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);
  gameLoop = null;
  draw();
  drawOverlay("Game Over");
}

function setDirection(direction) {
  if (!started && !gameOver) {
    startGame();
  }

  if (direction === "up" && dy !== 1) {
    dx = 0;
    dy = -1;
  }
  if (direction === "down" && dy !== -1) {
    dx = 0;
    dy = 1;
  }
  if (direction === "left" && dx !== 1) {
    dx = -1;
    dy = 0;
  }
  if (direction === "right" && dx !== -1) {
    dx = 1;
    dy = 0;
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") setDirection("up");
  if (key === "arrowdown" || key === "s") setDirection("down");
  if (key === "arrowleft" || key === "a") setDirection("left");
  if (key === "arrowright" || key === "d") setDirection("right");

  if (key === " " && !started) {
    startGame();
  }
});

mobileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.dir);
  });
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function roundRect(context, x, y, width, height, radius, fill) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();

  if (fill) context.fill();
}

initGame();
