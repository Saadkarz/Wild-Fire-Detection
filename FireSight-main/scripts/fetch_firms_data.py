#!/usr/bin/env python3
"""
FireSight Real-Time Data Fetcher
Fetches wildfire hotspot data from NASA FIRMS and converts to GeoJSON format
with simplified spread radius calculations and wind data integration.
"""

import json
import requests
from datetime import datetime, timezone, timedelta
import math
import sys
import os
import time
from urllib.parse import urljoin

# Real-time data sources - Updated to use public NASA FIRMS endpoints
FIRMS_MODIS_GLOBAL_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv"
FIRMS_VIIRS_GLOBAL_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv"

# Regional testing endpoints for focused testing
REGIONAL_ENDPOINTS = {
    "california": {
        "modis": FIRMS_MODIS_GLOBAL_URL,  # We'll filter by coordinates
        "viirs": FIRMS_VIIRS_GLOBAL_URL   # We'll filter by coordinates
    },
    "australia": {
        "modis": FIRMS_MODIS_GLOBAL_URL,  # We'll filter by coordinates
        "viirs": FIRMS_VIIRS_GLOBAL_URL   # We'll filter by coordinates
    },
    "global": {
        "modis": FIRMS_MODIS_GLOBAL_URL,
        "viirs": FIRMS_VIIRS_GLOBAL_URL
    }
}

def get_wind_data(lat, lon):
    """
    Fetch wind data from Open-Meteo API for spread calculation.
    Fallback to default values if API fails.
    """
    try:
        # Open-Meteo API for current and 6-hour forecast wind data
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=wind_speed_10m,wind_direction_10m&forecast_days=1"
        
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            
            # Get current hour wind data
            current_hour = datetime.now(timezone.utc).hour
            hourly_data = data.get('hourly', {})
            
            if hourly_data and current_hour < len(hourly_data.get('wind_speed_10m', [])):
                wind_speed_ms = hourly_data['wind_speed_10m'][current_hour]
                wind_direction = hourly_data['wind_direction_10m'][current_hour]
                
                # Convert m/s to km/h
                wind_speed_kph = wind_speed_ms * 3.6 if wind_speed_ms else 20
                
                return {
                    'speed_kph': round(wind_speed_kph, 1),
                    'direction': wind_direction if wind_direction else 0
                }
    except Exception as e:
        print(f"Wind data fetch failed for {lat}, {lon}: {e}")
    
    # Fallback to default values
    return {'speed_kph': 20, 'direction': 0}

def calculate_spread_radius(brightness, confidence, wind_speed_kph=20):
    """
    Enhanced empirical model for fire spread radius prediction (6 hours).
    Based on temperature, confidence level, and wind conditions.
    
    Args:
        brightness: Temperature in Kelvin
        confidence: Confidence level ('low', 'nominal', 'high')
        wind_speed_kph: Wind speed in km/h
    
    Returns:
        Predicted spread radius in km
    """
    # Base spread rate (km/h) 
    base_rate = 0.3
    
    # Temperature factor (higher temp = faster spread)
    temp_factor = max(0.5, min(2.5, (brightness - 300) / 40))
    
    # Confidence factor
    confidence_multipliers = {
        'low': 0.7,
        'nominal': 1.0,
        'high': 1.3
    }
    confidence_factor = confidence_multipliers.get(confidence.lower(), 1.0)
    
    # Wind factor (non-linear relationship)
    wind_factor = 1 + (wind_speed_kph / 30) ** 0.8
    
    # Calculate spread rate
    spread_rate = base_rate * temp_factor * confidence_factor * wind_factor
    
    # 6-hour prediction with some randomness for realism
    radius_km = spread_rate * 6
    
    # Clamp between reasonable bounds
    radius_km = max(1.0, min(15.0, radius_km))
    
    return round(radius_km, 1)

