# 📝 Guide de Contribution

Merci de votre intérêt pour contribuer à ce projet ! 🎉

## 🚀 Comment Contribuer

### Signaler un Bug 🐛

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec :
   - Un titre descriptif
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs le comportement observé
   - Votre environnement (PHP version, OS, navigateur)
   - Des captures d'écran si pertinent

### Proposer une Amélioration 💡

1. Créez une issue pour discuter de votre idée
2. Expliquez le problème que vous voulez résoudre
3. Proposez votre solution
4. Attendez les retours avant de commencer le développement

### Soumettre une Pull Request 🔧

1. **Fork** le projet
2. Créez une **branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

## 📋 Standards de Code

### PHP

- Suivre les [PSR-12 coding standards](https://www.php-fig.org/psr/psr-12/)
- Utiliser des noms de variables et fonctions explicites
- Commenter le code complexe
- Toujours utiliser des requêtes préparées PDO

```php
// ✅ Bon
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);

// ❌ Mauvais
$result = $pdo->query("SELECT * FROM users WHERE id = $userId");
```

### JavaScript

- Utiliser `const` et `let` (pas de `var`)
- Noms de variables en camelCase
- Utiliser des fonctions fléchées quand approprié
- Commenter les fonctions complexes

```javascript
// ✅ Bon
const fetchData = async () => {
    const response = await fetch('/api/data');
    return response.json();
};

// ❌ Mauvais
var x = function() {
    // code sans commentaires
};
```

### CSS

- Utiliser des noms de classes descriptifs
- Organiser le CSS par composants
- Éviter les `!important` sauf nécessité absolue
- Commenter les hacks ou solutions non-évidentes

## 🔒 Sécurité

- **JAMAIS** committer de credentials ou clés API
- Toujours valider les entrées utilisateur côté serveur
- Utiliser des requêtes préparées pour la BDD
- Suivre le principe du moindre privilège
- Lire [SECURITY.md](SECURITY.md) avant de contribuer

## 🧪 Tests

Avant de soumettre une PR :

1. Testez votre code localement
2. Vérifiez qu'il n'y a pas d'erreurs PHP
3. Testez sur différents navigateurs si possible
4. Vérifiez la console JavaScript pour les erreurs

## 📝 Messages de Commit

Utilisez des messages de commit clairs et descriptifs :

```
Type: Description courte (max 50 caractères)

Description détaillée si nécessaire (max 72 caractères par ligne)
Expliquez le "pourquoi" plus que le "quoi"

Fixes #123
```

Types de commit :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, points-virgules manquants, etc.
- `refactor:` Refactoring de code
- `test:` Ajout de tests
- `chore:` Maintenance, dépendances, etc.

Exemples :
```
feat: Ajouter système de pagination pour les listes

Implémente la pagination côté serveur avec limite de 20 items
par page. Améliore les performances pour les grandes listes.

Fixes #42
```

```
fix: Corriger l'expiration des codes 2FA

Les codes expiraient après 1 minute au lieu de 15.
Correction du calcul de timestamp dans email.php

Fixes #67
```

## 🎨 Améliorations du Design

Le design actuel est... fonctionnel 😅. Toute amélioration UI/UX est la bienvenue !

Suggestions :
- Moderniser l'interface
- Ajouter des animations
- Améliorer la responsive
- Créer un design system cohérent
- Mode sombre 🌙

## 🌍 Internationalisation

Si vous souhaitez ajouter une traduction :
1. Créez un fichier de langue dans `/lang/`
2. Traduisez tous les textes
3. Mettez à jour la documentation

## 📚 Documentation

- Mettez à jour le README si vous ajoutez des fonctionnalités
- Documentez les nouvelles API endpoints
- Ajoutez des exemples de code
- Mettez à jour le CHANGELOG

## ❓ Questions

Si vous avez des questions :
1. Consultez d'abord le README et la documentation
2. Cherchez dans les issues existantes
3. Créez une nouvelle issue avec le tag `question`

## 🙏 Remerciements

Merci de prendre le temps de contribuer ! Chaque contribution, même petite, est appréciée. 🚀

---

**Note** : Ce projet est principalement un projet d'apprentissage. N'hésitez pas à proposer des améliorations, même si elles touchent à la structure fondamentale du projet !
