/* JavaScript */
let allCharacters = [];

async function loadCharacters() {
    try {
        // Load directly from JSON file for static hosting
        const response = await fetch('data/characters.json');
        allCharacters = await response.json();
        renderCharacters(allCharacters);
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

function renderCharacters(characters) {
    const grid = document.querySelector('.characters-grid');
    if (characters.length === 0) {
        grid.innerHTML = '<p class="no-results">Không tìm thấy nhân vật nào.</p>';
        return;
    }
    grid.innerHTML = characters.map(char => `
        <a href="${char.link}" class="char-card">
            <div class="container">
                <img class="overlay-bg" src="image/bg.webp" alt="">
                <img src="${char.image}" alt="${char.name}">
                <img class="overlay-afflatus" src="image/afflatus/${char.afflatus}.webp" alt="${char.afflatus}">
                <img class="overlay-rarity" src="image/rarities/${char.rarities}.webp" alt="${char.rarities} stars">
                <span class="char-name">${char.name}</span>
            </div>
        </a>
    `).join('');
}

function setFilter(filterType, value) {
    document.getElementById(`selected-${filterType}`).value = value;
    
    const buttons = document.querySelectorAll(`[data-filter="${filterType}"]`);
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.value === value) {
            btn.classList.add('active');
        }
    });

    filterCharacters();
}

function filterCharacters() {
    const afflatus = document.getElementById('selected-afflatus').value;
    const damageType = document.getElementById('selected-damage-type').value;
    const rarity = document.getElementById('selected-rarity').value;
    const query = document.getElementById('search-input').value.toLowerCase();

    const filtered = allCharacters.filter(char => {
        const matchAfflatus = afflatus === 'all' || char.afflatus?.toLowerCase() === afflatus;
        const matchDamageType = damageType === 'all' || char.damage_types?.toLowerCase() === damageType;
        const matchRarity = rarity === 'all' || char.rarities === rarity;
        const matchQuery = char.name.toLowerCase().includes(query);
        return matchAfflatus && matchDamageType && matchRarity && matchQuery;
    });

    renderCharacters(filtered);
}

function handleSearch() {
    filterCharacters();
}

// Real-time search when typing
document.getElementById('search-input').addEventListener('input', function() {
    filterCharacters();
});

document.addEventListener('DOMContentLoaded', loadCharacters);
