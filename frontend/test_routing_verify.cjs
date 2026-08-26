/**
 * Comprehensive Routing Algorithm Verification Test
 * Tests all 4 strategies (shortest, fastest, leastCongested, safest)
 * across multiple start/end pairs using Dijkstra & A*
 * Self-contained — no external ES module imports needed.
 */

function distance3D(v1, v2) {
  const dx = (v1.x||0) - (v2.x||0);
  const dy = (v1.y||0) - (v2.y||0);
  const dz = (v1.z||0) - (v2.z||0);
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

// Build test graph matching j1.obj (6 nodes, 8 edges, varied properties)
const testVertices = [
  { x: 0,    y: 0, z: 0,   label: 'J1_Main_Square' },
  { x: 16.5, y: 0, z: 5.2, label: 'J2_Financial_District' },
  { x: 8.2,  y: 0, z: 20.4,label: 'J3_Central_Expressway' },
  { x: 26.0, y: 0, z: 14.8,label: 'J4_North_Residential' },
  { x: 32.5, y: 0, z: 3.1, label: 'J5_Harbor_Port' },
  { x: 40.0, y: 0, z: 28.0,label: 'J6_Airport_Terminal' }
];

const testLines = [
  { fromIndex: 0, toIndex: 1, speedLimit: 50,  congestion: 0.75, safetyRisk: 0.30 }, // J1->J2: congested low-speed
  { fromIndex: 0, toIndex: 2, speedLimit: 85,  congestion: 0.10, safetyRisk: 0.05 }, // J1->J3: fast expressway
  { fromIndex: 1, toIndex: 3, speedLimit: 45,  congestion: 0.85, safetyRisk: 0.40 }, // J2->J4: heavy traffic
  { fromIndex: 1, toIndex: 4, speedLimit: 60,  congestion: 0.25, safetyRisk: 0.15 }, // J2->J5: medium road
  { fromIndex: 2, toIndex: 3, speedLimit: 70,  congestion: 0.12, safetyRisk: 0.08 }, // J3->J4: light traffic
  { fromIndex: 2, toIndex: 5, speedLimit: 110, congestion: 0.03, safetyRisk: 0.02 }, // J3->J6: highway
  { fromIndex: 3, toIndex: 5, speedLimit: 65,  congestion: 0.50, safetyRisk: 0.20 }, // J4->J6: moderate
  { fromIndex: 4, toIndex: 5, speedLimit: 90,  congestion: 0.18, safetyRisk: 0.10 }, // J5->J6: fast port road
];

// Build adjacency list manually
const nodes = {};
testVertices.forEach((v, i) => {
  const id = `J${i+1}`;
  nodes[id] = { id, x: v.x, y: v.y, z: v.z, label: v.label };
});

const adjacencyList = {};
Object.keys(nodes).forEach(id => { adjacencyList[id] = []; });

testLines.forEach((line, idx) => {
  const fromId = `J${line.fromIndex + 1}`;
  const toId = `J${line.toIndex + 1}`;
  const nodeA = nodes[fromId];
  const nodeB = nodes[toId];
  const dist = parseFloat(distance3D(nodeA, nodeB).toFixed(2));

  adjacencyList[fromId].push({
    from: fromId, to: toId, distance: dist,
    speedLimit: line.speedLimit, congestion: line.congestion,
    safetyRisk: line.safetyRisk, roadWidth: 10
  });
  adjacencyList[toId].push({
    from: toId, to: fromId, distance: dist,
    speedLimit: line.speedLimit, congestion: line.congestion,
    safetyRisk: line.safetyRisk, roadWidth: 10
  });
});

const graph = { nodes, adjacencyList, meta: { totalNodes: 6, totalRoadSegments: 8 } };

// ──────────────────────────────────────────────────────────────────────────────
// MinPriorityQueue
class MinPriorityQueue {
  constructor() { this.heap = []; }
  enqueue(el, p) { this.heap.push({element: el, priority: p}); this.bubbleUp(); }
  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) { this.heap[0] = end; this.sinkDown(); }
    return min.element;
  }
  isEmpty() { return this.heap.length === 0; }
  bubbleUp() {
    let idx = this.heap.length - 1;
    const el = this.heap[idx];
    while (idx > 0) {
      const pi = Math.floor((idx - 1) / 2);
      if (el.priority >= this.heap[pi].priority) break;
      this.heap[pi] = el; this.heap[idx] = this.heap[pi]; [this.heap[pi], this.heap[idx]] = [this.heap[idx], el]; idx = pi;
    }
  }
  sinkDown() {
    let idx = 0;
    const el = this.heap[0];
    const len = this.heap.length;
    while (true) {
      const li = 2*idx+1, ri = 2*idx+2;
      let swap = null;
      if (li < len && this.heap[li].priority < el.priority) swap = li;
      if (ri < len && ((swap === null && this.heap[ri].priority < el.priority) || (swap !== null && this.heap[ri].priority < this.heap[li].priority))) swap = ri;
      if (swap === null) break;
      this.heap[idx] = this.heap[swap]; this.heap[swap] = el; idx = swap;
    }
  }
}

