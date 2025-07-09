export class PlaylistItem {
  constructor(data = {}) {
    this.id = data.id || Date.now() + Math.random();
    this.arquivo = data.arquivo || '';
    this.tipo = data.tipo || '';
    this.duracao_s = data.duracao_s || 0;
    this.monitorId = parseInt(data.monitorId) || 0;
    this.file = data.file || undefined;
    this.isNew = data.isNew !== undefined ? data.isNew : (!data.url_http && data.tipo !== 'texto_simples' && !data.mensagem);
    this.status = data.status || (this.url_http || (!this.isNew && (this.tipo === 'texto_simples' || this.mensagem)) ? 'enviado' : (this.isNew ? 'pendente' : 'enviado'));
    this.data_criacao = data.data_criacao || new Date().toISOString();
    this.preview_url = data.preview_url || null;
    this.url_http = data.url_http || null;
    this.file_size = data.file_size || undefined;
    this.file_type = data.file_type || undefined;
    this.mensagem = data.mensagem || undefined;
    this.cor_fundo = data.cor_fundo || undefined;
    this.cor_texto = data.cor_texto || undefined;
  }

  static createNew(itemData) {
    return new PlaylistItem({
      ...itemData,
      isNew: true,
      status: 'pendente',
      data_criacao: new Date().toISOString()
    });
  }

  createPreviewUrl() {
    if (this.file && (this.tipo === 'imagem' || this.tipo === 'video')) {
      this.preview_url = URL.createObjectURL(this.file);
    } else if (this.url_http && (this.tipo === 'imagem' || this.tipo === 'video')) {
      this.preview_url = this.url_http;
    } else if (!this.file && this.arquivo && (this.tipo === 'imagem' || this.tipo === 'video')) {
      const baseUrl = window.location.origin + '/conteudo_simulado_ftp';
      this.preview_url = baseUrl + this.arquivo;
    }
    return this.preview_url;
  }

  clearPreviewUrl() {
    if (this.preview_url) {
      URL.revokeObjectURL(this.preview_url);
      this.preview_url = null;
    }
  }

  markAsSent(filename) {
    this.arquivo = filename;
    this.isNew = false;
    this.file = undefined;
    this.status = 'enviado';
    this.clearPreviewUrl();
  }

  markAsError() {
    this.status = 'erro';
  }

  isNewWithFile() {
    return this.isNew && this.file && !this.url_http && (this.tipo === 'imagem' || this.tipo === 'video');
  }

  canBeSent() {
    return this.isNew && this.file && this.arquivo && !this.url_http && (this.tipo === 'imagem' || this.tipo === 'video');
  }

  toSaveObject() {
    const obj = { tipo: this.tipo, duracao_s: this.duracao_s };
    if (this.arquivo) obj.arquivo = this.arquivo;
    if (this.mensagem) obj.mensagem = this.mensagem;
    if (this.cor_fundo) obj.cor_fundo = this.cor_fundo;
    if (this.cor_texto) obj.cor_texto = this.cor_texto;
    return obj;
  }

  toJSON() {
    return {
      id: this.id,
      arquivo: this.arquivo,
      tipo: this.tipo,
      duracao_s: this.duracao_s,
      monitorId: this.monitorId,
      isNew: this.isNew,
      status: this.status,
      data_criacao: this.data_criacao,
      preview_url: this.preview_url,
      url_http: this.url_http,
      file_size: this.file_size,
      file_type: this.file_type,
      mensagem: this.mensagem,
      cor_fundo: this.cor_fundo,
      cor_texto: this.cor_texto
    };
  }
}

export class Playlist {
  constructor(data = {}) {
    this.monitores = this.convertMonitoresToInstances(data.monitores || []);
    this.ultima_atualizacao = data.ultima_atualizacao || new Date().toISOString();
  }

  convertMonitoresToInstances(monitores) {
    return monitores.map(monitor => ({
      id_monitor: monitor.id_monitor,
      itens: (monitor.itens || []).map(item => {
        if (item instanceof PlaylistItem) return item;
        const playlistItem = new PlaylistItem(item);
        if (playlistItem.tipo === 'imagem' || playlistItem.tipo === 'video') {
          playlistItem.createPreviewUrl();
        }
        return playlistItem;
      })
    }));
  }

