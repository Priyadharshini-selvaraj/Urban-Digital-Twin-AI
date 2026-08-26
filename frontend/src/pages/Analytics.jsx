import React from 'react';
import RouteAnalyticsCharts from '../components/RouteAnalyticsCharts';
import AIPredictionWidget from '../components/AIPredictionWidget';
import RouteDataTable from '../components/RouteDataTable';
import { useApp } from '../context/AppContext';
import { BarChart3, BrainCircuit, Sparkles, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const { activeProfile, activeGraphName, startNode, endNode } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Combined Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Optimal Path Analytics & AI Predictions Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Combined 3D animated visualizer, Flask AI environmental predictions, and road-by-road segment breakdown
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="badge badge-purple" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
            <BrainCircuit size={14} /> Flask AI Model
          </span>
          <span className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
            <Sparkles size={14} /> Path: {startNode} → {endNode}
          </span>
        </div>
      </div>

      {/* SECTION 1: 3D Animation Charts for Optimal Path */}
      <RouteAnalyticsCharts profile={activeProfile} />

      {/* SECTION 2: AI Environmental Predictions */}
      <AIPredictionWidget activeProfile={activeProfile} />

      {/* SECTION 3: Optimal Route Segment-by-Segment Data Table */}
      <RouteDataTable profile={activeProfile} />
    </div>
  );
}
