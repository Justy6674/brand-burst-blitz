import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

interface IntelligentCache {
  get: (key: string) => any;
  set: (key: string, data: any, ttl?: number) => void;
  invalidate: (key: string) => void;
  clear: () => void;
  getStats: () => CacheStats;
  preload: (key: string, fetcher: () => Promise<any>, ttl?: number) => Promise<void>;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

export function useIntelligentCache(): IntelligentCache {
  const [cache, setCache] = useState<Map<string, CacheItem>>(new Map());
  const [stats, setStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  });

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      let evictionCount = 0;

      for (const [key, item] of newCache.entries()) {
        if (now > item.timestamp + item.ttl) {
          newCache.delete(key);
          evictionCount++;
        }
      }

      if (evictionCount > 0) {
        setStats(prevStats => ({
          ...prevStats,
          evictions: prevStats.evictions + evictionCount,
          size: newCache.size
        }));
      }

      return newCache;
    });
  }, []);

  // LRU eviction when cache is full
  const evictLRU = useCallback(() => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      if (newCache.size >= MAX_CACHE_SIZE) {
        // Find least recently used item
        let lruKey = '';
        let lruTime = Date.now();
        
        for (const [key, item] of newCache.entries()) {
          if (item.lastAccessed < lruTime) {
            lruTime = item.lastAccessed;
            lruKey = key;
          }
        }
        
        if (lruKey) {
          newCache.delete(lruKey);
          setStats(prevStats => ({
            ...prevStats,
            evictions: prevStats.evictions + 1,
            size: newCache.size
          }));
        }
      }
      
      return newCache;
    });
  }, []);

  // Set up cleanup interval
  useEffect(() => {
    const interval = setInterval(cleanup, CLEANUP_INTERVAL);
    return () => clearInterval(interval);
  }, [cleanup]);

  const get = useCallback((key: string) => {
    const item = cache.get(key);
    const now = Date.now();

    if (!item || now > item.timestamp + item.ttl) {
      setStats(prevStats => ({
        ...prevStats,
        misses: prevStats.misses + 1
      }));
      return null;
    }

    // Update access stats
    const updatedItem = {
      ...item,
      accessCount: item.accessCount + 1,
      lastAccessed: now
    };

    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(key, updatedItem);
      return newCache;
    });

    setStats(prevStats => ({
      ...prevStats,
      hits: prevStats.hits + 1
    }));

    return item.data;
  }, [cache]);

  const set = useCallback((key: string, data: any, ttl: number = DEFAULT_TTL) => {
    const now = Date.now();
    
    evictLRU();

    const item: CacheItem = {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now
    };

    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.set(key, item);
      
      setStats(prevStats => ({
        ...prevStats,
        size: newCache.size
      }));
      
      return newCache;
    });
  }, [evictLRU]);

  const invalidate = useCallback((key: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      if (newCache.delete(key)) {
        setStats(prevStats => ({
          ...prevStats,
          size: newCache.size
        }));
      }
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
    setStats({
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0
    });
  }, []);

  const getStats = useCallback(() => stats, [stats]);

  const preload = useCallback(async (key: string, fetcher: () => Promise<any>, ttl: number = DEFAULT_TTL) => {
    try {
      const data = await fetcher();
      set(key, data, ttl);
    } catch (error) {
      console.warn(`Failed to preload cache key "${key}":`, error);
    }
  }, [set]);

  return {
    get,
    set,
    invalidate,
    clear,
    getStats,
    preload
  };
}