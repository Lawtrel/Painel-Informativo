// admin/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Referências a elementos existentes
    const playlistJsonArea = document.getElementById('playlistJsonArea');
    const loadPlaylistBtn = document.getElementById('loadPlaylistBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const savePlaylistBtn = document.getElementById('savePlaylistBtn');
    const statusMessage = document.getElementById('statusMessage');

    const itemTipoInput = document.getElementById('itemTipo');
    const itemArquivoInput = document.getElementById('itemArquivo');
    const itemMensagemInput = document.getElementById('itemMensagem');
    const itemDuracaoInput = document.getElementById('itemDuracao');

    // --- NOVOS ELEMENTOS PARA DRAG-AND-DROP ---
    const dropZone = document.getElementById('dropZone');
    const uploadStatusList = document.querySelector('#uploadStatus ul');

    let currentPlaylist = null; 

    // --- LÓGICA DE DRAG-AND-DROP ---
    if (dropZone) {
        // Prevenir comportamento padrão do navegador para arrastar arquivos
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Adicionar classe visual ao arrastar sobre a área
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        // Remover classe visual ao sair da área
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        // Lidar com os arquivos soltos
        dropZone.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        await handleFiles(files);
    }

    async function handleFiles(files) {
        uploadStatusList.innerHTML = ''; // Limpa a lista de status
        const filesToUpload = [...files]; // Converte FileList para Array

        if (filesToUpload.length === 0) {
            return;
        }

        const formData = new FormData();
        filesToUpload.forEach(file => {
            formData.append('filesToUpload[]', file); // '[]' é importante para o PHP receber como um array
            const li = document.createElement('li');
            li.textContent = `Enviando ${file.name}...`;
            uploadStatusList.appendChild(li);
        });
        
        try {
            const response = await fetch('upload_handler.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erro no servidor: ${response.statusText}`);
            }

            const result = await response.json();
            updateUploadStatus(result);

        } catch (error) {
            displayStatus(`Erro crítico no upload: ${error.message}`, 'error');
        }
    }

    function updateUploadStatus(result) {
        uploadStatusList.innerHTML = ''; // Limpa a lista de "Enviando..."
        if (result && result.uploaded_files) {
            result.uploaded_files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = `${file.filename}: ${file.message}`;
                li.classList.add(file.status);
                uploadStatusList.appendChild(li);

                // Conveniência: se o upload deu certo, coloca o nome do arquivo no campo de adicionar item
                if (file.status === 'success') {
                    itemArquivoInput.value = file.filename;
                }
            });
        }
    }

    // --- LÓGICA EXISTENTE DO GERENCIADOR DE PLAYLIST ---
    
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
        statusMessage.className = `status ${type}`;
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
        if (!monitor0) {
            monitor0 = { id_monitor: 0, itens: [] };
            currentPlaylist.monitores.push(monitor0);
            currentPlaylist.monitores.sort((a,b) => a.id_monitor - b.id_monitor);
        }
        if (!Array.isArray(monitor0.itens)) {
            monitor0.itens = [];
        }

        const newItem = {
            tipo: itemTipoInput.value.trim() || "imagem",
            duracao_s: parseInt(itemDuracaoInput.value) || 10
        };

        if (newItem.tipo === "texto_simples") {
            newItem.mensagem = itemMensagemInput.value.trim() || "Texto Padrão";
            newItem.cor_fundo = "#333333";
            newItem.cor_texto = "#FFFFFF";
        } else {
            newItem.arquivo = itemArquivoInput.value.trim() || "imagem_padrao.jpg";
        }

        monitor0.itens.push(newItem);
        currentPlaylist.ultima_atualizacao = new Date().toISOString();
        playlistJsonArea.value = JSON.stringify(currentPlaylist, null, 2);
        displayStatus('Item de exemplo adicionado ao Monitor 0. Clique em "Salvar Playlist" para persistir.', 'success');
    });

    savePlaylistBtn.addEventListener('click', async () => {
        if (!currentPlaylist) {
            displayStatus('Nenhuma playlist para salvar. Carregue ou modifique uma primeiro.', 'error');
            return;
        }
        try {
            const playlistToSave = JSON.parse(playlistJsonArea.value);
            const response = await fetch('manage_playlist.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playlistToSave)
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

    // Carrega a playlist ao abrir a página
    fetchPlaylist();
});
