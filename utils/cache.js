/**
 * Simple In-Memory Cache
 * Caches API responses to reduce CoinGecko API calls and avoid rate limits
 */

class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Set a value in the cache with TTL (Time To Live)
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { value, expiresAt });
        console.log(`💾 Cached: ${key} (expires in ${ttl / 1000}s)`);
    }

    /**
     * Get a value from the cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if not found/expired
     */
    get(key) {
        const cached = this.cache.get(key);

        if (!cached) {
            return null;
        }

        // Check if expired
        if (Date.now() > cached.expiresAt) {
            this.cache.delete(key);
            console.log(`🗑️  Cache expired: ${key}`);
            return null;
        }

        console.log(`✅ Cache hit: ${key}`);
        return cached.value;
    }

    /**
     * Check if a key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Clear all cached items
     */
    clear() {
        this.cache.clear();
        console.log('🗑️  Cache cleared');
    }

    /**
     * Remove expired items from cache
     */
    cleanup() {
        const now = Date.now();
        let removed = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`🗑️  Cleaned up ${removed} expired cache items`);
        }
    }
}

// Export a singleton instance
const cache = new SimpleCache();

// Run cleanup every 10 minutes
setInterval(() => cache.cleanup(), 10 * 60 * 1000);

module.exports = cache;
