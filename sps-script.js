// --- DOM Elements ---
const modeComputerButton = document.getElementById('mode-computer');
const modePlayerButton = document.getElementById('mode-player');
const opponentLabel = document.getElementById('opponent-label');
const opponentChoiceLabel = document.getElementById('player2-choice-label'); // Corrected to target player2's choice label

const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const player2NameInputContainer = document.querySelector('.player2-name-input');
const player1Label = document.getElementById('player1-label');
const player1TurnLabel = document.getElementById('player1-turn-label');
const player2TurnLabel = document.getElementById('player2-turn-label');
const player1ChoiceLabel = document.getElementById('player1-choice-label');

const maxPointsSelect = document.getElementById('max-points');
const player1ChoiceButtons = document.querySelectorAll('#player1-choices .choice-button');
const player2ChoiceButtons = document.querySelectorAll('#player2-choices .choice-button');
const allChoiceButtons = document.querySelectorAll('.choice-button'); // For disabling all buttons

const player1ChoicesContainer = document.getElementById('player1-choices');
const player2ChoicesContainer = document.getElementById('player2-choices');

const player1ChoiceDisplay = document.getElementById('player1-choice-display');
const player2ChoiceDisplay = document.getElementById('player2-choice-display');
const roundResultMessage = document.getElementById('round-result-message');
const gameWinnerMessage = document.getElementById('game-winner-message');

const player1ScoreSpan = document.getElementById('player1-score');
const player2ScoreSpan = document.getElementById('player2-score');
const resetButton = document.getElementById('reset-button');
const playAgainButton = document.getElementById('play-again-button');

// Confetti canvas setup
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiContext = confettiCanvas.getContext('2d');
let confettiParticles = [];
const confettiColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

// --- Game State Variables ---
let player1Score = 0;
let player2Score = 0;
let gameMode = 'computer'; // 'computer' or 'player'
let currentPlayerTurn = 1; // 1 for Player 1, 2 for Player 2 (in P vs P mode)
let player1SelectedChoice = null;
let maxScore = parseInt(maxPointsSelect.value);
let gameActive = true;

const choices = ['stone', 'paper', 'scissors'];
const choiceIcons = {
    'stone': '🪨',
    'paper': '📄',
    'scissors': '✂️'
};

// --- Player Name Management ---
function updatePlayerNames() {
    const p1Name = player1NameInput.value.trim() || 'Player 1';
    const p2Name = player2NameInput.value.trim() || 'Player 2';

    player1Label.textContent = p1Name;
    player1TurnLabel.textContent = `${p1Name}'s Turn`;
    player1ChoiceLabel.textContent = `${p1Name} Chose:`;

    if (gameMode === 'computer') {
        opponentLabel.textContent = 'Computer';
        opponentChoiceLabel.textContent = 'Computer Chose:';
        // player2TurnLabel is hidden, no need to update
    } else { // Player vs Player
        opponentLabel.textContent = p2Name;
        player2TurnLabel.textContent = `${p2Name}'s Turn`;
        opponentChoiceLabel.textContent = `${p2Name} Chose:`; // Corrected to use opponentChoiceLabel
    }
}

// --- Game Mode Management ---
function setGameMode(mode) {
    gameMode = mode;
    modeComputerButton.classList.remove('active');
    modePlayerButton.classList.remove('active');

    if (mode === 'computer') {
        modeComputerButton.classList.add('active');
        player2NameInputContainer.style.display = 'none'; // Hide P2 name input
        player2ChoicesContainer.style.display = 'none'; // Hide P2 controls
        player1ChoicesContainer.style.display = 'block'; // Show P1 controls
        player1ChoicesContainer.classList.add('active-player'); // P1 is always active
    } else { // mode === 'player'
        modePlayerButton.classList.add('active');
        player2NameInputContainer.style.display = 'flex'; // Show P2 name input
        player2ChoicesContainer.style.display = 'block'; // Show P2 controls
    }
    updatePlayerNames(); // Update names based on mode
    resetGame(); // Reset game when mode changes
}

// --- Core Game Logic Functions ---

function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

function determineRoundWinner(player1Choice, player2Choice) {
    if (player1Choice === player2Choice) {
        return 'draw';
    } else if (
        (player1Choice === 'stone' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'stone') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
    ) {
        return 'player1-win';
    } else {
        return 'player2-win';
    }
}

