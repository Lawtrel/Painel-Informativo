<?php
// api/get_content.php
require_once __DIR__ . '/../includes/auth.php';
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/ftp_helper.php';


$response = ['success' => false, 'data' => null, 'error' => ''];
$playlist_content_string = false;

if (ENVIRONMENT === 'production') {
    // Tenta obter o conteúdo do FTP
    $conn_id = ftp_connect(FTP_SERVER);
    if ($conn_id && ftp_login($conn_id, FTP_USERNAME, FTP_PASSWORD)) {
        ftp_pasv($conn_id, true); // Habilita modo passivo
        $playlist_content_string = ftp_get_playlist_content($conn_id, FTP_CONTENT_DIR, PLAYLIST_FILENAME);
        ftp_close($conn_id);
    } else {
        $response['error'] = 'Falha ao conectar ao servidor FTP.';
    }
}

// Se não estiver em produção ou se o FTP falhar, usa o diretório local
if ($playlist_content_string === false) {
    if (ENVIRONMENT === 'development') {
        $response['error'] = ''; // Limpa o erro de FTP se estiver em dev
    }
    $playlist_file_path = SIMULATED_FTP_DIR . PLAYLIST_FILENAME;
    if (file_exists($playlist_file_path)) {
        $playlist_content_string = file_get_contents($playlist_file_path);
    } else {
         $response['error'] .= ' Arquivo playlist.json não encontrado no diretório simulado.';
    }
}


if ($playlist_content_string) {
    $playlist_data = json_decode($playlist_content_string, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $response['success'] = true;
        // Adiciona a URL HTTP completa aos arquivos de mídia
        if (isset($playlist_data['monitores']) && is_array($playlist_data['monitores'])) {
            foreach ($playlist_data['monitores'] as &$monitor) {
                if (isset($monitor['itens']) && is_array($monitor['itens'])) {
                    foreach ($monitor['itens'] as &$item) {
                        if (isset($item['arquivo']) && ($item['tipo'] == 'imagem' || $item['tipo'] == 'video')) {
                            $item['url_http'] = rtrim(HTTP_MEDIA_BASE_URL, '/') . '/' . ltrim($item['arquivo'], '/');
                        }
                    }
                }
            }
        }
        $response['data'] = $playlist_data;

    } else {
        $response['error'] = 'Erro ao decodificar o arquivo playlist.json: ' . json_last_error_msg();
    }
} else {
    if (empty($response['error'])) {
        $response['error'] = 'Não foi possível carregar o conteúdo da playlist.';
    }
}

echo json_encode($response);
?>