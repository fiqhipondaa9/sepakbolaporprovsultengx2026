/**
 * Venue Management Service
 * PRD: §5.1 Manajemen Venue & Lapangan (VN-01, VN-02, VN-03)
 */
import { getCollectionDocs, getDocById, saveDoc, removeDoc } from '../firebase/firestore.js';

const COLLECTION = 'venues';

export const VenueService = {
  async getAll() {
    const venues = await getCollectionDocs(COLLECTION);
    if (venues.length > 0) return venues;

    // Default venues if empty
    const defaults = [
      { id: 'v1', name: 'Stadion Utama Morowali', capacity: 15000, city: 'Morowali', isPrimary: true },
      { id: 'v2', name: 'Stadion Gelora Gawalise', capacity: 20000, city: 'Palu', isPrimary: false },
      { id: 'v3', name: 'Stadion Madani', capacity: 8000, city: 'Palu', isPrimary: false }
    ];

    for (const v of defaults) {
      await saveDoc(COLLECTION, v.id, v);
    }
    return defaults;
  },

  async getById(id) {
    return await getDocById(COLLECTION, id);
  },

  async create(venueData) {
    const id = venueData.id || 'ven_' + Date.now();
    return await saveDoc(COLLECTION, id, venueData);
  },

  async delete(id) {
    return await removeDoc(COLLECTION, id);
  },

  /**
   * Check if a venue is already booked for a specific date and time slot (VN-03)
   */
  async checkConflict(venueId, date, time, excludeMatchId = null) {
    const matches = await getCollectionDocs('matches');
    const conflict = matches.find(m => 
      m.venueId === venueId && 
      m.date === date && 
      m.time === time && 
      m.id !== excludeMatchId
    );
    return conflict || null;
  }
};
