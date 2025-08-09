const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.6;
const FLAP_STRENGTH = -10;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;

let score = 0;
let bestScore = 0;

// Load your custom image (make sure filename matches what you upload)
const playerImg = new Image();
playerImg.src = 'player.png'; // <-- CHANGE if you uploaded with a different name or path

const player = {
  x: 80,
  y: 150,
  width: 40,
  height: 30,
  velocity: 0
};

let pipes = [];
let gameOver = false;
let gameStarted = false;

function resetGame() {
  score = 0;
  pipes = [];
  player.y = 150;
  player.velocity = 0;
  gameOver = false;
  gameStarted = false;
  spawnPipe();
}

function spawnPipe() {
  // Random height for top pipe
  const topHeight = Math.floor(Math.random() * (canvas.height - PIPE_GAP - 100)) + 50;
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + PIPE_GAP,
    passed: false
  });
}

function draw() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player (your image)
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // Draw pipes
  ctx.fillStyle = '#0f8b0f'; // green pipes
  pipes.forEach(pipe => {
    // top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    // bottom pipe
    ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
  });

  // Draw score
  ctx.fillStyle = '#fff';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Best: ${bestScore}`, 10, 60);

  if (!gameStarted) {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Click or tap to start', canvas.width/2 - 90, canvas.height/2);
  }

  if (gameOver) {
    ctx.fillStyle = '#f00';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width/2 - 100, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('Click or tap to restart', canvas.width/2 - 90, canvas.height/2 + 30);
  }
}

function update() {
  if (!gameStarted || gameOver) return;

  // Gravity
  player.velocity += GRAVITY;
  player.y += player.velocity;

  // Floor and ceiling collisions
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    gameOver = true;
  }
  if (player.y < 0) {
    player.y = 0;
    player.velocity = 0;
  }

  // Move pipes
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    // Score update
    if (!pipe.passed && pipe.x + PIPE_WIDTH < player.x) {
      score++;
      pipe.passed = true;
      if (score > bestScore) bestScore = score;
    }

    // Collision detection
    if (
      player.x + player.width > pipe.x &&
      player.x < pipe.x + PIPE_WIDTH &&
      (player.y < pipe.topHeight || player.y + player.height > pipe.bottomY)
    ) {
      gameOver = true;
    }
  });

  // Remove offscreen pipes
  if (pipes.length && pipes[0].x + PIPE_WIDTH < 0) {
    pipes.shift();
  }

  // Spawn new pipes
  if (pipes.length === 0 || pipes[pipes.length -1].x < canvas.width - 200) {
    spawnPipe();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', () => {
  if (gameOver) {
    resetGame();
    gameStarted = true;
  } else {
    gameStarted = true;
    player.velocity = FLAP_STRENGTH;
  }
});

resetGame();
gameLoop();
