import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function NavBar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav>
      <ul>
        <li><Link to="/">Customers</Link></li>
        <li><Link to="/accounts">Accounts</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li style={{ marginLeft: 'auto' }}>
          <span style={{ marginRight: '15px' }}>
            {user.username} ({user.role})
          </span>
          <button onClick={logout} className="btn" style={{ padding: '5px 10px' }}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

function AppContent() {
  return (
    <Router>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
