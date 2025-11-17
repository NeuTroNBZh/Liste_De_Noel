// Variables globales
let currentMembers = [];

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

// Charger les souhaits depuis l'API PHP
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

// Afficher le select des membres
async function displayMemberSelect() {
    const members = await loadMembers();
    const select = document.getElementById('memberSelect');
    
    if (!select) return;
    
    if (members.length === 0) {
        select.innerHTML = '<option value="all">Aucun membre</option>';
        return;
    }
    
    select.innerHTML = '<option value="all">Tous les membres</option>' + 
        members.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
    
    // Sélectionner le premier membre par défaut
    if (members.length > 0) {
        select.value = members[0].id;
    }
}

// Afficher les souhaits
async function displayWishes() {
    const memberFilter = document.getElementById('memberSelect')?.value;
    const wishes = await loadWishes(memberFilter === 'all' ? null : memberFilter);
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    const wishlistContainer = document.getElementById('wishlist');
    const emptyState = document.getElementById('emptyState');

    // Filtrer les souhaits
    let filteredWishes = wishes;

    if (categoryFilter !== 'all') {
        filteredWishes = filteredWishes.filter(w => w.category === categoryFilter);
    }

    if (priceFilter !== 'all') {
        filteredWishes = filteredWishes.filter(w => w.price === priceFilter);
    }

    // Trier pour mettre les favoris en premier
    filteredWishes.sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
    });

    // Afficher les résultats
    if (filteredWishes.length === 0) {
        wishlistContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        wishlistContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');

        wishlistContainer.innerHTML = filteredWishes.map(wish => `
            <div class="wish-card ${wish.favorite == 1 ? 'priority' : ''} ${wish.reserved_by ? 'reserved' : ''}">
                ${wish.image ? `<img src="${wish.image}" alt="${wish.name}" class="wish-image" onerror="this.style.display='none'" loading="lazy">` : ''}
                <h3 class="wish-title">${wish.name}</h3>
                <span class="wish-category">${wish.category}</span>
                ${wish.member_name ? `<span class="wish-member">👤 ${wish.member_name}</span>` : ''}
                ${wish.reserved_by_name ? `<span class="wish-reserved-badge">🎁 Réservé par ${wish.reserved_by_name}</span>` : ''}
                ${wish.description ? `<p class="wish-description">${wish.description}</p>` : ''}
                <div class="wish-footer">
                    <span class="wish-price">💰 ${getPriceLabel(wish.price)}</span>
                    ${wish.link ? `<a href="${wish.link}" target="_blank" rel="noopener noreferrer" class="wish-link">Voir 🎁</a>` : ''}
                </div>
            </div>
        `).join('');
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

// Initialiser les données au premier chargement
async function initializeData() {
    try {
        await fetch('includes/api.php?action=initialize');
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await initializeData();
    await displayMemberSelect();
    await displayWishes();

    // Événements des filtres
    const memberSelect = document.getElementById('memberSelect');
    if (memberSelect) {
        memberSelect.addEventListener('change', displayWishes);
    }
    document.getElementById('categoryFilter').addEventListener('change', displayWishes);
    document.getElementById('priceFilter').addEventListener('change', displayWishes);
});
