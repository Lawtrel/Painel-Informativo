<?php
// api/logout.php
session_start(); // inicia a sessão

$_SESSION = array(); // destrói todas as variáveis de sessão
session_destroy(); // destroi a sessão

$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

if ($is_ajax) {
    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
} else {
    header('Location: ../public/admin/login.php?logout=1');
}
exit();
?>