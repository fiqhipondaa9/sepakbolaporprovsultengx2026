/**
 * Tournament Group Drawing Algorithm
 * PRD: §4.1 Pengundian Peserta (DR-01..08), §4.2 Fitur Seeded (SD-01..06), §9.1 Algoritma Pengundian
 */
import { shuffleArray } from './shuffle.js';

export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Execute Group Draw
 * @param {Array} teams - List of all participant team objects
 * @param {number} groupCount - Number of groups (2 to 8, default 4)
 * @param {string} seededMode - 'ranked' (Seed 1 to A1, Seed 2 to B1...) or 'random' (randomly allocate seeds to Slot 1)
 */
export function executeGroupDraw(teams, groupCount = 4, seededMode = 'ranked') {
  if (!teams || teams.length < groupCount) {
    throw new Error(`Jumlah tim (${teams.length}) tidak boleh kurang dari jumlah grup (${groupCount}).`);
  }

  // Identify seeded & non-seeded teams
  const seeded = teams.filter(t => t.isSeeded).sort((a, b) => (a.seedRank || 99) - (b.seedRank || 99));
  const nonSeeded = teams.filter(t => !t.isSeeded);

  // Validation: seeded count cannot exceed group count (PRD SD-02)
  if (seeded.length > groupCount) {
    throw new Error(`Jumlah tim seeded (${seeded.length}) melebihi jumlah grup (${groupCount}). Maksimal ${groupCount} tim seeded.`);
  }

  // Initialize group structures
  const groups = {};
  const drawSequence = []; // Steps for step-by-step animated reveal

  for (let i = 0; i < groupCount; i++) {
    const letter = GROUP_LETTERS[i];
    groups[letter] = {
      letter,
      order: i + 1,
      name: `Grup ${letter}`,
      teams: []
    };
  }

  // 1. Assign Seeded Teams to Slot 1 of each group (PRD SD-03, SD-04)
  let orderedSeeds = [...seeded];
  if (seededMode === 'random') {
    orderedSeeds = shuffleArray(orderedSeeds);
  }

  orderedSeeds.forEach((team, index) => {
    const groupLetter = GROUP_LETTERS[index];
    const slotCode = `${groupLetter}1`;
    const assignedTeam = {
      ...team,
      groupId: groupLetter,
      groupSlot: slotCode,
      drawOrder: drawSequence.length + 1,
      isSeededSlot: true
    };

    groups[groupLetter].teams.push(assignedTeam);
    drawSequence.push({
      step: drawSequence.length + 1,
      type: 'SEEDED',
      team: assignedTeam,
      groupLetter,
      slotCode,
      message: `${team.name} ditempatkan pada slot unggulan ${slotCode}`
    });
  });

  // 2. Shuffle Non-Seeded Teams (Fisher-Yates) (PRD DR-01)
  const shuffledNonSeeded = shuffleArray(nonSeeded);

  // 3. Distribute Non-Seeded Teams evenly across groups (PRD DR-03)
  // Determine target slots
  let currentGroupIdx = 0;

  shuffledNonSeeded.forEach((team) => {
    // Find group with minimum teams to maintain balance
    let targetLetter = null;
    let minLength = Infinity;

    for (let i = 0; i < groupCount; i++) {
      const idx = (currentGroupIdx + i) % groupCount;
      const letter = GROUP_LETTERS[idx];
      const count = groups[letter].teams.length;
      if (count < minLength) {
        minLength = count;
        targetLetter = letter;
      }
    }

    if (!targetLetter) {
      targetLetter = GROUP_LETTERS[currentGroupIdx];
    }
    const chosenIdx = GROUP_LETTERS.indexOf(targetLetter);
    currentGroupIdx = (chosenIdx + 1) % groupCount;

    const slotIndex = groups[targetLetter].teams.length + 1;
    const slotCode = `${targetLetter}${slotIndex}`;
    const assignedTeam = {
      ...team,
      groupId: targetLetter,
      groupSlot: slotCode,
      drawOrder: drawSequence.length + 1,
      isSeededSlot: false
    };

    groups[targetLetter].teams.push(assignedTeam);
    drawSequence.push({
      step: drawSequence.length + 1,
      type: 'REGULAR',
      team: assignedTeam,
      groupLetter: targetLetter,
      slotCode,
      message: `${team.name} terundi ke ${groups[targetLetter].name} (${slotCode})`
    });
  });

  return {
    success: true,
    totalTeams: teams.length,
    groupCount,
    groups,
    drawSequence,
    timestamp: new Date().toISOString()
  };
}
