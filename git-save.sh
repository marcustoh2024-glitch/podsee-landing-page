#!/bin/bash
# Quick save script - commits all changes with a timestamp

# Add all changes
git add .

# Create commit message with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Auto-save: $TIMESTAMP"

# Commit with message
git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin main

echo "✅ Changes saved, committed, and pushed to GitHub!"
