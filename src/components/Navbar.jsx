import { useState, useEffect } from "react";
import {
  Container,
  Navbar as BootstrapNavbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [keyword, setKeyword] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const syncAuthAndCart = () => {
    try {
      const savedUser = localStorage.getItem("currentUser");
      setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setCurrentUser(null);
    }

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce(
        (total, item) => total + (Number(item.quantity) || 1),
        0,
      );
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    syncAuthAndCart();

    const handleStorageChange = () => syncAuthAndCart();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);
    window.addEventListener("cartChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
      window.removeEventListener("cartChange", handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    navigate(`/foods?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          FastFood
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="main-navbar" />

        <BootstrapNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Trang chủ
            </Nav.Link>

            <Nav.Link as={Link} to="/foods">
              Món ăn
            </Nav.Link>

            <Nav.Link as={Link} to="/orders">
              Đơn hàng
            </Nav.Link>

            {currentUser && currentUser.role === "admin" && (
              <Nav.Link as={Link} to="/admin" className="text-warning fw-bold">
                Quản trị
              </Nav.Link>
            )}
          </Nav>

          <Form className="d-flex me-lg-3 mb-2 mb-lg-0" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Tìm món ăn..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              aria-label="Tìm món ăn"
            />

            <Button type="submit" variant="outline-light" className="ms-2">
              Tìm
            </Button>
          </Form>

          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/cart" className="me-2">
              Giỏ hàng
              {cartCount > 0 && (
                <Badge pill bg="warning" text="dark" className="ms-1">
                  {cartCount}
                </Badge>
              )}
            </Nav.Link>

            {currentUser ? (
              <NavDropdown
                title={
                  <span>
                    👤 {currentUser.fullName || currentUser.username}
                    {currentUser.role === "admin" && (
                      <Badge bg="danger" className="ms-1">
                        Admin
                      </Badge>
                    )}
                  </span>
                }
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Thông tin cá nhân
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/orders">
                  Lịch sử đơn hàng
                </NavDropdown.Item>

                {currentUser.role === "admin" && (
                  <NavDropdown.Item as={Link} to="/admin">
                    Quản trị hệ thống
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />

                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Đăng nhập
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
