import { useState, useEffect } from 'react';
import { transactionApi, accountApi } from '../api/api';

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [form, setForm] = useState({
    accountId: '',
    amount: '',
    description: '',
    fromAccountId: '',
    toAccountId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const response = await accountApi.getAll();
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to load accounts');
    }
  };

  const loadTransactions = async (accountId) => {
    try {
      const response = await transactionApi.getByAccountId(accountId);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await transactionApi.deposit({
        accountId: parseInt(form.accountId),
        amount: parseFloat(form.amount),
        description: form.description
      });
      setSuccess('Deposit successful');
      resetForm();
      loadAccounts();
      if (selectedAccount) loadTransactions(selectedAccount);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await transactionApi.withdraw({
        accountId: parseInt(form.accountId),
        amount: parseFloat(form.amount),
        description: form.description
      });
      setSuccess('Withdrawal successful');
      resetForm();
      loadAccounts();
      if (selectedAccount) loadTransactions(selectedAccount);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await transactionApi.transfer({
        fromAccountId: parseInt(form.fromAccountId),
        toAccountId: parseInt(form.toAccountId),
        amount: parseFloat(form.amount),
        description: form.description
      });
      setSuccess('Transfer successful');
      resetForm();
      loadAccounts();
      if (selectedAccount) loadTransactions(selectedAccount);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    }
  };

  const resetForm = () => {
    setForm({
      accountId: '',
      amount: '',
      description: '',
      fromAccountId: '',
      toAccountId: ''
    });
  };

  const getAccountDisplay = (accountId) => {
    const account = accounts.find(a => a.accountId === accountId);
    return account ? `${account.accountNumber} ($${account.balance?.toFixed(2)})` : accountId;
  };

  return (
    <div>
      <h1>Transactions</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'deposit' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            Deposit
          </button>
          <button
            className={`btn ${activeTab === 'withdraw' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            Withdraw
          </button>
          <button
            className={`btn ${activeTab === 'transfer' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            Transfer
          </button>
        </div>

        {activeTab === 'deposit' && (
          <form onSubmit={handleDeposit}>
            <div className="form-group">
              <label>Account</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountNumber} - ${account.balance?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success">Deposit</button>
          </form>
        )}

        {activeTab === 'withdraw' && (
          <form onSubmit={handleWithdraw}>
            <div className="form-group">
              <label>Account</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountNumber} - ${account.balance?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-danger">Withdraw</button>
          </form>
        )}

        {activeTab === 'transfer' && (
          <form onSubmit={handleTransfer}>
            <div className="form-group">
              <label>From Account</label>
              <select
                value={form.fromAccountId}
                onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountNumber} - ${account.balance?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To Account</label>
              <select
                value={form.toAccountId}
                onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.accountNumber} - ${account.balance?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Transfer</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Transaction History</h2>
        <div className="form-group">
          <label>Select Account to View Transactions</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">Select Account</option>
            {accounts.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.accountNumber}
              </option>
            ))}
          </select>
        </div>

        {selectedAccount && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transactionId}>
                  <td>{tx.transactionId}</td>
                  <td>{tx.transactionType}</td>
                  <td>{tx.fromAccountId ? getAccountDisplay(tx.fromAccountId) : '-'}</td>
                  <td>{tx.toAccountId ? getAccountDisplay(tx.toAccountId) : '-'}</td>
                  <td>${tx.amount?.toFixed(2)}</td>
                  <td>{tx.description}</td>
                  <td>{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Transactions;
