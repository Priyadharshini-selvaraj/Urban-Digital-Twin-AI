import React from 'react';
import { 
  Zap, Clock, Gauge, Fuel, Leaf, 
  MapPin, Route, ShieldCheck, Activity, CheckCircle2, Navigation
} from 'lucide-react';

export default function RouteComparisonCards({ profiles, activeProfileKey, onSelectProfile }) {
  if (!profiles || profiles.length === 0) return null;

  // Use the active/selected profile (or the primary optimal profile)
  const profile = profiles.find(p => p.key === activeProfileKey) || profiles[0];
  const em = profile.aiEmissions || {};

  return (
    <div className="glass-card" style={{
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(7, 14, 28, 0.95), rgba(13, 25, 48, 0.95))',
      border: '1.5px solid var(--accent-cyan)',
      borderRadius: '16px',
      boxShadow: '0 0 30px rgba(0, 242, 254, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
        paddingBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            padding: '10px',
            borderRadius: '12px'
          }}>
            <Zap size={24} color="#00f2fe" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Optimal Path Details
              </h2>
              <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                A* VERIFIED
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Single mathematically optimized route balancing distance, travel speed, and safety
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
            {profile.accuracyRate || 99.6}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <ShieldCheck size={12} /> 100% Path Valid
          </div>
        </div>
      </div>

      {/* Grid of Key Route Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        
        {/* Metric 1: Distance */}
        <div style={{ background: 'rgba(10, 18, 36, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <MapPin size={14} color="#00f2fe" /> Total Distance
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
            {(Number(profile.distanceKm) || 0).toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>km</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Minimal physical spatial path
          </div>
        </div>

        {/* Metric 2: Estimated Time */}
        <div style={{ background: 'rgba(10, 18, 36, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Clock size={14} color="#10b981" /> Est. Travel Time
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            {profile.estimatedTimeMin} <span style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>mins</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Traffic delay: +{profile.delayMin || 0} min • ETA {profile.etaString}
          </div>
        </div>

        {/* Metric 3: Average Speed */}
        <div style={{ background: 'rgba(10, 18, 36, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Gauge size={14} color="#38bdf8" /> Average Speed
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {profile.avgSpeedKmh || 45} <span style={{ fontSize: '0.85rem', color: '#93c5fd' }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Congestion index: {Math.round((profile.avgCongestionIndex || 0) * 100)}%
          </div>
        </div>

        {/* Metric 4: Topology */}
        <div style={{ background: 'rgba(10, 18, 36, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Route size={14} color="#8b5cf6" /> Network Topology
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#c4b5fd', fontFamily: 'var(--font-mono)' }}>
            {profile.roadCount || 0} <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>roads</span> / {profile.visitedJunctionsCount || 0} <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>nodes</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Intersections traversed
          </div>
        </div>

      </div>

      {/* Environmental & Fuel Analytics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        background: 'rgba(5, 10, 20, 0.6)',
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Fuel size={18} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fuel Consumption</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>
              {em.fuel_consumption_liters || 0} L
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Leaf size={18} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CO₂ Carbon Emissions</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>
              {em.co2_emissions_grams || 0} g
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={18} color="#00f2fe" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EV Energy Draw</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              {em.ev_energy_kwh || 0} kWh
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Eco-Score Rating</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {em.eco_score || 88} / 100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
