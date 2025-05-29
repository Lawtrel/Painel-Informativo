// admin/script.js
document.addEventListener('DOMContentLoaded', () => {
    const playlistJsonArea = document.getElementById('playlistJsonArea');
    const loadPlaylistBtn = document.getElementById('loadPlaylistBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const savePlaylistBtn = document.getElementById('savePlaylistBtn');
    const statusMessage = document.getElementById('statusMessage');

    const itemTipoInput = document.getElementById('itemTipo');
    const itemArquivoInput = document.getElementById('itemArquivo');
    const itemMensagemInput = document.getElementById('itemMensagem');
    const itemDuracaoInput = document.getElementById('itemDuracao');


    let currentPlaylist = null; // Para guardar a playlist carregada e modificada

    async function fetchPlaylist() {
        try {
            const response = await fetch('../api/get_content.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data) {
                currentPlaylist = result.data;
                playlistJsonArea.value = JSON.stringify(currentPlaylist, null, 2);
                displayStatus('Playlist carregada com sucesso!', 'success');
            } else {
                displayStatus(`Erro ao carregar playlist: ${result.error || 'Formato de resposta inválido.'}`, 'error');
                currentPlaylist = null;
            }
        } catch (error) {
            displayStatus(`Erro na requisição: ${error.message}`, 'error');
            currentPlaylist = null;
        }
    }

    function displayStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`; // Remove classes antigas e adiciona a nova
        statusMessage.style.display = 'block';
    }

    loadPlaylistBtn.addEventListener('click', fetchPlaylist);

    addItemBtn.addEventListener('click', () => {
        if (!currentPlaylist) {
            displayStatus('Carregue uma playlist primeiro!', 'error');
            return;
        }
        if (!currentPlaylist.monitores || !Array.isArray(currentPlaylist.monitores)) {
            displayStatus('Estrutura da playlist inválida (sem monitores).', 'error');
            return;
        }
        
        let monitor0 = currentPlaylist.monitores.find(m => m.id_monitor === 0);
        if (!monitor0) { // Se não existir monitor 0, cria um (simplificado)
            monitor0 = { id_monitor: 0, itens: [] };
            currentPlaylist.monitores.push(monitor0);
            // Reordena para garantir que monitor 0 venha antes do 1, se existir.
            currentPlaylist.monitores.sort((a,b) => a.id_monitor - b.id_monitor);
        }
        if (!Array.isArray(monitor0.itens)) {
            monitor0.itens = []; // Garante que itens seja um array
        }

        const newItem = {
            tipo: itemTipoInput.value.trim() || "imagem",
            duracao_s: parseInt(itemDuracaoInput.value) || 10
        };

        if (newItem.tipo === "texto_simples") {
            newItem.mensagem = itemMensagemInput.value.trim() || "Texto Padrão";
            newItem.cor_fundo = "#333333"; // Exemplo
            newItem.cor_texto = "#FFFFFF"; // Exemplo
        } else { // imagem ou video
            newItem.arquivo = itemArquivoInput.value.trim() || "imagem_padrao.jpg";
        }

        monitor0.itens.push(newItem);
        currentPlaylist.ultima_atualizacao = new Date().toISOString(); // Atualiza timestamp
        playlistJsonArea.value = JSON.stringify(currentPlaylist, null, 2);
        displayStatus('Item de exemplo adicionado ao Monitor 0. Clique em "Salvar Playlist" para persistir.', 'success');
    });

    savePlaylistBtn.addEventListener('click', async () => {
        if (!currentPlaylist) {
            displayStatus('Nenhuma playlist para salvar. Carregue ou modifique uma primeiro.', 'error');
            return;
        }

        try {
            // Pega o conteúdo da textarea, caso tenha sido editado manualmente (embora não seja o ideal para UI)
            // Ou usa currentPlaylist que foi modificado programaticamente
            const playlistToSave = JSON.parse(playlistJsonArea.value); 
            // Ou: const playlistToSave = currentPlaylist; se confiar apenas nas modificações programáticas

            const response = await fetch('manage_playlist.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(playlistToSave) // Envia o objeto da playlist, não a string da textarea diretamente se não quiser
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                displayStatus(result.message || 'Playlist salva com sucesso!', 'success');
            } else {
                displayStatus(`Erro ao salvar playlist: ${result.message || 'Erro desconhecido.'}`, 'error');
            }
        } catch (error) {
            displayStatus(`Erro na requisição ao salvar: ${error.message}`, 'error');
        }
    });

    // Carrega a playlist ao iniciar (opcional)
    // fetchPlaylist(); 
});