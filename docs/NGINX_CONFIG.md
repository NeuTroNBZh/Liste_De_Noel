# Configuration Nginx pour Liste de Noël

## Configuration Server Block

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name liste.louis-cercle.site;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name liste.louis-cercle.site;
    
    root /var/www/liste-noel;
    index index.html index.php;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/votre-certificat.crt;
    ssl_certificate_key /etc/ssl/private/votre-cle.key;
    ssl_trusted_certificate /etc/ssl/certs/ca-bundle.crt;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Headers de sécurité
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
    
    # Logs
    access_log /var/log/nginx/liste-noel-access.log;
    error_log /var/log/nginx/liste-noel-error.log;
    
    # Limites de taille
    client_max_body_size 5M;
    
    # Cacher les fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /\.env {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ composer\.(json|lock) {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Bloquer l'accès au dossier includes
    location /includes/ {
        deny all;
        return 403;
    }
    
    # Empêcher l'exécution de PHP dans uploads
    location /assets/uploads/ {
        location ~ \.php$ {
            deny all;
        }
    }
    
    # Configuration PHP-FPM
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;  # Ajuster selon votre version PHP
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Sécurité PHP
        fastcgi_param PHP_VALUE "upload_max_filesize=5M \n post_max_size=6M \n display_errors=off \n log_errors=on";
    }
    
    # Cache statique
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Bloquer les bots malveillants
    if ($http_user_agent ~* (libwww-perl|wget|python-requests|curl|scrapy)) {
        return 403;
    }
    
    # Rate limiting pour la connexion
    location /includes/api.php {
        limit_req zone=login burst=5 nodelay;
        limit_req_status 429;
        
        try_files $uri =404;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Fallback pour les URLs
    location / {
        try_files $uri $uri/ =404;
    }
}

# Rate limiting zone (à ajouter dans le contexte http de nginx.conf)
# http {
#     limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;
# }
```

## Configuration PHP-FPM (/etc/php/8.2/fpm/pool.d/liste-noel.conf)

```ini
[liste-noel]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm-liste-noel.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 20
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 10
pm.max_requests = 500

php_admin_value[upload_max_filesize] = 5M
php_admin_value[post_max_size] = 6M
php_admin_value[display_errors] = Off
php_admin_value[log_errors] = On
php_admin_value[error_log] = /var/log/php-fpm/liste-noel-error.log
php_admin_value[session.cookie_httponly] = 1
php_admin_value[session.cookie_secure] = 1
php_admin_value[session.use_strict_mode] = 1
php_admin_value[session.cookie_samesite] = "Strict"
```

## Permissions de fichiers recommandées

```bash
# Propriétaire www-data
chown -R www-data:www-data /var/www/liste-noel

# Permissions pour les fichiers
find /var/www/liste-noel -type f -exec chmod 644 {} \;

# Permissions pour les dossiers
find /var/www/liste-noel -type d -exec chmod 755 {} \;

# Permissions spéciales pour le dossier uploads
chmod 755 /var/www/liste-noel/assets/uploads

# Protection du fichier .env
chmod 600 /var/www/liste-noel/.env
chown www-data:www-data /var/www/liste-noel/.env
```

## Commandes utiles

```bash
# Tester la configuration
nginx -t

# Recharger la configuration
systemctl reload nginx

# Redémarrer Nginx
systemctl restart nginx

# Voir les logs en temps réel
tail -f /var/log/nginx/liste-noel-error.log
tail -f /var/log/nginx/liste-noel-access.log

# Vérifier le status PHP-FPM
systemctl status php8.2-fpm
```
