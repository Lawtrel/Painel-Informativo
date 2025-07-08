import { SessionService } from '../services/SessionService.js';

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
      const loginSuccess = await SessionService.login(username, password);
      if (loginSuccess) {
        window.location.href = 'dashboard.html';
      }
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