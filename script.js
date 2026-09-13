/**
 * Universal Game Engine: Crossword
 * Curling Ice Visual Edition with Synthesized Audio & Ambient Drift
 */

(() => {
  'use strict';

  // Config & Constants
  const CSV_DATA_PATH = './puzzles.csv';
  const STORAGE_KEY_NAMESPACE = 'crossword_game_universal_v1';

  // Universal Navigation Placeholder: To be provided by project owner
  const HOME_PAGE_URL = 'https://tileworksgamesstudio.github.io/Curling-Menu/';

  // Defensive Global State
  const state = {
    records: [],
    dates: [],
    todayDate: '',
    selectedDailyTier: 'mini',
    activeDate: '',
    activeTier: '',
    currentPuzzle: null,
    userGrid: [],
    cursor: { r: 0, c: 0 },
    direction: 'across',
    timerSeconds: 0,
    timerInterval: null,
    isSolved: false,
    saveData: {
      stats: {
        played: 0,
        solved: 0,
        streak: 0,
        bestStreak: 0,
        times: { mini: [], midi: [], main: [] }
      },
      inProgress: {},
      history: {}
    }
  };

  // DOM Elements
  const el = {
    screenMenu: document.getElementById('screen-menu'),
    screenGame: document.getElementById('screen-game'),
    screenVault: document.getElementById('screen-vault'),
    screenError: document.getElementById('screen-error'),
    errorMessage: document.getElementById('error-message'),
    btnRetryLoad: document.getElementById('btn-retry-load'),

    dailyDateLabel: document.getElementById('daily-date-label'),
    dailyTierSelector: document.getElementById('daily-tier-selector'),
    btnPlayDaily: document.getElementById('btn-play-daily'),
    btnOpenVault: document.getElementById('btn-open-vault'),
    btnNavHome: document.getElementById('btn-nav-home'),
    btnOpenStats: document.getElementById('btn-open-stats'),
    btnOpenHelp: document.getElementById('btn-open-help'),

    btnBackMenu: document.getElementById('btn-back-menu'),
    btnBackVault: document.getElementById('btn-back-vault'),
    gamePuzzleTitle: document.getElementById('game-puzzle-title'),
    gameTimer: document.getElementById('game-timer'),
    btnGameHelp: document.getElementById('btn-game-help'),
    gameTierTabs: document.getElementById('game-tier-tabs'),
    activeClueBadge: document.getElementById('active-clue-badge'),
    activeClueText: document.getElementById('active-clue-text'),
    crosswordBoard: document.getElementById('crossword-board'),
    cluesListAcross: document.getElementById('clues-list-across'),
    cluesListDown: document.getElementById('clues-list-down'),
    onscreenKeyboard: document.getElementById('onscreen-keyboard'),
    vaultList: document.getElementById('vault-list'),

    modalStats: document.getElementById('modal-stats'),
    modalHelp: document.getElementById('modal-help'),
    modalVictory: document.getElementById('modal-victory'),
    statPlayed: document.getElementById('stat-played'),
    statSolved: document.getElementById('stat-solved'),
    statStreak: document.getElementById('stat-streak'),
    statBest: document.getElementById('stat-best'),
    statsTierTimes: document.getElementById('stats-tier-times'),
    victorySummaryText: document.getElementById('victory-summary-text'),
    btnVictoryAction: document.getElementById('btn-victory-action')
  };

  // ==========================================================================
  // LIGHTWEIGHT WEB AUDIO HARDWARE SOUND EFFECTS (Failsafe & Subtle)
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playTone(type) {
    try {
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'tap') {
        // Crisp stone / ice tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t);
        osc.stop(t + 0.04);
      } else if (type === 'btn') {
        // Tactile equipment press
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.05);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
      } else if (type === 'dir') {
        // Clean glide tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(720, t + 0.06);
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
      } else if (type === 'victory') {
        // Refined 3-note victory triad
        const chord = [523.25, 659.25, 783.99]; // C5, E5, G5
        chord.forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t + i * 0.12);
          g.gain.setValueAtTime(0.05, t + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.35);
          o.connect(g);
          g.connect(audioCtx.destination);
          o.start(t + i * 0.12);
          o.stop(t + i * 0.12 + 0.36);
        });
      }
    } catch (e) {
      // Audio fails silently
    }
  }

  // ==========================================================================
  // AMBIENT CURLING BACKGROUND CANVAS (12 Curling Icons + Canadian Maple Leaf)
  // ==========================================================================
  function initAmbientBackground() {
    const canvas = document.getElementById('curling-ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // Maple Leaf Path Geometry from Section 65.6 (normalized to origin 0,0)
    const leafPath = new Path2D(
      'M 80.88,247.25 L 89.03,227.14 L 23.27,166.27 L 40.66,157.03 L 33.05,112.46 ' +
      'L 72.73,116.81 L 84.69,99.96 L 115.67,139.09 L 98.28,54.30 L 124.37,62.99 ' +
      'L 149.37,17.34 L 172.74,61.91 L 200.46,54.30 L 182.52,138.54 L 213.50,100.50 ' +
      'L 224.37,116.80 L 263.50,113.00 L 257.52,155.94 L 275.46,167.35 L 209.70,227.68 ' +
      'L 216.76,248.88 L 158.06,239.10 L 159.69,311.93 L 137.41,311.93 L 140.67,238.56 Z'
    );

    // 12 Distinct Vector Renderers for Curling Equipment
    const iconRenderers = [
      // 1. Curling Stone
      (ctx) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(-6, -10, 12, 5);
        ctx.stroke();
      },
      // 2. Curling House / Rings
      (ctx) => {
        ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      },
      // 3. Curling Broom
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(-18, -18); ctx.lineTo(12, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(9, 9, 10, 6);
        ctx.stroke();
      },
      // 4. Brush Head
      (ctx) => {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-14, -6, 28, 12, 3) : ctx.rect(-14, -6, 28, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
        ctx.stroke();
      },
      // 5. Hack
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(-12, 8); ctx.lineTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(12, 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
        ctx.stroke();
      },
      // 6. Curling Stone Handle
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(-12, 4); ctx.lineTo(-12, -6); ctx.lineTo(12, -6); ctx.lineTo(12, 4);
        ctx.stroke();
      },
      // 7. Hog Line
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(-20, 0); ctx.lineTo(20, 0);
        ctx.lineWidth = 3;
        ctx.stroke();
      },
      // 8. Back Line
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(-18, 0); ctx.lineTo(18, 0);
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      // 9. Centre Line
      (ctx) => {
        ctx.beginPath();
        ctx.moveTo(0, -18); ctx.lineTo(0, 18);
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      // 10. Curling Pebble / Ice Texture Motif
      (ctx) => {
        ctx.beginPath(); ctx.arc(-8, -6, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8, -4, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-2, 7, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(10, 8, 1.8, 0, Math.PI * 2); ctx.fill();
      },
      // 11. Scoreboard / End Marker
      (ctx) => {
        ctx.beginPath();
        ctx.rect(-14, -10, 28, 20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
        ctx.moveTo(0, -10); ctx.lineTo(0, 10);
        ctx.stroke();
      },
      // 12. Skip / Throwing Position Silhouette
      (ctx) => {
        ctx.beginPath();
        ctx.arc(-6, -10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-12, 4); ctx.lineTo(-4, -4); ctx.lineTo(8, 0); ctx.lineTo(14, 10);
        ctx.stroke();
      }
    ];

    // 3 Depth Levels: Distant, Middle, Near
    const particles = [];
    const count = Math.min(24, Math.max(12, Math.floor(window.innerWidth / 45)));

    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      let depthProps;
      if (depth < 0.45) {
        // Distant
        depthProps = { scale: 0.45 + Math.random() * 0.2, alpha: 0.05 + Math.random() * 0.05, speed: 0.18 + Math.random() * 0.15 };
      } else if (depth < 0.8) {
        // Middle
        depthProps = { scale: 0.7 + Math.random() * 0.25, alpha: 0.09 + Math.random() * 0.07, speed: 0.35 + Math.random() * 0.25 };
      } else {
        // Near
        depthProps = { scale: 0.95 + Math.random() * 0.35, alpha: 0.13 + Math.random() * 0.09, speed: 0.55 + Math.random() * 0.35 };
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -depthProps.speed,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.008,
        scale: depthProps.scale,
        alpha: depthProps.alpha,
        isLeaf: Math.random() < 0.32, // Canadian Maple Leaf frequency
        iconIndex: Math.floor(Math.random() * iconRenderers.length),
        colorTheme: Math.random() < 0.65 ? 'blue' : (Math.random() < 0.5 ? 'red' : 'yellow')
      });
    }

    let animId = null;
    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        if (p.y < -60) {
          p.y = height + 40;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.scale, p.scale);

        let strokeStyle, fillStyle;
        if (p.colorTheme === 'red') {
          strokeStyle = `rgba(214, 0, 33, ${p.alpha})`;
          fillStyle = `rgba(214, 0, 33, ${p.alpha * 0.85})`;
        } else if (p.colorTheme === 'yellow') {
          strokeStyle = `rgba(255, 184, 0, ${p.alpha * 1.1})`;
          fillStyle = `rgba(255, 184, 0, ${p.alpha * 0.9})`;
        } else {
          strokeStyle = `rgba(15, 36, 59, ${p.alpha})`;
          fillStyle = `rgba(15, 36, 59, ${p.alpha * 0.85})`;
        }

        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.lineWidth = 1.6;

        if (p.isLeaf) {
          // Render the authoritative Canadian Maple Leaf
          ctx.save();
          ctx.translate(-14, -16);
          ctx.scale(0.1, 0.1);
          ctx.fillStyle = (p.colorTheme === 'yellow') ? fillStyle : `rgba(214, 0, 33, ${p.alpha * 1.2})`;
          ctx.fill(leafPath);
          ctx.restore();
        } else {
          // Render 1 of the 12 Curling Icons
          iconRenderers[p.iconIndex](ctx);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(renderAmbient);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animId = requestAnimationFrame(renderAmbient);
    }
  }

  // ==========================================================================
  // DEFENSIVE CSV PARSING & DATA HANDLING
  // ==========================================================================
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (inQuotes) {
        if (char === '"' && nextChar === '"') { cell += '"'; i++; }
        else if (char === '"') { inQuotes = false; }
        else { cell += char; }
      } else {
        if (char === '"') { inQuotes = true; }
        else if (char === ',') { row.push(cell.trim()); cell = ''; }
        else if (char === '\n' || char === '\r') {
          if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
          row = []; cell = '';
          if (char === '\r' && nextChar === '\n') i++;
        } else { cell += char; }
      }
    }
    if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
    if (!rows.length) return [];

    const headers = rows[0].map(h => h.toLowerCase());
    return rows.slice(1).map(cols => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
      return obj;
    });
  }

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NAMESPACE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state.saveData.stats = { ...state.saveData.stats, ...(parsed.stats || {}) };
          state.saveData.history = { ...(parsed.history || {}) };
          state.saveData.inProgress = { ...(parsed.inProgress || {}) };
        }
      }
    } catch (e) {
      console.warn('Storage unavailable or reset to default state.', e);
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_NAMESPACE, JSON.stringify(state.saveData));
    } catch (e) {
      console.warn('Unable to persist to storage.', e);
    }
  }

  // Application Lifecycle
  async function init() {
    try {
      loadStorage();
      bindEvents();
      initAmbientBackground();

      const res = await fetch(CSV_DATA_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network response was not ok');
      const text = await res.text();
      const records = parseCSV(text);

      state.records = records.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.grid);
      if (!state.records.length) throw new Error('No valid crossword records found.');

      const uniqueDates = [...new Set(state.records.map(r => r.date))].sort();
      state.dates = uniqueDates;

      // Calculate today's date in UTC/local ISO format
      const todayISO = new Date().toISOString().slice(0, 10);
      const availableDates = uniqueDates.filter(d => d <= todayISO);

      state.todayDate = availableDates.length ? availableDates[availableDates.length - 1] : uniqueDates[0];

      renderMenu();
      showScreen('menu');
    } catch (err) {
      showError(err.message || 'Unable to load puzzle records.');
    }
  }

  function showError(msg) {
    el.errorMessage.textContent = msg;
    showScreen('error');
  }

  function showScreen(screen) {
    el.screenMenu.classList.toggle('hidden', screen !== 'menu');
    el.screenGame.classList.toggle('hidden', screen !== 'game');
    el.screenVault.classList.toggle('hidden', screen !== 'vault');
    el.screenError.classList.toggle('hidden', screen !== 'error');
  }

  // Screen: Main Menu
  function renderMenu() {
    el.dailyDateLabel.textContent = formatDate(state.todayDate);
    el.dailyTierSelector.innerHTML = '';

    const todayTiers = state.records.filter(r => r.date === state.todayDate);
    if (!todayTiers.length) return;

    if (!todayTiers.some(t => t.tier === state.selectedDailyTier)) {
      state.selectedDailyTier = todayTiers[0].tier;
    }

    todayTiers.forEach(item => {
      const isDone = !!state.saveData.history[`${state.todayDate}_${item.tier}`]?.solved;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `tier-pill ${item.tier === state.selectedDailyTier ? 'selected' : ''}`;
      pill.innerHTML = `${item.tier} ${isDone ? '&#x2713;' : ''}`;
      pill.addEventListener('click', () => {
        initAudio();
        playTone('btn');
        state.selectedDailyTier = item.tier;
        renderMenu();
      });
      el.dailyTierSelector.appendChild(pill);
    });

    const isCurrentSolved = !!state.saveData.history[`${state.todayDate}_${state.selectedDailyTier}`]?.solved;
    el.btnPlayDaily.textContent = isCurrentSolved ? `Review Daily (${state.selectedDailyTier})` : `Play Daily (${state.selectedDailyTier})`;
  }

  // Screen: Vault (Historical Archive)
  function renderVault() {
    el.vaultList.innerHTML = '';
    const historicalDates = state.dates.filter(d => d < state.todayDate).reverse();

    if (!historicalDates.length) {
      el.vaultList.innerHTML = '<p style="text-align: center; color: var(--rink-mid-blue); font-weight: 700; padding: 30px;">No historical puzzles in the vault yet.</p>';
      return;
    }

    historicalDates.forEach(date => {
      const dayTiers = state.records.filter(r => r.date === date);
      const card = document.createElement('article');
      card.className = 'vault-card';

      const badges = dayTiers.map(t => {
        const done = !!state.saveData.history[`${date}_${t.tier}`]?.solved;
        return `<span class="vault-badge ${done ? 'completed' : ''}">${t.tier}${done ? ' &#x2713;' : ''}</span>`;
      }).join('');

      card.innerHTML = `
        <span class="vault-date">${formatDate(date)}</span>
        <div class="vault-badges">${badges}</div>
      `;

      card.addEventListener('click', () => {
        initAudio();
        playTone('btn');
        loadPuzzle(date, dayTiers[0].tier);
      });

      el.vaultList.appendChild(card);
    });
  }

  // Grid & Clues Parser
  function parsePuzzleModel(record) {
    const rawLines = record.grid.split(/[\/\r\n]+/).map(s => s.trim()).filter(Boolean);
    const size = rawLines.length;
    const solution = [];
    const blocks = new Set();

    for (let r = 0; r < size; r++) {
      solution[r] = [];
      for (let c = 0; c < size; c++) {
        const char = (rawLines[r][c] || '#').toUpperCase();
        if (char === '#') blocks.add(`${r},${c}`);
        solution[r][c] = char;
      }
    }

    let counter = 1;
    const numbering = {};
    const wordsAcross = [];
    const wordsDown = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (blocks.has(`${r},${c}`)) continue;
        const needsAcross = (c === 0 || blocks.has(`${r},${c - 1}`)) && (c + 1 < size && !blocks.has(`${r},${c + 1}`));
        const needsDown = (r === 0 || blocks.has(`${r - 1},${c}`)) && (r + 1 < size && !blocks.has(`${r + 1},${c}`));

        if (needsAcross || needsDown) {
          numbering[`${r},${c}`] = counter;
          if (needsAcross) wordsAcross.push(counter);
          if (needsDown) wordsDown.push(counter);
          counter++;
        }
      }
    }

    const parseClueList = (str, wordNums) => {
      if (!str) return [];
      const lines = str.split(/\r?\n|\|/).map(s => s.trim()).filter(Boolean);
      return lines.map((line, idx) => {
        const match = line.match(/^(\d+)[\.\:\-]?\s*(.+)$/);
        if (match) return { num: parseInt(match[1], 10), clue: match[2].trim() };
        return { num: wordNums[idx] || (idx + 1), clue: line };
      });
    };

    return {
      size,
      solution,
      blocks,
      numbering,
      clues: {
        across: parseClueList(record.clues_across, wordsAcross),
        down: parseClueList(record.clues_down, wordsDown)
      },
      title: record.title || '',
      date: record.date,
      tier: record.tier
    };
  }

  // Load and Setup Individual Puzzle
  function loadPuzzle(date, tier) {
    const record = state.records.find(r => r.date === date && r.tier === tier);
    if (!record) return;

    state.activeDate = date;
    state.activeTier = tier;
    state.currentPuzzle = parsePuzzleModel(record);

    const size = state.currentPuzzle.size;
    state.userGrid = Array.from({ length: size }, () => Array(size).fill(''));
    state.isSolved = false;
    state.timerSeconds = 0;

    const puzzleKey = `${date}_${tier}`;
    const savedSolved = state.saveData.history[puzzleKey];
    const savedInProgress = state.saveData.inProgress[puzzleKey];

    if (savedSolved?.solved) {
      state.isSolved = true;
      state.timerSeconds = savedSolved.time || 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          state.userGrid[r][c] = state.currentPuzzle.solution[r][c];
        }
      }
    } else if (savedInProgress) {
      state.timerSeconds = savedInProgress.time || 0;
      if (Array.isArray(savedInProgress.grid)) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            state.userGrid[r][c] = savedInProgress.grid[r]?.[c] || '';
          }
        }
      }
    }

    renderGameHeader();
    renderBoard();
    renderClues();
    resetCursor();

    showScreen('game');
    updateTimerDisplay();

    clearInterval(state.timerInterval);
    if (!state.isSolved) {
      state.timerInterval = setInterval(() => {
        state.timerSeconds++;
        updateTimerDisplay();
        persistInProgressState();
      }, 1000);
    }
  }

  function renderGameHeader() {
    const tierDisplay = state.activeTier ? state.activeTier.toUpperCase() : '';
    el.gamePuzzleTitle.textContent = `${formatDate(state.activeDate)} · ${tierDisplay}`;

    el.gameTierTabs.innerHTML = '';
    const dayTiers = state.records.filter(r => r.date === state.activeDate);
    dayTiers.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tab-pill ${t.tier === state.activeTier ? 'active' : ''}`;
      const isDone = !!state.saveData.history[`${state.activeDate}_${t.tier}`]?.solved;
      btn.innerHTML = `${t.tier} ${isDone ? '&#x2713;' : ''}`;
      btn.addEventListener('click', () => {
        initAudio();
        playTone('btn');
        loadPuzzle(state.activeDate, t.tier);
      });
      el.gameTierTabs.appendChild(btn);
    });
  }

  function isBlock(r, c) {
    const p = state.currentPuzzle;
    if (r < 0 || c < 0 || r >= p.size || c >= p.size) return true;
    return p.blocks.has(`${r},${c}`);
  }

  function renderBoard() {
    const size = state.currentPuzzle.size;
    const grid = el.crosswordBoard;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.setAttribute('role', 'gridcell');

        if (isBlock(r, c)) {
          cell.classList.add('cell-black');
          cell.setAttribute('aria-hidden', 'true');
        } else {
          const num = state.currentPuzzle.numbering[`${r},${c}`];
          if (num) {
            const numEl = document.createElement('span');
            numEl.className = 'cell-num';
            numEl.textContent = num;
            cell.appendChild(numEl);
          }
          const letter = state.userGrid[r][c];
          if (letter) {
            const letterEl = document.createElement('span');
            letterEl.className = 'cell-letter';
            letterEl.textContent = letter;
            cell.appendChild(letterEl);
          }
          cell.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            initAudio();
            playTone('tap');
            handleCellTap(r, c);
          });
        }
        grid.appendChild(cell);
      }
    }
  }

  function renderClues() {
    el.cluesListAcross.innerHTML = '';
    el.cluesListDown.innerHTML = '';

    const createClueNode = (item, dir) => {
      const li = document.createElement('li');
      li.className = 'clue-item';
      li.dataset.dir = dir;
      li.dataset.num = item.num;
      li.innerHTML = `<strong>${item.num}.</strong> ${item.clue}`;
      li.addEventListener('click', () => {
        initAudio();
        playTone('tap');
        jumpToWord(item.num, dir);
      });
      return li;
    };

    state.currentPuzzle.clues.across.forEach(c => el.cluesListAcross.appendChild(createClueNode(c, 'across')));
    state.currentPuzzle.clues.down.forEach(c => el.cluesListDown.appendChild(createClueNode(c, 'down')));
  }

  function handleCellTap(r, c) {
    if (isBlock(r, c)) return;
    if (state.cursor.r === r && state.cursor.c === c) {
      state.direction = state.direction === 'across' ? 'down' : 'across';
      playTone('dir');
    } else {
      state.cursor = { r, c };
      if (!isValidDirection(r, c, state.direction)) {
        state.direction = state.direction === 'across' ? 'down' : 'across';
      }
    }
    updateSelection();
  }

  function isValidDirection(r, c, dir) {
    const size = state.currentPuzzle.size;
    if (dir === 'across') return (c > 0 && !isBlock(r, c - 1)) || (c + 1 < size && !isBlock(r, c + 1));
    return (r > 0 && !isBlock(r - 1, c)) || (r + 1 < size && !isBlock(r + 1, c));
  }

  function resetCursor() {
    const size = state.currentPuzzle.size;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isBlock(r, c)) {
          state.cursor = { r, c };
          state.direction = 'across';
          updateSelection();
          return;
        }
      }
    }
  }

  function getWordSpan(r, c, dir) {
    const span = [];
    const size = state.currentPuzzle.size;
    if (dir === 'across') {
      let sc = c; while (sc > 0 && !isBlock(r, sc - 1)) sc--;
      let ec = c; while (ec + 1 < size && !isBlock(r, ec + 1)) ec++;
      for (let cur = sc; cur <= ec; cur++) span.push({ r, c: cur });
    } else {
      let sr = r; while (sr > 0 && !isBlock(sr - 1, c)) sr--;
      let er = r; while (er + 1 < size && !isBlock(er + 1, c)) er++;
      for (let cur = sr; cur <= er; cur++) span.push({ r: cur, c });
    }
    return span;
  }

  function updateSelection() {
    const { r, c } = state.cursor;
    const size = state.currentPuzzle.size;
    const cells = el.crosswordBoard.children;

    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.remove('cell-active', 'cell-word');
      cells[i].removeAttribute('aria-selected');
    }

    const span = getWordSpan(r, c, state.direction);
    span.forEach(pos => {
      const idx = pos.r * size + pos.c;
      if (cells[idx]) cells[idx].classList.add('cell-word');
    });

    const activeIdx = r * size + c;
    if (cells[activeIdx]) {
      cells[activeIdx].classList.add('cell-active');
      cells[activeIdx].setAttribute('aria-selected', 'true');
    }

    if (!span.length) return;
    const root = span[0];
    const num = state.currentPuzzle.numbering[`${root.r},${root.c}`];
    const clueObj = state.currentPuzzle.clues[state.direction].find(i => i.num === num);

    el.activeClueBadge.textContent = num ? `${num}${state.direction === 'across' ? 'A' : 'D'}` : '--';
    el.activeClueText.textContent = clueObj ? clueObj.clue : 'Select a cell.';

    document.querySelectorAll('.clue-item').forEach(item => {
      const matches = item.dataset.dir === state.direction && Number(item.dataset.num) === num;
      item.classList.toggle('active', matches);
      if (matches) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function jumpToWord(num, dir) {
    for (const [coord, wordNum] of Object.entries(state.currentPuzzle.numbering)) {
      if (wordNum === num) {
        const [r, c] = coord.split(',').map(Number);
        state.cursor = { r, c };
        state.direction = dir;
        updateSelection();
        return;
      }
    }
  }

  function handleInput(char) {
    if (state.isSolved) return;
    char = char.toUpperCase();
    if (!/^[A-Z]$/.test(char)) return;

    playTone('tap');

    const { r, c } = state.cursor;
    state.userGrid[r][c] = char;

    const size = state.currentPuzzle.size;
    const cellEl = el.crosswordBoard.children[r * size + c];
    let letterSpan = cellEl.querySelector('.cell-letter');
    if (!letterSpan) {
      letterSpan = document.createElement('span');
      letterSpan.className = 'cell-letter';
      cellEl.appendChild(letterSpan);
    }
    letterSpan.textContent = char;

    persistInProgressState();
    advanceCursor(false);
    checkWin();
  }

  function handleBackspace() {
    if (state.isSolved) return;
    playTone('tap');

    const { r, c } = state.cursor;
    const size = state.currentPuzzle.size;

    if (state.userGrid[r][c]) {
      state.userGrid[r][c] = '';
      const letterSpan = el.crosswordBoard.children[r * size + c].querySelector('.cell-letter');
      if (letterSpan) letterSpan.remove();
    } else {
      advanceCursor(true);
      const pr = state.cursor.r;
      const pc = state.cursor.c;
      state.userGrid[pr][pc] = '';
      const pSpan = el.crosswordBoard.children[pr * size + pc].querySelector('.cell-letter');
      if (pSpan) pSpan.remove();
    }
    persistInProgressState();
    updateSelection();
  }

  function advanceCursor(backwards) {
    const size = state.currentPuzzle.size;
    let { r, c } = state.cursor;
    for (let step = 0; step < size; step++) {
      if (state.direction === 'across') c += backwards ? -1 : 1;
      else r += backwards ? -1 : 1;
      if (r < 0 || c < 0 || r >= size || c >= size) break;
      if (!isBlock(r, c)) {
        state.cursor = { r, c };
        break;
      }
    }
    updateSelection();
  }

  function persistInProgressState() {
    if (state.isSolved) return;
    const key = `${state.activeDate}_${state.activeTier}`;
    state.saveData.inProgress[key] = {
      grid: state.userGrid,
      time: state.timerSeconds
    };
    saveStorage();
  }

  function checkWin() {
    const size = state.currentPuzzle.size;
    const sol = state.currentPuzzle.solution;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isBlock(r, c) && state.userGrid[r][c] !== sol[r][c]) return false;
      }
    }

    state.isSolved = true;
    clearInterval(state.timerInterval);
    playTone('victory');

    const histKey = `${state.activeDate}_${state.activeTier}`;
    delete state.saveData.inProgress[histKey];

    if (!state.saveData.history[histKey]) {
      state.saveData.history[histKey] = { solved: true, time: state.timerSeconds };
      state.saveData.stats.played++;
      state.saveData.stats.solved++;
      state.saveData.stats.streak++;
      if (state.saveData.stats.streak > state.saveData.stats.bestStreak) {
        state.saveData.stats.bestStreak = state.saveData.stats.streak;
      }
      if (!state.saveData.stats.times[state.activeTier]) state.saveData.stats.times[state.activeTier] = [];
      state.saveData.stats.times[state.activeTier].push(state.timerSeconds);
      saveStorage();
    }

    renderGameHeader();
    showVictoryModal();
    return true;
  }

  function showVictoryModal() {
    el.victorySummaryText.textContent = `You solved the ${state.activeTier.toUpperCase()} in ${formatTime(state.timerSeconds)}!`;

    const dayTiers = state.records.filter(r => r.date === state.activeDate);
    const currIdx = dayTiers.findIndex(t => t.tier === state.activeTier);
    const nextTier = dayTiers[currIdx + 1];

    if (nextTier) {
      el.btnVictoryAction.textContent = `Play ${nextTier.tier.toUpperCase()}`;
      el.btnVictoryAction.onclick = () => {
        initAudio();
        playTone('btn');
        closeModal(el.modalVictory);
        loadPuzzle(state.activeDate, nextTier.tier);
      };
    } else {
      el.btnVictoryAction.textContent = 'Back to Menu';
      el.btnVictoryAction.onclick = () => {
        initAudio();
        playTone('btn');
        closeModal(el.modalVictory);
        showScreen('menu');
        renderMenu();
      };
    }
    openModal(el.modalVictory);
  }

  function openStatsModal() {
    const s = state.saveData.stats;
    el.statPlayed.textContent = s.played;
    el.statSolved.textContent = s.solved;
    el.statStreak.textContent = s.streak;
    el.statBest.textContent = s.bestStreak;

    el.statsTierTimes.innerHTML = '';
    ['mini', 'midi', 'main'].forEach(tier => {
      const times = s.times[tier] || [];
      const med = times.length ? formatTime([...times].sort((a, b) => a - b)[Math.floor(times.length / 2)]) : '--:--';
      const li = document.createElement('li');
      li.innerHTML = `<span>${tier}</span><strong>${med}</strong>`;
      el.statsTierTimes.appendChild(li);
    });
    openModal(el.modalStats);
  }

  function openModal(m) { m.classList.remove('hidden'); }
  function closeModal(m) { m.classList.add('hidden'); }

  function updateTimerDisplay() {
    el.gameTimer.textContent = formatTime(state.timerSeconds);
  }

  function formatTime(secs) {
    if (secs == null) return '--:--';
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  function bindEvents() {
    // 1. Play Daily
    el.btnPlayDaily.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      loadPuzzle(state.todayDate, state.selectedDailyTier);
    });

    // 2. Open Vault
    el.btnOpenVault.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      renderVault();
      showScreen('vault');
    });

    // 3. Return Home (Dedicated external navigation handler)
    el.btnNavHome.addEventListener('click', (e) => {
      e.preventDefault();
      initAudio();
      playTone('btn');
      if (HOME_PAGE_URL && HOME_PAGE_URL !== '#') {
        window.location.href = HOME_PAGE_URL;
      } else {
        console.info('Universal Navigation: HOME clicked. Placeholder: ' + HOME_PAGE_URL);
      }
    });

    // Back to Menu from Game Screen
    el.btnBackMenu.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      clearInterval(state.timerInterval);
      showScreen('menu');
      renderMenu();
    });

    // Back to Menu from Vault
    el.btnBackVault.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      showScreen('menu');
      renderMenu();
    });

    // Modals & Retry
    el.btnOpenStats.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      openStatsModal();
    });
    el.btnOpenHelp.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      openModal(el.modalHelp);
    });
    el.btnGameHelp.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      openModal(el.modalHelp);
    });
    el.btnRetryLoad.addEventListener('click', () => {
      initAudio();
      playTone('btn');
      init();
    });

    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => {
        initAudio();
        playTone('btn');
        closeModal(document.getElementById(b.dataset.close));
      });
    });

    // Tactile On-Screen Virtual Keyboard
    el.onscreenKeyboard.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      e.preventDefault();
      initAudio();
      const key = btn.dataset.key;
      if (key === 'DIR') {
        state.direction = state.direction === 'across' ? 'down' : 'across';
        playTone('dir');
        updateSelection();
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key) {
        handleInput(key);
      }
    });

    // Physical Hardware Keyboard Support
    window.addEventListener('keydown', (e) => {
      initAudio();
      if (el.screenGame.classList.contains('hidden')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        state.direction = state.direction === 'across' ? 'down' : 'across';
        playTone('dir');
        updateSelection();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.direction = 'across';
        playTone('tap');
        advanceCursor(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.direction = 'across';
        playTone('tap');
        advanceCursor(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.direction = 'down';
        playTone('tap');
        advanceCursor(false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.direction = 'down';
        playTone('tap');
        advanceCursor(true);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleInput(e.key);
      }
    });
  }

  // Self-initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();