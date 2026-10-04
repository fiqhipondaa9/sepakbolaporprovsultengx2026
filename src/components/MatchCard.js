/**
 * Reusable Match Card Component
 * PRD: §6.4 Match Card, §4.9 PB-04 Detail Pertandingan
 */
import { showMatchDetailModal } from './MatchDetailModal.js';
import { MatchService } from '../services/MatchService.js';

export function createMatchCard(match) {
  let statusBadge = '';
  if (match.status === 'LIVE') {
    statusBadge = `<span class="badge badge-live">● LIVE ${match.minute ? `${match.minute}'` : ''}</span>`;
  } else if (match.status === 'FINISHED' || match.status === 'WALKOVER') {
    statusBadge = `<span class="badge badge-teal">SELESAI</span>`;
  } else {
    statusBadge = `<span class="badge badge-muted">${match.time || 'JADWAL'}</span>`;
  }

  const homeScore = match.status !== 'SCHEDULED' && match.homeTeam.score !== null ? match.homeTeam.score : '-';
  const awayScore = match.status !== 'SCHEDULED' && match.awayTeam.score !== null ? match.awayTeam.score : '-';

  return `
    <div class="match-card">
      <div class="match-card-meta">
        <span style="font-weight: 600; color: var(--color-accent);">${match.stage || `Grup ${match.groupId || ''}`}</span>
        ${statusBadge}
      </div>

      <div class="match-card-teams">
        <!-- Home Team -->
        <div class="match-team" title="${match.homeTeam.name}">
          <div class="team-badge-circle" style="border-color: ${match.homeTeam.color || '#3B82F6'}; background: ${match.homeTeam.color}33;">
            ${match.homeTeam.code || match.homeTeam.name.substring(0, 3).toUpperCase()}
          </div>
          <div class="match-team-name">${match.homeTeam.name}</div>
        </div>

        <!-- Score / VS Box -->
        <div class="match-score-box">
          ${match.status === 'SCHEDULED' ? `
            <div class="match-vs">VS</div>
          ` : `
            <div class="match-score">${homeScore}&nbsp;-&nbsp;${awayScore}</div>
            ${match.isPenalty ? `<span class="badge badge-gold" style="font-size: 0.6rem; margin-top: 2px;">Pen: ${match.homeTeam.penaltyScore}-${match.awayTeam.penaltyScore}</span>` : ''}
            ${match.isExtraTime ? `<span class="badge badge-teal" style="font-size: 0.6rem; margin-top: 2px;">AET</span>` : ''}
          `}
        </div>

        <!-- Away Team -->
        <div class="match-team away" title="${match.awayTeam.name}">
          <div class="team-badge-circle" style="border-color: ${match.awayTeam.color || '#EF4444'}; background: ${match.awayTeam.color}33;">
            ${match.awayTeam.code || match.awayTeam.name.substring(0, 3).toUpperCase()}
          </div>
          <div class="match-team-name">${match.awayTeam.name}</div>
        </div>
      </div>

      <div class="match-card-footer">
        <span class="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${match.date} &bull; ${match.time}
        </span>
        <button type="button" class="btn btn-ghost btn-sm text-gold btn-view-match-detail" data-match-id="${match.id}" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;">
          Detail Laga &rarr;
        </button>
      </div>
    </div>
  `;
}

export function initMatchCardDetails(matches = []) {
  document.querySelectorAll('.btn-view-match-detail').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-match-id');
      try {
        const fresh = await MatchService.getById(id);
        if (fresh) {
          showMatchDetailModal(fresh);
          return;
        }
      } catch (err) {
        console.warn('Gagal memuat rincian terbaru, menggunakan data cache:', err);
      }
      const found = matches.find(m => m.id === id);
      if (found) {
        showMatchDetailModal(found);
      }
    });
  });
}