def parse_firms_csv(csv_text, region='global'):
    """
    Parse FIRMS CSV data into structured format with geographic filtering.
    """
    lines = csv_text.strip().split('\n')
    if len(lines) < 2:
        return []
    
    headers = lines[0].split(',')
    hotspots = []
    
    # Define geographic bounds for regions
    region_bounds = {
        'california': {'lat_min': 32.0, 'lat_max': 42.0, 'lon_min': -125.0, 'lon_max': -114.0},
        'australia': {'lat_min': -44.0, 'lat_max': -10.0, 'lon_min': 112.0, 'lon_max': 155.0},
        'global': {'lat_min': -90.0, 'lat_max': 90.0, 'lon_min': -180.0, 'lon_max': 180.0}
    }
    
    bounds = region_bounds.get(region, region_bounds['global'])
    
    for line in lines[1:]:
        try:
            values = line.split(',')
            if len(values) < len(headers):
                continue
                
            row = dict(zip(headers, values))
            
            # Extract required fields using correct column names
            lat = float(row.get('latitude', 0))
            lon = float(row.get('longitude', 0))
            brightness = float(row.get('brightness', 300))
            
            # Filter by geographic bounds
            if not (bounds['lat_min'] <= lat <= bounds['lat_max'] and 
                    bounds['lon_min'] <= lon <= bounds['lon_max']):
                continue
            
            # Parse acquisition date and time
            acq_date = row.get('acq_date', '')
            acq_time = row.get('acq_time', '0000')
            
            # Convert FIRMS time format to ISO datetime
            if acq_date and acq_time:
                try:
                    # FIRMS format: YYYY-MM-DD and HHMM
                    dt_str = f"{acq_date} {acq_time.zfill(4)}"
                    dt = datetime.strptime(dt_str, '%Y-%m-%d %H%M')
                    dt = dt.replace(tzinfo=timezone.utc)
                    acq_datetime = dt.isoformat()
                except:
                    acq_datetime = datetime.now(timezone.utc).isoformat()
            else:
                acq_datetime = datetime.now(timezone.utc).isoformat()
            
            # Map confidence values (FIRMS confidence is numeric)
            confidence_raw = row.get('confidence', '50')
            try:
                conf_val = float(confidence_raw) if confidence_raw.replace('.', '').isdigit() else 50
                if conf_val >= 80:
                    confidence = 'high'
                elif conf_val >= 50:
                    confidence = 'nominal'
                else:
                    confidence = 'low'
            except:
                confidence = 'nominal'
            
            # Map satellite names
            satellite_raw = row.get('satellite', 'Unknown')
            satellite_map = {'T': 'Terra', 'A': 'Aqua', 'N': 'VIIRS'}
            satellite = satellite_map.get(satellite_raw, f'MODIS-{satellite_raw}')
            
            hotspots.append({
                'lat': lat,
                'lon': lon,
                'brightness': brightness,
                'acq_datetime': acq_datetime,
                'confidence': confidence,
                'satellite': satellite
            })
            
        except Exception as e:
            print(f"Error parsing row: {line[:50]}... - {e}")
            continue
    
    return hotspots

