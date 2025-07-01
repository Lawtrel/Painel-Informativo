import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export class PlaylistManager {
  constructor(uiManager, fileManager) {
    this.ui = uiManager;
    this.fileManager = fileManager;
    this.currentPlaylist = null;
  }

  /**
   * Inicializa o gerenciador de playlist
   */
  async init() {
    this.ui.showLoadingState();
    await this.fetchPlaylist();
    this.updatePlaylistPreview();
    this.ui.hideLoadingState();
  }

  /**
   * Busca playlist da API
   */
  async fetchPlaylist() {
    try {
      this.currentPlaylist = await Utils.fetchPlaylist();
      this.ui.displayStatus("Playlist carregada com sucesso!", "success");
    } catch (error) {
      this.currentPlaylist = { monitores: [] };
      this.ui.displayStatus(
        `${error.message}. Criando playlist vazia.`,
        "warning"
      );
    }
  }

  /**
   * Adiciona item à playlist
   */
  async addItemToPlaylist() {
    if (!this.fileManager.validateFormData()) {
      return;
    }

    try {
      this.ui.elements.addItemBtn.disabled = true;
      this.ui.elements.addItemBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      await Utils.simulateFileUpload();

      if (!this.currentPlaylist?.monitores) {
        this.currentPlaylist = {monitores: []};
      }

      const monitorId = parseInt(this.ui.elements.monitorTarget.value);
      let monitor = this.currentPlaylist.monitores.find(m => m.id_monitor === monitorId);

      if (!monitor) {
        monitor = {id_monitor: monitorId, itens: []};
        this.currentPlaylist.monitores.push(monitor);
      }

      const newItem = this.fileManager.buildItemFromForm();
      monitor.itens.push(newItem);
      this.currentPlaylist.ultima_atualizacao = new Date().toISOString();

      const monitorName = CONFIG.MONITOR_NAMES[monitorId] || `Monitor ${monitorId + 1}`;
      this.ui.displayStatus(`Conteúdo "${this.fileManager.selectedFile.name}" adicionado ao ${monitorName} com sucesso!`, "success");
      
      this.updatePlaylistPreview();
      this.fileManager.clearForm();
    } catch (error) {
      this.ui.displayStatus(`Erro ao adicionar conteúdo: ${error.message}`, "error");
    } finally {
      this.ui.elements.addItemBtn.disabled = false;
      this.ui.elements.addItemBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar ao Monitor';
    }
  }

  /**
   * Remove item da playlist
   */
  removeItem(monitorId, itemId) {
    const monitor = this.currentPlaylist.monitores.find(m => m.id_monitor === monitorId);
    if (monitor) {
      monitor.itens = monitor.itens.filter(item => item.id !== itemId);

      if (monitor.itens.length === 0) {
        this.currentPlaylist.monitores = this.currentPlaylist.monitores.filter(
          m => m.id_monitor !== monitorId
        );
      }

      this.updatePlaylistPreview();
      this.ui.displayStatus("Conteúdo removido com sucesso!", "success");
    }
  }

  /**
   * Salva playlist
   */
  async savePlaylist() {
    if (!this.currentPlaylist?.monitores?.length) {
      this.ui.displayStatus("Nenhum conteúdo para salvar. Adicione conteúdo primeiro.", "warning");
      return;
    }

    try {
      this.ui.elements.savePlaylistBtn.disabled = true;
      this.ui.elements.savePlaylistBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
      
      const result = await Utils.apiPost(CONFIG.API.ENDPOINTS.MANAGE_PLAYLIST, this.currentPlaylist);
      this.ui.displayStatus(result.message || "Alterações salvas com sucesso! Os monitores serão atualizados em breve.", "success");
    } catch (error) {
      this.ui.displayStatus(`Erro ao salvar: ${error.message}`, "error");
    } finally {
      this.ui.elements.savePlaylistBtn.disabled = false;
      this.ui.elements.savePlaylistBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
    }
  }

  /**
   * Ordena monitores por ID
   */
  sortMonitors() {
    if (this.currentPlaylist?.monitores) {
      this.currentPlaylist.monitores.sort((a, b) => a.id_monitor - b.id_monitor);
    }
  }

  /**
   * Atualiza preview da playlist
   */
  updatePlaylistPreview() {
    const monitors = this.currentPlaylist?.monitores || [];

    this.ui.elements.monitorsGrid.innerHTML = '';

    if (monitors.length === 0) {
      this.ui.elements.monitorsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tv"></i>
          <h3>Nenhum conteúdo adicionado</h3>
          <p>Use o formulário acima para começar a adicionar conteúdo aos monitores</p>
        </div>
      `;
      return;
    }

    this.sortMonitors();

    monitors.forEach(monitor => {
      const monitorCard = this.createMonitorCard(monitor);
      this.ui.elements.monitorsGrid.appendChild(monitorCard);
    });
  }

  /**
   * Calcula duração total do monitor
   */
  calculateMonitorDuration(monitor) {
    const totalSeconds = monitor.itens.reduce((sum, item) => sum + item.duracao_s, 0);
    return Math.round(totalSeconds / 60);
  }

  /**
   * Cria card de monitor
   */
  createMonitorCard(monitor) {
    const card = document.createElement('div');
    card.className = 'monitor-card';

    const monitorName = CONFIG.MONITOR_NAMES[monitor.id_monitor] || `Monitor ${monitor.id_monitor + 1}`;
    const itemsHtml = monitor.itens.map(item => this.createItemHtml(item, monitor.id_monitor)).join('');
    const totalDuration = this.calculateMonitorDuration(monitor);

    card.innerHTML = `
      <div class="monitor-header">
        <div class="monitor-info">
          <h3><i class="fas fa-desktop"></i> ${monitorName}</h3>
        </div>
        <div class="monitor-stats">
          <span class="item-count">${monitor.itens.length} ${monitor.itens.length === 1 ? 'conteúdo' : 'conteúdos'}</span>
          <span class="total-duration">${totalDuration} min</span>
        </div>
      </div>
      <div class="items-list">
        ${itemsHtml || '<div class="empty-monitor"><p>Nenhum conteúdo neste monitor</p></div>'}
      </div>
    `;

    return card;
  }

  /**
   * Cria HTML do item
   */
  createItemHtml(item, monitorId) {
    const previewHtml = `
      <div class="item-preview" onclick="window.playlistManager.previewItemFromMonitor('${item.arquivo}', '${item.tipo}', ${item.duracao_s})">
        ${item.tipo === 'video' ? `
          <video width="100%" style="max-height: 120px;" controls>
            <source src="../conteudo_simulado_ftp/${item.arquivo}" type="video/${item.arquivo.split('.').pop()}">
            Seu navegador não suporta o elemento de vídeo.
          </video>
        ` : `
          <img src="../conteudo_simulado_ftp/${item.arquivo}" 
               alt="${item.arquivo}"
               onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
               loading="lazy">
        `}
        <div class="preview-fallback" style="display:none;">
          <i class="fas fa-${item.tipo === 'video' ? 'video' : 'image'}"></i>
          <span>${item.arquivo}</span>
        </div>
        <div class="preview-overlay">
          <i class="fas fa-expand-alt"></i>
        </div>
      </div>`;

    return `
      <div class="playlist-item ${item.isNew ? 'new-item' : ''}">
        <div class="item-info">
          <div class="item-type-badge ${item.tipo}">
            <i class="fas fa-${item.tipo === 'video' ? 'video' : 'image'}"></i>
            ${item.tipo}
          </div>
          ${previewHtml}
          <div class="item-details">
            <div class="item-title">${item.arquivo}</div>
            <div class="item-duration">
              <i class="fas fa-clock"></i>
              ${item.duracao_s}s
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-danger btn-small" onclick="window.playlistManager.removeItem(${monitorId}, ${item.id})" title="Remover conteúdo">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }
} 