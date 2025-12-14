import { useState, useEffect } from 'react';
import { accountApi, transactionApi, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState({ amount: '', description: '', toAccountNumber: '', pin: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountType, setNewAccountType] = useState('SAVINGS');

  useEffect(() => {
    if (user?.username) {
      loadMyAccounts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount.accountId);
    }
  }, [selectedAccount]);

  const loadMyAccounts = async () => {
    try {
      const response = await accountApi.getByUsername(user.username);
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0]);
      }
    } catch (err) {
      setError('Failed to load your accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (accountId) => {
    try {
      const response = await transactionApi.getByAccountId(accountId);
      setTransactions(response.data);
    } catch (err) {
      console.error('Failed to load transactions');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await transactionApi.deposit({
        accountId: selectedAccount.accountId,
        amount: parseFloat(form.amount),
        description: form.description || 'Deposit'
      });
      setSuccess('Deposit successful!');
      setForm({ ...form, amount: '', description: '' });
      loadMyAccounts();
      loadTransactions(selectedAccount.accountId);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!form.pin || form.pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    try {
      await transactionApi.withdraw({
        accountId: selectedAccount.accountId,
        amount: parseFloat(form.amount),
        description: form.description || 'Withdrawal',
        username: user.username,
        pin: form.pin
      });
      setSuccess('Withdrawal successful!');
      setForm({ ...form, amount: '', description: '', pin: '' });
      loadMyAccounts();
      loadTransactions(selectedAccount.accountId);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Withdrawal failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.pin || form.pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    try {
      await transactionApi.transferByAccountNumber({
        fromAccountId: selectedAccount.accountId,
        toAccountNumber: form.toAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description || 'Transfer',
        username: user.username,
        pin: form.pin
      });
      setSuccess('Transfer successful!');
      setForm({ amount: '', description: '', toAccountNumber: '', pin: '' });
      loadMyAccounts();
      loadTransactions(selectedAccount.accountId);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Transfer failed');
    }
  };

  if (loading) {
    return <div className="card"><p>Loading...</p></div>;
  }

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Get customer ID first
      const customerRes = await accountApi.getByUsername(user.username);
      if (customerRes.data.length === 0) {
        setError('Customer profile not found');
        return;
      }
      // Use customerId from existing account
      const customerId = customerRes.data[0]?.customerId;
      if (!customerId) {
        setError('Unable to determine customer ID');
        return;
      }
      
      await accountApi.create({
        customerId: customerId,
        accountType: newAccountType,
        initialBalance: 0
      });
      setSuccess('New account opened successfully!');
      setShowNewAccount(false);
      loadMyAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open account');
    }
  };

  if (accounts.length === 0) {
    return (
      <div>
        <h1>Welcome, {user.username}!</h1>
        <div className="card">
          <p>You don't have any accounts yet.</p>
          <button className="btn btn-primary" onClick={() => setShowNewAccount(true)}>
            Open Your First Account
          </button>
          {showNewAccount && (
            <form onSubmit={handleOpenAccount} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Account Type</label>
                <select value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)}>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CHECKING">Checking Account</option>
                  <option value="CURRENT">Current Account</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success">Open Account</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Account Summary */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>My Accounts</h2>
          <button className="btn btn-primary" onClick={() => setShowNewAccount(!showNewAccount)}>
            + Open New Account
          </button>
        </div>
        
        {showNewAccount && (
          <form onSubmit={handleOpenAccount} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div className="form-group">
              <label>Account Type</label>
              <select value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)}>
                <option value="SAVINGS">Savings Account</option>
                <option value="CHECKING">Checking Account</option>
                <option value="CURRENT">Current Account</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success">Open Account</button>
            <button type="button" className="btn" onClick={() => setShowNewAccount(false)} style={{ marginLeft: '10px' }}>Cancel</button>
          </form>
        )}
        
        <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>
          Total Balance: <strong>${totalBalance.toFixed(2)}</strong>
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {accounts.map((account) => (
            <div
              key={account.accountId}
              onClick={() => setSelectedAccount(account)}
              style={{
                padding: '15px',
                border: selectedAccount?.accountId === account.accountId ? '2px solid #007bff' : 
                       account.status === 'FROZEN' ? '2px solid #ffc107' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                minWidth: '200px',
                backgroundColor: selectedAccount?.accountId === account.accountId ? '#f0f7ff' : 
                                account.status === 'FROZEN' ? '#fff3cd' : '#fff',
                opacity: account.status === 'FROZEN' ? 0.8 : 1
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{account.accountType}</span>
                {account.status === 'FROZEN' && (
                  <span style={{ fontSize: '0.7em', backgroundColor: '#ffc107', color: '#000', padding: '2px 6px', borderRadius: '4px' }}>
                    FROZEN
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>{account.accountNumber}</div>
              <div style={{ fontSize: '1.3em', marginTop: '10px' }}>${account.balance?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedAccount && (
        <>
          {/* Quick Actions */}
          <div className="card">
            <h2>Quick Actions - {selectedAccount.accountNumber}</h2>
            
            {selectedAccount.status === 'FROZEN' && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                color: '#856404'
              }}>
                <strong>⚠️ This account is frozen.</strong>
                <p style={{ margin: '5px 0 0 0' }}>All transactions are disabled. Please contact customer support for assistance.</p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                className={`btn ${activeTab === 'overview' ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`btn ${activeTab === 'deposit' ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab('deposit')}
                disabled={selectedAccount.status === 'FROZEN'}
                style={{ opacity: selectedAccount.status === 'FROZEN' ? 0.5 : 1 }}
              >
                Deposit
              </button>
              <button
                className={`btn ${activeTab === 'withdraw' ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab('withdraw')}
                disabled={selectedAccount.status === 'FROZEN'}
                style={{ opacity: selectedAccount.status === 'FROZEN' ? 0.5 : 1 }}
              >
                Withdraw
              </button>
              <button
                className={`btn ${activeTab === 'transfer' ? 'btn-primary' : ''}`}
                onClick={() => setActiveTab('transfer')}
                disabled={selectedAccount.status === 'FROZEN'}
                style={{ opacity: selectedAccount.status === 'FROZEN' ? 0.5 : 1 }}
              >
                Transfer
              </button>
            </div>

            {activeTab === 'deposit' && (
              <form onSubmit={handleDeposit}>
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
                  <label>Amount (Available: ${selectedAccount.balance?.toFixed(2)})</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selectedAccount.balance}
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
                <div className="form-group">
                  <label>Transaction PIN</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
                    placeholder="Enter 4-digit PIN"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger">Withdraw</button>
              </form>
            )}

            {activeTab === 'transfer' && (
              <form onSubmit={handleTransfer}>
                <div className="form-group">
                  <label>To Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter recipient's account number"
                    value={form.toAccountNumber}
                    onChange={(e) => setForm({ ...form, toAccountNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount (Available: ${selectedAccount.balance?.toFixed(2)})</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={selectedAccount.balance}
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
                <div className="form-group">
                  <label>Transaction PIN</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
                    placeholder="Enter 4-digit PIN"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Transfer</button>
              </form>
            )}

            {activeTab === 'overview' && (
              <div>
                <p><strong>Account Number:</strong> {selectedAccount.accountNumber}</p>
                <p><strong>Account Type:</strong> {selectedAccount.accountType}</p>
                <p><strong>Current Balance:</strong> ${selectedAccount.balance?.toFixed(2)}</p>
                <p><strong>Status:</strong> <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                  backgroundColor: '#d4edda',
                  color: '#155724'
                }}>{selectedAccount.status || 'ACTIVE'}</span></p>
                <p><strong>Opened:</strong> {new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
                
                {selectedAccount.balance === 0 && accounts.length > 1 && (
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
                      Want to close this account? Enter your PIN to confirm.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="password"
                        maxLength="4"
                        value={form.pin}
                        onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
                        placeholder="Enter PIN"
                        style={{ width: '120px', padding: '8px' }}
                      />
                      <button 
                        className="btn btn-danger"
                        onClick={async () => {
                          setError('');
                          if (!form.pin || form.pin.length !== 4) {
                            setError('Please enter your 4-digit PIN to close account');
                            return;
                          }
                          try {
                            // Validate PIN first
                            await authApi.validatePin(user.username, form.pin);
                            
                            if (window.confirm('Are you sure you want to close this account? This cannot be undone.')) {
                              await accountApi.delete(selectedAccount.accountId);
                              setSuccess('Account closed successfully');
                              setForm({ ...form, pin: '' });
                              loadMyAccounts();
                              setSelectedAccount(null);
                            }
                          } catch (err) {
                            console.error('Close account error:', err);
                            setError(err.response?.data || err.message || 'Invalid PIN');
                          }
                        }}
                      >
                        Close Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="card">
            <h2>Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.transactionId}>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                      <td>
                        <span style={{
                          color: tx.transactionType === 'DEPOSIT' ? 'green' : 
                                 tx.transactionType === 'WITHDRAW' ? 'red' : '#007bff'
                        }}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td style={{
                        color: tx.transactionType === 'DEPOSIT' || 
                               (tx.transactionType === 'TRANSFER' && tx.toAccountId === selectedAccount.accountId)
                               ? 'green' : 'red'
                      }}>
                        {tx.transactionType === 'DEPOSIT' || 
                         (tx.transactionType === 'TRANSFER' && tx.toAccountId === selectedAccount.accountId)
                         ? '+' : '-'}${tx.amount?.toFixed(2)}
                      </td>
                      <td>{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserDashboard;
