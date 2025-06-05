class UploadManager {
  static CONFIG = {
    DURACAO: {
      MIN: 1,
      MAX: 3600,
      PADRAO: 10
    },
    CORES_PADRAO: {
      TEXTO: '#FFFFFF',
      FUNDO: '#333333'
    },
    EXTENSOES_VALIDAS: {
      imagem: ['.jpg', '.jpeg', '.png', '.gif'],
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
      itemMensagem: document.getElementById("itemMensagem"),
      itemDuracao: document.getElementById("itemDuracao"),
      monitorTarget: document.getElementById("monitorTarget"),
      fileInputGroup: document.getElementById("fileInputGroup"),
      textInputGroup: document.getElementById("textInputGroup"),

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
    // Content type change handler
    this.elements.itemTipo.addEventListener("change", () =>
        this.handleContentTypeChange()
    );

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

    // Delegate click events for removing items
    this.elements.monitorsGrid.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".btn-danger");
      if (removeBtn) {
        const item = removeBtn.closest(".playlist-item");
        const monitorId = parseInt(removeBtn.dataset.monitorId);
        const itemId = parseFloat(removeBtn.dataset.itemId);
        this.removeItem(monitorId, itemId);
      }
    });
  }

  async init() {
    await this.fetchPlaylist();
    this.handleContentTypeChange();
    this.updatePlaylistPreview();
  }

  handleContentTypeChange() {
    const isText = this.elements.itemTipo.value === "texto_simples";
    this.elements.fileInputGroup.style.display = isText ? "none" : "block";
    this.elements.textInputGroup.style.display = isText ? "block" : "none";
  }

  validateDuration(e) {
    const value = parseInt(e.target.value);
    if (value < UploadManager.CONFIG.DURACAO.MIN) e.target.value = UploadManager.CONFIG.DURACAO.MIN;
    if (value > UploadManager.CONFIG.DURACAO.MAX) e.target.value = UploadManager.CONFIG.DURACAO.MAX;
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

    const baseItem = {
      tipo,
      duracao_s: duracao,
      id: Date.now() + Math.random(),
      isNew: true
    };

    if (tipo === "texto_simples") {
      return {
        ...baseItem,
        mensagem: this.elements.itemMensagem.value.trim() || "Texto Padrão",
        cor_fundo: UploadManager.CONFIG.CORES_PADRAO.FUNDO,
        cor_texto: UploadManager.CONFIG.CORES_PADRAO.TEXTO,
      };
    }

    return {
      ...baseItem,
      arquivo: this.elements.itemArquivo.value.trim() || "imagem_padrao.jpg",
    };
  }

  validateFormData() {
    const tipo = this.elements.itemTipo.value;
    const duracao = parseInt(this.elements.itemDuracao.value);

    if (!duracao || duracao < 1 || duracao > 3600) {
      this.displayStatus("A duração deve estar entre 1 e 3600 segundos", "error");
      return false;
    }

    if (tipo === "texto_simples") {
      const mensagem = this.elements.itemMensagem.value.trim();
      if (!mensagem) {
        this.displayStatus("A mensagem não pode estar vazia", "error");
        return false;
      }
    } else {
      const arquivo = this.elements.itemArquivo.value.trim();
      if (!arquivo) {
        this.displayStatus("O nome do arquivo não pode estar vazio", "error");
        return false;
      }

      const extensao = arquivo.toLowerCase().slice(arquivo.lastIndexOf('.'));
      if (!UploadManager.CONFIG.EXTENSOES_VALIDAS[tipo].includes(extensao)) {
        this.displayStatus(`Extensão inválida para ${tipo}. Use: ${UploadManager.CONFIG.EXTENSOES_VALIDAS[tipo].join(', ')}`, "error");
        return false;
      }
    }

    return true;
  }

  addItemToPlaylist() {
    if (!this.validateFormData()) {
      return;
    }

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
  }

  clearForm() {
    if (this.elements.itemTipo.value !== "texto_simples") {
      this.elements.itemArquivo.value = "";
    } else {
      this.elements.itemMensagem.value = "";
    }
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
    const displayName = item.tipo === 'texto_simples'
        ? item.mensagem
        : item.arquivo;

    const previewHtml = item.tipo === 'imagem'
        ? `<div class="item-preview">
             <img src="../conteudo_simulado_ftp/${item.arquivo}" 
                  alt="${item.arquivo}"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
                  loading="lazy">
             <span class="preview-fallback" style="display:none;">
               ${item.arquivo}
             </span>
           </div>`
        : '';

    return `
      <div class="playlist-item ${item.isNew ? 'new-item' : ''}">
        <div class="item-info">
          <span class="item-type ${item.tipo}">${item.tipo.replace('_', ' ')}</span>
          ${previewHtml}
          <div class="item-title">${displayName}</div>
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