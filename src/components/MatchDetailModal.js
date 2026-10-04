/**
 * Match Detail Modal Component (PB-04)
 * PRD: §4.9 PB-04 Detail Pertandingan (Pencetak Gol, Kartu, Pergantian Pemain)
 */
import { Modal } from './Modal.js';

export function showMatchDetailModal(match) {
  if (!match) return;

  const isFinished = match.status === 'FINISHED' || match.status === 'WALKOVER';
  const isLive = match.status === 'LIVE';

  const homeScore = match.homeTeam?.score !== null && match.homeTeam?.score !== undefined ? match.homeTeam.score : '-';
  const awayScore = match.awayTeam?.score !== null && match.awayTeam?.score !== undefined ? match.awayTeam.score : '-';

  const goals = match.goals || [];
  const cards = match.cards || [];
  const subs = match.substitutions || [];

  const modal = new Modal({
    title: `📋 Rincian Pertandingan: ${match.stage || `Grup ${match.groupId || ''}`}`,
    maxWidth: '650px',
    content: `
      <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
        
        <!-- Stadium Scoreboard Box -->
        <div style="background: rgba(10, 22, 40, 0.9); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem; text-align: center;">
          <div class="flex items-center justify-between text-xs text-muted mb-2">
            <span>📍 ${match.venueName || match.venue || 'Stadion Utama'}</span>
            <span>${match.date || ''} &bull; ${match.time || ''}</span>
          </div>

          <div class="grid grid-cols-3 items-center gap-2 my-2">
            <!-- Home -->
            <div>
              <div class="team-badge-circle" style="width: 44px; height: 44px; margin: 0 auto 0.4rem auto; border-color: ${match.homeTeam?.color || '#3B82F6'}; background: ${match.homeTeam?.color}30;">
                ${match.homeTeam?.code || 'HOM'}
              </div>
              <strong style="font-size: 0.95rem;">${match.homeTeam?.name || 'TBD'}</strong>
            </div>

            <!-- Score -->
            <div>
              <div class="font-mono font-bold text-gold" style="font-size: 2.2rem; line-height: 1;">
                ${homeScore} : ${awayScore}
              </div>
              <div class="mt-1">
                ${isLive ? '<span class="badge badge-live">LIVE BERLANGSUNG</span>' : ''}
                ${isFinished ? '<span class="badge badge-teal">SELESAI</span>' : ''}
                ${match.status === 'SCHEDULED' ? '<span class="badge badge-muted">AKAN DATANG</span>' : ''}
                ${match.isPenalty ? `<div class="text-xs text-gold mt-1 font-mono font-bold">Adu Penalti: (${match.homeTeam.penaltyScore} - ${match.awayTeam.penaltyScore})</div>` : ''}
                ${match.isExtraTime ? `<div class="text-xs text-teal mt-1 font-mono">Setelah Perpanjangan Waktu</div>` : ''}
              </div>
            </div>

            <!-- Away -->
            <div>
              <div class="team-badge-circle" style="width: 44px; height: 44px; margin: 0 auto 0.4rem auto; border-color: ${match.awayTeam?.color || '#EF4444'}; background: ${match.awayTeam?.color}30;">
                ${match.awayTeam?.code || 'AWY'}
              </div>
              <strong style="font-size: 0.95rem;">${match.awayTeam?.name || 'TBD'}</strong>
            </div>
          </div>
        </div>

        <!-- Goals Timeline (HS-04) -->
        <div class="card" style="margin: 0; padding: 0.85rem;">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--color-accent); display: flex; align-items: center; gap: 0.5rem;">
            <span>⚽</span> Pencetak Gol Pertandingan
          </h4>
          ${goals.length === 0 ? `
            <div class="text-xs text-muted text-center" style="padding: 0.75rem 0;">Tidak ada gol dicetak dalam pertandingan ini.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${goals.map(g => `
                <div class="flex items-center justify-between" style="padding: 0.35rem 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px; font-size: 0.8rem;">
                  <div>
                    <strong>⚽ ${g.playerName}</strong> <span class="text-xs text-muted">(${g.teamName})</span>
                    ${g.type === 'penalty' ? '<span class="badge badge-gold ml-1">Penalti</span>' : ''}
                    ${g.type === 'own_goal' ? '<span class="badge badge-danger ml-1">Bunuh Diri</span>' : ''}
                  </div>
                  <span class="font-mono text-gold font-bold">${g.minute}'</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Cards Disciplinary Timeline (HS-05) -->
        <div class="card" style="margin: 0; padding: 0.85rem;">
          <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--color-danger); display: flex; align-items: center; gap: 0.5rem;">
            <span>🟨</span> Sanksi Kartu Disiplin
          </h4>
          ${cards.length === 0 ? `
            <div class="text-xs text-muted text-center" style="padding: 0.75rem 0;">Pertandingan bersih tanpa pelanggaran kartu.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${cards.map(c => `
                <div class="flex items-center justify-between" style="padding: 0.35rem 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px; font-size: 0.8rem;">
                  <div>
                    <strong>${c.type === 'red' ? '🟥' : '🟨'} ${c.playerName}</strong> <span class="text-xs text-muted">(${c.teamName})</span>
                    <span class="badge ${c.type === 'red' ? 'badge-danger' : 'badge-warning'} ml-1">
                      ${c.type === 'red' ? 'Merah Langsung' : c.type === 'second_yellow' ? 'Kuning ke-2' : 'Kartu Kuning'}
                    </span>
                  </div>
                  <span class="font-mono text-gold font-bold">${c.minute}'</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Substitutions Timeline (HS-06) -->
        ${subs.length > 0 ? `
          <div class="card" style="margin: 0; padding: 0.85rem;">
            <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--color-teal); display: flex; align-items: center; gap: 0.5rem;">
              <span>🔄</span> Pergantian Pemain
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${subs.map(s => `
                <div class="flex items-center justify-between" style="padding: 0.35rem 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px; font-size: 0.8rem;">
                  <div>
                    <span class="text-success font-bold">▲ ${s.playerIn}</span> / <span class="text-danger">▼ ${s.playerOut}</span>
                    <span class="text-xs text-muted ml-1">(${s.teamName})</span>
                  </div>
                  <span class="font-mono text-gold font-bold">${s.minute}'</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `,
    buttons: [
      { text: 'Tutup Rincian', className: 'btn-primary', action: 'close', onClick: (m) => m.close() }
    ]
  });

  modal.render();
}
