const { findOptimalRoute } = require('./urbanGraphRouter');

// Sample 3D Urban City Graph: Nodes (Intersections) and Edges (Road Segments)
const sampleCityGraph = {
  nodes: {
    N1: { id: 'N1', label: 'Downtown Hub', x: 0, y: 0, z: 0 },
    N2: { id: 'N2', label: 'Financial Center', x: 5, y: 0, z: 2 },
    N3: { id: 'N3', label: 'Tech Park', x: 3, y: 0, z: 8 },
    N4: { id: 'N4', label: 'Residential Zone North', x: 8, y: 0, z: 5 },
    N5: { id: 'N5', label: 'Harbor District', x: 10, y: 0, z: 0 },
    N6: { id: 'N6', label: 'Airport Express Way', x: 12, y: 0, z: 9 }
  },
  adjacencyList: {
    N1: [
      { to: 'N2', distance: 5.0, speedLimit: 50, congestion: 0.85, safetyRisk: 0.2, edgeId: 'E1-2' }, // Heavy congestion
      { to: 'N3', distance: 8.5, speedLimit: 70, congestion: 0.10, safetyRisk: 0.1, edgeId: 'E1-3' }  // Clear highway
    ],
    N2: [
      { to: 'N4', distance: 4.0, speedLimit: 40, congestion: 0.90, safetyRisk: 0.7, edgeId: 'E2-4' }, // Construction/High Risk
      { to: 'N5', distance: 6.0, speedLimit: 60, congestion: 0.30, safetyRisk: 0.2, edgeId: 'E2-5' }
    ],
    N3: [
      { to: 'N4', distance: 5.5, speedLimit: 60, congestion: 0.15, safetyRisk: 0.1, edgeId: 'E3-4' },
      { to: 'N6', distance: 11.0, speedLimit: 90, congestion: 0.05, safetyRisk: 0.05, edgeId: 'E3-6' }
    ],
    N4: [
      { to: 'N6', distance: 4.5, speedLimit: 50, congestion: 0.70, safetyRisk: 0.4, edgeId: 'E4-6' }
    ],
    N5: [
      { to: 'N6', distance: 7.0, speedLimit: 80, congestion: 0.20, safetyRisk: 0.1, edgeId: 'E5-6' }
    ],
    N6: []
  }
};

console.log('--- URBAN DIGITAL TWIN ROUTE OPTIMIZATION TEST ---');
const strategies = ['shortest', 'fastest', 'leastCongested', 'safest'];

strategies.forEach(strategy => {
  const result = findOptimalRoute(sampleCityGraph, 'N1', 'N6', strategy, 'astar');
  console.log(`\nMode [${strategy.toUpperCase()}]:`);
  console.log(`Path: ${result.pathNodeIds.join(' -> ')}`);
  console.log(`Distance: ${result.metrics.distanceKm} km | Time: ${result.metrics.estimatedTimeMin} min (Delay: ${result.metrics.delayMin} min)`);
  console.log(`Avg Congestion: ${result.metrics.avgCongestionIndex} | Avg Risk: ${result.metrics.avgSafetyRiskIndex}`);
});
