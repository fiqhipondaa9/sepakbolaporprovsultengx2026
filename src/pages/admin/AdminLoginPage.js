/**
 * Admin Login Page
 * PRD: §4.8 AD-01 Firebase Authentication
 */
import { loginAdmin } from '../../firebase/auth.js';
import { Toast } from '../../components/Toast.js';

export function AdminLoginPage() {
  setTimeout(() => {
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('login-submit-btn');

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
        const pass = document.getElementById('admin-password').value;

        if (!email || !pass) {
          Toast.error('Email dan kata sandi wajib diisi!');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="spinner" style="width: 18px; height: 18px; border-width: 2px;"></span> Memverifikasi...`;
        }

        try {
          const res = await loginAdmin(email, pass);
          Toast.success(`Selamat datang, ${res.user.displayName || 'Panitia'}!`);
          setTimeout(() => {
            window.location.hash = '#/admin';
          }, 400);
        } catch (error) {
          console.error('Login error:', error);
          Toast.error(error.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Masuk ke Panel Admin`;
          }
        }
      });
    }
  }, 0);

  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; background: var(--bg-gradient);">
      <div class="card" style="max-width: 440px; width: 100%; padding: 2rem; border-color: rgba(245, 166, 35, 0.3); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 166, 35, 0.15);">
        
        <!-- Logo & Title -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 60px; height: 60px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--color-accent) 0%, #D97706 100%); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px var(--color-accent-glow); margin-bottom: 1rem; color: #0A1628;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Panel Panitia Pertandingan</h2>
          <p class="text-xs text-muted">PORPROV X Sulawesi Tengah 2026 &bull; Cabor Sepakbola</p>
          <span class="badge badge-teal mt-2">Firebase Authentication</span>
        </div>

        <!-- Login Form -->
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="admin-email">Email Panitia / Operator</label>
            <input type="email" id="admin-email" class="form-input" placeholder="contoh: panitia@porprovsulteng.id" required autofocus />
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label" for="admin-password">
              <span>Kata Sandi</span>
              <a href="javascript:void(0)" class="text-xs text-gold" onclick="alert('Hubungi Technical Delegate PSSI Sulteng untuk verifikasi kredensial panitia.')">Lupa sandi?</a>
            </label>
            <input type="password" id="admin-password" class="form-input" placeholder="••••••••••••" required />
          </div>

          <button type="submit" id="login-submit-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 1.25rem; padding: 0.85rem;">
            Masuk ke Panel Admin
          </button>
        </form>

        <div style="text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <a href="#/" class="text-xs text-muted" style="text-decoration: underline;">&larr; Kembali ke Portal Publik</a>
        </div>
      </div>
    </div>
  `;
}
