/**
 * City3DCanvas.jsx
 * Full Three.js Scene — Audited, Optimized, Memory-safe
 *
 * Fixes applied:
 *  1. OrbitControls for camera rotate/pan/zoom
 *  2. ShadowMap enabled on renderer (PCFSoft shadows)
 *  3. Removed `alpha:true` (scene has solid background — causes compositing overhead)
 *  4. OBJ model auto-centered & scaled to fit scene bounding box
 *  5. Ring animation uses userData flag (not deprecated geometry.type string)
 *  6. Single-pass disposal — disposeHierarchy removed, only registry lists used
 *  7. ResizeObserver replaces window.resize (handles panel resizing without window change)
 *  8. FPS-capped animation loop (capped at 60fps max via delta time)
 *  9. Removed unused registerTexture + createdTextures
 * 10. GridHelper disposed via its own internal geometry & material arrays
 * 11. containerRef null-guard on disposal
 * 12. Line2 / LineMaterial for thick active-path lines with true linewidth
 * 13. Camera target stored as THREE.Vector3 for OrbitControls
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function City3DCanvas({
  activeProfileKey,
  trafficSegments,
  selectedRouteNodes,
  cityGraph,
  uploadedObjContent,
  onNodeClick
}) {
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Container Dimensions ───────────────────────────────────────────────
    const width  = container.clientWidth  || 800;
    const height = container.clientHeight || 500;

    // ── 2. Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.004);

    const geometryRegistry  = [];
    const materialRegistry  = [];
    const objectsToDispose  = [];

    const regGeo  = (g) => { geometryRegistry.push(g); return g; };
    const regMat  = (m) => { materialRegistry.push(m); return m; };

    // ── 3. Node & Edge Extraction ─────────────────────────────────────────────
    const nodes        = cityGraph?.nodes        || {};
    const adjacencyList = cityGraph?.adjacencyList || {};
    const nodeKeys     = Object.keys(nodes);

    if (nodeKeys.length === 0) {
      console.warn('[City3D] Empty graph — nothing to render.');
      return;
    }

    // ── 4. Bounding Box & Auto-Fit ────────────────────────────────────────────
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    nodeKeys.forEach(id => {
      const n = nodes[id];
      if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
      if ((n.y||0) < minY) minY = n.y||0; if ((n.y||0) > maxY) maxY = n.y||0;
      if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
    });

    const centerX  = (minX + maxX) / 2;
    const centerZ  = (minZ + maxZ) / 2;
    const spanX    = Math.max(maxX - minX, 5);
    const spanZ    = Math.max(maxZ - minZ, 5);
    const maxSpan  = Math.max(spanX, spanZ);

    const baseNodeRadius = Math.max(0.3, Math.min(1.5, maxSpan * 0.022));

    // ── 5. Camera ─────────────────────────────────────────────────────────────
    const cameraTarget = new THREE.Vector3(centerX, 0, centerZ);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, maxSpan * 20);
    const camHeight = maxSpan * 1.3 + 8;
    const camDepth  = maxSpan * 0.6 + 12;
    camera.position.set(centerX, camHeight, centerZ + camDepth);
    camera.lookAt(cameraTarget);

    // ── 6. Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 7. OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(cameraTarget);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance      = maxSpan * 0.1;
    controls.maxDistance      = maxSpan * 5;
    controls.maxPolarAngle    = Math.PI / 2.05;
    controls.zoomSpeed        = 1.2;
    controls.rotateSpeed      = 0.6;
    controls.panSpeed         = 0.8;
    controls.update();
    objectsToDispose.push(controls);

    // ── 8. Lighting ───────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x8fa8c8, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xc8e0ff, 1.8);
    sunLight.position.set(centerX + maxSpan * 0.8, maxSpan * 1.5, centerZ + maxSpan * 0.5);
    sunLight.target.position.set(centerX, 0, centerZ);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width  = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near   = 0.5;
    sunLight.shadow.camera.far    = maxSpan * 5;
    const shadowCam = sunLight.shadow.camera;
    const sc = maxSpan * 1.5;
    shadowCam.left = -sc; shadowCam.right = sc;
    shadowCam.top  =  sc; shadowCam.bottom = -sc;
    scene.add(sunLight);
    scene.add(sunLight.target);

    const accentLight = new THREE.PointLight(0x00f2fe, 1.2, maxSpan * 2.5);
    accentLight.position.set(centerX, maxSpan * 0.4, centerZ);
    scene.add(accentLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 0.6, maxSpan * 3);
    fillLight.position.set(centerX - maxSpan * 0.6, maxSpan * 0.3, centerZ - maxSpan * 0.4);
    scene.add(fillLight);

    // ── 9. Ground Grid ────────────────────────────────────────────────────────
    const gridSize = maxSpan * 3 + 20;
    const gridHelper = new THREE.GridHelper(gridSize, 50, 0x1e293b, 0x0f172a);
    gridHelper.position.set(centerX, -0.05, centerZ);
    gridHelper.receiveShadow = false;
    scene.add(gridHelper);
    if (gridHelper.geometry) geometryRegistry.push(gridHelper.geometry);
    if (gridHelper.material) {
      const mats = Array.isArray(gridHelper.material) ? gridHelper.material : [gridHelper.material];
      mats.forEach(m => materialRegistry.push(m));
    }

    // ── 10. Ground Plane (shadow receiver) ────────────────────────────────────
    const groundGeo = regGeo(new THREE.PlaneGeometry(gridSize, gridSize));
    const groundMat = regMat(new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6
    }));
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(centerX, -0.1, centerZ);
    ground.receiveShadow = true;
    scene.add(ground);

    // ── 11. OBJLoader — Uploaded 3D Model ────────────────────────────────────
    if (uploadedObjContent) {
      try {
        const loader  = new OBJLoader();
        const objRoot = loader.parse(uploadedObjContent);

        const bbox = new THREE.Box3().setFromObject(objRoot);
        const objCenter = new THREE.Vector3();
        bbox.getCenter(objCenter);
        const objSize = new THREE.Vector3();
        bbox.getSize(objSize);
        const objMaxSpan = Math.max(objSize.x, objSize.y, objSize.z) || 1;

        const targetSize = maxSpan * 0.8;
        const scaleFactor = targetSize / objMaxSpan;

        objRoot.scale.setScalar(scaleFactor);
        objRoot.position.set(
          centerX  - objCenter.x * scaleFactor,
          -objCenter.y * scaleFactor,
          centerZ - objCenter.z * scaleFactor
        );

        objRoot.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) geometryRegistry.push(child.geometry);
            const mat = regMat(new THREE.MeshStandardMaterial({
              color:            0x1e3a5f,
              emissive:         new THREE.Color(0x00f2fe),
              emissiveIntensity: 0.12,
              roughness:        0.45,
              metalness:        0.65,
              transparent:      true,
              opacity:          0.88
            }));
            child.material    = mat;
            child.castShadow  = true;
            child.receiveShadow = true;
          }
        });

        scene.add(objRoot);
      } catch (err) {
        console.warn('[OBJLoader] Failed to parse OBJ content:', err.message);
      }
    }

    // ── 12. Road Edge Graph Rendering & Hover Raycasting Setup ─────────────────
    const startNodeId = selectedRouteNodes?.[0] ?? null;
    const endNodeId   = selectedRouteNodes?.length > 1 ? selectedRouteNodes[selectedRouteNodes.length - 1] : null;

    const edgeGroup      = new THREE.Group();
    const renderedEdges  = new Set();
    const raycastMeshes  = [];

    // Helper map to quickly find edge objects by node pair
    const edgeDataLookup = new Map();
    Object.keys(adjacencyList).forEach(fromId => {
      (adjacencyList[fromId] || []).forEach(e => {
        const toId = e.to || e.toNode;
        if (toId) {
          const k1 = `${fromId}--${toId}`;
          const k2 = `${toId}--${fromId}`;
          edgeDataLookup.set(k1, e);
          edgeDataLookup.set(k2, e);
        }
      });
    });

    const drawEdge = (fromId, toId, isPath) => {
      const p1 = nodes[fromId];
      const p2 = nodes[toId];
      if (!p1 || !p2) return;

      const key = [fromId, toId].sort().join('--');
      if (renderedEdges.has(key) && !isPath) return;
      if (!isPath) renderedEdges.add(key);

      const v1 = new THREE.Vector3(p1.x, 0.18, p1.z);
      const v2 = new THREE.Vector3(p2.x, 0.18, p2.z);

      const edgeInfo = edgeDataLookup.get(`${fromId}--${toId}`);
      const rawDist = v1.distanceTo(v2);
      const distKm = edgeInfo?.distance !== undefined ? edgeInfo.distance : parseFloat((rawDist > 0 ? rawDist : 5.0).toFixed(2));

      // Create Raycastable Road Tube
      const curve = new THREE.LineCurve3(v1, v2);
      const tubeRadius = isPath ? baseNodeRadius * 0.38 : baseNodeRadius * 0.25;
      const tubeGeo = regGeo(new THREE.TubeGeometry(curve, 2, tubeRadius, 8, false));
      
      const tubeMat = regMat(new THREE.MeshStandardMaterial({
        color: isPath ? 0x00f2fe : 0x38bdf8,
        emissive: new THREE.Color(isPath ? 0x00f2fe : 0x1e3a5f),
        emissiveIntensity: isPath ? 0.85 : 0.25,
        roughness: 0.3,
        metalness: 0.4,
        transparent: true,
        opacity: isPath ? 0.95 : 0.7
      }));

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.userData = {
        isEdge: true,
        key,
        fromId,
        toId,
        distance: distKm,
        speedLimit: edgeInfo?.speedLimit || 60,
        congestion: edgeInfo?.congestion !== undefined ? edgeInfo.congestion : 0.2,
        safetyRisk: edgeInfo?.safetyRisk !== undefined ? edgeInfo.safetyRisk : 0.1,
        roadType: edgeInfo?.roadType || 'Arterial',
        isPath,
        baseEmissive: isPath ? 0x00f2fe : 0x1e3a5f,
        baseColor: isPath ? 0x00f2fe : 0x38bdf8
      };

      edgeGroup.add(tubeMesh);
      raycastMeshes.push(tubeMesh);
    };

    // Draw all adjacency edges
    Object.keys(adjacencyList).forEach(fromId => {
      (adjacencyList[fromId] || []).forEach(edge => {
        const toId = edge.to || edge.toNode;
        if (toId) drawEdge(fromId, toId, false);
      });
    });

    // Overlay active route path
    if (selectedRouteNodes && selectedRouteNodes.length > 1) {
      for (let i = 0; i < selectedRouteNodes.length - 1; i++) {
        drawEdge(selectedRouteNodes[i], selectedRouteNodes[i + 1], true);
      }
    }
    scene.add(edgeGroup);

    // ── 13. Junction Node Spheres ──────────────────────────────────────────────
    const nodeGroup = new THREE.Group();

    nodeKeys.forEach(id => {
      const n       = nodes[id];
      const isStart = id === startNodeId;
      const isEnd   = id === endNodeId;
      const isPath  = selectedRouteNodes?.includes(id);

      const mainColor = isStart ? 0x10b981
                      : isEnd   ? 0xf43f5e
                      : isPath  ? 0x00f2fe
                                : 0x38bdf8;

      const nodeRadius = (isStart || isEnd) ? baseNodeRadius * 1.4
                       : isPath             ? baseNodeRadius * 1.15
                                            : baseNodeRadius;

      const sphereGeo = regGeo(new THREE.SphereGeometry(nodeRadius, 20, 20));
      const sphereMat = regMat(new THREE.MeshStandardMaterial({
        color:            mainColor,
        emissive:         new THREE.Color(mainColor),
        emissiveIntensity: (isStart || isEnd) ? 1.0 : isPath ? 0.75 : 0.45,
        roughness:        0.15,
        metalness:        0.3
      }));

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(n.x, nodeRadius * 0.5 + 0.1, n.z);
      sphere.castShadow    = true;
      sphere.receiveShadow = false;
      sphere.userData      = { id, label: n.label || `Junction_${id}`, isNode: true };
      nodeGroup.add(sphere);
      raycastMeshes.push(sphere);

      // Halo ring
      const ringOuter = nodeRadius * 2.0;
      const ringInner = nodeRadius * 1.55;
      const ringGeo = regGeo(new THREE.RingGeometry(ringInner, ringOuter, 36));
      const ringMat = regMat(new THREE.MeshBasicMaterial({
        color:       mainColor,
        side:        THREE.DoubleSide,
        transparent: true,
        opacity:     (isStart || isEnd) ? 0.6 : isPath ? 0.4 : 0.22
      }));
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(n.x, 0.05, n.z);
      ring.userData = { isHaloRing: true };
      nodeGroup.add(ring);
    });

    scene.add(nodeGroup);

    // ── 14. Interactive Raycasting for Nodes and Roads ─────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    let hoveredMeshRef = null;

    const handleMouseMove = (e) => {
      if (!container) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(raycastMeshes);

      if (hits.length > 0) {
        const hitObj = hits[0].object;
        const hitData = hitObj.userData;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (hitData.isNode) {
          // Reset edge highlight if switching from edge to node
          if (hoveredMeshRef && hoveredMeshRef.userData.isEdge) {
            hoveredMeshRef.material.emissive.setHex(hoveredMeshRef.userData.baseEmissive);
            hoveredMeshRef = null;
          }
          setHoveredNode(hitData);
          setHoveredEdge(null);
          setTooltipPos({ x: mouseX, y: mouseY });
          container.style.cursor = 'pointer';
        } else if (hitData.isEdge) {
          setHoveredNode(null);
          setHoveredEdge(hitData);
          setTooltipPos({ x: mouseX, y: mouseY });
          container.style.cursor = 'pointer';

          // Highlight road mesh on hover
          if (hoveredMeshRef && hoveredMeshRef !== hitObj) {
            if (hoveredMeshRef.userData.isEdge) {
              hoveredMeshRef.material.emissive.setHex(hoveredMeshRef.userData.baseEmissive);
            }
          }
          hoveredMeshRef = hitObj;
          hitObj.material.emissive.setHex(0xffff00); // Bright glowing yellow highlight on hover
        }
      } else {
        if (hoveredMeshRef && hoveredMeshRef.userData.isEdge) {
          hoveredMeshRef.material.emissive.setHex(hoveredMeshRef.userData.baseEmissive);
          hoveredMeshRef = null;
        }
        setHoveredNode(null);
        setHoveredEdge(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(raycastMeshes);
      if (hits.length > 0 && hits[0].object.userData.isNode && onNodeClick) {
        onNodeClick(hits[0].object.userData.id);
      }
    };

    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('click', handleClick);

    // ── 15. FPS-Capped Animation Loop ─────────────────────────────────────────
    const TARGET_FPS  = 60;
    const FRAME_BUDGET = 1000 / TARGET_FPS;
    let lastFrameTime  = 0;
    let animId;

    const animate = (timestamp) => {
      animId = requestAnimationFrame(animate);
      const delta = timestamp - lastFrameTime;
      if (delta < FRAME_BUDGET) return;
      lastFrameTime = timestamp - (delta % FRAME_BUDGET);

      nodeGroup.children.forEach(child => {
        if (child.userData?.isHaloRing) {
          child.rotation.z += 0.008;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // ── 16. ResizeObserver ────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w === 0 || h === 0) continue;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // ── 17. Clean Disposal ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();

      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('click', handleClick);

      geometryRegistry.forEach(g  => { try { g.dispose();  } catch(_) {} });
      materialRegistry.forEach(m  => { try { m.dispose();  } catch(_) {} });
      objectsToDispose.forEach(o  => { try { o.dispose?.(); } catch(_) {} });

      renderer.dispose();

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };

  }, [cityGraph, uploadedObjContent, selectedRouteNodes, activeProfileKey]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Three.js canvas mount point */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* OrbitControls hint */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '14px',
        background: 'rgba(7,11,20,0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0,242,254,0.2)',
        borderRadius: '8px',
        padding: '5px 10px',
        color: 'var(--text-dim)',
        fontSize: '0.65rem',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        lineHeight: 1.5
      }}>
        <span>🖱️ Left drag: Rotate</span>
        <span>🖱️ Right drag: Pan</span>
        <span>🖱️ Scroll: Zoom</span>
        <span>🛣️ Hover road: View distance (km)</span>
      </div>

      {/* Node Hover Tooltip */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x + 15,
          top:  tooltipPos.y - 38,
          background: 'rgba(5,11,20,0.94)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#fff',
          fontSize: '0.78rem',
          pointerEvents: 'none',
          boxShadow: '0 0 18px rgba(0,242,254,0.4)',
          zIndex: 100,
          maxWidth: '220px'
        }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{hoveredNode.id}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '6px', wordBreak: 'break-all' }}>
            {hoveredNode.label}
          </span>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)', marginTop: '3px' }}>
            Click to set as destination
          </div>
        </div>
      )}

      {/* Edge / Road Distance Hover Tooltip */}
      {hoveredEdge && (
        <div style={{
          position: 'absolute',
          left: tooltipPos.x + 15,
          top:  tooltipPos.y - 45,
          background: 'rgba(5,11,22,0.96)',
          border: '1.5px solid #00f2fe',
          borderRadius: '8px',
          padding: '8px 14px',
          color: '#fff',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          boxShadow: '0 0 22px rgba(0,242,254,0.5)',
          zIndex: 100,
          maxWidth: '240px'
        }}>
          <div style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.82rem' }}>
            🛣️ Road Segment: {hoveredEdge.fromId} ↔ {hoveredEdge.toId}
          </div>
          <div style={{ fontWeight: 800, color: '#fff', marginTop: '3px', fontSize: '0.88rem' }}>
            Distance: <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{(Number(hoveredEdge.distance) || 0).toFixed(1)} km</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
            Speed Limit: {hoveredEdge.speedLimit} km/h • Congestion: {Math.round((hoveredEdge.congestion||0)*100)}%
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(7,10,18,0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        padding: '8px 18px',
        borderRadius: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {[
          { color: '#10b981', label: 'Start' },
          { color: '#f43f5e', label: 'End' },
          { color: '#00f2fe', label: 'Active Path' },
          { color: '#38bdf8', label: 'Junction' }
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}`
            }} />
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
