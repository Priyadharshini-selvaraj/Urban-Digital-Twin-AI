import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap, Navigation, ShieldCheck, Activity, Award,
  Cpu, Leaf, Flame, AlertTriangle, Wifi, Route as RouteIcon
} from 'lucide-react';

export default function DashboardOverview() {
  const {
    bestProfile, activeGraphName, startNode, endNode,
    algorithm, routeProfiles, websocketConnected, availableNodes, trafficVehicleCounts
  } = useApp();

  const em = bestProfile?.aiEmissions || {};
  const ecoScore = em.eco_score || 88;
  const ecoColor = ecoScore > 75 ? '#10b981' : (ecoScore > 50 ? '#f59e0b' : '#f43f5e');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Top Banner Header */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Urban Digital Twin AI — Smart City Simulation & Pathfinding Analytics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
            <Activity size={14} /> {availableNodes.length} Junction Nodes
          </span>
        </div>
      </div>

      {/* Main Full-Width Optimized Route Summary Container */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        
        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.18)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
              <Zap size={24} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                Optimized Route Summary
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Recommended travel path based on real-time graph optimization algorithms
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Parameters Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active City Model</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{activeGraphName}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Origin → Destination</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{startNode} → {endNode}</div>
          </div>

          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Traffic Density</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              🚗 {trafficVehicleCounts?.cars || 145} Cars • 🚛 {trafficVehicleCounts?.trucks || 24} Trucks
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pathfinding Algorithm</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{algorithm.toUpperCase()}</div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          
          {/* Distance */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} color="#10b981" /> Optimal Distance
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              {bestProfile?.distanceKm !== undefined ? (Number(bestProfile.distanceKm) || 0).toFixed(1) : '—'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>km</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Minimum spatial path</div>
          </div>

          {/* Time */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="#00f2fe" /> Estimated ETA
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#00f2fe' }}>
              {bestProfile?.estimatedTimeMin ?? '—'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>min</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Traffic-adjusted travel time</div>
          </div>

          {/* Fuel Usage */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} color="#f59e0b" /> Fuel Consumption
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
              {em.fuel_consumption_liters ?? '0.00'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>L</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Estimated fuel burn</div>
          </div>

          {/* CO2 Emissions */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Leaf size={16} color={ecoColor} /> Carbon Footprint
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: ecoColor }}>
              {em.co2_emissions_grams ?? '0.0'} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>g CO₂</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Eco Score: {ecoScore}/100</div>
          </div>

        </div>

        {/* AI Insight Banner */}
        <div style={{ background: 'rgba(0, 242, 254, 0.06)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <AlertTriangle size={22} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>AI Traffic Simulation System Active: </span>
            <span>Real-time graph pathfinder is dynamically analyzing <strong>{availableNodes.length} intersection nodes</strong> and live vehicle density for the optimal route.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
