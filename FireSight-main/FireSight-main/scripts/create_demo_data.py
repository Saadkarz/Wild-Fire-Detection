#!/usr/bin/env python3
"""
Create realistic demo data for FireSight testing when real-time data is sparse.
Uses actual fire-prone coordinates and realistic satellite data values.
"""

import json
import os
from datetime import datetime, timezone, timedelta
import random

# Real fire-prone locations with names for reference
DEMO_LOCATIONS = [
    # California fire-prone areas
    {"name": "Napa Valley", "lat": 38.5816, "lon": -122.8244, "region": "California"},
    {"name": "Santa Barbara", "lat": 34.4208, "lon": -119.6982, "region": "California"},
    {"name": "Riverside County", "lat": 33.7455, "lon": -117.8677, "region": "California"},
    {"name": "Shasta County", "lat": 40.8021, "lon": -122.2712, "region": "California"},
    {"name": "Lake Tahoe", "lat": 39.0968, "lon": -120.0324, "region": "California"},
    
    # Australia fire-prone areas
    {"name": "Blue Mountains", "lat": -33.7216, "lon": 150.3106, "region": "Australia"},
    {"name": "Adelaide Hills", "lat": -34.9688, "lon": 138.7347, "region": "Australia"},
    {"name": "Perth Hills", "lat": -31.9505, "lon": 116.1608, "region": "Australia"},
    
    # Other global fire-prone regions
    {"name": "Amazon Basin", "lat": -3.4653, "lon": -62.2159, "region": "Brazil"},
    {"name": "Siberian Forests", "lat": 64.0685, "lon": 100.6096, "region": "Russia"},
    {"name": "Mediterranean Spain", "lat": 40.4168, "lon": -3.7038, "region": "Spain"},
    {"name": "British Columbia", "lat": 53.7267, "lon": -127.6476, "region": "Canada"},
]

def generate_realistic_hotspot(location, time_offset_hours=0):
    """Generate a realistic hotspot with proper satellite data."""
    
    # Add small random offset to coordinates (within ~5km)
    lat_offset = random.uniform(-0.05, 0.05)
    lon_offset = random.uniform(-0.05, 0.05)
    
    # Realistic brightness temperatures (300-400K)
    brightness = random.uniform(320, 380)
    
    # Confidence levels based on brightness
    if brightness > 360:
        confidence = "high"
    elif brightness > 340:
        confidence = "nominal"
    else:
        confidence = "low"
    
    # Realistic satellites
    satellite = random.choice(["Terra", "Aqua", "VIIRS", "MODIS"])
    
    # Time within last 24 hours
    acq_time = datetime.now(timezone.utc) - timedelta(hours=time_offset_hours)
    
    # Realistic wind and spread calculation
    wind_speed = random.uniform(10, 45)
    wind_direction = random.uniform(0, 360)
    
    # Spread calculation based on brightness and wind
    base_spread = 0.3 * (brightness - 300) / 40
    wind_factor = 1 + (wind_speed / 30) ** 0.8
    spread_radius = max(1.0, min(12.0, base_spread * wind_factor * 6))
    
    return {
        "lat": location["lat"] + lat_offset,
        "lon": location["lon"] + lon_offset,
        "brightness": round(brightness, 1),
        "acq_datetime": acq_time.isoformat(),
        "confidence": confidence,
        "satellite": satellite,
        "spread_radius_km": round(spread_radius, 1),
        "wind_speed_kph": round(wind_speed, 1),
        "wind_direction": round(wind_direction),
        "location_name": location["name"],  # For reference only
        "region": location["region"]
    }

