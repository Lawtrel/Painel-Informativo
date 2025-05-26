// Espera que todo o HTML esteja carregado antes de executar o script
document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleciona todas as 'telas' do painel
    const telas = document.querySelectorAll('.tela');

    // 2. Define o tempo (em milissegundos) que cada tela ficará visível
    //    10000ms = 10 segundos. Podes ajustar este valor!
    const tempoDeExibicao = 1000;

    // 3. Guarda o índice da tela atual (começamos na primeira, índice 0)
    let telaAtualIndex = 0;

    // 4. Função para mostrar a próxima tela
    function mostrarProximaTela() {
        // Esconde a tela atual removendo a classe 'ativa'
        telas[telaAtualIndex].classList.remove('ativa');

        // Calcula o índice da próxima tela
        // O '%' (módulo) faz com que, ao chegar na última, volte para a primeira (0)
        telaAtualIndex = (telaAtualIndex + 1) % telas.length;

        // Mostra a nova tela adicionando a classe 'ativa'
        telas[telaAtualIndex].classList.add('ativa');
    }

    // 5. Garante que a primeira tela esteja visível quando a página carregar
    //    (O HTML já faz isso, mas é bom garantir)
    telas[telaAtualIndex].classList.add('ativa');

    // 6. Configura o 'Intervalo' para chamar a função 'mostrarProximaTela'
    //    repetidamente, a cada 'tempoDeExibicao'
    setInterval(mostrarProximaTela, tempoDeExibicao);

}); // Fim do 'DOMContentLoaded'