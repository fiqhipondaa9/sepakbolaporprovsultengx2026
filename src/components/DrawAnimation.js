/**
 * Lottery Ball Spinning & Reveal Animation Component
 * PRD: §4.1 DR-01 Animasi Pengundian
 */
import confetti from 'canvas-confetti';

export class DrawAnimationController {
  constructor(containerElement) {
    this.container = containerElement;
    this.isSpinning = false;
  }

  /**
   * Render the stage of the lottery ball
   */
  renderStage(statusText = 'Klik "Putar Bola Undian" untuk mengundi tim berikutnya') {
    this.container.innerHTML = `
      <div class="draw-stage-box" style="text-align: center; padding: 2rem 1.5rem; background: radial-gradient(circle at center, rgba(22, 38, 61, 0.9) 0%, rgba(10, 22, 40, 0.95) 100%); border: 1px solid rgba(245, 166, 35, 0.3); border-radius: var(--radius-xl); position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Glowing Ring Ambient -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(245, 166, 35, 0.15) 0%, transparent 70%); pointer-events: none;"></div>

        <!-- 3D Lottery Sphere Container -->
        <div id="lottery-ball-wrapper" style="position: relative; width: 140px; height: 140px; margin: 0 auto 1.5rem auto; display: flex; align-items: center; justify-content: center;">
          <div id="lottery-ball" class="lottery-ball-sphere" style="width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #FBBF24 0%, #F5A623 45%, #B45309 85%, #78350F 100%); box-shadow: inset -6px -6px 16px rgba(0,0,0,0.6), 0 10px 25px rgba(245, 166, 35, 0.4); display: flex; align-items: center; justify-content: center; position: relative; transition: all 0.5s ease; border: 2px solid rgba(255,255,255,0.4);">
            <div style="font-family: var(--font-heading); font-weight: 900; font-size: 1.5rem; color: #0A1628; text-shadow: 0 1px 2px rgba(255,255,255,0.4);" id="ball-center-text">
              ⚽
            </div>
          </div>
        </div>

        <!-- Step announcement banner -->
        <div id="draw-step-banner" style="min-height: 48px; margin-bottom: 1rem;">
          <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--text-main);" id="draw-announcement">
            ${statusText}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;" id="draw-sub-announcement">
            Transparan &bull; Akurat &bull; PSSI Sulawesi Tengah
          </div>
        </div>

        <!-- Reveal Result Box (Hidden by default) -->
        <div id="draw-revealed-card" style="display: none; padding: 1.25rem; background: rgba(10, 22, 40, 0.85); border: 2px solid var(--color-accent); border-radius: var(--radius-lg); max-width: 420px; margin: 0 auto; animation: popReveal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
        </div>

      </div>
    `;
  }

  /**
   * Trigger spin and reveal sequence
   */
  async spinAndReveal(drawStep) {
    const ball = document.getElementById('lottery-ball');
    const ballText = document.getElementById('ball-center-text');
    const announcement = document.getElementById('draw-announcement');
    const subAnnouncement = document.getElementById('draw-sub-announcement');
    const revealCard = document.getElementById('draw-revealed-card');

    if (!ball) return;

    this.isSpinning = true;
    revealCard.style.display = 'none';

    // 1. Spinning Animation
    ball.style.transform = 'rotate(720deg) scale(1.1)';
    ball.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
    announcement.innerHTML = `<span class="spinner" style="width: 18px; height: 18px; vertical-align: middle;"></span> Mengocok bola undian...`;
    subAnnouncement.textContent = `Menentukan slot untuk ${drawStep.team.name}...`;

    await new Promise(resolve => setTimeout(resolve, 1200));

    // 2. Open / Pop reveal
    ball.style.transform = 'rotate(0deg) scale(1)';
    ballText.textContent = drawStep.slotCode;
    announcement.innerHTML = `🎉 <span class="text-gradient-gold">${drawStep.team.name}</span>!`;
    subAnnouncement.textContent = `Ditempatkan pada ${drawStep.groupLetter} (${drawStep.slotCode})`;

    // 3. Show Card
    revealCard.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <div class="team-badge-circle" style="width: 48px; height: 48px; font-size: 1.1rem; border-color: ${drawStep.team.color}; background: ${drawStep.team.color}30;">
          ${drawStep.team.code}
        </div>
        <div style="flex: 1; text-align: left;">
          <h4 style="margin: 0; font-size: 1.15rem; color: var(--text-main);">${drawStep.team.name}</h4>
          <span class="text-xs text-muted">Masuk ke: <strong class="text-gold">Grup ${drawStep.groupLetter}</strong> (Slot ${drawStep.slotCode})</span>
        </div>
        <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.4rem; color: var(--color-accent); background: rgba(245,166,35,0.15); padding: 0.3rem 0.75rem; border-radius: var(--radius-md); border: 1px solid rgba(245,166,35,0.4);">
          ${drawStep.slotCode}
        </div>
      </div>
    `;
    revealCard.style.display = 'block';

    // 4. Confetti burst on key reveals
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F5A623', '#00BFA6', '#EF4444', '#FFFFFF']
      });
    } catch (e) {
      // Fallback silently if canvas not available
    }

    this.isSpinning = false;
  }

  /**
   * Trigger celebration finale when all groups are filled
   */
  celebrateComplete() {
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F5A623', '#00BFA6', '#3B82F6', '#22C55E']
      });
    } catch (e) {}

    const announcement = document.getElementById('draw-announcement');
    const subAnnouncement = document.getElementById('draw-sub-announcement');
    if (announcement) {
      announcement.innerHTML = `🏆 <span class="text-gradient-gold">PENGUNDIAN GRUP SELESAI LENGKAP!</span> 🏆`;
    }
    if (subAnnouncement) {
      subAnnouncement.textContent = `Seluruh slot grup telah terisi merata. Silakan periksa dan kunci hasil undian.`;
    }
  }
}
