/**
 * Knockout Bracket Management Service
 * PRD: §4.4 Babak Eliminasi (JD-08..17), §4.5 Input Eliminasi (HS-02, HS-03)
 */
import { getCollectionDocs, getDocById, saveDoc, modifyDoc, removeDoc } from '../firebase/firestore.js';
import { StandingsService } from './StandingsService.js';
import { VenueService } from './VenueService.js';
import { ScheduleService } from './ScheduleService.js';
import { GoalService } from './GoalService.js';
import { CardService } from './CardService.js';
import { TournamentService } from './TournamentService.js';
import { generateKnockoutBracket, advanceKnockoutMatch } from '../algorithms/bracket.js';

const COLLECTION = 'knockout_matches';

export const BracketService = {
  /**
   * Fetch all knockout bracket matches
   */
  async getAll() {
    const matches = await getCollectionDocs(COLLECTION);
    return matches.sort((a, b) => {
      const order = { 'qf1': 1, 'qf2': 2, 'qf3': 3, 'qf4': 4, 'sf1': 5, 'sf2': 6, 'bronze': 7, 'final': 8 };
      return (order[a.id] || 99) - (order[b.id] || 99);
    });
  },

  /**
   * Check if group stage matches are all completed (JD-08)
   */
  async isGroupStageCompleted() {
    const allMatches = await ScheduleService.getAllMatches();
    if (allMatches.length === 0) return false;
    const groupMatches = allMatches.filter(m => !m.stage || m.stage.includes('Grup') || m.groupId);
    if (groupMatches.length === 0) return false;
    return groupMatches.every(m => m.status === 'FINISHED' || m.status === 'WALKOVER');
  },

  /**
   * Calculate intelligent start date for knockout phase based on group stage matches
   */
  async calculateKnockoutStartDate() {
    const [allMatches, tourneyInfo] = await Promise.all([
      ScheduleService.getAllMatches(),
      TournamentService.getInfo()
    ]);

    const groupMatches = allMatches.filter(m => !m.stage || m.stage.includes('Grup') || m.groupId);
    if (groupMatches.length > 0) {
      const sortedDates = groupMatches
        .map(m => m.dateIso || m.date)
        .filter(Boolean)
        .sort();

      if (sortedDates.length > 0) {
        const lastGroupDate = sortedDates[sortedDates.length - 1];
        const restDays = tourneyInfo.scheduleConfig?.knockoutRestDays !== undefined 
          ? tourneyInfo.scheduleConfig.knockoutRestDays 
          : (tourneyInfo.knockoutRestDays !== undefined ? tourneyInfo.knockoutRestDays : 1);

        const [y, m, d] = lastGroupDate.split('-').map(Number);
        const nextDate = new Date(y, m - 1, d + 1 + restDays);
        const yy = nextDate.getFullYear();
        const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
        const dd = String(nextDate.getDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
      }
    }

    if (tourneyInfo.groupStageEndDate) {
      const restDays = tourneyInfo.knockoutRestDays !== undefined ? tourneyInfo.knockoutRestDays : 1;
      const [y, m, d] = tourneyInfo.groupStageEndDate.split('-').map(Number);
      const nextDate = new Date(y, m - 1, d + 1 + restDays);
      const yy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    }

    return tourneyInfo.startDate || '2026-11-18';
  },

  /**
   * Auto-generate knockout bracket based on group standings
   */
  async generateBracket(options = {}) {
    const [standings, bestThirds, venues] = await Promise.all([
      StandingsService.getLiveStandings(),
      StandingsService.getBestThirdPlaceStandings(),
      VenueService.getAll()
    ]);

    if (standings.length === 0) {
      throw new Error('Data grup belum tersedia. Lakukan pengundian grup terlebih dahulu.');
    }

    const knockoutStartDate = options.startDate || await this.calculateKnockoutStartDate();

    const bracketRes = generateKnockoutBracket(standings, bestThirds, {
      venues,
      startDate: knockoutStartDate
    });

    // Save knockout matches
    for (const match of bracketRes.matches) {
      await saveDoc(COLLECTION, match.id, match);
    }

    // Save bracket metadata & opposite half verification status
    await saveDoc('tournament', 'bracket_state', {
      isGenerated: true,
      generatedAt: new Date().toISOString(),
      oppositeRuleVerification: bracketRes.oppositeRuleVerification,
      totalMatches: bracketRes.totalKnockoutMatches,
      knockoutStartDate
    });

    // Synchronize Grand Final date and knockout start date with TournamentService
    const finalMatch = bracketRes.matches.find(m => m.id === 'final');
    if (finalMatch && finalMatch.dateIso) {
      await TournamentService.updateInfo({
        finalDate: finalMatch.dateIso,
        knockoutStartDate
      });
    }

    return bracketRes;
  },

  /**
   * Sync existing bracket match dates with the current group schedule without wiping scores
   */
  async syncBracketDates() {
    const [existingMatches, newStartDate] = await Promise.all([
      this.getAll(),
      this.calculateKnockoutStartDate()
    ]);

    if (existingMatches.length === 0) return { updated: 0 };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const addDaysLocal = (baseIso, days) => {
      const [by, bm, bd] = baseIso.split('-').map(Number);
      const dt = new Date(by, bm - 1, bd + days);
      const yy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    };

    const qfDates = [newStartDate, newStartDate, addDaysLocal(newStartDate, 1), addDaysLocal(newStartDate, 1)];
    const sfDate = addDaysLocal(newStartDate, 3);
    const finalDate = addDaysLocal(sfDate, 1);

    const dateMap = {
      'qf1': qfDates[0],
      'qf2': qfDates[1],
      'qf3': qfDates[2],
      'qf4': qfDates[3],
      'sf1': sfDate,
      'sf2': sfDate,
      'bronze': finalDate,
      'final': finalDate
    };

    for (const match of existingMatches) {
      const updatedDateIso = dateMap[match.id];
      if (updatedDateIso) {
        const [yy, mm, dd] = updatedDateIso.split('-').map(Number);
        const updatedDate = `${dd} ${months[mm - 1]} ${yy}`;
        match.dateIso = updatedDateIso;
        match.date = updatedDate;
        await saveDoc(COLLECTION, match.id, match);
      }
    }

    await TournamentService.updateInfo({
      finalDate,
      knockoutStartDate: newStartDate
    });

    return { updated: existingMatches.length, newStartDate, finalDate };
  },

  /**
   * Update knockout match score, extra time, penalty, and auto-advance winner
   */
  async recordKnockoutResult(matchId, scoreData) {
    const currentMatches = await this.getAll();
    const result = advanceKnockoutMatch(currentMatches, matchId, scoreData);

    // Save all updated matches
    for (const m of result.updatedMatches) {
      await saveDoc(COLLECTION, m.id, m);
    }

    // Save goals for Top Scorer tracking
    if (scoreData.goals && Array.isArray(scoreData.goals)) {
      try {
        const allGoals = await GoalService.getAll();
        const existingGoals = allGoals.filter(g => g.matchId === matchId);
        for (const eg of existingGoals) {
          await GoalService.deleteGoal(eg.id);
        }
        const currentMatchObj = result.updatedMatches.find(m => m.id === matchId);
        for (const g of scoreData.goals) {
          await GoalService.addGoal({
            ...g,
            matchId,
            matchStage: currentMatchObj?.label || 'Babak Gugur'
          });
        }
      } catch (gErr) {
        console.warn('Error saving knockout goals:', gErr);
      }
    }

    // Save cards for disciplinary tracking
    if (scoreData.cards && Array.isArray(scoreData.cards)) {
      try {
        const allCards = await CardService.getAll();
        const existingCards = allCards.filter(c => c.matchId === matchId);
        for (const ec of existingCards) {
          await CardService.deleteCard(ec.id);
        }
        for (const c of scoreData.cards) {
          await CardService.addCard({
            ...c,
            matchId,
            stage: 'knockout'
          });
        }
      } catch (cErr) {
        console.warn('Error saving knockout cards:', cErr);
      }
    }

    // Check if Final was just completed
    if (result.isFinalFinished) {
      const finalMatch = result.updatedMatches.find(m => m.id === 'final');
      const bronzeMatch = result.updatedMatches.find(m => m.id === 'bronze');
      await saveDoc('tournament', 'winners', {
        champion: finalMatch?.winnerTeam || null,
        runnerUp: finalMatch?.loserTeam || null,
        thirdPlace: bronzeMatch?.winnerTeam || null,
        updatedAt: new Date().toISOString()
      });
    }

    return result;
  },

  /**
   * Update match venue or schedule for knockout matches (JD-13)
   */
  async updateKnockoutSlot(matchId, updates) {
    return await modifyDoc(COLLECTION, matchId, updates);
  },

  /**
   * Reset bracket
   */
  async resetBracket() {
    const matches = await this.getAll();
    for (const m of matches) {
      await removeDoc(COLLECTION, m.id);
    }
    await removeDoc('tournament', 'bracket_state');
    await removeDoc('tournament', 'winners');
    return true;
  }
};
