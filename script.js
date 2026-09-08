class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playBlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playDelete() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.055);
  }

  playToggle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(660, this.ctx.currentTime + 0.025);
    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.065);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.145);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = this.ctx.currentTime + idx * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  }
}

const sound = new SoundController();

const GENERAL_DICTIONARY_CLUES = {
  "HEART": "The absolute center of the house, also known as the button",
  "EMBER": "A dying fire in the clubhouse hearth",
  "ABUSE": "Slamming your broom on the ice in frustration",
  "RESIN": "Sticky grip enhancer sometimes used on older broom handles",
  "TREND": "The evolution from hair brooms to synthetic pads",
  "START": "Pushing out from the hack to begin a delivery",
  "TOWER": "The elevated viewing area behind the sheets",
  "AWARE": "Paying close attention to the skip's broom placement",
  "REARS": "The back end of the rings (Back 12-foot)",
  "TRESS": "Hair that must be tied back to avoid falling on the ice",
  "BASES": "The rubber grips attached to the bottom of the hack",
  "ARENA": "A multi-sheet facility hosting a major bonspiel",
  "SEDAN": "Car packed with four teammates heading to a weekend bonspiel",
  "ENACT": "To formally implement a new sweeping rule",
  "SANTA": "Bringer of new curling shoes every December",
  "SHEER": "The steep, aggressive curl of a stone on keen ice",
  "HEAVE": "Throwing with peel weight to clear a crowded house",
  "EAVES": "Roof overhangs on a classic Scottish curling club",
  "EVENT": "A specific bracket or division in a bonspiel (e.g., A Event)",
  "RESTS": "When a stone stops perfectly on the tee line",
  "SCOTS": "The historical inventors and pioneers of curling",
  "CANOE": "Narrow boat, unrelated to curling unless playing on a frozen lake",
  "ONION": "Tear-inducing vegetable in the post-game clubhouse stew",
  "TOOTS": "Short celebratory horn blasts from the arena crowd",
  "SENSE": "A veteran skip's intuitive feel for the ice speed",
  "HACK": "The rubber foothold you push off from to deliver a stone",
  "SLAM": "A major Grand Slam of Curling championship",
  "AREA": "The Free Guard Zone, for example",
  "PALE": "The light color of the ice before the rings are painted",
  "MOST": "Winning an end by counting the highest number of stones",
  "ICED": "Froze over the arena floor to create the playing surface",
  "SPIN": "The rotation applied to the stone's handle upon release",
  "TONE": "The distinct acoustic hum of a granite rock sliding",
  "SKIP": "The team captain who calls the shots and strategy",
  "STONE": "The 44-pound polished granite playing piece",
  "ODOR": "The scent of arena ammonia or cold winter air",
  "UNIT": "A four-person curling team working as one",
  "RARE": "An elusive 'eight-ender' (perfect score in one frame)",
  "NOTE": "A quick strategic reminder jotted on a clipboard",
  "EYES": "Keeping these focused firmly on the skip's target broom",
  "TEES": "The intersections of the center line and the tee line",
  "DRAW": "A finesse shot designed to come to rest inside the house",
  "LINE": "The trajectory a stone takes toward the target",
  "HOPE": "Wishing a heavy draw will somehow bite the back 12-foot",
  "AMEN": "A grateful word when an opponent misses a wide-open hit",
  "PENN": "State (Pennsylvania) with a growing grassroots curling scene",
  "TONS": "The combined weight of all 16 stones used in an end",
  "LEAD": "The player who throws the first two stones for their team",
  "GRIP": "The rubber traction piece worn over a curling shoe",
  "SWAP": "Exchanging a slider for a gripper after throwing",
  "ROAR": "The distinct rumbling sound a stone makes moving across pebble",
  "HOLE": "A divot or imperfection in the ice surface",
  "OWNS": "Having total strategic control of the center line",
  "BONS": "The first four letters of a traditional curling tournament",
  "SWEEP": "To vigorously brush the ice ahead of a moving stone",
  "PEEL": "A heavy takeout shot designed to remove a guard and roll out",
  "SHEET": "The 150-foot stretch of ice where the game is played",
  "HOGLINE": "The thick line a stone must completely cross to remain in play",
  "HAMMER": "The massive strategic advantage of throwing the last stone",
  "TAKEOUT": "A shot thrown with heavy weight to remove an opponent's stone",
  "SWEEPER": "The player managing the stone's curl and distance with a brush",
  "BUTTON": "The absolute center of the target rings",
  "OUTTURN": "Rotation of the stone away from the thrower's body",
  "INTURNS": "Rotations of the stone towards the thrower's body",
  "BONUS": "Scoring two points when you only expected one",
  "BLANK": "An end where neither team scores, usually intentional",
  "PEBBLE": "Frozen water droplets sprayed on the ice to reduce friction",
  "SLIDER": "Teflon footwear piece that allows you to glide down the sheet"
};

