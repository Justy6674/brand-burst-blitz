-- Move demo posts to draft status so they don't appear on public blog
-- These can be reviewed and edited through the blog admin system

UPDATE blog_posts SET published = false WHERE published = true;

-- Update the posts to be more clearly marked as demo content
UPDATE blog_posts SET 
  title = '[DEMO] ' || title,
  excerpt = 'This is demo content for the healthcare platform. ' || COALESCE(excerpt, ''),
  author = 'Healthcare Demo Team'
WHERE published = false;