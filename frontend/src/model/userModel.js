export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.username = data.username || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.isAuthenticated = data.isAuthenticated || false;
    this.sessionExpiresAt = data.sessionExpiresAt || null;
    this.remainingTime = data.remainingTime || 0;
  }

  static fromAuthResponse(data) {
    return new User({
      id: data.user_id,
      username: data.username,
      name: data.name,
      email: data.email,
      role: data.role,
      isAuthenticated: data.authenticated,
      sessionExpiresAt: data.session_expires_at,
      remainingTime: data.remaining_time || 0
    });
  }

  static createGuest() {
    return new User({
      isAuthenticated: false
    });
  }

  isSessionValid() {
    if (!this.sessionExpiresAt && this.remainingTime <= 0) return false;
    if (this.sessionExpiresAt) {
      return new Date() < new Date(this.sessionExpiresAt);
    }
    return this.remainingTime > 0;
  }

  getRemainingTime() {
    if (this.remainingTime > 0) {
      return this.remainingTime;
    }
    
    if (!this.sessionExpiresAt) return 0;
    const now = new Date();
    const expires = new Date(this.sessionExpiresAt);
    return Math.max(0, Math.floor((expires - now) / 1000));
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      email: this.email,
      role: this.role,
      isAuthenticated: this.isAuthenticated,
      sessionExpiresAt: this.sessionExpiresAt,
      remainingTime: this.remainingTime
    };
  }
} 