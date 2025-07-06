import { useState, useEffect } from 'react';
import { MONITORES } from '../constants/monitors.js';
import { playlistService } from '../services/playlistService.js';
import { Playlist, PlaylistItem } from '../model/playlistModel.js';

export function usePlaylistManager() {
  const [playlist, setPlaylist] = useState(Playlist.createEmpty());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [resetTrigger, setResetTrigger] = useState(0);

  // Carregar playlist inicial
  const loadPlaylist = async () => {
    setLoading(true);
    try {
      const result = await playlistService.getPlaylist();
      
      if (result.success) {
        setPlaylist(result.playlist);
        if (result.message) {
          setStatus({ message: result.message, type: 'info' });
        }
      } else {
        setPlaylist(Playlist.createEmpty());
        setStatus({ message: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
      setPlaylist(Playlist.createEmpty());
      setStatus({ message: 'Erro ao carregar playlist', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item à playlist
  const addItemToPlaylist = async (itemData) => {
    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const result = await playlistService.addItemToPlaylist(playlist, itemData);
      
      if (result.success) {
        setPlaylist(result.playlist);
        
        // Obter nome do monitor para a mensagem
        const monitorId = parseInt(itemData.monitorId);
        const monitorObj = MONITORES.find(m => parseInt(m.value) === monitorId);
        const monitorName = monitorObj ? monitorObj.label : `Monitor ${monitorId + 1}`;
        
        setStatus({ 
          message: `Conteúdo "${itemData.arquivo}" adicionado ao ${monitorName} (ainda não enviado).`, 
          type: 'success' 
        });
      } else {
        setStatus({ message: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setStatus({ message: `Erro ao adicionar conteúdo: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Remover item da playlist
  const removeItem = async (monitorId, itemId) => {
    try {
      const result = await playlistService.removeItemFromPlaylist(playlist, monitorId, itemId);
      
      if (result.success) {
        setPlaylist(result.playlist);
        setStatus({ message: result.message, type: 'success' });
      } else {
        setStatus({ message: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setStatus({ message: `Erro ao remover conteúdo: ${error.message}`, type: 'error' });
    }
  };

  // Salvar playlist
  const savePlaylist = async () => {
    if (!playlist.hasPendingItems()) {
      setStatus({ 
        message: 'Nenhum novo conteúdo para enviar. Adicione novos arquivos antes de salvar.', 
        type: 'warning' 
      });
      return;
    }

    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const result = await playlistService.savePlaylist(playlist);
      
      if (result.success) {
        setPlaylist(result.playlist);
        setStatus({ message: result.message, type: 'success' });
      } else {
        setStatus({ message: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Erro ao salvar playlist:', error);
      setStatus({ message: `Erro ao salvar: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Resetar formulário e limpar itens pendentes
  const resetForm = () => {
    const updatedMonitores = playlist.monitores.map(monitor => ({
      id_monitor: monitor.id_monitor,
      itens: (monitor.itens || []).filter(item => {
        if (item instanceof PlaylistItem) {
          return !item.isNew;
        }
        return true;
      })
    })).filter(monitor => monitor.itens.length > 0); // Remover monitores vazios

    const newPlaylist = new Playlist({
      monitores: updatedMonitores,
      ultima_atualizacao: new Date().toISOString()
    });

    setPlaylist(newPlaylist);
    setStatus({ message: 'Formulário resetado. Itens pendentes foram removidos.', type: 'info' });
    setResetTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadPlaylist();
  }, []);

  return {
    playlist,
    monitores: playlist.monitores || [],
    loading,
    status,
    resetTrigger,
    
    addItemToPlaylist,
    removeItem,
    savePlaylist,
    loadPlaylist,
    setStatus,
    resetForm,
    
    getSortedMonitors: () => playlist.getSortedMonitors(),
    hasPendingItems: () => playlist.hasPendingItems(),
    getPendingItems: () => playlist.getPendingItems()
  };
} 