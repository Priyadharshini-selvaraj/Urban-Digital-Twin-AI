/**
 * 3D City Model Road Network Graph Extractor
 * Parses 3D city meshes (exported from SketchUp .skp as OBJ / GLTF / JSON geometry),
 * clusters vertex coordinates into intersection nodes, and computes weighted road edges.
 */

function distance3D(v1, v2) {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  const dz = v1.z - v2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Extracts a Dijkstra/A* compatible Graph from raw 3D mesh line/vertex data
 * @param {Array} rawVertices Array of {x, y, z, label}
 * @param {Array} rawLines Array of {fromIndex, toIndex, speedLimit, safetyRisk}
 * @param {Number} proximityThreshold Distance below which vertices merge into one node
 */
export function extractCityGraphFrom3DModel(rawVertices, rawLines, proximityThreshold = 2.0) {
  const clusteredNodes = [];
  const vertexToNodeMap = new Map();

  // 1. Cluster Vertices into Intersection Nodes
  rawVertices.forEach((v, idx) => {
    let existingNode = clusteredNodes.find(n => distance3D(n, v) <= proximityThreshold);
    if (!existingNode) {
      const nodeId = `N${clusteredNodes.length + 1}`;
      existingNode = {
        id: nodeId,
        label: v.label || `Intersection ${nodeId}`,
        x: Math.round(v.x * 100) / 100,
        y: Math.round((v.y || 0) * 100) / 100,
        z: Math.round(v.z * 100) / 100
      };
      clusteredNodes.push(existingNode);
    }
    vertexToNodeMap.set(idx, existingNode.id);
  });

  // Convert Node Array to Object Map
  const nodesMap = {};
  clusteredNodes.forEach(n => {
    nodesMap[n.id] = n;
  });

  // 2. Build Adjacency List for Road Segment Edges
  const adjacencyList = {};
  clusteredNodes.forEach(n => {
    adjacencyList[n.id] = [];
  });

  const edgeSet = new Set();

  rawLines.forEach((line, edgeIdx) => {
    const fromId = vertexToNodeMap.get(line.fromIndex);
    const toId = vertexToNodeMap.get(line.toIndex);

    if (fromId && toId && fromId !== toId) {
      const edgeKey = [fromId, toId].sort().join('-');
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        const dist = parseFloat(distance3D(nodesMap[fromId], nodesMap[toId]).toFixed(2));
        const speed = line.speedLimit || 50;
        const risk = line.safetyRisk || 0.1;
        const edgeId = `E${fromId}-${toId}`;

        const edgeObj1 = {
          to: toId,
          distance: dist,
          speedLimit: speed,
          congestion: line.congestion || 0.2,
          safetyRisk: risk,
          edgeId
        };
        const edgeObj2 = {
          to: fromId,
          distance: dist,
          speedLimit: speed,
          congestion: line.congestion || 0.2,
          safetyRisk: risk,
          edgeId: `E${toId}-${fromId}`
        };

        adjacencyList[fromId].push(edgeObj1);
        adjacencyList[toId].push(edgeObj2);
      }
    }
  });

  return {
    nodes: nodesMap,
    adjacencyList,
    meta: {
      totalNodes: clusteredNodes.length,
      totalRoadSegments: edgeSet.size,
      ingestedAt: new Date().toISOString()
    }
  };
}
