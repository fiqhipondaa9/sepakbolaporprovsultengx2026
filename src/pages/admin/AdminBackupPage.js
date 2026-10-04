/**
 * Admin Export & Import Backup Page
 * PRD: §4.8 AD-04 (Export JSON), AD-05 (Import JSON)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { Toast } from '../../components/Toast.js';
import { DataExportService } from '../../services/DataExportService.js';
import { AuditLogService } from '../../services/AuditLogService.js';

export function AdminBackupPage() {
  setTimeout(() => {
    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          exportBtn.disabled = true;
          exportBtn.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Mengekspor Data...`;

          const fullBackup = await DataExportService.exportAllData();
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', dataStr);
          downloadAnchor.setAttribute('download', `porprov_x_sulteng_backup_${Date.now()}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          await AuditLogService.logActivity(
            'Ekspor Backup Data',
            'Snapshot lengkap database turnamen diunduh format JSON',
            'backup',
            '💾'
          );

          Toast.success('File cadangan JSON database turnamen berhasil diunduh!');
        } catch (err) {
          console.error('Export error:', err);
          Toast.error('Gagal mengekspor data: ' + err.message);
        } finally {
          exportBtn.disabled = false;
          exportBtn.innerHTML = `Unduh File Backup JSON (.json)`;
        }
      });
    }

    const importInput = document.getElementById('import-file-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            const res = await DataExportService.importAllData(parsed);
            await AuditLogService.logActivity(
              'Pulihkan (Restore) Data',
              `Database turnamen dipulihkan (${res.teamsCount} Tim, ${res.matchesCount} Pertandingan)`,
              'backup',
              '📥'
            );
            Toast.success(`Database turnamen berhasil dipulihkan! (${res.teamsCount} Tim, ${res.matchesCount} Pertandingan)`);
            setTimeout(() => {
              window.location.hash = '#/admin';
            }, 1000);
          } catch (err) {
            console.error('Import error:', err);
            Toast.error('Gagal memulihkan database: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }, 0);

  const content = `
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Backup & Restore Data Turnamen</h1>
        <p class="text-sm text-muted">Fitur keamanan ganda untuk mengunduh seluruh database turnamen dalam format JSON atau memulihkan data dari berkas cadangan.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md-grid-cols-2 gap-6">
      <!-- Export Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="color: var(--color-accent);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Backup (JSON)
          </h3>
          <span class="badge badge-gold">AD-04</span>
        </div>
        <p class="text-xs text-muted mb-4">
          Unduh seluruh data turnamen saat ini mencakup 13 tim peserta, skuad pemain, riwayat undian grup, jadwal pertandingan, dan catatan akumulasi kartu ke file JSON lokal komputer Anda.
        </p>

        <button type="button" id="btn-export-json" class="btn btn-primary" style="width: 100%;">
          Unduh File Backup JSON (.json)
        </button>
      </div>

      <!-- Import Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="color: var(--color-secondary-light);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import Restore (JSON)
          </h3>
          <span class="badge badge-teal">AD-05</span>
        </div>
        <p class="text-xs text-muted mb-4">
          Pulihkan database turnamen dari file cadangan JSON yang pernah diexport sebelumnya. Data akan divalidasi integritasnya sebelum diterapkan.
        </p>

        <label class="btn btn-secondary" style="width: 100%; cursor: pointer;">
          <span>Pilih File Backup JSON</span>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" />
        </label>
      </div>
    </div>
  `;

  return wrapAdminLayout(content, '#/admin/export-import');
}
