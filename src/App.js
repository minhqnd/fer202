import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages - Member 1 (Thực đơn & Khám phá món ăn & Đánh giá)
import Home from './pages/Home';
import Menu from './pages/Menu';
import FoodDetail from './pages/FoodDetail';

// Pages - Member 2 (Giỏ hàng, Đặt món, Mã giảm giá & Lịch sử đơn)
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

// Pages - Member 3 (Đăng nhập, Quản trị Admin, CRUD món & Quản lý đơn)
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFoods from './pages/admin/AdminFoods';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100 bg-light">
            <Header />

            <main className="flex-grow-1">
              <Routes>
                {/* Public & Customer Routes - Thành viên 1 & 2 */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/foods/:id" element={<FoodDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrderHistory />} />

                {/* Auth & User Profile - Thành viên 3 */}
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Protected Routes - Thành viên 3 */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/foods" element={<AdminFoods />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                </Route>

                {/* Fallback 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
