/**
 * Admin Draw & Seeding Page
 * PRD: §4.1 Pengundian Peserta (DR-01..08), §4.2 Fitur Seeded (SD-01..06), §9.1 Algoritma Pengundian
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { TeamService } from '../../services/TeamService.js';
import { TournamentService } from '../../services/TournamentService.js';
import { GroupService } from '../../services/GroupService.js';
import { saveDoc, getDocById } from '../../firebase/firestore.js';
import { executeGroupDraw } from '../../algorithms/draw.js';
import { DrawAnimationController } from '../../components/DrawAnimation.js';
import { createGroupDisplay } from '../../components/GroupDisplay.js';
import { Modal } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';
import { AuditLogService } from '../../services/AuditLogService.js';

let activeDrawResult = null;
let currentStepIndex = 0;
let animationController = null;
let isDrawLocked = false;

export async function AdminDrawPage() {
  const teams = await TeamService.getAll();
  const seededTeams = teams.filter(t => t.isSeeded);
  const nonSeededTeams = teams.filter(t => !t.isSeeded);

  // Check if draw has already been saved/locked in Firestore
  const savedState = await getDocById('drawHistory', 'latest_draw');
  if (savedState) {
    isDrawLocked = Boolean(savedState.isLocked);
    if (savedState.drawResult) {
      activeDrawResult = savedState.drawResult;
    }
  }

  const selectedGroupCount = activeDrawResult?.groupCount || 4;


  const content = `
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Pengundian Grup & Seeded</h1>
          ${isDrawLocked ? `
            <span class="badge badge-teal font-bold" id="badge-lock-status">🔒 RESMI TERKUNCI</span>
          ` : `
            <span class="badge badge-gold font-bold" id="badge-lock-status">🔓 MODE PENGUNDIAN AKTIF</span>
          `}
        </div>
        <p class="text-sm text-muted">Sistem pengundian transparan dengan proteksi tim unggulan (Seeded) dan animasi bola acak.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        ${isDrawLocked ? `
          <button type="button" id="btn-unlock-draw" class="btn btn-outline btn-sm text-danger">
            🔓 Buka Kunci Undian (Admin)
          </button>
        ` : `
          <button type="button" id="btn-quick-draw" class="btn btn-outline btn-sm">
            ⚡ Undi Cepat Sekaligus
          </button>
          <button type="button" id="btn-interactive-draw" class="btn btn-primary btn-sm">
            🎬 Mulai Undian Interaktif
          </button>
        `}
      </div>
    </div>

    <!-- Drawing Configuration Bar (PRD DR-02, SD-03) -->
    <div class="card mb-6" style="padding: 1.25rem;">
      <div class="grid grid-cols-1 sm-grid-cols-3 gap-4">
        
        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="draw-group-count">
            <span>Jumlah Grup (PRD DR-02)</span>
            <span class="badge badge-teal" id="badge-groups-summary">${selectedGroupCount} Grup</span>
          </label>
          <select id="draw-group-count" class="form-select" ${isDrawLocked ? 'disabled' : ''}>
            <option value="2" ${selectedGroupCount === 2 ? 'selected' : ''}>2 Grup (Grup A & B)</option>
            <option value="3" ${selectedGroupCount === 3 ? 'selected' : ''}>3 Grup (Grup A, B, C &bull; Skenario 3 Terbaik)</option>
            <option value="4" ${selectedGroupCount === 4 ? 'selected' : ''}>4 Grup (Grup A, B, C, D &bull; Rekomendasi 13 Tim)</option>
            <option value="5" ${selectedGroupCount === 5 ? 'selected' : ''}>5 Grup (Grup A, B, C, D, E)</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="draw-seeded-mode">
            <span>Alokasi Pot Seeded (SD-03, SD-04)</span>
          </label>
          <select id="draw-seeded-mode" class="form-select" ${isDrawLocked ? 'disabled' : ''}>
            <option value="ranked" selected>Sesuai Ranking PSSI (Seed 1 &rarr; A1, 2 &rarr; B1...)</option>
            <option value="random">Acak Slot Pot 1 Antar Grup</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label">Total Peserta & Status</label>
          <div style="font-size: 0.95rem; font-weight: 600; padding-top: 0.4rem;">
            <strong class="text-gold font-mono">${teams.length}</strong> Tim Terdaftar &bull; 
            <strong class="text-teal font-mono">${seededTeams.length}</strong> Unggulan
          </div>
        </div>

      </div>
    </div>

    <!-- Pots Overview Row -->
    <div class="grid grid-cols-1 md-grid-cols-2 gap-4 mb-6">
      
      <!-- Pot 1: Seeded Teams -->
      <div class="card" style="border-left: 4px solid var(--color-accent); padding: 1.15rem;">
        <div class="flex items-center justify-between mb-2">
          <h3 style="font-size: 1.05rem; margin: 0; color: var(--color-accent);">Pot 1: Tim Unggulan (Seeded)</h3>
          <span class="badge badge-gold">${seededTeams.length} Tim</span>
        </div>
        <p class="text-xs text-muted mb-3">Ditempatkan di Slot 1 masing-masing grup untuk menghindari bentrok di penyisihan.</p>
        <div class="flex items-center gap-2" style="flex-wrap: wrap;" id="pot-seeded-list">
          ${seededTeams.map(t => `
            <div class="badge badge-gold flex items-center gap-1" style="padding: 0.35rem 0.65rem;">
              <span>⭐</span>
              <strong>${t.name}</strong>
              <span class="font-mono text-xs">(Seed ${t.seedRank || 1})</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Pot 2: Non-Seeded Teams -->
      <div class="card" style="border-left: 4px solid var(--color-secondary); padding: 1.15rem;">
        <div class="flex items-center justify-between mb-2">
          <h3 style="font-size: 1.05rem; margin: 0; color: var(--color-secondary-light);">Pot 2: Tim Non-Unggulan</h3>
          <span class="badge badge-teal">${nonSeededTeams.length} Tim</span>
        </div>
        <p class="text-xs text-muted mb-3">Diundi secara acak mengisi slot sisa di seluruh grup (distribusi seimbang ±1 tim).</p>
        <div class="flex items-center gap-1" style="flex-wrap: wrap;" id="pot-non-seeded-list">
          ${nonSeededTeams.map(t => `
            <span class="badge badge-muted">${t.name}</span>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Interactive Animation Stage (Hidden when not drawing) -->
    <div id="draw-animation-container" class="mb-6" style="display: none;"></div>

    <!-- Controls during Step-by-Step Draw -->
    <div id="draw-step-controls" class="card mb-6" style="display: none; padding: 1rem; text-align: center; border-color: rgba(245, 166, 35, 0.4);">
      <div class="flex items-center justify-center gap-3">
        <button type="button" id="btn-draw-next-step" class="btn btn-primary btn-lg">
          ⚽ Putar Bola Undian Berikutnya &rarr;
        </button>
        <button type="button" id="btn-draw-all-remaining" class="btn btn-outline btn-lg">
          ⏩ Selesaikan Sisa Undian
        </button>
      </div>
    </div>

    <!-- Group Results Container -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 style="font-size: 1.35rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
          <span>📋</span>
          Hasil Penempatan Grup Babak Penyisihan
        </h2>
        
        <div class="flex items-center gap-2" id="draw-action-buttons-wrap">
          ${!isDrawLocked ? `
            <button type="button" id="btn-reshuffle" class="btn btn-outline btn-sm" style="display: ${activeDrawResult ? 'inline-flex' : 'none'};">
              🔄 Acak Ulang (DR-04)
            </button>
            <button type="button" id="btn-confirm-lock" class="btn btn-primary btn-sm" style="display: ${activeDrawResult ? 'inline-flex' : 'none'};">
              🔒 Konfirmasi & Kunci Hasil Undian (DR-05)
            </button>
          ` : ''}
        </div>
      </div>

      ${!isDrawLocked && activeDrawResult ? `
        <div class="card mb-4" id="banner-pending-lock" style="padding: 0.85rem 1.25rem; background: rgba(245, 166, 35, 0.12); border: 1px solid rgba(245, 166, 35, 0.4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.85rem; color: var(--color-accent); line-height: 1.45;">
            ⚠️ <strong>HASIL PENGUNDIAN BELUM DIKUNCI KE DATABASE!</strong><br />
            Penempatan grup di bawah ini masih berstatus simulasi/draf. Klik tombol <strong>Konfirmasi & Kunci Hasil Undian</strong> agar posisi grup ini sah dan tersimpan ke data tim, bagan gugur, dan jadwal turnamen.
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('btn-confirm-lock')?.click()">
            🔒 Kunci Hasil Sekarang
          </button>
        </div>
      ` : ''}

      <div id="groups-result-wrapper">
        ${createGroupDisplay(activeDrawResult ? activeDrawResult.groups : {}, isDrawLocked)}
      </div>
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/pengundian'),
    init: () => initDrawPageEvents(teams)
  };
}

/**
 * Initialize Drawing Page Interactive Events
 */
