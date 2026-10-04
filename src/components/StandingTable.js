/**
 * Reusable Standing Table Component
 * PRD: §6.4 Standing Table, §4.3 Perhitungan Otomatis Klasemen
 */

export function createStandingTable(groupData) {
  const { group, standings } = groupData;

  return `
    <div class="card mb-6" style="padding: 0; overflow: hidden;">
      <div style="padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <h4 style="margin: 0; font-family: var(--font-heading); color: var(--color-accent); font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent);"></span>
          ${group}
        </h4>
        <span class="text-xs text-muted">Babak Penyisihan</span>
      </div>

      <div class="table-responsive" style="border: none; border-radius: 0;">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">Pos</th>
              <th>Tim Peserta</th>
              <th style="text-align: center;" title="Main">MN</th>
              <th style="text-align: center;" title="Menang">M</th>
              <th style="text-align: center;" title="Seri">S</th>
              <th style="text-align: center;" title="Kalah">K</th>
              <th style="text-align: center;" title="Gol Masuk">GM</th>
              <th style="text-align: center;" title="Gol Kemasukan">GK</th>
              <th style="text-align: center;" title="Selisih Gol">SG</th>
              <th style="text-align: center;" title="Total Poin">PTS</th>
            </tr>
          </thead>
          <tbody>
            ${standings.map(t => {
              const rowClass = t.status === 'qualify' ? 'row-qualify' : 
                               t.status === 'playoff' ? 'row-playoff' : 'row-eliminate';
              
              const sgDisplay = t.gd > 0 ? `+${t.gd}` : `${t.gd}`;

              return `
                <tr class="${rowClass}">
                  <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${t.rank}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="team-badge-circle" style="width: 28px; height: 28px; font-size: 0.7rem;">
                        ${t.code}
                      </span>
                      <span style="font-weight: 600;">${t.name}</span>
                    </div>
                  </td>
                  <td style="text-align: center;" class="mono">${t.played}</td>
                  <td style="text-align: center;" class="mono">${t.won}</td>
                  <td style="text-align: center;" class="mono">${t.draw}</td>
                  <td style="text-align: center;" class="mono">${t.lost}</td>
                  <td style="text-align: center;" class="mono text-muted">${t.gf}</td>
                  <td style="text-align: center;" class="mono text-muted">${t.ga}</td>
                  <td style="text-align: center;" class="mono font-bold ${t.gd > 0 ? 'text-success' : t.gd < 0 ? 'text-danger' : ''}">${sgDisplay}</td>
                  <td style="text-align: center;" class="points">${t.pts}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div style="padding: 0.75rem 1.25rem; background: rgba(0, 0, 0, 0.2); font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
        <span class="flex items-center gap-1">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: var(--color-qualify);"></span>
          Lolos Babak Perempat Final (8 Besar)
        </span>
        <span class="flex items-center gap-1">
          <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: var(--color-eliminate);"></span>
          Tereliminasi
        </span>
      </div>
    </div>
  `;
}
