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
  "HEART": "Core muscle or playing-card suit",
  "EMBER": "Glowing coal from a dying fire",
  "ABUSE": "Mistreatment or improper usage",
  "RESIN": "Sticky substance derived from trees",
  "TREND": "General direction or popular fad",
  "START": "Commence or initiate action",
  "TOWER": "Tall, free-standing structure",
  "AWARE": "Conscious and mindful of facts",
  "REARS": "Brings up children, or the back end",
  "TRESS": "Long lock or plait of hair",
  "BASES": "Foundations or baseball stations",
  "ARENA": "Enclosed sports stadium or venue",
  "SEDAN": "Standard four-door automobile",
  "ENACT": "Formally pass a bill into law",
  "SANTA": "Iconic December gift-giver",
  "SHEER": "Completely transparent or very steep",
  "HEAVE": "Lift or throw with considerable effort",
  "EAVES": "Overhanging lower edges of a roof",
  "EVENT": "Noteworthy scheduled happening",
  "RESTS": "Pauses to recharge energy",
  "SCOTS": "Natives of Edinburgh or Glasgow",
  "CANOE": "Narrow watercraft with paddles",
  "ONION": "Layered vegetable that prompts tears",
  "TOOTS": "Short honks from a vehicle horn",
  "SENSE": "Perception or sound practical judgment",
  "HACK": "Clever digital shortcut or quick tip",
  "SLAM": "Close with forceful impact",
  "AREA": "Region or surface measurement",
  "PALE": "Light in color; lacking vibrancy",
  "MOST": "The greatest amount or quantity",
  "ICED": "Chilled with frozen cubes",
  "SPIN": "Rotate rapidly about an axis",
  "TONE": "Vocal pitch or musical sound quality",
  "SKIP": "Omit, or jump lightly over",
  "STONE": "Hard mineral matter or pebble",
  "ODOR": "Distinctive aroma or scent",
  "UNIT": "Single individual entity or section",
  "RARE": "Infrequently encountered or lightly cooked",
  "NOTE": "Brief written memo or musical pitch",
  "EYES": "Organs responsible for sight",
  "TEES": "Support pegs used on a golf course",
  "DRAW": "Produce a sketch or finish tied",
  "LINE": "Continuous mark or queue of people",
  "HOPE": "Wish or aspiration for the future",
  "AMEN": "Traditional prayer conclusion",
  "PENN": "Actor Sean or state founder William",
  "TONS": "Large units of imperial weight",
  "LEAD": "Heavy metallic element or guided path",
  "GRIP": "Firm hold or handle surface",
  "SWAP": "Trade one item for another",
  "ROAR": "Loud, deep sound of a lion",
  "HOLE": "Opening or cavity in a surface",
  "OWNS": "Possesses lawful legal title to",
  "BONS": "French plural for 'good'",
  "SWEEP": "Clean a floor using a brush",
  "PEEL": "Remove the outer skin of fruit",
  "SHEET": "Rectangular bed linen or page",
  "HOGLINE": "Crucial boundary line on a playing surface",
  "HAMMER": "Hand tool used to pound nails",
  "TAKEOUT": "Food ordered to eat at home",
  "SWEEPER": "Cleaning device or broom user",
  "BUTTON": "Fastener on a shirt or clickable UI element",
  "OUTTURN": "Yield or production output",
  "INTURNS": "Rotations or bends inward",
  "BONUS": "Unexpected extra reward or perk",
  "BLANK": "Empty space on a form",
  "PEBBLE": "Small smooth rounded stone",
  "SLIDER": "Small hamburger or sliding cursor"
};

