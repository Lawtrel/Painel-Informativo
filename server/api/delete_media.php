<?php
// api/delete_media.php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php'; // Reutiliza a verificação de login

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $filename = $input['filename'] ?? null;

    if (!$filename) {
        $response['message'] = 'Nome do ficheiro não fornecido.';
        echo json_encode($response);
        exit();
    }

    // Segurança: Previne ataques de "directory traversal"
    if (strpos($filename, '..') !== false || strpos($filename, '/') !== false || strpos($filename, '\\') !== false) {
        $response['message'] = 'Nome de ficheiro inválido.';
        http_response_code(400);
        echo json_encode($response);
        exit();
    }

    $file_path = SIMULATED_FTP_DIR . $filename;

    if (file_exists($file_path)) {
        // Apaga o ficheiro
        if (unlink($file_path)) {
            // Agora, remove a referência do playlist.json
            $playlist_path = SIMULATED_FTP_DIR . PLAYLIST_FILENAME;
            if (file_exists($playlist_path)) {
                $playlist_json = file_get_contents($playlist_path);
                $playlist_data = json_decode($playlist_json, true);

                if ($playlist_data && isset($playlist_data['monitores'])) {
                    foreach ($playlist_data['monitores'] as &$monitor) {
                        // Filtra os itens, removendo o que tem o nome do ficheiro
                        $monitor['itens'] = array_values(array_filter($monitor['itens'], function($item) use ($filename) {
                            return !isset($item['arquivo']) || $item['arquivo'] !== $filename;
                        }));
                    }
                    $playlist_data['ultima_atualizacao'] = date('c');
                    file_put_contents($playlist_path, json_encode($playlist_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                    $response['message'] = "Ficheiro '$filename' e suas referências na playlist foram apagados com sucesso.";
                }
            }
            $response['success'] = true;
        } else {
            $response['message'] = 'Erro ao apagar o ficheiro no servidor.';
            http_response_code(500);
        }
    } else {
        $response['message'] = 'Ficheiro não encontrado para apagar.';
        // Se o ficheiro não existe mas ainda está na playlist, remove a referência
        // (Esta parte pode ser adicionada para consistência)
    }
} else {
    $response['message'] = 'Método não permitido. Use POST.';
    http_response_code(405);
}

echo json_encode($response);
?>