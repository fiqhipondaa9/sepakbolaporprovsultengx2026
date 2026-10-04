/**
 * Admin Knockout Bracket Management Page
 * PRD: §4.4 Babak Eliminasi (JD-08..17), §4.5 Input Eliminasi (HS-02, HS-03)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { BracketService } from '../../services/BracketService.js';
import { VenueService } from '../../services/VenueService.js';
import { TeamService } from '../../services/TeamService.js';
import { PlayerService } from '../../services/PlayerService.js';
import { createBracketView } from '../../components/BracketView.js';
import { Modal } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';
import { exportBracketToPrint } from '../../utils/exportImage.js';

export async function AdminBracketPage() {
  const [matches, isGroupDone, venues] = await Promise.all([
    BracketService.getAll(),
    BracketService.isGroupStageCompleted(),
    VenueService.getAll()
  ]);

  const hasBracket = matches.length > 0;

  const content = `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Pengelolaan Bagan Babak Eliminasi</h1>
          <span class="badge ${hasBracket ? 'badge-teal' : 'badge-gold'} font-bold">
            ${hasBracket ? 'Bagan Aktif' : 'Belum Dibuat'}
          </span>
        </div>
        <p class="text-sm text-muted">Pemetaan otomatis 8 Besar, Semifinal, Perebutan Juara 3, dan Final dengan penegakan Opposite Half Rule.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-opposite-rules" class="btn btn-outline btn-sm">
          🛡️ Regulasi Opposite Half (JD-16)
        </button>
        ${hasBracket ? `
          <button type="button" id="btn-sync-bracket-dates" class="btn btn-outline btn-sm text-teal">
            🔄 Sinkronkan Tanggal
          </button>
          <button type="button" id="btn-print-bracket" class="btn btn-outline btn-sm">
            🖨️ Cetak Jadwal Bagan
          </button>
          <button type="button" id="btn-reset-bracket" class="btn btn-outline btn-sm text-danger">
            ⚠️ Reset Bagan
          </button>
        ` : `
          <button type="button" id="btn-generate-bracket" class="btn btn-primary btn-sm">
            ⚡ Generate Bagan Eliminasi Otomatis (JD-08)
          </button>
        `}
      </div>
    </div>

    <!-- Notification Bar -->
    ${!hasBracket ? `
      <div class="card mb-6" style="padding: 1.25rem; border-color: rgba(245, 166, 35, 0.4); background: rgba(245, 166, 35, 0.05);">
        <div class="flex items-center gap-3">
          <span style="font-size: 1.75rem;">ℹ️</span>
          <div>
            <strong>Status Babak Penyisihan: ${isGroupDone ? '✅ Seluruh Laga Selesai' : '⏳ Sedang Berlangsung'}</strong>
            <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">
              ${isGroupDone 
                ? 'Seluruh pertandingan grup telah rampung. Klik tombol "Generate Bagan Eliminasi Otomatis" untuk menyusun babak 8 Besar.' 
                : 'Babak penyisihan masih berlangsung. Anda dapat meng-generate bagan secara langsung untuk simulasi atau menunggu hasil grup tuntas.'}
            </p>
          </div>
        </div>
      </div>
    ` : `
      <!-- Opposite Half Rule Verified Banner -->
      <div class="card mb-6" style="padding: 0.85rem 1.25rem; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.3);">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.5rem; font-size: 0.85rem;">
          <div class="flex items-center gap-2">
            <span style="color: var(--color-teal); font-weight: 700;">✅ Terverifikasi:</span>
            <span>Opposite Half Rule aktif. Juara & Runner-up dari setiap grup berada pada paruh bagan berlawanan (hanya bisa bertemu di Final).</span>
          </div>
          <span class="badge badge-teal">Standar FIFA & PSSI</span>
        </div>
      </div>
    `}

    <!-- Bracket Interactive Container -->
    <div class="card" style="padding: 1.25rem;">
      ${hasBracket ? createBracketView(matches, { isAdmin: true }) : `
        <div class="text-center" style="padding: 3rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
          <h4 style="margin: 0; color: var(--text-main);">Bagan Eliminasi Belum Dibuat</h4>
          <p class="text-xs" style="margin-top: 0.25rem;">Klik tombol "Generate Bagan Eliminasi Otomatis" di kanan atas untuk membuat bagan babak gugur.</p>
        </div>
      `}
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/bracket'),
    init: () => initAdminBracketEvents(matches, venues)
  };
}

function initAdminBracketEvents(matches, venues) {
  const generateBtn = document.getElementById('btn-generate-bracket');
  const resetBtn = document.getElementById('btn-reset-bracket');
  const rulesBtn = document.getElementById('btn-opposite-rules');
  const printBtn = document.getElementById('btn-print-bracket');

  // Print Bracket Button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      exportBracketToPrint(matches, 'JADWAL & BAGAN BABAK GUGUR PORPROV X SULTENG 2026');
    });
  }

  // Sync Bracket Dates Button
  const syncDatesBtn = document.getElementById('btn-sync-bracket-dates');
  if (syncDatesBtn) {
    syncDatesBtn.addEventListener('click', async () => {
      try {
        syncDatesBtn.disabled = true;
        syncDatesBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px;"></span> Menyelaraskan...`;
        const res = await BracketService.syncBracketDates();
        Toast.success(`Tanggal babak eliminasi berhasil disinkronkan ke ${res.newStartDate} s/d ${res.finalDate}!`);
        setTimeout(() => window.location.reload(), 450);
      } catch (err) {
        Toast.error('Gagal sinkronisasi tanggal: ' + err.message);
        syncDatesBtn.disabled = false;
        syncDatesBtn.innerHTML = `🔄 Sinkronkan Tanggal`;
      }
    });
  }

  // Generate Bracket Button (JD-08)
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px;"></span> Menyusun Bagan...`;
        await BracketService.generateBracket();
        Toast.success('Bagan babak eliminasi berhasil disusun dan disinkronkan dengan jadwal babak penyisihan!');
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        Toast.error(err.message);
        generateBtn.disabled = false;
        generateBtn.innerHTML = `⚡ Generate Bagan Eliminasi Otomatis (JD-08)`;
      }
    });
  }

  // Reset Bracket Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Konfirmasi Reset Bagan Eliminasi',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <p class="text-danger mb-2">⚠️ Peringatan: Seluruh bagan gugur, skor perempat final, semifinal, dan final yang telah tercatat akan dihapus secara permanen.</p>
            <p>Ketik <strong>RESET-BAGAN</strong> di bawah untuk mengonfirmasi:</p>
            <input type="text" id="input-confirm-reset-bracket" class="form-input mt-2" placeholder="RESET-BAGAN" />
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Hapus & Reset Bagan',
            className: 'btn-danger',
            action: 'reset',
            onClick: async (m) => {
              const val = document.getElementById('input-confirm-reset-bracket')?.value;
              if (val !== 'RESET-BAGAN') {
                Toast.error('Ketik konfirmasi dengan tepat untuk melanjutkan!');
                return;
              }
              m.close();
              await BracketService.resetBracket();
              Toast.info('Bagan eliminasi berhasil di-reset.');
              setTimeout(() => window.location.reload(), 300);
            }
          }
        ]
      });
      modal.render();
    });
  }

  // Opposite Half Rules Modal (JD-16, JD-17)
  if (rulesBtn) {
    rulesBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: '🛡️ Ketentuan Bagan: Opposite Half Rule (JD-16, JD-17)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
            <p style="margin-bottom: 0.75rem;">Sesuai regulasi turnamen PORPROV X Sulteng 2026 dan standar FIFA/PSSI, penempatan bagan babak eliminasi menerapkan <strong>Opposite Half Rule</strong>:</p>
            
            <div class="card mb-3" style="padding: 0.75rem; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.3);">
              <strong>1. Penempatan Paruh Berlawanan:</strong>
              <div class="text-xs text-muted mt-1">Juara (1X) dan Runner-up (2X) dari grup yang sama ditempatkan pada paruh bagan yang berlawanan (Separuh 1 vs Separuh 2).</div>
            </div>

            <div class="card mb-3" style="padding: 0.75rem; background: rgba(245, 166, 35, 0.08); border-color: rgba(245, 166, 35, 0.3);">
              <strong>2. Tidak Bertemu di QF maupun SF:</strong>
              <div class="text-xs text-muted mt-1">Karena berada di paruh berbeda, Juara dan Runner-up dari grup yang sama dijamin 100% TIDAK BISA bertemu di babak Perempat Final maupun Semifinal.</div>
            </div>

            <div class="card" style="padding: 0.75rem; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
              <strong>3. Hanya Bertemu di Grand Final:</strong>
              <div class="text-xs text-muted mt-1">Satu-satunya kemungkinan kedua tim bertemu kembali adalah di laga puncak Grand Final memperebutkan Medali Emas.</div>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Tutup', className: 'btn-primary', action: 'close', onClick: (m) => m.close() }
        ]
      });
      modal.render();
    });
  }

  // Helper functions for team and player selection in event modals
  async function resolveTeamId(teamObj) {
    if (!teamObj) return '';
    if (teamObj.id && !teamObj.id.startsWith('W-') && !teamObj.id.startsWith('L-') && !teamObj.isPlaceholder) {
      return teamObj.id;
    }
    try {
      const allTeams = await TeamService.getAll();
      const found = allTeams.find(t => 
        (teamObj.code && t.code && t.code.toUpperCase() === teamObj.code.toUpperCase()) ||
        (teamObj.name && t.name && t.name.toLowerCase() === teamObj.name.toLowerCase())
      );
      return found?.id || teamObj.id || '';
    } catch {
      return teamObj.id || '';
    }
  }

  async function populatePlayerOptions(selectEl, manualInputEl, teamId) {
    if (!selectEl) return;
    if (!teamId) {
      selectEl.innerHTML = `<option value="__manual__">✏️ Ketik Manual Nama Pemain</option>`;
      if (manualInputEl) {
        manualInputEl.style.display = 'block';
        manualInputEl.required = true;
      }
      return;
    }
    try {
      const players = await PlayerService.getByTeam(teamId);
      if (players.length === 0) {
        selectEl.innerHTML = `<option value="__manual__">✏️ Ketik Manual (Belum ada pemain terdaftar)</option>`;
        if (manualInputEl) {
          manualInputEl.style.display = 'block';
          manualInputEl.required = true;
        }
        return;
      }

      let html = `<option value="">-- Pilih Pemain Skuad (${players.length} Pemain) --</option>`;
      players.forEach(p => {
        const pos = p.position ? `(${p.position})` : '';
        html += `<option value="${p.name}">#${p.number} ${p.name} ${pos}</option>`;
      });
      html += `<option value="__manual__">✏️ Ketik Nama Manual...</option>`;
      selectEl.innerHTML = html;

      if (manualInputEl) {
        manualInputEl.style.display = 'none';
        manualInputEl.required = false;
        manualInputEl.value = '';
      }
    } catch {
      selectEl.innerHTML = `<option value="__manual__">✏️ Ketik Nama Manual...</option>`;
      if (manualInputEl) manualInputEl.style.display = 'block';
    }
  }

  function setupPlayerSelectListener(selectEl, manualInputEl) {
    if (!selectEl || !manualInputEl) return;
    selectEl.addEventListener('change', () => {
      if (selectEl.value === '__manual__') {
        manualInputEl.style.display = 'block';
        manualInputEl.focus();
        manualInputEl.required = true;
      } else {
        manualInputEl.style.display = 'none';
        manualInputEl.required = false;
      }
    });
  }

  function getChosenPlayerName(selectEl, manualInputEl) {
    if (!selectEl) return manualInputEl?.value?.trim() || '';
    if (selectEl.value === '__manual__') {
      return manualInputEl?.value?.trim() || '';
    }
    return selectEl.value || manualInputEl?.value?.trim() || '';
  }

  // Edit Knockout Match Score, Events & Advancement Modal (HS-01..06, JD-13)
  document.querySelectorAll('.btn-edit-knockout-match').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const matchId = e.currentTarget.getAttribute('data-match-id');
      const targetMatch = matches.find(m => m.id === matchId);
      if (!targetMatch) return;

      const homeResolvedId = await resolveTeamId(targetMatch.homeTeam);
      const awayResolvedId = await resolveTeamId(targetMatch.awayTeam);

      let matchGoals = targetMatch.goals ? [...targetMatch.goals] : [];
      let matchCards = targetMatch.cards ? [...targetMatch.cards] : [];
      let matchSubs = targetMatch.substitutions ? [...targetMatch.substitutions] : [];

      const modal = new Modal({
        title: `Input Hasil & Detail: ${targetMatch.label}`,
        maxWidth: '780px',
        dialogClass: 'modal-lg',
        content: `
          <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <!-- Match Header Box -->
            <div class="card" style="padding: 0.75rem; background: rgba(255, 255, 255, 0.03); text-align: center; margin: 0;">
              <div class="flex items-center justify-between font-bold" style="font-size: 1rem;">
                <span class="text-teal">${targetMatch.homeTeam?.name || 'TBD'}</span>
                <span class="text-gold font-mono">VS</span>
                <span class="text-gold">${targetMatch.awayTeam?.name || 'TBD'}</span>
              </div>
            </div>

            <!-- Modal Segmented Navigation Tabs -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; width: 100%;" id="ko-modal-tabs">
              <button type="button" class="btn btn-primary btn-sm ko-tab-btn" data-target="ko-tab-score" style="justify-content: center; font-size: 0.82rem; padding: 0.45rem 0.25rem;">
                ⚡ Skor & Waktu
              </button>
              <button type="button" class="btn btn-ghost btn-sm ko-tab-btn" data-target="ko-tab-goals" style="justify-content: center; font-size: 0.82rem; padding: 0.45rem 0.25rem;">
                ⚽ Pencetak Gol (<span id="ko-goals-count">${matchGoals.length}</span>)
              </button>
              <button type="button" class="btn btn-ghost btn-sm ko-tab-btn" data-target="ko-tab-cards" style="justify-content: center; font-size: 0.82rem; padding: 0.45rem 0.25rem;">
                🟨 Sanksi Kartu (<span id="ko-cards-count">${matchCards.length}</span>)
              </button>
              <button type="button" class="btn btn-ghost btn-sm ko-tab-btn" data-target="ko-tab-subs" style="justify-content: center; font-size: 0.82rem; padding: 0.45rem 0.25rem;">
                🔄 Pergantian (<span id="ko-subs-count">${matchSubs.length}</span>)
              </button>
            </div>

            <!-- TAB 1: SCORE & REGULATIONS -->
            <div id="ko-tab-score" class="ko-tab-pane" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <!-- Normal Time Score (HS-01) -->
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Skor ${targetMatch.homeTeam?.code || 'Home'} (Normal Time)</label>
                  <input type="number" id="input-ko-home" class="form-input text-center font-mono font-bold text-gold" value="${targetMatch.homeTeam?.score !== null && targetMatch.homeTeam?.score !== undefined ? targetMatch.homeTeam.score : '0'}" min="0" />
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Skor ${targetMatch.awayTeam?.code || 'Away'} (Normal Time)</label>
                  <input type="number" id="input-ko-away" class="form-input text-center font-mono font-bold text-gold" value="${targetMatch.awayTeam?.score !== null && targetMatch.awayTeam?.score !== undefined ? targetMatch.awayTeam.score : '0'}" min="0" />
                </div>
              </div>

              <!-- Extra Time Section (HS-02) -->
              <div class="card" style="padding: 0.75rem; margin: 0; background: rgba(0, 191, 166, 0.05); border-color: rgba(0, 191, 166, 0.2);">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;" class="text-teal mb-2">
                  <input type="checkbox" id="check-is-extratime" ${targetMatch.isExtraTime ? 'checked' : ''} />
                  <span>Pertandingan Berlanjut ke Babak Perpanjangan Waktu (2 x 15 Menit) (HS-02)</span>
                </label>
                <div id="extratime-inputs-box" style="display: ${targetMatch.isExtraTime ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label text-xs">Total Skor Home setelah AET</label>
                    <input type="number" id="input-et-home" class="form-input font-mono text-center" value="${targetMatch.homeTeam?.extraTimeScore !== null && targetMatch.homeTeam?.extraTimeScore !== undefined ? targetMatch.homeTeam.extraTimeScore : '0'}" min="0" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label text-xs">Total Skor Away setelah AET</label>
                    <input type="number" id="input-et-away" class="form-input font-mono text-center" value="${targetMatch.awayTeam?.extraTimeScore !== null && targetMatch.awayTeam?.extraTimeScore !== undefined ? targetMatch.awayTeam.extraTimeScore : '0'}" min="0" />
                  </div>
                </div>
              </div>

              <!-- Penalty Shootout Section (HS-03) -->
              <div class="card" style="padding: 0.75rem; margin: 0; background: rgba(245, 166, 35, 0.05); border-color: rgba(245, 166, 35, 0.2);">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;" class="text-gold mb-2">
                  <input type="checkbox" id="check-is-penalty" ${targetMatch.isPenalty ? 'checked' : ''} />
                  <span>Pertandingan Ditentukan Melalui Adu Penalti (HS-03)</span>
                </label>
                <div id="penalty-inputs-box" style="display: ${targetMatch.isPenalty ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label text-xs">Gol Penalti ${targetMatch.homeTeam?.code || 'Home'}</label>
                    <input type="number" id="input-pen-home" class="form-input font-mono text-center" value="${targetMatch.homeTeam?.penaltyScore !== null && targetMatch.homeTeam?.penaltyScore !== undefined ? targetMatch.homeTeam.penaltyScore : '0'}" min="0" />
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label text-xs">Gol Penalti ${targetMatch.awayTeam?.code || 'Away'}</label>
                    <input type="number" id="input-pen-away" class="form-input font-mono text-center" value="${targetMatch.awayTeam?.penaltyScore !== null && targetMatch.awayTeam?.penaltyScore !== undefined ? targetMatch.awayTeam.penaltyScore : '0'}" min="0" />
                  </div>
                </div>
              </div>

              <!-- Schedule & Venue Adjustments (JD-13) -->
              <div class="grid grid-cols-2 gap-3 mt-1">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label text-xs" for="select-ko-time">Jam Kick-Off</label>
                  <input type="text" id="select-ko-time" class="form-input" value="${targetMatch.time || '16:00 WITA'}" placeholder="contoh: 16:00 WITA" />
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label text-xs">Stadion / Venue</label>
                  <select id="select-ko-venue" class="form-select">
                    ${venues.map(v => `
                      <option value="${v.id}" ${v.id === targetMatch.venueId ? 'selected' : ''}>${v.name}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 2: GOALS TIMELINE (HS-04) -->
            <div id="ko-tab-goals" class="ko-tab-pane" style="display: none; flex-direction: column; gap: 0.75rem;">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Pencatatan pencetak gol (Top Scorer):</span>
                <button type="button" id="btn-ko-add-goal" class="btn btn-outline btn-sm text-gold">+ Tambah Gol</button>
              </div>
              <div id="ko-goals-list" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 240px; overflow-y: auto;">
                <!-- Goals Rendered Dynamically -->
              </div>
            </div>

            <!-- TAB 3: CARDS & DISCIPLINE (HS-05) -->
            <div id="ko-tab-cards" class="ko-tab-pane" style="display: none; flex-direction: column; gap: 0.75rem;">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Pencatatan kartu kuning & kartu merah:</span>
                <button type="button" id="btn-ko-add-card" class="btn btn-outline btn-sm text-danger">+ Tambah Kartu</button>
              </div>
              <div id="ko-cards-list" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 240px; overflow-y: auto;">
                <!-- Cards Rendered Dynamically -->
              </div>
            </div>

            <!-- TAB 4: SUBSTITUTIONS (HS-06) -->
            <div id="ko-tab-subs" class="ko-tab-pane" style="display: none; flex-direction: column; gap: 0.75rem;">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted">Pencatatan pergantian pemain resmi:</span>
                <button type="button" id="btn-ko-add-sub" class="btn btn-outline btn-sm text-teal">+ Tambah Pergantian</button>
              </div>
              <div id="ko-subs-list" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 240px; overflow-y: auto;">
                <!-- Subs Rendered Dynamically -->
              </div>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Simpan & Majukan Pemenang',
            className: 'btn-primary',
            action: 'save',
            onClick: async (m) => {
              const homeScore = parseInt(document.getElementById('input-ko-home')?.value || '0', 10);
              const awayScore = parseInt(document.getElementById('input-ko-away')?.value || '0', 10);
              const isExtraTime = document.getElementById('check-is-extratime')?.checked || false;
              const homeExtraScore = parseInt(document.getElementById('input-et-home')?.value || '0', 10);
              const awayExtraScore = parseInt(document.getElementById('input-et-away')?.value || '0', 10);
              const isPenalty = document.getElementById('check-is-penalty')?.checked || false;
              const homePenaltyScore = parseInt(document.getElementById('input-pen-home')?.value || '0', 10);
              const awayPenaltyScore = parseInt(document.getElementById('input-pen-away')?.value || '0', 10);

              let time = document.getElementById('select-ko-time')?.value.trim() || targetMatch.time || '15:30 WITA';
              if (time && !time.toUpperCase().includes('WITA') && /^\d{1,2}[:.]\d{2}$/.test(time)) {
                time = `${time} WITA`;
              }
              const venueId = document.getElementById('select-ko-venue')?.value;
              const venueObj = venues.find(v => v.id === venueId);

              try {
                // 1. Update slot details
                await BracketService.updateKnockoutSlot(matchId, {
                  time,
                  venueId,
                  venueName: venueObj?.name || targetMatch.venueName
                });

                // 2. Advance result with goals, cards, and substitutions
                const advanceRes = await BracketService.recordKnockoutResult(matchId, {
                  homeScore,
                  awayScore,
                  isExtraTime,
                  homeExtraScore,
                  awayExtraScore,
                  isPenalty,
                  homePenaltyScore,
                  awayPenaltyScore,
                  goals: matchGoals,
                  cards: matchCards,
                  substitutions: matchSubs
                });

                m.close();
                Toast.success(`Hasil laga berhasil disimpan! ${advanceRes.winner.name} melaju ke babak berikutnya.`);
                setTimeout(() => window.location.reload(), 400);
              } catch (err) {
                Toast.error(err.message);
              }
            }
          }
        ]
      });
      modal.render();

      setTimeout(() => {
        // Tab switching logic inside modal
        const tabBtns = document.querySelectorAll('.ko-tab-btn');
        const tabPanes = document.querySelectorAll('.ko-tab-pane');

        tabBtns.forEach(btnEl => {
          btnEl.addEventListener('click', () => {
            const targetId = btnEl.getAttribute('data-target');
            tabBtns.forEach(b => {
              b.classList.remove('btn-primary');
              b.classList.add('btn-ghost');
            });
            btnEl.classList.remove('btn-ghost');
            btnEl.classList.add('btn-primary');

            tabPanes.forEach(pane => {
              pane.style.display = pane.id === targetId ? 'flex' : 'none';
            });
          });
        });

        // Extra time and penalty checkboxes
        const checkEt = document.getElementById('check-is-extratime');
        const boxEt = document.getElementById('extratime-inputs-box');
        if (checkEt && boxEt) {
          checkEt.addEventListener('change', () => {
            boxEt.style.display = checkEt.checked ? 'grid' : 'none';
          });
        }

        const checkPen = document.getElementById('check-is-penalty');
        const boxPen = document.getElementById('penalty-inputs-box');
        if (checkPen && boxPen) {
          checkPen.addEventListener('change', () => {
            boxPen.style.display = checkPen.checked ? 'grid' : 'none';
          });
        }

        // Render Goals List
        function renderKoGoalsList() {
          const container = document.getElementById('ko-goals-list');
          const countBadge = document.getElementById('ko-goals-count');
          if (countBadge) countBadge.textContent = matchGoals.length;
          if (!container) return;
          if (matchGoals.length === 0) {
            container.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada gol tercatat.</div>`;
            return;
          }
          container.innerHTML = matchGoals.map((g, idx) => `
            <div class="card flex items-center justify-between" style="padding: 0.45rem 0.65rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
              <div style="font-size: 0.8rem;">
                <strong>⚽ ${g.playerName}</strong> <span class="text-xs text-muted">(${g.teamName})</span>
                ${g.type === 'penalty' ? '<span class="badge badge-gold ml-1">Penalti</span>' : ''}
                ${g.type === 'own_goal' ? '<span class="badge badge-danger ml-1">Bunuh Diri</span>' : ''}
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${g.minute}'</span>
                <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-ko-goal" data-idx="${idx}">&times;</button>
              </div>
            </div>
          `).join('');

          container.querySelectorAll('.btn-remove-ko-goal').forEach(delBtn => {
            delBtn.addEventListener('click', (ev) => {
              const i = parseInt(ev.currentTarget.getAttribute('data-idx'), 10);
              matchGoals.splice(i, 1);
              renderKoGoalsList();
            });
          });
        }

        // Render Cards List
        function renderKoCardsList() {
          const container = document.getElementById('ko-cards-list');
          const countBadge = document.getElementById('ko-cards-count');
          if (countBadge) countBadge.textContent = matchCards.length;
          if (!container) return;
          if (matchCards.length === 0) {
            container.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada kartu tercatat.</div>`;
            return;
          }
          container.innerHTML = matchCards.map((c, idx) => `
            <div class="card flex items-center justify-between" style="padding: 0.45rem 0.65rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
              <div style="font-size: 0.8rem;">
                <span>${c.type === 'red' ? '🟥' : '🟨'}</span>
                <strong>${c.playerName}</strong> <span class="text-xs text-muted">(${c.teamName})</span>
                <span class="badge ${c.type === 'red' ? 'badge-danger' : 'badge-warning'} ml-1">
                  ${c.type === 'red' ? 'Merah Langsung' : c.type === 'second_yellow' ? 'Kuning ke-2' : 'Kartu Kuning'}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${c.minute}'</span>
                <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-ko-card" data-idx="${idx}">&times;</button>
              </div>
            </div>
          `).join('');

          container.querySelectorAll('.btn-remove-ko-card').forEach(delBtn => {
            delBtn.addEventListener('click', (ev) => {
              const i = parseInt(ev.currentTarget.getAttribute('data-idx'), 10);
              matchCards.splice(i, 1);
              renderKoCardsList();
            });
          });
        }

        // Render Subs List
        function renderKoSubsList() {
          const container = document.getElementById('ko-subs-list');
          const countBadge = document.getElementById('ko-subs-count');
          if (countBadge) countBadge.textContent = matchSubs.length;
          if (!container) return;
          if (matchSubs.length === 0) {
            container.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada pergantian pemain tercatat.</div>`;
            return;
          }
          container.innerHTML = matchSubs.map((s, idx) => `
            <div class="card flex items-center justify-between" style="padding: 0.45rem 0.65rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
              <div style="font-size: 0.8rem;">
                <span class="text-success font-bold">▲ ${s.playerIn}</span> / <span class="text-danger">▼ ${s.playerOut}</span>
                <div class="text-xs text-muted">${s.teamName}</div>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${s.minute}'</span>
                <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-ko-sub" data-idx="${idx}">&times;</button>
              </div>
            </div>
          `).join('');

          container.querySelectorAll('.btn-remove-ko-sub').forEach(delBtn => {
            delBtn.addEventListener('click', (ev) => {
              const i = parseInt(ev.currentTarget.getAttribute('data-idx'), 10);
              matchSubs.splice(i, 1);
              renderKoSubsList();
            });
          });
        }

        renderKoGoalsList();
        renderKoCardsList();
        renderKoSubsList();

        // 1. Add Goal Event
        document.getElementById('btn-ko-add-goal')?.addEventListener('click', () => {
          const goalModal = new Modal({
            title: 'Catat Pencetak Gol (HS-04)',
            content: `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Tim Pencetak Gol</label>
                  <select id="modal-ko-goal-team" class="form-select">
                    <option value="${homeResolvedId || 'home'}">${targetMatch.homeTeam?.name || 'Home'}</option>
                    <option value="${awayResolvedId || 'away'}">${targetMatch.awayTeam?.name || 'Away'}</option>
                  </select>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Nama Pemain</label>
                  <select id="modal-ko-goal-player-select" class="form-select">
                    <option value="">Memuat daftar pemain...</option>
                  </select>
                  <input type="text" id="modal-ko-goal-player" class="form-input mt-2" placeholder="Ketik nama pemain manual" style="display: none;" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label">Jenis Gol</label>
                    <select id="modal-ko-goal-type" class="form-select">
                      <option value="normal">⚽ Gol Normal</option>
                      <option value="penalty">🎯 Tendangan Penalti</option>
                      <option value="own_goal">⚠️ Gol Bunuh Diri</option>
                    </select>
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label">Menit Gol</label>
                    <input type="number" id="modal-ko-goal-minute" class="form-input font-mono" placeholder="45" min="1" max="130" required />
                  </div>
                </div>
              </div>
            `,
            buttons: [
              { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (mSub) => mSub.close() },
              {
                text: 'Simpan Gol',
                className: 'btn-primary',
                action: 'add',
                onClick: (mSub) => {
                  const teamVal = document.getElementById('modal-ko-goal-team')?.value;
                  const playerSelect = document.getElementById('modal-ko-goal-player-select');
                  const manualInput = document.getElementById('modal-ko-goal-player');
                  const playerName = getChosenPlayerName(playerSelect, manualInput);
                  const type = document.getElementById('modal-ko-goal-type')?.value;
                  const minute = document.getElementById('modal-ko-goal-minute')?.value;

                  if (!playerName || !minute) {
                    Toast.error('Pilih atau ketik nama pemain serta isi menit gol!');
                    return;
                  }

                  const teamName = teamVal === homeResolvedId ? targetMatch.homeTeam.name : targetMatch.awayTeam.name;
                  matchGoals.push({ teamId: teamVal, teamName, playerName, type, minute });
                  renderKoGoalsList();
                  mSub.close();
                  Toast.info(`Gol oleh ${playerName} (${teamName}) dicatat.`);
                }
              }
            ]
          });
          goalModal.render();

          const teamSelect = document.getElementById('modal-ko-goal-team');
          const playerSelect = document.getElementById('modal-ko-goal-player-select');
          const manualInput = document.getElementById('modal-ko-goal-player');

          setupPlayerSelectListener(playerSelect, manualInput);
          populatePlayerOptions(playerSelect, manualInput, teamSelect.value);
          teamSelect.addEventListener('change', () => {
            populatePlayerOptions(playerSelect, manualInput, teamSelect.value);
          });
        });

        // 2. Add Card Event
        document.getElementById('btn-ko-add-card')?.addEventListener('click', () => {
          const cardModal = new Modal({
            title: 'Catat Sanksi Kartu (HS-05)',
            content: `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Tim Pelanggar</label>
                  <select id="modal-ko-card-team" class="form-select">
                    <option value="${homeResolvedId || 'home'}">${targetMatch.homeTeam?.name || 'Home'}</option>
                    <option value="${awayResolvedId || 'away'}">${targetMatch.awayTeam?.name || 'Away'}</option>
                  </select>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Nama Pemain Terkena Sanksi</label>
                  <select id="modal-ko-card-player-select" class="form-select">
                    <option value="">Memuat daftar pemain...</option>
                  </select>
                  <input type="text" id="modal-ko-card-player" class="form-input mt-2" placeholder="Ketik nama pemain manual" style="display: none;" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label">Jenis Kartu</label>
                    <select id="modal-ko-card-type" class="form-select">
                      <option value="yellow">🟨 Kartu Kuning</option>
                      <option value="second_yellow">🟨🟥 Kuning Kedua / Merah Tak Langsung</option>
                      <option value="red">🟥 Kartu Merah Langsung</option>
                    </select>
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label class="form-label">Menit Pelanggaran</label>
                    <input type="number" id="modal-ko-card-minute" class="form-input font-mono" placeholder="74" min="1" max="130" required />
                  </div>
                </div>
              </div>
            `,
            buttons: [
              { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (mSub) => mSub.close() },
              {
                text: 'Catat Sanksi Kartu',
                className: 'btn-danger',
                action: 'add',
                onClick: (mSub) => {
                  const teamVal = document.getElementById('modal-ko-card-team')?.value;
                  const playerSelect = document.getElementById('modal-ko-card-player-select');
                  const manualInput = document.getElementById('modal-ko-card-player');
                  const playerName = getChosenPlayerName(playerSelect, manualInput);
                  const type = document.getElementById('modal-ko-card-type')?.value;
                  const minute = document.getElementById('modal-ko-card-minute')?.value;

                  if (!playerName || !minute) {
                    Toast.error('Pilih atau ketik nama pemain serta isi menit pelanggaran!');
                    return;
                  }

                  const teamName = teamVal === homeResolvedId ? targetMatch.homeTeam.name : targetMatch.awayTeam.name;
                  matchCards.push({ teamId: teamVal, teamName, playerName, type, minute, matchId: targetMatch.id });
                  renderKoCardsList();
                  mSub.close();
                  Toast.warning(`Kartu ${type === 'red' ? 'Merah' : 'Kuning'} untuk ${playerName} (${teamName}) dicatat.`);
                }
              }
            ]
          });
          cardModal.render();

          const teamSelect = document.getElementById('modal-ko-card-team');
          const playerSelect = document.getElementById('modal-ko-card-player-select');
          const manualInput = document.getElementById('modal-ko-card-player');

          setupPlayerSelectListener(playerSelect, manualInput);
          populatePlayerOptions(playerSelect, manualInput, teamSelect.value);
          teamSelect.addEventListener('change', () => {
            populatePlayerOptions(playerSelect, manualInput, teamSelect.value);
          });
        });

        // 3. Add Substitution Event
        document.getElementById('btn-ko-add-sub')?.addEventListener('click', () => {
          const subModal = new Modal({
            title: 'Catat Pergantian Pemain (HS-06)',
            content: `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Tim yang Melakukan Pergantian</label>
                  <select id="modal-ko-sub-team" class="form-select">
                    <option value="${homeResolvedId || 'home'}">${targetMatch.homeTeam?.name || 'Home'}</option>
                    <option value="${awayResolvedId || 'away'}">${targetMatch.awayTeam?.name || 'Away'}</option>
                  </select>
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label text-success">Pemain Masuk (In)</label>
                  <select id="modal-ko-sub-in-select" class="form-select">
                    <option value="">Memuat daftar pemain...</option>
                  </select>
                  <input type="text" id="modal-ko-sub-in" class="form-input mt-2" placeholder="Ketik nama pemain masuk manual" style="display: none;" />
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label text-danger">Pemain Keluar (Out)</label>
                  <select id="modal-ko-sub-out-select" class="form-select">
                    <option value="">Memuat daftar pemain...</option>
                  </select>
                  <input type="text" id="modal-ko-sub-out" class="form-input mt-2" placeholder="Ketik nama pemain keluar manual" style="display: none;" />
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Menit Pergantian</label>
                  <input type="number" id="modal-ko-sub-minute" class="form-input font-mono" placeholder="65" min="1" max="130" required />
                </div>
              </div>
            `,
            buttons: [
              { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (mSub) => mSub.close() },
              {
                text: 'Catat Pergantian',
                className: 'btn-teal',
                action: 'add',
                onClick: (mSub) => {
                  const teamVal = document.getElementById('modal-ko-sub-team')?.value;
                  const inSelect = document.getElementById('modal-ko-sub-in-select');
                  const inManual = document.getElementById('modal-ko-sub-in');
                  const outSelect = document.getElementById('modal-ko-sub-out-select');
                  const outManual = document.getElementById('modal-ko-sub-out');
                  const playerIn = getChosenPlayerName(inSelect, inManual);
                  const playerOut = getChosenPlayerName(outSelect, outManual);
                  const minute = document.getElementById('modal-ko-sub-minute')?.value;

                  if (!playerIn || !playerOut || !minute) {
                    Toast.error('Seluruh kolom pergantian pemain wajib diisi!');
                    return;
                  }

                  const teamName = teamVal === homeResolvedId ? targetMatch.homeTeam.name : targetMatch.awayTeam.name;
                  matchSubs.push({ teamId: teamVal, teamName, playerIn, playerOut, minute });
                  renderKoSubsList();
                  mSub.close();
                  Toast.info(`Pergantian pemain (${playerIn} masuk menggantikan ${playerOut}) dicatat.`);
                }
              }
            ]
          });
          subModal.render();

          const subTeamSelect = document.getElementById('modal-ko-sub-team');
          const inSelect = document.getElementById('modal-ko-sub-in-select');
          const inManual = document.getElementById('modal-ko-sub-in');
          const outSelect = document.getElementById('modal-ko-sub-out-select');
          const outManual = document.getElementById('modal-ko-sub-out');

          setupPlayerSelectListener(inSelect, inManual);
          setupPlayerSelectListener(outSelect, outManual);

          function refreshSubPlayers(teamId) {
            populatePlayerOptions(inSelect, inManual, teamId);
            populatePlayerOptions(outSelect, outManual, teamId);
          }

          refreshSubPlayers(subTeamSelect.value);
          subTeamSelect.addEventListener('change', () => {
            refreshSubPlayers(subTeamSelect.value);
          });
        });
      }, 50);
    });
  });
}
