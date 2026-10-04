/**
 * Admin Tournament Settings Page
 * PRD: §4.8 AD-06 (Reset Turnamen), AD-07 (Pengaturan), §5.2 AK-05, AK-06
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { Toast } from '../../components/Toast.js';
import { Modal } from '../../components/Modal.js';
import { TournamentService } from '../../services/TournamentService.js';
import { AuditLogService } from '../../services/AuditLogService.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { BracketService } from '../../services/BracketService.js';

export async function AdminSettingsPage() {
  const [currentInfo, allMatches, knockoutMatches] = await Promise.all([
    TournamentService.getInfo(),
    ScheduleService.getAllMatches(),
    BracketService.getAll()
  ]);

  const groupMatches = allMatches.filter(m => !m.stage || m.stage.includes('Grup') || m.groupId);
  const firstScheduledDate = groupMatches[0]?.dateIso;
  const finalMatch = knockoutMatches.find(m => m.id === 'final');

  // Derive synchronized dates
  const initialStartDate = firstScheduledDate || currentInfo.startDate || '2026-12-06';
  const initialFinalDate = finalMatch?.dateIso || currentInfo.finalDate || '2026-12-14';

  setTimeout(() => {
    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        try {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px;"></span> Menyimpan...`;

          const name = document.getElementById('setting-name')?.value;
          const startDate = document.getElementById('setting-start-date')?.value;
          const finalDate = document.getElementById('setting-final-date')?.value;
          const cardLimit = parseInt(document.getElementById('setting-card-limit')?.value || '2', 10);
          const cardReset = document.getElementById('setting-card-reset')?.value;

          await TournamentService.updateInfo({
            name,
            startDate,
            finalDate,
            cardAccumulationLimit: cardLimit,
            resetCardsAtStage: cardReset
          });

          await AuditLogService.logActivity(
            'Ubah Pengaturan Turnamen',
            `Regulasi turnamen diperbarui (Batas ${cardLimit} KK, Pemutihan: ${cardReset})`,
            'settings',
            '⚙️'
          );

          Toast.success('Pengaturan turnamen berhasil disimpan ke database!');
        } catch (err) {
          Toast.error('Gagal menyimpan pengaturan: ' + err.message);
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = `Simpan Perubahan`;
        }
      });
    }

    const resetBtn = document.getElementById('btn-reset-tournament');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const modal = new Modal({
          title: '⚠️ Konfirmasi Reset Turnamen (Tindakan Kritis AD-06)',
          content: `
            <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main);">
              <p style="color: var(--color-danger); font-weight: 700; margin-bottom: 0.5rem;">
                PERINGATAN: Tindakan ini akan mengosongkan seluruh jadwal pertandingan, hasil skor, catatan kartu, dan riwayat pengundian grup!
              </p>
              <p class="text-xs text-muted mb-3">Ketik kata kunci <strong>RESET-PORPROV-2026</strong> di bawah ini untuk mengonfirmasi:</p>
              <input type="text" id="confirm-reset-input" class="form-input" placeholder="RESET-PORPROV-2026" autofocus />
            </div>
          `,
          buttons: [
            { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
            { 
              text: 'Ya, Reset Seluruh Data', 
              className: 'btn-danger', 
              action: 'confirm', 
              onClick: async (m) => {
                const val = document.getElementById('confirm-reset-input')?.value;
                if (val === 'RESET-PORPROV-2026') {
                  m.close();
                  try {
                    await TournamentService.resetTournament();
                    await AuditLogService.logActivity(
                      'Reset Turnamen',
                      'Seluruh jadwal, skor, kartu, dan hasil undian di-reset oleh panitia',
                      'settings',
                      '⚠️'
                    );
                    Toast.success('Turnamen telah berhasil direset ke status persiapan awal!');
                    setTimeout(() => window.location.hash = '#/admin', 1000);
                  } catch (err) {
                    Toast.error('Gagal mereset turnamen: ' + err.message);
                  }
                } else {
                  Toast.error('Kata kunci konfirmasi tidak sesuai! Reset dibatalkan.');
                }
              }
            }
          ]
        });
        modal.render();
      });
    }
  }, 0);

  const content = `
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Pengaturan Turnamen</h1>
        <p class="text-sm text-muted">Konfigurasi parameter kompetisi, regulasi kartu, format babak gugur, dan status turnamen.</p>
      </div>

      <button type="button" id="btn-save-settings" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        <span>Simpan Perubahan</span>
      </button>
    </div>

    <!-- General Settings -->
    <div class="card mb-6">
      <h3 style="font-size: 1.15rem; margin-bottom: 1.25rem;">Informasi Umum Kompetisi</h3>
      
      <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Nama Turnamen (AD-07)</label>
          <input type="text" id="setting-name" class="form-input" value="${currentInfo.name || 'PORPROV X SULAWESI TENGAH 2026'}" />
        </div>

        <div class="form-group">
          <label class="form-label">Cabang Olahraga & Kategori</label>
          <input type="text" class="form-input" value="${currentInfo.sport || 'Sepak Bola Putra'}" readonly />
        </div>

        <div class="form-group">
          <label class="form-label">Tanggal Mulai Pertandingan</label>
          <input type="date" id="setting-start-date" class="form-input" value="${initialStartDate}" />
          ${firstScheduledDate ? `<span class="text-xs text-muted" style="display: block; margin-top: 0.25rem;">📍 Laga grup pertama terjadwal: <strong>${firstScheduledDate}</strong></span>` : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Tanggal Partai Final</label>
          <input type="date" id="setting-final-date" class="form-input" value="${initialFinalDate}" />
          ${finalMatch?.date ? `<span class="text-xs text-muted" style="display: block; margin-top: 0.25rem;">🏆 Grand Final bagan: <strong>${finalMatch.date}</strong></span>` : ''}
        </div>
      </div>
    </div>

    <!-- Rules & Regulations Settings -->
    <div class="card mb-6">
      <h3 style="font-size: 1.15rem; margin-bottom: 1.25rem;">Regulasi Pertandingan & Kartu</h3>

      <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Batas Akumulasi Kartu Kuning (PRD §5.2 AK-05)</label>
          <select class="form-select" id="setting-card-limit">
            <option value="2" ${currentInfo.cardAccumulationLimit === 2 ? 'selected' : ''}>2 Kartu Kuning &rarr; Skorsing 1 Pertandingan (Standar PSSI)</option>
            <option value="3" ${currentInfo.cardAccumulationLimit === 3 ? 'selected' : ''}>3 Kartu Kuning &rarr; Skorsing 1 Pertandingan</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Pemutihan Kartu (PRD §5.2 AK-06)</label>
          <select class="form-select" id="setting-card-reset">
            <option value="semifinal" ${currentInfo.resetCardsAtStage === 'semifinal' ? 'selected' : ''}>Pemutihan Kartu Kuning Tunggal di Semifinal</option>
            <option value="none" ${currentInfo.resetCardsAtStage === 'none' ? 'selected' : ''}>Tidak Ada Pemutihan</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Durasi Pertandingan</label>
          <input type="text" class="form-input" value="2 x 45 Menit (Standar FIFA)" readonly />
        </div>

        <div class="form-group">
          <label class="form-label">Maksimal Pergantian Pemain</label>
          <input type="text" class="form-input" value="5 Pergantian (3 Slot Waktu)" readonly />
        </div>
      </div>
    </div>

    <!-- Danger Zone: Reset Tournament (PRD §4.8 AD-06) -->
    <div class="card" style="border-left: 4px solid var(--color-danger); background: rgba(239, 68, 68, 0.05);">
      <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h4 style="color: var(--color-danger); margin-bottom: 0.25rem;">Zona Kritis: Reset Turnamen (AD-06)</h4>
          <p class="text-xs text-muted" style="margin: 0;">Menghapus semua data jadwal, grup, dan hasil untuk memulai turnamen baru dari awal dengan konfirmasi ganda.</p>
        </div>

        <button type="button" id="btn-reset-tournament" class="btn btn-danger btn-sm">
          Reset Seluruh Data Turnamen
        </button>
      </div>
    </div>
  `;

  return wrapAdminLayout(content, '#/admin/pengaturan');
}
