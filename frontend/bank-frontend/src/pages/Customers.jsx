import { useState, useEffect } from 'react';
import { customerApi } from '../api/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ username: '', name: '', email: '', phone: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to load customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await customerApi.update(editingId, form);
        setSuccess('Customer updated successfully');
      } else {
        await customerApi.create(form);
        setSuccess('Customer created successfully');
      }
      setForm({ username: '', name: '', email: '', phone: '', address: '' });
      setEditingId(null);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setForm({
      username: customer.username || '',
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setEditingId(customer.customerId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this customer?')) return;
    try {
      await customerApi.delete(id);
      setSuccess('Customer deactivated successfully');
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Deactivation failed');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const messages = { ACTIVE: 'activate', INACTIVE: 'deactivate', SUSPENDED: 'suspend' };
    if (!window.confirm(`Are you sure you want to ${messages[newStatus]} this customer?`)) return;
    try {
      await customerApi.updateStatus(id, newStatus);
      setSuccess(`Customer ${messages[newStatus]}d successfully`);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleCancel = () => {
    setForm({ username: '', name: '', email: '', phone: '', address: '' });
    setEditingId(null);
  };

  return (
    <div>
      <h1>Customer Management</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>{editingId ? 'Edit Customer' : 'Add Customer'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username (Login Account)</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Link to registered user (optional)"
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h2>Customers List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customerId} style={{ opacity: customer.status === 'INACTIVE' ? 0.5 : 1 }}>
                <td>{customer.customerId}</td>
                <td>{customer.username || '-'}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    backgroundColor: customer.status === 'ACTIVE' ? '#d4edda' : 
                                    customer.status === 'SUSPENDED' ? '#fff3cd' : '#f8d7da',
                    color: customer.status === 'ACTIVE' ? '#155724' : 
                           customer.status === 'SUSPENDED' ? '#856404' : '#721c24'
                  }}>
                    {customer.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="actions">
                  <select
                    value={customer.status || 'ACTIVE'}
                    onChange={(e) => handleStatusChange(customer.customerId, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', marginRight: '8px' }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {customer.status !== 'INACTIVE' && (
                    <button className="btn btn-primary" onClick={() => handleEdit(customer)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
