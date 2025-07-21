#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Image optimization configuration
const OPTIMIZATION_CONFIG = {
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true
  },
  webp: {
    quality: 85,
    effort: 6
  },
  png: {
    quality: 90,
    compressionLevel: 9,
    progressive: true
  },
  // Responsive image sizes for Australian mobile users
  responsiveSizes: [320, 640, 768, 1024, 1280, 1920],
  // Modern format priorities
  formats: ['webp', 'avif', 'jpeg']
};

// Large images that need optimization (based on build output)
const TARGET_IMAGES = [
  'src/assets/hero-image.jpg',           // 105.04 kB
  'src/assets/roi-data-driven-hero.jpg', // 139.56 kB  
  'src/assets/social-media-strategy-hero.jpg', // 153.72 kB
  'src/assets/ai-content-creation-hero.jpg', // 160.62 kB
  'src/assets/features-image.jpg',       // 46.18 kB
  'src/assets/brand-consistency-hero.jpg',
  'src/assets/future-content-marketing-hero.jpg',
  'src/assets/seo-social-media-hero.jpg'
];

async function optimizeImage(inputPath, outputDir) {
  const filename = path.parse(inputPath).name;
  const ext = path.parse(inputPath).ext.toLowerCase();
  
  console.log(`🔄 Optimizing: ${inputPath}`);
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`   Original: ${metadata.width}x${metadata.height}, ${Math.round(metadata.density || 72)} DPI`);
    
    const optimizations = [];
    
    // Generate responsive sizes
    for (const width of OPTIMIZATION_CONFIG.responsiveSizes) {
      if (width < metadata.width) {
        // WebP format (best compression)
        optimizations.push(
          image
            .clone()
            .resize(width, null, { 
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 
            })
            .webp(OPTIMIZATION_CONFIG.webp)
            .toFile(path.join(outputDir, `${filename}-${width}w.webp`))
        );
        
        // AVIF format (next-gen, smaller than WebP)
        optimizations.push(
          image
            .clone()
            .resize(width, null, { 
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 
            })
            .avif({ quality: 80, effort: 9 })
            .toFile(path.join(outputDir, `${filename}-${width}w.avif`))
        );
        
        // JPEG fallback
        optimizations.push(
          image
            .clone()
            .resize(width, null, { 
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3 
            })
            .jpeg(OPTIMIZATION_CONFIG.jpeg)
            .toFile(path.join(outputDir, `${filename}-${width}w.jpg`))
        );
      }
    }
    
    // Original size optimized versions
    if (ext === '.jpg' || ext === '.jpeg') {
      // Optimized WebP
      optimizations.push(
        image
          .clone()
          .webp(OPTIMIZATION_CONFIG.webp)
          .toFile(path.join(outputDir, `${filename}.webp`))
      );
      
      // Optimized AVIF
      optimizations.push(
        image
          .clone()
          .avif({ quality: 80, effort: 9 })
          .toFile(path.join(outputDir, `${filename}.avif`))
      );
      
      // Optimized JPEG
      optimizations.push(
        image
          .clone()
          .jpeg(OPTIMIZATION_CONFIG.jpeg)
          .toFile(path.join(outputDir, `${filename}.jpg`))
      );
    }
    
    await Promise.all(optimizations);
    console.log(`   ✅ Generated ${optimizations.length} optimized variants`);
    
  } catch (error) {
    console.error(`   ❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function generateImageManifest(outputDir) {
  const manifestPath = path.join(outputDir, 'image-manifest.json');
  const images = {};
  
  // Scan optimized images
  const files = fs.readdirSync(outputDir);
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.webp') || file.endsWith('.avif')) {
      const match = file.match(/^(.+?)(?:-(\d+)w)?\.(webp|avif|jpg)$/);
      if (match) {
        const [, basename, width, format] = match;
        
        if (!images[basename]) {
          images[basename] = {
            formats: {},
            responsive: {}
          };
        }
        
        if (width) {
          if (!images[basename].responsive[width]) {
            images[basename].responsive[width] = {};
          }
          images[basename].responsive[width][format] = file;
        } else {
          images[basename].formats[format] = file;
        }
      }
    }
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(images, null, 2));
  console.log(`📄 Generated image manifest: ${manifestPath}`);
  
  return images;
}

async function generateResponsiveImageComponent() {
  const componentPath = 'src/components/ui/responsive-image.tsx';
  const componentCode = `import React from 'react';
import imageManifest from '../../assets/optimized/image-manifest.json';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false
}) => {
  const imageName = src.split('/').pop()?.replace(/\\.\\w+$/, '') || '';
  const imageData = imageManifest[imageName];
  
  if (!imageData) {
    // Fallback to original image
    return <img src={src} alt={alt} className={className} />;
  }
  
  // Generate srcSet for different formats and sizes
  const generateSrcSet = (format: 'webp' | 'avif' | 'jpg') => {
    const responsive = imageData.responsive;
    return Object.entries(responsive)
      .map(([width, formats]: [string, any]) => formats[format] ? \`/assets/optimized/\${formats[format]} \${width}w\` : null)
      .filter(Boolean)
      .join(', ');
  };
  
  const webpSrcSet = generateSrcSet('webp');
  const avifSrcSet = generateSrcSet('avif');
  const jpegSrcSet = generateSrcSet('jpg');
  
  return (
    <picture>
      {avifSrcSet && (
        <source 
          srcSet={avifSrcSet} 
          type="image/avif" 
          sizes={sizes}
        />
      )}
      {webpSrcSet && (
        <source 
          srcSet={webpSrcSet} 
          type="image/webp" 
          sizes={sizes}
        />
      )}
      {jpegSrcSet && (
        <source 
          srcSet={jpegSrcSet} 
          type="image/jpeg" 
          sizes={sizes}
        />
      )}
      <img 
        src={imageData.formats.jpg ? \`/assets/optimized/\${imageData.formats.jpg}\` : src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
};

export default ResponsiveImage;`;
  
  // Ensure directory exists
  const dir = path.dirname(componentPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(componentPath, componentCode);
  console.log(`🎨 Generated ResponsiveImage component: ${componentPath}`);
}

async function main() {
  console.log('🚀 Starting Australian-optimized image optimization...');
  
  // Create optimized assets directory
  const optimizedDir = 'src/assets/optimized';
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir, { recursive: true });
  }
  
  // Check if sharp is available
  try {
    require('sharp');
  } catch (error) {
    console.error('❌ Sharp not found. Installing...');
    const { execSync } = require('child_process');
    execSync('npm install --save-dev sharp', { stdio: 'inherit' });
  }
  
  // Optimize each target image
  for (const imagePath of TARGET_IMAGES) {
    if (fs.existsSync(imagePath)) {
      await optimizeImage(imagePath, optimizedDir);
    } else {
      console.log(`⚠️  Image not found: ${imagePath}`);
    }
  }
  
  // Generate image manifest
  const manifest = await generateImageManifest(optimizedDir);
  
  // Generate responsive image component
  await generateResponsiveImageComponent();
  
  // Calculate space savings
  const originalSize = TARGET_IMAGES.reduce((total, imagePath) => {
    if (fs.existsSync(imagePath)) {
      return total + fs.statSync(imagePath).size;
    }
    return total;
  }, 0);
  
  const optimizedFiles = fs.readdirSync(optimizedDir).filter(f => f.endsWith('.webp'));
  const optimizedSize = optimizedFiles.reduce((total, file) => {
    return total + fs.statSync(path.join(optimizedDir, file)).size;
  }, 0);
  
  const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
  
  console.log(\`\n📊 Optimization Results:\`);
  console.log(\`   Original: \${(originalSize / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`   Optimized WebP: \${(optimizedSize / 1024 / 1024).toFixed(2)} MB\`);
  console.log(\`   Space Savings: \${savings}%\`);
  console.log(\`   Generated: \${Object.keys(manifest).length} image sets\`);
  
  console.log(\`\n✅ Image optimization complete! Australian users will experience:\`);
  console.log(\`   📱 Faster mobile loading\`);
  console.log(\`   🌐 Reduced data usage\`);
  console.log(\`   ⚡ Better Core Web Vitals\`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, generateImageManifest }; 