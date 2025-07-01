import { UIManager } from './ui-manager.js';
import { FileManager } from './file-manager.js';
import { PlaylistManager } from './playlist-manager.js';
import { PreviewManager } from './preview-manager.js';
import { CONFIG } from './config.js';

/**
 * Classe principal que orquestra todos os módulos
 */
class DigitalPanelManager {
  constructor() {
    // Inicializa os gerenciadores
    this.ui = new UIManager();
    this.fileManager = new FileManager(this.ui);
    this.playlistManager = new PlaylistManager(this.ui, this.fileManager);
    this.previewManager = new PreviewManager(this.ui, this.fileManager);
    
    this.attachEventListeners();
    
    // Inicializa o sistema
    this.init();
  }

  /**
   * Anexa todos os event listeners
   */
  attachEventListeners() {
    const handlers = {
      handleFileSelect: (e) => this.fileManager.handleFileSelect(e),
      handleDragOver: (e) => this.fileManager.handleDragOver(e),
      handleDragLeave: (e) => this.fileManager.handleDragLeave(e),
      handleDrop: (e) => this.fileManager.handleDrop(e),
      removeSelectedFile: () => this.fileManager.removeSelectedFile(),
      
      addItemToPlaylist: () => this.playlistManager.addItemToPlaylist(),
      savePlaylist: () => this.playlistManager.savePlaylist(),
      
      previewContent: () => this.previewManager.previewContent(),
      
      resetForm: () => this.fileManager.resetForm(),
      updateFileAcceptance: () => this.ui.updateFileAcceptance(),
      validateDuration: (e) => this.validateDuration(e)
    };

    this.ui.attachEventListeners(handlers);
  }

  /**
   * Valida duração do conteúdo
   */
  validateDuration(event) {
    const value = parseInt(event.target.value);
    const min = CONFIG.DURACAO.MIN;
    const max = CONFIG.DURACAO.MAX;
    
    if (value < min) {
      event.target.value = min;
    } else if (value > max) {
      event.target.value = max;
    }
    
    event.target.classList.remove('invalid');
  }

  /**
   * Inicializa o sistema
   */
  async init() {
    await this.playlistManager.init();
  }


  removeItem(monitorId, itemId) {
    this.playlistManager.removeItem(monitorId, itemId);
  }

  previewItemFromMonitor(arquivo, tipo, duracao) {
    this.previewManager.previewItemFromMonitor(arquivo, tipo, duracao);
  }
}

// Inicializa quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.playlistManager = new DigitalPanelManager();
}); 