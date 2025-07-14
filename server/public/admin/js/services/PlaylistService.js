import { Playlist, PlaylistItem } from '../models/Playlist.js';

export class PlaylistService {
  constructor() {
this.baseUrl = '/Painel-Informativo/server/api';
  }

  async getPlaylist() {
    try {
      const response = await fetch(`${this.baseUrl}/get_content.php`);
      const data = await response.json();
      const playlistObj = data.playlist || data.data || data;
      if (data.success) {
        return {
          success: true,
          playlist: Playlist.fromApiResponse(playlistObj),
          message: data.message
        };
      } else {
        return {
          success: false,
          playlist: Playlist.createEmpty(),
          message: data.message || 'Erro ao carregar playlist'
        };
      }
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
      return {
        success: false,
        playlist: Playlist.createEmpty(),
        message: 'Erro de conexão ao carregar playlist'
      };
    }
  }

  async uploadFile(file, filename) {
    try {
      const formData = new FormData();
      formData.append('filesToUpload[]', file, filename);
      
      const response = await fetch(`${this.baseUrl}/upload_handler.php`, {
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
      console.error('Erro no upload:', error);
      return { 
        success: false, 
        filename: null,
        message: 'Erro ao conectar com o servidor'
      };
    }
  }

  async savePlaylist(playlist) {
    try {
      // Primeiro, fazer upload de todos os arquivos pendentes
      const pendingItems = playlist.getPendingItems();
      
      for (const item of pendingItems) {
        if (item.canBeSent()) {
          const uploadResult = await this.uploadFile(item.file, item.arquivo);
          
          if (uploadResult.success) {
            item.markAsSent(uploadResult.filename);
          } else {
            item.markAsError();
            return { 
              success: false, 
              message: `Erro ao enviar arquivo ${item.arquivo}: ${uploadResult.message}` 
            };
          }
        }
      }

      // Salvar playlist no servidor
      const playlistToSave = playlist.toSaveObject();
      
      console.log('Enviando playlist para API:', playlistToSave);
      
      const response = await fetch(`${this.baseUrl}/manage_playlist.php`, {
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
      console.error('Erro ao salvar playlist:', error);
      return { 
        success: false, 
        message: `Erro ao salvar: ${error.message}`
      };
    }
  }

  addItemToPlaylist(playlist, itemData) {
    try {
      const newItem = playlist.addItemToMonitor(itemData.monitorId, itemData);
      
      return {
        success: true,
        playlist: playlist,
        message: 'Item adicionado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return {
        success: false,
        message: `Erro ao adicionar item: ${error.message}`
      };
    }
  }

  removeItemFromPlaylist(playlist, monitorId, itemId) {
    try {
      const success = playlist.removeItemFromMonitor(monitorId, itemId);
      
      if (success) {
        return {
          success: true,
          playlist: playlist,
          message: 'Item removido com sucesso'
        };
      } else {
        return {
          success: false,
          message: 'Item não encontrado'
        };
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      return {
        success: false,
        message: `Erro ao remover item: ${error.message}`
      };
    }
  }
  async deleteMediaItem(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/delete_media.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: filename })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Erro desconhecido ao apagar.' };
      }
    } catch (error) {
      console.error('Erro ao apagar item de mídia:', error);
      return { success: false, message: 'Erro de conexão ao tentar apagar.' };
    }
  }
}

window.playlistService = new PlaylistService(); 