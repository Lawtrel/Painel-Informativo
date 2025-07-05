<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AdminPainel - Login</title>
    <link rel="stylesheet" href="login.css" />
  </head>
  <body>
    <div class="container">
        <h1>Login do AdminPainel</h1>
        <?php
        // Exibe mensagens de erro, se houver
        if (isset($_GET['error'])) {
            echo '<div class="status error">' . htmlspecialchars($_GET['error']) . '</div>';
        }
        ?>
        
        <form method="POST" action="../api/handle_login.php">
            <label for="username">Usuário:</label>
            <input type="text" id="username" name="username" required>
            
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required>
            
            <button type="submit">Entrar</button>
        </form>
    </div>
  </body>
</html>
