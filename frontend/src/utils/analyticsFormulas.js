/**
 * Urban Digital Twin AI - Configurable Route Analytics Engine
 * Formulas for travel time, fuel consumption, CO2 emissions, EV energy, and eco rating.
 */

export const ANALYTICS_CONFIG = {
  // Base Fuel Consumption Rate (Liters / km at free-flow speed)
  baseFuelRateLitersPerKm: 0.082, // ~8.2 L / 100km

  // Congestion Impact Multipliers
  congestionTimeAlpha: 0.85,    // Speed reduction factor per congestion index
  congestionFuelBeta: 2.5,       // Exponential fuel penalty for traffic idling

  // Vehicle Type Multipliers
  vehicleMultipliers: {
    EV: { fuel: 0.0, co2: 0.0, kwhPerKm: 0.18, name: 'Electric Vehicle (EV)' },
    Hybrid: { fuel: 0.55, co2: 0.55, kwhPerKm: 0.0, name: 'Hybrid Electric' },
    Sedan: { fuel: 1.0, co2: 1.0, kwhPerKm: 0.0, name: 'Gasoline Sedan' },
    SUV: { fuel: 1.45, co2: 1.45, kwhPerKm: 0.0, name: 'SUV / Crossover' },
    Truck: { fuel: 2.1, co2: 2.1, kwhPerKm: 0.0, name: 'Heavy Commercial Truck' }
  },

  // Carbon Intensity Factor (Grams of CO2 per Liter of Gasoline)
  co2GramsPerLiter: 2310.0
};

/**
 * Calculate comprehensive analytics for a route given distance, speed, congestion & vehicle type
 */
export function calculateRouteAnalytics(distanceKm, speedLimitKmh = 50, congestionIndex = 0.3, vehicleType = 'Sedan', customConfig = {}) {
  const cfg = { ...ANALYTICS_CONFIG, ...customConfig };
  const vSpec = cfg.vehicleMultipliers[vehicleType] || cfg.vehicleMultipliers.Sedan;

  // 1. Travel Time & Delays
  const effectiveSpeed = Math.max(5, speedLimitKmh * (1.0 - cfg.congestionTimeAlpha * congestionIndex));
  const freeFlowTimeMin = (distanceKm / speedLimitKmh) * 60;
  const estimatedTimeMin = (distanceKm / effectiveSpeed) * 60;
  const delayMin = Math.max(0, estimatedTimeMin - freeFlowTimeMin);

  // 2. Fuel Consumption
  // Speed factor: optimum at ~65 km/h
  const speedPenalty = 1.0 + Math.pow(Math.max(0, (65 - effectiveSpeed) / 45.0), 1.5);
  const congestionFuelMult = 1.0 + (cfg.congestionFuelBeta * Math.pow(congestionIndex, 2));

  let fuelLiters = distanceKm * cfg.baseFuelRateLitersPerKm * speedPenalty * congestionFuelMult * vSpec.fuel;
  fuelLiters = Math.round(fuelLiters * 100) / 100;

  // 3. CO2 Emissions
  let co2Grams = fuelLiters * cfg.co2GramsPerLiter;
  co2Grams = Math.round(co2Grams * 10) / 10;

  // 4. EV Battery Energy
  const evKwh = vehicleType === 'EV' ? Math.round((distanceKm * vSpec.kwhPerKm * (1.0 + 0.4 * congestionIndex)) * 100) / 100 : 0.0;

  // 5. Eco Score (100 = Best, 0 = Worst)
  const ecoScore = Math.max(5, Math.min(100, Math.round(100 - (co2Grams / (distanceKm * 25.0 + 0.1)))));

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    estimatedTimeMin: parseFloat(estimatedTimeMin.toFixed(1)),
    freeFlowTimeMin: parseFloat(freeFlowTimeMin.toFixed(1)),
    delayMin: parseFloat(delayMin.toFixed(1)),
    effectiveSpeedKmh: parseFloat(effectiveSpeed.toFixed(1)),
    fuelConsumptionLiters: fuelLiters,
    co2EmissionsGrams: co2Grams,
    evEnergyKwh: evKwh,
    ecoScore: ecoScore,
    vehicleType: vSpec.name
  };
}
