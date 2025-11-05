require('dotenv').config();
const axios = require('axios');
const cache = require('./cache');

// Base URL for CoinGecko API
const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

// CoinGecko API Key
const API_KEY = process.env.COINGECKO_API_KEY;

// Rate limiting: Track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = parseInt(process.env.MIN_REQUEST_INTERVAL) || 1200; // Minimum 1.2 seconds between requests

/**
 * Rate limiter: Ensures minimum delay between API requests
 */
async function rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const delayNeeded = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`⏳ Rate limiting: waiting ${delayNeeded}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    lastRequestTime = Date.now();
}

/**
 * Fetches the top 10 cryptocurrencies by market cap
 * @returns {Promise<Array>} Array of top 10 coins with id, name, symbol, etc.
 */
async function getTopCoins() {
    const cacheKey = 'top_coins';

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        // Rate limiting
        await rateLimitDelay();

        const response = await axios.get(`${BASE_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 10,
                page: 1,
                sparkline: false,
                x_cg_demo_api_key: API_KEY
            }
        });

        console.log(`✅ Fetched ${response.data.length} top coins from CoinGecko`);

        // Cache for 10 minutes (top coins don't change frequently)
        cache.set(cacheKey, response.data, 10 * 60 * 1000);

        return response.data;
    } catch (error) {
        console.error('❌ Error fetching top coins:', error.message);

        // If rate limited, provide helpful error message
        if (error.response && error.response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }

        throw new Error('Failed to fetch top coins from CoinGecko API');
    }
}

/**
 * Fetches 90 days of historical market data for a specific coin
 * @param {string} coinId - The CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @returns {Promise<Object>} Historical data including prices, market_caps, and total_volumes
 */
async function getCoinHistory(coinId) {
    const cacheKey = `history_${coinId}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        // Rate limiting
        await rateLimitDelay();

        const response = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 90,
                interval: 'daily',
                x_cg_demo_api_key: API_KEY
            }
        });

        console.log(`✅ Fetched 90-day history for ${coinId}`);

        // CoinGecko returns data in format:
        // { prices: [[timestamp, price], ...], market_caps: [[timestamp, cap], ...], total_volumes: [[timestamp, volume], ...] }
        const historyData = {
            coinId: coinId,
            prices: response.data.prices,
            market_caps: response.data.market_caps,
            volumes: response.data.total_volumes
        };

        // Cache for 30 minutes (historical data doesn't change frequently)
        cache.set(cacheKey, historyData, 30 * 60 * 1000);

        return historyData;
    } catch (error) {
        console.error(`❌ Error fetching history for ${coinId}:`, error.message);

        // If rate limited, provide helpful error message
        if (error.response && error.response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }

        throw new Error(`Failed to fetch historical data for ${coinId}`);
    }
}

/**
 * Fetches detailed information about a specific coin
 * @param {string} coinId - The CoinGecko coin ID
 * @returns {Promise<Object>} Detailed coin information
 */
async function getCoinDetails(coinId) {
    const cacheKey = `details_${coinId}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        // Rate limiting
        await rateLimitDelay();

        // Use /coins/markets endpoint with specific coin ID to get full market data
        const response = await axios.get(`${BASE_URL}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                ids: coinId,
                x_cg_demo_api_key: API_KEY
            }
        });

        // API returns an array with one element
        const coinData = response.data[0];

        if (!coinData) {
            throw new Error(`Coin ${coinId} not found`);
        }

        const details = {
            id: coinData.id,
            name: coinData.name,
            symbol: coinData.symbol.toUpperCase(),
            image: coinData.image,
            current_price: coinData.current_price,
            market_cap: coinData.market_cap,
            market_cap_rank: coinData.market_cap_rank,
            fully_diluted_valuation: coinData.fully_diluted_valuation,
            total_volume: coinData.total_volume,
            high_24h: coinData.high_24h,
            low_24h: coinData.low_24h,
            price_change_24h: coinData.price_change_24h,
            price_change_percentage_24h: coinData.price_change_percentage_24h,
            market_cap_change_24h: coinData.market_cap_change_24h,
            market_cap_change_percentage_24h: coinData.market_cap_change_percentage_24h,
            circulating_supply: coinData.circulating_supply,
            total_supply: coinData.total_supply,
            max_supply: coinData.max_supply,
            ath: coinData.ath,
            ath_change_percentage: coinData.ath_change_percentage,
            ath_date: coinData.ath_date,
            atl: coinData.atl,
            atl_change_percentage: coinData.atl_change_percentage,
            atl_date: coinData.atl_date,
            last_updated: coinData.last_updated
        };

        console.log(`✅ Fetched details for ${coinId}`);

        // Cache for 5 minutes
        cache.set(cacheKey, details, 5 * 60 * 1000);

        return details;
    } catch (error) {
        console.error(`❌ Error fetching details for ${coinId}:`, error.message);

        // If rate limited, provide helpful error message
        if (error.response && error.response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }

        throw new Error(`Failed to fetch coin details for ${coinId}`);
    }
}

module.exports = {
    getTopCoins,
    getCoinHistory,
    getCoinDetails
};
