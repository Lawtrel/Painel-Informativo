<?php
// api/get_content.php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/ftp_helper.php';

$response = ['success' => false, 'data' => null, 'error' => ''];

$conn_id = ftp_connect(FTP_SERVER);
if (!$conn_id) {
    $response['error'] = 'FTP connection failed.';
    echo json_encode($response);
    exit;
}

if (ftp_login($conn_id, FTP_USERNAME, FTP_PASSWORD)) {
    ftp_pasv($conn_id, true); // Habilitar modo passivo é geralmente necessário

    $playlist_content_string = ftp_get_playlist_content($conn_id, FTP_CONTENT_DIR, PLAYLIST_FILENAME);

    if ($playlist_content_string) {
        $playlist_data = json_decode($playlist_content_string, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $response['success'] = true;
            // Adiciona a URL base HTTP aos arquivos de mídia, se configurado
            if (defined('HTTP_MEDIA_BASE_URL') && HTTP_MEDIA_BASE_URL != '') {
                if (isset($playlist_data['monitores']) && is_array($playlist_data['monitores'])) {
                    foreach ($playlist_data['monitores'] as &$monitor) { // Passa por referência para modificar
                        if (isset($monitor['itens']) && is_array($monitor['itens'])) {
                            foreach ($monitor['itens'] as &$item) { // Passa por referência
                                if (isset($item['arquivo']) && ($item['tipo'] == 'imagem' || $item['tipo'] == 'video')) {
                                    $item['url_http'] = rtrim(HTTP_MEDIA_BASE_URL, '/') . '/' . ltrim($item['arquivo'], '/');
                                }
                            }
                        }
                    }
                }
                 // Adiciona a URL base geral ao JSON para o Pi saber
                $playlist_data['config_geral']['url_base_midia_http'] = HTTP_MEDIA_BASE_URL;
            } else {
                // Indica ao Pi que ele precisará baixar via FTP
                $playlist_data['config_geral']['usar_ftp_para_download'] = true;
                $playlist_data['config_geral']['ftp_content_dir'] = FTP_CONTENT_DIR; 
                // Não envie senhas de FTP para o Pi via esta API! O Pi deve ter suas próprias credenciais FTP (somente leitura).
            }

            $response['data'] = $playlist_data;

        } else {
            $response['error'] = 'Failed to parse playlist JSON: ' . json_last_error_msg();
        }
    } else {
        $response['error'] = 'Could not retrieve playlist file from FTP.';
    }
    ftp_close($conn_id);
} else {
    $response['error'] = 'FTP login failed.';
}

echo json_encode($response);
?>