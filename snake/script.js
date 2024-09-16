window.addEventListener("load", main);

// Canvas and game constants
let canvas, ctx, pauseButton, scoreLabel;
const TILE_SIZE = 20;
const FPS = 10;

// Game variables
let timer = -1;
let vx = 0, vy = 0;
let snakeHeadX, snakeHeadY;
let tailLength = 5;
let snakeTrail = [];
let appleX, appleY;
let score = 0;

// Swipe gestures
let touchStartX = null, touchStartY = null;

function main() {
    initializeCanvas();
    setupEventListeners();
    startGame();
}

function initializeCanvas() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    pauseButton = document.getElementById("pause-button");
    scoreLabel = document.getElementById("score-label");

    resizeCanvas();
}

function setupEventListeners() {
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("keydown", handleKeyPress);
    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);
    pauseButton.addEventListener("click", togglePause);
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(e) {
    if (touchStartX === null || touchStartY === null) return;

    const touch = e.touches[0];
    const xDiff = touchStartX - touch.clientX;
    const yDiff = touchStartY - touch.clientY;

    const direction = Math.abs(xDiff) > Math.abs(yDiff)
        ? (xDiff > 0 ? "left" : "right")
        : (yDiff > 0 ? "up" : "down");

    changeDirectionBasedOnSwipe(direction);

    touchStartX = touchStartY = null;
}

function changeDirectionBasedOnSwipe(direction) {
    switch (direction) {
        case "left":
            if (vx === 0) { vx = -1; vy = 0; }
            break;
        case "up":
            if (vy === 0) { vx = 0; vy = -1; }
            break;
        case "right":
            if (vx === 0) { vx = 1; vy = 0; }
            break;
        case "down":
            if (vy === 0) { vx = 0; vy = 1; }
            break;
    }
}

function startGame() {
    resetGame();
    gameLoop();
}

function resetGame() {
    score = 0;
    tailLength = 5;
    snakeTrail = [];
    snakeHeadX = Math.floor(gridWidth / 2);
    snakeHeadY = Math.floor(gridHeight / 2);
    vx = 0;
    vy = -1;

    for (let i = 0; i < tailLength; i++) {
        snakeTrail.push({ x: snakeHeadX, y: snakeHeadY + 5 - i });
    }

    spawnApple();
}

function spawnApple() {
    appleX = Math.floor(Math.random() * gridWidth);
    appleY = Math.floor(Math.random() * gridHeight);
}

function updateGame() {
    snakeHeadX += vx;
    snakeHeadY += vy;

    if (isOutOfBounds() || isCollidingWithSelf()) {
        handleGameOver();
        return;
    }

    updateSnakeTrail();
    checkAppleCollision();
}

function isOutOfBounds() {
    return snakeHeadX < 0 || snakeHeadX >= gridWidth || snakeHeadY < 0 || snakeHeadY >= gridHeight;
}

function isCollidingWithSelf() {
    return snakeTrail.some(segment => segment.x === snakeHeadX && segment.y === snakeHeadY);
}

function updateSnakeTrail() {
    snakeTrail.push({ x: snakeHeadX, y: snakeHeadY });
    if (snakeTrail.length > tailLength) {
        snakeTrail.shift();
    }
}

function checkAppleCollision() {
    if (snakeHeadX === appleX && snakeHeadY === appleY) {
        tailLength++;
        score++;
        scoreLabel.innerText = `Score: ${score}`;
        spawnApple();
    }
}

function drawGame() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(appleX * TILE_SIZE, appleY * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);

    ctx.fillStyle = "lime";
    snakeTrail.forEach(segment => {
        ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE - 2, TILE_SIZE - 2);
    });
}

function gameLoop() {
    if (timer === -1) return;

    updateGame();
    drawGame();
}

function handleKeyPress(e) {
    if (timer === -1 && e.keyCode !== 32) return;

    switch (e.keyCode) {
        case 32: // Space key
            togglePause();
            break;
        case 37: // Left arrow key
            if (vx === 0) { vx = -1; vy = 0; }
            break;
        case 38: // Up arrow key
            if (vy === 0) { vx = 0; vy = -1; }
            break;
        case 39: // Right arrow key
            if (vx === 0) { vx = 1; vy = 0; }
            break;
        case 40: // Down arrow key
            if (vy === 0) { vx = 0; vy = 1; }
            break;
    }
}

function handleGameOver() {
    score = 0;
    scoreLabel.innerText = "Score: 0";
    resetGame();
}

function pauseGame() {
    clearInterval(timer);
    timer = -1;
    pauseButton.innerText = "play_circle_outline";
}

function resumeGame() {
    timer = setInterval(gameLoop, 1000 / FPS);
    pauseButton.innerText = "pause_circle_outline";
}

function togglePause() {
    if (timer === -1) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 2;
    canvas.height = window.innerHeight - 2;

    gridWidth = Math.floor(canvas.width / TILE_SIZE);
    gridHeight = Math.floor(canvas.height / TILE_SIZE);

    canvas.width = gridWidth * TILE_SIZE;
    canvas.height = gridHeight * TILE_SIZE;

    if (appleX >= gridWidth) spawnApple();
    if (appleY >= gridHeight) spawnApple();
}

let gridWidth, gridHeight;
