import React, { useRef } from 'react';
import { MapPin, Navigation, Compass, Zap, TrafficCone, ShieldCheck, Activity, ShieldAlert, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RouteControls({
  cityModels = [],
  selectedModelKey,
  setSelectedModelKey,
  onUploadSkpClick,
  availableNodes = [],
  startNode,
  setStartNode,
  endNode,
  setEndNode,
  algorithm,
  setAlgorithm,
  activeProfileKey,
  setActiveProfileKey,
  onCalculateRoute,
  loading,
  bestProfile
}) {
  const fileInputRef = useRef(null);
  const { trafficVehicleCounts, setTrafficVehicleCounts, isCalculated } = useApp();

  const profiles = [
    { key: 'fastest', label: 'Fastest Path (Best)', icon: Zap, color: '#10b981', desc: 'Optimized travel time & speed' },
    { key: 'shortest', label: 'Shortest Path', icon: Navigation, color: '#3b82f6', desc: 'Minimal spatial distance' },
    { key: 'leastCongested', label: 'Least Congested', icon: TrafficCone, color: '#8b5cf6', desc: 'Bypasses traffic jams' },
    { key: 'safest', label: 'Safest Path', icon: ShieldCheck, color: '#f59e0b', desc: 'Lowest collision risk' }
  ];

  const counts = trafficVehicleCounts || {
    cars: 142, speedCars: 50, congCars: 53, growthCars: '+3%',
    bikes: 41, speedBikes: 30, congBikes: 18, growthBikes: '-5%',
    buses: 26, speedBuses: 32, congBuses: 45, growthBuses: '+2%',
    trucks: 26, speedTrucks: 35, congTrucks: 59, growthTrucks: '-3%',
    emergency: { ambulances: 3, fireTrucks: 2, police: 5, total: 10 }
  };

  const handleVehicleCountChange = (field, deltaOrVal) => {
    let newVal;
    if (typeof deltaOrVal === 'number') {
      newVal = deltaOrVal;
    } else {
      const curr = field === 'emergency' ? (typeof counts.emergency === 'object' ? counts.emergency.total : counts.emergency) : counts[field];
      newVal = Math.max(0, curr + deltaOrVal);
    }

    setTrafficVehicleCounts(prev => {
      if (field === 'emergency') {
        const prevEmerg = typeof prev.emergency === 'object' ? prev.emergency : { ambulances: 3, fireTrucks: 2, police: 5, total: 10 };
        return {
          ...prev,
          emergency: {
            ...prevEmerg,
            total: Math.max(0, newVal)
          }
        };
      }
      return {
        ...prev,
        [field]: Math.max(0, newVal)
      };
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Compass color="var(--accent-cyan)" size={24} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff' }}>
            Smart Route Planner
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Compute optimal routing profiles using the 3D spatial A* pathfinding engine. Adjust vehicle counts below to directly influence route weights.
        </p>
      </div>

      {/* Main Controls Container */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(12, 19, 36, 0.85)', border: '1px solid rgba(0, 242, 254, 0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: '14px' }}>
        
        {/* Dropdowns Row: CITY MODEL | START JUNCTION | END JUNCTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          
          {/* City Model Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              City Model
            </label>
            <select
              value={selectedModelKey}
              onChange={(e) => {
                if (e.target.value === 'upload') {
                  if (fileInputRef.current) fileInputRef.current.click();
                } else {
                  setSelectedModelKey(e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '11px 12px',
                background: 'rgba(7, 11, 22, 0.95)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Select a city model...</option>
              {cityModels.map(m => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
              <option value="upload">📤 Upload .OBJ Model...</option>
            </select>
            <input
              type="file"
              ref={fileInputRef}
              accept=".obj"
              onChange={onUploadSkpClick}
              style={{ display: 'none' }}
            />
          </div>

          {/* Start Junction Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <MapPin size={12} color="var(--accent-green)" /> Start Junction
            </label>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px',
                background: 'rgba(7, 11, 22, 0.95)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Choose node...</option>
              {availableNodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          {/* End Junction Selector */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Navigation size={12} color="var(--accent-purple)" /> End Junction
            </label>
            <select
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 12px',
                background: 'rgba(7, 11, 22, 0.95)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>Choose node...</option>
              {availableNodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTIVE PATHFINDING ENGINE (A* Algorithm) */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚡ Active Pathfinding Engine
          </label>
          <div style={{
            width: '100%',
            padding: '11px 14px',
            background: 'rgba(7, 11, 22, 0.95)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#00f2fe' }}>🚀 A* Algorithm</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>(3D Spatial Heuristic Engine)</span>
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              HIGH PERFORMANCE
            </span>
          </div>
        </div>

        {/* Live Traffic Overview & INTERACTIVE VEHICLE COUNTERS SECTION */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} color="var(--accent-cyan)" /> Live Traffic Overview & Vehicle Counters (User-Controlled)
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', background: 'rgba(0,242,254,0.1)', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(0,242,254,0.3)' }}>
              Enter or Adjust Counts Below
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            
            {/* Cars */}
            <div style={{ background: 'rgba(10, 16, 30, 0.9)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🚗 Cars</span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>{counts.growthCars || '+3%'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('cars', -5)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={counts.cars}
                  onChange={(e) => handleVehicleCountChange('cars', parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,242,254,0.4)', color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}
                />
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('cars', 5)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                {counts.speedCars || 50} km/h • <span style={{ color: '#f59e0b' }}>{counts.congCars || 53}% Cong.</span>
              </div>
            </div>

            {/* Bikes */}
            <div style={{ background: 'rgba(10, 16, 30, 0.9)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🏍️ Bikes</span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>{counts.growthBikes || '-5%'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('bikes', -5)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={counts.bikes}
                  onChange={(e) => handleVehicleCountChange('bikes', parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16,185,129,0.4)', color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}
                />
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('bikes', 5)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                {counts.speedBikes || 30} km/h • <span style={{ color: '#10b981' }}>{counts.congBikes || 18}% Cong.</span>
              </div>
            </div>

            {/* Buses */}
            <div style={{ background: 'rgba(10, 16, 30, 0.9)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🚌 Buses</span>
                <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 700 }}>{counts.growthBuses || '+2%'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('buses', -2)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={counts.buses}
                  onChange={(e) => handleVehicleCountChange('buses', parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(59,130,246,0.4)', color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}
                />
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('buses', 2)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                {counts.speedBuses || 32} km/h • <span style={{ color: '#3b82f6' }}>{counts.congBuses || 45}% Cong.</span>
              </div>
            </div>

            {/* Trucks */}
            <div style={{ background: 'rgba(10, 16, 30, 0.9)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>🚛 Trucks</span>
                <span style={{ fontSize: '0.65rem', color: '#f43f5e', fontWeight: 700 }}>{counts.growthTrucks || '-3%'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('trucks', -2)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={counts.trucks}
                  onChange={(e) => handleVehicleCountChange('trucks', parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(245,158,11,0.4)', color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}
                />
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('trucks', 2)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                {counts.speedTrucks || 35} km/h • <span style={{ color: '#f59e0b' }}>{counts.congTrucks || 59}% Cong.</span>
              </div>
            </div>

            {/* Emergency Vehicles */}
            <div style={{ background: 'rgba(10, 16, 30, 0.9)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldAlert size={12} /> Emergency
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>Priority</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('emergency', -1)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minus size={12} />
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={typeof counts.emergency === 'object' ? counts.emergency.total : (counts.emergency || 10)}
                  onChange={(e) => handleVehicleCountChange('emergency', parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(244,63,94,0.4)', color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: '6px', padding: '4px 0' }}
                />
                <button
                  type="button"
                  onClick={() => handleVehicleCountChange('emergency', 1)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'center' }}>
                🚑 3 • 🚒 2 • 🚓 5
              </div>
            </div>

          </div>
        </div>

        {/* Recalculation Notice Banner if Junctions changed */}
        {!isCalculated && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '8px',
            padding: '8px 14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            fontSize: '0.8rem',
            color: '#fcd34d',
            fontWeight: 700
          }}>
            <span>⚡ Junctions or parameters modified! Click button to calculate.</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.25)', padding: '2px 8px', borderRadius: '4px' }}>Click Button Below</span>
          </div>
        )}

        {/* CALCULATE OPTIMIZED ROUTE BUTTON */}
        <button
          className="glow-btn"
          onClick={onCalculateRoute}
          disabled={loading}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 800,
            borderRadius: '10px',
            background: isCalculated
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, #00f2fe, #3b82f6)',
            color: '#fff',
            boxShadow: isCalculated
              ? '0 0 20px rgba(16, 185, 129, 0.4)'
              : '0 0 30px rgba(0, 242, 254, 0.65)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.4px',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? '⚡ Calculating Optimal Route...' : (isCalculated ? '✓ Route Optimized (Click to Recalculate)' : '🚀 Calculate Optimized Route')}
        </button>
      </div>
    </div>
  );
}
