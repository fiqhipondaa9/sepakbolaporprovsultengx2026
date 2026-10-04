/**
 * Layout Render Helper
 * Wraps page content with Navbar, BottomNav, Footer, or Admin Sidebar
 */
import { createNavbar, initNavbarEvents } from '../components/Navbar.js';
import { createBottomNav } from '../components/BottomNav.js';
import { createAdminSidebar } from '../components/Sidebar.js';

export function wrapPublicLayout(contentHtml, currentRoute = '#/') {
  setTimeout(() => {
    initNavbarEvents();
  }, 0);

  return `
    <div class="app-layout">
      ${createNavbar(currentRoute)}
      <main class="main-content">
        ${contentHtml}
      </main>
      <footer class="app-footer">
        <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
          <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1rem; color: var(--color-accent); letter-spacing: 0.05em;">
            PORPROV SULTENG X 2026 &bull; SEPAK BOLA
          </div>
          <p style="font-size: 0.8rem; margin: 0;">Sistem Informasi & Manajemen Pertandingan Resmi &bull; Panitia Pelaksana Cabor Sepakbola</p>
          <div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; line-height: 1.6;">
            <div>&copy; DISPORA Sulawesi Tengah. Hak Cipta Dilindungi.</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">Didukung oleh : KONI Sulawesi Tengah &amp; PSSI Sulawesi Tengah</div>
          </div>
        </div>
      </footer>
      ${createBottomNav(currentRoute)}
    </div>
  `;
}

export function wrapAdminLayout(contentHtml, currentRoute = '#/admin') {
  setTimeout(() => {
    initNavbarEvents();
  }, 0);

  return `
    <div class="app-layout">
      ${createNavbar(currentRoute)}
      <div class="admin-layout">
        ${createAdminSidebar(currentRoute)}
        <main class="admin-main">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}
