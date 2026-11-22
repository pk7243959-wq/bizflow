import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Customers', path: '/customers', icon: '👥' },
    { label: 'Invoices', path: '/invoices', icon: '📄' },
    { label: 'Payments', path: '/payments', icon: '💳' },
    { label: 'Expenses', path: '/expenses', icon: '💸' },
    { label: 'Cash Flow', path: '/cash-flow', icon: '📈' },
    { label: 'Reminders', path: '/reminders', icon: '🔔' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      {/* Mobile Header */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 40
      }} className="mobile-header">
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>BizFlow AI</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '18px'
            }}>
              B
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>BizFlow AI</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Finance & Cash Flow</div>
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 12px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                textDecoration: 'none',
                color: isActive ? '#15803d' : '#475569',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                backgroundColor: isActive ? '#dcfce7' : 'transparent',
                borderRadius: '8px',
                borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
          <div style={{ fontWeight: '600', color: '#334155' }}>Apex Traders Pvt Ltd</div>
          <div>INR (₹) • FY 2026-27</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px 32px', overflowX: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
