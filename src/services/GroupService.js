/**
 * Group Service
 * PRD: §4.1 Pengundian Peserta (DR-01..08)
 */
import { getCollectionDocs, getDocById, saveDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'groups';

export const GroupService = {
  async getAll() {
    const groups = await getCollectionDocs(COLLECTION);
    return groups.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async saveGroup(groupId, groupData) {
    return await saveDoc(COLLECTION, groupId, groupData);
  },

  async deleteGroup(groupId) {
    return await removeDoc(COLLECTION, groupId);
  }
};
