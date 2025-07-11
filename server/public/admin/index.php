<?php
require_once __DIR__ . '/../../includes/auth.php';
// Se chegou aqui, está autenticado
header('Location: dashboard.php');
exit();
