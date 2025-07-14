<?php
// api/upload_handler.php (versão atualizada com renomeação)

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php'; // Garante que o utilizador está logado

$response = [
    'success' => false,
    'message' => 'Nenhum ficheiro enviado.',
    'uploaded_files' => []
];

$target_dir = SIMULATED_FTP_DIR;

// Verifica se o diretório de destino existe e tem permissão de escrita
if (!is_dir($target_dir) || !is_writable($target_dir)) {
    $response['message'] = 'Erro: O diretório de destino não existe ou não tem permissão de escrita.';
    http_response_code(500);
    echo json_encode($response);
    exit;
}

if (!empty($_FILES['filesToUpload'])) {
    $response['success'] = true;
    $response['message'] = 'Processamento de upload concluído.';
    $files = $_FILES['filesToUpload'];

    $file_count = count($files['name']);
    for ($i = 0; $i < $file_count; $i++) {
        $original_name = basename($files['name'][$i]);
        $tmp_name = $files['tmp_name'][$i];
        $upload_error = $files['error'][$i];

        // Obter o monitorId enviado pelo formulário
        $monitor_id = $_POST['monitorId'] ?? 'unknown';

        if ($upload_error === UPLOAD_ERR_OK) {
            // Gerar o novo nome do ficheiro
            $file_extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
            $timestamp = time();
            $new_filename = "monitor_{$monitor_id}_{$timestamp}.{$file_extension}";
            $target_file = $target_dir . $new_filename;

            if (move_uploaded_file($tmp_name, $target_file)) {
                $response['uploaded_files'][] = [
                    'filename' => $new_filename, // Retorna o NOVO nome
                    'original_filename' => $original_name,
                    'status' => 'success',
                    'message' => 'Ficheiro enviado e renomeado com sucesso.'
                ];
            } else {
                $response['uploaded_files'][] = [
                    'original_filename' => $original_name,
                    'status' => 'error',
                    'message' => 'Erro ao mover o ficheiro para o destino.'
                ];
            }
        } else {
             $response['uploaded_files'][] = [
                'original_filename' => $original_name,
                'status' => 'error',
                'message' => 'Erro no upload: ' . $upload_error
            ];
        }
    }
}

echo json_encode($response);
?>