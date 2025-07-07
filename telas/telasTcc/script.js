const MONITOR_ID = 0; // TCC
let itens = [];
let itemIndex = 0;
let timer = null;
let URL_BASE_MIDIA = '';

function criarElementoItem(item, urlBase) {
    const div = document.createElement('div');
    div.className = 'carousel-item';
    if (item.tipo === 'imagem') {
        const img = document.createElement('img');
        img.src = urlBase + item.arquivo;
        img.alt = 'Imagem do TCC';
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
        p.style.background = item.cor_fundo || '#000';
        p.style.color = item.cor_texto || '#fff';
        p.style.padding = '2em';
        p.style.fontSize = '2em';
        p.style.borderRadius = '20px';
        div.appendChild(p);
    }
    return div;
}

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
    // PrÃ³ximo item
    itemIndex = (itemIndex + 1) % itens.length;
    const duracao = (item.duracao_s || 5) * 1000;
    timer = setTimeout(mostrarItemAtual, duracao);
}

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

const LINK_QRCODE = "https://unead.uneb.br/index.php/teses-dissertacoes/";

function carregarPlaylist() {
    fetch('../../conteudo_simulado_ftp/playlist.json')
        .then(response => response.json())
        .then(data => {
            URL_BASE_MIDIA = data.config_geral.url_base_midia_http;
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

document.addEventListener('DOMContentLoaded', () => {
    carregarPlaylist();
    gerarQRCode(LINK_QRCODE);
});