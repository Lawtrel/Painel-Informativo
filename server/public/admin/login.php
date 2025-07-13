<?php
session_start();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");
header("Pragma: no-cache");
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Painel Informativo</title>
  <link rel="icon" type="image/png" href="assets/uneb-seeklogo.png">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/login.css">
  <link rel="stylesheet" href="assets/fonts/inter/fonts.css">
  <link rel="stylesheet" href="assets/fontawesome/css/all.min.css">
  <script type="module" src="js/controllers/LoginController.js"></script>
</head>
<body>
  <div class="login-bg"></div>
  <main class="login-container" id="login-container">
    <img src="assets/uneb-seeklogo.png" alt="Logo UNEB" class="login-logo" />
    <h1 class="login-title">Painel Informativo</h1>
    <p class="login-subtitle">
        Faça login para acessar o painel administrativo
    </p>
    <form id="loginForm" class="space-y-6" action="../../api/handle_login.php" method="POST">
      <div id="errorMsg" class="error-msg" style="display:none;">
        <i class="fas fa-exclamation-triangle"></i>
        <span></span>
      </div>
      <div class="login-input-group">
        <label for="username" class="login-label">
          <i class="fas fa-user"></i>
          Usuário
        </label>
        <div class="input-wrapper">
          <span class="input-icon"><i class="fas fa-user"></i></span>
          <input type="text" id="username" name="username" class="login-input" placeholder="Digite seu usuário" required />
        </div>
      </div>
      <div class="login-input-group">
        <label for="password" class="login-label">
          <i class="fas fa-lock"></i>
          Senha
        </label>
        <div class="input-wrapper">
          <span class="input-icon"><i class="fas fa-lock"></i></span>
          <input type="password" id="password" name="password" class="login-input" placeholder="Digite sua senha" required />
          <button type="button" id="togglePassword" class="toggle-password" title="Mostrar/ocultar senha">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <button type="submit" class="login-btn">
        <i class="fas fa-sign-in-alt"></i>
        Entrar
      </button>
      <footer class="login-footer">
        © 2025 Painel Informativo - Universidade do Estado da Bahia (UNEB)
      </footer>
    </form>
  </main>
</body>
</html> 