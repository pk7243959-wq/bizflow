import { useState, useEffect } from 'react';

const initialCustomers = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav@sharmatraders.in', phone: '+91 98480 11223', company: 'Sharma Traders', status: 'Active', balance: 45000 },
  { id: '2', name: 'Priya Reddy', email: 'priya@deccanlogistics.com', phone: '+91 98490 33445', company: 'Deccan Logistics', status: 'Active', balance: 12500 },
  { id: '3', name: 'Vikram Patel', email: 'vikram@patelenterprises.in', phone: '+91 97010 55667', company: 'Patel Enterprises', status: 'Inactive', balance: 0 },
];

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('bizflow_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    balance: '',
  });

  useEffect(() => {
    localStorage.setItem('bizflow_customers', JSON.stringify(customers));
  }, [customers]);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newCustomer = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      company: formData.company || 'Individual',
      status: formData.status,
      balance: Number(formData.balance) || 0,
    };

    setCustomers([newCustomer, ...customers]);
    setFormData({ name: '', email: '', phone: '', company: '', status: 'Active', balance: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.company.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Customers</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Manage client details and track outstanding balances (INR)
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
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {/* Add Customer Form */}
      {showForm && (
        <form
          onSubmit={handleAddCustomer}
          style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <input
            type="text"
            placeholder="Full Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email Address *"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            style={inputStyle}
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={inputStyle}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input
            type="number"
            placeholder="Opening Balance (₹)"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            style={inputStyle}
          />
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
            Save Customer
          </button>
        </form>
      )}

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, company, or email..."
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Balance</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600', color: '#111827' }}>{customer.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{customer.email}</div>
                  </td>
                  <td style={tdStyle}>{customer.company}</td>
                  <td style={tdStyle}>{customer.phone}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: customer.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                        color: customer.status === 'Active' ? '#166534' : '#4b5563',
                      }}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>
                    ₹{customer.balance.toLocaleString('en-IN')}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDelete(customer.id)}
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