const PUZZLE_DATA_SETS = [
  {
    id: "day-1",
    dayIndex: 0,
    theme: "Volume I: The Ice & Equipment",
    mini: {
      title: "Mini 1",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "H A C K #",
        "I C E D #",
        "T U R N S",
        "# R I N K",
        "# S E T S"
      ],
      clues: {
        across: {
          1: "The rubber block you push off from",
          5: "Prepared the sheet for play",
          6: "Out___ and In___ (handle rotations)",
          7: "A curling team, or the building they play in",
          8: "Groups of matched curling stones"
        },
        down: {
          1: "Takeout shot to remove an opponent's rock",
          2: "A sharp, angled hit on a stationary stone",
          3: "The central intersections in the house",
          4: "Weights measured in metric (abbr.)",
          6: "Number of ends in a standard abbreviated club game"
        }
      }
    },
    midi: {
      title: "Midi 1",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "P E E L # S K I P",
        "R I N G # H O U S E",
        "O V E R # O U T E R",
        "M I T T # E X T R A",
        "# # # D R A W # #",
        "# # B L A N K # #",
        "S T E A L # I C E S",
        "W E I G H T # T E E",
        "E N D S # S H O E S"
      ],
      clues: {
        across: {
          1: "Clear a guard completely out of play",
          5: "The captain calling the shots",
          9: "One of the painted circles",
          10: "The entire target area",
          11: "Throwing heavy: ___ the hogline",
          12: "The 12-foot edge of the rings",
          13: "Warm glove worn by sweepers",
          14: "An overtime end to break a tie",
          15: "A finesse shot to the button",
          17: "A scoreless end to retain the hammer",
          19: "Score a point without the last rock",
          22: "Chills the arena floor",
          24: "The momentum and speed of a throw",
          25: "The exact center point of the rings",
          26: "The eight frames of a standard match",
          27: "Specialized teflon and rubber footwear"
        },
        down: {
          1: "The big dance: The local curling ___",
          2: "Result of missing a wide open hit",
          3: "Tied score: ___ up",
          4: "Let it go! (Sweeping command)",
          5: "Where curling shoes go after a game",
          6: "Pushed out of the hack (past tense)",
          7: "It holds the stone's handle",
          8: "Spray ___ (applying water droplets)",
          16: "Brush vigorously",
          18: "What players do before releasing",
          19: "Teflon pieces for sliding",
          20: "Number of players on a standard team",
          21: "A heavy, aggressive takeout",
          23: "Signals from the skip"
        }
      }
    },
    full: {
      title: "Classic 1",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "S H E E T # B R O O M # I C E",
        "P E B B L E # U N I T # P E G",
        "A R E N A # T U R N # S O L O",
        "R I N K # S L I D E R # P A D",
        "E N D # S H O E # R I N G S #",
        "# # # H A C K # # # E X T R A",
        "S W E E P # S K I P # D R A W",
        "T E E # B L A N K # H O G # #",
        "O U T T U R N # I N T U R N S",
        "N I N E # G U A R D # C U R L",
        "E X I T S # # # A I M # # # #",
        "# P E E L S # H E A V Y # T O N",
        "B I T E R # S T E A L # M E N",
        "O W N S # W E I G H T # O U T",
        "W I N # S E C O N D # L E A D"
      ],
      clues: {
        across: {
          1: "The 150-foot stretch of playing ice",
          6: "Your primary sweeping tool",
          11: "The frozen playing surface",
          14: "Frozen droplets that reduce friction",
          16: "A cohesive four-person squad",
          17: "Anchor for the hack",
          18: "Multi-sheet championship facility",
          19: "The rotation applied to the handle",
          21: "Throwing practice stones alone",
          22: "A team, or the building they play in",
          23: "Teflon piece that enables the glide",
          25: "The synthetic fabric head of a brush",
          26: "One single frame of play",
          27: "It has a gripper on one foot",
          29: "The 4-foot, 8-foot, and 12-foot",
          31: "Rubber starting blocks",
          33: "Tie-breaker frame (___ end)",
          35: "Brush hard to carry the stone!",
          38: "The team's strategist",
          41: "Finesse shot meant to stop in the rings",
          43: "Intersection of center and tee lines",
          44: "Keep the score 0-0 on purpose",
          46: "The line a rock must fully cross",
          47: "Rotation away from the thrower's body",
          50: "Rotations toward the thrower's body",
          54: "Highest score possible in one end (mythical)",
          55: "Stone placed to block the button",
          57: "The bend in a stone's trajectory",
          58: "Rolls out of the rings",
          60: "Point the broom handle at the target",
          62: "Heavy hits to remove guards",
          64: "A stone thrown with too much speed",
          67: "100 points in darts, or 2,000 lbs",
          70: "Stone barely touching the outside ring",
          72: "Score without the last-rock advantage",
          74: "Brier competitor category",
          75: "Dominates the center line",
          76: "Pounds of force on a delivery",
          78: "Removed from play",
          79: "Secure the victory",
          80: "Player throwing stones 3 and 4",
          81: "Player throwing stones 1 and 2"
        },
        down: {
          1: "Alternative player on a 5-person roster",
          2: "The sound of heavy peeling action",
          3: "The unwritten rules of curling conduct",
          4: "The 12-foot outer ring edge",
          5: "A stone stopping just short of the rings",
          7: "A steep, angled raise",
          8: "A quick glance at the scoreboard",
          9: "The act of taking an opponent's rock out",
          10: "Curling's birthplace (abbr.)",
          11: "International Ice event (abbr.)",
          12: "Wood traditionally used for old broom handles",
          13: "Olympic curling medals",
          15: "Throwing motion out of the hack",
          20: "First name of legendary skip Howard",
          24: "Direction you want the rock to move",
          28: "Winter headwear for cold arenas",
          30: "Pushing out of the hack without a stone",
          32: "An angle-___ (hitting a rock into another)",
          34: "Tightly packed group of stones in the 4-foot",
          35: "The 44-pound granite rock",
          36: "What you apply to the handle",
          37: "Ten frames in the Brier",
          39: "Last rock advantage",
          40: "The inner circle of the house",
          42: "What a skip yells when a stone is light",
          45: "A line intersecting the tee",
          48: "The tournament bracket",
          49: "To bring a rock into the rings",
          51: "Footwear traction covers",
          52: "Sweeping with intensity",
          53: "Synthetic sweeping heads",
          56: "Moving ice out of the way",
          59: "Signals to the sweepers",
          61: "Sweeper's call for 'stop brushing!'",
          63: "Leaves the ice after a match",
          65: "Curling club bartender's stock",
          66: "Famous curling family name",
          68: "A perfect double takeout",
          69: "Slang for a stone that wrecks on a guard",
          71: "Two points scored",
          73: "Line of sight",
          77: "Take the game into extra ends"
        }
      }
    }
  },
  {
    id: "day-2",
    dayIndex: 1,
    theme: "Volume II: Tactics & Gameplay",
    mini: {
      title: "Mini 2",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "S W E E P",
        "W E I G H",
        "E N D E D",
        "# R O L L",
        "# T E E S"
      ],
      clues: {
        across: {
          1: "The most exhausting job on the team",
          6: "Speed and force of a delivery (abbr.)",
          7: "Shook hands and concluded the match",
          8: "Hit a stone and slide sideways",
          9: "Center intersections in the house"
        },
        down: {
          1: "Where curling stones are traditionally quarried (Scotland)",
          2: "A very heavy, fast throw",
          3: "Frames of play",
          4: "First name of curling legend Richardson",
          5: "What players do before tournaments (abbr.)"
        }
      }
    },
    midi: {
      title: "Midi 2",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "G U A R D # T A P",
        "U N D E R # O U T",
        "Y I E L D # P I N",
        "# T I E # H I T S",
        "B I T E R # P A D",
        "R O C K # S O F T",
        "O P E N # W E I P",
        "O V E R # I C E D",
        "M E E T S # G E T"
      ],
      clues: {
        across: {
          1: "A stone protecting the scoring area",
          6: "Bump a stone slightly forward",
          9: "Throwing too light: ___ throwing",
          10: "Rotation away from the body: ___-turn",
          11: "Give up the hammer",
          12: "The absolute center hole of the button",
          13: "Score requiring an extra end",
          14: "Takeout shots",
          16: "Stone just touching the outer 12-foot ring",
          18: "Fabric part of the broom head",
          19: "Another word for the granite stone",
          20: "Throwing with light, delicate weight",
          22: "A house with no guards: Wide ___",
          23: "Action of the brush on the ice",
          25: "Throwing too heavy: ___ the broom",
          26: "Prepared the playing surface with water",
          27: "Post-game handshakes: The team ___",
          28: "Acquire a point"
        },
        down: {
          1: "The fellow you're playing against",
          2: "One solid team",
          3: "Throwing an extra point",
          4: "Judge the ice speed",
          5: "Remove a stone completely",
          6: "The top level of curling competition",
          7: "Score without the hammer",
          8: "Pins used to measure stones",
          14: "The command to sweep forcefully",
          15: "Gliding footwear component",
          16: "The primary sweeping tool",
          17: "The path of the stone",
          18: "What the skip points at",
          20: "To scrub the ice",
          21: "Where the front end stands between shots",
          24: "Hogline violation (abbr.)"
        }
      }
    },
    full: {
      title: "Classic 2",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "H A M M E R # S P L I T # T I E",
        "O U T E R S # C O U N T # A I M",
        "G U A R D S # O U T S E # P A D",
        "L I N E # W E I G H T # S W I G",
        "I C E # P A C K S # T A P E S #",
        "N E W # O N C E # # # P E E L S",
        "E N D S # # T E E S # B O N E S",
        "# # # S T E A L S # H O U S E #",
        "S T O N E # S K I P # # R U N S",
        "W E I G H # # # P L A Y # O U T",
        "# E I G H T # H I T S # S T U B",
        "B R O S # E X T R A S # L O O K",
        "R I N G # V I C E S # C L E A N",
        "O V E N # E N D E D # I C I E R",
        "M E N S # N E R D S # S O F T S"
      ],
      clues: {
        across: {
          1: "The last rock advantage in an end",
          7: "Hitting a guard to send both stones into the rings",
          12: "Even score before an extra end",
          15: "Stones sitting on the 12-foot ring",
          16: "Score a point in the house",
          17: "Line up the delivery",
          18: "Stones placed defensively out front",
          19: "Deliveries that drift too wide",
          20: "The face of the broom",
          21: "The path the skip wants the stone to travel",
          22: "The speed and force of a delivery",
          24: "A quick drink between ends",
          25: "The playing surface",
          26: "Crowds the house with stones",
          28: "Measures for a biter",
          29: "Brand ___ teflon slider",
          30: "Sweeping ___ per throw",
          32: "Heavy hits to clear guards",
          34: "Periods of a curling match",
          36: "Center intersections in the rings",
          38: "The handles of old curling brooms",
          40: "Scoring without the hammer (plural)",
          43: "The 12-foot, 8-foot, 4-foot, and button",
          45: "The 44-pound granite playing piece",
          47: "The team captain",
          49: "Scores multiple points",
          51: "Assess the speed of the ice",
          53: "Call a strategic game",
          55: "Rotation away from the body",
          57: "The mythical perfect end (___-ender)",
          59: "Takeout shots",
          61: "Catch an edge and fall",
          63: "Teammates in a men's league",
          65: "Frames beyond the regulation 8 or 10",
          67: "Analyze the angles",
          68: "One of the concentric circles",
          69: "The players throwing third",
          71: "Sweep lightly just to keep the path clear",
          73: "Where the post-game meat pies are warmed",
          74: "Finished the bonspiel",
          75: "Faster, keener ice conditions",
          76: "Male curling division",
          77: "Strategy geeks obsessing over angles",
          78: "Finesse draws into the rings"
        },
        down: {
          1: "The thick blue line a rock must cross",
          2: "The act of lining up a shot",
          3: "Friction-reducing water droplets",
          4: "Just barely touching the rings",
          5: "Frames of a match",
          6: "Stones that count for score",
          7: "Evaluate the opponent's strategy",
          8: "A quick tap back",
          9: "Type of delivery release",
          10: "Inside turns",
          11: "The center intersection",
          12: "Tapping a stone back",
          13: "A major curling competition",
          14: "Sides of the sheet",
          23: "Frozen surface",
          25: "What sweepers do to affect curl",
          27: "Take a rock out of play",
          31: "Tournament events",
          33: "A stone protecting the button",
          35: "Slide smoothly out of the hack",
          37: "The skip's target marker",
          39: "Score a point without hammer",
          41: "The captain's assistant (Third)",
          42: "The 150-foot playing area",
          44: "Rotation applied to the stone",
          45: "The main sweeping tool",
          46: "Make it curve more!",
          48: "Footwear grippers",
          50: "A fast, aggressive hit",
          52: "Throw heavy takeout weight",
          54: "To clear the ice of guards",
          56: "Tie-breaker frames",
          58: "Slider foot technique",
          60: "What a skip yells to tell sweepers to stop",
          62: "Target circles",
          63: "Cleaning implement for the pebble",
          64: "Opposing team",
          66: "A light brush",
          70: "The inner 4-foot ring",
          72: "Abbreviation for standard bonspiel ends"
        }
      }
    }
  },
  {
    id: "day-3",
    dayIndex: 2,
    theme: "Volume III: The Sweepers",
    mini: {
      title: "Mini 3",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "# # B # #",
        "# S O B #",
        "S H A R P",
        "# E R A #",
        "# # D # #"
      ],
      clues: {
        across: {
          1: "Let out a cry after a devastating extra-end loss",
          2: "A fast, aggressive curl on keen ice",
          3: "The modern ___ of curling (post-hair brooms)"
        },
        down: {
          1: "Pronoun for the skip directing the house",
          2: "The scoreboard hanging at the end of the sheet",
          3: "Sports ___ (athletic wear under the curling jacket)"
        }
      }
    },
    midi: {
      title: "Midi 3",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "S W E E P # P E G",
        "P E A C E # A L E",
        "I N N E R # D I P",
        "N E R V E # S O N",
        "S T S # S T O N E",
        "# # # S H O E S #",
        "H A C K # U R G E",
        "I R O N # R E E D",
        "T E N T # S E T S"
      ],
      clues: {
        across: {
          1: "The most physically demanding job on the ice",
          5: "Anchor piece hammered into the hack",
          9: "Post-game handshake atmosphere",
          10: "Beverage commonly shared by the winning team",
          11: "The 4-foot ring, relative to the 8-foot",
          12: "Lower the body slightly in the hack before pushing out",
          13: "What it takes to throw a quiet draw against three counters",
          14: "Generational teammate (e.g., passing the broom from father to ___)",
          15: "Abbreviation for standard bonspiel standings",
          16: "The 44-pound polished granite playing piece",
          17: "Specialized teflon-soled footwear",
          19: "The foothold you push off from",
          22: "Desperately yell at the sweepers to carry the rock",
          24: "Historic material used before granite became standard",
          25: "Grass growing outside the summer curling club",
          26: "Temporary shelter set up for outdoor pond bonspiels",
          27: "Matching groups of 8 stones for a team"
        },
        down: {
          1: "The rotational twists applied to the handle",
          2: "Travel the stone back and forth before releasing",
          3: "Enter the rings",
          4: "Electronic device tracking hogline violations",
          5: "Friction-reducing water droplets applied to the ice",
          6: "Name for the oldest curling championship",
          7: "Goes completely out of bounds",
          8: "Prefix for gender-specific curling leagues",
          16: "Brush fiercely",
          18: "What players do before releasing the handle",
          19: "An aggressive takeout shot",
          20: "Measure the speed of the ice",
          21: "A protective block",
          23: "Signals from the skip to the sweepers"
        }
      }
    },
    full: {
      title: "Classic 3",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "S C O R E # S H O E S # T I E",
        "P O U N D # P O I N T # W I N",
        "I N T R O # I N N E R # O N E",
        "N E T # T R A C K # E X I T S",
        "### S P L I T # B R O O M S",
        "G U A R D # C L E A N ####",
        "L I N E # T A R G E T # H O G",
        "A I M # B U T T O N # P E G S",
        "D I P # P E B B L E # A L E S",
        "#### T I E # H E A V Y ##",
        "W E I G H T S # E N D S ###",
        "A R E A # S L I D E R # I C E",
        "W I N # P I N S # C L E A N S",
        "C U P # O V E N # S C O R E S",
        "N E T # T E N T S # S T E P S"
      ],
      clues: {
        across: {
          1: "Tally the points at the conclusion of an end",
          6: "Specialized teflon and rubber footwear",
          11: "Even score requiring an extra frame",
          14: "Throw a heavy takeout with maximum force",
          15: "Single unit of scoring",
          16: "Secure the victory",
          17: "The pre-game handshake and coin toss",
          18: "The 4-foot ring, close to the button",
          19: "Number of points scored for a simple biter",
          20: "The final score differential",
          22: "Follow the stone's trajectory down the sheet",
          24: "Leaves the hack smoothly",
          26: "Hitting a guard to angle both stones into the house",
          27: "Synthetic sweeping tools",
          30: "A defensive stone protecting the scoring area",
          32: "Sweep lightly just to keep the path clear of debris",
          33: "The path the skip wants the stone to travel",
          35: "The four concentric rings",
          37: "The thick line a rock must completely cross",
          40: "Line up the delivery from the hack",
          41: "The absolute center of the rings",
          43: "Small anchors holding the hack in place",
          44: "Lower the hips slightly before delivery",
          45: "Frozen water droplets sprayed to reduce friction",
          47: "Post-game beverages in the clubhouse",
          49: "Score requiring an extra end",
          51: "A stone thrown with too much speed",
          53: "The momentum and force behind deliveries",
          56: "The eight or ten frames of a match",
          58: "The Free Guard Zone, for example",
          61: "Teflon piece that enables the player to glide",
          65: "The chilled playing surface",
          66: "Take the championship",
          67: "Measuring devices for stones too close to call",
          68: "Removes a guard from play completely",
          69: "Championship trophy",
          70: "Where the post-game meat pies are kept warm",
          71: "Achieves multiple points",
          72: "The final tally on the scoreboard",
          73: "Temporary outdoor structures for pond bonspiels",
          74: "Walks carefully down the sheet"
        },
        down: {
          1: "The rotational twists applied to the handle",
          2: "Travel the stone back and forth before releasing",
          3: "Enter the rings",
          4: "Electronic device tracking hogline violations",
          5: "Friction-reducing water droplets applied to the ice",
          6: "Name for the oldest curling championship",
          7: "Goes completely out of bounds",
          8: "Prefix for gender-specific curling leagues",
          9: "Line up the delivery",
          10: "Stones placed defensively out front",
          11: "Deliveries that drift too wide",
          12: "The face of the broom",
          13: "The path the skip wants the stone to travel",
          21: "A quick drink between ends",
          23: "The playing surface",
          25: "Crowds the house with stones",
          28: "Brand new teflon slider",
          29: "Sweeping motions per throw",
          31: "Heavy hits to clear guards",
          34: "Periods of a curling match",
          36: "Center intersections in the rings",
          38: "The handles of old curling brooms",
          39: "Scoring without the hammer (plural)",
          42: "The 12-foot, 8-foot, 4-foot, and button",
          46: "The 44-pound granite playing piece",
          48: "The team captain",
          50: "Scores multiple points",
          52: "Assess the speed of the ice",
          54: "Call a strategic game",
          55: "Rotation away from the body",
          57: "The mythical perfect end",
          59: "Takeout shots",
          60: "Catch an edge and fall",
          62: "Teammates in a men's league",
          63: "Frames beyond the regulation",
          64: "Analyze the angles"
        }
      }
    }
  },
  {
    id: "day-4",
    dayIndex: 3,
    theme: "Volume IV: The House",
    mini: {
      title: "Mini 4",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "# # H # #",
        "# T E A #",
        "S H A V E",
        "# E V E #",
        "# # Y # #"
      ],
      clues: {
        across: {
          1: "Warm drink enjoyed at the curling club bar",
          2: "Just barely graze a guard stone",
          3: "The night before a major weekend bonspiel"
        },
        down: {
          1: "___ Roaring Game (Curling's historic nickname)",
          2: "A stone thrown with entirely too much force",
          3: "The street where the local curling club is located (abbr.)"
        }
      }
    },
    midi: {
      title: "Midi 4",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "H A C K # S L I P",
        "P L A Y # C O V E",
        "R I N G # O V E N",
        "D E E P # P E N T",
        "# # # D R A W # #",
        "B R O O M # I C E",
        "R O U T E # C O N",
        "A N G L E # E N D",
        "G E A R S # S E T"
      ],
      clues: {
        across: {
          1: "The rubber block embedded in the ice",
          5: "Catch an edge and fall gracefully",
          9: "Call the strategic game from the house",
          10: "The sheltered area where the skip stands",
          11: "One of the concentric circles",
          12: "Where the post-game meals are kept warm",
          13: "A draw shot that sails to the back 12-foot",
          14: "Frustration built up after missing an open hit",
          15: "Finesse shot meant to stop in the rings",
          17: "The primary sweeping implement",
          20: "The frozen playing surface",
          21: "The specific path a stone travels",
          22: "A strategic trick or fake-out by the skip",
          23: "Geometry required for a double takeout",
          24: "One single frame of play",
          25: "Equipment bags and extra sliders",
          26: "A group of matched granite stones"
        },
        down: {
          1: "An aggressive, fast takeout",
          2: "Name of a fellow curler",
          3: "Traffic cone used in junior practice drills",
          4: "Call letters of a radio station broadcasting the Brier",
          5: "A messy, uncoordinated sweep",
          6: "Zero points on the scoreboard",
          7: "Name of the club manager",
          8: "Trapped behind a wall of guards",
          15: "Show off after a great shot",
          16: "Scottish word for an ice gutter",
          17: "Horn sound celebrating a win",
          18: "Sign on the club door (Out To Lunch Return)",
          19: "The championship trophy",
          20: "Engineering group maintaining the arena plant",
          21: "News network covering the Olympics",
          22: "When the match concludes"
        }
      }
    },
    full: {
      title: "Classic 4",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "T A R G E T # B A C K # C U P",
        "P L A Y E R # C O L D # W I N",
        "S C O R E S # H A L O # T I E",
        "E N D # B R U S H # S W E E P",
        "### P I N S # R O L L ###",
        "G L I D E R # T R A V E L ##",
        "L I N E # S T R O K E # H O G",
        "A I M # C E N T E R # P E G S",
        "D I P # F A U L T S # A L E S",
        "#### W E T # T U R N S ##",
        "V I C T O R Y # W I N S ###",
        "H A C K # G R A V E L # P A D",
        "B I T # S P O T # B O A R D S",
        "P R O # T E A M # A R E N A S",
        "T I E # E V E N T # M A T C H"
      ],
      clues: {
        across: {
          1: "The concentric circles you aim for",
          7: "The area behind the hack",
          11: "The championship trophy",
          14: "An athlete on the ice",
          15: "The temperature inside the arena",
          16: "Take the victory",
          17: "Points tallied on the board",
          18: "The outer white ring (slang)",
          19: "Even score before the extra end",
          20: "A single frame in a match",
          21: "The synthetic sweeping head",
          22: "Vigorous action to keep the rock moving",
          24: "Measuring tools for biters",
          26: "Hitting a stone and moving sideways",
          28: "The teflon shoe that allows movement",
          31: "The distance a rock slides",
          33: "The path of the delivery",
          34: "The sweeping motion",
          36: "The thick line a rock must cross",
          37: "Line up the broom",
          38: "The absolute middle of the rings",
          39: "Anchors for the hack",
          40: "Lower the hips in the hack",
          41: "Hogline violations",
          42: "Post-game drinks",
          43: "Ice condition with too much moisture",
          44: "Rotations applied to the stone",
          46: "Winning the bonspiel",
          49: "Takes the game",
          50: "The rubber starting block",
          51: "Base layer beneath the concrete arena floor",
          53: "Sweeping fabric",
          54: "Just barely touching the rings",
          55: "The exact location the skip wants the stone",
          56: "The score displays",
          57: "A top-level touring curler",
          58: "A four-person squad",
          59: "Multi-sheet curling facilities",
          60: "Score requiring overtime",
          61: "A specific bracket in a bonspiel",
          62: "A regulation game"
        },
        down: {
          1: "The thick blue line a rock must cross",
          2: "The act of lining up a shot",
          3: "Friction-reducing water droplets",
          4: "Just barely touching the rings",
          5: "Frames of a match",
          6: "Stones that count for score",
          7: "Evaluate the opponent's strategy",
          8: "A quick tap back",
          9: "Type of delivery release",
          10: "Inside turns",
          11: "The center intersection",
          12: "Tapping a stone back",
          13: "A major curling competition",
          23: "Frozen surface",
          25: "What sweepers do to affect curl",
          27: "Take a rock out of play",
          29: "Tournament events",
          30: "A stone protecting the button",
          32: "Slide smoothly out of the hack",
          35: "The skip's target marker",
          45: "The main sweeping tool",
          47: "Make it curve more!",
          48: "Footwear grippers",
          52: "A fast, aggressive hit"
        }
      }
    }
  },
  {
    id: "day-5",
    dayIndex: 4,
    theme: "Volume V: The Bonspiel",
    mini: {
      title: "Mini 5",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "# # T # #",
        "# S H E #",
        "S T R A P",
        "# E E R #",
        "# # E # #"
      ],
      clues: {
        across: {
          1: "Pronoun for the skip calling the line",
          2: "To tightly secure a pull-on slider over a shoe",
          3: "Poetic word for 'always' (heard in classic Scottish curling toasts)"
        },
        down: {
          1: "Abbreviation for 'Sainte' (as in Sainte-Foy Curling Club)",
          2: "Counting ___ points in a massive end",
          3: "Keep an ___ out for the skip's sweeping commands"
        }
      }
    },
    midi: {
      title: "Midi 5",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "S W E E P # P A D",
        "P L A N S # A L E",
        "I N N E R # C O N",
        "N E R V E # E N D",
        "# # # E X I T # #",
        "S T O N E # T I E",
        "H O U S E # I O N",
        "O U T E R # O N E",
        "W E N T S # N E T"
      ],
      clues: {
        across: {
          1: "Brush the pebble vigorously",
          5: "Synthetic fabric on the broom head",
          9: "Strategic diagrams drawn by the skip",
          10: "Draft beverage served in the warm room",
          11: "The 4-foot ring, relative to the 12-foot",
          12: "Tricking the opponent into a difficult shot",
          13: "Mental fortitude required for a final draw",
          14: "A single frame of play",
          15: "Roll out of the rings entirely",
          16: "The 44-pound granite playing piece",
          18: "Score resulting in an extra end",
          19: "The entire scoring area",
          21: "Chemical particle (unrelated, just for the crossword!)",
          22: "The 12-foot ring",
          23: "Scoring a single point",
          24: "Travelled down the ice",
          25: "The webbing dividing sheets in some arenas"
        },
        down: {
          1: "The rotation applied to the handle",
          2: "The straight line trajectory of a throw",
          3: "The central intersections in the house",
          4: "Weights measured in metric (abbr.)",
          5: "Where the front end stands between shots",
          6: "First player to throw on a team",
          7: "Throw with light, delicate weight",
          8: "Score without the last-rock advantage",
          16: "Vigorous sweeping effort",
          17: "The path the skip wants the stone to travel",
          18: "The speed and force of a delivery",
          20: "Number of ends in a standard club game"
        }
      }
    },
    full: {
      title: "Classic 5",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "B O N S P I E L # D R A W # A",
        "P # R I N K # B R U S H E R #",
        "L # L I N E # T A R G E T # #",
        "S C O R E # C E N T E R # I N",
        "# P I N S # P A D # S W E E P",
        "### C A L L # T R A V E L #",
        "S H O T # B E N D # G L I D E",
        "I N W A R D S # O U T W A R D",
        "H O G # P E E L S # S C O R E",
        "## B R U S H # B A C K ###",
        "R I N K S # I C E # B O O T #",
        "G U A R D S # S W E E P # U P",
        "T I E # S C O R E # A R E N A",
        "C U P # T R A C K # E V E N T",
        "W I N # M A T C H # G A M E S"
      ],
      clues: {
        across: {
          1: "A traditional curling tournament",
          9: "A finesse shot to the rings",
          11: "A four-person team",
          13: "Player vigorously sweeping the ice",
          15: "The trajectory of the stone",
          16: "The rings you aim for",
          17: "Tally the points",
          19: "The button",
          21: "Stones sitting ___ the house",
          23: "Measuring devices",
          25: "The sweeping fabric",
          26: "Brush the pebble!",
          28: "The skip's vocal command",
          29: "Slide down the ice",
          31: "An attempted delivery",
          33: "The curl of the stone",
          35: "Slide smoothly out of the hack",
          37: "Rotations toward the body",
          39: "Rotation away from the body",
          40: "The line a rock must cross",
          42: "Heavy takeout shots",
          44: "Points on the board",
          45: "The sweeping tool",
          47: "Area behind the hack",
          49: "Multiple curling teams",
          51: "The frozen surface",
          52: "Footwear with a gripper",
          54: "Defensive stones",
          57: "Vigorous brushing action",
          59: "Winning the game: ___ by two",
          60: "Even score",
          61: "The final tally",
          62: "Multi-sheet facility",
          63: "Championship trophy",
          64: "Follow the stone's path",
          65: "A division in a bonspiel",
          66: "Take the victory",
          67: "A regulation 8-end contest",
          68: "Matches played in a tournament"
        },
        down: {
          1: "The thick blue line a rock must cross",
          2: "The act of lining up a shot",
          3: "Friction-reducing water droplets",
          4: "Just barely touching the rings",
          5: "Frames of a match",
          6: "Stones that count for score",
          7: "Evaluate the opponent's strategy",
          8: "A quick tap back",
          10: "Inside turns",
          12: "The center intersection",
          14: "Tapping a stone back",
          18: "A major curling competition",
          20: "Sides of the sheet",
          22: "Frozen surface",
          24: "What sweepers do to affect curl",
          27: "Take a rock out of play",
          30: "Tournament events",
          32: "A stone protecting the button",
          34: "Slide smoothly out of the hack",
          36: "The skip's target marker",
          38: "Score a point without hammer",
          41: "The captain's assistant (Third)",
          43: "The 150-foot playing area",
          46: "Rotation applied to the stone",
          48: "The main sweeping tool",
          50: "Make it curve more!",
          53: "Footwear grippers",
          55: "A fast, aggressive hit",
          56: "Throw heavy takeout weight",
          58: "To clear the ice of guards"
        }
      }
    }
  }
];

