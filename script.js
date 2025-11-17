// Charger les souhaits depuis localStorage
function loadWishes() {
    const wishes = localStorage.getItem('christmasWishes');
    return wishes ? JSON.parse(wishes) : [];
}

// Afficher les souhaits
function displayWishes() {
    const wishes = loadWishes();
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
        wishlistContainer.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        wishlistContainer.style.display = 'grid';
        emptyState.style.display = 'none';

        wishlistContainer.innerHTML = filteredWishes.map(wish => `
            <div class="wish-card ${wish.favorite ? 'favorite' : ''}">
                ${wish.image ? `<img src="${wish.image}" alt="${wish.name}" class="wish-image" onerror="this.style.display='none'">` : ''}
                <h3>${wish.name}</h3>
                <div>
                    <span class="wish-category">${wish.category}</span>
                    <span class="wish-price">${getPriceLabel(wish.price)}</span>
                </div>
                ${wish.description ? `<p class="wish-description">${wish.description}</p>` : ''}
                ${wish.link ? `<a href="${wish.link}" target="_blank" class="wish-link">🛒 Acheter</a>` : ''}
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

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayWishes();

    // Événements des filtres
    document.getElementById('categoryFilter').addEventListener('change', displayWishes);
    document.getElementById('priceFilter').addEventListener('change', displayWishes);
});
