import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>FastFood</h5>
            <p>
              Đặt món ăn yêu thích của bạn nhanh chóng, tiện lợi và dễ dàng.
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h5>Liên kết</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white text-decoration-none">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/foods" className="text-white text-decoration-none">
                  Danh sách món ăn
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-white text-decoration-none">
                  Đơn hàng của tôi
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h5>Liên hệ</h5>
            <p>Hotline: 1900 0000</p>
            <p>Email: support@fastfood.com</p>
          </Col>
        </Row>

        <hr className="border-light" />

        <p className="text-center mb-0">
          © {new Date().getFullYear()} FastFood. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
