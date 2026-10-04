/**
 * Match Service
 * PRD: §4.4 Penyusunan Jadwal (JD-01..07), §4.5 Input Hasil (HS-01..06)
 */
import { getCollectionDocs, getDocById, saveDoc, modifyDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'matches';

export const MatchService = {
  async getAll() {
    const rawMatches = await getCollectionDocs(COLLECTION);
    const hasOfficialBerger = rawMatches.some(m => m.id && m.id.startsWith('match_'));

    let filtered = rawMatches;
    if (hasOfficialBerger) {
      filtered = rawMatches.filter(m => !(m.id && m.id.match(/^m\d+$/)));
    }

    return filtered.map(m => {
      if (!m.groupId && m.stage) {
        const matchG = m.stage.match(/Grup\s+([A-D])/i);
        if (matchG) m.groupId = matchG[1].toUpperCase();
      }
      return m;
    });
  },

  async getById(id) {
    return await getDocById(COLLECTION, id);
  },

  async getByStage(stage) {
    const all = await this.getAll();
    return all.filter(m => m.stage === stage);
  },

  async getByGroup(groupId) {
    const all = await this.getAll();
    return all.filter(m => m.groupId === groupId);
  },

  async saveMatch(matchData) {
    const id = matchData.id || 'm_' + Date.now();
    return await saveDoc(COLLECTION, id, matchData);
  },

  async updateScore(matchId, scoreData) {
    return await modifyDoc(COLLECTION, matchId, {
      ...scoreData,
      status: scoreData.status || 'FINISHED',
      finishedAt: new Date().toISOString()
    });
  },

  async deleteMatch(id) {
    return await removeDoc(COLLECTION, id);
  }
};
