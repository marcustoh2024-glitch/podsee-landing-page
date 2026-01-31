# GitHub Setup Instructions

## Your Git repository is initialized! ✅

### Next Steps:

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `podsee-landing-page` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

## 2. Connect Your Local Repository to GitHub

Once you create the GitHub repo, run these commands:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push your code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

## 3. Auto-Save Options

### Option A: Manual Quick Save (Recommended)
Run this command whenever you want to save your changes:
```bash
./git-save.sh
```

This will:
- Add all changes
- Commit with a timestamp
- (Optional) Push to GitHub

### Option B: Enable Auto-Commit Hook
To enable automatic commits on every file save:

1. Open Kiro's Agent Hooks panel (View → Agent Hooks)
2. Enable the "Auto-commit on save" hook
3. Every time you save a file, it will auto-commit

**Note:** Auto-commit can create many commits. Consider using manual saves for cleaner history.

## 4. Enable Auto-Push to GitHub

Once you've set up the remote, edit `git-save.sh` and uncomment this line:
```bash
# git push origin main
```

Change it to:
```bash
git push origin main
```

Now every save will also push to GitHub!

## Current Status

✅ Git initialized
✅ Initial commit created (42 files)
✅ Quick save script created (`git-save.sh`)
✅ Auto-commit hook configured (disabled by default)

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Quick save (using our script)
./git-save.sh

# Manual commit
git add .
git commit -m "Your message here"
git push

# View remote
git remote -v
```
