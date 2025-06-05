class UploadManager {
  static CONFIG = {
    DURACAO: {
      MIN: 1,
      MAX: 3600,
      PADRAO: 10
    },
    STATUS_TIMEOUT: 5000
  };

  constructor() {
    this.currentPlaylist = null;
    this.initializeElements();
    this.attachEventListeners();
    this.init();
  }

  initializeElements() {
    this.elements = {
      itemTipo: document.getElementById("itemTipo"),
      itemArquivo: document.getElementById("itemArquivo"),
      itemDuracao: document.getElementById("itemDuracao"),
      monitorTarget: document.getElementById("monitorTarget"),
      fileInputGroup: document.getElementById("fileInputGroup"),

      // Buttons
      addItemBtn: document.getElementById("addItemBtn"),
      savePlaylistBtn: document.getElementById("savePlaylistBtn"),

      // Status
      statusMessage: document.getElementById("statusMessage"),

      // Preview elements
      monitorsGrid: document.getElementById("monitorsGrid"),
      totalItems: document.getElementById("totalItems"),
      totalMonitors: document.getElementById("totalMonitors"),
    };
  }

  attachEventListeners() {
    // Button click handlers
    this.elements.addItemBtn.addEventListener("click", () =>
        this.addItemToPlaylist()
    );
    this.elements.savePlaylistBtn.addEventListener("click", () =>
        this.savePlaylist()
    );

    // Input validation
    this.elements.itemDuracao.addEventListener("input", (e) =>
        this.validateDuration(e)
    );

    // Tipo de conteúdo change handler
    this.elements.itemTipo.addEventListener("change", () =>
        this.updatePlaceholder()
    );
  }

  updatePlaceholder() {
    const tipo = this.elements.itemTipo.value;
    const placeholders = {
      imagem: "ex: imagem.jpg, foto.png",
      video: "ex: video.mp4"
    };
    this.elements.itemArquivo.placeholder = placeholders[tipo] || "";

    this.elements.itemArquivo.value = tipo === "video" ? "video.mp4" : "imagem.jpg";
  }

  async init() {
    await this.fetchPlaylist();
    this.updatePlaylistPreview();
  }

  async apiPost(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      this.displayStatus(`Erro na requisição: ${error.message}`, "error");
      throw error;
    }
  }

  async fetchPlaylist() {
    try {
      const response = await fetch('../api/get_content.php');
      const result = await response.json();

      if (result.success) {
        this.currentPlaylist = result.data || { monitores: [] };
        this.displayStatus("Playlist carregada!", "success");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.currentPlaylist = { monitores: [] };
      this.displayStatus(
          `Erro ao carregar playlist: ${error.message}. Criando playlist vazia.`,
          "warning"
      );
    }
  }

  sortMonitors() {
    if (this.currentPlaylist?.monitores) {
      this.currentPlaylist.monitores.sort(
          (a, b) => a.id_monitor - b.id_monitor
      );
    }
  }

  displayStatus(message, type = "info") {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = `status ${type}`;
    this.elements.statusMessage.style.display = "block";

    setTimeout(() => {
      this.elements.statusMessage.style.display = "none";
    }, UploadManager.CONFIG.STATUS_TIMEOUT);
  }

  buildItemFromForm() {
    const tipo = this.elements.itemTipo.value;
    const duracao = parseInt(this.elements.itemDuracao.value) || UploadManager.CONFIG.DURACAO.PADRAO;

    return {
      tipo,
      duracao_s: duracao,
      id: Date.now() + Math.random(),
      isNew: true,
      arquivo: this.elements.itemArquivo.value
    };
  }

  validateFormData() {
    const duracao = parseInt(this.elements.itemDuracao.value);
    const arquivo = this.elements.itemArquivo.value.trim();
    const tipo = this.elements.itemTipo.value;

    if (!duracao || duracao < 1 || duracao > 3600) {
      this.displayStatus("A duração deve estar entre 1 e 3600 segundos", "error");
      return false;
    }

    if (!arquivo) {
      this.displayStatus("Por favor, digite o nome do arquivo", "error");
      return false;
    }

    // Validar extensões de arquivo
    const extensoesValidas = {
      imagem: ['.jpg', '.jpeg', '.png', '.gif'],
      video: ['.mp4', '.webm', '.mov']
    };

    const extensao = '.' + arquivo.split('.').pop().toLowerCase();
    if (!extensoesValidas[tipo].includes(extensao)) {
      this.displayStatus(`Extensão inválida para ${tipo}. Use: ${extensoesValidas[tipo].join(', ')}`, "error");
      return false;
    }

    return true;
  }

  async addItemToPlaylist() {
    if (!this.validateFormData()) {
      return;
    }

    try {
      if (!this.currentPlaylist?.monitores) {
        this.currentPlaylist = {monitores: []};
      }

      const monitorId = parseInt(this.elements.monitorTarget.value);
      let monitor = this.currentPlaylist.monitores.find(
          (m) => m.id_monitor === monitorId
      );

      if (!monitor) {
        monitor = {id_monitor: monitorId, itens: []};
        this.currentPlaylist.monitores.push(monitor);
      }

      const newItem = this.buildItemFromForm();
      monitor.itens.push(newItem);
      this.currentPlaylist.ultima_atualizacao = new Date().toISOString();

      this.displayStatus(`Item adicionado ao Monitor ${monitorId + 1} com sucesso!`, "success");
      this.updatePlaylistPreview();

      this.clearForm();
    } catch (error) {
      this.displayStatus(`Erro ao adicionar item: ${error.message}`, "error");
    }
  }

  clearForm() {
    const tipo = this.elements.itemTipo.value;
    this.elements.itemArquivo.value = tipo === "video" ? "video.mp4" : "imagem.jpg";
    this.elements.itemDuracao.value = "10";
  }

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
      this.displayStatus("Item removido com sucesso!", "success");
    }
  }

  updatePlaylistPreview() {
    const monitors = this.currentPlaylist?.monitores || [];
    const totalItems = monitors.reduce((sum, monitor) => sum + monitor.itens.length, 0);

    this.elements.totalItems.textContent = `${totalItems} ${totalItems === 1 ? 'conteudo' : 'conteudos'}`;
    this.elements.totalMonitors.textContent = `${monitors.length} ${monitors.length === 1 ? 'monitor' : 'monitores'}`;

    this.elements.monitorsGrid.innerHTML = '';

    if (monitors.length === 0) {
      this.elements.monitorsGrid.innerHTML = `
                        <div class="empty-monitor">
                            <p>Nenhum item adicionado ainda</p>
                            <p>Use o formulário abaixo para começar</p>
                        </div>
                    `;
      return;
    }

    this.sortMonitors();

    monitors.forEach(monitor => {
      const monitorCard = this.createMonitorCard(monitor);
      this.elements.monitorsGrid.appendChild(monitorCard);
    });
  }

  createMonitorCard(monitor) {
    const card = document.createElement('div');
    card.className = 'monitor-card';

    const itemsHtml = monitor.itens.map(item =>
        this.createItemHtml(item, monitor.id_monitor)
    ).join('');

    card.innerHTML = `
                    <div class="monitor-header">
                        <span>Monitor ${monitor.id_monitor + 1}</span>
                        <span class="item-count">${monitor.itens.length} ${monitor.itens.length === 1 ? 'conteúdo ' : 'conteúdos'}</span>
                    </div>
                    <div class="items-list">
                        ${itemsHtml || '<div class="empty-monitor"><p>Nenhum conteúdo neste monitor</p></div>'}
                    </div>
                `;

    return card;
  }

  createItemHtml(item, monitorId) {
    const previewHtml = `
            <div class="item-preview">
                ${item.tipo === 'video' ? `
                    <video width="100%" style="max-height: 120px;" controls>
                        <source src="../conteudo_simulado_ftp/${item.arquivo}" type="video/${item.arquivo.split('.').pop()}">
                        Seu navegador não suporta o elemento de vídeo.
                    </video>` : `
                    <img src="../conteudo_simulado_ftp/${item.arquivo}" 
                         alt="${item.arquivo}"
                         onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
                         loading="lazy">
                `}
                <span class="preview-fallback" style="display:none;">
                    ${item.arquivo}
                </span>
            </div>`;

    return `
            <div class="playlist-item ${item.isNew ? 'new-item' : ''}">
                <div class="item-info">
                    <span class="item-type ${item.tipo}">${item.tipo}</span>
                    ${previewHtml}
                    <div class="item-title">${item.arquivo}</div>
                    <div class="item-duration">${item.duracao_s}s</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-small" data-monitor-id="${monitorId}" data-item-id="${item.id}">
                        <span aria-hidden="true">&times;</span>
                        <span class="sr-only">Remover item</span>
                    </button>
                </div>
            </div>
        `;
  }

  async savePlaylist() {
    try {
      const result = await this.apiPost('../admin/manage_playlist.php', this.currentPlaylist);
      this.displayStatus(result.message || "Playlist salva com sucesso!", "success");
    } catch (error) {
      this.displayStatus(`Erro ao salvar: ${error.message}`, "error");
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.playlistManager = new UploadManager();
});