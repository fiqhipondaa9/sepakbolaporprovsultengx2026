/**
 * Public Statistics Page
 * PRD: §4.7 Statistik (ST-01..05), §4.9 PB-07, §5.2 Akumulasi Kartu
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { GoalService } from '../../services/GoalService.js';
import { CardService } from '../../services/CardService.js';
import { TeamService } from '../../services/TeamService.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { createBarChart, createDonutChart } from '../../components/Chart.js';

export async function StatsPage() {
  const crumbs = [{ label: 'Statistik & Fair Play', href: null }];

  const [allGoals, cardReport, allTeams, allMatches] = await Promise.all([
    GoalService.getAll(),
    CardService.getDisciplinaryReport(),
    TeamService.getAll(),
    ScheduleService.getAllMatches()
  ]);

  // 1. Process Top Scorers (Sepatu Emas) (ST-01)
  const scorerMap = {};
  allGoals.forEach(g => {
    const key = `${g.playerName}_${g.teamId}`;
    if (!scorerMap[key]) {
      scorerMap[key] = {
        name: g.playerName,
        teamName: g.teamName,
        teamId: g.teamId,
        goals: 0,
        penalties: 0
      };
    }
    scorerMap[key].goals += 1;
    if (g.type === 'penalty') {
      scorerMap[key].penalties += 1;
    }
  });

  const topScorers = Object.values(scorerMap)
    .sort((a, b) => b.goals - a.goals || a.penalties - b.penalties)
    .slice(0, 10);

  // 2. Process Team Fair Play Rankings (ST-03)
  const teamDisciplineMap = {};
  allTeams.forEach(t => {
    teamDisciplineMap[t.id] = {
      id: t.id,
      name: t.name,
      code: t.code,
      color: t.color,
      yellowCards: 0,
      redCards: 0,
      fairPlayPoints: 0
    };
  });

  cardReport.players.forEach(p => {
    if (teamDisciplineMap[p.teamId]) {
      const td = teamDisciplineMap[p.teamId];
      td.yellowCards += p.yellowCards;
      td.redCards += (p.redCards + p.secondYellowCards);
      td.fairPlayPoints -= p.fairPlayPenalty;
    }
  });

  const fairPlayRanking = Object.values(teamDisciplineMap)
    .sort((a, b) => b.fairPlayPoints - a.fairPlayPoints); // Closer to 0 is better

  // 3. Tournament Summary Metrics (ST-04)
  const finishedMatches = allMatches.filter(m => m.status === 'FINISHED' || m.status === 'WALKOVER');
  const totalGoalsCount = allGoals.length;
  const avgGoals = finishedMatches.length > 0 
    ? (totalGoalsCount / finishedMatches.length).toFixed(2) 
    : '0.00';

  // 4. Chart Data Preparation (ST-05)
  const teamGoalBars = allTeams.map(t => {
    const count = allGoals.filter(g => g.teamId === t.id).length;
    return { label: t.code, value: count, color: t.color || '#3B82F6' };
  });

  const winsCount = finishedMatches.filter(m => m.homeTeam?.score !== m.awayTeam?.score).length;
  const drawsCount = finishedMatches.filter(m => m.homeTeam?.score === m.awayTeam?.score).length;
  const matchResultsData = [
    { label: 'Menang / Kalah', value: winsCount > 0 ? winsCount : 1, color: '#10B981' },
    { label: 'Seri (Draw)', value: drawsCount, color: '#F59E0B' }
  ];

  const content = `
    ${createBreadcrumb(crumbs)}

    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Statistik & Fair Play</h1>
        <p class="text-sm text-muted">Daftar top scorer turnamen, kedisiplinan tim, serta visualisasi grafik analitik pertandingan.</p>
      </div>

      <div class="badge badge-teal" style="padding: 0.4rem 0.85rem;">
        <span>Update Otomatis Real-time</span>
      </div>
    </div>

    <!-- Tournament Overview Cards (ST-04) -->
    <div class="grid grid-cols-2 sm-grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 166, 35, 0.15); color: var(--color-accent);">⚽</div>
        <div>
          <div class="stat-value text-gold">${totalGoalsCount}</div>
          <div class="stat-label">Total Gol Tercipta</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 191, 166, 0.15); color: var(--color-teal);">⚡</div>
        <div>
          <div class="stat-value text-teal">${avgGoals}</div>
          <div class="stat-label">Rata-rata Gol / Laga</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--color-danger);">🚫</div>
        <div>
          <div class="stat-value text-danger">${cardReport.suspendedPlayers.length}</div>
          <div class="stat-label">Pemain Diskors</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3B82F6;">🟨</div>
        <div>
          <div class="stat-value" style="color: #60A5FA;">${cardReport.totalCardsCount}</div>
          <div class="stat-label">Total Kartu Disiplin</div>
        </div>
      </div>
    </div>

    <!-- Charts Section (ST-05) -->
    <div class="grid grid-cols-1 md-grid-cols-3 gap-6 mb-6">
      <div style="grid-column: span 2;">
        ${createBarChart({ data: teamGoalBars, title: 'Distribusi Gol per Tim Daerah', height: 210 })}
      </div>
      <div>
        ${createDonutChart({ data: matchResultsData, title: 'Hasil Pertandingan' })}
      </div>
    </div>

    <!-- Active Suspensions Alert (AK-02, AK-03) -->
    ${cardReport.suspendedPlayers.length > 0 ? `
      <div class="card mb-6" style="border-left: 4px solid var(--color-danger); background: rgba(239, 68, 68, 0.06); padding: 1.25rem;">
        <div class="card-title text-danger mb-2" style="font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🚫</span>
          Daftar Pemain Terkena Sanksi Skorsing Laga Berikutnya (AK-02, AK-03)
        </div>
        <p class="text-xs text-muted mb-3">Sesuai regulasi PSSI & PORPROV, pemain dengan 2 kartu kuning akumulasi atau 1 kartu merah langsung dilarang bertanding pada laga selanjutnya.</p>
        
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Pemain</th>
                <th>Kontingen Tim</th>
                <th style="text-align: center;">Kartu Kuning</th>
                <th style="text-align: center;">Kartu Merah</th>
                <th>Alasan Sanksi</th>
                <th style="text-align: center;">Hukuman</th>
              </tr>
            </thead>
            <tbody>
              ${cardReport.suspendedPlayers.map(p => `
                <tr>
                  <td style="font-weight: 700; color: #F87171;">${p.playerName}</td>
                  <td>${p.teamName}</td>
                  <td style="text-align: center;" class="mono text-gold font-bold">${p.yellowCards}</td>
                  <td style="text-align: center;" class="mono text-danger font-bold">${p.redCards + p.secondYellowCards}</td>
                  <td><span class="badge badge-danger">${p.suspensionReason}</span></td>
                  <td style="text-align: center;"><span class="badge badge-danger">Skors 1 Match</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    <!-- Top Scorer & Discipline Grid -->
    <div class="grid grid-cols-1 md-grid-cols-2 gap-6">
      
      <!-- Top Scorer (ST-01) -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 1.15rem; color: var(--color-accent); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span>👟</span>
            Top Scorer (Pencetak Gol Terbanyak)
          </h3>
          <span class="badge badge-gold">Sepatu Emas</span>
        </div>

        ${topScorers.length === 0 ? `
          <div class="text-center text-muted" style="padding: 2.5rem 0;">Belum ada gol yang dicatat dalam turnamen.</div>
        ` : `
          <div class="table-responsive" style="border: none; border-radius: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">Pos</th>
                  <th>Nama Pemain</th>
                  <th>Asal Tim</th>
                  <th style="text-align: center;">Penalti</th>
                  <th style="text-align: center;">Total Gol</th>
                </tr>
              </thead>
              <tbody>
                ${topScorers.map((s, idx) => `
                  <tr>
                    <td style="text-align: center; font-weight: 700; color: ${idx === 0 ? 'var(--color-accent)' : 'var(--text-muted)'};">${idx + 1}</td>
                    <td style="font-weight: 600;">${s.name}</td>
                    <td class="text-muted text-sm">${s.teamName}</td>
                    <td style="text-align: center;" class="mono text-dim">${s.penalties}</td>
                    <td style="text-align: center;" class="points text-gold">${s.goals}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Fair Play Ranking (ST-03) -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <h3 style="font-size: 1.15rem; color: var(--color-secondary-light); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span>🤝</span>
            Klasemen Fair Play Tim
          </h3>
          <span class="badge badge-teal">Paling Disiplin</span>
        </div>

        <div class="table-responsive" style="border: none; border-radius: 0;">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">Pos</th>
                <th>Tim</th>
                <th style="text-align: center;">🟨 Kuning (-1)</th>
                <th style="text-align: center;">🟥 Merah (-4)</th>
                <th style="text-align: center;">Poin Fair Play</th>
              </tr>
            </thead>
            <tbody>
              ${fairPlayRanking.map((t, idx) => `
                <tr>
                  <td style="text-align: center; font-weight: 700; color: ${idx === 0 ? 'var(--color-teal)' : 'var(--text-muted)'};">${idx + 1}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="team-badge-circle" style="width: 24px; height: 24px; font-size: 0.65rem; border-color: ${t.color};">${t.code}</span>
                      <strong>${t.name}</strong>
                    </div>
                  </td>
                  <td style="text-align: center;" class="mono text-gold">${t.yellowCards}</td>
                  <td style="text-align: center;" class="mono text-danger">${t.redCards}</td>
                  <td style="text-align: center;" class="mono font-bold ${t.fairPlayPoints < 0 ? 'text-danger' : 'text-success'}">
                    ${t.fairPlayPoints} FP
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return wrapPublicLayout(content, '#/statistik');
}