const PUZZLE_DATA_SETS = [
  {
    id: "day-1",
    dayIndex: 0,
    theme: "Volume I: Foundations",
    mini: {
      title: "Mini 1",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "HEART",
        "EMBER",
        "ABUSE",
        "RESIN",
        "TREND"
      ],
      clues: {
        across: {
          1: "Core muscle or playing-card suit",
          6: "Glowing coal from a dying fire",
          7: "Mistreatment or improper usage",
          8: "Sticky substance derived from pine trees",
          9: "General direction or popular style"
        },
        down: {
          1: "Core muscle or playing-card suit",
          2: "Glowing coal from a dying fire",
          3: "Mistreatment or improper usage",
          4: "Sticky substance derived from pine trees",
          5: "General direction or popular style"
        }
      }
    },
    midi: {
      title: "Midi 1",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "HACK#SLAM",
        "AREA#PALE",
        "MOST#ICED",
        "SPIN#TONE",
        "###SKIP##",
        "##STONE##",
        "ODOR#UNIT",
        "RARE#NOTE",
        "EYES#TEES"
      ],
      clues: {
        across: {
          1: "Clever digital shortcut or quick tip",
          5: "Close with forceful impact",
          9: "Region or surface measurement",
          10: "Light in color; lacking vibrancy",
          11: "The greatest amount or quantity",
          12: "Chilled with frozen water cubes",
          13: "Rotate rapidly about an axis",
          14: "Vocal pitch or sound quality",
          15: "Omit, or jump lightly over",
          16: "Hard mineral matter or pebble",
          17: "Distinctive aroma or scent",
          19: "Single individual entity or section",
          21: "Infrequently encountered or lightly cooked",
          22: "Brief written memo or musical pitch",
          23: "Organs responsible for sight",
          24: "Support pegs used on a golf course"
        },
        down: {
          1: "Smoked meats or theatrical overactors",
          2: "Combat zone or competition space",
          3: "Protective winter coats or wraps",
          4: "Patterns woven into Scottish kilts",
          5: "Heavy hit or impact",
          6: "Sharp cutting implement",
          7: "Balm ingredient for soothing skin",
          8: "Championship prize or award",
          15: "Rapid, agile cleaning motion",
          16: "Solid chunk of rock",
          17: "Match event scheduled on a calendar",
          18: "Direct path without deviations",
          19: "Tally on a scoreboard",
          20: "The tiny center target"
        }
      }
    },
    full: {
      title: "Classic 1",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "SHEET#HOGLINE#B",
        "PALE#SOLO#AXE#O",
        "ARCS#AREA#MET#N",
        "TAKEOUT#SWEEPER",
        "###HAMMER#EASES",
        "SPIN#RED#DRAW##",
        "TARE#ORES#AMBER",
        "ORE#BUTTON#EASE",
        "NEW#TEES#CURLS#",
        "##LEAD#SKIP#LET",
        "BONUS#HEATER###",
        "OUTTURN#PEBBLED",
        "NIL#ICE#ELS#OAR",
        "SOU#NIL#ROA#UNE",
        "P#WEIGHT#SECOND"
      ],
      clues: {
        across: {
          1: "Rectangular bed linen or page of paper",
          6: "Boundary line on a sports sheet",
          13: "Abbreviation for a major league sport",
          14: "Light in shade; lacking deep color",
          15: "Individual performance without accompaniment",
          16: "Wood-chopping tool with a sharp head",
          17: "Curved trajectories in geometry",
          18: "Surface measurement or geographic region",
          19: "Encountered socially for the first time",
          20: "Restaurant food ordered to enjoy at home",
          22: "Street cleaner or curling athlete",
          24: "Heavy hand tool used for pounding nails",
          26: "Relieves pain or alleviates pressure",
          27: "Whirling rotation applied to an object",
          30: "Primary color of rubies and strawberries",
          31: "Produce an illustration with a pencil",
          33: "Deduction of wrapper or vessel weight",
          35: "Crude mineral rocks extracted from earth",
          37: "Glowing warm golden fossil resin",
          40: "Rock containing valuable metal elements",
          41: "Shirt fastener or clickable interface key",
          43: "Relaxation and comfort without strain",
          44: "Fresh, modern, and recently crafted",
          45: "Small supporting pegs used in golf",
          47: "Wavy locks of hair or spiraling arcs",
          49: "Opening position in a lineup or team",
          51: "Captain of a team or light hop",
          53: "Permission granted or tennis fault replay",
          54: "Unexpected supplementary reward or perk",
          56: "Appliance generating warmth in winter",
          58: "Rotational delivery motion or yield",
          61: "Surface textured with tiny frozen droplets",
          65: "Zero points or absolute nothingness",
          66: "Solid frozen water cubes",
          67: "Elevated trains in Chicago",
          68: "Hand-operated paddle for rowing a boat",
          69: "Antique French coin of low value",
          70: "Blank score indicator meaning zero",
          71: "Abbreviation for roaring sound",
          72: "French feminine article for 'one'",
          73: "Heaviness measured on a balance scale",
          74: "Unit of time equal to 1/60th of a minute"
        },
        down: {
          1: "Brisk scrubbing action with a broom",
          2: "Smoothly moving forward across a surface",
          3: "Island source of fine Scottish granite",
          4: "Suffix indicating an actor or athlete",
          5: "Measure of movement rate and tempo",
          6: "Foothold blocks used for push-off",
          7: "Circular concentric target rings",
          8: "Heavy tractor vehicle that cleans ice",
          9: "Long seasonal cold spell in winter",
          10: "Rubber grip material applied to footwear",
          11: "Total count of items in a standard set",
          12: "Final conclusion or boundary of play",
          21: "Clean trajectory without deviations",
          23: "Notched tally marks on a chalkboard",
          25: "Slick synthetic sole used for gliding",
          28: "Textured tread on athletic shoe soles",
          29: "Opening stone thrown in a round",
          32: "Steaming beverage enjoyed after cold weather",
          34: "Concluding round of a tournament match",
          36: "Protective barrier placed on defense",
          38: "Rumble of solid granite colliding",
          39: "Wood benches arranged along sidelines",
          42: "Tactical hand signals from an advisor",
          46: "Careful placement behind a shield",
          48: "Footwear worn on a supporting foot",
          50: "Team member who delivers crucial shots",
          52: "Balanced athletic posture at release",
          55: "Vigorous sweeping effort: 'Push ___!'",
          57: "Clubhouse social gathering after matches",
          59: "Classic Scottish plaid fabric pattern",
          60: "Vibrant primary color indicators",
          62: "Scenic Scottish lake or freshwater body",
          63: "Earned score points in a frame",
          64: "Final team deliverer who takes last shot"
        }
      }
    }
  },
  {
    id: "day-2",
    dayIndex: 1,
    theme: "Volume II: Precision",
    mini: {
      title: "Mini 2",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "START",
        "TOWER",
        "AWARE",
        "REARS",
        "TRESS"
      ],
      clues: {
        across: {
          1: "Commence or set in motion",
          6: "Tall, slender architectural structure",
          7: "Conscious or mindful of surroundings",
          8: "Brings up children, or the back part",
          9: "Long lock or braid of hair"
        },
        down: {
          1: "Commence or set in motion",
          2: "Tall, slender architectural structure",
          3: "Conscious or mindful of surroundings",
          4: "Brings up children, or the back part",
          5: "Long lock or braid of hair"
        }
      }
    },
    midi: {
      title: "Midi 2",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "DRAW#SHOT",
        "LINE#HOPE",
        "ICED#AMEN",
        "PENN#TONS",
        "###HACK##",
        "##LEAD###",
        "GRIP#SWAP",
        "ROAR#HOLE",
        "OWNS#TEES"
      ],
      clues: {
        across: {
          1: "Produce an illustration or tie a game",
          5: "Attempt on goal or camera capture",
          9: "Straight stroke or queue of people",
          10: "Wish for a positive outcome",
          11: "Chilled with frozen cubes",
          12: "Solemn prayer ending word",
          13: "Ivy League university in Philadelphia",
          14: "Heavy units of imperial weight",
          15: "Clever digital shortcut or tech tip",
          16: "Opening player in an athletic squad",
          17: "Firm hold on a sports handle",
          20: "Exchange one object for another",
          22: "Thunderous rumble of applause",
          23: "Small cavity or opening in ground",
          24: "Holds legal ownership of property",
          25: "Target intersection points"
        },
        down: {
          1: "Flip over or lay flat to rest",
          2: "Arena maintenance technician",
          3: "Athlete moving with swift glide",
          4: "Effort and power behind a delivery",
          5: "Protective barrier guarding a goal",
          6: "Outer circular boundary of a target",
          7: "Open expanse on a competition field",
          8: "Precise measurement with a stopwatch",
          15: "Object coming to a halt too early",
          16: "Slick footwear piece for smooth glide",
          17: "Traditional gathering of club members",
          18: "Difficult maneuver called by a leader",
          19: "Ancient iron implement used in games",
          20: "Synthetic bristles on a cleaning brush",
          21: "Score an upset point unexpectedly"
        }
      }
    },
    full: {
      title: "Classic 2",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "GUARD#HACKS#SPA",
        "UNTIE#OPERA#TON",
        "RINGS#STONE#ONE",
        "LAY#SWEPT#DRAWN",
        "#TEES#TEE#EERIE",
        "###LEAD#SHEET##",
        "BONUS#STONY#ICE",
        "OUTTURN#INTURNS",
        "RHO#DRAWS#NEATO",
        "##SHAKE#PEEL###",
        "ROARS#EAT#DEER#",
        "HAMMER#SENSE#RA",
        "ICE#BLANK#EXCEL",
        "NUT#LOOSE#PEBBL",
        "GAS#ENDED#SPOON"
      ],
      clues: {
        across: {
          1: "Protective defender or sentry",
          6: "Clever digital tips or software hacks",
          11: "Resort featuring thermal baths",
          14: "Loosen shoelaces after exercise",
          15: "Dramatic musical production with orchestra",
          16: "Unit of weight equal to 2,000 pounds",
          17: "Circular targets or pieces of jewelry",
          18: "Hard natural mineral or rock",
          19: "Single unit or indivisible integer",
          20: "Place down gently upon a surface",
          21: "Cleaned a floor using vigorous brush strokes",
          23: "Rendered with pencil or pulled forward",
          24: "Target centers or golf supporting pegs",
          26: "The letter T spelled out or golf peg",
          27: "Mysterious and uncanny in atmosphere",
          28: "First position in an athletic rotation",
          30: "Broad rectangular expanse or bed linen",
          32: "Unexpected reward added to a salary",
          35: "Hard and rocky like unyielding ground",
          37: "Frozen solid water",
          38: "Outward rotational turn or product yield",
          40: "Inward turns or circular rotations",
          42: "Greek letter following pi in the alphabet",
          43: "Pencil sketches or games ending level",
          45: "Colloquial term for excellent or cool",
          46: "Friendly greeting via hands or tremble",
          48: "Strip the rind from an orange",
          50: "Loud sounds from an excited stadium crowd",
          52: "Consume a hearty meal",
          54: "Woodland animals with branching antlers",
          57: "Hand tool used to drive steel nails",
          60: "Clear practical judgment or faculties",
          61: "Ancient Egyptian sun deity",
          62: "Chilled playing surface",
          63: "Unfilled space on a questionnaire",
          65: "Perform exceptionally well in school",
          66: "Threaded metal fastener pairing with a bolt",
          67: "Not firmly fastened or unrestrained",
          68: "Small rounded stone or water droplet",
          69: "Fuel powering motor vehicles",
          70: "Concluded an event or finished a game",
          71: "Utensil used for sipping hot soup"
        },
        down: {
          1: "Rubber gripping surface on athletic footwear",
          2: "Navigate an awkward fork in the road",
          3: "Chemical deicer for frozen winter walkways",
          4: "Pleat or fold in traditional woolen kilts",
          5: "Chalk score marks on a classroom board",
          6: "Object launched with excessive velocity",
          7: "Appropriate mass and kinetic energy",
          8: "Tactical strategic plan for a team",
          9: "High seating stools at a tavern counter",
          10: "Carefully shielded behind a barrier",
          11: "Storage depot for athletic gear",
          12: "Smooth teflon sole for gliding",
          13: "Facility manager's ice maintenance craft",
          22: "Temperature readings in an arena",
          25: "Smooth forward motion from a starting hack",
          29: "Throw gently toward a target",
          31: "Resting exactly on the central pin",
          32: "Tournament gathering with an awards banquet",
          33: "Final thrower on an athletic squad",
          34: "Scoring zero intentionally for strategic gain",
          36: "Precision timing device with a lap counter",
          39: "Recorded score columns on a card",
          41: "Team captain calling all tactical moves",
          44: "Strategic placement of defensive barriers",
          47: "Footwear worn on a stabilizing leg",
          49: "Birthplace nation of historic curling",
          50: "Vibrations from heavy granite in motion",
          51: "Scenic Scottish loch famous for winter games",
          53: "Teflon plate under a slider shoe",
          54: "Shot that strikes target and remains in play",
          56: "Locker room area where athletes prepare",
          58: "Captain's greeting before a tournament",
          59: "Score points while defending without hammer",
          64: "Cold temperature rating on a winter rink"
        }
      }
    }
  },
  {
    id: "day-3",
    dayIndex: 2,
    theme: "Volume III: Tactics",
    mini: {
      title: "Mini 3",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "BASES",
        "ARENA",
        "SEDAN",
        "ENACT",
        "SANTA"
      ],
      clues: {
        across: {
          1: "Foundations or baseball corners",
          6: "Enclosed sports stadium or venue",
          7: "Standard four-door passenger car",
          8: "Formally pass a bill into law",
          9: "Iconic December gift-bringer"
        },
        down: {
          1: "Foundations or baseball corners",
          2: "Enclosed sports stadium or venue",
          3: "Standard four-door passenger car",
          4: "Formally pass a bill into law",
          5: "Iconic December gift-bringer"
        }
      }
    },
    midi: {
      title: "Midi 3",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "BONUS#ICE",
        "SWEEP#PAD",
        "TEES#HAUL",
        "#WEIGHT##",
        "###SKIP##",
        "##STONE##",
        "TAKE#CURL",
        "ODOR#UNIT",
        "PENN#ROAR"
      ],
      clues: {
        across: {
          1: "Unexpected extra reward or benefit",
          6: "Solid frozen water surface",
          9: "Clean thoroughly with a broom",
          10: "Cushioned mat or mouse surface",
          11: "Support pegs used on a golf course",
          12: "Transport heavy cargo over distance",
          13: "Heaviness of an object on a scale",
          14: "Team leader or omit an item",
          15: "Hard granite rock or pebble",
          16: "Grasp with hands or capture",
          18: "Spiral trajectory or ringlet of hair",
          20: "Distinctive aroma or scent",
          21: "Distinct single division or squad",
          22: "Championship banner or Ivy League school",
          23: "Loud, deep sound of a crowd"
        },
        down: {
          1: "Warm winter knit toque cap",
          2: "Landed gently on the target mark",
          3: "Synthetic bristles on a brand-new brush",
          4: "Throw falling short of the intended mark",
          5: "Embroidered emblem on a team jersey",
          6: "Stable posture and physical equilibrium",
          7: "Sharp cutting blade on a scraper",
          8: "Senior masters division in athletics",
          13: "Wide shot missing the intended goal",
          14: "Specialized footwear worn on ice",
          15: "Vigorous sweeping team athlete",
          17: "Granite source island in Scotland",
          18: "Point scored without having hammer",
          19: "Thermal underlayer for winter comfort"
        }
      }
    },
    full: {
      title: "Classic 3",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "STONE#BROOM#SPA",
        "TOEIC#LEWIS#EON",
        "EXACT#ANGER#END",
        "AIR#SWEEP#TIRED",
        "###SHAKE#HAMMER",
        "SHEET#SCREW####",
        "LEAD#PEBBLE#ICE",
        "ICE#BUTTON#BEAD",
        "DEE#ERRORS#ELSE",
        "####DRY#SPINS##",
        "BONUSES#OUTS###",
        "ONCE#SLIDER#ICE",
        "NEO#TEES#SWEEPS",
        "SPA#ONCE#EAGLES",
        "PEN#PAGES#STENT"
      ],
      clues: {
        across: {
          1: "Polished piece of natural granite",
          6: "Cleaning implement with bristles",
          11: "Resort featuring mineral hot springs",
          14: "International English language test",
          15: "Scottish island known for historic origins",
          16: "Immense geological span of time",
          17: "Completely accurate and precise",
          18: "Frustration following an errant play",
          19: "One frame in a match or conclusion",
          20: "Atmosphere inhaled by athletes",
          21: "Vigorous brushing action with brooms",
          22: "Exhausted after many frames of play",
          24: "Handshake of mutual sportsmanship",
          26: "Final throw advantage in a frame",
          27: "Long rectangular competition alley",
          30: "Threaded metal fastener",
          32: "Opening player in a four-person squad",
          33: "Tiny frozen droplets on an ice surface",
          35: "Frozen water surface",
          36: "Solid playing ice alley",
          37: "Tiny center ring on a target house",
          38: "Small spherical decorative piece",
          39: "Famous river in northern Scotland",
          40: "Blunders or errant shots in a game",
          41: "Otherwise alternative option",
          42: "Low-humidity playing condition",
          43: "Whirling rotations applied to an object",
          45: "Unexpected additional score points",
          48: "Stones pushed out of the field of play",
          49: "On a single past occasion",
          50: "Slick footwear piece for gliding",
          52: "Solid frozen playing sheet",
          53: "Prefix meaning modern or new",
          54: "Target centers at both ends of a sheet",
          55: "Vigorously brushes the ice alley",
          56: "Hydrotherapy bath in a health club",
          57: "At one past moment in history",
          58: "Magnificent birds of prey or golf scores",
          59: "Ink-writing instrument for scoring",
          60: "Leaves in a tournament guide book",
          61: "Medical tube inserted into an artery"
        },
        down: {
          1: "Object resting behind a protective guard",
          2: "Poisonous weed (not found on clean ice)",
          3: "Tiebreaker round between teams",
          4: "Traditional Scottish cap worn by skips",
          5: "Moisture droplets inside an arena",
          6: "Social tournament gathering with a banquet",
          7: "Athlete who scrubs pebble with a broom",
          8: "Granite mining quarry formation",
          9: "Historic Scottish waterway",
          10: "Decorative pouch worn with a traditional kilt",
          11: "Balanced delivery posture in the hack",
          12: "Protective placement guarding a target",
          13: "Decorative championship pennant banner",
          23: "Water sprayed to form a pebble surface",
          25: "Vigorous scrubbing rhythm with a broom",
          26: "Rubber starting footholds in an alley",
          27: "Strategic frame ending 0-0",
          28: "Small central circle of a target",
          29: "Smooth forward sliding motion",
          31: "Delivery path arching too wide",
          33: "Pinpoint landing right on the tee line",
          34: "Scoring an end without final rock advantage",
          37: "Locker room bench where athletes relax",
          44: "Deliberate scoreless frame to keep hammer",
          45: "Vigorous sweeping team member",
          46: "The entire ice competition alley",
          47: "Stone sliding gracefully toward target",
          50: "Direct finesse draw toward the center",
          51: "Teflon shoe sole for sliding athletes"
        }
      }
    }
  },
  {
    id: "day-4",
    dayIndex: 3,
    theme: "Volume IV: Strategy",
    mini: {
      title: "Mini 4",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "SHEER",
        "HEAVE",
        "EAVES",
        "EVENT",
        "RESTS"
      ],
      clues: {
        across: {
          1: "Transparently thin or extremely steep",
          6: "Lift or toss with heavy effort",
          7: "Roof overhangs on a building",
          8: "Scheduled competition on a slate",
          9: "Takes a breather to recover"
        },
        down: {
          1: "Transparently thin or extremely steep",
          2: "Lift or toss with heavy effort",
          3: "Roof overhangs on a building",
          4: "Scheduled competition on a slate",
          5: "Takes a breather to recover"
        }
      }
    },
    midi: {
      title: "Midi 4",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "HOGS#DRAW",
        "AREA#RARE",
        "LINE#UNIT",
        "TONS#EASE",
        "###SKIP##",
        "##STONE##",
        "SWEEP#ICE",
        "TEAM#PEEL",
        "OWNS#TEES"
      ],
      clues: {
        across: {
          1: "Farm swine or greedy individuals",
          5: "Finesse shot thrown to rest on target",
          9: "Defined territory or zone",
          10: "Seldom found or lightly cooked",
          11: "Path taken across a playing sheet",
          12: "Four-person athletic squad",
          13: "Heavy weight of granite blocks",
          14: "Effortless relaxed motion",
          15: "Team captain directing tactical shots",
          16: "Solid circular 44-pound stone",
          17: "Brush the ice to maintain trajectory",
          20: "Chilled competition surface",
          21: "Four-person athletic unit",
          22: "Remove a protective guard stone",
          23: "Commands the target circles",
          24: "Center target intersection marks"
        },
        down: {
          1: "Foothold starting grips",
          2: "Championship athletic league title",
          3: "Protective stone shielding a target",
          4: "Final throw advantage in a frame",
          5: "Speed of ice: keen versus heavy",
          6: "Velocity required to remove a rock",
          7: "White colorant base beneath ice",
          8: "Scottish loch hosting historic bonspiels",
          15: "Fast-moving granite crossing the sheet",
          16: "Athlete who throws stones 1 and 2",
          17: "Teflon component for smooth sliding",
          18: "Loud clatter of rocks colliding",
          19: "Sweeping muscles in arms and shoulders"
        }
      }
    },
    full: {
      title: "Classic 4",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "HAMMER#HACK#SPA",
        "AVERSE#ARIA#TON",
        "RECITE#MINT#ONE",
        "SHE#SWEEP#STEEL",
        "###TEES#ROAR###",
        "SLIDER#WEIGHT##",
        "LEAD#PEBBLE#ICE",
        "ICE#BUTTON#HOUR",
        "DEE#ERRORS#EASE",
        "####DRY#SPINS##",
        "BONUSES#OUTS###",
        "ONCE#SLIDER#ICE",
        "NEO#TEES#SWEEPS",
        "SPA#ONCE#EAGLES",
        "PEN#PAGES#STENT"
      ],
      clues: {
        across: {
          1: "Heavy hand tool or last-rock advantage",
          7: "Starting block foothold in the ice",
          11: "Thermal hot tub or health spa",
          14: "Reluctant to take an unnecessary risk",
          15: "Solo opera performance melody",
          16: "Heavy measure equal to 2,000 pounds",
          17: "Repeat memorized rules from memory",
          18: "Pristine brand-new condition",
          19: "Single unit or indivisible integer",
          20: "Third-person feminine pronoun",
          21: "Vigorous sweeping command",
          22: "Durable metal scraper blade",
          24: "Target centers at each end of the alley",
          26: "Thunderous rumble of granite in motion",
          28: "Slick footwear piece for gliding",
          31: "Momentum and velocity given to a throw",
          33: "First player to throw on a team",
          34: "Water droplets frozen onto sheet surface",
          36: "Solid playing surface",
          37: "The chilled playing surface",
          38: "Small central target circle",
          39: "Sixty minutes of regulation play",
          40: "Scottish river flowing into the North Sea",
          41: "Delivery mistakes that forfeit points",
          42: "Gliding with relaxed posture",
          43: "Dry, low-humidity playing condition",
          44: "Rotational turns applied to a handle",
          46: "Extra points secured on a steal",
          49: "Stones pushed out of the playing house",
          50: "A single time in past history",
          51: "Teflon shoe component for gliding",
          53: "The frozen playing alley",
          54: "Modern tournament format",
          55: "Target intersection points",
          56: "Vigorously brushes the ice alley",
          57: "Club relaxation whirlpool",
          58: "At one past moment in time",
          59: "Majestic birds of prey or golf scores",
          60: "Scorecard recording pen",
          61: "Printed sheets in a tournament program",
          62: "Medical support inserted into an artery"
        },
        down: {
          1: "Protective guard shielding a scoring stone",
          2: "Trajectory drifting too wide of target",
          3: "Delivery falling short of the scoring rings",
          4: "Rubber grip sole worn by sweepers",
          5: "Locker room fellowship after matches",
          6: "Shot that strikes and rolls into house",
          7: "Rubber foothold embedded in the alley",
          8: "Championship award pennant flag",
          9: "Cold moisture vapor in an arena",
          10: "Traditional Scottish woolen bonnet",
          11: "The 150-foot official playing alley",
          12: "Athlete who brushes the ice surface",
          13: "Frame ending 0-0 to keep last-rock advantage",
          23: "Final stone deliverer on a four-person rink",
          25: "Score zero points intentionally",
          27: "Vigorous sweeping team athlete",
          28: "Stone sliding cleanly down the alley",
          29: "Smooth delivery motion from the hack",
          30: "Finesse shot landing right on the tee",
          32: "Footwear sole crafted from teflon",
          35: "Club tournament banquet dinner",
          45: "Gripping sole on a non-sliding shoe",
          47: "Deep rumble of heavy stone on ice",
          48: "Historic Scottish loch where games began",
          52: "Teflon slider plate under footwear"
        }
      }
    }
  },
  {
    id: "day-5",
    dayIndex: 4,
    theme: "Volume V: Championship",
    mini: {
      title: "Mini 5",
      type: "mini",
      rows: 5,
      cols: 5,
      grid: [
        "SCOTS",
        "CANOE",
        "ONION",
        "TOOTS",
        "SENSE"
      ],
      clues: {
        across: {
          1: "Natives of Edinburgh or the Highlands",
          6: "Narrow paddle boat for summer lakes",
          7: "Pungent culinary bulb causing tears",
          8: "Short horn blasts celebrating victory",
          9: "Sound practical judgment or intuition"
        },
        down: {
          1: "Natives of Edinburgh or the Highlands",
          2: "Narrow paddle boat for summer lakes",
          3: "Pungent culinary bulb causing tears",
          4: "Short horn blasts celebrating victory",
          5: "Sound practical judgment or intuition"
        }
      }
    },
    midi: {
      title: "Midi 5",
      type: "midi",
      rows: 9,
      cols: 9,
      grid: [
        "BONS#PEIL",
        "AREA#HOLE",
        "SWEE#PING",
        "TONS#EASE",
        "###SKIP##",
        "##STONE##",
        "HACK#DRAW",
        "ODOR#UNIT",
        "PENN#ROAR"
      ],
      clues: {
        across: {
          1: "Prefix for an invitational bonspiel",
          5: "Suffix completing a tournament bonspiel",
          9: "Free guard zone on the ice",
          10: "Small divot in an ice alley",
          11: "First syllable of sweeping action",
          12: "Second syllable of sweeping action",
          13: "Measure of granite rock weight",
          14: "Effortless glide across the pebble",
          15: "Team captain directing house strategy",
          16: "Solid circular 44-pound stone",
          17: "Rubber starting foothold for push-off",
          20: "Delicate shot coming to rest in house",
          22: "Aroma of coffee in a clubhouse",
          23: "Four-person athletic squad",
          24: "Championship pennant banner",
          25: "Thunderous rumble of granite rocks"
        },
        down: {
          1: "Central target circle of the house",
          2: "Defensive stone shielding target",
          3: "Vigorous sweeping team athlete",
          4: "Final throw advantage in a frame",
          5: "Gripping sole on non-sliding footwear",
          6: "Heavy momentum required for takeouts",
          7: "The official 150-foot playing alley",
          8: "Scottish loch hosting outdoor bonspiels",
          15: "Athlete who throws stones 1 and 2",
          16: "Teflon shoe piece for gliding",
          17: "Sound of stones clashing together",
          18: "Score points without having hammer",
          19: "Arm muscles used in vigorous sweeping"
        }
      }
    },
    full: {
      title: "Classic 5",
      type: "full",
      rows: 15,
      cols: 15,
      grid: [
        "BONSPIEL#HACK#S",
        "A#AREA#SWEEPER#",
        "T#LEAD#HAMMER##",
        "STONE#BUTTON#DR",
        "#TEES#ICE#PEBBL",
        "###SKIP#WEIGHT#",
        "DRAW#CURL#SLIDE",
        "OUTTURN#INTURNS",
        "RHO#DRAWS#NEATO",
        "##SHAKE#PEEL###",
        "ROARS#EAT#DEER#",
        "HAMMER#SENSE#RA",
        "ICE#BLANK#EXCEL",
        "NUT#LOOSE#PEBBL",
        "GAS#ENDED#SPOON"
      ],
      clues: {
        across: {
          1: "Traditional tournament gathering and social",
          9: "Rubber foothold for push-off delivery",
          10: "Plural suffix indicator",
          11: "Free guard territory on the sheet",
          13: "Athlete vigorously brushing the ice",
          15: "First thrower on a four-person squad",
          17: "Last stone delivery advantage",
          19: "Polished 44-pound granite rock",
          21: "Small central circle of target rings",
          23: "Draw shot abbreviation",
          25: "Target intersection points on ice",
          26: "The frozen playing surface",
          27: "Sprayed water droplets frozen on ice",
          29: "Team strategist directing house play",
          31: "Velocity given to a thrown stone",
          33: "Shot thrown to stop inside scoring rings",
          35: "Curving trajectory of a traveling stone",
          37: "Gliding motion out of the hack",
          38: "Handle rotation away from thrower body",
          40: "Handle rotation toward thrower body",
          42: "Greek letter following pi",
          43: "Non-hitting finesse shots",
          45: "Informal slang for neat or excellent",
          46: "Post-match handshake of sportsmanship",
          48: "Clear guard and shooter out of play",
          50: "Cheering sounds from an arena crowd",
          52: "Sweeper call: 'Brush hard!'",
          54: "Woodland antlered animals",
          57: "Advantage of throwing final stone in end",
          60: "Tactical feel for ice conditions",
          61: "Ancient Egyptian sun deity",
          62: "The frozen playing alley",
          63: "End scored 0-0 to retain hammer",
          65: "Outperform opponents across the match",
          66: "Hardware fastener pairing with a bolt",
          67: "Stones moving freely without guards",
          68: "Water droplet sprayed on ice surface",
          69: "Fuel powering the ice resurfacer",
          70: "Concluded an 8-end match",
          71: "Trophy cup or utensil award"
        },
        down: {
          1: "Footwear grip worn by sweepers",
          2: "Tackle a difficult tactical split",
          3: "Anti-freeze spray for icy paths",
          4: "Pleat in a traditional Scottish kilt",
          5: "Chalk score marks on a board",
          6: "Stone thrown with excessive momentum",
          7: "Appropriate delivery weight",
          8: "Tactical strategic plan from the house",
          9: "Club bar seating furniture",
          12: "Stone resting behind a guard rock",
          14: "Smooth teflon footwear piece",
          16: "Ice technician's alley maintenance",
          18: "Ice sheet temperature readings",
          20: "Smooth gliding motion from the hack",
          22: "Throw with gentle momentum",
          24: "Stone resting right on the button",
          28: "Tournament gathering with banquet",
          30: "Final stone deliverer on team",
          32: "Scoring zero points intentionally",
          34: "Timing device for stone travel",
          36: "Score sheet recorded columns",
          39: "Curler who calls all tactical shots",
          41: "Tactical placement of guards",
          44: "Footwear worn on nonsliding foot",
          47: "Scottish origin country of curling",
          49: "Vibration sound of spinning granite",
          51: "Scottish lake where bonspiels began",
          53: "Teflon plate under slider foot",
          55: "Stone that strikes and stays in rings",
          56: "Curling club locker room area",
          58: "Curling team captain's greeting",
          59: "Score points during opponent hammer",
          64: "Cold temperature rating on sheet"
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