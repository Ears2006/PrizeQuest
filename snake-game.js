// Snake Game Implementation for PrizeQuest
// Global game instance
let snakeGame = null;

class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas not found:', canvasId);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;
    
    // Game state
    this.snake = [];
    this.apple = { x: 0, y: 0 };
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.isRunning = false;
    this.gameLoop = null;
    
    // Level system
    this.level = 1;
    this.applesCollected = 0;
    this.applesPerLevel = 10;
    this.baseSpeed = 150; // milliseconds per frame
    this.currentSpeed = this.baseSpeed;
    
    // Score
    this.score = 0;
    
    // Game mode: 'level' or 'unlimited'
    this.mode = 'level';
    
    // Unlimited mode ad counter
    this.unlimitedGameCount = 0;
    
    // Unlimited mode reward flag
    this.unlimitedRewardGiven = false;
    
    this.init();
  }
  
  init() {
    // Initialize snake in the center
    const centerX = Math.floor(this.tileCount / 2);
    const centerY = Math.floor(this.tileCount / 2);
    
    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY }
    ];
    
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.spawnApple();
    this.updateScore();
  }
  
  spawnApple() {
    let validPosition = false;
    
    while (!validPosition) {
      this.apple.x = Math.floor(Math.random() * this.tileCount);
      this.apple.y = Math.floor(Math.random() * this.tileCount);
      
      // Check if apple spawns on snake
      validPosition = !this.snake.some(segment => 
        segment.x === this.apple.x && segment.y === this.apple.y
      );
    }
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
  }
  
  stop() {
    this.isRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
  
  reset() {
    this.stop();
    this.score = 0;
    this.applesCollected = 0;
    
    // Reset unlimited mode reward flag
    this.unlimitedRewardGiven = false;
    
    // Reset speed based on mode
    if (this.mode === 'unlimited') {
      this.baseSpeed = 120;
      this.currentSpeed = this.baseSpeed;
    } else {
      this.level = 1;
      this.baseSpeed = 150;
      this.currentSpeed = this.baseSpeed;
    }
    
    this.init();
    this.draw();
  }
  
  resetToLevel1() {
    this.stop();
    this.level = 1;
    this.applesCollected = 0;
    this.score = 0;
    this.unlimitedRewardGiven = false;
    this.currentSpeed = this.baseSpeed;
    this.init();
    this.updateScore();
    this.updateLevel();
    this.draw();
  }
  
  changeDirection(newDirection) {
    // Prevent reversing into itself
    if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
      return;
    }
    this.nextDirection = newDirection;
  }
  
  setMode(mode) {
    this.mode = mode;
    if (mode === 'unlimited') {
      this.baseSpeed = 120;
      this.currentSpeed = this.baseSpeed;
      
      // Hide level and progress stats in unlimited mode
      const levelStat = document.querySelector('.pq-snake-stat:nth-child(1)');
      const progressStat = document.querySelector('.pq-snake-stat:nth-child(2)');
      if (levelStat) levelStat.style.display = 'none';
      if (progressStat) progressStat.style.display = 'none';
    } else {
      this.baseSpeed = 150;
      this.currentSpeed = this.baseSpeed;
      
      // Reset unlimited game counter when switching to level mode
      this.unlimitedGameCount = 0;
      
      // Show level and progress stats in level mode
      const levelStat = document.querySelector('.pq-snake-stat:nth-child(1)');
      const progressStat = document.querySelector('.pq-snake-stat:nth-child(2)');
      if (levelStat) levelStat.style.display = 'flex';
      if (progressStat) progressStat.style.display = 'flex';
    }
  }
  
  update() {
    if (!this.isRunning) return;
    
    this.direction = this.nextDirection;
    
    // Calculate new head position
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }
    
    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }
    
    // Add new head
    this.snake.unshift(head);
    
    // Check apple collision
    if (head.x === this.apple.x && head.y === this.apple.y) {
      if (this.mode === 'unlimited') {
        // Unlimited mode: +1 score per apple, increase speed
        this.score += 1;
        this.updateScore();
        this.spawnApple();
        
        // Check if 100 points reached for reward
        if (this.score >= 100 && !this.unlimitedRewardGiven) {
          this.unlimitedRewardGiven = true;
          this.awardUnlimitedReward();
        }
        
        // Increase speed gradually (max speed: 50ms)
        this.currentSpeed = Math.max(50, this.currentSpeed - 2);
        this.stop();
        this.start();
      } else {
        // Level mode: +10 score per apple, check level completion
        this.score += 10;
        this.applesCollected++;
        this.updateScore();
        this.spawnApple();
        
        // Check if level complete
        if (this.applesCollected >= this.applesPerLevel) {
          this.levelComplete();
        }
      }
    } else {
      // Remove tail if no apple collected
      this.snake.pop();
    }
    
    this.draw();
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid (subtle)
    this.ctx.strokeStyle = 'rgba(0, 255, 170, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
    
    // Draw apple
    this.ctx.fillStyle = '#ff4444';
    this.ctx.shadowColor = '#ff4444';
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(
      this.apple.x * this.gridSize + 2,
      this.apple.y * this.gridSize + 2,
      this.gridSize - 4,
      this.gridSize - 4
    );
    this.ctx.shadowBlur = 0;
    
    // Draw snake with Hot Magenta (#FF00FF) and strong vibrant neon glow
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head - bright magenta with maximum neon intensity
        this.ctx.fillStyle = '#FF00FF';
        this.ctx.shadowColor = '#FF00FF';
        this.ctx.shadowBlur = 25;
        
        this.ctx.fillRect(
          segment.x * this.gridSize + 1,
          segment.y * this.gridSize + 1,
          this.gridSize - 2,
          this.gridSize - 2
        );
      } else {
        // Body - magenta with gradient fade and strong glow
        const opacity = 0.95 - (index / this.snake.length) * 0.35;
        this.ctx.fillStyle = `rgba(255, 0, 255, ${opacity})`;
        this.ctx.shadowColor = '#FF00FF';
        this.ctx.shadowBlur = 20;
        
        this.ctx.fillRect(
          segment.x * this.gridSize + 1,
          segment.y * this.gridSize + 1,
          this.gridSize - 2,
          this.gridSize - 2
        );
      }
    });
    
    this.ctx.shadowBlur = 0;
  }
  
  updateScore() {
    // Update score display above gameplay grid
    const scoreDisplayEl = document.getElementById('snake-score-display');
    if (scoreDisplayEl) {
      scoreDisplayEl.textContent = this.score;
    }
    
    // Update progress display above gameplay grid
    const progressDisplayEl = document.getElementById('snake-progress-display');
    if (progressDisplayEl) {
      progressDisplayEl.textContent = `${this.applesCollected}/${this.applesPerLevel}`;
    }
  }
  
  updateLevel() {
    // Update level display above gameplay grid
    const levelDisplayEl = document.getElementById('snake-level-display');
    if (levelDisplayEl) {
      levelDisplayEl.textContent = this.level;
    }
  }
  
  levelComplete() {
    this.stop();
    
    // Show burst animation
    this.showBurstAnimation();
    
    // Show level complete modal after brief delay
    setTimeout(() => {
      this.showLevelCompleteModal();
    }, 500);
  }
  
  showBurstAnimation() {
    // Create confetti burst
    const canvas = this.canvas;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'pq-confetti-particle';
      confetti.style.position = 'fixed';
      confetti.style.left = centerX + 'px';
      confetti.style.top = centerY + 'px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '1000';
      
      const colors = ['rgba(0, 255, 170, 0.9)', 'rgba(0, 200, 255, 0.9)', 'rgba(100, 255, 200, 0.9)'];
      confetti.style.background = colors[i % colors.length];
      
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      confetti.style.animation = `none`;
      confetti.style.transform = `translate(${tx}px, ${ty}px)`;
      confetti.style.opacity = '0';
      confetti.style.transition = 'all 1s ease-out';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.transform = `translate(${tx}px, ${ty + 100}px)`;
        confetti.style.opacity = '0';
      }, 10);
      
      setTimeout(() => confetti.remove(), 1100);
    }
  }
  
  showLevelCompleteModal() {
    const modal = document.getElementById('level-complete-modal');
    if (modal) {
      modal.removeAttribute('hidden');
    }
  }
  
  hideLevelCompleteModal() {
    const modal = document.getElementById('level-complete-modal');
    if (modal) {
      modal.setAttribute('hidden', '');
    }
  }
  
  afterAdComplete() {
    // Proceed directly to next level without ad screen
    // Check if 4 levels completed
    if (this.level >= 4) {
      this.showEntryEarnedModal();
    } else {
      // Advance to next level
      this.level++;
      this.applesCollected = 0;
      this.currentSpeed = Math.max(50, this.baseSpeed - (this.level - 1) * 20);
      this.updateLevel();
      this.updateScore();
      this.reset();
      
      // Show start level button instead of auto-starting
      this.showStartLevelButton();
    }
  }
  
  showStartLevelButton() {
    const startLevelScreen = document.getElementById('start-level-screen');
    const gameOverlay = document.getElementById('game-overlay');
    
    // Ensure overlay is visible to show the start level screen (but don't start countdown)
    // Use 'block' instead of 'flex' - countdown will set it to 'flex' when needed
    if (gameOverlay) {
      gameOverlay.style.display = 'block';
    }
    
    if (startLevelScreen) {
      // Update the level text
      const levelText = document.getElementById('start-level-text');
      if (levelText) {
        levelText.textContent = `Level ${this.level}`;
      }
      startLevelScreen.style.display = 'flex';
    }
  }
  
  hideStartLevelButton() {
    const startLevelScreen = document.getElementById('start-level-screen');
    if (startLevelScreen) {
      startLevelScreen.style.display = 'none';
    }
  }
  
  showEntryEarnedModal() {
    const modal = document.getElementById('entry-earned-modal');
    if (modal) {
      modal.removeAttribute('hidden');
    }
  }
  
  hideEntryEarnedModal() {
    const modal = document.getElementById('entry-earned-modal');
    if (modal) {
      modal.setAttribute('hidden', '');
    }
  }
  
  claimEntry() {
    this.hideEntryEarnedModal();
    
    // Show ticket choice modal from main app
    const ticketModal = document.getElementById('ticket-modal');
    if (ticketModal) {
      ticketModal.removeAttribute('hidden');
    }
    
    // Reset game to level 1
    this.resetToLevel1();
    
    // Show start level button for level 1
    this.showStartLevelButton();
  }
  
  gameOver() {
    this.stop();
    
    // Handle unlimited mode game tracking
    if (this.mode === 'unlimited') {
      this.saveToLeaderboard(this.score);
      this.unlimitedGameCount++;
    }
    
    // Show game over screen normally
    this.showGameOverScreen();
  }
  
  showGameOverScreen() {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.style.display = 'flex';
      const finalScore = document.getElementById('final-score');
      if (finalScore) {
        finalScore.textContent = this.score;
      }
    }
  }
  
  
  awardUnlimitedReward() {
    // Pause the game
    const wasRunning = this.isRunning;
    if (wasRunning) {
      this.stop();
    }
    
    // Show burst animation
    this.showBurstAnimation();
    
    // Award ticket via main app's handleBuyTicket
    // Default to monthly raffle (can be changed)
    if (typeof window.handleBuyTicket === 'function') {
      setTimeout(() => {
        window.handleBuyTicket('monthly', null);
      }, 100);
    }
    
    // Show entry earned modal after brief delay
    setTimeout(() => {
      this.showUnlimitedRewardModal();
    }, 500);
  }
  
  showUnlimitedRewardModal() {
    const modal = document.getElementById('entry-earned-modal');
    if (modal) {
      // Update modal text for unlimited mode (small message)
      const messageEl = modal.querySelector('.pq-modal__message--small');
      if (messageEl) {
        messageEl.textContent = 'You reached 100 points!';
      }
      
      modal.removeAttribute('hidden');
      
      // Auto-hide after 3 seconds and resume game
      setTimeout(() => {
        this.hideUnlimitedRewardModal();
        this.start(); // Resume the game
      }, 3000);
    }
  }
  
  hideUnlimitedRewardModal() {
    const modal = document.getElementById('entry-earned-modal');
    if (modal) {
      modal.setAttribute('hidden', '');
      
      // Reset modal text back to original
      const messageEl = modal.querySelector('.pq-modal__message--small');
      if (messageEl) {
        messageEl.textContent = 'Completed 4 levels successfully';
      }
    }
  }
  
  saveToLeaderboard(score) {
    // Validate score
    if (score === undefined || score === null || isNaN(score) || score < 0) {
      console.warn('Invalid score:', score);
      return;
    }
    
    // Get current user (for now, use a default username)
    const username = localStorage.getItem('username') || 'Player';
    
    // Validate username
    if (!username || username.trim() === '') {
      console.warn('Invalid username');
      return;
    }
    
    // Get existing leaderboard from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    
    // Filter out invalid entries
    leaderboard = leaderboard.filter(entry => {
      return entry && 
             entry.username !== undefined && 
             entry.username !== null && 
             entry.username !== '' &&
             entry.score !== undefined && 
             entry.score !== null && 
             !isNaN(entry.score);
    });
    
    // Add new score
    leaderboard.push({
      username: username,
      score: score,
      date: new Date().toISOString()
    });
    
    // Sort by score (highest first) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    // Update leaderboard display
    this.updateLeaderboardDisplay();
  }
  
  updateLeaderboardDisplay() {
    const leaderboardBody = document.getElementById('snake-leaderboard-body');
    if (!leaderboardBody) return;
    
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    
    // Filter out entries with undefined or missing names/scores
    leaderboard = leaderboard.filter(entry => {
      return entry && 
             entry.username !== undefined && 
             entry.username !== null && 
             entry.username !== '' &&
             entry.score !== undefined && 
             entry.score !== null && 
             !isNaN(entry.score);
    });
    
    // Sort by score in descending order (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 results
    leaderboard = leaderboard.slice(0, 10);
    
    // Update localStorage with cleaned data
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    leaderboardBody.innerHTML = '';
    
    if (leaderboard.length === 0) {
      leaderboardBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; opacity: 0.6;">No scores yet</td>
        </tr>
      `;
      return;
    }
    
    // Display the top 10 results
    leaderboard.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username || 'Unknown'}</td>
        <td>${entry.score || 0}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  }
  
  hideGameOver() {
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) {
      gameOverScreen.style.display = 'none';
    }
  }
  
  showCountdown() {
    const countdownScreen = document.getElementById('countdown-screen');
    const countdownNumber = document.getElementById('countdown-number');
    const gameOverlay = document.getElementById('game-overlay');
    const startLevelScreen = document.getElementById('start-level-screen');
    
    if (!countdownScreen || !countdownNumber) {
      console.warn('Countdown elements not found');
      // If countdown elements don't exist, start the game directly
      this.start();
      return;
    }
    
    // Ensure game overlay is visible before countdown starts
    if (gameOverlay) {
      gameOverlay.style.display = 'flex';
    }
    
    // Hide start level screen if it's showing
    if (startLevelScreen) {
      startLevelScreen.style.display = 'none';
    }
    
    // Hide start screen content but keep overlay visible for countdown
    const startScreen = document.querySelector('.pq-snake-start-screen');
    if (startScreen) {
      startScreen.style.display = 'none';
    }
    
    // Show countdown screen with high z-index
    countdownScreen.style.display = 'flex';
    countdownScreen.style.position = 'absolute';
    countdownScreen.style.zIndex = '1000';
    countdownScreen.style.top = '0';
    countdownScreen.style.left = '0';
    countdownScreen.style.right = '0';
    countdownScreen.style.bottom = '0';
    countdownScreen.style.justifyContent = 'center';
    countdownScreen.style.alignItems = 'center';
    countdownScreen.style.pointerEvents = 'none';
    
    // Ensure countdown number is visible with all required properties
    countdownNumber.style.opacity = '1';
    countdownNumber.style.visibility = 'visible';
    countdownNumber.style.transform = 'none';
    countdownNumber.style.color = 'rgba(0, 255, 170, 0.95)';
    countdownNumber.style.pointerEvents = 'none';
    
    // Reset countdown number
    let count = 3;
    countdownNumber.textContent = count;
    countdownNumber.style.animation = 'none';
    
    // Force DOM repaint after updating textContent
    countdownNumber.offsetHeight;
    
    // Force a reflow to ensure the countdown screen is visible
    countdownScreen.offsetHeight;
    
    // Start animation
    setTimeout(() => {
      countdownNumber.style.animation = 'pq-countdown-pulse 1s ease-out';
    }, 10);
    
    // Start countdown timer
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        // Force DOM repaint after updating textContent
        countdownNumber.offsetHeight;
        
        // Reset animation by removing and re-adding
        countdownNumber.style.animation = 'none';
        countdownNumber.style.opacity = '1';
        countdownNumber.style.visibility = 'visible';
        countdownNumber.style.transform = 'none';
        
        // Force another repaint
        countdownNumber.offsetHeight;
        
        setTimeout(() => {
          countdownNumber.style.animation = 'pq-countdown-pulse 1s ease-out';
        }, 10);
      } else {
        // Show "0" or "GO!" before starting
        countdownNumber.textContent = '0';
        // Force DOM repaint after updating textContent
        countdownNumber.offsetHeight;
        
        clearInterval(countdownInterval);
        
        // Wait a moment to show the final number, then hide countdown and start the game
        setTimeout(() => {
          this.hideCountdown();
          this.start();
        }, 500);
      }
    }, 1000);
  }
  
  hideCountdown() {
    const countdownScreen = document.getElementById('countdown-screen');
    const gameOverlay = document.getElementById('game-overlay');
    
    if (countdownScreen) {
      countdownScreen.style.display = 'none';
      // Reset inline styles to allow CSS to take over when shown again
      countdownScreen.style.position = '';
      countdownScreen.style.zIndex = '';
      countdownScreen.style.top = '';
      countdownScreen.style.left = '';
      countdownScreen.style.right = '';
      countdownScreen.style.bottom = '';
      countdownScreen.style.justifyContent = '';
      countdownScreen.style.alignItems = '';
    }
    
    // Hide overlay after countdown is done
    if (gameOverlay) {
      gameOverlay.style.display = 'none';
    }
  }
  
  startLevel() {
    // Ensure game overlay is visible before countdown
    const gameOverlay = document.getElementById('game-overlay');
    if (gameOverlay) {
      gameOverlay.style.display = 'flex';
    }
    
    // Hide the start level button screen, then show countdown
    this.hideStartLevelButton();
    // showCountdown will handle the countdown and starting the game
    this.showCountdown();
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!window.snakeGame || !window.snakeGame.isRunning) return;
  
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      e.preventDefault();
      window.snakeGame.changeDirection({ x: 0, y: -1 });
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      e.preventDefault();
      window.snakeGame.changeDirection({ x: 0, y: 1 });
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      e.preventDefault();
      window.snakeGame.changeDirection({ x: -1, y: 0 });
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      e.preventDefault();
      window.snakeGame.changeDirection({ x: 1, y: 0 });
      break;
  }
});

// Touch/Swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const minSwipeDistance = 30; // Minimum distance for a swipe to register

document.addEventListener('touchstart', (e) => {
  if (!window.snakeGame || !window.snakeGame.isRunning) return;
  
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!window.snakeGame || !window.snakeGame.isRunning) return;
  
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  // Calculate absolute distances
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  // Check if swipe is long enough
  if (absX < minSwipeDistance && absY < minSwipeDistance) {
    return; // Swipe too short, ignore
  }
  
  // Determine primary direction (horizontal or vertical)
  if (absX > absY) {
    // Horizontal swipe
    if (deltaX > 0) {
      // Swipe right
      window.snakeGame.changeDirection({ x: 1, y: 0 });
    } else {
      // Swipe left
      window.snakeGame.changeDirection({ x: -1, y: 0 });
    }
  } else {
    // Vertical swipe
    if (deltaY > 0) {
      // Swipe down
      window.snakeGame.changeDirection({ x: 0, y: 1 });
    } else {
      // Swipe up
      window.snakeGame.changeDirection({ x: 0, y: -1 });
    }
  }
}

// Event listeners for game buttons (set up when game starts)
function setupSnakeGameButtons() {
  // Guard: Only set up buttons if game exists
  if (!window.snakeGame) {
    console.warn('Cannot setup buttons: snakeGame not initialized');
    return;
  }
  
  // Mode selection buttons
  const levelModeBtn = document.getElementById('level-mode-btn');
  const unlimitedModeBtn = document.getElementById('unlimited-mode-btn');
  
  if (levelModeBtn) {
    levelModeBtn.onclick = () => {
      if (window.snakeGame && window.snakeGame.setMode) {
        window.snakeGame.setMode('level');
        levelModeBtn.classList.add('pq-mode-btn--active');
        if (unlimitedModeBtn) {
          unlimitedModeBtn.classList.remove('pq-mode-btn--active');
        }
      }
    };
  }
  
  if (unlimitedModeBtn) {
    unlimitedModeBtn.onclick = () => {
      if (window.snakeGame && window.snakeGame.setMode) {
        window.snakeGame.setMode('unlimited');
        unlimitedModeBtn.classList.add('pq-mode-btn--active');
        if (levelModeBtn) {
          levelModeBtn.classList.remove('pq-mode-btn--active');
        }
      }
    };
  }
  
  // Start game button (initial start screen)
  const startBtn = document.getElementById('start-game-btn');
  if (startBtn) {
    startBtn.onclick = () => {
      const startScreen = document.querySelector('.pq-snake-start-screen');
      const gameOverlay = document.getElementById('game-overlay');
      
      // Ensure game overlay is visible before countdown
      if (gameOverlay) {
        gameOverlay.style.display = 'flex';
      }
      
      // Hide the start screen
      if (startScreen) {
        startScreen.style.display = 'none';
      }
      
      if (window.snakeGame) {
        if (window.snakeGame.mode === 'unlimited') {
          // In unlimited mode, show countdown then start
          if (window.snakeGame.showCountdown) {
            window.snakeGame.showCountdown();
          }
        } else {
          // In level mode, show start level button
          if (window.snakeGame.showStartLevelButton) {
            window.snakeGame.showStartLevelButton();
          }
        }
      }
    };
  }
  
  // Start level button (appears before each level)
  const startLevelBtn = document.getElementById('start-level-btn');
  if (startLevelBtn) {
    startLevelBtn.onclick = () => {
      if (window.snakeGame && window.snakeGame.startLevel) {
        window.snakeGame.startLevel();
      }
    };
  }
  
  // Back to Home button (from level start screen)
  const backToHomeBtnLevel = document.getElementById('back-to-home-btn-level');
  if (backToHomeBtnLevel) {
    backToHomeBtnLevel.onclick = () => {
      // Use the main app's activateTab function to return to Home
      if (typeof window.activateTab === 'function') {
        window.activateTab('home');
      } else {
        // Fallback: manually trigger home navigation
        console.warn('activateTab not available, using fallback');
        if (typeof window.hideSnakeGame === 'function') {
          window.hideSnakeGame();
        }
        const homePanel = document.querySelector('[data-panel="home"]');
        if (homePanel) {
          homePanel.removeAttribute('hidden');
          homePanel.classList.add('is-active');
        }
      }
    };
  }
  
  // Play again button
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.onclick = () => {
      if (window.snakeGame) {
        if (window.snakeGame.hideGameOver) {
          window.snakeGame.hideGameOver();
        }
        if (window.snakeGame.reset) {
          window.snakeGame.reset();
        }
        
        // Show start screen and overlay again for mode selection
        const startScreen = document.querySelector('.pq-snake-start-screen');
        const gameOverlay = document.getElementById('game-overlay');
        
        if (startScreen) {
          startScreen.style.display = 'block';
        }
        
        if (gameOverlay) {
          gameOverlay.style.display = 'block';
        }
      }
    };
  }
  
  // Level complete continue button
  const levelContinueBtn = document.getElementById('level-continue-btn');
  if (levelContinueBtn) {
    levelContinueBtn.onclick = () => {
      if (window.snakeGame) {
        if (window.snakeGame.hideLevelCompleteModal) {
          window.snakeGame.hideLevelCompleteModal();
        }
        if (window.snakeGame.afterAdComplete) {
          window.snakeGame.afterAdComplete();
        }
      }
    };
  }
  
  // Entry earned claim button
  const claimEntryBtn = document.getElementById('claim-entry-btn');
  if (claimEntryBtn) {
    claimEntryBtn.onclick = () => {
      if (window.snakeGame && window.snakeGame.claimEntry) {
        window.snakeGame.claimEntry();
      }
    };
  }
  
  // Back to Home button (from Game Over screen)
  const backToHomeBtn = document.getElementById('back-to-home-btn');
  if (backToHomeBtn) {
    backToHomeBtn.onclick = () => {
      // Use the main app's activateTab function to return to Home
      if (typeof window.activateTab === 'function') {
        window.activateTab('home');
      } else {
        // Fallback: manually trigger home navigation
        console.warn('activateTab not available, using fallback');
        if (typeof window.hideSnakeGame === 'function') {
          window.hideSnakeGame();
        }
        const homePanel = document.querySelector('[data-panel="home"]');
        if (homePanel) {
          homePanel.removeAttribute('hidden');
          homePanel.classList.add('is-active');
        }
      }
    };
  }
}
  
window.startSnakeGame = () => {
  // Guard: Check if necessary DOM elements exist
  const canvas = document.getElementById('snake-canvas');
  const leaderboardBody = document.getElementById('snake-leaderboard-body');
  const snakeScreen = document.getElementById('snakeGameScreen');
  
  if (!canvas) {
    console.warn('Snake game: Canvas element not found');
    return;
  }
  
  if (!snakeScreen) {
    console.warn('Snake game: Snake game screen not found');
    return;
  }
  
  // Initialize game only once
  if (!window.snakeGame) {
    try {
      window.snakeGame = new SnakeGame('snake-canvas');
      
      // Only update leaderboard if the element exists
      if (leaderboardBody && window.snakeGame.updateLeaderboardDisplay) {
        window.snakeGame.updateLeaderboardDisplay();
      }
      
      // Set up button event listeners
      setupSnakeGameButtons();
      
      // Show the start screen (overlay will be visible to show start screen, but countdown stays hidden)
      const startScreen = document.querySelector('.pq-snake-start-screen');
      const gameOverlay = document.getElementById('game-overlay');
      const countdownScreen = document.getElementById('countdown-screen');
      
      if (startScreen) {
        startScreen.style.display = 'block';
      }
      
      // Show overlay when showing start screen (but NOT for countdown)
      if (gameOverlay) {
        gameOverlay.style.display = 'block';
      }
      
      // Ensure countdown screen is hidden on initialization
      if (countdownScreen) {
        countdownScreen.style.display = 'none';
      }
      
      // Reset game state to initial state
      if (window.snakeGame.reset) {
        window.snakeGame.reset();
      }
    } catch (error) {
      console.error('Error initializing Snake game:', error);
      window.snakeGame = null; // Reset on error
    }
  } else {
    // If game already exists, just reset it and show start screen
    try {
      if (window.snakeGame.reset) {
        window.snakeGame.reset();
      }
      
      const startScreen = document.querySelector('.pq-snake-start-screen');
      const gameOverlay = document.getElementById('game-overlay');
      const countdownScreen = document.getElementById('countdown-screen');
      
      if (startScreen) {
        startScreen.style.display = 'block';
      }
      
      // Show overlay when showing start screen (but NOT for countdown)
      if (gameOverlay) {
        gameOverlay.style.display = 'block';
      }
      
      // Ensure countdown screen is hidden on reset
      if (countdownScreen) {
        countdownScreen.style.display = 'none';
      }
    } catch (error) {
      console.error('Error resetting Snake game:', error);
    }
  }
};

