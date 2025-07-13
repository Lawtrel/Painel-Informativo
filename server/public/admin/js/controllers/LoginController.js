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
    this.showMessageFromURL();
  }

  init() {
    this.togglePassword.addEventListener('click', this.handleTogglePassword.bind(this));
    // Removido o event listener do submit para permitir envio tradicional
    // this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleTogglePassword() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.toggleIcon.classList.toggle('fa-eye', !isPassword);
    this.toggleIcon.classList.toggle('fa-eye-slash', isPassword);
  }

  // Removido o método handleSubmit pois não é mais necessário

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

  showMessageFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      this.setError('Usuário ou senha incorretos.');
    } else if (params.has('logout')) {
      this.setError('Logout realizado com sucesso.');
      this.errorMsg.classList.remove('error-msg');
      this.errorMsg.classList.add('success-msg');
    } else if (params.has('expired')) {
      this.setError('Sua sessão expirou. Faça login novamente.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginController()); 