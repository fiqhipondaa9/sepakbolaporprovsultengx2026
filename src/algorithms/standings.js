/**
 * Standings Calculation & PSSI 6-Level Tie-Breaker Algorithm
 * PRD: §4.3 Perhitungan Otomatis Klasemen (KL-01..07), §9.3 Algoritma Perhitungan Klasemen
 */

/**
 * Calculate standing table for a specific group based on matches and cards
 * @param {string} groupId - Group identifier (e.g. 'A')
 * @param {Array} teams - Teams in this group
 * @param {Array} matches - Group matches (with scores)
 * @param {Array} cards - Disciplinary cards for fair play points
 * @param {number} qualifyCount - Number of teams advancing (default 2)
 */
export function calculateGroupStandings(groupId, teams = [], matches = [], cards = [], qualifyCount = 2) {
  // 1. Initialize stats per team
  const statsMap = {};

  teams.forEach(team => {
    statsMap[team.id] = {
      id: team.id,
      teamId: team.id,
      name: team.name,
      code: team.code,
      color: team.color,
      groupId,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      gf: 0, // Gol Memasukkan
      ga: 0, // Gol Kemasukan
      gd: 0, // Selisih Gol
      pts: 0, // Poin
      fairPlayPoints: 0, // Nilai kedisiplinan
      rank: 1,
      status: 'eliminate' // qualify, playoff, eliminate
    };
  });

  // Helper to resolve team within this group's statsMap
  const findTeamInGroup = (tObj) => {
    if (!tObj) return null;
    if (tObj.id && statsMap[tObj.id]) return statsMap[tObj.id];
    if (tObj.teamId && statsMap[tObj.teamId]) return statsMap[tObj.teamId];
    if (tObj.code) {
      const match = Object.values(statsMap).find(t => t.code && t.code.toUpperCase() === tObj.code.toUpperCase());
      if (match) return match;
    }
    if (tObj.name) {
      const match = Object.values(statsMap).find(t => t.name && t.name.trim().toLowerCase() === tObj.name.trim().toLowerCase());
      if (match) return match;
    }
    return null;
  };

  // 2. Accumulate match results (including FINISHED, WALKOVER, and LIVE matches with scores)
  const activeMatches = matches.filter(m => {
    const isCountable = (m.status === 'FINISHED' || m.status === 'WALKOVER' || m.status === 'LIVE');
    if (!isCountable) return false;
    if (m.homeTeam?.score === null || m.homeTeam?.score === undefined ||
        m.awayTeam?.score === null || m.awayTeam?.score === undefined) {
      return false;
    }
    const matchGroup = m.groupId || (m.stage && m.stage.match(/Grup\s+([A-D])/i)?.[1]);
    const homeInGroup = findTeamInGroup(m.homeTeam);
    const awayInGroup = findTeamInGroup(m.awayTeam);

    return matchGroup === groupId || (homeInGroup && awayInGroup) || homeInGroup || awayInGroup;
  });

  activeMatches.forEach(m => {
    const home = findTeamInGroup(m.homeTeam);
    const away = findTeamInGroup(m.awayTeam);

    const hs = parseInt(m.homeTeam.score, 10);
    const as = parseInt(m.awayTeam.score, 10);
    if (isNaN(hs) || isNaN(as)) return;

    if (home) {
      home.played += 1;
      home.gf += hs;
      home.ga += as;
      if (hs > as) {
        home.won += 1;
        home.pts += 3;
      } else if (hs === as) {
        home.draw += 1;
        home.pts += 1;
      } else {
        home.lost += 1;
      }
    }

    if (away) {
      away.played += 1;
      away.gf += as;
      away.ga += hs;
      if (as > hs) {
        away.won += 1;
        away.pts += 3;
      } else if (as === hs) {
        away.draw += 1;
        away.pts += 1;
      } else {
        away.lost += 1;
      }
    }
  });

  // 3. Calculate Goal Difference and Fair Play Points
  // PSSI Disciplinary: Yellow card = -1, Two yellow / indirect red = -3, Direct red = -4
  const groupCards = cards.filter(c => c.groupId === groupId);
  groupCards.forEach(c => {
    const team = statsMap[c.teamId] || Object.values(statsMap).find(t => t.name === c.teamName || t.code === c.teamCode);
    if (team) {
      if (c.type === 'yellow') team.fairPlayPoints -= 1;
      else if (c.type === 'red') team.fairPlayPoints -= 4;
      else if (c.type === 'second_yellow') team.fairPlayPoints -= 3;
    }
  });

  Object.values(statsMap).forEach(t => {
    t.gd = t.gf - t.ga;
  });

  // 4. Sort with PSSI 6-Level Tie-Breaker (PRD §9.3)
  const sorted = Object.values(statsMap).sort((a, b) => {
    // Level 1: Total Points
    if (b.pts !== a.pts) return b.pts - a.pts;

    // Level 2: Head-to-Head (H2H) between tied teams
    const h2hMatch = activeMatches.find(m => {
      const hTeam = findTeamInGroup(m.homeTeam);
      const aTeam = findTeamInGroup(m.awayTeam);
      return (hTeam?.id === a.teamId && aTeam?.id === b.teamId) ||
             (hTeam?.id === b.teamId && aTeam?.id === a.teamId);
    });

    if (h2hMatch) {
      const hTeam = findTeamInGroup(h2hMatch.homeTeam);
      const aScore = hTeam?.id === a.teamId ? h2hMatch.homeTeam.score : h2hMatch.awayTeam.score;
      const bScore = hTeam?.id === b.teamId ? h2hMatch.homeTeam.score : h2hMatch.awayTeam.score;

      // 2a: H2H Points
      if (aScore > bScore) return -1;
      if (bScore > aScore) return 1;

      // 2b: H2H Goal Diff
      const h2hGD = (aScore - bScore);
      if (h2hGD !== 0) return bScore - aScore;

      // 2c: H2H Goals Scored
      if (aScore !== bScore) return bScore - aScore;
    }

    // Level 3: Overall Goal Difference
    if (b.gd !== a.gd) return b.gd - a.gd;

    // Level 4: Overall Goals Scored (GM)
    if (b.gf !== a.gf) return b.gf - a.gf;

    // Level 5: Fair Play points (closer to 0 is better, e.g. -1 > -4)
    if (b.fairPlayPoints !== a.fairPlayPoints) return b.fairPlayPoints - a.fairPlayPoints;

    // Level 6: Alphabetical / Seeded priority
    return (a.seedRank || 99) - (b.seedRank || 99);
  });

  // 5. Assign ranks and qualification status (KL-03)
  sorted.forEach((t, idx) => {
    t.rank = idx + 1;
    if (t.rank <= qualifyCount) {
      t.status = 'qualify'; // Lolos Perempat Final
    } else if (t.rank === 3) {
      t.status = 'playoff'; // Peringkat 3 (potensi best 3rd)
    } else {
      t.status = 'eliminate';
    }
  });

  return sorted;
}
