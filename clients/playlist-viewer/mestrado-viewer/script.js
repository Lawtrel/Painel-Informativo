// Funções para gerenciar dados no localStorage
const STORAGE_KEY = 'mestradoData';

/**
 * Salva os dados do mestrado no localStorage.
 * @param {object} data - O objeto com os dados do mestrado a serem salvos.
 * @param {string} data.tituloTese - Título da tese.
 * @param {string} data.autor - Nome do autor principal.
 * @param {string} data.orientador - Nome do orientador.
 * @param {string} data.curso - Nome do curso.
 * @param {Array<Object>} data.autoresCarrossel - Array de objetos {nome: string, foto: string (Base64)}.
 * @param {string} data.urlQrCode - URL para o QR Code.
 */
function salvarDadosMestrado(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Dados do mestrado salvos no localStorage:', data);
    } catch (e) {
        console.error('Erro ao salvar dados no localStorage:', e);
    }
}

/**
 * Carrega os dados do mestrado do localStorage.
 * @returns {object|null} Os dados do mestrado ou null se não houver dados.
 */
function carregarDadosMestrado() {
    try {
        const dataString = localStorage.getItem(STORAGE_KEY);
        const data = dataString ? JSON.parse(dataString) : null;
        console.log('Dados do mestrado carregados do localStorage:', data);
        return data;
    } catch (e) {
        console.error('Erro ao carregar dados do localStorage:', e);
        return null;
    }
}

// --- Lógica do Carrossel de Autores (usada na exibição) ---
let currentCarouselIndex = 0;

/**
 * Move o carrossel de autores para a esquerda ou direita.
 * @param {number} direction - -1 para esquerda, 1 para direita.
 */
window.moveCarousel = function(direction) {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const items = document.querySelectorAll('.carousel-item');
    if (!carouselWrapper || items.length === 0) {
        return;
    }

    const itemStyle = getComputedStyle(items[0]);
    const itemWidth = items[0].offsetWidth +
                      parseFloat(itemStyle.marginLeft) +
                      parseFloat(itemStyle.marginRight);

    const containerWidth = carouselWrapper.parentElement.offsetWidth;
    const itemsPerPage = Math.floor(containerWidth / itemWidth);

    currentCarouselIndex += direction;

    if (currentCarouselIndex < 0) {
        currentCarouselIndex = 0;
    } else if (currentCarouselIndex > items.length - itemsPerPage) {
        currentCarouselIndex = items.length - itemsPerPage;
    }

    if (items.length <= itemsPerPage) {
        currentCarouselIndex = 0;
    }

    const offset = -currentCarouselIndex * itemWidth;
    carouselWrapper.style.transform = `translateX(${offset}px)`;
};


