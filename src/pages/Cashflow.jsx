import { useState, useEffect } from 'react';

export default function CashFlow() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Forecast simulation variables
  const [projectedMonthlySales, setProjectedMonthlySales] = useState(50000);
  const [projectedMonthlyExpenses, setProjectedMonthlyExpenses] = useState(30000);
  const [forecastMonths, setForecastMonths] = useState(3);

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('bizflow_invoices') || '[]');
    const savedPayments = JSON.parse(localStorage.getItem('bizflow_payments') || '[]');
    const savedExpenses = JSON.parse(localStorage.getItem('bizflow_expenses') || '[]');

    setInvoices(savedInvoices);
    setPayments(savedPayments);
    setExpenses(savedExpenses);
  }, []);

  // Calculate historical & current figures
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPaidExpenses = expenses
    .filter((e) => e.status === 'Paid')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const currentCashBalance = totalCollected - totalPaidExpenses;

  const expectedInflows = invoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + (Number(inv.amount || 0) - Number(inv.paid || 0)), 0);

  const upcomingOutflows = expenses
    .filter((exp) => exp.status !== 'Paid')
    .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  const immediateNetPosition = currentCashBalance + expectedInflows - upcomingOutflows;

  // Generate month-by-month projection
  const generateProjection = () => {
    const projections = [];
    let runningBalance = immediateNetPosition;
    const today = new Date();

    for (let i = 1; i <= forecastMonths; i++) {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = futureDate.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      const netMonthly = Number(projectedMonthlySales) - Number(projectedMonthlyExpenses);
      runningBalance += netMonthly;

      projections.push({
        month: monthName,
        inflow: Number(projectedMonthlySales),
        outflow: Number(projectedMonthlyExpenses),
        net: netMonthly,
        endingBalance: runningBalance,
      });
    }
    return projections;
  };

  const projectionData = generateProjection();

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Cash Flow & Forecasting</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Real-time liquidity overview and future cash runway simulation
        </p>
      </div>

      {/* Top Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Current Cash on Hand</span>
          <div style={{ ...cardValueStyle, color: currentCashBalance >= 0 ? '#111827' : '#dc2626' }}>
            ₹{currentCashBalance.toLocaleString('en-IN')}
          </div>
          <span style={cardSubStyle}>Collected minus paid expenses</span>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>Pending Receivables (+)</span>
          <div style={{ ...cardValueStyle, color: '#16a34a' }}>
            +₹{expectedInflows.toLocaleString('en-IN')}
          </div>
          <span style={cardSubStyle}>From unpaid/partial invoices</span>
        </div>

        <div style={cardStyle}>
          <span style={cardLabelStyle}>Unpaid Bills (-)</span>
          <div style={{ ...cardValueStyle, color: '#dc2626' }}>
            -₹{upcomingOutflows.toLocaleString('en-IN')}
          </div>
          <span style={cardSubStyle}>Pending operational expenses</span>
        </div>

        <div style={{ ...cardStyle, backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }}>
          <span style={cardLabelStyle}>Projected Immediate Net</span>
          <div style={{ ...cardValueStyle, color: immediateNetPosition >= 0 ? '#2563eb' : '#dc2626' }}>
            ₹{immediateNetPosition.toLocaleString('en-IN')}
          </div>
          <span style={cardSubStyle}>After clearing pending dues</span>
        </div>
      </div>

      {/* Forecast Simulator Controls */}
      <div
        style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#111827' }}>
          Future Runway Simulator
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={labelStyle}>Est. Monthly Inflow (₹)</label>
            <input
              type="number"
              value={projectedMonthlySales}
              onChange={(e) => setProjectedMonthlySales(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Est. Monthly Outflow (₹)</label>
            <input
              type="number"
              value={projectedMonthlyExpenses}
              onChange={(e) => setProjectedMonthlyExpenses(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Forecast Horizon</label>
            <select
              value={forecastMonths}
              onChange={(e) => setForecastMonths(Number(e.target.value))}
              style={inputStyle}
            >
              <option value={3}>Next 3 Months</option>
              <option value={6}>Next 6 Months</option>
              <option value={12}>Next 12 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Month</th>
              <th style={thStyle}>Projected Inflow</th>
              <th style={thStyle}>Projected Outflow</th>
              <th style={thStyle}>Net Monthly Cash Flow</th>
              <th style={thStyle}>Projected Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {projectionData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ ...tdStyle, fontWeight: '600', color: '#111827' }}>{row.month}</td>
                <td style={{ ...tdStyle, color: '#16a34a' }}>+₹{row.inflow.toLocaleString('en-IN')}</td>
                <td style={{ ...tdStyle, color: '#dc2626' }}>-₹{row.outflow.toLocaleString('en-IN')}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: '600',
                    color: row.net >= 0 ? '#16a34a' : '#dc2626',
                  }}
                >
                  {row.net >= 0 ? '+' : ''}₹{row.net.toLocaleString('en-IN')}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: '700',
                    color: row.endingBalance >= 0 ? '#111827' : '#dc2626',
                  }}
                >
                  ₹{row.endingBalance.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '18px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const cardLabelStyle = {
  fontSize: '13px',
  color: '#6b7280',
  fontWeight: '500',
};

const cardValueStyle = {
  fontSize: '22px',
  fontWeight: '700',
};

const cardSubStyle = {
  fontSize: '12px',
  color: '#9ca3af',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
};

const thStyle = {
  padding: '12px 16px',
  fontWeight: '600',
};

const tdStyle = {
  padding: '12px 16px',
  color: '#374151',
};