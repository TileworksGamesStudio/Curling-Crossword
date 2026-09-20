/**
 * Crossword Universal Engine & Canadian Curling Ice House Simulation
 * Soft Neo-Brutalism, Authoritative Network Clock Sync, Full Game Mechanics
 * Continuous Bottom-Launch Miniature Curling End with Button Convergence & Recurring Mega Take-outs.
 */

(() => {
  'use strict';

  // Config & Constants
  const CSV_DATA_PATH = './puzzles.csv';
  const STORAGE_KEY_NAMESPACE = 'curling_crossword_game_app_state';
  const TIME_API_ENDPOINT = 'https://worldtimeapi.org/api/timezone/Europe/London';
  const HOME_PAGE_URL = 'https://tileworksgamesstudio.github.io/Curling-Menu/';

  // Defensive Global Application State
  const state = {
    records: [],
    dates: [],
    todayUKDate: '',
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

    // Time Authority Sync
    timeOffsetMs: 0,
    isTimeSynced: false,

    // Preferences & Local Data
    settings: {
      backgroundAnimation: true
    },
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

  // DOM Elements Map
  const el = {
    siteHeader: document.getElementById('site-header'),
    btnHeaderHome: document.getElementById('btn-header-home'),
    headerGameMeta: document.getElementById('header-game-meta'),
    gameTimer: document.getElementById('game-timer'),
    btnGameHelp: document.getElementById('btn-game-help'),

    screenMenu: document.getElementById('screen-menu'),
    screenGame: document.getElementById('screen-game'),
    screenVault: document.getElementById('screen-vault'),
    screenError: document.getElementById('screen-error'),
    errorMessage: document.getElementById('error-message'),
    btnRetryLoad: document.getElementById('btn-retry-load'),

    dailyDateLabel: document.getElementById('daily-date-label'),
    dailyTierSelector: document.getElementById('daily-tier-selector'),
    btnPlayGame: document.getElementById('btn-play-game'),
    btnPlayLabel: document.getElementById('btn-play-label'),
    btnMenuVault: document.getElementById('btn-menu-vault'),
    btnMenuSettings: document.getElementById('btn-menu-settings'),
    btnMenuHelp: document.getElementById('btn-menu-help'),

    btnUtilStats: document.getElementById('btn-util-stats'),
    btnUtilShare: document.getElementById('btn-util-share'),
    btnUtilPlus: document.getElementById('btn-util-plus'),

    gameActiveTitle: document.getElementById('game-active-title'),
    btnGameBack: document.getElementById('btn-game-back'),
    gameTierTabs: document.getElementById('game-tier-tabs'),
    activeClueTrigger: document.getElementById('active-clue-trigger'),
    activeClueBadge: document.getElementById('active-clue-badge'),
    activeClueText: document.getElementById('active-clue-text'),
    crosswordBoard: document.getElementById('crossword-board'),
    cluesListAcross: document.getElementById('clues-list-across'),
    cluesListDown: document.getElementById('clues-list-down'),
    onscreenKeyboard: document.getElementById('onscreen-keyboard'),

    vaultList: document.getElementById('vault-list'),
    btnVaultBack: document.getElementById('btn-vault-back'),

    panelHowToPlayOverlay: document.getElementById('panel-howtoplay-overlay'),
    panelHelpBackdrop: document.getElementById('panel-help-backdrop'),
    btnCloseHelp: document.getElementById('btn-close-help'),

    modalSettings: document.getElementById('modal-settings'),
    optAnimOn: document.getElementById('opt-anim-on'),
    optAnimOff: document.getElementById('opt-anim-off'),

    modalStats: document.getElementById('modal-stats'),
    statPlayed: document.getElementById('stat-played'),
    statSolved: document.getElementById('stat-solved'),
    statStreak: document.getElementById('stat-streak'),
    statBest: document.getElementById('stat-best'),
    statsTierTimes: document.getElementById('stats-tier-times'),

    modalVictory: document.getElementById('modal-victory'),
    victorySummaryText: document.getElementById('victory-summary-text'),
    btnVictoryAction: document.getElementById('btn-victory-action'),

    toastMessage: document.getElementById('toast-message'),
    curlingCanvas: document.getElementById('curling-simulation-canvas')
  };

  /* ==========================================================================
     CANADIAN CURLING ICE HOUSE ENGINE
     Bottom-launch, strict RED/YELLOW alternation, elevated button (~40% height),
     predictive button convergence, light curl, and recurring 9th-throw mega take-out.
     ========================================================================== */

  class CanadianCurlingSimulation {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.rocks = [];
      this.activeRock = null;
      this.throwCount = 0;
      this.lastTime = 0;
      this.animId = null;
      this.isEnabled = true;

      // House & Sheet geometry
      this.houseX = 0;
      this.houseY = 0;
      this.houseRadius = 0;
      this.rockRadius = 16;
      this.quiescenceTimer = 0;
      this.interShotTimer = 0.5;

      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      this.width = w;
      this.height = h;

      // Elevated house: ~40% of simulation height
      this.houseX = w * 0.5;
      this.houseY = h * 0.40;
      this.houseRadius = Math.min(w * 0.32, h * 0.22, 170);
      this.rockRadius = Math.max(13, Math.min(18, this.houseRadius * 0.12));
    }

    start() {
      if (!this.isEnabled) return;
      this.lastTime = performance.now();
      const loop = (now) => {
        if (!this.isEnabled) return;
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        this.update(dt);
        this.render();
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    planNextThrow() {
      this.throwCount++;
      const isMega = (this.throwCount % 9 === 0);
      const isRed = (this.throwCount % 2 === 1);
      const team = isRed ? 'RED' : 'YELLOW';

      // Corridors: tight ±5% sheet centre corridor
      const corridorWidth = this.width * 0.10;
      const startX = this.houseX + (Math.random() - 0.5) * corridorWidth;
      // Pre-roll below viewport
      const startY = this.height + (this.height * (0.18 + Math.random() * 0.12));

      let targetX = this.houseX;
      let targetY = this.houseY;
      let intent = 'DRAW';
      let speedMultiplier = 1.0;

      if (isMega) {
        intent = 'MEGA';
        speedMultiplier = 2.8 + Math.random() * 0.4; // 2.8x-3.2x cruise speed
        // Find keystone target from settled rocks
        const clusterRocks = this.rocks.filter(r => !r.isDelivering && r.inPlay);
        if (clusterRocks.length > 0) {
          // Select stone closest to button or with most neighbours
          clusterRocks.sort((a, b) => {
            const da = Math.hypot(a.x - this.houseX, a.y - this.houseY);
            const db = Math.hypot(b.x - this.houseX, b.y - this.houseY);
            return da - db;
          });
          const keystone = clusterRocks[0];
          // Target keystone with slight edge bias for chain reaction
          const contactOffset = (Math.random() - 0.5) * this.rockRadius * 0.8;
          targetX = keystone.x + contactOffset;
          targetY = keystone.y;
        }
      } else {
        // Evaluate existing formation
        const occupied = this.rocks.filter(r => !r.isDelivering && r.inPlay);
        const roll = Math.random();

        if (occupied.length === 0 || roll < 0.55) {
          // 95% Button Draw Intent
          intent = 'DRAW';
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (this.houseRadius * 0.08); // within 10% house radius
          targetX = this.houseX + Math.cos(angle) * dist;
          targetY = this.houseY + Math.sin(angle) * dist;
        } else if (roll < 0.72) {
          // Guard intent in front of house
          intent = 'GUARD';
          targetX = this.houseX + (Math.random() - 0.5) * (this.houseRadius * 0.5);
          targetY = this.houseY + this.houseRadius * (1.1 + Math.random() * 0.35);
        } else if (roll < 0.88) {
          // Freeze intent against opponent
          intent = 'FREEZE';
          const opponentRocks = occupied.filter(r => r.team !== team);
          if (opponentRocks.length) {
            const opp = opponentRocks[Math.floor(Math.random() * opponentRocks.length)];
            const angle = Math.random() * Math.PI * 2;
            targetX = opp.x + Math.cos(angle) * (this.rockRadius * 1.85);
            targetY = opp.y + Math.sin(angle) * (this.rockRadius * 1.85);
          }
        } else {
          // Controlled Take-out / Hit & Roll (~10% hard non-mega class)
          intent = 'TAKEOUT';
          speedMultiplier = 1.9 + Math.random() * 0.4;
          const oppRocks = occupied.filter(r => r.team !== team);
          if (oppRocks.length) {
            const opp = oppRocks[0];
            targetX = opp.x;
            targetY = opp.y;
          }
        }
      }

      // Light curl calibration: 50% readable light curl
      const hasCurl = (Math.random() < 0.58) || intent === 'COME-AROUND';
      const spinSign = Math.random() < 0.5 ? 1 : -1;
      const spinSpeed = hasCurl ? (1.6 + Math.random() * 1.2) * spinSign : (0.4 + Math.random() * 0.4) * spinSign;

      // Closed-loop initial velocity solving
      const totalDist = Math.hypot(targetX - startX, targetY - startY);
      const friction = 0.988;
      // Solve launch speed so rock decelerates naturally into target
      let v0 = isMega ? 720 * speedMultiplier : Math.sqrt(2 * (1 - friction) * 60 * totalDist) * 14.5 * speedMultiplier;
      v0 = Math.max(isMega ? 620 : 210, Math.min(isMega ? 880 : 340, v0));

      const angle = Math.atan2(targetY - startY, targetX - startX);
      // Curl pre-compensation: aim slightly counter to curl
      const curlOffset = hasCurl ? (spinSign * -0.045) : 0;
      const initialHeading = angle + curlOffset;

      const rock = {
        id: this.throwCount,
        team,
        x: startX,
        y: startY,
        vx: Math.cos(initialHeading) * v0,
        vy: Math.sin(initialHeading) * v0,
        radius: this.rockRadius,
        mass: 1.0,
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: spinSpeed,
        visualSpin: spinSpeed,
        curlFactor: hasCurl ? 0.024 * spinSign : 0.002 * spinSign,
        intent,
        isDelivering: true,
        inPlay: true,
        sleeping: false,
        stallWatchdog: 0,
        lastY: startY
      };

      this.activeRock = rock;
      this.rocks.push(rock);
    }

    update(dt) {
      // 1. Check if board is quiescent to launch next throw
      let anyMoving = false;
      for (const r of this.rocks) {
        if (!r.inPlay) continue;
        const speed = Math.hypot(r.vx, r.vy);
        if (speed > 4.0 || r.isDelivering) {
          anyMoving = true;
          break;
        }
      }

      if (!anyMoving) {
        this.quiescenceTimer += dt;
        if (this.quiescenceTimer >= this.interShotTimer) {
          this.quiescenceTimer = 0;
          this.planNextThrow();
        }
      } else {
        this.quiescenceTimer = 0;
      }

      // 2. Physics integration with sub-stepping for CCD on fast mega shots
      const substeps = this.activeRock?.intent === 'MEGA' ? 4 : 2;
      const subDt = dt / substeps;

      for (let s = 0; s < substeps; s++) {
        for (const rock of this.rocks) {
          if (!rock.inPlay || rock.sleeping) continue;

          // Continuous spin-to-curl lateral drift
          const speed = Math.hypot(rock.vx, rock.vy);
          if (speed > 6.0 && rock.curlFactor !== 0) {
            const sideX = -rock.vy / speed;
            const sideY = rock.vx / speed;
            const curlAcc = rock.curlFactor * speed * 3.5;
            rock.vx += sideX * curlAcc * subDt;
            rock.vy += sideY * curlAcc * subDt;
          }

          // Positional travel
          rock.x += rock.vx * subDt;
          rock.y += rock.vy * subDt;

          // Ice drag
          const drag = Math.pow(0.989, subDt * 60);
          rock.vx *= drag;
          rock.vy *= drag;

          // Angular deceleration
          rock.angularVelocity *= Math.pow(0.985, subDt * 60);
          rock.rotation += rock.angularVelocity * subDt;

          // Independent visual spin tail
          rock.visualSpin = rock.angularVelocity * 1.5;

          // Anti-bottom-stall watchdog: must progress upward in lower 20%
          if (rock.isDelivering && rock.y > this.height * 0.8) {
            rock.stallWatchdog += subDt;
            if (rock.stallWatchdog > 1.2 && rock.vy > -20) {
              rock.vy = -180; // Gentle forward nudge to ensure sheet delivery
              rock.stallWatchdog = 0;
            }
          }

          // Settle condition
          if (rock.isDelivering && rock.y < this.height * 0.75) {
            if (speed < 4.0) {
              rock.isDelivering = false;
              rock.sleeping = true;
              rock.vx = 0;
              rock.vy = 0;
            }
          } else if (!rock.isDelivering && speed < 3.5) {
            rock.sleeping = true;
            rock.vx = 0;
            rock.vy = 0;
          }

          // Out-of-bounds physical ejection
          if (rock.x < -60 || rock.x > this.width + 60 || rock.y < -80 || rock.y > this.height + 140) {
            rock.inPlay = false;
            rock.sleeping = true;
            if (this.activeRock === rock) this.activeRock = null;
          }
        }

        // 3. Circle-to-Circle Collision Resolution
        for (let i = 0; i < this.rocks.length; i++) {
          const r1 = this.rocks[i];
          if (!r1.inPlay) continue;
          for (let j = i + 1; j < this.rocks.length; j++) {
            const r2 = this.rocks[j];
            if (!r2.inPlay) continue;

            const dx = r2.x - r1.x;
            const dy = r2.y - r1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = r1.radius + r2.radius;

            if (dist < minDist && dist > 0.001) {
              // Positional separation
              const overlap = (minDist - dist);
              const nx = dx / dist;
              const ny = dy / dist;
              r1.x -= nx * overlap * 0.5;
              r1.y -= ny * overlap * 0.5;
              r2.x += nx * overlap * 0.5;
              r2.y += ny * overlap * 0.5;

              // Wake contacted rocks
              r1.sleeping = false;
              r2.sleeping = false;

              // Relative normal impulse
              const kx = r1.vx - r2.vx;
              const ky = r1.vy - r2.vy;
              const p = 2 * (nx * kx + ny * ky) / (r1.mass + r2.mass);

              if (p > 0) {
                // Restitution: hard take-outs preserve high normal momentum
                const restitution = (r1.intent === 'MEGA' || r2.intent === 'MEGA') ? 0.94 : 0.82;
                r1.vx -= p * r2.mass * nx * restitution;
                r1.vy -= p * r2.mass * ny * restitution;
                r2.vx += p * r1.mass * nx * restitution;
                r2.vy += p * r1.mass * ny * restitution;

                // Tangential friction
                const tx = -ny;
                const ty = nx;
                const tangentSpeed = (kx * tx + ky * ty) * 0.15;
                r1.vx -= tx * tangentSpeed;
                r1.vy -= ty * tangentSpeed;
                r2.vx += tx * tangentSpeed;
                r2.vy += ty * tangentSpeed;
              }
            }
          }
        }
      }

      // Bounded active formation cleanup (recycle exited rocks safely)
      if (this.rocks.length > 24) {
        this.rocks = this.rocks.filter(r => r.inPlay);
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Authoritative Curling House Geometry
      this.drawHouse(ctx);

      // 2. Render Curling Stones
      for (const rock of this.rocks) {
        if (!rock.inPlay) continue;
        this.drawStone(ctx, rock);
      }
    }

    drawHouse(ctx) {
      const x = this.houseX;
      const y = this.houseY;
      const hr = this.houseRadius;

      // Concentric Rings: 12-foot, 8-foot, 4-foot, Button
      ctx.save();
      ctx.lineWidth = 2.5;

      // 12-Foot Ring (Royal Blue)
      ctx.beginPath();
      ctx.arc(x, y, hr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 59, 114, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(18, 59, 114, 0.28)';
      ctx.stroke();

      // 8-Foot Ring (Ice White / Contrast)
      ctx.beginPath();
      ctx.arc(x, y, hr * 0.66, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(18, 59, 114, 0.25)';
      ctx.stroke();

      // 4-Foot Ring (Red Ring)
      ctx.beginPath();
      ctx.arc(x, y, hr * 0.33, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 16, 46, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(200, 16, 46, 0.32)';
      ctx.stroke();

      // The Button (Centre Pin)
      ctx.beginPath();
      ctx.arc(x, y, hr * 0.085, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(18, 59, 114, 0.5)';
      ctx.stroke();

      // Centre & Tee Lines
      ctx.strokeStyle = 'rgba(18, 59, 114, 0.22)';
      ctx.lineWidth = 1.5;

      // Tee line
      ctx.beginPath();
      ctx.moveTo(x - hr * 1.3, y);
      ctx.lineTo(x + hr * 1.3, y);
      ctx.stroke();

      // Centre line
      ctx.beginPath();
      ctx.moveTo(x, y - hr * 1.25);
      ctx.lineTo(x, this.height);
      ctx.stroke();

      ctx.restore();
    }

    drawStone(ctx, rock) {
      ctx.save();
      ctx.translate(rock.x, rock.y);

      // Contact shadow
      ctx.beginPath();
      ctx.arc(2, 4, rock.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(11, 36, 80, 0.16)';
      ctx.fill();

      // Granite stone body (identical physical diameter)
      ctx.beginPath();
      ctx.arc(0, 0, rock.radius, 0, Math.PI * 2);

      const grad = ctx.createRadialGradient(-3, -4, 2, 0, 0, rock.radius);
      if (rock.team === 'RED') {
        grad.addColorStop(0, '#E62645');
        grad.addColorStop(0.55, '#C8102E');
        grad.addColorStop(1, '#8B0F24');
      } else {
        grad.addColorStop(0, '#FFE875');
        grad.addColorStop(0.55, '#FFD52A');
        grad.addColorStop(1, '#C99A00');
      }

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rock.team === 'RED' ? '#6B0B1C' : '#997300';
      ctx.stroke();

      // Inner striking band
      ctx.beginPath();
      ctx.arc(0, 0, rock.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fill();

      // Polished handle with true rotation
      ctx.rotate(rock.rotation);
      ctx.fillStyle = '#0B1724';
      ctx.fillRect(-rock.radius * 0.55, -2.2, rock.radius * 1.1, 4.4);

      // Handle grip highlight
      ctx.fillStyle = rock.team === 'RED' ? '#FF667D' : '#FFF2A8';
      ctx.fillRect(-rock.radius * 0.25, -1.2, rock.radius * 0.5, 2.4);

      ctx.restore();
    }
  }

  let curlingSim = null;

  function initCurlingBackground() {
    curlingSim = new CanadianCurlingSimulation(el.curlingCanvas);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (state.settings.backgroundAnimation && !prefersReducedMotion) {
      curlingSim.start();
    }
  }

  function setBackgroundAnimation(enabled) {
    state.settings.backgroundAnimation = enabled;
    saveStorage();

    el.optAnimOn.classList.toggle('active', enabled);
    el.optAnimOn.setAttribute('aria-checked', String(enabled));
    el.optAnimOff.classList.toggle('active', !enabled);
    el.optAnimOff.setAttribute('aria-checked', String(!enabled));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (enabled && !prefersReducedMotion) {
      curlingSim.isEnabled = true;
      if (!curlingSim.animId) curlingSim.start();
    } else {
      curlingSim.isEnabled = false;
      curlingSim.stop();
    }
  }

  /* ==========================================================================
     TIME SYNCHRONIZATION & UK RELEASE SYSTEM
     ========================================================================== */

  async function syncAuthoritativeTime() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(TIME_API_ENDPOINT, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const serverEpoch = new Date(data.utc_datetime).getTime();
        state.timeOffsetMs = serverEpoch - Date.now();
        state.isTimeSynced = true;
      } else {
        throw new Error('WorldTimeAPI status not OK');
      }
    } catch (e) {
      try {
        const headRes = await fetch(CSV_DATA_PATH, { method: 'HEAD', cache: 'no-store' });
        const dateHeader = headRes.headers.get('date');
        if (dateHeader) {
          const headerEpoch = new Date(dateHeader).getTime();
          state.timeOffsetMs = headerEpoch - Date.now();
          state.isTimeSynced = true;
        }
      } catch (fallbackErr) {
        console.warn('Network time sync unavailable; falling back to monotonic local clock.');
      }
    }

    state.todayUKDate = calculateUKReleaseDate();
  }

  function calculateUKReleaseDate() {
    const authoritativeEpoch = Date.now() + state.timeOffsetMs;
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(authoritativeEpoch));
  }

  /* ==========================================================================
     PERSISTENCE & STORAGE
     ========================================================================== */

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NAMESPACE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.settings && typeof parsed.settings === 'object') {
            state.settings = { ...state.settings, ...parsed.settings };
          }
          if (parsed.stats && typeof parsed.stats === 'object') {
            state.saveData.stats = { ...state.saveData.stats, ...parsed.stats };
          }
          if (parsed.history && typeof parsed.history === 'object') {
            state.saveData.history = { ...parsed.history };
          }
          if (parsed.inProgress && typeof parsed.inProgress === 'object') {
            state.saveData.inProgress = { ...parsed.inProgress };
          }
        }
      }
    } catch (e) {
      console.warn('Local storage empty or inaccessible.');
    }
  }

  function saveStorage() {
    try {
      const payload = {
        settings: state.settings,
        stats: state.saveData.stats,
        history: state.saveData.history,
        inProgress: state.saveData.inProgress
      };
      localStorage.setItem(STORAGE_KEY_NAMESPACE, JSON.stringify(payload));
    } catch (e) {
      console.warn('Unable to persist to storage.');
    }
  }

  /* ==========================================================================
     CSV PARSER
     ========================================================================== */

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

  /* ==========================================================================
     APPLICATION INITIALIZATION & SCREEN ROUTING
     ========================================================================== */

  async function init() {
    try {
      loadStorage();
      bindEvents();
      initCurlingBackground();

      const res = await fetch(CSV_DATA_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error loading crossword data.');
      const text = await res.text();
      const records = parseCSV(text);

      state.records = records.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.grid);
      if (!state.records.length) throw new Error('No valid crossword records found.');

      state.dates = [...new Set(state.records.map(r => r.date))].sort();

      await syncAuthoritativeTime();

      const availableDates = state.dates.filter(d => d <= state.todayUKDate);
      state.todayDate = availableDates.length ? availableDates[availableDates.length - 1] : state.dates[0];

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

    el.headerGameMeta.classList.toggle('active', screen === 'game');
  }

  /* ==========================================================================
     SCREEN 1: MAIN MENU
     ========================================================================== */

  function renderMenu() {
    el.dailyDateLabel.textContent = `Daily Sheet · ${formatDate(state.todayDate)}`;
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
      pill.innerHTML = `<span>${item.tier}</span>${isDone ? ' &#x2713;' : ''}`;
      pill.addEventListener('click', () => {
        state.selectedDailyTier = item.tier;
        renderMenu();
      });
      el.dailyTierSelector.appendChild(pill);
    });

    const isCurrentSolved = !!state.saveData.history[`${state.todayDate}_${state.selectedDailyTier}`]?.solved;
    const tierDisplay = state.selectedDailyTier.charAt(0).toUpperCase() + state.selectedDailyTier.slice(1);
    el.btnPlayLabel.textContent = isCurrentSolved
      ? `Review ${tierDisplay} Crossword`
      : `Play ${tierDisplay} Crossword`;
  }

  /* ==========================================================================
     SCREEN 3: VAULT ARCHIVE
     ========================================================================== */

  function renderVault() {
    el.vaultList.innerHTML = '';
    const historicalDates = state.dates.filter(d => d < state.todayDate).reverse();

    if (!historicalDates.length) {
      el.vaultList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 36px;">No historical sheets in the vault yet.</p>';
      return;
    }

    historicalDates.forEach(date => {
      const dayTiers = state.records.filter(r => r.date === date);
      const card = document.createElement('article');
      card.className = 'vault-card';

      const badges = dayTiers.map(t => {
        const done = !!state.saveData.history[`${date}_${t.tier}`]?.solved;
        return `<span class="vault-tier-badge ${done ? 'completed' : ''}">${t.tier}${done ? ' &#x2713;' : ''}</span>`;
      }).join('');

      card.innerHTML = `
        <span class="vault-date">${formatDate(date)}</span>
        <div class="vault-badges">${badges}</div>
      `;

      card.addEventListener('click', () => {
        loadPuzzle(date, dayTiers[0].tier);
      });

      el.vaultList.appendChild(card);
    });
  }

  /* ==========================================================================
     GRID & CLUE PARSER ENGINE
     ========================================================================== */

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
      title: record.title || 'Daily Crossword',
      date: record.date,
      tier: record.tier
    };
  }

  function isBlock(r, c) {
    const p = state.currentPuzzle;
    if (r < 0 || c < 0 || r >= p.size || c >= p.size) return true;
    return p.blocks.has(`${r},${c}`);
  }

  /* ==========================================================================
     GAMEPLAY STATE & INTERACTION
     Single-tap cell interaction, zero double-tap lag.
     ========================================================================== */

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
    el.gameActiveTitle.textContent = `${state.currentPuzzle.title} · ${state.activeTier.toUpperCase()}`;
    el.gameTierTabs.innerHTML = '';
    const dayTiers = state.records.filter(r => r.date === state.activeDate);

    dayTiers.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tier-tab-pill ${t.tier === state.activeTier ? 'active' : ''}`;
      const isDone = !!state.saveData.history[`${state.activeDate}_${t.tier}`]?.solved;
      btn.innerHTML = `${t.tier}${isDone ? ' &#x2713;' : ''}`;
      btn.addEventListener('click', () => loadPuzzle(state.activeDate, t.tier));
      el.gameTierTabs.appendChild(btn);
    });
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
      li.addEventListener('click', () => jumpToWord(item.num, dir));
      return li;
    };

    state.currentPuzzle.clues.across.forEach(c => el.cluesListAcross.appendChild(createClueNode(c, 'across')));
    state.currentPuzzle.clues.down.forEach(c => el.cluesListDown.appendChild(createClueNode(c, 'down')));
  }

  function handleCellTap(r, c) {
    if (isBlock(r, c)) return;
    if (state.cursor.r === r && state.cursor.c === c) {
      state.direction = state.direction === 'across' ? 'down' : 'across';
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
    el.activeClueText.textContent = clueObj ? clueObj.clue : 'Select any cell to view clue.';

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
    el.victorySummaryText.textContent = `Completed in ${formatTime(state.timerSeconds)}!`;
    const dayTiers = state.records.filter(r => r.date === state.activeDate);
    const currIdx = dayTiers.findIndex(t => t.tier === state.activeTier);
    const nextTier = dayTiers[currIdx + 1];

    if (nextTier) {
      el.btnVictoryAction.querySelector('.btn-text').textContent = `Play ${nextTier.tier.toUpperCase()}`;
      el.btnVictoryAction.onclick = () => {
        closeModal(el.modalVictory);
        loadPuzzle(state.activeDate, nextTier.tier);
      };
    } else {
      el.btnVictoryAction.querySelector('.btn-text').textContent = 'Back to Menu';
      el.btnVictoryAction.onclick = () => {
        closeModal(el.modalVictory);
        showScreen('menu');
        renderMenu();
      };
    }
    openModal(el.modalVictory);
  }

  /* ==========================================================================
     HOW TO PLAY PANEL (RIGHT-SIDE ENTRY SYSTEM)
     ========================================================================== */

  function openHowToPlay() {
    el.panelHowToPlayOverlay.classList.remove('hidden');
    void el.panelHowToPlayOverlay.offsetWidth;
    el.panelHowToPlayOverlay.classList.add('active');
    el.panelHowToPlayOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeHowToPlay() {
    el.panelHowToPlayOverlay.classList.remove('active');
    el.panelHowToPlayOverlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      el.panelHowToPlayOverlay.classList.add('hidden');
    }, 450);
  }

  /* ==========================================================================
     STATISTICS, SETTINGS & UTILITIES
     ========================================================================== */

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

  function openSettingsModal() {
    const isAnim = state.settings.backgroundAnimation;
    el.optAnimOn.classList.toggle('active', isAnim);
    el.optAnimOn.setAttribute('aria-checked', String(isAnim));
    el.optAnimOff.classList.toggle('active', !isAnim);
    el.optAnimOff.setAttribute('aria-checked', String(!isAnim));
    openModal(el.modalSettings);
  }

  async function handleShareAction() {
    const shareData = {
      title: 'Crossword 🍁 Ice House Royale',
      text: `Solve today's Crossword Daily on the ice sheet!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!');
      } catch (err) {
        // user cancelled
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Sheet link copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy link.');
      }
    } else {
      showToast('Sharing not supported on this browser.');
    }
  }

  function handlePlusAction() {
    showToast('Tileworks Portal: More Canadian games coming soon 🍁');
  }

  function showToast(msg) {
    el.toastMessage.textContent = msg;
    el.toastMessage.classList.remove('hidden');
    el.toastMessage.style.opacity = '1';
    setTimeout(() => {
      el.toastMessage.style.opacity = '0';
      setTimeout(() => el.toastMessage.classList.add('hidden'), 200);
    }, 2400);
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

  /* ==========================================================================
     EVENT BINDINGS & INPUT ORCHESTRATION
     ========================================================================== */

  function bindEvents() {
    el.btnHeaderHome.addEventListener('click', (e) => {
      e.preventDefault();
      if (HOME_PAGE_URL && HOME_PAGE_URL !== '#') {
        window.location.href = HOME_PAGE_URL;
      } else {
        showScreen('menu');
        renderMenu();
      }
    });

    el.btnPlayGame.addEventListener('click', () => {
      loadPuzzle(state.todayDate, state.selectedDailyTier);
    });

    el.btnMenuVault.addEventListener('click', () => {
      renderVault();
      showScreen('vault');
    });

    el.btnMenuSettings.addEventListener('click', openSettingsModal);
    el.btnMenuHelp.addEventListener('click', openHowToPlay);
    el.btnGameHelp.addEventListener('click', openHowToPlay);

    el.btnUtilStats.addEventListener('click', openStatsModal);
    el.btnUtilShare.addEventListener('click', handleShareAction);
    el.btnUtilPlus.addEventListener('click', handlePlusAction);

    el.btnGameBack.addEventListener('click', () => {
      clearInterval(state.timerInterval);
      showScreen('menu');
      renderMenu();
    });

    el.btnVaultBack.addEventListener('click', () => {
      showScreen('menu');
      renderMenu();
    });

    el.activeClueTrigger.addEventListener('click', () => {
      state.direction = state.direction === 'across' ? 'down' : 'across';
      updateSelection();
    });

    el.btnCloseHelp.addEventListener('click', closeHowToPlay);
    el.panelHelpBackdrop.addEventListener('click', closeHowToPlay);

    el.optAnimOn.addEventListener('click', () => setBackgroundAnimation(true));
    el.optAnimOff.addEventListener('click', () => setBackgroundAnimation(false));

    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => closeModal(document.getElementById(b.dataset.close)));
    });

    el.btnRetryLoad.addEventListener('click', init);

    // On-screen tactile keyboard
    el.onscreenKeyboard.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      e.preventDefault();
      const key = btn.dataset.key;
      if (key === 'DIR') {
        state.direction = state.direction === 'across' ? 'down' : 'across';
        updateSelection();
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key) {
        handleInput(key);
      }
    });

    // Hardware keyboard
    window.addEventListener('keydown', (e) => {
      if (el.screenGame.classList.contains('hidden')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        state.direction = state.direction === 'across' ? 'down' : 'across';
        updateSelection();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.direction = 'across';
        advanceCursor(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.direction = 'across';
        advanceCursor(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.direction = 'down';
        advanceCursor(false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.direction = 'down';
        advanceCursor(true);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleInput(e.key);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();