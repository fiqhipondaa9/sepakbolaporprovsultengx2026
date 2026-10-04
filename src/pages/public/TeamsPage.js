/**
 * Public Teams List Page
 * PRD: §4.9 PB-06, 13 Kabupaten/Kota Sulawesi Tengah
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { TeamService } from '../../services/TeamService.js';

export async function TeamsPage() {
  const crumbs = [{ label: 'Tim Peserta', href: null }];
  const teams = await TeamService.getAll();

  const seededCount = teams.filter(t => t.isSeeded).length;

  const content = `
    ${createBreadcrumb(crumbs)}

    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">13 Kontingen Sepak Bola Daerah</h1>
        <p class="text-sm text-muted">Daftar lengkap 13 Kabupaten dan Kota se-Sulawesi Tengah yang berlaga pada PORPROV X 2026.</p>
      </div>

      <div class="badge badge-gold" style="padding: 0.4rem 0.85rem;">
        <span>⭐ ${seededCount} Tim Unggulan (Seeded)</span>
      </div>
    </div>

    <!-- Teams Grid (PB-06) -->
    <div class="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 lg-grid-cols-4 gap-4">
      ${teams.map(team => `
        <div class="card card-interactive" onclick="window.location.hash = '#/tim/${team.id}'" style="cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;">
          <div class="flex items-center justify-between mb-3">
            <div class="team-badge-circle" style="width: 48px; height: 48px; font-size: 1rem; border-color: ${team.color || '#3B82F6'}; background: ${team.color || '#3B82F6'}25;">
              ${team.code || team.logoText || 'TIM'}
            </div>
            ${team.isSeeded ? `
              <span class="badge badge-gold" title="Tim Unggulan Berdasarkan Prestasi Terakhir">
                ⭐ Seeded ${team.seedRank}
              </span>
            ` : `
              <span class="badge badge-muted">Non-Seeded</span>
            `}
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${team.name}</h3>
          <p class="text-xs text-muted mb-4">Kode Tim: <strong class="font-mono">${team.code}</strong> &bull; ${team.city || 'Sulawesi Tengah'}</p>

          <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <span class="text-xs text-dim">${team.groupId ? `Grup ${team.groupId}` : '22 Pemain'}</span>
            <span class="text-xs text-gold font-bold">Profil & Skuad &rarr;</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return wrapPublicLayout(content, '#/tim');
}
