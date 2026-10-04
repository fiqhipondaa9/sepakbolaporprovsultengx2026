/**
 * Admin Audit Log Page
 * PRD: §4.8 AD-08 (Audit Log Aktivitas Panitia Pelaksana Lengkap)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { AuditLogService } from '../../services/AuditLogService.js';
import { exportElementToPrint } from '../../utils/exportImage.js';

export async function AdminAuditLogPage() {
  const crumbs = [
    { label: 'Dashboard', href: '#/admin' },
    { label: 'Audit Log Aktivitas', href: null }
  ];

  const logs = await AuditLogService.getAllActivities();

  const content = `
    ${createBreadcrumb(crumbs)}

    <!-- Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Audit Log Aktivitas Panitia</h1>
          <span class="badge badge-teal font-bold" id="badge-total-logs">
            ${logs.length} Log Tercatat
          </span>
        </div>
        <p class="text-sm text-muted">Rekam jejak seluruh tindakan dan perubahan data yang dilakukan oleh panitia pelaksana (AD-08).</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-print-audit-log" class="btn btn-outline btn-sm">
          <span>🖨️ Cetak Audit Log (PDF)</span>
        </button>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.location.reload()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="card mb-6" style="padding: 1rem 1.25rem;">
      <div class="grid grid-cols-1 sm-grid-cols-3 gap-3">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">CARI AKTIVITAS / ADMIN</label>
          <input type="text" id="filter-log-search" class="form-input" placeholder="Ketik kata kunci..." style="padding: 0.45rem 0.75rem;" />
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">KATEGORI AKSI</label>
          <select id="filter-log-category" class="form-select" style="padding: 0.45rem 0.75rem;">
            <option value="all">Semua Kategori</option>
            <option value="auth">🔐 Autentikasi (Login/Logout)</option>
            <option value="draw">🎲 Pengundian & Seeded</option>
            <option value="schedule">📅 Penjadwalan & Venue</option>
            <option value="match">⚽ Hasil Pertandingan & Kartu</option>
            <option value="team">👥 Tim & Pemain</option>
            <option value="settings">⚙️ Pengaturan Turnamen</option>
            <option value="backup">💾 Backup & Restore</option>
            <option value="system">🔥 Sistem & Infrastruktur</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">STATUS PENCATATAN</label>
          <div style="padding: 0.55rem 0; font-size: 0.85rem; color: var(--color-secondary-light); font-weight: 600;">
            ● Active Real-Time Logging
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs Container -->
    <div id="audit-log-print-container" class="card" style="padding: 1.25rem;">
      <div class="flex items-center justify-between mb-4">
        <h3 style="font-size: 1.15rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span>📋</span>
          Riwayat Seluruh Aktivitas Panitia
        </h3>
        <span class="text-xs text-muted" id="log-count-display">Menampilkan ${logs.length} aktivitas</span>
      </div>

      <div id="logs-list-wrapper" style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${logs.length === 0 ? `
          <div class="text-center" style="padding: 3rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📋</div>
            <p>Belum ada riwayat aktivitas yang tercatat.</p>
          </div>
        ` : logs.map((log) => `
          <div class="audit-log-row flex items-start justify-between" 
               data-category="${log.category || 'system'}" 
               data-text="${((log.action || '') + ' ' + (log.details || '') + ' ' + (log.admin || '')).toLowerCase()}"
               style="padding: 0.75rem 1rem; border-radius: var(--radius-md); background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); gap: 1rem; flex-wrap: wrap;">
            
            <div class="flex items-start gap-3" style="min-width: 0; flex: 1;">
              <span style="font-size: 1.35rem; margin-top: 0.1rem; flex-shrink: 0;">${log.icon || '📝'}</span>
              <div style="min-width: 0;">
                <div class="flex items-center gap-2 mb-1" style="flex-wrap: wrap;">
                  <strong style="color: var(--text-main); font-size: 0.95rem;">${log.action}</strong>
                  <span class="badge badge-dim" style="font-size: 0.7rem; text-transform: uppercase;">${log.category || 'system'}</span>
                </div>
                <p class="text-sm text-muted" style="margin: 0 0 0.35rem 0; line-height: 1.4;">${log.details}</p>
                <div class="text-xs text-dim">
                  Petugas: <strong class="text-teal">${log.admin || 'Panitia Pelaksana'}</strong>
                </div>
              </div>
            </div>

            <div style="text-align: right; flex-shrink: 0; min-width: 140px;">
              <span class="badge badge-teal font-mono" style="font-size: 0.72rem; margin-bottom: 0.25rem;">
                ${AuditLogService.formatRelativeTime(log.timestamp)}
              </span>
              <div class="text-xs text-dim" style="font-family: monospace; font-size: 0.7rem;">
                ${AuditLogService.formatFullDateTime(log.timestamp)}
              </div>
            </div>

          </div>
        `).join('')}
      </div>
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/audit-log'),
    init: () => {
      // 1. Export / Print listener
      const printBtn = document.getElementById('btn-print-audit-log');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          exportElementToPrint('audit-log-print-container', 'AUDIT LOG AKTIVITAS PANITIA PELAKSANA PORPROV X SULTENG 2026');
        });
      }

      // 2. Filter & Search listeners
      const searchInput = document.getElementById('filter-log-search');
      const categorySelect = document.getElementById('filter-log-category');
      const countDisplay = document.getElementById('log-count-display');

      function filterLogs() {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const cat = categorySelect?.value || 'all';

        let visibleCount = 0;
        document.querySelectorAll('.audit-log-row').forEach(row => {
          const rowCat = row.getAttribute('data-category') || '';
          const rowText = row.getAttribute('data-text') || '';

          const matchCat = cat === 'all' || rowCat === cat;
          const matchQuery = !query || rowText.includes(query);

          if (matchCat && matchQuery) {
            row.style.display = 'flex';
            visibleCount++;
          } else {
            row.style.display = 'none';
          }
        });

        if (countDisplay) {
          countDisplay.textContent = `Menampilkan ${visibleCount} dari ${logs.length} aktivitas`;
        }
      }

      if (searchInput) searchInput.addEventListener('input', filterLogs);
      if (categorySelect) categorySelect.addEventListener('change', filterLogs);
    }
  };
}
