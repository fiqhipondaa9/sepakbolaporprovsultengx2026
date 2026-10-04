/**
 * Public Schedule Page
 * PRD: §4.9 PB-02, §4.4 Penyusunan Jadwal (JD-01..07), §4.9 PB-04 Detail Pertandingan
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { BracketService } from '../../services/BracketService.js';
import { createMatchCard, initMatchCardDetails } from '../../components/MatchCard.js';
import { exportElementToPrint } from '../../utils/exportImage.js';

export async function SchedulePage() {
  const crumbs = [{ label: 'Jadwal Pertandingan', href: null }];
  const [groupMatches, knockoutMatches] = await Promise.all([
    ScheduleService.getAllMatches(),
    BracketService.getAll()
  ]);

  // Combine group stage and knockout matches
  const allMatches = [...groupMatches, ...knockoutMatches];

  const content = `
    ${createBreadcrumb(crumbs)}

    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Jadwal Pertandingan</h1>
        <p class="text-sm text-muted">Jadwal seluruh laga sepak bola PORPROV X Sulteng 2026 secara berimbang dan transparan.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-export-schedule" class="btn btn-outline btn-sm">
          <span>🖨️ Cetak Jadwal (PDF)</span>
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

    <!-- Filter Control Bar (PB-02) -->
    <div class="card mb-6" style="padding: 1rem 1.25rem;">
      <div class="grid grid-cols-1 sm-grid-cols-3 gap-3">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">PILIH BABAK</label>
          <select class="form-select" id="pub-filter-stage" style="padding: 0.5rem 0.75rem;">
            <option value="all">Semua Babak</option>
            <option value="Grup">Babak Penyisihan Grup</option>
            <option value="PEREMPAT_FINAL">Perempat Final (8 Besar)</option>
            <option value="SEMIFINAL">Semifinal</option>
            <option value="GRAND_FINAL">Grand Final & Juara 3</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">PILIH GRUP</label>
          <select class="form-select" id="pub-filter-group" style="padding: 0.5rem 0.75rem;">
            <option value="all">Semua Grup (A, B, C, D)</option>
            <option value="A">Grup A</option>
            <option value="B">Grup B</option>
            <option value="C">Grup C</option>
            <option value="D">Grup D</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.75rem; color: var(--text-dim);">STATUS PERTANDINGAN</label>
          <select class="form-select" id="pub-filter-status" style="padding: 0.5rem 0.75rem;">
            <option value="all">Semua Status</option>
            <option value="LIVE">Sedang Live</option>
            <option value="SCHEDULED">Akan Datang</option>
            <option value="FINISHED">Selesai</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Matches Grid -->
    <div id="public-matches-grid">
      ${allMatches.length === 0 ? `
        <div class="card text-center" style="padding: 3rem; color: var(--text-muted); border-style: dashed;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
          <h4 style="margin: 0; color: var(--text-main);">Belum Ada Pertandingan Terjadwal</h4>
          <p class="text-xs" style="margin-top: 0.25rem;">Panitia pelaksana sedang menyusun jadwal pertandingan resmi.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
          ${allMatches.map(m => `
            <div class="public-match-item" data-group="${m.groupId || ''}" data-stage="${m.stage || ''}" data-status="${m.status}">
              ${createMatchCard(m)}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  return {
    html: wrapPublicLayout(content, '#/jadwal'),
    init: () => {
      // 1. Initialize Match Card Detail Modal Click Handlers (PB-04)
      initMatchCardDetails(allMatches);

      // 2. Filter logic
      const stageFilter = document.getElementById('pub-filter-stage');
      const groupFilter = document.getElementById('pub-filter-group');
      const statusFilter = document.getElementById('pub-filter-status');

      function filterMatches() {
        const sVal = stageFilter?.value || 'all';
        const gVal = groupFilter?.value || 'all';
        const stVal = statusFilter?.value || 'all';

        document.querySelectorAll('.public-match-item').forEach(el => {
          const stage = el.getAttribute('data-stage') || '';
          const group = el.getAttribute('data-group') || '';
          const status = el.getAttribute('data-status') || '';

          const matchStage = sVal === 'all' || stage.includes(sVal);
          const matchGroup = gVal === 'all' || group === gVal;
          const matchStatus = stVal === 'all' || status === stVal;

          el.style.display = (matchStage && matchGroup && matchStatus) ? 'block' : 'none';
        });
      }

      if (stageFilter) stageFilter.addEventListener('change', filterMatches);
      if (groupFilter) groupFilter.addEventListener('change', filterMatches);
      if (statusFilter) statusFilter.addEventListener('change', filterMatches);

      // 3. Export / Cetak Dokumen Jadwal
      const exportBtn = document.getElementById('btn-export-schedule');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          exportElementToPrint('public-matches-grid', 'JADWAL RESMI PERTANDINGAN SEPAK BOLA PORPROV SULTENG X 2026');
        });
      }

      // 4. Auto-update schedule cards when matches are updated across tabs or locally
      const syncMatches = async () => {
        try {
          const [freshGroupMatches, freshKnockoutMatches] = await Promise.all([
            ScheduleService.getAllMatches(),
            BracketService.getAll()
          ]);
          const freshAll = [...freshGroupMatches, ...freshKnockoutMatches];
          const gridEl = document.getElementById('public-matches-grid');
          if (gridEl && freshAll.length > 0) {
            gridEl.innerHTML = `
              <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
                ${freshAll.map(m => `
                  <div class="public-match-item" data-group="${m.groupId || ''}" data-stage="${m.stage || ''}" data-status="${m.status}">
                    ${createMatchCard(m)}
                  </div>
                `).join('')}
              </div>
            `;
            initMatchCardDetails(freshAll);
            filterMatches();
          }
        } catch (syncErr) {
          console.warn('Schedule live sync error:', syncErr);
        }
      };

      window.addEventListener('col_updated_matches', syncMatches);
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.includes('matches')) syncMatches();
      });
    }
  };
}