class TimeGatedManager {
  constructor() {
    this.storageKey = 'daily_crossword_save_state_v2';
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Unable to read localStorage', e);
    }
    return {
      completed: {},
      savedGrids: {},
      savedTimes: {},
      best_mini: null,
      best_midi: null,
      best_full: null,
      soundEnabled: true,
      streak: 0,
      lastActiveDateStr: null
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  getTodayDayNumber() {
    const epoch = new Date(2025, 0, 1).getTime();
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayDiff = Math.max(0, Math.floor((todayMidnight - epoch) / (1000 * 60 * 60 * 24)));
    return dayDiff + 1;
  }

  getDateForDay(dayNumber) {
    const epoch = new Date(2025, 0, 1).getTime();
    const time = epoch + (dayNumber - 1) * (1000 * 60 * 60 * 24);
    return new Date(time);
  }

  getPuzzleForDay(dayNumber) {
    const count = PUZZLE_DATA_SETS.length;
    if (count === 0) return null;
    const rawIndex = (dayNumber - 1) % count;
    const template = PUZZLE_DATA_SETS[rawIndex];

    return {
      dayNumber,
      rawIndex,
      theme: template.theme,
      date: this.getDateForDay(dayNumber),
      mini: {
        ...template.mini,
        type: 'mini',
        title: `Mini #${dayNumber} (5×5)`
      },
      midi: {
        ...template.midi,
        type: 'midi',
        title: `Midi #${dayNumber} (9×9)`
      },
      full: {
        ...template.full,
        type: 'full',
        title: `Classic #${dayNumber} (15×15)`
      }
    };
  }

  getVaultPuzzles() {
    const today = this.getTodayDayNumber();
    const list = [];
    const minDay = Math.max(1, today - 60);
    for (let d = today - 1; d >= minDay; d--) {
      list.push(this.getPuzzleForDay(d));
    }
    return list;
  }

  markCompleted(dayNumber, type, seconds) {
    const key = `${dayNumber}_${type}`;
    this.state.completed[key] = true;

    const timeKey = `best_${type}`;
    if (!this.state[timeKey] || seconds < this.state[timeKey]) {
      this.state[timeKey] = seconds;
    }

    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (this.state.lastActiveDateStr === todayStr) {
      // already recorded today
    } else if (this.state.lastActiveDateStr === yesterdayStr) {
      this.state.streak = (this.state.streak || 0) + 1;
      this.state.lastActiveDateStr = todayStr;
    } else {
      this.state.streak = 1;
      this.state.lastActiveDateStr = todayStr;
    }

    this.saveState();
  }

  isCompleted(dayNumber, type) {
    const key = `${dayNumber}_${type}`;
    return !!this.state.completed[key];
  }

  getTotalSolved() {
    return Object.keys(this.state.completed).filter(k => this.state.completed[k]).length;
  }

  getBestTime(type) {
    const val = this.state[`best_${type}`];
    if (!val) return '--:--';
    const m = Math.floor(val / 60).toString().padStart(2, '0');
    const s = (val % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

const timeGate = new TimeGatedManager();

class CrosswordEngine {
  constructor() {
    this.activeDayNumber = 1;
    this.activeType = 'mini';
    this.activePuzzle = null;
    this.cells = [];
    this.clues = { across: {}, down: {} };
    this.activeCell = { r: 0, c: 0 };
    this.direction = 'ACROSS';
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.gridBuilt = false;
  }

  loadPuzzle(dayNumber, type) {
    const bundle = timeGate.getPuzzleForDay(dayNumber);
    if (!bundle || !bundle[type]) return false;

    this.activeDayNumber = dayNumber;
    this.activeType = type;
    this.activePuzzle = bundle[type];
    this.clues = this.activePuzzle.clues || { across: {}, down: {} };

    this.buildGridMatrix();
    this.restoreProgress();
    this.startTimer();
    this.gridBuilt = false;
    this.render();
    return true;
  }

  buildGridMatrix() {
    const { rows, cols, grid } = this.activePuzzle;
    this.cells = [];

    for (let r = 0; r < rows; r++) {
      this.cells[r] = [];
      const rowStr = grid[r] || '';
      for (let c = 0; c < cols; c++) {
        const char = rowStr[c] || '#';
        const isBlack = (char === '#' || char === '.');
        this.cells[r][c] = {
          r,
          c,
          solution: isBlack ? '#' : char.toUpperCase(),
          userLetter: '',
          isBlack,
          number: null,
          acrossClueNum: null,
          downClueNum: null
        };
      }
    }

    let currentNumber = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.cells[r][c];
        if (cell.isBlack) continue;

        const startsAcross = (c === 0 || this.cells[r][c - 1].isBlack) &&
                             (c + 1 < cols && !this.cells[r][c + 1].isBlack);
        const startsDown = (r === 0 || this.cells[r - 1][c].isBlack) &&
                           (r + 1 < rows && !this.cells[r + 1][c].isBlack);

        if (startsAcross || startsDown) {
          cell.number = currentNumber++;
        }
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.cells[r][c];
        if (cell.isBlack) continue;

        let leftCol = c;
        while (leftCol > 0 && !this.cells[r][leftCol - 1].isBlack) {
          leftCol--;
        }
        if (this.cells[r][leftCol].number) {
          cell.acrossClueNum = this.cells[r][leftCol].number;
        }

        let topRow = r;
        while (topRow > 0 && !this.cells[topRow - 1][c].isBlack) {
          topRow--;
        }
        if (this.cells[topRow][c].number) {
          cell.downClueNum = this.cells[topRow][c].number;
        }
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!this.cells[r][c].isBlack) {
          this.activeCell = { r, c };
          this.direction = 'ACROSS';
          return;
        }
      }
    }
  }

  restoreProgress() {
    const key = `${this.activeDayNumber}_${this.activeType}`;
    const saved = timeGate.state.savedGrids[key];
    const savedTime = timeGate.state.savedTimes[key];

    this.elapsedSeconds = savedTime || 0;

    if (Array.isArray(saved)) {
      let idx = 0;
      for (let r = 0; r < this.activePuzzle.rows; r++) {
        for (let c = 0; c < this.activePuzzle.cols; c++) {
          if (!this.cells[r][c].isBlack && saved[idx]) {
            this.cells[r][c].userLetter = saved[idx];
          }
          idx++;
        }
      }
    }
  }

  saveProgress() {
    const key = `${this.activeDayNumber}_${this.activeType}`;
    const flat = [];
    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        flat.push(this.cells[r][c].userLetter || '');
      }
    }
    timeGate.state.savedGrids[key] = flat;
    timeGate.state.savedTimes[key] = this.elapsedSeconds;
    timeGate.saveState();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    const timerElem = document.getElementById('game-timer');
    const update = () => {
      const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
      const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
      if (timerElem) timerElem.textContent = `${mins}:${secs}`;
    };
    update();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      update();
      if (this.elapsedSeconds % 5 === 0) {
        this.saveProgress();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    this.saveProgress();
  }

