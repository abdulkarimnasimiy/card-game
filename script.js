window.addEventListener('DOMContentLoaded', () => {
  /* ===== ELEMENTS ===== */
  const loader = document.querySelector('.loader');
  const container = document.getElementById('container');

  const timerEl = document.getElementById('timer');
  const movesEl = document.getElementById('moves');
  const bestEl = document.getElementById('best');

  const restartBtn = document.getElementById('restart');
  const themeBtn = document.getElementById('theme');
  const soundBtn = document.getElementById('sound');
  const difficultySelect = document.getElementById('difficulty');

  /* ===== SETTINGS (localStorage) ===== */
  let gridSize = Number(localStorage.getItem('difficulty')) || 4;
  let soundEnabled = localStorage.getItem('sound') !== 'off';
  const savedTheme = localStorage.getItem('theme');

  difficultySelect.value = gridSize;
  if (savedTheme === 'dark') document.body.classList.add('dark');

  /* ===== SOUNDS ===== */
  const flipSound = new Audio('click.wav');
  const matchSound = new Audio('pop.wav');
  const winSound = new Audio('success.wav');

  flipSound.volume = 0.3;
  matchSound.volume = 0.4;
  winSound.volume = 0.5;

  function playSound(audio) {
    if (!soundEnabled) return;
    audio.currentTime = 0;
    audio.play();
  }

  /* ===== ICONS (32 ta unique) ===== */
  const iconsBase = [
    'air-freshener','palette','mug-hot','book',
    'coins','igloo','cog','life-ring',
    'anchor','apple-alt','archway','atom',
    'bell','bicycle','bolt','bomb',
    'brain','bug','camera','car',
    'cloud','code','compass','crown',
    'dice','dragon','feather','fish',
    'gem','ghost','globe','heart'
  ];

  /* ===== GAME STATE ===== */
  let cards = [];
  let first = null;
  let second = null;
  let lock = false;
  let moves = 0;
  let matched = 0;
  let time = 0;
  let timerInterval;

  /* ===== LOADER ===== */
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      startGame();
    }, 500);
  }, 1000);

  /* ===== GAME START ===== */
  function startGame() {
    container.innerHTML = '';
    container.style.setProperty('--cols', gridSize);

    cards = [];
    first = null;
    second = null;
    lock = false;
    moves = 0;
    matched = 0;
    time = 0;

    movesEl.textContent = moves;
    timerEl.textContent = time;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      time++;
      timerEl.textContent = time;
    }, 1000);

    const pairs = (gridSize * gridSize) / 2;
    const selectedIcons = iconsBase.slice(0, pairs);

    const icons = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5);

    icons.forEach(icon => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.icon = icon;

      card.innerHTML = `
        <div class="front"><i class="fas fa-${icon}"></i></div>
        <div class="back"><small>Click</small></div>
      `;

      card.addEventListener('click', () => flipCard(card));
      container.appendChild(card);
      cards.push(card);
    });

    updateBest();
  }

  /* ===== FLIP LOGIC ===== */
  function flipCard(card) {
    if (lock || card === first || card.classList.contains('matched')) return;

    playSound(flipSound);
    card.classList.add('show');

    if (!first) {
      first = card;
      return;
    }

    second = card;
    moves++;
    movesEl.textContent = moves;

    checkMatch();
  }

  function checkMatch() {
    if (first.dataset.icon === second.dataset.icon) {
      playSound(matchSound);

      sparkEffect(first);
      sparkEffect(second);

      first.classList.add('matched');
      second.classList.add('matched');
      matched += 2;
      resetTurn();

      if (matched === cards.length) {
        endGame();
      }
    } else {
      lock = true;
      setTimeout(() => {
        first.classList.remove('show');
        second.classList.remove('show');
        resetTurn();
      }, 800);
    }
  }

  function resetTurn() {
    [first, second] = [null, null];
    lock = false;
  }

  /* ===== END GAME ===== */
  function endGame() {
    clearInterval(timerInterval);
    playSound(winSound);

    const best = localStorage.getItem('bestScore');
    if (!best || moves < best) {
      localStorage.setItem('bestScore', moves);
    }
    updateBest();

    setTimeout(() => {
      alert(`🎉 You Win!\nTime: ${time}s\nMoves: ${moves}`);
    }, 300);
  }

  function updateBest() {
    bestEl.textContent = localStorage.getItem('bestScore') || '--';
  }

  /* ===== CONTROLS ===== */
  restartBtn.addEventListener('click', startGame);

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : ''
    );
  });

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled ? 'on' : 'off');
    soundBtn.textContent = soundEnabled ? '🔊 Sound' : '🔇 Sound';
  });

  difficultySelect.addEventListener('change', () => {
    gridSize = Number(difficultySelect.value);
    localStorage.setItem('difficulty', gridSize);
    startGame();
  });
});

/* ===== SPARK EFFECT ===== */
function sparkEffect(card) {
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';

    spark.style.left = '50%';
    spark.style.top = '50%';
    spark.style.setProperty('--x', `${Math.random() * 60 - 30}px`);
    spark.style.setProperty('--y', `${Math.random() * 60 - 30}px`);

    card.appendChild(spark);
    setTimeout(() => spark.remove(), 400);
  }
}