def fetch_real_time_data(region='global', include_wind=True):
    """
    Fetch real-time wildfire data from NASA FIRMS.
    """
    print(f"Fetching real-time data for region: {region}")
    
    if region not in REGIONAL_ENDPOINTS:
        print(f"Unknown region: {region}. Using global data.")
        region = 'global'
    
    endpoints = REGIONAL_ENDPOINTS[region]
    all_hotspots = []
    
    # Fetch from both MODIS and VIIRS for comprehensive coverage
    for satellite_type, url in endpoints.items():
        try:
            print(f"Fetching {satellite_type.upper()} data...")
            response = requests.get(url, timeout=30)
            
            if response.status_code == 200:
                hotspots = parse_firms_csv(response.text, region)
                print(f"  Found {len(hotspots)} {satellite_type.upper()} hotspots")
                all_hotspots.extend(hotspots)
            else:
                print(f"  Failed to fetch {satellite_type.upper()} data: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"  Error fetching {satellite_type.upper()} data: {e}")
    
    # Remove duplicates based on location proximity (within 1km)
    unique_hotspots = []
    for hotspot in all_hotspots:
        is_duplicate = False
        for existing in unique_hotspots:
            distance = math.sqrt(
                (hotspot['lat'] - existing['lat']) ** 2 + 
                (hotspot['lon'] - existing['lon']) ** 2
            )
            if distance < 0.01:  # ~1km
                is_duplicate = True
                break
        
        if not is_duplicate:
            unique_hotspots.append(hotspot)
    
    print(f"Total unique hotspots after deduplication: {len(unique_hotspots)}")
    
    # Add wind data and calculate spread radius
    if include_wind and unique_hotspots:
        print("Adding wind data and calculating spread predictions...")
        for i, hotspot in enumerate(unique_hotspots):
            if i % 10 == 0:  # Rate limiting for API calls
                print(f"  Processing {i}/{len(unique_hotspots)}")
            
            # Get wind data (with fallback)
            wind_data = get_wind_data(hotspot['lat'], hotspot['lon'])
            
            # Calculate spread radius
            spread_radius = calculate_spread_radius(
                hotspot['brightness'],
                hotspot['confidence'],
                wind_data['speed_kph']
            )
            
            hotspot['spread_radius_km'] = spread_radius
            hotspot['wind_speed_kph'] = wind_data['speed_kph']
            hotspot['wind_direction'] = wind_data['direction']
            
            # Small delay to avoid overwhelming APIs
            if include_wind and i % 5 == 0:
                time.sleep(0.1)
    
    return unique_hotspots

def convert_to_geojson(hotspots):
    """
    Convert hotspot data to GeoJSON format with validation.
    """
    features = []
    
    for hotspot in hotspots:
        try:
            # Validate coordinates
            lat, lon = hotspot['lat'], hotspot['lon']
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                print(f"Invalid coordinates: {lat}, {lon}")
                continue
            
            # Ensure spread radius is calculated
            if 'spread_radius_km' not in hotspot:
                hotspot['spread_radius_km'] = calculate_spread_radius(
                    hotspot['brightness'],
                    hotspot['confidence']
                )
            
            feature = {
                "type": "Feature",
                "properties": {
                    "lat": lat,
                    "lon": lon,
                    "brightness": hotspot['brightness'],
                    "acq_datetime": hotspot['acq_datetime'],
                    "confidence": hotspot['confidence'],
                    "satellite": hotspot['satellite'],
                    "spread_radius_km": hotspot['spread_radius_km']
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                }
            }
            
            # Add optional wind data if available
            if 'wind_speed_kph' in hotspot:
                feature['properties']['wind_speed_kph'] = hotspot['wind_speed_kph']
                feature['properties']['wind_direction'] = hotspot['wind_direction']
            
            features.append(feature)
            
        except Exception as e:
            print(f"Error processing hotspot: {e}")
            continue
    
    geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_features": len(features),
            "data_sources": ["NASA FIRMS MODIS", "NASA FIRMS VIIRS"],
            "prediction_model": "6-hour empirical spread model"
        },
        "features": features
    }
    
    return geojson

def main():
    """
    Main function with enhanced real-time data fetching.
    """
    # Parse command line arguments
    region = sys.argv[1] if len(sys.argv) > 1 else 'global'
    include_wind = '--no-wind' not in sys.argv
    
    print("🔥 FireSight Real-Time Data Fetcher")
    print(f"Region: {region}")
    print(f"Include wind data: {include_wind}")
    print("-" * 50)
    
    try:
        # Fetch real-time data
        hotspots = fetch_real_time_data(region, include_wind)
        
        if not hotspots:
            print("⚠️  No hotspot data found. This could be normal during low fire activity periods.")
            # Create empty GeoJSON for testing
            geojson_data = {
                "type": "FeatureCollection",
                "metadata": {
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "total_features": 0,
                    "note": "No active hotspots detected"
                },
                "features": []
            }
        else:
            print(f"✅ Found {len(hotspots)} hotspots")
            geojson_data = convert_to_geojson(hotspots)
        
        # Save to data directory
        output_path = os.path.join(os.path.dirname(__file__), "..", "data", "wildfires.geojson")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(geojson_data, f, indent=2)
        
        print(f"✅ Data saved to {output_path}")
        
        # Print summary
        if hotspots:
            print("\n📊 Summary:")
            print(f"  Total hotspots: {len(hotspots)}")
            
            # Confidence breakdown
            conf_counts = {}
            for hs in hotspots:
                conf = hs['confidence']
                conf_counts[conf] = conf_counts.get(conf, 0) + 1
            
            for conf, count in sorted(conf_counts.items()):
                print(f"  {conf.title()} confidence: {count}")
            
            # Spread radius stats
            spreads = [hs.get('spread_radius_km', 0) for hs in hotspots]
            if spreads:
                print(f"  Avg spread prediction: {sum(spreads)/len(spreads):.1f} km")
                print(f"  Max spread prediction: {max(spreads):.1f} km")
            
            # Sample locations
            print("\n📍 Sample locations:")
            for hs in hotspots[:3]:
                print(f"  {hs['lat']:.3f}, {hs['lon']:.3f} - {hs['brightness']:.1f}K - {hs['confidence']} confidence")
        
        print(f"\n🌐 Ready for testing at http://localhost:8000")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 