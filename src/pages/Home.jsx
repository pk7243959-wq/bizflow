import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FinancialAnalytics from '../components/FinancialAnalytics';
import { exportFinancialReport } from '../utils/exportFinancialReport';
import { Download } from 'lucide-react';

export default function Home() {
  const [showAlert, setShowAlert] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [data, setData] = useState({
    totalCollected: 0,
    outstandingPayments: 0,
    unpaidCount: 0,
    overduePayments: 0,
    overdueClientsCount: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    overdueList: [],
    recentInvoices: [],
    recentExpenses: [],
  });

  useEffect(() => {
    const parseStorage = (keys) => {
      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch {
          // ignore malformed JSON
        }
      }
      return [];
    };

    const customers = parseStorage(['bizflow_customers', 'customers']);
    const invoices = parseStorage(['bizflow_invoices', 'invoices']);
    const payments = parseStorage(['bizflow_payments', 'payments']);
    const expenses = parseStorage(['bizflow_expenses', 'expenses']);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paidInvoices = invoices.filter((inv) => (inv.status || '').toLowerCase() === 'paid');
    const unpaidInvoices = invoices.filter((inv) => (inv.status || '').toLowerCase() !== 'paid');

    const totalCollectedFromPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalCollectedFromInvoices = paidInvoices.reduce(
      (sum, inv) => sum + Number(inv.amount || inv.total || 0),
      0
    );
    const totalCollected =
      totalCollectedFromPayments > 0 ? totalCollectedFromPayments : totalCollectedFromInvoices;

    const outstandingPayments = unpaidInvoices.reduce(
      (sum, inv) => sum + Number(inv.balance ?? inv.amount ?? inv.total ?? 0),
      0
    );

    const overdueInvoices = unpaidInvoices
      .map((inv) => {
        const dueDateObj = inv.dueDate ? new Date(inv.dueDate) : null;
        let daysLate = 0;
        if (dueDateObj && !isNaN(dueDateObj)) {
          daysLate = Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24));
        }
        const isExplicitOverdue = (inv.status || '').toLowerCase() === 'overdue';
        return {
          ...inv,
          daysLate: daysLate > 0 ? daysLate : isExplicitOverdue ? 1 : 0,
          isOverdue: daysLate > 0 || isExplicitOverdue,
        };
      })
      .filter((inv) => inv.isOverdue);

    const overduePayments = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.balance ?? inv.amount ?? inv.total ?? 0),
      0
    );
    const uniqueOverdueClients = new Set(
      overdueInvoices.map((inv) => inv.customerName || inv.customer || inv.id)
    ).size;

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const netCashFlow = totalCollected - totalExpenses;

    setData({
      totalCollected,
      outstandingPayments,
      unpaidCount: unpaidInvoices.length,
      overduePayments,
      overdueClientsCount: uniqueOverdueClients,
      totalExpenses,
      netCashFlow,
      overdueList: overdueInvoices,
      recentInvoices: invoices.slice(-5).reverse(),
      recentExpenses: expenses.slice(-5).reverse(),
    });
  }, []);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handleCopyReminder = (inv) => {
    const client = inv.customerName || inv.customer || 'Client';
    const invNo = inv.invoiceNumber || inv.id || 'Invoice';
    const amt = formatINR(inv.balance ?? inv.amount ?? inv.total);
    const msg = `Hi ${client}, friendly reminder that ${invNo} for ${amt} is overdue by ${inv.daysLate} day(s). Please share payment confirmation at your earliest convenience.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg);
    }
    setCopiedId(inv.id || invNo);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const styles = {
    page: {
      padding: '24px 28px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#0f172a',
      boxSizing: 'border-box',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
      marginBottom: '20px',
    },
    titleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    titleLine: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    h1: {
      fontSize: '24px',
      fontWeight: '700',
      margin: 0,
      color: '#0f172a',
    },
    currencyBadge: {
      backgroundColor: '#dcfce7',
      color: '#15803d',
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 8px',
      borderRadius: '6px',
    },
    subtitle: {
      fontSize: '13px',
      color: '#64748b',
      margin: 0,
    },
    actionGrid: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
    },
    btnGreen: {
      backgroundColor: '#16a34a',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '12px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
    },
    btnWhite: {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '12px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: 'pointer',
    },
    alertBanner: {
      backgroundColor: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: '12px',
      padding: '14px 18px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px',
    },
    alertLeft: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      flex: 1,
      minWidth: '260px',
    },
    alertIcon: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      flexShrink: 0,
    },
    alertTitleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    },
    alertTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#92400e',
      letterSpacing: '0.03em',
    },
    riskBadge: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      fontSize: '11px',
      fontWeight: '700',
      padding: '2px 8px',
      borderRadius: '9999px',
    },
    alertDesc: {
      fontSize: '13px',
      color: '#78350f',
      margin: 0,
      lineHeight: '1.4',
    },
    alertRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    btnAmber: {
      backgroundColor: '#d97706',
      color: '#ffffff',
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '12px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    },
    btnDismiss: {
      background: 'transparent',
      border: 'none',
      color: '#92400e',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '22px',
    },
    kpiCard: (accentBg, accentBorder) => ({
      backgroundColor: accentBg || '#ffffff',
      border: `1px solid ${accentBorder || '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '18px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }),
    kpiTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
    },
    kpiLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#64748b',
      letterSpacing: '0.04em',
    },
    kpiIconBox: (bg, color) => ({
      width: '30px',
      height: '30px',
      borderRadius: '8px',
      backgroundColor: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
    }),
    kpiAmount: (color) => ({
      fontSize: '24px',
      fontWeight: '700',
      color: color || '#0f172a',
      margin: '0 0 6px 0',
    }),
    kpiMeta: (color) => ({
      fontSize: '12px',
      color: color || '#64748b',
      margin: 0,
      fontWeight: '500',
    }),
    sectionCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '16px',
    },
    sectionTitleLine: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    },
    sectionH2: {
      fontSize: '16px',
      fontWeight: '700',
      margin: 0,
      color: '#0f172a',
    },
    chaseBadge: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      fontSize: '11px',
      fontWeight: '600',
      padding: '2px 8px',
      borderRadius: '9999px',
    },
    sectionSub: {
      fontSize: '12px',
      color: '#64748b',
      margin: 0,
    },
    viewAllLink: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#16a34a',
      textDecoration: 'none',
    },
    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
      textAlign: 'left',
    },
    th: {
      padding: '10px 12px',
      fontSize: '11px',
      fontWeight: '700',
      color: '#64748b',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      letterSpacing: '0.03em',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'middle',
    },
    overduePill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      fontSize: '11px',
      fontWeight: '600',
      padding: '3px 9px',
      borderRadius: '9999px',
    },
    copyBtn: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    emptyBox: {
      textAlign: 'center',
      padding: '28px 16px',
      color: '#94a3b8',
      fontSize: '13px',
    },
  };

  const netColor = data.netCashFlow >= 0 ? '#16a34a' : '#dc2626';

  return (
    <div style={styles.page}>
      {/* Top Header & Quick Actions */}
      <div style={styles.headerRow}>
        <div style={styles.titleGroup}>
          <div style={styles.titleLine}>
            <h1 style={styles.h1}>Financial Overview</h1>
            <span style={styles.currencyBadge}>₹ INR</span>
          </div>
          <p style={styles.subtitle}>
            Real-time receivables, cash position, and automated follow-ups
          </p>
        </div>

        <div style={styles.actionGrid}>
          <button
            onClick={() => exportFinancialReport({ invoices: data.recentInvoices })}
            style={{
              padding: '8px 14px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} /> Export PDF Report
          </button>
          <Link to="/invoices" style={styles.btnGreen}>+ Create Invoice</Link>
          <Link to="/payments" style={styles.btnWhite}>💳 Record Payment</Link>
          <Link to="/expenses" style={styles.btnWhite}>🧾 Add Expense</Link>
        </div>
      </div>

      {/* Action Required Banner */}
      {showAlert && data.overdueList.length > 0 && (
        <div style={styles.alertBanner}>
          <div style={styles.alertLeft}>
            <div style={styles.alertIcon}>⚠️</div>
            <div>
              <div style={styles.alertTitleRow}>
                <span style={styles.alertTitle}>ACTION REQUIRED: OVERDUE INVOICES</span>
                <span style={styles.riskBadge}>{formatINR(data.overduePayments)} at Risk</span>
              </div>
              <p style={styles.alertDesc}>
                {data.overdueList
                  .slice(0, 2)
                  .map(
                    (inv) =>
                      `${inv.customerName || inv.customer || 'Client'} (${inv.daysLate} days late, ${formatINR(
                        inv.balance ?? inv.amount ?? inv.total
                      )})`
                  )
                  .join(' and ')}{' '}
                require follow-up.
              </p>
            </div>
          </div>
          <div style={styles.alertRight}>
            <Link to="/reminders" style={styles.btnAmber}>🔔 Chase Invoices</Link>
            <button onClick={() => setShowAlert(false)} style={styles.btnDismiss}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard('#ffffff', '#e2e8f0')}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>NET CASH FLOW</span>
            <div style={styles.kpiIconBox('#dcfce7', '#16a34a')}>⚖️</div>
          </div>
          <p style={styles.kpiAmount(netColor)}>{formatINR(data.netCashFlow)}</p>
          <p style={styles.kpiMeta('#64748b')}>Collected minus Expenses</p>
        </div>

        <div style={styles.kpiCard('#ffffff', '#e2e8f0')}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>TOTAL REVENUE (COLLECTED)</span>
            <div style={styles.kpiIconBox('#dcfce7', '#16a34a')}>↗</div>
          </div>
          <p style={styles.kpiAmount('#0f172a')}>{formatINR(data.totalCollected)}</p>
          <p style={styles.kpiMeta('#16a34a')}>Verified bank / UPI inflows</p>
        </div>

        <div style={styles.kpiCard('#ffffff', '#e2e8f0')}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>OUTSTANDING PAYMENTS</span>
            <div style={styles.kpiIconBox('#dbeafe', '#2563eb')}>📄</div>
          </div>
          <p style={styles.kpiAmount('#0f172a')}>{formatINR(data.outstandingPayments)}</p>
          <p style={styles.kpiMeta('#64748b')}>{data.unpaidCount} active unpaid invoices</p>
        </div>

        <div style={styles.kpiCard('#fef2f2', '#fecaca')}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>OVERDUE PAYMENTS</span>
            <div style={styles.kpiIconBox('#fee2e2', '#dc2626')}>🕒</div>
          </div>
          <p style={styles.kpiAmount('#dc2626')}>{formatINR(data.overduePayments)}</p>
          <p style={styles.kpiMeta('#b91c1c')}>
            {data.overdueClientsCount} client(s) late past due date
          </p>
        </div>

        <div style={styles.kpiCard('#ffffff', '#e2e8f0')}>
          <div style={styles.kpiTop}>
            <span style={styles.kpiLabel}>TOTAL EXPENSES</span>
            <div style={styles.kpiIconBox('#f3e8ff', '#7c3aed')}>🧾</div>
          </div>
          <p style={styles.kpiAmount('#0f172a')}>{formatINR(data.totalExpenses)}</p>
          <p style={styles.kpiMeta('#64748b')}>Recorded business outflows</p>
        </div>
      </div>

      {/* Recharts Financial Analytics Section */}
      <FinancialAnalytics invoices={data.recentInvoices} expenses={data.recentExpenses} />

      {/* Immediate Chase List */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.sectionTitleLine}>
              <h2 style={styles.sectionH2}>Who Owes Me, How Much, &amp; Since When?</h2>
              <span style={styles.chaseBadge}>Immediate Chase List</span>
            </div>
            <p style={styles.sectionSub}>
              The #1 question for small business owners answered with 1-click reminder triggers.
            </p>
          </div>
          <Link to="/invoices" style={styles.viewAllLink}>View All Invoices ›</Link>
        </div>

        {data.overdueList.length === 0 ? (
          <div style={styles.emptyBox}>
            No overdue invoices right now! Add invoices in the Invoices tab to populate your chase list.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>CUSTOMER &amp; BUSINESS</th>
                  <th style={styles.th}>INVOICE #</th>
                  <th style={styles.th}>AMOUNT OWED</th>
                  <th style={styles.th}>DUE DATE</th>
                  <th style={styles.th}>OVERDUE SINCE</th>
                  <th style={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {data.overdueList.map((inv, idx) => {
                  const rowKey = inv.id || inv.invoiceNumber || idx;
                  return (
                    <tr key={rowKey}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                          {inv.customerName || inv.customer || 'Client'}
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontFamily: 'monospace', color: '#334155' }}>
                        {inv.invoiceNumber || inv.id || `INV-${idx + 1}`}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#0f172a' }}>
                        {formatINR(inv.balance ?? inv.amount ?? inv.total)}
                      </td>
                      <td style={{ ...styles.td, color: '#475569' }}>{inv.dueDate || '—'}</td>
                      <td style={styles.td}>
                        <span style={styles.overduePill}>🕒 {inv.daysLate} days overdue</span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleCopyReminder(inv)}
                          style={styles.copyBtn}
                        >
                          {copiedId === rowKey ? '✓ Copied' : '💬 Copy Reminder'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionH2}>Recent Activity</h2>
            <p style={styles.sectionSub}>Latest generated billing records</p>
          </div>
          <Link to="/invoices" style={styles.viewAllLink}>Manage All →</Link>
        </div>

        {data.recentInvoices.length === 0 ? (
          <div style={styles.emptyBox}>No recent invoice activity found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>INVOICE / CLIENT</th>
                  <th style={styles.th}>DUE DATE</th>
                  <th style={styles.th}>AMOUNT</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.map((inv, idx) => (
                  <tr key={inv.id || idx}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{inv.id}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{inv.customer}</div>
                    </td>
                    <td style={styles.td}>{inv.dueDate || '—'}</td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{formatINR(inv.amount)}</td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600',
                        backgroundColor: inv.status === 'Paid' ? '#dcfce7' : inv.status === 'Overdue' ? '#fee2e2' : '#fef3c7',
                        color: inv.status === 'Paid' ? '#166534' : inv.status === 'Overdue' ? '#991b1b' : '#92400e',
                      }}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}