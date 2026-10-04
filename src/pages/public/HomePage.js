/**
 * Public Home Page
 * PRD: §4.9 PB-01, §5.3 Notifikasi & Countdown (NT-03), §6.1, §6.4
 */
import { wrapPublicLayout } from '../../utils/layoutHelper.js';
import { ScheduleService } from '../../services/ScheduleService.js';
import { StandingsService } from '../../services/StandingsService.js';
import { TeamService } from '../../services/TeamService.js';
import { VenueService } from '../../services/VenueService.js';
import { TournamentService } from '../../services/TournamentService.js';
import { createMatchCard, initMatchCardDetails } from '../../components/MatchCard.js';
import { createStandingTable } from '../../components/StandingTable.js';

export async function HomePage() {
  const [allMatches, standings, teams, venues, tourneyInfo] = await Promise.all([
    ScheduleService.getAllMatches(),
    StandingsService.getLiveStandings(),
    TeamService.getAll(),
    VenueService.getAll(),
    TournamentService.getInfo()
  ]);

  // Calculate live tournament stats
  const totalGoals = allMatches.reduce((acc, m) => {
    const hs = m.homeTeam?.score || 0;
    const as = m.awayTeam?.score || 0;
    return acc + hs + as;
  }, 0);

  // Featured matches (Live matches first, then scheduled, then finished)
  const liveMatches = allMatches.filter(m => m.status === 'LIVE');
  const upcomingMatches = allMatches.filter(m => m.status === 'SCHEDULED').slice(0, 3);
  const finishedMatches = allMatches.filter(m => m.status === 'FINISHED').slice(-3);

  const featuredMatches = liveMatches.length > 0 
    ? liveMatches.concat(upcomingMatches).slice(0, 3)
    : upcomingMatches.length > 0 ? upcomingMatches : finishedMatches;

  const content = `
    <!-- Hero Section with Central Sulawesi Branding -->
    <section class="card mb-8" style="background: linear-gradient(135deg, rgba(16, 28, 48, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%), radial-gradient(circle at top right, rgba(245, 166, 35, 0.22) 0%, transparent 60%); border-color: rgba(245, 166, 35, 0.35); padding: clamp(1.5rem, 4vw, 3rem); position: relative; overflow: hidden;">
      <div style="position: absolute; right: -50px; top: -50px; width: 320px; height: 320px; background: radial-gradient(circle, rgba(0, 191, 166, 0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
      
      <div style="max-width: 820px; position: relative; z-index: 1;">
        <h1 class="hero-brand-heading" style="margin-bottom: 1.15rem; max-width: 800px;">
          <svg viewBox="0 0 1000 120" style="width: 100%; height: auto; display: block; overflow: visible;" aria-label="PEKAN OLAHRAGA PROVINSI SULAWESI TENGAH KE-X TAHUN 2026">
            <defs>
              <linearGradient id="heroGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#F5A623" />
                <stop offset="50%" stop-color="#FFD166" />
                <stop offset="100%" stop-color="#F5A623" />
              </linearGradient>
            </defs>
            <text x="0" y="42" font-family="'Montserrat', 'Outfit', sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" textLength="1000" lengthAdjust="spacing">PEKAN OLAHRAGA PROVINSI</text>
            <text x="0" y="105" font-family="'Outfit', sans-serif" font-weight="900" font-size="52" fill="url(#heroGoldGradient)" textLength="1000" lengthAdjust="spacing">SULAWESI TENGAH KE-X TAHUN 2026</text>
          </svg>
        </h1>
        <p style="font-size: clamp(0.95rem, 1.8vw, 1.2rem); color: var(--text-muted); margin-bottom: 1.75rem; line-height: 1.6;">
          Manajemen & Informasi Pertandingan Sepak Bola PORPROV Sulteng ke-X Tahun 2026.
        </p>

        <!-- Live Countdown Ticker (PRD §5.3 NT-03) -->
        <div class="card mb-6" style="padding: 0.85rem 1.25rem; background: rgba(0, 191, 166, 0.08); border-color: rgba(0, 191, 166, 0.35); max-width: 580px;">
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <div class="text-xs text-teal font-bold uppercase tracking-wider flex items-center gap-1" id="countdown-title">
                <span>⏱️</span> COUNTDOWN PERTANDINGAN
              </div>
              <div class="text-xs text-muted" id="countdown-label">Menuju Pembukaan / Laga Berikutnya</div>
            </div>
            <div class="flex items-center gap-2 font-mono" id="countdown-timer-box" style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent);">
              <span id="cd-days">--</span>d : 
              <span id="cd-hours">--</span>h : 
              <span id="cd-mins">--</span>m : 
              <span id="cd-secs">--</span>s
            </div>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="flex items-center gap-3" style="flex-wrap: wrap;">
          <a href="#/jadwal" class="btn btn-primary btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Jadwal Lengkap</span>
          </a>
          <a href="#/klasemen" class="btn btn-outline btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Klasemen Live</span>
          </a>
          <a href="#/bracket" class="btn btn-ghost btn-lg text-gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            <span>Bagan 8 Besar</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Key Metrics Cards -->
    <section class="grid grid-cols-2 md-grid-cols-4 gap-4 mb-8">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 166, 35, 0.15); color: var(--color-accent);">👥</div>
        <div>
          <div class="stat-value text-gold">${teams.length || 13}</div>
          <div class="stat-label">Kabupaten / Kota</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(0, 191, 166, 0.15); color: var(--color-teal);">⚽</div>
        <div>
          <div class="stat-value text-teal">${allMatches.length > 0 ? allMatches.length : 18}</div>
          <div class="stat-label">Total Pertandingan</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(34, 197, 94, 0.15); color: var(--color-success);">🎯</div>
        <div>
          <div class="stat-value text-success">${totalGoals}</div>
          <div class="stat-label">Gol Tercipta</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #3B82F6;">🏟️</div>
        <div>
          <div class="stat-value" style="color: #60A5FA;">${venues.length || 3}</div>
          <div class="stat-label">Stadion / Venue</div>
        </div>
      </div>
    </section>

    <!-- Highlights Section: Matches & Standings Grid -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 2rem;" class="mb-8">
      <!-- Pertandingan Terkini & Live -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 style="font-size: 1.35rem; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span style="color: var(--color-accent);">⚽</span>
            Sorotan Pertandingan Terkini
          </h2>
          <a href="#/jadwal" class="btn btn-ghost btn-sm text-gold">Semua Jadwal &rarr;</a>
        </div>

        ${featuredMatches.length === 0 ? `
          <div class="card text-center" style="padding: 2.5rem; color: var(--text-muted); border-style: dashed;">
            <p style="margin: 0;">Belum ada jadwal pertandingan yang diterbitkan.</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md-grid-cols-3 gap-4">
            ${featuredMatches.map(m => createMatchCard(m)).join('')}
          </div>
        `}
      </div>

      <!-- Preview Klasemen Babak Penyisihan -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 style="font-size: 1.35rem; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span style="color: var(--color-secondary-light);">📊</span>
            Klasemen Sementara Babak Penyisihan
          </h2>
          <a href="#/klasemen" class="btn btn-ghost btn-sm text-teal">Tabel Lengkap &rarr;</a>
        </div>

        ${standings.length === 0 ? `
          <div class="card text-center" style="padding: 2.5rem; color: var(--text-muted); border-style: dashed;">
            <p style="margin: 0;">Klasemen akan tersedia setelah hasil pengundian dan pertandingan diinput.</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 gap-6">
            ${standings.slice(0, 2).map(group => createStandingTable(group)).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  return {
    html: wrapPublicLayout(content, '#/'),
    init: () => {
      // 1. Initialize match details modal clicks
      initMatchCardDetails(allMatches);

      // 2. Start Dynamic Countdown Timer (NT-03)
      startCountdownTimer(allMatches, tourneyInfo);
    }
  };
}

function startCountdownTimer(allMatches = [], tourneyInfo = {}) {
  const titleEl = document.getElementById('countdown-title');
  const labelEl = document.getElementById('countdown-label');
  const timerBox = document.getElementById('countdown-timer-box');
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!daysEl) return;

  function parseMatchTs(m) {
    const dStr = m.dateIso || m.date;
    if (!dStr) return null;
    const tStr = m.time ? (m.time.length === 5 ? m.time : m.time.padStart(5, '0')) : '08:00';
    const ts = new Date(`${dStr}T${tStr}:00+08:00`).getTime();
    return isNaN(ts) ? null : ts;
  }

  function update() {
    const currentDaysEl = document.getElementById('cd-days');
    if (!currentDaysEl) {
      clearInterval(timerInterval);
      return;
    }

    const now = Date.now();

    // 1. Check if any match is currently LIVE
    const liveMatches = (allMatches || []).filter(m => m.status === 'LIVE');
    if (liveMatches.length > 0) {
      const live = liveMatches[0];
      if (titleEl) {
        titleEl.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22C55E; margin-right:4px; animation:pulse 1.5s infinite;"></span> <span style="color:#22C55E;">LIVE PERTANDINGAN</span>`;
      }
      if (labelEl) {
        labelEl.innerHTML = `<strong style="color:var(--text-main);">${live.homeTeam?.name || 'Tim A'}</strong> vs <strong style="color:var(--text-main);">${live.awayTeam?.name || 'Tim B'}</strong> (${live.venue?.name || 'Stadion'})`;
      }
      if (timerBox) {
        timerBox.innerHTML = `<span class="badge" style="background:rgba(34,197,94,0.2); color:#22C55E; border:1px solid rgba(34,197,94,0.4); font-size:0.85rem; padding:0.25rem 0.65rem; letter-spacing:0.05em; font-weight:700;">SEDANG BERLANGSUNG</span>`;
      }
      return;
    }

    // 2. Check if all matches exist and are all FINISHED
    const isAllFinished = allMatches.length > 0 && allMatches.every(m => m.status === 'FINISHED');
    if (isAllFinished) {
      if (titleEl) titleEl.innerHTML = `🏆 TURNAMEN SELESAI`;
      if (labelEl) labelEl.textContent = 'Semua pertandingan PORPROV Sulteng X telah rampung.';
      if (timerBox) {
        timerBox.innerHTML = `<span class="badge badge-primary" style="font-size:0.85rem;">FINAL RAMPUNG</span>`;
      }
      return;
    }

    // 3. Find next upcoming SCHEDULED match
    const upcomingScheduled = (allMatches || [])
      .filter(m => m.status === 'SCHEDULED')
      .map(m => ({ match: m, ts: parseMatchTs(m) }))
      .filter(item => item.ts && item.ts > now)
      .sort((a, b) => a.ts - b.ts);

    let targetTs = null;
    let targetLabel = '';

    if (upcomingScheduled.length > 0) {
      const next = upcomingScheduled[0];
      targetTs = next.ts;
      const m = next.match;
      const hName = m.homeTeam?.name || 'TBA';
      const aName = m.awayTeam?.name || 'TBA';
      const timeStr = m.time ? `${m.time} WITA` : '';
      targetLabel = `Kick-Off Berikutnya: <strong>${hName} vs ${aName}</strong> (${timeStr})`;
    } else {
      // Fallback: Check if tournament start date is set
      const startStr = tourneyInfo?.startDate || '2026-12-01';
      targetTs = new Date(`${startStr}T15:30:00+08:00`).getTime();
      targetLabel = `Menuju Pembukaan Turnamen (${startStr})`;
    }

    if (!targetTs || isNaN(targetTs)) return;

    const distance = targetTs - now;

    if (distance <= 0) {
      if (labelEl) labelEl.textContent = 'Menunggu Kick-Off Pertandingan Dimulai...';
      currentDaysEl.textContent = '00';
      const currentHoursEl = document.getElementById('cd-hours');
      const currentMinsEl = document.getElementById('cd-mins');
      const currentSecsEl = document.getElementById('cd-secs');
      if (currentHoursEl) currentHoursEl.textContent = '00';
      if (currentMinsEl) currentMinsEl.textContent = '00';
      if (currentSecsEl) currentSecsEl.textContent = '00';
      return;
    }

    if (labelEl && targetLabel) {
      labelEl.innerHTML = targetLabel;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    const currentHoursEl = document.getElementById('cd-hours');
    const currentMinsEl = document.getElementById('cd-mins');
    const currentSecsEl = document.getElementById('cd-secs');

    currentDaysEl.textContent = String(days).padStart(2, '0');
    if (currentHoursEl) currentHoursEl.textContent = String(hours).padStart(2, '0');
    if (currentMinsEl) currentMinsEl.textContent = String(mins).padStart(2, '0');
    if (currentSecsEl) currentSecsEl.textContent = String(secs).padStart(2, '0');
  }

  update();
  const timerInterval = setInterval(update, 1000);
}
