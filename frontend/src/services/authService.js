import { User } from '../model/userModel.js';

class AuthService {
  constructor() {
    this.baseURL = '/Painel-Informativo/api';
  }

  async login(username, password) {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${this.baseURL}/handle_login.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = User.fromAuthResponse(data);
        return { success: true, user, message: data.message };
      } else {
        return { 
          success: false, 
          user: User.createGuest(), 
          message: data.message || 'Usuário ou senha incorretos' 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        user: User.createGuest(), 
        message: 'Erro ao conectar com o servidor' 
      };
    }
  }

  async checkAuth() {
    try {
      const response = await fetch(`${this.baseURL}/check_auth.php`);
      const data = await response.json();
      
      if (response.ok && data.authenticated) {
        const user = User.fromAuthResponse(data);
        return { success: true, user, message: null };
      } else if (data.expired) {
        return { 
          success: false, 
          user: User.createGuest(), 
          message: 'Sessão expirada',
          expired: true 
        };
      } else {
        return { 
          success: false, 
          user: User.createGuest(), 
          message: 'Não autenticado' 
        };
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return { 
        success: false, 
        user: User.createGuest(), 
        message: 'Erro ao verificar autenticação' 
      };
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/logout.php`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, message: 'Erro ao fazer logout' };
    }
  }
}

export const authService = new AuthService(); 