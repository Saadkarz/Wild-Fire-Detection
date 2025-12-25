# 🚀 FireSight Deployment Guide

## Netlify Drag & Drop (Recommended for Hackathon)

### Step 1: Prepare Files
No build step needed! The project is ready to deploy as-is.

### Step 2: Deploy
1. Open https://app.netlify.com/drop
2. Drag the entire `FireSight` folder into the browser
3. Wait ~10 seconds for upload
4. Your app is live! 🎉

### Step 3: Get Your URL
- Netlify provides instant URL: `https://amazing-fire-abc123.netlify.app`
- Copy this for your presentation

### Optional: Custom Domain
1. Click "Site settings"
2. Change site name to something memorable like `firesight-demo`
3. New URL: `https://firesight-demo.netlify.app`

## Alternative: GitHub + Netlify CI

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial FireSight commit"
git remote add origin https://github.com/YOUR_USERNAME/firesight.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Log in to Netlify
2. Click "New site from Git"
3. Choose GitHub → Select your repo
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `.`
5. Click "Deploy site"

### Step 3: Auto-deploy Ready
- Every push to `main` triggers new deployment
- Preview deployments for pull requests

## Testing Deployment
1. Visit your Netlify URL
2. Check all features work:
   - 3D/2D toggle
   - Hotspot interactions
   - Data refresh
3. Share URL in presentation!

## Troubleshooting

### CORS Issues?
- Netlify handles CORS automatically
- If issues persist, check `netlify.toml` headers

### 404 Errors?
- Ensure all files are in root directory
- Check file paths are relative (no leading `/`)

### Slow Loading?
- First load downloads Cesium assets (~10MB)
- Subsequent loads are cached

## Production Considerations
For real deployment beyond hackathon:
- Add custom domain
- Enable Netlify Analytics
- Set up error monitoring
- Add PWA manifest for mobile
- Implement real FIRMS API integration 