import { useState } from 'react';

export const MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const VALID_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Configurações de resolução para painéis digitais
const RESOLUTION_CONFIG = {
  FULL_HD_VERTICAL: { width: 1080, height: 1920 },
  HD_VERTICAL: { width: 720, height: 1280 },
  MIN_ASPECT_RATIO: 1.5, // Proporção mínima vertical
  MAX_ASPECT_RATIO: 2.5  // Proporção máxima vertical
};

export function useFileManager() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileResolution, setFileResolution] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });

  function isValidFileType(file, tipo) {
    if (tipo === 'imagem') return VALID_IMAGE_TYPES.includes(file.type);
    if (tipo === 'video') return VALID_VIDEO_TYPES.includes(file.type);
    return false;
  }

  function validateFullHDResolution(resolution) {
    const { width, height } = resolution;
    const aspectRatio = width / height;
    const fullHD = RESOLUTION_CONFIG.FULL_HD_VERTICAL;
    const hd = RESOLUTION_CONFIG.HD_VERTICAL;
    const fullHDAspectRatio = fullHD.width / fullHD.height;

    let message = '';
    let type = 'success';

    // Verificar se é vertical
    if (aspectRatio < RESOLUTION_CONFIG.MIN_ASPECT_RATIO) {
      message = '⚠️ Imagem horizontal detectada. Para painéis verticais, use proporção 9:16 ou similar.';
      type = 'warning';
    } else if (aspectRatio > RESOLUTION_CONFIG.MAX_ASPECT_RATIO) {
      message = '⚠️ Proporção muito extrema. Recomendado: proporção entre 1.5:1 e 2.5:1.';
      type = 'warning';
    }

    // Verificar resolução
    if (width >= fullHD.width && height >= fullHD.height) {
      message = 'Resolução Full HD Vertical (1080x1920) ou superior - Perfeita!';
      type = 'success';
    } else if (width >= hd.width && height >= hd.height) {
      message = message || 'Resolução HD Vertical (720x1280) ou superior - Boa qualidade!';
      type = type === 'warning' ? 'warning' : 'success';
    } else {
      message = 'Resolução muito baixa. Recomendado: mínimo 720x1280px para boa qualidade.';
      type = 'error';
    }

    // Verificar se a proporção está próxima do Full HD Vertical
    const aspectRatioDiff = Math.abs(aspectRatio - fullHDAspectRatio);
    if (aspectRatioDiff > 0.3 && type !== 'error') {
      message = message || '⚠️ Proporção diferente do Full HD Vertical (9:16). Pode haver distorção.';
      type = 'warning';
    }

    return { message, type };
  }

  function processSelectedFile(file, tipo) {
    if (!isValidFileType(file, tipo)) {
      setStatus({ message: `Tipo de arquivo inválido para ${tipo}`, type: 'error' });
      return false;
    }
    
    // Verificar tamanho do arquivo
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_SIZE / (1024 * 1024)).toFixed(0);
    
    if (file.size > MAX_SIZE) {
      setStatus({ 
        message: `Arquivo muito grande! Tamanho: ${fileSizeMB}MB. Máximo permitido: ${maxSizeMB}MB.`, 
        type: 'error' 
      });
      return false;
    }
    
    setSelectedFile(file);
    setStatus({ message: `Arquivo "${file.name}" selecionado com sucesso! (${fileSizeMB}MB)`, type: 'success' });
    if (tipo === 'imagem' && file.type.startsWith('image/')) {
      checkImageResolution(file);
    } else {
      setFileResolution(null);
    }
    return true;
  }

  function checkImageResolution(file) {
    const img = new window.Image();
    const reader = new window.FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const resolution = {
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2)
        };
        
        setFileResolution(resolution);
        
        // Validar resolução para painéis digitais
        const validation = validateFullHDResolution(resolution);
        setStatus({ message: validation.message, type: validation.type });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    setFileResolution(null);
    setStatus({ message: '', type: '' });
  }

  return {
    selectedFile,
    fileResolution,
    status,
    processSelectedFile,
    removeSelectedFile,
    setStatus,
    validateFullHDResolution
  };
} 