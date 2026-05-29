import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Membership from './pages/Membership';
import Team from './pages/Team';
import LoginChoice from './pages/LoginChoice';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import Dashboard from './pages/Dashboard';
import PaymentGateway from './pages/PaymentGateway';

// Layout wrapper to conditionally render header/footer per route
const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isLoginPage = location.pathname.startsWith('/login');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {!isDashboard && !isLoginPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Front-Facing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/team" element={<Team />} />
              <Route path="/payment" element={<PaymentGateway />} />

              {/* Login / Auth Flow Routes */}
              <Route path="/login" element={<LoginChoice />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              <Route path="/login/staff" element={<StaffLogin />} />

              {/* Protected Route for Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'staff']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback Route redirects to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
