export class User {
  /**
   * Cria um novo usuário
   * @param {Object} data - Dados vindos da API ou do frontend
   * @param {boolean} data.authenticated - Se está autenticado
   * @param {number} data.remaining_time - Tempo restante de sessão (segundos)
   * @param {number} data.login_time - Timestamp do login
   */
  constructor(data = {}) {
    this.isAuthenticated = !!data.authenticated;
    this.remainingTime = Number.isFinite(data.remaining_time) ? data.remaining_time : 0;
    this.loginTime = data.login_time || null;
  }

  /**
   * Cria um usuário a partir da resposta da API de autenticação
   * @param {Object} data - Resposta da API
   * @returns {User}
   */
  static fromAuthResponse(data) {
    return new User({
      authenticated: data.authenticated,
      remaining_time: data.remaining_time,
      login_time: data.login_time
    });
  }

  /**
   * Cria um usuário convidado (não autenticado)
   * @returns {User}
   */
  static createGuest() {
    return new User({
      authenticated: false,
      remaining_time: 0,
      login_time: null
    });
  }

  /**
   * Verifica se a sessão do usuário é válida
   * @returns {boolean}
   */
  isSessionValid() {
    return this.isAuthenticated && this.remainingTime > 0;
  }

  /**
   * Retorna o tempo restante de sessão
   * @returns {number}
   */
  getRemainingTime() {
    return this.remainingTime;
  }

  /**
   * Serializa o usuário para JSON (para salvar no localStorage)
   * @returns {Object}
   */
  toJSON() {
    return {
      isAuthenticated: this.isAuthenticated,
      remainingTime: this.remainingTime,
      loginTime: this.loginTime
    };
  }
} 