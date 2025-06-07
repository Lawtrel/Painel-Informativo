<?php
// api/logout.php
session_start(); // inicia a sessão

$_SESSION = array(); // destrói todas as variáveis de sessão

session_destroy(); // destroi a sessão
header('Location: /Painel-Informativo/admin/login.php'); // redireciona para a página de login
exit();
?>