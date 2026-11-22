import { useState, useEffect } from 'react';

const initialInvoices = [
  { id: 'INV-1001', customer: 'Sharma Traders', date: '2026-11-15', dueDate: '2026-11-30', amount: 45000, status: 'Pending' },
  { id: 'INV-1002', customer: 'Deccan Logistics', date: '2026-11-18', dueDate: '2026-12-03', amount: 12500, status: 'Paid' },
  { id: 'INV-1003', customer: 'Patel Enterprises', date: '2026-11-01', dueDate: '2026-11-16', amount: 28000, status: 'Overdue' },
];

export default function Invoices() {
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('bizflow_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  // Pull saved customers so you can select them from a dropdown
  const [customers] = useState(() => {
    const saved = localStorage.getItem('bizflow_customers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Aarav Sharma', company: 'Sharma Traders' },
      { id: '2', name: 'Priya Reddy', company: 'Deccan Logistics' },
      { id: '3', name: 'Vikram Patel', company: 'Patel Enterprises' },
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    status: 'Pending',
  });

  useEffect(() => {
    localStorage.setItem('bizflow_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleAddInvoice = (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.amount) return;

    const newInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customer,
      date: formData.date,
      dueDate: formData.dueDate || formData.date,
      amount: Number(formData.amount),
      status: formData.status,
    };

    setInvoices([newInvoice, ...invoices]);
    setFormData({
      customer: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: '',
      status: 'Pending',
    });
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status: inv.status === 'Paid' ? 'Pending' : 'Paid' }
          : inv
      )
    );
  };

  const handleDelete = (id) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Invoices</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Create, track, and manage customer billing (Total Filtered: ₹{totalAmount.toLocaleString('en-IN')})
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
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : '+ Create Invoice'}
        </button>
      </div>

      {/* Add Invoice Form */}
      {showForm && (
        <form
          onSubmit={handleAddInvoice}
          style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <select
            required
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select Customer *</option>
            {customers.map((c) => (
              <option key={c.id} value={c.company || c.name}>
                {c.company || c.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount (₹) *"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            style={inputStyle}
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={inputStyle}
            title="Issue Date"
          />

          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            style={inputStyle}
            title="Due Date"
          />

          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={inputStyle}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            type="submit"
            style={{
              backgroundColor: '#111827',
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Save Invoice
          </button>
        </form>
      )}

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by Invoice ID or Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: '240px' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: '160px' }}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Invoice ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Issue Date</th>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#111827' }}>{inv.id}</td>
                  <td style={tdStyle}>{inv.customer}</td>
                  <td style={tdStyle}>{inv.date}</td>
                  <td style={tdStyle}>{inv.dueDate}</td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor:
                          inv.status === 'Paid'
                            ? '#dcfce7'
                            : inv.status === 'Overdue'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          inv.status === 'Paid'
                            ? '#166534'
                            : inv.status === 'Overdue'
                            ? '#991b1b'
                            : '#92400e',
                      }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => toggleStatus(inv.id)}
                      style={{
                        color: '#2563eb',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        marginRight: '12px',
                      }}
                    >
                      {inv.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                    </button>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      style={{
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
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