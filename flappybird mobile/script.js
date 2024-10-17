const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Set canvas size
canvas.width = 320;
canvas.height = 480;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Retrieve high score from local storage
let birdY = 150; // Bird's starting Y position
let gravity = 0.5; // Reduced gravity for a slower fall
let velocity = 1; // Bird's velocity
let lift = -8; // Adjusted lift for a smaller jump
let pipes = []; // Array to store pipes
let pipeWidth = 50; // Width of each pipe
let pipeGap = 120; // Increased space between top and bottom pipes
let pipeInterval = 100; // Frames between pipe creation
let frameCount = 0; // To keep track of frames
let isGameOver = false; // Game over state

// Load sound effects
const jumpSound = new Audio('jump.mp3');
const gameOverSound = new Audio('gameover.mp3');

function drawBird() {
    context.fillStyle = 'yellow';
    context.fillRect(50, birdY, 20, 20); // Draw bird as a square
}

function drawPipes() {
    context.fillStyle = 'green';
    pipes.forEach(pipe => {
        // Draw top pipe
        context.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // Draw bottom pipe
        context.fillRect(pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height - pipe.top - pipeGap);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 1.5; // Reduced speed for easier gameplay
        // Check if pipe has passed the bird
        if (!pipe.passed && pipe.x + pipeWidth < 50) {
            score++;
            pipe.passed = true; // Mark the pipe as passed to avoid multiple scoring
        }
    });
    // Remove pipes that have moved off-screen
    if (pipes.length && pipes[0].x < -pipeWidth) {
        pipes.shift();
    }
    // Add new pipes
    frameCount++;
    if (frameCount % pipeInterval === 0) {
        let pipeTopHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 20)) + 20;
        pipes.push({ x: canvas.width, top: pipeTopHeight, passed: false });
    }
}

function checkCollision() {
    for (let pipe of pipes) {
        // Check collision with pipes
        if (
            50 < pipe.x + pipeWidth &&
            50 + 20 > pipe.x &&
            (birdY < pipe.top || birdY + 20 > pipe.top + pipeGap)
        ) {
            endGame();
        }
    }
    // Check collision with the ground or the ceiling
    if (birdY > canvas.height - 20 || birdY < 0) {
        endGame();
    }
}

function endGame() {
    isGameOver = true;
    gameOverSound.play(); // Play the game-over sound
    // Update high score if the current score is higher
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore); // Save the new high score in local storage
    }
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.fillText('Game Over', 100, 220);
    context.fillText('Tap to Retry', 85, 260);
    // Display final score
    context.fillText(`Final Score: ${score}`, 100, 290);
    context.fillText(`High Score: ${highScore}`, 100, 320);
    // Stop updating and drawing the game
    cancelAnimationFrame(animation);
    canvas.addEventListener('touchstart', resetGame);
}

function resetGame() {
    birdY = 150;
    velocity = 0;
    pipes = [];
    frameCount = 0;
    score = 0; // Reset the score
    isGameOver = false;
    // Remove the event listener to prevent multiple triggers
    canvas.removeEventListener('touchstart', resetGame);
    // Restart the game loop
    draw();
}

function update() {
    velocity += gravity;
    birdY += velocity;
    if (!isGameOver) {
        updatePipes();
        checkCollision();
    }
    if (birdY > canvas.height - 20) {
        birdY = canvas.height - 20;
        velocity = 0;
    }
    if (birdY < 0) {
        birdY = 0;
        velocity = 0;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
    drawScore(); // Show the current score and high score
    update();
    if (!isGameOver) {
        animation = requestAnimationFrame(draw);
    }
}

function drawScore() {
    context.fillStyle = 'black';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 25);
    context.fillText(`High Score: ${highScore}`, 10, 50);
}

// Make the bird jump when pressing space or tapping the screen
window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && !isGameOver) {
        velocity = lift;
        jumpSound.play(); // Play the jump sound
    }
});

canvas.addEventListener('touchstart', function () {
    if (!isGameOver) {
        velocity = lift;
        jumpSound.play(); // Play the jump sound
    }
});

// Start the game loop
let animation = requestAnimationFrame(draw);
