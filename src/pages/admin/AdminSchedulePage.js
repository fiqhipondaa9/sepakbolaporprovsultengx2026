/**
 * Admin Schedule Management Page
 * PRD: §4.4 Penyusunan Jadwal Secara Adil (JD-01..07, JD-20..27), §5.1 Venue Management (VN-01..03)
 */
import { wrapAdminLayout } from '../../utils/layoutHelper.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { VenueService } from '../../services/VenueService.js';
import { TournamentService } from '../../services/TournamentService.js';
import { GroupService } from '../../services/GroupService.js';
import { createMatchCard, initMatchCardDetails } from '../../components/MatchCard.js';
import { Modal } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';
import { exportElementToPrint } from '../../utils/exportImage.js';
import { AuditLogService } from '../../services/AuditLogService.js';

export async function AdminSchedulePage() {
  const [matches, venues, tourneyInfo, groupsList] = await Promise.all([
    ScheduleService.getAllMatches(),
    VenueService.getAll(),
    TournamentService.getInfo(),
    GroupService.getAll()
  ]);

  // Derive active parameters from saved config or existing matches
  let activeStartDate = tourneyInfo.scheduleConfig?.startDate || tourneyInfo.startDate || '2026-11-10';
  let activeSlots = tourneyInfo.scheduleConfig?.slotsPerDay || tourneyInfo.slotsPerDay || 2;
  let activeRestDays = tourneyInfo.scheduleConfig?.restDaysMin !== undefined ? tourneyInfo.scheduleConfig.restDaysMin : (tourneyInfo.restDaysMin !== undefined ? tourneyInfo.restDaysMin : 1);
  let activeKnockoutRest = tourneyInfo.scheduleConfig?.knockoutRestDays !== undefined ? tourneyInfo.scheduleConfig.knockoutRestDays : (tourneyInfo.knockoutRestDays !== undefined ? tourneyInfo.knockoutRestDays : 2);

  if (matches.length > 0) {
    if (matches[0].dateIso) {
      activeStartDate = matches[0].dateIso;
    }
    const firstDateMatches = matches.filter(m => (m.dateIso || m.date) === (matches[0].dateIso || matches[0].date));
    if (firstDateMatches.length > 0 && !tourneyInfo.scheduleConfig?.slotsPerDay) {
      activeSlots = firstDateMatches.length;
    }

    // 1. Detect actual minimum rest days between matches for any team
    if (tourneyInfo.scheduleConfig?.restDaysMin === undefined) {
      const teamMatchDates = {};
      matches.forEach(m => {
        const d = new Date(m.dateIso || m.date);
        if (m.homeTeam?.id) {
          if (!teamMatchDates[m.homeTeam.id]) teamMatchDates[m.homeTeam.id] = [];
          teamMatchDates[m.homeTeam.id].push(d);
        }
        if (m.awayTeam?.id) {
          if (!teamMatchDates[m.awayTeam.id]) teamMatchDates[m.awayTeam.id] = [];
          teamMatchDates[m.awayTeam.id].push(d);
        }
      });

      let detectedMinRest = null;
      Object.values(teamMatchDates).forEach(dates => {
        dates.sort((a, b) => a - b);
        for (let i = 0; i < dates.length - 1; i++) {
          const diffDays = Math.round((dates[i+1] - dates[i]) / (1000 * 60 * 60 * 24)) - 1;
          if (diffDays >= 0) {
            if (detectedMinRest === null || diffDays < detectedMinRest) {
              detectedMinRest = diffDays;
            }
          }
        }
      });

      if (detectedMinRest !== null) {
        activeRestDays = detectedMinRest;
      }
    }

    // 2. Detect actual knockout rest days if groupStageEndDate and finalDate exist
    if (tourneyInfo.scheduleConfig?.knockoutRestDays === undefined && tourneyInfo.finalDate && tourneyInfo.groupStageEndDate) {
      const gEnd = new Date(tourneyInfo.groupStageEndDate);
      const fDate = new Date(tourneyInfo.finalDate);
      const diffDays = Math.round((fDate - gEnd) / (1000 * 60 * 60 * 24));
      // In scheduler: finalDate = qfDate + 4 = groupStageEndDate + knockoutRestDays + 4
      const calculatedKoRest = diffDays - 4;
      if (calculatedKoRest >= 0 && calculatedKoRest <= 3) {
        activeKnockoutRest = calculatedKoRest;
      }
    }
  }

  const content = `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Penyusunan Jadwal</h1>
          <span class="badge ${matches.length > 0 ? 'badge-teal' : 'badge-gold'} font-bold">
            ${matches.length > 0 ? `${matches.length} Laga Terjadwal` : 'Belum Terjadwal'}
          </span>
        </div>
        <p class="text-sm text-muted">Sistem penyusunan jadwal otomatis (rest-days minimal 1 hari, slot waktu berimbang, deteksi anti-konflik venue).</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-print-schedule-admin" class="btn btn-outline btn-sm">
          🖨️ Cetak Jadwal (JD-07)
        </button>
        <button type="button" id="btn-manage-venues" class="btn btn-outline btn-sm">
          🏟️ Kelola Venue (VN-01)
        </button>
        <button type="button" id="btn-show-simulator" class="btn btn-outline btn-sm">
          📊 Simulasi Durasi Hari (JD-23)
        </button>
        <button type="button" id="btn-generate-schedule" class="btn btn-primary btn-sm">
          ⚡ Generate Jadwal Otomatis
        </button>
      </div>
    </div>

    <!-- Flexible Scheduling Parameters Form (PRD JD-20..27) -->
    <div class="card mb-6" style="padding: 1.25rem;">
      <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--color-accent); display: flex; align-items: center; gap: 0.5rem;">
        <span>⚙️</span>
        Parameter Penjadwalan Hari Fleksibel
      </h3>

      <div class="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-4 gap-3">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="cfg-start-date">Tanggal Mulai (JD-25)</label>
          <input type="date" id="cfg-start-date" class="form-input" value="${activeStartDate}" />
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="cfg-slots-per-day">Slot / Hari (JD-21)</label>
          <select id="cfg-slots-per-day" class="form-select">
            <option value="1" ${activeSlots === 1 ? 'selected' : ''}>1 Pertandingan / Hari</option>
            <option value="2" ${activeSlots === 2 ? 'selected' : ''}>2 Pertandingan / Hari</option>
            <option value="3" ${activeSlots === 3 ? 'selected' : ''}>3 Pertandingan / Hari</option>
            <option value="4" ${activeSlots === 4 ? 'selected' : ''}>4 Pertandingan / Hari</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="cfg-rest-days">Jeda Istirahat Tim (JD-03)</label>
          <select id="cfg-rest-days" class="form-select">
            <option value="0" ${activeRestDays === 0 ? 'selected' : ''}>Minimal 0 Hari</option>
            <option value="1" ${activeRestDays === 1 ? 'selected' : ''}>Minimal 1 Hari (Wajib PSSI)</option>
            <option value="2" ${activeRestDays === 2 ? 'selected' : ''}>Minimal 2 Hari</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" for="cfg-knockout-rest">Jeda ke 8 Besar (JD-24)</label>
          <select id="cfg-knockout-rest" class="form-select">
            <option value="0" ${activeKnockoutRest === 0 ? 'selected' : ''}>0 Hari Jeda</option>
            <option value="1" ${activeKnockoutRest === 1 ? 'selected' : ''}>1 Hari Jeda</option>
            <option value="2" ${activeKnockoutRest === 2 ? 'selected' : ''}>2 Hari Jeda (Ideal)</option>
            <option value="3" ${activeKnockoutRest === 3 ? 'selected' : ''}>3 Hari Jeda</option>
          </select>
        </div>
      </div>

      <!-- Live Duration Estimator Result (JD-23) -->
      <div id="duration-preview-banner" class="card mt-4" style="margin-bottom: 0; padding: 0.85rem 1.15rem; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.3);">
        <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.5rem; font-size: 0.85rem;">
          <div>
            <strong class="text-teal">Estimasi Jadwal:</strong> 
            Penyisihan: <span id="prev-group-dates">10 - 16 Nov 2026</span> &bull; 
            Perempat Final: <span id="prev-qf-date">18 Nov 2026</span> &bull; 
            Grand Final: <span id="prev-final-date">22 Nov 2026</span>
          </div>
          <span class="badge badge-teal" id="prev-total-days">Total: 13 Hari Turnamen</span>
        </div>
      </div>
    </div>

    <!-- Match Filters Bar -->
    <div class="flex items-center justify-between mb-4" style="flex-wrap: wrap; gap: 0.75rem;">
      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <select id="filter-schedule-group" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
          <option value="all">Semua Grup</option>
          <option value="A">Grup A</option>
          <option value="B">Grup B</option>
          <option value="C">Grup C</option>
          <option value="D">Grup D</option>
        </select>

        <select id="filter-schedule-venue" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
          <option value="all">Semua Stadion / Venue</option>
          ${venues.map(v => `<option value="${v.id}">${v.name}</option>`).join('')}
        </select>

        <select id="filter-schedule-status" class="form-select" style="width: auto; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
          <option value="all">Semua Status</option>
          <option value="SCHEDULED">Akan Datang</option>
          <option value="FINISHED">Selesai</option>
        </select>
      </div>

      <div style="font-size: 0.8rem; color: var(--text-dim);">
        Gunakan <strong>"Tukar Slot"</strong> atau <strong>"Edit Jadwal / Venue"</strong> untuk menyesuaikan tanggal, jam & stadion.
      </div>
    </div>

    <!-- Matches Listing Grid -->
    <div id="schedule-matches-container">
      ${matches.length === 0 ? `
        <div class="card text-center" style="padding: 3rem; color: var(--text-muted); border-style: dashed;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
          <h4 style="margin: 0; color: var(--text-main);">Belum Ada Jadwal Pertandingan</h4>
          <p class="text-xs" style="margin-top: 0.25rem;">Pastikan pengundian grup telah selesai, lalu klik tombol "Generate Jadwal Otomatis" di atas.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
          ${matches.map(m => {
            const isConflict = matches.some(other => 
              other.id !== m.id && 
              other.dateIso === m.dateIso && 
              other.time === m.time && 
              (other.venueId === m.venueId || other.groupId === m.groupId)
            );

            return `
              <div class="schedule-match-card-wrapper" data-group="${m.groupId}" data-status="${m.status}" data-venue="${m.venueId || ''}">
                ${isConflict ? `
                  <div style="margin-bottom: 0.35rem; padding: 0.35rem 0.65rem; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--color-danger); border-radius: var(--radius-sm); font-size: 0.72rem; color: #FCA5A5; display: flex; align-items: center; justify-content: space-between;">
                    <span>⚠️ <strong>BENTROK JADWAL/VENUE:</strong> Jam & stadion bersamaan dengan laga lain!</span>
                    <span class="badge badge-danger" style="font-size: 0.6rem;">Konflik</span>
                  </div>
                ` : ''}
                ${createMatchCard(m)}
                <div style="margin-top: -0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: flex-end; gap: 0.5rem; padding-right: 0.5rem;">
                  <button type="button" class="btn btn-ghost btn-sm text-teal btn-edit-match-slot" data-match-id="${m.id}" style="font-size: 0.75rem;">
                    ✏️ Edit Jadwal / Venue
                  </button>
                  <button type="button" class="btn btn-ghost btn-sm text-gold btn-swap-match" data-match-id="${m.id}" style="font-size: 0.75rem;">
                    🔄 Tukar Slot
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/jadwal'),
    init: () => initSchedulePageEvents(matches, venues, tourneyInfo, groupsList)
  };
}

function initSchedulePageEvents(matches, venues, tourneyInfo, groupsList) {
  const printAdminBtn = document.getElementById('btn-print-schedule-admin');
  const generateBtn = document.getElementById('btn-generate-schedule');
  const simulatorBtn = document.getElementById('btn-show-simulator');
  const manageVenuesBtn = document.getElementById('btn-manage-venues');
  const startDateInput = document.getElementById('cfg-start-date');
  const slotsSelect = document.getElementById('cfg-slots-per-day');
  const restDaysSelect = document.getElementById('cfg-rest-days');
  const knockoutRestSelect = document.getElementById('cfg-knockout-rest');

  if (printAdminBtn) {
    printAdminBtn.addEventListener('click', () => {
      exportElementToPrint('schedule-matches-container', 'JADWAL RESMI PERTANDINGAN SEPAK BOLA PORPROV SULTENG X 2026');
    });
  }

  // Initialize Match Card Detail Modal Click Handlers (PB-04)
  initMatchCardDetails(matches);

  // Group, Venue & Status Match Filters
  const filterGroup = document.getElementById('filter-schedule-group');
  const filterVenue = document.getElementById('filter-schedule-venue');
  const filterStatus = document.getElementById('filter-schedule-status');

  function applyScheduleFilters() {
    const gVal = filterGroup?.value || 'all';
    const vVal = filterVenue?.value || 'all';
    const sVal = filterStatus?.value || 'all';

    document.querySelectorAll('.schedule-match-card-wrapper').forEach(card => {
      const cardGroup = card.getAttribute('data-group');
      const cardVenue = card.getAttribute('data-venue');
      const cardStatus = card.getAttribute('data-status');

      const matchGroup = gVal === 'all' || cardGroup === gVal;
      const matchVenue = vVal === 'all' || cardVenue === vVal;
      const matchStatus = sVal === 'all' || cardStatus === sVal;

      if (matchGroup && matchVenue && matchStatus) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  [filterGroup, filterVenue, filterStatus].forEach(el => {
    if (el) el.addEventListener('change', applyScheduleFilters);
  });

  // Dynamic preview banner calculation (JD-23)
  function updateDurationBanner() {
    const startStr = startDateInput?.value || '2026-11-10';
    const slots = parseInt(slotsSelect?.value || '2', 10);
    const knockoutRest = parseInt(knockoutRestSelect?.value || '2', 10);

    const totalMatchesCount = matches.length > 0 ? matches.length : 18;
    const groupStageDays = Math.ceil(totalMatchesCount / slots);
    
    const startDate = new Date(startStr);
    const addDays = (d, n) => {
      const res = new Date(d);
      res.setDate(res.getDate() + n);
      return res;
    };
    const formatD = (d) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const groupEnd = addDays(startDate, groupStageDays - 1);
    const qfDate = addDays(groupEnd, knockoutRest + 1);
    const finalDate = addDays(qfDate, 4);
    const totalDays = Math.ceil((finalDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const prevGroup = document.getElementById('prev-group-dates');
    const prevQf = document.getElementById('prev-qf-date');
    const prevFinal = document.getElementById('prev-final-date');
    const prevTotal = document.getElementById('prev-total-days');

    if (prevGroup) prevGroup.textContent = `${startDate.getDate()} - ${formatD(groupEnd)}`;
    if (prevQf) prevQf.textContent = formatD(qfDate);
    if (prevFinal) prevFinal.textContent = formatD(finalDate);
    if (prevTotal) prevTotal.textContent = `Total: ${totalDays} Hari Turnamen`;
  }

  [startDateInput, slotsSelect, restDaysSelect, knockoutRestSelect].forEach(el => {
    if (el) el.addEventListener('change', updateDurationBanner);
  });
  updateDurationBanner();

  // Duration Simulator Modal (JD-23, §4.4)
  if (simulatorBtn) {
    simulatorBtn.addEventListener('click', () => {
      const startVal = startDateInput.value;
      const slotsVal = parseInt(slotsSelect.value, 10);
      const restVal = parseInt(knockoutRestSelect.value, 10);
      const totalMatchCount = matches.length > 0 ? matches.length : 18;
      const groupDays = Math.ceil(totalMatchCount / slotsVal);
      const totalDays = groupDays + restVal + 4;

      const modal = new Modal({
        title: '📊 Simulasi Durasi Hari Turnamen (JD-23)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.6;">
            <p class="text-muted mb-3">Estimasi durasi pelaksanaan turnamen sepak bola dari Babak Penyisihan hingga Grand Final:</p>
            
            <div class="card mb-3" style="padding: 1rem; background: rgba(255, 255, 255, 0.02);">
              <div class="flex items-center justify-between mb-2">
                <span>Total Pertandingan Penyisihan:</span>
                <strong class="font-mono text-gold">${totalMatchCount} Pertandingan</strong>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span>Alokasi Pertandingan / Hari:</span>
                <strong class="font-mono">${slotsVal} Match / Hari</strong>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span>Durasi Babak Penyisihan:</span>
                <strong class="font-mono text-teal">${groupDays} Hari</strong>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span>Hari Jeda Menuju 8 Besar:</span>
                <strong class="font-mono">${restVal} Hari Istirahat</strong>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span>Durasi Babak Eliminasi (8 Besar, SF, Final):</span>
                <strong class="font-mono">4 Hari</strong>
              </div>
              <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 0.75rem 0;" />
              <div class="flex items-center justify-between font-bold" style="font-size: 1rem;">
                <span class="text-teal">Total Estimasi Durasi:</span>
                <span class="badge badge-teal font-mono" style="font-size: 0.95rem;">${totalDays} Hari Kalender</span>
              </div>
            </div>

            <div class="text-xs text-muted">
              💡 <em>Keterangan: Jadwal bersifat dinamis dan dapat dihitung ulang kapan saja jika alokasi hari dari panitia PORPROV disesuaikan.</em>
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

  // Manage Venues Modal (VN-01, VN-02, VN-03)
  if (manageVenuesBtn) {
    manageVenuesBtn.addEventListener('click', () => {
      renderVenuesModal();
    });
  }

  function renderVenuesModal() {
    const modal = new Modal({
      title: '🏟️ Manajemen Venue & Stadion (VN-01..03)',
      content: `
        <div style="font-size: 0.85rem;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-muted">Daftar stadion terdaftar untuk PORPROV Sulteng:</span>
            <button type="button" id="btn-add-new-venue" class="btn btn-primary btn-sm">+ Tambah Stadion</button>
          </div>

          <div id="venues-list-container" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto;">
            ${venues.map(v => `
              <div class="card flex items-center justify-between" style="padding: 0.75rem 1rem; margin: 0; background: rgba(255, 255, 255, 0.03);">
                <div>
                  <strong>${v.name}</strong> ${v.isPrimary ? '<span class="badge badge-teal ml-1">Utama</span>' : ''}
                  <div class="text-xs text-muted">${v.city || 'Sulawesi Tengah'} &bull; Kapasitas: ${(v.capacity || 0).toLocaleString()} penonton</div>
                </div>
                ${!v.isPrimary ? `
                  <button type="button" class="btn btn-ghost btn-sm text-danger btn-delete-venue" data-venue-id="${v.id}">&times;</button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `,
      buttons: [
        { text: 'Tutup', className: 'btn-outline', action: 'close', onClick: (m) => m.close() }
      ]
    });
    modal.render();

    setTimeout(() => {
      // Add Venue prompt
      document.getElementById('btn-add-new-venue')?.addEventListener('click', () => {
        modal.close();
        const addModal = new Modal({
          title: 'Tambah Stadion Baru (VN-01)',
          content: `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label">Nama Stadion</label>
                <input type="text" id="new-venue-name" class="form-input" placeholder="contoh: Stadion Mini Kolonodale" required />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Kota / Kabupaten</label>
                  <input type="text" id="new-venue-city" class="form-input" placeholder="contoh: Morowali Utara" required />
                </div>
                <div class="form-group" style="margin: 0;">
                  <label class="form-label">Kapasitas Penonton</label>
                  <input type="number" id="new-venue-cap" class="form-input font-mono" placeholder="5000" />
                </div>
              </div>
            </div>
          `,
          buttons: [
            { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
            {
              text: 'Simpan Stadion',
              className: 'btn-primary',
              action: 'save',
              onClick: async (m) => {
                const name = document.getElementById('new-venue-name')?.value.trim();
                const city = document.getElementById('new-venue-city')?.value.trim();
                const capacity = parseInt(document.getElementById('new-venue-cap')?.value || '0', 10);
                if (!name) {
                  Toast.error('Nama stadion wajib diisi!');
                  return;
                }
                m.close();
                await VenueService.create({ name, city, capacity, isPrimary: false });
                await AuditLogService.logActivity(
                  'Tambah Venue Stadion',
                  `Stadion ${name} (${city}) berhasil didaftarkan`,
                  'schedule',
                  '🏟️'
                );
                Toast.success(`Stadion ${name} berhasil ditambahkan!`);
                setTimeout(() => window.location.reload(), 300);
              }
            }
          ]
        });
        addModal.render();
      });

      // Delete Venue
      document.querySelectorAll('.btn-delete-venue').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const vId = e.currentTarget.getAttribute('data-venue-id');
          modal.close();
          await VenueService.delete(vId);
          await AuditLogService.logActivity(
            'Hapus Venue Stadion',
            `Stadion ID ${vId} dihapus dari daftar venue`,
            'schedule',
            '🗑️'
          );
          Toast.info('Stadion dihapus.');
          setTimeout(() => window.location.reload(), 300);
        });
      });
    }, 50);
  }

  // Generate schedule button
  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      try {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px;"></span> Menyusun Jadwal...`;

        const res = await ScheduleService.generateSchedule({
          startDate: startDateInput.value,
          slotsPerDay: parseInt(slotsSelect.value, 10),
          restDaysMin: parseInt(restDaysSelect.value, 10),
          knockoutRestDays: parseInt(knockoutRestSelect.value, 10)
        });

        await AuditLogService.logActivity(
          'Generate Jadwal',
          `Menyusun otomatis ${res.totalMatches} jadwal pertandingan penyisihan grup`,
          'schedule',
          '📅'
        );

        Toast.success(`Berhasil membuat ${res.totalMatches} jadwal pertandingan babak penyisihan!`);
        setTimeout(() => window.location.reload(), 400);
      } catch (err) {
        Toast.error(err.message);
        generateBtn.disabled = false;
        generateBtn.innerHTML = `⚡ Generate Jadwal Otomatis`;
      }
    });
  }

  // Filter matches
  const groupFilter = document.getElementById('filter-schedule-group');
  const statusFilter = document.getElementById('filter-schedule-status');

  function applyFilters() {
    const selectedGroup = groupFilter?.value || 'all';
    const selectedStatus = statusFilter?.value || 'all';

    document.querySelectorAll('.schedule-match-card-wrapper').forEach(card => {
      const g = card.getAttribute('data-group');
      const s = card.getAttribute('data-status');

      const matchGroup = selectedGroup === 'all' || g === selectedGroup;
      const matchStatus = selectedStatus === 'all' || s === selectedStatus;

      card.style.display = (matchGroup && matchStatus) ? 'block' : 'none';
    });
  }

  if (groupFilter) groupFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);

  // Edit Single Match Slot & Venue (JD-04, JD-06, VN-03)
  document.querySelectorAll('.btn-edit-match-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matchId = e.currentTarget.getAttribute('data-match-id');
      const targetMatch = matches.find(m => m.id === matchId);
      if (!targetMatch) return;

      const modal = new Modal({
        title: 'Edit Jadwal & Venue Pertandingan (JD-04)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.5; display: flex; flex-direction: column; gap: 0.75rem;">
            <div class="card" style="padding: 0.75rem; background: rgba(255, 255, 255, 0.03);">
              <strong>${targetMatch.homeTeam.name} vs ${targetMatch.awayTeam.name}</strong>
              <div class="text-xs text-muted">[Grup ${targetMatch.groupId}] &bull; Ronde ${targetMatch.round || 1}</div>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label">Tanggal Pertandingan</label>
              <input type="date" id="edit-match-date" class="form-input" value="${targetMatch.dateIso || '2026-11-10'}" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="edit-match-time">Jam Kick-Off</label>
                <input type="text" id="edit-match-time" class="form-input" value="${targetMatch.time || '16:00 WITA'}" placeholder="contoh: 16:00 WITA" />
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label">Stadion / Venue</label>
                <select id="edit-match-venue" class="form-select">
                  ${venues.map(v => `
                    <option value="${v.id}" ${v.id === targetMatch.venueId ? 'selected' : ''}>${v.name}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div id="conflict-warning" style="display: none; padding: 0.5rem; background: rgba(239, 68, 68, 0.15); border: 1px solid var(--color-danger); border-radius: 4px; color: #FCA5A5; font-size: 0.75rem;">
              ⚠️ Peringatan Konflik: Venue atau Grup ini sudah memiliki jadwal pada waktu yang sama (JD-06).
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Simpan Perubahan',
            className: 'btn-primary',
            action: 'save',
            onClick: async (m) => {
              const newDateIso = document.getElementById('edit-match-date')?.value;
              let newTime = document.getElementById('edit-match-time')?.value.trim() || targetMatch.time || '15:30 WITA';
              if (newTime && !newTime.toUpperCase().includes('WITA') && /^\d{1,2}[:.]\d{2}$/.test(newTime)) {
                newTime = `${newTime} WITA`;
              }
              const newVenueId = document.getElementById('edit-match-venue')?.value;
              const chosenVenue = venues.find(v => v.id === newVenueId) || venues[0];

              // Check venue conflict (JD-06, VN-03)
              const conflict = matches.find(other => 
                other.id !== matchId && 
                other.dateIso === newDateIso && 
                other.time === newTime && 
                (other.venueId === newVenueId || other.groupId === targetMatch.groupId)
              );

              if (conflict) {
                const warn = document.getElementById('conflict-warning');
                if (warn) {
                  warn.style.display = 'block';
                  warn.innerHTML = `⚠️ Konflik Terdeteksi: Waktu bentrok dengan pertandingan <strong>${conflict.homeTeam.name} vs ${conflict.awayTeam.name}</strong> di venue/grup yang sama (JD-06).`;
                }
                return;
              }

              const d = new Date(newDateIso);
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const displayDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

              m.close();
              await ScheduleService.updateMatchSlot(matchId, {
                date: displayDate,
                dateIso: newDateIso,
                time: newTime,
                venueId: chosenVenue.id,
                venueName: chosenVenue.name,
                venueCity: chosenVenue.city
              });

              Toast.success('Jadwal pertandingan berhasil diperbarui!');
              setTimeout(() => window.location.reload(), 300);
            }
          }
        ]
      });
      modal.render();
    });
  });

  // Swap match slots (JD-05)
  document.querySelectorAll('.btn-swap-match').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matchId = e.currentTarget.getAttribute('data-match-id');
      const targetMatch = matches.find(m => m.id === matchId);
      if (!targetMatch) return;

      const otherMatches = matches.filter(m => m.id !== matchId);

      const modal = new Modal({
        title: 'Tukar Slot Waktu Pertandingan (JD-05)',
        content: `
          <div style="font-size: 0.85rem; line-height: 1.5;">
            <p class="mb-2">Pertandingan yang dipilih:</p>
            <div class="card mb-3" style="padding: 0.75rem; background: rgba(245, 166, 35, 0.1);">
              <strong>${targetMatch.homeTeam.name} vs ${targetMatch.awayTeam.name}</strong>
              <div class="text-xs text-muted">${targetMatch.date} &bull; ${targetMatch.time} &bull; ${targetMatch.venueName}</div>
            </div>

            <div class="form-group">
              <label class="form-label">Pilih Pertandingan Lawan untuk Ditukar Slotnya:</label>
              <select id="select-swap-target" class="form-select">
                ${otherMatches.map(m => `
                  <option value="${m.id}">[Grup ${m.groupId}] ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.date} - ${m.time})</option>
                `).join('')}
              </select>
            </div>
          </div>
        `,
        buttons: [
          { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
          {
            text: 'Tukar Slot Jadwal',
            className: 'btn-primary',
            action: 'swap',
            onClick: async (m) => {
              const targetId = document.getElementById('select-swap-target')?.value;
              if (targetId) {
                m.close();
                await ScheduleService.swapMatchSlots(matchId, targetId);
                Toast.success('Slot pertandingan berhasil ditukar!');
                setTimeout(() => window.location.reload(), 300);
              }
            }
          }
        ]
      });
      modal.render();
    });
  });
}
