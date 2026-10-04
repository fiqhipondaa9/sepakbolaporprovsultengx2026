/**
 * Knockout Bracket Generation & Advancement Engine
 * PRD: §4.4 Babak Eliminasi (JD-08..17), §4.5 Input Eliminasi (HS-02, HS-03)
 */
import { BEST_THIRD_MAPPING_TABLE, FOUR_GROUP_MAPPING_TABLE, TWO_GROUP_MAPPING_TABLE, verifyOppositeHalfRule } from './oppositeHalf.js';

export const STAGES = {
  QUARTER_FINAL: 'PEREMPAT_FINAL',
  SEMI_FINAL: 'SEMIFINAL',
  BRONZE_FINAL: 'PEREBUTAN_JUARA_3',
  GRAND_FINAL: 'GRAND_FINAL'
};

/**
 * Generate full knockout bracket structure based on group standings
 * @param {Array} groupStandings - Array of { group, letter, standings }
 * @param {Array} bestThirdPlaces - Array of ranked 3rd place teams (for 3 groups)
 * @param {Object} options - dates and venues options
 */
export function generateKnockoutBracket(groupStandings = [], bestThirdPlaces = [], options = {}) {
  const groupCount = groupStandings.length;
  const venues = options.venues || [{ id: 'v1', name: 'Stadion Utama Morowali', city: 'Morowali' }];
  const startDate = options.startDate || '2026-11-18';

  const helperAddDays = (dStr, days) => {
    const [y, m, d] = dStr.split('-').map(Number);
    const date = new Date(y, m - 1, d + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const formatDisplay = (dIso) => {
    const [y, m, d] = dIso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d} ${months[m - 1]} ${y}`;
  };

  // Build slot-to-team map: e.g. '1A' -> team, '2A' -> team, '3A' -> team
  const slotMap = {};
  groupStandings.forEach(g => {
    const letter = g.letter;
    if (g.standings) {
      g.standings.forEach(t => {
        slotMap[`${t.rank}${letter}`] = {
          id: t.id || t.teamId,
          name: t.name,
          code: t.code,
          color: t.color || '#3B82F6',
          originSlot: `${t.rank}${letter}`,
          groupId: letter,
          rankInGroup: t.rank
        };
      });
    }
  });

  const matches = [];

  // SCENARIO A: 3 Groups Format (9-11 teams) -> 8 Teams QF
  if (groupCount === 3) {
    // Determine which 2 groups have qualifying 3rd-place teams
    const qualifyingThirds = bestThirdPlaces.filter(t => t.bestThirdStatus === 'qualify' || t.bestThirdRank <= 2);
    const qualifyingLetters = qualifyingThirds.map(t => t.groupLetter).sort().join('_');
    
    // Fallback key if not exact match (default to 'A_C' or 'A_B')
    const scenarioKey = BEST_THIRD_MAPPING_TABLE[qualifyingLetters] ? qualifyingLetters : 'A_C';
    const mapping = BEST_THIRD_MAPPING_TABLE[scenarioKey];

    const qfDates = [startDate, startDate, helperAddDays(startDate, 1), helperAddDays(startDate, 1)];

    // QF Matches in Half 1
    mapping.half1.forEach((mDef, idx) => {
      const homeTeam = slotMap[mDef.home.slot] || { name: mDef.home.desc, code: mDef.home.slot, slot: mDef.home.slot };
      const awayTeam = slotMap[mDef.away.slot] || { name: mDef.away.desc, code: mDef.away.slot, slot: mDef.away.slot };
      homeTeam.slot = mDef.home.slot;
      awayTeam.slot = mDef.away.slot;

      matches.push({
        id: mDef.id,
        stage: STAGES.QUARTER_FINAL,
        label: mDef.label,
        half: 1,
        dateIso: qfDates[idx],
        date: formatDisplay(qfDates[idx]),
        time: idx % 2 === 0 ? '14:00 WITA' : '16:00 WITA',
        venueId: venues[0].id,
        venueName: venues[0].name,
        homeTeam: { ...homeTeam, score: null, extraTimeScore: null, penaltyScore: null },
        awayTeam: { ...awayTeam, score: null, extraTimeScore: null, penaltyScore: null },
        status: 'SCHEDULED',
        nextMatchId: 'sf1',
        nextSlot: idx === 0 ? 'home' : 'away'
      });
    });

    // QF Matches in Half 2
    mapping.half2.forEach((mDef, idx) => {
      const homeTeam = slotMap[mDef.home.slot] || { name: mDef.home.desc, code: mDef.home.slot, slot: mDef.home.slot };
      const awayTeam = slotMap[mDef.away.slot] || { name: mDef.away.desc, code: mDef.away.slot, slot: mDef.away.slot };
      homeTeam.slot = mDef.home.slot;
      awayTeam.slot = mDef.away.slot;

      matches.push({
        id: mDef.id,
        stage: STAGES.QUARTER_FINAL,
        label: mDef.label,
        half: 2,
        dateIso: qfDates[idx + 2],
        date: formatDisplay(qfDates[idx + 2]),
        time: idx % 2 === 0 ? '14:00 WITA' : '16:00 WITA',
        venueId: venues[0].id,
        venueName: venues[0].name,
        homeTeam: { ...homeTeam, score: null, extraTimeScore: null, penaltyScore: null },
        awayTeam: { ...awayTeam, score: null, extraTimeScore: null, penaltyScore: null },
        status: 'SCHEDULED',
        nextMatchId: 'sf2',
        nextSlot: idx === 0 ? 'home' : 'away'
      });
    });
  } 
  // SCENARIO B: 4 Groups Format -> 8 Teams QF
  else if (groupCount >= 4) {
    const mapping = FOUR_GROUP_MAPPING_TABLE;
    const qfDates = [startDate, startDate, helperAddDays(startDate, 1), helperAddDays(startDate, 1)];

    mapping.half1.forEach((mDef, idx) => {
      const homeTeam = slotMap[mDef.home.slot] || { name: mDef.home.desc, code: mDef.home.slot, slot: mDef.home.slot };
      const awayTeam = slotMap[mDef.away.slot] || { name: mDef.away.desc, code: mDef.away.slot, slot: mDef.away.slot };
      homeTeam.slot = mDef.home.slot;
      awayTeam.slot = mDef.away.slot;

      matches.push({
        id: mDef.id,
        stage: STAGES.QUARTER_FINAL,
        label: mDef.label,
        half: 1,
        dateIso: qfDates[idx],
        date: formatDisplay(qfDates[idx]),
        time: idx % 2 === 0 ? '14:00 WITA' : '16:00 WITA',
        venueId: venues[0].id,
        venueName: venues[0].name,
        homeTeam: { ...homeTeam, score: null, extraTimeScore: null, penaltyScore: null },
        awayTeam: { ...awayTeam, score: null, extraTimeScore: null, penaltyScore: null },
        status: 'SCHEDULED',
        nextMatchId: 'sf1',
        nextSlot: idx === 0 ? 'home' : 'away'
      });
    });

    mapping.half2.forEach((mDef, idx) => {
      const homeTeam = slotMap[mDef.home.slot] || { name: mDef.home.desc, code: mDef.home.slot, slot: mDef.home.slot };
      const awayTeam = slotMap[mDef.away.slot] || { name: mDef.away.desc, code: mDef.away.slot, slot: mDef.away.slot };
      homeTeam.slot = mDef.home.slot;
      awayTeam.slot = mDef.away.slot;

      matches.push({
        id: mDef.id,
        stage: STAGES.QUARTER_FINAL,
        label: mDef.label,
        half: 2,
        dateIso: qfDates[idx + 2],
        date: formatDisplay(qfDates[idx + 2]),
        time: idx % 2 === 0 ? '14:00 WITA' : '16:00 WITA',
        venueId: venues[0].id,
        venueName: venues[0].name,
        homeTeam: { ...homeTeam, score: null, extraTimeScore: null, penaltyScore: null },
        awayTeam: { ...awayTeam, score: null, extraTimeScore: null, penaltyScore: null },
        status: 'SCHEDULED',
        nextMatchId: 'sf2',
        nextSlot: idx === 0 ? 'home' : 'away'
      });
    });
  }

  // SEMIFINALS (SF 1 & SF 2)
  const sfDate = helperAddDays(startDate, groupCount >= 3 ? 3 : 0);
  matches.push({
    id: 'sf1',
    stage: STAGES.SEMI_FINAL,
    label: 'Semifinal 1',
    half: 1,
    dateIso: sfDate,
    date: formatDisplay(sfDate),
    time: '14:00 WITA',
    venueId: venues[0].id,
    venueName: venues[0].name,
    homeTeam: groupCount === 2 && slotMap['1A'] ? slotMap['1A'] : { name: 'Pemenang QF 1', code: 'W-QF1', isPlaceholder: true },
    awayTeam: groupCount === 2 && slotMap['2B'] ? slotMap['2B'] : { name: 'Pemenang QF 2', code: 'W-QF2', isPlaceholder: true },
    status: 'SCHEDULED',
    nextMatchId: 'final',
    nextSlot: 'home',
    loserNextMatchId: 'bronze',
    loserNextSlot: 'home'
  });

  matches.push({
    id: 'sf2',
    stage: STAGES.SEMI_FINAL,
    label: 'Semifinal 2',
    half: 2,
    dateIso: sfDate,
    date: formatDisplay(sfDate),
    time: '16:00 WITA',
    venueId: venues[0].id,
    venueName: venues[0].name,
    homeTeam: groupCount === 2 && slotMap['1B'] ? slotMap['1B'] : { name: 'Pemenang QF 3', code: 'W-QF3', isPlaceholder: true },
    awayTeam: groupCount === 2 && slotMap['2A'] ? slotMap['2A'] : { name: 'Pemenang QF 4', code: 'W-QF4', isPlaceholder: true },
    status: 'SCHEDULED',
    nextMatchId: 'final',
    nextSlot: 'away',
    loserNextMatchId: 'bronze',
    loserNextSlot: 'away'
  });

  // PEREBUTAN JUARA 3 (BRONZE MEDAL - JD-10) - Langsung hari berikutnya setelah semifinal (tanpa jeda)
  const bronzeDate = helperAddDays(sfDate, 1);
  matches.push({
    id: 'bronze',
    stage: STAGES.BRONZE_FINAL,
    label: 'Perebutan Juara 3 (Medali Perunggu)',
    dateIso: bronzeDate,
    date: formatDisplay(bronzeDate),
    time: '14:00 WITA',
    venueId: venues[0].id,
    venueName: venues[0].name,
    homeTeam: { name: 'Kalah Semifinal 1', code: 'L-SF1', isPlaceholder: true },
    awayTeam: { name: 'Kalah Semifinal 2', code: 'L-SF2', isPlaceholder: true },
    status: 'SCHEDULED'
  });

  // GRAND FINAL (EMAS & PERAK)
  const finalDate = bronzeDate;
  matches.push({
    id: 'final',
    stage: STAGES.GRAND_FINAL,
    label: 'Grand Final (Medali Emas & Perak)',
    dateIso: finalDate,
    date: formatDisplay(finalDate),
    time: '16:00 WITA',
    venueId: venues[0].id,
    venueName: venues[0].name,
    homeTeam: { name: 'Pemenang Semifinal 1', code: 'W-SF1', isPlaceholder: true },
    awayTeam: { name: 'Pemenang Semifinal 2', code: 'W-SF2', isPlaceholder: true },
    status: 'SCHEDULED'
  });

  const oppositeRuleVerification = verifyOppositeHalfRule(matches.filter(m => m.stage === STAGES.QUARTER_FINAL));

  return {
    success: true,
    matches,
    totalKnockoutMatches: matches.length,
    startDate,
    finalDate,
    oppositeRuleVerification
  };
}

/**
 * Handle match advancement when knockout match result is input
 * Supports normal time, extra time (HS-02), and penalty shootout (HS-03)
 */
export function advanceKnockoutMatch(allKnockoutMatches = [], matchId, scoreData = {}) {
  const matchesMap = {};
  allKnockoutMatches.forEach(m => { matchesMap[m.id] = { ...m }; });

  const active = matchesMap[matchId];
  if (!active) throw new Error(`Pertandingan knockout dengan ID ${matchId} tidak ditemukan.`);

  const {
    homeScore = 0,
    awayScore = 0,
    isExtraTime = false,
    homeExtraScore = 0,
    awayExtraScore = 0,
    isPenalty = false,
    homePenaltyScore = 0,
    awayPenaltyScore = 0
  } = scoreData;

  // Determine winner & loser
  let homeWon = false;

  if (isPenalty) {
    if (homePenaltyScore === awayPenaltyScore) {
      throw new Error('Skor adu penalti babak eliminasi tidak boleh imbang!');
    }
    homeWon = homePenaltyScore > awayPenaltyScore;
  } else if (isExtraTime) {
    if (homeExtraScore === awayExtraScore) {
      throw new Error('Hasil imbang pada extra time memerlukan adu penalti (HS-03)!');
    }
    homeWon = homeExtraScore > awayExtraScore;
  } else {
    if (homeScore === awayScore) {
      throw new Error('Hasil imbang pada babak eliminasi memerlukan perpanjangan waktu atau adu penalti!');
    }
    homeWon = homeScore > awayScore;
  }

  const winner = homeWon ? { ...active.homeTeam } : { ...active.awayTeam };
  const loser = homeWon ? { ...active.awayTeam } : { ...active.homeTeam };

  // Update active match details
  active.homeTeam.score = homeScore;
  active.awayTeam.score = awayScore;
  active.isExtraTime = isExtraTime;
  active.isPenalty = isPenalty;
  if (isExtraTime) {
    active.homeTeam.extraTimeScore = homeExtraScore;
    active.awayTeam.extraTimeScore = awayExtraScore;
  }
  if (isPenalty) {
    active.homeTeam.penaltyScore = homePenaltyScore;
    active.awayTeam.penaltyScore = awayPenaltyScore;
  }
  active.winnerTeam = winner;
  active.loserTeam = loser;
  active.status = 'FINISHED';
  active.goals = scoreData.goals || active.goals || [];
  active.cards = scoreData.cards || active.cards || [];
  active.substitutions = scoreData.substitutions || active.substitutions || [];

  // Advance winner to next round
  if (active.nextMatchId && matchesMap[active.nextMatchId]) {
    const nextMatch = matchesMap[active.nextMatchId];
    if (active.nextSlot === 'home') {
      nextMatch.homeTeam = { ...winner };
    } else {
      nextMatch.awayTeam = { ...winner };
    }
  }

  // Advance loser to 3rd place match if from Semifinal
  if (active.loserNextMatchId && matchesMap[active.loserNextMatchId]) {
    const bronzeMatch = matchesMap[active.loserNextMatchId];
    if (active.loserNextSlot === 'home') {
      bronzeMatch.homeTeam = { ...loser };
    } else {
      bronzeMatch.awayTeam = { ...loser };
    }
  }

  return {
    updatedMatches: Object.values(matchesMap),
    winner,
    loser,
    isFinalFinished: matchId === 'final'
  };
}
