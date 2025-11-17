// Variables globales
let currentMembers = [];
let selectedMemberId = null;

// Charger les membres depuis l'API
async function loadMembers() {
    try {
        const response = await fetch('includes/api.php?action=getMembers');
        const result = await response.json();
        
        if (result.success) {
            currentMembers = result.data;
            return result.data;
        } else {
            console.error('Erreur:', result.message);
            return [];
        }
    } catch (error) {
        console.error('Erreur de chargement des membres:', error);
        return [];
    }
}

// Charger les souhaits depuis l'API
async function loadWishes(memberId = null) {
    try {
        const url = memberId 
            ? `includes/api.php?action=getAll&member_id=${memberId}`
            : 'includes/api.php?action=getAll';
        const response = await fetch(url);
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

// Afficher les membres dans le select
async function displayMemberSelect() {
    const members = await loadMembers();
    const select = document.getElementById('memberSelect');
    const filterSelect = document.getElementById('memberFilter');
    
    if (members.length === 0) {
        select.innerHTML = '<option value="">Aucun membre - Créez-en un d\'abord</option>';
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">Aucun membre</option>';
        }
        return;
    }
    
    // Remplir le select pour ajouter des souhaits
    select.innerHTML = '<option value="">Choisir un membre</option>' + 
        members.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
    
    // Remplir le select de filtrage
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="all">Tous les membres</option>' + 
            members.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
    }
    
    // Sélectionner le premier membre par défaut si aucun n'est sélectionné
    if (members.length > 0 && !selectedMemberId) {
        selectedMemberId = members[0].id;
        select.value = selectedMemberId;
    }
}

// Afficher les souhaits dans l'admin
async function displayAdminWishes() {
    const filterMemberId = document.getElementById('memberFilter')?.value;
    const wishes = await loadWishes(filterMemberId === 'all' ? null : filterMemberId);
    const container = document.getElementById('adminWishlist');

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
                    ${wish.member_name ? `<span class="admin-wish-member">👤 ${wish.member_name}</span>` : ''}
                    ${wish.reserved_by_name ? `<span class="admin-wish-reserved">🎁 Réservé par ${wish.reserved_by_name}</span>` : ''}
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

        const memberId = document.getElementById('memberSelect').value;
        
        if (!memberId) {
            alert('❌ Veuillez sélectionner un membre');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        const wish = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            link: document.getElementById('link').value,
            image: imagePath,
            description: document.getElementById('description').value,
            favorite: document.getElementById('favorite').checked,
            member_id: memberId
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
            await displayAdminWishes();
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
    const wishes = await loadWishes();
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
        document.getElementById('memberSelect').value = wish.member_id || '';

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

// Gestion des membres
async function showAddMemberModal() {
    const name = prompt('Nom du membre:');
    if (!name) return;
    
    const email = prompt('📧 Email (REQUIS pour se connecter):\n\nCet email pourra se connecter au site pour gérer sa liste.');
    if (!email) {
        alert('⚠️ Un email est nécessaire pour que le membre puisse se connecter.');
        return;
    }
    
    // Valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Format d\'email invalide');
        return;
    }
    
    const role = confirm('Ce membre sera-t-il administrateur ?\n\nOK = Admin (accès total)\nAnnuler = Membre (accès à sa liste uniquement)') 
        ? 'admin' 
        : 'member';
    
    try {
        const response = await fetch('includes/api.php?action=addMember', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email: email.toLowerCase().trim(), role })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await displayMemberSelect();
            await displayAdminWishes();
            alert(`✅ Membre ajouté avec succès !\n\n${email} peut maintenant se connecter avec le bouton "🔐 Ma liste" sur la page publique.`);
        } else {
            alert('❌ Erreur : ' + result.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Une erreur est survenue');
    }
}

// Modifier l'email d'un membre
async function editMemberEmail() {
    const memberId = document.getElementById('memberFilter')?.value;
    if (!memberId || memberId === 'all') {
        alert('❌ Veuillez sélectionner un membre dans la liste');
        return;
    }
    
    try {
        // Récupérer les infos du membre
        const response = await fetch(`includes/api.php?action=getMember&id=${memberId}`);
        const result = await response.json();
        
        if (!result.success) {
            alert('❌ Erreur lors de la récupération du membre');
            return;
        }
        
        const member = result.data;
        const newEmail = prompt(
            `Modifier l'email de ${member.name}:\n\nEmail actuel: ${member.email || '(aucun)'}`,
            member.email || ''
        );
        
        if (newEmail === null) return; // Annulé
        
        if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            alert('❌ Format d\'email invalide');
            return;
        }
        
        // Mettre à jour
        const updateResponse = await fetch('includes/api.php?action=updateMember', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: memberId,
                name: member.name,
                email: newEmail ? newEmail.toLowerCase().trim() : null,
                role: member.role
            })
        });
        
        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
            await displayMemberSelect();
            await displayAdminWishes();
            alert('✅ Email modifié avec succès !');
        } else {
            alert('❌ Erreur : ' + updateResult.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Une erreur est survenue');
    }
}

async function deleteMember() {
    const memberId = document.getElementById('memberFilter')?.value;
    if (!memberId || memberId === 'all') {
        alert('❌ Veuillez sélectionner un membre à supprimer');
        return;
    }
    
    if (confirm('❌ Êtes-vous sûr de vouloir supprimer ce membre et tous ses souhaits ?')) {
        try {
            const response = await fetch(`includes/api.php?action=deleteMember&id=${memberId}`);
            const result = await response.json();
            
            if (result.success) {
                await displayMemberSelect();
                await displayAdminWishes();
                alert('✅ Membre supprimé avec succès !');
            } else {
                alert('❌ Erreur : ' + result.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Une erreur est survenue');
        }
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

// Vérifier l'authentification admin
async function checkAdminAuth() {
    try {
        const response = await fetch('includes/api.php?action=getCurrentUser');
        const result = await response.json();
        
        if (!result.success || !result.user) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (result.user.role !== 'admin') {
            alert('⛔ Accès refusé. Seuls les administrateurs peuvent accéder à cette page.');
            window.location.href = 'my-list.html';
            return false;
        }
        
        document.getElementById('adminWelcome').textContent = `Admin: ${result.user.name} 👑`;
        return true;
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        window.location.href = 'login.html';
        return false;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier l'authentification admin
    const isAdmin = await checkAdminAuth();
    
    if (isAdmin) {
        await fetch('includes/api.php?action=initialize');
        await displayMemberSelect();
        await displayAdminWishes();

        document.getElementById('wishForm').addEventListener('submit', handleSubmit);
        document.getElementById('cancelBtn').addEventListener('click', resetForm);
        
        // Événement pour le filtre de membre
        const memberFilter = document.getElementById('memberFilter');
        if (memberFilter) {
            memberFilter.addEventListener('change', displayAdminWishes);
        }
    }
});
