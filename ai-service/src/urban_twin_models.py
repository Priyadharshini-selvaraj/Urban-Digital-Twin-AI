"""
Urban Digital Twin AI Predictor
Scikit-Learn & Math Fallback Models for Traffic Congestion, Delays, Fuel, and CO2
"""
import math
import random

try:
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class UrbanTwinAIPredictor:
    def __init__(self):
        if SKLEARN_AVAILABLE:
            self._init_sklearn_models()
        else:
            print("[INFO] Scikit-learn/Numpy not found. Using pure Python ML model estimators.")

    def _init_sklearn_models(self):
        np.random.seed(42)
        X_train = []
        y_congestion = []
        y_delay = []

        for _ in range(300):
            hr = np.random.randint(0, 24)
            dow = np.random.randint(0, 7)
            weather = np.random.choice([0, 1, 2, 3], p=[0.7, 0.15, 0.1, 0.05])
            density = np.random.uniform(10, 100)

            peak_factor = 1.8 if (8 <= hr <= 9 or 17 <= hr <= 19) else 0.8
            weekend_factor = 0.6 if dow in [5, 6] else 1.0

            cong = min(1.0, max(0.05, (density / 100.0) * peak_factor * weekend_factor + 0.1 * weather))
            delay = cong * 25.0 + (density / 10.0) * weather

            X_train.append([hr, dow, weather, density])
            y_congestion.append(cong)
            y_delay.append(delay)

        self.traffic_rf = RandomForestRegressor(n_estimators=20, random_state=42)
        self.traffic_rf.fit(X_train, y_congestion)

        self.delay_rf = RandomForestRegressor(n_estimators=20, random_state=42)
        self.delay_rf.fit(X_train, y_delay)

    def predict_traffic(self, hour, day_of_week, weather_code, vehicle_density):
        if SKLEARN_AVAILABLE:
            X = np.array([[hour, day_of_week, weather_code, vehicle_density]])
            cong = float(self.traffic_rf.predict(X)[0])
            delay = float(self.delay_rf.predict(X)[0])
        else:
            # Pure Python synthetic ML inference
            peak_multiplier = 1.75 if (8 <= hour <= 9 or 17 <= hour <= 19) else 0.85
            weekend_mult = 0.65 if day_of_week in [5, 6] else 1.0
            weather_mult = 1.0 + (weather_code * 0.15)
            
            cong = (vehicle_density / 100.0) * peak_multiplier * weekend_mult * weather_mult
            delay = cong * 22.0 + (vehicle_density * 0.1)

        cong = max(0.0, min(1.0, cong))
        status = "LOW" if cong < 0.35 else ("MODERATE" if cong < 0.70 else "HEAVY")

        return {
            "congestion_index": round(cong, 3),
            "delay_minutes": round(delay, 1),
            "traffic_status": status
        }

    def predict_emissions(self, distance_km, avg_speed_kmh, congestion_index, vehicle_type="Sedan"):
        # Fuel efficiency curve (optimum speed ~65 km/h)
        speed_factor = 1.0 + max(0, (65.0 - avg_speed_kmh) / 50.0)**1.5 + max(0, (avg_speed_kmh - 80.0) / 70.0)
        congestion_penalty = 1.0 + (congestion_index * 1.6)

        base_fuel_rate = 0.082 # Liters / km (8.2L / 100km base)
        fuel_liters = distance_km * base_fuel_rate * speed_factor * congestion_penalty

        vehicle_multipliers = {
            "EV": 0.0,
            "Hybrid": 0.55,
            "Sedan": 1.0,
            "SUV": 1.45,
            "Truck": 2.1
        }
        mult = vehicle_multipliers.get(vehicle_type, 1.0)
        fuel_liters *= mult
        co2_grams = fuel_liters * 2310.0 # ~2.31 kg CO2 per liter gasoline

        ev_kwh = round(distance_km * 0.18 * (1.0 + 0.4 * congestion_index), 2) if vehicle_type == "EV" else 0.0
        eco_score = max(10, min(100, int(100 - (co2_grams / (distance_km * 25.0 + 0.1)))))

        return {
            "vehicle_type": vehicle_type,
            "distance_km": distance_km,
            "fuel_consumption_liters": round(fuel_liters, 2),
            "co2_emissions_grams": round(co2_grams, 1),
            "ev_energy_kwh": ev_kwh,
            "eco_score": eco_score
        }


ai_predictor = UrbanTwinAIPredictor()
