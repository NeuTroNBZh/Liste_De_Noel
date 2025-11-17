<?php
// Démarrer la session si elle n'est pas déjà démarrée
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Vérifier si l'utilisateur est admin
function isAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

// Vérifier si l'utilisateur actuel est le propriétaire ou admin
function canEdit($memberId) {
    if (!isLoggedIn()) {
        return false;
    }
    return isAdmin() || $_SESSION['user_id'] === $memberId;
}

// Obtenir l'ID de l'utilisateur connecté
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Obtenir le rôle de l'utilisateur connecté
function getCurrentUserRole() {
    return $_SESSION['role'] ?? null;
}

// Connexion utilisateur
function login($userId, $name, $role) {
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['role'] = $role;
    $_SESSION['login_time'] = time();
}

// Déconnexion utilisateur
function logout() {
    session_unset();
    session_destroy();
}

// Vérifier les actions qui nécessitent une authentification
function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Authentification requise']);
        exit;
    }
}

// Vérifier les actions qui nécessitent le rôle admin
function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accès refusé - Droits administrateur requis']);
        exit;
    }
}
?>
