import { Playlist, PlaylistItem } from '../model/playlistModel.js';

class PlaylistService {
  async getPlaylist() {
    try {
      const response = await fetch(`/api/get_content.php`);
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.monitores)) {
        const playlist = Playlist.fromApiResponse(data.data);
        return { success: true, playlist, message: null };
      } else {
        const playlist = Playlist.createEmpty();
        return { success: true, playlist, message: 'Nenhuma playlist encontrada' };
      }
    } catch (error) {
      console.error('Erro ao buscar playlist:', error);
      const playlist = Playlist.createEmpty();
      return { 
        success: false, 
        playlist, 
        message: 'Erro ao conectar com o servidor' 
      };
    }
  }

  async uploadFile(file, filename) {
    try {
      const formData = new FormData();
      formData.append('filesToUpload[]', file, filename);
      
      const response = await fetch(`/api/upload_handler.php`, {
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
      
      const response = await fetch(`/api/manage_playlist.php`, {
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

  async addItemToPlaylist(playlist, itemData) {
    try {
      // Validar monitorId
      if (itemData.monitorId === undefined || itemData.monitorId === null) {
        return { 
          success: false, 
          message: 'monitorId não informado ao adicionar conteúdo'
        };
      }

      const monitorId = parseInt(itemData.monitorId);
      if (isNaN(monitorId)) {
        return { 
          success: false, 
          message: 'monitorId inválido ao adicionar conteúdo'
        };
      }

      // Adicionar item à playlist
      const newItem = playlist.addItemToMonitor(monitorId, itemData);
      
      // Criar preview URL se necessário
      newItem.createPreviewUrl();

      return { 
        success: true, 
        playlist,
        item: newItem,
        message: `Conteúdo "${itemData.arquivo}" adicionado com sucesso`
      };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { 
        success: false, 
        message: `Erro ao adicionar conteúdo: ${error.message}`
      };
    }
  }

  async removeItemFromPlaylist(playlist, monitorId, itemId) {
    try {
      const success = playlist.removeItemFromMonitor(monitorId, itemId);
      
      if (success) {
        return { 
          success: true, 
          playlist,
          message: 'Conteúdo removido com sucesso!'
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
        message: `Erro ao remover conteúdo: ${error.message}`
      };
    }
  }
}

export const playlistService = new PlaylistService(); 
