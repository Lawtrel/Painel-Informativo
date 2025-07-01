import { Utils } from './utils.js';

export class PreviewManager {
  constructor(uiManager, fileManager) {
    this.ui = uiManager;
    this.fileManager = fileManager;
  }

  /**
   * Preview do conteúdo selecionado
   */
  previewContent() {
    if (!this.fileManager.selectedFile) {
      this.ui.displayStatus("Selecione um arquivo para visualizar", "warning");
      return;
    }

    const tipo = this.ui.elements.itemTipo.value;
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    
    let previewContent = '';
    let resolutionInfo = '';
    
    if (tipo === 'video' && this.fileManager.selectedFile.type.startsWith('video/')) {
      previewContent = `
        <video width="100%" controls style="max-height: 60vh;">
          <source src="${URL.createObjectURL(this.fileManager.selectedFile)}" type="${this.fileManager.selectedFile.type}">
          Seu navegador não suporta o elemento de vídeo.
        </video>
      `;
    } else if (tipo === 'imagem' && this.fileManager.selectedFile.type.startsWith('image/')) {
      previewContent = `
        <img src="${URL.createObjectURL(this.fileManager.selectedFile)}" 
             alt="${this.fileManager.selectedFile.name}"
             style="max-width: 100%; max-height: 60vh; object-fit: contain;">
      `;
      
      if (this.fileManager.fileResolution) {
        const badge = Utils.getResolutionBadge(this.fileManager.fileResolution);
        resolutionInfo = `
          <p><strong>Resolução:</strong> ${this.fileManager.fileResolution.width}×${this.fileManager.fileResolution.height} ${badge}</p>
          <p><strong>Proporção:</strong> ${this.fileManager.fileResolution.aspectRatio}:1</p>
        `;
      }
    } else {
      previewContent = `
        <div class="preview-fallback">
          <i class="fas fa-${tipo === 'video' ? 'video' : 'image'}"></i>
          <p>Arquivo: ${this.fileManager.selectedFile.name}</p>
          <p>Tipo: ${this.fileManager.selectedFile.type}</p>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <h3>Visualização do Conteúdo</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="preview-body">
          ${previewContent}
        </div>
        <div class="preview-footer">
          <p><strong>Arquivo:</strong> ${this.fileManager.selectedFile.name}</p>
          <p><strong>Tipo:</strong> ${tipo}</p>
          <p><strong>Tamanho:</strong> ${Utils.formatFileSize(this.fileManager.selectedFile.size)}</p>
          <p><strong>Duração:</strong> ${this.ui.elements.itemDuracao.value} segundos</p>
          ${resolutionInfo}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Preview de item do monitor
   */
  previewItemFromMonitor(arquivo, tipo, duracao) {
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    
    let previewContent = '';
    
    if (tipo === 'video') {
      previewContent = `
        <video width="100%" controls style="max-height: 60vh;">
          <source src="../conteudo_simulado_ftp/${arquivo}" type="video/${arquivo.split('.').pop()}">
          Seu navegador não suporta o elemento de vídeo.
        </video>
      `;
    } else {
      previewContent = `
        <img src="../conteudo_simulado_ftp/${arquivo}" 
             alt="${arquivo}"
             style="max-width: 100%; max-height: 60vh; object-fit: contain;"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
        <div class="preview-fallback" style="display:none;">
          <i class="fas fa-image"></i>
          <p>Arquivo não encontrado: ${arquivo}</p>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <h3>Visualização do Conteúdo</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="preview-body">
          ${previewContent}
        </div>
        <div class="preview-footer">
          <p><strong>Arquivo:</strong> ${arquivo}</p>
          <p><strong>Tipo:</strong> ${tipo}</p>
          <p><strong>Duração:</strong> ${duracao} segundos</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
} 