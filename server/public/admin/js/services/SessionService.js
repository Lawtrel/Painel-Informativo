import { User } from '../models/User.js';

export class SessionService {
  static async login(username, password) {
    try {
      const response = await fetch('/api/handle_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });
      const data = await response.json();
      if (data.success) {
        const authRes = await fetch('/api/check_auth.php', { credentials: 'include' });
        const authData = await authRes.json();
        const user = User.fromAuthResponse(authData);
        localStorage.setItem('user', JSON.stringify(user.toJSON()));
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  static async logout() {
    try {
      await fetch('/api/logout.php');
      localStorage.removeItem('user');
      return true;
    } catch (err) {
      return false;
    }
  }

  static async checkSession() {
    try {
      const response = await fetch('/api/check_auth.php', { credentials: 'include' });
      const data = await response.json();
      if (data.authenticated) {
        const user = User.fromAuthResponse(data);
        localStorage.setItem('user', JSON.stringify(user.toJSON()));
        return user;
      } else {
        localStorage.removeItem('user');
        return null;
      }
    } catch (err) {
      localStorage.removeItem('user');
      return null;
    }
  }
} 