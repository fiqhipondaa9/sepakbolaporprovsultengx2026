/**
 * Admin Teams & Players Management Page
 * PRD: §4.6 Manajemen Tim & Pemain (TM-01..09), §4.2 Seeded (SD-01..06)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { TeamService } from '../../services/TeamService.js';
import { PlayerService } from '../../services/PlayerService.js';
import { OfficialService } from '../../services/OfficialService.js';
import { DEFAULT_SULTENG_TEAMS } from '../../data/defaultTeams.js';
import { createTeamCard } from '../../components/TeamCard.js';
import { Modal } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';
import { AuditLogService } from '../../services/AuditLogService.js';

export async function AdminTeamsPage() {
  const teams = await TeamService.getAll();
  const seededCount = teams.filter(t => t.isSeeded).length;

  const content = `
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.85rem; margin-bottom: 0.25rem;">Kelola Tim Kontingen & Pemain</h1>
        <p class="text-sm text-muted">Manajemen 13 kontingen daerah Sulawesi Tengah, warna kostum, status unggulan (seeded), dan kuota pemain.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-reset-default-teams" class="btn btn-outline btn-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>Muat 13 Tim Resmi Sulteng</span>
        </button>

        <button type="button" id="btn-add-team" class="btn btn-primary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tambah Tim Baru</span>
        </button>
      </div>
    </div>

    <!-- Metrics Bar -->
    <div class="grid grid-cols-2 sm-grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 166, 35, 0.15); color: var(--color-accent);">👥</div>
        <div>
          <div class="stat-value text-gold" id="metric-total-teams">${teams.length}</div>
          <div class="stat-label">Total Tim Terdaftar</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 191, 166, 0.15); color: var(--color-secondary-light);">⭐</div>
        <div>
          <div class="stat-value text-teal" id="metric-seeded-teams">${seededCount}</div>
          <div class="stat-label">Tim Unggulan (Seeded)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3B82F6;">⚪</div>
        <div>
          <div class="stat-value" style="color: #60A5FA;">${teams.length - seededCount}</div>
          <div class="stat-label">Tim Non-Unggulan</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(34, 197, 94, 0.15); color: var(--color-success);">👕</div>
        <div>
          <div class="stat-value text-success">${teams.length * 25}</div>
          <div class="stat-label">Kuota Pemain (Maks. 25/Tim)</div>
        </div>
      </div>
    </div>

    <!-- Filter Buttons Bar -->
    <div class="flex items-center justify-between mb-4" style="flex-wrap: wrap; gap: 0.75rem;">
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline filter-team-btn active" data-filter="all">Semua Tim (${teams.length})</button>
        <button type="button" class="btn btn-sm btn-outline filter-team-btn" data-filter="seeded">⭐ Unggulan Seeded (${seededCount})</button>
        <button type="button" class="btn btn-sm btn-outline filter-team-btn" data-filter="non-seeded">Non-Seeded (${teams.length - seededCount})</button>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-dim);">
        Maksimal Seeded: <strong>4 Tim</strong> (sesuai kuota 4 grup)
      </div>
    </div>

    <!-- Teams Grid -->
    <div class="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 lg-grid-cols-4 gap-4" id="admin-teams-grid">
      ${teams.map(t => createTeamCard(t)).join('')}
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/tim'),
    init: () => initTeamPageEvents()
  };
}

/**
 * Team Page Events & Handlers
 */
