/**
 * Public Team Detail Page
 * PRD: §4.9 PB-06 Profil Tim & Skuad Pemain
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { TeamService } from '../../services/TeamService.js';
import { PlayerService } from '../../services/PlayerService.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { createMatchCard, initMatchCardDetails } from '../../components/MatchCard.js';

export async function TeamDetailPage(params = {}) {
  const teamId = params.id || 'palu';
  const allTeams = await TeamService.getAll();
  const team = allTeams.find(t => t.id === teamId) || allTeams[0] || { id: 'palu', name: 'Kota Palu', code: 'PLU', color: '#3B82F6' };

  const [players, allMatches] = await Promise.all([
    PlayerService.getByTeam(team.id),
    ScheduleService.getAllMatches()
  ]);

  const teamMatches = allMatches.filter(m => 
    m.homeTeam?.id === team.id || m.awayTeam?.id === team.id
  );

  const crumbs = [
    { label: 'Tim Peserta', href: '#/tim' },
    { label: team.name, href: null }
  ];

  // Default squad roster if no players stored yet
  const defaultRoster = [
    { number: 1, name: 'Ahmad Kurniawan', position: 'Penjaga Gawang (GK)', isCaptain: false, isGK: true },
    { number: 4, name: 'Bayu Saputra', position: 'Bek Tengah (CB)', isCaptain: true, isGK: false },
    { number: 5, name: 'Rendra Wahyudi', position: 'Bek Kiri (LB)', isCaptain: false, isGK: false },
    { number: 8, name: 'Fikram Alamsyah', position: 'Gelandang Bertahan (DM)', isCaptain: false, isGK: false },
    { number: 10, name: 'Rian Pratama', position: 'Gelandang Serang (AM)', isCaptain: false, isGK: false },
    { number: 9, name: 'Dimas Anggara', position: 'Penyerang Tengah (CF)', isCaptain: false, isGK: false },
    { number: 11, name: 'Wahyu Ramadhan', position: 'Penyerang Sayap (LW)', isCaptain: false, isGK: false },
    { number: 7, name: 'Andi Saputra', position: 'Penyerang Sayap (RW)', isCaptain: false, isGK: false }
  ];

  const squadList = players.length > 0 ? players : defaultRoster;

  const content = `
    ${createBreadcrumb(crumbs)}

    <!-- Team Header Banner -->
    <div class="card mb-6" style="background: linear-gradient(135deg, rgba(16, 28, 48, 0.95), rgba(10, 22, 40, 0.98)); border-color: ${team.color || '#3B82F6'}40; padding: 2rem;">
      <div class="flex items-center gap-4" style="flex-wrap: wrap;">
        <div class="team-badge-circle" style="width: 72px; height: 72px; font-size: 1.5rem; border-color: ${team.color || '#3B82F6'}; background: ${team.color || '#3B82F6'}30; box-shadow: 0 0 25px ${team.color || '#3B82F6'}40;">
          ${team.code || 'TIM'}
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h1 style="font-size: 1.85rem; margin: 0;">${team.name}</h1>
            ${team.isSeeded ? `<span class="badge badge-gold">⭐ Unggulan ${team.seedRank}</span>` : ''}
          </div>
          <p class="text-sm text-muted" style="margin: 0;">
            Kontingen Resmi PORPROV X Sulawesi Tengah 2026 &bull; Kode Tim: <strong class="font-mono text-gold">${team.code}</strong> ${team.groupId ? `&bull; Grup ${team.groupId}` : ''}
          </p>
        </div>
      </div>
    </div>

    <!-- Team Matches Schedule & Results -->
    <div class="card mb-6" style="padding: 1.25rem;">
      <div class="flex items-center justify-between mb-3">
        <h3 style="font-size: 1.15rem; color: var(--color-accent); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span>⚽</span> Pertandingan ${team.name}
        </h3>
        <span class="badge badge-teal">${teamMatches.length} Laga</span>
      </div>

      ${teamMatches.length === 0 ? `
        <p class="text-xs text-muted" style="margin: 0;">Belum ada jadwal pertandingan yang melibatkan ${team.name}.</p>
      ` : `
        <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
          ${teamMatches.map(m => createMatchCard(m)).join('')}
        </div>
      `}
    </div>

    <!-- Team Squad Roster -->
    <div class="card mb-6" style="padding: 0; overflow: hidden;">
      <div style="padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <h3 style="font-size: 1.15rem; color: var(--color-accent); margin: 0;">Daftar Skuad & Susunan Pemain</h3>
        <span class="badge badge-teal">Daftar Resmi PSSI</span>
      </div>

      <div class="table-responsive" style="border: none; border-radius: 0;">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 60px; text-align: center;">No</th>
              <th>Nama Pemain</th>
              <th>Posisi</th>
              <th style="text-align: center;">Peran</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${squadList.map(p => `
              <tr>
                <td style="text-align: center;" class="mono font-bold text-gold">${p.number || p.jerseyNumber || '-'}</td>
                <td style="font-weight: 600;">${p.name}</td>
                <td class="text-muted text-sm">${p.position || 'Pemain Lapangan'}</td>
                <td style="text-align: center;">
                  ${p.isCaptain ? '<span class="badge badge-gold">Kapten (C)</span>' : ''}
                  ${p.isGK ? '<span class="badge badge-teal">Kiper</span>' : ''}
                </td>
                <td style="text-align: center;">
                  <span class="badge badge-success">Siap Bertanding</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <a href="#/tim" class="btn btn-outline">&larr; Kembali ke Daftar Tim</a>
      <a href="#/jadwal" class="btn btn-primary">Lihat Seluruh Jadwal &rarr;</a>
    </div>
  `;

  return {
    html: wrapPublicLayout(content, `#/tim/${team.id}`),
    init: () => {
      initMatchCardDetails(teamMatches);
    }
  };
}
