/**
 * Group Display Component
 * Renders the groups and slot assignments from draw results
 * PRD: §4.1 DR-01, DR-03
 */

export function createGroupDisplay(groups = {}, isLocked = false) {
  const letters = Object.keys(groups).sort((a, b) => a.localeCompare(b));
  if (letters.length === 0) {
    return `
      <div class="card text-center" style="padding: 2.5rem; color: var(--text-muted); border-style: dashed;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎲</div>
        <h4 style="margin: 0; color: var(--text-main);">Belum Ada Hasil Pengundian</h4>
        <p class="text-xs" style="margin-top: 0.25rem;">Pilih jumlah grup dan klik "Mulai Undian" di atas untuk mengundi grup.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-4 gap-4" id="group-display-grid">
      ${letters.map(letter => {
        const group = groups[letter];
        const teams = group.teams || [];

        return `
          <div class="card group-card" style="padding: 0; overflow: hidden; border-color: ${isLocked ? 'rgba(0, 191, 166, 0.4)' : 'rgba(245, 166, 35, 0.3)'};">
            <!-- Group Header -->
            <div style="padding: 0.85rem 1.15rem; background: rgba(255, 255, 255, 0.04); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
              <h4 style="margin: 0; color: var(--color-accent); font-family: var(--font-heading); font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>GRUP ${letter}</span>
              </h4>
              <span class="badge ${isLocked ? 'badge-teal' : 'badge-gold'}" style="font-size: 0.7rem;">
                ${teams.length} Tim
              </span>
            </div>

            <!-- Group Slots List -->
            <div style="padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 190px;">
              ${teams.map((t, idx) => `
                <div class="card" style="padding: 0.6rem 0.75rem; margin: 0; background: ${t.isSeededSlot ? 'rgba(245, 166, 35, 0.1)' : 'rgba(15, 28, 48, 0.7)'}; border-color: ${t.isSeededSlot ? 'rgba(245, 166, 35, 0.35)' : 'var(--border-subtle)'}; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                  <div class="flex items-center gap-2" style="overflow: hidden;">
                    <span class="team-badge-circle" style="width: 26px; height: 26px; font-size: 0.65rem; border-color: ${t.color || '#3B82F6'}; background: ${t.color}30;">
                      ${t.code || t.name.substring(0, 3).toUpperCase()}
                    </span>
                    <span style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${t.name}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    ${t.isSeededSlot ? `<span class="badge badge-gold" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">⭐ ${t.groupSlot || `${letter}1`}</span>` : `<span class="badge badge-muted font-mono" style="font-size: 0.7rem;">${t.groupSlot || `${letter}${idx + 1}`}</span>`}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
