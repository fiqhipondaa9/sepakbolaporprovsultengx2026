/**
 * Team Card Component
 * PRD: §4.6 TM-01, §4.2 SD-05
 */

export function createTeamCard(team) {
  const isSeeded = Boolean(team.isSeeded);
  const primaryColor = team.color || '#EF4444';
  const secondaryColor = team.secondaryColor || '#FFFFFF';

  return `
    <div class="card card-interactive team-management-card" id="team-card-${team.id}" data-team-id="${team.id}" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; border-color: ${isSeeded ? 'rgba(245, 166, 35, 0.4)' : 'var(--border-subtle)'};">
      <div>
        <!-- Top Badges & Seeded Status -->
        <div class="flex items-center justify-between mb-3">
          <div class="team-badge-circle" style="width: 48px; height: 48px; font-size: 1rem; border-color: ${primaryColor}; background: ${primaryColor}25;">
            ${team.code || team.name.substring(0, 3).toUpperCase()}
          </div>
          <div class="flex items-center gap-1">
            ${isSeeded ? `
              <span class="badge badge-gold" title="${team.seedReason || 'Tim Unggulan'}">
                ⭐ Seed ${team.seedRank || 1}
              </span>
            ` : `
              <span class="badge badge-muted">Non-Seeded</span>
            `}
          </div>
        </div>

        <!-- Name & Region -->
        <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">${team.name}</h3>
        <p class="text-xs text-muted mb-3 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${team.city || 'Sulawesi Tengah'} &bull; Kode: <strong class="font-mono text-gold">${team.code}</strong>
        </p>

        <!-- Jersey Colors Preview -->
        <div class="flex items-center gap-2 mb-4" style="font-size: 0.75rem; color: var(--text-dim);">
          <span>Kostum:</span>
          <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${primaryColor}; border: 1px solid rgba(255,255,255,0.4);" title="Kostum Utama (${primaryColor})"></span>
          <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${secondaryColor}; border: 1px solid rgba(255,255,255,0.4);" title="Kostum Cadangan (${secondaryColor})"></span>
          ${team.groupId ? `<span class="badge badge-teal ml-auto">Grup ${team.groupId} (${team.groupSlot || ''})</span>` : ''}
        </div>
      </div>

      <!-- Actions -->
      <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
        <button type="button" class="btn btn-outline btn-sm btn-manage-roster text-gold" data-team-id="${team.id}" title="Kelola Skuad Pemain & Official (TM-02..06)" style="flex: 1; font-size: 0.75rem; padding: 0.3rem 0.5rem;">
          👥 Skuad
        </button>
        <button type="button" class="btn btn-outline btn-sm btn-edit-team" data-team-id="${team.id}" style="flex: 1; font-size: 0.75rem; padding: 0.3rem 0.5rem;">
          ✏️ Edit
        </button>
        <button type="button" class="btn btn-ghost btn-sm btn-delete-team text-danger" data-team-id="${team.id}" title="Hapus Tim" style="padding: 0.3rem 0.4rem;">
          &times;
        </button>
      </div>
    </div>
  `;
}
