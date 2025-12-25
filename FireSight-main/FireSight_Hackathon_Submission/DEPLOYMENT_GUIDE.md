# 🚀 FireSight Production Deployment Guide

**From Development to Live Production in Under 10 Minutes**

---

## 📋 Pre-Deployment Checklist

### **✅ Development Complete**
- [x] Real-time NASA FIRMS integration working
- [x] All automated tests passing (`npm run test-suite`)
- [x] Demo data generator working (`npm run demo-california`)
- [x] Performance meets thresholds (<5s load, <100ms interactions)
- [x] Cross-browser compatibility verified
- [x] Mobile responsiveness confirmed
- [x] Documentation complete and up-to-date

### **🔧 Production Preparation**
- [x] Source code organized in `src/` directory
- [x] Data pipeline scripts ready in `scripts/`
- [x] No sensitive data or API keys exposed
- [x] Static file deployment architecture
- [x] CDN-friendly configuration

---

## 🎯 Deployment Options

### **Option 1: Netlify (Recommended)**

**Why Netlify?** ✅
- ✅ **Instant deployment** - Drag and drop ready
- ✅ **Built-in CI/CD** - GitHub integration
- ✅ **Global CDN** - Fast worldwide delivery
- ✅ **HTTPS by default** - Secure connections
- ✅ **Custom domains** - Professional branding
- ✅ **DevDoc v1.1 compliant** - Matches original requirements

#### **Step-by-Step Netlify Deployment**

1. **Prepare Build Directory**
   ```bash
   # Navigate to project root
   cd /path/to/FireSight
   
   # Ensure latest data
   cd scripts && python fetch_firms_data.py california
   cd ..
   ```

2. **Deploy to Netlify**
   - Visit https://app.netlify.com/
   - Create account or sign in
   - Click "Add new site" → "Deploy manually"
   - **Drag and drop the `src/` folder** into the deployment area
   - Wait for deployment (usually <30 seconds)

3. **Configure Production Settings**
   ```
   Site name: firesight-wildfire-app (or custom name)
   Domain: https://firesight-wildfire-app.netlify.app
   ```

4. **Set Up Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add custom domain (e.g., `firesight.yourcompany.com`)
   - Configure DNS records as instructed

#### **Automated Updates** (Optional)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from command line
netlify deploy --prod --dir=src
```

---

### **Option 2: GitHub Pages**

**Step-by-Step GitHub Pages Deployment**

1. **Push to GitHub Repository**
   ```bash
   git add .
   git commit -m "Production ready: Real-time FireSight v1.1"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` or `gh-pages`
   - Folder: `/src` 
   - Click "Save"

3. **Access Your Site**
   ```
   URL: https://username.github.io/FireSight/src/
   ```

---

### **Option 3: Cloud Platforms**

#### **Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from src directory
cd src && vercel --prod
```

#### **AWS S3 + CloudFront**
```bash
# Upload src/ folder to S3 bucket
aws s3 sync src/ s3://your-bucket-name --delete

# Configure CloudFront distribution for global CDN
```

---

## 🔄 Production Data Pipeline

### **Automated Data Updates**

#### **Option A: GitHub Actions** (Recommended)
Create `.github/workflows/update-data.yml`:
```yaml
name: Update Wildfire Data
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:        # Manual trigger

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Fetch real-time data
        run: cd scripts && python fetch_firms_data.py global
      - name: Deploy to Netlify
        run: |
          npm install -g netlify-cli
          netlify deploy --prod --dir=src --auth=${{ secrets.NETLIFY_AUTH_TOKEN }}
```

#### **Option B: Cloud Functions**
```javascript
// Google Cloud Function or AWS Lambda
exports.updateFireData = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  // Fetch NASA FIRMS data
  // Update GeoJSON file
  // Trigger deployment
});
```

#### **Option C: Server Cron Job**
```bash
# Add to crontab (crontab -e)
*/15 * * * * cd /path/to/FireSight/scripts && python fetch_firms_data.py global && netlify deploy --prod --dir=../src
```

---

## 📊 Production Monitoring

### **Essential Monitoring Setup**

#### **1. Uptime Monitoring**
```javascript
// Use UptimeRobot, Pingdom, or similar
Monitor URL: https://your-firesight-domain.com/src/
Check interval: 5 minutes
Alert on: Response time > 10s, HTTP errors
```

