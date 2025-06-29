<?php

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/config.php';

$response = [
    'success' => false,
    'message' => 'Nenhum arquivo enviado.',
    'uploaded_files' => []
];

// O diretório de destino é o nosso "FTP simulado"
$target_dir = SIMULATED_FTP_DIR;

// Verifica se o diretório de destino existe e pode ser escrito
if (!is_dir($target_dir) || !is_writable($target_dir)) {
    $response['message'] = 'Erro: O diretório de destino não existe ou não tem permissão de escrita.';
    echo json_encode($response);
    exit;
}

if (!empty($_FILES['filesToUpload'])) {
    $response['success'] = true;
    $response['message'] = 'Processamento de upload concluído.';
    $files = $_FILES['filesToUpload'];

    // Lida com múltiplos arquivos enviados
    if (is_array($files['name'])) {
        $file_count = count($files['name']);
        for ($i = 0; $i < $file_count; $i++) {
            $file_name = basename($files['name'][$i]);
            $target_file = $target_dir . $file_name;
            $tmp_name = $files['tmp_name'][$i];
            $upload_error = $files['error'][$i];

            if ($upload_error === UPLOAD_ERR_OK) {
                if (move_uploaded_file($tmp_name, $target_file)) {
                    $response['uploaded_files'][] = [
                        'filename' => $file_name,
                        'status' => 'success',
                        'message' => 'Arquivo enviado com sucesso.'
                    ];
                } else {
                    $response['uploaded_files'][] = [
                        'filename' => $file_name,
                        'status' => 'error',
                        'message' => 'Erro ao mover o arquivo para o destino.'
                    ];
                }
            } else {
                 $response['uploaded_files'][] = [
                    'filename' => $file_name,
                    'status' => 'error',
                    'message' => 'Erro no upload: ' . $upload_error
                ];
            }
        }
    }
}

echo json_encode($response);
?>