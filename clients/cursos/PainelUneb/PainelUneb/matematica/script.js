
const imagens = [
  "imagens/1.jpg",
  "imagens/2.jpg",
  "imagens/3.jpg"
];

let index = 0;
const imgElement = document.getElementById("conteudo");

function trocarImagem() {
  imgElement.style.opacity = 0;
  setTimeout(() => {
    imgElement.src = imagens[index];
    imgElement.style.opacity = 1;
    index = (index + 1) % imagens.length;
  }, 1000);
}

setInterval(trocarImagem, 5000);