function updateGame(p1Choice, p2Choice) {
    if (!gameActive) return;

    // Clear previous animations and messages
    player1ChoiceDisplay.classList.remove('animate-in');
    player2ChoiceDisplay.classList.remove('animate-in');
    roundResultMessage.classList.remove('round-win-animation', 'round-lose-animation', 'round-draw-animation');
    gameWinnerMessage.textContent = ''; // Clear game winner message on new round

    // Remove selected class from all buttons
    allChoiceButtons.forEach(btn => btn.classList.remove('selected'));


    // Short delay for animation reset and display update
    setTimeout(() => {
        player1ChoiceDisplay.textContent = choiceIcons[p1Choice];
        player1ChoiceDisplay.classList.add('animate-in');
        player2ChoiceDisplay.textContent = choiceIcons[p2Choice];
        player2ChoiceDisplay.classList.add('animate-in');

        const result = determineRoundWinner(p1Choice, p2Choice);

        if (result === 'player1-win') {
            player1Score++;
            roundResultMessage.textContent = `${player1NameInput.value.trim() || 'Player 1'} Wins Round! 🎉`;
            roundResultMessage.classList.add('round-win-animation');
        } else if (result === 'player2-win') {
            player2Score++;
            roundResultMessage.textContent = `${opponentLabel.textContent} Wins Round! 😭`;
            roundResultMessage.classList.add('round-lose-animation');
        } else {
            roundResultMessage.textContent = "It's a Draw! 🤝";
            roundResultMessage.classList.add('round-draw-animation');
        }

        player1ScoreSpan.textContent = player1Score;
        player2ScoreSpan.textContent = player2Score;

        checkGameWinner();
    }, 100);
}

function checkGameWinner() {
    let winnerName = null;
    if (player1Score >= maxScore) {
        winnerName = player1NameInput.value.trim() || 'Player 1';
    } else if (player2Score >= maxScore) {
        winnerName = opponentLabel.textContent; // Could be 'Computer' or the actual Player 2 name
    }

    if (winnerName) {
        gameActive = false; // End the game
        gameWinnerMessage.textContent = `${winnerName} wins the game! 🏆`;
        disableChoiceButtons(); // Disable all choice buttons
        playConfetti(); // Trigger confetti animation
        playAgainButton.style.display = 'inline-block'; // Show play again button
    }
}

function disableChoiceButtons() {
    allChoiceButtons.forEach(button => {
        button.disabled = true;
    });
}

function enableChoiceButtons() {
    allChoiceButtons.forEach(button => {
        button.disabled = false;
    });
}

// --- Event Handlers ---

function handleChoiceClick(event) {
    if (!gameActive) return;

    const clickedButton = event.target;
    const chosenByPlayer = parseInt(clickedButton.dataset.player);
    const choice = clickedButton.dataset.choice;

    // Remove selected class from all buttons of the current player first
    if (chosenByPlayer === 1) {
        player1ChoiceButtons.forEach(btn => btn.classList.remove('selected'));
    } else {
        player2ChoiceButtons.forEach(btn => btn.classList.remove('selected'));
    }
    // Add selected class to the clicked button
    clickedButton.classList.add('selected');


    if (gameMode === 'computer') {
        updateGame(choice, getComputerChoice());
    } else { // Player vs Player mode
        if (currentPlayerTurn === 1) {
            player1SelectedChoice = choice;
            player1ChoicesContainer.classList.remove('active-player');
            player2ChoicesContainer.classList.add('active-player');
            roundResultMessage.textContent = `${player2NameInput.value.trim() || 'Player 2'}'s turn to choose...`;
            player1ChoiceDisplay.textContent = '?';
            player2ChoiceDisplay.textContent = '?';
            currentPlayerTurn = 2;

            // Temporarily disable P1 buttons and enable P2 buttons
            player1ChoiceButtons.forEach(btn => { btn.disabled = true; });
            player2ChoiceButtons.forEach(btn => btn.disabled = false);

        } else { // currentPlayerTurn === 2
            const player2Choice = choice;
            updateGame(player1SelectedChoice, player2Choice);
            player1ChoicesContainer.classList.add('active-player');
            player2ChoicesContainer.classList.remove('active-player');
            currentPlayerTurn = 1; // Reset for next round
            player1SelectedChoice = null; // Clear P1's choice

            // Re-enable P1 buttons and disable P2 buttons (if game still active)
            if (gameActive) {
                player1ChoiceButtons.forEach(btn => btn.disabled = false);
                player2ChoiceButtons.forEach(btn => btn.disabled = true);
            }
        }
    }
}

// Function to simulate a button click when a key is pressed
function handleKeyPress(event) {
    if (!gameActive) return; // Don't allow key presses if game is over

    // Prevent default action for keys that might scroll the page if not handled
    if (['r', 'p', 's'].includes(event.key.toLowerCase())) {
        event.preventDefault();
    }

    let chosenButton = null;
    const player1Active = player1ChoicesContainer.classList.contains('active-player');
    const player2Active = player2ChoicesContainer.classList.contains('active-player');

    let currentPlayersButtons;
    if (gameMode === 'computer' || (gameMode === 'player' && player1Active)) {
        currentPlayersButtons = player1ChoiceButtons;
    } else if (gameMode === 'player' && player2Active) {
        currentPlayersButtons = player2ChoiceButtons;
    } else {
        return; // No active player or invalid state
    }

    switch (event.key.toLowerCase()) {
        case 'r': // 'r' for Stone
            chosenButton = Array.from(currentPlayersButtons).find(btn => btn.dataset.choice === 'stone');
            break;
        case 'p': // 'p' for Paper
            chosenButton = Array.from(currentPlayersButtons).find(btn => btn.dataset.choice === 'paper');
            break;
        case 's': // 's' for Scissors
            chosenButton = Array.from(currentPlayersButtons).find(btn => btn.dataset.choice === 'scissors');
            break;
    }

    if (chosenButton && !chosenButton.disabled) {
        chosenButton.click(); // Trigger a click event on the found button
    }
}


