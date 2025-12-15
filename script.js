// AUTH GATE - Must run before any other code
import { auth } from '/auth/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

console.log("DASHBOARD_AUTH_GUARD: starting...");

onAuthStateChanged(auth, (user) => {
  console.log("DASHBOARD_AUTH_GUARD: user present?", !!user);

  if (!user) {
    // No signed-in user, send them to login page
    window.location.href = "/auth/login.html";
    return;
  }

  // User is signed in — reveal the dashboard
  const appRoot = document.getElementById("appRoot");
  if (appRoot) {
    appRoot.style.visibility = "visible";
  }

  // Only after this point should the rest of the dashboard logic run.
  // If existing dashboard code currently runs at the top level of script.js,
  // wrap that logic in a function (e.g., initDashboard()) and call it here.
  initDashboard();
});

// Wrap all existing code in initialization function
function initDashboard() {

  console.log("PrizeQuest base script loaded successfully!");
  console.log("PrizeQuest system initialized.");

  // RAFFLE STATE MANAGEMENT
  const raffles = {
    daily: { entries: 0, adCount: 0, surveyCount: 0, cap: 150 },
    weekly: { entries: 0, adCount: 0, surveyCount: 0, cap: 500 },
    monthly: { entries: 0, adCount: 0, surveyCount: 0, cap: 5000 },
    xbox: { entries: 0, adCount: 0, surveyCount: 0, cap: 8000 }
  };

  // CANONICAL STORE REFERENCE
  let STORE = raffles;

  // QUEST STATE MANAGEMENT - DISABLED (Quests Coming Soon)
  /*
  let quests = window.quests || {
    daily:  { progress: 0, completed: false, date: "" },
    streak: { progress: 0, completed: false, streakCount: 0, lastCompletion: "" }
  };

  // QUEST PROGRESS CHECKING FUNCTIONS
  function checkDailyQuestProgress() {
  if (!STORE) { console.error("STORE not found (raffles/prizeDraws)"); return; }
  let count = 0;
  if (STORE.daily?.entries > 0) count++;
  if (STORE.weekly?.entries > 0) count++;
  if (STORE.monthly?.entries > 0) count++;

  if (!quests) quests = { daily:{completed:false, progress:0, date:""} };
  quests.daily.progress = count;

  const btn = document.getElementById("questCompleteBtn");
  if (!btn) { console.warn("questCompleteBtn not found"); return; }

  // Only enable when 3/3 and not already completed today
  const shouldEnable = (count >= 3) && !quests.daily.completed;
  if (shouldEnable) {
    btn.removeAttribute("disabled");
  } else {
    btn.setAttribute("disabled", "true");
  }

  const prog = document.getElementById("dailyProgress");
  if (prog) prog.textContent = `${count}/3 Prize Draws completed`;
  console.log("[Quests] progress:", count, "completed:", quests.daily.completed, "enabled:", shouldEnable);
}

function checkStreakQuestProgress() {
  const btn = document.getElementById("streakQuestBtn");
  if (btn) {
    if (quests.streak.streakCount >= 1) {
      btn.textContent = `Streak: ${quests.streak.streakCount}/2 days`;
    }
    if (quests.streak.streakCount >= 2 && !quests.streak.completed) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  }
  }
  */

  // NAVIGATION FUNCTIONS - Clean show/hide logic
  window.showSnakeGame = function () {
    const snakeScreen = document.getElementById('snakeGameScreen');
    
    // Guard: Check if snake screen exists
    if (!snakeScreen) {
      console.warn('Snake game screen not found');
      return;
    }

    // Remove hidden attribute and set display to block
    snakeScreen.removeAttribute('hidden');
    snakeScreen.style.display = 'block';

    // Hide all dashboard panels
    const panels = document.querySelectorAll('[data-panel]');
    panels.forEach(panel => {
      panel.setAttribute('hidden', '');
      panel.classList.remove('is-active');
    });

    // Hide the navigation tabs
    const tabs = document.querySelector('.pq-tabs');
    if (tabs) {
      tabs.style.display = 'none';
    }

    // Hide the header (optional, but ensures clean game view)
    const header = document.querySelector('.pq-header');
    if (header) {
      header.style.display = 'none';
    }

    // Ensure countdown and overlay are hidden when entering snake screen
    // DO NOT trigger countdown when entering snake screen
    const gameOverlay = document.getElementById('game-overlay');
    const countdownScreen = document.getElementById('countdown-screen');
    const startLevelScreen = document.getElementById('start-level-screen');
    
    // Hide countdown screen (DO NOT show countdown when entering snake screen)
    if (countdownScreen) {
      countdownScreen.style.display = 'none';
    }
    
    // Hide start level screen
    if (startLevelScreen) {
      startLevelScreen.style.display = 'none';
    }
    
    // Hide game overlay initially (startSnakeGame will show it with start screen)
    // This ensures countdown overlay doesn't appear when entering snake screen
    if (gameOverlay) {
      gameOverlay.style.display = 'none';
    }
    
    // Note: start screen will be shown by startSnakeGame() after overlay is set to 'block'

    // Initialize the game after showing the screen (ensures DOM is ready)
    // This will show the overlay with start screen, but NOT trigger countdown
    if (window.startSnakeGame && typeof window.startSnakeGame === 'function') {
      // Use a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        window.startSnakeGame();
      }, 50);
    }

    console.log('SNAKE: showSnakeGame() called');
  };

  window.hideSnakeGame = function () {
    const snakeScreen = document.getElementById('snakeGameScreen');
    const layout = document.querySelector('.pq-layout');

    if (snakeScreen) {
      snakeScreen.hidden = true;
    }
    if (layout) {
      layout.style.display = '';
    }

    console.log('SNAKE: hideSnakeGame() called');
  };

