# FireSight v1.1 Technical Decisions & Implementation Guide

This document resolves all technical uncertainties marked as "(不确定)" in DevDoc_v1.1.md and provides implementation guidance for the development team.

---

## 1. Initial Camera Position

| Solution | Value | Rationale |
|----------|-------|-----------|
| **Default View** | Center: [37, -95.5], Zoom: 4 | ① Covers US mainland fire-prone regions; ② Compatible with 2D Leaflet; ③ Can use `leafletMap.flyHome()` |
| **Auto-fit Data** | `leafletMap.fitBounds(dataLayer.getBounds())` | Fallback for global data - automatically adjusts to show all hotspots |

**Implementation**: Default US mainland view with auto-fit when hotspots span multiple continents.

---

## 2. Wind-Enhanced Spread Algorithm

| Level | Data Source | Calculation Method | Status |
|-------|-------------|-------------------|--------|
| **MVP** | Fixed WIND_KPH = 20 | Circular radius = base_rate × temp_factor × wind_factor × 6h | ✅ Implemented |
| **Enhanced** | Open-Meteo Free API: `/v1/forecast?lat={lat}&lon={lon}&hourly=wind_speed_10m,wind_direction_10m` | Real wind data affects spread predictions | ✅ Implemented |
| **Advanced** | NOAA NDFD gridded forecast | High-precision elliptical spread (future) | 📋 Planned v1.2 |

**Implementation Notes**:
- Open-Meteo requires no API key, CORS-friendly, JSON format
- Wind data cached per location to avoid excessive API calls
- Fallback to default values when wind API unavailable

---

## 3. Hotspot Visual Design

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Base Radius** | 6px | Proportional to map scale and visibility |
| **Hover Enhancement** | +2px (8px total) | 33% increase - industry standard for hover effects |
| **Colors** | Fill: #ff0000, Stroke: #ffffff, Weight: 1px | High contrast, fire-appropriate colors |
| **Interactions** | Hover: radius increase + cursor change | Clear visual feedback for interactive elements |

**Implementation**: Leaflet `circleMarker` with hover events for radius changes.

---

## 4. Error Handling Strategy

| Scenario | UI Treatment | Rationale |
|----------|-------------|-----------|
| **Data Fetch Failures** | Top banner (non-blocking) | Non-intrusive, allows continued usage |
| **Network Timeouts** | Auto-retry with exponential backoff | Resilient to temporary network issues |
| **API Rate Limits** | Intelligent delays + fallback values | Graceful degradation without user impact |
| **Malformed Data** | Skip invalid entries + log warnings | Robust parsing maintains application stability |

**Implementation**: Top-mounted error banner with auto-dismiss and manual retry options.

---

## 5. Info Panel Animation

| Animation Type | Implementation | Performance Rationale |
|----------------|----------------|----------------------|
| **Slide-in** | `transform: translateX(-100% → 0)` | GPU-accelerated, smooth 60fps |
| **Timing** | `transition: 300ms ease-out` | Apple HIG recommended timing |
| **Performance** | `will-change: transform` | Optimizes for animation layer |

**Implementation**: CSS transforms with hardware acceleration for smooth animations.

---

## 6. Deployment Strategy

| Platform | Advantages | Limitations | Use Case |
|----------|------------|-------------|----------|
| **Netlify** | Instant deployment, CI integration | Custom domain requires account | ✅ Primary choice |
| **GitHub Pages** | Git integration, free custom domains | 10min build timeout | Backup option |
| **Zeabur** | Full-stack capable, modern platform | Lower recognition | Future scaling |

**Deployment Workflow**:
1. **Development**: Local testing with `npm run test-suite`
2. **Staging**: Netlify drag-and-drop for quick validation
3. **Production**: GitHub Actions → Netlify with custom domain

---

## 7. Data Source Configuration

### **Real-Time Sources**
```javascript
const DATA_SOURCES = {
  production: {
    global: "https://firms.modaps.eosdis.nasa.gov/api/area/csv/.../MODIS_NRT/world/1",
    regional: "https://firms.modaps.eosdis.nasa.gov/api/area/csv/.../MODIS_NRT/usa_contiguous_and_hawaii/1"
  },
  development: {
    demo: "scripts/create_demo_data.py",
    testing: "scripts/test_realtime.py"
  }
}
```

### **Update Intervals**
- **Production**: 15 minutes (NASA FIRMS update frequency)
- **Development**: On-demand via refresh button
- **Monitoring**: Continuous with `npm run monitor`

---

## 8. Performance Optimization

### **Metrics & Thresholds**
- **Initial Load**: <5 seconds (includes data fetch + rendering)
- **Refresh Operations**: <3 seconds for data updates
- **User Interactions**: <100ms response time
- **Memory Usage**: <100MB sustained operation

### **Optimization Techniques**
- **Data Deduplication**: Remove hotspots within 1km proximity
- **Lazy Loading**: Load wind data progressively
- **Efficient Rendering**: Use Leaflet's built-in clustering for large datasets
- **Caching Strategy**: Browser cache for static assets, fresh data for GeoJSON

---

## 9. Browser Compatibility

| Browser | Support Level | Notes |
|---------|---------------|-------|
| **Chrome 90+** | ✅ Full support | Primary testing browser |
| **Firefox 88+** | ✅ Full support | Validated compatibility |
| **Safari 14+** | ✅ Full support | macOS/iOS compatibility |
| **Edge 90+** | ✅ Full support | Windows compatibility |
| **Mobile** | ✅ Responsive | Touch-optimized interactions |

**Testing Protocol**: Cross-browser validation included in automated test suite.

---

## 10. Security Considerations

### **API Security**
- **No API Keys Required**: NASA FIRMS and Open-Meteo are public APIs
- **CORS Compliance**: All external APIs support cross-origin requests
- **Rate Limiting**: Intelligent delays prevent API abuse
- **Input Sanitization**: All data validated before processing

### **Deployment Security**
- **HTTPS Enforcement**: All production deployments use SSL
- **Content Security Policy**: Restrictive CSP headers in production
- **No Sensitive Data**: No user data collection or storage

---

## 🎯 **Implementation Status**

| Component | Status | Notes |
|-----------|--------|-------|
| **Real-time Data** | ✅ Complete | NASA FIRMS + Open-Meteo integration |
| **Interactive Map** | ✅ Complete | Leaflet with full interactions |
| **Spread Predictions** | ✅ Complete | Wind-enhanced calculations |
| **Error Handling** | ✅ Complete | Comprehensive fallback strategy |
| **Performance** | ✅ Complete | All thresholds met |
| **Testing** | ✅ Complete | Automated validation suite |
| **Documentation** | ✅ Complete | Comprehensive guides available |
| **Deployment Ready** | ✅ Complete | Production configuration complete |

---

## 🚀 **Next Steps**

1. **Immediate**: Deploy to Netlify using drag-and-drop method
2. **Short-term**: Set up automated data pipeline for production updates
3. **Medium-term**: Implement monitoring and alerting for production system
4. **Long-term**: Consider v1.2 features (elliptical spread, historical data)

All technical uncertainties have been resolved and implemented. The system is ready for production deployment.

---

*Technical decisions finalized: June 28, 2025*  
*Implementation status: Production Ready*
