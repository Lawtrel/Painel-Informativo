<?php
// api/logout.php
session_start(); // inicia a sessão

$_SESSION = array(); // destrói todas as variáveis de sessão
session_destroy(); // destroi a sessão

header('Content-Type: application/json');
http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
?>