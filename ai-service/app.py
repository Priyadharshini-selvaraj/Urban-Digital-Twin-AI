"""
Urban Digital Twin AI - Standalone Flask Service
Run with: python app.py
"""
import os
import json
import flask
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------------------
# Import our AI predictor (with scikit-learn or pure-Python fallback)
# -------------------------------------------------------------------
try:
    from src.urban_twin_models import ai_predictor
    AI_READY = True
    print("[OK] Urban Twin AI Predictor loaded successfully.")
except Exception as e:
    AI_READY = False
    ai_predictor = None
    print(f"[WARN] Could not load AI predictor: {e}. Using fallback estimations.")


# -------------------------------------------------------------------
# Health Checks
# -------------------------------------------------------------------
@app.route('/health')
def health_check():
    return jsonify({"status": "UP", "ai_ready": AI_READY}), 200


@app.route('/service-info')
def service_info():
    return jsonify({
        "service": "Urban Digital Twin AI Prediction Service",
        "version": "1.0.0",
        "ai_ready": AI_READY,
        "endpoints": [
            "POST /api/v1/predict/traffic",
            "POST /api/v1/predict/emissions"
        ]
    })


# -------------------------------------------------------------------
# Traffic Congestion Prediction
# Input: { "hour": 18, "day_of_week": 1, "weather_code": 0, "vehicle_density": 80 }
# Output: { "congestion_index": 0.92, "delay_minutes": 38.8, "traffic_status": "HEAVY" }
# -------------------------------------------------------------------
@app.route('/api/v1/predict/traffic', methods=['POST'])
def predict_traffic():
    data = request.get_json(silent=True) or {}
    hour = int(data.get('hour', 14))
    day_of_week = int(data.get('day_of_week', 2))
    weather_code = int(data.get('weather_code', 0))
    vehicle_density = float(data.get('vehicle_density', 55.0))

    if AI_READY and ai_predictor:
        result = ai_predictor.predict_traffic(hour, day_of_week, weather_code, vehicle_density)
    else:
        # Pure-math fallback
        peak_mult = 1.75 if (8 <= hour <= 9 or 17 <= hour <= 19) else 0.85
        weekend_mult = 0.65 if day_of_week in [5, 6] else 1.0
        weather_mult = 1.0 + (weather_code * 0.15)
        cong = min(1.0, max(0.05, (vehicle_density / 100.0) * peak_mult * weekend_mult * weather_mult))
        delay = cong * 22.0 + (vehicle_density * 0.1)
        status = "LOW" if cong < 0.35 else ("MODERATE" if cong < 0.70 else "HEAVY")
        result = {"congestion_index": round(cong, 3), "delay_minutes": round(delay, 1), "traffic_status": status}

    return jsonify({"status": "SUCCESS", "data": result})


# -------------------------------------------------------------------
# Fuel & CO2 Emissions Prediction
# Input: { "distance_km": 15, "avg_speed_kmh": 35, "congestion_index": 0.7, "vehicle_type": "SUV" }
# Output: { "fuel_consumption_liters": 5.54, "co2_emissions_grams": 12793.4, "eco_score": 65 }
# -------------------------------------------------------------------
@app.route('/api/v1/predict/emissions', methods=['POST'])
def predict_emissions():
    data = request.get_json(silent=True) or {}
    distance_km = float(data.get('distance_km', 10.0))
    avg_speed_kmh = float(data.get('avg_speed_kmh', 45.0))
    congestion_index = float(data.get('congestion_index', 0.4))
    vehicle_type = str(data.get('vehicle_type', 'Sedan'))

    if AI_READY and ai_predictor:
        result = ai_predictor.predict_emissions(distance_km, avg_speed_kmh, congestion_index, vehicle_type)
    else:
        vehicle_mult = {'EV': 0.0, 'Hybrid': 0.55, 'Sedan': 1.0, 'SUV': 1.45, 'Truck': 2.1}.get(vehicle_type, 1.0)
        speed_factor = 1.0 + max(0, (65.0 - avg_speed_kmh) / 50.0) ** 1.5
        cong_penalty = 1.0 + (congestion_index * 1.6)
        fuel = round(distance_km * 0.082 * speed_factor * cong_penalty * vehicle_mult, 2)
        co2 = round(fuel * 2310.0, 1)
        ev_kwh = round(distance_km * 0.18 * (1.0 + 0.4 * congestion_index), 2) if vehicle_type == 'EV' else 0.0
        eco_score = max(10, min(100, int(100 - (co2 / (distance_km * 25.0 + 0.1)))))
        result = {
            "vehicle_type": vehicle_type,
            "distance_km": distance_km,
            "fuel_consumption_liters": fuel,
            "co2_emissions_grams": co2,
            "ev_energy_kwh": ev_kwh,
            "eco_score": eco_score
        }

    return jsonify({"status": "SUCCESS", "data": result})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    print(f"\n{'='*50}")
    print(f"  Urban Digital Twin AI Service")
    print(f"  Running on http://localhost:{port}")
    print(f"  Flask version: {flask.__version__}")
    print(f"{'='*50}\n")
    app.run(host='0.0.0.0', port=port, debug=debug)
