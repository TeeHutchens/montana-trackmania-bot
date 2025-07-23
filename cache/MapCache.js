const fs = require('fs');
const path = require('path');

class MapCache {
    constructor() {
        this.cacheFile = path.join(__dirname, '..', 'cache', 'map_cache.json');
        this.cacheDuration = 45 * 60 * 1000; // 45 minutes in milliseconds
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
                
                console.log(`🗺️ Loaded ${this.cache.size} cached map entries`);
            }
        } catch (error) {
            console.log('⚠️ Could not load map cache:', error.message);
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
            console.log('⚠️ Could not save map cache:', error.message);
        }
    }

    // Get map data from cache
    getMapData(mapUid) {
        const entry = this.cache.get(mapUid);
        if (!entry) {
            return null;
        }

        // Check if entry is expired
        const now = Date.now();
        if (now - entry.timestamp > this.cacheDuration) {
            this.cache.delete(mapUid);
            return null;
        }

        return entry.data;
    }

    // Set map data in cache
    setMapData(mapUid, mapData) {
        this.cache.set(mapUid, {
            data: mapData,
            timestamp: Date.now()
        });
        this.saveCache();
    }

    // Get multiple map data from cache
    getMultipleMapData(mapUids) {
        const cached = {};
        const missing = [];

        for (const mapUid of mapUids) {
            const data = this.getMapData(mapUid);
            if (data) {
                cached[mapUid] = data;
            } else {
                missing.push(mapUid);
            }
        }

        return { cached, missing };
    }

    // Set multiple map data in cache
    setMultipleMapData(mapDataEntries) {
        for (const [mapUid, mapData] of Object.entries(mapDataEntries)) {
            this.cache.set(mapUid, {
                data: mapData,
                timestamp: Date.now()
            });
        }
        this.saveCache();
    }

    // Clear expired entries
    cleanExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [mapUid, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.cacheDuration) {
                this.cache.delete(mapUid);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired map cache entries`);
            this.saveCache();
        }
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;

        for (const [mapUid, entry] of this.cache.entries()) {
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
            cacheDurationMinutes: this.cacheDuration / (60 * 1000)
        };
    }

    // Clear all cache
    clearAll() {
        this.cache.clear();
        try {
            if (fs.existsSync(this.cacheFile)) {
                fs.unlinkSync(this.cacheFile);
            }
            console.log('🗑️ Map cache cleared');
        } catch (error) {
            console.log('⚠️ Could not clear map cache file:', error.message);
        }
    }

    // Get readable cache entry information
    getCacheEntryInfo(mapUid) {
        const entry = this.cache.get(mapUid);
        if (!entry) {
            return null;
        }

        const now = Date.now();
        const ageMinutes = Math.floor((now - entry.timestamp) / (60 * 1000));
        const remainingMinutes = Math.max(0, 45 - ageMinutes);

        return {
            mapUid: mapUid,
            mapName: entry.data.name || 'Unknown Map',
            authorAccountId: entry.data.author || 'unknown',
            ageMinutes: ageMinutes,
            remainingMinutes: remainingMinutes,
            isExpired: remainingMinutes === 0
        };
    }
}

module.exports = MapCache;
