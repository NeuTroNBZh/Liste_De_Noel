<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Fonction pour générer un ID unique
function generateId() {
    return uniqid() . bin2hex(random_bytes(8));
}

try {
    switch ($action) {
        case 'getAll':
            // Récupérer tous les souhaits
            $stmt = $pdo->query("SELECT * FROM wishes ORDER BY favorite DESC, created_at DESC");
            $wishes = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $wishes]);
            break;

        case 'add':
            // Ajouter un souhait
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("INSERT INTO wishes (id, name, category, price, link, image, description, favorite) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $id = generateId();
            $stmt->execute([
                $id,
                $data['name'],
                $data['category'],
                $data['price'],
                $data['link'] ?? '',
                $data['image'] ?? '',
                $data['description'] ?? '',
                $data['favorite'] ? 1 : 0
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait ajouté', 'id' => $id]);
            break;

        case 'update':
            // Modifier un souhait
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("UPDATE wishes SET name=?, category=?, price=?, link=?, image=?, description=?, favorite=? 
                                   WHERE id=?");
            
            $stmt->execute([
                $data['name'],
                $data['category'],
                $data['price'],
                $data['link'] ?? '',
                $data['image'] ?? '',
                $data['description'] ?? '',
                $data['favorite'] ? 1 : 0,
                $data['id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait modifié']);
            break;

        case 'delete':
            // Supprimer un souhait
            $id = $_GET['id'] ?? '';
            
            $stmt = $pdo->prepare("DELETE FROM wishes WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'Souhait supprimé']);
            break;

        case 'initialize':
            // Initialiser avec les données par défaut (une seule fois)
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM wishes");
            $result = $stmt->fetch();
            
            if ($result['count'] == 0) {
                $initialWishes = [
                    [
                        'name' => 'SONOFF Zigbee/Thread PoE Dongle Max',
                        'category' => 'Technologie',
                        'price' => '<100',
                        'link' => 'https://amzn.eu/d/3h9sOch',
                        'description' => 'Compatible Ethernet, Wi-FI et USB, Passerelle Zigbee avec EFR32MG24&EFR32D0, clé Zigbee pour Home Assistant ou Zigbee2MQTT',
                        'favorite' => 0,
                        'image' => ''
                    ],
                    [
                        'name' => 'USB Edge TPU ML Accelerator',
                        'category' => 'Technologie',
                        'price' => '<100',
                        'link' => 'https://amzn.eu/d/cLPwzau',
                        'description' => 'Coprocesseur pour Raspberry Pi et Autres Ordinateurs embarqués monocarte',
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
                        'description' => 'Fer à souder électrique de précision avec multimètre',
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
                        'link' => 'https://vitality.gg/products/maillot-alternate-vitality-2025?variant=51616499401043',
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

                $stmt = $pdo->prepare("INSERT INTO wishes (id, name, category, price, link, image, description, favorite) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($initialWishes as $wish) {
                    $stmt->execute([
                        generateId(),
                        $wish['name'],
                        $wish['category'],
                        $wish['price'],
                        $wish['link'],
                        $wish['image'],
                        $wish['description'],
                        $wish['favorite']
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
