// Variables globales
let currentUser = null;

// Vérifier l'authentification au chargement
async function checkAuth() {
    try {
        const response = await fetch('includes/api.php?action=getCurrentUser');
        const result = await response.json();
        
        if (!result.success || !result.user) {
            // Non connecté, rediriger vers login
            window.location.href = 'login.html';
            return false;
        }
        
        currentUser = result.user;
        document.getElementById('welcomeMessage').textContent = `Bonjour ${currentUser.name} 👋`;
        document.getElementById('pageTitle').textContent = `🎄 Liste de Noël de ${currentUser.name}`;
        document.getElementById('memberId').value = currentUser.id;
        
        return true;
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch('includes/api.php?action=logout');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        window.location.href = 'login.html';
    }
}

// Charger les souhaits de l'utilisateur connecté
async function loadMyWishes() {
    if (!currentUser) return [];
    
    try {
        const response = await fetch(`includes/api.php?action=getAll&member_id=${currentUser.id}`);
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

// Afficher mes souhaits
async function displayMyWishes() {
    const wishes = await loadMyWishes();
    const container = document.getElementById('myWishlist');

    if (wishes.length === 0) {
        container.innerHTML = '<p style="color: #6c757d; text-align: center; padding: 20px;">Aucun souhait pour le moment. Ajoutez-en un ! 🎁</p>';
        return;
    }

    // Trier pour mettre les favoris en premier
    wishes.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
    });

    container.innerHTML = wishes.map(wish => `
        <div class="admin-wish-card ${wish.favorite == 1 ? 'priority' : ''}">
            ${wish.image ? `<img src="${wish.image}" alt="${wish.name}" class="admin-wish-image" loading="lazy">` : '<div style="width: 100px; height: 100px; background: var(--cream-dark); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid var(--gold);">📷</div>'}
            <div class="admin-wish-info">
                <div class="admin-wish-name">${wish.name}</div>
                <div class="admin-wish-details">
                    <span class="admin-wish-category">${wish.category}</span>
                    <span class="admin-wish-price">${getPriceLabel(wish.price)}</span>
                    ${wish.reserved_by_name ? `<span class="admin-wish-reserved" style="color: #c70000;">🎁 Réservé par ${wish.reserved_by_name}</span>` : ''}
                </div>
            </div>
            <div class="admin-wish-actions">
                <button class="btn-edit" onclick="editWish('${wish.id}')">✏️ Éditer</button>
                <button class="btn-delete" onclick="deleteWish('${wish.id}')">🗑️</button>
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
    document.getElementById('cancelBtn').classList.add('hidden');
    const preview = document.getElementById('imagePreview');
    preview.classList.remove('active');
    preview.innerHTML = '';
    document.getElementById('currentImagePath').value = '';
}

// Upload d'image
async function handleImageUpload(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('includes/api.php?action=uploadImage', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            return result.path;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Erreur d\'upload:', error);
        throw error;
    }
}

// Gestion du changement de fichier
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');
    const fileLabel = document.querySelector('.file-upload-label');

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Afficher l'aperçu
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    imagePreview.classList.add('active');
                    fileLabel.innerHTML = `<span>📁</span><span>Image sélectionnée: ${file.name}</span>`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Ajouter ou modifier un souhait
async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enregistrement...';
    submitBtn.disabled = true;

    try {
        const editId = document.getElementById('editId').value;
        let imagePath = document.getElementById('currentImagePath').value;

        // Upload de la nouvelle image si sélectionnée
        const fileInput = document.getElementById('imageFile');
        if (fileInput.files.length > 0) {
            imagePath = await handleImageUpload(fileInput.files[0]);
        } else if (document.getElementById('imageUrl').value) {
            imagePath = document.getElementById('imageUrl').value;
        }

        const wish = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            link: document.getElementById('link').value,
            image: imagePath,
            description: document.getElementById('description').value,
            favorite: document.getElementById('favorite').checked,
            member_id: currentUser.id // Toujours lié à l'utilisateur connecté
        };

        let response;
        
        if (editId) {
            wish.id = editId;
            response = await fetch('includes/api.php?action=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wish)
            });
        } else {
            response = await fetch('includes/api.php?action=add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wish)
            });
        }

        const result = await response.json();

        if (result.success) {
            await displayMyWishes();
            resetForm();
            alert(editId ? '✅ Souhait modifié avec succès !' : '✅ Souhait ajouté avec succès !');
        } else {
            alert('❌ Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Une erreur est survenue : ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Modifier un souhait
async function editWish(id) {
    const wishes = await loadMyWishes();
    const wish = wishes.find(w => w.id === id);

    if (wish) {
        document.getElementById('editId').value = wish.id;
        document.getElementById('name').value = wish.name;
        document.getElementById('category').value = wish.category;
        document.getElementById('price').value = wish.price;
        document.getElementById('link').value = wish.link || '';
        document.getElementById('imageUrl').value = '';
        document.getElementById('currentImagePath').value = wish.image || '';
        document.getElementById('description').value = wish.description || '';
        document.getElementById('favorite').checked = wish.favorite == 1;

        // Afficher l'aperçu de l'image existante
        if (wish.image) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.innerHTML = `<img src="${wish.image}" alt="Current image">`;
            imagePreview.classList.add('active');
        }

        document.getElementById('formTitle').textContent = '✏️ Modifier un souhait';
        document.getElementById('submitBtn').textContent = 'Sauvegarder';
        document.getElementById('cancelBtn').classList.remove('hidden');

        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
    }
}

// Supprimer un souhait
async function deleteWish(id) {
    if (confirm('❌ Êtes-vous sûr de vouloir supprimer ce souhait ?')) {
        try {
            const response = await fetch(`includes/api.php?action=delete&id=${id}`, {
                method: 'GET'
            });

            const result = await response.json();

            if (result.success) {
                await displayMyWishes();
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
(async () => {
    // Vérifier l'authentification
    const isAuth = await checkAuth();
    
    if (isAuth) {
        // Charger et afficher les souhaits
        await displayMyWishes();

        // Attacher les événements
        document.getElementById('wishForm').addEventListener('submit', handleSubmit);
        document.getElementById('cancelBtn').addEventListener('click', resetForm);
    }
})();
