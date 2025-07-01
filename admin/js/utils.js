import { CONFIG } from './config.js';

export class Utils {
  /**
   * Formata tamanho de arquivo em bytes para formato legível
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Valida se o tipo de arquivo é válido para o tipo de conteúdo
   */
  static isValidFileType(file, tipo) {
    const validTypes = CONFIG.FILE_LIMITS.MIME_TYPES[tipo];
    return validTypes && validTypes.includes(file.type);
  }

  /**
   * Valida resolução de imagem para Full HD Vertical
   */
  static validateFullHDResolution(resolution) {
    const fullHD = CONFIG.RESOLUTION.FULL_HD_VERTICAL;
    const hd = CONFIG.RESOLUTION.HD_VERTICAL;
    const aspectRatio = resolution.width / resolution.height;
    const fullHDAspectRatio = fullHD.width / fullHD.height;
    
    let message = '';
    let type = 'success';
    
    if (resolution.width >= fullHD.width && resolution.height >= fullHD.height) {
      if (Math.abs(aspectRatio - fullHDAspectRatio) <= CONFIG.RESOLUTION.ASPECT_RATIO_TOLERANCE) {
        message = `✅ Resolução ideal para Full HD Vertical: ${resolution.width}x${resolution.height}`;
      } else {
        message = `⚠️ Resolução alta (${resolution.width}x${resolution.height}) mas proporção diferente de 9:16`;
        type = 'warning';
      }
    } else if (resolution.width >= hd.width && resolution.height >= hd.height) {
      message = `⚠️ Resolução HD Vertical (${resolution.width}x${resolution.height}). Recomendado: 1080x1920`;
      type = 'warning';
    } else {
      message = `❌ Resolução baixa (${resolution.width}x${resolution.height}). Mínimo recomendado: 720x1280`;
      type = 'error';
    }
    
    return { message, type };
  }

  /**
   * Gera badge de resolução baseado na qualidade
   */
  static getResolutionBadge(resolution) {
    const fullHD = CONFIG.RESOLUTION.FULL_HD_VERTICAL;
    const hd = CONFIG.RESOLUTION.HD_VERTICAL;
    
    if (resolution.width >= fullHD.width && resolution.height >= fullHD.height) {
      return '<span class="resolution-badge fullhd">Full HD Vertical+</span>';
    } else if (resolution.width >= hd.width && resolution.height >= hd.height) {
      return '<span class="resolution-badge hd">HD Vertical</span>';
    } else if (resolution.width >= 2160 || resolution.height >= 3840) {
      return '<span class="resolution-badge uhd">4K</span>';
    } else {
      return '<span class="resolution-badge low">Baixa</span>';
    }
  }

  /**
   * Simula upload de arquivo
   */
  static async simulateFileUpload() {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  /**
   * Faz requisição POST para API
   */
  static async apiPost(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Erro na requisição: ${error.message}`);
    }
  }

  /**
   * Busca playlist da API
   */
  static async fetchPlaylist() {
    try {
      const response = await fetch(CONFIG.API.ENDPOINTS.GET_CONTENT);
      const result = await response.json();

      if (result.success) {
        return result.data || { monitores: [] };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Erro ao carregar playlist: ${error.message}`);
    }
  }
} 