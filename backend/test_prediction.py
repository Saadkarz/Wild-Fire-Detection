import requests
import json

def test_prediction():
    url = "http://localhost:8000/predict/wildfire"
    payload = {
        "latitude": 34.05,
        "longitude": -118.24,
        "brightness": 360.0,
        "confidence": "High"
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            radius = data['prediction']['radius_km']
            print(f"✅ Prediction Success. Radius: {radius}km")
            print(f"Data: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_prediction()