def create_demo_scenario(scenario="mixed"):
    """Create different demo scenarios for testing."""
    
    hotspots = []
    
    if scenario == "california":
        # Focus on California fires
        locations = [loc for loc in DEMO_LOCATIONS if loc["region"] == "California"]
        hotspot_count = random.randint(3, 8)
        
    elif scenario == "australia":
        # Focus on Australia fires
        locations = [loc for loc in DEMO_LOCATIONS if loc["region"] == "Australia"]
        hotspot_count = random.randint(2, 5)
        
    elif scenario == "global":
        # Global distribution
        locations = DEMO_LOCATIONS
        hotspot_count = random.randint(8, 15)
        
    elif scenario == "high_activity":
        # High fire activity simulation
        locations = DEMO_LOCATIONS
        hotspot_count = random.randint(15, 25)
        
    elif scenario == "low_activity":
        # Low fire activity
        locations = random.sample(DEMO_LOCATIONS, 3)
        hotspot_count = random.randint(1, 4)
        
    else:  # mixed
        # Mixed scenario with good variety
        locations = random.sample(DEMO_LOCATIONS, random.randint(5, 8))
        hotspot_count = random.randint(5, 10)
    
    # Generate hotspots
    for i in range(hotspot_count):
        location = random.choice(locations)
        time_offset = random.uniform(0, 24)  # Within last 24 hours
        hotspot = generate_realistic_hotspot(location, time_offset)
        hotspots.append(hotspot)
    
    return hotspots

def convert_to_geojson(hotspots):
    """Convert demo hotspots to GeoJSON format."""
    features = []
    
    for hotspot in hotspots:
        # Remove demo-only fields
        properties = {k: v for k, v in hotspot.items() 
                     if k not in ['location_name', 'region']}
        
        feature = {
            "type": "Feature",
            "properties": properties,
            "geometry": {
                "type": "Point",
                "coordinates": [hotspot["lon"], hotspot["lat"]]
            }
        }
        features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_features": len(features),
            "data_sources": ["Demo Data - Realistic Simulation"],
            "prediction_model": "6-hour empirical spread model",
            "note": "This is demo data for testing purposes"
        },
        "features": features
    }
    
    return geojson

def main():
    """Main function to create demo data."""
    import sys
    
    scenario = sys.argv[1] if len(sys.argv) > 1 else "mixed"
    
    print(f"🔥 Creating Demo Data - Scenario: {scenario}")
    print("-" * 50)
    
    # Generate demo hotspots
    hotspots = create_demo_scenario(scenario)
    
    print(f"Generated {len(hotspots)} demo hotspots")
    
    # Show sample locations
    print("\n📍 Demo locations:")
    for hs in hotspots[:5]:
        print(f"  {hs['lat']:.3f}, {hs['lon']:.3f} - {hs['brightness']:.1f}K - {hs['location_name']}")
    
    if len(hotspots) > 5:
        print(f"  ... and {len(hotspots) - 5} more")
    
    # Convert to GeoJSON
    geojson_data = convert_to_geojson(hotspots)
    
    # Save to data directory
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "wildfires.geojson")
    with open(output_path, 'w') as f:
        json.dump(geojson_data, f, indent=2)
    
    print(f"\n✅ Demo data saved to {output_path}")
    
    # Statistics
    confidence_counts = {}
    regions = {}
    for hs in hotspots:
        conf = hs['confidence']
        region = hs['region']
        confidence_counts[conf] = confidence_counts.get(conf, 0) + 1
        regions[region] = regions.get(region, 0) + 1
    
    print(f"\n📊 Statistics:")
    print(f"  Total hotspots: {len(hotspots)}")
    
    for conf, count in sorted(confidence_counts.items()):
        print(f"  {conf.title()} confidence: {count}")
    
    print(f"\n🌍 Geographic distribution:")
    for region, count in sorted(regions.items()):
        print(f"  {region}: {count}")
    
    spreads = [hs['spread_radius_km'] for hs in hotspots]
    print(f"\n🔥 Spread predictions:")
    print(f"  Average: {sum(spreads)/len(spreads):.1f} km")
    print(f"  Range: {min(spreads):.1f} - {max(spreads):.1f} km")
    
    print(f"\n🌐 Ready for testing at http://localhost:8000")

if __name__ == "__main__":
    main() 