// --- Lógica de Inicialização e Exibição da Página Principal (index.html) ---
document.addEventListener('DOMContentLoaded', () => {
    const dadosSalvos = carregarDadosMestrado();

    // Função auxiliar para definir texto ou placeholder
    function setContentOrPlaceholder(elementId, content, placeholderText) {
        const element = document.getElementById(elementId);
        if (element) {
            if (content && content.trim() !== '') {
                element.textContent = content;
                element.classList.remove('placeholder-text');
            } else {
                element.textContent = placeholderText;
                element.classList.add('placeholder-text');
            }
        }
    }

    // Se houver dados salvos, preenche a tela
    if (dadosSalvos) {
        // Preenche as informações gerais do mestrado com placeholders se vazias
        setContentOrPlaceholder('tituloTese', dadosSalvos.tituloTese, 'Título da Tese Exemplo');
        setContentOrPlaceholder('autorTese', dadosSalvos.autor, 'Nome do Autor Principal');
        setContentOrPlaceholder('orientadorTese', dadosSalvos.orientador, 'Nome do Orientador');
        setContentOrPlaceholder('cursoMestrado', dadosSalvos.curso, 'Nome do Curso');

        // Atualiza a imagem do QR Code
        const qrCodeImg = document.getElementById('qrCodeImg');
        const urlParaQrCode = dadosSalvos.urlQrCode;

        if (qrCodeImg && urlParaQrCode && urlParaQrCode.trim() !== '') {
            const encodedUrl = encodeURIComponent(urlParaQrCode);
            const qrCodeGeneratorUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodedUrl}`;
            qrCodeImg.src = qrCodeGeneratorUrl;
            qrCodeImg.alt = `QR Code para: ${urlParaQrCode}`;
            console.log('QR Code da exibição atualizado para:', urlParaQrCode);
        } else if (qrCodeImg) {
            qrCodeImg.src = "assets/qrcodeIlustrativo.png";
            qrCodeImg.alt = "QR Code do artigo (não definido)";
            console.log('Nenhuma URL de QR Code encontrada para exibição, usando imagem ilustrativa.');
        }

        // Popula o carrossel de autores
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.innerHTML = ''; // Limpa os itens padrão HTML

            if (dadosSalvos.autoresCarrossel && dadosSalvos.autoresCarrossel.length > 0) {
                dadosSalvos.autoresCarrossel.forEach(autor => {
                    const newCarouselItem = document.createElement('div');
                    newCarouselItem.classList.add('carousel-item');

                    const img = document.createElement('img');
                    img.src = autor.foto || "assets/fotoPerfil_Ilustrativa.png"; 
                    img.alt = `Foto de ${autor.nome || 'Autor'}`; // Fallback para alt
                    
                    const p = document.createElement('p');
                    p.textContent = autor.nome || 'Nome do Autor'; // Fallback para nome
                    if (!autor.nome || autor.nome.trim() === '') { // Adiciona classe placeholder se nome vazio
                        p.classList.add('placeholder-text');
                    }

                    newCarouselItem.appendChild(img);
                    newCarouselItem.appendChild(p);
                    carouselWrapper.appendChild(newCarouselItem);
                });
            } else {
                // Se não há autores salvos, exibe os autores padrão (ilustrativos)
                carouselWrapper.innerHTML = `
                    <div class="carousel-item">
                        <img src="assets/fotoPerfil_Ilustrativa.png" alt="Autor Padrão">
                        <p class="placeholder-text">Autor Padrão 1</p>
                    </div>
                    <div class="carousel-item">
                        <img src="assets/fotoPerfil_Ilustrativa.png" alt="Autor Padrão">
                        <p class="placeholder-text">Autor Padrão 2</p>
                    </div>
                `;
            }
        }
    } else {
        // Se NENHUM dado salvo, preenche tudo com placeholders
        console.log('Nenhum dado de mestrado salvo encontrado. Exibindo valores padrão com placeholders.');
        setContentOrPlaceholder('tituloTese', '', 'Título da Tese Exemplo');
        setContentOrPlaceholder('autorTese', '', 'Nome do Autor Principal');
        setContentOrPlaceholder('orientadorTese', '', 'Nome do Orientador');
        setContentOrPlaceholder('cursoMestrado', '', 'Nome do Curso');

        // Garante que o carrossel de autores também mostre placeholders se não houver dados
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.innerHTML = `
                <div class="carousel-item">
                    <img src="assets/fotoPerfil_Ilustrativa.png" alt="Autor Padrão">
                    <p class="placeholder-text">Autor Padrão 1</p>
                </div>
                <div class="carousel-item">
                    <img src="assets/fotoPerfil_Ilustrativa.png" alt="Autor Padrão">
                    <p class="placeholder-text">Autor Padrão 2</p>
                </div>
            `;
        }
        
        // Garante que o QR Code ilustrativo apareça
        const qrCodeImg = document.getElementById('qrCodeImg');
        if(qrCodeImg) {
            qrCodeImg.src = "assets/qrcodeIlustrativo.png";
            qrCodeImg.alt = "QR Code do artigo (não definido)";
        }
    }

    // Inicializa o carrossel de autores na carga da página
    moveCarousel(0);
    window.addEventListener('resize', () => moveCarousel(0));

    // O botão de lápis foi removido do index.html, então esta lógica não é mais necessária aqui
    /*
    const btnIrParaForm = document.getElementById('btnIrParaForm');
    if (btnIrParaForm) {
        btnIrParaForm.addEventListener('click', () => {
            console.log('Botão de lápis clicado! Redirecionando para form.html...');
            window.location.href = 'form.html';
        });
    } else {
        console.error("Erro: Botão com ID 'btnIrParaForm' não encontrado em index.html.");
    }
    */
});