/**
 * Berger Table - Round Robin Scheduling Algorithm
 * PRD: §9.2 Algoritma Berger Table, §4.4 Penyusunan Jadwal (JD-02)
 */

/**
 * Generate pairwise round-robin matches for a group using the Berger Table (Polygon rotation)
 * @param {string} groupLetter - Group identifier (e.g. 'A', 'B')
 * @param {Array} teams - Array of team objects in this group
 * @returns {Array} Array of match objects with round/matchday, homeTeam, awayTeam
 */
export function generateRoundRobinMatches(groupLetter, teams) {
  if (!teams || teams.length < 2) return [];

  const teamList = [...teams];
  const isOdd = teamList.length % 2 !== 0;

  // If odd number of teams (e.g. 3 teams), add a dummy BYE team for resting rotation
  if (isOdd) {
    teamList.push({ id: '__BYE__', name: 'BYE (Istirahat)', isBye: true });
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const half = numTeams / 2;
  const matches = [];

  // Track alternating home/away balance
  const rotation = [...teamList];

  for (let round = 1; round <= numRounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = rotation[i];
      const away = rotation[numTeams - 1 - i];

      // Skip the virtual BYE match
      if (home.isBye || away.isBye) {
        continue;
      }

      // Alternate home/away to maintain balance
      const isEvenRound = round % 2 === 0;
      const actualHome = (i === 0 && isEvenRound) ? away : home;
      const actualAway = (i === 0 && isEvenRound) ? home : away;

      matches.push({
        id: `match_${groupLetter.toLowerCase()}_r${round}_${actualHome.id}_vs_${actualAway.id}`,
        stage: `Penyisihan Grup ${groupLetter}`,
        groupId: groupLetter,
        round: round,
        matchday: round,
        homeTeam: {
          id: actualHome.id,
          name: actualHome.name,
          code: actualHome.code,
          color: actualHome.color,
          score: null
        },
        awayTeam: {
          id: actualAway.id,
          name: actualAway.name,
          code: actualAway.code,
          color: actualAway.color,
          score: null
        },
        status: 'SCHEDULED', // SCHEDULED, LIVE, FINISHED, POSTPONED, WALKOVER
        isFinished: false,
        venueId: null,
        venueName: null,
        date: null,
        time: null,
        goals: [],
        cards: [],
        substitutions: []
      });
    }

    // Rotate elements (keep first fixed, rotate rest clockwise)
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    const last = rest.pop();
    rest.unshift(last);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  return matches;
}
