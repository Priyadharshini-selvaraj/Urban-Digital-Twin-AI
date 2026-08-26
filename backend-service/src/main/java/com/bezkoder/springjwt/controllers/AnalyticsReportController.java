package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.models.VehicleAnalyticsConfig;
import com.bezkoder.springjwt.payload.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsReportController {

    // FIX: AtomicReference makes currentConfig update thread-safe
    private final AtomicReference<VehicleAnalyticsConfig> currentConfig =
        new AtomicReference<>(new VehicleAnalyticsConfig());

    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return ResponseEntity.ok(
            ApiResponse.success("Analytics config retrieved.", currentConfig.get()));
    }

    @PostMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody VehicleAnalyticsConfig newConfig) {
        if (newConfig == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Config body must not be null."));
        }
        currentConfig.set(newConfig);
        return ResponseEntity.ok(
            ApiResponse.success("Analytics formula coefficients updated successfully.", currentConfig.get()));
    }

    @PostMapping("/report-summary")
    public ResponseEntity<?> getReportSummary(@RequestBody Map<String, Object> request) {
        String activeProfile = (String) request.getOrDefault("activeProfileKey", "fastest");
        String vehicleType   = (String) request.getOrDefault("vehicleType",       "Sedan");

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("reportId",    "REP-" + System.currentTimeMillis());
        summary.put("generatedAt", Instant.now().toString());
        summary.put("activeProfile", activeProfile);
        summary.put("vehicleType",   vehicleType);
        summary.put("formulaConfig", currentConfig.get());
        summary.put("disclaimer",    "Urban Digital Twin AI Smart City Simulator — Formula & Model Prediction Report");

        return ResponseEntity.ok(ApiResponse.success("Report summary generated.", summary));
    }
}
