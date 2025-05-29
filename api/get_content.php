<?php
// api/get_content.php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

$playlist_file_path = SIMULATED_FTP_DIR . PLAYLIST_FILENAME;
$response = ['success' => false, 'data' => null, 'error' => ''];

if (file_exists($playlist_file_path)) {
    $playlist_content_string = file_get_contents($playlist_file_path);
    $playlist_data = json_decode($playlist_content_string, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $response['success'] = true;

        // Adiciona a URL HTTP completa aos arquivos de mídia para facilitar o cliente (Pi)
        if (defined('HTTP_MEDIA_BASE_URL') && HTTP_MEDIA_BASE_URL != '') {
            if (isset($playlist_data['monitores']) && is_array($playlist_data['monitores'])) {
                foreach ($playlist_data['monitores'] as &$monitor) { // Passa por referência
                    if (isset($monitor['itens']) && is_array($monitor['itens'])) {
                        foreach ($monitor['itens'] as &$item) { // Passa por referência
                            if (isset($item['arquivo']) && ($item['tipo'] == 'imagem' || $item['tipo'] == 'video')) {
                                $item['url_http'] = rtrim(HTTP_MEDIA_BASE_URL, '/') . '/' . ltrim($item['arquivo'], '/');
                            }
                        }
                    }
                }
            }
            // Garante que a config_geral tenha a url_base_midia_http
            if (!isset($playlist_data['config_geral'])) {
                $playlist_data['config_geral'] = [];
            }
            $playlist_data['config_geral']['url_base_midia_http'] = HTTP_MEDIA_BASE_URL;
        }
        $response['data'] = $playlist_data;
    } else {
        $response['error'] = 'Erro ao decodificar o arquivo playlist.json: ' . json_last_error_msg();
    }
} else {
    $response['error'] = 'Arquivo playlist.json não encontrado no diretório simulado.';
}

echo json_encode($response);
?>