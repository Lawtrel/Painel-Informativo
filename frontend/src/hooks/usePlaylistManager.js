import { useState, useEffect } from 'react';
import { MONITORES } from '../constants/monitors';
import { createPlaylistItem, cleanPlaylistForSave } from '../model/playlistModel';

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

  // Adicionar item à playlist (apenas local, sem upload)
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
      // Criar URL de preview se for uma imagem ou vídeo
      let previewUrl = null;
      if (itemData.file && (itemData.tipo === 'imagem' || itemData.tipo === 'video')) {
        previewUrl = URL.createObjectURL(itemData.file);
      }
      const newItem = createPlaylistItem({
        ...itemData,
        preview_url: previewUrl,
        data_criacao: new Date().toISOString(),
        isNew: true,
        status: 'pendente',
      });
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
      setStatus({ message: `Conteúdo "${itemData.arquivo}" adicionado ao ${monitorName} (ainda não enviado).`, type: 'success' });
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
    const itensPendentes = playlist.monitores.flatMap(m => (m.itens || []).filter(item => item.isNew && item.file));
    if (itensPendentes.length === 0) {
      setStatus({ message: 'Nenhum novo conteúdo para enviar. Adicione novos arquivos antes de salvar.', type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      // Para cada monitor, para cada item novo, faz upload
      let updatedMonitores = await Promise.all(playlist.monitores.map(async monitor => {
        const updatedItens = await Promise.all((monitor.itens || []).map(async item => {
          if (item.isNew && item.file) {
            // Upload real
            const formData = new FormData();
            formData.append('filesToUpload[]', item.file, item.arquivo);
            const res = await fetch('/Painel-Informativo/admin/upload_handler.php', {
              method: 'POST',
              body: formData
            });
            const uploadResponse = await res.json();
            if (!uploadResponse.success || !uploadResponse.uploaded_files || !uploadResponse.uploaded_files[0] || uploadResponse.uploaded_files[0].status !== 'success') {
              return { ...item, status: 'erro' };
            }
            return {
              ...item,
              arquivo: uploadResponse.uploaded_files[0].filename,
              isNew: false,
              file: undefined,
              status: 'enviado'
            };
          }
          return item;
        }));
        return { ...monitor, itens: updatedItens };
      }));
      setPlaylist(prev => ({ ...prev, monitores: updatedMonitores, ultima_atualizacao: new Date().toISOString() }));

      const config_geral = {
        url_base_midia_http: "http://localhost/Painel-Informativo/conteudo_simulado_ftp/"
      };
      const versao = 0.1;
      const playlistToSave = {
        versao,
        ultima_atualizacao: new Date().toISOString(),
        config_geral,
        monitores: cleanPlaylistForSave(updatedMonitores)
      };

      try {
        const response = await fetch('/Painel-Informativo/admin/manage_playlist.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playlistToSave)
        });
        const result = await response.json();
        if (!result.success) {
          setStatus({ message: `Erro ao salvar playlist: ${result.message || 'Erro desconhecido.'}`, type: 'error' });
          return;
        }
        setStatus({ message: result.message || 'Playlist salva com sucesso!', type: 'success' });
      } catch (error) {
        setStatus({ message: `Erro na requisição ao salvar playlist: ${error.message}`, type: 'error' });
        return;
      }
    } catch (error) {
      setStatus({ message: `Erro ao salvar: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
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
    getSortedMonitors,
    setStatus
  };
} 