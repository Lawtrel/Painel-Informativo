let itemIndex = 0;
const items = document.querySelectorAll('.carousel-item'); // Verifica se 'slides' está realmente populado

function showItems() {
    // Primeira verificação: Garantir que temos slides para trabalhar
    if (items.length === 0) {
        console.error("Nenhum slide de carrossel encontrado. Verifique suas classes HTML.");
        return; // Sai da função se não houver slides
    }

    items.forEach(item => {
        if (item) { // Adiciona uma verificação para garantir que 'slide' não é undefined aqui também
            item.style.display = 'none';
        }
    });

    itemIndex++;
    if (itemIndex > items.length) {
        itemIndex = 1;
    }

    // Segunda verificação: Garantir que o slide atual existe
    if (items[itemIndex - 1]) {
        items[itemIndex - 1].style.display = 'block';
    } else {
        console.error(`O slide na posição ${itemIndex - 1} é undefined. Verifique a lógica do slideIndex.`);
    }

    setTimeout(showItems, 3000);
}

// Inicia o carrossel quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
    showItems();
});