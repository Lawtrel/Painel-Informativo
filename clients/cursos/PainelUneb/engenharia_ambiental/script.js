// Função principal para iniciar o painel
async function iniciarPainel() {
    // --- PASSO MAIS IMPORTANTE: DEFINA O ID DO MONITOR AQUI ---
    // Altere este número para cada painel. Use o ID correspondente
    // que aparece no painel de administração.
    // Exemplo: 0 para TCC, 1 para Biologia, 3 para Eng. de Software, etc.
    const idDoMonitorAtual = 3; // <<<<<<< ALTERE ESTE NÚMERO PARA CADA PAINEL

    const painelContainer = document.querySelector('.painel-imagem');
    if (!painelContainer) {
        console.error("Erro: O contêiner '.painel-imagem' não foi encontrado no HTML.");
        return;
    }

    try {
        // 1. Carregar o arquivo playlist.json
        const response = await fetch('/Painel-Informativo/conteudo_simulado_ftp/playlist.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const playlist = await response.json();

        // 2. Encontrar o monitor correto na playlist
        const monitor = playlist.monitores.find(m => m.id_monitor === idDoMonitorAtual);

        if (!monitor || !monitor.itens || monitor.itens.length === 0) {
            console.warn(`Nenhum item encontrado para o monitor com ID: ${idDoMonitorAtual}`);
            painelContainer.innerHTML = '<p>Nenhum conteúdo agendado para este painel.</p>';
            return;
        }

        // 3. Processar e exibir os itens do monitor encontrado
        let indiceItemAtual = 0;

        function exibirProximoItem() {
            if (monitor.itens.length === 0) return;

            const item = monitor.itens[indiceItemAtual];
            const urlBaseMidia = playlist.config_geral.url_base_midia_http;
            const urlCompleta = urlBaseMidia + item.arquivo;

            // Limpa o conteúdo anterior
            painelContainer.innerHTML = '';

            let elemento;

            if (item.tipo === 'imagem') {
                elemento = document.createElement('img');
                elemento.src = urlCompleta;
                elemento.alt = item.arquivo;
            } else if (item.tipo === 'video') {
                elemento = document.createElement('video');
                elemento.src = urlCompleta;
                elemento.autoplay = true;
                elemento.muted = true; // Autoplay geralmente requer que o vídeo esteja sem som
                elemento.loop = true;   // Faz o vídeo repetir
            }

            if (elemento) {
                painelContainer.appendChild(elemento);
            }

            // Define o tempo para o próximo item
            const duracaoMs = item.duracao_s * 1000;
            indiceItemAtual = (indiceItemAtual + 1) % monitor.itens.length; // Avança para o próximo item

            setTimeout(exibirProximoItem, duracaoMs);
        }

        exibirProximoItem(); // Inicia o ciclo de exibição

    } catch (error) {
        console.error('Erro ao carregar ou processar a playlist:', error);
        if (painelContainer) {
            painelContainer.innerHTML = '<p>Ocorreu um erro ao carregar o conteúdo.</p>';
        }
    }
}

// Inicia a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', iniciarPainel);