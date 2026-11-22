import { useState, useEffect } from 'react';

const initialExpenses = [
  { id: 'EXP-5001', title: 'Office Rent', category: 'Rent', amount: 35000, date: '2026-11-01', status: 'Paid', vendor: 'ABC Realty' },
  { id: 'EXP-5002', title: 'High-Speed Internet', category: 'Utilities', amount: 1800, date: '2026-11-05', status: 'Paid', vendor: 'NetFast Corp' },
  { id: 'EXP-5003', title: 'Cloud Server Hosting', category: 'Software', amount: 8500, date: '2026-11-25', status: 'Unpaid', vendor: 'CloudScale' }
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('bizflow_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Software',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Unpaid',
    vendor: ''
  });

  useEffect(() => {
    localStorage.setItem('bizflow_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newExpense = {
      id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      status: formData.status,
      vendor: formData.vendor || 'N/A'
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({
      title: '',
      category: 'Software',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Unpaid',
      vendor: ''
    });
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, status: exp.status === 'Paid' ? 'Unpaid' : 'Paid' } : exp
    ));
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) || 
                          exp.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || exp.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Expenses</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Track operational outflows (Total Filtered: ₹{totalExpense.toLocaleString('en-IN')})
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#16a34a', color: '#fff', border: 'none',
            padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddExpense} style={{
          backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px',
          border: '1px solid #e5e7eb', marginBottom: '24px', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'
        }}>
          <input type="text" placeholder="Expense Title *" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
          <input type="text" placeholder="Vendor / Payee" value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} style={inputStyle} />
          <input type="number" placeholder="Amount (₹) *" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={inputStyle} />
          
          <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
            {['Rent', 'Salaries', 'Utilities', 'Marketing', 'Travel', 'Supplies', 'Software', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />

          <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>

          <button type="submit" style={{
            backgroundColor: '#111827', color: '#fff', border: 'none', padding: '10px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', gridColumn: '1 / -1'
          }}>
            Save Expense
          </button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search title or vendor..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={inputStyle}>
          <option value="All">All Categories</option>
          {['Rent', 'Salaries', 'Utilities', 'Marketing', 'Travel', 'Supplies', 'Software', 'Other'].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Expense</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No expenses found.</td></tr>
            ) : (
              filteredExpenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#111827' }}>{exp.title}</td>
                  <td style={tdStyle}>{exp.category}</td>
                  <td style={tdStyle}>{exp.vendor}</td>
                  <td style={tdStyle}>{exp.date}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500',
                      backgroundColor: exp.status === 'Paid' ? '#dcfce7' : '#fee2e2',
                      color: exp.status === 'Paid' ? '#166534' : '#991b1b'
                    }}>
                      {exp.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600', color: '#dc2626' }}>-₹{exp.amount.toLocaleString('en-IN')}</td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleStatus(exp.id)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', marginRight: '12px' }}>
                      {exp.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                    <button onClick={() => handleDelete(exp.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
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

const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' };
const thStyle = { padding: '12px 16px', fontWeight: '600' };
const tdStyle = { padding: '12px 16px', color: '#374151' };