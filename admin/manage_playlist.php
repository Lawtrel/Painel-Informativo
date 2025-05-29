<?php
// admin/manage_playlist.php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

$response = ['success' => false, 'message' => ''];
$playlist_file_path = SIMULATED_FTP_DIR . PLAYLIST_FILENAME;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_playlist_json_string = file_get_contents('php://input');
    $new_playlist_data = json_decode($new_playlist_json_string, true); // Apenas para validar

    if (json_last_error() === JSON_ERROR_NONE && $new_playlist_data) {
        if (file_put_contents($playlist_file_path, $new_playlist_json_string)) {
            $response['success'] = true;
            $response['message'] = 'Playlist atualizada com sucesso no diretório simulado!';
        } else {
            $response['message'] = 'Erro ao salvar a playlist no diretório simulado.';
        }
    } else {
        $response['message'] = 'Dados da playlist inválidos ou erro no JSON recebido: ' . json_last_error_msg();
    }
} else {
    $response['message'] = 'Método não permitido. Use POST.';
    header('HTTP/1.0 405 Method Not Allowed');
}

echo json_encode($response);
?>