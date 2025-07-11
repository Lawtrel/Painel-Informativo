import { User } from '../models/User.js';

class AuthService {
  static init() {
    // Executar verificação imediata de auth para evitar flash
    this.immediateAuthCheck();
    
    // Recarregar a página se ela foi carregada do cache do navegador
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    });
  }

  // Verificação imediata de auth para evitar flash
  static async immediateAuthCheck() {
    try {
      const response = await fetch('/api/check_auth.php', { 
        credentials: 'include' 
      });
      const data = await response.json();
      
              if (data.authenticated) {
          // Se estiver na página de login e já autenticado, redirecionar imediatamente
          if (window.location.pathname.includes('login.html')) {
            // Esconder o conteúdo do login para evitar flash
            const loginContainer = document.getElementById('login-container');
            if (loginContainer) loginContainer.style.display = 'none';
            
            // Manter o spinner visível durante o redirecionamento
            window.location.replace('dashboard.html');
            return;
          }
          // Se estiver no index, redirecionar para dashboard
          else if (window.location.pathname.includes('index.html')) {
            window.location.replace('dashboard.html');
            return;
          }
          // Se estiver no dashboard, mostrar o conteúdo imediatamente
          else if (window.location.pathname.includes('dashboard.html')) {
            const dashboardContent = document.getElementById('dashboard-content');
            const spinner = document.getElementById('global-spinner');
            if (dashboardContent) dashboardContent.style.display = '';
            if (spinner) spinner.style.display = 'none';
          }
        } else {
        // Se não estiver autenticado e estiver no dashboard, redirecionar imediatamente
        if (window.location.pathname.includes('dashboard.html')) {
          window.location.replace('login.html');
          return;
        }
        // Se estiver na página de login sem autenticação, esconder o spinner
        else if (window.location.pathname.includes('login.html')) {
          const spinner = document.getElementById('login-spinner');
          if (spinner) spinner.style.display = 'none';
        }
      }
    } catch (error) {
      console.log('Erro na verificação imediata de auth:', error);
      // Em caso de erro, esconder o spinner apropriado
      if (window.location.pathname.includes('dashboard.html')) {
        const spinner = document.getElementById('global-spinner');
        if (spinner) spinner.style.display = 'none';
      } else if (window.location.pathname.includes('login.html')) {
        const spinner = document.getElementById('login-spinner');
        if (spinner) spinner.style.display = 'none';
      }
    }
  }

  static async checkAuthOnLoad() {
    try {
      const response = await fetch('/api/check_auth.php', { 
        credentials: 'include' 
      });
      const data = await response.json();
      
      if (data.authenticated) {
        // Se estiver na página de login e já autenticado, redirecionar para dashboard
        if (window.location.pathname.includes('login.html')) {
          window.location.replace('dashboard.html');
        }
        // Se estiver no index, redirecionar para dashboard
        else if (window.location.pathname.includes('index.html')) {
          window.location.replace('dashboard.html');
        }
        // Se estiver no dashboard, mostrar o conteúdo
        else if (window.location.pathname.includes('dashboard.html')) {
          const dashboardContent = document.getElementById('dashboard-content');
          const spinner = document.getElementById('global-spinner');
          if (dashboardContent) dashboardContent.style.display = '';
          if (spinner) spinner.style.display = 'none';
        }
      } else {
        // Se não estiver autenticado e estiver na página principal, redirecionar para login
        if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
          window.location.replace('login.html');
        }
        // Se estiver no dashboard sem autenticação, redirecionar para login
        else if (window.location.pathname.includes('dashboard.html')) {
          window.location.replace('login.html');
        }
        // Se estiver na página de login sem autenticação, esconder o spinner
        else if (window.location.pathname.includes('login.html')) {
          const spinner = document.getElementById('login-spinner');
          if (spinner) spinner.style.display = 'none';
        }
      }
    } catch (error) {
      console.log('Erro ao verificar autenticação, permanecendo na tela atual');
      // Em caso de erro, esconder o spinner apropriado
      if (window.location.pathname.includes('dashboard.html')) {
        const spinner = document.getElementById('global-spinner');
        if (spinner) spinner.style.display = 'none';
      } else if (window.location.pathname.includes('login.html')) {
        const spinner = document.getElementById('login-spinner');
        if (spinner) spinner.style.display = 'none';
      }
    }
  }

  static async checkAuth() {
    try {
      const response = await fetch('/api/check_auth.php', { 
        credentials: 'include' 
      });
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  static async login(username, password) {
    try {
      const response = await fetch('/api/handle_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });
      
      if (!response.ok) {
        return { success: false, message: 'Erro na requisição' };
      }
      
      const data = await response.json();
      if (data.success) {
        // Verificar autenticação após login bem-sucedido
        const authRes = await fetch('/api/check_auth.php', { credentials: 'include' });
        if (authRes.ok) {
          const authData = await authRes.json();
          const user = User.fromAuthResponse(authData);
          localStorage.setItem('user', JSON.stringify(user.toJSON()));
          return { success: true, user };
        }
      }
      return { success: false, message: data.message || 'Login falhou' };
    } catch (err) {
      console.error('Erro no login:', err);
      return { success: false, message: 'Erro ao tentar fazer login' };
    }
  }

  static async logout() {
    try {
      await fetch('/api/logout.php');
      localStorage.removeItem('user');
      return true;
    } catch (err) {
      console.error('Erro no logout:', err);
      localStorage.removeItem('user'); // Remove mesmo se der erro
      return false;
    }
  }

  static async checkSession() {
    try {
      const response = await fetch('/api/check_auth.php', { credentials: 'include' });
      
      if (!response.ok) {
        localStorage.removeItem('user');
        return null;
      }
      
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
      console.error('Erro ao verificar sessão:', err);
      localStorage.removeItem('user');
      return null;
    }
  }

  static async requireAuth() {
    const user = await this.checkSession();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  static redirectToLogin() {
    window.location.href = 'login.html';
  }
}

// Inicializar o serviço apenas uma vez
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
  });
} else {
  AuthService.init();
}

export { AuthService }; 