function showHome() {
  // Use activateTab for consistent behavior
  activateTab("home");
}

// PRIZE NAMES MAPPING (Default values, can be overridden by admin panel)
let prizeNames = {
  daily: "$10 Amazon Gift Card",
  weekly: "$50 Gift Card",
  monthly: "Nintendo Switch OLED Model",
  xbox: "Xbox Series X"
};

// LOAD PRIZE CONFIGURATIONS FROM ADMIN PANEL
function loadPrizeConfigurations() {
  ['daily', 'weekly', 'monthly'].forEach(type => {
    const stored = localStorage.getItem(`prize_${type}`);
    if (stored) {
      try {
        const prizeConfig = JSON.parse(stored);
        
        // Update prize name
        if (prizeConfig.name) {
          prizeNames[type] = prizeConfig.name;
        }
        
        // Update cap if changed
        if (prizeConfig.cap && raffles[type]) {
          raffles[type].cap = parseInt(prizeConfig.cap);
        }
        
        console.log(`Loaded ${type} prize config:`, prizeConfig);
      } catch (e) {
        console.error(`Failed to load ${type} prize config:`, e);
      }
    }
  });
}

// APPLY PRIZE CONFIGURATIONS TO UI
function applyPrizeConfigurationsToUI() {
  ['daily', 'weekly', 'monthly'].forEach(type => {
    const stored = localStorage.getItem(`prize_${type}`);
    if (stored) {
      try {
        const prizeConfig = JSON.parse(stored);
        
        // Update prize name in cards
        updatePrizeName(type, prizeConfig.name);
        
        // Update prize image if provided
        if (prizeConfig.image) {
          updatePrizeImage(type, prizeConfig.image);
        }
        
        // Update prize value if shown
        if (prizeConfig.value) {
          updatePrizeValue(type, prizeConfig.value);
        }
      } catch (e) {
        console.error(`Failed to apply ${type} prize config:`, e);
      }
    }
  });
}

// Update prize name in UI
function updatePrizeName(type, name) {
  // Update home tab card
  const homeTitleEl = document.querySelector(`#card-${type} .pq-summary__title`);
  if (homeTitleEl) homeTitleEl.textContent = name;
  
  // Update individual tab card
  const tabTitleEl = document.querySelector(`#card-${type}-tab .pq-card__title`);
  if (tabTitleEl) tabTitleEl.textContent = name;
}

