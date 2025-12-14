import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Auth details
    username: '',
    password: '',
    confirmPassword: '',
    // Personal details
    name: '',
    email: '',
    phone: '',
    address: '',
    // Account preferences
    accountType: 'SAVINGS',
    initialDeposit: '',
    transactionPin: '',
    confirmPin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateStep1 = () => {
    if (!form.username || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      setError('All fields are required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.transactionPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (form.transactionPin !== form.confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.registerFull({
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        accountType: form.accountType,
        initialDeposit: parseFloat(form.initialDeposit) || 0,
        transactionPin: form.transactionPin
      });
      login(response.data);
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      setError(typeof errorMsg === 'string' ? errorMsg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto' }}>
      <div className="card">
        <h1>Open Bank Account</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
          <span style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: step >= 1 ? '#007bff' : '#ddd', color: step >= 1 ? '#fff' : '#666' }}>1. Login</span>
          <span style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: step >= 2 ? '#007bff' : '#ddd', color: step >= 2 ? '#fff' : '#666' }}>2. Personal</span>
          <span style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: step >= 3 ? '#007bff' : '#ddd', color: step >= 3 ? '#fff' : '#666' }}>3. Account</span>
        </div>
        
        {error && <div className="error">{error}</div>}

        {step === 1 && (
          <div>
            <h2>Login Credentials</h2>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Choose a username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Personal Information</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter your address"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn" onClick={prevStep}>Back</button>
              <button type="button" className="btn btn-primary" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h2>Account Setup</h2>
            <div className="form-group">
              <label>Account Type</label>
              <select
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CHECKING">Checking Account</option>
                <option value="CURRENT">Current Account</option>
              </select>
            </div>
            <div className="form-group">
              <label>Initial Deposit (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.initialDeposit}
                onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })}
                placeholder="Enter initial deposit amount"
              />
            </div>
            <div className="form-group">
              <label>Transaction PIN (4 digits)</label>
              <input
                type="password"
                maxLength="4"
                value={form.transactionPin}
                onChange={(e) => setForm({ ...form, transactionPin: e.target.value.replace(/\D/g, '') })}
                placeholder="Create a 4-digit PIN"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm PIN</label>
              <input
                type="password"
                maxLength="4"
                value={form.confirmPin}
                onChange={(e) => setForm({ ...form, confirmPin: e.target.value.replace(/\D/g, '') })}
                placeholder="Confirm your PIN"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn" onClick={prevStep}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Open Account'}
              </button>
            </div>
          </form>
        )}
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
