# FireSight Real-Time Testing Plan

## Overview
This document outlines the comprehensive testing strategy for FireSight with real-time NASA FIRMS satellite data integration. The testing covers multiple scenarios, regions, and edge cases to ensure robust performance in production.

## Testing Objectives

### 1. **Data Integration Validation**
- Verify real-time NASA FIRMS data fetching
- Test data parsing and transformation accuracy
- Validate GeoJSON output format compliance
- Ensure coordinate system accuracy

### 2. **Performance & Reliability**
- Test application responsiveness with varying data volumes
- Validate error handling for API failures
- Test auto-refresh functionality under different conditions
- Monitor memory usage with large datasets

### 3. **Geographic Coverage**
- Test global wildfire data visualization
- Validate region-specific data accuracy
- Test coordinate precision across different hemispheres
- Verify map projection accuracy

### 4. **Real-Time Features**
- Test 15-minute auto-refresh mechanism
- Validate manual refresh functionality
- Test spread prediction calculations with real wind data
- Verify timestamp accuracy and timezone handling

## Testing Scenarios

### **Scenario 1: High Fire Activity Regions**
**Objective**: Test performance with dense wildfire data

**Regions to Test**:
- California (fire season: May-October)
- Australia (fire season: November-March)
- Mediterranean Europe (fire season: June-September)
- Siberia (fire season: April-September)

**Test Steps**:
```bash
# Fetch California data
npm run fetch-california

# Start server and validate
npm start
# Navigate to http://localhost:8000
# Verify hotspots appear on map
# Check spread prediction circles
# Test info panel interactions
```

**Validation Criteria**:
- ✅ All hotspots render correctly
- ✅ Spread predictions show realistic radii (1-15 km)
- ✅ Info panel shows complete data
- ✅ Performance remains smooth (< 2s load time)

### **Scenario 2: Low Fire Activity Testing**
**Objective**: Test graceful handling of sparse or no data

**Test Steps**:
```bash
# Test during low fire season or use filtered data
npm run fetch-global

# If no data available, test empty state
```

**Validation Criteria**:
- ✅ Empty state message displays correctly
- ✅ "No active hotspots in view" appears
- ✅ Retry button functions properly
- ✅ Application doesn't crash or freeze

### **Scenario 3: API Failure Simulation**
**Objective**: Test error handling and recovery

**Test Steps**:
1. Temporarily modify FIRMS URLs to invalid endpoints
2. Run data fetch and observe error handling
3. Test retry functionality
4. Restore correct URLs and verify recovery

**Validation Criteria**:
- ✅ Error banner appears with descriptive message
- ✅ Retry button allows recovery
- ✅ Application maintains functionality after recovery
- ✅ No console errors or crashes

### **Scenario 4: Large Dataset Performance**
**Objective**: Test performance with maximum data loads

**Test Steps**:
```bash
# Fetch global data during peak fire season
npm run fetch-global

# Monitor performance metrics
```

**Performance Thresholds**:
- ✅ Initial load: < 5 seconds
- ✅ Map interactions: < 100ms response
- ✅ Info panel: < 200ms open time
- ✅ Memory usage: < 100MB after 1 hour

### **Scenario 5: Wind Data Integration**
**Objective**: Validate enhanced spread predictions with real wind data

**Test Steps**:
```bash
# Test with wind data (default)
npm run fetch-california

# Test without wind data (fallback)
npm run fetch-no-wind
```

**Validation Criteria**:
- ✅ Wind-enhanced predictions show variation
- ✅ Fallback works when wind API fails
- ✅ Spread radii adapt to local wind conditions
- ✅ No significant performance impact

## Automated Testing Commands

### **Quick Start Testing**
```bash
# Test with real-time global data
npm run test-realtime

# Test specific regions
npm run test-california
npm run test-australia

# Start continuous monitoring (15-min updates)
npm run monitor
```

### **Manual Testing Commands**
```bash
# Fetch data only
npm run fetch-data          # Default global
npm run fetch-global        # Explicit global
npm run fetch-california    # US focus
npm run fetch-australia     # Australia/NZ focus
npm run fetch-no-wind       # Without wind enhancement

# Start server only
npm start
```

## Testing Checklist

### **Pre-Testing Setup**
- [ ] Ensure Python 3.7+ installed
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Verify internet connection
- [ ] Check NASA FIRMS service status

### **Core Functionality Tests**
- [ ] **Data Fetching**: NASA FIRMS APIs respond correctly
- [ ] **Data Parsing**: CSV parsing handles all field variations
- [ ] **GeoJSON Conversion**: Output format validates
- [ ] **Map Rendering**: All hotspots appear correctly
- [ ] **Spread Predictions**: Circles display with accurate radii
- [ ] **Interactive Features**: Click/hover/info panel work
- [ ] **Auto-Refresh**: 15-minute updates function
- [ ] **Manual Refresh**: Button triggers data reload
- [ ] **Error Handling**: Network failures handled gracefully
- [ ] **Empty States**: No-data scenarios display properly

