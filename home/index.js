// client_display/display.js
document.addEventListener('DOMContentLoaded', () => {
    const monitor0Display = document.getElementById('monitor0-display');
    const loadingMessage = document.querySelector('.loading-message');
    let currentPlaylistData = null;
    let monitor0Items = [];
    let currentItemIndex = 0;
    let itemTimeoutId = null; // Para controlar o setTimeout

    async function fetchAndDisplayPlaylist() {
        try {
            loadingMessage.textContent = 'Carregando anúncios...';
            const response = await fetch('../api/get_content.php'); // Caminho para a API
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success && result.data) {
                loadingMessage.style.display = 'none';
                currentPlaylistData = result.data;
                
                const monitor0Data = currentPlaylistData.monitores.find(m => m.id_monitor === 0);
                
                if (monitor0Data && monitor0Data.itens && monitor0Data.itens.length > 0) {
                    monitor0Items = monitor0Data.itens;
                    currentItemIndex = 0; // Reinicia o índice
                    if (itemTimeoutId) clearTimeout(itemTimeoutId); // Limpa timeout anterior se houver
                    displayNextItem();
                } else {
                    showError('Nenhum item encontrado para o monitor 0 na playlist.');
                }
            } else {
                showError(`Erro ao carregar playlist: ${result.error || 'Formato de resposta inválido.'}`);
            }
        } catch (error) {
            showError(`Erro na requisição da playlist: ${error.message}`);
        }
    }

    function displayNextItem() {
        if (monitor0Items.length === 0) return;

        // Limpa conteúdo anterior do display
        monitor0Display.innerHTML = ''; 

        const item = monitor0Items[currentItemIndex];
        const mediaBaseUrl = currentPlaylistData.config_geral?.url_base_midia_http || '';

        if (item.tipo === 'imagem') {
            const img = document.createElement('img');
            // Usa item.url_http se já vier da API, senão constrói com base_url + arquivo
            img.src = item.url_http || (mediaBaseUrl + item.arquivo);
            img.alt = item.arquivo || 'Imagem do anúncio';
            monitor0Display.appendChild(img);
        } else if (item.tipo === 'texto_simples') {
            const textDiv = document.createElement('div');
            textDiv.classList.add('text-item');
            textDiv.textContent = item.mensagem || 'Mensagem não definida';
            textDiv.style.backgroundColor = item.cor_fundo || '#000000';
            textDiv.style.color = item.cor_texto || '#FFFFFF';
            monitor0Display.appendChild(textDiv);
        } else if (item.tipo === 'video') {
            // Simulação básica para vídeo, pode não ter autoplay ou controles no XAMPP facilmente
            const videoPlaceholder = document.createElement('div');
            videoPlaceholder.classList.add('text-item');
            videoPlaceholder.textContent = `Vídeo: ${item.arquivo || 'video_anuncio.mp4'} (duração: ${item.duracao_s}s)`;
            videoPlaceholder.style.backgroundColor = '#111';
            videoPlaceholder.style.color = '#FFF';
            monitor0Display.appendChild(videoPlaceholder);
            // Para vídeo real:
            // const video = document.createElement('video');
            // video.src = item.url_http || (mediaBaseUrl + item.arquivo);
            // video.autoplay = true; // Pode ser bloqueado pelo navegador
            // video.loop = false;
            // video.muted = true; // Autoplay geralmente requer mudo
            // video.style.maxWidth = '100%';
            // video.style.maxHeight = '100%';
            // monitor0Display.appendChild(video);
        } else {
            const unknownDiv = document.createElement('div');
            unknownDiv.classList.add('text-item');
            unknownDiv.textContent = `Tipo de item desconhecido: ${item.tipo}`;
            monitor0Display.appendChild(unknownDiv);
        }

        const duration = (parseInt(item.duracao_s) || 10) * 1000; // Converte para milissegundos

        currentItemIndex = (currentItemIndex + 1) % monitor0Items.length; // Avança e faz loop

        itemTimeoutId = setTimeout(displayNextItem, duration);
    }

    function showError(message) {
        loadingMessage.style.display = 'none'; // Esconde msg de carregamento se estiver visível
        monitor0Display.innerHTML = `<p style="color:red; font-size:1.2em;">${message}</p>`;
    }

    // Inicia o processo e configura para recarregar a playlist periodicamente
    fetchAndDisplayPlaylist();
    setInterval(fetchAndDisplayPlaylist, 60000); // Recarrega a playlist a cada 60 segundos
});