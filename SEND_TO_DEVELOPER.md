# Send This to Your Developer

## File to Deploy

**📦 `podsee-static-site.zip` (438 KB)**

This zip contains the entire static website ready for AWS deployment.

---

## What's Inside

The zip contains the `out/` folder with:
- `index.html` - Home page
- `results.html` - Results page
- `404.html` - Error page
- `_next/static/` - All JavaScript and CSS
- Images (logos)

**Total unzipped size:** 1.2 MB

---

## Deployment Instructions for Developer

### Option 1: AWS S3 (Simplest)

```bash
# 1. Unzip the file
unzip podsee-static-site.zip

# 2. Upload to S3
aws s3 sync out/ s3://your-bucket-name --delete

# 3. Enable static website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document 404.html

# 4. Make bucket public (add this bucket policy)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}

# 5. Access your site at:
# http://your-bucket-name.s3-website-REGION.amazonaws.com
```

### Option 2: AWS S3 + CloudFront (Production)

Same as Option 1, then:

```bash
# 6. Create CloudFront distribution
# - Origin: Your S3 bucket
# - Default Root Object: index.html
# - Error Pages: 404 → /404.html
```

### Option 3: AWS Amplify (Easiest)

1. Go to AWS Amplify Console
2. Click "Host web app"
3. Choose "Deploy without Git provider"
4. Upload `podsee-static-site.zip`
5. Done! Amplify handles everything

---

## Important Notes

✅ **No server needed** - This is a pure static site
✅ **No database needed** - All data is bundled in the files
✅ **No environment variables needed** - Everything is self-contained
✅ **No build step needed** - Already built and ready to deploy

❌ **Don't try to run `npm install` or `npm run build`** - Not needed!
❌ **Don't look for a server.js or API** - There isn't one!

---

## What the Site Does

- Shows 60 tuition centres in Singapore
- Filters by level (Primary/Secondary/JC) and subject
- Click a centre to see website or WhatsApp contact
- Fully responsive (mobile + desktop)
- No login, no database, no backend

---

## Testing Locally (Optional)

```bash
# Unzip
unzip podsee-static-site.zip

# Serve locally
cd out
python3 -m http.server 8080

# Visit http://localhost:8080
```

---

## Support

If your developer has questions:
- The site is 100% static HTML/JS/CSS
- No server runtime required
- No database required
- Just upload to any static hosting (S3, Netlify, Vercel, etc.)
- The `out/` folder is the entire website

**That's it!** 🚀
