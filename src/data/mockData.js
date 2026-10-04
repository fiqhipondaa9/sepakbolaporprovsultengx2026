/**
 * Default initial dataset for PORPROV X Sulawesi Tengah 2026
 * 13 Kabupaten / Kota di Provinsi Sulawesi Tengah
 */

export const DEFAULT_TEAMS = [
  { id: 'palu', name: 'Kota Palu', code: 'PAL', color: '#EF4444', isSeeded: true, seedRank: 1, logoText: 'PAL' },
  { id: 'sigi', name: 'Kabupaten Sigi', code: 'SIG', color: '#3B82F6', isSeeded: true, seedRank: 2, logoText: 'SIG' },
  { id: 'donggala', name: 'Kabupaten Donggala', code: 'DGL', color: '#10B981', isSeeded: true, seedRank: 3, logoText: 'DGL' },
  { id: 'parimo', name: 'Kabupaten Parigi Moutong', code: 'PRM', color: '#F59E0B', isSeeded: true, seedRank: 4, logoText: 'PRM' },
  { id: 'poso', name: 'Kabupaten Poso', code: 'PSO', color: '#8B5CF6', isSeeded: false, seedRank: null, logoText: 'PSO' },
  { id: 'touna', name: 'Kabupaten Tojo Una-Una', code: 'TNA', color: '#EC4899', isSeeded: false, seedRank: null, logoText: 'TNA' },
  { id: 'tolitoli', name: 'Kabupaten Tolitoli', code: 'TLI', color: '#14B8A6', isSeeded: false, seedRank: null, logoText: 'TLI' },
  { id: 'buol', name: 'Kabupaten Buol', code: 'BOL', color: '#6366F1', isSeeded: false, seedRank: null, logoText: 'BOL' },
  { id: 'banggai', name: 'Kabupaten Banggai', code: 'BGI', color: '#F97316', isSeeded: false, seedRank: null, logoText: 'BGI' },
  { id: 'bangkep', name: 'Kabupaten Banggai Kepulauan', code: 'BKP', color: '#06B6D4', isSeeded: false, seedRank: null, logoText: 'BKP' },
  { id: 'balut', name: 'Kabupaten Banggai Laut', code: 'BLT', color: '#84CC16', isSeeded: false, seedRank: null, logoText: 'BLT' },
  { id: 'morowali', name: 'Kabupaten Morowali', code: 'MRW', color: '#D946EF', isSeeded: false, seedRank: null, logoText: 'MRW' },
  { id: 'morut', name: 'Kabupaten Morowali Utara', code: 'MRU', color: '#0EA5E9', isSeeded: false, seedRank: null, logoText: 'MRU' }
];

export const TOURNAMENT_INFO = {
  name: 'PORPROV X SULAWESI TENGAH 2026',
  sport: 'Sepak Bola Putra',
  host: 'Kabupaten Morowali / Sulawesi Tengah',
  year: 2026,
  targetDate: '2026-11-10T08:00:00+08:00',
  venues: [
    { id: 'v1', name: 'Stadion Utama Morowali', capacity: 15000, city: 'Morowali' },
    { id: 'v2', name: 'Stadion Gelora Gawalise', capacity: 20000, city: 'Palu' },
    { id: 'v3', name: 'Stadion Madani', capacity: 8000, city: 'Palu' }
  ]
};

export const MOCK_STANDINGS = [
  {
    group: 'Grup A',
    standings: [
      { rank: 1, teamId: 'palu', name: 'Kota Palu', code: 'PAL', played: 2, won: 2, draw: 0, lost: 0, gf: 6, ga: 1, gd: 5, pts: 6, status: 'qualify' },
      { rank: 2, teamId: 'donggala', name: 'Kabupaten Donggala', code: 'DGL', played: 2, won: 1, draw: 0, lost: 1, gf: 3, ga: 3, gd: 0, pts: 3, status: 'qualify' },
      { rank: 3, teamId: 'poso', name: 'Kabupaten Poso', code: 'PSO', played: 2, won: 0, draw: 0, lost: 2, gf: 1, ga: 6, gd: -5, pts: 0, status: 'eliminate' }
    ]
  },
  {
    group: 'Grup B',
    standings: [
      { rank: 1, teamId: 'sigi', name: 'Kabupaten Sigi', code: 'SIG', played: 2, won: 1, draw: 1, lost: 0, gf: 4, ga: 2, gd: 2, pts: 4, status: 'qualify' },
      { rank: 2, teamId: 'morowali', name: 'Kabupaten Morowali', code: 'MRW', played: 2, won: 1, draw: 0, lost: 1, gf: 2, ga: 2, gd: 0, pts: 3, status: 'qualify' },
      { rank: 3, teamId: 'tolitoli', name: 'Kabupaten Tolitoli', code: 'TLI', played: 2, won: 0, draw: 1, lost: 1, gf: 1, ga: 3, gd: -2, pts: 1, status: 'eliminate' }
    ]
  }
];

export const MOCK_RECENT_MATCHES = [
  {
    id: 'm1',
    matchday: 1,
    groupId: 'A',
    stage: 'Penyisihan Grup A',
    date: '10 Nov 2026',
    time: '06:00 WITA',
    venue: 'Stadion Utama Morowali',
    homeTeam: { id: 'palu', name: 'Kota Palu', code: 'PAL', color: '#EF4444', score: 3 },
    awayTeam: { id: 'tolitoli', name: 'Kabupaten Tolitoli', code: 'TLI', color: '#14B8A6', score: 1 },
    status: 'FINISHED',
    minute: "90'"
  },
  {
    id: 'm2',
    matchday: 1,
    groupId: 'B',
    stage: 'Penyisihan Grup B',
    date: '10 Nov 2026',
    time: '08:00 WITA',
    venue: 'Stadion Utama Morowali',
    homeTeam: { id: 'sigi', name: 'Kabupaten Sigi', code: 'SIG', color: '#3B82F6', score: 2 },
    awayTeam: { id: 'touna', name: 'Kabupaten Tojo Una-Una', code: 'TNA', color: '#EC4899', score: 1 },
    status: 'FINISHED',
    minute: "90'"
  },
  {
    id: 'm3',
    matchday: 1,
    groupId: 'C',
    stage: 'Penyisihan Grup C',
    date: '11 Nov 2026',
    time: '14:00 WITA',
    venue: 'Stadion Gelora Gawalise',
    homeTeam: { id: 'donggala', name: 'Kabupaten Donggala', code: 'DGL', color: '#10B981', score: null },
    awayTeam: { id: 'poso', name: 'Kabupaten Poso', code: 'PSO', color: '#8B5CF6', score: null },
    status: 'SCHEDULED',
    minute: null
  },
  {
    id: 'm4',
    matchday: 1,
    groupId: 'D',
    stage: 'Penyisihan Grup D',
    date: '11 Nov 2026',
    time: '16:00 WITA',
    venue: 'Stadion Utama Morowali',
    homeTeam: { id: 'parimo', name: 'Kabupaten Parigi Moutong', code: 'PRM', color: '#F59E0B', score: null },
    awayTeam: { id: 'morowali', name: 'Kabupaten Morowali', code: 'MRW', color: '#D946EF', score: null },
    status: 'SCHEDULED',
    minute: null
  }
];
