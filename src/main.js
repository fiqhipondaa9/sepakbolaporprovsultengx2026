/**
 * Application Entry Point
 * PORPROV X Sulawesi Tengah 2026 - Cabang Sepak Bola
 */

// Import Core Stylesheets
import './css/index.css';
import './css/components.css';
import './css/layout.css';
import './css/utilities.css';

// Import Router
import { Router } from './utils/router.js';

// Import Public Pages
import { HomePage } from './pages/public/HomePage.js';
import { SchedulePage } from './pages/public/SchedulePage.js';
import { StandingsPage } from './pages/public/StandingsPage.js';
import { BracketPage } from './pages/public/BracketPage.js';
import { StatsPage } from './pages/public/StatsPage.js';
import { TeamsPage } from './pages/public/TeamsPage.js';
import { TeamDetailPage } from './pages/public/TeamDetailPage.js';

// Import Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage.js';
import { AdminDrawPage } from './pages/admin/AdminDrawPage.js';
import { AdminSchedulePage } from './pages/admin/AdminSchedulePage.js';
import { AdminResultsPage } from './pages/admin/AdminResultsPage.js';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.js';
import { AdminBackupPage } from './pages/admin/AdminBackupPage.js';
import { AdminBracketPage } from './pages/admin/AdminBracketPage.js';
import { AdminCardTrackingPage } from './pages/admin/AdminCardTrackingPage.js';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage.js';
import { GuidePage } from './pages/shared/GuidePage.js';

// Set default theme from localStorage (default: dark per PRD §6.3)
const savedTheme = localStorage.getItem('porprov_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Configure Routes Map (PRD §7.1 Sitemap)
const routes = {
  // Public Routes
  '/': HomePage,
  '/jadwal': SchedulePage,
  '/klasemen': StandingsPage,
  '/bracket': BracketPage,
  '/statistik': StatsPage,
  '/tim': TeamsPage,
  '/panduan': () => {
    window.location.hash = '#/admin/panduan';
  },

  // Admin Routes
  '/admin/login': AdminLoginPage,
  '/admin': AdminDashboardPage,
  '/admin/tim': AdminTeamsPage,
  '/admin/pengundian': AdminDrawPage,
  '/admin/jadwal': AdminSchedulePage,
  '/admin/hasil': AdminResultsPage,
  '/admin/bracket': AdminBracketPage,
  '/admin/kartu': AdminCardTrackingPage,
  '/admin/pengaturan': AdminSettingsPage,
  '/admin/export-import': AdminBackupPage,
  '/admin/audit-log': AdminAuditLogPage,
  '/admin/panduan': GuidePage,
};

// Initialize Router
const router = new Router(routes);

// Log startup
console.log('🚀 PORPROV X Sulteng 2026 Sepakbola App initialized successfully.');
