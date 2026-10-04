/**
 * Hash-based SPA Router
 * Supports dynamic params like #/tim/:id
 */

import { checkAdminRouteGuard } from './authGuard.js';

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = '';
    this.currentParams = {};
    this.appContainer = document.getElementById('app');
    
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('load', () => this.handleRouting());
  }

  addRoute(path, viewHandler) {
    this.routes[path] = viewHandler;
  }

  matchRoute(hash) {
    const cleanHash = hash.replace(/^#/, '') || '/';
    
    // Exact match
    if (this.routes[cleanHash]) {
      return { handler: this.routes[cleanHash], params: {} };
    }

    // Parametric match (e.g. /tim/:id)
    for (const routePath in this.routes) {
      if (routePath.includes(':')) {
        const routeSegments = routePath.split('/').filter(Boolean);
        const hashSegments = cleanHash.split('/').filter(Boolean);

        if (routeSegments.length === hashSegments.length) {
          const params = {};
          let match = true;

          for (let i = 0; i < routeSegments.length; i++) {
            if (routeSegments[i].startsWith(':')) {
              const paramName = routeSegments[i].slice(1);
              params[paramName] = decodeURIComponent(hashSegments[i]);
            } else if (routeSegments[i] !== hashSegments[i]) {
              match = false;
              break;
            }
          }

          if (match) {
            return { handler: this.routes[routePath], params };
          }
        }
      }
    }

    // Not found
    return null;
  }

  async handleRouting() {
    const hash = window.location.hash || '#/';
    this.currentRoute = hash;

    // Check Auth Guard for Admin routes
    const guard = checkAdminRouteGuard(hash);
    if (!guard.allowed && guard.redirect) {
      window.location.hash = guard.redirect;
      return;
    }

    const matched = this.matchRoute(hash);

    if (matched && matched.handler) {
      this.currentParams = matched.params;
      try {
        const content = await matched.handler(matched.params);
        if (typeof content === 'object' && content !== null && content.html) {
          this.appContainer.innerHTML = content.html;
          if (typeof content.init === 'function') {
            content.init();
          }
        } else if (typeof content === 'string') {
          this.appContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          this.appContainer.innerHTML = '';
          this.appContainer.appendChild(content);
        }

        // Scroll to top on navigation
        window.scrollTo(0, 0);

        // Dispatch route change event
        window.dispatchEvent(new CustomEvent('routeChanged', {
          detail: { route: hash, params: matched.params }
        }));
      } catch (err) {
        console.error('Routing render error:', err);
        this.render404(`Terjadi kesalahan saat memuat halaman: ${err.message}`);
      }
    } else {
      this.render404('Halaman yang Anda tuju tidak ditemukan.');
    }
  }

  render404(msg) {
    this.appContainer.innerHTML = `
      <div style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
        <div style="font-size: 5rem; font-family: var(--font-heading); font-weight: 900; color: var(--color-accent); line-height: 1;">404</div>
        <h2 style="margin: 1rem 0 0.5rem 0;">Halaman Tidak Ditemukan</h2>
        <p style="max-width: 420px; margin-bottom: 1.5rem;">${msg}</p>
        <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
      </div>
    `;
  }

  navigate(hash) {
    window.location.hash = hash;
  }
}
