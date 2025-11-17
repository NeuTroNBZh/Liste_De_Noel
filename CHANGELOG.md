# 📝 Changelog - Système de Listes de Noël

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.1.0] - 2024-11-17 - Préparation pour GitHub / Open Source

### 🔒 Sécurité
- Externalisation des credentials dans fichier `.env`
- Ajout de `.gitignore` complet pour protéger les données sensibles
- Création de `.env.example` comme template
- Suppression des emails et mots de passe hardcodés
- Documentation complète de sécurité dans `SECURITY.md`

### 📚 Documentation
- **README.md** complet et professionnel
  - Présentation détaillée du projet
  - Section spéciale sur l'authentification 2FA
  - Instructions d'installation complètes
  - Documentation de l'API
  - Liste des fonctionnalités
- **SECURITY.md** - Politique de sécurité et bonnes pratiques
- **CONTRIBUTING.md** - Guide de contribution
- **docs/APACHE_CONFIG.md** - Configuration Apache pour production
- **docs/NGINX_CONFIG.md** - Configuration Nginx pour production

### 🛠️ Modifications
- Mise à jour de `includes/config.php` pour charger `.env`
- Mise à jour de `includes/email.php` avec variables d'environnement
- Mise à jour de `create_admin.php` avec variables d'environnement
- Ajout du fichier `.gitkeep` dans `assets/uploads/`

### ⚠️ Breaking Changes
- Le fichier `.env` est maintenant requis pour la configuration
- Les anciennes configurations hardcodées ne fonctionneront plus

## [2.0.0] - 2024-11-14 - Système Multi-Membres

### 🎉 Ajouts majeurs

#### Backend
- **Nouvelle table `members`** pour gérer les membres de la famille
  - Champs : id, name, email, password, role, created_at
  - Support authentification (passwords hashés avec bcrypt)
  - Rôles : 'admin' et 'member'

- **Modification table `wishes`**
  - Ajout colonne `member_id` (VARCHAR 50) - Lien vers le membre propriétaire
  - Ajout colonne `reserved_by` (VARCHAR 50) - Pour marquer les cadeaux réservés
  - Index sur `member_id` et `reserved_by` pour performances
  - Migration automatique pour compatibilité avec données existantes

- **Nouveau fichier `includes/auth.php`**
  - Système d'authentification complet
  - Gestion sessions PHP
  - Fonctions : isLoggedIn(), isAdmin(), canEdit(), login(), logout()
  - Prêt à l'emploi mais pas encore utilisé dans l'UI

- **Extension API (`includes/api.php`)**
  - 9 nouveaux endpoints :
    - `getMembers` - Liste tous les membres
    - `getMember` - Détails d'un membre
    - `addMember` - Créer un membre
    - `updateMember` - Modifier un membre
    - `deleteMember` - Supprimer un membre et ses souhaits
    - `login` - Authentification
    - `logout` - Déconnexion
    - `getCurrentUser` - Infos utilisateur connecté
    - `reserve` / `unreserve` - Gestion réservations
  - Modification endpoints existants :
    - `getAll` - Support paramètre `member_id` pour filtrage
    - `add` - Requiert maintenant `member_id`
    - `update` - Support modification `member_id`
    - `initialize` - Crée un membre par défaut si aucun n'existe
  - Toutes les requêtes wishes incluent maintenant des JOIN pour récupérer `member_name` et `reserved_by_name`

#### Frontend Admin

- **Modifications `admin.html`**
  - Nouvelle section "👥 Gestion des membres" en haut de la page
  - Bouton "➕ Ajouter un membre"
  - Select pour filtrer les souhaits par membre
  - Bouton "🗑️ Supprimer le membre"
  - Nouveau champ "Membre" (obligatoire) dans le formulaire d'ajout de souhait

- **Modifications `assets/js/admin.js`**
  - Nouvelles variables globales : `currentMembers`, `selectedMemberId`
  - Nouvelles fonctions :
    - `loadMembers()` - Charge la liste des membres via API
    - `displayMemberSelect()` - Remplit les selects avec les membres
    - `addMember()` - Interface pour ajouter un membre (prompt)
    - `deleteMember()` - Supprime un membre avec confirmation
  - Fonctions modifiées :
    - `loadWishes()` - Accepte paramètre `memberId` pour filtrage
    - `displayAdminWishes()` - Affiche nom du membre et réservations
    - `handleSubmit()` - Valide et envoie `member_id`, erreur si non sélectionné
    - `editWish()` - Pré-remplit le select membre lors de l'édition
  - Initialisation étendue pour charger les membres au démarrage
  - Événement sur le filtre membre pour recharger la liste

#### Frontend Public

- **Modifications `index.html`**
  - Nouveau select "👤 Membre" dans la section filtres
  - Texte d'intro modifié pour le pluriel ("toute la famille")
  - Titre changé en "Listes de Noël 2025" (pluriel)

- **Modifications `assets/js/public.js`**
  - Nouvelle variable globale : `currentMembers`
  - Nouvelles fonctions :
    - `loadMembers()` - Charge les membres via API
    - `displayMemberSelect()` - Remplit le select avec option "Tous les membres"
  - Fonctions modifiées :
    - `loadWishes()` - Support filtrage par `memberId`
    - `displayWishes()` - Utilise le filtre membre sélectionné
    - Affichage enrichi des souhaits :
      - Badge avec nom du membre propriétaire
      - Badge "🎁 Réservé par..." si cadeau réservé
      - Classe CSS `reserved` pour styling (future implémentation CSS)
  - Initialisation étendue pour charger membres et configurer événement select

#### Documentation

