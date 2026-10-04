/**
 * Public Knockout Bracket Page
 * PRD: §4.9 PB-05, §9 Bracket Mapping & Opposite Half Rule
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { BracketService } from '../../services/BracketService.js';
import { createBracketView } from '../../components/BracketView.js';
import { Modal } from '../../components/Modal.js';
import { exportBracketToPrint } from '../../utils/exportImage.js';

export async function BracketPage() {
  const crumbs = [{ label: 'Bagan Eliminasi', href: null }];
  const matches = await BracketService.getAll();
  const hasBracket = matches.length > 0;

  const content = `
    ${createBreadcrumb(crumbs)}

    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Bagan Babak Gugur (Knockout)</h1>
        <p class="text-sm text-muted">Jalur pertandingan dari Perempat Final (8 Besar), Semifinal, hingga Grand Final PORPROV X Sulteng 2026.</p>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" id="btn-public-opposite-info" class="btn btn-outline btn-sm">
          <span>🛡️ Opposite Half Rule</span>
        </button>
        ${hasBracket ? `
          <button type="button" id="btn-public-print-bracket" class="btn btn-outline btn-sm">
            🖨️ Cetak Jadwal Bagan
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Rule Callout Notice -->
    <div class="card mb-6" style="background: rgba(245, 166, 35, 0.05); border-color: rgba(245, 166, 35, 0.25); padding: 1rem 1.25rem;">
      <div class="flex items-center gap-2 mb-1">
        <span style="color: var(--color-accent); font-weight: 700;">Ketentuan Bagan:</span>
        <span class="text-sm">Juara & Runner-up dari grup yang sama ditempatkan pada paruh bagan yang berlawanan (Separuh 1 vs Separuh 2).</span>
      </div>
      <p class="text-xs text-muted" style="margin: 0;">Kedua tim dari grup yang sama tidak akan bertemu di Perempat Final maupun Semifinal, dan hanya bisa bertemu kembali di Babak Final.</p>
    </div>

    <!-- Bracket Visualization Container -->
    <div class="card" style="padding: 1.25rem;">
      ${hasBracket ? createBracketView(matches, { isAdmin: false }) : `
        <div class="text-center" style="padding: 3rem; color: var(--text-muted); border-style: dashed;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
          <h4 style="margin: 0; color: var(--text-main);">Bagan Eliminasi Belum Diterbitkan</h4>
          <p class="text-xs" style="margin-top: 0.25rem;">Bagan babak 8 besar akan segera diterbitkan setelah seluruh pertandingan babak penyisihan grup selesai.</p>
        </div>
      `}
    </div>
  `;

  return {
    html: wrapPublicLayout(content, '#/bracket'),
    init: () => {
      const infoBtn = document.getElementById('btn-public-opposite-info');
      if (infoBtn) {
        infoBtn.addEventListener('click', () => {
          const modal = new Modal({
            title: 'Ketentuan Opposite Half Rule (JD-16, JD-17)',
            content: `
              <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
                <p>Sesuai regulasi turnamen PORPROV X Sulteng 2026 dan standar FIFA/PSSI:</p>
                <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0;">
                  <li><strong>Penempatan Separuh Berlawanan:</strong> Juara grup (1X) dan Runner-up (2X) dari grup yang sama HARUS berada pada separuh bagan berbeda (Separuh 1 vs Separuh 2).</li>
                  <li><strong>Anti Pertemuan Prematur:</strong> Hal ini menjamin kedua tim tidak akan saling mengeliminasi di babak Perempat Final (8 Besar) maupun Semifinal.</li>
                  <li><strong>Hanya Bertemu di Final:</strong> Satu-satunya kemungkinan kedua tim bertemu kembali adalah di laga puncak Grand Final perebutan Medali Emas.</li>
                </ul>
              </div>
            `,
            buttons: [
              { text: 'Mengerti', className: 'btn-primary', action: 'close', onClick: (m) => m.close() }
            ]
          });
          modal.render();
        });
      }

      const printBtn = document.getElementById('btn-public-print-bracket');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          exportBracketToPrint(matches, 'JADWAL & BAGAN BABAK GUGUR PORPROV X SULTENG 2026');
        });
      }
    }
  };
}
