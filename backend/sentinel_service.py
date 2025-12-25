"""
Sentinel Hub Service for satellite imagery retrieval.
Fetches Sentinel-2 imagery for Morocco region to detect wildfires.
"""

import os
import io
import numpy as np
from datetime import datetime, timedelta
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Try to import sentinelhub - provide fallback if not installed
try:
    from sentinelhub import (
        SHConfig, 
        SentinelHubRequest, 
        DataCollection,
        MimeType, 
        CRS, 
        BBox,
        bbox_to_dimensions
    )
    SENTINELHUB_AVAILABLE = True
except ImportError:
    SENTINELHUB_AVAILABLE = False
    print("⚠️ sentinelhub not installed. Run: pip install sentinelhub")


class SentinelService:
    """Service for fetching satellite imagery from Sentinel Hub."""
    
    # Morocco bounding box (approximate)
    MOROCCO_BOUNDS = {
        "lat_min": 27.0,
        "lat_max": 36.0, 
        "lon_min": -13.0,
        "lon_max": -1.0
    }
    
    # Grid zones for scanning Morocco
    SCAN_ZONES = [
        {"name": "North", "bbox": (-6.0, 34.0, -4.0, 35.5)},      # Tangier-Tetouan
        {"name": "Rif", "bbox": (-5.0, 34.5, -3.5, 35.2)},        # Rif mountains
        {"name": "Middle Atlas", "bbox": (-6.0, 32.5, -4.0, 34.0)},  # Middle Atlas
        {"name": "Casablanca", "bbox": (-8.0, 33.0, -7.0, 34.0)},    # Casablanca region
        {"name": "Marrakech", "bbox": (-8.5, 31.0, -7.0, 32.0)},     # Marrakech
        {"name": "High Atlas", "bbox": (-8.0, 30.5, -5.5, 32.0)},    # High Atlas
        {"name": "Souss", "bbox": (-10.0, 29.5, -8.0, 31.0)},        # Agadir region
        {"name": "Oriental", "bbox": (-3.0, 33.5, -1.5, 35.0)},      # Oujda region
    ]
    
    # Evalscript for true color visualization
    EVALSCRIPT_TRUE_COLOR = """
    //VERSION=3
    function setup() {
        return {
            input: [{
                bands: ["B02", "B03", "B04"]
            }],
            output: {
                bands: 3
            }
        };
    }
    
    function evaluatePixel(sample) {
        return [3.5 * sample.B04, 3.5 * sample.B03, 3.5 * sample.B02];
    }
    """
    
    # Evalscript for fire detection (SWIR bands)
    EVALSCRIPT_FIRE = """
    //VERSION=3
    function setup() {
        return {
            input: [{
                bands: ["B04", "B08", "B11", "B12"]
            }],
            output: {
                bands: 3
            }
        };
    }
    
    function evaluatePixel(sample) {
        // Fire detection using SWIR bands
        // B12 (SWIR) is sensitive to fire, B08 (NIR) for vegetation
        let fire_index = (sample.B12 - sample.B08) / (sample.B12 + sample.B08);
        
        // Enhanced visualization for fire detection
        if (sample.B12 > 0.3 && fire_index > 0.3) {
            // Likely fire - show as red
            return [1, 0, 0];
        } else if (sample.B12 > 0.2) {
            // Possible heat anomaly - show as orange
            return [1, 0.5, 0];
        }
        
        // Normal true color
        return [3.5 * sample.B04, 3.5 * sample.B08 * 0.3, 3.5 * sample.B04 * 0.3];
    }
    """

    def __init__(self):
        """Initialize Sentinel Hub configuration."""
        self.config = None
        self.initialized = False
        self.demo_mode = False
        
        if SENTINELHUB_AVAILABLE:
            client_id = os.getenv("SENTINEL_CLIENT_ID", "")
            client_secret = os.getenv("SENTINEL_CLIENT_SECRET", "")
            
            # Check for placeholder values
            if client_id and client_secret and "your_" not in client_id.lower() and "your_" not in client_secret.lower():
                self.config = SHConfig()
                self.config.sh_client_id = client_id
                self.config.sh_client_secret = client_secret
                self.initialized = True
                print("✅ Sentinel Hub service initialized")
            else:
                self.demo_mode = True
                print("⚠️ Sentinel Hub credentials not configured - running in DEMO mode")
        else:
            self.demo_mode = True
            print("⚠️ Sentinel Hub library not available - running in DEMO mode")
    
    def is_available(self) -> bool:
        """Check if Sentinel Hub service is available (including demo mode)."""
        return (self.initialized and SENTINELHUB_AVAILABLE) or self.demo_mode
    
    def _generate_mock_image(self, zone_name: str) -> dict:
        """Generate a mock satellite-like image for demo purposes."""
        import random
        import base64
        
        # Create a 512x512 mock satellite image
        width, height = 512, 512
        
        # Generate terrain-like colors (greens, browns, some blue)
        img_array = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Base terrain (green/brown gradient)
        for y in range(height):
            for x in range(width):
                # Perlin-like noise simulation with simple math
                noise = (np.sin(x * 0.05) * np.cos(y * 0.05) + 
                        np.sin(x * 0.1 + y * 0.1) * 0.5 + 
                        random.random() * 0.3)
                
                # Green vegetation
                green = int(50 + noise * 80 + random.randint(0, 30))
                red = int(30 + noise * 40 + random.randint(0, 20))
                blue = int(20 + noise * 20 + random.randint(0, 15))
                
                img_array[y, x] = [
                    max(0, min(255, red)),
                    max(0, min(255, green)),
                    max(0, min(255, blue))
                ]
        
        # Add some random "fire" pixels for demo (10% chance per zone)
        has_fire = random.random() < 0.1
        if has_fire:
            # Add a fire spot
            fire_x, fire_y = random.randint(100, 400), random.randint(100, 400)
            for dx in range(-20, 20):
                for dy in range(-20, 20):
                    if dx*dx + dy*dy < 400:  # Circle
                        px, py = fire_x + dx, fire_y + dy
                        if 0 <= px < width and 0 <= py < height:
                            img_array[py, px] = [255, random.randint(50, 150), 0]  # Orange/red
        
        # Convert to PIL Image and base64
        img = Image.fromarray(img_array)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        zone = next((z for z in self.SCAN_ZONES if z["name"].lower() == zone_name.lower()), self.SCAN_ZONES[0])
        
        return {
            "success": True,
            "image": img_array,
            "image_base64": image_base64,
            "demo_mode": True,
            "zone_name": zone["name"],
            "metadata": {
                "bbox": zone["bbox"],
                "resolution": 60,
                "size": (width, height),
                "time_interval": (datetime.now().strftime('%Y-%m-%d'), datetime.now().strftime('%Y-%m-%d')),
                "acquired_at": datetime.now().isoformat(),
                "note": "DEMO MODE - Mock satellite image"
            }
        }
    
    def get_satellite_image(
        self, 
        bbox_coords: tuple,
        resolution: int = 60,
        use_fire_script: bool = False,
        days_back: int = 5
    ) -> dict:
        """
        Fetch satellite image for a given bounding box.
        
        Args:
            bbox_coords: (min_lon, min_lat, max_lon, max_lat)
            resolution: Image resolution in meters (default 60m)
            use_fire_script: Use fire detection evalscript
            days_back: Number of days to look back for imagery
            
        Returns:
            dict with 'image' (numpy array), 'image_base64' (string), 'metadata'
        """
        if not self.is_available():
            return {"error": "Sentinel Hub not configured"}
        
        try:
            bbox = BBox(bbox=bbox_coords, crs=CRS.WGS84)
            size = bbox_to_dimensions(bbox, resolution=resolution)
            
            # Limit max size
            max_dim = 1024
            if size[0] > max_dim or size[1] > max_dim:
                scale = max_dim / max(size)
                size = (int(size[0] * scale), int(size[1] * scale))
            
            # Time range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            time_interval = (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
            
            evalscript = self.EVALSCRIPT_FIRE if use_fire_script else self.EVALSCRIPT_TRUE_COLOR
            
            request = SentinelHubRequest(
                evalscript=evalscript,
                input_data=[
                    SentinelHubRequest.input_data(
                        data_collection=DataCollection.SENTINEL2_L2A,
                        time_interval=time_interval,
                        mosaicking_order='leastCC'  # Least cloud cover
                    )
                ],
                responses=[
                    SentinelHubRequest.output_response('default', MimeType.PNG)
                ],
                bbox=bbox,
                size=size,
                config=self.config
            )
            
            # Execute request
            images = request.get_data()
            
            if images and len(images) > 0:
                image_array = images[0]
                
                # Convert to base64 for API response
                img = Image.fromarray(image_array.astype('uint8'))
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                import base64
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                
                return {
                    "success": True,
                    "image": image_array,
                    "image_base64": image_base64,
                    "metadata": {
                        "bbox": bbox_coords,
                        "resolution": resolution,
                        "size": size,
                        "time_interval": time_interval,
                        "acquired_at": datetime.now().isoformat()
                    }
                }
            else:
                return {"error": "No imagery available for this region/time"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def scan_zone(self, zone_name: str, use_fire_script: bool = True) -> dict:
        """
        Scan a predefined zone for satellite imagery.
        
        Args:
            zone_name: Name of the zone (e.g., "North", "Rif", etc.)
            use_fire_script: Use fire detection evalscript
            
        Returns:
            dict with image data and metadata
        """
        zone = next((z for z in self.SCAN_ZONES if z["name"].lower() == zone_name.lower()), None)
        
        if not zone:
            available_zones = [z["name"] for z in self.SCAN_ZONES]
            return {"error": f"Zone not found. Available: {available_zones}"}
        
        # Use demo mode if not properly initialized
        if self.demo_mode or not self.initialized:
            print(f"📍 Using DEMO mode for zone: {zone_name}")
            return self._generate_mock_image(zone_name)
        
        # Try real API
        result = self.get_satellite_image(
            bbox_coords=zone["bbox"],
            use_fire_script=use_fire_script
        )
        
        # If API fails, fallback to demo mode
        if "error" in result:
            print(f"⚠️ API error for {zone_name}: {result['error']}. Falling back to demo mode.")
            return self._generate_mock_image(zone_name)
        
        result["zone_name"] = zone["name"]
        return result
    
    def scan_all_zones(self, use_fire_script: bool = True) -> list:
        """
        Scan all predefined zones.
        
        Returns:
            List of results for each zone
        """
        results = []
        for zone in self.SCAN_ZONES:
            result = self.scan_zone(zone["name"], use_fire_script)
            results.append({
                "zone": zone["name"],
                "bbox": zone["bbox"],
                "result": result
            })
        return results
    
    def get_image_for_prediction(self, bbox_coords: tuple) -> Image.Image | None:
        """
        Get a PIL Image suitable for model prediction.
        
        Args:
            bbox_coords: (min_lon, min_lat, max_lon, max_lat)
            
        Returns:
            PIL Image resized to 224x224 for model input, or None if error
        """
        result = self.get_satellite_image(bbox_coords, resolution=10, use_fire_script=False)
        
        if "error" in result:
            return None
        
        image_array = result["image"]
        img = Image.fromarray(image_array.astype('uint8'))
        img = img.resize((224, 224))
        
        return img
    
    def get_zones(self) -> list:
        """Get list of available scan zones."""
        return [{"name": z["name"], "bbox": z["bbox"]} for z in self.SCAN_ZONES]


# Singleton instance
sentinel_service = SentinelService()
