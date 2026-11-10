import React from 'react';
import { Navbar, Nav, Container, Badge, Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { totalItemCount } = useCart();
  const { currentUser, isAdmin, availableUsers, loginUser, logout } = useAuth();

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="border-bottom py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-danger">
          FASTFOOD
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto mb-2 mb-lg-0">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/menu">Thực đơn</Nav.Link>
            {currentUser && (
              <Nav.Link as={Link} to="/orders">Đơn hàng của tôi</Nav.Link>
            )}
            {isAdmin && (
              <Dropdown className="d-inline-block align-self-center">
                <Dropdown.Toggle variant="light" size="sm" className="fw-semibold text-danger border-0">
                  Quản trị
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin">Báo cáo tổng quan</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/foods">Quản lý món ăn</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/orders">Quản lý đơn hàng</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>

          <Nav className="align-items-center gap-2">
            {/* Cart Button */}
            <Button
              as={Link}
              to="/cart"
              variant="outline-danger"
              size="sm"
              className="position-relative me-2 px-3"
            >
              Giỏ hàng
              {totalItemCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {totalItemCount}
                </Badge>
              )}
            </Button>

            {/* User Dropdown */}
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" size="sm" className="d-flex align-items-center border px-2 py-1">
                  <div className="text-start me-1">
                    <span className="fw-semibold small">{currentUser.fullName}</span>
                    <span className="text-muted ms-1 small">
                      ({currentUser.role === 'admin' ? 'Admin' : 'Khách hàng'})
                    </span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border">
                  <Dropdown.Header>Tài khoản: {currentUser.username}</Dropdown.Header>
                  <Dropdown.Item as={Link} to="/profile">Thông tin tài khoản</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">Lịch sử đơn hàng</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Header className="text-muted small">Chuyển tài khoản thử nghiệm:</Dropdown.Header>
                  {availableUsers.map((user) => (
                    <Dropdown.Item
                      key={user.id}
                      active={user.id === currentUser.id}
                      onClick={() => loginUser(user)}
                    >
                      {user.fullName} ({user.role})
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button as={Link} to="/login" variant="danger" size="sm" className="px-3">
                Đăng nhập
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
