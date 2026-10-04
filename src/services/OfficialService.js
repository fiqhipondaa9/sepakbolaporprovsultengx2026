/**
 * Team Officials Service
 * PRD: §4.6 TM-03 CRUD Data Official Tim
 */
import { getCollectionDocs, getDocById, saveDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'officials';

export const OfficialService = {
  async getAll() {
    return await getCollectionDocs(COLLECTION);
  },

  async getByTeam(teamId) {
    const all = await this.getAll();
    return all.filter(o => o.teamId === teamId);
  },

  async addOfficial(officialData) {
    const id = officialData.id || 'off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    return await saveDoc(COLLECTION, id, { ...officialData, id });
  },

  async deleteOfficial(id) {
    return await removeDoc(COLLECTION, id);
  }
};
