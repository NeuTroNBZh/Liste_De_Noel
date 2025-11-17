// Charger les souhaits depuis l'API
async function loadWishes() {
    try {
        const response = await fetch('api.php?action=getAll');
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.error('Erreur:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
        return [];
    }
}

// Générer un ID unique (côté client pour compatibilité)
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
async function displayAdminWishes() {
    const wishes = await loadWishes();
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
        <div class="admin-wish-card ${wish.favorite == 1 ? 'favorite' : ''}">
            <div class="admin-wish-header">
                <div>
                    <div class="admin-wish-title">
                        ${wish.favorite == 1 ? '⭐ ' : ''}${wish.name}
                    </div>
                </div>
                <div class="admin-wish-actions">
                    <button class="btn-edit" onclick="editWish('${wish.id}')">✏️ Modifier</button>
                    <button class="btn-danger" onclick="deleteWish('${wish.id}')">🗑️ Supprimer</button>
                </div>
            </div>
            ${wish.image ? `<div style="margin: 10px 0;"><img src="${wish.image}" alt="${wish.name}" style="max-width: 200px; border-radius: 8px;" onerror="this.style.display='none'" loading="lazy"></div>` : ''}
            <div class="admin-wish-info">
                <div><strong>Catégorie:</strong> ${wish.category}</div>
                <div><strong>Prix:</strong> ${getPriceLabel(wish.price)}</div>
                ${wish.description ? `<div><strong>Description:</strong> ${wish.description}</div>` : ''}
                ${wish.image ? `<div><strong>Image:</strong> <a href="${wish.image}" target="_blank" rel="noopener noreferrer" class="admin-wish-link">${wish.image}</a></div>` : ''}
                ${wish.link ? `<div><strong>Lien:</strong> <a href="${wish.link}" target="_blank" rel="noopener noreferrer" class="admin-wish-link">${wish.link}</a></div>` : ''}
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
async function handleSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('editId').value;

    const wish = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        link: document.getElementById('link').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
        favorite: document.getElementById('favorite').checked
    };

    try {
        let response;
        
        if (editId) {
            // Modifier
            wish.id = editId;
            response = await fetch('api.php?action=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wish)
            });
        } else {
            // Ajouter
            response = await fetch('api.php?action=add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wish)
            });
        }

        const result = await response.json();

        if (result.success) {
            await displayAdminWishes();
            resetForm();
            alert(editId ? '✅ Souhait modifié avec succès !' : '✅ Souhait ajouté avec succès !');
        } else {
            alert('❌ Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Une erreur est survenue');
    }
}

// Modifier un souhait
async function editWish(id) {
    const wishes = await loadWishes();
    const wish = wishes.find(w => w.id === id);

    if (wish) {
        document.getElementById('editId').value = wish.id;
        document.getElementById('name').value = wish.name;
        document.getElementById('category').value = wish.category;
        document.getElementById('price').value = wish.price;
        document.getElementById('link').value = wish.link || '';
        document.getElementById('image').value = wish.image || '';
        document.getElementById('description').value = wish.description || '';
        document.getElementById('favorite').checked = wish.favorite == 1;

        document.getElementById('formTitle').textContent = '✏️ Modifier un souhait';
        document.getElementById('submitBtn').textContent = 'Sauvegarder';
        document.getElementById('cancelBtn').style.display = 'inline-block';

        // Scroller vers le formulaire
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    }
}

// Supprimer un souhait
async function deleteWish(id) {
    if (confirm('❌ Êtes-vous sûr de vouloir supprimer ce souhait ?')) {
        try {
            const response = await fetch(`api.php?action=delete&id=${id}`, {
                method: 'GET'
            });

            const result = await response.json();

            if (result.success) {
                await displayAdminWishes();
                alert('✅ Souhait supprimé avec succès !');
            } else {
                alert('❌ Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Une erreur est survenue');
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser les données si besoin
    await fetch('api.php?action=initialize');
    
    await displayAdminWishes();

    // Événements du formulaire
    document.getElementById('wishForm').addEventListener('submit', handleSubmit);
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});
