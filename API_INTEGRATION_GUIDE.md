# 🌐 JBSAAS Blog API Integration Guide
*For Non-Technical Users - Simple Copy & Paste Integration*

## 📖 What This Does
Your healthcare platform blog content can now be displayed on ANY website or app. This is perfect for:
- Your main business website
- Patient education portals  
- Healthcare practice websites
- Mobile apps
- Any frontend application

## 🚀 Ready-to-Use API Endpoints

### Get All Blog Posts
```
GET https://www.jbsaas.com/api/blog
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "title": "AHPRA Guidelines for Social Media",
      "slug": "ahpra-social-media-guidelines",
      "excerpt": "Essential compliance tips for healthcare professionals...",
      "author": "Dr. Sarah Johnson",
      "category": "Compliance",
      "tags": ["AHPRA", "Social Media", "Compliance"],
      "featuredImage": "https://...",
      "publishedAt": "2025-01-22T10:00:00Z",
      "url": "/blog/ahpra-social-media-guidelines"
    }
  ],
  "meta": {
    "total": 1,
    "crawlable": true
  }
}
```

### Get Single Blog Post
```
GET https://www.jbsaas.com/api/blog?slug=your-post-slug
```

## 🔧 Simple Integration Examples

### HTML/JavaScript (Copy & Paste)
```html
<div id="blog-posts"></div>
<script>
fetch('https://www.jbsaas.com/api/blog?limit=5')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('blog-posts');
    data.data.forEach(post => {
      container.innerHTML += `
        <article>
          <h2>${post.title}</h2>
          <p>${post.excerpt}</p>
          <a href="/blog/${post.slug}">Read More</a>
        </article>
      `;
    });
  });
</script>
```

### React Component
```jsx
import { useEffect, useState } from 'react';

function BlogList() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetch('https://www.jbsaas.com/api/blog')
      .then(res => res.json())
      .then(data => setPosts(data.data));
  }, []);
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <a href={`/blog/${post.slug}`}>Read More</a>
        </article>
      ))}
    </div>
  );
}
```

## 🎯 URL Parameters (Filtering)

### Get Latest 5 Posts
```
https://www.jbsaas.com/api/blog?limit=5
```

### Get Featured Posts Only
```
https://www.jbsaas.com/api/blog?featured=true
```

### Get Posts by Category
```
https://www.jbsaas.com/api/blog?category=Compliance
```

## ✅ SEO & Google Benefits

### Automatic SEO Features:
- ✅ **Google Crawlable**: Search engines can index your content
- ✅ **Cache Headers**: Fast loading (5-10 minute cache)
- ✅ **SEO-Friendly URLs**: `/blog/post-slug` format
- ✅ **Meta Descriptions**: Built-in SEO data
- ✅ **Structured Data**: JSON format perfect for crawlers

### For Best SEO Results:
1. Use the `slug` field for clean URLs
2. Include `metaDescription` in your HTML meta tags
3. Display `featuredImage` for social sharing
4. Use `tags` for keyword optimization

## 🛡️ Security & Reliability

### What's Protected:
- ✅ **Read-Only Access**: External sites can only READ blog posts
- ✅ **Published Only**: Draft posts are never exposed
- ✅ **No Authentication**: Simple public access (perfect for websites)
- ✅ **CORS Enabled**: Works from any domain
- ✅ **Rate Limited**: Cached responses prevent overload

### Healthcare Compliance:
- ✅ **AHPRA Compliant**: All published content pre-validated
- ✅ **TGA Compliant**: Therapeutic advertising rules enforced
- ✅ **Professional Content**: Healthcare-specific templates

## 📱 Use Cases

### 1. Practice Website Integration
Display your latest health articles on your clinic website automatically.

### 2. Patient Education Portal
Show categorized health information to patients.

### 3. Mobile Health App
Integrate professional healthcare content into your app.

### 4. Social Media Automation
Pull blog content for social media posting.

## 🌐 Available Domains

Your JBSAAS blog API is available on both domains:

**Primary Domain:**
```
https://www.jbsaas.com/api/blog
```

**Alternative Domain:**
```
https://jbsaas.ai/api/blog
```

Both domains serve the same content and functionality.

## 🚀 Go Live Checklist

- [x] API endpoints configured for www.jbsaas.com and jbsaas.ai
- [ ] Test the API endpoints in your browser
- [ ] Implement the JavaScript code on your website
- [ ] Check that posts are displaying correctly
- [ ] Verify SEO meta tags are working
- [ ] Test on mobile devices

## 🆘 Support

**Working?** ✅ Your blog API is ready for external integration!

**Not Working?** Check:
1. Are there published blog posts in your JBSAAS system?
2. Is your website's JavaScript console showing any errors?
3. Try both domains: www.jbsaas.com and jbsaas.ai

---

*This API serves published healthcare content from your JBSAAS platform to any external website or application. Perfect for non-technical users who want to display professional healthcare content.*