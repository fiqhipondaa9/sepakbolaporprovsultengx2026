/**
 * Opposite Half Rule & Knockout Bracket Mapping Engine
 * PRD: §4.4 Babak Eliminasi (JD-08..17), §9.4 Bracket Mapping & Opposite Half Rule
 */

/**
 * 3-Group Best 3rd Place Lookup Table (PRD §4.4 & §9.4)
 * Guarantee: 1X and 2X from same group are ALWAYS in opposite bracket halves!
 * 
 * Half 1 (Separuh 1 → Semifinal 1): QF-1 & QF-2
 * Half 2 (Separuh 2 → Semifinal 2): QF-3 & QF-4
 */
export const BEST_THIRD_MAPPING_TABLE = {
  // Scenario 1: Best 3rd from Group A and Group B
  'A_B': {
    half1: [
      { id: 'qf1', label: 'QF 1', home: { slot: '1A', desc: 'Juara Grup A' }, away: { slot: '3B', desc: 'Peringkat 3 Grup B' } },
      { id: 'qf2', label: 'QF 2', home: { slot: '1C', desc: 'Juara Grup C' }, away: { slot: '2B', desc: 'Runner-up Grup B' } }
    ],
    half2: [
      { id: 'qf3', label: 'QF 3', home: { slot: '1B', desc: 'Juara Grup B' }, away: { slot: '3A', desc: 'Peringkat 3 Grup A' } },
      { id: 'qf4', label: 'QF 4', home: { slot: '2A', desc: 'Runner-up Grup A' }, away: { slot: '2C', desc: 'Runner-up Grup C' } }
    ]
  },

  // Scenario 2: Best 3rd from Group A and Group C
  'A_C': {
    half1: [
      { id: 'qf1', label: 'QF 1', home: { slot: '1A', desc: 'Juara Grup A' }, away: { slot: '2B', desc: 'Runner-up Grup B' } },
      { id: 'qf2', label: 'QF 2', home: { slot: '1C', desc: 'Juara Grup C' }, away: { slot: '3A', desc: 'Peringkat 3 Grup A' } }
    ],
    half2: [
      { id: 'qf3', label: 'QF 3', home: { slot: '1B', desc: 'Juara Grup B' }, away: { slot: '3C', desc: 'Peringkat 3 Grup C' } },
      { id: 'qf4', label: 'QF 4', home: { slot: '2A', desc: 'Runner-up Grup A' }, away: { slot: '2C', desc: 'Runner-up Grup C' } }
    ]
  },

  // Scenario 3: Best 3rd from Group B and Group C
  'B_C': {
    half1: [
      { id: 'qf1', label: 'QF 1', home: { slot: '1A', desc: 'Juara Grup A' }, away: { slot: '2B', desc: 'Runner-up Grup B' } },
      { id: 'qf2', label: 'QF 2', home: { slot: '1C', desc: 'Juara Grup C' }, away: { slot: '3B', desc: 'Peringkat 3 Grup B' } }
    ],
    half2: [
      { id: 'qf3', label: 'QF 3', home: { slot: '1B', desc: 'Juara Grup B' }, away: { slot: '3C', desc: 'Peringkat 3 Grup C' } },
      { id: 'qf4', label: 'QF 4', home: { slot: '2A', desc: 'Runner-up Grup A' }, away: { slot: '2C', desc: 'Runner-up Grup C' } }
    ]
  }
};

/**
 * 4-Group Format Mapping Table (12-16 teams, 8 qualify)
 * Half 1 (→ SF 1): QF 1 (1A vs 2C), QF 2 (1B vs 2D)
 * Half 2 (→ SF 2): QF 3 (1C vs 2A), QF 4 (1D vs 2B)
 * All 1X and 2X are strictly in opposite bracket halves!
 */
export const FOUR_GROUP_MAPPING_TABLE = {
  half1: [
    { id: 'qf1', label: 'QF 1', home: { slot: '1A', desc: 'Juara Grup A' }, away: { slot: '2C', desc: 'Runner-up Grup C' } },
    { id: 'qf2', label: 'QF 2', home: { slot: '1B', desc: 'Juara Grup B' }, away: { slot: '2D', desc: 'Runner-up Grup D' } }
  ],
  half2: [
    { id: 'qf3', label: 'QF 3', home: { slot: '1C', desc: 'Juara Grup C' }, away: { slot: '2A', desc: 'Runner-up Grup A' } },
    { id: 'qf4', label: 'QF 4', home: { slot: '1D', desc: 'Juara Grup D' }, away: { slot: '2B', desc: 'Runner-up Grup B' } }
  ]
};

/**
 * 2-Group Format Mapping Table (4 qualify to SF)
 * SF 1: 1A vs 2B
 * SF 2: 1B vs 2A
 */
export const TWO_GROUP_MAPPING_TABLE = [
  { id: 'sf1', label: 'Semifinal 1', home: { slot: '1A', desc: 'Juara Grup A' }, away: { slot: '2B', desc: 'Runner-up Grup B' } },
  { id: 'sf2', label: 'Semifinal 2', home: { slot: '1B', desc: 'Juara Grup B' }, away: { slot: '2A', desc: 'Runner-up Grup A' } }
];

/**
 * Validates that Opposite Half Rule is strictly satisfied:
 * For every group X, 1X and 2X must NOT be in the same half.
 * @param {Array} qfMatches - Array of QF matches with half indicator (1 or 2) and team source slots
 * @returns {Object} validation report
 */
export function verifyOppositeHalfRule(qfMatches = []) {
  const groupPlacements = {}; // 'A' -> { 1: halfNum, 2: halfNum }

  qfMatches.forEach(m => {
    const half = m.half || (m.id === 'qf1' || m.id === 'qf2' ? 1 : 2);
    
    [m.homeTeam, m.awayTeam].forEach(team => {
      const slot = team?.slot || team?.originSlot;
      if (slot && slot.length >= 2) {
        const rank = slot[0]; // '1', '2', '3'
        const groupLetter = slot[1]; // 'A', 'B', 'C', 'D'
        if (!groupPlacements[groupLetter]) {
          groupPlacements[groupLetter] = {};
        }
        groupPlacements[groupLetter][rank] = half;
      }
    });
  });

  const checks = [];
  let isCompliant = true;

  Object.keys(groupPlacements).sort().forEach(groupLetter => {
    const p = groupPlacements[groupLetter];
    const half1st = p['1'];
    const half2nd = p['2'];

    if (half1st !== undefined && half2nd !== undefined) {
      const passed = half1st !== half2nd;
      if (!passed) isCompliant = false;
      checks.push({
        group: groupLetter,
        firstPlaceHalf: `Separuh ${half1st}`,
        secondPlaceHalf: `Separuh ${half2nd}`,
        passed,
        message: passed 
          ? `Grup ${groupLetter}: Juara (Paruh ${half1st}) dan Runner-up (Paruh ${half2nd}) terpisah di bagan berlawanan.` 
          : `Grup ${groupLetter}: PELANGGARAN! Juara dan Runner-up berada di paruh bagan yang sama.`
      });
    }
  });

  return {
    isCompliant,
    checks,
    ruleName: 'Opposite Half Rule (JD-16, JD-17)'
  };
}
