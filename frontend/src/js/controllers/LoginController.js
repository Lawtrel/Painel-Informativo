import { AuthService } from '../services/AuthService.js';

class LoginController {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.errorMsg = this.form.querySelector('#errorMsg');
    this.errorMsgText = this.errorMsg.querySelector('span');
    this.passwordInput = this.form.querySelector('#password');
    this.usernameInput = this.form.querySelector('#username');
    this.togglePassword = this.form.querySelector('#togglePassword');
    this.toggleIcon = this.togglePassword.querySelector('i');
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.init();
  }

  init() {
    // Esconder o spinner de loading apenas se o usuário não estiver autenticado
    const spinner = document.getElementById('login-spinner');
    if (spinner) {
      // Verificar se o usuário não está autenticado antes de esconder o spinner
      fetch('/api/check_auth.php', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
          // Só esconder o spinner se o usuário NÃO estiver autenticado
          // Se estiver autenticado, manter o spinner visível para o redirecionamento
          if (!data.authenticated) {
            spinner.style.display = 'none';
          }
          // Se estiver autenticado, o redirecionamento já foi iniciado pelo AuthService
        })
        .catch(() => {
          // Em caso de erro, esconder o spinner para não travar a interface
          spinner.style.display = 'none';
        });
    }
    
    this.togglePassword.addEventListener('click', this.handleTogglePassword.bind(this));
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleTogglePassword() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.toggleIcon.classList.toggle('fa-eye', !isPassword);
    this.toggleIcon.classList.toggle('fa-eye-slash', isPassword);
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setError('');
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.setError('Preencha todos os campos.');
      return;
    }

    this.setLoading(true);

    try {
      const result = await AuthService.login(username, password);
      if (result.success) {
        window.location.href = 'dashboard.html';
      } else {
        this.setError(result.message || 'Usuário ou senha incorretos.');
      }
    } catch (err) {
      this.setError('Erro ao tentar fazer login.');
    } finally {
      this.setLoading(false);
    }
  }

  setError(message) {
    this.errorMsgText.textContent = message;
    this.errorMsg.style.display = message ? 'flex' : 'none';
  }

  setLoading(isLoading) {
    this.submitBtn.disabled = isLoading;
    if (isLoading) {
      this.originalBtnText = this.submitBtn.innerHTML;
      this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    } else if (this.originalBtnText) {
      this.submitBtn.innerHTML = this.originalBtnText;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginController()); 