  selectCell(r, c) {
    if (this.cells[r][c].isBlack) return;

    if (this.activeCell.r === r && this.activeCell.c === c) {
      this.toggleDirection();
    } else {
      this.activeCell = { r, c };
      const target = this.cells[r][c];
      if (this.direction === 'ACROSS' && !target.acrossClueNum && target.downClueNum) {
        this.direction = 'DOWN';
      } else if (this.direction === 'DOWN' && !target.downClueNum && target.acrossClueNum) {
        this.direction = 'ACROSS';
      }
      sound.playBlip();
      this.render();
    }
  }

  toggleDirection() {
    const cur = this.cells[this.activeCell.r][this.activeCell.c];
    if (this.direction === 'ACROSS') {
      if (cur.downClueNum) this.direction = 'DOWN';
    } else {
      if (cur.acrossClueNum) this.direction = 'ACROSS';
    }
    sound.playToggle();
    this.render();
  }

  getActiveClue() {
    const cell = this.cells[this.activeCell.r][this.activeCell.c];
    if (!cell || cell.isBlack) return { num: '', dir: this.direction, text: 'Select any square...' };

    let num = (this.direction === 'ACROSS') ? cell.acrossClueNum : cell.downClueNum;
    if (!num) {
      this.direction = (this.direction === 'ACROSS') ? 'DOWN' : 'ACROSS';
      num = (this.direction === 'ACROSS') ? cell.acrossClueNum : cell.downClueNum;
    }

    const dirKey = this.direction.toLowerCase();
    let text = (this.clues[dirKey] && this.clues[dirKey][num]) ? this.clues[dirKey][num] : null;

    if (!text) {
      let word = '';
      if (this.direction === 'ACROSS') {
        const r = this.activeCell.r;
        let c = 0;
        while (c < this.activePuzzle.cols) {
          if (this.cells[r][c].acrossClueNum === num) {
            word += this.cells[r][c].solution;
          }
          c++;
        }
      } else {
        const c = this.activeCell.c;
        let r = 0;
        while (r < this.activePuzzle.rows) {
          if (this.cells[r][c].downClueNum === num) {
            word += this.cells[r][c].solution;
          }
          r++;
        }
      }
      text = GENERAL_DICTIONARY_CLUES[word] || `Clue for entry "${word}" (${word.length} letters)`;
    }

    return {
      num: num ? `${num}${this.direction[0]}` : '',
      dir: this.direction,
      text
    };
  }

