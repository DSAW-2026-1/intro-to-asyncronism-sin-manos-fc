
const TOTAL_ROUNDS = 10;
const MAX_LIVES    = 3;
const MAX_HINTS    = 2;


let gameState = {
  score:          0,
  streak:         0,
  lives:          MAX_LIVES,
  round:          0,
  hintsUsed:      0,
  currentPokemon: null,
  answered:       false,
  nextQueue:      [],    
};



/**
 * @param {boolean} show 
 */
function showLoader(show) {
  document.getElementById('loader').style.display      = show ? 'block' : 'none';
  document.getElementById('pokemon-img').style.display = show ? 'none'  : 'block';
}


function updateScoreDisplay() {
  document.getElementById('score-display').textContent  = gameState.score;
  document.getElementById('streak-display').textContent = gameState.streak;
}


function renderLives() {
  const container = document.getElementById('lives-container');
  container.innerHTML = '';

  for (let i = 0; i < MAX_LIVES; i++) {
    const div  = document.createElement('div');
    const lost = i >= gameState.lives;
    div.className = 'heart' + (lost ? ' lost' : '');
    div.innerHTML = `
      <svg viewBox="0 0 24 24" fill="${lost ? '#555' : '#e63946'}">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`;
    container.appendChild(div);
  }
}

/**
 * @param {'correct'|'wrong'|'reveal'} type
 * @param {string} msg
 */
function showFeedback(type, msg) {
  const el = document.getElementById('feedback');
  el.className   = `feedback ${type}`;
  el.textContent = msg;
  
  setTimeout(() => el.classList.add('show'), 20);
}



/**
 * @returns {number}
 */
function randomGameId() {
  const gen = GEN_RANGES[randInt(0, GEN_RANGES.length - 1)];
  return randInt(gen.min, gen.max);
}


async function preloadNext() {
  if (gameState.nextQueue.length === 0) {
    try {
      const poke = await fetchGamePokemon(randomGameId());
      gameState.nextQueue.push(poke);
    } catch (e) {
      
    }
  }
}


async function loadPokemon() {
  
  gameState.answered  = false;
  gameState.hintsUsed = 0;

 
  const img = document.getElementById('pokemon-img');
  img.classList.remove('revealed', 'wiggle', 'float-anim');

  document.getElementById('revealed-info').classList.remove('show');
  document.getElementById('game-over').classList.remove('show');
  document.getElementById('input-section').style.display = 'block';

  const fb = document.getElementById('feedback');
  fb.className   = 'feedback';
  fb.textContent = '';

  document.getElementById('hint-area').innerHTML    = '';
  document.getElementById('answer-input').value     = '';
  document.getElementById('question-label').textContent = '??? ??? ???';

 
  ['answer-input', 'submit-btn', 'hint-btn', 'skip-btn'].forEach(id => {
    document.getElementById(id).disabled = false;
  });

  showLoader(true);

 
  let poke;
  if (gameState.nextQueue.length > 0) {
    poke = gameState.nextQueue.shift();
  } else {
    poke = await fetchGamePokemon(randomGameId());
  }

  gameState.currentPokemon = poke;

  
  document.getElementById('gen-badge').textContent = genFromId(poke.id);

  const progressPct = (gameState.round / TOTAL_ROUNDS) * 100;
  document.getElementById('progress-fill').style.width  = progressPct + '%';
  document.getElementById('progress-label').textContent = `${gameState.round} / ${TOTAL_ROUNDS}`;


  img.src     = poke.sprite;
  img.onload  = () => {
    showLoader(false);
    img.classList.add('float-anim');
    preloadNext();                       
  };
  img.onerror = () => {
    showLoader(false);
    nextPokemon();                       
  };
}


function showHint() {
  if (gameState.hintsUsed >= MAX_HINTS || gameState.answered) return;

  const poke     = gameState.currentPokemon;
  const hintArea = document.getElementById('hint-area');
  const pill     = document.createElement('div');

  if (gameState.hintsUsed === 0) {
  
    pill.className = `hint-pill type-${poke.types[0]}`;
    const dot = document.createElement('div');
    dot.className        = 'hint-dot';
    dot.style.background = 'currentColor';
    pill.appendChild(dot);
    pill.appendChild(document.createTextNode(`Type: ${capitalize(poke.types[0])}`));
  } else {
    pill.className    = 'hint-pill';
    pill.style.cssText = 'color:var(--muted);background:rgba(255,255,255,0.04);border-color:var(--border)';
    pill.textContent  = `Starts with: "${capitalize(poke.name[0])}"`;
  }

  hintArea.appendChild(pill);
  setTimeout(() => pill.classList.add('show'), 50);   

  gameState.score = Math.max(0, gameState.score - 5);
  gameState.hintsUsed++;
  updateScoreDisplay();

  if (gameState.hintsUsed >= MAX_HINTS) {
    document.getElementById('hint-btn').disabled = true;
  }
}


