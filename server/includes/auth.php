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
            header('Location: login.php?expired=1');
            exit();
        }
        // Não atualiza mais o login_time aqui
    } else {
        header('Location: login.php');
        exit();
    }
} else {
    header('Location: login.php');
    exit();
}
?> 