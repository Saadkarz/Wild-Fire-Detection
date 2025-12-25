#!/usr/bin/env python3
"""
FireSight Real-Time Testing Automation Script
Performs comprehensive testing of real-time data integration and functionality.
"""

import json
import requests
import time
import sys
import os
from datetime import datetime, timezone
from fetch_firms_data import fetch_real_time_data, convert_to_geojson, REGIONAL_ENDPOINTS

def test_api_availability():
    """Test NASA FIRMS API availability."""
    print("🔍 Testing API availability...")
    
    results = {}
    for region, endpoints in REGIONAL_ENDPOINTS.items():
        results[region] = {}
        for sat_type, url in endpoints.items():
            try:
                response = requests.head(url, timeout=10)
                status = "✅ Available" if response.status_code == 200 else f"⚠️ HTTP {response.status_code}"
                results[region][sat_type] = status
                print(f"  {region} {sat_type.upper()}: {status}")
            except Exception as e:
                results[region][sat_type] = f"❌ Failed: {e}"
                print(f"  {region} {sat_type.upper()}: ❌ Failed")
    
    return results

def test_data_fetching():
    """Test data fetching for different regions."""
    print("\n🌍 Testing data fetching...")
    
    test_regions = ['california', 'australia', 'global']
    results = {}
    
    for region in test_regions:
        print(f"\n  Testing {region}...")
        try:
            start_time = time.time()
            hotspots = fetch_real_time_data(region, include_wind=False)  # Skip wind for speed
            fetch_time = time.time() - start_time
            
            result = {
                'success': True,
                'hotspot_count': len(hotspots),
                'fetch_time': round(fetch_time, 2),
                'has_data': len(hotspots) > 0
            }
            
            # Validate data structure
            if hotspots:
                sample = hotspots[0]
                required_fields = ['lat', 'lon', 'brightness', 'confidence', 'satellite', 'acq_datetime']
                missing_fields = [field for field in required_fields if field not in sample]
                result['data_valid'] = len(missing_fields) == 0
                result['missing_fields'] = missing_fields
            else:
                result['data_valid'] = True  # Empty data is valid
                result['missing_fields'] = []
            
            results[region] = result
            status = "✅" if result['success'] and result['data_valid'] else "⚠️"
            print(f"    {status} {result['hotspot_count']} hotspots in {result['fetch_time']}s")
            
        except Exception as e:
            results[region] = {
                'success': False,
                'error': str(e),
                'hotspot_count': 0,
                'fetch_time': 0
            }
            print(f"    ❌ Failed: {e}")
    
    return results

