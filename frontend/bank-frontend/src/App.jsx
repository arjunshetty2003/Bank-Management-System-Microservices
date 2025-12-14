import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Customers from './pages/Customers';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" />;
  
  return children;
}

function NavBar() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <nav>
      <ul>
        {isAdmin() ? (
          <>
            <li><Link to="/">Customers</Link></li>
            <li><Link to="/accounts">Accounts</Link></li>
            <li><Link to="/transactions">Transactions</Link></li>
          </>
        ) : (
          <li><Link to="/">My Dashboard</Link></li>
        )}
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

function HomePage() {
  const { user } = useAuth();
  
  if (user?.role === 'ADMIN') {
    return <Customers />;
  }
  return <UserDashboard />;
}

function AppContent() {
  return (
    <Router>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/accounts" element={<ProtectedRoute adminOnly><Accounts /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute adminOnly><Transactions /></ProtectedRoute>} />
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
