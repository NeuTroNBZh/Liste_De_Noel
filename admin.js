// Charger les souhaits depuis localStorage
function loadWishes() {
    const wishes = localStorage.getItem('christmasWishes');
    return wishes ? JSON.parse(wishes) : [];
}

// Sauvegarder les souhaits dans localStorage
function saveWishes(wishes) {
    localStorage.setItem('christmasWishes', JSON.stringify(wishes));
}

// Générer un ID unique
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Obtenir le label du prix
function getPriceLabel(price) {
    const labels = {
        '<20': 'Moins de 20€',
        '<50': 'Moins de 50€',
        '<100': 'Moins de 100€',
        '>100': 'Plus de 100€'
    };
    return labels[price] || price;
}

// Afficher les souhaits dans l'admin
function displayAdminWishes() {
    const wishes = loadWishes();
    const container = document.getElementById('adminWishlist');

    if (wishes.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Aucun souhait pour le moment. Ajoutez-en un ! 🎁</p>';
        return;
    }

    // Trier pour mettre les favoris en premier
    wishes.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
    });

    container.innerHTML = wishes.map(wish => `
        <div class="admin-wish-card ${wish.favorite ? 'favorite' : ''}">
            <div class="admin-wish-header">
                <div>
                    <div class="admin-wish-title">
                        ${wish.favorite ? '⭐ ' : ''}${wish.name}
                    </div>
                </div>
                <div class="admin-wish-actions">
                    <button class="btn-edit" onclick="editWish('${wish.id}')">✏️ Modifier</button>
                    <button class="btn-danger" onclick="deleteWish('${wish.id}')">🗑️ Supprimer</button>
                </div>
            </div>
            ${wish.image ? `<div style="margin: 10px 0;"><img src="${wish.image}" alt="${wish.name}" style="max-width: 200px; border-radius: 8px;" onerror="this.style.display='none'"></div>` : ''}
            <div class="admin-wish-info">
                <div><strong>Catégorie:</strong> ${wish.category}</div>
                <div><strong>Prix:</strong> ${getPriceLabel(wish.price)}</div>
                ${wish.description ? `<div><strong>Description:</strong> ${wish.description}</div>` : ''}
                ${wish.image ? `<div><strong>Image:</strong> <a href="${wish.image}" target="_blank" class="admin-wish-link">${wish.image}</a></div>` : ''}
                ${wish.link ? `<div><strong>Lien:</strong> <a href="${wish.link}" target="_blank" class="admin-wish-link">${wish.link}</a></div>` : ''}
            </div>
        </div>
    `).join('');
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('wishForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').textContent = '➕ Ajouter un souhait';
    document.getElementById('submitBtn').textContent = 'Ajouter';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Ajouter ou modifier un souhait
function handleSubmit(e) {
    e.preventDefault();

    const wishes = loadWishes();
    const editId = document.getElementById('editId').value;

    const wish = {
        id: editId || generateId(),
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        link: document.getElementById('link').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
        favorite: document.getElementById('favorite').checked
    };

    if (editId) {
        // Modifier
        const index = wishes.findIndex(w => w.id === editId);
        wishes[index] = wish;
    } else {
        // Ajouter
        wishes.push(wish);
    }

    saveWishes(wishes);
    displayAdminWishes();
    resetForm();

    // Afficher un message de confirmation
    alert(editId ? '✅ Souhait modifié avec succès !' : '✅ Souhait ajouté avec succès !');
}

// Modifier un souhait
function editWish(id) {
    const wishes = loadWishes();
    const wish = wishes.find(w => w.id === id);

    if (wish) {
        document.getElementById('editId').value = wish.id;
        document.getElementById('name').value = wish.name;
        document.getElementById('category').value = wish.category;
        document.getElementById('price').value = wish.price;
        document.getElementById('link').value = wish.link || '';
        document.getElementById('image').value = wish.image || '';
        document.getElementById('description').value = wish.description || '';
        document.getElementById('favorite').checked = wish.favorite || false;

        document.getElementById('formTitle').textContent = '✏️ Modifier un souhait';
        document.getElementById('submitBtn').textContent = 'Sauvegarder';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        // Scroller vers le formulaire
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    }
}

// Supprimer un souhait
function deleteWish(id) {
    if (confirm('❌ Êtes-vous sûr de vouloir supprimer ce souhait ?')) {
        const wishes = loadWishes();
        const filteredWishes = wishes.filter(w => w.id !== id);
        saveWishes(filteredWishes);
        displayAdminWishes();
        alert('✅ Souhait supprimé avec succès !');
    }
}

// Initialiser les données avec la liste fournie
function initializeData() {
    const wishes = loadWishes();
    
    // Si aucune donnée, initialiser avec la liste fournie
    if (wishes.length === 0) {
        const initialWishes = [
            {
                id: generateId(),
                name: 'SONOFF Zigbee/Thread PoE Dongle Max',
                category: 'Technologie',
                price: '<100',
                link: 'https://amzn.eu/d/3h9sOch',
                description: 'Compatible Ethernet, Wi-FI et USB, Passerelle Zigbee avec EFR32MG24&EFR32D0, clé Zigbee pour Home Assistant ou Zigbee2MQTT',
                favorite: false
            },
            {
                id: generateId(),
                name: 'USB Edge TPU ML Accelerator',
                category: 'Technologie',
                price: '<100',
                link: 'https://amzn.eu/d/cLPwzau',
                description: 'Coprocesseur pour Raspberry Pi et Autres Ordinateurs embarqués monocarte',
                favorite: false
            },
            {
                id: generateId(),
                name: 'UGREEN Chargeur Induction',
                category: 'Technologie',
                price: '<50',
                link: 'https://www.amazon.fr/UGREEN-Chargeur-Induction-Compatible-Magnétique/dp/B0CWV3SFVV',
                description: 'Compatible MagSafe magnétique',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Chargeur iPhone USB-C',
                category: 'Technologie',
                price: '<20',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Kit de Soudure avec Multimètre',
                category: 'Technologie',
                price: '<50',
                link: 'https://www.amazon.fr/SREMTCH-Électrique-Précision-Temperature-Multimètre/dp/B09NQ161FT',
                description: 'Fer à souder électrique de précision avec multimètre',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Sac à dos pour les cours',
                category: 'Vêtements / Accessoires',
                price: '<50',
                link: '',
                description: 'Qui puisse contenir mon PC',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Maillot Alternate Vitality 2025',
                category: 'Vêtements / Accessoires',
                price: '<100',
                link: 'https://vitality.gg/products/maillot-alternate-vitality-2025?variant=51616499401043',
                description: '',
                favorite: true
            },
            {
                id: generateId(),
                name: 'Chaussures de sport',
                category: 'Vêtements / Accessoires',
                price: '<100',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Gants',
                category: 'Vêtements / Accessoires',
                price: '<20',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Couverture lestée',
                category: 'Maison / Décoration',
                price: '<100',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Kit de crochetage',
                category: 'Expériences',
                price: '<50',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Réparation de mes clés de voiture',
                category: 'Autres',
                price: '<50',
                link: '',
                description: '',
                favorite: false
            },
            {
                id: generateId(),
                name: 'Mettre des piles dans mes montres',
                category: 'Autres',
                price: '<20',
                link: '',
                description: '',
                favorite: false
            }
        ];

        saveWishes(initialWishes);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    displayAdminWishes();

    // Événements du formulaire
    document.getElementById('wishForm').addEventListener('submit', handleSubmit);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});
