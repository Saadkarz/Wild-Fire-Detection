import random

class PredictionService:
    def calculate_spread(self, brightness: float, confidence: str):
        """
        Calculates the predicted fire spread radius based on the algorithm:
        Base Spread Rate = 3.0 km (6 hours)
        Brightness Factor:
           > 350K: +3.0 km
           > 320K: +1.5 km
        Confidence Factor:
           High: +1.0 km
           Low: -1.0 km
        Wind Factor:
           Random variation (±2.0 km)
        Final Radius = max(1.0, min(15.0, base + factors))
        """
        
        base_spread = 3.0
        
        # Brightness Factor
        brightness_factor = 0.0
        if brightness > 350:
            brightness_factor = 3.0
        elif brightness > 320:
            brightness_factor = 1.5
            
        # Confidence Factor
        confidence_factor = 0.0
        if confidence.lower() == 'high':
            confidence_factor = 1.0
        elif confidence.lower() == 'low':
            confidence_factor = -1.0
            
        # Wind Factor (Random)
        wind_factor = random.uniform(-2.0, 2.0)
        
        # Total
        total_radius = base_spread + brightness_factor + confidence_factor + wind_factor
        
        # Clamp
        final_radius = max(1.0, min(15.0, total_radius))
        
        return {
            "radius_km": round(final_radius, 2),
            "components": {
                "base": base_spread,
                "brightness_factor": brightness_factor,
                "confidence_factor": confidence_factor,
                "wind_factor": round(wind_factor, 2)
            }
        }

prediction_service = PredictionService()
