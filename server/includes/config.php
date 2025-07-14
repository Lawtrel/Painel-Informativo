<?php

// Carregar as configurações do arquivo .env
$env_path = __DIR__ . '/../../.env';
if (file_exists($env_path)) {
    $env = parse_ini_file($env_path);
} else {
    // Fallback para ambiente de desenvolvimento se .env não existir
    $env = [
        'ENVIRONMENT' => 'development',
        'ADMIN_USERNAME' => 'administrator',
        'ADMIN_PASSWORD' => ';exB.Y35&Q/1'
    ];
}

// Define o ambiente (production ou development)
define('ENVIRONMENT', $env['ENVIRONMENT'] ?? 'development');

// Configurações do FTP
if (ENVIRONMENT === 'production') {
    define('FTP_SERVER', $env['FTP_SERVER']);
    define('FTP_USERNAME', $env['FTP_USERNAME']);
    define('FTP_PASSWORD', $env['FTP_PASSWORD']);
    define('FTP_CONTENT_DIR', $env['FTP_CONTENT_DIR']);
}


//Diretório local (em modo Desenvolvimento)
define('SIMULATED_FTP_DIR', __DIR__ . '/../../conteudo_simulado_ftp/');
define('PLAYLIST_FILENAME', 'playlist.json');

// URL base para acessar os arquivos de mídia via HTTP
// Em produção, isso deve apontar para a URL real do seu conteúdo FTP
if (ENVIRONMENT === 'production') {
    define('HTTP_MEDIA_BASE_URL', 'http://' . FTP_SERVER . rtrim(FTP_CONTENT_DIR, '/') . '/');
} else {
    define('HTTP_MEDIA_BASE_URL', 'http://54.233.18.117/Painel-Informativo/conteudo_simulado_ftp/');
}

// Credenciais do painel de administração
define('ADMIN_USERNAME', $env['ADMIN_USERNAME']);
define('ADMIN_PASSWORD', $env['ADMIN_PASSWORD']);
?>