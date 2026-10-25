import { useState } from "react";
import {
  Container,
  Navbar as BootstrapNavbar,
  Nav,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    navigate(`/foods?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg">
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

          <Nav>
            <Nav.Link as={Link} to="/cart">
              Giỏ hàng
            </Nav.Link>

            <Nav.Link as={Link} to="/login">
              Đăng nhập
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
