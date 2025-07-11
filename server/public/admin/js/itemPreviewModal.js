export class ItemPreviewModal {
  constructor() {
    this.isOpen = false;
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    // Criar overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'item-preview-modal-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    document.body.appendChild(this.overlay);

    // Criar container
    this.container = document.createElement('div');
    this.container.className = 'item-preview-modal-container';
    this.container.innerHTML = `
      <!-- Header -->
      <div class="item-preview-modal-header">
        <div>
          <h3 class="item-preview-modal-title">
            <i class="fas fa-image"></i>
            <span id="modal-title">Visualização</span>
          </h3>
          <div class="item-preview-modal-subtitle" id="modal-subtitle">
            Carregando...
          </div>
        </div>
        <button 
          class="item-preview-modal-close" 
          type="button" 
          aria-label="Fechar modal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="item-preview-modal-body">
        <!-- Info Grid -->
        <div class="item-preview-modal-info">
          <h4 class="item-preview-modal-info-title">Informações do Arquivo</h4>
          <div class="item-preview-modal-info-grid">
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Nome:</span>
              <span class="item-preview-modal-info-value" data-field="nome"></span>
            </div>
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Tipo:</span>
              <span class="item-preview-modal-info-value" data-field="tipo"></span>
            </div>
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Duração:</span>
              <span class="item-preview-modal-info-value" data-field="duracao"></span>
            </div>
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Tamanho:</span>
              <span class="item-preview-modal-info-value" data-field="tamanho"></span>
            </div>
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Formato:</span>
              <span class="item-preview-modal-info-value" data-field="formato"></span>
            </div>
            <div class="item-preview-modal-info-item">
              <span class="item-preview-modal-info-label">Data:</span>
              <span class="item-preview-modal-info-value" data-field="data"></span>
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="item-preview-modal-preview">
          <div class="item-preview-modal-preview-loading">
            <i class="fas fa-image"></i>
            <p>Carregando preview...</p>
            <p class="duration">Duração: <span id="preview-duration">0</span> segundos</p>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="item-preview-modal-recommendations">
          <h4 class="item-preview-modal-recommendations-title">Recomendações para Painéis Digitais</h4>
          <ul class="item-preview-modal-recommendations-list">
            <li>Resolução ideal: 1080x1920px (Full HD Vertical)</li>
            <li>Proporção: 9:16 (vertical)</li>
            <li>Tamanho máximo: 2MB</li>
            <li>Formatos: JPG, PNG, MP4</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div class="item-preview-modal-footer">
        <button 
          class="item-preview-modal-btn danger" 
          type="button" 
          data-action="remover">
          <i class="fas fa-trash"></i> Remover
        </button>
        <button 
          class="item-preview-modal-btn secondary" 
          type="button" 
          data-action="fechar">
          Fechar
        </button>
      </div>
    `;
    this.overlay.appendChild(this.container);
  }

  bindEvents() {
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });

    // Click outside
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });

    // Close button
    this.container.querySelector('.item-preview-modal-close').addEventListener('click', () => {
      this.hide();
    });

    // Close action button
    this.container.querySelector('[data-action="fechar"]').addEventListener('click', () => {
      this.hide();
    });

    // Remove action button
    this.container.querySelector('[data-action="remover"]').addEventListener('click', () => {
      if (this.onRemove) {
        this.onRemove(this.currentItem);
      }
      this.hide();
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  show(item, monitorName, onRemove) {
    this.currentItem = item;
    this.onRemove = onRemove;

    // Atualizar título e subtítulo
    const title = this.container.querySelector('#modal-title');
    const subtitle = this.container.querySelector('#modal-subtitle');
    const titleIcon = this.container.querySelector('.item-preview-modal-title i');
    
    title.textContent = `Visualização: ${item.arquivo}`;
    if (item.tipo === 'imagem') {
      titleIcon.className = 'fas fa-image';
      titleIcon.style.color = '#3b82f6';
    } else {
      titleIcon.className = 'fas fa-video';
      titleIcon.style.color = '#ef4444';
    }
    
    const fileSize = this.formatFileSize(item.tamanho || item.file_size || 0);
    const date = this.formatDate(item.data_criacao || new Date());
    subtitle.textContent = `${item.duracao_s}s • ${fileSize} • ${date}`;

    // Preencher informações
    this.container.querySelector('[data-field="nome"]').textContent = item.arquivo;
    this.container.querySelector('[data-field="tipo"]').textContent = item.tipo === 'imagem' ? 'Imagem' : 'Vídeo';
    this.container.querySelector('[data-field="duracao"]').textContent = `${item.duracao_s} segundos`;
    this.container.querySelector('[data-field="tamanho"]').textContent = fileSize;
    this.container.querySelector('[data-field="formato"]').textContent = item.file_type || item.tipo;
    this.container.querySelector('[data-field="data"]').textContent = date;

    // Preview
    const previewArea = this.container.querySelector('.item-preview-modal-preview');
    const loadingDiv = this.container.querySelector('.item-preview-modal-preview-loading');
    const durationSpan = this.container.querySelector('#preview-duration');
    
    durationSpan.textContent = item.duracao_s;

    // Limpar preview anterior
    const existingMedia = previewArea.querySelector('img, video');
    if (existingMedia) {
      existingMedia.remove();
    }

    if (item.preview_url) {
      loadingDiv.style.display = 'none';
      
      if (item.tipo === 'imagem') {
        const img = document.createElement('img');
        img.src = item.preview_url;
        img.alt = item.arquivo;
        img.className = 'max-w-full max-h-full object-contain';
        previewArea.appendChild(img);
      } else if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.src = item.preview_url;
        video.controls = true;
        video.className = 'max-w-full max-h-full';
        video.autoplay = true;
        video.muted = true;
        previewArea.appendChild(video);
      }
    } else {
      loadingDiv.style.display = 'block';
      const icon = loadingDiv.querySelector('i');
      icon.className = item.tipo === 'imagem' ? 'fas fa-image' : 'fas fa-video';
    }

    // Mostrar modal
    this.overlay.classList.add('active');
    this.isOpen = true;

    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.overlay.classList.remove('active');
    this.isOpen = false;
    this.currentItem = null;
    this.onRemove = null;

    // Restaurar scroll do body
    document.body.style.overflow = '';

    // Limpar dados
    this.container.querySelectorAll('[data-field]').forEach(el => {
      el.textContent = '';
    });

    // Limpar preview
    const previewArea = this.container.querySelector('.item-preview-modal-preview');
    const existingMedia = previewArea.querySelector('img, video');
    if (existingMedia) {
      existingMedia.remove();
    }
    
    const loadingDiv = this.container.querySelector('.item-preview-modal-preview-loading');
    loadingDiv.style.display = 'block';
  }
} 