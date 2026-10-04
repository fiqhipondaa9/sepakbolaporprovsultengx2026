/**
 * Card & Disciplinary Service
 * PRD: §5.2 Akumulasi Kartu & Suspensi (AK-01..06)
 */
import { getCollectionDocs, getDocById, saveDoc, removeDoc } from '../firebase/firestore.js';
import { computeCardAccumulation, applySemifinalCardReset } from '../algorithms/cardAccumulation.js';

const COLLECTION = 'cards';

export const CardService = {
  async getAll() {
    return await getCollectionDocs(COLLECTION);
  },

  async getByMatch(matchId) {
    const all = await this.getAll();
    return all.filter(c => c.matchId === matchId);
  },

  async addCard(cardData) {
    const id = cardData.id || 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    return await saveDoc(COLLECTION, id, { ...cardData, id });
  },

  async deleteCard(id) {
    return await removeDoc(COLLECTION, id);
  },

  /**
   * Get disciplinary tracking summary & suspensions (AK-01..05)
   */
  async getDisciplinaryReport(customThreshold = 2) {
    const cards = await this.getAll();
    const config = await getDocById('tournament', 'disciplinary_config');
    const threshold = config?.yellowThreshold || customThreshold || 2;
    return computeCardAccumulation(cards, { yellowThreshold: threshold });
  },

  /**
   * Get list of currently suspended players
   */
  async getSuspendedPlayers() {
    const report = await this.getDisciplinaryReport();
    return report?.suspendedPlayers || [];
  },

  /**
   * Get list of at-risk players
   */
  async getAtRiskPlayers() {
    const report = await this.getDisciplinaryReport();
    return report?.atRiskPlayers || [];
  },

  /**
   * Update disciplinary rules configuration (AK-05)
   */
  async updateConfig(config) {
    return await saveDoc('tournament', 'disciplinary_config', config);
  },

  /**
   * Apply Semifinal Card Reset / Pemutihan (AK-06)
   */
  async applySemifinalReset() {
    const cards = await this.getAll();
    const wipedCards = applySemifinalCardReset(cards);
    for (const c of wipedCards) {
      if (c.isWiped) {
        await saveDoc(COLLECTION, c.id, c);
      }
    }
    await saveDoc('tournament', 'disciplinary_reset', {
      isResetApplied: true,
      resetAt: new Date().toISOString(),
      reason: 'Pemutihan Kartu Kuning Semifinal (AK-06)'
    });
    return true;
  }
};
