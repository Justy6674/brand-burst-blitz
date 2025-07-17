-- Update the featured images for the remaining blog posts that were using placeholder.svg
UPDATE blog_posts 
SET featured_image = '/src/assets/future-content-marketing-hero.jpg'
WHERE slug = 'future-content-marketing-2024';

UPDATE blog_posts 
SET featured_image = '/src/assets/brand-consistency-hero.jpg'
WHERE slug = 'building-brand-consistency-digital-platforms';

UPDATE blog_posts 
SET featured_image = '/src/assets/roi-data-driven-hero.jpg'
WHERE slug = 'maximizing-roi-data-driven-content-strategies';