  inputLetter(letter) {
    const { r, c } = this.activeCell;
    const cell = this.cells[r][c];
    if (cell.isBlack) return;

    cell.userLetter = letter.toUpperCase();
    sound.playBlip();
    this.saveProgress();

    this.stepCursor(1);
    this.render();
    this.checkAutoCompletion();
  }

  deleteLetter() {
    const { r, c } = this.activeCell;
    const cell = this.cells[r][c];

    if (cell.userLetter !== '') {
      cell.userLetter = '';
      sound.playDelete();
    } else {
      this.stepCursor(-1);
      const prev = this.cells[this.activeCell.r][this.activeCell.c];
      if (!prev.isBlack) {
        prev.userLetter = '';
        sound.playDelete();
      }
    }
    this.saveProgress();
    this.render();
  }

  stepCursor(delta) {
    const { rows, cols } = this.activePuzzle;
    let { r, c } = this.activeCell;

    if (this.direction === 'ACROSS') {
      let nextC = c + delta;
      while (nextC >= 0 && nextC < cols) {
        if (!this.cells[r][nextC].isBlack) {
          this.activeCell = { r, c: nextC };
          return;
        }
        nextC += delta;
      }
    } else {
      let nextR = r + delta;
      while (nextR >= 0 && nextR < rows) {
        if (!this.cells[nextR][c].isBlack) {
          this.activeCell = { r: nextR, c };
          return;
        }
        nextR += delta;
      }
    }
  }

