import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import MyOrdersPage from './pages/MyOrdersPage';
import InvoicePage from './pages/InvoicePage';
import ProfilePage from './pages/ProfilePage';
import RegisterGrossistePage from './pages/RegisterGrossistePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" />;

  return children;
}

function AppContent() {
  const [cart, setCart] = useState([]);
  const [userType, setUserType] = useState('retail');
  const { user } = useAuth();

  // Sync userType with logged in user — useEffect bach ma ydir infinite re-render
  useEffect(() => {
    if (user && user.user_type) setUserType(user.user_type);
  }, [user]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<HomePage cart={cart} setCart={setCart} userType={userType} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-grossiste" element={<RegisterGrossistePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} userType={userType} />} />
        <Route path="/facture/:id" element={
          <ProtectedRoute><InvoicePage /></ProtectedRoute>
        } />
        <Route path="/mes-commandes" element={
          <ProtectedRoute><MyOrdersPage /></ProtectedRoute>
        } />
        <Route path="/profil" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;