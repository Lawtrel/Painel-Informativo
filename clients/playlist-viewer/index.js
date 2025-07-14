document.addEventListener('DOMContentLoaded', () => {
    const displayContainer = document.getElementById('monitor0-display');
    const loadingMessage = document.querySelector('.loading-message');
    let todosOsItens = [];
    let indiceItemAtual = 0;

    async function fetchAndDisplayAll() {
        try {
            loadingMessage.textContent = 'Carregando conteúdo de todos os painéis...';
            const response = await fetch('/Painel-Informativo/conteudo_simulado_ftp/playlist.json');
            if (!response.ok) throw new Error(`Erro na rede: ${response.status}`);

            const playlist = await response.json();
            loadingMessage.style.display = 'none';

            // Junta todos os itens de todos os monitores numa única lista
            todosOsItens = playlist.monitores.flatMap(monitor => monitor.itens || []);

            if (todosOsItens.length > 0) {
                exibirProximoItem();
            } else {
                displayContainer.innerHTML = '<p>Nenhum conteúdo encontrado na playlist.</p>';
            }

        } catch (error) {
            loadingMessage.style.display = 'none';
            displayContainer.innerHTML = `<p style="color:red;">Erro ao carregar a playlist: ${error.message}</p>`;
        }
    }

    function exibirProximoItem() {
        if (todosOsItens.length === 0) return;

        const item = todosOsItens[indiceItemAtual];
        const urlBaseMidia = "http://54.233.18.117/conteudo_simulado_ftp/"; // URL base explícita
        displayContainer.innerHTML = ''; // Limpa o conteúdo anterior

        let elemento;
        if (item.tipo === 'imagem') {
            elemento = document.createElement('img');
            elemento.src = urlBaseMidia + item.arquivo;
            elemento.alt = item.arquivo;
        } else if (item.tipo === 'video') {
            elemento = document.createElement('video');
            elemento.src = urlBaseMidia + item.arquivo;
            elemento.autoplay = true;
            elemento.muted = true;
            elemento.loop = true;
        } else if (item.tipo === 'texto_simples') {
            elemento = document.createElement('div');
            elemento.className = 'text-item';
            elemento.textContent = item.mensagem;
            elemento.style.backgroundColor = item.cor_fundo || '#000';
            elemento.style.color = item.cor_texto || '#fff';
        }

        if (elemento) {
            displayContainer.appendChild(elemento);
        }

        const duracaoMs = (item.duracao_s || 10) * 1000;
        indiceItemAtual = (indiceItemAtual + 1) % todosOsItens.length; // Avança e faz loop

        setTimeout(exibirProximoItem, duracaoMs);
    }

    fetchAndDisplayAll();
});