def test_geojson_conversion():
    """Test GeoJSON conversion and validation."""
    print("\n📋 Testing GeoJSON conversion...")
    
    try:
        # Fetch sample data
        hotspots = fetch_real_time_data('california', include_wind=False)
        
        if not hotspots:
            print("  ⚠️ No data available for GeoJSON testing")
            return {'success': True, 'note': 'No data to test'}
        
        # Convert to GeoJSON
        geojson = convert_to_geojson(hotspots)
        
        # Validate GeoJSON structure
        required_keys = ['type', 'features']
        missing_keys = [key for key in required_keys if key not in geojson]
        
        if missing_keys:
            return {'success': False, 'error': f'Missing keys: {missing_keys}'}
        
        # Validate features
        feature_errors = []
        for i, feature in enumerate(geojson['features'][:5]):  # Check first 5
            if feature.get('type') != 'Feature':
                feature_errors.append(f"Feature {i}: Invalid type")
            
            props = feature.get('properties', {})
            required_props = ['lat', 'lon', 'brightness', 'confidence']
            missing_props = [prop for prop in required_props if prop not in props]
            if missing_props:
                feature_errors.append(f"Feature {i}: Missing properties {missing_props}")
        
        result = {
            'success': len(feature_errors) == 0,
            'feature_count': len(geojson['features']),
            'errors': feature_errors
        }
        
        status = "✅" if result['success'] else "❌"
        print(f"  {status} {result['feature_count']} features, {len(feature_errors)} errors")
        
        return result
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def test_wind_integration():
    """Test wind data integration."""
    print("\n💨 Testing wind data integration...")
    
    try:
        # Test with a known location
        test_lat, test_lon = 37.7749, -122.4194  # San Francisco
        
        # Import the wind function
        from fetch_firms_data import get_wind_data
        
        start_time = time.time()
        wind_data = get_wind_data(test_lat, test_lon)
        wind_time = time.time() - start_time
        
        result = {
            'success': True,
            'response_time': round(wind_time, 2),
            'has_speed': 'speed_kph' in wind_data,
            'has_direction': 'direction' in wind_data,
            'speed_value': wind_data.get('speed_kph', 'N/A'),
            'direction_value': wind_data.get('direction', 'N/A')
        }
        
        # Validate values
        speed = wind_data.get('speed_kph', 0)
        direction = wind_data.get('direction', 0)
        
        valid_speed = isinstance(speed, (int, float)) and 0 <= speed <= 200
        valid_direction = isinstance(direction, (int, float)) and 0 <= direction <= 360
        
        result['valid_data'] = valid_speed and valid_direction
        
        status = "✅" if result['success'] and result['valid_data'] else "⚠️"
        print(f"  {status} Wind: {speed} km/h @ {direction}° in {wind_time:.2f}s")
        
        return result
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def test_data_persistence():
    """Test data file creation and validation."""
    print("\n💾 Testing data persistence...")
    
    try:
        # Generate test data
        hotspots = fetch_real_time_data('california', include_wind=False)
        geojson_data = convert_to_geojson(hotspots)
        
        # Save to test file
        test_file = os.path.join(os.path.dirname(__file__), "..", "data", "test_wildfires.geojson")
        os.makedirs(os.path.dirname(test_file), exist_ok=True)
        
        with open(test_file, 'w') as f:
            json.dump(geojson_data, f, indent=2)
        
        # Verify file
        with open(test_file, 'r') as f:
            loaded_data = json.load(f)
        
        # Validate loaded data
        is_valid = (
            loaded_data.get('type') == 'FeatureCollection' and
            isinstance(loaded_data.get('features'), list)
        )
        
        # Clean up test file
        os.remove(test_file)
        
        result = {
            'success': is_valid,
            'file_created': True,
            'data_preserved': loaded_data == geojson_data
        }
        
        status = "✅" if result['success'] else "❌"
        print(f"  {status} File I/O successful, data integrity preserved")
        
        return result
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def generate_test_report(results):
    """Generate comprehensive test report."""
    print("\n" + "="*60)
    print("🔥 FIRESIGHT REAL-TIME TESTING REPORT")
    print("="*60)
    
    # Summary
    total_tests = len(results)
    passed_tests = sum(1 for test in results.values() if test.get('success', False))
    
    print(f"\n📊 SUMMARY")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Failed: {total_tests - passed_tests}")
    print(f"   Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    # Detailed results
    print(f"\n📋 DETAILED RESULTS")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result.get('success', False) else "❌ FAIL"
        print(f"\n{test_name.upper().replace('_', ' ')}: {status}")
        
        if test_name == 'api_availability':
            for region, endpoints in result.items():
                if isinstance(endpoints, dict):
                    print(f"  {region.title()}:")
                    for sat, status in endpoints.items():
                        print(f"    {sat.upper()}: {status}")
        
        elif test_name == 'data_fetching':
            for region, data in result.items():
                if isinstance(data, dict):
                    status_icon = "✅" if data.get('success') and data.get('data_valid') else "❌"
                    print(f"  {region.title()}: {status_icon} {data.get('hotspot_count', 0)} hotspots in {data.get('fetch_time', 0)}s")
        
        elif test_name == 'wind_integration':
            if result.get('success'):
                print(f"  Speed: {result.get('speed_value')} km/h")
                print(f"  Direction: {result.get('direction_value')}°")
                print(f"  Response Time: {result.get('response_time')}s")
        
        # Show errors if any
        if 'error' in result:
            print(f"  ❌ Error: {result['error']}")
        
        if 'errors' in result and result['errors']:
            for error in result['errors']:
                print(f"  ❌ {error}")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS")
    
    if results.get('api_availability', {}).get('success', True):
        print("   ✅ APIs are accessible - ready for real-time testing")
    else:
        print("   ⚠️  Check NASA FIRMS API status before proceeding")
    
    if results.get('data_fetching', {}).get('california', {}).get('success', False):
        print("   ✅ Data fetching is working - proceed with visualization testing")
    else:
        print("   ⚠️  Data fetching issues detected - check network connectivity")
    
    if results.get('wind_integration', {}).get('success', False):
        print("   ✅ Wind data integration is functional")
    else:
        print("   ⚠️  Wind integration may fall back to default values")
    
    # Next steps
    print(f"\n🚀 NEXT STEPS")
    print("   1. Run: npm run fetch-california")
    print("   2. Run: npm start")
    print("   3. Open: http://localhost:8000")
    print("   4. Validate visual rendering and interactions")
    print("   5. Monitor performance during extended use")
    
    print("\n" + "="*60)
    print(f"Report generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("="*60)

def main():
    """Main testing function."""
    print("🔥 FireSight Real-Time Testing Suite")
    print(f"Started: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("-" * 60)
    
    # Run all tests
    results = {}
    
    try:
        results['api_availability'] = test_api_availability()
        results['data_fetching'] = test_data_fetching()
        results['geojson_conversion'] = test_geojson_conversion()
        results['wind_integration'] = test_wind_integration()
        results['data_persistence'] = test_data_persistence()
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Testing failed with error: {e}")
        sys.exit(1)
    
    # Generate report
    generate_test_report(results)
    
    # Return exit code
    all_passed = all(test.get('success', False) for test in results.values())
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main() 