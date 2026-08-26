import React from 'react';
import ModelIngestionModule from '../components/ModelIngestionModule';
import { useApp } from '../context/AppContext';

export default function UploadModel() {
  const { handleCustomIngestSuccess, activeGraphName } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1000px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
          Upload 3D City Model
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          Upload a Wavefront .OBJ file to extract nodes and build a dynamic navigation graph.
        </p>
      </div>

      {/* Upload Component — contains Upload Model, Upload Progress, Upload Status */}
      <div className="glass-panel" style={{ padding: '24px', width: '100%' }}>
        <ModelIngestionModule
          onIngestSuccess={handleCustomIngestSuccess}
          currentModelName={activeGraphName}
        />
      </div>
    </div>
  );
}
