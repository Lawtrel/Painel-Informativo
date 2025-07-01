/* ===== CONFIGURAÇÕES DO SISTEMA ===== */

export const CONFIG = {
  DURACAO: {
    MIN: 1,
    MAX: 3600,
    PADRAO: 10
  },
  STATUS_TIMEOUT: 5000,
  MONITOR_NAMES: {
    0: "1",
    1: "2", 
    2: "3",
    3: "4",
    4: "5",
    5: "6"
  },
  FILE_LIMITS: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ACCEPTED_TYPES: {
      imagem: ['.jpg', '.jpeg', '.png', '.gif'],
      video: ['.mp4', '.webm', '.mov']
    },
    MIME_TYPES: {
      imagem: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
      video: ['video/mp4', 'video/webm', 'video/quicktime']
    }
  },
  RESOLUTION: {
    FULL_HD_VERTICAL: { width: 1080, height: 1920 },
    HD_VERTICAL: { width: 720, height: 1280 },
    ASPECT_RATIO_TOLERANCE: 0.1
  },
  API: {
    ENDPOINTS: {
      GET_CONTENT: '../api/get_content.php',
      MANAGE_PLAYLIST: '../admin/manage_playlist.php'
    }
  }
}; 