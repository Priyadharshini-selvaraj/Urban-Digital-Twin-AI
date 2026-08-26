import React from 'react';
import { Wifi } from 'lucide-react';
import City3DCanvas from '../components/City3DCanvas';
import { useApp } from '../context/AppContext';

export default function CityViewer() {
  const {
    activeGraph, activeGraphName, uploadedObjContent, activeProfileKey,
    trafficSegments, selectedRouteNodes, websocketConnected, availableNodes, handleNodeClick
  } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            3D City Viewer
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Real-time Three.js visualization of the active city model
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge badge-cyan">{availableNodes.length} Junctions</span>
        </div>
      </div>

      {/* Active Model Banner */}
      <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rendering model: </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{activeGraphName}</span>
        </div>
      </div>

      {/* 3D Canvas — full height */}
      <div style={{
        height: 'calc(100vh - 280px)',
        minHeight: '520px',
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-glass)'
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

      {/* Legend */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Legend:</span>
        {[
          { color: '#00f2fe', label: 'Junction Node' },
          { color: '#10b981', label: 'Route Path' },
          { color: '#f43f5e', label: 'Heavy Traffic' },
          { color: '#f59e0b', label: 'Moderate Traffic' },
          { color: '#3b82f6', label: 'Smooth Road' }
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