  nextClue() {
    sound.playToggle();
    const activeNum = (this.direction === 'ACROSS')
      ? this.cells[this.activeCell.r][this.activeCell.c].acrossClueNum
      : this.cells[this.activeCell.r][this.activeCell.c].downClueNum;

    const clueNums = new Set();
    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isBlack) {
          const n = (this.direction === 'ACROSS') ? cell.acrossClueNum : cell.downClueNum;
          if (n) clueNums.add(n);
        }
      }
    }

    const numbers = Array.from(clueNums).sort((a, b) => a - b);
    if (numbers.length === 0) return;

    const currIdx = numbers.indexOf(Number(activeNum));
    const nextIdx = (currIdx + 1) % numbers.length;
    const targetNum = numbers[nextIdx];

    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isBlack && cell.number === targetNum) {
          this.activeCell = { r, c };
          this.render();
          return;
        }
      }
    }
  }

  prevClue() {
    sound.playToggle();
    const activeNum = (this.direction === 'ACROSS')
      ? this.cells[this.activeCell.r][this.activeCell.c].acrossClueNum
      : this.cells[this.activeCell.r][this.activeCell.c].downClueNum;

    const clueNums = new Set();
    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isBlack) {
          const n = (this.direction === 'ACROSS') ? cell.acrossClueNum : cell.downClueNum;
          if (n) clueNums.add(n);
        }
      }
    }

    const numbers = Array.from(clueNums).sort((a, b) => a - b);
    if (numbers.length === 0) return;

    const currIdx = numbers.indexOf(Number(activeNum));
    const prevIdx = (currIdx - 1 + numbers.length) % numbers.length;
    const targetNum = numbers[prevIdx];

    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isBlack && cell.number === targetNum) {
          this.activeCell = { r, c };
          this.render();
          return;
        }
      }
    }
  }

  checkCurrentWord() {
    const { r, c } = this.activeCell;
    const activeCell = this.cells[r][c];
    if (activeCell.isBlack) return;

    const targetNum = (this.direction === 'ACROSS') ? activeCell.acrossClueNum : activeCell.downClueNum;
    let hasError = false;

    for (let row = 0; row < this.activePuzzle.rows; row++) {
      for (let col = 0; col < this.activePuzzle.cols; col++) {
        const cell = this.cells[row][col];
        if (cell.isBlack) continue;
        const inWord = (this.direction === 'ACROSS')
          ? cell.acrossClueNum === targetNum
          : cell.downClueNum === targetNum;

        if (inWord) {
          const domCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          if (cell.userLetter && cell.userLetter !== cell.solution) {
            hasError = true;
            if (domCell) domCell.classList.add('cell-error');
          }
        }
      }
    }

    if (hasError) {
      sound.playError();
      setTimeout(() => {
        document.querySelectorAll('.cell-error').forEach(el => el.classList.remove('cell-error'));
      }, 700);
    } else {
      sound.playBlip();
    }
  }

  revealCurrentWord() {
    const { r, c } = this.activeCell;
    const activeCell = this.cells[r][c];
    if (activeCell.isBlack) return;

    const targetNum = (this.direction === 'ACROSS') ? activeCell.acrossClueNum : activeCell.downClueNum;
    for (let row = 0; row < this.activePuzzle.rows; row++) {
      for (let col = 0; col < this.activePuzzle.cols; col++) {
        const cell = this.cells[row][col];
        if (cell.isBlack) continue;
        const inWord = (this.direction === 'ACROSS')
          ? cell.acrossClueNum === targetNum
          : cell.downClueNum === targetNum;

        if (inWord) {
          cell.userLetter = cell.solution;
        }
      }
    }
    sound.playBlip();
    this.saveProgress();
    this.render();
    this.checkAutoCompletion();
  }

  checkAutoCompletion() {
    let filled = 0;
    let total = 0;
    let allCorrect = true;

    for (let r = 0; r < this.activePuzzle.rows; r++) {
      for (let c = 0; c < this.activePuzzle.cols; c++) {
        const cell = this.cells[r][c];
        if (!cell.isBlack) {
          total++;
          if (cell.userLetter !== '') filled++;
          if (cell.userLetter !== cell.solution) allCorrect = false;
        }
      }
    }

    if (filled === total && allCorrect) {
      this.handleVictory();
    }
  }

  handleVictory() {
    this.stopTimer();
    timeGate.markCompleted(this.activeDayNumber, this.activeType, this.elapsedSeconds);
    sound.playWin();

    const modal = document.getElementById('modal-victory');
    const tierLabel = document.getElementById('victory-tier-label');
    const timeLabel = document.getElementById('victory-time');

    const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');

    if (tierLabel) tierLabel.textContent = `${this.activePuzzle.title} Solved!`;
    if (timeLabel) timeLabel.textContent = `${mins}:${secs}`;
    if (modal) modal.classList.remove('hidden');

    launchConfetti();
  }

  render() {
    const container = document.getElementById('crossword-grid-container');
    if (!container || !this.activePuzzle) return;

    const { rows, cols } = this.activePuzzle;
    const wrapper = document.getElementById('grid-wrapper');
    const maxW = (wrapper ? wrapper.clientWidth : 340) - 18;
    const maxH = (wrapper ? wrapper.clientHeight : 340) - 18;

    const cellDim = Math.min(Math.floor(maxW / cols), Math.floor(maxH / rows), 54);
    document.documentElement.style.setProperty('--cell-dim', `${cellDim}px`);

    if (!this.gridBuilt || container.children.length !== (rows * cols)) {
      container.innerHTML = '';
      container.style.gridTemplateColumns = `repeat(${cols}, ${cellDim}px)`;
      container.style.gridTemplateRows = `repeat(${rows}, ${cellDim}px)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = this.cells[r][c];
          const div = document.createElement('div');
          div.className = 'grid-cell';
          div.dataset.row = r;
          div.dataset.col = c;
          div.style.width = `${cellDim}px`;
          div.style.height = `${cellDim}px`;

          if (cell.isBlack) {
            div.classList.add('black-cell');
          } else {
            if (cell.number) {
              const numSpan = document.createElement('span');
              numSpan.className = 'cell-number';
              numSpan.textContent = cell.number;
              div.appendChild(numSpan);
            }

            const letterSpan = document.createElement('span');
            letterSpan.className = 'cell-letter';
            letterSpan.textContent = cell.userLetter || '';
            div.appendChild(letterSpan);

            div.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              this.selectCell(r, c);
            });
          }

          container.appendChild(div);
        }
      }
      this.gridBuilt = true;
    }

    const activeCell = this.cells[this.activeCell.r][this.activeCell.c];
    const activeTargetNum = (this.direction === 'ACROSS')
      ? activeCell.acrossClueNum
      : activeCell.downClueNum;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.cells[r][c];
        if (cell.isBlack) continue;

        const cellDiv = container.children[r * cols + c];
        if (!cellDiv) continue;

        cellDiv.style.width = `${cellDim}px`;
        cellDiv.style.height = `${cellDim}px`;

        const letterSpan = cellDiv.querySelector('.cell-letter');
        if (letterSpan) {
          letterSpan.textContent = cell.userLetter || '';
        }

        cellDiv.classList.remove('highlight-active', 'highlight-word');

        if (r === this.activeCell.r && c === this.activeCell.c) {
          cellDiv.classList.add('highlight-active');
        } else {
          const inWord = (this.direction === 'ACROSS')
            ? cell.acrossClueNum === activeTargetNum
            : cell.downClueNum === activeTargetNum;
          if (inWord) {
            cellDiv.classList.add('highlight-word');
          }
        }
      }
    }

    const clueInfo = this.getActiveClue();
    const clueNumLabel = document.getElementById('clue-number-label');
    const clueDirLabel = document.getElementById('clue-dir-label');
    const clueTextLabel = document.getElementById('clue-text-label');

    if (clueNumLabel) clueNumLabel.textContent = clueInfo.num;
    if (clueDirLabel) clueDirLabel.textContent = clueInfo.dir;
    if (clueTextLabel) clueTextLabel.textContent = clueInfo.text;
  }
}

const engine = new CrosswordEngine();

function launchConfetti() {
  const canvas = document.getElementById('victory-canvas');
  if (!canvas || !canvas.parentElement) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth || 340;
  canvas.height = canvas.parentElement.clientHeight || 340;

  const particles = [];
  const colors = ['#00e5ff', '#ffbe1a', '#e62243', '#ffffff', '#00e676'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 14,
      size: Math.random() * 7 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let frames = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.34;
      p.rot += p.vRot;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frames++;
    if (frames < 90) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(animate);
}

class UIRouter {
  constructor() {
    this.screens = {
      menu: document.getElementById('screen-main-menu'),
      dailySub: document.getElementById('screen-daily-sub'),
      vault: document.getElementById('screen-vault'),
      puzzle: document.getElementById('screen-puzzle')
    };
    this.appHeader = document.querySelector('.app-header');
    this.globalHomeBtn = document.getElementById('btn-global-home');
  }

  showScreen(name) {
    Object.values(this.screens).forEach(scr => {
      if (scr) scr.classList.remove('active');
    });

    if (this.screens[name]) {
      this.screens[name].classList.add('active');
    }

    if (this.appHeader) {
      this.appHeader.classList.toggle('app-header-hidden', name === 'puzzle');
    }

    if (name === 'menu') {
      if (this.globalHomeBtn) {
        this.globalHomeBtn.href = "https://tileworksgamesstudio.github.io/Curling-Menu/";
        const textSpan = this.globalHomeBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'HOME';
        this.globalHomeBtn.onclick = null;
      }
      this.refreshMenu();
    } else {
      if (this.globalHomeBtn) {
        this.globalHomeBtn.removeAttribute('href');
        const textSpan = this.globalHomeBtn.querySelector('.btn-text');
        if (textSpan) textSpan.textContent = 'MENU';
        this.globalHomeBtn.onclick = (e) => {
          e.preventDefault();
          sound.playBlip();
          engine.stopTimer();
          this.showScreen('menu');
        };
      }
    }

    if (name === 'puzzle') {
      setTimeout(() => {
        engine.gridBuilt = false;
        engine.render();
      }, 40);
    }
  }

  refreshMenu() {
    const todayNum = timeGate.getTodayDayNumber();
    const puz = timeGate.getPuzzleForDay(todayNum);

    const editionBadge = document.getElementById('hero-edition-badge');
    if (editionBadge) editionBadge.textContent = `DAILY EDITION #${todayNum}`;

    const releaseSub = document.getElementById('daily-release-date');
    if (releaseSub && puz) {
      const dateStr = puz.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      releaseSub.textContent = `${puz.theme} • ${dateStr}`;
    }

    const vaultSub = document.getElementById('vault-count-sub');
    if (vaultSub) {
      const pastList = timeGate.getVaultPuzzles();
      vaultSub.textContent = `${pastList.length} Archived Editions`;
    }

    const streakVal = document.getElementById('stat-streak-val');
    const solvedVal = document.getElementById('stat-solved-val');
    const bestMini = document.getElementById('stat-best-mini');

    if (streakVal) streakVal.textContent = timeGate.state.streak || '0';
    if (solvedVal) solvedVal.textContent = timeGate.getTotalSolved();
    if (bestMini) bestMini.textContent = timeGate.getBestTime('mini');
  }

  renderDailySubMenu(dayNumber) {
    const bundle = timeGate.getPuzzleForDay(dayNumber);
    const titleElem = document.getElementById('daily-sub-title');
    const dateElem = document.getElementById('daily-sub-date');

    if (titleElem) titleElem.textContent = bundle.theme.toUpperCase();
    if (dateElem) dateElem.textContent = bundle.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const titleFull = document.getElementById('tier-title-full');
    const titleMidi = document.getElementById('tier-title-midi');
    const titleMini = document.getElementById('tier-title-mini');

    if (titleFull) titleFull.textContent = `Classic Crossword (15×15)`;
    if (titleMidi) titleMidi.textContent = `Midi Crossword (9×9)`;
    if (titleMini) titleMini.textContent = `Mini Crossword (5×5)`;

    const tierLabels = {
      full: 'CLASSIC 15×15',
      midi: 'MIDI 9×9',
      mini: 'MINI 5×5'
    };

    ['full', 'midi', 'mini'].forEach(type => {
      const badge = document.getElementById(`status-${type}`);
      const btn = document.querySelector(`.tier-play-btn[data-type="${type}"]`);
      if (badge && btn) {
        btn.dataset.day = dayNumber;
        if (timeGate.isCompleted(dayNumber, type)) {
          badge.textContent = 'SOLVED';
          badge.classList.add('solved');
          btn.textContent = `REVIEW ${tierLabels[type]}`;
        } else {
          badge.textContent = 'READY';
          badge.classList.remove('solved');
          btn.textContent = `PLAY ${tierLabels[type]}`;
        }
      }
    });

    this.showScreen('dailySub');
  }

  renderVault() {
    const list = document.getElementById('vault-list');
    if (!list) return;
    list.innerHTML = '';

    const pastPuzzles = timeGate.getVaultPuzzles();

    if (pastPuzzles.length === 0) {
      list.innerHTML = `
        <div class="vault-empty-note neo-card">
          <p>No past puzzles in the archive yet.</p>
          <p style="margin-top: 6px; font-size: 11px; opacity: 0.85;">
            Past daily editions will automatically accumulate here.
          </p>
        </div>
      `;
      return;
    }

    pastPuzzles.forEach(bundle => {
      const card = document.createElement('div');
      card.className = 'tier-card neo-card';
      const dateStr = bundle.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      card.innerHTML = `
        <div class="tier-header-row">
          <span class="tier-badge size-midi">EDITION #${bundle.dayNumber}</span>
          <span class="tier-meta-time">${dateStr}</span>
        </div>
        <h3 class="tier-title">${bundle.theme}</h3>
        <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
          <button class="neo-btn small-btn primary-btn vault-play-btn" data-day="${bundle.dayNumber}" data-type="full">CLASSIC 15×15</button>
          <button class="neo-btn small-btn secondary-btn vault-play-btn" data-day="${bundle.dayNumber}" data-type="midi">MIDI 9×9</button>
          <button class="neo-btn small-btn vault-play-btn" data-day="${bundle.dayNumber}" data-type="mini">MINI 5×5</button>
        </div>
      `;
      list.appendChild(card);
    });

    list.querySelectorAll('.vault-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day, 10);
        const type = btn.dataset.type;
        this.launchGame(day, type);
      });
    });
  }

  launchGame(dayNumber, type) {
    if (engine.loadPuzzle(dayNumber, type)) {
      const bundle = timeGate.getPuzzleForDay(dayNumber);
      const titleElem = document.getElementById('game-puzzle-title');
      const tierElem = document.getElementById('game-puzzle-tier');

      const dimensionLabels = {
        full: '15×15',
        midi: '9×9',
        mini: '5×5'
      };

      const typeLabel = type === 'full' ? 'CLASSIC 15×15' : type === 'midi' ? 'MIDI 9×9' : 'MINI 5×5';
      if (titleElem) titleElem.textContent = bundle[type].title;
      if (tierElem) tierElem.textContent = `${dimensionLabels[type]} • ${bundle.theme}`;

      this.showScreen('puzzle');
    }
  }
}

