<?php
// admin/index.php
require_once __DIR__ . '/../includes/config.php'; // Inclui o arquivo de configuração
session_start(); // Inicia a sessão PHP

// Verifica se o usuário está logado
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php'); // Redireciona para a página de login
    exit();
}
?>


<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AdminPainel - Teste Local</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <div class="container">
      <h1>AdminPainel - Teste Local (Simulado)</h1>

      <h2>Playlist Atual:</h2>
      <textarea
        id="playlistJsonArea"
        readonly
        title="Playlist atual (somente leitura aqui, modificada por ações)"
      ></textarea>
      <button id="loadPlaylistBtn">Carregar Playlist Atual</button>

      <div class="item-editor">
        <h2>Adicionar Novo Item ao Monitor 0 (Exemplo)</h2>
        <label for="itemTipo">Tipo:</label>
        <input
          type="text"
          id="itemTipo"
          value="imagem"
          placeholder="imagem, video, texto_simples"
        />

        <label for="itemArquivo">Arquivo (ex: nova_imagem.jpg):</label>
        <input type="text" id="itemArquivo" value="nova_imagem.jpg" />

        <label for="itemMensagem">Mensagem (para tipo texto_simples):</label>
        <input type="text" id="itemMensagem" value="Nova Mensagem!" />

        <label for="itemDuracao">Duração (segundos):</label>
        <input type="number" id="itemDuracao" value="10" />

        <button id="addItemBtn">Adicionar Item ao Monitor 0</button>
      </div>

      <hr style="margin: 20px 0" />
      <button id="savePlaylistBtn">
        Salvar Playlist no Servidor (Simulado)
      </button>
      <button id="logoutBtn" style="background-color: #dc3545;">Sair</button>

      <div id="statusMessage" class="status" style="display: none"></div>
    </div>

    <script src="script.js"></script>
    <script>
        // Adiciona funcionalidade de logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.location.href = '../api/logout.php'; // Redireciona para o script de logout
        });
    </script>
  </body>
</html>
