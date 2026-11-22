import { useState, useEffect } from 'react';

export default function Reminders() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('bizflow_reminder_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [callOutcome, setCallOutcome] = useState('Not Called Yet');
  const [customNote, setCustomNote] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState(null);

  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem('bizflow_invoices') || '[]');
    const savedCustomers = JSON.parse(localStorage.getItem('bizflow_customers') || '[]');

    const activeInvoices = savedInvoices.length > 0 ? savedInvoices : [
      { id: 'INV-1001', customer: 'Sharma Traders', amount: 45000, paid: 20000, status: 'Pending', dueDate: '2026-11-15' },
      { id: 'INV-1003', customer: 'Apex Retailers', amount: 18500, paid: 0, status: 'Overdue', dueDate: '2026-11-10' }
    ];

    setInvoices(activeInvoices);
    setCustomers(savedCustomers);
  }, []);

  useEffect(() => {
    localStorage.setItem('bizflow_reminder_logs', JSON.stringify(logs));
  }, [logs]);

  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'Paid');

  const getCustomerPhone = (customerName) => {
    const found = customers.find(
      (c) => c.company === customerName || c.name === customerName
    );
    return found?.phone || '+91 98765 43210';
  };

  const handleGenerateAction = (e) => {
    e.preventDefault();
    const inv = unpaidInvoices.find((item) => item.id === selectedInvoiceId);
    if (!inv) return;

    const balance = Number(inv.amount || 0) - Number(inv.paid || 0);
    const phone = getCustomerPhone(inv.customer);

    let actionType = '';
    let escalationLevel = 'Normal';
    let callScript = '';
    let messageText = '';
    let nextStepRule = '';

    switch (callOutcome) {
      case 'Answered - Promised to Pay':
        actionType = 'Confirmation Message & Payment Link';
        escalationLevel = 'Low';
        callScript = `"Hello ${inv.customer}, thank you for speaking with us regarding Invoice ${inv.id} (Balance: ₹${balance.toLocaleString('en-IN')}). As discussed, we are sending the payment link now."`;
        messageText = `Hi ${inv.customer}, thank you for confirming payment of ₹${balance.toLocaleString('en-IN')} for Invoice ${inv.id}. Please complete the transfer today via UPI/NEFT and share the reference ID.`;
        nextStepRule = 'Rule: Verify payment receipt within 24 hours. Auto-close reminder if settled.';
        break;

      case 'Call Not Answered':
        actionType = 'Missed Call Follow-up SMS / WhatsApp';
        escalationLevel = 'Medium';
        callScript = `"No answer recorded on ${phone}. Leave voicemail: 'Calling from BizFlow regarding pending Invoice ${inv.id} of ₹${balance.toLocaleString('en-IN')}. Please call back or check WhatsApp.'"`;
        messageText = `Hello ${inv.customer}, we tried reaching you regarding pending Invoice ${inv.id} for ₹${balance.toLocaleString('en-IN')}. Kindly call us back or settle the due amount at your earliest convenience.`;
        nextStepRule = 'Rule: Retry call after 4 hours. If unanswered twice, escalate to Branch Visit notice.';
        break;

      case 'No Response / Ignoring':
        actionType = 'Mandatory Office / Bank Settlement Notice';
        escalationLevel = 'High';
        callScript = `"Direct Warning Call Script: 'Hello ${inv.customer}, despite repeated reminders, Invoice ${inv.id} (₹${balance.toLocaleString('en-IN')}) remains unaddressed. You are requested to visit our office/bank branch within 48 hours to clear the account.'"`;
        messageText = `URGENT NOTICE: ${inv.customer}, your balance of ₹${balance.toLocaleString('en-IN')} against Invoice ${inv.id} is severely overdue with no response. Please visit our office or designated bank branch within 48 hours to settle the dues.`;
        nextStepRule = 'Rule: Flag account on hold. If no visit in 48 hours, trigger Formal Legal Notice.';
        break;

      case 'Refused / Defaulted':
        actionType = 'Final Legal Demand Notice';
        escalationLevel = 'Critical';
        callScript = `"Final Pre-Legal Intimation: 'This is a final intimation regarding unpaid Invoice ${inv.id} (₹${balance.toLocaleString('en-IN')}). Formal legal recovery proceedings are being initiated.'"`;
        messageText = `FINAL LEGAL NOTICE: To ${inv.customer}, you have failed to clear ₹${balance.toLocaleString('en-IN')} for Invoice ${inv.id}. Unless full payment is received within 72 hours, formal legal action and recovery proceedings will be initiated at your cost.`;
        nextStepRule = 'Rule: Generate PDF Legal Notice & forward file to legal recovery team.';
        break;

      default:
        actionType = 'Polite First Reminder (Call + Message)';
        escalationLevel = 'Normal';
        callScript = `"Hello ${inv.customer}, this is a courtesy reminder from BizFlow regarding Invoice ${inv.id} with a pending balance of ₹${balance.toLocaleString('en-IN')}. Let us know if you need any details to process this."`;
        messageText = `Reminder: Dear ${inv.customer}, Invoice ${inv.id} has a pending balance of ₹${balance.toLocaleString('en-IN')}. Please arrange payment at your earliest convenience. Ignore if already paid.`;
        nextStepRule = 'Rule: Log call response after dialing.';
        break;
    }

    const result = {
      id: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: inv.id,
      customer: inv.customer,
      phone,
      balance,
      outcome: callOutcome,
      actionType,
      escalationLevel,
      callScript,
      messageText,
      nextStepRule,
      note: customNote,
      timestamp: new Date().toLocaleString('en-IN'),
    };

    setGeneratedOutput(result);
    setLogs([result, ...logs]);
    setCustomNote('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const unresponsiveCount = logs.filter(
    (l) => l.outcome === 'Call Not Answered' || l.outcome === 'No Response / Ignoring'
  ).length;

  const legalEscalationCount = logs.filter(
    (l) => l.outcome === 'Refused / Defaulted'
  ).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>AI Payment Reminder & Escalation Assistant</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
          Generate call scripts, messages, branch visit alerts, and legal notices based on client response
        </p>
      </div>

      {/* Response Summary Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Pending / Overdue Invoices</span>
          <div style={{ ...cardValueStyle, color: '#111827' }}>{unpaidInvoices.length}</div>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Total Follow-ups Logged</span>
          <div style={{ ...cardValueStyle, color: '#2563eb' }}>{logs.length}</div>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>No Answer / Unresponsive</span>
          <div style={{ ...cardValueStyle, color: '#d97706' }}>{unresponsiveCount}</div>
        </div>
        <div style={cardStyle}>
          <span style={cardLabelStyle}>Legal / Final Escalations</span>
          <div style={{ ...cardValueStyle, color: '#dc2626' }}>{legalEscalationCount}</div>
        </div>
      </div>

      {/* Generator Form */}
      <form
        onSubmit={handleGenerateAction}
        style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <label style={labelStyle}>Select Pending Invoice *</label>
          <select
            required
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Choose Invoice --</option>
            {unpaidInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.id} - {inv.customer} (Due: ₹{(Number(inv.amount) - Number(inv.paid || 0)).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Call / Client Response Rule *</label>
          <select
            value={callOutcome}
            onChange={(e) => setCallOutcome(e.target.value)}
            style={inputStyle}
          >
            <option value="Not Called Yet">1. Initial Polite Reminder (Not Called Yet)</option>
            <option value="Answered - Promised to Pay">2. Call Answered - Promised to Pay</option>
            <option value="Call Not Answered">3. Call Not Answered (Missed Call)</option>
            <option value="No Response / Ignoring">4. No Response (Bank / Office Visit Notice)</option>
            <option value="Refused / Defaulted">5. Refused / Defaulted (Legal Notice)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Call Remarks / Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Promised payment by Friday 5 PM"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            padding: '12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            gridColumn: '1 / -1',
          }}
        >
          Generate Call Script, Message & Log Response
        </button>
      </form>

      {/* Generated Output Box */}
      {generatedOutput && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
              Action Plan: {generatedOutput.actionType}
            </h3>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor:
                  generatedOutput.escalationLevel === 'Critical' || generatedOutput.escalationLevel === 'High'
                    ? '#fee2e2'
                    : '#dbeafe',
                color:
                  generatedOutput.escalationLevel === 'Critical' || generatedOutput.escalationLevel === 'High'
                    ? '#991b1b'
                    : '#1e40af',
              }}
            >
              Escalation: {generatedOutput.escalationLevel}
            </span>
          </div>

          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#4b5563' }}>
            <strong>Customer:</strong> {generatedOutput.customer} ({generatedOutput.phone}) | <strong>Pending:</strong> ₹{generatedOutput.balance.toLocaleString('en-IN')}
          </p>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '13px', color: '#374151' }}>📞 Call Script:</strong>
              <button onClick={() => copyToClipboard(generatedOutput.callScript)} style={copyBtnStyle}>Copy Script</button>
            </div>
            <div style={boxTextStyle}>{generatedOutput.callScript}</div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong style={{ fontSize: '13px', color: '#374151' }}>💬 SMS / WhatsApp / Notice Text:</strong>
              <button onClick={() => copyToClipboard(generatedOutput.messageText)} style={copyBtnStyle}>Copy Message</button>
            </div>
            <div style={boxTextStyle}>{generatedOutput.messageText}</div>
          </div>

          <div style={{ fontSize: '13px', color: '#047857', fontWeight: '600', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px' }}>
            ⚡ {generatedOutput.nextStepRule}
          </div>
        </div>
      )}

      {/* Follow-up Summary Report Table */}
      <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '12px' }}>Client Response & Follow-up Report</h2>
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Invoice / Customer</th>
              <th style={thStyle}>Call / Response Status</th>
              <th style={thStyle}>Triggered Action</th>
              <th style={thStyle}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No call or reminder logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, fontSize: '12px', color: '#6b7280' }}>{log.timestamp}</td>
                  <td style={tdStyle}>
                    <strong>{log.invoiceId}</strong> - {log.customer}
                    <div style={{ fontSize: '12px', color: '#dc2626' }}>₹{log.balance.toLocaleString('en-IN')}</div>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: log.outcome.includes('Answered') ? '#dcfce7' : '#fef3c7',
                        color: log.outcome.includes('Answered') ? '#166534' : '#92400e',
                      }}
                    >
                      {log.outcome}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '500' }}>{log.actionType}</td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: '13px' }}>{log.note || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const cardLabelStyle = {
  fontSize: '13px',
  color: '#6b7280',
  display: 'block',
  marginBottom: '4px',
};

const cardValueStyle = {
  fontSize: '22px',
  fontWeight: '700',
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

const boxTextStyle = {
  backgroundColor: '#f3f4f6',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '1.5',
};

const copyBtnStyle = {
  backgroundColor: '#e5e7eb',
  border: 'none',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  fontWeight: '600',
};

const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#374151' };