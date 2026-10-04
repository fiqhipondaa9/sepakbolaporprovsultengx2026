/**
 * Route Auth Guard
 * Protects admin routes from unauthenticated public access
 */
import { isAuthenticated } from '../firebase/auth.js';
import { Toast } from '../components/Toast.js';

export function checkAdminRouteGuard(routeHash) {
  const clean = routeHash.replace(/^#/, '');

  // If trying to access admin routes (other than login)
  if (clean.startsWith('/admin') && clean !== '/admin/login') {
    if (!isAuthenticated()) {
      Toast.warning('Akses ditolak: Silakan masuk dengan akun panitia terlebih dahulu.');
      return { allowed: false, redirect: '#/admin/login' };
    }
  }

  // If already logged in and visiting login page, redirect to dashboard
  if (clean === '/admin/login' && isAuthenticated()) {
    return { allowed: false, redirect: '#/admin' };
  }

  return { allowed: true };
}
