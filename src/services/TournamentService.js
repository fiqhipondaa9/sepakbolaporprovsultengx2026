/**
 * Tournament Service
 * PRD: §4.8 AD-06 (Reset), AD-07 (Pengaturan)
 */
import { getDocById, saveDoc, removeDoc, getCollectionDocs, clearCollection } from '../firebase/firestore.js';
import { TOURNAMENT_INFO, DEFAULT_TEAMS, MOCK_STANDINGS, MOCK_RECENT_MATCHES } from '../data/mockData.js';

const COLLECTION = 'tournament';
const DOC_ID = 'info';

export const TournamentService = {
  async getInfo() {
    const doc = await getDocById(COLLECTION, DOC_ID);
    if (doc) return doc;

    // Seed default
    return await saveDoc(COLLECTION, DOC_ID, {
      ...TOURNAMENT_INFO,
      teamsPerGroupAdvance: 2,
      cardAccumulationLimit: 2,
      resetCardsAtStage: 'semifinal',
      status: 'PREPARATION', // PREPARATION, DRAWING, GROUP_STAGE, KNOCKOUT, FINISHED
      createdAt: new Date().toISOString()
    });
  },

  async updateInfo(fields) {
    return await saveDoc(COLLECTION, DOC_ID, fields);
  },

  /**
   * Reset all tournament data to fresh state (PRD AD-06)
   */
  async resetTournament() {
    const collectionsToClear = [
      'matches', 
      'knockout_matches',
      'goals', 
      'cards', 
      'substitutions', 
      'groups', 
      'drawHistory', 
      'standings'
    ];

    for (const col of collectionsToClear) {
      await clearCollection(col);
    }

    await removeDoc('tournament', 'bracket_state');
    await removeDoc('tournament', 'winners');

    // Reset tournament state back to PREPARATION
    await this.updateInfo({
      status: 'PREPARATION',
      startDate: '2026-12-01',
      groupStageEndDate: null,
      finalDate: '2026-12-14',
      totalDurationDays: null,
      lastResetAt: new Date().toISOString()
    });

    // Re-seed teams with unassigned groups
    const teams = await getCollectionDocs('teams');
    for (const team of teams) {
      await saveDoc('teams', team.id, {
        ...team,
        groupId: null,
        groupSlot: null
      });
    }

    return true;
  }
};