function resetGame() {
    player1Score = 0;
    player2Score = 0;
    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;
    player1ChoiceDisplay.textContent = '?';
    player2ChoiceDisplay.textContent = '?';
    roundResultMessage.textContent = '';
    gameWinnerMessage.textContent = '';
    roundResultMessage.classList.remove('round-win-animation', 'round-lose-animation', 'round-draw-animation');
    player1ChoiceDisplay.classList.remove('animate-in');
    player2ChoiceDisplay.classList.remove('animate-in');

    gameActive = true;
    enableChoiceButtons(); // Ensure buttons are enabled
    stopConfetti(); // Stop any ongoing confetti

    currentPlayerTurn = 1;
    player1SelectedChoice = null;
    player1ChoicesContainer.classList.add('active-player');
    player2ChoicesContainer.classList.remove('active-player');
    playAgainButton.style.display = 'none'; // Hide play again button

    // Remove selected class from all buttons
    allChoiceButtons.forEach(btn => btn.classList.remove('selected'));

    // Hide player 2 controls if mode is computer
    if (gameMode === 'computer') {
        player2NameInputContainer.style.display = 'none';
        player2ChoicesContainer.style.display = 'none';
        player1ChoicesContainer.style.display = 'block';
        player1ChoiceButtons.forEach(btn => btn.disabled = false); // Ensure P1 buttons are enabled
    } else {
        player2NameInputContainer.style.display = 'flex';
        player2ChoicesContainer.style.display = 'block';
        player1ChoiceButtons.forEach(btn => btn.disabled = false); // Ensure P1 buttons are enabled
        player2ChoiceButtons.forEach(btn => btn.disabled = true); // P2 buttons disabled until P1 chooses
    }
    updatePlayerNames(); // Update names after reset
}


// --- Confetti Animation Logic (Basic Implementation) ---
function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

class ConfettiParticle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }

    draw() {
        confettiContext.save();
        confettiContext.translate(this.x, this.y);
        confettiContext.rotate(this.rotation * Math.PI / 180);
        confettiContext.globalAlpha = this.alpha;
        confettiContext.fillStyle = this.color;
        confettiContext.fillRect(-this.radius / 2, -this.radius / 2, this.radius, this.radius);
        confettiContext.restore();
    }

    update() {
        this.velocity.y += 0.1; // Gravity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.008; // Fade out
        this.rotation += this.rotationSpeed;
    }
}

function createConfetti() {
    confettiParticles = [];
    const particleCount = 100; // Number of confetti particles
    for (let i = 0; i < particleCount; i++) {
        const x = window.innerWidth / 2; // Start from center top
        const y = window.innerHeight / 2;
        const radius = Math.random() * 10 + 5;
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const velocity = {
            x: (Math.random() - 0.5) * 15, // Spread horizontally
            y: (Math.random() - 1) * 15 // Shoot upwards
        };
        confettiParticles.push(new ConfettiParticle(x, y, radius, color, velocity));
    }
}

let animationFrameId; // To control the animation loop

function animateConfetti() {
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const particle = confettiParticles[i];
        particle.update();
        if (particle.alpha > 0 && particle.radius > 0) {
            particle.draw();
        } else {
            confettiParticles.splice(i, 1);
        }
    }

    if (confettiParticles.length > 0) {
        animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
        stopConfetti(); // Ensure animation stops if all particles fade out
    }
}

function playConfetti() {
    resizeConfettiCanvas(); // Ensure canvas is sized correctly
    createConfetti();
    stopConfetti(); // Stop any previous animation loop
    animationFrameId = requestAnimationFrame(animateConfetti);
    // Automatically stop after a duration if particles don't fade out fast enough
    setTimeout(stopConfetti, 3000); // Stop after 3 seconds
}

function stopConfetti() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    confettiParticles = []; // Clear particles
}


// --- Initial Setup and Event Listeners ---

// Set initial game mode
setGameMode('computer'); // This will call resetGame internally

// Event listeners for player name inputs
player1NameInput.addEventListener('input', updatePlayerNames);
player2NameInput.addEventListener('input', updatePlayerNames);

// Update maxScore when dropdown changes
maxPointsSelect.addEventListener('change', () => {
    maxScore = parseInt(maxPointsSelect.value);
    resetGame(); // Reset game when max points changes
});

modeComputerButton.addEventListener('click', () => setGameMode('computer'));
modePlayerButton.addEventListener('click', () => setGameMode('player'));

// Add event listeners for all choice buttons
allChoiceButtons.forEach(button => button.addEventListener('click', handleChoiceClick));
resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', resetGame); // Play Again button also calls resetGame

// Add event listener for keyboard input
document.addEventListener('keydown', handleKeyPress);

// Initial state for P2 buttons in P vs P mode (they're hidden, but good to manage state)
player2ChoiceButtons.forEach(btn => btn.disabled = true);

// Listen for window resize to adjust confetti canvas
window.addEventListener('resize', resizeConfettiCanvas);