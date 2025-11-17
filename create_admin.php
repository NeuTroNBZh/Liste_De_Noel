<?php
// Script pour créer l'admin avec votre email
require_once 'includes/config.php';

// Générer un ID unique
function generateId() {
    return uniqid() . bin2hex(random_bytes(8));
}

// Votre email admin (à configurer dans .env)
$adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@exemple.com';
$adminName = $_ENV['ADMIN_NAME'] ?? 'Admin';

try {
    // Vérifier si un admin avec cet email existe déjà
    $stmt = $pdo->prepare("SELECT * FROM members WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Mettre à jour pour être sûr que c'est un admin
        $stmt = $pdo->prepare("UPDATE members SET role = 'admin', name = ? WHERE email = ?");
        $stmt->execute([$adminName, $adminEmail]);
        echo "✅ Membre existant mis à jour en tant qu'admin<br>";
        echo "Email: " . $adminEmail . "<br>";
        echo "Nom: " . $adminName . "<br>";
        echo "<br>🔑 <strong>Vous pouvez maintenant vous connecter !</strong><br>";
        echo "<a href='login.html'>→ Aller à la page de connexion</a><br>";
        echo "<br>ℹ️ Utilisez votre email pour recevoir un code de vérification.";
    } else {
        // Créer un nouveau membre admin
        $id = generateId();
        $stmt = $pdo->prepare("INSERT INTO members (id, name, email, password, role) VALUES (?, ?, ?, NULL, 'admin')");
        $stmt->execute([$id, $adminName, $adminEmail]);
        
        echo "✅ Admin créé avec succès !<br>";
        echo "Email: " . $adminEmail . "<br>";
        echo "Nom: " . $adminName . "<br>";
        echo "Rôle: admin 👑<br>";
        echo "<br>🔑 <strong>Vous pouvez maintenant vous connecter !</strong><br>";
        echo "<a href='login.html' style='display: inline-block; padding: 10px 20px; background: #2c5f2d; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;'>→ Aller à la page de connexion</a><br>";
        echo "<br>ℹ️ À la première connexion :<br>";
        echo "1. Entrez votre email: <strong>" . htmlspecialchars($adminEmail) . "</strong><br>";
        echo "2. Vous recevrez un code par email<br>";
        echo "3. Créez votre mot de passe<br>";
        echo "4. Accédez à l'interface admin !";
    }
    
    // Afficher tous les membres
    echo "<br><br><h3>📋 Tous les membres :</h3>";
    $stmt = $pdo->query("SELECT id, name, email, role FROM members ORDER BY role DESC, name ASC");
    $members = $stmt->fetchAll();
    
    if (count($members) > 0) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
        echo "<tr><th>Nom</th><th>Email</th><th>Rôle</th></tr>";
        foreach ($members as $member) {
            $roleIcon = $member['role'] === 'admin' ? '👑' : '👤';
            echo "<tr>";
            echo "<td>" . htmlspecialchars($member['name']) . "</td>";
            echo "<td>" . htmlspecialchars($member['email'] ?? '(pas d\'email)') . "</td>";
            echo "<td>" . $roleIcon . " " . $member['role'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "Aucun membre trouvé.";
    }
    
} catch (PDOException $e) {
    echo "❌ Erreur : " . $e->getMessage();
}
?>
