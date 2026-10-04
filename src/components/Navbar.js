/**
 * Sticky Navbar Header Component
 */

export function createNavbar(currentRoute = '#/') {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  const navLinks = [
    { label: 'Beranda', href: '#/' },
    { label: 'Jadwal', href: '#/jadwal' },
    { label: 'Klasemen', href: '#/klasemen' },
    { label: 'Bagan Gugur', href: '#/bracket' },
    { label: 'Statistik', href: '#/statistik' },
    { label: 'Tim Peserta', href: '#/tim' },
  ];

  const isAdminRoute = currentRoute.startsWith('#/admin');

  return `
    <header class="navbar">
      <div class="navbar-container">
        <!-- Brand -->
        <a href="#/" class="navbar-brand">
          <div class="navbar-logo" style="background: #ffffff; padding: 2px; overflow: hidden; border: 1.5px solid rgba(245, 166, 35, 0.5); box-shadow: 0 2px 10px rgba(0,0,0,0.25);">
            <img src="/OKLOGOPORPROVX.png" alt="Logo PORPROV X Sulteng 2026" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
          </div>
          <div class="navbar-title-wrap">
            <span class="navbar-title">PORPROV SULTENG X 2026</span>
            <span class="navbar-subtitle">Sepak Bola</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav>
          <ul class="navbar-nav">
            ${navLinks.map(link => {
              const isActive = (link.href === '#/' && (currentRoute === '#/' || currentRoute === '' || currentRoute === '#')) || 
                               (link.href !== '#/' && currentRoute.startsWith(link.href));
              return `
                <li>
                  <a href="${link.href}" class="nav-link ${isActive ? 'active' : ''}">
                    ${link.label}
                  </a>
                </li>
              `;
            }).join('')}
          </ul>
        </nav>

        <!-- Navbar Actions: Theme Toggle & Admin Button -->
        <div class="navbar-actions">
          <!-- Theme Toggle -->
          <button type="button" id="theme-toggle-btn" class="btn-icon btn-ghost" title="Ganti Tema (Dark / Light)" aria-label="Toggle theme">
            ${isDark ? `
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gold">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ` : `
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            `}
          </button>

          <!-- Admin Portal Link -->
          ${isAdminRoute ? `
            <a href="#/" class="btn btn-outline btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              <span>Halaman Publik</span>
            </a>
          ` : `
            <a href="#/admin" class="btn btn-primary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Panel Panitia</span>
            </a>
          `}

          <!-- Mobile Sidebar Toggle (for Admin) -->
          ${isAdminRoute ? `
            <button type="button" id="sidebar-toggle-btn" class="btn-icon btn-ghost md-hidden" style="display: none;" title="Menu Admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
    </header>
  `;
}

export function initNavbarEvents() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('porprov_theme', next);
      // Re-render active view or trigger update
      const event = new CustomEvent('themeChanged', { detail: { theme: next } });
      window.dispatchEvent(event);
      window.location.reload(); // Quick refresh for crisp icon states
    });
  }

  const sidebarBtn = document.getElementById('sidebar-toggle-btn');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', () => {
      const sidebar = document.querySelector('.admin-sidebar');
      const overlay = document.querySelector('.admin-sidebar-overlay');
      if (sidebar) sidebar.classList.toggle('is-open');
      if (overlay) overlay.classList.toggle('is-open');
    });
  }
}
