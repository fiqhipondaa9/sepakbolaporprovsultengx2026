/**
 * Goal Service
 * PRD: §4.5 HS-03, §4.7 ST-01 Top Scorer
 */
import { getCollectionDocs, saveDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'goals';

export const GoalService = {
  async getAll() {
    return await getCollectionDocs(COLLECTION);
  },

  async getByMatch(matchId) {
    const all = await this.getAll();
    return all.filter(g => g.matchId === matchId).sort((a, b) => (a.minute || 0) - (b.minute || 0));
  },

  async addGoal(goalData) {
    const id = goalData.id || 'goal_' + Date.now();
    return await saveDoc(COLLECTION, id, goalData);
  },

  async deleteGoal(id) {
    return await removeDoc(COLLECTION, id);
  }
};
