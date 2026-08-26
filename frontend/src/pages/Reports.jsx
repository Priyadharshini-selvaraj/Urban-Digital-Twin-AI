import React from 'react';
import PdfExportButton from '../components/PdfExportButton';
import { useApp } from '../context/AppContext';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const {
    user, startNode, endNode, vehicleType, algorithm,
    activeProfileKey, routeProfiles, activeGraphName
  } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
          Reports & Documentation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          Generate and download executive PDF reports for the active city simulation
        </p>
      </div>

      {/* Report Generation & Download Card */}
      <div className="glass-panel" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <FileText size={24} color="var(--accent-purple)" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Executive PDF Simulation Report
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Includes route analysis, emissions metrics, vehicle data, and AI insights.
            </p>
          </div>
        </div>

        {/* Report Active Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'City Model', value: activeGraphName },
            { label: 'Start Junction', value: startNode },
            { label: 'End Junction', value: endNode },
            { label: 'Algorithm', value: algorithm.toUpperCase() }
          ].map(({ label, value }) => (
            <div key={label} className="glass-card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Generate / Download PDF Button */}
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <PdfExportButton
            user={user}
            startNode={startNode}
            endNode={endNode}
            vehicleType={vehicleType}
            algorithm={algorithm}
            activeProfileKey={activeProfileKey}
            profiles={routeProfiles}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            ✓ Ready for instant download as PDF document
          </span>
        </div>
      </div>
    </div>
  );
}
