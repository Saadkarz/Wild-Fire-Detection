# FireSight Local Testing Checklist

## 🚀 Quick Start
1. Open terminal in project directory
2. Run: `./start.sh` or `python -m http.server 8000`
3. Open browser: http://localhost:8000

## ✅ Core Functionality Tests

### Initial Load
- [ ] Page loads without errors
- [ ] 2D map shows US mainland view
- [ ] 5 red hotspots visible in California area
- [ ] Yellow spread prediction rings visible around each hotspot
- [ ] Header shows "FireSight" title and last updated timestamp

### Hotspot Interaction
- [ ] Hover over hotspot - size increases from 6px to 8px
- [ ] Mouse cursor changes to pointer on hover
- [ ] Click hotspot - info panel slides in from left
- [ ] Info panel shows all data fields:
  - Location (lat/lon)
  - Brightness Temperature (K)
  - Acquisition Time
  - Confidence Level
  - Satellite
  - Predicted Spread (6h)
  - Share Location button
- [ ] Click X or outside panel - panel slides out



### Data Refresh
- [ ] Click refresh button (🔄) - button shows loading spinner
- [ ] Data reloads successfully
- [ ] Timestamp updates
- [ ] Loading spinner disappears

### Error Handling
- [ ] Stop server (Ctrl+C) and click refresh
- [ ] Red error banner appears at top
- [ ] Error message shows "Data fetch failed"
- [ ] Banner auto-dismisses after 5 seconds
- [ ] "Retry?" button works
- [ ] Restart server - refresh works again

### Empty State
- [ ] Zoom to ocean area with no hotspots
- [ ] "No active hotspots in view" message appears
- [ ] Retry button visible and functional

### Performance
- [ ] 2D map pans/zooms smoothly
- [ ] Info panel animation is smooth (slide-in/out)
- [ ] Hover effects are responsive
- [ ] No console errors

### Deep Linking
- [ ] Visit: http://localhost:8000?lat=34.123&lon=-118.456
- [ ] Camera flies to specified location

## 🎨 Visual Checks
- [ ] Dark theme consistent throughout
- [ ] Fire colors (red/yellow) used appropriately
- [ ] Readable text contrast
- [ ] Mobile responsive (resize browser window)

## 📊 Data Verification
- [ ] Check console: No JavaScript errors
- [ ] Network tab: wildfires.geojson loads successfully
- [ ] Spread radius values reasonable (3-5 km)

## 🚨 Known Issues
- Map tiles may take a moment to load on slow connections
- Auto-refresh may briefly show loading state

## 📝 Notes for Demo
- Works in all modern browsers
- Have backup screenshots ready
- Test on projector/external display before presentation
- Much more reliable without 3D dependencies 