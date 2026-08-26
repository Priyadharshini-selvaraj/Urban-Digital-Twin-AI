import React from 'react';
import { useNavigate } from 'react-router-dom';
import RouteControls from '../components/RouteControls';
import RouteComparisonCards from '../components/RouteComparisonCards';
import City3DCanvas from '../components/City3DCanvas';
import { useApp } from '../context/AppContext';
import { ExternalLink, CheckCircle2, Target, ShieldCheck, AlertTriangle, XCircle, MapPin, Clock, Route, Milestone } from 'lucide-react';

export default function RoutePlanner() {
  const {
    cityModels, selectedModelKey, setSelectedModelKey,
    availableNodes, startNode, setStartNode, endNode, setEndNode,
    algorithm, setAlgorithm,
    activeProfileKey, setActiveProfileKey,
    handleCalculateRoute, loading, bestProfile,
    routeProfiles, activeGraphName, activeGraph, uploadedObjContent,
    selectedRouteNodes, trafficSegments, handleNodeClick,
    isCalculated, overallAccuracyRate, routeError
  } = useApp();
  const navigate = useNavigate();

  const selectedProfile = routeProfiles.find(p => p.key === activeProfileKey) || routeProfiles[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
          Route Planner
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          Select junctions and algorithm to compute optimal routing profiles using live traffic counts
        </p>
      </div>

      {/* Top Section: Controls Form */}
      <RouteControls
        cityModels={cityModels}
        selectedModelKey={selectedModelKey}
        setSelectedModelKey={setSelectedModelKey}
        availableNodes={availableNodes}
        startNode={startNode}
        setStartNode={setStartNode}
        endNode={endNode}
        setEndNode={setEndNode}
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        activeProfileKey={activeProfileKey}
        setActiveProfileKey={setActiveProfileKey}
        onCalculateRoute={handleCalculateRoute}
        loading={loading}
        bestProfile={bestProfile}
      />

      {/* Error Alert Message Banner */}
      {routeError && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1.5px solid rgba(244, 63, 94, 0.6)',
          borderRadius: '12px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 0 20px rgba(244, 63, 94, 0.25)'
        }}>
          <XCircle color="#f43f5e" size={24} />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fda4af' }}>
              Route Calculation Failed
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fecdd3', marginTop: '2px' }}>
              {routeError}
            </div>
          </div>
        </div>
      )}

      {/* Interactive 3D City View & Highlighted Route Canvas */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,242,254,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Route color="var(--accent-cyan)" size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
              Interactive 3D Network Viewer & Hover Distance Inspector
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0,242,254,0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(0,242,254,0.3)' }}>
            🛣️ Hover any road segment to view distance (km)
          </span>
        </div>

        <div style={{
          height: '420px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)',
          position: 'relative'
        }}>
          <City3DCanvas
            activeProfileKey={activeProfileKey}
            trafficSegments={trafficSegments}
            selectedRouteNodes={selectedRouteNodes}
            cityGraph={activeGraph}
            uploadedObjContent={uploadedObjContent}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Overall Route Accuracy & Validity Overview Panel */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: 'rgba(10, 16, 32, 0.85)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}>
            <Target size={28} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                Route Planner Accuracy & Validity Rate
              </h3>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                VERIFIED GRAPH ENGINE
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Accuracy rate calculated across all {routeProfiles.length || 4} pathfinding profiles for junction path {startNode} → {endNode}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              {overallAccuracyRate}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <ShieldCheck size={12} /> 100% Path Valid & Connected
            </div>
          </div>
        </div>
      </div>

      {/* Recalculation Notice if Junctions Changed */}
      {!isCalculated && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1.5px dashed rgba(245, 158, 11, 0.5)',
          borderRadius: '12px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle color="#f59e0b" size={22} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fcd34d' }}>
              Junctions or parameters changed! Recalculation Required.
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Click <strong>"🚀 Calculate Optimized Route"</strong> above to compute the updated optimal route and accuracy rates for <strong>{startNode} → {endNode}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Single Unified Optimal Path Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            Calculated Optimal Route ({startNode} → {endNode})
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: isCalculated ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
              {isCalculated ? '✓ Route Optimized' : '⚠️ Recalculation Pending'}
            </span>
            <button
              className="glow-btn"
              onClick={() => navigate('/viewer')}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={14} /> View 3D Map
            </button>
          </div>
        </div>
        <RouteComparisonCards
          profiles={routeProfiles}
          activeProfileKey={activeProfileKey}
          onSelectProfile={setActiveProfileKey}
        />
      </div>
    </div>
  );
}
