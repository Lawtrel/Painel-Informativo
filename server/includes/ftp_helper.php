<?php
// includes/ftp_helper.php

function ftp_get_playlist_content($conn_id, $remote_dir, $playlist_filename) {
    $local_temp_file = tempnam(sys_get_temp_dir(), 'playlist_');
    $remote_file_path = rtrim($remote_dir, '/') . '/' . $playlist_filename;

    if (ftp_get($conn_id, $local_temp_file, $remote_file_path, FTP_BINARY)) {
        $content = file_get_contents($local_temp_file);
        unlink($local_temp_file); // Apaga o arquivo temporário
        return $content;
    }
    return false;
}

function ftp_upload_playlist_content($conn_id, $remote_dir, $playlist_filename, $content_string) {
    $local_temp_file = tempnam(sys_get_temp_dir(), 'playlist_upload_');
    file_put_contents($local_temp_file, $content_string);
    $remote_file_path = rtrim($remote_dir, '/') . '/' . $playlist_filename;

    if (ftp_put($conn_id, $remote_file_path, $local_temp_file, FTP_BINARY)) {
        unlink($local_temp_file);
        return true;
    }
    unlink($local_temp_file);
    return false;
}
?>