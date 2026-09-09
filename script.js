/**
 * CURLING CROSSWORDS — MASTER CLIENT ENGINE
 * Architecture: Platform Shell + Multi-Size Crossword Solver + Daily Scheduler + Vault + 2D Collision Physics
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & CONTINUITY BASELINE
     ========================================================================== */
  const EPOCH_DATE_STRING = "2026-09-08"; // Day 0 Continuity Baseline
  const STORAGE_KEY = "curling_crosswords_state_v1";
  const SOUND_KEY = "curling_puzzles_sound_pref";

  /* ==========================================================================
     2. APP STATE & PERSISTENCE
     ========================================================================== */
  const AppState = {
    currentScreen: 'screen-menu',
    selectedSize: 'mini', // 'mini' | 'midi' | 'main'
    activePuzzleId: null,
    activeDayIndex: 0,
    isVaultPlay: false,

    // Active board interaction state
    activeCell: { row: 0, col: 0 },
    activeDirection: 'across', // 'across' | 'down'
    userGrid: [], // 2D array of user entered characters
    timerSeconds: 0,
    timerInterval: null,
    isComplete: false,

    // Continuity & Stats
    stats: {
      streak: 0,
      completedCount: 0,
      lastCompletedDay: -1
    },
    savedProgress: {}, // puzzleId -> { grid, complete, time }
    soundEnabled: true
  };

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.stats) AppState.stats = Object.assign(AppState.stats, parsed.stats);
        if (parsed.savedProgress) AppState.savedProgress = parsed.savedProgress;
      }
      const soundPref = localStorage.getItem(SOUND_KEY);
      if (soundPref !== null) {
        AppState.soundEnabled = soundPref === 'true';
      }
    } catch (e) {
      console.warn("Could not read localStorage safely:", e);
    }
  }

  function savePersistedState() {
    try {
      const payload = {
        stats: AppState.stats,
        savedProgress: AppState.savedProgress
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(SOUND_KEY, String(AppState.soundEnabled));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  /* ==========================================================================
     3. AUDIO SYSTEM (Subtle, tactile curling click & stone strike)
     ========================================================================== */
  const SoundFX = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
      if (!AppState.soundEnabled) return;
      try {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    },
    keyTap() { this.playTone(420, 'triangle', 0.04, 0.04); },
    cellTap() { this.playTone(560, 'sine', 0.05, 0.05); },
    wordDone() { this.playTone(880, 'sine', 0.12, 0.08); },
    puzzleWin() {
      if (!AppState.soundEnabled) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.22, 0.1), idx * 90);
      });
    }
  };

  /* ==========================================================================
     4. DATE & VAULT SCHEDULING (DAY 0 = 2026-09-08)
     ========================================================================== */
  function computeDayIndex() {
    const epoch = new Date(EPOCH_DATE_STRING + "T00:00:00Z");
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const diffMs = todayUTC.getTime() - epoch.getTime();
    const day = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, day);
  }

  function getDailyPuzzlesForDay(dayIndex) {
    if (!window.CURLING_CROSSWORDS_DATA) return null;
    const dataset = window.CURLING_CROSSWORDS_DATA;
    const miniIdx = dayIndex % dataset.mini.length;
    const midiIdx = dayIndex % dataset.midi.length;
    const mainIdx = dayIndex % dataset.main.length;

    return {
      mini: dataset.mini[miniIdx],
      midi: dataset.midi[midiIdx],
      main: dataset.main[mainIdx]
    };
  }

  function formatDateForDisplay(dayIndex) {
    const epoch = new Date(EPOCH_DATE_STRING + "T00:00:00Z");
    const target = new Date(epoch.getTime() + (dayIndex * 24 * 60 * 60 * 1000));
    return target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  /* ==========================================================================
     5. BACKGROUND PHYSICS SIMULATION (Curling Rocks Gliding & Deflecting)
     ========================================================================== */
  const IceCanvas = {
    canvas: null,
    ctx: null,
    stones: [],
    animId: null,
    width: 0,
    height: 0,
    lastTime: 0,
    nextAggressiveEvent: 20,

    init() {
      this.canvas = document.getElementById('ambient-ice-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());

      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.populateStones();

      if (!isReduced) {
        this.lastTime = performance.now();
        this.loop(this.lastTime);
      } else {
        this.render();
      }
    },

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    populateStones() {
      const isNarrow = window.innerWidth < 600;
      const isGameScreen = AppState.currentScreen === 'screen-game';
      
      // Quieter ambient environment during gameplay to preserve puzzle focus
      const count = isGameScreen ? (isNarrow ? 2 : 3) : (isNarrow ? 5 : 7);
      const radius = isNarrow ? 24 : 30;
      this.stones = [];

      for (let i = 0; i < count; i++) {
        const team = (i % 2 === 0) ? 'red' : 'yellow';
        
        // Generate pre-computed mineral flecks for authentic Trefor granite
        const flecks = [];
        for (let f = 0; f < 12; f++) {
          const angle = Math.random() * Math.PI * 2;
          const rDist = (0.25 + Math.random() * 0.6) * radius;
          flecks.push({
            x: Math.cos(angle) * rDist,
            y: Math.sin(angle) * rDist,
            rad: 0.8 + Math.random() * 1.2,
            alpha: 0.25 + Math.random() * 0.35
          });
        }

        this.stones.push({
          x: Math.random() * (this.width - radius * 2) + radius,
          y: Math.random() * (this.height - radius * 2) + radius,
          vx: (Math.random() - 0.5) * (isGameScreen ? 0.25 : 0.42),
          vy: (Math.random() - 0.5) * (isGameScreen ? 0.25 : 0.42),
          radius: radius,
          mass: radius * radius,
          team: team,
          rotation: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.006,
          flecks: flecks
        });
      }
    },

    triggerAggressiveRock() {
      if (AppState.currentScreen === 'screen-game') return; // Do not disturb gameplay
      const isNarrow = window.innerWidth < 600;
      const radius = isNarrow ? 26 : 32;
      const team = Math.random() > 0.5 ? 'red' : 'yellow';

      const fromLeft = Math.random() > 0.5;
      const x = fromLeft ? -radius : this.width + radius;
      const y = this.height * (0.2 + Math.random() * 0.6);
      const targetX = this.width * 0.5;
      const targetY = this.height * 0.5;
      const angle = Math.atan2(targetY - y, targetX - x);
      const speed = 2.2 + Math.random() * 0.8;

      const flecks = [];
      for (let f = 0; f < 14; f++) {
        const a = Math.random() * Math.PI * 2;
        const rDist = (0.25 + Math.random() * 0.6) * radius;
        flecks.push({
          x: Math.cos(a) * rDist,
          y: Math.sin(a) * rDist,
          rad: 0.8 + Math.random() * 1.2,
          alpha: 0.3 + Math.random() * 0.4
        });
      }

      this.stones.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: radius,
        mass: radius * radius * 1.2,
        team: team,
        rotation: 0,
        spinSpeed: (Math.random() - 0.5) * 0.015,
        flecks: flecks,
        isTransient: true
      });
    },

    update(dt) {
      const damping = 0.9985; // Natural sheet friction
      const restitution = 0.84; // Authentic heavy curling stone collision bounce

      // Aggressive entry event countdown
      this.nextAggressiveEvent -= dt;
      if (this.nextAggressiveEvent <= 0) {
        this.triggerAggressiveRock();
        this.nextAggressiveEvent = 22 + Math.random() * 12;
      }

      for (let i = this.stones.length - 1; i >= 0; i--) {
        const s = this.stones[i];
        s.x += s.vx * (dt * 60);
        s.y += s.vy * (dt * 60);
        s.rotation += s.spinSpeed * (dt * 60);
        s.vx *= Math.pow(damping, dt * 60);
        s.vy *= Math.pow(damping, dt * 60);

        // Keep stone alive gently if not transient
        if (!s.isTransient && Math.hypot(s.vx, s.vy) < 0.1) {
          s.vx += (Math.random() - 0.5) * 0.12;
          s.vy += (Math.random() - 0.5) * 0.12;
        }

        // Boundary reflection
        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = Math.abs(s.vx) * restitution;
        } else if (s.x + s.radius > this.width) {
          s.x = this.width - s.radius;
          s.vx = -Math.abs(s.vx) * restitution;
        }

        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = Math.abs(s.vy) * restitution;
        } else if (s.y + s.radius > this.height) {
          s.y = this.height - s.radius;
          s.vy = -Math.abs(s.vy) * restitution;
        }

        // Cleanup out-of-bounds transients
        if (s.isTransient && (s.x < -100 || s.x > this.width + 100 || s.y < -100 || s.y > this.height + 100)) {
          this.stones.splice(i, 1);
        }
      }

      // Pairwise Rock Collisions
      for (let i = 0; i < this.stones.length; i++) {
        for (let j = i + 1; j < this.stones.length; j++) {
          const s1 = this.stones[i];
          const s2 = this.stones[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0.0001) {
            // 1. Positional overlap correction
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            s1.x -= nx * overlap * 0.5;
            s1.y -= ny * overlap * 0.5;
            s2.x += nx * overlap * 0.5;
            s2.y += ny * overlap * 0.5;

            // 2. Relative velocity along collision normal
            const rvx = s2.vx - s1.vx;
            const rvy = s2.vy - s1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const impulse = -(1 + restitution) * velAlongNormal / (1 / s1.mass + 1 / s2.mass);
              s1.vx -= (impulse / s1.mass) * nx;
              s1.vy -= (impulse / s1.mass) * ny;
              s2.vx += (impulse / s2.mass) * nx;
              s2.vy += (impulse / s2.mass) * ny;

              // Impart subtle spin transfer on impact
              s1.spinSpeed += (Math.random() - 0.5) * 0.003;
              s2.spinSpeed += (Math.random() - 0.5) * 0.003;
            }
          }
        }
      }
    },

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // --- Subtle Ice Sheet Markings ---
      const centerX = this.width / 2;
      const centerY = this.height / 2;

      // Longitudinal Center Line
      this.ctx.strokeStyle = 'rgba(21, 59, 93, 0.12)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, 0);
      this.ctx.lineTo(centerX, this.height);
      this.ctx.stroke();

      // Transverse Tee Line & Hog Line
      this.ctx.beginPath();
      this.ctx.moveTo(0, centerY);
      this.ctx.lineTo(this.width, centerY);
      this.ctx.stroke();

      // Faint Rink House Rings at Center
      const maxRingRadius = Math.min(this.width, this.height) * 0.38;
      if (maxRingRadius > 40 && AppState.currentScreen !== 'screen-game') {
        // 12-Foot Outer Blue Ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRingRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 112, 243, 0.14)';
        this.ctx.lineWidth = maxRingRadius * 0.34;
        this.ctx.stroke();

        // 4-Foot Red Ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRingRadius * 0.33, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(214, 59, 59, 0.14)';
        this.ctx.lineWidth = maxRingRadius * 0.22;
        this.ctx.stroke();

        // Button
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, maxRingRadius * 0.1, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
      }

      // --- Render Individual Curling Stones ---
      const opacity = AppState.currentScreen === 'screen-game' ? 0.35 : 0.88;

      for (let s of this.stones) {
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.globalAlpha = opacity;

        // 1. Ice Contact Drop Shadow (Grounds stone firmly onto the ice)
        this.ctx.save();
        this.ctx.scale(1, 0.7);
        this.ctx.beginPath();
        this.ctx.arc(0, s.radius * 0.35, s.radius * 1.05, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(16, 47, 74, 0.18)';
        this.ctx.filter = 'blur(4px)';
        this.ctx.fill();
        this.ctx.restore();

        // Rotate for granite texture & handle direction
        this.ctx.rotate(s.rotation);

        // 2. Granite Stone Body (Spherical gradient light catch)
        const graniteGrad = this.ctx.createRadialGradient(
          -s.radius * 0.25, -s.radius * 0.25, s.radius * 0.1,
          0, 0, s.radius
        );
        graniteGrad.addColorStop(0, '#c8d4df');
        graniteGrad.addColorStop(0.5, '#a4b3c2');
        graniteGrad.addColorStop(0.88, '#8291a0');
        graniteGrad.addColorStop(1, '#657482');

        this.ctx.beginPath();
        this.ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = graniteGrad;
        this.ctx.fill();

        // 3. Granite Bevel Rim & Edge Shadow
        this.ctx.lineWidth = 1.6;
        this.ctx.strokeStyle = 'rgba(21, 59, 93, 0.3)';
        this.ctx.stroke();

        // 4. Subtle Mineral Inclusions / Flecks
        for (let fl of s.flecks) {
          this.ctx.beginPath();
          this.ctx.arc(fl.x, fl.y, fl.rad, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(30, 48, 68, ${fl.alpha})`;
          this.ctx.fill();
        }

        // 5. Polished Striking Band Bevel Ring
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s.radius * 0.78, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();

        // 6. Central Handle Fastener Hub
        this.ctx.beginPath();
        this.ctx.arc(0, 0, s.radius * 0.24, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = '#153b5d';
        this.ctx.stroke();

        // 7. Authentic Red / Yellow Team Gooseneck Handle
        const isRed = s.team === 'red';
        const handleColor = isRed ? '#d63b3b' : '#f0c647';
        const handleShade = isRed ? '#b92e34' : '#d8aa32';

        // Cast shadow of handle onto granite deck
        this.ctx.beginPath();
        this.ctx.rect(-s.radius * 0.44 + 2, -s.radius * 0.12 + 3, s.radius * 0.88, s.radius * 0.24);
        this.ctx.fillStyle = 'rgba(16, 47, 74, 0.28)';
        this.ctx.fill();

        // Main Handle Bar
        this.ctx.beginPath();
        const hW = s.radius * 0.86;
        const hH = s.radius * 0.24;
        if (typeof this.ctx.roundRect === 'function') {
          this.ctx.roundRect(-hW / 2, -hH / 2, hW, hH, 3.5);
        } else {
          this.ctx.rect(-hW / 2, -hH / 2, hW, hH);
        }
        this.ctx.fillStyle = handleColor;
        this.ctx.fill();
        this.ctx.lineWidth = 1.2;
        this.ctx.strokeStyle = handleShade;
        this.ctx.stroke();

        // Handle Highlight Line
        this.ctx.beginPath();
        this.ctx.moveTo(-hW * 0.38, -hH * 0.2);
        this.ctx.lineTo(hW * 0.38, -hH * 0.2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();

        this.ctx.restore();
      }
    },

    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;
      this.update(dt);
      this.render();
      this.animId = requestAnimationFrame((t) => this.loop(t));
    }
  };

  /* ==========================================================================
     6. CROSSWORD BOARD LOGIC & RENDERING
     ========================================================================== */
  function getActivePuzzle() {
    const dataset = window.CURLING_CROSSWORDS_DATA;
    if (!dataset) return null;
    const dayPuzzles = getDailyPuzzlesForDay(AppState.activeDayIndex);
    if (!dayPuzzles) return null;
    return dayPuzzles[AppState.selectedSize];
  }

  function initUserGrid(puzzle) {
    const saved = AppState.savedProgress[puzzle.id];
    if (saved && saved.grid && saved.grid.length === puzzle.grid.length) {
      AppState.userGrid = JSON.parse(JSON.stringify(saved.grid));
      AppState.isComplete = !!saved.complete;
    } else {
      AppState.userGrid = [];
      for (let r = 0; r < puzzle.grid.length; r++) {
        const row = [];
        for (let c = 0; c < puzzle.grid[r].length; c++) {
          row.push(puzzle.grid[r][c] === '#' ? '#' : '');
        }
        AppState.userGrid.push(row);
      }
      AppState.isComplete = false;
    }
  }

  function renderGridDOM(puzzle) {
    const boardEl = document.getElementById('crossword-board');
    boardEl.innerHTML = '';
    const size = puzzle.grid.length;
    boardEl.dataset.size = size;
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    // Find first playable cell if active is blocked
    if (puzzle.grid[AppState.activeCell.row][AppState.activeCell.col] === '#') {
      firstPlayable: for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (puzzle.grid[r][c] !== '#') {
            AppState.activeCell = { row: r, col: c };
            break firstPlayable;
          }
        }
      }
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        if (puzzle.grid[r][c] === '#') {
          cell.classList.add('blocked');
          cell.setAttribute('aria-hidden', 'true');
        } else {
          cell.setAttribute('role', 'gridcell');
          cell.tabIndex = 0;

          const num = puzzle.cellNumbers && puzzle.cellNumbers[r] ? puzzle.cellNumbers[r][c] : null;
          if (num) {
            const numSpan = document.createElement('span');
            numSpan.className = 'cell-num';
            numSpan.textContent = num;
            cell.appendChild(numSpan);
          }

          const letterSpan = document.createElement('span');
          letterSpan.className = 'cell-letter';
          letterSpan.textContent = AppState.userGrid[r][c] || '';
          cell.appendChild(letterSpan);

          cell.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            onCellClicked(r, c);
          });
        }
        boardEl.appendChild(cell);
      }
    }

    updateSelectionHighlight(puzzle);
    renderCluesLists(puzzle);
    updateActiveClueBanner(puzzle);
  }

  function onCellClicked(row, col) {
    const puzzle = getActivePuzzle();
    if (!puzzle || puzzle.grid[row][col] === '#') return;

    if (AppState.activeCell.row === row && AppState.activeCell.col === col) {
      // Toggle orientation if clicking currently focused cell
      AppState.activeDirection = AppState.activeDirection === 'across' ? 'down' : 'across';
    } else {
      AppState.activeCell = { row, col };
    }
    SoundFX.cellTap();
    updateSelectionHighlight(puzzle);
    updateActiveClueBanner(puzzle);
  }

  function getWordCellsAt(puzzle, row, col, direction) {
    const cells = [];
    if (direction === 'across') {
      let startCol = col;
      while (startCol > 0 && puzzle.grid[row][startCol - 1] !== '#') startCol--;
      let c = startCol;
      while (c < puzzle.grid[0].length && puzzle.grid[row][c] !== '#') {
        cells.push({ row, col: c });
        c++;
      }
    } else {
      let startRow = row;
      while (startRow > 0 && puzzle.grid[startRow - 1][col] !== '#') startRow--;
      let r = startRow;
      while (r < puzzle.grid.length && puzzle.grid[r][col] !== '#') {
        cells.push({ row: r, col });
        r++;
      }
    }
    return cells;
  }

  function getActiveClue(puzzle) {
    const { row, col } = AppState.activeCell;
    const dir = AppState.activeDirection;
    const wordCells = getWordCellsAt(puzzle, row, col, dir);
    if (!wordCells.length) return null;
    const start = wordCells[0];
    const clueNum = puzzle.cellNumbers[start.row][start.col];

    const clueObj = puzzle.clues[dir].find(cl => cl.num === clueNum);
    return clueObj ? { ...clueObj, direction: dir, cells: wordCells } : null;
  }

  function updateSelectionHighlight(puzzle) {
    const wordCells = getWordCellsAt(puzzle, AppState.activeCell.row, AppState.activeCell.col, AppState.activeDirection);
    const cellElements = document.querySelectorAll('#crossword-board .grid-cell:not(.blocked)');

    cellElements.forEach(el => {
      const r = parseInt(el.dataset.row, 10);
      const c = parseInt(el.dataset.col, 10);
      const isFocused = (r === AppState.activeCell.row && c === AppState.activeCell.col);
      const isInWord = wordCells.some(w => w.row === r && w.col === c);

      el.classList.toggle('active-cell', isFocused);
      el.classList.toggle('word-highlight', isInWord && !isFocused);
      if (isFocused) {
        el.focus({ preventScroll: true });
      }
    });
  }

  function updateActiveClueBanner(puzzle) {
    const activeClue = getActiveClue(puzzle);
    const numEl = document.getElementById('active-clue-label');
    const textEl = document.getElementById('active-clue-text');

    if (activeClue) {
      numEl.textContent = `${activeClue.num}${activeClue.direction === 'across' ? 'A' : 'D'}`;
      textEl.textContent = activeClue.clue;
    } else {
      numEl.textContent = "—";
      textEl.textContent = "Select a cell";
    }

    document.querySelectorAll('.clue-item-row').forEach(row => {
      const isMatch = activeClue &&
        row.dataset.dir === activeClue.direction &&
        parseInt(row.dataset.num, 10) === activeClue.num;
      row.classList.toggle('active', !!isMatch);
      if (isMatch) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function renderCluesLists(puzzle) {
    const acrossContainer = document.getElementById('clues-list-across');
    const downContainer = document.getElementById('clues-list-down');
    acrossContainer.innerHTML = '';
    downContainer.innerHTML = '';

    const buildList = (list, dir, el) => {
      list.forEach(cl => {
        const row = document.createElement('div');
        row.className = 'clue-item-row';
        row.dataset.num = cl.num;
        row.dataset.dir = dir;
        row.innerHTML = `<strong>${cl.num}.</strong> <span>${cl.clue}</span>`;
        row.addEventListener('click', () => {
          firstCell: for (let r = 0; r < puzzle.grid.length; r++) {
            for (let c = 0; c < puzzle.grid[0].length; c++) {
              if (puzzle.cellNumbers[r][c] === cl.num) {
                AppState.activeCell = { row: r, col: c };
                AppState.activeDirection = dir;
                break firstCell;
              }
            }
          }
          SoundFX.cellTap();
          updateSelectionHighlight(puzzle);
          updateActiveClueBanner(puzzle);
        });
        el.appendChild(row);
      });
    };

    buildList(puzzle.clues.across, 'across', acrossContainer);
    buildList(puzzle.clues.down, 'down', downContainer);
  }

  /* ==========================================================================
     7. USER INPUT & TYPING PIPELINE
     ========================================================================== */
  function handleLetterInput(char) {
    const puzzle = getActivePuzzle();
    if (!puzzle || AppState.isComplete) return;

    const { row, col } = AppState.activeCell;
    if (puzzle.grid[row][col] === '#') return;

    AppState.userGrid[row][col] = char.toUpperCase();
    SoundFX.keyTap();

    const cellEl = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"] .cell-letter`);
    if (cellEl) cellEl.textContent = char.toUpperCase();

    advanceCursor(puzzle, 1);
    saveActiveBoardProgress(puzzle);
    checkPuzzleCompletion(puzzle);
  }

  function handleBackspace() {
    const puzzle = getActivePuzzle();
    if (!puzzle || AppState.isComplete) return;

    const { row, col } = AppState.activeCell;
    if (AppState.userGrid[row][col] !== '') {
      AppState.userGrid[row][col] = '';
      const cellEl = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"] .cell-letter`);
      if (cellEl) cellEl.textContent = '';
      SoundFX.keyTap();
    } else {
      advanceCursor(puzzle, -1);
      const prev = AppState.activeCell;
      AppState.userGrid[prev.row][prev.col] = '';
      const cellEl = document.querySelector(`.grid-cell[data-row="${prev.row}"][data-col="${prev.col}"] .cell-letter`);
      if (cellEl) cellEl.textContent = '';
      SoundFX.keyTap();
    }

    saveActiveBoardProgress(puzzle);
  }

  function advanceCursor(puzzle, step) {
    let { row, col } = AppState.activeCell;
    const isAcross = AppState.activeDirection === 'across';

    if (step > 0) {
      if (isAcross) {
        if (col + 1 < puzzle.grid[0].length && puzzle.grid[row][col + 1] !== '#') {
          AppState.activeCell = { row, col: col + 1 };
        }
      } else {
        if (row + 1 < puzzle.grid.length && puzzle.grid[row + 1][col] !== '#') {
          AppState.activeCell = { row: row + 1, col };
        }
      }
    } else {
      if (isAcross) {
        if (col - 1 >= 0 && puzzle.grid[row][col - 1] !== '#') {
          AppState.activeCell = { row, col: col - 1 };
        }
      } else {
        if (row - 1 >= 0 && puzzle.grid[row - 1][col] !== '#') {
          AppState.activeCell = { row: row - 1, col };
        }
      }
    }
    updateSelectionHighlight(puzzle);
    updateActiveClueBanner(puzzle);
  }

  function stepClue(delta) {
    const puzzle = getActivePuzzle();
    if (!puzzle) return;
    const currentClue = getActiveClue(puzzle);
    if (!currentClue) return;

    const list = puzzle.clues[AppState.activeDirection];
    const currentIdx = list.findIndex(c => c.num === currentClue.num);
    let nextIdx = currentIdx + delta;

    if (nextIdx < 0) {
      AppState.activeDirection = AppState.activeDirection === 'across' ? 'down' : 'across';
      const otherList = puzzle.clues[AppState.activeDirection];
      nextIdx = otherList.length - 1;
    } else if (nextIdx >= list.length) {
      AppState.activeDirection = AppState.activeDirection === 'across' ? 'down' : 'across';
      nextIdx = 0;
    }

    const targetClue = puzzle.clues[AppState.activeDirection][nextIdx];
    if (targetClue) {
      firstCell: for (let r = 0; r < puzzle.grid.length; r++) {
        for (let c = 0; c < puzzle.grid[0].length; c++) {
          if (puzzle.cellNumbers[r][c] === targetClue.num) {
            AppState.activeCell = { row: r, col: c };
            break firstCell;
          }
        }
      }
      SoundFX.cellTap();
      updateSelectionHighlight(puzzle);
      updateActiveClueBanner(puzzle);
    }
  }

  /* ==========================================================================
     8. VALIDATION & VICTORY RESOLUTION
     ========================================================================== */
  function checkPuzzleCompletion(puzzle) {
    let allFilled = true;
    let allCorrect = true;

    for (let r = 0; r < puzzle.grid.length; r++) {
      for (let c = 0; c < puzzle.grid[0].length; c++) {
        const expected = puzzle.grid[r][c];
        if (expected !== '#') {
          const userVal = AppState.userGrid[r][c];
          if (!userVal) {
            allFilled = false;
            break;
          }
          if (userVal !== expected) {
            allCorrect = false;
          }
        }
      }
      if (!allFilled) break;
    }

    if (allFilled && allCorrect && !AppState.isComplete) {
      AppState.isComplete = true;
      clearInterval(AppState.timerInterval);
      saveActiveBoardProgress(puzzle, true);

      // Daily streak management
      if (!AppState.isVaultPlay && AppState.activeDayIndex !== AppState.stats.lastCompletedDay) {
        AppState.stats.streak += 1;
        AppState.stats.completedCount += 1;
        AppState.stats.lastCompletedDay = AppState.activeDayIndex;
      } else if (AppState.isVaultPlay) {
        AppState.stats.completedCount += 1;
      }
      savePersistedState();
      updateMenuBadges();

      setTimeout(() => {
        SoundFX.puzzleWin();
        showWinModal(puzzle);
      }, 350);
    }
  }

  function saveActiveBoardProgress(puzzle, isFinished = false) {
    AppState.savedProgress[puzzle.id] = {
      grid: AppState.userGrid,
      complete: isFinished || AppState.isComplete,
      time: AppState.timerSeconds
    };
    savePersistedState();
  }

  function showWinModal(puzzle) {
    const modal = document.getElementById('modal-complete');
    document.getElementById('res-time').textContent = formatTimer(AppState.timerSeconds);
    document.getElementById('res-board').textContent = `${puzzle.title} (${puzzle.size}×${puzzle.size})`;
    document.getElementById('res-streak').textContent = String(AppState.stats.streak);
    modal.classList.remove('hidden');
  }

  function formatTimer(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer() {
    clearInterval(AppState.timerInterval);
    const timerEl = document.getElementById('game-timer');
    AppState.timerInterval = setInterval(() => {
      if (!AppState.isComplete) {
        AppState.timerSeconds++;
        timerEl.textContent = formatTimer(AppState.timerSeconds);
      }
    }, 1000);
  }

  /* ==========================================================================
     9. NAVIGATION & SCREEN CONTROLS
     ========================================================================== */
  function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      AppState.currentScreen = screenId;
    }
    // Update ambient rock density according to screen context
    IceCanvas.populateStones();
  }

  function launchPuzzle(size, dayIndex, isVault = false) {
    AppState.selectedSize = size;
    AppState.activeDayIndex = dayIndex;
    AppState.isVaultPlay = isVault;

    const puzzle = getActivePuzzle();
    if (!puzzle) return;

    AppState.activePuzzleId = puzzle.id;
    document.getElementById('game-badge-type').textContent = `${puzzle.title} (${puzzle.size}×${puzzle.size})`;

    initUserGrid(puzzle);
    renderGridDOM(puzzle);

    AppState.timerSeconds = (AppState.savedProgress[puzzle.id] && AppState.savedProgress[puzzle.id].time) || 0;
    document.getElementById('game-timer').textContent = formatTimer(AppState.timerSeconds);
    startTimer();

    navigateTo('screen-game');
  }

  function updateMenuBadges() {
    const todayIndex = computeDayIndex();
    const todayPuzzles = getDailyPuzzlesForDay(todayIndex);
    if (!todayPuzzles) return;

    ['mini', 'midi', 'main'].forEach(size => {
      const p = todayPuzzles[size];
      const saved = AppState.savedProgress[p.id];
      const badge = document.getElementById(`status-badge-${size}`);
      if (saved && saved.complete) {
        badge.textContent = "Done";
        badge.classList.add('done');
      } else {
        badge.textContent = "Play";
        badge.classList.remove('done');
      }
    });

    document.getElementById('stat-streak').textContent = String(AppState.stats.streak);
    document.getElementById('stat-completed').textContent = String(AppState.stats.completedCount);
    document.getElementById('stat-vault-count').textContent = String(todayIndex);
  }

  function populateVaultScreen(filter = 'all') {
    const vaultList = document.getElementById('vault-list-items');
    vaultList.innerHTML = '';
    const todayIndex = computeDayIndex();

    if (todayIndex === 0) {
      vaultList.innerHTML = `
        <div class="glass-panel" style="padding: 24px; text-align: center; color: var(--ink-muted);">
          <p><strong>The Vault is currently empty.</strong></p>
          <p style="font-size:0.8rem; margin-top:6px;">Day 0 puzzles are live today. Tomorrow, today’s boards will be safely archived here.</p>
        </div>`;
      return;
    }

    // Populate strictly prior released days (day 0 up to todayIndex - 1)
    for (let day = todayIndex - 1; day >= 0; day--) {
      const dayData = getDailyPuzzlesForDay(day);
      const dateStr = formatDateForDisplay(day);

      const sizes = filter === 'all' ? ['mini', 'midi', 'main'] : [filter];

      sizes.forEach(sz => {
        const pz = dayData[sz];
        const isDone = AppState.savedProgress[pz.id] && AppState.savedProgress[pz.id].complete;

        const card = document.createElement('div');
        card.className = 'vault-card';
        card.innerHTML = `
          <div class="vault-card-left">
            <span class="v-date">${dateStr}</span>
            <span class="v-meta">${pz.title} • ${pz.size}×${pz.size} • ${isDone ? '✓ Completed' : 'Unfinished'}</span>
          </div>
          <button class="btn btn-primary vault-play-btn" data-day="${day}" data-size="${sz}">
            ${isDone ? 'Replay' : 'Solve'}
          </button>
        `;
        vaultList.appendChild(card);
      });
    }

    vaultList.querySelectorAll('.vault-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day, 10);
        const sz = btn.dataset.size;
        launchPuzzle(sz, day, true);
      });
    });
  }

  /* ==========================================================================
     10. ATTACH EVENT LISTENERS
     ========================================================================== */
  function attachListeners() {
    // Menu Size Selector Tabs
    const pills = document.querySelectorAll('.size-selector-pills .pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        AppState.selectedSize = pill.dataset.size;

        const infoTitle = document.getElementById('selected-info-title');
        const infoDesc = document.getElementById('selected-info-desc');
        if (AppState.selectedSize === 'mini') {
          infoTitle.textContent = "Mini Crossword";
          infoDesc.textContent = "A fast 4×4 sheet challenge to warm up your delivery.";
        } else if (AppState.selectedSize === 'midi') {
          infoTitle.textContent = "Midi Crossword";
          infoDesc.textContent = "A balanced 6×6 rink grid of medium tactics and team play.";
        } else {
          infoTitle.textContent = "Main Crossword";
          infoDesc.textContent = "A full 10×10 championship test of deep curling strategy and lore.";
        }
        SoundFX.cellTap();
      });
    });

    // Play Today Button
    document.getElementById('btn-play-today').addEventListener('click', () => {
      launchPuzzle(AppState.selectedSize, computeDayIndex(), false);
    });

    // Nav to Vault
    document.getElementById('btn-open-vault').addEventListener('click', () => {
      populateVaultScreen('all');
      navigateTo('screen-vault');
    });

    document.getElementById('btn-vault-back').addEventListener('click', () => {
      navigateTo('screen-menu');
    });

    document.getElementById('btn-game-back').addEventListener('click', () => {
      clearInterval(AppState.timerInterval);
      navigateTo('screen-menu');
    });

    document.getElementById('btn-nav-menu').addEventListener('click', () => {
      clearInterval(AppState.timerInterval);
      navigateTo('screen-menu');
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    soundBtn.addEventListener('click', () => {
      AppState.soundEnabled = !AppState.soundEnabled;
      document.getElementById('sound-icon-on').classList.toggle('hidden', !AppState.soundEnabled);
      document.getElementById('sound-icon-off').classList.toggle('hidden', AppState.soundEnabled);
      savePersistedState();
      SoundFX.keyTap();
    });

    // Clue list tabs across / down
    const tabAcross = document.getElementById('tab-across');
    const tabDown = document.getElementById('tab-down');
    const listAcross = document.getElementById('clues-list-across');
    const listDown = document.getElementById('clues-list-down');

    tabAcross.addEventListener('click', () => {
      tabAcross.classList.add('active');
      tabDown.classList.remove('active');
      listAcross.classList.remove('hidden');
      listDown.classList.add('hidden');
      AppState.activeDirection = 'across';
      updateSelectionHighlight(getActivePuzzle());
      updateActiveClueBanner(getActivePuzzle());
    });

    tabDown.addEventListener('click', () => {
      tabDown.classList.add('active');
      tabAcross.classList.remove('active');
      listDown.classList.remove('hidden');
      listAcross.classList.add('hidden');
      AppState.activeDirection = 'down';
      updateSelectionHighlight(getActivePuzzle());
      updateActiveClueBanner(getActivePuzzle());
    });

    // Active clue steppers
    document.getElementById('clue-prev-btn').addEventListener('click', () => stepClue(-1));
    document.getElementById('clue-next-btn').addEventListener('click', () => stepClue(1));

    // Direction Toggle on virtual keyboard
    document.getElementById('key-dir-toggle').addEventListener('click', () => {
      AppState.activeDirection = AppState.activeDirection === 'across' ? 'down' : 'across';
      SoundFX.cellTap();
      const p = getActivePuzzle();
      updateSelectionHighlight(p);
      updateActiveClueBanner(p);
    });

    // Touch Virtual Keyboard
    document.querySelectorAll('#touch-keyboard .key-btn[data-key]').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const key = btn.dataset.key;
        if (key === 'BACKSPACE') {
          handleBackspace();
        } else {
          handleLetterInput(key);
        }
      });
    });

    // Physical Hardware Keyboard
    window.addEventListener('keydown', (e) => {
      if (AppState.currentScreen !== 'screen-game') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        handleLetterInput(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        AppState.activeDirection = 'across';
        advanceCursor(getActivePuzzle(), 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        AppState.activeDirection = 'across';
        advanceCursor(getActivePuzzle(), -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        AppState.activeDirection = 'down';
        advanceCursor(getActivePuzzle(), 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        AppState.activeDirection = 'down';
        advanceCursor(getActivePuzzle(), -1);
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        AppState.activeDirection = AppState.activeDirection === 'across' ? 'down' : 'across';
        updateSelectionHighlight(getActivePuzzle());
        updateActiveClueBanner(getActivePuzzle());
      }
    });

    // Vault filters
    document.querySelectorAll('.vault-size-filters .v-filter-btn').forEach(fbtn => {
      fbtn.addEventListener('click', () => {
        document.querySelectorAll('.vault-size-filters .v-filter-btn').forEach(b => b.classList.remove('active'));
        fbtn.classList.add('active');
        populateVaultScreen(fbtn.dataset.vfilter);
      });
    });

    // Win Modal Actions
    document.getElementById('btn-win-close').addEventListener('click', () => {
      document.getElementById('modal-complete').classList.add('hidden');
      navigateTo('screen-menu');
    });

    document.getElementById('btn-win-next-size').addEventListener('click', () => {
      document.getElementById('modal-complete').classList.add('hidden');
      const order = ['mini', 'midi', 'main'];
      const nextIdx = (order.indexOf(AppState.selectedSize) + 1) % order.length;
      launchPuzzle(order[nextIdx], AppState.activeDayIndex, AppState.isVaultPlay);
    });

    // Board Tools Modal
    const toolsModal = document.getElementById('modal-tools');
    document.getElementById('btn-reveal-menu').addEventListener('click', () => toolsModal.classList.remove('hidden'));
    document.getElementById('btn-close-tools').addEventListener('click', () => toolsModal.classList.add('hidden'));

    document.getElementById('tool-check-letter').addEventListener('click', () => {
      const p = getActivePuzzle();
      const { row, col } = AppState.activeCell;
      if (p && p.grid[row][col] !== '#') {
        if (AppState.userGrid[row][col] !== p.grid[row][col]) {
          AppState.userGrid[row][col] = '';
          const cellEl = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"] .cell-letter`);
          if (cellEl) cellEl.textContent = '';
        }
      }
      toolsModal.classList.add('hidden');
    });

    document.getElementById('tool-check-word').addEventListener('click', () => {
      const p = getActivePuzzle();
      const cells = getWordCellsAt(p, AppState.activeCell.row, AppState.activeCell.col, AppState.activeDirection);
      cells.forEach(({ row, col }) => {
        if (AppState.userGrid[row][col] !== p.grid[row][col]) {
          AppState.userGrid[row][col] = '';
          const cellEl = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"] .cell-letter`);
          if (cellEl) cellEl.textContent = '';
        }
      });
      toolsModal.classList.add('hidden');
    });

    document.getElementById('tool-clear-board').addEventListener('click', () => {
      const p = getActivePuzzle();
      if (p) {
        initUserGrid(p);
        renderGridDOM(p);
      }
      toolsModal.classList.add('hidden');
    });
  }

  /* ==========================================================================
     11. APP INITIALIZATION & BOOTSTRAP
     ========================================================================== */
  function init() {
    loadPersistedState();
    const todayIndex = computeDayIndex();
    document.getElementById('menu-today-date').textContent = formatDateForDisplay(todayIndex);

    IceCanvas.init();
    attachListeners();
    updateMenuBadges();

    // Sound icon initialization
    document.getElementById('sound-icon-on').classList.toggle('hidden', !AppState.soundEnabled);
    document.getElementById('sound-icon-off').classList.toggle('hidden', AppState.soundEnabled);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();