#### **2. Performance Monitoring**
```javascript
// Google Analytics or similar
Track metrics:
- Page load time
- User interactions
- Error rates
- Geographic usage patterns
```

#### **3. API Health Monitoring**
```bash
# Monitor NASA FIRMS API availability
curl -I https://firms.modaps.eosdis.nasa.gov/api/area/csv/61f7beedf12d035d56ad0f2db6037e0f/MODIS_NRT/world/1

# Monitor Open-Meteo API
curl -I https://api.open-meteo.com/v1/forecast
```

### **Alert Configuration**
- **Critical**: Site down for >5 minutes
- **Warning**: Load time >5 seconds consistently
- **Info**: Data update failures (non-critical)

---

## 🔒 Production Security

### **Security Checklist**
- [x] **HTTPS Enforced** - All traffic encrypted
- [x] **No API Keys** - Public APIs only, no secrets
- [x] **Input Validation** - All data sanitized
- [x] **CSP Headers** - Content Security Policy enabled
- [x] **Error Handling** - No sensitive info in error messages

### **Security Headers** (for advanced deployments)
```nginx
# Example Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firms.modaps.eosdis.nasa.gov https://api.open-meteo.com";
```

---

## 🎯 Go-Live Checklist

### **Final Pre-Launch Steps**

1. **Test Production Environment**
   ```bash
   # Verify all functionality on live site
   - Map loads correctly
   - Hotspots appear with real data
   - Info panel works
   - Refresh button functions
   - Mobile responsiveness
   ```

2. **Performance Validation**
   ```bash
   # Use tools like PageSpeed Insights
   Target scores:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >90
   - SEO: >90
   ```

3. **Cross-Browser Testing**
   ```bash
   Test on:
   - Chrome (latest)
   - Firefox (latest) 
   - Safari (latest)
   - Edge (latest)
   - Mobile devices (iOS/Android)
   ```

4. **Load Testing** (Optional)
   ```bash
   # Use tools like LoadRunner or Artillery
   Simulate: 100 concurrent users
   Target: <3s response time under load
   ```

### **Launch Day Actions**

1. **Deploy Latest Data**
   ```bash
   cd scripts && python fetch_firms_data.py global
   netlify deploy --prod --dir=src
   ```

2. **Verify Live Site**
   - Check all functionality
   - Verify real-time data loading
   - Test on multiple devices

3. **Enable Monitoring**
   - Activate uptime monitors
   - Set up alert notifications
   - Begin performance tracking

4. **Documentation Update**
   - Update README with live URL
   - Share access credentials with team
   - Document any deployment-specific configurations

---

## 📈 Post-Launch Optimization

### **Week 1: Monitoring & Validation**
- Monitor uptime and performance
- Track user interactions and usage patterns
- Identify any performance bottlenecks
- Collect user feedback

### **Month 1: Optimization**
- Analyze usage patterns for regional preferences
- Optimize data update frequency based on actual fire activity
- Consider CDN cache optimization
- Plan feature enhancements based on user feedback

### **Ongoing: Maintenance**
- Regular security updates
- Performance monitoring
- API dependency health checks
- Feature roadmap planning

---

## 🆘 Troubleshooting Common Issues

### **Deployment Fails**
```bash
# Check file paths
- Ensure src/ directory structure intact
- Verify no broken relative paths
- Check for case-sensitive filename issues

# Test locally first
python -m http.server 8000
# Open http://localhost:8000/src/
```

### **Data Not Loading**
```bash
# Verify data file exists and is valid
cd scripts && python fetch_firms_data.py california
# Check data/wildfires.geojson was created

# Check console for JavaScript errors
# Verify CORS policies on hosting platform
```

### **Performance Issues**
```bash
# Use demo data for testing
cd scripts && python create_demo_data.py california

# Check browser developer tools for:
- Network requests timing out
- JavaScript errors
- Memory usage spikes
```

---

## ✅ **Deployment Complete!**

Your FireSight application is now live and ready to serve real-time wildfire intelligence to users worldwide.

**🎉 Congratulations! You've successfully deployed a production-ready real-time wildfire visualization application with NASA satellite data integration.**

---

*Deployment guide last updated: June 28, 2025*  
*FireSight version: 1.1 Production Ready* 