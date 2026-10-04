/**
 * Standings Service
 * PRD: §4.3 Perhitungan Otomatis Klasemen (KL-01..07)
 */
import { getCollectionDocs, saveDoc, getDocById } from '../firebase/firestore.js';
import { GroupService } from './GroupService.js';
import { TeamService } from './TeamService.js';
import { MatchService } from './MatchService.js';
import { CardService } from './CardService.js';
import { calculateGroupStandings } from '../algorithms/standings.js';

const COLLECTION = 'standings';

export const StandingsService = {
  /**
   * Recalculate and fetch live standings for all groups
   */
  async getLiveStandings() {
    const [groupsList, allTeams, allMatches, allCards] = await Promise.all([
      GroupService.getAll(),
      TeamService.getAll(),
      MatchService.getAll(),
      CardService.getAll()
    ]);

    // Filter groups against authoritative latest draw in drawHistory
    const drawState = await getDocById('drawHistory', 'latest_draw');
    let activeGroups = groupsList;
    if (drawState && drawState.drawResult && drawState.drawResult.groups) {
      const validLetters = new Set(Object.keys(drawState.drawResult.groups));
      activeGroups = groupsList.filter(g => validLetters.has(g.letter || g.id));
      if (activeGroups.length === 0) {
        activeGroups = Object.values(drawState.drawResult.groups);
      }
    }

    if (activeGroups.length === 0) {
      return [];
    }

    const result = [];

    for (const group of activeGroups) {
      const letter = group.letter || group.id;
      const groupTeams = allTeams.filter(t => t.groupId === letter);

      // If team groupId is missing, use teams inside group object
      const teams = groupTeams.length > 0 ? groupTeams : (group.teams || []);

      const standings = calculateGroupStandings(
        letter,
        teams,
        allMatches,
        allCards,
        2 // top 2 qualify
      );

      const groupData = {
        group: `Grup ${letter}`,
        letter,
        standings,
        updatedAt: new Date().toISOString()
      };

      result.push(groupData);
      // Cache snapshot to Firestore
      await saveDoc(COLLECTION, `group_${letter}`, groupData);
    }

    return result;
  },

  /**
   * Compare 3rd place teams across groups (for 3 groups scenario)
   */
  async getBestThirdPlaceStandings() {
    const allStandings = await this.getLiveStandings();
    const thirdPlaces = [];

    allStandings.forEach(g => {
      const third = g.standings.find(t => t.rank === 3);
      if (third) {
        thirdPlaces.push({
          ...third,
          groupName: g.group,
          groupLetter: g.letter
        });
      }
    });

    // Sort 3rd place teams by PTS -> GD -> GF -> FairPlay
    thirdPlaces.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return b.fairPlayPoints - a.fairPlayPoints;
    });

    // Top 2 best 3rd place qualify for QF
    thirdPlaces.forEach((t, idx) => {
      t.bestThirdRank = idx + 1;
      t.bestThirdStatus = idx < 2 ? 'qualify' : 'eliminate';
    });

    return thirdPlaces;
  }
};
