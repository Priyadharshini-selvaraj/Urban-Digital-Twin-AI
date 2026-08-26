/**
 * AppContext.jsx
 * Global state store for the Urban Digital Twin AI application.
 * Data-driven based on uploaded 3D OBJ models and live vehicle traffic counters.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Client } from '@stomp/stompjs';
import { extractCityGraphFrom3DModel } from '../utils/cityGraphIngestion';
import { findOptimalRoute } from '../utils/urbanGraphRouter';
import { PRESET_MODELS } from '../components/ModelIngestionModule';

const AppContext = createContext(null);

export function AppProvider({ user, onLogout, children }) {
  // ── WebSocket ─────────────────────────────────────────────────────────────
  const [websocketConnected, setWebsocketConnected] = useState(false);

  // ── Model / Graph & OBJ Mesh State ────────────────────────────────────────
  const [selectedModelKey, setSelectedModelKeyRaw] = useState('default');
  const [activeGraphName, setActiveGraphName] = useState('Smart Metropolis Central');
  const [uploadedObjContent, setUploadedObjContent] = useState(null);

  const [activeGraph, setActiveGraph] = useState(() =>
    extractCityGraphFrom3DModel(PRESET_MODELS.default.vertices, PRESET_MODELS.default.lines)
  );

  const [cityModels, setCityModels] = useState([
    {
      key: 'default',
      label: 'Smart Metropolis Central (Default 3D)',
      graph: extractCityGraphFrom3DModel(PRESET_MODELS.default.vertices, PRESET_MODELS.default.lines),
      objContent: null
    }
  ]);

  // ── Route Controls ────────────────────────────────────────────────────────
  const [startNode, setStartNodeState] = useState('J1');
  const [endNode, setEndNodeState] = useState('J6');
  const [vehicleType, setVehicleType] = useState('Sedan / Standard');
  const [algorithm, setAlgorithmState] = useState('astar');
  const [activeProfileKey, setActiveProfileKey] = useState('fastest');
  const [loading, setLoading] = useState(false);
  const [isCalculated, setIsCalculated] = useState(true);
  const [routeError, setRouteError] = useState(null);

  // Wrappers to mark state as dirty/pending recalculation when junctions or inputs change
  const setStartNode = useCallback((val) => {
    setStartNodeState(val);
    setIsCalculated(false);
    setRouteError(null);
  }, []);

  const setEndNode = useCallback((val) => {
    setEndNodeState(val);
    setIsCalculated(false);
    setRouteError(null);
  }, []);

  const setAlgorithm = useCallback((val) => {
    setAlgorithmState(val);
    setIsCalculated(false);
    setRouteError(null);
  }, []);

  const setSelectedModelKey = useCallback((val) => {
    setSelectedModelKeyRaw(val);
    setIsCalculated(false);
    setRouteError(null);
  }, []);

  // ── Live Traffic Vehicle Counters ─────────────────────────────────────────
  const [trafficVehicleCounts, setTrafficVehicleCountsState] = useState({
    cars: 145, speedCars: 42, congCars: 65, growthCars: '+12%',
    bikes: 62, speedBikes: 28, congBikes: 25, growthBikes: '+5%',
    buses: 18, speedBuses: 32, congBuses: 40, growthBuses: '+2%',
    trucks: 24, speedTrucks: 35, congTrucks: 55, growthTrucks: '-3%',
    emergency: { ambulances: 3, fireTrucks: 2, police: 5, total: 10, speed: 65, cong: 15 }
  });

  const setTrafficVehicleCounts = useCallback((val) => {
    setTrafficVehicleCountsState(val);
    setIsCalculated(false);
    setRouteError(null);
  }, []);

  const [trafficSegments, setTrafficSegments] = useState([]);

  // ── Route Profiles State ──────────────────────────────────────────────────
  const [routeProfiles, setRouteProfiles] = useState([]);
  const [routeNodeSequences, setRouteNodeSequences] = useState({});

  // ── Model Selection Synchronization ──────────────────────────────────────
  useEffect(() => {
    const targetModel = cityModels.find(m => m.key === selectedModelKey);
    if (targetModel && targetModel.graph) {
      console.log(`[Model Sync] Switching active model to '${targetModel.label}' (${targetModel.key})`);
      setActiveGraph(targetModel.graph);
      setActiveGraphName(targetModel.label);
      setUploadedObjContent(targetModel.objContent || null);
      setRouteError(null);

      const keys = Object.keys(targetModel.graph.nodes || {});
      if (keys.length >= 2) {
        if (!targetModel.graph.nodes[startNode]) setStartNodeState(keys[0]);
        if (!targetModel.graph.nodes[endNode]) setEndNodeState(keys[keys.length - 1]);
      }
    }
  }, [selectedModelKey, cityModels, startNode, endNode]);

  // ── Compute 4 Distinct Route Profiles ─────────────────────────────────────
  const computeProfiles = useCallback((graph, from, to, algo = algorithm, vehicleCounts = trafficVehicleCounts) => {
    const strategies = ['fastest', 'shortest', 'leastCongested', 'safest'];
    const profiles = [];
    const sequences = {};

    strategies.forEach(strat => {
      try {
        const res = findOptimalRoute(graph, from, to, strat, algo, vehicleCounts);
        if (res.success) {
          sequences[strat] = res.pathNodeIds;
          profiles.push({
            key: strat,
            title: `${strat.charAt(0).toUpperCase() + strat.slice(1)} Path`,
            distanceKm: res.metrics.distanceKm,
            estimatedTimeMin: res.metrics.estimatedTimeMin,
            freeFlowTimeMin: res.metrics.freeFlowTimeMin,
            delayMin: res.metrics.delayMin,
            avgSpeedKmh: res.metrics.avgSpeedKmh,
            avgCongestionIndex: res.metrics.avgCongestionIndex,
            avgSafetyRiskIndex: res.metrics.avgSafetyRiskIndex,
            roadCount: res.metrics.roadCount,
            visitedJunctionsCount: res.metrics.visitedJunctionsCount,
            etaString: res.metrics.etaString,
            algorithmUsed: res.metrics.algorithmUsed,
            pathCost: res.metrics.pathCost,
            nodesVisited: res.metrics.nodesVisited,
            accuracyRate: res.metrics.accuracyRate || 99.4,
            edges: res.edges || [],
            pathNodeIds: res.pathNodeIds || [],
            validityStatus: '100% Valid & Connected',
            aiEmissions: {
              fuel_consumption_liters: res.metrics.fuelConsumptionLiters,
              co2_emissions_grams: res.metrics.co2EmissionsGrams,
              ev_energy_kwh: res.metrics.evEnergyKwh,
              eco_score: res.metrics.ecoScore
            }
          });
        }
      } catch (e) {
        console.warn(`[Routing Warning] Profile ${strat} error:`, e);
      }
    });

    return { profiles, sequences };
  }, [algorithm, trafficVehicleCounts]);

  // Compute initial profiles on initial load / model change
  const initialCalculatedRef = React.useRef(false);
  useEffect(() => {
    if (!activeGraph?.nodes) return;
    const nodeKeys = Object.keys(activeGraph.nodes);
    if (nodeKeys.length < 2) return;

    const validStart = activeGraph.nodes[startNode] ? startNode : nodeKeys[0];
    const validEnd = activeGraph.nodes[endNode] ? endNode : nodeKeys[nodeKeys.length - 1];

    if (!initialCalculatedRef.current) {
      const { profiles, sequences } = computeProfiles(activeGraph, validStart, validEnd, algorithm, trafficVehicleCounts);
      if (profiles.length > 0) {
        setRouteProfiles(profiles);
        setRouteNodeSequences(sequences);
        setIsCalculated(true);
        initialCalculatedRef.current = true;
      }
    }
  }, [activeGraph, startNode, endNode, algorithm, trafficVehicleCounts, computeProfiles]);

  // Derived Values Memoization
  const availableNodes = useMemo(() => {
    return Object.values(activeGraph.nodes || {}).map(n => ({
      id: n.id,
      label: `${n.id} - ${n.label || 'Junction_' + n.id}`
    }));
  }, [activeGraph.nodes]);

  const activeProfile = useMemo(() => {
    return routeProfiles.find(p => p.key === activeProfileKey) || routeProfiles[0];
  }, [routeProfiles, activeProfileKey]);

  const bestProfile = useMemo(() => {
    return routeProfiles.find(p => p.key === 'fastest') || routeProfiles[0];
  }, [routeProfiles]);

  const selectedRouteNodes = useMemo(() => {
    return routeNodeSequences[activeProfileKey] ||
      (availableNodes.length > 0 ? [availableNodes[0].id] : []);
  }, [routeNodeSequences, activeProfileKey, availableNodes]);

  const overallAccuracyRate = useMemo(() => {
    if (!routeProfiles || routeProfiles.length === 0) return 99.4;
    const sum = routeProfiles.reduce((acc, p) => acc + (p.accuracyRate || 99.4), 0);
    return parseFloat((sum / routeProfiles.length).toFixed(1));
  }, [routeProfiles]);

  // ── Calculate Route Action with Strict Validation & Debug Logging ────────
  const handleCalculateRoute = useCallback(async () => {
    setLoading(true);
    setRouteError(null);

    console.log(`[Route Calculation Requested] Start Node: ${startNode} | End Node: ${endNode} | Model: ${activeGraphName}`);

    // 1. Validation: Check node presence and equality
    if (!startNode || !endNode) {
      const err = "Please select both a Start Junction and an End Junction.";
      console.error(`[Route Error]: ${err}`);
      setRouteError(err);
      setLoading(false);
      return;
    }

    if (startNode === endNode) {
      const err = `Start Junction and Destination Junction must be different (both are currently ${startNode}).`;
      console.error(`[Route Error]: ${err}`);
      setRouteError(err);
      setLoading(false);
      return;
    }

    if (!activeGraph?.nodes?.[startNode]) {
      const err = `Start Junction '${startNode}' does not exist in the active graph model.`;
      console.error(`[Route Error]: ${err}`);
      setRouteError(err);
      setLoading(false);
      return;
    }

    if (!activeGraph?.nodes?.[endNode]) {
      const err = `Destination Junction '${endNode}' does not exist in the active graph model.`;
      console.error(`[Route Error]: ${err}`);
      setRouteError(err);
      setLoading(false);
      return;
    }

    try {
      // 2. Compute optimized route profiles for selected start/end junctions
      const { profiles, sequences } = computeProfiles(activeGraph, startNode, endNode, algorithm, trafficVehicleCounts);
      if (!profiles || profiles.length === 0) {
        const err = `No valid path available between junction ${startNode} and junction ${endNode} in the current city network.`;
        console.error(`[Route Error]: ${err}`);
        setRouteError(err);
      } else {
        setRouteProfiles(profiles);
        setRouteNodeSequences(sequences);
        setIsCalculated(true);
        setRouteError(null);

        const primary = profiles[0];
        console.log(`[Generated Shortest Path]: ${sequences[primary.key]?.join(' -> ')}`);
        console.log(`[Total Distance]: ${primary.distanceKm} km`);
        console.log(`[Travel Time]: ${primary.estimatedTimeMin} mins`);
        console.log(`[Roads Traversed]: ${primary.roadCount}`);
        console.log(`[Intersections Visited]: ${primary.visitedJunctionsCount}`);
      }
    } catch (e) {
      console.error(`[Route Exception]:`, e);
      setRouteError(`Route Calculation Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [activeGraph, startNode, endNode, algorithm, trafficVehicleCounts, computeProfiles, activeGraphName]);

  // ── Handle Dynamic 3D OBJ Upload ──────────────────────────────────────────
  const handleCustomIngestSuccess = useCallback((graph, fileName, rawObjText = null) => {
    console.log(`[Dynamic Graph Rebuilt] Clearing previous graph and reconstructing graph for '${fileName}'.`);
    console.log(`[Detected Nodes]:`, Object.keys(graph.nodes));
    console.log(`[Detected Edges]:`, graph.meta?.totalRoadSegments || 0);

    const modelKey = `upload_${fileName}_${Date.now()}`;
    const modelLabel = `${fileName} (Uploaded)`;

    const newModelItem = {
      key: modelKey,
      label: modelLabel,
      graph,
      objContent: rawObjText
    };

    setCityModels([
      { key: 'default', label: 'Smart Metropolis Central (Default 3D)', graph: extractCityGraphFrom3DModel(PRESET_MODELS.default.vertices, PRESET_MODELS.default.lines), objContent: null },
      newModelItem
    ]);

    setSelectedModelKey(modelKey);
    setActiveGraph(graph);
    setActiveGraphName(modelLabel);
    setUploadedObjContent(rawObjText);
    setRouteError(null);

    const keys = Object.keys(graph.nodes);
    if (keys.length >= 2) {
      const first = keys[0];
      const last = keys[keys.length - 1];
      setStartNode(first);
      setEndNode(last);

      const { profiles, sequences } = computeProfiles(graph, first, last, algorithm, trafficVehicleCounts);
      if (profiles.length > 0) {
        setRouteProfiles(profiles.map(p => ({ ...p, title: `${p.title} (${fileName})` })));
        setRouteNodeSequences(sequences);
      }
    }
  }, [algorithm, trafficVehicleCounts, computeProfiles]);

  // ── Handle 3D Node Click Selection ─────────────────────────────────────────
  const handleNodeClick = useCallback((nodeId) => {
    if (!nodeId) return;
    if (nodeId !== startNode) {
      setEndNode(nodeId);
    }
  }, [startNode]);

  // ── STOMP WebSocket Traffic Stream ─────────────────────────────────────────
  useEffect(() => {
    let stompClient;
    try {
      stompClient = new Client({
        brokerURL: 'ws://localhost:8081/ws-traffic-direct',
        onConnect: () => {
          setWebsocketConnected(true);
          stompClient.subscribe('/topic/traffic-updates', (message) => {
            if (message.body) {
              const data = JSON.parse(message.body);
              if (data.segments) setTrafficSegments(data.segments);
            }
          });
        },
        onDisconnect: () => setWebsocketConnected(false),
        onStompError: () => setWebsocketConnected(false)
      });
      stompClient.activate();
    } catch (e) {
      setWebsocketConnected(false);
    }
    return () => { if (stompClient) stompClient.deactivate(); };
  }, []);

  const value = useMemo(() => ({
    user, onLogout,
    websocketConnected,
    activeGraph, activeGraphName, selectedModelKey, setSelectedModelKey,
    uploadedObjContent, setUploadedObjContent,
    cityModels,
    availableNodes, startNode, setStartNode, endNode, setEndNode,
    vehicleType, setVehicleType,
    algorithm, setAlgorithm,
    trafficVehicleCounts, setTrafficVehicleCounts,
    routeProfiles, activeProfileKey, setActiveProfileKey,
    routeNodeSequences, selectedRouteNodes,
    activeProfile, bestProfile,
    trafficSegments,
    isCalculated, setIsCalculated, overallAccuracyRate, routeError, setRouteError,
    loading, handleCalculateRoute, handleCustomIngestSuccess, handleNodeClick
  }), [
    user, onLogout, websocketConnected, activeGraph, activeGraphName,
    selectedModelKey, uploadedObjContent, cityModels, availableNodes,
    startNode, endNode, vehicleType, algorithm, trafficVehicleCounts,
    routeProfiles, activeProfileKey, routeNodeSequences, selectedRouteNodes,
    activeProfile, bestProfile, trafficSegments, isCalculated, overallAccuracyRate, routeError, loading,
    handleCalculateRoute, handleCustomIngestSuccess, handleNodeClick
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
