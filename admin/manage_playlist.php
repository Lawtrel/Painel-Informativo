<?php
// admin/manage_playlist.php
// Simples verificação de autenticação (complementar ao .htaccess ou se .htaccess não for opção)
session_start(); // Inicia a sessão para um login simples baseado em sessão PHP

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/ftp_helper.php';

// Lógica de login simples (se não usar .htaccess ou para uma camada extra)
// A equipe de frontend precisaria fazer um POST para uma página de login que define $_SESSION['loggedin']
// Esta é uma implementação BÁSICA, para produção real considere algo mais robusto
/*
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    // Se você tem uma página de login: header('Location: login.php');
    // Ou simplesmente negar acesso:
    header('HTTP/1.0 403 Forbidden');
    echo 'Acesso negado. Faça login primeiro.';
    exit;
}
*/

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // O frontend enviará o conteúdo da nova playlist como JSON no corpo da requisição
    $new_playlist_json_string = file_get_contents('php://input');
    $new_playlist_data = json_decode($new_playlist_json_string, true);

    if (json_last_error() === JSON_ERROR_NONE && $new_playlist_data) {
        // Conectar ao FTP para fazer upload
        $conn_id = ftp_connect(FTP_SERVER);
        if ($conn_id && ftp_login($conn_id, FTP_USERNAME, FTP_PASSWORD)) {
            ftp_pasv($conn_id, true);

            if (ftp_upload_playlist_content($conn_id, FTP_CONTENT_DIR, PLAYLIST_FILENAME, $new_playlist_json_string)) {
                $response['success'] = true;
                $response['message'] = 'Playlist atualizada com sucesso no FTP!';
            } else {
                $response['message'] = 'Falha ao fazer upload da nova playlist para o FTP.';
            }
            ftp_close($conn_id);
        } else {
            $response['message'] = 'Falha na conexão ou login FTP para upload.';
        }
    } else {
        $response['message'] = 'Dados da playlist inválidos ou erro no JSON recebido.';
    }
} else {
    $response['message'] = 'Método não permitido. Use POST.';
    header('HTTP/1.0 405 Method Not Allowed');
}

header('Content-Type: application/json');
echo json_encode($response);
?>