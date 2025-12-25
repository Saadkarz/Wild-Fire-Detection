# 🔥 FireSight Real-Time Testing - Quick Start Guide

Get started with real-time wildfire data testing in under 5 minutes!

## Prerequisites

- **Python 3.7+** installed
- **Internet connection** for NASA FIRMS data
- **Modern web browser** (Chrome, Firefox, Safari)

## Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Automated Testing Suite
```bash
npm run test-suite
```
This will validate:
- ✅ NASA FIRMS API connectivity
- ✅ Data fetching and parsing
- ✅ GeoJSON conversion
- ✅ Wind data integration
- ✅ File persistence

### 3. Fetch Real-Time Data & Start Application
```bash
# Option A: Global wildfire data
npm run test-realtime

# Option B: California-focused testing
npm run test-california

# Option C: Australia-focused testing  
npm run test-australia
```

### 4. Open Application
Navigate to **http://localhost:8000**

## What You Should See

### ✅ **Successful Real-Time Testing:**
- Red hotspot markers on the map
- Yellow prediction circles around hotspots
- Clickable markers showing satellite data details
- "Last updated" timestamp in header
- Functional refresh button

### ⚠️ **Low Fire Activity (Normal):**
- "No active hotspots in view" message
- Retry button available
- Application loads normally

### ❌ **Issues to Check:**
- No markers appear → Check console for errors
- API failures → Run `npm run test-suite` first
- Performance issues → Try regional data (`npm run test-california`)

## Testing Scenarios

### **Scenario 1: Peak Fire Season Testing**
```bash
# During fire season (May-Oct Northern, Nov-Mar Southern)
npm run fetch-california    # High activity expected
npm start
```
**Expected**: 50-500+ hotspots, good for performance testing

### **Scenario 2: Off-Season Testing**
```bash
# During low fire activity periods
npm run fetch-global
npm start
```
**Expected**: 0-50 hotspots, good for edge case testing

### **Scenario 3: API Resilience Testing**
```bash
# Test error handling
npm run test-suite         # Validate all systems
npm run fetch-no-wind      # Test fallback behavior
npm start
```

### **Scenario 4: Continuous Monitoring**
```bash
# Auto-update every 15 minutes
npm run monitor
```
**Use Case**: Long-term stability testing

## Real-Time Data Validation

### **Check Data Quality:**
1. **Hotspot Locations**: Verify markers appear in fire-prone regions
2. **Timestamps**: Should be within last 24 hours
3. **Spread Predictions**: Circles should be 1-15km radius
4. **Info Panel**: Click markers to see satellite details

### **Performance Metrics:**
- **Load Time**: < 5 seconds initial load
- **Refresh**: < 3 seconds for updates  
- **Interactions**: < 100ms hover/click response
- **Memory**: < 100MB sustained usage

## Common Commands

```bash
# Data fetching
npm run fetch-data          # Default global
npm run fetch-california    # US-focused
npm run fetch-australia     # Australia/NZ-focused
npm run fetch-no-wind       # Skip wind enhancement

# Testing
npm run test-suite          # Comprehensive validation
npm run test-realtime       # Quick global test
npm run test-california     # Regional test

# Server only
npm start                   # Local server at :8000

# Monitoring
npm run monitor             # Continuous updates
```

## Troubleshooting

### **No Hotspots Appearing?**
```bash
# 1. Check API connectivity
npm run test-suite

# 2. Verify data fetch
npm run fetch-data
# Look for output: "✅ Found X hotspots"

# 3. Check console in browser
# Open Developer Tools → Console
# Look for JavaScript errors
```

### **Performance Issues?**
```bash
# Use regional data instead of global
npm run fetch-california
npm start

# Monitor system resources
# Check memory usage in browser task manager
```

### **API Errors?**
```bash
# Check network connectivity
curl -I https://firms.modaps.eosdis.nasa.gov/

# Try different region
npm run fetch-australia

# Fall back to no-wind mode
npm run fetch-no-wind
```

## Expected Results by Season

### **🔥 High Fire Activity (Current Season)**
- **Northern Hemisphere (May-Oct)**: California, Mediterranean, Siberia
- **Southern Hemisphere (Nov-Mar)**: Australia, Southern Africa
- **Expected**: 100-1000+ hotspots globally
- **Best for**: Performance and load testing

### **🌱 Low Fire Activity (Off Season)**
- **Expected**: 10-100 hotspots globally
- **Best for**: Error handling and edge case testing
- **Note**: Empty states are normal and expected

## Next Steps

1. **✅ Validate Core Functionality**: Run through all test scenarios
2. **📊 Performance Testing**: Monitor with large datasets
3. **🌍 Geographic Testing**: Test different world regions
4. **⏱️ Extended Testing**: Leave running for several hours
5. **🚀 Production Deployment**: Deploy to Netlify/Zeabur

## Advanced Testing

### **Custom Region Testing**
Modify `scripts/fetch_firms_data.py` to add custom regional endpoints or date ranges.

### **Load Testing**
Use browser DevTools to simulate:
- Slow network conditions
- Limited memory environments
- Mobile device constraints

### **API Integration Testing**
Test with different API parameters:
- Different time ranges
- Alternative satellite sources
- Custom confidence thresholds

---

## 🚀 Ready to Start?

Run this one command to get started:
```bash
npm run test-suite && npm run test-california
```

Then open **http://localhost:8000** and start exploring real-time wildfire data!

---

**Need Help?** Check the detailed [Real-Time Testing Plan](real_time_testing_plan.md) for comprehensive testing procedures. 