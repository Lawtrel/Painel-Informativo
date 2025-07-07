<?php
// api/handle_login.php
require_once __DIR__ . '/../includes/config.php'; // Inclui as credenciais

session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input_username = $_POST['username'] ?? '';
    $input_password = $_POST['password'] ?? '';

    // Verifica as credenciais
    if ($input_username === ADMIN_USERNAME && $input_password === ADMIN_PASSWORD) {
        $_SESSION['logged_in'] = true; // Define a variável de sessão
        $_SESSION['login_time'] = time(); // Armazena o timestamp do login
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Login realizado com sucesso']);
    } else {
        // Credenciais incorretas
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuário ou senha incorretos']);
    }
} else {
    // Se não for uma requisição POST
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>