function revealPokemon() {
  const poke = gameState.currentPokemon;
  const img  = document.getElementById('pokemon-img');

  img.classList.remove('float-anim');
  img.classList.add('revealed');

  document.getElementById('question-label').textContent = capitalize(poke.name);
  document.getElementById('info-name').textContent      = capitalize(poke.name);
  document.getElementById('info-weight').textContent    = `${poke.weight} kg`;
  document.getElementById('info-height').textContent    = `${poke.height} m`;
  document.getElementById('info-gen').textContent       = genFromId(poke.id);

  document.getElementById('revealed-info').classList.add('show');

  ['answer-input', 'submit-btn', 'hint-btn', 'skip-btn'].forEach(id => {
    document.getElementById(id).disabled = true;
  });

  gameState.answered = true;
}


function checkAnswer() {
  if (gameState.answered) return;

  const input  = document.getElementById('answer-input');
  const answer = input.value.trim().toLowerCase();
  if (!answer) return;

  const correct = gameState.currentPokemon.name.toLowerCase();

  if (answer === correct) {
    const points = 10
      + (MAX_HINTS - gameState.hintsUsed) * 5  
      + gameState.streak * 2;                    

    gameState.score  += points;
    gameState.streak += 1;

    showFeedback('correct', `Correct! +${points} points`);
    updateScoreDisplay();
    revealPokemon();
    gameState.round++;
    checkGameOver();

  } else {
    const img = document.getElementById('pokemon-img');
    img.classList.remove('wiggle');
    void img.offsetWidth;       
    img.classList.add('wiggle');

    gameState.lives  -= 1;
    gameState.streak  = 0;
    renderLives();
    updateScoreDisplay();

    if (gameState.lives <= 0) {
      showFeedback('wrong', 'No lives left. Revealing...');
      setTimeout(() => {
        revealPokemon();
        showFeedback('reveal', `It was ${capitalize(gameState.currentPokemon.name)}`);
        document.getElementById('input-section').style.display = 'none';
        gameState.round++;
        checkGameOver();
      }, 1000);
    } else {
      const livesWord = gameState.lives === 1 ? 'life' : 'lives';
      showFeedback('wrong', `Wrong. ${gameState.lives} ${livesWord} left.`);
      input.value = '';
    }
  }
}


function revealAndSkip() {
  if (gameState.answered) return;
  gameState.streak = 0;
  updateScoreDisplay();
  revealPokemon();
  showFeedback('reveal', `It was ${capitalize(gameState.currentPokemon.name)}`);
  document.getElementById('input-section').style.display = 'none';
  gameState.round++;
  checkGameOver();
}

function checkGameOver() {
  const gameOver = gameState.round >= TOTAL_ROUNDS || gameState.lives <= 0;
  if (!gameOver) return;

  setTimeout(() => {
    document.getElementById('revealed-info').classList.remove('show');
    document.getElementById('game-over').classList.add('show');
    document.getElementById('final-score').textContent = `${gameState.score} pts`;

    const pct = (gameState.score / (TOTAL_ROUNDS * 20)) * 100;
    document.getElementById('final-msg').textContent =
      pct >= 80 ? 'Pokémon Master! Incredible.'           :
      pct >= 50 ? 'Good job! You know your Pokédex.'      :
                  "Keep practicing — there's more to learn!";
  }, 2000);
}


function nextPokemon() {
  if (gameState.round >= TOTAL_ROUNDS) {
    checkGameOver();
    return;
  }
  loadPokemon();
}

function restartGame() {
  gameState = {
    score: 0, streak: 0, lives: MAX_LIVES,
    round: 0, hintsUsed: 0,
    currentPokemon: null, answered: false, nextQueue: [],
  };
  renderLives();
  updateScoreDisplay();
  document.getElementById('game-over').classList.remove('show');
  loadPokemon();
}


document.getElementById('answer-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});