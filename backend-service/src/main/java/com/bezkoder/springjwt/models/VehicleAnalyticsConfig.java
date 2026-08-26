package com.bezkoder.springjwt.models;

public class VehicleAnalyticsConfig {

    private double baseFuelRate = 0.082; // L/km
    private double congestionTimeAlpha = 0.85;
    private double congestionFuelBeta = 2.5;
    private double co2FactorGramsPerLiter = 2310.0;

    public VehicleAnalyticsConfig() {}

    public VehicleAnalyticsConfig(double baseFuelRate, double congestionTimeAlpha, double congestionFuelBeta, double co2FactorGramsPerLiter) {
        this.baseFuelRate = baseFuelRate;
        this.congestionTimeAlpha = congestionTimeAlpha;
        this.congestionFuelBeta = congestionFuelBeta;
        this.co2FactorGramsPerLiter = co2FactorGramsPerLiter;
    }

    public double getBaseFuelRate() {
        return baseFuelRate;
    }

    public void setBaseFuelRate(double baseFuelRate) {
        this.baseFuelRate = baseFuelRate;
    }

    public double getCongestionTimeAlpha() {
        return congestionTimeAlpha;
    }

    public void setCongestionTimeAlpha(double congestionTimeAlpha) {
        this.congestionTimeAlpha = congestionTimeAlpha;
    }

    public double getCongestionFuelBeta() {
        return congestionFuelBeta;
    }

    public void setCongestionFuelBeta(double congestionFuelBeta) {
        this.congestionFuelBeta = congestionFuelBeta;
    }

    public double getCo2FactorGramsPerLiter() {
        return co2FactorGramsPerLiter;
    }

    public void setCo2FactorGramsPerLiter(double co2FactorGramsPerLiter) {
        this.co2FactorGramsPerLiter = co2FactorGramsPerLiter;
    }
}
