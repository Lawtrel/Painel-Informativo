import { SessionService } from './SessionService.js';

export class AuthGuard {
  static async checkAuth() {
    try {
      const user = await SessionService.checkSession();
      if (!user) {
        window.location.href = 'login.html';
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      window.location.href = 'login.html';
      return false;
    }
  }

  static async requireAuth() {
    const isAuthenticated = await this.checkAuth();
    if (!isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }
    return true;
  }

  static redirectToLogin() {
    window.location.href = 'login.html';
  }
} 