import React, { useState } from 'react';
import { Upload, Box, CheckCircle, AlertTriangle, Sparkles, Loader2, Network, Route, MapPin, Gauge } from 'lucide-react';
import { parseObjFileContent, extractCityGraphFrom3DModel } from '../utils/cityGraphIngestion';
import { uploadModelApi } from '../utils/api';

export const PRESET_MODELS = {
  default: {
    id: 'default',
    name: 'Smart Metropolis Central (12 Intersections)',
    vertices: [
      { x: 0,  z: 0,  label: 'J1 - Central Station' },
      { x: 12, z: 0,  label: 'J2 - North Boulevard' },
      { x: 24, z: 0,  label: 'J3 - Tech District' },
      { x: 36, z: 0,  label: 'J4 - Harbor Gate' },
      { x: 0,  z: 15, label: 'J5 - West Market' },
      { x: 12, z: 15, label: 'J6 - City Square' },
      { x: 24, z: 15, label: 'J7 - Industrial Zone' },
      { x: 36, z: 15, label: 'J8 - East Port' },
      { x: 0,  z: 30, label: 'J9 - South Park' },
      { x: 12, z: 30, label: 'J10 - University Ave' },
      { x: 24, z: 30, label: 'J11 - Financial Hub' },
      { x: 36, z: 30, label: 'J12 - Airport Terminal' }
    ],
    lines: [
      { fromIndex: 0,  toIndex: 1,  speedLimit: 60, congestion: 0.65, safetyRisk: 0.25 },
      { fromIndex: 1,  toIndex: 2,  speedLimit: 75, congestion: 0.30, safetyRisk: 0.10 },
      { fromIndex: 2,  toIndex: 3,  speedLimit: 80, congestion: 0.20, safetyRisk: 0.08 },
      { fromIndex: 4,  toIndex: 5,  speedLimit: 50, congestion: 0.70, safetyRisk: 0.30 },
      { fromIndex: 5,  toIndex: 6,  speedLimit: 65, congestion: 0.45, safetyRisk: 0.15 },
      { fromIndex: 6,  toIndex: 7,  speedLimit: 70, congestion: 0.35, safetyRisk: 0.12 },
      { fromIndex: 8,  toIndex: 9,  speedLimit: 55, congestion: 0.25, safetyRisk: 0.10 },
      { fromIndex: 9,  toIndex: 10, speedLimit: 85, congestion: 0.10, safetyRisk: 0.05 },
      { fromIndex: 10, toIndex: 11, speedLimit: 90, congestion: 0.08, safetyRisk: 0.04 },
      { fromIndex: 0,  toIndex: 4,  speedLimit: 45, congestion: 0.80, safetyRisk: 0.35 },
      { fromIndex: 1,  toIndex: 5,  speedLimit: 60, congestion: 0.50, safetyRisk: 0.20 },
      { fromIndex: 2,  toIndex: 6,  speedLimit: 70, congestion: 0.40, safetyRisk: 0.15 },
      { fromIndex: 3,  toIndex: 7,  speedLimit: 55, congestion: 0.60, safetyRisk: 0.25 },
      { fromIndex: 4,  toIndex: 8,  speedLimit: 50, congestion: 0.30, safetyRisk: 0.12 },
      { fromIndex: 5,  toIndex: 9,  speedLimit: 65, congestion: 0.20, safetyRisk: 0.08 },
      { fromIndex: 6,  toIndex: 10, speedLimit: 75, congestion: 0.15, safetyRisk: 0.06 },
      { fromIndex: 7,  toIndex: 11, speedLimit: 80, congestion: 0.25, safetyRisk: 0.10 },
      { fromIndex: 1,  toIndex: 6,  speedLimit: 85, congestion: 0.35, safetyRisk: 0.12 }
    ]
  }
};

// Processing steps for progress indicator
const STEPS = [
  { key: 'read',    label: 'Reading file...' },
  { key: 'parse',   label: 'Parsing OBJ structure...' },
  { key: 'extract', label: 'Extracting junctions & roads...' },
  { key: 'scale',   label: 'Calculating km distances...' },
  { key: 'done',    label: 'Graph built successfully!' }
];

