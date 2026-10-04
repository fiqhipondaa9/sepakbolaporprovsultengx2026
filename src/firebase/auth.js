/**
 * Firebase Authentication & Session Management
 * PRD: §4.8 AD-01
 */
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config.js';
import { AuditLogService } from '../services/AuditLogService.js';

const SESSION_KEY = 'porprov_admin_session';

// Default panitia credentials for demo/fallback
export const DEMO_ADMIN = {
  email: 'admin.sepakbola@porprovsulteng.id',
  password: 'porprov2026',
  displayName: 'Panitia Pelaksana Sepakbola Sulteng',
  role: 'admin'
};

/**
 * Log in admin
 */
export async function loginAdmin(email, password) {
  let user = null;
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'Panitia Sepakbola',
        loginTime: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Firebase Auth Login Error:', error);
      // If error is invalid credentials, check if it's the demo credentials
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        user = {
          uid: 'demo-admin-id',
          email: DEMO_ADMIN.email,
          displayName: DEMO_ADMIN.displayName,
          loginTime: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        throw error;
      }
    }
  } else {
    // Local / Demo mode login
    if (
      (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) ||
      (email.includes('@') && password.length >= 6)
    ) {
      user = {
        uid: 'admin-' + Date.now(),
        email: email,
        displayName: email === DEMO_ADMIN.email ? DEMO_ADMIN.displayName : 'Operator Panitia',
        loginTime: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      throw new Error('Email atau kata sandi tidak valid. Gunakan kredensial demo.');
    }
  }

  if (user) {
    AuditLogService.logActivity(
      'Login Panitia',
      `${user.displayName} berhasil masuk ke panel admin`,
      'auth',
      '🔐',
      user.displayName
    );
    return { success: true, user };
  }
}

/**
 * Log out admin
 */
export async function logoutAdmin() {
  let adminName = 'Panitia';
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      adminName = parsed.displayName || parsed.email || 'Panitia';
    }
  } catch (_) {}

  AuditLogService.logActivity(
    'Logout Panitia',
    `Sesi ${adminName} telah diakhiri`,
    'auth',
    '🚪',
    adminName
  );

  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
  }
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null } }));
}

/**
 * Get currently authenticated admin user
 */
export function getCurrentUser() {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || 'Panitia Sepakbola'
    };
  }

  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
  return null;
}

/**
 * Check if admin is currently authenticated
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Panitia Sepakbola'
        });
      } else {
        const local = getCurrentUser();
        callback(local);
      }
    });
  } else {
    // Custom event listener for local session
    const handler = (e) => callback(e.detail.user);
    window.addEventListener('authChanged', handler);
    callback(getCurrentUser());
    return () => window.removeEventListener('authChanged', handler);
  }
}
