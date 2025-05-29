<?php

define('FTP_SERVER', 'ftp.uneb.br'); // Ou o IP/host correto
define('FTP_USERNAME', 'seu_usuario_ftp');
define('FTP_PASSWORD', 'sua_senha_ftp');
#define('FTP_CONTENT_DIR', '/caminho_no_ftp/para_conteudo/'); // Ex: /public_html/ppgmsbPainel_conteudo/
define('SIMULATED_FTP_DIR', __DIR__ . '/../conteudo_simulado_ftp/');
define('PLAYLIST_FILENAME', 'playlist.json');

// URL base para acessar os arquivos de mídia via HTTP (SE APLICÁVEL)
// Se os arquivos FTP não são acessíveis via HTTP, deixe vazio ou comente,
// e o Pi terá que baixar via FTP.
define('HTTP_MEDIA_BASE_URL', 'http://localhost/ppgmsbPainel_local_test/conteudo_simulado_ftp/'); 

// Para o painel de administração (autenticação básica)
define('ADMIN_USERNAME', 'admin_painel');
define('ADMIN_PASSWORD', 'senha_forte_admin'); // Troque por uma senha segura!
?>