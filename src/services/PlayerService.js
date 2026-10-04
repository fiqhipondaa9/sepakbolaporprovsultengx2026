/**
 * Player Service
 * PRD: §4.6 Manajemen Pemain (TM-03, TM-04, TM-05)
 */
import { getCollectionDocs, getDocById, saveDoc, modifyDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'players';

export const PlayerService = {
  async getAll() {
    return await getCollectionDocs(COLLECTION);
  },

  async getByTeam(teamId) {
    const all = await this.getAll();
    return all.filter(p => p.teamId === teamId).sort((a, b) => (a.number || 0) - (b.number || 0));
  },

  async getById(id) {
    return await getDocById(COLLECTION, id);
  },

  async addPlayer(playerData) {
    const existing = await this.getByTeam(playerData.teamId);
    if (existing.length >= 25) {
      throw new Error(`Batas kuota maksimum 25 pemain untuk tim ini telah terpenuhi!`);
    }
    const id = playerData.id || 'ply_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    return await saveDoc(COLLECTION, id, playerData);
  },

  async updatePlayer(id, playerData) {
    return await modifyDoc(COLLECTION, id, playerData);
  },

  async deletePlayer(id) {
    return await removeDoc(COLLECTION, id);
  }
};
