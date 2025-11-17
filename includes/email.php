<?php
// Service d'envoi d'emails pour les codes de vérification
require_once 'config.php';

// Configuration email
define('SITE_NAME', $_ENV['SITE_NAME'] ?? 'Liste de Noël Famille');
define('SITE_EMAIL', $_ENV['SITE_EMAIL'] ?? 'noreply@votredomaine.fr');
define('ADMIN_EMAIL', $_ENV['ADMIN_EMAIL'] ?? 'admin@exemple.com');

/**
 * Génère un code de vérification à 6 chiffres
 */
function generateVerificationCode() {
    return sprintf('%06d', mt_rand(0, 999999));
}

/**
 * Envoie un email avec un code de vérification
 */
function sendVerificationEmail($email, $name, $code) {
    $subject = "🎄 Votre code de connexion - " . SITE_NAME;
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #2c5f2d; margin-bottom: 30px; }
            .code { font-size: 32px; font-weight: bold; color: #2c5f2d; text-align: center; background: #f0f8f0; padding: 20px; border-radius: 5px; letter-spacing: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎄 " . SITE_NAME . "</h1>
            </div>
            <p>Bonjour <strong>" . htmlspecialchars($name) . "</strong>,</p>
            <p>Voici votre code de vérification pour accéder à votre liste de Noël :</p>
            <div class='code'>" . $code . "</div>
            <p>Ce code est valable pendant <strong>15 minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez simplement cet email.</p>
            <div class='footer'>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                <p>Joyeux Noël ! 🎅✨</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . SITE_NAME . " <" . SITE_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . SITE_EMAIL . "\r\n";
    
    return mail($email, $subject, $message, $headers);
}

/**
 * Envoie un email de notification admin
 */
function sendAdminNotification($email, $action) {
    $subject = "🔔 Notification - " . SITE_NAME;
    
    $message = "
    Nouvelle activité sur votre site de liste de Noël :
    
    Email: {$email}
    Action: {$action}
    Date: " . date('d/m/Y H:i:s') . "
    
    Ceci est une notification automatique.
    ";
    
    $headers = "From: " . SITE_NAME . " <" . SITE_EMAIL . ">\r\n";
    
    return mail(ADMIN_EMAIL, $subject, $message, $headers);
}

/**
 * Vérifie si un email est dans la liste des emails autorisés
 */
function isEmailAllowed($email) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM members WHERE email = ? AND email IS NOT NULL");
    $stmt->execute([strtolower(trim($email))]);
    return $stmt->fetchColumn() > 0;
}

/**
 * Stocke un code de vérification temporaire
 */
function storeVerificationCode($email, $code) {
    global $pdo;
    
    // Créer la table si elle n'existe pas
    $pdo->exec("CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    
    // Supprimer les anciens codes de cet email
    $stmt = $pdo->prepare("DELETE FROM verification_codes WHERE email = ?");
    $stmt->execute([$email]);
    
    // Insérer le nouveau code (valide 15 minutes)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
    $stmt = $pdo->prepare("INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)");
    return $stmt->execute([$email, $code, $expiresAt]);
}

/**
 * Vérifie un code de vérification
 */
function verifyCode($email, $code) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT id FROM verification_codes 
        WHERE email = ? 
        AND code = ? 
        AND expires_at > NOW() 
        AND used = 0
    ");
    $stmt->execute([$email, $code]);
    
    if ($row = $stmt->fetch()) {
        // Marquer le code comme utilisé
        $updateStmt = $pdo->prepare("UPDATE verification_codes SET used = 1 WHERE id = ?");
        $updateStmt->execute([$row['id']]);
        return true;
    }
    
    return false;
}

/**
 * Nettoie les codes expirés (à appeler périodiquement)
 */
function cleanupExpiredCodes() {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM verification_codes WHERE expires_at < NOW() OR used = 1");
    return $stmt->execute();
}
?>
