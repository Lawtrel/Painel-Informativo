import { Playlist, PlaylistItem } from '../models/Playlist.js';

export class PlaylistService {
  static async getPlaylist() {
    try {
      const response = await fetch('/api/get_content.php');
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.monitores)) {
        const playlist = Playlist.fromApiResponse(data.data);
        return { success: true, playlist, message: null };
      } else {
        const playlist = Playlist.createEmpty();
        return { success: true, playlist, message: 'Nenhuma playlist encontrada' };
      }
    } catch (error) {
      const playlist = Playlist.createEmpty();
      return {
        success: false,
        playlist,
        message: 'Erro ao conectar com o servidor'
      };
    }
  }

  static async uploadFile(file, filename) {
    try {
      const formData = new FormData();
      formData.append('filesToUpload[]', file, filename);
      const response = await fetch('/api/upload_handler.php', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success && data.uploaded_files && data.uploaded_files[0] && data.uploaded_files[0].status === 'success') {
        return {
          success: true,
          filename: data.uploaded_files[0].filename,
          message: 'Arquivo enviado com sucesso'
        };
      } else {
        return {
          success: false,
          filename: null,
          message: data.message || 'Erro ao enviar arquivo'
        };
      }
    } catch (error) {
      return {
        success: false,
        filename: null,
        message: 'Erro ao conectar com o servidor'
      };
    }
  }

  static async salvarPlaylist(playlist) {
    try {
      const playlistToSave = playlist.toJSON();
      const response = await fetch('/api/manage_playlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlistToSave)
      });
      const result = await response.json();
      if (result.success) {
        return {
          success: true,
          message: result.message || 'Playlist salva com sucesso!',
          playlist
        };
      } else {
        return {
          success: false,
          message: result.message || 'Erro ao salvar playlist'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao salvar: ${error.message}`
      };
    }
  }
} 