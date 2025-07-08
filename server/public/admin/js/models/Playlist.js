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
    this.monitores = (data.monitores || []).map(monitor => ({
      id_monitor: monitor.id_monitor,
      itens: (monitor.itens || []).map(item => item instanceof PlaylistItem ? item : new PlaylistItem(item))
    }));
    this.ultima_atualizacao = data.ultima_atualizacao || new Date().toISOString();
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

  toJSON() {
    return {
      monitores: this.monitores,
      ultima_atualizacao: this.ultima_atualizacao
    };
  }
} 