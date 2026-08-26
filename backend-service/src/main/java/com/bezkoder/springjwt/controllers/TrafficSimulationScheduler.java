package com.bezkoder.springjwt.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * TrafficSimulationScheduler
 * Broadcasts live traffic segment data via STOMP WebSocket every 2.5 seconds.
 * Uses ThreadLocalRandom (thread-safe) instead of shared java.util.Random.
 * @EnableScheduling is on SpringBootSecurityJwtApplication, not here.
 */
@Component
public class TrafficSimulationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TrafficSimulationScheduler.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // FIX: Use ThreadLocalRandom - thread-safe, no contention between scheduler threads
    private static final String[] EDGES = {
        "E1-2", "E1-3", "E2-4", "E2-5", "E3-4", "E3-6", "E4-6", "E5-6"
    };

    @Scheduled(fixedRate = 2500)
    public void publishLiveTrafficUpdates() {
        try {
            ThreadLocalRandom rnd = ThreadLocalRandom.current();

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("timestamp", System.currentTimeMillis());

            List<Map<String, Object>> segments = new ArrayList<>();
            for (String edgeId : EDGES) {
                double congestion = Math.round((0.1 + rnd.nextDouble() * 0.85) * 100.0) / 100.0;
                double speed      = Math.round((70.0 * (1.0 - 0.7 * congestion)) * 10.0) / 10.0;

                Map<String, Object> seg = new LinkedHashMap<>();
                seg.put("edgeId",          edgeId);
                seg.put("congestionIndex", congestion);
                seg.put("currentSpeedKmh", speed);
                seg.put("status",          congestion > 0.70 ? "HEAVY" : (congestion > 0.35 ? "MODERATE" : "SMOOTH"));
                segments.add(seg);
            }

            payload.put("segments",       segments);
            payload.put("activeAccidents", rnd.nextInt(3));
            payload.put("cityWeather",     "Partly Cloudy");

            messagingTemplate.convertAndSend("/topic/traffic-updates", payload);

        } catch (Exception e) {
            // FIX: Never let a scheduling exception silently kill the scheduler thread
            logger.warn("[TrafficScheduler] Failed to publish traffic update: {}", e.getMessage());
        }
    }
}
