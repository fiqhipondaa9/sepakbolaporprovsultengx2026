/**
 * Schedule Service
 * PRD: §4.4 Penyusunan Jadwal (JD-01..07, JD-20..27)
 */
import { getCollectionDocs, saveDoc, modifyDoc, removeDoc, getDocById } from '../firebase/firestore.js';
import { GroupService } from './GroupService.js';
import { VenueService } from './VenueService.js';
import { TournamentService } from './TournamentService.js';
import { generateFlexibleSchedule } from '../algorithms/scheduler.js';

const COLLECTION = 'matches';

export const ScheduleService = {
  async getAllMatches() {
    const rawMatches = await getCollectionDocs(COLLECTION);
    const hasOfficialBerger = rawMatches.some(m => m.id && m.id.startsWith('match_'));

    let filtered = rawMatches;
    if (hasOfficialBerger) {
      filtered = rawMatches.filter(m => {
        const isLegacyMock = m.id && m.id.match(/^m\d+$/);
        if (isLegacyMock) {
          removeDoc(COLLECTION, m.id).catch(() => {});
          return false;
        }
        return true;
      });
    }

    // Filter out obsolete matches from groups not in active draw
    const drawState = await getDocById('drawHistory', 'latest_draw');
    if (drawState && drawState.drawResult && drawState.drawResult.groups) {
      const validLetters = new Set(Object.keys(drawState.drawResult.groups));
      filtered = filtered.filter(m => {
        if (m.groupId && !validLetters.has(m.groupId)) {
          removeDoc(COLLECTION, m.id).catch(() => {});
          return false;
        }
        return true;
      });
    }

    const matches = filtered.map(m => {
      if (!m.groupId && m.stage) {
        const matchG = m.stage.match(/Grup\s+([A-D])/i);
        if (matchG) m.groupId = matchG[1].toUpperCase();
      }
      return m;
    });

    return matches.sort((a, b) => {
      // Sort by date then slot
      if (a.dateIso && b.dateIso) {
        if (a.dateIso !== b.dateIso) return a.dateIso.localeCompare(b.dateIso);
      }
      return (a.slotIndex || 0) - (b.slotIndex || 0);
    });
  },

  async getMatchesByGroup(groupId) {
    const all = await this.getAllMatches();
    return all.filter(m => m.groupId === groupId);
  },

  async getMatchesByDate(date) {
    const all = await this.getAllMatches();
    return all.filter(m => m.date === date || m.dateIso === date);
  },

  /**
   * Auto-generate group stage schedule based on flexible parameters (JD-20..27)
   */
  async generateSchedule(params = {}) {
    // 1. Get authoritative locked groups from latest_draw first
    const drawState = await getDocById('drawHistory', 'latest_draw');
    const groupsMap = {};

    if (drawState && drawState.drawResult && drawState.drawResult.groups) {
      Object.assign(groupsMap, drawState.drawResult.groups);
      // Clean up obsolete groups in GroupService
      const existingGroups = await GroupService.getAll();
      for (const eg of existingGroups) {
        if (!groupsMap[eg.letter || eg.id]) {
          await GroupService.deleteGroup(eg.id || eg.letter);
        }
      }
    } else {
      const groupsList = await GroupService.getAll();
      groupsList.forEach(g => {
        groupsMap[g.letter || g.id] = g;
      });
    }

    if (Object.keys(groupsMap).length === 0) {
      throw new Error('Belum ada data grup yang diundi. Silakan lakukan pengundian grup terlebih dahulu.');
    }

    // 2. Get venues and tournament start date
    const [venues, tourneyInfo] = await Promise.all([
      VenueService.getAll(),
      TournamentService.getInfo()
    ]);

    const options = {
      groups: groupsMap,
      venues,
      startDate: params.startDate || tourneyInfo.startDate || '2026-11-10',
      slotsPerDay: params.slotsPerDay || 2,
      customSlotTimes: params.customSlotTimes || null,
      restDaysMin: params.restDaysMin !== undefined ? params.restDaysMin : 1,
      knockoutRestDays: params.knockoutRestDays !== undefined ? params.knockoutRestDays : 2
    };

    // 3. Run scheduler algorithm
    const scheduleResult = generateFlexibleSchedule(options);

    // Clean up all previous matches before writing new schedule
    const previousMatches = await getCollectionDocs(COLLECTION);
    for (const pm of previousMatches) {
      await removeDoc(COLLECTION, pm.id);
    }

    // 4. Save generated matches to Firestore
    for (const match of scheduleResult.matches) {
      await saveDoc(COLLECTION, match.id, match);
    }

    // 5. Update tournament info with estimated end date and actual parameters used
    await TournamentService.updateInfo({
      startDate: options.startDate,
      slotsPerDay: options.slotsPerDay,
      restDaysMin: options.restDaysMin,
      knockoutRestDays: options.knockoutRestDays,
      scheduleConfig: {
        startDate: options.startDate,
        slotsPerDay: options.slotsPerDay,
        restDaysMin: options.restDaysMin,
        knockoutRestDays: options.knockoutRestDays
      },
      groupStageEndDate: scheduleResult.groupStageEndDate,
      finalDate: scheduleResult.finalDate,
      totalDurationDays: scheduleResult.totalDurationDays
    });

    return scheduleResult;
  },

  /**
   * Swap the date and time slots of two matches (JD-05)
   */
  async swapMatchSlots(matchIdA, matchIdB) {
    const [matchA, matchB] = await Promise.all([
      getDocById(COLLECTION, matchIdA),
      getDocById(COLLECTION, matchIdB)
    ]);

    if (!matchA || !matchB) {
      throw new Error('Salah satu pertandingan tidak ditemukan.');
    }

    const tempSlot = {
      date: matchA.date,
      dateIso: matchA.dateIso,
      time: matchA.time,
      venueId: matchA.venueId,
      venueName: matchA.venueName,
      slotIndex: matchA.slotIndex
    };

    await Promise.all([
      modifyDoc(COLLECTION, matchIdA, {
        date: matchB.date,
        dateIso: matchB.dateIso,
        time: matchB.time,
        venueId: matchB.venueId,
        venueName: matchB.venueName,
        slotIndex: matchB.slotIndex
      }),
      modifyDoc(COLLECTION, matchIdB, tempSlot)
    ]);

    return true;
  },

  /**
   * Reassign match venue or time
   */
  async updateMatchSlot(matchId, updates) {
    return await modifyDoc(COLLECTION, matchId, updates);
  }
};
