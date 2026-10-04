/**
 * Admin Match Results & Events Input Page
 * PRD: §4.5 Input Hasil & Detail Pertandingan (HS-01..10), §4.3 Perhitungan Otomatis Klasemen (KL-01)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { MatchService } from '../../services/MatchService.js';
import { GoalService } from '../../services/GoalService.js';
import { CardService } from '../../services/CardService.js';
import { PlayerService } from '../../services/PlayerService.js';
import { StandingsService } from '../../services/StandingsService.js';
import { AuditLogService } from '../../services/AuditLogService.js';
import { Toast } from '../../components/Toast.js';
import { Modal } from '../../components/Modal.js';

export async function AdminResultsPage() {
  const matches = await ScheduleService.getAllMatches();
  const activeMatch = matches[0] || null;

  const content = `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Input Hasil & Detail Pertandingan</h1>
        <p class="text-sm text-muted">Pencatatan skor akhir, pencetak gol, sanksi kartu kuning/merah, pergantian pemain, serta auto-update klasemen.</p>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" id="btn-save-match-results" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>Simpan & Perbarui Klasemen</span>
        </button>
      </div>
    </div>

    ${matches.length === 0 ? `
      <div class="card text-center" style="padding: 3rem; color: var(--text-muted); border-style: dashed;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📝</div>
        <h4 style="margin: 0; color: var(--text-main);">Belum Ada Pertandingan Terjadwal</h4>
        <p class="text-xs" style="margin-top: 0.25rem;">Silakan buat jadwal pertandingan terlebih dahulu di menu "Penyusunan Jadwal".</p>
      </div>
    ` : `
      <!-- Match Selector Card -->
      <div class="card mb-6">
        <div class="form-group mb-4">
          <label class="form-label" for="select-match-target">PILIH PERTANDINGAN YANG AKAN DIINPUT / DIUBAH</label>
          <select id="select-match-target" class="form-select">
            ${matches.map(m => `
              <option value="${m.id}" ${m.id === activeMatch?.id ? 'selected' : ''}>
                [${m.stage || `Grup ${m.groupId}`}] ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.date || 'TBD'} - ${m.time || 'TBD'}) &bull; Status: ${m.status}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Match Score Entry Stadium Box -->
        <div style="background: rgba(10, 22, 40, 0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; text-align: center;">
          <div class="text-xs text-muted mb-3 flex items-center justify-between" style="flex-wrap: wrap; gap: 0.5rem;">
            <span id="match-box-stage" class="text-gold font-bold">${activeMatch?.stage || `Grup ${activeMatch?.groupId || ''}`}</span>
            <div class="flex items-center gap-2" style="flex-wrap: wrap;">
              <button type="button" id="btn-quick-wo" class="btn btn-outline btn-sm" style="font-size: 0.75rem;">
                🚩 Walkover 3-0 (HS-09)
              </button>
              <button type="button" id="btn-quick-disqualify" class="btn btn-outline btn-sm text-danger" style="font-size: 0.75rem;">
                🚫 Diskualifikasi (HS-10)
              </button>
              <select id="match-box-status" class="form-select" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                <option value="SCHEDULED" ${activeMatch?.status === 'SCHEDULED' ? 'selected' : ''}>Belum Dimulai</option>
                <option value="LIVE" ${activeMatch?.status === 'LIVE' ? 'selected' : ''}>Sedang Berlangsung (LIVE)</option>
                <option value="FINISHED" ${(!activeMatch?.status || activeMatch?.status === 'FINISHED') ? 'selected' : ''}>Selesai</option>
                <option value="POSTPONED" ${activeMatch?.status === 'POSTPONED' ? 'selected' : ''}>Ditunda</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 items-center gap-4">
            <!-- Home Team -->
            <div>
              <div class="team-badge-circle" id="home-badge-icon" style="width: 48px; height: 48px; margin: 0 auto 0.5rem auto; border-color: ${activeMatch?.homeTeam.color || '#3B82F6'}; background: ${activeMatch?.homeTeam.color}30;">
                ${activeMatch?.homeTeam.code || 'HOM'}
              </div>
              <h3 id="home-team-title" style="margin-bottom: 0.25rem; font-size: 1.15rem;">${activeMatch?.homeTeam.name || 'Tim Kandang'}</h3>
              <span class="badge badge-muted">Kandang (Home)</span>
            </div>

            <!-- Score Inputs (Normal Time) -->
            <div>
              <div class="flex items-center justify-center gap-3">
                <input type="number" id="input-home-score" class="form-input text-center font-mono font-bold text-gold" value="${activeMatch?.homeTeam.score !== null && activeMatch?.homeTeam.score !== undefined ? activeMatch.homeTeam.score : '0'}" style="width: 76px; font-size: 2.25rem; padding: 0.5rem;" min="0" />
                <span style="font-size: 1.75rem; font-weight: 800; color: var(--text-dim);">:</span>
                <input type="number" id="input-away-score" class="form-input text-center font-mono font-bold text-gold" value="${activeMatch?.awayTeam.score !== null && activeMatch?.awayTeam.score !== undefined ? activeMatch.awayTeam.score : '0'}" style="width: 76px; font-size: 2.25rem; padding: 0.5rem;" min="0" />
              </div>
              <div class="text-xs text-muted mt-2">Skor Waktu Normal (2 x 45 Menit)</div>
            </div>

            <!-- Away Team -->
            <div>
              <div class="team-badge-circle" id="away-badge-icon" style="width: 48px; height: 48px; margin: 0 auto 0.5rem auto; border-color: ${activeMatch?.awayTeam.color || '#EF4444'}; background: ${activeMatch?.awayTeam.color}30;">
                ${activeMatch?.awayTeam.code || 'AWY'}
              </div>
              <h3 id="away-team-title" style="margin-bottom: 0.25rem; font-size: 1.15rem;">${activeMatch?.awayTeam.name || 'Tim Tandang'}</h3>
              <span class="badge badge-muted">Tandang (Away)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Events Logs (Goals, Cards, Substitutions) -->
      <div class="grid grid-cols-1 md-grid-cols-3 gap-6">
        
        <!-- Goals Card (HS-04) -->
        <div class="card">
          <div class="card-header">
            <h4 style="margin: 0; color: var(--color-accent); display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem;">
              <span>⚽</span> Pencetak Gol (HS-04)
            </h4>
            <button type="button" id="btn-add-goal-event" class="btn btn-outline btn-sm">+ Tambah</button>
          </div>
          <div id="goals-event-list" style="display: flex; flex-direction: column; gap: 0.5rem; min-height: 120px;">
            <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;" id="empty-goals-notice">Belum ada pencetak gol tercatat.</div>
          </div>
        </div>

        <!-- Cards & Discipline (HS-05, AK-01) -->
        <div class="card">
          <div class="card-header">
            <h4 style="margin: 0; color: var(--color-danger); display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem;">
              <span>🟨</span> Sanksi Kartu (HS-05)
            </h4>
            <button type="button" id="btn-add-card-event" class="btn btn-outline btn-sm text-danger">+ Tambah</button>
          </div>
          <div id="cards-event-list" style="display: flex; flex-direction: column; gap: 0.5rem; min-height: 120px;">
            <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;" id="empty-cards-notice">Belum ada kartu tercatat.</div>
          </div>
        </div>

        <!-- Substitutions (HS-06) -->
        <div class="card">
          <div class="card-header">
            <h4 style="margin: 0; color: var(--color-teal); display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem;">
              <span>🔄</span> Pergantian Pemain (HS-06)
            </h4>
            <button type="button" id="btn-add-sub-event" class="btn btn-outline btn-sm text-teal">+ Tambah</button>
          </div>
          <div id="subs-event-list" style="display: flex; flex-direction: column; gap: 0.5rem; min-height: 120px;">
            <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;" id="empty-subs-notice">Belum ada pergantian pemain tercatat.</div>
          </div>
        </div>

      </div>
    `}
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/hasil'),
    init: () => initResultsPageEvents(matches)
  };
}

function initResultsPageEvents(matches) {
  const matchSelect = document.getElementById('select-match-target');
  const homeScoreInput = document.getElementById('input-home-score');
  const awayScoreInput = document.getElementById('input-away-score');
  const statusSelect = document.getElementById('match-box-status');
  const saveBtn = document.getElementById('btn-save-match-results');
  const quickWoBtn = document.getElementById('btn-quick-wo');
  const quickDisqualifyBtn = document.getElementById('btn-quick-disqualify');
  const addGoalBtn = document.getElementById('btn-add-goal-event');
  const addCardBtn = document.getElementById('btn-add-card-event');
  const addSubBtn = document.getElementById('btn-add-sub-event');

  let activeMatch = matches[0] || null;
  let matchGoals = activeMatch?.goals ? [...activeMatch.goals] : [];
  let matchCards = activeMatch?.cards ? [...activeMatch.cards] : [];
  let matchSubs = activeMatch?.substitutions ? [...activeMatch.substitutions] : [];

  function loadMatchData(match) {
    if (!match) return;
    activeMatch = match;
    document.getElementById('match-box-stage').textContent = match.stage || `Grup ${match.groupId || ''}`;
    document.getElementById('home-team-title').textContent = match.homeTeam.name;
    document.getElementById('away-team-title').textContent = match.awayTeam.name;
    document.getElementById('home-badge-icon').textContent = match.homeTeam.code;
    document.getElementById('away-badge-icon').textContent = match.awayTeam.code;
    homeScoreInput.value = match.homeTeam.score !== null && match.homeTeam.score !== undefined ? match.homeTeam.score : '0';
    awayScoreInput.value = match.awayTeam.score !== null && match.awayTeam.score !== undefined ? match.awayTeam.score : '0';
    statusSelect.value = match.status || 'FINISHED';

    matchGoals = match.goals ? [...match.goals] : [];
    matchCards = match.cards ? [...match.cards] : [];
    matchSubs = match.substitutions ? [...match.substitutions] : [];

    renderGoalsList();
    renderCardsList();
    renderSubsList();
  }

  // Match dropdown change
  if (matchSelect) {
    matchSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const found = matches.find(m => m.id === selectedId);
      if (found) {
        loadMatchData(found);
      }
    });
  }

  // Quick Walkover button (HS-09)
  if (quickWoBtn) {
    quickWoBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Putusan Walkover (WO) 3 - 0 (HS-09)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <p>Pilih tim yang dinyatakan menang WO dengan skor otomatis <strong>3 - 0</strong>:</p>
            <div class="flex items-center gap-3 mt-3">
              <button type="button" class="btn btn-outline btn-sm" id="btn-wo-home" style="flex: 1;">
                🏆 ${activeMatch.homeTeam.name} Menang (3-0)
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="btn-wo-away" style="flex: 1;">
                🏆 ${activeMatch.awayTeam.name} Menang (0-3)
              </button>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() }
        ]
      });
      modal.render();

      setTimeout(() => {
        document.getElementById('btn-wo-home')?.addEventListener('click', () => {
          homeScoreInput.value = '3';
          awayScoreInput.value = '0';
          statusSelect.value = 'FINISHED';
          modal.close();
          Toast.info(`WO diset: ${activeMatch.homeTeam.name} 3 - 0 ${activeMatch.awayTeam.name}`);
        });

        document.getElementById('btn-wo-away')?.addEventListener('click', () => {
          homeScoreInput.value = '0';
          awayScoreInput.value = '3';
          statusSelect.value = 'FINISHED';
          modal.close();
          Toast.info(`WO diset: ${activeMatch.homeTeam.name} 0 - 3 ${activeMatch.awayTeam.name}`);
        });
      }, 50);
    });
  }

  // Quick Disqualification button (HS-10)
  if (quickDisqualifyBtn) {
    quickDisqualifyBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Putusan Diskualifikasi Tim (HS-10)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <p class="text-danger mb-2">⚠️ Peringatan: Diskualifikasi tim membatalkan hak tanding tim terkait dan memberikan kemenangan WO 3-0 kepada tim lawan.</p>
            <p>Pilih tim yang dijatuhi sanksi diskualifikasi:</p>
            <div class="flex items-center gap-3 mt-3">
              <button type="button" class="btn btn-outline btn-sm text-danger" id="btn-disq-home" style="flex: 1;">
                🚫 Diskualifikasi ${activeMatch.homeTeam.name}
              </button>
              <button type="button" class="btn btn-outline btn-sm text-danger" id="btn-disq-away" style="flex: 1;">
                🚫 Diskualifikasi ${activeMatch.awayTeam.name}
              </button>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() }
        ]
      });
      modal.render();

      setTimeout(() => {
        document.getElementById('btn-disq-home')?.addEventListener('click', () => {
          homeScoreInput.value = '0';
          awayScoreInput.value = '3';
          statusSelect.value = 'FINISHED';
          modal.close();
          Toast.warning(`${activeMatch.homeTeam.name} didiskualifikasi! Skor diset 0-3 untuk kemenangan ${activeMatch.awayTeam.name}.`);
        });

        document.getElementById('btn-disq-away')?.addEventListener('click', () => {
          homeScoreInput.value = '3';
          awayScoreInput.value = '0';
          statusSelect.value = 'FINISHED';
          modal.close();
          Toast.warning(`${activeMatch.awayTeam.name} didiskualifikasi! Skor diset 3-0 untuk kemenangan ${activeMatch.homeTeam.name}.`);
        });
      }, 50);
    });
  }

  // Helper to load registered players for selected team in event modals
  async function populatePlayerOptions(selectEl, manualInputEl, teamId) {
    if (!selectEl) return;
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
    } catch (err) {
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

  // Add Goal Event Modal (HS-04)
  if (addGoalBtn) {
    addGoalBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Tambah Catatan Gol (HS-04)',
        content: `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Tim Pencetak Gol</label>
              <select id="modal-goal-team" class="form-select">
                <option value="${activeMatch.homeTeam.id}">${activeMatch.homeTeam.name}</option>
                <option value="${activeMatch.awayTeam.id}">${activeMatch.awayTeam.name}</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Nama Pemain Pencetak Gol</label>
              <select id="modal-goal-player-select" class="form-select">
                <option value="">Memuat daftar pemain...</option>
              </select>
              <input type="text" id="modal-goal-player" class="form-input mt-2" placeholder="Ketik nama pemain manual" style="display: none;" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Menit Gol</label>
                <input type="number" id="modal-goal-minute" class="form-input font-mono" placeholder="45" min="1" max="120" required />
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Tipe Gol</label>
                <select id="modal-goal-type" class="form-select">
                  <option value="normal">Gol Reguler</option>
                  <option value="penalty">Penalti (P)</option>
                  <option value="own_goal">Gol Bunuh Diri (OG)</option>
                </select>
              </div>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Catat Gol',
            className: 'btn-primary',
            action: 'add',
            onClick: (m) => {
              const teamId = document.getElementById('modal-goal-team')?.value;
              const playerSelect = document.getElementById('modal-goal-player-select');
              const manualInput = document.getElementById('modal-goal-player');
              const playerName = getChosenPlayerName(playerSelect, manualInput);
              const minute = document.getElementById('modal-goal-minute')?.value;
              const type = document.getElementById('modal-goal-type')?.value;

              if (!playerName || !minute) {
                Toast.error('Pilih atau ketik nama pemain serta isi menit gol!');
                return;
              }

              const teamName = teamId === activeMatch.homeTeam.id ? activeMatch.homeTeam.name : activeMatch.awayTeam.name;
              matchGoals.push({ teamId, teamName, playerName, minute, type });
              renderGoalsList();
              m.close();
              Toast.success(`Gol ${playerName} (Menit ${minute}') dicatat.`);
            }
          }
        ]
      });
      modal.render();

      const teamSelect = document.getElementById('modal-goal-team');
      const playerSelect = document.getElementById('modal-goal-player-select');
      const manualInput = document.getElementById('modal-goal-player');

      setupPlayerSelectListener(playerSelect, manualInput);
      populatePlayerOptions(playerSelect, manualInput, teamSelect.value);

      teamSelect.addEventListener('change', () => {
        populatePlayerOptions(playerSelect, manualInput, teamSelect.value);
      });
    });
  }

  function renderGoalsList() {
    const list = document.getElementById('goals-event-list');
    if (!list) return;
    if (matchGoals.length === 0) {
      list.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada pencetak gol tercatat.</div>`;
      return;
    }
    list.innerHTML = matchGoals.map((g, idx) => `
      <div class="card flex items-center justify-between" style="padding: 0.5rem 0.75rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
        <div style="font-size: 0.85rem;">
          <strong>⚽ ${g.playerName}</strong> <span class="text-xs text-muted">(${g.teamName})</span>
          ${g.type === 'penalty' ? '<span class="badge badge-gold ml-1">Penalti</span>' : ''}
          ${g.type === 'own_goal' ? '<span class="badge badge-danger ml-1">Bunuh Diri</span>' : ''}
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${g.minute}'</span>
          <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-goal" data-idx="${idx}">&times;</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-remove-goal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        matchGoals.splice(i, 1);
        renderGoalsList();
      });
    });
  }

  // Add Card Event Modal (HS-05, AK-01)
  if (addCardBtn) {
    addCardBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Tambah Sanksi Kartu (HS-05)',
        content: `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Tim Pelanggar</label>
              <select id="modal-card-team" class="form-select">
                <option value="${activeMatch.homeTeam.id}">${activeMatch.homeTeam.name}</option>
                <option value="${activeMatch.awayTeam.id}">${activeMatch.awayTeam.name}</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Nama Pemain Terkena Sanksi</label>
              <select id="modal-card-player-select" class="form-select">
                <option value="">Memuat daftar pemain...</option>
              </select>
              <input type="text" id="modal-card-player" class="form-input mt-2" placeholder="Ketik nama pemain manual" style="display: none;" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Jenis Kartu</label>
                <select id="modal-card-type" class="form-select">
                  <option value="yellow">🟨 Kartu Kuning (-1 Poin FP)</option>
                  <option value="second_yellow">🟨🟥 Kuning Kedua / Merah Tak Langsung (-3 FP)</option>
                  <option value="red">🟥 Kartu Merah Langsung (-4 FP)</option>
                </select>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Menit Pelanggaran</label>
                <input type="number" id="modal-card-minute" class="form-input font-mono" placeholder="74" min="1" max="120" required />
              </div>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Catat Sanksi Kartu',
            className: 'btn-danger',
            action: 'add',
            onClick: (m) => {
              const teamId = document.getElementById('modal-card-team')?.value;
              const playerSelect = document.getElementById('modal-card-player-select');
              const manualInput = document.getElementById('modal-card-player');
              const playerName = getChosenPlayerName(playerSelect, manualInput);
              const type = document.getElementById('modal-card-type')?.value;
              const minute = document.getElementById('modal-card-minute')?.value;

              if (!playerName || !minute) {
                Toast.error('Pilih atau ketik nama pemain serta isi menit pelanggaran!');
                return;
              }

              const teamName = teamId === activeMatch.homeTeam.id ? activeMatch.homeTeam.name : activeMatch.awayTeam.name;
              matchCards.push({ teamId, teamName, playerName, type, minute, matchId: activeMatch.id, groupId: activeMatch.groupId });
              renderCardsList();
              m.close();
              Toast.warning(`Kartu ${type === 'red' ? 'Merah' : 'Kuning'} untuk ${playerName} dicatat.`);
            }
          }
        ]
      });
      modal.render();

      const cardTeamSelect = document.getElementById('modal-card-team');
      const cardPlayerSelect = document.getElementById('modal-card-player-select');
      const cardManualInput = document.getElementById('modal-card-player');

      setupPlayerSelectListener(cardPlayerSelect, cardManualInput);
      populatePlayerOptions(cardPlayerSelect, cardManualInput, cardTeamSelect.value);

      cardTeamSelect.addEventListener('change', () => {
        populatePlayerOptions(cardPlayerSelect, cardManualInput, cardTeamSelect.value);
      });
    });
  }

  function renderCardsList() {
    const list = document.getElementById('cards-event-list');
    if (!list) return;
    if (matchCards.length === 0) {
      list.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada kartu tercatat.</div>`;
      return;
    }
    list.innerHTML = matchCards.map((c, idx) => `
      <div class="card flex items-center justify-between" style="padding: 0.5rem 0.75rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
        <div style="font-size: 0.85rem;">
          <strong>${c.type === 'red' ? '🟥' : '🟨'} ${c.playerName}</strong> <span class="text-xs text-muted">(${c.teamName})</span>
          <span class="badge ${c.type === 'red' ? 'badge-danger' : 'badge-warning'} ml-1">
            ${c.type === 'red' ? 'Merah Langsung' : c.type === 'second_yellow' ? 'Kuning ke-2' : 'Kartu Kuning'}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${c.minute}'</span>
          <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-card" data-idx="${idx}">&times;</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-remove-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        matchCards.splice(i, 1);
        renderCardsList();
      });
    });
  }

  // Add Substitution Event Modal (HS-06)
  if (addSubBtn) {
    addSubBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Catat Pergantian Pemain (HS-06)',
        content: `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Tim</label>
              <select id="modal-sub-team" class="form-select">
                <option value="${activeMatch.homeTeam.id}">${activeMatch.homeTeam.name}</option>
                <option value="${activeMatch.awayTeam.id}">${activeMatch.awayTeam.name}</option>
              </select>
            </div>
            <div class="grid grid-cols-1 sm-grid-cols-2 gap-3">
              <div class="form-group" style="margin: 0;">
                <label class="form-label text-success">🟢 Pemain Masuk</label>
                <select id="modal-sub-in-select" class="form-select">
                  <option value="">Memuat daftar pemain...</option>
                </select>
                <input type="text" id="modal-sub-in" class="form-input mt-2" placeholder="Nama pemain masuk" style="display: none;" />
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label text-danger">🔴 Pemain Keluar</label>
                <select id="modal-sub-out-select" class="form-select">
                  <option value="">Memuat daftar pemain...</option>
                </select>
                <input type="text" id="modal-sub-out" class="form-input mt-2" placeholder="Nama pemain keluar" style="display: none;" />
              </div>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label">Menit Pergantian</label>
              <input type="number" id="modal-sub-minute" class="form-input font-mono" placeholder="60" min="1" max="120" required />
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Catat Pergantian',
            className: 'btn-teal',
            action: 'add',
            onClick: (m) => {
              const teamId = document.getElementById('modal-sub-team')?.value;
              const subInSelect = document.getElementById('modal-sub-in-select');
              const subInManual = document.getElementById('modal-sub-in');
              const subOutSelect = document.getElementById('modal-sub-out-select');
              const subOutManual = document.getElementById('modal-sub-out');

              const playerIn = getChosenPlayerName(subInSelect, subInManual);
              const playerOut = getChosenPlayerName(subOutSelect, subOutManual);
              const minute = document.getElementById('modal-sub-minute')?.value;

              if (!playerIn || !playerOut || !minute) {
                Toast.error('Seluruh kolom pergantian pemain wajib diisi!');
                return;
              }

              const teamName = teamId === activeMatch.homeTeam.id ? activeMatch.homeTeam.name : activeMatch.awayTeam.name;
              matchSubs.push({ teamId, teamName, playerIn, playerOut, minute });
              renderSubsList();
              m.close();
              Toast.info(`Pergantian pemain (${playerIn} masuk menggantikan ${playerOut}) dicatat.`);
            }
          }
        ]
      });
      modal.render();

      const subTeamSelect = document.getElementById('modal-sub-team');
      const subInSelect = document.getElementById('modal-sub-in-select');
      const subInManual = document.getElementById('modal-sub-in');
      const subOutSelect = document.getElementById('modal-sub-out-select');
      const subOutManual = document.getElementById('modal-sub-out');

      setupPlayerSelectListener(subInSelect, subInManual);
      setupPlayerSelectListener(subOutSelect, subOutManual);

      function refreshSubPlayers(teamId) {
        populatePlayerOptions(subInSelect, subInManual, teamId);
        populatePlayerOptions(subOutSelect, subOutManual, teamId);
      }

      refreshSubPlayers(subTeamSelect.value);
      subTeamSelect.addEventListener('change', () => {
        refreshSubPlayers(subTeamSelect.value);
      });
    });
  }

  function renderSubsList() {
    const list = document.getElementById('subs-event-list');
    if (!list) return;
    if (matchSubs.length === 0) {
      list.innerHTML = `<div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada pergantian pemain tercatat.</div>`;
      return;
    }
    list.innerHTML = matchSubs.map((s, idx) => `
      <div class="card flex items-center justify-between" style="padding: 0.5rem 0.75rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
        <div style="font-size: 0.8rem;">
          <span class="text-success font-bold">▲ ${s.playerIn}</span> / <span class="text-danger">▼ ${s.playerOut}</span>
          <div class="text-xs text-muted">${s.teamName}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-gold font-bold" style="font-size: 0.8rem;">${s.minute}'</span>
          <button type="button" class="btn btn-ghost btn-sm text-danger btn-remove-sub" data-idx="${idx}">&times;</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.btn-remove-sub').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        matchSubs.splice(i, 1);
        renderSubsList();
      });
    });
  }

  // Initial load sync
  if (activeMatch) {
    loadMatchData(activeMatch);
  } else {
    renderGoalsList();
    renderCardsList();
    renderSubsList();
  }

  // Save button: updates match score, logs events, and triggers real-time standings recalculation (KL-01)
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!activeMatch) return;

      const homeScore = parseInt(homeScoreInput.value, 10);
      const awayScore = parseInt(awayScoreInput.value, 10);
      const status = statusSelect.value;

      try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px;"></span> Menyimpan...`;

        // 1. Prepare updated match data payload
        const updatedMatchData = {
          homeTeam: { ...activeMatch.homeTeam, score: homeScore },
          awayTeam: { ...activeMatch.awayTeam, score: awayScore },
          status: status,
          isFinished: status === 'FINISHED',
          goals: matchGoals,
          cards: matchCards,
          substitutions: matchSubs
        };

        // Update in storage
        await MatchService.updateScore(activeMatch.id, updatedMatchData);

        // Update in-memory activeMatch and matches array
        activeMatch = { ...activeMatch, ...updatedMatchData };
        const foundIdx = matches.findIndex(m => m.id === activeMatch.id);
        if (foundIdx !== -1) {
          matches[foundIdx] = { ...matches[foundIdx], ...updatedMatchData };
        }

        // 2. Clean previous match goals and save fresh goals
        try {
          const allGoals = await GoalService.getAll();
          const existingGoals = allGoals.filter(g => g.matchId === activeMatch.id);
          for (const eg of existingGoals) {
            await GoalService.deleteGoal(eg.id);
          }
          for (const g of matchGoals) {
            await GoalService.addGoal({ ...g, matchId: activeMatch.id, matchStage: activeMatch.stage });
          }
        } catch (gErr) {
          console.warn('Non-critical: goal service save:', gErr);
        }

        // 3. Clean previous match cards and save fresh cards
        try {
          const allCards = await CardService.getAll();
          const existingCards = allCards.filter(c => c.matchId === activeMatch.id);
          for (const ec of existingCards) {
            await CardService.deleteCard(ec.id);
          }
          for (const c of matchCards) {
            await CardService.addCard({ ...c, matchId: activeMatch.id, groupId: activeMatch.groupId });
          }
        } catch (cErr) {
          console.warn('Non-critical: card service save:', cErr);
        }

        // 4. Auto-update and recalculate group standings live (KL-01)
        await StandingsService.getLiveStandings();

        // 5. Audit Log (AD-08)
        await AuditLogService.logActivity(
          'Input Hasil Pertandingan',
          `Hasil ${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}: ${homeScore} - ${awayScore} (${status})`,
          'match',
          '⚽'
        );

        // Update select option text
        if (matchSelect) {
          const opt = matchSelect.querySelector(`option[value="${activeMatch.id}"]`);
          if (opt) {
            opt.textContent = `[${activeMatch.stage || `Grup ${activeMatch.groupId}`}] ${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name} (${activeMatch.date || 'TBD'} - ${activeMatch.time || 'TBD'}) • Status: ${status}`;
          }
        }

        Toast.success(`Hasil pertandingan ${activeMatch.homeTeam.name} (${homeScore} - ${awayScore}) ${activeMatch.awayTeam.name} berhasil disimpan! Rincian laga & klasemen telah diperbarui.`);
      } catch (err) {
        console.error('Error saving match result:', err);
        Toast.error('Gagal menyimpan hasil pertandingan: ' + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span>Simpan & Perbarui Klasemen</span>
        `;
      }
    });
  }
}
