/* ===== GERENCIADOR DE ARQUIVOS ===== */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export class FileManager {
  constructor(uiManager) {
    this.ui = uiManager;
    this.selectedFile = null;
    this.fileResolution = null;
  }

  /**
   * Processa arquivo selecionado
   */
  processSelectedFile(file) {
    const tipo = this.ui.elements.itemTipo.value;
    
    if (!Utils.isValidFileType(file, tipo)) {
      this.ui.displayStatus(`Tipo de arquivo inválido para ${tipo}`, "error");
      return;
    }

    if (file.size > CONFIG.FILE_LIMITS.MAX_SIZE) {
      this.ui.displayStatus("Arquivo muito grande. Tamanho máximo: 50MB", "error");
      return;
    }

    this.selectedFile = file;
    
    // Check resolution for images
    if (tipo === 'imagem' && file.type.startsWith('image/')) {
      this.checkImageResolution(file);
    } else {
      this.displayFileInfo(file, null);
    }
    
    this.ui.displayStatus(`Arquivo "${file.name}" selecionado com sucesso!`, "success");
  }

  /**
   * Verifica resolução da imagem
   */
  checkImageResolution(file) {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const resolution = {
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2)
        };
        
        this.fileResolution = resolution;
        this.displayFileInfo(file, resolution);
        
        const validation = Utils.validateFullHDResolution(resolution);
        this.ui.displayStatus(validation.message, validation.type);
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }

  /**
   * Exibe informações do arquivo
   */
  displayFileInfo(file, resolution) {
    this.ui.elements.fileName.textContent = file.name;
    this.ui.elements.fileSize.textContent = Utils.formatFileSize(file.size);
    
    const tipo = this.ui.elements.itemTipo.value;
    const iconClass = tipo === 'imagem' ? 'fas fa-image file-icon-image' : 'fas fa-video file-icon-video';
    this.ui.elements.fileIcon.className = iconClass;
    
    if (resolution) {
      const resolutionText = `${resolution.width}×${resolution.height} (${resolution.aspectRatio}:1)`;
      
      const badge = Utils.getResolutionBadge(resolution);
      this.ui.elements.fileResolution.innerHTML = `${resolutionText} ${badge}`;
    } else {
      this.ui.elements.fileResolution.textContent = '';
    }
    
    if (tipo === 'imagem' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.ui.elements.fileIcon.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
    
    // Show file info, hide upload area
    this.ui.elements.fileInfo.style.display = 'flex';
    this.ui.elements.fileUploadArea.style.display = 'none';
  }

  /**
   * Remove arquivo selecionado
   */
  removeSelectedFile() {
    this.selectedFile = null;
    this.fileResolution = null;
    this.ui.elements.itemArquivo.value = '';
    this.ui.elements.fileInfo.style.display = 'none';
    this.ui.elements.fileUploadArea.style.display = 'block';
    this.ui.elements.fileIcon.innerHTML = '<i class="fas fa-file"></i>';
    this.ui.elements.fileResolution.textContent = '';
    this.ui.clearFieldError();
  }

  /**
   * Handlers para drag and drop
   */
  handleDragOver(event) {
    event.preventDefault();
    this.ui.elements.fileUploadArea.classList.add('dragover');
  }

  handleDragLeave(event) {
    event.preventDefault();
    this.ui.elements.fileUploadArea.classList.remove('dragover');
  }

  handleDrop(event) {
    event.preventDefault();
    this.ui.elements.fileUploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.processSelectedFile(files[0]);
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.processSelectedFile(file);
    }
  }

  /**
   * Valida dados do formulário
   */
  validateFormData() {
    const duracao = parseInt(this.ui.elements.itemDuracao.value);
    const tipo = this.ui.elements.itemTipo.value;

    // Valida duração
    if (!duracao || duracao < CONFIG.DURACAO.MIN || duracao > CONFIG.DURACAO.MAX) {
      this.ui.elements.itemDuracao.classList.add('invalid');
      this.ui.displayStatus(`A duração deve estar entre ${CONFIG.DURACAO.MIN} e ${CONFIG.DURACAO.MAX} segundos`, "error");
      return false;
    } else {
      this.ui.elements.itemDuracao.classList.remove('invalid');
    }

    // Valida arquivo
    if (!this.selectedFile) {
      this.ui.showFieldError("Por favor, selecione um arquivo");
      this.ui.displayStatus("Por favor, selecione um arquivo", "error");
      return false;
    } else {
      this.ui.clearFieldError();
    }

    // Valida tipo de arquivo
    if (!Utils.isValidFileType(this.selectedFile, tipo)) {
      this.ui.showFieldError(`Tipo de arquivo inválido para ${tipo}`);
      this.ui.displayStatus(`Tipo de arquivo inválido para ${tipo}`, "error");
      return false;
    }

    return true;
  }

  /**
   * Constrói item do formulário
   */
  buildItemFromForm() {
    const tipo = this.ui.elements.itemTipo.value;
    const duracao = parseInt(this.ui.elements.itemDuracao.value) || CONFIG.DURACAO.PADRAO;

    return {
      tipo,
      duracao_s: duracao,
      id: Date.now() + Math.random(),
      isNew: true,
      arquivo: this.selectedFile.name,
      data_criacao: new Date().toISOString(),
      file_size: this.selectedFile.size,
      file_type: this.selectedFile.type
    };
  }

  /**
   * Limpa formulário
   */
  clearForm() {
    this.removeSelectedFile();
    this.ui.elements.itemDuracao.value = "10";
    this.ui.clearFieldError();
  }

  /**
   * Reseta formulário
   */
  resetForm() {
    this.clearForm();
    this.ui.displayStatus("Formulário resetado", "info");
  }
} 