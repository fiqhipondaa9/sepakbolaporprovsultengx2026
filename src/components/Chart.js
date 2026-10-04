/**
 * Lightweight Dependency-Free SVG Chart Component
 * PRD: §4.7 ST-05 Visualisasi Statistik menggunakan Chart/Grafik
 */

export function createBarChart(options = {}) {
  const {
    data = [], // [{ label: 'PLU', value: 8, color: '#3B82F6' }]
    title = 'Grafik Distribusi Gol Tim',
    height = 200
  } = options;

  if (data.length === 0) {
    return `<div class="text-xs text-muted text-center" style="padding: 2rem 0;">Belum ada data untuk grafik.</div>`;
  }

  const maxValue = Math.max(...data.map(d => d.value), 5);
  const chartHeight = height - 50;

  return `
    <div class="card mb-6" style="padding: 1.25rem;">
      <h3 style="font-size: 1.05rem; margin-bottom: 1.25rem; color: var(--color-accent); display: flex; align-items: center; gap: 0.5rem;">
        <span>📊</span> ${title}
      </h3>
      <div style="width: 100%; overflow-x: auto;">
        <div style="min-width: 480px; height: ${height}px; display: flex; align-items: flex-end; gap: 12px; padding-bottom: 30px; position: relative; border-bottom: 1px solid var(--border-subtle);">
          ${data.map(item => {
            const barH = (item.value / maxValue) * chartHeight;
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <span class="font-mono text-xs font-bold" style="color: ${item.color || 'var(--color-accent)'};">${item.value}</span>
                <div style="width: 100%; max-width: 32px; height: ${Math.max(barH, 4)}px; background: linear-gradient(180deg, ${item.color || '#3B82F6'} 0%, ${item.color || '#3B82F6'}55 100%); border-radius: 4px 4px 0 0; transition: height 0.5s ease;"></div>
                <span class="text-xs text-muted" style="margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40px;">${item.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function createDonutChart(options = {}) {
  const {
    data = [], // [{ label: 'Menang', value: 12, color: '#10B981' }, { label: 'Seri', value: 4, color: '#F59E0B' }]
    title = 'Hasil Pertandingan'
  } = options;

  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return '';

  let cumulativeAngle = 0;
  const size = 120;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return `
    <div class="card mb-6" style="padding: 1.25rem;">
      <h3 style="font-size: 1.05rem; margin-bottom: 1rem; color: var(--color-teal); display: flex; align-items: center; gap: 0.5rem;">
        <span>🎯</span> ${title}
      </h3>
      <div class="flex items-center justify-around" style="flex-wrap: wrap; gap: 1.5rem;">
        <svg width="${size}" height="${size}" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
          ${data.map(slice => {
            const strokeDasharray = `${(slice.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativeAngle * circumference;
            cumulativeAngle += slice.value / total;
            return `
              <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${slice.color}" stroke-width="12" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"></circle>
            `;
          }).join('')}
        </svg>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${data.map(item => `
            <div class="flex items-center gap-2" style="font-size: 0.85rem;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
              <span>${item.label}:</span>
              <strong class="font-mono">${item.value}</strong>
              <span class="text-xs text-muted">(${Math.round((item.value / total) * 100)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
