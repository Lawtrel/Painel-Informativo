import { useState, useEffect } from 'react';
import { MONITORES } from '../constants/monitors';

export function usePlaylistManager() {
  const [playlist, setPlaylist] = useState({ monitores: [] });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    setLoading(true);
    fetch('/Painel-Informativo/api/get_content.php', {})
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && Array.isArray(data.data.monitores)) {
          setPlaylist(data.data);
        } else {
          setPlaylist({ monitores: [] });
        }
        setLoading(false);
      })
      .catch(() => {
        setPlaylist({ monitores: [] });
        setLoading(false);
      });
  }, []);

  // Adicionar item à playlist
  async function addItemToPlaylist(itemData) {
    if (itemData.monitorId === undefined || itemData.monitorId === null) {
      setStatus({ message: 'monitorId não informado ao adicionar conteúdo', type: 'error' });
      setLoading(false);
      return;
    }
    const monitorId = parseInt(itemData.monitorId);
    if (isNaN(monitorId)) {
      setStatus({ message: 'monitorId inválido ao adicionar conteúdo', type: 'error' });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar URL de preview se for uma imagem ou vídeo
      let previewUrl = null;
      if (itemData.file && (itemData.tipo === 'imagem' || itemData.tipo === 'video')) {
        previewUrl = URL.createObjectURL(itemData.file);
      }
      
      const newItem = {
        ...itemData,
        id: Date.now() + Math.random(),
        isNew: true,
        data_criacao: new Date().toISOString(),
        preview_url: previewUrl
      };

      setPlaylist(prev => {
        const existingMonitor = prev.monitores.find(m => m.id_monitor === monitorId);
        
        if (existingMonitor) {
          return {
            ...prev,
            monitores: prev.monitores.map(m => 
              m.id_monitor === monitorId 
                ? { ...m, itens: [...m.itens, newItem] }
                : m
            ),
            ultima_atualizacao: new Date().toISOString()
          };
        } else {
          return {
            ...prev,
            monitores: [...prev.monitores, { id_monitor: monitorId, itens: [newItem] }],
            ultima_atualizacao: new Date().toISOString()
          };
        }
      });

      const monitorObj = MONITORES.find(m => parseInt(m.value) === monitorId);
      const monitorName = monitorObj ? monitorObj.label : `Monitor ${monitorId + 1}`;
      setStatus({ message: `Conteúdo "${itemData.arquivo}" adicionado ao ${monitorName} com sucesso!`, type: 'success' });
    } catch (error) {
      setStatus({ message: `Erro ao adicionar conteúdo: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // Remover item da playlist
  function removeItem(monitorId, itemId) {
    setPlaylist(prev => {
      // Limpar URL de preview antes de remover
      const itemToRemove = prev.monitores
        .flatMap(m => m.itens)
        .find(item => item.id === itemId);
      
      if (itemToRemove?.preview_url) {
        URL.revokeObjectURL(itemToRemove.preview_url);
      }

      const updatedMonitores = prev.monitores.map(monitor => {
        if (monitor.id_monitor === monitorId) {
          const updatedItens = monitor.itens.filter(item => item.id !== itemId);
          return updatedItens.length > 0 
            ? { ...monitor, itens: updatedItens }
            : null;
        }
        return monitor;
      }).filter(Boolean);

      return {
        ...prev,
        monitores: updatedMonitores,
        ultima_atualizacao: new Date().toISOString()
      };
    });
    setStatus({ message: 'Conteúdo removido com sucesso!', type: 'success' });
  }

  // Salvar playlist
  async function savePlaylist() {
    if (!playlist.monitores.length) {
      setStatus({ message: 'Nenhum conteúdo para salvar. Adicione conteúdo primeiro.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus({ message: 'Alterações salvas com sucesso! Os monitores serão atualizados em breve.', type: 'success' });
    } catch (error) {
      setStatus({ message: `Erro ao salvar: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // Calcular duração total do monitor
  function calculateMonitorDuration(monitor) {
    const totalSeconds = monitor.itens.reduce((sum, item) => sum + item.duracao_s, 0);
    return Math.round(totalSeconds / 60);
  }

  // Ordenar monitores por ID
  function getSortedMonitors() {
    return [...playlist.monitores].sort((a, b) => a.id_monitor - b.id_monitor);
  }

  return {
    monitores: playlist.monitores || [],
    loading,
    status,
    addItemToPlaylist,
    removeItem,
    savePlaylist,
    calculateMonitorDuration,
    getSortedMonitors,
    setStatus
  };
} 