-- Update the featured images for the top two blog posts
UPDATE blog_posts 
SET featured_image = '/src/assets/ai-content-creation-hero.jpg'
WHERE slug = 'getting-started-ai-content-creation';

UPDATE blog_posts 
SET featured_image = '/src/assets/social-media-strategy-hero.jpg'
WHERE slug = 'social-media-strategy-small-businesses';