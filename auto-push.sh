#!/bin/bash
# Auto-push script - watches for changes and automatically pushes to GitHub

echo "🔄 Auto-push to GitHub is now active!"
echo "Every file save will be automatically committed and pushed."
echo "Press Ctrl+C to stop."
echo ""

# Use fswatch if available (macOS), otherwise use a simple loop
if command -v fswatch &> /dev/null; then
    # Using fswatch for better file watching on macOS
    fswatch -o . --exclude='.git' --exclude='node_modules' --exclude='.next' | while read f; do
        echo "📝 Changes detected..."
        git add .
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        git commit -m "Auto-save: $TIMESTAMP" 2>/dev/null
        if [ $? -eq 0 ]; then
            git push origin main
            echo "✅ Pushed to GitHub at $TIMESTAMP"
        fi
    done
else
    # Fallback: Simple periodic check
    echo "⚠️  Install fswatch for better performance: brew install fswatch"
    echo "Using fallback mode (checks every 30 seconds)"
    echo ""
    
    while true; do
        if [[ -n $(git status -s) ]]; then
            echo "📝 Changes detected..."
            git add .
            TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
            git commit -m "Auto-save: $TIMESTAMP"
            git push origin main
            echo "✅ Pushed to GitHub at $TIMESTAMP"
        fi
        sleep 30
    done
fi
