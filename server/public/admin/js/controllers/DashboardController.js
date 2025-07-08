import { SessionService } from '../services/SessionService.js';

class DashboardController {
  constructor() {
    this.timerEl = document.getElementById('session-timer');
    this.logoutBtn = document.getElementById('logout-btn');
    this.timeLeft = 0;
    this.timerInterval = null;
    this.init();
  }

  async init() {
    const user = await SessionService.checkSession();
    if (user && user.remainingTime) {
      this.timeLeft = user.remainingTime;
      this.startTimer();
    }
    this.logoutBtn.addEventListener('click', async () => {
      await SessionService.logout();
      window.location.href = 'login.html';
    });
  }

  startTimer() {
    this.updateTimerUI();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerUI();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.handleSessionExpire();
      }
    }, 1000);
  }

  updateTimerUI() {
    if (this.timerEl) {
      this.timerEl.textContent = this.formatTime(this.timeLeft);
      this.timerEl.classList.remove(
        'dashboard-header__timer--white',
        'dashboard-header__timer--yellow',
        'dashboard-header__timer--red'
      );
      if (!this.timeLeft || this.timeLeft <= 0 || this.timeLeft <= 300) {
        this.timerEl.classList.add('dashboard-header__timer--red');
      } else if (this.timeLeft <= 600) {
        this.timerEl.classList.add('dashboard-header__timer--yellow');
      } else {
        this.timerEl.classList.add('dashboard-header__timer--white');
      }
    }
  }

  formatTime(seconds) {
    if (!seconds || seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async handleSessionExpire() {
    await SessionService.logout();
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => new DashboardController());
