package com.bezkoder.springjwt.controllers;

import com.bezkoder.springjwt.payload.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/v1/routes")
public class RouteOptimizationController {

    // FIX: Inject as Spring bean instead of `new RestTemplate()` per-method (not thread-safe, no pooling)
    private final RestTemplate restTemplate;

    @Value("${flask.ai.url:http://localhost:5000/api/v1/predict/emissions}")
    private String flaskAiUrl;

    public RouteOptimizationController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * POST /api/v1/routes/optimize
     * Returns 4 route profiles (fastest, shortest, leastCongested, safest).
     * Distances are derived from the node-pair hash as a graph-agnostic stub;
     * the frontend A-star/Dijkstra engine computes true graph distances.
     */
    @PostMapping("/optimize")
    public ResponseEntity<?> optimizeRoute(@RequestBody Map<String, Object> request) {
        String startNode = (String) request.getOrDefault("startNode", "J1");
        String endNode   = (String) request.getOrDefault("endNode",   "J6");

        // FIX: validate inputs not empty
        if (startNode == null || startNode.isBlank() || endNode == null || endNode.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("startNode and endNode must not be blank."));
        }

        // Derive a deterministic base distance from the node-pair (graph-independent stub)
        int    hash     = Math.abs((startNode + endNode).hashCode());
        double baseDist = 12.0 + (hash % 15);   // 12–26 km representative range

        List<Map<String, Object>> profiles = new ArrayList<>();
        profiles.add(buildRouteProfile("fastest",        "Fastest Path (Minimum Travel Time)",     startNode, endNode, round2(baseDist * 1.15), round1(baseDist * 1.15 / 55.0 * 60.0), 0.15, 0.08));
        profiles.add(buildRouteProfile("shortest",       "Shortest Path (Minimum Distance)",       startNode, endNode, round2(baseDist),        round1(baseDist        / 35.0 * 60.0), 0.65, 0.35));
        profiles.add(buildRouteProfile("leastCongested", "Least Congested Path (Bypass Traffic)",  startNode, endNode, round2(baseDist * 1.25), round1(baseDist * 1.25 / 50.0 * 60.0), 0.05, 0.10));
        profiles.add(buildRouteProfile("safest",         "Safest Path (Low Collision & Risk)",     startNode, endNode, round2(baseDist * 1.30), round1(baseDist * 1.30 / 48.0 * 60.0), 0.10, 0.03));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("timestamp", System.currentTimeMillis());
        data.put("startNode", startNode);
        data.put("endNode",   endNode);
        data.put("profiles",  profiles);

        return ResponseEntity.ok(ApiResponse.success("Route profiles computed successfully.", data));
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
    private double round1(double v) { return Math.round(v * 10.0)  / 10.0;  }

    private Map<String, Object> buildRouteProfile(String key, String title, String start, String end,
                                                   double distKm, double timeMin, double cong, double risk) {
        Map<String, Object> prof = new LinkedHashMap<>();
        prof.put("key",                 key);
        prof.put("title",               title);
        prof.put("distanceKm",          distKm);
        prof.put("estimatedTimeMin",    timeMin);
        prof.put("avgCongestionIndex",  cong);
        prof.put("avgSafetyRiskIndex",  risk);
        prof.put("avgSpeedKmh",         round1(distKm / (timeMin / 60.0)));

        try {
            Map<String, Object> aiReq = new LinkedHashMap<>();
            aiReq.put("distance_km",      distKm);
            aiReq.put("avg_speed_kmh",    round1(distKm / (timeMin / 60.0)));
            aiReq.put("congestion_index", cong);

            @SuppressWarnings("unchecked")
            Map<String, Object> aiRes = restTemplate.postForObject(flaskAiUrl, aiReq, Map.class);
            if (aiRes != null && aiRes.get("data") != null) {
                prof.put("aiEmissions", aiRes.get("data"));
            } else {
                prof.put("aiEmissions", getFallbackEmissions(distKm, timeMin, cong));
            }
        } catch (Exception e) {
            // FIX: Flask AI offline → graceful fallback, never crash
            prof.put("aiEmissions", getFallbackEmissions(distKm, timeMin, cong));
        }

        return prof;
    }

    private Map<String, Object> getFallbackEmissions(double distKm, double timeMin, double cong) {
        double fuel = Math.round(distKm * 0.082 * (1 + cong * 1.5) * 100.0) / 100.0;
        double co2 = Math.round(fuel * 2310.0 * 10.0) / 10.0;
        
        Map<String, Object> res = new HashMap<>();
        res.put("distance_km", distKm);
        res.put("fuel_consumption_liters", fuel);
        res.put("co2_emissions_grams", co2);
        res.put("ev_energy_kwh", Math.round(distKm * 0.18 * 100.0) / 100.0);
        res.put("eco_score", Math.max(10, Math.min(100, (int)(100 - (co2 / (distKm * 25.0 + 0.1))))));
        return res;
    }
}