function eucDist(a, b) {
  const dx=(a.x||0)-(b.x||0), dy=(a.y||0)-(b.y||0), dz=(a.z||0)-(b.z||0);
  return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

function calcHeuristic(curr, target, strategy) {
  const d = eucDist(curr, target);
  if (d === 0) return 0;
  switch(strategy) {
    case 'shortest': return d;
    case 'fastest': return (d / 120.0) * 60.0;
    case 'leastCongested': return d * 1.0;
    case 'safest': return d * 1.0;
    default: return d;
  }
}

function calcEdgeCost(edge, strategy, vc = {}) {
  const dist = edge.distance || 1.0;
  const speed = edge.speedLimit || 60;
  const cong = Math.max(0.02, Math.min(1.0, edge.congestion !== undefined ? edge.congestion : 0.2));
  const risk = Math.max(0.02, Math.min(1.0, edge.safetyRisk !== undefined ? edge.safetyRisk : 0.1));
  const roadWidth = edge.roadWidth || 10;
  const cars = typeof vc.cars === 'number' ? vc.cars : 142;
  const trucks = typeof vc.trucks === 'number' ? vc.trucks : 26;
  const buses = typeof vc.buses === 'number' ? vc.buses : 18;
  const emergency = typeof vc.emergency === 'object' ? (vc.emergency.total || 10) : (vc.emergency || 10);
  const trafficVolumeFactor = 1.0 + (cars + buses * 2.5) / 150.0;

  switch(strategy) {
    case 'shortest': return dist;
    case 'fastest': {
      const effSpeed = Math.max(10.0, speed * (1.0 - 0.7 * (cars/120.0) * cong));
      return (dist / effSpeed) * 60.0;
    }
    case 'leastCongested':
      return dist * (1.0 + 35.0 * Math.pow(cong, 2) * trafficVolumeFactor);
    case 'safest': {
      const nrtp = (roadWidth < 9 ? 4.0 : 0.5) * (trucks / 15.0);
      const epd = emergency > 5 ? 0.7 : 1.0;
      return dist * (1.0 + 25.0 * risk + 8.0 * cong + nrtp) * epd;
    }
    default: return dist;
  }
}

function findRoute(graph, startId, endId, strategy, algorithm = 'astar', vehicleCounts = {}) {
  const nodes = graph.nodes;
  const adj = graph.adjacencyList;

  if (!nodes[startId] || !nodes[endId]) return { success: false, message: 'Invalid nodes' };

  const gScore = {}, previous = {}, edgeUsed = {};
  const visited = new Set();
  const pq = new MinPriorityQueue();

  for (const n in nodes) { gScore[n] = Infinity; previous[n] = null; edgeUsed[n] = null; }
  gScore[startId] = 0;
  const h0 = algorithm === 'astar' ? calcHeuristic(nodes[startId], nodes[endId], strategy) : 0;
  pq.enqueue(startId, h0);

  while (!pq.isEmpty()) {
    const curr = pq.dequeue();
    if (visited.has(curr)) continue;
    visited.add(curr);
    if (curr === endId) break;

    for (const edge of (adj[curr] || [])) {
      const nb = edge.to;
      if (visited.has(nb)) continue;
      const cost = calcEdgeCost(edge, strategy, vehicleCounts);
      const tg = gScore[curr] + cost;
      if (tg < gScore[nb]) {
        gScore[nb] = tg;
        previous[nb] = curr;
        edgeUsed[nb] = edge;
        const h = algorithm === 'astar' ? calcHeuristic(nodes[nb], nodes[endId], strategy) : 0;
        pq.enqueue(nb, tg + h);
      }
    }
  }

  if (gScore[endId] === Infinity) return { success: false };

  // Reconstruct path
  const path = [], edgePath = [];
  let cur = endId;
  while (cur) { path.unshift(cur); if (edgeUsed[cur]) edgePath.unshift(edgeUsed[cur]); cur = previous[cur]; }

  // Sum actual distances
  let totalDist = 0, totalFFF = 0, totalCT = 0, totalCong = 0, totalRisk = 0;
  const cars = typeof vehicleCounts.cars === 'number' ? vehicleCounts.cars : 142;
  for (const e of edgePath) {
    totalDist += (e.distance || 1.0);
    const sp = e.speedLimit || 60;
    const cg = e.congestion !== undefined ? e.congestion : 0.2;
    const rk = e.safetyRisk !== undefined ? e.safetyRisk : 0.1;
    const effSp = Math.max(10.0, sp * (1.0 - 0.65 * (cars/120.0) * cg));
    totalFFF += (e.distance / sp) * 60;
    totalCT += (e.distance / effSp) * 60;
    totalCong += cg;
    totalRisk += rk;
  }

  return {
    success: true,
    path,
    dist: parseFloat(totalDist.toFixed(2)),
    timeMin: parseFloat(totalCT.toFixed(1)),
    freeFlowMin: parseFloat(totalFFF.toFixed(1)),
    avgCong: edgePath.length ? parseFloat((totalCong / edgePath.length).toFixed(2)) : 0.2,
    avgRisk: edgePath.length ? parseFloat((totalRisk / edgePath.length).toFixed(2)) : 0.1,
    pathCost: parseFloat(gScore[endId].toFixed(3))
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Optimality Verifier: Brute-force all simple paths, compare against A* result
function findAllSimplePaths(graph, start, end, maxLen = 8) {
  const results = [];
  const adj = graph.adjacencyList;

  function dfs(current, target, path, edges, visited) {
    if (path.length > maxLen) return;
    if (current === target && path.length > 1) {
      results.push({ path: [...path], edges: [...edges] });
      return;
    }
    for (const e of (adj[current] || [])) {
      const nb = e.to;
      if (!visited.has(nb)) {
        visited.add(nb);
        path.push(nb);
        edges.push(e);
        dfs(nb, target, path, edges, visited);
        path.pop();
        edges.pop();
        visited.delete(nb);
      }
    }
  }

  const visited = new Set([start]);
  dfs(start, end, [start], [], visited);
  return results;
}

function calcPathCost(edges, strategy, vc) {
  return edges.reduce((sum, e) => sum + calcEdgeCost(e, strategy, vc), 0);
}

// ──────────────────────────────────────────────────────────────────────────────
const vehicleCounts = { cars: 145, bikes: 62, buses: 18, trucks: 24, emergency: { total: 10 } };

const testCases = [
  { start: 'J1', end: 'J6' },
  { start: 'J1', end: 'J5' },
  { start: 'J2', end: 'J6' },
  { start: 'J3', end: 'J4' },
  { start: 'J1', end: 'J4' }
];
const strategies = ['shortest', 'fastest', 'leastCongested', 'safest'];
const algorithms = ['astar', 'dijkstra'];

console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║     Urban Digital Twin AI - Routing Algorithm Verification Test      ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('Graph: 6 Nodes (J1-J6), 8 Edges with varied congestion/speed/risk\n');

let passCount = 0, failCount = 0;

testCases.forEach(({ start, end }) => {
  console.log(`\n┌─ Route: ${start} → ${end} ─────────────────────────────────────────────`);

  strategies.forEach(strat => {
    // Run both A* and Dijkstra
    const resAstar = findRoute(graph, start, end, strat, 'astar', vehicleCounts);
    const resDijkstra = findRoute(graph, start, end, strat, 'dijkstra', vehicleCounts);

    // Brute force all paths and compute optimal
    const allPaths = findAllSimplePaths(graph, start, end);
    let bestCost = Infinity, bestPath = null;
    allPaths.forEach(p => {
      const c = calcPathCost(p.edges, strat, vehicleCounts);
      if (c < bestCost) { bestCost = c; bestPath = p.path; }
    });

    if (!resAstar.success) {
      console.log(`  [${strat.padEnd(14)}] ❌ No route found`);
      failCount++;
      return;
    }

    // Verify A* found the true optimal (compare cost to brute force)
    const astarCostDiff = Math.abs(resAstar.pathCost - bestCost);
    const isOptimal = astarCostDiff < 0.001;

    // Verify A* & Dijkstra find same cost
    const algoCostDiff = Math.abs(resAstar.pathCost - resDijkstra.pathCost);
    const algoAgree = algoCostDiff < 0.001;

    if (isOptimal && algoAgree) {
      console.log(`  [${strat.padEnd(14)}] ✅ Optimal | Path: ${resAstar.path.join('→')} | Dist: ${resAstar.dist} km | Time: ${resAstar.timeMin} min | Cong: ${resAstar.avgCong} | Risk: ${resAstar.avgRisk}`);
      passCount++;
    } else if (!isOptimal) {
      console.log(`  [${strat.padEnd(14)}] ❌ SUB-OPTIMAL | A*: ${resAstar.pathCost.toFixed(3)} ≠ BruteForce: ${bestCost.toFixed(3)} | BestPath: ${bestPath?.join('→')} | A*Path: ${resAstar.path.join('→')}`);
      failCount++;
    } else {
      console.log(`  [${strat.padEnd(14)}] ⚠️  Dijkstra≠A* | A*: ${resAstar.pathCost.toFixed(3)} | Dijkstra: ${resDijkstra.pathCost.toFixed(3)}`);
      failCount++;
    }
  });
});

console.log('\n════════════════════════════════════════════════════════════════════════');
console.log(`TEST RESULTS: ${passCount} PASSED ✅  |  ${failCount} FAILED ❌`);
console.log('════════════════════════════════════════════════════════════════════════');

// Edge weight verification
console.log('\n── Edge Properties Debug ──────────────────────────────────────────────');
Object.keys(adjacencyList).forEach(from => {
  adjacencyList[from].forEach(e => {
    if (from < e.to) { // avoid duplicates
      console.log(`  ${from} → ${e.to} | Dist: ${e.distance.toFixed(2)} km | Speed: ${e.speedLimit} km/h | Cong: ${e.congestion} | Risk: ${e.safetyRisk}`);
    }
  });
});
