let itemIndex = 0;
// Array de objetos com o caminho da imagem e o texto alternativo
const images = [
    { src: "items/foto.png", alt: "Imagem do TCC 1" },
    { src: "items/foto2.png", alt: "Imagem do TCC 2" }
];

const carouselContainer = document.querySelector('.carousel-conteiner');

function createCarouselItems() {
    images.forEach(imageData => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        carouselItem.appendChild(img);
        carouselContainer.appendChild(carouselItem);
    });
}

function showItems() {
    const items = document.querySelectorAll('.carousel-item'); // Seleciona os itens criados dinamicamente

    if (items.length === 0) {
        console.error("Nenhum slide de carrossel encontrado. Verifique suas classes HTML ou se as imagens foram carregadas.");
        return;
    }

    items.forEach(item => {
        item.style.display = 'none';
    });

    itemIndex++;
    if (itemIndex > items.length) {
        itemIndex = 1;
    }

    if (items[itemIndex - 1]) {
        items[itemIndex - 1].style.display = 'block';
    } else {
        console.error(`O slide na posição ${itemIndex - 1} é undefined. Verifique a lógica do slideIndex.`);
    }

    setTimeout(showItems, 3000);
}

// Inicia o carrossel quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    createCarouselItems(); // Cria os itens do carrossel primeiro
    showItems();
});