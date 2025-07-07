<?php
session_start();

$session_timeout = 20 * 60;

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    if (isset($_SESSION['login_time'])) {
        $current_time = time();
        $login_time = $_SESSION['login_time'];
        $elapsed_time = $current_time - $login_time;
        
        if ($elapsed_time > $session_timeout) {
            $_SESSION = array();
            session_destroy();
            http_response_code(401);
            echo json_encode([
                'authenticated' => false, 
                'expired' => true,
                'message' => 'Sessão expirada'
            ]);
        } else {
            $remaining_time = $session_timeout - $elapsed_time;
            http_response_code(200);
            echo json_encode([
                'authenticated' => true,
                'remaining_time' => $remaining_time,
                'login_time' => $login_time
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode(['authenticated' => false]);
    }
} else {
    http_response_code(401);
    echo json_encode(['authenticated' => false]);
}
?> 