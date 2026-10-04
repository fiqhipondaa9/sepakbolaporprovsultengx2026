/**
 * Audit Log Service
 * PRD: §4.8 AD-08 (Audit Log Aktivitas Panitia Pelaksana)
 * Records and retrieves all administrative activities performed in the application.
 */
import { getCollectionDocs, saveDoc } from '../firebase/firestore.js';

const COLLECTION = 'auditLogs';

// Initial seed activities if no logs exist yet
const INITIAL_LOGS = [
  {
    id: 'log-seed-1',
    action: 'Inisialisasi Sistem',
    details: 'Firebase & Firestore Unified Data Layer aktif dan tersambung',
    category: 'system',
    icon: '🔥',
    admin: 'Sistem Turnamen',
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'log-seed-2',
    action: 'Keamanan Rute Admin',
    details: 'Auth Guard dan Session Management aktif melindungi panel admin',
    category: 'auth',
    icon: '🔐',
    admin: 'Sistem Keamanan',
    timestamp: Date.now() - 1000 * 60 * 20
  },
  {
    id: 'log-seed-3',
    action: 'Registrasi Tim Peserta',
    details: 'Database 13 Tim Kabupaten/Kota Sulawesi Tengah siap diundi',
    category: 'team',
    icon: '👥',
    admin: 'Panitia PSSI Sulteng',
    timestamp: Date.now() - 1000 * 60 * 10
  }
];

export const AuditLogService = {
  /**
   * Record a new administrative activity
   * @param {string} action - Short title of action (e.g., 'Update Skor', 'Login Panitia')
   * @param {string} details - Detailed description
   * @param {string} category - Category ('auth' | 'draw' | 'schedule' | 'match' | 'team' | 'settings' | 'backup' | 'system')
   * @param {string} icon - Emoji representing action
   * @param {string} [adminName] - Optional admin displayName or email
   */
  async logActivity(action, details, category = 'system', icon = '📝', adminName = null) {
    try {
      let currentAdmin = adminName;
      if (!currentAdmin) {
        try {
          const session = localStorage.getItem('porprov_admin_session');
          if (session) {
            const parsed = JSON.parse(session);
            currentAdmin = parsed.displayName || parsed.email || 'Panitia';
          }
        } catch (_) {}
      }
      if (!currentAdmin) currentAdmin = 'Panitia Pelaksana';

      const entry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        action,
        details,
        category,
        icon,
        admin: currentAdmin,
        timestamp: Date.now()
      };

      await saveDoc(COLLECTION, entry.id, entry);
      return entry;
    } catch (err) {
      console.warn('Failed to record audit log:', err);
      return null;
    }
  },

  /**
   * Get recent administrative activities
   * @param {number} limit - Maximum number of logs to return (default 10)
   * @returns {Promise<Array>}
   */
  async getRecentActivities(limit = 10) {
    try {
      const rawLogs = await getCollectionDocs(COLLECTION);
      const validLogs = (rawLogs || []).filter(l => l && l.action);

      if (validLogs.length === 0) {
        // Seed initial activities
        for (const seed of INITIAL_LOGS) {
          await saveDoc(COLLECTION, seed.id, seed);
        }
        return INITIAL_LOGS.slice(0, limit);
      }

      // Sort descending by timestamp (newest first)
      const sorted = [...validLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return sorted.slice(0, limit);
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
      return INITIAL_LOGS.slice(0, limit);
    }
  },

  /**
   * Get all administrative activities without limit
   * @returns {Promise<Array>}
   */
  async getAllActivities() {
    try {
      const rawLogs = await getCollectionDocs(COLLECTION);
      const validLogs = (rawLogs || []).filter(l => l && l.action);

      if (validLogs.length === 0) {
        for (const seed of INITIAL_LOGS) {
          await saveDoc(COLLECTION, seed.id, seed);
        }
        return INITIAL_LOGS;
      }

      return [...validLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (err) {
      console.warn('Failed to fetch all audit logs:', err);
      return INITIAL_LOGS;
    }
  },

  /**
   * Format timestamp into friendly Indonesian relative time
   * @param {number} timestamp
   * @returns {string}
   */
  formatRelativeTime(timestamp) {
    if (!timestamp) return 'Baru saja';
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);

    if (diffSeconds < 45) return 'Baru saja';
    if (diffSeconds < 90) return '1 menit yang lalu';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    const d = new Date(timestamp);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm} WITA`;
  },

  /**
   * Format timestamp into full Indonesian date and time string
   * @param {number} timestamp
   * @returns {string}
   */
  formatFullDateTime(timestamp) {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${hh}:${mm}:${ss} WITA`;
  }
};
