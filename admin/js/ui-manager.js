import { CONFIG } from './config.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.selectedFile = null;
    this.fileResolution = null;
    this.initializeElements();
  }

  /**
   * Inicializa todos os elementos do DOM
   */
  initializeElements() {
    this.elements = {
      itemTipo: document.getElementById("itemTipo"),
      itemArquivo: document.getElementById("itemArquivo"),
      itemDuracao: document.getElementById("itemDuracao"),
      monitorTarget: document.getElementById("monitorTarget"),

      fileUploadArea: document.getElementById("fileUploadArea"),
      fileInfo: document.getElementById("fileInfo"),
      fileName: document.getElementById("fileName"),
      fileSize: document.getElementById("fileSize"),
      fileResolution: document.getElementById("fileResolution"),
      fileIcon: document.getElementById("fileIcon"),
      removeFile: document.getElementById("removeFile"),

      addItemBtn: document.getElementById("addItemBtn"),
      savePlaylistBtn: document.getElementById("savePlaylistBtn"),
      previewBtn: document.getElementById("previewBtn"),
      resetBtn: document.getElementById("resetBtn"),

      statusMessage: document.getElementById("statusMessage"),

      monitorsGrid: document.getElementById("monitorsGrid"),
    };
  }

  /**
   * Anexa event listeners aos elementos
   */
  attachEventListeners(handlers) {
    this.elements.addItemBtn.addEventListener("click", handlers.addItemToPlaylist);
    this.elements.savePlaylistBtn.addEventListener("click", handlers.savePlaylist);
    this.elements.previewBtn.addEventListener("click", handlers.previewContent);
    this.elements.resetBtn.addEventListener("click", handlers.resetForm);

    this.elements.itemArquivo.addEventListener("change", handlers.handleFileSelect);
    this.elements.removeFile.addEventListener("click", (e) => handlers.removeSelectedFile(e));


    this.elements.fileUploadArea.addEventListener("dragover", handlers.handleDragOver);
    this.elements.fileUploadArea.addEventListener("dragleave", handlers.handleDragLeave);
    this.elements.fileUploadArea.addEventListener("drop", handlers.handleDrop);

    this.elements.itemDuracao.addEventListener("input", handlers.validateDuration);
    this.elements.itemTipo.addEventListener("change", handlers.updateFileAcceptance);
  }

  /**
   * Atualiza tipos de arquivo aceitos baseado no tipo selecionado
   */
  updateFileAcceptance() {
    const tipo = this.elements.itemTipo.value;
    const acceptTypes = {
      imagem: ".jpg,.jpeg,.png,.gif",
      video: ".mp4,.webm,.mov"
    };
    
    this.elements.itemArquivo.accept = acceptTypes[tipo];
    
    const fileTypesText = tipo === 'imagem' ? 'JPG, PNG, GIF' : 'MP4, WEBM, MOV';
    const fileTypesElement = document.querySelector('.file-types');
    if (fileTypesElement) {
      fileTypesElement.textContent = `Formatos suportados: ${fileTypesText}`;
    }
    
    const placeholderText = tipo === 'imagem' ? 
      'Selecione uma imagem (JPG, PNG, GIF)' : 
      'Selecione um vídeo (MP4, WEBM, MOV)';
    
    if (this.selectedFile && !this.isValidFileType(this.selectedFile, tipo)) {
      this.removeSelectedFile();
      this.displayStatus(`Arquivo removido - não é compatível com ${tipo}`, "warning");
    }
  }

  /**
   * Atualiza placeholder
   */
  updatePlaceholder() {
    this.updateFileAcceptance();
  }

  /**
   * Valida input de arquivo
   */
  validateFileInput() {
    return this.selectedFile !== null;
  }

  /**
   * Exibe mensagem de status
   */
  displayStatus(message, type = "info") {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.className = `status-message ${type}`;
    this.elements.statusMessage.style.display = "block";

    setTimeout(() => {
      this.elements.statusMessage.style.display = "none";
    }, CONFIG.STATUS_TIMEOUT);
  }

  /**
   * Mostra estado de carregamento
   */
  showLoadingState() {
    this.elements.monitorsGrid.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Carregando conteúdo dos monitores...</p>
      </div>
    `;
  }

  /**
   * Esconde estado de carregamento
   */
  hideLoadingState() {
    
  }

  /**
   * Mostra erro de campo
   */
  showFieldError(message) {
    let errorElement = document.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      this.elements.fileUploadArea.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  }

  /**
   * Limpa erro de campo
   */
  clearFieldError() {
    const errorElement = document.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Valida se o tipo de arquivo é válido
   */
  isValidFileType(file, tipo) {
    const validTypes = CONFIG.FILE_LIMITS.MIME_TYPES[tipo];
    return validTypes && validTypes.includes(file.type);
  }
} 