- **`README_MEMBRES.md`** (nouveau)
  - Documentation technique complète
  - Structure base de données détaillée
  - Liste exhaustive des endpoints API avec exemples
  - Guide d'utilisation admin et public
  - Section authentification et sécurité
  - Évolutions futures suggérées
  - Notes de migration et compatibilité

- **`GUIDE_RAPIDE.md`** (nouveau)
  - Guide utilisateur simplifié
  - Instructions pas à pas pour première utilisation
  - Exemples concrets d'utilisation
  - Astuces et bonnes pratiques
  - FAQ courante

- **`INSTALLATION.md`** (nouveau)
  - Instructions d'installation détaillées
  - Configuration serveur et base de données
  - Recommandations de sécurité
  - Guide de migration
  - Section dépannage complète
  - Exemples de configuration pour différents hébergements

- **`test_database.sql`** (nouveau)
  - Script SQL de test avec données exemple
  - 4 membres de famille fictifs
  - 12 souhaits répartis entre les membres
  - Exemples de réservations
  - Requêtes SQL utiles pour vérification et maintenance

- **`RECAP.md`** (nouveau)
  - Récapitulatif complet de l'implémentation
  - Statistiques du projet
  - Checklist de test
  - Plan de déploiement

- **`login.html`** (nouveau)
  - Page de connexion prête à l'emploi
  - Design cohérent avec le reste du site
  - Intégration API login/logout
  - Redirection selon le rôle (admin/member)
  - Non utilisée par défaut (pour usage futur)

- **`CHANGELOG.md`** (ce fichier)
  - Historique détaillé des modifications

### 🔧 Modifications internes

#### Base de données
- Migrations automatiques dans `config.php`
- Gestion gracieuse des colonnes déjà existantes (pas d'erreur si migration déjà effectuée)
- Création automatique des index pour performances
- Support des anciens souhaits (attributs au membre par défaut)

#### API
- Toutes les réponses incluent maintenant `member_name` et `reserved_by_name`
- Meilleure gestion des erreurs avec messages explicites
- Validation stricte du `member_id` lors de l'ajout de souhaits
- Support des requêtes avec et sans filtrage pour rétrocompatibilité

#### JavaScript
- Code organisé avec variables globales claires
- Fonctions async/await pour toutes les requêtes API
- Gestion d'erreur cohérente avec try/catch
- Affichage de messages utilisateur en français
- Validation côté client avant envoi API

### ✅ Compatibilité

- **Rétrocompatible** : Le système fonctionne même sans membres créés
- **Migration automatique** : Les données existantes sont préservées
- **Pas de breaking changes** : Les anciennes URLs continuent de fonctionner
- **Progressive enhancement** : Les nouvelles fonctionnalités s'ajoutent aux existantes

### 🐛 Corrections

- Cohérence des chemins API (`includes/api.php` vs `api.php` à la racine)
- Amélioration de la robustesse des requêtes SQL
- Meilleure gestion des valeurs NULL (email, reserved_by)
- Validation des inputs avant insertion DB

### 📊 Statistiques

- **Fichiers créés :** 8 (1 PHP, 1 HTML, 4 MD, 1 SQL, 1 log)
- **Fichiers modifiés :** 6 (2 PHP, 2 JS, 2 HTML)
- **Lignes de code ajoutées :** ~800+
- **Nouveaux endpoints API :** 9
- **Nouvelles tables DB :** 1
- **Colonnes ajoutées :** 2

### 🚀 Performance

- Index sur `member_id` et `reserved_by` pour requêtes rapides
- JOIN optimisés pour récupérer noms membres en une requête
- Chargement asynchrone des membres et souhaits
- Pas de surcharge si aucun membre n'existe (fallback gracieux)

### 🔐 Sécurité

- Mots de passe hashés avec `password_hash()` (bcrypt)
- Prepared statements pour toutes les requêtes SQL
- Validation des inputs côté serveur
- Système d'authentification prêt (mais pas encore activé par défaut)
- Sessions PHP sécurisées

### 📝 Tests effectués

- ✅ Création/suppression de membres
- ✅ Ajout de souhaits avec member_id
- ✅ Filtrage par membre (admin et public)
- ✅ Édition de souhaits avec changement de membre
- ✅ Affichage des noms de membres sur les souhaits
- ✅ Migration automatique des données existantes
- ✅ Compatibilité si aucun membre n'existe
- ✅ Validation syntaxe PHP et JS (0 erreurs)

---

## [1.0.0] - Version initiale

### Fonctionnalités de base
- Affichage liste de souhaits publique
- Interface admin pour CRUD souhaits
- Catégories et filtres de prix
- Upload d'images
- Souhaits favoris
- Design responsive Noël

### Fichiers originaux
- `index.html` - Page publique
- `admin.html` - Page admin
- `script.js` / `script-new.js` - JS public
- `admin.js` / `admin-new.js` - JS admin
- `api.php` - API racine (legacy)
- `includes/api.php` - API principale
- `includes/config.php` - Configuration DB
- `assets/css/styles.css` - Styles principaux
- `assets/css/admin.css` - Styles admin
- Base de données avec table `wishes`

---

## Notes de version

### Version 2.0.0
Cette version transforme fondamentalement l'application d'une liste individuelle en un système multi-utilisateurs tout en conservant une compatibilité totale avec les données existantes.

**Migration recommandée :** Sauvegarder la base de données avant mise à jour.

**Rollback possible :** En cas de problème, restaurez la sauvegarde. Les anciennes versions des fichiers continuent de fonctionner avec la nouvelle structure DB.

---

**Contributeur :** GitHub Copilot (Claude Sonnet 4.5)  
**Date :** 14 novembre 2024  
**Type de release :** Major (2.0.0)
