<?php
// api/process_login.php
require_once __DIR__ . '/../includes/config.php'; // Inclui as credenciais

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_username = $_POST['username'] ?? '';
    $input_password = $_POST['password'] ?? '';

    // Verifica as credenciais
    if ($input_username === ADMIN_USERNAME && $input_password === ADMIN_PASSWORD) {
        $_SESSION['logged_in'] = true; // Define a variável de sessão
        header('Location: /Painel-Informativo/admin/index.php'); // Redireciona para a página principal do painel
        exit();
    } else {
        // Credenciais incorretas, redireciona de volta para a página de login com erro
        header('Location: /Painel-Informativo/admin/login.php?error=' . urlencode('Usuário ou senha incorretos.'));
        exit();
    }
} else {
    // Se não for uma requisição POST, redireciona para a página de login
    header('Location: /Painel-Informativo/admin/login.php');
    exit();
}

?>