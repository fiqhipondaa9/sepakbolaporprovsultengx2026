/**
 * Admin Dashboard Overview Page
 * PRD: §4.8 AD-02 (Dashboard Ringkasan), AD-03 (Navigasi Cepat)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { TournamentService } from '../../services/TournamentService.js';
import { TeamService } from '../../services/TeamService.js';
import { MatchService } from '../../services/MatchService.js';
import { CardService } from '../../services/CardService.js';
import { AuditLogService } from '../../services/AuditLogService.js';

export async function AdminDashboardPage() {
  const [tournament, teams, matches, suspendedPlayers, recentLogs] = await Promise.all([
    TournamentService.getInfo(),
    TeamService.getAll(),
    MatchService.getAll(),
    CardService.getSuspendedPlayers(),
    AuditLogService.getRecentActivities(6)
  ]);

  const seededTeamsCount = teams.filter(t => t.isSeeded).length;
  const finishedMatchesCount = matches.filter(m => m.status === 'FINISHED').length;

  const content = `
    <!-- Top Greeting & Status -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Dashboard Panitia Pelaksana</h1>
          <span class="badge badge-gold">Turnamen Aktif &bull; ${tournament.status || 'BERLANGSUNG'}</span>
        </div>
        <p class="text-sm text-muted">${tournament.name} &bull; ${tournament.sport}</p>
      </div>

      <div class="flex items-center gap-2">
        <a href="#/admin/pengundian" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
            <path d="M2 12h20"></path>
          </svg>
          <span>Mulai Pengundian Grup</span>
        </a>
      </div>
    </div>

    <!-- Quick Stats Grid (AD-02) -->
    <div class="grid grid-cols-2 md-grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 166, 35, 0.15); color: var(--color-accent);">👥</div>
        <div>
          <div class="stat-value text-gold" id="stat-teams-count">${teams.length}</div>
          <div class="stat-label">Tim Terdaftar</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 191, 166, 0.15); color: var(--color-secondary-light);">⭐</div>
        <div>
          <div class="stat-value text-teal">${seededTeamsCount}</div>
          <div class="stat-label">Tim Seeded (Unggulan)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(34, 197, 94, 0.15); color: var(--color-success);">⚽</div>
        <div>
          <div class="stat-value text-success">${matches.length}</div>
          <div class="stat-label">Pertandingan (${finishedMatchesCount} Selesai)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--color-danger);">🟨</div>
        <div>
          <div class="stat-value text-danger">${suspendedPlayers.length}</div>
          <div class="stat-label">Pemain Kena Skorsing</div>
        </div>
      </div>
    </div>

    <!-- Quick Action Navigation Cards (PRD §4.8 AD-03) -->
    <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Aksi Cepat Manajemen</h2>
    <div class="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-3 gap-4 mb-8">
      
      <div class="card card-interactive" onclick="window.location.hash = '#/admin/pengundian'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem;">🎲</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Pengundian & Seeded</h3>
        </div>
        <p class="text-xs text-muted mb-3">Undi grup babak penyisihan dengan animasi bola acak & proteksi tim unggulan.</p>
        <span class="text-xs text-gold font-bold">Buka Drawing Room &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/jadwal'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(0, 191, 166, 0.15); color: var(--color-secondary-light);">📅</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Penyusunan Jadwal</h3>
        </div>
        <p class="text-xs text-muted mb-3">Susun jadwal otomatis dengan rest-day seimbang dan manajemen venue.</p>
        <span class="text-xs text-teal font-bold">Kelola Jadwal &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/hasil'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(34, 197, 94, 0.15); color: var(--color-success);">📝</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Input Hasil & Kartu</h3>
        </div>
        <p class="text-xs text-muted mb-3">Catat skor, pencetak gol, kartu kuning/merah, dan auto-update klasemen.</p>
        <span class="text-xs text-success font-bold">Input Pertandingan &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/tim'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(59, 130, 246, 0.15); color: #3B82F6;">👥</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Kelola Tim & Pemain</h3>
        </div>
        <p class="text-xs text-muted mb-3">Entri pemain, nomor punggung, data official, dan status verifikasi tim.</p>
        <span class="text-xs" style="color: #60A5FA; font-weight: 700;">Kelola Tim &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/pengaturan'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(234, 179, 8, 0.15); color: #EAB308;">⚙️</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Pengaturan Turnamen</h3>
        </div>
        <p class="text-xs text-muted mb-3">Atur tanggal turnamen, batas kartu kuning akumulasi, dan aturan eliminasi.</p>
        <span class="text-xs text-gold font-bold">Konfigurasi &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/export-import'">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(168, 85, 247, 0.15); color: #C084FC;">💾</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Backup & Restore Data</h3>
        </div>
        <p class="text-xs text-muted mb-3">Export/import data turnamen lengkap format JSON untuk keamanan ganda.</p>
        <span class="text-xs" style="color: #C084FC; font-weight: 700;">Backup / Restore &rarr;</span>
      </div>

      <div class="card card-interactive" onclick="window.location.hash = '#/admin/panduan'" style="border-color: rgba(0, 191, 166, 0.35); background: linear-gradient(135deg, rgba(0, 191, 166, 0.05) 0%, rgba(10, 22, 40, 0.6) 100%);">
        <div class="flex items-center gap-3 mb-2">
          <div class="stat-icon" style="width: 40px; height: 40px; font-size: 1.2rem; background: rgba(0, 191, 166, 0.15); color: var(--color-secondary-light);">📖</div>
          <h3 style="font-size: 1.1rem; margin: 0;">Buku Panduan Aplikasi</h3>
        </div>
        <p class="text-xs text-muted mb-3">Petunjuk lengkap alur operasional turnamen A-Z, regulasi tie-breaker, dan FAQ.</p>
        <span class="text-xs text-teal font-bold">Buka Buku Panduan &rarr;</span>
      </div>

    </div>

    <!-- Recent System Activity Log (PRD §4.8 AD-08) -->
    <div class="card" style="padding: 1.25rem;">
      <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
        <div class="flex items-center gap-2">
          <h3 style="font-size: 1.15rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>📋</span>
            Aktivitas Sistem Terkini (Audit Log AD-08)
          </h3>
          <span class="badge badge-teal" style="font-size: 0.72rem; font-weight: 600;">
            ● Merekam Aktivitas Admin
          </span>
        </div>

        <a href="#/admin/audit-log" class="btn btn-outline btn-sm" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">
          Lihat Log Keseluruhan &rarr;
        </a>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.85rem;">
        ${recentLogs.length === 0 ? `
          <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">
            Belum ada aktivitas tercatat. Setiap aksi panitia akan otomatis tersimpan di sini.
          </div>
        ` : recentLogs.map((log, idx) => `
          <div class="flex items-center justify-between" style="padding: 0.5rem 0; ${idx < recentLogs.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''}; flex-wrap: wrap; gap: 0.5rem;">
            <div class="flex items-center gap-2" style="min-width: 0; flex: 1;">
              <span style="font-size: 1.15rem; flex-shrink: 0;">${log.icon || '📝'}</span>
              <div style="min-width: 0;">
                <div style="font-weight: 600; color: var(--text-main);">
                  ${log.action}
                  <span class="text-xs text-muted" style="font-weight: normal; margin-left: 0.35rem;">&bull; ${log.details}</span>
                </div>
                <div class="text-xs text-dim" style="margin-top: 0.15rem;">
                  Oleh: <span class="text-teal font-bold">${log.admin || 'Panitia'}</span>
                </div>
              </div>
            </div>
            <span class="text-xs text-dim" style="flex-shrink: 0; font-family: monospace;">
              ${AuditLogService.formatRelativeTime(log.timestamp)}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return wrapAdminLayout(content, '#/admin');
}
