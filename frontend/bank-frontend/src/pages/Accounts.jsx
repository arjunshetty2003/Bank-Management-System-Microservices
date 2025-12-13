import { useState, useEffect } from 'react';
import { accountApi, customerApi } from '../api/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customerId: '', accountType: 'SAVINGS', initialBalance: 0 });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAccounts();
    loadCustomers();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to load accounts');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await accountApi.update(editingId, form);
        setSuccess('Account updated successfully');
      } else {
        await accountApi.create(form);
        setSuccess('Account created successfully');
      }
      setForm({ customerId: '', accountType: 'SAVINGS', initialBalance: 0 });
      setEditingId(null);
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (account) => {
    setForm({
      customerId: account.customerId,
      accountType: account.accountType,
      initialBalance: account.balance
    });
    setEditingId(account.accountId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await accountApi.delete(id);
      setSuccess('Account deleted successfully');
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setForm({ customerId: '', accountType: 'SAVINGS', initialBalance: 0 });
    setEditingId(null);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? customer.name : 'Unknown';
  };

  return (
    <div>
      <h1>Account Management</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>{editingId ? 'Edit Account' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              value={form.accountType}
              onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              required
            >
              <option value="SAVINGS">Savings</option>
              <option value="CHECKING">Checking</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>
          {!editingId && (
            <div className="form-group">
              <label>Initial Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.initialBalance}
                onChange={(e) => setForm({ ...form, initialBalance: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}
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
        <h2>Accounts List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Account Number</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.accountId}>
                <td>{account.accountId}</td>
                <td>{account.accountNumber}</td>
                <td>{getCustomerName(account.customerId)}</td>
                <td>{account.accountType}</td>
                <td>${account.balance?.toFixed(2)}</td>
                <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="btn btn-primary" onClick={() => handleEdit(account)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(account.accountId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Accounts;
