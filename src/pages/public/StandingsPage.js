/**
 * Public Standings Page
 * PRD: §4.3 Perhitungan Otomatis Klasemen (KL-01..07), §4.9 PB-03
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { StandingsService } from '../../services/StandingsService.js';
import { createStandingTable } from '../../components/StandingTable.js';
import { Modal } from '../../components/Modal.js';
import { exportElementToPrint } from '../../utils/exportImage.js';

export async function StandingsPage() {
  const crumbs = [{ label: 'Klasemen', href: null }];
  const groupsData = await StandingsService.getLiveStandings();
  const bestThirdPlaces = await StandingsService.getBestThirdPlaceStandings();

  const content = `
    ${createBreadcrumb(crumbs)}

    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Klasemen Babak Penyisihan</h1>
        <p class="text-sm text-muted">Perhitungan klasemen otomatis secara live dengan sistem tie-break resmi PSSI.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-export-standings" class="btn btn-outline btn-sm">
          <span>🖨️ Cetak Dokumen (KL-07)</span>
        </button>
        <button type="button" id="btn-tiebreak-rules" class="btn btn-outline btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Aturan Tie-Break PSSI</span>
        </button>
      </div>
    </div>

    <!-- Standings Tables Container -->
    <div id="standings-tables-print-container" class="grid grid-cols-1 gap-6">
      ${groupsData.length === 0 ? `
        <div class="card text-center" style="padding: 3rem; color: var(--text-muted); border-style: dashed;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📊</div>
          <h4 style="margin: 0; color: var(--text-main);">Klasemen Belum Tersedia</h4>
          <p class="text-xs" style="margin-top: 0.25rem;">Pengundian grup dan jadwal pertandingan belum disahkan oleh panitia pelaksana.</p>
        </div>
      ` : `
        ${groupsData.map(group => createStandingTable(group)).join('')}
      `}
    </div>

    <!-- Additional Best 3rd Place Standings (For 3 Groups Scenario) -->
    ${groupsData.length === 3 ? `
      <div class="card mt-6" style="border-color: rgba(59, 130, 246, 0.3);">
        <div class="card-header">
          <div class="card-title" style="font-size: 1.1rem; color: #60A5FA;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Klasemen Peringkat 3 Terbaik (Skenario 3 Grup)
          </div>
          <span class="badge badge-teal">Top 2 Lolos 8 Besar</span>
        </div>
        <div class="card-body">
          <p class="text-xs text-muted mb-4">
            Pada turnamen format 3 grup, 2 tim peringkat 3 terbaik dari ketiga grup akan melaju ke Perempat Final mendampingi Juara & Runner-up Grup.
          </p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">Pos</th>
                  <th>Tim & Asal Grup</th>
                  <th style="text-align: center;">MN</th>
                  <th style="text-align: center;">M</th>
                  <th style="text-align: center;">S</th>
                  <th style="text-align: center;">K</th>
                  <th style="text-align: center;">SG</th>
                  <th style="text-align: center;">PTS</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${bestThirdPlaces.map(t => `
                  <tr class="${t.bestThirdStatus === 'qualify' ? 'row-qualify' : 'row-eliminate'}">
                    <td style="text-align: center; font-weight: 700;">${t.bestThirdRank}</td>
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="team-badge-circle" style="width: 26px; height: 26px; font-size: 0.65rem;">${t.code}</span>
                        <span><strong>${t.name}</strong> <span class="text-xs text-muted">(${t.groupName})</span></span>
                      </div>
                    </td>
                    <td style="text-align: center;" class="mono">${t.played}</td>
                    <td style="text-align: center;" class="mono">${t.won}</td>
                    <td style="text-align: center;" class="mono">${t.draw}</td>
                    <td style="text-align: center;" class="mono">${t.lost}</td>
                    <td style="text-align: center;" class="mono font-bold ${t.gd > 0 ? 'text-success' : t.gd < 0 ? 'text-danger' : ''}">${t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                    <td style="text-align: center;" class="points">${t.pts}</td>
                    <td style="text-align: center;">
                      ${t.bestThirdStatus === 'qualify' ? '<span class="badge badge-success">Lolos 8 Besar</span>' : '<span class="badge badge-muted">Tereliminasi</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  return {
    html: wrapPublicLayout(content, '#/klasemen'),
    init: () => {
      const rulesBtn = document.getElementById('btn-tiebreak-rules');
      const exportBtn = document.getElementById('btn-export-standings');

      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          exportElementToPrint('standings-tables-print-container', 'KLASEMEN RESMI SEPAKBOLA PORPROV X SULTENG 2026');
        });
      }

      if (rulesBtn) {
        rulesBtn.addEventListener('click', () => {
          const modal = new Modal({
            title: 'Regulasi Klasemen & Kriteria Tie-Break Resmi PSSI',
            content: `
              <div style="font-size: 0.875rem; line-height: 1.6; color: var(--text-main);">
                <p style="margin-bottom: 0.75rem;">Sesuai regulasi resmi <strong>PSSI & PORPROV X Sulawesi Tengah 2026</strong>, penentuan peringkat grup disusun berdasarkan:</p>
                <ol style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                  <li><strong>Jumlah Poin Terbanyak</strong> (Menang: 3 poin, Seri: 1 poin, Kalah: 0 poin).</li>
                  <li><strong>Head-to-Head (H2H)</strong> antar tim yang memiliki poin sama:
                    <ul style="padding-left: 1.25rem; list-style-type: circle; margin-top: 0.25rem;">
                      <li>Poin pertemuan langsung antar tim terkait</li>
                      <li>Selisih gol pada pertemuan langsung</li>
                      <li>Jumlah gol dicetak pada pertemuan langsung</li>
                    </ul>
                  </li>
                  <li><strong>Selisih Gol (SG)</strong> di seluruh pertandingan grup.</li>
                  <li><strong>Jumlah Gol Memasukkan (GM)</strong> di seluruh pertandingan grup.</li>
                  <li><strong>Poin Fair Play</strong> (akumulasi kartu kuning = -1, dua kuning/merah tidak langsung = -3, merah langsung = -4).</li>
                  <li><strong>Undian</strong> oleh Technical Delegate PSSI jika seluruh kriteria di atas imbang.</li>
                </ol>
              </div>
            `,
            buttons: [
              { text: 'Tutup', className: 'btn-primary', action: 'close', onClick: (m) => m.close() }
            ]
          });
          modal.render();
        });
      }
    }
  };
}
