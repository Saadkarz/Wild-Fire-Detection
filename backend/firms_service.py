import requests
import math
from datetime import datetime, timezone

class FirmsService:
    def __init__(self):
        self.FIRMS_MODIS_GLOBAL_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv"
        self.FIRMS_VIIRS_GLOBAL_URL = "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv"
        self.REGION_BOUNDS = {
            "california": {"lat_min": 32.0, "lat_max": 42.0, "lon_min": -125.0, "lon_max": -114.0},
            "australia": {"lat_min": -44.0, "lat_max": -10.0, "lon_min": 112.0, "lon_max": 155.0},
            "morocco": {"lat_min": 21.0, "lat_max": 36.0, "lon_min": -17.0, "lon_max": -1.0},
            "global": {"lat_min": -90.0, "lat_max": 90.0, "lon_min": -180.0, "lon_max": 180.0}
        }

    def get_wind_data(self, lat, lon):
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=wind_speed_10m,wind_direction_10m&forecast_days=1"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                current_hour = datetime.now(timezone.utc).hour
                hourly_data = data.get('hourly', {})
                
                if hourly_data and current_hour < len(hourly_data.get('wind_speed_10m', [])):
                    wind_speed_ms = hourly_data['wind_speed_10m'][current_hour]
                    wind_direction = hourly_data['wind_direction_10m'][current_hour]
                    wind_speed_kph = wind_speed_ms * 3.6 if wind_speed_ms else 20
                    
                    return {
                        'speed_kph': round(wind_speed_kph, 1),
                        'direction': wind_direction if wind_direction else 0
                    }
        except Exception as e:
            print(f"Wind data fetch failed for {lat}, {lon}: {e}")
        return {'speed_kph': 20, 'direction': 0}

    def calculate_spread_radius(self, brightness, confidence, wind_speed_kph=20):
        base_rate = 0.3
        temp_factor = max(0.5, min(2.5, (brightness - 300) / 40))
        
        confidence_multipliers = {'low': 0.7, 'nominal': 1.0, 'high': 1.3}
        confidence_factor = confidence_multipliers.get(confidence.lower(), 1.0)
        
        wind_factor = 1 + (wind_speed_kph / 30) ** 0.8
        spread_rate = base_rate * temp_factor * confidence_factor * wind_factor
        radius_km = spread_rate * 6 # 6-hour prediction
        return round(max(1.0, min(15.0, radius_km)), 1)

    def parse_firms_csv(self, csv_text, region='global'):
        lines = csv_text.strip().split('\n')
        if len(lines) < 2:
            return []
        
        headers = lines[0].split(',')
        hotspots = []
        bounds = self.REGION_BOUNDS.get(region, self.REGION_BOUNDS['global'])

        for line in lines[1:]:
            try:
                values = line.split(',')
                if len(values) < len(headers):
                    continue
                row = dict(zip(headers, values))
                
                lat = float(row.get('latitude', 0))
                lon = float(row.get('longitude', 0))
                brightness = float(row.get('brightness', 300))
                
                if not (bounds['lat_min'] <= lat <= bounds['lat_max'] and bounds['lon_min'] <= lon <= bounds['lon_max']):
                    continue
                
                acq_date = row.get('acq_date', '')
                acq_time = row.get('acq_time', '0000')
                if acq_date and acq_time:
                     acq_datetime = f"{acq_date}T{acq_time.zfill(4)[:2]}:{acq_time.zfill(4)[2:]}:00Z"
                else:
                    acq_datetime = datetime.now(timezone.utc).isoformat()

                confidence_raw = row.get('confidence', '50')
                try:
                    conf_val = float(confidence_raw) if confidence_raw.replace('.', '').isdigit() else 50
                    confidence = 'high' if conf_val >= 80 else 'nominal' if conf_val >= 50 else 'low'
                except:
                    confidence = 'nominal'

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
            except Exception:
                continue
        return hotspots

    def get_realtime_data(self, region='global'):
        all_hotspots = []
        urls = [self.FIRMS_MODIS_GLOBAL_URL, self.FIRMS_VIIRS_GLOBAL_URL]
        
        for url in urls:
            try:
                response = requests.get(url, timeout=30)
                if response.status_code == 200:
                    hotspots = self.parse_firms_csv(response.text, region)
                    all_hotspots.extend(hotspots)
            except Exception as e:
                print(f"Error fetching data: {e}")

        # Deduplicate
        unique_hotspots = []
        for hotspot in all_hotspots:
            is_duplicate = False
            for existing in unique_hotspots:
                dist = math.sqrt((hotspot['lat'] - existing['lat'])**2 + (hotspot['lon'] - existing['lon'])**2)
                if dist < 0.01:
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_hotspots.append(hotspot)

        # Add wind/spread data (limit to first 50 to avoid timeout/rate limit for now, or just do simpler logic)
        # To avoid being too slow, we'll only fetch wind for a subset or just return. 
        # For a "Prevention Page", showing realtime data is key. 
        # Let's process the first 20 for wind to keep it fast, or all if small number.
        processed_hotspots = []
        count = 0
        for hotspot in unique_hotspots:
            if count < 20: # Limit wind API calls
                wind = self.get_wind_data(hotspot['lat'], hotspot['lon'])
            else:
                wind = {'speed_kph': 20, 'direction': 0}
            
            hotspot['spread_radius_km'] = self.calculate_spread_radius(
                hotspot['brightness'], hotspot['confidence'], wind['speed_kph']
            )
            hotspot['wind_speed_kph'] = wind['speed_kph']
            hotspot['wind_direction'] = wind['direction']
            processed_hotspots.append(hotspot)
            count += 1
            
        return processed_hotspots

firms_service = FirmsService()
