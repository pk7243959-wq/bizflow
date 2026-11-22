import { useState, useEffect } from 'react';

export default function Settings() {
  const [resetStatus, setResetStatus] = useState('');
  const [businessData, setBusinessData] = useState({
    name: 'Apex Traders Pvt Ltd',
    owner: 'Admin',
    email: 'contact@apextraders.in',
    phone: '+91 98765 43210',
    gstin: '36AAAAA0000A1Z5',
    currency: 'INR (₹)',
    fy: 'FY 2026-27'
  });

  useEffect(() => {
    const saved = localStorage.getItem('bizflow_business_profile');
    if (saved) {
      try {
        setBusinessData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('bizflow_business_profile', JSON.stringify(businessData));
    alert('Business profile updated successfully!');
  };

  const handleClearData = (key, label) => {
    if (window.confirm(`Are you sure you want to clear all ${label}? This cannot be undone.`)) {
      localStorage.removeItem(key);
      setResetStatus(`Cleared ${label}.`);
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  const handleFullReset = () => {
    if (window.confirm('CRITICAL WARNING: This will wipe ALL app data (Customers, Invoices, Expenses). Proceed?')) {
      const keys = [
        'bizflow_customers',
        'bizflow_invoices',
        'bizflow_payments',
        'bizflow_expenses',
        'bizflow_reminder_logs',
        'bizflow_business_profile'
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      setResetStatus('All application data wiped. Reloading...');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        minHeight: '100vh'
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '700' }}>
          Business Settings
        </h1>
        <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px' }}>
          Manage your company profile, regional preferences, and local storage data
        </p>
      </div>

      {resetStatus && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600',
            border: '1px solid #fecaca'
          }}
        >
          {resetStatus}
        </div>
      )}

      {/* Company Profile Form */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Company Profile</h2>
        <form
          onSubmit={handleSaveProfile}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
        >
          <div>
            <label style={labelStyle}>Business Name</label>
            <input
              type="text"
              value={businessData.name}
              onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Owner / Contact Person</label>
            <input
              type="text"
              value={businessData.owner}
              onChange={(e) => setBusinessData({ ...businessData, owner: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Official Email</label>
            <input
              type="email"
              value={businessData.email}
              onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="text"
              value={businessData.phone}
              onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>GSTIN / Tax ID</label>
            <input
              type="text"
              value={businessData.gstin}
              onChange={(e) => setBusinessData({ ...businessData, gstin: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Base Currency</label>
            <select
              value={businessData.currency}
              onChange={(e) => setBusinessData({ ...businessData, currency: e.target.value })}
              style={inputStyle}
            >
              <option value="INR (₹)" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                INR (₹)
              </option>
              <option value="USD ($)" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                USD ($)
              </option>
              <option value="EUR (€)" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                EUR (€)
              </option>
            </select>
          </div>
          <button type="submit" style={saveBtnStyle}>
            Save Business Profile
          </button>
        </form>
      </div>

      {/* Support & Help */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Support &amp; Help</h2>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
          Need assistance or have questions? Reach out to our support team.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={contactCardStyle}>
            <span style={{ fontSize: '20px' }}>✉️</span>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                EMAIL SUPPORT
              </div>
              <a
                href="mailto:support@bizflowai.com"
                style={{
                  fontSize: '15px',
                  color: '#2563eb',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                support@bizflowai.com
              </a>
            </div>
          </div>
          <div style={contactCardStyle}>
            <span style={{ fontSize: '20px' }}>📞</span>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                HELPLINE NUMBER
              </div>
              <a
                href="tel:+911800123456"
                style={{
                  fontSize: '15px',
                  color: '#2563eb',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                1800-123-456
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Storage Management */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Data &amp; Storage Management</h2>
        <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          Clear specific record modules or perform a complete factory reset of the application.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleClearData('bizflow_invoices', 'Invoices')}
            style={dangerBtnStyle}
          >
            Clear Invoices
          </button>
          <button
            type="button"
            onClick={() => handleClearData('bizflow_expenses', 'Expenses')}
            style={dangerBtnStyle}
          >
            Clear Expenses
          </button>
          <button
            type="button"
            onClick={() => handleClearData('bizflow_customers', 'Customers')}
            style={dangerBtnStyle}
          >
            Clear Customers
          </button>
          <button type="button" onClick={handleFullReset} style={fullResetBtnStyle}>
            Factory Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionStyle = {
  backgroundColor: '#ffffff',
  padding: '28px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  marginBottom: '28px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};

const sectionTitleStyle = {
  margin: '0 0 16px',
  fontSize: '18px',
  color: '#0f172a',
  fontWeight: '700'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  WebkitTextFillColor: '#0f172a'
};

const saveBtnStyle = {
  gridColumn: 'span 2',
  backgroundColor: '#0f172a',
  color: '#ffffff',
  border: 'none',
  padding: '14px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '15px',
  marginTop: '10px'
};

const contactCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  minWidth: '260px'
};

const dangerBtnStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  color: '#0f172a'
};

const fullResetBtnStyle = {
  padding: '10px 18px',
  borderRadius: '8px',
  border: '1px solid #fca5a5',
  backgroundColor: '#fee2e2',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  color: '#991b1b'
};