// Update prize image in UI
function updatePrizeImage(type, imageUrl) {
  if (!imageUrl) {
    console.log(`No image provided for ${type} prize`);
    return;
  }
  
  console.log(`Updating ${type} prize image:`, imageUrl.substring(0, 50) + '...');
  
  // Update home tab card image
  const homeImgEl = document.querySelector(`#card-${type} .prize-image`);
  if (homeImgEl) {
    homeImgEl.src = imageUrl;
    // Handle Base64 images
    if (imageUrl.startsWith('data:image')) {
      homeImgEl.style.objectFit = 'contain';
    }
    console.log(`✓ Updated home tab image for ${type}`);
  } else {
    console.warn(`Home tab image element not found for ${type}`);
  }
  
  // Update individual tab card image
  const tabImgEl = document.querySelector(`#card-${type}-tab .pq-card__prize-image`);
  if (tabImgEl) {
    tabImgEl.src = imageUrl;
    // Handle Base64 images
    if (imageUrl.startsWith('data:image')) {
      tabImgEl.style.objectFit = 'contain';
    }
    console.log(`✓ Updated tab image for ${type}`);
  } else {
    console.warn(`Tab image element not found for ${type}`);
  }
}

// Update prize value in UI (for subtitle or description)
function updatePrizeValue(type, value) {
  // This can be expanded to show value in card subtitle if needed
  console.log(`Prize ${type} value set to: ${value}`);
}

// CHECK IF PRIZE IS FULL (NO AUTO-REDIRECT)
function checkPrizeCapReached(type) {
  const raffle = raffles[type];
  if (raffle.entries >= raffle.cap) {
    console.log(`Prize cap reached for ${type}! Card now in "Drawing Ready" state.`);
    
    // Store prize info in localStorage for when admin clicks to start
    const prizeInfo = {
      name: prizeNames[type] || type,
      type: type,
      totalEntries: raffle.entries,
      timestamp: Date.now()
    };
    
    localStorage.setItem("currentPrize", JSON.stringify(prizeInfo));
    
    // Update UI to show "Drawing Ready" overlay (handled by updateRaffleUI)
    updateRaffleUI(type);
    
    // NO AUTO-REDIRECT - Admin must click card to start drawing
    
    return true;
  }
  return false;
}

// SURVEY INTERACTION FUNCTIONS
function handleTakeSurvey(type, buttonElement) {
  const raffle = raffles[type];
  
  // Check if already completed 5 surveys
  if (raffle.surveyCount >= 5) {
    console.log(`Survey limit reached for ${type}`);
    return;
  }
  
  // Increment survey count
  raffle.surveyCount++;
  
  // Award 1 entry for completing survey
  raffle.entries++;
  console.log(`Survey ${raffle.surveyCount} completed for ${type}. Entry awarded! Total entries: ${raffle.entries}`);
  
  updateRaffleUI(type);
  saveRaffleState();
  
  // Show survey completion modal
  showSurveyCompleteModal(type, raffle.surveyCount);
  
  // Show burst animation
  if (buttonElement) {
    showBurstAnimation(buttonElement);
  }
  
  // Check if cap reached after awarding entry
  checkPrizeCapReached(type);
}

// RAFFLE INTERACTION FUNCTIONS
function handleBuyTicket(type, buttonElement) {
  const raffle = raffles[type];
  if (!raffle) { console.error("No raffle found for", type); return; }
  if (raffle.entries < raffle.cap) {
    raffle.entries++;
    updateRaffleUI(type);
    saveRaffleState();
    
    // Show burst animation when entry is awarded
    if (buttonElement) {
      showBurstAnimation(buttonElement);
    }
    
    // Check if cap reached after buying entry
    checkPrizeCapReached(type);
    // checkDailyQuestProgress(); // DISABLED - Quests Coming Soon
  } else {
    alert("Entry cap reached for this raffle.");
  }
}

// Export for use by other scripts (e.g., snake game)
window.handleBuyTicket = handleBuyTicket;

