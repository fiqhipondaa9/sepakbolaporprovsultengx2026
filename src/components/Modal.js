/**
 * Reusable Accessible Modal Component
 */

export class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.footerButtons = options.buttons || [];
    this.onClose = options.onClose || null;
    this.maxWidth = options.maxWidth || null;
    this.dialogClass = options.dialogClass || '';
    this.element = null;
  }

  render() {
    const root = document.getElementById('modal-root') || document.body;
    
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');

    const buttonHtml = this.footerButtons.map(btn => `
      <button type="button" class="btn ${btn.className || 'btn-outline'}" data-action="${btn.action}">
        ${btn.text}
      </button>
    `).join('');

    this.element.innerHTML = `
      <div class="modal-dialog ${this.dialogClass}" style="${this.maxWidth ? `max-width: ${this.maxWidth};` : ''}">
        <div class="modal-header">
          <h3 class="modal-title">${this.title}</h3>
          <button type="button" class="btn-icon btn-ghost modal-close-btn" aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          ${typeof this.content === 'string' ? this.content : ''}
        </div>
        ${this.footerButtons.length > 0 ? `<div class="modal-footer">${buttonHtml}</div>` : ''}
      </div>
    `;

    if (this.content instanceof HTMLElement) {
      this.element.querySelector('.modal-body').appendChild(this.content);
    }

    // Event listeners
    this.element.querySelector('.modal-close-btn').addEventListener('click', () => this.close());
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    this.element.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const btnDef = this.footerButtons.find(b => b.action === action);
        if (btnDef && btnDef.onClick) {
          btnDef.onClick(this);
        }
      });
    });

    root.appendChild(this.element);

    // Trigger animation
    requestAnimationFrame(() => {
      this.element.classList.add('is-open');
    });

    // Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  close() {
    if (!this.element) return;
    this.element.classList.remove('is-open');
    document.removeEventListener('keydown', this.escapeHandler);
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
      }
      if (this.onClose) this.onClose();
    }, 250);
  }
}
