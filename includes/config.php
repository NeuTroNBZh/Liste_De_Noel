<?php
// Configuration de la base de données
// Charger les variables d'environnement depuis .env si le fichier existe
if (file_exists(__DIR__ . '/../.env')) {
    $env = parse_ini_file(__DIR__ . '/../.env');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'your_database_name');
define('DB_USER', $_ENV['DB_USER'] ?? 'your_database_user');
define('DB_PASS', $_ENV['DB_PASS'] ?? 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// Connexion à la base de données
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Créer la table members si elle n'existe pas
$createMembersTable = "CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    role ENUM('member','admin') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

$pdo->exec($createMembersTable);

// Créer la table wishes si elle n'existe pas
$createWishesTable = "CREATE TABLE IF NOT EXISTS wishes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price VARCHAR(20) NOT NULL,
    link TEXT,
    image TEXT,
    description TEXT,
    favorite BOOLEAN DEFAULT 0,
    member_id VARCHAR(50) NOT NULL,
    reserved_by VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member_id (member_id),
    INDEX idx_reserved_by (reserved_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

$pdo->exec($createWishesTable);

// Migration: Ajouter les colonnes member_id et reserved_by si elles n'existent pas déjà
try {
    $pdo->exec("ALTER TABLE wishes ADD COLUMN member_id VARCHAR(50) NOT NULL DEFAULT 'default'");
} catch (PDOException $e) {
    // La colonne existe déjà
}

try {
    $pdo->exec("ALTER TABLE wishes ADD COLUMN reserved_by VARCHAR(50) DEFAULT NULL");
} catch (PDOException $e) {
    // La colonne existe déjà
}

try {
    $pdo->exec("ALTER TABLE wishes ADD INDEX idx_member_id (member_id)");
} catch (PDOException $e) {
    // L'index existe déjà
}

try {
    $pdo->exec("ALTER TABLE wishes ADD INDEX idx_reserved_by (reserved_by)");
} catch (PDOException $e) {
    // L'index existe déjà
}
?>
