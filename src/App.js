import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import FoodList from "./components/FoodList";
import FoodDetail from "./components/FoodDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Admin from "./components/Admin";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="min-vh-100">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/foods" element={<FoodList />} />
          <Route path="/foods/:id" element={<FoodDetail />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/orders" element={<MyOrders />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/admin" element={<Admin />} />

          <Route
            path="*"
            element={
              <div className="container py-5 text-center">
                <h2>404 - Không tìm thấy trang</h2>
                <p>Đường dẫn bạn truy cập không tồn tại.</p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