  static fromApiResponse(data) {
    return new Playlist({
      monitores: data.monitores || [],
      ultima_atualizacao: data.ultima_atualizacao
    });
  }

  static createEmpty() {
    return new Playlist({
      monitores: [],
      ultima_atualizacao: new Date().toISOString()
    });
  }

  addItemToMonitor(monitorId, itemData) {
    const newItem = PlaylistItem.createNew({
      ...itemData,
      monitorId: parseInt(monitorId)
    });

    if (newItem.file && (newItem.tipo === 'imagem' || newItem.tipo === 'video')) {
      newItem.createPreviewUrl();
    }

    const existingMonitor = this.monitores.find(m => m.id_monitor === parseInt(monitorId));
    
    if (existingMonitor) {
      existingMonitor.itens = [...(existingMonitor.itens || []), newItem];
    } else {
      this.monitores.push({ 
        id_monitor: parseInt(monitorId), 
        itens: [newItem] 
      });
    }

    this.ultima_atualizacao = new Date().toISOString();
    return newItem;
  }

  removeItemFromMonitor(monitorId, itemId) {
    const monitor = this.monitores.find(m => m.id_monitor === parseInt(monitorId));
    if (!monitor) return false;

    const itemToRemove = monitor.itens.find(item => item.id === itemId);
    if (itemToRemove && itemToRemove instanceof PlaylistItem) {
      itemToRemove.clearPreviewUrl();
    }

    monitor.itens = monitor.itens.filter(item => item.id !== itemId);
    
    if (monitor.itens.length === 0) {
      this.monitores = this.monitores.filter(m => m.id_monitor !== parseInt(monitorId));
    }

    this.ultima_atualizacao = new Date().toISOString();
    return true;
  }

  getPendingItems() {
    return this.monitores.flatMap(m => 
      (m.itens || []).filter(item => {
        if (item instanceof PlaylistItem) {
          return item.isNew && item.file && item.arquivo && !item.url_http;
        }
        return false;
      })
    );
  }

  hasPendingItems() {
    return this.getPendingItems().length > 0;
  }

  getSortedMonitors() {
    return [...this.monitores].sort((a, b) => a.id_monitor - b.id_monitor);
  }

  toSaveObject() {
    return {
      versao: 0.1,
      ultima_atualizacao: this.ultima_atualizacao,
      config_geral: {
        url_base_midia_http: window.location.origin + "/conteudo_simulado_ftp/"
      },
      monitores: this.monitores.map(monitor => ({
        id_monitor: monitor.id_monitor,
        itens: (monitor.itens || []).map(item => {
          if (item instanceof PlaylistItem) {
            // Para itens que acabaram de ser enviados, usar o arquivo atualizado
            if (item.status === 'enviado' && item.arquivo) {
              const obj = { tipo: item.tipo, duracao_s: item.duracao_s };
              if (item.arquivo) obj.arquivo = item.arquivo;
              if (item.mensagem) obj.mensagem = item.mensagem;
              if (item.cor_fundo) obj.cor_fundo = item.cor_fundo;
              if (item.cor_texto) obj.cor_texto = item.cor_texto;
              return obj;
            }
            // Para itens já existentes, usar toSaveObject
            return item.toSaveObject();
          }
          // Para itens que não são instâncias de PlaylistItem (já existentes)
          const { arquivo, tipo, duracao_s, mensagem, cor_fundo, cor_texto, url_http } = item;
          const obj = { tipo, duracao_s };
          if (arquivo) obj.arquivo = arquivo;
          if (mensagem) obj.mensagem = mensagem;
          if (cor_fundo) obj.cor_fundo = cor_fundo;
          if (cor_texto) obj.cor_texto = cor_texto;
          if (url_http) obj.url_http = url_http;
          return obj;
        })
      }))
    };
  }

  toJSON() {
    return {
      monitores: this.monitores,
      ultima_atualizacao: this.ultima_atualizacao
    };
  }
} 