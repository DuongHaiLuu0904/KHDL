/**
 * Application Routes
 * Handles all HTTP routes for the cryptocurrency dashboard
 */

const express = require('express');
const router = express.Router();
const { getTopCoins, getCoinHistory, getCoinDetails } = require('../utils/cryptoApi');
const { processHistoricalData } = require('../utils/dataProcessor');

/**
 * GET / - Homepage
 * Displays a form with a dropdown of top 10 cryptocurrencies
 */
router.get('/', async (req, res) => {
    try {
        console.log('📍 Route: GET /');

        // Fetch top 10 coins from CoinGecko
        const topCoins = await getTopCoins();

        // Render the index page with the list of coins
        res.render('index', {
            title: 'Cryptocurrency Analysis Dashboard',
            coins: topCoins
        });
    } catch (error) {
        console.error('❌ Error on homepage:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load cryptocurrency list',
            error: error.message
        });
    }
});

/**
 * GET /dashboard - Main Analysis Dashboard
 * Displays comprehensive analysis and visualizations for a selected cryptocurrency
 * Query parameter: coin (e.g., /dashboard?coin=bitcoin)
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get the coin ID from query parameters
        const coinId = req.query.coin;

        if (!coinId) {
            return res.redirect('/');
        }

        console.log(`📍 Route: GET /dashboard?coin=${coinId}`);

        // Fetch coin details and historical data in parallel
        const [coinDetails, coinHistory] = await Promise.all([
            getCoinDetails(coinId),
            getCoinHistory(coinId)
        ]);

        // Process the historical data using danfo-js
        console.log('🔄 Processing data with danfo-js...');
        const chartData = await processHistoricalData(coinHistory);

        // Render the dashboard with processed data
        res.render('dashboard', {
            title: `${coinDetails.name} Analysis Dashboard`,
            coin: coinDetails,
            chartData: chartData
        });
    } catch (error) {
        console.error('❌ Error on dashboard:', error.message);
        res.status(500).render('error', {
            message: 'Failed to load dashboard',
            error: error.message
        });
    }
});

/**
 * GET /api/coins - API endpoint to get top coins (for AJAX requests)
 */
router.get('/api/coins', async (req, res) => {
    try {
        const topCoins = await getTopCoins();
        res.json(topCoins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
