# 🎄 Liste de Noël - Système de Gestion de Contenus avec 2FA

![Status](https://img.shields.io/badge/status-learning_project-blue)
![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql)
![Security](https://img.shields.io/badge/Security-2FA-green)

> **Démo en ligne :** [liste.louis-cercle.site](https://liste.louis-cercle.site)

## 📋 À Propos

Ce projet est un **système de gestion de contenu (CMS)** développé principalement pour **apprendre à créer un panel d'administration** professionnel. Il s'agit d'un projet éducatif centré sur les aspects suivants :

- ✅ **Panel d'administration complet** pour gérer des articles/contenus
- ✅ **Authentification sécurisée avec 2FA** (authentification à deux facteurs par email)
- ✅ **Gestion multi-utilisateurs** avec système de rôles (admin/membre)
- ✅ **API RESTful** pour toutes les opérations CRUD
- ✅ **Upload et gestion d'images**
- ✅ **Interface responsive** (mobile-friendly)

### 🎯 Objectif du Projet

L'objectif était de créer un système qui pourrait être utilisé par une **entreprise pour poster des articles et des mises à jour** sur leur site web une fois livré au client. Le panel admin permet de gérer facilement le contenu sans toucher au code.

> **⚠️ Note Design :** Oui, le design est... disons "fonctionnel" pour l'instant ! 😅 Le focus a été mis sur la logique backend, la sécurité et les fonctionnalités plutôt que sur l'esthétique. Mais hey, ça fonctionne parfaitement ! 🚀

---

## 🔐 Point Fort : Authentification 2FA

L'une des fonctionnalités principales de ce projet est l'implémentation d'une **authentification à deux facteurs (2FA) par email**. Voici comment ça fonctionne :

### Processus de Connexion

1. **Saisie de l'Email**
   - L'utilisateur entre son adresse email
   - Le système vérifie si l'email est autorisé dans la base de données

2. **Génération du Code**
   - Un code à 6 chiffres est généré aléatoirement
   - Le code est stocké dans la base de données avec une expiration de 15 minutes
   - Un email HTML stylisé est envoyé à l'utilisateur

3. **Vérification du Code**
   - L'utilisateur entre le code reçu par email
   - Le système vérifie que le code correspond, n'a pas expiré et n'a pas déjà été utilisé
   - Le code est marqué comme utilisé après validation

4. **Création/Saisie du Mot de Passe**
   - Pour les nouveaux utilisateurs : création d'un mot de passe sécurisé
   - Pour les utilisateurs existants : vérification du mot de passe haché
   - Les mots de passe sont stockés avec `password_hash()` (bcrypt)

### Sécurité Implémentée

- ✅ Codes à usage unique (marqués comme utilisés après validation)
- ✅ Expiration automatique des codes après 15 minutes
- ✅ Nettoyage automatique des codes expirés
- ✅ Hachage des mots de passe avec bcrypt
- ✅ Protection CSRF avec sessions PHP
- ✅ Validation des entrées utilisateur
- ✅ Requêtes préparées pour prévenir les injections SQL

---

## 🚀 Fonctionnalités

### Pour les Membres
- 📝 Créer, modifier et supprimer leurs propres souhaits/articles
- 🖼️ Uploader des images (JPG, PNG, GIF, WebP - max 5MB)
- ⭐ Marquer des souhaits comme favoris
- 🔗 Ajouter des liens externes
- 👁️ Voir la liste publique de tous les membres

### Pour les Administrateurs
- 👥 Gestion complète des membres (création, modification, suppression)
- 📊 Vue d'ensemble de tous les contenus
- 🛡️ Accès à toutes les fonctionnalités de modération
- ⚙️ Gestion des rôles et permissions

### Système de Réservation
- 🎁 Les utilisateurs peuvent "réserver" les souhaits d'autres membres
- 🔒 Seul celui qui a réservé peut annuler sa réservation
- 👀 Système de visibilité intelligent (on ne voit pas qui a réservé nos propres souhaits)

---

## 🛠️ Technologies Utilisées

- **Backend :** PHP 8.x (vanilla, aucun framework)
- **Base de données :** MySQL/MariaDB
- **Frontend :** HTML5, CSS3, JavaScript (vanilla)
- **Email :** PHP `mail()` fonction native
- **Sécurité :** Sessions PHP, password hashing, requêtes préparées PDO

---

## 📦 Installation

### Prérequis

- PHP 8.0 ou supérieur
- MySQL 5.7 ou supérieur / MariaDB 10.3+
- Un serveur web (Apache, Nginx, etc.)
- Fonction `mail()` PHP configurée (pour la 2FA)

### Étapes d'Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-username/liste-noel.git
   cd liste-noel
   ```

2. **Configurer la base de données**
   
   Créez une base de données MySQL :
   ```sql
   CREATE DATABASE votre_nom_de_base CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Configurer les variables d'environnement**
   
   Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```
   
   Puis modifiez `.env` avec vos informations :
   ```env
   DB_HOST=localhost
   DB_NAME=votre_nom_de_base
   DB_USER=votre_utilisateur
   DB_PASS=votre_mot_de_passe
   
   SITE_NAME="Liste de Noël Famille"
   SITE_EMAIL=noreply@votredomaine.fr
   ADMIN_EMAIL=votre-email@exemple.com
   ADMIN_NAME=Votre Nom
   ```

4. **Créer les tables**
   
   Les tables sont créées automatiquement au premier lancement grâce à `includes/config.php`. Les tables créées sont :
   - `members` : utilisateurs et admins
   - `wishes` : souhaits/articles
   - `verification_codes` : codes 2FA temporaires

5. **Créer votre compte administrateur**
   
   Accédez à `create_admin.php` dans votre navigateur :
   ```
   http://votre-domaine.com/create_admin.php
   ```
   
   Ce script créera automatiquement votre compte admin avec l'email configuré dans `.env`.

6. **Configurer les permissions**
   
   Assurez-vous que le dossier `assets/uploads/` est accessible en écriture :
   ```bash
   chmod 755 assets/uploads
   ```

7. **Accéder à l'application**
   - Page publique : `index.html`
   - Connexion : `login.html`
   - Panel admin : `admin.html` (après connexion)

---

## 📁 Structure du Projet

```
.
├── assets/
│   ├── css/              # Styles CSS
│   ├── images/           # Images du site
│   ├── js/               # Scripts JavaScript
│   └── uploads/          # Images uploadées par les utilisateurs
├── includes/
│   ├── api.php           # API RESTful principale
│   ├── auth.php          # Fonctions d'authentification
│   ├── config.php        # Configuration BDD et connexion
│   └── email.php         # Service d'envoi d'emails 2FA
├── admin.html            # Interface d'administration
├── index.html            # Page publique
├── login.html            # Page de connexion
├── my-list.html          # Liste personnelle
├── create_admin.php      # Script de création admin
├── .env.example          # Template de configuration
├── .gitignore            # Fichiers à ignorer par Git
└── README.md             # Ce fichier
```

---

## 🔌 API Endpoints

L'API est accessible via `includes/api.php` avec le paramètre `?action=`.

### Members

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `?action=members` | Liste tous les membres | Non |
| GET | `?action=member&id={id}` | Détails d'un membre | Non |
| POST | `?action=create_member` | Créer un membre | Admin |
| PUT | `?action=update_member&id={id}` | Modifier un membre | Admin |
| DELETE | `?action=delete_member&id={id}` | Supprimer un membre | Admin |

### Wishes (Souhaits/Articles)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `?action=wishes` | Liste tous les souhaits | Non |
| GET | `?action=wish&id={id}` | Détails d'un souhait | Non |
| POST | `?action=create_wish` | Créer un souhait | Oui |
| PUT | `?action=update_wish&id={id}` | Modifier un souhait | Propriétaire/Admin |
| DELETE | `?action=delete_wish&id={id}` | Supprimer un souhait | Propriétaire/Admin |

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `?action=send_verification` | Envoyer un code 2FA |
| POST | `?action=verify_code` | Vérifier le code 2FA |
| POST | `?action=login` | Connexion finale avec mot de passe |
| GET | `?action=check_auth` | Vérifier la session |
| POST | `?action=logout` | Déconnexion |

### Réservations

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `?action=reserve_wish&id={id}` | Réserver un souhait | Oui |
| POST | `?action=unreserve_wish&id={id}` | Annuler une réservation | Oui |

---

## 🔒 Sécurité

Ce projet implémente plusieurs mesures de sécurité :

1. **Authentification 2FA**
   - Codes temporaires à usage unique
   - Expiration automatique (15 min)
   - Envoi sécurisé par email

2. **Gestion des Mots de Passe**
   - Hachage avec `password_hash()` (bcrypt)
   - Validation côté serveur
   - Pas de stockage en clair

3. **Base de Données**
   - Requêtes préparées (PDO)
   - Protection contre les injections SQL
   - Validation des entrées

4. **Sessions**
   - Gestion des sessions PHP
   - Vérification des permissions
   - Timeout de session

5. **Upload de Fichiers**
   - Validation du type MIME
   - Limite de taille (5MB)
   - Noms de fichiers uniques
   - Types autorisés : JPG, PNG, GIF, WebP

---

## 🎓 Ce que j'ai Appris

Ce projet m'a permis de développer mes compétences dans :

- ✅ **Architecture MVC** : Séparation claire entre logique, présentation et données
- ✅ **Sécurité Web** : Authentification, autorisation, protection CSRF/XSS/SQL injection
- ✅ **API RESTful** : Conception et implémentation d'une API propre
- ✅ **Base de données** : Modélisation, relations, optimisation (index)
- ✅ **Authentification 2FA** : Implémentation complète d'un système à deux facteurs
- ✅ **Gestion de fichiers** : Upload sécurisé et validation
- ✅ **PHP orienté objet** : Utilisation de PDO, gestion des erreurs
- ✅ **Frontend JavaScript** : Manipulation DOM, fetch API, gestion d'état

---

## 🚧 Améliorations Futures

Quelques idées pour faire évoluer le projet :

- [ ] Refonte complète du design UI/UX (le plus important ! 😄)
- [ ] Système de notifications en temps réel
- [ ] 2FA avec TOTP (Google Authenticator, etc.)
- [ ] Export des données en PDF/Excel
- [ ] Système de templates pour les emails
- [ ] Pagination pour les grandes listes
- [ ] Recherche et filtres avancés
- [ ] Mode sombre 🌙
- [ ] Tests unitaires et d'intégration
- [ ] Migration vers un framework moderne (Laravel, Symfony)

---

## 📄 Licence

Ce projet est un projet éducatif personnel. Vous êtes libre de vous en inspirer pour vos propres projets.

---

## 👤 Auteur

**Louis Cercle**

- Site web : [louis-cercle.site](https://louis-cercle.site)
- Démo du projet : [liste.louis-cercle.site](https://liste.louis-cercle.site)

---

## 🙏 Remerciements

Merci d'avoir pris le temps de consulter ce projet ! N'hésitez pas à :

- ⭐ Mettre une étoile si vous trouvez le projet intéressant
- 🐛 Signaler des bugs ou proposer des améliorations
- 💡 Partager vos idées et suggestions

---

<div align="center">
  
**Fait avec ❤️ et beaucoup de café ☕**

*"Ce n'est pas parce que c'est moche que ça ne fonctionne pas !"* 😉

</div>

## Deployment
See DEPLOY.md for server setup instructions.

## FAQ
See FAQ.md for common questions.

## Contributors
- Louis CERCLÉ-CHEMINEL
