document.addEventListener('DOMContentLoaded', () => {

    async function carregarPlaylistDinamica() {
        const idDoMonitorAtual = 5; // ID do monitor de Mestrado
        const slideshowContainer = document.querySelector('.slideshow-wrapper');
        if (!slideshowContainer) return;

        try {
            const response = await fetch('/Painel-Informativo/conteudo_simulado_ftp/playlist.json');
            const playlist = await response.json();
            const monitor = playlist.monitores.find(m => m.id_monitor === idDoMonitorAtual);

            if (!monitor || !monitor.itens || monitor.itens.length === 0) {
                slideshowContainer.innerHTML = '<p>Nenhum slide agendado.</p>';
                return;
            }

            let indiceItemAtual = 0;
            function exibirProximoItem() {
                const item = monitor.itens[indiceItemAtual];
                const urlBaseMidia = playlist.config_geral.url_base_midia_http;
                const urlCompleta = urlBaseMidia + item.arquivo;

                slideshowContainer.innerHTML = ''; // Limpa
                let elemento;
                if (item.tipo === 'imagem') {
                    elemento = document.createElement('img');
                    elemento.src = urlCompleta;
                    elemento.style.cssText = "max-width: 100%; max-height: 400px; border-radius: 15px;";
                } else if (item.tipo === 'video') {
                    elemento = document.createElement('video');
                    elemento.src = urlCompleta;
                    elemento.autoplay = true;
                    elemento.muted = true;
                    elemento.loop = true;
                    elemento.style.cssText = "max-width: 100%; max-height: 400px; border-radius: 15px;";
                }

                if (elemento) slideshowContainer.appendChild(elemento);

                const duracaoMs = (item.duracao_s || 10) * 1000;
                indiceItemAtual = (indiceItemAtual + 1) % monitor.itens.length;
                setTimeout(exibirProximoItem, duracaoMs);
            }
            exibirProximoItem();

        } catch (error) {
            console.error("Erro ao carregar a playlist dinâmica:", error);
            slideshowContainer.innerHTML = '<p>Erro ao carregar slides.</p>';
        }
    }
    carregarPlaylistDinamica();
});