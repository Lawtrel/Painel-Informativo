// ID do monitor utilizado para filtrar os itens da playlist
const MONITOR_ID = 1; // Pode ajustar esse ID para o monitor da Biologia

// Variáveis globais para armazenar os itens, índice atual, timer e URL base dos arquivos de mídia
let itens = [];
let itemIndex = 0;
let timer = null;
let URL_BASE_MIDIA = '';

/**
 * Cria o elemento HTML correspondente ao item do carrossel.
 * Pode ser imagem, vídeo ou texto simples, dependendo do tipo do item.
 * @param {Object} item - Objeto do item da playlist
 * @param {string} urlBase - URL base para arquivos de mídia
 * @returns {HTMLElement} - Elemento HTML criado
 */
function criarElementoItem(item, urlBase) {
    const div = document.createElement('div');
    div.className = 'carousel-item';

    if (item.tipo === 'imagem') {
        const img = document.createElement('img');
        img.src = urlBase + item.arquivo;
        img.alt = 'Imagem de Biologia';
        div.appendChild(img);
    } else if (item.tipo === 'video') {
        const video = document.createElement('video');
        video.src = urlBase + item.arquivo;
        video.autoplay = true;
        video.loop = false;
        video.controls = false;
        video.muted = true;
        video.style.maxWidth = '100%';
        video.style.height = 'auto';
        div.appendChild(video);
    } else if (item.tipo === 'texto_simples') {
        const p = document.createElement('p');
        p.textContent = item.mensagem;
        p.style.background = item.cor_fundo || '#006400';
        p.style.color = item.cor_texto || '#ffffff';
        p.style.padding = '2em';
        p.style.fontSize = '2em';
        p.style.borderRadius = '20px';
        div.appendChild(p);
    }

    return div;
}

/**
 * Exibe o item atual do carrossel na tela.
 * Avança automaticamente para o próximo item após o tempo definido.
 */
function mostrarItemAtual() {
    const container = document.getElementById('carousel-container') || document.querySelector('.painel-imagem');
    if (!container || itens.length === 0) {
        container.innerHTML = '<p>Nenhum item para exibir.</p>';
        return;
    }

    container.innerHTML = '';
    const item = itens[itemIndex];
    const urlBase = URL_BASE_MIDIA;
    const elemento = criarElementoItem(item, urlBase);
    container.appendChild(elemento);

    itemIndex = (itemIndex + 1) % itens.length;
    const duracao = (item.duracao_s || 5) * 1000;
    timer = setTimeout(mostrarItemAtual, duracao);
}

/**
 * Carrega a playlist de itens a partir de um arquivo JSON externo.
 */
function carregarPlaylist() {
    fetch('/conteudo_simulado_ftp/playlist.json')
        .then(response => response.json())
        .then(data => {
            URL_BASE_MIDIA = data.config_geral.url_base_midia_http;

            const monitor = data.monitores.find(m => m.id_monitor === MONITOR_ID);
            if (monitor && monitor.itens) {
                itens = monitor.itens;
                mostrarItemAtual();
            } else {
                const container = document.getElementById('carousel-container') || document.querySelector('.painel-imagem');
                container.innerHTML = '<p>Nenhum item para exibir.</p>';
            }
        })
        .catch(err => {
            const container = document.getElementById('carousel-container') || document.querySelector('.painel-imagem');
            container.innerHTML = '<p>Erro ao carregar playlist.</p>';
            console.error(err);
        });
}

// Inicia o carrossel quando a página terminar de carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarPlaylist();
});