### **Data Quality Validation**
- [ ] **Coordinate Accuracy**: Hotspots appear in correct locations
- [ ] **Timestamp Accuracy**: Times match NASA FIRMS data
- [ ] **Confidence Levels**: Mapping from FIRMS confidence values
- [ ] **Satellite Attribution**: MODIS/VIIRS sources identified
- [ ] **Spread Calculations**: Predictions within reasonable bounds
- [ ] **Wind Integration**: Real wind data affects predictions

### **Performance Tests**
- [ ] **Load Times**: Application starts within 5 seconds
- [ ] **Responsiveness**: Map interactions remain smooth
- [ ] **Memory Usage**: No memory leaks during extended use
- [ ] **Concurrent Users**: Multiple browser tabs work correctly
- [ ] **Mobile Compatibility**: Works on mobile devices

### **Edge Case Tests**
- [ ] **No Internet**: Graceful offline behavior
- [ ] **API Rate Limits**: Handles rate limiting appropriately
- [ ] **Malformed Data**: Robust parsing of unexpected formats
- [ ] **Extreme Coordinates**: Polar and International Date Line cases
- [ ] **Large Datasets**: Performance with 1000+ hotspots
- [ ] **Browser Compatibility**: Works in Chrome, Firefox, Safari

## Validation Metrics

### **Data Accuracy Metrics**
- **Hotspot Count Accuracy**: ±5% variance from NASA FIRMS source
- **Coordinate Precision**: ±0.001° accuracy
- **Temporal Accuracy**: ±5 minutes from acquisition time
- **Spread Prediction Realism**: 1-15 km range, wind-influenced

### **Performance Metrics**
- **Initial Load**: < 5 seconds from data fetch to render
- **Refresh Time**: < 3 seconds for data updates
- **Interaction Response**: < 100ms for hover/click events
- **Memory Footprint**: < 100MB sustained usage

### **Reliability Metrics**
- **Uptime**: 99.9% availability during testing period
- **Error Recovery**: < 30 seconds to recover from API failures
- **Data Freshness**: Updates within 20 minutes of NASA publication

## Troubleshooting Guide

### **Common Issues & Solutions**

**Issue**: No hotspots appear
- **Check**: NASA FIRMS API status
- **Solution**: Verify network connection, check for API downtime
- **Command**: `npm run fetch-data` and check console output

**Issue**: Application fails to start
- **Check**: Python installation and dependencies
- **Solution**: `pip install -r requirements.txt`
- **Command**: `python --version` (should be 3.7+)

**Issue**: Performance degradation
- **Check**: Number of active hotspots
- **Solution**: Use regional endpoints for focused testing
- **Command**: `npm run fetch-california` instead of global

**Issue**: Wind data not loading
- **Check**: Open-Meteo API availability
- **Solution**: Application falls back to default wind values
- **Command**: `npm run fetch-no-wind` to test without wind

### **Debug Mode**
Add debugging to scripts by modifying the Python files to include:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Expected Results by Season

### **Northern Hemisphere Fire Season (May-October)**
- **High Activity**: California, Mediterranean, Siberia
- **Expected Hotspots**: 100-1000+ globally
- **Primary Satellites**: MODIS Terra/Aqua, VIIRS

### **Southern Hemisphere Fire Season (November-March)**
- **High Activity**: Australia, Southern Africa, South America
- **Expected Hotspots**: 50-500+ globally  
- **Focus Regions**: Use Australia endpoint for concentrated testing

### **Low Activity Periods**
- **Expected**: 10-100 hotspots globally
- **Good for Testing**: Empty states, error handling, performance edge cases

## Production Readiness Criteria

The application is ready for production deployment when:

- [ ] **All test scenarios pass** without critical failures
- [ ] **Performance metrics** meet defined thresholds
- [ ] **Error handling** gracefully manages all failure modes
- [ ] **Data accuracy** validated against NASA FIRMS source
- [ ] **Cross-browser compatibility** verified
- [ ] **Mobile responsiveness** confirmed
- [ ] **Security review** completed (no API key exposure)
- [ ] **Documentation** updated with any limitations or requirements

## Next Steps After Testing

1. **Production Deployment**: Use Netlify/Zeabur as planned
2. **Monitoring Setup**: Implement uptime and performance monitoring
3. **User Feedback**: Collect feedback on prediction accuracy
4. **Feature Enhancement**: Consider advanced wind models (elliptical spread)
5. **Regional Customization**: Add region-specific configuration options

---

**Last Updated**: Current Version 1.1
**Testing Period**: Continuous during development
**Next Review**: After production deployment 