function initTeamPageEvents() {
  // Add team button
  const addBtn = document.getElementById('btn-add-team');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openTeamFormModal(null);
    });
  }

  // Reset to default teams button
  const resetBtn = document.getElementById('btn-reset-default-teams');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Muat Ulang 13 Kontingen Resmi?',
        content: '<p class="text-sm text-muted">Aksi ini akan memuat kembali daftar 13 Kabupaten/Kota resmi se-Sulawesi Tengah dan memperbarui data kustom tim.</p>',
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Muat 13 Tim Resmi',
            className: 'btn-primary',
            action: 'load',
            onClick: async (m) => {
              m.close();
              for (const t of DEFAULT_SULTENG_TEAMS) {
                await TeamService.create(t);
              }
              Toast.success('13 Tim Resmi Kontingen Sulteng berhasil dimuat!');
              setTimeout(() => window.location.reload(), 300);
            }
          }
        ]
      });
      modal.render();
    });
  }

  // Filter team buttons
  document.querySelectorAll('.filter-team-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-team-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
      e.currentTarget.classList.add('active');

      const filter = e.currentTarget.getAttribute('data-filter');
      const cards = document.querySelectorAll('.team-management-card');

      cards.forEach(card => {
        const isSeeded = card.querySelector('.badge-gold') !== null;
        if (filter === 'all') {
          card.style.display = 'flex';
        } else if (filter === 'seeded') {
          card.style.display = isSeeded ? 'flex' : 'none';
        } else if (filter === 'non-seeded') {
          card.style.display = !isSeeded ? 'flex' : 'none';
        }
      });
    });
  });

  // Delegate Edit, Delete & Roster clicks
  document.querySelectorAll('.btn-manage-roster').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const teamId = e.currentTarget.getAttribute('data-team-id');
      openRosterModal(teamId);
    });
  });

  document.querySelectorAll('.btn-edit-team').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const teamId = e.currentTarget.getAttribute('data-team-id');
      const team = await TeamService.getById(teamId);
      if (team) {
        openTeamFormModal(team);
      }
    });
  });

  document.querySelectorAll('.btn-delete-team').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const teamId = e.currentTarget.getAttribute('data-team-id');
      const team = await TeamService.getById(teamId);
      const teamName = team ? team.name : teamId;

      const modal = new Modal({
        title: `Hapus Kontingen ${teamName}?`,
        content: `<p class="text-sm text-danger">Apakah Anda yakin ingin menghapus <strong>${teamName}</strong> dari database turnamen?</p>`,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Hapus Tim',
            className: 'btn-danger',
            action: 'delete',
            onClick: async (m) => {
              m.close();
              await TeamService.delete(teamId);
              Toast.success(`Tim ${teamName} berhasil dihapus.`);
              const card = document.getElementById(`team-card-${teamId}`);
              if (card) card.remove();
            }
          }
        ]
      });
      modal.render();
    });
  });
}

/**
 * Open Modal Form for Adding or Editing Team (PRD TM-01, SD-01)
 */
