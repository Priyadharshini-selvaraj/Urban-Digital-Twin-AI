import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Building2, RouteIcon,
  BrainCircuit, BarChart3, FileText, ChevronLeft, ChevronRight,
  Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',      emoji: '🏠' },
  { to: '/upload',   icon: Upload,          label: 'Upload Model',   emoji: '📂' },
  { to: '/viewer',   icon: Building2,       label: '3D City Viewer', emoji: '🏙' },
  { to: '/routes',   icon: RouteIcon,       label: 'Route Planner',  emoji: '🛣' },
  { to: '/analytics',icon: BarChart3,       label: 'Analytics & AI', emoji: '📊' },
  { to: '/reports',  icon: FileText,        label: 'Reports',        emoji: '📄' }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside style={{
      width: collapsed ? '72px' : '240px',
      minHeight: '100vh',
      background: 'rgba(7, 10, 18, 0.97)',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      flexShrink: 0
    }}>
      {/* Logo area */}
      <div style={{
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: collapsed ? '0 16px' : '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px rgba(0,242,254,0.4)',
          flexShrink: 0
        }}>
          <Activity size={20} color="#050b14" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#fff',
              whiteSpace: 'nowrap',
              lineHeight: 1.2
            }}>
              URBAN TWIN <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
              Smart City Platform
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label, emoji }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              style={({ isActive: rActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 16px' : '10px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                background: isActive
                  ? 'rgba(0, 242, 254, 0.1)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(0, 242, 254, 0.2)'
                  : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                justifyContent: collapsed ? 'center' : 'flex-start'
              })}
              title={collapsed ? label : undefined}
              end={to === '/'}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-main)'
                }}>
                  {label}
                </span>
              )}
              {isActive && !collapsed && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-cyan)',
                  boxShadow: '0 0 8px var(--accent-cyan)',
                  flexShrink: 0
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: '9px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'all 0.2s'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
