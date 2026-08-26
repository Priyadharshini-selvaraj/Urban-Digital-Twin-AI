import React, { useState } from 'react';
import { BarChart3, Navigation, Clock, Gauge, Fuel, Leaf, BatteryCharging, ShieldCheck, Activity, Layers, Sparkles } from 'lucide-react';

export default function RouteAnalyticsCharts({ profile }) {
  if (!profile) return null;

  const em = profile.aiEmissions || {};
  const ecoScore = em.eco_score || 88;
  const edges = profile.edges || [];

  const metricsData = [
    { label: 'Distance', val: profile.distanceKm || 0, unit: 'km', max: 20, color: '#00f2fe', icon: Navigation, desc: 'Spatial Length' },
    { label: 'Est Time', val: profile.estimatedTimeMin || 0, unit: 'min', max: 30, color: '#10b981', icon: Clock, desc: 'Travel Time' },
    { label: 'Avg Speed', val: profile.avgSpeedKmh || 50, unit: 'km/h', max: 120, color: '#38bdf8', icon: Gauge, desc: 'Flow Speed' },
    { label: 'Fuel Usage', val: em.fuel_consumption_liters || 0, unit: 'L', max: 5, color: '#f59e0b', icon: Fuel, desc: 'Burn Rate' },
    { label: 'CO₂ Output', val: em.co2_emissions_grams || 0, unit: 'g', max: 3000, color: '#f43f5e', icon: Leaf, desc: 'Tailpipe CO₂' },
    { label: 'EV Energy', val: em.ev_energy_kwh || 0, unit: 'kWh', max: 10, color: '#a855f7', icon: BatteryCharging, desc: 'Battery Draw' },
    { label: 'Eco Score', val: ecoScore, unit: '/100', max: 100, color: '#10b981', icon: ShieldCheck, desc: 'AI Eco Index' }
  ];

  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 1: 3D Animated Isometric Metric Pillar Chart */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(8, 14, 28, 0.95), rgba(12, 22, 44, 0.95))',
        border: '1.5px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 0 35px rgba(0, 242, 254, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.15)', border: '1px solid rgba(0, 242, 254, 0.4)', padding: '8px', borderRadius: '10px' }}>
              <BarChart3 color="#00f2fe" size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                3D Animated Optimal Path Metrics Visualization
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Interactive 3D column perspective visualizer for the computed optimal route
              </p>
            </div>
          </div>
          <span className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
            <Sparkles size={12} /> 3D PERSPECTIVE ENGINE
          </span>
        </div>

        {/* 3D Isometric Bar Grid Viewport */}
        <div style={{
          perspective: '1000px',
          padding: '30px 10px 10px 10px',
          display: 'flex',
          justify: 'space-around',
          alignItems: 'flex-end',
          height: '280px',
          background: 'rgba(5, 10, 20, 0.6)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {metricsData.map((m, idx) => {
            const pct = Math.min(100, Math.max(15, (m.val / m.max) * 100));
            const Icon = m.icon;
            const isHovered = hoveredBar === idx;

            return (
              <div
                key={m.label}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  height: '100%',
                  justifyContent: 'flex-end',
                  width: '75px',
                  cursor: 'pointer',
                  transform: isHovered ? 'scale(1.08) translateY(-6px)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Value Badge on top */}
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: m.color,
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(5, 10, 20, 0.9)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${m.color}66`,
                  boxShadow: `0 0 12px ${m.color}40`
                }}>
                  {m.val} <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{m.unit}</span>
                </div>

                {/* 3D Column Bar container with perspective transform */}
                <div style={{
                  width: '38px',
                  height: `${pct * 1.8}px`,
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(18deg) rotateY(-12deg)',
                  transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  {/* Front Face */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(180deg, ${m.color}, ${m.color}66)`,
                    borderRadius: '4px',
                    boxShadow: isHovered ? `0 0 25px ${m.color}` : `0 0 12px ${m.color}66`,
                    opacity: 0.9
                  }} />

                  {/* Top Cap Face (3D effect) */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '0',
                    width: '100%',
                    height: '12px',
                    background: m.color,
                    borderRadius: '4px 4px 0 0',
                    boxShadow: `0 0 15px ${m.color}`,
                    filter: 'brightness(1.4)'
                  }} />

                  {/* Side Face (3D depth) */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-10px',
                    width: '10px',
                    height: '100%',
                    background: `linear-gradient(180deg, ${m.color}aa, ${m.color}33)`,
                    transform: 'skewY(-45deg)',
                    borderRadius: '0 4px 4px 0'
                  }} />
                </div>

                {/* Bottom Icon & Label */}
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <Icon size={14} color={m.color} style={{ margin: '0 auto 2px auto' }} />
                  <div style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 3D Road Segment Elevation & Speed Analysis */}
      {edges.length > 0 && (
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'rgba(8, 14, 28, 0.9)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers color="#10b981" size={20} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)' }}>
                3D Road Segment Elevation & Speed Profile ({edges.length} Segments)
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              🛣️ Interactive Segment Breakdown
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(edges.length, 6)}, 1fr)`, gap: '12px' }}>
            {edges.map((e, idx) => {
              const congPct = Math.round((e.congestion || 0.2) * 100);
              const congColor = congPct > 50 ? '#f43f5e' : (congPct > 25 ? '#f59e0b' : '#10b981');
              return (
                <div key={idx} className="glass-card" style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'rgba(10, 18, 36, 0.85)',
                  border: `1px solid ${congColor}44`,
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: '#00f2fe' }}>{e.from || 'Node'} ↔ {e.to || 'Node'}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>Seq #{idx + 1}</span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {(Number(e.distance) || 1.0).toFixed(1)} <span style={{ fontSize: '0.75rem', color: '#00f2fe' }}>km</span>
                  </div>

                  {/* Animated 3D progress column for congestion */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${congPct}%`,
                      background: congColor,
                      height: '100%',
                      borderRadius: '4px',
                      boxShadow: `0 0 10px ${congColor}`,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    <span>Speed: {e.speedLimit || 60} km/h</span>
                    <span style={{ color: congColor, fontWeight: 700 }}>{congPct}% Cong.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
