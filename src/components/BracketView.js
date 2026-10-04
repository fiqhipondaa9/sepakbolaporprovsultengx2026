/**
 * Interactive Knockout Bracket Visualizer Component
 * PRD: §4.4 Babak Eliminasi (JD-08..17), §9.4 Opposite Half Rule
 */

export function createBracketView(matches = [], options = {}) {
  const isAdmin = options.isAdmin || false;

  const qf1 = matches.find(m => m.id === 'qf1');
  const qf2 = matches.find(m => m.id === 'qf2');
  const qf3 = matches.find(m => m.id === 'qf3');
  const qf4 = matches.find(m => m.id === 'qf4');
  const sf1 = matches.find(m => m.id === 'sf1');
  const sf2 = matches.find(m => m.id === 'sf2');
  const bronze = matches.find(m => m.id === 'bronze');
  const final = matches.find(m => m.id === 'final');

  const champion = final?.status === 'FINISHED' ? final.winnerTeam : null;

  function renderTeamBadge(team, defaultColor = '#3B82F6') {
    if (!team) {
      return `<span class="bracket-team-badge bracket-badge-placeholder">?</span>`;
    }

    const isPlaceholder = team.isPlaceholder || !team.id || team.id.startsWith('W-') || team.id.startsWith('L-') || team.code?.startsWith('W-') || team.code?.startsWith('L-');

    if (isPlaceholder) {
      // Strip 'W-' or 'L-' prefix so 'W-QF1' becomes 'QF1' (clean 3 chars)
      const cleanCode = team.code ? team.code.replace(/^[WL]-/, '') : '?';
      return `
        <span class="bracket-team-badge bracket-badge-placeholder" title="${team.name || 'Menunggu Hasil'}">
          ${cleanCode}
        </span>
      `;
    }

    return `
      <span class="bracket-team-badge" style="border-color: ${team.color || defaultColor}; background: ${team.color || defaultColor}25;" title="${team.name}">
        ${(team.code || 'TBD').substring(0, 3).toUpperCase()}
      </span>
    `;
  }

  function renderMatchCard(m, extraClass = '') {
    if (!m) return `<div class="card" style="padding: 1rem; opacity: 0.4;">Belum Tersedia</div>`;

    const isFinished = m.status === 'FINISHED';
    const isLive = m.status === 'LIVE';

    const homeIsWinner = isFinished && m.winnerTeam?.id === m.homeTeam?.id;
    const awayIsWinner = isFinished && m.winnerTeam?.id === m.awayTeam?.id;

    // Score display with Extra Time (AET) & Penalty (PEN) (HS-02, HS-03)
    let scoreDisplay = '- : -';
    if (m.homeTeam?.score !== null && m.awayTeam?.score !== null) {
      if (m.isPenalty) {
        scoreDisplay = `${m.homeTeam.score} (${m.homeTeam.penaltyScore}) : (${m.awayTeam.penaltyScore}) ${m.awayTeam.score} <span class="badge badge-gold" style="font-size: 0.65rem;">PEN</span>`;
      } else if (m.isExtraTime) {
        scoreDisplay = `${m.homeTeam.extraTimeScore} : ${m.awayTeam.extraTimeScore} <span class="badge badge-teal" style="font-size: 0.65rem;">AET</span>`;
      } else {
        scoreDisplay = `${m.homeTeam.score} : ${m.awayTeam.score}`;
      }
    }

    return `
      <div class="card bracket-card ${extraClass} ${isFinished ? 'bracket-finished' : ''}" style="margin: 0; padding: 0.85rem; background: rgba(15, 28, 48, 0.85); border-left: 3px solid ${m.half === 1 ? 'var(--color-teal)' : m.half === 2 ? 'var(--color-accent)' : 'var(--color-gold)'};">
        <div class="flex items-center justify-between mb-2" style="font-size: 0.72rem; color: var(--text-dim);">
          <span class="font-bold">${m.label || m.id.toUpperCase()}</span>
          <span>${m.date || ''} &bull; ${m.time || ''}</span>
        </div>

        <!-- Home Team Row -->
        <div class="flex items-center justify-between mb-1" style="font-size: 0.85rem; padding: 0.2rem 0; ${homeIsWinner ? 'font-weight: 700; color: #34D399;' : ''}">
          <div class="flex items-center gap-2" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">
            ${renderTeamBadge(m.homeTeam, '#3B82F6')}
            <span style="overflow: hidden; text-overflow: ellipsis;">${m.homeTeam?.name || 'TBD'}</span>
            ${m.homeTeam?.slot ? `<span class="badge badge-muted" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;">${m.homeTeam.slot}</span>` : ''}
          </div>
          <span class="font-mono ${homeIsWinner ? 'text-success' : ''}" style="font-size: 0.95rem;">${m.homeTeam?.score !== null && m.homeTeam?.score !== undefined ? m.homeTeam.score : '-'}</span>
        </div>

        <!-- Away Team Row -->
        <div class="flex items-center justify-between" style="font-size: 0.85rem; padding: 0.2rem 0; ${awayIsWinner ? 'font-weight: 700; color: #34D399;' : ''}">
          <div class="flex items-center gap-2" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;">
            ${renderTeamBadge(m.awayTeam, '#EF4444')}
            <span style="overflow: hidden; text-overflow: ellipsis;">${m.awayTeam?.name || 'TBD'}</span>
            ${m.awayTeam?.slot ? `<span class="badge badge-muted" style="font-size: 0.6rem; padding: 0.1rem 0.3rem;">${m.awayTeam.slot}</span>` : ''}
          </div>
          <span class="font-mono ${awayIsWinner ? 'text-success' : ''}" style="font-size: 0.95rem;">${m.awayTeam?.score !== null && m.awayTeam?.score !== undefined ? m.awayTeam.score : '-'}</span>
        </div>

        <!-- Status / Venue Footer -->
        <div class="flex items-center justify-between mt-2 pt-2" style="border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.7rem; color: var(--text-dim);">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">📍 ${m.venueName || 'Stadion'}</span>
          <div class="flex items-center gap-1">
            ${m.isPenalty ? '<span class="badge badge-gold" style="font-size: 0.65rem;">Penalti</span>' : ''}
            ${m.isExtraTime ? '<span class="badge badge-teal" style="font-size: 0.65rem;">Extra Time</span>' : ''}
            ${isFinished ? '<span class="badge badge-success" style="font-size: 0.65rem;">Selesai</span>' : ''}
            ${isAdmin ? `
              <button type="button" class="btn btn-primary btn-sm btn-edit-knockout-match" data-match-id="${m.id}" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;">
                ✏️ Input Hasil
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <!-- Champion Spotlight Podium (If Final Finished) -->
    ${champion ? `
      <div class="card mb-6 text-center" style="background: linear-gradient(135deg, rgba(245, 166, 35, 0.15) 0%, rgba(10, 22, 40, 0.9) 100%); border: 2px solid var(--color-accent); padding: 2rem;">
        <div style="font-size: 3.5rem; margin-bottom: 0.5rem; animation: bounce 2s infinite;">🏆</div>
        <span class="badge badge-gold font-bold mb-2" style="font-size: 0.85rem; padding: 0.4rem 1rem;">JUARA 1 &bull; MEDALI EMAS</span>
        <h2 style="font-size: 2.2rem; color: var(--color-accent); margin: 0.25rem 0;">${champion.name}</h2>
        <p class="text-sm text-muted">Selamat kepada kontingen ${champion.name} atas gelar Juara Sepak Bola PORPROV X Sulawesi Tengah 2026!</p>
      </div>
    ` : ''}

    <!-- Opposites Halves Structural Layout -->
    <div style="overflow-x: auto; padding-bottom: 1rem;">
      <div style="min-width: 1040px; display: flex; flex-direction: column; gap: 2rem;">
        
        <!-- PARUH ATAS / SEPARUH 1 (Menuju Semifinal 1) -->
        <div style="background: rgba(0, 191, 166, 0.03); border: 1px dashed rgba(0, 191, 166, 0.2); border-radius: var(--radius-lg); padding: 1.25rem;">
          <div class="flex items-center gap-2 mb-3">
            <span class="badge badge-teal font-bold">SEPARUH 1 (PARUH ATAS)</span>
            <span class="text-xs text-muted">Jalur Eliminasi Menuju Semifinal 1 &bull; Opposite Half Rule Protected</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: center;">
            <!-- QF 1 & QF 2 -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${renderMatchCard(qf1)}
              ${renderMatchCard(qf2)}
            </div>

            <!-- Semifinal 1 -->
            <div>
              ${renderMatchCard(sf1, 'sf-card')}
            </div>
          </div>
        </div>

        <!-- THE GRAND FINALS (Centerpiece) -->
        <div style="background: rgba(245, 166, 35, 0.05); border: 1px solid rgba(245, 166, 35, 0.3); border-radius: var(--radius-lg); padding: 1.25rem;">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="badge badge-gold font-bold">BABAK PUNCAK TURNAMEN</span>
              <span class="text-xs text-muted">Stadion Utama Morowali &bull; Perebutan Medali</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
            <!-- Perebutan Juara 3 (Bronze) -->
            <div>
              <div class="text-xs text-muted mb-1 flex items-center gap-1">
                <span>🥉</span> <strong>Perebutan Medali Perunggu (Juara 3)</strong>
              </div>
              ${renderMatchCard(bronze)}
            </div>

            <!-- Grand Final (Gold & Silver) -->
            <div>
              <div class="text-xs text-gold mb-1 flex items-center gap-1 font-bold">
                <span>🥇</span> <strong>Grand Final (Medali Emas & Perak)</strong>
              </div>
              ${renderMatchCard(final, 'final-card')}
            </div>
          </div>
        </div>

        <!-- PARUH BAWAH / SEPARUH 2 (Menuju Semifinal 2) -->
        <div style="background: rgba(245, 166, 35, 0.03); border: 1px dashed rgba(245, 166, 35, 0.2); border-radius: var(--radius-lg); padding: 1.25rem;">
          <div class="flex items-center gap-2 mb-3">
            <span class="badge badge-gold font-bold">SEPARUH 2 (PARUH BAWAH)</span>
            <span class="text-xs text-muted">Jalur Eliminasi Menuju Semifinal 2 &bull; Opposite Half Rule Protected</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: center;">
            <!-- QF 3 & QF 4 -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${renderMatchCard(qf3)}
              ${renderMatchCard(qf4)}
            </div>

            <!-- Semifinal 2 -->
            <div>
              ${renderMatchCard(sf2, 'sf-card')}
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}
