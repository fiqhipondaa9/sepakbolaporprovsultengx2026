/**
 * Team Service
 * PRD: §4.6 Manajemen Tim (TM-01..09), §4.2 Seeded (SD-01..05)
 */
import { getCollectionDocs, getDocById, saveDoc, modifyDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'teams';

export const TeamService = {
  async getAll() {
    const teams = await getCollectionDocs(COLLECTION);
    return teams.sort((a, b) => (a.seedRank || 99) - (b.seedRank || 99));
  },

  async getById(id) {
    return await getDocById(COLLECTION, id);
  },

  async create(teamData) {
    const id = teamData.id || teamData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return await saveDoc(COLLECTION, id, teamData);
  },

  async update(id, teamData) {
    return await modifyDoc(COLLECTION, id, teamData);
  },

  async delete(id) {
    return await removeDoc(COLLECTION, id);
  },

  async getSeededTeams() {
    const all = await this.getAll();
    return all.filter(t => t.isSeeded);
  },

  async getNonSeededTeams() {
    const all = await this.getAll();
    return all.filter(t => !t.isSeeded);
  }
};
