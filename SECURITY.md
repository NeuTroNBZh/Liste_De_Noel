# 🔐 Politique de Sécurité

## Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ce projet, merci de me la signaler de manière responsable.

**NE PAS** créer d'issue publique pour les problèmes de sécurité.

Veuillez plutôt :
1. Envoyer un email avec les détails de la vulnérabilité
2. Me laisser un délai raisonnable pour corriger le problème
3. Ne pas divulguer publiquement la vulnérabilité avant qu'elle soit corrigée

## Mesures de Sécurité Implémentées

### Authentification
- ✅ Authentification à deux facteurs (2FA) par email
- ✅ Codes à usage unique avec expiration (15 minutes)
- ✅ Hachage des mots de passe avec bcrypt (`password_hash()`)
- ✅ Sessions PHP sécurisées

### Base de Données
- ✅ Requêtes préparées PDO (protection contre les injections SQL)
- ✅ Validation et nettoyage des entrées utilisateur
- ✅ Principe du moindre privilège (séparation des rôles)

### Upload de Fichiers
- ✅ Validation du type MIME
- ✅ Limite de taille des fichiers (5MB)
- ✅ Noms de fichiers randomisés
- ✅ Types de fichiers restreints (images uniquement)

### Protection des Données
- ✅ Variables d'environnement pour les données sensibles
- ✅ Fichier `.env` exclu du dépôt Git
- ✅ Pas de credentials en dur dans le code

### Headers de Sécurité
- ⚠️ **À implémenter** : Content Security Policy (CSP)
- ⚠️ **À implémenter** : X-Frame-Options
- ⚠️ **À implémenter** : X-Content-Type-Options
- ⚠️ **À implémenter** : Strict-Transport-Security (HSTS)

## Recommandations de Déploiement

### Configuration Serveur

1. **HTTPS Obligatoire**
   ```apache
   # Apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

2. **Protéger le fichier .env**
   ```apache
   # Apache
   <Files .env>
       Order allow,deny
       Deny from all
   </Files>
   ```

3. **Désactiver l'affichage des erreurs en production**
   ```php
   // php.ini ou .htaccess
   display_errors = Off
   log_errors = On
   error_log = /path/to/error.log
   ```

4. **Limiter les tentatives de connexion**
   - Implémenter un rate limiting
   - Bloquer les IP après X tentatives échouées

### Configuration PHP

```ini
# php.ini recommandé
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
session.cookie_samesite = "Strict"
upload_max_filesize = 5M
post_max_size = 6M
```

### Base de Données

1. Créer un utilisateur dédié avec privilèges limités :
   ```sql
   CREATE USER 'liste_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
   GRANT SELECT, INSERT, UPDATE, DELETE ON liste_noel.* TO 'liste_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Sauvegardes régulières
3. Chiffrement des connexions MySQL (SSL/TLS)

## Checklist Avant Mise en Production

- [ ] Fichier `.env` configuré et protégé
- [ ] HTTPS activé et forcé
- [ ] Erreurs PHP masquées (logs uniquement)
- [ ] Utilisateur BDD avec privilèges minimaux
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring des logs d'erreur
- [ ] Rate limiting implémenté
- [ ] Headers de sécurité configurés
- [ ] Dossier uploads protégé contre l'exécution PHP
- [ ] Versions PHP et MySQL à jour

## Mises à Jour de Sécurité

### Dépendances
- PHP : Maintenir à jour (actuellement 8.x)
- MySQL/MariaDB : Appliquer les patches de sécurité
- Serveur web : Mises à jour régulières

### Audit de Code
- Révision régulière du code
- Tests de pénétration
- Utilisation d'outils d'analyse statique

## Limitations Connues

Ce projet est un **projet éducatif**. Bien que plusieurs mesures de sécurité soient implémentées, il n'a pas été audité professionnellement. Pour une utilisation en production avec des données sensibles, un audit de sécurité complet est recommandé.

### Points d'Attention

1. **Email 2FA** : La fonction PHP `mail()` n'est pas toujours fiable. Considérer un service SMTP professionnel (SendGrid, Mailgun, etc.)

2. **Rate Limiting** : Pas de limitation des tentatives de connexion actuellement. À implémenter pour la production.

3. **Logs** : Système de logging basique. Considérer une solution professionnelle pour la production.

4. **Validation** : La validation côté client existe mais peut être contournée. La validation serveur est prioritaire.

## Ressources Utiles

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

**Dernière mise à jour** : Novembre 2025