// RESET RAFFLE FUNCTION (for new raffle cycles)
function resetRaffle(type) {
  if (raffles[type]) {
    raffles[type].entries = 0;
    raffles[type].adCount = 0;
    raffles[type].surveyCount = 0;
    updateRaffleUI(type);
    saveRaffleState();
    console.log(`Reset ${type} raffle to 0 entries`);
  }
}

// Export reset function
window.resetRaffle = resetRaffle;

// SURVEY COMPLETE MODAL
function showSurveyCompleteModal(type, surveyCount) {
  const modal = document.getElementById('survey-complete-modal');
  const message = document.getElementById('survey-complete-message');
  
  if (!modal || !message) {
    // Fallback if modal doesn't exist yet
    alert(`Survey Complete! Thanks for your feedback. (${surveyCount}/2)\n+1 Entry Awarded!`);
    return;
  }
  
  const prizeName = prizeNames[type] || type;
  
  // Update message based on count
  const remaining = 5 - surveyCount;
  if (surveyCount === 5) {
    message.innerHTML = `
      <p class="pq-modal__message pq-modal__message--large">All Surveys Complete!</p>
      <p class="pq-modal__message">Thanks for your feedback! You earned <strong>+1 Entry</strong> for ${prizeName}.</p>
      <p class="pq-modal__message pq-modal__message--small">✓ All 5 surveys completed<br>✓ Total: 5 entries from surveys</p>
    `;
  } else {
    message.innerHTML = `
      <p class="pq-modal__message pq-modal__message--large">Survey Complete!</p>
      <p class="pq-modal__message">Thanks for your feedback! You earned <strong>+1 Entry</strong> for ${prizeName}.</p>
      <p class="pq-modal__message pq-modal__message--small">✓ ${remaining} more survey${remaining === 1 ? '' : 's'} available</p>
    `;
  }
  
  modal.removeAttribute('hidden');
}

// --- Unified button event delegation ---
document.addEventListener("click", (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  // Match buy/watch/survey buttons by id
  if (target.id?.startsWith("buy-")) {
    const type = target.id.split("-")[1];
    handleBuyTicket(type, target);
  }
  if (target.id?.startsWith("survey-")) {
    const type = target.id.split("-")[1];
    handleTakeSurvey(type, target);
  }
});

// BURST ANIMATION FUNCTION
function showBurstAnimation(targetElement) {
  if (!targetElement) {
    console.warn("No target element for burst animation");
    return;
  }
  
  // Create confetti container
  const confetti = document.createElement('div');
  confetti.className = 'pq-confetti';
  
  // Create 5 confetti particles
  for (let i = 0; i < 5; i++) {
    const particle = document.createElement('div');
    particle.className = 'pq-confetti-particle';
    confetti.appendChild(particle);
  }
  
  // Position relative to the target element
  const rect = targetElement.getBoundingClientRect();
  confetti.style.position = 'fixed';
  confetti.style.left = rect.left + rect.width / 2 + 'px';
  confetti.style.top = rect.top + 'px';
  confetti.style.zIndex = '1000';
  
  // Add to body
  document.body.appendChild(confetti);
  
  // Remove after animation completes (1s as defined in CSS)
  setTimeout(() => {
    confetti.remove();
  }, 1100);
  
  // Add celebration glow to the parent card
  const card = targetElement.closest('.pq-card, .raffle-card, .pq-summary-card');
  if (card) {
    card.classList.add('pq-card--celebrate', 'pq-summary-card--celebrate');
    // Remove celebration class after animation completes
    setTimeout(() => {
      card.classList.remove('pq-card--celebrate', 'pq-summary-card--celebrate');
    }, 800);
  }
  
  // Add pulse effect to progress bar
  const progressBar = targetElement.closest('.pq-card, .raffle-card, .pq-summary-card')
    ?.querySelector('.pq-progress__bar, .pq-summary__bar');
  if (progressBar) {
    progressBar.classList.add('pq-progress__bar--pulse', 'pq-summary__bar--pulse');
    setTimeout(() => {
      progressBar.classList.remove('pq-progress__bar--pulse', 'pq-summary__bar--pulse');
    }, 600);
  }
}

