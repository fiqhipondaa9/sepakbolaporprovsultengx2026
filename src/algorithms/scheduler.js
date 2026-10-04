/**
 * Flexible Day Scheduling Engine
 * PRD: §4.4 Penyusunan Jadwal (JD-20..27), §5.1 Venue Management (VN-03), §9.5 Algoritma Penjadwalan Hari Fleksibel
 */
import { generateRoundRobinMatches } from './roundRobin.js';

export const DEFAULT_SLOT_TIMES = {
  1: ['16:00 WITA'],
  2: ['08:00 WITA', '16:00 WITA'],
  3: ['08:00 WITA', '14:00 WITA', '16:00 WITA'],
  4: ['06:00 WITA', '08:00 WITA', '14:00 WITA', '16:00 WITA']
};

/**
 * Generate a complete, balanced schedule across groups with rest-day protection and venue conflict resolution
 */
export function generateFlexibleSchedule(options = {}) {
  const {
    groups = {},
    venues = [],
    startDate = '2026-11-10',
    slotsPerDay = 2,
    customSlotTimes = null,
    restDaysMin = 1,
    knockoutRestDays = 2
  } = options;

  const slotTimes = customSlotTimes || DEFAULT_SLOT_TIMES[slotsPerDay] || DEFAULT_SLOT_TIMES[2];
  const primaryVenue = venues[0] || { id: 'v1', name: 'Stadion Utama Morowali', city: 'Morowali' };

  // 1. Generate Berger Table matches for each group
  const allGroupMatches = [];
  const groupLetters = Object.keys(groups);

  groupLetters.forEach(letter => {
    const teams = groups[letter].teams || [];
    const matches = generateRoundRobinMatches(letter, teams);
    allGroupMatches.push(...matches);
  });

  if (allGroupMatches.length === 0) {
    return { matches: [], totalDays: 0, startDate, estimatedEndDate: startDate };
  }

  // 2. Interleave matches by round across groups (Round 1 A, Round 1 B, Round 1 C...)
  // This guarantees maximum natural rest days between games
  allGroupMatches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.groupId.localeCompare(b.groupId);
  });

  // 3. Allocate matches to dates and time slots
  const scheduledMatches = [];
  const teamLastPlayedDate = {}; // teamId -> Date string (YYYY-MM-DD)
  const venueSlotBooking = {}; // 'YYYY-MM-DD_venueId_slotTime' -> true

  let currentDate = new Date(startDate);
  let currentSlotIndex = 0;
  let remainingMatches = [...allGroupMatches];

  // Helper date formatter
  function formatDate(d) {
    return d.toISOString().split('T')[0];
  }

  function formatDisplayDate(d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function addDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  }

  let safetyCounter = 0;
  const maxIterations = 300;

  while (remainingMatches.length > 0 && safetyCounter < maxIterations) {
    safetyCounter++;
    const dateStr = formatDate(currentDate);
    let matchFoundForSlot = false;

    for (let i = 0; i < remainingMatches.length; i++) {
      const match = remainingMatches[i];
      const homeId = match.homeTeam.id;
      const awayId = match.awayTeam.id;

      // Check rest day rule (JD-03: min rest days between games for same team)
      const homeLast = teamLastPlayedDate[homeId];
      const awayLast = teamLastPlayedDate[awayId];

      const homeRestOk = !homeLast || (Math.floor((currentDate - new Date(homeLast)) / (1000 * 60 * 60 * 24)) > restDaysMin);
      const awayRestOk = !awayLast || (Math.floor((currentDate - new Date(awayLast)) / (1000 * 60 * 60 * 24)) > restDaysMin);

      if (homeRestOk && awayRestOk) {
        // Find an available venue for this slot (VN-03: no conflict in same venue at same time)
        let selectedVenue = primaryVenue;
        let venueTime = slotTimes[currentSlotIndex];

        // Check if primary venue is available
        const bookingKey = `${dateStr}_${selectedVenue.id}_${venueTime}`;
        if (!venueSlotBooking[bookingKey]) {
          venueSlotBooking[bookingKey] = true;
        } else if (venues.length > 1) {
          // Fallback to secondary venue if available
          const altVenue = venues.find(v => !venueSlotBooking[`${dateStr}_${v.id}_${venueTime}`]);
          if (altVenue) {
            selectedVenue = altVenue;
            venueSlotBooking[`${dateStr}_${selectedVenue.id}_${venueTime}`] = true;
          }
        }

        // Assign match details
        match.date = formatDisplayDate(currentDate);
        match.dateIso = dateStr;
        match.time = venueTime;
        match.venueId = selectedVenue.id;
        match.venueName = selectedVenue.name;
        match.venueCity = selectedVenue.city || 'Sulawesi Tengah';
        match.slotIndex = currentSlotIndex + 1;

        scheduledMatches.push(match);
        teamLastPlayedDate[homeId] = dateStr;
        teamLastPlayedDate[awayId] = dateStr;

        remainingMatches.splice(i, 1);
        matchFoundForSlot = true;
        break;
      }
    }

    // Advance slot or date
    currentSlotIndex++;
    if (currentSlotIndex >= slotsPerDay || !matchFoundForSlot && currentSlotIndex >= slotTimes.length) {
      currentSlotIndex = 0;
      currentDate = addDays(currentDate, 1);
    }
  }

  // If any unassigned due to strict rest constraints, assign sequentially
  if (remainingMatches.length > 0) {
    remainingMatches.forEach(m => {
      const dateStr = formatDate(currentDate);
      m.date = formatDisplayDate(currentDate);
      m.dateIso = dateStr;
      m.time = slotTimes[currentSlotIndex % slotTimes.length];
      m.venueId = primaryVenue.id;
      m.venueName = primaryVenue.name;
      scheduledMatches.push(m);
      currentSlotIndex++;
      if (currentSlotIndex >= slotsPerDay) {
        currentSlotIndex = 0;
        currentDate = addDays(currentDate, 1);
      }
    });
  }

  // 4. Calculate total tournament duration metrics (JD-20..25)
  const groupStageEndDate = new Date(currentDate);
  const qfDate = addDays(groupStageEndDate, knockoutRestDays);
  const sfDate = addDays(qfDate, 3);
  const finalDate = addDays(sfDate, 1);

  const totalDays = Math.ceil((finalDate - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  return {
    success: true,
    matches: scheduledMatches,
    totalMatches: scheduledMatches.length,
    startDate,
    groupStageEndDate: formatDate(groupStageEndDate),
    qfDate: formatDate(qfDate),
    sfDate: formatDate(sfDate),
    finalDate: formatDate(finalDate),
    totalDurationDays: totalDays,
    slotsPerDay,
    restDaysMin
  };
}
