/**
 * Urban Digital Twin AI - 3D Graph Pathfinding Engine
 * Implements Dijkstra & A* for 4 routing strategies:
 * - shortest
 * - fastest
 * - leastCongested
 * - safest
 */

export class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(element, priority) {
    this.heap.push({ element, priority });
    this.bubbleUp();
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown();
    }
    return min.element;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  bubbleUp() {
    let idx = this.heap.length - 1;
    const element = this.heap[idx];
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      let parent = this.heap[parentIdx];
      if (element.priority >= parent.priority) break;
      this.heap[parentIdx] = element;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
  }

  sinkDown() {
    let idx = 0;
    const length = this.heap.length;
    const element = this.heap[0];
    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }
}

// 3D Euclidean distance heuristic for A*
export function euclideanDistance3D(nodeA, nodeB) {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  const dz = nodeA.z - nodeB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate dynamic cost of an edge based on routing profile
export function calculateEdgeCost(edge, strategy) {
  const distance = edge.distance;
  const speed = edge.speedLimit || 50; // km/h
  const congestion = Math.max(0, Math.min(1, edge.congestion || 0)); // 0.0 to 1.0
  const safetyRisk = Math.max(0, Math.min(1, edge.safetyRisk || 0)); // 0.0 to 1.0

  switch (strategy) {
    case 'shortest':
      return distance;

    case 'fastest':
      // Effective speed degrades as congestion increases
      const effectiveSpeed = Math.max(5, speed * (1.0 - 0.85 * congestion));
      // Travel time in minutes
      return (distance / effectiveSpeed) * 60;

    case 'leastCongested':
      // Exponential penalty for congestion
      return distance * (1.0 + 4.0 * Math.pow(congestion, 2));

    case 'safest':
      // Penalty for high risk score and heavy traffic
      return distance * (1.0 + 3.0 * safetyRisk + 1.5 * congestion);

    default:
      return distance;
  }
}

/**
 * Solves optimal route on a 3D Urban Graph using A* 3D Spatial Heuristic
 */
export function findOptimalRoute(graph, startId, endId, strategy = 'fastest', algorithm = 'astar') {
  const nodes = graph.nodes; // Map or Object of nodeId -> { id, label, x, y, z }
  const adjacencyList = graph.adjacencyList; // nodeId -> Array of { to, distance, speedLimit, congestion, safetyRisk, edgeId }

  if (!nodes || !nodes[startId] || !nodes[endId]) {
    return { success: false, message: `Invalid start (${startId}) or end (${endId}) node.` };
  }

  const distances = {};
  const previous = {};
  const edgeUsed = {};
  const pq = new MinPriorityQueue();

  for (const nodeId in nodes) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    edgeUsed[nodeId] = null;
  }

  distances[startId] = 0;
  pq.enqueue(startId, 0);

  let nodesVisitedCount = 0;

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue();
    nodesVisitedCount++;

    if (currentId === endId) break;

    const neighbors = adjacencyList[currentId] || [];
    for (const edge of neighbors) {
      const neighborId = edge.to;
      const stepCost = calculateEdgeCost(edge, strategy);
      const newDistance = distances[currentId] + stepCost;

      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = currentId;
        edgeUsed[neighborId] = edge;

        let priority = newDistance;
        // Add A* heuristic (Euclidean 3D spatial distance to target)
        const heuristic = euclideanDistance3D(nodes[neighborId], nodes[endId]);
        priority += heuristic;

        pq.enqueue(neighborId, priority);
      }
    }
  }

  // Reconstruct path
  const path = [];
  const edgePath = [];
  let curr = endId;

  if (distances[endId] === Infinity) {
    return { success: false, message: 'No route found between selected nodes.' };
  }

  while (curr) {
    path.unshift(nodes[curr]);
    if (edgeUsed[curr]) {
      edgePath.unshift(edgeUsed[curr]);
    }
    curr = previous[curr];
  }

  // Compute metrics
  let totalDistance = 0;
  let totalFreeFlowTime = 0;
  let totalCongestedTime = 0;
  let totalSafetyRisk = 0;
  let totalCongestion = 0;

  for (const edge of edgePath) {
    totalDistance += edge.distance;
    const effSpeed = Math.max(5, (edge.speedLimit || 50) * (1.0 - 0.85 * (edge.congestion || 0)));
    totalFreeFlowTime += (edge.distance / (edge.speedLimit || 50)) * 60;
    totalCongestedTime += (edge.distance / effSpeed) * 60;
    totalCongestion += edge.congestion || 0;
    totalSafetyRisk += edge.safetyRisk || 0;
  }

  const avgCongestion = edgePath.length ? totalCongestion / edgePath.length : 0;
  const avgSafetyRisk = edgePath.length ? totalSafetyRisk / edgePath.length : 0;

  return {
    success: true,
    algorithm,
    strategy,
    pathNodeIds: path.map(n => n.id),
    pathNodes: path,
    edges: edgePath,
    metrics: {
      distanceKm: parseFloat(totalDistance.toFixed(2)),
      estimatedTimeMin: parseFloat(totalCongestedTime.toFixed(1)),
      freeFlowTimeMin: parseFloat(totalFreeFlowTime.toFixed(1)),
      delayMin: parseFloat(Math.max(0, totalCongestedTime - totalFreeFlowTime).toFixed(1)),
      avgCongestionIndex: parseFloat(avgCongestion.toFixed(2)),
      avgSafetyRiskIndex: parseFloat(avgSafetyRisk.toFixed(2)),
      nodesVisited: nodesVisitedCount
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MinPriorityQueue,
    euclideanDistance3D,
    calculateEdgeCost,
    findOptimalRoute
  };
}
