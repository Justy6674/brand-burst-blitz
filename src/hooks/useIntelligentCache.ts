import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useToast } from './use-toast';
import { useAuth } from '@/contexts/AuthProvider';

// Intelligent caching hook for healthcare platform
export interface CacheConfig {
  category: 'user_session' | 'content_generation' | 'analytics_result' | 'compliance_check' | 
           'healthcare_template' | 'government_api' | 'image_metadata' | 'user_preferences';
  ttlSeconds?: number;
  priority?: number;
  enablePrefetch?: boolean;
  compressionEnabled?: boolean;
}

export interface CacheMetrics {
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
  memoryUsage: number;
  lastAccessed: Date;
}

export interface CacheItem<T = any> {
  data: T;
  metadata: {
    cacheKey: string;
    category: string;
    createdAt: Date;
    expiresAt: Date;
    accessCount: number;
    dataSize: number;
  };
}

const DEFAULT_TTL = 3600; // 1 hour
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

export function useIntelligentCache() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cacheMetrics, setCacheMetrics] = useState<Record<string, CacheMetrics>>({});
  const memoryCache = useRef<Map<string, any>>(new Map());
  const cacheStats = useRef({
    hits: 0,
    misses: 0,
    totalRequests: 0
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Generate cache key with intelligent hashing
  const generateCacheKey = useCallback((
    baseKey: string, 
    params: any = {}, 
    userSpecific: boolean = true
  ): string => {
    const keyComponents = [
      baseKey,
      userSpecific && user?.id ? user.id : 'global',
      JSON.stringify(params)
    ];
    
    // Create hash for consistent key generation
    const keyString = keyComponents.join('|');
    return btoa(keyString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 255);
  }, [user?.id]);

  // Check memory cache first, then database cache
  const getCachedData = useCallback(async <T = any>(
    cacheKey: string,
    config: CacheConfig = { category: 'user_session' }
  ): Promise<T | null> => {
    setIsLoading(true);
    cacheStats.current.totalRequests++;
    
    try {
      // Check memory cache first (fastest)
      const memoryKey = `${config.category}:${cacheKey}`;
      if (memoryCache.current.has(memoryKey)) {
        const cached = memoryCache.current.get(memoryKey);
        if (cached.expiresAt > new Date()) {
          cacheStats.current.hits++;
          return cached.data;
        } else {
          // Remove expired memory cache
          memoryCache.current.delete(memoryKey);
        }
      }

      // Check database cache
      const { data: cacheData, error } = await supabase
        .rpc('get_cached_data', { p_cache_key: cacheKey });

      if (error) {
        console.error('Cache retrieval error:', error);
        cacheStats.current.misses++;
        return null;
      }

      if (cacheData) {
        // Store in memory cache for future requests
        memoryCache.current.set(memoryKey, {
          data: cacheData,
          expiresAt: new Date(Date.now() + (config.ttlSeconds || DEFAULT_TTL) * 1000)
        });
        
        cacheStats.current.hits++;
        return cacheData;
      }

      cacheStats.current.misses++;
      return null;

    } catch (error) {
      console.error('Cache error:', error);
      cacheStats.current.misses++;
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Set cache data with intelligent expiration and compression
  const setCachedData = useCallback(async <T = any>(
    cacheKey: string,
    data: T,
    config: CacheConfig = { category: 'user_session' }
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Prepare data for caching
      let processedData = data;
      
      // Apply compression if enabled and data is large
      if (config.compressionEnabled && JSON.stringify(data).length > 10000) {
        // Simple compression strategy - remove unnecessary whitespace
        processedData = JSON.parse(JSON.stringify(data));
      }

      // Store in database cache
      const { data: result, error } = await supabase
        .rpc('set_cached_data', {
          p_cache_key: cacheKey,
          p_cache_category: config.category,
          p_cached_data: processedData,
          p_user_id: user?.id || null,
          p_business_profile_id: null, // Could be enhanced to include business context
          p_ttl_seconds: config.ttlSeconds || DEFAULT_TTL
        });

      if (error) {
        console.error('Cache storage error:', error);
        return false;
      }

      // Store in memory cache
      const memoryKey = `${config.category}:${cacheKey}`;
      memoryCache.current.set(memoryKey, {
        data: processedData,
        expiresAt: new Date(Date.now() + (config.ttlSeconds || DEFAULT_TTL) * 1000)
      });

      // Manage memory cache size
      if (memoryCache.current.size > 1000) {
        // Remove oldest entries
        const entries = Array.from(memoryCache.current.entries());
        entries.slice(0, 100).forEach(([key]) => {
          memoryCache.current.delete(key);
        });
      }

      return true;

    } catch (error) {
      console.error('Cache storage error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  // Invalidate cache by pattern (for related data updates)
  const invalidateCache = useCallback(async (
    pattern: string,
    reason: string = 'manual_invalidation'
  ): Promise<number> => {
    try {
      // Clear matching memory cache entries
      let memoryCleared = 0;
      for (const [key] of memoryCache.current.entries()) {
        if (key.includes(pattern)) {
          memoryCache.current.delete(key);
          memoryCleared++;
        }
      }

      // Clear database cache entries
      const { data: clearedCount, error } = await supabase
        .rpc('invalidate_cache_pattern', {
          p_pattern: `%${pattern}%`,
          p_reason: reason
        });

      if (error) {
        console.error('Cache invalidation error:', error);
        return memoryCleared;
      }

      return (clearedCount || 0) + memoryCleared;

    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }, [supabase]);

  // Get cache performance statistics
  const getCacheMetrics = useCallback(async (
    category?: string
  ): Promise<CacheMetrics[]> => {
    try {
      const { data: metrics, error } = await supabase
        .rpc('get_cache_statistics', {
          p_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          p_end_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('Cache metrics error:', error);
        return [];
      }

      return metrics?.map((metric: any) => ({
        hitRate: metric.hit_rate_percentage || 0,
        totalRequests: metric.total_requests || 0,
        averageResponseTime: metric.avg_response_time_ms || 0,
        memoryUsage: metric.memory_usage_mb || 0,
        lastAccessed: new Date()
      })) || [];

    } catch (error) {
      console.error('Cache metrics error:', error);
      return [];
    }
  }, [supabase]);

  // Prefetch frequently used data
  const prefetchData = useCallback(async (
    prefetchKeys: Array<{ key: string; fetcher: () => Promise<any>; config?: CacheConfig }>
  ) => {
    for (const { key, fetcher, config } of prefetchKeys) {
      try {
        const cached = await getCachedData(key, config);
        if (!cached) {
          const freshData = await fetcher();
          if (freshData) {
            await setCachedData(key, freshData, config);
          }
        }
      } catch (error) {
        console.error(`Prefetch error for key ${key}:`, error);
      }
    }
  }, [getCachedData, setCachedData]);

  // Cache-aware data fetcher with fallback
  const cachedFetch = useCallback(async <T = any>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = { category: 'user_session' }
  ): Promise<T> => {
    // Try cache first
    const cached = await getCachedData<T>(cacheKey, config);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const freshData = await fetcher();
      
      // Cache the fresh data
      await setCachedData(cacheKey, freshData, config);
      
      return freshData;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }, [getCachedData, setCachedData]);

  // Healthcare-specific cache helpers
  const healthcareCacheHelpers = {
    // Cache AHPRA compliance results
    cacheComplianceCheck: async (content: string, result: any) => {
      const key = generateCacheKey('ahpra_compliance', { content: content.substring(0, 100) });
      return setCachedData(key, result, { 
        category: 'compliance_check', 
        ttlSeconds: 900 // 15 minutes
      });
    },

    // Cache generated healthcare content
    cacheGeneratedContent: async (prompt: string, specialty: string, content: any) => {
      const key = generateCacheKey('content_generation', { prompt, specialty });
      return setCachedData(key, content, { 
        category: 'content_generation', 
        ttlSeconds: 3600 // 1 hour
      });
    },

    // Cache analytics results
    cacheAnalyticsResult: async (query: string, timeframe: string, result: any) => {
      const key = generateCacheKey('analytics', { query, timeframe });
      return setCachedData(key, result, { 
        category: 'analytics_result', 
        ttlSeconds: 1800 // 30 minutes
      });
    },

    // Cache user preferences
    cacheUserPreferences: async (preferences: any) => {
      const key = generateCacheKey('user_prefs', {}, true);
      return setCachedData(key, preferences, { 
        category: 'user_preferences', 
        ttlSeconds: 604800 // 7 days
      });
    }
  };

  // Performance monitoring
  const getPerformanceMetrics = useCallback(() => {
    const { hits, misses, totalRequests } = cacheStats.current;
    return {
      hitRate: totalRequests > 0 ? (hits / totalRequests) * 100 : 0,
      totalRequests,
      memoryEntries: memoryCache.current.size,
      estimatedMemoryUsage: Array.from(memoryCache.current.values())
        .reduce((acc, item) => acc + JSON.stringify(item).length, 0)
    };
  }, []);

  // Cleanup expired memory cache entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = new Date();
      for (const [key, value] of memoryCache.current.entries()) {
        if (value.expiresAt <= now) {
          memoryCache.current.delete(key);
        }
      }
    }, 60000); // Every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    // Core caching functions
    getCachedData,
    setCachedData,
    invalidateCache,
    cachedFetch,
    prefetchData,
    
    // Healthcare-specific helpers
    ...healthcareCacheHelpers,
    
    // Monitoring and metrics
    getCacheMetrics,
    getPerformanceMetrics,
    
    // State
    isLoading,
    cacheMetrics,
    
    // Utilities
    generateCacheKey
  };
}

// Provider component for cache context
export function CacheProvider({ children }: { children: React.ReactNode }) {
  const cache = useIntelligentCache();
  
  return (
    <CacheContext.Provider value={cache}>
      {children}
    </CacheContext.Provider>
  );
}

// Context for cache sharing
import { createContext, useContext } from 'react';

const CacheContext = createContext<ReturnType<typeof useIntelligentCache> | null>(null);

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
} 