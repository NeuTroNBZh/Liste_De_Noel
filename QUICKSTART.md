# 🚀 Guide de Démarrage Rapide

Ce guide vous permet de démarrer rapidement avec le système de Liste de Noël.

## ⚡ Installation en 5 Minutes

### 1️⃣ Cloner le Projet

```bash
git clone https://github.com/votre-username/liste-noel.git
cd liste-noel
```

### 2️⃣ Créer la Base de Données

```sql
CREATE DATABASE liste_noel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3️⃣ Configurer l'Environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos informations
nano .env  # ou vim, code, notepad, etc.
```

Remplissez au minimum :
```env
DB_HOST=localhost
DB_NAME=liste_noel
DB_USER=votre_user
DB_PASS=votre_password
ADMIN_EMAIL=votre.email@exemple.com
```

### 4️⃣ Vérifier l'Installation

Ouvrez dans votre navigateur :
```
http://localhost/liste-noel/check_installation.php
```

Suivez les instructions pour corriger les éventuelles erreurs.

### 5️⃣ Créer votre Compte Admin

```
http://localhost/liste-noel/create_admin.php
```

Cela créera automatiquement votre compte administrateur.

### 6️⃣ Vous Connecter

```
http://localhost/liste-noel/login.html
```

1. Entrez votre email (celui configuré dans `.env`)
2. Recevez le code 2FA par email
3. Créez votre mot de passe
4. Accédez au panel admin !

## 🎯 Accès Rapide

Une fois installé :

- **Page publique** : `index.html`
- **Connexion** : `login.html`
- **Ma liste** : `my-list.html` (après connexion)
- **Admin** : `admin.html` (après connexion en tant qu'admin)

## 🔧 Dépannage Express

### ❌ "Erreur de connexion à la base de données"

Vérifiez vos credentials dans `.env` :
```bash
mysql -u votre_user -p
# Puis dans MySQL :
SHOW DATABASES;
```

### ❌ "Le code 2FA n'arrive pas"

1. Vérifiez que la fonction `mail()` PHP est configurée
2. Vérifiez vos logs email : `/var/log/mail.log`
3. Utilisez un service SMTP comme SendGrid pour la production

### ❌ "Permission denied sur assets/uploads"

```bash
chmod 755 assets/uploads
chown www-data:www-data assets/uploads  # Linux
```

### ❌ "Page blanche"

Activez les erreurs temporairement :
```php
// Ajoutez au début de includes/config.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## 📱 Premiers Pas

### Créer votre Premier Souhait

1. Allez dans "Ma Liste" (`my-list.html`)
2. Cliquez sur "➕ Ajouter un souhait"
3. Remplissez les informations
4. Uploadez une image (optionnel)
5. Sauvegardez !

### Créer d'Autres Membres (Admin)

1. Allez dans le panel Admin (`admin.html`)
2. Section "👥 Gestion des membres"
3. Cliquez "➕ Ajouter un membre"
4. Entrez nom et email
5. Le membre recevra un code 2FA à sa première connexion

### Réserver un Souhait

1. Sur la page publique (`index.html`)
2. Trouvez un souhait non réservé
3. Cliquez sur "Réserver"
4. Seul vous pouvez voir que vous l'avez réservé !

## 🎨 Personnalisation Rapide

### Changer les Couleurs

Éditez `assets/css/styles.css` :
```css
:root {
    --primary-color: #2c5f2d;  /* Vert principal */
    --secondary-color: #c92a2a; /* Rouge */
}
```

### Changer le Nom du Site

Dans `.env` :
```env
SITE_NAME="Mon Super Site"
```

### Ajouter votre Logo

Remplacez `assets/images/logo.png` par votre logo.

## 🔐 Sécurité Rapide

### Pour le Développement

C'est bon tel quel ! ✅

### Pour la Production

1. **Activez HTTPS** (Let's Encrypt gratuit)
   ```bash
   sudo certbot --apache -d votre-domaine.com
   ```

2. **Protégez le .env**
   ```apache
   # .htaccess
   <Files .env>
       Order allow,deny
       Deny from all
   </Files>
   ```

3. **Désactivez les erreurs**
   ```php
   // includes/config.php
   ini_set('display_errors', 0);
   ```

4. **Supprimez les fichiers de test**
   ```bash
   rm check_installation.php
   rm create_admin.php  # après création de l'admin
   rm diagnostic.php
   rm test-*.php
   ```

## 📚 Documentation Complète

Pour plus de détails, consultez :

- [README.md](README.md) - Documentation complète
- [SECURITY.md](SECURITY.md) - Guide de sécurité
- [CONTRIBUTING.md](CONTRIBUTING.md) - Comment contribuer
- [docs/APACHE_CONFIG.md](docs/APACHE_CONFIG.md) - Config Apache
- [docs/NGINX_CONFIG.md](docs/NGINX_CONFIG.md) - Config Nginx

## 💬 Besoin d'Aide ?

1. Consultez d'abord la [documentation complète](README.md)
2. Cherchez dans les [issues GitHub](../../issues)
3. Créez une nouvelle issue si nécessaire

## 🎉 C'est Tout !

Votre système est prêt à l'emploi. Amusez-vous bien ! 🎄

---

**Tips** : Bookmarkez cette page pour un accès rapide aux commandes usuelles.