export default function ModelIngestionModule({ onIngestSuccess, currentModelName }) {
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState(null);   // current STEPS key
  const [fileName, setFileName]     = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [graphMeta, setGraphMeta]   = useState(null);   // graph stats after successful upload

  // Yield back to browser event loop between heavy steps
  const tick = () => new Promise(resolve => setTimeout(resolve, 0));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset state
    setFileName(file.name);
    setLoading(true);
    setStep('read');
    setErrorMessage(null);
    setGraphMeta(null);

    // ── Step 1: Read file text ────────────────────────────────────────────────
    let rawText = '';
    try {
      rawText = await file.text();
    } catch (readErr) {
      setErrorMessage(`Cannot read file "${file.name}": ${readErr.message}`);
      setLoading(false);
      setStep(null);
      return;
    }
    await tick();

    // ── Determine file type ───────────────────────────────────────────────────
    const isObj  = file.name.toLowerCase().endsWith('.obj');
    const isJson = file.name.toLowerCase().endsWith('.json') || file.name.toLowerCase().endsWith('.geojson');

    // ── For OBJ files: always try local parser FIRST (faster, no network) ─────
    if (isObj) {
      try {
        setStep('parse');
        await tick();

        setStep('extract');
        await tick();

        setStep('scale');
        // Actual parsing — now O(n) + O(k²) where k ≤ 80, completes in <300ms
        const graph = parseObjFileContent(rawText, file.name);
        await tick();

        const meta = graph.meta || {};
        setGraphMeta({
          nodes: meta.totalNodes || Object.keys(graph.nodes).length,
          edges: meta.totalRoadSegments || 0,
          avgKm:  meta.avgDistanceKm || 0,
          minKm:  meta.minDistanceKm || 0,
          maxKm:  meta.maxDistanceKm || 0,
          fileName: file.name
        });
        setStep('done');
        setErrorMessage(null);

        if (onIngestSuccess) onIngestSuccess(graph, file.name, rawText);
        setLoading(false);
        return; // Success — skip backend call entirely for OBJ

      } catch (localErr) {
        console.warn('[ModelIngestion] Local OBJ parse failed:', localErr.message);
        setErrorMessage(`Failed to parse "${file.name}": ${localErr.message}`);
        setLoading(false);
        setStep(null);
        return;
      }
    }

    // ── For JSON / SKP: try backend first, then local JSON fallback ──────────
    setStep('parse');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadModelApi(formData);
      if (data.status === 'ERROR' || !data.graph) {
        throw new Error(data.message || `Backend returned error for "${file.name}".`);
      }
      setStep('scale');
      await tick();

      const graph = data.graph;
      const meta = graph.meta || {};
      setGraphMeta({
        nodes: meta.totalNodes || Object.keys(graph.nodes || {}).length,
        edges: meta.totalRoadSegments || 0,
        avgKm:  meta.avgDistanceKm || 0,
        minKm:  meta.minDistanceKm || 0,
        maxKm:  meta.maxDistanceKm || 0,
        fileName: file.name
      });
      setStep('done');
      if (onIngestSuccess) onIngestSuccess(graph, file.name, rawText);

    } catch (backendErr) {
      console.warn('[ModelIngestion] Backend failed, trying local JSON:', backendErr.message);
      try {
        if (!isJson) throw backendErr; // Not parseable locally
        setStep('extract');
        const raw = JSON.parse(rawText);
        const graph = extractCityGraphFrom3DModel(raw.vertices || raw, raw.lines || []);
        const meta = graph.meta || {};
        setGraphMeta({
          nodes: meta.totalNodes || Object.keys(graph.nodes).length,
          edges: meta.totalRoadSegments || 0,
          avgKm:  meta.avgDistanceKm || 0,
          minKm:  meta.minDistanceKm || 0,
          maxKm:  meta.maxDistanceKm || 0,
          fileName: file.name
        });
        setStep('done');
        if (onIngestSuccess) onIngestSuccess(graph, file.name, rawText);
      } catch (localErr) {
        setErrorMessage(localErr.message || backendErr.message);
        setStep(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStepLabel = STEPS.find(s => s.key === step)?.label || '';
  const stepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box color="var(--accent-cyan)" size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-heading)' }}>
            3D City Model Ingestion (.OBJ)
          </span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
          <Sparkles size={10} /> Auto-Cluster Nodes
        </span>
      </div>

      {/* Upload Button Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label
          className="glow-btn"
          style={{
            fontSize: '0.78rem', padding: '8px 14px',
            background: 'rgba(0,242,254,0.15)', color: 'var(--accent-cyan)',
            boxShadow: 'none', border: '1px solid rgba(0,242,254,0.3)',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {loading ? currentStepLabel : 'Upload .OBJ Model File'}
          <input
            type="file"
            accept=".obj"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </label>
        <span style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px'
        }}>
          {fileName || currentModelName || 'Upload .OBJ file'}
        </span>
      </div>

      {/* Processing Progress Steps */}
      {loading && step && (
        <div style={{
          background: 'rgba(0,242,254,0.06)',
          border: '1px solid rgba(0,242,254,0.2)',
          borderRadius: '10px',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              Processing {fileName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Step {stepIndex + 1} / {STEPS.length}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{
              height: '100%',
              width: `${Math.round(((stepIndex + 1) / STEPS.length) * 100)}%`,
              background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          {/* Step labels */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STEPS.map((s, i) => (
              <span key={s.key} style={{
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: i <= stepIndex ? 700 : 400,
                background: i < stepIndex  ? 'rgba(16,185,129,0.2)'
                          : i === stepIndex ? 'rgba(0,242,254,0.25)'
                          : 'rgba(255,255,255,0.05)',
                color: i < stepIndex  ? '#10b981'
                     : i === stepIndex ? '#00f2fe'
                     : 'var(--text-dim)',
                border: i === stepIndex ? '1px solid rgba(0,242,254,0.4)' : '1px solid transparent'
              }}>
                {i < stepIndex ? '✓ ' : i === stepIndex ? '⟳ ' : ''}{s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div style={{
          fontSize: '0.75rem', color: '#f43f5e',
          background: 'rgba(244,63,94,0.12)',
          padding: '10px 12px', borderRadius: '8px',
          border: '1px solid rgba(244,63,94,0.3)',
          display: 'flex', alignItems: 'flex-start', gap: '8px'
        }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>Upload Failed</div>
            <div style={{ lineHeight: 1.4 }}>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Graph Summary Dashboard (shown after successful upload) */}
      {graphMeta && step === 'done' && !errorMessage && (
        <div style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Success header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#10b981" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>
              Graph Built — {graphMeta.fileName}
            </span>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            <StatTile icon={<Network size={12} color="#00f2fe" />} label="Junctions" value={graphMeta.nodes} unit="nodes" color="#00f2fe" />
            <StatTile icon={<Route size={12} color="#8b5cf6" />} label="Road Segments" value={graphMeta.edges} unit="roads" color="#8b5cf6" />
            <StatTile icon={<MapPin size={12} color="#f59e0b" />} label="Avg Distance" value={graphMeta.avgKm} unit="km" color="#f59e0b" />
            <StatTile icon={<Gauge size={12} color="#10b981" />} label="Max Distance" value={graphMeta.maxKm} unit="km" color="#10b981" />
          </div>

          {/* Distance range bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                Min: <strong style={{ color: '#fff' }}>{graphMeta.minKm} km</strong>
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                Max: <strong style={{ color: '#fff' }}>{graphMeta.maxKm} km</strong>
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '5px', overflow: 'hidden', position: 'relative' }}>
              {/* Show avg position on distance scale */}
              <div style={{
                position: 'absolute',
                left: `${graphMeta.maxKm > 0 ? Math.round((graphMeta.avgKm / graphMeta.maxKm) * 100) : 50}%`,
                top: '-3px', width: '2px', height: '11px',
                background: '#f59e0b', borderRadius: '2px'
              }} />
              <div style={{
                height: '100%',
                width: `${graphMeta.maxKm > 0 ? Math.round((graphMeta.avgKm / graphMeta.maxKm) * 100) : 50}%`,
                background: 'linear-gradient(90deg, #10b981, #00f2fe)',
                borderRadius: '4px'
              }} />
            </div>
            <div style={{ fontSize: '0.62rem', color: '#f59e0b', textAlign: 'center', marginTop: '3px' }}>
              ▲ Avg {graphMeta.avgKm} km per road segment
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper stat tile component
function StatTile({ icon, label, value, unit, color }) {
  return (
    <div style={{
      background: 'rgba(10,16,30,0.7)',
      borderRadius: '8px',
      border: `1px solid ${color}33`,
      padding: '8px 10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
        {icon}
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{label}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color, fontSize: '1rem', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{unit}</div>
    </div>
  );
}
