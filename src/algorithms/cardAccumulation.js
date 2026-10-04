/**
 * Disciplinary Card Accumulation & Suspension Engine
 * PRD: §5.2 Akumulasi Kartu & Suspensi (AK-01..06)
 */

export const SUSPENSION_STATUS = {
  CLEAR: 'CLEAR',               // Bebas sanksi / aman
  AT_RISK: 'AT_RISK',           // Terancam akumulasi (1 kartu lagi disanksi) (AK-04)
  SUSPENDED: 'SUSPENDED'        // Terkena skorsing / dilarang bertanding (AK-02, AK-03)
};

/**
 * Process all match cards and calculate disciplinary status per player
 * @param {Array} cards - All card events [{ id, playerId, playerName, teamId, teamName, type, matchId, matchStage, isReset }]
 * @param {Object} options - { yellowThreshold: 2, enableResetAtSemifinal: true }
 */
export function computeCardAccumulation(cards = [], options = {}) {
  const yellowThreshold = options.yellowThreshold !== undefined ? options.yellowThreshold : 2;
  const playerStats = {};

  cards.forEach(card => {
    // If card was already wiped via semifinal amnesty/pemutihan (AK-06)
    if (card.isWiped) return;

    const pId = card.playerId || card.playerName;
    if (!playerStats[pId]) {
      playerStats[pId] = {
        playerId: pId,
        playerName: card.playerName || 'Pemain',
        teamId: card.teamId,
        teamName: card.teamName || 'Tim',
        yellowCards: 0,
        secondYellowCards: 0,
        redCards: 0,
        totalCards: 0,
        fairPlayPenalty: 0,
        status: SUSPENSION_STATUS.CLEAR,
        suspensionReason: '',
        matchesBanned: 0,
        cardHistory: []
      };
    }

    const stat = playerStats[pId];
    stat.totalCards += 1;
    stat.cardHistory.push(card);

    if (card.type === 'yellow') {
      stat.yellowCards += 1;
      stat.fairPlayPenalty += 1;
    } else if (card.type === 'second_yellow') {
      stat.secondYellowCards += 1;
      stat.fairPlayPenalty += 3;
    } else if (card.type === 'red') {
      stat.redCards += 1;
      stat.fairPlayPenalty += 4;
    }
  });

  const playersList = Object.values(playerStats);

  // Evaluate suspension status for each player
  playersList.forEach(p => {
    if (p.redCards > 0 || p.secondYellowCards > 0) {
      p.status = SUSPENSION_STATUS.SUSPENDED;
      p.matchesBanned = p.redCards > 0 ? 1 : 1;
      p.suspensionReason = p.redCards > 0 
        ? 'Sanksi Kartu Merah Langsung (AK-03)' 
        : 'Sanksi Kartu Kuning Kedua (Kartu Merah Tidak Langsung)';
    } else if (p.yellowCards >= yellowThreshold) {
      p.status = SUSPENSION_STATUS.SUSPENDED;
      p.matchesBanned = 1;
      p.suspensionReason = `Akumulasi ${p.yellowCards} Kartu Kuning (Batas: ${yellowThreshold}) (AK-02)`;
    } else if (p.yellowCards === yellowThreshold - 1) {
      p.status = SUSPENSION_STATUS.AT_RISK;
      p.suspensionReason = `Mengantongi 1 Kartu Kuning (Terancam Skorsing) (AK-04)`;
    } else {
      p.status = SUSPENSION_STATUS.CLEAR;
    }
  });

  // Sort: Suspended first, then At-Risk, then by total cards
  playersList.sort((a, b) => {
    const priority = { [SUSPENSION_STATUS.SUSPENDED]: 1, [SUSPENSION_STATUS.AT_RISK]: 2, [SUSPENSION_STATUS.CLEAR]: 3 };
    if (priority[a.status] !== priority[b.status]) {
      return priority[a.status] - priority[b.status];
    }
    return b.totalCards - a.totalCards;
  });

  const suspendedPlayers = playersList.filter(p => p.status === SUSPENSION_STATUS.SUSPENDED);
  const atRiskPlayers = playersList.filter(p => p.status === SUSPENSION_STATUS.AT_RISK);

  return {
    players: playersList,
    suspendedPlayers,
    atRiskPlayers,
    totalCardsCount: cards.length,
    yellowThreshold,
    summary: {
      totalPlayersWithCards: playersList.length,
      totalSuspended: suspendedPlayers.length,
      totalAtRisk: atRiskPlayers.length
    }
  };
}

/**
 * Apply Semifinal Yellow Card Reset / Pemutihan (AK-06)
 * In accordance with PSSI & FIFA regulations, single yellow cards accumulated
 * before semifinals are wiped clean so that a player won't miss the Grand Final 
 * because of a single yellow card in the SF.
 * NOTE: Active suspensions (red cards or 2nd yellow in QF) are NOT wiped.
 */
export function applySemifinalCardReset(allCards = [], options = {}) {
  const yellowThreshold = options.yellowThreshold !== undefined ? options.yellowThreshold : 2;

  // Count yellow cards per player
  const yellowCounts = {};
  allCards.forEach(c => {
    if (c.type === 'yellow' && (!c.matchStage || (c.matchStage !== 'SEMIFINAL' && c.matchStage !== 'GRAND_FINAL'))) {
      const pId = c.playerId || c.playerName;
      yellowCounts[pId] = (yellowCounts[pId] || 0) + 1;
    }
  });

  return allCards.map(c => {
    const pId = c.playerId || c.playerName;
    // Only wipe single yellow cards that did not reach suspension threshold
    if (c.type === 'yellow' && (!c.matchStage || (c.matchStage !== 'SEMIFINAL' && c.matchStage !== 'GRAND_FINAL'))) {
      if ((yellowCounts[pId] || 0) < yellowThreshold) {
        return {
          ...c,
          isWiped: true,
          wipedReason: 'Pemutihan Kartu Kuning Babak Semifinal (AK-06)'
        };
      }
    }
    return c;
  });
}
