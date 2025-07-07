// ID do monitor que será utilizado para filtrar os itens da playlist
const MONITOR_ID = 0; // TCC

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

    // Se o item for uma imagem
    if (item.tipo === 'imagem') {
        const img = document.createElement('img');
        img.src = urlBase + item.arquivo;
        img.alt = 'Imagem do TCC';
        div.appendChild(img);

    // Se o item for um vídeo
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

    // Se o item for um texto simples
    } else if (item.tipo === 'texto_simples') {
        const p = document.createElement('p');
        p.textContent = item.mensagem;
        p.style.background = item.cor_fundo || '#000';
        p.style.color = item.cor_texto || '#fff';
        p.style.padding = '2em';
        p.style.fontSize = '2em';
        p.style.borderRadius = '20px';
        div.appendChild(p);
    }
    return div;
}

/**
 * Exibe o item atual do carrossel na tela.
 * Avança automaticamente para o próximo item após o tempo definido em 'duracao_s'.
 */
function mostrarItemAtual() {
    const container = document.getElementById('carousel-container');
    if (!container || itens.length === 0) {
        container.innerHTML = '<p>Nenhum item para exibir.</p>';
        return;
    }
    container.innerHTML = '';
    const item = itens[itemIndex];
    const urlBase = URL_BASE_MIDIA;
    const elemento = criarElementoItem(item, urlBase);
    container.appendChild(elemento);

    // Atualiza o índice para o próximo item, voltando ao início se necessário
    itemIndex = (itemIndex + 1) % itens.length;

    // Define o tempo de exibição do item (em milissegundos)
    const duracao = (item.duracao_s || 5) * 1000;
    timer = setTimeout(mostrarItemAtual, duracao);
}

/**
 * Gera um QR Code com o texto/link fornecido e exibe no elemento 'qrcode-container'.
 * @param {string} texto - Texto ou URL para o QR Code
 */
function gerarQRCode(texto) {
    const container = document.getElementById('qrcode-container');
    container.innerHTML = '';
    new QRCode(container, {
        text: texto,
        width: 100,
        height: 100,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Link que será usado para gerar o QR Code
const LINK_QRCODE = "https://unead.uneb.br/index.php/teses-dissertacoes/";

/**
 * Carrega a playlist de itens a partir de um arquivo JSON externo.
 * Filtra os itens pelo ID do monitor e inicia o carrossel.
 */
function carregarPlaylist() {
    fetch('../../conteudo_simulado_ftp/playlist.json')
        .then(response => response.json())
        .then(data => {
            // Define a URL base dos arquivos de mídia
            URL_BASE_MIDIA = data.config_geral.url_base_midia_http;

            // Procura o monitor pelo ID e obtém seus itens
            const monitor = data.monitores.find(m => m.id_monitor === MONITOR_ID);
            if (monitor && monitor.itens) {
                itens = monitor.itens;
                mostrarItemAtual();
            } else {
                document.getElementById('carousel-container').innerHTML = '<p>Nenhum item para exibir.</p>';
            }
        })
        .catch(err => {
            document.getElementById('carousel-container').innerHTML = '<p>Erro ao carregar playlist.</p>';
            console.error(err);
        });
}

// Quando a página terminar de carregar, inicia a playlist e gera o QR Code
document.addEventListener('DOMContentLoaded', () => {
    carregarPlaylist();
    gerarQRCode(LINK_QRCODE);
});