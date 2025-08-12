interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const total = this.cache.size;
    const expired = Array.from(this.cache.values()).filter(item => now > item.expiry).length;
    
    return {
      total,
      active: total - expired,
      expired
    };
  }
}

// Create cache instances for different data types
export const apiCache = new CacheManager();
export const imageCache = new CacheManager();

// Cache keys generator
export const cacheKeys = {
  fixtures: (league: string, season: string, status?: string) => 
    `fixtures:${league}:${season}:${status || 'all'}`,
  liveScores: (league: string, season: string) => 
    `live-scores:${league}:${season}`,
  leagues: (country?: string, season?: string) => 
    `leagues:${country || 'all'}:${season || 'current'}`,
  standings: (league: string, season: string) => 
    `standings:${league}:${season}`,
  teamImage: (teamId: string) => 
    `team-image:${teamId}`
};

// Auto cleanup every 10 minutes
setInterval(() => {
  apiCache.cleanup();
  imageCache.cleanup();
}, 10 * 60 * 1000);