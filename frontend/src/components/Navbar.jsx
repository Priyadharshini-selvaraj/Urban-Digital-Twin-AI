import React from 'react';
import { Activity, Shield, Cpu, Wifi, User, LogOut } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout, websocketConnected }) {
  return (
    <header className="glass-panel" style={{ margin: '16px 20px 0 20px', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(0,242,254,0.4)' }}>
          <Activity size={24} color="#050b14" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
            URBAN DIGITAL TWIN <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Smart City Simulator • 3D Visualization & Multi-Profile Pathfinding
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-cyan">
            <Shield size={12} />
            Spring Boot JWT
          </span>
        </div>

        {/* User Auth Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              👤 {user.username || 'Admin'}
            </span>
            <button className="glow-btn" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(244,63,94,0.2)', color: '#f43f5e', boxShadow: 'none' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <button className="glow-btn" onClick={onOpenAuth} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <User size={16} /> JWT Login
          </button>
        )}
      </div>
    </header>
  );
}