// UI UPDATE FUNCTIONS
function updateRaffleUI(type) {
  const r = raffles[type];
  if (!r) {
    console.error(`Raffle not found: ${type}`);
    return;
  }
  
  // Ensure all values are valid numbers (no NaN, null, undefined)
  const entries = parseInt(r.entries) || 0;
  const surveyCount = parseInt(r.surveyCount) || 0;
  const cap = parseInt(r.cap) || 0;
  
  const isCapReached = entries >= cap;
  const surveyComplete = surveyCount >= 5;
  
  // Check if prize is in drawing state
  const drawingState = getDrawingState(type);
  const isDrawing = drawingState && drawingState.status === 'drawing';
  
  // Update card overlay for drawing state (manual start only, no auto-initiate)
  updateCardOverlay(type, isCapReached, isDrawing);
  
  // Update Home tab elements
  const entriesEl = document.getElementById(`entries-${type}`);
  const capEl = document.getElementById(`cap-${type}`);
  const remainingEl = document.getElementById(`remaining-${type}`);
  const progressEl = document.getElementById(`progress-${type}`);
  const buyBtn = document.getElementById(`buy-${type}`);
  const surveyBtn = document.getElementById(`survey-${type}`);
  
  if (entriesEl) entriesEl.textContent = entries;
  if (capEl) capEl.textContent = cap;
  if (remainingEl) remainingEl.textContent = Math.max(0, cap - entries);
  if (progressEl) {
    const progress = cap > 0 ? (entries / cap) * 100 : 0;
    progressEl.style.width = Math.min(100, Math.max(0, progress)) + "%";
  }
  if (buyBtn) {
    buyBtn.disabled = isCapReached;
  }
  if (surveyBtn) {
    const surveyCounterEl = surveyBtn.querySelector('.pq-survey-counter');
    if (surveyCounterEl) {
      surveyCounterEl.textContent = `(${surveyCount}/5)`;
    }
    // Disable if 5 surveys completed OR cap reached
    surveyBtn.disabled = surveyComplete || isCapReached;
  }
  
  // Update individual tab elements
  const entriesTabEl = document.getElementById(`entries-${type}-tab`);
  const capTabEl = document.getElementById(`cap-${type}-tab`);
  const remainingTabEl = document.getElementById(`remaining-${type}-tab`);
  const progressTabEl = document.getElementById(`progress-${type}-tab`);
  const buyTabBtn = document.getElementById(`buy-${type}-tab`);
  const surveyTabBtn = document.getElementById(`survey-${type}-tab`);
  
  if (entriesTabEl) entriesTabEl.textContent = entries;
  if (capTabEl) capTabEl.textContent = cap;
  if (remainingTabEl) remainingTabEl.textContent = Math.max(0, cap - entries);
  if (progressTabEl) {
    const progress = cap > 0 ? (entries / cap) * 100 : 0;
    progressTabEl.style.width = Math.min(100, Math.max(0, progress)) + "%";
  }
  if (buyTabBtn) {
    buyTabBtn.disabled = isCapReached;
  }
  if (surveyTabBtn) {
    const surveyCounterEl = surveyTabBtn.querySelector('.pq-survey-counter');
    if (surveyCounterEl) {
      surveyCounterEl.textContent = `(${surveyCount}/5)`;
    }
    surveyTabBtn.disabled = surveyComplete || isCapReached;
  }
}

