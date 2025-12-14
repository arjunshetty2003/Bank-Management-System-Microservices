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

  const handleClose = async (id) => {
    if (!window.confirm('Are you sure you want to close this account? This action cannot be undone.')) return;
    try {
      await accountApi.delete(id);
      setSuccess('Account closed successfully');
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Close failed. Make sure balance is zero.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const account = accounts.find(a => a.accountId === id);
    const messages = {
      ACTIVE: 'reactivate',
      FROZEN: 'freeze',
      CLOSED: 'close'
    };
    
    // Warn if trying to close account with balance
    if (newStatus === 'CLOSED' && account && account.balance > 0) {
      setError(`Cannot close account with balance of $${account.balance.toFixed(2)}. Please withdraw or transfer funds first.`);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${messages[newStatus]} this account?`)) return;
    try {
      await accountApi.updateStatus(id, newStatus);
      setSuccess(`Account ${messages[newStatus]}d successfully`);
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Status update failed');
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
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.accountId} style={{ opacity: account.status === 'CLOSED' ? 0.5 : 1 }}>
                <td>{account.accountId}</td>
                <td>{account.accountNumber}</td>
                <td>{getCustomerName(account.customerId)}</td>
                <td>{account.accountType}</td>
                <td>${account.balance?.toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    backgroundColor: account.status === 'ACTIVE' ? '#d4edda' : 
                                    account.status === 'FROZEN' ? '#fff3cd' : '#f8d7da',
                    color: account.status === 'ACTIVE' ? '#155724' : 
                           account.status === 'FROZEN' ? '#856404' : '#721c24'
                  }}>
                    {account.status || 'ACTIVE'}
                  </span>
                </td>
                <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  <select
                    value={account.status || 'ACTIVE'}
                    onChange={(e) => handleStatusChange(account.accountId, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginRight: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="FROZEN">Frozen</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  {account.status !== 'CLOSED' && (
                    <button className="btn btn-primary" onClick={() => handleEdit(account)}>
                      Edit
                    </button>
                  )}
                  {account.status === 'CLOSED' && account.closedAt && (
                    <span style={{ color: '#666', fontSize: '0.85em' }}>
                      {new Date(account.closedAt).toLocaleDateString()}
                    </span>
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

export default Accounts;
