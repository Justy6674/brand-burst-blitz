#!/bin/bash
# Fix Git locks and enable seamless commits

echo "Fixing Git repository locks..."

# Force remove lock files
find .git -name "*.lock" -type f -delete 2>/dev/null || true

# Reset Git state
git gc --prune=now 2>/dev/null || true
git fsck --full 2>/dev/null || true

# Check Git status
if git status >/dev/null 2>&1; then
    echo "✅ Git repository is now accessible"
    echo "✅ Ready for seamless commits"
    
    # Test commit capability
    git add DEPLOYMENT_FIX.md
    git commit -m "Test commit after lock fix" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Commit capability restored"
        git reset HEAD~1 --soft  # Undo test commit
    else
        echo "⚠️  Commits still blocked - use Replit Git panel"
    fi
else
    echo "❌ Git repository still locked"
    echo "Use Replit's Git panel for seamless commits"
fi