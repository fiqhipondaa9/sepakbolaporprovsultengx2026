/**
 * Admin Disciplinary Card Tracking & Suspension Management Page
 * PRD: §5.2 Akumulasi Kartu & Suspensi (AK-01..06)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { CardService } from '../../services/CardService.js';
import { Modal } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';

export async function AdminCardTrackingPage() {
  const report = await CardService.getDisciplinaryReport();

  const content = `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Pelacakan Akumulasi Kartu & Suspensi</h1>
          <span class="badge ${report.suspendedPlayers.length > 0 ? 'badge-danger' : 'badge-teal'} font-bold">
            ${report.suspendedPlayers.length} Pemain Diskors
          </span>
        </div>
        <p class="text-sm text-muted">Monitoring otomatis akumulasi kartu kuning/merah, proteksi pemain terancam, dan pemutihan semifinal (AK-01..06).</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-config-threshold" class="btn btn-outline btn-sm">
          ⚙️ Aturan Akumulasi (AK-05)
        </button>
        <button type="button" id="btn-semifinal-amnesty" class="btn btn-primary btn-sm">
          ✨ Pemutihan Kartu Semifinal (AK-06)
        </button>
      </div>
    </div>

    <!-- Summary Statistics Grid -->
    <div class="grid grid-cols-1 sm-grid-cols-3 gap-4 mb-6">
      <!-- Suspended Players (AK-02, AK-03) -->
      <div class="card" style="padding: 1.25rem; border-left: 4px solid var(--color-danger); background: rgba(239, 68, 68, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-muted font-bold uppercase tracking-wider">Pemain Diskors (Banned)</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-danger); margin-top: 0.25rem;">
              ${report.suspendedPlayers.length}
            </div>
            <div class="text-xs text-muted">Dilarang tampil di laga berikutnya</div>
          </div>
          <div style="font-size: 2.5rem; opacity: 0.8;">🚫</div>
        </div>
      </div>

      <!-- At-Risk Players (AK-04) -->
      <div class="card" style="padding: 1.25rem; border-left: 4px solid var(--color-gold); background: rgba(245, 166, 35, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-muted font-bold uppercase tracking-wider">Terancam Akumulasi</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-gold); margin-top: 0.25rem;">
              ${report.atRiskPlayers.length}
            </div>
            <div class="text-xs text-muted">Mengantongi 1 kartu kuning (AK-04)</div>
          </div>
          <div style="font-size: 2.5rem; opacity: 0.8;">⚠️</div>
        </div>
      </div>

      <!-- Total Players with Cards -->
      <div class="card" style="padding: 1.25rem; border-left: 4px solid var(--color-teal); background: rgba(0, 191, 166, 0.05);">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-muted font-bold uppercase tracking-wider">Total Pelanggaran</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--color-teal); margin-top: 0.25rem;">
              ${report.totalCardsCount}
            </div>
            <div class="text-xs text-muted">Dari ${report.players.length} pemain tercatat</div>
          </div>
          <div style="font-size: 2.5rem; opacity: 0.8;">📋</div>
        </div>
      </div>
    </div>

    <!-- Active Suspensions Alert Table (AK-02, AK-03) -->
    <div class="card mb-6" style="padding: 1.25rem;">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 style="font-size: 1.15rem; margin: 0; color: var(--color-danger); display: flex; align-items: center; gap: 0.5rem;">
            <span>🚫</span>
            Daftar Pemain Terkena Sanksi Skorsing (Dilarang Bermain)
          </h3>
          <p class="text-xs text-muted" style="margin-top: 0.25rem;">Pemain berikut tidak boleh dicantumkan ke dalam Daftar Susunan Pemain (DSP) pada pertandingan selanjutnya.</p>
        </div>
        <span class="badge badge-danger">${report.suspendedPlayers.length} Pemain</span>
      </div>

      ${report.suspendedPlayers.length === 0 ? `
        <div class="text-center" style="padding: 2rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
          <p class="text-sm" style="margin: 0;">Tidak ada pemain yang sedang dalam masa skorsing.</p>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Pemain</th>
                <th>Kontingen Tim</th>
                <th style="text-align: center;">Kartu Kuning</th>
                <th style="text-align: center;">Kartu Merah</th>
                <th>Alasan Skorsing</th>
                <th style="text-align: center;">Sanksi</th>
              </tr>
            </thead>
            <tbody>
              ${report.suspendedPlayers.map(p => `
                <tr style="background: rgba(239, 68, 68, 0.05);">
                  <td>
                    <strong style="color: #F87171;">${p.playerName}</strong>
                  </td>
                  <td>${p.teamName}</td>
                  <td style="text-align: center;" class="mono font-bold text-gold">${p.yellowCards}</td>
                  <td style="text-align: center;" class="mono font-bold text-danger">${p.redCards + p.secondYellowCards}</td>
                  <td>
                    <span class="badge badge-danger">${p.suspensionReason}</span>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge badge-danger">Skors 1 Match</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Players At-Risk Warning Table (AK-04) -->
    <div class="card mb-6" style="padding: 1.25rem;">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 style="font-size: 1.15rem; margin: 0; color: var(--color-gold); display: flex; align-items: center; gap: 0.5rem;">
            <span>⚠️</span>
            Daftar Pemain Terancam Akumulasi (1 Kartu Kuning) (AK-04)
          </h3>
          <p class="text-xs text-muted" style="margin-top: 0.25rem;">Pemain yang jika mendapat 1 kartu kuning lagi akan diskors pada laga berikutnya.</p>
        </div>
        <span class="badge badge-gold">${report.atRiskPlayers.length} Pemain</span>
      </div>

      ${report.atRiskPlayers.length === 0 ? `
        <div class="text-center" style="padding: 2rem; color: var(--text-muted);">
          <p class="text-sm" style="margin: 0;">Tidak ada pemain yang berada dalam status terancam akumulasi.</p>
        </div>
      ` : `
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Nama Pemain</th>
                <th>Kontingen Tim</th>
                <th style="text-align: center;">Kartu Kuning Saat Ini</th>
                <th style="text-align: center;">Batas Akumulasi</th>
                <th>Status Disiplin</th>
              </tr>
            </thead>
            <tbody>
              ${report.atRiskPlayers.map(p => `
                <tr>
                  <td>
                    <strong>${p.playerName}</strong>
                  </td>
                  <td>${p.teamName}</td>
                  <td style="text-align: center;" class="mono font-bold text-gold">${p.yellowCards} 🟨</td>
                  <td style="text-align: center;" class="mono">${report.yellowThreshold} Kartu</td>
                  <td>
                    <span class="badge badge-gold">Peringatan: 1 Kartu Lagi Diskors</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Full Cards Log (AK-01) -->
    <div class="card" style="padding: 1.25rem;">
      <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--color-teal); display: flex; align-items: center; gap: 0.5rem;">
        <span>📜</span>
        Riwayat Seluruh Kartu Disiplin Turnamen (AK-01)
      </h3>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Pemain</th>
              <th>Tim</th>
              <th style="text-align: center;">Kuning</th>
              <th style="text-align: center;">Merah</th>
              <th style="text-align: center;">Poin Fair Play</th>
              <th style="text-align: center;">Status Terkini</th>
            </tr>
          </thead>
          <tbody>
            ${report.players.map(p => `
              <tr>
                <td><strong>${p.playerName}</strong></td>
                <td>${p.teamName}</td>
                <td style="text-align: center;" class="mono text-gold">${p.yellowCards}</td>
                <td style="text-align: center;" class="mono text-danger">${p.redCards + p.secondYellowCards}</td>
                <td style="text-align: center;" class="mono text-danger">-${p.fairPlayPenalty} FP</td>
                <td style="text-align: center;">
                  ${p.status === 'SUSPENDED' 
                    ? '<span class="badge badge-danger">Diskors 1 Laga</span>' 
                    : p.status === 'AT_RISK' 
                    ? '<span class="badge badge-gold">Terancam</span>' 
                    : '<span class="badge badge-success">Aman</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/kartu'),
    init: () => initCardTrackingEvents(report)
  };
}

function initCardTrackingEvents(report) {
  const amnestyBtn = document.getElementById('btn-semifinal-amnesty');
  const configBtn = document.getElementById('btn-config-threshold');

  // Semifinal Amnesty / Pemutihan Kartu Kuning (AK-06)
  if (amnestyBtn) {
    amnestyBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: '✨ Pemutihan Kartu Kuning Semifinal (AK-06)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <p>Sesuai <strong>Regulasi Resmi PSSI & FIFA</strong>, kartu kuning tunggal yang didapatkan pemain sebelum babak semifinal dapat diputihkan:</p>
            <div class="card mb-3" style="padding: 0.75rem; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.3);">
              <strong>Tujuan Regulasi:</strong>
              <div class="text-xs text-muted mt-1">Mencegah pemain inti absen di laga Grand Final hanya karena menerima akumulasi 1 kartu kuning tunggal di semifinal.</div>
            </div>
            <p class="text-xs text-danger"><em>Catatan: Pemain yang sedang menjalani skorsing kartu merah langsung atau sanksi kartu kuning kedua di QF tetap menjalani hukuman skorsing.</em></p>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Terapkan Pemutihan',
            className: 'btn-primary',
            action: 'apply',
            onClick: async (m) => {
              m.close();
              await CardService.applySemifinalReset();
              Toast.success('Pemutihan kartu kuning babak semifinal berhasil diterapkan!');
              setTimeout(() => window.location.reload(), 400);
            }
          }
        ]
      });
      modal.render();
    });
  }

  // Threshold Configuration Modal (AK-05)
  if (configBtn) {
    configBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: '⚙️ Konfigurasi Batas Akumulasi Kartu (AK-05)',
        content: `
          <div style="font-size: 0.85rem;">
            <div class="form-group mb-3">
              <label class="form-label">Batas Akumulasi Kartu Kuning untuk Skorsing 1 Pertandingan:</label>
              <select id="select-yellow-threshold" class="form-select">
                <option value="2" ${report.yellowThreshold === 2 ? 'selected' : ''}>2 Kartu Kuning = Skors 1 Pertandingan (Standar PSSI)</option>
                <option value="3" ${report.yellowThreshold === 3 ? 'selected' : ''}>3 Kartu Kuning = Skors 1 Pertandingan</option>
              </select>
            </div>
            <p class="text-xs text-muted">Pengaturan ini akan memengaruhi perhitungan status suspensi pemain secara otomatis.</p>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Simpan Aturan',
            className: 'btn-primary',
            action: 'save',
            onClick: async (m) => {
              const val = parseInt(document.getElementById('select-yellow-threshold')?.value || '2', 10);
              m.close();
              await CardService.updateConfig({ yellowThreshold: val });
              Toast.success(`Batas akumulasi berhasil diubah menjadi ${val} kartu kuning!`);
              setTimeout(() => window.location.reload(), 300);
            }
          }
        ]
      });
      modal.render();
    });
  }
}
