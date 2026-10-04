/**
 * Breadcrumb Component
 */

export function createBreadcrumb(crumbs = []) {
  if (!crumbs || crumbs.length === 0) return '';

  return `
    <nav aria-label="Breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="#/">Beranda</a>
        </li>
        ${crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return `
            <li class="breadcrumb-separator">/</li>
            <li class="breadcrumb-item ${isLast ? 'active' : ''}">
              ${isLast || !crumb.href ? `<span>${crumb.label}</span>` : `<a href="${crumb.href}">${crumb.label}</a>`}
            </li>
          `;
        }).join('')}
      </ol>
    </nav>
  `;
}
