const fs = require('fs');
const path = require('path');

class PlayerCache {
    constructor() {
        this.cacheFile = path.join(__dirname, '..', 'cache', 'player_cache.json');
        this.cacheDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        this.cache = new Map();
        this.loadCache();
    }

    // Ensure cache directory exists
    ensureCacheDir() {
        const cacheDir = path.dirname(this.cacheFile);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
    }

    // Load cache from file
    loadCache() {
        try {
            this.ensureCacheDir();
            if (fs.existsSync(this.cacheFile)) {
                const data = fs.readFileSync(this.cacheFile, 'utf8');
                const parsed = JSON.parse(data);
                
                // Convert back to Map and filter expired entries
                const now = Date.now();
                for (const [key, entry] of Object.entries(parsed)) {
                    if (now - entry.timestamp < this.cacheDuration) {
                        this.cache.set(key, entry);
                    }
                }
                
                console.log(`📦 Loaded ${this.cache.size} cached player profiles`);
            }
        } catch (error) {
            console.log('⚠️ Could not load player cache:', error.message);
            this.cache = new Map();
        }
    }

    // Save cache to file
    saveCache() {
        try {
            this.ensureCacheDir();
            const data = Object.fromEntries(this.cache);
            fs.writeFileSync(this.cacheFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.log('⚠️ Could not save player cache:', error.message);
        }
    }

    // Get player name from cache
    getPlayerName(accountId) {
        const entry = this.cache.get(accountId);
        if (!entry) {
            return null;
        }

        // Check if entry is expired
        const now = Date.now();
        if (now - entry.timestamp > this.cacheDuration) {
            this.cache.delete(accountId);
            return null;
        }

        return entry.name;
    }

    // Set player name in cache
    setPlayerName(accountId, name) {
        this.cache.set(accountId, {
            name: name,
            timestamp: Date.now()
        });
    }

    // Get multiple player names from cache
    getMultiplePlayerNames(accountIds) {
        const cached = {};
        const missing = [];

        for (const accountId of accountIds) {
            const name = this.getPlayerName(accountId);
            if (name) {
                cached[accountId] = name;
            } else {
                missing.push(accountId);
            }
        }

        return { cached, missing };
    }

    // Set multiple player names in cache
    setMultiplePlayerNames(playerData) {
        for (const [accountId, name] of Object.entries(playerData)) {
            this.setPlayerName(accountId, name);
        }
        this.saveCache();
    }

    // Clear expired entries
    cleanExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [accountId, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.cacheDuration) {
                this.cache.delete(accountId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
            this.saveCache();
        }
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;

        for (const [accountId, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.cacheDuration) {
                expired++;
            } else {
                valid++;
            }
        }

        return {
            total: this.cache.size,
            valid: valid,
            expired: expired,
            cacheFile: this.cacheFile,
            cacheDurationDays: this.cacheDuration / (24 * 60 * 60 * 1000)
        };
    }

    // Clear all cache
    clearAll() {
        this.cache.clear();
        try {
            if (fs.existsSync(this.cacheFile)) {
                fs.unlinkSync(this.cacheFile);
            }
            console.log('🗑️ Player cache cleared');
        } catch (error) {
            console.log('⚠️ Could not clear cache file:', error.message);
        }
    }
}

module.exports = PlayerCache;
