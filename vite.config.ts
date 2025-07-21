import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';
import { componentTagger } from "lovable-tagger";

// FORCE LOVABLE DEPLOYMENT: 21-JUL-2025-18:05
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Bundle analyzer for development
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: 'hidden',
    
    // Minimize build output
    minify: 'esbuild',
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading - packages only
        manualChunks: {
          // Vendor chunks - large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog', 
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers'],
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-date': ['date-fns'],
          'vendor-validation': ['zod'],
          'vendor-ui-extra': ['sonner']
        },
        
        // Dynamic file naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      
      // External dependencies for CDN loading
      external: process.env.NODE_ENV === 'production' ? [] : [],
    },
    
    // Target modern browsers for better optimization
    target: 'esnext',
    
    // Optimize for Australian CDN distribution
    assetsDir: 'assets',
    
    // Compression settings
    reportCompressedSize: true,
  },
  
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@tanstack/react-query'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Australian CDN and caching optimizations
  base: process.env.VITE_CDN_URL || '/',
  
  // Image optimization
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg', '**/*.gif'],
  
  // Preview server for production testing
  preview: {
    host: "::",
    port: 4173,
    headers: {
      // Australian CDN headers
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  
  // Environment variables for Australian deployment
  define: {
    __AUSTRALIA_TIMEZONE__: '"Australia/Sydney"',
    __BUILD_TIMESTAMP__: Date.now(),
    __CDN_OPTIMIZED__: process.env.NODE_ENV === 'production'
  }
}));
