const fs = require('fs');
const path = require('path');

// Dynamically import ES modules or require
const { extractCityGraphFrom3DModel, parseObjFileContent } = require('./src/utils/cityGraphIngestion.js');
const { findOptimalRoute } = require('./src/utils/urbanGraphRouter.js');

const objPath = 'c:/Users/acer/Downloads/Twin ai/sample_models/j5_metro_district.obj';
const objText = fs.readFileSync(objPath, 'utf8');
const graph = parseObjFileContent(objText, 'j5_metro_district.obj');

console.log('=== ROUTING DISTANCE INTEGRITY TEST ===');
console.log('Total Graph Nodes:', Object.keys(graph.nodes).length);
console.log('Total Graph Edges:', graph.meta.totalRoadSegments);
console.log('');

const testPairs = [
  { start: 'J1', end: 'J2' },
  { start: 'J1', end: 'J6' },
  { start: 'J1', end: 'J12' },
  { start: 'J5', end: 'J8' },
  { start: 'J9', end: 'J4' }
];

const strategies = ['shortest', 'fastest', 'leastCongested', 'safest'];

testPairs.forEach(pair => {
  console.log(`--- Route Pair: ${pair.start} -> ${pair.end} ---`);
  strategies.forEach(strat => {
    const res = findOptimalRoute(graph, pair.start, pair.end, strat, 'astar');
    if (res.success) {
      console.log(`  [${strat.padEnd(14)}] Dist: ${res.metrics.distanceKm} km | Time: ${res.metrics.estimatedTimeMin} min | Path: ${res.pathNodeIds.join(' -> ')}`);
    } else {
      console.log(`  [${strat}] Error: ${res.message}`);
    }
  });
  console.log('');
});
