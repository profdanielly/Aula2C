const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');

// Configurações da grade do jogo
const gridSize = 20; // Tamanho de cada bloco (20x20px)
const tileCount = canvas.width / gridSize; // 400 / 20 = 20 blocos de largura/altura

let snake = [];
let food = { x: 0, y: 0 };
let dx = gridSize; // Movimento horizontal inicial
let dy = 0;        // Movimento vertical inicial
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval = null;
let isGameOver = false;
let changingDirection = false; // Evita mudanças bruscas no mesmo tick

highScoreElement.textContent = highScore;

// Iniciar/Resetar o jogo
function startGame() {
  snake = [
    { x: 160, y: 200 },
    { x: 140, y: 200 },
    { x: 120, y: 200 },
    { x: 100, y: 200 }
  ];
  score = 0;
  dx = gridSize;
  dy = 0;
  isGameOver = false;
  scoreElement.textContent = score;

  generateFood();

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 100); // Velocidade do jogo (100ms por quadro)
}

// Loop principal de atualização
function gameLoop() {
  if (isGameOver) return;

  changingDirection = false;
  clearCanvas();
  drawFood();
  moveSnake();
  drawSnake();
  checkCollision();
}

// Limpar tela
function clearCanvas() {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Desenhar a cobrinha
function drawSnake() {
  snake.forEach((part, index) => {
    // A cabeça tem uma cor destaque
    ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
    ctx.strokeStyle = '#020617';
    ctx.fillRect(part.x, part.y, gridSize, gridSize);
    ctx.strokeRect(part.x, part.y, gridSize, gridSize);
  });
}

// Mover a cobrinha
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  // Verificar se comeu a comida
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }

    generateFood();
  } else {
    snake.pop(); // Remove o último bloco se não comeu
  }
}

// Gerar comida em local aleatório
function generateFood() {
  food.x = Math.floor(Math.random() * tileCount) * gridSize;
  food.y = Math.floor(Math.random() * tileCount) * gridSize;

  // Garantir que a comida não apareça em cima da cobrinha
  snake.forEach(part => {
    if (part.x === food.x && part.y === food.y) {
      generateFood();
    }
  });
}

// Desenhar comida
function drawFood() {
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

// Checar colisões (parede e próprio corpo)
function checkCollision() {
  const head = snake[0];

  // Colisão com as paredes
  const hitLeft = head.x < 0;
  const hitRight = head.x >= canvas.width;
  const hitTop = head.y < 0;
  const hitBottom = head.y >= canvas.height;

  // Colisão com o próprio corpo
  let hitSelf = false;
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      hitSelf = true;
      break;
    }
  }

  if (hitLeft || hitRight || hitTop || hitBottom || hitSelf) {
    gameOver();
  }
}

// Tela de Game Over
function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FIM DE JOGO!', canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = '14px sans-serif';
  ctx.fillText('Clique em "Reiniciar Jogo" para jogar novamente.', canvas.width / 2, canvas.height / 2 + 25);
}

// Controles do teclado
function changeDirection(event) {
  if (changingDirection) return;

  const key = event.key;
  const goingUp = dy === -gridSize;
  const goingDown = dy === gridSize;
  const goingRight = dx === gridSize;
  const goingLeft = dx === -gridSize;

  if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !goingRight) {
    dx = -gridSize;
    dy = 0;
    changingDirection = true;
  }
  if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !goingDown) {
    dx = 0;
    dy = -gridSize;
    changingDirection = true;
  }
  if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !goingLeft) {
    dx = gridSize;
    dy = 0;
    changingDirection = true;
  }
  if ((key === 'ArrowDown' || key === 's' || key === 'S') && !goingUp) {
    dx = 0;
    dy = gridSize;
    changingDirection = true;
  }
}

// Listeners de eventos
document.addEventListener('keydown', changeDirection);
restartBtn.addEventListener('click', startGame);

// Iniciar o jogo
startGame();