/**
 * Main JavaScript for Index Page
 * Fetches top cryptocurrencies from CoinGecko API and populates the dropdown
 */

// CoinGecko API Configuration
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading cryptocurrencies...');
    loadTopCoins();
    
    // Handle form submission
    const form = document.getElementById('coin-form');
    form.addEventListener('submit', handleFormSubmit);
});

/**
 * Load top 10 cryptocurrencies by market cap
 */
async function loadTopCoins() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const formEl = document.getElementById('coin-form');
    const selectEl = document.getElementById('coin-select');
    
    try {
        // Show loading
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        formEl.style.display = 'none';
        
        // Fetch top 10 coins from CoinGecko
        const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const coins = await response.json();
        console.log(`✅ Loaded ${coins.length} cryptocurrencies`);
        
        // Populate dropdown
        selectEl.innerHTML = '<option value="" disabled selected>-- Select a coin --</option>';
        
        coins.forEach(coin => {
            const option = document.createElement('option');
            option.value = coin.id;
            option.textContent = `${coin.name} (${coin.symbol.toUpperCase()}) - $${coin.current_price.toLocaleString()}`;
            selectEl.appendChild(option);
        });
        
        // Hide loading, show form
        loadingEl.style.display = 'none';
        formEl.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Error loading coins:', error);
        
        // Show error message
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        
        // Add retry button
        if (!document.getElementById('retry-button')) {
            const retryBtn = document.createElement('button');
            retryBtn.id = 'retry-button';
            retryBtn.className = 'btn btn-primary';
            retryBtn.textContent = '🔄 Retry';
            retryBtn.style.marginTop = '1rem';
            retryBtn.onclick = () => {
                errorEl.style.display = 'none';
                loadTopCoins();
            };
            errorEl.appendChild(retryBtn);
        }
    }
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const selectEl = document.getElementById('coin-select');
    const coinId = selectEl.value;
    
    if (coinId) {
        // Navigate to dashboard page with coin ID
        window.location.href = `dashboard.html?coin=${coinId}`;
    }
}
