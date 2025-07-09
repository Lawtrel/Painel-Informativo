<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo</title>
    <link rel="icon" type="image/png" href="../assets/uneb-seeklogo.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    
    <link rel="stylesheet" href="css/dashboard-header.css">
    <link rel="stylesheet" href="css/dashboard-breadcrumb.css">
    <link rel="stylesheet" href="css/dashboard-footer.css">
    <link rel="stylesheet" href="css/dashboard-monitors-status.css">
    <link rel="stylesheet" href="css/dashboard-content-manager.css">
  </head>
<body>
  <div id="dashboard-content" style="display:none">
    <header class="dashboard-header">
      <div class="dashboard-header__container">
        <div class="dashboard-header__branding">
          <img src="../assets/uneb-seeklogo.png" alt="Logo UNEB" class="dashboard-header__logo" />
          <div>
            <h1 class="dashboard-header__title">Sistema de Gestão do Painel Digital</h1>
            <p class="dashboard-header__subtitle">Universidade do Estado da Bahia - UNEB</p>
          </div>
        </div>
        <div class="dashboard-header__actions">
          <span id="session-timer" class="dashboard-header__timer"></span>
          <button id="logout-btn" class="dashboard-header__logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            Sair
          </button>
        </div>
      </div>
    </header>
    <main class="dashboard-main">
      <nav class="dashboard-breadcrumb">
        <span class="dashboard-breadcrumb__icon"><i class="fas fa-home"></i></span>
        <span class="dashboard-breadcrumb__link">Painel de Controle</span>
        <span class="dashboard-breadcrumb__separator">/</span>
        <span class="dashboard-breadcrumb__current">Gestão de Conteúdo</span>
      </nav>
      <section class="dashboard-monitors-status">
        <h2 class="dashboard-monitors-status__title">
          <span class="dashboard-monitors-status__icon">
            <i class="fas fa-tv"></i>
          </span>
          Status dos Monitores
        </h2>
        <div class="dashboard-monitors-status__cards">
          <!-- Aqui vão os cards de cada monitor -->
        </div>

        <!-- Adicionar Novo Conteúdo dentro do mesmo container -->
        <div class="dashboard-content-manager__header mb-4 mt-8">
          <h2 class="dashboard-content-manager__title">
            <i class="fas fa-plus-circle"></i> Adicionar Novo Conteúdo
          </h2>
          <p class="dashboard-content-manager__desc">
            Gerencie o conteúdo que será exibido nos painéis digitais
          </p>
        </div>

        <!-- Container branco do formulário de upload -->
        <div class="upload-form-container">
          <form id="upload-form" class="upload-form">
            <div class="upload-form-row">
              <div class="upload-form-group">
                <label for="tipo-conteudo" class="upload-form-label"><i class="fas fa-file-alt"></i> Tipo de Conteúdo</label>
                <select id="tipo-conteudo" class="upload-form-select">
                  <option value="imagem">Imagem (JPG, PNG, GIF)</option>
                  <option value="video">Vídeo (MP4, WEBM, MOV)</option>
                </select>
              </div>
              <div class="upload-form-group">
                <label for="duracao" class="upload-form-label"><i class="fas fa-clock"></i> Duração de Exibição</label>
                <div class="upload-form-duracao">
                  <input type="number" id="duracao" class="upload-form-input" min="1" max="3600" value="10" />
                  <span class="upload-form-duracao-label">segundos</span>
                </div>
              </div>
              <div class="upload-form-group">
                <label for="monitor-select" class="upload-form-label"><i class="fas fa-tv"></i> Monitor</label>
                <select id="monitor-select" class="upload-form-select">
                  <!-- Opções serão populadas via JS -->
                </select>
              </div>
            </div>

            <div class="upload-area">
              <div id="file-dropzone" class="upload-dropzone">
                <input id="file-input" type="file" class="upload-input" accept="image/*,video/*" />
                <div class="upload-dropzone-content">
                  <div class="upload-dropzone-icon" id="dropzone-icon">
                    <i class="fas fa-image"></i>
                  </div>
                  <h3 class="upload-dropzone-title" id="dropzone-title">Clique ou arraste o arquivo</h3>
                  <p class="upload-dropzone-desc" id="dropzone-desc">Formatos aceitos: JPG, PNG, GIF, MP4, WEBM, MOV</p>
                  <p class="upload-dropzone-hint">Otimizado para painéis Full HD verticais (1080x1920)</p>
                  <p class="upload-dropzone-warning"><i class="fas fa-exclamation-triangle"></i> Tamanho máximo: 2MB</p>
                </div>
              </div>
              <div id="file-preview" class="upload-preview" style="display:none;"></div>
              <div id="upload-status" class="upload-status"></div>
            </div>

            <div class="upload-form-actions">
              <button type="submit" class="upload-form-submit">
                <i class="fas fa-plus"></i> Adicionar ao Monitor
              </button>
              <button type="button" class="upload-form-preview" id="preview-btn">
                <i class="fas fa-eye"></i> Visualizar
              </button>
            </div>
          </form>
        </div>
        
        <!-- Seção Salvar Alterações (como no React) -->
        <section class="dashboard-save-actions">
          <div class="dashboard-save-actions__header">
            <h2 class="dashboard-save-actions__title">
              <i class="fas fa-save"></i> Salvar Alterações
            </h2>
            <p class="dashboard-save-actions__desc">
              Após adicionar todos os itens desejados, salve as alterações para aplicá-las aos monitores
            </p>
          </div>
          <div class="dashboard-save-actions__container">
            <div class="dashboard-save-actions__info">
              <i class="fas fa-info-circle"></i>
              <div>
                <h4>Importante</h4>
                <p id="save-actions-message">
                  As alterações só serão aplicadas aos monitores após salvar. Certifique-se de revisar todo o conteúdo antes de salvar.
                </p>
              </div>
            </div>
            <div class="dashboard-save-actions__buttons">
              <button id="save-playlist-btn" class="dashboard-save-actions__save-btn" disabled>
                <i class="fas fa-save"></i>
                <span id="save-btn-text">Nada para Salvar</span>
              </button>
              <button id="reset-form-btn" class="dashboard-save-actions__reset-btn">
                <i class="fas fa-undo"></i> 
                Resetar Formulário
              </button>
            </div>
          </div>
          <div id="save-status" class="dashboard-save-actions__status"></div>
        </section>
      </section>
    </main>
    <footer class="dashboard-footer">
      <div class="dashboard-footer__container">
        <p>&copy; 2025 Universidade do Estado da Bahia (UNEB) - Todos os direitos reservados.</p>
        <p class="dashboard-footer__subtitle">Sistema de Gestão do Painel Digital</p>
      </div>
    </footer>
    <script type="module" src="js/models/Playlist.js"></script>
    <script type="module" src="js/services/PlaylistService.js"></script>
    <script type="module" src="js/controllers/DashboardController.js"></script>
    <script type="module" src="js/controllers/MonitorsStatusController.js"></script>
  </div>
</body>
</html>