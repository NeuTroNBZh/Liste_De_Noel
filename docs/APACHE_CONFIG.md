# Configuration Apache pour Liste de Noël

## Configuration de base (.htaccess)

```apache
# Forcer HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Protéger les fichiers sensibles
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

<Files .env>
    Order allow,deny
    Deny from all
</Files>

<Files composer.json>
    Order allow,deny
    Deny from all
</Files>

# Empêcher l'exécution de PHP dans le dossier uploads
<Directory "assets/uploads">
    php_flag engine off
    <FilesMatch "\.php$">
        Order allow,deny
        Deny from all
    </FilesMatch>
</Directory>

# Headers de sécurité
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# CSP (Content Security Policy)
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

# Configuration PHP
php_value upload_max_filesize 5M
php_value post_max_size 6M
php_flag display_errors off
php_flag log_errors on
php_value session.cookie_httponly 1
php_value session.cookie_secure 1
php_value session.use_strict_mode 1

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Bloquer les bots malveillants
RewriteCond %{HTTP_USER_AGENT} (libwww-perl|wget|python-requests|curl|scrapy) [NC]
RewriteRule .* - [F,L]
```

## Configuration VirtualHost

```apache
<VirtualHost *:80>
    ServerName liste.louis-cercle.site
    Redirect permanent / https://liste.louis-cercle.site/
</VirtualHost>

<VirtualHost *:443>
    ServerName liste.louis-cercle.site
    DocumentRoot /var/www/liste-noel
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/votre-certificat.crt
    SSLCertificateKeyFile /etc/ssl/private/votre-cle.key
    SSLCertificateChainFile /etc/ssl/certs/ca-bundle.crt
    
    # SSL Security
    SSLProtocol all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite HIGH:!aNULL:!MD5
    SSLHonorCipherOrder on
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/liste-noel-error.log
    CustomLog ${APACHE_LOG_DIR}/liste-noel-access.log combined
    
    # Directory Configuration
    <Directory /var/www/liste-noel>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Protéger le dossier includes
    <Directory /var/www/liste-noel/includes>
        Require all denied
    </Directory>
</VirtualHost>
```

## Permissions de fichiers recommandées

```bash
# Propriétaire www-data (ou apache selon votre système)
chown -R www-data:www-data /var/www/liste-noel

# Permissions pour les fichiers
find /var/www/liste-noel -type f -exec chmod 644 {} \;

# Permissions pour les dossiers
find /var/www/liste-noel -type d -exec chmod 755 {} \;

# Permissions spéciales pour le dossier uploads
chmod 755 /var/www/liste-noel/assets/uploads

# Protection du fichier .env
chmod 600 /var/www/liste-noel/.env
```
