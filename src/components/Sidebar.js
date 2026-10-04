/**
 * Admin Dashboard Sidebar Component
 * PRD: §7.1 Admin Sitemap & §7.2 Navigation
 */
import { getCurrentUser, logoutAdmin } from '../firebase/auth.js';
import { Toast } from './Toast.js';
import { Modal } from './Modal.js';

export function createAdminSidebar(currentRoute = '#/admin') {
  const user = getCurrentUser();

  const menuItems = [
    {
      heading: 'Utama',
      items: [
        {
          label: 'Dashboard Ringkasan',
          href: '#/admin',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
        }
      ]
    },
    {
      heading: 'Manajemen Turnamen',
      items: [
        {
          label: 'Tim & Pemain',
          href: '#/admin/tim',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
        },
        {
          label: 'Pengundian & Seeded',
          href: '#/admin/pengundian',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`
        },
        {
          label: 'Penyusunan Jadwal',
          href: '#/admin/jadwal',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
        },
        {
          label: 'Input Hasil & Kartu',
          href: '#/admin/hasil',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`
        },
        {
          label: 'Bagan Eliminasi',
          href: '#/admin/bracket',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`
        },
        {
          label: 'Akumulasi Kartu',
          href: '#/admin/kartu',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`
        }
      ]
    },
    {
      heading: 'Sistem & Konfigurasi',
      items: [
        {
          label: 'Pengaturan Turnamen',
          href: '#/admin/pengaturan',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`
        },
        {
          label: 'Export & Backup',
          href: '#/admin/export-import',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
        },
        {
          label: 'Audit Log Aktivitas',
          href: '#/admin/audit-log',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
        },
        {
          label: 'Panduan Penggunaan',
          href: '#/admin/panduan',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
        }
      ]
    }
  ];

  setTimeout(() => {
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        const modal = new Modal({
          title: 'Konfirmasi Keluar',
          content: '<p class="text-sm text-muted">Apakah Anda yakin ingin keluar dari sesi Panel Panitia?</p>',
          buttons: [
            { text: 'Batal', className: 'btn-outline', action: 'cancel', onClick: (m) => m.close() },
            {
              text: 'Keluar Sekarang',
              className: 'btn-danger',
              action: 'logout',
              onClick: async (m) => {
                m.close();
                await logoutAdmin();
                Toast.info('Anda telah keluar dari Panel Panitia.');
                window.location.hash = '#/';
              }
            }
          ]
        });
        modal.render();
      });
    }
  }, 0);

  return `
    <div class="admin-sidebar-overlay"></div>
    <aside class="admin-sidebar">
      <div>
        <div style="padding: 0.5rem 0.75rem 1.25rem 0.75rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 1rem;">
          <div style="font-family: var(--font-heading); font-weight: 800; font-size: 0.85rem; color: var(--color-accent); letter-spacing: 0.05em;">PANITIA PELAKSANA</div>
          <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">Cabor Sepakbola Sulteng</div>
          ${user ? `
            <div style="margin-top: 0.5rem; padding: 0.4rem 0.6rem; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-sm); font-size: 0.75rem;">
              <div style="font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.displayName || 'Operator'}</div>
              <div style="color: var(--text-dim); font-size: 0.7rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.email || ''}</div>
            </div>
          ` : ''}
        </div>

        ${menuItems.map(section => `
          <div class="sidebar-heading">${section.heading}</div>
          <ul class="sidebar-menu">
            ${section.items.map(item => {
              const isActive = (item.href === '#/admin' && currentRoute === '#/admin') || 
                               (item.href !== '#/admin' && currentRoute.startsWith(item.href));
              return `
                <li>
                  <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''}">
                    ${item.icon}
                    <span>${item.label}</span>
                  </a>
                </li>
              `;
            }).join('')}
          </ul>
        `).join('')}
      </div>

      <!-- Bottom Session Info & Logout -->
      <div style="padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 0.25rem;">
        <a href="#/" class="sidebar-link" style="color: var(--text-muted);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Ke Halaman Publik</span>
        </a>

        <button type="button" id="btn-admin-logout" class="sidebar-link" style="color: var(--color-danger); background: none; border: none; width: 100%; text-align: left; cursor: pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  `;
}