// DRAWING STATE MANAGEMENT
function getDrawingState(type) {
  const stored = localStorage.getItem(`drawing_${type}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse drawing state:', e);
    return null;
  }
}

function initiateDrawing(type) {
  const drawingState = {
    type: type,
    status: 'drawing',
    startTime: Date.now(),
    duration: 60000, // 1 minute in milliseconds
    prizeName: prizeNames[type] || `${type} Prize`
  };
  
  localStorage.setItem(`drawing_${type}`, JSON.stringify(drawingState));
  console.log(`Drawing initiated for ${type} prize`);
}

function clearDrawingState(type) {
  localStorage.removeItem(`drawing_${type}`);
}

function updateCardOverlay(type, isCapReached, isDrawing) {
  // Update home tab card
  const homeCard = document.getElementById(`card-${type}`);
  if (homeCard) {
    updateCardOverlayElement(homeCard, type, isCapReached, isDrawing);
  }
  
  // Update individual tab card
  const tabCard = document.getElementById(`card-${type}-tab`);
  if (tabCard) {
    updateCardOverlayElement(tabCard, type, isCapReached, isDrawing);
  }
}

function updateCardOverlayElement(card, type, isCapReached, isDrawing) {
  if (!card) return;
  
  // Remove existing overlay if present
  let overlay = card.querySelector('.drawing-overlay');
  
  if (isCapReached && !isDrawing) {
    // Show "Drawing Ready" overlay when cap reached but drawing not started
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'drawing-overlay drawing-ready';
      
      // Check admin mode to determine overlay behavior
      const isAdminMode = localStorage.getItem('isAdminMode') === 'true';
      
      if (isAdminMode) {
        // ADMIN MODE: Clickable to start drawing
        overlay.innerHTML = `
          <div class="drawing-overlay-content">
            <div class="drawing-overlay-icon">🎰</div>
            <div class="drawing-overlay-text">Entries Closed</div>
            <div class="drawing-overlay-cta">Click to Start Drawing</div>
          </div>
        `;
        
        // Make the whole card clickable to start drawing
        overlay.style.cursor = 'pointer';
        overlay.addEventListener('click', () => {
          // Mark as drawing started and redirect
          startDrawingManually(type);
        });
      } else {
        // PUBLIC MODE: Show "Drawing in Progress" and not clickable
        overlay.innerHTML = `
          <div class="drawing-overlay-content">
            <div class="drawing-overlay-icon">⏱️</div>
            <div class="drawing-overlay-text">Drawing in Progress</div>
            <div class="drawing-overlay-cta">Check back soon...</div>
          </div>
        `;
        
        overlay.style.cursor = 'default';
        overlay.style.pointerEvents = 'none';
      }
      
      card.style.position = 'relative';
      card.appendChild(overlay);
    }
  } else if (isDrawing) {
    // Check if drawing is complete (countdown expired)
    const drawingState = getDrawingState(type);
    const elapsed = Date.now() - drawingState.startTime;
    const isComplete = elapsed >= drawingState.duration;
    
    // Show "Drawing Complete" or "Drawing in Progress" overlay
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = isComplete ? 'drawing-overlay drawing-complete' : 'drawing-overlay drawing-active';
      
      const iconText = isComplete ? '🏆' : '⏱️';
      const statusText = isComplete ? 'Winner Selected!' : 'Drawing in Progress...';
      const ctaText = isComplete ? 'Click to View Results' : 'Click to View';
      
      overlay.innerHTML = `
        <div class="drawing-overlay-content">
          <div class="drawing-overlay-icon">${iconText}</div>
          <div class="drawing-overlay-text">${statusText}</div>
          <div class="drawing-overlay-cta">${ctaText}</div>
        </div>
      `;
      
      // Make clickable to view the drawing
      overlay.style.cursor = 'pointer';
      overlay.addEventListener('click', () => {
        window.location.href = `claw-machine.html?prize=${type}`;
      });
      
      card.style.position = 'relative';
      card.appendChild(overlay);
    }
  } else if (overlay) {
    overlay.remove();
  }
}

// Start drawing manually when admin clicks the card
function startDrawingManually(type) {
  console.log(`Manually starting drawing for ${type} prize`);
  
  // Mark as drawing started (this will be picked up by the overlay update)
  initiateDrawing(type);
  
  // Redirect to claw machine with countdown
  window.location.href = `claw-machine.html?prize=${type}`;
}

// LOCALSTORAGE PERSISTENCE
function saveRaffleState() {
  localStorage.setItem("raffleState", JSON.stringify(raffles));
}

function loadRaffleState() {
  const data = localStorage.getItem("raffleState");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Merge loaded data with defaults to ensure all properties exist
      Object.keys(raffles).forEach(key => {
        if (parsed[key]) {
          raffles[key] = {
            entries: parseInt(parsed[key].entries) || 0,
            adCount: parseInt(parsed[key].adCount) || 0,
            surveyCount: parseInt(parsed[key].surveyCount) || 0,
            cap: raffles[key].cap // Keep original cap
          };
        }
      });
      console.log('Raffle state loaded:', raffles);
    } catch (e) {
      console.warn('Failed to load raffle state:', e);
    }
  }
}

// TAB PERSISTENCE
function saveActiveTab(tabName) {
  try {
    localStorage.setItem("activeTab", tabName);
  } catch (e) {
    console.warn('Failed to save active tab:', e);
  }
}

function loadActiveTab() {
  try {
    return localStorage.getItem("activeTab") || "home";
  } catch (e) {
    console.warn('Failed to load active tab:', e);
    return "home";
  }
}

// QUEST FUNCTIONS - DISABLED (Quests Coming Soon)
/*
function checkDailyQuestComplete() {
  // Check if user has earned at least one ticket in each raffle
  return raffles.daily.entries > 0 && 
         raffles.weekly.entries > 0 && 
         raffles.monthly.entries > 0;
}

function checkStreakQuestComplete() {
  // For now, just check if daily quest is complete
  // In a real app, you'd check consecutive days
  return checkDailyQuestComplete();
}

function giveFreeTicket() {
  // Open the same raffle-selection modal used by mini-game
  const modal = document.getElementById('ticket-modal');
  if (modal) {
    modal.removeAttribute('hidden');
  }
}

// GLOBAL QUEST COMPLETION FUNCTIONS
window.completeDailyQuest = function() {
  console.log("Running completeDailyQuest()");
  if (!quests?.daily) return console.error("Quests object missing");
  if (quests.daily.completed) return console.log("Already completed today");
  if (quests.daily.progress < 3) return console.log("Not enough Prize Draws completed yet");

  quests.daily.completed = true;
  quests.daily.date = new Date().toDateString();
  saveQuestState?.();
  giveFreeTicket?.(); // show free-entry popup
  quests.streak.streakCount++;
  checkDailyQuestProgress?.();
};

window.completeStreakQuest = function() {
  console.log("Running completeStreakQuest()");
  if (!quests?.streak) return console.error("Quests object missing");
  if (quests.streak.completed) return console.log("Already completed streak quest");
  if (quests.streak.streakCount < 2) return console.log("Streak not ready yet");

  quests.streak.completed = true;
  saveQuestState?.();
  giveFreeTicket?.(); // show popup
  checkStreakQuestProgress?.();
};

// QUEST STATE PERSISTENCE
function saveQuestState() {
  localStorage.setItem("quests", JSON.stringify(quests));
}

function loadQuestState() {
  const data = localStorage.getItem("quests");
  if (data) {
    try {
      const parsed = JSON.parse(data);
      Object.assign(quests, parsed);
    } catch (e) {
      console.warn('Failed to load quest state:', e);
    }
  }
  checkDailyQuestProgress();
  checkStreakQuestProgress();
}
*/

// TAB SWITCHING LOGIC
function activateTab(target) {
  console.log('Activating tab:', target);
  
  window.hideSnakeGame(); // Ensure snake screen is hidden when switching tabs
  
  const tabButtons = document.querySelectorAll('.pq-tab');
  const panels = document.querySelectorAll('.pq-panel');
  
  // Hide all panels first
  panels.forEach(function (panel) {
    panel.setAttribute('hidden', '');
    panel.classList.remove('is-active');
  });
  
  // Update tab button states
  tabButtons.forEach(function (btn) {
    const isActive = btn.getAttribute('data-tab') === target;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Show the target panel (home is a panel too)
  const targetPanel = document.querySelector(`[data-panel="${target}"]`);
  if (targetPanel) {
    targetPanel.removeAttribute('hidden');
    targetPanel.classList.add('is-active');
  } else {
    console.warn(`Panel not found for tab: ${target}`);
  }
  
  // Save the active tab to localStorage
  saveActiveTab(target);
}

// Export activateTab for use by other scripts (like snake game)
window.activateTab = activateTab;

// INITIALIZATION - Wire up buttons after DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  // Ensure proper initial display states - hide everything first
  document.getElementById("snakeGameScreen").style.display = "none";
  
  // Hide all panels initially (including home panel)
  document.querySelectorAll(".pq-panel").forEach(panel => {
    panel.setAttribute("hidden", "");
    panel.classList.remove("is-active");
  });
  
  // Load prize configurations from admin panel FIRST
  console.log('Loading prize configurations from admin panel...');
  loadPrizeConfigurations();
  
  // Load raffle state from localStorage
  loadRaffleState();
  
  // Load quest state - DISABLED (Quests Coming Soon)
  // loadQuestState();
  
  // Check quest progress on load - DISABLED (Quests Coming Soon)
  // checkDailyQuestProgress();
  
  // Apply prize configurations to UI (names, images, etc.)
  console.log('Applying prize configurations to UI...');
  applyPrizeConfigurationsToUI();
  
  // Initialize all raffle UIs with current state (including button states)
  console.log('Initializing raffle UIs...');
  updateRaffleUI("daily");
  updateRaffleUI("weekly");
  updateRaffleUI("monthly");
  updateRaffleUI("xbox");
  
  // Log initial state for debugging
  console.log('Initial raffle state:', {
    daily: raffles.daily,
    weekly: raffles.weekly,
    monthly: raffles.monthly
  });
  console.log('Prize names:', prizeNames);
  
  // Set up tab switching BEFORE restoring tab
  document.querySelectorAll(".pq-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      activateTab(target);
    });
  });
  
  // Wire up navigation buttons
  const playBtn = document.getElementById("snakePlayCardBtn");
  const backBtn = document.getElementById("backHomeBtn");
  if (playBtn) {
    playBtn.onclick = window.showSnakeGame;
  }
  if (backBtn) {
    backBtn.onclick = window.hideSnakeGame;
  }
  
  // Restore the last active tab (after everything is set up)
  const lastActiveTab = loadActiveTab();
  
  if (lastActiveTab === "snake") {
    // Do NOT auto-launch Snake; default to Home instead
    activateTab("home");
  } else {
    activateTab(lastActiveTab);
  }
  
  // Global safety listener for route changes
  window.addEventListener("hashchange", window.hideSnakeGame);

  // Reset functionality moved to admin dashboard only

  // EVENT LISTENERS - Survey Complete Modal
  const closeSurveyModalBtn = document.getElementById('close-survey-modal');
  if (closeSurveyModalBtn) {
    closeSurveyModalBtn.addEventListener('click', function() {
      const modal = document.getElementById('survey-complete-modal');
      if (modal) {
        modal.setAttribute('hidden', '');
      }
    });
  }

  // EVENT LISTENERS - Ticket choice modal
  const chooseDailyBtn = document.getElementById('choose-daily');
  const chooseWeeklyBtn = document.getElementById('choose-weekly');
  const chooseMonthlyBtn = document.getElementById('choose-monthly');
  const ticketModal = document.getElementById('ticket-modal');

  if (chooseDailyBtn) {
    chooseDailyBtn.onclick = (e) => {
      handleBuyTicket('daily', e.target);
      ticketModal.setAttribute('hidden', '');
    };
  }
  
  if (chooseWeeklyBtn) {
    chooseWeeklyBtn.onclick = (e) => {
      handleBuyTicket('weekly', e.target);
      ticketModal.setAttribute('hidden', '');
    };
  }
  
  if (chooseMonthlyBtn) {
    chooseMonthlyBtn.onclick = (e) => {
      handleBuyTicket('monthly', e.target);
      ticketModal.setAttribute('hidden', '');
    };
  }
});

// GLOBAL QUEST BUTTON EVENT DELEGATION - DISABLED (Quests Coming Soon)
/*
document.addEventListener("click", function(e) {
  const target = e.target.closest("button");
  if (!target) return;

  if (target.id === "questCompleteBtn") {
    // guard: only run if not disabled
    if (target.hasAttribute("disabled")) return;
    console.log("QuestCompleteBtn clicked");
    window.completeDailyQuest?.();
  }

  if (target.id === "streakQuestBtn") {
    console.log("StreakQuestBtn clicked");
    window.completeStreakQuest?.();
  }
});
*/
} // End of initDashboard function