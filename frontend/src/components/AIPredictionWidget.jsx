import React from 'react';
import { Cpu, Flame, Leaf, BatteryCharging, Award, BrainCircuit, Zap, Shield } from 'lucide-react';

export default function AIPredictionWidget({ activeProfile }) {
  if (!activeProfile) return null;

  const em = activeProfile.aiEmissions || {};
  const ecoScore = em.eco_score || 85;
  const ecoColor = ecoScore > 75 ? '#10b981' : (ecoScore > 50 ? '#f59e0b' : '#f43f5e');
  const delayMin = activeProfile.delayMin || 0;
  const distKm = activeProfile.distanceKm || 0;

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background: 'linear-gradient(135deg, rgba(8, 12, 24, 0.95), rgba(16, 20, 40, 0.95))',
      border: '1.5px solid rgba(139, 92, 246, 0.35)',
      borderRadius: '16px',
      boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.18)', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '10px', borderRadius: '12px' }}>
            <BrainCircuit color="#a855f7" size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
              Flask AI Environmental Prediction Engine
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Scikit-Learn predictive model — real-time fuel, carbon, and energy analytics for the optimal route
            </p>
          </div>
        </div>
        <span className="badge badge-purple" style={{ padding: '7px 14px', fontSize: '0.75rem', fontWeight: 700 }}>
          <Award size={13} /> Scikit-Learn Model
        </span>
      </div>

      {/* Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>

        {/* Fuel Consumption */}
        <div style={{ background: 'rgba(10, 16, 32, 0.85)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={15} color="#f59e0b" /> Fuel Consumption
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fcd34d', fontFamily: 'var(--font-mono)' }}>
            {em.fuel_consumption_liters || 0.0}
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>L</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Estimated fuel burn for {distKm} km route</div>
        </div>

        {/* CO2 Emissions */}
        <div style={{ background: 'rgba(10, 16, 32, 0.85)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Leaf size={15} color="#10b981" /> CO₂ Carbon Output
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>
            {em.co2_emissions_grams || 0.0}
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>g</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Tailpipe CO₂ emissions</div>
        </div>

        {/* EV Energy */}
        <div style={{ background: 'rgba(10, 16, 32, 0.85)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.25)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BatteryCharging size={15} color="#00f2fe" /> EV Battery Draw
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
            {em.ev_energy_kwh || 0.0}
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>EV energy equivalent draw</div>
        </div>

        {/* Eco Score */}
        <div style={{ background: 'rgba(10, 16, 32, 0.85)', padding: '18px', borderRadius: '12px', border: `1px solid ${ecoColor}44`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={15} color={ecoColor} /> AI Eco-Score Rating
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: ecoColor, fontFamily: 'var(--font-mono)' }}>
            {ecoScore}
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>/100</span>
          </div>
          {/* Eco score bar */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${ecoScore}%`, background: ecoColor, height: '100%', borderRadius: '4px', boxShadow: `0 0 8px ${ecoColor}`, transition: 'width 0.7s ease' }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Environmental route efficiency</div>
        </div>

      </div>

      {/* AI Insight Banner */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '14px 18px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <Zap size={20} color="#a855f7" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.83rem' }}>
          <span style={{ fontWeight: 800, color: '#fff' }}>AI Optimal Route Insight: </span>
          <span style={{ color: 'var(--text-muted)' }}>
            The computed A* optimal path of <strong style={{ color: '#fff' }}>{distKm} km</strong> saves{' '}
            <strong style={{ color: '#10b981' }}>{delayMin > 0 ? `+${delayMin} min` : '0 min'}</strong> over congested alternatives.
            Eco-Score of <strong style={{ color: ecoColor }}>{ecoScore}/100</strong> — fuel burn at{' '}
            <strong style={{ color: '#fcd34d' }}>{em.fuel_consumption_liters || 0} L</strong> and carbon output{' '}
            <strong style={{ color: '#6ee7b7' }}>{em.co2_emissions_grams || 0} g CO₂</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