async function openTeamFormModal(existingTeam = null) {
  const isEdit = existingTeam !== null;
  const allTeams = await TeamService.getAll();

  // Map which team currently holds which seed
  const currentSeedHolders = {};
  allTeams.forEach(t => {
    if (t.isSeeded && t.id !== existingTeam?.id && t.seedRank) {
      currentSeedHolders[t.seedRank] = t;
    }
  });

  const content = `
    <form id="team-form" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="form-group" style="margin: 0;">
        <label class="form-label" for="form-team-name">Nama Kontingen / Tim *</label>
        <input type="text" id="form-team-name" class="form-input" value="${existingTeam?.name || ''}" placeholder="contoh: Kabupaten Morowali" required />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="form-team-code">Kode Tim (3 Huruf) *</label>
          <input type="text" id="form-team-code" class="form-input font-mono" maxlength="3" value="${existingTeam?.code || ''}" placeholder="MRW" style="text-transform: uppercase;" required />
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="form-team-city">Kota / Ibukota Daerah</label>
          <input type="text" id="form-team-city" class="form-input" value="${existingTeam?.city || ''}" placeholder="Bungku" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="form-team-color">Warna Kostum Utama</label>
          <div class="flex items-center gap-2">
            <input type="color" id="form-team-color" value="${existingTeam?.color || '#EF4444'}" style="width: 44px; height: 38px; border-radius: var(--radius-sm); border: none; cursor: pointer; background: transparent;" />
            <input type="text" id="form-team-color-hex" class="form-input font-mono text-xs" value="${existingTeam?.color || '#EF4444'}" />
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="form-team-secondary-color">Warna Kostum Cadangan</label>
          <div class="flex items-center gap-2">
            <input type="color" id="form-team-secondary-color" value="${existingTeam?.secondaryColor || '#FFFFFF'}" style="width: 44px; height: 38px; border-radius: var(--radius-sm); border: none; cursor: pointer; background: transparent;" />
            <input type="text" id="form-team-secondary-color-hex" class="form-input font-mono text-xs" value="${existingTeam?.secondaryColor || '#FFFFFF'}" />
          </div>
        </div>
      </div>

      <!-- Seeded Configuration (PRD §4.2 SD-01..06) -->
      <div class="card" style="padding: 1rem; background: rgba(245, 166, 35, 0.08); border-color: rgba(245, 166, 35, 0.3);">
        <label class="form-toggle-label mb-2">
          <input type="checkbox" id="form-team-is-seeded" class="form-toggle" ${existingTeam?.isSeeded ? 'checked' : ''} />
          <span style="font-weight: 700; color: var(--color-accent);">⭐ Tetapkan Sebagai Tim Unggulan (Seeded)</span>
        </label>
        <p class="text-xs text-muted mb-3" style="margin-left: 56px;">
          Tim seeded akan ditempatkan di Pot 1 pada posisi slot 1 masing-masing grup agar tidak bertemu di babak penyisihan.
        </p>

        <div id="seeded-details-row" class="grid grid-cols-1 sm-grid-cols-2 gap-3" style="display: ${existingTeam?.isSeeded ? 'grid' : 'none'};">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" for="form-team-seed-rank">Peringkat Unggulan (1 - 4)</label>
            <select id="form-team-seed-rank" class="form-select">
              <option value="1" ${existingTeam?.seedRank === 1 ? 'selected' : ''}>
                Unggulan 1 (Slot A1) ${currentSeedHolders[1] ? `[Saat ini: ${currentSeedHolders[1].name}]` : '[Tersedia]'}
              </option>
              <option value="2" ${existingTeam?.seedRank === 2 ? 'selected' : ''}>
                Unggulan 2 (Slot B1) ${currentSeedHolders[2] ? `[Saat ini: ${currentSeedHolders[2].name}]` : '[Tersedia]'}
              </option>
              <option value="3" ${existingTeam?.seedRank === 3 ? 'selected' : ''}>
                Unggulan 3 (Slot C1) ${currentSeedHolders[3] ? `[Saat ini: ${currentSeedHolders[3].name}]` : '[Tersedia]'}
              </option>
              <option value="4" ${existingTeam?.seedRank === 4 ? 'selected' : ''}>
                Unggulan 4 (Slot D1) ${currentSeedHolders[4] ? `[Saat ini: ${currentSeedHolders[4].name}]` : '[Tersedia]'}
              </option>
            </select>
            <p id="seed-conflict-hint" class="text-xs mt-1 text-muted" style="font-size: 0.72rem;"></p>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" for="form-team-seed-reason">Alasan Unggulan</label>
            <input type="text" id="form-team-seed-reason" class="form-input" value="${existingTeam?.seedReason || ''}" placeholder="Juara Bertahan / Tuan Rumah" />
          </div>
        </div>

        ${existingTeam?.groupId ? `
          <div class="card mt-3" style="padding: 0.65rem 0.85rem; margin-bottom: 0; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.3);">
            <div class="text-xs" style="color: var(--color-secondary-light); line-height: 1.45;">
              📌 <strong>Status Grup Saat Ini:</strong> Tim ini sebelumnya sudah terundi ke <strong>Grup ${existingTeam.groupId} (${existingTeam.groupSlot})</strong>. Mengubah status Unggulan di sini hanya memperbarui ranking Pot 1. Untuk menerapkan posisi grup baru ke bagan turnamen, silakan lakukan undian ulang di menu <a href="#/admin/pengundian" style="color: var(--color-accent); text-decoration: underline;">Pengundian & Seeded</a>.
            </div>
          </div>
        ` : ''}
      </div>
    </form>
  `;

  const modal = new Modal({
    title: isEdit ? `Edit Data: ${existingTeam.name}` : 'Tambah Kontingen Tim Baru',
    content: content,
    buttons: [
      { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
      { 
        text: isEdit ? 'Simpan Perubahan' : 'Tambahkan Tim', 
        className: 'btn-primary', 
        action: 'save', 
        onClick: async (m) => {
          const name = document.getElementById('form-team-name')?.value.trim();
          const code = document.getElementById('form-team-code')?.value.trim().toUpperCase();
          const city = document.getElementById('form-team-city')?.value.trim();
          const color = document.getElementById('form-team-color')?.value;
          const secondaryColor = document.getElementById('form-team-secondary-color')?.value;
          const isSeeded = document.getElementById('form-team-is-seeded')?.checked;
          const seedRank = isSeeded ? parseInt(document.getElementById('form-team-seed-rank')?.value || '1', 10) : null;
          const seedReason = isSeeded ? document.getElementById('form-team-seed-reason')?.value.trim() : null;

          if (!name || !code) {
            Toast.error('Nama tim dan kode 3 huruf wajib diisi!');
            return;
          }

          if (code.length !== 3) {
            Toast.warning('Kode tim harus terdiri dari tepat 3 huruf!');
            return;
          }

          // Check if seedRank is already taken by another team
          if (isSeeded && currentSeedHolders[seedRank]) {
            const previousHolder = currentSeedHolders[seedRank];
            // Swap: assign previous team's seed to existingTeam's old seed (or find first available 1-4)
            const oldRank = existingTeam?.seedRank;
            let targetRankForPrevious = oldRank;
            if (!targetRankForPrevious || targetRankForPrevious === seedRank) {
              const allUsedRanks = new Set(allTeams.filter(t => t.isSeeded && t.id !== previousHolder.id && t.id !== existingTeam?.id).map(t => t.seedRank));
              allUsedRanks.add(seedRank);
              for (let r = 1; r <= 4; r++) {
                if (!allUsedRanks.has(r)) {
                  targetRankForPrevious = r;
                  break;
                }
              }
            }

            if (targetRankForPrevious) {
              await TeamService.update(previousHolder.id, { seedRank: targetRankForPrevious });
              Toast.info(`Unggulan ${seedRank} dialihkan ke ${name}. ${previousHolder.name} otomatis disesuaikan ke Unggulan ${targetRankForPrevious}.`);
            }
          }

          const teamPayload = {
            id: existingTeam?.id || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            name,
            code,
            city: city || 'Sulawesi Tengah',
            color: color || '#EF4444',
            secondaryColor: secondaryColor || '#FFFFFF',
            isSeeded,
            seedRank,
            seedReason,
            logoText: code
          };

          try {
            if (isEdit) {
              await TeamService.update(existingTeam.id, teamPayload);
              Toast.success(`Data ${name} berhasil diperbarui!`);
            } else {
              await TeamService.create(teamPayload);
              Toast.success(`Tim ${name} berhasil ditambahkan!`);
            }
            m.close();
            setTimeout(() => window.location.reload(), 400);
          } catch (err) {
            Toast.error('Gagal menyimpan tim: ' + err.message);
          }
        } 
      }
    ]
  });

  modal.render();

  // Color picker sync & Seeded toggle event inside modal
  const colorPicker = document.getElementById('form-team-color');
  const colorHex = document.getElementById('form-team-color-hex');
  if (colorPicker && colorHex) {
    colorPicker.addEventListener('input', (e) => colorHex.value = e.target.value.toUpperCase());
    colorHex.addEventListener('input', (e) => colorPicker.value = e.target.value);
  }

  const secPicker = document.getElementById('form-team-secondary-color');
  const secHex = document.getElementById('form-team-secondary-color-hex');
  if (secPicker && secHex) {
    secPicker.addEventListener('input', (e) => secHex.value = e.target.value.toUpperCase());
    secHex.addEventListener('input', (e) => secPicker.value = e.target.value);
  }

  const seededToggle = document.getElementById('form-team-is-seeded');
  const seededRow = document.getElementById('seeded-details-row');
  const seedSelect = document.getElementById('form-team-seed-rank');
  const conflictHint = document.getElementById('seed-conflict-hint');

  function updateSeedConflictHint() {
    if (!conflictHint || !seedSelect) return;
    const selectedRank = parseInt(seedSelect.value, 10);
    const holder = currentSeedHolders[selectedRank];
    if (holder) {
      conflictHint.innerHTML = `<span class="text-gold">⚠️ Slot ini dipegang oleh <strong>${holder.name}</strong>. Jika disimpan, peringkat akan otomatis ditukar.</span>`;
    } else {
      conflictHint.innerHTML = `<span class="text-success">✓ Slot Unggulan ${selectedRank} tersedia.</span>`;
    }
  }

  if (seededToggle && seededRow) {
    seededToggle.addEventListener('change', (e) => {
      seededRow.style.display = e.target.checked ? 'grid' : 'none';
      if (e.target.checked) updateSeedConflictHint();
    });
  }

  if (seedSelect) {
    seedSelect.addEventListener('change', updateSeedConflictHint);
    updateSeedConflictHint();
  }
}

/**
 * Open Modal for Managing Players & Officials (TM-02..06)
 */
async function openRosterModal(teamId) {
  const team = await TeamService.getById(teamId);
  if (!team) return;

  const [players, officials] = await Promise.all([
    PlayerService.getByTeam(teamId),
    OfficialService.getByTeam(teamId)
  ]);

  const modal = new Modal({
    title: `👥 Skuad Pemain & Official: ${team.name}`,
    content: `
      <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
        
        <!-- Tab Buttons -->
        <div class="flex items-center gap-2 pb-2" style="border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap;">
          <button type="button" id="tab-btn-players" class="btn btn-sm btn-primary">
            Daftar Pemain (${players.length}/25)
            ${players.length > 25 ? '<span class="badge badge-danger ml-1" style="font-size: 0.65rem;">Kelebihan Kuota!</span>' : ''}
          </button>
          <button type="button" id="tab-btn-officials" class="btn btn-sm btn-outline">Official Tim (${officials.length})</button>
          <button type="button" id="tab-btn-csv" class="btn btn-sm btn-outline text-gold">Import CSV (TM-06)</button>
        </div>

        ${players.length > 25 ? `
          <div class="card" style="padding: 0.75rem 1rem; margin: 0; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4);">
            <div class="text-danger font-bold text-xs" style="line-height: 1.5;">
              ⚠️ <strong>PERINGATAN KUOTA RESMI (TM-04):</strong> Tim ini memiliki <strong>${players.length} pemain</strong> (melebihi batas kuota regulasi 25 pemain). Harap hapus <strong>${players.length - 25} pemain</strong> agar memenuhi kuota sah turnamen.
            </div>
          </div>
        ` : ''}

        <!-- Section 1: Players (TM-02, TM-04, TM-05) -->
        <div id="section-players" style="display: block;">
          <div class="card mb-3" style="padding: 0.85rem; background: rgba(255, 255, 255, 0.02);">
            <div class="text-xs text-gold font-bold mb-2">+ Tambah Pemain Baru (Maks. 25 Pemain)</div>
            <div class="grid grid-cols-1 sm-grid-cols-4 gap-2">
              <input type="number" id="new-player-number" class="form-input font-mono" placeholder="No (1-99)" min="1" max="99" style="padding: 0.4rem;" />
              <input type="text" id="new-player-name" class="form-input" placeholder="Nama Lengkap Pemain" style="padding: 0.4rem; grid-column: span 2;" />
              <select id="new-player-pos" class="form-select" style="padding: 0.4rem;">
                <option value="Penjaga Gawang (GK)">Kiper (GK)</option>
                <option value="Bek (DF)" selected>Bek (DF)</option>
                <option value="Gelandang (MF)">Gelandang (MF)</option>
                <option value="Penyerang (FW)">Penyerang (FW)</option>
              </select>
            </div>
            <div class="flex justify-end mt-2">
              <button type="button" id="btn-save-new-player" class="btn btn-primary btn-sm">+ Tambahkan ke Tim</button>
            </div>
          </div>

          <div style="max-height: 250px; overflow-y: auto;">
            ${players.length === 0 ? `
              <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada pemain yang didaftarkan.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${players.map(p => `
                  <div class="flex items-center justify-between" style="padding: 0.4rem 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-gold font-bold" style="width: 24px; text-align: center;">${p.number}</span>
                      <strong>${p.name}</strong>
                      <span class="text-xs text-muted">(${p.position})</span>
                    </div>
                    <button type="button" class="btn btn-ghost btn-sm text-danger btn-delete-player" data-player-id="${p.id}">&times;</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Section 2: Officials (TM-03) -->
        <div id="section-officials" style="display: none;">
          <div class="card mb-3" style="padding: 0.85rem; background: rgba(255, 255, 255, 0.02);">
            <div class="text-xs text-teal font-bold mb-2">+ Tambah Official Tim (Pelatih / Manajer / Dokter)</div>
            <div class="grid grid-cols-1 sm-grid-cols-3 gap-2">
              <input type="text" id="new-official-name" class="form-input" placeholder="Nama Official" style="padding: 0.4rem; grid-column: span 2;" />
              <select id="new-official-role" class="form-select" style="padding: 0.4rem;">
                <option value="Pelatih Kepala">Pelatih Kepala</option>
                <option value="Asisten Pelatih">Asisten Pelatih</option>
                <option value="Manajer Tim">Manajer Tim</option>
                <option value="Dokter / Medis">Dokter / Medis</option>
              </select>
            </div>
            <div class="flex justify-end mt-2">
              <button type="button" id="btn-save-new-official" class="btn btn-teal btn-sm">+ Tambah Official</button>
            </div>
          </div>

          <div style="max-height: 250px; overflow-y: auto;">
            ${officials.length === 0 ? `
              <div class="text-xs text-muted text-center" style="padding: 1.5rem 0;">Belum ada data official tim.</div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${officials.map(o => `
                  <div class="flex items-center justify-between" style="padding: 0.4rem 0.6rem; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">
                    <div>
                      <strong>${o.name}</strong>
                      <span class="badge badge-teal ml-2">${o.role}</span>
                    </div>
                    <button type="button" class="btn btn-ghost btn-sm text-danger btn-delete-official" data-official-id="${o.id}">&times;</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Section 3: Import CSV (TM-06) -->
        <div id="section-csv" style="display: none;">
          <p class="text-xs text-muted mb-2">Salin & tempel daftar pemain dalam format: <code>Nomor,Nama,Posisi</code> (satu baris per pemain):</p>
          <textarea id="input-csv-players" class="form-input font-mono" rows="6" placeholder="1,Ahmad Kurniawan,Penjaga Gawang (GK)&#10;4,Bayu Saputra,Bek (DF)&#10;8,Fikram Alamsyah,Gelandang (MF)&#10;9,Dimas Anggara,Penyerang (FW)"></textarea>
          <div class="flex justify-end mt-2">
            <button type="button" id="btn-import-csv" class="btn btn-primary btn-sm">📥 Proses Import Data CSV</button>
          </div>
        </div>

      </div>
    `,
    buttons: [
      { text: 'Tutup', className: 'btn-outline', action: 'close', onClick: (m) => m.close() }
    ]
  });

  modal.render();

  setTimeout(() => {
    const tabPlayers = document.getElementById('tab-btn-players');
    const tabOfficials = document.getElementById('tab-btn-officials');
    const tabCsv = document.getElementById('tab-btn-csv');

    const secPlayers = document.getElementById('section-players');
    const secOfficials = document.getElementById('section-officials');
    const secCsv = document.getElementById('section-csv');

    const switchTab = (tab) => {
      [tabPlayers, tabOfficials, tabCsv].forEach(b => b.classList.remove('btn-primary'));
      [tabPlayers, tabOfficials, tabCsv].forEach(b => b.classList.add('btn-outline'));

      secPlayers.style.display = 'none';
      secOfficials.style.display = 'none';
      secCsv.style.display = 'none';

      if (tab === 'players') {
        tabPlayers.classList.add('btn-primary');
        secPlayers.style.display = 'block';
      } else if (tab === 'officials') {
        tabOfficials.classList.add('btn-primary');
        secOfficials.style.display = 'block';
      } else if (tab === 'csv') {
        tabCsv.classList.add('btn-primary');
        secCsv.style.display = 'block';
      }
    };

    if (tabPlayers) tabPlayers.addEventListener('click', () => switchTab('players'));
    if (tabOfficials) tabOfficials.addEventListener('click', () => switchTab('officials'));
    if (tabCsv) tabCsv.addEventListener('click', () => switchTab('csv'));

    // Save Single Player (TM-02, TM-04, TM-05)
    document.getElementById('btn-save-new-player')?.addEventListener('click', async () => {
      if (players.length >= 25) {
        Toast.error('Batas maksimum kuota 25 pemain untuk tim ini telah tercapai (TM-04)!');
        return;
      }

      const numVal = parseInt(document.getElementById('new-player-number')?.value, 10);
      const nameVal = document.getElementById('new-player-name')?.value.trim();
      const posVal = document.getElementById('new-player-pos')?.value;

      if (!numVal || !nameVal) {
        Toast.error('Nomor punggung dan nama pemain wajib diisi!');
        return;
      }

      // Check unique jersey number (TM-05)
      const duplicateNum = players.find(p => p.number === numVal);
      if (duplicateNum) {
        Toast.error(`Nomor punggung ${numVal} sudah digunakan oleh ${duplicateNum.name} (TM-05)!`);
        return;
      }

      await PlayerService.addPlayer({
        teamId,
        teamName: team.name,
        number: numVal,
        name: nameVal,
        position: posVal
      });

      modal.close();
      Toast.success(`Pemain ${nameVal} (#${numVal}) berhasil didaftarkan!`);
      openRosterModal(teamId);
    });

    // Delete Player
    document.querySelectorAll('.btn-delete-player').forEach(b => {
      b.addEventListener('click', async (e) => {
        const pId = e.currentTarget.getAttribute('data-player-id');
        await PlayerService.deletePlayer(pId);
        modal.close();
        Toast.info('Pemain dihapus dari skuad.');
        openRosterModal(teamId);
      });
    });

    // Save Official (TM-03)
    document.getElementById('btn-save-new-official')?.addEventListener('click', async () => {
      const nameVal = document.getElementById('new-official-name')?.value.trim();
      const roleVal = document.getElementById('new-official-role')?.value;

      if (!nameVal) {
        Toast.error('Nama official wajib diisi!');
        return;
      }

      await OfficialService.addOfficial({
        teamId,
        teamName: team.name,
        name: nameVal,
        role: roleVal
      });

      modal.close();
      Toast.success(`Official ${nameVal} (${roleVal}) berhasil ditambahkan!`);
      openRosterModal(teamId);
    });

    // Delete Official
    document.querySelectorAll('.btn-delete-official').forEach(b => {
      b.addEventListener('click', async (e) => {
        const oId = e.currentTarget.getAttribute('data-official-id');
        await OfficialService.deleteOfficial(oId);
        modal.close();
        Toast.info('Official dihapus.');
        openRosterModal(teamId);
      });
    });

    // Batch CSV Import (TM-06)
    document.getElementById('btn-import-csv')?.addEventListener('click', async () => {
      const rawText = document.getElementById('input-csv-players')?.value.trim();
      if (!rawText) {
        Toast.error('Data CSV belum diisi!');
        return;
      }

      const remainingSlots = Math.max(0, 25 - players.length);
      if (remainingSlots <= 0) {
        Toast.error(`Gagal import: Kuota 25 pemain untuk ${team.name} sudah penuh! Hapus sebagian pemain terlebih dahulu.`);
        return;
      }

      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      const candidates = [];
      const existingNumbers = new Set(players.map(p => p.number));
      const seenInCsv = new Set();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const num = parseInt(parts[0], 10);
          const name = parts[1];
          const pos = parts[2] || 'Pemain';

          if (!num || isNaN(num) || !name) continue;

          if (existingNumbers.has(num)) {
            Toast.error(`Baris ${i + 1}: Nomor punggung #${num} sudah terdaftar pada skuad tim ini!`);
            return;
          }
          if (seenInCsv.has(num)) {
            Toast.error(`Baris ${i + 1}: Terdapat nomor punggung ganda #${num} di dalam data CSV!`);
            return;
          }
          seenInCsv.add(num);
          candidates.push({ number: num, name, position: pos });
        }
      }

      if (candidates.length === 0) {
        Toast.error('Format CSV tidak valid. Gunakan format per baris: Nomor,Nama,Posisi');
        return;
      }

      if (candidates.length > remainingSlots) {
        Toast.error(`Gagal import: Anda mencoba mengimpor ${candidates.length} pemain baru, melebihi sisa kuota yang tersedia (${remainingSlots} pemain lagi dari batas maksimal 25 pemain)!`);
        return;
      }

      for (const c of candidates) {
        await PlayerService.addPlayer({
          teamId,
          teamName: team.name,
          number: c.number,
          name: c.name,
          position: c.position
        });
      }

      await AuditLogService.logActivity(
        'Import Pemain CSV',
        `Berhasil import ${candidates.length} pemain untuk ${team.name} (Total: ${players.length + candidates.length}/25)`,
        'team',
        '👥'
      );

      modal.close();
      Toast.success(`Berhasil mengimpor ${candidates.length} pemain dari data CSV (TM-06)!`);
      openRosterModal(teamId);
    });
  }, 50);
}

