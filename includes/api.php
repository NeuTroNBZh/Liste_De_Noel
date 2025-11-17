<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';
require_once 'auth.php';
require_once 'email.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Fonction pour uploader une image
function uploadImage($file) {
    $uploadDir = '../assets/uploads/';
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if (!isset($file['error']) || is_array($file['error'])) {
        throw new Exception('Invalid parameters.');
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Upload failed with error code ' . $file['error']);
    }

    if ($file['size'] > $maxSize) {
        throw new Exception('File size exceeds maximum limit of 5MB');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG, GIF and WebP are allowed.');
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        throw new Exception('Failed to move uploaded file.');
    }

    return 'assets/uploads/' . $filename;
}

// Fonction pour générer un ID unique
function generateId() {
    return uniqid() . bin2hex(random_bytes(8));
}

try {
    switch ($action) {
        // ============ MEMBRES ============
        
        case 'getMembers':
            $stmt = $pdo->query("SELECT id, name, email, role, created_at FROM members ORDER BY name ASC");
            $members = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $members]);
            break;

        case 'getMember':
            $id = $_GET['id'] ?? '';
            $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM members WHERE id = ?");
            $stmt->execute([$id]);
            $member = $stmt->fetch();
            
            if ($member) {
                echo json_encode(['success' => true, 'data' => $member]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Membre introuvable']);
            }
            break;

        case 'addMember':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO members (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)");
            
            $id = generateId();
            $hashedPassword = !empty($data['password']) ? password_hash($data['password'], PASSWORD_DEFAULT) : null;
            
            $stmt->execute([
                $id,
                $data['name'],
                $data['email'] ?? null,
                $hashedPassword,
                $data['role'] ?? 'member'
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Membre ajouté', 'id' => $id]);
            break;

        case 'updateMember':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!empty($data['password'])) {
                $stmt = $pdo->prepare("UPDATE members SET name=?, email=?, password=?, role=? WHERE id=?");
                $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                $stmt->execute([
                    $data['name'],
                    $data['email'] ?? null,
                    $hashedPassword,
                    $data['role'] ?? 'member',
                    $data['id']
                ]);
            } else {
                $stmt = $pdo->prepare("UPDATE members SET name=?, email=?, role=? WHERE id=?");
                $stmt->execute([
                    $data['name'],
                    $data['email'] ?? null,
                    $data['role'] ?? 'member',
                    $data['id']
                ]);
            }
            
            echo json_encode(['success' => true, 'message' => 'Membre modifié']);
            break;

        case 'deleteMember':
            $id = $_GET['id'] ?? '';
            
            // Supprimer tous les souhaits du membre
            $stmt = $pdo->prepare("DELETE FROM wishes WHERE member_id = ?");
            $stmt->execute([$id]);
            
            // Supprimer le membre
            $stmt = $pdo->prepare("DELETE FROM members WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Membre et ses souhaits supprimés']);
            break;

        case 'requestCode':
            $data = json_decode(file_get_contents('php://input'), true);
            $email = strtolower(trim($data['email']));
            
            // Vérifier si l'email est autorisé
            if (!isEmailAllowed($email)) {
                echo json_encode(['success' => false, 'message' => 'Cet email n\'est pas autorisé à accéder au site']);
                break;
            }
            
            // Récupérer le membre
            $stmt = $pdo->prepare("SELECT * FROM members WHERE email = ?");
            $stmt->execute([$email]);
            $member = $stmt->fetch();
            
            if (!$member) {
                echo json_encode(['success' => false, 'message' => 'Email non trouvé']);
                break;
            }
            
            // Générer et envoyer le code
            $code = generateVerificationCode();
            
            if (storeVerificationCode($email, $code)) {
                if (sendVerificationEmail($email, $member['name'], $code)) {
                    cleanupExpiredCodes(); // Nettoyer les anciens codes
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Code envoyé par email',
                        'needsPassword' => empty($member['password'])
                    ]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'envoi de l\'email']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Erreur lors de la génération du code']);
            }
            break;

        case 'verifyCode':
            $data = json_decode(file_get_contents('php://input'), true);
            $email = strtolower(trim($data['email']));
            $code = $data['code'];
            
            if (verifyCode($email, $code)) {
                // Code valide, récupérer le membre
                $stmt = $pdo->prepare("SELECT * FROM members WHERE email = ?");
                $stmt->execute([$email]);
                $member = $stmt->fetch();
                
                if ($member) {
                    // Si pas de mot de passe, demander d'en créer un
                    if (empty($member['password'])) {
                        echo json_encode([
                            'success' => true,
                            'needsPassword' => true,
                            'message' => 'Code vérifié, créez votre mot de passe',
                            'memberId' => $member['id']
                        ]);
                    } else {
                        // Connecter directement
                        login($member['id'], $member['name'], $member['role']);
                        echo json_encode([
                            'success' => true,
                            'needsPassword' => false,
                            'message' => 'Connexion réussie',
                            'user' => [
                                'id' => $member['id'],
                                'name' => $member['name'],
                                'role' => $member['role']
                            ]
                        ]);
                    }
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Code invalide ou expiré']);
            }
            break;

        case 'setPassword':
            $data = json_decode(file_get_contents('php://input'), true);
            $memberId = $data['memberId'];
            $password = $data['password'];
            
            if (strlen($password) < 6) {
                echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères']);
                break;
            }
            
            // Mettre à jour le mot de passe
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE members SET password = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $memberId]);
            
            // Récupérer le membre et le connecter
            $stmt = $pdo->prepare("SELECT * FROM members WHERE id = ?");
            $stmt->execute([$memberId]);
            $member = $stmt->fetch();
            
            if ($member) {
                login($member['id'], $member['name'], $member['role']);
                echo json_encode([
                    'success' => true,
                    'message' => 'Mot de passe créé et connexion réussie',
                    'user' => [
                        'id' => $member['id'],
                        'name' => $member['name'],
                        'role' => $member['role']
                    ]
                ]);
            }
            break;

        case 'login':
            $data = json_decode(file_get_contents('php://input'), true);
            $email = strtolower(trim($data['email']));
            
            $stmt = $pdo->prepare("SELECT * FROM members WHERE email = ?");
            $stmt->execute([$email]);
            $member = $stmt->fetch();
            
            if ($member && !empty($member['password']) && password_verify($data['password'], $member['password'])) {
                login($member['id'], $member['name'], $member['role']);
                echo json_encode([
                    'success' => true, 
                    'message' => 'Connexion réussie',
                    'user' => [
                        'id' => $member['id'],
                        'name' => $member['name'],
                        'role' => $member['role']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
            }
            break;

        case 'logout':
            logout();
            echo json_encode(['success' => true, 'message' => 'Déconnexion réussie']);
            break;

        case 'getCurrentUser':
            if (isLoggedIn()) {
                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => $_SESSION['user_id'],
                        'name' => $_SESSION['user_name'],
                        'role' => $_SESSION['role']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Non connecté']);
            }
            break;

        // ============ SOUHAITS ============
        
        case 'getAll':
            $memberId = $_GET['member_id'] ?? '';
            
            if ($memberId) {
                $stmt = $pdo->prepare("SELECT w.*, m.name as member_name, r.name as reserved_by_name 
                                      FROM wishes w 
                                      LEFT JOIN members m ON w.member_id = m.id
                                      LEFT JOIN members r ON w.reserved_by = r.id
                                      WHERE w.member_id = ? 
                                      ORDER BY w.favorite DESC, w.created_at DESC");
                $stmt->execute([$memberId]);
            } else {
                $stmt = $pdo->query("SELECT w.*, m.name as member_name, r.name as reserved_by_name 
                                   FROM wishes w 
                                   LEFT JOIN members m ON w.member_id = m.id
                                   LEFT JOIN members r ON w.reserved_by = r.id
                                   ORDER BY w.favorite DESC, w.created_at DESC");
            }
            
            $wishes = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $wishes]);
            break;

        case 'uploadImage':
            if (!isset($_FILES['image'])) {
                throw new Exception('No file uploaded');
            }
            
            $imagePath = uploadImage($_FILES['image']);
            echo json_encode(['success' => true, 'path' => $imagePath]);
            break;

        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Vérifier que member_id est fourni
            if (empty($data['member_id'])) {
                throw new Exception('member_id est requis');
            }
            
            $stmt = $pdo->prepare("INSERT INTO wishes (id, name, category, price, link, image, description, favorite, member_id) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $id = generateId();
            $stmt->execute([
                $id,
                $data['name'],
                $data['category'],
                $data['price'],
                $data['link'] ?? '',
                $data['image'] ?? '',
                $data['description'] ?? '',
                $data['favorite'] ? 1 : 0,
                $data['member_id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait ajouté', 'id' => $id]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("UPDATE wishes SET name=?, category=?, price=?, link=?, image=?, description=?, favorite=?, member_id=? 
                                   WHERE id=?");
            
            $stmt->execute([
                $data['name'],
                $data['category'],
                $data['price'],
                $data['link'] ?? '',
                $data['image'] ?? '',
                $data['description'] ?? '',
                $data['favorite'] ? 1 : 0,
                $data['member_id'] ?? '',
                $data['id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait modifié']);
            break;

        case 'reserve':
            $id = $_GET['id'] ?? '';
            $reservedBy = $_GET['reserved_by'] ?? null;
            
            $stmt = $pdo->prepare("UPDATE wishes SET reserved_by = ? WHERE id = ?");
            $stmt->execute([$reservedBy, $id]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait réservé']);
            break;

        case 'unreserve':
            $id = $_GET['id'] ?? '';
            
            $stmt = $pdo->prepare("UPDATE wishes SET reserved_by = NULL WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Réservation annulée']);
            break;

        case 'delete':
            $id = $_GET['id'] ?? '';
            
            // Récupérer l'image avant de supprimer
            $stmt = $pdo->prepare("SELECT image FROM wishes WHERE id = ?");
            $stmt->execute([$id]);
            $wish = $stmt->fetch();
            
            // Supprimer l'image si elle existe et est locale
            if ($wish && $wish['image'] && strpos($wish['image'], 'assets/uploads/') === 0) {
                $imagePath = '../' . $wish['image'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
            
            $stmt = $pdo->prepare("DELETE FROM wishes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait supprimé']);
            break;

        case 'initialize':
            // Vérifier si des membres existent, sinon créer un membre par défaut
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM members");
            $memberResult = $stmt->fetch();
            
            $defaultMemberId = null;
            
            if ($memberResult['count'] == 0) {
                // Créer un membre par défaut
                $defaultMemberId = generateId();
                $stmt = $pdo->prepare("INSERT INTO members (id, name, email, role) VALUES (?, ?, ?, ?)");
                $stmt->execute([$defaultMemberId, 'Louis Cerclé', null, 'admin']);
            } else {
                // Récupérer le premier membre
                $stmt = $pdo->query("SELECT id FROM members LIMIT 1");
                $member = $stmt->fetch();
                $defaultMemberId = $member['id'];
            }
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM wishes");
            $result = $stmt->fetch();
            
            if ($result['count'] == 0) {
                $initialWishes = [
                    [
                        'name' => 'SONOFF Zigbee/Thread PoE Dongle Max',
                        'category' => 'Technologie',
                        'price' => '<100',
                        'link' => 'https://amzn.eu/d/3h9sOch',
                        'description' => 'Compatible Ethernet, Wi-FI et USB, Passerelle Zigbee avec EFR32MG24&EFR32D0',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'USB Edge TPU ML Accelerator',
                        'category' => 'Technologie',
                        'price' => '<100',
                        'link' => 'https://amzn.eu/d/cLPwzau',
                        'description' => 'Coprocesseur pour Raspberry Pi et ordinateurs embarqués',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'UGREEN Chargeur Induction',
                        'category' => 'Technologie',
                        'price' => '<50',
                        'link' => 'https://www.amazon.fr/UGREEN-Chargeur-Induction-Compatible-Magnétique/dp/B0CWV3SFVV',
                        'description' => 'Compatible MagSafe magnétique',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Chargeur iPhone USB-C',
                        'category' => 'Technologie',
                        'price' => '<20',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Kit de Soudure avec Multimètre',
                        'category' => 'Technologie',
                        'price' => '<50',
                        'link' => 'https://www.amazon.fr/SREMTCH-Électrique-Précision-Temperature-Multimètre/dp/B09NQ161FT',
                        'description' => 'Fer à souder électrique de précision',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Sac à dos pour les cours',
                        'category' => 'Vêtements / Accessoires',
                        'price' => '<50',
                        'link' => '',
                        'description' => 'Qui puisse contenir mon PC',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Maillot Alternate Vitality 2025',
                        'category' => 'Vêtements / Accessoires',
                        'price' => '<100',
                        'link' => 'https://vitality.gg/products/maillot-alternate-vitality-2025',
                        'description' => '',
                        'favorite' => 1,
                        'image' => ''
                    ],
                    [
                        'name' => 'Chaussures de sport',
                        'category' => 'Vêtements / Accessoires',
                        'price' => '<100',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Gants',
                        'category' => 'Vêtements / Accessoires',
                        'price' => '<20',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Couverture lestée',
                        'category' => 'Maison / Décoration',
                        'price' => '<100',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Kit de crochetage',
                        'category' => 'Expériences',
                        'price' => '<50',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Réparation de mes clés de voiture',
                        'category' => 'Autres',
                        'price' => '<50',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'Mettre des piles dans mes montres',
                        'category' => 'Autres',
                        'price' => '<20',
                        'link' => '',
                        'description' => '',
                        'favorite' => 0,
                        'image' => ''
                    ]
                ];

                $stmt = $pdo->prepare("INSERT INTO wishes (id, name, category, price, link, image, description, favorite, member_id) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($initialWishes as $wish) {
                    $stmt->execute([
                        generateId(),
                        $wish['name'],
                        $wish['category'],
                        $wish['price'],
                        $wish['link'],
                        $wish['image'],
                        $wish['description'],
                        $wish['favorite'],
                        $defaultMemberId
                    ]);
                }

                echo json_encode(['success' => true, 'message' => 'Données initialisées']);
            } else {
                echo json_encode(['success' => true, 'message' => 'Données déjà présentes']);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