function initDrawPageEvents(allTeams) {
  const animContainer = document.getElementById('draw-animation-container');
  if (animContainer) {
    animationController = new DrawAnimationController(animContainer);
  }

  const groupCountSelect = document.getElementById('draw-group-count');
  const seededModeSelect = document.getElementById('draw-seeded-mode');
  const interactiveBtn = document.getElementById('btn-interactive-draw');
  const quickBtn = document.getElementById('btn-quick-draw');
  const reshuffleBtn = document.getElementById('btn-reshuffle');
  const confirmLockBtn = document.getElementById('btn-confirm-lock');
  const nextStepBtn = document.getElementById('btn-draw-next-step');
  const finishAllBtn = document.getElementById('btn-draw-all-remaining');
  const stepControls = document.getElementById('draw-step-controls');
  const unlockBtn = document.getElementById('btn-unlock-draw');

  if (groupCountSelect) {
    groupCountSelect.addEventListener('change', (e) => {
      const badge = document.getElementById('badge-groups-summary');
      if (badge) badge.textContent = `${e.target.value} Grup`;
    });
  }

  // Handle Unlock
  if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: 'Buka Kunci Hasil Pengundian?',
        content: '<p class="text-sm text-muted">Membuka kunci undian akan memungkinkan panitia untuk mengundi ulang grup.</p>',
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          { 
            text: 'Buka Kunci', 
            className: 'btn-danger', 
            action: 'unlock', 
            onClick: async (m) => {
              m.close();
              const existingResult = activeDrawResult || null;
              await saveDoc('drawHistory', 'latest_draw', { isLocked: false, drawResult: existingResult });
              isDrawLocked = false;
              Toast.info('Kunci undian dibuka.');
              setTimeout(() => window.location.reload(), 300);
            } 
          }
        ]
      });
      modal.render();
    });
  }

  // Quick Draw (Instant)
  if (quickBtn) {
    quickBtn.addEventListener('click', () => {
      const count = parseInt(groupCountSelect.value, 10);
      const mode = seededModeSelect.value;

      try {
        activeDrawResult = executeGroupDraw(allTeams, count, mode);
        updateGroupsDisplay(activeDrawResult.groups, false);
        
        if (reshuffleBtn) reshuffleBtn.style.display = 'inline-flex';
        if (confirmLockBtn) confirmLockBtn.style.display = 'inline-flex';
        if (animContainer) animContainer.style.display = 'none';
        if (stepControls) stepControls.style.display = 'none';

        Toast.success(`Pengundian instan selesai! 13 tim terdistribusi ke dalam ${count} grup.`);
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // Interactive Draw (Step-by-Step)
  if (interactiveBtn) {
    interactiveBtn.addEventListener('click', () => {
      const count = parseInt(groupCountSelect.value, 10);
      const mode = seededModeSelect.value;

      try {
        activeDrawResult = executeGroupDraw(allTeams, count, mode);
        currentStepIndex = 0;

        // Initialize empty groups for progressive reveal
        const emptyGroups = {};
        for (let i = 0; i < count; i++) {
          const letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i];
          emptyGroups[letter] = { letter, name: `Grup ${letter}`, teams: [] };
        }
        updateGroupsDisplay(emptyGroups, false);

        if (animContainer) {
          animContainer.style.display = 'block';
          animationController.renderStage('Klik tombol di bawah untuk memutar bola undian');
        }
        if (stepControls) stepControls.style.display = 'block';
        if (reshuffleBtn) reshuffleBtn.style.display = 'none';
        if (confirmLockBtn) confirmLockBtn.style.display = 'none';

        // Auto trigger first step
        triggerNextStep();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }

  // Next step click
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      triggerNextStep();
    });
  }

  // Finish all remaining steps
  if (finishAllBtn) {
    finishAllBtn.addEventListener('click', () => {
      if (!activeDrawResult) return;
      updateGroupsDisplay(activeDrawResult.groups, false);
      if (stepControls) stepControls.style.display = 'none';
      if (reshuffleBtn) reshuffleBtn.style.display = 'inline-flex';
      if (confirmLockBtn) confirmLockBtn.style.display = 'inline-flex';
      animationController.celebrateComplete();
      Toast.success('Seluruh slot grup telah berhasil diundi!');
    });
  }

  // Reshuffle
  if (reshuffleBtn) {
    reshuffleBtn.addEventListener('click', () => {
      const count = parseInt(groupCountSelect.value, 10);
      const mode = seededModeSelect.value;
      activeDrawResult = executeGroupDraw(allTeams, count, mode);
      updateGroupsDisplay(activeDrawResult.groups, false);
      Toast.info('Seluruh grup telah berhasil diacak ulang.');
    });
  }

  // Confirm & Lock Results (PRD DR-05)
  if (confirmLockBtn) {
    confirmLockBtn.addEventListener('click', () => {
      const modal = new Modal({
        title: '🔒 Konfirmasi & Kunci Hasil Undian Resmi (DR-05)',
        content: `
          <div style="font-size: 0.9rem; line-height: 1.6;">
            <p style="margin-bottom: 0.75rem;">
              Setelah hasil undian dikunci, susunan tim pada tiap grup akan <strong>resmi dan mengikat</strong> serta menjadi dasar pembuatan Jadwal Pertandingan.
            </p>
            <p class="text-xs text-muted mb-3">
              Ketik kata kunci <strong>KUNCI-UNDIAN</strong> untuk mengesahkan berita acara pengundian:
            </p>
            <input type="text" id="confirm-lock-input" class="form-input" placeholder="KUNCI-UNDIAN" autofocus />
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Mengesahkan & Kunci',
            className: 'btn-primary',
            action: 'confirm',
            onClick: async (m) => {
              const inputVal = document.getElementById('confirm-lock-input')?.value?.trim();
              if (inputVal === 'KUNCI-UNDIAN') {
                m.close();
                await finalizeDrawLock();
              } else {
                Toast.error('Kata kunci konfirmasi salah! Ketik: KUNCI-UNDIAN');
              }
            }
          }
        ]
      });
      modal.render();

      setTimeout(() => {
        const input = document.getElementById('confirm-lock-input');
        if (input) {
          input.focus();
          input.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (input.value.trim() === 'KUNCI-UNDIAN') {
                modal.close();
                await finalizeDrawLock();
              } else {
                Toast.error('Kata kunci konfirmasi salah! Ketik: KUNCI-UNDIAN');
              }
            }
          });
        }
      }, 50);
    });
  }

  async function triggerNextStep() {
    if (!activeDrawResult || currentStepIndex >= activeDrawResult.drawSequence.length) {
      if (stepControls) stepControls.style.display = 'none';
      if (reshuffleBtn) reshuffleBtn.style.display = 'inline-flex';
      if (confirmLockBtn) confirmLockBtn.style.display = 'inline-flex';
      animationController.celebrateComplete();
      return;
    }

    const step = activeDrawResult.drawSequence[currentStepIndex];
    nextStepBtn.disabled = true;

    await animationController.spinAndReveal(step);

    // Incrementally update group view
    currentStepIndex++;
    updateProgressiveGroups(activeDrawResult.drawSequence.slice(0, currentStepIndex));

    nextStepBtn.disabled = false;

    if (currentStepIndex >= activeDrawResult.drawSequence.length) {
      if (stepControls) stepControls.style.display = 'none';
      if (reshuffleBtn) reshuffleBtn.style.display = 'inline-flex';
      if (confirmLockBtn) confirmLockBtn.style.display = 'inline-flex';
      animationController.celebrateComplete();
    }
  }

  function updateProgressiveGroups(revealedSteps) {
    const count = parseInt(groupCountSelect.value, 10);
    const progressive = {};
    for (let i = 0; i < count; i++) {
      const letter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i];
      progressive[letter] = { letter, name: `Grup ${letter}`, teams: [] };
    }

    revealedSteps.forEach(step => {
      progressive[step.groupLetter].teams.push(step.team);
    });

    updateGroupsDisplay(progressive, false);
  }

  function updateGroupsDisplay(groups, locked) {
    const wrapper = document.getElementById('groups-result-wrapper');
    if (wrapper) {
      wrapper.innerHTML = createGroupDisplay(groups, locked);
    }
  }

  async function finalizeDrawLock() {
    try {
      // 0. Clean up obsolete/orphaned groups from previous draws
      const existingGroups = await GroupService.getAll();
      for (const eg of existingGroups) {
        if (!activeDrawResult.groups[eg.letter || eg.id]) {
          await GroupService.deleteGroup(eg.id || eg.letter);
        }
      }

      // 1. Save all assigned groups to Firestore
      for (const letter in activeDrawResult.groups) {
        await GroupService.saveGroup(letter, activeDrawResult.groups[letter]);
      }

      // 2. Update each team with their assigned groupId and slot
      for (const letter in activeDrawResult.groups) {
        for (const team of activeDrawResult.groups[letter].teams) {
          await TeamService.update(team.id, {
            groupId: letter,
            groupSlot: team.groupSlot
          });
        }
      }

      // 3. Save draw history log (DR-07)
      await saveDoc('drawHistory', 'latest_draw', {
        isLocked: true,
        drawResult: activeDrawResult,
        lockedAt: new Date().toISOString()
      });

      // 4. Update tournament status to GROUP_STAGE
      await TournamentService.updateInfo({
        status: 'GROUP_STAGE',
        drawCompletedAt: new Date().toISOString()
      });

      // 5. Audit Log (AD-08)
      await AuditLogService.logActivity(
        'Kunci Pengundian Grup',
        'Pengundian 4 grup (A, B, C, D) resmi disahkan & dikunci ke database',
        'draw',
        '🎲'
      );

      isDrawLocked = true;
      Toast.success('Berita Acara Pengundian resmi disahkan dan dikunci ke database!');
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      Toast.error('Gagal mengunci hasil undian: ' + err.message);
    }
  }
}
