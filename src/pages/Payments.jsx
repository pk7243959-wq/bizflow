import { useState, useEffect } from 'react';

const initialPayments = [
  { id: 'PAY-8001', invoiceId: 'INV-1001', customer: 'Sharma Traders', amount: 20000, method: 'UPI', date: '2026-11-20', notes: 'Advance payment' },
];

export default function Payments() {
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('bizflow_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [invoices] = useState(() => {
    const saved = localStorage.getItem('bizflow_invoices');
    return saved ? JSON.parse(saved) : [
      { id: 'INV-1001', customer: 'Sharma Traders', amount: 45000, paid: 20000, status: 'Pending' },
      { id: 'INV-1002', customer: 'Deccan Logistics', amount: 12500, paid: 12500, status: 'Paid' }
    ];
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('bizflow_customers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Aarav Sharma', company: 'Sharma Traders', balance: 25000 },
      { id: '2', name: 'Priya Reddy', company: 'Deccan Logistics', balance: 0 }
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: 'UPI',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('bizflow_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('bizflow_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('bizflow_customers', JSON.stringify(customers));
  }, [customers]);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!formData.invoiceId || !formData.amount) return;

    const selectedInvoice = invoices.find(inv => inv.id === formData.invoiceId);
    if (!selectedInvoice) return;

    const paymentAmount = Number(formData.amount);
    const remainingBefore = selectedInvoice.amount - selectedInvoice.paid;

    if (paymentAmount > remainingBefore) {
      alert(`Payment exceeds remaining balance of ₹${remainingBefore.toLocaleString('en-IN')}`);
      return;
    }

    const newPayment = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceId: selectedInvoice.id,
      customer: selectedInvoice.customer,
      amount: paymentAmount,
      method: formData.method,
      date: formData.date,
      notes: formData.notes
    };

    const newPaidTotal = selectedInvoice.paid + paymentAmount;
    const newStatus = newPaidTotal >= selectedInvoice.amount ? 'Paid' : 'Pending';

    const updatedInvoices = invoices.map(inv => 
      inv.id === selectedInvoice.id 
        ? { ...inv, paid: newPaidTotal, status: newStatus }
        : inv
    );

    const updatedCustomers = customers.map(cust =>
      cust.company === selectedInvoice.customer || cust.name === selectedInvoice.customer
        ? { ...cust, balance: Math.max(0, cust.balance - paymentAmount) }
        : cust
    );

    setPayments([newPayment, ...payments]);
    // @ts-ignore
    setInvoices(updatedInvoices);
    // @ts-ignore
    setCustomers(updatedCustomers);
    
    setFormData({
      invoiceId: '',
      amount: '',
      method: 'UPI',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowForm(false);
  };

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.customer.toLowerCase().includes(search.toLowerCase()) ||
    p.method.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Payment Tracking</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Record full or partial settlements (Total Collected: ₹{totalCollected.toLocaleString('en-IN')})
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#16a34a',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRecordPayment} style={{
          backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px',
          border: '1px solid #e5e7eb', marginBottom: '24px', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'
        }}>
          <select
            required
            value={formData.invoiceId}
            onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select Unpaid Invoice *</option>
            {invoices.filter(inv => inv.status !== 'Paid').map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.id} - {inv.customer} (Bal: ₹{(inv.amount - inv.paid).toLocaleString('en-IN')})
              </option>
            ))}
          </select>

          <input
            type="number" placeholder="Payment Amount (₹) *" required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            style={inputStyle}
          />

          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            style={inputStyle}
          >
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>

          <input
            type="date" value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={inputStyle}
          />

          <input
            type="text" placeholder="Notes (e.g. Reference No.)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{ ...inputStyle, gridColumn: '1 / -1' }}
          />

          <button type="submit" style={{
            backgroundColor: '#111827', color: '#fff', border: 'none',
            padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
            gridColumn: '1 / -1'
          }}>
            Confirm and Record Payment
          </button>
        </form>
      )}

      <input
        type="text" placeholder="Search payments by ID, customer, or method..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ ...inputStyle, width: '100%', marginBottom: '16px' }}
      />

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Payment ID</th>
              <th style={thStyle}>Invoice</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Method</th>
              <th style={thStyle}>Notes</th>
              <th style={thStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No records found.</td></tr>
            ) : (
              filteredPayments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{p.id}</td>
                  <td style={tdStyle}>{p.invoiceId}</td>
                  <td style={tdStyle}>{p.customer}</td>
                  <td style={tdStyle}>{p.date}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px',
                      backgroundColor: '#e0e7ff', color: '#3730a3', fontWeight: '500'
                    }}>
                      {p.method}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: '13px' }}>{p.notes || '-'}</td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#16a34a' }}>+₹{p.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' };
const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#374151' };