const router = new UIRouter();

document.addEventListener('DOMContentLoaded', () => {
  const btnDaily = document.getElementById('btn-menu-daily');
  const btnVault = document.getElementById('btn-menu-vault');
  const btnRules = document.getElementById('btn-menu-rules');
  const btnGameBack = document.getElementById('btn-game-back');

  if (btnDaily) {
    btnDaily.addEventListener('click', () => {
      sound.playBlip();
      const todayNum = timeGate.getTodayDayNumber();
      router.renderDailySubMenu(todayNum);
    });
  }

  if (btnVault) {
    btnVault.addEventListener('click', () => {
      sound.playBlip();
      router.renderVault();
      router.showScreen('vault');
    });
  }

  if (btnRules) {
    btnRules.addEventListener('click', () => {
      sound.playBlip();
      document.getElementById('modal-rules').classList.remove('hidden');
    });
  }

  if (btnGameBack) {
    btnGameBack.addEventListener('click', () => {
      sound.playBlip();
      engine.stopTimer();
      router.renderDailySubMenu(engine.activeDayNumber);
    });
  }

  const btnBackFromSub = document.getElementById('btn-back-from-sub');
  if (btnBackFromSub) {
    btnBackFromSub.addEventListener('click', () => {
      sound.playBlip();
      router.showScreen('menu');
    });
  }

  const btnBackFromVault = document.getElementById('btn-back-from-vault');
  if (btnBackFromVault) {
    btnBackFromVault.addEventListener('click', () => {
      sound.playBlip();
      router.showScreen('menu');
    });
  }

  document.querySelectorAll('.tier-play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playBlip();
      const type = btn.dataset.type;
      const day = parseInt(btn.dataset.day, 10);
      router.launchGame(day, type);
    });
  });

  const btnPrevClue = document.getElementById('btn-prev-clue');
  const btnNextClue = document.getElementById('btn-next-clue');
  const clueBar = document.getElementById('clue-bar');

  if (btnPrevClue) {
    btnPrevClue.addEventListener('click', (e) => {
      e.stopPropagation();
      engine.prevClue();
    });
  }

  if (btnNextClue) {
    btnNextClue.addEventListener('click', (e) => {
      e.stopPropagation();
      engine.nextClue();
    });
  }

  if (clueBar) {
    clueBar.addEventListener('click', () => {
      engine.toggleDirection();
    });
  }

  const btnCheck = document.getElementById('btn-check-word');
  const btnReveal = document.getElementById('btn-reveal-word');

  if (btnCheck) {
    btnCheck.addEventListener('click', () => {
      engine.checkCurrentWord();
    });
  }

  if (btnReveal) {
    btnReveal.addEventListener('click', () => {
      engine.revealCurrentWord();
    });
  }

  const virtualKeyboard = document.getElementById('custom-keyboard');
  if (virtualKeyboard) {
    virtualKeyboard.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.key-btn');
      if (!btn) return;
      e.preventDefault();

      const key = btn.dataset.key;
      if (key === 'BACKSPACE') {
        engine.deleteLetter();
      } else if (key === 'TOGGLE') {
        engine.toggleDirection();
      } else if (key && key.length === 1) {
        engine.inputLetter(key);
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!document.getElementById('screen-puzzle').classList.contains('active')) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      engine.deleteLetter();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const { r, c } = engine.activeCell;
      if (!engine.cells[r][c].isBlack) {
        engine.cells[r][c].userLetter = '';
        sound.playDelete();
        engine.saveProgress();
        engine.render();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      engine.stepCursor(1);
      engine.render();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      engine.stepCursor(-1);
      engine.render();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (engine.direction === 'ACROSS') engine.toggleDirection();
      else engine.stepCursor(1);
      engine.render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (engine.direction === 'ACROSS') engine.toggleDirection();
      else engine.stepCursor(-1);
      engine.render();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      engine.toggleDirection();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) engine.prevClue();
      else engine.nextClue();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      engine.inputLetter(e.key.toUpperCase());
    }
  });

  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundCheck = document.getElementById('setting-sound');

  const updateSoundUI = () => {
    if (sound.enabled) {
      if (soundIcon) soundIcon.textContent = '🔊';
      if (soundCheck) soundCheck.checked = true;
    } else {
      if (soundIcon) soundIcon.textContent = '🔇';
      if (soundCheck) soundCheck.checked = false;
    }
  };

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      updateSoundUI();
      sound.playBlip();
    });
  }

  if (soundCheck) {
    soundCheck.addEventListener('change', (e) => {
      sound.enabled = e.target.checked;
      updateSoundUI();
    });
  }

  const btnSettings = document.getElementById('btn-open-settings');
  const modalSettings = document.getElementById('modal-settings');
  const btnResetStorage = document.getElementById('btn-reset-storage');

  if (btnSettings && modalSettings) {
    btnSettings.addEventListener('click', () => {
      sound.playBlip();
      modalSettings.classList.remove('hidden');
    });
  }

  if (btnResetStorage) {
    btnResetStorage.addEventListener('click', () => {
      if (window.confirm('Reset all saved puzzle completion history and grids on this device?')) {
        localStorage.removeItem(timeGate.storageKey);
        timeGate.state = timeGate.loadState();
        modalSettings.classList.add('hidden');
        router.refreshMenu();
      }
    });
  }

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playBlip();
      btn.closest('.modal-overlay').classList.add('hidden');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) {
        sound.playBlip();
        overlay.classList.add('hidden');
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
        }
      });
    }
  });

  const btnVictoryContinue = document.getElementById('btn-victory-continue');
  if (btnVictoryContinue) {
    btnVictoryContinue.addEventListener('click', () => {
      sound.playBlip();
      document.getElementById('modal-victory').classList.add('hidden');
      router.showScreen('menu');
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (document.getElementById('screen-puzzle').classList.contains('active')) {
        engine.gridBuilt = false;
        engine.render();
      }
    }, 60);
  });

  router.showScreen('menu');
});
