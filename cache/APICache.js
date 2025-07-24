const fs = require('fs');
const path = require('path');

class APICache {
    constructor() {
        this.cacheFile = path.join(__dirname, '..', 'cache', 'api_cache.json');
        this.cacheDuration = 45 * 60 * 1000; // 45 minutes in milliseconds
        this.cache = new Map();
        this.loadCache();
        this.ensureCacheDir();
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
            if (fs.existsSync(this.cacheFile)) {
                const data = fs.readFileSync(this.cacheFile, 'utf8');
                const parsedData = JSON.parse(data);
                
                // Convert plain object back to Map and check expiry
                const now = Date.now();
                for (const [key, value] of Object.entries(parsedData)) {
                    if (value.expires > now) {
                        this.cache.set(key, value);
                    }
                }
                console.log(`📊 Loaded ${this.cache.size} cached API responses`);
            } else {
                console.log(`📊 No existing API cache found, starting fresh`);
            }
        } catch (error) {
            console.error('Error loading API cache:', error.message);
            this.cache.clear();
        }
    }

    // Save cache to file
    saveCache() {
        try {
            this.ensureCacheDir();
            const cacheObject = Object.fromEntries(this.cache);
            fs.writeFileSync(this.cacheFile, JSON.stringify(cacheObject, null, 2));
        } catch (error) {
            console.error('Error saving API cache:', error.message);
        }
    }

    // Get API response from cache
    getAPIResponse(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expires > Date.now()) {
            console.log(`🎯 API cache hit for: ${key}`);
            return cached.data;
        }
        
        if (cached) {
            console.log(`⏰ API cache expired for: ${key}`);
            this.cache.delete(key);
        } else {
            console.log(`❌ API cache miss for: ${key}`);
        }
        
        return null;
    }

    // Store API response in cache
    setAPIResponse(key, data) {
        const cacheEntry = {
            data: data,
            expires: Date.now() + this.cacheDuration,
            timestamp: Date.now()
        };
        
        this.cache.set(key, cacheEntry);
        console.log(`💾 Cached API response for: ${key} (expires in 45 minutes)`);
        
        // Save to file after updating cache
        this.saveCache();
    }

    // Clear expired entries
    clearExpired() {
        const now = Date.now();
        let removedCount = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.expires <= now) {
                this.cache.delete(key);
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            console.log(`🧹 Removed ${removedCount} expired API cache entries`);
            this.saveCache();
        }
        
        return removedCount;
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.expires > now) {
                valid++;
            } else {
                expired++;
            }
        }
        
        return {
            total: this.cache.size,
            valid: valid,
            expired: expired,
            cacheDurationMinutes: this.cacheDuration / (60 * 1000)
        };
    }

    // Clear all cache
    clearAll() {
        this.cache.clear();
        this.saveCache();
        console.log(`🗑️ Cleared all API cache entries`);
    }
}

module.exports = APICache;
