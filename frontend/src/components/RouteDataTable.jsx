import React from 'react';
import { Table, Route, ShieldCheck, MapPin, Gauge, Activity } from 'lucide-react';

export default function RouteDataTable({ profile }) {
  if (!profile) return null;

  const edges = profile.edges || [];
  const pathNodes = profile.pathNodeIds || [];

  return (
    <div className="glass-panel" style={{ padding: '22px', borderRadius: '16px' }}>
      {/* Table Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Table color="var(--accent-cyan)" size={20} />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
              Optimal Path Segment Breakdown ({edges.length} Road Segments)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Detailed road-by-road metrics along the computed optimal path ({pathNodes[0] || 'Start'} → {pathNodes[pathNodes.length - 1] || 'End'})
            </p>
          </div>
        </div>

        <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
          <ShieldCheck size={12} /> A* OPTIMAL SEGMENTS
        </span>
      </div>

      {/* Segment Breakdown Table */}
      {edges.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15,23,42,0.85)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Segment #</th>
                <th style={{ padding: '12px 14px' }}>Origin Junction</th>
                <th style={{ padding: '12px 14px' }}>Destination Junction</th>
                <th style={{ padding: '12px 14px' }}>Distance</th>
                <th style={{ padding: '12px 14px' }}>Speed Limit</th>
                <th style={{ padding: '12px 14px' }}>Traffic Congestion</th>
                <th style={{ padding: '12px 14px' }}>Safety Risk</th>
                <th style={{ padding: '12px 14px' }}>Road Classification</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((e, idx) => {
                const congPct = Math.round((e.congestion || 0.2) * 100);
                const riskPct = Math.round((e.safetyRisk || 0.1) * 100);
                const congColor = congPct > 50 ? '#f43f5e' : (congPct > 25 ? '#f59e0b' : '#10b981');

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Segment #{idx + 1}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>
                      📍 {e.from || 'Junction'}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>
                      🏁 {e.to || 'Junction'}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#00f2fe' }}>
                      {(Number(e.distance) || 1.0).toFixed(1)} km
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                      {e.speedLimit || 60} km/h
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: congColor }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: congColor, marginRight: '6px' }} />
                      {congPct}%
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {riskPct}% Risk
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {e.roadType || 'Arterial'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No route segment data available. Please select junctions in Route Planner to calculate optimal path.
        </div>
      )}
    </div>
  );
}
