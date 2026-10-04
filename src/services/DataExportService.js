/**
 * Data Export & Import Service
 * PRD: §4.8 AD-04 (Export JSON), AD-05 (Import JSON)
 */
import { getCollectionDocs, saveDoc } from '../firebase/firestore.js';
import { TournamentService } from './TournamentService.js';
import { TeamService } from './TeamService.js';
import { MatchService } from './MatchService.js';

export const DataExportService = {
  /**
   * Export all tournament data as JSON object
   */
  async exportAllData() {
    const [
      tournament,
      teams,
      players,
      matches,
      goals,
      cards,
      groups,
      venues
    ] = await Promise.all([
      TournamentService.getInfo(),
      TeamService.getAll(),
      getCollectionDocs('players'),
      MatchService.getAll(),
      getCollectionDocs('goals'),
      getCollectionDocs('cards'),
      getCollectionDocs('groups'),
      getCollectionDocs('venues')
    ]);

    const backupPayload = {
      meta: {
        app: 'PORPROV X SULTENG 2026 SEPAKBOLA',
        schemaVersion: '1.0.0',
        exportedAt: new Date().toISOString()
      },
      tournament,
      teams,
      players,
      matches,
      goals,
      cards,
      groups,
      venues
    };

    return backupPayload;
  },

  /**
   * Import data from JSON object and restore database
   */
  async importAllData(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Format file tidak valid. Berkas JSON kosong atau rusak.');
    }

    // Validate essential sections
    if (!jsonData.tournament && !jsonData.teams) {
      throw new Error('Berkas JSON tidak memiliki struktur database turnamen PORPROV yang valid.');
    }

    // Restore tournament info
    if (jsonData.tournament) {
      await TournamentService.updateInfo(jsonData.tournament);
    }

    // Restore teams
    if (Array.isArray(jsonData.teams)) {
      for (const t of jsonData.teams) {
        if (t.id) await saveDoc('teams', t.id, t);
      }
    }

    // Restore players
    if (Array.isArray(jsonData.players)) {
      for (const p of jsonData.players) {
        if (p.id) await saveDoc('players', p.id, p);
      }
    }

    // Restore matches
    if (Array.isArray(jsonData.matches)) {
      for (const m of jsonData.matches) {
        if (m.id) await saveDoc('matches', m.id, m);
      }
    }

    // Restore goals
    if (Array.isArray(jsonData.goals)) {
      for (const g of jsonData.goals) {
        if (g.id) await saveDoc('goals', g.id, g);
      }
    }

    // Restore cards
    if (Array.isArray(jsonData.cards)) {
      for (const c of jsonData.cards) {
        if (c.id) await saveDoc('cards', c.id, c);
      }
    }

    return {
      success: true,
      teamsCount: jsonData.teams?.length || 0,
      matchesCount: jsonData.matches?.length || 0
    };
  }
};
