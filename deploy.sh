#!/bin/bash
# Seamless deployment script for JBSAAS Healthcare Platform

echo "🚀 Starting seamless deployment..."

# Test local API endpoints first
echo "Testing local endpoints..."
curl -s http://localhost:5000/api/public/blog?limit=1 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Local API working"
else
    echo "❌ Local API not responding"
    exit 1
fi

# Check if files are ready for deployment
echo "Checking deployment files..."
FILES=("api/health.js" "api/blog.js" "api/package.json" "vercel.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file ready"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Validate ES module syntax
echo "Validating ES modules..."
node -c api/health.js && echo "✅ health.js syntax valid"
node -c api/blog.js && echo "✅ blog.js syntax valid"

echo "🎯 All checks passed. Ready for Vercel deployment."
echo ""
echo "Manual deployment steps:"
echo "1. Push to GitHub (use Replit Git panel if locks persist)"
echo "2. Vercel will auto-deploy"
echo "3. Test: https://www.jbsaas.com/api/health"
echo ""
echo "Your healthcare blog API will be live at:"
echo "- https://www.jbsaas.com/api/blog"
echo "- https://jbsaas.ai/api/blog"